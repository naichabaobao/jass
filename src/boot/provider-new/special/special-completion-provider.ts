import * as vscode from 'vscode';
import { SpecialFileManager } from './special-file-manager';
import { SpecialLiteral } from './special-parser';

/**
 * 特殊文件补全提供者
 * 用于提供 strings.jass, presets.jass, numbers.jass 文件的补全
 */
export class SpecialCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        try {
            // 检查配置是否启用
            const literalEnabled = vscode.workspace.getConfiguration("jass").get<boolean>("literal", true);
            if (!literalEnabled) {
                console.log('[SpecialCompletionProvider] literal feature is disabled');
                return [];
            }

            const items: vscode.CompletionItem[] = [];
            const lineText = document.lineAt(position.line).text;
            const textBeforeCursor = lineText.substring(0, position.character);

            // 检测字面量上下文
            const literalContext = this.detectLiteralContext(textBeforeCursor);
            if (!literalContext) {
                // 调试：记录为什么没有检测到上下文
                console.log(`[SpecialCompletionProvider] No literal context detected. Text before cursor: "${textBeforeCursor}"`);
                return [];
            }

            console.log(`[SpecialCompletionProvider] Detected context: type=${literalContext.type}, prefix="${literalContext.prefix}"`);

            const specialFileManager = SpecialFileManager.getInstance();
            const allLiterals = specialFileManager.getAllLiterals();
            
            console.log(`[SpecialCompletionProvider] Total literals: ${allLiterals.length}`);

            if (allLiterals.length === 0) {
                console.warn('[SpecialCompletionProvider] No literals found in SpecialFileManager. Make sure special files are loaded.');
                return [];
            }

            // 根据上下文类型过滤字面量
            const filteredLiterals = allLiterals.filter(literal => {
                if (literal.type !== literalContext.type) {
                    return false;
                }
                // 如果已有前缀，进行过滤
                if (literalContext.prefix) {
                    return literal.content.toLowerCase().startsWith(literalContext.prefix.toLowerCase());
                }
                return true;
            });

            console.log(`[SpecialCompletionProvider] Filtered literals: ${filteredLiterals.length} for type ${literalContext.type}`);

