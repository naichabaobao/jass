/**
 * 将tokens转换为AST(具体语法树)
 * 2020年8月8日13:25:55 支持zinc function -> jass function
 */

import { Token, tokenize } from "./tokens";
import { Location } from "./range";

interface Loc {
    loc: Location | null;
}

interface Origin {
    origin(): string;
}

class NativeDeclarator implements Loc, Origin {
    public id: string | null = null;
    public takes: Take[] = [];
    public returns: string | null = null;
    public loc: Location | null = null;

    public origin() {
        return `native ${this.id} takes ${this.takes.length > 0 ? this.takes.map(x => x.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}`;
    }

    /**
     * 获取参数数量
     */
    public getTakeCount() {
        return this.takes.length;
    }
}

class FunctionDeclarator implements Loc, Origin {
    public id: string | null = null;
    public takes: Take[] = [];
    public returns: string | null = null;
    public loc: Location | null = null;

    public body:Array<LocalDeclarator|CallDeclarator> = [];

    public locals() {
        return <LocalDeclarator[]>this.body.filter(x => x instanceof LocalDeclarator);
    }

    public calls() {
        return <CallDeclarator[]>this.body.filter(x => x instanceof CallDeclarator);
    }

    /**
     * function block中的tokens
     */
    public bodyTokens: Token[] = [];
    public origin() {
        return `function ${this.id} takes ${this.takes.length > 0 ? this.takes.map(x => x.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}`;
    }

    /**
     * 获取参数数量
     */
    public getTakeCount() {
        return this.takes.length;
    }
}

class Take implements Loc, Origin {
    public type: string | null = null;
    public id: string = "";
    public loc: Location | null = null;

    public origin() {
        return `${this.type} ${this.id}`;
    }
}

// call 关键字调用方法
class CallDeclarator implements Loc, Origin {
    public id: string = "";
    public params: any[] = [];
    public loc: Location = new Location();
    public origin() {
        return `call ${this.id}(${this.params.map((x, index) => "take_" + 1).join(", ")})`;
    }

    /**
     * 获取参数数量
     */
    public getTakeCount() {
        return this.params.length;
    }
}

function parseCallDeclarator(tokens:Token[], pos:number, caller:CallDeclarator) {
    let field = 0;
    let paramIndex = 0;
    if (tokens[pos] && tokens[pos].isId()) {
        caller.id = tokens[pos].value;
        pos++;
        if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
            pos++;
            for (; pos < tokens.length; pos++) {
                const token = tokens[pos];
                if (field === 0) {
                    if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
                        field++;
                    } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ")") {
                        caller.loc.endLine = tokens[pos].loc?.endLine ?? null;
                        caller.loc.endPosition = tokens[pos].loc?.endPosition ?? null;
                        break;
                    } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ",") {
                        paramIndex++;
                    }
                    if (!caller.params[paramIndex]) {
                        caller.params[paramIndex] = [];
                    }
                    caller.params[paramIndex].push(token);
                } else if(field > 0) {
                    if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
                        field++;
                    } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ")") {
                        field--;
                        // continue;
                    }
                    if (!caller.params[paramIndex]) {
                        caller.params[paramIndex] = [];
                    }
                    caller.params[paramIndex].push(token);
                }
            }
            caller.loc.endLine = tokens[pos - 1].loc?.endLine ?? null;
            caller.loc.endPosition = tokens[pos - 1].loc?.endPosition ?? null;
        }
    }
    return pos;
}

class Globals implements Loc {
    public globals: GlobalDeclarator[] = [];
    // public globalsTokens: Token[] = [];
    public loc: Location | null = null;
}

type FlagType = "constant" | "array";

type VariableFlagType = "local";

class GlobalDeclarator implements Loc, Origin {
    public flags: Set<FlagType> = new Set();
    public type: string | null = null;
    public id: string | null = null;
    // 如果flags含有constant,则需要定义value值
    public value: null = null;
    public loc: Location | null = null;

    public isArray() {
        return this.flags.has("array");
    }

    public isConstant() {
        return this.flags.has("constant");
    }

    public origin () {
        return `${this.isConstant() ? "constant " : ""}${this.type} ${this.isArray() ? "array " : ""}${this.id}`;
    }
}

class LocalDeclarator implements Loc, Origin {
    public flags: Set<VariableFlagType> = new Set();
    public type: string | null = null;
    public id: string|null = null;
    public value: null = null;
    public loc: Location | null = null;

