import * as vscode from 'vscode';
import * as path from 'path';
import { DataEnterManager } from '../data-enter-manager';
import { InnerZincParser } from '../../vjass/inner-zinc-parser';
import {
    ZincProgram,
    ZincStatement,
    ZincLibraryDeclaration,
    ZincFunctionDeclaration,
    ZincVariableDeclaration,
    ZincStructDeclaration,
    ZincMethodDeclaration,
    ZincBlock,
    ZincParameter,
    ZincCallStatement,
    ZincAssignmentStatement
} from '../../vjass/zinc-ast';
import { CallExpression, Identifier, Expression } from '../../vjass/ast';

/**
 * Zinc Inlay Hints 提供者
 * 为 Zinc 代码显示类型提示
 */
export class ZincInlayHintsProvider implements vscode.InlayHintsProvider {
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

    provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.InlayHint[]> {
        const hints: vscode.InlayHint[] = [];
        const filePath = document.uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();

        // 只处理 .zn 文件
        if (ext !== '.zn') {
            return hints;
        }

        // 获取或解析 Zinc 程序
        const zincProgram = this.getZincProgram(filePath, document.getText());
        if (!zincProgram) {
            return hints;
        }

        // 遍历 AST 中的所有语句，提取表达式并生成类型提示
        this.extractHintsFromProgram(zincProgram, document, hints, filePath, range);

        return hints;
    }

    /**
     * 获取或解析 Zinc 程序
     */
    private getZincProgram(filePath: string, content: string): ZincProgram | null {
        // 先尝试从缓存获取
        if (this.zincProgramCache.has(filePath)) {
            return this.zincProgramCache.get(filePath)!;
        }

        // 尝试从 DataEnterManager 获取
        const program = this.dataEnterManager.getZincProgram(filePath);
        if (program) {
            this.zincProgramCache.set(filePath, program);
            return program;
        }

        // 如果都没有，尝试解析
        try {
            const parser = new InnerZincParser(content, filePath);
            const statements = parser.parse();
            const zincProgram = new ZincProgram(statements);
            this.zincProgramCache.set(filePath, zincProgram);
            return zincProgram;
        } catch (error) {
            console.error(`Failed to parse Zinc file ${filePath}:`, error);
            return null;
        }
    }

    /**
     * 从 ZincProgram 中提取所有表达式的类型提示
     */
    private extractHintsFromProgram(
        program: ZincProgram,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range: vscode.Range
    ): void {
        for (const stmt of program.declarations) {
            this.extractHintsFromStatement(stmt, document, hints, filePath, range);
        }
    }

