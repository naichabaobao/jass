// 尝试性文件，目前并不参与项目中
import { isKeyword } from "../provider/keyword";
import {  Position, Range } from "./ast";
import { Tokenize, Tokenizer } from "./tokens";

class TokenDocument {
    private map: Map<number, Array<Tokenize>> = new Map();

    constructor(tokens: Tokenize[]) {
        tokens.forEach(token => {
            if (this.map.has(token.start.line)) {
                this.map.get(token.start.line)?.push(token);
            } else {
                this.map.set(token.start.line, [token]);
            }
        });
    }

    public lineAt(line: number): Tokenize[] | undefined {
        return this.map.get(line);
    }

    public forEach(handle: (tokens: Tokenize[]) => void) {
        this.map.forEach(handle);
    }

}

type TokenHandle = (currentToken: Tokenize, lineTokens: Tokenize[], isStart: boolean) => void;

function parseTextMacro(tokens: Tokenize[], textMacro: TextMacroStatement) {


    if (isId(tokens[0]) && tokens[0].value == "textmacro") {
        if (tokens[1] && isId(tokens[1])) {
            textMacro.name = new IDentifier(tokens[1].value).setRange(tokens[1]);
            if (tokens[2] && isId(tokens[2]) && tokens[2].value == "takes") {
                let state = 0;
                for (let index = 3; index < tokens.length; index++) {
                    const token = tokens[index];
                    if (state == 0) {
                        if (isId(token)) {
                            textMacro.takes.push(new IDentifier(token.value).setRange(token));
                            state = 1;
                        } else break;
                    } else if (state == 1) {
                        if (isOp(token) && token.value == ",") {
                            state = 0;
                        } else break;
                    }
                }
            }
        }
    }
}


abstract class TreeNode extends Range {

    public nodeType: string;
    public parent: TreeNode|null = null;

    constructor(type: string) {
        super();
        this.nodeType = type;
    }


}

abstract class Statement extends TreeNode {

    constructor(type: string) {
        super(type);
    }

}

abstract class ClosableStatement extends Statement {

    public isClose: boolean = false;

    constructor(type: string) {
        super(type);
    }

}

abstract class Expression extends TreeNode {

    constructor(type: string) {
        super(type);
    }

}

class IDentifier extends Expression {

    public name: string;

    constructor(name: string) {
        super("IDentifier");
        this.name = name;
    }

}



class TakeStatement extends Statement {
    public type: IDentifier | null = null;
    public name: IDentifier | null = null;

    constructor() {
        super("Take");
    }
}

class Block extends TreeNode {
    public children: TreeNode[] = [];

    constructor() {
        super("Block");
    }
}

enum DiagnosticSeverity {

    /**
     * Something not allowed by the rules of a language or other means.
     */
    Error = 0,

    /**
     * Something suspicious but allowed.
     */
    Warning = 1,

    /**
     * Something to inform about but not a problem.
     */
    Information = 2,

    /**
     * Something to hint to a better way of doing it, like proposing
     * a refactoring.
     */
    Hint = 3
}

class JassError extends Range {
    public readonly message: string;
    public readonly severity: DiagnosticSeverity;

    constructor(message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        super();
        this.message = message;
        this.severity = severity;
    }

}

class Root extends TreeNode {
    public block: Block = new Block();

    constructor() {
        super("Root");
    }

    private readonly errors: JassError[] = [];

    public pushError(range: Range, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        this.errors.push(new JassError(message, severity).from(range));
    }

    public getErrors() {
        return [...this.errors];
    }
};

class NativeStatement extends Statement {
    public modifiers: string[] = [];
    public name: IDentifier | null = null;
    public takes: TakeStatement[] = [];
    public returns: IDentifier | null = null;

    constructor() {
        super("NativeStatement");
    }

}

class FunctionStatement extends ClosableStatement implements NativeStatement {

    public modifiers: string[] = [];
    public name: IDentifier | null = null;
    public takes: TakeStatement[] = [];
    // 为ture时,就算有参数也无视
    public isNothing: boolean = false;
    public returns: IDentifier | null = null;
    public isNothingReturns: boolean = false;

    public body: Block = new Block();

    constructor() {
        super("FunctionStatement");
    }


}

