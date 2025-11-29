import { Position, Range } from "../jass/loc";

/**
 * 运算符类型枚举
 * 从 lexer.ts 的 TokenType 中提取的运算符类型
 */
enum OperatorType {
    /** 加法运算符 + */
    Plus = "PLUS",
    /** 减法运算符 - */
    Minus = "MINUS",
    /** 乘法运算符 * */
    Multiply = "MULTIPLY",
    /** 除法运算符 / */
    Divide = "DIVIDE",
    /** 相等运算符 == */
    Equal = "EQUAL",
    /** 不等运算符 != */
    NotEqual = "NOT_EQUAL",
    /** 小于运算符 < */
    Less = "LESS",
    /** 小于等于运算符 <= */
    LessEqual = "LESS_EQUAL",
    /** 大于运算符 > */
    Greater = "GREATER",
    /** 大于等于运算符 >= */
    GreaterEqual = "GREATER_EQUAL",
    /** 成员访问运算符 . */
    Dot = "DOT",
    /** 取模运算符 % */
    Modulo = "MODULO",
    /** 逻辑与运算符 and */
    And = "AND",
    /** 逻辑或运算符 or */
    Or = "OR",
    /** 逻辑非运算符 not */
    Not = "NOT",
    /** 逻辑与运算符 && */
    LogicalAnd = "LOGICAL_AND",
    /** 逻辑或运算符 || */
    LogicalOr = "LOGICAL_OR",
    /** 逻辑非运算符 ! */
    LogicalNot = "LOGICAL_NOT",
    /** 数组索引运算符 [] */
    Index = "INDEX"
}

/**
 * AST 节点基类
 * 提供节点关系管理功能，支持父子关系和兄弟关系
 */
class ASTNode {
    /**
     * 位置范围 - 开始位置
     */
    public start: { line: number, position: number };

    /**
     * 位置范围 - 结束位置
     */
    public end: { line: number, position: number };

    /**
     * 父节点
     */
    public parent: ASTNode | null = null;

    /**
     * 前一个兄弟节点
     */
    public previousSibling: ASTNode | null = null;

    /**
     * 下一个兄弟节点
     */
    public nextSibling: ASTNode | null = null;

    /**
     * 子节点列表
     */
    public readonly children: ASTNode[] = [];

