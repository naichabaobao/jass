import { isKeyword } from "../provider/keyword";
import { Position, Range } from "./ast";
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

    public lineAt(line: number) :Tokenize[]|undefined {
        return this.map.get(line);
    }

    public forEach(handle: (tokens: Tokenize[]) => void) {
        this.map.forEach(handle);
    }

}

type TokenHandle = (currentToken: Tokenize, lineTokens: Tokenize[], isStart:boolean) => void;

function parseTextMacro(tokens: Tokenize[], textMacro: TextMacroStatement) {
    console.log(tokens);
    
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

class Evaluator {
    private toTokenDocument(tokens: Tokenize[]) {
        return new TokenDocument(tokens);
    }

    private parseTextMacroLine(lineToken: Tokenize, textMacro: TextMacroStatement) {
        if (lineToken.type === "comment" && lineToken.value.startsWith("//!")) {
            const subText = lineToken.value.replace(/^\/\/!/, "   ");
            console.log(subText);
            
            parseTextMacro(Tokenizer.get(subText), textMacro);
        }
    }

    private parseTextMacro(tokens: Tokenize[]) {
        let inTextMacroRange = false;
        let textMacro:TextMacroStatement|null = null;
        const textMacroStatements:TextMacroStatement[] = [];
        const nonTextMacroTokens:Tokenize[] = [];
        this.lineForEach(tokens, (token, ts, isStart) => {
            if (isStart && /^\/\/!\s+textmacro\b/.test(token.value)) {
                if (inTextMacroRange) {
                    this.error(new ParseError("textmacro", "Duplicate definition textmacro").setRange(token));
                } else {
                    inTextMacroRange = true;
                }
                textMacro = new TextMacroStatement().setRange(token);
                this.parseTextMacroLine(token, textMacro);
                textMacroStatements.push(textMacro);
            } else if (isStart && /^\/\/!\s+endtextmacro\b/.test(token.value)) {
                if (inTextMacroRange) {
                    inTextMacroRange = false;
                    if (textMacro) {
                        textMacro.isClose = true;
                        textMacro.end = token.end;
                    }
                } else {
                    this.error(new ParseError("textmacro", "Duplicate definition endtextmacro").setRange(token));
                }
            } else if (inTextMacroRange) {
                textMacro?.body.push(token);
            } else {
                nonTextMacroTokens.push(token);
            }
        });
        console.log(textMacro)
    }

    private lineForEach(tokens: Tokenize[], handle: TokenHandle) {
        const tokenDocument = this.toTokenDocument(tokens);

        tokenDocument.forEach((ts) => {
            ts.forEach((t, index) => {
                const isStart = index == 0;
                handle(t, ts, isStart);
            });
        });

    }

    private error(error: ParseError) {

    }

    public parsing(tokens: Tokenize[], handle: TokenHandle) {
        this.parseTextMacro(tokens);
        return ;
        const tokenDocument = this.toTokenDocument(tokens);

        tokenDocument.forEach((ts) => {
            ts.forEach((t, index) => {
                const isStart = index == 0;
                handle(t, ts, isStart);
            });
        });

    }
}

class TreeNode extends Range {

    public nodeType: String;

    constructor(type:string) {
        super();
        this.nodeType = type;
    }

}

abstract class Statement extends TreeNode {

    constructor(type:string) {
        super(type);
    }

}

abstract class ClosableStatement extends Statement {

    public isClose: boolean = false;

    constructor(type:string) {
        super(type);
    }

}

abstract class Expression extends TreeNode {

    constructor(type:string) {
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
    public type: IDentifier|null = null;
    public name: IDentifier|null = null;

    constructor() {
        super("Take");
    }
}

class Block extends TreeNode {
    public children: TreeNode[] = [];

    constructor () {
        super("Block");
    }
}

class NativeStatement extends Statement {
    public modifiers: string[] = [];
    public name: IDentifier|null = null;
    public takes: TakeStatement[] = [];
    public returns: IDentifier|null = null;

    constructor() {
        super("NativeStatement");
    }

}

class FunctionStatement extends ClosableStatement implements NativeStatement {

    public modifiers: string[] = [];
    public name: IDentifier|null = null;
    public takes: TakeStatement[] = [];
    public returns: IDentifier|null = null;

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

    public inZincBlock:boolean = false;
    public inFunctionStart: boolean = false;
    public watiTakesKeyword: boolean = false;
    public watiReturnsKeyword: boolean = false;

    public inLibraryRange:boolean = false;
    public inLibraryLine:boolean = false;
    public inEndLibraryLine:boolean = false;
    public libraryState:number = 0;

    public inScopeRange:boolean = false;
    public inScopeLine:boolean = false;
    public inEndScopeLine:boolean = false;
    public scopeState:number = 0;

    public inFunctionRange:boolean = false;
    public inFunctionLine:boolean = false;
    public inEndFunctionLine:boolean = false;
    public functionState:number = 0;

    public inGlobalsRange:boolean = false;
    public inGlobalsLine:boolean = false;
    public inEndGlobalsLine:boolean = false;
    public globalsState:number = 0;

    public inStructRange:boolean = false;
    public inStructLine:boolean = false;
    public inEndStructLine:boolean = false;
    public structState:number = 0;

    public inTextMacroRange:boolean = false;
    public inTextMacroLine:boolean = false;
    public inEndTextMacroLine:boolean = false;
    public textMacroState:number = 0;
    public textMacro:TextMacroStatement|null = null;

    public inPrivate = false;
    public inPublic = false;
    public modifierToken: Tokenize|null = null;
    public inStatic = false;
    public staticToken: Tokenize|null = null;

}

interface ErrorDefine {
    message: string;
    type: string;
}

class ParseError extends Range implements ErrorDefine{
    type: string;
    message: string = "";
    
    constructor(type: string, message?: string) {
        super();
        this.type = type;
        if (message) this.message = message;
    }

}

enum ErrorTypeEnum {
    end_tag_lost = "end_tag_lost",
    rep = "rep",
    modifier = "modifier",
    staticModifier = "staticModifier",
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
function isWhat(token:Tokenize, keywordString: string) :boolean {
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



function parsing(tokens: Tokenize[], then: () => void, error: (event: ParseError) => void) {
    const state = new StateParam();
    const textMacroStatements:TextMacroStatement[] = [];
    const nonTextMacroTokens:Tokenize[] = [];
    new Evaluator().parsing(Tokenizer.get(`
    a
    //! textmacro temacname
    function a takes string b, integer b returns game
    //! endtextmacroa
    b
    `), (token, ts, isStart) => {
        if (isStart && /^\/\/!\s+textmacro\b/.test(token.value)) {
            if (state.inTextMacroRange) {
                error(new ParseError("textmacro", "Duplicate definition textmacro").setRange(token));
            } else {
                state.inTextMacroRange = true;
                state.inTextMacroLine = true;
            }
            state.textMacroState = 0;
            state.textMacro = new TextMacroStatement().setRange(token);
            textMacroStatements.push(state.textMacro);
        } else if (isStart && /^\/\/!\s+endtextmacro\b/.test(token.value)) {
            if (state.inTextMacroRange) {
                state.inTextMacroRange = false;
                if (state.textMacro) {
                    state.textMacro.isClose = true;
                    state.textMacro.end = token.end;
                }
            } else {
                error(new ParseError("textmacro", "Duplicate definition endtextmacro").setRange(token));
            }
        } else if (state.inTextMacroRange) {
            state.textMacro?.body.push(token);
        } else {
            nonTextMacroTokens.push(token);
        }
    });
    console.log(state.textMacro);
    
    new Evaluator().parsing(nonTextMacroTokens, (token, ts, isStart) => {
        console.log(token);
        return;
        const parseGlobals = () => {
            if (state.inGlobalsRange) {
    
            }
        };
        const parseFunction = () => {
            if (state.inFunctionRange) {
    
            } else if (state.inGlobalsRange) {
    
            }
        };
        const parseScope = () => {
            if (state.inScopeRange) {
                parseScope();
            } else if (state.inFunctionRange) {
                parseFunction();
            } else if (state.inGlobalsRange) {
                parseGlobals();
            }
        };
        const parseLibrary = () => {
            if (state.inScopeRange) {
                parseScope();
            } else if (state.inFunctionRange) {
                parseFunction();
            } else if (state.inGlobalsRange) {
                parseGlobals();
            }
        };
        const parseContent = () => {
            if (state.inLibraryRange) {
                parseLibrary();
            } else if (state.inScopeRange) {
                parseScope();
            } else if (state.inFunctionRange) {
                parseFunction();
            } else if (state.inGlobalsRange) {
                parseGlobals();
            } 
        };
        console.log(token);
    
        

        let func: FunctionStatement| null = null;

        if (isStart) {
            state.inFunctionLine = false;
            state.inLibraryLine = false;
            state.inScopeLine = false;
            state.inStructLine = false;
            state.inGlobalsLine = false;
            state.inTextMacroLine = false;

            state.functionState = 0;
            state.libraryState = 0;
            state.scopeState = 0;
            state.structState = 0;
            state.globalsState = 0;
            state.textMacroState = 0;

            state.inPrivate = false;
            state.inPublic = false;

            state.inStatic = false;

            if (isFunction(token)) {
                state.inFunctionRange = true;
                state.inFunctionLine = true;
                state.functionState = 0;
            } else if (isEndFunction(token)) {
                if (state.inFunctionRange) {
                    state.inFunctionRange = false;
                } else {
                    // Missing endfunction keyworld
                    error(new ParseError(ErrorTypeEnum.rep, `Redundant 'endfunction'.`).setRange(token));
                }
            } else if (isPrivate(token)) {
                if (state.inLibraryRange || state.inScopeRange) {
                    state.inPrivate = true;
                    state.modifierToken = token;
                } else {
                    error(new ParseError(ErrorTypeEnum.modifier, `'private' outside (library/scope) definition.`).setRange(token));
                }
            } else if (isPublic(token)) {
                if (state.inLibraryRange || state.inScopeRange) {
                    state.inPublic = true;
                    state.modifierToken = token;
                } else {
                    error(new ParseError(ErrorTypeEnum.modifier, `'public' outside (library/scope) definition.`).setRange(token));
                }
            } else if (isStatic(token)) {
                if (state.inStructRange) {
                    state.inStatic = true;
                    state.staticToken = token;
                } else {
                    error(new ParseError(ErrorTypeEnum.staticModifier, `'static' outside struct definition.`).setRange(token));
                }
            }
        }


    });
    
}

parsing([], () => {}, (event) => {console.log(event);
});

interface ops<O, E> {
    match: (option: O) => boolean;
    handle: (expr: E, token: Tokenize, option: O) => {expr: E, option: O}
}

function p<O>(content: string, ops: ParOption<O>[]) {
    Tokenizer.build(content, (token) => {

    });
}

class ParOption<E> {
    isJ: boolean = true;
    isZinc: boolean = false;
    isAi: boolean = false;
    isFirstLine: boolean = false;
    isStart: boolean = false;

    inGlobals: boolean = false;
    inFunction: boolean = false;

    inIf: boolean = false;
    inLoop: boolean = false;

    expr: E;

    handle: <A>(op: ParOption<E>) => ParOption<A>;

    constructor(expr: E, handle: <A>(op: ParOption<E>) => ParOption<A>) {
        this.expr = expr;

        this.handle = handle;
    }
}

class Root {};


p(``, [
    // new ParOption()
]);


    