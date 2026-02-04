import * as path from "path";
import * as fs from "fs";
import { Document,  Token, TokenType, ASTVisitor} from "./tokenizer-common";
import { Position, Range } from "./loc";
import { Check } from "./check";
// @deprecated jass 目录与 vjass 目录将彻底解耦，此依赖将在未来版本中移除
import { TextMacro } from "../vjass/text-macro";
// @deprecated jass 目录与 vjass 目录将彻底解耦，此依赖将在未来版本中移除
import { Define } from "../vjass/preprocess";
// import { VjassModule } from "../vjass/ast"; // 已删除ast.ts

/**
 * AST节点类型检查工具类
 * 用于替代instanceof检查，避免继承关系导致的类型判断问题
 */
export class ASTNodeTypeChecker {
    /**
     * 检查节点是否为Native类型
     */
    static isNative(node: any): node is Native {
        return node && node.nodeType === 'Native';
    }

    /**
     * 检查节点是否为Func类型（不包括Method）
     */
    static isFunc(node: any): node is Func {
        return node && node.nodeType === 'Func';
    }

    /**
     * 检查节点是否为Method类型
     */
    static isMethod(node: any): node is Method {
        return node && node.nodeType === 'Method';
    }

    /**
     * 检查节点是否为zinc.Func类型
     */
    static isZincFunc(node: any): node is zinc.Func {
        return node && node.nodeType === 'zinc.Func';
    }

    /**
     * 检查节点是否为zinc.Method类型
     */
    static isZincMethod(node: any): node is zinc.Method {
        return node && node.nodeType === 'zinc.Method';
    }

    /**
     * 检查节点是否为任何Func类型（包括Method）
     */
    static isAnyFunc(node: any): node is Func | Method | zinc.Func | zinc.Method {
        return this.isFunc(node) || this.isMethod(node) || this.isZincFunc(node) || this.isZincMethod(node);
    }

    /**
     * 检查节点是否为任何Method类型
     */
    static isAnyMethod(node: any): node is Method | zinc.Method {
        return this.isMethod(node) || this.isZincMethod(node);
    }

    /**
     * 检查节点是否为任何Native类型（包括Func和Method）
     */
    static isAnyNative(node: any): node is Native | Func | Method {
        return this.isNative(node) || this.isFunc(node) || this.isMethod(node);
    }
}

/**
 * 全局上下文管理器 - 管理文档实例的存储和检索
 */
export class Context {

    private _keys: string[] = [];
    private _documents: Document[] = [];

    /**
     * 处理文件路径，标准化路径格式
     * @param key 原始文件路径
     * @returns 标准化后的文件路径
     */
    private handle_key(key: string): string {
        const parsed = path.parse(key);
        return path.resolve(parsed.dir, parsed.base);
    }

    /**
     * 设置文档实例
     * @param key 文件路径
     * @param value 文档实例
     */
    public set(key: string, value: Document): void {
        const handle_key = this.handle_key(key);
        const index = this._keys.indexOf(handle_key);
        if (index === -1) {
            this._keys.push(handle_key);
            this._documents.push(value);
        } else {
            this._documents[index] = value;
        }
    }

    /**
     * 获取键在数组中的索引
     * @param key 文件路径
     * @returns 索引位置，如果不存在返回 -1
     */
    private indexOf(key: string): number {
        return this._keys.indexOf(this.handle_key(key));
    }

    /**
     * 检查是否存在指定的文档
     * @param key 文件路径
     * @returns 是否存在
     */
    public has(key: string): boolean {
        return this.indexOf(key) !== -1;
    }

    /**
     * 获取文档实例
     * @param key 文件路径
     * @returns 文档实例，如果不存在返回 undefined
     */
    public get(key: string): Document | undefined {
        if (this.has(key)) {
            const index = this.indexOf(key);
            return this._documents[index];
        }
        return undefined;
    }

    /**
     * 删除文档实例
     * @param key 文件路径
     */
    public delete(key: string): void {
        const index = this.indexOf(key);
        if (index !== -1) {
            this._keys.splice(index, 1);
            this._documents.splice(index, 1);
        }
    }

    /**
     * 获取所有键
     * @returns 所有文件路径数组
     */
    public get keys(): string[] {
        return this._keys;
    }

    public get_strcut_by_name(name: string):(Struct|zinc.Struct)[] {
        const structs:(Struct|zinc.Struct)[] = [];

        this._documents.forEach(document => {
            structs.push(...document.get_struct_by_name(name));
        });

        return structs;
    }
    public get_interface_by_name(name: string):(Interface|zinc.Interface)[] {
        const interfaces:(Interface|zinc.Interface)[] = [];

        this._documents.forEach(document => {
            interfaces.push(...document.get_interface_by_name(name));
        });

        return interfaces;
    }
    public get_strcut_by_extends_name(name: string):(Struct|zinc.Struct)[] {
        const structs:(Struct|zinc.Struct)[] = [];

        this._documents.forEach(document => {
            structs.push(...document.get_struct_by_extends_name(name));
        });

        return structs;
    }
    public get_interface_by_extends_name(name: string):(Interface|zinc.Interface)[] {
        const interfaces:(Interface|zinc.Interface)[] = [];

        this._documents.forEach(document => {
            interfaces.push(...document.get_interface_by_extends_name(name));
        });

        return interfaces;
    }

    public get_structs():(Struct|zinc.Struct)[] {
        const structs:(Struct|zinc.Struct)[] = [];

        this._documents.forEach(document => {
            structs.push(...document.get_all_structs());
        });

        return structs;
    }
    public get_interfaces():(Interface|zinc.Interface)[] {
        const objects:(Interface|zinc.Interface)[] = [];

        this._documents.forEach(document => {
            objects.push(...document.get_all_interfaces());
        });

        return objects;
    }

    public get_native_and_func_and_method_by_name(name: string):(Func|Native|Method|zinc.Func|zinc.Method)[] {
        const funcs:(Func|Native|Method|zinc.Func|zinc.Method)[] = [];

        this._documents.forEach(document => {
            funcs.push(...document.get_native_and_func_and_method_by_name(name));
        });

        return funcs;
    }

    public get_func_by_name(name: string):(Func|zinc.Func)[] {
        const funcs:(Func|zinc.Func)[] = [];
        this._documents.forEach(document => {
            funcs.push(...document.get_func_by_name(name));
        });
        return funcs;
    }

    public get_module_by_name(name: string): Module[] {
        const modules: Module[] = [];

        this._documents.forEach(document => {
            modules.push(...document.get_module_by_name(name));
        });

        return modules;
    }

    public get_natives_by_type(type: "nothing"|string):(Native)[] {
        const natives:(Native)[] = [];

        this._documents.forEach(document => {
            document.accept({
                visitNative: (node) => {
                    if (node.returns) {
                        if (node.returns.getText() === type) {
                            natives.push(node);
                        }
                    } else {
                        if (type === "nothing") {
                            natives.push(node);
                        }
                    }
                }
            });
        });

        return natives;
    }
    public get_funcs_by_type(type: "nothing"|string):(Func|zinc.Func)[] {
        const funcs:(Func|zinc.Func)[] = [];

        this._documents.forEach(document => {
            document.accept({
                visitFunc: (node) => {
                    if (node.returns) {
                        if (node.returns.getText() === type) {
                            funcs.push(node);
                        }
                    }
                }
            });
        });

        return funcs;
    }

    public get_global_variables():(GlobalVariable|zinc.Member)[] {
        const globalVariables:(GlobalVariable|zinc.Member)[] = [];

        this._documents.forEach(document => {
            globalVariables.push(...document.get_all_global_variables());
        });

        return globalVariables;
    }

    public get_global_variables_by_type(type: "nothing"|string):(GlobalVariable|zinc.Member)[] {
        const globalVariables:(GlobalVariable|zinc.Member)[] = [];

        this._documents.forEach(document => {
            document.accept({
                visitGlobalVariable: (node) => {
                    if (node instanceof GlobalVariable) {
                        if (node.type) {
                            if (node.type.getText() === type) {
                                globalVariables.push(node);
                            }
                        } else {
                            if (type === "nothing") {
                                globalVariables.push(node);
                            }
                        }
                    } else {
                        if (node.parent && !(node.parent instanceof zinc.Struct)) {
                            if (node.type) {
                                if (node.type.getText() === type) {
                                    globalVariables.push(node);
                                }
                            } else {
                                if (type === "nothing") {
                                    globalVariables.push(node);
                                }
                            }
                        }
                    }
                }
            });
        });

        return globalVariables;
    }

    public get_natives():Native[] {
        const natives:Native[] = [];
        this._documents.forEach(document => {
            document.get_all_natives().forEach(native => {
                natives.push(native);
            });
        });
        return natives;
    }

    public get_functions():(Func|zinc.Func)[] {
        const functions:(Func|zinc.Func)[] = [];
        this._documents.forEach(document => {
            document.get_all_functions().forEach(func => {
                functions.push(func);
            });
        });
        return functions;
    }

    public get_types():Type[] {
        const types:Type[] = [];
        this._documents.forEach(document => {
            types.push(...document.get_all_types());
        });
        return types;
    }

    public get_functions_by_name(name: string):(Func|zinc.Func)[] {
        const funcs:(Func|zinc.Func)[] = [];
        this._documents.forEach(document => {
            document.accept({
                visitFunc: (node) => {
                    if (node.name && node.name.getText() === name) {
                        funcs.push(node);
                    }
                }
            });
        });
        return funcs;
    }

    public get_natives_by_name(name: string):(Native)[] {
        const natives:(Native)[] = [];
        this._documents.forEach(document => {
            document.accept({
                visitNative: (node) => {
                    if (node.name && node.name.getText() === name) {
                        natives.push(node);
                    }
                }
            });
        });
        return natives;
    }

    public get_global_variables_by_name(name: string):(GlobalVariable|zinc.Member)[] {
        const globalVariables:(GlobalVariable|zinc.Member)[] = [];
        this._documents.forEach(document => {
            document.accept({
                visitGlobalVariable: (node) => {
                    if (node.name && node.name.getText() === name) {
                        globalVariables.push(node);
                    }
                }
            });
        });
        return globalVariables;
    }

    public get_structs_by_name(name: string):(Struct|zinc.Struct)[] {
        const structs:(Struct|zinc.Struct)[] = [];
        this._documents.forEach(document => {
            document.accept({
                visitStruct: (node) => {
                    if (node.name && node.name.getText() === name) {
                        structs.push(node);
                    }
                }
            });
        });
        return structs;
    }


    get_modules() {
        const modules: Module[] = [];
        this._documents.forEach(document => {
            modules.push(...document.get_all_modules());
        });
        return modules;
    }

    get_delegates(): Delegate[] {
        const delegates: Delegate[] = [];
        this._documents.forEach(document => {
            delegates.push(...document.get_all_delegates());
        });
        return delegates;
    }

    get_text_macros():TextMacro[] {
        const textMacros:TextMacro[] = [];
        this._documents.forEach(document => {
            textMacros.push(...document.textMacros);
        });
        return textMacros;
    }

    get_defines(): Define[] {
        const defines: Define[] = [];
        this._documents.forEach(document => {
            defines.push(...document.defines);
        });
        return defines;
    }
}

export const GlobalContext = new Context();

/**
 * 操作符优先级定义
 * 数字越小优先级越高
 */
export const OPERATOR_PRECEDENCE: { [key: string]: number } = {
    // 圆括号（最高优先级）
    '(': 0,
    ')': 0,
    
    // 自增自减运算符
    '++': 1,
    '--': 1,
    
    // 单目运算符（正负号）
    'unary+': 2,  // 一元正号
    'unary-': 2,  // 一元负号
    'not': 2,
    '!': 2,
    
    // 乘法除法
    '*': 3,
    '/': 3,
    '%': 3,
    
    // 加法减法
    '+': 4,  // 二元加法
    '-': 4,  // 二元减法
    
    // 关系运算符
    '<': 5,
    '>': 5,
    '<=': 5,
    '>=': 5,
    '==': 5,
    '!=': 5,
    
    // 逻辑运算符
    'and': 6,
    '&&': 6,
    'or': 7,
    '||': 7,
    
    // 赋值运算符（最低优先级）
    '=': 8,
    '+=': 8,
    '-=': 8,
    '*=': 8,
    '/=': 8,
    '%=': 8
};

/**
 * 检查操作符是否为右结合
 */
export function isRightAssociative(op: string): boolean {
    return ['=', '+=', '-=', '*=', '/=', '%='].includes(op);
}

/**
 * 类型推断器 - 负责为表达式和变量名推断类型
 */
export class TypeInferencer {
    private globalContext: Context;

    constructor(globalContext: Context = GlobalContext) {
        this.globalContext = globalContext;
    }

    /**
     * 为表达式推断类型
     */
    public inferExpressionType(expr: Expr): string {
        if (expr instanceof Value) {
            return this.inferValueType(expr);
        } else if (expr instanceof BinaryExpr) {
            return this.inferBinaryExprType(expr);
        } else if (expr instanceof UnaryExpr) {
            return this.inferUnaryExprType(expr);
        } else if (expr instanceof PriorityExpr) {
            return this.inferPriorityExprType(expr);
        } else if (expr instanceof Id) {
            return this.inferIdType(expr);
        } else if (expr instanceof VariableName) {
            return this.inferVariableNameType(expr);
        } else if (expr instanceof MemberAccess) {
            return this.inferMemberAccessType(expr);
        } else if (expr instanceof FunctionExpr) {
            return this.inferFunctionExprType(expr);
        }
        return "unknown";
    }

    /**
     * 推断值表达式的类型
     */
    private inferValueType(value: Value): string {
        if (!value.value) return "unknown";
        
        const token = value.value;
        if (token.type === TokenType.String) {
            return "string";
        } else if (token.type === TokenType.Integer) {
            return "integer";
        } else if (token.type === TokenType.Real) {
            return "real";
        } else if (token.type === TokenType.Mark) {
            return "integer";
        } else if (token.type === TokenType.EmbeddedToken) {
            return "string";
        } else if (token.type === TokenType.Identifier) {
            const text = token.getText();
            if (text === "true" || text === "false") {
                return "boolean";
            }
        }
        return "unknown";
    }

    /**
     * 推断二元表达式的类型
     */
    private inferBinaryExprType(binaryExpr: BinaryExpr): string {
        if (!binaryExpr.left || !binaryExpr.right || !binaryExpr.op) {
            return "unknown";
        }

        const leftType = this.inferExpressionType(binaryExpr.left);
        const rightType = this.inferExpressionType(binaryExpr.right);
        const opText = binaryExpr.op.getText();

        // 算术运算符
        if (['+', '-', '*', '/'].includes(opText)) {
            if (leftType === "real" || rightType === "real") {
                return "real";
            } else if (leftType === "integer" && rightType === "integer") {
                return "integer";
            }
        }
        // 比较运算符
        else if (['==', '!=', '<', '>', '<=', '>='].includes(opText)) {
            return "boolean";
        }
        // 逻辑运算符
        else if (['and', 'or'].includes(opText)) {
            return "boolean";
        }

        return "unknown";
    }

    /**
     * 推断一元表达式的类型
     */
    private inferUnaryExprType(unaryExpr: UnaryExpr): string {
        if (!unaryExpr.value || !unaryExpr.op) {
            return "unknown";
        }

        const valueType = this.inferExpressionType(unaryExpr.value);
        const opText = unaryExpr.op.getText();

        // 逻辑非运算符
        if (opText === 'not' || opText === '!') {
            return "boolean";
        }
        // 算术运算符 + 和 -
        else if (opText === '+' || opText === '-') {
            return valueType; // 保持原类型
        }

        return "unknown";
    }

    /**
     * 推断优先级表达式的类型
     */
    private inferPriorityExprType(priorityExpr: PriorityExpr): string {
        return priorityExpr.expr ? this.inferExpressionType(priorityExpr.expr) : "unknown";
    }

    /**
     * 推断标识符的类型
     */
    private inferIdType(id: Id): string {
        if (!id.expr) return "unknown";
        
        const name = id.expr.getText();
        
        // 查找局部变量
        const localType = this.findLocalVariableType(name, id);
        if (localType !== "unknown") return localType;
        
        // 查找 take 变量
        const takeType = this.findTakeVariableType(name, id);
        if (takeType !== "unknown") return takeType;
        
        // 查找全局变量
        const globalType = this.findGlobalVariableType(name);
        if (globalType !== "unknown") return globalType;
        
        // 查找结构体
        const structType = this.findStructType(name);
        if (structType !== "unknown") return structType;
        
        return "unknown";
    }

    /**
     * 推断变量名的类型
     */
    private inferVariableNameType(variableName: VariableName): string {
        if (!variableName.expression) return "unknown";
        return this.inferExpressionType(variableName.expression);
    }

    /**
     * 推断成员访问的类型
     */
    private inferMemberAccessType(memberAccess: MemberAccess): string {
        if (!memberAccess.left || !memberAccess.right) return "unknown";
        
        const leftType = this.inferExpressionType(memberAccess.left);
        const rightName = memberAccess.right instanceof Id ? (memberAccess.right.expr?.getText() || "unknown") : "unknown";
        
        if (rightName === "unknown") return "unknown";
        
        // 查找结构体成员
        return this.findStructMemberType(leftType, rightName);
    }

    /**
     * 推断函数表达式的类型
     */
    private inferFunctionExprType(functionExpr: FunctionExpr): string {
        if (!functionExpr.name) return "unknown";
        
        const functionName = functionExpr.name.to_string();
        
        // 查找函数返回类型
        const functions = this.globalContext.get_functions_by_name(functionName);
        if (functions.length > 0) {
            // 返回第一个找到的函数的返回类型
            const func = functions[0];
            if (func instanceof Func && func.returns) {
                return func.returns.getText();
            } else if (func instanceof zinc.Func && func.returns) {
                return func.returns.getText();
            }
        }
        
        // 查找原生函数返回类型
        const natives = this.globalContext.get_natives_by_name(functionName);
        if (natives.length > 0) {
            const native = natives[0];
            if (native.returns) {
                return native.returns.getText();
            }
        }
        
        return "code";
    }

    /**
     * 查找局部变量类型
     */
    private findLocalVariableType(name: string, context: Expr): string {
        let current: NodeAst | null = context.parent;
        
        while (current) {
            // 查找函数或方法
            if (current instanceof Func || current instanceof Method ||
                current instanceof zinc.Func || current instanceof zinc.Method) {
                
                // 在函数体内查找局部变量声明
                const localType = this.findLocalInFunction(current, name);
                if (localType !== "unknown") return localType;
            }
            
            current = current.parent;
        }
        
        return "unknown";
    }