    /**
     * 构造函数
     * @param start 开始位置，默认为 { line: 0, position: 0 }
     * @param end 结束位置，默认为 { line: 0, position: 0 }
     */
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        this.start = start || { line: 0, position: 0 };
        this.end = end || { line: 0, position: 0 };
    }

    // 当子节点发生变化时，更新结束位置
    private updateEndPosition() {
        if (this.parent) {
            this.parent.updateEndPosition();
        }
        this.end = { line: this.children[this.children.length - 1].end.line, position: this.children[this.children.length - 1].end.position };
    }

    /**
     * 设置开始位置
     * @param line 行号
     * @param position 位置
     * @returns 当前节点，支持链式调用
     */
    public setStart(line: number, position: number): this {
        this.start = { line, position };
        return this;
    }

    /**
     * 设置结束位置
     * @param line 行号
     * @param position 位置
     * @returns 当前节点，支持链式调用
     */
    public setEnd(line: number, position: number): this {
        this.end = { line, position };
        return this;
    }

    /**
     * 设置位置范围
     * @param start 开始位置
     * @param end 结束位置
     * @returns 当前节点，支持链式调用
     */
    public setRange(start: { line: number, position: number }, end: { line: number, position: number }): this {
        this.start = start;
        this.end = end;
        return this;
    }

    /**
     * 从另一个节点复制位置范围
     * @param node 源节点
     * @returns 当前节点，支持链式调用
     */
    public copyRangeFrom(node: ASTNode): this {
        this.start = { ...node.start };
        this.end = { ...node.end };
        return this;
    }

    /**
     * 根据子节点自动更新位置范围
     * @returns 当前节点，支持链式调用
     */
    public updateRangeFromChildren(): this {
        if (this.children.length === 0) {
            return this;
        }

        let minStart = this.children[0].start;
        let maxEnd = this.children[0].end;

        for (const child of this.children) {
            // 比较开始位置
            if (child.start.line < minStart.line || 
                (child.start.line === minStart.line && child.start.position < minStart.position)) {
                minStart = child.start;
            }

            // 比较结束位置
            if (child.end.line > maxEnd.line || 
                (child.end.line === maxEnd.line && child.end.position > maxEnd.position)) {
                maxEnd = child.end;
            }
        }

        this.start = { ...minStart };
        this.end = { ...maxEnd };
        return this;
    }

    /**
     * 添加子节点
     * @param child 要添加的子节点
     * @param updateRange 是否根据子节点自动更新位置范围，默认为 true
     * @returns 当前节点，支持链式调用
     */
    public addChild(child: ASTNode, updateRange: boolean = true): this {
        if (!child) {
            return this;
        }

        // 设置父子关系
        child.parent = this;

        // 设置兄弟关系
        if (this.children.length > 0) {
            const lastChild = this.children[this.children.length - 1];
            child.previousSibling = lastChild;
            lastChild.nextSibling = child;
        }

        this.children.push(child);

        // 自动更新位置范围
        if (updateRange) {
            this.updateRangeFromChildren();
        }

        return this;
    }

    /**
     * 在指定位置插入子节点
     * @param child 要插入的子节点
     * @param index 插入位置
     * @returns 当前节点，支持链式调用
     */
    public insertChild(child: ASTNode, index: number): this {
        if (!child || index < 0 || index > this.children.length) {
            return this;
        }

        // 设置父子关系
        child.parent = this;

        // 设置兄弟关系
        if (index > 0) {
            const prevChild = this.children[index - 1];
            child.previousSibling = prevChild;
            prevChild.nextSibling = child;
        }

        if (index < this.children.length) {
            const nextChild = this.children[index];
            child.nextSibling = nextChild;
            nextChild.previousSibling = child;
        }

        this.children.splice(index, 0, child);
        return this;
    }

    /**
     * 移除子节点
     * @param child 要移除的子节点
     * @returns 是否成功移除
     */
    public removeChild(child: ASTNode): boolean {
        const index = this.children.indexOf(child);
        if (index === -1) {
            return false;
        }

        // 更新兄弟关系
        if (child.previousSibling) {
            child.previousSibling.nextSibling = child.nextSibling;
        }
        if (child.nextSibling) {
            child.nextSibling.previousSibling = child.previousSibling;
        }

        // 清除子节点的关系
        child.parent = null;
        child.previousSibling = null;
        child.nextSibling = null;

        this.children.splice(index, 1);
        return true;
    }

    /**
     * 获取第一个子节点
     * @returns 第一个子节点，如果没有则返回 null
     */
    public getFirstChild(): ASTNode | null {
        return this.children.length > 0 ? this.children[0] : null;
    }

    /**
     * 获取最后一个子节点
     * @returns 最后一个子节点，如果没有则返回 null
     */
    public getLastChild(): ASTNode | null {
        return this.children.length > 0 ? this.children[this.children.length - 1] : null;
    }

    /**
     * 获取所有兄弟节点（包括自己）
     * @returns 兄弟节点数组
     */
    public getSiblings(): ASTNode[] {
        const siblings: ASTNode[] = [this];
        
        // 向前查找所有兄弟节点
        let current: ASTNode | null = this.previousSibling;
        while (current) {
            siblings.unshift(current);
            current = current.previousSibling;
        }

        // 向后查找所有兄弟节点
        current = this.nextSibling;
        while (current) {
            siblings.push(current);
            current = current.nextSibling;
        }

        return siblings;
    }
}

/**
 * 语句抽象基类
 * 所有语句类型都应该继承自此类
 */
abstract class Statement extends ASTNode {
    /**
     * 构造函数
     * @param start 开始位置
     * @param end 结束位置
     */
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
    }

    /**
     * 将语句转换为字符串表示
     * @returns 语句的字符串表示
     */
    public abstract toString(): string;
}

/**
 * 表达式抽象基类
 * 所有表达式类型都应该继承自此类
 */
abstract class Expression extends ASTNode {
    /**
     * 构造函数
     * @param start 开始位置
     * @param end 结束位置
     */
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
    }

    /**
     * 获取表达式的类型
     * @returns 表达式的类型字符串
     */
    public abstract getType(): string | null;

    /**
     * 将表达式转换为字符串表示
     * @returns 表达式的字符串表示
     */
    public abstract toString(): string;
}

/**
 * 字面量表达式基类
 */