    public origin() {
        return `local ${this.type} ${this.id}`;
    }
}

class Comment implements Loc {
    public content: string = "";
    public loc: Location | null = null;

    public parseConten() {
        return this.content.replace(/^\/\/\s*/, "");
    }
}

class Program {
    public fileName:string|null = null;
    public body: Array<FunctionDeclarator | Globals | NativeDeclarator> = [];
    public comments: Comment[] = [];

    public functions() {
        return <(FunctionDeclarator | NativeDeclarator)[]>this.body.filter(s => s instanceof FunctionDeclarator || s instanceof NativeDeclarator);
    }

    public globals() {
        const globals = <Globals[]>this.body.filter(s => s instanceof Globals);
        return globals.map(s => s.globals).flat();
    }

    public functionDeclarators() {
        return <FunctionDeclarator[]>this.body.filter(s => s instanceof FunctionDeclarator);
    }

    public description(node:FunctionDeclarator|NativeDeclarator|GlobalDeclarator|LocalDeclarator) {
        return this.comments.find(x => node.loc && Number.isInteger(node.loc.startLine) && x.loc && Number.isInteger(x.loc.startLine) && (<number>node.loc.startLine - 1) == x.loc.startLine)?.parseConten() ?? "";
    }
}

/**
 * 无视所有块注释
 * 帮单行注释保存在comments中
 * 把vjass和zinc语法映射到jass中
 * 遇到其他非jass语法支持的,统统无视
 * @param tokens 
 * @description 如果你对token不熟悉,建议使用parse
 */
function parsing(tokens: Token[]): Program {
    const progam = new Program();
    start(tokens, progam);
    return progam;
}

function start(tokens: Token[], progam: Program) {
    // 去除注释
    tokens = removeComment(tokens, progam);

    for (let index = 0; index < tokens.length;) {
        const token = tokens[index];

        if (token.type === "id" && token.value === "native") {
            index = parseNative(tokens, index, progam, new NativeDeclarator);
            index++;
        } else if (token.type === "id" && token.value === "function") {
            index = parseFunction(tokens, index, progam, new FunctionDeclarator);
            index++;
        } else if (token.type === "id" && token.value === "globals") {
            parseGlobals(tokens, index, progam, new Globals);
            // globals识别存在问题,因而暂时不对globals支持
            index++;
        } else {
            // 如果遇到无法识别的token时，直接无视掉
            index++;
        }
    }
}

/**
 * 去除tokens中所有的注释，包括单行和多行
 * @param tokens 
 * @param progam 
 */
function removeComment(tokens: Token[], progam: Program) {
    const ts: Token[] = [];
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.type === "block_comment") {
            continue;
        } else if (token.type === "comment") {
            // 获取单行注释并保存在progam
            const comment = new Comment();
            comment.content = token.value;
            comment.loc = token.loc;
            progam.comments.push(comment);
        } else {
            ts.push(token);
        }
    }
    return ts;
}

function parseNative(tokens: Token[], pos: number, progam: Program, native: NativeDeclarator): number {
    if (tokens[pos].type === "id" && tokens[pos].value === "native") {
        native.loc = new Location();
        native.loc.startLine = tokens[pos].loc?.startLine ?? 0;
        native.loc.startPosition = tokens[pos].loc?.startPosition ?? 0;
        pos++;
        progam.body.push(native);
        if (tokens[pos].type === "id") {
            native.id = tokens[pos].value;
            pos++;
            if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "takes") {
                pos++;
                if (tokens[pos].isId() && tokens[pos].value === "nothing") {
                }else {
                    pos = parseTakes(tokens, pos, native);
                }
                if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "returns") {
                    pos++;
                    if (tokens[pos].type === "id") {
                        native.returns = tokens[pos].value;
                        (<Location>native.loc).endLine = tokens[pos].loc?.endLine ?? 0;
                        (<Location>native.loc).endPosition = tokens[pos].loc?.endPosition ?? 0;
                    }
                }
            }
        }
    }
    return pos;
}

