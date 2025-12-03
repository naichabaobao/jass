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
    Identifier,
    TextMacroStatement,
    ImplementStatement,
    ZincBlockStatement
} from '../vjass/vjass-ast';
import { AllKeywords } from '../jass/keyword';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { CompletionCache } from './completion-cache';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from './comment-parser';
import { ZincKeywords } from '../jass/keyword';
import { 
    ZincProgram, 
    ZincStatement,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincMethodDeclaration
} from '../vjass/zinc-ast';
import { InnerZincParser } from '../vjass/inner-zinc-parser';
import { ZincLocalScopeHelper } from './zinc/zinc-local-scope-helper';

/**
 * 基于新 AST 系统的代码补全提供者
 */
export class CompletionProvider implements vscode.CompletionItemProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        try {
            const items: vscode.CompletionItem[] = [];
            const itemSet = new Set<string>(); // 用于去重

            // 检查是否在 //! zinc 块内
            const zincBlockInfo = this.findZincBlock(document, position);
            if (zincBlockInfo) {
                // 在 Zinc 块内，提供 Zinc 补全
                return this.provideZincCompletion(zincBlockInfo, document, position, items, itemSet);
            }

            // 检查是否在 struct 成员访问上下文中（如 structInstance.）
            const memberAccessContext = this.getMemberAccessContext(document, position);
            
            if (memberAccessContext) {
                // 在成员访问上下文中，只提供该 struct/interface 的成员
                this.provideMemberAccessCompletion(memberAccessContext, items, itemSet);
                // 即使没有找到成员，也返回 items（可能是空数组）
                // 这样 VSCode 知道我们处理了这个上下文，不会显示其他补全
                return items.length > 0 ? items : [];
            }

            // 检查是否在 local 上下文中
            const localContext = this.getLocalContext(document, position);
            
            if (localContext) {
                // 在 local 上下文中，提供类型补全
                this.provideLocalCompletion(localContext, document, position, items);
                // local 上下文只提供类型，不提供其他补全
                return items.length > 0 ? items : [];
            }

            // 检查是否在 takes 上下文中
            const takesContext = this.getTakesContext(document, position);
            