    /**
     * 在函数内查找局部变量
     */
    private findLocalInFunction(func: NodeAst, name: string): string {
        // 这里需要遍历函数的子节点查找局部变量声明
        // 由于当前结构限制，暂时返回 unknown
        // 实际实现需要更复杂的符号表管理
        return "unknown";
    }

    /**
     * 查找 take 变量类型
     */
    private findTakeVariableType(name: string, context: Expr): string {
        // 查找 take 语句
        let current: NodeAst | null = context.parent;
        
        while (current) {
            if (current instanceof Take) {
                // 检查 take 语句中的变量
                if (current.name && current.name.getText() === name) {
                    return current.type ? current.type.getText() : "unknown";
                }
            }
            current = current.parent;
        }
        
        return "unknown";
    }

    /**
     * 查找全局变量类型
     */
    private findGlobalVariableType(name: string): string {
        const globalVars = this.globalContext.get_global_variables_by_name(name);
        if (globalVars.length > 0) {
            const globalVar = globalVars[0];
            if (globalVar instanceof GlobalVariable && globalVar.type) {
                return globalVar.type.getText();
            } else if (globalVar instanceof zinc.Member && globalVar.type) {
                return globalVar.type.getText();
            }
        }
        return "unknown";
    }

    /**
     * 查找结构体类型
     */
    private findStructType(name: string): string {
        const structs = this.globalContext.get_structs_by_name(name);
        if (structs.length > 0) {
            return name; // 结构体类型就是其名称
        }
        return "unknown";
    }

    /**
     * 查找结构体成员类型
     */
    private findStructMemberType(structType: string, memberName: string): string {
        const structs = this.globalContext.get_structs_by_name(structType);
        if (structs.length > 0) {
            const struct = structs[0];
            // 查找结构体成员
            // 这里需要遍历结构体的成员
            // 由于当前结构限制，暂时返回 unknown
            // 实际实现需要更复杂的成员查找
        }
        return "unknown";
    }
}

//#region 解析
/**
 * 库依赖项 - 表示库的依赖关系
 */
export class LibraryRequire {
    public optional: Token | null = null;
    public name: Token | null = null;

    /**
     * 检查是否为可选的依赖项
     * @returns 是否为可选依赖
     */
    public get is_optional(): boolean {
        return this.optional !== null;
    }
}



/**
 * AST 节点基类 - 所有语法树节点的基类
 * 提供节点关系管理和 Token 范围管理功能
 */
export class NodeAst extends Range {
    public readonly document: Document;
    public parent: NodeAst | null = null;
    public previous: NodeAst | null = null;
    public next: NodeAst | null = null;
    public children: Array<NodeAst> = [];
    public start_token: Token | null = null;
    public end_token: Token | null = null;

    /**
     * 结束标签token（用于闭合检查）
     * 记录 endfunction、endstruct 等结束关键字的token
     */
    public end_tag: Token | null = null;

    // 性能优化：缓存范围有效性检查结果
    private _rangeValidCache: boolean | null = null;
    private _rangeValidCacheVersion: number = 0;

    constructor(document: Document) {
        super(new Position(), new Position());
        this.document = document;
    }

    public get start(): Position {
        if (this.start_token) {
            return new Position(this.start_token.line, this.start_token.character);
        } else {
            return new Position(0, 0);
        }
    }

    public get end(): Position {
        if (this.end_token) {
            return new Position(this.end_token.line, this.end_token.character);
        } else if (this.start_token) {
            return new Position(this.start_token.line, this.start_token.character);
        } else {
            return new Position(0, 0);
        }
    }

    /**
     * 设置开始 token，同时使缓存失效
     */
    public setStartToken(token: Token | null): void {
        this.start_token = token;
        this.invalidateRangeCache();
    }

    /**
     * 设置结束 token，同时使缓存失效
     */
    public setEndToken(token: Token | null): void {
        this.end_token = token;
        this.invalidateRangeCache();
    }

    /**
     * 使范围缓存失效
     */
    private invalidateRangeCache(): void {
        this._rangeValidCache = null;
        this._rangeValidCacheVersion++;
    }

    public contains(positionOrRange: Range | Position): boolean {
        // 空值检查
        if (!positionOrRange) {
            return false;
        }

        // 检查当前节点的范围是否有效
        if (!this.isValidRange()) {
            return false;
        }

        // 直接使用 Range 的 contains 方法，避免创建新对象
        return super.contains(positionOrRange);
    }

    /**
     * 检查当前节点的范围是否有效
     * @returns 如果范围有效返回 true，否则返回 false
     */
    private isValidRange(): boolean {
        // 使用缓存机制提高性能
        if (this._rangeValidCache !== null) {
            return this._rangeValidCache;
        }

        // 检查 start 和 end 是否有效
        if (!this.start || !this.end) {
            this._rangeValidCache = false;
            return false;
        }

        // 检查行号是否有效
        if (this.start.line < 0 || this.end.line < 0) {
            this._rangeValidCache = false;
            return false;
        }

        // 检查位置是否有效
        if (this.start.position < 0 || this.end.position < 0) {
            this._rangeValidCache = false;
            return false;
        }

        // 检查范围是否合理（end 应该在 start 之后或相等）
        if (this.end.line < this.start.line) {
            this._rangeValidCache = false;
            return false;
        }

        if (this.end.line === this.start.line && this.end.position < this.start.position) {
            this._rangeValidCache = false;
            return false;
        }

        this._rangeValidCache = true;
        return true;
    }

    /**
     * 检查位置是否在节点的开始边界上
     * @param position 要检查的位置
     * @returns 如果在开始边界上返回 true
     */
    public isAtStart(position: Position): boolean {
        if (!position || !this.isValidRange()) {
            return false;
        }

        return this.start.line === position.line && this.start.position === position.position;
    }

    /**
     * 检查位置是否在节点的结束边界上
     * @param position 要检查的位置
     * @returns 如果在结束边界上返回 true
     */
    public isAtEnd(position: Position): boolean {
        if (!position || !this.isValidRange()) {
            return false;
        }

        return this.end.line === position.line && this.end.position === position.position;
    }

    /**
     * 检查位置是否在节点的内部（不包括边界）
     * @param position 要检查的位置
     * @returns 如果在内部返回 true
     */
    public isInside(position: Position): boolean {
        if (!position || !this.isValidRange()) {
            return false;
        }

        // 检查是否在开始之后
        if (this.start.line > position.line || 
            (this.start.line === position.line && this.start.position >= position.position)) {
            return false;
        }

        // 检查是否在结束之前
        if (this.end.line < position.line || 
            (this.end.line === position.line && this.end.position <= position.position)) {
            return false;
        }

        return true;
    }

    /**
     * 查找包含指定位置的子节点
     * @param position 要查找的位置
     * @returns 包含该位置的子节点，如果没有找到返回 null
     */
    public findChildContaining(position: Position): NodeAst | null {
        if (!position || !this.isValidRange()) {
            return null;
        }

        // 使用深度优先搜索查找最深的包含该位置的子节点
        for (const child of this.children) {
            if (child.contains(position)) {
                // 递归查找更深层的子节点
                const deeperChild = child.findChildContaining(position);
                return deeperChild || child;
            }
        }

        return null;
    }

    /**
     * 查找所有包含指定位置的子节点
     * @param position 要查找的位置
     * @returns 包含该位置的所有子节点数组
     */
    public findAllChildrenContaining(position: Position): NodeAst[] {
        if (!position || !this.isValidRange()) {
            return [];
        }

        const result: NodeAst[] = [];

        for (const child of this.children) {
            if (child.contains(position)) {
                result.push(child);
                // 递归查找子节点的子节点
                result.push(...child.findAllChildrenContaining(position));
            }
        }

        return result;
    }

    /**
     * 获取节点的深度（从根节点到当前节点的距离）
     * @returns 节点深度
     */
    public getDepth(): number {
        let depth = 0;
        let current = this.parent;
        
        while (current) {
            depth++;
            current = current.parent;
        }
        
        return depth;
    }

    /**
     * 检查当前节点是否是另一个节点的祖先
     * @param descendant 要检查的节点
     * @returns 如果是祖先返回 true
     */
    public isAncestorOf(descendant: NodeAst): boolean {
        if (!descendant) {
            return false;
        }

        let current = descendant.parent;
        while (current) {
            if (current === this) {
                return true;
            }
            current = current.parent;
        }

        return false;
    }

    /**
     * 检查当前节点是否是另一个节点的后代
     * @param ancestor 要检查的节点
     * @returns 如果是后代返回 true
     */
    public isDescendantOf(ancestor: NodeAst): boolean {
        if (!ancestor) {
            return false;
        }

        return ancestor.isAncestorOf(this);
    }

    /**
     * 获取节点的路径（从根节点到当前节点的路径）
     * @returns 节点路径数组
     */
    public getPath(): NodeAst[] {
        const path: NodeAst[] = [];
        let current: NodeAst | null = this;

        while (current) {
            path.unshift(current);
            current = current.parent;
        }

        return path;
    }

    /**
     * 获取节点的字符串表示
     * @returns 节点的字符串表示
     */
    public toString(): string {
        const className = this.constructor.name;
        const range = this.isValidRange() ? 
            `(${this.start.line}:${this.start.position} - ${this.end.line}:${this.end.position})` : 
            "(Invalid Range)";
        
        return `${className}${range}`;
    }

    public get description(): string[] {
        const descs: string[] = [];

        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                // 反向插入
                if (!node.previous.is_deprecated && !node.previous.is_param) {
                    descs.splice(0, 0, node.previous.content);
                }

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this);

