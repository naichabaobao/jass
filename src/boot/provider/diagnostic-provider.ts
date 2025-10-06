/**
 * JASS/vJASS/Zinc 诊断提供者
 * 提供全面的语法和语义错误检测
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { Options } from './options';
import { Token, TokenType } from '../jass/tokenizer-common';
import { isAiFile, isJFile } from '../tool';
import { GlobalContext } from '../jass/parser-vjass';
import { Subject } from '../../extern/rxjs';
import { NodeAst } from '../jass/parser-vjass';

/**
 * 错误类型枚举
 */
export enum ErrorType {
	SYNTAX = 'syntax',
	SEMANTIC = 'semantic',
	WARNING = 'warning',
	INFO = 'info'
}

/**
 * 错误严重程度映射
 */
const ERROR_SEVERITY_MAP: Record<string, vscode.DiagnosticSeverity> = {
	[ErrorType.SYNTAX]: vscode.DiagnosticSeverity.Error,
	[ErrorType.SEMANTIC]: vscode.DiagnosticSeverity.Error,
	[ErrorType.WARNING]: vscode.DiagnosticSeverity.Warning,
	[ErrorType.INFO]: vscode.DiagnosticSeverity.Information
};

/**
 * 错误信息接口
 */
interface ErrorInfo {
	token?: Token;
	node?: NodeAst;
	message: string;
	type: ErrorType;
	line?: number;
	character?: number;
	length?: number;
}

/**
 * 全局诊断集合
 */
const diagnostic_collection_for_jass = vscode.languages.createDiagnosticCollection("jass");

/**
 * 创建诊断对象
 */
function createDiagnostic(errorInfo: ErrorInfo): vscode.Diagnostic {
	let range: vscode.Range;
	let message = errorInfo.message;

	if (errorInfo.token) {
		const startChar = Math.max(0, errorInfo.token.character);
		const endChar = Math.max(0, errorInfo.token.character + errorInfo.token.length);
		range = new vscode.Range(errorInfo.token.line, startChar, errorInfo.token.line, endChar);
	} else if (errorInfo.node && errorInfo.node.start_token) {
		const startChar = Math.max(0, errorInfo.node.start_token.character);
		const endChar = Math.max(0, errorInfo.node.start_token.character + errorInfo.node.start_token.length);
		range = new vscode.Range(errorInfo.node.start_token.line, startChar, errorInfo.node.start_token.line, endChar);
	} else if (errorInfo.line !== undefined) {
		const startChar = Math.max(0, errorInfo.character || 0);
		const endChar = Math.max(0, (errorInfo.character || 0) + (errorInfo.length || 1));
		range = new vscode.Range(errorInfo.line, startChar, errorInfo.line, endChar);
	} else {
		// 默认范围
		range = new vscode.Range(0, 0, 0, 1);
	}

	return new vscode.Diagnostic(
		range,
		message,
		ERROR_SEVERITY_MAP[errorInfo.type] || vscode.DiagnosticSeverity.Error
	);
}

/**
 * 验证错误信息的有效性
 */
function validateErrorInfo(errorInfo: ErrorInfo): boolean {
	if (!errorInfo.message || errorInfo.message.trim() === '') {
		return false;
	}

	// 检查是否有有效的定位信息
	const hasValidLocation = 
		errorInfo.token !== undefined ||
		(errorInfo.node !== undefined && errorInfo.node.start_token !== undefined) ||
		errorInfo.line !== undefined;

	return hasValidLocation;
}

/**
 * 查找文档中的所有错误
 */
