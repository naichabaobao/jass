import * as vscode from 'vscode';
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
    TextMacroStatement
} from '../vjass/vjass-ast';
import { extractLeadingComments, parseComment, formatCommentAsMarkdown } from './comment-parser';
import { CustomCompletionItem } from './completion-cache';

/**
 * 补全项提取器
 * 从 BlockStatement 中提取补全项，供 data-enter.ts 和 completion-provider.ts 使用
 */
export class CompletionExtractor {
    /**
     * 从 BlockStatement 中提取补全项（不包含局部变量，因为局部变量需要位置信息）
     */
    public static extractCompletionItems(
        blockStatement: BlockStatement,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<Statement>[] {
        const items: CustomCompletionItem<Statement>[] = [];
        const itemSet = new Set<string>();

        // 检查是否是 globals 块
        if (CompletionExtractor.isGlobalsBlock(blockStatement)) {
            // 在 globals 块中提取全局变量
            for (const stmt of blockStatement.body) {
                if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                    if (!itemSet.has(stmt.name.name)) {
                        const item = CompletionExtractor.createGlobalVariableItem(
                            stmt,
                            filePath,
                            getFileContent,
                            getRelativePath
                        );
                        items.push(item);
                        itemSet.add(stmt.name.name);
                    }
                }
            }
            return items;
        }

        // 遍历所有语句
        for (const stmt of blockStatement.body) {
            CompletionExtractor.extractFromStatement(
                stmt,
                items,
                itemSet,
                filePath,
                getFileContent,
                getRelativePath
            );
            
            // 递归处理嵌套的 BlockStatement
            if (stmt instanceof BlockStatement) {
                const nestedItems = CompletionExtractor.extractCompletionItems(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                nestedItems.forEach(item => {
                    const key = item.label as string;
                    if (!itemSet.has(key)) {
                        items.push(item);
                        itemSet.add(key);
                    }
                });
            }
        }

        return items;
    }

    /**
     * 从语句中提取补全项
     */
    private static extractFromStatement(
        stmt: Statement,
        items: CustomCompletionItem<Statement>[],
        itemSet: Set<string>,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): void {
        // 函数声明
        if (stmt instanceof FunctionDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createFunctionItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // Native 函数声明
        else if (stmt instanceof NativeDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createNativeItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 函数接口声明
        else if (stmt instanceof FunctionInterfaceDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createFunctionInterfaceItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 变量声明（全局变量）
        else if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
            if (!itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createGlobalVariableItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 类型声明
        else if (stmt instanceof TypeDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createTypeItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 结构体声明
        else if (stmt instanceof StructDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createStructItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 接口声明
        else if (stmt instanceof InterfaceDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createInterfaceItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 模块声明
        else if (stmt instanceof ModuleDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createModuleItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // 委托声明
        else if (stmt instanceof DelegateDeclaration) {
            if (stmt.name && !itemSet.has(stmt.name.name)) {
                const item = CompletionExtractor.createDelegateItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name.name);
            }
        }
        // TextMacro 声明
        else if (stmt instanceof TextMacroStatement) {
            if (stmt.name && !itemSet.has(stmt.name)) {
                const item = CompletionExtractor.createTextMacroItem(
                    stmt,
                    filePath,
                    getFileContent,
                    getRelativePath
                );
                items.push(item);
                itemSet.add(stmt.name);
            }
        }
    }

    /**
     * 检查是否是 globals 块
     */
    private static isGlobalsBlock(block: BlockStatement): boolean {
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

    /**
     * 创建函数补全项
     */
    private static createFunctionItem(
        func: FunctionDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<FunctionDeclaration> {
        const item = new CustomCompletionItem<FunctionDeclaration>(
            func.name!.name,
            vscode.CompletionItemKind.Function,
            filePath,
            func
        );
        item.detail = 'Function';
        const doc = CompletionExtractor.formatFunctionSignature(func);
        const comment = CompletionExtractor.extractComment(func, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_func_${func.name!.name}`;
        return item;
    }

    /**
     * 创建 Native 函数补全项
     */
    private static createNativeItem(
        native: NativeDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<NativeDeclaration> {
        const item = new CustomCompletionItem<NativeDeclaration>(
            native.name!.name,
            vscode.CompletionItemKind.Function,
            filePath,
            native
        );
        item.detail = native.isConstant ? 'Constant Native Function' : 'Native Function';
        const doc = CompletionExtractor.formatNativeSignature(native);
        const comment = CompletionExtractor.extractComment(native, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_native_${native.name!.name}`;
        return item;
    }

    /**
     * 创建函数接口补全项
     */
    private static createFunctionInterfaceItem(
        func: FunctionInterfaceDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<FunctionInterfaceDeclaration> {
        const item = new CustomCompletionItem<FunctionInterfaceDeclaration>(
            func.name!.name,
            vscode.CompletionItemKind.Interface,
            filePath,
            func
        );
        item.detail = 'Function Interface';
        const doc = CompletionExtractor.formatFunctionInterfaceSignature(func);
        const comment = CompletionExtractor.extractComment(func, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_func_interface_${func.name!.name}`;
        return item;
    }

    /**
     * 创建全局变量补全项
     */
    private static createGlobalVariableItem(
        stmt: VariableDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<VariableDeclaration> {
        const item = new CustomCompletionItem<VariableDeclaration>(
            stmt.name.name,
            vscode.CompletionItemKind.Variable,
            filePath,
            stmt
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
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `2_var_${stmt.name.name}`;
        return item;
    }

    /**
     * 创建类型补全项
     */
    private static createTypeItem(
        stmt: TypeDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<TypeDeclaration> {
        const item = new CustomCompletionItem<TypeDeclaration>(
            stmt.name!.name,
            vscode.CompletionItemKind.Class,
            filePath,
            stmt
        );
        item.detail = 'Type';
        const baseType = stmt.baseType ? ` extends ${stmt.baseType.toString()}` : '';
        const doc = `type ${stmt.name!.name}${baseType}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_type_${stmt.name!.name}`;
        return item;
    }

    /**
     * 创建结构体补全项
     */
    private static createStructItem(
        stmt: StructDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<StructDeclaration> {
        const item = new CustomCompletionItem<StructDeclaration>(
            stmt.name!.name,
            vscode.CompletionItemKind.Struct,
            filePath,
            stmt
        );
        item.detail = 'Struct';
        const extendsInfo = stmt.extendsType ? ` extends ${stmt.extendsType.toString()}` : '';
        const indexInfo = stmt.indexSize !== null ? `[${stmt.indexSize}]` : '';
        const arrayInfo = stmt.isArrayStruct ? ` extends array${stmt.arraySize !== null ? ` [${stmt.arraySize}]` : ''}` : '';
        const doc = `struct${indexInfo} ${stmt.name!.name}${extendsInfo}${arrayInfo}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_struct_${stmt.name!.name}`;
        return item;
    }

    /**
     * 创建接口补全项
     */
    private static createInterfaceItem(
        stmt: InterfaceDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<InterfaceDeclaration> {
        const item = new CustomCompletionItem<InterfaceDeclaration>(
            stmt.name!.name,
            vscode.CompletionItemKind.Interface,
            filePath,
            stmt
        );
        item.detail = 'Interface';
        const doc = `interface ${stmt.name!.name}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_interface_${stmt.name!.name}`;
        return item;
    }

    /**
     * 创建模块补全项
     */
    private static createModuleItem(
        stmt: ModuleDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<ModuleDeclaration> {
        const item = new CustomCompletionItem<ModuleDeclaration>(
            stmt.name!.name,
            vscode.CompletionItemKind.Module,
            filePath,
            stmt
        );
        item.detail = 'Module';
        const doc = `module ${stmt.name!.name}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_module_${stmt.name!.name}`;
        return item;
    }

    /**
     * 创建委托补全项
     */
    private static createDelegateItem(
        stmt: DelegateDeclaration,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<DelegateDeclaration> {
        const item = new CustomCompletionItem<DelegateDeclaration>(
            stmt.name!.name,
            vscode.CompletionItemKind.Event,
            filePath,
            stmt
        );
        item.detail = 'Delegate';
        const privateStr = stmt.isPrivate ? 'private ' : '';
        const doc = `${privateStr}delegate ${stmt.delegateType.toString()} ${stmt.name!.name}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.sortText = `1_delegate_${stmt.name!.name}`;
        return item;
    }

    /**
     * 创建 TextMacro 补全项
     */
    private static createTextMacroItem(
        stmt: TextMacroStatement,
        filePath: string,
        getFileContent: (filePath: string) => string | null,
        getRelativePath: (filePath: string) => string
    ): CustomCompletionItem<TextMacroStatement> {
        const item = new CustomCompletionItem<TextMacroStatement>(
            stmt.name,
            vscode.CompletionItemKind.Snippet,
            filePath,
            stmt
        );
        item.detail = 'TextMacro';
        const params = stmt.parameters.length > 0
            ? ` takes ${stmt.parameters.join(', ')}`
            : '';
        const doc = `textmacro ${stmt.name}${params}`;
        const comment = CompletionExtractor.extractComment(stmt, filePath, getFileContent);
        
        const documentation = new vscode.MarkdownString();
        documentation.appendCodeblock(doc, 'jass');
        if (comment) {
            documentation.appendMarkdown('\n\n---\n\n');
            documentation.appendMarkdown(comment);
        }
        documentation.appendMarkdown(`\n\n**_>:** \`${getRelativePath(filePath)}\``);
        
        item.documentation = documentation;
        item.insertText = stmt.name;
        item.sortText = `3_macro_${stmt.name}`;
        return item;
    }

    /**
     * 格式化函数签名
     */
    private static formatFunctionSignature(func: FunctionDeclaration): string {
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
    private static formatNativeSignature(native: NativeDeclaration): string {
        const name = native.name?.name || 'unknown';
        const constantStr = native.isConstant ? 'constant ' : '';
        const params = native.parameters
            .map(p => {
                const typeStr = p.type ? p.type.toString() : 'unknown';
                return `${typeStr} ${p.name.name}`;
            })
            .join(', ');
        const returnType = native.returnType ? native.returnType.toString() : 'nothing';
        return `${constantStr}native ${name} takes ${params || 'nothing'} returns ${returnType}`;
    }

    /**
     * 格式化函数接口签名
     */
    private static formatFunctionInterfaceSignature(func: FunctionInterfaceDeclaration): string {
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
     * 提取注释
     */
    private static extractComment(
        stmt: Statement,
        filePath: string,
        getFileContent: (filePath: string) => string | null
    ): string | null {
        if (!stmt.start) {
            return null;
        }

        const fileContent = getFileContent(filePath);
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