        return descs;
    }

    public get is_deprecated(): boolean {
        let is = false;
        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                // 反向插入
                if (is) {
                    return;
                } else if (node.previous.is_deprecated) {
                    is = true;
                }

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this)
        return is;
    }

    public get comments(): Comment[] {
        const comments: Comment[] = [];

        const previous_by_previous = (node: NodeAst) => {
            if (node.previous && node.previous instanceof Comment) {
                comments.splice(0, 0, node.previous);

                previous_by_previous(node.previous);
            }
        };
        previous_by_previous(this);

        return comments;
    }

    /**
     * @deprecated 使用 addChild 代替
     * @param node 
     */
    public add_node<T extends NodeAst>(node: T) {
        const previous = this.children[this.children.length - 1] ?? null;

        this.children.push(node);
        node.previous = previous;

        if (previous) {
            previous.next = node;
        }

        node.parent = this;
    }

    public addChild<T extends NodeAst>(node: T) {
        this.add_node(node);
    }

    /**
     * 推送 Token，智能更新 start_token 和 end_token
     * 不保存 Token，只更新位置信息
     * @param token 要推送的 Token
     */
    public pushToken(token: Token): void {
        if (!token) return;

        // 检查是否是新 Token（避免重复处理）
        if (this.isTokenAlreadyProcessed(token)) {
            return;
        }

        // 更新 start_token（如果还没有设置或新 Token 更早）
        if (!this.start_token || this.isTokenBefore(token, this.start_token)) {
            this.start_token = token;
        }

        // 更新 end_token（如果新 Token 更晚）
        if (!this.end_token || this.isTokenAfter(token, this.end_token)) {
            this.end_token = token;
        }

        // 智能更新父节点的 Token 范围
        this.updateParentTokenRange(token);
    }

    /**
     * 检查 Token 是否已经被处理过
     * @param token 要检查的 Token
     * @returns 是否已处理
     */
    private isTokenAlreadyProcessed(token: Token): boolean {
        // 如果 Token 的位置在当前的 start_token 和 end_token 范围内，可能已被处理
        if (this.start_token && this.end_token) {
            const tokenPos = new Position(token.line, token.character);
            const startPos = new Position(this.start_token.line, this.start_token.character);
            const endPos = new Position(this.end_token.line, this.end_token.character);
            
            // 如果 Token 在已有范围内，且不是边界 Token，则认为已处理
            if (this.isPositionAfter(tokenPos, startPos) && this.isPositionBefore(tokenPos, endPos) && 
                token !== this.start_token && token !== this.end_token) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查第一个位置是否在第二个位置之后
     * @param pos1 第一个位置
     * @param pos2 第二个位置
     * @returns 是否在之后
     */
    private isPositionAfter(pos1: Position, pos2: Position): boolean {
        if (pos1.line > pos2.line) return true;
        if (pos1.line === pos2.line) {
            return pos1.position > pos2.position;
        }
        return false;
    }

    /**
     * 检查第一个位置是否在第二个位置之前
     * @param pos1 第一个位置
     * @param pos2 第二个位置
     * @returns 是否在之前
     */
    private isPositionBefore(pos1: Position, pos2: Position): boolean {
        if (pos1.line < pos2.line) return true;
        if (pos1.line === pos2.line) {
            return pos1.position < pos2.position;
        }
        return false;
    }

    /**
     * 检查第一个 Token 是否在第二个 Token 之前
     * @param token1 第一个 Token
     * @param token2 第二个 Token
     * @returns 是否在之前
     */
    private isTokenBefore(token1: Token, token2: Token): boolean {
        if (token1.line < token2.line) return true;
        if (token1.line === token2.line) {
            return token1.character < token2.character;
        }
        return false;
    }

    /**
     * 检查第一个 Token 是否在第二个 Token 之后
     * @param token1 第一个 Token
     * @param token2 第二个 Token
     * @returns 是否在之后
     */
    private isTokenAfter(token1: Token, token2: Token): boolean {
        if (token1.line > token2.line) return true;
        if (token1.line === token2.line) {
            return token1.character > token2.character;
        }
        return false;
    }

    /**
     * 智能更新父节点的 Token 范围
     * @param token 新添加的 Token
     */
    private updateParentTokenRange(token: Token): void {
        let currentParent = this.parent;
        
        while (currentParent) {
            // 如果父节点还没有 start_token，或者新 Token 更早，更新父节点的 start_token
            if (!currentParent.start_token || this.isTokenBefore(token, currentParent.start_token)) {
                currentParent.start_token = token;
            }

            // 如果父节点还没有 end_token，或者新 Token 更晚，更新父节点的 end_token
            if (!currentParent.end_token || this.isTokenAfter(token, currentParent.end_token)) {
                currentParent.end_token = token;
            }

            currentParent = currentParent.parent;
        }
    }
}

/**
 * 语句基类 - 所有语句的基类，具备 AST 节点功能
 */
export abstract class Statement extends NodeAst {
    constructor(document: Document) {
        super(document);
    }

    /**
     * 接受访问器，支持 AST 遍历
     */
    public accept(visitor: ASTVisitor): void {
        // 根据语句类型调用相应的访问方法
        if (this instanceof Set) {
            visitor.visitSet?.(this);
        } else if (this instanceof Call) {
            visitor.visitCall?.(this);
        } else if (this instanceof If) {
            visitor.visitIf?.(this);
        } else if (this instanceof Loop) {
            visitor.visitLoop?.(this);
        } else if (this instanceof Return) {
            visitor.visitReturn?.(this);
        } else if (this instanceof ExitWhen) {
            visitor.visitExitWhen?.(this);
        }
        
        // 访问子节点
        for (const child of this.children) {
            if (child instanceof Statement) {
                child.accept(visitor);
            } else if (child instanceof Expr) {
                child.accept(visitor);
            }
        }
    }

    public abstract to_string(): string;
}

export class JassDetail extends NodeAst {
    private name: Token;

    constructor(document: Document, name: Token) {
        super(document);
        this.name = name;
        this.start_token = name;
        this.end_token = name;
    }

    private cache: string|null = null;
    public get label(): string {
        if (this.cache == null) {
            this.cache = this.name.getText();
        }
        return this.cache;
    }

    /**
     * 
     * @param key 不包含 '' "" 包裹的字符串
     */
    public match_key(key: string) {
        if (this.name.type == TokenType.String) {
            return this.label == `"${key}"`;
        } else if (this.name.type == TokenType.Mark) {
            return this.label == `'${key}'`;
        } else {
            return this.label == key; 
        }
    }

    public get content(): string {
        if (this.name.type == TokenType.String) {
            return this.label.replace(/^"/, "").replace(/"$/, "");
        } else if (this.name.type == TokenType.Mark) {
            return this.label.replace(/^'/, "").replace(/'$/, "");
        } else {
            return this.label; 
        }
    }
}

export namespace zinc {
    export class Break extends NodeAst {
        public token: Token|null = null;

        constructor(document: Document) {
            super(document);
        }
    
        public to_string(): string {
            return this.token?.getText() ?? "";
        }
    }

    export class Call extends NodeAst {
        ref: VariableName | null = null;
    
        constructor(document: Document) {
            super(document);
        }

        to_string(): string {
            return `${this.ref?.to_string() ?? "()"}`;
        }
    }

    export class Set extends NodeAst {
        name: VariableName | null = null;
        init: Expression | null = null;
    
        public to_string(): string {
            let name = "";
            if (this.name) {
                name += this.name.to_string();
                // if (this.name.index_expr) {
                //     if (this.name.index_expr) {
                //         name += this.name.index_expr.to_string();
                //     }
                // }
            }
            let init = "unkown";
            if (this.init) {
                init = this.init.to_string();
            }
            return `${name} = ${init}`
        }
    }
    export class GlobalVariable extends NodeAst {
        // [public, private]
        public visible: Token | null = null;
        // [static, stub]
        public modifier: Token | null = null;
        // [constant]
        public qualifier: Token | null = null;
    
        type: Token | null = null;
        name: Token | null = null;
        array_token: Token | null = null;
    
        expr: Expression | null = null;
    
        public is_array: boolean = false;

        public size_expr: IndexExpr|null = null;
    
        
        public get is_constant() : boolean {
            return this.qualifier !== null && this.qualifier.getText() == "constant";
        }
        public get is_private(): boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public(): boolean {
            return !this.is_private;
        }
        
    
        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const type_string = this.type ? this.type.getText() + " " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            if (this.array_token) {
                const array_string = "array ";
                return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}`;
            } else if (this.size_expr) {
                const array_string = this.size_expr.to_string();
                return `${visible_string}${modifier_string}${qualifier_string}${type_string}${name_string}${array_string}`;
            } else {
                return `${visible_string}${modifier_string}${qualifier_string}${type_string}${name_string}`;
            }
        }
    
        public with(statement: LocalStatement | Modifier) {
            if (statement instanceof LocalStatement) {
                this.type = statement.type;
                this.name = statement.name;
                this.array_token = statement.array_token;
                this.is_array = statement.is_array;
                this.expr = statement.expr;
                this.size_expr = statement.size_expr;
            } else if (statement instanceof Modifier) {
                this.visible = statement.visible;
                this.modifier = statement.modifier;
                this.qualifier = statement.qualifier;
            }
        }
        
    }
    
    export class Member extends zinc.GlobalVariable {
        public get is_static(): boolean {
            return !!this.modifier && this.modifier.getText() == "static";
        }
    }
    export class Interface extends NodeAst implements Check {
        public visible: Token | null = null;
        public name: Token | null = null;
        public extends: Token[] | null = null;

        public index_expr: Expression|null = null;
    
        public get is_private(): boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public(): boolean {
            return !this.is_private;
        }
    
        to_string(): string {
            return `interface ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.map(ex => ex.getText()).join(", ") : ""}`
        }

        syntaxCheck(): void {
            // 检查interface名称
            if (!this.name) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: "Interface name is required"
                });
            }

            // 检查extends的接口是否存在
            if (this.extends && this.extends.length > 0) {
                for (const extendToken of this.extends) {
                    const extendName = extendToken.getText();
                    const allInterfaces = this.document.get_all_interfaces();
                    
                    const foundInterface = allInterfaces.find(i => i.name && i.name.getText() === extendName);
                    
                    if (!foundInterface) {
                        this.document.errorCollection.errors.push({
                            start: {
                                line: extendToken.line,
                                position: extendToken.character
                            },
                            end: {
                                line: extendToken.line,
                                position: extendToken.character + extendToken.length
                            },
                            message: `Extended interface '${extendName}' not found`
                        });
                    }
                }
            }
        }

        /**
         * 空定义结构size
         */
        get is_empty_size(): boolean {
            return !!this.index_expr && this.index_expr instanceof Value && this.index_expr === null;
        }
    }
    export class Struct extends Interface implements Check {
        to_string(): string {
            return `struct ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.map(ex => ex.getText()).join(", ") : ""}`
        }

        syntaxCheck(): void {
            // 检查struct名称
            if (!this.name) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: "Struct name is required"
                });
            }

            // 检查extends的类型是否存在
            if (this.extends && this.extends.length > 0) {
                for (const extendToken of this.extends) {
                    const extendName = extendToken.getText();
                    const allStructs = this.document.get_all_structs();
                    const allInterfaces = this.document.get_all_interfaces();
                    
                    const foundStruct = allStructs.find(s => s.name && s.name.getText() === extendName);
                    const foundInterface = allInterfaces.find(i => i.name && i.name.getText() === extendName);
                    
                    if (!foundStruct && !foundInterface) {
                        this.document.errorCollection.errors.push({
                            start: {
                                line: extendToken.line,
                                position: extendToken.character
                            },
                            end: {
                                line: extendToken.line,
                                position: extendToken.character + extendToken.length
                            },
                            message: `Extended type '${extendName}' not found`
                        });
                    }
                }
            }
        }
    }
    export class Func extends NodeAst implements Check {
        // 类型标识符，用于避免instanceof继承问题
        public get nodeType(): string { return 'zinc.Func'; }

        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
            const returns_string = this.returns ? this.returns.getText() : "nothing";
            return `${visible_string}${modifier_string}${qualifier_string}native ${name_string}takes ${takes_string} returns ${returns_string}`;
        }

        syntaxCheck(): void {
            // 检查function名称
            if (!this.name) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: "Function name is required"
                });
            }

            // 检查参数类型是否存在
            if (this.takes && this.takes.length > 0) {
                for (const take of this.takes) {
                    if (take.type) {
                        const typeName = take.type.getText();
                        // 检查是否是基础类型或已定义的类型
                        const basicTypes = ['integer', 'real', 'string', 'boolean', 'code', 'handle'];
                        if (!basicTypes.includes(typeName.toLowerCase())) {
                            const allStructs = this.document.get_all_structs();
                            const allInterfaces = this.document.get_all_interfaces();
                            const allTypes = this.document.get_all_types();
                            
                            const foundStruct = allStructs.find(s => s.name && s.name.getText() === typeName);
                            const foundInterface = allInterfaces.find(i => i.name && i.name.getText() === typeName);
                            const foundType = allTypes.find(t => t.name && t.name.getText() === typeName);
                            
                            if (!foundStruct && !foundInterface && !foundType) {
                                this.document.errorCollection.errors.push({
                                    start: {
                                        line: take.type.line,
                                        position: take.type.character
                                    },
                                    end: {
                                        line: take.type.line,
                                        position: take.type.character + take.type.length
                                    },
                                    message: `Parameter type '${typeName}' not found`
                                });
                            }
                        }
                    }
                }
            }

            // 检查返回值类型
            this.checkReturnType();
        }

        /**
         * 检查函数的返回值类型
         */
        private checkReturnType(): void {
            if (!this.returns) {
                return; // 如果没有声明返回类型，跳过检查
            }

            const declaredReturnType = this.returns.getText().toLowerCase();
            
            // 检查函数体中是否有return语句
            const hasReturnStatement = this.checkForReturnStatement(this);
            
            // 如果声明了非void返回类型，但函数体中没有return语句
            if (declaredReturnType !== 'nothing' && !hasReturnStatement) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: `Function '${this.name?.getText() || 'unknown'}' declares return type '${declaredReturnType}' but has no return statement`
                });
            }

            // 如果声明了void返回类型，但有return语句
            if (declaredReturnType === 'nothing' && hasReturnStatement) {
                this.document.errorCollection.warnings.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: `Function '${this.name?.getText() || 'unknown'}' declares return type 'nothing' but contains return statement`
                });
            }
        }

        /**
         * 递归检查函数体中是否有return语句
         */
        private checkForReturnStatement(node: NodeAst): boolean {
            // 检查当前节点是否是return语句
            if (node.start_token && node.start_token.getText().toLowerCase() === 'return') {
                return true;
            }

            // 递归检查子节点
            for (const child of node.children) {
                if (this.checkForReturnStatement(child)) {
                    return true;
                }
            }

            return false;
        }
    
        /**
         * [private, public]
         */
        public visible: Token | null = null;
        /**
         * [static, stub]
         */
        public modifier: Token | null = null;
        /**
         * [constant]
         */
        public qualifier: Token | null = null;
        public name: Token | null = null;
        public takes: Take[] | null = null;
        public returns: Token | null = null;
        public defaults: Expression | null = null;
    
        with<T extends Modifier | Takes | Returns>(v: T) {
            if (v instanceof Modifier) {
                this.visible = v.visible;
                this.modifier = v.modifier;
                this.qualifier = v.qualifier;
            } else if (v instanceof Takes) {
                if (v.takes.length > 0) {
                    if (this.takes == null) {
                        this.takes = [];
                    }
                    this.takes.push(...v.takes);
                } else {
                    this.takes = null;
                }
            } else if (v instanceof Returns) {
                this.returns = v.expr;
            }
        }
    
        public get is_private(): boolean {
            return !!this.visible && this.visible.getText() == "private";
        }
        public get is_public(): boolean {
            return !this.is_private;
        }
    
        public get is_static(): boolean {
            return !!this.modifier && this.modifier.getText() == "static";
        }
        public get is_stub(): boolean {
            return !!this.modifier && this.modifier.getText() == "stub";
        }
        public get is_constant(): boolean {
            return !!this.qualifier && this.qualifier.getText() == "constant";
        }
    
        public get_param_descriptions() {
            const param_descs: ParamDescription[] = [];
            this.comments.forEach(comment => {
                if (comment.is_param) {
                    const result = /^\/\/\s*@[pP]arams?\s+(?<name>[\$_a-zA-Z0-9]+)\s+(?<content>.*)/.exec(comment.comment!.getText());
                    if (result && result.groups) {
                        param_descs.push(new ParamDescription(result.groups["name"], result.groups["content"]));
                    }
                }
            });
    
            return param_descs;
        }
    }
    export class Method extends Func implements Check {
        // 类型标识符，用于避免instanceof继承问题
        public get nodeType(): string { return 'zinc.Method'; }

        public to_string(): string {
            const visible_string = this.visible ? this.visible.getText() + " " : "";
            const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
            const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
            const name_string = this.name ? this.name.getText() + " " : "";
            const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
            const returns_string = this.returns ? this.returns.getText() : "nothing";
            return `${visible_string}${modifier_string}${qualifier_string}method ${name_string}takes ${takes_string} returns ${returns_string}`;
        }

        syntaxCheck(): void {
            // 先调用父类的check方法（包括返回值检查）
            super.syntaxCheck();

            // 检查method是否在struct或interface内部
            if (!this.parent || (!(this.parent instanceof Struct) && !(this.parent instanceof Interface) && 
                !(this.parent instanceof zinc.Struct) && !(this.parent instanceof zinc.Interface))) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.start_token!.line,
                        position: this.start_token!.character
                    },
                    end: {
                        line: this.start_token!.line,
                        position: this.start_token!.character + this.start_token!.length
                    },
                    message: "Method must be declared inside a struct or interface"
                });
            }
        }
    
        with<T extends Modifier | Takes | Returns>(v: T) {
            if (v instanceof Modifier) {
                this.visible = v.visible;
                this.modifier = v.modifier;
                this.qualifier = v.qualifier;
            } else if (v instanceof Takes) {
                if (v.takes.length > 0) {
                    if (this.takes == null) {
                        this.takes = [];
                    }
                    this.takes.push(...v.takes);
                } else {
                    this.takes = null;
                }
            } else if (v instanceof Returns) {
                this.returns = v.expr;
            }
        }
    }
    export class If extends NodeAst {
        expr: Expression | null = null;
    }
    export class StaticIf extends If {
        expr: Expression | null = null;
    }
    export class ElseIf extends If {
    }
    export class Else extends NodeAst {
    }
    export class While extends If {
        expr: Expression | null = null;
    }
    export class For extends While {
        expr: Expression | null = null;
    }
    export class CFor extends For {
        init_statement: zinc.Set|null = null;
        expr: Expression | null = null;
        inc_statement: zinc.Set|null = null;
    }
    export class Private extends NodeAst {
    }
    export class Public extends NodeAst {
    }
    export class Debug extends NodeAst {
    }
}

export class ZincNode extends NodeAst {

    constructor (document: Document) {
        super(document)
    }

}

/**
 * 库节点 - 表示 JASS/vJASS 库定义
 */
export class Library extends NodeAst implements ExprTrict, Check {
    public is_library_once: boolean = false;
    public name: Token | null = null;
    public initializer: Token | null = null;
    public requires: LibraryRequire[] = [];

    /**
     * 转换为字符串表示
     * @returns 库的字符串表示
     */
    public to_string(): string {
        const type = this.is_library_once ? "library_once" : "library";
        const name = this.name ? this.name.getText() : "(unknown)";
        const init = this.initializer ? ` initializer ${this.initializer.getText()}` : "";
        const reqs = this.requires.length > 0 ? 
            ` requires ${this.requires.map(x => 
                `${x.is_optional ? "optional " : ""}${x.name ? x.name.getText() : "(unknown)"}`
            ).join(", ")}` : "";
        
        return `${type} ${name}${init}${reqs}`;
    }

    /**
     * 将 AST 节点转换为完整的代码字符串
     * @param options 格式化选项
     * @returns 生成的代码字符串
     */
    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        const type = this.is_library_once ? "library_once" : "library";
        const name = this.name ? this.name.getText() : "(unknown)";
        const init = this.initializer ? ` initializer ${this.initializer.getText()}` : "";
        const reqs = this.requires.length > 0 ? 
            ` requires ${this.requires.map(x => 
                `${x.is_optional ? "optional " : ""}${x.name ? x.name.getText() : "(unknown)"}`
            ).join(opts.addSpaceAfterComma ? ", " : ",")}` : "";
        
        let code = `${type} ${name}${init}${reqs}`;
        
        // 添加类型注释
        if (opts.addTypeAnnotations) {
            code += ` /* library */`;
        }
        
        return code;
    }

    /**
     * 实现Check接口 - 验证Library节点
     */
    public syntaxCheck(): void {
        // 检查library名称
        if (!this.name) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: "Library name is required"
            });
        }

        // 检查initializer函数是否存在
        if (this.initializer) {
            const initializerName = this.initializer.getText();
            const allFunctions = this.document.get_all_functions();
            const foundFunction = allFunctions.find(func => 
                func.name && func.name.getText() === initializerName
            );
            
            if (!foundFunction) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: this.initializer.line,
                        position: this.initializer.character
                    },
                    end: {
                        line: this.initializer.line,
                        position: this.initializer.character + this.initializer.length
                    },
                    message: `Initializer function '${initializerName}' not found`
                });
            }
        }

        // 检查requires库是否存在
        for (const req of this.requires) {
            if (!req.name) continue;
            
            const requiredLibraryName = req.name.getText();
            const allLibraries = this.document.get_all_libraries();
            const foundLibrary = allLibraries.find(lib => 
                lib.name && lib.name.getText() === requiredLibraryName
            );
            
            if (!foundLibrary && !req.is_optional) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: req.name.line,
                        position: req.name.character
                    },
                    end: {
                        line: req.name.line,
                        position: req.name.character + req.name.length
                    },
                    message: `Required library '${requiredLibraryName}' not found`
                });
            }
        }
    }
}
/**
 * 解析库定义
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的库节点
 */
export function parse_library(document: Document, tokens: Token[]): Library {
    const library = new Library(document);
    let state = 0;
    let index = 0;
    let optional: LibraryRequire | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "library" || text == "library_once") {
                library.is_library_once = text == "library_once";

                library.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `library name is undefined`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'library'`);
                break;
            }
        } else if (state == 1) {
            index++;

            if (token.is_identifier) {
                library.name = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "initializer") {
                        state = 2;
                    } else if (next_token_text == "requires" || next_token_text == "uses" || next_token_text == "needs") {
                        state = 4;
                    } else {
                        state = 8;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal library identifier`);
                break;
            }


        } else if (state == 2) { // initializer
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 3;
            } else {
                document.add_token_error(token, `initializer function not found`);
                break;
            }
        } else if (state == 3) {
            index++;

            if (token.is_identifier) {
                library.initializer = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "requires" || next_token_text == "uses" || next_token_text == "needs") {
                        state = 4;
                    } else {
                        document.add_token_error(token, `missing keyword 'requires'、'uses' or 'needs'`);
                        break;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal initializer function identifier`);
                break;
            }
        } else if (state == 4) { // requires
            index++;
            
            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "optional") {
                    state = 6;
                } else {
                    state = 5;
                }
            } else {
                document.add_token_error(token, `requires library names not found`);
                break;
            }
        } else if (state == 5) {
            index++;

            if (token.is_identifier) {
                if (optional == null) {
                    optional = new LibraryRequire();
                } else {
                }
                optional.name = token;

                library.requires.push(optional);
                optional = null;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == ",") {
                        state = 7;
                    } else {
                        state = 8;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `illegal initializer function identifier`);
                break;
            }
        } else if (state == 6) { // optional
            index++;
            
            optional = new LibraryRequire();
            optional.optional = token;

            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.is_identifier) {
                state = 5;
            } else {
                document.add_token_error(token, `missing library reference library name`);
                break;
            }
        } else if (state == 7) { // ,
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token && next_token.is_identifier) {
                if (next_token.getText() == "optional") {
                    state = 6;
                } else {
                    state = 5;
                }
            } else {
                document.add_token_error(token, `missing library reference library name`);
                break;
            }
        } else if (state == 8) {
            index++;

            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return library;

    // let index = 0;
    // let token = tokens[index];
    // let text = token.getText();
    // const next = () => {
    //     index++;
    //     token = tokens[index];
    //     if (token.type == TokenType.BlockComment) {
    //         next();
    //     }
    //     if (token) {
    //         text = token.getText();
    //         return true
    //     }
    //     return false;
    // }

    // if (text == "library") {
    //     library.is_library_once = false;
    // } else if (text == "library_once") {
    //     library.is_library_once = true;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (token.type == TokenType.Identifier) {
    //     library.name = text;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // //@ts-expect-error
    // if (text == "initializer") {
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (token.type == TokenType.Identifier) {
    //     library.initializer = text;
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (text == "requires" || text == "uses" || text == "needs") {
    // } else {
    //     return library;
    // }
    // if (next() == false) return library;
    // if (text == "optional") {
    //     library.is_optional = true;

    //     if (next() == false) return library;
    // }

    // if (token.type == TokenType.Identifier) {
    //     library.requires.push(text);
    // } else {
    //     return library;
    // }
    // // if (next() == false) return library;


    // let state = 0;
    // for (let i = index + 1; i < tokens.length; i++) {
    //     const token = tokens[i];
    //     if (!token) {
    //         return library;
    //     }
    //     if (token.type == TokenType.BlockComment) {
    //         continue;
    //     }
    //     const text = token.getText();
    //     if (state == 0) {
    //         if (text == ",") {
    //             state = 1;
    //         } else {ScopeLibrary
    //             break;
    //         }
    //     } else if (state == 1) {
    //         if (token.type == TokenType.Identifier) {
    //             library.requires.push(text);
    //             state = 0;
    //         } else {
    //             break;
    //         }
    //     }
    // }

    return library;
}

export class Scope extends NodeAst implements Check {
    public name: Token | null = null;

    to_string(): string {
        return `scope ${this.name ? this.name.getText() : "(unkown)"}`;
    }

    public syntaxCheck(): void {
        // 检查scope名称
        if (!this.name) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: "Scope name is required"
            });
        }
    }
}
export function parse_scope(document: Document, tokens: Token[]) {
    const scope = new Scope(document);
    // const tokens = line_text.tokens();
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "scope") {
                scope.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                scope.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return scope;
}

export class Interface extends NodeAst {
    public visible: "public" | "private" | null = null;
    public name: Token | null = null;
    public extends: Token[] | null = null;
    public implementations: VjassModuleImplementation[] = [];

    public get is_private(): boolean {
        return !!this.visible && this.visible == "private";
    }
    public get is_public(): boolean {
        return !this.is_private;
    }

