import {Token, tokens} from "./scanner";

class RequiresOptional {
    public requires:string;

    constructor(value:string) {
        this.requires = value;
    }
}

/*
applyMixins(RequiresOptional, [String]);
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}*/

class LibraryDeclaration {
    public name:string = null as any;
    public requires:Array<RequiresOptional|string> = [];
    public onInit:OnInitFunctionDeclaration|null = null;
    public globalMembers:GlobalMember[]|OneDimensionalArrayGlobalMember[]|TwoDimensionalArrayGlobalMember[] = [];
    public functions:FunctionDeclaration[] = [];
}

class Variable {
    public type:string = null as any;
    public name:string = null as any;
}

class ArrayVariable extends Variable {}

class FunctionDeclaration {
    public flags:PermissionFlag[] = [];
    public name:string = null as any;
    public takes:Take[] = [];
    public returns:string|null = null;
    public body:any = null as any;

    public origin() {
        return `${this.flags.length > 0 ? this.flags.map(flag => flag).join(" ") + " " : ""}function ${this.name ?? ""} (${this.takes.map(take => take.origin()).join(", ")}) ${this.returns ? "-> " + this.returns + " " : "" }{\n    // ...\n}`;
    }
}

class OnInitFunctionDeclaration extends FunctionDeclaration{
    public readonly name:string = "onInit";
}

class Take {
    public type:string = null as any;
    public name:string = null as any;

    public origin () {
        return `${this.type} ${this.name}`;
    }
}

type PermissionFlag = "private" | "public";
type ConstantFlag = "constant";

class GlobalMember {
    public flags:Array<PermissionFlag|ConstantFlag> = [];
    public type:string = null as any;
    public name:string = null as any;
}

class OneDimensionalArrayGlobalMember extends GlobalMember {
    public init:number|null = null;
}

class TwoDimensionalArrayGlobalMember extends GlobalMember {
    public initColumn:number|null = null;
    public initRow:number|null = null;
}

class ZincBlock {
    public librarys:LibraryDeclaration[] = [];
}

class ZincFile {
    public fileName:string|null = null;
    public blocks:ZincBlock[] = [];
}


/*
class BooleanFirst {
    public value:BooleanValue|BooleanFirst|BooleanUnaryExpression|BooleanBinaryExpression|BooleanValueBinaryExpression|BooleanStringBinaryExpression = null as any;
}
class StringFirst {
    public value:StringValue|StringBinaryExpression|StringFirst = null as any;
}
class ValueFirst {
    public value:IntValue|RealValue|ValueFirst = null as any;
}

interface Value {
    value:string;
}
class BooleanValue implements Value{
    public value:string = null as any;
}
class StringValue  implements Value{
    public value:string = null as any;
}
class IntValue  implements Value{
    public value:string = null as any;
}
class RealValue  implements Value{
    public value:string = null as any;
}

class Id {
    public value:string = null as any;
}
class BooleanUnaryExpression {
    public op:"!"|string  = null as any;
    public value:BooleanUnaryExpression|BooleanValue|BooleanFirst|BooleanOpExpression|CallExpression|Id = null as any;
}

class BooleanOpExpression {
    public op:"not"|"or"|"and"|string  = null as any;
    public value:BooleanUnaryExpression|BooleanBinaryExpression|BooleanValueBinaryExpression|BooleanStringBinaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
}

class BooleanBinaryExpression {
    public op:"=="|"!="|string = null as any;
    public left:BooleanUnaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
    public right:BooleanUnaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
}

class BooleanValueBinaryExpression {
    public op:"=="|"!="|">"|"<"|">="|"<="|string  = null as any;
    public left:BooleanUnaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
    public right:BooleanUnaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
}

class BooleanStringBinaryExpression {
    public op:"=="|"!="|string  = null as any;
    public left:StringValue|BooleanFirst|CallExpression|Id = null as any;
    public right:StringValue|BooleanFirst|CallExpression|Id = null as any;
}

class CallExpression {
    public name:string = null as any;
    public takes:Array<BooleanValue|IntValue|RealValue|StringValue|CallExpression|Id> = [];
}

class StringBinaryExpression {
    public op:"+"|string  = null as any;
    public left:StringValue|StringBinaryExpression|StringFirst|CallExpression|Id = null as any;
    public right:StringValue|StringBinaryExpression|StringFirst|CallExpression|Id = null as any;
}

class ValueUnaryExpression {
    public op:"-"|string  = null as any;
    public value:IntValue|RealValue|ValueFirst|ValueUnaryExpression|CallExpression|Id = null as any;
}

class IfExpression {
    public condition:BooleanUnaryExpression|BooleanBinaryExpression|BooleanValueBinaryExpression|BooleanStringBinaryExpression|BooleanValue|BooleanFirst|CallExpression|Id = null as any;
}*/



