import { Lexer, TokenType } from "./lexer";
import { Identifier, Expression, IntegerLiteral, RealLiteral, StringLiteral, BooleanLiteral, NullLiteral, BinaryExpression, CallExpression, OperatorType } from "./ast";
import { ZincBlock, ZincLibraryDeclaration, ZincStatement, ZincStructDeclaration, ZincVariableDeclaration, ZincMethodDeclaration, ZincParameter, ZincAssignmentStatement, ZincAnonymousFunction, ZincCallStatement, ZincIfStatement, ZincBreakStatement, ZincReturnStatement, ZincWhileStatement, ZincForStatement, ZincForRange, ZincFunctionDeclaration } from "./zinc-ast";
import { ErrorCollection, SimpleError, SimpleWarning } from "./error";


export class InnerZincParser {
    private readonly lexer: Lexer;
    public readonly filePath: string;
    public readonly errors: ErrorCollection;

    constructor(contentOrLexer: string|Lexer, filePath: string = "") {
        this.lexer = contentOrLexer instanceof Lexer ? contentOrLexer : new Lexer(contentOrLexer);
        this.filePath = filePath;
        this.errors = {
            errors: [],
            warnings: [],
            checkValidationErrors: []
        };
    }

    /**
     * 解析源代码并返回 AST
     * 支持解析 library 声明和其他顶级声明
     */
    public parse(): ZincStatement[] {
        const statements: ZincStatement[] = [];

        // 初始化：获取第一个 token
        this.next();

        // 跳过开头的注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        // 解析所有顶级声明
        while (!this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.isEnd()) {
                break;
            }

            const token = this.current()!;
            let parsed = false;

            // 解析 library 声明
            if (token.type === TokenType.Identifier && token.value === "library") {
                const library = this.parseLibrary();
                if (library) {
                    statements.push(library);
                    parsed = true;
                }
            }
            // 解析顶级 struct 声明
            else if (token.type === TokenType.Identifier && (
                token.value === "struct" ||
                (token.value === "public" && this.peek()?.value === "struct") ||
                (token.value === "private" && this.peek()?.value === "struct")
            )) {
                const struct = this.parseStruct();
                if (struct) {
                    statements.push(struct);
                    parsed = true;
                }
            }
            // 解析顶级 function 声明
            else if (token.type === TokenType.KeywordFunction || 
                     (token.type === TokenType.Identifier && token.value === "function") ||
                     (token.type === TokenType.Identifier && token.value === "public" && 
                      (this.peek()?.type === TokenType.KeywordFunction || this.peek()?.value === "function")) ||
                     (token.type === TokenType.Identifier && token.value === "private" && 
                      (this.peek()?.type === TokenType.KeywordFunction || this.peek()?.value === "function"))) {
                const func = this.parseFunction();
                if (func) {
                    statements.push(func);
                    parsed = true;
                }
            }
            // 解析顶级变量声明
            else {
                const variable = this.parseVariableDeclaration();
                if (variable) {
                    statements.push(variable);
                    parsed = true;
                }
            }

            // 如果无法解析，跳过当前 token
            if (!parsed) {
                this.next();
            }
        }

