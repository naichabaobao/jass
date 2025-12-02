import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter';
import { InnerZincParser } from '../../vjass/inner-zinc-parser';
import {
    ZincProgram,
    ZincStatement,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincInterfaceDeclaration,
    ZincTypeDeclaration,
    ZincLibraryDeclaration,
    ZincModuleDeclaration,
    ZincMethodDeclaration
} from '../../vjass/zinc-ast';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from '../comment-parser';

/**
 * Zinc 文档大纲提供者
 * 专门处理 .zn 文件的代码大纲功能
 */
export class ZincOutlineProvider implements vscode.DocumentSymbolProvider {
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

    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        try {
            const symbols: vscode.DocumentSymbol[] = [];
            const filePath = document.uri.fsPath;
            const ext = path.extname(filePath).toLowerCase();

            // 只处理 .zn 文件
            if (ext !== '.zn') {
                return symbols;
            }

            // 获取或解析 Zinc 程序
            const zincProgram = this.getZincProgram(filePath, document.getText());
            if (!zincProgram) {
                return symbols;
            }

            // 从 ZincProgram 中提取符号
            for (const stmt of zincProgram.declarations) {
                const symbol = this.createSymbolFromStatement(stmt, filePath);
                if (symbol) {
                    symbols.push(symbol);
                    // 递归处理嵌套的符号
                    this.extractNestedSymbols(stmt, symbol, filePath);
                }
            }

            return symbols;
        } catch (error: any) {
            console.error('Error in ZincOutlineProvider.provideDocumentSymbols:', error);
            if (error.message) {
                console.error(`Error message: ${error.message}`);
            }
            return [];
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
            const parser = new InnerZincParser(content, filePath);
            const statements = parser.parse();
            const program = new ZincProgram(statements);
            this.zincProgramCache.set(filePath, program);
            return program;
        } catch (error: any) {
            console.error(`Failed to parse Zinc file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 从语句创建符号
     */
    private createSymbolFromStatement(
        stmt: ZincStatement,
        filePath: string
    ): vscode.DocumentSymbol | null {
        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            return this.createFunctionSymbol(stmt, filePath);
        }
        // 变量声明（全局变量）
        else if (stmt instanceof ZincVariableDeclaration) {
            return this.createVariableSymbol(stmt, filePath);
        }
        // 结构体声明
        else if (stmt instanceof ZincStructDeclaration) {
            return this.createStructSymbol(stmt, filePath);
        }
        // 接口声明
        else if (stmt instanceof ZincInterfaceDeclaration) {
            return this.createInterfaceSymbol(stmt, filePath);
        }
        // 类型声明
        else if (stmt instanceof ZincTypeDeclaration) {
            return this.createTypeSymbol(stmt, filePath);
        }
        // 库声明
        else if (stmt instanceof ZincLibraryDeclaration) {
            return this.createLibrarySymbol(stmt, filePath);
        }
        // 模块声明
        else if (stmt instanceof ZincModuleDeclaration) {
            return this.createModuleSymbol(stmt, filePath);
        }

        return null;
    }

    /**
     * 提取嵌套的符号（如结构体成员、library 成员等）
     */
    private extractNestedSymbols(
        stmt: ZincStatement,
        parentSymbol: vscode.DocumentSymbol,
        filePath: string
    ): void {
        // 结构体成员
        if (stmt instanceof ZincStructDeclaration) {
            if (stmt.members) {
                for (const member of stmt.members) {
                    let memberSymbol: vscode.DocumentSymbol | null = null;

                    if (member instanceof ZincMethodDeclaration) {
                        memberSymbol = this.createMethodSymbol(member, filePath);
                    } else if (member instanceof ZincVariableDeclaration) {
                        memberSymbol = this.createVariableSymbol(member, filePath);
                    } else {
                        memberSymbol = this.createSymbolFromStatement(member, filePath);
                    }

                    if (memberSymbol) {
                        parentSymbol.children.push(memberSymbol);
                        this.extractNestedSymbols(member, memberSymbol, filePath);
                    }
                }
            }
        }
        // 接口成员
        else if (stmt instanceof ZincInterfaceDeclaration) {
            if (stmt.members) {
                for (const member of stmt.members) {
                    let memberSymbol: vscode.DocumentSymbol | null = null;

                    if (member instanceof ZincMethodDeclaration) {
                        memberSymbol = this.createMethodSymbol(member, filePath);
                    } else if (member instanceof ZincVariableDeclaration) {
                        memberSymbol = this.createVariableSymbol(member, filePath);
                    } else {
                        memberSymbol = this.createSymbolFromStatement(member, filePath);
                    }

                    if (memberSymbol) {
                        parentSymbol.children.push(memberSymbol);
                        this.extractNestedSymbols(member, memberSymbol, filePath);
                    }
                }
            }
        }
        // Library 成员
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    const memberSymbol = this.createSymbolFromStatement(member, filePath);
                    if (memberSymbol) {
                        parentSymbol.children.push(memberSymbol);
                        this.extractNestedSymbols(member, memberSymbol, filePath);
                    }
                }
            }
        }
        // Module 成员
        else if (stmt instanceof ZincModuleDeclaration) {
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    const memberSymbol = this.createSymbolFromStatement(member, filePath);
                    if (memberSymbol) {
                        parentSymbol.children.push(memberSymbol);
                        this.extractNestedSymbols(member, memberSymbol, filePath);
                    }
                }
            }
        }
    }

    /**
     * 创建函数符号
     */
    private createFunctionSymbol(
        func: ZincFunctionDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!func.name) {
            return null;
        }

        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.name : 'nothing';
                return `${typeStr} ${p.name ? p.name.name : ''}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.name : 'nothing';
        const publicStr = func.isPublic ? 'public ' : '';
        const privateStr = func.isPrivate ? 'private ' : '';
        const detail = `${publicStr}${privateStr}function(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(func.start, func.end);
        const selectionRange = func.name ? this.createRange(func.name.start, func.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Function,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(func, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建变量符号
     */
    private createVariableSymbol(
        variable: ZincVariableDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!variable.name) {
            return null;
        }

        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.name : 'nothing';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const publicStr = variable.isPublic ? 'public ' : '';
        const privateStr = variable.isPrivate ? 'private ' : '';
        const detail = `${publicStr}${privateStr}${constantStr}${typeStr}`;

        const range = this.createRange(variable.start, variable.end);
        const selectionRange = variable.name ? this.createRange(variable.name.start, variable.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            variable.isConstant ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建结构体符号
     */
    private createStructSymbol(
        struct: ZincStructDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!struct.name) {
            return null;
        }

        const name = struct.name.name;
        const indexInfo = struct.storageSize !== null ? `[${struct.storageSize}]` : '';
        const arrayInfo = struct.isArrayStruct ? '[]' : '';
        const publicStr = struct.isPublic ? 'public ' : '';
        const privateStr = struct.isPrivate ? 'private ' : '';
        const detail = `${publicStr}${privateStr}struct${indexInfo}${arrayInfo}`;

        const range = this.createRange(struct.start, struct.end);
        const selectionRange = struct.name ? this.createRange(struct.name.start, struct.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Class,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(struct, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建接口符号
     */
    private createInterfaceSymbol(
        interface_: ZincInterfaceDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!interface_.name) {
            return null;
        }

        const name = interface_.name.name;
        const publicStr = interface_.isPublic ? 'public ' : '';
        const privateStr = interface_.isPrivate ? 'private ' : '';
        const detail = `${publicStr}${privateStr}interface`;

        const range = this.createRange(interface_.start, interface_.end);
        const selectionRange = interface_.name ? this.createRange(interface_.name.start, interface_.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Interface,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(interface_, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建类型符号
     */
    private createTypeSymbol(
        type: ZincTypeDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!type.name) {
            return null;
        }

        const name = type.name.name;
        const baseType = type.baseType ? ` = ${type.baseType.name}` : '';
        const detail = `type${baseType}`;

        const range = this.createRange(type.start, type.end);
        const selectionRange = type.name ? this.createRange(type.name.start, type.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.TypeParameter,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(type, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建库符号
     */
    private createLibrarySymbol(
        library: ZincLibraryDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!library.name) {
            return null;
        }

        const name = library.name.name;
        const requirements = library.requirements.length > 0
            ? ` requires ${library.requirements.map(r => r.name).join(', ')}`
            : '';
        const publicStr = library.isPublic ? 'public ' : '';
        const privateStr = library.isPrivate ? 'private ' : '';
        const detail = `${publicStr}${privateStr}library${requirements}`;

        const range = this.createRange(library.start, library.end);
        const selectionRange = library.name ? this.createRange(library.name.start, library.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Namespace,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(library, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建模块符号
     */
    private createModuleSymbol(
        module: ZincModuleDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!module.name) {
            return null;
        }

        const name = module.name.name;
        const detail = 'module';

        const range = this.createRange(module.start, module.end);
        const selectionRange = module.name ? this.createRange(module.name.start, module.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Module,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(module, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
    }

    /**
     * 创建方法符号
     */
    private createMethodSymbol(
        method: ZincMethodDeclaration,
        filePath: string
    ): vscode.DocumentSymbol | null {
        if (!method.name) {
            return null;
        }

        const name = method.name.name;
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.name : 'nothing';
                return `${typeStr} ${p.name ? p.name.name : ''}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.name : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        const detail = `${staticStr}method(${params || 'nothing'}) -> ${returnType}`;

        const range = this.createRange(method.start, method.end);
        const selectionRange = method.name ? this.createRange(method.name.start, method.name.end) : range;

        const symbol = new vscode.DocumentSymbol(
            name,
            detail,
            vscode.SymbolKind.Method,
            range,
            selectionRange
        );

        // 添加注释作为文档
        const comment = this.extractCommentForStatement(method, filePath);
        if (comment) {
            symbol.detail = `${detail}\n\n${comment}`;
        }

        return symbol;
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

            const commentLines = extractLeadingComments(fileContent, stmt.start.line);
            if (commentLines.length === 0) {
                return null;
            }

            const parsedComment = parseComment(commentLines);
            return formatCommentAsMarkdown(parsedComment);
        } catch (error) {
            console.error(`Failed to extract comment for statement in ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 创建 VSCode Range
     */
    private createRange(
        start: { line: number; position: number } | undefined,
        end: { line: number; position: number } | undefined
    ): vscode.Range {
        if (!start || !end) {
            return new vscode.Range(0, 0, 0, 0);
        }

        return new vscode.Range(
            new vscode.Position(start.line, start.position),
            new vscode.Position(end.line, end.position)
        );
    }
}

