// /**
//  * 将tokens转换为AST(具体语法树)
//  * 2020年8月8日13:25:55 支持zinc function -> jass function
//  */

// import { Token , tokenize } from "./tokens";
// import { Location } from "./range";

// interface Loc {
//     loc: Location | null;
// }

// interface Origin {
//     origin(): string;
// }

// class NativeDeclarator implements Loc, Origin {
//     public id: string | null = null;
//     public takes: Take[] = [];
//     public returns: string | null = null;
//     public loc: Location | null = null;

//     public origin() {
//         return `native ${this.id} takes ${this.takes.length > 0 ? this.takes.map(x => x.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}`;
//     }

//     /**
//      * 获取参数数量
//      */
//     public getTakeCount() {
//         return this.takes.length;
//     }
// }

// class FunctionDeclarator implements Loc, Origin {
//     public id: string | null = null;
//     public takes: Take[] = [];
//     public returns: string | null = null;
//     public loc: Location = new Location();

//     public body: Array<LocalDeclarator | CallDeclarator> = [];

//     public locals() {
//         return <LocalDeclarator[]>this.body.filter(x => x instanceof LocalDeclarator);
//     }

//     public calls() {
//         return <CallDeclarator[]>this.body.filter(x => x instanceof CallDeclarator);
//     }

//     /**
//      * function block中的tokens
//      */
//     public bodyTokens: VToken[] = [];
//     public origin() {
//         return `function ${this.id} takes ${this.takes.length > 0 ? this.takes.map(x => x.origin()).join(", ") : "nothing"} returns ${this.returns ?? "nothing"}`;
//     }

//     /**
//      * 获取参数数量
//      */
//     public getTakeCount() {
//         return this.takes.length;
//     }
// }

// class Take implements Loc, Origin {
//     public type: string | null = null;
//     public id: string = "";
//     public loc: Location = new Location()

//     public origin() {
//         return `${this.type} ${this.id}`;
//     }
// }

// // call 关键字调用方法
// class CallDeclarator implements Loc, Origin {
//     public id: string = "";
//     public params: any[] = [];
//     public loc: Location = new Location();
//     public origin() {
//         return `call ${this.id}(${this.params.map((x, index) => "take_" + 1).join(", ")})`;
//     }

//     /**
//      * 获取参数数量
//      */
//     public getTakeCount() {
//         return this.params.length;
//     }
// }

// function parseCallDeclarator(tokens: VToken[], pos: number, caller: CallDeclarator) {
//     let field = 0;
//     let paramIndex = 0;
//     if (tokens[pos] && tokens[pos].isId()) {
//         caller.id = tokens[pos].value;
//         pos++;
//         if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
//             pos++;
//             for (; pos < tokens.length; pos++) {
//                 const token = tokens[pos];
//                 if (field === 0) {
//                     if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
//                         field++;
//                     } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ")") {
//                         caller.loc.endLine = tokens[pos].loc?.endLine ?? 0;
//                         caller.loc.endPosition = tokens[pos].loc?.endPosition ?? 0;
//                         break;
//                     } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ",") {
//                         paramIndex++;
//                     }
//                     if (!caller.params[paramIndex]) {
//                         caller.params[paramIndex] = [];
//                     }
//                     caller.params[paramIndex].push(token);
//                 } else if (field > 0) {
//                     if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === "(") {
//                         field++;
//                     } else if (tokens[pos] && tokens[pos].isOp() && tokens[pos].value === ")") {
//                         field--;
//                         // continue;
//                     }
//                     if (!caller.params[paramIndex]) {
//                         caller.params[paramIndex] = [];
//                     }
//                     caller.params[paramIndex].push(token);
//                 }
//             }
//             caller.loc.endLine = tokens[pos - 1].loc?.endLine ?? 0;
//             caller.loc.endPosition = tokens[pos - 1].loc?.endPosition ?? 0;
//         }
//     }
//     return pos;
// }

// class Globals implements Loc {
//     public globals: GlobalDeclarator[] = [];
//     // public globalsTokens: Token[] = [];
//     public loc: Location | null = null;
// }

// type FlagType = "constant" | "array";

// type VariableFlagType = "local" | "array";

