/**
 * Zinc AST 节点类型定义
 * 基于 vJass AST，但适应 Zinc 的 C-like 语法
 */

import { ASTNode, Identifier, Expression } from './ast';
import { Position } from './loc';

/**
 * Zinc 代码块（使用 {} 而不是 BlockStatement）
 */
export class ZincBlock extends ASTNode {
    public statements: ZincStatement[] = [];

    constructor(statements: ZincStatement[] = [], start?: Position, end?: Position) {
        super(start, end);
        this.statements = statements;
        statements.forEach(stmt => this.addChild(stmt));
    }

    public toString(): string {
        return `{\n${this.statements.map(s => s.toString()).join('\n')}\n}`;
    }
}

/**
 * Zinc 语句基类
 */
export abstract class ZincStatement extends ASTNode {
    constructor(start?: Position, end?: Position) {
        super(start, end);
    }
}

/**
 * Zinc 库声明
 * library Name { ... }
 * library Name requires Lib1, Lib2 { ... }
 */
export class ZincLibraryDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public requirements: Identifier[] = [];
    public body: ZincBlock | null = null;
    public isPublic: boolean = false;
    public isPrivate: boolean = false;

    constructor(options?: {
        name?: Identifier | null;
        requirements?: Identifier[];
        body?: ZincBlock | null;
        isPublic?: boolean;
        isPrivate?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            requirements = [],
            body = null,
            isPublic = false,
            isPrivate = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.requirements = requirements;
        this.body = body;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        if (name) this.addChild(name);
        requirements.forEach(req => this.addChild(req));
        if (body) this.addChild(body);
    }

    public toString(): string {
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const nameStr = this.name ? this.name.toString() : '';
        const reqStr = this.requirements.length > 0 
            ? ` requires ${this.requirements.map(r => r.toString()).join(', ')}` 
            : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `${publicStr}${privateStr}library ${nameStr}${reqStr} ${bodyStr}`;
    }
}

/**
 * Zinc 函数声明
 * function name(args) -> returnType { ... }
 * function name(args) { ... }
 */
export class ZincFunctionDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public parameters: ZincParameter[] = [];
    public returnType: Identifier | null = null;
    public body: ZincBlock | null = null;
    public isPublic: boolean = false;
    public isPrivate: boolean = false;

    constructor(options?: {
        name?: Identifier | null;
        parameters?: ZincParameter[];
        returnType?: Identifier | null;
        body?: ZincBlock | null;
        isPublic?: boolean;
        isPrivate?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            body = null,
            isPublic = false,
            isPrivate = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        if (body) this.addChild(body);
    }

    public toString(): string {
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const nameStr = this.name ? this.name.toString() : '';
        const paramsStr = this.parameters.map(p => p.toString()).join(', ');
        const returnStr = this.returnType ? ` -> ${this.returnType.toString()}` : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `${publicStr}${privateStr}function ${nameStr}(${paramsStr})${returnStr} ${bodyStr}`;
    }
}

/**
 * Zinc 函数参数
 * type name
 */
export class ZincParameter extends ASTNode {
    public type: Identifier | null = null;
    public name: Identifier | null = null;

    constructor(type: Identifier | null, name: Identifier | null, start?: Position, end?: Position) {
        super(start, end);
        this.type = type;
        this.name = name;
        if (type) this.addChild(type);
        if (name) this.addChild(name);
    }

    public toString(): string {
        const typeStr = this.type ? this.type.toString() : '';
        const nameStr = this.name ? this.name.toString() : '';
        return `${typeStr} ${nameStr}`;
    }
}

/**
 * Zinc 变量声明
 * type name;
 * type name = value;
 * type name[];
 * type name[SIZE];
 * type name[SIZE1][SIZE2];
 */
export class ZincVariableDeclaration extends ZincStatement {
    public type: Identifier | null = null;
    public name: Identifier | null = null;
    public initialValue: Expression | null = null;
    public isConstant: boolean = false;
    public isPublic: boolean = false;
    public isPrivate: boolean = false;
    public arraySizes: (number | Identifier)[] = []; // 数组维度大小

    constructor(options?: {
        type?: Identifier | null;
        name?: Identifier | null;
        initialValue?: Expression | null;
        isConstant?: boolean;
        isPublic?: boolean;
        isPrivate?: boolean;
        arraySizes?: (number | Identifier)[];
        start?: Position;
        end?: Position;
    }) {
        const {
            type = null,
            name = null,
            initialValue = null,
            isConstant = false,
            isPublic = false,
            isPrivate = false,
            arraySizes = [],
            start,
            end
        } = options || {};
        super(start, end);
        this.type = type;
        this.name = name;
        this.initialValue = initialValue;
        this.isConstant = isConstant;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        this.arraySizes = arraySizes;
        if (type) this.addChild(type);
        if (name) this.addChild(name);
        if (initialValue) this.addChild(initialValue);
        arraySizes.forEach(size => {
            if (size instanceof ASTNode) this.addChild(size);
        });
    }

