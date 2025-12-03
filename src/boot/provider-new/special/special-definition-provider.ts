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
            // 检查配置是否启用
            if (!vscode.workspace.getConfiguration("jass").get<boolean>("literal", true)) {
                return null;
            }

            const locations: vscode.Location[] = [];
            const lineText = document.lineAt(position.line).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            const textAfterCursor = lineText.substring(position.character);

            const specialFileManager = SpecialFileManager.getInstance();
            let matchingLiterals: SpecialLiteral[] = [];
            let literalContent: string | null = null;

            // 检测是否在字符串字面量中（双引号）
            const stringMatch = textBeforeCursor.match(/"([^"]*)$/);
            if (stringMatch) {
                // 检查光标是否在字符串内（后面还有结束引号或没有引号）
                const contentBefore = stringMatch[1];
                // 检查后面是否有结束引号
                const hasClosingQuote = textAfterCursor.startsWith('"');
                // 提取完整内容（包括光标后的部分，直到结束引号）
                if (hasClosingQuote) {
                    const contentAfter = textAfterCursor.substring(1).match(/^[^"]*/)?.[0] || '';
                    literalContent = contentBefore + contentAfter;
                } else {
                    // 没有结束引号，只使用光标前的内容
                    literalContent = contentBefore;
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
                // 检测是否在数字字面量中
                else {
                    const numberMatch = textBeforeCursor.match(/\b(0[xX][0-9a-fA-F]*|0[bB][01]*|\$[0-9a-fA-F]*|[0-9]+)$/);
                    if (numberMatch) {
                        const numberBefore = numberMatch[0];
                        // 检查后面是否还有数字字符
                        const numberAfterMatch = textAfterCursor.match(/^[0-9a-fA-F]*/);
                        const numberAfter = numberAfterMatch ? numberAfterMatch[0] : '';
                        literalContent = numberBefore + numberAfter;
                        
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
                }
            }

            // 创建位置信息
            for (const literal of matchingLiterals) {
                try {
                    // 确保文件路径存在
                    const fs = require('fs');
                    if (!fs.existsSync(literal.filePath)) {
                        console.warn(`[SpecialDefinitionProvider] File not found: ${literal.filePath}`);
                        continue;
                    }

                    const uri = vscode.Uri.file(literal.filePath);
                    
                    // 计算正确的范围
                    // literal.column 是引号在行中的起始位置（match.index）
                    // 对于字符串和标记，column 是开始引号的位置
                    // 对于数字，column 是数字的起始位置
                    let startColumn: number;
                    let endColumn: number;
                    
                    if (literal.type === 'string' || literal.type === 'mark') {
                        // 字符串/标记：column 是引号位置，内容从 column+1 开始
                        startColumn = literal.column; // 开始引号位置
                        endColumn = literal.column + 1 + literal.content.length; // 结束引号位置
                    } else {
                        // 数字：column 是数字的起始位置
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
                    console.error(`[SpecialDefinitionProvider] Failed to create location for ${literal.filePath}:`, error);
                }
            }

            if (locations.length > 0) {
                console.log(`[SpecialDefinitionProvider] Found ${locations.length} definition(s) for "${literalContent || 'unknown'}"`);
                return locations;
            }

            return null;
        } catch (error) {
            console.error('Error in SpecialDefinitionProvider:', error);
            return null;
        }
    }
}

