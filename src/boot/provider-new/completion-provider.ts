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
    TextMacroStatement
} from '../vjass/vjass-ast';
import { AllKeywords } from '../jass/keyword';
import { TextMacroRegistry } from '../vjass/text-macro-registry';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from './comment-parser';

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

            // 检查是否在 struct 成员访问上下文中（如 structInstance.）
            const memberAccessContext = this.getMemberAccessContext(document, position);
            
            if (memberAccessContext) {
                // 在成员访问上下文中，只提供该 struct/interface 的成员
                this.provideMemberAccessCompletion(memberAccessContext, items, itemSet);
                return items;
            }

            // 检查是否在 takes 上下文中
            const takesContext = this.getTakesContext(document, position);
            
            if (takesContext) {
                // 在 takes 上下文中，提供类型和参数名称补全
                this.provideTakesCompletion(takesContext, document, position, items);
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

                // 2. 从所有缓存的文件中提取补全项
                try {
                    const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
                    
                    for (const filePath of allCachedFiles) {
                        try {
                            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
                            if (!blockStatement) {
                                continue;
                            }

                            // 提取当前文件的补全项
                            this.extractCompletionItems(blockStatement, items, filePath === document.uri.fsPath, position, itemSet, filePath);
                        } catch (error) {
                            console.error(`Error processing file ${filePath}:`, error);
                            // 继续处理其他文件
                        }
                    }

                    // 4. 如果是当前文件，查找包含当前位置的函数/方法，提取局部变量
                    try {
                        const currentFileBlock = this.dataEnterManager.getBlockStatement(document.uri.fsPath);
                        if (currentFileBlock) {
                            this.extractLocalVariablesFromCurrentFile(currentFileBlock, items, position);
                        }
                    } catch (error) {
                        console.error('Error extracting local variables:', error);
                        // 继续处理其他补全项
                    }
                } catch (error) {
                    console.error('Error processing cached files:', error);
                    // 继续处理其他补全项
                }

                // 3. 添加 TextMacro 补全项
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
                            // 代码部分优先使用 appendCodeblock
                            documentation.appendCodeblock(doc, 'jass');
                            
                            // 显示文件路径
                            documentation.appendMarkdown(`\n\n**_>:** \`${this.getRelativePath(macro.filePath)}\``);
                            
                            item.documentation = documentation;
                            item.insertText = macro.name;
                            item.sortText = `3_macro_${macro.name}`;
                            items.push(item);
                            itemSet.add(macro.name);
                        }
                    });
                } catch (error) {
                    console.error('Error processing TextMacros:', error);
                    // 继续处理其他补全项
                }
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
            // 查找包含当前位置的函数声明
            const func = this.findContainingFunction(block, position);
            if (func) {
                this.extractFunctionLocalVariables(func, items, position);
                return;
            }

            // 查找包含当前位置的方法声明
            const method = this.findContainingMethod(block, position);
            if (method) {
                this.extractMethodLocalVariables(method, items, position);
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
     */
    private findContainingFunction(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | null {
        try {
            let bestMatch: FunctionDeclaration | null = null;
            let bestMatchScore = -1;

            for (const stmt of block.body) {
                if (stmt instanceof FunctionDeclaration) {
                    // 优先检查函数体范围
                    if (stmt.body && stmt.body.start && stmt.body.end) {
                        if (this.isPositionInRange(position, stmt.body.start, stmt.body.end)) {
                            // 如果位置在函数体内，这是最佳匹配
                            return stmt;
                        }
                    }
                    
                    // 检查位置是否在函数声明范围内
                    if (stmt.start && stmt.end) {
                        if (this.isPositionInRange(position, stmt.start, stmt.end)) {
                            // 计算匹配分数（优先选择更内层的函数）
                            const score = stmt.end.line - stmt.start.line;
                            if (score > bestMatchScore) {
                                bestMatch = stmt;
                                bestMatchScore = score;
                            }
                        }
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

            return bestMatch;
        } catch (error) {
            console.error('Error finding containing function:', error);
        }

        return null;
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
        // 检查位置是否在结构体范围内
        if (struct.start && struct.end && !this.isPositionInRange(position, struct.start, struct.end)) {
            return null;
        }

        let bestMatch: MethodDeclaration | null = null;
        let bestMatchScore = -1;

        for (const member of struct.members) {
            if (member instanceof MethodDeclaration) {
                // 优先检查方法体范围
                if (member.body && member.body.start && member.body.end) {
                    if (this.isPositionInRange(position, member.body.start, member.body.end)) {
                        return member; // 如果位置在方法体内，这是最佳匹配
                    }
                }

                // 检查位置是否在方法声明范围内
                if (member.start && member.end) {
                    if (this.isPositionInRange(position, member.start, member.end)) {
                        // 计算匹配分数（优先选择更内层的方法）
                        const score = member.end.line - member.start.line;
                        if (score > bestMatchScore) {
                            bestMatch = member;
                            bestMatchScore = score;
                        }
                    }
                }
            }
        }

        return bestMatch;
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
        // 检查位置是否在函数范围内（包括函数体）
        if (!func.start || !func.end) {
            return;
        }

        // 使用更宽松的判断：检查位置是否在函数声明行之后
        // 如果函数体有位置信息，优先使用函数体的范围
        let isInFunction = false;
        
        if (func.body && func.body.start && func.body.end) {
            // 检查位置是否在函数体内
            isInFunction = this.isPositionInRange(position, func.body.start, func.body.end);
        } else {
            // 如果没有函数体位置信息，检查是否在函数声明范围内
            isInFunction = this.isPositionInRange(position, func.start, func.end);
        }

        if (!isInFunction) {
            return;
        }

        // 添加参数
        func.parameters.forEach(param => {
            const item = new vscode.CompletionItem(
                param.name.name,
                vscode.CompletionItemKind.Variable
            );
            item.detail = 'Parameter';
            const typeStr = param.type ? param.type.toString() : 'unknown';
            item.documentation = `Type: ${typeStr}`;
            item.sortText = `0_param_${param.name.name}`; // 参数排在前面
            items.push(item);
        });

        // 添加函数体内的局部变量
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
        // 检查位置是否在方法范围内
        if (!method.start || !method.end) {
            return;
        }

        // 使用更宽松的判断：检查位置是否在方法体内
        let isInMethod = false;
        
        if (method.body && method.body.start && method.body.end) {
            // 检查位置是否在方法体内
            isInMethod = this.isPositionInRange(position, method.body.start, method.body.end);
        } else {
            // 如果没有方法体位置信息，检查是否在方法声明范围内
            isInMethod = this.isPositionInRange(position, method.start, method.end);
        }

        if (!isInMethod) {
            return;
        }

        // 添加参数
        method.parameters.forEach(param => {
            const item = new vscode.CompletionItem(
                param.name.name,
                vscode.CompletionItemKind.Variable
            );
            item.detail = 'Method Parameter';
            const typeStr = param.type ? param.type.toString() : 'unknown';
            item.documentation = `Type: ${typeStr}`;
            item.sortText = `0_param_${param.name.name}`; // 参数排在前面
            items.push(item);
        });

        // 添加方法体内的局部变量
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
                    item.sortText = `1_local_${stmt.name.name}`; // 局部变量排在参数之后
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
                    item.sortText = `1_local_${stmt.name.name}`;
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

        // 检查行号范围
        if (posLine < start.line || posLine > end.line) {
            return false;
        }

        // 检查开始行的位置
        if (posLine === start.line && start.position !== undefined && posChar < start.position) {
            return false;
        }

        // 检查结束行的位置
        if (posLine === end.line && end.position !== undefined && posChar > end.position) {
            return false;
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

        // 检查最后一个词是否是类型
        const isLastWordType = basicTypes.includes(lastWord.toLowerCase()) || 
                              (lastWord && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(lastWord));

        // 如果最后一个词是类型，且没有参数名，期望参数名
        if (isLastWordType && (!secondLastWord || !basicTypes.includes(secondLastWord.toLowerCase()))) {
            // 检查是否已经有参数名了
            // 如果最后一个词是类型，且前面没有其他类型，则期望参数名
            // 但如果最后一个词后面还有内容（可能是正在输入的参数名），则不期望参数名
            const cursorInWord = position.character > 0 && 
                                /[a-zA-Z0-9_]/.test(lineText[position.character - 1]);
            if (!cursorInWord) {
                // 光标不在单词中，如果最后一个词是类型，期望参数名
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
        // 提供已解析的函数/方法的参数签名作为补全项
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
     * 从 BlockStatement 中提取结构体类型
     */
    /**
     * 检测是否在成员访问上下文中（如 structInstance.）
     */
    private getMemberAccessContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): { structName: string; isStatic: boolean } | null {
        const lineText = document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        
        // 匹配模式：identifier. 或 identifier .（允许空格）
        const memberAccessPattern = /(\w+)\s*\.\s*$/;
        const match = textBeforeCursor.match(memberAccessPattern);
        
        if (!match) {
            return null;
        }
        
        const identifier = match[1];
        
        // 检查是否是 static 访问（如 StructName.）
        // 简单启发式：如果标识符首字母大写，可能是类型名
        const isStatic = identifier[0] === identifier[0].toUpperCase();
        
        return {
            structName: identifier,
            isStatic
        };
    }

    /**
     * 提供成员访问补全（如 structInstance. 后提示成员）
     */
    private provideMemberAccessCompletion(
        context: { structName: string; isStatic: boolean },
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
                // 提供 struct 成员补全
                this.addStructMembers(foundStruct, items, itemSet, context.isStatic, foundFilePath);
            } else if (foundInterface && foundFilePath) {
                // 提供 interface 成员补全
                this.addInterfaceMembers(foundInterface, items, itemSet, context.isStatic, foundFilePath);
            }
        } catch (error) {
            console.error('Error in provideMemberAccessCompletion:', error);
        }
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
     * 添加 struct 成员到补全列表
     */
    private addStructMembers(
        struct: StructDeclaration,
        items: vscode.CompletionItem[],
        itemSet: Set<string>,
        isStatic: boolean,
        filePath: string
    ): void {
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

    private extractStructTypesFromBlock(block: BlockStatement, structSet: Set<string>): void {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name) {
                    structSet.add(stmt.name.name);
                }
            }

            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                this.extractStructTypesFromBlock(stmt, structSet);
            }
        }
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
}

