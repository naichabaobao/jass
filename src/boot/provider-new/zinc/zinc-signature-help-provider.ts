import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter';
import { InnerZincParser } from '../../vjass/inner-zinc-parser';
import {
    ZincProgram,
    ZincStatement,
    ZincFunctionDeclaration,
    ZincMethodDeclaration,
    ZincStructDeclaration,
    ZincInterfaceDeclaration,
    ZincLibraryDeclaration,
    ZincModuleDeclaration,
    ZincVariableDeclaration
} from '../../vjass/zinc-ast';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from '../comment-parser';

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
}

/**
 * Zinc 代码签名帮助提供者
 * 专门处理 .zn 文件的函数和方法参数提示
 */
export class ZincSignatureHelpProvider implements vscode.SignatureHelpProvider {
    private dataEnterManager: DataEnterManager;
    private zincProgramCache: Map<string, ZincProgram> = new Map();
    private disposables: vscode.Disposable[] = [];

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        
        // 监听文件变更，清理缓存
        const watcher = vscode.workspace.createFileSystemWatcher('**/*.zn');
        watcher.onDidChange((uri) => {
            this.zincProgramCache.delete(uri.fsPath);
        });
        watcher.onDidDelete((uri) => {
            this.zincProgramCache.delete(uri.fsPath);
        });
        this.disposables.push(watcher);
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.zincProgramCache.clear();
    }

    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        try {
            const filePath = document.uri.fsPath;
            const ext = path.extname(filePath).toLowerCase();

            // 只处理 .zn 文件
            if (ext !== '.zn') {
                return;
            }

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
            const signatures = this.findSignatures(callInfo, filePath);

            if (signatures.length === 0) {
                return;
            }

            // 创建 SignatureHelp
            const signatureHelp = new vscode.SignatureHelp();
            signatureHelp.signatures = signatures;
            signatureHelp.activeSignature = 0;
            signatureHelp.activeParameter = callInfo.activeParameter;

            return signatureHelp;
        } catch (error) {
            console.error('ZincSignatureHelpProvider error:', error);
            return;
        }
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
            isStatic: nameMatch.isStatic
        };
    }

    /**
     * 从文本中提取函数/方法名称
     */
    private extractFunctionName(
        text: string,
        document: vscode.TextDocument,
        position: vscode.Position
    ): { name: string; isMethod: boolean; structName?: string; isStatic?: boolean } | null {
        // 移除空白字符
        text = text.trim();

        // 检查是否是方法调用（如 obj.method、this.method 或 StructName.method）
        const methodMatch = text.match(/(\w+)\s*\.\s*(\w+)\s*$/);
        if (methodMatch) {
            const objectName = methodMatch[1];
            const methodName = methodMatch[2];
            
            // 检查是否是 this
            if (objectName.toLowerCase() === 'this') {
                // this.method() - 实例方法调用
                const currentStruct = this.findCurrentStruct(document, position);
                if (currentStruct && currentStruct.name) {
                    return {
                        name: methodName,
                        isMethod: true,
                        structName: currentStruct.name.name,
                        isStatic: false
                    };
                }
            }
            
            // 尝试变量类型推断
            const variableType = this.findVariableType(document, position, objectName);
            if (variableType) {
                // 找到了变量类型，这是实例方法调用
                return {
                    name: methodName,
                    isMethod: true,
                    structName: variableType,
                    isStatic: false
                };
            }
            
            // 普通方法调用（如 obj.method 或 StructName.method）
            // 如果首字母大写，可能是静态方法
            const isStatic = objectName[0] === objectName[0].toUpperCase();
            
            return {
                name: methodName,
                isMethod: true,
                structName: objectName,
                isStatic: isStatic
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

        // 从所有缓存的 .zn 文件中查找
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const cachedExt = path.extname(filePath).toLowerCase();
            if (cachedExt !== '.zn') {
                continue; // 只处理 .zn 文件
            }

            const fileContent = this.dataEnterManager.getFileContent(filePath);
            if (!fileContent) {
                continue;
            }

            const program = this.parseZincFile(filePath, fileContent);
            if (!program) {
                continue;
            }

            // 查找函数声明
            if (!callInfo.isMethod) {
                this.findFunctionsInProgram(program, callInfo.name, filePath, signatures);
            }

            // 查找方法声明
            if (callInfo.isMethod) {
                this.findMethodsInProgram(
                    program,
                    callInfo.name,
                    callInfo.structName,
                    callInfo.isStatic,
                    filePath,
                    signatures
                );
            }
        }

        return signatures;
    }

    /**
     * 在 ZincProgram 中查找函数声明
     */
    private findFunctionsInProgram(
        program: ZincProgram,
        functionName: string,
        filePath: string,
        signatures: vscode.SignatureInformation[]
    ): void {
        for (const stmt of program.declarations) {
            this.findFunctionsInStatement(stmt, functionName, filePath, signatures);
        }
    }

    /**
     * 在 ZincStatement 中查找函数声明
     */
    private findFunctionsInStatement(
        stmt: ZincStatement,
        functionName: string,
        filePath: string,
        signatures: vscode.SignatureInformation[]
    ): void {
        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (stmt.name && stmt.name.name === functionName) {
                const signature = this.createFunctionSignature(stmt, filePath);
                signatures.push(signature);
            }
        }
        // Library 声明（递归查找其成员）
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.findFunctionsInStatement(member, functionName, filePath, signatures);
                }
            }
        }
        // Module 声明（递归查找其成员）
        else if (stmt instanceof ZincModuleDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.findFunctionsInStatement(member, functionName, filePath, signatures);
                }
            }
        }
    }

    /**
     * 在 ZincProgram 中查找方法声明
     */
    private findMethodsInProgram(
        program: ZincProgram,
        methodName: string,
        structName: string | undefined,
        isStatic: boolean | undefined,
        filePath: string,
        signatures: vscode.SignatureInformation[]
    ): void {
        for (const stmt of program.declarations) {
            this.findMethodsInStatement(stmt, methodName, structName, isStatic, filePath, signatures);
        }
    }

    /**
     * 在 ZincStatement 中查找方法声明
     */
    private findMethodsInStatement(
        stmt: ZincStatement,
        methodName: string,
        structName: string | undefined,
        isStatic: boolean | undefined,
        filePath: string,
        signatures: vscode.SignatureInformation[]
    ): void {
        // 查找结构体声明
        if (stmt instanceof ZincStructDeclaration) {
            // 如果指定了结构体名称，检查是否匹配
            // 如果没有指定，则查找所有结构体中的同名方法
            if (structName && stmt.name && stmt.name.name !== structName) {
                // 继续查找其他结构体
                return;
            }

            // 在结构体的成员中查找方法
            if (stmt.members) {
                for (const member of stmt.members) {
                    if (member instanceof ZincMethodDeclaration) {
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
                                stmt.name?.name,
                                filePath
                            );
                            signatures.push(signature);
                        }
                    }
                }
            }
        }
        // Library 声明（递归查找其成员）
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.findMethodsInStatement(member, methodName, structName, isStatic, filePath, signatures);
                }
            }
        }
        // Module 声明（递归查找其成员）
        else if (stmt instanceof ZincModuleDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.findMethodsInStatement(member, methodName, structName, isStatic, filePath, signatures);
                }
            }
        }
    }

    /**
     * 创建函数签名信息
     */
    private createFunctionSignature(
        func: ZincFunctionDeclaration,
        filePath: string
    ): vscode.SignatureInformation {
        const name = func.name?.name || 'unknown';
        const params = func.parameters.map(p => {
            const type = p.type ? p.type.name : 'nothing';
            return `${type} ${p.name ? p.name.name : ''}`;
        }).join(', ');
        const returnType = func.returnType ? func.returnType.name : 'nothing';

        const label = `function ${name}(${params || 'nothing'}) -> ${returnType}`;

        const signature = new vscode.SignatureInformation(label);

        // 提取注释中的参数描述
        let parsedComment: { params: Map<string, string> } | null = null;
        if (func.start) {
            const fileContent = this.dataEnterManager.getFileContent(filePath);
            if (fileContent) {
                const commentLines = extractLeadingComments(fileContent, func.start.line);
                if (commentLines.length > 0) {
                    const parsed = parseComment(commentLines);
                    parsedComment = { params: parsed.params };
                }
            }
        }

        // 设置参数信息（使用注释中的参数描述）
        signature.parameters = func.parameters.map(param => {
            const type = param.type ? param.type.name : 'nothing';
            const paramName = param.name ? param.name.name : '';
            // 从注释中获取参数描述，如果没有则使用类型
            const paramDesc = parsedComment?.params.get(paramName) || `Type: ${type}`;
            return new vscode.ParameterInformation(
                `${type} ${paramName}`,
                paramDesc
            );
        });

        // 创建文档
        const doc = new vscode.MarkdownString();
        doc.appendMarkdown(`### function ${name}\n\n`);
        doc.appendCodeblock(label, 'zinc');

        // 添加注释作为文档（注释中可能包含 @param 和 @returns）
        const comment = this.extractCommentForStatement(func, filePath);
        if (comment) {
            doc.appendMarkdown(`\n${comment}\n`);
        } else {
            // 如果没有注释，显示基本的返回类型信息
            if (returnType !== 'nothing') {
                doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n`);
            }
            // 如果没有注释中的参数说明，显示参数类型列表
            if (func.parameters.length > 0) {
                doc.appendMarkdown(`\n**Parameters:**\n`);
                func.parameters.forEach((param) => {
                    const type = param.type ? param.type.name : 'nothing';
                    const paramName = param.name ? param.name.name : '';
                    doc.appendMarkdown(`- \`${paramName}\`: \`${type}\`\n`);
                });
            }
        }

        signature.documentation = doc;

        return signature;
    }

    /**
     * 创建方法签名信息
     */
    private createMethodSignature(
        method: ZincMethodDeclaration,
        structName?: string,
        filePath?: string
    ): vscode.SignatureInformation {
        const name = method.name?.name || 'unknown';
        const params = method.parameters.map(p => {
            const type = p.type ? p.type.name : 'nothing';
            return `${type} ${p.name ? p.name.name : ''}`;
        }).join(', ');
        const returnType = method.returnType ? method.returnType.name : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        const structPrefix = structName ? `${structName}.` : '';

        const label = `${staticStr}method ${structPrefix}${name}(${params || 'nothing'}) -> ${returnType}`;

        const signature = new vscode.SignatureInformation(label);

        // 提取注释中的参数描述
        let parsedComment: { params: Map<string, string> } | null = null;
        if (filePath && method.start) {
            const fileContent = this.dataEnterManager.getFileContent(filePath);
            if (fileContent) {
                const commentLines = extractLeadingComments(fileContent, method.start.line);
                if (commentLines.length > 0) {
                    const parsed = parseComment(commentLines);
                    parsedComment = { params: parsed.params };
                }
            }
        }

        // 设置参数信息（使用注释中的参数描述）
        signature.parameters = method.parameters.map(param => {
            const type = param.type ? param.type.name : 'nothing';
            const paramName = param.name ? param.name.name : '';
            // 从注释中获取参数描述，如果没有则使用类型
            const paramDesc = parsedComment?.params.get(paramName) || `Type: ${type}`;
            return new vscode.ParameterInformation(
                `${type} ${paramName}`,
                paramDesc
            );
        });

        // 创建文档
        const doc = new vscode.MarkdownString();
        doc.appendMarkdown(`### method ${structPrefix}${name}\n\n`);
        doc.appendCodeblock(label, 'zinc');

        // 添加注释作为文档（注释中可能包含 @param 和 @returns）
        if (filePath) {
            const comment = this.extractCommentForStatement(method, filePath);
            if (comment) {
                doc.appendMarkdown(`\n${comment}\n`);
            } else {
                // 如果没有注释，显示基本的返回类型信息
                if (returnType !== 'nothing') {
                    doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n`);
                }
                // 如果没有注释中的参数说明，显示参数类型列表
                if (method.parameters.length > 0) {
                    doc.appendMarkdown(`\n**Parameters:**\n`);
                    method.parameters.forEach((param) => {
                        const type = param.type ? param.type.name : 'nothing';
                        const paramName = param.name ? param.name.name : '';
                        doc.appendMarkdown(`- \`${paramName}\`: \`${type}\`\n`);
                    });
                }
            }
        } else {
            // 如果没有文件路径，显示基本的返回类型和参数信息
            if (returnType !== 'nothing') {
                doc.appendMarkdown(`\n**Returns:** \`${returnType}\`\n`);
            }
            if (method.parameters.length > 0) {
                doc.appendMarkdown(`\n**Parameters:**\n`);
                method.parameters.forEach((param) => {
                    const type = param.type ? param.type.name : 'nothing';
                    const paramName = param.name ? param.name.name : '';
                    doc.appendMarkdown(`- \`${paramName}\`: \`${type}\`\n`);
                });
            }
        }

        signature.documentation = doc;

        return signature;
    }

    /**
     * 解析 Zinc 文件并返回 ZincProgram
     */
    private parseZincFile(filePath: string, content: string): ZincProgram | null {
        // 检查缓存
        const cached = this.zincProgramCache.get(filePath);
        if (cached) {
            return cached;
        }

        try {
            const parser = new InnerZincParser(content, filePath);
            const statements = parser.parse();
            const program = new ZincProgram(statements);
            this.zincProgramCache.set(filePath, program);
            return program;
        } catch (error: any) {
            console.error(`Failed to parse Zinc file ${filePath}:`, error);
            if (error.message) {
                console.error(`Error message: ${error.message}`);
            }
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
            return null;
        }
    }

    /**
     * 提取 statement 前面的注释
     */
    private extractCommentForStatement(stmt: ZincStatement, filePath: string): string | null {
        if (!stmt.start) {
            return null;
        }

        const fileContent = this.dataEnterManager.getFileContent(filePath);
        if (!fileContent) {
            return null;
        }

        const commentLines = extractLeadingComments(fileContent, stmt.start.line);
        if (commentLines.length === 0) {
            return null;
        }

        const parsedComment = parseComment(commentLines);
        const markdown = formatCommentAsMarkdown(parsedComment);
        
        return markdown || null;
    }

    /**
     * 查找当前位置所在的 struct
     */
    private findCurrentStruct(
        document: vscode.TextDocument,
        position: vscode.Position
    ): ZincStructDeclaration | null {
        const filePath = document.uri.fsPath;
        const fileContent = this.dataEnterManager.getFileContent(filePath);
        if (!fileContent) {
            return null;
        }

        const program = this.parseZincFile(filePath, fileContent);
        if (!program) {
            return null;
        }

        return this.findContainingStruct(program, position);
    }

    /**
     * 查找包含指定位置的 struct
     */
    private findContainingStruct(
        program: ZincProgram,
        position: vscode.Position
    ): ZincStructDeclaration | null {
        for (const stmt of program.declarations) {
            if (stmt instanceof ZincStructDeclaration) {
                if (stmt.start && stmt.end) {
                    if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                        return stmt;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 查找变量的类型（用于类型推断）
     */
    private findVariableType(
        document: vscode.TextDocument,
        position: vscode.Position,
        variableName: string
    ): string | null {
        // 简化实现：从当前文件中查找变量声明
        // 更完整的实现需要分析作用域
        const filePath = document.uri.fsPath;
        const fileContent = this.dataEnterManager.getFileContent(filePath);
        if (!fileContent) {
            return null;
        }

        const program = this.parseZincFile(filePath, fileContent);
        if (!program) {
            return null;
        }

        // 查找变量声明
        for (const stmt of program.declarations) {
            if (stmt instanceof ZincVariableDeclaration) {
                const varDecl = stmt as ZincVariableDeclaration;
                if (varDecl.name && varDecl.name.name === variableName) {
                    if (varDecl.type) {
                        return varDecl.type.name;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 检查位置是否在范围内
     */
    private isPositionInRange(
        position: vscode.Position,
        start: { line: number; position?: number },
        end: { line: number; position?: number }
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
            if (posChar < start.position - 10) {  // 允许10个字符的误差
                return false;
            }
        }

        // 检查结束行的位置（如果位置信息完整）
        if (posLine === endLine && end.position !== undefined) {
            if (posChar > end.position + 10) {  // 允许10个字符的误差
                return false;
            }
        }

        return true;
    }
}

