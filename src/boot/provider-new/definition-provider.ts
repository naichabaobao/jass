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
import { ZincBlockHelper } from './zinc-block-helper';
import { ZincDefinitionProvider } from './zinc/zinc-definition-provider';

/**
 * 基于新 AST 系统的定义提供者
 */
export class DefinitionProvider implements vscode.DefinitionProvider {
    private dataEnterManager: DataEnterManager;
    private zincDefinitionProvider: ZincDefinitionProvider;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.zincDefinitionProvider = new ZincDefinitionProvider(dataEnterManager);
    }

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        try {
            // 检查是否在 //! zinc 块内
            const zincBlockInfo = ZincBlockHelper.findZincBlock(document, position, this.dataEnterManager);
            if (zincBlockInfo && zincBlockInfo.program) {
                // 在 Zinc 块内，使用 Zinc definition provider
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return null;
                }
                
                const symbolName = document.getText(wordRange);
                if (!symbolName) {
                    return null;
                }
                
                const adjustedPosition = new vscode.Position(
                    position.line - zincBlockInfo.startLine,
                    position.character
                );
                
                // 使用 Zinc definition provider 的内部方法
                const locations: vscode.Location[] = [];
                (this.zincDefinitionProvider as any).findDefinitionsInProgram(
                    zincBlockInfo.program,
                    symbolName,
                    document.uri.fsPath,
                    locations
                );
                (this.zincDefinitionProvider as any).findLocalVariableDefinitions(
                    zincBlockInfo.program,
                    symbolName,
                    document.uri.fsPath,
                    adjustedPosition,
                    locations
                );
                
                // 调整位置回到原始文档
                const adjustedLocations = locations.map(loc => {
                    return new vscode.Location(
                        document.uri,
                        new vscode.Range(
                            loc.range.start.line + zincBlockInfo.startLine,
                            loc.range.start.character,
                            loc.range.end.line + zincBlockInfo.startLine,
                            loc.range.end.character
                        )
                    );
                });
                
                if (adjustedLocations.length > 0) {
                    return adjustedLocations;
                }
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
                
                // 查找局部变量和参数的定义（仅在当前文件中）
                if (cachedFilePath === filePath) {
                    this.findLocalVariableDefinitions(blockStatement, symbolName, filePath, position, locations);
                }
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
                // 递归处理 library 的成员（包括 globals 块）
                for (const member of stmt.members) {
                    if (member instanceof BlockStatement) {
                        // 递归处理 BlockStatement（包括 globals 块）
                        this.findDefinitionsInBlock(member, symbolName, filePath, locations);
                    } else {
                        // 对于非 BlockStatement 的成员，创建一个临时的 BlockStatement 来复用现有的处理逻辑
                        // BlockStatement 构造函数参数顺序：statements, start?, end?
                        const tempBlock = new BlockStatement(
                            [member],
                            member.start,
                            member.end
                        );
                        this.findDefinitionsInBlock(tempBlock, symbolName, filePath, locations);
                    }
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
     * 查找局部变量和参数的定义
     */
    private findLocalVariableDefinitions(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        locations: vscode.Location[]
    ): void {
        // 查找包含当前位置的函数或方法
        const funcOrMethod = this.findContainingFunctionOrMethod(block, position);
        if (!funcOrMethod) {
            return;
        }

        // 添加参数的定义
        if (funcOrMethod instanceof FunctionDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name && param.name.name === symbolName) {
                    this.addLocation(param.name, filePath, locations);
                }
            }
            // 在函数体中查找局部变量
            if (funcOrMethod.body) {
                this.findLocalVariablesInBlock(funcOrMethod.body, symbolName, filePath, position, locations);
            }
        } else if (funcOrMethod instanceof MethodDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name && param.name.name === symbolName) {
                    this.addLocation(param.name, filePath, locations);
                }
            }
            // 在方法体中查找局部变量
            if (funcOrMethod.body) {
                this.findLocalVariablesInBlock(funcOrMethod.body, symbolName, filePath, position, locations);
            }
        }
    }

    /**
     * 查找包含指定位置的函数或方法
     * 参数在整个函数范围内都可用（包括函数声明行和函数体）
     */
    private findContainingFunctionOrMethod(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | MethodDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                // 检查位置是否在整个函数范围内（包括函数声明行和函数体）
                if (stmt.start && stmt.end) {
                    const funcStartLine = stmt.start.line;
                    const funcEndLine = stmt.end.line;
                    
                    // 位置在函数开始行和结束行之间（包括结束行）
                    // 允许位置在结束行的下一行（容错处理）
                    if (position.line >= funcStartLine && position.line <= funcEndLine + 1) {
                        return stmt;
                    }
                }
                // 如果没有位置信息，也检查函数体范围（作为补充）
                else if (stmt.body && this.isPositionInRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof MethodDeclaration) {
                // 检查位置是否在整个方法范围内（包括方法声明行和方法体）
                if (stmt.start && stmt.end) {
                    const methodStartLine = stmt.start.line;
                    const methodEndLine = stmt.end.line;
                    
                    // 位置在方法开始行和结束行之间（包括结束行）
                    // 允许位置在结束行的下一行（容错处理）
                    if (position.line >= methodStartLine && position.line <= methodEndLine + 1) {
                        return stmt;
                    }
                }
                // 如果没有位置信息，也检查方法体范围（作为补充）
                else if (stmt.body && this.isPositionInRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                // 递归查找嵌套块
                const nested = this.findContainingFunctionOrMethod(stmt, position);
                if (nested) {
                    return nested;
                }
            }
        }
        return null;
    }

    /**
     * 在代码块中查找局部变量定义
     */
    private findLocalVariablesInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        locations: vscode.Location[]
    ): void {
        for (const stmt of block.body) {
            // 检查是否是局部变量声明
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                // 检查变量是否在指定位置之前声明（作用域检查）
                if (stmt.name && stmt.name.name === symbolName) {
                    if (this.isVariableBeforePosition(stmt, position)) {
                        this.addLocation(stmt.name, filePath, locations);
                    }
                }
            }
            // 递归查找嵌套块中的局部变量
            else if (stmt instanceof BlockStatement) {
                if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                    this.findLocalVariablesInBlock(stmt, symbolName, filePath, position, locations);
                }
            }
        }
    }

    /**
     * 检查变量是否在指定位置之前声明
     */
    private isVariableBeforePosition(
        variable: VariableDeclaration,
        position: vscode.Position
    ): boolean {
        if (!variable.start) {
            return false;
        }

        const varLine = variable.start.line;
        const varPos = variable.start.position || 0;

        // 变量必须在当前位置之前声明
        if (varLine < position.line) {
            return true;
        }
        if (varLine === position.line && varPos < position.character) {
            return true;
        }

        return false;
    }

    /**
     * 检查位置是否在范围内
     */
    private isPositionInRange(
        position: vscode.Position,
        start?: { line: number; position?: number },
        end?: { line: number; position?: number }
    ): boolean {
        if (!start || !end) {
            return false;
        }

        const startLine = start.line;
        const endLine = end.line;
        const startPos = start.position || 0;
        const endPos = end.position || 0;

        if (position.line < startLine || position.line > endLine) {
            return false;
        }
        if (position.line === startLine && position.character < startPos) {
            return false;
        }
        if (position.line === endLine && position.character > endPos) {
            return false;
        }

        return true;
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

