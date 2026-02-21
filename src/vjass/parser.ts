import { Lexer, Token, TokenType, type IToken, type ILexer } from "./lexer";
import { ErrorCollection, SimpleError, SimpleWarning } from "./error";
// Position 类型定义在 ast.ts 中使用 { line: number, position: number } 格式
// 不再需要从 ast.ts 导入 Position
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
    ZincBlockStatement,
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
} from "./ast";
import { TextMacroExpander } from "./text-macro-expander";
import { InnerZincParser } from "./inner-zinc-parser";


/**
 * 语法分析器
 */
export class Parser {
    private readonly lexer!: ILexer;
    public filePath: string = "";
    private readonly textMacroExpander?: TextMacroExpander;
    private readonly originalSource: string; // 保存原始源代码，用于提取 zinc 块内容

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
        this.originalSource = content; // 保存原始源代码
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
            // 检查是否是注释，但不要跳过预处理器指令（//! inject, //! loaddata, //! zinc）
            else if (this.isComment()) {
                const commentToken = this.lexer.current();
                if (commentToken) {
                    const commentValue = commentToken.value || "";
                    // 检查是否是预处理器指令
                    const isInject = /^\s*\/\/!\s*inject\s+(main|config)\s*$/i.test(commentValue);
                    const isLoadData = /^\s*\/\/!\s*loaddata\s+"[^"]+"\s*$/i.test(commentValue);
                    const isZinc = /^\s*\/\/!\s+zinc\b/i.test(commentValue);
                    // 如果是预处理器指令，不要跳过，让 parseStatement 处理
                    if (!isInject && !isLoadData && !isZinc) {
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
            // 注意：如果 parseTextMacro 已经正确解析了 textmacro，那么 //! endtextmacro 应该已经被消费了
            // 如果这里遇到了 //! endtextmacro，可能是：
            // 1. textmacro 语法错误导致 parseTextMacro 提前返回，但 //! endtextmacro 仍然存在
            // 2. 确实存在不匹配的 //! endtextmacro
            // 为了修复误报，我们尝试跳过这个 token，而不是报错
            // 因为如果 textmacro 已经被正确解析，这个 token 不应该出现在这里
            if (/^\s*endtextmacro\b/i.test(directiveValue)) {
                // 检查是否真的没有匹配的 textmacro（通过检查前面是否有 textmacro）
                // 由于我们无法轻易回溯，这里采用更宽松的策略：
                // 如果遇到 endtextmacro，尝试静默跳过，因为如果 textmacro 已经正确解析，
                // 这个 token 不应该出现在这里（应该已经被消费了）
                // 只有在确实没有匹配的 textmacro 时才报错
                // 为了减少误报，我们暂时跳过这个检查，让 parseTextMacro 来处理
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
            
            // 检查是否是 //! zinc 指令
            if (/^\s*\/\/!\s+zinc\b/i.test(commentValue)) {
                return this.parseZincBlock();
            }
            
            // 检查是否是 //! endzinc 指令（应该由 parseZincBlock 处理，这里不应该单独出现）
            if (/^\s*\/\/!\s+endzinc\b/i.test(commentValue)) {
                this.error(
                    "Unexpected //! endzinc without matching //! zinc",
                    commentToken.start,
                    commentToken.end,
                    "Remove this //! endzinc directive or add a matching //! zinc directive before it."
                );
                this.lexer.next();
                return null;
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
        // 检查是否有 private 关键字（在 method 之前）
        // 注意：private 关键字在解析结构成员时可能已经被消费，所以这里不处理
        // 如果需要支持 private，应该在 MethodDeclaration 中添加 isPrivate 属性
        
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

        // 跳过注释和空白（在 native 和函数名之间可能有注释）
        while (this.isComment()) {
            this.lexer.next();
        }

        // 解析函数名
        // 注意：在 JASS 中，函数名可以是标识符，也可以是逻辑运算符（如 And, Or, Not）
        // 这些逻辑运算符在词法分析时被识别为运算符类型，但在函数名位置应该被识别为标识符
        const nameToken = this.lexer.current();
        let name: Identifier | null = null;
        if (nameToken) {
            // 检查是否是标识符或逻辑运算符（在函数名位置，逻辑运算符应该被视为标识符）
            const isIdentifier = nameToken.type === TokenType.Identifier;
            const isLogicalOperator = nameToken.type === TokenType.OperatorLogicalAnd ||
                                     nameToken.type === TokenType.OperatorLogicalOr ||
                                     nameToken.type === TokenType.OperatorLogicalNot;
            
            if (isIdentifier || isLogicalOperator) {
                name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                this.lexer.next();
            } else {
                // 如果当前 token 不是 Identifier 或逻辑运算符，可能是文件末尾或其他问题
                this.error(
                    `Expected native function name after 'native', but got '${nameToken.value}' (type: ${nameToken.type})`,
                    nameToken.start,
                    nameToken.end,
                    "Check if there is a valid function name after 'native' keyword."
                );
                return null;
            }
        } else {
            this.error(
                "Expected native function name after 'native', but reached end of input",
                nativeToken.end,
                nativeToken.end,
                "Add a function name after 'native' keyword."
            );
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
                // 对于类型关键字 token，需要获取对应的类型名称
                let typeName: string;
                if (token.type === TokenType.TypeInteger) {
                    typeName = "integer";
                } else if (token.type === TokenType.TypeReal) {
                    typeName = "real";
                } else if (token.type === TokenType.TypeString) {
                    typeName = "string";
                } else if (token.type === TokenType.TypeBoolean) {
                    typeName = "boolean";
                } else if (token.type === TokenType.TypeCode) {
                    typeName = "code";
                } else if (token.type === TokenType.TypeHandle) {
                    typeName = "handle";
                } else if (token.type === TokenType.TypeKey) {
                    typeName = "key";
                } else {
                    // 对于 Identifier token，使用 token.value
                    typeName = token.value;
                }
                const returnType = new Identifier(typeName, token.start, token.end);
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

            // 检查是否有 private 或 public 关键字（在 method 之前）
            // 注意：private/public 关键字会被消费，但 parseMethod 不处理它
            // 如果需要支持 private/public，应该在 MethodDeclaration 中添加 isPrivate/isPublic 属性
            let isPrivateMethod = false;
            let isPublicMethod = false;
            let isPublicStaticMethod = false;
            let isPrivateStaticMethod = false;
            
            if (this.checkValue("private")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    isPrivateMethod = true;
                    // 消费 private 关键字，但不消费 method，让 parseMethod 处理
                    this.lexer.next(); // 消费 private
                } else if (peekToken && peekToken.value?.toLowerCase() === "static") {
                    // 检查 private static method
                    // 先消费 private 和 static，然后检查是否是 method
                    this.lexer.next(); // 消费 private
                    this.lexer.next(); // 消费 static
                    const peekToken2 = this.lexer.peek();
                    if (peekToken2 && peekToken2.value?.toLowerCase() === "method") {
                        isPrivateStaticMethod = true;
                        // static 已经被消费，method 会在后面被 parseMethod 处理
                    }
                    // 注意：如果 peekToken2 不是 method，我们已经消费了 private 和 static
                    // 这会导致后续解析问题，但这种情况应该很少见（可能是语法错误）
                }
            } else if (this.checkValue("public")) {
                const peekToken = this.lexer.peek();
                if (peekToken && peekToken.value?.toLowerCase() === "method") {
                    isPublicMethod = true;
                    // 消费 public 关键字，但不消费 method，让 parseMethod 处理
                    this.lexer.next(); // 消费 public
                } else if (peekToken && peekToken.value?.toLowerCase() === "static") {
                    // 检查 public static method
                    // 先消费 public 和 static，然后检查是否是 method
                    this.lexer.next(); // 消费 public
                    this.lexer.next(); // 消费 static
                    const peekToken2 = this.lexer.peek();
                    if (peekToken2 && peekToken2.value?.toLowerCase() === "method") {
                        isPublicStaticMethod = true;
                        // static 已经被消费，method 会在后面被 parseMethod 处理
                    }
                    // 注意：如果 peekToken2 不是 method，我们已经消费了 public 和 static
                    // 这会导致后续解析问题，但这种情况应该很少见（可能是语法错误）
                }
            }

            // 尝试解析为方法声明（支持 stub method、public method、private method、public static method、private static method）
            if (this.checkValue("method") || (this.checkValue("stub") && this.lexer.peek()?.value?.toLowerCase() === "method")) {
                const member = this.parseMethod();
                if (member) {
                    // 根据 vjass.docs.txt，仅规定模块中不能使用 private；结构体的 onDestroy 可为 private，由生成的 destroy() 在同一结构内调用
                    // 如果是 public static method 或 private static method，设置 isStatic
                    if (isPublicStaticMethod || isPrivateStaticMethod) {
                        member.isStatic = true;
                    }
                    members.push(member);
                    continue;
                }
            } else if (this.checkValue("static") && !isPublicStaticMethod && !isPrivateStaticMethod) {
                // 检查是否是 static method 或 static stub method（而不是 static if）
                // 注意：如果已经是 public static method 或 private static method，static 已经被消费了
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
                
                // 解析完语句后，检查下一个 token 是否是结束标签
                // 跳过注释
                while (this.isComment()) {
                    this.lexer.next();
                }
                
                // 如果看到 endmodule，这是外层的 endmodule，应该停止
                // 注意：内层的结构会消费自己的结束标签，所以这里看到的 endmodule 是外层的
                if (this.checkValue("endmodule")) {
                    break;
                }
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
            // 检查是否是注释，但不要跳过预处理器指令（//! inject, //! loaddata, //! zinc）
            if (this.isComment()) {
                const commentToken = this.lexer.current();
                if (commentToken) {
                    const commentValue = commentToken.value || "";
                    // 检查是否是预处理器指令
                    const isInject = /^\s*\/\/!\s*inject\s+(main|config)\s*$/i.test(commentValue);
                    const isLoadData = /^\s*\/\/!\s*loaddata\s+"[^"]+"\s*$/i.test(commentValue);
                    const isZinc = /^\s*\/\/!\s+zinc\b/i.test(commentValue);
                    // 如果是预处理器指令，不要跳过，让 parseStatement 处理
                    if (!isInject && !isLoadData && !isZinc) {
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

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
                
                // 解析完语句后，检查下一个 token 是否是结束标签
                // 跳过注释
                while (this.isComment()) {
                    this.lexer.next();
                }
                
                // 如果看到 endlibrary，这是外层的 endlibrary，应该停止
                // 注意：内层的 library 或 scope 语句会消费自己的结束标签，所以这里看到的 endlibrary 是外层的
                if (this.checkValue("endlibrary")) {
                    break;
                }
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
                
                // 解析完语句后，检查下一个 token 是否是结束标签
                // 跳过注释
                while (this.isComment()) {
                    this.lexer.next();
                }
                
                // 如果看到 endscope，这是外层的 endscope，应该停止
                // 注意：内层的 scope 语句会消费自己的 endscope，所以这里看到的 endscope 是外层的
                if (this.checkValue("endscope")) {
                    break;
                }
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
     * 解析 Zinc 代码块
     * //! zinc
     * ... zinc code ...
     * //! endzinc
     */
    private parseZincBlock(): Statement | null {
        const startToken = this.lexer.current();
        if (!startToken) return null;
        
        const startPos = startToken.start;
        const startLine = startPos.line;
        this.lexer.next(); // 消费 //! zinc 行
        
        // 记录开始位置（在原始源代码中的位置）
        // 我们需要找到 //! zinc 行的结束位置，然后从下一行开始收集
        const sourceLines = this.originalSource.split("\n");
        let zincStartLineIndex = startLine;
        let zincContentStartIndex = -1;
        
        // 找到 zinc 内容开始的行（//! zinc 的下一行）
        if (zincStartLineIndex + 1 < sourceLines.length) {
            zincContentStartIndex = zincStartLineIndex + 1;
        }
        
        // 收集 Zinc 代码内容，直到遇到 //! endzinc
        let endPos = startPos;
        let foundEnd = false;
        let zincEndLineIndex = -1;
        
        while (!this.isAtEnd()) {
            const token = this.lexer.current();
            if (!token) break;
            
            // 检查是否是 //! endzinc
            if (this.isComment()) {
                const commentValue = token.value || "";
                if (/^\s*\/\/!\s+endzinc\b/i.test(commentValue)) {
                    endPos = token.end;
                    zincEndLineIndex = token.start.line;
                    this.lexer.next(); // 消费 //! endzinc
                    foundEnd = true;
                    break;
                }
            }
            
            this.lexer.next();
        }
        
        if (!foundEnd) {
            this.error(
                `Unclosed //! zinc block. Expected //! endzinc to close the zinc block that started at line ${startPos.line + 1}.`,
                startPos,
                endPos,
                `Add '//! endzinc' to close the zinc block.`
            );
            // 如果没有找到 endzinc，使用文件末尾作为结束
            zincEndLineIndex = sourceLines.length - 1;
        }
        
        // 从原始源代码中提取 zinc 块内容
        let content = "";
        if (zincContentStartIndex >= 0 && zincEndLineIndex >= zincContentStartIndex) {
            // 提取从 //! zinc 下一行到 //! endzinc 前一行的内容
            const zincLines = sourceLines.slice(zincContentStartIndex, zincEndLineIndex);
            content = zincLines.join("\n");
        }
        
        // 使用 InnerZincParser 解析 Zinc 代码
        let zincStatements: any[] = [];
        try {
            const zincParser = new InnerZincParser(content, this.filePath);
            zincStatements = zincParser.parse();
        } catch (error: any) {
            // 如果解析失败，记录错误但继续
            this.error(
                `Failed to parse Zinc code block: ${error.message}`,
                startPos,
                endPos,
                `Check the Zinc syntax in the //! zinc block.`
            );
        }
        
        return new ZincBlockStatement({
            content,
            zincStatements,
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
     * 解析 if 语句的分支（then 或 else），支持多个语句
     * 直到遇到 elseif、else 或 endif
     * 注意：这个方法不会消费 endif，endif 由外层的 parseIfInternal 处理
     */
    private parseIfBranch(): Statement | null {
        const statements: Statement[] = [];
        const startPos = this.lexer.current()?.start || { line: 0, position: 0 };

        while (!this.isAtEnd()) {
            // 跳过注释
            if (this.isComment()) {
                this.lexer.next();
                continue;
            }

            // 注意：不能在这里检查 endif，因为可能是嵌套 if 语句的 endif
            // 嵌套 if 语句的 endif 会被 parseIf() 消费掉
            // 我们只在解析完语句后检查是否是结束关键字

            // 解析语句（包括嵌套的 if 语句）
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
                
                // 解析完语句后，检查下一个 token 是否是结束关键字
                // 跳过注释
                while (this.isComment()) {
                    this.lexer.next();
                }
                
                // 检查是否是结束关键字（包括 endif）
                // 如果看到 endif，这是外层的 endif，应该停止
                if (this.check(TokenType.KeywordElseif) || 
                    this.check(TokenType.KeywordElse) || 
                    this.check(TokenType.keywordEndif)) {
                    break;
                }
            } else {
                // 如果无法解析，检查是否是结束关键字
                if (this.check(TokenType.KeywordElseif) || 
                    this.check(TokenType.KeywordElse) || 
                    this.check(TokenType.keywordEndif)) {
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

        // 即使没有语句（只有注释），也返回一个空的 BlockStatement
        // 这样允许空分支（只有注释的情况）
        if (statements.length === 0) {
            // 返回一个空的 BlockStatement，使用当前位置作为结束位置
            const endPos = this.lexer.current()?.start || startPos;
            return new BlockStatement([], startPos, endPos);
        } else if (statements.length === 1) {
            return statements[0];
        } else {
            const endPos = statements[statements.length - 1].end || startPos;
            return new BlockStatement(statements, startPos, endPos);
        }
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

        // 跳过注释（then 后面可能有注释）
        while (this.isComment()) {
            this.lexer.next();
        }

        // 解析 then 分支（支持多个语句）
        const consequent = this.parseIfBranch();
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
            
            // 跳过注释（else 后面可能有注释）
            while (this.isComment()) {
                this.lexer.next();
            }
            
            // 解析 else 分支（支持多个语句，包括嵌套的 if 语句）
            // 注意：即使 else 后面是 if，也应该使用 parseIfBranch() 来解析
            // 因为 else 分支可能包含多个语句（如 if 后面还有 loop 等）
            const elseStmt = this.parseIfBranch();
            
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
        
        // 跳过注释（then 后面可能有注释）
        while (this.isComment()) {
            this.lexer.next();
        }
        
        // 解析 then 分支（支持多个语句）
        const consequent = this.parseIfBranch();
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
            
            // 跳过注释（else 后面可能有注释）
            while (this.isComment()) {
                this.lexer.next();
            }
            
            // 解析 else 分支（支持多个语句，包括嵌套的 if 语句）
            // 注意：即使 else 后面是 if，也应该使用 parseIfBranch() 来解析
            // 因为 else 分支可能包含多个语句（如 if 后面还有 loop 等）
            const elseStmt = this.parseIfBranch();
            
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
                
                // 解析完语句后，检查下一个 token 是否是结束标签
                // 跳过注释
                while (this.isComment()) {
                    this.lexer.next();
                }
                
                // 如果看到 endloop，这是外层的 endloop，应该停止
                // 注意：内层的 loop 语句会消费自己的 endloop，所以这里看到的 endloop 是外层的
                if (this.check(TokenType.keywordEndloop)) {
                    break;
                }
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

        // 单引号字符串（整数标记），如 'abpx' -> integer
        if (token.type === TokenType.TypeIntegerMark) {
            this.lexer.next();
            const str = token.value;
            // 将 4 字符字符串转换为整数
            // 规则：每个字符占 8 位，从左到右分别是 24, 16, 8, 0 位
            let intValue = 0;
            if (str.length === 4) {
                intValue = (str.charCodeAt(0) << 24) | 
                          (str.charCodeAt(1) << 16) | 
                          (str.charCodeAt(2) << 8) | 
                          str.charCodeAt(3);
            } else if (str.length > 0 && str.length < 4) {
                // 如果长度小于 4，右对齐（前面补 0）
                for (let i = 0; i < str.length; i++) {
                    intValue |= (str.charCodeAt(i) << (24 - i * 8));
                }
            } else if (str.length > 4) {
                // 如果长度大于 4，只取前 4 个字符
                intValue = (str.charCodeAt(0) << 24) | 
                          (str.charCodeAt(1) << 16) | 
                          (str.charCodeAt(2) << 8) | 
                          str.charCodeAt(3);
            }
            // 转换为有符号 32 位整数
            intValue = intValue | 0;
            return new IntegerLiteral(intValue, token.start, token.end);
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
