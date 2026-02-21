// 词法单元类型枚举
export enum TokenType {
    // 关键字
    KeywordFunction = "FUNCTION",
    KeywordEndfunction = "ENDFUNCTION",
    KeywordIf = "IF",
    KeywordElse = "ELSE",
    KeywordElseif = "ELSEIF",
    keywordEndif = "ENDIF",
    KeywordThen = "THEN",
    keywordLoop = "LOOP",
    keywordEndloop = "ENDLOOP",
    keywordExitwhen = "EXITWHEN",
    keywordSet = "SET",
    keywordCall = "CALL",
    keywordReturn = "RETURN",
    keywordTakes = "TAKES",
    keywordReturns = "RETURNS",
    keywordNothing = "NOTHING",
    keywordLocal = "LOCAL",
    keywordConstant = "CONSTANT",
    keywordType = "TYPE",
    keywordNative = "NATIVE",
    keywordGlobals = "GLOBALS",
    keywordEndglobals = "ENDGLOBALS",

    // 文本宏相关
    // KeywordTextmacro = "TEXTMACRO",
    // KeywordEndtextmacro = "ENDTEXTMACRO",
    // KeywordRuntextmacro = "RUNTEXTMACRO",

    // 数据类型
    TypeInteger = "INTEGER",
    TypeIntegerMark = "INTEGER_MARK",
    TypeReal = "REAL",
    TypeString = "STRING",
    TypeBoolean = "BOOLEAN",
    TypeCode = "CODE",
    TypeHandle = "HANDLE",
    TypeKey = "KEY",

    // 标识符和字面量
    Identifier = "IDENTIFIER",
    IntegerLiteral = "INTEGER_LITERAL",
    RealLiteral = "REAL_LITERAL",
    StringLiteral = "STRING_LITERAL",
    BooleanLiteral = "BOOLEAN_LITERAL",

    // 运算符
    OperatorPlus = "PLUS",
    OperatorMinus = "MINUS",
    OperatorMultiply = "MULTIPLY",
    OperatorDivide = "DIVIDE",
    OperatorModulo = "MODULO",
    OperatorAssign = "ASSIGN",
    OperatorEqual = "EQUAL",
    OperatorNotEqual = "NOT_EQUAL",
    OperatorLess = "LESS",
    OperatorLessEqual = "LESS_EQUAL",
    OperatorGreater = "GREATER",
    OperatorGreaterEqual = "GREATER_EQUAL",
    OperatorLogicalAnd = "LOGICAL_AND",
    OperatorLogicalOr = "LOGICAL_OR",
    OperatorLogicalNot = "LOGICAL_NOT",
    OperatorIndex = "INDEX", // [] 运算符
    OperatorIndexAssign = "INDEX_ASSIGN", // []= 运算符
    OperatorRightArrow = "RIGHT_ARROW", // -> 运算符
    OperatorPlusAssign = "PLUS_ASSIGN", // += 运算符
    OperatorMinusAssign = "MINUS_ASSIGN", // -= 运算符
    OperatorMultiplyAssign = "MULTIPLY_ASSIGN", // *= 运算符
    OperatorDivideAssign = "DIVIDE_ASSIGN", // /= 运算符

    // 分隔符 / 单字符运算符
    // (
    LeftParen = "LEFT_PAREN",
    // )
    RightParen = "RIGHT_PAREN",
    // [
    LeftBracket = "LEFT_BRACKET",
    // ]
    RightBracket = "RIGHT_BRACKET",
    // {
    LeftBrace = "LEFT_BRACE",
    // }
    RightBrace = "RIGHT_BRACE",
    Comma = "COMMA",
    Dot = "DOT",
    Colon = "COLON",
    Semicolon = "SEMICOLON",

    // 注释和文本宏指令
    SingleLineComment = "SINGLE_LINE_COMMENT",
    MultiLineComment = "MULTI_LINE_COMMENT",
    TextMacroDirective = "TEXTMACRO_DIRECTIVE",

    // 特殊标记
    EndOfInput = "END_OF_INPUT",
    Unknown = "UNKNOWN"
}
// 词法单元接口
export interface IToken {
    readonly type: TokenType;
    readonly value: string;
    readonly line: number;
    readonly column: number;

    start: {
        line: number;
        position: number;
    },
    end: {
        line: number;
        position: number;
    },
}

