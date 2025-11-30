import {
    ASTNode,
    Statement,
    Expression,
    BlockStatement,
    FunctionDeclaration,
    NativeDeclaration,
    StructDeclaration,
    InterfaceDeclaration,
    LibraryDeclaration,
    ScopeDeclaration,
    MethodDeclaration,
    VariableDeclaration,
    TypeDeclaration,
    ModuleDeclaration,
    ImplementStatement,
    DelegateDeclaration,
    CallExpression,
    Identifier,
    ThistypeExpression,
    IfStatement,
    BinaryExpression,
    OperatorType,
    AssignmentStatement,
    BooleanLiteral,
    IntegerLiteral,
    RealLiteral,
    StringLiteral,
    TypecastExpression,
    ReturnStatement,
    HookStatement
} from "./vjass-ast";
import { ErrorCollection, SimpleError, SimpleWarning, CheckValidationError, CheckErrorType } from "./simple-error";
import { Parser } from "./parser";

/**
 * 语义分析器配置选项
 */
export interface SemanticAnalyzerOptions {
    /** 是否检查未定义行为（如未声明的函数、变量等） */
    checkUndefinedBehavior?: boolean;
    /** 标准库文件列表（如 common.j, blizzard.j, common.ai），用于多文件检测 */
    standardLibraries?: string[];
}

/**
 * 符号类型
 */
enum SymbolType {
    /** 全局变量 */
    GLOBAL_VARIABLE = "global_variable",
    /** 局部变量 */
    LOCAL_VARIABLE = "local_variable",
    /** 函数 */
    FUNCTION = "function",
    /** 结构 */
    STRUCT = "struct",
    /** 接口 */
    INTERFACE = "interface",
    /** 库 */
    LIBRARY = "library",
    /** 作用域 */
    SCOPE = "scope",
    /** 模块 */
    MODULE = "module",
    /** 类型 */
    TYPE = "type",
    /** 方法 */
    METHOD = "method",
    /** 静态成员 */
    STATIC_MEMBER = "static_member",
    /** 实例成员 */
    INSTANCE_MEMBER = "instance_member"
}

/**
 * 符号信息
 */
interface SymbolInfo {
    /** 符号名称 */
    name: string;
    /** 符号类型 */
    type: SymbolType;
    /** 声明节点 */
    node: ASTNode;
    /** 是否私有 */
    isPrivate: boolean;
    /** 是否公共 */
    isPublic: boolean;
    /** 所属作用域（库/作用域/结构） */
    scope?: string;
    /** 类型信息（对于变量和方法） */
    valueType?: string;
    /** 返回类型（对于函数和方法） */
    returnType?: string;
    /** 参数列表（对于函数和方法） */
    parameters?: Array<{ name: string; type: string }>;
    /** 是否只读（对于变量和结构成员） */
    isReadonly?: boolean;
    /** 是否是常量（对于变量） */
    isConstant?: boolean;
}

/**
 * 作用域信息
 */
interface ScopeInfo {
    /** 作用域名称 */
    name: string;
    /** 作用域类型（library/scope/struct/interface） */
    type: "library" | "scope" | "struct" | "interface" | "module" | "function";
    /** 父作用域 */
    parent?: ScopeInfo;
    /** 符号表 */
    symbols: Map<string, SymbolInfo>;
    /** 子作用域 */
    children: ScopeInfo[];
    /** 节点 */
    node: ASTNode;
    /** 是否私有 */
    isPrivate?: boolean;
    /** 是否公共 */
    isPublic?: boolean;
    /** 返回类型（对于函数/方法作用域） */
    returnType?: string;
}

/**
 * 常量表达式检查结果
 */
interface ConstantExpressionResult {
    /** 是否是有效的常量表达式 */
    isValid: boolean;
    /** 是否是常量（可以求值） */
    isConstant: boolean;
    /** 表达式的值（如果是常量） */
    value?: boolean;
    /** 错误消息 */
    errorMessage?: string;
    /** 表达式的类型 */
    type?: string;
}

/**
 * 对象类型信息
 */
interface ObjectTypeInfo {
    /** 类型名称（结构名或接口名） */
    typeName: string;
    /** 是否是静态方法调用（StructName.method vs obj.method） */
    isStatic: boolean;
    /** 是否是接口类型 */
    isInterface: boolean;
}

/**
 * vJass 语义分析器
 */
export class SemanticAnalyzer {
    private errors: SimpleError[] = [];
    private warnings: SimpleWarning[] = [];
    private checkErrors: CheckValidationError[] = [];

    /** 全局符号表 */
    private globalSymbols: Map<string, SymbolInfo> = new Map();

    /** 作用域栈 */
    private scopeStack: ScopeInfo[] = [];

    /** 库依赖图（用于检测循环依赖） */
    private libraryDependencies: Map<string, Set<string>> = new Map();

    /** 结构继承关系 */
    private structInheritance: Map<string, string | null> = new Map();

    /** 接口实现关系 */
    private interfaceImplementations: Map<string, Set<string>> = new Map();

    /** 结构实现的接口 */
    private structInterfaces: Map<string, Set<string>> = new Map();

    /** 配置选项 */
    private options: SemanticAnalyzerOptions;

    /**
     * 构造函数
     * @param options 配置选项
     */
    constructor(options: SemanticAnalyzerOptions = {}) {
        this.options = {
            checkUndefinedBehavior: options.checkUndefinedBehavior ?? false,
            standardLibraries: options.standardLibraries ?? []
        };
    }

    /**
     * 分析 AST
     */
    public analyze(ast: BlockStatement): ErrorCollection {
        this.errors = [];
        this.warnings = [];
        this.checkErrors = [];
        this.globalSymbols.clear();
        this.scopeStack = [];
        this.libraryDependencies.clear();
        this.structInheritance.clear();
        this.interfaceImplementations.clear();
        this.structInterfaces.clear();

        // 创建全局作用域
        const globalScope: ScopeInfo = {
            name: "",
            type: "function",
            symbols: this.globalSymbols,
            children: [],
            node: ast
        };
        this.scopeStack.push(globalScope);

        // 第一遍：收集所有声明
        this.collectDeclarations(ast);

        // 第二遍：检查语义规则
        this.checkSemantics(ast);

        // 检查库的循环依赖
        this.checkLibraryCircularDependencies();

        // 检查结构继承链
        this.checkStructInheritanceChain();

        return {
            errors: this.errors,
            warnings: this.warnings,
            checkValidationErrors: this.checkErrors
        };
    }

    /**
     * 检查结构继承链
     */
    private checkStructInheritanceChain(): void {
        // 检查继承链中是否有循环
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (structName: string, path: string[]): void => {
            if (recursionStack.has(structName)) {
                // 发现循环继承
                const cycleStart = path.indexOf(structName);
                const cycle = path.slice(cycleStart).concat(structName);
                const structSymbol = this.findSymbol(structName, SymbolType.STRUCT);

                if (structSymbol && structSymbol.node instanceof StructDeclaration) {
                    this.addError(
                        structSymbol.node.start,
                        structSymbol.node.end,
                        `检测到循环继承: ${cycle.join(" -> ")}`,
                        `移除循环继承关系`
                    );
                }
                return;
            }

            if (visited.has(structName)) {
                return;
            }

            visited.add(structName);
            recursionStack.add(structName);

            const parentName = this.structInheritance.get(structName);
            if (parentName) {
                dfs(parentName, path.concat(structName));
            }

            recursionStack.delete(structName);
        };

        for (const structName of this.structInheritance.keys()) {
            if (!visited.has(structName)) {
                dfs(structName, []);
            }
        }
    }

    /**
     * 第一遍：收集所有声明
     */
    private collectDeclarations(node: ASTNode): void {
        if (node instanceof LibraryDeclaration) {
            this.collectLibrary(node);
        } else if (node instanceof ScopeDeclaration) {
            this.collectScope(node);
        } else if (node instanceof StructDeclaration) {
            this.collectStruct(node);
        } else if (node instanceof InterfaceDeclaration) {
            this.collectInterface(node);
        } else if (node instanceof FunctionDeclaration) {
            this.collectFunction(node);
        } else if (node instanceof NativeDeclaration) {
            this.collectNative(node);
        } else if (node instanceof TypeDeclaration) {
            this.collectType(node);
        } else if (node instanceof ModuleDeclaration) {
            this.collectModule(node);
        } else if (node instanceof HookStatement) {
            this.collectHook(node);
        } else if (node instanceof BlockStatement) {
            // 处理 BlockStatement 中的变量声明
            const currentScope = this.scopeStack[this.scopeStack.length - 1];

            if (currentScope.type === "function" && currentScope.name === "") {
                // 在全局作用域中，收集全局变量
                for (const stmt of node.body) {
                    if (stmt instanceof VariableDeclaration && !stmt.isLocal) {
                        this.collectGlobalVariable(stmt);
                    }
                }
            } else if (currentScope.type === "function" && currentScope.name !== "") {
                // 在函数作用域中，收集局部变量
                this.collectLocalVariables(node);
            }
        }

        // 递归处理子节点
        for (const child of node.children) {
            this.collectDeclarations(child);
        }
    }

