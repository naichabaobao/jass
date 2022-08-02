import { isKeyword } from "../provider/keyword";
import { Identifier, Position, Range } from "./ast";
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
    // 为ture时,就算有参数也无视
    public isNothing:boolean = false;
    public returns: IDentifier|null = null;
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

    take: TakeStatement|null = null;

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
    let preToken: Tokenize|null = null;
    Tokenizer.build(content, (token) => {
        handle(token, preToken === null || preToken.end.line !== token.start.line);
        preToken = token;
    });
} 

function handleParse<S>(content: string, defaultState:S, preHandle: (token: Tokenize, state: S, isStart: boolean) => void, as: Arg<S>[]) {
    const state:S = defaultState;
 
    doparse(content, (token, isStart) => {
        preHandle(token, state, isStart);

        const handler = as.find((a) => a.is(token, state, isStart));

        if (handler) {
            handler.handle(token, state, isStart);
        }

    });
}

class UnaryExpression extends Expression {

    public op:Tokenize|null = null;
    public value: Term|null = null;

    constructor() {
        super("UnaryExpression");
    }
}

class BinaryExpression extends Expression {

    public op:Tokenize|null = null;
    public left: Term| null = null;
    public right: Term| null = null;

    constructor() {
        super("BinaryExpression");
    }
}

class Call extends Expression {

    public name: IDentifier|null = null;
    public args: Term[] = [];

}

class Value extends Expression {

    public value: Tokenize|null = null;

    constructor() {
        super("Value");
    }
}

class Term extends Expression {

    public value: IDentifier|Call|Value|BinaryExpression|UnaryExpression|Term|null = null;

    constructor() {
        super("Term");
    }
}

class Iter {

    private state: number = 0;
    private isDone: boolean = false;
    private root: Term|null = null;
    private term: Term|null = null;
    private field:number = 0;

    constructor() {

    }

    public next(token: Tokenize): Expression|null {
        if (this.state == 0) {
            if (token.type == "op") {
                if (token.value == "-" || token.value == "+") {
                    const unaryExpression = new UnaryExpression().from(token);
                    unaryExpression.op = token;
                    this.term = new Term();
                    this.term.value = unaryExpression;
                    this.state = 1;
                } else if (token.value == "(") {
                    this.field++;
                }
            } else if (token.type == "id") { // S -> T
                const id = new IDentifier(token.value).from(token);
                const term = new Term().from(token);
                term.value = id;
                this.term = term;

                this.state = 2;

                this.root = term;
            }
        } else if (this.state == 1) {
            if (token.type == "op") {
                if (token.value == "-" || token.value == "+") { // T -> T'
                    const unaryExpression = new UnaryExpression().from(token);
                    unaryExpression.op = token;
                    const term = new Term();
                    term.value = unaryExpression;
                    this.term!.value = term;

                    this.term = term;

                    this.state = 1;
                } else if (token.value == "(") { // T -> T''
                    this.field++;
                }
            } else if (token.type == "id") {
                const id = new IDentifier(token.value).from(token);
                const term = new Term().from(token);
                term.value = id;
                this.term = term;
            }
        } else if (this.state == 2) {
            if (token.type == "op") {
                if (token.value == "-" || token.value == "+") { // T -> T'
                    const expr = new BinaryExpression();
                    const term = new Term();
                    term.value = expr;

                    expr.left = this.term;
                    expr.op = token;

                    this.term = term;

                    this.state = 3;
                } else if (token.value == "*" || token.value == "/") { // T -> T''
                    const expr = new BinaryExpression();
                    const term = new Term();
                    term.value = expr;

                    expr.left = this.term;
                    expr.op = token;

                    this.term = term;

                    this.state = 4;
                }
            }
        } else if (this.state == 3) { // T' -> E
            if (token.type == "id") {
                const term = new Term();
                const id = new IDentifier(token.value).from(token);

                term.value = id;

                term.from(id);

                const expr = (<BinaryExpression>this.term!.value);
                expr.right = term;

                this.state = 2;
            }
        } else if (this.state == 4) { // T'' -> E
            if (token.type == "id") {
                const term = new Term();
                const id = new IDentifier(token.value).from(token);

                term.value = id;

                term.from(id);

                const expr = (<BinaryExpression>this.term!.value);
                expr.right = term;

                this.state = 2;
            }
        }

        return this.term;
    }

    private done() :boolean {
        return this.field == 0;
    }

}

const expr = (token: Tokenize) => {
        
};