// class GlobalDeclarator implements Loc, Origin {
//     public flags: Set<FlagType> = new Set();
//     public type: string | null = null;
//     public id: string | null = null;
//     // 如果flags含有constant,则需要定义value值
//     public value: null = null;
//     public loc: Location = new Location();

//     public isArray() {
//         return this.flags.has("array");
//     }

//     public isConstant() {
//         return this.flags.has("constant");
//     }

//     public origin() {
//         return `${this.isConstant() ? "constant " : ""}${this.type} ${this.isArray() ? "array " : ""}${this.id}`;
//     }
// }

// class LocalDeclarator implements Loc, Origin {
//     public flags: Set<VariableFlagType> = new Set();
//     public type: string | null = null;
//     public id: string | null = null;
//     public value: null = null;
//     public loc: Location = new Location();

//     public origin() {
//         return `local ${this.type} ${this.id}`;
//     }
// }

// class Comment implements Loc {
//     public content: string = "";
//     public loc: Location | null = null;

//     public parseConten() {
//         return this.content.replace(/^\/\/\s*/, "");
//     }
// }

// class JassError implements Loc  {
//     public loc: Location = null as any;
//     public message:string = "";

//     constructor(loc:Location, message:string) {
//         this.loc = loc;
//         this.message = message;
//     }
// }

// class ProgramBlock {
//     public fileName: string | null = null;
//     public body: Array<FunctionDeclarator | NativeDeclarator | GlobalDeclarator> = [];
//     public comments: Comment[] = [];
//     public errors:JassError[] = [];

//     public functions() {
//         return <(FunctionDeclarator | NativeDeclarator)[]>this.body.filter(s => s instanceof FunctionDeclarator || s instanceof NativeDeclarator);
//     }

//     public globals() {
//         const globals = <GlobalDeclarator[]>this.body.filter(s => s instanceof GlobalDeclarator);
//         return globals;
//     }

//     public functionDeclarators() {
//         return <FunctionDeclarator[]>this.body.filter(s => s instanceof FunctionDeclarator);
//     }

//     public description(node: FunctionDeclarator | NativeDeclarator | GlobalDeclarator | LocalDeclarator) {
//         return this.comments.find(x => node.loc && Number.isInteger(node.loc.startLine) && x.loc && Number.isInteger(x.loc.startLine) && (<number>node.loc.startLine - 1) == x.loc.startLine)?.parseConten() ?? "";
//     }
// }

// /**
//  * 无视所有块注释
//  * 帮单行注释保存在comments中
//  * 把vjass和zinc语法映射到jass中
//  * 遇到其他非jass语法支持的,统统无视
//  * @param tokens 
//  * @description 如果你对token不熟悉,建议使用parse
//  */
// function parsing(tokens: VToken[]): ProgramBlock {
//     const progam = new ProgramBlock();
//     start(tokens, progam);
//     return progam;
// }

// function start(tokens: VToken[], progam: ProgramBlock) {
//     // 去除注释
//     tokens = removeComment(tokens, progam);

//     for (let index = 0; index < tokens.length;) {
//         const token = tokens[index];

//         if (token.type === "id" && token.value === "native") {
//             index = parseNative(tokens, index, progam, new NativeDeclarator);
//             index++;
//         } else if (token.type === "id" && token.value === "function") {
//             index = parseFunction(tokens, index, progam, new FunctionDeclarator);
//             index++;
//         } else if (token.type === "id" && token.value === "globals") {
//             parseGlobals(tokens, index, progam, new Globals);
//             // globals识别存在问题,因而暂时不对globals支持
//             index++;
//         } else {
//             // 如果遇到无法识别的token时，直接无视掉
//             index++;
//         }
//     }
// }

// /**
//  * 去除tokens中所有的注释，包括单行和多行
//  * @param tokens 
//  * @param progam 
//  */
// function removeComment(tokens: VToken[], progam: ProgramBlock) {
//     const ts: VToken[] = [];
//     for (let index = 0; index < tokens.length; index++) {
//         const token = tokens[index];
//         if (token.type === "block_comment") {
//             continue;
//         } else if (token.type === "comment") {
//             // 获取单行注释并保存在progam
//             const comment = new Comment();
//             comment.content = token.value;
//             comment.loc = token.loc;
//             progam.comments.push(comment);
//         } else {
//             ts.push(token);
//         }
//     }
//     return ts;
// }