    public toString(): string {
        const constStr = this.isConstant ? 'constant ' : '';
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const typeStr = this.type ? this.type.toString() : '';
        const nameStr = this.name ? this.name.toString() : '';
        let arrayStr = '';
        if (this.arraySizes.length === 0) {
            arrayStr = '';
        } else if (this.arraySizes.length === 1 && this.arraySizes[0] === undefined) {
            arrayStr = '[]';
        } else {
            arrayStr = this.arraySizes.map(size => 
                size === undefined ? '[]' : `[${size}]`
            ).join('');
        }
        const initStr = this.initialValue ? ` = ${this.initialValue.toString()}` : '';
        return `${publicStr}${privateStr}${constStr}${typeStr} ${nameStr}${arrayStr}${initStr};`;
    }
}

/**
 * Zinc 结构体声明
 * struct Name { ... }
 * struct[Size] Name { ... }
 */
export class ZincStructDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public storageSize: number | Identifier | null = null; // 存储空间大小 struct[Size] Name
    public arraySize: number | Identifier | null = null; // 数组结构大小 struct Name[] 或 struct Name[Size]
    public isArrayStruct: boolean = false; // 是否为数组结构
    public members: (ZincVariableDeclaration | ZincMethodDeclaration)[] = [];
    public isPublic: boolean = false;
    public isPrivate: boolean = false;

    constructor(options?: {
        name?: Identifier | null;
        storageSize?: number | Identifier | null;
        arraySize?: number | Identifier | null;
        isArrayStruct?: boolean;
        members?: (ZincVariableDeclaration | ZincMethodDeclaration)[];
        isPublic?: boolean;
        isPrivate?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            storageSize = null,
            arraySize = null,
            isArrayStruct = false,
            members = [],
            isPublic = false,
            isPrivate = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.storageSize = storageSize;
        this.arraySize = arraySize;
        this.isArrayStruct = isArrayStruct;
        this.members = members;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        if (name) this.addChild(name);
        if (storageSize instanceof ASTNode) this.addChild(storageSize);
        if (arraySize instanceof ASTNode) this.addChild(arraySize);
        members.forEach(member => this.addChild(member));
    }

    public toString(): string {
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const nameStr = this.name ? this.name.toString() : '';
        const storageSizeStr = this.storageSize 
            ? `[${this.storageSize}]` 
            : '';
        const arraySizeStr = this.isArrayStruct
            ? (this.arraySize === null ? '[]' : `[${this.arraySize}]`)
            : '';
        const membersStr = this.members.map(m => m.toString()).join('\n');
        return `${publicStr}${privateStr}struct${storageSizeStr} ${nameStr}${arraySizeStr} {\n${membersStr}\n}`;
    }
}

/**
 * Zinc 接口声明
 * interface Name { ... }
 * interface[Size] Name { ... }
 */
export class ZincInterfaceDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public storageSize: number | Identifier | null = null;
    public members: (ZincVariableDeclaration | ZincMethodDeclaration)[] = [];
    public isPublic: boolean = false;
    public isPrivate: boolean = false;

    constructor(options?: {
        name?: Identifier | null;
        storageSize?: number | Identifier | null;
        members?: (ZincVariableDeclaration | ZincMethodDeclaration)[];
        isPublic?: boolean;
        isPrivate?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            storageSize = null,
            members = [],
            isPublic = false,
            isPrivate = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.storageSize = storageSize;
        this.members = members;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        if (name) this.addChild(name);
        if (storageSize instanceof ASTNode) this.addChild(storageSize);
        members.forEach(member => this.addChild(member));
    }

    public toString(): string {
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const nameStr = this.name ? this.name.toString() : '';
        const sizeStr = this.storageSize 
            ? `[${this.storageSize}]` 
            : '';
        const membersStr = this.members.map(m => m.toString()).join('\n');
        return `${publicStr}${privateStr}interface${sizeStr} ${nameStr} {\n${membersStr}\n}`;
    }
}

/**
 * Zinc 方法声明（用于结构体和接口）
 * method name(args) -> returnType { ... }
 */
