/**
 * JASS Code Actions Provider
 * 提供代码修复和重构功能
 */

import * as vscode from 'vscode';
import { GlobalContext } from '../jass/parser-vjass';
import { findFileErrors, ErrorType } from './diagnostic-provider';
import { Token, TokenType } from '../jass/tokenizer-common';

/**
 * JASS 代码操作提供者
 */
export class JassCodeActionsProvider implements vscode.CodeActionProvider {
    
    /**
     * 提供代码操作
     */
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const actions: vscode.CodeAction[] = [];
        
        // 获取当前文档的诊断信息
        const diagnostics = context.diagnostics;
        if (diagnostics.length === 0) {
            return actions;
        }

        // 为每个诊断提供相应的修复操作
        for (const diagnostic of diagnostics) {
            const quickFix = this.createQuickFix(document, diagnostic, range);
            if (quickFix) {
                actions.push(quickFix);
            }
        }

        // 添加重构操作
        const refactorActions = this.createRefactorActions(document, range);
        actions.push(...refactorActions);

        return actions;
    }

    /**
     * 创建快速修复操作
     */
    private createQuickFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const message = diagnostic.message.toLowerCase();
        const code = diagnostic.code;

        // 语法错误修复
        if (message.includes('expected') || message.includes('unexpected')) {
            return this.createSyntaxFix(document, diagnostic, range);
        }

        // 变量相关错误修复
        if (message.includes('undefined variable') || message.includes('undeclared')) {
            return this.createVariableFix(document, diagnostic, range);
        }

        // 函数调用错误修复
        if (message.includes('function') && (message.includes('not found') || message.includes('undefined'))) {
            return this.createFunctionFix(document, diagnostic, range);
        }

        // 类型错误修复
        if (message.includes('type mismatch') || message.includes('incompatible type')) {
            return this.createTypeFix(document, diagnostic, range);
        }

        // 括号匹配错误修复
        if (message.includes('missing') && (message.includes('(') || message.includes(')') || message.includes('{'))) {
            return this.createBracketFix(document, diagnostic, range);
        }

        // 分号缺失修复
        if (message.includes('missing semicolon') || message.includes('expected semicolon')) {
            return this.createSemicolonFix(document, diagnostic, range);
        }

        return null;
    }

    /**
     * 创建语法错误修复
     */
    private createSyntaxFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const message = diagnostic.message;
        const action = new vscode.CodeAction(
            `修复语法错误: ${message}`,
            vscode.CodeActionKind.QuickFix
        );

        // 尝试从错误消息中提取建议的修复
        if (message.includes('expected')) {
            const match = message.match(/expected\s+([a-zA-Z_]+)/);
            if (match) {
                const expectedToken = match[1];
                action.edit = new vscode.WorkspaceEdit();
                
                // 根据期望的token类型提供修复
                switch (expectedToken.toLowerCase()) {
                    case 'identifier':
                        action.edit.insert(document.uri, diagnostic.range.end, 'variableName');
                        break;
                    case 'string':
                        action.edit.insert(document.uri, diagnostic.range.end, '"text"');
                        break;
                    case 'number':
                        action.edit.insert(document.uri, diagnostic.range.end, '0');
                        break;
                    case 'boolean':
                        action.edit.insert(document.uri, diagnostic.range.end, 'true');
                        break;
                    default:
                        action.edit.insert(document.uri, diagnostic.range.end, expectedToken);
                }
                
                action.isPreferred = true;
                return action;
            }
        }

        return null;
    }

    /**
     * 创建变量修复操作
     */
    private createVariableFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const action = new vscode.CodeAction(
            '声明未定义的变量',
            vscode.CodeActionKind.QuickFix
        );

        // 获取变量名
        const variableName = document.getText(diagnostic.range);
        if (!variableName) {
            return null;
        }

        // 在文档开头添加变量声明
        action.edit = new vscode.WorkspaceEdit();
        const declaration = `local ${this.inferVariableType(variableName)} ${variableName} = ${this.getDefaultValue(variableName)}\n`;
        
        // 找到合适的位置插入声明
        const insertPosition = this.findInsertionPosition(document);
        action.edit.insert(document.uri, insertPosition, declaration);
        
        action.isPreferred = true;
        return action;
    }

    /**
     * 创建函数修复操作
     */
    private createFunctionFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const action = new vscode.CodeAction(
            '创建缺失的函数',
            vscode.CodeActionKind.QuickFix
        );

        // 获取函数名
        const functionName = document.getText(diagnostic.range);
        if (!functionName) {
            return null;
        }

        // 创建函数声明
        action.edit = new vscode.WorkspaceEdit();
        const functionDeclaration = `function ${functionName} takes nothing returns nothing\n    // TODO: 实现函数逻辑\nendfunction\n\n`;
        
        // 在文档末尾添加函数声明
        const endPosition = document.lineAt(document.lineCount - 1).range.end;
        action.edit.insert(document.uri, endPosition, functionDeclaration);
        
        action.isPreferred = true;
        return action;
    }

    /**
     * 创建类型修复操作
     */
    private createTypeFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const action = new vscode.CodeAction(
            '修复类型不匹配',
            vscode.CodeActionKind.QuickFix
        );

        // 尝试从上下文推断正确的类型转换
        const text = document.getText(diagnostic.range);
        if (text && /^\d+$/.test(text)) {
            // 数字转字符串
            action.edit = new vscode.WorkspaceEdit();
            action.edit.replace(document.uri, diagnostic.range, `I2S(${text})`);
        } else if (text && /^\d+\.\d+$/.test(text)) {
            // 实数转字符串
            action.edit = new vscode.WorkspaceEdit();
            action.edit.replace(document.uri, diagnostic.range, `R2S(${text})`);
        }

        return action.edit ? action : null;
    }

    /**
     * 创建括号修复操作
     */
    private createBracketFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const action = new vscode.CodeAction(
            '修复括号匹配',
            vscode.CodeActionKind.QuickFix
        );

        const message = diagnostic.message;
        action.edit = new vscode.WorkspaceEdit();

        if (message.includes('missing') && message.includes('(')) {
            action.edit.insert(document.uri, diagnostic.range.end, '(');
        } else if (message.includes('missing') && message.includes(')')) {
            action.edit.insert(document.uri, diagnostic.range.end, ')');
        } else if (message.includes('missing') && message.includes('{')) {
            action.edit.insert(document.uri, diagnostic.range.end, '{');
        } else if (message.includes('missing') && message.includes('}')) {
            action.edit.insert(document.uri, diagnostic.range.end, '}');
        } else {
            return null;
        }

        action.isPreferred = true;
        return action;
    }

    /**
     * 创建分号修复操作
     */
    private createSemicolonFix(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const action = new vscode.CodeAction(
            '添加缺失的分号',
            vscode.CodeActionKind.QuickFix
        );

        action.edit = new vscode.WorkspaceEdit();
        action.edit.insert(document.uri, diagnostic.range.end, ';');
        action.isPreferred = true;

        return action;
    }

    /**
     * 创建重构操作
     */
    private createRefactorActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        // 提取变量重构
        const extractVariableAction = this.createExtractVariableAction(document, range);
        if (extractVariableAction) {
            actions.push(extractVariableAction);
        }

        // 提取函数重构
        const extractFunctionAction = this.createExtractFunctionAction(document, range);
        if (extractFunctionAction) {
            actions.push(extractFunctionAction);
        }

        // 重命名符号重构
        const renameAction = this.createRenameAction(document, range);
        if (renameAction) {
            actions.push(renameAction);
        }

        return actions;
    }

    /**
     * 创建提取变量重构操作
     */
    private createExtractVariableAction(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        if (range.isEmpty) {
            return null;
        }

        const selectedText = document.getText(range);
        if (!selectedText || selectedText.length < 2) {
            return null;
        }

        const action = new vscode.CodeAction(
            '提取为变量',
            vscode.CodeActionKind.RefactorExtract
        );

        action.edit = new vscode.WorkspaceEdit();
        
        // 生成变量名
        const variableName = this.generateVariableName(selectedText);
        
        // 在当前位置上方插入变量声明
        const insertPosition = new vscode.Position(range.start.line, 0);
        const declaration = `local ${this.inferVariableType(selectedText)} ${variableName} = ${selectedText}\n`;
        action.edit.insert(document.uri, insertPosition, declaration);
        
        // 替换选中的文本为变量名
        action.edit.replace(document.uri, range, variableName);

        return action;
    }

    /**
     * 创建提取函数重构操作
     */
    private createExtractFunctionAction(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        if (range.isEmpty) {
            return null;
        }

        const selectedText = document.getText(range);
        if (!selectedText || selectedText.split('\n').length < 2) {
            return null;
        }

        const action = new vscode.CodeAction(
            '提取为函数',
            vscode.CodeActionKind.RefactorExtract
        );

        action.edit = new vscode.WorkspaceEdit();
        
        // 生成函数名
        const functionName = this.generateFunctionName();
        
        // 创建函数声明
        const functionDeclaration = `function ${functionName} takes nothing returns nothing\n${selectedText}\nendfunction\n\n`;
        
        // 在文档末尾添加函数
        const endPosition = document.lineAt(document.lineCount - 1).range.end;
        action.edit.insert(document.uri, endPosition, functionDeclaration);
        
        // 替换选中的文本为函数调用
        action.edit.replace(document.uri, range, `call ${functionName}()`);

        return action;
    }

    /**
     * 创建重命名操作
     */
    private createRenameAction(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        if (range.isEmpty) {
            return null;
        }

        const selectedText = document.getText(range);
        if (!selectedText || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(selectedText)) {
            return null;
        }

        const action = new vscode.CodeAction(
            '重命名符号',
            vscode.CodeActionKind.Refactor
        );

        action.command = {
            command: 'editor.action.rename',
            title: '重命名符号',
            arguments: [document.uri, range.start]
        };

        return action;
    }

    /**
     * 推断变量类型
     */
    private inferVariableType(value: string): string {
        if (/^\d+$/.test(value)) {
            return 'integer';
        } else if (/^\d+\.\d+$/.test(value)) {
            return 'real';
        } else if (/^"[^"]*"$/.test(value)) {
            return 'string';
        } else if (/^(true|false)$/.test(value)) {
            return 'boolean';
        } else {
            return 'integer'; // 默认类型
        }
    }

    /**
     * 获取默认值
     */
    private getDefaultValue(variableName: string): string {
        const lowerName = variableName.toLowerCase();
        
        if (lowerName.includes('count') || lowerName.includes('index')) {
            return '0';
        } else if (lowerName.includes('flag') || lowerName.includes('enabled')) {
            return 'false';
        } else if (lowerName.includes('text') || lowerName.includes('message')) {
            return '""';
        } else {
            return '0'; // 默认值
        }
    }

    /**
     * 生成变量名
     */
    private generateVariableName(text: string): string {
        // 简单的变量名生成逻辑
        const timestamp = Date.now().toString().slice(-4);
        return `extractedVar${timestamp}`;
    }

    /**
     * 生成函数名
     */
    private generateFunctionName(): string {
        const timestamp = Date.now().toString().slice(-4);
        return `ExtractedFunction${timestamp}`;
    }

    /**
     * 查找插入位置
     */
    private findInsertionPosition(document: vscode.TextDocument): vscode.Position {
        // 查找第一个非注释行
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text.trim();
            
            if (text && !text.startsWith('//') && !text.startsWith('/*')) {
                return new vscode.Position(i, 0);
            }
        }
        
        // 如果都是注释，返回第一行
        return new vscode.Position(0, 0);
    }
}