        return statements;
    }


    private peek() {
        return this.lexer.peek();
    }

    private current() {
        return this.lexer.current();
    }

    private next() {
        return this.lexer.next();
    }

    private isEnd() {
        return this.current()?.type === TokenType.EndOfInput;
    }

    /**
     * 记录错误
     */
    private error(
        message: string,
        start: { line: number; position: number },
        end: { line: number; position: number },
        fix?: string
    ): void {
        this.errors.errors.push(new SimpleError(start, end, message, fix));
    }

    /**
     * 记录警告
     */
    private warning(
        message: string,
        start: { line: number; position: number },
        end: { line: number; position: number },
        fix?: string
    ): void {
        this.errors.warnings.push(new SimpleWarning(start, end, message));
    }

    /**
     * 解析 library 声明
     * library Name requires Library1, Library2 { ... }
     */
    private parseLibrary(): ZincLibraryDeclaration | null {
        const startToken = this.current();
        if (!startToken || startToken.type !== TokenType.Identifier || startToken.value !== "library") {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 library 关键字

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        // 解析 library 名称（可选）
        let nameId: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            nameId = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        }

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        // 解析 requires 子句（可选）
        const requires: Identifier[] = [];
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "requires") {
            this.next(); // 消费 requires 关键字

            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            // 解析依赖库列表
            while (this.current() && this.current()!.type === TokenType.Identifier) {
                const requireId = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
                requires.push(requireId);
                this.next();

                // 跳过注释
                while (this.current() && (
                    this.current()!.type === TokenType.SingleLineComment ||
                    this.current()!.type === TokenType.MultiLineComment
                )) {
                    this.next();
                }

                // 检查是否有逗号
                if (this.current()?.type === TokenType.Comma) {
                    this.next();
                    // 跳过注释
                    while (this.current() && (
                        this.current()!.type === TokenType.SingleLineComment ||
                        this.current()!.type === TokenType.MultiLineComment
                    )) {
                        this.next();
                    }
                } else {
                    break;
                }
            }
        }

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        // 检查是否有左大括号
        if (this.current()?.type !== TokenType.LeftBrace) {
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : startPos;
            this.error(
                "Expected '{' after library declaration",
                errorPos,
                errorPos,
                "Add '{' to start the library body"
            );
            return null;
        }
        this.next(); // 消费左大括号

        // 解析 library 体
        const block = this.parseLibraryBody();

        // 检查并消费右大括号
        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        } else {
            // 如果缺少右大括号，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : (block?.end || startPos);
            this.error(
                "Expected '}' to close library body",
                errorPos,
                errorPos,
                "Add '}' to close the library body"
            );
        }

        const endPos = block?.end || this.current()?.end || startPos;
        return new ZincLibraryDeclaration({
            name: nameId,
            requirements: requires,
            body: block,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 library 体
     * 智能识别 struct、function 和变量
     */
    private parseLibraryBody(): ZincBlock {
        const startToken = this.current()!;
        const startPos = startToken.start;

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.current()?.type === TokenType.RightBrace) {
                break;
            }

            const token = this.current()!;
            let parsed = false;

            // 智能识别不同类型的声明
            // function 可能是 TokenType.KeywordFunction 或 TokenType.Identifier
            const isFunctionKeyword = token.type === TokenType.KeywordFunction || 
                                     (token.type === TokenType.Identifier && token.value === "function");
            const isStructKeyword = token.type === TokenType.Identifier && token.value === "struct";
            const isPublicKeyword = token.type === TokenType.Identifier && token.value === "public";
            const isPrivateKeyword = token.type === TokenType.Identifier && token.value === "private";
            
            // 检查是否是类型关键字（用于变量声明）
            const isTypeKeyword = token.type === TokenType.TypeInteger ||
                                 token.type === TokenType.TypeReal ||
                                 token.type === TokenType.TypeString ||
                                 token.type === TokenType.TypeBoolean ||
                                 token.type === TokenType.TypeCode ||
                                 token.type === TokenType.TypeHandle ||
                                 token.type === TokenType.TypeKey;
            
            // 检查是否是 constant 关键字（用于变量声明）
            // constant 可能是 keywordConstant 或 Identifier
            const isConstantKeyword = token.type === TokenType.keywordConstant || 
                                     (token.type === TokenType.Identifier && token.value === "constant");
            
            if (token.type === TokenType.Identifier || token.type === TokenType.KeywordFunction || isTypeKeyword || isConstantKeyword) {
                // 检查是否是 public {} 或 private {} 块
                if (isPublicKeyword || isPrivateKeyword) {
                    const nextToken = this.peek();
                    if (nextToken?.type === TokenType.LeftBrace) {
                        // 这是 public {} 或 private {} 块
                        const block = this.parsePublicOrPrivateBlock(isPublicKeyword);
                        if (block) {
                            // 将块内的所有语句添加到 statements
                            statements.push(...block.statements);
                            parsed = true;
                        }
                    } else {
                        // 可能是 public/private 修饰符，继续检查
                        // 优先级：先 function，后 struct
                        // 检查是否是 function
                        if (isPublicKeyword && (nextToken?.type === TokenType.KeywordFunction || nextToken?.value === "function")) {
                            const func = this.parseFunction();
                            if (func) {
                                statements.push(func);
                                parsed = true;
                            }
                        } else if (isPrivateKeyword && (nextToken?.type === TokenType.KeywordFunction || nextToken?.value === "function")) {
                            const func = this.parseFunction();
                            if (func) {
                                statements.push(func);
                                parsed = true;
                            }
                        }
                        // 检查是否是 struct
                        else if (isPublicKeyword && nextToken?.value === "struct") {
                            const struct = this.parseStruct();
                            if (struct) {
                                statements.push(struct);
                                parsed = true;
                            }
                        } else if (isPrivateKeyword && nextToken?.value === "struct") {
                            const struct = this.parseStruct();
                            if (struct) {
                                statements.push(struct);
                                parsed = true;
                            }
                        }
                    }
                }
                // 优先级：先 function，后 struct，最后变量
                // 检查是否是 function
                else if (isFunctionKeyword) {
                    const func = this.parseFunction();
                    if (func) {
                        statements.push(func);
                        parsed = true;
                    }
                }
                // 检查是否是 struct
                else if (isStructKeyword) {
                    const struct = this.parseStruct();
                    if (struct) {
                        statements.push(struct);
                        parsed = true;
                    }
                }
                // 检查是否是类型关键字或 constant 关键字（用于变量声明）
                else if (isTypeKeyword || isConstantKeyword) {
                    const variable = this.parseVariableDeclaration();
                    if (variable) {
                        statements.push(variable);
                        parsed = true;
                    }
                }
            }

            // 如果没有解析成功，尝试解析为变量声明
            // 检查是否是类型关键字、constant 关键字，或者是标识符（可能是类型名）
            if (!parsed) {
                // 如果当前 token 是类型关键字、constant 关键字，或者是标识符（但不是 function/struct/public/private）
                // 注意：类型关键字（如 integer）可能不在 if 块中，需要单独处理
                if (isTypeKeyword || isConstantKeyword || 
                    (token.type === TokenType.Identifier && 
                     token.value !== "function" && token.value !== "struct" && 
                     token.value !== "public" && token.value !== "private" &&
                     token.value !== "method" && token.value !== "static")) {
                    const variable = this.parseVariableDeclaration();
                    if (variable) {
                        statements.push(variable);
                        parsed = true;
                    }
                }
            }

            // 如果仍然无法解析，跳过当前 token
            if (!parsed) {
                if (this.current()?.type === TokenType.RightBrace) {
                    break;
                }
                this.next();
            }
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

    private parseStruct(): ZincStructDeclaration {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 检查修饰符
        let isPublic = false;
        let isPrivate = false;
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "public") {
            isPublic = true;
            this.next();
        } else if (this.current()?.type === TokenType.Identifier && this.current()?.value === "private") {
            isPrivate = true;
            this.next();
        }

        // 消费 struct 关键字
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "struct") {
            this.next();
        }

        // 解析存储大小（可选）：struct[Size]
        let storageSize: number | Identifier | null = null;
        if (this.current()?.type === TokenType.LeftBracket) {
            this.next();
            const sizeToken = this.current()!;
            if (sizeToken.type === TokenType.IntegerLiteral) {
                storageSize = parseInt(sizeToken.value, 10);
                this.next();
            } else if (sizeToken.type === TokenType.Identifier) {
                storageSize = new Identifier(sizeToken.value, sizeToken.start, sizeToken.end);
                this.next();
            }
            if (this.current()?.type === TokenType.RightBracket) {
                this.next();
            }
        }

        // 解析结构体名
        let name: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            name = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        }

        // 解析数组大小（可选）：struct Name[] 或 struct Name[Size]
        let arraySize: number | Identifier | null = null;
        let isArrayStruct = false;
        if (this.current()?.type === TokenType.LeftBracket) {
            isArrayStruct = true;
            this.next();
            if (this.current()?.type !== TokenType.RightBracket) {
                const sizeToken = this.current()!;
                if (sizeToken.type === TokenType.IntegerLiteral) {
                    arraySize = parseInt(sizeToken.value, 10);
                    this.next();
                } else if (sizeToken.type === TokenType.Identifier) {
                    arraySize = new Identifier(sizeToken.value, sizeToken.start, sizeToken.end);
                    this.next();
                }
            }
            if (this.current()?.type === TokenType.RightBracket) {
                this.next();
            }
        }

        // 解析结构体体
        if (this.current()?.type === TokenType.LeftBrace) {
            this.next();
        }

        const body = this.parseStructBody();
        const members: (ZincVariableDeclaration | ZincMethodDeclaration)[] = [];

        // 从 body 中提取成员
        for (const stmt of body.statements) {
            if (stmt instanceof ZincVariableDeclaration || stmt instanceof ZincMethodDeclaration) {
                members.push(stmt);
            }
        }

        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        } else {
            // 如果缺少右大括号，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : (body.end || startPos);
            this.error(
                "Expected '}' to close struct body",
                errorPos,
                errorPos,
                "Add '}' to close the struct body"
            );
        }

        const endPos = body.end || this.current()?.end || startPos;
        return new ZincStructDeclaration({
            name,
            storageSize,
            arraySize,
            isArrayStruct,
            members,
            isPublic,
            isPrivate,
            start: startPos,
            end: endPos
        });
    }

    private parseStructBody(): ZincBlock {
        const startToken = this.current()!;
        const startPos = startToken.start;

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (!this.current() || this.current()!.type === TokenType.RightBrace) {
                break;
            }

            const token = this.current()!;
            let parsed = false;

            // 检查是否是 public {} 或 private {} 块
            if (token.type === TokenType.Identifier && (token.value === "public" || token.value === "private")) {
                const nextToken = this.peek();
                if (nextToken?.type === TokenType.LeftBrace) {
                    // 这是 public {} 或 private {} 块
                    const block = this.parsePublicOrPrivateBlock(token.value === "public");
                    if (block) {
                        // 将块内的所有成员添加到 statements
                        statements.push(...block.statements);
                        parsed = true;
                    }
                }
            }

            // 如果没有解析为块，继续正常解析
            if (!parsed) {
                // 检查是否是方法声明
                let isMethod = false;
                if (token.type === TokenType.Identifier) {
                    if (token.value === "method") {
                        isMethod = true;
                    } else if (token.value === "static" || token.value === "public" || token.value === "private") {
                        // 检查下一个 token 是否是 method
                        const nextToken = this.peek();
                        if (nextToken && nextToken.type === TokenType.Identifier) {
                            if (nextToken.value === "method") {
                                isMethod = true;
                            } else if (nextToken.value === "static" || nextToken.value === "public" || nextToken.value === "private") {
                                // 两个修饰符，检查第三个 token
                                // 简化处理：尝试解析方法，如果失败则解析变量
                                const member = this.parseStructMember();
                                if (member) {
                                    statements.push(member);
                                    parsed = true;
                                }
                            }
                        }
                    }
                }

                // 如果是方法，直接调用 parseMethod
                if (!parsed && isMethod) {
                    const method = this.parseMethod();
                    if (method) {
                        statements.push(method);
                        parsed = true;
                    }
                }

                // 否则，调用 parseStructMember 来处理（可能是变量或其他成员）
                if (!parsed) {
                    const member = this.parseStructMember();
                    if (member) {
                        statements.push(member);
                        parsed = true;
                    }
                }

                // 如果仍然无法解析，跳过当前 token
                if (!parsed) {
                    if (this.current()?.type === TokenType.RightBrace) {
                        break;
                    }
                    this.next();
                }
            }
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

    private parseMethod(): ZincMethodDeclaration {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 检查修饰符
        let isStatic = false;
        let isPublic = false;
        let isPrivate = false;
        
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "static") {
            isStatic = true;
            this.next();
        }
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "public") {
            isPublic = true;
            this.next();
        } else if (this.current()?.type === TokenType.Identifier && this.current()?.value === "private") {
            isPrivate = true;
            this.next();
        }

        // 消费 method 关键字
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "method") {
            this.next();
        }

        // 解析方法名
        let name: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            name = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        }

        // 解析参数列表
        const parameters = this.parseParameterList();

        // 解析返回类型（可选）
        const returnType = this.parseReturnType();

        // 解析方法体（可选，接口中可能没有）
        let body: ZincBlock | null = null;
        if (this.current()?.type === TokenType.LeftBrace) {
            body = this.parseMethodBody();
        } else if (this.current()?.type === TokenType.Semicolon) {
            // 接口方法可能只有声明，没有实现
            this.next();
            const endPos = this.current()?.end || startPos;
            return new ZincMethodDeclaration({
                name,
                parameters,
                returnType,
                body: null,
                isStatic,
                isPublic,
                isPrivate,
                start: startPos,
                end: endPos
            });
        }

        const endPos = body?.end || this.current()?.end || startPos;
        return new ZincMethodDeclaration({
            name,
            parameters,
            returnType,
            body,
            isStatic,
            isPublic,
            isPrivate,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析方法体
     * method body { ... }
     */
    private parseMethodBody(): ZincBlock {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 消费左大括号
        if (this.current()?.type === TokenType.LeftBrace) {
            this.next();
        }

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.current()?.type === TokenType.RightBrace) {
                break;
            }

            // 解析语句
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析语句，跳过当前 token
                if (this.current()?.type === TokenType.RightBrace) {
                    break;
                }
                this.next();
            }
        }

        // 消费右大括号
        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        } else {
            // 如果缺少右大括号，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : startPos;
            this.error(
                "Expected '}' to close method body",
                errorPos,
                errorPos,
                "Add '}' to close the method body"
            );
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

    private parseParameterList(): ZincParameter[] {
        const parameters: ZincParameter[] = [];
        const startToken = this.current();

        // 消费左括号
        if (this.current()?.type === TokenType.LeftParen) {
            this.next();
        } else {
            // 如果缺少左括号，记录错误
            const errorPos = startToken ? startToken.start : { line: 0, position: 0 };
            this.error(
                "Expected '(' to start parameter list",
                errorPos,
                errorPos,
                "Add '(' to start the parameter list"
            );
            return parameters;
        }

        // 如果右括号紧跟着，说明没有参数
        if (this.current()?.type === TokenType.RightParen) {
            this.next();
            return parameters;
        }

        // 解析参数
        do {
            // 解析参数类型（可能是类型 token 或 Identifier）
            let paramType: Identifier | null = null;
            const typeToken = this.current();
            if (typeToken) {
                // 检查是否是类型关键字
                const isTypeKeyword = typeToken.type === TokenType.TypeInteger ||
                                     typeToken.type === TokenType.TypeReal ||
                                     typeToken.type === TokenType.TypeString ||
                                     typeToken.type === TokenType.TypeBoolean ||
                                     typeToken.type === TokenType.TypeCode ||
                                     typeToken.type === TokenType.TypeHandle ||
                                     typeToken.type === TokenType.TypeKey;
                
                if (isTypeKeyword) {
                    // 类型关键字，需要获取对应的字符串值
                    let typeName: string;
                    switch (typeToken.type) {
                        case TokenType.TypeInteger:
                            typeName = "integer";
                            break;
                        case TokenType.TypeReal:
                            typeName = "real";
                            break;
                        case TokenType.TypeString:
                            typeName = "string";
                            break;
                        case TokenType.TypeBoolean:
                            typeName = "boolean";
                            break;
                        case TokenType.TypeCode:
                            typeName = "code";
                            break;
                        case TokenType.TypeHandle:
                            typeName = "handle";
                            break;
                        case TokenType.TypeKey:
                            typeName = "key";
                            break;
                        default:
                            typeName = typeToken.value;
                    }
                    paramType = new Identifier(typeName, typeToken.start, typeToken.end);
                    this.next();
                } else if (typeToken.type === TokenType.Identifier) {
                    paramType = new Identifier(typeToken.value, typeToken.start, typeToken.end);
                    this.next();
                }
            }

            // 解析参数名称
            let paramName: Identifier | null = null;
            if (this.current()?.type === TokenType.Identifier) {
                paramName = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
                this.next();
            }

            if (paramType && paramName) {
                const paramStart = paramType.start;
                const paramEnd = paramName.end;
                parameters.push(new ZincParameter(paramType, paramName, paramStart, paramEnd));
            }

            if (this.current()?.type === TokenType.RightParen) {
                break;
            }
            
            if (this.current()?.type !== TokenType.Comma) {
                // 如果既不是逗号也不是右括号，可能是语法错误，但尝试继续
                break;
            }
            this.next(); // 消费逗号
        } while (true);

        // 消费右括号
        if (this.current()?.type === TokenType.RightParen) {
            this.next();
        } else {
            // 如果缺少右括号，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : (startToken ? startToken.start : { line: 0, position: 0 });
            this.error(
                "Expected ')' to close parameter list",
                errorPos,
                errorPos,
                "Add ')' to close the parameter list"
            );
        }

        return parameters;
    }

    private parseReturnType(): Identifier | null {
        // 跳过可能的注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }
        
        // 检查是否有 -> 符号
        // 注意：-> 可能是两个 token: OperatorMinus 和 OperatorGreater
        // 或者是一个 token: OperatorRightArrow
        if (this.current()?.type === TokenType.OperatorRightArrow) {
            // 单个 token 的 ->
            this.next(); // 消费 ->
        } else if (this.current()?.type === TokenType.OperatorMinus && this.peek()?.type === TokenType.OperatorGreater) {
            // 两个 token 的 ->
            this.next(); // 消费 -
            this.next(); // 消费 >
        } else {
            return null;
        }
        
        // 跳过可能的注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }
        
        // 解析返回类型（可能是 Identifier 或类型 token）
        // 支持类型关键字：integer, real, string, boolean, code, handle, key
        // 也支持自定义类型（Identifier）
        if (this.current()?.type === TokenType.Identifier) {
            const returnType = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
            return returnType;
        } else if (this.current()?.type === TokenType.TypeInteger ||
                   this.current()?.type === TokenType.TypeReal ||
                   this.current()?.type === TokenType.TypeString ||
                   this.current()?.type === TokenType.TypeBoolean ||
                   this.current()?.type === TokenType.TypeCode ||
                   this.current()?.type === TokenType.TypeHandle ||
                   this.current()?.type === TokenType.TypeKey) {
            // 类型关键字，需要获取对应的字符串值
            let typeName: string;
            switch (this.current()!.type) {
                case TokenType.TypeInteger:
                    typeName = "integer";
                    break;
                case TokenType.TypeReal:
                    typeName = "real";
                    break;
                case TokenType.TypeString:
                    typeName = "string";
                    break;
                case TokenType.TypeBoolean:
                    typeName = "boolean";
                    break;
                case TokenType.TypeCode:
                    typeName = "code";
                    break;
                case TokenType.TypeHandle:
                    typeName = "handle";
                    break;
                case TokenType.TypeKey:
                    typeName = "key";
                    break;
                case TokenType.Identifier:
                    if (this.current()!.value !== "void" && this.current()!.value !== "nothing") {
                        typeName = this.current()!.value;
                    } else {
                        return null;
                    }
                    break;
                default:
                    return null;
            }
            const returnType = new Identifier(typeName, this.current()!.start, this.current()!.end);
            this.next();
            return returnType;
        }

        return null;
    }

    /**
     * 解析 function 声明
     * public/private? function name(params) -> returnType { ... }
     */
    private parseFunction(): ZincFunctionDeclaration | null {
        const startToken = this.current();
        if (!startToken) {
            return null;
        }

        const startPos = startToken.start;

        // 检查 public/private 修饰符
        let isPublic = false;
        let isPrivate = false;
        if (startToken.type === TokenType.Identifier && startToken.value === "public") {
            isPublic = true;
            this.next();
        } else if (startToken.type === TokenType.Identifier && startToken.value === "private") {
            isPrivate = true;
            this.next();
        }

        // 消费 function 关键字（可能是 KeywordFunction 或 Identifier）
        if (this.current()?.type === TokenType.KeywordFunction || 
            (this.current()?.type === TokenType.Identifier && this.current()?.value === "function")) {
            this.next();
        } else {
            return null;
        }

        // 解析函数名
        let name: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            name = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        } else {
            // 如果缺少函数名，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : startPos;
            this.error(
                "Expected function name after 'function' keyword",
                errorPos,
                errorPos,
                "Add a function name after 'function'"
            );
            return null;
        }

        if (!name) {
            return null;
        }

        // 解析参数列表
        const parameters = this.parseParameterList();

        // 解析返回类型（可选）
        // 注意：parseReturnType 内部会处理注释和空白
        const returnType = this.parseReturnType();

        // 解析函数体
        let body: ZincBlock | null = null;
        if (this.current()?.type === TokenType.LeftBrace) {
            body = this.parseFunctionBody();
        }

        const endPos = body?.end || this.current()?.end || startPos;
        return new ZincFunctionDeclaration({
            name,
            parameters,
            returnType,
            body,
            isPublic,
            isPrivate,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析函数体
     * function body { ... }
     */
    private parseFunctionBody(): ZincBlock {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 检查并消费左大括号
        if (this.current()?.type === TokenType.LeftBrace) {
            this.next();
        } else {
            // 如果缺少左大括号，记录错误
            const errorPos = startToken.start;
            this.error(
                "Expected '{' to start function body",
                errorPos,
                errorPos,
                "Add '{' to start the function body"
            );
            // 继续解析，尝试恢复
        }

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.current()?.type === TokenType.RightBrace) {
                break;
            }

            // 解析语句
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析语句，跳过当前 token
                if (this.current()?.type === TokenType.RightBrace) {
                    break;
                }
                this.next();
            }
        }

        // 消费右大括号
        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

    private parseStructMember(): ZincStatement | null {
        if (!this.current()) {
            return null;
        }

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        if (!this.current() || this.current()!.type === TokenType.RightBrace) {
            return null;
        }

        const token = this.current()!;

        // 检查是否是方法声明
        // 方法声明的格式：static? public?/private? method name(...)
        if (token.type === TokenType.Identifier) {
            // 检查是否是 method 关键字
            if (token.value === "method") {
                return this.parseMethod();
            }

            // 检查是否是修饰符 + method
            if (token.value === "static" || token.value === "public" || token.value === "private") {
                const nextToken = this.peek();
                if (nextToken && nextToken.type === TokenType.Identifier) {
                    if (nextToken.value === "method") {
                        return this.parseMethod();
                    }
                    // 可能是两个修饰符，继续检查
                    if (nextToken.value === "static" || nextToken.value === "public" || nextToken.value === "private") {
                        // 需要查看第三个 token，但 peek 只能看一个，所以先尝试解析方法
                        // 如果失败，再尝试解析变量
                        const savedPosition = this.current();
                        const methodResult = this.parseMethod();
                        if (methodResult) {
                            return methodResult;
                        }
                        // 如果解析方法失败，恢复位置并尝试解析变量
                        // 注意：这里简化处理，实际可能需要更复杂的逻辑
                    }
                }
            }
        }

        // 检查是否是变量声明
        // 变量声明的格式：constant? public?/private? type name[][]=value?;
        const isTypeKeyword = token.type === TokenType.TypeInteger ||
                             token.type === TokenType.TypeReal ||
                             token.type === TokenType.TypeString ||
                             token.type === TokenType.TypeBoolean ||
                             token.type === TokenType.TypeCode ||
                             token.type === TokenType.TypeHandle ||
                             token.type === TokenType.TypeKey;
        
        // 如果是类型关键字，或者是 constant 关键字，或者是标识符（可能是类型名），尝试解析为变量
        if (isTypeKeyword || 
            (token.type === TokenType.Identifier && token.value === "constant") ||
            (token.type === TokenType.Identifier && 
             token.value !== "static" && token.value !== "public" && token.value !== "private" && 
             token.value !== "method")) {
            return this.parseVariableDeclaration();
        }

        return null;
    }


    private parseVariableDeclaration(): ZincVariableDeclaration | null {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 检查修饰符
        let isConstant = false;
        let isPublic = false;
        let isPrivate = false;

        // constant 可能是 keywordConstant 或 Identifier
        if (this.current()?.type === TokenType.keywordConstant || 
            (this.current()?.type === TokenType.Identifier && this.current()?.value === "constant")) {
            isConstant = true;
            this.next();
        }

        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "public") {
            isPublic = true;
            this.next();
        } else if (this.current()?.type === TokenType.Identifier && this.current()?.value === "private") {
            isPrivate = true;
            this.next();
        }

        // 解析类型（可能是类型关键字或 Identifier）
        let type: Identifier | null = null;
        if (this.current()) {
            const typeToken = this.current()!;
            const isTypeKeyword = typeToken.type === TokenType.TypeInteger ||
                                 typeToken.type === TokenType.TypeReal ||
                                 typeToken.type === TokenType.TypeString ||
                                 typeToken.type === TokenType.TypeBoolean ||
                                 typeToken.type === TokenType.TypeCode ||
                                 typeToken.type === TokenType.TypeHandle ||
                                 typeToken.type === TokenType.TypeKey;
            
            if (isTypeKeyword || typeToken.type === TokenType.Identifier) {
                type = new Identifier(typeToken.value, typeToken.start, typeToken.end);
                this.next();
            }
        }

        if (!type) {
            return null;
        }

        // 解析变量名
        let name: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            name = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        }

        if (!name) {
            return null;
        }

        // 解析数组维度
        const arraySizes: (number | Identifier)[] = [];
        while (this.current()?.type === TokenType.LeftBracket) {
            this.next(); // 消费 [
            
            if (this.current()?.type === TokenType.RightBracket) {
                // [] 表示默认大小，使用 -1 作为标记（或者不添加，取决于语义）
                // 这里不添加任何值，因为空数组 [] 在语义上表示动态数组
                this.next(); // 消费 ]
            } else {
                // 解析数组大小（可能是数字或标识符）
                const sizeToken = this.current()!;
                if (sizeToken.type === TokenType.IntegerLiteral) {
                    arraySizes.push(parseInt(sizeToken.value, 10));
                    this.next();
                } else if (sizeToken.type === TokenType.Identifier) {
                    arraySizes.push(new Identifier(sizeToken.value, sizeToken.start, sizeToken.end));
                    this.next();
                }
                
                if (this.current()?.type === TokenType.RightBracket) {
                    this.next(); // 消费 ]
                }
            }
        }

        // 解析初始值（可选）
        let initialValue: Expression | null = null;
        if (this.current()?.type === TokenType.OperatorAssign) {
            this.next(); // 消费 =
            initialValue = this.parseExpression();
        }

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = initialValue?.end || this.current()?.end || name.end || startPos;
        return new ZincVariableDeclaration({
            type,
            name,
            initialValue,
            isConstant,
            isPublic,
            isPrivate,
            arraySizes,
            start: startPos,
            end: endPos
        });
    }

    // 局部变量声明 用于method 跟 function中
    private parseVariableStatement(): ZincVariableDeclaration | null {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 检查修饰符（局部变量可能没有修饰符，或者有 constant）
        let isConstant = false;

        // constant 可能是 keywordConstant 或 Identifier
        if (this.current()?.type === TokenType.keywordConstant || 
            (this.current()?.type === TokenType.Identifier && this.current()?.value === "constant")) {
            isConstant = true;
            this.next();
        }

        // 解析类型（可能是类型关键字或 Identifier）
        let type: Identifier | null = null;
        if (this.current()) {
            const typeToken = this.current()!;
            const isTypeKeyword = typeToken.type === TokenType.TypeInteger ||
                                 typeToken.type === TokenType.TypeReal ||
                                 typeToken.type === TokenType.TypeString ||
                                 typeToken.type === TokenType.TypeBoolean ||
                                 typeToken.type === TokenType.TypeCode ||
                                 typeToken.type === TokenType.TypeHandle ||
                                 typeToken.type === TokenType.TypeKey;
            
            if (isTypeKeyword || typeToken.type === TokenType.Identifier) {
                type = new Identifier(typeToken.value, typeToken.start, typeToken.end);
                this.next();
            }
        }

        if (!type) {
            return null;
        }

        // 解析变量名
        let name: Identifier | null = null;
        if (this.current()?.type === TokenType.Identifier) {
            name = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
            this.next();
        }

        if (!name) {
            return null;
        }

        // 解析数组维度
        const arraySizes: (number | Identifier)[] = [];
        while (this.current()?.type === TokenType.LeftBracket) {
            this.next(); // 消费 [
            
            if (this.current()?.type === TokenType.RightBracket) {
                // [] 表示默认大小，使用 -1 作为标记（或者不添加，取决于语义）
                // 这里不添加任何值，因为空数组 [] 在语义上表示动态数组
                this.next(); // 消费 ]
            } else {
                // 解析数组大小（可能是数字或标识符）
                const sizeToken = this.current()!;
                if (sizeToken.type === TokenType.IntegerLiteral) {
                    arraySizes.push(parseInt(sizeToken.value, 10));
                    this.next();
                } else if (sizeToken.type === TokenType.Identifier) {
                    arraySizes.push(new Identifier(sizeToken.value, sizeToken.start, sizeToken.end));
                    this.next();
                }
                
                if (this.current()?.type === TokenType.RightBracket) {
                    this.next(); // 消费 ]
                }
            }
        }

        // 解析初始值（可选）
        let initialValue: Expression | null = null;
        if (this.current()?.type === TokenType.OperatorAssign) {
            this.next(); // 消费 =
            initialValue = this.parseExpression();
        }

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = initialValue?.end || this.current()?.end || name.end || startPos;
        return new ZincVariableDeclaration({
            type,
            name,
            initialValue,
            isConstant,
            isPublic: false,
            isPrivate: false,
            arraySizes,
            start: startPos,
            end: endPos
        });
    }

    // 赋值
    private parseAsignment(): ZincAssignmentStatement | null {
        // 先解析左值（目标表达式）
        // 左值可以是：标识符、数组访问、成员访问等
        // 使用 parseCall 来解析左值表达式（但不包括函数调用）
        let target: Expression | null = null;

        // 解析基本表达式（标识符、字面量等）
        target = this.parsePrimary();

        if (!target) {
            return null;
        }

        // 处理后续的成员访问、数组访问（但不包括函数调用，因为函数调用不能作为左值）
        while (true) {
            if (this.current()?.type === TokenType.LeftParen) {
                // 函数调用不能作为左值，停止解析
                break;
            } else if (this.current()?.type === TokenType.Dot) {
                // 成员访问：obj.member
                this.next();
                if (this.current()?.type === TokenType.Identifier) {
                    const nameToken = this.current()!;
                    const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                    this.next();
                    // 使用 BinaryExpression 表示成员访问
                    target = new BinaryExpression(
                        OperatorType.Dot,
                        target,
                        name,
                        target.start,
                        name.end
                    );
                } else {
                    break;
                }
            } else if (this.current()?.type === TokenType.LeftBracket) {
                // 数组索引：arr[index]
                this.next();
                const index = this.parseExpression();
                if (this.current()?.type === TokenType.RightBracket) {
                    this.next();
                }
                // 使用 BinaryExpression 表示数组索引
                target = new BinaryExpression(
                    OperatorType.Index,
                    target,
                    index,
                    target.start,
                    index.end
                );
            } else {
                break;
            }
        }

        if (!target) {
            return null;
        }

        // 检查赋值操作符
        let operator = "=";
        if (this.current()?.type === TokenType.OperatorAssign) {
            operator = "=";
            this.next();
        } else if (this.current()?.type === TokenType.OperatorPlusAssign) {
            operator = "+=";
            this.next();
        } else if (this.current()?.type === TokenType.OperatorMinusAssign) {
            operator = "-=";
            this.next();
        } else if (this.current()?.type === TokenType.OperatorMultiplyAssign) {
            operator = "*=";
            this.next();
        } else if (this.current()?.type === TokenType.OperatorDivideAssign) {
            operator = "/=";
            this.next();
        } else {
            return null;
        }

        // 解析右值（值表达式）
        const value = this.parseExpression();

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = value?.end || this.current()?.end || target.end;
        return new ZincAssignmentStatement({
            target,
            value,
            operator,
            start: target.start,
            end: endPos
        });
    }

    /**
     * 解析 if 语句
     * if (condition) { ... } else { ... }
     * if (condition) { ... } else if (condition) { ... } else { ... }
     */
    private parseIf(): ZincIfStatement {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 消费 if 关键字（可能是 KeywordIf 或 Identifier）
        if (this.current()?.type === TokenType.KeywordIf || 
            (this.current()?.type === TokenType.Identifier && this.current()?.value === "if")) {
            this.next();
        }

        // 解析条件表达式
        // 支持 if expr {} 或 if (expr) {}
        let condition: Expression | null = null;
        
        // 检查是否有括号
        if (this.current()?.type === TokenType.LeftParen) {
            this.next(); // 消费 (
            condition = this.parseExpression();
            if (this.current()?.type === TokenType.RightParen) {
                this.next(); // 消费 )
            }
        } else {
            // 没有括号，直接解析表达式
            condition = this.parseExpression();
        }

        // 解析 then 块
        const thenBlock = this.parseBlockOrStatement();

        // 解析 else 块（可选）
        let elseBlock: ZincBlock | null = null;
        // else 可能是 KeywordElse 或 Identifier
        if (this.current()?.type === TokenType.KeywordElse || 
            (this.current()?.type === TokenType.Identifier && this.current()?.value === "else")) {
            this.next(); // 消费 else
            
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            // 检查是否是 else if
            if (this.current()?.type === TokenType.KeywordIf || 
                (this.current()?.type === TokenType.Identifier && this.current()?.value === "if")) {
                // else if 语法：解析为嵌套的 if 语句
                const nestedIf = this.parseIf();
                // 将嵌套的 if 包装在 else 块中
                elseBlock = new ZincBlock([nestedIf], nestedIf.start, nestedIf.end);
            } else {
                // 普通的 else 块
                elseBlock = this.parseBlockOrStatement();
            }
        }

        const endPos = elseBlock?.end || thenBlock?.end || this.current()?.end || startPos;
        return new ZincIfStatement({
            condition,
            thenBlock,
            elseBlock,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 else if（已集成到 parseIf 中，此方法保留用于兼容）
     */
    private parseElseIf(): ZincIfStatement | null {
        // else if 已经在 parseIf 中处理，这里直接调用 parseIf
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "if") {
            return this.parseIf();
        }
        return null;
    }

    /**
     * 解析 else（已集成到 parseIf 中，此方法保留用于兼容）
     */
    private parseElse(): ZincBlock | null {
        // else 已经在 parseIf 中处理
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "else") {
            this.next();
            return this.parseBlockOrStatement();
        }
        return null;
    }

    /**
     * 解析块或单个语句
     * 支持 { ... } 或单个语句
     */
    private parseBlockOrStatement(): ZincBlock {
        if (this.current()?.type === TokenType.LeftBrace) {
            // 块语句
            return this.parseBlock();
        } else {
            // 单个语句，包装在块中
            const statements: ZincStatement[] = [];
            const startToken = this.current();
            const startPos = startToken?.start || { line: 0, position: 0 };

            // 尝试解析单个语句
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }

            const endPos = stmt?.end || this.current()?.end || startPos;
            return new ZincBlock(statements, startPos, endPos);
        }
    }

    /**
     * 解析代码块 { ... }
     */
    private parseBlock(): ZincBlock {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 消费左大括号
        if (this.current()?.type === TokenType.LeftBrace) {
            this.next();
        }

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.current()?.type === TokenType.RightBrace) {
                break;
            }

            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            } else {
                // 如果无法解析语句，跳过当前 token
                if (this.current()?.type === TokenType.RightBrace) {
                    break;
                }
                this.next();
            }
        }

        // 消费右大括号
        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

    /**
     * 解析语句（用于块内部）
     */
    private parseStatement(): ZincStatement | null {
        if (!this.current()) {
            return null;
        }

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        if (!this.current()) {
            return null;
        }

        const token = this.current()!;

        // 检查各种语句类型
        // if 语句（可能是 KeywordIf 或 Identifier）
        if (token.type === TokenType.KeywordIf || 
            (token.type === TokenType.Identifier && token.value === "if")) {
            return this.parseIf();
        }
        
        // return 语句（可能是 keywordReturn 或 Identifier）
        if (token.type === TokenType.keywordReturn || 
            (token.type === TokenType.Identifier && token.value === "return")) {
            return this.parseReturn();
        }
        
        if (token.type === TokenType.Identifier) {
            // while 语句
            if (token.value === "while") {
                const whileStmt = this.parseWhile();
                return whileStmt;
            }
            // for 语句
            if (token.value === "for") {
                return this.parseFor();
            }
            // break 语句
            if (token.value === "break") {
                return this.parseBreak();
            }
        }

        // 检查是否是变量声明
        const isTypeKeyword = token.type === TokenType.TypeInteger ||
                             token.type === TokenType.TypeReal ||
                             token.type === TokenType.TypeString ||
                             token.type === TokenType.TypeBoolean ||
                             token.type === TokenType.TypeCode ||
                             token.type === TokenType.TypeHandle ||
                             token.type === TokenType.TypeKey;
        
        if (isTypeKeyword || (token.type === TokenType.Identifier && token.value === "constant")) {
            return this.parseVariableStatement();
        }

        // 检查是否是赋值语句（标识符后跟 =, +=, -=, *=, /=）
        if (token.type === TokenType.Identifier) {
            const nextToken = this.peek();
            if (nextToken?.type === TokenType.OperatorAssign || 
                nextToken?.type === TokenType.OperatorPlusAssign ||
                nextToken?.type === TokenType.OperatorMinusAssign ||
                nextToken?.type === TokenType.OperatorMultiplyAssign ||
                nextToken?.type === TokenType.OperatorDivideAssign) {
                return this.parseAsignment();
            }
        }

        // 检查是否是方法调用语句
        if (token.type === TokenType.Identifier) {
            // 检查是否是函数调用（标识符后跟 (）
            const nextToken = this.peek();
            if (nextToken?.type === TokenType.LeftParen) {
                return this.parseCallStatement();
            }
        }

        return null;
    }

    /**
     * 解析 while 语句
     * while (condition) { ... }
     * while condition { ... }
     */
    private parseWhile(): ZincWhileStatement | null {
        const startToken = this.current();
        if (!startToken || startToken.type !== TokenType.Identifier || startToken.value !== "while") {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 while 关键字

        // 解析条件表达式
        // 支持 while expr {} 或 while (expr) {}
        let condition: Expression | null = null;
        
        // 检查是否有括号
        if (this.current()?.type === TokenType.LeftParen) {
            this.next(); // 消费 (
            condition = this.parseExpression();
            if (this.current()?.type === TokenType.RightParen) {
                this.next(); // 消费 )
            }
        } else {
            // 没有括号，直接解析表达式
            condition = this.parseExpression();
        }

        // 解析循环体
        const body = this.parseBlockOrStatement();

        const endPos = body?.end || this.current()?.end || startPos;
        return new ZincWhileStatement({
            condition,
            body,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 for 循环
     * for (expr) {}
     * for (0 < i <= 2) {}
     * for (赋值;expr;赋值) {}
     */
    private parseFor(): ZincForStatement | null {
        const startToken = this.current();
        if (!startToken || startToken.type !== TokenType.Identifier || startToken.value !== "for") {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 for 关键字

        // 消费左括号
        if (this.current()?.type === TokenType.LeftParen) {
            this.next();
        }

        // 尝试解析范围语法（如 0 < i <= 2）
        const range = this.parseForRange();

        let init: Expression | null = null;
        let condition: Expression | null = null;
        let update: Expression | null = null;

        if (!range) {
            // 检查是否是 C 风格的 for 循环（包含分号）
            // 简单方法：检查下一个 token 是否是分号，或者当前 token 后是否有分号
            // 由于 peek 只能看一个 token，我们直接尝试解析
            // 如果遇到分号，就按 C 风格解析；否则按普通表达式解析
            
            // 检查当前或下一个 token 是否是分号
            const nextToken = this.peek();
            const hasSemicolon = this.current()?.type === TokenType.Semicolon || 
                                nextToken?.type === TokenType.Semicolon;
            
            if (hasSemicolon) {
                // 解析 C 风格的 for 循环：for (init; condition; update)
                const forIndex = this.parseForIndex();
                if (forIndex) {
                    init = forIndex.init;
                    condition = forIndex.condition;
                    update = forIndex.update;
                }
            } else {
                // 解析为普通表达式
                condition = this.parseExpression();
            }
        }

        // 消费右括号
        if (this.current()?.type === TokenType.RightParen) {
            this.next();
        }

        // 解析循环体
        const body = this.parseBlockOrStatement();

        const endPos = body?.end || this.current()?.end || startPos;
        return new ZincForStatement({
            range,
            init,
            condition,
            update,
            body,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 for 范围表达式
     * 支持格式：0 < i <= 2
     * 解析为嵌套的 BinaryExpression 结构：
     * {
     *   left: {
     *     left: 0,
     *     right: i,
     *     op: "<"
     *   },
     *   right: 2,
     *   op: "<="
     * }
     */
    private parseForRange(): ZincForRange | null {
        const startToken = this.current();
        if (!startToken) {
            return null;
        }

        // 检查第一个 token 是否是数字或标识符
        if (startToken.type !== TokenType.IntegerLiteral && 
            startToken.type !== TokenType.RealLiteral &&
            startToken.type !== TokenType.Identifier) {
            return null;
        }

        // 检查第二个 token 是否是范围运算符
        const secondToken = this.peek();
        if (!secondToken || 
            (secondToken.type !== TokenType.OperatorLessEqual && 
             secondToken.type !== TokenType.OperatorLess &&
             secondToken.type !== TokenType.OperatorGreater && 
             secondToken.type !== TokenType.OperatorGreaterEqual)) {
            return null;
        }

        // 检查第三个 token 是否是标识符（变量名）
        // 需要 peek 两次，但 peek 只支持一次，所以先消费前两个 token
        let startValue: Expression;
        if (startToken.type === TokenType.IntegerLiteral) {
            this.next();
            startValue = new IntegerLiteral(parseInt(startToken.value, 10), startToken.start, startToken.end);
        } else if (startToken.type === TokenType.RealLiteral) {
            this.next();
            startValue = new RealLiteral(parseFloat(startToken.value), startToken.start, startToken.end);
        } else {
            // Identifier
            this.next();
            startValue = new Identifier(startToken.value, startToken.start, startToken.end);
        }

        // 检查第一个运算符
        const op1 = this.current();
        if (!op1 || 
            (op1.type !== TokenType.OperatorLessEqual && 
             op1.type !== TokenType.OperatorLess &&
             op1.type !== TokenType.OperatorGreater && 
             op1.type !== TokenType.OperatorGreaterEqual)) {
            return null;
        }

        const isInclusive1 = op1.type === TokenType.OperatorLessEqual || op1.type === TokenType.OperatorGreaterEqual;
        let op1Type: OperatorType;
        switch (op1.type) {
            case TokenType.OperatorLess:
                op1Type = OperatorType.Less;
                break;
            case TokenType.OperatorLessEqual:
                op1Type = OperatorType.LessEqual;
                break;
            case TokenType.OperatorGreater:
                op1Type = OperatorType.Greater;
                break;
            case TokenType.OperatorGreaterEqual:
                op1Type = OperatorType.GreaterEqual;
                break;
            default:
                return null;
        }
        this.next();

        // 检查变量
        const variableToken = this.current();
        if (!variableToken || variableToken.type !== TokenType.Identifier) {
            return null;
        }
        const variable = new Identifier(variableToken.value, variableToken.start, variableToken.end);
        this.next();

        // 检查第二个运算符
        const op2 = this.current();
        if (!op2 || 
            (op2.type !== TokenType.OperatorLessEqual && 
             op2.type !== TokenType.OperatorLess &&
             op2.type !== TokenType.OperatorGreater && 
             op2.type !== TokenType.OperatorGreaterEqual)) {
            return null;
        }

        const isInclusive2 = op2.type === TokenType.OperatorLessEqual || op2.type === TokenType.OperatorGreaterEqual;
        let op2Type: OperatorType;
        switch (op2.type) {
            case TokenType.OperatorLess:
                op2Type = OperatorType.Less;
                break;
            case TokenType.OperatorLessEqual:
                op2Type = OperatorType.LessEqual;
                break;
            case TokenType.OperatorGreater:
                op2Type = OperatorType.Greater;
                break;
            case TokenType.OperatorGreaterEqual:
                op2Type = OperatorType.GreaterEqual;
                break;
            default:
                return null;
        }
        this.next();

        // 解析结束值
        const endToken = this.current();
        if (!endToken || 
            (endToken.type !== TokenType.IntegerLiteral && 
             endToken.type !== TokenType.RealLiteral &&
             endToken.type !== TokenType.Identifier)) {
            return null;
        }

        let endValue: Expression;
        if (endToken.type === TokenType.IntegerLiteral) {
            this.next();
            endValue = new IntegerLiteral(parseInt(endToken.value, 10), endToken.start, endToken.end);
        } else if (endToken.type === TokenType.RealLiteral) {
            this.next();
            endValue = new RealLiteral(parseFloat(endToken.value), endToken.start, endToken.end);
        } else {
            // Identifier
            this.next();
            endValue = new Identifier(endToken.value, endToken.start, endToken.end);
        }

        // 创建嵌套的 BinaryExpression 结构
        // 内层：startValue op1 variable
        const innerExpr = new BinaryExpression(
            op1Type,
            startValue,
            variable,
            startValue.start,
            variable.end
        );

        // 外层：(startValue op1 variable) op2 endValue
        const outerExpr = new BinaryExpression(
            op2Type,
            innerExpr,
            endValue,
            startValue.start,
            endValue.end
        );

        // 确定是否为包含边界（两个都是 <= 或 >=）
        const isInclusive = isInclusive1 && isInclusive2;

        const endPos = endValue.end;
        return new ZincForRange({
            startValue,
            variable,
            endValue,
            isInclusive,
            start: startValue.start,
            end: endPos
        });
    }

    /**
     * 解析 C 风格的 for 循环索引
     * for (赋值;expr;赋值) {}
     * 支持格式：
     * - for (i = 0; i < 10; i++) {}
     * - for (; i < 10; i++) {}
     * - for (i = 0; i < 10;) {}
     * - for (; i < 10;) {}
     */
    private parseForIndex(): { init: Expression | null; condition: Expression | null; update: Expression | null } | null {
        // 解析 init（可选，可以是赋值表达式或空）
        let init: Expression | null = null;
        
        // 如果当前不是分号，尝试解析 init
        if (this.current() && this.current()!.type !== TokenType.Semicolon) {
            // 尝试解析赋值表达式
            // 检查是否是赋值表达式（标识符后跟 =, +=, -=, *=, /=）
            const currentToken = this.current()!;
            if (currentToken.type === TokenType.Identifier) {
            const nextToken = this.peek();
            if (nextToken && (
                nextToken.type === TokenType.OperatorAssign ||
                nextToken.type === TokenType.OperatorPlusAssign ||
                nextToken.type === TokenType.OperatorMinusAssign ||
                nextToken.type === TokenType.OperatorMultiplyAssign ||
                nextToken.type === TokenType.OperatorDivideAssign
            )) {
                // 解析赋值表达式
                init = this.parseExpression(); // parseExpression 会处理赋值
                } else {
                    // 可能是其他表达式
                    init = this.parseExpression();
                }
            } else {
                // 其他类型的表达式
                init = this.parseExpression();
            }
        }

        // 消费第一个分号
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        // 解析 condition（可选，可以是表达式或空）
        let condition: Expression | null = null;
        
        // 如果当前不是分号，尝试解析 condition
        if (this.current() && this.current()!.type !== TokenType.Semicolon) {
            condition = this.parseExpression();
        }

        // 消费第二个分号
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        // 解析 update（可选，可以是赋值表达式或空）
        let update: Expression | null = null;
        
        // 如果当前不是右括号，尝试解析 update
        if (this.current() && this.current()!.type !== TokenType.RightParen) {
            // 尝试解析赋值表达式
            const currentToken = this.current()!;
            if (currentToken.type === TokenType.Identifier) {
                const nextToken = this.peek();
                if (nextToken && (
                    nextToken.type === TokenType.OperatorAssign ||
                    (nextToken.type === TokenType.Identifier && 
                     (nextToken.value === "+=" || nextToken.value === "-=" || 
                      nextToken.value === "*=" || nextToken.value === "/="))
                )) {
                    // 解析赋值表达式
                    update = this.parseExpression(); // parseExpression 会处理赋值
                } else {
                    // 可能是其他表达式（如 i++）
                    update = this.parseExpression();
                }
            } else {
                // 其他类型的表达式
                update = this.parseExpression();
            }
        }

        return {
            init,
            condition,
            update
        };
    }

    /**
     * 解析 break 语句
     * break;
     */
    private parseBreak(): ZincBreakStatement | null {
        const startToken = this.current();
        // break 可能是 Identifier（因为 lexer 可能不将其识别为关键字）
        if (!startToken || (startToken.type !== TokenType.Identifier || startToken.value !== "break")) {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 break

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = this.current()?.end || startToken.end;
        return new ZincBreakStatement(startPos, endPos);
    }

    /**
     * 解析 return 语句
     * return;
     * return value;
     */
    private parseReturn(): ZincReturnStatement | null {
        const startToken = this.current();
        // return 可能是 keywordReturn 或 Identifier
        if (!startToken || 
            (startToken.type !== TokenType.keywordReturn && 
             (startToken.type !== TokenType.Identifier || startToken.value !== "return"))) {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 return

        // 解析返回值（可选）
        let value: Expression | null = null;
        
        // 检查是否有返回值（不是分号或右大括号）
        if (this.current() && 
            this.current()!.type !== TokenType.Semicolon && 
            this.current()!.type !== TokenType.RightBrace) {
            value = this.parseExpression();
        }

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = value?.end || this.current()?.end || startToken.end;
        return new ZincReturnStatement(value, startPos, endPos);
    }

    /**
     * 解析方法调用语句
     * 支持：
     * - aaa() - 简单调用
     * - this.aaa() - 成员调用
     * - aaa().bbb().ccc() - 链式调用
     */
    private parseCallStatement(): ZincCallStatement | null {
        const startToken = this.current();
        if (!startToken) {
            return null;
        }

        // 解析调用表达式（支持链式调用）
        const expr = this.parseCallExpression();

        if (!expr) {
            return null;
        }

        // 消费分号（如果有）
        if (this.current()?.type === TokenType.Semicolon) {
            this.next();
        }

        const endPos = expr.end || this.current()?.end || startToken.end;
        return new ZincCallStatement(expr, startToken.start, endPos);
    }

    /**
     * 解析调用表达式（支持链式调用）
     * aaa().bbb().ccc()
     */
    private parseCallExpression(): Expression | null {
        // 解析基本表达式（标识符、this 等）
        let expr = this.parsePrimary();

        if (!expr) {
            return null;
        }

        // 循环处理链式调用：函数调用、成员访问、数组索引
        while (true) {
            if (this.current()?.type === TokenType.LeftParen) {
                // 函数调用：aaa()
                expr = this.finishCall(expr);
            } else if (this.current()?.type === TokenType.Dot) {
                // 成员访问：.bbb
                this.next(); // 消费 .
                if (this.current()?.type === TokenType.Identifier) {
                    const nameToken = this.current()!;
                    const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                    this.next();
                    
                    // 使用 BinaryExpression 表示成员访问：expr.name
                    expr = new BinaryExpression(
                        OperatorType.Dot,
                        expr,
                        name,
                        expr.start,
                        name.end
                    );
                } else {
                    break;
                }
            } else if (this.current()?.type === TokenType.LeftBracket) {
                // 数组索引：[index]
                this.next();
                const index = this.parseExpression();
                if (this.current()?.type === TokenType.RightBracket) {
                    this.next();
                }
                // 使用 BinaryExpression 表示数组索引：expr[index]
                expr = new BinaryExpression(
                    OperatorType.Index,
                    expr,
                    index,
                    expr.start,
                    index.end
                );
            } else {
                break;
            }
        }

        return expr;
    }

    // 表达式
    private parseExpression(): Expression {
        return this.parseAssignment();
    }

    /**
     * 解析赋值表达式（在表达式级别，这里只解析逻辑或表达式）
     */
    private parseAssignment(): Expression {
        return this.parseLogicalOr();
    }

    /**
     * 解析逻辑或表达式
     */
    private parseLogicalOr(): Expression {
        let expr = this.parseLogicalAnd();

        while (this.current()?.type === TokenType.OperatorLogicalOr) {
            const operatorToken = this.current()!;
            this.next();
            const right = this.parseLogicalAnd();
            expr = new BinaryExpression(
                OperatorType.LogicalOr,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析逻辑与表达式
     */
    private parseLogicalAnd(): Expression {
        let expr = this.parseEquality();

        while (this.current()?.type === TokenType.OperatorLogicalAnd) {
            const operatorToken = this.current()!;
            this.next();
            const right = this.parseEquality();
            expr = new BinaryExpression(
                OperatorType.LogicalAnd,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析相等性表达式
     */
    private parseEquality(): Expression {
        let expr = this.parseComparison();

        while (this.current()?.type === TokenType.OperatorEqual || 
               this.current()?.type === TokenType.OperatorNotEqual) {
            const operatorToken = this.current()!;
            const operator = operatorToken.type === TokenType.OperatorEqual 
                ? OperatorType.Equal 
                : OperatorType.NotEqual;
            this.next();
            const right = this.parseComparison();
            expr = new BinaryExpression(
                operator,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析比较表达式
     */
    private parseComparison(): Expression {
        let expr = this.parseTerm();

        while (this.current() && (
            this.current()!.type === TokenType.OperatorGreater ||
            this.current()!.type === TokenType.OperatorGreaterEqual ||
            this.current()!.type === TokenType.OperatorLess ||
            this.current()!.type === TokenType.OperatorLessEqual
        )) {
            const operatorToken = this.current()!;
            let operator: OperatorType;
            switch (operatorToken.type) {
                case TokenType.OperatorGreater:
                    operator = OperatorType.Greater;
                    break;
                case TokenType.OperatorGreaterEqual:
                    operator = OperatorType.GreaterEqual;
                    break;
                case TokenType.OperatorLess:
                    operator = OperatorType.Less;
                    break;
                case TokenType.OperatorLessEqual:
                    operator = OperatorType.LessEqual;
                    break;
                default:
                    operator = OperatorType.Equal;
            }
            this.next();
            const right = this.parseTerm();
            expr = new BinaryExpression(
                operator,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析项（加减）
     */
    private parseTerm(): Expression {
        let expr = this.parseFactor();

        while (this.current()?.type === TokenType.OperatorPlus || 
               this.current()?.type === TokenType.OperatorMinus) {
            const operatorToken = this.current()!;
            const operator = operatorToken.type === TokenType.OperatorPlus
                ? OperatorType.Plus
                : OperatorType.Minus;
            this.next();
            const right = this.parseFactor();
            expr = new BinaryExpression(
                operator,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析因子（乘除）
     */
    private parseFactor(): Expression {
        let expr = this.parseUnary();

        while (this.current() && (
            this.current()!.type === TokenType.OperatorMultiply ||
            this.current()!.type === TokenType.OperatorDivide ||
            this.current()!.type === TokenType.OperatorModulo
        )) {
            const operatorToken = this.current()!;
            let operator: OperatorType;
            switch (operatorToken.type) {
                case TokenType.OperatorMultiply:
                    operator = OperatorType.Multiply;
                    break;
                case TokenType.OperatorDivide:
                    operator = OperatorType.Divide;
                    break;
                case TokenType.OperatorModulo:
                    operator = OperatorType.Modulo;
                    break;
                default:
                    operator = OperatorType.Plus;
            }
            this.next();
            const right = this.parseUnary();
            expr = new BinaryExpression(
                operator,
                expr,
                right,
                expr.start,
                right.end
            );
        }

        return expr;
    }

    /**
     * 解析一元表达式
     */
    private parseUnary(): Expression {
        if (this.current()?.type === TokenType.OperatorLogicalNot) {
            const operatorToken = this.current()!;
            this.next();
            const right = this.parseUnary();
            return new BinaryExpression(
                OperatorType.LogicalNot,
                new Identifier("", operatorToken.start, operatorToken.end),
                right,
                operatorToken.start,
                right.end
            );
        }
        
        if (this.current()?.type === TokenType.OperatorMinus) {
            const operatorToken = this.current()!;
            this.next();
            const right = this.parseUnary();
            return new BinaryExpression(
                OperatorType.Minus,
                new IntegerLiteral(0, operatorToken.start, operatorToken.end),
                right,
                operatorToken.start,
                right.end
            );
        }

        return this.parseCall();
    }

    /**
     * 解析调用表达式（用于表达式解析）
     */
    private parseCall(): Expression {
        let expr = this.parsePrimary();

        if (!expr) {
            return new Identifier("", { line: 0, position: 0 }, { line: 0, position: 0 });
        }

        // 循环处理链式调用：函数调用、成员访问、数组索引
        while (true) {
            if (this.current()?.type === TokenType.LeftParen) {
                // 函数调用：aaa()
                expr = this.finishCall(expr);
            } else if (this.current()?.type === TokenType.Dot) {
                // 成员访问：.bbb
                this.next(); // 消费 .
                if (this.current()?.type === TokenType.Identifier) {
                    const nameToken = this.current()!;
                    const name = new Identifier(nameToken.value, nameToken.start, nameToken.end);
                    this.next();
                    
                    // 使用 BinaryExpression 表示成员访问：expr.name
                    expr = new BinaryExpression(
                        OperatorType.Dot,
                        expr,
                        name,
                        expr.start,
                        name.end
                    );
                } else {
                    break;
                }
            } else if (this.current()?.type === TokenType.LeftBracket) {
                // 数组索引：[index]
                this.next();
                const index = this.parseExpression();
                if (!index) {
                    // 如果无法解析索引表达式，创建一个占位符
                    const placeholder = new Identifier("", expr.start, expr.end);
                    expr = new BinaryExpression(
                        OperatorType.Index,
                        expr,
                        placeholder,
                        expr.start,
                        expr.end
                    );
                } else {
                    if (this.current()?.type === TokenType.RightBracket) {
                        this.next();
                    }
                    // 使用 BinaryExpression 表示数组索引：expr[index]
                    expr = new BinaryExpression(
                        OperatorType.Index,
                        expr,
                        index,
                        expr.start,
                        index.end || expr.end
                    );
                }
            } else {
                break;
            }
        }

        return expr;
    }

    /**
     * 完成函数调用解析
     */
    private finishCall(callee: Expression): CallExpression {
        this.next(); // 消费 (
        const args: Expression[] = [];

        if (this.current()?.type !== TokenType.RightParen) {
            do {
                args.push(this.parseExpression());
                if (this.current()?.type !== TokenType.Comma) {
                    break;
                }
                this.next();
            } while (true);
        }

        const endToken = this.current();
        if (this.current()?.type === TokenType.RightParen) {
            this.next();
        }

        const endPos = endToken?.end || callee.end;
        
        // 如果 callee 是 BinaryExpression（成员访问），需要提取成员名
        // 例如：obj.method() -> callee 是 BinaryExpression(Dot, obj, method)
        let calleeIdentifier: Identifier | Expression;
        if (callee instanceof BinaryExpression && callee.operator === OperatorType.Dot) {
            // 成员方法调用：obj.method()
            // callee 保持为 BinaryExpression，这样可以在语义分析时识别
            calleeIdentifier = callee;
        } else if (callee instanceof Identifier) {
            calleeIdentifier = callee;
        } else {
            // 对于其他类型的表达式，尝试提取标识符
            // 如果是 CallExpression，使用其 callee
            if (callee instanceof CallExpression) {
                calleeIdentifier = callee.callee instanceof Identifier ? callee.callee : callee;
            } else {
                // 创建一个标识符占位符
                calleeIdentifier = new Identifier("", callee.start, callee.end);
            }
        }
        
        return new CallExpression(
            calleeIdentifier,
            args,
            callee.start,
            endPos
        );
    }

    /**
     * 解析基本表达式（字面量和标识符）
     */
    private parsePrimary(): Expression {
        const token = this.current();
        if (!token) {
            return new Identifier("", { line: 0, position: 0 }, { line: 0, position: 0 });
        }

        // 整数字面量
        if (token.type === TokenType.IntegerLiteral) {
            this.next();
            return new IntegerLiteral(parseInt(token.value, 10), token.start, token.end);
        }

        // 实数字面量
        if (token.type === TokenType.RealLiteral) {
            this.next();
            return new RealLiteral(parseFloat(token.value), token.start, token.end);
        }

        // 字符串字面量
        if (token.type === TokenType.StringLiteral) {
            this.next();
            return new StringLiteral(token.value, token.start, token.end);
        }

        // 布尔字面量
        if (token.type === TokenType.BooleanLiteral) {
            this.next();
            return new BooleanLiteral(token.value.toLowerCase() === "true", token.start, token.end);
        }

        // null 字面量
        if (token.type === TokenType.Identifier && token.value === "null") {
            this.next();
            return new NullLiteral(token.start, token.end);
        }

        // 类型 token（在表达式中视为标识符）
        const isTypeKeyword = token.type === TokenType.TypeInteger ||
                             token.type === TokenType.TypeReal ||
                             token.type === TokenType.TypeString ||
                             token.type === TokenType.TypeBoolean ||
                             token.type === TokenType.TypeCode ||
                             token.type === TokenType.TypeHandle ||
                             token.type === TokenType.TypeKey;
        
        if (isTypeKeyword) {
            this.next();
            return new Identifier(token.value, token.start, token.end);
        }

        // 标识符
        if (token.type === TokenType.Identifier) {
            // 检查是否是布尔字面量（true/false），可能被识别为 Identifier
            if (token.value === "true" || token.value === "false") {
                this.next();
                return new BooleanLiteral(token.value === "true", token.start, token.end);
            }
            // 检查是否是匿名函数表达式
            if (token.value === "function") {
                return this.parseAnonymousFunction();
            }
            this.next();
            return new Identifier(token.value, token.start, token.end);
        }

        // 括号表达式
        if (token.type === TokenType.LeftParen) {
            this.next();
            const expr = this.parseExpression();
            if (this.current()?.type === TokenType.RightParen) {
                this.next();
            }
            return expr;
        }

        // 如果遇到分号，返回虚拟标识符
        if (token.type === TokenType.Semicolon) {
            return new Identifier("", token.start, token.end);
        }

        // 未知 token，返回虚拟标识符
        this.next();
        return new Identifier("", token.start, token.end);
    }

    /**
     * 解析匿名函数表达式
     * function(args) -> returnType { ... }
     */
    private parseAnonymousFunction(): ZincAnonymousFunction {
        const startToken = this.current()!;
        const startPos = startToken.start;

        // 消费 function 关键字
        if (this.current()?.type === TokenType.Identifier && this.current()?.value === "function") {
            this.next();
        }

        // 解析参数列表
        const parameters = this.parseParameterList();

        // 解析返回类型（可选）
        let returnType: Identifier | null = null;
        if (this.current()?.type === TokenType.OperatorRightArrow) {
            this.next(); // 消费 ->
            if (this.current()?.type === TokenType.Identifier) {
                returnType = new Identifier(this.current()!.value, this.current()!.start, this.current()!.end);
                this.next();
            }
        }

        // 解析函数体
        let body: ZincBlock | null = null;
        if (this.current()?.type === TokenType.LeftBrace) {
            body = this.parseMethodBody(); // 复用方法体解析逻辑
        }

        const endPos = body?.end || this.current()?.end || startPos;
        return new ZincAnonymousFunction({
            parameters,
            returnType,
            body,
            start: startPos,
            end: endPos
        });
    }

    /**
     * 解析 public {} 或 private {} 块
     * public { ... } 或 private { ... }
     * 块内的所有声明都会被标记为 public 或 private
     */
    private parsePublicOrPrivateBlock(isPublic: boolean): ZincBlock | null {
        const startToken = this.current();
        if (!startToken || startToken.type !== TokenType.Identifier) {
            return null;
        }

        const startPos = startToken.start;
        this.next(); // 消费 public 或 private 关键字

        // 跳过注释
        while (this.current() && (
            this.current()!.type === TokenType.SingleLineComment ||
            this.current()!.type === TokenType.MultiLineComment
        )) {
            this.next();
        }

        // 消费左大括号
        if (this.current()?.type !== TokenType.LeftBrace) {
            return null;
        }
        this.next();

        const statements: ZincStatement[] = [];

        // 解析块内的语句，直到遇到右大括号
        while (this.current() && this.current()!.type !== TokenType.RightBrace && !this.isEnd()) {
            // 跳过注释
            while (this.current() && (
                this.current()!.type === TokenType.SingleLineComment ||
                this.current()!.type === TokenType.MultiLineComment
            )) {
                this.next();
            }

            if (this.current()?.type === TokenType.RightBrace) {
                break;
            }

            const token = this.current()!;
            let parsed = false;

            // 检查是否是类型关键字（用于变量声明）
            const isTypeKeyword = token.type === TokenType.TypeInteger ||
                                 token.type === TokenType.TypeReal ||
                                 token.type === TokenType.TypeString ||
                                 token.type === TokenType.TypeBoolean ||
                                 token.type === TokenType.TypeCode ||
                                 token.type === TokenType.TypeHandle ||
                                 token.type === TokenType.TypeKey;
            
            // 检查是否是 constant 关键字（用于变量声明）
            const isConstantKeyword = token.type === TokenType.keywordConstant || 
                                     (token.type === TokenType.Identifier && token.value === "constant");
            
            // 检查是否是 public/private 关键字（支持嵌套的 public/private 块）
            const isPublicKeyword = token.type === TokenType.Identifier && token.value === "public";
            const isPrivateKeyword = token.type === TokenType.Identifier && token.value === "private";
            
            // 检查是否是 function 关键字
            const isFunctionKeyword = token.type === TokenType.KeywordFunction || 
                                     (token.type === TokenType.Identifier && token.value === "function");
            
            // 检查是否是 struct 关键字
            const isStructKeyword = token.type === TokenType.Identifier && token.value === "struct";

            // 优先级：先 function，后 struct，最后变量
            // 同时支持嵌套的 public/private 块
            if (token.type === TokenType.Identifier || token.type === TokenType.KeywordFunction || isTypeKeyword || isConstantKeyword) {
                // 检查是否是嵌套的 public {} 或 private {} 块
                if (isPublicKeyword || isPrivateKeyword) {
                    const nextToken = this.peek();
                    if (nextToken?.type === TokenType.LeftBrace) {
                        // 这是嵌套的 public {} 或 private {} 块
                        const nestedBlock = this.parsePublicOrPrivateBlock(isPublicKeyword);
                        if (nestedBlock) {
                            // 将嵌套块内的所有语句添加到当前 statements
                            statements.push(...nestedBlock.statements);
                            parsed = true;
                        }
                    }
                }
                // 检查是否是 function
                else if (isFunctionKeyword) {
                    const func = this.parseFunction();
                    if (func) {
                        // 设置 public/private 标记
                        func.isPublic = isPublic;
                        func.isPrivate = !isPublic;
                        statements.push(func);
                        parsed = true;
                    }
                }
                // 检查是否是 struct
                else if (isStructKeyword) {
                    const struct = this.parseStruct();
                    if (struct) {
                        // 设置 public/private 标记
                        struct.isPublic = isPublic;
                        struct.isPrivate = !isPublic;
                        statements.push(struct);
                        parsed = true;
                    }
                }
                // 检查是否是类型关键字或 constant 关键字（用于变量声明）
                else if (isTypeKeyword || isConstantKeyword) {
                    const variable = this.parseVariableDeclaration();
                    if (variable) {
                        // 设置 public/private 标记
                        variable.isPublic = isPublic;
                        variable.isPrivate = !isPublic;
                        statements.push(variable);
                        parsed = true;
                    }
                }
            }

            // 如果没有解析成功，尝试解析为变量声明
            if (!parsed) {
                if (isTypeKeyword || isConstantKeyword || 
                    (token.type === TokenType.Identifier && 
                     token.value !== "function" && token.value !== "struct" && 
                     token.value !== "public" && token.value !== "private" &&
                     token.value !== "method" && token.value !== "static")) {
                    const variable = this.parseVariableDeclaration();
                    if (variable) {
                        // 设置 public/private 标记
                        variable.isPublic = isPublic;
                        variable.isPrivate = !isPublic;
                        statements.push(variable);
                        parsed = true;
                    }
                }
            }

            // 如果仍然无法解析，跳过当前 token
            if (!parsed) {
                if (this.current()?.type === TokenType.RightBrace) {
                    break;
                }
                this.next();
            }
        }

        // 消费右大括号
        if (this.current()?.type === TokenType.RightBrace) {
            this.next();
        } else {
            // 如果缺少右大括号，记录错误
            const currentToken = this.current();
            const errorPos = currentToken ? currentToken.start : startPos;
            this.error(
                "Expected '}' to close block",
                errorPos,
                errorPos,
                "Add '}' to close the block"
            );
        }

        const endPos = this.current()?.end || startPos;
        return new ZincBlock(statements, startPos, endPos);
    }

}
