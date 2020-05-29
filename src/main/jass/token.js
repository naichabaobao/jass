class Token {
    constructor(type, value, location) {
        var _a, _b;
        this._type = type;
        this._value = value;
        this._line = (_a = location === null || location === void 0 ? void 0 : location.line) !== null && _a !== void 0 ? _a : -1;
        this._position = (_b = location === null || location === void 0 ? void 0 : location.position) !== null && _b !== void 0 ? _b : -1;
    }
    get type() {
        return this._type;
    }
    get value() {
        return this._value;
    }
    get line() {
        return this._line;
    }
    get position() {
        return this._position;
    }
    get end_position() {
        return this._position + this.value.length;
    }
}
var LexicalType;
(function (LexicalType) {
    LexicalType["default"] = "\u9ED8\u8A8D";
    LexicalType["id"] = "id";
    LexicalType["op"] = "op";
    LexicalType["zero"] = "zero";
    LexicalType["point"] = "point";
    LexicalType["dollar"] = "dollar";
    /**
     * 十六进制
     */
    LexicalType["hex"] = "hex";
    /**
     * 八进制
     */
    LexicalType["octal"] = "octal";
    /**
     * 小数
     */
    LexicalType["decimals"] = "decimals";
    LexicalType["string"] = "string";
    LexicalType["close_string"] = "close_string";
    LexicalType["code"] = "code";
    LexicalType["close_code"] = "close_code";
    LexicalType["comment"] = "comment";
    LexicalType["number"] = "number";
    LexicalType["div"] = "div";
    /**
     * 感叹号
     */
    LexicalType["exclamation"] = "exclamation";
    LexicalType["gt"] = "gt";
    LexicalType["it"] = "it";
    LexicalType["eq"] = "eq";
    LexicalType["other"] = "other";
})(LexicalType || (LexicalType = {}));
class TokenParser {
    constructor(content) {
        this.supportJass = true;
        this.support_vjass = false;
        this.support_zinc = false;
        this.support_lua = false;
        this.need_type = false;
        this.need_native = false;
        this.need_globals = true;
        this.need_function = true;
        /// 配置是否改变
        this._changed = true;
        this._tokens = new Array();
        this._content = content;
    }
    get content() {
        return this._content;
    }
    tokens() {
        if (this._content.length > 0) {
            if (this.support_vjass && this.support_zinc && this.support_lua) {
            }
            else if (this.support_vjass && this.support_zinc) {
            }
            else if (this.support_vjass && this.support_lua) {
            }
            else if (this.support_zinc && this.support_lua) {
            }
            else if (this.support_vjass) {
            }
            else if (this.support_zinc) {
            }
            else if (this.support_lua) {
            }
            else if (this.supportJass) {
                if (this._changed) {
                    const tokens = new Array();
                    let index = 0;
                    const content = this._content;
                    const getChar = function () {
                        return content[index++];
                    };
                    let value = "";
                    let type = LexicalType.default;
                    let line = 0;
                    let position = 0;
                    let char;
                    while (char = getChar()) {
                        value += char;
                        /// 开始只能是字母，//,\n,\s
                        const clear = function () {
                            value = "";
                        };
                        /// 添加token
                        const pushToken = function (tokenType) {
                            tokens.push(new Token(tokenType, value, {
                                line,
                                position
                            }));
                            clear();
                            type = LexicalType.default;
                        };
                        const pushKeywordToken = function () {
                            pushToken("keyword");
                        };
                        const pushOperationToken = function () {
                            pushToken("operation");
                        };
                        const pushIdentifierToken = function () {
                            pushToken("identifier");
                        };
                        const pushValueToken = function () {
                            pushToken("value");
                        };
                        const pushCommentToken = function () {
                            pushToken("comment");
                        };
                        const pushOtherToken = function () {
                            pushToken("other");
                        };
                        switch (type) {
                            case LexicalType.default:
                                if (LexicalTool.isColonSign(char)) {
                                    // " 左冒号
                                    type = LexicalType.string;
                                }
                                else if (LexicalTool.isDivisionSign(char)) {
                                    // /
                                    type = LexicalType.div;
                                }
                                else if (LexicalTool.isSingleQuotesSign(char)) {
                                    // ' 左单引号号
                                    type = LexicalType.code;
                                }
                                else if (LexicalTool.isLetter(char)) {
                                    type = LexicalType.id;
                                }
                                else if (LexicalTool.isNumber0(char)) {
                                    // 0 小数或者十六进制或者八进制
                                    type = LexicalType.zero;
                                }
                                else if (LexicalTool.isDollarSign(char)) {
                                    // $ 十六进制
                                    type = LexicalType.dollar;
                                }
                                else if (LexicalTool.isPointSign(char)) {
                                    // .
                                    type = LexicalType.point;
                                }
                                else if (LexicalTool.isNumber(char)) {
                                    // 1-9
                                    type = LexicalType.number;
                                }
                                else if (LexicalTool.isDivisionSign(char)) {
                                    // /
                                    type = LexicalType.div;
                                }
                                else if (LexicalTool.isExclamationSign(char)) {
                                    // !
                                    type = LexicalType.exclamation;
                                }
                                else if (LexicalTool.isGtSign(char)) {
                                    // >
                                    type = LexicalType.gt;
                                }
                                else if (LexicalTool.isLtSign(char)) {
                                    // <
                                    type = LexicalType.it;
                                }
                                else if (LexicalTool.isEqualSign(char)) {
                                    // =
                                    type = LexicalType.eq;
                                }
                                else if (LexicalTool.isEqualSign(char)) {
                                    // =
                                    type = LexicalType.eq;
                                }
                                else if (LexicalTool.isLeftBracketSign(char)
                                    || LexicalTool.isRightBracketSign(char)
                                    || LexicalTool.isLeftBraceSign(char)
                                    || LexicalTool.isRightBraceSign(char)
                                    || LexicalTool.isLeftSquareBracketSign(char)
                                    || LexicalTool.isRightSquareBracketSign(char)
                                    || LexicalTool.isCommaSign(char)
                                    || LexicalTool.isPlusSign(char)
                                    || LexicalTool.isSubtractionSign(char)
                                    || LexicalTool.isProductSign(char)
                                    || LexicalTool.isNewLine(char)) {
                                    // () {} [] ,
                                    type = LexicalType.op;
                                }
                                else if (LexicalTool.isSpace(char)) {
                                    clear();
                                }
                                else {
                                    type = LexicalType.other;
                                }
                                break;
                            case LexicalType.zero:
                                if (LexicalTool.isPointSign(char)) { // 小数
                                    type = LexicalType.decimals;
                                }
                                else if (LexicalTool.isLetterX(char)) { // 十六进制
                                    type = LexicalType.hex;
                                }
                                else if (LexicalTool.isNumber0_7(char)) { // 八进制
                                    type = LexicalType.octal;
                                }
                                break;
                            case LexicalType.dollar:
                                if (LexicalTool.isHexNumber(char)) {
                                    type = LexicalType.hex;
                                }
                                break;
                            case LexicalType.string:
                                // 为"并且前面不是\（转移）
                                if (LexicalTool.isColonSign(char) && !value.endsWith("\\")) {
                                    type = LexicalType.close_string;
                                }
                                break;
                            case LexicalType.code:
                                if (LexicalTool.isSingleQuotesSign(char)) {
                                    type = LexicalType.close_code;
                                }
                                else if (!(LexicalTool.isLetter(char) || LexicalTool.isNumber(char))) {
                                    type = LexicalType.close_code;
                                }
                                break;
                            case LexicalType.point:
                                if (LexicalTool.isNumber(char)) {
                                    type = LexicalType.decimals;
                                }
                                break;
                            case LexicalType.number:
                                if (LexicalTool.isPointSign(char)) {
                                    type = LexicalType.decimals;
                                }
                                break;
                            case LexicalType.div:
                                if (LexicalTool.isDivisionSign(char)) {
                                    type = LexicalType.comment;
                                }
                                break;
                            case LexicalType.exclamation:
                                if (LexicalTool.isEqualSign(char)) {
                                    type = LexicalType.op;
                                }
                                break;
                            case LexicalType.gt:
                                if (LexicalTool.isEqualSign(char)) {
                                    type = LexicalType.op;
                                }
                                break;
                            case LexicalType.it:
                                if (LexicalTool.isEqualSign(char)) {
                                    type = LexicalType.op;
                                }
                                break;
                            case LexicalType.eq:
                                if (LexicalTool.isEqualSign(char)) {
                                    type = LexicalType.op;
                                }
                                break;
                        }
                        /// 判断下个字符是否终结
                        const over = () => {
                            const nextChar = content.charAt(index);
                            switch (type) {
                                case LexicalType.default:
                                    break;
                                case LexicalType.id:
                                    if (!(LexicalTool.isLetter(nextChar) || LexicalTool.isNumber(nextChar) || LexicalTool.isUnderlineSign(nextChar))) {
                                        if (LexicalTool.isKeyword(value)) { // keyword
                                            pushKeywordToken();
                                        }
                                        else {
                                            pushIdentifierToken();
                                        }
                                    }
                                    break;
                                case LexicalType.op:
                                    pushOperationToken();
                                    break;
                                case LexicalType.zero:
                                    if (!LexicalTool.isNumber0_7(nextChar)
                                        && !LexicalTool.isPointSign(nextChar)
                                        && !LexicalTool.isLetterX(nextChar)) {
                                        pushValueToken();
                                    }
                                    break;
                                case LexicalType.point:
                                    if (!LexicalTool.isNumber(nextChar)) {
                                        pushOtherToken();
                                    }
                                    break;
                                case LexicalType.dollar:
                                    if (!LexicalTool.isHexNumber(nextChar)) {
                                        pushOtherToken();
                                    }
                                    break;
                                case LexicalType.hex:
                                    if (!LexicalTool.isHexNumber(nextChar)) {
                                        pushValueToken();
                                    }
                                    break;
                                case LexicalType.octal:
                                    if (!LexicalTool.isNumber0_7(nextChar)) {
                                        pushValueToken();
                                    }
                                    break;
                                case LexicalType.decimals:
                                    if (!LexicalTool.isNumber(nextChar)) {
                                        pushValueToken();
                                    }
                                    break;
                                case LexicalType.string:
                                    if (LexicalTool.isNewLine(nextChar)) {
                                        pushOtherToken();
                                    }
                                    break;
                                case LexicalType.close_string:
                                    pushValueToken();
                                    break;
                                case LexicalType.code:
                                    if (!(LexicalTool.isNumber(nextChar) || LexicalTool.isLetter(nextChar)) && !LexicalTool.isSingleQuotesSign(nextChar)) {
                                        pushOtherToken();
                                    }
                                    break;
                                case LexicalType.close_code:
                                    pushValueToken();
                                    break;
                                case LexicalType.comment:
                                    if (!nextChar || LexicalTool.isNewLine(nextChar)) {
                                        pushCommentToken();
                                    }
                                    break;
                                case LexicalType.number: // 1-9
                                    if (!(LexicalTool.isPointSign(nextChar) || LexicalTool.isNumber(nextChar))) {
                                        pushValueToken();
                                    }
                                    break;
                                case LexicalType.div:
                                    if (!LexicalTool.isDivisionSign(nextChar)) {
                                        pushOperationToken();
                                    }
                                    break;
                                case LexicalType.exclamation: // !
                                    if (!LexicalTool.isEqualSign(nextChar)) {
                                        pushOtherToken();
                                    }
                                    break;
                                case LexicalType.gt:
                                case LexicalType.it:
                                case LexicalType.eq:
                                    if (!LexicalTool.isEqualSign(nextChar)) {
                                        pushOperationToken();
                                    }
                                    break;
                                case LexicalType.other:
                                    if (!(LexicalTool.isNewLine(nextChar) || LexicalTool.isSpace(nextChar))) {
                                        pushOtherToken();
                                    }
                                    break;
                            }
                        };
                        over();
                        if (LexicalTool.isNewLine(char)) {
                            line++;
                            position = 0;
                        }
                        else {
                            position++;
                        }
                    }
                    this._tokens = tokens;
                    this._changed = false;
                }
            }
            return this._tokens;
        }
        return [];
    }
    /// 设置已改变状态
    _change() {
        this._changed = true;
    }
    get supportVjass() {
        return this.support_vjass;
    }
    set supportVjass(isSupportVjass) {
        if (this.support_vjass !== isSupportVjass) {
            this._change();
            this.support_vjass = isSupportVjass;
        }
    }
    get supportZinc() {
        return this.support_zinc;
    }
    set supportZinc(isSupportZinc) {
        if (this.support_zinc !== isSupportZinc) {
            this._change();
            this.support_zinc = isSupportZinc;
        }
    }
    get supportLua() {
        return this.support_lua;
    }
    set supportLua(isSupportLua) {
        if (this.support_lua !== isSupportLua) {
            this._change();
            this.support_lua = isSupportLua;
        }
    }
}
class LexicalTool {
    static isChar(char) {
        return char.length === 1;
    }
    ;
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    static isLetter(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code >= 65 && code <= 90 || code >= 97 && code <= 122;
        })();
    }
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    static isLowerLetter(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code >= 97 && code <= 122;
        })();
    }
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    static isUpperLetter(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code >= 65 && code <= 90;
        })();
    }
    /**
    X ：88
    x ：120
    */
    static isLetterX(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code === 88 || code === 120;
        })();
    }
    /**
    0～9 : 48～57
    */
    static isNumber(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code >= 48 && code <= 57;
        })();
    }
    /**
    0～9 : 48～57
    a～f : 97～102
    A～F : 65～70
    */
    static isHexNumber(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);
        })();
    }
    /**
    0～7 : 48～55
    */
    static isNumber0_7(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code >= 48 && code <= 55;
        })();
    }
    /**
    0 : 48
    */
    static isNumber0(char) {
        return this.isChar(char) && char.charCodeAt(0) === 48;
    }
    /**
    / : 47
    */
    static isLeftForwardSlash(char) {
        return this.isChar(char) && char.charCodeAt(0) === 47;
    }
    /**
    \ : 92
    */
    static isRightForwardSlash(char) {
        return this.isChar(char) && char.charCodeAt(0) === 92;
    }
    /**
    = : 61
    */
    static isEqualSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 61;
    }
    /**
    + : 43
    */
    static isPlusSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 43;
    }
    /**
    \- : 45
    */
    static isSubtractionSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 45;
    }
    /**
    \* : 42
    */
    static isProductSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 42;
    }
    /**
    / : 47
    */
    static isDivisionSign(char) {
        return this.isChar(char) && this.isLeftForwardSlash(char);
    }
    /**
    " : 34
    */
    static isColonSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 34;
    }
    /**
    ' : 39
    */
    static isSingleQuotesSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 39;
    }
    /**
    ( : 40
    */
    static isLeftBracketSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 40;
    }
    /**
    ) : 41
    */
    static isRightBracketSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 41;
    }
    /**
    { : 123
    */
    static isLeftBraceSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 123;
    }
    /**
    } : 125
    */
    static isRightBraceSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 125;
    }
    /**
    [ : 91
    */
    static isLeftSquareBracketSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 91;
    }
    /**
    ] : 93
    */
    static isRightSquareBracketSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 93;
    }
    /**
    , : 44
    */
    static isCommaSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 44;
    }
    /**
    _ : 95
    */
    static isUnderlineSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 95;
    }
    /**
    $ : 36
    */
    static isDollarSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 36;
    }
    /**
    . : 46
    */
    static isPointSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 46;
    }
    /**
    ! : 33
    */
    static isExclamationSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 33;
    }
    /**
    > : 62
    */
    static isGtSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 62;
    }
    /**
    < : 60
    */
    static isLtSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 60;
    }
    /**
    ; : 59
    */
    static isSemicolonSign(char) {
        return this.isChar(char) && char.charCodeAt(0) === 59;
    }
    /**
    \n : 10
    \r : 13
    */
    static isNewLine(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code === 10 || code === 13;
        })()
            ||
                char.length == 2 && char.charCodeAt(0) === 13 && char.charCodeAt(1) === 10;
    }
    /**
      : 32
    \t : 9
    */
    static isSpace(char) {
        return this.isChar(char) && (function () {
            const code = char.charCodeAt(0);
            return code === 32 || code === 9;
        })();
    }
    static isKeyword(id) {
        return this.keywords.includes(id);
    }
    static isNotKeyword(id) {
        return !this.keywords.includes(id);
    }
}
LexicalTool.keywords = [
    "native",
    "function",
    "takes",
    "returns",
    "return",
    "endfunction",
    "globals",
    "endglobals",
    "if",
    "then",
    "else",
    "elseif",
    "endif",
    "loop",
    "exitwhen",
    "endloop",
    "local",
    "constant",
    "array",
    "set",
    "call",
    "type",
    "extends",
    "true",
    "false",
    "null",
    "nothing",
    "integer",
    "real",
    "boolean",
    "string",
    "handle",
    "code",
    "and",
    "or",
    "not",
    "debug"
];
const parserData = new TokenParser(`real      bj_RADTODEG                      = 180.0/bj_PI
constant real      bj_DEGTORAD                      = bj_PI/180.0`);
console.log(parserData.tokens());