// function parseNative(tokens: VToken[], pos: number, progam: ProgramBlock, native: NativeDeclarator): number {
//     if (tokens[pos].type === "id" && tokens[pos].value === "native") {
//         native.loc = new Location();
//         native.loc.startLine = tokens[pos].loc?.startLine ?? 0;
//         native.loc.startPosition = tokens[pos].loc?.startPosition ?? 0;
//         pos++;
//         progam.body.push(native);
//         if (tokens[pos].type === "id") {
//             native.id = tokens[pos].value;
//             pos++;
//             if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "takes") {
//                 pos++;
//                 if (tokens[pos].isId() && tokens[pos].value === "nothing") {
//                     pos++;
//                 } else {
//                     pos = parseTakes(tokens, pos, native);
//                 }
//                 if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "returns") {
//                     pos++;
//                     if (tokens[pos].type === "id") {
//                         native.returns = tokens[pos].value;
//                         (<Location>native.loc).endLine = tokens[pos].loc?.endLine ?? 0;
//                         (<Location>native.loc).endPosition = tokens[pos].loc?.endPosition ?? 0;
//                     }
//                 }
//             }
//         }
//     }
//     return pos;
// }

// function parseTakes(tokens: VToken[], pos: number, f: FunctionDeclarator | NativeDeclarator): number {
//     let take: Take | null = null;
//     let state = 0;
//     for (let index = pos; index < tokens.length; index++) {
//         const token = tokens[index];
//         if (state === 0) {
//             if (token.isId()) {
//                 take = new Take();
//                 take.loc = new Location();
//                 take.loc.startLine = token.loc?.startLine ?? 0;
//                 take.loc.startPosition = token.loc?.startPosition ?? 0;
//                 f.takes.push(take);
//                 take.type = token.value;
//                 state = 1;
//             } else {
//                 return index;
//             }
//         } else if (state === 1) {
//             if (token.isId()) {
//                 if (take == null) {
//                     return index;
//                 }
//                 take.id = token.value;
//                 if (take.loc) {
//                     take.loc.endLine = token.loc?.endLine ?? 0;
//                     take.loc.endPosition = token.loc?.endPosition ?? 0;
//                 }
//                 state = 2;
//             } else {
//                 return index;
//             }
//         } else if (state === 2) {
//             if (token.type === "op" && token.value === ",") {
//                 state = 0;
//             } else {
//                 return index;
//             }
//         }
//     }
//     return pos;
// }

// interface FunctionOption {
//     supportZinc?: boolean;
// }

// function parseFunction(tokens: VToken[], pos: number, progam: ProgramBlock, func: FunctionDeclarator, option?: FunctionOption) {

//     option = {
//         supportZinc: true
//     };
//     if (tokens[pos].type === "id" && tokens[pos].value === "function") {
//         const loc = new Location();
//         loc.startLine = tokens[pos].loc?.startLine ?? 0;
//         loc.startPosition = tokens[pos].loc?.startPosition ?? 0;
//         pos++;
//         func.loc = loc;
//         progam.body.push(func);
//         if (tokens[pos].type === "id") {
//             func.id = tokens[pos].value;
//             pos++;
//             if (tokens[pos] && tokens[pos].type === "id" && tokens[pos].value === "takes") {
//                 pos++;
//                 if (tokens[pos].isId() && tokens[pos].value === "nothing") {
//                     pos++;
//                 } else {
//                     pos = parseTakes(tokens, pos, func);
//                 }
//                 if (tokens[pos].type === "id" && tokens[pos].value === "returns") {
//                     pos++;
//                     if (tokens[pos] && tokens[pos].isId() && tokens[pos].value === "nothing") {
//                         const outs: VToken[] = [];
//                         pos = collectFunctionBody(tokens, pos + 1, outs);

//                         parseFunctionBody(outs, func);
//                         loc.endLine = tokens[pos].loc?.endLine ?? 0;
//                         loc.endPosition = tokens[pos].loc?.endPosition ?? 0;
//                     }
//                     else if (tokens[pos].isId()) {
//                         func.returns = tokens[pos].value;
//                         const outs: VToken[] = [];
//                         pos = collectFunctionBody(tokens, pos + 1, outs);