class TextMacroStatement extends ClosableStatement {
    public name: IDentifier | null = null;
    public takes: IDentifier[] = [];
    public body: Tokenize[] = [];

    constructor() {
        super("TextMacroStatement");
    }

}

class StateParam {
    public isStart: boolean = false;

    public functionField: number = 0;
    public globalsField: number = 0;
    public libraryField: number = 0;
    public scopeField: number = 0;
    public novjassField: number = 0;
    public textMacroField: number = 0;
    public structField: number = 0;
    public methodField: number = 0;
    public interfaceField: number = 0;
    public moduleField: number = 0;
    public zincField: number = 0;
    public luaField: number = 0;
    public injectField: number = 0;
    public ifField: number = 0;
    public loopField: number = 0;
    public forField: number = 0;
    public publicField: number = 0;

    public privatePermissionModifier: number = 0;
    public publicPermissionModifier: number = 0;
    public staticModifier: number = 0;

    public inZincBlock: boolean = false;
    public inFunctionStart: boolean = false;
    public watiTakesKeyword: boolean = false;
    public watiReturnsKeyword: boolean = false;

    public inLibraryRange: boolean = false;
    public inLibraryLine: boolean = false;
    public inEndLibraryLine: boolean = false;
    public libraryState: number = 0;

    public inScopeRange: boolean = false;
    public inScopeLine: boolean = false;
    public inEndScopeLine: boolean = false;
    public scopeState: number = 0;

    public inFunctionRange: boolean = false;
    public inFunctionLine: boolean = false;
    public inEndFunctionLine: boolean = false;
    public functionState: number = 0;

    public inGlobalsRange: boolean = false;
    public inGlobalsLine: boolean = false;
    public inEndGlobalsLine: boolean = false;
    public globalsState: number = 0;

    public inStructRange: boolean = false;
    public inStructLine: boolean = false;
    public inEndStructLine: boolean = false;
    public structState: number = 0;

    public inTextMacroRange: boolean = false;
    public inTextMacroLine: boolean = false;
    public inEndTextMacroLine: boolean = false;
    public textMacroState: number = 0;
    public textMacro: TextMacroStatement | null = null;

    public inPrivate = false;
    public inPublic = false;
    public modifierToken: Tokenize | null = null;
    public inStatic = false;
    public staticToken: Tokenize | null = null;

}


function isId(token: Tokenize) {
    return token.type === "id";
}
function isOp(token: Tokenize) {
    return token.type === "op";
}
function isJassKeyword(token: Tokenize) {
    return isId(token) && isKeyword(token.value);
}
function isWhat(token: Tokenize, keywordString: string): boolean {
    return isId(token) && token.value == keywordString;
}
function isPrivate(token: Tokenize) {
    return isWhat(token, "private");
}
function isPublic(token: Tokenize) {
    return isWhat(token, "public");
}
function isStatic(token: Tokenize) {
    return isWhat(token, "static");
}
function isFunction(token: Tokenize) {
    return isWhat(token, "function");
}
function isTakes(token: Tokenize) {
    return isWhat(token, "takes");
}
function isReturns(token: Tokenize) {
    return isWhat(token, "returns");
}
function isEndFunction(token: Tokenize) {
    return isWhat(token, "endfunction");
}






class ParsedOption {
    isLineStart: boolean = false;

    isJ: boolean = true;
    isZinc: boolean = false;
    isAi: boolean = false;
    isFirstLine: boolean = false;
    isStart: boolean = false;

    inGlobals: boolean = false;

    inFunction: boolean = false;
    inFunctionLine: boolean = false;
    functionState: number = 0;
    func: FunctionStatement | null = null;

    inMethod: boolean = false;
    inMethodLine: boolean = false;
    methodState: number = 0;
    method: FunctionStatement | null = null;

    inStruct: boolean = false;
    inStructLine: boolean = false;
    structState: number = 0;
    struct: FunctionStatement | null = null;

    take: TakeStatement | null = null;

    inIf: boolean = false;
    inLoop: boolean = false;

    inZinc: boolean = false;
    inZincLine: boolean = false;
}

class ZincBlock extends TreeNode {
    public readonly block: Block = new Block();

    constructor() {
        super("ZincBlock");
    }
}