            // 创建补全项
            for (const literal of filteredLiterals) {
                // Label 显示完整字面量（包含引号）
                const label = literal.type === 'string' ? `"${literal.content}"` :
                             literal.type === 'mark' ? `'${literal.content}'` :
                             literal.content;
                
                const item = new vscode.CompletionItem(
                    label,
                    vscode.CompletionItemKind.Value
                );

                // insertText 只插入内容部分（不包含引号），因为用户已经输入了引号
                if (literalContext.type === 'string') {
                    // 字符串：只插入内容，不包含结束引号（用户会自己输入或自动补全）
                    item.insertText = literal.content;
                    // 设置 range，替换从引号后到光标位置的内容
                    const quoteStart = textBeforeCursor.lastIndexOf('"');
                    if (quoteStart >= 0) {
                        item.range = new vscode.Range(
                            position.line,
                            quoteStart + 1, // 引号后的位置
                            position.line,
                            position.character
                        );
                    }
                } else if (literalContext.type === 'mark') {
                    // 标记：只插入内容，不包含结束单引号
                    item.insertText = literal.content;
                    // 设置 range，替换从单引号后到光标位置的内容
                    const quoteStart = textBeforeCursor.lastIndexOf("'");
                    if (quoteStart >= 0) {
                        item.range = new vscode.Range(
                            position.line,
                            quoteStart + 1, // 单引号后的位置
                            position.line,
                            position.character
                        );
                    }
                } else {
                    // 数字：需要根据用户已输入的前缀来决定插入什么
                    // 如果用户已经输入了 0x、$、0b 等前缀，只插入数字部分
                    // 否则插入完整内容
                    const numberPrefix = this.detectNumberPrefix(textBeforeCursor);
                    if (numberPrefix) {
                        // 用户已经输入了前缀，只插入数字部分
                        if (literal.content.startsWith(numberPrefix)) {
                            item.insertText = literal.content.substring(numberPrefix.length);
                        } else {
                            // 如果字面量不匹配前缀，插入完整内容
                            item.insertText = literal.content;
                        }
                        // 设置 range，替换从前缀后到光标位置的内容
                        const prefixStart = textBeforeCursor.lastIndexOf(numberPrefix);
                        if (prefixStart >= 0) {
                            item.range = new vscode.Range(
                                position.line,
                                prefixStart + numberPrefix.length,
                                position.line,
                                position.character
                            );
                        }
                    } else {
                        // 用户没有输入前缀，插入完整内容
                        item.insertText = literal.content;
                    }
                }

                item.detail = `${literal.type} literal`;
                item.sortText = `~Z_${literal.content}`;

                // 添加文档
                if (literal.description) {
                    const doc = new vscode.MarkdownString();
                    doc.appendCodeblock(literal.type === 'string' ? `"${literal.content}"` :
                                       literal.type === 'mark' ? `'${literal.content}'` :
                                       literal.content);
                    if (literal.description) {
                        doc.appendMarkdown(`\n\n${literal.description}`);
                    }
                    doc.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(literal.filePath)}\``);
                    item.documentation = doc;
                }

                // 标记废弃
                if (literal.deprecated) {
                    item.tags = [vscode.CompletionItemTag.Deprecated];
                }

                items.push(item);
            }

            console.log(`[SpecialCompletionProvider] Returning ${items.length} completion items`);
            return items;
        } catch (error) {
            console.error('Error in SpecialCompletionProvider:', error);
            return [];
        }
    }

    /**
     * 检测字面量上下文
     */
    private detectLiteralContext(textBeforeCursor: string): { type: 'string' | 'mark' | 'number'; prefix: string } | null {
        // 检测字符串字面量（双引号）
        // 匹配：在引号内，或者刚输入引号
        const stringMatch = textBeforeCursor.match(/"([^"]*)$/);
        if (stringMatch) {
            return { type: 'string', prefix: stringMatch[1] };
        }

        // 检测标记字面量（单引号）
        // 匹配：在单引号内，或者刚输入单引号
        // 注意：单引号内可以包含数字、字母等任何字符
        const markMatch = textBeforeCursor.match(/'([^']*)$/);
        if (markMatch) {
            return { type: 'mark', prefix: markMatch[1] };
        }

        // 检测数字字面量（数字、0x、$、0b）
        // 匹配：数字、十六进制（0x、$）、二进制（0b）
        const numberMatch = textBeforeCursor.match(/\b(0[xX][0-9a-fA-F]*|0[bB][01]*|\$[0-9a-fA-F]*|[0-9]+)$/);
        if (numberMatch) {
            const number = numberMatch[0];
            // 提取前缀（去掉前缀符号）
            let prefix = number;
            if (number.startsWith('0x') || number.startsWith('0X')) {
                prefix = number.substring(2);
            } else if (number.startsWith('0b') || number.startsWith('0B')) {
                prefix = number.substring(2);
            } else if (number.startsWith('$')) {
                prefix = number.substring(1);
            }
            return { type: 'number', prefix };
        }

        return null;
    }

    /**
     * 检测用户已输入的数字前缀
     */
    private detectNumberPrefix(textBeforeCursor: string): string | null {
        // 检测 0x 或 0X
        if (textBeforeCursor.match(/0[xX][0-9a-fA-F]*$/)) {
            return textBeforeCursor.match(/0[xX]/)?.[0] || null;
        }
        // 检测 0b 或 0B
        if (textBeforeCursor.match(/0[bB][01]*$/)) {
            return textBeforeCursor.match(/0[bB]/)?.[0] || null;
        }
        // 检测 $ 前缀
        if (textBeforeCursor.match(/\$[0-9a-fA-F]*$/)) {
            return '$';
        }
        return null;
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

