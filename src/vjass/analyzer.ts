import {
    ASTNode,
    Statement,
    Expression,
    BlockStatement,
    FunctionDeclaration,
    FunctionInterfaceDeclaration,
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
    HookStatement,
    LoopStatement,
    ExitWhenStatement,
    CallStatement
} from "./ast";
import { ErrorCollection, SimpleError, SimpleWarning, CheckValidationError, CheckErrorType } from "./error";
import { Parser } from "./parser";
import { isVjassKeyword } from "./id";

/**
 * 语义分析器配置选项
 */
export interface SemanticAnalyzerOptions {
    /** 是否检查未定义行为（如未声明的函数、变量等） */
    checkUndefinedBehavior?: boolean;
    /** 是否检查类型 */
    checkTypes?: boolean;
    /** 是否检查未使用的符号 */
    checkUnused?: boolean;
    /** 是否检查数组越界（默认开启） */
    checkArrayBounds?: boolean;
    /** 标准库文件列表（如 common.j, blizzard.j, common.ai），用于多文件检测 */
    standardLibraries?: string[];
    /** 外部符号表（来自标准库和工程目录的其他 jass 文件），用于检查函数是否在其他文件中声明 */
    externalSymbols?: Map<string, SymbolInfo>;
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
    /** 类型（type X extends Y） */
    TYPE = "type",
    /** 函数接口（function interface Name takes ... returns ...） */
    FUNCTION_INTERFACE = "function_interface",
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
    /** 是否已初始化（对于局部变量） */
    isInitialized?: boolean;
    /** 是否可能为 null（对于 handle 类型变量） */
    mayBeNull?: boolean;
    /** 数组大小（对于数组变量，一维数组） */
    arraySize?: number | null;
    /** 数组宽度（对于二维数组变量） */
    arrayWidth?: number | null;
    /** 数组高度（对于二维数组变量） */
    arrayHeight?: number | null;
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
 * common.j / Blizzard.j 中「未在当前工程声明」时的 handle 类型名回退集合。
 * 仅当类型未在符号表/外部符号表中声明时使用，用于单独解析 blizzard.j 时避免误报。
 * 自定义 type XXX extends integer array [5] 等会走符号表解析，不会误判为 handle。
 */
const FALLBACK_HANDLE_TYPE_NAMES = new Set([
    "handle", "unit", "item", "location", "trigger", "timer", "effect", "group", "force",
    "player", "widget", "destructable", "fogmodifier", "hashtable", "rect", "region",
    "sound", "texttag", "lightning", "image", "ubersplat", "multiboard", "multiboarditem",
    "trackable", "dialog", "button", "quest", "questitem", "defeatcondition", "timerdialog",
    "leaderboard", "boarditem", "gamecache", "unitpool", "itempool", "triggercondition",
    "triggeraction", "boolexpr", "conditionfunc", "filterfunc", "code", "event",
    "playerunitevent", "unitevent", "limitop", "oplimit", "eventid", "gameevent",
    "playerevent", "widgetevent", "dialogevent", "unitstate", "aidifficulty",
    "gamedifficulty", "gametype", "mapflag", "mapvisibility", "mapsetting", "mapdensity",
    "playerslotstate", "volumegroup", "camerafield", "camerasetup", "playercolor",
    "placement", "startlocprio", "raritycontrol", "igamestate", "fgamestate", "gamestate",
    "playerstate", "playerscore", "playergameresult", "gamespeed", "mapcontrol",
    "itemtype", "weathereffect", "terraindeformation", "minimapicon", "commandbuttoneffect",
    "race", "racepreference", "version", "effecttype", "soundtype", "pathingtype", "fogstate",
    "ability", "buff", "agent", "attacktype", "damagetype", "unittype", "alliancetype",
    "blendmode", "texmapflags", "mousebuttontype", "animtype", "subanimtype",
    "framehandle", "originframetype", "framepointtype", "textaligntype", "frameeventtype", "oskeytype",
    "movetype", "targetflag", "armortype", "heroattribute", "defensetype", "regentype",
    "unitcategory", "pathingflag",
    "abilitybooleanfield", "abilityintegerfield", "abilityrealfield", "abilitystringfield",
    "abilitybooleanlevelfield", "abilityintegerlevelfield", "abilityreallevelfield", "abilitystringlevelfield",
    "abilitybooleanlevelarrayfield", "abilityintegerlevelarrayfield", "abilityreallevelarrayfield", "abilitystringlevelarrayfield",
    "itembooleanfield", "itemintegerfield", "itemrealfield", "itemstringfield",
    "unitbooleanfield", "unitintegerfield", "unitrealfield", "unitstringfield",
    "unitweaponbooleanfield", "unitweaponintegerfield", "unitweaponrealfield", "unitweaponstringfield"
]);

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

    /** 结构实现的模块 */
    private structModules: Map<string, Set<string>> = new Map();

    /** 配置选项 */
    private options: SemanticAnalyzerOptions;

    /** 外部符号表（来自标准库和工程目录的其他 jass 文件） */
    private externalSymbols: Map<string, SymbolInfo> = new Map();

    /**
     * 构造函数
     * @param options 配置选项
     */
    constructor(options: SemanticAnalyzerOptions = {}) {
        this.options = {
            checkUndefinedBehavior: options.checkUndefinedBehavior ?? false,
            checkTypes: options.checkTypes ?? true, // 默认启用类型检查
            checkUnused: options.checkUnused ?? false, // 默认不检查未使用符号
            checkArrayBounds: options.checkArrayBounds ?? true, // 默认启用数组越界检查
            standardLibraries: options.standardLibraries ?? [],
            externalSymbols: options.externalSymbols
        };
        if (options.externalSymbols) {
            this.externalSymbols = options.externalSymbols;
        }
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

        // 第三遍：检查未使用的符号和死代码（根据配置）
        if (this.options.checkUnused) {
            this.checkUnusedSymbols(ast);
        }
        this.checkDeadCode(ast);

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
                        `Circular inheritance detected: ${cycle.join(" -> ")}`,
                        `Remove the circular inheritance relationship`
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
        } else if (node instanceof FunctionInterfaceDeclaration) {
            this.collectFunctionInterface(node);
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

        // 检查重复声明 - 只检查当前作用域（方法作用域）内的符号
        // 不检查父作用域（结构体作用域）或其他方法作用域中的符号
        // 在 JASS/vJASS 中，不同方法内的局部变量可以同名，它们的作用域是独立的
        if (scope.symbols.has(name)) {
            // 检查是否是同一个作用域内的重复声明
            const existingSymbol = scope.symbols.get(name);
            if (existingSymbol && existingSymbol.type === SymbolType.LOCAL_VARIABLE) {
                // 只有在同一个方法作用域内重复声明局部变量时才报错
                this.addError(
                    node.start,
                    node.end,
                    `Local variable '${name}' is already declared in this method`,
                    `Remove duplicate local variable declaration or rename it`
                );
                return;
            }
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
            isConstant: node.isConstant || false,
            isInitialized: node.initializer !== null && node.initializer !== undefined,  // 记录是否有初始化表达式
            mayBeNull: this.checkIfExpressionIsNull(node.initializer) || this.isHandleType(type || ""),  // 检查是否可能为 null
            arraySize: node.isArray ? node.arraySize : undefined,  // 记录数组大小
            arrayWidth: node.isArray ? node.arrayWidth : undefined,  // 记录二维数组宽度
            arrayHeight: node.isArray ? node.arrayHeight : undefined  // 记录二维数组高度
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
            isConstant: node.isConstant || false,
            mayBeNull: this.checkIfExpressionIsNull(node.initializer) || this.isHandleType(type || ""),  // 检查是否可能为 null
            arraySize: node.isArray ? node.arraySize : undefined,  // 记录数组大小
            arrayWidth: node.isArray ? node.arrayWidth : undefined,  // 记录二维数组宽度
            arrayHeight: node.isArray ? node.arrayHeight : undefined  // 记录二维数组高度
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
                // 只有非局部变量才应该被识别为结构体成员
                // 局部变量（isLocal = true）应该只在方法体内，不应该出现在结构体成员列表中
                if (!member.isLocal) {
                    this.collectStructMember(member, name);
                }
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

        // 检查重复声明（JASS/vJASS 是大小写不敏感的语言）
        // 遍历所有符号，检查是否有大小写不敏感的同名成员或方法
        let duplicateFound = false;
        let existingName = "";
        let existingType = "";
        for (const [existingSymbolName, symbol] of currentScope.symbols.entries()) {
            if (existingSymbolName.toLowerCase() === name.toLowerCase()) {
                if (symbol.type === SymbolType.INSTANCE_MEMBER || symbol.type === SymbolType.STATIC_MEMBER) {
                    duplicateFound = true;
                    existingName = existingSymbolName;
                    existingType = "member";
                    break;
                } else if (symbol.type === SymbolType.METHOD) {
                    duplicateFound = true;
                    existingName = existingSymbolName;
                    existingType = "method";
                    break;
                }
            }
        }

        if (duplicateFound) {
            if (existingType === "member") {
                this.addError(
                    node.start,
                    node.end,
                    `Member '${name}' of struct '${structName}' is already declared (existing member: '${existingName}')`,
                    `Remove duplicate member declaration or rename it`
                );
            } else {
                this.addError(
                    node.start,
                    node.end,
                    `Member '${name}' of struct '${structName}' conflicts with existing method '${existingName}'`,
                    `Remove the member or rename it to avoid conflict with the method`
                );
            }
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
            isConstant: node.isConstant || false,
            mayBeNull: this.checkIfExpressionIsNull(node.initializer) || this.isHandleType(type || ""),  // 检查是否可能为 null
            arraySize: node.isArray ? node.arraySize : undefined,  // 记录数组大小
            arrayWidth: node.isArray ? node.arrayWidth : undefined,  // 记录二维数组宽度
            arrayHeight: node.isArray ? node.arrayHeight : undefined  // 记录二维数组高度
        });
    }