abstract class Literal<T> extends Expression {
    public readonly value: T;
    
    constructor(value: T, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.value = value;
    }
    
    public toString(): string {
        return String(this.value);
    }
}

/**
 * 整数字面量
 */
class IntegerLiteral extends Literal<number> {
    public getType(): string {
        return "integer";
    }
}

/**
 * 实数字面量
 */
class RealLiteral extends Literal<number> {
    public getType(): string {
        return "real";
    }
}

/**
 * 字符串字面量
 */
class StringLiteral extends Literal<string> {
    public getType(): string {
        return "string";
    }
}

/**
 * 布尔字面量
 */
class BooleanLiteral extends Literal<boolean> {
    public getType(): string {
        return "boolean";
    }
}

/**
 * null字面量
 */
class NullLiteral extends Literal<null> {
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(null, start, end);
    }
    
    public getType(): string {
        return "null";
    }
    
    public toString(): string {
        return "null";
    }
}

/**
 * 标识符表达式（变量名、函数名等）
 */
class Identifier extends Expression {
    public readonly name: string;
    
    constructor(name: string, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.name = name;
    }
    
    public getType(): string | null {
        // 类型需要根据上下文确定，这里返回null
        return null;
    }
    
    public toString(): string {
        return this.name;
    }
}

/**
 * Super 表达式（用于调用父类方法）
 * super.methodName()
 */
class SuperExpression extends Expression {
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
    }
    
    public getType(): string | null {
        // super 表达式的类型需要根据上下文确定
        return null;
    }
    
    public toString(): string {
        return "super";
    }
}

/**
 * Thistype 表达式（在结构内部等同于该结构的名称）
 * thistype array ts
 * method tester takes nothing returns thistype
 * return thistype.allocate()
 */
class ThistypeExpression extends Expression {
    constructor(start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
    }
    
    public getType(): string | null {
        // thistype 表达式的类型等同于当前结构的名称
        return null;
    }
    
    public toString(): string {
        return "thistype";
    }
}

/**
 * 变量声明语句
 */
class VariableDeclaration extends Statement {
    public readonly name: Identifier;
    public readonly type: Identifier | ThistypeExpression | null; // 变量类型，如integer, real, thistype等
    public readonly initializer: Expression | null; // 初始化表达式
    public readonly isConstant: boolean; // 是否是常量
    public readonly isLocal: boolean; // 是否是局部变量
    public readonly isArray: boolean = false; // 是否是数组
    public readonly arraySize: number | null = null; // 数组大小，如 integer array V[100] 中的 100（一维数组）
    public readonly arrayWidth: number | null = null; // 二维数组的宽度，如 integer array mat1 [10][20] 中的 10
    public readonly arrayHeight: number | null = null; // 二维数组的高度，如 integer array mat1 [10][20] 中的 20
    public readonly isStatic: boolean = false; // 是否是静态成员（用于 struct）
    
    constructor(
        name: Identifier, 
        type: Identifier | ThistypeExpression | null = null,
        initializer: Expression | null = null,
        isConstant: boolean = false,
        isLocal: boolean = false,
        isArray: boolean = false,
        arraySize: number | null = null,
        arrayWidth: number | null = null,
        arrayHeight: number | null = null,
        isStatic: boolean = false,
        start?: { line: number, position: number }, 
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.name = name;
        this.type = type;
        this.initializer = initializer;
        this.isConstant = isConstant;
        this.isLocal = isLocal;
        this.isArray = isArray;
        this.arraySize = arraySize;
        this.arrayWidth = arrayWidth;
        this.arrayHeight = arrayHeight;
        this.isStatic = isStatic;
        
        // 添加子节点
        this.addChild(name);
        if (type) this.addChild(type);
        if (initializer) this.addChild(initializer);
    }
    
    public toString(): string {
        const prefix = this.isLocal ? "local" : "";
        const constant = this.isConstant ? " constant" : "";
        const staticStr = this.isStatic ? "static" : "";
        const typeStr = this.type ? ` ${this.type.toString()}` : "";
        const arrayStr = this.isArray ? " array" : "";
        // 二维数组：mat1 [10][20]
        // 一维数组：V[100]
        let sizeStr = "";
        if (this.arrayWidth !== null && this.arrayHeight !== null) {
            sizeStr = `[${this.arrayWidth}][${this.arrayHeight}]`;
        } else if (this.arraySize !== null) {
            sizeStr = `[${this.arraySize}]`;
        }
        const initStr = this.initializer ? ` = ${this.initializer.toString()}` : "";
        
        const parts = [prefix, staticStr, constant, typeStr, arrayStr, this.name.toString(), sizeStr, initStr]
            .filter(p => p !== "").join(" ");
        
        return parts;
    }
}