const typeComment = "comment";
const typeBlockComment = "block";
const typeId = "id";
const typeOp = "op";
const typeInt = "int";
const typeString = "str";
const typeReal = "real";
const typeMacro = "macro";
const typeOther = "other";


const Library = "library";
const Requires = "requires";
const Optional = "optional";
const Public = "public";
const Private = "private";
const Type = "type";
const Constant = "constant";
const Function = "function";
const If = "if";
const Else = "else";
const While = "while";
const For = "for";
const Break = "break";
const Return = "return";
const Static = "static";
const Debug = "debug";
const Struct = "struct";
const Interface = "interface";
const Method = "method";
const Null = "null";
const Operator = "operator";
const Module = "module";
const Delegate = "delegate";
const Extends = "extends";
const Not = "not";
const True = "true";
const False = "false";
const Nothing = "nothing";



function isZinc(value:string) {
    return /^[ \t]*\/\/![ \t]+zinc([ \t].*\n?|[ \t]*\n?)$/.test(value);
}

function isEndZinc(value:string) {
    return /^[ \t]*\/\/![ \t]+endzinc([ \t].*\n?|[ \t]*\n?)$/.test(value);
}
/*

function ast(tokens:Token[]) {
    const block = new ZincBlock;
    start(tokens, 0, false, block);
    console.log(block);
}
function start(tokens:Token[],index:number,inZincBlock = false,block:ZincBlock) {
    const token = tokens[index++];
    if (!token) return;
    const next_token:Token|undefined = tokens[index];

    if(inZincBlock) {
        if(isEndZinc(token.value)) {
            start(tokens, index, false, block);
        } else {
            if(next_token.type === typeId && next_token.value === Library) {
                start_library(tokens, index, block, new LibraryDeclaration);
            } else {
                start(tokens, index, true, block);
            }
        }
    } else {
        if(isZinc(token.value)) {
            if(next_token.type === typeId && next_token.value === Library) {
                start_library(tokens, index, block, new LibraryDeclaration);
            } else {
                start(tokens, index, true, block);
            }
        } else {
            start(tokens, index, false, block);
        }
    }
    return block;
}

function end(tokens:Token[], index:number, block:ZincBlock) {
    start(tokens, index, false, block); 
    return block;
}

function start_library(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId) {
        start_library_naming(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function start_library_naming(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId && next_token.value === Requires) {
        library.name = token.value;
        start_library_requires(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function start_library_requires(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId && next_token.value === Optional) {
        start_library_requires_optional(tokens, index, block, library);
    } else if(next_token.type === typeId) {
        (library.requires as string[]).push(token.value);
        start_library_requires_next(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function start_library_requires_optional(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if(next_token.type === typeId) {
        start_library_requires_optional_naming(tokens, index, block, library);
    }else {
        start(tokens, index, true, block);
    }

    
}

function start_library_requires_optional_naming(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if(next_token.type === typeOp && next_token.value === ",") {
        (library.requires as RequiresOptional[]).push(new RequiresOptional(token.value));
        start_library_requires_next(tokens, index, block, library);
    } else if(next_token.type === typeOp && next_token.value === "{") {
        start_library_requires_body(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function start_library_requires_next(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId && next_token.value === Optional) {
        start_library_requires_optional(tokens, index, block, library);
    } else if(next_token.type === typeId) {
        start_library_requires_optional_naming(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function start_library_requires_body(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    block.librarys.push(library);
    if (next_token.type === typeOp && next_token.value === "}") {
        start(tokens, index, true, block);
    }  else if (next_token.type === typeId && next_token.value === Function) {
        library_function(tokens, index, block, library, new FunctionDeclaration);
    } else if(next_token.type === typeId) {
        start_library_requires_optional_naming(tokens, index, block, library);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    func.flags.push("private");
    if (next_token.type === typeId) {
        library_function_naming(tokens, index, block, library, func);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_naming(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    func.name = token.value;
    if (next_token.type === typeOp && next_token.value === "(") {
        library_function_takes(tokens, index, block, library, func);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_takes(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeOp && next_token.value === ")") {
        library_function_takes_end(tokens, index, block, library, func);
    } else if(next_token.type === typeId) {
        library_function_takes_type(tokens, index, block, library, func, new Take);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_takes_type(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration, take:Take) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    take.type = token.value;
    if (next_token.type === typeId) {
        library_function_takes_name(tokens, index, block, library, func, take);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_takes_name(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration, take:Take) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    take.name = token.value;
    func.takes.push(take);
    if (next_token.type === typeOp && next_token.value === ",") {
        library_function_takes_(tokens, index, block, library, func);
    } else if (next_token.type === typeOp && next_token.value === ")") {
        library_function_takes_end(tokens, index, block, library, func);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_takes_(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId) {
        library_function_takes_type(tokens, index, block, library, func, new Take);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_takes_end(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    library.functions.push(func);
    if (next_token.type === typeOp && next_token.value === "->") {
        library_function_returns(tokens, index, block, library, func);
    } else if(next_token.type === typeOp && next_token.value === "{") {
        
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_returns(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if (next_token.type === typeId && next_token.value === Nothing) {
        library_function_returns_type(tokens, index, block, library, func);
    } else if (next_token.type === typeId) {
        library_function_returns_type(tokens, index, block, library, func);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_returns_type(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    func.returns = token.value;
    if(next_token.type === typeOp && next_token.value === "{") {
        library_function_body(tokens, index, block, library, func, 0);
    } else {
        start(tokens, index, true, block);
    }

    
}

function library_function_body(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration, func:FunctionDeclaration, field:number) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    if(next_token.type === typeOp && next_token.value === "}" && field === 0) {
        library_function_end(tokens, index, block, library);
    } else {
        // 目前不对方法内部进行解析
        if(next_token.value === "{") {
            field++;
        } else if(next_token.value === "}") {
            field--;
        }
        library_function_body(tokens, index, block, library, func, field);
    }

    
}

function library_function_end(tokens:Token[], index:number, block:ZincBlock,  library:LibraryDeclaration) {
    const token = tokens[index++];
    const next_token:Token|undefined = tokens[index];

    start_library_requires_body(tokens, index, block, library);
}

export {ast};
*/
// const ts = tokens(`
// library A {
// function a () {}

