import * as vscode from 'vscode';
import { DataEnterManager } from './data-enter-manager';
import {
    BlockStatement,
    Statement,
    Expression,
    FunctionDeclaration,
    NativeDeclaration,
    MethodDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    CallExpression,
    CallStatement,
    AssignmentStatement,
    ReturnStatement,
    IfStatement,
    ExitWhenStatement,
    LoopStatement,
    BinaryExpression,
    TypecastExpression,
    FunctionExpression,
    Identifier,
    VariableDeclaration,
    ThistypeExpression,
    SuperExpression
} from '../vjass/ast';
import { OperatorType } from '../vjass/ast';

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

        // 检查取消令牌
        if (token.isCancellationRequested) {
            return hints;
        }

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
        // 只处理在 range 范围内的语句，以提高性能
        this.extractHintsFromBlock(blockStatement, document, hints, filePath, range, token);

        return hints;
    }

    /**
     * 从 BlockStatement 中提取所有表达式的类型提示
     */
    private extractHintsFromBlock(
        block: BlockStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range?: vscode.Range,
        token?: vscode.CancellationToken
    ): void {
        // 检查取消令牌
        if (token?.isCancellationRequested) {
            return;
        }

        if (!block || !block.body) {
            return;
        }
        for (const stmt of block.body) {
            // 检查取消令牌
            if (token?.isCancellationRequested) {
                return;
            }

            // 如果提供了 range，检查语句是否在范围内
            if (range && stmt.start && stmt.end) {
                const stmtStart = new vscode.Position(stmt.start.line, stmt.start.position);
                const stmtEnd = new vscode.Position(stmt.end.line, stmt.end.position);
                // 如果语句完全在范围之外，跳过（但允许部分重叠，因为可能包含可见的调用）
                if (stmtEnd.line < range.start.line || stmtStart.line > range.end.line) {
                    continue;
                }
            }

            // 处理 CallStatement（call 语句）
            if (stmt instanceof CallStatement) {
                this.processCallExpression(stmt.expression, document, hints, filePath, range);
            }
            // 处理 AssignmentStatement（set 语句）
            else if (stmt instanceof AssignmentStatement) {
                this.processAssignmentExpression(stmt, document, hints, filePath, range, token);
            }
            // 处理 ReturnStatement（return 语句）
            else if (stmt instanceof ReturnStatement) {
                if (stmt.argument) {
                    // 处理 return 表达式中的调用
                    this.processExpression(stmt.argument, document, hints, filePath, range, token);
                }
            }
            // 处理 ExitWhenStatement（exitwhen 语句）
            else if (stmt instanceof ExitWhenStatement) {
                // 处理 exitwhen 条件中的调用
                this.processExpression(stmt.condition, document, hints, filePath, range, token);
            }
            // 处理 IfStatement（if/elseif 语句）
            else if (stmt instanceof IfStatement) {
                // 处理 if 条件中的调用
                this.processExpression(stmt.condition, document, hints, filePath, range, token);
                // 递归处理 then 分支
                if (stmt.consequent instanceof BlockStatement) {
                    this.extractHintsFromBlock(stmt.consequent, document, hints, filePath, range, token);
                } else {
                    // consequent 可能是单个语句，需要处理其中的表达式
                    this.processStatement(stmt.consequent, document, hints, filePath, range, token);
                }
                // 递归处理 else/elseif 分支
                if (stmt.alternate) {
                    if (stmt.alternate instanceof BlockStatement) {
                        this.extractHintsFromBlock(stmt.alternate, document, hints, filePath, range, token);
                    } else if (stmt.alternate instanceof IfStatement) {
                        // elseif 分支，递归处理
                        this.processStatement(stmt.alternate, document, hints, filePath, range, token);
                    }
                }
            }
            // 处理 LoopStatement（loop 语句）
            else if (stmt instanceof LoopStatement) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range, token);
            }
            // 处理 VariableDeclaration（local 变量声明）
            else if (stmt instanceof VariableDeclaration) {
                if (stmt.initializer) {
                    // 处理 local 变量初始化表达式中的调用
                    this.processExpression(stmt.initializer, document, hints, filePath, range, token);
                }
            }
            // 递归处理嵌套的 BlockStatement
            else if (stmt instanceof BlockStatement) {
                this.extractHintsFromBlock(stmt, document, hints, filePath, range, token);
            }
            // 处理函数声明中的表达式
            else if (stmt instanceof FunctionDeclaration) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range, token);
            }
            // 处理方法声明中的表达式
            else if (stmt instanceof MethodDeclaration) {
                this.extractHintsFromBlock(stmt.body, document, hints, filePath, range, token);
            }
            // 处理结构体声明
            else if (stmt instanceof StructDeclaration) {
                for (const member of stmt.members) {
                    if (member instanceof BlockStatement) {
                        this.extractHintsFromBlock(member, document, hints, filePath, range, token);
                    } else if (member instanceof MethodDeclaration) {
                        this.extractHintsFromBlock(member.body, document, hints, filePath, range, token);
                    }
                }
            }
            // 处理 scope/library：递归其 members，否则内部的 call 等不会产生 hint
            else if (stmt instanceof ScopeDeclaration) {
                this.extractHintsFromBlock(new BlockStatement(stmt.members), document, hints, filePath, range, token);
            }
            else if (stmt instanceof LibraryDeclaration) {
                this.extractHintsFromBlock(new BlockStatement(stmt.members), document, hints, filePath, range, token);
            }
            // 处理其他语句（可能包含表达式）
            else {
                this.processStatement(stmt, document, hints, filePath, range, token);
            }
        }
    }

    /**
     * 处理语句，提取其中的表达式
     */
    private processStatement(
        stmt: Statement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range?: vscode.Range,
        token?: vscode.CancellationToken
    ): void {
        if (token?.isCancellationRequested) {
            return;
        }
        // 递归处理语句中的表达式
        if (stmt instanceof IfStatement) {
            this.processExpression(stmt.condition, document, hints, filePath, range, token);
            if (stmt.consequent instanceof BlockStatement) {
                this.extractHintsFromBlock(stmt.consequent, document, hints, filePath, range, token);
            } else {
                this.processStatement(stmt.consequent, document, hints, filePath, range, token);
            }
            if (stmt.alternate) {
                if (stmt.alternate instanceof BlockStatement) {
                    this.extractHintsFromBlock(stmt.alternate, document, hints, filePath, range, token);
                } else if (stmt.alternate instanceof IfStatement) {
                    this.processStatement(stmt.alternate, document, hints, filePath, range, token);
                }
            }
        } else if (stmt instanceof ExitWhenStatement) {
            this.processExpression(stmt.condition, document, hints, filePath, range, token);
        } else if (stmt instanceof ReturnStatement) {
            if (stmt.argument) {
                this.processExpression(stmt.argument, document, hints, filePath, range, token);
            }
        } else if (stmt instanceof AssignmentStatement) {
            this.processAssignmentExpression(stmt, document, hints, filePath, range, token);
        } else if (stmt instanceof CallStatement) {
            this.processCallExpression(stmt.expression, document, hints, filePath, range);
        } else if (stmt instanceof VariableDeclaration) {
            if (stmt.initializer) {
                this.processExpression(stmt.initializer, document, hints, filePath, range, token);
            }
        } else if (stmt instanceof LoopStatement) {
            this.extractHintsFromBlock(stmt.body, document, hints, filePath, range, token);
        }
    }

    /**
     * 递归处理表达式，提取其中的所有调用表达式
     */
    private processExpression(
        expr: Expression,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range?: vscode.Range,
        token?: vscode.CancellationToken
    ): void {
        if (token?.isCancellationRequested) {
            return;
        }

        // 如果是调用表达式，处理它
        if (expr instanceof CallExpression) {
            this.processCallExpression(expr, document, hints, filePath, range);
        }
        // 如果是二元表达式，递归处理左右操作数
        else if (expr instanceof BinaryExpression) {
            // 处理左操作数
            this.processExpression(expr.left, document, hints, filePath, range, token);
            // 处理右操作数
            this.processExpression(expr.right, document, hints, filePath, range, token);
        }
        // 如果是类型转换表达式，递归处理内部表达式
        else if (expr instanceof TypecastExpression) {
            if (expr.expression) {
                this.processExpression(expr.expression, document, hints, filePath, range, token);
            }
        }
        // FunctionExpression 只是一个函数名引用，不包含可调用的表达式
        // 不需要处理
    }

    /**
     * 处理函数调用表达式
     */
    private processCallExpression(
        callExpr: CallExpression,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range?: vscode.Range
    ): void {
        // 如果提供了 range，检查调用是否在范围内
        if (range && callExpr.start && callExpr.end) {
            const callStart = new vscode.Position(callExpr.start.line, callExpr.start.position);
            const callEnd = new vscode.Position(callExpr.end.line, callExpr.end.position);
            // 如果调用完全在范围之外，跳过
            if (callEnd.line < range.start.line || callStart.line > range.end.line) {
                return;
            }
        }
        // 获取调用位置，用于查找上下文
        const callPosition = callExpr.start 
            ? new vscode.Position(callExpr.start.line, callExpr.start.position)
            : new vscode.Position(0, 0);

        // 检查是否是方法调用（b.test() 形式）
        if (callExpr.callee instanceof BinaryExpression && 
            callExpr.callee.operator === OperatorType.Dot) {
            // 处理方法调用
            this.processMethodCall(callExpr, document, hints, filePath, callPosition, range);
            return;
        }

        // 处理普通函数调用
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
                
                // 如果参数是嵌套的调用表达式，先递归处理它
                if (arg instanceof CallExpression) {
                    this.processCallExpression(arg, document, hints, filePath, range);
                }
                
                if (param && param.type) {
                    // 获取参数表达式的结束位置
                    const pos = this.getExpressionEndPosition(arg, document);
                    if (pos && this.isPositionInRange(pos, range)) {
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
     * 处理方法调用（如 b.test()、func.evaluate()、method.execute() 等）
     */
    private processMethodCall(
        callExpr: CallExpression,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        position: vscode.Position,
        range?: vscode.Range
    ): void {
        const callee = callExpr.callee as BinaryExpression;
        const left = callee.left;
        const right = callee.right;

        // 获取方法名
        let methodName: string | null = null;
        if (right instanceof Identifier) {
            methodName = right.name;
        } else {
            return;
        }

        if (!methodName) {
            return;
        }

        // 获取对象类型
        let objectType: string | null = null;
        let isFunctionObject = false;
        let isMethodObject = false;
        let functionName: string | null = null;
        
        if (left instanceof Identifier) {
            // 先尝试查找变量类型（可能是 struct 实例、函数接口变量等）
            objectType = this.findVariableTypeInContext(left.name, filePath, position);
            
            // 如果找不到变量类型，可能是函数对象（func.evaluate()）
            if (!objectType) {
                const funcDef = this.findFunctionDefinition(left.name, filePath);
                if (funcDef) {
                    isFunctionObject = true;
                    functionName = left.name;
                }
            }
        } else if (left instanceof ThistypeExpression || 
                   (left instanceof Identifier && (left.name === 'this' || left.name === ''))) {
            // this.method() 或 .method()，查找包含当前位置的 struct
            const structDecl = this.findContainingStruct(filePath, position);
            if (structDecl && structDecl.name) {
                objectType = structDecl.name.name;
            }
        } else if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
            // 可能是方法对象调用（如 b.method.evaluate() 或 StructName.staticMethod.execute()）
            // 这种情况下，left 是方法访问（如 b.method），right 是 evaluate/execute
            // 我们需要找到原始方法的定义，然后使用其参数
            const methodLeft = left.left;
            const methodRight = left.right;
            
            if (methodRight instanceof Identifier && (methodName === 'evaluate' || methodName === 'execute')) {
                const originalMethodName = methodRight.name;
                
                // 检查是否是静态方法调用（StructName.staticMethod.evaluate()）
                if (methodLeft instanceof Identifier) {
                    const structDef = this.findStructByNameGlobally(methodLeft.name);
                    if (structDef) {
                        // 查找静态方法定义
                        const originalMethodDef = this.findMethodDefinition(methodLeft.name, originalMethodName, filePath);
                        if (originalMethodDef) {
                            // 使用方法对象的 evaluate/execute，参数就是原方法的参数
                            isMethodObject = true;
                            objectType = methodLeft.name;
                            // 注意：这里我们使用原方法的参数，但 methodName 仍然是 evaluate/execute
                            // 我们需要保存原方法名以便后续使用
                            // 暂时使用原方法的参数定义
                            const methodDef = originalMethodDef;
                            
                            // 为方法对象的 evaluate/execute 方法添加参数提示
                            if (methodDef.parameters.length > 0 && callExpr.arguments.length > 0) {
                                for (let i = 0; i < Math.min(methodDef.parameters.length, callExpr.arguments.length); i++) {
                                    const arg = callExpr.arguments[i];
                                    const param = methodDef.parameters[i];
                                    
                                    if (arg instanceof CallExpression) {
                                        this.processCallExpression(arg, document, hints, filePath, range);
                                    }
                                    
                                    if (param && param.type) {
                                        const pos = this.getExpressionEndPosition(arg, document);
                                        if (pos && this.isPositionInRange(pos, range)) {
                                            const hint = new vscode.InlayHint(
                                                pos,
                                                `: ${param.type}`,
                                                vscode.InlayHintKind.Parameter
                                            );
                                            hint.tooltip = new vscode.MarkdownString(`**${methodLeft.name}.${originalMethodName}.${methodName}** 参数 \`${param.name}\`: \`${param.type}\``);
                                            hints.push(hint);
                                        }
                                    }
                                }
                            }
                            return;
                        }
                    }
                } else if (methodLeft instanceof Identifier) {
                    // 可能是实例方法调用（b.method.evaluate()）
                    const varType = this.findVariableTypeInContext(methodLeft.name, filePath, position);
                    if (varType) {
                        // 查找实例方法定义
                        const originalMethodDef = this.findMethodDefinition(varType, originalMethodName, filePath);
                        if (originalMethodDef) {
                            // 使用方法对象的 evaluate/execute，参数就是原方法的参数
                            isMethodObject = true;
                            objectType = varType;
                            const methodDef = originalMethodDef;
                            
                            // 为方法对象的 evaluate/execute 方法添加参数提示
                            if (methodDef.parameters.length > 0 && callExpr.arguments.length > 0) {
                                for (let i = 0; i < Math.min(methodDef.parameters.length, callExpr.arguments.length); i++) {
                                    const arg = callExpr.arguments[i];
                                    const param = methodDef.parameters[i];
                                    
                                    if (arg instanceof CallExpression) {
                                        this.processCallExpression(arg, document, hints, filePath, range);
                                    }
                                    
                                    if (param && param.type) {
                                        const pos = this.getExpressionEndPosition(arg, document);
                                        if (pos && this.isPositionInRange(pos, range)) {
                                            const hint = new vscode.InlayHint(
                                                pos,
                                                `: ${param.type}`,
                                                vscode.InlayHintKind.Parameter
                                            );
                                            hint.tooltip = new vscode.MarkdownString(`**${methodLeft.name}.${originalMethodName}.${methodName}** 参数 \`${param.name}\`: \`${param.type}\``);
                                            hints.push(hint);
                                        }
                                    }
                                }
                            }
                            return;
                        }
                    }
                }
            }
        }

        // 处理函数对象的方法调用（func.evaluate(), func.execute()）
        if (isFunctionObject && functionName && (methodName === 'evaluate' || methodName === 'execute')) {
            const funcDef = this.findFunctionDefinition(functionName, filePath);
            if (funcDef) {
                // 为函数对象的 evaluate/execute 方法添加参数提示
                if (funcDef.parameters.length > 0 && callExpr.arguments.length > 0) {
                    for (let i = 0; i < Math.min(funcDef.parameters.length, callExpr.arguments.length); i++) {
                        const arg = callExpr.arguments[i];
                        const param = funcDef.parameters[i];
                        
                        // 如果参数是嵌套的调用表达式，先递归处理它
                        if (arg instanceof CallExpression) {
                            this.processCallExpression(arg, document, hints, filePath);
                        }
                        
                                if (param && param.type) {
                                    const pos = this.getExpressionEndPosition(arg, document);
                                    if (pos && this.isPositionInRange(pos, range)) {
                                        const hint = new vscode.InlayHint(
                                            pos,
                                            `: ${param.type}`,
                                            vscode.InlayHintKind.Parameter
                                        );
                                        hint.tooltip = new vscode.MarkdownString(`**${functionName}.${methodName}** 参数 \`${param.name}\`: \`${param.type}\``);
                                        hints.push(hint);
                                    }
                                }
                    }
                }
            }
            return;
        }

        // 处理方法对象的方法调用（method.evaluate(), method.execute()）
        if (isMethodObject && objectType && (methodName === 'evaluate' || methodName === 'execute')) {
            // 这里需要找到原始方法定义（不是 evaluate/execute，而是被调用的方法）
            // 由于我们已经在上面的逻辑中找到了方法，这里需要重新获取
            // 实际上，对于方法对象，evaluate/execute 的参数就是原方法的参数
            // 但我们需要从 left 中提取原始方法信息
            // 这个逻辑比较复杂，暂时跳过，因为方法对象的 evaluate/execute 调用较少见
            return;
        }

        // 如果找不到对象类型，无法处理方法调用
        if (!objectType) {
            return;
        }

        // 查找方法定义
        const methodDef = this.findMethodDefinition(objectType, methodName, filePath);
        if (!methodDef) {
            return;
        }

        // 为每个参数添加类型提示
        if (methodDef.parameters.length > 0 && callExpr.arguments.length > 0) {
            for (let i = 0; i < Math.min(methodDef.parameters.length, callExpr.arguments.length); i++) {
                const arg = callExpr.arguments[i];
                const param = methodDef.parameters[i];
                
                // 如果参数是嵌套的调用表达式，先递归处理它
                if (arg instanceof CallExpression) {
                    this.processCallExpression(arg, document, hints, filePath);
                }
                
                if (param && param.type) {
                    // 获取参数表达式的结束位置
                    const pos = this.getExpressionEndPosition(arg, document);
                    if (pos) {
                        const hint = new vscode.InlayHint(
                            pos,
                            `: ${param.type}`,
                            vscode.InlayHintKind.Parameter
                        );
                        // 添加 tooltip，显示方法名和参数名
                        hint.tooltip = new vscode.MarkdownString(`**${objectType}.${methodName}** 参数 \`${param.name}\`: \`${param.type}\``);
                        hints.push(hint);
                    }
                }
            }
        }
    }

    /**
     * 处理赋值表达式
     */
    private processAssignmentExpression(
        assignment: AssignmentStatement,
        document: vscode.TextDocument,
        hints: vscode.InlayHint[],
        filePath: string,
        range?: vscode.Range,
        token?: vscode.CancellationToken
    ): void {
        if (token?.isCancellationRequested) {
            return;
        }
        // 获取赋值目标的类型
        let targetType: string | null = null;
        let varName = 'variable';
        
        // 获取赋值语句的位置，用于查找包含的函数/方法
        const assignmentPosition = assignment.start 
            ? new vscode.Position(assignment.start.line, assignment.start.position)
            : new vscode.Position(0, 0);

        // 处理不同类型的赋值目标
        if (assignment.target instanceof Identifier) {
            // 简单变量：set a = 12
            varName = assignment.target.name;
            targetType = this.findVariableTypeInContext(
                varName, 
                filePath, 
                assignmentPosition
            );
        } else if (assignment.target instanceof BinaryExpression && 
                   assignment.target.operator === OperatorType.Dot) {
            // 成员访问：set b.a = 12 或 set this.a = 12 或 set .a = 12
            const memberType = this.findMemberAccessType(
                assignment.target,
                filePath,
                assignmentPosition
            );
            if (memberType) {
                targetType = memberType.type;
                varName = memberType.memberName;
            }
        } else if (assignment.target instanceof BinaryExpression && 
                   assignment.target.operator === OperatorType.Index) {
            // 数组访问：set arr[i] = value（TODO: 若有“数组 of T”类型信息，可在此显示元素类型）
            // 处理数组下标中的调用
            this.processExpression(assignment.target.right, document, hints, filePath, range, token);
            // 处理数组名中的调用（虽然不太可能，但为了完整性）
            this.processExpression(assignment.target.left, document, hints, filePath, range, token);
        }

        // 处理赋值表达式中的调用（value 部分）
        this.processExpression(assignment.value, document, hints, filePath, range, token);

        if (token?.isCancellationRequested) {
            return;
        }
        // 如果目标类型存在，在赋值目标后显示类型提示
        if (targetType) {
            const pos = this.getExpressionEndPosition(assignment.target, document);
            if (pos && this.isPositionInRange(pos, range)) {
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
     * 查找变量类型（按照 local -> takes -> globals 的顺序）
     */
    private findVariableTypeInContext(
        variableName: string, 
        currentFilePath: string,
        position: vscode.Position
    ): string | null {
        const blockStatement = this.dataEnterManager.getBlockStatement(currentFilePath);
        if (!blockStatement) {
            return null;
        }

        // 1. 先查找 local 变量
        const containingFunc = this.findContainingFunction(blockStatement, position);
        const containingMethod = this.findContainingMethod(blockStatement, position);
        
        if (containingFunc) {
            // 在函数体内查找局部变量
            const localVar = this.findLocalVariableInBlock(containingFunc.body, variableName, position);
            if (localVar && localVar.type) {
                return localVar.type.toString();
            }
        }
        
        if (containingMethod) {
            // 在方法体内查找局部变量
            const localVar = this.findLocalVariableInBlock(containingMethod.body, variableName, position);
            if (localVar && localVar.type) {
                return localVar.type.toString();
            }
        }

        // 2. 然后查找 takes 参数
        if (containingFunc) {
            for (const param of containingFunc.parameters) {
                if (param.name && param.name.name === variableName && param.type) {
                    return param.type.toString();
                }
            }
        }
        
        if (containingMethod) {
            for (const param of containingMethod.parameters) {
                if (param.name && param.name.name === variableName && param.type) {
                    return param.type.toString();
                }
            }
        }

        // 3. 最后查找 globals 变量
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();
        for (const filePath of allCachedFiles) {
            const fileBlock = this.dataEnterManager.getBlockStatement(filePath);
            if (!fileBlock) {
                continue;
            }
            
            const globalVar = this.findGlobalVariableInBlock(fileBlock, variableName);
            if (globalVar && globalVar.type) {
                return globalVar.type.toString();
            }
        }

        return null;
    }

    /**
     * 查找变量类型（兼容旧接口，用于其他场景）
     */
    private findVariableType(variableName: string, currentFilePath: string): string | null {
        // 使用默认位置（0,0）进行查找
        return this.findVariableTypeInContext(variableName, currentFilePath, new vscode.Position(0, 0));
    }

    /**
     * 查找包含指定位置的函数声明
     */
    private findContainingFunction(
        block: BlockStatement,
        position: vscode.Position
    ): FunctionDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof FunctionDeclaration) {
                if (stmt.start && stmt.end) {
                    const funcStartLine = stmt.start.line;
                    const funcEndLine = stmt.end.line;
                    if (position.line >= funcStartLine && position.line <= funcEndLine + 1) {
                        return stmt;
                    }
                } else if (stmt.body && this.isPositionInAstRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const nestedFunc = this.findContainingFunction(stmt, position);
                if (nestedFunc) {
                    return nestedFunc;
                }
            } else if (stmt instanceof ScopeDeclaration || stmt instanceof LibraryDeclaration) {
                const nestedFunc = this.findContainingFunction(new BlockStatement(stmt.members), position);
                if (nestedFunc) {
                    return nestedFunc;
                }
            }
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
        for (const stmt of block.body) {
            if (stmt instanceof MethodDeclaration) {
                if (stmt.start && stmt.end) {
                    const methodStartLine = stmt.start.line;
                    const methodEndLine = stmt.end.line;
                    if (position.line >= methodStartLine && position.line <= methodEndLine + 1) {
                        return stmt;
                    }
                } else if (stmt.body && this.isPositionInAstRange(position, stmt.body.start, stmt.body.end)) {
                    return stmt;
                }
            } else if (stmt instanceof StructDeclaration) {
                // 在结构体成员中查找方法
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.start && member.end) {
                            const methodStartLine = member.start.line;
                            const methodEndLine = member.end.line;
                            if (position.line >= methodStartLine && position.line <= methodEndLine + 1) {
                                return member;
                            }
                        } else if (member.body && this.isPositionInAstRange(position, member.body.start, member.body.end)) {
                            return member;
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const nestedMethod = this.findContainingMethod(stmt, position);
                if (nestedMethod) {
                    return nestedMethod;
                }
            } else if (stmt instanceof ScopeDeclaration || stmt instanceof LibraryDeclaration) {
                const nestedMethod = this.findContainingMethod(new BlockStatement(stmt.members), position);
                if (nestedMethod) {
                    return nestedMethod;
                }
            }
        }
        return null;
    }

    /**
     * 检查位置是否在范围内
     */
    /**
     * 检查位置是否在范围内（用于 hint 位置验证）
     */
    private isPositionInRange(
        position: vscode.Position,
        range?: vscode.Range
    ): boolean {
        // 如果没有提供 range，认为位置在范围内（向后兼容）
        if (!range) {
            return true;
        }
        // 检查位置是否在 range 内
        return position.isAfterOrEqual(range.start) && position.isBeforeOrEqual(range.end);
    }

    /**
     * 检查位置是否在 AST 节点范围内（用于查找包含位置的函数/方法）
     */
    private isPositionInAstRange(
        position: vscode.Position,
        start: { line: number, position: number },
        end: { line: number, position: number }
    ): boolean {
        if (position.line < start.line || position.line > end.line) {
            return false;
        }
        if (position.line === start.line && position.character < start.position) {
            return false;
        }
        if (position.line === end.line && position.character > end.position) {
            return false;
        }
        return true;
    }

    /**
     * 在 BlockStatement 中查找局部变量（local 声明）
     * 只查找在指定位置之前声明的变量
     */
    private findLocalVariableInBlock(
        block: BlockStatement,
        variableName: string,
        position: vscode.Position
    ): VariableDeclaration | null {
        for (const stmt of block.body) {
            // 如果语句在位置之后，跳过
            if (stmt.start && stmt.start.line > position.line) {
                continue;
            }
            if (stmt.start && stmt.start.line === position.line && stmt.start.position > position.character) {
                continue;
            }

            if (stmt instanceof VariableDeclaration) {
                if (stmt.isLocal && stmt.name && stmt.name.name === variableName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findLocalVariableInBlock(stmt, variableName, position);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在 BlockStatement 中查找全局变量（globals 块中的变量）
     */
    private findGlobalVariableInBlock(
        block: BlockStatement,
        variableName: string
    ): VariableDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration) {
                // 全局变量不是 local
                if (!stmt.isLocal && stmt.name && stmt.name.name === variableName) {
                    return stmt;
                }
            } else if (stmt instanceof LibraryDeclaration) {
                // 查找 library 中的全局变量
                for (const member of stmt.members) {
                    if (member instanceof VariableDeclaration) {
                        if (!member.isLocal && member.name && member.name.name === variableName) {
                            return member;
                        }
                    } else if (member instanceof BlockStatement) {
                        const found = this.findGlobalVariableInBlock(member, variableName);
                        if (found) {
                            return found;
                        }
                    } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                        // 递归查找嵌套的 library 或 scope
                        const found = this.findGlobalVariableInStatement(member, variableName);
                        if (found) {
                            return found;
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                // 查找 scope 中的全局变量
                for (const member of stmt.members) {
                    if (member instanceof VariableDeclaration) {
                        if (!member.isLocal && member.name && member.name.name === variableName) {
                            return member;
                        }
                    } else if (member instanceof BlockStatement) {
                        const found = this.findGlobalVariableInBlock(member, variableName);
                        if (found) {
                            return found;
                        }
                    } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                        // 递归查找嵌套的 library 或 scope
                        const found = this.findGlobalVariableInStatement(member, variableName);
                        if (found) {
                            return found;
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findGlobalVariableInBlock(stmt, variableName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在 Statement（LibraryDeclaration 或 ScopeDeclaration）中查找全局变量
     */
    private findGlobalVariableInStatement(
        stmt: LibraryDeclaration | ScopeDeclaration,
        variableName: string
    ): VariableDeclaration | null {
        for (const member of stmt.members) {
            if (member instanceof VariableDeclaration) {
                if (!member.isLocal && member.name && member.name.name === variableName) {
                    return member;
                }
            } else if (member instanceof BlockStatement) {
                const found = this.findGlobalVariableInBlock(member, variableName);
                if (found) {
                    return found;
                }
            } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                // 递归查找嵌套的 library 或 scope
                const found = this.findGlobalVariableInStatement(member, variableName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在 BlockStatement 中查找变量声明（兼容旧接口）
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
     * 查找方法定义
     */
    private findMethodDefinition(
        typeName: string,
        methodName: string,
        filePath: string
    ): { parameters: Array<{ name: string; type: string }>; returnType: string | null } | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }

            // 先查找 struct
            const structDecl = this.findStructInBlock(blockStatement, typeName);
            if (structDecl) {
                const method = this.findMethodInStruct(structDecl, methodName);
                if (method) {
                    const parameters = method.parameters.map(p => ({
                        name: p.name.name,
                        type: p.type ? p.type.toString() : 'unknown'
                    }));
                    const returnType = method.returnType ? method.returnType.toString() : null;
                    return { parameters, returnType };
                }
            }

            // 再查找 interface
            const interfaceDecl = this.findInterfaceInBlock(blockStatement, typeName);
            if (interfaceDecl) {
                const method = this.findMethodInInterface(interfaceDecl, methodName);
                if (method) {
                    const parameters = method.parameters.map(p => ({
                        name: p.name.name,
                        type: p.type ? p.type.toString() : 'unknown'
                    }));
                    const returnType = method.returnType ? method.returnType.toString() : null;
                    return { parameters, returnType };
                }
            }
        }

        return null;
    }

    /**
     * 在结构体中查找方法
     */
    private findMethodInStruct(
        structDecl: StructDeclaration,
        methodName: string
    ): MethodDeclaration | null {
        // 先查找当前结构体的方法
        for (const member of structDecl.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === methodName) {
                    return member;
                }
            }
        }

        // 如果当前结构有继承，查找父结构或接口的方法
        if (structDecl.extendsType) {
            const parentTypeName = structDecl.extendsType.name;
            
            // 先尝试查找为 struct
            const parentStruct = this.findStructByNameGlobally(parentTypeName);
            if (parentStruct) {
                const method = this.findMethodInStruct(parentStruct, methodName);
                if (method) {
                    return method;
                }
            }
            
            // 再尝试查找为 interface
            const parentInterface = this.findInterfaceByNameGlobally(parentTypeName);
            if (parentInterface) {
                const method = this.findMethodInInterface(parentInterface, methodName);
                if (method) {
                    return method;
                }
            }
        }

        return null;
    }

    /**
     * 在接口中查找方法
     */
    private findMethodInInterface(
        interfaceDecl: InterfaceDeclaration,
        methodName: string
    ): MethodDeclaration | null {
        for (const member of interfaceDecl.members) {
            if (member instanceof MethodDeclaration) {
                if (member.name && member.name.name === methodName) {
                    return member;
                }
            }
        }

        // 注意：vJass 中接口可能不支持继承，但为将来扩展预留
        // 如果将来支持接口继承，可以在这里添加查找父接口的逻辑

        return null;
    }

    /**
     * 全局查找接口声明
     */
    private findInterfaceByNameGlobally(
        interfaceName: string
    ): InterfaceDeclaration | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            const interfaceDecl = this.findInterfaceInBlock(blockStatement, interfaceName);
            if (interfaceDecl) {
                return interfaceDecl;
            }
        }

        return null;
    }

    /**
     * 在 BlockStatement 中查找函数（包括 library 和 scope 中的函数）
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
            } else if (stmt instanceof LibraryDeclaration) {
                // 查找 library 中的函数
                for (const member of stmt.members) {
                    if (member instanceof FunctionDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            return member;
                        }
                    } else if (member instanceof NativeDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            return member;
                        }
                    } else if (member instanceof BlockStatement) {
                        const found = this.findFunctionInBlock(member, functionName);
                        if (found) {
                            return found;
                        }
                    } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                        // 递归查找嵌套的 library 或 scope
                        const found = this.findFunctionInStatement(member, functionName);
                        if (found) {
                            return found;
                        }
                    }
                }
            } else if (stmt instanceof ScopeDeclaration) {
                // 查找 scope 中的函数
                for (const member of stmt.members) {
                    if (member instanceof FunctionDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            return member;
                        }
                    } else if (member instanceof NativeDeclaration) {
                        if (member.name && member.name.name === functionName) {
                            return member;
                        }
                    } else if (member instanceof BlockStatement) {
                        const found = this.findFunctionInBlock(member, functionName);
                        if (found) {
                            return found;
                        }
                    } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                        // 递归查找嵌套的 library 或 scope
                        const found = this.findFunctionInStatement(member, functionName);
                        if (found) {
                            return found;
                        }
                    }
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
     * 在 Statement（LibraryDeclaration 或 ScopeDeclaration）中查找函数
     */
    private findFunctionInStatement(
        stmt: LibraryDeclaration | ScopeDeclaration,
        functionName: string
    ): FunctionDeclaration | NativeDeclaration | MethodDeclaration | null {
        for (const member of stmt.members) {
            if (member instanceof FunctionDeclaration) {
                if (member.name && member.name.name === functionName) {
                    return member;
                }
            } else if (member instanceof NativeDeclaration) {
                if (member.name && member.name.name === functionName) {
                    return member;
                }
            } else if (member instanceof BlockStatement) {
                const found = this.findFunctionInBlock(member, functionName);
                if (found) {
                    return found;
                }
            } else if (member instanceof LibraryDeclaration || member instanceof ScopeDeclaration) {
                // 递归查找嵌套的 library 或 scope
                const found = this.findFunctionInStatement(member, functionName);
                if (found) {
                    return found;
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
     * 查找成员访问的类型
     * 处理：.a、this.a、b.a 等情况
     */
    private findMemberAccessType(
        expr: BinaryExpression,
        filePath: string,
        position: vscode.Position
    ): { type: string; memberName: string } | null {
        if (expr.operator !== OperatorType.Dot) {
            return null;
        }

        const left = expr.left;
        const right = expr.right;

        // 获取成员名
        let memberName: string | null = null;
        if (right instanceof Identifier) {
            memberName = right.name;
        } else {
            return null;
        }

        if (!memberName) {
            return null;
        }

        // 情况1：.a 或 this.a（在 struct 方法中访问当前实例的成员）
        // .a 是 this.a 的简写形式，在解析时 left 可能是空标识符或 this
        const isThisAccess = 
            left instanceof ThistypeExpression ||
            (left instanceof Identifier && (left.name === 'this' || left.name === ''));

        if (isThisAccess) {
            // 查找包含当前位置的 struct 和方法
            const structDecl = this.findContainingStruct(filePath, position);
            if (structDecl) {
                // 先查找实例成员
                const memberType = this.findStructMemberType(structDecl, memberName);
                if (memberType) {
                    return { type: memberType, memberName };
                }
            }
        } else {
            // 情况2：b.a（访问变量 b 的成员 a）
            // 先查找 b 的类型
            let objectType: string | null = null;
            if (left instanceof Identifier) {
                objectType = this.findVariableTypeInContext(left.name, filePath, position);
            }

            if (objectType) {
                // 查找该类型（struct 或 interface）的成员
                // 先查找实例成员，再查找静态成员
                const memberType = this.findTypeMemberType(objectType, memberName, filePath);
                if (memberType) {
                    return { type: memberType, memberName };
                }
            }
        }

        return null;
    }

    /**
     * 查找包含指定位置的结构声明
     */
    private findContainingStruct(
        filePath: string,
        position: vscode.Position
    ): StructDeclaration | null {
        const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
        if (!blockStatement) {
            return null;
        }

        return this.findContainingStructInBlock(blockStatement, position);
    }

    /**
     * 在 BlockStatement 中查找包含指定位置的结构声明
     */
    private findContainingStructInBlock(
        block: BlockStatement,
        position: vscode.Position
    ): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                // 检查位置是否在结构体范围内
                if (stmt.start && stmt.end) {
                    const structStartLine = stmt.start.line;
                    const structEndLine = stmt.end.line;
                    if (position.line >= structStartLine && position.line <= structEndLine) {
                        return stmt;
                    }
                }
                // 递归查找结构体成员中的方法
                for (const member of stmt.members) {
                    if (member instanceof MethodDeclaration) {
                        if (member.body && this.isPositionInAstRange(position, member.body.start, member.body.end)) {
                            return stmt;
                        }
                    } else if (member instanceof BlockStatement) {
                        if (this.isPositionInAstRange(position, member.start, member.end)) {
                            return stmt;
                        }
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const nestedStruct = this.findContainingStructInBlock(stmt, position);
                if (nestedStruct) {
                    return nestedStruct;
                }
            } else if (stmt instanceof ScopeDeclaration || stmt instanceof LibraryDeclaration) {
                const nestedStruct = this.findContainingStructInBlock(new BlockStatement(stmt.members), position);
                if (nestedStruct) {
                    return nestedStruct;
                }
            }
        }
        return null;
    }

    /**
     * 查找结构体成员的类型
     */
    private findStructMemberType(
        structDecl: StructDeclaration,
        memberName: string
    ): string | null {
        // 查找实例成员
        for (const member of structDecl.members) {
            if (member instanceof VariableDeclaration) {
                if (!member.isStatic && member.name && member.name.name === memberName && member.type) {
                    return member.type.toString();
                }
            }
        }

        // 查找静态成员
        for (const member of structDecl.members) {
            if (member instanceof VariableDeclaration) {
                if (member.isStatic && member.name && member.name.name === memberName && member.type) {
                    return member.type.toString();
                }
            }
        }

        // 如果当前结构有继承，查找父结构的成员
        if (structDecl.extendsType) {
            const parentStructName = structDecl.extendsType.name;
            // 全局查找父结构，不限制行号
            const parentStruct = this.findStructByNameGlobally(parentStructName);
            if (parentStruct) {
                return this.findStructMemberType(parentStruct, memberName);
            }
        }

        return null;
    }

    /**
     * 查找类型（struct 或 interface）的成员类型
     */
    private findTypeMemberType(
        typeName: string,
        memberName: string,
        filePath: string
    ): string | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const cachedFilePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(cachedFilePath);
            if (!blockStatement) {
                continue;
            }

            // 先查找 struct
            const structDecl = this.findStructInBlock(blockStatement, typeName);
            if (structDecl) {
                const memberType = this.findStructMemberType(structDecl, memberName);
                if (memberType) {
                    return memberType;
                }
            }

            // 再查找 interface
            const interfaceDecl = this.findInterfaceInBlock(blockStatement, typeName);
            if (interfaceDecl) {
                const memberType = this.findInterfaceMemberType(interfaceDecl, memberName);
                if (memberType) {
                    return memberType;
                }
            }
        }

        return null;
    }

    /**
     * 在 BlockStatement 中查找结构声明
     */
    private findStructInBlock(
        block: BlockStatement,
        structName: string
    ): StructDeclaration | null {
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
            } else if (stmt instanceof ScopeDeclaration || stmt instanceof LibraryDeclaration) {
                const found = this.findStructInBlock(new BlockStatement(stmt.members), structName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 在 BlockStatement 中查找接口声明
     */
    private findInterfaceInBlock(
        block: BlockStatement,
        interfaceName: string
    ): InterfaceDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof InterfaceDeclaration) {
                if (stmt.name && stmt.name.name === interfaceName) {
                    return stmt;
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findInterfaceInBlock(stmt, interfaceName);
                if (found) {
                    return found;
                }
            } else if (stmt instanceof ScopeDeclaration || stmt instanceof LibraryDeclaration) {
                const found = this.findInterfaceInBlock(new BlockStatement(stmt.members), interfaceName);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /**
     * 查找接口成员的类型
     */
    private findInterfaceMemberType(
        interfaceDecl: InterfaceDeclaration,
        memberName: string
    ): string | null {
        // 查找接口成员（接口成员通常是方法，但也可能有变量）
        for (const member of interfaceDecl.members) {
            if (member instanceof VariableDeclaration) {
                if (member.name && member.name.name === memberName && member.type) {
                    return member.type.toString();
                }
            } else if (member instanceof MethodDeclaration) {
                // 接口的方法也可以作为成员访问
                if (member.name && member.name.name === memberName) {
                    // 方法没有类型，返回 null 或者可以返回 "method"
                    // 这里返回 null，因为方法调用不是变量赋值
                    return null;
                }
            }
        }

        return null;
    }

    /**
     * 根据名称全局查找结构声明（不限制行号）
     */
    private findStructByNameGlobally(
        structName: string
    ): StructDeclaration | null {
        const allCachedFiles = this.dataEnterManager.getAllCachedFiles();

        for (const filePath of allCachedFiles) {
            const blockStatement = this.dataEnterManager.getBlockStatement(filePath);
            if (!blockStatement) {
                continue;
            }

            const structDecl = this.findStructInBlock(blockStatement, structName);
            if (structDecl) {
                return structDecl;
            }
        }

        return null;
    }

    /**
     * 根据名称查找结构声明（在指定行之前，用于向后兼容）
     */
    private findStructByName(
        structName: string,
        beforeLine: number
    ): StructDeclaration | null {
        // 优先使用全局查找
        return this.findStructByNameGlobally(structName);
    }

    /**
     * 在 BlockStatement 中查找指定行之前的结构声明
     */
    private findStructInBlockBeforeLine(
        block: BlockStatement,
        structName: string,
        beforeLine: number
    ): StructDeclaration | null {
        for (const stmt of block.body) {
            if (stmt instanceof StructDeclaration) {
                if (stmt.name && stmt.name.name === structName) {
                    // 检查结构声明是否在指定行之前
                    if (stmt.start && stmt.start.line < beforeLine) {
                        return stmt;
                    }
                }
            } else if (stmt instanceof BlockStatement) {
                const found = this.findStructInBlockBeforeLine(stmt, structName, beforeLine);
                if (found) {
                    return found;
                }
            }
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
