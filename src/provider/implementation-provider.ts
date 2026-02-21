import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import {
    BlockStatement,
    Statement,
    StructDeclaration,
    InterfaceDeclaration,
    MethodDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    Identifier
} from '../vjass/ast';
import { ZincBlockHelper } from './zinc-block-parser';
import { ZincDefinitionProvider } from './zinc/zinc-definition-provider';

/**
 * 实现提供者
 * 提供"转到实现"功能，用于查找接口的实现或方法的实现
 */
export class ImplementationProvider implements vscode.ImplementationProvider {
    private dataEnterManager: DataEnterManager;
    private zincDefinitionProvider: ZincDefinitionProvider;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.zincDefinitionProvider = new ZincDefinitionProvider(dataEnterManager);
    }

    provideImplementation(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        try {
            // 检查是否在 //! zinc 块内
            const zincBlockInfo = ZincBlockHelper.findZincBlock(document, position, this.dataEnterManager);
            if (zincBlockInfo && zincBlockInfo.program) {
                // 在 Zinc 块内，暂时返回 null（Zinc 实现提供者可以后续添加）
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

            const filePath = document.uri.fsPath;
            const locations: vscode.Location[] = [];

            // 从所有缓存的文件中查找实现
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            // 首先查找当前符号是否是接口或接口方法
            let interfaceDecl: InterfaceDeclaration | null = null;
            let interfaceMethod: MethodDeclaration | null = null;

            for (const cachedFilePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                if (!blockStatement) {
                    // 调试：检查为什么 blockStatement 为 null
                    console.warn(`[ImplementationProvider] BlockStatement is null for file: ${cachedFilePath}`);
                    continue;
                }

                // 查找接口声明
                const foundInterface = this.findInterfaceInBlock(blockStatement, symbolName, cachedFilePath);
                if (foundInterface) {
                    interfaceDecl = foundInterface;
                    break;
                }
            }

            // 如果找到了接口，查找所有实现该接口的结构
            if (interfaceDecl) {
                this.findInterfaceImplementations(interfaceDecl, allCachedFiles, locations);
            } else {
                // 如果没有找到接口，可能是接口方法
                // 查找接口方法的所有实现
                this.findMethodImplementations(symbolName, allCachedFiles, locations, filePath, position);
            }

            return locations.length > 0 ? locations : null;
        } catch (error) {
            console.error('Error in ImplementationProvider.provideImplementation:', error);
            return null;
        }
    }

    /**
     * 在 BlockStatement 中查找接口声明
     */
    private findInterfaceInBlock(
        block: BlockStatement,
        interfaceName: string,
        filePath: string
    ): InterfaceDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === interfaceName) {
                    return stmt;
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        if (member.name && member.name.name === interfaceName) {
                            return member;
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        if (member.name && member.name.name === interfaceName) {
                            return member;
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findInterfaceInBlock(stmt, interfaceName, filePath);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    /**
     * 查找接口的所有实现（结构）
     */
    private findInterfaceImplementations(
        interfaceDecl: InterfaceDeclaration,
        allCachedFiles: string[],
        locations: vscode.Location[]
    ): void {
        const interfaceName = interfaceDecl.name?.name;
        if (!interfaceName) {
            return;
        }

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                // 调试：检查为什么 blockStatement 为 null
                console.warn(`[ImplementationProvider] BlockStatement is null for file: ${cachedFilePath}`);
                continue;
            }

            this.findStructsImplementingInterface(blockStatement, interfaceName, cachedFilePath, locations);
        }
    }

    /**
     * 在 BlockStatement 中查找实现指定接口的结构
     */
    private findStructsImplementingInterface(
        block: BlockStatement,
        interfaceName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                // 检查结构是否实现了该接口
                if (stmt.extendsType && stmt.extendsType.name === interfaceName) {
                    if (stmt.name && stmt.start && stmt.end) {
                        locations.push(new vscode.Location(
                            vscode.Uri.file(filePath),
                            new vscode.Range(
                                new vscode.Position(stmt.start.line, stmt.start.position),
                                new vscode.Position(stmt.end.line, stmt.end.position)
                            )
                        ));
                    }
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === interfaceName) {
                            if (member.name && member.start && member.end) {
                                locations.push(new vscode.Location(
                                    vscode.Uri.file(filePath),
                                    new vscode.Range(
                                        new vscode.Position(member.start.line, member.start.position),
                                        new vscode.Position(member.end.line, member.end.position)
                                    )
                                ));
                            }
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === interfaceName) {
                            if (member.name && member.start && member.end) {
                                locations.push(new vscode.Location(
                                    vscode.Uri.file(filePath),
                                    new vscode.Range(
                                        new vscode.Position(member.start.line, member.start.position),
                                        new vscode.Position(member.end.line, member.end.position)
                                    )
                                ));
                            }
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                this.findStructsImplementingInterface(stmt, interfaceName, filePath, locations);
            }
        }
    }

    /**
     * 查找方法的所有实现
     */
    private findMethodImplementations(
        methodName: string,
        allCachedFiles: string[],
        locations: vscode.Location[],
        currentFilePath: string,
        currentPosition: vscode.Position
    ): void {
        // 首先查找当前方法所在的接口
        let interfaceDecl: InterfaceDeclaration | null = null;
        let interfaceMethod: MethodDeclaration | null = null;

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                // 调试：检查为什么 blockStatement 为 null
                console.warn(`[ImplementationProvider] BlockStatement is null for file: ${cachedFilePath}`);
                continue;
            }

            const found = this.findMethodInInterface(blockStatement, methodName, cachedFilePath);
            if (found) {
                interfaceDecl = found.interface;
                interfaceMethod = found.method;
                break;
            }
        }

        // 如果找到了接口方法，查找所有实现该接口的结构中的方法实现
        if (interfaceDecl && interfaceMethod) {
            const interfaceName = interfaceDecl.name?.name;
            if (interfaceName) {
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }

                    this.findMethodImplementationsInStructs(
                        blockStatement,
                        interfaceName,
                        methodName,
                        cachedFilePath,
                        locations
                    );
                }
            }
        } else {
            // 如果没有找到接口方法，可能是结构方法
            // 查找所有重写该方法的结构
            this.findMethodOverrides(methodName, allCachedFiles, locations, currentFilePath, currentPosition);
        }
    }

    /**
     * 在 BlockStatement 中查找接口方法
     */
    private findMethodInInterface(
        block: BlockStatement,
        methodName: string,
        filePath: string
    ): { interface: InterfaceDeclaration; method: MethodDeclaration } | null {
        for (const stmt of block.body) {
            if (stmt instanceof InterfaceDeclaration) {
                // InterfaceDeclaration 的 members 包含 MethodDeclaration
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.name && member.name.name === methodName) {
                            return { interface: stmt, method: member };
                        }
                    }
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        for (const interfaceMember of member.members) {
                            if (interfaceMember instanceof MethodDeclaration) {
                                if (interfaceMember.name && interfaceMember.name.name === methodName) {
                                    return { interface: member, method: interfaceMember };
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        for (const interfaceMember of member.members) {
                            if (interfaceMember instanceof MethodDeclaration) {
                                if (interfaceMember.name && interfaceMember.name.name === methodName) {
                                    return { interface: member, method: interfaceMember };
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findMethodInInterface(stmt, methodName, filePath);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    /**
     * 在实现指定接口的结构中查找方法实现
     */
    private findMethodImplementationsInStructs(
        block: BlockStatement,
        interfaceName: string,
        methodName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                // 检查结构是否实现了该接口
                if (stmt.extendsType && stmt.extendsType.name === interfaceName) {
                    // 查找结构中的方法实现
                    for (const member of stmt.members) {
                        if (member instanceof MethodDeclaration) {
                            if (member.name && member.name.name === methodName) {
                                if (member.start && member.end) {
                                    locations.push(new vscode.Location(
                                        vscode.Uri.file(filePath),
                                        new vscode.Range(
                                            new vscode.Position(member.start.line, member.start.position),
                                            new vscode.Position(member.end.line, member.end.position)
                                        )
                                    ));
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === interfaceName) {
                            for (const structMember of member.members) {
                                if (structMember instanceof MethodDeclaration) {
                                    if (structMember.name && structMember.name.name === methodName) {
                                        if (structMember.start && structMember.end) {
                                            locations.push(new vscode.Location(
                                                vscode.Uri.file(filePath),
                                                new vscode.Range(
                                                    new vscode.Position(structMember.start.line, structMember.start.position),
                                                    new vscode.Position(structMember.end.line, structMember.end.position)
                                                )
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === interfaceName) {
                            for (const structMember of member.members) {
                                if (structMember instanceof MethodDeclaration) {
                                    if (structMember.name && structMember.name.name === methodName) {
                                        if (structMember.start && structMember.end) {
                                            locations.push(new vscode.Location(
                                                vscode.Uri.file(filePath),
                                                new vscode.Range(
                                                    new vscode.Position(structMember.start.line, structMember.start.position),
                                                    new vscode.Position(structMember.end.line, structMember.end.position)
                                                )
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                this.findMethodImplementationsInStructs(stmt, interfaceName, methodName, filePath, locations);
            }
        }
    }

    /**
     * 查找方法的重写（在子结构中）
     */
    private findMethodOverrides(
        methodName: string,
        allCachedFiles: string[],
        locations: vscode.Location[],
        currentFilePath: string,
        currentPosition: vscode.Position
    ): void {
        // 首先查找当前方法所在的结构
        let parentStruct: StructDeclaration | null = null;
        let parentMethod: MethodDeclaration | null = null;

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                // 调试：检查为什么 blockStatement 为 null
                console.warn(`[ImplementationProvider] BlockStatement is null for file: ${cachedFilePath}`);
                continue;
            }

            const found = this.findMethodInStruct(blockStatement, methodName, cachedFilePath, currentFilePath, currentPosition);
            if (found) {
                parentStruct = found.struct;
                parentMethod = found.method;
                break;
            }
        }

        // 如果找到了父结构和方法，查找所有继承该结构的子结构中的方法重写
        if (parentStruct && parentMethod) {
            const parentStructName = parentStruct.name?.name;
            if (parentStructName) {
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        // 调试：检查为什么 blockStatement 为 null
                        console.warn(`[ImplementationProvider] BlockStatement is null for file: ${cachedFilePath}`);
                        continue;
                    }

                    this.findMethodOverridesInStructs(
                        blockStatement,
                        parentStructName,
                        methodName,
                        cachedFilePath,
                        locations
                    );
                }
            }
        }
    }

    /**
     * 在 BlockStatement 中查找结构方法
     */
    private findMethodInStruct(
        block: BlockStatement,
        methodName: string,
        filePath: string,
        currentFilePath: string,
        currentPosition: vscode.Position
    ): { struct: StructDeclaration; method: MethodDeclaration } | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.name && member.name.name === methodName) {
                            // 检查位置是否匹配
                            if (filePath === currentFilePath && member.start && member.end) {
                                if (currentPosition.line >= member.start.line && currentPosition.line <= member.end.line) {
                                    return { struct: stmt, method: member };
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        for (const structMember of member.members) {
                            if (structMember instanceof MethodDeclaration) {
                                if (structMember.name && structMember.name.name === methodName) {
                                    if (filePath === currentFilePath && structMember.start && structMember.end) {
                                        if (currentPosition.line >= structMember.start.line && currentPosition.line <= structMember.end.line) {
                                            return { struct: member, method: structMember };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        for (const structMember of member.members) {
                            if (structMember instanceof MethodDeclaration) {
                                if (structMember.name && structMember.name.name === methodName) {
                                    if (filePath === currentFilePath && structMember.start && structMember.end) {
                                        if (currentPosition.line >= structMember.start.line && currentPosition.line <= structMember.end.line) {
                                            return { struct: member, method: structMember };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findMethodInStruct(stmt, methodName, filePath, currentFilePath, currentPosition);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    /**
     * 在继承指定结构的子结构中查找方法重写
     */
    private findMethodOverridesInStructs(
        block: BlockStatement,
        parentStructName: string,
        methodName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                // 检查结构是否继承自父结构
                if (stmt.extendsType && stmt.extendsType.name === parentStructName) {
                    // 查找结构中的方法重写
                    for (const member of stmt.members) {
                        if (member instanceof MethodDeclaration) {
                            if (member.name && member.name.name === methodName) {
                                if (member.start && member.end) {
                                    locations.push(new vscode.Location(
                                        vscode.Uri.file(filePath),
                                        new vscode.Range(
                                            new vscode.Position(member.start.line, member.start.position),
                                            new vscode.Position(member.end.line, member.end.position)
                                        )
                                    ));
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === parentStructName) {
                            for (const structMember of member.members) {
                                if (structMember instanceof MethodDeclaration) {
                                    if (structMember.name && structMember.name.name === methodName) {
                                        if (structMember.start && structMember.end) {
                                            locations.push(new vscode.Location(
                                                vscode.Uri.file(filePath),
                                                new vscode.Range(
                                                    new vscode.Position(structMember.start.line, structMember.start.position),
                                                    new vscode.Position(structMember.end.line, structMember.end.position)
                                                )
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof StructDeclaration) {
                        if (member.extendsType && member.extendsType.name === parentStructName) {
                            for (const structMember of member.members) {
                                if (structMember instanceof MethodDeclaration) {
                                    if (structMember.name && structMember.name.name === methodName) {
                                        if (structMember.start && structMember.end) {
                                            locations.push(new vscode.Location(
                                                vscode.Uri.file(filePath),
                                                new vscode.Range(
                                                    new vscode.Position(structMember.start.line, structMember.start.position),
                                                    new vscode.Position(structMember.end.line, structMember.end.position)
                                                )
                                            ));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                this.findMethodOverridesInStructs(stmt, parentStructName, methodName, filePath, locations);
            }
        }
    }
}