    /**
     * 从语句中提取类型提示
     */
    private extractHintsFromStatement(
        stmt: ZincStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range: vscode.Range
    ): void {
        // 处理函数声明
        if (stmt instanceof ZincFunctionDeclaration) {
            if (stmt.body) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range);
            }
        }
        // 处理方法声明
        else if (stmt instanceof ZincMethodDeclaration) {
            if (stmt.body) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range);
            }
        }
        // 处理库声明
        else if (stmt instanceof ZincLibraryDeclaration) {
            if (stmt.body) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range);
            }
        }
        // 处理结构体声明
        else if (stmt instanceof ZincStructDeclaration) {
            if (stmt.members) {
                for (const member of stmt.members) {
                    if (member instanceof ZincMethodDeclaration && member.body) {
                        this.extractHintsFromBlock(member.body, document, hints, filePath, range);
                    }
                }
            }
        }
    }

    /**
     * 从 ZincBlock 中提取类型提示
     */
    private extractHintsFromBlock(
        block: ZincBlock,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range: vscode.Range
    ): void {
        for (const stmt of block.statements) {
            // 处理调用语句
            if (stmt instanceof ZincCallStatement) {
                this.processZincCallStatement(stmt, document, hints, filePath, range);
            }
            // 处理赋值语句
            else if (stmt instanceof ZincAssignmentStatement) {
                this.processZincAssignmentStatement(stmt, document, hints, filePath, range);
            }
            // 递归处理嵌套的块
            else if (stmt instanceof ZincBlock) {
                this.extractHintsFromBlock(stmt, document, hints, filePath, range);
            }
            // 递归处理其他语句
            else {
                this.extractHintsFromStatement(stmt, document, hints, filePath, range);
            }
        }
    }

    /**
     * 处理 Zinc 调用语句
     */
    private processZincCallStatement(
        callStmt: ZincCallStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range: vscode.Range
    ): void {
        // ZincCallStatement 包含一个 expression，应该是 CallExpression
        if (!callStmt.expression || !(callStmt.expression instanceof CallExpression)) {
            return;
        }

        const callExpr = callStmt.expression as CallExpression;
        
        // 获取函数名
        let functionName: string | null = null;
        if (callExpr.callee instanceof Identifier) {
            functionName = callExpr.callee.name;
        }
        if (!functionName) {
            return;
        }

        // 查找函数定义
        const funcDef = this.findZincFunctionDefinition(functionName, filePath);
        if (!funcDef) {
            return;
        }

        // 为每个参数添加类型提示
        if (funcDef.parameters && funcDef.parameters.length > 0 && callExpr.arguments && callExpr.arguments.length > 0) {
            for (let i = 0; i < Math.min(funcDef.parameters.length, callExpr.arguments.length); i++) {
                const arg = callExpr.arguments[i];
                const param = funcDef.parameters[i];
                if (param && param.type) {
                    // 获取参数表达式的结束位置
                    const pos = this.getZincExpressionEndPosition(arg, document, range);
                    if (pos) {
                        const paramType = this.getZincTypeName(param.type);
                        const paramName = param.name ? param.name.name : 'unknown';
                        const hint = new vscode.InlayHint(
                            pos,
                            `: ${paramType}`,
                            vscode.InlayHintKind.Parameter
                        );
                        // 添加 tooltip，显示函数名和参数名
                        hint.tooltip = new vscode.MarkdownString(`**${functionName}** 参数 \`${paramName}\`: \`${paramType}\``);
                        hints.push(hint);
                    }
                }
            }
        }
    }

    /**
     * 处理 Zinc 赋值语句
     */
    private processZincAssignmentStatement(
        assignment: ZincAssignmentStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range: vscode.Range
    ): void {
        // 获取赋值目标的类型
        let targetType: string | null = null;
        let varName: string = 'variable';
        
        if (assignment.target) {
            if (assignment.target instanceof Identifier) {
                varName = assignment.target.name;
                targetType = this.findZincVariableType(varName, filePath);
            } else {
                // 对于其他类型的表达式，尝试获取类型
                targetType = this.getZincExpressionType(assignment.target, filePath);
            }
        }

        // 如果目标类型存在，在赋值表达式后显示类型提示
        if (targetType && assignment.value) {
            const pos = this.getZincExpressionEndPosition(assignment.value, document, range);
            if (pos) {
                const hint = new vscode.InlayHint(
                    pos,
                    `: ${targetType}`,
                    vscode.InlayHintKind.Type
                );
                hint.tooltip = new vscode.MarkdownString(`变量 \`${varName}\` 类型: \`${targetType}\``);
                hints.push(hint);
            }
        }
    }

    /**
     * 获取 Zinc 表达式的结束位置
     */
    private getZincExpressionEndPosition(
        expr: any,
        document: vscode.TextDocument,
        range: vscode.Range
    ): vscode.Position | null {
        // 如果表达式有 end 位置信息
        if (expr && expr.end) {
            const line = expr.end.line;
            let character = expr.end.position || 0;

            // 确保位置在文档范围内
            if (line >= 0 && line < document.lineCount && line >= range.start.line && line <= range.end.line) {
                const lineText = document.lineAt(line).text;
                const char = Math.min(character, lineText.length);
                return new vscode.Position(line, char);
            }
        }

        return null;
    }

    /**
     * 查找 Zinc 函数定义
     */
    private findZincFunctionDefinition(
        functionName: string,
        currentFilePath: string
    ): { parameters: ZincParameter[]; returnType: any } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const zincProgram = this.dataEnterManager.getZincProgram(filePath);
            if (!zincProgram) {
                continue;
            }

            const func = this.findZincFunctionInProgram(zincProgram, functionName);
            if (func) {
                return {
                    parameters: func.parameters || [],
                    returnType: func.returnType
                };
            }
        }

        return null;
    }

    /**
     * 在 ZincProgram 中查找函数
     */
    private findZincFunctionInProgram(
        program: ZincProgram,
        functionName: string
    ): ZincFunctionDeclaration | ZincMethodDeclaration | null {
        for (const stmt of program.declarations) {
            if (stmt instanceof ZincFunctionDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    return stmt;
                }
            } else if (stmt instanceof ZincMethodDeclaration) {
                if (stmt.name && stmt.name.name === functionName) {
                    return stmt;
                }
            } else if (stmt instanceof ZincLibraryDeclaration) {
                if (stmt.body) {
                    for (const member of stmt.body.statements) {
                        if (member instanceof ZincFunctionDeclaration && member.name && member.name.name === functionName) {
                            return member;
                        } else if (member instanceof ZincMethodDeclaration && member.name && member.name.name === functionName) {
                            return member;
                        }
                    }
                }
            } else if (stmt instanceof ZincStructDeclaration) {
                if (stmt.members) {
                    for (const member of stmt.members) {
                        if (member instanceof ZincMethodDeclaration && member.name && member.name.name === functionName) {
                            return member;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 查找 Zinc 变量类型
     */
    private findZincVariableType(
        variableName: string,
        currentFilePath: string
    ): string | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const zincProgram = this.dataEnterManager.getZincProgram(filePath);
            if (!zincProgram) {
                continue;
            }

            const varDecl = this.findZincVariableInProgram(zincProgram, variableName);
            if (varDecl && varDecl.type) {
                return this.getZincTypeName(varDecl.type);
            }
        }

        return null;
    }

    /**
     * 在 ZincProgram 中查找变量声明
     */
    private findZincVariableInProgram(
        program: ZincProgram,
        variableName: string
    ): ZincVariableDeclaration | ZincParameter | null {
        for (const stmt of program.declarations) {
            if (stmt instanceof ZincVariableDeclaration) {
                if (stmt.name && stmt.name.name === variableName) {
                    return stmt;
                }
            } else if (stmt instanceof ZincFunctionDeclaration) {
                // 检查函数参数
                if (stmt.parameters) {
                    for (const param of stmt.parameters) {
                        if (param.name && param.name.name === variableName) {
                            return param;
                        }
                    }
                }
            } else if (stmt instanceof ZincMethodDeclaration) {
                // 检查方法参数
                if (stmt.parameters) {
                    for (const param of stmt.parameters) {
                        if (param.name && param.name.name === variableName) {
                            return param;
                        }
                    }
                }
            } else if (stmt instanceof ZincLibraryDeclaration) {
                if (stmt.body) {
                    for (const member of stmt.body.statements) {
                        if (member instanceof ZincVariableDeclaration && member.name && member.name.name === variableName) {
                            return member;
                        } else if (member instanceof ZincFunctionDeclaration) {
                            if (member.parameters) {
                                for (const param of member.parameters) {
                                    if (param.name && param.name.name === variableName) {
                                        return param;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (stmt instanceof ZincStructDeclaration) {
                if (stmt.members) {
                    for (const member of stmt.members) {
                        if (member instanceof ZincVariableDeclaration && member.name && member.name.name === variableName) {
                            return member;
                        } else if (member instanceof ZincMethodDeclaration) {
                            if (member.parameters) {
                                for (const param of member.parameters) {
                                    if (param.name && param.name.name === variableName) {
                                        return param;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 获取 Zinc 类型名称
     */
    private getZincTypeName(type: any): string {
        if (typeof type === 'string') {
            return type;
        }
        if (type && typeof type === 'object') {
            if (type.name) {
                return type.name;
            }
            if (type.toString) {
                return type.toString();
            }
        }
        return 'unknown';
    }

    /**
     * 获取 Zinc 表达式的类型
     */
    private getZincExpressionType(expr: Expression, filePath: string): string | null {
        // 如果是 CallExpression，查找函数定义
        if (expr instanceof CallExpression) {
            let functionName: string | null = null;
            if (expr.callee instanceof Identifier) {
                functionName = expr.callee.name;
            }
            if (functionName) {
                const funcDef = this.findZincFunctionDefinition(functionName, filePath);
                if (funcDef && funcDef.returnType) {
                    return this.getZincTypeName(funcDef.returnType);
                }
            }
        }

        // 如果是 Identifier，查找变量类型
        if (expr instanceof Identifier) {
            return this.findZincVariableType(expr.name, filePath);
        }

        return null;
    }
}