/**
 * 二元运算表达式
 */
class BinaryExpression extends Expression {
    public readonly operator: OperatorType;
    public readonly left: Expression;
    public readonly right: Expression;
    
    constructor(
        operator: OperatorType,
        left: Expression,
        right: Expression,
        start?: { line: number, position: number }, 
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.operator = operator;
        this.left = left;
        this.right = right;
        
        this.addChild(left);
        this.addChild(right);
    }
    
    public getType(): string | null {
        // 根据操作符和操作数类型推断返回类型
        const leftType = this.left.getType();
        const rightType = this.right.getType();
        
        // 逻辑运算符返回 boolean
        if (this.operator === OperatorType.And || 
            this.operator === OperatorType.Or ||
            this.operator === OperatorType.Not ||
            this.operator === OperatorType.LogicalAnd ||
            this.operator === OperatorType.LogicalOr ||
            this.operator === OperatorType.LogicalNot) {
            return "boolean";
        }
        
        // 比较运算符返回 boolean
        if (this.operator === OperatorType.Equal || 
            this.operator === OperatorType.NotEqual ||
            this.operator === OperatorType.Less ||
            this.operator === OperatorType.LessEqual ||
            this.operator === OperatorType.Greater ||
            this.operator === OperatorType.GreaterEqual) {
            return "boolean";
        }
        
        // 取模运算符返回与操作数相同的类型
        if (this.operator === OperatorType.Modulo) {
            if (leftType === "real" || rightType === "real") {
                return "real";
            }
            return leftType || rightType || "integer";
        }
        
        // 算术运算符：如果有 real 类型，返回 real
        if (this.operator === OperatorType.Plus ||
            this.operator === OperatorType.Minus ||
            this.operator === OperatorType.Multiply ||
            this.operator === OperatorType.Divide) {
            if (leftType === "real" || rightType === "real") {
                return "real";
            }
            return leftType || rightType || "integer";
        }
        
        // 成员访问运算符的类型需要根据上下文确定
        if (this.operator === OperatorType.Dot) {
            return null;
        }
        
        return leftType || rightType;
    }
    
    public toString(): string {
        const operatorMap: Record<OperatorType, string> = {
            [OperatorType.Plus]: "+",
            [OperatorType.Minus]: "-",
            [OperatorType.Multiply]: "*",
            [OperatorType.Divide]: "/",
            [OperatorType.Modulo]: "%",
            [OperatorType.Equal]: "==",
            [OperatorType.NotEqual]: "!=",
            [OperatorType.Less]: "<",
            [OperatorType.LessEqual]: "<=",
            [OperatorType.Greater]: ">",
            [OperatorType.GreaterEqual]: ">=",
            [OperatorType.Dot]: ".",
            [OperatorType.And]: "and",
            [OperatorType.Or]: "or",
            [OperatorType.Not]: "not",
            [OperatorType.LogicalAnd]: "&&",
            [OperatorType.LogicalOr]: "||",
            [OperatorType.LogicalNot]: "!",
            [OperatorType.Index]: "[]"
        };
        
        const opStr = operatorMap[this.operator] || this.operator;
        // 对于点运算符，不需要括号和空格
        if (this.operator === OperatorType.Dot) {
            return `${this.left.toString()}${opStr}${this.right.toString()}`;
        }
        // 对于逻辑运算符，使用空格分隔
        return `(${this.left.toString()} ${opStr} ${this.right.toString()})`;
    }
}

/**
 * 函数调用表达式
 */
class CallExpression extends Expression {
    public readonly callee: Identifier | Expression; // 被调用的函数名或表达式
    public readonly arguments: Expression[]; // 参数列表
    
    constructor(
        callee: Identifier | Expression,
        args: Expression[] = [],
        start?: { line: number, position: number }, 
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.callee = callee;
        this.arguments = args;
        
        this.addChild(callee);
        args.forEach(arg => this.addChild(arg));
    }
    
