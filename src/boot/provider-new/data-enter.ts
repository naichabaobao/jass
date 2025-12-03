import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Parser } from '../vjass/parser';
import { BlockStatement } from '../vjass/vjass-ast';
import { Subject, debounceTime } from '../../extern/rxjs';
import { TextMacroCollector } from '../vjass/text-macro-collector';
import { TextMacroExpander } from '../vjass/text-macro-expander';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { streamingParse } from './streaming-parsing';
import { CompletionCache } from './completion-cache';
import { CompletionExtractor } from './completion-extractor';
import { ErrorCollection } from '../vjass/simple-error';
import { InnerZincParser } from '../vjass/inner-zinc-parser';
import { ZincProgram } from '../vjass/zinc-ast';

/**
 * 文件事件类型
 */
type FileEventType = 'create' | 'update' | 'delete' | 'rename';

/**
 * 文件事件负载
 */
interface FileEventPayload {
    type: FileEventType;
    filePath: string;
    oldPath?: string; // 用于重命名事件
    content?: string; // 用于更新事件
}

/**
 * 文件缓存项
 */
interface FileCacheItem {
    blockStatement: BlockStatement | null;
    /** Zinc 程序 AST（仅用于 .zn 文件） */
    zincProgram?: ZincProgram | null;
    lastModified: number;
    version: number;
    /** 是否为不可变文件（静态文件） */
    isImmutable: boolean;
    /** 文件原始内容（用于提取注释） */
    content: string;
    /** 解析错误集合 */
    errors?: ErrorCollection;
}

/**
 * 配置选项
 */
interface DataEnterOptions {
    /** 是否忽略配置检查 */
    ignoreConfig?: boolean;
    /** 防抖延迟时间（毫秒） */
    debounceDelay?: number;
    /** 是否启用文件监听 */
    enableFileWatcher?: boolean;
}

/**
 * 标准库文件解析顺序
 */
const STANDARD_LIBRARY_ORDER = ['common.j', 'common.ai', 'blizzard.j'];

/**
 * 需要忽略的文件名（不处理，但需要监听变化）
 */
const IGNORED_FILES = ['numbers.jass', 'presets.jass', 'strings.jass'];

/**
 * 检查是否是特殊文件（需要由 SpecialFileManager 处理）
 */
function isSpecialFile(filePath: string): boolean {
    const fileName = path.basename(filePath).toLowerCase();
    return IGNORED_FILES.includes(fileName);
}

/**
 * 文件路径到 BlockStatement 的映射管理器
 * 使用 RxJS 实现优雅的事件驱动和延迟策略
 */
export class DataEnterManager {
    private readonly cache: Map<string, FileCacheItem> = new Map();
    private readonly fileEventSubject: Subject<FileEventPayload> = new Subject();
    private readonly parserCache: Map<string, Parser> = new Map();
    private readonly immutableFiles: Set<string> = new Set(); // 不可变文件集合
    private options: DataEnterOptions;
    private fileWatcher?: vscode.FileSystemWatcher;
    private disposables: vscode.Disposable[] = [];
    private workspaceRoot?: string;
    
    // TextMacro 相关组件
    private readonly textMacroCollector: TextMacroCollector;
    private readonly textMacroExpander: TextMacroExpander;
    private readonly textMacroRegistry: TextMacroRegistry;

    constructor(options: DataEnterOptions = {}) {
        this.options = {
            ignoreConfig: options.ignoreConfig ?? false,
            debounceDelay: options.debounceDelay ?? 300,
            enableFileWatcher: options.enableFileWatcher ?? true,
            ...options
        };

        // 获取工作区根目录
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        this.workspaceRoot = workspaceFolder?.uri.fsPath;

        // 初始化 TextMacro 组件
        this.textMacroRegistry = TextMacroRegistry.getInstance();
        this.textMacroCollector = new TextMacroCollector(this.textMacroRegistry);
        this.textMacroExpander = new TextMacroExpander(this.textMacroRegistry);

        // 不在这里设置监听器，监听器在 initializeWorkspace 中设置
    }

    /**
     * 处理文件事件
     */
    private async processFileEvent(event: FileEventPayload): Promise<{ success: boolean; event: FileEventPayload; error?: string }> {
        try {
            switch (event.type) {
                case 'create':
                case 'update':
                    await this.handleFileUpdate(event.filePath, event.content);
                    break;
                case 'delete':
                    this.handleFileDelete(event.filePath);
                    break;
                case 'rename':
                    if (event.oldPath) {
                        await this.handleFileRename(event.oldPath, event.filePath);
                    }
                    break;
            }
            return { success: true, event };
        } catch (error) {
            return { 
                success: false, 
                event, 
                error: error instanceof Error ? error.message : String(error) 
            };
        }
    }

