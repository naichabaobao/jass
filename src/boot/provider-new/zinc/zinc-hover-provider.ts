import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter';
import { InnerZincParser } from '../../vjass/inner-zinc-parser';
import {
    ZincProgram,
    ZincStatement,
    ZincLibraryDeclaration,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincInterfaceDeclaration,
    ZincMethodDeclaration,
    ZincTypeDeclaration,
    ZincModuleDeclaration,
    ZincBlock,
    ZincParameter
} from '../../vjass/zinc-ast';
import { Identifier } from '../../vjass/vjass-ast';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from '../comment-parser';
import { ZincLocalScopeHelper } from './zinc-local-scope-helper';

/**
 * 基于 Zinc AST 系统的悬停信息提供者
 */
export class ZincHoverProvider implements vscode.HoverProvider {
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

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        try {
            const filePath = document.uri.fsPath;
            const ext = path.extname(filePath).toLowerCase();
            
            // 只处理 .zn 文件
            if (ext !== '.zn') {
                return null;
            }

            // 检查是否是 library 成员访问（如 libraryName.memberName）
            const libraryMemberAccess = this.detectLibraryMemberAccess(document, position);
            if (libraryMemberAccess) {
                // 查找 library 成员的悬停信息
                const hoverContent = this.findLibraryMemberHover(
                    libraryMemberAccess.libraryName,
                    libraryMemberAccess.memberName,
                    filePath
                );
                if (hoverContent) {
                    const wordRange = document.getWordRangeAtPosition(position, /[\w.]+/);
                    return new vscode.Hover([hoverContent], wordRange || undefined);
                }
                return null;
            }

            // 获取当前位置的单词
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            if (!symbolName) {
                return null;
            }

            // 获取或解析 Zinc 程序
            const zincProgram = this.getZincProgram(filePath, document.getText());
            if (!zincProgram) {
                return null;
            }

            const hoverContents: vscode.MarkdownString[] = [];

            // 在当前文件中查找符号
            this.findSymbolsInProgram(zincProgram, symbolName, filePath, hoverContents);
            
            // 查找局部变量和参数的悬停信息
            this.findLocalVariableHover(zincProgram, symbolName, filePath, position, hoverContents);

            // 如果没有找到任何内容，返回 null
            if (hoverContents.length === 0) {
                return null;
            }

            return new vscode.Hover(hoverContents, wordRange);
        } catch (error) {
            console.error('Error in ZincHoverProvider.provideHover:', error);
            return null;
        }
    }

    /**
     * 获取或解析 Zinc 程序
     */
    private getZincProgram(filePath: string, content: string): ZincProgram | null {
        // 检查缓存
        if (this.zincProgramCache.has(filePath)) {
            return this.zincProgramCache.get(filePath)!;
        }

        try {
            // 解析文件
            const zincParser = new InnerZincParser(content, filePath);
            const statements = zincParser.parse();
            const zincProgram = new ZincProgram(statements);
            
            // 缓存结果
            this.zincProgramCache.set(filePath, zincProgram);
            
            return zincProgram;
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
     * 在 ZincProgram 中查找符号
     */
    private findSymbolsInProgram(
        program: ZincProgram,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const decl of program.declarations) {
            // 库声明
            if (decl instanceof ZincLibraryDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createLibraryHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 在库体中查找
                if (decl.body) {
                    this.findSymbolsInBlock(decl.body, symbolName, filePath, hoverContents);
                }
            }
            // 函数声明
            else if (decl instanceof ZincFunctionDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createFunctionHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 变量声明
            else if (decl instanceof ZincVariableDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createVariableHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 类型声明
            else if (decl instanceof ZincTypeDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createTypeHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 结构体声明
            else if (decl instanceof ZincStructDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createStructHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找结构体成员
                this.findStructMembers(decl, symbolName, filePath, hoverContents);
            }
            // 接口声明
            else if (decl instanceof ZincInterfaceDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createInterfaceHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找接口成员
                this.findInterfaceMembers(decl, symbolName, filePath, hoverContents);
            }
            // 模块声明
            else if (decl instanceof ZincModuleDeclaration) {
                if (decl.name && decl.name.name === symbolName) {
                    const content = this.createModuleHoverContent(decl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找模块成员
                if (decl.body) {
                    this.findSymbolsInBlock(decl.body, symbolName, filePath, hoverContents);
                }
            }
        }
    }

    /**
     * 在 ZincBlock 中查找符号
     */
    private findSymbolsInBlock(
        block: ZincBlock,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const stmt of block.statements) {
            // 函数声明
            if (stmt instanceof ZincFunctionDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createFunctionHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 变量声明
            else if (stmt instanceof ZincVariableDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createVariableHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 结构体声明
            else if (stmt instanceof ZincStructDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createStructHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找结构体成员
                this.findStructMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 接口声明
            else if (stmt instanceof ZincInterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createInterfaceHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找接口成员
                this.findInterfaceMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 模块声明
            else if (stmt instanceof ZincModuleDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createModuleHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找模块成员
                if (stmt.body) {
                    this.findSymbolsInBlock(stmt.body, symbolName, filePath, hoverContents);
                }
            }
            // 递归处理嵌套的块
            else if (stmt instanceof ZincBlock) {
                this.findSymbolsInBlock(stmt, symbolName, filePath, hoverContents);
            }
        }
    }

    /**
     * 查找结构体成员
     */
    private findStructMembers(
        struct: ZincStructDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of struct.members) {
            if (member instanceof ZincMethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof ZincVariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMemberVariableHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 查找接口成员
     */
    private findInterfaceMembers(
        interface_: ZincInterfaceDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of interface_.members) {
            if (member instanceof ZincMethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, interface_.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 创建库悬停内容
     */
    private createLibraryHoverContent(lib: ZincLibraryDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!lib.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = lib.name.name;
        const publicStr = lib.isPublic ? 'public ' : '';
        const privateStr = lib.isPrivate ? 'private ' : '';
        const reqStr = lib.requirements.length > 0
            ? ` requires ${lib.requirements.map(r => r.name).join(', ')}`
            : '';

        content.appendCodeblock(`${publicStr}${privateStr}library ${name}${reqStr}`, 'zinc');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建函数悬停内容
     */
    private createFunctionHoverContent(func: ZincFunctionDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!func.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = func.name.name;
        const publicStr = func.isPublic ? 'public ' : '';
        const privateStr = func.isPrivate ? 'private ' : '';
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.name : 'unknown';
                const nameStr = p.name ? p.name.name : '';
                return `${typeStr} ${nameStr}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.name : 'nothing';
        const returnStr = returnType !== 'nothing' ? ` -> ${returnType}` : '';

        content.appendCodeblock(`${publicStr}${privateStr}function ${name}(${params || ''})${returnStr}`, 'zinc');

        // 添加注释
        const comment = this.extractCommentForStatement(func, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }

        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建变量悬停内容
     */
    private createVariableHoverContent(variable: ZincVariableDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.name : 'unknown';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const publicStr = variable.isPublic ? 'public ' : '';
        const privateStr = variable.isPrivate ? 'private ' : '';
        
        let arrayStr = '';
        if (variable.arraySizes.length > 0) {
            arrayStr = variable.arraySizes.map(size => {
                if (size === undefined) {
                    return '[]';
                } else if (typeof size === 'number') {
                    return `[${size}]`;
                } else {
                    return `[${size.name}]`;
                }
            }).join('');
        }

        content.appendCodeblock(`${publicStr}${privateStr}${constantStr}${typeStr} ${name}${arrayStr}`, 'zinc');

        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }

        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建类型悬停内容
     */
    private createTypeHoverContent(type: ZincTypeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!type.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = type.name.name;
        const baseType = type.baseType ? type.baseType.name : '';
        const extendsType = type.extendsType ? type.extendsType.name : '';
        
        let typeStr = `type ${name}`;
        if (baseType) {
            typeStr += ` = ${baseType}`;
        }
        if (extendsType) {
            typeStr += ` extends ${extendsType}`;
        }
        if (type.arraySize !== null) {
            typeStr += `[${type.arraySize}]`;
        }
        if (type.storageSize !== null) {
            const sizeStr = typeof type.storageSize === 'number' 
                ? type.storageSize.toString() 
                : type.storageSize.name;
            typeStr += `, ${sizeStr}`;
        }

        content.appendCodeblock(typeStr, 'zinc');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建结构体悬停内容
     */
    private createStructHoverContent(struct: ZincStructDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!struct.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = struct.name.name;
        const publicStr = struct.isPublic ? 'public ' : '';
        const privateStr = struct.isPrivate ? 'private ' : '';
        
        let structStr = `${publicStr}${privateStr}struct`;
        if (struct.storageSize !== null) {
            const sizeStr = typeof struct.storageSize === 'number'
                ? struct.storageSize.toString()
                : struct.storageSize.name;
            structStr += `[${sizeStr}]`;
        }
        structStr += ` ${name}`;
        if (struct.isArrayStruct && struct.arraySize !== null) {
            const sizeStr = typeof struct.arraySize === 'number'
                ? struct.arraySize.toString()
                : struct.arraySize.name;
            structStr += `[${sizeStr}]`;
        }

        content.appendCodeblock(structStr, 'zinc');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建接口悬停内容
     */
    private createInterfaceHoverContent(interface_: ZincInterfaceDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!interface_.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = interface_.name.name;
        const publicStr = interface_.isPublic ? 'public ' : '';
        const privateStr = interface_.isPrivate ? 'private ' : '';

        content.appendCodeblock(`${publicStr}${privateStr}interface ${name}`, 'zinc');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建模块悬停内容
     */
    private createModuleHoverContent(module: ZincModuleDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!module.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = module.name.name;

        content.appendCodeblock(`module ${name}`, 'zinc');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建方法悬停内容
     */
    private createMethodHoverContent(method: ZincMethodDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!method.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = method.name.name;
        const staticStr = method.isStatic ? 'static ' : '';
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.name : 'unknown';
                const nameStr = p.name ? p.name.name : '';
                return `${typeStr} ${nameStr}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.name : 'nothing';
        const returnStr = returnType !== 'nothing' ? ` -> ${returnType}` : '';

        content.appendCodeblock(`${staticStr}method ${name}(${params || ''})${returnStr}`, 'zinc');

        // 添加注释
        const comment = this.extractCommentForStatement(method, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }

        content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建结构体成员变量悬停内容
     */
    private createMemberVariableHoverContent(variable: ZincVariableDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.name : 'unknown';
        const constantStr = variable.isConstant ? 'constant ' : '';
        
        let arrayStr = '';
        if (variable.arraySizes.length > 0) {
            arrayStr = variable.arraySizes.map(size => {
                if (size === undefined) {
                    return '[]';
                } else if (typeof size === 'number') {
                    return `[${size}]`;
                } else {
                    return `[${size.name}]`;
                }
            }).join('');
        }

        content.appendCodeblock(`${constantStr}${typeStr} ${name}${arrayStr}`, 'zinc');

        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }

        content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 检测是否是 library 成员访问（如 libraryName.memberName）
     */
    private detectLibraryMemberAccess(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { libraryName: string; memberName: string } | null {
        const line = document.lineAt(position.line);
        const textBeforeCursor = line.text.substring(0, position.character);
        
        // 匹配 libraryName.memberName 模式
        const match = textBeforeCursor.match(/(\w+)\s*\.\s*(\w+)\s*$/);
        if (match) {
            return { libraryName: match[1], memberName: match[2] };
        }
        
        return null;
    }

    /**
     * 查找 library 成员的悬停信息
     */
    private findLibraryMemberHover(
        libraryName: string,
        memberName: string,
        currentFilePath: string
    ): vscode.MarkdownString | null {
        // 在所有文件中查找该 library
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        const filesToCheck = [currentFilePath, ...allCachedFiles.filter(f => f !== currentFilePath)];

        for (const filePath of filesToCheck) {
            const ext = path.extname(filePath).toLowerCase();
            if (ext !== '.zn') {
                continue;
            }

            const fileContent = this.dataEnterManager.getFileContent(filePath);
            if (!fileContent && filePath !== currentFilePath) {
                continue;
            }

            const zincProgram = this.getZincProgram(filePath, fileContent || '');
            if (!zincProgram) {
                continue;
            }

            // 查找 library 并查找其成员
            for (const stmt of zincProgram.declarations) {
                if (stmt instanceof ZincLibraryDeclaration) {
                    if (stmt.name && stmt.name.name === libraryName) {
                        // 找到目标 library，查找其成员
                        if (stmt.body) {
                            for (const member of stmt.body.statements) {
                                if (member instanceof ZincFunctionDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        return this.createFunctionHoverContent(member, filePath);
                                    }
                                } else if (member instanceof ZincVariableDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        return this.createMemberVariableHoverContent(member, libraryName, filePath);
                                    }
                                } else if (member instanceof ZincStructDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        return this.createStructHoverContent(member, filePath);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 查找局部变量和参数的悬停信息
     */
    private findLocalVariableHover(
        program: ZincProgram,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        hoverContents: vscode.MarkdownString[]
    ): void {
        // 查找包含当前位置的函数或方法
        const funcOrMethod = ZincLocalScopeHelper.findContainingFunctionOrMethod(program, position);
        if (!funcOrMethod) {
            return;
        }

        // 查找局部变量和参数
        const locals = ZincLocalScopeHelper.findLocalVariablesAndParameters(funcOrMethod, position);
        
        for (const { variable, isParameter } of locals) {
            let varName: string | null = null;
            
            if (isParameter) {
                const param = variable as ZincParameter;
                varName = param.name?.name || null;
                if (varName === symbolName) {
                    const content = this.createParameterHoverContent(param, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else {
                const varDecl = variable as ZincVariableDeclaration;
                varName = varDecl.name?.name || null;
                if (varName === symbolName) {
                    const content = this.createLocalVariableHoverContent(varDecl, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 创建参数悬停内容
     */
    private createParameterHoverContent(
        param: ZincParameter,
        filePath: string
    ): vscode.MarkdownString | null {
        if (!param || !param.name) {
            return null;
        }

        const name = param.name.name;
        let typeStr = 'nothing';
        
        if (param.type) {
            if (param.type instanceof Identifier) {
                typeStr = param.type.name;
            } else if (typeof param.type === 'string') {
                typeStr = param.type;
            } else {
                typeStr = String(param.type);
            }
        }
        
        const signature = `${typeStr} ${name}`;

        const content = new vscode.MarkdownString();
        content.appendCodeblock(signature, 'zinc');
        content.appendMarkdown('\n\n**参数**');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建局部变量悬停内容
     */
    private createLocalVariableHoverContent(
        variable: ZincVariableDeclaration,
        filePath: string
    ): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.name : 'nothing';
        const constantStr = variable.isConstant ? 'constant ' : '';
        
        let arrayStr = '';
        if (variable.arraySizes.length > 0) {
            arrayStr = variable.arraySizes.map(size => {
                if (size === undefined) {
                    return '[]';
                } else if (typeof size === 'number') {
                    return `[${size}]`;
                } else {
                    return `[${size.name}]`;
                }
            }).join('');
        }

        const signature = `${constantStr}${typeStr} ${name}${arrayStr}`;

        const content = new vscode.MarkdownString();
        content.appendCodeblock(signature, 'zinc');
        
        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }

        content.appendMarkdown('\n\n**局部变量**');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 提取语句的注释
     */
    private extractCommentForStatement(stmt: ZincStatement, filePath: string): string | null {
        if (!stmt.start) {
            return null;
        }

        try {
            const fileContent = this.dataEnterManager.getFileContent(filePath);
            if (!fileContent) {
                return null;
            }

            const lineIndex = stmt.start.line;

            // 提取前导注释
            const commentLines = extractLeadingComments(fileContent, lineIndex);
            if (commentLines.length === 0) {
                return null;
            }

            // 解析并格式化注释
            const parsedComment = parseComment(commentLines);
            return formatCommentAsMarkdown(parsedComment);
        } catch (error: any) {
            console.error(`Failed to extract comment for statement in ${filePath}:`, error);
            if (error.message) {
                console.error(`Error message: ${error.message}`);
            }
            return null;
        }
    }

    /**
     * 获取相对路径
     */
    private getRelativePath(filePath: string): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return filePath;
        }

        const workspaceRoot = workspaceFolder.uri.fsPath;
        if (filePath.startsWith(workspaceRoot)) {
            return path.relative(workspaceRoot, filePath);
        }

        return filePath;
    }

    /**
     * 清除缓存（用于文件更新时）
     */
    public clearCache(filePath?: string): void {
        if (filePath) {
            this.zincProgramCache.delete(filePath);
        } else {
            this.zincProgramCache.clear();
        }
    }
}