export class ZincMethodDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public parameters: ZincParameter[] = [];
    public returnType: Identifier | null = null;
    public body: ZincBlock | null = null;
    public isStatic: boolean = false;
    public isPublic: boolean = false;
    public isPrivate: boolean = false;

    constructor(options?: {
        name?: Identifier | null;
        parameters?: ZincParameter[];
        returnType?: Identifier | null;
        body?: ZincBlock | null;
        isStatic?: boolean;
        isPublic?: boolean;
        isPrivate?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            parameters = [],
            returnType = null,
            body = null,
            isStatic = false,
            isPublic = false,
            isPrivate = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        this.isStatic = isStatic;
        this.isPublic = isPublic;
        this.isPrivate = isPrivate;
        if (name) this.addChild(name);
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        if (body) this.addChild(body);
    }

    public toString(): string {
        const staticStr = this.isStatic ? 'static ' : '';
        const publicStr = this.isPublic ? 'public ' : '';
        const privateStr = this.isPrivate ? 'private ' : '';
        const nameStr = this.name ? this.name.toString() : '';
        const paramsStr = this.parameters.map(p => p.toString()).join(', ');
        const returnStr = this.returnType ? ` -> ${this.returnType.toString()}` : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `${publicStr}${privateStr}${staticStr}method ${nameStr}(${paramsStr})${returnStr} ${bodyStr}`;
    }
}

/**
 * Zinc If 语句
 * if (condition) { ... } else { ... }
 */
export class ZincIfStatement extends ZincStatement {
    public condition: Expression | null = null;
    public thenBlock: ZincBlock | null = null;
    public elseBlock: ZincBlock | null = null;

    constructor(options?: {
        condition?: Expression | null;
        thenBlock?: ZincBlock | null;
        elseBlock?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            condition = null,
            thenBlock = null,
            elseBlock = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
        if (condition) this.addChild(condition);
        if (thenBlock) this.addChild(thenBlock);
        if (elseBlock) this.addChild(elseBlock);
    }

    public toString(): string {
        const condStr = this.condition ? this.condition.toString() : '';
        const thenStr = this.thenBlock ? this.thenBlock.toString() : '{}';
        const elseStr = this.elseBlock ? ` else ${this.elseBlock.toString()}` : '';
        return `if (${condStr}) ${thenStr}${elseStr}`;
    }
}

/**
 * Zinc While 语句
 * while (condition) { ... }
 */
export class ZincWhileStatement extends ZincStatement {
    public condition: Expression | null = null;
    public body: ZincBlock | null = null;

    constructor(options?: {
        condition?: Expression | null;
        body?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            condition = null,
            body = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.condition = condition;
        this.body = body;
        if (condition) this.addChild(condition);
        if (body) this.addChild(body);
    }

    public toString(): string {
        const condStr = this.condition ? this.condition.toString() : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `while (${condStr}) ${bodyStr}`;
    }
}

/**
 * Zinc For 语句
 * for (range) { ... }
 * for (init; condition; update) { ... }
 */
export class ZincForStatement extends ZincStatement {
    public range: ZincForRange | null = null; // 范围语法：0 <= i < 10
    public init: Expression | null = null; // C-like 语法：初始化
    public condition: Expression | null = null; // C-like 语法：条件
    public update: Expression | null = null; // C-like 语法：更新
    public body: ZincBlock | null = null;

    constructor(options?: {
        range?: ZincForRange | null;
        init?: Expression | null;
        condition?: Expression | null;
        update?: Expression | null;
        body?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            range = null,
            init = null,
            condition = null,
            update = null,
            body = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.range = range;
        this.init = init;
        this.condition = condition;
        this.update = update;
        this.body = body;
        if (range) this.addChild(range);
        if (init) this.addChild(init);
        if (condition) this.addChild(condition);
        if (update) this.addChild(update);
        if (body) this.addChild(body);
    }

    public toString(): string {
        let forStr = '';
        if (this.range) {
            forStr = this.range.toString();
        } else {
            const initStr = this.init ? this.init.toString() : '';
            const condStr = this.condition ? this.condition.toString() : '';
            const updateStr = this.update ? this.update.toString() : '';
            forStr = `${initStr}; ${condStr}; ${updateStr}`;
        }
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `for (${forStr}) ${bodyStr}`;
    }
}

/**
 * Zinc For 范围表达式
 * 0 <= i < 10
 */
export class ZincForRange extends ASTNode {
    public startValue: Expression | null = null;
    public variable: Identifier | null = null;
    public endValue: Expression | null = null;
    public isInclusive: boolean = false; // true for <=, false for <

