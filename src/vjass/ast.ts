

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

    // ==================== Position Range 常用方法 ====================

    /**
     * 检查位置是否在节点范围内（包含边界）
     * @param line 行号
     * @param position 位置
     * @returns 如果位置在范围内返回 true
     */
    public containsPosition(line: number, position: number): boolean {
        // 检查行号范围
        if (line < this.start.line || line > this.end.line) {
            return false;
        }

        // 检查开始行的位置
        if (line === this.start.line && position < this.start.position) {
            return false;
        }

        // 检查结束行的位置
        if (line === this.end.line && position > this.end.position) {
            return false;
        }

        return true;
    }

    /**
     * 检查位置对象是否在节点范围内（包含边界）
     * @param pos 位置对象 { line: number, position: number }
     * @returns 如果位置在范围内返回 true
     */
    public containsPositionObject(pos: { line: number, position: number }): boolean {
        return this.containsPosition(pos.line, pos.position);
    }

    /**
     * 检查 VSCode Position 是否在节点范围内（包含边界）
     * @param position VSCode Position 对象
     * @returns 如果位置在范围内返回 true
     */
    public containsVSCodePosition(position: { line: number, character: number }): boolean {
        return this.containsPosition(position.line, position.character);
    }

    /**
     * 检查另一个节点是否完全在当前节点范围内
     * @param node 要检查的节点
     * @returns 如果节点在范围内返回 true
     */
    public containsNode(node: ASTNode): boolean {
        // 检查开始位置
        if (!this.containsPosition(node.start.line, node.start.position)) {
            return false;
        }

        // 检查结束位置
        if (!this.containsPosition(node.end.line, node.end.position)) {
            return false;
        }

        return true;
    }

    /**
     * 检查两个节点是否重叠
     * @param node 要检查的节点
     * @returns 如果节点重叠返回 true
     */
    public overlapsWith(node: ASTNode): boolean {
        // 检查是否有任何重叠
        // 节点A的开始在节点B的范围内，或节点A的结束在节点B的范围内
        // 或者节点B完全包含在节点A中
        return (
            this.containsPosition(node.start.line, node.start.position) ||
            this.containsPosition(node.end.line, node.end.position) ||
            node.containsPosition(this.start.line, this.start.position) ||
            node.containsPosition(this.end.line, this.end.position)
        );
    }

    /**
     * 检查位置是否在节点之前（不包含边界）
     * @param line 行号
     * @param position 位置
     * @returns 如果位置在节点之前返回 true
     */
    public isPositionBefore(line: number, position: number): boolean {
        if (line < this.start.line) {
            return true;
        }

        if (line === this.start.line && position < this.start.position) {
            return true;
        }

        return false;
    }

    /**
     * 检查位置对象是否在节点之前（不包含边界）
     * @param pos 位置对象 { line: number, position: number }
     * @returns 如果位置在节点之前返回 true
     */
    public isPositionObjectBefore(pos: { line: number, position: number }): boolean {
        return this.isPositionBefore(pos.line, pos.position);
    }

    /**
     * 检查位置是否在节点之后（不包含边界）
     * @param line 行号
     * @param position 位置
     * @returns 如果位置在节点之后返回 true
     */
    public isPositionAfter(line: number, position: number): boolean {
        if (line > this.end.line) {
            return true;
        }

        if (line === this.end.line && position > this.end.position) {
            return true;
        }

        return false;
    }

    /**
     * 检查位置对象是否在节点之后（不包含边界）
     * @param pos 位置对象 { line: number, position: number }
     * @returns 如果位置在节点之后返回 true
     */
    public isPositionObjectAfter(pos: { line: number, position: number }): boolean {
        return this.isPositionAfter(pos.line, pos.position);
    }

    /**
     * 检查另一个节点是否在当前节点之前
     * @param node 要检查的节点
     * @returns 如果节点在当前节点之前返回 true
     */
    public isNodeBefore(node: ASTNode): boolean {
        return this.isPositionBefore(node.start.line, node.start.position);
    }

    /**
     * 检查另一个节点是否在当前节点之后
     * @param node 要检查的节点
     * @returns 如果节点在当前节点之后返回 true
     */
    public isNodeAfter(node: ASTNode): boolean {
        return this.isPositionAfter(node.end.line, node.end.position);
    }

    /**
     * 获取节点跨越的行数
     * @returns 行数（结束行 - 开始行 + 1）
     */
    public getLineCount(): number {
        return this.end.line - this.start.line + 1;
    }

    /**
     * 检查节点是否在同一行
     * @returns 如果开始行和结束行相同返回 true
     */
    public isSingleLine(): boolean {
        return this.start.line === this.end.line;
    }

    /**
     * 检查节点是否为空（开始位置等于结束位置）
     * @returns 如果节点为空返回 true
     */
    public isEmpty(): boolean {
        return (
            this.start.line === this.end.line &&
            this.start.position === this.end.position
        );
    }

    /**
     * 检查位置范围是否有效
     * @returns 如果位置范围有效返回 true
     */
    public isValidRange(): boolean {
        // 检查开始位置是否在结束位置之前或相等
        if (this.start.line > this.end.line) {
            return false;
        }

        if (this.start.line === this.end.line && this.start.position > this.end.position) {
            return false;
        }

        return true;
    }

    /**
     * 获取位置范围的字符串表示
     * @returns 格式化的位置范围字符串
     */
    public getRangeString(): string {
        if (this.isSingleLine()) {
            return `[${this.start.line}:${this.start.position}-${this.end.position}]`;
        }
        return `[${this.start.line}:${this.start.position} - ${this.end.line}:${this.end.position}]`;
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
    
    public toString(): string {
        // 对于实数，如果值是整数，返回带 .0 的格式
        if (Number.isInteger(this.value)) {
            return `${this.value}.0`;
        }
        return String(this.value);
    }
}