class Arg<S> {
    is: (token: Tokenize, state: S, isStart: boolean) => boolean;
    handle: (token: Tokenize, state: S, isStart: boolean) => void;

    constructor(is: (token: Tokenize, state: S, isStart: boolean) => boolean, handle: (token: Tokenize, state: S, isStart: boolean) => void) {
        this.is = is;
        this.handle = handle;
    }
}


function doparse(content: string, handle: (token: Tokenize, isStart: boolean) => void) {
    let preToken: Tokenize | null = null;
    Tokenizer.build(content, (token) => {
        handle(token, preToken === null || preToken.end.line !== token.start.line);
        preToken = token;
    });
}

function handleParse<S>(content: string, defaultState: S, preHandle: (token: Tokenize, state: S, isStart: boolean) => void, as: Arg<S>[]) {
    const state: S = defaultState;

    doparse(content, (token, isStart) => {
        preHandle(token, state, isStart);

        const handler = as.find((a) => a.is(token, state, isStart));

        if (handler) {
            handler.handle(token, state, isStart);
        }

    });
}

class UnaryExpression extends Expression {

    public op: Tokenize | null = null;
    public value: T | null = null;

    constructor() {
        super("UnaryExpression");
    }
}

class BinaryExpression extends Expression {

    public op: Tokenize | null = null;
    public left: T | null = null;
    public right: T | null = null;

    constructor() {
        super("BinaryExpression");
    }
}

class Call extends Expression {

    public name: IDentifier | null = null;
    public args: Term[] = [];

}

class Value extends Expression {

    public value: Tokenize | null = null;

    constructor() {
        super("Value");
    }
}

class Term extends Expression {

    public value: IDentifier | Call | Value | BinaryExpression | UnaryExpression | Term | null = null;

    constructor() {
        super("Term");
    }
}

type T = IDentifier | Call | Value | BinaryExpression | UnaryExpression;

class F_ {
    value: T;
    op: Tokenize;

    constructor(value: T, op: Tokenize) {
        this.value = value;
        this.op = op;
    }


}

class E_ {
    value: T;
    op: Tokenize;

    constructor(value: T, op: Tokenize) {
        this.value = value;
        this.op = op;
    }

}

class ParserExpr {

    constructor(tokens: Tokenize[]) {

        const stack: (T | F_ | E_ | Tokenize)[] = [];

        const push = (item: T | F_ | E_ | Tokenize) => {
            if (item instanceof Tokenize && item.type == "op" && (item.value == "+" || item.value == "-")) {

            }
        };

        for (let index = 0; index < tokens.length; index++) {
            const token = tokens[index];
            const next_token = tokens[index];
            const last: T | F_ | E_ | Tokenize | undefined = stack[stack.length - 1];

            if (stack.length == 0) {

            }
            if (token.type == "id") {
                if (last) {
                    if (last instanceof F_) {

                    }
                } else {
                    stack.push(new IDentifier(token.value).from(token));
                }
            } else if (token.type == "op") {

            }

        }

    }

}

class EPar {

    private tokens: Tokenize[];

    constructor(tokens: Tokenize[]) {
        this.tokens = tokens;
    }

    private top: T|null = null;
    private t: T|null = null;


    private firsts: Tokenize[] = [];
    private field:number = 0;
    private whole: boolean = false;

    private ues:T[] = [];