    /**
     * 收集局部变量
     * @param block 包含局部变量的 BlockStatement
     */
    private collectLocalVariables(block: BlockStatement): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 遍历 BlockStatement 中的语句，收集局部变量声明
        for (const stmt of block.body) {
            if (stmt instanceof VariableDeclaration && stmt.isLocal) {
                this.collectLocalVariable(stmt, currentScope);
            }
        }
    }

    /**
     * 收集单个局部变量声明
     */
    private collectLocalVariable(node: VariableDeclaration, scope: ScopeInfo): void {
        const name = node.name.name;

        // 检查重复声明
        if (scope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Local variable '${name}' is already declared`,
                `Remove duplicate local variable declaration or rename it`
            );
            return;
        }

        const type = node.type ? (node.type instanceof Identifier ? node.type.name : "thistype") : null;

        scope.symbols.set(name, {
            name,
            type: SymbolType.LOCAL_VARIABLE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: scope.name || undefined,
            valueType: type || undefined,
            isReadonly: node.isReadonly || false,
            isConstant: node.isConstant || false
        });
    }

    /**
     * 收集全局变量声明
     */
    private collectGlobalVariable(node: VariableDeclaration): void {
        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Global variable '${name}' is already declared`,
                `Remove duplicate global variable declaration or rename it`
            );
            return;
        }

        const type = node.type ? (node.type instanceof Identifier ? node.type.name : "thistype") : null;

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.GLOBAL_VARIABLE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined,
            valueType: type || undefined,
            isReadonly: node.isReadonly || false,
            isConstant: node.isConstant || false
        });
    }

    /**
     * 收集库声明
     */
    private collectLibrary(node: LibraryDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const scope: ScopeInfo = {
            name,
            type: "library",
            symbols: new Map(),
            children: [],
            node,
            isPublic: true
        };

        // 检查重复声明
        if (this.globalSymbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Library '${name}' is already declared`,
                `Remove duplicate library declaration or rename it`
            );
            return;
        }

        // 记录库依赖
        const dependencies = new Set<string>();
        for (const dep of node.dependencies) {
            dependencies.add(dep.name);
        }
        this.libraryDependencies.set(name, dependencies);

        // 添加到全局符号表
        this.globalSymbols.set(name, {
            name,
            type: SymbolType.LIBRARY,
            node,
            isPrivate: false,
            isPublic: true
        });

        // 进入库作用域
        this.scopeStack.push(scope);

        // 处理库成员
        for (const member of node.members) {
            this.collectDeclarations(member);
        }

        // 退出库作用域
        this.scopeStack.pop();
    }

    /**
     * 收集作用域声明
     */
    private collectScope(node: ScopeDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const scope: ScopeInfo = {
            name,
            type: "scope",
            symbols: new Map(),
            children: [],
            node,
            parent: currentScope,
            isPublic: true
        };

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Scope '${name}' is already declared`,
                `Remove duplicate scope declaration or rename it`
            );
            return;
        }

        // 添加到当前作用域
        currentScope.symbols.set(name, {
            name,
            type: SymbolType.SCOPE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined
        });

        // 进入作用域
        this.scopeStack.push(scope);

        // 处理作用域成员
        for (const member of node.members) {
            this.collectDeclarations(member);
        }

        // 退出作用域
        this.scopeStack.pop();
    }

    /**
     * 收集结构声明
     */
    private collectStruct(node: StructDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const scope: ScopeInfo = {
            name,
            type: "struct",
            symbols: new Map(),
            children: [],
            node,
            parent: currentScope,
            isPublic: true
        };

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Struct '${name}' is already declared`,
                `Remove duplicate struct declaration or rename it`
            );
            return;
        }

        // 记录继承关系
        if (node.extendsType) {
            const extendsTypeName = node.extendsType.name;
            this.structInheritance.set(name, extendsTypeName);

            // 如果继承的是接口，也记录到 structInterfaces 中
            const extendsSymbol = this.findSymbol(extendsTypeName);
            if (extendsSymbol && extendsSymbol.type === SymbolType.INTERFACE) {
                // 记录结构实现的接口
                if (!this.structInterfaces.has(name)) {
                    this.structInterfaces.set(name, new Set());
                }
                this.structInterfaces.get(name)!.add(extendsTypeName);
            }
        } else {
            this.structInheritance.set(name, null);
        }

        // 添加到当前作用域
        currentScope.symbols.set(name, {
            name,
            type: SymbolType.STRUCT,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined
        });

        // 进入结构作用域
        this.scopeStack.push(scope);

        // 处理结构成员
        for (const member of node.members) {
            if (member instanceof VariableDeclaration) {
                this.collectStructMember(member, name);
            } else if (member instanceof MethodDeclaration) {
                this.collectStructMethod(member, name);
            } else if (member instanceof DelegateDeclaration) {
                this.collectDelegate(member, name);
            } else if (member instanceof ImplementStatement) {
                // 处理 implement 语句
                this.collectImplement(member, name);
            }
        }

        // 退出结构作用域
        this.scopeStack.pop();
    }

    /**
     * 收集结构成员
     */
    private collectStructMember(node: VariableDeclaration, structName: string): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const name = node.name.name;

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Member '${name}' of struct '${structName}' is already declared`,
                `Remove duplicate member declaration or rename it`
            );
            return;
        }

        const type = node.type ? (node.type instanceof Identifier ? node.type.name : "thistype") : null;

        currentScope.symbols.set(name, {
            name,
            type: node.isStatic ? SymbolType.STATIC_MEMBER : SymbolType.INSTANCE_MEMBER,
            node,
            isPrivate: false, // 默认公共，需要从语法中判断
            isPublic: true,
            scope: structName,
            valueType: type || undefined,
            isReadonly: node.isReadonly || false,
            isConstant: node.isConstant || false
        });
    }

    /**
     * 收集结构方法
     */
    private collectStructMethod(node: MethodDeclaration, structName: string): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const methodName = node.name ? node.name.name : (node.operatorName || "");

        // 检查重复声明
        if (methodName && currentScope.symbols.has(methodName)) {
            this.addError(
                node.start,
                node.end,
                `Method '${methodName}' of struct '${structName}' is already declared`,
                `Remove duplicate method declaration or rename it`
            );
            return;
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            const paramType = param.type ?
                (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
            parameters.push({
                name: param.name.name,
                type: paramType
            });
        }

        if (methodName) {
            currentScope.symbols.set(methodName, {
                name: methodName,
                type: SymbolType.METHOD,
                node,
                isPrivate: false,
                isPublic: true,
                scope: structName,
                returnType: returnType || undefined,
                parameters
            });
        }

        // 创建方法作用域并收集局部变量
        if (node.body) {
            const returnType = node.returnType ?
                (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;
            const methodScope: ScopeInfo = {
                name: methodName || `${structName}.method`,
                type: "function",
                symbols: new Map(),
                children: [],
                node: node.body,
                parent: currentScope,
                isPublic: true,
                returnType: returnType || undefined
            };

            // 收集方法参数作为局部变量
            for (const param of node.parameters) {
                const paramName = param.name.name;
                const paramType = param.type ?
                    (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";

                methodScope.symbols.set(paramName, {
                    name: paramName,
                    type: SymbolType.LOCAL_VARIABLE,
                    node: param,
                    isPrivate: false,
                    isPublic: true,
                    scope: methodScope.name,
                    valueType: paramType || undefined
                });
            }

            // 进入方法作用域
            this.scopeStack.push(methodScope);

            // 收集方法体中的局部变量
            this.collectLocalVariables(node.body);

            // 退出方法作用域
            this.scopeStack.pop();
        }
    }

    /**
     * 收集委托声明
     */
    private collectDelegate(node: DelegateDeclaration, structName: string): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const name = node.name.name;
        const delegateTypeName = node.delegateType.name;

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Delegate '${name}' of struct '${structName}' is already declared`,
                `Remove duplicate delegate declaration or rename it`
            );
            return;
        }

        // 检查委托类型是否存在（先检查结构，再检查接口）
        const delegateTypeSymbol = this.findSymbol(delegateTypeName, SymbolType.STRUCT);
        const interfaceSymbol = delegateTypeSymbol ? null : this.findSymbol(delegateTypeName, SymbolType.INTERFACE);
        
        if (!delegateTypeSymbol && !interfaceSymbol) {
            this.addError(
                node.delegateType.start,
                node.delegateType.end,
                `Delegate type '${delegateTypeName}' not found`,
                `Ensure the struct '${delegateTypeName}' is declared before using it as a delegate type`
            );
            return;
        }

        // 检查委托类型必须是结构类型（不能是接口或其他类型）
        if (interfaceSymbol || (delegateTypeSymbol && delegateTypeSymbol.type !== SymbolType.STRUCT)) {
            this.addError(
                node.delegateType.start,
                node.delegateType.end,
                `Delegate type '${delegateTypeName}' must be a struct type`,
                `Only struct types can be used as delegate types`
            );
            return;
        }

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.INSTANCE_MEMBER,
            node,
            isPrivate: node.isPrivate,
            isPublic: !node.isPrivate,
            scope: structName,
            valueType: delegateTypeName
        });
    }

    /**
     * 收集 Hook 语句
     */
    private collectHook(node: HookStatement): void {
        // Hook 语句在收集阶段不需要特殊处理，只需要在检查阶段验证
        // 这里可以记录 Hook 语句，但通常不需要添加到符号表
    }

    /**
     * 收集 implement 语句
     */
    private collectImplement(node: ImplementStatement, structName: string): void {
        const moduleName = node.moduleName.name;
        // 检查模块是否存在（如果不是 optional）
        if (!node.isOptional) {
            const moduleSymbol = this.findSymbol(moduleName, SymbolType.MODULE);
            if (!moduleSymbol) {
                this.addError(
                    node.start,
                    node.end,
                    `Module '${moduleName}' not found`,
                    `Ensure the module is declared or use the 'optional' keyword`
                );
            }
        }
    }

    /**
     * 收集接口声明
     */
    private collectInterface(node: InterfaceDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const scope: ScopeInfo = {
            name,
            type: "interface",
            symbols: new Map(),
            children: [],
            node,
            parent: currentScope,
            isPublic: true
        };

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Interface '${name}' is already declared`,
                `移除重复的接口声明或重命名`
            );
            return;
        }

        // 添加到当前作用域
        currentScope.symbols.set(name, {
            name,
            type: SymbolType.INTERFACE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined
        });

        // 进入接口作用域
        this.scopeStack.push(scope);

        // 处理接口成员
        for (const member of node.members) {
            if (member instanceof MethodDeclaration) {
                // 检查接口方法不能声明 onDestroy
                if (member.name && member.name.name === "onDestroy") {
                    this.addError(
                        member.start,
                        member.end,
                        `接口不能声明 onDestroy 方法`,
                        `onDestroy 是默认声明的，子结构可以声明它`
                    );
                }
                this.collectInterfaceMethod(member, name);
            }
        }

        // 退出接口作用域
        this.scopeStack.pop();
    }

    /**
     * 收集接口方法
     */
    private collectInterfaceMethod(node: MethodDeclaration, interfaceName: string): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const methodName = node.name ? node.name.name : (node.operatorName || "");

        if (!methodName) return;

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            const paramType = param.type ?
                (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
            parameters.push({
                name: param.name.name,
                type: paramType
            });
        }

        currentScope.symbols.set(methodName, {
            name: methodName,
            type: SymbolType.METHOD,
            node,
            isPrivate: false,
            isPublic: true,
            scope: interfaceName,
            returnType: returnType || undefined,
            parameters
        });
    }

    /**
     * 收集函数声明
     */
    private collectFunction(node: FunctionDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `函数 '${name}' 已声明`,
                `移除重复的函数声明或重命名`
            );
            return;
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            const paramType = param.type ?
                (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
            parameters.push({
                name: param.name.name,
                type: paramType
            });
        }

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.FUNCTION,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined,
            returnType: returnType || undefined,
            parameters
        });

        // 普通函数有函数体，创建函数作用域并收集局部变量
        if (node.body) {
            const functionScope: ScopeInfo = {
                name: name,
                type: "function",
                symbols: new Map(),
                children: [],
                node: node.body,
                parent: currentScope,
                isPublic: true,
                returnType: returnType || undefined
            };

            // 收集函数参数作为局部变量
            for (const param of node.parameters) {
                const paramName = param.name.name;
                const paramType = param.type ?
                    (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";

                functionScope.symbols.set(paramName, {
                    name: paramName,
                    type: SymbolType.LOCAL_VARIABLE,
                    node: param,
                    isPrivate: false,
                    isPublic: true,
                    scope: name,
                    valueType: paramType || undefined
                });
            }

            // 进入函数作用域
            this.scopeStack.push(functionScope);

            // 收集函数体中的局部变量
            this.collectLocalVariables(node.body);

            // 退出函数作用域
            this.scopeStack.pop();
        }
    }

    /**
     * 收集原生函数声明
     */
    private collectNative(node: NativeDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `原生函数 '${name}' 已声明`,
                `移除重复的原生函数声明或重命名`
            );
            return;
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            const paramType = param.type ?
                (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
            parameters.push({
                name: param.name.name,
                type: paramType
            });
        }

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.FUNCTION,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined,
            returnType: returnType || undefined,
            parameters
        });
    }

    /**
     * 收集类型声明
     */
    private collectType(node: TypeDeclaration): void {
        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `类型 '${name}' 已声明`,
                `移除重复的类型声明或重命名`
            );
            return;
        }

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.TYPE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined,
            valueType: node.baseType.name
        });
    }

    /**
     * 收集模块声明
     */
    private collectModule(node: ModuleDeclaration): void {
        if (!node.name) return;

        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];

        // 检查重复声明
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Module '${name}' is already declared`,
                `Remove duplicate module declaration or rename it`
            );
            return;
        }

        currentScope.symbols.set(name, {
            name,
            type: SymbolType.MODULE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined
        });
    }

    /**
     * 第二遍：检查语义规则
     */
    private checkSemantics(node: ASTNode): void {
        if (node instanceof StructDeclaration) {
            this.checkStruct(node);
        } else if (node instanceof InterfaceDeclaration) {
            this.checkInterface(node);
        } else if (node instanceof ModuleDeclaration) {
            this.checkModule(node);
        } else if (node instanceof LibraryDeclaration) {
            this.checkLibrary(node);
        } else if (node instanceof CallExpression) {
            this.checkCallExpression(node);
        } else if (node instanceof AssignmentStatement) {
            this.checkAssignment(node);
        } else if (node instanceof IfStatement) {
            this.checkStaticIf(node);
        } else if (node instanceof ReturnStatement) {
            this.checkReturnStatement(node);
        } else if (node instanceof HookStatement) {
            this.checkHook(node);
        } else if (node instanceof NativeDeclaration) {
            this.checkNativeFunctionReturns(node);
        } else if (node instanceof FunctionDeclaration) {
            // 重新建立函数作用域以便 checkReturnStatement 和 checkAssignment 可以找到局部变量
            if (node.body) {
                const currentScope = this.scopeStack[this.scopeStack.length - 1];
                const functionName = node.name ? node.name.name : "unknown";
                const returnType = node.returnType ?
                    (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;
                const functionScope: ScopeInfo = {
                    name: functionName,
                    type: "function",
                    symbols: new Map(),
                    children: [],
                    node: node.body,
                    parent: currentScope,
                    isPublic: true,
                    returnType: returnType || undefined
                };
                // 收集函数参数作为局部变量
                for (const param of node.parameters) {
                    const paramName = param.name.name;
                    const paramType = param.type ?
                        (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
                    functionScope.symbols.set(paramName, {
                        name: paramName,
                        type: SymbolType.LOCAL_VARIABLE,
                        node: param,
                        isPrivate: false,
                        isPublic: true,
                        scope: functionScope.name,
                        valueType: paramType || undefined
                    });
                }
                this.scopeStack.push(functionScope);
                // 重新收集函数体中的局部变量
                this.collectLocalVariables(node.body);
                // 先检查函数体中的 return 语句和赋值语句（递归调用 checkSemantics）
                for (const child of node.children) {
                    this.checkSemantics(child);
                }
                // 然后检查函数的所有代码路径是否都有返回值
                this.checkFunctionReturns(node);
                this.scopeStack.pop();
            } else {
                this.checkFunctionReturns(node);
            }
        } else if (node instanceof MethodDeclaration) {
            // 只检查结构中的方法实现（有 body 的方法）
            // 接口中的方法声明（没有 body 或 body 为空）不应该被检查
            if (node.body && node.body.body.length > 0) {
                // 重新建立方法作用域以便 checkReturnStatement 可以找到
                const currentScope = this.scopeStack[this.scopeStack.length - 1];
                const methodName = node.name ? node.name.name : (node.operatorName || "unknown");
                const returnType = node.returnType ?
                    (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;
                const methodScope: ScopeInfo = {
                    name: methodName,
                    type: "function",
                    symbols: new Map(),
                    children: [],
                    node: node.body,
                    parent: currentScope,
                    isPublic: true,
                    returnType: returnType || undefined
                };
                this.scopeStack.push(methodScope);
                // 先检查方法体中的 return 语句（递归调用 checkSemantics）
                for (const child of node.children) {
                    this.checkSemantics(child);
                }
                // 然后检查方法的所有代码路径是否都有返回值
                this.checkMethodReturns(node);
                this.scopeStack.pop();
            } else {
                // 对于没有 body 的方法（接口中的方法声明），也需要递归处理子节点
                for (const child of node.children) {
                    this.checkSemantics(child);
                }
                return; // 已经处理了子节点，不需要再次递归
            }
            // 注意：Identifier 的检查在具体使用场景中进行，避免误报
            return; // 已经处理了子节点，不需要再次递归
        }
        // 递归处理子节点
        for (const child of node.children) {
            this.checkSemantics(child);
        }
    }

    /**
     * 检查结构语义
     */
    private checkStruct(node: StructDeclaration): void {
        if (!node.name) return;

        const structName = node.name.name;

        // 检查继承关系
        if (node.extendsType) {
            const parentName = node.extendsType.name;
            const parentSymbol = this.findSymbol(parentName, SymbolType.STRUCT);

            if (!parentSymbol) {
                // 可能是接口
                const interfaceSymbol = this.findSymbol(parentName, SymbolType.INTERFACE);
                if (!interfaceSymbol) {
                    this.addError(
                        node.extendsType.start,
                        node.extendsType.end,
                        `Parent struct or interface '${parentName}' not found`,
                        `Ensure the parent struct or interface is declared`
                    );
                } else {
                    // 是接口，检查实现
                    this.checkInterfaceImplementation(node, parentName);
                }
            } else {
                // 是结构，检查继承
                if (parentSymbol.node instanceof StructDeclaration) {
                    const parentStruct = parentSymbol.node;
                    // 查找父结构的 create 方法
                    let hasPrivateCreate = false;
                    for (const member of parentStruct.members) {
                        if (member instanceof MethodDeclaration &&
                            member.isStatic &&
                            member.name &&
                            member.name.name === "create") {
                            // create 方法存在，检查是否是私有的
                            // 注意：这里简化处理，实际需要检查方法的可见性
                            // 如果 create 是私有的，子结构无法继承
                        }
                    }
                }
            }
        }

        // 检查索引空间增强的限制
        // 根据文档：不能在继承其他结构或接口的结构上使用索引空间增强
        if (node.indexSize !== null && node.extendsType) {
            const extendsName = node.extendsType.name;
            // 检查是否有继承关系（从 structInheritance 中查找）
            const parentType = this.structInheritance.get(structName);
            if (parentType === extendsName) {
                // 确实有继承关系，不能使用索引空间增强
                // 先尝试查找结构或接口，以确定错误消息
                const structSymbol = this.findSymbol(extendsName, SymbolType.STRUCT);
                const interfaceSymbol = this.findSymbol(extendsName, SymbolType.INTERFACE);
                
                if (structSymbol) {
                    this.addError(
                        node.start,
                        node.end,
                        `Structs that extend other structs cannot use index space enhancement`,
                        `Remove index space enhancement or remove the inheritance relationship`
                    );
                } else if (interfaceSymbol) {
                    this.addError(
                        node.start,
                        node.end,
                        `Structs that extend interfaces cannot use index space enhancement`,
                        `Remove index space enhancement or remove the inheritance relationship`
                    );
                } else {
                    // 找不到父类型，但确实有继承关系，也应该报错
                    this.addError(
                        node.start,
                        node.end,
                        `Structs with inheritance cannot use index space enhancement`,
                        `Remove index space enhancement or remove the inheritance relationship`
                    );
                }
                return;
            }
            // 如果没有在 structInheritance 中找到，但 node.extendsType 存在，尝试查找接口
            // 或者直接检查 extendsType 是否存在（因为继承关系已经在 collectStruct 中记录了）
            const interfaceSymbol = this.findSymbol(extendsName, SymbolType.INTERFACE);
            if (interfaceSymbol) {
                this.addError(
                    node.start,
                    node.end,
                    `Structs that extend interfaces cannot use index space enhancement`,
                    `Remove index space enhancement or remove the inheritance relationship`
                );
                return;
            }
            // 如果找不到，但 node.extendsType 存在，说明有继承关系，也应该报错
            // 因为如果 extendsType 存在，说明结构确实有继承关系
            this.addError(
                node.start,
                node.end,
                `Structs with inheritance cannot use index space enhancement`,
                `Remove index space enhancement or remove the inheritance relationship`
            );
        }

        // 检查结构实例上限
        // 根据文档：结构体使用数组的值限制为 8191 个，而且我们不能使用索引 0（结构体为 null），因此限制为 8190 个实例
        // 如果使用索引空间增强，上限会更高
        const maxInstances = node.indexSize !== null ? node.indexSize : 8190;
        if (maxInstances > 8190) {
            // 使用索引空间增强，检查是否合理
            if (maxInstances > 408000) {
                this.addWarning(
                    node.start,
                    node.end,
                    `结构 '${structName}' 的索引空间 ${maxInstances} 超过了推荐的最大值 408000`
                );
            }
        }

        // 检查数组成员对实例上限的影响
        // 根据文档：如果一个结构具有 2 个数组成员，一个数组大小为 4，一个数组大小为 100，
        // 该结构将限制为 80 个实例（8190 除以 100）
        let totalArraySize = 0;
        let maxArraySize = 0;
        for (const member of node.members) {
            if (member instanceof VariableDeclaration && member.isArray) {
                let memberSize = 0;
                if (member.arraySize !== null) {
                    memberSize = member.arraySize;
                } else if (member.arrayWidth !== null && member.arrayHeight !== null) {
                    memberSize = member.arrayWidth * member.arrayHeight;
                }
                if (memberSize > 0) {
                    totalArraySize += memberSize;
                    maxArraySize = Math.max(maxArraySize, memberSize);
                }
            }
        }
        if (maxArraySize > 0) {
            // 根据文档，实例上限由最大的数组成员大小决定
            const actualMaxInstances = Math.floor(8190 / maxArraySize);
            if (actualMaxInstances < 1) {
                this.addError(
                    node.start,
                    node.end,
                    `The maximum array member size ${maxArraySize} of struct '${structName}' is too large, preventing any instances from being created`,
                    `Reduce the array member size or use dynamic arrays`
                );
            } else if (actualMaxInstances < 10) {
                this.addWarning(
                    node.start,
                    node.end,
                    `结构 '${structName}' 的数组成员最大大小 ${maxArraySize} 较大，实例上限仅为 ${actualMaxInstances}`
                );
            }
        }

        // 检查数组结构的限制
        // 根据文档：数组结构不能声明变量成员的默认值，不能使用.allocate 或.destroy，不能声明 onDestroy，不能有数组成员
        if (node.isArrayStruct) {
            for (const member of node.members) {
                if (member instanceof VariableDeclaration) {
                    // 检查是否有默认值
                    if (member.initializer) {
                        this.addError(
                            member.start,
                            member.end,
                            `数组结构 '${structName}' 的成员不能有默认值`,
                            `移除成员 '${member.name.name}' 的默认值`
                        );
                    }
                    // 检查是否是数组成员
                    if (member.isArray) {
                        this.addError(
                            member.start,
                            member.end,
                            `数组结构 '${structName}' 不能有数组成员`,
                            `移除数组成员 '${member.name.name}' 或使用动态数组`
                        );
                    }
                } else if (member instanceof MethodDeclaration) {
                    // 检查是否是 onDestroy
                    if (member.name && member.name.name === "onDestroy") {
                        this.addError(
                            member.start,
                            member.end,
                            `数组结构 '${structName}' 不能声明 onDestroy 方法`,
                            `移除 onDestroy 方法`
                        );
                    }
                }
            }
        }
    }

    /**
     * 检查接口实现
     */
    private checkInterfaceImplementation(structNode: StructDeclaration, interfaceName: string): void {
        if (!structNode.name) return;

        const structName = structNode.name.name;
        const interfaceSymbol = this.findSymbol(interfaceName, SymbolType.INTERFACE);

        if (!interfaceSymbol || !(interfaceSymbol.node instanceof InterfaceDeclaration)) {
            return;
        }

        const interfaceNode = interfaceSymbol.node;
        const structMethods = new Map<string, MethodDeclaration>();

        // 收集结构的所有方法
        for (const member of structNode.members) {
            if (member instanceof MethodDeclaration && member.name) {
                structMethods.set(member.name.name, member);
            }
        }

        // 检查接口的所有方法是否都被实现
        for (const member of interfaceNode.members) {
            if (member instanceof MethodDeclaration && member.name) {
                const methodName = member.name.name;
                const structMethod = structMethods.get(methodName);

                if (!structMethod) {
                    // 检查是否有 defaults 值
                    if (member.defaultsValue) {
                        // 有 defaults 值，可以不实现
                        continue;
                    }

                    this.addError(
                        structNode.start,
                        structNode.end,
                        `Struct '${structName}' must implement method '${methodName}' from interface '${interfaceName}'`,
                        `Add implementation of method '${methodName}' to the struct`
                    );
                } else {
                    // 检查方法签名是否匹配
                    this.checkMethodSignatureMatch(member, structMethod, interfaceName, structName);
                }
            }
        }
    }

    /**
     * 检查方法签名是否匹配
     */
    private checkMethodSignatureMatch(
        interfaceMethod: MethodDeclaration,
        structMethod: MethodDeclaration,
        interfaceName: string,
        structName: string
    ): void {
        // 检查返回类型
        const interfaceReturnType = interfaceMethod.returnType ?
            (interfaceMethod.returnType instanceof Identifier ? interfaceMethod.returnType.name : "thistype") : null;
        const structReturnType = structMethod.returnType ?
            (structMethod.returnType instanceof Identifier ? structMethod.returnType.name : "thistype") : null;

        if (interfaceReturnType !== structReturnType) {
            this.addError(
                structMethod.start,
                structMethod.end,
                `Return type of method '${structMethod.name?.name}' in struct '${structName}' does not match interface '${interfaceName}'`,
                `Change the return type to '${interfaceReturnType || "nothing"}'`
            );
        }

        // 检查参数数量和类型
        if (interfaceMethod.parameters.length !== structMethod.parameters.length) {
            this.addError(
                structMethod.start,
                structMethod.end,
                `Parameter count of method '${structMethod.name?.name}' in struct '${structName}' does not match interface '${interfaceName}'`,
                `Change the parameter count to ${interfaceMethod.parameters.length}`
            );
        } else {
            // 检查每个参数的类型
            for (let i = 0; i < interfaceMethod.parameters.length; i++) {
                const interfaceParam = interfaceMethod.parameters[i];
                const structParam = structMethod.parameters[i];

                const interfaceParamType = interfaceParam.type ?
                    (interfaceParam.type instanceof Identifier ? interfaceParam.type.name : "thistype") : null;
                const structParamType = structParam.type ?
                    (structParam.type instanceof Identifier ? structParam.type.name : "thistype") : null;

                if (interfaceParamType !== structParamType) {
                    this.addError(
                        structParam.start,
                        structParam.end,
                        `Parameter ${i + 1} type of method '${structMethod.name?.name}' in struct '${structName}' does not match interface '${interfaceName}'`,
                        `Change the parameter type to '${interfaceParamType || "nothing"}'`
                    );
                }
            }
        }
    }

    /**
     * 检查接口语义
     */
    private checkInterface(node: InterfaceDeclaration): void {
        // 接口的语义检查主要在收集阶段完成
    }

    /**
     * 检查模块语义
     */
    private checkModule(node: ModuleDeclaration): void {
        if (!node.name) return;

        const moduleName = node.name.name;

        // 检查模块实现的模块是否存在
        for (const implementsType of node.implementsTypes) {
            const implementsName = implementsType.name;
            const moduleSymbol = this.findSymbol(implementsName, SymbolType.MODULE);
            if (!moduleSymbol) {
                this.addError(
                    implementsType.start,
                    implementsType.end,
                    `Module '${implementsName}' not found`,
                    `Ensure the module is declared or use 'optional' keyword if it's optional`
                );
            }
        }

        // 检查模块成员中的 implement 语句
        for (const member of node.members) {
            if (member instanceof ImplementStatement) {
                const implementModuleName = member.moduleName.name;
                // 检查模块是否存在（如果不是 optional）
                if (!member.isOptional) {
                    const moduleSymbol = this.findSymbol(implementModuleName, SymbolType.MODULE);
                    if (!moduleSymbol) {
                        this.addError(
                            member.moduleName.start,
                            member.moduleName.end,
                            `Module '${implementModuleName}' not found`,
                            `Ensure the module is declared or use the 'optional' keyword`
                        );
                    }
                }
            }
        }

        // 检查模块成员的有效性
        // 模块可以包含：方法声明、implement 语句
        for (const member of node.members) {
            if (member instanceof MethodDeclaration) {
                // 检查方法声明的有效性
                // 模块中的方法可以是 stub（只有声明，没有实现）
                // 或者有完整实现
            } else if (member instanceof ImplementStatement) {
                // implement 语句已在上面检查
            } else if (!(member instanceof BlockStatement)) {
                // 其他类型的语句在模块中可能不被允许
                // 这里可以根据需要添加更严格的检查
            }
        }
    }

    /**
     * 检查 Hook 语句
     */
    private checkHook(node: HookStatement): void {
        const targetFunctionName = node.targetFunction.name;
        const targetFunctionSymbol = this.findSymbol(targetFunctionName, SymbolType.FUNCTION);

        // 检查被钩住的函数是否存在
        // 注意：被钩住的函数可能是 native 函数（不在符号表中），所以这里只检查是否是已声明的函数
        // 如果启用了未定义行为检查，才报告警告
        if (!targetFunctionSymbol && this.options.checkUndefinedBehavior) {
            this.addWarning(
                node.targetFunction.start,
                node.targetFunction.end,
                `Target function '${targetFunctionName}' may not be declared. Ensure the function is declared or it is a native function`
            );
        }

        // 检查钩子函数/方法是否存在
        if (node.hookStruct && node.hookMethod) {
            // 结构方法格式：hook FunctionName StructName.MethodName
            const hookStructName = node.hookStruct.name;
            const hookMethodName = node.hookMethod.name;
            
            // 检查结构是否存在
            const hookStructSymbol = this.findSymbol(hookStructName, SymbolType.STRUCT);
            if (!hookStructSymbol) {
                this.addError(
                    node.hookStruct.start,
                    node.hookStruct.end,
                    `Hook struct '${hookStructName}' not found`,
                    `Ensure the struct '${hookStructName}' is declared before the hook statement`
                );
                return;
            }

            // 检查方法是否存在
            if (hookStructSymbol.node instanceof StructDeclaration) {
                const methodFound = this.findMethod(hookStructName, hookMethodName, false);
                if (!methodFound) {
                    this.addError(
                        node.hookMethod.start,
                        node.hookMethod.end,
                        `Hook method '${hookMethodName}' not found in struct '${hookStructName}'`,
                        `Ensure the method '${hookMethodName}' is declared in struct '${hookStructName}'`
                    );
                }
            }
        }
    }

    /**
     * 检查库语义
     */
    private checkLibrary(node: LibraryDeclaration): void {
        if (!node.name) return;

        const libName = node.name.name;

        // 检查依赖的库是否存在（非 optional）
        for (const dep of node.dependencies) {
            const depName = dep.name;
            const isOptional = node.optionalDependencies.has(depName);

            if (!isOptional) {
                const depSymbol = this.findSymbol(depName, SymbolType.LIBRARY);
                if (!depSymbol) {
                    this.addError(
                        dep.start,
                        dep.end,
                        `Dependent library '${depName}' not found`,
                        `Ensure the library is declared or use the 'optional' keyword`
                    );
                }
            }
        }
    }

    /**
     * 检查函数调用表达式
     */
    private checkCallExpression(node: CallExpression): void {
        // 检查被调用的函数是否存在
        if (node.callee instanceof Identifier) {
            const funcName = node.callee.name;
            const funcSymbol = this.findSymbol(funcName, SymbolType.FUNCTION);

            if (!funcSymbol) {
                // 可能是方法调用，检查是否是结构方法
                // 如果启用了未定义行为检查，才报告警告
                if (this.options.checkUndefinedBehavior) {
                    this.addWarning(
                        node.callee.start,
                        node.callee.end,
                        `Function '${funcName}' may not be declared`
                    );
                }
            } else {
                // 检查参数数量
                if (funcSymbol.parameters) {
                    if (node.arguments.length !== funcSymbol.parameters.length) {
                        this.addError(
                            node.start,
                            node.end,
                            `Function '${funcName}' expects ${funcSymbol.parameters.length} parameters, but ${node.arguments.length} were provided`,
                            `Check the function call parameter count`
                        );
                    } else {
                        // 检查参数类型
                        for (let i = 0; i < node.arguments.length; i++) {
                            const arg = node.arguments[i];
                            const param = funcSymbol.parameters[i];
                            this.checkTypeCompatibility(arg, param.type, funcName, i + 1);
                        }
                    }
                }
            }
        } else if (node.callee instanceof BinaryExpression && node.callee.operator === OperatorType.Dot) {
            // 方法调用，如 obj.method() 或 StructName.method()
            this.checkMethodCall(node);
        }
    }

    /**
     * 检查方法调用
     * 处理 obj.method() 或 StructName.method() 格式的调用
     */
    private checkMethodCall(node: CallExpression): void {
        const callee = node.callee;
        if (!(callee instanceof BinaryExpression) || callee.operator !== OperatorType.Dot) {
            return;
        }

        const objectExpr = callee.left;
        const methodNameExpr = callee.right;

        // 方法名必须是标识符
        if (!(methodNameExpr instanceof Identifier)) {
            this.addError(
                methodNameExpr.start,
                methodNameExpr.end,
                `方法名必须是标识符`,
                `检查方法调用语法`
            );
            return;
        }

        const methodName = methodNameExpr.name;

        // 解析对象类型
        const objectType = this.resolveObjectType(objectExpr);
        if (!objectType) {
            // 无法解析对象类型，可能是变量未定义或其他问题
            // 如果启用了未定义行为检查，才报告警告
            if (this.options.checkUndefinedBehavior) {
                this.addWarning(
                    objectExpr.start,
                    objectExpr.end,
                    `Cannot resolve object type, unable to verify if method '${methodName}' exists`
                );
            }
            return;
        }

        // 查找方法
        const methodInfo = this.findMethod(objectType.typeName, methodName, objectType.isStatic);
        if (!methodInfo) {
            this.addError(
                methodNameExpr.start,
                methodNameExpr.end,
                `Method '${methodName}' not found in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'`,
                `Check if the method name is correct or if the method is declared`
            );
            return;
        }

        // 检查方法签名匹配
        this.checkMethodSignature(methodInfo, node, methodName, objectType.typeName);
    }

    /**
     * 解析对象类型
     * 从表达式中解析出对象类型信息
     */
    private resolveObjectType(expr: Expression): ObjectTypeInfo | null {
        // 如果是标识符，可能是：
        // 1. 变量名（结构实例或接口实例）
        // 2. 结构类型名（静态方法调用）
        // 3. this 关键字（在结构方法中，指向当前结构实例）
        if (expr instanceof Identifier) {
            const name = expr.name;

            // 处理 this 关键字
            if (name === "this") {
                // 在结构方法中，this 指向当前结构实例
                for (let i = this.scopeStack.length - 1; i >= 0; i--) {
                    const scope = this.scopeStack[i];
                    if (scope.type === "struct") {
                        return {
                            typeName: scope.name,
                            isStatic: false,
                            isInterface: false
                        };
                    }
                }
                return null;
            }

            // 先尝试查找结构类型（静态方法调用）
            const structSymbol = this.findSymbol(name, SymbolType.STRUCT);
            if (structSymbol) {
                return {
                    typeName: name,
                    isStatic: true,
                    isInterface: false
                };
            }

            // 再尝试查找接口类型（静态方法调用，虽然接口通常没有静态方法）
            const interfaceSymbol = this.findSymbol(name, SymbolType.INTERFACE);
            if (interfaceSymbol) {
                return {
                    typeName: name,
                    isStatic: true,
                    isInterface: true
                };
            }

            // 查找变量（实例方法调用）
            const varSymbol = this.findSymbol(name);
            if (varSymbol) {
                // 检查变量类型
                if (varSymbol.valueType) {
                    const varType = varSymbol.valueType;
                    // 检查是否是结构类型
                    const typeSymbol = this.findSymbol(varType, SymbolType.STRUCT);
                    if (typeSymbol) {
                        return {
                            typeName: varType,
                            isStatic: false,
                            isInterface: false
                        };
                    }
                    // 检查是否是接口类型
                    const interfaceTypeSymbol = this.findSymbol(varType, SymbolType.INTERFACE);
                    if (interfaceTypeSymbol) {
                        return {
                            typeName: varType,
                            isStatic: false,
                            isInterface: true
                        };
                    }
                }
            }

            return null;
        }

        // 如果是类型转换表达式，如 StructType(expr)
        if (expr instanceof TypecastExpression) {
            const targetType = expr.targetType.name;
            const structSymbol = this.findSymbol(targetType, SymbolType.STRUCT);
            if (structSymbol) {
                return {
                    typeName: targetType,
                    isStatic: false,
                    isInterface: false
                };
            }
            const interfaceSymbol = this.findSymbol(targetType, SymbolType.INTERFACE);
            if (interfaceSymbol) {
                return {
                    typeName: targetType,
                    isStatic: false,
                    isInterface: true
                };
            }
        }

        // 如果是方法调用（链式调用），如 obj.getStruct().method()
        if (expr instanceof CallExpression) {
            // 解析方法调用的返回类型
            if (expr.callee instanceof Identifier) {
                // 直接函数调用，无法确定返回类型
                return null;
            } else if (expr.callee instanceof BinaryExpression && expr.callee.operator === OperatorType.Dot) {
                // 方法调用，如 obj.method() 或 StructName.method()
                const objectType = this.resolveObjectType(expr.callee.left);
                if (objectType && expr.callee.right instanceof Identifier) {
                    const methodName = expr.callee.right.name;
                    const methodInfo = this.findMethod(objectType.typeName, methodName, objectType.isStatic);
                    if (methodInfo && methodInfo.returnType) {
                        const returnType = methodInfo.returnType;
                        // 检查返回类型是否是结构或接口
                        const returnStructSymbol = this.findSymbol(returnType, SymbolType.STRUCT);
                        if (returnStructSymbol) {
                            return {
                                typeName: returnType,
                                isStatic: false,
                                isInterface: false
                            };
                        }
                        const returnInterfaceSymbol = this.findSymbol(returnType, SymbolType.INTERFACE);
                        if (returnInterfaceSymbol) {
                            return {
                                typeName: returnType,
                                isStatic: false,
                                isInterface: true
                            };
                        }
                    }
                }
            }
            return null;
        }

        // 如果是点运算符（链式访问），如 obj.member.method()
        if (expr instanceof BinaryExpression && expr.operator === OperatorType.Dot) {
            // 解析成员访问，获取成员类型
            const memberType = this.resolveMemberType(expr);
            if (memberType) {
                return {
                    typeName: memberType,
                    isStatic: false,
                    isInterface: false
                };
            }
        }

        return null;
    }

    /**
     * 解析成员类型
     * 从 obj.member 表达式中解析出成员的类型
     */
    private resolveMemberType(expr: BinaryExpression): string | null {
        if (!(expr.right instanceof Identifier)) {
            return null;
        }

        const memberName = expr.right.name;
        const objectType = this.resolveObjectType(expr.left);

        if (!objectType) {
            return null;
        }

        // 查找成员
        const memberSymbol = this.findStructMember(objectType.typeName, memberName);
        if (memberSymbol && memberSymbol.valueType) {
            return memberSymbol.valueType;
        }

        return null;
    }

    /**
     * 查找结构成员
     */
    private findStructMember(structName: string, memberName: string): SymbolInfo | null {
        const structSymbol = this.findSymbol(structName, SymbolType.STRUCT);
        if (!structSymbol || !(structSymbol.node instanceof StructDeclaration)) {
            return null;
        }

        const structNode = structSymbol.node;

        // 在结构的作用域中查找成员
        // 需要找到结构的作用域
        for (const scope of this.scopeStack) {
            if (scope.name === structName && scope.type === "struct") {
                const member = scope.symbols.get(memberName);
                if (member) {
                    return member;
                }
            }
        }

        // 如果作用域栈中没有找到，直接从结构节点中查找成员
        // 这在 checkSemantics 阶段很有用，因为作用域可能已经弹出
        for (const member of structNode.members) {
            if (member instanceof VariableDeclaration && member.name.name === memberName) {
                // 找到了成员，构建 SymbolInfo
                const type = member.type ? (member.type instanceof Identifier ? member.type.name : "thistype") : null;
                return {
                    name: memberName,
                    type: member.isStatic ? SymbolType.STATIC_MEMBER : SymbolType.INSTANCE_MEMBER,
                    node: member,
                    isPrivate: false,
                    isPublic: true,
                    scope: structName,
                    valueType: type || undefined,
                    isReadonly: member.isReadonly || false,
                    isConstant: member.isConstant || false
                };
            }
        }

        // 如果在当前结构作用域中没找到，检查继承的父结构
        if (structNode.extendsType) {
            const parentName = structNode.extendsType.name;
            const parentMember = this.findStructMember(parentName, memberName);
            if (parentMember) {
                return parentMember;
            }
        }

        return null;
    }

    /**
     * 查找方法
     * @param typeName 类型名称（结构名或接口名）
     * @param methodName 方法名
     * @param isStatic 是否是静态方法
     * @returns 方法信息，如果未找到返回 null
     */
    private findMethod(typeName: string, methodName: string, isStatic: boolean): SymbolInfo | null {
        // 查找结构或接口
        const structSymbol = this.findSymbol(typeName, SymbolType.STRUCT);
        const interfaceSymbol = this.findSymbol(typeName, SymbolType.INTERFACE);

        if (!structSymbol && !interfaceSymbol) {
            return null;
        }

        const targetNode = structSymbol?.node || interfaceSymbol?.node;
        if (!(targetNode instanceof StructDeclaration) && !(targetNode instanceof InterfaceDeclaration)) {
            return null;
        }

        // 检查内置方法（仅对结构有效）
        if (targetNode instanceof StructDeclaration) {
            // allocate() 是内置的私有静态方法，总是存在
            if (methodName === "allocate" && isStatic) {
                // 检查是否有自定义的 create 方法，如果有，allocate 需要相同的参数
                const createMethod = this.findDeclaredMethod(targetNode, "create", true);
                if (createMethod) {
                    // allocate 需要与 create 相同的参数
                    return {
                        name: "allocate",
                        type: SymbolType.METHOD,
                        node: targetNode,
                        isPrivate: true,
                        isPublic: false,
                        scope: typeName,
                        returnType: typeName,
                        parameters: createMethod.parameters || []
                    };
                } else {
                    // 默认的 allocate 没有参数
                    return {
                        name: "allocate",
                        type: SymbolType.METHOD,
                        node: targetNode,
                        isPrivate: true,
                        isPublic: false,
                        scope: typeName,
                        returnType: typeName,
                        parameters: []
                    };
                }
            }

            // create() 方法：如果声明了则使用声明的，否则使用默认的（调用 allocate）
            if (methodName === "create" && isStatic) {
                const declaredCreate = this.findDeclaredMethod(targetNode, "create", true);
                if (declaredCreate) {
                    return declaredCreate;
                } else {
                    // 默认的 create 方法（无参数，返回结构类型）
                    return {
                        name: "create",
                        type: SymbolType.METHOD,
                        node: targetNode,
                        isPrivate: false,
                        isPublic: true,
                        scope: typeName,
                        returnType: typeName,
                        parameters: []
                    };
                }
            }

            // destroy() 是内置方法，可以作为静态或实例方法调用
            if (methodName === "destroy") {
                // 检查是否有自定义的 destroy 方法
                const declaredDestroy = this.findDeclaredMethod(targetNode, "destroy", isStatic);
                if (declaredDestroy) {
                    return declaredDestroy;
                } else {
                    // 默认的 destroy 方法
                    // 如果是静态调用，接受一个结构实例参数
                    // 如果是实例调用，无参数
                    if (isStatic) {
                        return {
                            name: "destroy",
                            type: SymbolType.METHOD,
                            node: targetNode,
                            isPrivate: false,
                            isPublic: true,
                            scope: typeName,
                            returnType: "nothing",
                            parameters: [{ name: "instance", type: typeName }]
                        };
                    } else {
                        return {
                            name: "destroy",
                            type: SymbolType.METHOD,
                            node: targetNode,
                            isPrivate: false,
                            isPublic: true,
                            scope: typeName,
                            returnType: "nothing",
                            parameters: []
                        };
                    }
                }
            }
        }

        // 直接在结构/接口的成员中查找方法
        if (targetNode instanceof StructDeclaration) {
            const declaredMethod = this.findDeclaredMethod(targetNode, methodName, isStatic);
            if (declaredMethod) {
                return declaredMethod;
            }
        } else if (targetNode instanceof InterfaceDeclaration) {
            // 接口方法不能是静态的
            if (!isStatic) {
                const declaredMethod = this.findDeclaredMethod(targetNode, methodName, false);
                if (declaredMethod) {
                    return declaredMethod;
                }
            }
        }

        // 如果在当前结构/接口中没找到，检查继承的父结构
        if (targetNode instanceof StructDeclaration && targetNode.extendsType) {
            const parentName = targetNode.extendsType.name;
            const parentMethod = this.findMethod(parentName, methodName, isStatic);
            if (parentMethod) {
                return parentMethod;
            }
        }

        // 检查委托（delegate）
        // 根据文档：如果 JassHelper 无法找到某个请求成员的方法，它将开始在结构体中查找该成员，
        // 如果它在其中一个委托中找到该成员，则将其编译为对委托成员的调用
        if (targetNode instanceof StructDeclaration) {
            for (const member of targetNode.members) {
                if (member instanceof DelegateDeclaration) {
                    const delegateType = member.delegateType.name;
                    const delegateMethod = this.findMethod(delegateType, methodName, false);
                    if (delegateMethod) {
                        return delegateMethod;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 在结构或接口中查找声明的方法（不包括内置方法）
     * @param targetNode 结构或接口节点
     * @param methodName 方法名
     * @param isStatic 是否是静态方法
     * @returns 方法信息，如果未找到返回 null
     */
    private findDeclaredMethod(
        targetNode: StructDeclaration | InterfaceDeclaration,
        methodName: string,
        isStatic: boolean
    ): SymbolInfo | null {
        for (const member of targetNode.members) {
            if (member instanceof MethodDeclaration) {
                const memberMethodName = member.name ? member.name.name : (member.operatorName || "");
                if (memberMethodName === methodName) {
                    // 检查是否是静态方法
                    if (member.isStatic === isStatic) {
                        // 构建方法信息
                        const returnType = member.returnType ?
                            (member.returnType instanceof Identifier ? member.returnType.name : "thistype") : null;
                        const parameters: Array<{ name: string; type: string }> = [];
                        for (const param of member.parameters) {
                            const paramType = param.type ?
                                (param.type instanceof Identifier ? param.type.name : "thistype") : "nothing";
                            parameters.push({
                                name: param.name.name,
                                type: paramType
                            });
                        }
                        const structName = targetNode instanceof StructDeclaration && targetNode.name ?
                            targetNode.name.name :
                            (targetNode instanceof InterfaceDeclaration && targetNode.name ? targetNode.name.name : "");
                        return {
                            name: methodName,
                            type: SymbolType.METHOD,
                            node: member,
                            isPrivate: false,
                            isPublic: true,
                            scope: structName,
                            returnType: returnType || undefined,
                            parameters
                        };
                    }
                }
            }
        }
        return null;
    }

    /**
     * 检查方法签名匹配
     */
    private checkMethodSignature(
        methodInfo: SymbolInfo,
        callNode: CallExpression,
        methodName: string,
        typeName: string
    ): void {
        if (!methodInfo.parameters) {
            // 方法没有参数定义，无法检查
            return;
        }

        // 检查参数数量
        if (callNode.arguments.length !== methodInfo.parameters.length) {
            this.addError(
                callNode.start,
                callNode.end,
                `方法 '${typeName}.${methodName}' 期望 ${methodInfo.parameters.length} 个参数，但提供了 ${callNode.arguments.length} 个参数`,
                `检查方法调用参数数量`
            );
            return;
        }

        // 检查参数类型
        for (let i = 0; i < callNode.arguments.length; i++) {
            const arg = callNode.arguments[i];
            const param = methodInfo.parameters[i];
            this.checkTypeCompatibility(arg, param.type, `${typeName}.${methodName}`, i + 1);
        }
    }

    /**
     * 检查类型兼容性
     */
    private checkTypeCompatibility(
        expr: Expression,
        expectedType: string,
        context: string,
        paramIndex: number
    ): void {
        let actualType = expr.getType();

        // 如果 getType() 返回 null，尝试从符号表中获取类型
        if (!actualType && expr instanceof Identifier) {
            const varSymbol = this.findSymbol(expr.name);
            if (varSymbol && varSymbol.valueType) {
                actualType = varSymbol.valueType;
            }
        }

        if (actualType && expectedType !== "nothing") {
            // 基本类型检查，传递上下文表达式以支持 thistype 解析
            if (actualType !== expectedType &&
                !this.isTypeCompatible(actualType, expectedType, expr)) {
                this.addWarning(
                    expr.start,
                    expr.end,
                    `Type '${actualType}' of parameter ${paramIndex} may be incompatible with expected type '${expectedType}'`
                );
            }
        }
    }

    /**
     * 检查类型是否兼容
     * @param actualType 实际类型
     * @param expectedType 期望类型
     * @param contextExpr 可选的上下文表达式（用于解析 thistype）
     * @returns 是否兼容
     */
    private isTypeCompatible(actualType: string, expectedType: string, contextExpr?: Expression): boolean {
        // 基本类型兼容性规则
        // integer 和 real 在某些情况下可以兼容
        if ((actualType === "integer" && expectedType === "real") ||
            (actualType === "real" && expectedType === "integer")) {
            return true;
        }

        // 相同类型总是兼容
        if (actualType === expectedType) {
            return true;
        }

        // 处理 thistype 类型
        // 在结构内部，thistype 等同于结构名
        if (actualType === "thistype") {
            if (contextExpr) {
                const resolvedType = this.resolveThistype(contextExpr);
                if (resolvedType) {
                    // 递归检查解析后的类型
                    return this.isTypeCompatible(resolvedType, expectedType, contextExpr);
                }
            }
            // 如果没有上下文，无法解析 thistype，返回 false
            return false;
        }
        if (expectedType === "thistype") {
            if (contextExpr) {
                const resolvedType = this.resolveThistype(contextExpr);
                if (resolvedType) {
                    // 递归检查解析后的类型
                    return this.isTypeCompatible(actualType, resolvedType, contextExpr);
                }
            }
            // 如果没有上下文，无法解析 thistype，返回 false
            return false;
        }

        // 检查结构继承关系（子结构可赋值给父结构）
        // 子结构可以赋值给父结构，包括父结构是接口的情况
        if (this.isStructSubtype(actualType, expectedType)) {
            return true;
        }

        // 检查接口实现关系
        // 如果 actualType 是结构，expectedType 是接口，且结构实现了该接口
        // 这包括通过 implement 语句实现的接口
        if (this.isStructImplementsInterface(actualType, expectedType)) {
            return true;
        }

        // 检查结构通过继承实现的接口
        // 如果 actualType 是结构，expectedType 是接口，且结构通过 extends 实现了该接口
        if (this.isStructInheritsFromInterface(actualType, expectedType)) {
            return true;
        }

        // 检查接口继承关系（如果支持接口继承）
        // 如果 actualType 和 expectedType 都是接口，且 actualType 继承自 expectedType
        if (this.isInterfaceSubtype(actualType, expectedType)) {
            return true;
        }

        return false;
    }

    /**
     * 解析 thistype 类型
     * 在结构内部，thistype 等同于结构名
     */
    private resolveThistype(expr: Expression): string | null {
        // 查找包含该表达式的结构作用域
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scope = this.scopeStack[i];
            if (scope.type === "struct") {
                return scope.name;
            }
        }
        return null;
    }

    /**
     * 检查是否是结构子类型关系
     * 即 actualType 是否是 expectedType 的子结构
     * 子结构可以赋值给父结构（包括父结构是接口的情况）
     */
    private isStructSubtype(actualType: string, expectedType: string): boolean {
        // 首先检查 actualType 是否是结构
        const actualSymbol = this.findSymbol(actualType);
        if (!actualSymbol || actualSymbol.type !== SymbolType.STRUCT) {
            return false;
        }

        // 检查 expectedType 是否是结构或接口
        const expectedSymbol = this.findSymbol(expectedType);
        if (!expectedSymbol ||
            (expectedSymbol.type !== SymbolType.STRUCT && expectedSymbol.type !== SymbolType.INTERFACE)) {
            return false;
        }

        // 检查 actualType 是否是 expectedType 的子结构
        // 通过遍历继承链来检查
        let currentType: string | null = actualType;
        const visited = new Set<string>();

        while (currentType && !visited.has(currentType)) {
            visited.add(currentType);

            // 如果当前类型就是期望类型，返回 true
            if (currentType === expectedType) {
                return true;
            }

            // 获取父类型（可能是结构或接口）
            const parentType = this.structInheritance.get(currentType);
            if (!parentType) {
                break;
            }

            // 检查父类型是否是期望类型
            if (parentType === expectedType) {
                return true;
            }

            // 继续向上遍历继承链
            currentType = parentType;
        }

        return false;
    }

    /**
     * 检查结构是否实现了接口
     * 这包括通过 implement 语句实现的接口
     */
    private isStructImplementsInterface(structType: string, interfaceType: string): boolean {
        // 首先检查 interfaceType 是否是接口
        const interfaceSymbol = this.findSymbol(interfaceType);
        if (!interfaceSymbol || interfaceSymbol.type !== SymbolType.INTERFACE) {
            return false;
        }

        // 检查结构是否直接实现了接口（通过 implement 语句）
        const structInterfaces = this.structInterfaces.get(structType);
        if (structInterfaces && structInterfaces.has(interfaceType)) {
            return true;
        }

        // 检查结构是否通过继承实现了接口
        // 如果结构继承自另一个结构，而该结构实现了接口
        const parentType = this.structInheritance.get(structType);
        if (parentType) {
            return this.isStructImplementsInterface(parentType, interfaceType);
        }

        return false;
    }

    /**
     * 检查结构是否通过继承实现了接口
     * 即结构继承自接口（extends interface）
     */
    private isStructInheritsFromInterface(structType: string, interfaceType: string): boolean {
        // 首先检查 interfaceType 是否是接口
        const interfaceSymbol = this.findSymbol(interfaceType);
        if (!interfaceSymbol || interfaceSymbol.type !== SymbolType.INTERFACE) {
            return false;
        }

        // 检查结构是否直接继承自接口
        const parentType = this.structInheritance.get(structType);
        if (parentType === interfaceType) {
            // 检查父类型是否是接口
            const parentSymbol = this.findSymbol(parentType);
            if (parentSymbol && parentSymbol.type === SymbolType.INTERFACE) {
                return true;
            }
        }

        // 递归检查父结构
        if (parentType) {
            return this.isStructInheritsFromInterface(parentType, interfaceType);
        }

        return false;
    }

    /**
     * 检查接口继承关系
     * 如果 actualType 和 expectedType 都是接口，且 actualType 继承自 expectedType
     * 注意：当前 vJass 可能不支持接口继承，但为将来扩展预留
     */
    private isInterfaceSubtype(actualType: string, expectedType: string): boolean {
        // 检查 actualType 和 expectedType 是否都是接口
        const actualSymbol = this.findSymbol(actualType);
        const expectedSymbol = this.findSymbol(expectedType);

        if (!actualSymbol || actualSymbol.type !== SymbolType.INTERFACE) {
            return false;
        }
        if (!expectedSymbol || expectedSymbol.type !== SymbolType.INTERFACE) {
            return false;
        }

        // 如果相同，返回 true
        if (actualType === expectedType) {
            return true;
        }

        // 检查接口继承关系（如果将来支持接口继承）
        // 目前 vJass 可能不支持接口继承，但为将来扩展预留
        // 可以通过 interfaceInheritance Map 来存储接口继承关系

        return false;
    }

    /**
     * 检查赋值语句
     */
    private checkAssignment(node: AssignmentStatement): void {
        // 检查赋值目标是否是只读的或常量
        if (node.target instanceof Identifier) {
            const varName = node.target.name;
            const symbol = this.findSymbol(varName);

            // 检查赋值目标是否已声明（如果不是新声明）
            if (!symbol) {
                // 可能是新声明的变量，检查是否是局部变量声明
                // 在 vJass 中，局部变量必须使用 local 关键字声明
                // 这里简化处理，只检查已存在的变量
            }

            if (symbol) {
                // 检查常量变量不能被赋值
                if (symbol.isConstant) {
                    this.addError(
                        node.target.start,
                        node.target.end,
                        `常量变量 '${varName}' 不能被赋值`,
                        `移除对常量变量的赋值操作`
                    );
                    return;
                }

                // 检查只读成员不能被赋值
                if (symbol.isReadonly) {
                    this.addError(
                        node.target.start,
                        node.target.end,
                        `只读成员 '${varName}' 不能被赋值`,
                        `移除对只读成员的赋值操作`
                    );
                    return;
                }

                // 检查静态成员和实例成员是否是只读的
                if (symbol.type === SymbolType.STATIC_MEMBER || symbol.type === SymbolType.INSTANCE_MEMBER) {
                    if (symbol.isReadonly) {
                        this.addError(
                            node.target.start,
                            node.target.end,
                            `只读成员 '${varName}' 不能被赋值`,
                            `移除对只读成员的赋值操作`
                        );
                        return;
                    }
                }

                // 检查全局变量是否是常量或只读
                if (symbol.type === SymbolType.GLOBAL_VARIABLE) {
                    if (symbol.isConstant) {
                        this.addError(
                            node.target.start,
                            node.target.end,
                            `常量全局变量 '${varName}' 不能被赋值`,
                            `移除对常量全局变量的赋值操作`
                        );
                        return;
                    }
                    if (symbol.isReadonly) {
                        this.addError(
                            node.target.start,
                            node.target.end,
                            `只读全局变量 '${varName}' 不能被赋值`,
                            `移除对只读全局变量的赋值操作`
                        );
                        return;
                    }
                }
            }
        } else if (node.target instanceof BinaryExpression && node.target.operator === OperatorType.Dot) {
            // 成员访问赋值，如 obj.member = value
            // 需要检查成员是否是只读的
            if (!(node.target.right instanceof Identifier)) {
                return;
            }

            const memberName = node.target.right.name;
            const objectType = this.resolveObjectType(node.target.left);

            if (objectType) {
                // 查找结构成员
                const memberSymbol = this.findStructMember(objectType.typeName, memberName);

                if (memberSymbol) {
                    // 检查成员是否是只读的
                    if (memberSymbol.isReadonly) {
                        this.addError(
                            node.target.right.start,
                            node.target.right.end,
                            `只读成员 '${objectType.typeName}.${memberName}' 不能被赋值`,
                            `移除对只读成员的赋值操作`
                        );
                        return;
                    }

                    // 检查成员是否是常量
                    if (memberSymbol.isConstant) {
                        this.addError(
                            node.target.right.start,
                            node.target.right.end,
                            `常量成员 '${objectType.typeName}.${memberName}' 不能被赋值`,
                            `移除对常量成员的赋值操作`
                        );
                        return;
                    }
                }
            }
        }

        // 检查赋值右侧的变量使用
        this.checkExpressionVariables(node.value);
    }

    /**
     * 检查静态 if 语句
     */
    private checkStaticIf(node: IfStatement): void {
        if (!node.isStatic) return;

        // 静态 if 的条件必须是常量布尔值
        // 根据文档：条件必须使用布尔值常量，and 操作符以及 not 操作符
        // 在编译期间会对此进行分析
        const result = this.checkStaticIfCondition(node.condition);
        if (!result.isValid) {
            this.addError(
                node.condition.start,
                node.condition.end,
                result.errorMessage || `Static if condition must be a constant boolean value, or a constant boolean expression using and/or/not operators`,
                `Use a constant boolean value or constant boolean expression`
            );
        }
    }

    /**
     * 检查 return 语句
     */
    private checkReturnStatement(node: ReturnStatement): void {
        // 查找当前所在的函数/方法作用域
        const currentFunctionScope = this.findCurrentFunctionScope();
        if (!currentFunctionScope) {
            // 不在函数/方法作用域中，可能是全局作用域中的 return（不应该出现）
            return;
        }

        const expectedReturnType = currentFunctionScope.returnType;

        // 如果没有期望的返回类型（returns nothing），return 不应该有参数
        if (!expectedReturnType || expectedReturnType === "nothing") {
            if (node.argument !== null) {
                this.addError(
                    node.start,
                    node.end,
                    `函数返回类型为 'nothing'，return 语句不应该返回值`,
                    `移除 return 语句中的返回值`
                );
            }
            return;
        }

        // 如果有期望的返回类型，return 必须有参数
        if (node.argument === null) {
            this.addError(
                node.start,
                node.end,
                `函数返回类型为 '${expectedReturnType}'，return 语句必须返回值`,
                `在 return 语句中添加返回值`
            );
            return;
        }

        // 检查返回值的类型是否匹配
        const actualReturnType = node.argument.getType();
        if (actualReturnType) {
            // 处理 thistype 类型
            let resolvedExpectedType = expectedReturnType;
            if (expectedReturnType === "thistype" && node.argument instanceof ThistypeExpression) {
                const resolvedType = this.resolveThistype(node.argument);
                if (resolvedType) {
                    resolvedExpectedType = resolvedType;
                }
            }

            if (actualReturnType !== resolvedExpectedType &&
                !this.isTypeCompatible(actualReturnType, resolvedExpectedType, node.argument)) {
                this.addError(
                    node.argument.start,
                    node.argument.end,
                    `返回类型 '${actualReturnType}' 与函数返回类型 '${expectedReturnType}' 不匹配`,
                    `将返回值类型改为 '${expectedReturnType}'`
                );
            }
        }
    }

    /**
     * 查找当前所在的函数/方法作用域
     */
    private findCurrentFunctionScope(): ScopeInfo | null {
        // 从作用域栈顶部向下查找函数/方法作用域
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scope = this.scopeStack[i];
            if (scope.type === "function") {
                return scope;
            }
        }
        return null;
    }


    /**
     * 检查原生函数是否有函数体（不应该有）
     */
    private checkNativeFunctionReturns(node: NativeDeclaration): void {
        // Native 函数不应该有函数体，这个检查在解析阶段应该已经完成
        // 但为了完整性，这里可以添加额外的检查
        // 注意：NativeDeclaration 没有 body 属性，所以这里不需要检查
    }

    /**
     * 检查函数的所有代码路径是否都有返回值
     */
    private checkFunctionReturns(node: FunctionDeclaration): void {
        if (!node.body) {
            return; // 没有函数体，不需要检查
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        // 如果返回类型是 nothing，不需要检查返回值
        if (!returnType || returnType === "nothing") {
            return;
        }

        // 检查函数体是否所有代码路径都有返回值
        const hasReturn = this.checkBlockReturns(node.body);
        if (!hasReturn) {
            this.addError(
                node.body.start,
                node.body.end,
                `函数 '${node.name?.name || "unknown"}' 返回类型为 '${returnType}'，但并非所有代码路径都有返回值`,
                `确保所有代码路径都有 return 语句`
            );
        }
    }

    /**
     * 检查方法的所有代码路径是否都有返回值
     */
    private checkMethodReturns(node: MethodDeclaration): void {
        if (!node.body) {
            return; // 没有方法体，不需要检查
        }

        // 如果方法在接口中且有 defaults 值，且结构中没有实现，不应该检查
        // 这里简化处理：只检查结构中的方法（有 body 的方法）
        // 接口中的方法声明（没有 body）不应该被检查
        // 但这里 node.body 已经存在，说明是结构中的方法实现

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        // 如果返回类型是 nothing，不需要检查返回值
        if (!returnType || returnType === "nothing") {
            return;
        }

        // 检查方法体是否所有代码路径都有返回值
        const hasReturn = this.checkBlockReturns(node.body);
        if (!hasReturn) {
            const methodName = node.name ? node.name.name : (node.operatorName || "unknown");
            this.addError(
                node.body.start,
                node.body.end,
                `方法 '${methodName}' 返回类型为 '${returnType}'，但并非所有代码路径都有返回值`,
                `确保所有代码路径都有 return 语句`
            );
        }
    }

    /**
     * 检查 BlockStatement 是否所有代码路径都有返回值
     * @param block 要检查的 BlockStatement
     * @returns 如果所有代码路径都有返回值，返回 true；否则返回 false
     */
    private checkBlockReturns(block: BlockStatement): boolean {
        if (block.body.length === 0) {
            return false; // 空的函数体，没有返回值
        }

        // 检查最后一条语句是否是 return
        const lastStatement = block.body[block.body.length - 1];
        if (lastStatement instanceof ReturnStatement) {
            return true; // 最后一条语句是 return，所有路径都会返回
        }

        // 检查是否有 if 语句，且所有分支都有返回值
        for (let i = block.body.length - 1; i >= 0; i--) {
            const stmt = block.body[i];

            if (stmt instanceof ReturnStatement) {
                // 找到 return 语句，检查它之后是否还有可执行代码
                // 如果 return 之后还有代码，那些代码是不可达的（但这里简化处理）
                return true;
            }

            if (stmt instanceof IfStatement) {
                // 检查 if 语句的所有分支是否都有返回值
                const ifReturns = this.checkIfStatementReturns(stmt);
                if (ifReturns) {
                    // if 语句的所有分支都有返回值，那么后续代码不可达
                    return true;
                }
            }

            // 注意：loop 语句的处理比较复杂
            // 如果 loop 没有 exitwhen，它可能永远不会退出（无限循环）
            // 如果 loop 有 exitwhen，它可能退出，需要检查 loop 之后的代码
            // 这里简化处理：假设 loop 之后的代码可能不可达（如果 loop 没有 exitwhen）
            // 或者 loop 可能退出（如果有 exitwhen），需要检查 loop 之后的代码
        }

        return false; // 没有找到 return 语句
    }

    /**
     * 检查 IfStatement 是否所有分支都有返回值
     * @param node IfStatement 节点
     * @returns 如果所有分支都有返回值，返回 true；否则返回 false
     */
    private checkIfStatementReturns(node: IfStatement): boolean {
        // 检查 then 分支
        let thenReturns = false;
        if (node.consequent instanceof BlockStatement) {
            thenReturns = this.checkBlockReturns(node.consequent);
        } else if (node.consequent instanceof ReturnStatement) {
            thenReturns = true;
        }

        // 检查 else 分支
        let elseReturns = false;
        if (node.alternate) {
            if (node.alternate instanceof BlockStatement) {
                elseReturns = this.checkBlockReturns(node.alternate);
            } else if (node.alternate instanceof ReturnStatement) {
                elseReturns = true;
            } else if (node.alternate instanceof IfStatement) {
                // elseif 分支
                elseReturns = this.checkIfStatementReturns(node.alternate);
            }
        }

        // 只有当 then 和 else 分支都有返回值时，if 语句才保证所有路径都有返回值
        return thenReturns && elseReturns;
    }

    /**
     * 检查静态 if 条件
     * @returns 检查结果
     */
    private checkStaticIfCondition(expr: Expression): ConstantExpressionResult {
        // 检查是否是布尔字面量
        if (expr instanceof BooleanLiteral) {
            return {
                isValid: true,
                isConstant: true,
                value: expr.value,
                type: "boolean"
            };
        }

        // 检查是否是整数字面量（允许，非零为真，零为假）
        if (expr instanceof IntegerLiteral) {
            return {
                isValid: true,
                isConstant: true,
                value: expr.value !== 0,
                type: "boolean"
            };
        }

        // 检查是否是实数或字符串字面量（不允许）
        if (expr instanceof RealLiteral || expr instanceof StringLiteral) {
            return {
                isValid: false,
                isConstant: false,
                    errorMessage: `Static if can only use boolean constants, cannot use '${expr.getType()}' type constants`
            };
        }

        // 检查是否是标识符（可能是常量）
        if (expr instanceof Identifier) {
            return this.checkStaticIfIdentifier(expr);
        }

        // 检查是否是二元表达式（and/or/not）
        if (expr instanceof BinaryExpression) {
            return this.checkStaticIfBinaryExpression(expr);
        }

        // 如果不是有效的静态 if 条件
        return {
            isValid: false,
            isConstant: false,
            errorMessage: `Static if condition must be a constant boolean value, or a constant boolean expression using and/or/not operators`
        };
    }

    /**
     * 检查静态 if 中的标识符
     */
    private checkStaticIfIdentifier(expr: Identifier): ConstantExpressionResult {
        const name = expr.name;

        // 检查是否是 LIBRARY_ 前缀的库常量
        // 根据文档：库的声明将创建一个名为"LIBRARY_库名称"布尔常量，默认值为真
        if (name.startsWith("LIBRARY_")) {
            const libName = name.substring(8); // 去掉 "LIBRARY_" 前缀
            const libSymbol = this.findSymbol(libName, SymbolType.LIBRARY);

            if (libSymbol) {
                // 库存在，返回 true
                return {
                    isValid: true,
                    isConstant: true,
                    value: true,
                    type: "boolean"
                };
            } else {
                // 库不存在，返回 false（但仍然是有效的常量表达式）
                return {
                    isValid: true,
                    isConstant: true,
                    value: false,
                    type: "boolean"
                };
            }
        }

        // 查找符号
        const symbol = this.findSymbol(name);

        if (!symbol) {
            return {
                isValid: false,
                isConstant: false,
                errorMessage: `Undefined identifier '${name}'`
            };
        }

        // 检查是否是全局变量
        if (symbol.type === SymbolType.GLOBAL_VARIABLE) {
            // 需要检查变量是否是常量
            if (symbol.node instanceof VariableDeclaration) {
                const varDecl = symbol.node;

                // 检查是否是常量
                if (!varDecl.isConstant) {
                    return {
                        isValid: false,
                        isConstant: false,
                        errorMessage: `Static if can only use constants, '${name}' is not a constant`
                    };
                }

                // 检查类型：允许 boolean 和 integer（整数常量：非零为真，零为假）
                const varType = varDecl.type ?
                    (varDecl.type instanceof Identifier ? varDecl.type.name : null) : null;

                if (varType === "boolean") {
                    // 布尔常量，继续处理
                } else if (varType === "integer") {
                    // 整数常量，允许使用（非零为真，零为假）
                    // 尝试求值（如果初始化表达式是常量）
                    if (varDecl.initializer) {
                        const initResult = this.checkStaticIfCondition(varDecl.initializer);
                        if (initResult.isConstant && initResult.value !== undefined) {
                            // 将整数转换为布尔值（非零为真，零为假）
                            const intValue = typeof initResult.value === "number" ? initResult.value : 0;
                            return {
                                isValid: true,
                                isConstant: true,
                                value: intValue !== 0,
                                type: "boolean"
                            };
                        }
                    }
                    // 是常量整数变量，但无法在编译时求值
                    return {
                        isValid: true,
                        isConstant: false,
                        type: "boolean"
                    };
                } else if (varType === "real" || varType === "string") {
                    // 实数或字符串常量，不允许在 static if 中使用
                    return {
                        isValid: false,
                        isConstant: false,
                        errorMessage: `Static if can only use boolean or integer constants, cannot use '${varType}' type constants`
                    };
                } else {
                    return {
                        isValid: false,
                        isConstant: false,
                        errorMessage: `Static if condition must be boolean or integer type, '${name}' is of type '${varType || "unknown"}'`
                    };
                }

                // 尝试求值（如果初始化表达式是常量）
                if (varDecl.initializer) {
                    const initResult = this.checkStaticIfCondition(varDecl.initializer);
                    if (initResult.isConstant && initResult.value !== undefined) {
                        return {
                            isValid: true,
                            isConstant: true,
                            value: initResult.value,
                            type: "boolean"
                        };
                    }
                }

                // 是常量布尔变量，但无法在编译时求值（可能是外部定义的）
                return {
                    isValid: true,
                    isConstant: false, // 无法在编译时求值
                    type: "boolean"
                };
            }
        }

        // 其他类型的符号不能用于 static if
        return {
            isValid: false,
            isConstant: false,
            errorMessage: `Static if can only use constant boolean variables, '${name}' is not a constant boolean variable`
        };
    }

    /**
     * 检查静态 if 中的二元表达式
     */
    private checkStaticIfBinaryExpression(expr: BinaryExpression): ConstantExpressionResult {
        // 对于 not 操作符，检查右操作数（parser 将 not A 解析为 BinaryExpression(Not, 0, A)）
        // 注意：对于 not，left 是 IntegerLiteral(0)，right 是实际的操作数
        if (expr.operator === OperatorType.Not) {
            if (!expr.right) {
                return {
                    isValid: false,
                    isConstant: false,
                    errorMessage: `Operator 'not' requires an operand`
                };
            }
            const rightResult = this.checkStaticIfCondition(expr.right);
            if (!rightResult.isValid) {
                return rightResult;
            }
            if (rightResult.isConstant && rightResult.value !== undefined) {
                return {
                    isValid: true,
                    isConstant: true,
                    value: !rightResult.value,
                    type: "boolean"
                };
            }
            return {
                isValid: true,
                isConstant: false,
                type: "boolean"
            };
        }

        // 检查操作符是否是允许的（and/or）
        const allowedOperators = [
            OperatorType.And,
            OperatorType.Or
        ];

        if (!allowedOperators.includes(expr.operator)) {
            // 检查操作数是否是实数/字符串常量，如果是，给出更具体的错误消息
            // 先检查字面量
            if (expr.left instanceof RealLiteral || expr.left instanceof StringLiteral ||
                (expr.right && (expr.right instanceof RealLiteral || expr.right instanceof StringLiteral))) {
                return {
                    isValid: false,
                    isConstant: false,
                    errorMessage: `Static if can only use boolean constants, cannot use real or string constants`
                };
            }
            
            // 检查标识符（可能是常量变量）
            if (expr.left instanceof Identifier) {
                const leftSymbol = this.findSymbol(expr.left.name);
                if (leftSymbol && leftSymbol.node instanceof VariableDeclaration) {
                    const varType = leftSymbol.node.type ?
                        (leftSymbol.node.type instanceof Identifier ? leftSymbol.node.type.name : null) : null;
                    if (varType === "real" || varType === "string") {
                        return {
                            isValid: false,
                            isConstant: false,
                            errorMessage: `Static if can only use boolean constants, cannot use real or string constants`
                        };
                    }
                }
            }
            if (expr.right instanceof Identifier) {
                const rightSymbol = this.findSymbol(expr.right.name);
                if (rightSymbol && rightSymbol.node instanceof VariableDeclaration) {
                    const varType = rightSymbol.node.type ?
                        (rightSymbol.node.type instanceof Identifier ? rightSymbol.node.type.name : null) : null;
                    if (varType === "real" || varType === "string") {
                        return {
                            isValid: false,
                            isConstant: false,
                            errorMessage: `Static if can only use boolean constants, cannot use real or string constants`
                        };
                    }
                }
            }
            
            return {
                isValid: false,
                isConstant: false,
                errorMessage: `Static if can only use and/or/not operators, cannot use '${expr.operator}'`
            };
        }

        // 检查左操作数
        const leftResult = this.checkStaticIfCondition(expr.left);
        if (!leftResult.isValid) {
            return leftResult;
        }

        // 对于 and/or 操作符，需要右操作数
        if (!expr.right) {
            return {
                isValid: false,
                isConstant: false,
                errorMessage: `Operator '${expr.operator}' requires a right operand`
            };
        }

        const rightResult = this.checkStaticIfCondition(expr.right);
        if (!rightResult.isValid) {
            return rightResult;
        }

        // 如果两个操作数都是常量，可以求值
        if (leftResult.isConstant && leftResult.value !== undefined &&
            rightResult.isConstant && rightResult.value !== undefined) {
            let result: boolean;
            if (expr.operator === OperatorType.And) {
                result = leftResult.value && rightResult.value;
            } else if (expr.operator === OperatorType.Or) {
                result = leftResult.value || rightResult.value;
            } else {
                return {
                    isValid: false,
                    isConstant: false,
                    errorMessage: `Unsupported operator '${expr.operator}'`
                };
            }

            return {
                isValid: true,
                isConstant: true,
                value: result,
                type: "boolean"
            };
        }

        // 至少有一个操作数不是常量，但表达式本身是有效的
        return {
            isValid: true,
            isConstant: false,
            type: "boolean"
        };
    }

    /**
     * 检查库的循环依赖
     */
    private checkLibraryCircularDependencies(): void {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (libName: string, path: string[]): void => {
            if (recursionStack.has(libName)) {
                // 发现循环依赖
                const cycleStart = path.indexOf(libName);
                const cycle = path.slice(cycleStart).concat(libName);
                const libSymbol = this.findSymbol(libName, SymbolType.LIBRARY);

                if (libSymbol && libSymbol.node instanceof LibraryDeclaration) {
                    this.addError(
                        libSymbol.node.start,
                        libSymbol.node.end,
                        `检测到循环依赖: ${cycle.join(" -> ")}`,
                        `移除循环依赖关系`
                    );
                }
                return;
            }

            if (visited.has(libName)) {
                return;
            }

            visited.add(libName);
            recursionStack.add(libName);

            const deps = this.libraryDependencies.get(libName);
            if (deps) {
                for (const dep of deps) {
                    dfs(dep, path.concat(libName));
                }
            }

            recursionStack.delete(libName);
        };

        for (const libName of this.libraryDependencies.keys()) {
            if (!visited.has(libName)) {
                dfs(libName, []);
            }
        }
    }

    /**
     * 查找符号
     */
    private findSymbol(name: string, type?: SymbolType): SymbolInfo | null {
        // 从当前作用域向上查找（包括全局作用域）
        // 全局作用域总是在栈底（索引 0）
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scope = this.scopeStack[i];
            const symbol = scope.symbols.get(name);
            if (symbol) {
                if (!type || symbol.type === type) {
                    return symbol;
                }
            }
        }

        // 如果没找到，也尝试在全局符号表中查找（双重保险）
        if (this.scopeStack.length > 0) {
            const globalScope = this.scopeStack[0];
            const symbol = globalScope.symbols.get(name);
            if (symbol) {
                if (!type || symbol.type === type) {
                    return symbol;
                }
            }
        }

        return null;
    }

    /**
     * 添加错误
     */
    private addError(
        start: { line: number; position: number },
        end: { line: number; position: number },
        message: string,
        fix?: string
    ): void {
        this.errors.push(new SimpleError(start, end, message, fix));
    }

    /**
     * 添加警告
     */
    private addWarning(
        start: { line: number; position: number },
        end: { line: number; position: number },
        message: string
    ): void {
        this.warnings.push(new SimpleWarning(start, end, message));
    }

    /**
     * 添加检查验证错误
     */
    private addCheckError(
        node: ASTNode,
        message: string,
        checkType: CheckErrorType = CheckErrorType.SEMANTIC_ERROR,
        severity: "error" | "warning" | "info" = "error"
    ): void {
        this.checkErrors.push({
            start: node.start,
            end: node.end,
            message,
            nodeType: node.constructor.name,
            checkType,
            severity
        });
    }

    /**
     * 检查变量使用
     * 检查变量在使用前是否已声明
     * @param node 标识符节点
     * @param context 使用上下文（用于判断是否是变量使用）
     */
    private checkVariableUsage(node: Identifier, context: "assignment" | "expression" | "call" = "expression"): void {
        const name = node.name;

        // 跳过一些特殊标识符
        if (name === "this" || name === "super") {
            return;
        }

        // 检查是否是变量使用（不是函数调用、类型名等）
        const symbol = this.findSymbol(name);

        if (!symbol) {
            // 检查是否是函数名
            const funcSymbol = this.findSymbol(name, SymbolType.FUNCTION);
            if (funcSymbol) {
                return; // 是函数名，不需要检查
            }

            // 检查是否是结构名
            const structSymbol = this.findSymbol(name, SymbolType.STRUCT);
            if (structSymbol) {
                return; // 是结构名，不需要检查
            }

            // 检查是否是接口名
            const interfaceSymbol = this.findSymbol(name, SymbolType.INTERFACE);
            if (interfaceSymbol) {
                return; // 是接口名，不需要检查
            }

            // 检查是否是类型名
            const typeSymbol = this.findSymbol(name, SymbolType.TYPE);
            if (typeSymbol) {
                return; // 是类型名，不需要检查
            }

            // 检查是否是库名
            const libSymbol = this.findSymbol(name, SymbolType.LIBRARY);
            if (libSymbol) {
                return; // 是库名，不需要检查
            }

            // 检查是否是方法名
            const methodSymbol = this.findSymbol(name, SymbolType.METHOD);
            if (methodSymbol) {
                return; // 是方法名，不需要检查
            }

            // 可能是未声明的变量
            // 在赋值语句的右侧或表达式中，未声明的变量应该报错
            if (context === "assignment" || context === "expression") {
                // 如果启用了未定义行为检查，才报告警告
                if (this.options.checkUndefinedBehavior) {
                    this.addWarning(
                        node.start,
                        node.end,
                        `变量 '${name}' 可能未声明，请确保在使用前已声明`
                    );
                }
            }
        } else {
            // 变量已声明，检查作用域是否正确
            // 局部变量应该在当前作用域或父作用域中
            if (symbol.type === SymbolType.LOCAL_VARIABLE) {
                // 检查变量是否在当前作用域链中
                const currentScope = this.scopeStack[this.scopeStack.length - 1];
                let foundInScope = false;

                // 检查当前作用域及其父作用域
                for (let i = this.scopeStack.length - 1; i >= 0; i--) {
                    const scope = this.scopeStack[i];
                    if (scope.symbols.has(name)) {
                        foundInScope = true;
                        break;
                    }
                }

                if (!foundInScope) {
                    this.addError(
                        node.start,
                        node.end,
                        `局部变量 '${name}' 不在当前作用域中`,
                        `检查变量作用域是否正确`
                    );
                }
            }
        }
    }

    /**
     * 检查表达式中的变量使用
     */
    private checkExpressionVariables(expr: Expression): void {
        if (expr instanceof Identifier) {
            this.checkVariableUsage(expr, "expression");
        } else if (expr instanceof BinaryExpression) {
            // 递归检查左右操作数
            this.checkExpressionVariables(expr.left);
            this.checkExpressionVariables(expr.right);
        } else if (expr instanceof CallExpression) {
            // 检查参数中的变量
            for (const arg of expr.arguments) {
                this.checkExpressionVariables(arg);
            }
        } else if (expr instanceof TypecastExpression) {
            this.checkExpressionVariables(expr.expression);
        }
    }
}

/**
 * 分析 AST 的语义
 * @param ast 要分析的 AST 根节点
 * @returns 错误集合
 */
/**
 * 分析语义
 * @param ast AST 节点
 * @param options 配置选项
 * @returns 错误集合
 */
export function analyzeSemantics(ast: BlockStatement, options?: SemanticAnalyzerOptions): ErrorCollection {
    // 如果提供了标准库文件列表，自动启用未定义行为检查
    const finalOptions: SemanticAnalyzerOptions = options ? {
        ...options,
        checkUndefinedBehavior: options.checkUndefinedBehavior ?? (options.standardLibraries && options.standardLibraries.length > 0)
    } : {};
    
    const analyzer = new SemanticAnalyzer(finalOptions);
    return analyzer.analyze(ast);
}

/**
 * 语义分析器测试函数
 * 测试各种语义检查场景
 */
export function testSemanticAnalyzer(): void {
    console.log("\n========== vJass 语义分析器测试 ==========\n");

    let totalPassed = 0;
    let totalFailed = 0;

    /**
     * 测试辅助函数
     */
    function testSemantic(
        name: string,
        code: string,
        validator: (errors: ErrorCollection, parser: Parser) => boolean
    ): boolean {
        const parser = new Parser(code);
        const ast = parser.parse();

        const result = analyzeSemantics(ast);
        const success = validator(result, parser);

        if (success) {
            console.log(`✓ ${name}`);
            totalPassed++;
        } else {
            console.log(`✗ ${name}`);
            if (result.errors.length > 0) {
                console.log(`  错误: ${result.errors.map(e => e.message).join(", ")}`);
            }
            if (result.warnings.length > 0) {
                console.log(`  警告: ${result.warnings.map(w => w.message).join(", ")}`);
            }
            totalFailed++;
        }
        return success;
    }

    // 测试 1: 库的循环依赖检测
    console.log("测试 1: 库的循环依赖检测");
    testSemantic(
        "检测库的循环依赖",
        `library A requires B
endlibrary
library B requires A
endlibrary`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("circular dependency") || e.message.includes("循环依赖"));
        }
    );

    // 测试 2: 库的依赖检查
    console.log("\n测试 2: 库的依赖检查");
    testSemantic(
        "检测未声明的库依赖",
        `library A requires NonExistentLib
endlibrary`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("not found") || e.message.includes("未找到"));
        }
    );

    testSemantic(
        "optional 依赖不报错",
        `library A requires optional OptionalLib
endlibrary`,
        (errors) => {
            // optional 依赖不存在不应该报错
            return !errors.errors.some(e => e.message.includes("OptionalLib"));
        }
    );

    // 测试 3: 结构继承检查
    console.log("\n测试 3: 结构继承检查");
    testSemantic(
        "检测未声明的父结构",
        `struct Child extends Parent
integer x
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("not found") || e.message.includes("未找到"));
        }
    );

    testSemantic(
        "正确的结构继承",
        `struct Parent
integer x
endstruct
struct Child extends Parent
integer y
endstruct`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 4: 结构索引空间增强限制
    console.log("\n测试 4: 结构索引空间增强限制");
    testSemantic(
        "继承的结构不能使用索引空间增强",
        `struct Parent
integer x
endstruct
struct Child[10000] extends Parent
integer y
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("index space enhancement") || e.message.includes("索引空间增强"));
        }
    );

    // 测试 5: 接口实现检查
    console.log("\n测试 5: 接口实现检查");
    testSemantic(
        "结构必须实现接口的所有方法",
        `interface Printable
method toString takes nothing returns string
endinterface
struct MyStruct extends Printable
integer value
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("must implement") || e.message.includes("必须实现"));
        }
    );

    testSemantic(
        "正确的接口实现",
        `interface Printable
method toString takes nothing returns string
endinterface
struct MyStruct extends Printable
integer value
method toString takes nothing returns string
return I2S(this.value)
endmethod
endstruct`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 6: 接口 defaults 关键字
    console.log("\n测试 6: 接口 defaults 关键字");
    testSemantic(
        "有 defaults 的方法可以不实现",
        `interface TestInterface
method optionalMethod takes nothing returns boolean defaults false
method requiredMethod takes nothing returns nothing
endinterface
struct MyStruct extends TestInterface
method requiredMethod takes nothing returns nothing
call BJDebugMsg("test")
endmethod
endstruct`,
        (errors) => {
            // optionalMethod 有 defaults，可以不实现，不应该报错
            return !errors.errors.some(e => e.message.includes("optionalMethod"));
        }
    );

    // 测试 7: 接口不能声明 onDestroy
    console.log("\n测试 7: 接口不能声明 onDestroy");
    testSemantic(
        "接口不能声明 onDestroy 方法",
        `interface TestInterface
method onDestroy takes nothing returns nothing
endinterface`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("onDestroy"));
        }
    );

    // 测试 8: 方法签名匹配检查
    console.log("\n测试 8: 方法签名匹配检查");
    testSemantic(
        "方法返回类型必须匹配",
        `interface TestInterface
method test takes nothing returns integer
endinterface
struct MyStruct extends TestInterface
method test takes nothing returns string
return "test"
endmethod
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Return type") || e.message.includes("返回类型"));
        }
    );

    testSemantic(
        "方法参数数量必须匹配",
        `interface TestInterface
method test takes integer x, integer y returns nothing
endinterface
struct MyStruct extends TestInterface
method test takes integer x returns nothing
endmethod
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Parameter count") || e.message.includes("参数数量"));
        }
    );

    // 测试 9: 数组结构限制
    console.log("\n测试 9: 数组结构限制");
    testSemantic(
        "数组结构不能有默认值",
        `struct MyArrayStruct extends array
integer value = 0
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("默认值"));
        }
    );

    testSemantic(
        "数组结构不能有数组成员",
        `struct MyArrayStruct extends array
integer array values[10]
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("数组成员"));
        }
    );

    testSemantic(
        "数组结构不能声明 onDestroy",
        `struct MyArrayStruct extends array
method onDestroy takes nothing returns nothing
endmethod
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("onDestroy"));
        }
    );

    // 测试 10: 结构实例上限检查
    console.log("\n测试 10: 结构实例上限检查");
    testSemantic(
        "数组成员过大导致无法创建实例",
        `struct BigStruct
integer array data[10000]
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("preventing any instances") || e.message.includes("无法创建任何实例"));
        }
    );

    // 测试 11: 静态 if 检查
    console.log("\n测试 11: 静态 if 检查");
    testSemantic(
        "静态 if 条件必须是常量布尔值（非常量变量）",
        `globals
integer x = 5
endglobals
function test takes nothing returns nothing
static if x then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("static if") || e.message.includes("Static if") || e.message.includes("not a constant") || e.message.includes("不是常量"));
        }
    );

    testSemantic(
        "静态 if 使用布尔字面量（true）",
        `function test takes nothing returns nothing
static if true then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用布尔字面量（false）",
        `function test takes nothing returns nothing
static if false then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用常量布尔变量",
        `globals
constant boolean DO_TEST = true
endglobals
function test takes nothing returns nothing
static if DO_TEST then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用非布尔常量变量",
        `globals
constant integer VALUE = 5
endglobals
function test takes nothing returns nothing
static if VALUE then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("boolean") || e.message.includes("布尔类型") || e.message.includes("类型"));
        }
    );

    testSemantic(
        "静态 if 使用 and 操作符",
        `globals
constant boolean A = true
constant boolean B = false
endglobals
function test takes nothing returns nothing
static if A and B then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用 or 操作符",
        `globals
constant boolean A = true
constant boolean B = false
endglobals
function test takes nothing returns nothing
static if A or B then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用 not 操作符",
        `globals
constant boolean A = true
endglobals
function test takes nothing returns nothing
static if not A then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用复杂的布尔表达式",
        `globals
constant boolean A = true
constant boolean B = false
endglobals
function test takes nothing returns nothing
static if A and not B then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用 LIBRARY_ 库常量",
        `library MyLib
endlibrary
function test takes nothing returns nothing
static if LIBRARY_MyLib then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用不存在的 LIBRARY_ 库常量",
        `function test takes nothing returns nothing
static if LIBRARY_NonExistentLib then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            // 不存在的库常量应该返回 false，但仍然是有效的常量表达式
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态 if 使用不允许的操作符（+）",
        `globals
constant boolean A = true
constant boolean B = false
endglobals
function test takes nothing returns nothing
static if A + B then
call BJDebugMsg("test")
endif
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("and/or/not") || e.message.includes("操作符"));
        }
    );

    // 测试 12: 函数调用参数检查
    console.log("\n测试 12: 函数调用参数检查");
    testSemantic(
        "函数调用参数数量不匹配",
        `function test takes integer x, integer y returns nothing
endfunction
function caller takes nothing returns nothing
call test(1)
endfunction`,
        (errors) => {
            // 检查错误消息中是否包含"参数"相关的内容
            return errors.errors.some(e =>
                e.message.includes("parameter") || e.message.includes("参数") ||
                (e.message.includes("expects") && e.message.includes("provided")) ||
                (e.message.includes("期望") && e.message.includes("提供"))
            );
        }
    );

    // 测试 21: 方法调用检查
    console.log("\n测试 21: 方法调用检查");
    testSemantic(
        "实例方法调用 - 正确的方法",
        `struct TestStruct
method testMethod takes integer x returns nothing
call BJDebugMsg(I2S(x))
endmethod
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
call ts.testMethod(5)
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "实例方法调用 - 方法不存在",
        `struct TestStruct
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
call ts.nonExistentMethod()
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("not found") && e.message.includes("Method") || e.message.includes("未找到方法"));
        }
    );

    testSemantic(
        "静态方法调用 - 正确的方法",
        `struct TestStruct
static method createInstance takes integer x returns TestStruct
local TestStruct ts = TestStruct.allocate()
set ts.value = x
return ts
endmethod
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.createInstance(10)
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "方法调用参数数量不匹配",
        `struct TestStruct
method testMethod takes integer x, integer y returns nothing
endmethod
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
call ts.testMethod(5)
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("参数数量") || e.message.includes("期望"));
        }
    );

    testSemantic(
        "接口方法调用",
        `interface TestInterface
method doSomething takes nothing returns nothing
endinterface
struct TestStruct extends TestInterface
method doSomething takes nothing returns nothing
call BJDebugMsg("test")
endmethod
endstruct
function test takes nothing returns nothing
local TestInterface ti = TestStruct.create()
call ti.doSomething()
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "通过委托调用方法",
        `struct A
method performAction takes nothing returns nothing
call BJDebugMsg("action")
endmethod
endstruct
struct B
delegate A deleg
static method create takes nothing returns B
local B b = B.allocate()
set b.deleg = A.create()
return b
endmethod
endstruct
function test takes nothing returns nothing
local B b = B.create()
call b.performAction()
endfunction`,
        (errors) => {
            // 委托的方法调用应该能找到
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "继承结构的方法调用",
        `struct Parent
method parentMethod takes nothing returns nothing
call BJDebugMsg("parent")
endmethod
endstruct
struct Child extends Parent
method childMethod takes nothing returns nothing
call this.parentMethod()
endmethod
endstruct
function test takes nothing returns nothing
local Child c = Child.create()
call c.parentMethod()
call c.childMethod()
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 13: 重复声明检查
    console.log("\n测试 13: 重复声明检查");
    testSemantic(
        "检测重复的结构声明",
        `struct Test
integer x
endstruct
struct Test
integer y
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    testSemantic(
        "检测重复的库声明",
        `library Test
endlibrary
library Test
endlibrary`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    // 测试 14: 结构继承链循环检测
    console.log("\n测试 14: 结构继承链循环检测");
    testSemantic(
        "检测结构继承链中的循环",
        `struct A extends B
endstruct
struct B extends C
endstruct
struct C extends A
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("循环继承"));
        }
    );

    // 测试 15: 模块检查
    console.log("\n测试 15: 模块检查");
    testSemantic(
        "检测未声明的模块",
        `struct MyStruct
implement NonExistentModule
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("not found") || e.message.includes("未找到"));
        }
    );

    testSemantic(
        "optional 模块不报错",
        `struct MyStruct
implement optional OptionalModule
endstruct`,
        (errors) => {
            return !errors.errors.some(e => e.message.includes("OptionalModule"));
        }
    );

    // 测试 16: 作用域检查
    console.log("\n测试 16: 作用域检查");
    testSemantic(
        "检测重复的作用域声明",
        `scope Test
endscope
scope Test
endscope`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    // 测试 17: 结构成员检查
    console.log("\n测试 17: 结构成员检查");
    testSemantic(
        "检测重复的结构成员",
        `struct Test
integer x
integer x
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    // 测试 18: 函数声明检查
    console.log("\n测试 18: 函数声明检查");
    testSemantic(
        "检测重复的函数声明",
        `function test takes nothing returns nothing
endfunction
function test takes nothing returns nothing
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    // 测试 19: 类型声明检查
    console.log("\n测试 19: 类型声明检查");
    testSemantic(
        "检测重复的类型声明",
        `type MyType extends integer
type MyType extends integer`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("already declared") || e.message.includes("已声明"));
        }
    );

    // 测试 20: 接口方法参数类型检查
    console.log("\n测试 20: 接口方法参数类型检查");
    testSemantic(
        "方法参数类型必须匹配",
        `interface TestInterface
method test takes integer x returns nothing
endinterface
struct MyStruct extends TestInterface
method test takes string x returns nothing
endmethod
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Parameter") && e.message.includes("type") || e.message.includes("参数类型"));
        }
    );

    // 测试 22: 常量变量在 static if 中的使用
    console.log("\n测试 22: 常量变量在 static if 中的使用");
    testSemantic(
        "static if 使用常量整数变量",
        `globals
constant integer DEBUG_MODE = 1
endglobals
function test takes nothing returns nothing
static if DEBUG_MODE then
call BJDebugMsg("debug")
endif
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "static if 使用常量实数变量",
        `globals
constant real PI = 3.14159
endglobals
function test takes nothing returns nothing
static if PI > 3.0 then
call BJDebugMsg("pi is large")
endif
endfunction`,
        (errors) => {
            // 实数常量在 static if 中应该报错（只支持布尔值）
            return errors.errors.some(e => e.message.includes("boolean") || e.message.includes("布尔值") || e.message.includes("constant") || e.message.includes("常量"));
        }
    );

    testSemantic(
        "static if 使用常量字符串变量",
        `globals
constant string MODE = "debug"
endglobals
function test takes nothing returns nothing
static if MODE == "debug" then
call BJDebugMsg("debug mode")
endif
endfunction`,
        (errors) => {
            // 字符串常量在 static if 中应该报错（只支持布尔值）
            return errors.errors.some(e => e.message.includes("boolean") || e.message.includes("布尔值") || e.message.includes("constant") || e.message.includes("常量"));
        }
    );

    // 测试 23: 类型兼容性测试
    console.log("\n测试 23: 类型兼容性测试");
    testSemantic(
        "integer 和 real 类型兼容",
        `function test takes real x returns nothing
endfunction
function main takes nothing returns nothing
local integer i = 5
call test(i)
endfunction`,
        (errors) => {
            // integer 可以传递给 real 参数
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "real 和 integer 类型兼容",
        `function test takes integer x returns nothing
endfunction
function main takes nothing returns nothing
local real r = 5.0
call test(r)
endfunction`,
        (errors) => {
            // real 可以传递给 integer 参数
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "子结构可以赋值给父结构",
        `struct Parent
integer x
endstruct
struct Child extends Parent
integer y
endstruct
function test takes Parent p returns nothing
endfunction
function main takes nothing returns nothing
local Child c = Child.create()
call test(c)
endfunction`,
        (errors) => {
            // 子结构可以赋值给父结构
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "结构可以赋值给实现的接口",
        `interface Printable
method toString takes nothing returns string
endinterface
struct MyStruct extends Printable
method toString takes nothing returns string
return "test"
endmethod
endstruct
function test takes Printable p returns nothing
endfunction
function main takes nothing returns nothing
local MyStruct s = MyStruct.create()
call test(s)
endfunction`,
        (errors) => {
            // 结构可以赋值给实现的接口
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "thistype 类型兼容性",
        `struct Node
thistype next
static method create takes nothing returns thistype
local thistype n = thistype.allocate()
return n
endmethod
endstruct`,
        (errors) => {
            // thistype 应该能正确解析
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "类型不兼容应该报错",
        `function test takes integer x returns nothing
endfunction
function main takes nothing returns nothing
local string s = "test"
call test(s)
endfunction`,
        (errors) => {
            // string 不能传递给 integer 参数
            return errors.warnings.some(w => w.message.includes("incompatible") || w.message.includes("不兼容")) ||
                errors.errors.some(e => e.message.includes("incompatible") || e.message.includes("不兼容"));
        }
    );

    // 测试 24: 赋值语句测试
    console.log("\n测试 24: 赋值语句测试");
    testSemantic(
        "常量变量不能被赋值",
        `globals
constant integer MAX_VALUE = 100
endglobals
function test takes nothing returns nothing
set MAX_VALUE = 200
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("常量") && e.message.includes("不能被赋值"));
        }
    );

    testSemantic(
        "只读成员不能被赋值",
        `struct TestStruct
readonly integer value = 10
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
set ts.value = 20
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("只读") && e.message.includes("不能被赋值"));
        }
    );

    testSemantic(
        "只读静态成员不能被赋值",
        `struct TestStruct
readonly static integer count = 0
endstruct
function test takes nothing returns nothing
set TestStruct.count = 10
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("只读") && e.message.includes("不能被赋值"));
        }
    );

    testSemantic(
        "只读成员访问赋值",
        `struct TestStruct
readonly integer value = 10
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
set ts.value = 20
endfunction`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("只读成员") && e.message.includes("不能被赋值"));
        }
    );

    testSemantic(
        "正常变量可以赋值",
        `globals
integer counter = 0
endglobals
function test takes nothing returns nothing
set counter = 10
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "结构成员可以赋值",
        `struct TestStruct
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
set ts.value = 20
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 25: 更多方法调用测试
    console.log("\n测试 25: 更多方法调用测试");
    testSemantic(
        "静态方法调用 - allocate",
        `struct TestStruct
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.allocate()
set ts.value = 10
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "实例方法调用 - destroy",
        `struct TestStruct
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
call ts.destroy()
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "静态方法调用 - destroy",
        `struct TestStruct
integer value
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
call TestStruct.destroy(ts)
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "方法调用参数类型兼容",
        `struct TestStruct
method test takes real x returns nothing
endmethod
endstruct
function main takes nothing returns nothing
local TestStruct ts = TestStruct.create()
local integer i = 5
call ts.test(i)
endfunction`,
        (errors) => {
            // integer 可以传递给 real 参数
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "方法调用返回类型使用",
        `struct TestStruct
static method create takes nothing returns TestStruct
local TestStruct ts = TestStruct.allocate()
return ts
endmethod
endstruct
function test takes nothing returns nothing
local TestStruct ts = TestStruct.create()
endfunction`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 26: 委托检查
    console.log("\n测试 26: 委托检查");
    testSemantic(
        "委托类型必须存在",
        `struct A
integer x
endstruct
struct B
delegate NonExistentStruct deleg
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Delegate type") && e.message.includes("not found"));
        }
    );

    testSemantic(
        "委托类型必须是结构类型",
        `interface I
endinterface
struct A
delegate I deleg
endstruct`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Delegate type") && e.message.includes("must be a struct type"));
        }
    );

    testSemantic(
        "正确的委托声明",
        `struct A
integer x
endstruct
struct B
delegate A deleg
endstruct`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 测试 27: Hook 语句检查
    console.log("\n测试 27: Hook 语句检查");
    testSemantic(
        "钩子函数必须存在",
        `function MyFunction takes nothing returns nothing
endfunction
hook NonExistentFunction NonExistentHookFunction`,
        (errors) => {
            // 被钩住的函数可能是 native 函数，所以这里只检查钩子函数
            return errors.errors.some(e => e.message.includes("Hook function") && e.message.includes("not found")) ||
                   errors.warnings.some(w => w.message.includes("Target function"));
        }
    );

    testSemantic(
        "钩子方法必须存在",
        `struct MyStruct
method myMethod takes nothing returns nothing
endmethod
endstruct
function TargetFunc takes nothing returns nothing
endfunction
hook TargetFunc MyStruct.NonExistentMethod`,
        (errors) => {
            return errors.errors.some(e => e.message.includes("Hook method") && e.message.includes("not found"));
        }
    );

    testSemantic(
        "正确的 Hook 语句（函数）",
        `function TargetFunc takes nothing returns nothing
endfunction
function HookFunc takes nothing returns nothing
endfunction
hook TargetFunc HookFunc`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    testSemantic(
        "正确的 Hook 语句（方法）",
        `struct MyStruct
method myMethod takes nothing returns nothing
endmethod
endstruct
function TargetFunc takes nothing returns nothing
endfunction
hook TargetFunc MyStruct.myMethod`,
        (errors) => {
            return errors.errors.length === 0;
        }
    );

    // 输出测试结果
    console.log("\n========== 测试结果 ==========");
    console.log(`总计: ${totalPassed + totalFailed} 个测试`);
    console.log(`通过: ${totalPassed} 个`);
    console.log(`失败: ${totalFailed} 个`);
    console.log(`成功率: ${totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2) : 0}%`);
    console.log("=============================\n");
}

if (true) {
    testSemanticAnalyzer();
}