    constructor(options?: {
        startValue?: Expression | null;
        variable?: Identifier | null;
        endValue?: Expression | null;
        isInclusive?: boolean;
        start?: Position;
        end?: Position;
    }) {
        const {
            startValue = null,
            variable = null,
            endValue = null,
            isInclusive = false,
            start,
            end
        } = options || {};
        super(start, end);
        this.startValue = startValue;
        this.variable = variable;
        this.endValue = endValue;
        this.isInclusive = isInclusive;
        if (startValue) this.addChild(startValue);
        if (variable) this.addChild(variable);
        if (endValue) this.addChild(endValue);
    }

    public toString(): string {
        const startStr = this.startValue ? this.startValue.toString() : '';
        const varStr = this.variable ? this.variable.toString() : '';
        const endStr = this.endValue ? this.endValue.toString() : '';
        const opStr = this.isInclusive ? '<=' : '<';
        return `${startStr} ${opStr} ${varStr} ${opStr} ${endStr}`;
    }
}

/**
 * Zinc Break 语句
 * break;
 */
export class ZincBreakStatement extends ZincStatement {
    constructor(start?: Position, end?: Position) {
        super(start, end);
    }

    public toString(): string {
        return 'break;';
    }
}

/**
 * Zinc Return 语句
 * return;
 * return value;
 */
export class ZincReturnStatement extends ZincStatement {
    public value: Expression | null = null;

    constructor(value: Expression | null = null, start?: Position, end?: Position) {
        super(start, end);
        this.value = value;
        if (value) this.addChild(value);
    }

    public toString(): string {
        return this.value ? `return ${this.value.toString()};` : 'return;';
    }
}

/**
 * Zinc 赋值语句
 * variable = value;
 */
export class ZincAssignmentStatement extends ZincStatement {
    public target: Expression | null = null;
    public value: Expression | null = null;
    public operator: string = '='; // =, +=, -=, *=, /=

    constructor(options?: {
        target?: Expression | null;
        value?: Expression | null;
        operator?: string;
        start?: Position;
        end?: Position;
    }) {
        const {
            target = null,
            value = null,
            operator = '=',
            start,
            end
        } = options || {};
        super(start, end);
        this.target = target;
        this.value = value;
        this.operator = operator;
        if (target) this.addChild(target);
        if (value) this.addChild(value);
    }

    public toString(): string {
        const targetStr = this.target ? this.target.toString() : '';
        const valueStr = this.value ? this.value.toString() : '';
        return `${targetStr} ${this.operator} ${valueStr};`;
    }
}

/**
 * Zinc 函数调用语句
 * functionName(args);
 */
export class ZincCallStatement extends ZincStatement {
    public expression: Expression | null = null;

    constructor(expression: Expression | null = null, start?: Position, end?: Position) {
        super(start, end);
        this.expression = expression;
        if (expression) this.addChild(expression);
    }

    public toString(): string {
        return this.expression ? `${this.expression.toString()};` : ';';
    }
}

/**
 * Zinc Debug 语句
 * debug { ... }
 */
export class ZincDebugStatement extends ZincStatement {
    public body: ZincBlock | null = null;

    constructor(body: ZincBlock | null = null, start?: Position, end?: Position) {
        super(start, end);
        this.body = body;
        if (body) this.addChild(body);
    }

    public toString(): string {
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `debug ${bodyStr}`;
    }
}

/**
 * Zinc Static If 语句
 * static if (condition) { ... } else { ... }
 */
export class ZincStaticIfStatement extends ZincStatement {
    public condition: Expression | null = null;
    public thenBlock: ZincBlock | null = null;
    public elseBlock: ZincBlock | null = null;

    constructor(options?: {
        condition?: Expression | null;
        thenBlock?: ZincBlock | null;
        elseBlock?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            condition = null,
            thenBlock = null,
            elseBlock = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
        if (condition) this.addChild(condition);
        if (thenBlock) this.addChild(thenBlock);
        if (elseBlock) this.addChild(elseBlock);
    }

    public toString(): string {
        const condStr = this.condition ? this.condition.toString() : '';
        const thenStr = this.thenBlock ? this.thenBlock.toString() : '{}';
        const elseStr = this.elseBlock ? ` else ${this.elseBlock.toString()}` : '';
        return `static if (${condStr}) ${thenStr}${elseStr}`;
    }
}

/**
 * Zinc 类型声明（动态数组、函数指针等）
 * type Name extends BaseType[Size];
 * type Name extends function(args) -> returnType;
 */
export class ZincTypeDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public baseType: Identifier | null = null;
    public extendsType: Identifier | null = null;
    public arraySize: number | Identifier | null = null;
    public storageSize: number | Identifier | null = null; // 动态数组的存储大小
    public functionSignature: ZincFunctionSignature | null = null; // 函数指针类型

