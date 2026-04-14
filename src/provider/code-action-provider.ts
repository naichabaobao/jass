/**
 * 代码操作提供者
 * 提供多种快速修复功能：
 * - 接口方法未实现的自动生成
 * - 删除未使用的变量/函数
 * - 删除常量赋值操作
 * - 删除死代码
 * - 修复方法调用参数错误
 * - 添加库依赖
 */

import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import { 
    ASTNode,
    StructDeclaration, 
    InterfaceDeclaration, 
    MethodDeclaration,
    CallExpression,
    AssignmentStatement,
    FunctionDeclaration,
    NativeDeclaration,
    FunctionInterfaceDeclaration,
    TypeDeclaration,
    ModuleDeclaration,
    DelegateDeclaration,
    ScopeDeclaration,
    TextMacroStatement,
    Statement,
    Identifier,
    VariableDeclaration,
    ThistypeExpression,
    LibraryDeclaration
} from '../vjass/ast';
import { BlockStatement } from '../vjass/ast';
import {
    extractQuickFixIntents,
    normalizeDiagnosticCode,
    buildFixedCallLine,
    buildLibraryDeclarationWithRequires
} from './code-action-utils';
import { extractLeadingComments, parseComment } from './comment-parser';

export class CodeActionProvider implements vscode.CodeActionProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];
        const actionKeys = new Set<string>();

        // 检查诊断信息
        for (const diagnostic of context.diagnostics) {
            const message = diagnostic.message;
            const codeText = normalizeDiagnosticCode(diagnostic.code);
            const intents = extractQuickFixIntents(message, codeText);

            for (const intent of intents) {
                let action: vscode.CodeAction | null = null;
                if (intent.type === 'implement_interface_method') {
                    action = this.createImplementMethodAction(
                        document,
                        diagnostic,
                        intent.structName,
                        intent.methodName,
                        intent.interfaceName
                    );
                } else if (intent.type === 'remove_unused') {
                    action = this.createRemoveUnusedAction(document, diagnostic, intent.symbolName, intent.symbolType);
                } else if (intent.type === 'remove_constant_assignment') {
                    action = this.createRemoveConstantAssignmentAction(document, diagnostic);
                } else if (intent.type === 'remove_dead_code') {
                    action = this.createRemoveDeadCodeAction(document, diagnostic);
                } else if (intent.type === 'fix_param_count') {
                    action = this.createFixMethodCallParamsAction(document, diagnostic, intent.expected, intent.provided);
                } else if (intent.type === 'add_library_requires') {
                    action = this.createAddLibraryRequiresAction(document, diagnostic, intent.libraryName);
                }
                if (action) {
                    const key = `${action.title}|${action.kind?.value || ''}`;
                    if (!actionKeys.has(key)) {
                        actions.push(action);
                        actionKeys.add(key);
                    }
                }
            }
        }

        // 基于光标符号提供 @deprecated use XXX 一键替换（不依赖诊断）
        const replaceDeprecatedAction = this.createReplaceDeprecatedSymbolAction(document, range);
        if (replaceDeprecatedAction) {
            const key = `${replaceDeprecatedAction.title}|${replaceDeprecatedAction.kind?.value || ''}`;
            if (!actionKeys.has(key)) {
                actions.push(replaceDeprecatedAction);
                actionKeys.add(key);
            }
        }

        return actions;
    }

    private createReplaceDeprecatedSymbolAction(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction | null {
        const symbolInfo = this.getSymbolFromRange(document, range);
        if (!symbolInfo) {
            return null;
        }

        const filePath = document.uri.fsPath;
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        const fileContent = this.dataEnterManager.getFileContent(filePath);
        if (!blockStatement || !fileContent) {
            return null;
        }

        const replacement = this.findDeprecatedReplacementInStatements(blockStatement.body, fileContent, symbolInfo.symbolName);
        const finalReplacement = replacement || this.findDeprecatedReplacementAcrossWorkspace(symbolInfo.symbolName, filePath);
        if (!finalReplacement || finalReplacement.toLowerCase() === symbolInfo.symbolName.toLowerCase()) {
            return null;
        }

        const action = new vscode.CodeAction(
            `替换为 '${finalReplacement}'（deprecated）`,
            vscode.CodeActionKind.QuickFix
        );
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, symbolInfo.range, finalReplacement);
        action.edit = edit;
        action.isPreferred = true;
        return action;
    }

    private findDeprecatedReplacementAcrossWorkspace(symbolName: string, currentFilePath: string): string | null {
        const cachedFiles = this.dataEnterManager.getAllCachedFiles();
        const normalizedCurrent = currentFilePath.replace(/\\/g, '/').toLowerCase();
        for (const filePath of cachedFiles) {
            const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
            if (normalizedPath === normalizedCurrent) {
                continue;
            }
            const block = this.dataEnterManager.getBlockStatement(filePath);
            const content = this.dataEnterManager.getFileContent(filePath);
            if (!block || !content) {
                continue;
            }
            const replacement = this.findDeprecatedReplacementInStatements(block.body, content, symbolName);
            if (replacement) {
                return replacement;
            }
        }
        return null;
    }

    private getSymbolFromRange(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): { symbolName: string; range: vscode.Range } | null {
        const selectedText = document.getText(range).trim();
        if (/^[A-Za-z_]\w*$/.test(selectedText)) {
            return { symbolName: selectedText, range };
        }

        const wordRange = document.getWordRangeAtPosition(range.start, /\b[A-Za-z_]\w*\b/);
        if (!wordRange) {
            return null;
        }
        const symbolName = document.getText(wordRange);
        if (!symbolName) {
            return null;
        }
        return { symbolName, range: wordRange };
    }

    private findDeprecatedReplacementInStatements(
        statements: Statement[],
        fileContent: string,
        symbolName: string
    ): string | null {
        for (const stmt of statements) {
            const declaredName = this.getDeclaredName(stmt);
            if (declaredName && declaredName === symbolName && stmt.start) {
                const commentLines = extractLeadingComments(fileContent, stmt.start.line);
                if (commentLines.length > 0) {
                    const parsed = parseComment(commentLines);
                    if (parsed.deprecated && parsed.deprecatedReplacement) {
                        return parsed.deprecatedReplacement;
                    }
                }
            }

            // 递归进入容器语句
            const nestedStatements: Statement[] = [];
            if (stmt instanceof StructDeclaration || stmt instanceof InterfaceDeclaration || stmt instanceof ModuleDeclaration) {
                nestedStatements.push(...stmt.members);
            } else if (stmt instanceof LibraryDeclaration || stmt instanceof ScopeDeclaration) {
                nestedStatements.push(...stmt.members);
            } else if (stmt instanceof BlockStatement) {
                nestedStatements.push(...stmt.body);
            }

            if (nestedStatements.length > 0) {
                const nestedReplacement = this.findDeprecatedReplacementInStatements(nestedStatements, fileContent, symbolName);
                if (nestedReplacement) {
                    return nestedReplacement;
                }
            }
        }
        return null;
    }

    private getDeclaredName(stmt: Statement): string | null {
        if (stmt instanceof FunctionDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof NativeDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof FunctionInterfaceDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof VariableDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof TypeDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof StructDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof InterfaceDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof ModuleDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof DelegateDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof MethodDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof LibraryDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof ScopeDeclaration && stmt.name) return stmt.name.name;
        if (stmt instanceof TextMacroStatement && stmt.name) return stmt.name;
        return null;
    }

    /**
     * 创建实现方法的快速修复操作
     */
    private createImplementMethodAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        structName: string,
        methodName: string,
        interfaceName: string
    ): vscode.CodeAction | null {
        try {
            // 获取文件的 AST
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            
            if (!blockStatement) {
                return null;
            }

            // 查找接口定义
            const interfaceNode = this.findInterface(blockStatement.body, interfaceName);
            if (!interfaceNode) {
                return null;
            }

            // 查找接口中的方法定义
            const interfaceMethod = this.findMethodInInterface(interfaceNode, methodName);
            if (!interfaceMethod) {
                return null;
            }

            // 查找结构体定义
            const structNode = this.findStruct(blockStatement.body, structName);
            if (!structNode) {
                return null;
            }

            // 生成方法实现代码
            const methodCode = this.generateMethodCode(interfaceMethod, methodName);

            // 找到结构体的结束位置（在 endstruct 之前）
            const insertPosition = this.findStructInsertPosition(document, structNode);

            // 创建代码操作
            const action = new vscode.CodeAction(
                `实现接口方法 '${methodName}'`,
                vscode.CodeActionKind.QuickFix
            );

            action.edit = new vscode.WorkspaceEdit();
            action.edit.insert(document.uri, insertPosition, methodCode);
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating implement method action:', error);
            return null;
        }
    }

    /**
     * 在 AST 中查找接口定义
     */
    private findInterface(statements: any[], interfaceName: string): InterfaceDeclaration | null {
        for (const stmt of statements) {
            if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === interfaceName) {
                    return stmt;
                }
            }
            
            // 递归查找（可能在 library 中）
            if (stmt.members && Array.isArray(stmt.members)) {
                const found = this.findInterface(stmt.members, interfaceName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在接口中查找方法定义
     */
    private findMethodInInterface(interfaceNode: InterfaceDeclaration, methodName: string): MethodDeclaration | null {
        for (const member of interfaceNode.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === methodName) {
                    return member;
                }
            }
        }
        return null;
    }

    /**
     * 在 AST 中查找结构体定义
     */
    private findStruct(statements: any[], structName: string): StructDeclaration | null {
        for (const stmt of statements) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === structName) {
                    return stmt;
                }
            }
            
            // 递归查找（可能在 library 中）
            if (stmt.members && Array.isArray(stmt.members)) {
                const found = this.findStruct(stmt.members, structName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 生成方法实现代码
     */
    private generateMethodCode(method: MethodDeclaration, methodName: string): string {
        // 构建方法签名
        let code = '\tmethod ';
        
        if (method.isStatic) {
            code += 'static ';
        }
        
        code += methodName;
        
        // 参数
        if (method.parameters && method.parameters.length > 0) {
            const params = method.parameters.map(p => {
                let type = 'integer';
                if (p.type) {
                    if (p.type instanceof Identifier) {
                        type = p.type.name;
                    } else if (p.type instanceof ThistypeExpression) {
                        type = 'thistype';
                    }
                }
                const name = p.name ? p.name.name : 'param';
                return `${type} ${name}`;
            }).join(', ');
            code += ` takes ${params}`;
        } else {
            code += ' takes nothing';
        }
        
        // 返回值
        if (method.returnType) {
            if (method.returnType instanceof ThistypeExpression) {
                code += ' returns thistype';
            } else if (method.returnType instanceof Identifier) {
                code += ` returns ${method.returnType.name}`;
            }
        } else {
            code += ' returns nothing';
        }
        
        code += '\n';
        code += '\t\t// TODO: 实现方法逻辑\n';
        
        // 如果有返回值，添加 return 语句
        if (method.returnType) {
            if (method.returnType instanceof ThistypeExpression) {
                code += '\t\treturn this\n';
            } else if (method.returnType instanceof Identifier) {
                const returnType = method.returnType.name;
                if (returnType === 'integer') {
                    code += '\t\treturn 0\n';
                } else if (returnType === 'real') {
                    code += '\t\treturn 0.0\n';
                } else if (returnType === 'boolean') {
                    code += '\t\treturn false\n';
                } else if (returnType === 'string') {
                    code += '\t\treturn ""\n';
                } else {
                    code += '\t\treturn null\n';
                }
            }
        }
        
        code += '\tendmethod';
        
        return code;
    }

    /**
     * 查找结构体中插入方法的位置（在 endstruct 之前）
     */
    private findStructInsertPosition(document: vscode.TextDocument, structNode: StructDeclaration): vscode.Position {
        if (structNode.end) {
            // 在 endstruct 之前插入
            const line = structNode.end.line - 1; // endstruct 所在行（0-based，VSCode 使用 0-based）
            
            // 查找 endstruct 行
            if (line >= 0 && line < document.lineCount) {
                const lineText = document.lineAt(line).text;
                
                // 如果这一行是 endstruct，在其之前插入
                if (lineText.trim().toLowerCase() === 'endstruct') {
                    // 获取 struct 成员的缩进（查看第一个成员）
                    let indent = 0;
                    if (structNode.members && structNode.members.length > 0) {
                        const firstMember = structNode.members[0];
                        if (firstMember.start) {
                            const memberLine = document.lineAt(firstMember.start.line - 1);
                            indent = this.getIndent(memberLine.text);
                        }
                    }
                    // 在 endstruct 之前插入，使用相同的缩进
                    return new vscode.Position(line, indent);
                }
            }
            
            // 如果找不到 endstruct，尝试在结构体成员之后插入
            if (structNode.members && structNode.members.length > 0) {
                const lastMember = structNode.members[structNode.members.length - 1];
                if (lastMember.end) {
                    const lastLine = lastMember.end.line - 1; // 转换为 0-based
                    if (lastLine >= 0 && lastLine < document.lineCount) {
                        const lastLineText = document.lineAt(lastLine).text;
                        const indent = this.getIndent(lastLineText);
                        // 在最后一行之后插入，使用相同的缩进
                        return new vscode.Position(lastLine + 1, indent);
                    }
                }
            }
        }
        
        // 如果找不到合适的位置，返回结构体开始位置之后
        if (structNode.start) {
            const startLine = structNode.start.line; // 1-based
            if (startLine < document.lineCount) {
                return new vscode.Position(startLine, 1); // 在 struct 声明之后插入
            }
        }
        
        // 最后的回退：返回文档末尾
        return new vscode.Position(document.lineCount - 1, 0);
    }

    /**
     * 获取行的缩进
     */
    private getIndent(line: string): number {
        let indent = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '\t') {
                indent++;
            } else if (line[i] === ' ') {
                indent++;
            } else {
                break;
            }
        }
        return indent;
    }

    /**
     * 创建删除未使用变量/函数的代码操作
     */
    private createRemoveUnusedAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        symbolName: string,
        symbolType: string
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                `删除未使用的${symbolType} '${symbolName}'`,
                vscode.CodeActionKind.QuickFix
            );

            // 基于 AST 精确定位声明语句，避免按行删除误伤
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }
            const declarationNode = this.findDeclarationNodeByName(blockStatement, symbolName, document, diagnostic.range);
            if (!declarationNode) {
                return null;
            }
            const targetRange = this.getNodeRange(document, declarationNode, diagnostic.range);
            if (!targetRange) {
                return null;
            }

            const edit = new vscode.WorkspaceEdit();
            const deleteStart = new vscode.Position(targetRange.start.line, 0);
            const deleteEnd = new vscode.Position(
                Math.min(document.lineCount, targetRange.end.line + 1),
                0
            );
            edit.delete(document.uri, new vscode.Range(deleteStart, deleteEnd));
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 删除操作不是首选，需要用户确认

            return action;
        } catch (error) {
            console.error('Error creating remove unused action:', error);
            return null;
        }
    }

    /**
     * 创建删除常量赋值操作的代码操作
     */
    private createRemoveConstantAssignmentAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                '删除常量赋值操作',
                vscode.CodeActionKind.QuickFix
            );

            // 基于 AST 精确定位赋值节点，避免复杂表达式误删
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }
            const assignmentNode = this.findSmallestNodeCoveringRange(
                blockStatement,
                document,
                diagnostic.range,
                (node) => node instanceof AssignmentStatement
            );
            if (!assignmentNode) {
                return null;
            }
            const targetRange = this.getNodeRange(document, assignmentNode, diagnostic.range);
            if (!targetRange) {
                return null;
            }

            const edit = new vscode.WorkspaceEdit();
            const expandedRange = this.expandRangeToWholeLineIfLineOnly(document, targetRange);
            edit.delete(document.uri, expandedRange);
            action.edit = edit;
            
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating remove constant assignment action:', error);
            return null;
        }
    }

    /**
     * 创建删除死代码的代码操作
     */
    private createRemoveDeadCodeAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                '删除死代码',
                vscode.CodeActionKind.QuickFix
            );

            // 基于 AST 精确定位死代码语句节点
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }
            const deadNode = this.findSmallestNodeCoveringRange(blockStatement, document, diagnostic.range, (node) => node instanceof Statement);
            if (!deadNode) {
                return null;
            }
            const targetRange = this.getNodeRange(document, deadNode, diagnostic.range);
            if (!targetRange) {
                return null;
            }
            const edit = new vscode.WorkspaceEdit();
            edit.delete(document.uri, targetRange);
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 删除代码需要谨慎

            return action;
        } catch (error) {
            console.error('Error creating remove dead code action:', error);
            return null;
        }
    }

    /**
     * 创建修复方法调用参数错误的代码操作
     */
    private createFixMethodCallParamsAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        expected: number,
        provided: number
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                `修复方法调用参数（期望 ${expected} 个，当前 ${provided} 个）`,
                vscode.CodeActionKind.QuickFix
            );

            // 基于 AST 定位 CallExpression，只替换调用表达式本身
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                return null;
            }
            const callExprNode = this.findSmallestNodeCoveringRange(
                blockStatement,
                document,
                diagnostic.range,
                (node) => node instanceof CallExpression
            ) as CallExpression | null;
            if (!callExprNode) {
                return null;
            }
            const callExprRange = this.getNodeRange(document, callExprNode, diagnostic.range);
            if (!callExprRange) {
                return null;
            }
            const callText = document.getText(callExprRange);
            const fixedCallText = buildFixedCallLine(callText, expected, provided);
            if (!fixedCallText) {
                return null;
            }

            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, callExprRange, fixedCallText);
            
            action.edit = edit;
            action.diagnostics = [diagnostic];
            action.isPreferred = false; // 自动修复参数需要用户确认

            return action;
        } catch (error) {
            console.error('Error creating fix method call params action:', error);
            return null;
        }
    }

    /**
     * 创建添加库依赖的代码操作
     */
    private createAddLibraryRequiresAction(
        document: vscode.TextDocument,
        diagnostic: vscode.Diagnostic,
        libName: string
    ): vscode.CodeAction | null {
        try {
            const action = new vscode.CodeAction(
                `添加库依赖 '${libName}'`,
                vscode.CodeActionKind.QuickFix
            );

            // 查找 library 声明的位置
            const filePath = document.uri.fsPath;
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            
            if (!blockStatement) {
                return null;
            }

            // 基于诊断范围定位最近的 library 声明（AST 优先）
            let targetLibrary = this.findSmallestNodeCoveringRange(
                blockStatement,
                document,
                diagnostic.range,
                (node) => node instanceof LibraryDeclaration
            ) as LibraryDeclaration | null;
            // 回退：如果诊断不在 library 内，再用第一个 library 兜底
            if (!targetLibrary) {
                for (const stmt of blockStatement.body) {
                    if (stmt instanceof LibraryDeclaration) {
                        targetLibrary = stmt;
                        break;
                    }
                }
            }

            if (!targetLibrary || !targetLibrary.start) {
                return null;
            }

            // 在 library 声明后添加 requires
            const libraryRange = this.getNodeRange(document, targetLibrary, diagnostic.range);
            if (!libraryRange) {
                return null;
            }

            const line = document.lineAt(libraryRange.start.line);
            const lineText = line.text;
            
            // 检查是否已经有 requires
            const newLibraryLine = buildLibraryDeclarationWithRequires(lineText, libName);
            if (!newLibraryLine) {
                return null;
            }
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, line.range, newLibraryLine);
            action.edit = edit;
            
            action.diagnostics = [diagnostic];
            action.isPreferred = true;

            return action;
        } catch (error) {
            console.error('Error creating add library requires action:', error);
            return null;
        }
    }

    private findDeclarationNodeByName(
        root: ASTNode,
        symbolName: string,
        document: vscode.TextDocument,
        preferredRange?: vscode.Range
    ): ASTNode | null {
        return this.findSmallestNodeCoveringRange(
            root,
            document,
            preferredRange,
            (node) => {
                if (node instanceof VariableDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof FunctionDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof NativeDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof MethodDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof FunctionInterfaceDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof TypeDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof StructDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof InterfaceDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof ModuleDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof DelegateDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof LibraryDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof ScopeDeclaration && node.name?.name === symbolName) return true;
                if (node instanceof TextMacroStatement && node.name === symbolName) return true;
                return false;
            }
        );
    }

    private findSmallestNodeCoveringRange(
        root: ASTNode,
        document: vscode.TextDocument,
        preferredRange: vscode.Range | undefined,
        predicate: (node: ASTNode) => boolean
    ): ASTNode | null {
        let bestNode: ASTNode | null = null;
        let bestScore = Number.POSITIVE_INFINITY;

        const visit = (node: ASTNode): void => {
            const nodeRange = this.getNodeRange(document, node, preferredRange);
            if (nodeRange && (!preferredRange || nodeRange.intersection(preferredRange))) {
                if (predicate(node)) {
                    const score = this.rangeLength(nodeRange);
                    if (score < bestScore) {
                        bestNode = node;
                        bestScore = score;
                    }
                }
                const children = (node as any).children as ASTNode[] | undefined;
                if (children && children.length > 0) {
                    children.forEach(visit);
                }
            }
        };

        visit(root);
        return bestNode;
    }

    private rangeLength(range: vscode.Range): number {
        return (range.end.line - range.start.line) * 100000 + (range.end.character - range.start.character);
    }

    private getNodeRange(
        document: vscode.TextDocument,
        node: ASTNode,
        preferredRange?: vscode.Range
    ): vscode.Range | null {
        const start = (node as any).start as { line: number; position: number } | undefined;
        const end = (node as any).end as { line: number; position: number } | undefined;
        if (!start || !end) {
            return null;
        }

        const candidateStarts = [start.line, start.line - 1];
        const candidateEnds = [end.line, end.line - 1];
        const candidates: vscode.Range[] = [];

        for (const sLine of candidateStarts) {
            for (const eLine of candidateEnds) {
                if (sLine < 0 || eLine < 0 || sLine >= document.lineCount || eLine >= document.lineCount) {
                    continue;
                }
                const startChar = Math.max(0, start.position);
                const endChar = Math.max(0, end.position);
                const range = new vscode.Range(
                    new vscode.Position(sLine, startChar),
                    new vscode.Position(Math.max(sLine, eLine), endChar)
                );
                candidates.push(range);
            }
        }
        if (candidates.length === 0) {
            return null;
        }
        if (preferredRange) {
            const overlap = candidates.find(c => !!c.intersection(preferredRange));
            if (overlap) {
                return overlap;
            }
        }
        return candidates[0];
    }

    private expandRangeToWholeLineIfLineOnly(document: vscode.TextDocument, range: vscode.Range): vscode.Range {
        const lineText = document.lineAt(range.start.line).text;
        const prefix = lineText.slice(0, range.start.character).trim();
        const suffix = lineText.slice(range.end.character).trim();
        if (prefix.length === 0 && suffix.length === 0) {
            const endLine = Math.min(document.lineCount, range.end.line + 1);
            return new vscode.Range(
                new vscode.Position(range.start.line, 0),
                new vscode.Position(endLine, 0)
            );
        }
        return range;
    }
}