    to_string(): string {
        return `interface ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.map(ex => ex.getText()).join(", ") : ""}`
    }
}
export function parse_interface(document: Document, tokens: Token[]) {
    const inter = new Interface(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "interface") {
                inter.start_token = token;

                state = 1;
            } else if (text == "private") {
                inter.visible = "private";
                state = 2;
            } else if (text == "public") {
                inter.visible = "public";
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                inter.name = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "interface") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "extends") {
                state = 4;
                if (!inter.extends) {
                    inter.extends = [];
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (token.is_identifier) {
                inter.extends!.push(token);
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == ",") {
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return inter;
}

export class Struct extends Interface implements Check {

    to_string(): string {
        return `struct ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.map(ex => ex.getText()).join(", ") : ""}`
    }



    syntaxCheck(): void {
        // 检查struct名称
        if (!this.name) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: `struct name is required`
            });
            return;
        }

        const structName = this.name.getText();
        
        // 检查struct名称是否重复
        const allStructs = this.document.get_all_structs();
        const duplicateStructs = allStructs.filter(s => 
            s !== this && 
            s.name && 
            s.name.getText() === structName
        );
        
        if (duplicateStructs.length > 0) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.name.line,
                    position: this.name.character
                },
                end: {
                    line: this.name.line,
                    position: this.name.character + this.name.length
                },
                message: `duplicate struct name '${structName}'`
            });
        }

        // 检查extends的接口是否存在
        if (this.extends && this.extends.length > 0) {
            for (const extendToken of this.extends) {
                const interfaceName = extendToken.getText();
                const interfaces = this.document.get_all_interfaces();
                const foundInterface = interfaces.find(i => 
                    i.name && i.name.getText() === interfaceName
                );
                
                if (!foundInterface) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: extendToken.line,
                            position: extendToken.character
                        },
                        end: {
                            line: extendToken.line,
                            position: extendToken.character + extendToken.length
                        },
                        message: `interface '${interfaceName}' not found`
                    });
                }
            }
        }

        // 检查struct内部的方法和成员
        this.checkStructMembers();
    }

    /**
     * 检查struct内部成员
     */
    private checkStructMembers(): void {
        const methods: (Method | zinc.Method)[] = [];
        const members: (Member | zinc.Member)[] = [];
        
        // 收集所有方法和成员
        for (const child of this.children) {
            if (child instanceof Method || child instanceof zinc.Method) {
                methods.push(child);
            } else if (child instanceof Member || child instanceof zinc.Member) {
                members.push(child);
            }
        }

        // 检查方法名称重复
        const methodNames = new Map<string, (Method | zinc.Method)[]>();
        for (const method of methods) {
            if (method.name) {
                const methodName = method.name.getText();
                if (!methodNames.has(methodName)) {
                    methodNames.set(methodName, []);
                }
                methodNames.get(methodName)!.push(method);
            }
        }

        for (const [methodName, duplicateMethods] of methodNames) {
            if (duplicateMethods.length > 1) {
                for (const method of duplicateMethods) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: method.name!.line,
                            position: method.name!.character
                        },
                        end: {
                            line: method.name!.line,
                            position: method.name!.character + method.name!.length
                        },
                        message: `duplicate method name '${methodName}' in struct`
                    });
                }
            }
        }

        // 检查成员名称重复
        const memberNames = new Map<string, (Member | zinc.Member)[]>();
        for (const member of members) {
            if (member.name) {
                const memberName = member.name.getText();
                if (!memberNames.has(memberName)) {
                    memberNames.set(memberName, []);
                }
                memberNames.get(memberName)!.push(member);
            }
        }

        for (const [memberName, duplicateMembers] of memberNames) {
            if (duplicateMembers.length > 1) {
                for (const member of duplicateMembers) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: member.name!.line,
                            position: member.name!.character
                        },
                        end: {
                            line: member.name!.line,
                            position: member.name!.character + member.name!.length
                        },
                        message: `duplicate member name '${memberName}' in struct`
                    });
                }
            }
        }

        // 检查成员和方法名称冲突
        for (const [methodName] of methodNames) {
            if (memberNames.has(methodName)) {
                const conflictingMembers = memberNames.get(methodName)!;
                for (const member of conflictingMembers) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: member.name!.line,
                            position: member.name!.character
                        },
                        end: {
                            line: member.name!.line,
                            position: member.name!.character + member.name!.length
                        },
                        message: `member name '${methodName}' conflicts with method name`
                    });
                }
            }
        }
    }
}
export class VjassModuleImplementation extends NodeAst {
    public moduleName: Token | null = null;
    public optional: Token | null = null;
}

export class Module extends NodeAst implements Check {
    public name: Token | null = null;
    public methods: (Method | zinc.Method)[] = [];
    public implementations: VjassModuleImplementation[] = [];

    to_string(): string {
        return `module ${this.name ? this.name.getText() : "(unkown)"}`;
    }

    syntaxCheck(): void {
        // 检查module名称
        if (!this.name) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: `module name is required`
            });
            return;
        }

        const moduleName = this.name.getText();
        
        // 检查module名称是否重复
        const allModules = this.document.get_all_modules();
        const duplicateModules = allModules.filter(m => 
            m !== this && 
            m.name && 
            m.name.getText() === moduleName
        );
        
        if (duplicateModules.length > 0) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.name.line,
                    position: this.name.character
                },
                end: {
                    line: this.name.line,
                    position: this.name.character + this.name.length
                },
                message: `duplicate module name '${moduleName}'`
            });
        }

        // 检查module内部的方法和实现
        this.checkModuleMembers();
    }

    /**
     * 检查module内部成员
     */
    private checkModuleMembers(): void {
        const methods: (Method | zinc.Method)[] = [];
        const implementations: VjassModuleImplementation[] = [];
        
        // 收集所有方法和实现
        for (const child of this.children) {
            if (child instanceof Method || child instanceof zinc.Method) {
                methods.push(child);
            } else if (child instanceof VjassModuleImplementation) {
                implementations.push(child);
            }
        }

        // 检查方法名称重复
        const methodNames = new Map<string, (Method | zinc.Method)[]>();
        for (const method of methods) {
            if (method.name) {
                const methodName = method.name.getText();
                if (!methodNames.has(methodName)) {
                    methodNames.set(methodName, []);
                }
                methodNames.get(methodName)!.push(method);
            }
        }

        for (const [methodName, duplicateMethods] of methodNames) {
            if (duplicateMethods.length > 1) {
                for (const method of duplicateMethods) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: method.name!.line,
                            position: method.name!.character
                        },
                        end: {
                            line: method.name!.line,
                            position: method.name!.character + method.name!.length
                        },
                        message: `duplicate method name '${methodName}' in module`
                    });
                }
            }
        }

        // 检查module实现
        this.checkModuleImplementations(implementations);
    }

    /**
     * 检查module实现
     */
    private checkModuleImplementations(implementations: VjassModuleImplementation[]): void {
        const implementedModules = new globalThis.Set<string>();
        
        for (const implementation of implementations) {
            if (!implementation.moduleName) {
                continue;
            }
            
            const moduleName = implementation.moduleName.getText();
            
            // 检查是否重复实现同一个module
            if (implementedModules.has(moduleName)) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: implementation.moduleName.line,
                        position: implementation.moduleName.character
                    },
                    end: {
                        line: implementation.moduleName.line,
                        position: implementation.moduleName.character + implementation.moduleName.length
                    },
                    message: `module '${moduleName}' is already implemented`
                });
                continue;
            }
            
            implementedModules.add(moduleName);
            
            // 检查module是否存在（只对非optional的实现进行检查）
            if (!implementation.optional) {
                const allModules = this.document.get_all_modules();
                const foundModule = allModules.find(m => 
                    m !== this && 
                    m.name && 
                    m.name.getText() === moduleName
                );
                
                if (!foundModule) {
                    this.document.errorCollection.errors.push({
                        start: {
                            line: implementation.moduleName.line,
                            position: implementation.moduleName.character
                        },
                        end: {
                            line: implementation.moduleName.line,
                            position: implementation.moduleName.character + implementation.moduleName.length
                        },
                        message: `module '${moduleName}' not found. Required module implementation failed.`
                    });
                }
            }
        }
    }
}
export function parse_struct(document: Document, tokens: Token[]) {
    const struct = new Struct(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "struct") {
                struct.start_token = token;

                state = 1;
            } else if (text == "private") {
                struct.visible = "private";
                state = 2;
            } else if (text == "public") {
                struct.visible = "public";
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                struct.name = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "struct") {
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (text == "extends") {
                state = 4;
                if (!struct.extends) {
                    struct.extends = [];
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 4) {
            if (token.is_identifier) {
                struct.extends!.push(token);
                state = 5;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 5) {
            if (text == ",") {
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return struct;
}

/**
 * 解析模块定义
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的模块节点
 */
export function parse_module(document: Document, tokens: Token[]): Module {
    const module = new Module(document);
    
    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            if (text == "module") {
                module.start_token = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                module.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }
    
    return module;
}

export class Take {
    public type: Token | null = null;
    public name: Token | null = null;

    public to_string(): string {
        const type_string = this.type ? this.type.getText() : "(unkown_type)";
        const name_string = this.name ? this.name.getText() : "(unkown_name)";
        return `${type_string} ${name_string}`;
    }

    belong: Func | Native | Method | zinc.Func | zinc.Method;

    constructor(belong: Func | Native | Method | zinc.Func | zinc.Method) {
        this.belong = belong;
    }

    public get desciprtion(): ParamDescription | null {
        const desc = (this.belong as any).get_param_descriptions?.()?.find((desc: any) => {
            return desc.name === this.name?.getText();
        });
        if (desc) {
            return desc;
        } else {
            return null;
        }
    }

}

class ParamDescription {
    name: string;
    content: string;

    constructor(name: string, content: string = "") {
        this.name = name;
        this.content = content;
    }
}
export class Native extends NodeAst {
    // 类型标识符，用于避免instanceof继承问题
    public get nodeType(): string { return 'Native'; }

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}native ${name_string}takes ${takes_string} returns ${returns_string}`;
    }

    /**
     * [private, public]
     */
    public visible: Token | null = null;
    /**
     * [static, stub]
     */
    public modifier: Token | null = null;
    /**
     * [constant]
     */
    public qualifier: Token | null = null;
    public name: Token | null = null;
    public takes: Take[] | null = null;
    public returns: Token | null = null;
    public defaults: string | null = null;

    with<T extends Modifier | Takes | Returns>(v: T) {
        if (v instanceof Modifier) {
            this.visible = v.visible;
            this.modifier = v.modifier;
            this.qualifier = v.qualifier;
        } else if (v instanceof Takes) {
            if (v.takes.length > 0) {
                if (this.takes == null) {
                    this.takes = [];
                }
                this.takes.push(...v.takes);
            } else {
                this.takes = null;
            }
        } else if (v instanceof Returns) {
            this.returns = v.expr;
        }
    }

    public get is_private(): boolean {
        return !!this.visible && this.visible.getText() == "private";
    }
    public get is_public(): boolean {
        return !this.is_private;
    }

    public get is_static(): boolean {
        return !!this.modifier && this.modifier.getText() == "static";
    }
    public get is_stub(): boolean {
        return !!this.modifier && this.modifier.getText() == "stub";
    }
    public get is_constant(): boolean {
        return !!this.qualifier && this.qualifier.getText() == "constant";
    }

    public get_param_descriptions() {
        const param_descs: ParamDescription[] = [];
        this.comments.forEach(comment => {
            if (comment.is_param) {
                const result = /^\/\/\s*@[pP]arams?\s+(?<name>[\$_a-zA-Z0-9]+)\s+(?<content>.*)/.exec(comment.comment!.getText());
                if (result && result.groups) {
                    param_descs.push(new ParamDescription(result.groups["name"], result.groups["content"]));
                }
            }
        });

        return param_descs;
    }
}
export class Func extends NodeAst {
    /**
     * [private, public]
     */
    public visible: Token | null = null;
    /**
     * [static, stub]
     */
    public modifier: Token | null = null;
    /**
     * [constant]
     */
    public qualifier: Token | null = null;
    public name: Token | null = null;
    public takes: Take[] | null = null;
    public returns: Token | null = null;
    public defaults: string | null = null;
    // 类型标识符，用于避免instanceof继承问题
    public get nodeType(): string { return 'Func'; }

    /**
     * 设置函数属性
     */
    public with(statement: LocalStatement | Modifier) {
        if (statement instanceof LocalStatement) {
            this.name = statement.name;
            // Func类不需要type、array_token等属性
        } else if (statement instanceof Modifier) {
            this.visible = statement.visible;
            this.modifier = statement.modifier;
            this.qualifier = statement.qualifier;
        }
    }

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}function ${name_string}takes ${takes_string} returns ${returns_string}`;
    }
}
export class Method extends NodeAst {
    // 类型标识符，用于避免instanceof继承问题
    public get nodeType(): string { return 'Method'; }

    /**
     * [private, public]
     */
    public visible: Token | null = null;
    /**
     * [static, stub]
     */
    public modifier: Token | null = null;
    /**
     * 检查是否为静态方法
     */
    public get is_static(): boolean {
        return !!this.modifier && this.modifier.getText() === "static";
    }
    /**
     * [constant]
     */
    public qualifier: Token | null = null;
    public name: Token | null = null;
    public takes: Take[] | null = null;
    public returns: Token | null = null;
    public defaults: string | null = null;

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const takes_string = this.takes ? (this.takes.length > 0 ? this.takes.map(take => take.to_string()).join(",") : "nothing") : "nothing ";
        const returns_string = this.returns ? this.returns.getText() : "nothing";
        return `${visible_string}${modifier_string}${qualifier_string}method ${name_string}takes ${takes_string} returns ${returns_string}`;
    }

    with<T extends Modifier | Takes | Returns>(v: T) {
        if (v instanceof Modifier) {
            this.visible = v.visible;
            this.modifier = v.modifier;
            this.qualifier = v.qualifier;
        } else if (v instanceof Takes) {
            if (v.takes.length > 0) {
                if (this.takes == null) {
                    this.takes = [];
                }
                this.takes.push(...v.takes);
            } else {
                this.takes = null;
            }
        } else if (v instanceof Returns) {
            this.returns = v.expr;
        }
    }
}
export function parse_method(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "method") as Method;
}



/**       
 * 解析参数类型与标识符
 *         |-------|
 * [takes] type name
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
function parse_line_function_takes_statement(document: Document, tokens: Token[], offset_index: number, func: Func | Method | Native) {
    let index = offset_index;
    let state = 0;
    let take: Take = new Take(func);
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;
            if (token.is_identifier) {
                take.type = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "returns") {
                        document.add_token_error(token, `undeclared parameter identifier`);
                        break;
                    } else if (next_token_text == ",") {
                        document.add_token_error(token, `undeclared parameter identifier`);
                        break;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `parameter declaration not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `incorrect parameter type declaration '${text}'`);
                break;
            }
        } else if (state == 1) {
            index++;

            if (token.is_identifier) {
                take.name = token;
            } else {
                document.add_token_error(token, `wrong parameter identifier '${text}'`);
            }
            break;
        }
    }
    return {
        index,
        expr: take
    }
}

export class Takes {
    takes: Take[] = [];
}
function parse_line_function_takes(document: Document, tokens: Token[], offset_index: number, func: Func | Method | Native) {
    let index = offset_index;
    let state = 0;
    let takes: Takes = new Takes();
    // 匹配第一个'nothing'关键字
    let is_first = true;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            // 检查当前 token 是否是 "takes"，如果是则跳过它
            if (text == "takes") {
                index++; // 跳过 takes 关键字
                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.getText() == "returns") {
                        document.add_token_error(token, `non parametric declaration requires the use of the keyword 'nothing'`);
                        break;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `parameter declaration not found`);
                    break;
                }
            } else {
                // 如果当前不是 takes，尝试向前查找（跳过注释）
                index++;
                continue;
            }
        } else if (state == 1) {
            if (is_first && text == "nothing") {
                index++;
                break
            } else {
                const result = parse_line_function_takes_statement(document, tokens, index, func);
                index = result.index;
                takes.takes.push(result.expr);

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "returns") {
                        break;
                    } else if (next_token_text == ",") {
                        state = 2;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }

            if (is_first) {
                is_first = false;
            }
        } else if (state == 2) { // ','
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "returns") {
                    break;
                } else if (next_token_text == ",") {
                    document.add_token_error(token, `empty parameter declaration`);
                    state = 2;
                } else {
                    state = 1;
                }
            } else {
                document.add_token_error(token, `incomplete take parameter declaration`);
                break;
            }
        }
    }
    return {
        index,
        expr: takes
    }
}
class Modifier {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;
}
export function parse_line_modifier(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let modifier: Modifier = new Modifier();
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            if (text == "private" || text == "public") {
                index++;
                modifier.visible = token;
            } else if (text == "static" || text == "stub") {
                index++;
                modifier.modifier = token;
            } else if (text == "constant") {
                index++;
                modifier.qualifier = token;
            } else {
                break;
            }
        }
    }
    return {
        index,
        expr: modifier
    }
}
export class Returns {
    expr: Token | null = null;
}
function parse_line_returns(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let returns: Returns = new Returns();
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;

            if (text == "returns") {

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `no declaration return type displayed`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'returns'`);
                break;
            }
        } else if (state == 1) {
            index++;
            returns.expr = token;

            if (!token.is_identifier) {
                document.add_token_error(token, `wrong return type`);
            }

            break;
        }
    }
    return {
        index,
        expr: returns
    }
}


export function parse_function(document: Document, tokens: Token[], type: "function" | "method" | "native" = "function") {
    const func: Func | Method | Native = type == "function" ? new Func(document) : type == "method" ? new Method(document) : new Native(document);

    let state = 0;
    let index = 0;
    const keyword = type;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            (func as any).with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == keyword) {
                    state = 1;
                } else {
                    document.add_token_error(token, `error ${keyword}`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword ${keyword}`);
                break;
            }
        } else if (state == 1) {
            index++;

            func.start_token = token;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "takes") {
                    document.add_token_error(token, `missing ${keyword} name`);
                    state = 3;
                } else if (next_token.is_identifier) {
                    state = 2;
                } else {
                    document.add_token_error(next_token, `wrong ${keyword} name '${next_token_text}'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing ${keyword} name`);
                break;
            }
        } else if (state == 2) {
            index++;
            func.name = token;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "takes") {
                    // 找到 takes token 在 tokens 数组中的实际索引
                    for (let i = index; i < tokens.length; i++) {
                        const t = tokens[i];
                        if (!t.is_block_comment && !t.is_comment && t.getText() === "takes") {
                            index = i;
                            break;
                        }
                    }
                    state = 3;
                } else if (next_token_text == "returns") {
                    document.add_token_error(next_token, `missing keyword 'returns'`);
                    state = 4;
                } else if (next_token_text == "defaults") {
                    document.add_token_error(next_token, `missing keyword 'defaults'`);
                    state = 5;
                } else {
                    document.add_token_error(next_token, `missing keyword 'takes'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'takes'`);
                break;
            }
        } else if (state == 3) {
            const result = parse_line_function_takes(document, tokens, index, func);
            index = result.index;
            (func as any).with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                const next_token_text = next_token.getText();
                if (next_token_text == "returns") {
                    state = 4;
                } else if (next_token_text == "defaults") {
                    document.add_token_error(next_token, `missing keyword 'defaults'`);
                    state = 5;
                } else {
                    document.add_token_error(next_token, `missing keyword 'returns'`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'returns'`);
                break;
            }
        } else if (state == 4) {
            const result = parse_line_returns(document, tokens, index);
            index = result.index;
            (func as any).with(result.expr);

            state = 5;
        } else if (state == 5) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return func;
}
export class Globals extends NodeAst implements Check {
    public to_string(): string {
        return "globals";
    }

    public syntaxCheck(): void {
        // Globals块本身不需要特殊检查，主要是检查其子节点
        // 检查globals块中是否包含非法内容（如function、method等）
        for (const child of this.children) {
            if (child instanceof Func || child instanceof Method || 
                child instanceof If || child instanceof Loop ||
                child instanceof zinc.Func || child instanceof zinc.Method) {
                this.document.errorCollection.errors.push({
                    start: {
                        line: child.start_token!.line,
                        position: child.start_token!.character
                    },
                    end: {
                        line: child.end_token ? child.end_token.line : child.start_token!.line,
                        position: child.end_token ? child.end_token.character : child.start_token!.character + child.start_token!.length
                    },
                    message: `${child.constructor.name} cannot be declared inside globals block (globals can only contain variable declarations and types)`
                });
            }
        }
    }
}

export function parse_globals(document: Document, tokens: Token[]) {
    const globals = new Globals(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "globals") {
                globals.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return globals;
}

export class If extends Statement implements Check {
    expr: Expression | null = null;

    public to_string(): string {
        return `if ${this.expr ? this.expr.to_string() : "unknown"}`;
    }

    public syntaxCheck(): void {
        // 检查if语句是否在function或method内部
        let hasValidParent = false;
        let current: NodeAst | null = this.parent;
        
        while (current) {
            if (current instanceof Func || current instanceof Method ||
                current instanceof zinc.Func || current instanceof zinc.Method) {
                hasValidParent = true;
                break;
            }
            current = current.parent;
        }
        
        if (!hasValidParent) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: "if statement must be inside a function or method body"
            });
        }

        // 检查if条件表达式
        if (!this.expr) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: "if statement requires a condition expression"
            });
        }
    }

    /**
     * 设置条件表达式并建立父子关系
     */
    public setConditionExpression(expr: Expression): void {
        this.expr = expr;
        if (expr && expr instanceof Expr) {
            expr.parent = this;
            this.children.push(expr);
        }
    }
}
export class Loop extends Statement implements Check {
    public to_string(): string {
        return "loop";
    }

