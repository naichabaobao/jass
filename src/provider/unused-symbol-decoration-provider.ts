import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from './data-enter-manager';
import { CheckValidationError, SimpleWarning } from '../vjass/error';

/**
 * 未使用符号浅色装饰 Provider
 * 基于 AST 诊断结果（warnings/checkValidationErrors）对“未使用”范围进行淡化显示。
 */
export class UnusedSymbolDecorationProvider {
    private readonly dataEnterManager: DataEnterManager;
    private readonly decorationType: vscode.TextEditorDecorationType;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.decorationType = vscode.window.createTextEditorDecorationType({
            opacity: '0.4',
            fontStyle: 'italic',
            light: {
                color: '#999999'
            },
            dark: {
                color: '#666666'
            }
        });

        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics((event) => {
                event.uris.forEach((uri) => this.refreshForUri(uri));
            })
        );
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor((editor) => {
                if (editor) {
                    this.refreshEditor(editor);
                }
            })
        );
        this.disposables.push(
            vscode.window.onDidChangeVisibleTextEditors((editors) => {
                editors.forEach((editor) => this.refreshEditor(editor));
            })
        );
        this.disposables.push(
            vscode.workspace.onDidCloseTextDocument((doc) => {
                if (!this.isSupportedFile(doc.uri.fsPath)) {
                    return;
                }
                this.applyToUri(doc.uri, []);
            })
        );

        // 延迟一次初始化刷新，等待诊断同步完成
        setTimeout(() => this.refreshVisibleEditors(), 400);
    }

    private isSupportedFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.j' || ext === '.jass' || ext === '.ai' || ext === '.zn';
    }

    private isUnusedMessage(message: string): boolean {
        const normalized = message.toLowerCase();
        return normalized.includes('unused') || normalized.includes('未使用');
    }

    private toRange(start: { line: number; position: number }, end: { line: number; position: number }): vscode.Range {
        const startLine = Math.max(0, start.line);
        const startChar = Math.max(0, start.position);
        const endLine = Math.max(startLine, end.line);
        const endChar = Math.max(startChar, end.position);
        return new vscode.Range(startLine, startChar, endLine, endChar);
    }

    private collectUnusedRanges(filePath: string): vscode.Range[] {
        // 标准优先：直接读取 VS Code 当前诊断结果
        const uri = vscode.Uri.file(filePath);
        const diagnostics = vscode.languages.getDiagnostics(uri) || [];
        const fromDiagnostics = diagnostics
            .filter((d) => this.isUnusedMessage(d.message) || (d.tags || []).includes(vscode.DiagnosticTag.Unnecessary))
            .map((d) => d.range);
        if (fromDiagnostics.length > 0) {
            return fromDiagnostics;
        }

        // 兜底：诊断尚未同步时，读取 AST 错误缓存
        const errors = this.dataEnterManager.getErrors(filePath);
        if (!errors) {
            return [];
        }

        const ranges: vscode.Range[] = [];
        const warnings = errors.warnings || [];
        warnings.forEach((warning: SimpleWarning) => {
            if (this.isUnusedMessage(warning.message)) {
                ranges.push(this.toRange(warning.start, warning.end));
            }
        });

        const checkErrors = errors.checkValidationErrors || [];
        checkErrors.forEach((checkError: CheckValidationError) => {
            if (this.isUnusedMessage(checkError.message)) {
                ranges.push(this.toRange(checkError.start, checkError.end));
            }
        });
        return ranges;
    }

    private applyToUri(uri: vscode.Uri, ranges: vscode.Range[]): void {
        vscode.window.visibleTextEditors
            .filter((editor) => editor.document.uri.toString() === uri.toString())
            .forEach((editor) => editor.setDecorations(this.decorationType, ranges));
    }

    private refreshForUri(uri: vscode.Uri): void {
        if (!this.isSupportedFile(uri.fsPath)) {
            return;
        }
        const ranges = this.collectUnusedRanges(uri.fsPath);
        this.applyToUri(uri, ranges);
    }

    private refreshEditor(editor: vscode.TextEditor): void {
        if (!this.isSupportedFile(editor.document.uri.fsPath)) {
            return;
        }
        const ranges = this.collectUnusedRanges(editor.document.uri.fsPath);
        editor.setDecorations(this.decorationType, ranges);
    }

    private refreshVisibleEditors(): void {
        vscode.window.visibleTextEditors.forEach((editor) => this.refreshEditor(editor));
    }

    public dispose(): void {
        this.disposables.forEach((d) => d.dispose());
        this.disposables.length = 0;
        this.decorationType.dispose();
    }
}

