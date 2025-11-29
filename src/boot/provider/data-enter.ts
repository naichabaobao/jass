import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const v8 = require('v8');

import { Options } from './options';
import { GlobalContext, parse } from '../jass/parser-vjass';
import { debounceTime, Subject } from '../../extern/rxjs';
import { find_error } from './diagnostic-provider';
import { 
	change_document_difinition, 
	delete_document_difinition, 
	init_document_difinition, 
	rename_document_difinition 
} from './definition-provider-ex';



/**
 * 全局上下文提供者类
 * 管理全局变量和程序上下文
 */
class GlobalContextProvider {
	private readonly globals: Map<string, any> = new Map();

	constructor() {
		this.initializeGlobals();
	}

	/**
	 * 初始化全局上下文
	 */
	private initializeGlobals(): void {
		GlobalContext.keys.forEach(key => {
			const program = GlobalContext.get(key);
			if (program) {
				this.globals.set(key, program);
			}
		});
	}

	/**
	 * 获取全局变量
	 */
	public getGlobal(key: string): any {
		return this.globals.get(key);
	}

	/**
	 * 获取所有全局变量
	 */
	public getAllGlobals(): any[] {
		return Array.from(this.globals.values());
	}

	/**
	 * 添加全局变量
	 */
	public addGlobal(key: string, value: any): void {
		this.globals.set(key, value);
	}

	/**
	 * 移除全局变量
	 */
	public removeGlobal(key: string): void {
		this.globals.delete(key);
	}

	/**
	 * 清空所有全局变量
	 */
	public clearGlobals(): void {
		this.globals.clear();
	}
}

// 创建单例实例
export const globalContextProvider = new GlobalContextProvider();

/**
 * 获取 JASS 配置文件路径
 */
export function getJassConfigPath(): string {
	const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "/";
	return path.resolve(workspacePath, "jass.config.json");
}

/**
 * 获取排除路径列表
 */
export function getExcludePaths(): string[] {
	const configPath = getJassConfigPath();
	const excludePaths: string[] = [];
	
	if (fs.existsSync(configPath)) {
		try {
			const configContent = fs.readFileSync(configPath, { encoding: "utf-8" });
			const configJson = JSON.parse(configContent);
			const excludes = configJson["excludes"];
			
			if (Array.isArray(excludes)) {
				excludes.forEach((excludePath: any) => {
					if (typeof excludePath === "string") {
						if (path.isAbsolute(excludePath)) {
							excludePaths.push(excludePath);
						} else {
							excludePaths.push(path.resolve(path.parse(configPath).dir, excludePath));
						}
					}
				});
			}
		} catch (error) {
			console.warn(`Failed to parse jass.config.json: ${error}`);
		}
	}

	return excludePaths;
}

// 全局排除路径缓存
let globalExcludePaths = getExcludePaths();

// 监听配置变化
vscode.workspace.onDidChangeConfiguration(() => {
	globalExcludePaths = getExcludePaths();
	
	// 从全局上下文中删除排除的文件
	globalExcludePaths.forEach(filePath => {
		GlobalContext.delete(filePath);
	});
});


/**
 * 检查路径是否不在排除列表中
 */
function isNotInExcludes(filePath: string): boolean {
	const comparePath = (path1: string, path2: string): boolean => {
		const parsed1 = path.parse(path1);
		const parsed2 = path.parse(path2);
		return parsed1.dir === parsed2.dir && parsed1.base === parsed2.base;
	};

	return globalExcludePaths.findIndex(excludePath => 
		comparePath(excludePath, filePath)
	) === -1;
}

/**
 * 获取包含路径列表（排除被排除的路径）
 */
export function getIncludePaths(): string[] {
	return Options.workspaces.filter(workspacePath => 
		isNotInExcludes(workspacePath)
	);
}


/**
 * 文档更新载荷
 */
interface DocumentUpdatePayload {
	key: string;
	content: string;
}

/**
 * 文件类型枚举
 */
enum FileType {
	STATIC = 'static',
	WORKSPACE = 'workspace'
}

/**
 * 文件状态管理类
 */
class FileStatusManager {
	private readonly staticFiles: Set<string> = new Set();
	private readonly workspaceFiles: Set<string> = new Set();

	/**
	 * 标记文件为静态文件（不可变）
	 */
	public markAsStatic(filePath: string): void {
		this.staticFiles.add(filePath);
	}