//                         parseFunctionBody(outs, func);
//                         loc.endLine = tokens[pos].loc?.endLine ?? 0;
//                         loc.endPosition = tokens[pos].loc?.endPosition ?? 0;
//                     }
//                 }
//             }
//             // zinc function parse
//             else if (option?.supportZinc && tokens[pos] && tokens[pos].type === "op" && tokens[pos].value === "(") { // zinc takes
//                 pos = parseTakes(tokens, pos + 1, func);
//                 if (tokens[pos].type === "op" && tokens[pos].value === ")") {
//                     pos++;
//                     if (tokens[pos].type === "op" && tokens[pos].value === "->") {
//                         pos++;
//                         if (tokens[pos].type === "id") {
//                             func.returns = tokens[pos].value;
//                             pos++;
//                             if (tokens[pos].type === "op" && tokens[pos].value === "{") {
//                                 pos = collectZincFunctionBody(tokens, pos + 1, func);
//                                 loc.endLine = tokens[pos].loc?.endLine ?? 0;
//                                 loc.endPosition = tokens[pos].loc?.endPosition ?? 0;
//                             }
//                         }
//                     } else if (tokens[pos].type === "op" && tokens[pos].value === "{") {
//                         pos = collectZincFunctionBody(tokens, pos + 1, func);
//                         loc.endLine = tokens[pos].loc?.endLine ?? 0;
//                         loc.endPosition = tokens[pos].loc?.endPosition ?? 0;
//                     }
//                 }
//             }
//         }
//     }
//     return pos;
// }

// // 非标准实现方式,目前可以运行
// function parseFunctionBody(tokens: VToken[], func: FunctionDeclarator) {
//     let col: Map<number, VToken[]> = new Map();
//     tokens.forEach((item, index, ts) => {
//         const key = item.loc?.startLine ?? -1;
//         if (key !== -1) {
//             if (col.has(key)) {
//                 col.get(key)?.push(item);
//             } else {
//                 const arr = new Array<VToken>();
//                 arr.push(item);
//                 col.set(key, arr);
//             }
//         }
//     });
//     let local: LocalDeclarator | null = null;
//     col.forEach(values => {
//         if (values[0].isId() && values[0].value === "local") {
//             local = new LocalDeclarator();
//             local.loc = new Location();
//             local.loc.startLine = values[0].loc?.startLine ?? 0;
//             local.loc.startPosition = values[0].loc?.startPosition ?? 0;
//             func.body.push(local);
//             if (values[1] && values[1].isId()) {
//                 local.type = values[1].value;
//                 if (values[2] && values[2].isId()) {
//                     local.id = values[2].value;
//                     local.loc.endLine = values[2].loc?.endLine ?? 0;
//                     local.loc.endPosition = values[2].loc?.endPosition ?? 0;
//                 }
//             }
//         } else if (values[0].isId() && values[0].value === "call") {

//             const caller = new CallDeclarator();
//             caller.loc.startLine = values[0].loc?.startLine ?? 0;
//             caller.loc.startPosition = values[0].loc?.startPosition ?? 0;
//             func.body.push(caller);
//             parseCallDeclarator(values, 1, caller);

//         }
//         local = null;
//     });
// }

// function collectFunctionBody(tokens: VToken[], pos: number, outs: VToken[]) {
//     let token: VToken = null as any;
//     while (token = tokens[pos]) {
//         if (token.type === "id" && token.value === "endfunction") {
//             break;
//         }
//         outs.push(token);
//         pos++;
//     }
//     return pos;
// }

// function collectZincFunctionBody(tokens: VToken[], pos: number, func: FunctionDeclarator) {
//     let token: VToken = null as any;
//     let field: number = 0;
//     while (token = tokens[pos]) {
//         if (field === 0 && token.type === "op" && token.value === "}") {
//             break;
//         } else if (token.type === "op" && token.value === "{") {
//             field++;
//         } else if (token.type === "op" && token.value === "}") {
//             field--;
//         }
//         func.bodyTokens.push(token);
//         pos++;
//     }

//     return pos;
// }

// /**
//  * @deprecated Globals类将在后面废弃
//  * @param tokens 
//  * @param pos 
//  * @param progam 
//  * @param globals 
//  */
// function parseGlobals(tokens: VToken[], pos: number, progam: ProgramBlock, globals: Globals) {
//     if (tokens[pos].type === "id" && tokens[pos].value === "globals") {
//         // progam.body.push(globals);
//         pos++;
//         let token: VToken | null = null;
//         // 记录行是否改变了
//         const globalsTokens: VToken[] = [];