    public getType(): string | null {
        // 函数调用的返回类型需要根据函数定义确定
        // 这里先返回null，实际实现中需要符号表支持
        return null;
    }
    
    public toString(): string {
        const argsStr = this.arguments.map(arg => arg.toString()).join(", ");
        return `${this.callee.toString()}(${argsStr})`;
    }
}

/**
 * 函数表达式（function functionName，类型为 code）
 */
class FunctionExpression extends Expression {
    public readonly functionName: Identifier;
    
    constructor(
        functionName: Identifier,
        start?: { line: number, position: number },
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.functionName = functionName;
        this.addChild(functionName);
    }
    
    public getType(): string | null {
        return "code";
    }
    
    public toString(): string {
        return `function ${this.functionName.toString()}`;
    }
}

/**
 * 代码块语句（包含多个语句）
 */
class BlockStatement extends Statement {
    public body: Statement[];
    
    constructor(statements: Statement[] = [], start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.body = statements;
        
        statements.forEach(stmt => this.addChild(stmt));
    }
    
    public toString(): string {
        return this.body.map(stmt => stmt.toString()).join("\n");
    }
}

/**
 * 赋值语句（对应JASS的set语句）
 */
class AssignmentStatement extends Statement {
    public readonly target: Identifier | Expression; // 赋值目标
    public readonly value: Expression; // 赋值表达式
    
    constructor(
        target: Identifier | Expression,
        value: Expression,
        start?: { line: number, position: number }, 
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.target = target;
        this.value = value;
        
        this.addChild(target);
        this.addChild(value);
    }
    
    public toString(): string {
        return `set ${this.target.toString()} = ${this.value.toString()}`;
    }
}

/**
 * 条件语句（if/elseif/else）
 */
class IfStatement extends Statement {
    public readonly condition: Expression;
    public readonly consequent: Statement; // then分支
    public readonly alternate: IfStatement | BlockStatement | null; // else/elseif分支
    public readonly isStatic: boolean = false; // 是否是 static if
    
    constructor(
        condition: Expression,
        consequent: Statement,
        alternate: IfStatement | BlockStatement | null = null,
        isStatic: boolean = false,
        start?: { line: number, position: number }, 
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.condition = condition;
        this.consequent = consequent;
        this.alternate = alternate;
        this.isStatic = isStatic;
        
        this.addChild(condition);
        this.addChild(consequent);
        if (alternate) this.addChild(alternate);
    }
    
    public toString(): string {
        const staticStr = this.isStatic ? "static " : "";
        let result = `${staticStr}if ${this.condition.toString()} then\n${this.consequent.toString()}`;
        
        if (this.alternate) {
            if (this.alternate instanceof IfStatement) {
                // elseif 分支：递归处理
                const elseifStr = this.alternate.toString();
                // 去掉开头的 "static " 或 "if "，添加 "elseif "
                // 同时需要去掉最后的 "endif"，因为只有最外层的 if 需要 endif
                const cleanedStr = elseifStr
                    .replace(/^(static )?if /, "elseif ")
                    .replace(/\nendif$/, "");
                result += `\n${cleanedStr}`;
            } else {
                result += `\nelse\n${this.alternate.toString()}`;
            }
        }
        
        result += "\nendif";
        return result;
    }
}

/**
 * 循环语句（loop）
 */
class LoopStatement extends Statement {
    public readonly body: BlockStatement;
    
    constructor(body: BlockStatement, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.body = body;
        this.addChild(body);
    }
    
    public toString(): string {
        return `loop\n${this.body.toString()}\nendloop`;
    }
}

/**
 * 退出循环语句（exitwhen）
 */
class ExitWhenStatement extends Statement {
    public readonly condition: Expression;
    
    constructor(condition: Expression, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.condition = condition;
        this.addChild(condition);
    }
    
    public toString(): string {
        return `exitwhen ${this.condition.toString()}`;
    }
}

/**
 * 返回语句（return）
 */
class ReturnStatement extends Statement {
    public readonly argument: Expression | null;
    
    constructor(argument: Expression | null = null, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.argument = argument;
        if (argument) this.addChild(argument);
    }
    
    public toString(): string {
        return this.argument ? `return ${this.argument.toString()}` : "return";
    }
}

/**
 * 函数调用语句（call）
 */