	/**
	 * 标记文件为工作区文件（可变）
	 */
	public markAsWorkspace(filePath: string): void {
		this.workspaceFiles.add(filePath);
	}

	/**
	 * 检查文件是否为静态文件
	 */
	public isStaticFile(filePath: string): boolean {
		return this.staticFiles.has(filePath);
	}

	/**
	 * 检查文件是否为工作区文件
	 */
	public isWorkspaceFile(filePath: string): boolean {
		return this.workspaceFiles.has(filePath);
	}

	/**
	 * 获取文件类型
	 */
	public getFileType(filePath: string): FileType | null {
		if (this.isStaticFile(filePath)) {
			return FileType.STATIC;
		}
		if (this.isWorkspaceFile(filePath)) {
			return FileType.WORKSPACE;
		}
		return null;
	}

	/**
	 * 移除文件状态
	 */
	public removeFile(filePath: string): void {
		this.staticFiles.delete(filePath);
		this.workspaceFiles.delete(filePath);
	}
}

// 文件状态管理器实例
const fileStatusManager = new FileStatusManager();

// 文档更新订阅映射，每个文档都有独立的 RxJS Subject
const documentUpdateMap = new Map<string, Subject<DocumentUpdatePayload>>();

/**
 * 计算防抖延迟时间
 */
function calculateDebounceDelay(lineCount: number): number {
	if (lineCount <= 100) return 100;
	if (lineCount <= 1000) return 300;
	if (lineCount <= 6000) return 1000;
	return 2000;
}

/**
 * 处理文档更新
 */
function handleDocumentUpdate(filePath: string, content: string, document: vscode.TextDocument): void {
	// 检查文件类型，静态文件不进行更新
	if (fileStatusManager.isStaticFile(filePath)) {
		console.log(`📁 Static file ${path.basename(filePath)} - skipping update`);
		return;
	}

	console.log(`🔄 Updating workspace file: ${path.basename(filePath)}`);
	
	// 解析文档内容
	parse(filePath, content);

	// 查找错误
	find_error(document);
	change_document_difinition(document);
}

// 监听文档内容变化
vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
	const filePath = event.document.uri.fsPath;
	
	// 如果文档还没有订阅，创建一个新的 Subject
	if (!documentUpdateMap.has(filePath)) {
		const subject = new Subject<DocumentUpdatePayload>();
		const delayTime = calculateDebounceDelay(event.document.lineCount);
		
		subject.pipe(debounceTime(delayTime)).subscribe((data: DocumentUpdatePayload) => {
			handleDocumentUpdate(data.key, data.content, event.document);
		});
		
		documentUpdateMap.set(filePath, subject);
	}
	
	// 发送更新事件
	documentUpdateMap.get(filePath)?.next({
		key: filePath,
		content: event.document.getText()
	});
});

// 监听文档保存事件
vscode.workspace.onDidSaveTextDocument((document) => {
	const filePath = document.uri.fsPath;
	if (isNotInExcludes(filePath)) {
		console.log(`💾 Document saved: ${path.basename(filePath)}`);
		// 保存事件可以在这里添加额外逻辑
	}
});

// 监听文件删除事件
vscode.workspace.onDidDeleteFiles((event) => {
	event.files.forEach(uri => {
		const filePath = uri.fsPath;
		console.log(`🗑️ File deleted: ${path.basename(filePath)}`);
		
		// 从全局上下文删除
		GlobalContext.delete(filePath);
		

		delete_document_difinition(filePath);

		// 清理文件状态
		fileStatusManager.removeFile(filePath);

		// 完成并删除订阅
		documentUpdateMap.get(filePath)?.complete();
		documentUpdateMap.delete(filePath);
	});
});