//         while (token = tokens[pos]) {
//             if (!token) {
//                 break;
//             } else if (token.isId() && token.value === "endglobals") {
//                 break;
//             } else {
//                 globalsTokens.push(token);
//             }
//             pos++;
//         }
//         // 将globals tokens数组 转为以行为key的map;
//         let col: Map<number, VToken[]> = new Map();
//         globalsTokens.forEach((item, index, ts) => {
//             const key = item.loc?.startLine ?? -1;
//             if (key !== -1) {
//                 if (col.has(key)) {
//                     col.get(key)?.push(item);
//                 } else {

//                     const arr = new Array<VToken>();
//                     arr.push(item);
//                     col.set(key, arr);
//                 }
//             }
//         });


//         let global: GlobalDeclarator | null = null;
//         col.forEach(values => {
//             // const values:Token[] = <Token[]>col.get(<number><unknown>key);
//             const type_id_parse = function (index: number) {
//                 const type_id_parse2 = function (index: number) {
//                     if (values[index].isId()) {
//                         if (!global) {
//                             global = new GlobalDeclarator();
//                         }
//                         globals.globals.push(global);
//                         if (!global.loc) {
//                             global.loc = new Location();
//                             global.loc.startLine = values[index].loc?.startLine ?? 0;
//                             global.loc.startPosition = values[index].loc?.startPosition ?? 0;
//                         }
//                         global.type = values[index].value;
//                         if (values[index + 1] && values[index + 1].isId() && values[index + 1].value === "array") {
//                             global.flags.add("array");
//                             if (values[index + 2] && values[index + 2].isId()) {
//                                 global.id = values[index + 2].value;
//                                 global.loc.endLine = values[index + 2].loc?.endLine ?? 0;
//                                 global.loc.endPosition = values[index + 2].loc?.endPosition ?? 0;
//                             }
//                         } else if (values[index + 1] && values[index + 1].isId()) {
//                             global.id = values[index + 1].value;
//                             global.loc.endLine = values[index + 1].loc?.endLine ?? 0;
//                             global.loc.endPosition = values[index + 1].loc?.endPosition ?? 0;
//                         }
//                     }
//                 }
//                 if (values[0].isId() && (values[0].value === "private" || values[0].value === "public")) {
//                     type_id_parse2(index + 1);
//                 } else {
//                     type_id_parse2(index);
//                 }
//             }
//             if (values[0].isId() && values[0].value === "constant") {
//                 global = new GlobalDeclarator();
//                 global.flags.add("constant")
//                 globals.globals.push(global);
//                 type_id_parse(1);
//             } else {
//                 type_id_parse(0);
//             }
//             global = null;
//         });
//     }
//     return pos;
// }

// function removeBlockComment(content: string): string {
//     return content.replace(new RegExp("/\\*((/\\*[\\s\\S]*\\*/)*|[\\s\\S]*)\\*/", "mg"), (val, args) => {
//         return val.replace(/[^\n]/g, " ");
//     })
// }

// function parseEx(content: string) {
//     const program = new ProgramBlock();
//     // 去除多行注释
//     content = removeBlockComment(content);
//     const lines = content.split(/\n/);
//     let state = 0;
//     let inZinc = false;
//     let inGlobals = false;
//     let inFunction = false;
//     let o:FunctionDeclarator = null as any;

//     for (let index = 0; index < lines.length; index++) {
//         const line = lines[index];
//         if (line.trimStart() == "") continue;
//         const tokens = tokenize(line);
//         if (tokens.length == 0) continue;
//         if (tokens[0].isComment() && /^\/\/\s+zinc(?=\s)/.test(tokens[0].value)) {
//             if (inZinc) {
//                 program.errors.push(new JassError(tokens[0].loc, "Zinc blocks are repeatedly nested"))
//             } else {
//                 inZinc = true;
//             }
//         } else if (tokens[0].isComment() && /^\/\/\s+endzinc(?=\s)/.test(tokens[0].value)) {
//             if (inZinc) {
//                 inZinc = false;
//             } else {
//                 program.errors.push(new JassError(tokens[0].loc, "Excess endzinc blocks"))
//             }
//         } else if (tokens[0].isComment()) {
//             const comment = new Comment();
//             comment.content = tokens[0].value;
//             comment.loc = tokens[0].loc;
//             program.comments.push(comment);
//         } else if (inZinc) {
            