    /**
     * 处理文件创建
     */
    private handleFileCreate(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'create');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 静态文件不监听创建事件
        if (this.isImmutableFile(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        this.fileEventSubject.next({
            type: 'create',
            filePath
        });
    }

    /**
     * 处理文件更新
     */
    private async handleFileUpdate(filePath: string, content?: string): Promise<void> {
        const isImmutable = this.isImmutableFile(filePath);
        
        // 如果是不可变文件且已缓存，直接返回（不更新）
        if (isImmutable && this.cache.has(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        // 如果没有提供内容，从文件系统读取
        if (!content) {
            try {
                content = fs.readFileSync(filePath, 'utf-8');
            } catch (error) {
                console.error(`Failed to read file ${filePath}:`, error);
                return;
            }
        }

        const ext = path.extname(filePath).toLowerCase();
        const isZinc = ext === '.zn';
        
        let blockStatement: BlockStatement | null = null;
        let zincProgram: ZincProgram | null = null;
        let errors: ErrorCollection = { errors: [], warnings: [], checkValidationErrors: [] };

        if (isZinc) {
            // 对于 Zinc 文件，使用 InnerZincParser
            // 注意：Zinc 文件不支持 textmacro，所以跳过 textmacro 收集
            const zincParser = new InnerZincParser(content, filePath);
            const statements = zincParser.parse();
            zincProgram = new ZincProgram(statements);
            // 使用 InnerZincParser 的错误收集
            errors = zincParser.errors;
        } else {
            // 对于非 Zinc 文件，使用原有的流程
            // 1. 先更新 textmacro 注册表（收集阶段）
            const collection = { errors: [], warnings: [] };
            this.textMacroCollector.collectFromFile(filePath, content, collection);
            
            // 报告收集阶段的错误和警告
            if (collection.errors.length > 0 || collection.warnings.length > 0) {
                console.warn(`TextMacro collection issues in ${path.basename(filePath)}:`, {
                    errors: collection.errors.length,
                    warnings: collection.warnings.length
                });
            }

            // 2. 解析文件内容为 BlockStatement（解析阶段，此时可以使用 textmacro）
            const result = streamingParse(content, {
                filePath,
                deleteLineComment: false, // 保留行注释
                textMacroExpander: this.textMacroExpander
            });
            
            blockStatement = result.blockStatement;
            errors = result.errors;
        }
        
        // 存储到缓存
        if (blockStatement || zincProgram) {
            const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { mtimeMs: Date.now() };
            const cacheItem = this.cache.get(filePath);
            this.cache.set(filePath, {
                blockStatement: blockStatement || null,
                zincProgram: zincProgram || undefined,
                lastModified: stats.mtimeMs,
                version: (cacheItem?.version || 0) + 1,
                isImmutable,
                content, // 存储原始内容用于提取注释
                errors: errors // 存储错误信息
            });

            // 如果是不可变文件，添加到集合中
            if (isImmutable) {
                this.immutableFiles.add(filePath);
            }

            // 3. 更新补全项缓存（异步，不阻塞）
            // 只对非 Zinc 文件更新补全缓存（Zinc 文件由 ZincCompletionProvider 处理）
            if (blockStatement) {
                this.updateCompletionCache(filePath, blockStatement);
            }
        }
    }

    /**
     * 处理文件变化（VSCode 文档变化）
     */
    private handleFileChange(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'update');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 静态文件不监听变化
        if (this.isImmutableFile(filePath)) {
            return;
        }

        if (this.shouldIgnoreFile(filePath)) {
            return;
        }

        // 从 VSCode 文档获取内容
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
        if (document) {
            this.fileEventSubject.next({
                type: 'update',
                filePath,
                content: document.getText()
            });
        }
    }

    /**
     * 处理文件删除
     */
    private handleFileDelete(filePath: string): void {
        // 如果是特殊文件，即使是在 static 目录下，也要通知 SpecialFileManager
        if (isSpecialFile(filePath)) {
            this.notifySpecialFileManager(filePath, 'delete');
            // 特殊文件不进行 AST 解析，直接返回
            return;
        }

        // 从 textmacro 注册表中移除该文件的宏
        this.textMacroRegistry.unregisterFile(filePath);
        
        this.cache.delete(filePath);
        this.parserCache.delete(filePath);
        
        // 从补全项缓存中删除
        const completionCache = CompletionCache.getInstance();
        completionCache.delete(filePath);
        
        console.log(`🗑️ Removed cache for ${path.basename(filePath)}`);
    }

    /**
     * 处理文件重命名
     */
    private async handleFileRename(oldPath: string, newPath: string): Promise<void> {
        if (this.shouldIgnoreFile(newPath)) {
            // 如果新路径应该被忽略，直接删除旧缓存
            this.handleFileDelete(oldPath);
            return;
        }

        // 更新 textmacro 注册表：获取旧文件的宏并更新路径
        const oldMacros = this.textMacroRegistry.getByFile(oldPath);
        if (oldMacros.length > 0) {
            // 先移除旧路径的宏
            this.textMacroRegistry.unregisterFile(oldPath);
            // 更新宏的文件路径并重新注册
            oldMacros.forEach(macro => {
                const updatedMacro = { ...macro, filePath: newPath };
                this.textMacroRegistry.register(updatedMacro);
            });
        }

        // 获取旧文件的 BlockStatement
        const oldCache = this.cache.get(oldPath);
        if (oldCache) {
            // 移动到新路径
            this.cache.set(newPath, {
                ...oldCache,
                version: oldCache.version + 1
            });
            this.cache.delete(oldPath);

            // 更新 parser 缓存
            const oldParser = this.parserCache.get(oldPath);
            if (oldParser) {
                oldParser.filePath = newPath;
                this.parserCache.set(newPath, oldParser);
                this.parserCache.delete(oldPath);
            }

            console.log(`📝 Renamed cache: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
            
            // 更新补全项缓存：删除旧路径，新路径会在 handleFileUpdate 中更新
            const completionCache = CompletionCache.getInstance();
            const oldItems = completionCache.get(oldPath);
            completionCache.delete(oldPath);
            if (oldItems.length > 0) {
                // 更新文件路径并重新保存
                oldItems.forEach(item => {
                    (item as any).filePath = newPath;
                });
                completionCache.update(newPath, oldItems);
            }
        } else {
            // 如果旧文件没有缓存，尝试解析新文件
            await this.handleFileUpdate(newPath);
        }
    }

    /**
     * 更新补全项缓存（异步，不阻塞）
     */
    private updateCompletionCache(filePath: string, blockStatement: BlockStatement): void {
        // 异步更新，不阻塞
        setImmediate(() => {
            try {
                const completionCache = CompletionCache.getInstance();
                const items = CompletionExtractor.extractCompletionItems(
                    blockStatement,
                    filePath,
                    (fp) => this.getFileContent(fp),
                    (fp) => {
                        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                        if (workspaceFolder) {
                            try {
                                return vscode.workspace.asRelativePath(fp);
                            } catch {
                                return fp;
                            }
                        }
                        return fp;
                    }
                );
                completionCache.update(filePath, items);
            } catch (error) {
                console.error(`Failed to update completion cache for ${filePath}:`, error);
            }
        });
    }

    /**
     * 解析文件内容为 BlockStatement 或 ZincProgram
     * 使用 streamingParse 进行预处理和解析
     * 对于 .zn 文件，使用 Zinc 解析器
     */
    private parseFile(filePath: string, content: string): BlockStatement | null {
        try {
            const ext = path.extname(filePath).toLowerCase();
            
            // 如果是 .zn 文件，使用 InnerZincParser
            if (ext === '.zn') {
                const zincParser = new InnerZincParser(content, filePath);
                const statements = zincParser.parse();
                const zincProgram = new ZincProgram(statements);
                // 使用 InnerZincParser 的错误收集
                const zincErrors = zincParser.errors;
                
                // 存储 ZincProgram 和错误信息到缓存
                const cacheItem = this.cache.get(filePath);
                if (cacheItem) {
                    cacheItem.zincProgram = zincProgram;
                    cacheItem.errors = zincErrors;
                } else {
                    // 如果缓存项不存在，创建一个新的（这种情况应该很少见）
                    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : { mtimeMs: Date.now() };
                    this.cache.set(filePath, {
                        blockStatement: null,
                        zincProgram: zincProgram,
                        lastModified: stats.mtimeMs,
                        version: 1,
                        isImmutable: this.isImmutableFile(filePath),
                        content: content,
                        errors: zincErrors
                    });
                }
                
                if (zincErrors.errors.length > 0) {
                    console.warn(`Parsing errors in ${path.basename(filePath)}:`, {
                        errors: zincErrors.errors.length,
                        warnings: zincErrors.warnings.length
                    });
                }
                
                // 返回 null，因为 Zinc AST 和 vJass BlockStatement 不兼容
                return null;
            }
            
            // 使用 streamingParse 进行预处理和解析
            // 它会自动处理：移除注释、预处理指令、Lua 段，然后调用 Parser
            const result = streamingParse(content, {
                filePath,
                deleteLineComment: false, // 保留行注释
                textMacroExpander: this.textMacroExpander
            });

            // 如果有错误，记录到控制台
            if (result.errors.errors.length > 0) {
                console.warn(`Parsing errors in ${path.basename(filePath)}:`, {
                    errors: result.errors.errors.length,
                    warnings: result.errors.warnings.length
                });
            }

            // 存储错误信息到缓存（如果缓存项已存在）
            const cacheItem = this.cache.get(filePath);
            if (cacheItem) {
                cacheItem.errors = result.errors;
                // 确保 zincProgram 为 undefined（非 Zinc 文件）
                cacheItem.zincProgram = undefined;
            }
            // 注意：如果缓存项不存在，错误信息将在 handleFileUpdate 中通过 parseFile 的返回值存储

            // 缓存预处理指令集合（如果需要的话，可以在这里处理）
            // result.preprocessCollection.defines
            // result.preprocessCollection.includes

            // 返回解析后的 BlockStatement
            return result.blockStatement;
        } catch (error) {
            console.error(`Failed to parse file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 检查文件是否为不可变文件（静态文件）
     */
    private isImmutableFile(filePath: string): boolean {
        const fileName = path.basename(filePath).toLowerCase();
        const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

        // 检查是否在扩展的 static 目录下
        const extensionStaticDir = path.resolve(__dirname, "../../../static").replace(/\\/g, '/').toLowerCase();
        if (normalizedPath.includes(extensionStaticDir)) {
            return true;
        }

        // 检查是否在工作区的 static 目录下
        if (normalizedPath.includes('/static/') || normalizedPath.includes('\\static\\')) {
            return true;
        }

        // 标准库文件也是不可变的
        if (STANDARD_LIBRARY_ORDER.includes(fileName)) {
            return true;
        }

        return false;
    }

    /**
     * 检查文件是否为 JASS 文件
     */
    private isJassFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        const validExtensions = ['.j', '.jass', '.ai', '.zn'];
        return validExtensions.includes(ext);
    }

    /**
     * 检查是否应该忽略文件
     */
    private shouldIgnoreFile(filePath: string): boolean {
        // 如果设置了忽略配置，直接返回 false（不忽略）
        if (this.options.ignoreConfig) {
            return false;
        }

        const fileName = path.basename(filePath).toLowerCase();
        
        // 检查是否在忽略列表中（特殊文件由 SpecialFileManager 处理，这里忽略）
        if (IGNORED_FILES.includes(fileName)) {
            return true;
        }

        // 检查文件扩展名
        if (!this.isJassFile(filePath)) {
            return true;
        }

        return false;
    }

    /**
     * 通知 SpecialFileManager 特殊文件变化
     */
    private notifySpecialFileManager(filePath: string, eventType: 'create' | 'update' | 'delete'): void {
        try {
            // 动态导入，避免循环依赖
            const { SpecialFileManager } = require('./special/special-file-manager');
            const manager = SpecialFileManager.getInstance();
            
            if (eventType === 'delete') {
                manager.deleteFile(filePath);
                console.log(`📢 Notified SpecialFileManager: deleted ${path.basename(filePath)}`);
            } else {
                // create 或 update 都需要读取文件内容
                const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
                if (document) {
                    const content = document.getText();
                    manager.updateFile(filePath, content);
                    console.log(`📢 Notified SpecialFileManager: ${eventType} ${path.basename(filePath)}`);
                } else {
                    // 如果文档未打开，从文件系统读取
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        manager.updateFile(filePath, content);
                        console.log(`📢 Notified SpecialFileManager: ${eventType} ${path.basename(filePath)} (from filesystem)`);
                    } catch (error) {
                        console.error(`Failed to read special file ${filePath}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to notify SpecialFileManager for ${filePath}:`, error);
        }
    }

    /**
     * 检查文件是否在工作目录下（可变文件）
     */
    private isWorkspaceFile(filePath: string): boolean {
        if (!this.workspaceRoot) {
            return false;
        }

        const normalizedFilePath = path.normalize(filePath);
        const normalizedWorkspaceRoot = path.normalize(this.workspaceRoot);

        // 检查文件路径是否以工作区根目录开头
        return normalizedFilePath.startsWith(normalizedWorkspaceRoot);
    }

    /**
     * 获取文件的 BlockStatement
     */
    public getBlockStatement(filePath: string): BlockStatement | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.blockStatement || null;
    }

    /**
     * 获取文件的 ZincProgram（仅用于 .zn 文件）
     */
    public getZincProgram(filePath: string): ZincProgram | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.zincProgram || null;
    }

    /**
     * 检查文件是否为 Zinc 文件
     */
    public isZincFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.zn';
    }

    /**
     * 获取文件的错误集合
     */
    public getErrors(filePath: string): ErrorCollection | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.errors || null;
    }

    /**
     * 获取文件的原始内容（用于提取注释）
     */
    public getFileContent(filePath: string): string | null {
        const cacheItem = this.cache.get(filePath);
        return cacheItem?.content || null;
    }

    /**
     * 获取文件缓存信息
     */
    public getCacheInfo(filePath: string): { lastModified: number; version: number } | null {
        const cacheItem = this.cache.get(filePath);
        if (!cacheItem) {
            return null;
        }
        return {
            lastModified: cacheItem.lastModified,
            version: cacheItem.version
        };
    }

    /**
     * 手动触发文件更新
     */
    public async updateFile(filePath: string, content?: string): Promise<void> {
        await this.handleFileUpdate(filePath, content);
    }

    /**
     * 手动触发文件重命名
     */
    public async renameFile(oldPath: string, newPath: string): Promise<void> {
        await this.handleFileRename(oldPath, newPath);
    }

    /**
     * 手动触发文件删除
     */
    public deleteFile(filePath: string): void {
        this.handleFileDelete(filePath);
    }

    /**
     * 获取所有缓存的文件路径
     */
    public getAllCachedFiles(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * 获取缓存统计信息（用于调试）
     */
    public getCacheStats(): {
        totalFiles: number;
        immutableFiles: number;
        cachedFiles: string[];
        immutableFileList: string[];
    } {
        return {
            totalFiles: this.cache.size,
            immutableFiles: this.immutableFiles.size,
            cachedFiles: Array.from(this.cache.keys()),
            immutableFileList: Array.from(this.immutableFiles)
        };
    }

    /**
     * 按顺序获取标准库文件的 BlockStatement
     * @returns 按解析顺序返回的 BlockStatement 数组 [common.j, common.ai, blizzard.j]
     */
    public getStandardLibraries(workspaceRoot?: string): BlockStatement[] {
        const root = workspaceRoot || this.workspaceRoot;
        if (!root) {
            return [];
        }

        const results: BlockStatement[] = [];
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            const filePath = path.join(root, fileName);
            const blockStatement = this.getBlockStatement(filePath);
            if (blockStatement) {
                results.push(blockStatement);
            }
        }
        return results;
    }

    /**
     * 获取不可变文件列表
     */
    public getImmutableFiles(): string[] {
        return Array.from(this.immutableFiles);
    }

    /**
     * 检查文件是否为不可变文件
     */
    public isFileImmutable(filePath: string): boolean {
        return this.immutableFiles.has(filePath) || this.isImmutableFile(filePath);
    }

    /**
     * 清空所有缓存
     */
    public clearCache(): void {
        this.cache.clear();
        this.parserCache.clear();
        console.log('🧹 Cleared all cache');
    }

    /**
     * 初始化工作区文件
     * 两阶段解析：先收集所有 textmacro，再解析文件
     */
    public async initializeWorkspace(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        const workspaceRoot = workspaceFolder.uri.fsPath;

        console.log('📦 Phase 1: Collecting TextMacros...');
        // 阶段1：收集所有文件中的 textmacro 定义
        await this.collectAllTextMacros(workspaceRoot);
        
        const stats = this.textMacroRegistry.getStats();
        console.log(`✅ Collected ${stats.totalMacros} textmacros from ${stats.totalFiles} files`);

        console.log('📦 Phase 2: Parsing files with TextMacro expansion...');
        // 阶段2：解析所有文件（此时 runtextmacro 可以正确展开）
        // 1. 按顺序解析标准库文件（不可变，不监听）
        await this.loadStandardLibraries(workspaceRoot);

        // 2. 加载 static 目录下的文件（不可变，不监听）
        await this.loadStaticFiles(workspaceRoot);

        // 3. 加载工作区文件（可变，监听）
        await this.loadWorkspaceFiles(workspaceRoot);
        
        // 输出缓存统计信息
        const cacheStats = this.getCacheStats();
        console.log('✅ Workspace initialization complete');
        console.log(`📊 Cache Stats: ${cacheStats.totalFiles} files cached (${cacheStats.immutableFiles} immutable)`);
        if (cacheStats.totalFiles > 0) {
            const fileList = cacheStats.cachedFiles.slice(0, 10).map(f => path.basename(f)).join(', ');
            console.log(`📁 Sample cached files: ${fileList}${cacheStats.cachedFiles.length > 10 ? '...' : ''}`);
        }

        // 设置事件处理器（监听和数据处理分离）
        this.setupEventHandlers();
        
        // 设置文件监听器（监听和数据处理分离）
        if (this.options.enableFileWatcher) {
            this.setupFileWatcher();
        }
    }

    /**
     * 设置事件处理器（监听和数据处理分离）
     * 监听器只负责触发事件，不阻塞
     */
    private setupEventHandlers(): void {
        // 使用 RxJS 处理文件事件流
        this.fileEventSubject
            .pipe(
                // 防抖处理，避免频繁更新
                debounceTime(this.options.debounceDelay!)
            )
            .subscribe({
                next: (event) => {
                    // 不等待，异步处理文件事件，不阻塞
                    this.processFileEvent(event).then(
                        (result) => {
                            if (result.success) {
                                // 静默处理成功，减少日志输出
                                // console.log(`✅ Processed ${result.event.type} for ${path.basename(result.event.filePath)}`);
                            } else {
                                console.error(`❌ Failed to process ${result.event.type} for ${path.basename(result.event.filePath)}: ${result.error}`);
                            }
                        },
                        (error) => {
                            console.error('❌ Error processing file event:', error);
                        }
                    );
                },
                error: (error) => {
                    console.error('❌ Error in file event stream:', error);
                }
            });
    }

    /**
     * 设置文件监听器（监听和数据处理分离）
     * 监听器只负责触发事件，不阻塞
     */
    private setupFileWatcher(): void {
        // 只监听工作区文件变化（不包括 static 目录）
        const pattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders?.[0] || vscode.Uri.file('/'),
            '**/*.{j,jass,ai,zn}'
        );

        this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        // 监听文件创建（只处理可变文件）
        this.fileWatcher.onDidCreate((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileCreate(filePath);
            }
        });

        // 监听文件删除（只处理可变文件）
        this.fileWatcher.onDidDelete((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileDelete(filePath);
            }
        });

