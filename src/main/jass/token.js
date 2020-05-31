"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(type, value, location) {
        var _a, _b;
        this._type = type;
        this._value = value;
        this._line = (_a = location === null || location === void 0 ? void 0 : location.line) !== null && _a !== void 0 ? _a : -1;
        this._position = (_b = location === null || location === void 0 ? void 0 : location.position) !== null && _b !== void 0 ? _b : -1;
    }
    Object.defineProperty(Token.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "line", {
        get: function () {
            return this._line;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "position", {
        get: function () {
            return this._position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Token.prototype, "end_position", {
        get: function () {
            return this._position + this.value.length;
        },
        enumerable: true,
        configurable: true
    });
    return Token;
}());
exports.Token = Token;
var LexicalType;
(function (LexicalType) {
    LexicalType["default"] = "default";
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
exports.LexicalType = LexicalType;
var TokenParser = /** @class */ (function () {
    function TokenParser(content) {
        this.supportJass = true;
        this.support_vjass = false;
        this.support_zinc = false;
        this.support_lua = false;
        /// 配置是否改变
        this._changed = true;
        this._tokens = new Array();
        this._content = content;
    }
    Object.defineProperty(TokenParser.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    TokenParser.prototype.tokens = function () {
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
                    var tokens_1 = new Array();
                    var index_1 = 0;
                    var content_1 = this._content;
                    var getChar = function () {
                        return content_1[index_1++];
                    };
                    var value_1 = "";
                    var type_1 = LexicalType.default;
                    var line_1 = 0;
                    var position_1 = 0;
                    var char = void 0;
                    var _loop_1 = function () {
                        value_1 += char;
                        /// 开始只能是字母，//,\n,\s
                        var clear = function () {
                            value_1 = "";
                        };
                        /// 添加token
                        var pushToken = function (tokenType) {
                            tokens_1.push(new Token(tokenType, value_1, {
                                line: line_1,
                                position: position_1
                            }));
                            clear();
                            type_1 = LexicalType.default;
                        };
                        var pushKeywordToken = function () {
                            pushToken("keyword");
                        };
                        var pushOperationToken = function () {
                            pushToken("operation");
                        };
                        var pushIdentifierToken = function () {
                            pushToken("identifier");
                        };
                        var pushValueToken = function () {
                            pushToken("value");
                        };
                        var pushCommentToken = function () {
                            pushToken("comment");
                        };
                        var pushOtherToken = function () {
                            pushToken("other");
                        };
                        switch (type_1) {
                            case LexicalType.default:
                                if (LexicalTool.isColonSign(char)) {
                                    // " 左冒号
                                    type_1 = LexicalType.string;
                                }
                                else if (LexicalTool.isDivisionSign(char)) {
                                    // /
                                    type_1 = LexicalType.div;
                                }
                                else if (LexicalTool.isSingleQuotesSign(char)) {
                                    // ' 左单引号号
                                    type_1 = LexicalType.code;
                                }
                                else if (LexicalTool.isLetter(char)) {
                                    type_1 = LexicalType.id;
                                }
                                else if (LexicalTool.isNumber0(char)) {
                                    // 0 小数或者十六进制或者八进制
                                    type_1 = LexicalType.zero;
                                }
                                else if (LexicalTool.isDollarSign(char)) {
                                    // $ 十六进制
                                    type_1 = LexicalType.dollar;
                                }
                                else if (LexicalTool.isPointSign(char)) {
                                    // .
                                    type_1 = LexicalType.point;
                                }
                                else if (LexicalTool.isNumber(char)) {
                                    // 1-9
                                    type_1 = LexicalType.number;
                                }
                                else if (LexicalTool.isDivisionSign(char)) {
                                    // /
                                    type_1 = LexicalType.div;
                                }
                                else if (LexicalTool.isExclamationSign(char)) {
                                    // !
                                    type_1 = LexicalType.exclamation;
                                }
                                else if (LexicalTool.isGtSign(char)) {
                                    // >
                                    type_1 = LexicalType.gt;
                                }
                                else if (LexicalTool.isLtSign(char)) {
                                    // <
                                    type_1 = LexicalType.it;
                                }
                                else if (LexicalTool.isEqualSign(char)) {
                                    // =
                                    type_1 = LexicalType.eq;
                                }
                                else if (LexicalTool.isEqualSign(char)) {
                                    // =
                                    type_1 = LexicalType.eq;
                                }
                                else if (LexicalTool.isLeftBracketSign(char)
                                    || LexicalTool.isRightBracketSign(char)
                                    || LexicalTool.isLeftSquareBracketSign(char)
                                    || LexicalTool.isRightSquareBracketSign(char)
                                    || LexicalTool.isCommaSign(char)
                                    || LexicalTool.isPlusSign(char)
                                    || LexicalTool.isSubtractionSign(char)
                                    || LexicalTool.isProductSign(char)
                                    || LexicalTool.isNewLine(char)) {
                                    // () {} [] ,
                                    type_1 = LexicalType.op;
                                }
                                else if (LexicalTool.isSpace(char)) {
                                    clear();
                                }
                                else {
                                    type_1 = LexicalType.other;
                                }
                                break;
                            case LexicalType.zero:
                                if (LexicalTool.isPointSign(char)) { // 小数
                                    type_1 = LexicalType.decimals;
                                }
                                else if (LexicalTool.isLetterX(char)) { // 十六进制
                                    type_1 = LexicalType.hex;
                                }
                                else if (LexicalTool.isNumber0_7(char)) { // 八进制
                                    type_1 = LexicalType.octal;
                                }
                                break;
                            case LexicalType.dollar:
                                if (LexicalTool.isHexNumber(char)) {
                                    type_1 = LexicalType.hex;
                                }
                                break;
                            case LexicalType.string:
                                // 为"并且前面不是\（转移）
                                if (LexicalTool.isColonSign(char) && !value_1.endsWith("\\")) {
                                    type_1 = LexicalType.close_string;
                                }
                                break;
                            case LexicalType.code:
                                if (LexicalTool.isSingleQuotesSign(char)) {
                                    type_1 = LexicalType.close_code;
                                }
                                else if (!(LexicalTool.isLetter(char) || LexicalTool.isNumber(char))) {
                                    type_1 = LexicalType.close_code;
                                }
                                break;
                            case LexicalType.point:
                                if (LexicalTool.isNumber(char)) {
                                    type_1 = LexicalType.decimals;
                                }
                                break;
                            case LexicalType.number:
                                if (LexicalTool.isPointSign(char)) {
                                    type_1 = LexicalType.decimals;
                                }
                                break;
                            case LexicalType.div:
                                if (LexicalTool.isDivisionSign(char)) {
                                    type_1 = LexicalType.comment;
                                }
                                break;
                            case LexicalType.exclamation:
                                if (LexicalTool.isEqualSign(char)) {
                                    type_1 = LexicalType.op;
                                }
                                break;
                            case LexicalType.gt:
                                if (LexicalTool.isEqualSign(char)) {
                                    type_1 = LexicalType.op;
                                }
                                break;
                            case LexicalType.it:
                                if (LexicalTool.isEqualSign(char)) {
                                    type_1 = LexicalType.op;
                                }
                                break;
                            case LexicalType.eq:
                                if (LexicalTool.isEqualSign(char)) {
                                    type_1 = LexicalType.op;
                                }
                                break;
                        }
                        /// 判断下个字符是否终结
                        var over = function () {
                            var nextChar = content_1.charAt(index_1);
                            switch (type_1) {
                                case LexicalType.default:
                                    break;
                                case LexicalType.id:
                                    if (!(LexicalTool.isLetter(nextChar) || LexicalTool.isNumber(nextChar) || LexicalTool.isUnderlineSign(nextChar))) {
                                        if (LexicalTool.isKeyword(value_1)) { // keyword
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
                            line_1++;
                            position_1 = 0;
                        }
                        else {
                            position_1++;
                        }
                    };
                    while (char = getChar()) {
                        _loop_1();
                    }
                    this._tokens = tokens_1;
                    this._changed = false;
                }
            }
            return this._tokens;
        }
        return [];
    };
    /// 设置已改变状态
    TokenParser.prototype._change = function () {
        this._changed = true;
    };
    Object.defineProperty(TokenParser.prototype, "supportVjass", {
        get: function () {
            return this.support_vjass;
        },
        set: function (isSupportVjass) {
            if (this.support_vjass !== isSupportVjass) {
                this._change();
                this.support_vjass = isSupportVjass;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenParser.prototype, "supportZinc", {
        get: function () {
            return this.support_zinc;
        },
        set: function (isSupportZinc) {
            if (this.support_zinc !== isSupportZinc) {
                this._change();
                this.support_zinc = isSupportZinc;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenParser.prototype, "supportLua", {
        get: function () {
            return this.support_lua;
        },
        set: function (isSupportLua) {
            if (this.support_lua !== isSupportLua) {
                this._change();
                this.support_lua = isSupportLua;
            }
        },
        enumerable: true,
        configurable: true
    });
    return TokenParser;
}());
exports.TokenParser = TokenParser;
var LexicalTool = /** @class */ (function () {
    function LexicalTool() {
    }
    LexicalTool.isChar = function (char) {
        return char.length === 1;
    };
    ;
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    LexicalTool.isLetter = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code >= 65 && code <= 90 || code >= 97 && code <= 122;
        })();
    };
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    LexicalTool.isLowerLetter = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code >= 97 && code <= 122;
        })();
    };
    /**
    A~Z ：65~90
    a~z ：97~122
    */
    LexicalTool.isUpperLetter = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code >= 65 && code <= 90;
        })();
    };
    /**
    X ：88
    x ：120
    */
    LexicalTool.isLetterX = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code === 88 || code === 120;
        })();
    };
    /**
    0～9 : 48～57
    */
    LexicalTool.isNumber = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code >= 48 && code <= 57;
        })();
    };
    /**
    0～9 : 48～57
    a～f : 97～102
    A～F : 65～70
    */
    LexicalTool.isHexNumber = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);
        })();
    };
    /**
    0～7 : 48～55
    */
    LexicalTool.isNumber0_7 = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code >= 48 && code <= 55;
        })();
    };
    /**
    0 : 48
    */
    LexicalTool.isNumber0 = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 48;
    };
    /**
    / : 47
    */
    LexicalTool.isLeftForwardSlash = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 47;
    };
    /**
    \ : 92
    */
    LexicalTool.isRightForwardSlash = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 92;
    };
    /**
    = : 61
    */
    LexicalTool.isEqualSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 61;
    };
    /**
    + : 43
    */
    LexicalTool.isPlusSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 43;
    };
    /**
    \- : 45
    */
    LexicalTool.isSubtractionSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 45;
    };
    /**
    \* : 42
    */
    LexicalTool.isProductSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 42;
    };
    /**
    / : 47
    */
    LexicalTool.isDivisionSign = function (char) {
        return this.isChar(char) && this.isLeftForwardSlash(char);
    };
    /**
    " : 34
    */
    LexicalTool.isColonSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 34;
    };
    /**
    ' : 39
    */
    LexicalTool.isSingleQuotesSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 39;
    };
    /**
    ( : 40
    */
    LexicalTool.isLeftBracketSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 40;
    };
    /**
    ) : 41
    */
    LexicalTool.isRightBracketSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 41;
    };
    /**
    { : 123
    */
    LexicalTool.isLeftBraceSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 123;
    };
    /**
    } : 125
    */
    LexicalTool.isRightBraceSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 125;
    };
    /**
    [ : 91
    */
    LexicalTool.isLeftSquareBracketSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 91;
    };
    /**
    ] : 93
    */
    LexicalTool.isRightSquareBracketSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 93;
    };
    /**
    , : 44
    */
    LexicalTool.isCommaSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 44;
    };
    /**
    _ : 95
    */
    LexicalTool.isUnderlineSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 95;
    };
    /**
    $ : 36
    */
    LexicalTool.isDollarSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 36;
    };
    /**
    . : 46
    */
    LexicalTool.isPointSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 46;
    };
    /**
    ! : 33
    */
    LexicalTool.isExclamationSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 33;
    };
    /**
    > : 62
    */
    LexicalTool.isGtSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 62;
    };
    /**
    < : 60
    */
    LexicalTool.isLtSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 60;
    };
    /**
    ; : 59
    */
    LexicalTool.isSemicolonSign = function (char) {
        return this.isChar(char) && char.charCodeAt(0) === 59;
    };
    /**
    \n : 10
    \r : 13
    */
    LexicalTool.isNewLine = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code === 10 || code === 13;
        })()
            ||
                char.length == 2 && char.charCodeAt(0) === 13 && char.charCodeAt(1) === 10;
    };
    /**
      : 32
    \t : 9
    */
    LexicalTool.isSpace = function (char) {
        return this.isChar(char) && (function () {
            var code = char.charCodeAt(0);
            return code === 32 || code === 9;
        })();
    };
    LexicalTool.isKeyword = function (id) {
        return this.keywords.includes(id);
    };
    LexicalTool.isNotKeyword = function (id) {
        return !this.keywords.includes(id);
    };
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
    return LexicalTool;
}());
exports.LexicalTool = LexicalTool;