            if (takesContext) {
                // 在 takes 上下文中，提供类型和参数名称补全
                this.provideTakesCompletion(takesContext, document, position, items);
                // takes 上下文只提供类型和参数名，不提供其他补全
                return items.length > 0 ? items : [];
            } else {
                // 正常补全流程
                // 1. 添加关键字
                AllKeywords.forEach(keyword => {
                    if (!itemSet.has(keyword)) {
                        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                        item.sortText = `0_keyword_${keyword}`;
                        items.push(item);
                        itemSet.add(keyword);
                    }
                });

                // 2. 从补全项缓存中读取（只读，哪怕是落后的）
                try {
                    const completionCache = CompletionCache.getInstance();
                    const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                    
                    for (const filePath of allCachedFiles) {
                        try {
                            // 只从缓存读取，不自己生成
                            const cachedItems = completionCache.get(filePath);
                            for (const item of cachedItems) {
                                const key = item.label as string;
                                if (!itemSet.has(key)) {
                                    items.push(item);
                                    itemSet.add(key);
                                }
                            }
                        } catch (error) {
                            // 忽略错误，继续处理其他文件
                        }
                    }
                } catch (error) {
                    // 忽略错误，继续处理其他补全项
                }

                // 3. 添加 TextMacro 补全项（从 TextMacroRegistry 读取）
                try {
                    const textMacroRegistry = TextMacroRegistry.getInstance();
                    const allMacros = textMacroRegistry.getAll();
                    allMacros.forEach(macro => {
                        if (!itemSet.has(macro.name)) {
                            const item = new vscode.CompletionItem(
                                macro.name,
                                vscode.CompletionItemKind.Snippet
                            );
                            item.detail = 'TextMacro';
                            
                            const params = macro.parameters.length > 0
                                ? ` takes ${macro.parameters.join(', ')}`
                                : '';
                            const doc = `textmacro ${macro.name}${params}`;
                            
                            const documentation = new vscode.MarkdownString();
                            documentation.appendCodeblock(doc, 'jass');
                            documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(macro.filePath)}\``);
                            
                            item.documentation = documentation;
                            item.insertText = macro.name;
                            item.sortText = `3_macro_${macro.name}`;
                            items.push(item);
                            itemSet.add(macro.name);
                        }
                    });
                } catch (error) {
                    // 忽略错误
                }
            }

            // 4. 如果是当前文件，查找包含当前位置的函数/方法，提取局部变量和参数（需要实时计算）
            // 注意：无论是否在 takes 上下文中，都应该提取局部变量和参数
            try {
                const currentFileBlock = this.dataEnterManager.getBlockStatement(document.uri.fsPath);
                if (currentFileBlock) {
                    this.extractLocalVariablesFromCurrentFile(currentFileBlock, items, position);
                }
            } catch (error) {
                // 忽略错误
            }

            // 去重并排序
            const uniqueItems = this.deduplicateAndSort(items, itemSet);
            return uniqueItems;
        } catch (error) {
            console.error('Error in provideCompletionItems:', error);
            // 返回空数组而不是抛出异常，避免阻塞输入
            return [];
        }
    }

    /**
     * 从 BlockStatement 中提取补全项
     */
    private extractCompletionItems(
        blockStatement: BlockStatement,
        items: vscode.CompletionItem[],
        isCurrentFile: boolean,
        position: vscode.Position,
        itemSet: Set<string> | undefined,
        filePath: string
    ): void {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(blockStatement)) {
            // 在 globals 块中提取全局变量
            for (const stmt of blockStatement.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (!itemSet || !itemSet.has(stmt.name.name)) {
                        const item = new vscode.CompletionItem(
                            stmt.name.name,
                            vscode.CompletionItemKind.Variable
                        );
                        item.detail = 'Global Variable';
                        const typeStr = stmt.type ? stmt.type.toString() : 'unknown';
                        const constantStr = stmt.isConstant ? 'constant ' : '';
                        const arrayStr = stmt.isArray 
                            ? (stmt.arrayWidth !== null && stmt.arrayHeight !== null
                                ? ` array[${stmt.arrayWidth}][${stmt.arrayHeight}]`
                                : stmt.arraySize !== null
                                    ? ` array[${stmt.arraySize}]`
                                    : ' array')
                            : '';
                        const doc = `${constantStr}${typeStr}${arrayStr} ${stmt.name.name}`;
                        
                        // 添加注释
                        const comment = this.extractCommentForStatement(stmt, filePath);
                        
                        const documentation = new vscode.MarkdownString();
                        // 代码部分优先使用 appendCodeblock
                        documentation.appendCodeblock(doc, 'jass');
                        
                        if (comment) {
                            documentation.appendMarkdown('\n\n---\n\n');
                            documentation.appendMarkdown(comment);
                        }
                        
                        // 显示文件路径
                        documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                        
                        item.documentation = documentation;
                        item.sortText = `2_var_${stmt.name.name}`;
                        items.push(item);
                        if (itemSet) itemSet.add(stmt.name.name);
                    }
                }
            }
            return;
        }

        // 遍历所有语句
        for (const stmt of blockStatement.body) {
            this.extractFromStatement(stmt, items, isCurrentFile, position, itemSet, filePath);
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.extractCompletionItems(stmt, items, isCurrentFile, position, itemSet, filePath);
            }
        }
    }

    /**
     * 从语句中提取补全项
     */
    private extractFromStatement(
        stmt: Statement,
        items: vscode.CompletionItem[],
        isCurrentFile: boolean,
        position: vscode.Position,
        itemSet: Set<string> | undefined,
        filePath: string
    ): void {
        // 函数声明
        if (stmt instanceof FunctionDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Function
                );
                item.detail = 'Function';
                let doc = this.formatFunctionSignature(stmt);
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_func_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // Native 函数声明
        else if (stmt instanceof NativeDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Function
                );
                item.detail = stmt.isConstant ? 'Constant Native Function' : 'Native Function';
                let doc = this.formatNativeSignature(stmt);
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
 
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_native_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 函数接口声明
        else if (stmt instanceof FunctionInterfaceDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Interface
                );
                item.detail = 'Function Interface';
                let doc = this.formatFunctionInterfaceSignature(stmt);
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_func_interface_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 变量声明（全局变量）
        else if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
            if (!itemSet || !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Variable
                );
                item.detail = 'Global Variable';
                const typeStr = stmt.type ? stmt.type.toString() : 'unknown';
                const constantStr = stmt.isConstant ? 'constant ' : '';
                const arrayStr = stmt.isArray 
                    ? (stmt.arrayWidth !== null && stmt.arrayHeight !== null
                        ? ` array[${stmt.arrayWidth}][${stmt.arrayHeight}]`
                        : stmt.arraySize !== null
                            ? ` array[${stmt.arraySize}]`
                            : ' array')
                    : '';
                const doc = `${constantStr}${typeStr}${arrayStr} ${stmt.name.name}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `2_var_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 类型声明
        else if (stmt instanceof TypeDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Class
                );
                item.detail = 'Type';
                const baseType = stmt.baseType ? ` extends ${stmt.baseType.toString()}` : '';
                const doc = `type ${stmt.name.name}${baseType}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_type_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 结构体声明
        else if (stmt instanceof StructDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Struct
                );
                item.detail = 'Struct';
                const extendsInfo = stmt.extendsType ? ` extends ${stmt.extendsType.toString()}` : '';
                const indexInfo = stmt.indexSize !== null ? `[${stmt.indexSize}]` : '';
                const arrayInfo = stmt.isArrayStruct ? ` extends array${stmt.arraySize !== null ? ` [${stmt.arraySize}]` : ''}` : '';
                const doc = `struct${indexInfo} ${stmt.name.name}${extendsInfo}${arrayInfo}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_struct_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
            
            // 如果是当前文件，提取结构体成员（包括方法）中的局部变量
            if (isCurrentFile) {
                this.extractStructMembers(stmt, items, position);
            }
        }
        // 接口声明
        else if (stmt instanceof InterfaceDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Interface
                );
                item.detail = 'Interface';
                const doc = `interface ${stmt.name.name}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_interface_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 模块声明
        else if (stmt instanceof ModuleDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Module
                );
                item.detail = 'Module';
                const doc = `module ${stmt.name.name}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_module_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // 委托声明
        else if (stmt instanceof DelegateDeclaration) {
            if (stmt.name && (!itemSet || !itemSet.has(stmt.name.name))) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Class
                );
                item.detail = 'Delegate';
                const delegateType = stmt.delegateType ? stmt.delegateType.toString() : 'unknown';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                const doc = `${privateStr}delegate ${delegateType} ${stmt.name.name}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `1_delegate_${stmt.name.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name.name);
            }
        }
        // TextMacro 声明
        else if (stmt instanceof TextMacroStatement) {
            if (!itemSet || !itemSet.has(stmt.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name,
                    vscode.CompletionItemKind.Snippet
                );
                item.detail = 'TextMacro';
                const params = stmt.parameters.length > 0
                    ? ` takes ${stmt.parameters.join(', ')}`
                    : '';
                const doc = `textmacro ${stmt.name}${params}`;
                
                // 添加注释
                const comment = this.extractCommentForStatement(stmt, filePath);
                
                const documentation = new vscode.MarkdownString();
                // 代码部分优先使用 appendCodeblock
                documentation.appendCodeblock(doc, 'jass');
                
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                
                // 显示文件路径
                documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `3_macro_${stmt.name}`;
                items.push(item);
                if (itemSet) itemSet.add(stmt.name);
            }
        }

        // 如果是当前文件，提取局部变量和参数
        if (isCurrentFile) {
            this.extractLocalVariables(stmt, items, position);
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
     * 提取结构体成员中的局部变量（包括方法）
     */
    private extractStructMembers(
        struct: StructDeclaration,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        // 检查位置是否在结构体范围内
        if (!this.isPositionInRange(position, struct.start, struct.end)) {
            return;
        }

        // 遍历结构体成员
        for (const member of struct.members) {
            // 如果是方法声明，提取方法内的局部变量
            if (member instanceof MethodDeclaration) {
                this.extractMethodLocalVariables(member, items, position);
            }
        }
    }

    /**
     * 从当前文件中提取局部变量（查找包含当前位置的函数/方法）
     */
    private extractLocalVariablesFromCurrentFile(
        block: BlockStatement,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        try {
            const itemsBefore = items.length;
            
            // 查找包含当前位置的函数声明
            const func = this.findContainingFunction(block, position);
            if (func) {
                this.extractFunctionLocalVariables(func, items, position);
                const itemsAdded = items.length - itemsBefore;
                if (itemsAdded > 0) {
                    console.log(`[CompletionProvider] extractLocalVariablesFromCurrentFile: 函数 ${func.name?.name || 'unknown'}, 添加了 ${itemsAdded} 个局部变量/参数`);
                }
                return;
            }

            // 查找包含当前位置的方法声明
            const method = this.findContainingMethod(block, position);
            if (method) {
                this.extractMethodLocalVariables(method, items, position);
                const itemsAdded = items.length - itemsBefore;
                if (itemsAdded > 0) {
                    console.log(`[CompletionProvider] extractLocalVariablesFromCurrentFile: 方法 ${method.name?.name || 'unknown'}, 添加了 ${itemsAdded} 个局部变量/参数`);
                }
                return;
            }

            // 如果没找到函数/方法，尝试从整个文件中提取局部变量（更宽松的策略）
            // 这适用于位置信息不完整的情况
            this.extractLocalVariablesFromBlock(block, items, position);
        } catch (error) {
            // 如果出错，静默失败，不影响其他补全功能
            console.error('Error extracting local variables:', error);
        }
    }

    /**
     * 查找包含指定位置的函数声明
     * 参数在整个函数范围内都可用（包括函数声明行和函数体）
     */
    private findContainingFunction(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | null {
        try {
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
                }

                // 递归查找嵌套的 BlockStatement
                if (stmt instanceof BlockStatement) {
                    const nestedFunc = this.findContainingFunction(stmt, position);
                    if (nestedFunc) {
                        return nestedFunc; // 嵌套的函数优先级更高
                    }
                }
            }
        } catch (error) {
            console.error('Error finding containing function:', error);
        }

        return null;
    }
    
    /**
     * 收集所有函数名称（用于调试）
     */
    private collectAllFunctions(block: BlockStatement, functionNames: string[]): void {
        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                const funcName = stmt.name?.name || 'unknown';
                const startLine = stmt.start?.line ?? -1;
                const endLine = stmt.end?.line ?? -1;
                functionNames.push(`${funcName}(${startLine}-${endLine})`);
            }
            if (stmt instanceof BlockStatement) {
                this.collectAllFunctions(stmt, functionNames);
            }
        }
    }

    /**
     * 查找包含指定位置的方法声明
     */
    private findContainingMethod(
        block: BlockStatement,
        position: vscode.Position
    ): MethodDeclaration | null {
        try {
            for (const stmt of block.body) {
                if (stmt instanceof StructDeclaration) {
                    const method = this.findContainingMethodInStruct(stmt, position);
                    if (method) {
                        return method;
                    }
                }

                // 递归查找嵌套的 BlockStatement
                if (stmt instanceof BlockStatement) {
                    const nestedMethod = this.findContainingMethod(stmt, position);
                    if (nestedMethod) {
                        return nestedMethod;
                    }
                }
            }
        } catch (error) {
            console.error('Error finding containing method:', error);
        }

        return null;
    }

    /**
     * 在结构体中查找包含指定位置的方法声明
     */
    private findContainingMethodInStruct(
        struct: StructDeclaration,
        position: vscode.Position
    ): MethodDeclaration | null {
        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                // 检查位置是否在整个方法范围内（包括方法声明行和方法体）
                if (member.start && member.end) {
                    const methodStartLine = member.start.line;
                    const methodEndLine = member.end.line;
                    
                    // 位置在方法开始行和结束行之间（包括结束行）
                    // 允许位置在结束行的下一行（容错处理）
                    if (position.line >= methodStartLine && position.line <= methodEndLine + 1) {
                        return member;
                    }
                }
                // 如果没有位置信息，也检查方法体范围（作为补充）
                else if (member.body && this.isPositionInRange(position, member.body.start, member.body.end)) {
                    return member;
                }
            }
        }

        return null;
    }

    /**
     * 提取局部变量和参数（在当前作用域内）
     */
    private extractLocalVariables(
        stmt: Statement,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        // 函数声明中的局部变量和参数
        if (stmt instanceof FunctionDeclaration) {
            this.extractFunctionLocalVariables(stmt, items, position);
        }
        // 方法声明中的局部变量和参数
        else if (stmt instanceof MethodDeclaration) {
            this.extractMethodLocalVariables(stmt, items, position);
        }
    }

    /**
     * 提取函数内的局部变量和参数
     */
    private extractFunctionLocalVariables(
        func: FunctionDeclaration,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        // 检查位置是否在函数范围内（包括函数声明行和函数体）
        if (!func.start || !func.end) {
            // 如果没有位置信息，尝试使用函数体范围（作为补充）
            if (func.body && func.body.start && func.body.end) {
                if (!this.isPositionInRange(position, func.body.start, func.body.end)) {
                    return;
                }
            } else {
                return;
            }
        } else {
            const funcStartLine = func.start.line;
            const funcEndLine = func.end.line;
            
            // 位置在函数开始行和结束行之间（包括结束行）
            // 允许位置在结束行的下一行（容错处理）
            if (position.line < funcStartLine || position.line > funcEndLine + 1) {
                return;
            }
        }

        // 添加参数（参数在整个函数范围内都可用）
        // 使用 00_param_ 前缀，确保参数排在关键字（0_keyword_）之前
        func.parameters.forEach(param => {
            if (param.name) {
                const item = new vscode.CompletionItem(
                    param.name.name,
                    vscode.CompletionItemKind.Variable
                );
                item.detail = 'Parameter';
                const typeStr = param.type ? param.type.toString() : 'unknown';
                item.documentation = `Type: ${typeStr}`;
                item.sortText = `00_param_${param.name.name}`; // 参数排在关键字之前
                items.push(item);
            }
        });

        // 添加函数体内的局部变量（局部变量只在函数体内可用）
        if (func.body) {
            this.extractLocalVariablesFromBlock(func.body, items, position);
        }
    }

    /**
     * 提取方法内的局部变量和参数
     */
    private extractMethodLocalVariables(
        method: MethodDeclaration,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        // 检查位置是否在方法范围内（包括方法声明行和方法体）
        if (!method.start || !method.end) {
            // 如果没有位置信息，尝试使用方法体范围（作为补充）
            if (method.body && method.body.start && method.body.end) {
                if (!this.isPositionInRange(position, method.body.start, method.body.end)) {
                    return;
                }
            } else {
                return;
            }
        } else {
            const methodStartLine = method.start.line;
            const methodEndLine = method.end.line;
            
            // 位置在方法开始行和结束行之间（包括结束行）
            // 允许位置在结束行的下一行（容错处理）
            if (position.line < methodStartLine || position.line > methodEndLine + 1) {
                return;
            }
        }

        // 添加参数（参数在整个方法范围内都可用）
        // 使用 00_param_ 前缀，确保参数排在关键字（0_keyword_）之前
        method.parameters.forEach(param => {
            if (param.name) {
                const item = new vscode.CompletionItem(
                    param.name.name,
                    vscode.CompletionItemKind.Variable
                );
                item.detail = 'Method Parameter';
                const typeStr = param.type ? param.type.toString() : 'unknown';
                item.documentation = `Type: ${typeStr}`;
                item.sortText = `00_param_${param.name.name}`; // 参数排在关键字之前
                items.push(item);
            }
        });

        // 添加方法体内的局部变量（局部变量只在方法体内可用）
        if (method.body) {
            this.extractLocalVariablesFromBlock(method.body, items, position);
        }
    }

    /**
     * 从 BlockStatement 中提取局部变量（递归处理嵌套作用域）
     */
    private extractLocalVariablesFromBlock(
        block: BlockStatement,
        items: vscode.CompletionItem[],
        position: vscode.Position
    ): void {
        // 检查位置是否在当前块内（如果块有位置信息）
        if (block.start && block.end) {
            if (!this.isPositionInRange(position, block.start, block.end)) {
                return;
            }
        }

        for (const stmt of block.body) {
            // 只提取在当前位置之前的局部变量
            if (stmt.start && this.isPositionBeforeRange(position, stmt.start)) {
                // 提取局部变量声明
                if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                    const item = new vscode.CompletionItem(
                        stmt.name.name,
                        vscode.CompletionItemKind.Variable
                    );
                    item.detail = 'Local Variable';
                    const typeStr = stmt.type ? stmt.type.toString() : 'unknown';
                    item.documentation = `Type: ${typeStr}`;
                    item.sortText = `01_local_${stmt.name.name}`; // 局部变量排在参数之后，关键字之前
                    items.push(item);
                }
                // 递归处理嵌套的 BlockStatement（如 if/else、loop 等）
                else if (stmt instanceof BlockStatement) {
                    this.extractLocalVariablesFromBlock(stmt, items, position);
                }
            }
            // 如果位置信息不完整，也尝试提取（更宽松的策略）
            else if (!stmt.start) {
                // 如果语句没有位置信息，检查是否是局部变量声明
                if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                    const item = new vscode.CompletionItem(
                        stmt.name.name,
                        vscode.CompletionItemKind.Variable
                    );
                    item.detail = 'Local Variable';
                    const typeStr = stmt.type ? stmt.type.toString() : 'unknown';
                    item.documentation = `Type: ${typeStr}`;
                    item.sortText = `01_local_${stmt.name.name}`; // 局部变量排在参数之后，关键字之前
                    items.push(item);
                }
            }
        }
    }

    /**
     * 格式化函数签名
     */
    private formatFunctionSignature(func: FunctionDeclaration): string {
        const name = func.name?.name || 'unknown';
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';
        return `function ${name} takes ${params || 'nothing'} returns ${returnType}`;
    }

    /**
     * 格式化 Native 函数签名
     */
    private formatNativeSignature(native: NativeDeclaration): string {
        const name = native.name?.name || 'unknown';
        const constantStr = native.isConstant ? 'constant ' : '';
        const params = native.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';
        // native 本身就等价于 function，不需要额外的 function 关键字
        return `${constantStr}native ${name} takes ${params || 'nothing'} returns ${returnType}`;
    }

    /**
     * 格式化函数接口签名
     */
    private formatFunctionInterfaceSignature(func: FunctionInterfaceDeclaration): string {
        const name = func.name?.name || 'unknown';
        const params = func.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = func.returnType ? func.returnType.toString() : 'nothing';
        return `function interface ${name} takes ${params || 'nothing'} returns ${returnType}`;
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
     * 检查位置是否在范围内
     */
    private isPositionInRange(
        position: vscode.Position,
        start: { line: number; position: number },
        end: { line: number; position: number }
    ): boolean {
        // 防御性检查：如果位置信息无效，返回 false
        if (!start || !end || start.line === undefined || end.line === undefined) {
            return false;
        }

        const posLine = position.line;
        const posChar = position.character;
        const startLine = start.line;
        const endLine = end.line;

        // 检查行号范围
        if (posLine < startLine || posLine > endLine) {
            return false;
        }

        // 检查开始行的位置（如果位置信息完整）
        if (posLine === startLine && start.position !== undefined) {
            // 允许位置稍微宽松一些（允许在开始位置之前一点）
            // 这对于处理位置信息不准确的情况很有用
            if (posChar < start.position - 10) {  // 允许10个字符的误差
                return false;
            }
        }

        // 检查结束行的位置（如果位置信息完整）
        if (posLine === endLine && end.position !== undefined) {
            // 允许位置稍微宽松一些（允许在结束位置之后一点）
            if (posChar > end.position + 10) {  // 允许10个字符的误差
                return false;
            }
        }

        return true;
    }

    /**
     * 检查位置是否在范围之前
     */
    private isPositionBeforeRange(
        position: vscode.Position,
        start: { line: number; position: number }
    ): boolean {
        // 防御性检查：如果位置信息无效，返回 false
        if (!start || start.line === undefined) {
            return false;
        }

        const posLine = position.line;
        const posChar = position.character;

        if (posLine < start.line) {
            return true;
        }

        if (posLine === start.line && start.position !== undefined && posChar < start.position) {
            return true;
        }

        return false;
    }

    /**
     * 获取 local 上下文信息
     */
    private getLocalContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { expectsType: boolean; expectsName: boolean } | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);

        // 检查是否包含 "local" 关键字（使用单词边界匹配）
        const localRegex = /\blocal\b/;
        const localMatch = textBeforeCursor.match(localRegex);
        if (!localMatch || localMatch.index === undefined) {
            return null;
        }

        // 获取 "local" 之后的文本
        const afterLocalText = textBeforeCursor.substring(localMatch.index + 5).trim();

        // 如果 "local" 后是空的，期望类型
        if (afterLocalText.length === 0) {
            return { expectsType: true, expectsName: false };
        }

        // 检查最后一个单词
        const words = afterLocalText.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) {
            return { expectsType: true, expectsName: false };
        }

        const lastWord = words[words.length - 1];

        // 基本类型列表
        const basicTypes = ['integer', 'real', 'string', 'boolean', 'code', 'handle', 'nothing'];

        // 检查最后一个词是否是类型（基本类型或自定义类型）
        const isLastWordType = basicTypes.includes(lastWord.toLowerCase()) || 
                              this.isCustomTypeName(document, lastWord);

        // 如果最后一个词是类型，期望变量名
        if (isLastWordType) {
            // 检查光标是否在单词中（可能是正在输入的变量名）
            const cursorInWord = position.character > 0 && 
                                /[a-zA-Z0-9_]/.test(lineText[position.character - 1]);
            if (!cursorInWord) {
                // 光标不在单词中，如果最后一个词是类型，期望变量名
                return { expectsType: false, expectsName: true };
            }
        }

        // 默认期望类型（在 local 之后）
        return { expectsType: true, expectsName: false };
    }

    /**
     * 提供 local 上下文中的补全项
     */
    private provideLocalCompletion(
        context: { expectsType: boolean; expectsName: boolean },
        document: vscode.TextDocument,
        position: vscode.Position,
        items: vscode.CompletionItem[]
    ): void {
        if (context.expectsType) {
            // 提供类型补全（基本类型 + 自定义类型 + struct 类型）
            this.provideTypeCompletions(document, position, items);
        }
        
        if (context.expectsName) {
            // 提供变量名建议
            this.provideVariableNameSuggestions(items);
        }
    }

    /**
     * 提供变量名建议
     */
    private provideVariableNameSuggestions(items: vscode.CompletionItem[]): void {
        // 常见的变量名模式
        const commonVarNames = [
            'x', 'y', 'z',
            'i', 'j', 'k',
            'a', 'b', 'c',
            'value', 'data', 'info',
            'unit', 'player', 'location',
            'target', 'source', 'caster',
            'id', 'index', 'count',
            'angle', 'distance', 'duration',
            'temp', 'result', 'ret'
        ];
        
        commonVarNames.forEach(name => {
            const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
            item.detail = 'Variable Name Suggestion';
            item.documentation = `Suggested variable name: ${name}`;
            item.insertText = name;
            item.sortText = `2_var_${name}`;
            items.push(item);
        });
    }

    /**
     * 获取 takes 上下文信息
     */
    private getTakesContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { expectsType: boolean; expectsName: boolean; afterComma: boolean } | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);

        // 检查是否包含 "takes" 关键字（使用单词边界匹配）
        const takesRegex = /\btakes\b/;
        const takesMatch = textBeforeCursor.match(takesRegex);
        if (!takesMatch || takesMatch.index === undefined) {
            return null;
        }

        // 检查 "takes" 之后是否有 "returns"（如果已经到 returns，不需要补全）
        const afterTakesText = textBeforeCursor.substring(takesMatch.index + 5);
        if (/\breturns\b/.test(afterTakesText)) {
            return null;
        }

        // 获取 "takes" 之后的文本
        const afterTakes = afterTakesText.trim();

        // 如果 "takes" 后是空的，期望类型
        if (afterTakes.length === 0) {
            return { expectsType: true, expectsName: false, afterComma: false };
        }

        // 检查是否是 "nothing"
        if (/^nothing\b/.test(afterTakes)) {
            return null; // nothing 后面不需要补全
        }

        // 检查最后一个单词
        const words = afterTakes.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) {
            return { expectsType: true, expectsName: false, afterComma: false };
        }

        const lastWord = words[words.length - 1];
        const secondLastWord = words.length >= 2 ? words[words.length - 2] : null;

        // 基本类型列表
        const basicTypes = ['integer', 'real', 'string', 'boolean', 'code', 'handle', 'nothing'];

        // 检查是否在逗号之后（新参数）
        const lastCommaIndex = afterTakes.lastIndexOf(',');
        const afterComma = lastCommaIndex !== -1;
        const afterLastComma = afterComma ? afterTakes.substring(lastCommaIndex + 1).trim() : afterTakes;

        // 如果在逗号之后且为空，期望类型
        if (afterComma && afterLastComma.length === 0) {
            return { expectsType: true, expectsName: false, afterComma: true };
        }

        // 检查最后一个词是否是类型（基本类型或自定义类型）
        // 需要检查是否是已定义的自定义类型（struct 或 type 声明）
        const isLastWordType = basicTypes.includes(lastWord.toLowerCase()) || 
                              this.isCustomTypeName(document, lastWord);

        // 如果最后一个词是类型，期望参数名
        if (isLastWordType) {
            // 检查光标是否在单词中（可能是正在输入的参数名）
            const cursorInWord = position.character > 0 && 
                                /[a-zA-Z0-9_]/.test(lineText[position.character - 1]);
            
            // 如果光标不在单词中，或者光标在单词中但最后一个词后面有空格（表示类型已输入完）
            // 检查最后一个词后面是否有空格
            const afterLastWord = afterTakes.substring(afterTakes.lastIndexOf(lastWord) + lastWord.length).trim();
            const hasSpaceAfterLastWord = afterLastWord.length > 0 || 
                                         (position.character < lineText.length && /\s/.test(lineText[position.character]));
            
            if (!cursorInWord || hasSpaceAfterLastWord) {
                // 如果最后一个词是类型，且类型后面有空格或光标不在单词中，期望参数名
                return { expectsType: false, expectsName: true, afterComma: afterComma };
            }
        }

        // 如果在逗号之后，期望类型
        if (afterComma) {
            return { expectsType: true, expectsName: false, afterComma: true };
        }

        // 默认期望类型（在 takes 之后）
        return { expectsType: true, expectsName: false, afterComma: false };
    }

    /**
     * 提供 takes 上下文中的补全项
     */
    private provideTakesCompletion(
        context: { expectsType: boolean; expectsName: boolean; afterComma: boolean },
        document: vscode.TextDocument,
        position: vscode.Position,
        items: vscode.CompletionItem[]
    ): void {
        if (context.expectsType) {
            // 提供类型补全（基本类型 + 自定义类型 + struct 类型）
            this.provideTypeCompletions(document, position, items);
        }
        
        if (context.expectsName) {
            // 提供参数名建议
            this.provideParameterNameSuggestions(items);
        }
        
        // 如果是在 takes 之后且还没有任何参数，提供 "nothing" 选项
        if (!context.afterComma) {
            const nothingItem = new vscode.CompletionItem('nothing', vscode.CompletionItemKind.Keyword);
            nothingItem.detail = 'No Parameters';
            nothingItem.documentation = 'Function takes no parameters';
            nothingItem.insertText = 'nothing';
            nothingItem.sortText = `0_nothing`;
            items.push(nothingItem);
        }
        
        // 提供已解析的函数/方法的参数签名作为补全项（作为参考）
        this.provideTakesSignatures(document, position, items);
    }

    /**
     * 提供已解析的函数/方法的 takes 参数签名作为补全项
     */
    private provideTakesSignatures(
        document: vscode.TextDocument,
        position: vscode.Position,
        items: vscode.CompletionItem[]
    ): void {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        const signatureSet = new Set<string>(); // 用于去重

        // 从所有缓存文件中提取函数和方法的参数签名
        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            this.extractTakesSignaturesFromBlock(blockStatement, signatureSet, position);
        }

        // 创建补全项
        signatureSet.forEach(signature => {
            const item = new vscode.CompletionItem(
                signature,
                vscode.CompletionItemKind.Snippet
            );
            item.detail = 'Parameter Signature';
            item.documentation = `Insert parameter signature: ${signature}`;
            item.insertText = signature;
            item.sortText = `0_${signature}`;
            items.push(item);
        });

        // 如果没有找到任何签名，提供 "nothing" 选项
        if (signatureSet.size === 0) {
            const nothingItem = new vscode.CompletionItem('nothing', vscode.CompletionItemKind.Keyword);
            nothingItem.detail = 'No Parameters';
            nothingItem.documentation = 'Function takes no parameters';
            nothingItem.insertText = 'nothing';
            items.push(nothingItem);
        }
    }

    /**
     * 从 BlockStatement 中提取 takes 参数签名
     */
    private extractTakesSignaturesFromBlock(
        block: BlockStatement,
        signatureSet: Set<string>,
        position: vscode.Position
    ): void {
        for (const stmt of block.body) {
            // 提取函数声明的参数签名
            if (stmt instanceof FunctionDeclaration) {
                const signature = this.formatTakesSignature(stmt.parameters);
                if (signature) {
                    signatureSet.add(signature);
                }
            }
            // 提取 Native 函数声明的参数签名
            if (stmt instanceof NativeDeclaration) {
                const signature = this.formatTakesSignature(stmt.parameters);
                if (signature) {
                    signatureSet.add(signature);
                }
            }

            // 提取方法声明的参数签名
            if (stmt instanceof StructDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        const signature = this.formatTakesSignature(member.parameters);
                        if (signature) {
                            signatureSet.add(signature);
                        }
                    }
                }
            }

            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.extractTakesSignaturesFromBlock(stmt, signatureSet, position);
            }
        }
    }

    /**
     * 格式化参数签名为字符串
     */
    private formatTakesSignature(parameters: VariableDeclaration[]): string | null {
        if (parameters.length === 0) {
            return 'nothing';
        }

        return parameters
            .map(param => {
                const typeStr = param.type ? param.type.toString() : 'unknown';
                const nameStr = param.name.name;
                return `${typeStr} ${nameStr}`;
            })
            .join(', ');
    }

    /**
     * 从 BlockStatement 中提取类型声明
     */
    private extractTypesFromBlock(block: BlockStatement, typeSet: Set<string>): void {
        for (const stmt of block.body) {
            if (stmt instanceof TypeDeclaration) {
                if (stmt.name) {
                    typeSet.add(stmt.name.name);
                }
            }

            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.extractTypesFromBlock(stmt, typeSet);
            }
        }
    }

    /**
     * 提供类型补全（基本类型 + 自定义类型 + struct 类型）
     */
    private provideTypeCompletions(
        document: vscode.TextDocument,
        position: vscode.Position,
        items: vscode.CompletionItem[]
    ): void {
        const typeSet = new Set<string>();
        
        // 1. 添加基本类型
        const basicTypes = ['integer', 'real', 'string', 'boolean', 'code', 'handle', 'nothing'];
        basicTypes.forEach(type => {
            typeSet.add(type);
            const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Keyword);
            item.detail = 'Basic Type';
            item.documentation = `JASS basic type: ${type}`;
            item.insertText = type;
            item.sortText = `0_basic_${type}`;
            items.push(item);
        });
        
        // 2. 从所有缓存文件中提取自定义类型（type 声明）
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }
            
            this.extractTypesFromBlock(blockStatement, typeSet);
        }
        
        // 3. 从所有缓存文件中提取结构体类型
        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }
            
            this.extractStructTypesFromBlock(blockStatement, typeSet, items);
        }
        
        // 4. 添加自定义类型补全项
        typeSet.forEach(type => {
            if (!basicTypes.includes(type)) {
                const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
                item.detail = 'Custom Type';
                item.documentation = `Custom type: ${type}`;
                item.insertText = type;
                item.sortText = `1_custom_${type}`;
                items.push(item);
            }
        });
    }
    
    /**
     * 从 BlockStatement 中提取结构体类型
     */
    private extractStructTypesFromBlock(
        block: BlockStatement,
        typeSet: Set<string>,
        items: vscode.CompletionItem[]
    ): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration && stmt.name) {
                const structName = stmt.name.name;
                if (!typeSet.has(structName)) {
                    typeSet.add(structName);
                    const item = new vscode.CompletionItem(structName, vscode.CompletionItemKind.Class);
                    item.detail = 'Struct Type';
                    item.documentation = `Struct type: ${structName}`;
                    item.insertText = structName;
                    item.sortText = `1_struct_${structName}`;
                    items.push(item);
                }
            }
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.extractStructTypesFromBlock(stmt, typeSet, items);
            }
        }
    }
    
    /**
     * 提供参数名建议
     */
    private provideParameterNameSuggestions(items: vscode.CompletionItem[]): void {
        // 常见的参数名模式
        const commonParamNames = [
            'x', 'y', 'z',
            'i', 'j', 'k',
            'a', 'b', 'c',
            'value', 'data', 'info',
            'unit', 'player', 'location',
            'target', 'source', 'caster',
            'id', 'index', 'count',
            'angle', 'distance', 'duration'
        ];
        
        commonParamNames.forEach(name => {
            const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
            item.detail = 'Parameter Name Suggestion';
            item.documentation = `Suggested parameter name: ${name}`;
            item.insertText = name;
            item.sortText = `2_param_${name}`;
            items.push(item);
        });
    }

    /**
     * 检测是否在成员访问上下文中（如 structInstance.、this.、thistype.）
     */
    private getMemberAccessContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { structName: string; isStatic: boolean; isThis: boolean; isThistype: boolean } | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        
        // 匹配模式：identifier. 或 identifier .（允许空格）
        // 需要匹配最后一个点号前的标识符，支持链式访问（如 aaaaaa.method_f.）
        // 从后往前查找，找到最后一个点号，然后提取第一个点号前的标识符（链式访问的根对象）
        // 先找到最后一个点号的位置
        const lastDotIndex = textBeforeCursor.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return null;
        }
        
        // 提取最后一个点号前的文本（可能是链式访问，如 aaaaaa.method_f）
        const beforeLastDot = textBeforeCursor.substring(0, lastDotIndex).trim();
        if (beforeLastDot.length === 0) {
            return null;
        }
        
        // 对于链式访问（如 aaaaaa.method_f），我们需要找到第一个标识符（根对象）
        // 先检查是否有多个点号（链式访问）
        const firstDotIndex = beforeLastDot.indexOf('.');
        let identifierToCheck: string;
        
        if (firstDotIndex !== -1) {
            // 有链式访问，提取第一个点号前的标识符（根对象）
            identifierToCheck = beforeLastDot.substring(0, firstDotIndex).trim();
        } else {
            // 没有链式访问，提取整个标识符
            // 匹配最后一个完整的标识符（单词字符序列）
            const identifierMatch = beforeLastDot.match(/(\w+)\s*$/);
            if (!identifierMatch) {
                return null;
            }
            identifierToCheck = identifierMatch[1];
        }
        
        if (!identifierToCheck || identifierToCheck.length === 0) {
            return null;
        }
        
        // 获取标识符（用于 this/thistype 检查）
        const identifier = identifierToCheck.toLowerCase();
        
        // 检查是否是 this 或 thistype
        if (identifier === 'this') {
            // this. 表示实例访问，需要查找当前方法所属的 struct
            const currentStruct = this.findCurrentStruct(document, position);
            if (currentStruct) {
                return {
                    structName: currentStruct.name?.name || '',
                    isStatic: false,
                    isThis: true,
                    isThistype: false
                };
            }
            return null;
        }
        
        if (identifier === 'thistype') {
            // thistype. 表示静态访问，需要查找当前 struct
            const currentStruct = this.findCurrentStruct(document, position);
            if (currentStruct) {
                return {
                    structName: currentStruct.name?.name || '',
                    isStatic: true,
                    isThis: false,
                    isThistype: true
                };
            }
            return null;
        }
        
        // 普通标识符访问
        // 先尝试查找变量类型（变量类型推断）
        // 注意：identifierToCheck 可能是变量名（如 aaaaaa），需要先查找变量类型
        const originalIdentifier = identifierToCheck;
        const variableType = this.findVariableType(document, position, originalIdentifier);
        
        if (variableType) {
            // 找到了变量类型，这是实例访问
            // 使用变量类型（而不是变量名）来查找 struct/interface
            let typeName = variableType;
            
            // 如果类型是 "thistype"，需要查找当前 struct
            if (typeName.toLowerCase() === 'thistype') {
                const currentStruct = this.findCurrentStruct(document, position);
                if (currentStruct && currentStruct.name) {
                    typeName = currentStruct.name.name;
                } else {
                    // 如果找不到当前 struct，返回 null
                    return null;
                }
            }
            
            // 使用变量类型（而不是变量名）来查找 struct/interface
            return {
                structName: typeName,  // 使用类型名，不是变量名
                isStatic: false,
                isThis: false,
                isThistype: false
            };
        }
        
        // 如果没有找到变量类型，可能是：
        // 1. 变量不存在或还未声明
        // 2. 这是一个类型名（静态访问，如 StructName.）
        
        // 检查是否是 static 访问（如 StructName.）
        // 简单启发式：如果标识符首字母大写，可能是类型名
        const isStatic = originalIdentifier[0] === originalIdentifier[0].toUpperCase();
        
        // 如果是小写开头的标识符，但没有找到变量类型，返回 null（不提供补全）
        // 这样可以避免错误地将变量名当作类型名
        if (!isStatic) {
            // 变量名通常是小写开头，如果找不到变量类型，不应该提供补全
            // 添加调试信息
            console.log(`[CompletionProvider] 未找到变量类型: ${originalIdentifier}，可能是变量未声明或位置信息不准确`);
            return null;
        }
        
        // 首字母大写，可能是类型名（静态访问）
        return {
            structName: originalIdentifier,
            isStatic,
            isThis: false,
            isThistype: false
        };
    }
    
    /**
     * 查找变量的类型（用于类型推断）
     * 查找顺序：1. local 变量 2. takes 参数 3. globals 变量
     */
    private findVariableType(
        document: vscode.TextDocument,
        position: vscode.Position,
        variableName: string
    ): string | null {
        const filePath = document.uri.fsPath;
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        if (!blockStatement) {
            console.log(`[CompletionProvider] findVariableType: 未找到 blockStatement for ${filePath}`);
            return null;
        }
        
        // 查找包含当前位置的函数或方法
        const containingFunction = this.findContainingFunction(blockStatement, position);
        const containingMethod = this.findContainingMethod(blockStatement, position);
        
        if (!containingFunction && !containingMethod) {
            console.log(`[CompletionProvider] findVariableType: 未找到包含位置的函数或方法`);
        }
        
        // 1. 优先查找局部变量（local）
        if (containingFunction) {
            // 先查找函数体内的局部变量
            if (containingFunction.body) {
                const varType = this.findVariableInBlock(containingFunction.body, variableName, position);
                if (varType) {
                    console.log(`[CompletionProvider] findVariableType: 在函数局部变量中找到 ${variableName}，类型: ${varType}`);
                    return varType;
                }
            }
        }
        
        if (containingMethod) {
            // 先查找方法体内的局部变量
            if (containingMethod.body) {
                const varType = this.findVariableInBlock(containingMethod.body, variableName, position);
                if (varType) {
                    console.log(`[CompletionProvider] findVariableType: 在方法局部变量中找到 ${variableName}，类型: ${varType}`);
                    return varType;
                }
            }
        }
        
        // 2. 然后查找 takes 参数
        if (containingFunction) {
            const varType = this.findVariableInFunction(containingFunction, variableName, position);
            if (varType) {
                console.log(`[CompletionProvider] findVariableType: 在函数参数中找到 ${variableName}，类型: ${varType}`);
                return varType;
            }
        }
        
        if (containingMethod) {
            const varType = this.findVariableInMethod(containingMethod, variableName, position);
            if (varType) {
                console.log(`[CompletionProvider] findVariableType: 在方法参数中找到 ${variableName}，类型: ${varType}`);
                return varType;
            }
        }
        
        // 3. 最后查找 globals 变量
        const globalsType = this.findVariableInGlobals(blockStatement, variableName);
        if (globalsType) {
            console.log(`[CompletionProvider] findVariableType: 在 globals 中找到 ${variableName}，类型: ${globalsType}`);
            return globalsType;
        }
        
        console.log(`[CompletionProvider] findVariableType: 未找到变量 ${variableName} 的类型`);
        return null;
    }
    
    /**
     * 在函数中查找变量类型（只查找 takes 参数）
     */
    private findVariableInFunction(
        func: FunctionDeclaration,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 只检查参数（takes）
        for (const param of func.parameters) {
            if (param.name.name === variableName) {
                if (param.type) {
                    return param.type.toString();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 在方法中查找变量类型（只查找 takes 参数）
     */
    private findVariableInMethod(
        method: MethodDeclaration,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 只检查参数（takes）
        for (const param of method.parameters) {
            if (param.name.name === variableName) {
                if (param.type) {
                    return param.type.toString();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 在 BlockStatement 中查找变量类型
     */
    private findVariableInBlock(
        block: BlockStatement,
        variableName: string,
        position: vscode.Position
    ): string | null {
        // 收集所有匹配的变量声明
        const candidates: { stmt: VariableDeclaration; priority: number }[] = [];
        
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                if (stmt.name.name === variableName) {
                    if (stmt.type) {
                        // 计算优先级：位置越靠前，优先级越高
                        let priority = 0;
                        if (stmt.start && stmt.start.line !== undefined) {
                            const stmtLine = stmt.start.line;
                            const posLine = position.line;
                            
                            if (stmtLine < posLine) {
                                // 变量在之前的行，优先级高
                                priority = 1000 - (posLine - stmtLine);
                            } else if (stmtLine === posLine) {
                                // 变量在同一行，检查列位置
                                // 对于 `call aaaaaa.` 这种情况，变量声明应该在点号之前
                                if (stmt.start.position !== undefined) {
                                    const stmtPos = stmt.start.position;
                                    const posChar = position.character;
                                    
                                    if (stmtPos < posChar) {
                                        // 变量在当前位置之前，优先级中等
                                        priority = 500 - (posChar - stmtPos);
                                    } else {
                                        // 变量在当前位置之后，但仍然在同一行
                                        // 可能是变量声明在调用之后，但这种情况不应该发生
                                        // 不过为了容错，给一个很低的优先级
                                        priority = 10;
                                    }
                                } else {
                                    // 没有列位置信息，但行号匹配，给一个较低的优先级
                                    // 这种情况可能是位置信息不完整，但仍然尝试使用
                                    priority = 100;
                                }
                            } else {
                                // 变量在当前位置之后的行，优先级为 0（不添加）
                                // 但如果是紧接的下一行，可能是位置信息有误差，给一个很低的优先级
                                if (stmtLine === posLine + 1) {
                                    priority = 5;
                                }
                            }
                        } else {
                            // 没有位置信息，优先级最低（但仍然考虑）
                            // 这对于位置信息不完整的情况很有用
                            priority = 1;
                        }
                        
                        if (priority > 0) {
                            candidates.push({ stmt, priority });
                        }
                    }
                }
            }
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                const varType = this.findVariableInBlock(stmt, variableName, position);
                if (varType) {
                    return varType;
                }
            }
        }
        
        // 如果有候选变量，选择优先级最高的
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.priority - a.priority);
            const bestMatch = candidates[0].stmt;
            if (bestMatch.type) {
                const typeStr = bestMatch.type.toString();
                console.log(`[CompletionProvider] findVariableInBlock: 找到变量 ${variableName}，类型: ${typeStr}，优先级: ${candidates[0].priority}`);
                return typeStr;
            }
        }
        
        return null;
    }
    
    /**
     * 收集所有 struct 名称（用于调试）
     */
    private collectStructNames(block: BlockStatement, structNames: string[]): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration && stmt.name) {
                structNames.push(stmt.name.name);
            }
            if (stmt instanceof BlockStatement) {
                this.collectStructNames(stmt, structNames);
            }
        }
    }
    
    /**
     * 在 globals 块中查找变量类型
     */
    private findVariableInGlobals(
        block: BlockStatement,
        variableName: string
    ): string | null {
        // 检查是否是 globals 块
        if (this.isGlobalsBlock(block)) {
            for (const stmt of block.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (stmt.name.name === variableName) {
                        if (stmt.type) {
                            return stmt.type.toString();
                        }
                    }
                }
            }
            return null;
        }
        
        // 递归查找嵌套的 BlockStatement
        for (const stmt of block.body) {
            if (stmt instanceof BlockStatement) {
                const varType = this.findVariableInGlobals(stmt, variableName);
                if (varType) {
                    return varType;
                }
            }
        }
        
        return null;
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
                // 检查位置是否在 struct 范围内
                if (stmt.start && stmt.end) {
                    if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                        // 检查是否在某个方法内部（方法内的 this 指向 struct 实例）
                        const method = this.findContainingMethodInStruct(stmt, position);
                        if (method) {
                            return stmt;
                        }
                    }
                }
            }
            
            // 递归查找嵌套的 BlockStatement
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
     * 提供成员访问补全（如 structInstance.、this.、thistype. 后提示成员）
     */
    private provideMemberAccessCompletion(
        context: { structName: string; isStatic: boolean; isThis: boolean; isThistype: boolean },
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        try {
            const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
            let foundStruct: StructDeclaration | null = null;
            let foundInterface: InterfaceDeclaration | null = null;
            let foundFilePath: string | null = null;
            
            // 查找对应的 struct 或 interface
            for (const filePath of allCachedFiles) {
                const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                if (!blockStatement) {
                    continue;
                }
                
                foundStruct = this.findStructInBlock(blockStatement, context.structName);
                if (foundStruct) {
                    foundFilePath = filePath;
                    break;
                }
                
                foundInterface = this.findInterfaceInBlock(blockStatement, context.structName);
                if (foundInterface) {
                    foundFilePath = filePath;
                    break;
                }
            }
            
            if (foundStruct && foundFilePath) {
                // 提供 struct 成员补全（包括内置方法）
                this.addStructMembers(foundStruct, items, itemSet, context.isStatic, foundFilePath, context.isThis, context.isThistype);
            } else if (foundInterface && foundFilePath) {
                // 提供 interface 成员补全
                this.addInterfaceMembers(foundInterface, items, itemSet, context.isStatic, foundFilePath);
            } else {
                // 如果没有找到 struct 或 interface，记录调试信息
                // 这可能是变量类型推断失败，或者类型名称不匹配
                console.log(`[CompletionProvider] 未找到 struct/interface: ${context.structName}`);
                console.log(`[CompletionProvider] 查找的文件数: ${allCachedFiles.length}`);
                // 列出所有可用的 struct 名称（用于调试）
                const allStructNames: string[] = [];
                for (const filePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                    if (blockStatement) {
                        this.collectStructNames(blockStatement, allStructNames);
                    }
                }
                console.log(`[CompletionProvider] 可用的 struct 名称: ${allStructNames.join(', ')}`);
            }
        } catch (error) {
            console.error('Error in provideMemberAccessCompletion:', error);
        }
    }

    /**
     * 检查是否是自定义类型（struct 或 type 声明）
     */
    private isCustomTypeName(document: vscode.TextDocument, typeName: string): boolean {
        if (!typeName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(typeName)) {
            return false;
        }
        
        // 从所有缓存文件中查找类型
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }
            
            // 检查是否是 type 声明
            if (this.findTypeInBlock(blockStatement, typeName)) {
                return true;
            }
            
            // 检查是否是 struct 声明
            if (this.findStructInBlock(blockStatement, typeName) !== null) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 在 BlockStatement 中查找类型声明
     */
    private findTypeInBlock(block: BlockStatement, typeName: string): boolean {
        for (const stmt of block.body) {
            if (stmt instanceof TypeDeclaration && stmt.name && stmt.name.name === typeName) {
                return true;
            }
            
            if (stmt instanceof BlockStatement) {
                if (this.findTypeInBlock(stmt, typeName)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * 在 BlockStatement 中查找 struct
     */
    private findStructInBlock(block: BlockStatement, name: string): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration && stmt.name && stmt.name.name === name) {
                return stmt;
            }
            if (stmt instanceof BlockStatement) {
                const found = this.findStructInBlock(stmt, name);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 在 BlockStatement 中查找 interface
     */
    private findInterfaceInBlock(block: BlockStatement, name: string): InterfaceDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof InterfaceDeclaration && stmt.name && stmt.name.name === name) {
                return stmt;
            }
            if (stmt instanceof BlockStatement) {
                const found = this.findInterfaceInBlock(stmt, name);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 添加 struct 成员到补全列表（包括内置方法）
     */
    private addStructMembers(
        struct: StructDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        filePath: string,
        isThis: boolean = false,
        isThistype: boolean = false
    ): void {
        const structName = struct.name?.name || 'unknown';
        
        // 添加声明的成员
        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && (!itemSet.has(member.name.name))) {
                    // 如果是 static 访问，只显示 static 方法
                    if (isStatic && !member.isStatic) {
                        continue;
                    }
                    // 如果是实例访问，不显示 static 方法
                    if (!isStatic && member.isStatic) {
                        continue;
                    }
                    
                    const item = new vscode.CompletionItem(
                        member.name.name,
                        vscode.CompletionItemKind.Method
                    );
                    item.detail = member.isStatic ? 'Static Method' : 'Method';
                    
                    const doc = this.formatMethodSignature(member);
                    const comment = this.extractCommentForStatement(member, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    // 代码部分优先使用 appendCodeblock
                    documentation.appendCodeblock(doc, 'jass');
                    
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    
                    // 显示文件路径
                    documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                    item.sortText = `0_member_${member.name.name}`;
                    items.push(item);
                    itemSet.add(member.name.name);
                }
            } else if (member instanceof VariableDeclaration) {
                if (!itemSet.has(member.name.name)) {
                    // 如果是 static 访问，只显示 static 字段
                    if (isStatic && !member.isStatic) {
                        continue;
                    }
                    // 如果是实例访问，不显示 static 字段
                    if (!isStatic && member.isStatic) {
                        continue;
                    }
                    
                    const item = new vscode.CompletionItem(
                        member.name.name,
                        member.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Field
                    );
                    const typeStr = member.type ? member.type.toString() : 'unknown';
                    const modifiers: string[] = [];
                    if (member.isStatic) modifiers.push('static');
                    if (member.isReadonly) modifiers.push('readonly');
                    if (member.isConstant) modifiers.push('constant');
                    const modifierStr = modifiers.length > 0 ? `${modifiers.join(' ')} ` : '';
                    const arrayStr = member.isArray 
                        ? (member.arrayWidth !== null && member.arrayHeight !== null
                            ? ` array[${member.arrayWidth}][${member.arrayHeight}]`
                            : member.arraySize !== null
                                ? ` array[${member.arraySize}]`
                                : ' array')
                        : '';
                    const doc = `${modifierStr}${typeStr}${arrayStr} ${member.name.name}`;
                    const comment = this.extractCommentForStatement(member, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    // 代码部分优先使用 appendCodeblock
                    documentation.appendCodeblock(doc, 'jass');
                    
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    
                    // 显示文件路径
                    documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.detail = `${modifierStr}${typeStr}`;
                    item.documentation = documentation;
                    item.sortText = `0_member_${member.name.name}`;
                    items.push(item);
                    itemSet.add(member.name.name);
                }
            }
        }
        
        // 添加实现的 module 成员
        this.addModuleMembers(struct, items, itemSet, isStatic, filePath);
        
        // 添加内置方法
        this.addBuiltinMethods(struct, items, itemSet, isStatic, structName, filePath);
    }
    
    /**
     * 添加 module 成员到补全列表（展开 struct 实现的 module）
     */
    private addModuleMembers(
        struct: StructDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        filePath: string
    ): void {
        // 查找 struct 实现的 module
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        
        for (const member of struct.members) {
            if (member instanceof ImplementStatement) {
                const moduleName = member.moduleName.name;
                
                // 在所有文件中查找 module
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }
                    
                    const module = this.findModuleInBlock(blockStatement, moduleName);
                    if (module) {
                        // 添加 module 的成员
                        this.addModuleMembersToItems(module, items, itemSet, isStatic, cachedFilePath);
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * 在 BlockStatement 中查找 module
     */
    private findModuleInBlock(block: BlockStatement, moduleName: string): ModuleDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof ModuleDeclaration && stmt.name && stmt.name.name === moduleName) {
                return stmt;
            }
            if (stmt instanceof BlockStatement) {
                const found = this.findModuleInBlock(stmt, moduleName);
                if (found) return found;
            }
        }
        return null;
    }
    
    /**
     * 添加 module 成员到补全项列表
     */
    private addModuleMembersToItems(
        module: ModuleDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        filePath: string
    ): void {
        for (const member of module.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && (!itemSet.has(member.name.name))) {
                    // 如果是 static 访问，只显示 static 方法
                    if (isStatic && !member.isStatic) {
                        continue;
                    }
                    // 如果是实例访问，不显示 static 方法
                    if (!isStatic && member.isStatic) {
                        continue;
                    }
                    
                    const item = new vscode.CompletionItem(
                        member.name.name,
                        vscode.CompletionItemKind.Method
                    );
                    item.detail = member.isStatic ? 'Static Method (from module)' : 'Method (from module)';
                    
                    const doc = this.formatMethodSignature(member);
                    const comment = this.extractCommentForStatement(member, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    documentation.appendCodeblock(doc, 'jass');
                    
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    
                    documentation.appendMarkdown(`\n\n**来自模块:** \`${module.name?.name || 'unknown'}\``);
                    documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                    item.sortText = `1_module_${member.name.name}`;
                    items.push(item);
                    itemSet.add(member.name.name);
                }
            } else if (member instanceof VariableDeclaration) {
                if (!itemSet.has(member.name.name)) {
                    // 如果是 static 访问，只显示 static 字段
                    if (isStatic && !member.isStatic) {
                        continue;
                    }
                    // 如果是实例访问，不显示 static 字段
                    if (!isStatic && member.isStatic) {
                        continue;
                    }
                    
                    const item = new vscode.CompletionItem(
                        member.name.name,
                        member.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Field
                    );
                    const typeStr = member.type ? member.type.toString() : 'unknown';
                    const modifiers: string[] = [];
                    if (member.isStatic) modifiers.push('static');
                    if (member.isReadonly) modifiers.push('readonly');
                    if (member.isConstant) modifiers.push('constant');
                    const modifierStr = modifiers.length > 0 ? `${modifiers.join(' ')} ` : '';
                    const arrayStr = member.isArray 
                        ? (member.arrayWidth !== null && member.arrayHeight !== null
                            ? ` array[${member.arrayWidth}][${member.arrayHeight}]`
                            : member.arraySize !== null
                                ? ` array[${member.arraySize}]`
                                : ' array')
                        : '';
                    const doc = `${modifierStr}${typeStr}${arrayStr} ${member.name.name}`;
                    const comment = this.extractCommentForStatement(member, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    documentation.appendCodeblock(doc, 'jass');
                    
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    
                    documentation.appendMarkdown(`\n\n**来自模块:** \`${module.name?.name || 'unknown'}\``);
                    documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.detail = `${modifierStr}${typeStr} (from module)`;
                    item.documentation = documentation;
                    item.sortText = `1_module_${member.name.name}`;
                    items.push(item);
                    itemSet.add(member.name.name);
                }
            } else if (member instanceof ImplementStatement) {
                // 递归处理 module 中实现的 module（嵌套 module）
                const nestedModuleName = member.moduleName.name;
                const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                
                for (const cachedFilePath of allCachedFiles) {
                    const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
                    if (!blockStatement) {
                        continue;
                    }
                    
                    const nestedModule = this.findModuleInBlock(blockStatement, nestedModuleName);
                    if (nestedModule) {
                        this.addModuleMembersToItems(nestedModule, items, itemSet, isStatic, cachedFilePath);
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * 添加内置方法到补全列表
     */
    private addBuiltinMethods(
        struct: StructDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        structName: string,
        filePath: string
    ): void {
        // 检查是否有自定义的 create 方法
        const hasCustomCreate = struct.members.some(
            m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
        );
        
        // allocate() - 静态私有方法，总是存在
        if (isStatic && !itemSet.has('allocate')) {
            const item = new vscode.CompletionItem('allocate', vscode.CompletionItemKind.Method);
            item.detail = 'Built-in Static Method (Private)';
            
            // 如果存在自定义 create，allocate 需要相同参数
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
            const documentation = new vscode.MarkdownString();
            documentation.appendCodeblock(doc, 'jass');
            documentation.appendMarkdown('\n\n**内置方法** - 为该结构分配唯一的实例 ID');
            documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            
            item.documentation = documentation;
            item.sortText = `0_builtin_allocate`;
            items.push(item);
            itemSet.add('allocate');
        }
        
        // create() - 静态方法，如果未声明则使用默认实现
        if (isStatic && !itemSet.has('create')) {
            const item = new vscode.CompletionItem('create', vscode.CompletionItemKind.Method);
            item.detail = hasCustomCreate ? 'Static Method' : 'Built-in Static Method';
            
            const createMethod = struct.members.find(
                m => m instanceof MethodDeclaration && m.isStatic && m.name?.name === 'create'
            ) as MethodDeclaration | undefined;
            
            let paramsStr = 'nothing';
            let returnType = structName;
            if (createMethod) {
                if (createMethod.parameters.length > 0) {
                    paramsStr = createMethod.parameters
                        .map(p => {
                            const typeStr = p.type ? p.type.toString() : 'unknown';
                            return `${typeStr} ${p.name.name}`;
                        })
                        .join(', ');
                }
                returnType = createMethod.returnType ? createMethod.returnType.toString() : structName;
            }
            
            const doc = `static method create takes ${paramsStr} returns ${returnType}`;
            const documentation = new vscode.MarkdownString();
            documentation.appendCodeblock(doc, 'jass');
            if (!hasCustomCreate) {
                documentation.appendMarkdown('\n\n**内置方法** - 创建结构实例（默认调用 allocate）');
            }
            documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            
            item.documentation = documentation;
            item.sortText = `0_builtin_create`;
            items.push(item);
            itemSet.add('create');
        }
        
        // destroy() - 实例或静态方法
        if (!itemSet.has('destroy')) {
            // 查找自定义的 destroy 方法
            const customDestroy = struct.members.find(
                m => m instanceof MethodDeclaration && m.name?.name === 'destroy'
            ) as MethodDeclaration | undefined;
            
            const hasCustomDestroy = customDestroy !== undefined;
            const isCustomDestroyStatic = customDestroy?.isStatic || false;
            
            // 如果是静态访问，只显示静态的 destroy（如果有）
            // 如果是实例访问，显示实例的 destroy（总是存在，可能是自定义的）
            if (isStatic) {
                // 静态访问：只显示静态的 destroy
                if (hasCustomDestroy && isCustomDestroyStatic) {
                    const item = new vscode.CompletionItem('destroy', vscode.CompletionItemKind.Method);
                    item.detail = 'Static Method';
                    
                    const doc = this.formatMethodSignature(customDestroy);
                    const comment = this.extractCommentForStatement(customDestroy, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    documentation.appendCodeblock(doc, 'jass');
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                    item.sortText = `0_member_destroy`;
                    items.push(item);
                    itemSet.add('destroy');
                }
            } else {
                // 实例访问：destroy 总是存在
                const item = new vscode.CompletionItem('destroy', vscode.CompletionItemKind.Method);
                item.detail = hasCustomDestroy ? 'Method' : 'Built-in Method';
                
                if (hasCustomDestroy && !isCustomDestroyStatic) {
                    const doc = this.formatMethodSignature(customDestroy);
                    const comment = this.extractCommentForStatement(customDestroy, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    documentation.appendCodeblock(doc, 'jass');
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                } else {
                    const doc = `method destroy takes nothing returns nothing`;
                    const documentation = new vscode.MarkdownString();
                    documentation.appendCodeblock(doc, 'jass');
                    documentation.appendMarkdown('\n\n**内置方法** - 销毁结构实例');
                    documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                }
                
                item.sortText = `0_builtin_destroy`;
                items.push(item);
                itemSet.add('destroy');
            }
        }
        
        // deallocate() - 实例方法（调用默认 destroy）
        if (!isStatic && !itemSet.has('deallocate')) {
            const item = new vscode.CompletionItem('deallocate', vscode.CompletionItemKind.Method);
            item.detail = 'Built-in Method';
            
            const doc = `method deallocate takes nothing returns nothing`;
            const documentation = new vscode.MarkdownString();
            documentation.appendCodeblock(doc, 'jass');
            documentation.appendMarkdown('\n\n**内置方法** - 调用默认的 destroy 方法');
            documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
            
            item.documentation = documentation;
            item.sortText = `0_builtin_deallocate`;
            items.push(item);
            itemSet.add('deallocate');
        }
        
        // onDestroy() - 实例方法（可选，如果声明了则存在）
        if (!isStatic && !itemSet.has('onDestroy')) {
            const hasOnDestroy = struct.members.some(
                m => m instanceof MethodDeclaration && !m.isStatic && m.name?.name === 'onDestroy'
            );
            
            if (hasOnDestroy) {
                const onDestroyMethod = struct.members.find(
                    m => m instanceof MethodDeclaration && !m.isStatic && m.name?.name === 'onDestroy'
                ) as MethodDeclaration | undefined;
                
                const item = new vscode.CompletionItem('onDestroy', vscode.CompletionItemKind.Method);
                item.detail = 'Method';
                
                const doc = this.formatMethodSignature(onDestroyMethod!);
                const comment = this.extractCommentForStatement(onDestroyMethod!, filePath);
                
                const documentation = new vscode.MarkdownString();
                documentation.appendCodeblock(doc, 'jass');
                documentation.appendMarkdown('\n\n**特殊方法** - 在结构实例销毁时自动调用');
                if (comment) {
                    documentation.appendMarkdown('\n\n---\n\n');
                    documentation.appendMarkdown(comment);
                }
                documentation.appendMarkdown(`\n\n**文件:** \`${this.getRelativePath(filePath)}\``);
                
                item.documentation = documentation;
                item.sortText = `0_member_onDestroy`;
                items.push(item);
                itemSet.add('onDestroy');
            }
        }
    }

    /**
     * 添加 interface 成员到补全列表
     */
    private addInterfaceMembers(
        interface_: InterfaceDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        filePath: string
    ): void {
        for (const member of interface_.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && (!itemSet.has(member.name.name))) {
                    if (isStatic && !member.isStatic) {
                        continue;
                    }
                    if (!isStatic && member.isStatic) {
                        continue;
                    }
                    
                    const item = new vscode.CompletionItem(
                        member.name.name,
                        vscode.CompletionItemKind.Method
                    );
                    item.detail = member.isStatic ? 'Static Method' : 'Method';
                    
                    const doc = this.formatMethodSignature(member);
                    const comment = this.extractCommentForStatement(member, filePath);
                    
                    const documentation = new vscode.MarkdownString();
                    // 代码部分优先使用 appendCodeblock
                    documentation.appendCodeblock(doc, 'jass');
                    
                    if (comment) {
                        documentation.appendMarkdown('\n\n---\n\n');
                        documentation.appendMarkdown(comment);
                    }
                    
                    // 显示文件路径
                    documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(filePath)}\``);
                    
                    item.documentation = documentation;
                    item.sortText = `0_member_${member.name.name}`;
                    items.push(item);
                    itemSet.add(member.name.name);
                }
            }
        }
    }

    /**
     * 去重并排序补全项
     */
    private deduplicateAndSort(items: vscode.CompletionItem[], itemSet: Set<string>): vscode.CompletionItem[] {
        const uniqueItems: vscode.CompletionItem[] = [];
        const seen = new Set<string>();
        
        for (const item of items) {
            const key = item.label as string;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueItems.push(item);
                
                // 如果没有 sortText，设置默认值
                if (!item.sortText) {
                    item.sortText = `9_${key}`;
                }
            }
        }
        
        // 按 sortText 排序
        uniqueItems.sort((a, b) => {
            const aSort = a.sortText || '';
            const bSort = b.sortText || '';
            return aSort.localeCompare(bSort);
        });
        
        return uniqueItems;
    }

    resolveCompletionItem?(
        item: vscode.CompletionItem,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CompletionItem> {
        // 可以在这里添加更详细的文档
        return item;
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
     * 查找包含指定位置的 Zinc 块
     */
    private findZincBlock(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { block: ZincBlockStatement; content: string; startLine: number } | null {
        try {
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }

            // 递归查找 Zinc 块
            return this.findZincBlockInBlock(blockStatement, position);
        } catch (error) {
            console.error('Error finding Zinc block:', error);
            return null;
        }
    }

    /**
     * 在 BlockStatement 中递归查找 Zinc 块
     */
    private findZincBlockInBlock(
        block: BlockStatement,
        position: vscode.Position
    ): { block: ZincBlockStatement; content: string; startLine: number } | null {
        for (const stmt of block.body) {
            if (stmt instanceof ZincBlockStatement) {
                // 检查位置是否在 Zinc 块内
                if (stmt.start && stmt.end) {
                    const startLine = stmt.start.line;
                    const endLine = stmt.end.line;
                    
                    // 位置在 Zinc 块范围内（不包括 //! zinc 和 //! endzinc 行）
                    if (position.line > startLine && position.line < endLine) {
                        return {
                            block: stmt,
                            content: stmt.content,
                            startLine: startLine + 1 // Zinc 内容从下一行开始
                        };
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                // 递归查找嵌套块
                const result = this.findZincBlockInBlock(stmt, position);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    /**
     * 提供 Zinc 补全
     */
    private provideZincCompletion(
        zincBlockInfo: { block: ZincBlockStatement; content: string; startLine: number },
        document: vscode.TextDocument,
        position: vscode.Position,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): vscode.CompletionItem[] {
        try {
            // 1. 添加 Zinc 关键字
            ZincKeywords.forEach(keyword => {
                if (!itemSet.has(keyword)) {
                    const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                    item.sortText = `0_keyword_${keyword}`;
                    items.push(item);
                    itemSet.add(keyword);
                }
            });

            // 2. 解析 Zinc 代码
            const zincContent = zincBlockInfo.content;
            if (!zincContent) {
                return items;
            }

            try {
                const zincParser = new InnerZincParser(zincContent, document.uri.fsPath);
                const zincStatements = zincParser.parse();
                const zincProgram = new ZincProgram(zincStatements);

                // 3. 从 Zinc AST 中提取补全项
                this.extractZincCompletionItemsFromProgram(zincProgram, document.uri.fsPath, items, itemSet);

                // 4. 添加局部变量和参数的补全
                this.addZincLocalVariablesAndParameters(zincProgram, position, items, itemSet, zincBlockInfo.startLine);

                // 5. 从所有缓存的 .zn 文件中提取补全项
                const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                for (const cachedFilePath of allCachedFiles) {
                    if (!this.dataEnterManager.isZincFile(cachedFilePath)) {
                        continue;
                    }

                    const program = this.dataEnterManager.getZincProgram(cachedFilePath);
                    if (program) {
                        this.extractZincCompletionItemsFromProgram(program, cachedFilePath, items, itemSet);
                    }
                }
            } catch (error) {
                console.error('Error parsing Zinc block:', error);
            }

            // 按 sortText 排序
            items.sort((a, b) => {
                const aSort = a.sortText || '';
                const bSort = b.sortText || '';
                return aSort.localeCompare(bSort);
            });

            return items;
        } catch (error) {
            console.error('Error providing Zinc completion:', error);
            return items;
        }
    }

    /**
     * 从 ZincProgram 中提取补全项
     */
    private extractZincCompletionItemsFromProgram(
        program: ZincProgram,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {
        for (const stmt of program.declarations) {
            this.extractZincCompletionItemsFromStatement(stmt, filePath, items, itemSet);
        }
    }

    /**
     * 从 ZincStatement 中提取补全项
     */
    private extractZincCompletionItemsFromStatement(
        stmt: ZincStatement,
        filePath: string,
        items: vscode.CompletionItem[],
        itemSet: Set<string>
    ): void {

        // 函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Function
                );
                
                const params = stmt.parameters.map((p: any) => {
                    const type = p.type ? p.type.name : 'nothing';
                    return `${type} ${p.name ? p.name.name : ''}`;
                }).join(', ');
                const returnType = stmt.returnType ? stmt.returnType.name : 'nothing';
                const publicStr = stmt.isPublic ? 'public ' : '';
                const privateStr = stmt.isPrivate ? 'private ' : '';
                const signature = `${publicStr}${privateStr}function ${stmt.name.name}(${params}) -> ${returnType}`;
                item.detail = signature;
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(signature, 'zinc');
                item.documentation = doc;

                item.sortText = `1_function_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 变量声明
        else if (stmt instanceof ZincVariableDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Variable
                );
                
                const type = stmt.type ? stmt.type.name : 'nothing';
                const constantStr = stmt.isConstant ? 'constant ' : '';
                const signature = `${constantStr}${type} ${stmt.name.name}`;
                item.detail = signature;
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(signature, 'zinc');
                item.documentation = doc;

                item.sortText = `2_variable_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 结构体声明
        else if (stmt instanceof ZincStructDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = new vscode.CompletionItem(
                    stmt.name.name,
                    vscode.CompletionItemKind.Class
                );
                item.detail = 'struct';
                
                const doc = new vscode.MarkdownString();
                doc.appendCodeblock(`struct ${stmt.name.name}`, 'zinc');
                item.documentation = doc;

                item.sortText = `3_struct_${stmt.name.name}`;
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // Library 声明（递归处理内部成员）
        else {
            // 检查是否是 LibraryDeclaration（通过检查是否有 body 属性）
            const libraryDecl = stmt as any;
            if (libraryDecl.body && libraryDecl.body.statements) {
                for (const member of libraryDecl.body.statements) {
                    this.extractZincCompletionItemsFromStatement(member, filePath, items, itemSet);
                }
            }
        }
    }

    /**
     * 添加 Zinc 局部变量和参数的补全
     */
    private addZincLocalVariablesAndParameters(
        program: ZincProgram,
        position: vscode.Position,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        zincStartLine: number
    ): void {
        try {
            // 调整位置（相对于 Zinc 块开始）
            const adjustedPosition = new vscode.Position(
                position.line - zincStartLine,
                position.character
            );

            // 使用 ZincLocalScopeHelper 查找包含当前位置的函数或方法
            const funcOrMethod = ZincLocalScopeHelper.findContainingFunctionOrMethod(program, adjustedPosition);
            
            if (funcOrMethod) {
                // 添加参数和局部变量（findLocalVariablesAndParameters 已经包含了参数）
                const locals = ZincLocalScopeHelper.findLocalVariablesAndParameters(
                    funcOrMethod,
                    adjustedPosition
                );
                
                locals.forEach((local: any) => {
                    const varName = local.variable?.name?.name || local.variable?.name;
                    if (varName && !itemSet.has(varName)) {
                        const item = new vscode.CompletionItem(
                            varName,
                            vscode.CompletionItemKind.Variable
                        );
                        item.detail = local.isParameter ? 'Parameter' : 'Local Variable';
                        item.sortText = local.isParameter ? `0_param_${varName}` : `1_local_${varName}`;
                        items.push(item);
                        itemSet.add(varName);
                    }
                });
            }
        } catch (error) {
            console.error('Error adding Zinc local variables:', error);
        }
    }
}

