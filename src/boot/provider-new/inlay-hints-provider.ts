import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter';
import {
    BlockStatement,
    Statement,
    Expression,
    FunctionDeclaration,
    NativeDeclaration,
    MethodDeclaration,
    StructDeclaration,
    CallExpression,
    CallStatement,
    AssignmentStatement,
    ReturnStatement,
    BinaryExpression,
    TypecastExpression,
    Identifier,
    VariableDeclaration
} from '../vjass/vjass-ast';

/**
 * Inlay Hints 提供者
 * 为所有表达式显示类型提示
 */
export class InlayHintsProvider implements vscode.InlayHintsProvider {
    private dataEnterManager: DataEnterManager;

    constructor(dataEnterManager: DataEnterManager) {
        this.dataEnterManager = dataEnterManager;
    }

    provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.InlayHint[]> {
        const hints: vscode.InlayHint[] = [];
        const filePath = document.uri.fsPath;

        // 获取当前文件的 AST
        let blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        
        // 如果文件还没有被解析，尝试解析
        if (!blockStatement) {
            const content = document.getText();
            if (content) {
                // 尝试同步获取（如果可能）
                blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            }
        }

        if (!blockStatement) {
            return hints;
        }

        // 遍历 AST 中的所有语句，提取表达式并生成类型提示
        this.extractHintsFromBlock(blockStatement, document, hints, filePath);

        return hints;
    }