        // 监听文件变化（只处理可变文件）
        this.fileWatcher.onDidChange((uri) => {
            const filePath = uri.fsPath;
            // 只监听工作区文件，不监听静态文件
            if (this.isWorkspaceFile(filePath) && !this.isImmutableFile(filePath)) {
                this.handleFileChange(filePath);
            }
        });

        this.disposables.push(this.fileWatcher);

        // 监听文档打开事件（立即解析，确保 outline 可以显示）
        const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
            const filePath = document.uri.fsPath;
            // 只处理 JASS 文件
            if (!this.isJassFile(filePath)) {
                return;
            }
            // 如果是不可变文件或应该忽略的文件，跳过
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            // 如果文件还没有被解析，立即解析
            if (!this.cache.has(filePath)) {
                const content = document.getText();
                if (content) {
                    this.handleFileChange(filePath);
                }
            }
        });
        this.disposables.push(openDisposable);

        // 监听文档变化事件（只处理可变文件）
        const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            const filePath = event.document.uri.fsPath;
            // 特殊文件需要监听，即使被忽略
            if (isSpecialFile(filePath)) {
                this.handleFileChange(filePath);
                return;
            }
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            this.handleFileChange(filePath);
        });
        this.disposables.push(changeDisposable);

        // 监听文档保存事件（只处理可变文件）
        const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
            const filePath = document.uri.fsPath;
            // 特殊文件需要监听，即使被忽略
            if (isSpecialFile(filePath)) {
                this.handleFileChange(filePath);
                return;
            }
            if (this.isImmutableFile(filePath) || this.shouldIgnoreFile(filePath)) {
                return;
            }
            this.handleFileChange(filePath);
        });
        this.disposables.push(saveDisposable);

        // 监听文件删除事件（只处理可变文件）
        const deleteDisposable = vscode.workspace.onDidDeleteFiles((event) => {
            event.files.forEach(uri => {
                const filePath = uri.fsPath;
                if (!this.isImmutableFile(filePath)) {
                    this.handleFileDelete(filePath);
                }
            });
        });
        this.disposables.push(deleteDisposable);

        // 监听文件重命名事件（只处理可变文件）
        const renameDisposable = vscode.workspace.onDidRenameFiles((event) => {
            event.files.forEach(({ oldUri, newUri }) => {
                const newPath = newUri.fsPath;
                if (!this.isImmutableFile(newPath)) {
                    this.fileEventSubject.next({
                        type: 'rename',
                        filePath: newPath,
                        oldPath: oldUri.fsPath
                    });
                }
            });
        });
        this.disposables.push(renameDisposable);
    }

    /**
     * 阶段1：收集所有文件中的 textmacro 定义
     * @param workspaceRoot 工作区根目录
     */
    private async collectAllTextMacros(workspaceRoot: string): Promise<void> {
        const collection = { errors: [], warnings: [] };
        
        // 收集标准库文件中的 textmacro
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            const filePath = path.join(workspaceRoot, fileName);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    this.textMacroCollector.collectFromFile(filePath, content, collection);
                } catch (error) {
                    console.error(`Failed to collect textmacros from ${fileName}:`, error);
                }
            }
        }
        
        // 收集 static 目录下的 textmacro
        const staticDir = path.join(workspaceRoot, 'static');
        if (fs.existsSync(staticDir) && fs.statSync(staticDir).isDirectory()) {
            this.collectTextMacrosFromDirectory(staticDir, collection);
        }
        
        // 收集工作区文件中的 textmacro
        this.collectTextMacrosFromDirectory(workspaceRoot, collection);
        
        // 报告收集阶段的错误和警告
        if (collection.errors.length > 0) {
            console.warn(`TextMacro collection errors: ${collection.errors.length}`);
        }
        if (collection.warnings.length > 0) {
            console.warn(`TextMacro collection warnings: ${collection.warnings.length}`);
        }
    }
    
    /**
     * 从目录递归收集 textmacro
     * @param dir 目录路径
     * @param collection 错误和警告收集器
     */
    private collectTextMacrosFromDirectory(
        dir: string,
        collection: { errors: any[]; warnings: any[] }
    ): void {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // 跳过忽略的文件
                if (this.shouldIgnoreFile(fullPath)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    // 递归处理子目录
                    this.collectTextMacrosFromDirectory(fullPath, collection);
                } else if (entry.isFile()) {
                    // 检查文件扩展名
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.j', '.jass', '.ai', '.zn'].includes(ext)) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf-8');
                            this.textMacroCollector.collectFromFile(fullPath, content, collection);
                        } catch (error) {
                            console.error(`Failed to collect textmacros from ${fullPath}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to read directory ${dir}:`, error);
        }
    }

    /**
     * 按顺序加载标准库文件
     * 优先从工作区根目录查找，如果不存在则从扩展的 static 目录查找
     */
    private async loadStandardLibraries(workspaceRoot: string): Promise<void> {
        // 扩展的 static 目录路径
        const extensionStaticDir = path.resolve(__dirname, "../../../static");
        
        console.log(`📚 Scanning for standard libraries...`);
        console.log(`   Workspace root: ${workspaceRoot}`);
        console.log(`   Extension static: ${extensionStaticDir}`);
        
        for (const fileName of STANDARD_LIBRARY_ORDER) {
            // 优先从工作区根目录查找
            let filePath = path.join(workspaceRoot, fileName);
            if (!fs.existsSync(filePath)) {
                // 如果工作区不存在，从扩展的 static 目录查找
                filePath = path.join(extensionStaticDir, fileName);
            }
            
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    await this.handleFileUpdate(filePath, content);
                    console.log(`📚 Loaded standard library: ${fileName} (from ${path.dirname(filePath)})`);
                } catch (error) {
                    console.error(`Failed to load standard library ${fileName}:`, error);
                }
            } else {
                console.log(`ℹ️ Standard library not found: ${fileName} (checked workspace and extension static)`);
            }
        }
    }

    /**
     * 加载 static 目录下的文件
     * 从扩展的 static 目录加载（不是工作区的 static 目录）
     */
    private async loadStaticFiles(workspaceRoot: string): Promise<void> {
        // 扩展的 static 目录路径（相对于扩展安装目录）
        const extensionStaticDir = path.resolve(__dirname, "../../../static");
        
        // 也检查工作区的 static 目录（如果存在）
        const workspaceStaticDir = path.join(workspaceRoot, 'static');
        
        const staticDirs: string[] = [];
        
        // 优先加载扩展的 static 目录
        if (fs.existsSync(extensionStaticDir) && fs.statSync(extensionStaticDir).isDirectory()) {
            staticDirs.push(extensionStaticDir);
            console.log(`📁 Found extension static directory: ${extensionStaticDir}`);
        }
        
        // 也加载工作区的 static 目录（如果存在）
        if (fs.existsSync(workspaceStaticDir) && fs.statSync(workspaceStaticDir).isDirectory()) {
            staticDirs.push(workspaceStaticDir);
            console.log(`📁 Found workspace static directory: ${workspaceStaticDir}`);
        }
        
        if (staticDirs.length === 0) {
            console.log(`ℹ️ No static directories found (checked extension and workspace)`);
            return;
        }

        const loadFilesInDir = async (dir: string, baseDir: string): Promise<void> => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await loadFilesInDir(fullPath, baseDir);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.j', '.jass', '.ai', '.zn'].includes(ext) && !this.shouldIgnoreFile(fullPath)) {
                            try {
                                const content = fs.readFileSync(fullPath, 'utf-8');
                                await this.handleFileUpdate(fullPath, content);
                                const relativePath = path.relative(baseDir, fullPath);
                                console.log(`📁 Loaded static file: ${relativePath}`);
                            } catch (error) {
                                console.error(`Failed to load static file ${fullPath}:`, error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to read directory ${dir}:`, error);
            }
        };

        // 加载所有找到的 static 目录
        for (const staticDir of staticDirs) {
            await loadFilesInDir(staticDir, staticDir);
        }

        // 通知 SpecialFileManager 重新初始化（会扫描所有特殊文件，包括 static 目录下的）
        try {
            const { SpecialFileManager } = require('./special/special-file-manager');
            const manager = SpecialFileManager.getInstance();
            await manager.initialize(workspaceRoot);
            console.log(`📢 SpecialFileManager reloaded after static files loaded`);
        } catch (error) {
            console.error(`Failed to reload SpecialFileManager:`, error);
        }
    }

    /**
     * 加载工作区文件（可变文件）
     */
    private async loadWorkspaceFiles(workspaceRoot: string): Promise<void> {
        const loadFilesInDir = (dir: string): void => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    // 跳过 static 目录（已在 loadStaticFiles 中处理）
                    if (entry.isDirectory()) {
                        const normalizedPath = fullPath.replace(/\\/g, '/').toLowerCase();
                        if (normalizedPath.includes('/static/') || normalizedPath.includes('\\static\\')) {
                            continue; // 跳过 static 目录
                        }
                        loadFilesInDir(fullPath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.j', '.jass', '.ai', '.zn'].includes(ext)) {
                            // 只处理工作区文件，排除静态文件和标准库文件
                            if (this.isWorkspaceFile(fullPath) && 
                                !this.isImmutableFile(fullPath) && 
                                !this.shouldIgnoreFile(fullPath)) {
                                try {
                                    const content = fs.readFileSync(fullPath, 'utf-8');
                                    this.handleFileUpdate(fullPath, content);
                                    console.log(`📄 Loaded workspace file: ${path.relative(workspaceRoot, fullPath)}`);
                                } catch (error) {
                                    console.error(`Failed to load workspace file ${fullPath}:`, error);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to read directory ${dir}:`, error);
            }
        };

        // 递归扫描工作区目录（排除 static 目录）
        loadFilesInDir(workspaceRoot);
        
        // 同时处理已打开的文档（如果还没有被加载）
        vscode.workspace.textDocuments.forEach(document => {
            const filePath = document.uri.fsPath;
            if (this.isWorkspaceFile(filePath) && 
                !this.isImmutableFile(filePath) && 
                !this.shouldIgnoreFile(filePath) &&
                !this.cache.has(filePath)) {
                // 如果文件还没有被加载，使用文档内容
                const content = document.getText();
                if (content) {
                    this.handleFileUpdate(filePath, content);
                }
            }
        });
    }

    /**
     * 销毁管理器，清理资源
     */
    public dispose(): void {
        this.fileEventSubject.complete();
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
        this.clearCache();
    }
}

// 导出单例实例（可选）
let defaultInstance: DataEnterManager | null = null;

/**
 * 获取默认的 DataEnterManager 实例
 */
export function getDefaultDataEnterManager(options?: DataEnterOptions): DataEnterManager {
    if (!defaultInstance) {
        defaultInstance = new DataEnterManager(options);
    }
    return defaultInstance;
}

/**
 * 销毁默认实例
 */
export function disposeDefaultDataEnterManager(): void {
    if (defaultInstance) {
        defaultInstance.dispose();
        defaultInstance = null;
    }
}