//         } else if (tokens[0].isId() && tokens[0].value == "globals") {
//             if (inGlobals) {
//                 program.errors.push(new JassError(tokens[0].loc, "Duplicate global declarations"))
//             } else {
//                 inGlobals = true;
//             }
//         } else if (tokens[0].isId() && tokens[0].value == "endglobals") {
//             if (inGlobals) {
//                 inGlobals = false;
//             } else {
//                 program.errors.push(new JassError(tokens[0].loc, "Repeated Endglobals statements"))
//             }
//         } else if (inGlobals) {
//             if (tokens[0].isId() && (tokens[0].value == "private" || tokens[0].value == "public")) {
//                 tokens.shift();
//             }
//             if (tokens.length == 0) continue;
//             let constantToken:VToken|undefined = undefined;
//             if (tokens[0].isId() && tokens[0].value == "constant") {
//                 constantToken = tokens.shift();
//             }
//             if (tokens.length == 0) continue;
//             let typeToken:VToken|undefined = undefined;
//             if (tokens[0].isId()) {
//                 typeToken = tokens.shift();
//             }
//             if (tokens.length == 0) continue;
//             let arrayToken:VToken|undefined = undefined;
//             if (tokens[0].isId() && tokens[0].value == "array") {
//                 arrayToken = tokens.shift();
//             }
//             if (tokens.length == 0) continue;
//             let idToken:VToken|undefined = undefined;
//             if (tokens[0].isId()) {
//                 idToken = tokens.shift();
//             }
//             if (typeToken && idToken) {
//                 const global = new GlobalDeclarator();
//                 global.type = typeToken.value;
//                 global.id = idToken.value;
//                 global.loc.startLine = index;
//                 global.loc.endLine = index;
//                 global.loc.endPosition = idToken.loc.endPosition;
//                 if (constantToken) {
//                     global.flags.add("constant");
//                     global.loc.startPosition = constantToken.loc.startPosition;
//                 } else {
//                     global.loc.startPosition = typeToken.loc.startPosition;
//                 }
//                 if (arrayToken) {
//                     global.flags.add("array");
//                 }
//                 program.body.push(global);
//             }
//         } else if ((function () {
//             if (tokens[0].isId() && (tokens[0].value == "private" || tokens[0].value == "public")) {
//                 tokens.shift();
//             }
//             return tokens[0] && tokens[0].isId() && tokens[0].value == "function";
//         })()) {
//             if (inFunction) {
//                 program.errors.push(new JassError(tokens[0].loc, "Error nesting function"))
//             } else {
//                 const functionToken = <VToken>tokens.shift();
//                 o = new FunctionDeclarator();
//                 inFunction = true;
//                 program.body.push(o);
//                 o.loc.startLine = index;
//                 o.loc.startPosition = functionToken.loc.startPosition;
//                 if(!tokens[0]) continue;
//                 if (tokens[0].isId()) {
//                     o.id = tokens[0].value;
//                     tokens.shift();
//                 } else {
//                     // 命名错误
//                     continue;
//                 }
//                 const takesToken = tokens.shift();
//                 if (!takesToken || !takesToken.isId() || takesToken.value != "takes") continue;
//                 if (!tokens[0]) continue;
//                 if (tokens[0].isId() && tokens[0].value == "nothing") continue;