    /**
     * 从 BlockStatement 中提取所有表达式的类型提示
     */
    private extractHintsFromBlock(
        block: BlockStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string
    ): void {
        for (const stmt of block.body) {
            // 处理 CallStatement（call 语句）
            if (stmt instanceof CallStatement) {
                this.processCallExpression(stmt.expression, document, hints, filePath);
            }
            // 处理 AssignmentStatement（set 语句）
            else if (stmt instanceof AssignmentStatement) {
                this.processAssignmentExpression(stmt, document, hints, filePath);
            }
            // 处理 ReturnStatement（return 语句）- 移除返回值类型提示（用户要求）
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.extractHintsFromBlock(stmt, document, hints, filePath);
            }
            // 处理函数声明中的表达式
            else if (stmt instanceof FunctionDeclaration) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath);
            }
            // 处理方法声明中的表达式
            else if (stmt instanceof MethodDeclaration) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath);
            }
            // 处理结构体声明
            else if (stmt instanceof StructDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof BlockStatement) {
                        this.extractHintsFromBlock(member, document, hints, filePath);
                    } else if (member instanceof MethodDeclaration) {
                        this.extractHintsFromBlock(member.body, document, hints, filePath);
                    }
                }
            }
        }
    }

    /**
     * 处理函数调用表达式
     */
    private processCallExpression(
        callExpr: CallExpression,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string
    ): void {
        // 获取函数名
        let functionName: string | null = null;
        if (callExpr.callee instanceof Identifier) {
            functionName = callExpr.callee.name;
        }

        if (!functionName) {
            return;
        }

        // 查找函数定义
        const funcDef = this.findFunctionDefinition(functionName, filePath);
        if (!funcDef) {
            return;
        }

        // 为每个参数添加类型提示
        if (funcDef.parameters.length > 0 && callExpr.arguments.length > 0) {
            for (let i = 0; i < Math.min(funcDef.parameters.length, callExpr.arguments.length); i++) {
                const arg = callExpr.arguments[i];
                const param = funcDef.parameters[i];
                if (param && param.type) {
                    // 获取参数表达式的结束位置
                    const pos = this.getExpressionEndPosition(arg, document);
                    if (pos) {
                        const hint = new vscode.InlayHint(
                            pos,
                            `: ${param.type}`,
                            vscode.InlayHintKind.Parameter
                        );
                        // 添加 tooltip，显示函数名和参数名
                        hint.tooltip = new vscode.MarkdownString(`**${functionName}** 参数 \`${param.name}\`: \`${param.type}\``);
                        hints.push(hint);
                    }
                }
            }
        }

        // 移除返回值类型提示（用户要求）
    }

    /**
     * 处理赋值表达式
     */
    private processAssignmentExpression(
        assignment: AssignmentStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string
    ): void {
        // 获取赋值目标的类型
        let targetType: string | null = null;
        if (assignment.target instanceof Identifier) {
            targetType = this.findVariableType(assignment.target.name, filePath);
        }

        // 获取赋值表达式的类型
        const valueType = this.getExpressionType(assignment.value, filePath);

        // 如果目标类型存在，在赋值表达式后显示类型提示
        if (targetType) {
            const pos = this.getExpressionEndPosition(assignment.value, document);
            if (pos) {
                const hint = new vscode.InlayHint(
                    pos,
                    `: ${targetType}`,
                    vscode.InlayHintKind.Type
                );
                // 获取变量名
                let varName = 'variable';
                if (assignment.target instanceof Identifier) {
                    varName = assignment.target.name;
                }
                hint.tooltip = new vscode.MarkdownString(`变量 \`${varName}\` 类型: \`${targetType}\``);
                hints.push(hint);
            }
        }
    }

    /**
     * 获取表达式的类型
     */
    private getExpressionType(expr: Expression, filePath: string): string | null {
        // 使用表达式的 getType 方法
        const type = expr.getType();
        if (type) {
            return type;
        }

        // 如果是 CallExpression，查找函数定义
        if (expr instanceof CallExpression) {
            let functionName: string | null = null;
            if (expr.callee instanceof Identifier) {
                functionName = expr.callee.name;
            }
            if (functionName) {
                const funcDef = this.findFunctionDefinition(functionName, filePath);
                if (funcDef && funcDef.returnType) {
                    return funcDef.returnType;
                }
            }
        }

        // 如果是 Identifier，查找变量类型
        if (expr instanceof Identifier) {
            return this.findVariableType(expr.name, filePath);
        }

        // 如果是 TypecastExpression，返回目标类型
        if (expr instanceof TypecastExpression) {
            return expr.targetType.name;
        }

        return null;
    }

    /**
     * 查找变量类型
     */
    private findVariableType(variableName: string, currentFilePath: string): string | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            const varDecl = this.findVariableInBlock(blockStatement, variableName);
            if (varDecl && varDecl.type) {
                return varDecl.type.toString();
            }
        }

        return null;
    }

    /**
     * 在 BlockStatement 中查找变量声明
     */
    private findVariableInBlock(
        block: BlockStatement,
        variableName: string
    ): VariableDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                if (stmt.name && stmt.name.name === variableName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findVariableInBlock(stmt, variableName);
                if (found) {
                    return found;
                }
            } else if (stmt instanceof FunctionDeclaration) {
                // 检查函数参数
                for (const param of stmt.parameters) {
                    if (param.name && param.name.name === variableName) {
                        return param;
                    }
                }
                // 递归查找函数体
                const found = this.findVariableInBlock(stmt.body, variableName);
                if (found) {
                    return found;
                }
            } else if (stmt instanceof MethodDeclaration) {
                // 检查方法参数
                for (const param of stmt.parameters) {
                    if (param.name && param.name.name === variableName) {
                        return param;
                    }
                }
                // 递归查找方法体
                const found = this.findVariableInBlock(stmt.body, variableName);
                if (found) {
                    return found;
                }
            } else if (stmt instanceof StructDeclaration) {
                // 查找结构体成员
                for (const member of stmt.members) {
                    if (member instanceof VariableDeclaration) {
                        if (member.name && member.name.name === variableName) {
                            return member;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 查找函数定义
     */
    private findFunctionDefinition(
        functionName: string,
        currentFilePath: string
    ): { parameters: Array<{ name: string; type: string }>; returnType: string | null } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            const func = this.findFunctionInBlock(blockStatement, functionName);
            if (func) {
                const parameters = func.parameters.map(p => ({
                    name: p.name.name,
                    type: p.type ? p.type.toString() : 'unknown'
                }));
                const returnType = func.returnType ? func.returnType.toString() : null;
                return { parameters, returnType };
            }
        }

        return null;
    }

    /**
     * 在 BlockStatement 中查找函数
     */
    private findFunctionInBlock(
        block: BlockStatement,
        functionName: string
    ): FunctionDeclaration | NativeDeclaration | MethodDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    return stmt;
                }
            } else if (stmt instanceof NativeDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findFunctionInBlock(stmt, functionName);
                if (found) {
                    return found;
                }
            } else if (stmt instanceof StructDeclaration) {
                // 查找结构体中的方法
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            return member;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 将表达式位置转换为 VSCode Position
     */
    private expressionToPosition(expr: Expression, document: vscode.TextDocument): vscode.Position | null {
        if (!expr.end) {
            return null;
        }

        // 使用表达式的结束位置
        const line = expr.end.line;
        const character = expr.end.position;

        // 确保位置在文档范围内
        if (line >= 0 && line < document.lineCount) {
            const lineText = document.lineAt(line).text;
            const char = Math.min(character, lineText.length);
            return new vscode.Position(line, char);
        }

        return null;
    }

    /**
     * 获取表达式结束位置（用于参数类型提示）
     * 确保位置在参数表达式的结束位置，而不是整个函数调用的结束位置
     */
    private getExpressionEndPosition(expr: Expression, document: vscode.TextDocument): vscode.Position | null {
        if (!expr.end) {
            return null;
        }

        // 使用表达式的结束位置
        const line = expr.end.line;
        let character = expr.end.position;

        // 确保位置在文档范围内
        if (line >= 0 && line < document.lineCount) {
            const lineText = document.lineAt(line).text;
            
            // 对于 CallExpression，需要找到右括号的位置
            if (expr instanceof CallExpression) {
                // 从表达式的 start 位置开始，查找匹配的右括号
                const startLine = expr.start?.line ?? line;
                const startChar = expr.start?.position ?? 0;
                
                // 如果 start 和 end 在同一行，从 start 开始查找右括号
                if (startLine === line) {
                    let parenLevel = 0;
                    let foundRightParen = false;
                    
                    // 从 start 位置开始查找
                    for (let i = startChar; i < lineText.length; i++) {
                        const char = lineText[i];
                        if (char === '(') {
                            parenLevel++;
                        } else if (char === ')') {
                            parenLevel--;
                            if (parenLevel === 0) {
                                // 找到匹配的右括号
                                character = i + 1;
                                foundRightParen = true;
                                break;
                            }
                        }
                    }
                    
                    // 如果没找到，使用原来的 end 位置
                    if (!foundRightParen) {
                        character = expr.end.position;
                    }
                } else {
                    // 跨行的情况，使用 end 位置
                    character = expr.end.position;
                }
            } else {
                // 对于非 CallExpression，直接使用 end 位置
                character = expr.end.position;
            }
            
            // 确保字符位置不超过行长度
            const char = Math.min(character, lineText.length);
            return new vscode.Position(line, char);
        }

        return null;
    }
}
