import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter';
import {
    BlockStatement,
    Statement,
    FunctionDeclaration,
    NativeDeclaration,
    FunctionInterfaceDeclaration,
    VariableDeclaration,
    TypeDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    ModuleDeclaration,
    DelegateDeclaration,
    MethodDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    TextMacroStatement,
    ImplementStatement,
    Identifier
} from '../vjass/vjass-ast';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from './comment-parser';

/**
 * 基于新 AST 系统的悬停信息提供者
 */
export class HoverProvider implements vscode.HoverProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        try {
            // 获取当前位置的单词
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) {
                return null;
            }

            const symbolName = document.getText(wordRange);
            if (!symbolName) {
                return null;
            }

            const hoverContents: vscode.MarkdownString[] = [];
            const filePath = document.uri.fsPath;

            // 从所有缓存的文件中查找匹配的符号
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            for (const cachedFilePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                if (!blockStatement) {
                    continue;
                }

                // 在当前文件中查找符号
                this.findSymbolsInBlock(blockStatement, symbolName, cachedFilePath, hoverContents);
            }

            // 查找 TextMacro
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const macro = textMacroRegistry.find(symbolName);
            if (macro) {
                const content = this.createTextMacroHoverContent(macro);
                if (content) {
                    hoverContents.push(content);
                }
            }

            // 如果没有找到任何内容，返回 null
            if (hoverContents.length === 0) {
                return null;
            }

            return new vscode.Hover(hoverContents, wordRange);
        } catch (error) {
            console.error('Error in provideHover:', error);
            return null;
        }
    }

    /**
     * 在 BlockStatement 中查找符号
     */
    private findSymbolsInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            // 在 globals 块中查找全局变量
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.name && stmt.name.name === symbolName) {
                        const content = this.createVariableHoverContent(stmt, filePath);
                        if (content) {
                            hoverContents.push(content);
                        }
                    }
                }
            }
            return;
        }

        for (const stmt of block.body) {
            // 函数声明
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createFunctionHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Native 函数声明
            else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createNativeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 函数接口声明
            else if (stmt instanceof FunctionInterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createFunctionInterfaceHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 变量声明
            else if (stmt instanceof VariableDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createVariableHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 类型声明
            else if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createTypeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
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
            else if (stmt instanceof InterfaceDeclaration) {
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
            else if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createModuleHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找模块成员
                this.findModuleMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 委托声明
            else if (stmt instanceof DelegateDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createDelegateHoverContent(stmt, null, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Library 声明
            else if (stmt instanceof LibraryDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createLibraryHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Scope 声明
            else if (stmt instanceof ScopeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createScopeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // TextMacro 声明
            else if (stmt instanceof TextMacroStatement) {
                if (stmt.name === symbolName) {
                    const content = this.createTextMacroStatementHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Implement 语句
            else if (stmt instanceof ImplementStatement) {
                if (stmt.moduleName && stmt.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(stmt, null, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.findSymbolsInBlock(stmt, symbolName, filePath, hoverContents);
            }
        }
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
     * 查找结构体成员
     */
    private findStructMembers(
        struct: StructDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof VariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMemberVariableHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof DelegateDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createDelegateHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(member, struct.name?.name || 'unknown', filePath);
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
        interface_: InterfaceDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of interface_.members) {
            if (member instanceof MethodDeclaration) {
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
     * 查找模块成员
     */
    private findModuleMembers(
        module: ModuleDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of module.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, module.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(member, module.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 创建函数悬停内容
     */
    private createFunctionHoverContent(func: FunctionDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!func.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';

        content.appendCodeblock(`function ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
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
     * 创建 Native 函数悬停内容
     */
    private createNativeHoverContent(native: NativeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!native.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = native.name.name;
        const constantStr = native.isConstant ? 'constant ' : '';
        const params = native.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';

        // native 本身就等价于 function，不需要额外的 function 关键字
        content.appendCodeblock(`${constantStr}native ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(native, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建函数接口悬停内容
     */
    private createFunctionInterfaceHoverContent(func: FunctionInterfaceDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!func.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';

        content.appendCodeblock(`function interface ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
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
    private createVariableHoverContent(variable: VariableDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const localStr = variable.isLocal ? 'local ' : '';
        const arrayStr = variable.isArray 
            ? (variable.arrayWidth !== null && variable.arrayHeight !== null
                ? ` array[${variable.arrayWidth}][${variable.arrayHeight}]`
                : variable.arraySize !== null
                    ? ` array[${variable.arraySize}]`
                    : ' array')
            : '';

        content.appendCodeblock(`${localStr}${constantStr}${typeStr}${arrayStr} ${name}`, 'jass');
        
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
    private createTypeHoverContent(type: TypeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!type.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = type.name.name;
        const baseType = type.baseType ? ` = ${type.baseType.toString()}` : '';

        content.appendCodeblock(`type ${name}${baseType}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建结构体悬停内容
     */
    private createStructHoverContent(struct: StructDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!struct.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = struct.name.name;
        const extendsInfo = struct.extendsType ? ` extends ${struct.extendsType.toString()}` : '';
        const indexInfo = struct.indexSize !== null ? `[${struct.indexSize}]` : '';
        const arrayInfo = struct.isArrayStruct ? ` extends array${struct.arraySize !== null ? ` [${struct.arraySize}]` : ''}` : '';

        content.appendCodeblock(`struct${indexInfo} ${name}${extendsInfo}${arrayInfo}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建接口悬停内容
     */
    private createInterfaceHoverContent(interface_: InterfaceDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!interface_.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = interface_.name.name;

        content.appendCodeblock(`interface ${name}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建模块悬停内容
     */
    private createModuleHoverContent(module: ModuleDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!module.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = module.name.name;

        content.appendCodeblock(`module ${name}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建委托悬停内容
     */
    private createDelegateHoverContent(delegate: DelegateDeclaration, ownerName: string | null, filePath: string): vscode.MarkdownString | null {
        if (!delegate.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = delegate.name.name;
        const delegateType = delegate.delegateType ? delegate.delegateType.toString() : 'unknown';
        const privateStr = delegate.isPrivate ? 'private ' : '';

        content.appendCodeblock(`${privateStr}delegate ${delegateType} ${name}`, 'jass');
        
        if (ownerName) {
            content.appendMarkdown(`\n**所属:** \`${ownerName}\``);
        }
        
        // 查找被委托的类型（struct）定义
        const structDef = this.findStructDefinition(delegateType);
        if (structDef) {
            content.appendMarkdown(`\n**委托类型定义:** \`${this.getRelativePath(structDef.filePath)}\``);
        }
        
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建方法悬停内容
     */
    private createMethodHoverContent(method: MethodDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!method.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = method.name.name;
        const staticStr = method.isStatic ? 'static ' : '';
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';

        content.appendCodeblock(`${staticStr}method ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
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
    private createMemberVariableHoverContent(variable: VariableDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        
        const modifiers: string[] = [];
        if (variable.isStatic) {
            modifiers.push('static');
        }
        if (variable.isReadonly) {
            modifiers.push('readonly');
        }
        if (variable.isConstant) {
            modifiers.push('constant');
        }
        
        const modifierStr = modifiers.length > 0 ? `${modifiers.join(' ')} ` : '';
        const arrayStr = variable.isArray 
            ? (variable.arrayWidth !== null && variable.arrayHeight !== null
                ? ` array[${variable.arrayWidth}][${variable.arrayHeight}]`
                : variable.arraySize !== null
                    ? ` array[${variable.arraySize}]`
                    : ' array')
            : '';

        content.appendCodeblock(`${modifierStr}${typeStr}${arrayStr} ${name}`, 'jass');
        content.appendMarkdown(`\n**所属:** \`${ownerName}\``);
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Library 悬停内容
     */
    private createLibraryHoverContent(library: LibraryDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!library.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = library.name.name;
        const onceStr = library.isLibraryOnce ? 'library_once ' : 'library ';
        const dependencies = library.dependencies.length > 0
            ? ` requires ${library.dependencies.map(d => d.toString()).join(', ')}`
            : '';
        const initializer = library.initializer ? ` initializer ${library.initializer.toString()}` : '';

        content.appendCodeblock(`${onceStr}${name}${dependencies}${initializer}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Scope 悬停内容
     */
    private createScopeHoverContent(scope: ScopeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!scope.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = scope.name.name;
        const initializer = scope.initializer ? ` initializer ${scope.initializer.toString()}` : '';

        content.appendCodeblock(`scope ${name}${initializer}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 TextMacro 语句悬停内容
     */
    private createTextMacroStatementHoverContent(textMacro: TextMacroStatement, filePath: string): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        const name = textMacro.name;
        const params = textMacro.parameters.length > 0
            ? ` takes ${textMacro.parameters.join(', ')}`
            : '';

        content.appendCodeblock(`textmacro ${name}${params}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 TextMacro 悬停内容（从注册表）
     */
    private createTextMacroHoverContent(macro: { name: string; parameters: string[]; filePath: string }): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        const name = macro.name;
        const params = macro.parameters.length > 0
            ? ` takes ${macro.parameters.join(', ')}`
            : '';

        content.appendCodeblock(`textmacro ${name}${params}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(macro.filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Implement 悬停内容
     */
    private createImplementHoverContent(implement: ImplementStatement, ownerName: string | null, filePath: string): vscode.MarkdownString | null {
        if (!implement.moduleName) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const moduleName = implement.moduleName.name;
        const optionalStr = implement.isOptional ? 'optional ' : '';

        content.appendCodeblock(`implement ${optionalStr}${moduleName}`, 'jass');
        
        if (ownerName) {
            content.appendMarkdown(`\n**所属:** \`${ownerName}\``);
        }
        
        // 查找被实现的模块定义
        const moduleDef = this.findModuleDefinition(moduleName);
        if (moduleDef) {
            content.appendMarkdown(`\n**模块定义:** \`${this.getRelativePath(moduleDef.filePath)}\``);
        }
        
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 查找模块定义
     */
    private findModuleDefinition(moduleName: string): { filePath: string } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }
            
            const module = this.findModuleInBlock(blockStatement, moduleName);
            if (module) {
                return { filePath: cachedFilePath };
            }
        }
        
        return null;
    }

    /**
     * 在 BlockStatement 中查找模块
     */
    private findModuleInBlock(block: BlockStatement, moduleName: string): ModuleDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === moduleName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findModuleInBlock(stmt, moduleName);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }

    /**
     * 查找结构体定义
     */
    private findStructDefinition(structName: string): { filePath: string } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }
            
            const struct = this.findStructInBlock(blockStatement, structName);
            if (struct) {
                return { filePath: cachedFilePath };
            }
        }
        
        return null;
    }

    /**
     * 在 BlockStatement 中查找结构体
     */
    private findStructInBlock(block: BlockStatement, structName: string): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === structName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findStructInBlock(stmt, structName);
                if (found) {
                    return found;
                }
            }
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

    /**
     * 提取 statement 前面的注释
     */
    private extractCommentForStatement(stmt: Statement, filePath: string): string | null {
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
}