// 词法分析器接口
export interface ILexer {
    // 获取下一个词法单元
    next(): IToken | null;
    // 获取当前词法单元
    current(): IToken | null;
    // 查看下一个词法单元但不消耗它
    peek(): IToken | null;
    // 重置分析器状态
    reset(): void;
    // 判断是否已到达输入末尾
    isEOF(): boolean;
}



// Token实现类
export class Token implements IToken {
    public readonly type: TokenType;
    public static readonly TokenTexts: readonly string[] = [
        "function",
        "endfunction",
        "if",
        "else",
        "elseif",
        "endif",
        "then",
        "loop",
        "endloop",
        "exitwhen",
        "set",
        "call",
        "return",
        "takes",
        "returns",
        "nothing",
        "local",
        "constant",
        "type",
        "native",
        "globals",
        "endglobals",
        "integer",
        "real",
        "string",
        "boolean",
        "code",
        "handle",
        "and",
        "or",
        "not",
        "true",
        "false",
        "null",
        "extends",
        "array",
        // vjass
        "library",
        "library_once",
        "endlibrary",
        "scope",
        "endscope",
        "private",
        "public",
        "static",
        "struct",
        "endstruct",
        "method",
        "endmethod",
        "interface",
        "endinterface",
        "implement",
        "optional",
        "module",
        "endmodule",
        "requires",
        "initializer",
        "finalizer",
        "uses",
        "needs",
        "debug",
        "hook",
        "operator",
        "this",
        "super",
        "thistype",
        "onInit",
        "onDestroy",
        "hook",
        "defaults",
        "execute",
        "create",
        "destroy",
        "size",
        "name",
        "allocate",
        "deallocate",
        "key",
        "delegate",
        "stub",
        "readonly",
        // zinc
        "for",
        "while",
        "break"
    ];

    private readonly textOrIndex: number | string;
    public get value(): string {
        if (typeof this.textOrIndex === "number") {
            return Token.TokenTexts[this.textOrIndex];
        } else {
            return this.textOrIndex;
        }
    }
    public readonly line: number;
    public readonly column: number;
    public readonly start: { readonly line: number; readonly position: number; };
    public readonly end: { readonly line: number; readonly position: number; };
    constructor(
        type: TokenType,
        text: string,
        start: {
            line: number;
            position: number;
        },
        end: {
            line: number;
            position: number;
        }
    ) { 
        this.type = type;
        const index = Token.TokenTexts.indexOf(text);
        if (index !== -1) {
            this.textOrIndex = index;
        } else {
            this.textOrIndex = text;
        }
        this.line = start.line;
        this.column = start.position;
        this.start = start;
        this.end = end;
    }
}

export class Lexer implements ILexer {
    private readonly source: string;
    private position: number = 0;
    private line: number = 0;
    private column: number = 0;
    private currentToken: IToken | null = null;
    private peekToken: IToken | null = null;
    private peekTokenGenerated: boolean = false;

    constructor(source: string) {
        this.source = source;
    }

    /**
     * 获取当前位置的字符
     */
    private currentChar(): string | null {
        if (this.position >= this.source.length) {
            return null;
        }
        return this.source[this.position];
    }

    /**
     * 查看前方 n 个字符（不移动位置）
     */
    private peekChar(offset: number = 1): string | null {
        const pos = this.position + offset;
        if (pos >= this.source.length) {
            return null;
        }
        return this.source[pos];
    }

    /**
     * 前进一个字符
     */
    private advance(): void {
        const char = this.currentChar();
        if (char === '\n') {
            this.line++;
            this.column = 0;
        } else {
            this.column++;
        }
        this.position++;
    }

    /**
     * 跳过空白字符
     */
    private skipWhitespace(): void {
        while (this.position < this.source.length) {
            const char = this.currentChar();
            if (char === ' ' || char === '\t' || char === '\r') {
                this.advance();
            } else if (char === '\n') {
                this.advance();
            } else {
                break;
            }
        }
    }