    public syntaxCheck(): void {
        // 检查loop语句是否在function或method内部
        let hasValidParent = false;
        let current: NodeAst | null = this.parent;
        
        while (current) {
            if (current instanceof Func || current instanceof Method ||
                current instanceof zinc.Func || current instanceof zinc.Method) {
                hasValidParent = true;
                break;
            }
            current = current.parent;
        }
        
        if (!hasValidParent) {
            this.document.errorCollection.errors.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: "loop statement must be inside a function or method body"
            });
        }

        // 检查loop是否包含exitwhen语句
        let hasExitwhen = false;
        const checkChildren = (parent: NodeAst): void => {
            for (const child of parent.children) {
                // 找到exitwhen语句
                if (child.start_token && child.start_token.getText() === 'exitwhen') {
                    hasExitwhen = true;
                    return;
                }
                // 递归检查（但不进入嵌套的loop）
                if (!(child instanceof Loop)) {
                    checkChildren(child);
                }
            }
        };
        
        checkChildren(this);
        
        if (!hasExitwhen) {
            // 添加警告而不是错误
            this.document.errorCollection.warnings.push({
                start: {
                    line: this.start_token!.line,
                    position: this.start_token!.character
                },
                end: {
                    line: this.start_token!.line,
                    position: this.start_token!.character + this.start_token!.length
                },
                message: `loop at line ${this.start_token!.line + 1} does not contain 'exitwhen' statement (potential infinite loop)`
            });
        }
    }
}

export function parse_if(document: Document, tokens: Token[]) {
    const ifs = new If(document);

    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "if") {
                ifs.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "then") {
                        document.add_token_error(next_token, `missing boolean expression`);
                        state = 2;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `error if expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'if'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ifs.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 2;
            } else {
                document.add_token_error(token, `missing keyword 'then'`);
                break;
            }
        } else if (state == 2) {
            index++;

            if (text == "then") {
                state = 3;
            }
            else {
                document.add_token_error(token, `'if' statement needs to end with the keyword 'then'`);
                break;
            }
        } else if (state == 3) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ifs;
}
export function parse_loop(document: Document, tokens: Token[]) {
    const loop = new Loop(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "loop") {
                loop.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return loop;
}

export class Comment extends NodeAst {
    comment: Token | null = null;

    public get content(): string {
        if (this.comment) {
            const text = this.comment.getText().replace(/^\/\//, "");
            return text;
        }
        return "";
    }

    public get is_deprecated(): boolean {
        if (this.comment) {
            return /^\/\/\s*@[dD]eprecated\b/.test(this.comment.getText());
        }
        return false;
    }

    public get is_param(): boolean {
        if (this.comment) {
            return /^\/\/\s*@[pP]arams?\b/.test(this.comment.getText());
        }
        return false;
    }
}

export function parse_line_comment(document: Document, tokens: Token[]) {
    const comment = new Comment(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (token.is_comment) {
                comment.comment = token;

                comment.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return comment;
}




export class GlobalVariable extends NodeAst {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;

    type: Token | null = null;
    name: Token | null = null;
    array_token: Token | null = null;

    expr: Expression | null = null;

    public is_array: boolean = false;
    public size_expr: IndexExpr|null = null;
    
    public get is_constant() : boolean {
        return this.qualifier !== null && this.qualifier.getText() == "constant";
    }
    public get is_private(): boolean {
        return !!this.visible && this.visible.getText() == "private";
    }
    public get is_public(): boolean {
        return !this.is_private;
    }

    public get is_static(): boolean {
        return this.modifier !== null && this.modifier.getText() == "static";
    }

    public get is_stub(): boolean {
        return this.modifier !== null && this.modifier.getText() == "stub";
    }
    

    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const type_string = this.type ? this.type.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const array_string = this.array_token ?  "array " : "";
        const size_string = this.size_expr ? this.size_expr.to_string() : "";
        return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}${size_string}`;
    }

    public with(statement: LocalStatement | Modifier) {
        if (statement instanceof LocalStatement) {
            this.type = statement.type;
            this.name = statement.name;
            this.array_token = statement.array_token;
            this.is_array = statement.is_array;
            this.size_expr = statement.size_expr;
            this.expr = statement.expr;
        } else if (statement instanceof Modifier) {
            this.visible = statement.visible;
            this.modifier = statement.modifier;
            this.qualifier = statement.qualifier;
        }
    }
}

export class Delegate extends NodeAst {
    // [public, private]
    public visible: Token | null = null;
    // [optional]
    public optional: Token | null = null;
    
    // delegate type (the struct/interface being delegated to)
    public delegateType: Token | null = null;
    // delegate field name
    public name: Token | null = null;
    
    public get is_private(): boolean {
        return !!this.visible && this.visible.getText() == "private";
    }
    
    public get is_public(): boolean {
        return !this.is_private;
    }
    
    public get is_optional(): boolean {
        return !!this.optional;
    }
    
    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const optional_string = this.optional ? this.optional.getText() + " " : "";
        const delegate_type_string = this.delegateType ? this.delegateType.getText() + " " : "";
        const name_string = this.name ? this.name.getText() : "";
        return `delegate ${visible_string}${optional_string}${delegate_type_string}${name_string}`;
    }
}

export class Member extends NodeAst {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;
    /**
     * 检查是否为静态成员
     */
    public get is_static(): boolean {
        return !!this.modifier && this.modifier.getText() === "static";
    }
    /**
     * 检查是否为私有成员
     */
    public get is_private(): boolean {
        return !!this.visible && this.visible.getText() === "private";
    }
    /**
     * 检查是否为公有成员
     */
    public get is_public(): boolean {
        return !this.is_private;
    }
    /**
     * 检查是否为常量
     */
    public get is_constant(): boolean {
        return !!this.qualifier && this.qualifier.getText() === "constant";
    }
    /**
     * 设置成员属性
     */
    public with(statement: LocalStatement | Modifier) {
        if (statement instanceof LocalStatement) {
            this.type = statement.type;
            this.name = statement.name;
            this.array_token = statement.array_token;
            this.is_array = statement.is_array;
            this.expr = statement.expr;
            this.size_expr = statement.size_expr;
        } else if (statement instanceof Modifier) {
            this.visible = statement.visible;
            this.modifier = statement.modifier;
            this.qualifier = statement.qualifier;
        }
    }

    type: Token | null = null;
    name: Token | null = null;
    array_token: Token | null = null;

    expr: Expression | null = null;

    public is_array: boolean = false;
    public size_expr: IndexExpr|null = null;
    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const type_string = this.type ? this.type.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const array_string = this.array_token ?  "array " : "";
        const size_string = this.size_expr ? this.size_expr.to_string() : "";
        return `${visible_string}${modifier_string}${qualifier_string}${type_string}${array_string}${name_string}${size_string}`;
    }
}
export class Local extends NodeAst implements Check {
    // [public, private]
    public visible: Token | null = null;
    // [static, stub]
    public modifier: Token | null = null;
    // [constant]
    public qualifier: Token | null = null;
    /**
     * 设置局部变量属性
     */
    public with(statement: LocalStatement | Modifier) {
        if (statement instanceof LocalStatement) {
            this.type = statement.type;
            this.name = statement.name;
            this.array_token = statement.array_token;
            this.is_array = statement.is_array;
            this.expr = statement.expr;
            this.size_expr = statement.size_expr;
        } else if (statement instanceof Modifier) {
            this.visible = statement.visible;
            this.modifier = statement.modifier;
            this.qualifier = statement.qualifier;
        }
    }

    type: Token | null = null;
    name: Token | null = null;
    array_token: Token | null = null;

    expr: Expression | null = null;

    public is_array: boolean = false;
    public size_expr: IndexExpr|null = null;
    public to_string(): string {
        const visible_string = this.visible ? this.visible.getText() + " " : "";
        const modifier_string = this.modifier ? this.modifier.getText() + " " : "";
        const qualifier_string = this.qualifier ? this.qualifier.getText() + " " : "";
        const type_string = this.type ? this.type.getText() + " " : "";
        const name_string = this.name ? this.name.getText() + " " : "";
        const array_string = this.array_token ?  "array " : "";
        const size_string = this.size_expr ? this.size_expr.to_string() : "";
        return `${visible_string}${modifier_string}${qualifier_string}local ${type_string}${array_string}${name_string}${size_string}`;
    }

    syntaxCheck(): void {
        const errorToken = this.name ?? this.start_token!;
        
        if (!this.parent) {
            this.document.errorCollection.errors.push({
                start: {
                    line: errorToken.line,
                    position: errorToken.character
                },
                end: {
                    line: errorToken.line,
                    position: errorToken.character + errorToken.length
                },
                message: `local variable must be inside a function or method`
            });
        } else {
            if (this.parent instanceof Func || this.parent instanceof Method) {
                let temp_previous = this.previous;
                // local 必须定义在最前面
                while (temp_previous) {
                    if (temp_previous instanceof Local || temp_previous instanceof Comment) {
                        temp_previous = temp_previous.previous;
                        continue;
                    } else {
                        this.document.errorCollection.errors.push({
                            start: {
                                line: errorToken.line,
                                position: errorToken.character
                            },
                            end: {
                                line: errorToken.line,
                                position: errorToken.character + errorToken.length
                            },
                            message: `local variable must be defined at the beginning of the function or method`
                        });
                        break;
                    }
                }
            } else {
                this.document.errorCollection.errors.push({
                    start: {
                        line: errorToken.line,
                        position: errorToken.character
                    },
                    end: {
                        line: errorToken.line,
                        position: errorToken.character + errorToken.length
                    },
                    message: `local variable must be inside a function or method`
                });
            }
        }
    }
}
/**
 * 表达式联合类型 - 表示所有可能的表达式节点类型
 * 用于类型安全的表达式处理，替代原来的 Expression 类型
 */
export type Expression = 
    | BinaryExpr 
    | UnaryExpr 
    | Value 
    | VariableName 
    | PriorityExpr 
    | FunctionExpr 
    | MemberAccess
    | Caller
    | IdIndex
    | IndexExpr;

/**
 * 代码生成选项
 */
export interface CodeGenerationOptions {
    /** 缩进字符串，默认为 "  " (两个空格) */
    indent?: string;
    /** 当前缩进级别，默认为 0 */
    indentLevel?: number;
    /** 是否在操作符周围添加空格，默认为 true */
    addSpacesAroundOperators?: boolean;
    /** 是否在括号周围添加空格，默认为 false */
    addSpacesAroundParentheses?: boolean;
    /** 是否在逗号后添加空格，默认为 true */
    addSpaceAfterComma?: boolean;
    /** 是否保持原始格式，默认为 false */
    preserveOriginalFormat?: boolean;
    /** 是否添加类型注释，默认为 false */
    addTypeAnnotations?: boolean;
}

export interface ExprTrict {
    to_string(): string;
    
    /**
     * 将 AST 节点转换为完整的代码字符串
     * 支持格式化选项，用于代码生成和重构
     * @param options 格式化选项
     * @returns 生成的代码字符串
     */
    toCodeString(options?: CodeGenerationOptions): string;
}

interface TypeInference {
    getType(): string;
}

export abstract class Expr extends NodeAst implements TypeInference {
    private static typeInferencer: TypeInferencer = new TypeInferencer();

    constructor(document: Document) {
        super(document);
    }

    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr(this.document);
        expr.left = <any>this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }

    /**
     * 获取表达式的类型 - 使用类型推断器
     */
    public getType(): string {
        return Expr.typeInferencer.inferExpressionType(this);
    }

    /**
     * 通用的错误报告方法 - 统一错误报告方式
     */
    protected reportError(message: string, token?: Token): void {
        const errorToken = token || this.start_token || this.end_token;
        if (errorToken) {
            this.document.add_token_error(errorToken, message);
        }
    }

    /**
     * 检查必需字段是否存在，如果不存在则报告错误
     */
    protected checkRequiredField(field: any, fieldName: string, token?: Token): boolean {
        if (!field) {
            this.reportError(`${this.constructor.name} missing ${fieldName}`, token);
            return false;
        }
        return true;
    }

    /**
     * 默认的代码生成实现
     * 子类可以重写此方法以提供更精确的代码生成
     */
    public toCodeString(options?: CodeGenerationOptions): string {
        // 使用默认选项
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        // 默认实现使用 to_string() 方法
        let code = (this as any).to_string();
        
        // 如果启用了类型注释，尝试添加类型信息
        if (opts.addTypeAnnotations) {
            const type = this.getType();
            if (type && type !== "unknown") {
                code += ` /* ${type} */`;
            }
        }
        
        return code;
    }

    /**
     * 设置类型推断器实例
     */
    public static setTypeInferencer(inferencer: TypeInferencer): void {
        Expr.typeInferencer = inferencer;
    }

    /**
     * 获取包含此表达式的语句节点
     * 通过遍历父节点链找到最近的语句节点
     */
    public getContainingStatement(): NodeAst | null {
        let current: NodeAst | null = this.parent;
        while (current) {
            // 检查是否是语句类型
            if (current instanceof Set || current instanceof Call || 
                current instanceof If || current instanceof Loop ||
                current instanceof Return || current instanceof ExitWhen) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }

    /**
     * 获取包含此表达式的函数或方法节点
     */
    public getContainingFunction(): NodeAst | null {
        let current: NodeAst | null = this.parent;
        while (current) {
            if (current instanceof Func || current instanceof Method ||
                current instanceof zinc.Func || current instanceof zinc.Method) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }

    /**
     * 接受访问器，支持 AST 遍历
     */
    public accept(visitor: ASTVisitor): void {
        // 根据表达式类型调用相应的访问方法
        if (this instanceof Value) {
            visitor.visitValue?.(this);
        } else if (this instanceof BinaryExpr) {
            visitor.visitBinaryExpr?.(this);
        } else if (this instanceof UnaryExpr) {
            visitor.visitUnaryExpr?.(this);
        } else if (this instanceof PriorityExpr) {
            visitor.visitPriorityExpr?.(this);
        } else if (this instanceof Id) {
            visitor.visitId?.(this);
        } else if (this instanceof VariableName) {
            visitor.visitVariableName?.(this);
        } else if (this instanceof MemberAccess) {
            visitor.visitMemberAccess?.(this);
        }
        
        // 访问子表达式
        for (const child of this.children) {
            if (child instanceof Expr) {
                child.accept(visitor);
            }
        }
    }
}
export class Value extends Expr implements ExprTrict, Check {
    public value: Token | null = null;

    constructor(document: Document) {
        super(document);
    }

    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr(this.document);
        expr.left = this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }

    to_string(): string {
        let expr = "";
        if (this.value) {
            expr = this.value.getText();
        }
        return expr;
    }

    public syntaxCheck(): void {
        // Value类本身不需要特殊检查，字面量值通常是有效的
        // 可以添加一些基本的字面量格式检查
        if (this.value) {
            const text = this.value.getText();
            // 检查字符串字面量是否正确闭合
            if (this.value.type === "String" && !text.startsWith('"') && !text.endsWith('"')) {
                this.document.add_token_error(this.value, `Invalid string literal format: ${text}`);
            }
        }
    }

}

export class BinaryExpr extends Expr implements ExprTrict, Check {
    left: Expression | null = null;
    right: Expression | null = null;
    op: Token | null = null;

    constructor(document: Document) {
        super(document);
    }

    to_string(): string {
        const leftStr = this.left?.to_string() ?? "unknown";
        const opStr = this.op?.getText() ?? "unknown";
        const rightStr = this.right?.to_string() ?? "unknown";
        return `${leftStr} ${opStr} ${rightStr}`;
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        const leftStr = this.left?.toCodeString(opts) ?? "unknown";
        const opStr = this.op?.getText() ?? "unknown";
        const rightStr = this.right?.toCodeString(opts) ?? "unknown";
        
        // 根据选项决定是否在操作符周围添加空格
        const space = opts.addSpacesAroundOperators ? " " : "";
        let code = `${leftStr}${space}${opStr}${space}${rightStr}`;
        
        // 添加类型注释
        if (opts.addTypeAnnotations) {
            const type = this.getType();
            if (type && type !== "unknown") {
                code += ` /* ${type} */`;
            }
        }
        
        return code;
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.op, "operator");
        this.checkRequiredField(this.left, "left operand");
        this.checkRequiredField(this.right, "right operand");
    }

}
export class UnaryExpr extends Expr implements ExprTrict, Check {
    op: Token | null = null;
    value: Expression | null = null;

    constructor(document: Document) {
        super(document);
    }

    public convert_to_binary_expr(F: UnaryExpr) {
        const expr = new BinaryExpr(this.document);
        expr.left = this;
        expr.right = F.value;
        expr.op = F.op;
        return expr;
    }