if (true) {

    

    const root = new Root();

    handleParse<ParsedOption>(`
    function   a/**//**//**//**//**/ takes string a ,  integer bb returns string
    `, 
        new ParsedOption(),
        (token, state, isStart) => {
            if (isStart) {
                state.inFunctionLine = false;
                console.log("reset");
                
            }
        },
        [
        new Arg((token, state, isStart) => {
            return isStart && token.type == "id" && token.value == "function";
        }, (token, state) => {
            if (state.inFunction) {
                // 缺少endfunction
                root.pushError(state.func!, "Missing 'endfunction'!");
            }
            if (state.inGlobals) {
                root.pushError(state.func!, "Missing 'endglobals'!");
            }
            state.inFunction = true;
            state.inFunctionLine = true;
            state.functionState = 0;
            state.func = new FunctionStatement();
            state.func.from(token);
            root.block.children.push(state.func);
        }),
        new Arg((token, state, isStart) => {
            return state.inFunction && state.inFunctionLine;
        }, (token, state, isStart) => {
            // 0 func id
            // 1 takes
            // 2 take type
            // 3 take id
            // 4 take , or returns
            // 5 wait returns
            // 6 returns type
            // 7 function over
            if (token.type == "block_comment") {
                console.log("hulie", token.value, state.functionState, isStart);
                
            } else if (state.functionState == 0) {
                if (token.type == "id") {
                    if (isKeyword(token.value)) {
                        root.pushError(state.func!, "Naming cannot be a keyword!");
                    }
                    state.func!.name = new IDentifier(token.value).from(token);
                    state.func!.end = token.end;
                    state.functionState = 1;
                } else {
                    root.pushError(token, "Unexpected token '" + token.value + "'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 1) {
                console.log("hulie2", state.functionState);
                if (token.type == "id" && token.value == "takes") {
                    state.functionState = 2;
                } else {
                    root.pushError(token, "Expected token 'takes'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 2) { // take type
                if (token.type == "id") {
                    if (token.value == "nothing") {
                        if (state.func!.isNothing) {
                            root.pushError(token, "Nothing is not a type");
                        }
                        state.func!.isNothing = true;
                        state.functionState = 5; // wait returns
                    } else {
                        if (isKeyword(token.value)) {
                            root.pushError(token, "Parameter type cannot be keyword");
                        }
                        state.take = new TakeStatement();
                        state.take.type = new IDentifier(token.value).from(token);
                        state.functionState = 3;
                        state.func!.takes.push(state.take);
                    }
                } else {
                    root.pushError(token, "Unexpected token '" + token.value + "'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 3) { // take id
                if (token.type == "id") {
                    if (isKeyword(token.value)) {
                        root.pushError(token, "Parameter id cannot be keyword");
                    }
                    state.take!.name = new IDentifier(token.value).from(token);
                    state.functionState = 4;
                } else {
                    root.pushError(token, "Unexpected token '" + token.value + "'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 4) { // take ,
                if (token.type == "id") {
                    if (token.value == "returns") {
                        state.functionState = 6; // returns type
                    } else {
                        root.pushError(token, "Expected token ',' or 'returns'!");
                        state.functionState = 7;
                    }
                } else if (token.type == "op") {
                    if (token.value == ",") {
                        state.functionState = 2;
                    } else {
                        root.pushError(token, "Expected token ',' or 'returns'!");
                        state.functionState = 7;
                    }
                } else {
                    root.pushError(token, "Expected token ',' or 'returns'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 5) {
                if (token.type == "id") {
                    if (token.value == "returns") {
                        state.functionState = 6; // returns type
                    } else {
                        root.pushError(token, "Expected token 'returns'!");
                        state.functionState = 7;
                    }
                } else {
                    root.pushError(token, "Expected token 'returns'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 6) {
                if (token.type == "id") {
                    if (token.value == "nothing") {
                        state.func!.isNothingReturns = true;
                    } else if (isKeyword(token.value)) {
                        root.pushError(token, "Returns type cannot be keyword");
                    }
                    state.func!.returns = new IDentifier(token.value).from(token);
                    state.functionState = 7;
                } else {
                    root.pushError(token, "Unexpected token '" + token.value + "'!");
                    state.functionState = 7;
                }
            } else if (state.functionState == 7) {
                root.pushError(token, "Unexpected token '" + token.value + "'!");
            }
            console.log("sort", state.functionState);
        }),
    ]);

    console.log(JSON.stringify(root.block.children, null, 2));
    
}
