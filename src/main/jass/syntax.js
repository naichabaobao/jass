"use strict";
/*
語法解析
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var token_1 = require("./token");
var Statement = /** @class */ (function () {
    function Statement() {
        this.range = Range.default();
    }
    return Statement;
}());
var Position = /** @class */ (function () {
    function Position(line, position) {
        this.line = line;
        this.position = position;
    }
    return Position;
}());
var Range = /** @class */ (function () {
    function Range(start_line, start_position, end_line, end_position) {
        this.start_line = start_line;
        this.start_position = start_position;
        this.end_line = end_line;
        this.end_position = end_position;
    }
    Range.from = function (startPostion, endPosition) {
        return new Range(startPostion.line, startPostion.position, endPosition.line, endPosition.position);
    };
    Object.defineProperty(Range.prototype, "start", {
        get: function () {
            return new Position(this.start_line, this.start_position);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "end", {
        get: function () {
            return new Position(this.end_line, this.end_position);
        },
        enumerable: true,
        configurable: true
    });
    Range.prototype.withRange = function (range) {
        Object.assign(this, range);
        return this;
    };
    Range.prototype.withPosition = function (startPosition, endPosition) {
        Object.assign(this, Range.from(startPosition, endPosition));
        return this;
    };
    Range.prototype.with = function (start_line, start_position, end_line, end_position) {
        Object.assign(this, new Range(start_line, start_position, end_line, end_position));
        return this;
    };
    Range.default = function () {
        return new Range(0, 0, 0, 0);
    };
    return Range;
}());
var Comment = /** @class */ (function () {
    function Comment(comment) {
        this.range = Range.default();
        this.origin = comment;
    }
    Object.defineProperty(Comment.prototype, "content", {
        get: function () {
            var _a, _b, _c;
            return (_c = (_b = (_a = /\/\/\s*(?<content>.+)\s*/.exec(this.origin)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "";
        },
        enumerable: true,
        configurable: true
    });
    return Comment;
}());
var Type = /** @class */ (function () {
    function Type(name, extend) {
        this.range = Range.default();
        this.extend = Type.handleType;
        this.name = name;
        if (extend)
            this.extend = extend;
    }
    Type.prototype.parent = function () {
        return this.extend;
    };
    Type.prototype.childrens = function () {
        var _this = this;
        return Type.types().filter(function (value) { return value.extend.name == _this.name; });
    };
    Type.builder = function (name, extend) {
        var _this = this;
        var _a;
        return (_a = this._types.get(name)) !== null && _a !== void 0 ? _a : (function () {
            var type = new Type(name, extend);
            _this._types.set(name, type);
            return type;
        })();
    };
    Type.get = function (name) {
        return this._types.get(name);
    };
    Type.types = function () {
        var e_1, _a;
        var types = new Array();
        try {
            for (var _b = __values(this._types.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var value = _c.value;
                types.push(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return types;
    };
    Type.baseTypes = ["boolean", "integer", "real", "string", "code", "handle"];
    Type.booleanType = new Type(Type.baseTypes[0]);
    Type.integerType = new Type(Type.baseTypes[1]);
    Type.realType = new Type(Type.baseTypes[2]);
    Type.stringType = new Type(Type.baseTypes[3]);
    Type.codeType = new Type(Type.baseTypes[4]);
    Type.handleType = new Type(Type.baseTypes[5]);
    Type._types = new Map([
        ["boolean", Type.booleanType],
        ["integer", Type.integerType],
        ["real", Type.realType],
        ["string", Type.stringType],
        // 對象樹中允許local code name的寫法，後面通過預編譯禁止；
        ["code", Type.codeType],
        ["handle", Type.handleType]
    ]);
    Type.isBaseType = function (name) {
        return Type.baseTypes.includes(name);
    };
    return Type;
}());
var Global = /** @class */ (function () {
    function Global(type, name, flag) {
        if (flag === void 0) { flag = null; }
        this.range = Range.default();
        this.type = type;
        this.name = name;
        this.flag = flag;
    }
    return Global;
}());
var Globals = /** @class */ (function (_super) {
    __extends(Globals, _super);
    function Globals() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.range = Range.default();
        return _this;
    }
    return Globals;
}(Array));
var Nothing = /** @class */ (function () {
    function Nothing() {
        this.range = Range.default();
    }
    return Nothing;
}());
var Take = /** @class */ (function () {
    function Take(type, name) {
        this.range = Range.default();
        this.type = type;
        this.name = name;
    }
    return Take;
}());
var Takes = /** @class */ (function (_super) {
    __extends(Takes, _super);
    function Takes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.range = Range.default();
        return _this;
    }
    return Takes;
}(Array));
var _FunctionConstrut = /** @class */ (function () {
    function _FunctionConstrut(name, takes, returns) {
        this.range = Range.default();
        this.name = name;
        this.takes = takes;
        this.returns = returns;
    }
    return _FunctionConstrut;
}());
var Native = /** @class */ (function (_super) {
    __extends(Native, _super);
    function Native(name, takes, returns, flag) {
        var _this = _super.call(this, name, takes, returns) || this;
        _this.flag = null;
        if (flag)
            _this.flag = flag;
        return _this;
    }
    return Native;
}(_FunctionConstrut));
/*
1
+1
+1 - 1
*/
var Expression = /** @class */ (function () {
    function Expression() {
        this.range = Range.default();
    }
    return Expression;
}());
var Value = /** @class */ (function () {
    function Value() {
    }
    return Value;
}());
//op value | op id | op
var Block = /** @class */ (function () {
    function Block() {
        this.range = Range.default();
    }
    return Block;
}());
var ConditionValue = /** @class */ (function () {
    function ConditionValue() {
        this.range = Range.default();
    }
    return ConditionValue;
}());
/**
 * 0-9
 */
var IntegerValue = /** @class */ (function () {
    function IntegerValue(value) {
        this.range = Range.default();
        this.value = value;
    }
    IntegerValue.prototype.integerValue = function () {
        return parseInt(this.value);
    };
    return IntegerValue;
}());
/**
 * '0000'
 */
var IntegerCodeValue = /** @class */ (function () {
    function IntegerCodeValue(value) {
        this.range = Range.default();
        this.value = value;
    }
    IntegerCodeValue.prototype.codeValue = function () {
        return this.value.replace(/'/g, '');
    };
    IntegerCodeValue.prototype.integerValue = function () {
        var valueString16 = '0x' + this.codeValue().replace(/[\da-zA-Z]/g, function (subString) {
            return subString.charCodeAt(0).toString(16);
        });
        return parseInt(valueString16);
    };
    return IntegerCodeValue;
}());
/**
 * $16161616
 */
var Integer$16Value = /** @class */ (function () {
    function Integer$16Value(value) {
        this.range = Range.default();
        this.value = value;
    }
    Integer$16Value.prototype.integerValue = function () {
        return parseInt(this.value.replace("\$", '0x'));
    };
    return Integer$16Value;
}());
/**
 * 0x16161616
 */
var Integer0X16Value = /** @class */ (function () {
    function Integer0X16Value(value) {
        this.range = Range.default();
        this.value = value;
    }
    Integer0X16Value.prototype.integerValue = function () {
        return parseInt(this.value);
    };
    return Integer0X16Value;
}());
/**
 * 088
 */
var IntegerOctalValue = /** @class */ (function () {
    function IntegerOctalValue(value) {
        this.range = Range.default();
        this.value = value;
    }
    IntegerOctalValue.prototype.integerValue = function () {
        return parseInt(this.value);
    };
    return IntegerOctalValue;
}());
var StringValue = /** @class */ (function () {
    function StringValue() {
        this.range = Range.default();
    }
    return StringValue;
}());
var RealValue = /** @class */ (function () {
    function RealValue(value) {
        this.range = Range.default();
        this.value = value;
    }
    /**
     * 把.0或者0.缺省的浮點數修復成0.0
     */
    RealValue.prototype.repair = function () {
        if (this.value.startsWith(".")) {
            return "0" + this.value;
        }
        else if (this.value.endsWith(".")) {
            return this.value + "0";
        }
        else {
            return this.value;
        }
    };
    RealValue.prototype.realValue = function () {
        return parseFloat(this.repair());
    };
    return RealValue;
}());
/**
 * 整形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1)
 */
var IntegerOperationPriorityExpression = /** @class */ (function () {
    function IntegerOperationPriorityExpression(value) {
        this.range = Range.default();
        this.value = value;
    }
    return IntegerOperationPriorityExpression;
}());
/**
 * 整形加法表達式
 */
var IntegerAddOperationExpression = /** @class */ (function () {
    function IntegerAddOperationExpression(left, right) {
        this.range = Range.default();
        this.left = left;
        this.right = right;
    }
    return IntegerAddOperationExpression;
}());
/**
 * 浮點形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1) (1 + .1)
 */
var RealOperationPriorityExpression = /** @class */ (function () {
    function RealOperationPriorityExpression(value) {
        this.range = Range.default();
        this.value = value;
    }
    return RealOperationPriorityExpression;
}());
/**
 * 浮點形加法表達式
 */
var RealAddOperationExpression = /** @class */ (function () {
    function RealAddOperationExpression(left, right) {
        this.range = Range.default();
        this.left = left;
        this.right = right;
    }
    return RealAddOperationExpression;
}());
/**
 * 整形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1) (1 + .1)
 */
var StringOperationPriorityExpression = /** @class */ (function () {
    function StringOperationPriorityExpression(value) {
        this.range = Range.default();
        this.value = value;
    }
    return StringOperationPriorityExpression;
}());
/**
 * 整形加法表達式
 */
var StringAddOperationExpression = /** @class */ (function () {
    function StringAddOperationExpression(left, right) {
        this.range = Range.default();
        this.left = left;
        this.right = right;
    }
    return StringAddOperationExpression;
}());
var CallExpression = /** @class */ (function () {
    function CallExpression() {
        this.range = Range.default();
    }
    return CallExpression;
}());
var Local = /** @class */ (function () {
    function Local(type, name) {
        this.flag = "local";
        this.range = Range.default();
        this.type = type;
        this.name = name;
    }
    return Local;
}());
var SetStatement = /** @class */ (function (_super) {
    __extends(SetStatement, _super);
    function SetStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SetStatement;
}(Statement));
var Function = /** @class */ (function (_super) {
    __extends(Function, _super);
    function Function(name, takes, returns) {
        var _this = _super.call(this) || this;
        _this.range = Range.default();
        _this.name = name;
        _this.takes = takes;
        _this.returns = returns;
        return _this;
    }
    return Function;
}(Array));
var Jass = /** @class */ (function (_super) {
    __extends(Jass, _super);
    function Jass(fileName) {
        var _this = _super.call(this) || this;
        _this._fileName = "";
        _this.error_tokens = [];
        _this.clear = function () {
            _this.length = 0;
        };
        if (fileName)
            _this._fileName = fileName;
        return _this;
    }
    Object.defineProperty(Jass.prototype, "fileName", {
        get: function () {
            return this._fileName;
        },
        set: function (fileName) {
            this._fileName = fileName;
        },
        enumerable: true,
        configurable: true
    });
    return Jass;
}(Array));
var SyntexEnum;
(function (SyntexEnum) {
    SyntexEnum["default"] = "default";
    SyntexEnum["other"] = "other";
    SyntexEnum["type"] = "type";
    SyntexEnum["typeNaming"] = "typeNaming";
})(SyntexEnum || (SyntexEnum = {}));
var SyntexType;
(function (SyntexType) {
    SyntexType["nothing"] = "nothing";
    SyntexType["comment"] = "comment";
    SyntexType["type"] = "type";
    SyntexType["native"] = "native";
    SyntexType["globals"] = "globals";
    SyntexType["func"] = "function";
})(SyntexType || (SyntexType = {}));
var SyntexParser = /** @class */ (function () {
    function SyntexParser(content) {
        this._need_type = false;
        this._need_native = false;
        this._need_globals = true;
        this._need_function = true;
        this.tree = new Jass();
        this._change = true;
        this._content = content;
        var tokenData = new token_1.TokenParser(this._content);
        tokenData;
        this._tokenData = tokenData;
    }
    SyntexParser.prototype.ast = function () {
        var _this = this;
        if (this._change) {
            var keyword_1 = "keyword";
            var operation = "operation";
            var identifier_1 = "identifier";
            var value = "value";
            var other_1 = "other";
            var comment = "comment";
            var index_1 = 0;
            var type_1 = SyntexEnum.default;
            var getToken_1 = function () {
                return _this.tokens[index_1++];
            };
            var toOther_1 = function () {
                type_1 = SyntexEnum.other;
                eat_1(getToken_1());
            };
            // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
            var eat_type_1 = function (token, nextToken) {
                if (nextToken === void 0) { nextToken = _this.tokens[index_1 + 1]; }
                // type = SyntexEnum.type;
                if (token.type == identifier_1) {
                    var name_1 = token.value;
                    var extendToken = getToken_1();
                    if (extendToken.type == keyword_1 && extendToken.value == "extends") {
                        var extendTypeToken = getToken_1();
                        if (extendTypeToken.type == identifier_1) {
                            var extendType = extendTypeToken.value;
                            Type.builder(name_1, Type.get(extendType));
                            type_1 = SyntexEnum.default;
                            eat_1(getToken_1());
                        }
                        else {
                            toOther_1();
                        }
                    }
                    else {
                        toOther_1();
                    }
                }
                else {
                    toOther_1();
                }
            };
            var eat_1 = function (token, nextToken) {
                if (nextToken === void 0) { nextToken = _this.tokens[index_1 + 1]; }
                switch (type_1) {
                    case SyntexEnum.default:
                        if (token.type == keyword_1) {
                            if (token.value == "type") {
                                type_1 = SyntexEnum.type;
                                eat_type_1(getToken_1());
                            }
                            else if (token.value == "globals") {
                                type_1 = SyntexEnum.type;
                                eat_type_1(getToken_1());
                            }
                        }
                        break;
                }
                if (token.type == other_1) {
                }
            };
            eat_1(getToken_1());
        }
    };
    // Identifier expected. 'if' is a reserved word that cannot be used here
    SyntexParser.prototype.ast1 = function () {
        var _this = this;
        // console.log(this.tokens)
        if (this._change) {
            this.tree.clear();
            var index_2 = 0;
            var getToken_2 = function () {
                return _this.tokens[index_2++];
            };
            var withs_1 = function (token, any) {
                any.range.with(token.line, token.position, token.line, token.end_position);
            };
            var nothing_1 = function () {
                var token = getToken_2();
                var type = function () {
                    console.log("進入type");
                    if (token) {
                        var tokenName = getToken_2();
                        console.log(tokenName);
                        if (tokenName && tokenName.type == "identifier") {
                            var name_2 = tokenName.value;
                            var tokenExtends = getToken_2();
                            console.log(tokenExtends);
                            if (tokenExtends && tokenExtends.type == "keyword" && tokenExtends.value == "extends") {
                                var tokenExtendsTypeToken = getToken_2();
                                console.log(tokenExtendsTypeToken);
                                if (tokenExtendsTypeToken && (tokenExtendsTypeToken.type == "identifier" || (tokenExtendsTypeToken.type == "keyword" && Type.isBaseType(tokenExtendsTypeToken.value)))) {
                                    var extend = tokenExtendsTypeToken.value;
                                    var type_2 = Type.builder(name_2, Type.get(extend));
                                    console.log(type_2);
                                    type_2.range.with(token.line, token.position, tokenExtendsTypeToken.line, tokenExtendsTypeToken.end_position);
                                    _this.tree.push(type_2);
                                }
                            }
                        }
                        nothing_1();
                    }
                };
                var native = function (flag) {
                    if (token) {
                        var nameToken = getToken_2();
                        if (nameToken && nameToken.type == "identifier") {
                            var name_3 = nameToken.value;
                            var takesToken = getToken_2();
                            if (takesToken && takesToken.type == "keyword" && takesToken.value == "takes") {
                                var nothingTakes_1 = new Nothing;
                                var takes_1 = new Takes;
                                var isNothing_1 = true;
                                var take_1 = function () {
                                    var typeToken = getToken_2();
                                    if (typeToken && (typeToken.type == "identifier" || (typeToken.type == "keyword" && Type.isBaseType(typeToken.value)))) {
                                        if (isNothing_1) {
                                            isNothing_1 = false;
                                        }
                                        var type_3 = typeToken.value;
                                        var takeNameToken = getToken_2();
                                        if (takeNameToken && takeNameToken.type == "identifier") {
                                            var name_4 = takeNameToken.value;
                                            var takeType = Type.get(type_3);
                                            console.log(takeType);
                                            if (takeType) {
                                                var t = new Take(takeType, name_4);
                                                t.range.with(typeToken.line, typeToken.position, takeNameToken.line, takeNameToken.end_position);
                                                takes_1.push(t);
                                                var splitToken = getToken_2();
                                                if (splitToken && splitToken.type == "operation" && splitToken.value == ",") {
                                                    take_1();
                                                }
                                            }
                                        }
                                    }
                                    else if (isNothing_1 && typeToken && typeToken.type == "keyword" && typeToken.value == "nothing") {
                                        nothingTakes_1 = new Nothing();
                                        takes_1.range.with(typeToken.line, typeToken.position, typeToken.line, typeToken.end_position);
                                    }
                                };
                                take_1();
                                var returnsType_1 = new Nothing;
                                var returnsTypeToken_1;
                                var returns = function () {
                                    var returnsToken = getToken_2();
                                    if (returnsToken && returnsToken.type == "keyword" && returnsToken.value == "returns") {
                                        returnsTypeToken_1 = getToken_2();
                                        if (returnsTypeToken_1 && (returnsTypeToken_1.type == "identifier" || (returnsTypeToken_1.type == "keyword" && Type.isBaseType(returnsTypeToken_1.value)))) {
                                            var type_4 = returnsTypeToken_1.value;
                                            var returnType = Type.get(type_4);
                                            if (returnType) {
                                                returnsType_1 = returnType;
                                            }
                                        }
                                        else if (returnsTypeToken_1 && returnsTypeToken_1.type == "keyword" && returnsTypeToken_1.value == "nothing") {
                                            returnsType_1 = new Nothing();
                                        }
                                    }
                                };
                                returns();
                                var func = new Native(name_3, isNothing_1 ? nothingTakes_1 : takes_1, returnsType_1, flag);
                                if (returnsTypeToken_1) {
                                    func.range.with(token.line, token.position, returnsTypeToken_1.line, returnsTypeToken_1.end_position);
                                }
                                else {
                                    func.range.with(token.line, token.position, token.line, token.position);
                                }
                                _this.tree.push(func);
                            }
                        }
                        nothing_1();
                    }
                };
                var constantNative = function () {
                    var constantToken = getToken_2();
                    if (constantToken && constantToken.type == "keyword" && constantToken.value == "native") {
                        native("constant");
                    }
                    else {
                        nothing_1();
                    }
                };
                if (token) {
                    if (token.type == "comment") {
                        var comment = new Comment(token.value);
                        withs_1(token, comment);
                        _this.tree.push(comment);
                    }
                    else if (token.type == "keyword") {
                        if (token.value == "type") {
                            type();
                        }
                        else if (token.value == "native") {
                            native();
                        }
                        else if (token.value == "constant") {
                            constantNative();
                        }
                        else if (token.value == "globals") {
                        }
                        else if (token.value == "function") {
                        }
                        else {
                            nothing_1();
                        }
                    }
                    else {
                        nothing_1();
                    }
                }
            };
            nothing_1();
            this._change = false;
        }
        return this.tree;
    };
    SyntexParser.prototype._set_change = function () {
        this._change = true;
    };
    Object.defineProperty(SyntexParser.prototype, "needType", {
        get: function () {
            return this._need_type;
        },
        set: function (needType) {
            if (this._need_type != needType) {
                this._set_change();
                this._need_type = needType;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyntexParser.prototype, "needGlobals", {
        get: function () {
            return this._need_globals;
        },
        set: function (needGlobals) {
            if (this._need_globals != needGlobals) {
                this._set_change();
                this._need_globals = needGlobals;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyntexParser.prototype, "needNative", {
        get: function () {
            return this._need_native;
        },
        set: function (needNative) {
            if (this._need_native != needNative) {
                this._set_change();
                this._need_native = needNative;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyntexParser.prototype, "needFunction", {
        get: function () {
            return this._need_function;
        },
        set: function (needFunction) {
            if (this._need_function != needFunction) {
                this._set_change();
                this._need_function = needFunction;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SyntexParser.prototype, "tokens", {
        get: function () {
            return this._tokenData.tokens();
        },
        enumerable: true,
        configurable: true
    });
    return SyntexParser;
}());
var sp = new SyntexParser("\ntype aaa extends handle\n\nnative woccao takes string a66, aaa wozuonima returns nothing\nconstant native woccao1 takes string nothing returns laji\n\n");
var jass = sp.ast1();
console.log("=========================================================");
console.log(jass.filter(function (j) { return j instanceof Native; }).map(function (j) {
    if (j instanceof Native) {
        return j.takes;
    }
    return [];
}));
