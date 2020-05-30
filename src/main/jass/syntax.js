/*
語法解析
*/
import { TokenParser } from './token';
class Position {
    constructor(line, position) {
        this.line = line;
        this.position = position;
    }
}
class Range {
    constructor(start_line, start_position, end_line, end_position) {
        this.start_line = start_line;
        this.start_position = start_position;
        this.end_line = end_line;
        this.end_position = end_position;
    }
    static from(startPostion, endPosition) {
        return new Range(startPostion.line, startPostion.position, endPosition.line, endPosition.position);
    }
    get start() {
        return new Position(this.start_line, this.start_position);
    }
    get end() {
        return new Position(this.end_line, this.end_position);
    }
    with(range) {
        Object.assign(this, range);
    }
}
class Comment {
    constructor(comment) {
        this.range = null;
        this.origin = comment;
    }
    get content() {
        var _a, _b, _c;
        return (_c = (_b = (_a = /\/\/\s*(?<content>.+)\s*/.exec(this.origin)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "";
    }
}
class Type {
    constructor(name, extend) {
        this.extend = this;
        this.name = name;
        if (extend)
            this.extend = extend;
    }
    parent() {
        return this.extend;
    }
    childrens() {
        return Type.types().filter(value => value.extend.name == this.name);
    }
    static builder(name, extend) {
        var _a;
        return (_a = this._types.get(name)) !== null && _a !== void 0 ? _a : (() => {
            const type = new Type(name, extend);
            this._types.set(name, type);
            return type;
        })();
    }
    static get(name) {
        return this._types.get(name);
    }
    static types() {
        const types = new Array();
        for (const value of this._types.values()) {
            types.push(value);
        }
        return types;
    }
}
Type._types = new Map([
    ["boolean", new Type("boolean")],
    ["integer", new Type("integer")],
    ["real", new Type("real")],
    ["string", new Type("string")],
    ["code", new Type("code")],
    ["handle", new Type("handle")],
]);
class Global {
    constructor(type, name, flag = null) {
        this.type = type;
        this.name = name;
        this.flag = flag;
    }
}
class Globals extends Array {
}
class Jass extends Array {
    constructor(fileName) {
        super();
        this._fileName = "";
        this.error_tokens = [];
        if (fileName)
            this._fileName = fileName;
    }
    clear() {
        this.length = 0;
        return;
        while (this.length != 0) {
            this.pop();
        }
    }
    get fileName() {
        return this._fileName;
    }
    set fileName(fileName) {
        this._fileName = fileName;
    }
}
var SyntexEnum;
(function (SyntexEnum) {
    SyntexEnum["default"] = "default";
    SyntexEnum["other"] = "other";
    SyntexEnum["type"] = "type";
    SyntexEnum["typeNaming"] = "typeNaming";
})(SyntexEnum || (SyntexEnum = {}));
var Block;
(function (Block) {
    Block["nothing"] = "nothing";
    Block["comment"] = "comment";
    Block["type"] = "type";
    Block["native"] = "native";
    Block["globals"] = "globals";
    Block["func"] = "function";
})(Block || (Block = {}));
class SyntexParser {
    constructor(content) {
        this._need_type = false;
        this._need_native = false;
        this._need_globals = true;
        this._need_function = true;
        this.tree = new Jass();
        this._change = true;
        this._content = content;
        const tokenData = new TokenParser(this._content);
        tokenData;
        this._tokenData = tokenData;
    }
    ast() {
        if (this._change) {
            const keyword = "keyword";
            const operation = "operation";
            const identifier = "identifier";
            const value = "value";
            const other = "other";
            const comment = "comment";
            let index = 0;
            let type = SyntexEnum.default;
            const getToken = () => {
                return this.tokens[index++];
            };
            const toOther = function () {
                type = SyntexEnum.other;
                eat(getToken());
            };
            // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
            const eat_type = (token, nextToken = this.tokens[index + 1]) => {
                // type = SyntexEnum.type;
                if (token.type == identifier) {
                    const name = token.value;
                    const extendToken = getToken();
                    if (extendToken.type == keyword && extendToken.value == "extends") {
                        const extendTypeToken = getToken();
                        if (extendTypeToken.type == identifier) {
                            const extendType = extendTypeToken.value;
                            Type.builder(name, Type.get(extendType));
                            type = SyntexEnum.default;
                            eat(getToken());
                        }
                        else {
                            toOther();
                        }
                    }
                    else {
                        toOther();
                    }
                }
                else {
                    toOther();
                }
            };
            const eat = (token, nextToken = this.tokens[index + 1]) => {
                switch (type) {
                    case SyntexEnum.default:
                        if (token.type == keyword) {
                            if (token.value == "type") {
                                type = SyntexEnum.type;
                                eat_type(getToken());
                            }
                            else if (token.value == "globals") {
                                type = SyntexEnum.type;
                                eat_type(getToken());
                            }
                        }
                        break;
                }
                if (token.type == other) {
                }
            };
            eat(getToken());
        }
    }
    // Identifier expected. 'if' is a reserved word that cannot be used here
    ast1() {
        if (this._change) {
            this.tree.clear();
            let block = Block.nothing;
            for (let index = 0; index < this.tokens.length; index++) {
                const token = this.tokens[index];
                const nextToken = this.tokens[index + 1];
                // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
                switch (block) {
                    case Block.comment.toString():
                        if (token.type == "operation" && token.value == "\n") {
                            block = Block.nothing;
                        }
                        break;
                    case Block.type.toString():
                        break;
                    case Block.native.toString():
                        break;
                    case Block.globals.toString():
                        break;
                    case Block.func.toString():
                        break;
                    default:
                        if (token.type == "comment") {
                            block = Block.comment;
                            this.tree.push(new Comment(token.value));
                        }
                        else if (token.type == "operation") {
                            if (token.value == "\n") {
                                block = Block.nothing;
                            }
                            else {
                            }
                        }
                }
            }
            this._change = false;
        }
        return this.tree;
    }
    _set_change() {
        this._change = true;
    }
    get needType() {
        return this._need_type;
    }
    get needGlobals() {
        return this._need_globals;
    }
    get needNative() {
        return this._need_native;
    }
    get needFunction() {
        return this._need_function;
    }
    set needType(needType) {
        if (this._need_type != needType) {
            this._set_change();
            this._need_type = needType;
        }
    }
    set needGlobals(needGlobals) {
        if (this._need_globals != needGlobals) {
            this._set_change();
            this._need_globals = needGlobals;
        }
    }
    set needNative(needNative) {
        if (this._need_native != needNative) {
            this._set_change();
            this._need_native = needNative;
        }
    }
    set needFunction(needFunction) {
        if (this._need_function != needFunction) {
            this._set_change();
            this._need_function = needFunction;
        }
    }
    get tokens() {
        return this._tokenData.tokens();
    }
}
