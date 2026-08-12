import * as vscode from 'vscode';
import * as fs from 'fs';
import { SpecialFileManager } from './special-file-manager';
import { SpecialLiteral } from './special-parser';

/**
 * 特殊文件定义提供者
 */
export class SpecialDefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        try {
            // 检查配置是否启用（使用 literal.hover 配置项）
            const hoverEnabled = vscode.workspace.getConfiguration("jass").get<boolean>("literal.hover", true);
            if (!hoverEnabled) {
                return null;
            }

            const locations: vscode.Location[] = [];
            const lineText = document.lineAt(position.line).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            const textAfterCursor = lineText.substring(position.character);

            const specialFileManager = SpecialFileManager.getInstance();
            let matchingLiterals: SpecialLiteral[] = [];
            let literalContent: string | null = null;

            // 统计光标前引号数量，判断是否真正在未闭合的字面量内
            const countChar = (str: string, ch: string) => {
                let count = 0;
                for (const c of str) if (c === ch) count++;
                return count;
            };
            const doubleQuoteCount = countChar(textBeforeCursor, '"');
            const singleQuoteCount = countChar(textBeforeCursor, "'");
            const insideString = doubleQuoteCount % 2 === 1;
            const insideMark = singleQuoteCount % 2 === 1;

            // 先检测数字字面量（与引号无关，不会误匹配）
            const numberMatch = textBeforeCursor.match(/\b(0[xX][0-9a-fA-F]*|0[bB][01]*|\$[0-9a-fA-F]*|[0-9]+)$/);
            if (numberMatch && !insideString && !insideMark) {
                const numberBefore = numberMatch[0];
                const numberAfterMatch = textAfterCursor.match(/^[0-9a-fA-F]*/);
                const numberAfter = numberAfterMatch ? numberAfterMatch[0] : '';
                literalContent = numberBefore + numberAfter;

                if (literalContent) {
                    matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                }
            }
            // 检测是否在字符串字面量中（双引号） - 必须真正在未闭合引号内
            else if (insideString) {
                const quoteStart = textBeforeCursor.lastIndexOf('"');
                const contentBefore = textBeforeCursor.substring(quoteStart + 1);
                const hasClosingQuote = textAfterCursor.startsWith('"');
                if (hasClosingQuote) {
                    const contentAfter = textAfterCursor.substring(1).match(/^[^"]*/)?.[0] || '';
                    literalContent = contentBefore + contentAfter;
                } else {
                    literalContent = contentBefore;
                }

                if (literalContent) {
                    matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                }
            }
            // 检测是否在标记字面量中（单引号/四字码） - 必须真正在未闭合引号内
            else if (insideMark) {
                const quoteStart = textBeforeCursor.lastIndexOf("'");
                const contentBefore = textBeforeCursor.substring(quoteStart + 1);
                const hasClosingQuote = textAfterCursor.startsWith("'");
                if (hasClosingQuote) {
                    const contentAfter = textAfterCursor.substring(1).match(/^[^']*/)?.[0] || '';
                    literalContent = contentBefore + contentAfter;
                } else {
                    literalContent = contentBefore;
                }

                if (literalContent) {
                    matchingLiterals = specialFileManager.findLiteralsByContent(literalContent);
                }
            }
            // 如果都不匹配，尝试使用单词范围
            else {
                const wordRange = document.getWordRangeAtPosition(position);
                if (wordRange) {
                    const symbolName = document.getText(wordRange);
                    if (symbolName) {
                        matchingLiterals = specialFileManager.findLiteralsByContent(symbolName);
                    }
                }
            }

            // 创建位置信息
            for (const literal of matchingLiterals) {
                try {
                    if (!fs.existsSync(literal.filePath)) {
                        continue;
                    }

                    const uri = vscode.Uri.file(literal.filePath);

                    let startColumn: number;
                    let endColumn: number;

                    if (literal.type === 'string' || literal.type === 'mark') {
                        startColumn = literal.column;
                        endColumn = literal.column + 1 + literal.content.length;
                    } else {
                        startColumn = literal.column;
                        endColumn = literal.column + literal.content.length;
                    }

                    const location = new vscode.Location(
                        uri,
                        new vscode.Range(
                            literal.line,
                            startColumn,
                            literal.line,
                            endColumn
                        )
                    );
                    locations.push(location);
                } catch (error) {
                    console.error(`[SpecialDefinitionProvider] Failed to create location:`, error);
                }
            }

            if (locations.length > 0) {
                return locations;
            }

            return null;
        } catch (error) {
            console.error('Error in SpecialDefinitionProvider:', error);
            return null;
        }
    }
}
