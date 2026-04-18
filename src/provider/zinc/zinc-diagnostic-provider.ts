/**
 * Zinc 诊断提供者
 * 专门处理 .zn 文件的错误和警告提示
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter-manager';
import { ErrorCollection, SimpleError, SimpleWarning, CheckValidationError } from '../../vjass/error';

/**
 * Zinc 诊断提供者类
 * 负责收集和报告 Zinc 文件的语法错误、警告等信息
 */
export class ZincDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private dataEnterManager: DataEnterManager;
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('zinc');
        
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
                if (this.isEnabled && this.isZincFile(e.document.uri.fsPath)) {
                    this.updateDiagnostics(e.document);
                }
            })
        );

        // 监听文件打开
        this.disposables.push(
            vscode.workspace.onDidOpenTextDocument((doc) => {
                if (this.isEnabled && this.isZincFile(doc.uri.fsPath)) {
                    this.updateDiagnostics(doc);
                }
            })
        );

        // 监听文件保存
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument((doc) => {
                if (this.isEnabled && this.isZincFile(doc.uri.fsPath)) {
                    this.updateDiagnostics(doc);
                }
            })
        );

        // 延迟初始更新，等待 DataEnterManager 初始化完成
        setTimeout(() => {
            vscode.workspace.textDocuments.forEach((doc) => {
                if (this.isEnabled && this.isZincFile(doc.uri.fsPath)) {
                    this.updateDiagnostics(doc);
                }
            });
        }, 1000); // 延迟1秒，确保 DataEnterManager 初始化完成
    }

    /**
     * 更新配置
     */
    private updateConfiguration(): void {
        const config = vscode.workspace.getConfiguration('jass');
        this.isEnabled = config.get<boolean>('diagnostic', true);
        
        if (!this.isEnabled) {
            this.diagnosticCollection.clear();
        }
    }

    /**
     * 检查文件是否是 Zinc 文件
     */
    private isZincFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.zn';
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
                // 处理语法错误
                errors.errors.forEach((error: SimpleError) => {
                    const diagnostic = this.createDiagnosticFromError(error, vscode.DiagnosticSeverity.Error);
                    if (diagnostic) {
                        diagnostics.push(diagnostic);
                    }
                });

                // 处理警告
                errors.warnings.forEach((warning: SimpleWarning) => {
                    const diagnostic = this.createDiagnosticFromWarning(warning, vscode.DiagnosticSeverity.Warning);
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
        } catch (error: any) {
            console.error(`Error updating Zinc diagnostics for ${document.uri.fsPath}:`, error);
            if (error.message) {
                console.error(`Error message: ${error.message}`);
            }
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
            diagnostic.source = 'zinc';
            diagnostic.code = 'syntax_error';

            return diagnostic;
        } catch (error: any) {
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
            diagnostic.source = 'zinc';
            diagnostic.code = 'warning';

            return diagnostic;
        } catch (error: any) {
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
            diagnostic.source = 'zinc';
            diagnostic.code = checkError.checkType || 'validation_error';

            return diagnostic;
        } catch (error: any) {
            console.error('Failed to create diagnostic from check error:', error);
            return null;
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
            case 'hint':
                return vscode.DiagnosticSeverity.Hint;
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
        } catch (error: any) {
            console.error('Failed to create range:', error, { start, end });
            return null;
        }
    }

    /**
     * 刷新所有诊断
     */
    private refreshAllDiagnostics(): void {
        vscode.workspace.textDocuments.forEach((doc) => {
            if (this.isZincFile(doc.uri.fsPath)) {
                this.updateDiagnostics(doc);
            }
        });
    }

    /**
     * 手动触发诊断更新
     */
    public triggerDiagnostics(document: vscode.TextDocument): void {
        if (this.isEnabled && this.isZincFile(document.uri.fsPath)) {
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
        this.disposables.forEach(d => d.dispose());
        this.diagnosticCollection.dispose();
    }
}