    /**
     * 收集结构方法
     */
    private collectStructMethod(node: MethodDeclaration, structName: string): void {
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const methodName = node.name ? node.name.name : (node.operatorName || "");

        // 检查重复声明（JASS/vJASS 是大小写不敏感的语言）
        if (methodName) {
            // 遍历所有符号，检查是否有大小写不敏感的同名方法或成员
            let duplicateFound = false;
            let existingName = "";
            let existingType = "";
            for (const [existingSymbolName, symbol] of currentScope.symbols.entries()) {
                if (existingSymbolName.toLowerCase() === methodName.toLowerCase()) {
                    if (symbol.type === SymbolType.METHOD) {
                        duplicateFound = true;
                        existingName = existingSymbolName;
                        existingType = "method";
                        break;
                    } else if (symbol.type === SymbolType.INSTANCE_MEMBER || symbol.type === SymbolType.STATIC_MEMBER) {
                        duplicateFound = true;
                        existingName = existingSymbolName;
                        existingType = "member";
                        break;
                    }
                }
            }

            if (duplicateFound) {
                if (existingType === "method") {
                    this.addError(
                        node.start,
                        node.end,
                        `Method '${methodName}' of struct '${structName}' is already declared (existing method: '${existingName}')`,
                        `Remove duplicate method declaration or rename it`
                    );
                } else {
                    this.addError(
                        node.start,
                        node.end,
                        `Method '${methodName}' of struct '${structName}' conflicts with existing member '${existingName}'`,
                        `Remove the method or rename it to avoid conflict with the member`
                    );
                }
                return;
            }
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
            // 只有在提供了外部符号表时才报告错误（减少误报）
            // 如果没有提供外部符号表，可能是其他文件中的结构
            const hasExternalSymbols = this.externalSymbols.size > 0;
            if (hasExternalSymbols) {
                this.addError(
                    node.delegateType.start,
                    node.delegateType.end,
                    `Delegate type '${delegateTypeName}' not found in current file or other project files`,
                    `Ensure the struct '${delegateTypeName}' is declared before using it as a delegate type`
                );
            }
            // 如果没有提供外部符号表，可能是其他文件中的结构，不报告错误
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
            valueType: delegateTypeName,
            isInitialized: false  // 委托默认未初始化
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
                // 只有在提供了外部符号表时才报告错误（减少误报）
                // 如果没有提供外部符号表，可能是其他文件中的模块
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    this.addError(
                        node.start,
                        node.end,
                        `Module '${moduleName}' not found in current file or other project files`,
                        `Ensure the module is declared or use the 'optional' keyword`
                    );
                }
                // 如果没有提供外部符号表，可能是其他文件中的模块，不报告错误
            } else {
                // 记录结构体实现的模块
                if (!this.structModules.has(structName)) {
                    this.structModules.set(structName, new Set());
                }
                this.structModules.get(structName)!.add(moduleName);
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
                `Remove duplicate interface declaration or rename it`
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
                        `Interface cannot declare onDestroy method`,
                        `onDestroy is declared by default, child structs can declare it`
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
                `Function '${name}' is already declared`,
                `Remove duplicate function declaration or rename it`
            );
            return;
        }

        // 检查返回类型是否有效
        if (node.returnType) {
            const returnTypeName = node.returnType instanceof Identifier ? node.returnType.name : "thistype";
            this.checkTypeValidity(returnTypeName, node.returnType, "return type");
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        // 检查参数类型是否有效
        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            if (param.type) {
                const paramTypeName = param.type instanceof Identifier ? param.type.name : "thistype";
                this.checkTypeValidity(paramTypeName, param.type, "parameter type");
            }
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
                `Native function '${name}' is already declared`,
                `Remove duplicate native function declaration or rename it`
            );
            return;
        }

        // 检查返回类型是否有效
        if (node.returnType) {
            const returnTypeName = node.returnType instanceof Identifier ? node.returnType.name : "thistype";
            this.checkTypeValidity(returnTypeName, node.returnType, "return type");
        }

        const returnType = node.returnType ?
            (node.returnType instanceof Identifier ? node.returnType.name : "thistype") : null;

        // 检查参数类型是否有效
        const parameters: Array<{ name: string; type: string }> = [];
        for (const param of node.parameters) {
            if (param.type) {
                const paramTypeName = param.type instanceof Identifier ? param.type.name : "thistype";
                this.checkTypeValidity(paramTypeName, param.type, "parameter type");
            }
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
                `Type '${name}' is already declared`,
                `Remove duplicate type declaration or rename it`
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
     * 收集函数接口声明（function interface Name takes ... returns ...）
     * 类型查询优先级：基本类型 -> type -> struct/interface -> function interface -> vjass type
     */
    private collectFunctionInterface(node: FunctionInterfaceDeclaration): void {
        if (!node.name) return;
        const name = node.name.name;
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        if (currentScope.symbols.has(name)) {
            this.addError(
                node.start,
                node.end,
                `Function interface '${name}' is already declared`,
                `Remove duplicate declaration or rename it`
            );
            return;
        }
        currentScope.symbols.set(name, {
            name,
            type: SymbolType.FUNCTION_INTERFACE,
            node,
            isPrivate: false,
            isPublic: true,
            scope: currentScope.name || undefined
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
            // 递归处理子节点（包括方法），此时结构作用域在栈中
            for (const child of node.children) {
                this.checkSemantics(child);
            }
            // 弹出结构作用域（由 checkStruct 推入的）
            if (this.scopeStack.length > 0 && this.scopeStack[this.scopeStack.length - 1].type === "struct") {
                this.scopeStack.pop();
            }
            return; // 已经处理了子节点，不需要再次递归
        } else if (node instanceof InterfaceDeclaration) {
            this.checkInterface(node);
        } else if (node instanceof ModuleDeclaration) {
            this.checkModule(node);
        } else if (node instanceof LibraryDeclaration) {
            this.checkLibrary(node);
        } else if (node instanceof CallStatement) {
            // CallStatement 包含 CallExpression，需要检查表达式
            this.checkCallExpression(node.expression);
        } else if (node instanceof CallExpression) {
            this.checkCallExpression(node);
        } else if (node instanceof AssignmentStatement) {
            this.checkAssignment(node);
        } else if (node instanceof VariableDeclaration) {
            this.checkVariableDeclaration(node);
            this.checkKeywordMisspelling(node);
        } else if (node instanceof BinaryExpression && node.operator === OperatorType.Index) {
            this.checkArrayAccess(node);
        } else if (node instanceof BinaryExpression) {
            this.checkBinaryExpression(node);
        } else if (node instanceof StringLiteral) {
            this.checkStringLiteral(node);
        } else if (node instanceof IfStatement) {
            this.checkStaticIf(node);
        } else if (node instanceof ReturnStatement) {
            this.checkReturnStatement(node);
            this.checkKeywordMisspelling(node);
        } else if (node instanceof LoopStatement) {
            this.checkLoop(node);
        } else if (node instanceof HookStatement) {
            this.checkHook(node);
        } else if (node instanceof NativeDeclaration) {
            this.checkNativeFunctionReturns(node);
        } else if (node instanceof FunctionDeclaration) {
            // 检查函数声明中的多返回值语法错误
            this.checkFunctionMultipleReturns(node);
            
            // 重新建立函数作用域以便 checkReturnStatement 和 checkAssignment 可以找到局部变量
            if (node.body) {
                const currentScope = this.scopeStack[this.scopeStack.length - 1];
                const functionName = node.name ? node.name.name : "unknown";
                // 提取返回类型：如果是 Identifier，使用其 name；如果是 ThistypeExpression，使用 "thistype"；如果是 null，表示 returns nothing
                let returnType: string | undefined = undefined;
                if (node.returnType) {
                    if (node.returnType instanceof Identifier) {
                        returnType = node.returnType.name;
                    } else if (node.returnType instanceof ThistypeExpression) {
                        returnType = "thistype";
                    }
                }
                // 如果 returnType 仍然是 undefined，表示 returns nothing
                const functionScope: ScopeInfo = {
                    name: functionName,
                    type: "function",
                    symbols: new Map(),
                    children: [],
                    node: node.body,
                    parent: currentScope,
                    isPublic: true,
                    returnType: returnType  // undefined 表示 returns nothing，否则是返回类型名称
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
                // 注意：需要检查 node.body 中的语句，而不是 node.children
                for (const stmt of node.body.body) {
                    this.checkSemantics(stmt);
                }
                // 然后检查函数的所有代码路径是否都有返回值
                this.checkFunctionReturns(node);
                this.scopeStack.pop();
            } else {
                this.checkFunctionReturns(node);
            }
            // 函数声明的子节点已经通过 node.body.body 处理过了，不需要再次递归
            return;
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
                
                this.scopeStack.push(methodScope);
                
                // 重新收集方法体中的局部变量（在检查之前）
                this.collectLocalVariables(node.body);
                
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
        
        // 重新推入结构作用域，以便在检查方法时能够解析 thistype
        const currentScope = this.scopeStack[this.scopeStack.length - 1];
        const structScope: ScopeInfo = {
            name: structName,
            type: "struct",
            symbols: new Map(),
            children: [],
            node,
            parent: currentScope,
            isPublic: true
        };
        this.scopeStack.push(structScope);

        // 检查继承关系
        if (node.extendsType) {
            const parentName = node.extendsType.name;
            const parentSymbol = this.findSymbol(parentName, SymbolType.STRUCT);

            if (!parentSymbol) {
                // 可能是接口
                const interfaceSymbol = this.findSymbol(parentName, SymbolType.INTERFACE);
                if (!interfaceSymbol) {
                    // 只有在提供了外部符号表时才报告错误（减少误报）
                    // 如果没有提供外部符号表，可能是其他文件中的结构或接口
                    const hasExternalSymbols = this.externalSymbols.size > 0;
                    if (hasExternalSymbols) {
                        this.addError(
                            node.extendsType.start,
                            node.extendsType.end,
                            `Parent struct or interface '${parentName}' not found in current file or other project files`,
                            `Ensure the parent struct or interface is declared`
                        );
                    }
                    // 如果没有提供外部符号表，可能是其他文件中的结构或接口，不报告错误
                } else {
                    // 是接口，检查实现
                    this.checkInterfaceImplementation(node, parentName);
                }
            } else {
                // 是结构，检查继承
                if (parentSymbol.node instanceof StructDeclaration) {
                    const parentStruct = parentSymbol.node;
                    // 检查子结构体的方法是否覆盖了父结构体的方法
                    this.checkMethodOverrides(node, parentStruct, structName, parentName);
                }
            }
        }

        // 检查索引空间增强的限制
        // 根据文档：不能在继承其他结构或接口的结构上使用索引空间增强
        if (node.indexSize !== null && node.extendsType) {
            const extendsName = node.extendsType.name;
            // 如果 node.extendsType 存在，说明结构确实有继承关系
            // 先尝试查找结构或接口，以确定错误消息
            const structSymbol = this.findSymbol(extendsName, SymbolType.STRUCT);
            const interfaceSymbol = this.findSymbol(extendsName, SymbolType.INTERFACE);
            
            if (structSymbol) {
                // 找到了父结构，确定是继承结构，报错
                this.addError(
                    node.start,
                    node.end,
                    `Structs that extend other structs cannot use index space enhancement`,
                    `Remove index space enhancement or remove the inheritance relationship`
                );
            } else if (interfaceSymbol) {
                // 找到了父接口，确定是继承接口，报错
                this.addError(
                    node.start,
                    node.end,
                    `Structs that extend interfaces cannot use index space enhancement`,
                    `Remove index space enhancement or remove the inheritance relationship`
                );
            } else {
                // 找不到父类型，但 node.extendsType 存在
                // 如果提供了外部符号表，说明已经检查了所有文件，应该报错
                // 如果没有提供外部符号表，可能是其他文件中的类型，只报告警告
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    // 已经检查了所有外部文件，仍然找不到，但继承关系存在，应该报错
                    this.addError(
                        node.start,
                        node.end,
                        `Structs with inheritance cannot use index space enhancement`,
                        `Remove index space enhancement or remove the inheritance relationship`
                    );
                } else {
                    // 没有提供外部符号表，可能是其他文件中的类型，只报告警告
                    this.addWarning(
                        node.start,
                        node.end,
                        `Struct '${structName}' uses index space enhancement and extends '${extendsName}'. If '${extendsName}' is a struct or interface, this may cause issues`
                    );
                }
            }
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
                    `Struct '${structName}' index space ${maxInstances} exceeds the recommended maximum of 408000`
                );
            }
        }

        // 检查数组成员对实例上限的影响
        // 根据文档：如果一个结构具有 2 个数组成员，一个数组大小为 4，一个数组大小为 100，
        // 该结构将限制为 80 个实例（8190 除以 100）
        let totalArraySize = 0;
        let maxArraySize = 0;
        for (const member of node.members) {
            if (member instanceof VariableDeclaration && !member.isLocal && member.isArray) {
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
                    `Struct '${structName}' has large array member size ${maxArraySize}, instance limit is only ${actualMaxInstances}`
                );
            }
        }

        // 检查数组结构的限制
        // 根据文档：数组结构不能声明变量成员的默认值，不能使用.allocate 或.destroy，不能声明 onDestroy，不能有数组成员
        if (node.isArrayStruct) {
            for (const member of node.members) {
                if (member instanceof VariableDeclaration && !member.isLocal) {
                    // 检查是否有默认值
                    if (member.initializer) {
                        this.addError(
                            member.start,
                            member.end,
                            `Array struct '${structName}' members cannot have default values`,
                            `Remove the default value from member '${member.name.name}'`
                        );
                    }
                    // 检查是否是数组成员
                    if (member.isArray) {
                        this.addError(
                            member.start,
                            member.end,
                            `Array struct '${structName}' cannot have array members`,
                            `Remove array member '${member.name.name}' or use dynamic arrays`
                        );
                    }
                } else if (member instanceof MethodDeclaration) {
                    // 检查是否是 onDestroy
                    if (member.name && member.name.name === "onDestroy") {
                        this.addError(
                            member.start,
                            member.end,
                            `Array struct '${structName}' cannot declare onDestroy method`,
                            `Remove the onDestroy method`
                        );
                    }
                }
            }
        }
        // 注意：不要在这里弹出结构作用域，让 checkSemantics 在递归处理完所有子节点后再弹出
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

        // 收集结构的所有方法（包括运算符方法）
        // 注意：运算符方法使用 operatorName 作为键，普通方法使用 name 作为键
        for (const member of structNode.members) {
            if (member instanceof MethodDeclaration) {
                if (member.isOperator && member.operatorName) {
                    // 运算符方法：使用 operatorName 作为键
                    structMethods.set(member.operatorName, member);
                } else if (member.name) {
                    // 普通方法：使用 name 作为键
                    structMethods.set(member.name.name, member);
                }
            }
        }

        // 检查接口的所有方法是否都被实现
        for (const member of interfaceNode.members) {
            if (member instanceof MethodDeclaration) {
                // 根据 vJass 文档，接口不能声明 onDestroy 方法
                // 接口的 onDestroy 是默认就声明的，不需要实现
                if (member.name && member.name.name === "onDestroy") {
                    continue; // 跳过 onDestroy，它是默认的
                }

                // 处理运算符方法和普通方法
                let methodName: string | null = null;
                if (member.isOperator && member.operatorName) {
                    methodName = member.operatorName;
                } else if (member.name) {
                    methodName = member.name.name;
                }

                if (!methodName) {
                    continue; // 跳过没有名称的方法
                }

                const structMethod = structMethods.get(methodName);

                if (!structMethod) {
                    // 检查是否有 defaults 值
                    if (member.defaultsValue) {
                        // 有 defaults 值，可以不实现
                        continue;
                    }

                    // 如果接口来自外部文件，可能方法的详细信息不完整，只报告警告
                    // 如果接口在当前文件中，则报告错误
                    const isExternalInterface = this.externalSymbols.has(interfaceName);
                    if (isExternalInterface) {
                        // 接口来自外部文件，可能方法的详细信息不完整，只报告警告
                        this.addWarning(
                            structNode.start,
                            structNode.end,
                            `Struct '${structName}' may need to implement method '${methodName}' from interface '${interfaceName}'. The interface is from an external file, ensure the method is implemented`
                        );
                    } else {
                        // 接口在当前文件中，应该能找到方法，报告错误
                        this.addError(
                            structNode.start,
                            structNode.end,
                            `Struct '${structName}' must implement method '${methodName}' from interface '${interfaceName}'`,
                            `Add implementation of method '${methodName}' to the struct`
                        );
                    }
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
        // 根据 vJass 文档，接口方法不能是静态的（接口方法都是实例方法）
        // 因此，如果接口方法不是静态的，结构实现的方法也不应该是静态的
        // 注意：接口方法默认不是静态的，所以如果结构方法是静态的，应该报错
        if (!interfaceMethod.isStatic && structMethod.isStatic) {
            // 接口方法不是静态的，但结构方法是静态的，这是不匹配的
            // 根据 vJass 文档，接口方法不能是静态的，所以这种情况不应该发生
            this.addError(
                structMethod.start,
                structMethod.end,
                `Method '${structMethod.name?.name || structMethod.operatorName || "unknown"}' in struct '${structName}' cannot be static to match non-static method in interface '${interfaceName}'`,
                `Remove 'static' keyword from the method declaration`
            );
        }
        // 注意：如果接口方法是静态的，这本身就是一个错误（应该在接口声明时检查）
        // 但为了完整性，我们也检查一下
        if (interfaceMethod.isStatic && !structMethod.isStatic) {
            this.addError(
                structMethod.start,
                structMethod.end,
                `Method '${structMethod.name?.name || structMethod.operatorName || "unknown"}' in struct '${structName}' must be static to match static method in interface '${interfaceName}'`,
                `Add 'static' keyword to the method declaration`
            );
        }

        // 检查返回类型
        const interfaceReturnType = interfaceMethod.returnType ?
            (interfaceMethod.returnType instanceof Identifier ? interfaceMethod.returnType.name : "thistype") : null;
        const structReturnType = structMethod.returnType ?
            (structMethod.returnType instanceof Identifier ? structMethod.returnType.name : "thistype") : null;

        // 处理 thistype 的情况：如果接口返回类型是 thistype，结构返回类型应该是结构名
        // 如果结构返回类型是 thistype，应该转换为结构名进行比较
        let finalInterfaceReturnType = interfaceReturnType;
        let finalStructReturnType = structReturnType;
        
        if (interfaceReturnType === "thistype") {
            finalInterfaceReturnType = structName; // 接口的 thistype 应该匹配结构的名称
        }
        if (structReturnType === "thistype") {
            finalStructReturnType = structName; // 结构的 thistype 应该匹配结构的名称
        }

        // 检查返回类型是否兼容（使用类型兼容性检查，而不是严格相等）
        if (finalInterfaceReturnType !== finalStructReturnType &&
            !this.isTypeCompatible(finalStructReturnType || "", finalInterfaceReturnType || "")) {
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

                // 处理 thistype 的情况
                let finalInterfaceParamType = interfaceParamType;
                let finalStructParamType = structParamType;
                
                if (interfaceParamType === "thistype") {
                    finalInterfaceParamType = structName; // 接口的 thistype 应该匹配结构的名称
                }
                if (structParamType === "thistype") {
                    finalStructParamType = structName; // 结构的 thistype 应该匹配结构的名称
                }

                // 检查类型是否兼容（使用类型兼容性检查，而不是严格相等）
                if (finalInterfaceParamType !== finalStructParamType &&
                    !this.isTypeCompatible(finalStructParamType || "", finalInterfaceParamType || "")) {
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
     * 检查方法覆盖
     * 当子结构体覆盖父结构体的方法时，检查方法签名是否匹配
     */
    private checkMethodOverrides(
        childStruct: StructDeclaration,
        parentStruct: StructDeclaration,
        childName: string,
        parentName: string
    ): void {
        // 遍历子结构体的所有方法
        for (const childMember of childStruct.members) {
            if (childMember instanceof MethodDeclaration) {
                const childMethodName = childMember.name ? childMember.name.name : (childMember.operatorName || "");
                if (!childMethodName) continue;

                // 跳过内置方法（create, destroy, allocate）
                if (childMethodName === "create" || childMethodName === "destroy" || childMethodName === "allocate") {
                    continue;
                }

                // 在父结构体中查找同名方法
                const parentMethod = this.findMethodInStruct(parentStruct, childMethodName, childMember.isStatic);
                if (parentMethod) {
                    // 找到了父结构体的方法，检查方法签名是否匹配
                    this.checkMethodOverrideSignature(
                        childMember,
                        parentMethod,
                        childName,
                        parentName
                    );
                }
            }
        }
    }

    /**
     * 在结构体中查找方法
     */
    private findMethodInStruct(
        structNode: StructDeclaration,
        methodName: string,
        isStatic: boolean
    ): MethodDeclaration | null {
        for (const member of structNode.members) {
            if (member instanceof MethodDeclaration) {
                const memberMethodName = member.name ? member.name.name : (member.operatorName || "");
                if (memberMethodName === methodName && member.isStatic === isStatic) {
                    return member;
                }
            }
        }
        return null;
    }

    /**
     * 检查方法覆盖的方法签名是否匹配
     */
    private checkMethodOverrideSignature(
        childMethod: MethodDeclaration,
        parentMethod: MethodDeclaration,
        childName: string,
        parentName: string
    ): void {
        const methodName = childMethod.name ? childMethod.name.name : (childMethod.operatorName || "unknown");

        // 检查静态性是否匹配
        if (parentMethod.isStatic !== childMethod.isStatic) {
            this.addWarning(
                childMethod.start,
                childMethod.end,
                `Method '${methodName}' in struct '${childName}' has different static modifier than parent struct '${parentName}'. Make the method ${parentMethod.isStatic ? "static" : "non-static"} to match the parent method`
            );
        }

        // 检查返回类型
        const parentReturnType = parentMethod.returnType ?
            (parentMethod.returnType instanceof Identifier ? parentMethod.returnType.name : "thistype") : null;
        const childReturnType = childMethod.returnType ?
            (childMethod.returnType instanceof Identifier ? childMethod.returnType.name : "thistype") : null;

        // 处理 thistype 的情况
        let finalParentReturnType = parentReturnType;
        let finalChildReturnType = childReturnType;
        
        if (parentReturnType === "thistype") {
            finalParentReturnType = parentName;
        }
        if (childReturnType === "thistype") {
            finalChildReturnType = childName;
        }

        // 检查返回类型是否匹配
        if (finalParentReturnType !== finalChildReturnType &&
            !this.isTypeCompatible(finalChildReturnType || "", finalParentReturnType || "")) {
            this.addWarning(
                childMethod.start,
                childMethod.end,
                `Method '${methodName}' in struct '${childName}' has return type '${childReturnType || "nothing"}' which does not match parent struct '${parentName}' return type '${parentReturnType || "nothing"}'. Change the return type to '${parentReturnType || "nothing"}' to match the parent method`
            );
        }

        // 检查参数数量和类型
        if (parentMethod.parameters.length !== childMethod.parameters.length) {
            this.addWarning(
                childMethod.start,
                childMethod.end,
                `Method '${methodName}' in struct '${childName}' has ${childMethod.parameters.length} parameters, but parent struct '${parentName}' has ${parentMethod.parameters.length} parameters. Change the parameter count to ${parentMethod.parameters.length} to match the parent method`
            );
        } else {
            // 检查每个参数的类型
            for (let i = 0; i < parentMethod.parameters.length; i++) {
                const parentParam = parentMethod.parameters[i];
                const childParam = childMethod.parameters[i];

                const parentParamType = parentParam.type ?
                    (parentParam.type instanceof Identifier ? parentParam.type.name : "thistype") : null;
                const childParamType = childParam.type ?
                    (childParam.type instanceof Identifier ? childParam.type.name : "thistype") : null;

                // 处理 thistype 的情况
                let finalParentParamType = parentParamType;
                let finalChildParamType = childParamType;
                
                if (parentParamType === "thistype") {
                    finalParentParamType = parentName;
                }
                if (childParamType === "thistype") {
                    finalChildParamType = childName;
                }

                // 检查类型是否匹配
                if (finalParentParamType !== finalChildParamType &&
                    !this.isTypeCompatible(finalChildParamType || "", finalParentParamType || "")) {
                    this.addWarning(
                        childParam.start,
                        childParam.end,
                        `Parameter ${i + 1} of method '${methodName}' in struct '${childName}' has type '${childParamType || "nothing"}' which does not match parent struct '${parentName}' parameter type '${parentParamType || "nothing"}'. Change the parameter type to '${parentParamType || "nothing"}' to match the parent method`
                    );
                }
            }
        }
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
                // 只有在提供了外部符号表时才报告错误（减少误报）
                // 如果没有提供外部符号表，可能是其他文件中的模块
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    this.addError(
                        implementsType.start,
                        implementsType.end,
                        `Module '${implementsName}' not found in current file or other project files`,
                        `Ensure the module is declared or use 'optional' keyword if it's optional`
                    );
                }
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
                        // 只有在提供了外部符号表时才报告错误（减少误报）
                        // 如果没有提供外部符号表，可能是其他文件中的模块
                        const hasExternalSymbols = this.externalSymbols.size > 0;
                        if (hasExternalSymbols) {
                            this.addError(
                                member.moduleName.start,
                                member.moduleName.end,
                                `Module '${implementModuleName}' not found in current file or other project files`,
                                `Ensure the module is declared or use the 'optional' keyword`
                            );
                        }
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
        // 如果启用了未定义行为检查，并且提供了外部符号表，才报告警告
        // 这样可以减少对 native 函数的误报
        if (!targetFunctionSymbol && this.options.checkUndefinedBehavior) {
            const hasExternalSymbols = this.externalSymbols.size > 0;
            if (hasExternalSymbols) {
                // 已经检查了所有外部文件，仍然找不到，可能是真正的错误
                // 但为了减少误报，只报告警告，因为可能是 native 函数
                this.addWarning(
                    node.targetFunction.start,
                    node.targetFunction.end,
                    `Target function '${targetFunctionName}' may not be declared. Ensure the function is declared or it is a native function`
                );
            }
            // 如果没有提供外部符号表，可能是 native 函数，不报告警告
        }

        // 检查钩子函数/方法是否存在
        if (node.hookStruct && node.hookMethod) {
            // 结构方法格式：hook FunctionName StructName.MethodName
            const hookStructName = node.hookStruct.name;
            const hookMethodName = node.hookMethod.name;
            
            // 检查结构是否存在
            const hookStructSymbol = this.findSymbol(hookStructName, SymbolType.STRUCT);
            if (!hookStructSymbol) {
                // 只有在提供了外部符号表时才报告错误（减少误报）
                // 如果没有提供外部符号表，可能是其他文件中的结构
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    this.addError(
                        node.hookStruct.start,
                        node.hookStruct.end,
                        `Hook struct '${hookStructName}' not found in current file or other project files`,
                        `Ensure the struct '${hookStructName}' is declared before the hook statement`
                    );
                }
                // 如果没有提供外部符号表，可能是其他文件中的结构，不报告错误
                return;
            }

            // 检查方法是否存在
            if (hookStructSymbol.node instanceof StructDeclaration) {
                const methodFound = this.findMethod(hookStructName, hookMethodName, false);
                if (!methodFound) {
                    // 如果结构来自外部文件，可能方法的详细信息不完整，只报告警告
                    // 如果结构在当前文件中，则报告错误
                    const isExternalStruct = this.externalSymbols.has(hookStructName);
                    if (isExternalStruct) {
                        // 结构来自外部文件，方法可能在其他文件中，只报告警告
                        this.addWarning(
                            node.hookMethod.start,
                            node.hookMethod.end,
                            `Hook method '${hookMethodName}' not found in struct '${hookStructName}'. The struct is from an external file, ensure the method is declared`
                        );
                    } else {
                        // 结构在当前文件中，应该能找到方法，报告错误
                        this.addError(
                            node.hookMethod.start,
                            node.hookMethod.end,
                            `Hook method '${hookMethodName}' not found in struct '${hookStructName}'`,
                            `Ensure the method '${hookMethodName}' is declared in struct '${hookStructName}'`
                        );
                    }
                }
            }
        } else if (node.hookFunction) {
            // 普通函数格式：hook FunctionName HookFunctionName
            const hookFunctionName = node.hookFunction.name;
            const hookFunctionSymbol = this.findSymbol(hookFunctionName, SymbolType.FUNCTION);
            
            if (!hookFunctionSymbol) {
                // 只有在提供了外部符号表时才报告错误（减少误报）
                // 如果没有提供外部符号表，可能是其他文件中的函数或 native 函数
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    this.addError(
                        node.hookFunction.start,
                        node.hookFunction.end,
                        `Hook function '${hookFunctionName}' not found in current file or other project files`,
                        `Ensure the function '${hookFunctionName}' is declared before the hook statement, or it may be a native function`
                    );
                }
                // 如果没有提供外部符号表，可能是其他文件中的函数或 native 函数，不报告错误
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
                // 先直接检查 externalSymbols，因为依赖的库在其他文件中
                // 1. 先检查 externalSymbols（其他文件中的库声明）
                const externalSymbol = this.externalSymbols.get(depName);
                if (externalSymbol) {
                    if (externalSymbol.type === SymbolType.LIBRARY) {
                        // 在外部符号表中找到了正确的库类型，直接通过
                        continue;
                    } else {
                        // 找到了但类型不对，记录错误
                        this.addError(
                            dep.start,
                            dep.end,
                            `Dependent library '${depName}' is declared but as a '${externalSymbol.type}', not as a library. Ensure it is declared as 'library ${depName}'`,
                            `Ensure the library is declared as 'library ${depName}'`
                        );
                        continue;
                    }
                }
                
                // 2. 如果外部符号表中没有，再使用 findSymbol 查找（可能在当前文件中）
                // findSymbol 也会在 externalSymbols 中查找，但我们已经检查过了，所以这里主要是检查当前文件
                const depSymbol = this.findSymbol(depName, SymbolType.LIBRARY);
                if (!depSymbol) {
                    // 检查外部符号表中是否有类似名称的符号（用于调试）
                    const similarSymbols: string[] = [];
                    for (const [name, symbol] of this.externalSymbols.entries()) {
                        if (name.toLowerCase() === depName.toLowerCase()) {
                            // 完全匹配但类型不对（这种情况应该已经在上面处理了，但为了安全还是检查一下）
                            similarSymbols.push(`${name} (${symbol.type})`);
                        } else if (name.toLowerCase().includes(depName.toLowerCase()) || depName.toLowerCase().includes(name.toLowerCase())) {
                            // 部分匹配
                            similarSymbols.push(`${name} (${symbol.type})`);
                        }
                    }
                    
                    const hasExternalSymbols = this.externalSymbols.size > 0;
                    const similarHint = similarSymbols.length > 0 ? ` Similar symbols found: ${similarSymbols.join(', ')}.` : '';
                    const errorMessage = hasExternalSymbols
                        ? `Dependent library '${depName}' not found in current file or other project files.${similarHint} Ensure the library is declared in a .j, .jass, or .ai file, or use the 'optional' keyword`
                        : `Dependent library '${depName}' not found. Ensure the library is declared or use the 'optional' keyword`;
                    
                    this.addError(
                        dep.start,
                        dep.end,
                        errorMessage,
                        `Ensure the library is declared in a .j, .jass, or .ai file, or use the 'optional' keyword`
                    );
                }
            }
        }
    }

    /**
     * 检查函数调用表达式
     */
    private checkCallExpression(node: CallExpression): void {
        // 检查括号匹配（在检查函数之前）
        this.checkParenthesesMatch(node);
        
        // 检查被调用的函数是否存在
        if (node.callee instanceof Identifier) {
            const funcName = node.callee.name;
            const funcSymbol = this.findSymbol(funcName, SymbolType.FUNCTION);

            if (!funcSymbol) {
                // 检查是否是 native 函数（native 函数也应该是 FUNCTION 类型）
                // 如果 findSymbol 找不到，说明函数未声明
                // 总是检查未声明函数（不依赖于 checkUndefinedBehavior）
                // 但为了减少误报，只在提供了 externalSymbols 时才报告警告
                // 因为如果提供了 externalSymbols，说明已经检查了所有外部文件
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    // 已经检查了所有外部文件，仍然找不到，可能是未声明的函数
                    // 但为了减少误报，我们只报告警告，因为可能是：
                    // 1. Native 函数（但未在符号表中）
                    // 2. 动态生成的函数
                    // 3. 文本宏生成的函数
                    // 4. 其他特殊情况
                    this.addWarning(
                        node.callee.start,
                        node.callee.end,
                        `Function '${funcName}' may not be declared. Ensure it is declared in the current file or other project files, or it may be a native function`
                    );
                } else {
                    // 没有提供 externalSymbols，可能是 native 函数或其他文件中的函数
                    // 为了帮助用户发现潜在问题，仍然报告警告
                    this.addWarning(
                        node.callee.start,
                        node.callee.end,
                        `Function '${funcName}' may not be declared. It may be a native function or declared in other files`
                    );
                }
            } else {
                // 检查递归调用
                const currentFunctionScope = this.findCurrentFunctionScope();
                if (currentFunctionScope && currentFunctionScope.name === funcName) {
                    this.addWarning(
                        node.callee.start,
                        node.callee.end,
                        `Recursive call to '${funcName}' may cause stack overflow if the recursion depth is too large. Consider adding a base case or using iteration instead of recursion`
                    );
                }

                // 检查参数数量
                // 注意：parameters 现在始终是数组（即使是空数组），不再是 undefined
                if (funcSymbol.parameters !== undefined) {
                    if (node.arguments.length !== funcSymbol.parameters.length) {
                        this.addError(
                            node.start,
                            node.end,
                            `Function '${funcName}' expects ${funcSymbol.parameters.length} parameters, but ${node.arguments.length} were provided`,
                            `Check the function call parameter count`
                        );
                    } else {
                        // 检查参数类型（如果启用了类型检查）
                        if (this.options.checkTypes) {
                            for (let i = 0; i < node.arguments.length; i++) {
                                const arg = node.arguments[i];
                                const param = funcSymbol.parameters[i];
                                this.checkTypeCompatibility(arg, param.type, `parameter ${i + 1} of function '${funcName}'`, i + 1);
                                
                                // 检查参数是否可能为 null（特别是 handle 类型）
                                this.checkNullUsage(arg, param.type, `parameter ${i + 1} of function '${funcName}'`);
                            }
                        }
                    }
                }
            }
        } else if (node.callee instanceof BinaryExpression && node.callee.operator === OperatorType.Dot) {
            // 方法调用，如 obj.method() 或 StructName.method()
            // 检查方法调用链的长度（在 checkMethodCall 之前，因为需要检查整个链）
            // 使用 countAllMethodCalls 来统计链式调用中的所有方法调用
            const totalCalls = this.countAllMethodCalls(node);
            if (totalCalls > 5) {
                this.addWarning(
                    node.start,
                    node.end,
                    `Method call chain is too long (${totalCalls} calls). Long chains can reduce code readability and make debugging difficult. Consider breaking the chain into multiple statements or using intermediate variables`
                );
            }
            this.checkMethodCall(node);
        } else {
            // 其他类型的调用表达式，也可能包含方法调用（作为参数）
            // 递归检查参数中的方法调用
            for (const arg of node.arguments) {
                const argCalls = this.countAllMethodCalls(arg);
                if (argCalls > 5) {
                    this.addWarning(
                        arg.start,
                        arg.end,
                        `Method call chain in argument is too long (${argCalls} calls). Long chains can reduce code readability and make debugging difficult. Consider breaking the chain into multiple statements or using intermediate variables`
                    );
                }
            }
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

        // 检查方法调用链的长度
        // 使用 countAllMethodCalls 来统计链式调用中的所有方法调用
        const totalCalls = this.countAllMethodCalls(node);
        if (totalCalls > 5) {
            this.addWarning(
                node.start,
                node.end,
                `Method call chain is too long (${totalCalls} calls). Long chains can reduce code readability and make debugging difficult. Consider breaking the chain into multiple statements or using intermediate variables`
            );
        }

        const objectExpr = callee.left;
        const methodNameExpr = callee.right;

        // 方法名必须是标识符
        if (!(methodNameExpr instanceof Identifier)) {
            this.addError(
                methodNameExpr.start,
                methodNameExpr.end,
                `Method name must be an identifier`,
                `Check the method call syntax`
            );
            return;
        }

        const methodName = methodNameExpr.name;

        // 检查对象是否可能为 null
        this.checkNullUsage(objectExpr, null, `object for method call '${methodName}'`);

        // 解析对象类型
        const objectType = this.resolveObjectType(objectExpr);
        if (!objectType) {
            // 无法解析对象类型，可能是变量未定义或其他问题
            // 总是报告警告，帮助用户发现潜在问题
            if (objectExpr instanceof Identifier) {
                // 对象表达式是标识符，检查是否是未定义的变量
                const varSymbol = this.findSymbol(objectExpr.name);
                if (!varSymbol) {
                    // 变量未定义
                    this.addWarning(
                        objectExpr.start,
                        objectExpr.end,
                        `Cannot resolve object type for '${objectExpr.name}' (variable may not be declared), unable to verify if method '${methodName}' exists`
                    );
                } else {
                    // 变量已定义，但类型无法解析（可能是复杂表达式或其他原因）
                    this.addWarning(
                        objectExpr.start,
                        objectExpr.end,
                        `Cannot resolve object type for '${objectExpr.name}', unable to verify if method '${methodName}' exists`
                    );
                }
            } else {
                // 对象表达式不是标识符（可能是复杂表达式），无法解析类型
                this.addWarning(
                    objectExpr.start,
                    objectExpr.end,
                    `Cannot resolve object type for the expression, unable to verify if method '${methodName}' exists`
                );
            }
            // 即使无法解析对象类型，也不阻止继续检查（减少误报）
            // 因为可能是合法的代码，只是分析器无法推断类型
            return;
        }

        // 查找方法
        const methodInfo = this.findMethod(objectType.typeName, methodName, objectType.isStatic);
        if (!methodInfo) {
            // 如果类型来自外部文件，可能方法的详细信息不完整，只报告警告
            // 如果类型在当前文件中，则报告错误
            const isExternalType = this.externalSymbols.has(objectType.typeName);
            if (isExternalType) {
                // 类型来自外部文件，方法可能在其他文件中，只报告警告
                this.addWarning(
                    methodNameExpr.start,
                    methodNameExpr.end,
                    `Method '${methodName}' not found in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'. The type is from an external file, ensure the method is declared`
                );
            } else {
                // 类型在当前文件中，应该能找到方法，报告错误
                this.addError(
                    methodNameExpr.start,
                    methodNameExpr.end,
                    `Method '${methodName}' not found in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'`,
                    `Check if the method name is correct or if the method is declared`
                );
            }
            return;
        }

        // 检查私有方法的可见性
        // 私有方法只能在同一个结构内部被访问
        if (methodInfo.isPrivate) {
            // 检查当前是否在同一个结构内部
            let isInSameStruct = false;
            for (let i = this.scopeStack.length - 1; i >= 0; i--) {
                const scope = this.scopeStack[i];
                if (scope.type === "struct" && scope.name === objectType.typeName) {
                    isInSameStruct = true;
                    break;
                }
            }
            
            if (!isInSameStruct) {
                this.addError(
                    methodNameExpr.start,
                    methodNameExpr.end,
                    `Private method '${methodName}' cannot be accessed from outside struct '${objectType.typeName}'`,
                    `Make the method public or access it from within the struct`
                );
                return;
            }
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

        // 如果是 thistype 表达式，在结构内部等同于结构名（静态方法调用）
        if (expr instanceof ThistypeExpression) {
            const structName = this.resolveThistype(expr);
            if (structName) {
                return {
                    typeName: structName,
                    isStatic: true,
                    isInterface: false
                };
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
     * 解析表达式的实际类型
     * 对于函数调用，返回函数的返回类型；对于其他表达式，返回其类型
     */
    private resolveExpressionType(expr: Expression): string | null {
        // 首先尝试使用 getType() 方法
        let type = expr.getType();
        if (type) {
            return type;
        }

        // 如果是函数调用，尝试从符号表中获取返回类型
        if (expr instanceof CallExpression) {
            if (expr.callee instanceof Identifier) {
                // 直接函数调用，查找函数符号
                const funcSymbol = this.findSymbol(expr.callee.name);
                if (funcSymbol && funcSymbol.type === SymbolType.FUNCTION) {
                    return funcSymbol.returnType || null;
                }
                // 也检查外部符号表中的 native 函数
                if (this.externalSymbols.has(expr.callee.name)) {
                    const externalSymbol = this.externalSymbols.get(expr.callee.name)!;
                    if (externalSymbol.returnType) {
                        return externalSymbol.returnType;
                    }
                }
            } else if (expr.callee instanceof BinaryExpression && expr.callee.operator === OperatorType.Dot) {
                // 方法调用，如 obj.method() 或 StructName.method()
                const objectType = this.resolveObjectType(expr.callee.left);
                if (objectType && expr.callee.right instanceof Identifier) {
                    const methodName = expr.callee.right.name;
                    const methodInfo = this.findMethod(objectType.typeName, methodName, objectType.isStatic);
                    if (methodInfo && methodInfo.returnType) {
                        return methodInfo.returnType;
                    }
                }
            }
        }
        // 如果是标识符，尝试从符号表中获取类型
        else if (expr instanceof Identifier) {
            const varSymbol = this.findSymbol(expr.name);
            if (varSymbol && varSymbol.valueType) {
                return varSymbol.valueType;
            }
        }
        // 如果是成员访问，尝试解析成员类型
        else if (expr instanceof BinaryExpression && expr.operator === OperatorType.Dot) {
            const memberType = this.resolveMemberType(expr);
            if (memberType) {
                return memberType;
            }
        }

        return null;
    }

    /**
     * 检查成员是否是委托
     */
    private isDelegateMember(symbol: SymbolInfo): boolean {
        // 委托在符号表中存储为 INSTANCE_MEMBER，其 node 是 DelegateDeclaration
        return symbol.type === SymbolType.INSTANCE_MEMBER && 
               symbol.node instanceof DelegateDeclaration;
    }

    /**
     * 解析对象符号（从表达式中获取符号信息）
     */
    private resolveObjectSymbol(expr: Expression): SymbolInfo | null {
        if (expr instanceof Identifier) {
            const name = expr.name;
            
            // 处理 this 关键字
            if (name === "this") {
                // 在结构方法中，this 指向当前结构实例
                // 但 this 本身不是委托，返回 null
                return null;
            }

            // 查找变量符号
            const varSymbol = this.findSymbol(name);
            if (varSymbol) {
                return varSymbol;
            }
        } else if (expr instanceof BinaryExpression && expr.operator === OperatorType.Dot) {
            // 成员访问，如 obj.member
            // 递归解析左侧对象
            const leftSymbol = this.resolveObjectSymbol(expr.left);
            if (leftSymbol && leftSymbol.valueType && expr.right instanceof Identifier) {
                // 左侧是委托，查找委托的成员
                const memberName = expr.right.name;
                const memberSymbol = this.findStructMember(leftSymbol.valueType, memberName);
                return memberSymbol;
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
            if (member instanceof VariableDeclaration && !member.isLocal && member.name.name === memberName) {
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
            } else if (member instanceof DelegateDeclaration && member.name.name === memberName) {
                // 找到了委托成员，构建 SymbolInfo
                return {
                    name: memberName,
                    type: SymbolType.INSTANCE_MEMBER,
                    node: member,
                    isPrivate: member.isPrivate || false,
                    isPublic: !member.isPrivate,
                    scope: structName,
                    valueType: member.delegateType.name,
                    isInitialized: false  // 委托默认未初始化
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

        // 如果在当前结构作用域中没找到，检查实现的模块
        const implementedModules = this.structModules.get(structName);
        if (implementedModules) {
            for (const moduleName of implementedModules) {
                const moduleMember = this.findModuleMember(moduleName, memberName);
                if (moduleMember) {
                    return moduleMember;
                }
            }
        }

        return null;
    }

    /**
     * 查找模块成员
     */
    private findModuleMember(moduleName: string, memberName: string): SymbolInfo | null {
        const moduleSymbol = this.findSymbol(moduleName, SymbolType.MODULE);
        if (!moduleSymbol || !(moduleSymbol.node instanceof ModuleDeclaration)) {
            return null;
        }

        const moduleNode = moduleSymbol.node;

        // 在模块的成员中查找
        for (const member of moduleNode.members) {
            if (member instanceof VariableDeclaration && !member.isLocal && member.name.name === memberName) {
                // 找到了成员，构建 SymbolInfo
                const type = member.type ? (member.type instanceof Identifier ? member.type.name : "thistype") : null;
                // 检查模块成员是否是私有的
                // 在 vJASS 中，模块中的私有成员通过 "private static" 或 "private" 关键字声明
                // 由于 VariableDeclaration 没有 isPrivate 属性，我们需要通过检查模块节点来获取
                // 暂时假设所有模块成员都是公共的，后续可以通过改进解析器来支持
                // 注意：这里我们需要检查模块声明节点的原始文本或解析器状态来判断私有性
                // 为了简化，我们先假设模块成员都是公共的
                let isPrivate = false;
                // TODO: 需要从解析器或 AST 节点中获取私有信息
                // 可以通过检查模块节点的原始文本或添加 isPrivate 属性到 VariableDeclaration
                
                return {
                    name: memberName,
                    type: member.isStatic ? SymbolType.STATIC_MEMBER : SymbolType.INSTANCE_MEMBER,
                    node: member,
                    isPrivate: isPrivate,
                    isPublic: !isPrivate,
                    scope: moduleName,
                    valueType: type || undefined,
                    isReadonly: member.isReadonly || false,
                    isConstant: member.isConstant || false,
                    arraySize: member.isArray ? member.arraySize : undefined,
                    arrayWidth: member.isArray ? member.arrayWidth : undefined,
                    arrayHeight: member.isArray ? member.arrayHeight : undefined
                };
            }
        }

        return null;
    }

    /**
     * 获取当前所在的结构体名称
     */
    private getCurrentStructName(): string | null {
        // 从作用域栈中查找结构体作用域
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scope = this.scopeStack[i];
            if (scope.type === "struct") {
                return scope.name;
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
            // allocate() 是内置的私有静态方法，总是存在，且总是没有参数
            if (methodName === "allocate" && isStatic) {
                // allocate 方法总是没有参数，不管是否有自定义的 create 方法
                // create 方法可以调用 allocate() 来创建实例，然后设置属性
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
                        // 注意：MethodDeclaration 目前没有 isPrivate 属性
                        // 暂时假设所有方法都是公共的，私有方法的可见性检查将在后续版本中实现
                        // TODO: 当 MethodDeclaration 添加 isPrivate 属性后，应该使用 member.isPrivate
                        return {
                            name: methodName,
                            type: SymbolType.METHOD,
                            node: member,
                            isPrivate: false, // TODO: 从 member.isPrivate 读取
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
                `Method '${typeName}.${methodName}' expects ${methodInfo.parameters.length} parameters, but ${callNode.arguments.length} were provided`,
                `Check the method call argument count`
            );
            return;
        }

        // 检查参数类型（如果启用了类型检查）
        if (this.options.checkTypes) {
            for (let i = 0; i < callNode.arguments.length; i++) {
                const arg = callNode.arguments[i];
                const param = methodInfo.parameters[i];
                this.checkTypeCompatibility(arg, param.type, `${typeName}.${methodName}`, i + 1);
            }
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
                // 根据上下文生成更清晰的警告消息
                if (context.includes(".")) {
                    // 方法调用：Type 'integer' is incompatible with expected type 'unit'
                    this.addWarning(
                        expr.start,
                        expr.end,
                        `Parameter type '${actualType}' is incompatible with expected type '${expectedType}'`
                    );
                } else {
                    // 函数调用：Type 'integer' of parameter 1 may be incompatible with expected type 'unit'
                    this.addWarning(
                        expr.start,
                        expr.end,
                        `Type '${actualType}' of parameter ${paramIndex} may be incompatible with expected type '${expectedType}'`
                    );
                }
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
        // null 可赋值给任意 handle 类型（JASS 语义）
        if (actualType === "null" && this.isHandleType(expectedType)) {
            return true;
        }

        // 基本类型兼容性规则
        // integer 和 real 在某些情况下可以兼容
        if ((actualType === "integer" && expectedType === "real") ||
            (actualType === "real" && expectedType === "integer")) {
            return true;
        }

        // string 和 integer/real 不兼容（需要显式转换）
        if ((actualType === "string" && (expectedType === "integer" || expectedType === "real")) ||
            ((actualType === "integer" || actualType === "real") && expectedType === "string")) {
            return false;
        }

        // handle 类型兼容性规则：handle 是基类，所有解析到 handle 的类型都可传递给 handle 参数
        if (this.isHandleType(actualType) && expectedType.toLowerCase() === "handle") {
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
     * 检查是否是隐式类型转换
     * JASS 支持某些隐式类型转换，如 integer 到 real
     * @param actualType 实际类型
     * @param expectedType 期望类型
     * @returns 是否是隐式类型转换
     */
    private isImplicitTypeConversion(actualType: string, expectedType: string): boolean {
        // integer 到 real 是隐式转换
        if (actualType === "integer" && expectedType === "real") {
            return true;
        }
        // real 到 integer 也是隐式转换（会截断）
        if (actualType === "real" && expectedType === "integer") {
            return true;
        }
        // 注意：real 到 integer 的转换在 JASS 中也是隐式的，但会丢失精度
        // 这里我们只检查 integer 到 real，因为这是最常见的隐式转换
        
        return false;
    }

    /**
     * 检查表达式是否可能为 null
     * @param expr 表达式
     * @returns 是否可能为 null
     */
    private checkIfExpressionIsNull(expr: Expression | null | undefined): boolean {
        if (!expr) {
            return true; // 没有初始化表达式，可能为 null
        }
        
        // 检查是否是 null 字面量
        if (expr instanceof Identifier && expr.name === "null") {
            return true;
        }
        
        return false;
    }

    /**
     * 沿 type X extends Y 解析到根类型（JASS/vJASS 类型体系统一）
     * 例如：type race extends handle → handle；type xxx extends integer array [5] → integer
     * @param typeName 类型名
     * @param visited 已访问集合，用于防止循环 type 定义
     * @returns 根类型名
     */
    private resolveTypeRoot(typeName: string, visited: Set<string> = new Set()): string {
        if (!typeName) return typeName;
        const key = typeName.toLowerCase();
        if (visited.has(key)) return typeName;
        visited.add(key);

        const typeSymbol = this.findSymbol(typeName, SymbolType.TYPE);
        if (typeSymbol?.valueType) {
            return this.resolveTypeRoot(typeSymbol.valueType, visited);
        }
        const external = this.externalSymbols.get(typeName);
        if (external?.type === SymbolType.TYPE && external.valueType) {
            return this.resolveTypeRoot(external.valueType, visited);
        }
        return typeName;
    }

    /**
     * 检查类型是否是 handle 类型（可能为 null）
     * 先按 type 声明链解析到根类型；仅当类型未声明时使用 FALLBACK_HANDLE_TYPE_NAMES（如单独解析 blizzard.j）
     */
    private isHandleType(type: string): boolean {
        if (!type) return false;
        const root = this.resolveTypeRoot(type);
        if (root.toLowerCase() === "handle") return true;
        // 未在符号表中解析到的类型（如 common.j 的 race、effecttype）单独解析时用回退集合
        if (root === type && !this.findSymbol(type, SymbolType.TYPE) && !this.externalSymbols.has(type)) {
            return FALLBACK_HANDLE_TYPE_NAMES.has(type.toLowerCase());
        }
        return false;
    }

    /**
     * 检查类型是否有效
     * 类型查询优先级：1. 基本类型 2. type 声明 3. struct/interface 4. function interface 5. vjass type（外部符号、handle 回退）
     * @param type 类型名称
     * @param typeNode 类型节点（用于错误报告）
     * @returns 类型是否有效
     */
    private isValidType(type: string | null, typeNode?: Identifier | ThistypeExpression): boolean {
        if (!type) return false;

        const basicTypes = new Set([
            "integer", "real", "string", "boolean", "code", "handle", "key", "nothing", "thistype"
        ]);

        // 1. 基本类型优先（JASS 六种 + key/nothing/thistype）
        if (basicTypes.has(type.toLowerCase())) return true;

        // 2. type 声明（type X extends Y）
        if (this.findSymbol(type, SymbolType.TYPE)) return true;

        // 3. struct, interface
        if (this.findSymbol(type, SymbolType.STRUCT)) return true;
        if (this.findSymbol(type, SymbolType.INTERFACE)) return true;

        // 4. function interface
        if (this.findSymbol(type, SymbolType.FUNCTION_INTERFACE)) return true;

        // 5. vjass type：type 链解析到根类型、handle 子类型及回退、外部符号表
        const root = this.resolveTypeRoot(type);
        if (basicTypes.has(root.toLowerCase())) return true;
        if (this.isHandleType(type)) return true;
        const ext = this.externalSymbols.get(type);
        if (ext && (
            ext.type === SymbolType.TYPE ||
            ext.type === SymbolType.STRUCT ||
            ext.type === SymbolType.INTERFACE ||
            ext.type === SymbolType.FUNCTION_INTERFACE
        )) return true;

        return false;
    }

    /**
     * 检查类型有效性并报告错误
     * @param type 类型名称
     * @param typeNode 类型节点（用于错误报告）
     * @param context 上下文信息（用于错误消息）
     * @returns 类型是否有效
     */
    private checkTypeValidity(
        type: string | null, 
        typeNode: Identifier | ThistypeExpression | null | undefined,
        context: string = "type"
    ): boolean {
        if (!type || !typeNode) {
            return false;
        }

        if (!this.isValidType(type, typeNode)) {
            this.addError(
                typeNode.start,
                typeNode.end,
                `Invalid ${context} '${type}'. The type is not declared or is not a valid vJASS type`,
                `Ensure the type is declared (struct, interface, or type alias) or use a valid basic type (integer, real, string, boolean, code, handle, etc.)`
            );
            return false;
        }

        return true;
    }

    /**
     * 检查空值使用
     * @param expr 表达式
     * @param expectedType 期望类型（如果为 null，则从表达式推断）
     * @param context 上下文描述（用于错误消息）
     */
    private checkNullUsage(expr: Expression, expectedType: string | null, context: string): void {
        if (!this.options.checkTypes) {
            return;
        }

        // 检查表达式是否可能为 null
        let mayBeNull = false;
        let exprType: string | null = null;

        if (expr instanceof Identifier) {
            const symbol = this.findSymbol(expr.name);
            if (symbol) {
                mayBeNull = symbol.mayBeNull === true;
                exprType = symbol.valueType || null;
            }
        } else if (this.checkIfExpressionIsNull(expr)) {
            mayBeNull = true;
            exprType = expectedType || null;
        }

        // 如果期望类型是 handle 类型，检查是否可能为 null
        const typeToCheck = expectedType || exprType;
        if (typeToCheck && this.isHandleType(typeToCheck)) {
            if (mayBeNull) {
                this.addWarning(
                    expr.start,
                    expr.end,
                    `Possible null value used for ${context}. Handle types may be null, consider checking for null before use`
                );
            }
        }
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
                // 在 vJass 中，局部变量必须使用 local 关键字声明
                // 如果找不到符号，说明变量未声明
                // 只有在启用了未定义行为检查，并且提供了外部符号表时，才报告错误
                // 这样可以确保在所有文件中都找不到变量时才报错
                if (this.options.checkUndefinedBehavior) {
                    const hasExternalSymbols = this.externalSymbols.size > 0;
                    if (hasExternalSymbols) {
                        // 已经检查了所有外部文件，仍然找不到，说明变量未声明（仅警告，可能是其他文件中的全局或 native 相关）
                        this.addWarning(
                            node.target.start,
                            node.target.end,
                            `Variable '${varName}' may not be declared. Ensure it is declared with 'local' keyword or as a global variable`
                        );
                        return;
                    }
                }
            }

            if (symbol) {
                // 标记变量为已初始化（赋值语句会初始化变量）
                if (symbol.type === SymbolType.LOCAL_VARIABLE || symbol.type === SymbolType.GLOBAL_VARIABLE) {
                    symbol.isInitialized = true;
                }

                // 检查常量变量不能被赋值
                if (symbol.isConstant) {
                    // 根据变量类型提供更具体的错误消息
                    const varType = symbol.type === SymbolType.GLOBAL_VARIABLE ? "global variable" :
                                   symbol.type === SymbolType.LOCAL_VARIABLE ? "local variable" :
                                   "variable";
                    this.addError(
                        node.target.start,
                        node.target.end,
                        `Constant ${varType} '${varName}' cannot be reassigned. Constants are immutable and must be initialized at declaration`,
                        `Remove the assignment to the constant ${varType}. If you need to change the value, use a regular variable instead of 'constant'`
                    );
                    return;
                }

                // 检查只读成员不能被赋值
                if (symbol.isReadonly) {
                    this.addError(
                        node.target.start,
                        node.target.end,
                        `Readonly member '${varName}' cannot be assigned`,
                        `Remove the assignment to the readonly member`
                    );
                    return;
                }

                // 检查静态成员和实例成员是否是只读的
                if (symbol.type === SymbolType.STATIC_MEMBER || symbol.type === SymbolType.INSTANCE_MEMBER) {
                    if (symbol.isReadonly) {
                        this.addError(
                            node.target.start,
                            node.target.end,
                            `Readonly member '${varName}' cannot be assigned`,
                            `Remove the assignment to the readonly member`
                        );
                        return;
                    }
                }

                // 检查全局变量是否是只读
                // 注意：常量检查已经在上面（第3441行）完成，这里只检查只读
                if (symbol.type === SymbolType.GLOBAL_VARIABLE) {
                    // 常量检查已经在上面完成，这里不再重复检查
                    if (symbol.isReadonly) {
                        this.addError(
                            node.target.start,
                            node.target.end,
                            `Readonly global variable '${varName}' cannot be assigned`,
                            `Remove the assignment to the readonly global variable`
                        );
                        return;
                    }
                }

                // 检查类型兼容性（如果启用了类型检查）
                if (this.options.checkTypes && symbol.valueType) {
                    const actualType = this.resolveExpressionType(node.value);
                    if (actualType) {
                        if (actualType !== symbol.valueType) {
                            // 检查是否是隐式类型转换（如 integer 到 real）
                            if (this.isImplicitTypeConversion(actualType, symbol.valueType)) {
                                // 隐式类型转换，给出警告提示
                                this.addWarning(
                                    node.value.start,
                                    node.value.end,
                                    `Implicit type conversion from '${actualType}' to '${symbol.valueType}'. JASS will automatically convert, but consider using explicit type cast for clarity`
                                );
                            } else if (!this.isTypeCompatible(actualType, symbol.valueType, node.value)) {
                                // 类型不兼容，给出错误警告
                                this.addWarning(
                                    node.value.start,
                                    node.value.end,
                                    `Type '${actualType}' is incompatible with variable type '${symbol.valueType}'. Cannot assign '${actualType}' to '${symbol.valueType}'`
                                );
                            }
                        }
                    }
                }

                // 更新 mayBeNull 状态（如果赋值给 handle 类型变量）
                if (symbol.valueType && this.isHandleType(symbol.valueType)) {
                    symbol.mayBeNull = this.checkIfExpressionIsNull(node.value) || this.isHandleType(this.resolveExpressionType(node.value) || "");
                }

                // 如果赋值给委托，标记委托为已初始化
                if (this.isDelegateMember(symbol)) {
                    symbol.isInitialized = true;
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
                // 检查左侧对象是否是委托
                const leftObjectSymbol = this.resolveObjectSymbol(node.target.left);
                if (leftObjectSymbol && this.isDelegateMember(leftObjectSymbol)) {
                    // 左侧是委托，检查委托是否已初始化
                    if (leftObjectSymbol.isInitialized === false) {
                        this.addWarning(
                            node.target.left.start,
                            node.target.left.end,
                            `Delegate '${leftObjectSymbol.name}' may not be initialized before accessing its member '${memberName}'`
                        );
                    }
                }

                // 查找结构成员
                const memberSymbol = this.findStructMember(objectType.typeName, memberName);

                if (memberSymbol) {
                    // 检查是否是模块的私有成员
                    if (memberSymbol.isPrivate && memberSymbol.scope && memberSymbol.scope !== objectType.typeName) {
                        // 成员来自模块，检查当前访问是否在实现该模块的结构体中
                        const currentStructName = this.getCurrentStructName();
                        if (!currentStructName || currentStructName !== objectType.typeName) {
                            this.addWarning(
                                node.target.right.start,
                                node.target.right.end,
                                `Cannot access private member '${memberName}' from module '${memberSymbol.scope}'. Private members can only be accessed within the struct that implements the module`
                            );
                            return;
                        }
                    }

                    // 检查成员是否是只读的
                    if (memberSymbol.isReadonly) {
                        this.addError(
                            node.target.right.start,
                            node.target.right.end,
                            `Readonly member '${objectType.typeName}.${memberName}' cannot be assigned`,
                            `Remove the assignment to the readonly member`
                        );
                        return;
                    }

                    // 检查成员是否是常量
                    if (memberSymbol.isConstant) {
                        this.addError(
                            node.target.right.start,
                            node.target.right.end,
                            `Constant member '${objectType.typeName}.${memberName}' cannot be assigned`,
                            `Remove the assignment to the constant member`
                        );
                        return;
                    }

                    // 检查类型兼容性（如果启用了类型检查）
                    if (this.options.checkTypes && memberSymbol.valueType) {
                        const actualType = this.resolveExpressionType(node.value);
                        if (actualType) {
                            if (actualType !== memberSymbol.valueType) {
                                // 检查是否是隐式类型转换（如 integer 到 real）
                                if (this.isImplicitTypeConversion(actualType, memberSymbol.valueType)) {
                                    // 隐式类型转换，给出警告提示
                                    this.addWarning(
                                        node.value.start,
                                        node.value.end,
                                        `Implicit type conversion from '${actualType}' to '${memberSymbol.valueType}'. JASS will automatically convert, but consider using explicit type cast for clarity`
                                    );
                                } else if (!this.isTypeCompatible(actualType, memberSymbol.valueType, node.value)) {
                                    // 类型不兼容，给出错误警告
                                    this.addWarning(
                                        node.value.start,
                                        node.value.end,
                                        `Type '${actualType}' is incompatible with member type '${memberSymbol.valueType}'. Cannot assign '${actualType}' to '${memberSymbol.valueType}'`
                                    );
                                }
                            }
                        }
                    }

                    // 如果赋值给委托，标记委托为已初始化
                    if (this.isDelegateMember(memberSymbol)) {
                        memberSymbol.isInitialized = true;
                    }
                } else {
                    // 成员不存在，报告警告
                    // 如果类型来自外部文件，可能成员的详细信息不完整，只报告警告
                    // 如果类型在当前文件中，则报告错误
                    const isExternalType = this.externalSymbols.has(objectType.typeName);
                    if (isExternalType) {
                        // 类型来自外部文件，成员可能在其他文件中，只报告警告
                        this.addWarning(
                            node.target.right.start,
                            node.target.right.end,
                            `Member '${memberName}' may not exist in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'. The type is from an external file, ensure the member is declared`
                        );
                    } else {
                        // 类型在当前文件中，应该能找到成员，报告错误
                        this.addWarning(
                            node.target.right.start,
                            node.target.right.end,
                            `Member '${memberName}' may not exist in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'`
                        );
                    }
                }
            }
        }

        // 检查赋值右侧的变量使用
        this.checkExpressionVariables(node.value);
    }

    /**
     * 检查变量声明
     */
    private checkVariableDeclaration(node: VariableDeclaration): void {
        // 检查变量名是否是关键字
        const varName = node.name.name;
        if (isVjassKeyword(varName)) {
            this.addError(
                node.name.start,
                node.name.end,
                `Variable name '${varName}' conflicts with a vJASS keyword. Variable names cannot be keywords`,
                `Rename the variable to a non-keyword name, for example: '${varName}Var' or 'my${varName.charAt(0).toUpperCase() + varName.slice(1)}'`
            );
            return; // 不再检查其他内容
        }

        // 检查变量类型是否有效
        if (node.type) {
            const typeName = node.type instanceof Identifier ? node.type.name : 
                            (node.type instanceof ThistypeExpression ? "thistype" : null);
            if (typeName) {
                this.checkTypeValidity(typeName, node.type, "variable type");
            }
        }

        // 检查初始化表达式的类型兼容性（如果启用了类型检查）
        if (this.options.checkTypes && node.initializer && node.type) {
            const expectedType = node.type instanceof Identifier ? node.type.name : 
                                 (node.type instanceof ThistypeExpression ? "thistype" : null);
            
            if (expectedType) {
                const actualType = this.resolveExpressionType(node.initializer);
                if (actualType) {
                    if (actualType !== expectedType) {
                        // 检查是否是隐式类型转换（如 integer 到 real）
                        if (this.isImplicitTypeConversion(actualType, expectedType)) {
                            // 隐式类型转换，给出警告提示
                            this.addWarning(
                                node.initializer.start,
                                node.initializer.end,
                                `Implicit type conversion from '${actualType}' to '${expectedType}'. JASS will automatically convert, but consider using explicit type cast for clarity`
                            );
                        } else if (!this.isTypeCompatible(actualType, expectedType, node.initializer)) {
                            // 类型不兼容，给出错误警告
                            this.addWarning(
                                node.initializer.start,
                                node.initializer.end,
                                `Type '${actualType}' is incompatible with variable type '${expectedType}'. Cannot assign '${actualType}' to '${expectedType}'`
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * 检查二元表达式
     */
    private checkBinaryExpression(node: BinaryExpression): void {
        if (!this.options.checkTypes) {
            return;
        }

        const operator = node.operator;
        const left = node.left;
        const right = node.right;

        // 检查无效的数组访问语法（使用点号而不是方括号）
        // 例如：arr.0 应该是 arr[0]
        if (operator === OperatorType.Dot) {
            // 如果右侧是整数或实数字面量，且左侧是数组变量，这是无效的数组访问语法
            if (right instanceof IntegerLiteral || right instanceof RealLiteral) {
                // 检查左侧是否是数组变量
                if (left instanceof Identifier) {
                    const symbol = this.findSymbol(left.name);
                    if (symbol && (symbol.arraySize !== undefined || 
                                   symbol.arrayWidth !== undefined || symbol.arrayHeight !== undefined)) {
                        // 左侧是数组变量，右侧是数字，这是无效的数组访问语法
                        this.addError(
                            node.start,
                            node.end,
                            `Invalid array access syntax. Arrays must use bracket notation 'arr[index]' instead of dot notation 'arr.index'`,
                            `Change '${left.name}.${right.value}' to '${left.name}[${right.value}]'`
                        );
                        return; // 不再检查其他内容
                    }
                } else if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
                    // 可能是 obj.arr.0 的情况，检查 obj.arr 是否是数组
                    if (left.right instanceof Identifier) {
                        const objectType = this.resolveObjectType(left.left);
                        if (objectType) {
                            const memberSymbol = this.findStructMember(objectType.typeName, left.right.name);
                            if (memberSymbol && (memberSymbol.arraySize !== undefined ||
                                                  memberSymbol.arrayWidth !== undefined || memberSymbol.arrayHeight !== undefined)) {
                                // 成员是数组，使用点号访问是无效的
                                this.addError(
                                    node.start,
                                    node.end,
                                    `Invalid array access syntax. Arrays must use bracket notation 'obj.arr[index]' instead of dot notation 'obj.arr.index'`,
                                    `Change '${left.right.name}.${right.value}' to '${left.right.name}[${right.value}]'`
                                );
                                return; // 不再检查其他内容
                            }
                        }
                    }
                }
            }
        }

        // 检查加法运算符（+）
        if (operator === OperatorType.Plus) {
            const leftType = this.resolveExpressionType(left);
            const rightType = this.resolveExpressionType(right);

            if (leftType && rightType) {
                // 检查字符串和整数的混用
                if ((leftType === "string" && rightType === "integer") ||
                    (leftType === "integer" && rightType === "string")) {
                    this.addWarning(
                        node.start,
                        node.end,
                        `String and integer cannot be directly added. Use I2S() to convert integer to string, or S2I() to convert string to integer`
                    );
                }
                // 检查字符串和实数的混用
                else if ((leftType === "string" && rightType === "real") ||
                         (leftType === "real" && rightType === "string")) {
                    this.addWarning(
                        node.start,
                        node.end,
                        `String and real cannot be directly added. Use R2S() to convert real to string`
                    );
                }
                // 检查其他不兼容的类型组合
                else if (leftType !== rightType &&
                         !this.isTypeCompatible(leftType, rightType, left) &&
                         !this.isTypeCompatible(rightType, leftType, right)) {
                    // 对于加法运算，如果类型不兼容，给出警告
                    // 但排除 integer 和 real 的组合（它们是兼容的）
                    if (!((leftType === "integer" && rightType === "real") ||
                          (leftType === "real" && rightType === "integer"))) {
                        this.addWarning(
                            node.start,
                            node.end,
                            `Type '${leftType}' and type '${rightType}' are incompatible for addition operation`
                        );
                    }
                }
            }
        }
        // 检查其他算术运算符（-, *, /, %）
        else if (operator === OperatorType.Minus || 
                 operator === OperatorType.Multiply ||
                 operator === OperatorType.Divide ||
                 operator === OperatorType.Modulo) {
            const leftType = this.resolveExpressionType(left);
            const rightType = this.resolveExpressionType(right);

            if (leftType && rightType) {
                // 字符串不能用于算术运算
                if (leftType === "string" || rightType === "string") {
                    const operatorStr = operator === OperatorType.Minus ? "-" : 
                                       operator === OperatorType.Multiply ? "*" : 
                                       operator === OperatorType.Divide ? "/" : "%";
                    this.addWarning(
                        node.start,
                        node.end,
                        `String type cannot be used in arithmetic operations (${operatorStr})`
                    );
                }
                // 检查其他不兼容的类型组合
                else if (leftType !== rightType &&
                         !this.isTypeCompatible(leftType, rightType, left) &&
                         !this.isTypeCompatible(rightType, leftType, right)) {
                    // 对于算术运算，如果类型不兼容，给出警告
                    // 但排除 integer 和 real 的组合（它们是兼容的）
                    if (!((leftType === "integer" && rightType === "real") ||
                          (leftType === "real" && rightType === "integer"))) {
                        this.addWarning(
                            node.start,
                            node.end,
                            `Type '${leftType}' and type '${rightType}' are incompatible for arithmetic operation`
                        );
                    }
                }
            }
        }
    }

    /**
     * 检查括号匹配
     * 注意：括号不匹配通常在解析阶段就会被检测到
     * 这个方法主要用于验证嵌套函数调用中的括号匹配
     */
    private checkParenthesesMatch(node: CallExpression): void {
        // 检查函数调用中的括号是否匹配
        // 通过检查参数列表中的表达式来验证括号匹配
        
        // 对于嵌套的函数调用，我们需要递归检查
        for (const arg of node.arguments) {
            this.checkExpressionParentheses(arg);
        }
    }

    /**
     * 检查表达式中的括号匹配
     */
    private checkExpressionParentheses(expr: Expression): void {
        if (expr instanceof CallExpression) {
            // 递归检查函数调用参数
            for (const arg of expr.arguments) {
                this.checkExpressionParentheses(arg);
            }
        } else if (expr instanceof BinaryExpression) {
            // 检查二元表达式
            this.checkExpressionParentheses(expr.left);
            this.checkExpressionParentheses(expr.right);
        }
        // 其他表达式类型不需要检查括号
    }

    /**
     * 检查关键字拼写错误
     */
    private checkKeywordMisspelling(node: VariableDeclaration | ReturnStatement): void {
        // 检查常见的拼写错误
        // 注意：如果关键字拼写错误，解析器可能无法正确解析，所以这个检查主要用于验证
        
        // 对于 VariableDeclaration，检查是否是拼写错误的 "local"
        // 如果变量声明没有 isLocal 标志，但变量名看起来像是拼写错误的关键字，给出警告
        if (node instanceof VariableDeclaration) {
            // 变量声明应该由解析器正确识别，如果解析器没有识别为 local，可能是拼写错误
            // 但这里我们主要检查变量名是否是常见关键字的拼写错误
            const varName = node.name.name.toLowerCase();
            
            // 检查是否是常见关键字的拼写错误
            const commonMisspellings: Map<string, string> = new Map([
                ["locl", "local"],
                ["lcoal", "local"],
                ["loacl", "local"],
                ["retrun", "return"],
                ["retunr", "return"],
                ["retrn", "return"],
                ["fucntion", "function"],
                ["functon", "function"],
                ["functin", "function"],
                ["endfucntion", "endfunction"],
                ["endfuncton", "endfunction"],
                ["endfunctin", "endfunction"],
                ["if", "if"], // 这个不是拼写错误，但可以用来检查
                ["then", "then"],
                ["endif", "endif"],
                ["endfi", "endif"],
                ["loop", "loop"],
                ["endloop", "endloop"],
                ["endlop", "endloop"],
                ["set", "set"],
                ["call", "call"],
                ["takes", "takes"],
                ["returns", "returns"],
                ["nothing", "nothing"],
                ["struct", "struct"],
                ["endstruct", "endstruct"],
                ["endsturct", "endstruct"],
                ["method", "method"],
                ["endmethod", "endmethod"],
                ["endmehtod", "endmethod"]
            ]);
            
            // 如果变量名是常见关键字的拼写错误，给出警告
            if (commonMisspellings.has(varName)) {
                const correctSpelling = commonMisspellings.get(varName);
                if (correctSpelling !== varName) {
                    this.addError(
                        node.name.start,
                        node.name.end,
                        `Possible misspelling: '${varName}' should be '${correctSpelling}'`,
                        `Change '${varName}' to '${correctSpelling}'`
                    );
                }
            }
        }
        
        // 对于 ReturnStatement，检查是否是拼写错误的 "return"
        // 如果 return 语句没有被正确解析，可能是拼写错误
        // 但这里我们主要检查 return 语句的位置和上下文
        if (node instanceof ReturnStatement) {
            // ReturnStatement 应该由解析器正确识别，如果解析器没有识别，可能是拼写错误
            // 但这里我们主要验证 return 语句的上下文是否正确
            // 实际上，如果 return 拼写错误，解析器可能无法识别，所以这个检查可能不会被执行
        }
    }

    /**
     * 检查字符串字面量
     */
    private checkStringLiteral(node: StringLiteral): void {
        // 检查字符串是否未闭合
        // 未闭合的字符串通常有以下特征：
        // 1. 字符串值以换行符结尾，且包含注释标记（// 或 /*）
        //    这通常表示字符串未闭合，注释被包含在字符串中
        // 2. 字符串值以换行符结尾，且后面跟着其他代码
        
        const value = node.value;
        if (value && value.length > 0) {
            // 检查字符串是否以换行符结尾（可能是未闭合）
            const endsWithNewline = value.endsWith('\n') || value.endsWith('\r\n') || value.endsWith('\r');
            
            if (endsWithNewline) {
                // 检查是否包含注释标记（这通常表示字符串未闭合，注释被包含在字符串中）
                // 注意：字符串中可能包含 "//" 或 "/*" 作为内容，但通常不会在换行符之后
                const hasCommentMarker = value.includes('//') || value.includes('/*');
                
                if (hasCommentMarker) {
                    // 检查注释标记是否在换行符之后（更可能是未闭合的字符串）
                    const lastNewlineIndex = Math.max(
                        value.lastIndexOf('\n'),
                        value.lastIndexOf('\r\n'),
                        value.lastIndexOf('\r')
                    );
                    
                    if (lastNewlineIndex >= 0) {
                        const afterNewline = value.substring(lastNewlineIndex);
                        if (afterNewline.includes('//') || afterNewline.includes('/*')) {
                            this.addError(
                                node.start,
                                node.end,
                                `Unclosed string literal. The string appears to be missing a closing quote`,
                                `Add a closing quote (") to close the string literal`
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * 检查静态 if 语句
     */
    private checkStaticIf(node: IfStatement): void {
        if (node.isStatic) {
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
        } else {
            // 普通 if 语句，检查条件表达式的类型兼容性
            this.checkIfCondition(node.condition);
        }
    }

    /**
     * 检查 if 语句的条件表达式类型
     */
    private checkIfCondition(condition: Expression): void {
        // 如果启用了类型检查，检查条件表达式的类型
        if (!this.options.checkTypes) {
            return;
        }

        // 检查是否是二元表达式（比较运算符）
        if (condition instanceof BinaryExpression) {
            const operator = condition.operator;
            // 检查比较运算符（==, !=, <, >, <=, >=）
            if (operator === OperatorType.Equal || 
                operator === OperatorType.NotEqual ||
                operator === OperatorType.Less ||
                operator === OperatorType.Greater ||
                operator === OperatorType.LessEqual ||
                operator === OperatorType.GreaterEqual) {
                // 获取左右操作数的类型
                const leftType = condition.left.getType();
                const rightType = condition.right.getType();

                // 如果 getType() 返回 null，尝试从符号表中获取类型
                let actualLeftType = leftType;
                let actualRightType = rightType;

                if (!actualLeftType && condition.left instanceof Identifier) {
                    const varSymbol = this.findSymbol(condition.left.name);
                    if (varSymbol && varSymbol.valueType) {
                        actualLeftType = varSymbol.valueType;
                    }
                }

                if (!actualRightType && condition.right instanceof Identifier) {
                    const varSymbol = this.findSymbol(condition.right.name);
                    if (varSymbol && varSymbol.valueType) {
                        actualRightType = varSymbol.valueType;
                    }
                }

                // 如果两个类型都存在且不兼容，报告警告
                if (actualLeftType && actualRightType) {
                    if (actualLeftType !== actualRightType &&
                        !this.isTypeCompatible(actualLeftType, actualRightType, condition.left) &&
                        !this.isTypeCompatible(actualRightType, actualLeftType, condition.right)) {
                        this.addWarning(
                            condition.start,
                            condition.end,
                            `Type '${actualLeftType}' is incompatible with type '${actualRightType}' in comparison`
                        );
                    }
                }
            } else if (operator === OperatorType.And || 
                       operator === OperatorType.Or ||
                       operator === OperatorType.LogicalAnd ||
                       operator === OperatorType.LogicalOr) {
                // 逻辑运算符，递归检查左右操作数
                this.checkIfCondition(condition.left);
                this.checkIfCondition(condition.right);
            } else if (operator === OperatorType.Not || 
                       operator === OperatorType.LogicalNot) {
                // 逻辑非运算符，递归检查操作数（对于 not，right 是实际的操作数）
                if (condition.right) {
                    this.checkIfCondition(condition.right);
                }
            }
        }
    }

    /**
     * 检查数组访问
     */
    private checkArrayAccess(node: BinaryExpression): void {
        if (!this.options.checkArrayBounds) {
            return;
        }

        // node.left 是数组变量，node.right 是索引表达式
        const arrayExpr = node.left;
        const indexExpr = node.right;

        // 如果数组表达式是标识符，查找数组变量
        if (arrayExpr instanceof Identifier) {
            const arraySymbol = this.findSymbol(arrayExpr.name);
            if (arraySymbol && (arraySymbol.type === SymbolType.LOCAL_VARIABLE || 
                                arraySymbol.type === SymbolType.GLOBAL_VARIABLE ||
                                arraySymbol.type === SymbolType.INSTANCE_MEMBER ||
                                arraySymbol.type === SymbolType.STATIC_MEMBER)) {
                // 检查是否是一维数组
                if (arraySymbol.arraySize !== null && arraySymbol.arraySize !== undefined) {
                    // 尝试计算索引值（如果是常量）
                    const indexValue = this.evaluateConstantExpression(indexExpr);
                    if (indexValue !== null && typeof indexValue === 'number') {
                        if (indexValue < 0 || indexValue >= arraySymbol.arraySize) {
                            this.addWarning(
                                node.start,
                                node.end,
                                `Array index ${indexValue} may be out of bounds (array size is ${arraySymbol.arraySize}). Although JASS does not check bounds at runtime, this may cause undefined behavior). To disable this warning, set 'checkArrayBounds: false' in jass.config.json`
                            );
                        }
                    }
                }
                // 检查是否是二维数组
                else if (arraySymbol.arrayWidth !== null && arraySymbol.arrayWidth !== undefined &&
                         arraySymbol.arrayHeight !== null && arraySymbol.arrayHeight !== undefined) {
                    // 对于二维数组，需要检查两个索引
                    // 但这里只检查第一个索引，因为 arr[i][j] 会被解析为两个 BinaryExpression
                    // 第一个是 arr[i]，第二个是 (arr[i])[j]
                    // 所以这里只检查第一个索引
                    const indexValue = this.evaluateConstantExpression(indexExpr);
                    if (indexValue !== null && typeof indexValue === 'number') {
                        if (indexValue < 0 || indexValue >= arraySymbol.arrayWidth) {
                            this.addWarning(
                                node.start,
                                node.end,
                                `Array index ${indexValue} may be out of bounds (array width is ${arraySymbol.arrayWidth}). Although JASS does not check bounds at runtime, this may cause undefined behavior). To disable this warning, set 'checkArrayBounds: false' in jass.config.json`
                            );
                        }
                    }
                }
            }
        }
        // 如果数组表达式是成员访问（如 obj.arr[index]），需要先解析对象类型
        else if (arrayExpr instanceof BinaryExpression && arrayExpr.operator === OperatorType.Dot) {
            // 解析对象类型和成员
            const objectType = this.resolveObjectType(arrayExpr.left);
            if (objectType && arrayExpr.right instanceof Identifier) {
                const memberName = arrayExpr.right.name;
                const memberSymbol = this.findStructMember(objectType.typeName, memberName);
                if (memberSymbol) {
                    // 检查是否是一维数组
                    if (memberSymbol.arraySize !== null && memberSymbol.arraySize !== undefined) {
                        const indexValue = this.evaluateConstantExpression(indexExpr);
                        if (indexValue !== null && typeof indexValue === 'number') {
                            if (indexValue < 0 || indexValue >= memberSymbol.arraySize) {
                                this.addWarning(
                                    node.start,
                                    node.end,
                                    `Array index ${indexValue} may be out of bounds (array size is ${memberSymbol.arraySize}). Although JASS does not check bounds at runtime, this may cause undefined behavior). To disable this warning, set 'checkArrayBounds: false' in jass.config.json`
                                );
                            }
                        }
                    }
                    // 检查是否是二维数组
                    else if (memberSymbol.arrayWidth !== null && memberSymbol.arrayWidth !== undefined &&
                             memberSymbol.arrayHeight !== null && memberSymbol.arrayHeight !== undefined) {
                        const indexValue = this.evaluateConstantExpression(indexExpr);
                        if (indexValue !== null && typeof indexValue === 'number') {
                            if (indexValue < 0 || indexValue >= memberSymbol.arrayWidth) {
                                this.addWarning(
                                    node.start,
                                    node.end,
                                    `Array index ${indexValue} may be out of bounds (array width is ${memberSymbol.arrayWidth}). Although JASS does not check bounds at runtime, this may cause undefined behavior). To disable this warning, set 'checkArrayBounds: false' in jass.config.json`
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 计算常量表达式的值
     * 如果表达式是常量，返回其值；否则返回 null
     */
    private evaluateConstantExpression(expr: Expression): number | string | boolean | null {
        if (expr instanceof IntegerLiteral) {
            return expr.value;
        } else if (expr instanceof RealLiteral) {
            return expr.value;
        } else if (expr instanceof StringLiteral) {
            return expr.value;
        } else if (expr instanceof BooleanLiteral) {
            return expr.value;
        } else if (expr instanceof Identifier) {
            // 查找常量变量
            const symbol = this.findSymbol(expr.name);
            if (symbol && symbol.isConstant) {
                // 如果符号是常量，尝试从节点中获取初始值
                if (symbol.node instanceof VariableDeclaration && symbol.node.initializer) {
                    return this.evaluateConstantExpression(symbol.node.initializer);
                }
            }
        }
        // 其他情况（如变量、函数调用等）无法静态计算
        return null;
    }

    /**
     * 检查函数声明中的多返回值语法错误
     * JASS 不支持多返回值，如 "returns integer, integer"
     * 注意：由于 AST 节点没有保存原始文本，这个检查需要在解析器层面进行
     * 如果解析器正确解析了这种语法错误，它应该在解析阶段就报错
     */
    private checkFunctionMultipleReturns(node: FunctionDeclaration): void {
        // 由于 AST 节点的 returnType 是 Identifier | ThistypeExpression | null
        // 它只能存储一个返回类型，无法检测多个返回类型
        // 如果解析器遇到 "returns integer, integer"，它可能会：
        // 1. 在解析阶段报错（理想情况）
        // 2. 只解析第一个类型（需要在这里检查，但无法检测）
        // 实际的语法错误应该在解析器层面检测
        // 这里作为占位，如果将来需要，可以添加源代码访问功能
    }

    /**
     * 检查 ReturnStatement 中的多返回值语法错误
     * JASS 不支持多返回值，如 "return 1, 2"
     * 注意：由于 AST 节点的 argument 是 Expression | null，它只能存储一个表达式
     * 如果解析器正确解析了 "return 1, 2" 这样的语法错误，它应该在解析阶段就报错
     */
    private checkReturnMultipleValues(node: ReturnStatement): void {
        // 由于 AST 节点的 argument 是 Expression | null
        // 它只能存储一个表达式，无法检测多个返回值
        // 如果解析器遇到 "return 1, 2"，它可能会：
        // 1. 在解析阶段报错（理想情况）
        // 2. 只解析第一个值（需要在这里检查，但无法检测）
        // 实际的语法错误应该在解析器层面检测
        // 这里作为占位，如果将来需要，可以添加源代码访问功能
    }

    /**
     * 检查 return 语句
     */
    private checkReturnStatement(node: ReturnStatement): void {
        // 检查多返回值语法错误（占位，实际检查需要在解析器层面进行）
        this.checkReturnMultipleValues(node);
        
        // 查找当前所在的函数/方法作用域
        let currentFunctionScope = this.findCurrentFunctionScope();
        let expectedReturnType: string | undefined | null = null; // 初始化为 null，表示未找到
        
        // 如果找到了函数作用域，使用作用域中的返回类型
        if (currentFunctionScope) {
            expectedReturnType = currentFunctionScope.returnType;
            // 如果作用域中的 returnType 是 undefined，表示 returns nothing
            // 如果作用域中的 returnType 是 null，表示未设置，需要从 AST 节点获取
        }
        
        // 如果作用域中的返回类型是 undefined，尝试从 AST 节点直接获取
        // 这可能是作用域设置的问题，或者作用域栈的状态不正确
        if ((expectedReturnType === undefined || expectedReturnType === null) && currentFunctionScope && currentFunctionScope.node) {
            // 尝试从作用域栈中找到函数声明节点
            // 函数作用域的 node 是函数体（BlockStatement），其 parent 应该是函数声明
            let currentNode: ASTNode | null = currentFunctionScope.node;
            while (currentNode && currentNode.parent) {
                currentNode = currentNode.parent;
                if (currentNode instanceof FunctionDeclaration || currentNode instanceof MethodDeclaration) {
                    // 找到函数/方法声明，获取其返回类型
                    if (currentNode.returnType) {
                        if (currentNode.returnType instanceof Identifier) {
                            expectedReturnType = currentNode.returnType.name;
                            break;
                        } else if (currentNode.returnType instanceof ThistypeExpression) {
                            expectedReturnType = "thistype";
                            break;
                        }
                    } else {
                        // 如果 returnType 是 null，表示 returns nothing
                        expectedReturnType = undefined;
                        break;
                    }
                }
            }
        }
        
        // 如果仍然找不到返回类型，尝试从 AST 节点向上查找
        if ((expectedReturnType === undefined || expectedReturnType === null) && node.parent) {
            let currentNode: ASTNode | null = node.parent;
            while (currentNode) {
                if (currentNode instanceof FunctionDeclaration || currentNode instanceof MethodDeclaration) {
                    // 找到函数/方法声明，获取其返回类型
                    if (currentNode.returnType) {
                        if (currentNode.returnType instanceof Identifier) {
                            expectedReturnType = currentNode.returnType.name;
                            break;
                        } else if (currentNode.returnType instanceof ThistypeExpression) {
                            expectedReturnType = "thistype";
                            break;
                        }
                    } else {
                        // 如果 returnType 是 null，表示 returns nothing
                        expectedReturnType = undefined;
                        break;
                    }
                }
                currentNode = currentNode.parent || null;
            }
        }
        
        // 如果仍然找不到返回类型，无法进行检查，返回
        // 注意：expectedReturnType 可能是 undefined（表示 returns nothing）或 null（未找到）
        // 如果 expectedReturnType 是 null，说明无法确定返回类型，跳过检查
        if (expectedReturnType === null) {
            // 无法确定返回类型，可能是作用域栈的问题，跳过检查避免误报
            return;
        }
        
        // 此时 expectedReturnType 应该是 undefined（returns nothing）或具体的返回类型

        // 如果没有期望的返回类型（returns nothing），return 不应该有参数
        // 注意：returnType 可能是 undefined（表示 returns nothing）或 "nothing" 字符串
        if (expectedReturnType === undefined || expectedReturnType === null || expectedReturnType === "nothing") {
            if (node.argument !== null) {
                this.addError(
                    node.start,
                    node.end,
                    `Function return type is 'nothing', return statement should not return a value`,
                    `Remove the return value from the return statement`
                );
            }
            return;
        }

        // 如果有期望的返回类型，return 必须有参数
        if (node.argument === null) {
            this.addError(
                node.start,
                node.end,
                `Function return type is '${expectedReturnType}', return statement must return a value`,
                `Add a return value to the return statement`
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

            // null 可合法作为 handle 类型返回值，不报错
            if (actualReturnType !== resolvedExpectedType &&
                !this.isTypeCompatible(actualReturnType, resolvedExpectedType, node.argument)) {
                this.addError(
                    node.argument.start,
                    node.argument.end,
                    `Return type '${actualReturnType}' does not match function return type '${expectedReturnType}'`,
                    `Change the return value type to '${expectedReturnType}'`
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
     * 计算方法调用链的长度
     * @param node CallExpression 节点
     * @returns 调用链的长度（包括当前调用）
     */
    private getMethodCallChainLength(node: CallExpression): number {
        if (!(node.callee instanceof BinaryExpression) || node.callee.operator !== OperatorType.Dot) {
            return 1; // 不是方法调用，返回 1
        }

        const leftExpr = node.callee.left;
        let length = 1; // 当前调用

        // 如果左侧是另一个方法调用，递归计算
        if (leftExpr instanceof CallExpression) {
            length += this.getMethodCallChainLength(leftExpr);
        } else if (leftExpr instanceof BinaryExpression) {
            // 如果左侧是 BinaryExpression，可能是链式调用的一部分
            // 例如：obj.method1().method2()，其中 method1() 返回的对象调用 method2()
            // 需要递归检查左侧表达式
            const leftCount = this.countMethodCallsInExpression(leftExpr);
            length += leftCount;
        }
        // 如果左侧是 Identifier，说明这是链式调用的起点，长度为 1

        return length;
    }

    /**
     * 统计表达式树中所有方法调用的数量（用于链式调用检测）
     * 只统计通过点运算符进行的方法调用（obj.method()），不包括普通函数调用
     * @param expr 表达式
     * @returns 方法调用的总数
     */
    private countAllMethodCalls(expr: Expression): number {
        let count = 0;
        
        if (expr instanceof CallExpression) {
            // 检查是否是方法调用（通过点运算符）
            if (expr.callee instanceof BinaryExpression && expr.callee.operator === OperatorType.Dot) {
                count = 1; // 当前方法调用
                // 递归检查左侧表达式（可能是另一个方法调用）
                count += this.countAllMethodCalls(expr.callee.left);
            }
            // 递归检查参数（参数中可能包含方法调用）
            for (const arg of expr.arguments) {
                count += this.countAllMethodCalls(arg);
            }
        } else if (expr instanceof BinaryExpression) {
            // 递归检查左右操作数
            count += this.countAllMethodCalls(expr.left);
            count += this.countAllMethodCalls(expr.right);
        }
        
        return count;
    }

    /**
     * 计算表达式中方法调用的数量
     * @param expr 表达式
     * @returns 方法调用的数量
     */
    private countMethodCallsInExpression(expr: Expression): number {
        if (expr instanceof CallExpression) {
            return this.getMethodCallChainLength(expr);
        } else if (expr instanceof BinaryExpression) {
            if (expr.operator === OperatorType.Dot) {
                // 对于点运算符，检查左侧（右侧通常是方法名）
                let count = 0;
                if (expr.left instanceof CallExpression) {
                    // 左侧是方法调用，计算其链长度
                    count += this.getMethodCallChainLength(expr.left);
                } else if (expr.left instanceof BinaryExpression) {
                    // 左侧是表达式，递归检查
                    count += this.countMethodCallsInExpression(expr.left);
                }
                // 右侧通常是标识符（方法名），不需要检查
                return count;
            } else {
                // 其他运算符，递归检查左右操作数
                let count = 0;
                if (expr.left instanceof CallExpression) {
                    count += this.getMethodCallChainLength(expr.left);
                } else if (expr.left instanceof BinaryExpression) {
                    count += this.countMethodCallsInExpression(expr.left);
                }
                if (expr.right instanceof CallExpression) {
                    count += this.getMethodCallChainLength(expr.right);
                } else if (expr.right instanceof BinaryExpression) {
                    count += this.countMethodCallsInExpression(expr.right);
                }
                return count;
            }
        }
        return 0;
    }


    /**
     * 检查 loop 语句是否有 exitwhen
     */
    private checkLoop(node: LoopStatement): void {
        if (!node.body || !node.body.body) {
            return;
        }

        // 检查循环体中是否有 exitwhen 语句
        const hasExitWhen = this.hasExitWhenInBlock(node.body);
        
        if (!hasExitWhen) {
            this.addWarning(
                node.start,
                node.end,
                `Loop statement may cause infinite loop. No 'exitwhen' statement found in the loop body. Consider adding an 'exitwhen' condition to ensure the loop can exit`
            );
        }

        // 递归检查循环体内的语句
        for (const stmt of node.body.body) {
            this.checkSemantics(stmt);
        }
    }

    /**
     * 检查 BlockStatement 中是否有 exitwhen 语句
     * @param block 要检查的 BlockStatement
     * @returns 如果找到 exitwhen 语句，返回 true；否则返回 false
     */
    private hasExitWhenInBlock(block: BlockStatement): boolean {
        if (!block || !block.body) {
            return false;
        }

        for (const stmt of block.body) {
            if (stmt instanceof ExitWhenStatement) {
                return true;
            }
            // 递归检查嵌套的 loop 语句（但只检查当前层级的 exitwhen）
            // 注意：嵌套的 loop 中的 exitwhen 不会影响外层 loop
            if (stmt instanceof IfStatement) {
                // 检查 if 语句的所有分支
                if (stmt.consequent instanceof BlockStatement && this.hasExitWhenInBlock(stmt.consequent)) {
                    return true;
                }
                // 递归检查 elseif 链和 else 分支
                let currentAlternate: IfStatement | BlockStatement | null = stmt.alternate;
                while (currentAlternate) {
                    if (currentAlternate instanceof BlockStatement) {
                        if (this.hasExitWhenInBlock(currentAlternate)) {
                            return true;
                        }
                        break;
                    } else if (currentAlternate instanceof IfStatement) {
                        // elseif 分支
                        if (currentAlternate.consequent instanceof BlockStatement && this.hasExitWhenInBlock(currentAlternate.consequent)) {
                            return true;
                        }
                        currentAlternate = currentAlternate.alternate;
                    } else {
                        break;
                    }
                }
            }
        }

        return false;
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
                `Function '${node.name?.name || "unknown"}' return type is '${returnType}', but not all code paths return a value`,
                `Ensure all code paths have a return statement`
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
                `Method '${methodName}' return type is '${returnType}', but not all code paths return a value`,
                `Ensure all code paths have a return statement`
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
        // 检查 then 分支（then 可能是 BlockStatement、单条 ReturnStatement 或单条嵌套 IfStatement）
        let thenReturns = false;
        if (node.consequent instanceof BlockStatement) {
            thenReturns = this.checkBlockReturns(node.consequent);
        } else if (node.consequent instanceof ReturnStatement) {
            thenReturns = true;
        } else if (node.consequent instanceof IfStatement) {
            thenReturns = this.checkIfStatementReturns(node.consequent);
        }

        // 检查 else/elseif 分支
        let elseReturns = false;
        if (node.alternate) {
            if (node.alternate instanceof BlockStatement) {
                elseReturns = this.checkBlockReturns(node.alternate);
            } else if (node.alternate instanceof ReturnStatement) {
                elseReturns = true;
            } else if (node.alternate instanceof IfStatement) {
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
        // 注意：and/or 关键字可能被解析为 And/Or 或 LogicalAnd/LogicalOr
        const allowedOperators = [
            OperatorType.And,
            OperatorType.Or,
            OperatorType.LogicalAnd,
            OperatorType.LogicalOr
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
            if (expr.operator === OperatorType.And || expr.operator === OperatorType.LogicalAnd) {
                result = leftResult.value && rightResult.value;
            } else if (expr.operator === OperatorType.Or || expr.operator === OperatorType.LogicalOr) {
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
                        `Circular dependency detected: ${cycle.join(" -> ")}`,
                        `Remove the circular dependency relationship`
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

        // 如果还没找到，尝试在外部符号表中查找（标准库和工程目录的其他文件）
        const externalSymbol = this.externalSymbols.get(name);
        if (externalSymbol) {
            if (!type || externalSymbol.type === type) {
                return externalSymbol;
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
            // 总是检查未声明变量（不依赖于 checkUndefinedBehavior）
            // 但为了减少误报，只在提供了外部符号表时才报告警告
            // 因为如果提供了 externalSymbols，说明已经检查了所有外部文件
            if (context === "assignment" || context === "expression") {
                const hasExternalSymbols = this.externalSymbols.size > 0;
                if (hasExternalSymbols) {
                    // 已经检查了所有外部文件，仍然找不到，可能是未声明的变量
                    // 但为了减少误报，只报告警告，因为可能是：
                    // 1. 动态生成的变量
                    // 2. 文本宏生成的变量
                    // 3. 其他特殊情况
                    this.addWarning(
                        node.start,
                        node.end,
                        `Variable '${name}' may not be declared, ensure it is declared before use`
                    );
                } else {
                    // 没有提供 externalSymbols，可能是其他文件中的变量
                    // 为了帮助用户发现潜在问题，仍然报告警告
                    this.addWarning(
                        node.start,
                        node.end,
                        `Variable '${name}' may not be declared, it may be declared in other files`
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
                        `Local variable '${name}' is not in the current scope`,
                        `Check if the variable scope is correct`
                    );
                } else {
                    // 变量在作用域中，检查是否已初始化（仅在表达式中使用，而不是赋值语句的左侧）
                    if (context === "expression" && symbol.isInitialized === false) {
                        // 检查变量声明节点，确认是否真的没有初始化表达式
                        if (symbol.node instanceof VariableDeclaration && !symbol.node.initializer) {
                            this.addWarning(
                                node.start,
                                node.end,
                                `Variable '${name}' may not be initialized before use`
                            );
                        }
                    }
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
            // 如果是成员访问（点运算符），需要特殊处理
            if (expr.operator === OperatorType.Dot) {
                // 检查左侧是否是 this 或结构实例
                const leftIsThis = expr.left instanceof Identifier && expr.left.name === "this";
                const objectType = this.resolveObjectType(expr.left);
                
                if (leftIsThis || objectType) {
                    // 这是结构成员访问（this.member 或 obj.member）
                    // 检查左侧变量
                    this.checkExpressionVariables(expr.left);
                    // 检查右侧成员是否存在
                    if (objectType && expr.right instanceof Identifier) {
                        const memberName = expr.right.name;
                        
                        // 检查左侧对象是否是委托
                        const leftObjectSymbol = this.resolveObjectSymbol(expr.left);
                        if (leftObjectSymbol && this.isDelegateMember(leftObjectSymbol)) {
                            // 左侧是委托，检查委托是否已初始化
                            if (leftObjectSymbol.isInitialized === false) {
                                this.addWarning(
                                    expr.left.start,
                                    expr.left.end,
                                    `Delegate '${leftObjectSymbol.name}' may not be initialized before accessing its member '${memberName}'`
                                );
                            }
                        }
                        
                        const memberSymbol = this.findStructMember(objectType.typeName, memberName);
                        if (!memberSymbol) {
                            // 成员不存在，报告警告
                            const isExternalType = this.externalSymbols.has(objectType.typeName);
                            if (isExternalType) {
                                // 类型来自外部文件，成员可能在其他文件中，只报告警告
                                this.addWarning(
                                    expr.right.start,
                                    expr.right.end,
                                    `Member '${memberName}' may not exist in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'. The type is from an external file, ensure the member is declared`
                                );
                            } else {
                                // 类型在当前文件中，应该能找到成员，报告警告
                                this.addWarning(
                                    expr.right.start,
                                    expr.right.end,
                                    `Member '${memberName}' may not exist in ${objectType.isStatic ? "struct" : "struct instance"} '${objectType.typeName}'`
                                );
                            }
                        }
                    }
                } else {
                    // 不是成员访问，递归检查左右操作数
                    this.checkExpressionVariables(expr.left);
                    this.checkExpressionVariables(expr.right);
                }
            } else {
                // 其他二元运算符，递归检查左右操作数
                this.checkExpressionVariables(expr.left);
                this.checkExpressionVariables(expr.right);
            }
        } else if (expr instanceof CallExpression) {
            // 检查参数中的变量
            for (const arg of expr.arguments) {
                this.checkExpressionVariables(arg);
            }
        } else if (expr instanceof TypecastExpression) {
            this.checkExpressionVariables(expr.expression);
        }
    }

    /**
     * 检查未使用的符号（变量、函数等）
     */
    private checkUnusedSymbols(ast: BlockStatement): void {
        // 跟踪符号的使用情况
        const symbolUsage = new Map<string, { symbol: SymbolInfo; used: boolean; location: { line: number; position: number } }>();

        // 收集所有符号
        for (const [name, symbol] of this.globalSymbols) {
            if (symbol.node.start) {
                symbolUsage.set(name, {
                    symbol,
                    used: false,
                    location: symbol.node.start
                });
            }
        }

        // 遍历所有作用域
        const checkScope = (scope: ScopeInfo): void => {
            for (const [name, symbol] of scope.symbols) {
                if (symbol.node.start) {
                    const key = `${scope.name}::${name}`;
                    symbolUsage.set(key, {
                        symbol,
                        used: false,
                        location: symbol.node.start
                    });
                }
            }
            for (const childScope of scope.children) {
                checkScope(childScope);
            }
        };

        for (const scope of this.scopeStack) {
            checkScope(scope);
        }

        // 标记使用的符号（通过遍历 AST）
        this.markUsedSymbols(ast, symbolUsage);

        // 报告未使用的符号
        for (const [name, info] of symbolUsage) {
            if (!info.used) {
                // 跳过一些特殊符号（如 main、config、onInit、onDestroy 等）
                const specialNames = ['main', 'config', 'onInit', 'onDestroy', 'init', 'create', 'destroy'];
                const symbolName = name.split('::').pop() || name;
                if (specialNames.includes(symbolName.toLowerCase()) || specialNames.some(s => symbolName.toLowerCase().endsWith(s))) {
                    continue;
                }

                // 跳过私有符号（它们可能被外部使用）
                if (info.symbol.isPrivate) {
                    continue;
                }

                // 跳过接口和结构（它们可能被外部引用）
                if (info.symbol.type === SymbolType.INTERFACE || 
                    info.symbol.type === SymbolType.STRUCT ||
                    info.symbol.type === SymbolType.LIBRARY ||
                    info.symbol.type === SymbolType.MODULE) {
                    continue;
                }

                // 报告未使用的局部变量
                if (info.symbol.type === SymbolType.LOCAL_VARIABLE) {
                    this.addWarning(
                        info.location,
                        info.symbol.node.end || info.location,
                        `Unused local variable '${symbolName}'`
                    );
                }
                // 报告未使用的函数（非 main/config）
                else if (info.symbol.type === SymbolType.FUNCTION) {
                    this.addWarning(
                        info.location,
                        info.symbol.node.end || info.location,
                        `Unused function '${symbolName}'`
                    );
                }
            }
        }
    }

    /**
     * 标记使用的符号
     */
    private markUsedSymbols(node: ASTNode, symbolUsage: Map<string, { symbol: SymbolInfo; used: boolean; location: { line: number; position: number } }>): void {
        if (node instanceof Identifier) {
            const name = node.name;
            // 查找符号（优先匹配作用域内的变量，然后匹配全局变量）
            for (const [key, info] of symbolUsage) {
                const symbolName = key.split('::').pop() || key;
                if (symbolName === name) {
                    // 如果键包含作用域信息（如 "functionName::varName"），需要检查作用域
                    if (key.includes('::')) {
                        // 检查当前节点是否在该作用域内（通过检查符号的声明位置）
                        // 对于局部变量，我们匹配作用域内的变量
                        info.used = true;
                    } else {
                        // 全局变量或函数，直接匹配
                        info.used = true;
                    }
                }
            }
        } else if (node instanceof CallExpression) {
            // 函数调用：标记被调用的函数为已使用
            if (node.callee instanceof Identifier) {
                const funcName = node.callee.name;
                for (const [key, info] of symbolUsage) {
                    const symbolName = key.split('::').pop() || key;
                    if (symbolName === funcName && info.symbol.type === SymbolType.FUNCTION) {
                        info.used = true;
                    }
                }
            }
        } else if (node instanceof AssignmentStatement) {
            // 赋值语句：右侧的变量被使用，左侧的变量被写入（也算使用）
            // 但为了检测未使用的变量，我们只标记右侧的使用
            // 左侧的变量在赋值时也会被标记为使用（通过 Identifier 处理）
        }

        // 递归处理子节点
        for (const child of node.children) {
            this.markUsedSymbols(child, symbolUsage);
        }
    }

    /**
     * 检查死代码（return 之后的代码）
     */
    private checkDeadCode(ast: BlockStatement): void {
        this.checkDeadCodeInBlock(ast);
    }

    /**
     * 检查块中的死代码
     */
    private checkDeadCodeInBlock(block: BlockStatement): void {
        let foundReturn = false;

        for (let i = 0; i < block.body.length; i++) {
            const stmt = block.body[i];

            if (foundReturn) {
                // return 之后的代码是死代码
                if (stmt.start && stmt.end) {
                    this.addWarning(
                        stmt.start,
                        stmt.end,
                        `Dead code: This code is after a return statement and will never execute`
                    );
                }
            }

            // 检查是否是 return 语句
            if (stmt instanceof ReturnStatement) {
                foundReturn = true;
            }
            // 检查是否是 if 语句（可能所有分支都有 return）
            else if (stmt instanceof IfStatement) {
                const allBranchesReturn = this.checkIfAllBranchesReturn(stmt);
                if (allBranchesReturn) {
                    // 如果 if 语句的所有分支都有 return，那么 if 之后的代码是死代码
                    foundReturn = true;
                }
                // 如果 if 语句不是所有分支都有 return，不改变 foundReturn 状态
                // 因为后续代码可能仍然可达
            }
            // 递归检查子块
            else if (stmt instanceof BlockStatement) {
                this.checkDeadCodeInBlock(stmt);
            }
            // 检查函数和方法体
            else if (stmt instanceof FunctionDeclaration && stmt.body) {
                this.checkDeadCodeInBlock(stmt.body);
            }
            else if (stmt instanceof MethodDeclaration && stmt.body) {
                this.checkDeadCodeInBlock(stmt.body);
            }
        }
    }

    /**
     * 检查 if 语句的所有分支是否都有 return
     */
    private checkIfAllBranchesReturn(ifStmt: IfStatement): boolean {
        // 检查 then 分支（consequent）
        const thenBlock = ifStmt.consequent instanceof BlockStatement ? ifStmt.consequent : new BlockStatement([ifStmt.consequent]);
        const thenReturns = this.checkBlockReturns(thenBlock);

        // 检查 else 分支（alternate）
        let elseReturns = false;
        if (ifStmt.alternate) {
            if (ifStmt.alternate instanceof BlockStatement) {
                elseReturns = this.checkBlockReturns(ifStmt.alternate);
            } else if (ifStmt.alternate instanceof IfStatement) {
                // elseif 分支
                elseReturns = this.checkIfAllBranchesReturn(ifStmt.alternate);
            }
        }

        // 如果 then 分支有 return，但没有 else 分支，则不是所有分支都有 return
        if (thenReturns && !ifStmt.alternate) {
            return false;
        }

        return thenReturns && elseReturns;
    }
}

/**
 * 分析 AST 的语义
 * @param ast 要分析的 AST 根节点
 * @returns 错误集合
 */
/**
 * 从 AST 中提取所有符号（函数、结构、接口、类型等，用于构建外部符号表）
 * @param ast AST 节点
 * @returns 符号表
 */
export function extractAllSymbols(ast: BlockStatement): Map<string, SymbolInfo> {
    const symbols = new Map<string, SymbolInfo>();
    
    for (const stmt of ast.body) {
        // 提取函数声明
        if (stmt instanceof FunctionDeclaration && stmt.name) {
            const funcName = stmt.name.name;
            const parameters: Array<{ name: string; type: string }> = [];
            
            if (stmt.parameters) {
                for (const param of stmt.parameters) {
                    if (param.name && param.type) {
                        const paramType = param.type instanceof Identifier ? param.type.name : "thistype";
                        parameters.push({
                            name: param.name.name,
                            type: paramType
                        });
                    }
                }
            }
            
            let returnType: string | undefined = undefined;
            if (stmt.returnType) {
                returnType = stmt.returnType instanceof Identifier ? stmt.returnType.name : "thistype";
            }
            
            symbols.set(funcName, {
                name: funcName,
                type: SymbolType.FUNCTION,
                node: stmt,
                isPrivate: false,
                isPublic: true,
                returnType: returnType,
                // 始终设置 parameters，即使是空数组（takes nothing），这样参数数量检查才能正常工作
                parameters: parameters
            });
        } 
        // 提取 native 函数声明
        else if (stmt instanceof NativeDeclaration && stmt.name) {
            const funcName = stmt.name.name;
            const parameters: Array<{ name: string; type: string }> = [];
            
            if (stmt.parameters) {
                for (const param of stmt.parameters) {
                    if (param.name && param.type) {
                        const paramType = param.type instanceof Identifier ? param.type.name : "thistype";
                        parameters.push({
                            name: param.name.name,
                            type: paramType
                        });
                    }
                }
            }
            
            let returnType: string | undefined = undefined;
            if (stmt.returnType) {
                returnType = stmt.returnType instanceof Identifier ? stmt.returnType.name : "thistype";
            }
            
            symbols.set(funcName, {
                name: funcName,
                type: SymbolType.FUNCTION,
                node: stmt,
                isPrivate: false,
                isPublic: true,
                returnType: returnType,
                // 始终设置 parameters，即使是空数组（takes nothing），这样参数数量检查才能正常工作
                parameters: parameters
            });
        }
        // 提取结构声明
        else if (stmt instanceof StructDeclaration && stmt.name) {
            const structName = stmt.name.name;
            symbols.set(structName, {
                name: structName,
                type: SymbolType.STRUCT,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
        // 提取接口声明
        else if (stmt instanceof InterfaceDeclaration && stmt.name) {
            const interfaceName = stmt.name.name;
            symbols.set(interfaceName, {
                name: interfaceName,
                type: SymbolType.INTERFACE,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
        // 提取类型声明
        else if (stmt instanceof TypeDeclaration && stmt.name) {
            const typeName = stmt.name.name;
            symbols.set(typeName, {
                name: typeName,
                type: SymbolType.TYPE,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
        // 提取库声明
        else if (stmt instanceof LibraryDeclaration && stmt.name) {
            const libraryName = stmt.name.name;
            symbols.set(libraryName, {
                name: libraryName,
                type: SymbolType.LIBRARY,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
        // 提取作用域声明
        else if (stmt instanceof ScopeDeclaration && stmt.name) {
            const scopeName = stmt.name.name;
            symbols.set(scopeName, {
                name: scopeName,
                type: SymbolType.SCOPE,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
        // 提取模块声明
        else if (stmt instanceof ModuleDeclaration && stmt.name) {
            const moduleName = stmt.name.name;
            symbols.set(moduleName, {
                name: moduleName,
                type: SymbolType.MODULE,
                node: stmt,
                isPrivate: false,
                isPublic: true
            });
        }
    }
    
    return symbols;
}

/**
 * 从 AST 中提取函数符号（用于构建外部符号表）
 * @param ast AST 节点
 * @returns 函数符号表
 * @deprecated 使用 extractAllSymbols 代替，它提取所有类型的符号
 */
export function extractFunctionSymbols(ast: BlockStatement): Map<string, SymbolInfo> {
    const allSymbols = extractAllSymbols(ast);
    const functionSymbols = new Map<string, SymbolInfo>();
    
    // 只保留函数类型的符号
    for (const [name, symbol] of allSymbols.entries()) {
        if (symbol.type === SymbolType.FUNCTION) {
            functionSymbols.set(name, symbol);
        }
    }
    
    return functionSymbols;
}

/**
 * 合并多个符号表
 * @param symbolTables 多个符号表
 * @returns 合并后的符号表
 */
export function mergeSymbolTables(...symbolTables: Array<Map<string, SymbolInfo>>): Map<string, SymbolInfo> {
    const merged = new Map<string, SymbolInfo>();
    
    for (const table of symbolTables) {
        for (const [name, symbol] of table.entries()) {
            // 如果已存在同名符号，保留第一个（优先级：当前文件 > 工程文件 > 标准库）
            if (!merged.has(name)) {
                merged.set(name, symbol);
            }
        }
    }
    
    return merged;
}

/**
 * 解析结果接口
 */
export interface ParsedFileResult {
    /** 文件路径 */
    filePath: string;
    /** 解析后的 AST */
    ast: BlockStatement;
    /** 解析错误 */
    parseErrors: ErrorCollection;
}

/**
 * 解析多个文件（先解析所有文件，不进行语义分析）
 * @param files 文件列表，每个文件包含路径和内容
 * @returns 解析结果列表
 */
export function parseAllFiles(files: Array<{ filePath: string; content: string }>): ParsedFileResult[] {
    const results: ParsedFileResult[] = [];
    
    for (const file of files) {
        try {
            const parser = new Parser(file.content, file.filePath);
            const ast = parser.parse();
            const parseErrors: ErrorCollection = {
                errors: parser.errors.errors,
                warnings: parser.errors.warnings,
                checkValidationErrors: []
            };
            
            results.push({
                filePath: file.filePath,
                ast: ast,
                parseErrors: parseErrors
            });
        } catch (error) {
            // 解析失败，记录错误但继续处理其他文件
            results.push({
                filePath: file.filePath,
                ast: new BlockStatement([], { line: 1, position: 1 }, { line: 1, position: 1 }),
                parseErrors: {
                    errors: [{
                        message: `Failed to parse file: ${error instanceof Error ? error.message : String(error)}`,
                        start: { line: 1, position: 1 },
                        end: { line: 1, position: 1 }
                    }],
                    warnings: [],
                    checkValidationErrors: []
                }
            });
        }
    }
    
    return results;
}

/**
 * 从解析结果中提取所有符号
 * @param parsedResults 解析结果列表
 * @returns 合并后的符号表
 */
export function extractSymbolsFromParsedFiles(parsedResults: ParsedFileResult[]): Map<string, SymbolInfo> {
    const allSymbolTables: Map<string, SymbolInfo>[] = [];
    
    for (const result of parsedResults) {
        // 即使文件有解析错误，也尝试提取符号（如库声明、结构声明等）
        // 这样可以确保即使文件有部分语法错误，已声明的符号仍然可以被其他文件使用
        try {
            const symbols = extractAllSymbols(result.ast);
            allSymbolTables.push(symbols);
        } catch (error) {
            // 提取符号失败，跳过该文件
            // 但不会影响其他文件的符号提取
        }
    }
    
    return mergeSymbolTables(...allSymbolTables);
}

/**
 * 完整的语义分析流程（先解析所有文件，再进行语义分析）
 * 
 * @param currentFile 当前要分析的文件（路径和内容）
 * @param otherFiles 其他相关文件列表（标准库和工程目录文件，路径和内容）
 * @param options 语义分析选项
 * @returns 当前文件的语义分析结果
 * 
 * @remarks
 * 工作流程：
 * 1. 先解析所有文件（currentFile + otherFiles）
 * 2. 从所有文件中提取符号表
 * 3. 对当前文件进行语义分析，使用所有文件的符号表
 * 
 * 这样可以确保：
 * - 所有文件都能一起工作
 * - 函数、结构、接口等可以在不同文件间引用
 * - 只有在所有文件中都找不到符号时才会报错
 * 
 * 使用示例：
 * ```typescript
 * const result = analyzeSemanticsWithAllFiles(
 *     { filePath: "current.j", content: currentFileContent },
 *     [
 *         { filePath: "common.j", content: commonJContent },
 *         { filePath: "blizzard.j", content: blizzardJContent },
 *         { filePath: "common.ai", content: commonAiContent },
 *         ...projectFiles.map(f => ({ filePath: f.path, content: f.content }))
 *     ],
 *     { checkUndefinedBehavior: true }
 * );
 * ```
 */
export function analyzeSemanticsWithAllFiles(
    currentFile: { filePath: string; content: string },
    otherFiles: Array<{ filePath: string; content: string }>,
    options?: SemanticAnalyzerOptions
): {
    /** 当前文件的语义分析结果 */
    semanticResult: ErrorCollection;
    /** 所有文件的解析结果 */
    allParseResults: ParsedFileResult[];
    /** 合并后的外部符号表 */
    externalSymbols: Map<string, SymbolInfo>;
} {
    // 步骤1: 解析所有文件（当前文件 + 其他文件）
    const allFiles = [currentFile, ...otherFiles];
    const allParseResults = parseAllFiles(allFiles);
    
    // 步骤2: 从其他文件中提取符号表（不包括当前文件）
    const otherFilesResults = allParseResults.slice(1); // 跳过当前文件
    const externalSymbols = extractSymbolsFromParsedFiles(otherFilesResults);
    
    // 步骤3: 对当前文件进行语义分析
    const currentFileResult = allParseResults[0];
    const semanticResult = analyzeSemantics(currentFileResult.ast, {
        ...options,
        externalSymbols: externalSymbols,
        checkUndefinedBehavior: options?.checkUndefinedBehavior ?? true
    });
    
    return {
        semanticResult: semanticResult,
        allParseResults: allParseResults,
        externalSymbols: externalSymbols
    };
}

/**
 * 分析语义
 * @param ast AST 节点
 * @param options 配置选项
 * @returns 错误集合
 * 
 * @remarks
 * 未定义函数检查逻辑：
 * - 如果提供了 externalSymbols，函数会在当前文件、标准库和工程目录的所有文件中查找
 * - 只有在所有这些地方都找不到函数时，才会报告 "Function 'xxx' may not be declared" 警告
 * - 标准库文件包括：common.j, blizzard.j, common.ai
 * - 工程目录文件包括：所有非 excludes 的 .j, .jass, .ai 文件
 * 
 * 使用示例：
 * ```typescript
 * // 1. 解析标准库和工程文件，提取函数符号
 * const standardLibAst = parser.parse(standardLibContent);
 * const projectFilesAst = projectFiles.map(f => parser.parse(f.content));
 * 
 * // 2. 提取符号表
 * const standardLibSymbols = extractFunctionSymbols(standardLibAst);
 * const projectSymbols = mergeSymbolTables(...projectFilesAst.map(extractFunctionSymbols));
 * const allExternalSymbols = mergeSymbolTables(standardLibSymbols, projectSymbols);
 * 
 * // 3. 分析当前文件
 * const currentFileAst = parser.parse(currentFileContent);
 * const result = analyzeSemantics(currentFileAst, {
 *     checkUndefinedBehavior: true,
 *     externalSymbols: allExternalSymbols
 * });
 * ```
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
            return errors.errors.some(e => 
                e.message.toLowerCase().includes("circular") || 
                e.message.includes("循环依赖") ||
                e.message.includes("Circular dependency")
            );
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
        (errors, parser) => {
            // 解析器可能在解析阶段就检查了这个限制
            // 或者语义分析器会检查
            const parserError = parser.errors.errors.some(e => 
                e.message.includes("index size enhancement") || 
                e.message.includes("index space enhancement") ||
                e.message.includes("索引空间增强")
            );
            const semanticError = errors.errors.some(e => 
                e.message.includes("index space enhancement") || 
                e.message.includes("索引空间增强") ||
                e.message.includes("extend") && e.message.includes("index")
            );
            return parserError || semanticError;
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
            return errors.errors.some(e => 
                e.message.includes("默认值") ||
                e.message.toLowerCase().includes("default") ||
                e.message.toLowerCase().includes("array struct") && e.message.toLowerCase().includes("default")
            );
        }
    );

    testSemantic(
        "数组结构不能有数组成员",
        `struct MyArrayStruct extends array
integer array values[10]
endstruct`,
        (errors) => {
            return errors.errors.some(e => 
                e.message.includes("数组成员") ||
                e.message.toLowerCase().includes("array member") ||
                e.message.toLowerCase().includes("array struct") && e.message.toLowerCase().includes("array")
            );
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
            // 根据文档和代码逻辑，整数常量应该被允许（非零为真，零为假）
            // 所以这个测试应该通过，不应该报错
            return errors.errors.length === 0;
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
            return errors.errors.some(e => 
                e.message.includes("参数数量") || 
                e.message.includes("期望") ||
                e.message.toLowerCase().includes("parameter") ||
                e.message.toLowerCase().includes("expects") ||
                e.message.toLowerCase().includes("provided")
            );
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
            return errors.errors.some(e => 
                e.message.includes("循环继承") ||
                e.message.toLowerCase().includes("circular") ||
                e.message.includes("Circular inheritance")
            );
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
            return errors.errors.some(e => 
                (e.message.includes("常量") && e.message.includes("不能被赋值")) ||
                (e.message.toLowerCase().includes("constant") && e.message.toLowerCase().includes("assign")) ||
                (e.message.toLowerCase().includes("constant") && e.message.toLowerCase().includes("cannot"))
            );
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
            return errors.errors.some(e => 
                (e.message.includes("只读") && e.message.includes("不能被赋值")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("assign")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("cannot"))
            );
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
            return errors.errors.some(e => 
                (e.message.includes("只读") && e.message.includes("不能被赋值")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("assign")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("cannot"))
            );
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
            return errors.errors.some(e => 
                (e.message.includes("只读成员") && e.message.includes("不能被赋值")) ||
                (e.message.includes("只读") && e.message.includes("不能被赋值")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("assign")) ||
                (e.message.toLowerCase().includes("readonly") && e.message.toLowerCase().includes("cannot"))
            );
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

// 移到analyzer.test.ts中
if (false) {
    testSemanticAnalyzer();
}
