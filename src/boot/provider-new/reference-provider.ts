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
    RunTextMacroStatement,
    ImplementStatement,
    Identifier,
    Expression
} from '../vjass/vjass-ast';
import { TextMacroRegistry } from '../vjass/text-macro-registry';

/**
 * 基于新 AST 系统的引用提供者
 */
export class ReferenceProvider implements vscode.ReferenceProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Location[]> {
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

            const locations: vscode.Location[] = [];
            const filePath = document.uri.fsPath;

            // 首先找到定义位置
            const definitions = this.findDefinitions(symbolName);
            
            // 如果 includeDeclaration 为 true，添加定义位置
            if (context.includeDeclaration && definitions.length > 0) {
                locations.push(...definitions);
            }

            // 从所有缓存的文件中查找引用
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            for (const cachedFilePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                if (!blockStatement) {
                    continue;
                }

                // 在当前文件中查找引用
                this.findReferencesInBlock(blockStatement, symbolName, cachedFilePath, locations, definitions);
            }

            // 查找 TextMacro 引用
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const macro = textMacroRegistry.find(symbolName);
            if (macro) {
                // 查找所有使用该宏的地方
                this.findTextMacroReferences(symbolName, locations);
            }

            return locations.length > 0 ? locations : null;
        } catch (error) {
            console.error('Error in provideReferences:', error);
            return null;
        }
    }

    /**
     * 查找定义位置
     */
    private findDefinitions(symbolName: string): vscode.Location[] {
        const locations: vscode.Location[] = [];
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }

            this.findDefinitionsInBlock(blockStatement, symbolName, cachedFilePath, locations);
        }

        return locations;
    }

    /**
     * 在 BlockStatement 中查找定义
     */
    private findDefinitionsInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.name && stmt.name.name === symbolName) {
                        this.addLocation(stmt.name, filePath, locations);
                    }
                }
            }
            return;
        }

        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof FunctionInterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof VariableDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                this.findStructMemberDefinitions(stmt, symbolName, filePath, locations);
            } else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                this.findInterfaceMemberDefinitions(stmt, symbolName, filePath, locations);
            } else if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                this.findModuleMemberDefinitions(stmt, symbolName, filePath, locations);
            } else if (stmt instanceof DelegateDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof LibraryDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof ScopeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            } else if (stmt instanceof TextMacroStatement) {
                if (stmt.name === symbolName && stmt.start && stmt.end) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(filePath),
                        new vscode.Range(
                            new vscode.Position(stmt.start.line, stmt.start.position),
                            new vscode.Position(stmt.end.line, stmt.end.position)
                        )
                    ));
                }
            } else if (stmt instanceof BlockStatement) {
                this.findDefinitionsInBlock(stmt, symbolName, filePath, locations);
            }
        }
    }

    /**
     * 查找结构体成员定义
     */
    private findStructMemberDefinitions(
        struct: StructDeclaration,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof VariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof DelegateDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    this.addLocation(member.moduleName, filePath, locations);
                }
            }
        }
    }

    /**
     * 查找接口成员定义
     */
    private findInterfaceMemberDefinitions(
        interface_: InterfaceDeclaration,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const member of interface_.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            }
        }
    }

    /**
     * 查找模块成员定义
     */
    private findModuleMemberDefinitions(
        module: ModuleDeclaration,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const member of module.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    this.addLocation(member.moduleName, filePath, locations);
                }
            }
        }
    }

    /**
     * 在 BlockStatement 中查找引用
     */
    private findReferencesInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[],
        definitions: vscode.Location[]
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            return; // globals 块中只有定义，没有引用
        }

        for (const stmt of block.body) {
            // 查找 runtextmacro 引用
            if (stmt instanceof RunTextMacroStatement) {
                if (stmt.name === symbolName && stmt.start && stmt.end) {
                    const location = new vscode.Location(
                        vscode.Uri.file(filePath),
                        new vscode.Range(
                            new vscode.Position(stmt.start.line, stmt.start.position),
                            new vscode.Position(stmt.end.line, stmt.end.position)
                        )
                    );
                    // 检查是否与定义位置相同
                    const isDefinition = definitions.some(def => 
                        def.uri.fsPath === location.uri.fsPath &&
                        def.range.start.line === location.range.start.line &&
                        def.range.start.character === location.range.start.character
                    );
                    if (!isDefinition) {
                        locations.push(location);
                    }
                }
            }
            
            // 查找函数调用、变量使用等
            this.findReferencesInStatement(stmt, symbolName, filePath, locations, definitions);
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.findReferencesInBlock(stmt, symbolName, filePath, locations, definitions);
            }
        }
    }

    /**
     * 在语句中查找引用
     */
    private findReferencesInStatement(
        stmt: Statement,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[],
        definitions: vscode.Location[]
    ): void {
        // 检查函数参数中的引用
        if (stmt instanceof FunctionDeclaration) {
            for (const param of stmt.parameters) {
                if (param.type && param.type instanceof Identifier && this.isIdentifierMatch(param.type, symbolName)) {
                    this.addLocationIfNotDefinition(param.type, filePath, locations, definitions);
                }
            }
            if (stmt.returnType && stmt.returnType instanceof Identifier && this.isIdentifierMatch(stmt.returnType, symbolName)) {
                this.addLocationIfNotDefinition(stmt.returnType, filePath, locations, definitions);
            }
        } else if (stmt instanceof MethodDeclaration) {
            for (const param of stmt.parameters) {
                if (param.type && param.type instanceof Identifier && this.isIdentifierMatch(param.type, symbolName)) {
                    this.addLocationIfNotDefinition(param.type, filePath, locations, definitions);
                }
            }
            if (stmt.returnType && stmt.returnType instanceof Identifier && this.isIdentifierMatch(stmt.returnType, symbolName)) {
                this.addLocationIfNotDefinition(stmt.returnType, filePath, locations, definitions);
            }
        } else if (stmt instanceof VariableDeclaration) {
            // 检查变量类型引用
            if (stmt.type && stmt.type instanceof Identifier && this.isIdentifierMatch(stmt.type, symbolName)) {
                this.addLocationIfNotDefinition(stmt.type, filePath, locations, definitions);
            }
        } else if (stmt instanceof StructDeclaration) {
            // 检查 extends 类型引用
            if (stmt.extendsType && this.isIdentifierMatch(stmt.extendsType, symbolName)) {
                this.addLocationIfNotDefinition(stmt.extendsType, filePath, locations, definitions);
            }
            // 检查结构体成员中的引用
            for (const member of stmt.members) {
                this.findReferencesInStatement(member, symbolName, filePath, locations, definitions);
            }
        } else if (stmt instanceof DelegateDeclaration) {
            // 检查委托类型引用
            if (stmt.delegateType && stmt.delegateType.name === symbolName) {
                this.addLocationIfNotDefinition(stmt.delegateType, filePath, locations, definitions);
            }
        } else if (stmt instanceof ImplementStatement) {
            // implement 语句中的模块名引用
            if (stmt.moduleName && stmt.moduleName.name === symbolName) {
                this.addLocationIfNotDefinition(stmt.moduleName, filePath, locations, definitions);
            }
        }
    }

    /**
     * 查找 TextMacro 引用（查找所有 runtextmacro 的使用）
     */
    private findTextMacroReferences(symbolName: string, locations: vscode.Location[]): void {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        const definitions = this.findDefinitions(symbolName);

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }

            // 查找所有 runtextmacro 调用
            this.findRunTextMacroReferencesInBlock(blockStatement, symbolName, cachedFilePath, locations, definitions);
        }
    }

    /**
     * 在 BlockStatement 中查找 runtextmacro 引用
     */
    private findRunTextMacroReferencesInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[],
        definitions: vscode.Location[]
    ): void {
        if (this.isGlobalsBlock(block)) {
            return;
        }

        for (const stmt of block.body) {
            if (stmt instanceof RunTextMacroStatement) {
                if (stmt.name === symbolName && stmt.start && stmt.end) {
                    const location = new vscode.Location(
                        vscode.Uri.file(filePath),
                        new vscode.Range(
                            new vscode.Position(stmt.start.line, stmt.start.position),
                            new vscode.Position(stmt.end.line, stmt.end.position)
                        )
                    );
                    // 检查是否与定义位置相同
                    const isDefinition = definitions.some(def => 
                        def.uri.fsPath === location.uri.fsPath &&
                        def.range.start.line === location.range.start.line &&
                        def.range.start.character === location.range.start.character
                    );
                    if (!isDefinition) {
                        locations.push(location);
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                this.findRunTextMacroReferencesInBlock(stmt, symbolName, filePath, locations, definitions);
            }
        }
    }

    /**
     * 检查 Identifier 是否匹配
     */
    private isIdentifierMatch(identifier: any, symbolName: string): boolean {
        if (identifier instanceof Identifier) {
            return identifier.name === symbolName;
        }
        if (typeof identifier.toString === 'function') {
            return identifier.toString() === symbolName;
        }
        return false;
    }

    /**
     * 如果不是定义位置，则添加引用位置
     */
    private addLocationIfNotDefinition(
        identifier: Identifier,
        filePath: string,
        locations: vscode.Location[],
        definitions: vscode.Location[]
    ): void {
        if (!identifier.start || !identifier.end) {
            return;
        }

        const location = new vscode.Location(
            vscode.Uri.file(filePath),
            new vscode.Range(
                new vscode.Position(identifier.start.line, identifier.start.position),
                new vscode.Position(identifier.end.line, identifier.end.position)
            )
        );

        // 检查是否与定义位置相同
        const isDefinition = definitions.some(def => 
            def.uri.fsPath === location.uri.fsPath &&
            def.range.start.line === location.range.start.line &&
            def.range.start.character === location.range.start.character
        );

        if (!isDefinition) {
            locations.push(location);
        }
    }

    /**
     * 添加位置到结果列表
     */
    private addLocation(identifier: Identifier, filePath: string, locations: vscode.Location[]): void {
        if (identifier.start && identifier.end) {
            locations.push(new vscode.Location(
                vscode.Uri.file(filePath),
                new vscode.Range(
                    new vscode.Position(identifier.start.line, identifier.start.position),
                    new vscode.Position(identifier.end.line, identifier.end.position)
                )
            ));
        }
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

