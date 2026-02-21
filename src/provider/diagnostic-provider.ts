/**
 * 基于新 vJass 解析器的诊断提供者
 * 提供规范化的语法错误和警告提示
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from './data-enter-manager';
import { ErrorCollection, SimpleError, SimpleWarning, CheckValidationError } from '../vjass/error';
import { Subject, debounceTime } from '../extern/rxjs';

/**
 * 诊断配置接口（与 data-enter-manager.ts 中的 DiagnosticsConfig 保持一致）
 */
interface DiagnosticsConfig {
    enable?: boolean;
    severity?: {
        errors?: "error" | "warning" | "information" | "hint";
        warnings?: "error" | "warning" | "information" | "hint";
    };
    checkTypes?: boolean;
    checkUndefined?: boolean;
    checkUnused?: boolean;
    checkArrayBounds?: boolean;
}

/**
 * 诊断提供者类
 * 负责收集和报告语法错误、警告等信息
 */
interface RenameEvent {
    oldUri: vscode.Uri;
    newUri: vscode.Uri;
}

export class DiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private dataEnterManager: DataEnterManager;
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    private diagnosticsConfig: DiagnosticsConfig = {};
    private renameEventSubject: Subject<RenameEvent> = new Subject();

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('jass');
        
        // 监听配置变化
        this.updateConfiguration();
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('jass.diagnostic')) {
                    this.updateConfiguration();
                    this.refreshAllDiagnostics();
                }
            })
        );

        // 监听文件变化
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument((e) => {
                if (this.isEnabled && this.isSupportedFile(e.document.uri.fsPath)) {
                    this.updateDiagnostics(e.document);
                }
            })
        );

        // 监听文件打开
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument((doc) => {
                if (this.isEnabled && this.isSupportedFile(doc.uri.fsPath)) {
                    this.updateDiagnostics(doc);
                }
            })
        );

        // 监听文件保存
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument((doc) => {
                if (this.isEnabled && this.isSupportedFile(doc.uri.fsPath)) {
                    this.updateDiagnostics(doc);
                }
            })
        );

        // 监听文件删除
        this.disposables.push(
            vscode.workspace.onDidDeleteFiles((event) => {
                event.files.forEach((file) => {
                    if (this.isSupportedFile(file.fsPath)) {
                        // 清除已删除文件的诊断
                        this.diagnosticCollection.delete(file);
                    }
                });
            })
        );

        // 订阅文件重命名事件流（使用 rxjs debounceTime 延迟处理）
        const renameSubscription = this.renameEventSubject
            .pipe(debounceTime(200)) // 延迟200ms，确保 DataEnterManager 处理完重命名事件
            .subscribe((renameEvent) => {
                const { oldUri, newUri } = renameEvent;
                
                // 更新新文件的诊断
                if (this.isEnabled && this.isSupportedFile(newUri.fsPath)) {
                    const newDocument = vscode.workspace.textDocuments.find(
                        (doc) => doc.uri.toString() === newUri.toString()
                    );
                    if (newDocument) {
                        this.updateDiagnostics(newDocument);
                    }
                }
            });
        this.disposables.push({ dispose: () => renameSubscription.unsubscribe() });

        // 监听文件重命名
        this.disposables.push(
            vscode.workspace.onDidRenameFiles((event) => {
                event.files.forEach((file) => {
                    const oldUri = file.oldUri;
                    const newUri = file.newUri;
                    
                    // 清除旧文件的诊断
                    if (this.isSupportedFile(oldUri.fsPath)) {
                        this.diagnosticCollection.delete(oldUri);
                    }
                    
                    // 通过 Subject 发送重命名事件（会经过 debounceTime 延迟处理）
                    if (this.isEnabled && this.isSupportedFile(newUri.fsPath)) {
                        this.renameEventSubject.next({ oldUri, newUri });
                    }
                });
            })
        );

        // 延迟初始更新，等待 DataEnterManager 初始化完成
        // 使用 rxjs debounceTime 替代 setTimeout
        const initialUpdateSubject = new Subject<void>();
        const initialSubscription = initialUpdateSubject
            .pipe(debounceTime(1000)) // 延迟1秒，确保 DataEnterManager 初始化完成
            .subscribe(() => {
                vscode.workspace.textDocuments.forEach((doc) => {
                    if (this.isEnabled && this.isSupportedFile(doc.uri.fsPath)) {
                        this.updateDiagnostics(doc);
                    }
                });
            });
        initialUpdateSubject.next(); // 触发初始更新
        this.disposables.push({ dispose: () => {
            initialSubscription.unsubscribe();
            initialUpdateSubject.complete();
        }});
    }

    /**
     * 更新配置
     */
    private updateConfiguration(): void {
        const config = vscode.workspace.getConfiguration('jass');
        const vsCodeDiagnosticEnabled = config.get<boolean>('diagnostic', true);
        
        // 从 jass.config.json 读取诊断配置（通过 DataEnterManager）
        // 注意：这里我们需要一个方法来获取配置，暂时使用 VS Code 配置作为后备
        this.isEnabled = vsCodeDiagnosticEnabled;
        
        // 尝试从 DataEnterManager 获取配置（如果可用）
        // 注意：这需要 DataEnterManager 暴露一个获取配置的方法
        // 暂时使用 VS Code 配置
        
        if (!this.isEnabled) {
            this.diagnosticCollection.clear();
        }
    }

    /**
     * 更新诊断配置（从 jass.config.json）
     */
    public updateDiagnosticsConfig(config: DiagnosticsConfig | undefined): void {
        if (config) {
            this.diagnosticsConfig = {
                enable: config.enable,
                severity: config.severity,
                checkTypes: config.checkTypes,
                checkUndefined: config.checkUndefined,
                checkUnused: config.checkUnused,
                checkArrayBounds: config.checkArrayBounds
            };
            // 如果配置中明确设置了 enable，使用配置值；否则保持当前状态
            if (typeof config.enable === 'boolean') {
                this.isEnabled = config.enable;
            }
        } else {
            this.diagnosticsConfig = {};
        }
        this.refreshAllDiagnostics();
    }

    /**
     * 检查文件是否支持诊断
     */
    private isSupportedFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.j' || ext === '.jass' || ext === '.ai' || ext === '.zn';
    }

    /**
     * 更新文档的诊断信息
     */
    private updateDiagnostics(document: vscode.TextDocument): void {
        if (!this.isEnabled) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        try {
            const errors = this.dataEnterManager.getErrors(document.uri.fsPath);
            const diagnostics: vscode.Diagnostic[] = [];

            if (errors) {
                // 获取错误严重程度配置
                const errorSeverity = this.diagnosticsConfig.severity?.errors || "error";
                const warningSeverity = this.diagnosticsConfig.severity?.warnings || "warning";
                
                // 将字符串转换为 DiagnosticSeverity
                const errorSeverityLevel = this.getSeverityLevel(errorSeverity);
                const warningSeverityLevel = this.getSeverityLevel(warningSeverity);
                
                // 处理语法错误
                errors.errors.forEach((error: SimpleError) => {
                    const diagnostic = this.createDiagnosticFromError(error, errorSeverityLevel);
                    if (diagnostic) {
                        diagnostics.push(diagnostic);
                    }
                });

                // 处理警告
                errors.warnings.forEach((warning: SimpleWarning) => {
                    const diagnostic = this.createDiagnosticFromWarning(warning, warningSeverityLevel);
                    if (diagnostic) {
                        diagnostics.push(diagnostic);
                    }
                });

                // 处理检查验证错误
                if (errors.checkValidationErrors) {
                    errors.checkValidationErrors.forEach((checkError: CheckValidationError) => {
                        const severity = this.getSeverityFromCheckError(checkError);
                        const diagnostic = this.createDiagnosticFromCheckError(checkError, severity);
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    });
                }
            }

            // 设置诊断
            this.diagnosticCollection.set(document.uri, diagnostics);
        } catch (error) {
            console.error(`Error updating diagnostics for ${document.uri.fsPath}:`, error);
            this.diagnosticCollection.delete(document.uri);
        }
    }

    /**
     * 从 SimpleError 创建诊断对象
     */
    private createDiagnosticFromError(
        error: SimpleError,
        severity: vscode.DiagnosticSeverity
    ): vscode.Diagnostic | null {
        try {
            const range = this.createRange(error.start, error.end);
            if (!range) {
                return null;
            }

            // 规范化错误消息
            let message = error.message;
            if (error.fix) {
                message = `${message}\n💡 建议: ${error.fix}`;
            }

            const diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostic.source = 'jass';
            diagnostic.code = 'syntax_error';

            return diagnostic;
        } catch (error) {
            console.error('Failed to create diagnostic from error:', error);
            return null;
        }
    }

    /**
     * 从 SimpleWarning 创建诊断对象
     */
    private createDiagnosticFromWarning(
        warning: SimpleWarning,
        severity: vscode.DiagnosticSeverity
    ): vscode.Diagnostic | null {
        try {
            const range = this.createRange(warning.start, warning.end);
            if (!range) {
                return null;
            }

            let message = warning.message;
            if (warning.fix) {
                message = `${message}\n💡 建议: ${warning.fix}`;
            }

            const diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostic.source = 'jass';
            diagnostic.code = 'warning';

            return diagnostic;
        } catch (error) {
            console.error('Failed to create diagnostic from warning:', error);
            return null;
        }
    }

    /**
     * 从 CheckValidationError 创建诊断对象
     */
    private createDiagnosticFromCheckError(
        checkError: CheckValidationError,
        severity: vscode.DiagnosticSeverity
    ): vscode.Diagnostic | null {
        try {
            const range = this.createRange(checkError.start, checkError.end);
            if (!range) {
                return null;
            }

            let message = checkError.message;
            if (checkError.fix) {
                message = `${message}\n💡 建议: ${checkError.fix}`;
            }

            const diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostic.source = 'jass';
            diagnostic.code = checkError.checkType || 'validation_error';

            return diagnostic;
        } catch (error) {
            console.error('Failed to create diagnostic from check error:', error);
            return null;
        }
    }

    /**
     * 将字符串严重程度转换为 DiagnosticSeverity
     */
    private getSeverityLevel(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case "error":
                return vscode.DiagnosticSeverity.Error;
            case "warning":
                return vscode.DiagnosticSeverity.Warning;
            case "information":
                return vscode.DiagnosticSeverity.Information;
            case "hint":
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Error;
        }
    }

    /**
     * 从检查错误获取严重程度
     */
    private getSeverityFromCheckError(checkError: CheckValidationError): vscode.DiagnosticSeverity {
        switch (checkError.severity) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Error;
        }
    }

    /**
     * 创建范围对象
     */
    private createRange(
        start: { line: number; position: number },
        end: { line: number; position: number }
    ): vscode.Range | null {
        try {
            // 确保位置有效
            const startLine = Math.max(0, start.line);
            const startChar = Math.max(0, start.position);
            const endLine = Math.max(0, end.line);
            const endChar = Math.max(0, end.position);

            // 确保结束位置不小于开始位置
            const finalEndLine = endLine < startLine ? startLine : endLine;
            const finalEndChar = (endLine === startLine && endChar < startChar) ? startChar + 1 : endChar;

            return new vscode.Range(startLine, startChar, finalEndLine, finalEndChar);
        } catch (error) {
            console.error('Failed to create range:', error, { start, end });
            return null;
        }
    }

    /**
     * 刷新所有诊断
     */
    private refreshAllDiagnostics(): void {
        vscode.workspace.textDocuments.forEach((doc) => {
            if (this.isSupportedFile(doc.uri.fsPath)) {
                this.updateDiagnostics(doc);
            }
        });
    }

    /**
     * 手动触发诊断更新
     */
    public triggerDiagnostics(document: vscode.TextDocument): void {
        if (this.isEnabled && this.isSupportedFile(document.uri.fsPath)) {
            this.updateDiagnostics(document);
        }
    }

    /**
     * 获取诊断集合
     */
    public getDiagnosticCollection(): vscode.DiagnosticCollection {
        return this.diagnosticCollection;
    }

    /**
     * 清理资源
     */
    public dispose(): void {
        // 完成 Subject，停止发送事件
        this.renameEventSubject.complete();
        
        // 清理所有 disposables
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        
        // 清理诊断集合
        this.diagnosticCollection.dispose();
    }
}