    to_string(): string {
        return `${this.op?.getText() ?? "+"}${this.value?.to_string() ?? "unkown"}`;
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        const opStr = this.op?.getText() ?? "+";
        const valueStr = this.value?.toCodeString(opts) ?? "unknown";
        
        // 一元操作符通常不需要空格，但某些操作符（如 not）可能需要
        const needsSpace = (opStr === "not" && opts.addSpacesAroundOperators);
        const space = needsSpace ? " " : "";
        let code = `${opStr}${space}${valueStr}`;
        
        // 添加类型注释
        if (opts.addTypeAnnotations) {
            const type = this.getType();
            if (type && type !== "unknown") {
                code += ` /* ${type} */`;
            }
        }
        
        return code;
    }

    public syntaxCheck(): void {
        if (!this.checkRequiredField(this.op, "operator")) {
            return;
        }
        
        this.checkRequiredField(this.value, "operand");

        // 检查一元操作符的合理性
        if (this.op) {
            const opText = this.op.getText();
            const validUnaryOperators = ['+', '-', 'not', '!'];
            if (!validUnaryOperators.includes(opText)) {
                this.reportError(`Invalid unary operator: ${opText}`, this.op);
            }
        }
    }

}
export class IndexExpr extends Expr implements ExprTrict {
    expr: Expression | null = null;

    constructor(document: Document) {
        super(document);
    }

    to_string(): string {
        return `[${this.expr?.to_string() ?? "∞"}]`;
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.expr, "expression");
    }
}
export class PriorityExpr extends Expr implements ExprTrict, Check {
    expr: Expression | null = null;

    constructor(document: Document) {
        super(document);
    }

    to_string(): string {
        if (this.expr) {
            return `(${this.expr.to_string()})`;
        }
        return "unkown";
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        if (this.expr) {
            const exprStr = this.expr.toCodeString(opts);
            const leftSpace = opts.addSpacesAroundParentheses ? " " : "";
            const rightSpace = opts.addSpacesAroundParentheses ? " " : "";
            let code = `(${leftSpace}${exprStr}${rightSpace})`;
            
            // 添加类型注释
            if (opts.addTypeAnnotations) {
                const type = this.getType();
                if (type && type !== "unknown") {
                    code += ` /* ${type} */`;
                }
            }
            
            return code;
        }
        return "unknown";
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.expr, "inner expression");
    }

}
export class Id extends Expr implements ExprTrict {
    public expr: Token | null = null;
    public isThisReference: boolean = false; // 标记是否为this引用

    constructor(document: Document) {
        super(document);
    }

    public to_string() {
        if (this.isThisReference) {
            return "this";
        }
        if (this.expr) {
            return this.expr.getText();
        } else {
            return "unkown";
        }
    }

    public to<T extends Params | IndexExpr | null>(document: Document, v: T) {
        if (v instanceof Params) {
            const caller = new Caller(document);
            caller.name = this;
            caller.params = v;
            return caller;
        } else if (v instanceof IndexExpr) {
            const expr = new IdIndex(document);
            expr.name = this;
            expr.index_expr = v;
            return expr;
        } else {
            return this as Id;
        }
    }

}
export class Caller extends Expr implements ExprTrict {
    public name: Id | MemberAccess | Caller | null = null;
    public params: Params | null = null;

    constructor(document: Document) {
        super(document);
    }

    public to_string(): string {
        if (this.name) {
            const nameStr = this.name instanceof Id ? this.name.to_string() : this.name.to_string();
            if (this.params) {
                return `${nameStr}${this.params.to_string()}`;
            } else {
                return `${nameStr}'('missing')'`;
            }
        } else {
            return "unknown";
        }
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        if (this.name) {
            const nameStr = this.name.toCodeString(opts);
            if (this.params) {
                const paramsStr = this.params.toCodeString(opts);
                let code = `${nameStr}${paramsStr}`;
                
                // 添加类型注释
                if (opts.addTypeAnnotations) {
                    const type = this.getType();
                    if (type && type !== "unknown") {
                        code += ` /* ${type} */`;
                    }
                }
                
                return code;
            } else {
                return `${nameStr}()`;
            }
        } else {
            return "unknown";
        }
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.name, "name");
        this.checkRequiredField(this.params, "parameters");
    }

}
export class IdIndex extends Expr implements ExprTrict {
    public name: Id | MemberAccess | null = null;
    public index_expr: IndexExpr | null = null;

    constructor(document: Document) {
        super(document);
    }

    public to_string() {
        if (this.name) {
            if (this.index_expr) {
                return `${this.name.to_string()}${this.index_expr.to_string()}`;
            } else {
                return `${this.name.to_string()}'['missing']'`;
            }
        } else {
            return "unknown";
        }
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.name, "name");
        this.checkRequiredField(this.index_expr, "index expression");
    }
}
/**
 * 成员访问表达式 - 表示 left.right 的语法结构
 * 这是 vJASS 中变量名的核心结构，支持链式访问如 a.b.c.d
 */
export class MemberAccess extends Expr implements ExprTrict, Check {
    public left: Expr | null = null;  // 左侧表达式（可以是 Id、MemberAccess、Caller 等）
    public right: Expr | null = null; // 右侧表达式（通常是 Id）
    public dotToken: Token | null = null; // '.' 操作符的 token

    constructor(document: Document) {
        super(document);
    }

    public to_string(): string {
        if (this.left && this.right) {
            const leftStr = this.getExpressionString(this.left);
            const rightStr = this.getExpressionString(this.right);
            return `${leftStr}.${rightStr}`;
        } else if (this.left) {
            const leftStr = this.getExpressionString(this.left);
            return `${leftStr}.`;
        } else if (this.right) {
            const rightStr = this.getExpressionString(this.right);
            return `.${rightStr}`;
        } else {
            return "unknown";
        }
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        if (this.left && this.right) {
            let leftStr: string;
            
            // 检查左侧是否为this引用
            if (this.left instanceof Id && this.left.isThisReference) {
                leftStr = "this";
            } else {
                leftStr = this.left.toCodeString(opts);
            }
            
            const rightStr = this.right.toCodeString(opts);
            let code = `${leftStr}.${rightStr}`;
            
            // 添加类型注释
            if (opts.addTypeAnnotations) {
                const type = this.getType();
                if (type && type !== "unknown") {
                    code += ` /* ${type} */`;
                }
            }
            
            return code;
        } else if (this.left) {
            let leftStr: string;
            if (this.left instanceof Id && this.left.isThisReference) {
                leftStr = "this";
            } else {
                leftStr = this.left.toCodeString(opts);
            }
            return `${leftStr}.`;
        } else if (this.right) {
            const rightStr = this.right.toCodeString(opts);
            return `.${rightStr}`;
        } else {
            return "unknown";
        }
    }

    private getExpressionString(expr: Expr): string {
        if (expr instanceof Id) {
            if (expr.isThisReference) {
                return "this";
            }
            return expr.expr?.getText() || "unknown";
        } else if (expr instanceof MemberAccess) {
            return expr.to_string();
        } else if (expr instanceof Caller) {
            return expr.to_string();
        } else if (expr instanceof IdIndex) {
            return expr.to_string();
        } else {
            return "unknown";
        }
    }

    public syntaxCheck(): void {
        this.checkRequiredField(this.left, "left operand");
        this.checkRequiredField(this.right, "right operand");
        this.checkRequiredField(this.dotToken, "dot operator");
    }


    /**
     * 设置左侧表达式并建立父子关系
     */
    public setLeftExpression(left: Expr): void {
        this.left = left;
        if (left) {
            left.parent = this;
            this.children.push(left);
        }
    }

    /**
     * 设置右侧表达式并建立父子关系
     */
    public setRightExpression(right: Expr): void {
        this.right = right;
        if (right) {
            right.parent = this;
            this.children.push(right);
        }
    }

    /**
     * 设置点操作符
     */
    public setDotToken(dotToken: Token): void {
        this.dotToken = dotToken;
    }

    /**
     * 获取完整的变量名路径（递归展开所有成员访问）
     */
    public getFullPath(): string[] {
        const path: string[] = [];
        
        // 递归收集左侧路径
        if (this.left instanceof MemberAccess) {
            path.push(...this.left.getFullPath());
        } else if (this.left instanceof Id) {
            path.push(this.left.expr?.getText() || "unknown");
        }

        // 添加右侧
        if (this.right instanceof Id) {
            path.push(this.right.expr?.getText() || "unknown");
        }

        return path;
    }

    /**
     * 检查是否是简单的标识符（没有成员访问）
     */
    public isSimpleIdentifier(): boolean {
        return this.left instanceof Id && !this.right;
    }
}

/**
 * 变量名表达式 - 可以是简单的 Id 或复杂的 MemberAccess
 * 这是 VariableName 的新实现，更符合 vJASS 语法
 */
export class VariableName extends Expr implements ExprTrict, Check {
    public expression: Expr | null = null; // 可以是 Id 或 MemberAccess

    constructor(document: Document) {
        super(document);
    }

    public to_string(): string {
        if (!this.expression) {
            return "unknown";
        }
        
        if (this.expression instanceof Id) {
            return this.expression.expr?.getText() || "unknown";
        } else if (this.expression instanceof MemberAccess) {
            return this.expression.to_string();
        } else if (this.expression instanceof Caller) {
            return this.expression.to_string();
        } else if (this.expression instanceof IdIndex) {
            return this.expression.to_string();
        } else {
            return "unknown";
        }
    }

    public syntaxCheck(): void {
        if (!this.expression) {
            this.document.errorCollection.errors.push({
                start: { line: 0, position: 0 },
                end: { line: 0, position: 0 },
                message: "Variable name expression is missing"
            });
        }
    }


    /**
     * 设置变量名表达式并建立父子关系
     */
    public setExpression(expression: Expr): void {
        this.expression = expression;
        if (expression) {
            expression.parent = this;
            this.children.push(expression);
        }
    }

    /**
     * 获取完整的变量名路径
     */
    public getFullPath(): string[] {
        if (this.expression instanceof MemberAccess) {
            return this.expression.getFullPath();
        } else if (this.expression instanceof Id) {
            return [this.expression.expr?.getText() || "unknown"];
        }
        return [];
    }

    /**
     * 检查是否是简单的标识符
     */
    public isSimpleIdentifier(): boolean {
        return this.expression instanceof Id;
    }
}
export class FunctionExpr extends Expr implements ExprTrict, Check {
    name: VariableName | null = null;
    returns: Token | null = null; // 返回类型（用于匿名函数）

    constructor(document: Document) {
        super(document);
    }

    public to_string() {
        if (this.name) {
            return `function ${this.name.to_string()}`;
        } else if (this.returns) {
            return `function () -> ${this.returns.getText()}`;
        } else {
            return `function ()`;
        }
        return "function unkown";
    }

    public syntaxCheck(): void {
        // 检查函数名是否存在
        if (!this.name) {
            console.warn("Function expression missing function name");
            return;
        }

        // 检查函数名格式
        const funcName = this.name.to_string();
        if (funcName.includes(" ") || funcName.includes("  ") || funcName.startsWith(".") || funcName.endsWith(".")) {
            console.warn(`Invalid function name format: ${funcName}`);
        }
    }

}
export class Params implements ExprTrict {
    public args: (Expression | null)[] = [];

    public to_string() {
        let name = this.args.map(arg => {
            if (arg) {
                return arg.to_string();
            } else {
                return "(unkown)";
            }
        }).join(", ");
        return `(${name})`;
    }

    public toCodeString(options?: CodeGenerationOptions): string {
        const opts: Required<CodeGenerationOptions> = {
            indent: options?.indent ?? "  ",
            indentLevel: options?.indentLevel ?? 0,
            addSpacesAroundOperators: options?.addSpacesAroundOperators ?? true,
            addSpacesAroundParentheses: options?.addSpacesAroundParentheses ?? false,
            addSpaceAfterComma: options?.addSpaceAfterComma ?? true,
            preserveOriginalFormat: options?.preserveOriginalFormat ?? false,
            addTypeAnnotations: options?.addTypeAnnotations ?? false
        };

        const argsStr = this.args.map(arg => {
            if (arg) {
                return arg.toCodeString(opts);
            } else {
                return "unknown";
            }
        }).join(opts.addSpaceAfterComma ? ", " : ",");
        
        return `(${argsStr})`;
    }
}
// export class VariableCall extends VariableName implements ExprTrict {
//     public params: Params|null = null;

//     // public to_string() {
//     //     let name = "";
//     //     if (this.current) {
//     //         name += this.current.getText();
//     //         if (this.child) {
//     //             name += ".";
//     //             name += this.child.to_string();
//     //         }
//     //     }
//     //     if (this.index_expr) {
//     //         name += `[]`;
//     //     }
//     //     return name;
//     // }

//     public static from(var_name: VariableName) {
//         const self = new VariableCall();
//         self.names = [...var_name.names];
//         self.index_expr = var_name.index_expr;

//         return self;
//     }

//     public to_string() {
//         let name = super.to_string() as string;
//         if (this.params) {
//             name += this.params.to_string();
//         } else {
//             name += "()";
//         }
//         return name;
//     }
// }


export class Set extends Statement {
    name: VariableName | null = null;
    init: Expression | null = null;

    public to_string(): string {
        let name = "";
        if (this.name) {
            name += this.name.to_string();
            // if (this.name.index_expr) {
            //     if (this.name.index_expr) {
            //         name += this.name.index_expr.to_string();
            //     }
            // }
        }
        let init = "unkown";
        if (this.init) {
            init = this.init.to_string();
        }
        return `set ${name} = ${init}`
    }

    /**
     * 设置变量名表达式并建立父子关系
     */
    public setVariableName(name: VariableName): void {
        this.name = name;
        if (name) {
            name.parent = this;
            this.children.push(name);
        }
    }

    /**
     * 设置初始化表达式并建立父子关系
     */
    public setInitExpression(init: Expression): void {
        this.init = init;
        if (init && init instanceof Expr) {
            init.parent = this;
            this.children.push(init);
        }
    }
}
export class Type extends NodeAst {
    name: Token | null = null;
    extends: Token | null = null;

    to_string(): string {
        return `type ${this.name ? this.name.getText() : "(unkown)"}${this.extends && this.extends.length > 0 ? " extends " + this.extends.getText() : ""}`;
    }
}
export class Call extends Statement {
    ref: VariableName | null = null;

    constructor(document: Document) {
        super(document);
    }

    to_string(): string {
        return `call ${this.ref?.to_string() ?? "()"}`;
    }

    /**
     * 设置函数调用引用并建立父子关系
     */
    public setFunctionRef(ref: VariableName): void {
        this.ref = ref;
        if (ref) {
            ref.parent = this;
            this.children.push(ref);
        }
    }
}
export class Return extends Statement {
    expr: Expression | null = null;

    public to_string(): string {
        return `return ${this.expr ? this.expr.to_string() : ""}`;
    }

    /**
     * 设置返回表达式并建立父子关系
     */
    public setReturnExpression(expr: Expression): void {
        this.expr = expr;
        if (expr && expr instanceof Expr) {
            expr.parent = this;
            this.children.push(expr);
        }
    }
}


export function parse_line_global(document: Document, tokens: Token[]) {
    const global = new GlobalVariable(document);

    let index = 0;
    let state = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            global.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 1
            } else {
                document.add_token_error(token, `error global variable`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_statement(document, tokens, index, null);
            index = result.index;
            global.with(result.expr);
            break;
        }
    }
    return global;
}
/**
 * 解析本地变量声明
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的本地变量节点
 */
export function parse_line_local(document: Document, tokens: Token[]): Local {
    const local = new Local(document);
    let index = 0;
    let state = 0;
    let unary_expr: UnaryExpr | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            index++;

            if (text == "local") {
                // 使用 pushToken 方法设置 start_token
                local.pushToken(token);

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.is_identifier) {
                        state = 1;
                    } else {
                        document.add_token_error(next_token, `error type`);
                        break;
                    }
                } else {
                    document.add_token_error(token, `incomplete local expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_statement(document, tokens, index, false);
            index = result.index;
            local.with(result.expr);
            
            // 处理所有 token，使用 pushToken 更新 end_token
            for (let i = 0; i < index && i < tokens.length; i++) {
                local.pushToken(tokens[i]);
            }
            break;
        }
    }
    return local;
}

class Expr_ {
    expr: Expression | null = null;
    op: Token | null = null;
    document: Document;

    constructor(document: Document) {
        this.document = document;
    }

    public to_expr(right_value: Expression | null) {
        const expr = new BinaryExpr(this.document);
        expr.left = this.expr;
        expr.op = this.op;
        expr.right = right_value;

        return expr;
    }
}


function parse_line_unary_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let unary_expr: UnaryExpr | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        // const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (token.is_unary_operator || (token.is_identifier && token.getText() === "not")) {
                unary_expr = new UnaryExpr(document);
                unary_expr.op = token;

                if (next_token) {
                    state = 1;
                } else {
                    document.add_token_error(token, `wrong unary expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `wrong unary expression`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            unary_expr!.value = result.expr;

            break;
        }
    }

    return {
        index,
        expr: unary_expr
    };
}
function parse_line_function_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let zoom: FunctionExpr | null = new FunctionExpr(document);
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;
            if (text == "function") {
                state = 1;
            } else {
                document.add_token_error(token, `function references need to start with the 'function' keyword`);
                break;
            }
        } else if (state == 1) {
            // 检查是否是匿名函数：function () -> type { ... }
            if (text == "(") {
                // 匿名函数，跳过名称解析，直接解析参数
                zoom.name = null; // 匿名函数没有名称
                state = 2;
            } else {
                // 函数引用：function MyFunc
                const result = parse_line_name_reference(document, tokens, index);
                index = result.index;
                if (result.expr) {
                    zoom.name = result.expr;
                } else {
                    document.add_token_error(token, `no function reference found`);
                }
                break;
            }
        } else if (state == 2) {
            // 解析匿名函数的参数列表
            if (text == ")") {
                index++;
                state = 3;
            } else {
                // 这里可以添加参数解析逻辑，但匿名函数通常没有参数
                index++;
            }
        } else if (state == 3) {
            // 解析返回类型：-> type
            if (text == "->") {
                index++;
                state = 4;
            } else {
                // 没有返回类型声明，默认为nothing
                break;
            }
        } else if (state == 4) {
            // 解析返回类型
            if (token.is_identifier) {
                zoom.returns = token;
                index++;
                break;
            } else {
                document.add_token_error(token, `expected return type after '->'`);
                break;
            }
        }
    }

    return {
        index,
        expr: zoom
    }
}

