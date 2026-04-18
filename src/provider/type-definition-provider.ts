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
import { extractLeadingComments, parseComment } from './comment-parser';

/**
 * 基于新 AST 系统的类型定义提供者
 */
export class TypeDefinitionProvider implements vscode.TypeDefinitionProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
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
                    // 调试：检查为什么 blockStatement 为 null
                    console.warn(`[TypeDefinitionProvider] BlockStatement is null for file: ${cachedFilePath}`);
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
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
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
                    // 调试：检查为什么 blockStatement 为 null
                    console.warn(`[TypeDefinitionProvider] BlockStatement is null for file: ${cachedFilePath}`);
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
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
                    this.addLocation(stmt.name, filePath, locations);
                }
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === typeName) {
                    if (!this.isStatementAllowedForApiVersion(stmt, filePath)) {
                        continue;
                    }
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