/**
 * 字符串字面量
 */
class StringLiteral extends Literal<string> {
    public getType(): string {
        return "string";
    }
    
    public toString(): string {
        // 返回带引号的字符串
        return `"${this.value}"`;
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
    public readonly isReadonly: boolean = false; // 是否是只读成员（用于 struct，允许外部读取但不能赋值）
    
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
        isReadonly: boolean = false,
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
        this.isReadonly = isReadonly;
        
        // 添加子节点
        this.addChild(name);
        if (type) this.addChild(type);
        if (initializer) this.addChild(initializer);
    }
    
    public toString(): string {
        const prefix = this.isLocal ? "local" : "";
        const constant = this.isConstant ? " constant" : "";
        const staticStr = this.isStatic ? "static" : "";
        const readonlyStr = this.isReadonly ? "readonly" : "";
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
        
        const parts = [prefix, staticStr, readonlyStr, constant, typeStr, arrayStr, this.name.toString(), sizeStr, initStr]
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
        
        // 算术运算符：如果有 real 类型，返回 real；Plus 在 JASS 中也可用于字符串拼接
        if (this.operator === OperatorType.Plus ||
            this.operator === OperatorType.Minus ||
            this.operator === OperatorType.Multiply ||
            this.operator === OperatorType.Divide) {
            // JASS: 任意一侧为 string 时，+ 表示字符串拼接，结果为 string
            if (this.operator === OperatorType.Plus && (leftType === "string" || rightType === "string")) {
                return "string";
            }
            if (leftType === "real" || rightType === "real") {
                return "real";
            }
            const resolved = leftType || rightType;
            // 两侧类型均未知时（如函数调用）不假定为 integer，避免误报
            if (this.operator === OperatorType.Plus && !resolved) {
                return null;
            }
            return resolved || "integer";
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
 * 类型转换表达式（Typecast）
 * 语法：TypeName(expr)
 * 例如：integer(x), wek(W), anarrayofdata(GetUnitUserData(u))
 */
class TypecastExpression extends Expression {
    public readonly targetType: Identifier; // 目标类型名
    public readonly expression: Expression; // 要转换的表达式
    
    constructor(
        targetType: Identifier,
        expression: Expression,
        start?: { line: number, position: number },
        end?: { line: number, position: number }
    ) {
        super(start, end);
        this.targetType = targetType;
        this.expression = expression;
        
        this.addChild(targetType);
        this.addChild(expression);
    }
    
    public getType(): string | null {
        // 返回目标类型
        return this.targetType.toString();
    }
    
    public toString(): string {
        return `${this.targetType.toString()}(${this.expression.toString()})`;
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
 * 函数接口声明
 * function interface 接口名称 takes ... returns ...
 */
class FunctionInterfaceDeclaration extends Statement {
    public name: Identifier | null;
    public parameters: VariableDeclaration[];
    public returnType: Identifier | ThistypeExpression | null;
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const takesStr = this.parameters.length > 0 ?
            ` takes ${this.parameters.map(p => p.toString()).join(", ")}` : " takes nothing";
        const returnsStr = this.returnType ? ` returns ${this.returnType.toString()}` : " returns nothing";
        
        return `function interface ${nameStr}${takesStr}${returnsStr}`;
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
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        body?: BlockStatement;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            body = new BlockStatement(),
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        this.addChild(body);
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const takesStr = this.parameters.length > 0 ? 
            ` takes ${this.parameters.map(p => p.toString()).join(", ")}` : "";
        const returnsStr = this.returnType ? ` returns ${this.returnType.toString()}` : "";
        const bodyStr = `\n${this.body.toString()}\nendfunction`;
        
        return `function ${nameStr}${takesStr}${returnsStr}${bodyStr}`;
    }
}

/**
 * Native 函数声明
 * 支持语法：
 * - native function name takes ... returns ...
 * - constant native function name takes ... returns ...
 */
class NativeDeclaration extends Statement {
    public name: Identifier | null;
    public parameters: VariableDeclaration[];
    public returnType: Identifier | ThistypeExpression | null;
    public isConstant: boolean = false; // 是否是常量函数（constant native function）
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        isConstant?: boolean;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            isConstant = false,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.isConstant = isConstant;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
    }
    
    public toString(): string {
        const constantStr = this.isConstant ? "constant " : "";
        const nameStr = this.name ? this.name.toString() : "";
        const takesStr = this.parameters.length > 0 ? 
            ` takes ${this.parameters.map(p => p.toString()).join(", ")}` : "";
        const returnsStr = this.returnType ? ` returns ${this.returnType.toString()}` : "";
        
        return `${constantStr}native ${nameStr}${takesStr}${returnsStr}`;
    }
}

/**
 * JASS 类型声明
 * 语法：
 * - type NewType extends BaseType
 * - type NewType extends BaseType array[Size]
 * - type NewType extends BaseType array[ElementSize, StorageSize]
 *   （对应 vJass 动态数组及其扩展存储语法）
 */
class TypeDeclaration extends Statement {
    public name: Identifier;
    public baseType: Identifier;
    public isArray: boolean = false;
    /**
     * 动态数组元素大小（如 array[8] 中的 8，或常量名）
     */
    public elementSize: Identifier | IntegerLiteral | null = null;
    /**
     * 扩展存储大小（如 array[200,40000] 中的 40000，可选）
     */
    public storageSize: Identifier | IntegerLiteral | null = null;

    constructor(options: {
        name: Identifier;
        baseType: Identifier;
        isArray?: boolean;
        elementSize?: Identifier | IntegerLiteral | null;
        storageSize?: Identifier | IntegerLiteral | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name,
            baseType,
            isArray = false,
            elementSize = null,
            storageSize = null,
            start,
            end
        } = options;

        super(start, end);
        this.name = name;
        this.baseType = baseType;
        this.isArray = isArray;
        this.elementSize = elementSize;
        this.storageSize = storageSize;

        this.addChild(name);
        this.addChild(baseType);
        if (elementSize) this.addChild(elementSize);
        if (storageSize) this.addChild(storageSize);
    }

    public toString(): string {
        const baseStr = `type ${this.name.toString()} extends ${this.baseType.toString()}`;
        if (!this.isArray) {
            return baseStr;
        }

        const elemStr = this.elementSize ? this.elementSize.toString() : "";
        const storageStr = this.storageSize ? `,${this.storageSize.toString()}` : "";
        return `${baseStr} array[${elemStr}${storageStr}]`;
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
    public defaultsValue: Expression | null = null; // defaults 关键字的值（用于接口方法）
    
    constructor(options?: {
        name?: Identifier | null;
        parameters?: VariableDeclaration[];
        returnType?: Identifier | ThistypeExpression | null;
        body?: BlockStatement;
        isStatic?: boolean;
        isStub?: boolean;
        isOperator?: boolean;
        operatorName?: string | null;
        defaultsValue?: Expression | null;
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
            defaultsValue = null,
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
        this.defaultsValue = defaultsValue;
        
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        if (defaultsValue) this.addChild(defaultsValue);
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
        const defaultsStr = this.defaultsValue ? ` defaults ${this.defaultsValue.toString()}` : "";
        const bodyStr = `\n${this.body.toString()}\nendmethod`;
        
        return `${staticStr}${stubStr}method ${operatorStr}${nameStr}${takesStr}${returnsStr}${defaultsStr}${bodyStr}`;
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

/**
 * 库声明
 */
class LibraryDeclaration extends Statement {
    public name: Identifier | null;
    public readonly members: Statement[];
    public readonly dependencies: Identifier[]; // requires/needs/uses 的依赖库列表
    public readonly initializer: Identifier | null; // initializer 函数名
    public readonly isLibraryOnce: boolean; // 是否是 library_once
    public readonly optionalDependencies: Set<string>; // optional 依赖库名称集合
    
    constructor(options?: {
        name?: Identifier | null;
        members?: Statement[];
        dependencies?: Identifier[];
        initializer?: Identifier | null;
        isLibraryOnce?: boolean;
        optionalDependencies?: Set<string> | string[];
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            members = [],
            dependencies = [],
            initializer = null,
            isLibraryOnce = false,
            optionalDependencies = [],
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.members = members;
        this.dependencies = dependencies;
        this.initializer = initializer;
        this.isLibraryOnce = isLibraryOnce;
        this.optionalDependencies = optionalDependencies instanceof Set 
            ? optionalDependencies 
            : new Set(optionalDependencies);
        
        if (name) this.addChild(name);
        if (initializer) this.addChild(initializer);
        dependencies.forEach(dep => this.addChild(dep));
        members.forEach(member => this.addChild(member));
    }
    
    public toString(): string {
        const keyword = this.isLibraryOnce ? "library_once" : "library";
        const nameStr = this.name ? this.name.toString() : "";
        const initStr = this.initializer ? ` initializer ${this.initializer.toString()}` : "";
        // 依赖关系使用 requires（虽然文档说 requires/needs/uses 等价，但 toString 统一使用 requires）
        const depsStr = this.dependencies.length > 0 
            ? ` requires ${this.dependencies.map(d => {
                const isOptional = this.optionalDependencies.has(d.toString());
                return `${isOptional ? "optional " : ""}${d.toString()}`;
            }).join(", ")}`
            : "";
        const membersStr = this.members.length > 0 ? 
            `\n${this.members.map(m => m.toString()).join("\n")}\n` : "";
        
        return `${keyword} ${nameStr}${initStr}${depsStr}${membersStr}endlibrary`;
    }
}

/**
 * 作用域声明
 */
class ScopeDeclaration extends Statement {
    public name: Identifier | null;
    public readonly members: Statement[];
    public readonly initializer: Identifier | null; // initializer 函数名
    
    constructor(options?: {
        name?: Identifier | null;
        members?: Statement[];
        initializer?: Identifier | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name = null,
            members = [],
            initializer = null,
            start,
            end
        } = options || {};
        
        super(start, end);
        this.name = name;
        this.members = members;
        this.initializer = initializer;
        
        if (name) this.addChild(name);
        if (initializer) this.addChild(initializer);
        members.forEach(member => this.addChild(member));
    }
    
    public toString(): string {
        const nameStr = this.name ? this.name.toString() : "";
        const initStr = this.initializer ? ` initializer ${this.initializer.toString()}` : "";
        const membersStr = this.members.length > 0 ? 
            `\n${this.members.map(m => m.toString()).join("\n")}\n` : "";
        
        return `scope ${nameStr}${initStr}${membersStr}endscope`;
    }
}

/**
 * Hook 语句
 * hook FunctionName HookFunctionName
 * hook FunctionName StructName.MethodName
 */
class HookStatement extends Statement {
    public readonly targetFunction: Identifier; // 被钩住的函数名（native/bj 函数、函数或静态方法）
    public readonly hookFunction: Identifier; // 钩子函数名（普通函数名）
    public readonly hookStruct: Identifier | null; // 钩子结构名（如果是 StructName.MethodName 格式）
    public readonly hookMethod: Identifier | null; // 钩子方法名（如果是 StructName.MethodName 格式）
    
    constructor(options: {
        targetFunction: Identifier;
        hookFunction?: Identifier;
        hookStruct?: Identifier | null;
        hookMethod?: Identifier | null;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            targetFunction,
            hookFunction,
            hookStruct = null,
            hookMethod = null,
            start,
            end
        } = options;
        
        super(start, end);
        
        this.targetFunction = targetFunction;
        // 如果提供了 hookFunction，使用它（普通函数格式）
        // 如果提供了 hookStruct 和 hookMethod，使用它们（结构方法格式）
        if (hookFunction) {
            this.hookFunction = hookFunction;
            this.hookStruct = null;
            this.hookMethod = null;
        } else if (hookStruct && hookMethod) {
            this.hookStruct = hookStruct;
            this.hookMethod = hookMethod;
            // 为了兼容性，hookFunction 也设置为 hookMethod
            this.hookFunction = hookMethod;
        } else {
            // 如果都不提供，使用 hookMethod 作为 hookFunction（向后兼容）
            if (hookMethod) {
                this.hookFunction = hookMethod;
                this.hookStruct = null;
                this.hookMethod = null;
            } else {
                throw new Error("HookStatement requires either hookFunction or both hookStruct and hookMethod");
            }
        }
        
        this.addChild(targetFunction);
        if (this.hookStruct && this.hookMethod) {
            this.addChild(this.hookStruct);
            this.addChild(this.hookMethod);
        } else {
            this.addChild(this.hookFunction);
        }
    }
    
    public toString(): string {
        const targetStr = this.targetFunction.toString();
        let hookStr: string;
        if (this.hookStruct && this.hookMethod) {
            hookStr = `${this.hookStruct.toString()}.${this.hookMethod.toString()}`;
        } else {
            hookStr = this.hookFunction.toString();
        }
        return `hook ${targetStr} ${hookStr}`;
    }
}

/**
 * Inject 语句（注入语句）
 * //! inject main/config ... //! endinject
 */
class InjectStatement extends Statement {
    public readonly injectType: "main" | "config"; // 注入类型
    public readonly content: string; // 注入内容（原始代码）
    
    constructor(options: {
        injectType: "main" | "config";
        content: string;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            injectType,
            content,
            start,
            end
        } = options;
        
        super(start, end);
        this.injectType = injectType;
        this.content = content;
    }
    
    public toString(): string {
        return `//! inject ${this.injectType}\n${this.content}\n//! endinject`;
    }
}

/**
 * LoadData 语句（SLK 加载语句）
 * //! loaddata "path.slk"
 */
class LoadDataStatement extends Statement {
    public readonly filePath: string; // SLK 文件路径
    
    constructor(options: {
        filePath: string;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            filePath,
            start,
            end
        } = options;
        
        super(start, end);
        this.filePath = filePath;
    }
    
    public toString(): string {
        return `//! loaddata "${this.filePath}"`;
    }
}

/**
 * TextMacro 语句（文本宏定义）
 * //! textmacro NAME takes param1, param2
 * ... body ...
 * //! endtextmacro
 */
class TextMacroStatement extends Statement {
    public readonly name: string; // 宏名称
    public readonly parameters: string[]; // 参数列表
    public readonly body: string[]; // 宏体内容（原始代码行）
    
    constructor(options: {
        name: string;
        parameters: string[];
        body: string[];
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name,
            parameters,
            body,
            start,
            end
        } = options;
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.body = body;
    }
    
    public toString(): string {
        const paramsStr = this.parameters.length > 0 
            ? ` takes ${this.parameters.join(', ')}` 
            : '';
        const bodyStr = this.body.join('\n');
        return `//! textmacro ${this.name}${paramsStr}\n${bodyStr}\n//! endtextmacro`;
    }
}

/**
 * RunTextMacro 语句（运行文本宏）
 * //! runtextmacro [optional] NAME(param1, param2)
 */
class RunTextMacroStatement extends Statement {
    public readonly name: string; // 宏名称
    public readonly parameters: string[]; // 参数列表
    public readonly optional: boolean; // 是否为可选宏
    
    constructor(options: {
        name: string;
        parameters: string[];
        optional?: boolean;
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            name,
            parameters,
            optional = false,
            start,
            end
        } = options;
        
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.optional = optional;
    }
    
    public toString(): string {
        const optionalStr = this.optional ? 'optional ' : '';
        const paramsStr = this.parameters.length > 0 
            ? `(${this.parameters.join(', ')})` 
            : '()';
        return `//! runtextmacro ${optionalStr}${this.name}${paramsStr}`;
    }
}

/**
 * ZincBlock 语句（Zinc 代码块）
 * //! zinc
 * ... zinc code ...
 * //! endzinc
 */
class ZincBlockStatement extends Statement {
    public readonly content: string; // Zinc 代码内容（原始代码）
    public readonly zincStatements: any[]; // 解析后的 Zinc AST 语句列表
    
    constructor(options: {
        content: string;
        zincStatements?: any[];
        start?: { line: number, position: number };
        end?: { line: number, position: number };
    }) {
        const {
            content,
            zincStatements = [],
            start,
            end
        } = options;
        
        super(start, end);
        this.content = content;
        this.zincStatements = zincStatements;
    }
    
    public toString(): string {
        return `//! zinc\n${this.content}\n//! endzinc`;
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
    TypecastExpression,
    BlockStatement,
    AssignmentStatement,
    CallStatement,
    IfStatement,
    LoopStatement,
    ExitWhenStatement,
    ReturnStatement,
    FunctionDeclaration,
    NativeDeclaration,
    FunctionInterfaceDeclaration,
    TypeDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    ModuleDeclaration,
    MethodDeclaration,
    ImplementStatement,
    DelegateDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    HookStatement,
    InjectStatement,
    LoadDataStatement,
    TextMacroStatement,
    RunTextMacroStatement,
    ZincBlockStatement,
    OperatorType
};