function parse_line_priority_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let expr: PriorityExpr | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (text == "(") {
                if (expr == null) {
                    expr = new PriorityExpr(document);
                }

                state = 1;
            } else {
                document.add_token_error(token, `the priority expression should start with '(', but what was actually found was '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == ")") {
                index++;
                // 只有在没有解析到任何表达式时才报错
                if (!expr!.expr) {
                    document.add_token_error(token, `the expression cannot be empty`);
                }
                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                // params!.expr = result.expr;
                expr!.expr = result.expr;
                index = result.index;
                state = 2;
            }
        } else if (state == 2) {
            index++;
            if (text == ")") {
            } else {
                document.add_token_error(token, `priority expression not found ')' End token`);
            }
            break;
        }
    }

    return {
        index,
        expr: expr
    }
}
/**
 * 基于优先级的表达式解析器
 * 使用 Pratt 解析器算法正确处理操作符优先级
 */
export function parse_line_expr(document: Document, tokens: Token[], offset_index: number, minPrecedence: number = 0) {
    let index = offset_index;
    
    // 解析左操作数（一元表达式或基础表达式）
    let left: { index: number; expr: Expression | null } = parse_line_primary_expr(document, tokens, index);
    index = left.index;
    
    // 检查左操作数是否存在
    if (!left.expr) {
        return left; // 如果没有左操作数，直接返回
    }
    
    // 处理二元操作符
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        
        const opText = token.getText();
        
        // 检查是否是二元操作符
        if (!token.is_binary_operator) {
            break;
        }
        
        // 获取操作符优先级
        const precedence = OPERATOR_PRECEDENCE[opText];
        if (precedence === undefined) {
            break;
        }
        
        // 如果当前操作符优先级低于最小优先级，停止解析
        if (precedence < minPrecedence) {
            break;
        }
        
        // 对于右结合操作符，使用当前优先级；对于左结合操作符，使用优先级+1
        const nextMinPrecedence = isRightAssociative(opText) ? precedence : precedence + 1;
        
        // 跳过操作符
        index++;
        
        // 递归解析右操作数
        const right = parse_line_expr(document, tokens, index, nextMinPrecedence);
        index = right.index;
        
        // 检查右操作数是否存在
        if (!right.expr) {
            document.add_token_error(token, `Binary operator '${opText}' missing right operand`);
            break;
        }
        
        // 创建二元表达式
        const binaryExpr = new BinaryExpr(document);
        binaryExpr.left = left.expr;
        binaryExpr.op = token;
        binaryExpr.right = right.expr;
        
        // 更新左操作数
        left = {
            index,
            expr: binaryExpr as Expression
        };
    }
    
    return left;
}

/**
 * 解析基础表达式（一元表达式、标识符、字面量、括号表达式等）
 */
function parse_line_primary_expr(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        
        const text = token.getText();
        
        // 处理标识符或点操作符
        if (token.is_identifier || text === ".") {
            if (text === "function") {
                const result = parse_line_function_expr(document, tokens, index);
                return result;
            } else if (text === "not") {
                const result = parse_line_unary_expr(document, tokens, index);
                return result;
            } else {
                let result = parse_line_name_reference(document, tokens, index);
                index = result.index;
                
                // 循环处理可能的函数调用和成员访问
                while (index < tokens.length) {
                    const nextToken = get_next_token(tokens, index);
                    if (!nextToken) break;
                    
                    const nextText = nextToken.getText();
                    
                    if (nextText === "(") {
                        // 解析函数调用参数
                        const paramsResult = parse_line_call_params(document, tokens, index);
                        index = paramsResult.index;
                        
                        // 创建函数调用表达式
                        if (result.expr && result.expr.expression) {
                            if (result.expr.expression instanceof Id) {
                                const callResult: Caller | Id | IdIndex = result.expr.expression.to(document, paramsResult.expr);
                                if (callResult instanceof Caller) {
                                    const variableName = new VariableName(document);
                                    variableName.setExpression(callResult);
                                    result = {
                                        index,
                                        expr: variableName
                                    };
                                    continue; // 继续处理可能的成员访问
                                }
                            } else if (result.expr.expression instanceof MemberAccess) {
                                const caller = new Caller(document);
                                caller.name = result.expr.expression;
                                caller.params = paramsResult.expr;
                                const variableName = new VariableName(document);
                                variableName.setExpression(caller);
                                result = {
                                    index,
                                    expr: variableName
                                };
                                continue; // 继续处理可能的成员访问
                            } else if (result.expr.expression instanceof Caller) {
                                // 对于已经是Caller的情况，我们需要创建一个新的Caller来包装它
                                const newCaller = new Caller(document);
                                newCaller.name = result.expr.expression;
                                newCaller.params = paramsResult.expr;
                                const variableName = new VariableName(document);
                                variableName.setExpression(newCaller);
                                result = {
                                    index,
                                    expr: variableName
                                };
                                continue; // 继续处理可能的成员访问
                            }
                        }
                    } else if (nextText === ".") {
                        // 处理成员访问
                        index++; // 跳过点操作符
                        
                        const nextAfterDot = get_next_token(tokens, index);
                        if (!nextAfterDot || !nextAfterDot.is_identifier) {
                            document.add_token_error(nextToken, `missing member name after '.'`);
                            break;
                        }
                        
                        // 创建右侧标识符
                        const rightId = new Id(document);
                        rightId.expr = nextAfterDot;
                        index++; // 跳过标识符
                        
                        // 创建成员访问表达式
                        const memberAccess = new MemberAccess(document);
                        memberAccess.setLeftExpression(result.expr?.expression || new Id(document));
                        memberAccess.setDotToken(nextToken);
                        memberAccess.setRightExpression(rightId);
                        
                        const variableName = new VariableName(document);
                        variableName.setExpression(memberAccess);
                        result = {
                            index: index, // 确保 index 正确更新
                            expr: variableName
                        };
                        continue; // 继续处理可能的函数调用
                    } else {
                        // 没有更多的函数调用或成员访问
                        break;
                    }
                }
                
                return {
                    index,
                    expr: result.expr
                };
            }
        }
        // 处理字面量值
        else if (token.is_value()) {
            const value = new Value(document);
            value.value = token;
            return {
                index: index + 1,
                expr: value
            };
        }
        // 处理一元操作符
        else if (token.is_unary_operator) {
            const result = parse_line_unary_expr(document, tokens, index);
            return result;
        }
        // 处理括号表达式
        else if (text === "(") {
            const result = parse_line_priority_expr(document, tokens, index);
            return result;
        }
        // 其他情况
        else {
            // 遇到无法识别的 token，报告错误
            document.add_token_error(token, `unexpected token '${text}'`);
            break;
        }
    }
    
    return {
        index,
        expr: null
    };
}

function parse_line_call_params(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let params: Params | null = null;
    let openedParenToken: Token | null = null;
    let foundClosingParen = false; // 标志是否找到了闭合括号
    
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (text == "(") {
                openedParenToken = token; // 记录开始括号的位置
                if (params == null) {
                    params = new Params();
                }

                state = 1;
            } else {
                document.add_token_error(token, `The function or method parameter list needs to start with '(', but the token found is '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == ")") {
                index++;
                foundClosingParen = true; // 标记找到了闭合括号
                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                // params!.expr = result.expr;
                params!.args.push(result.expr);
                index = result.index;
                state = 2;
            }
        } else if (state == 2) {
            index++;
            if (text == ")") {
                foundClosingParen = true; // 标记找到了闭合括号
                break;
            } else if (text == ",") {
                state = 3;
            } else {
                document.add_token_error(token, `needs ',' or ')'`);
            }
        } else if (state == 3) {
            const result = parse_line_expr(document, tokens, index);
            params!.args.push(result.expr);
            index = result.index;

            state = 2;
        }
    }

    // 检查是否缺少闭合括号
    // 只有当没有找到闭合括号且已经开始了参数解析时才报告错误
    if (!foundClosingParen && state > 0) {
        // 如果还在等待参数或逗号，说明缺少闭合括号
        const lastToken = index > 0 ? tokens[index - 1] : tokens[0];
        document.add_token_error(lastToken, `missing closing parenthesis ')'`);
    }

    return {
        index,
        expr: params
    }
}
/**
 *     |---------|
 * 获取 [...exprs] 之间的tokens给parse_line_expr解析
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @param need_index_expr 0 不需要 1 需要 -1 都可以
 */
export function parse_line_index_expr(document: Document, tokens: Token[], offset_index: number, need_index_expr: 0 | 1 | -1 = -1) {
    let index = offset_index;
    let state = 0;
    let index_expr: IndexExpr | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index + 1];
        if (state == 0) {
            index++;

            if (text == "[") {
                if (index_expr == null) {
                    index_expr = new IndexExpr(document);
                }


                state = 1;
            } else {
                document.add_token_error(token, `'['`);
                break;
            }
        } else if (state == 1) {
            if (text == "]") {
                index++;
                if (need_index_expr == 1) {
                    document.add_token_error(token, `missing index expression`);
                }

                break;
            } else {
                const result = parse_line_expr(document, tokens, index);
                index_expr!.expr = result.expr;
                index = result.index;
                state = 2;

                if (need_index_expr == 0) {
                    document.add_token_error(token, `unsupport index expression`);
                }
            }
        } else if (state == 2) {
            index++;
            if (text == "]") {
            } else {
                document.add_token_error(token, `']'`);
            }
            break;
        }
    }

    return {
        index,
        expr: index_expr
    }
}

// function parse_line_caller(document: Document, tokens: Token[], offset_index: number) {
//     let index = offset_index;
//     let state = 0;
//     let variable: VariableCall|null = null;
//     while(index < tokens.length) {
//         const token = tokens[index];
//         if (token.is_block_comment || token.is_comment) {
//             index++;
//             continue;
//         }
//         if (state == 0) {
//             const result = parse_line_name(document, tokens, index);

//             index = result.index;
//             if (result.expr) {
//                 variable = VariableCall.from(result.expr);
//                 state = 1;
//             } else {
//                 document.add_token_error(token, `error function name`);
//                 break;
//             }
//         } else if (state == 1) {
//             const result = parse_line_call_params(document, tokens, index);
//             index = result.index;
//             if (result.expr) {
//                 variable!.params = result.expr;
//             } else {
//                 document.add_token_error(token, `error function params list`);
//             }
//             break;
//         }
//     }

//     return {
//         index,
//         expr: variable
//     }
// }
// function parse_line_name(document: Document, tokens: Token[], offset_index: number) {
//     let index = offset_index;
//     let state = 0;
//     let variable: VariableName|null = null;

//     while(index < tokens.length) {
//         const token = tokens[index];
//         if (token.is_block_comment || token.is_comment) {
//             index++;
//             continue;
//         }
//         const text = token.getText();
//         const next_token = tokens[index + 1];
//         if (state == 0) {
//             index++;

//             if (variable == null) {
//                 variable = new VariableName();
//             }

//             const result = parse_line_name_reference(document, tokens, index);
//             index = result.index;
//             if (result.expr) {
//                 if (result.expr instanceof VariableCall) {
//                     variable.names.push(result.expr);
//                 } else {
//                     variable.names.push(...result.expr.names);
//                 }

//                 const next_token = get_next_token(tokens, index);
//                 if (next_token) {
//                     if (next_token.getText() == ".") {
//                         state = 1;
//                     } else if (next_token.getText() == "[") {
//                         state = 2;
//                     } else {
//                         break;
//                     }
//                 } else {
//                     break;
//                 }
//             } else {
//                 document.add_token_error(token, `error member name '${text}'`);
//                 break; 
//             }



//             // if (next_token) {
//             //     if (next_token.getText() == ".") {
//             //         state = 1;
//             //     } else if (next_token.getText() == "[") {
//             //         state = 2;
//             //     } else {
//             //         break;
//             //     }
//             // } else {
//             //     break;
//             // }
//             // if (token.is_identifier) {
//             // } else {
//             //     document.add_token_error(token, `error member name '${text}'`);
//             //     break; 
//             // }
//         } else if (state == 1) {
//             index++;

//             if (next_token && next_token.is_identifier) {
//                 state = 0;
//             } else {
//                 document.add_token_error(token, `incorrect member name reference '${text}'`);
//                 break;
//             }
//         } else if (state == 2) {
//             const result = parse_line_index_expr(document, tokens, index);
//             variable!.index_expr = result.expr;
//             index = result.index;

//             break;
//         }
//     }