// 监听文件重命名事件
vscode.workspace.onDidRenameFiles((event) => {
	event.files.forEach((uri) => {
		const oldPath = uri.oldUri.fsPath;
		const newPath = uri.newUri.fsPath;
		
		console.log(`📝 File renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
		
		// 从全局上下文删除旧路径
		GlobalContext.delete(oldPath);
		
		// 解析新路径
		parse(newPath);



		rename_document_difinition(oldPath, newPath);

		// 更新文件状态
		const fileType = fileStatusManager.getFileType(oldPath);
		fileStatusManager.removeFile(oldPath);
		if (fileType === FileType.STATIC) {
			fileStatusManager.markAsStatic(newPath);
		} else if (fileType === FileType.WORKSPACE) {
			fileStatusManager.markAsWorkspace(newPath);
		}

		// 更新订阅映射
		if (documentUpdateMap.has(oldPath)) {
			documentUpdateMap.set(newPath, documentUpdateMap.get(oldPath)!);
			documentUpdateMap.delete(oldPath);
		}
	});
});

// 监听文档打开事件
vscode.workspace.onDidOpenTextDocument((document) => {
	const filePath = document.uri.fsPath;
	console.log(`📖 Document opened: ${path.basename(filePath)}`);
	// 可以在这里添加文档打开时的逻辑
});

/**
 * 格式化字节数为可读格式
 */
function formatBytes(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB'];
	let size = bytes;
	let unitIndex = 0;
	
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	
	return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 打印内存统计信息
 */
function printMemoryStatistics(stage: string): void {
	const heapStats = v8.getHeapStatistics();
	
	console.log(`\n📊 Memory Statistics - ${stage}`);
	console.log(`┌─────────────────────────────────────────┐`);
	console.log(`│ Total Available: ${formatBytes(heapStats.total_available_size).padStart(12)} │`);
	console.log(`│ Total Heap Size: ${formatBytes(heapStats.total_heap_size).padStart(12)} │`);
	console.log(`│ Used Heap Size:  ${formatBytes(heapStats.used_heap_size).padStart(12)} │`);
	console.log(`│ Heap Size Limit: ${formatBytes(heapStats.heap_size_limit).padStart(12)} │`);
	console.log(`└─────────────────────────────────────────┘`);
}

/**
 * 检查文件是否为支持的 JASS 文件
 */
function isJassFile(filePath: string): boolean {
	const ext = path.extname(filePath).toLowerCase();
	return ['.j', '.jass', '.ai'].includes(ext);
}

/**
 * 初始化静态文件（不可变，只编译一次）
 */
function initializeStaticFiles(): void {
	console.log(`\n🏗️  Initializing Static Files (Immutable)`);
	console.log(`┌─────────────────────────────────────────┐`);
	
	let staticFileCount = 0;
	
	Options.staticPaths.forEach(filePath => {
		if (isJassFile(filePath)) {
			console.log(`│ 📁 ${path.basename(filePath).padEnd(35)} │`);
			
			// 解析文件
			parse(filePath);
			
			init_document_difinition(filePath);
			
			// 标记为静态文件
			fileStatusManager.markAsStatic(filePath);
			
			staticFileCount++;
		}
	});
	
	console.log(`└─────────────────────────────────────────┘`);
	console.log(`✅ Static files initialized: ${staticFileCount}`);
}

/**
 * 初始化工作区文件（可变，改变后更新）
 */
function initializeWorkspaceFiles(): void {
	console.log(`\n🔄 Initializing Workspace Files (Mutable)`);
	console.log(`┌─────────────────────────────────────────┐`);
	
	let workspaceFileCount = 0;
	
	getIncludePaths().forEach(filePath => {
		if (isJassFile(filePath)) {
			console.log(`│ 📝 ${path.basename(filePath).padEnd(35)} │`);
			
			// 解析文件
			parse(filePath);
			
			// 查找错误
			find_error(filePath);
			

			init_document_difinition(filePath);
			
			// 标记为工作区文件
			fileStatusManager.markAsWorkspace(filePath);
			
			workspaceFileCount++;
		}
	});
	
	console.log(`└─────────────────────────────────────────┘`);
	console.log(`✅ Workspace files initialized: ${workspaceFileCount}`);
}

/**
 * 主初始化函数
 */
function initializeApplication(): void {
	console.log(`\n🚀 JASS Language Server Starting...`);
	console.log(`═══════════════════════════════════════════`);
	
	// 打印初始内存状态
	printMemoryStatistics("Initial");
	
	const startTime = Date.now();
	
	// 初始化静态文件
	initializeStaticFiles();
	
	// 初始化工作区文件
	initializeWorkspaceFiles();
	
	const endTime = Date.now();
	const duration = endTime - startTime;
	
	// 打印最终内存状态
	printMemoryStatistics("After Initialization");
	
	console.log(`\n⏱️  Initialization completed in ${duration}ms`);
	console.log(`═══════════════════════════════════════════`);
}

// 执行初始化
initializeApplication();