function parseTakes(tokens: Token[], pos: number, f: FunctionDeclarator | NativeDeclarator): number {
    let take: Take | null = null;
    let state = 0;
    for (let index = pos; index < tokens.length; index++) {
        const token = tokens[index];
        if (state === 0) {
            if (token.isId()) {
                take = new Take();
                take.loc = new Location();
                take.loc.startLine = token.loc?.startLine ?? null;
                take.loc.startPosition = token.loc?.startPosition ?? null;
                f.takes.push(take);
                take.type = token.value;
                state = 1;
            } else {
                return index;
            }
        } else if (state === 1) {
            if (token.isId()) {
                if (take == null) {
                    return index;
                }
                take.id = token.value;
                if (take.loc) {
                    take.loc.endLine = token.loc?.endLine ?? null;
                    take.loc.endPosition = token.loc?.endPosition ?? null;
                }
                state = 2;
            } else {
                return index;
            }
        } else if (state === 2) {
            if (token.type === "op" && token.value === ",") {
                state = 0;
            } else {
                return index;
            }
        }
    }
    return pos;
}

interface FunctionOption {
    supportZinc?: boolean;
}

function parseFunction(tokens: Token[], pos: number, progam: Program, func: FunctionDeclarator, option?: FunctionOption) {

    option = {
        supportZinc: true
    };
    if (tokens[pos].type === "id" && tokens[pos].value === "function") {
        const loc = new Location();
        loc.startLine = tokens[pos].loc?.startLine ?? null;
        loc.startPosition = tokens[pos].loc?.startPosition ?? null;
        pos++;
        func.loc = loc;
        progam.body.push(func);
        if (tokens[pos].type === "id") {
            func.id = tokens[pos].value;
            pos++;
            if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "takes") {
                pos++;
                if (tokens[pos].isId() && tokens[pos].value === "nothing") {
                    pos++;
                }else {
                    pos = parseTakes(tokens, pos, func);
                }
                if (tokens[pos].type === "id" && tokens[pos].value === "returns") {
                    pos++;
                    if (tokens[pos] && tokens[pos].isId() && tokens[pos].value === "nothing") {
                        const outs:Token[] = [];
                        pos = collectFunctionBody(tokens, pos + 1, outs);

                        parseFunctionBody(outs, func);
                        loc.endLine = tokens[pos].loc?.endLine ?? null;
                        loc.endPosition = tokens[pos].loc?.endPosition ?? null;
                    }
                    else if (tokens[pos].isId()) {
                        func.returns = tokens[pos].value;
                        const outs:Token[] = [];
                        pos = collectFunctionBody(tokens, pos + 1, outs);

                        parseFunctionBody(outs, func);
                        loc.endLine = tokens[pos].loc?.endLine ?? null;
                        loc.endPosition = tokens[pos].loc?.endPosition ?? null;
                    }
                }
            }
            // zinc function parse
            else if (option?.supportZinc && tokens[pos] && tokens[pos].type === "op" && tokens[pos].value === "(") { // zinc takes
                pos = parseTakes(tokens, pos + 1, func);
                if (tokens[pos].type === "op" && tokens[pos].value === ")") {
                    pos++;
                    if (tokens[pos].type === "op" && tokens[pos].value === "->") {
                        pos++;
                        if (tokens[pos].type === "id") {
                            func.returns = tokens[pos].value;
                            pos++;
                            if (tokens[pos].type === "op" && tokens[pos].value === "{") {
                                pos = collectZincFunctionBody(tokens, pos + 1, func);
                                loc.endLine = tokens[pos].loc?.endLine ?? null;
                                loc.endPosition = tokens[pos].loc?.endPosition ?? null;
                            }
                        }
                    } else if (tokens[pos].type === "op" && tokens[pos].value === "{") {
                        pos = collectZincFunctionBody(tokens, pos + 1, func);
                        loc.endLine = tokens[pos].loc?.endLine ?? null;
                        loc.endPosition = tokens[pos].loc?.endPosition ?? null;
                    }
                }
            }
        }
    }
    return pos;
}

// 非标准实现方式,目前可以运行
function parseFunctionBody (tokens: Token[], func:FunctionDeclarator) {
    let col:Map<number, Token[]> = new Map();
    tokens.forEach((item, index, ts) => {
        const key = item.loc?.startLine ?? -1;
        if (key !== -1) {
            if (col.has(key)) {
                col.get(key)?.push(item);
            }else {  
                const arr = new Array<Token>();
                arr.push(item);
                col.set(key, arr);
            }
        }
    });
    let local:LocalDeclarator|null = null;
    col.forEach(values => {
        if (values[0].isId() && values[0].value === "local") {
            local = new LocalDeclarator();
            local.loc = new Location();
            local.loc.startLine = values[0].loc?.startLine ?? null;
            local.loc.startPosition = values[0].loc?.startPosition ?? null;
            func.body.push(local);
            if (values[1] && values[1].isId()) {
                local.type = values[1].value;
                if (values[2] && values[2].isId()) {
                    local.id = values[2].value;
                    local.loc.endLine = values[2].loc?.endLine ?? null;
                    local.loc.endPosition = values[2].loc?.endPosition ?? null;
                }
            }
        }else if (values[0].isId() && values[0].value === "call") {

            const caller = new CallDeclarator();
            caller.loc.startLine = values[0].loc?.startLine ?? null;
            caller.loc.startPosition = values[0].loc?.startPosition ?? null;
            func.body.push(caller);
            parseCallDeclarator(values, 1, caller);

        }
        local = null;
    });
}