    /**
     * 检查字符是否为字母
     */
    private isLetter(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z]/.test(char);
    }

    /**
     * 检查字符是否为数字
     */
    private isNumber(char: string | null): boolean {
        if (!char) return false;
        return /\d/.test(char);
    }

    /**
     * 检查字符是否为字母、数字或下划线
     */
    private isAlphanumeric(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z0-9_]/.test(char);
    }

    /**
     * 检查字符是否为标识符字符（字母、数字、下划线或美元符号）
     * 标识符规则：[a-zA-Z$_][a-zA-Z0-9$_]*
     */
    private isIdentifierChar(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z0-9$_]/.test(char);
    }

    /**
     * 检查字符是否为标识符首字符（字母、下划线或美元符号）
     * 标识符规则：[a-zA-Z$_][a-zA-Z0-9$_]*
     */
    private isIdentifierStart(char: string | null): boolean {
        if (!char) return false;
        return /[a-zA-Z$_]/.test(char);
    }

    /**
     * 检查字符是否为十六进制字符（0-9, a-f, A-F）
     */
    private isHexDigit(char: string | null): boolean {
        if (!char) return false;
        return /[0-9a-fA-F]/.test(char);
    }

    /**
     * 读取标识符或关键字
     * 标识符规则：[a-zA-Z$_][a-zA-Z0-9$_]*
     */
    private readIdentifier(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        const startPos = this.position;
        let value = '';

        // 读取第一个字符（必须是字母、下划线或美元符号）
        if (this.isIdentifierStart(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        // 读取后续字符（可以是字母、数字、下划线或美元符号）
        while (this.isIdentifierChar(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        const endLine = this.line;
        const endColumn = this.column;
        const endPos = this.position;

        // 检查是否为关键字（不区分大小写）
        const lowerValue = value.toLowerCase();
        const keywordIndex = Token.TokenTexts.findIndex(k => k.toLowerCase() === lowerValue);
        let type: TokenType;
        if (keywordIndex !== -1) {
            // 映射到对应的 TokenType
            type = this.getKeywordType(keywordIndex);
        } else {
            type = TokenType.Identifier;
        }

        return new Token(
            type,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取十六进制数字字面量
     * 支持 JASS 特有的 $ 开头格式（如 $ff00ff00）和标准的 0x 格式（如 0xff00ff00）
     */
    private readHexNumber(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        let value = '';

        // 读取前缀
        const prefix = this.currentChar();
        value += prefix;
        this.advance();

        // 如果是 $ 开头，直接读取十六进制数字
        if (prefix === '$') {
            // 读取十六进制数字
            if (!this.isHexDigit(this.currentChar())) {
                // 无效的十六进制数，返回错误 token
                const endLine = this.line;
                const endColumn = this.column;
                return new Token(
                    TokenType.Unknown,
                    value,
                    { line: startLine, position: startColumn },
                    { line: endLine, position: endColumn }
                );
            }

            while (this.isHexDigit(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }

            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.IntegerLiteral,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }

        // 如果是 0，检查后面是否有 x
        if (prefix === '0' && (this.currentChar() === 'x' || this.currentChar() === 'X')) {
            value += this.currentChar();
            this.advance();

            // 读取十六进制数字
            if (!this.isHexDigit(this.currentChar())) {
                // 无效的十六进制数，返回错误 token
                const endLine = this.line;
                const endColumn = this.column;
                return new Token(
                    TokenType.Unknown,
                    value,
                    { line: startLine, position: startColumn },
                    { line: endLine, position: endColumn }
                );
            }

            while (this.isHexDigit(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }

            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.IntegerLiteral,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }

        // 不应该到达这里，但为了安全起见
        const endLine = this.line;
        const endColumn = this.column;
        return new Token(
            TokenType.Unknown,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取数字字面量（整数或实数）
     * 支持省略前导 0 的实数，如 .3 等价于 0.3
     * 支持 0x 开头的十六进制数
     */
    private readNumber(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        const startPos = this.position;
        let value = '';

        // 检查是否以小数点开头（省略前导 0 的情况，如 .3）
        const startsWithDot = this.currentChar() === '.';
        if (startsWithDot) {
            // 保持原始输入值（如 .3），不添加前导 0
            value += this.currentChar(); // 添加小数点
            this.advance();
            // 读取小数部分
            while (this.isNumber(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
            // 检查科学计数法
            if (this.currentChar() === 'e' || this.currentChar() === 'E') {
                value += this.currentChar();
                this.advance();
                if (this.currentChar() === '+' || this.currentChar() === '-') {
                    value += this.currentChar();
                    this.advance();
                }
                while (this.isNumber(this.currentChar())) {
                    value += this.currentChar();
                    this.advance();
                }
            }
            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.RealLiteral,
                value, // 保持原始值，如 ".3"
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }

        // 检查是否为 0x 开头的十六进制数
        if (this.currentChar() === '0' && (this.peekChar(1) === 'x' || this.peekChar(1) === 'X')) {
            return this.readHexNumber();
        }

        // 读取整数部分
        while (this.isNumber(this.currentChar())) {
            value += this.currentChar();
            this.advance();
        }

        // 检查是否有小数点
        if (this.currentChar() === '.' && this.isNumber(this.peekChar(1))) {
            value += this.currentChar();
            this.advance();
            // 读取小数部分
            while (this.isNumber(this.currentChar())) {
                value += this.currentChar();
                this.advance();
            }
            // 检查科学计数法
            if (this.currentChar() === 'e' || this.currentChar() === 'E') {
                value += this.currentChar();
                this.advance();
                if (this.currentChar() === '+' || this.currentChar() === '-') {
                    value += this.currentChar();
                    this.advance();
                }
                while (this.isNumber(this.currentChar())) {
                    value += this.currentChar();
                    this.advance();
                }
            }
            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.RealLiteral,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        } else {
            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.IntegerLiteral,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }
    }

    /**
     * 读取字符串字面量
     * 规则：
     * - 单引号内的所有内容（包括空串）→ TypeIntegerMark
     * - 双引号内 → StringLiteral
     * - 支持多行字符串（字符串可以跨越多行，换行符会被保留在字符串值中）
     */
    private readString(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        const quote = this.currentChar();
        const isSingleQuote = quote === "'";
        this.advance(); // 跳过开始引号

        let value = '';
        
        // 读取字符串内容，直到遇到匹配的结束引号
        // 支持多行字符串，换行符会被保留在字符串值中
        // 支持转义字符：\", \', \\, \n, \t, \r 等
        while (this.position < this.source.length) {
            const char = this.currentChar();
            if (char === null) {
                // 未闭合的字符串（到达文件末尾）
                break;
            }
            if (char === quote) {
                // 遇到匹配的结束引号
                this.advance(); // 跳过结束引号
                break;
            }
            if (char === '\\') {
                // 处理转义字符
                const nextChar = this.peekChar(1);
                if (nextChar === null) {
                    // 反斜杠在字符串末尾，作为普通字符处理
                    value += char;
                    this.advance();
                } else {
                    this.advance(); // 跳过反斜杠
                    switch (nextChar) {
                        case 'n':
                            value += '\n'; // 换行符
                            this.advance();
                            break;
                        case 't':
                            value += '\t'; // 制表符
                            this.advance();
                            break;
                        case 'r':
                            value += '\r'; // 回车符
                            this.advance();
                            break;
                        case '\\':
                            value += '\\'; // 反斜杠本身
                            this.advance();
                            break;
                        case quote:
                            value += quote; // 转义引号（\" 或 \'）
                            this.advance();
                            break;
                        default:
                            // 未知的转义序列，保留原始形式（如 \x, \u 等）
                            value += '\\' + nextChar;
                            this.advance();
                            break;
                    }
                }
            } else {
                // 普通字符（包括换行符），直接添加到值中
                value += char;
                this.advance();
            }
        }

        const endLine = this.line;
        const endColumn = this.column;
        
        // 如果是单引号，所有内容都识别为 TypeIntegerMark
        if (isSingleQuote) {
            return new Token(
                TokenType.TypeIntegerMark,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }
        
        // 双引号，识别为 StringLiteral
        return new Token(
            TokenType.StringLiteral,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取单行注释
     */
    private readSingleLineComment(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // 跳过 '/'
        this.advance(); // 跳过 '/'
        
        // 检查是否是文本宏指令 //!
        if (this.currentChar() === '!') {
            this.advance(); // 跳过 '!'
            let value = '';
            while (this.position < this.source.length) {
                const char = this.currentChar();
                if (char === null || char === '\n') {
                    break;
                }
                value += char;
                this.advance();
            }
            const endLine = this.line;
            const endColumn = this.column;
            return new Token(
                TokenType.TextMacroDirective,
                value,
                { line: startLine, position: startColumn },
                { line: endLine, position: endColumn }
            );
        }

        // 普通单行注释
        let value = '';
        while (this.position < this.source.length) {
            const char = this.currentChar();
            if (char === null || char === '\n') {
                break;
            }
            value += char;
            this.advance();
        }

        const endLine = this.line;
        const endColumn = this.column;
        return new Token(
            TokenType.SingleLineComment,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取预处理指令（以 # 开头的行，如 #ifndef, #define, #endif）
     * 这些指令在 JASS 中通常被当作注释处理
     */
    private readPreprocessorDirective(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // 跳过 '#'
        
        // 读取整行内容
        let value = '';
        while (this.position < this.source.length) {
            const char = this.currentChar();
            if (char === null || char === '\n') {
                break;
            }
            value += char;
            this.advance();
        }
        
        const endLine = this.line;
        const endColumn = this.column;
        // 将预处理指令当作单行注释处理
        return new Token(
            TokenType.SingleLineComment,
            value.trim(),
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取多行注释
     */
    private readMultiLineComment(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        this.advance(); // 跳过 '/'
        this.advance(); // 跳过 '*'

        let value = '';
        while (this.position < this.source.length) {
            const char = this.currentChar();
            if (char === null) {
                break; // 未闭合的注释
            }
            if (char === '*' && this.peekChar(1) === '/') {
                this.advance(); // 跳过 '*'
                this.advance(); // 跳过 '/'
                break;
            }
            value += char;
            this.advance();
        }

        const endLine = this.line;
        const endColumn = this.column;
        return new Token(
            TokenType.MultiLineComment,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 读取运算符或分隔符
     */
    private readOperatorOrDelimiter(): IToken {
        const startLine = this.line;
        const startColumn = this.column;
        const char = this.currentChar()!;
        this.advance();

        let type: TokenType;
        let value = char;

        // 处理双字符运算符
        const nextChar = this.currentChar();
        if (nextChar !== null) {
            const twoChar = char + nextChar;
            switch (twoChar) {
                case '==': type = TokenType.OperatorEqual; value = twoChar; this.advance(); break;
                case '!=': type = TokenType.OperatorNotEqual; value = twoChar; this.advance(); break;
                case '<=': type = TokenType.OperatorLessEqual; value = twoChar; this.advance(); break;
                case '>=': type = TokenType.OperatorGreaterEqual; value = twoChar; this.advance(); break;
                case '&&': type = TokenType.OperatorLogicalAnd; value = twoChar; this.advance(); break;
                case '||': type = TokenType.OperatorLogicalOr; value = twoChar; this.advance(); break;
                case '->': type = TokenType.OperatorRightArrow; value = twoChar; this.advance(); break;
                case '+=': type = TokenType.OperatorPlusAssign; value = twoChar; this.advance(); break;
                case '-=': type = TokenType.OperatorMinusAssign; value = twoChar; this.advance(); break;
                case '*=': type = TokenType.OperatorMultiplyAssign; value = twoChar; this.advance(); break;
                case '/=': type = TokenType.OperatorDivideAssign; value = twoChar; this.advance(); break;
                default:
                    // 特殊处理 [] 和 []= 运算符
                    if (char === '[' && nextChar === ']') {
                        // 检查是否是 []=
                        const thirdChar = this.peekChar(2);
                        if (thirdChar === '=') {
                            // 识别为 []=
                            type = TokenType.OperatorIndexAssign;
                            value = "[]=";
                            this.advance(); // 消费 ]
                            this.advance(); // 消费 =
                        } else {
                            // 识别为 []
                            type = TokenType.OperatorIndex;
                            value = "[]";
                            this.advance(); // 消费 ]
                        }
                    } else {
                        switch (char) {
                            case '+': type = TokenType.OperatorPlus; break;
                            case '-': type = TokenType.OperatorMinus; break;
                            case '*': type = TokenType.OperatorMultiply; break;
                            case '/': type = TokenType.OperatorDivide; break;
                            case '%': type = TokenType.OperatorModulo; break;
                            case '=': type = TokenType.OperatorAssign; break;
                            case '<': type = TokenType.OperatorLess; break;
                            case '>': type = TokenType.OperatorGreater; break;
                            case '!': type = TokenType.OperatorLogicalNot; break;
                            case '(': type = TokenType.LeftParen; break;
                            case ')': type = TokenType.RightParen; break;
                            case '[': type = TokenType.LeftBracket; break;
                            case ']': type = TokenType.RightBracket; break;
                            case '{': type = TokenType.LeftBrace; break;
                            case '}': type = TokenType.RightBrace; break;
                            case ',': type = TokenType.Comma; break;
                            case '.': type = TokenType.Dot; break;
                            case ':': type = TokenType.Colon; break;
                            case ';': type = TokenType.Semicolon; break;
                            default: type = TokenType.Unknown; break;
                        }
                    }
            }
        } else {
            switch (char) {
                case '+': type = TokenType.OperatorPlus; break;
                case '-': type = TokenType.OperatorMinus; break;
                case '*': type = TokenType.OperatorMultiply; break;
                case '/': type = TokenType.OperatorDivide; break;
                case '%': type = TokenType.OperatorModulo; break;
                case '=': type = TokenType.OperatorAssign; break;
                case '<': type = TokenType.OperatorLess; break;
                case '>': type = TokenType.OperatorGreater; break;
                case '!': type = TokenType.OperatorLogicalNot; break;
                case '(': type = TokenType.LeftParen; break;
                case ')': type = TokenType.RightParen; break;
                case '[': type = TokenType.LeftBracket; break;
                case ']': type = TokenType.RightBracket; break;
                case '{': type = TokenType.LeftBrace; break;
                case '}': type = TokenType.RightBrace; break;
                case ',': type = TokenType.Comma; break;
                case '.': type = TokenType.Dot; break;
                case ':': type = TokenType.Colon; break;
                default: type = TokenType.Unknown; break;
            }
        }

        const endLine = this.line;
        const endColumn = this.column;
        return new Token(
            type,
            value,
            { line: startLine, position: startColumn },
            { line: endLine, position: endColumn }
        );
    }

    /**
     * 将关键字索引映射到 TokenType
     * 只映射有对应 TokenType 的关键字，其他返回 Identifier
     */
    private getKeywordType(index: number): TokenType {
        // 前 21 个是基本 JASS 关键字
        const basicKeywords: TokenType[] = [
            TokenType.KeywordFunction,        // 0: function
            TokenType.KeywordEndfunction,     // 1: endfunction
            TokenType.KeywordIf,              // 2: if
            TokenType.KeywordElse,            // 3: else
            TokenType.KeywordElseif,          // 4: elseif
            TokenType.keywordEndif,           // 5: endif
            TokenType.KeywordThen,            // 6: then
            TokenType.keywordLoop,            // 7: loop
            TokenType.keywordEndloop,         // 8: endloop
            TokenType.keywordExitwhen,        // 9: exitwhen
            TokenType.keywordSet,             // 9: set
            TokenType.keywordCall,            // 10: call
            TokenType.keywordReturn,          // 11: return
            TokenType.keywordTakes,           // 12: takes
            TokenType.keywordReturns,         // 13: returns
            TokenType.keywordNothing,         // 14: nothing
            TokenType.keywordLocal,           // 15: local
            TokenType.keywordConstant,        // 16: constant
            TokenType.keywordType,            // 17: type
            TokenType.keywordNative,          // 18: native
            TokenType.keywordGlobals,         // 19: globals
            TokenType.keywordEndglobals,      // 20: endglobals
        ];

        // 类型关键字（索引 22-27，因 TokenTexts 中 then 占 6）
        if (index >= 22 && index <= 27) {
            const typeKeywords: TokenType[] = [
                TokenType.TypeInteger,        // 22: integer
                TokenType.TypeReal,           // 23: real
                TokenType.TypeString,         // 24: string
                TokenType.TypeBoolean,        // 25: boolean
                TokenType.TypeCode,           // 26: code
                TokenType.TypeHandle,         // 27: handle
            ];
            return typeKeywords[index - 22];
        }

        // key 类型关键字（TokenTexts 中插入 then 后索引 +1）
        if (index === 200) return TokenType.TypeKey; // key

        // 逻辑运算符（索引 28-30，因 then 占 6）
        if (index === 28) return TokenType.OperatorLogicalAnd; // and
        if (index === 29) return TokenType.OperatorLogicalOr; // or
        if (index === 30) return TokenType.OperatorLogicalNot; // not

        // 布尔字面量（索引 31-32）
        if (index === 31) return TokenType.BooleanLiteral; // true
        if (index === 32) return TokenType.BooleanLiteral; // false

        // 基本关键字（索引 0-20）
        if (index < basicKeywords.length) {
            return basicKeywords[index];
        }

        // 其他关键字（vjass 扩展等）没有对应的 TokenType，作为标识符处理
        return TokenType.Identifier;
    }

    /**
     * 生成下一个 token
     */
    private generateNextToken(): IToken | null {
        // 跳过空白字符
        this.skipWhitespace();

        // 检查是否到达文件末尾
        if (this.position >= this.source.length) {
            return new Token(
                TokenType.EndOfInput,
                '',
                { line: this.line, position: this.column },
                { line: this.line, position: this.column }
            );
        }

        const char = this.currentChar();
        if (!char) {
            return new Token(
                TokenType.EndOfInput,
                '',
                { line: this.line, position: this.column },
                { line: this.line, position: this.column }
            );
        }

        // 根据字符类型选择处理方式
        if (this.isLetter(char)) {
            return this.readIdentifier();
        } else if (this.isNumber(char)) {
            return this.readNumber();
        } else if (char === '$') {
            // 智能区分：$ 后面跟十六进制数字序列 → 十六进制数，否则 → 标识符
            // 规则：向前查看，如果 $ 后面是纯十六进制字符序列（至少2个），且下一个非标识符字符
            // 不是标识符字符（g-z, G-Z, 下划线等），则识别为十六进制数
            const nextChar = this.peekChar(1);
            if (nextChar && this.isHexDigit(nextChar)) {
                // 检查连续十六进制字符的数量和后续字符
                let hexCount = 0;
                let pos = 1;
                // 向前查看，统计连续的十六进制字符数量
                while (pos < 20) {
                    const ch = this.peekChar(pos);
                    if (!ch) break;
                    if (this.isHexDigit(ch)) {
                        hexCount++;
                        pos++;
                    } else {
                        // 遇到非十六进制字符，检查是否是标识符字符
                        // 如果是标识符字符（g-z, G-Z, 下划线等），则不是纯十六进制数
                        if (this.isIdentifierChar(ch) && !this.isHexDigit(ch)) {
                            // 包含非十六进制的标识符字符，识别为标识符
                            return this.readIdentifier();
                        }
                        // 遇到非标识符字符（如空格、运算符等），停止检查
                        break;
                    }
                }
                // 如果至少有2个连续的十六进制字符，且没有非十六进制的标识符字符，识别为十六进制数
                if (hexCount >= 2) {
                    return this.readHexNumber();
                }
            }
            // $ 开头，但不符合十六进制数条件，识别为标识符
            return this.readIdentifier();
        } else if (char === '_') {
            // 下划线开头的标识符
            return this.readIdentifier();
        } else if (char === '.' && this.isNumber(this.peekChar(1))) {
            // 处理省略前导 0 的实数，如 .3 等价于 0.3
            return this.readNumber();
        } else if (char === '"' || char === "'") {
            return this.readString();
        } else if (char === '/' && this.peekChar(1) === '/') {
            return this.readSingleLineComment();
        } else if (char === '/' && this.peekChar(1) === '*') {
            return this.readMultiLineComment();
        } else if (char === '#') {
            // 预处理指令（如 #ifndef, #define, #endif）当作单行注释处理
            return this.readPreprocessorDirective();
        } else {
            return this.readOperatorOrDelimiter();
        }
    }

    /**
     * 获取下一个词法单元
     */
    next(): IToken | null {
        // 如果已经预读了下一个 token，直接返回
        if (this.peekTokenGenerated) {
            this.currentToken = this.peekToken;
            this.peekToken = null;
            this.peekTokenGenerated = false;
            return this.currentToken;
        }

        // 生成新的 token
        this.currentToken = this.generateNextToken();
        return this.currentToken;
    }

    /**
     * 获取当前词法单元
     */
    current(): IToken | null {
        return this.currentToken;
    }

    /**
     * 查看下一个词法单元但不消耗它
     */
    peek(): IToken | null {
        if (!this.peekTokenGenerated) {
            this.peekToken = this.generateNextToken();
            this.peekTokenGenerated = true;
        }
        return this.peekToken;
    }

    /**
     * 重置分析器状态
     */
    reset(): void {
        this.position = 0;
        this.line = 0;
        this.column = 0;
        this.currentToken = null;
        this.peekToken = null;
        this.peekTokenGenerated = false;
    }

    /**
     * 判断是否已到达输入末尾
     */
    isEOF(): boolean {
        const token = this.peek();
        return token !== null && token.type === TokenType.EndOfInput;
    }
}

if (false) {
    const lexer = new Lexer(`function test() { local i = 0 }
        set a = 0x25f + 'fas'`);
    while (!lexer.isEOF()) {
        const token = lexer.next();
        console.log(token);
    }
}