    parse() {

        for (let index = 0; index < this.tokens.length; index++) {
            const token = this.tokens[index];
            
            if (this.field > 0) {
                if (token.type == "op" && token.value == "(") {
                    this.field++;
                } else if (token.type == "op" && token.value == ")" && this.field > 0) {
                    this.field--;
                }
                if (this.field > 0) {
                    this.firsts.push(token);
                } else {
                    if (this.firsts.length > 0) {
                        const e = new EPar(this.firsts).parse().get();
                        if (e) {                            
                            if (this.t) {
                                if (this.t instanceof BinaryExpression) {
                                    if (this.t.right) {
                                        
                                    } else {
                                        this.t.right = e;
                                    }
                                } else if (this.t instanceof UnaryExpression) {
                                    this.t.value = e;
                                }
                            } else {
                                this.t = e;
                                this.top = e;

                                this.whole = true;
                            }
                        } else {
                            // error
                        }
                    }
                }
            } else if (token.type == "id") {
                if (token.value == "not") {
                    const ue = new UnaryExpression();
                    ue.op = token;

                    if (this.t) {
                        if (this.t instanceof BinaryExpression) {
                            if (this.t.right) {
                                if (this.t.right instanceof UnaryExpression) {
                                    this.t.right.value = ue;
                                }
                            } else {
                                this.t.right = ue;
                            }
                        }
                    } else {
                        this.top = ue;
                    }
                    this.t = ue;
                } else if (this.t) {
                    if (this.t instanceof BinaryExpression) {
                        if (this.t.right) {

                        } else {
                            this.t.right = new IDentifier(token.value).from(token);
                        }
                    }
                } else {
                    const id = new IDentifier(token.value).from(token);
    
                    this.t = id;
                    this.top = id;
                }
            } else if (token.type == "op") {
                if (this.t) {
                    if (token.value == "+" || token.value == "-") {
                        if (this.t instanceof IDentifier) {
                            const be = new BinaryExpression();
                            be.left = this.t;
                            be.op = token;

                            this.t = be;
                            this.top = be;
                        } else if (this.t instanceof BinaryExpression) {
                            const be = new BinaryExpression();
                            be.left = this.top;
                            be.op = token;

                            this.top = be;
                            this.t = be;
                        } else if (this.t instanceof UnaryExpression) {
                            const ue = new UnaryExpression();
                            ue.op = token;
        
                            this.t.value = ue;
                            this.t = ue;
                        }
                    }
                    else if (token.value == "*" || token.value == "/") {
                        if (this.t instanceof IDentifier) {
                            const be = new BinaryExpression();
                            be.left = this.t;
                            be.op = token;

                            this.t = be;
                            this.top = be;
                        } else if (this.t instanceof BinaryExpression) {
                            const be = new BinaryExpression();
                            if (this.whole) {
                                be.left = this.t;
                                be.op = token;

                                this.t = be;
                                this.top = be;

                                this.whole = false;
                            } else {
                                if (this.t.op?.value == "-" || this.t.op?.value == "+") {
                                    be.left = this.t.right;
                                    be.op = token;
    
                                    this.t.right = be;
    
                                    this.top = this.t;
                                    this.t = be;
                                } else if (this.t.op?.value == "*" || this.t.op?.value == "/") {
                                    be.left = this.t;
                                    be.op = token;
    
                                    this.t = be;
                                    this.top = be;
                                }
                            }

                        }
                    } else if (token.value == "(") {
                        if (this.t instanceof IDentifier) {

                        } else if (this.t instanceof BinaryExpression) {
                            if (this.t.right) {
                                if (this.t.right instanceof IDentifier) {
                                    // call
                                } else {
                                    // error
                                }
                            } else {
                                this.field++;
                            }
                        } else if (this.t instanceof UnaryExpression) {
                            this.field++;
                        }
                    }
                } else {
                    if (token.value == "+" || token.value == "-") {
                        const ue = new UnaryExpression();
                        ue.op = token;
                    } else if (token.value == "(") {
                        this.field++;
                    }
                }
            }
            
        }

        return this;
    }

    public get() {
        return this.top;
    }

}


