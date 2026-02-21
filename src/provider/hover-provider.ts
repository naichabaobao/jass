import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import { DocumentInfoManager } from './document-info-manager';
import type { DocumentInfo } from './document-info-manager';
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
    ImplementStatement,
    Identifier,
    ThistypeExpression
} from '../vjass/ast';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { DefineRegistry } from '../vjass/define-registry';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from './comment-parser';
import { ZincBlockHelper } from './zinc-block-parser';
import { ZincHoverProvider } from './zinc/zinc-hover-provider';
import { HoverCache, HoverCacheItem } from './hover-cache';

/**
 * 基于新 AST 系统的悬停信息提供者
 */
export class HoverProvider implements vscode.HoverProvider {
    private dataEnterManager: DataEnterManager;
    private zincHoverProvider: ZincHoverProvider;
    private hoverCache: HoverCache;
    private docManager = DocumentInfoManager.getInstance();
    private vjassInfoRef?: DocumentInfo;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
        this.zincHoverProvider = new ZincHoverProvider(dataEnterManager);
        this.hoverCache = HoverCache.getInstance();
        this.vjassInfoRef = this.docManager.acquireRef('vjass');
    }

    dispose(): void {
        if (this.vjassInfoRef) {
            this.docManager.releaseRef('vjass');
            this.vjassInfoRef = undefined;
        }
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        try {
            // 首先检查是否是字符代码（如 'az09'）
            const charCodeHover = this.checkCharacterCodeHover(document, position);
            if (charCodeHover) {
                return charCodeHover;
            }

            // 检查是否在 //! zinc 块内
            const zincBlockInfo = ZincBlockHelper.findZincBlock(document, position, this.dataEnterManager);
            if (zincBlockInfo && zincBlockInfo.program) {
                // 在 Zinc 块内，使用 Zinc hover provider
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) {
                    return null;
                }
                
                const symbolName = document.getText(wordRange);
                if (!symbolName) {
                    return null;
                }
                
                // 调整位置（相对于 Zinc 块开始）
                const adjustedPosition = new vscode.Position(
                    position.line - zincBlockInfo.startLine,
                    position.character
                );
                
                // 使用 Zinc hover provider 的内部方法
                const hoverContents: vscode.MarkdownString[] = [];
                (this.zincHoverProvider as any).findSymbolsInProgram(zincBlockInfo.program, symbolName, document.uri.fsPath, hoverContents);
                (this.zincHoverProvider as any).findLocalVariableHover(zincBlockInfo.program, symbolName, document.uri.fsPath, adjustedPosition, hoverContents);
                
                if (hoverContents.length > 0) {
                    return new vscode.Hover(hoverContents, wordRange);
                }
            }

            // 检查是否在成员访问上下文中（如 this.xxx、thistype.xxx、structInstance.xxx）
            const memberAccessInfo = this.getMemberAccessInfo(document, position);
            
            if (memberAccessInfo) {
                // 在成员访问上下文中，查找成员信息
                const hoverContents: vscode.MarkdownString[] = [];
                const memberHover = this.findMemberHover(memberAccessInfo, document, position);
                if (memberHover) {
                    hoverContents.push(memberHover);
                    const wordRange = document.getWordRangeAtPosition(position);
                    if (wordRange) {
                        return new vscode.Hover(hoverContents, wordRange);
                    }
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

            const hoverContents: vscode.MarkdownString[] = [];
            const filePath = document.uri.fsPath;

            // 从所有缓存的文件中全局查找匹配的符号（函数、全局变量、类型、结构体等）
            // 包括工作目录和 static 目录下的所有文件，它们都一视同仁
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

            // 先尝试从缓存获取全局符号
            const cachedItems = this.hoverCache.getBySymbolName(symbolName);
            let hasCachedGlobalSymbols = false;
            
            if (cachedItems.length > 0) {
                // 从缓存恢复 hover 内容（只包含全局符号）
                for (const item of cachedItems) {
                    const markdown = new vscode.MarkdownString(item.content);
                    markdown.isTrusted = true;
                    hoverContents.push(markdown);
                }
                hasCachedGlobalSymbols = true;
            }

            // 如果缓存中没有全局符号，需要计算并缓存
            if (!hasCachedGlobalSymbols) {

                const globalHoverContents: vscode.MarkdownString[] = [];

                for (const cachedFilePath of allCachedFiles) {
                    // 跳过 .zn 文件，因为它们使用 ZincProgram 而不是 BlockStatement
                    if (this.dataEnterManager.isZincFile(cachedFilePath)) {
                        continue;
                    }
                    
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }

                    // 在所有文件中查找符号（函数、全局变量、类型、结构体等）
                    // 包括 native 函数、普通函数、全局变量等
                    this.findSymbolsInBlock(blockStatement, symbolName, cachedFilePath, globalHoverContents);
                    // 同时添加到 hoverContents 中
                    this.findSymbolsInBlock(blockStatement, symbolName, cachedFilePath, hoverContents);
                }

                if (globalHoverContents.length > 0) {
                    // 将计算的结果保存到缓存（只保存全局符号，不保存局部变量）
                    this.saveHoverToCache(symbolName, globalHoverContents, filePath);
                }
            }

            // 查找局部变量和参数的悬停信息（仅在当前文件中，因为 local 和 takes 参数是局部作用域的）
            // 局部变量不应该缓存，因为它们是局部作用域的
            const currentFileBlock = this.dataEnterManager.getBlockStatement(filePath);
            if (currentFileBlock) {
                this.findLocalVariableHover(currentFileBlock, symbolName, filePath, position, hoverContents);
            }


            // 查找 TextMacro
            const textMacroRegistry = TextMacroRegistry.getInstance();
            const macro = textMacroRegistry.find(symbolName);
            if (macro) {
                const content = this.createTextMacroHoverContent(macro);
                if (content) {
                    hoverContents.push(content);
                }
            }
            
            // 查找 #define
            const defineRegistry = DefineRegistry.getInstance();
            const define = defineRegistry.find(symbolName);
            if (define) {
                const content = this.createDefineHoverContent(define);
                if (content) {
                    hoverContents.push(content);
                }
            }

            // 检查是否是 vJASS 内置常量、时间、随机数等
            const vjassBuiltinHover = this.checkVjassBuiltinHover(symbolName);
            if (vjassBuiltinHover) {
                hoverContents.push(vjassBuiltinHover);
            }

            // 如果没有找到任何内容，返回 null
            if (hoverContents.length === 0) {
                return null;
            }

            return new vscode.Hover(hoverContents, wordRange);
        } catch (error) {
            console.error('Error in provideHover:', error);
            return null;
        }
    }
    
    /**
     * 获取成员访问信息（如 this.xxx、thistype.xxx、StructName.xxx）
     */
    private getMemberAccessInfo(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { structName: string; memberName: string; isStatic: boolean; isThis: boolean; isThistype: boolean } | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        
        // 获取当前单词（可能是成员名）
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }
        const currentWord = document.getText(wordRange);
        
        // 匹配模式：identifier.memberName 或 identifier . memberName（允许空格）
        // 需要确保匹配到的是当前单词之前的成员访问
        // 从后往前查找，找到最后一个匹配的成员访问模式
        const memberAccessPattern = /(\w+)\s*\.\s*(\w+)/g;
        let match: RegExpMatchArray | null = null;
        let lastMatch: RegExpMatchArray | null = null;
        
        // 找到所有匹配，取最后一个（最接近光标的）
        while ((match = memberAccessPattern.exec(textBeforeCursor)) !== null) {
            lastMatch = match;
        }
        
        // 检查最后一个匹配的成员名是否与当前单词匹配
        if (!lastMatch || lastMatch[2] !== currentWord) {
            return null;
        }
        
        const identifier = lastMatch[1].toLowerCase();
        const memberName = lastMatch[2];
        
        // 检查是否是 this 或 thistype
        if (identifier === 'this') {
            const currentStruct = this.findCurrentStruct(document, position);
            if (currentStruct && currentStruct.name) {
                return {
                    structName: currentStruct.name.name,
                    memberName: memberName,
                    isStatic: false,
                    isThis: true,
                    isThistype: false
                };
            }
            return null;
        }
        
        if (identifier === 'thistype') {
            const currentStruct = this.findCurrentStruct(document, position);
            if (currentStruct && currentStruct.name) {
                return {
                    structName: currentStruct.name.name,
                    memberName: memberName,
                    isStatic: true,
                    isThis: false,
                    isThistype: true
                };
            }
            return null;
        }
        
        // 普通标识符访问（可能是结构名或变量名）
        const originalIdentifier = lastMatch[1];
        // 如果首字母大写，假设是结构名（静态方法）
        // 否则，尝试查找变量类型
        const isStatic = originalIdentifier[0] === originalIdentifier[0].toUpperCase();
        
        // 验证是否是结构名（如果是静态访问，应该是结构名）
        if (isStatic) {
            // 验证这个标识符是否真的是一个结构
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
            for (const filePath of allCachedFiles) {
                if (this.dataEnterManager.isZincFile(filePath)) {
                    continue;
                }
                const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                if (blockStatement) {
                    const struct = this.findStructInBlock(blockStatement, originalIdentifier);
                    if (struct) {
                        return {
                            structName: originalIdentifier,
                            memberName: memberName,
                            isStatic: true,
                            isThis: false,
                            isThistype: false
                        };
                    }
                }
            }
        }
        
        // 如果不是结构名，可能是变量访问，暂时返回 null
        // 注意：变量类型推断比较复杂，需要查找局部变量、参数、全局变量等
        // 这里暂时不处理，如果需要可以后续添加
        return null;
    }
    
    /**
     * 查找成员 hover 信息
     */
    private findMemberHover(
        info: { structName: string; memberName: string; isStatic: boolean; isThis: boolean; isThistype: boolean },
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.MarkdownString | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const filePath of allCachedFiles) {
            // 跳过 .zn 文件，因为它们使用 ZincProgram 而不是 BlockStatement
            if (this.dataEnterManager.isZincFile(filePath)) {
                continue;
            }
            
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }
            
            const struct = this.findStructInBlock(blockStatement, info.structName);
            if (struct) {
                // 查找成员
                for (const member of struct.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.name && member.name.name === info.memberName) {
                            // 检查 static 匹配
                            if (info.isStatic && !member.isStatic) continue;
                            if (!info.isStatic && member.isStatic) continue;
                            
                            return this.createMethodHoverContent(member, struct.name?.name || 'unknown', filePath);
                        }
                    } else if (member instanceof VariableDeclaration) {
                        if (member.name && member.name.name === info.memberName) {
                            // 检查 static 匹配
                            if (info.isStatic && !member.isStatic) continue;
                            if (!info.isStatic && member.isStatic) continue;
                            
                            return this.createMemberVariableHoverContent(member, struct.name?.name || 'unknown', filePath);
                        }
                    }
                }
                
                // 检查内置方法
                const builtinHover = this.createBuiltinMethodHover(struct, info.memberName, info.isStatic, filePath);
                if (builtinHover) {
                    return builtinHover;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 创建内置方法 hover 内容
     */
    private createBuiltinMethodHover(
        struct: StructDeclaration,
        methodName: string,
        isStatic: boolean,
        filePath: string
    ): vscode.MarkdownString | null {
        const structName = struct.name?.name || 'unknown';
        
        if (methodName === 'allocate' && isStatic) {
            const content = new vscode.MarkdownString();
            const createMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            ) as MethodDeclaration | undefined;
            
            let paramsStr = 'nothing';
            if (createMethod && createMethod.parameters.length > 0) {
                paramsStr = createMethod.parameters
                    .map(p => {
                        const typeStr = p.type ? p.type.toString() : 'unknown';
                        return `${typeStr} ${p.name.name}`;
                    })
                    .join(', ');
            }
            
            const doc = `private static method allocate takes ${paramsStr} returns ${structName}`;
            content.appendCodeblock(doc, 'jass');
            content.appendMarkdown('\n\n**内置方法** - 为该结构分配唯一的实例 ID');
            content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            return content;
        }
        
        if (methodName === 'create' && isStatic) {
            const hasCustomCreate = struct.members.some(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            );
            
            const content = new vscode.MarkdownString();
            const createMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            ) as MethodDeclaration | undefined;
            
            if (createMethod) {
                const doc = this.formatMethodSignature(createMethod);
                content.appendCodeblock(doc, 'jass');
                const comment = this.extractCommentForStatement(createMethod, filePath);
                if (comment) {
                    content.appendMarkdown('\n\n---\n\n');
                    content.appendMarkdown(comment);
                }
            } else {
                let paramsStr = 'nothing';
                const doc = `static method create takes ${paramsStr} returns ${structName}`;
                content.appendCodeblock(doc, 'jass');
                content.appendMarkdown('\n\n**内置方法** - 创建结构实例（默认调用 allocate）');
            }
            content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            return content;
        }
        
        if (methodName === 'destroy') {
            const customDestroy = struct.members.find(
                m => m instanceof MethodDeclaration && m.name?.name === 'destroy' && m.isStatic === isStatic
            ) as MethodDeclaration | undefined;
            
            const content = new vscode.MarkdownString();
            if (customDestroy) {
                const doc = this.formatMethodSignature(customDestroy);
                content.appendCodeblock(doc, 'jass');
                const comment = this.extractCommentForStatement(customDestroy, filePath);
                if (comment) {
                    content.appendMarkdown('\n\n---\n\n');
                    content.appendMarkdown(comment);
                }
            } else {
                const staticStr = isStatic ? 'static ' : '';
                const doc = `${staticStr}method destroy takes nothing returns nothing`;
                content.appendCodeblock(doc, 'jass');
                content.appendMarkdown('\n\n**内置方法** - 销毁结构实例');
            }
            content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            return content;
        }
        
        if (methodName === 'deallocate' && !isStatic) {
            const content = new vscode.MarkdownString();
            const doc = `method deallocate takes nothing returns nothing`;
            content.appendCodeblock(doc, 'jass');
            content.appendMarkdown('\n\n**内置方法** - 调用默认的 destroy 方法');
            content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            return content;
        }
        
        if (methodName === 'onDestroy' && !isStatic) {
            const onDestroyMethod = struct.members.find(
                m => m instanceof MethodDeclaration && !m.isStatic && m.name?.name === 'onDestroy'
            ) as MethodDeclaration | undefined;
            
            if (onDestroyMethod) {
                const content = new vscode.MarkdownString();
                const doc = this.formatMethodSignature(onDestroyMethod);
                content.appendCodeblock(doc, 'jass');
                content.appendMarkdown('\n\n**特殊方法** - 在结构实例销毁时自动调用');
                const comment = this.extractCommentForStatement(onDestroyMethod, filePath);
                if (comment) {
                    content.appendMarkdown('\n\n---\n\n');
                    content.appendMarkdown(comment);
                }
                content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                return content;
            }
        }
        
        return null;
    }
    
    /**
     * 格式化方法签名
     */
    private formatMethodSignature(method: MethodDeclaration): string {
        const name = method.name?.name || 'unknown';
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';
        const staticStr = method.isStatic ? 'static ' : '';
        return `${staticStr}method ${name} takes ${params || 'nothing'} returns ${returnType}`;
    }
    
    /**
     * 查找当前位置所在的 struct
     */
    private findCurrentStruct(
        document: vscode.TextDocument,
        position: vscode.Position
    ): StructDeclaration | null {
        const filePath = document.uri.fsPath;
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        if (!blockStatement) {
            return null;
        }
        
        return this.findContainingStruct(blockStatement, position);
    }
    
    /**
     * 查找包含指定位置的 struct
     */
    private findContainingStruct(
        block: BlockStatement,
        position: vscode.Position
    ): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.start && stmt.end) {
                    if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                        return stmt;
                    }
                }
            }
            
            if (stmt instanceof BlockStatement) {
                const found = this.findContainingStruct(stmt, position);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
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

        if (position.line === startLine && startPos !== undefined && position.character < startPos) {
            return false;
        }

        if (position.line === endLine && endPos !== undefined && position.character > endPos) {
            return false;
        }

        return true;
    }

    /**
     * 在 BlockStatement 中查找符号
     */
    private findSymbolsInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        // 检查是否是 globals 块
        const isGlobals = this.isGlobalsBlock(block);
        if (isGlobals) {
            // 在 globals 块中查找全局变量
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.name && stmt.name.name === symbolName) {
                        const content = this.createVariableHoverContent(stmt, filePath);
                        if (content) {
                            hoverContents.push(content);
                        }
                    }
                }
            }
            // globals 块中不应该有函数，所以这里直接返回
            return;
        }

        // 正常遍历所有语句（包括函数、native 函数等）
        for (const stmt of block.body) {
            // 函数声明
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createFunctionHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Native 函数声明
            else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createNativeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 函数接口声明
            else if (stmt instanceof FunctionInterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createFunctionInterfaceHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 变量声明（跳过 local 变量，local 变量只在当前文件中查找）
            else if (stmt instanceof VariableDeclaration) {
                // 只查找非 local 变量（全局变量），local 变量应该只在当前文件中查找
                if (!stmt.isLocal && stmt.name && stmt.name.name === symbolName) {
                    const content = this.createVariableHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 类型声明
            else if (stmt instanceof TypeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createTypeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 结构体声明
            else if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createStructHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找结构体成员
                this.findStructMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 接口声明
            else if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createInterfaceHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找接口成员
                this.findInterfaceMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 模块声明
            else if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createModuleHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 查找模块成员
                this.findModuleMembers(stmt, symbolName, filePath, hoverContents);
            }
            // 委托声明
            else if (stmt instanceof DelegateDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createDelegateHoverContent(stmt, null, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Library 声明
            else if (stmt instanceof LibraryDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createLibraryHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 递归处理 library 的成员（包括 globals 块）
                for (const member of stmt.members) {
                    if (member instanceof BlockStatement) {
                        // 递归处理 BlockStatement（包括 globals 块）
                        this.findSymbolsInBlock(member, symbolName, filePath, hoverContents);
                    } else if (member instanceof FunctionDeclaration || member instanceof NativeDeclaration) {
                        // 直接检查函数和 native 函数，避免创建临时 BlockStatement
                        if (member.name && member.name.name === symbolName) {
                            if (member instanceof FunctionDeclaration) {
                                const content = this.createFunctionHoverContent(member, filePath);
                                if (content) {
                                    hoverContents.push(content);
                                }
                            } else if (member instanceof NativeDeclaration) {
                                const content = this.createNativeHoverContent(member, filePath);
                                if (content) {
                                    hoverContents.push(content);
                                }
                            }
                        }
                    } else {
                        // 对于其他非 BlockStatement 的成员，创建一个临时的 BlockStatement 来复用现有的处理逻辑
                        const tempBlock = new BlockStatement(
                            [member],
                            member.start,
                            member.end
                        );
                        this.findSymbolsInBlock(tempBlock, symbolName, filePath, hoverContents);
                    }
                }
            }
            // Scope 声明
            else if (stmt instanceof ScopeDeclaration) {
                if (stmt.name && stmt.name.name === symbolName) {
                    const content = this.createScopeHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
                // 递归处理 scope 的成员（包括 globals 块）
                for (const member of stmt.members) {
                    if (member instanceof BlockStatement) {
                        // 递归处理 BlockStatement（包括 globals 块）
                        this.findSymbolsInBlock(member, symbolName, filePath, hoverContents);
                    } else if (member instanceof FunctionDeclaration || member instanceof NativeDeclaration) {
                        // 直接检查函数和 native 函数，避免创建临时 BlockStatement
                        if (member.name && member.name.name === symbolName) {
                            if (member instanceof FunctionDeclaration) {
                                const content = this.createFunctionHoverContent(member, filePath);
                                if (content) {
                                    hoverContents.push(content);
                                }
                            } else if (member instanceof NativeDeclaration) {
                                const content = this.createNativeHoverContent(member, filePath);
                                if (content) {
                                    hoverContents.push(content);
                                }
                            }
                        }
                    } else {
                        // 对于其他非 BlockStatement 的成员，创建一个临时的 BlockStatement 来复用现有的处理逻辑
                        const tempBlock = new BlockStatement(
                            [member],
                            member.start,
                            member.end
                        );
                        this.findSymbolsInBlock(tempBlock, symbolName, filePath, hoverContents);
                    }
                }
            }
            // TextMacro 声明
            else if (stmt instanceof TextMacroStatement) {
                if (stmt.name === symbolName) {
                    const content = this.createTextMacroStatementHoverContent(stmt, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // Implement 语句
            else if (stmt instanceof ImplementStatement) {
                if (stmt.moduleName && stmt.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(stmt, null, filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.findSymbolsInBlock(stmt, symbolName, filePath, hoverContents);
            }
        }
    }

    /**
     * 检查是否是 globals 块
     */
    private isGlobalsBlock(block: BlockStatement): boolean {
        // globals 块应该只包含非 local 的 VariableDeclaration
        if (block.body.length === 0) {
            return false; // 空块不认为是 globals 块
        }
        
        // 检查是否所有语句都是非 local 的 VariableDeclaration
        // globals 块中不应该有其他类型的语句（如函数、结构体等）
        let hasGlobalVariable = false;
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                // 如果是 local 变量，则不是 globals 块
                if (stmt.isLocal) {
                    return false;
                }
                hasGlobalVariable = true;
            } else {
                // 如果包含非变量声明的语句，则不是 globals 块
                return false;
            }
        }
        
        // 至少需要有一个全局变量声明
        return hasGlobalVariable;
    }

    /**
     * 查找结构体成员
     */
    private findStructMembers(
        struct: StructDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof VariableDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMemberVariableHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof DelegateDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createDelegateHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(member, struct.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 查找接口成员
     */
    private findInterfaceMembers(
        interface_: InterfaceDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of interface_.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, interface_.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 查找模块成员
     */
    private findModuleMembers(
        module: ModuleDeclaration,
        symbolName: string,
        filePath: string,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const member of module.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === symbolName) {
                    const content = this.createMethodHoverContent(member, module.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            } else if (member instanceof ImplementStatement) {
                if (member.moduleName && member.moduleName.name === symbolName) {
                    const content = this.createImplementHoverContent(member, module.name?.name || 'unknown', filePath);
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 创建函数悬停内容
     */
    private createFunctionHoverContent(func: FunctionDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!func.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';

        content.appendCodeblock(`function ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(func, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Native 函数悬停内容
     */
    private createNativeHoverContent(native: NativeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!native.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = native.name.name;
        const constantStr = native.isConstant ? 'constant ' : '';
        const params = native.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';

        // native 本身就等价于 function，不需要额外的 function 关键字
        content.appendCodeblock(`${constantStr}native ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(native, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建函数接口悬停内容
     */
    private createFunctionInterfaceHoverContent(func: FunctionInterfaceDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!func.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = func.name.name;
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';

        content.appendCodeblock(`function interface ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(func, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建变量悬停内容
     */
    private createVariableHoverContent(variable: VariableDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const localStr = variable.isLocal ? 'local ' : '';
        const arrayStr = variable.isArray 
            ? (variable.arrayWidth !== null && variable.arrayHeight !== null
                ? ` array[${variable.arrayWidth}][${variable.arrayHeight}]`
                : variable.arraySize !== null
                    ? ` array[${variable.arraySize}]`
                    : ' array')
            : '';

        content.appendCodeblock(`${localStr}${constantStr}${typeStr}${arrayStr} ${name}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建类型悬停内容
     */
    private createTypeHoverContent(type: TypeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!type.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = type.name.name;
        const baseType = type.baseType ? ` = ${type.baseType.toString()}` : '';

        content.appendCodeblock(`type ${name}${baseType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(type, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建结构体悬停内容
     */
    private createStructHoverContent(struct: StructDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!struct.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = struct.name.name;
        const extendsInfo = struct.extendsType ? ` extends ${struct.extendsType.toString()}` : '';
        const indexInfo = struct.indexSize !== null ? `[${struct.indexSize}]` : '';
        const arrayInfo = struct.isArrayStruct ? ` extends array${struct.arraySize !== null ? ` [${struct.arraySize}]` : ''}` : '';

        content.appendCodeblock(`struct${indexInfo} ${name}${extendsInfo}${arrayInfo}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(struct, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建接口悬停内容
     */
    private createInterfaceHoverContent(interface_: InterfaceDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!interface_.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = interface_.name.name;

        content.appendCodeblock(`interface ${name}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(interface_, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建模块悬停内容
     */
    private createModuleHoverContent(module: ModuleDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!module.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = module.name.name;

        content.appendCodeblock(`module ${name}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(module, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建委托悬停内容
     */
    private createDelegateHoverContent(delegate: DelegateDeclaration, ownerName: string | null, filePath: string): vscode.MarkdownString | null {
        if (!delegate.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = delegate.name.name;
        const delegateType = delegate.delegateType ? delegate.delegateType.toString() : 'unknown';
        const privateStr = delegate.isPrivate ? 'private ' : '';

        content.appendCodeblock(`${privateStr}delegate ${delegateType} ${name}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(delegate, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        if (ownerName) {
            content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        }
        
        // 查找被委托的类型（struct）定义
        const structDef = this.findStructDefinition(delegateType);
        if (structDef) {
            content.appendMarkdown(`\n**委托类型定义:** \`${this.getRelativePath(structDef.filePath)}\``);
        }
        
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建方法悬停内容
     */
    private createMethodHoverContent(method: MethodDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!method.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = method.name.name;
        const staticStr = method.isStatic ? 'static ' : '';
        const params = method.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = method.returnType ? method.returnType.toString() : 'nothing';

        content.appendCodeblock(`${staticStr}method ${name} takes ${params || 'nothing'} returns ${returnType}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(method, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建结构体成员变量悬停内容
     */
    private createMemberVariableHoverContent(variable: VariableDeclaration, ownerName: string, filePath: string): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = variable.name.name;
        const typeStr = variable.type ? variable.type.toString() : 'unknown';
        
        const modifiers: string[] = [];
        if (variable.isStatic) {
            modifiers.push('static');
        }
        if (variable.isReadonly) {
            modifiers.push('readonly');
        }
        if (variable.isConstant) {
            modifiers.push('constant');
        }
        
        const modifierStr = modifiers.length > 0 ? `${modifiers.join(' ')} ` : '';
        const arrayStr = variable.isArray 
            ? (variable.arrayWidth !== null && variable.arrayHeight !== null
                ? ` array[${variable.arrayWidth}][${variable.arrayHeight}]`
                : variable.arraySize !== null
                    ? ` array[${variable.arraySize}]`
                    : ' array')
            : '';

        content.appendCodeblock(`${modifierStr}${typeStr}${arrayStr} ${name}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Library 悬停内容
     */
    private createLibraryHoverContent(library: LibraryDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!library.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = library.name.name;
        const onceStr = library.isLibraryOnce ? 'library_once ' : 'library ';
        const dependencies = library.dependencies.length > 0
            ? ` requires ${library.dependencies.map(d => d.toString()).join(', ')}`
            : '';
        const initializer = library.initializer ? ` initializer ${library.initializer.toString()}` : '';

        content.appendCodeblock(`${onceStr}${name}${dependencies}${initializer}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(library, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Scope 悬停内容
     */
    private createScopeHoverContent(scope: ScopeDeclaration, filePath: string): vscode.MarkdownString | null {
        if (!scope.name) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const name = scope.name.name;
        const initializer = scope.initializer ? ` initializer ${scope.initializer.toString()}` : '';

        content.appendCodeblock(`scope ${name}${initializer}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(scope, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 TextMacro 语句悬停内容
     */
    private createTextMacroStatementHoverContent(textMacro: TextMacroStatement, filePath: string): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        const name = textMacro.name;
        const params = textMacro.parameters.length > 0
            ? ` takes ${textMacro.parameters.join(', ')}`
            : '';

        content.appendCodeblock(`textmacro ${name}${params}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(textMacro, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 创建 TextMacro 悬停内容（从注册表）
     */
    private createTextMacroHoverContent(macro: { name: string; parameters: string[]; filePath: string }): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        const name = macro.name;
        const params = macro.parameters.length > 0
            ? ` takes ${macro.parameters.join(', ')}`
            : '';

        content.appendCodeblock(`textmacro ${name}${params}`, 'jass');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(macro.filePath)}\``);
        
        return content;
    }
    
    /**
     * 创建 #define 悬停内容
     */
    private createDefineHoverContent(define: { name: string; value: string; filePath: string; code?: string }): vscode.MarkdownString | null {
        const content = new vscode.MarkdownString();
        const name = define.name;
        const valueStr = define.value ? ` ${define.value}` : '';
        
        // 使用原始代码（如果可用）或构建定义
        let codeStr = define.code || `#define ${name}${valueStr}`;
        
        // 优化多行 #define 的显示
        // 如果代码太长或多行，进行格式化处理
        if (codeStr.length > 200) {
            const lines = codeStr.split('\n');
            if (lines.length > 3) {
                // 多行定义：显示前3行，然后显示省略号
                codeStr = lines.slice(0, 3).join('\n') + '\n...';
            } else if (codeStr.length > 300) {
                // 单行但很长：截断并添加省略号
                codeStr = codeStr.substring(0, 300) + '...';
            }
        }
        
        content.appendCodeblock(codeStr, 'jass');
        
        if (define.value) {
            // 如果值很长，也进行截断
            let displayValue = define.value;
            if (displayValue.length > 100) {
                displayValue = displayValue.substring(0, 100) + '...';
            }
            content.appendMarkdown(`\n**值:** \`${displayValue}\``);
        }
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(define.filePath)}\``);
        
        return content;
    }

    /**
     * 创建 Implement 悬停内容
     */
    private createImplementHoverContent(implement: ImplementStatement, ownerName: string | null, filePath: string): vscode.MarkdownString | null {
        if (!implement.moduleName) {
            return null;
        }

        const content = new vscode.MarkdownString();
        const moduleName = implement.moduleName.name;
        const optionalStr = implement.isOptional ? 'optional ' : '';

        content.appendCodeblock(`implement ${optionalStr}${moduleName}`, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(implement, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        if (ownerName) {
            content.appendMarkdown(`\n\n**所属:** \`${ownerName}\``);
        }
        
        // 查找被实现的模块定义
        const moduleDef = this.findModuleDefinition(moduleName);
        if (moduleDef) {
            content.appendMarkdown(`\n**模块定义:** \`${this.getRelativePath(moduleDef.filePath)}\``);
        }
        
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);
        
        return content;
    }

    /**
     * 查找局部变量和参数的悬停信息
     */
    private findLocalVariableHover(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        hoverContents: vscode.MarkdownString[]
    ): void {
        // 查找包含当前位置的函数或方法
        const funcOrMethod = this.findContainingFunctionOrMethod(block, position);
        if (!funcOrMethod) {
            return;
        }

        // 添加参数的悬停信息（含 takes 行内的参数）
        if (funcOrMethod instanceof FunctionDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name && param.name.name === symbolName) {
                    const content = this.createParameterHoverContent(
                        { name: param.name, type: param.type },
                        filePath
                    );
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            if (funcOrMethod.body) {
                this.findLocalVariablesInBlock(funcOrMethod.body, symbolName, filePath, position, hoverContents);
            }
        } else if (funcOrMethod instanceof MethodDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name && param.name.name === symbolName) {
                    const content = this.createParameterHoverContent(
                        { name: param.name, type: param.type },
                        filePath
                    );
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
            if (funcOrMethod.body) {
                this.findLocalVariablesInBlock(funcOrMethod.body, symbolName, filePath, position, hoverContents);
            }
        } else if (funcOrMethod instanceof NativeDeclaration) {
            for (const param of funcOrMethod.parameters) {
                if (param.name && param.name.name === symbolName) {
                    const content = this.createParameterHoverContent(
                        { name: param.name, type: param.type },
                        filePath
                    );
                    if (content) {
                        hoverContents.push(content);
                    }
                }
            }
        }
    }

    /**
     * 查找包含指定位置的函数、方法或 native（含 takes 声明行），用于参数 hover/跳转
     * 会递归进入 library/scope/struct，使 takes 行内的参数也能生效
     */
    private findContainingFunctionOrMethod(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | MethodDeclaration | NativeDeclaration | null {
        return this.findContainingCallableInStatements(block.body, position);
    }

    private findContainingCallableInStatements(
        statements: Statement[],
        position: vscode.Position
    ): FunctionDeclaration | MethodDeclaration | NativeDeclaration | null {
        for (const stmt of statements) {
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.start && stmt.end) {
                    if (position.line >= stmt.start.line && position.line <= stmt.end.line + 1) {
                        return stmt;
                    }
                } else if (stmt.body && this.isPositionInRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof MethodDeclaration) {
                if (stmt.start && stmt.end) {
                    if (position.line >= stmt.start.line && position.line <= stmt.end.line + 1) {
                        return stmt;
                    }
                } else if (stmt.body && this.isPositionInRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof NativeDeclaration) {
                if (stmt.start && stmt.end && this.isPositionInRange(position, stmt.start, stmt.end)) {
                    return stmt;
                }
            } else if (stmt instanceof LibraryDeclaration) {
                const nested = this.findContainingCallableInStatements(stmt.members, position);
                if (nested) return nested;
            } else if (stmt instanceof ScopeDeclaration) {
                const nested = this.findContainingCallableInStatements(stmt.members, position);
                if (nested) return nested;
            } else if (stmt instanceof StructDeclaration) {
                const nested = this.findContainingCallableInStatements(stmt.members, position);
                if (nested) return nested;
            } else if (stmt instanceof BlockStatement) {
                const nested = this.findContainingCallableInStatements(stmt.body, position);
                if (nested) return nested;
            }
        }
        return null;
    }

    /**
     * 在代码块中查找局部变量悬停信息
     */
    private findLocalVariablesInBlock(
        block: BlockStatement,
        symbolName: string,
        filePath: string,
        position: vscode.Position,
        hoverContents: vscode.MarkdownString[]
    ): void {
        for (const stmt of block.body) {
            // 检查是否是局部变量声明
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                // 检查变量是否在指定位置之前声明（作用域检查）
                if (stmt.name && stmt.name.name === symbolName) {
                    if (this.isVariableBeforePosition(stmt, position)) {
                        const content = this.createLocalVariableHoverContent(stmt, filePath);
                        if (content) {
                            hoverContents.push(content);
                        }
                    }
                }
            }
            // 递归查找嵌套块中的局部变量
            else if (stmt instanceof BlockStatement) {
                if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                    this.findLocalVariablesInBlock(stmt, symbolName, filePath, position, hoverContents);
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
     * 创建参数悬停内容
     */
    private createParameterHoverContent(
        param: { name: Identifier; type?: Identifier | ThistypeExpression | null },
        filePath: string
    ): vscode.MarkdownString | null {
        if (!param.name) {
            return null;
        }

        const name = param.name.name;
        let typeStr = 'nothing';
        if (param.type) {
            if (param.type instanceof Identifier) {
                typeStr = param.type.name;
            } else if (param.type instanceof ThistypeExpression) {
                typeStr = 'thistype';
            }
        }
        const signature = `${typeStr} ${name}`;

        const content = new vscode.MarkdownString();
        content.appendCodeblock(signature, 'jass');
        content.appendMarkdown('\n\n**参数**');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 创建局部变量悬停内容
     */
    private createLocalVariableHoverContent(
        variable: VariableDeclaration,
        filePath: string
    ): vscode.MarkdownString | null {
        if (!variable.name) {
            return null;
        }

        const name = variable.name.name;
        const typeStr = variable.type instanceof Identifier ? variable.type.name : (variable.type ? 'thistype' : 'nothing');
        const localStr = variable.isLocal ? 'local ' : '';
        const constantStr = variable.isConstant ? 'constant ' : '';
        const signature = `${localStr}${constantStr}${typeStr} ${name}`;

        const content = new vscode.MarkdownString();
        content.appendCodeblock(signature, 'jass');
        
        // 添加注释
        const comment = this.extractCommentForStatement(variable, filePath);
        if (comment) {
            content.appendMarkdown('\n\n---\n\n');
            content.appendMarkdown(comment);
        }
        
        content.appendMarkdown('\n\n**局部变量**');
        content.appendMarkdown(`\n**文件:** \`${this.getRelativePath(filePath)}\``);

        return content;
    }

    /**
     * 查找模块定义
     */
    private findModuleDefinition(moduleName: string): { filePath: string } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const cachedFilePath of allCachedFiles) {
            // 跳过 .zn 文件，因为它们使用 ZincProgram 而不是 BlockStatement
            if (this.dataEnterManager.isZincFile(cachedFilePath)) {
                continue;
            }
            
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }
            
            const module = this.findModuleInBlock(blockStatement, moduleName);
            if (module) {
                return { filePath: cachedFilePath };
            }
        }
        
        return null;
    }

    /**
     * 在 BlockStatement 中查找模块
     */
    private findModuleInBlock(block: BlockStatement, moduleName: string): ModuleDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof ModuleDeclaration) {
                if (stmt.name && stmt.name.name === moduleName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findModuleInBlock(stmt, moduleName);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }

    /**
     * 查找结构体定义
     */
    private findStructDefinition(structName: string): { filePath: string } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const cachedFilePath of allCachedFiles) {
            // 跳过 .zn 文件，因为它们使用 ZincProgram 而不是 BlockStatement
            if (this.dataEnterManager.isZincFile(cachedFilePath)) {
                continue;
            }
            
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }
            
            const struct = this.findStructInBlock(blockStatement, structName);
            if (struct) {
                return { filePath: cachedFilePath };
            }
        }
        
        return null;
    }

    /**
     * 在 BlockStatement 中查找结构体
     */
    private findStructInBlock(block: BlockStatement, structName: string): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === structName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findStructInBlock(stmt, structName);
                if (found) {
                    return found;
                }
            }
        }
        
        return null;
    }

    /**
     * 获取相对路径
     */
    private getRelativePath(filePath: string): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            try {
                return vscode.workspace.asRelativePath(filePath);
            } catch {
                return filePath;
            }
        }
        return filePath;
    }

    /**
     * 提取 statement 前面的注释
     */
    private extractCommentForStatement(stmt: Statement, filePath: string): string | null {
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
        const markdown = formatCommentAsMarkdown(parsedComment);
        
        return markdown || null;
    }

    /**
     * 将 hover 内容保存到缓存
     * 只保存全局符号（函数、类型、结构体等），不保存局部变量
     */
    private saveHoverToCache(
        symbolName: string,
        hoverContents: vscode.MarkdownString[],
        currentFilePath: string
    ): void {
        if (hoverContents.length === 0) {
            return;
        }

        // 收集所有文件的缓存项
        const cacheItemsByFile = new Map<string, HoverCacheItem[]>();

        // 从 hoverContents 中提取信息并分组到各个文件
        // 注意：hoverContents 可能包含多个文件的符号，需要按文件分组
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const cachedFilePath of allCachedFiles) {
            // 跳过 .zn 文件，因为它们使用 ZincProgram 而不是 BlockStatement
            if (this.dataEnterManager.isZincFile(cachedFilePath)) {
                continue;
            }
            
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }

            // 检查这个文件中是否有匹配的符号
            const tempHoverContents: vscode.MarkdownString[] = [];
            this.findSymbolsInBlock(blockStatement, symbolName, cachedFilePath, tempHoverContents);

            if (tempHoverContents.length > 0) {
                const items: HoverCacheItem[] = tempHoverContents.map(content => ({
                    symbolName: symbolName,
                    filePath: cachedFilePath,
                    content: content.value
                }));
                cacheItemsByFile.set(cachedFilePath, items);
            }
        }

        if (cacheItemsByFile.size === 0) {
            return;
        }

        // 更新每个文件的缓存
        for (const [filePath, items] of cacheItemsByFile.entries()) {
            // 合并现有缓存（保留其他符号的缓存）
            const existingItems = this.hoverCache.get(filePath) || [];
            const otherItems = existingItems.filter(item => item.symbolName !== symbolName);
            const allItems = [...otherItems, ...items];
            this.hoverCache.update(filePath, allItems);
        }
    }

    /**
     * 检查是否是字符代码（如 'az09'），如果是则返回 hover 信息
     */
    private checkCharacterCodeHover(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.Hover | null {
        const lineText = document.lineAt(position.line).text;
        const char = position.character;
        
        // 查找单引号包围的字符代码
        // 从当前位置向前和向后查找，找到完整的字符代码
        let start = char;
        let end = char;
        
        // 向前查找单引号开始
        while (start > 0 && lineText[start - 1] !== "'") {
            start--;
        }
        
        // 向后查找单引号结束
        while (end < lineText.length && lineText[end] !== "'") {
            end++;
        }
        
        // 检查是否找到了完整的字符代码（以单引号开始和结束）
        if (start > 0 && end < lineText.length && 
            lineText[start - 1] === "'" && lineText[end] === "'") {
            const charCodeStr = lineText.substring(start, end);
            
            // 计算字符代码的整数值
            // 规则：每个字符占 8 位，从左到右分别是 24, 16, 8, 0 位
            let intValue = 0;
            if (charCodeStr.length === 4) {
                intValue = (charCodeStr.charCodeAt(0) << 24) | 
                          (charCodeStr.charCodeAt(1) << 16) | 
                          (charCodeStr.charCodeAt(2) << 8) | 
                          charCodeStr.charCodeAt(3);
            } else if (charCodeStr.length > 0 && charCodeStr.length < 4) {
                // 如果长度小于 4，右对齐（前面补 0）
                for (let i = 0; i < charCodeStr.length; i++) {
                    intValue |= (charCodeStr.charCodeAt(i) << (24 - i * 8));
                }
            } else if (charCodeStr.length > 4) {
                // 如果长度大于 4，只取前 4 个字符
                intValue = (charCodeStr.charCodeAt(0) << 24) | 
                          (charCodeStr.charCodeAt(1) << 16) | 
                          (charCodeStr.charCodeAt(2) << 8) | 
                          charCodeStr.charCodeAt(3);
            }
            
            // 转换为有符号 32 位整数
            intValue = intValue | 0;
            
            // 转换为无符号 32 位整数（用于16进制显示）
            const uintValue = intValue >>> 0;
            
            // 格式化16进制（8位，大写）
            const hexValue = uintValue.toString(16).toUpperCase().padStart(8, '0');
            
            // 创建 hover 内容
            const content = new vscode.MarkdownString();
            content.appendCodeblock(`'${charCodeStr}'`, 'jass');
            content.appendMarkdown(`\n**字符代码值**\n`);
            content.appendMarkdown(`- 十进制: \`${intValue}\`\n`);
            content.appendMarkdown(`- 十六进制: \`0x${hexValue}\`\n`);
            content.appendMarkdown(`- 无符号: \`${uintValue}\`\n`);
            
            // 创建范围（包含单引号）
            const range = new vscode.Range(
                position.line,
                start - 1,
                position.line,
                end + 1
            );
            
            return new vscode.Hover(content, range);
        }
        
        return null;
    }

    /**
     * 检查是否是 vJASS 内置常量、时间、随机数等，如果是则返回 hover 信息
     */
    private checkVjassBuiltinHover(symbolName: string): vscode.MarkdownString | null {
        if (!this.vjassInfoRef) {
            return null;
        }

        const info = this.vjassInfoRef.symbols.get(symbolName);
        if (info) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`**vJASS 内置 ${info.type}**\n\n`);
            content.appendMarkdown(`${info.description}\n\n`);
            if (info.value) {
                content.appendMarkdown(`值: \`${info.value}\`\n`);
            }
            return content;
        }

        return null;
    }
}