//     return {
//         index,
//         expr: variable
//     };
// }
function parse_line_id(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let state = 0;
    let variable: Id | Caller | IdIndex | null = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        if (state == 0) {
            index++;
            if (token.is_identifier) {
                variable = new Id(document);
                variable.expr = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();

                    if (next_token_text == "(") {
                        state = 1;
                    } else if (next_token_text == "[") {
                        state = 2;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } else {
                document.add_token_error(token, `error identifier '${token.getText()}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_call_params(document, tokens, index);
            index = result.index;
            variable = (<Id>variable).to(document, result.expr);
            // 如果方法没有参数列表,一般不用，因为程序解析不到相应符号会添加相应的错误提示
            // if (result.expr) {
            // } else {
            //     document.add_token_error(token, `error args`);
            // }
            break;
        } else if (state == 2) {
            const result = parse_line_index_expr(document, tokens, index, 1);
            index = result.index;
            variable = (<Id>variable).to(document, result.expr);
            break;
        }
    }

    return {
        index,
        expr: variable
    };
}
/**
 * 解析变量名引用 - 支持简单的 Id 或复杂的 MemberAccess 链
 * 例如: "myVar" 或 "myStruct.myMember" 或 "a.b.c.d"
 */
export function parse_line_name_reference(document: Document, tokens: Token[], offset_index: number) {
    let index = offset_index;
    let currentExpr: Expr | null = null;
    
    while (index < tokens.length) {
        const token = tokens[index];
        
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        
        // 检查是否是单独的点操作符（语法糖：.member 表示 this.member）
        if (token.getText() === ".") {
            // 直接检查下一个 token，不使用 get_next_token
            const nextIndex = index + 1;
            if (nextIndex < tokens.length) {
                const nextToken = tokens[nextIndex];
                if (nextToken && nextToken.is_identifier) {
                    // 创建 this 标识符作为左侧
                    const thisId = new Id(document);
                    thisId.isThisReference = true; // 标记为this引用
                    
                    // 创建成员访问表达式
                    const memberAccess = new MemberAccess(document);
                    memberAccess.setLeftExpression(thisId);
                    memberAccess.setDotToken(token);
                    index++; // 跳过点操作符
                    
                    // 解析右侧的标识符
                    const rightId = new Id(document);
                    rightId.expr = nextToken;
                    memberAccess.setRightExpression(rightId);
                    index++; // 跳过标识符
                    
                    currentExpr = memberAccess;
                    continue;
                } else {
                    // 点操作符后面没有找到标识符，报告错误
                    document.add_token_error(token, `missing member name after '.'`);
                    index++; // 跳过点操作符
                    break;
                }
            } else {
                // 点操作符在tokens末尾，报告错误
                document.add_token_error(token, `missing member name after '.'`);
                index++; // 跳过点操作符
                break;
            }
        }
        
        // 解析标识符
        if (token.is_identifier) {
            const id = new Id(document);
            id.expr = token;
            index++;
            
            // 检查下一个 token 是否是点操作符
            const nextToken = get_next_token(tokens, index);
            if (nextToken && nextToken.getText() === ".") {
                // 创建成员访问表达式
                const memberAccess = new MemberAccess(document);
                memberAccess.setLeftExpression(currentExpr || id);
                memberAccess.setDotToken(nextToken);
                index++; // 跳过点操作符
                
                currentExpr = memberAccess;
                
                // 检查点操作符后面是否有标识符
                const nextAfterDot = get_next_token(tokens, index);
                if (!nextAfterDot || !nextAfterDot.is_identifier) {
                    document.add_token_error(nextToken, `missing member name after '.'`);
                    break;
                }
                // 继续循环，解析点操作符后面的标识符
                continue;
            } else {
                // 没有点操作符，这是一个简单的标识符
                if (currentExpr) {
                    // 如果已经有表达式，将其作为右侧
                    if (currentExpr instanceof MemberAccess) {
                        currentExpr.setRightExpression(id);
                    }
                } else {
                    // 这是第一个标识符
                    currentExpr = id;
                }
                
                // 循环处理可能的函数调用、数组索引和成员访问
                while (index < tokens.length) {
                    const nextToken = get_next_token(tokens, index);
                    if (!nextToken) break;
                    
                    const nextText = nextToken.getText();
                    
                    if (nextText === "(") {
                        // 解析函数调用参数
                        const paramsResult = parse_line_call_params(document, tokens, index);
                        index = paramsResult.index;
                        
                        // 创建函数调用表达式
                        if (currentExpr instanceof Id) {
                            const result: Caller | Id | IdIndex = currentExpr.to(document, paramsResult.expr);
                            if (result instanceof Caller) {
                                currentExpr = result;
                                continue; // 继续检查可能的数组索引和成员访问
                            }
                        } else if (currentExpr instanceof MemberAccess) {
                            // 对于成员访问，需要特殊处理
                            const caller = new Caller(document);
                            caller.name = currentExpr;
                            caller.params = paramsResult.expr;
                            currentExpr = caller;
                            continue; // 继续检查可能的数组索引和成员访问
                        }
                    } else if (nextText === "[") {
                        // 解析数组索引
                        const indexResult = parse_line_index_expr(document, tokens, index, 1);
                        index = indexResult.index;
                        
                        // 创建数组索引表达式
                        if (currentExpr instanceof Id) {
                            const result: Caller | Id | IdIndex = currentExpr.to(document, indexResult.expr);
                            if (result instanceof IdIndex) {
                                currentExpr = result;
                                continue; // 继续检查可能的函数调用和成员访问
                            }
                        } else if (currentExpr instanceof MemberAccess) {
                            // 对于成员访问，需要特殊处理
                            const idIndex = new IdIndex(document);
                            idIndex.name = currentExpr as any; // 临时转换
                            idIndex.index_expr = indexResult.expr;
                            currentExpr = idIndex;
                            continue; // 继续检查可能的函数调用和成员访问
                        } else if (currentExpr instanceof Caller) {
                            // 对于函数调用，需要特殊处理
                            const idIndex = new IdIndex(document);
                            idIndex.name = currentExpr as any; // 临时转换
                            idIndex.index_expr = indexResult.expr;
                            currentExpr = idIndex;
                            continue; // 继续检查可能的函数调用和成员访问
                        }
                    } else if (nextText === ".") {
                        // 处理成员访问
                        index++; // 跳过点操作符
                        
                        const nextAfterDot = get_next_token(tokens, index);
                        if (!nextAfterDot || !nextAfterDot.is_identifier) {
                            document.add_token_error(nextToken, `missing member name after '.'`);
                            break;
                        }
                        
                        // 创建右侧标识符
                        const rightId = new Id(document);
                        rightId.expr = nextAfterDot;
                        index++; // 跳过标识符
                        
                        // 创建成员访问表达式
                        const memberAccess = new MemberAccess(document);
                        memberAccess.setLeftExpression(currentExpr || new Id(document));
                        memberAccess.setDotToken(nextToken);
                        memberAccess.setRightExpression(rightId);
                        
                        currentExpr = memberAccess;
                        continue; // 继续检查可能的函数调用和数组索引
                    } else {
                        // 没有更多的函数调用、数组索引或成员访问
                        break;
                    }
                }
                break;
            }
        } else {
            // 遇到非标识符，结束解析
            break;
        }
    }
    
    // 创建 VariableName 包装
    const variableName = new VariableName(document);
    if (currentExpr) {
        variableName.setExpression(currentExpr);
    }
    
    return {
        index,
        expr: variableName
    };
}

// 跳过注释向前获取下一个token
function get_next_token(tokens: Token[], i: number): Token | null {
    for (let index = i; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        } else {
            return token;
        }
    }
    return null;
}

/**
 * 局部变量声明语句
 */
export class LocalStatement extends Statement {
    type: Token | null = null;
    name: Token | null = null;
    expr: Expression | null = null;
    array_token: Token | null = null;
    public is_array: boolean = false;
    public size_expr: IndexExpr | null = null;

    public to_string(): string {
        const type_string = this.type ? this.type.getText() + " " : "unknown_type ";
        const array_string = this.is_array ? "array " : "";
        const name_string = this.name ? this.name.getText() + " " : "unknown_name ";
        const init_string = this.expr ? "= " + this.expr.to_string() : "";
        return `local ${type_string}${array_string}${name_string}${init_string}`;
    }

    /**
     * 设置变量类型并建立父子关系
     */
    public setType(type: Token): void {
        this.type = type;
    }

    /**
     * 设置变量名并建立父子关系
     */
    public setVariableName(name: Token): void {
        this.name = name;
    }

    /**
     * 设置初始化表达式并建立父子关系
     */
    public setInitExpression(expr: Expression): void {
        this.expr = expr;
        if (expr && expr instanceof Expr) {
            expr.parent = this;
            this.children.push(expr);
        }
    }

    /**
     * 获取变量类型
     */
    public getVariableType(): string {
        return this.type ? this.type.getText() : "unknown";
    }

    /**
     * 获取变量名
     */
    public getVariableName(): string {
        return this.name ? this.name.getText() : "unknown";
    }
}

/**
 * 
 * type [array] name [=] init
 * @param document 
 * @param tokens 
 * @param offset_index 
 * @returns 
 */
export function parse_line_statement(document: Document, tokens: Token[], offset_index: number, need_size_expr: boolean|null = null) {
    const statement = new LocalStatement(document);
    let index = offset_index;
    let state = 1;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 1) {

            index++;
            statement.type = token;

            if (tokens[index]) {
                if (tokens[index].is_identifier) {
                    if (tokens[index].getText() == "array") {
                        state = 3;
                    } else {
                        state = 2;
                    }
                } else {
                    document.add_token_error(tokens[index], `wrong identifier name`);
                    break;
                }
            } else {
                document.add_token_error(token, `name not declared`);
                break;
            }
        } else if (state == 2) {
            index++;
            statement.name = token;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                if (next_token.getText() == "=") {
                    state = 4;
                } else if (next_token.getText() == "[") {
                    state = 7;
                } else {
                    document.add_token_error(next_token, `expected token to be assigned a value of '=', but found '${text}'`);
                    break;
                }
            } else {
                if (statement.is_array && need_size_expr === true) { // 报错:数组size未定义
                    document.add_token_error(token, `array variable declaration requires a size expression`);
                    break;
                } else {
                    break;
                }
                break;
            }
        } else if (state == 3) {
            index++;
            statement.array_token = token;
            statement.is_array = true;

            if (tokens[index]) {
                if (tokens[index].is_identifier) {
                    state = 2;
                } else {
                    document.add_token_error(tokens[index], `wrong identifier name`);
                    break;
                }
            } else {
                document.add_token_error(token, `name not declared`);
                break;
            }
        } else if (state == 4) {
            index++;

            if (tokens[index]) {
                state = 5;
            } else {
                document.add_token_error(token, `initialization expression not found`);
                break;
            }
        } else if (state == 5) {
            const result = parse_line_expr(document, tokens, index);
            index = result.index;
            statement.expr = result.expr;

            state = 6;
        } else if (state == 6) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        } else if (state == 7) { // 数组size
            const result = parse_line_index_expr(document, tokens, index, need_size_expr === null ? -1 : need_size_expr ? 1 : 0);
            index = result.index;
            statement.size_expr = result.expr;
            
            if (statement.is_array == false) {
                document.add_token_error(token, `declaring variable size requires the 'array' keyword`);
            }
            
            state = 8;
        } else if (state == 8) {
            index++;
            document.add_token_error(token, `array variable declaration cannot be initialized through assignment`);
            break;
        }
    }
    return {
        expr: statement,
        index,
    };
}

/**
 * 解析赋值语句
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的赋值节点
 */
export function parse_line_set(document: Document, tokens: Token[]): Set {
    const set = new Set(document);
    let state = 0;
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "set") {
                state = 1;
                // 使用 pushToken 方法设置 start_token
                set.pushToken(token);

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    if (next_token.is_identifier || next_token.getText() == ".") {
                        state = 1;
                    } else if (next_token.getText() == "=") {
                        state = 2;
                    } else {
                        state = 4;
                    }
                } else {
                    document.add_token_error(token, `incomplete set expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) { // name
            const result = parse_line_name_reference(document, tokens, index);
            set.name = result.expr;
            index = result.index;
            const next_token = get_next_token(tokens, index);
            
            
            if (next_token) {
                if (next_token.getText() == "=") {
                    state = 2;
                } else {
                    document.add_token_error(token, `assignment symbol  not found`);
                    break;
                }
            } else {
                document.add_token_error(token, `assignment symbol  not found`);
                break;
            }
        } else if (state == 2) { // =
            index++;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 3;
            } else {
                document.add_token_error(token, `not assigned a value to the set syntax`);
                break;
            }
        } else if (state == 3) { // expr
            const result = parse_line_expr(document, tokens, index);
            set.init = result.expr;
            index = result.index;

            state = 4;
        } else if (state == 4) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    // 处理所有 token，使用 pushToken 更新 end_token
    for (let i = 0; i < index && i < tokens.length; i++) {
        set.pushToken(tokens[i]);
    }

    return set;
}
/**
 * 解析函数调用语句
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的调用节点
 */
export function parse_line_call(document: Document, tokens: Token[]): Call {
    const call = new Call(document);
    let state = 0;
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "call") {
                // 使用 pushToken 方法设置 start_token
                call.pushToken(token);
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_name_reference(document, tokens, index);
            call.ref = result.expr;
            index = result.index;
            // 不再进入 state 2，因为 parse_line_name_reference 已经处理了函数调用参数
            break;
        }
    }

    // 处理所有 token，使用 pushToken 更新 end_token
    for (let i = 0; i < index && i < tokens.length; i++) {
        call.pushToken(tokens[i]);
    }

    return call;
}
/**
 * 解析返回语句
 * @param document 文档实例
 * @param tokens Token 数组
 * @returns 解析后的返回节点
 */
export function parse_line_return(document: Document, tokens: Token[]): Return {
    const ret = new Return(document);
    let state = 0;
    let index = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "return") {
                // 使用 pushToken 方法设置 start_token
                ret.pushToken(token);
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;
            state = 2;
        } else if (state == 2) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    // 处理所有 token，使用 pushToken 更新 end_token
    for (let i = 0; i < index && i < tokens.length; i++) {
        ret.pushToken(tokens[i]);
    }

    return ret;
}
export class ExitWhen extends Statement {
    expr: Expression | null = null;

    public to_string(): string {
        return `exitwhen ${this.expr ? this.expr.to_string() : "unknown"}`;
    }

    /**
     * 设置退出条件表达式并建立父子关系
     */
    public setExitExpression(expr: Expression): void {
        this.expr = expr;
        if (expr && expr instanceof Expr) {
            expr.parent = this;
            this.children.push(expr);
        }
    }
}
export function parse_line_exitwhen(document: Document, tokens: Token[]) {
    const ret = new ExitWhen(document);

    let state = 0;
    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        const next_token = tokens[index];

        if (state == 0) {
            index++;
            if (text == "exitwhen") {
                ret.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;

            state = 2;
        } else if (state == 2) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return ret;
}
export class ElseIf extends NodeAst {
    expr: Expression | null = null;
}
export function parse_line_else_if(document: Document, tokens: Token[]) {
    const ret = new ElseIf(document);

    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "elseif") {
                ret.start_token = token;

                const next_token = get_next_token(tokens, index);
                if (next_token) {
                    const next_token_text = next_token.getText();
                    if (next_token_text == "then") {
                        document.add_token_error(next_token, `missing boolean expression`);
                        state = 2;
                    } else {
                        state = 1;
                    }
                } else {
                    document.add_token_error(token, `error elseif expression`);
                    break;
                }
            } else {
                document.add_token_error(token, `missing keyword 'elseif'`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_expr(document, tokens, index);
            ret.expr = result.expr;
            index = result.index;

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                state = 2;
            } else {
                document.add_token_error(token, `missing keyword 'then'`);
                break;
            }
        } else if (state == 2) {
            index++;

            if (text == "then") {
                state = 3;
            }
            else {
                document.add_token_error(token, `'elseif' statement needs to end with the keyword 'then'`);
                break;
            }
        } else if (state == 3) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ret;
}
export class Else extends NodeAst {
    expr: Expression | null = null;
}
export function parse_line_else(document: Document, tokens: Token[]) {
    const ret = new Else(document);

    let state = 0;
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == "else") {
                ret.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `missing keyword 'else'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }

    }

    return ret;
}
export function parse_line_type(document: Document, tokens: Token[]) {
    const ret = new Type(document);

    let state = 0;
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "type") {
                ret.start_token = token;

                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (token.is_identifier) {
                ret.name = token;
                state = 2;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (text == "extends") {
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 3) {
            if (token.is_identifier) {
                ret.extends = token;
                state = 4;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        }
    }

    return ret;
}

export class Implement extends NodeAst {
    public optional: Token | null = null;
    public moduleName: Token | null = null;

    to_string(): string {
        const optionalStr = this.optional ? "optional " : "";
        const moduleStr = this.moduleName ? this.moduleName.getText() : "(unknown)";
        return `implement ${optionalStr}${moduleStr}`;
    }
}

export function parse_line_implement(document: Document, tokens: Token[]): Implement {
    const implement = new Implement(document);
    let state = 0;
    
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            if (text == "implement") {
                implement.start_token = token;
                state = 1;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 1) {
            if (text == "optional") {
                implement.optional = token;
                state = 2;
            } else if (token.is_identifier) {
                implement.moduleName = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else if (state == 2) {
            if (token.is_identifier) {
                implement.moduleName = token;
                state = 3;
            } else {
                document.add_token_error(token, `error token '${text}'`);
                break;
            }
        } else {
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return implement;
}

export function parse_line_native(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "native") as Native;
}
export function parse_line_method(document: Document, tokens: Token[]) {
    return parse_function(document, tokens, "method") as Method;
}
export function parse_line_delegate(document: Document, tokens: Token[]) {
    const delegate = new Delegate(document);

    let index = 0;
    let state = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        
        if (state == 0) {
            // Parse visibility modifier (public/private)
            if (text === "public" || text === "private") {
                delegate.visible = token;
                index++;
                state = 1;
            } else if (text === "delegate") {
                delegate.start_token = token;
                index++;
                state = 2;
            } else {
                document.add_token_error(token, `Expected 'public', 'private', or 'delegate', got '${text}'`);
                break;
            }
        } else if (state == 1) {
            // After visibility modifier, expect 'delegate'
            if (text === "delegate") {
                delegate.start_token = token;
                index++;
                state = 2;
            } else {
                document.add_token_error(token, `Expected 'delegate', got '${text}'`);
                break;
            }
        } else if (state == 2) {
            // After 'delegate', expect 'optional' or type name
            if (text === "optional") {
                delegate.optional = token;
                index++;
                state = 3;
            } else if (token.is_identifier) {
                delegate.delegateType = token;
                index++;
                state = 4;
            } else {
                document.add_token_error(token, `Expected 'optional' or delegate type name, got '${text}'`);
                break;
            }
        } else if (state == 3) {
            // After 'optional', expect type name
            if (token.is_identifier) {
                delegate.delegateType = token;
                index++;
                state = 4;
            } else {
                document.add_token_error(token, `Expected delegate type name, got '${text}'`);
                break;
            }
        } else if (state == 4) {
            // After type name, expect field name
            if (token.is_identifier) {
                delegate.name = token;
                delegate.end_token = token;
                index++;
                break;
            } else {
                document.add_token_error(token, `Expected delegate field name, got '${text}'`);
                break;
            }
        }
    }

    return delegate;
}

export function parse_line_member(document: Document, tokens: Token[]) {
    const member = new Member(document);

    let index = 0;
    let state = 0;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_block_comment || token.is_comment) {
            index++;
            continue;
        }
        const text = token.getText();
        if (state == 0) {
            const result = parse_line_modifier(document, tokens, index);
            index = result.index;
            member.with(result.expr);

            const next_token = get_next_token(tokens, index);
            if (next_token) {
                member.start_token = next_token;

                state = 1;
            } else {
                document.add_token_error(token, `error global variable`);
                break;
            }
        } else if (state == 1) {
            const result = parse_line_statement(document, tokens, index, member.is_static ? false : true);
            index = result.index;
            member.with(result.expr);
            if (member.is_static && member.size_expr) {
                document.add_token_error(member.modifier!, `static member cannot have a size expression`);
            }
            // if (!member.is_static && (member.size_expr == null || member.size_expr.expr == null)) {
            //     document.add_token_error(tokens[index], `member must have a size expression`);
            // }
            break;
        }
    }

    return member;
}

export class Other extends NodeAst { }

/**
 * 解析结束标签
 * @param document 文档实例
 * @param tokens Token 数组
 * @param object 目标 AST 节点
 * @param end_tag 结束标签名称
 * @returns 解析的结束标签 Token
 */
export function parse_line_end_tag(document: Document, tokens: Token[], object: NodeAst, end_tag: string): Token | null {
    let endTagToken: Token | null = null;
    let state = 0;
    let index = 0;
    
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.is_comment || token.is_block_comment) {
            index++;
            continue;
        }
        const text = token.getText();

        if (state == 0) {
            index++;
            if (text == end_tag) {
                state = 1;
                endTagToken = token;
                // 设置 end_tag 用于闭合检查
                object.end_tag = token;
                // 使用 pushToken 方法更新 end_token
                object.pushToken(token);
            } else {
                document.add_token_error(token, `missing end tag keyword '${end_tag}'`);
                break;
            }
        } else if (state == 1) {
            index++;
            document.add_token_error(token, `error token '${text}'`);
        }
    }

    return endTagToken;
}
//#endregion

//#region 展开

type NodeType = "zinc" | "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop" | "module" | "implement" | null;
type DataType = Library | Struct | Interface | Method | Func | Globals | Scope | If | Loop;

/**
 * 节点类型对 - 用于匹配开始和结束模式
 */
class Pair {
    type: NodeType;
    start: RegExp;
    end: RegExp | null;

    // children: Pair|null = null;

    constructor(type: NodeType, start: RegExp, end: RegExp | null) {
        this.type = type;
        this.start = start;
        this.end = end;
    }
}

const zincPair = new Pair("zinc", new RegExp(/^\/\/!\s+zinc\b/), new RegExp(/^\/\/!\s+endzinc\b/));
const globalsPair = new Pair("globals", new RegExp(/^\s*globals\b/), new RegExp(/^\s*endglobals\b/));
const funcPair = new Pair("func", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?function\b/), new RegExp(/^\s*endfunction\b/));
const libraryPair = new Pair("library", new RegExp(/^\s*(?:library|library_once)\b/), new RegExp(/^\s*endlibrary\b/));
const scopePair = new Pair("scope", new RegExp(/^\s*scope\b/), new RegExp(/^\s*endscope\b/));
const interfacePair = new Pair("interface", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?interface\b/), new RegExp(/^\s*endinterface\b/));
const structPair = new Pair("struct", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?struct\b/), new RegExp(/^\s*endstruct\b/));
// const methodPair = new Pair("method", new RegExp(/^\s*(?<mod>(?:public|private)(?:\s+(?<still>(?:static|stub)(?:\s+(?<constant>constant))?))?)\b/), new RegExp(/^\s*endmethod\b/));
const methodPair = new Pair("method", new RegExp(/^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?method\b/), new RegExp(/^\s*endmethod\b/));
const ifPair = new Pair("if", new RegExp(/^\s*if\b/), new RegExp(/^\s*endif\b/));
const loopPair = new Pair("loop", new RegExp(/^\s*loop\b/), new RegExp(/^\s*endloop\b/));
const modulePair = new Pair("module", new RegExp(/^\s*module\b/), new RegExp(/^\s*endmodule\b/));
const implementPair = new Pair("implement", new RegExp(/^\s*implement\b/), null);

const localRegExp = /^\s*local\b/;
const setRegExp = /^\s*set\b/;
const callRegExp = /^\s*call\b/;
const returnRegExp = /^\s*return\b/;
const exitwhenRegExp = /^\s*exitwhen\b/;
const elseifRegExp = /^\s*elseif\b/;
const elseRegExp = /^\s*else\b/;
const nativeRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?native\b/;
const memberRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?[a-zA-Z0-9_]+\b/;
const methodRegExp = /^\s*(?:(?<visible>public|private)\s+)?(?:(?<modifier>static|stub)\s+)?(?:(?<qualifier>constant)\s+)?method\b/;
const typeRegExp = /^\s*type\b/;


const pairs = [
    zincPair,
    libraryPair,
    scopePair,
    funcPair,
    interfacePair,
    structPair,
    methodPair,
    modulePair,
    implementPair,
    ifPair,
    loopPair,
    globalsPair,
];
const non_method_pairs = pairs.filter(pair => pair.type != "method");



//#endregion

/**
 * 解析 JASS/vJASS 文件
 * @param filePath 文件路径
 * @param i_content 可选的文件内容，如果不提供则从文件系统读取
 * @returns 解析后的文档实例
 */
export function parse(filePath: string, i_content?: string): Document {
    const content: string = i_content ? i_content : fs.readFileSync(filePath, { encoding: "utf-8" });
    const document = new Document(filePath, content);
    return document;
}















