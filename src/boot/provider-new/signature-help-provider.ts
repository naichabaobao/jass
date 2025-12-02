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
    Expression,
    ImplementStatement,
    VariableDeclaration
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
    /** 是否是静态方法调用 */
    isStatic?: boolean;
    /** 是否是 this 调用 */
    isThis?: boolean;
    /** 是否是 thistype 调用 */
    isThistype?: boolean;
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
        const nameMatch = this.extractFunctionName(textBeforeParen, document, position);
        if (!nameMatch) {
            return null;
        }

        return {
            name: nameMatch.name,
            activeParameter: activeParameter,
            isMethod: nameMatch.isMethod,
            structName: nameMatch.structName,
            isStatic: nameMatch.isStatic,
            isThis: nameMatch.isThis,
            isThistype: nameMatch.isThistype
        };
    }

    /**
     * 从文本中提取函数/方法名称
     */
    private extractFunctionName(
        text: string,
        document: vscode.TextDocument,
        position: vscode.Position
    ): { name: string; isMethod: boolean; structName?: string; isStatic?: boolean; isThis?: boolean; isThistype?: boolean } | null {
        // 移除空白字符
        text = text.trim();

        // 检查是否是方法调用（如 obj.method、this.method、thistype.method 或 StructName.method）
        const methodMatch = text.match(/(\w+)\s*\.\s*(\w+)\s*$/);
        if (methodMatch) {
            const objectName = methodMatch[1].toLowerCase();
            const methodName = methodMatch[2];
            
            // 检查是否是 this 或 thistype
            if (objectName === 'this') {
                // this.method() - 实例方法调用
                const currentStruct = this.findCurrentStruct(document, position);
                if (currentStruct && currentStruct.name) {
                    return {
                        name: methodName,
                        isMethod: true,
                        structName: currentStruct.name.name,
                        isStatic: false,
                        isThis: true,
                        isThistype: false
                    };
                }
            }
            
            if (objectName === 'thistype') {
                // thistype.method() - 静态方法调用
                const currentStruct = this.findCurrentStruct(document, position);
                if (currentStruct && currentStruct.name) {
                    return {
                        name: methodName,
                        isMethod: true,
                        structName: currentStruct.name.name,
                        isStatic: true,
                        isThis: false,
                        isThistype: true
                    };
                }
            }
            
            // 尝试变量类型推断
            const variableType = this.findVariableType(document, position, methodMatch[1]);
            if (variableType) {
                // 找到了变量类型，这是实例方法调用
                return {
                    name: methodName,
                    isMethod: true,
                    structName: variableType,
                    isStatic: false,
                    isThis: false,
                    isThistype: false
                };
            }
            
            // 普通方法调用（如 obj.method 或 StructName.method）
            const originalObjectName = methodMatch[1];
            const isStatic = originalObjectName[0] === originalObjectName[0].toUpperCase();
            
            return {
                name: methodName,
                isMethod: true,
                structName: originalObjectName,
                isStatic: isStatic,
                isThis: false,
                isThistype: false
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
                this.findMethodsInBlock(
                    blockStatement,
                    callInfo.name,
                    callInfo.structName,
                    callInfo.isStatic,
                    signatures
                );
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
        isStatic: boolean | undefined,
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
                            // 检查 static 匹配
                            if (isStatic !== undefined) {
                                if (isStatic && !member.isStatic) {
                                    continue;
                                }
                                if (!isStatic && member.isStatic) {
                                    continue;
                                }
                            }
                            
                            const signature = this.createMethodSignature(
                                member,
                                stmt.name?.name
                            );
                            signatures.push(signature);
                        }
                    }
                }
                
                // 查找实现的 module 中的方法
                this.findModuleMethods(stmt, methodName, isStatic, signatures);
                
                // 查找内置方法
                this.findBuiltinMethods(stmt, methodName, isStatic, signatures);
            }

            // 递归查找嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.findMethodsInBlock(stmt, methodName, structName, isStatic, signatures);
            }
        }
    }
    
    /**
     * 查找 module 中的方法
     */
    private findModuleMethods(
        struct: StructDeclaration,
        methodName: string,
        isStatic: boolean | undefined,
        signatures: vscode.SignatureInformation[]
    ): void {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        // 查找 struct 实现的 module
        for (const member of struct.members) {
            if (member instanceof ImplementStatement) {
                const moduleName = member.moduleName.name;
                
                // 在所有文件中查找 module
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }
                    
                    const module = this.findModuleInBlock(blockStatement, moduleName);
                    if (module) {
                        // 在 module 中查找方法
                        for (const moduleMember of module.members) {
                            if (moduleMember instanceof MethodDeclaration) {
                                if (moduleMember.name && moduleMember.name.name === methodName) {
                                    // 检查 static 匹配
                                    if (isStatic !== undefined) {
                                        if (isStatic && !moduleMember.isStatic) {
                                            continue;
                                        }
                                        if (!isStatic && moduleMember.isStatic) {
                                            continue;
                                        }
                                    }
                                    
                                    const signature = this.createMethodSignature(
                                        moduleMember,
                                        struct.name?.name,
                                        module.name?.name
                                    );
                                    signatures.push(signature);
                                }
                            } else if (moduleMember instanceof ImplementStatement) {
                                // 递归处理嵌套 module
                                const nestedModuleName = moduleMember.moduleName.name;
                                for (const nestedFilePath of allCachedFiles) {
                                    const nestedBlock = this.dataEnterManager.getBlockStatement(nestedFilePath);
                                    if (!nestedBlock) continue;
                                    const nestedModule = this.findModuleInBlock(nestedBlock, nestedModuleName);
                                    if (nestedModule) {
                                        for (const nestedMember of nestedModule.members) {
                                            if (nestedMember instanceof MethodDeclaration) {
                                                if (nestedMember.name && nestedMember.name.name === methodName) {
                                                    if (isStatic !== undefined) {
                                                        if (isStatic && !nestedMember.isStatic) continue;
                                                        if (!isStatic && nestedMember.isStatic) continue;
                                                    }
                                                    const signature = this.createMethodSignature(
                                                        nestedMember,
                                                        struct.name?.name,
                                                        nestedModule.name?.name
                                                    );
                                                    signatures.push(signature);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * 在 BlockStatement 中查找 module
     */
    private findModuleInBlock(block: BlockStatement, moduleName: string): ModuleDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof ModuleDeclaration && stmt.name && stmt.name.name === moduleName) {
                return stmt;
            }
            if (stmt instanceof BlockStatement) {
                const found = this.findModuleInBlock(stmt, moduleName);
                if (found) return found;
            }
        }
        return null;
    }
    
    /**
     * 查找内置方法签名
     */
    private findBuiltinMethods(
        struct: StructDeclaration,
        methodName: string,
        isStatic: boolean | undefined,
        signatures: vscode.SignatureInformation[]
    ): void {
        const structName = struct.name?.name || 'unknown';
        
        // allocate() - 静态私有方法
        if (methodName === 'allocate' && isStatic) {
            const createMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            ) as MethodDeclaration | undefined;
            
            let paramsStr = 'nothing';
            if (createMethod && createMethod.parameters.length > 0) {
                paramsStr = createMethod.parameters
                    .map(p => {
                        const typeStr = p.type ? p.type.toString() : 'unknown';
                        return `${typeStr} ${p.name.name}`;
                    })
                    .join(', ');
            }
            
            const signature = new vscode.SignatureInformation(
                `private static method allocate(${paramsStr}) -> ${structName}`
            );
            signature.parameters = createMethod ? createMethod.parameters.map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return new vscode.ParameterInformation(
                    `${typeStr} ${p.name.name}`,
                    `Type: ${typeStr}`
                );
            }) : [];
            
            const doc = new vscode.MarkdownString();
            doc.appendMarkdown(`### private static method allocate\n\n`);
            doc.appendCodeblock(`private static method allocate takes ${paramsStr} returns ${structName}`, 'jass');
            doc.appendMarkdown(`\n**内置方法** - 为该结构分配唯一的实例 ID\n\n`);
            signature.documentation = doc;
            
            signatures.push(signature);
        }
        
        // create() - 静态方法
        if (methodName === 'create' && isStatic) {
            const createMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            ) as MethodDeclaration | undefined;
            
            if (createMethod) {
                const signature = this.createMethodSignature(createMethod, structName);
                signatures.push(signature);
            } else {
                // 默认 create 方法
                const signature = new vscode.SignatureInformation(
                    `static method create() -> ${structName}`
                );
                signature.parameters = [];
                const doc = new vscode.MarkdownString();
                doc.appendMarkdown(`### static method create\n\n`);
                doc.appendCodeblock(`static method create takes nothing returns ${structName}`, 'jass');
                doc.appendMarkdown(`\n**内置方法** - 创建结构实例（默认调用 allocate）\n\n`);
                signature.documentation = doc;
                signatures.push(signature);
            }
        }
        
        // destroy() - 实例或静态方法
        if (methodName === 'destroy') {
            const destroyMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.name?.name === 'destroy' && 
                     (isStatic === undefined || m.isStatic === isStatic)
            ) as MethodDeclaration | undefined;
            
            if (destroyMethod) {
                const signature = this.createMethodSignature(destroyMethod, structName);
                signatures.push(signature);
            } else if (isStatic === undefined || !isStatic) {
                // 默认 destroy 方法（实例方法）
                const signature = new vscode.SignatureInformation(
                    `method destroy() -> nothing`
                );
                signature.parameters = [];
                const doc = new vscode.MarkdownString();
                doc.appendMarkdown(`### method destroy\n\n`);
                doc.appendCodeblock(`method destroy takes nothing returns nothing`, 'jass');
                doc.appendMarkdown(`\n**内置方法** - 销毁结构实例\n\n`);
                signature.documentation = doc;
                signatures.push(signature);
            }
        }
        
        // deallocate() - 实例方法
        if (methodName === 'deallocate' && !isStatic) {
            const signature = new vscode.SignatureInformation(
                `method deallocate() -> nothing`
            );
            signature.parameters = [];
            const doc = new vscode.MarkdownString();
            doc.appendMarkdown(`### method deallocate\n\n`);
            doc.appendCodeblock(`method deallocate takes nothing returns nothing`, 'jass');
            doc.appendMarkdown(`\n**内置方法** - 调用默认的 destroy 方法\n\n`);
            signature.documentation = doc;
            signatures.push(signature);
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
     * 创建方法签名信息（支持 module 信息）
     */
    private createMethodSignature(
        method: MethodDeclaration,
        structName?: string,
        moduleName?: string
    ): vscode.SignatureInformation {
        const name = method.name?.name || 'unknown';
        const params = method.parameters.map(p => {
            const typeStr = p.type ? p.type.toString() : 'unknown';
            return `${typeStr} ${p.name.name}`;
        }).join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        const structPrefix = structName ? `${structName}.` : '';
        const moduleSuffix = moduleName ? ` (from module ${moduleName})` : '';

        const label = `${staticStr}method ${structPrefix}${name}(${params || 'nothing'}) -> ${returnType}${moduleSuffix}`;

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
        
        if (moduleName) {
            doc.appendMarkdown(`**来自模块:** \`${moduleName}\`\n\n`);
        }

        if (method.parameters.length > 0) {
            method.parameters.forEach((param, index) => {
                const typeStr = param.type ? param.type.toString() : 'unknown';
                doc.appendMarkdown(`- \`${param.name.name}\`: \`${typeStr}\`\n`);
            });
        }

        signature.documentation = doc;

        return signature;
    }
    
    /**
     * 查找当前位置所在的 struct
     */
    private findCurrentStruct(
        document: vscode.TextDocument,
        position: vscode.Position
    ): StructDeclaration | null {
        const filePath = document.uri.fsPath;
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        if (!blockStatement) {
            return null;
        }
        
        return this.findContainingStruct(blockStatement, position);
    }
    
    /**
     * 查找包含指定位置的 struct
     */
    private findContainingStruct(
        block: BlockStatement,
        position: vscode.Position
    ): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.start && stmt.end) {
                    if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                        return stmt;
                    }
                }
            }
            
            if (stmt instanceof BlockStatement) {
                const found = this.findContainingStruct(stmt, position);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 查找包含指定位置的函数声明
     */
    private findContainingFunction(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | null {
        try {
            let bestMatch: FunctionDeclaration | null = null;
            let bestMatchScore = -1;

            for (const stmt of block.body) {
                if (stmt instanceof FunctionDeclaration) {
                    // 检查位置是否在函数声明范围内（包括 endfunction 行）
                    if (stmt.start && stmt.end) {
                        const funcStartLine = stmt.start.line;
                        const funcEndLine = stmt.end.line;
                        
                        // 基于行号的宽松匹配：位置在函数开始行和结束行之间（包括结束行）
                        // 允许位置在结束行的下一行（容错处理，因为位置信息可能不准确）
                        if (position.line >= funcStartLine && position.line <= funcEndLine + 1) {
                            const score = funcEndLine - funcStartLine;
                            if (score > bestMatchScore) {
                                bestMatch = stmt;
                                bestMatchScore = score;
                            }
                        }
                        
                        // 精确位置匹配
                        if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                            const score = funcEndLine - funcStartLine;
                            if (score > bestMatchScore) {
                                bestMatch = stmt;
                                bestMatchScore = score;
                            }
                        }
                    }
                    
                    // 也检查函数体范围（作为补充）
                    if (stmt.body && stmt.body.start && stmt.body.end) {
                        const bodyStartLine = stmt.body.start.line;
                        const bodyEndLine = stmt.body.end.line;
                        
                        // 如果函数体的结束行小于函数声明的结束行，使用函数声明的结束行
                        // 这样可以包含 endfunction 行
                        // 允许位置在结束行的下一行（容错处理）
                        const effectiveEndLine = stmt.end && stmt.end.line > bodyEndLine 
                            ? stmt.end.line + 1  // 允许在 endfunction 之后一行
                            : bodyEndLine + 1;   // 允许在函数体之后一行
                        
                        if (position.line >= bodyStartLine && position.line <= effectiveEndLine) {
                            const score = effectiveEndLine - bodyStartLine;
                            if (score > bestMatchScore) {
                                bestMatch = stmt;
                                bestMatchScore = score;
                            }
                        }
                    }
                }

                // 递归查找嵌套的 BlockStatement
                if (stmt instanceof BlockStatement) {
                    const nestedFunc = this.findContainingFunction(stmt, position);
                    if (nestedFunc) {
                        return nestedFunc; // 嵌套的函数优先级更高
                    }
                }
            }

            return bestMatch;
        } catch (error) {
            console.error('Error finding containing function:', error);
        }

        return null;
    }
    
    /**
     * 查找包含指定位置的方法声明
     */
    private findContainingMethod(
        block: BlockStatement,
        position: vscode.Position
    ): MethodDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.start && member.end) {
                            if (this.isPositionInRange(position, member.start, member.end)) {
                                return member;
                            }
                        }
                    }
                }
            }
            
            if (stmt instanceof BlockStatement) {
                const found = this.findContainingMethod(stmt, position);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 查找变量的类型（用于类型推断）
     * 查找顺序：1. local 变量 2. takes 参数 3. globals 变量
     */
    private findVariableType(
        document: vscode.TextDocument,
        position: vscode.Position,
        variableName: string
    ): string | null {
        const filePath = document.uri.fsPath;
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        if (!blockStatement) {
            return null;
        }
        
        // 查找包含当前位置的函数或方法
        const containingFunction = this.findContainingFunction(blockStatement, position);
        const containingMethod = this.findContainingMethod(blockStatement, position);
        
        // 1. 优先查找局部变量（local）
        if (containingFunction) {
            // 先查找函数体内的局部变量
            if (containingFunction.body) {
                const varType = this.findVariableInBlock(containingFunction.body, variableName, position);
                if (varType) {
                    return varType;
                }
            }
        }
        
        if (containingMethod) {
            // 先查找方法体内的局部变量
            if (containingMethod.body) {
                const varType = this.findVariableInBlock(containingMethod.body, variableName, position);
                if (varType) {
                    return varType;
                }
            }
        }
        
        // 2. 然后查找 takes 参数
        if (containingFunction) {
            const varType = this.findVariableInFunction(containingFunction, variableName, position);
            if (varType) {
                return varType;
            }
        }
        
        if (containingMethod) {
            const varType = this.findVariableInMethod(containingMethod, variableName, position);
            if (varType) {
                return varType;
            }
        }
        
        // 3. 最后查找 globals 变量
        return this.findVariableInGlobals(blockStatement, variableName);
    }
    
    /**
     * 在函数中查找变量类型（只查找 takes 参数）
     */
    private findVariableInFunction(
        func: FunctionDeclaration,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 只检查参数（takes）
        for (const param of func.parameters) {
            if (param.name.name === variableName) {
                if (param.type) {
                    return param.type.toString();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 在方法中查找变量类型（只查找 takes 参数）
     */
    private findVariableInMethod(
        method: MethodDeclaration,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 只检查参数（takes）
        for (const param of method.parameters) {
            if (param.name.name === variableName) {
                if (param.type) {
                    return param.type.toString();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 在 BlockStatement 中查找变量类型
     */
    private findVariableInBlock(
        block: BlockStatement,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 收集所有匹配的变量声明
        const candidates: { stmt: VariableDeclaration; priority: number }[] = [];
        
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                if (stmt.name.name === variableName) {
                    if (stmt.type) {
                        // 计算优先级：位置越靠前，优先级越高
                        let priority = 0;
                        if (stmt.start && stmt.start.line !== undefined) {
                            const stmtLine = stmt.start.line;
                            const posLine = position.line;
                            
                            if (stmtLine < posLine) {
                                // 变量在之前的行，优先级高
                                priority = 1000 - (posLine - stmtLine);
                            } else if (stmtLine === posLine) {
                                // 变量在同一行，检查列位置
                                // 对于 `call aaaaaa.` 这种情况，变量声明应该在点号之前
                                if (stmt.start.position !== undefined) {
                                    const stmtPos = stmt.start.position;
                                    const posChar = position.character;
                                    
                                    if (stmtPos < posChar) {
                                        // 变量在当前位置之前，优先级中等
                                        priority = 500 - (posChar - stmtPos);
                                    } else {
                                        // 变量在当前位置之后，但仍然在同一行
                                        // 可能是变量声明在调用之后，但这种情况不应该发生
                                        // 不过为了容错，给一个很低的优先级
                                        priority = 10;
                                    }
                                } else {
                                    // 没有列位置信息，但行号匹配，给一个较低的优先级
                                    // 这种情况可能是位置信息不完整，但仍然尝试使用
                                    priority = 100;
                                }
                            } else {
                                // 变量在当前位置之后的行，优先级为 0（不添加）
                                // 但如果是紧接的下一行，可能是位置信息有误差，给一个很低的优先级
                                if (stmtLine === posLine + 1) {
                                    priority = 5;
                                }
                            }
                        } else {
                            // 没有位置信息，优先级最低（但仍然考虑）
                            // 这对于位置信息不完整的情况很有用
                            priority = 1;
                        }
                        
                        if (priority > 0) {
                            candidates.push({ stmt, priority });
                        }
                    }
                }
            }
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                const varType = this.findVariableInBlock(stmt, variableName, position);
                if (varType) {
                    return varType;
                }
            }
        }
        
        // 如果有候选变量，选择优先级最高的
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.priority - a.priority);
            const bestMatch = candidates[0].stmt;
            if (bestMatch.type) {
                return bestMatch.type.toString();
            }
        }
        
        return null;
    }
    
    /**
     * 在 globals 块中查找变量类型
     */
    private findVariableInGlobals(
        block: BlockStatement,
        variableName: string
    ): string | null {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.name.name === variableName) {
                        if (stmt.type) {
                            return stmt.type.toString();
                        }
                    }
                }
            }
            return null;
        }
        
        // 递归查找嵌套的 BlockStatement
        for (const stmt of block.body) {
            if (stmt instanceof BlockStatement) {
                const varType = this.findVariableInGlobals(stmt, variableName);
                if (varType) {
                    return varType;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 检查是否是 globals 块
     */
    private isGlobalsBlock(block: BlockStatement): boolean {
        // globals 块应该只包含非 local 的 VariableDeclaration
        if (block.body.length === 0) {
            return false; // 空块不认为是 globals 块
        }
        
        // 检查是否所有语句都是非 local 的 VariableDeclaration
        // globals 块中不应该有其他类型的语句（如函数、结构体等）
        let hasGlobalVariable = false;
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                // 如果是 local 变量，则不是 globals 块
                if (stmt.isLocal) {
                    return false;
                }
                hasGlobalVariable = true;
            } else {
                // 如果包含非变量声明的语句，则不是 globals 块
                return false;
            }
        }
        
        // 至少需要有一个全局变量声明
        return hasGlobalVariable;
    }
    
    /**
     * 检查位置是否在范围内
     */
    private isPositionInRange(
        position: vscode.Position,
        start: { line: number; position: number },
        end: { line: number; position: number }
    ): boolean {
        // 防御性检查：如果位置信息无效，返回 false
        if (!start || !end || start.line === undefined || end.line === undefined) {
            return false;
        }

        const posLine = position.line;
        const posChar = position.character;
        const startLine = start.line;
        const endLine = end.line;

        // 检查行号范围
        if (posLine < startLine || posLine > endLine) {
            return false;
        }

        // 检查开始行的位置（如果位置信息完整）
        if (posLine === startLine && start.position !== undefined) {
            // 允许位置稍微宽松一些（允许在开始位置之前一点）
            // 这对于处理位置信息不准确的情况很有用
            if (posChar < start.position - 10) {  // 允许10个字符的误差
                return false;
            }
        }

        // 检查结束行的位置（如果位置信息完整）
        if (posLine === endLine && end.position !== undefined) {
            // 允许位置稍微宽松一些（允许在结束位置之后一点）
            if (posChar > end.position + 10) {  // 允许10个字符的误差
                return false;
            }
        }

        return true;
    }
    
    /**
     * 检查位置是否在范围之前
     */
    private isPositionBeforeRange(
        position: vscode.Position,
        start: { line: number; position: number }
    ): boolean {
        if (!start || start.line === undefined) {
            return false;
        }

        const posLine = position.line;
        const posChar = position.character;
        const startLine = start.line;

        if (posLine < startLine) {
            return true;
        }

        if (posLine === startLine && start.position !== undefined) {
            // 允许位置稍微宽松一些（允许在开始位置之前一点）
            // 这对于处理位置信息不准确的情况很有用
            if (posChar < start.position + 10) {  // 允许10个字符的误差
                return true;
            }
        }

        return false;
    }
}

