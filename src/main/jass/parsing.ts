/**
 * 将tokens转换为AST(具体语法树)
 * 
 */

import { Token } from "./tokens";
import { Location } from "./range";

interface Loc {
    loc:Location|null;
}

class NativeDeclarator implements Loc{
    public id:string|null = null;
    public takes:Take[] = [];
    public returns:string|null = null;
    public loc: Location|null = null;
}

class FunctionDeclarator implements Loc{
    public id:string|null = null;
    public takes:Take[] = [];
    public returns:string|null = null;
    public loc: Location|null = null;

    /**
     * function block中的tokens
     */
    public bodyTokens:Token[] = [];
}

class Take extends Location{
    public type:string|null = null;
    public id:string = "";
    public loc: Location|null = null;
}

class Globals implements Loc{
    public globals:GlobalDeclarator[] = [];
    public loc: Location|null = null;
}

type FlagType = "constant" | "array";

type VariableFlagType = "local";

class GlobalDeclarator implements Loc {
    public flags:Set<FlagType> = new Set();
    public type:string|null = null;
    public id:string = "";
    // 如果flags含有constant,则需要定义value值
    public value:null = null;
    public loc: Location|null = null;
}

class LocalDeclarator implements Loc {
    public flags:Set<VariableFlagType> = new Set();
    public type:string|null = null;
    public id:string = "";
    public value:null = null;
    public loc: Location|null = null;
}

class Comment implements Loc {
    public content:string = "";
    public loc: Location|null = null;
}

class Progam {
    public body:Array<FunctionDeclarator|Globals|NativeDeclarator> = [];
    public comments:Comment[] = [];
}

/**
 * 无视所有块注释
 * 帮单行注释保存在comments中
 * 把vjass和zinc语法映射到jass中
 * 遇到其他非jass语法支持的,统统无视
 * @param tokens 
 */
function parsing(tokens:Token[]):Progam {
    const progam = new Progam();
    start(tokens, progam);
    return progam;
}

function start(tokens:Token[],progam:Progam) {
    // 去除注释
    tokens = removeComment(tokens, progam);

    for (let index = 0; index < tokens.length;) {
        const token = tokens[index];

        if (token.type === "id" && token.value === "native") {
            index = parseNative(tokens, index, progam, new NativeDeclarator);
            index++;
        } else if (token.type === "id" && token.value === "function") {
            parseFunction(tokens, index, progam, new FunctionDeclarator);
            index++;
        } else if (token.type === "id" && token.value === "globals") {
            parseGlobals(tokens, index, progam, new Globals);
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
function removeComment(tokens:Token[],progam:Progam) {
    const ts:Token[] = [];
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

type Func = (pos:number) => void;

function parseNative(tokens:Token[],pos:number, progam:Progam, native:NativeDeclarator):number {
    if (tokens[pos].type === "id" && tokens[pos].value === "native") {
        pos++;
        progam.body.push(native);
        if (tokens[pos].type === "id") {
            native.id = tokens[pos].value;
            pos++;
            if (tokens[pos].type === "id" && tokens[pos].value === "takes") {
                pos = parseTakes(tokens, pos + 1, native);
                if (tokens[pos].type === "id" && tokens[pos].value === "returns") {
                    pos++;
                    if (tokens[pos].type === "id") {
                        native.returns = tokens[pos].value;
                    }
                }
            }
        }
    }
    return pos;
}

function parseTakes(tokens:Token[], pos:number, f:FunctionDeclarator|NativeDeclarator):number {
    let take:Take|null = null;
    let state = 0;
    for (let index = pos; index < tokens.length; index++) {
        const token = tokens[index];
        if (state === 0) {
            if (token.type === "id") {
                take = new Take();
                f.takes.push(take);
                take.type = token.value;
                state = 1;
            } else {
              return index;  
            }
        } else if (state === 1) {
            if (token.type === "id") {
                if (take == null) {
                    return index;
                }
                take.id = token.value;
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

function parseFunction(tokens:Token[],pos:number, progam:Progam, func:FunctionDeclarator) {
    if (tokens[pos].type === "id" && tokens[pos].value === "function") {
        pos++;
        progam.body.push(func);
        if (tokens[pos].type === "id") {
            func.id = tokens[pos].value;
            pos++;
            if (tokens[pos].type === "id" && tokens[pos].value === "takes") {
                pos = parseTakes(tokens, pos + 1, func);
                if (tokens[pos].type === "id" && tokens[pos].value === "returns") {
                    pos++;
                    if (tokens[pos].type === "id") {
                        func.returns = tokens[pos].value;
                        pos = collectFunctionBody(tokens, pos + 1, func);
                        pos++;
                    }
                }
            }
        }
    }
    return pos;
}

function collectFunctionBody(tokens:Token[],pos:number, func:FunctionDeclarator) {
    let token:Token = null as any;
    while (token = tokens[pos]) {
        if (token.type === "id" && token.value === "endfunction") {
            break;
        }
        func.bodyTokens.push(token);
        pos++;
    }
    return pos;
}

function parseGlobals(tokens:Token[],pos:number, progam:Progam, globals:Globals) {
    if (tokens[pos].type === "id" && tokens[pos].value === "native") {

    }
}

export {
    parsing,
};