class CallStatement extends Statement {
    public readonly expression: CallExpression;
    
    constructor(expression: CallExpression, start?: { line: number, position: number }, end?: { line: number, position: number }) {
        super(start, end);
        this.expression = expression;
        this.addChild(expression);
    }
    
    public toString(): string {
        return `call ${this.expression.toString()}`;
    }
}

/**
 * 函数声明
 */
class FunctionDeclaration extends Statement {
    public name: Identifier | null;
    public parameters: VariableDeclaration[];
    public returnType: Identifier | ThistypeExpression | null;
    public body: BlockStatement;
    public isNative: boolean = false;
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        body?: BlockStatement;
        isNative?: boolean;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            body = new BlockStatement(),
            isNative = false,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        this.isNative = isNative;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        this.addChild(body);
    }
    
    public toString(): string {
        const nativeStr = this.isNative ? "native " : "";
        const nameStr = this.name ? this.name.toString() : "";
        const takesStr = this.parameters.length > 0 ? 
            ` takes ${this.parameters.map(p => p.toString()).join(", ")}` : "";
        const returnsStr = this.returnType ? ` returns ${this.returnType.toString()}` : "";
        const bodyStr = this.isNative ? "" : `\n${this.body.toString()}\nendfunction`;
        
        return `${nativeStr}function ${nameStr}${takesStr}${returnsStr}${bodyStr}`;
    }
}

/**
 * 结构声明
 */
class StructDeclaration extends Statement {
    public name: Identifier | null;
    public readonly members: Statement[];
    public extendsType: Identifier | null;
    public indexSize: number | null = null; // 索引空间增强，如 struct X[10000]
    public isArrayStruct: boolean = false; // 是否是数组结构（extends array）
    public arraySize: number | null = null; // 数组结构的大小，如 struct X extends array [20000]
    
    constructor(options?: {
        name?: Identifier | null;
        members?: Statement[];
        extendsType?: Identifier | null;
        indexSize?: number | null;
        isArrayStruct?: boolean;
        arraySize?: number | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            members = [],
            extendsType = null,
            indexSize = null,
            isArrayStruct = false,
            arraySize = null,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.members = members;
        this.extendsType = extendsType;
        this.indexSize = indexSize;
        this.isArrayStruct = isArrayStruct;
        this.arraySize = arraySize;
        
        if (name) this.addChild(name);
        if (extendsType) this.addChild(extendsType);
        members.forEach(member => this.addChild(member));
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const indexStr = this.indexSize !== null ? `[${this.indexSize}]` : "";
        let extendsStr = "";
        if (this.isArrayStruct) {
            const arraySizeStr = this.arraySize !== null ? ` [${this.arraySize}]` : "";
            extendsStr = ` extends array${arraySizeStr}`;
        } else if (this.extendsType) {
            extendsStr = ` extends ${this.extendsType.toString()}`;
        }
        const membersStr = this.members.length > 0 ? 
            `\n${this.members.map(m => m.toString()).join("\n")}\n` : "";
        
        return `struct ${nameStr}${indexStr}${extendsStr}${membersStr}endstruct`;
    }
}

/**
 * 接口声明
 */
class InterfaceDeclaration extends Statement {
    public name: Identifier | null;
    public readonly members: Statement[];
    
    constructor(options?: {
        name?: Identifier | null;
        members?: Statement[];
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            members = [],
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.members = members;
        
        if (name) this.addChild(name);
        members.forEach(member => this.addChild(member));
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const membersStr = this.members.length > 0 ? 
            `\n${this.members.map(m => m.toString()).join("\n")}\n` : "";
        
        return `interface ${nameStr}${membersStr}endinterface`;
    }
}

/**
 * 模块声明
 */
class ModuleDeclaration extends Statement {
    public name: Identifier | null;
    public readonly members: Statement[];
    public readonly implementsTypes: Identifier[];
    
