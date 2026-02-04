import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter-manager';
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
import { Identifier } from '../../vjass/ast';
import { ZincLocalScopeHelper } from './zinc-local-scope-helper';

/**
 * Zinc 定义提供者
 * 专门处理 .zn 文件的跳转到定义功能
 */
export class ZincDefinitionProvider implements vscode.DefinitionProvider {
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

    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
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
                // 查找 library 成员的定义
                return this.findLibraryMemberDefinition(
                    libraryMemberAccess.libraryName,
                    libraryMemberAccess.memberName,
                    filePath
                );
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

            // 1. 解析当前文件并查找定义
            const currentFileProgram = this.parseZincFile(filePath, document.getText());
            if (currentFileProgram) {
                this.findDefinitionsInProgram(currentFileProgram, symbolName, filePath, locations);
                
                // 查找局部变量和参数的定义
                this.findLocalVariableDefinitions(currentFileProgram, symbolName, filePath, position, locations);
            }

            // 2. 从所有缓存的 .zn 文件中查找定义
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
            for (const cachedFilePath of allCachedFiles) {
                if (cachedFilePath === filePath) {
                    continue; // 跳过当前文件（已处理）
                }

                const cachedExt = path.extname(cachedFilePath).toLowerCase();
                if (cachedExt !== '.zn') {
                    continue; // 只处理 .zn 文件
                }

                const fileContent = this.dataEnterManager.getFileContent(cachedFilePath);
                if (fileContent) {
                    const program = this.parseZincFile(cachedFilePath, fileContent);
                    if (program) {
                        this.findDefinitionsInProgram(program, symbolName, cachedFilePath, locations);
                    }
                }
            }

            return locations.length > 0 ? locations : null;
        } catch (error) {
            console.error('ZincDefinitionProvider error:', error);
            return null;
        }
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
     * 在 ZincProgram 中查找定义
     */
    private findDefinitionsInProgram(
        program: ZincProgram,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const stmt of program.declarations) {
            this.findDefinitionsInStatement(stmt, symbolName, filePath, locations);
        }
    }

    /**
     * 在 ZincStatement 中查找定义
     */
    private findDefinitionsInStatement(
        stmt: ZincStatement,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
        }
        // 变量声明
        else if (stmt instanceof ZincVariableDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
        }
        // 结构体声明
        else if (stmt instanceof ZincStructDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
            // 查找结构体成员
            this.findStructMemberDefinitions(stmt, symbolName, filePath, locations);
        }
        // 接口声明
        else if (stmt instanceof ZincInterfaceDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
            // 查找接口成员
            this.findInterfaceMemberDefinitions(stmt, symbolName, filePath, locations);
        }
        // 类型声明
        else if (stmt instanceof ZincTypeDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
        }
        // 库声明
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
            // 查找 library 内部的成员（函数、变量等）
            if (stmt.body) {
                for (const member of stmt.body.statements) {
                    this.findDefinitionsInStatement(member, symbolName, filePath, locations);
                }
            }
        }
        // 模块声明
        else if (stmt instanceof ZincModuleDeclaration) {
            if (stmt.name && stmt.name.name === symbolName) {
                this.addLocation(stmt.name, filePath, locations);
            }
        }
    }

    /**
     * 查找结构体成员定义
     */
    private findStructMemberDefinitions(
        struct: ZincStructDeclaration,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const member of struct.members) {
            if (member instanceof ZincMethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof ZincVariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            }
        }
    }

    /**
     * 查找接口成员定义
     */
    private findInterfaceMemberDefinitions(
        interface_: ZincInterfaceDeclaration,
        symbolName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const member of interface_.members) {
            if (member instanceof ZincMethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            } else if (member instanceof ZincVariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    this.addLocation(member.name, filePath, locations);
                }
            }
        }
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
     * 查找 library 成员的定义
     */
    private findLibraryMemberDefinition(
        libraryName: string,
        memberName: string,
        currentFilePath: string
    ): vscode.Location[] | null {
        const locations: vscode.Location[] = [];

        // 在所有文件中查找该 library
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        const filesToCheck = [currentFilePath, ...allCachedFiles.filter(f => f !== currentFilePath)];

        for (const filePath of filesToCheck) {
            const ext = path.extname(filePath).toLowerCase();
            if (ext !== '.zn') {
                continue;
            }

            const fileContent = this.dataEnterManager.getFileContent(filePath) || 
                               (filePath === currentFilePath ? null : null);
            if (!fileContent && filePath !== currentFilePath) {
                continue;
            }

            const program = filePath === currentFilePath
                ? this.parseZincFile(filePath, fileContent || '')
                : this.parseZincFile(filePath, fileContent || '');

            if (!program) {
                continue;
            }

            // 查找 library 并查找其成员
            for (const stmt of program.declarations) {
                if (stmt instanceof ZincLibraryDeclaration) {
                    if (stmt.name && stmt.name.name === libraryName) {
                        // 找到目标 library，查找其成员
                        if (stmt.body) {
                            for (const member of stmt.body.statements) {
                                if (member instanceof ZincFunctionDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        this.addLocation(member.name, filePath, locations);
                                    }
                                } else if (member instanceof ZincVariableDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        this.addLocation(member.name, filePath, locations);
                                    }
                                } else if (member instanceof ZincStructDeclaration) {
                                    if (member.name && member.name.name === memberName) {
                                        this.addLocation(member.name, filePath, locations);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return locations.length > 0 ? locations : null;
    }

    /**
     * 查找局部变量和参数的定义
     */
    private findLocalVariableDefinitions(
        program: ZincProgram,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        locations: vscode.Location[]
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
            let identifier: Identifier | null = null;
            
            if (isParameter) {
                const param = variable as any;
                varName = param.name?.name || null;
                identifier = param.name || null;
            } else {
                const varDecl = variable as any;
                varName = varDecl.name?.name || null;
                identifier = varDecl.name || null;
            }

            if (varName === symbolName && identifier) {
                this.addLocation(identifier, filePath, locations);
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
}

