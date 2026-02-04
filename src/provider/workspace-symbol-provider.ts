import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import { DefineRegistry } from '../vjass/define-registry';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
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
    Identifier
} from '../vjass/ast';

/**
 * 工作区符号提供者
 * 支持在工作区范围内搜索符号（函数、变量、类型、结构体、接口、模块、委托、TextMacro、#define）
 */
export class WorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideWorkspaceSymbols(
        query: string,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[]> {
        try {
            const symbols: vscode.SymbolInformation[] = [];
            const lowerQuery = query.toLowerCase().trim();

            // 如果查询为空，返回空数组
            if (!lowerQuery || lowerQuery.length === 0) {
                return symbols;
            }

            // 限制最大结果数量，避免性能问题
            const MAX_RESULTS = 1000;

            // 获取所有缓存的文件
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            // 1. 从 AST 中提取符号（函数、变量、类型等）
            for (const filePath of allCachedFiles) {
                if (token.isCancellationRequested || symbols.length >= MAX_RESULTS) {
                    break;
                }

                const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                if (!blockStatement) {
                    continue;
                }

                this.extractSymbolsFromBlock(blockStatement, filePath, lowerQuery, symbols);
            }

            // 2. 添加 TextMacro 符号
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const allMacros = textMacroRegistry.getAll();
            for (const macro of allMacros) {
                if (token.isCancellationRequested || symbols.length >= MAX_RESULTS) {
                    break;
                }

                if (macro.name.toLowerCase().includes(lowerQuery)) {
                    const location = macro.start && macro.end
                        ? new vscode.Location(
                              vscode.Uri.file(macro.filePath),
                              new vscode.Range(
                                  new vscode.Position(macro.start.line, macro.start.position),
                                  new vscode.Position(macro.end.line, macro.end.position)
                              )
                          )
                        : new vscode.Location(
                              vscode.Uri.file(macro.filePath),
                              new vscode.Range(0, 0, 0, 0)
                          );

                    const params = macro.parameters.length > 0
                        ? ` takes ${macro.parameters.join(', ')}`
                        : '';
                    const detail = `textmacro${params}`;

                    symbols.push(new vscode.SymbolInformation(
                        macro.name,
                        vscode.SymbolKind.Function,
                        detail,
                        location
                    ));
                }
            }

            // 3. 添加 #define 符号
            const defineRegistry = DefineRegistry.getInstance();
            const allDefines = defineRegistry.getAll();
            for (const define of allDefines) {
                if (token.isCancellationRequested || symbols.length >= MAX_RESULTS) {
                    break;
                }

                if (define.name.toLowerCase().includes(lowerQuery)) {
                    // 优化多行 #define 的显示
                    let valueStr = define.value ? ` ${define.value}` : '';
                    // 如果值太长，截断显示
                    if (valueStr.length > 50) {
                        valueStr = valueStr.substring(0, 50) + '...';
                    }
                    const detail = `#define${valueStr}`;

                    // 尝试获取精确位置
                    const fileContent = this.dataEnterManager.getFileContent(define.filePath);
                    let range: vscode.Range;
                    
                    if (fileContent) {
                        const lines = fileContent.split('\n');
                        if (define.lineNumber < lines.length) {
                            const line = lines[define.lineNumber];
                            const defineMatch = line.match(/^\s*#define\s+/);
                            if (defineMatch) {
                                const startChar = defineMatch[0].length;
                                const endChar = startChar + define.name.length;
                                range = new vscode.Range(
                                    new vscode.Position(define.lineNumber, startChar),
                                    new vscode.Position(define.lineNumber, endChar)
                                );
                            } else {
                                range = new vscode.Range(
                                    new vscode.Position(define.lineNumber, 0),
                                    new vscode.Position(define.lineNumber, define.name.length)
                                );
                            }
                        } else {
                            range = new vscode.Range(
                                new vscode.Position(define.lineNumber, 0),
                                new vscode.Position(define.lineNumber, define.name.length)
                            );
                        }
                    } else {
                        range = new vscode.Range(
                            new vscode.Position(define.lineNumber, 0),
                            new vscode.Position(define.lineNumber, define.name.length)
                        );
                    }

                    symbols.push(new vscode.SymbolInformation(
                        define.name,
                        vscode.SymbolKind.Constant,
                        detail,
                        new vscode.Location(vscode.Uri.file(define.filePath), range)
                    ));
                }
            }

            // 对结果进行排序：优先显示精确匹配，然后按名称排序
            symbols.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const queryLower = lowerQuery;
                
                // 精确匹配优先
                const aExact = aName === queryLower;
                const bExact = bName === queryLower;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                
                // 前缀匹配优先
                const aStarts = aName.startsWith(queryLower);
                const bStarts = bName.startsWith(queryLower);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                
                // 按名称排序
                return aName.localeCompare(bName);
            });

            return symbols;
        } catch (error) {
            console.error('Error in provideWorkspaceSymbols:', error);
            return [];
        }
    }

    /**
     * 从 BlockStatement 中提取符号
     */
    private extractSymbolsFromBlock(
        block: BlockStatement,
        filePath: string,
        query: string,
        symbols: vscode.SymbolInformation[]
    ): void {
        if (this.isGlobalsBlock(block)) {
            return;
        }

        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Function,
                            'function',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Function,
                            'native',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof FunctionInterfaceDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Interface,
                            'function interface',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof VariableDeclaration) {
                if (!stmt.isLocal && stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        const kind = stmt.isConstant
                            ? vscode.SymbolKind.Constant
                            : vscode.SymbolKind.Variable;
                        const detail = stmt.isConstant ? 'constant' : 'variable';
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            kind,
                            detail,
                            location
                        ));
                    }
                }
            } else if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.TypeParameter,
                            'type',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Struct,
                            'struct',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Interface,
                            'interface',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Module,
                            'module',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof DelegateDeclaration) {
                if (stmt.name && stmt.name.name.toLowerCase().includes(query)) {
                    const location = this.createLocation(stmt.name, filePath);
                    if (location) {
                        symbols.push(new vscode.SymbolInformation(
                            stmt.name.name,
                            vscode.SymbolKind.Function,
                            'delegate',
                            location
                        ));
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                // 递归处理嵌套的 BlockStatement
                this.extractSymbolsFromBlock(stmt, filePath, query, symbols);
            }
        }
    }

    /**
     * 创建位置信息
     */
    private createLocation(identifier: Identifier, filePath: string): vscode.Location | null {
        if (!identifier.start || !identifier.end) {
            return null;
        }

        return new vscode.Location(
            vscode.Uri.file(filePath),
            new vscode.Range(
                new vscode.Position(identifier.start.line, identifier.start.position),
                new vscode.Position(identifier.end.line, identifier.end.position)
            )
        );
    }

    /**
     * 检查是否是 globals 块
     */
    private isGlobalsBlock(block: BlockStatement): boolean {
        if (block.body.length === 0) {
            return false;
        }
        
        let hasGlobalVariable = false;
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                if (stmt.isLocal) {
                    return false;
                }
                hasGlobalVariable = true;
            } else {
                return false;
            }
        }
        
        return hasGlobalVariable;
    }
}
