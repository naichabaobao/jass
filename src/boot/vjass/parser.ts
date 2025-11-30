import { Lexer, Token, TokenType, type IToken, type ILexer } from "./lexer";
import { ErrorCollection, SimpleError, SimpleWarning } from "./simple-error";
import { Position } from "./ast";
import {
    BlockStatement,
    Statement,
    Expression,
    VariableDeclaration,
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
    Identifier,
    SuperExpression,
    ThistypeExpression,
    BinaryExpression,
    CallExpression,
    FunctionExpression,
    TypecastExpression,
    IntegerLiteral,
    RealLiteral,
    StringLiteral,
    BooleanLiteral,
    NullLiteral,
    OperatorType
} from "./vjass-ast";
import { TextMacroExpander } from "./text-macro-expander";


/**
 * 语法分析器
 */
export class Parser {
    private readonly lexer!: ILexer;
    public filePath: string = "";
    private readonly textMacroExpander?: TextMacroExpander;

    public errors: ErrorCollection = {
        errors: [],
        warnings: [],
        checkValidationErrors: []
    };

    // 用于跟踪已声明的标识符（用于检测重复声明）
    private declaredIdentifiers: Map<string, { type: string, location: { line: number, position: number } }> = new Map();

    /**
     * 检查标识符是否已声明（用于检测重复声明）
     * @param identifier 标识符名称
     * @param type 声明类型（如 "struct", "interface", "function" 等）
     * @param location 当前位置
     * @returns 如果已声明，返回 true；否则返回 false 并记录声明
     */
    private checkDuplicateDeclaration(identifier: string, type: string, location: { line: number, position: number }): boolean {
        const key = identifier.toLowerCase();
        const existing = this.declaredIdentifiers.get(key);
        if (existing) {
            this.error(
                `Duplicate declaration: '${identifier}' is already declared as ${existing.type} at line ${existing.location.line + 1}.`,
                location,
                location,
                `Rename this ${type} or remove the duplicate declaration.`
            );
            return true;
        }
        this.declaredIdentifiers.set(key, { type, location });
        return false;
    }

    constructor(content: string, filePath: string = "", textMacroExpander?: TextMacroExpander) {
        this.lexer = new Lexer(content);
        this.filePath = filePath;
        this.textMacroExpander = textMacroExpander;
    }

    /**
     * 解析源代码内容
     * @param content 需要解析的源代码字符串
     * @returns 解析后的结果对象
     */
    public parse(): BlockStatement {
        // 初始化：获取第一个 token
        this.lexer.next();
        
        const statements: Statement[] = [];
        const startPos = this.lexer.current()?.start || { line: 0, position: 0 };
        
        // 解析所有顶级语句
        while (!this.isAtEnd()) {
            // 检查是否是文本宏指令（不要跳过）
            if (this.isTextMacroDirective()) {
                // TextMacroDirective 由 parseStatement 处理
                // 继续执行，不跳过
            }
            // 检查是否是注释，但不要跳过预处理器指令（//! inject, //! loaddata）
            else if (this.isComment()) {
                const commentToken = this.lexer.current();
                if (commentToken) {
                    const commentValue = commentToken.value || "";
                    // 检查是否是预处理器指令
                    const isInject = /^\s*\/\/!\s*inject\s+(main|config)\s*$/i.test(commentValue);
                    const isLoadData = /^\s*\/\/!\s*loaddata\s+"[^"]+"\s*$/i.test(commentValue);
                    // 如果是预处理器指令，不要跳过，让 parseStatement 处理
                    if (!isInject && !isLoadData) {
                        // 普通注释，跳过
                        this.lexer.next();
                        continue;
                    }
                } else {
                    // 没有 token，跳过
                    this.lexer.next();
                    continue;
                }
            }
            
            try {
                const stmt = this.parseStatement();
                if (stmt) {
                    statements.push(stmt);
                } else {
                    // 如果无法解析，尝试同步到下一个同步点
                    const currentToken = this.lexer.current();
                    if (currentToken && !this.isEndKeyword()) {
                        // 如果当前 token 不是结束关键字，可能是语法错误
                        // 尝试同步到下一个同步点以继续解析
                        this.synchronize();
                    } else {
                        // 如果是结束关键字或到达文件末尾，正常退出
                        break;
                    }
                }
            } catch (error) {
                // 捕获解析错误，报告错误并尝试恢复
                const currentToken = this.lexer.current();
                if (currentToken) {
                    this.error(
                        `Parse error: ${error instanceof Error ? error.message : String(error)}`,
                        currentToken.start,
                        currentToken.end,
                        "Check the syntax and try to fix the error."
                    );
                }
                // 尝试同步到下一个同步点
                this.synchronize();
            }
        }
        
