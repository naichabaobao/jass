import * as vscode from 'vscode';
import { SpecialFileManager } from './special-file-manager';
import { SpecialLiteral } from './special-parser';

/**
 * 特殊文件悬停提供者
 */
export class SpecialHoverProvider implements vscode.HoverProvider {
    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | null> {
        try {
            // 检查配置是否启用（使用 literal.hover 配置项）
            if (!vscode.workspace.getConfiguration("jass").get<boolean>("literal.hover", true)) {
                return null;
            }

            const specialFileManager = SpecialFileManager.getInstance();
            // 等待初始化完成（最多等待2秒）
            try {
                await Promise.race([
                    specialFileManager.waitForInitialization(),
                    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
                ]);
            } catch (e) {
                console.warn('[SPECIAL-HOVER] Initialization wait failed or timed out');
            }

            const hoverContents: vscode.MarkdownString[] = [];
            const lineText = document.lineAt(position.line).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            const textAfterCursor = lineText.substring(position.character);

            let matchingLiterals: SpecialLiteral[] = [];
            let literalContent: string | null = null;
            let hoverRange: vscode.Range | undefined;

            // 检测是否在字符串字面量中（双引号）
            const stringMatch = textBeforeCursor.match(/"([^"]*)$/);
            if (stringMatch) {
                const contentBefore = stringMatch[1];
                const quoteStart = textBeforeCursor.lastIndexOf('"');
                // 在 textAfterCursor 中查找闭合引号（无论光标在哪里）
                const closingQuoteIndex = textAfterCursor.indexOf('"');
                if (closingQuoteIndex !== -1) {
                    const contentAfter = textAfterCursor.substring(0, closingQuoteIndex);
                    literalContent = contentBefore + contentAfter;
                    const quoteEnd = position.character + closingQuoteIndex + 1;
                    hoverRange = new vscode.Range(position.line, quoteStart, position.line, quoteEnd);
                } else {
                    literalContent = contentBefore;
                    hoverRange = new vscode.Range(position.line, quoteStart, position.line, position.character);
                }
                
                if (literalContent) {
                    matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                }
            }
            // 检测是否在标记字面量中（单引号）
            else {
                const markMatch = textBeforeCursor.match(/'([^']*)$/);
                if (markMatch) {
                    const contentBefore = markMatch[1];
                    const quoteStart = textBeforeCursor.lastIndexOf("'");
                    // 在 textAfterCursor 中查找闭合引号（无论光标在哪里）
                    const closingQuoteIndex = textAfterCursor.indexOf("'");
                    if (closingQuoteIndex !== -1) {
                        const contentAfter = textAfterCursor.substring(0, closingQuoteIndex);
                        literalContent = contentBefore + contentAfter;
                        const quoteEnd = position.character + closingQuoteIndex + 1;
                        hoverRange = new vscode.Range(position.line, quoteStart, position.line, quoteEnd);
                    } else {
                        literalContent = contentBefore;
                        hoverRange = new vscode.Range(position.line, quoteStart, position.line, position.character);
                    }
                    
                    if (literalContent) {
                        matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                    }
                }
                // 检测是否在数字字面量中
                else {
                    const numberMatch = textBeforeCursor.match(/\b(0[xX][0-9a-fA-F]*|0[bB][01]*|\$[0-9a-fA-F]*|[0-9]+)$/);
                    if (numberMatch) {
                        const numberBefore = numberMatch[0];
                        const numberAfterMatch = textAfterCursor.match(/^[0-9a-fA-F]*/);
                        const numberAfter = numberAfterMatch ? numberAfterMatch[0] : '';
                        literalContent = numberBefore + numberAfter;
                        
                        const numberStart = textBeforeCursor.length - numberBefore.length;
                        const numberEnd = position.character + numberAfter.length;
                        hoverRange = new vscode.Range(position.line, numberStart, position.line, numberEnd);
                        
                        if (literalContent) {
                            matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                        }
                    }
                    // 如果都不匹配，尝试使用单词范围
                    else {
                        const wordRange = document.getWordRangeAtPosition(position);
                        if (wordRange) {
                            hoverRange = wordRange;
                            const symbolName = document.getText(wordRange);
                            if (symbolName) {
                                matchingLiterals = specialFileManager.findLiteralsByContent(symbolName);
                            }
                        }
                    }
                }
            }

            for (const literal of matchingLiterals) {
                const content = this.createLiteralHoverContent(literal);
                if (content) {
                    hoverContents.push(content);
                }
            }

            if (hoverContents.length === 0) {
                return null;
            }

            return new vscode.Hover(hoverContents, hoverRange);
        } catch (error) {
            console.error('Error in SpecialHoverProvider:', error);
            return null;
        }
    }

    /**
     * 创建字面量悬停内容
     */
    private createLiteralHoverContent(literal: SpecialLiteral): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        
        const literalText = literal.type === 'string' ? `"${literal.content}"` :
                           literal.type === 'mark' ? `'${literal.content}'` :
                           literal.content;

        content.appendCodeblock(literalText, 'jass');
        
        if (literal.deprecated) {
            content.appendMarkdown('\n\n~~**Deprecated**~~');
        }

        if (literal.description) {
            content.appendMarkdown(`\n\n${literal.description}`);
        }

        content.appendMarkdown(`\n\n**File:** \`${this.getRelativePath(literal.filePath)}\``);
        content.appendMarkdown(`\n**Type:** ${literal.type}`);

        return content;
    }

    /**
     * 获取相对路径
     */
    private getRelativePath(filePath: string): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            try {
                return vscode.workspace.asRelativePath(filePath);
            } catch {
                return filePath;
            }
        }
        return filePath;
    }
}