export function findFileErrors(document: any): ErrorInfo[] {
	const errors: ErrorInfo[] = [];
	const errorSet = new Set<string>(); // 用于去重

	// 1. 收集 token 错误
	if (document.token_errors) {
		document.token_errors.forEach((err: any) => {
			const errorKey = `${err.token.line}:${err.token.character}:${err.message}`;
			if (!errorSet.has(errorKey)) {
				errorSet.add(errorKey);
				errors.push({
					token: err.token,
					message: err.message,
					type: ErrorType.SYNTAX
				});
			}
		});
	}

	// 2. 收集错误集合中的错误
	if (document.errorCollection && document.errorCollection.errors) {
		document.errorCollection.errors.forEach((err: any) => {
			const errorKey = `${err.start.line}:${err.start.position}:${err.message}`;
			if (!errorSet.has(errorKey)) {
				errorSet.add(errorKey);
				errors.push({
					message: err.message,
					type: ErrorType.SEMANTIC,
					line: err.start.line,
					character: err.start.position,
					length: err.end.position - err.start.position
				});
			}
		});
	}

	// 3. 收集节点错误（如果存在）
	if (document.node_errors) {
		document.node_errors.forEach((err: any) => {
			const line = err.node?.start_token?.line || 0;
			const character = err.node?.start_token?.character || 0;
			const errorKey = `${line}:${character}:${err.message}`;
			if (!errorSet.has(errorKey)) {
				errorSet.add(errorKey);
				errors.push({
					node: err.node,
					message: err.message,
					type: ErrorType.SEMANTIC
				});
			}
		});
	}

	// 4. 验证所有错误
	return errors.filter(validateErrorInfo);
}

/**
 * 处理文档错误检测
 */
function processDocumentErrors(document_or_filepath: vscode.TextDocument | string): void {
	const path_format = path.parse(typeof document_or_filepath == "string" ? document_or_filepath : document_or_filepath.uri.path);
	
	// 检查文件扩展名
	if (!(path_format.ext === ".j" || path_format.ext === ".jass" || path_format.ext === ".ai")) {
		return;
	}

	// 检查诊断是否启用
	if (!Options.isJassDiagnostic) {
		diagnostic_collection_for_jass.delete(
			typeof document_or_filepath === "string" ? vscode.Uri.file(document_or_filepath) : document_or_filepath.uri
		);
		return;
	}

	const diagnostics: vscode.Diagnostic[] = [];
	const fileName = typeof document_or_filepath === "string" ? document_or_filepath : document_or_filepath.fileName;
	const doc = GlobalContext.get(fileName);

	if (doc) {
		const errors = findFileErrors(doc);
		
		// 转换错误为诊断对象
		errors.forEach(errorInfo => {
			try {
				const diagnostic = createDiagnostic(errorInfo);
				diagnostics.push(diagnostic);
			} catch (error) {
				// 如果创建诊断失败，记录错误但不中断处理
				console.error('Failed to create diagnostic:', error, errorInfo);
			}
		});
	}

	// 设置诊断
	const uri = typeof document_or_filepath === "string" ? vscode.Uri.file(document_or_filepath) : document_or_filepath.uri;
	diagnostic_collection_for_jass.set(uri, diagnostics);
}

/**
 * 异步错误检测主题
 */
const errorDetectionSubject = new Subject<string | vscode.TextDocument>();
errorDetectionSubject.subscribe((document_or_filepath: vscode.TextDocument | string) => {
	try {
		processDocumentErrors(document_or_filepath);
	} catch (error) {
		console.error('Error in error detection:', error);
	}
});

/**
 * 触发错误检测
 */
export function find_error(document_or_filepath: vscode.TextDocument | string): void {
	errorDetectionSubject.next(document_or_filepath);
}

/**
 * 释放诊断器资源
 */
export function release_diagnosticor(): void {
	diagnostic_collection_for_jass.dispose();
	errorDetectionSubject.complete();
}

// vscode.workspace.onDidSaveTextDocument((document) => {
// 	find_file_error_for_vjass(document);
// });

// 注意：事件监听器已移动到 JassDiagnosticProvider 类中，避免重复处理
// 如果需要全局访问，请使用 JassDiagnosticProvider 实例

/**
 * JASS/vJASS/Zinc 诊断提供者类
 * 提供高可用的错误检测和诊断功能
 */
export class JassDiagnosticProvider {
	private diagnosticCollection: vscode.DiagnosticCollection;
	private disposables: vscode.Disposable[] = [];
	private isInitialized = false;

	constructor() {
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection('jass');
	}