        const endPos = this.lexer.current()?.end || { line: 0, position: 0 };
        return new BlockStatement(statements, startPos, endPos);
    }

    /**
     * 检查是否到达文件末尾
     */
    private isAtEnd(): boolean {
        const token = this.lexer.current();
        return token === null || token.type === TokenType.EndOfInput;
    }

    /**
     * 检查当前 token 是否为注释
     */
    private isComment(): boolean {
        const token = this.lexer.current();
        return token !== null && (
            token.type === TokenType.SingleLineComment ||
            token.type === TokenType.MultiLineComment
        );
    }

    /**
     * 检查当前 token 是否为文本宏指令
     */
    private isTextMacroDirective(): boolean {
        const token = this.lexer.current();
        return token !== null && token.type === TokenType.TextMacroDirective;
    }

    /**
     * 检查当前 token 是否为指定类型
     */
    private check(type: TokenType): boolean {
        const token = this.lexer.current();
        return token !== null && token.type === type;
    }

    /**
     * 检查当前 token 的值是否为指定字符串（不区分大小写）
     */
    private checkValue(value: string, token?: IToken): boolean {
        const targetToken = token || this.lexer.current();
        if (!targetToken) return false;
        return targetToken.value.toLowerCase() === value.toLowerCase();
    }

    /**
     * 检查是否是结束关键字（endstruct, endinterface 等）
     */
    private isEndKeyword(): boolean {
        return this.checkValue("endstruct") || 
               this.checkValue("endinterface") || 
               this.checkValue("endmethod") || 
               this.checkValue("endfunction") ||
               this.checkValue("endglobals") || 
               this.checkValue("endlibrary") ||
               this.checkValue("endscope") || 
               this.checkValue("endmodule");
    }

    /**
     * 如果当前 token 匹配指定类型，则消费它
     */
    private consume(type: TokenType, message: string): IToken {
        const token = this.lexer.current();
        if (token === null || token.type !== type) {
            this.error(message);
            return token || new Token(type, "", { line: 0, position: 0 }, { line: 0, position: 0 });
        }
        this.lexer.next();
        return token;
    }

    /**
     * 如果当前 token 的值匹配指定字符串，则消费它
     */
    private consumeValue(value: string, message: string): IToken {
        const token = this.lexer.current();
        if (token === null || token.value.toLowerCase() !== value.toLowerCase()) {
            this.error(message);
            return token || new Token(TokenType.Identifier, "", { line: 0, position: 0 }, { line: 0, position: 0 });
        }
        this.lexer.next();
        return token;
    }

    /**
     * 报告错误
     */
    /**
     * 报告错误
     * @param message 错误消息
     * @param start 错误开始位置（可选）
     * @param end 错误结束位置（可选）
     * @param fix 修复建议（可选）
     */
    /**
     * 报告错误
     * @param message 错误消息
     * @param start 错误开始位置（可选）
     * @param end 错误结束位置（可选）
     * @param fix 修复建议（可选）
     */
    private error(message: string, start?: { line: number, position: number }, end?: { line: number, position: number }, fix?: string): void {
        const token = this.lexer.current();
        
        // 如果提供了明确的位置，使用它
        if (start && end) {
            // 确保 end 位置不小于 start 位置（按行号和列号比较）
            const finalEnd = (end.line > start.line || (end.line === start.line && end.position >= start.position)) 
                ? end 
                : start;
            this.errors.errors.push(new SimpleError(start, finalEnd, message, fix));
        } else if (token) {
            // 使用当前 token 的位置
            this.errors.errors.push(new SimpleError(
                token.start,
                token.end,
                message,
                fix
            ));
        } else {
            // 如果没有 token 也没有提供位置，使用默认位置
            const defaultPos = { line: 0, position: 0 };
            this.errors.errors.push(new SimpleError(defaultPos, defaultPos, message, fix));
        }
    }

    /**
     * 报告警告
     * @param message 警告消息
     * @param start 警告开始位置（可选）
     * @param end 警告结束位置（可选）
     */
    private warning(message: string, start?: { line: number, position: number }, end?: { line: number, position: number }): void {
        const token = this.lexer.current();
        if (start && end) {
            this.errors.warnings.push(new SimpleWarning(start, end, message));
        } else if (token) {
            this.errors.warnings.push(new SimpleWarning(
                token.start,
                token.end,
                message
            ));
        } else {
            const defaultPos = { line: 0, position: 0 };
            this.errors.warnings.push(new SimpleWarning(defaultPos, defaultPos, message));
        }
    }

    /**
     * 同步到下一个同步点（用于错误恢复）
     * 同步点包括：endstruct, endinterface, endmodule, endfunction, endmethod, endglobals, endlibrary, endscope
     */
    private synchronize(): void {
        while (!this.isAtEnd()) {
            // 如果遇到同步点，停止同步
            if (this.checkValue("endstruct") || 
                this.checkValue("endinterface") || 
                this.checkValue("endmodule") ||
                this.checkValue("endfunction") ||
                this.checkValue("endmethod") ||
                this.checkValue("endglobals") ||
                this.checkValue("endlibrary") ||
                this.checkValue("endscope") ||
                this.checkValue("endif") ||
                this.checkValue("endloop") ||
                this.checkValue("else") ||
                this.checkValue("elseif")) {
                return;
            }
            
            // 如果遇到新的声明开始，也停止同步（这些是新的同步点）
            if (this.checkValue("struct") ||
                this.checkValue("interface") ||
                this.checkValue("module") ||
                this.checkValue("function") ||
                this.checkValue("globals") ||
                this.checkValue("library") ||
                this.checkValue("scope")) {
                return;
            }
            
            this.lexer.next();
        }
    }

    /**
     * 解析语句
     */
    private parseStatement(): Statement | null {
        if (this.isAtEnd()) {
            return null;
        }

        const token = this.lexer.current();
        if (!token) {
            return null;
        }

        // 检查是否是结束关键字（不应该在这里被解析为语句）
        if (this.isEndKeyword()) {
            return null;
        }

        // 检查是否是文本宏指令
        if (this.isTextMacroDirective()) {
            const directiveToken = token;
            const directiveValue = directiveToken.value || "";
            
            // 检查是否是 //! textmacro
            if (/^\s*textmacro\b/i.test(directiveValue)) {
                return this.parseTextMacro();
            }
            
            // 检查是否是 //! runtextmacro
            if (/^\s*runtextmacro\b/i.test(directiveValue)) {
                return this.parseRunTextMacro();
            }
            
            // 检查是否是 //! endtextmacro（应该由 parseTextMacro 处理）
            if (/^\s*endtextmacro\b/i.test(directiveValue)) {
                this.error(
                    "Unexpected //! endtextmacro without matching //! textmacro",
                    directiveToken.start,
                    directiveToken.end,
                    "Remove this //! endtextmacro directive or add a matching //! textmacro directive before it."
                );
                this.lexer.next();
                return null;
            }
        }

        // 检查是否是预处理器指令（在注释中）
        if (this.isComment()) {
            const commentToken = token;
            const commentValue = commentToken.value || "";
            
            // 检查是否是 //! inject 指令
            const injectMatch = commentValue.match(/^\s*\/\/!\s*inject\s+(main|config)\s*$/i);
            if (injectMatch) {
                return this.parseInject(injectMatch[1] as "main" | "config");
            }
            
            // 检查是否是 //! endinject 指令（应该由 parseInject 处理，这里不应该单独出现）
            if (/^\s*\/\/!\s*endinject\s*$/i.test(commentValue)) {
                this.error(
                    "Unexpected //! endinject without matching //! inject",
                    undefined,
                    undefined,
                    "Remove this //! endinject directive or add a matching //! inject directive before it."
                );
                this.lexer.next();
                return null;
            }
            
            // 检查是否是 //! loaddata 指令
            const loadDataMatch = commentValue.match(/^\s*\/\/!\s*loaddata\s+"([^"]+)"\s*$/i);
            if (loadDataMatch) {
                const filePath = loadDataMatch[1];
                const startPos = commentToken.start;
                const endPos = commentToken.end;
                this.lexer.next();
                return new LoadDataStatement({
                    filePath,
                    start: startPos,
                    end: endPos
                });
            }
        }

        // 根据 token 类型选择解析方法
        // 检查是否是 constant native（常量原生函数）
        if (token.type === TokenType.keywordConstant) {
            const peekToken = this.lexer.peek();
            if (peekToken && peekToken.type === TokenType.keywordNative) {
                return this.parseNative(true); // 传递 isConstant = true
            }
            // 检查是否是 constant function（不合法，应该报错）
            if (peekToken && peekToken.type === TokenType.KeywordFunction) {
                const constantToken = this.lexer.current();
                if (constantToken) {
                    this.error(
                        "Invalid syntax: 'constant function' is not allowed. Use 'constant native function' for constant native functions.",
                        constantToken.start,
                        constantToken.end,
                        "Remove 'constant' keyword or use 'constant native function' instead."
                    );
                }
                // 继续解析为普通函数（但会报错）
                return this.parseFunction();
            }
        }
        
        // 检查是否是 function interface（函数接口）
        if (token.type === TokenType.KeywordFunction) {
            const peekToken = this.lexer.peek();
            if (peekToken && this.checkValue("interface", peekToken)) {
                return this.parseFunctionInterface();
            }
            return this.parseFunction();
        } else if (token.type === TokenType.keywordType) {
            return this.parseTypeDeclaration();
        } else if (token.type === TokenType.keywordNative) {
            return this.parseNative(false); // 传递 isConstant = false
        } else if (this.checkValue("struct")) {
            return this.parseStruct();
        } else if (this.checkValue("interface")) {
            return this.parseInterface();
        } else if (this.checkValue("module")) {
            return this.parseModule();
        } else if (this.checkValue("library") || this.checkValue("library_once")) {
            return this.parseLibrary();
        } else if (this.checkValue("scope")) {
            return this.parseScope();
        } else if (this.checkValue("hook")) {
            return this.parseHook();
        } else if (this.checkValue("method") || (this.checkValue("stub") && this.lexer.peek()?.value?.toLowerCase() === "method")) {
            return this.parseMethod();
        } else if (token.type === TokenType.keywordGlobals) {
            return this.parseGlobals();
        } else if (this.checkValue("static")) {
            // 检查是否是 static if
            const peekToken = this.lexer.peek();
            if (peekToken && peekToken.type === TokenType.KeywordIf) {
                return this.parseStaticIf();
            }
        } else if (token.type === TokenType.KeywordIf) {
            return this.parseIf();
        } else if (token.type === TokenType.keywordLoop) {
            return this.parseLoop();
        } else if (token.type === TokenType.keywordSet) {
            return this.parseSet();
        } else if (token.type === TokenType.keywordCall) {
            return this.parseCall();
        } else if (token.type === TokenType.keywordReturn) {
            return this.parseReturn();
        } else if (token.type === TokenType.keywordLocal) {
            return this.parseLocal();
        } else if (token.type === TokenType.keywordExitwhen) {
            return this.parseExitWhen();
        }

        // 无法识别的语句
        return null;
    }

    /**
     * 解析函数接口声明
     * function interface 接口名称 takes ... returns ...
     */
    private parseFunctionInterface(): FunctionInterfaceDeclaration | null {
        const startToken = this.consume(TokenType.KeywordFunction, "Expected 'function'");
        if (!startToken) return null;

        // 消费 interface 关键字
        const interfaceToken = this.consumeValue("interface", "Expected 'interface' after 'function'");
        if (!interfaceToken) return null;

        const startPos = startToken.start;

        // 解析接口名称
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next();
        } else {
            this.error("Expected function interface name after 'interface'");
            return null;
        }

        // 解析 takes
        this.consumeValue("takes", "Expected 'takes'");
        const parameters = this.parseTakes();

        // 解析 returns
        this.consumeValue("returns", "Expected 'returns'");
        const returnType = this.parseReturns();

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new FunctionInterfaceDeclaration({
            name,
            parameters,
            returnType,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 JASS 类型声明
     * 语法：
     * - type NewType extends BaseType
     * - type NewType extends BaseType array[Size]
     * - type NewType extends BaseType array[ElementSize, StorageSize]
     */
    private parseTypeDeclaration(): TypeDeclaration | null {
        const startToken = this.consume(TokenType.keywordType, "Expected 'type'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析类型名称
        const nameToken = this.lexer.current();
        if (!nameToken || nameToken.type !== TokenType.Identifier) {
            this.error("Expected type name after 'type'");
            return null;
        }
        const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
        this.lexer.next();

        // 解析 extends
        if (!this.checkValue("extends")) {
            this.error("Expected 'extends' after type name");
            return null;
        }
        this.lexer.next(); // 消费 extends

        // 解析基类型名称（可以是标识符或内置类型关键字，如 handle）
        const baseToken = this.lexer.current();
        if (!baseToken) {
            this.error("Expected base type name after 'extends'");
            return null;
        }
        const isBaseIdentifier =
            baseToken.type === TokenType.Identifier ||
            baseToken.type === TokenType.TypeInteger ||
            baseToken.type === TokenType.TypeReal ||
            baseToken.type === TokenType.TypeString ||
            baseToken.type === TokenType.TypeBoolean ||
            baseToken.type === TokenType.TypeCode ||
            baseToken.type === TokenType.TypeHandle ||
            baseToken.type === TokenType.TypeKey;
        if (!isBaseIdentifier) {
            this.error("Expected base type name after 'extends'");
            return null;
        }
        const baseType = new Identifier(baseToken.value, baseToken.start, baseToken.end);
        this.lexer.next();

        // 可选的动态数组声明：array[Size] 或 array[ElemSize,StorageSize]
        let isArray = false;
        let elementSize: Identifier | IntegerLiteral | null = null;
        let storageSize: Identifier | IntegerLiteral | null = null;
        let endPos = baseToken.end;

        if (this.checkValue("array")) {
            isArray = true;
            this.lexer.next(); // 消费 array

            // 期望 [
            if (!this.check(TokenType.LeftBracket)) {
                this.error("Expected '[' after 'array' in type declaration");
                return null;
            }
            this.lexer.next(); // 消费 [

            // 解析第一个大小（整数常量或标识符）
            const sizeToken = this.lexer.current();
            if (!sizeToken || (sizeToken.type !== TokenType.IntegerLiteral && sizeToken.type !== TokenType.Identifier)) {
                this.error("Expected size or constant name inside 'array[...]'");
                return null;
            }
            if (sizeToken.type === TokenType.IntegerLiteral) {
                const value = parseInt(sizeToken.value, 10);
                elementSize = new IntegerLiteral(value, sizeToken.start, sizeToken.end);
            } else {
                elementSize = new Identifier(sizeToken.value, sizeToken.start, sizeToken.end);
            }
            this.lexer.next(); // 消费第一个大小

            // 可选的 ,StorageSize
            if (this.check(TokenType.Comma)) {
                this.lexer.next(); // 消费 ,
                const storageToken = this.lexer.current();
                if (!storageToken || (storageToken.type !== TokenType.IntegerLiteral && storageToken.type !== TokenType.Identifier)) {
                    this.error("Expected storage size or constant name after ',' in 'array[...]'");
                    return null;
                }
                if (storageToken.type === TokenType.IntegerLiteral) {
                    const val = parseInt(storageToken.value, 10);
                    storageSize = new IntegerLiteral(val, storageToken.start, storageToken.end);
                } else {
                    storageSize = new Identifier(storageToken.value, storageToken.start, storageToken.end);
                }
                this.lexer.next(); // 消费第二个大小
            }

            // 期望 ]
            if (!this.check(TokenType.RightBracket)) {
                this.error("Expected ']' after array size specification");
                return null;
            }
            const rightBracketToken = this.lexer.current();
            endPos = rightBracketToken?.end || endPos;
            this.lexer.next(); // 消费 ]
        } else {
            const endToken = this.lexer.current();
            endPos = endToken?.end || baseToken.end;
        }

        return new TypeDeclaration({
            name,
            baseType,
            isArray,
            elementSize,
            storageSize,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析函数声明
     * function name takes ... returns ...
     */
    private parseFunction(): FunctionDeclaration | null {
        const startToken = this.consume(TokenType.KeywordFunction, "Expected 'function'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析函数名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next();
        }

        // 解析 takes
        this.consumeValue("takes", "Expected 'takes'");
        const parameters = this.parseTakes();

        // 解析 returns
        this.consumeValue("returns", "Expected 'returns'");
        const returnType = this.parseReturns();

        // 解析函数体
        const body = this.parseFunctionBody();

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new FunctionDeclaration({
            name,
            parameters,
            returnType,
            body,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析方法声明（用于结构、接口等）
     * method [static] [operator <operatorName>] <name> takes ... returns ...
     */
    private parseMethod(): MethodDeclaration | null {
        // 检查是否有 static 关键字（在 method 之前，根据文档 static method 的语法）
        let isStatic = false;
        if (this.checkValue("static")) {
            isStatic = true;
            this.lexer.next();
        }

        // 检查是否有 stub 关键字（在 method 之前）
        let isStub = false;
        if (this.checkValue("stub")) {
            isStub = true;
            this.lexer.next(); // 消费 stub
        }

        const startToken = this.consumeValue("method", "Expected 'method'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 检查是否有 operator 关键字
        let isOperator = false;
        let operatorName: string | null = null;
        let name: Identifier | null = null;

        if (this.checkValue("operator")) {
            isOperator = true;
            this.lexer.next();

            // 解析运算符名称
            // 支持的运算符：[], []=, <, >, ==, !=, 以及自定义运算符（如 x, x=）
            const opToken = this.lexer.current();
            if (!opToken) {
                this.error("Expected operator name after 'operator'");
                return null;
            }

            // 处理 [] 和 []= 运算符
            if (opToken.type === TokenType.OperatorIndex) {
                operatorName = "[]";
                this.lexer.next();
            } else if (opToken.type === TokenType.OperatorIndexAssign) {
                operatorName = "[]=";
                this.lexer.next();
            } else if (opToken.type === TokenType.LeftBracket) {
                // 兼容处理：如果词法解析器没有识别为 OperatorIndex，则手动处理
                this.lexer.next(); // 消费 [
                if (this.check(TokenType.RightBracket)) {
                    this.lexer.next(); // 消费 ]
                    // 检查是否是 []=
                    if (this.check(TokenType.OperatorAssign)) {
                        this.lexer.next(); // 消费 =
                        operatorName = "[]=";
                    } else {
                        operatorName = "[]";
                    }
                } else {
                    this.error("Expected ']' after '[' in operator declaration");
                    return null;
                }
            } 
            // 处理其他运算符符号
            else if (opToken.type === TokenType.OperatorLess) {
                operatorName = "<";
                this.lexer.next();
            } else if (opToken.type === TokenType.OperatorGreater) {
                operatorName = ">";
                this.lexer.next();
            } else if (opToken.type === TokenType.OperatorEqual) {
                operatorName = "==";
                this.lexer.next();
            } else if (opToken.type === TokenType.OperatorNotEqual) {
                operatorName = "!=";
                this.lexer.next();
            }
            // 处理自定义运算符（标识符，如 x, x=）
            else if (opToken.type === TokenType.Identifier) {
                const customOpName = opToken.value;
                this.lexer.next();
                
                // 检查是否是赋值运算符（如 x=）
                if (this.check(TokenType.OperatorAssign)) {
                    this.lexer.next();
                    operatorName = customOpName + "=";
                } else {
                    operatorName = customOpName;
                }
            } else {
                this.error(`Invalid operator name '${opToken.value}'. Expected [], []=, <, >, ==, !=, or identifier`);
                return null;
            }
        } else {
            // 普通方法，解析方法名
            const nameToken = this.lexer.current();
            if (nameToken && nameToken.type === TokenType.Identifier) {
                name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                this.lexer.next();
            }
        }

        // 解析 takes
        this.consumeValue("takes", "Expected 'takes'");
        const parameters = this.parseTakes();

        // 解析 returns
        this.consumeValue("returns", "Expected 'returns'");
        const returnType = this.parseReturns();

        // 解析 defaults 关键字（仅用于接口方法）
        // defaults 后跟 "nothing" 或常量值
        let defaultsValue: Expression | null = null;
        if (this.checkValue("defaults")) {
            this.lexer.next(); // 消费 defaults
            
            // 检查是否是 "nothing"
            if (this.checkValue("nothing")) {
                // 对于 "nothing"，我们需要创建一个特殊的表达式来表示它
                // 但根据文档，defaults nothing 表示默认实现为空方法
                // 我们可以使用 NullLiteral 或者创建一个特殊的标识符
                const nothingToken = this.lexer.current();
                if (nothingToken) {
                    // 创建一个 Identifier 来表示 "nothing"
                    defaultsValue = new Identifier("nothing", nothingToken.start, nothingToken.end);
                    this.lexer.next();
                }
            } else {
                // 解析常量值（可以是字面量或常量标识符）
                // 根据文档，defaults 仅支持常量值
                // 我们只解析基本表达式（字面量或标识符），不解析复杂表达式
                const defaultValue = this.parsePrimaryExpression();
                if (defaultValue) {
                    defaultsValue = defaultValue;
                } else {
                    const defaultsToken = this.lexer.current();
                    if (defaultsToken) {
                        this.error(
                            "Expected constant value or 'nothing' after 'defaults'. Defaults only supports constant literals or constant identifiers.",
                            defaultsToken.start,
                            defaultsToken.end,
                            "Provide a constant value (e.g., 0, 0.0, false, \"string\") or 'nothing' after 'defaults'."
                        );
                    } else {
                        this.error(
                            "Expected constant value or 'nothing' after 'defaults'. Defaults only supports constant literals or constant identifiers.",
                            undefined,
                            undefined,
                            "Provide a constant value (e.g., 0, 0.0, false, \"string\") or 'nothing' after 'defaults'."
                        );
                    }
                }
            }
        }

        // 检查是否是 interface 中的 method 声明（不需要 body）
        // 如果下一个 token 是 endinterface，则不需要 body（interface 中的 method 声明）
        // 如果下一个 token 是 method（下一个方法），说明这是在 interface 中，不需要 body
        // 如果下一个 token 是 endmethod，说明方法体为空（struct 中的 method 声明）
        // 注意：在 interface 中，方法声明后如果有 defaults，应该直接检查 endinterface 或下一个 method
        let body: BlockStatement;
        const currentToken = this.lexer.current();
        const startPosForBody = currentToken?.start || { line: 0, position: 0 };
        
        // 检查是否是 interface 中的方法（下一个 token 是 endinterface 或 method）
        if (this.checkValue("endinterface")) {
            // interface 中的 method 声明，没有 body
            // 注意：不要消费 endinterface，让 parseInterface 来处理
            body = new BlockStatement([], startPosForBody, startPosForBody);
        } else if (this.checkValue("method") || (this.checkValue("static") && this.lexer.peek()?.value?.toLowerCase() === "method")) {
            // interface 中的 method 声明，下一个是另一个 method，没有 body
            // 注意：不要消费 method，让 parseInterface 继续解析
            body = new BlockStatement([], startPosForBody, startPosForBody);
        } else if (this.checkValue("endmethod")) {
            // 空的方法体（struct 中的 method 声明，但没有语句）
            // 注意：不要消费 endmethod，让 parseMethodBody 来处理
            body = new BlockStatement([], startPosForBody, startPosForBody);
        } else {
            // struct 中的 method 声明，需要 body（可能为空）
            body = this.parseMethodBody();
        }

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new MethodDeclaration({
            name,
            parameters,
            returnType,
            body,
            isStatic,
            isStub,
            isOperator,
            operatorName,
            defaultsValue,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析方法体
     */
    private parseMethodBody(): BlockStatement {
        const statements: Statement[] = [];
        const startPos = this.lexer.current()?.start || { line: 0, position: 0 };

        while (!this.isAtEnd() && !this.checkValue("endmethod") && !this.checkValue("endstruct") && !this.checkValue("endinterface")) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析，检查是否是结束关键字
                if (this.checkValue("endmethod") || this.checkValue("endstruct") || this.checkValue("endinterface")) {
                    break;
                }
                // 尝试跳过当前 token
                if (!this.isAtEnd()) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endmethod（只有在遇到 endmethod 时才消费）
        let endPos = startPos;
        if (this.checkValue("endmethod")) {
            const endmethodToken = this.lexer.current();
            if (endmethodToken) {
                endPos = endmethodToken.end; // 保存 endmethod 的位置
            }
            this.lexer.next();
        } else {
            // 如果没有 endmethod，使用最后一个语句的位置
            if (statements.length > 0) {
                const lastStmt = statements[statements.length - 1];
                if (lastStmt.end) {
                    endPos = lastStmt.end;
                }
            }
        }
        return new BlockStatement(statements, startPos, endPos);
    }

    /**
     * 解析 native 函数声明
     * @param isConstant 是否是常量函数（constant native function）
     */
    private parseNative(isConstant: boolean = false): NativeDeclaration | null {
        let startToken: IToken | null = null;
        let startPos: { line: number, position: number } = { line: 0, position: 0 };

        // 如果 isConstant 为 true，先消费 constant 关键字
        if (isConstant) {
            startToken = this.consume(TokenType.keywordConstant, "Expected 'constant'");
            if (!startToken) return null;
            startPos = startToken.start;
        }

        // 解析 native 关键字
        const nativeToken = this.consume(TokenType.keywordNative, "Expected 'native'");
        if (!nativeToken) return null;
        
        // 如果还没有设置 startPos，使用 native 的位置
        if (!isConstant) {
            startPos = nativeToken.start;
        }

        // native 本身就等价于 function，不需要额外的 function 关键字
        // constant native FunctionName takes ... returns ...
        // native FunctionName takes ... returns ...

        // 解析函数名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next();
        } else {
            this.error("Expected native function name after 'native'");
            return null;
        }

        // 解析 takes
        if (!this.checkValue("takes")) {
            this.error("Expected 'takes' after native function name");
            return null;
        }
        this.lexer.next(); // 消费 takes
        const parameters = this.parseTakes();

        // 解析 returns
        if (!this.checkValue("returns")) {
            this.error("Expected 'returns' after 'takes' clause");
            return null;
        }
        this.lexer.next(); // 消费 returns
        const returnType = this.parseReturns();

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new NativeDeclaration({
            name,
            parameters,
            returnType,
            isConstant: isConstant,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 takes 子句
     * 支持格式：takes nothing | takes type1 name1, type2 name2, ...
     * 支持的类型：基本类型（integer, real, string等）、自定义类型（struct）、接口类型（interface）
     */
    private parseTakes(): VariableDeclaration[] {
        const parameters: VariableDeclaration[] = [];

        // 跳过注释和空白
        while (this.isComment()) {
            this.lexer.next();
        }

        // 如果遇到 nothing，则没有参数
        if (this.checkValue("nothing")) {
            this.lexer.next();
            return parameters;
        }

        // 解析参数列表
        while (!this.isAtEnd()) {
            // 跳过注释
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 检查是否遇到 returns 关键字（参数列表结束）
            if (this.checkValue("returns")) {
                break;
            }

            // 解析参数类型（可以是基本类型或自定义类型）
            const typeToken = this.lexer.current();
            if (!typeToken) {
                break;
            }

            // 类型可以是：
            // 1. 基本类型关键字（TypeInteger, TypeReal, TypeString, TypeBoolean, TypeCode, TypeHandle, TypeKey）
            // 2. 标识符（自定义类型如 struct、interface 等）
            // 3. thistype 关键字
            // 检查是否为有效的类型 token
            const isValidType = 
                typeToken.type === TokenType.Identifier ||
                typeToken.type === TokenType.TypeInteger ||
                typeToken.type === TokenType.TypeReal ||
                typeToken.type === TokenType.TypeString ||
                typeToken.type === TokenType.TypeBoolean ||
                typeToken.type === TokenType.TypeCode ||
                typeToken.type === TokenType.TypeHandle ||
                typeToken.type === TokenType.TypeKey ||
                this.checkValue("thistype");

            if (!isValidType) {
                // 如果不是类型标识符，可能是 returns 关键字或其他内容
                if (this.checkValue("returns")) {
                    break;
                }
                this.error(`Expected parameter type, got '${typeToken.value}' (type: ${typeToken.type})`);
                break;
            }

            // 如果是 thistype，创建 ThistypeExpression，否则创建 Identifier
            let type: Identifier | ThistypeExpression;
            if (this.checkValue("thistype")) {
                type = new ThistypeExpression(typeToken.start, typeToken.end);
                this.lexer.next();
            } else {
                type = new Identifier(typeToken.value, typeToken.start, typeToken.end);
                this.lexer.next();
            }

            // 跳过注释
            while (this.isComment()) {
                this.lexer.next();
            }

            // 解析参数名
            const nameToken = this.lexer.current();
            if (!nameToken) {
                this.error("Expected parameter name after type");
                break;
            }

            let name: Identifier | null = null;
            if (nameToken.type === TokenType.Identifier) {
                name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                this.lexer.next();
            } else {
                // 如果下一个不是标识符，可能是 returns 关键字
                if (this.checkValue("returns")) {
                    this.error("Expected parameter name before 'returns'");
                    break;
                }
                this.error(`Expected parameter name, got '${nameToken.value}'`);
                break;
            }

            // 创建参数声明
            const param = new VariableDeclaration(
                name,
                type,
                null,
                false,
                false,
                false, // isArray
                null,  // arraySize
                null,  // arrayWidth
                null,  // arrayHeight
                false, // isStatic
                false, // isReadonly
                typeToken.start,
                nameToken.end
            );
            parameters.push(param);

            // 跳过注释
            while (this.isComment()) {
                this.lexer.next();
            }

            // 检查是否有逗号（下一个参数）
            if (this.check(TokenType.Comma)) {
                this.lexer.next();
                // 继续解析下一个参数
                continue;
            } else {
                // 没有逗号，参数列表结束
                break;
            }
        }

        return parameters;
    }

    /**
     * 解析 returns 子句
     */
    /**
     * 解析 returns 子句
     */
    private parseReturns(): Identifier | ThistypeExpression | null {
        const token = this.lexer.current();
        // 支持 Identifier 和类型关键字（如 integer, real, string, boolean, code, handle, key 等）
        // 以及自定义类型（如 thistype）
        if (token && (token.type === TokenType.Identifier || 
                      token.type === TokenType.TypeInteger ||
                      token.type === TokenType.TypeReal ||
                      token.type === TokenType.TypeString ||
                      token.type === TokenType.TypeBoolean ||
                      token.type === TokenType.TypeCode ||
                      token.type === TokenType.TypeHandle ||
                      token.type === TokenType.TypeKey)) {
            // 检查是否是 thistype
            if (this.checkValue("thistype")) {
                const returnType = new ThistypeExpression(token.start, token.end);
                this.lexer.next();
                return returnType;
            } else {
                const returnType = new Identifier(token.value, token.start, token.end);
                this.lexer.next();
                return returnType;
            }
        } else if (this.checkValue("nothing")) {
            this.lexer.next();
            return null;
        }
        return null;
    }

    /**
     * 解析函数体
     */
    private parseFunctionBody(): BlockStatement {
        const statements: Statement[] = [];
        const startPos = this.lexer.current()?.start || { line: 0, position: 0 };

        while (!this.isAtEnd() && !this.check(TokenType.KeywordEndfunction)) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析，尝试跳过当前 token
                if (!this.isAtEnd() && !this.check(TokenType.KeywordEndfunction)) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endfunction
        if (this.check(TokenType.KeywordEndfunction)) {
            this.lexer.next();
        }

        const endPos = this.lexer.current()?.end || startPos;
        return new BlockStatement(statements, startPos, endPos);
    }

    /**
     * 解析结构声明
     * 支持语法：
     * - struct Name
     * - struct Name[10000]  (索引空间增强)
     * - struct Name extends Type
     * - struct Name extends array [20000]  (数组结构)
     */
    private parseStruct(): StructDeclaration | null {
        const startToken = this.consumeValue("struct", "Expected 'struct'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析结构名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        let extendsType: Identifier | null = null;
        let indexSize: number | null = null; // 索引空间增强，如 struct X[10000]
        let isArrayStruct = false; // 是否是数组结构
        let arraySize: number | null = null; // 数组结构的大小

        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            // 检查重复声明
            this.checkDuplicateDeclaration(nameToken.value, "struct", nameToken.start);
            this.lexer.next();

            // 检查是否有索引空间增强语法：struct X[10000]
            if (this.check(TokenType.LeftBracket)) {
                this.lexer.next(); // 消费 [
                const sizeToken = this.lexer.current();
                if (sizeToken && sizeToken.type === TokenType.IntegerLiteral) {
                    indexSize = parseInt(sizeToken.value, 10);
                    this.lexer.next();
                    if (!this.check(TokenType.RightBracket)) {
                        this.error("Expected ']' after index size");
                        return null;
                    }
                    this.lexer.next(); // 消费 ]
                } else {
                    this.error("Expected integer literal for index size");
                    return null;
                }
            }

            // 检查是否有 extends
            if (this.checkValue("extends")) {
                this.lexer.next();
                
                // 检查是否是数组结构：extends array [20000]
                if (this.checkValue("array")) {
                    isArrayStruct = true;
                    this.lexer.next();
                    
                    // 检查是否有数组大小
                    if (this.check(TokenType.LeftBracket)) {
                        this.lexer.next(); // 消费 [
                        const sizeToken = this.lexer.current();
                        if (sizeToken && sizeToken.type === TokenType.IntegerLiteral) {
                            arraySize = parseInt(sizeToken.value, 10);
                            this.lexer.next();
                            if (!this.check(TokenType.RightBracket)) {
                                this.error("Expected ']' after array size");
                                return null;
                            }
                            this.lexer.next(); // 消费 ]
                        } else {
                            this.error("Expected integer literal for array size");
                            return null;
                        }
                    }
                } else {
                    // 普通继承：extends Type
                    const extendsToken = this.lexer.current();
                    if (extendsToken && extendsToken.type === TokenType.Identifier) {
                        extendsType = new Identifier(extendsToken.value, extendsToken.start, extendsToken.end);
                        this.lexer.next();
                    } else {
                        this.error("Expected type name after 'extends'");
                        return null;
                    }
                }
            }

            // 验证：不能在继承的结构上使用索引空间增强
            if (indexSize !== null && (extendsType !== null || isArrayStruct)) {
                this.error("Cannot use index size enhancement on struct that extends another type");
                return null;
            }
        } else {
            this.error("Expected struct name after 'struct'");
            return null;
        }

        // 解析结构成员
        const members: Statement[] = [];
        while (!this.isAtEnd()) {
            // 每次循环开始时都检查是否是 endstruct
            if (this.checkValue("endstruct")) {
                break;
            }
            
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 检查不合法组合：private onDestroy（onDestroy 必须是 public）
            // 注意：我们需要在解析方法之前检查，因为 private 关键字在 method 之前
            let isPrivateMethod = false;
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    isPrivateMethod = true;
                    // 保存当前位置以便后续检查方法名
                    const savedPos = this.lexer.current();
                    // 暂时消费 private 和 method 来检查方法名
                    this.lexer.next(); // 消费 private
                    if (this.checkValue("method")) {
                        this.lexer.next(); // 消费 method
                        // 检查是否是 operator
                        if (this.checkValue("operator")) {
                            // operator 方法，跳过
                            this.lexer.next();
                        } else {
                            // 检查方法名
                            const methodNameToken = this.lexer.current();
                            if (methodNameToken && methodNameToken.type === TokenType.Identifier) {
                                const methodName = methodNameToken.value.toLowerCase();
                                if (methodName === "ondestroy") {
                                    if (savedPos) {
                                        this.error(
                                            `Method 'onDestroy' cannot be private. The onDestroy method must be public as it is automatically called by the destroy method.`,
                                            savedPos.start,
                                            savedPos.end,
                                            `Remove 'private' keyword before 'onDestroy'. The onDestroy method must be public.`
                                        );
                                    }
                                }
                            }
                        }
                        // 回退到 private 之前
                        // 注意：lexer 可能不支持回退，所以我们需要重新解析
                        // 实际上，我们应该让 parseMethod 处理 private，但为了简化，我们在这里检查
                    }
                    // 回退：由于 lexer 可能不支持回退，我们需要让 parseMethod 知道这是 private
                    // 但 parseMethod 不处理 private，所以我们需要在 struct 解析时处理
                }
            }

            // 尝试解析为方法声明（支持 stub method）
            if (this.checkValue("method") || (this.checkValue("stub") && this.lexer.peek()?.value?.toLowerCase() === "method")) {
                const member = this.parseMethod();
                if (member) {
                    // 检查是否是 private onDestroy（通过检查方法名和之前的 private 标记）
                    if (isPrivateMethod && member.name && member.name.toString().toLowerCase() === "ondestroy") {
                        const memberStart = member.start || { line: 0, position: 0 };
                        this.error(
                            `Method 'onDestroy' cannot be private. The onDestroy method must be public as it is automatically called by the destroy method.`,
                            memberStart,
                            member.end || memberStart,
                            `Remove 'private' keyword before 'onDestroy'. The onDestroy method must be public.`
                        );
                    }
                    members.push(member);
                    continue;
                }
            } else if (this.checkValue("static")) {
                // 检查是否是 static method 或 static stub method（而不是 static if）
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    // 消费 static 关键字，然后解析 method
                    this.lexer.next();
                    const member = this.parseMethod();
                    if (member) {
                        member.isStatic = true;
                        members.push(member);
                        continue;
                    }
                } else if (peekToken && peekToken.value?.toLowerCase() === "stub") {
                    // 检查 static stub method：先消费 static，然后解析 stub method
                    this.lexer.next();
                    const member = this.parseMethod();
                    if (member) {
                        member.isStatic = true;
                        members.push(member);
                        continue;
                    }
                }
            }

            // 再次检查是否是 endstruct（在尝试解析方法后）
            if (this.checkValue("endstruct")) {
                break;
            }

            // 尝试解析为 delegate 声明（在变量声明之前检查，因为 delegate 也是 Identifier）
            // 检查 private delegate 或 public delegate 或 delegate
            let isPrivate = false;
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "delegate") {
                    isPrivate = true;
                    this.lexer.next(); // 消费 private
                }
            } else if (this.checkValue("public")) {
                // public delegate 也是合法的，但我们不需要特殊处理（默认就是 public）
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "delegate") {
                    this.lexer.next(); // 消费 public
                }
            }
            
            if (this.checkValue("delegate")) {
                const delegateDecl = this.parseDelegateDeclaration(isPrivate);
                if (delegateDecl) {
                    members.push(delegateDecl);
                    continue;
                }
            }

            // 再次检查是否是 endstruct（在尝试解析 delegate 后）
            if (this.checkValue("endstruct")) {
                break;
            }

            // 尝试解析为变量声明（类型名 + 标识符）
            // 检查是否有 private、public 或 readonly 关键字（用于变量成员）
            // 注意：这些关键字可以组合使用，如 private readonly、public readonly
            let isPrivateVar = false;
            let isPublicVar = false;
            let isReadonlyVar = false;
            
            // 检查 private 关键字（可能后面跟着 readonly）
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                // 检查下一个 token 是否是 readonly、类型关键字或标识符
                if (peekToken && (
                    peekToken.value?.toLowerCase() === "readonly" ||
                    peekToken.type === TokenType.TypeInteger ||
                    peekToken.type === TokenType.TypeReal ||
                    peekToken.type === TokenType.TypeString ||
                    peekToken.type === TokenType.TypeBoolean ||
                    peekToken.type === TokenType.TypeCode ||
                    peekToken.type === TokenType.TypeHandle ||
                    peekToken.type === TokenType.TypeKey ||
                    peekToken.type === TokenType.Identifier ||
                    peekToken.value?.toLowerCase() === "static" ||
                    peekToken.value?.toLowerCase() === "constant"
                )) {
                    isPrivateVar = true;
                    this.lexer.next(); // 消费 private
                    // 检查是否还有 readonly
                    if (this.checkValue("readonly")) {
                        isReadonlyVar = true;
                        this.lexer.next(); // 消费 readonly
                    }
                }
            } 
            // 检查 public 关键字（可能后面跟着 readonly）
            else if (this.checkValue("public")) {
                const peekToken = this.lexer.peek();
                // 检查下一个 token 是否是 readonly、类型关键字或标识符
                if (peekToken && (
                    peekToken.value?.toLowerCase() === "readonly" ||
                    peekToken.type === TokenType.TypeInteger ||
                    peekToken.type === TokenType.TypeReal ||
                    peekToken.type === TokenType.TypeString ||
                    peekToken.type === TokenType.TypeBoolean ||
                    peekToken.type === TokenType.TypeCode ||
                    peekToken.type === TokenType.TypeHandle ||
                    peekToken.type === TokenType.TypeKey ||
                    peekToken.type === TokenType.Identifier ||
                    peekToken.value?.toLowerCase() === "static" ||
                    peekToken.value?.toLowerCase() === "constant"
                )) {
                    isPublicVar = true;
                    this.lexer.next(); // 消费 public
                    // 检查是否还有 readonly
                    if (this.checkValue("readonly")) {
                        isReadonlyVar = true;
                        this.lexer.next(); // 消费 readonly
                    }
                }
            } 
            // 检查 readonly 关键字（可能单独使用，或与 static/constant 组合）
            else if (this.checkValue("readonly")) {
                const peekToken = this.lexer.peek();
                // 检查下一个 token 是否是 constant、static、类型关键字或标识符
                if (peekToken && (
                    peekToken.value?.toLowerCase() === "constant" ||
                    peekToken.value?.toLowerCase() === "static" ||
                    peekToken.type === TokenType.TypeInteger ||
                    peekToken.type === TokenType.TypeReal ||
                    peekToken.type === TokenType.TypeString ||
                    peekToken.type === TokenType.TypeBoolean ||
                    peekToken.type === TokenType.TypeCode ||
                    peekToken.type === TokenType.TypeHandle ||
                    peekToken.type === TokenType.TypeKey ||
                    peekToken.type === TokenType.Identifier
                )) {
                    isReadonlyVar = true;
                    this.lexer.next(); // 消费 readonly
                }
            }
            
            const token = this.lexer.current();
            if (token) {
                // 再次检查是否是 endstruct（在检查 token 后）
                if (this.checkValue("endstruct")) {
                    break;
                }
                // 检查是否是类型关键字或标识符（基本类型或自定义类型）
                // 在 struct 中，如果遇到类型关键字或标识符，可能是类型名，尝试解析为变量声明
                const isTypeKeyword = token.type === TokenType.TypeInteger ||
                                    token.type === TokenType.TypeReal ||
                                    token.type === TokenType.TypeString ||
                                    token.type === TokenType.TypeBoolean ||
                                    token.type === TokenType.TypeCode ||
                                    token.type === TokenType.TypeHandle ||
                                    token.type === TokenType.TypeKey;
                const isIdentifier = token.type === TokenType.Identifier;
                if (isTypeKeyword || isIdentifier) {
                    const varDecl = this.parseVariableDeclaration(false, isReadonlyVar);
                    if (varDecl) {
                        members.push(varDecl);
                        continue;
                    }
                }
            }

            // 再次检查是否是 endstruct（在尝试解析变量声明后）
            if (this.checkValue("endstruct")) {
                break;
            }

            // 尝试解析为 implement 语句
            if (this.checkValue("implement")) {
                const implementStmt = this.parseImplementStatement();
                if (implementStmt) {
                    members.push(implementStmt);
                    continue;
                }
            }

            // 再次检查是否是 endstruct（在尝试解析 implement 后）
            if (this.checkValue("endstruct")) {
                break;
            }

            // 尝试解析为其他语句（如 static if 等）
            const member = this.parseStatement();
            if (member) {
                members.push(member);
            } else {
                // 如果无法解析，检查是否是 endstruct
                if (this.checkValue("endstruct")) {
                    break;
                }
                if (!this.isAtEnd()) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endstruct
        let endPos = startPos;
        if (this.checkValue("endstruct")) {
            const endstructToken = this.lexer.current();
            if (endstructToken) {
                endPos = endstructToken.end; // 保存 endstruct 的位置
            }
            this.lexer.next();
        } else {
            const structName = name?.toString() || "unknown";
            const currentToken = this.lexer.current();
            if (currentToken) {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed struct '${structName}'. Expected 'endstruct' to close the struct declaration that started at line ${startPos.line + 1}.`,
                    currentToken.start,
                    currentToken.end,
                    `Add 'endstruct' before '${currentToken.value || "this token"}' to close the struct declaration.`
                );
                // 尝试同步到下一个同步点
                this.synchronize();
                // 同步后，使用当前 token 的位置作为 endPos
                const syncToken = this.lexer.current();
                if (syncToken) {
                    endPos = syncToken.start; // 使用同步点的开始位置
                }
            } else {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed struct '${structName}'. Expected 'endstruct' to close the struct declaration that started at line ${startPos.line + 1}. Reached end of file.`,
                    startPos,
                    endPos,
                    `Add 'endstruct' at the end of the struct declaration to close it.`
                );
            }
        }

        return new StructDeclaration({
            name,
            members,
            extendsType,
            indexSize,
            isArrayStruct,
            arraySize,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析接口声明
     */
    private parseInterface(): InterfaceDeclaration | null {
        const startToken = this.consumeValue("interface", "Expected 'interface'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析接口名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            // 检查重复声明
            this.checkDuplicateDeclaration(nameToken.value, "interface", nameToken.start);
            this.lexer.next();
        } else {
            this.error(
                "Expected interface name after 'interface'",
                nameToken?.start,
                nameToken?.end,
                "Provide a valid identifier name for the interface."
            );
            return null;
        }

        // 跳过注释
        while (this.isComment()) {
            this.lexer.next();
        }

        // 检查接口名后是否有意外的 token（如 =, extends 等）
        // 接口声明语法：interface name [extends ...] { members }
        // 不允许在接口名后直接跟 = 或其他运算符
        const nextToken = this.lexer.current();
        if (nextToken) {
            // 检查是否是 extends（接口可以扩展其他接口）
            if (this.checkValue("extends")) {
                // 接口扩展功能（如果支持的话）
                this.lexer.next();
                const extendsToken = this.lexer.current();
                if (extendsToken && extendsToken.type === TokenType.Identifier) {
                    // 可以在这里处理接口扩展
                    this.lexer.next();
                } else {
                    this.error("Expected interface name after 'extends'");
                }
            } 
            // 检查是否有意外的运算符（如 =）
            else if (nextToken.type === TokenType.OperatorAssign || 
                     nextToken.type === TokenType.OperatorEqual ||
                     nextToken.type === TokenType.OperatorNotEqual ||
                     nextToken.type === TokenType.OperatorLess ||
                     nextToken.type === TokenType.OperatorGreater) {
                this.error(`Unexpected operator '${nextToken.value}' after interface name. Interface declaration should not have operators.`);
                // 跳过这个意外的 token 继续解析
                this.lexer.next();
            }
        }

        // 解析接口成员
        const members: Statement[] = [];
        while (!this.isAtEnd()) {
            // 每次循环开始时都检查是否是 endinterface
            if (this.checkValue("endinterface")) {
                break;
            }
            
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 再次检查是否是 endinterface（在跳过注释后）
            if (this.checkValue("endinterface")) {
                break;
            }

            // 检查不合法组合：interface 中不允许 stub method
            if (this.checkValue("stub")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    const stubToken = this.lexer.current();
                    if (stubToken) {
                        this.error(
                            `Interface '${name?.toString() || "unknown"}' cannot contain stub methods. Stub methods are only allowed in struct declarations.`,
                            stubToken.start,
                            stubToken.end,
                            `Remove 'stub' keyword or move this method to a struct that implements this interface.`
                        );
                    }
                    // 跳过 stub method，继续解析
                    this.lexer.next(); // 消费 stub
                    if (this.checkValue("method")) {
                        this.lexer.next(); // 消费 method
                        // 尝试跳过整个 method 声明
                        while (!this.isAtEnd() && !this.checkValue("endinterface") && !this.checkValue("endmethod")) {
                            this.lexer.next();
                        }
                        if (this.checkValue("endmethod")) {
                            this.lexer.next();
                        }
                    }
                    continue;
                }
            }

            // 检查不合法组合：interface 中不允许 private method
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    const privateToken = this.lexer.current();
                    if (privateToken) {
                        this.error(
                            `Interface '${name?.toString() || "unknown"}' cannot contain private methods. Interface methods must be public.`,
                            privateToken.start,
                            privateToken.end,
                            `Remove 'private' keyword. Interface methods are public by default.`
                        );
                    }
                    // 跳过 private method，继续解析
                    this.lexer.next(); // 消费 private
                    if (this.checkValue("method")) {
                        this.lexer.next(); // 消费 method
                        // 尝试跳过整个 method 声明
                        while (!this.isAtEnd() && !this.checkValue("endinterface") && !this.checkValue("endmethod")) {
                            this.lexer.next();
                        }
                        if (this.checkValue("endmethod")) {
                            this.lexer.next();
                        }
                    }
                    continue;
                }
            }

            const member = this.parseStatement();
            if (member) {
                // 检查 member 是否是 MethodDeclaration，如果是，检查是否有不合法修饰符
                if (member instanceof MethodDeclaration) {
                    if (member.isStub) {
                        const memberStart = member.start || { line: 0, position: 0 };
                        this.error(`Interface '${name?.toString() || "unknown"}' cannot contain stub methods. Stub methods are only allowed in struct declarations.`, memberStart, member.end || memberStart);
                    }
                }
                members.push(member);
            } else {
                // 如果无法解析，检查是否是 endinterface
                if (this.checkValue("endinterface")) {
                    break;
                }
                if (!this.isAtEnd()) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endinterface
        let endPos = startPos;
        if (this.checkValue("endinterface")) {
            const endinterfaceToken = this.lexer.current();
            if (endinterfaceToken) {
                endPos = endinterfaceToken.end; // 保存 endinterface 的位置
            }
            this.lexer.next();
        } else {
            const interfaceName = name?.toString() || "unknown";
            const currentToken = this.lexer.current();
            if (currentToken) {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed interface '${interfaceName}'. Expected 'endinterface' to close the interface declaration that started at line ${startPos.line + 1}.`,
                    currentToken.start,
                    currentToken.end,
                    `Add 'endinterface' before '${currentToken.value || "this token"}' to close the interface declaration.`
                );
                // 尝试同步到下一个同步点
                this.synchronize();
                // 同步后，使用当前 token 的位置作为 endPos
                const syncToken = this.lexer.current();
                if (syncToken) {
                    endPos = syncToken.start; // 使用同步点的开始位置
                }
            } else {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed interface '${interfaceName}'. Expected 'endinterface' to close the interface declaration that started at line ${startPos.line + 1}. Reached end of file.`,
                    startPos,
                    endPos,
                    `Add 'endinterface' at the end of the interface declaration to close it.`
                );
            }
        }

        return new InterfaceDeclaration({
            name,
            members,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析模块声明
     */
    private parseModule(): ModuleDeclaration | null {
        const startToken = this.consumeValue("module", "Expected 'module'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析模块名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            // 检查重复声明
            this.checkDuplicateDeclaration(nameToken.value, "module", nameToken.start);
            this.lexer.next();
        }

        // 解析模块成员
        const members: Statement[] = [];
        while (!this.isAtEnd() && !this.checkValue("endmodule")) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 尝试解析为 implement 语句（模块内部可以 implement optional 其他模块）
            if (this.checkValue("implement")) {
                const implementStmt = this.parseImplementStatement();
                if (implementStmt) {
                    members.push(implementStmt);
                    continue;
                }
            }

            // 再次检查是否是 endmodule（在尝试解析 implement 后）
            if (this.checkValue("endmodule")) {
                break;
            }

            // 尝试解析为 method 声明（在 module 中，method 可能包含 static 关键字，也支持 stub method）
            if (this.checkValue("method") || (this.checkValue("stub") && this.lexer.peek()?.value?.toLowerCase() === "method")) {
                const member = this.parseMethod();
                if (member) {
                    members.push(member);
                    continue;
                }
            } else if (this.checkValue("static")) {
                // 检查是否是 static method 或 static stub method（而不是 static if）
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    // 消费 static 关键字，然后解析 method
                    this.lexer.next();
                    const member = this.parseMethod();
                    if (member) {
                        // parseMethod 已经检查了 static，但我们已经消费了，所以需要手动设置
                        member.isStatic = true;
                        members.push(member);
                        continue;
                    }
                } else if (peekToken && peekToken.value?.toLowerCase() === "stub") {
                    // 检查 static stub method：先消费 static，然后解析 stub method
                    this.lexer.next(); // 消费 static
                    const member = this.parseMethod();
                    if (member) {
                        member.isStatic = true;
                        members.push(member);
                        continue;
                    }
                }
            }

            // 再次检查是否是 endmodule（在尝试解析 method 后）
            if (this.checkValue("endmodule")) {
                break;
            }

            const member = this.parseStatement();
            if (member) {
                members.push(member);
            } else {
                if (!this.isAtEnd() && !this.checkValue("endmodule")) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endmodule
        let endPos = startPos;
        if (this.checkValue("endmodule")) {
            const endmoduleToken = this.lexer.current();
            if (endmoduleToken) {
                endPos = endmoduleToken.end; // 保存 endmodule 的位置
            }
            this.lexer.next();
        } else {
            const moduleName = name?.toString() || "unknown";
            const currentToken = this.lexer.current();
            if (currentToken) {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed module '${moduleName}'. Expected 'endmodule' to close the module declaration that started at line ${startPos.line + 1}.`,
                    currentToken.start,
                    currentToken.end,
                    `Add 'endmodule' before '${currentToken.value || "this token"}' to close the module declaration.`
                );
                // 尝试同步到下一个同步点
                this.synchronize();
                // 同步后，使用当前 token 的位置作为 endPos
                const syncToken = this.lexer.current();
                if (syncToken) {
                    endPos = syncToken.start; // 使用同步点的开始位置
                }
            } else {
                // 使用最后一个成员的位置作为 endPos（如果存在）
                if (members.length > 0) {
                    const lastMember = members[members.length - 1];
                    if (lastMember.end) {
                        endPos = lastMember.end;
                    }
                }
                this.error(
                    `Unclosed module '${moduleName}'. Expected 'endmodule' to close the module declaration that started at line ${startPos.line + 1}. Reached end of file.`,
                    startPos,
                    endPos,
                    `Add 'endmodule' at the end of the module declaration to close it.`
                );
            }
        }

        return new ModuleDeclaration({
            name,
            members,
            implementsTypes: [],
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 implement 语句
     * implement [optional] ModuleName
     */
    private parseImplementStatement(): ImplementStatement | null {
        const startToken = this.consumeValue("implement", "Expected 'implement'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 检查是否有 optional 关键字
        let isOptional = false;
        if (this.checkValue("optional")) {
            isOptional = true;
            this.lexer.next();
        }

        // 解析模块名
        const moduleNameToken = this.lexer.current();
        if (!moduleNameToken || moduleNameToken.type !== TokenType.Identifier) {
            this.error("Expected module name after 'implement'");
            return null;
        }

        const moduleName = new Identifier(moduleNameToken.value, moduleNameToken.start, moduleNameToken.end);
        this.lexer.next();

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new ImplementStatement({
            moduleName,
            isOptional,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 delegate 声明
     * [private|public] delegate TypeName memberName
     */
    private parseDelegateDeclaration(isPrivate: boolean = false): DelegateDeclaration | null {
        const startToken = this.consumeValue("delegate", "Expected 'delegate'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析委托类型
        const typeToken = this.lexer.current();
        if (!typeToken || typeToken.type !== TokenType.Identifier) {
            this.error("Expected type name after 'delegate'");
            return null;
        }

        const delegateType = new Identifier(typeToken.value, typeToken.start, typeToken.end);
        this.lexer.next();

        // 解析成员名
        const nameToken = this.lexer.current();
        if (!nameToken || nameToken.type !== TokenType.Identifier) {
            this.error("Expected member name after delegate type");
            return null;
        }

        const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
        this.lexer.next();

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new DelegateDeclaration({
            delegateType,
            name,
            isPrivate,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析库声明
     */
    private parseLibrary(): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken) return null;

        const isLibraryOnce = this.checkValue("library_once");
        this.lexer.next(); // 消费 library 或 library_once

        const startPos = startToken.start;

        // 解析库名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next();
        }

        // 解析 initializer（可选）
        let initializer: Identifier | null = null;
        if (this.checkValue("initializer")) {
            this.lexer.next(); // 消费 initializer
            const initToken = this.lexer.current();
            if (initToken && initToken.type === TokenType.Identifier) {
                initializer = new Identifier(initToken.value, initToken.start, initToken.end);
                this.lexer.next();
            } else {
                this.error("Expected function name after 'initializer'");
            }
        }

        // 解析依赖关系：requires/needs/uses（可选，可以多个，用逗号分隔）
        const dependencies: Identifier[] = [];
        const optionalDependencies: Set<string> = new Set();
        
        // 支持 requires/needs/uses，它们功能相同
        while (this.checkValue("requires") || this.checkValue("needs") || this.checkValue("uses")) {
            this.lexer.next(); // 消费 requires/needs/uses
            
            // 解析依赖列表（用逗号分隔）
            let firstDep = true;
            while (true) {
                // 检查是否有 optional 关键字
                let isOptional = false;
                if (this.checkValue("optional")) {
                    isOptional = true;
                    this.lexer.next(); // 消费 optional
                }
                
                const depToken = this.lexer.current();
                if (depToken && depToken.type === TokenType.Identifier) {
                    const dep = new Identifier(depToken.value, depToken.start, depToken.end);
                    dependencies.push(dep);
                    if (isOptional) {
                        optionalDependencies.add(dep.toString());
                    }
                    this.lexer.next();
                } else {
                    if (firstDep) {
                        this.error("Expected library name after 'requires'/'needs'/'uses'");
                    }
                    break;
                }
                
                // 检查是否有逗号继续
                if (this.check(TokenType.Comma)) {
                    this.lexer.next(); // 消费逗号
                    firstDep = false;
                } else {
                    break;
                }
            }
        }

        // 解析库内容
        const statements: Statement[] = [];
        while (!this.isAtEnd() && !this.checkValue("endlibrary")) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                if (!this.isAtEnd() && !this.checkValue("endlibrary")) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endlibrary
        let endPos = startPos;
        if (this.checkValue("endlibrary")) {
            const endlibraryToken = this.lexer.current();
            if (endlibraryToken) {
                endPos = endlibraryToken.end; // 保存 endlibrary 的位置
            }
            this.lexer.next();
        } else {
            // 如果没有 endlibrary，使用最后一个成员的位置
            if (statements.length > 0) {
                const lastStmt = statements[statements.length - 1];
                if (lastStmt.end) {
                    endPos = lastStmt.end;
                }
            }
        }

        // 返回 LibraryDeclaration
        return new LibraryDeclaration({
            name,
            members: statements,
            dependencies,
            initializer,
            isLibraryOnce,
            optionalDependencies,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析作用域声明
     */
    private parseScope(): Statement | null {
        const startToken = this.consumeValue("scope", "Expected 'scope'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析作用域名
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken && nameToken.type === TokenType.Identifier) {
            name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next();
        }

        // 解析 initializer（可选，scope 也支持 initializer）
        let initializer: Identifier | null = null;
        if (this.checkValue("initializer")) {
            this.lexer.next(); // 消费 initializer
            const initToken = this.lexer.current();
            if (initToken && initToken.type === TokenType.Identifier) {
                initializer = new Identifier(initToken.value, initToken.start, initToken.end);
                this.lexer.next();
            } else {
                this.error("Expected function name after 'initializer'");
            }
        }

        // 解析作用域内容
        const statements: Statement[] = [];
        while (!this.isAtEnd() && !this.checkValue("endscope")) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                if (!this.isAtEnd() && !this.checkValue("endscope")) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endscope
        let endPos = startPos;
        if (this.checkValue("endscope")) {
            const endscopeToken = this.lexer.current();
            if (endscopeToken) {
                endPos = endscopeToken.end; // 保存 endscope 的位置
            }
            this.lexer.next();
        } else {
            // 如果没有 endscope，使用最后一个成员的位置
            if (statements.length > 0) {
                const lastStmt = statements[statements.length - 1];
                if (lastStmt.end) {
                    endPos = lastStmt.end;
                }
            }
        }

        // 返回 ScopeDeclaration
        return new ScopeDeclaration({
            name,
            members: statements,
            initializer,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 Hook 语句
     * 语法：hook FunctionName HookFunctionName
     * 或：hook FunctionName StructName.MethodName
     */
    private parseHook(): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken) return null;

        // 消费 hook 关键字
        if (!this.checkValue("hook")) {
            return null;
        }
        this.lexer.next();

        const startPos = startToken.start;

        // 解析被钩住的函数名（第一个标识符）
        const targetToken = this.lexer.current();
        if (!targetToken || targetToken.type !== TokenType.Identifier) {
            this.error("Expected function name after 'hook'");
            return null;
        }
        const targetFunction = new Identifier(targetToken.value, targetToken.start, targetToken.end);
        this.lexer.next();

        // 解析钩子函数名（第二个标识符或 StructName.MethodName）
        const hookToken = this.lexer.current();
        if (!hookToken || hookToken.type !== TokenType.Identifier) {
            this.error("Expected hook function name after target function name");
            return null;
        }
        
        // 检查是否是 StructName.MethodName 格式
        const hookName = hookToken.value;
        this.lexer.next();
        
        // 检查下一个 token 是否是点号
        if (this.check(TokenType.Dot)) {
            // 这是 StructName.MethodName 格式
            this.lexer.next(); // 消费点号
            
            const methodToken = this.lexer.current();
            if (!methodToken || methodToken.type !== TokenType.Identifier) {
                this.error("Expected method name after '.' in hook statement");
                return null;
            }
            
            const hookStruct = new Identifier(hookName, hookToken.start, hookToken.end);
            const hookMethod = new Identifier(methodToken.value, methodToken.start, methodToken.end);
            this.lexer.next();
            
            const endToken = this.lexer.current();
            const endPos = endToken?.end || methodToken.end;
            
            return new HookStatement({
                targetFunction,
                hookStruct,
                hookMethod,
                start: startPos,
                end: endPos
            });
        } else {
            // 这是普通函数名格式
            const hookFunction = new Identifier(hookName, hookToken.start, hookToken.end);
            const endToken = this.lexer.current();
            const endPos = endToken?.end || hookToken.end;
            
            return new HookStatement({
                targetFunction,
                hookFunction,
                start: startPos,
                end: endPos
            });
        }
    }

    /**
     * 解析 Inject 语句
     * //! inject main/config ... //! endinject
     * 注意：由于这是预处理器指令，内容会在预处理阶段处理
     * 这里我们只识别指令的开始和结束，内容作为原始字符串存储
     */
    private parseInject(injectType: "main" | "config"): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken) return null;
        
        const startPos = startToken.start;
        this.lexer.next(); // 消费 //! inject 行
        
        // 收集注入内容，直到遇到 //! endinject
        const contentParts: string[] = [];
        let endPos = startPos;
        let foundEnd = false;
        let lastLine = startPos.line;
        
        while (!this.isAtEnd()) {
            const token = this.lexer.current();
            if (!token) break;
            
            // 检查是否是 //! endinject
            if (this.isComment()) {
                const commentValue = token.value || "";
                if (/^\s*\/\/!\s*endinject\s*$/i.test(commentValue)) {
                    endPos = token.end;
                    this.lexer.next(); // 消费 //! endinject
                    foundEnd = true;
                    break;
                }
            }
            
            // 收集当前 token 的值
            // 如果 token 跨越了多行，需要添加换行符
            const tokenLine = token.start.line;
            if (tokenLine > lastLine) {
                // 添加换行符（每行一个）
                const lineDiff = tokenLine - lastLine;
                for (let i = 0; i < lineDiff; i++) {
                    contentParts.push("\n");
                }
            } else if (tokenLine === lastLine && contentParts.length > 0 && !contentParts[contentParts.length - 1].endsWith("\n")) {
                // 同一行，如果上一个 token 不是换行符，可能需要添加空格
                // 但为了简化，我们假设 token 值本身已经包含了必要的空格
                // 这里不添加空格，因为某些 token（如标识符）之间可能需要空格，但 lexer 可能已经处理了
            }
            
            const tokenValue = token.value || "";
            if (tokenValue) {
                contentParts.push(tokenValue);
            }
            lastLine = token.end.line;
            
            this.lexer.next();
        }
        
        if (!foundEnd) {
            this.error(
                `Unclosed //! inject ${injectType} block. Expected //! endinject to close the inject block that started at line ${startPos.line + 1}.`,
                startPos,
                endPos,
                `Add '//! endinject' to close the inject block.`
            );
        }
        
        // 合并内容，移除末尾的换行符（如果有）
        let content = contentParts.join("");
        // 移除末尾的换行符
        while (content.endsWith("\n")) {
            content = content.slice(0, -1);
        }
        
        return new InjectStatement({
            injectType,
            content,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析文本宏定义
     * //! textmacro NAME [takes param1, param2]
     * ... body ...
     * //! endtextmacro
     */
    private parseTextMacro(): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken || startToken.type !== TokenType.TextMacroDirective) {
            return null;
        }
        
        const startPos = startToken.start;
        const directiveValue = startToken.value || "";
        
        // 解析 textmacro 指令：//! textmacro NAME [takes param1, param2]
        // 移除开头的空白
        const trimmed = directiveValue.trim();
        
        // 匹配：textmacro NAME [takes param1, param2]
        const textMacroMatch = trimmed.match(/^textmacro\s+(\w+)(?:\s+takes\s+([^]*))?$/i);
        if (!textMacroMatch) {
            this.error(
                "Malformed //! textmacro syntax",
                startPos,
                startToken.end,
                "Expected: //! textmacro <name> [takes param1, param2, ...]"
            );
            this.lexer.next();
            return null;
        }
        
        const name = textMacroMatch[1];
        const takesStr = textMacroMatch[2] || "";
        
        // 解析参数列表
        const parameters: string[] = [];
        if (takesStr.trim()) {
            // 分割参数（按逗号分割）
            const paramParts = takesStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
            parameters.push(...paramParts);
        }
        
        this.lexer.next(); // 消费 //! textmacro 行
        
        // 收集 body 内容，直到遇到 //! endtextmacro
        // 注意：由于已经进行了词法分析，我们需要收集 token 并重建代码行
        // 为了简化，我们按行收集 token，然后重建每行的内容
        const bodyLines: string[] = [];
        let endPos = startPos;
        let foundEnd = false;
        let lastLineNumber = startPos.line;
        
        while (!this.isAtEnd()) {
            const token = this.lexer.current();
            if (!token) break;
            
            // 检查是否是 //! endtextmacro
            if (this.isTextMacroDirective()) {
                const directiveValue = token.value || "";
                if (/^\s*endtextmacro\b/i.test(directiveValue)) {
                    endPos = token.end;
                    this.lexer.next(); // 消费 //! endtextmacro
                    foundEnd = true;
                    break;
                }
            }
            
            const tokenLine = token.start.line;
            
            // 如果跳过了行，添加空行
            if (tokenLine > lastLineNumber + 1) {
                for (let i = lastLineNumber + 1; i < tokenLine; i++) {
                    bodyLines.push('');
                }
            }
            
            // 收集当前行的所有 token
            const lineTokens: IToken[] = [];
            
            // 收集同一行的所有 token
            while (!this.isAtEnd()) {
                const currentToken = this.lexer.current();
                if (!currentToken) break;
                
                if (currentToken.start.line !== tokenLine) {
                    break; // 下一行了
                }
                
                // 检查是否是 endtextmacro
                if (this.isTextMacroDirective()) {
                    const dirValue = currentToken.value || "";
                    if (/^\s*endtextmacro\b/i.test(dirValue)) {
                        break; // 遇到 endtextmacro，停止收集
                    }
                }
                
                lineTokens.push(currentToken);
                this.lexer.next();
            }
            
            // 重建行内容
            if (lineTokens.length > 0) {
                // 尝试重建原始行：根据 token 的位置和值重建
                // 简化：使用 token 值，在适当位置添加空格
                const parts: string[] = [];
                let lastEndPos = lineTokens[0].start.position;
                
                for (const t of lineTokens) {
                    // 如果 token 之间有间隙，添加空格
                    if (t.start.position > lastEndPos) {
                        parts.push(' '.repeat(t.start.position - lastEndPos));
                    }
                    parts.push(t.value);
                    lastEndPos = t.end.position;
                }
                
                const lineContent = parts.join('').trimEnd();
                bodyLines.push(lineContent);
            } else {
                bodyLines.push(''); // 空行
            }
            
            lastLineNumber = tokenLine;
        }
        
        if (!foundEnd) {
            this.error(
                `Unclosed //! textmacro block. Expected //! endtextmacro to close the textmacro that started at line ${startPos.line + 1}.`,
                startPos,
                endPos,
                `Add '//! endtextmacro' to close the textmacro block.`
            );
        }
        
        return new TextMacroStatement({
            name,
            parameters,
            body: bodyLines,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析运行文本宏
     * //! runtextmacro [optional] NAME(param1, param2)
     */
    private parseRunTextMacro(): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken || startToken.type !== TokenType.TextMacroDirective) {
            return null;
        }
        
        const startPos = startToken.start;
        const endPos = startToken.end;
        const directiveValue = startToken.value || "";
        
        // 解析 runtextmacro 指令：//! runtextmacro [optional] NAME(param1, param2)
        const trimmed = directiveValue.trim();
        
        // 匹配：runtextmacro [optional] NAME [(param1, param2, ...)]
        const runTextMacroMatch = trimmed.match(/^runtextmacro(?:\s+(optional))?(?:\s+(\w+))?(?:\s*\(([^)]*)\))?$/i);
        if (!runTextMacroMatch) {
            this.error(
                "Malformed //! runtextmacro syntax",
                startPos,
                endPos,
                "Expected: //! runtextmacro [optional] <name>(<params>)"
            );
            this.lexer.next();
            return null;
        }
        
        const optional = runTextMacroMatch[1] === "optional";
        const name = runTextMacroMatch[2] || "";
        const paramsStr = runTextMacroMatch[3] || "";
        
        if (!name) {
            this.error(
                "runtextmacro name not declared",
                startPos,
                endPos,
                "Provide a name for runtextmacro"
            );
            this.lexer.next();
            return null;
        }
        
        // 解析参数列表
        const parameters: string[] = [];
        if (paramsStr.trim()) {
            // 处理字符串参数和普通参数
            // 参数可能是字符串字面量（带引号）或普通标识符/值
            let current = 0;
            const len = paramsStr.length;
            
            while (current < len) {
                // 跳过空白
                while (current < len && /\s/.test(paramsStr[current])) {
                    current++;
                }
                if (current >= len) break;
                
                // 检查是否是字符串
                if (paramsStr[current] === '"') {
                    const start = current;
                    current++; // 跳过开始引号
                    // 查找结束引号
                    while (current < len && paramsStr[current] !== '"') {
                        if (paramsStr[current] === '\\' && current + 1 < len) {
                            current += 2; // 跳过转义字符
                        } else {
                            current++;
                        }
                    }
                    if (current < len) {
                        const stringContent = paramsStr.substring(start + 1, current);
                        parameters.push(stringContent);
                        current++; // 跳过结束引号
                    }
                } else {
                    // 非字符串参数，按逗号分割
                    const commaIndex = paramsStr.indexOf(',', current);
                    const endIndex = commaIndex === -1 ? len : commaIndex;
                    const param = paramsStr.substring(current, endIndex).trim();
                    if (param) {
                        parameters.push(param);
                    }
                    current = endIndex + 1;
                }
                
                // 跳过逗号后的空白
                while (current < len && /\s/.test(paramsStr[current])) {
                    current++;
                }
                if (current < len && paramsStr[current] === ',') {
                    current++;
                }
            }
        }
        
        this.lexer.next(); // 消费 //! runtextmacro 行
        
        // 如果有 TextMacroExpander，尝试展开宏
        if (this.textMacroExpander) {
            try {
                const expandedLines = this.textMacroExpander.expand(
                    name,
                    parameters,
                    optional,
                    startPos
                );
                
                // 如果可选宏不存在，返回 null（跳过）
                if (expandedLines.length === 0 && optional) {
                    return null;
                }
                
                // 将展开后的代码解析为 Statement
                // 方案：创建一个包含展开代码的 BlockStatement
                const expandedStatements: Statement[] = [];
                
                // 为每行展开的代码创建临时 parser 解析
                // 注意：我们需要将多行代码合并，然后解析
                const expandedContent = expandedLines.join('\n');
                if (expandedContent.trim()) {
                    // 创建临时 parser 解析展开后的代码
                    const expandedParser = new Parser(expandedContent, this.filePath, this.textMacroExpander);
                    const parsedBlock = expandedParser.parse();
                    
                    // 将解析后的语句添加到列表中
                    if (parsedBlock && parsedBlock.body) {
                        expandedStatements.push(...parsedBlock.body);
                    }
                    
                    // 合并错误
                    if (expandedParser.errors.errors.length > 0) {
                        this.errors.errors.push(...expandedParser.errors.errors);
                    }
                    if (expandedParser.errors.warnings.length > 0) {
                        this.errors.warnings.push(...expandedParser.errors.warnings);
                    }
                }
                
                // 如果成功展开，返回包含展开语句的 BlockStatement
                if (expandedStatements.length > 0) {
                    return new BlockStatement(expandedStatements, startPos, endPos);
                } else {
                    // 展开后没有语句，返回 null
                    return null;
                }
            } catch (error) {
                // 展开失败，报告错误
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.error(
                    errorMessage,
                    startPos,
                    endPos,
                    "Check if the textmacro is defined and parameters match."
                );
                // 如果不可选，返回 RunTextMacroStatement 以便后续处理
                if (!optional) {
                    return new RunTextMacroStatement({
                        name,
                        parameters,
                        optional,
                        start: startPos,
                        end: endPos
                    });
                }
                return null;
            }
        }
        
        // 没有 TextMacroExpander，返回 RunTextMacroStatement（向后兼容）
        return new RunTextMacroStatement({
            name,
            parameters,
            optional,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析全局变量声明
     */
    private parseGlobals(): Statement | null {
        const startToken = this.consume(TokenType.keywordGlobals, "Expected 'globals'");
        if (!startToken) return null;

        const startPos = startToken.start;
        const statements: Statement[] = [];

        // 解析全局变量
        while (!this.isAtEnd() && !this.check(TokenType.keywordEndglobals)) {
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 检查是否有 private 或 public 关键字（用于全局变量）
            // 注意：private/public 在 scope 或 library 中的 globals 块中使用
            let isPrivateVar = false;
            let isPublicVar = false;
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                // 检查下一个 token 是否是类型关键字或标识符
                if (peekToken && (
                    peekToken.type === TokenType.TypeInteger ||
                    peekToken.type === TokenType.TypeReal ||
                    peekToken.type === TokenType.TypeString ||
                    peekToken.type === TokenType.TypeBoolean ||
                    peekToken.type === TokenType.TypeCode ||
                    peekToken.type === TokenType.TypeHandle ||
                    peekToken.type === TokenType.TypeKey ||
                    peekToken.type === TokenType.Identifier ||
                    peekToken.value?.toLowerCase() === "constant"
                )) {
                    isPrivateVar = true;
                    this.lexer.next(); // 消费 private
                }
            } else if (this.checkValue("public")) {
                const peekToken = this.lexer.peek();
                // 检查下一个 token 是否是类型关键字或标识符
                if (peekToken && (
                    peekToken.type === TokenType.TypeInteger ||
                    peekToken.type === TokenType.TypeReal ||
                    peekToken.type === TokenType.TypeString ||
                    peekToken.type === TokenType.TypeBoolean ||
                    peekToken.type === TokenType.TypeCode ||
                    peekToken.type === TokenType.TypeHandle ||
                    peekToken.type === TokenType.TypeKey ||
                    peekToken.type === TokenType.Identifier ||
                    peekToken.value?.toLowerCase() === "constant"
                )) {
                    isPublicVar = true;
                    this.lexer.next(); // 消费 public
                }
            }

            // 尝试解析变量声明
            const varDecl = this.parseVariableDeclaration(false);
            if (varDecl) {
                // 注意：private/public 修饰符在 VariableDeclaration 中没有字段存储
                // 这些修饰符在编译时会被处理（重命名等），所以这里只解析，不存储
                statements.push(varDecl);
            } else {
                if (!this.isAtEnd() && !this.check(TokenType.keywordEndglobals)) {
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endglobals
        let endPos = startPos;
        if (this.check(TokenType.keywordEndglobals)) {
            const endglobalsToken = this.lexer.current();
            if (endglobalsToken) {
                endPos = endglobalsToken.end; // 保存 endglobals 的位置
            }
            this.lexer.next();
        } else {
            // 如果没有 endglobals，使用最后一个语句的位置
            if (statements.length > 0) {
                const lastStmt = statements[statements.length - 1];
                if (lastStmt.end) {
                    endPos = lastStmt.end;
                }
            }
        }

        return new BlockStatement(statements, startPos, endPos);
    }

    /**
     * 解析变量声明
     * 支持语法：
     * - type name
     * - type name = value
     * - constant type name
     * - static type name (struct 成员)
     * - readonly type name (struct 成员，只读)
     * - type array name
     * - type array name[100] (数组成员)
     * - static type array name[100] (静态数组成员)
     */
    private parseVariableDeclaration(isLocal: boolean, isReadonly: boolean = false): VariableDeclaration | null {
        const startToken = this.lexer.current();
        if (!startToken) return null;

        // 检查是否是 endstruct 或 endinterface（避免被误解析为变量）
        // 也检查是否是 implement（避免被误解析为变量声明）
        if (this.checkValue("endstruct") || this.checkValue("endinterface") || 
            this.checkValue("endmethod") || this.checkValue("endfunction") ||
            this.checkValue("endglobals") || this.checkValue("endlibrary") ||
            this.checkValue("endscope") || this.checkValue("endmodule") ||
            this.checkValue("implement")) {
            return null;
        }

        const startPos = startToken.start;

        // 检查是否有 static 关键字（用于 struct 成员）
        let isStatic = false;
        if (this.checkValue("static")) {
            isStatic = true;
            this.lexer.next();
        }

        // 检查是否有 constant 关键字
        let isConstant = false;
        if (this.check(TokenType.keywordConstant)) {
            isConstant = true;
            this.lexer.next();
        }

        // 解析类型（可以是基本类型关键字或自定义类型标识符）
        const typeToken = this.lexer.current();
        if (!typeToken) {
            return null;
        }
        
        // 再次检查是否是结束关键字（在消费 static/constant 后）
        // 也检查是否是 implement（避免被误解析为变量声明）
        if (this.checkValue("endstruct") || this.checkValue("endinterface") || 
            this.checkValue("endmethod") || this.checkValue("endfunction") ||
            this.checkValue("endglobals") || this.checkValue("endlibrary") ||
            this.checkValue("endscope") || this.checkValue("endmodule") ||
            this.checkValue("implement")) {
            return null;
        }
        
        // 检查是否是有效的类型：基本类型关键字、标识符或 thistype
        const isBasicType = typeToken.type === TokenType.TypeInteger ||
                           typeToken.type === TokenType.TypeReal ||
                           typeToken.type === TokenType.TypeString ||
                           typeToken.type === TokenType.TypeBoolean ||
                           typeToken.type === TokenType.TypeCode ||
                           typeToken.type === TokenType.TypeHandle ||
                           typeToken.type === TokenType.TypeKey;
        const isIdentifier = typeToken.type === TokenType.Identifier;
        const isThistype = this.checkValue("thistype");
        
        if (!isBasicType && !isIdentifier && !isThistype) {
            return null;
        }
        
        // 检查类型名是否是结束关键字
        if (this.checkValue("endstruct") || this.checkValue("endinterface") || 
            this.checkValue("endmethod") || this.checkValue("endfunction") ||
            this.checkValue("endglobals") || this.checkValue("endlibrary") ||
            this.checkValue("endscope") || this.checkValue("endmodule")) {
            return null;
        }
        
        // 如果是 thistype，创建 ThistypeExpression，否则创建 Identifier
        let type: Identifier | ThistypeExpression;
        if (isThistype) {
            type = new ThistypeExpression(typeToken.start, typeToken.end);
            this.lexer.next();
        } else {
            type = new Identifier(typeToken.value, typeToken.start, typeToken.end);
            this.lexer.next();
        }

        // 检查是否有 array 关键字
        let isArray = false;
        if (this.checkValue("array")) {
            // key 类型不能是数组（key 是自动生成唯一整数的特殊类型）
            if (typeToken.type === TokenType.TypeKey) {
                this.error(
                    "Key type cannot be an array. Key variables automatically generate unique integer constants and cannot be declared as arrays.",
                    typeToken.start,
                    typeToken.end,
                    "Remove 'array' keyword. Key variables are automatically generated as integer constants and cannot be arrays."
                );
                return null;
            }
            isArray = true;
            this.lexer.next();
        }

        // 再次检查是否是结束关键字（在消费 array 后）
        if (this.checkValue("endstruct") || this.checkValue("endinterface") || 
            this.checkValue("endmethod") || this.checkValue("endfunction") ||
            this.checkValue("endglobals") || this.checkValue("endlibrary") ||
            this.checkValue("endscope") || this.checkValue("endmodule")) {
            return null;
        }

        // 解析变量名
        const nameToken = this.lexer.current();
        if (!nameToken || nameToken.type !== TokenType.Identifier) {
            return null;
        }
        
        // 检查变量名是否是结束关键字
        // 也检查是否是 implement（避免被误解析为变量声明）
        if (this.checkValue("endstruct") || this.checkValue("endinterface") || 
            this.checkValue("endmethod") || this.checkValue("endfunction") ||
            this.checkValue("endglobals") || this.checkValue("endlibrary") ||
            this.checkValue("endscope") || this.checkValue("endmodule") ||
            this.checkValue("implement")) {
            return null;
        }
        
        const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
        this.lexer.next();

        // 检查是否有数组大小：name[100]（一维数组）或 name[10][20]（二维数组）
        let arraySize: number | null = null;
        let arrayWidth: number | null = null;
        let arrayHeight: number | null = null;
        if (this.check(TokenType.LeftBracket)) {
            if (!isArray) {
                // 如果不是 array 关键字，可能是数组索引访问，这里只处理数组成员声明
                // 数组成员必须在 array 关键字后使用 [size] 语法
            } else {
                this.lexer.next(); // 消费 [
                const sizeToken = this.lexer.current();
                if (sizeToken && sizeToken.type === TokenType.IntegerLiteral) {
                    const firstSize = parseInt(sizeToken.value, 10);
                    this.lexer.next();
                    if (!this.check(TokenType.RightBracket)) {
                        this.error("Expected ']' after array size");
                        return null;
                    }
                    this.lexer.next(); // 消费 ]
                    
                    // 检查是否是二维数组：[width][height]
                    if (this.check(TokenType.LeftBracket)) {
                        // 这是二维数组
                        this.lexer.next(); // 消费第二个 [
                        const heightToken = this.lexer.current();
                        if (heightToken && heightToken.type === TokenType.IntegerLiteral) {
                            arrayWidth = firstSize;
                            arrayHeight = parseInt(heightToken.value, 10);
                            this.lexer.next();
                            if (!this.check(TokenType.RightBracket)) {
                                this.error("Expected ']' after second array dimension");
                                return null;
                            }
                            this.lexer.next(); // 消费第二个 ]
                        } else {
                            this.error("Expected integer literal for second array dimension");
                            return null;
                        }
                    } else {
                        // 这是一维数组
                        arraySize = firstSize;
                    }
                } else {
                    this.error("Expected integer literal for array size");
                    return null;
                }
            }
        }

        // 解析初始化表达式（可选）
        let initializer: Expression | null = null;
        if (this.check(TokenType.OperatorAssign)) {
            // key 类型不能有初始化值（key 是自动生成唯一整数的特殊类型）
            if (typeToken.type === TokenType.TypeKey) {
                const assignToken = this.lexer.current();
                if (assignToken) {
                    this.error(
                        "Key type variables cannot have initializers. Key variables automatically generate unique integer constants.",
                        assignToken.start,
                        assignToken.end,
                        "Remove the initializer (the '=' and value). Key variables are automatically assigned unique integer constants."
                    );
                }
                return null;
            }
            this.lexer.next();
            // 在解析表达式前，检查是否是结束关键字（避免误解析）
            if (this.isEndKeyword()) {
                // 如果遇到结束关键字，说明没有初始化表达式，回退
                // 但实际上我们已经消费了 =，所以这里应该报错或返回 null
                return null;
            }
            initializer = this.parseExpression();
        }

        // 确定结束位置：如果有初始化表达式，使用表达式的结束位置；否则使用变量名的结束位置
        let endPos = nameToken.end;
        if (initializer && initializer.end) {
            endPos = initializer.end;
        } else {
            // 检查是否有数组大小声明 [size] 或 [width][height]
            const currentToken = this.lexer.current();
            if (currentToken) {
                endPos = currentToken.start; // 使用当前 token 的开始位置（可能是下一个语句的开始）
            }
        }

        return new VariableDeclaration(
            name,
            type,
            initializer,
            isConstant,
            isLocal,
            isArray,
            arraySize,
            arrayWidth,
            arrayHeight,
            isStatic,
            isReadonly,
            startPos,
            endPos
        );
    }

    /**
     * 解析 if 语句
     * 支持语法：if condition then ... [elseif condition then ...] [else ...] endif
     */
    private parseIf(): IfStatement | null {
        return this.parseIfInternal(false);
    }

    /**
     * 解析 static if 语句
     * 支持语法：static if condition then ... [elseif condition then ...] [else ...] endif
     * 条件必须使用布尔值常量，and 操作符以及 not 操作符
     */
    private parseStaticIf(): IfStatement | null {
        return this.parseIfInternal(true);
    }

    /**
     * 解析 if 语句的内部实现（支持普通 if 和 static if）
     */
    private parseIfInternal(isStatic: boolean): IfStatement | null {
        const startToken = isStatic 
            ? this.consumeValue("static", "Expected 'static'")
            : this.consume(TokenType.KeywordIf, "Expected 'if'");
        if (!startToken) return null;

        if (isStatic) {
            // 消费 if 关键字
            this.consume(TokenType.KeywordIf, "Expected 'if' after 'static'");
        }

        const startPos = startToken.start;

        // 解析条件
        const condition = this.parseExpression();
        if (!condition) {
            this.error("Expected condition expression");
            return null;
        }

        // 对于 static if，验证条件必须是常量表达式（这里只做基本检查，实际验证需要在语义分析阶段）
        if (isStatic) {
            // TODO: 在语义分析阶段验证条件是否为常量表达式
        }

        // 解析 then
        this.consumeValue("then", "Expected 'then'");

        // 解析 then 分支
        const consequent = this.parseStatement();
        if (!consequent) {
            this.error("Expected statement after 'then'");
            return null;
        }

        // 解析 else/elseif（可选）
        let alternate: IfStatement | BlockStatement | null = null;
        
        // 跳过注释
        while (this.isComment()) {
            this.lexer.next();
        }

        // 检查 elseif 或 else
        if (this.check(TokenType.KeywordElseif)) {
            // elseif 分支：解析条件、then 和语句，然后递归处理后续的 elseif/else
            alternate = this.parseElseIfChain(isStatic);
        } else if (this.check(TokenType.KeywordElse)) {
            // else 分支
            this.lexer.next(); // 消费 else
            const elseStmt = this.parseStatement();
            if (elseStmt instanceof BlockStatement) {
                alternate = elseStmt;
            } else if (elseStmt) {
                alternate = new BlockStatement([elseStmt]);
            } else {
                this.error("Expected statement after 'else'");
            }
        }

        // 消费 endif
        if (!this.check(TokenType.keywordEndif)) {
            this.error("Expected 'endif' to close if statement");
        } else {
            this.lexer.next();
        }

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new IfStatement(condition, consequent, alternate, isStatic, startPos, endPos);
    }

    /**
     * 解析 elseif 链（支持多个连续的 elseif）
     */
    private parseElseIfChain(isStatic: boolean): IfStatement | null {
        // 消费 elseif
        this.lexer.next();
        
        // 解析条件
        const condition = this.parseExpression();
        if (!condition) {
            this.error("Expected condition expression after 'elseif'");
            return null;
        }
        
        // 解析 then
        this.consumeValue("then", "Expected 'then' after elseif condition");
        
        // 解析 then 分支
        const consequent = this.parseStatement();
        if (!consequent) {
            this.error("Expected statement after 'then' in elseif");
            return null;
        }
        
        // 递归解析后续的 elseif/else（如果有）
        let alternate: IfStatement | BlockStatement | null = null;
        
        // 跳过注释
        while (this.isComment()) {
            this.lexer.next();
        }
        
        // 检查是否还有 elseif 或 else
        if (this.check(TokenType.KeywordElseif)) {
            // 还有 elseif，递归解析
            alternate = this.parseElseIfChain(isStatic);
        } else if (this.check(TokenType.KeywordElse)) {
            // else 分支
            this.lexer.next();
            const elseStmt = this.parseStatement();
            if (elseStmt instanceof BlockStatement) {
                alternate = elseStmt;
            } else if (elseStmt) {
                alternate = new BlockStatement([elseStmt]);
            } else {
                this.error("Expected statement after 'else'");
            }
        }
        
        // 创建 elseif 的 IfStatement
        return new IfStatement(condition, consequent, alternate, isStatic);
    }

    /**
     * 解析 loop 语句
     * 
     * 语法:
     *   loop
     *       [statements]
     *   endloop
     * 
     * loop 语句用于创建循环，通常配合 exitwhen 语句使用来退出循环。
     * 循环体可以包含任意数量的语句，包括嵌套的 loop 语句。
     */
    private parseLoop(): LoopStatement | null {
        const startToken = this.consume(TokenType.keywordLoop, "Expected 'loop'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析循环体
        const statements: Statement[] = [];
        while (!this.isAtEnd() && !this.check(TokenType.keywordEndloop)) {
            // 跳过注释
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 解析语句
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析语句，尝试恢复
                // 如果已经到达 endloop 或文件末尾，则退出
                if (!this.isAtEnd() && !this.check(TokenType.keywordEndloop)) {
                    // 尝试跳过当前 token 继续解析
                    this.lexer.next();
                } else {
                    break;
                }
            }
        }

        // 消费 endloop
        const endToken = this.consume(TokenType.keywordEndloop, "Expected 'endloop' to close loop statement");
        const endPos = endToken?.end || startPos;

        const body = new BlockStatement(statements, startPos, endPos);
        return new LoopStatement(body, startPos, endPos);
    }

    /**
     * 解析 set 语句
     * 
     * 语法:
     *   set target = value
     * 
     * set 语句用于给变量赋值。目标可以是：
     * - 简单变量: set x = 10
     * - 数组元素: set arr[0] = 5
     * - 成员访问: set obj.member = value
     * - 嵌套访问: set arr[i].x = GetUnitX(unit)
     * 
     * 值可以是任意表达式：
     * - 字面量: set x = 10, set s = "hello"
     * - 表达式: set x = y + z
     * - 函数调用: set x = GetUnitX(unit)
     * - 复杂表达式: set x = (a + b) * c
     */
    private parseSet(): AssignmentStatement | null {
        const startToken = this.consume(TokenType.keywordSet, "Expected 'set'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析目标表达式（可以是标识符、数组索引、成员访问等）
        const target = this.parseExpression();
        if (!target) {
            this.error("Expected target expression after 'set'");
            return null;
        }

        // 解析 = 运算符
        this.consume(TokenType.OperatorAssign, "Expected '=' after target expression");

        // 解析值表达式
        const value = this.parseExpression();
        if (!value) {
            this.error("Expected value expression after '='");
            return null;
        }

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new AssignmentStatement(target, value, startPos, endPos);
    }

    /**
     * 解析 call 语句
     * 
     * 语法:
     *   call functionName(arg1, arg2, ...)
     *   call object.method(arg1, arg2, ...)
     * 
     * call 语句用于调用函数。函数可以是：
     * - 普通函数: call BJDebugMsg("Hello")
     * - 成员方法: call unit.destroy()
     * - 带复杂表达式的参数: call a(function temp_func1 + 2 * 3)
     */
    private parseCall(): CallStatement | null {
        const startToken = this.consume(TokenType.keywordCall, "Expected 'call'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析被调用者（可以是标识符或链式成员访问，但不包括函数调用）
        let callee: Identifier | Expression;
        
        // 解析基本表达式（标识符、成员访问等），但不包括函数调用
        const token = this.lexer.current();
        if (!token) {
            this.error("Expected function name or expression after 'call'");
            return null;
        }
        
        if (token.type === TokenType.Identifier) {
            callee = new Identifier(token.value, token.start, token.end);
            this.lexer.next();
            
            // 支持链式成员访问（如 Worker.doWork.execute）
            while (this.check(TokenType.Dot)) {
                this.lexer.next();
                const memberToken = this.lexer.current();
                if (memberToken && memberToken.type === TokenType.Identifier) {
                    const member = new Identifier(memberToken.value, memberToken.start, memberToken.end);
                    this.lexer.next();
                    callee = new BinaryExpression(
                        OperatorType.Dot,
                        callee,
                        member,
                        callee.start,
                        member.end
                    );
                } else {
                    this.error("Expected member name after '.'");
                    return null;
                }
            }
        } else {
            // 对于非标识符的情况，尝试解析表达式
            // 但需要确保不会解析函数调用
            this.error("Expected identifier for function name after 'call'");
            return null;
        }

        // 解析函数调用的参数列表
        if (!this.check(TokenType.LeftParen)) {
            this.error("Expected '(' after function name");
            return null;
        }

        const calleeStartPos = callee.start;
        this.consume(TokenType.LeftParen, "Expected '('");

        // 解析参数列表
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen)) {
            while (true) {
                const arg = this.parseExpression();
                if (!arg) {
                    const currentToken = this.lexer.current();
                    if (currentToken && currentToken.type === TokenType.RightParen) {
                        break;
                    }
                    if (currentToken && currentToken.type === TokenType.Comma) {
                        this.lexer.next();
                        continue;
                    }
                    this.error("Expected expression, ',' or ')'");
                    if (currentToken) {
                        this.lexer.next();
                        if (this.check(TokenType.RightParen)) {
                            break;
                        }
                        if (this.check(TokenType.Comma)) {
                            this.lexer.next();
                            continue;
                        }
                    }
                    break;
                }
                args.push(arg);

                if (this.check(TokenType.RightParen)) {
                    break;
                }

                this.consume(TokenType.Comma, "Expected ',' or ')'");
            }
        }

        // 消费右括号
        const endToken = this.consume(TokenType.RightParen, "Expected ')'");
        const endPos = endToken?.end || startPos;

        // 创建 CallExpression
        const callExpr = new CallExpression(callee, args, calleeStartPos, endPos);
        return new CallStatement(callExpr, startPos, endPos);
    }

    /**
     * 解析 return 语句
     * 
     * 语法:
     *   return [expression]
     * 
     * return 语句用于从函数中返回值。返回值是可选的：
     * - 无返回值: return（用于 returns nothing 的函数）
     * - 返回值: return expression（用于有返回类型的函数）
     * 
     * 返回值可以是任意表达式：
     * - 字面量: return 10, return "hello"
     * - 变量: return x
     * - 表达式: return x + y
     * - 函数调用: return GetUnitX(unit)
     * - 复杂表达式: return (a + b) * c
     * - 数组索引: return arr[0]
     * - 成员访问: return obj.member
     */
    private parseReturn(): ReturnStatement | null {
        const startToken = this.consume(TokenType.keywordReturn, "Expected 'return'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析返回值（可选）
        // 检查是否还有更多 token，且不是注释或函数结束标记
        let argument: Expression | null = null;
        if (!this.isAtEnd() && !this.isComment()) {
            const token = this.lexer.current();
            // 如果下一个 token 不是 endfunction，则尝试解析表达式
            if (token && token.type !== TokenType.KeywordEndfunction) {
                argument = this.parseExpression();
                // 如果解析失败，argument 为 null，表示无返回值
            }
        }

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new ReturnStatement(argument, startPos, endPos);
    }

    /**
     * 解析 local 语句
     */
    private parseLocal(): VariableDeclaration | null {
        const startToken = this.consume(TokenType.keywordLocal, "Expected 'local'");
        if (!startToken) return null;

        return this.parseVariableDeclaration(true);
    }

    /**
     * 解析 exitwhen 语句
     */
    private parseExitWhen(): ExitWhenStatement | null {
        const startToken = this.consume(TokenType.keywordExitwhen, "Expected 'exitwhen'");
        if (!startToken) return null;

        const startPos = startToken.start;

        // 解析条件
        const condition = this.parseExpression();
        if (!condition) {
            this.error("Expected condition expression");
            return null;
        }

        const endToken = this.lexer.current();
        const endPos = endToken?.end || startPos;

        return new ExitWhenStatement(condition, startPos, endPos);
    }

    /**
     * 解析表达式
     */
    private parseExpression(): Expression | null {
        return this.parseBinaryExpression(0);
    }

    /**
     * 解析二元表达式（带优先级和结合性）
     * 使用右递归方式，正确处理左结合和右结合运算符
     */
    private parseBinaryExpression(minPrecedence: number): Expression | null {
        let left = this.parseUnaryExpression();
        if (!left) {
            return null;
        }

        while (true) {
            const token = this.lexer.current();
            if (!token) break;

            const precedence = this.getPrecedence(token.type);
            if (precedence < minPrecedence) {
                break;
            }

            const operatorType = this.getOperatorType(token.type);
            if (!operatorType) {
                break;
            }

            // 检查运算符的结合性
            const isRightAssociative = this.isRightAssociative(token.type);
            
            // 对于右结合运算符，使用相同的优先级；对于左结合运算符，使用 precedence + 1
            const nextPrecedence = isRightAssociative ? precedence : precedence + 1;

            this.lexer.next();
            const right = this.parseBinaryExpression(nextPrecedence);
            if (!right) {
                this.error("Expected expression after operator");
                break;
            }

            left = new BinaryExpression(
                operatorType,
                left,
                right,
                left.start,
                right.end
            );
        }

        return left;
    }

    /**
     * 检查运算符是否是右结合的
     * 在 vJass 中，赋值运算符通常是右结合的
     */
    private isRightAssociative(type: TokenType): boolean {
        // 赋值运算符是右结合的：a = b = c 解析为 a = (b = c)
        return type === TokenType.OperatorAssign;
    }

    /**
     * 解析一元表达式
     */
    private parseUnaryExpression(): Expression | null {
        const token = this.lexer.current();
        if (!token) return null;

        // 处理一元运算符
        if (token.type === TokenType.OperatorMinus || 
            token.type === TokenType.OperatorLogicalNot ||
            this.checkValue("not")) {
            const operator = token.type === TokenType.OperatorLogicalNot || this.checkValue("not") 
                ? OperatorType.Not 
                : OperatorType.Minus;
            this.lexer.next();
            const operand = this.parseUnaryExpression();
            if (!operand) {
                this.error("Expected expression after unary operator");
                return null;
            }
            return new BinaryExpression(
                operator,
                new IntegerLiteral(0, token.start, token.end),
                operand,
                token.start,
                operand.end
            );
        }

        return this.parsePrimaryExpression();
    }

    /**
     * 解析基本表达式
     */
    private parsePrimaryExpression(): Expression | null {
        const token = this.lexer.current();
        if (!token) return null;

        // 字面量
        if (token.type === TokenType.IntegerLiteral) {
            this.lexer.next();
            const value = parseInt(token.value, 10);
            return new IntegerLiteral(value, token.start, token.end);
        }

        if (token.type === TokenType.RealLiteral) {
            this.lexer.next();
            const value = parseFloat(token.value);
            return new RealLiteral(value, token.start, token.end);
        }

        if (token.type === TokenType.StringLiteral) {
            this.lexer.next();
            return new StringLiteral(token.value, token.start, token.end);
        }

        if (token.type === TokenType.BooleanLiteral) {
            this.lexer.next();
            const value = token.value.toLowerCase() === "true";
            return new BooleanLiteral(value, token.start, token.end);
        }

        // 检查是否是布尔字面量（true/false）
        if (this.checkValue("true")) {
            this.lexer.next();
            return new BooleanLiteral(true, token.start, token.end);
        }

        if (this.checkValue("false")) {
            this.lexer.next();
            return new BooleanLiteral(false, token.start, token.end);
        }

        if (this.checkValue("null")) {
            this.lexer.next();
            return new NullLiteral(token.start, token.end);
        }

        // Super 表达式（super，用于调用父类方法）
        if (this.checkValue("super")) {
            const superToken = this.lexer.current();
            if (!superToken) return null;
            
            this.lexer.next(); // 消费 super
            
            // super 后面必须跟着 .methodName()
            if (!this.check(TokenType.Dot)) {
                this.error("Expected '.' after 'super'");
                return null;
            }
            
            // 解析 super.methodName
            this.lexer.next(); // 消费 .
            const methodToken = this.lexer.current();
            if (!methodToken || methodToken.type !== TokenType.Identifier) {
                this.error("Expected method name after 'super.'");
                return null;
            }
            
            const methodName = new Identifier(methodToken.value, methodToken.start, methodToken.end);
            this.lexer.next(); // 消费方法名
            
            const superExpr = new SuperExpression(superToken.start, methodToken.end);
            let expr: Expression = new BinaryExpression(
                OperatorType.Dot,
                superExpr,
                methodName,
                superToken.start,
                methodToken.end
            );
            
            // 检查是否是函数调用 super.methodName()
            if (this.check(TokenType.LeftParen)) {
                return this.parseCallExpressionWithCallee(expr);
            }
            
            return expr;
        }

        // Thistype 表达式（在结构内部等同于该结构的名称）
        if (this.checkValue("thistype")) {
            const thistypeToken = this.lexer.current();
            if (!thistypeToken) return null;
            
            this.lexer.next(); // 消费 thistype
            
            // thistype 可以作为类型使用，也可以作为表达式使用（如 thistype.allocate()）
            // 如果后面跟着 .，则解析为表达式
            if (this.check(TokenType.Dot)) {
                // 解析 thistype.methodName 或 thistype.allocate()
                this.lexer.next(); // 消费 .
                const memberToken = this.lexer.current();
                if (!memberToken || memberToken.type !== TokenType.Identifier) {
                    this.error("Expected member name after 'thistype.'");
                    return null;
                }
                
                const member = new Identifier(memberToken.value, memberToken.start, memberToken.end);
                this.lexer.next(); // 消费成员名
                
                const thistypeExpr = new ThistypeExpression(thistypeToken.start, memberToken.end);
                let expr: Expression = new BinaryExpression(
                    OperatorType.Dot,
                    thistypeExpr,
                    member,
                    thistypeToken.start,
                    memberToken.end
                );
                
                // 检查是否是函数调用 thistype.methodName()
                if (this.check(TokenType.LeftParen)) {
                    return this.parseCallExpressionWithCallee(expr);
                }
                
                return expr;
            } else {
                // thistype 单独使用，作为类型或表达式
                return new ThistypeExpression(thistypeToken.start, thistypeToken.end);
            }
        }

        // 函数表达式（function functionName，类型为 code）
        if (this.checkValue("function")) {
            const functionToken = this.lexer.current();
            if (!functionToken) return null;
            
            this.lexer.next(); // 消费 function 关键字
            
            // 解析函数名
            const nameToken = this.lexer.current();
            if (!nameToken || nameToken.type !== TokenType.Identifier) {
                this.error("Expected function name after 'function'");
                return null;
            }
            
            const functionName = new Identifier(nameToken.value, nameToken.start, nameToken.end);
            this.lexer.next(); // 消费函数名
            
            const endPos = nameToken.end;
            return new FunctionExpression(functionName, functionToken.start, endPos);
        }

        // 标识符或函数调用（但先检查是否是 super 或 thistype 关键字）
        if (token.type === TokenType.Identifier && !this.checkValue("super") && !this.checkValue("thistype")) {
            this.lexer.next();
            let expr: Expression = new Identifier(token.value, token.start, token.end);

            // 冒号操作符语法糖 a:X -> X[a]
            // 仅当当前 token 是 ':'（被识别为 Unknown，value 为 ':'）时生效
            if (this.lexer.current() && this.lexer.current()!.value === ":") {
                const colonToken = this.lexer.current()!;
                this.lexer.next(); // 消费 ':'

                const arrayToken = this.lexer.current();
                if (!arrayToken || arrayToken.type !== TokenType.Identifier) {
                    this.error("Expected array name after ':' in colon operator expression");
                    return null;
                }

                const arrayIdent = new Identifier(arrayToken.value, arrayToken.start, arrayToken.end);
                this.lexer.next(); // 消费数组名

                // 将 a:X 转换为 X[a]
                expr = new BinaryExpression(
                    OperatorType.Index,
                    arrayIdent,
                    expr,
                    arrayIdent.start,
                    expr.end
                );
            }

            // 检查是否是函数调用或类型转换
            // 类型转换语法：TypeName(expr) - 只有一个参数
            // 函数调用语法：functionName(args...) - 可以有多个参数
            // 两者语法相同，需要判断 Identifier 是否是类型名
            if (this.check(TokenType.LeftParen)) {
                // 判断是否是类型转换
                // 基本类型关键字：integer, real, string, boolean, code, handle
                const typeName = token.value.toLowerCase();
                const isBasicType = typeName === "integer" || 
                                   typeName === "real" || 
                                   typeName === "string" || 
                                   typeName === "boolean" || 
                                   typeName === "code" || 
                                   typeName === "handle";
                
                // 如果是基本类型，解析为类型转换
                if (isBasicType) {
                    return this.parseTypecastExpression(expr as Identifier);
                } else {
                    // 对于自定义类型，需要判断是类型转换还是函数调用
                    // 类型转换只有一个参数，函数调用可以有多个参数
                    // 我们通过检查参数列表来判断：
                    // 1. 先尝试解析为函数调用（更常见的情况）
                    // 2. 如果解析失败，再尝试类型转换
                    // 但实际上，为了简化，对于非基本类型，我们统一解析为函数调用
                    // 类型转换的判断留给语义分析阶段
                    return this.parseCallExpressionWithCallee(expr as Identifier);
                }
            }

            // 检查是否是数组索引访问 arr[index] 或二维数组访问 arr[i][j]
            while (this.check(TokenType.LeftBracket)) {
                this.lexer.next(); // 消费 [
                const indexExpr = this.parseExpression();
                if (!indexExpr) {
                    this.error("Expected index expression after '['");
                    return null;
                }
                if (!this.check(TokenType.RightBracket)) {
                    this.error("Expected ']' after index expression");
                    return null;
                }
                this.lexer.next(); // 消费 ]
                expr = new BinaryExpression(
                    OperatorType.Index,
                    expr,
                    indexExpr,
                    expr.start,
                    indexExpr.end
                );
                // 继续检查是否还有第二个索引（二维数组访问 arr[i][j]）
                // 如果下一个 token 是 [，继续解析
            }
            
            // 数组访问后，继续检查是否还有后续操作（如函数调用、成员访问等）
            // 检查是否是成员访问（支持链式访问，如 this.a.b.c）
            while (this.check(TokenType.Dot)) {
                this.lexer.next();
                const memberToken = this.lexer.current();
                if (!memberToken) {
                    this.error("Expected identifier after '.' for member access");
                    return null;
                }
                if (memberToken.type === TokenType.Identifier) {
                    const member = new Identifier(memberToken.value, memberToken.start, memberToken.end);
                    this.lexer.next();
                    expr = new BinaryExpression(
                        OperatorType.Dot,
                        expr,
                        member,
                        expr.start,
                        member.end
                    );
                } else {
                    this.error("Expected identifier after '.' for member access");
                    return null;
                }
            }

            // 检查成员访问后是否是数组索引（如 this.ccc.sf[0] 或 m.data[5][10]）
            while (this.check(TokenType.LeftBracket)) {
                this.lexer.next(); // 消费 [
                const indexExpr = this.parseExpression();
                if (!indexExpr) {
                    this.error("Expected index expression after '['");
                    return null;
                }
                if (!this.check(TokenType.RightBracket)) {
                    this.error("Expected ']' after index expression");
                    return null;
                }
                this.lexer.next(); // 消费 ]
                expr = new BinaryExpression(
                    OperatorType.Index,
                    expr,
                    indexExpr,
                    expr.start,
                    indexExpr.end
                );
                // 继续检查是否还有第二个索引（二维数组访问）
            }

            // 检查是否是函数调用（如 arr[0]() 或 arr[i][j]() 或 m.data[5][10]()）
            if (this.check(TokenType.LeftParen)) {
                // 如果 expr 是 BinaryExpression（成员访问或数组访问），需要特殊处理
                if (expr instanceof BinaryExpression) {
                    // 解析函数调用的参数列表
                    const startPos = expr.start;
                    this.consume(TokenType.LeftParen, "Expected '('");
                    
                    const args: Expression[] = [];
                    if (!this.check(TokenType.RightParen)) {
                        while (true) {
                            const arg = this.parseExpression();
                            if (arg) {
                                args.push(arg as Expression);
                            } else {
                                const currentToken = this.lexer.current();
                                if (currentToken) {
                                    if (currentToken!.type === TokenType.RightParen) {
                                        break;
                                    }
                                    if (currentToken!.type === TokenType.Comma) {
                                        this.lexer.next();
                                        continue;
                                    }
                                }
                                this.error("Expected expression, ',' or ')'");
                                const nextToken = this.lexer.current();
                                if (nextToken) {
                                    this.lexer.next();
                                    if (this.check(TokenType.RightParen)) {
                                        break;
                                    }
                                    if (this.check(TokenType.Comma)) {
                                        this.lexer.next();
                                        continue;
                                    }
                                }
                                break;
                            }

                            if (this.check(TokenType.RightParen)) {
                                break;
                            }

                            this.consume(TokenType.Comma, "Expected ',' or ')'");
                        }
                    }

                    const endToken = this.consume(TokenType.RightParen, "Expected ')'");
                    const endPos = endToken?.end || startPos;
                    
                    return new CallExpression(expr, args, startPos, endPos);
                } else {
                    // 如果是 Identifier，使用原来的方法
                    return this.parseCallExpressionWithCallee(expr as Identifier);
                }
            }
            
            return expr;

            return expr;
        }

        // 处理以 . 开头的成员访问（如 .str, .member）
        if (token.type === TokenType.Dot) {
            this.lexer.next();
            const member = this.parsePrimaryExpression();
            if (member instanceof Identifier) {
                // 创建一个特殊的标识符表示当前实例
                const thisIdentifier = new Identifier("this", token.start, token.start);
                return new BinaryExpression(
                    OperatorType.Dot,
                    thisIdentifier,
                    member,
                    token.start,
                    member.end
                );
            } else {
                this.error("Expected member name after '.'");
                return null;
            }
        }

        // 括号表达式
        if (token.type === TokenType.LeftParen) {
            this.lexer.next();
            const expr = this.parseExpression();
            if (!expr) {
                this.error("Expected expression");
                return null;
            }
            this.consume(TokenType.RightParen, "Expected ')'");
            return expr;
        }

        return null;
    }

    /**
     * 解析函数调用表达式
     */
    private parseCallExpression(): CallExpression | null {
        const token = this.lexer.current();
        if (!token || token.type !== TokenType.Identifier) {
            return null;
        }

        const callee = new Identifier(token.value, token.start, token.end);
        this.lexer.next();

        return this.parseCallExpressionWithCallee(callee);
    }

    /**
     * 解析类型转换表达式
     * 语法：TypeName(expr)
     * 例如：integer(x), wek(W), anarrayofdata(GetUnitUserData(u))
     */
    private parseTypecastExpression(targetType: Identifier): TypecastExpression | null {
        const startPos = targetType.start;

        // 消费左括号
        this.consume(TokenType.LeftParen, "Expected '(' after type name in typecast");

        // 解析要转换的表达式（类型转换只有一个参数）
        const expr = this.parseExpression();
        if (!expr) {
            this.error("Expected expression after '(' in typecast");
            return null;
        }

        // 消费右括号
        const endToken = this.consume(TokenType.RightParen, "Expected ')' after expression in typecast");
        const endPos = endToken?.end || startPos;

        return new TypecastExpression(targetType, expr, startPos, endPos);
    }

    /**
     * 解析函数调用表达式（已知被调用者）
     */
    private parseCallExpressionWithCallee(callee: Identifier | Expression): CallExpression | null {
        const startPos = callee.start;

        // 消费左括号
        this.consume(TokenType.LeftParen, "Expected '('");

        // 解析参数列表
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen)) {
            while (true) {
                const arg = this.parseExpression();
                if (!arg) {
                    // 如果解析失败，尝试跳过当前 token 并继续
                    const currentToken = this.lexer.current();
                    if (currentToken && currentToken.type === TokenType.RightParen) {
                        break;
                    }
                    if (currentToken && currentToken.type === TokenType.Comma) {
                        this.lexer.next();
                        continue;
                    }
                    // 如果既不是右括号也不是逗号，报告错误并尝试恢复
                    this.error("Expected expression, ',' or ')'");
                    // 尝试跳过当前 token 继续解析
                    if (currentToken) {
                        this.lexer.next();
                        if (this.check(TokenType.RightParen)) {
                            break;
                        }
                        if (this.check(TokenType.Comma)) {
                            this.lexer.next();
                            continue;
                        }
                    }
                    break;
                }
                args.push(arg);

                if (this.check(TokenType.RightParen)) {
                    break;
                }

                this.consume(TokenType.Comma, "Expected ',' or ')'");
            }
        }

        // 消费右括号
        const endToken = this.consume(TokenType.RightParen, "Expected ')'");
        const endPos = endToken?.end || startPos;

        return new CallExpression(callee, args, startPos, endPos);
    }

    /**
     * 获取运算符优先级
     */
    private getPrecedence(type: TokenType): number {
        switch (type) {
            case TokenType.OperatorLogicalOr:
                return 1;
            case TokenType.OperatorLogicalAnd:
                return 2;
            case TokenType.OperatorEqual:
            case TokenType.OperatorNotEqual:
            case TokenType.OperatorLess:
            case TokenType.OperatorLessEqual:
            case TokenType.OperatorGreater:
            case TokenType.OperatorGreaterEqual:
                return 3;
            case TokenType.OperatorPlus:
            case TokenType.OperatorMinus:
                return 4;
            case TokenType.OperatorMultiply:
            case TokenType.OperatorDivide:
            case TokenType.OperatorModulo:
                return 5;
            case TokenType.Dot:
                return 6;
            default:
                return 0;
        }
    }

    /**
     * 获取运算符类型
     */
    private getOperatorType(type: TokenType): OperatorType | null {
        switch (type) {
            case TokenType.OperatorPlus:
                return OperatorType.Plus;
            case TokenType.OperatorMinus:
                return OperatorType.Minus;
            case TokenType.OperatorMultiply:
                return OperatorType.Multiply;
            case TokenType.OperatorDivide:
                return OperatorType.Divide;
            case TokenType.OperatorModulo:
                return OperatorType.Modulo;
            case TokenType.OperatorEqual:
                return OperatorType.Equal;
            case TokenType.OperatorNotEqual:
                return OperatorType.NotEqual;
            case TokenType.OperatorLess:
                return OperatorType.Less;
            case TokenType.OperatorLessEqual:
                return OperatorType.LessEqual;
            case TokenType.OperatorGreater:
                return OperatorType.Greater;
            case TokenType.OperatorGreaterEqual:
                return OperatorType.GreaterEqual;
            case TokenType.OperatorLogicalAnd:
                return OperatorType.LogicalAnd;
            case TokenType.OperatorLogicalOr:
                return OperatorType.LogicalOr;
            case TokenType.Dot:
                return OperatorType.Dot;
            default:
                return null;
        }
    }
    
}


// 测试代码
if (typeof require !== 'undefined' && require.main === module) {
    console.log("=== vJass Parser 测试 ===\n");
    
    // 测试 1: if/elseif/else 语句
    console.log("测试 1: if/elseif/else 语句");
    const test1 = `
function testIf takes nothing returns nothing
    if true then
        call BJDebugMsg("true")
    elseif false then
        call BJDebugMsg("false")
    else
        call BJDebugMsg("else")
    endif
endfunction
    `;
    const parser1 = new Parser(test1);
    const result1 = parser1.parse();
    console.log("✓ 解析成功，语句数:", result1.body.length);
    console.log("✓ 错误数:", parser1.errors.errors.length);
    if (parser1.errors.errors.length > 0) {
        console.log("错误:", parser1.errors.errors);
    }
    
    // 测试 2: static if
    console.log("\n测试 2: static if 语句");
    const test2 = `
globals
    constant boolean DO_KILL_LIB = true
endglobals
function testStaticIf takes nothing returns nothing
    static if DO_KILL_LIB then
        call BJDebugMsg("static if true")
    else
        call BJDebugMsg("static if false")
    endif
endfunction
    `;
    const parser2 = new Parser(test2);
    const result2 = parser2.parse();
    console.log("✓ 解析成功，语句数:", result2.body.length);
    console.log("✓ 错误数:", parser2.errors.errors.length);
    
    // 测试 3: struct 继承和数组成员
    console.log("\n测试 3: struct 继承和数组成员");
    const test3 = `
struct Parent
    integer x
endstruct
struct Child extends Parent
    integer y
    integer array data[100]
    static integer array staticData[50]
endstruct
    `;
    const parser3 = new Parser(test3);
    const result3 = parser3.parse();
    console.log("✓ 解析成功，语句数:", result3.body.length);
    if (result3.body.length > 1) {
        const stmt = result3.body[1];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ Struct 名称:", stmt.name?.toString());
            console.log("✓ 继承类型:", stmt.extendsType?.toString());
            console.log("✓ 成员数:", stmt.members.length);
        }
    }
    
    // 测试 4: struct 索引空间增强
    console.log("\n测试 4: struct 索引空间增强");
    const test4 = `
struct BigStruct[10000]
    integer a
    integer b
endstruct
    `;
    const parser4 = new Parser(test4);
    const result4 = parser4.parse();
    console.log("✓ 解析成功，语句数:", result4.body.length);
    if (result4.body.length > 0) {
        const stmt = result4.body[0];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ 索引大小:", stmt.indexSize);
        }
    }
    
    // 测试 5: 数组结构
    console.log("\n测试 5: 数组结构");
    const test5 = `
struct ArrayStruct extends array [20000]
    integer a
    integer b
endstruct
    `;
    const parser5 = new Parser(test5);
    const result5 = parser5.parse();
    console.log("✓ 解析成功，语句数:", result5.body.length);
    if (result5.body.length > 0) {
        const stmt = result5.body[0];
        if (stmt instanceof StructDeclaration) {
            console.log("✓ 是数组结构:", stmt.isArrayStruct);
            console.log("✓ 数组大小:", stmt.arraySize);
        }
    }
    
    // 测试 6: 运算符重载
    console.log("\n测试 6: 运算符重载");
    const test6 = `
struct TestStruct
    string str = ""
    method operator [] takes integer i returns string
        return SubString(.str, i, i+1)
    endmethod
    method operator []= takes integer i, string ch returns nothing
        set .str = SubString(.str, 0, i) + ch + SubString(.str, i+1, StringLength(.str))
    endmethod
    method operator < takes TestStruct b returns boolean
        return StringLength(this.str) < StringLength(b.str)
    endmethod
endstruct
    `;
    const parser6 = new Parser(test6);
    const result6 = parser6.parse();
    console.log("✓ 解析成功，语句数:", result6.body.length);
    console.log("✓ 错误数:", parser6.errors.errors.length);
    
    // 测试 7: 多个 elseif
    console.log("\n测试 7: 多个 elseif");
    const test7 = `
function testMultipleElseif takes integer x returns nothing
    if x == 1 then
        call BJDebugMsg("one")
    elseif x == 2 then
        call BJDebugMsg("two")
    elseif x == 3 then
        call BJDebugMsg("three")
    else
        call BJDebugMsg("other")
    endif
endfunction
    `;
    const parser7 = new Parser(test7);
    const result7 = parser7.parse();
    console.log("✓ 解析成功，语句数:", result7.body.length);
    console.log("✓ 错误数:", parser7.errors.errors.length);
    
    // 测试 8: interface 错误检测
    console.log("\n测试 8: interface 错误检测");
    const test8 = `
interface IBuffInterface=
    method method_name takes nothing returns nothing
    endinterface
    `;
    const parser8 = new Parser(test8);
    const result8 = parser8.parse();
    console.log("✓ 解析完成");
    console.log("✓ 错误数:", parser8.errors.errors.length);
    if (parser8.errors.errors.length > 0) {
        console.log("✓ 检测到错误:", parser8.errors.errors[0].message);
    }
    
    // 测试 9: 表达式解析 - 运算符优先级和结合性
    console.log("\n测试 9: 表达式解析 - 运算符优先级和结合性");
    
    function testExpression(name: string, code: string, check: (expr: Expression | null) => boolean): boolean {
        const testCode = `function test takes nothing returns nothing\n    set x = ${code}\nendfunction`;
        const parser = new Parser(testCode);
        const result = parser.parse();
        if (result.body.length > 0) {
            const func = result.body[0];
            if (func instanceof FunctionDeclaration && func.body.body.length > 0) {
                const stmt = func.body.body[0];
                if (stmt instanceof AssignmentStatement) {
                    const expr = stmt.value;
                    const success = check(expr);
                    if (success) {
                        console.log(`✓ ${name}: ${code}`);
                        console.log(`  解析结果: ${expr?.toString()}`);
                    } else {
                        console.log(`✗ ${name}: ${code}`);
                        console.log(`  解析结果: ${expr?.toString()}`);
                    }
                    return success;
                }
            }
        }
        console.log(`✗ ${name}: 解析失败`);
        if (parser.errors.errors.length > 0) {
            console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
        }
        return false;
    }
    
    let exprPassed = 0;
    let exprFailed = 0;
    
    // 测试基本算术运算符优先级
    if (testExpression("算术优先级 1", "1 + 2 * 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.right instanceof BinaryExpression)) return false;
        return expr.right.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("算术优先级 2", "1 * 2 + 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    // 测试左结合性
    if (testExpression("左结合性 1", "1 + 2 + 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("左结合性 2", "1 - 2 - 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Minus) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Minus;
    })) exprPassed++; else exprFailed++;
    
    // 测试比较运算符
    if (testExpression("比较运算符", "1 + 2 == 3 * 4", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Equal;
    })) exprPassed++; else exprFailed++;
    
    // 测试逻辑运算符
    if (testExpression("逻辑运算符", "true && false || true", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.LogicalOr;
    })) exprPassed++; else exprFailed++;
    
    // 测试括号
    if (testExpression("括号 1", "(1 + 2) * 3", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Multiply) return false;
        if (!(expr.left instanceof BinaryExpression)) return false;
        return expr.left.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("括号 2", "1 + (2 * 3)", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        if (expr.operator !== OperatorType.Plus) return false;
        if (!(expr.right instanceof BinaryExpression)) return false;
        return expr.right.operator === OperatorType.Multiply;
    })) exprPassed++; else exprFailed++;
    
    // 测试一元运算符
    if (testExpression("一元负号", "-1 + 2", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试函数调用
    if (testExpression("函数调用", "GetUnitX(u) + GetUnitY(u)", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试成员访问
    if (testExpression("成员访问", "unit.x + unit.y", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    // 测试复杂嵌套表达式
    if (testExpression("复杂嵌套", "(a + b) * (c - d) / e", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Divide;
    })) exprPassed++; else exprFailed++;
    
    if (testExpression("复杂嵌套 2", "a == b && c != d || e < f", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.LogicalOr;
    })) exprPassed++; else exprFailed++;
    
    // 测试点运算符优先级
    if (testExpression("点运算符", "obj.member1 + obj.member2", (expr) => {
        if (!expr || !(expr instanceof BinaryExpression)) return false;
        return expr.operator === OperatorType.Plus;
    })) exprPassed++; else exprFailed++;
    
    console.log(`\n表达式测试结果: 通过 ${exprPassed}, 失败 ${exprFailed}`);
    
    // 测试 10: loop 语句
    console.log("\n测试 10: loop 语句");
    const { LoopStatement, ExitWhenStatement } = require('./vjass-ast');
    
    function testLoop(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let loopPassed = 0;
    let loopFailed = 0;
    
    // 测试基本 loop
    if (testLoop("基本 loop", `function test takes nothing returns nothing
    loop
        call BJDebugMsg("loop")
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        if (func.body.body.length === 0) return false;
        const loop = func.body.body[0];
        return loop instanceof LoopStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 带 exitwhen
    if (testLoop("loop 带 exitwhen", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const exitwhen = loopStmt.body.body.find((s: Statement) => s instanceof ExitWhenStatement);
        return exitwhen !== undefined;
    })) loopPassed++; else loopFailed++;
    
    // 测试嵌套 loop
    if (testLoop("嵌套 loop", `function test takes nothing returns nothing
    local integer i = 0
    local integer j = 0
    loop
        exitwhen i >= 5
        set j = 0
        loop
            exitwhen j >= 3
            set j = j + 1
        endloop
        set i = i + 1
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const nestedLoop = loopStmt.body.body.find((s: Statement) => s instanceof LoopStatement);
        return nestedLoop instanceof LoopStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 中的各种语句
    if (testLoop("loop 中的各种语句", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
        call BJDebugMsg(I2S(i))
        if i == 5 then
            call BJDebugMsg("five")
        endif
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        // 检查是否包含 exitwhen, set, call, if
        const hasExitwhen = loopStmt.body.body.some((s: Statement) => s instanceof ExitWhenStatement);
        const hasSet = loopStmt.body.body.some((s: Statement) => s instanceof AssignmentStatement);
        const hasIf = loopStmt.body.body.some((s: Statement) => s instanceof IfStatement);
        return hasExitwhen && hasSet && hasIf;
    })) loopPassed++; else loopFailed++;
    
    // 测试空 loop
    if (testLoop("空 loop", `function test takes nothing returns nothing
    loop
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body[0];
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        return loopStmt.body.body.length === 0;
    })) loopPassed++; else loopFailed++;
    
    // 测试 loop 中只有 exitwhen
    if (testLoop("loop 中只有 exitwhen", `function test takes nothing returns nothing
    loop
        exitwhen true
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body[0];
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        return loopStmt.body.body.length === 1 && loopStmt.body.body[0] instanceof ExitWhenStatement;
    })) loopPassed++; else loopFailed++;
    
    // 测试多个 exitwhen
    if (testLoop("多个 exitwhen", `function test takes nothing returns nothing
    local integer i = 0
    loop
        exitwhen i >= 10
        set i = i + 1
        exitwhen i == 5
    endloop
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const foundLoop = func.body.body.find((s: Statement) => s instanceof LoopStatement);
        if (!(foundLoop instanceof LoopStatement)) return false;
        const loopStmt = foundLoop as LoopStatement;
        const exitwhenCount = loopStmt.body.body.filter((s: Statement) => s instanceof ExitWhenStatement).length;
        return exitwhenCount === 2;
    })) loopPassed++; else loopFailed++;
    
    console.log(`\nloop 测试结果: 通过 ${loopPassed}, 失败 ${loopFailed}`);
    
    // 测试 11: call 语句
    console.log("\n测试 11: call 语句");
    
    function testCall(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let callPassed = 0;
    let callFailed = 0;
    
    // 测试基本 call 语句
    if (testCall("基本 call 语句", `function test takes nothing returns nothing
    call BJDebugMsg("Hello")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        return callStmt instanceof CallStatement;
    })) callPassed++; else callFailed++;
    
    // 测试 call 无参数
    if (testCall("call 无参数", `function test takes nothing returns nothing
    call InitTrig()
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 0;
    })) callPassed++; else callFailed++;
    
    // 测试 call 单参数
    if (testCall("call 单参数", `function test takes nothing returns nothing
    call BJDebugMsg("Hello World")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 多参数
    if (testCall("call 多参数", `function test takes nothing returns nothing
    call SetUnitPosition(unit, 100.0, 200.0)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 3;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带表达式参数
    if (testCall("call 带表达式参数", `function test takes nothing returns nothing
    local integer x = 10
    call BJDebugMsg(I2S(x + 5))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带 function 表达式参数
    if (testCall("call 带 function 表达式参数", `function test takes nothing returns nothing
    call a(function temp_func1)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const arg = callStmt.expression.arguments[0];
        return arg instanceof FunctionExpression;
    })) callPassed++; else callFailed++;
    
    // 测试 call 带复杂表达式参数
    if (testCall("call 带复杂表达式参数", `function test takes nothing returns nothing
    call a(function temp_func1 + 2 * 3)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        return callStmt.expression.arguments.length === 1;
    })) callPassed++; else callFailed++;
    
    // 测试 call 成员方法
    if (testCall("call 成员方法", `function test takes nothing returns nothing
    local unit u = null
    call u.destroy()
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const callee = callStmt.expression.callee;
        return callee instanceof BinaryExpression && callee.operator === OperatorType.Dot;
    })) callPassed++; else callFailed++;
    
    // 测试多个 call 语句
    if (testCall("多个 call 语句", `function test takes nothing returns nothing
    call BJDebugMsg("First")
    call BJDebugMsg("Second")
    call BJDebugMsg("Third")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmts = func.body.body.filter((s: Statement) => s instanceof CallStatement);
        return callStmts.length === 3;
    })) callPassed++; else callFailed++;
    
    // 测试 call 嵌套调用
    if (testCall("call 嵌套调用", `function test takes nothing returns nothing
    call BJDebugMsg(I2S(GetUnitX(unit)))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        // 检查参数中是否有嵌套的 CallExpression
        const hasNestedCall = callStmt.expression.arguments.some((arg: Expression) => 
            arg instanceof CallExpression
        );
        return hasNestedCall;
    })) callPassed++; else callFailed++;
    
    console.log(`\ncall 测试结果: 通过 ${callPassed}, 失败 ${callFailed}`);
    
    // 测试 12: set 语句
    console.log("\n测试 12: set 语句");
    
    function testSet(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let setPassed = 0;
    let setFailed = 0;
    
    // 测试基本 set 语句
    if (testSet("基本 set 语句", `function test takes nothing returns nothing
    local integer x
    set x = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        return setStmt instanceof AssignmentStatement;
    })) setPassed++; else setFailed++;
    
    // 测试 set 字符串
    if (testSet("set 字符串", `function test takes nothing returns nothing
    local string s
    set s = "Hello World"
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof StringLiteral;
    })) setPassed++; else setFailed++;
    
    // 测试 set 表达式
    if (testSet("set 表达式", `function test takes nothing returns nothing
    local integer x
    local integer y = 5
    set x = y + 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 数组索引
    if (testSet("set 数组索引", `function test takes nothing returns nothing
    local integer array arr
    set arr[0] = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        // 检查 target 是否是数组访问（BinaryExpression with Index operator）
        const target = setStmt.target;
        return target instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 成员访问
    if (testSet("set 成员访问", `function test takes nothing returns nothing
    local unit u = null
    set u.x = 100.0
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression) {
            return target.operator === OperatorType.Dot;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    // 测试 set 函数调用结果
    if (testSet("set 函数调用结果", `function test takes nothing returns nothing
    local real x
    local unit u = null
    set x = GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof CallExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 复杂表达式
    if (testSet("set 复杂表达式", `function test takes nothing returns nothing
    local integer x
    local integer a = 5
    local integer b = 10
    set x = (a + b) * 2
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        return setStmt.value instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 数组索引表达式
    if (testSet("set 数组索引表达式", `function test takes nothing returns nothing
    local integer array arr
    local integer i = 0
    set arr[i] = 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        return target instanceof BinaryExpression;
    })) setPassed++; else setFailed++;
    
    // 测试 set 嵌套成员访问
    if (testSet("set 嵌套成员访问", `function test takes nothing returns nothing
    local unit u = null
    set u.x = GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression) {
            return target.operator === OperatorType.Dot && setStmt.value instanceof CallExpression;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    // 测试多个 set 语句
    if (testSet("多个 set 语句", `function test takes nothing returns nothing
    local integer x
    local integer y
    set x = 10
    set y = 20
    set x = x + y
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmts = func.body.body.filter((s: Statement) => s instanceof AssignmentStatement);
        return setStmts.length === 3;
    })) setPassed++; else setFailed++;
    
    // 测试 set 自增
    if (testSet("set 自增", `function test takes nothing returns nothing
    local integer x = 0
    set x = x + 1
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        if (value instanceof BinaryExpression) {
            return value.operator === OperatorType.Plus;
        }
        return false;
    })) setPassed++; else setFailed++;
    
    console.log(`\nset 测试结果: 通过 ${setPassed}, 失败 ${setFailed}`);
    
    // 测试 13: return 语句
    console.log("\n测试 13: return 语句");
    
    function testReturn(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
        }
        return success;
    }
    
    let returnPassed = 0;
    let returnFailed = 0;
    
    // 测试 return 无返回值
    if (testReturn("return 无返回值", `function test takes nothing returns nothing
    return
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument === null;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 整数
    if (testReturn("return 整数", `function test takes nothing returns integer
    return 10
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof IntegerLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 字符串
    if (testReturn("return 字符串", `function test takes nothing returns string
    return "Hello World"
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof StringLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 变量
    if (testReturn("return 变量", `function test takes nothing returns integer
    local integer x = 10
    return x
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof Identifier;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 表达式
    if (testReturn("return 表达式", `function test takes nothing returns integer
    local integer x = 5
    local integer y = 10
    return x + y
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BinaryExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 函数调用
    if (testReturn("return 函数调用", `function test takes unit u returns real
    return GetUnitX(u)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof CallExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 复杂表达式
    if (testReturn("return 复杂表达式", `function test takes nothing returns integer
    local integer a = 5
    local integer b = 10
    local integer c = 2
    return (a + b) * c
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BinaryExpression;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 数组索引
    if (testReturn("return 数组索引", `function test takes nothing returns integer
    local integer array arr
    set arr[0] = 10
    return arr[0]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const arg = returnStmt.argument;
        return arg instanceof BinaryExpression && (arg as BinaryExpression).operator === OperatorType.Index;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 成员访问
    if (testReturn("return 成员访问", `function test takes nothing returns real
    local unit u = null
    return u.x
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const arg = returnStmt.argument;
        return arg instanceof BinaryExpression && (arg as BinaryExpression).operator === OperatorType.Dot;
    })) returnPassed++; else returnFailed++;
    
    // 测试 return 布尔值
    if (testReturn("return 布尔值", `function test takes nothing returns boolean
    return true
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        return returnStmt.argument instanceof BooleanLiteral;
    })) returnPassed++; else returnFailed++;
    
    // 测试多个 return 语句（虽然不常见，但语法上允许）
    if (testReturn("多个 return 语句", `function test takes boolean flag returns integer
    if flag then
        return 1
    endif
    return 0
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmts = func.body.body.filter((s: Statement) => s instanceof ReturnStatement);
        return returnStmts.length >= 1;
    })) returnPassed++; else returnFailed++;
    
    console.log(`\nreturn 测试结果: 通过 ${returnPassed}, 失败 ${returnFailed}`);
    
    // 测试 14: 复杂表达式解析
    console.log("\n测试 14: 复杂表达式解析");
    
    function testComplexExpression(name: string, code: string, check: (result: any, parser: Parser) => boolean): boolean {
        const parser = new Parser(code);
        const result = parser.parse();
        const success = check(result, parser);
        if (success) {
            console.log(`✓ ${name}`);
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
                // 打印前3个错误的详细信息
                parser.errors.errors.slice(0, 3).forEach(e => {
                    console.log(`    位置: 行 ${e.start.line + 1}, 列 ${e.start.position + 1}`);
                });
            }
        }
        return success;
    }
    
    let complexPassed = 0;
    let complexFailed = 0;
    
    // 测试超复杂表达式
    const complexExpr = `this.a(this.b() + this.ccc.sf[MAX_vALUE + 32 * 6], function callback, 0.75, false) * S2R("fsafhsfho")`;
    if (testComplexExpression("超复杂表达式", `function test takes nothing returns real
    set x = ${complexExpr}
endfunction`, (r, p) => {
        if (r.body.length === 0) {
            console.log("  错误: 没有解析到任何语句");
            return false;
        }
        if (p.errors.errors.length > 0) {
            return false;
        }
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) {
            console.log("  错误: 第一个语句不是函数声明");
            return false;
        }
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) {
            console.log("  错误: 没有找到 set 语句");
            return false;
        }
        const value = setStmt.value;
        if (!(value instanceof BinaryExpression)) {
            console.log("  错误: 值不是二元表达式");
            return false;
        }
        // 检查是否是乘法运算
        if (value.operator !== OperatorType.Multiply) {
            console.log(`  错误: 运算符不是乘法，而是 ${value.operator}`);
            return false;
        }
        // 检查左操作数是否是函数调用
        const left = value.left;
        if (!(left instanceof CallExpression)) {
            console.log("  错误: 左操作数不是函数调用");
            return false;
        }
        // 检查右操作数是否是函数调用
        const right = value.right;
        if (!(right instanceof CallExpression)) {
            console.log("  错误: 右操作数不是函数调用");
            return false;
        }
        return true;
    })) complexPassed++; else complexFailed++;
    
    // 测试嵌套成员访问和函数调用
    if (testComplexExpression("嵌套成员访问和函数调用", `function test takes nothing returns nothing
    call this.a(this.b())
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const callee = callStmt.expression.callee;
        // 检查是否是 this.a
        if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
            const left = callee.left;
            if (left instanceof Identifier && left.toString() === "this") {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试数组索引表达式
    if (testComplexExpression("数组索引表达式", `function test takes nothing returns nothing
    set x = arr[MAX_vALUE + 32 * 6]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是数组索引访问
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const index = value.right;
            // 检查索引是否是表达式
            if (index instanceof BinaryExpression) {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试成员访问链
    if (testComplexExpression("成员访问链", `function test takes nothing returns nothing
    set x = this.ccc.sf[0]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是 this.ccc.sf[0]
        // 应该是 Index 运算符，左操作数是 Dot 运算符
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            // 检查是否是 this.ccc.sf (Dot 运算符)
            if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
                // 检查左操作数是否是 this.ccc (另一个 Dot 运算符)
                const thisCcc = left.left;
                if (thisCcc instanceof BinaryExpression && thisCcc.operator === OperatorType.Dot) {
                    // 检查是否是 this
                    const thisPart = thisCcc.left;
                    if (thisPart instanceof Identifier && thisPart.toString() === "this") {
                        return true;
                    }
                }
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试 function 表达式作为参数
    if (testComplexExpression("function 表达式作为参数", `function test takes nothing returns nothing
    call a(function callback)
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        // 检查第一个参数是否是 function 表达式
        if (args.length > 0 && args[0] instanceof FunctionExpression) {
            return true;
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试混合类型参数
    if (testComplexExpression("混合类型参数", `function test takes nothing returns nothing
    call func(0.75, false, "string")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) {
            if (p.errors.errors.length > 0) {
                console.log("  解析错误:", p.errors.errors.map(e => e.message).join(', '));
            }
            return false;
        }
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) {
            console.log("  未找到 call 语句");
            return false;
        }
        const args = callStmt.expression.arguments;
        // 检查参数类型
        if (args.length === 3) {
            const hasReal = args[0] instanceof RealLiteral;
            const hasBoolean = args[1] instanceof BooleanLiteral;
            const hasString = args[2] instanceof StringLiteral;
            if (!hasReal) console.log("  第一个参数不是 RealLiteral");
            if (!hasBoolean) console.log("  第二个参数不是 BooleanLiteral");
            if (!hasString) console.log("  第三个参数不是 StringLiteral");
            return hasReal && hasBoolean && hasString;
        } else {
            console.log(`  参数数量不正确: 期望 3，实际 ${args.length}`);
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    // 测试完整复杂表达式（简化版）
    if (testComplexExpression("完整复杂表达式（简化版）", `function test takes nothing returns real
    local real x
    set x = this.a(this.b(), function callback) * S2R("test")
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body[0];
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是乘法表达式
        if (value instanceof BinaryExpression && value.operator === OperatorType.Multiply) {
            const left = value.left;
            const right = value.right;
            // 检查左操作数是函数调用，右操作数也是函数调用
            if (left instanceof CallExpression && right instanceof CallExpression) {
                return true;
            }
        }
        return false;
    })) complexPassed++; else complexFailed++;
    
    console.log(`\n复杂表达式测试结果: 通过 ${complexPassed}, 失败 ${complexFailed}`);
    
    // 测试 15: 二维数组
    console.log("\n测试 15: 二维数组");
    let twoDimArrayPassed = 0;
    let twoDimArrayFailed = 0;
    
    const testTwoDimArray = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本二维数组声明
    if (testTwoDimArray("基本二维数组声明", `globals
integer array mat1 [10][20]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arrayWidth === 10 && varDecl.arrayHeight === 20 && varDecl.arraySize === null;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 2: 大尺寸二维数组
    if (testTwoDimArray("大尺寸二维数组", `globals
integer array mat2 [100][200]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arrayWidth === 100 && varDecl.arrayHeight === 200;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 3: 静态二维数组成员（struct 中）
    if (testTwoDimArray("静态二维数组成员", `struct TestStruct
static integer array mat3 [5][6]
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecl = structDecl.members.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.isStatic && varDecl.arrayWidth === 5 && varDecl.arrayHeight === 6;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 4: 一维数组（确保不会误判为二维）
    if (testTwoDimArray("一维数组（不应误判为二维）", `globals
integer array arr1 [100]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecl = block.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        return varDecl.isArray && varDecl.arraySize === 100 && varDecl.arrayWidth === null && varDecl.arrayHeight === null;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 5: 局部二维数组（在函数中声明）
    if (testTwoDimArray("局部二维数组", `function test takes nothing returns nothing
local integer array mat [3][4]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const localVar = func.body.body.find((s: Statement) => s instanceof VariableDeclaration);
        if (!(localVar instanceof VariableDeclaration)) return false;
        return localVar.isArray && localVar.isLocal && localVar.arrayWidth === 3 && localVar.arrayHeight === 4;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    // 测试 6: 多个二维数组
    if (testTwoDimArray("多个二维数组", `globals
integer array matA [10][20]
real array matB [5][8]
endglobals`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const globalsStmt = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!globalsStmt) return false;
        const block = globalsStmt as BlockStatement;
        const varDecls = block.body.filter((s: Statement) => s instanceof VariableDeclaration);
        if (varDecls.length < 2) return false;
        const matA = varDecls.find((v: Statement) => v instanceof VariableDeclaration && v.name.toString() === "matA");
        const matB = varDecls.find((v: Statement) => v instanceof VariableDeclaration && v.name.toString() === "matB");
        if (!matA || !matB || !(matA instanceof VariableDeclaration) || !(matB instanceof VariableDeclaration)) return false;
        return matA.arrayWidth === 10 && matA.arrayHeight === 20 &&
               matB.arrayWidth === 5 && matB.arrayHeight === 8;
    })) twoDimArrayPassed++; else twoDimArrayFailed++;
    
    console.log(`\n二维数组测试结果: 通过 ${twoDimArrayPassed}, 失败 ${twoDimArrayFailed}`);
    
    // 测试 16: struct 和 interface 完整测试
    console.log("\n测试 16: struct 和 interface 完整测试");
    let structInterfacePassed = 0;
    let structInterfaceFailed = 0;
    
    const testStructInterface = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 struct 声明
    if (testStructInterface("基本 struct 声明", `struct Point
integer x
integer y
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.name?.toString() === "Point" && structDecl.members.length === 2;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 2: struct 继承
    if (testStructInterface("struct 继承", `struct Parent
integer x
endstruct
struct Child extends Parent
integer y
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        return childStruct.extendsType?.toString() === "Parent";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 3: struct 索引空间增强
    if (testStructInterface("struct 索引空间增强", `struct BigStruct[10000]
integer a
integer b
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.indexSize === 10000;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 4: struct 数组结构
    if (testStructInterface("struct 数组结构", `struct ArrayStruct extends array [20000]
integer a
integer b
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.isArrayStruct && structDecl.arraySize === 20000;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 5: struct 静态成员
    if (testStructInterface("struct 静态成员", `struct TestStruct
static integer count = 0
static integer array data[100]
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const staticVar = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration && m.isStatic);
        return staticVar !== undefined;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 6: struct 方法
    if (testStructInterface("struct 方法", `struct TestStruct
integer x
method setX takes integer val returns nothing
set this.x = val
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 7: 基本 interface 声明
    if (testStructInterface("基本 interface 声明", `interface Printable
method toString takes nothing returns string
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        return interfaceDecl.name?.toString() === "Printable";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 8: struct 实现 interface
    if (testStructInterface("struct 实现 interface", `interface Printable
method toString takes nothing returns string
endinterface
struct SingleInt extends Printable
integer v
method toString takes nothing returns string
return I2S(this.v)
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        return structDecl.extendsType?.toString() === "Printable";
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    // 测试 9: struct 二维数组成员
    if (testStructInterface("struct 二维数组成员", `struct Matrix
static integer array data [10][20]
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const arrayMember = structDecl.members.find((m: Statement) => 
            m instanceof VariableDeclaration && m.isArray && m.arrayWidth !== null
        );
        if (!(arrayMember instanceof VariableDeclaration)) return false;
        return arrayMember.arrayWidth === 10 && arrayMember.arrayHeight === 20;
    })) structInterfacePassed++; else structInterfaceFailed++;
    
    console.log(`\nstruct 和 interface 测试结果: 通过 ${structInterfacePassed}, 失败 ${structInterfaceFailed}`);
    
    // 测试 25: defaults 关键字功能测试
    console.log("\n测试 25: defaults 关键字功能测试");
    let defaultsPassed = 0;
    let defaultsFailed = 0;
    
    const testDefaults = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            // 添加调试信息
            if (result.body.length > 0) {
                const interfaceDecl = result.body.find((s: Statement) => s instanceof InterfaceDeclaration);
                if (interfaceDecl instanceof InterfaceDeclaration) {
                    const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
                    console.log(`  找到 ${methods.length} 个方法`);
                    methods.forEach(m => {
                        if (m.defaultsValue) {
                            console.log(`    方法 ${m.name?.toString()}: defaultsValue = ${m.defaultsValue.toString()} (类型: ${m.defaultsValue.constructor.name})`);
                        } else {
                            console.log(`    方法 ${m.name?.toString()}: 无 defaultsValue`);
                        }
                    });
                }
            }
            return false;
        }
    };
    
    // 测试 1: 基本 defaults 使用（文档示例）
    if (testDefaults("基本 defaults 使用（文档示例）", `interface whattodo
method onStrike takes real x, real y returns boolean defaults false
method onBegin takes real x, real y returns nothing defaults nothing
method onFinish takes nothing returns nothing
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 3) return false;
        
        // 检查 onStrike 方法有 defaults false
        const onStrike = methods.find(m => m.name?.toString() === "onStrike");
        if (!onStrike || !onStrike.defaultsValue) return false;
        if (onStrike.defaultsValue.toString() !== "false") return false;
        
        // 检查 onBegin 方法有 defaults nothing
        const onBegin = methods.find(m => m.name?.toString() === "onBegin");
        if (!onBegin || !onBegin.defaultsValue) return false;
        if (onBegin.defaultsValue.toString() !== "nothing") return false;
        
        // 检查 onFinish 方法没有 defaults
        const onFinish = methods.find(m => m.name?.toString() === "onFinish");
        if (!onFinish || onFinish.defaultsValue !== null) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 2: defaults 带整数常量值
    if (testDefaults("defaults 带整数常量值", `interface TestInterface
method getValue takes nothing returns integer defaults 0
method getCount takes nothing returns integer defaults 100
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getValue = methods.find(m => m.name?.toString() === "getValue");
        if (!getValue || !getValue.defaultsValue) return false;
        if (getValue.defaultsValue.toString() !== "0") return false;
        
        const getCount = methods.find(m => m.name?.toString() === "getCount");
        if (!getCount || !getCount.defaultsValue) return false;
        if (getCount.defaultsValue.toString() !== "100") return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 3: defaults 带实数常量值
    if (testDefaults("defaults 带实数常量值", `interface TestInterface
method getReal takes nothing returns real defaults 0.0
method getPi takes nothing returns real defaults 3.14159
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getReal = methods.find(m => m.name?.toString() === "getReal");
        if (!getReal || !getReal.defaultsValue) return false;
        
        const getPi = methods.find(m => m.name?.toString() === "getPi");
        if (!getPi || !getPi.defaultsValue) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 4: defaults 带字符串常量值
    if (testDefaults("defaults 带字符串常量值", `interface TestInterface
method getName takes nothing returns string defaults ""
method getMessage takes nothing returns string defaults "default"
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const getName = methods.find(m => m.name?.toString() === "getName");
        if (!getName || !getName.defaultsValue) return false;
        
        const getMessage = methods.find(m => m.name?.toString() === "getMessage");
        if (!getMessage || !getMessage.defaultsValue) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 5: defaults 带布尔常量值
    if (testDefaults("defaults 带布尔常量值", `interface TestInterface
method isEnabled takes nothing returns boolean defaults true
method isDisabled takes nothing returns boolean defaults false
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 2) return false;
        
        const isEnabled = methods.find(m => m.name?.toString() === "isEnabled");
        if (!isEnabled || !isEnabled.defaultsValue) return false;
        if (isEnabled.defaultsValue.toString() !== "true") return false;
        
        const isDisabled = methods.find(m => m.name?.toString() === "isDisabled");
        if (!isDisabled || !isDisabled.defaultsValue) return false;
        if (isDisabled.defaultsValue.toString() !== "false") return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 6: 混合使用 defaults 和不使用 defaults
    if (testDefaults("混合使用 defaults 和不使用 defaults", `interface TestInterface
method required takes nothing returns nothing
method optional1 takes nothing returns integer defaults 0
method optional2 takes nothing returns boolean defaults false
method required2 takes nothing returns string
endinterface`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const methods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        if (methods.length !== 4) return false;
        
        const required = methods.find(m => m.name?.toString() === "required");
        if (!required || required.defaultsValue !== null) return false;
        
        const optional1 = methods.find(m => m.name?.toString() === "optional1");
        if (!optional1 || !optional1.defaultsValue) return false;
        
        const optional2 = methods.find(m => m.name?.toString() === "optional2");
        if (!optional2 || !optional2.defaultsValue) return false;
        
        const required2 = methods.find(m => m.name?.toString() === "required2");
        if (!required2 || required2.defaultsValue !== null) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    // 测试 7: struct 实现带 defaults 的接口
    if (testDefaults("struct 实现带 defaults 的接口", `interface TestInterface
method optional takes nothing returns integer defaults 0
method required takes nothing returns nothing
endinterface
struct TestStruct extends TestInterface
method required takes nothing returns nothing
call BJDebugMsg("required")
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        if (!(interfaceDecl instanceof InterfaceDeclaration)) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        
        // 检查接口中有 defaults
        const interfaceMethods = interfaceDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        const optionalMethod = interfaceMethods.find(m => m.name?.toString() === "optional");
        if (!optionalMethod || !optionalMethod.defaultsValue) return false;
        
        // struct 实现了 required 方法（没有实现 optional，这是合法的，因为有 defaults）
        const structMethods = structDecl.members.filter((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration[];
        const requiredMethod = structMethods.find(m => m.name?.toString() === "required");
        if (!requiredMethod) return false;
        
        return true;
    })) defaultsPassed++; else defaultsFailed++;
    
    console.log(`\ndefaults 关键字测试结果: 通过 ${defaultsPassed}, 失败 ${defaultsFailed}`);
    
    // 测试 26: readonly 关键字功能测试
    console.log("\n测试 26: readonly 关键字功能测试");
    let readonlyPassed = 0;
    let readonlyFailed = 0;
    
    const testReadonly = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            readonlyPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            readonlyFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 readonly 使用（文档示例）
    testReadonly("基本 readonly 成员", `struct encap
    real a = 0.0
    private real b = 0.0
    public real c = 4.5
    readonly real d = 10.0
    method randomize takes nothing returns nothing
        set this.a = GetRandomReal(0, 45.0)
        set this.b = GetRandomReal(0, 45.0)
        set this.c = GetRandomReal(0, 45.0)
        set this.d = GetRandomReal(0, 45.0)
    endmethod
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "encap");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 4) return false;
        // 检查是否有 readonly 成员
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "d" && m.isReadonly === true;
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    // 测试 2: readonly 与 static 组合
    testReadonly("readonly static 成员", `struct TestStruct
    readonly static integer count = 0
    readonly real value = 5.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 2) return false;
        // 检查 readonly static 成员
        const readonlyStatic = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "count" && m.isReadonly === true && m.isStatic === true;
            }
            return false;
        });
        // 检查 readonly 非 static 成员
        const readonlyNonStatic = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "value" && m.isReadonly === true && m.isStatic === false;
            }
            return false;
        });
        return readonlyStatic !== undefined && readonlyNonStatic !== undefined;
    });
    
    // 测试 3: readonly 与 constant 组合（虽然文档说它是非标准的，但我们仍然支持解析）
    testReadonly("readonly constant 成员", `struct TestStruct
    readonly constant integer MAX_VALUE = 100
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "MAX_VALUE" && 
               member.isReadonly === true && 
               member.isConstant === true;
    });
    
    // 测试 4: readonly 数组成员
    testReadonly("readonly 数组成员", `struct TestStruct
    readonly integer array data[10]
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "data" && 
               member.isReadonly === true && 
               member.isArray === true &&
               member.arraySize === 10;
    });
    
    // 测试 5: readonly 与 private/public 的混合使用
    testReadonly("readonly 与 private/public 混合", `struct TestStruct
    real a = 0.0
    private real b = 0.0
    public real c = 0.0
    readonly real d = 0.0
    private readonly real e = 0.0
    public readonly real f = 0.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 6) return false;
        // 检查所有成员都被正确解析
        const memberNames = members.map((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString();
            }
            return "";
        });
        return memberNames.includes("a") && 
               memberNames.includes("b") && 
               memberNames.includes("c") && 
               memberNames.includes("d") && 
               memberNames.includes("e") && 
               memberNames.includes("f");
    });
    
    // 测试 6: readonly 成员的 toString 输出
    testReadonly("readonly 成员的 toString", `struct TestStruct
    readonly real value = 5.0
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        const str = member.toString();
        // 检查 toString 是否包含 readonly
        return str.includes("readonly") && member.isReadonly === true;
    });
    
    // 测试 7: readonly 二维数组成员
    testReadonly("readonly 二维数组成员", `struct TestStruct
    readonly integer array matrix[10][20]
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "matrix" && 
               member.isReadonly === true && 
               member.isArray === true &&
               member.arrayWidth === 10 &&
               member.arrayHeight === 20;
    });
    
    // 测试 8: readonly 与 static 和 constant 三组合
    testReadonly("readonly static constant 组合", `struct TestStruct
    readonly static constant integer MAX = 100
endstruct`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        if (members.length < 1) return false;
        const member = members[0] as VariableDeclaration;
        return member.name.toString() === "MAX" && 
               member.isReadonly === true && 
               member.isStatic === true &&
               member.isConstant === true;
    });
    
    // 测试 9: readonly 在继承结构中的使用
    testReadonly("readonly 在继承结构中", `struct Parent
    integer x
    readonly integer y = 10
endstruct
struct Child extends Parent
    integer z
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const parent = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Parent");
        if (!(parent instanceof StructDeclaration)) return false;
        const members = parent.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "y" && m.isReadonly === true;
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    // 测试 10: readonly 与自定义类型
    testReadonly("readonly 与自定义类型", `struct MyType
    integer value
endstruct
struct TestStruct
    readonly MyType obj = 0
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "TestStruct");
        if (!(testStruct instanceof StructDeclaration)) return false;
        const members = testStruct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const readonlyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.name.toString() === "obj" && m.isReadonly === true && m.type?.toString() === "MyType";
            }
            return false;
        });
        return readonlyMember !== undefined;
    });
    
    console.log(`\nreadonly 关键字测试结果: 通过 ${readonlyPassed}, 失败 ${readonlyFailed}`);
    
    // 测试 27: key 类型功能测试
    console.log("\n测试 27: key 类型功能测试");
    let keyPassed = 0;
    let keyFailed = 0;
    
    const testKey = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            keyPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            keyFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 key 类型声明（文档示例）
    testKey("基本 key 类型声明", `scope Tester initializer test
globals
key AAAA
private key BBBB
public key CCCC
constant key DDDD
endglobals
private function test takes nothing returns nothing
local hashtable ht = InitHashtable()
call SaveInteger(ht, AAAA, BBBB, 5)
call SaveInteger(ht, AAAA, CCCC, 7)
call SaveReal(ht, AAAA, DDDD, LoadInteger(ht, AAAA, BBBB) * 0.05)
call BJDebugMsg(R2S(LoadReal(ht, AAAA, DDDD)))
call BJDebugMsg(I2S(BBBB))
call BJDebugMsg(I2S(CCCC))
endfunction
endscope`, (r, p) => {
        if (p.errors.errors.length > 0) {
            return false;
        }
        if (r.body.length < 1) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        // 检查是否有 globals 块
        const globalsBlock = scope.members.find((m: Statement) => m instanceof BlockStatement);
        if (!(globalsBlock instanceof BlockStatement)) return false;
        const globalsStmts = globalsBlock.body;
        // 应该找到 4 个 key 变量声明
        const keyVars = globalsStmts.filter((s: Statement) => {
            if (s instanceof VariableDeclaration) {
                return s.type?.toString() === "key";
            }
            return false;
        });
        return keyVars.length === 4;
    });
    
    // 测试 2: key 类型不能有初始化值
    testKey("key 类型不能有初始化值", `globals
key TEST_KEY = 123
endglobals`, (r, p) => {
        // 应该报错：key 类型不能有初始化值
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("cannot have initializers") || e.message.includes("Key type variables cannot have initializers"));
    });
    
    // 测试 3: key 类型不能是数组
    testKey("key 类型不能是数组", `globals
key array TEST_KEYS[10]
endglobals`, (r, p) => {
        // 应该报错：key 类型不能是数组
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("cannot be an array") || e.message.includes("Key type cannot be an array"));
    });
    
    // 测试 4: constant key 类型
    testKey("constant key 类型", `globals
constant key KEY1
constant key KEY2
endglobals`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const globalsBlock = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!(globalsBlock instanceof BlockStatement)) return false;
        const keyVars = globalsBlock.body.filter((s: Statement) => {
            if (s instanceof VariableDeclaration) {
                return s.type?.toString() === "key" && s.isConstant === true;
            }
            return false;
        });
        return keyVars.length === 2;
    });
    
    // 测试 5: key 类型在 struct 中（应该不支持，但先测试解析）
    testKey("key 类型在 struct 中", `struct TestStruct
key memberKey
endstruct`, (r, p) => {
        // key 类型主要用于 globals，但在 struct 中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const struct = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(struct instanceof StructDeclaration)) return false;
        const members = struct.members.filter((m: Statement) => m instanceof VariableDeclaration);
        const keyMember = members.find((m: Statement) => {
            if (m instanceof VariableDeclaration) {
                return m.type?.toString() === "key";
            }
            return false;
        });
        return keyMember !== undefined;
    });
    
    // 测试 6: key 类型在函数参数中（应该不支持，但先测试解析）
    testKey("key 类型在函数参数中", `function test takes key k returns nothing
call BJDebugMsg(I2S(k))
endfunction`, (r, p) => {
        // key 类型主要用于 globals，但在函数参数中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const keyParam = func.parameters.find((p: VariableDeclaration) => {
            return p.type?.toString() === "key";
        });
        return keyParam !== undefined;
    });
    
    // 测试 7: key 类型在局部变量中（应该不支持，但先测试解析）
    testKey("key 类型在局部变量中", `function test takes nothing returns nothing
local key localKey
call BJDebugMsg(I2S(localKey))
endfunction`, (r, p) => {
        // key 类型主要用于 globals，但在局部变量中理论上也可以解析
        // 这里只检查是否能解析，不检查语义正确性
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const localVars = func.body.body.filter((s: Statement) => s instanceof VariableDeclaration && (s as VariableDeclaration).isLocal);
        const keyLocal = localVars.find((v: Statement) => {
            if (v instanceof VariableDeclaration) {
                return v.type?.toString() === "key";
            }
            return false;
        });
        return keyLocal !== undefined;
    });
    
    console.log(`\nkey 类型测试结果: 通过 ${keyPassed}, 失败 ${keyFailed}`);
    
    // 测试 28: library/scope 的 requires/needs/uses/initializer/optional 功能测试
    console.log("\n测试 28: library/scope 的 requires/needs/uses/initializer/optional 功能测试");
    let libraryScopePassed = 0;
    let libraryScopeFailed = 0;
    
    const testLibraryScope = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            libraryScopePassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            libraryScopeFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 library 声明
    testLibraryScope("基本 library 声明", `library MyLibrary
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.name?.toString() === "MyLibrary" && 
               lib.dependencies.length === 0 && 
               lib.initializer === null;
    });
    
    // 测试 2: library 带 requires
    testLibraryScope("library 带 requires", `library B requires A
function Bfun takes nothing returns nothing
endfunction
endlibrary
library A
function Afun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const libB = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "B");
        if (!(libB instanceof LibraryDeclaration)) return false;
        return libB.dependencies.length === 1 && 
               libB.dependencies[0].toString() === "A";
    });
    
    // 测试 3: library 带 needs
    testLibraryScope("library 带 needs", `library C needs A, B
function Cfun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "C");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 2 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B";
    });
    
    // 测试 4: library 带 uses
    testLibraryScope("library 带 uses", `library D uses A
function Dfun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "D");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "A";
    });
    
    // 测试 5: library 带 initializer
    testLibraryScope("library 带 initializer", `library A initializer InitA
function InitA takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "A");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "InitA";
    });
    
    // 测试 6: library 带 initializer 和 requires（文档示例）
    testLibraryScope("library 带 initializer 和 requires（文档示例）", `library A initializer InitA requires B
function InitA takes nothing returns nothing
endfunction
endlibrary
library B initializer InitB
function InitB takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const libA = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "A");
        if (!(libA instanceof LibraryDeclaration)) return false;
        return libA.initializer?.toString() === "InitA" && 
               libA.dependencies.length === 1 && 
               libA.dependencies[0].toString() === "B";
    });
    
    // 测试 7: library 带 optional requires
    testLibraryScope("library 带 optional requires", `library OptionalCode requires optional UnitKiller
function fun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "OptionalCode");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "UnitKiller" && 
               lib.optionalDependencies.has("UnitKiller");
    });
    
    // 测试 8: library 带多个 optional 依赖
    testLibraryScope("library 带多个 optional 依赖", `library TestLib requires optional A, optional B, C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B" && 
               lib.dependencies[2].toString() === "C" && 
               lib.optionalDependencies.has("A") && 
               lib.optionalDependencies.has("B") && 
               !lib.optionalDependencies.has("C");
    });
    
    // 测试 9: library_once
    testLibraryScope("library_once 声明", `library_once MyLib
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "MyLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.isLibraryOnce === true;
    });
    
    // 测试 10: scope 基本声明
    testLibraryScope("scope 基本声明", `scope MyScope
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.name?.toString() === "MyScope" && 
               scope.initializer === null;
    });
    
    // 测试 11: scope 带 initializer
    testLibraryScope("scope 带 initializer", `scope Tester initializer test
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Tester");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "test";
    });
    
    // 测试 12: scope 带 initializer 和 globals（key 类型测试中的示例）
    testLibraryScope("scope 带 initializer 和 globals", `scope Tester initializer test
globals
key AAAA
endglobals
function test takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Tester");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "test" && 
               scope.members.length > 0;
    });
    
    // 测试 13: library 多个 requires 语句
    testLibraryScope("library 多个 requires 语句", `library TestLib requires A
requires B
requires C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies[0].toString() === "A" && 
               lib.dependencies[1].toString() === "B" && 
               lib.dependencies[2].toString() === "C";
    });
    
    // 测试 14: library initializer 在 requires 之前
    testLibraryScope("library initializer 在 requires 之前", `library TestLib initializer Init requires A
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 1 && 
               lib.dependencies[0].toString() === "A";
    });
    
    // 测试 15: library 混合使用 requires/needs/uses
    testLibraryScope("library 混合使用 requires/needs/uses", `library TestLib requires A
needs B
uses C
function test takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.dependencies.length === 3 && 
               lib.dependencies.some((d: Identifier) => d.toString() === "A") &&
               lib.dependencies.some((d: Identifier) => d.toString() === "B") &&
               lib.dependencies.some((d: Identifier) => d.toString() === "C");
    });
    
    // 测试 16: library 复杂依赖链
    testLibraryScope("library 复杂依赖链", `library E requires A, B, C, D
function Efun takes nothing returns nothing
endfunction
endlibrary
library D requires A, B
function Dfun takes nothing returns nothing
endfunction
endlibrary
library C requires A
function Cfun takes nothing returns nothing
endfunction
endlibrary
library B requires A
function Bfun takes nothing returns nothing
endfunction
endlibrary
library A
function Afun takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 5 || p.errors.errors.length > 0) return false;
        const libE = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "E");
        if (!(libE instanceof LibraryDeclaration)) return false;
        return libE.dependencies.length === 4;
    });
    
    // 测试 17: library 带 initializer 和多个 optional 依赖
    testLibraryScope("library 带 initializer 和多个 optional 依赖", `library TestLib initializer Init requires optional A, optional B
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 2 && 
               lib.optionalDependencies.has("A") && 
               lib.optionalDependencies.has("B");
    });
    
    // 测试 18: library_once 带依赖和 initializer
    testLibraryScope("library_once 带依赖和 initializer", `library_once TestLib initializer Init requires A
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.isLibraryOnce === true && 
               lib.initializer?.toString() === "Init" && 
               lib.dependencies.length === 1;
    });
    
    // 测试 19: scope 嵌套在 library 中
    testLibraryScope("scope 嵌套在 library 中", `library TestLib
scope InnerScope initializer innerInit
function innerInit takes nothing returns nothing
endfunction
endscope
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        const scope = lib.members.find((m: Statement) => m instanceof ScopeDeclaration && (m as ScopeDeclaration).name?.toString() === "InnerScope");
        if (!(scope instanceof ScopeDeclaration)) return false;
        return scope.initializer?.toString() === "innerInit";
    });
    
    // 测试 20: library 的 toString 输出
    testLibraryScope("library 的 toString 输出", `library TestLib initializer Init requires A, optional B
function Init takes nothing returns nothing
endfunction
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        const str = lib.toString();
        return str.includes("library TestLib") && 
               str.includes("initializer Init") && 
               str.includes("requires");
    });
    
    // 测试 21: scope 的 toString 输出
    testLibraryScope("scope 的 toString 输出", `scope TestScope initializer Init
function Init takes nothing returns nothing
endfunction
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "TestScope");
        if (!(scope instanceof ScopeDeclaration)) return false;
        const str = scope.toString();
        return str.includes("scope TestScope") && 
               str.includes("initializer Init");
    });
    
    console.log(`\nlibrary/scope 功能测试结果: 通过 ${libraryScopePassed}, 失败 ${libraryScopeFailed}`);
    
    // 测试 29: hook 语句功能测试
    console.log("\n测试 29: hook 语句功能测试");
    let hookPassed = 0;
    let hookFailed = 0;
    
    const testHook = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            hookPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            hookFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 hook 语句（文档示例）
    testHook("基本 hook 语句（文档示例）", `function onRemoval takes unit u returns nothing
call BJDebugMsg("unit is being removed!")
endfunction
hook RemoveUnit onRemoval`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "RemoveUnit" && 
               hook.hookFunction.toString() === "onRemoval" && 
               hook.hookStruct === null && 
               hook.hookMethod === null;
    });
    
    // 测试 2: hook 语句使用结构静态方法（文档示例）
    testHook("hook 语句使用结构静态方法（文档示例）", `struct err
static method onrem takes unit u returns nothing
call BJDebugMsg("This also knows that a unit is being removed!")
endmethod
endstruct
hook RemoveUnit err.onrem`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "RemoveUnit" && 
               hook.hookStruct?.toString() === "err" && 
               hook.hookMethod?.toString() === "onrem";
    });
    
    // 测试 3: hook 多个函数
    testHook("hook 多个函数", `function hook1 takes nothing returns nothing
endfunction
function hook2 takes nothing returns nothing
endfunction
hook KillUnit hook1
hook CreateUnit hook2`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const hook1 = hooks[0] as HookStatement;
        const hook2 = hooks[1] as HookStatement;
        return (hook1.targetFunction.toString() === "KillUnit" && hook1.hookFunction.toString() === "hook1") ||
               (hook1.targetFunction.toString() === "CreateUnit" && hook1.hookFunction.toString() === "hook2");
    });
    
    // 测试 4: hook 语句在 library 中
    testHook("hook 语句在 library 中", `library TestLib
function onKill takes unit u returns nothing
call BJDebugMsg("Unit killed")
endfunction
hook KillUnit onKill
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        const hook = lib.members.find((m: Statement) => m instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "KillUnit" && 
               hook.hookFunction.toString() === "onKill";
    });
    
    // 测试 5: hook 语句在 scope 中
    testHook("hook 语句在 scope 中", `scope TestScope
function onCreate takes nothing returns nothing
call BJDebugMsg("Unit created")
endfunction
hook CreateUnit onCreate
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const scope = r.body.find((s: Statement) => s instanceof ScopeDeclaration);
        if (!(scope instanceof ScopeDeclaration)) return false;
        const hook = scope.members.find((m: Statement) => m instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "CreateUnit" && 
               hook.hookFunction.toString() === "onCreate";
    });
    
    // 测试 6: hook 语句的 toString 输出（普通函数）
    testHook("hook 语句的 toString 输出（普通函数）", `function hookFunc takes nothing returns nothing
endfunction
hook TestFunc hookFunc`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        const str = hook.toString();
        return str === "hook TestFunc hookFunc";
    });
    
    // 测试 7: hook 语句的 toString 输出（结构方法）
    testHook("hook 语句的 toString 输出（结构方法）", `struct MyStruct
static method hookMethod takes nothing returns nothing
endmethod
endstruct
hook TestFunc MyStruct.hookMethod`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        const str = hook.toString();
        return str === "hook TestFunc MyStruct.hookMethod";
    });
    
    // 测试 8: hook native 函数
    testHook("hook native 函数", `function onNativeCall takes nothing returns nothing
endfunction
hook GetUnitX onNativeCall`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "GetUnitX" && 
               hook.hookFunction.toString() === "onNativeCall";
    });
    
    // 测试 9: hook bj 函数
    testHook("hook bj 函数", `function onBJCall takes nothing returns nothing
endfunction
hook BJDebugMsg onBJCall`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "BJDebugMsg" && 
               hook.hookFunction.toString() === "onBJCall";
    });
    
    // 测试 10: hook 多个结构方法
    testHook("hook 多个结构方法", `struct Handler1
static method handle1 takes nothing returns nothing
endmethod
endstruct
struct Handler2
static method handle2 takes nothing returns nothing
endmethod
endstruct
hook Func1 Handler1.handle1
hook Func2 Handler2.handle2`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const hook1 = hooks.find((h: HookStatement) => h.targetFunction.toString() === "Func1") as HookStatement;
        const hook2 = hooks.find((h: HookStatement) => h.targetFunction.toString() === "Func2") as HookStatement;
        if (!hook1 || !hook2) return false;
        return hook1.hookStruct?.toString() === "Handler1" && 
               hook1.hookMethod?.toString() === "handle1" &&
               hook2.hookStruct?.toString() === "Handler2" && 
               hook2.hookMethod?.toString() === "handle2";
    });
    
    // 测试 11: hook 同一个函数多次（应该允许）
    testHook("hook 同一个函数多次", `function hook1 takes nothing returns nothing
endfunction
function hook2 takes nothing returns nothing
endfunction
hook TestFunc hook1
hook TestFunc hook2`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const hooks = r.body.filter((s: Statement) => s instanceof HookStatement);
        if (hooks.length !== 2) return false;
        const allTargetTestFunc = hooks.every((h: HookStatement) => h.targetFunction.toString() === "TestFunc");
        return allTargetTestFunc;
    });
    
    // 测试 12: hook 带参数的函数
    testHook("hook 带参数的函数", `function onUnitAction takes unit u, integer i returns nothing
call BJDebugMsg("Unit action")
endfunction
hook SomeFunction onUnitAction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "SomeFunction" && 
               hook.hookFunction.toString() === "onUnitAction";
    });
    
    // 测试 13: hook 带返回值的函数
    testHook("hook 带返回值的函数", `function onGetValue takes nothing returns integer
return 100
endfunction
hook GetValue onGetValue`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const hook = r.body.find((s: Statement) => s instanceof HookStatement);
        if (!(hook instanceof HookStatement)) return false;
        return hook.targetFunction.toString() === "GetValue" && 
               hook.hookFunction.toString() === "onGetValue";
    });
    
    // 测试 14: hook 在嵌套 scope 中
    testHook("hook 在嵌套 scope 中", `scope Outer
scope Inner
function onInner takes nothing returns nothing
endfunction
hook InnerFunc onInner
endscope
endscope`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const outerScope = r.body.find((s: Statement) => s instanceof ScopeDeclaration && s.name?.toString() === "Outer");
        if (!(outerScope instanceof ScopeDeclaration)) return false;
        const innerScope = outerScope.members.find((m: Statement) => m instanceof ScopeDeclaration && (m as ScopeDeclaration).name?.toString() === "Inner");
        if (!(innerScope instanceof ScopeDeclaration)) return false;
        const hook = innerScope.members.find((m: Statement) => m instanceof HookStatement);
        return hook !== undefined;
    });
    
    // 测试 15: hook 与 library initializer 组合
    testHook("hook 与 library initializer 组合", `library TestLib initializer Init
function Init takes nothing returns nothing
endfunction
function onHook takes nothing returns nothing
endfunction
hook TestFunc onHook
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration && s.name?.toString() === "TestLib");
        if (!(lib instanceof LibraryDeclaration)) return false;
        return lib.initializer?.toString() === "Init" && 
               lib.members.some((m: Statement) => m instanceof HookStatement);
    });
    
    console.log(`\nhook 语句测试结果: 通过 ${hookPassed}, 失败 ${hookFailed}`);
    
    // 测试 30: inject 和 loaddata 预处理器指令功能测试
    console.log("\n测试 30: inject 和 loaddata 预处理器指令功能测试");
    let injectLoadDataPassed = 0;
    let injectLoadDataFailed = 0;
    
    const testInjectLoadData = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            injectLoadDataPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            injectLoadDataFailed++;
            return false;
        }
    };
    
    // 测试 1: 基本 inject main 指令（文档示例）
    testInjectLoadData("基本 inject main 指令（文档示例）", `//! inject main
//一些函数调用可能会在这里
//将 vJass 初始化放置在此处，注意，结构优先被初始化，然后是库初始化
//! dovJassinit
//其他的调用可能会在这里
call InitCustomTriggers()
//也许您想使用 WorldEditor 的该功能...
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        return inject.injectType === "main" && inject.content.length > 0;
    });
    
    // 测试 2: inject config 指令
    testInjectLoadData("inject config 指令", `//! inject config
//配置代码
call SetGameSpeed(MAP_SPEED_FAST)
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        return inject.injectType === "config" && inject.content.length > 0;
    });
    
    // 测试 3: 基本 loaddata 指令
    testInjectLoadData("基本 loaddata 指令", `//! loaddata "path.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "path.slk";
    });
    
    // 测试 4: loaddata 带相对路径
    testInjectLoadData("loaddata 带相对路径", `//! loaddata "data/units.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "data/units.slk";
    });
    
    // 测试 5: loaddata 带绝对路径
    testInjectLoadData("loaddata 带绝对路径", `//! loaddata "C:\\data\\units.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        return loadData.filePath === "C:\\data\\units.slk";
    });
    
    // 测试 6: inject 和 loaddata 混合使用
    testInjectLoadData("inject 和 loaddata 混合使用", `//! loaddata "units.slk"
//! inject main
call InitCustomTriggers()
//! endinject
//! loaddata "items.slk"`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const loadData1 = r.body.find((s: Statement) => s instanceof LoadDataStatement && s.filePath === "units.slk");
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        const loadData2 = r.body.find((s: Statement) => s instanceof LoadDataStatement && s.filePath === "items.slk");
        return loadData1 !== undefined && inject !== undefined && loadData2 !== undefined;
    });
    
    // 测试 7: inject 在 library 中
    testInjectLoadData("inject 在 library 中", `library TestLib
//! inject main
call InitTestLib()
//! endinject
endlibrary`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const lib = r.body.find((s: Statement) => s instanceof LibraryDeclaration);
        if (!(lib instanceof LibraryDeclaration)) return false;
        const inject = lib.members.find((m: Statement) => m instanceof InjectStatement);
        return inject !== undefined;
    });
    
    // 测试 8: inject 的 toString 输出
    testInjectLoadData("inject 的 toString 输出", `//! inject main
call Test()
//! endinject`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const inject = r.body.find((s: Statement) => s instanceof InjectStatement);
        if (!(inject instanceof InjectStatement)) return false;
        const str = inject.toString();
        return str.includes("//! inject main") && str.includes("//! endinject");
    });
    
    // 测试 9: loaddata 的 toString 输出
    testInjectLoadData("loaddata 的 toString 输出", `//! loaddata "test.slk"`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const loadData = r.body.find((s: Statement) => s instanceof LoadDataStatement);
        if (!(loadData instanceof LoadDataStatement)) return false;
        const str = loadData.toString();
        return str === `//! loaddata "test.slk"`;
    });
    
    // 测试 10: 未闭合的 inject 块（应该报错）
    testInjectLoadData("未闭合的 inject 块（应该报错）", `//! inject main
call Test()
// 没有 endinject`, (r, p) => {
        // 应该报错：未闭合的 inject 块
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("Unclosed //! inject"));
    });
    
    console.log(`\ninject 和 loaddata 测试结果: 通过 ${injectLoadDataPassed}, 失败 ${injectLoadDataFailed}`);
    
    // 测试 17: 二维数组表达式访问
    console.log("\n测试 17: 二维数组表达式访问");
    let twoDimExprPassed = 0;
    let twoDimExprFailed = 0;
    
    const testTwoDimExpr = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本二维数组访问
    if (testTwoDimExpr("基本二维数组访问", `function test takes nothing returns nothing
local integer array mat [10][20]
local integer i = 0
local integer j = 0
set i = mat[0][1]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        // 检查是否是嵌套的数组访问：mat[0][1] 应该是 BinaryExpression(Index, BinaryExpression(Index, mat, 0), 1)
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 2: 二维数组赋值
    if (testTwoDimExpr("二维数组赋值", `function test takes nothing returns nothing
local integer array mat [5][6]
set mat[2][3] = 100
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        // 检查 target 是否是嵌套的数组访问
        if (target instanceof BinaryExpression && target.operator === OperatorType.Index) {
            const left = target.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 3: 二维数组访问表达式索引
    if (testTwoDimExpr("二维数组访问表达式索引", `function test takes nothing returns nothing
local integer array mat [10][20]
local integer i = 0
local integer j = 0
set i = mat[i + 1][j * 2]
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const value = setStmt.value;
        if (value instanceof BinaryExpression && value.operator === OperatorType.Index) {
            const left = value.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                // 检查索引是否是表达式
                const firstIndex = left.right;
                const secondIndex = value.right;
                return firstIndex instanceof BinaryExpression && secondIndex instanceof BinaryExpression;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 4: 全局二维数组访问
    if (testTwoDimExpr("全局二维数组访问", `globals
integer array mat [10][20]
endglobals
function test takes nothing returns nothing
set mat[5][10] = 50
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        if (target instanceof BinaryExpression && target.operator === OperatorType.Index) {
            const left = target.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                return true;
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 5: 二维数组在函数调用中
    if (testTwoDimExpr("二维数组在函数调用中", `function test takes nothing returns nothing
local integer array mat [3][4]
call BJDebugMsg(I2S(mat[1][2]))
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) {
            if (p.errors.errors.length > 0) {
                console.log(`    解析错误: ${p.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) {
            return false;
        }
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) {
            return false;
        }
        const args = callStmt.expression.arguments;
        if (args.length === 0) {
            return false;
        }
        // BJDebugMsg 的第一个参数是 I2S(mat[1][2])，这是一个 CallExpression
        const arg = args[0];
        if (!(arg instanceof CallExpression)) {
            return false;
        }
        // 检查 I2S 的参数，应该是 mat[1][2]
        const i2sArgs = arg.arguments;
        if (i2sArgs.length === 0) {
            return false;
        }
        const matArg = i2sArgs[0];
        // 检查是否是二维数组访问：matArg 应该是 BinaryExpression(Index, BinaryExpression(Index, mat, 1), 2)
        if (!(matArg instanceof BinaryExpression)) {
            return false;
        }
        if (matArg.operator !== OperatorType.Index) {
            return false;
        }
        // 检查内层：matArg.left 应该是 BinaryExpression(Index, mat, 1)
        const left = matArg.left;
        if (!(left instanceof BinaryExpression)) {
            return false;
        }
        if (left.operator !== OperatorType.Index) {
            return false;
        }
        // 检查内层的 left 是否是 mat 标识符
        if (!(left.left instanceof Identifier) || left.left.toString() !== "mat") {
            return false;
        }
        // 检查索引值（可以是 IntegerLiteral 或其他表达式）
        // 第一个索引应该是 1
        if (!(left.right instanceof IntegerLiteral) || left.right.value !== 1) {
            return false;
        }
        // 第二个索引应该是 2
        if (!(matArg.right instanceof IntegerLiteral) || matArg.right.value !== 2) {
            return false;
        }
        return true;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 6: 二维数组在条件表达式中
    if (testTwoDimExpr("二维数组在条件表达式中", `function test takes nothing returns nothing
local integer array mat [5][5]
if mat[2][3] > 0 then
call BJDebugMsg("positive")
endif
endfunction`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const ifStmt = func.body.body.find((s: Statement) => s instanceof IfStatement);
        if (!(ifStmt instanceof IfStatement)) return false;
        const condition = ifStmt.condition;
        if (condition instanceof BinaryExpression) {
            const left = condition.left;
            if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                const nestedLeft = left.left;
                if (nestedLeft instanceof BinaryExpression && nestedLeft.operator === OperatorType.Index) {
                    return true;
                }
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    // 测试 7: 成员访问后的二维数组访问
    if (testTwoDimExpr("成员访问后的二维数组访问", `struct Matrix
integer array data [10][20]
endstruct
function test takes nothing returns nothing
local Matrix m = Matrix.create()
set m.data[5][10] = 100
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration);
        if (!(func instanceof FunctionDeclaration)) return false;
        const setStmt = func.body.body.find((s: Statement) => s instanceof AssignmentStatement);
        if (!(setStmt instanceof AssignmentStatement)) return false;
        const target = setStmt.target;
        // 应该是 m.data[5][10]，即 Dot(m, Index(Index(data, 5), 10))
        if (target instanceof BinaryExpression) {
            if (target.operator === OperatorType.Index) {
                const left = target.left;
                if (left instanceof BinaryExpression && left.operator === OperatorType.Index) {
                    return true;
                }
            }
        }
        return false;
    })) twoDimExprPassed++; else twoDimExprFailed++;
    
    console.log(`\n二维数组表达式访问测试结果: 通过 ${twoDimExprPassed}, 失败 ${twoDimExprFailed}`);
    
    // 测试 18: module 功能测试
    console.log("\n测试 18: module 功能测试");
    let modulePassed = 0;
    let moduleFailed = 0;
    
    const testModule = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 module 声明
    if (testModule("基本 module 声明", `module MyModule
method repeat1000 takes nothing returns nothing
local integer i=0
loop
exitwhen i==1000
set i=i+1
endloop
endmethod
endmodule`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        return moduleDecl.name?.toString() === "MyModule" && moduleDecl.members.length === 1;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 2: struct 实现 module
    if (testModule("struct 实现 module", `module MyRepeatModule
method repeat1000 takes nothing returns nothing
local integer i=0
loop
exitwhen i==1000
call this.sub()
set i=i+1
endloop
endmethod
endmodule
struct MyStruct
method sub takes nothing returns nothing
call BJDebugMsg("Hello world")
endmethod
implement MyRepeatModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const implementStmt = structDecl.members.find((m: Statement) => m instanceof ImplementStatement);
        return implementStmt !== undefined && implementStmt instanceof ImplementStatement && 
               implementStmt.moduleName.toString() === "MyRepeatModule" && !implementStmt.isOptional;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 3: module 内部 implement optional
    if (testModule("module 内部 implement optional", `module MyOtherModule
method uhOh takes nothing returns nothing
endmethod
endmodule
module MyModule
implement optional MyOtherModule
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endmodule`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration && s.name?.toString() === "MyModule");
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const implementStmt = moduleDecl.members.find((m: Statement) => m instanceof ImplementStatement);
        return implementStmt !== undefined && implementStmt instanceof ImplementStatement && 
               implementStmt.moduleName.toString() === "MyOtherModule" && implementStmt.isOptional;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 4: struct 实现多个 module
    if (testModule("struct 实现多个 module", `module ModuleA
method methodA takes nothing returns nothing
endmethod
endmodule
module ModuleB
method methodB takes nothing returns nothing
endmethod
endmodule
struct MyStruct
integer a
integer b
implement ModuleA
implement ModuleB
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const implementStmts = structDecl.members.filter((m: Statement) => m instanceof ImplementStatement);
        return implementStmts.length === 2;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 5: module 中的静态方法
    if (testModule("module 中的静态方法", `module SwapModule
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endmodule
struct MyStruct
integer a
integer b
integer c
method copy takes MyStruct x returns nothing
set this.a = x.a
set this.b = x.b
set this.c = x.c
endmethod
implement SwapModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const method = moduleDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined && method instanceof MethodDeclaration && method.isStatic;
    })) modulePassed++; else moduleFailed++;
    
    // 测试 6: module 中的私有方法
    if (testModule("module 中的私有方法", `module PrivateModule
private method privateMethod takes nothing returns nothing
call BJDebugMsg("private")
endmethod
public method publicMethod takes nothing returns nothing
call this.privateMethod()
endmethod
endmodule
struct MyStruct
implement PrivateModule
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const moduleDecl = r.body.find((s: Statement) => s instanceof ModuleDeclaration);
        if (!(moduleDecl instanceof ModuleDeclaration)) return false;
        const methods = moduleDecl.members.filter((m: Statement) => m instanceof MethodDeclaration);
        return methods.length === 2;
    })) modulePassed++; else moduleFailed++;
    
    console.log(`\nmodule 测试结果: 通过 ${modulePassed}, 失败 ${moduleFailed}`);
    
    // 测试 19: delegate 功能测试
    console.log("\n测试 19: delegate 功能测试");
    let delegatePassed = 0;
    let delegateFailed = 0;
    
    const testDelegate = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 delegate 声明
    if (testDelegate("基本 delegate 声明", `struct A
private real x
private real y
public method performAction takes nothing returns nothing
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
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegateDecl = structB.members.find((m: Statement) => m instanceof DelegateDeclaration);
        return delegateDecl !== undefined && delegateDecl instanceof DelegateDeclaration && 
               delegateDecl.delegateType.toString() === "A" && delegateDecl.name.toString() === "deleg" && !delegateDecl.isPrivate;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 2: private delegate
    if (testDelegate("private delegate", `struct A
method test takes nothing returns nothing
endmethod
endstruct
struct B
private delegate A privDeleg
delegate A pubDeleg
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        if (delegates.length !== 2) return false;
        const privDelegate = delegates.find((d: Statement) => d instanceof DelegateDeclaration && d.name.toString() === "privDeleg");
        const pubDelegate = delegates.find((d: Statement) => d instanceof DelegateDeclaration && d.name.toString() === "pubDeleg");
        return privDelegate !== undefined && pubDelegate !== undefined &&
               privDelegate instanceof DelegateDeclaration && privDelegate.isPrivate &&
               pubDelegate instanceof DelegateDeclaration && !pubDelegate.isPrivate;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 3: 多个 delegate
    if (testDelegate("多个 delegate", `struct A
method methodA takes nothing returns nothing
endmethod
endstruct
struct C
method methodC takes nothing returns nothing
endmethod
endstruct
struct B
delegate A delegA
delegate C delegC
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        return delegates.length === 2;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 4: delegate 与变量声明混合
    if (testDelegate("delegate 与变量声明混合", `struct A
method test takes nothing returns nothing
endmethod
endstruct
struct B
integer x
delegate A deleg
integer y
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        const variables = structB.members.filter((m: Statement) => m instanceof VariableDeclaration);
        return delegates.length === 1 && variables.length === 2;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 5: delegate 与 method 混合
    if (testDelegate("delegate 与 method 混合", `struct A
method performAction takes nothing returns nothing
endmethod
endstruct
struct B
delegate A deleg
method myMethod takes nothing returns nothing
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegates = structB.members.filter((m: Statement) => m instanceof DelegateDeclaration);
        const methods = structB.members.filter((m: Statement) => m instanceof MethodDeclaration);
        return delegates.length === 1 && methods.length === 1;
    })) delegatePassed++; else delegateFailed++;
    
    // 测试 6: delegate 到接口类型
    if (testDelegate("delegate 到接口类型", `interface IAction
method perform takes nothing returns nothing
endinterface
struct A implements IAction
method perform takes nothing returns nothing
endmethod
endstruct
struct B
delegate IAction action
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const structB = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "B");
        if (!(structB instanceof StructDeclaration)) return false;
        const delegateDecl = structB.members.find((m: Statement) => m instanceof DelegateDeclaration);
        return delegateDecl !== undefined && delegateDecl instanceof DelegateDeclaration && 
               delegateDecl.delegateType.toString() === "IAction";
    })) delegatePassed++; else delegateFailed++;
    
    console.log(`\ndelegate 测试结果: 通过 ${delegatePassed}, 失败 ${delegateFailed}`);
    
    // 测试 20: stub 方法功能测试
    console.log("\n测试 20: stub 方法功能测试");
    let stubPassed = 0;
    let stubFailed = 0;
    
    const testStub = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 stub method 声明
    if (testStub("基本 stub method 声明", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && method.name?.toString() === "xx";
    })) stubPassed++; else stubFailed++;
    
    // 测试 2: stub method 被子结构重写
    if (testStub("stub method 被子结构重写", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct
struct ChildA extends Parent
method xx takes nothing returns nothing
call BJDebugMsg("Child A")
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const parentStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Parent") as StructDeclaration | undefined;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "ChildA") as StructDeclaration | undefined;
        if (!parentStruct || !childStruct) return false;
        const parentMethod = parentStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx") as MethodDeclaration | undefined;
        const childMethod = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx") as MethodDeclaration | undefined;
        return parentMethod?.isStub === true && childMethod?.isStub === false;
    })) stubPassed++; else stubFailed++;
    
    // 测试 3: stub method 带参数和返回值
    if (testStub("stub method 带参数和返回值", `struct TestStruct
stub method calculate takes integer x, integer y returns integer
return 0
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && 
               method.parameters.length === 2 && 
               method.returnType?.toString() === "integer";
    })) stubPassed++; else stubFailed++;
    
    // 测试 4: static stub method
    if (testStub("static stub method", `struct TestStruct
static stub method create takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration) as MethodDeclaration | undefined;
        return method !== undefined && method.isStub === true && method.isStatic === true;
    })) stubPassed++; else stubFailed++;
    
    // 测试 5: stub method 在 interface 中（应该不支持，但测试解析是否正常）
    if (testStub("stub method 在 interface 中（解析测试）", `interface TestInterface
stub method test takes nothing returns nothing
endinterface`, (r, p) => {
        // interface 中的 method 声明通常不需要 body，但 stub 在 interface 中可能不合法
        // 这里只测试解析是否正常，不测试语义
        if (r.body.length === 0) return false;
        const interfaceDecl = r.body.find((s: Statement) => s instanceof InterfaceDeclaration);
        return interfaceDecl !== undefined;
    })) stubPassed++; else stubFailed++;
    
    console.log(`\nstub 方法测试结果: 通过 ${stubPassed}, 失败 ${stubFailed}`);
    
    // 测试 21: super 语句功能测试
    console.log("\n测试 21: super 语句功能测试");
    let superPassed = 0;
    let superFailed = 0;
    
    const testSuper = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 super 调用（文档示例）
    if (testSuper("基本 super 调用（文档示例）", `struct Parent
stub method xx takes nothing returns nothing
call BJDebugMsg("Parent")
endmethod
endstruct
struct ChildA extends Parent
method xx takes nothing returns nothing
call BJDebugMsg("- Child A -")
call super.xx()
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "ChildA");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "xx");
        if (!(method instanceof MethodDeclaration)) return false;
        // 检查方法体中是否有 super.xx() 调用
        const callStmts = method.body.body.filter((s: Statement) => s instanceof CallStatement);
        return callStmts.length > 0;
    })) superPassed++; else superFailed++;
    
    // 测试 2: super 调用带参数的方法
    if (testSuper("super 调用带参数的方法", `struct Parent
stub method calculate takes integer x, integer y returns integer
return x + y
endmethod
endstruct
struct Child extends Parent
method calculate takes integer x, integer y returns integer
local integer result = super.calculate(x, y)
return result * 2
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 3: super 调用返回值的父方法
    if (testSuper("super 调用返回值的父方法", `struct Parent
stub method getValue takes nothing returns integer
return 10
endmethod
endstruct
struct Child extends Parent
method getValue takes nothing returns integer
return super.getValue() + 5
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 4: 多层继承中的 super 调用
    if (testSuper("多层继承中的 super 调用", `struct GrandParent
stub method test takes nothing returns nothing
call BJDebugMsg("GrandParent")
endmethod
endstruct
struct Parent extends GrandParent
method test takes nothing returns nothing
call BJDebugMsg("Parent")
call super.test()
endmethod
endstruct
struct Child extends Parent
method test takes nothing returns nothing
call BJDebugMsg("Child")
call super.test()
endmethod
endstruct`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        if (!(childStruct instanceof StructDeclaration)) return false;
        const method = childStruct.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) superPassed++; else superFailed++;
    
    // 测试 5: super 在静态方法中（应该不支持，但测试解析是否正常）
    if (testSuper("super 在静态方法中（解析测试）", `struct Parent
stub method test takes nothing returns nothing
endmethod
endstruct
struct Child extends Parent
static method test takes nothing returns nothing
call super.test()
endmethod
endstruct`, (r, p) => {
        // 静态方法中不应该使用 super，但这里只测试解析是否正常
        if (r.body.length < 2) return false;
        const childStruct = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "Child");
        return childStruct !== undefined;
    })) superPassed++; else superFailed++;
    
    console.log(`\nsuper 语句测试结果: 通过 ${superPassed}, 失败 ${superFailed}`);
    
    // 测试 22: thistype 关键字功能测试
    console.log("\n测试 22: thistype 关键字功能测试");
    let thistypePassed = 0;
    let thistypeFailed = 0;
    
    const testThistype = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本 thistype 使用（文档示例）
    if (testThistype("基本 thistype 使用（文档示例）", `struct test
thistype array ts
method tester takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration && s.name?.toString() === "test");
        if (!(structDecl instanceof StructDeclaration)) return false;
        // 检查是否有 thistype array ts 成员
        const varDecl = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration);
        if (!(varDecl instanceof VariableDeclaration)) return false;
        // 检查方法
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "tester");
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 2: thistype 作为变量类型
    if (testThistype("thistype 作为变量类型", `struct Node
thistype next
thistype prev
integer value
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecls = structDecl.members.filter((m: Statement) => m instanceof VariableDeclaration);
        return varDecls.length >= 3;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 3: thistype 作为方法返回类型
    if (testThistype("thistype 作为方法返回类型", `struct Factory
static method create takes nothing returns thistype
return thistype.allocate()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration && m.name?.toString() === "create");
        if (!(method instanceof MethodDeclaration)) return false;
        return method.isStatic === true;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 4: thistype 作为方法参数类型
    if (testThistype("thistype 作为方法参数类型", `struct Node
static method swap takes thistype A, thistype B returns nothing
local thistype C = thistype.allocate()
call C.copy(A)
call A.copy(B)
call B.copy(C)
call C.destroy()
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 5: thistype.allocate() 调用
    if (testThistype("thistype.allocate() 调用", `struct Test
static method create takes nothing returns thistype
local thistype instance = thistype.allocate()
return instance
endmethod
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const method = structDecl.members.find((m: Statement) => m instanceof MethodDeclaration);
        return method !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    // 测试 6: thistype 数组声明
    if (testThistype("thistype 数组声明", `struct Container
thistype array items[100]
integer count = 0
endstruct`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        const structDecl = r.body.find((s: Statement) => s instanceof StructDeclaration);
        if (!(structDecl instanceof StructDeclaration)) return false;
        const varDecl = structDecl.members.find((m: Statement) => m instanceof VariableDeclaration && (m as VariableDeclaration).isArray);
        return varDecl !== undefined;
    })) thistypePassed++; else thistypeFailed++;
    
    console.log(`\nthistype 关键字测试结果: 通过 ${thistypePassed}, 失败 ${thistypeFailed}`);
    
    // 测试 23: 函数接口功能测试
    console.log("\n测试 23: 函数接口功能测试");
    let functionInterfacePassed = 0;
    let functionInterfaceFailed = 0;
    
    const testFunctionInterface = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };
    
    // 测试 1: 基本函数接口声明（文档示例）
    if (testFunctionInterface("基本函数接口声明（文档示例）", `function interface Arealfunction takes real x returns real
function double takes real x returns real
return x*2.0
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.name?.toString() === "Arealfunction" && 
               funcInterface.parameters.length === 1 &&
               funcInterface.returnType?.toString() === "real";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 2: 函数接口带多个参数
    if (testFunctionInterface("函数接口带多个参数", `function interface MathFunc takes real x, real y returns real
function add takes real x, real y returns real
return x + y
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 3: 函数接口返回 nothing
    if (testFunctionInterface("函数接口返回 nothing", `function interface ActionFunc takes nothing returns nothing
function doSomething takes nothing returns nothing
call BJDebugMsg("test")
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 0 && funcInterface.returnType === null;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 4: 函数接口带自定义类型参数
    if (testFunctionInterface("函数接口带自定义类型参数", `struct Point
real x
real y
endstruct
function interface PointFunc takes Point p returns real
function getDistance takes Point p returns real
return p.x + p.y
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.parameters.length === 1 && 
               funcInterface.parameters[0].type?.toString() === "Point";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 5: 函数接口返回自定义类型
    if (testFunctionInterface("函数接口返回自定义类型", `struct Factory
integer value
endstruct
function interface FactoryFunc takes integer x returns Factory
function create takes integer x returns Factory
local Factory f = Factory.create()
set f.value = x
return f
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        if (!(funcInterface instanceof FunctionInterfaceDeclaration)) return false;
        return funcInterface.returnType?.toString() === "Factory";
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 6: 多个函数接口声明
    if (testFunctionInterface("多个函数接口声明", `function interface Func1 takes real x returns real
function interface Func2 takes integer x returns integer
function test1 takes real x returns real
return x
endfunction
function test2 takes integer x returns integer
return x
endfunction`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const funcInterfaces = r.body.filter((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        return funcInterfaces.length === 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    // 测试 7: 函数接口与普通函数混合
    if (testFunctionInterface("函数接口与普通函数混合", `function interface Callback takes nothing returns nothing
function normalFunc takes nothing returns nothing
call BJDebugMsg("normal")
endfunction
function callbackFunc takes nothing returns nothing
call BJDebugMsg("callback")
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const funcInterface = r.body.find((s: Statement) => s instanceof FunctionInterfaceDeclaration);
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration);
        return funcInterface !== undefined && funcs.length >= 2;
    })) functionInterfacePassed++; else functionInterfaceFailed++;
    
    console.log(`\n函数接口测试结果: 通过 ${functionInterfacePassed}, 失败 ${functionInterfaceFailed}`);

    // 测试 24: JASS type 声明解析测试（来自 common.j 片段 + 动态数组）
    console.log("\n测试 24: JASS type 声明解析测试");
    let typePassed = 0;
    let typeFailed = 0;

    const testTypeDecl = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 测试 1: 来自 common.j 的基础类型声明
    if (testTypeDecl("common.j 基础类型声明", `type effecttype extends handle
type weathereffect extends handle
type terraindeformation extends handle
type fogstate extends handle
type fogmodifier extends agent
type dialog extends agent`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 6) return false;
        const expected: [string, string][] = [
            ["effecttype", "handle"],
            ["weathereffect", "handle"],
            ["terraindeformation", "handle"],
            ["fogstate", "handle"],
            ["fogmodifier", "agent"],
            ["dialog", "agent"]
        ];
        return expected.every(([n, b], i) => 
            types[i].name.toString() === n && types[i].baseType.toString() === b
        );
    })) typePassed++; else typeFailed++;

    // 测试 2: 自定义普通类型声明
    if (testTypeDecl("自定义普通类型声明", `type myhandle extends handle`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        return types.length === 1 &&
               types[0].name.toString() === "myhandle" &&
               types[0].baseType.toString() === "handle" &&
               !types[0].isArray;
    })) typePassed++; else typeFailed++;

    // 测试 3: 动态数组类型声明（文档示例 type arsample extends integer array[8]）
    if (testTypeDecl("动态数组类型声明（简单）", `type arsample extends integer array[8]`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 1) return false;
        const t = types[0];
        return t.isArray &&
               t.name.toString() === "arsample" &&
               t.baseType.toString() === "integer" &&
               !!t.elementSize &&
               t.elementSize.toString() === "8" &&
               t.storageSize === null;
    })) typePassed++; else typeFailed++;

    // 测试 4: 动态数组类型声明带扩展存储（type myDyArray extends integer array [200,40000]）
    if (testTypeDecl("动态数组类型声明（扩展存储）", `type myDyArray extends integer array [200,40000]`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const types = r.body.filter((s: Statement) => s instanceof TypeDeclaration) as TypeDeclaration[];
        if (types.length !== 1) return false;
        const t = types[0];
        return t.isArray &&
               t.name.toString() === "myDyArray" &&
               t.baseType.toString() === "integer" &&
               !!t.elementSize &&
               t.elementSize.toString() === "200" &&
               !!t.storageSize &&
               t.storageSize.toString() === "40000";
    })) typePassed++; else typeFailed++;

    console.log(`\nJASS type 测试结果: 通过 ${typePassed}, 失败 ${typeFailed}`);

    // 测试 25: 冒号操作符语法糖（a:X）
    console.log("\n测试 25: 冒号操作符语法糖");
    let colonPassed = 0;
    let colonFailed = 0;

    const testColon = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map(e => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 文档示例：set X[a] = 10 与 set a:X = 10 等价
    if (testColon("基本冒号赋值（文档示例）", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = 10
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 只需验证解析无错即可
        return true;
    })) colonPassed++; else colonFailed++;

    // 文档示例：set X[a] = X[a] + 10 与 set a:X = a:X + 10 等价
    if (testColon("冒号作为表达式（文档示例）", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = a:X + 10
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 1：冒号出现在右值表达式中
    if (testColon("冒号出现在右值表达式中", `function test takes nothing returns nothing
local integer a=3
local integer array X
local integer y
set y = a:X * 2 + 5
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 2：混合使用 X[a] 和 a:X
    if (testColon("混合使用 X[a] 和 a:X", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:X = X[a] + a:X
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 复杂场景 3：冒号作为函数调用参数
    if (testColon("冒号作为函数调用参数", `function foo takes integer v returns nothing
endfunction
function test takes nothing returns nothing
local integer a=3
local integer array X
call foo(a:X)
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        return true;
    })) colonPassed++; else colonFailed++;

    // 非法用法 1：3:X 应该产生解析错误（根据文档，仅能用于变量）
    if (testColon("非法用法：3:X", `function test takes nothing returns nothing
local integer array X
set 3:X = 1000
endfunction`, (r, p) => {
        // 期望有语法错误
        return p.errors.errors.length > 0;
    })) colonPassed++; else colonFailed++;

    // 非法用法 2：a:3 也应产生错误，因为 ':' 后需要数组名标识符
    if (testColon("非法用法：a:3", `function test takes nothing returns nothing
local integer a=3
local integer array X
set a:3 = 1000
endfunction`, (r, p) => {
        return p.errors.errors.length > 0;
    })) colonPassed++; else colonFailed++;

    console.log(`\n冒号操作符测试结果: 通过 ${colonPassed}, 失败 ${colonFailed}`);

    // 测试 26: 函数对象内置方法 (.evaluate, .execute, .name)
    console.log("\n测试 26: 函数对象内置方法");
    let functionObjectPassed = 0;
    let functionObjectFailed = 0;

    const testFunctionObject = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            functionObjectPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            functionObjectFailed++;
            return false;
        }
    };

    // 测试函数对象的 .evaluate 方法
    if (testFunctionObject("函数对象的 .evaluate 方法", `function A takes real x returns real
    return x * 2.0
endfunction
function test takes nothing returns real
    return A.evaluate(5.0)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testFunc = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(testFunc instanceof FunctionDeclaration)) return false;
        const returnStmt = testFunc.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        // 应该是 CallExpression，callee 是 BinaryExpression (A.evaluate)
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .execute 方法
    if (testFunctionObject("函数对象的 .execute 方法", `function DestroyEffectAfter takes effect fx, real t returns nothing
    call TriggerSleepAction(t)
    call DestroyEffect(fx)
endfunction
function test takes nothing returns nothing
    call DestroyEffectAfter.execute(null, 3.0)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const testFunc = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(testFunc instanceof FunctionDeclaration)) return false;
        const callStmt = testFunc.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const expr = callStmt.expression;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "execute") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .name 属性
    if (testFunctionObject("函数对象的 .name 属性", `scope test
public function xxx takes nothing returns nothing
    call BJDebugMsg(xxx.name)
endfunction
endscope`, (r, p) => {
        if (r.body.length === 0 || p.errors.errors.length > 0) return false;
        // scope 被解析为 BlockStatement，查找其中的函数
        const scope = r.body.find((s: Statement) => s instanceof BlockStatement);
        if (!(scope instanceof BlockStatement)) return false;
        const func = scope.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "xxx");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        if (args.length > 0) {
            const arg = args[0];
            // 应该是 BinaryExpression (xxx.name)
            if (arg instanceof BinaryExpression && arg.operator === OperatorType.Dot) {
                const right = arg.right;
                if (right instanceof Identifier && right.toString() === "name") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    // 测试函数对象的 .evaluate 用于相互递归
    if (testFunctionObject("函数对象的 .evaluate 用于相互递归", `function A takes real x returns real
    if (GetRandomInt(0,1) == 0) then
        return B.evaluate(x * 0.02)
    endif
    return x
endfunction
function B takes real x returns real
    if (GetRandomInt(0,1) == 1) then
        return A(x * 1000.)
    endif
    return x
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const funcA = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "A");
        if (!(funcA instanceof FunctionDeclaration)) return false;
        const returnStmt = funcA.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) functionObjectPassed++; else functionObjectFailed++;

    console.log(`\n函数对象内置方法测试结果: 通过 ${functionObjectPassed}, 失败 ${functionObjectFailed}`);

    // 测试 27: 方法对象内置方法 (.evaluate, .execute, .name, .exists)
    console.log("\n测试 27: 方法对象内置方法");
    let methodObjectPassed = 0;
    let methodObjectFailed = 0;

    const testMethodObject = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            methodObjectPassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            methodObjectFailed++;
            return false;
        }
    };

    // 测试静态方法的 .name 属性
    if (testMethodObject("静态方法的 .name 属性", `struct mystruct
static method mymethod takes nothing returns nothing
    call BJDebugMsg("this works")
endmethod
endstruct
function myfunction takes nothing returns nothing
    call ExecuteFunc(mystruct.mymethod.name)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "myfunction");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const args = callStmt.expression.arguments;
        if (args.length > 0) {
            const arg = args[0];
            // 应该是 BinaryExpression (mystruct.mymethod.name)
            // 这是一个链式成员访问：mystruct -> mymethod -> name
            if (arg instanceof BinaryExpression && arg.operator === OperatorType.Dot) {
                const right = arg.right;
                if (right instanceof Identifier && right.toString() === "name") {
                    // 检查左操作数是否是 mystruct.mymethod
                    const left = arg.left;
                    if (left instanceof BinaryExpression && left.operator === OperatorType.Dot) {
                        return true;
                    }
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试方法的 .exists 属性
    if (testMethodObject("方法的 .exists 属性", `interface myInterface
method myMethod1 takes nothing returns nothing
method myMethod2 takes nothing returns nothing
endinterface
struct myStruct
method myMethod1 takes nothing returns nothing
    call BJDebugMsg("er")
endmethod
endstruct
function test takes nothing returns nothing
    local myInterface mi = myStruct.create()
    if (mi.myMethod1.exists) then
        call BJDebugMsg("Yes")
    endif
    if (mi.myMethod2.exists) then
        call BJDebugMsg("Yes")
    else
        call BJDebugMsg("No")
    endif
endfunction`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        // 查找 if 语句中的 .exists 访问
        const ifStmts = func.body.body.filter((s: Statement) => s instanceof IfStatement);
        if (ifStmts.length < 2) return false;
        // 检查第一个 if 语句的条件
        const firstIf = ifStmts[0] as IfStatement;
        const condition = firstIf.condition;
        if (condition instanceof BinaryExpression && condition.operator === OperatorType.Dot) {
            const right = condition.right;
            if (right instanceof Identifier && right.toString() === "exists") {
                return true;
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试方法的 .evaluate 方法
    if (testMethodObject("方法的 .evaluate 方法", `struct TestStruct
method calculate takes integer x returns integer
    return x * 2
endmethod
endstruct
function test takes nothing returns integer
    local TestStruct ts = TestStruct.create()
    return ts.calculate.evaluate(5)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        const returnStmt = func.body.body.find((s: Statement) => s instanceof ReturnStatement);
        if (!(returnStmt instanceof ReturnStatement)) return false;
        const expr = returnStmt.argument;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            // 应该是 ts.calculate.evaluate
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "evaluate") {
                    return true;
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    // 测试静态方法的 .execute 方法
    if (testMethodObject("静态方法的 .execute 方法", `struct Worker
static method doWork takes integer id returns nothing
    call BJDebugMsg("Working: " + I2S(id))
endmethod
endstruct
function test takes nothing returns nothing
    call Worker.doWork.execute(42)
endfunction`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const func = r.body.find((s: Statement) => s instanceof FunctionDeclaration && s.name?.toString() === "test");
        if (!(func instanceof FunctionDeclaration)) return false;
        const callStmt = func.body.body.find((s: Statement) => s instanceof CallStatement);
        if (!(callStmt instanceof CallStatement)) return false;
        const expr = callStmt.expression;
        if (expr instanceof CallExpression) {
            const callee = expr.callee;
            // 应该是 Worker.doWork.execute
            if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
                const right = callee.right;
                if (right instanceof Identifier && right.toString() === "execute") {
                    return true;
                }
            }
        }
        return false;
    })) methodObjectPassed++; else methodObjectFailed++;

    console.log(`\n方法对象内置方法测试结果: 通过 ${methodObjectPassed}, 失败 ${methodObjectFailed}`);

    // 测试 28: constant native 函数功能测试
    console.log("\n测试 28: constant native 函数功能测试");
    let constantNativePassed = 0;
    let constantNativeFailed = 0;

    const testConstantNative = (name: string, code: string, validator: (result: any, parser: Parser) => boolean): boolean => {
        const parser = new Parser(code);
        const result = parser.parse();
        if (validator(result, parser)) {
            console.log(`  ✓ ${name}`);
            constantNativePassed++;
            return true;
        } else {
            console.log(`  ✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`    错误: ${parser.errors.errors.map(e => e.message).join(', ')}`);
            }
            constantNativeFailed++;
            return false;
        }
    };

    // 测试 1: 基本 constant native 函数声明（来自 common.j）
    if (testConstantNative("基本 constant native 函数声明（来自 common.j）", `constant native GetTriggeringTrigger takes nothing returns trigger
constant native GetTriggerEventId takes nothing returns eventid
constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 4) return false;
        // 检查所有函数都是 constant native
        return natives.every(f => f.isConstant === true) &&
               natives[0].name?.toString() === "GetTriggeringTrigger" &&
               natives[1].name?.toString() === "GetTriggerEventId" &&
               natives[2].name?.toString() === "GetTriggerEvalCount" &&
               natives[3].name?.toString() === "GetTriggerExecCount";
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 2: constant native 与普通 native 混合
    if (testConstantNative("constant native 与普通 native 混合", `native GetUnitX takes unit whichUnit returns real
constant native GetTriggeringTrigger takes nothing returns trigger
native GetUnitY takes unit whichUnit returns real`, (r, p) => {
        if (r.body.length < 3 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 3) return false;
        const getUnitX = natives.find(f => f.name?.toString() === "GetUnitX");
        const getTriggeringTrigger = natives.find(f => f.name?.toString() === "GetTriggeringTrigger");
        const getUnitY = natives.find(f => f.name?.toString() === "GetUnitY");
        return getUnitX !== undefined && getUnitX.isConstant === false &&
               getTriggeringTrigger !== undefined && getTriggeringTrigger.isConstant === true &&
               getUnitY !== undefined && getUnitY.isConstant === false;
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 3: constant native 带参数
    if (testConstantNative("constant native 带参数", `constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 2) return false;
        const evalCount = natives.find(f => f.name?.toString() === "GetTriggerEvalCount");
        const execCount = natives.find(f => f.name?.toString() === "GetTriggerExecCount");
        return evalCount !== undefined && evalCount.isConstant === true && evalCount.parameters.length === 1 &&
               execCount !== undefined && execCount.isConstant === true && execCount.parameters.length === 1;
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 4: constant native 带返回值
    if (testConstantNative("constant native 带返回值", `constant native GetTriggeringTrigger takes nothing returns trigger
constant native GetTriggerEventId takes nothing returns eventid`, (r, p) => {
        if (r.body.length < 2 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        if (natives.length !== 2) return false;
        const trigger = natives.find(f => f.name?.toString() === "GetTriggeringTrigger");
        const eventId = natives.find(f => f.name?.toString() === "GetTriggerEventId");
        return trigger !== undefined && trigger.isConstant === true && trigger.returnType?.toString() === "trigger" &&
               eventId !== undefined && eventId.isConstant === true && eventId.returnType?.toString() === "eventid";
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 5: constant native 的 toString 输出
    if (testConstantNative("constant native 的 toString 输出", `constant native GetTriggeringTrigger takes nothing returns trigger`, (r, p) => {
        if (r.body.length < 1 || p.errors.errors.length > 0) return false;
        const native = r.body.find((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration | undefined;
        if (!native) return false;
        const str = native.toString();
        return str.includes("constant") && str.includes("native") && str.includes("GetTriggeringTrigger");
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 6: constant native 与注释混合（来自 common.j 实际场景）
    if (testConstantNative("constant native 与注释混合（来自 common.j 实际场景）", `// 获取（当前被）触发的触发器
constant native GetTriggeringTrigger takes nothing returns trigger
// 获取触发器事件ID
constant native GetTriggerEventId takes nothing returns eventid
// 获取触发器条件数量
constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
// 获取触发器运行次数
constant native GetTriggerExecCount takes trigger whichTrigger returns integer`, (r, p) => {
        if (r.body.length < 4 || p.errors.errors.length > 0) return false;
        const natives = r.body.filter((s: Statement) => s instanceof NativeDeclaration) as NativeDeclaration[];
        return natives.length === 4 && natives.every(f => f.isConstant === true);
    })) constantNativePassed++; else constantNativeFailed++;

    // 测试 7: constant function 应该报错（不合法）
    if (testConstantNative("constant function 应该报错（不合法）", `constant function TestFunc takes nothing returns nothing
endfunction`, (r, p) => {
        // 应该报错：constant function 不合法
        return p.errors.errors.length > 0 && 
               p.errors.errors.some(e => e.message.includes("constant function") && e.message.includes("not allowed"));
    })) constantNativePassed++; else constantNativeFailed++;

    console.log(`\nconstant native 函数测试结果: 通过 ${constantNativePassed}, 失败 ${constantNativeFailed}`);

    // 测试 31: textmacro 和 runtextmacro 功能测试
    console.log("\n测试 31: textmacro 和 runtextmacro 功能测试");
    let textMacroPassed = 0;
    let textMacroFailed = 0;

    const { TextMacroRegistry } = require('./text-macro-registry');
    const { TextMacroCollector } = require('./text-macro-collector');
    const { TextMacroExpander } = require('./text-macro-expander');

    const testTextMacro = (name: string, code: string, validator: (result: any, parser: Parser) => boolean) => {
        // 先收集 textmacro
        const registry = TextMacroRegistry.getInstance();
        registry.clear(); // 清空注册表
        
        const collector = new TextMacroCollector(registry);
        const expander = new TextMacroExpander(registry);
        
        // 收集 textmacro
        collector.collectFromFile('test.j', code);
        
        // 使用 expander 解析
        const parser = new Parser(code, 'test.j', expander);
        const result = parser.parse();
        
        if (validator(result, parser)) {
            console.log(`✓ ${name}`);
            return true;
        } else {
            console.log(`✗ ${name}`);
            if (parser.errors.errors.length > 0) {
                console.log(`  错误: ${parser.errors.errors.map((e: any) => e.message).join(", ")}`);
            }
            return false;
        }
    };

    // 测试 1: 基本 textmacro 定义和展开
    if (testTextMacro("基本 textmacro 定义和展开", `//! textmacro asdgspfnsa takes args
    function func_$args$ takes nothing returns nothing
    endfunction
//! endtextmacro

type hgoashgo extends integer

//! runtextmacro asdgspfnsa("diap")

call func_diap()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 应该能找到展开后的函数 func_diap
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const funcDiap = funcs.find(f => f.name?.toString() === "func_diap");
        return funcDiap !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 2: textmacro 无参数
    if (testTextMacro("textmacro 无参数", `//! textmacro SimpleMacro
    function SimpleFunc takes nothing returns nothing
        call BJDebugMsg("Hello")
    endfunction
//! endtextmacro

//! runtextmacro SimpleMacro()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const simpleFunc = funcs.find(f => f.name?.toString() === "SimpleFunc");
        return simpleFunc !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 3: textmacro 多参数
    if (testTextMacro("textmacro 多参数", `//! textmacro CreateFunc takes TYPE, NAME
    function Get$NAME$ takes nothing returns $TYPE$
        return 0
    endfunction
//! endtextmacro

//! runtextmacro CreateFunc("integer", "UnitCount")
//! runtextmacro CreateFunc("real", "UnitHealth")`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const getUnitCount = funcs.find(f => f.name?.toString() === "GetUnitCount");
        const getUnitHealth = funcs.find(f => f.name?.toString() === "GetUnitHealth");
        return getUnitCount !== undefined && getUnitHealth !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 4: textmacro 参数替换在函数名中
    if (testTextMacro("textmacro 参数替换在函数名中", `//! textmacro TestMacro takes SUFFIX
    function TestFunc_$SUFFIX$ takes nothing returns nothing
        call BJDebugMsg("test")
    endfunction
//! endtextmacro

//! runtextmacro TestMacro("ABC")`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const testFuncABC = funcs.find(f => f.name?.toString() === "TestFunc_ABC");
        return testFuncABC !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 5: textmacro 展开后调用生成的函数
    if (testTextMacro("textmacro 展开后调用生成的函数", `//! textmacro GenerateFunc takes NAME
    function $NAME$ takes nothing returns nothing
        call BJDebugMsg("$NAME$")
    endfunction
//! endtextmacro

//! runtextmacro GenerateFunc("MyFunc")

call MyFunc()`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        // 应该能找到函数定义
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const myFunc = funcs.find(f => f.name?.toString() === "MyFunc");
        // 应该能找到函数调用
        const calls = r.body.filter((s: Statement) => s instanceof CallStatement) as CallStatement[];
        const callMyFunc = calls.find(c => 
            c.expression.callee instanceof Identifier && 
            c.expression.callee.name === "MyFunc"
        );
        return myFunc !== undefined && callMyFunc !== undefined;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 6: textmacro 参数数量不匹配应该报错
    if (testTextMacro("textmacro 参数数量不匹配应该报错", `//! textmacro TestMacro takes ARG1, ARG2
    function Test takes nothing returns nothing
    endfunction
//! endtextmacro

//! runtextmacro TestMacro("only_one")`, (r, p) => {
        // 应该报错：参数数量不匹配
        return p.errors.errors.length > 0 && 
               p.errors.errors.some((e: any) => e.message.includes("expects") && e.message.includes("parameters"));
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 7: textmacro 不存在应该报错
    if (testTextMacro("textmacro 不存在应该报错", `//! runtextmacro NonExistentMacro("param")`, (r, p) => {
        // 应该报错：宏不存在
        return p.errors.errors.length > 0 && 
               p.errors.errors.some((e: any) => e.message.includes("not found"));
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 8: optional textmacro 不存在时不报错
    if (testTextMacro("optional textmacro 不存在时不报错", `//! runtextmacro optional NonExistentMacro("param")`, (r, p) => {
        // 可选宏不存在时不应该报错
        return p.errors.errors.length === 0;
    })) textMacroPassed++; else textMacroFailed++;

    // 测试 9: textmacro 在多个地方使用
    if (testTextMacro("textmacro 在多个地方使用", `//! textmacro CreateVar takes TYPE, NAME
    local $TYPE$ $NAME$ = 0
//! endtextmacro

function test takes nothing returns nothing
    //! runtextmacro CreateVar("integer", "x")
    //! runtextmacro CreateVar("real", "y")
    set x = 10
    set y = 3.14
endfunction`, (r, p) => {
        if (p.errors.errors.length > 0) return false;
        const funcs = r.body.filter((s: Statement) => s instanceof FunctionDeclaration) as FunctionDeclaration[];
        const testFunc = funcs.find(f => f.name?.toString() === "test");
        if (!testFunc) return false;
        // 检查函数体中是否有变量声明
        const vars = testFunc.body.body.filter((s: Statement) => s instanceof VariableDeclaration) as VariableDeclaration[];
        return vars.length >= 2;
    })) textMacroPassed++; else textMacroFailed++;

    console.log(`\ntextmacro 和 runtextmacro 测试结果: 通过 ${textMacroPassed}, 失败 ${textMacroFailed}`);

    console.log("\n=== 测试完成 ===");
}