    constructor(options?: {
        name?: Identifier | null;
        members?: Statement[];
        implementsTypes?: Identifier[];
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            members = [],
            implementsTypes = [],
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.members = members;
        this.implementsTypes = implementsTypes;
        
        if (name) this.addChild(name);
        implementsTypes.forEach(impl => this.addChild(impl));
        members.forEach(member => this.addChild(member));
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const implementsStr = this.implementsTypes.length > 0 ? 
            ` implements ${this.implementsTypes.map(i => i.toString()).join(", ")}` : "";
        const membersStr = this.members.length > 0 ? 
            `\n${this.members.map(m => m.toString()).join("\n")}\n` : "";
        
        return `module ${nameStr}${implementsStr}${membersStr}endmodule`;
    }
}

/**
 * 方法声明（用于结构、接口等）
 */
class MethodDeclaration extends Statement {
    public name: Identifier | null;
    public parameters: VariableDeclaration[];
    public returnType: Identifier | ThistypeExpression | null;
    public body: BlockStatement;
    public isStatic: boolean = false;
    public isStub: boolean = false; // 是否是存根方法
    public isOperator: boolean = false; // 是否是运算符重载
    public operatorName: string | null = null; // 运算符名称（如 [], []=, <, >, x, x= 等）
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        body?: BlockStatement;
        isStatic?: boolean;
        isStub?: boolean;
        isOperator?: boolean;
        operatorName?: string | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            body = new BlockStatement(),
            isStatic = false,
            isStub = false,
            isOperator = false,
            operatorName = null,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        this.isStatic = isStatic;
        this.isStub = isStub;
        this.isOperator = isOperator;
        this.operatorName = operatorName;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        this.addChild(body);
    }
    
    public toString(): string {
        const staticStr = this.isStatic ? "static " : "";
        const stubStr = this.isStub ? "stub " : "";
        const operatorStr = this.isOperator ? `operator ${this.operatorName || ""} ` : "";
        const nameStr = this.name ? this.name.toString() : "";
        const takesStr = this.parameters.length > 0 ? 
            ` takes ${this.parameters.map(p => p.toString()).join(", ")}` : " takes nothing";
        const returnsStr = this.returnType ? ` returns ${this.returnType.toString()}` : " returns nothing";
        const bodyStr = `\n${this.body.toString()}\nendmethod`;
        
        return `${staticStr}${stubStr}method ${operatorStr}${nameStr}${takesStr}${returnsStr}${bodyStr}`;
    }
}

/**
 * Implement 语句（用于 struct 和 module 中实现模块）
 */
class ImplementStatement extends Statement {
    public readonly moduleName: Identifier;
    public readonly isOptional: boolean;
    
    constructor(options: {
        moduleName: Identifier;
        isOptional?: boolean;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            moduleName,
            isOptional = false,
            start,
            end
        } = options;
        
        super(start, end);
        
        this.moduleName = moduleName;
        this.isOptional = isOptional;
        
        this.addChild(moduleName);
    }
    
    public toString(): string {
        const optionalStr = this.isOptional ? "optional " : "";
        return `implement ${optionalStr}${this.moduleName.toString()}`;
    }
}

/**
 * Delegate 声明（用于 struct 中委托给其他结构）
 * delegate TypeName memberName
 */
class DelegateDeclaration extends Statement {
    public readonly delegateType: Identifier;
    public readonly name: Identifier;
    public readonly isPrivate: boolean;
    
    constructor(options: {
        delegateType: Identifier;
        name: Identifier;
        isPrivate?: boolean;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            delegateType,
            name,
            isPrivate = false,
            start,
            end
        } = options;
        
        super(start, end);
        
        this.delegateType = delegateType;
        this.name = name;
        this.isPrivate = isPrivate;
        
        this.addChild(delegateType);
        this.addChild(name);
    }
    
    public toString(): string {
        const privateStr = this.isPrivate ? "private " : "";
        return `${privateStr}delegate ${this.delegateType.toString()} ${this.name.toString()}`;
    }
}

// 导出当前文件定义的类
export { 
    ASTNode, 
    Statement, 
    Expression,
    Literal,
    IntegerLiteral,
    RealLiteral,
    StringLiteral,
    BooleanLiteral,
    NullLiteral,
    Identifier,
    SuperExpression,
    ThistypeExpression,
    VariableDeclaration,
    BinaryExpression,
    CallExpression,
    FunctionExpression,
    BlockStatement,
    AssignmentStatement,
    CallStatement,
    IfStatement,
    LoopStatement,
    ExitWhenStatement,
    ReturnStatement,
    FunctionDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    ModuleDeclaration,
    MethodDeclaration,
    ImplementStatement,
    DelegateDeclaration,
    OperatorType
};