	/**
	 * 初始化诊断提供者
	 */
	public initialize(): void {
		if (this.isInitialized) {
			return;
		}

		// 监听文档打开事件
		const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
			this.handleDocumentChange(document);
		});
		this.disposables.push(openDisposable);

		// 监听文档保存事件
		const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
			this.handleDocumentChange(document);
		});
		this.disposables.push(saveDisposable);

		// 监听文档内容变化事件
		const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
			this.handleDocumentChange(event.document);
		});
		this.disposables.push(changeDisposable);

		// 监听文件删除事件
		const deleteDisposable = vscode.workspace.onDidDeleteFiles((event) => {
			event.files.forEach((filePath) => {
				if (this.isSupportedFile(filePath.fsPath)) {
					this.diagnosticCollection.delete(filePath);
				}
			});
		});
		this.disposables.push(deleteDisposable);

		// 监听文件重命名事件
		const renameDisposable = vscode.workspace.onDidRenameFiles((event) => {
			event.files.forEach((filePath) => {
				if (this.isSupportedFile(filePath.oldUri.fsPath)) {
					const diagnostics = this.diagnosticCollection.get(filePath.oldUri);
					this.diagnosticCollection.delete(filePath.oldUri);
					if (diagnostics) {
						this.diagnosticCollection.set(filePath.newUri, diagnostics);
					}
				}
			});
		});
		this.disposables.push(renameDisposable);

		// 监听配置变化事件
		const configDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
			if (!Options.isJassDiagnostic) {
				this.diagnosticCollection.clear();
			}
		});
		this.disposables.push(configDisposable);

		this.isInitialized = true;
	}

	/**
	 * 处理文档变化
	 */
	private handleDocumentChange(document: vscode.TextDocument): void {
		try {
			if (!this.isSupportedFile(document.uri.fsPath)) {
				return;
			}

			if (!Options.isJassDiagnostic) {
				this.diagnosticCollection.delete(document.uri);
				return;
			}

			// 使用异步方式处理错误检测
			setTimeout(() => {
				this.findError(document);
			}, 100); // 延迟100ms以确保文档解析完成
		} catch (error) {
			console.error('Error in handleDocumentChange:', error);
		}
	}

	/**
	 * 检查是否为支持的文件类型
	 */
	private isSupportedFile(filePath: string): boolean {
		const pathFormat = path.parse(filePath);
		return pathFormat.ext === '.j' || pathFormat.ext === '.jass' || pathFormat.ext === '.ai';
	}

	/**
	 * 查找文档错误
	 */
	private findError(document: vscode.TextDocument): void {
		try {
			const diagnostics: vscode.Diagnostic[] = [];
			const doc = GlobalContext.get(document.fileName);

			if (doc) {
				const errors = findFileErrors(doc);
				
				// 转换错误为诊断对象
				errors.forEach(errorInfo => {
					try {
						const diagnostic = createDiagnostic(errorInfo);
						diagnostics.push(diagnostic);
					} catch (error) {
						console.error('Failed to create diagnostic:', error, errorInfo);
					}
				});
			}

			this.diagnosticCollection.set(document.uri, diagnostics);
		} catch (error) {
			console.error('Error in findError:', error);
			// 即使出错也要清理之前的诊断
			this.diagnosticCollection.delete(document.uri);
		}
	}

	/**
	 * 手动触发错误检测
	 */
	public triggerErrorDetection(document: vscode.TextDocument): void {
		this.handleDocumentChange(document);
	}

	/**
	 * 获取诊断集合
	 */
	public getDiagnosticCollection(): vscode.DiagnosticCollection {
		return this.diagnosticCollection;
	}

	/**
	 * 获取文档的诊断信息
	 */
	public getDiagnostics(uri: vscode.Uri): readonly vscode.Diagnostic[] {
		const diagnostics = this.diagnosticCollection.get(uri);
		return diagnostics || [];
	}

	/**
	 * 清理诊断集合
	 */
	public dispose(): void {
		this.disposables.forEach(disposable => disposable.dispose());
		this.disposables = [];
		this.diagnosticCollection.dispose();
		this.isInitialized = false;
	}
}