//                 const returnsIndex = tokens.findIndex(token => {
//                     return token.isId() && token.value == "returns";
//                 });
//                 let takesTokens:VToken[] = null as any;
//                 if (returnsIndex == -1) {
//                     takesTokens = tokens;
//                 } else {
//                     takesTokens = tokens.slice(0, returnsIndex)
//                     if (tokens[returnsIndex + 1]) {
//                         if (tokens[returnsIndex + 1].isId() && tokens[returnsIndex + 1].value != "nothing") {
//                             o.returns = tokens[returnsIndex + 1].value;
//                         }
//                     }
//                 }
//                 for (let i = 0; i < takesTokens.length; i += 3) {
//                     if (takesTokens[i] && takesTokens[i + 1] && takesTokens[i].isId() && takesTokens[i + 1].isId()) {
//                         const take = new Take();
//                         take.type = takesTokens[i].value;
//                         take.id = takesTokens[i + 1].value;
//                         take.loc.startLine = index;
//                         take.loc.endLine = index;
//                         take.loc.startPosition = takesTokens[i].loc.startPosition;
//                         take.loc.endPosition = takesTokens[i + 1].loc.endPosition;
//                         o.takes.push(take);
//                     }
//                     if (!takesTokens[i + 2] || !takesTokens[i + 2].isOp() || takesTokens[i + 2].value != ",") {
//                         break;
//                     }
//                 }
//             }
//         } else if (tokens[0].isId() && tokens[0].value == "endfunction") {
//             if (inFunction) {
//                 o.loc.endLine = index;
//                 o.loc.endPosition = tokens[0].loc.endPosition;
//                 inFunction = false;
//             } else {
//                 program.errors.push(new JassError(tokens[0].loc, "Repeated Endfunction statements"))
//             }
//         } else if (inFunction) {
//             if (tokens[0].isId() && tokens[0].value == "local") {
//                 const localToken = tokens[0];
//                 tokens.shift();
//                 let typeToken:VToken|undefined = undefined;
//                 if (tokens[0].isId()) {
//                     typeToken = tokens.shift();
//                 }
//                 if (!typeToken) continue;
//                 let arrayToken:VToken|undefined = undefined;
//                 if (tokens[0] && tokens[0].isId() && <string>tokens[0].value == "array") {
//                     arrayToken = tokens.shift();
//                 }
//                 let idToken:VToken|undefined = undefined;
//                 if (tokens[0].isId()) {
//                     idToken = tokens.shift();
//                 }
//                 if (!idToken) continue;
//                 const local = new LocalDeclarator();
//                 local.type = typeToken.value;
//                 local.id = idToken.value;
//                 if (arrayToken) {
//                     local.flags.add("array");
//                 }
//                 local.loc.startLine = index;
//                 local.loc.endLine = index;
//                 local.loc.startPosition = localToken.loc.startPosition;
//                 local.loc.endPosition = idToken.loc.endPosition;
//                 o.body.push(local);
//             } else if (tokens[0].isId() && tokens[0].value == "call") {
//                 const callToken = <VToken>tokens.shift();
//                 let idToken:VToken|undefined = undefined;
//                 if (tokens[0].isId()) {
//                     idToken = tokens.shift();
//                 }
//                 if (!idToken) continue;
//                 let firstToken = tokens.shift();
//                 if (!firstToken) continue;
//                 if (!firstToken.isOp() || firstToken.value != "(") continue;
//                 const caller:CallDeclarator = new CallDeclarator();
//                 caller.id = idToken.value;
//                 let field = 0;
//                 let count = 0;
//                 for (let i = 0; i < tokens.length; i++) {
//                     const token = tokens[i];
//                     if (field == 0) {
//                         if (token.isOp() && token.value == "(") {
//                             field++;
//                         } else if (token.isOp() && token.value == ")") {
//                             o.body.push(caller);
//                             break;
//                         } else if (token.isOp() && token.value == ",") {
//                             count++;
//                         } else {
//                             if (!caller.params[count]) {
//                                 caller.params[count] = 0
//                             } else {
//                                 caller.params[count]++;
//                             }
//                         }
//                     } else {
//                         if (token.isOp() && token.value == "(") {
//                             field++;
//                         } else if (token.isOp() && token.value == ")") {
//                             field--;
//                         } else {
//                             if (!caller.params[count]) {
//                                 caller.params[count] = 0
//                             } else {
//                                 caller.params[count]++;
//                             }
//                         }
//                     }
//                 }
//                 // let endToken = tokens.shift();
//                 // if (!endToken) continue;
//                 // if (!endToken.isOp() || endToken.value != ")") continue;
                
//             }
//         }
//     }
//     return program;
// }

// function parse(content: string) {
//     const tokens = tokenize(content);
//     return parsing(tokens);
//     // return parseLines(content);
// }

// export {
//     parsing,
//     parse,
//     parseEx,
//     FunctionDeclarator,
//     NativeDeclarator,
//     LocalDeclarator,
//     // Globals,
//     GlobalDeclarator,
//     ProgramBlock
// };