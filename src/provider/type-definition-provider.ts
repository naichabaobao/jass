import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import {
    BlockStatement,
    Statement,
    VariableDeclaration,
    TypeDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    Identifier
} from '../vjass/ast';

/**
 * 基于新 AST 系统的类型定义提供者
 */
export class TypeDefinitionProvider implements vscode.TypeDefinitionProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideTypeDefinition(
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

            const typeName = document.getText(wordRange);
            if (!typeName) {
                return null;
            }

            const locations: vscode.Location[] = [];

            // 从所有缓存的文件中查找类型定义
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            for (const cachedFilePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                if (!blockStatement) {
                    continue;
                }

                // 在当前文件中查找类型定义
                this.findTypeDefinitionsInBlock(blockStatement, typeName, cachedFilePath, locations);
            }

            return locations.length > 0 ? locations : null;
        } catch (error) {
            console.error('Error in provideTypeDefinition:', error);
            return null;
        }
    }

    /**
     * 在 BlockStatement 中查找类型定义
     */
    private findTypeDefinitionsInBlock(
        block: BlockStatement,
        typeName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            // 在 globals 块中查找变量类型
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.type && this.isTypeMatch(stmt.type, typeName)) {
                        this.findTypeDefinitionForType(stmt.type, typeName, filePath, locations);
                    }
                }
            }
            return;
        }

        for (const stmt of block.body) {
            // 类型声明
            if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 变量声明（查找变量类型）
            else if (stmt instanceof VariableDeclaration) {
                if (stmt.type && this.isTypeMatch(stmt.type, typeName)) {
                    this.findTypeDefinitionForType(stmt.type, typeName, filePath, locations);
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.findTypeDefinitionsInBlock(stmt, typeName, filePath, locations);
            }
        }
    }

    /**
     * 查找类型的定义
     */
    private findTypeDefinitionForType(
        type: any,
        typeName: string,
        currentFilePath: string,
        locations: vscode.Location[]
    ): void {
        // 如果 type 是 Identifier，直接查找
        if (type instanceof Identifier) {
            if (type.name === typeName) {
                // 在所有文件中查找这个类型的定义
                const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }
                    this.findTypeDefinitionInBlock(blockStatement, typeName, cachedFilePath, locations);
                }
            }
        }
    }

    /**
     * 在 BlockStatement 中查找类型定义（用于类型跳转）
     */
    private findTypeDefinitionInBlock(
        block: BlockStatement,
        typeName: string,
        filePath: string,
        locations: vscode.Location[]
    ): void {
        for (const stmt of block.body) {
            // 类型声明
            if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.findTypeDefinitionInBlock(stmt, typeName, filePath, locations);
            }
        }
    }

    /**
     * 检查类型是否匹配
     */
    private isTypeMatch(type: any, typeName: string): boolean {
        if (type instanceof Identifier) {
            return type.name === typeName;
        }
        // 如果 type 有 toString 方法，检查字符串表示
        if (typeof type.toString === 'function') {
            return type.toString() === typeName;
        }
        return false;
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

