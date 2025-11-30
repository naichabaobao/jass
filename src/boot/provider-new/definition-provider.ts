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
    Identifier
} from '../vjass/vjass-ast';
import { TextMacroRegistry } from '../vjass/text-macro-registry';

/**
 * 基于新 AST 系统的定义提供者
 */
export class DefinitionProvider implements vscode.DefinitionProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
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

            // 检查当前位置是否在 runtextmacro 调用中
            const lineText = document.lineAt(position.line).text;
            const isRunTextMacroLine = /\/\/!\s*runtextmacro/i.test(lineText);
            
            // 如果是在 runtextmacro 行上，优先查找 TextMacro 定义
            if (isRunTextMacroLine) {
                const textMacroRegistry = TextMacroRegistry.getInstance();
                const macro = textMacroRegistry.find(symbolName);
                if (macro && macro.start && macro.end) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(macro.filePath),
                        new vscode.Range(
                            new vscode.Position(macro.start.line, macro.start.position),
                            new vscode.Position(macro.end.line, macro.end.position)
                        )
                    ));
                    // 如果找到了 textmacro 定义，直接返回（优先显示 textmacro 定义）
                    if (locations.length > 0) {
                        return locations;
                    }
                }
            }

            // 从所有缓存的文件中查找定义
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            for (const cachedFilePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                if (!blockStatement) {
                    continue;
                }

                // 在当前文件中查找定义
                this.findDefinitionsInBlock(blockStatement, symbolName, cachedFilePath, locations);
            }

            // 查找 TextMacro 定义（如果还没有找到）
            if (!isRunTextMacroLine) {
                const textMacroRegistry = TextMacroRegistry.getInstance();
                const macro = textMacroRegistry.find(symbolName);
                if (macro && macro.start && macro.end) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(macro.filePath),
                        new vscode.Range(
                            new vscode.Position(macro.start.line, macro.start.position),
                            new vscode.Position(macro.end.line, macro.end.position)
                        )
                    ));
                }
            }

            return locations.length > 0 ? locations : null;
        } catch (error) {
            console.error('Error in provideDefinition:', error);
            return null;
        }
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
            // 在 globals 块中查找全局变量定义
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
            // 函数声明
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // Native 函数声明
            else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 函数接口声明
            else if (stmt instanceof FunctionInterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 变量声明
            else if (stmt instanceof VariableDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 类型声明
            else if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                // 查找结构体成员
                this.findStructMemberDefinitions(stmt, symbolName, filePath, locations);
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                // 查找接口成员
                this.findInterfaceMemberDefinitions(stmt, symbolName, filePath, locations);
            }
            // 模块声明
            else if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
                // 查找模块成员
                this.findModuleMemberDefinitions(stmt, symbolName, filePath, locations);
            }
            // 委托声明
            else if (stmt instanceof DelegateDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // Library 声明
            else if (stmt instanceof LibraryDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // Scope 声明
            else if (stmt instanceof ScopeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // TextMacro 声明
            else if (stmt instanceof TextMacroStatement) {
                if (stmt.name === symbolName && stmt.start) {
                    // 指向 textmacro 定义的宏名称位置
                    // 尝试从文件内容中获取行文本以精确定位宏名称
                    const fileContent = this.dataEnterManager.getFileContent(filePath);
                    if (fileContent && stmt.start.line >= 0 && stmt.start.line < fileContent.split('\n').length) {
                        const lines = fileContent.split('\n');
                        const lineText = lines[stmt.start.line];
                        // 查找 "textmacro" 关键字后的宏名称
                        const textmacroMatch = lineText.match(/\/\/!\s*textmacro\s+(\w+)/i);
                        if (textmacroMatch && textmacroMatch[1] === stmt.name) {
                            const macroNameIndex = textmacroMatch.index! + textmacroMatch[0].indexOf(textmacroMatch[1]);
                            locations.push(new vscode.Location(
                                vscode.Uri.file(filePath),
                                new vscode.Range(
                                    new vscode.Position(stmt.start.line, macroNameIndex),
                                    new vscode.Position(stmt.start.line, macroNameIndex + stmt.name.length)
                                )
                            ));
                        } else {
                            // 回退到使用 start 位置
                            locations.push(new vscode.Location(
                                vscode.Uri.file(filePath),
                                new vscode.Range(
                                    new vscode.Position(stmt.start.line, stmt.start.position),
                                    new vscode.Position(stmt.start.line, stmt.start.position + stmt.name.length)
                                )
                            ));
                        }
                    } else {
                        // 回退到使用 start 位置
                        locations.push(new vscode.Location(
                            vscode.Uri.file(filePath),
                            new vscode.Range(
                                new vscode.Position(stmt.start.line, stmt.start.position),
                                new vscode.Position(stmt.start.line, stmt.start.position + stmt.name.length)
                            )
                        ));
                    }
                }
            }
            // RunTextMacro 调用 - 跳转到对应的 textmacro 定义
            else if (stmt instanceof RunTextMacroStatement) {
                if (stmt.name === symbolName) {
                    // 查找对应的 textmacro 定义
                    const textMacroRegistry = TextMacroRegistry.getInstance();
                    const macro = textMacroRegistry.find(symbolName);
                    if (macro && macro.start && macro.end) {
                        // 创建位置，指向 textmacro 定义的开始位置（宏名称）
                        const macroNameStart = macro.start.position;
                        const macroNameEnd = macro.start.position + macro.name.length;
                        locations.push(new vscode.Location(
                            vscode.Uri.file(macro.filePath),
                            new vscode.Range(
                                new vscode.Position(macro.start.line, macroNameStart),
                                new vscode.Position(macro.start.line, macroNameEnd)
                            )
                        ));
                    }
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
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