function collectFunctionBody(tokens: Token[], pos: number, outs: Token[]) {
    let token: Token = null as any;
    while (token = tokens[pos]) {
        if (token.type === "id" && token.value === "endfunction") {
            break;
        }
        outs.push(token);
        pos++;
    }
    return pos;
}

function collectZincFunctionBody(tokens: Token[], pos: number, func: FunctionDeclarator) {
    let token: Token = null as any;
    let field: number = 0;
    while (token = tokens[pos]) {
        if (field === 0 && token.type === "op" && token.value === "}") {
            break;
        } else if (token.type === "op" && token.value === "{") {
            field++;
        } else if (token.type === "op" && token.value === "}") {
            field--;
        }
        func.bodyTokens.push(token);
        pos++;
    }

    return pos;
}

function parseGlobals(tokens: Token[], pos: number, progam: Program, globals: Globals) {
    if (tokens[pos].type === "id" && tokens[pos].value === "globals") {
        progam.body.push(globals);
        pos++;
        let token: Token|null = null;
        // 记录行是否改变了
        const globalsTokens:Token[] = [];
        
        while (token = tokens[pos]) {
            if (!token) {
                break;
            } else if (token.isId() && token.value === "endglobals") {
                break;
            } else {
                globalsTokens.push(token);
            }
            pos++;
        }
        // 将globals tokens数组 转为以行为key的map;
        let col:Map<number, Token[]> = new Map();
        globalsTokens.forEach((item, index, ts) => {
            const key = item.loc?.startLine ?? -1;
            if (key !== -1) {
                if (col.has(key)) {
                    col.get(key)?.push(item);
                } else {
                    
                    const arr = new Array<Token>();
                    arr.push(item);
                    col.set(key, arr);
                }
            }
        });
        
        
        let global:GlobalDeclarator|null = null;
        col.forEach(values => {
            // const values:Token[] = <Token[]>col.get(<number><unknown>key);
            const type_id_parse = function (index:number) {
                const type_id_parse2 = function (index:number) {
                    if (values[index].isId()) {
                        if (!global) {
                            global = new GlobalDeclarator();
                        }
                        globals.globals.push(global);
                        if (!global.loc) {
                            global.loc = new Location();
                            global.loc.startLine = values[index].loc?.startLine ?? 0;
                            global.loc.startPosition = values[index].loc?.startPosition ?? 0;
                        }
                        global.type = values[index].value;
                        if (values[index + 1] && values[index + 1].isId() && values[index + 1].value === "array") {
                            global.flags.add("array");
                            if (values[index + 2] && values[index + 2].isId()) {
                                global.id = values[index + 2].value;
                                global.loc.endLine = values[index + 2].loc?.endLine ?? 0;
                                global.loc.endPosition = values[index + 2].loc?.endPosition ?? 0;
                            }
                        } else if (values[index + 1] && values[index + 1].isId()) {
                            global.id = values[index + 1].value;
                            global.loc.endLine = values[index + 1].loc?.endLine ?? 0;
                            global.loc.endPosition = values[index + 1].loc?.endPosition ?? 0;
                        }
                    }
                }
                if (values[0].isId() && (values[0].value === "private" || values[0].value === "public")) {
                    type_id_parse2(index + 1);
                } else {
                    type_id_parse2(index);
                }
            }
            if (values[0].isId() && values[0].value === "constant") {
                global = new GlobalDeclarator();
                global.flags.add("constant")
                globals.globals.push(global);
                type_id_parse(1);
            } else {
                type_id_parse(0);
            }
            global = null;
        });
    }
    return pos;
}

function parse(content: string) {
    const tokens = tokenize(content);
    return parsing(tokens);
}

export {
    parsing,
    parse,
    FunctionDeclarator,
    NativeDeclarator,
    LocalDeclarator,
    Globals,
    GlobalDeclarator,
    Program
};