    constructor(options?: {
        name?: Identifier | null;
        baseType?: Identifier | null;
        extendsType?: Identifier | null;
        arraySize?: number | Identifier | null;
        storageSize?: number | Identifier | null;
        functionSignature?: ZincFunctionSignature | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            baseType = null,
            extendsType = null,
            arraySize = null,
            storageSize = null,
            functionSignature = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.baseType = baseType;
        this.extendsType = extendsType;
        this.arraySize = arraySize;
        this.storageSize = storageSize;
        this.functionSignature = functionSignature;
        if (name) this.addChild(name);
        if (baseType) this.addChild(baseType);
        if (extendsType) this.addChild(extendsType);
        if (arraySize instanceof ASTNode) this.addChild(arraySize);
        if (storageSize instanceof ASTNode) this.addChild(storageSize);
        if (functionSignature) this.addChild(functionSignature);
    }

    public toString(): string {
        const nameStr = this.name ? this.name.toString() : '';
        if (this.functionSignature) {
            return `type ${nameStr} extends ${this.functionSignature.toString()};`;
        }
        const baseStr = this.baseType ? this.baseType.toString() : '';
        const extendsStr = this.extendsType ? ` extends ${this.extendsType.toString()}` : '';
        let sizeStr = '';
        if (this.arraySize !== null) {
            sizeStr = `[${this.arraySize}]`;
        }
        if (this.storageSize !== null) {
            sizeStr += `, ${this.storageSize}`;
        }
        return `type ${nameStr} extends ${baseStr}${extendsStr}${sizeStr};`;
    }
}

/**
 * Zinc 函数签名（用于函数指针类型）
 * function(args) -> returnType
 */
export class ZincFunctionSignature extends ASTNode {
    public parameters: ZincParameter[] = [];
    public returnType: Identifier | null = null;

    constructor(parameters: ZincParameter[] = [], returnType: Identifier | null = null, start?: Position, end?: Position) {
        super(start, end);
        this.parameters = parameters;
        this.returnType = returnType;
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
    }

    public toString(): string {
        const paramsStr = this.parameters.map(p => p.toString()).join(', ');
        const returnStr = this.returnType ? ` -> ${this.returnType.toString()}` : '';
        return `function(${paramsStr})${returnStr}`;
    }
}

/**
 * Zinc 模块声明
 * module Name { ... }
 */
export class ZincModuleDeclaration extends ZincStatement {
    public name: Identifier | null = null;
    public body: ZincBlock | null = null;

    constructor(options?: {
        name?: Identifier | null;
        body?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            name = null,
            body = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.name = name;
        this.body = body;
        if (name) this.addChild(name);
        if (body) this.addChild(body);
    }

    public toString(): string {
        const nameStr = this.name ? this.name.toString() : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `module ${nameStr} ${bodyStr}`;
    }
}

/**
 * Zinc 匿名函数
 * function(args) -> returnType { ... }
 */
export class ZincAnonymousFunction extends Expression {
    public parameters: ZincParameter[] = [];
    public returnType: Identifier | null = null;
    public body: ZincBlock | null = null;

    constructor(options?: {
        parameters?: ZincParameter[];
        returnType?: Identifier | null;
        body?: ZincBlock | null;
        start?: Position;
        end?: Position;
    }) {
        const {
            parameters = [],
            returnType = null,
            body = null,
            start,
            end
        } = options || {};
        super(start, end);
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
        parameters.forEach(param => this.addChild(param));
        if (returnType) this.addChild(returnType);
        if (body) this.addChild(body);
    }

    public getType(): string | null {
        return this.returnType ? this.returnType.name : 'code';
    }

    public toString(): string {
        const paramsStr = this.parameters.map(p => p.toString()).join(', ');
        const returnStr = this.returnType ? ` -> ${this.returnType.toString()}` : '';
        const bodyStr = this.body ? this.body.toString() : '{}';
        return `function(${paramsStr})${returnStr} ${bodyStr}`;
    }
}

/**
 * Zinc 程序（顶级节点）
 */
export class ZincProgram extends ASTNode {
    public declarations: ZincStatement[] = [];

    constructor(declarations: ZincStatement[] = [], start?: Position, end?: Position) {
        super(start, end);
        this.declarations = declarations;
        declarations.forEach(decl => this.addChild(decl));
    }

    public toString(): string {
        return this.declarations.map(d => d.toString()).join('\n\n');
    }
}