// }
// `);

// ast(ts);

// class E {
//     left:E|T;
//     right:T;
//     op:"&&"|"||";
//     constructor(left:E|T, right:T,op:"&&"|"||") {
//         this.left = left;
//         this.right = right;
//         this.op = op;
//     }
// }
// class E_ {
//     left;
//     op:string;
// }
// class T{
//     left:E|T;
//     right:T;
//     op:"=="|"!=";
//     constructor(left:E|T, right:T,op:"&&"|"||") {
//         this.left = left;
//         this.right = right;
//         this.op = op;
//     }
// }
// class T_ {
//     left;
//     op:string;
// }
// class F {
//     value:string|E;
// }

function isValue (token:Token) {
    return (token.type === typeId && (token.value === True || token.value === False)) || (token.type === typeInt) || token.type === typeReal || token.type === typeString;
}

function isOp (token:Token) {
    return (token.type === typeOp && (token.value === ">" || token.value === "<" || token.value === ">=" || token.value === "<=" || token.value === "+" || token.value === "-" || token.value === "*" || token.value === "/" || token.value === "||" || token.value === "&&" || token.value === "==" || token.value === "!=")) || (token.type === typeInt) || token.type === typeReal || token.type === typeString;
}

function toAst(ts:Token[]) {
    const zincFile = new ZincFile();

    let zincBlock:ZincBlock = null as any;
    let library:LibraryDeclaration = null as any;
    let func:FunctionDeclaration = null as any;
    let take:Take = null as any;



    let field = 0; // {} 的作用域层数

    let state = 0;
    let inZincBlock = false;
    for (let index = 0; index < ts.length; ) {
        const token = ts[index++];
        const next_token:Token|undefined = ts[index];

        if (token.value === "{") {
            field++;
        } else if (token.value === "}") {
            if (field > 0) field--;
        }

        if (token.type === typeComment) {
            if (isEndZinc(token.value)) {
                field = 0;
                state = 0;

                inZincBlock = false;
            }else if (isZinc(token.value)) {
                zincBlock = new ZincBlock;
                zincFile.blocks.push(zincBlock);
                inZincBlock = true;
            }
            continue;
        }
        else if (token.type === typeBlockComment) {
            continue;
        }
        else if (token.type === typeMacro) {
            continue;
        }
        else if(inZincBlock) {
            if (state === 0) {
                if (token.type === typeId && token.value === Library) {
                    library = new LibraryDeclaration;
                    if (next_token.type === typeId) {
                        state = 1;
                    }
                }
            } else if (state === 1) {
                zincBlock.librarys.push(library);
                library.name = token.value;
                if (next_token.type === typeId && next_token.value === Requires) {
                    state = 2;
                } else if (next_token.type === typeOp && next_token.value === "{") {
                    state = 6;
                } else {
                    state = 0;
                }
            } else if(state === 2) {
                if (next_token.type === typeId && next_token.value === Optional) {
                    state = 3;
                } else if (next_token.type === typeId) {
                    state = 4;
                } else {
                    state = 0;
                }
            } else if (state === 3) {
                if (next_token.type === typeId && next_token.value === Optional) {
                    state = 5;
                } else {
                    state = 0;
                }
            } else if (state === 4) {
                library.requires.push(token.value);
                if (next_token.type === typeOp && next_token.value === ",") {
                    state = 2;
                } else if (next_token.type === typeOp && next_token.value === "{") {
                    state = 6;
                } else {
                    state = 0;
                }
            } else if (state === 5) {
                library.requires.push(new RequiresOptional(token.value));
                if (next_token.type === typeOp && next_token.value === ",") {
                    state = 2;
                } else if (next_token.type === typeOp && next_token.value === "{") {
                    state = 6;
                } else {
                    state = 0;
                }
            } else if (state === 6) {
                if (field !== 1) {
                    continue;
                }
                if (next_token.type === typeOp && next_token.value === "}") {
                    state = 7;
                } else if (next_token.type === typeId && next_token.value === Function) {
                    state = 8;
                } else if (next_token.type === typeId && next_token.value === Constant) {
                    state = 6;
                } else if (next_token.type === typeId && next_token.value === Private) {
                    state = 20;
                } else if (next_token.type === typeId && next_token.value === Public) {
                    state = 22;
                } else if (next_token.type === typeId && next_token.value === Type) {
                    state = 6;
                } else if (next_token.type === typeId && next_token.value === Struct) {
                    state = 6;
                } else if (next_token.type === typeId && next_token.value === Interface) {
                    state = 6;
                } else if (next_token.type === typeId) {
                    state = 6;
                }
            } else if (state === 7) {
                state = 0;
            } else if (state === 8) {
                func = new FunctionDeclaration;
                
                if (next_token.type === typeId) {
                    library.functions.push(func);
                    state = 19;
                } else {
                    state = 6;
                }
            }else if (state === 19) {
                func.name = token.value;
                if (next_token.type === typeOp && next_token.value === "(") {
                    state = 9;
                } else {
                    state = 6;
                }
            } else if (state === 9) {
                if (next_token.type === typeOp && next_token.value === ")") {
                    state = 15;
                } else if (next_token.type === typeId) {
                    state = 10;
                } else {
                    state = 6;
                }
            } else if (state === 10) {
                take = new Take;
                take.type = token.value;
                if (next_token.type === typeId) {
                    func.takes.push(take);
                    state = 11;
                } else {
                    state = 6;
                }
            } else if (state === 11) {
                take.name = token.value;
                if (next_token.type === typeOp && next_token.value === ",") {
                    state = 12;
                } else if (next_token.type === typeOp && next_token.value === ")") {
                    state = 15;
                } else {
                    state = 6;
                }
            } else if (state === 12) {
                if (next_token.type === typeId) {
                    state = 13;
                } else {
                    state = 6;
                }
            } else if (state === 13) {
                take = new Take;
                take.type = token.value;
                if (next_token.type === typeId) {
                    func.takes.push(take);
                    state = 14;
                } else {
                    state = 6;
                }
            } else if (state === 14) {
                take.name = token.value;
                if (next_token.type === typeOp && next_token.value === ",") {
                    state = 12;
                } else if (next_token.type === typeOp && next_token.value === ")") {
                    state = 15;
                } else {
                    state = 6;
                }
            } else if (state === 15) {
                if (next_token.type === typeOp && next_token.value === "->") {
                    state = 16;
                } else if (next_token.type === typeOp && next_token.value === "{") {
                    state = 18;
                } else {
                    state = 6;
                }
            } else if (state === 16) {
                if (next_token.type === typeId) {
                    state = 17
                } else {
                    state = 6;
                }
            } else if (state === 17) {
                func.returns = token.value;
                if (next_token.type === typeOp && next_token.value === "{") {
                    state = 18;
                } else {
                    state = 6;
                }
            } else if (state === 18) {
                if (field === 2 && next_token.type === typeOp && next_token.value === "}") {
                    state = 6;
                }
                /*
                else if (next_token.type === typeId && next_token.value === If) {
                    state = 20;
                } else if (next_token.type === typeId && next_token.value === While) {

                } else if (next_token.type === typeId && next_token.value === For) {

                } else if (next_token.type === typeId && next_token.value === Return) {

                } else if (next_token.type === typeId && next_token.value === Debug) {

                } else if (next_token.type === typeId && next_token.value === Static) {

                } else if (next_token.type === typeId) { // 赋值或者定义

                }*/
            } else if (state === 20) {
                if (next_token.type === typeId && next_token.value === Function) {
                    state = 21;
                } else {
                    state = 6;
                }
            } else if (state === 21) {
                func = new FunctionDeclaration;
                func.flags.push("private");
                if (next_token.type === typeId) {
                    library.functions.push(func);
                    state = 19;
                } else {
                    state = 6;
                }
            } else if (state === 22) {
                if (next_token.type === typeId && next_token.value === Function) {
                    state = 23;
                } else {
                    state = 6;
                }
            } else if (state === 23) {
                func = new FunctionDeclaration;
                func.flags.push("public");
                if (next_token.type === typeId) {
                    library.functions.push(func);
                    state = 19;
                } else {
                    state = 6;
                }
            } else if (state === 24) { // 一元

            }
        } else {
            continue;
        }

        

    }
    console.log(JSON.stringify(zincFile, null , 2))
    return zincFile;
}

// class 
/*
const zincFile = toAst(tokens(`
//! zinc
}}}}library A {
    function a () {}
    function b () {}
}
//! endzinc
`))
console.log(JSON.stringify(zincFile,null, 2))*/

export {
    FunctionDeclaration,
    LibraryDeclaration,
    toAst
};