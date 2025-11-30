import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter';
import {
    BlockStatement,
    Statement,
    FunctionDeclaration,
    NativeDeclaration,
    MethodDeclaration,
    StructDeclaration,
    LibraryDeclaration,
    ModuleDeclaration,
    ScopeDeclaration,
    Identifier,
    CallExpression,
    Expression
} from '../vjass/vjass-ast';

/**
 * 函数调用信息
 */
interface CallInfo {
    /** 函数/方法名称 */
    name: string;
    /** 当前参数索引（从0开始） */
    activeParameter: number;
    /** 是否是方法调用 */
    isMethod: boolean;
    /** 方法所属的结构体名称（如果是方法调用） */
    structName?: string;
}

/**
 * 基于新 AST 系统的签名帮助提供者
 * 为 function 和 method 的参数提供提示支持
 */
export class SignatureHelpProvider implements vscode.SignatureHelpProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        // 检查是否在注释中
        const lineText = document.lineAt(position.line).text;
        if (/^\s*\/\//.test(lineText)) {
            return;
        }

        // 解析函数调用信息
        const callInfo = this.parseCallInfo(document, position);
        if (!callInfo) {
            return;
        }

        // 查找匹配的函数或方法
        const signatures = this.findSignatures(callInfo, document.uri.fsPath);

        if (signatures.length === 0) {
            return;
        }

        // 创建 SignatureHelp
        const signatureHelp = new vscode.SignatureHelp();
        signatureHelp.signatures = signatures;
        signatureHelp.activeSignature = 0;
        signatureHelp.activeParameter = callInfo.activeParameter;

        return signatureHelp;
    }

    /**
     * 解析当前位置的函数调用信息
     */
    private parseCallInfo(
        document: vscode.TextDocument,
        position: vscode.Position
    ): CallInfo | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        const textAfterCursor = lineText.substring(position.character);

        // 查找最外层的左括号（parenLevel === 0）
        let parenLevel = 0;
        let lastOpenParen = -1;
        let activeParameter = 0;

        // 从光标位置向前查找，找到最外层的左括号
        for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
            const char = textBeforeCursor[i];

            if (char === ')') {
                parenLevel++;
            } else if (char === '(') {
                if (parenLevel === 0) {
                    // 找到最外层的左括号
                    lastOpenParen = i;
                    break;
                }
                parenLevel--;
            }
        }

        if (lastOpenParen === -1) {
            return null;
        }

        // 从最外层左括号到光标位置，计算参数索引
        // 需要正确处理嵌套的函数调用
        parenLevel = 0;
        for (let i = lastOpenParen + 1; i < position.character; i++) {
            const char = textBeforeCursor[i];
            
            if (char === '(') {
                parenLevel++;
            } else if (char === ')') {
                parenLevel--;
            } else if (char === ',' && parenLevel === 0) {
                // 只有在最外层（parenLevel === 0）时才计数逗号
                activeParameter++;
            }
        }

        // 提取函数/方法名称
        const textBeforeParen = textBeforeCursor.substring(0, lastOpenParen).trim();
        const nameMatch = this.extractFunctionName(textBeforeParen);
        if (!nameMatch) {
            return null;
        }

        return {
            name: nameMatch.name,
            activeParameter: activeParameter,
            isMethod: nameMatch.isMethod,
            structName: nameMatch.structName
        };
    }

    /**
     * 从文本中提取函数/方法名称
     */
    private extractFunctionName(text: string): { name: string; isMethod: boolean; structName?: string } | null {
        // 移除空白字符
        text = text.trim();

        // 检查是否是方法调用（如 obj.method 或 StructName.method）
        const methodMatch = text.match(/(\w+)\s*\.\s*(\w+)\s*$/);
        if (methodMatch) {
            return {
                name: methodMatch[2],
                isMethod: true,
                structName: methodMatch[1]
            };
        }

        // 检查是否是普通函数调用
        const funcMatch = text.match(/(\w+)\s*$/);
        if (funcMatch) {
            return {
                name: funcMatch[1],
                isMethod: false
            };
        }

        return null;
    }

    /**
     * 查找匹配的函数或方法签名
     */
    private findSignatures(
        callInfo: CallInfo,
        currentFilePath: string
    ): vscode.SignatureInformation[] {
        const signatures: vscode.SignatureInformation[] = [];

        // 从所有缓存的文件中查找
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            // 查找函数声明
            if (!callInfo.isMethod) {
                this.findFunctionsInBlock(blockStatement, callInfo.name, signatures);
            }

            // 查找方法声明
            if (callInfo.isMethod) {
                this.findMethodsInBlock(blockStatement, callInfo.name, callInfo.structName, signatures);
            }
        }

        return signatures;
    }

    /**
     * 在 BlockStatement 中查找函数声明
     */
    private findFunctionsInBlock(
        block: BlockStatement,
        functionName: string,
        signatures: vscode.SignatureInformation[]
    ): void {
        for (const stmt of block.body) {
            // 函数声明
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    const signature = this.createFunctionSignature(stmt);
                    signatures.push(signature);
                }
            }
            // Native 函数声明
            else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    const signature = this.createNativeSignature(stmt);
                    signatures.push(signature);
                }
            }
            // Library 声明（递归查找其成员）
            else if (stmt instanceof LibraryDeclaration) {
                // Library 的 members 是 Statement[]，直接查找其中的函数和 native
                for (const member of stmt.members) {
                    if (member instanceof FunctionDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createFunctionSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof NativeDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createNativeSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof BlockStatement) {
                        this.findFunctionsInBlock(member, functionName, signatures);
                    }
                }
            }
            // Module 声明（递归查找其成员）
            else if (stmt instanceof ModuleDeclaration) {
                // Module 的 members 是 Statement[]，直接查找其中的函数和 native
                for (const member of stmt.members) {
                    if (member instanceof FunctionDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createFunctionSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof NativeDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createNativeSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof BlockStatement) {
                        this.findFunctionsInBlock(member, functionName, signatures);
                    }
                }
            }
            // Scope 声明（递归查找其成员）
            else if (stmt instanceof ScopeDeclaration) {
                // Scope 的 members 是 Statement[]，直接查找其中的函数和 native
                for (const member of stmt.members) {
                    if (member instanceof FunctionDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createFunctionSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof NativeDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            const signature = this.createNativeSignature(member);
                            signatures.push(signature);
                        }
                    } else if (member instanceof BlockStatement) {
                        this.findFunctionsInBlock(member, functionName, signatures);
                    }
                }
            }
            // 递归查找嵌套的 BlockStatement（如模块、结构体等）
            else if (stmt instanceof BlockStatement) {
                this.findFunctionsInBlock(stmt, functionName, signatures);
            }
        }
    }

    /**
     * 在 BlockStatement 中查找方法声明
     */
    private findMethodsInBlock(
        block: BlockStatement,
        methodName: string,
        structName: string | undefined,
        signatures: vscode.SignatureInformation[]
    ): void {
        for (const stmt of block.body) {
            // 查找结构体声明
            if (stmt instanceof StructDeclaration) {
                // 如果指定了结构体名称，检查是否匹配
                // 如果没有指定，则查找所有结构体中的同名方法
                if (structName && stmt.name && stmt.name.name !== structName) {
                    continue;
                }

                // 在结构体的成员中查找方法
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.name && member.name.name === methodName) {
                            const signature = this.createMethodSignature(
                                member,
                                stmt.name?.name
                            );
                            signatures.push(signature);
                        }
                    }
                }
            }

            // 递归查找嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.findMethodsInBlock(stmt, methodName, structName, signatures);
            }
        }
    }

    /**
     * 创建函数签名信息
     */
    private createFunctionSignature(func: FunctionDeclaration): vscode.SignatureInformation {
        const name = func.name?.name || 'unknown';
        const params = func.parameters.map(p => {
            const typeStr = p.type ? p.type.toString() : 'unknown';
            return `${typeStr} ${p.name.name}`;
        }).join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';

        const label = `function ${name}(${params || 'nothing'}) -> ${returnType}`;

        const signature = new vscode.SignatureInformation(label);

        // 设置参数信息
        signature.parameters = func.parameters.map(param => {
            const typeStr = param.type ? param.type.toString() : 'unknown';
            const paramName = param.name.name;
            return new vscode.ParameterInformation(
                `${typeStr} ${paramName}`,
                `Type: ${typeStr}`
            );
        });

        // 创建文档
        const doc = new vscode.MarkdownString();
        doc.appendMarkdown(`### function ${name}\n\n`);
        doc.appendCodeblock(label, 'jass');
        doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n\n`);

        if (func.parameters.length > 0) {
            func.parameters.forEach((param, index) => {
                const typeStr = param.type ? param.type.toString() : 'unknown';
                doc.appendMarkdown(`- \`${param.name.name}\`: \`${typeStr}\`\n`);
            });
        }

        signature.documentation = doc;

        return signature;
    }

    /**
     * 创建 Native 函数签名信息
     */
    private createNativeSignature(native: NativeDeclaration): vscode.SignatureInformation {
        const name = native.name?.name || 'unknown';
        const params = native.parameters.map(p => {
            const typeStr = p.type ? p.type.toString() : 'unknown';
            return `${typeStr} ${p.name.name}`;
        }).join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';
        const constantStr = native.isConstant ? 'constant ' : '';

        // native 本身就等价于 function，不需要额外的 function 关键字
        const label = `${constantStr}native ${name}(${params || 'nothing'}) -> ${returnType}`;

        const signature = new vscode.SignatureInformation(label);

        // 设置参数信息
        signature.parameters = native.parameters.map(param => {
            const typeStr = param.type ? param.type.toString() : 'unknown';
            const paramName = param.name.name;
            return new vscode.ParameterInformation(
                `${typeStr} ${paramName}`,
                `Type: ${typeStr}`
            );
        });

        // 创建文档
        const doc = new vscode.MarkdownString();
        // native 本身就等价于 function，不需要额外的 function 关键字
        doc.appendMarkdown(`### ${constantStr}native ${name}\n\n`);
        doc.appendCodeblock(label, 'jass');
        doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n\n`);

        if (native.parameters.length > 0) {
            native.parameters.forEach((param, index) => {
                const typeStr = param.type ? param.type.toString() : 'unknown';
                doc.appendMarkdown(`- \`${param.name.name}\`: \`${typeStr}\`\n`);
            });
        }

        signature.documentation = doc;

        return signature;
    }

    /**
     * 创建方法签名信息
     */
    private createMethodSignature(method: MethodDeclaration, structName?: string): vscode.SignatureInformation {
        const name = method.name?.name || 'unknown';
        const params = method.parameters.map(p => {
            const typeStr = p.type ? p.type.toString() : 'unknown';
            return `${typeStr} ${p.name.name}`;
        }).join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        const structPrefix = structName ? `${structName}.` : '';

        const label = `${staticStr}method ${structPrefix}${name}(${params || 'nothing'}) -> ${returnType}`;

        const signature = new vscode.SignatureInformation(label);

        // 设置参数信息
        signature.parameters = method.parameters.map(param => {
            const typeStr = param.type ? param.type.toString() : 'unknown';
            const paramName = param.name.name;
            return new vscode.ParameterInformation(
                `${typeStr} ${paramName}`,
                `Type: ${typeStr}`
            );
        });

        // 创建文档
        const doc = new vscode.MarkdownString();
        doc.appendMarkdown(`### method ${structPrefix}${name}\n\n`);
        doc.appendCodeblock(label, 'jass');
        doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n\n`);

        if (method.parameters.length > 0) {
            method.parameters.forEach((param, index) => {
                const typeStr = param.type ? param.type.toString() : 'unknown';
                doc.appendMarkdown(`- \`${param.name.name}\`: \`${typeStr}\`\n`);
            });
        }

        signature.documentation = doc;

        return signature;
    }
}