if (true) {



    // const root = new Root();

    // handleParse<ParsedOption>(`
    // function   a/**//**//**//**//**/ takes string a ,  integer bb returns string
    // `,
    //     new ParsedOption(),
    //     (token, state, isStart) => {
    //         if (isStart) {
    //             state.inFunctionLine = false;
    //             console.log("reset");

    //         }
    //     },
    //     [
    //         new Arg((token, state, isStart) => {
    //             return isStart && token.type == "id" && token.value == "function";
    //         }, (token, state) => {
    //             if (state.inFunction) {
    //                 // 缺少endfunction
    //                 root.pushError(state.func!, "Missing 'endfunction'!");
    //             }
    //             if (state.inGlobals) {
    //                 root.pushError(state.func!, "Missing 'endglobals'!");
    //             }
    //             state.inFunction = true;
    //             state.inFunctionLine = true;
    //             state.functionState = 0;
    //             state.func = new FunctionStatement();
    //             state.func.from(token);
    //             root.block.children.push(state.func);
    //         }),
    //         new Arg((token, state, isStart) => {
    //             return state.inFunction && state.inFunctionLine;
    //         }, (token, state, isStart) => {
    //             // 0 func id
    //             // 1 takes
    //             // 2 take type
    //             // 3 take id
    //             // 4 take , or returns
    //             // 5 wait returns
    //             // 6 returns type
    //             // 7 function over
    //             if (token.type == "block_comment") {
    //                 console.log("hulie", token.value, state.functionState, isStart);

    //             } else if (state.functionState == 0) {
    //                 if (token.type == "id") {
    //                     if (isKeyword(token.value)) {
    //                         root.pushError(state.func!, "Naming cannot be a keyword!");
    //                     }
    //                     state.func!.name = new IDentifier(token.value).from(token);
    //                     state.func!.end = token.end;
    //                     state.functionState = 1;
    //                 } else {
    //                     root.pushError(token, "Unexpected token '" + token.value + "'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 1) {
    //                 console.log("hulie2", state.functionState);
    //                 if (token.type == "id" && token.value == "takes") {
    //                     state.functionState = 2;
    //                 } else {
    //                     root.pushError(token, "Expected token 'takes'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 2) { // take type
    //                 if (token.type == "id") {
    //                     if (token.value == "nothing") {
    //                         if (state.func!.isNothing) {
    //                             root.pushError(token, "Nothing is not a type");
    //                         }
    //                         state.func!.isNothing = true;
    //                         state.functionState = 5; // wait returns
    //                     } else {
    //                         if (isKeyword(token.value)) {
    //                             root.pushError(token, "Parameter type cannot be keyword");
    //                         }
    //                         state.take = new TakeStatement();
    //                         state.take.type = new IDentifier(token.value).from(token);
    //                         state.functionState = 3;
    //                         state.func!.takes.push(state.take);
    //                     }
    //                 } else {
    //                     root.pushError(token, "Unexpected token '" + token.value + "'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 3) { // take id
    //                 if (token.type == "id") {
    //                     if (isKeyword(token.value)) {
    //                         root.pushError(token, "Parameter id cannot be keyword");
    //                     }
    //                     state.take!.name = new IDentifier(token.value).from(token);
    //                     state.functionState = 4;
    //                 } else {
    //                     root.pushError(token, "Unexpected token '" + token.value + "'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 4) { // take ,
    //                 if (token.type == "id") {
    //                     if (token.value == "returns") {
    //                         state.functionState = 6; // returns type
    //                     } else {
    //                         root.pushError(token, "Expected token ',' or 'returns'!");
    //                         state.functionState = 7;
    //                     }
    //                 } else if (token.type == "op") {
    //                     if (token.value == ",") {
    //                         state.functionState = 2;
    //                     } else {
    //                         root.pushError(token, "Expected token ',' or 'returns'!");
    //                         state.functionState = 7;
    //                     }
    //                 } else {
    //                     root.pushError(token, "Expected token ',' or 'returns'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 5) {
    //                 if (token.type == "id") {
    //                     if (token.value == "returns") {
    //                         state.functionState = 6; // returns type
    //                     } else {
    //                         root.pushError(token, "Expected token 'returns'!");
    //                         state.functionState = 7;
    //                     }
    //                 } else {
    //                     root.pushError(token, "Expected token 'returns'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 6) {
    //                 if (token.type == "id") {
    //                     if (token.value == "nothing") {
    //                         state.func!.isNothingReturns = true;
    //                     } else if (isKeyword(token.value)) {
    //                         root.pushError(token, "Returns type cannot be keyword");
    //                     }
    //                     state.func!.returns = new IDentifier(token.value).from(token);
    //                     state.functionState = 7;
    //                 } else {
    //                     root.pushError(token, "Unexpected token '" + token.value + "'!");
    //                     state.functionState = 7;
    //                 }
    //             } else if (state.functionState == 7) {
    //                 root.pushError(token, "Unexpected token '" + token.value + "'!");
    //             }
    //             console.log("sort", state.functionState);
    //         }),
    //     ]);

    // console.log(JSON.stringify(root.block.children, null, 2));

    const tokens = Tokenizer.get(`123`);
    console.log(tokens);
    
    // const t = new EPar(tokens).parse().get();
    // console.log(JSON.stringify(t, null, 4));
    

}
