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
import { extractLeadingComments, parseComment } from './comment-parser';
import {
    ZincProgram,
    ZincStatement,
    ZincStructDeclaration,
    ZincInterfaceDeclaration,
    ZincMethodDeclaration,
    ZincVariableDeclaration,
    ZincLibraryDeclaration,
    ZincModuleDeclaration,
    ZincFunctionDeclaration
} from '../vjass/zinc-ast';

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

    private isStatementAllowedForApiVersion(stmt: Statement, filePath: string): boolean {
        const configuredVersion = this.getConfiguredApiVersion();
        if (!configuredVersion || !this.isStrictLegacyApiVersion(configuredVersion)) {
            return true;
        }
        const sinceVersion = this.extractSinceVersionFromStatement(stmt, filePath);
        if (!sinceVersion) {
            return true;
        }
        return this.compareVersions(sinceVersion, configuredVersion) <= 0;
    }

    private getConfiguredApiVersion(): string | null {
        const value = vscode.workspace.getConfiguration('jass').get<string>('apiVersion', 'off');
        if (!value || value === 'off') {
            return null;
        }
        return value;
    }

    private isStrictLegacyApiVersion(version: string): boolean {
        const normalized = version.toLowerCase();
        return normalized === '1.20' ||
            normalized === '1.24' ||
            normalized === '1.26a' ||
            normalized === '1.27' ||
            normalized === '1.27a';
    }

    private extractSinceVersionFromStatement(stmt: Statement, filePath: string): string | null {
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
        const sinceText = (parsedComment.since || parsedComment.version || '').trim();
        if (!sinceText) {
            return null;
        }
        const versionToken = sinceText.match(/(\d+\.\d+(?:\.\d+)?[a-z]?)/i);
        return versionToken?.[1] || null;
    }

    private compareVersions(left: string, right: string): number {
        const l = this.parseVersion(left);
        const r = this.parseVersion(right);
        if (!l || !r) {
            return 0;
        }
        if (l.major !== r.major) return l.major - r.major;
        if (l.minor !== r.minor) return l.minor - r.minor;
        if (l.patch !== r.patch) return l.patch - r.patch;
        return l.suffix - r.suffix;
    }

    private parseVersion(input: string): { major: number; minor: number; patch: number; suffix: number } | null {
        const match = input.toLowerCase().match(/^(\d+)\.(\d+)(?:\.(\d+))?([a-z])?$/);
        if (!match) {
            return null;
        }
        const major = Number(match[1]);
        const minor = Number(match[2]);
        const patch = match[3] ? Number(match[3]) : 0;
        const suffix = match[4] ? (match[4].charCodeAt(0) - 96) : 0;
        return { major, minor, patch, suffix };
    }

    provideImplementation(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        try {
            const filePath = document.uri.fsPath;

            if (this.dataEnterManager.isZincFile(filePath)) {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return null;
                }
                const symbolName = document.getText(wordRange);
                if (!symbolName) {
                    return null;
                }

                const locations: vscode.Location[] = [];
                const currentProgram = this.dataEnterManager.getZincProgram(filePath);
                if (currentProgram) {
                    locations.push(
                        ...this.findImplementationsInZincBlock(currentProgram, symbolName, filePath, 0)
                    );
                }

                for (const cachedFilePath of this.dataEnterManager.getAllCachedFiles()) {
                    if (cachedFilePath === filePath || !this.dataEnterManager.isZincFile(cachedFilePath)) {
                        continue;
                    }
                    const zincProgram = this.dataEnterManager.getZincProgram(cachedFilePath);
                    if (!zincProgram) {
                        continue;
                    }
                    locations.push(
                        ...this.findImplementationsInZincBlock(zincProgram, symbolName, cachedFilePath, 0)
                    );
                }

                return locations.length > 0 ? locations : null;
            }

            // 检查是否在 //! zinc 块内
            const zincBlockInfo = ZincBlockHelper.findZincBlock(document, position, this.dataEnterManager);
            if (zincBlockInfo && zincBlockInfo.program) {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return null;
                }
                const symbolName = document.getText(wordRange);
                if (!symbolName) {
                    return null;
                }

                const zincLocations = this.findImplementationsInZincBlock(
                    zincBlockInfo.program,
                    symbolName,
                    document.uri.fsPath,
                    zincBlockInfo.startLine
                );
                return zincLocations.length > 0 ? zincLocations : null;
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
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
                    return stmt;
                }
            } else if (stmt instanceof LibraryDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        if (member.name && member.name.name === interfaceName) {
                            if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                continue;
                            }
                            return member;
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof InterfaceDeclaration) {
                        if (member.name && member.name.name === interfaceName) {
                            if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                continue;
                            }
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
                            if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                continue;
                            }
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
                                    if (!this.isStatementAllowedForApiVersion(interfaceMember, filePath)) {
                                        continue;
                                    }
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
                                    if (!this.isStatementAllowedForApiVersion(interfaceMember, filePath)) {
                                        continue;
                                    }
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
                                if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                    continue;
                                }
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
                                        if (!this.isStatementAllowedForApiVersion(structMember, filePath)) {
                                            continue;
                                        }
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
                                        if (!this.isStatementAllowedForApiVersion(structMember, filePath)) {
                                            continue;
                                        }
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
                            if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                continue;
                            }
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
                                    if (!this.isStatementAllowedForApiVersion(structMember, filePath)) {
                                        continue;
                                    }
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
                                    if (!this.isStatementAllowedForApiVersion(structMember, filePath)) {
                                        continue;
                                    }
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
                                if (!this.isStatementAllowedForApiVersion(member, filePath)) {
                                    continue;
                                }
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

    private findImplementationsInZincBlock(
        program: ZincProgram,
        symbolName: string,
        filePath: string,
        lineOffset: number
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];

        const visitStatement = (stmt: ZincStatement): void => {
            if (stmt instanceof ZincStructDeclaration) {
                if (stmt.name?.name === symbolName && stmt.name) {
                    this.addZincLocation(stmt.name, filePath, lineOffset, locations);
                }
                for (const member of stmt.members) {
                    if (
                        (member instanceof ZincMethodDeclaration || member instanceof ZincVariableDeclaration) &&
                        member.name?.name === symbolName &&
                        member.name
                    ) {
                        this.addZincLocation(member.name, filePath, lineOffset, locations);
                    }
                }
                return;
            }

            if (stmt instanceof ZincInterfaceDeclaration) {
                if (stmt.name?.name === symbolName && stmt.name) {
                    this.addZincLocation(stmt.name, filePath, lineOffset, locations);
                }
                for (const member of stmt.members) {
                    if (
                        (member instanceof ZincMethodDeclaration || member instanceof ZincVariableDeclaration) &&
                        member.name?.name === symbolName &&
                        member.name
                    ) {
                        this.addZincLocation(member.name, filePath, lineOffset, locations);
                    }
                }
                return;
            }

            if (stmt instanceof ZincFunctionDeclaration) {
                if (stmt.name?.name === symbolName && stmt.name) {
                    this.addZincLocation(stmt.name, filePath, lineOffset, locations);
                }
                return;
            }

            if (stmt instanceof ZincVariableDeclaration) {
                if (stmt.name?.name === symbolName && stmt.name) {
                    this.addZincLocation(stmt.name, filePath, lineOffset, locations);
                }
                return;
            }

            if (stmt instanceof ZincLibraryDeclaration || stmt instanceof ZincModuleDeclaration) {
                if (stmt.name?.name === symbolName && stmt.name) {
                    this.addZincLocation(stmt.name, filePath, lineOffset, locations);
                }
                if (stmt.body) {
                    for (const child of stmt.body.statements) {
                        visitStatement(child);
                    }
                }
            }
        };

        for (const declaration of program.declarations) {
            visitStatement(declaration);
        }
        return locations;
    }

    private addZincLocation(
        identifier: Identifier,
        filePath: string,
        lineOffset: number,
        locations: vscode.Location[]
    ): void {
        if (!identifier.start || !identifier.end) {
            return;
        }

        locations.push(
            new vscode.Location(
                vscode.Uri.file(filePath),
                new vscode.Range(
                    new vscode.Position(identifier.start.line + lineOffset, identifier.start.position),
                    new vscode.Position(identifier.end.line + lineOffset, identifier.end.position)
                )
            )
        );
    }
}

