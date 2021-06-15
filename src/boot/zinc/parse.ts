
import {
	ArrayType,
	DynamicArray,
	Func,
	FunctionInterface,
	Global,
	Interface,
	InterfaceArray,
	Library,
	Local,
	Member,
	Method,
	ModifierType,
	Position,
	Range,
	Struct,
	StructArray,
	TypePonint
} from "./ast";
import {Take} from "../jass/ast";
import {tokens, Token} from "./tokens";

import {ZincKeywords} from "../provider/keyword";
import {retainZincBlock} from "../tool";

class ZincTokenError {
	public message:string;
	public token:Token;

	constructor(token:Token, message:string) {
		this.token = token;
		this.message = message;
	}
}

class Program {
	public librarys: Library[] = [];
	public zincTokenErrors:ZincTokenError[] = [];
}

function isKeyword (value:string) {
	return ZincKeywords.includes(value);
}

class BodyType {
	public type: "if" | "for" | "while" | "do" | "static" | "debug" = null as any;
	public in:boolean = false;
	public inStart: boolean = false;
	public state: number = 0;

	constructor(type: "if" | "for" | "while" | "do" | "static" | "debug") {
		this.type = type;
	}

}

class BodyStack extends Array<BodyType> {
	public last() {
		return this[this.length - 1];
	}
	public empty():boolean {
		return this.length == 0;
	}
}

class ModifierBodyType {
	public type:ModifierType;
	constructor(type:ModifierType) {
		this.type = type;
	}
}

// 解析zinc代码
function parse(content:string) {
	console.time("parse zinc");
	console.time("tokens");
	const ts = tokens(content);
	console.timeEnd("tokens");

	const program = new Program();


	let inLibrary = false;
	let inLibraryStart = false;
	let libraryState = 0;
	let library:Library|null = null;

	let inGlobal = false;

	let inFunction = false;
	let inFunctionStart = false;
	let functionState = 0;
	let func:Func|null = null;
	
	let inMethod = false;
	let inMethodStart = false;
	let methodState = 0;
	let method:Method|null = null;

	let take:Take|null = null;

	let bodyField = 0;

	// 记录public private 块
	const modifierTypes:ModifierBodyType[] = [];
	const lastModifierType = () => {
		return modifierTypes[modifierTypes.length - 1];
	};
	let modifierType:ModifierType|null = null;
	// 记录public private 块
	const structModifierTypes:ModifierBodyType[] = [];
	const lastStructModifierType = () => {
		return structModifierTypes[structModifierTypes.length - 1];
	};

	let inStruct = false;
	let inStructStart = false;
	let structState = 0;
	let struct: Struct|null = null;

	let memberState = 0;
	let member:Member|null = null;
	let members:Member[] = []; 
	const lastMember = () => {
		return members[members.length - 1];
	};

	let globalState = 0;
	let global:Global|null = null;
	// 用于integer a,b,c;这种定义
	let globals:Global[] = []; 
	const lastGlobal = () => {
		return globals[globals.length - 1];
	};

	let isStatic = false;
	let isConstant = false;
	let isArr = false;

	// 这里暂时用不到，除非需要解析if for while体
	// const bodyStack = new BodyStack();


	for (let index = 0; index < ts.length; index++) {
		const token = ts[index];
		
		const pushError = (message:string) => {
			program.zincTokenErrors.push(new ZincTokenError(token, message));
		};

		// 期望字符
		const pushExpectedError = (tokenValue:string) => {
			pushError(`Expected '${tokenValue}', got token with value '${token.value}'!`);
		};
		// 非法token
		const pushErrorToken = () => {
			pushError(`Uncaught SyntaxError: Unexpected token '${token.value}'!`);
		}
		const reset = (type:"function"|"library" | "struct" | "method" | "member" | "global") => {
			const resetBodyField = () => {
				bodyField = 0;
			};
			const resetModifier = () => {
				modifierType = null;
			};
			const resetGlobal = () => {
				globalState = 0;
				global = null;
				isArr = false;
				isConstant = false;
			};
			const resetFunction = () => {
				inFunction = false;
				inFunctionStart = false;
				functionState = 0;
				func = null;
				resetBodyField();
				resetGlobal();
			};
			const resetMethod = () => {
				inMethod = false;
				inMethodStart = false;
				methodState = 0;
				method = null;
				resetBodyField();
				resetMember();
			};
			const resetLibrary = () => {
				inLibrary = false;
				inLibraryStart = false;
				libraryState = 0;
				library = null;
			};
			const resetMember = () => {
				memberState = 0;
				member = null;
				isArr = false;
				isConstant = false;
				isStatic = false;
			};

			const resetStruct = () => {
				inStruct = false;
				inStructStart = false;
				structState = 0;
				struct = null;
				structModifierTypes.length = 0;
				resetMember();
			};

			
			if (type == "function") {
				resetFunction();
			} else if (type == "library") {
				resetLibrary();
				resetModifier();
				resetFunction();
				resetMethod();
			} else if (type == "struct") {
				resetFunction();
				resetStruct();
				resetMethod();
			}  else if (type == "method") {
				resetMethod();
				resetFunction();
				resetMember();
			} else if (type == "member") {
				resetMember();
			} else if (type == "global") {
				resetGlobal();
			}
		};
		const parseBody = (type:"func"|"method" = "func") => {
			if (token.isOp() && token.value == "{") {
				bodyField++;
			} else if (token.isOp() && token.value == "}") {
				if (bodyField > 0) {
					bodyField--;
				} else {
					if (type == "func") {
						(<Func>func).loc.end = new Position(token.line, token.end);
						reset("function");
					} else {
						(<Method>method).loc.end = new Position(token.line, token.end);
						reset("method");
					}
				}
			}
		};
		const parseFunction = (type:"func"|"method" = "func") => {
			if (type == "func") {
				if (inFunctionStart) {
					parseBody();
				} else if (token.isOp() && token.value == "{") {
					inFunctionStart = true;
				} else if (functionState == 0) {
					if (token.isOp() && token.value == "(") {
						functionState = 2;
					} else if (token.isId()) {
						(<Func>func).name = token.value;
						functionState = 1;
					} else {
						pushErrorToken();
						functionState = 1;
					}
				} else if (functionState == 1) {
					if (token.isOp() && token.value == "(") {
						functionState = 2;
					} else {
						pushExpectedError("(");
					}
				} else if ((functionState >= 2 || functionState <= 4) && token.isOp() && token.value == ")") {
					functionState = 5;
				} else if (functionState == 2) { // 参数类型
					if (token.isOp() && token.value == ",") {
						pushError("缺失参数!");
					} else if (token.isId()) {
						take = new Take(token.value, "");
						take.loc.start = new Position(token.line, token.position);
						(<Func>func).takes.push(take);
						functionState = 3;
					} else {
						pushError("未找到参数类型!");
						functionState = 4;
					}
				} else if (functionState == 3) { // 参数命名
					if (token.isOp() && token.value == ",") {
						pushError(`参数未命名!`);
						functionState = 2;
					} else if (token.isId()) {
						(<Take>take).name = token.value;
						(<Take>take).loc.end = new Position(token.line, token.end);
						functionState = 4;
					} else {
						pushErrorToken();
						functionState = 4;
					}
				} else if (functionState == 4) { // ,
					if (token.isOp() && token.value == ",") {
						functionState = 2;
					} else {
						pushExpectedError(",");
						functionState = 2;
					}
				} else if (functionState == 5) {
					 if (token.isOp() && token.value == "->") {
						functionState = 6;
					} else {
						pushExpectedError("-> or {");
					}
				} else if (functionState == 6) {
					if (token.isId()) {
						(<Func>func).returns = token.value;
						functionState = 7;
					} else {
						pushErrorToken();
					}
				} else if (functionState == 7) {
					pushExpectedError("{");
				}
			} else {
				if (inMethodStart) {
					parseBody("method");
				} else if (token.isOp() && token.value == "{") {
					inMethodStart = true;
				} else if (methodState == 0) {
					if (token.isOp() && token.value == "(") {
						methodState = 2;
					} else if (token.isId() && token.value == "operator") { // 判断是不是运算符重载
						methodState = 8;
						const tempStruct = struct?.methods.pop();
						if (tempStruct) {
							struct?.operators.push(tempStruct);
						}
					} else if (token.isId()) {
						(<Method>method).name = token.value;
						methodState = 1;
					} else {
						pushErrorToken();
						methodState = 1;
					}
				} else if (methodState == 1) {
					if (token.isOp() && token.value == "(") {
						methodState = 2;
					} else {
						pushExpectedError("(");
					}
				} else if ((methodState >= 2 || methodState <= 4) && token.isOp() && token.value == ")") {
					methodState = 5;
				} else if (methodState == 2) { // 参数类型
					if (token.isOp() && token.value == ",") {
						pushError("缺失参数!");
					} else if (token.isId()) {
						take = new Take(token.value, "");
						take.loc.start = new Position(token.line, token.position);
						(<Method>method).takes.push(take);
						methodState = 3;
					} else {
						pushError("未找到参数类型!");
						methodState = 4;
					}
				} else if (methodState == 3) { // 参数命名
					if (token.isOp() && token.value == ",") {
						pushError(`参数未命名!`);
						methodState = 2;
					} else if (token.isId()) {
						(<Take>take).name = token.value;
						(<Take>take).loc.end = new Position(token.line, token.end);
						methodState = 4;
					} else {
						pushErrorToken();
						methodState = 4;
					}
				} else if (methodState == 4) { // ,
					if (token.isOp() && token.value == ",") {
						methodState = 2;
					} else {
						pushExpectedError(",");
						methodState = 2;
					}
				} else if (methodState == 5) {
					 if (token.isOp() && token.value == "->") {
						methodState = 6;
					} else {
						pushExpectedError("-> or {");
					}
				} else if (methodState == 6) {
					if (token.isId()) {
						(<Method>method).returns = token.value;
						methodState = 7;
					} else {
						pushErrorToken();
					}
				} else if (methodState == 7) {
					pushExpectedError("{");
				} else if (methodState == 8) { // 如果都到 operator 关键字时,就进入这里，因为operator解析无意义
				}
			}
			
		};
		const parseMember = () => {
			const pushMember = () => {
				(<Struct>struct).members.push((<Member>member), ...members);
			};
			if (memberState == 0) {
				if (token.isId()) {
					reset("member");
					member = new Member(token.value, "");
					member.isStatic = isStatic;
					member.isConstant = isConstant;
					if (modifierType) {
						member.tag = modifierType;
					} else if (structModifierTypes.length > 0) {
						member.tag = lastStructModifierType().type;
					}
					member.loc.start = new Position(token.line, token.position);
					memberState = 1;
				} else {
					// 存在不确定情况，可能误报，因此当前什么都不做
					// 
					// pushError("类型错误");
				}
			} else if (memberState == 1) {
				if (token.isId()) {
					(<Member>member).name = token.value;
					memberState = 2;
				} else {
					memberState = 0;
				}
			} else if (memberState == 2) {
				if (token.isOp() && token.value == ";") {
					(<Member>member).loc.end = new Position(token.line, token.end);
					pushMember();
					reset("member");
				} else if (token.isOp() && token.value == "=") {
					pushMember();
					memberState = 6;
				} else if (token.isOp() && token.value == "[") {
					if (members.length > 0) {
						lastMember().isArray = true;
					} else {
						(<Member>member).isArray = true;
					}
					memberState = 3;
				} else if (token.isOp() && token.value == ",") {
					memberState = 7;
				} else {
					pushErrorToken();
					// 放弃
					memberState = 6;
				}
			} else if (memberState == 3) {
				if (token.isInt()) {
					if (members.length > 0) {
						lastMember().size = parseInt(token.value);
					} else {
						(<Member>member).size = parseInt(token.value);
					}
					memberState = 4;
				} else {
					pushError("Wrong [size] definition!");
					// 放弃
					memberState = 6;
				}
			} else if (memberState == 4) {
				if (token.isOp() && token.value == "]") {
					memberState = 5;
				} else {
					pushExpectedError("]");
					memberState = 6;
				}
			} else if (memberState == 5) {
				if (token.isOp() && token.value == ";") {
					(<Member>member).loc.end = new Position(token.line, token.end);
					pushMember();
					reset("member");
				} else {
					pushError("Missing closing symbol ';'!");
					memberState = 6;
				}
			} else if (memberState == 6) {
				if (token.isOp() && token.value == ";") {
					reset("member");
				}
			} else if (methodState == 7) {
				if (token.isId()) {
					const m:Member = new Member((<Member>member).type, "");
					m.tag = (<Member>member).tag;
					m.isConstant = (<Member>member).isConstant;
					m.isStatic = (<Member>member).isStatic;
					m.loc.start = new Position(token.line, token.position);
					m.name = token.value;
					m.loc.end = new Position(token.line, token.end);
					members.push(m);
					methodState = 2;
				} else {
					pushErrorToken();
					methodState = 6;
				}
			}
			
		};
		const parseGlobal = () => {
			const pushGlobal = () => {
				(<Library>library).globals.push((<Global>global), ...globals);
			};
			if (globalState == 0) {
				if (token.isId()) {
					reset("global");
					global = new Global(token.value, "");
					global.isConstant = isConstant;
					if (modifierType) {
						global.tag = modifierType;
					} else if (modifierTypes.length > 0) {
						global.tag = lastModifierType().type;
					}
					global.loc.start = new Position(token.line, token.position);
					globalState = 1;
				} else {
					// 存在不确定情况，可能误报，因此当前什么都不做
					// 
					// pushError("类型错误");
				}
			} else if (globalState == 1) {
				if (token.isId()) {
					(<Global>global).name = token.value;
					globalState = 2;
				} else {
					globalState = 0;
				}
			} else if (globalState == 2) {
				if (token.isOp() && token.value == ";") {
					(<Global>global).loc.end = new Position(token.line, token.end);
					pushGlobal();
					reset("global");
				} else if (token.isOp() && token.value == "=") {
					pushGlobal();
					globalState = 6;
				} else if (token.isOp() && token.value == "[") {
					if (globals.length > 0) {
						lastGlobal().isArray = true;
					} else {
						(<Global>global).isArray = true;
					}
					globalState = 3;
				} else if (token.isOp() && token.value == ",") {
					globalState = 7;
				} else {
					// pushErrorToken();
					// 放弃
					globalState = 6;
				}
			} else if (globalState == 3) {
				if (token.isInt()) {
					if (globals.length > 0) {
						lastGlobal().size = parseInt(token.value);
					} else {
						(<Global>global).size = parseInt(token.value);
					}
					globalState = 4;
				} else if (token.isOp() && token.value == "]") {
					globalState = 5;
				} else {
					// 放弃
					globalState = 6;
				}
			} else if (globalState == 4) {
				if (token.isOp() && token.value == "]") {
					globalState = 5;
				} else {
					pushExpectedError("]");
					globalState = 6;
				}
			} else if (globalState == 5) {
				if (token.isOp() && token.value == ";") {
					(<Global>global).loc.end = new Position(token.line, token.end);
					pushGlobal();
					reset("global");
				} else {
					pushError("Missing closing symbol ';'!");
					globalState = 6;
				}
			} else if (globalState == 6) {
				if (token.isOp() && token.value == ";") {
					reset("global");
				}
			} else if (globalState == 7) {
				if (token.isId()) {
					const g:Global = new Global((<Global>global).type, "");
					g.tag = (<Global>global).tag;
					g.isConstant = (<Global>global).isConstant;
					g.loc.start = new Position(token.line, token.position);
					g.name = token.value;
					g.loc.end = new Position(token.line, token.end);
					globals.push(g);
					globalState = 2;
				} else {
					pushErrorToken();
					globalState = 6;
				}
			}
		};
		const parseStructBody = () => {
			if (token.isId() && token.value == "method") {
				reset("method");
				method = new Method("");
				if (modifierType) {
					method.tag = modifierType;
				} else if (structModifierTypes.length > 0) {
					method.tag = lastStructModifierType().type;
				}
				method.isStatic = isStatic;
				method.loc.start = new Position(token.line, token.position);
				(<Struct>struct).methods.push(method);
				inMethod = true;
			} else if (inMethod) {
				parseFunction("method");
			} else if (modifierType != null && token.isOp() && token.value == "{") {
				structModifierTypes.push(new ModifierBodyType(modifierType));
			} else if (token.isId() && token.value == "private") {
				modifierType = "private";
			} else if (token.isId() && token.value == "public") {
				modifierType = "public";
			} else if (structModifierTypes.length > 0 && token.isOp() && token.value == "}") {
				structModifierTypes.pop();
			} else if (token.isId() && token.value == "static") {
				isStatic = true;
			} else if (token.isId() && token.value == "constant") {
				isConstant = true;
			}  else if (token.isOp() && token.value == "}") {
				(<Struct>struct).loc.end = new Position(token.line, token.end);
				reset("struct");
			} else { // member type
				// 解析struct成员类型，区别于其他解析方式，当类型找到了不会马上push到struct中，而是等到见到 ';' 后才push进去
				parseMember();
			}	

			if (modifierType && token.isOp() && !(token.value == "public" || token.value == "private" || token.value == "constant" || token.value == "static")) {
				modifierType = null;
			}
			if (isStatic && !(token.value == "static" || token.value == "constant")) {
				isStatic = false;
			}
			if (isConstant && token.value != "constant") {
				isConstant = false;
			}
		};
		const parseStruct = () => {
			if (inStructStart) {
				parseStructBody();
			} else if (token.isOp() && token.value == "{") {
				inStructStart = true;
			} else if (structState == 0) {
				if (token.isId() && token.value == "extends") {
					structState = 2;
				} else if (token.isId()) {
					(<Struct>struct).name = token.value;
					structState = 1;
				} else {
					pushErrorToken();
					structState = 3;
				}
			} else if (structState == 1) { // 等待extends
				if (token.isId() && token.value == "extends") {
					structState = 2;
				} else {
					pushExpectedError("extends");
					structState = 3;
				}
			} else if (structState == 2) { // 继承名称
				if (token.isId()) {
					(<Struct>struct).extends = token.value;
				} else {
					pushErrorToken();
				}
				structState = 3;
			} else if (structState == 3) {
				pushErrorToken();
			} else {
				// pushErrorToken();
			}
		};

		if (token.isId() && token.value == "library") {
			reset("library");
			inLibrary = true;
			libraryState = 0;
			library = new Library("");
			library.loc.start = new Position(token.line, token.position);
			program.librarys.push(library);
		} else if (inLibrary) {
			if (inLibraryStart) {
				if (token.isId() && token.value == "struct") {
					reset("struct");
					struct = new Struct("");
					if (modifierType) {
						struct.tag = modifierType;
					} else if (modifierTypes.length > 0) {
						struct.tag = lastModifierType().type;
					}
					struct.loc.start = new Position(token.line, token.position);
					(<Library>library).structs.push(struct);
					inStruct = true;
				} else if (inStruct) {
					// reset("method");
					// reset("member");
					parseStruct();
				} else if (inFunction) {
					parseFunction();
				} else if (token.isId() && token.value == "function") { // 这个if理应在 else if (inFunction) 前，但因为可能在function body块中方法参数存在function function_name会导致错误
					reset("function");
					func = new Func("");
					if (modifierType) {
						func.tag = modifierType;
					} else if (modifierTypes.length > 0) {
						func.tag = lastModifierType().type;
					}
					func.loc.start = new Position(token.line, token.position);
					(<Library>library).functions.push(func);
					inFunction = true;
				} else if (modifierType != null && token.isOp() && token.value == "{") {
					modifierTypes.push(new ModifierBodyType(modifierType));
				} else if (token.isId() && token.value == "private") {
					modifierType = "private";
				} else if (token.isId() && token.value == "public") {
					modifierType = "public";
				} else if (token.isId() && token.value == "constant") {
					isConstant = true;
				} else if (modifierTypes.length > 0 && token.isOp() && token.value == "}") {
					modifierTypes.pop();
				} else if (token.isOp() && token.value == "}") {
					reset("library");
				} else {
					parseGlobal();
				}

				if (modifierType && token.value != "public" && token.value != "private") {
					// struct中有自己modifier修饰
					if (!inStructStart)
						modifierType = null;
				}

			} else if (token.isOp() && token.value == "{") {
				inLibraryStart = true;
			} else if (libraryState == 0) {
				if (token.isId() && token.value == "requires") {
					libraryState = 2;
				} else if (token.isId()) {
					(<Library>library).name = token.value;
					libraryState = 1;
				} else {
					pushExpectedError("requires");
					libraryState = 4;
				}
			} else if (libraryState == 1) { // requires
				if (token.isId() && token.value == "requires") {
					libraryState = 2;
				} else {
					pushExpectedError("requires");
					libraryState = 4;
				}
			} else if (libraryState == 2) {
				if (token.isId()) {
					(<Library>library).requires.push(token.value);
					libraryState = 3;
				} else {
					pushErrorToken();
					libraryState = 2;
				}
			} else if (libraryState == 3) {
				if (token.isOp() && token.value == ",") {
					libraryState = 2;
				} else {
					pushErrorToken();
					libraryState = 3;
				}
			} else if (libraryState == 4) {
				pushErrorToken();
			}
		} else {
			// pushExpectedError("library");
		}

	}
	console.timeEnd("parse zinc");
	return program;

}

function parseZincBlock (content:string) {
	// 确保换行符
	content = content.replace(/\r\n/g, "\n");
	
	return parse(retainZincBlock(content));

}

function parseZincFile(path:string) {

}

export {
	parse,
	parseZincBlock,
	parseZincFile
};

/*
parseZincBlock(`//! zinc
a
//! endzinc
methoda`);*/

// 测试代码

/*
console.time("parse");

const p = parse(`library WhileTest
{
    // 一个结构体
    struct A
    {
        integer x,y,z;
    }

    // 一个接口
    interface B
    {
        method move();
    }

    // 一个拥有2万储存空间的结构体
    struct[20000] C
    {
        real a,b,c;
        string s,t;
    }

    // 一个拥有3万储存空间的接口
    interface[30000] D
    {
        integer meh;
        method transform(integer a) -> integer;
    }

    // 一个数组结构体
    struct myArr[]
    {
        static constant integer meh = 30004;
        integer a;
        integer b;
    }

    // 一个拥有1万储存空间的数组结构体
    struct myErr[10000]
    {
        integer x,y,z;
    }

    interface F
    {
        method balls(integer x) = null; // 这个方法默认为空
        method bells(integer y) -> real = 0.0 ; // 这个方法默认会将实数 0.0 作为返回值

        // 接口内的一个静态的create方法
        static method create();
    }

    struct G
    {
        static method onCast()
        {
            KillUnit(GetTriggerUnit());
        }

        static method onInit() {
            // 一个静态的方法，同样会在地图初始化时被调用
            trigger t= CreateTrigger();

            // 与vJass的function G.onCast的写法不同
            TriggerAddAction(t, static method G.onCast);
        }
        integer x;

        // 运算符重载，重新定义<的运算规则
        method operator< (G other) -> boolean
        {
            return (this.x < other.x)
        }

        // 运算符重载，重新定义[]的运算规则
        method operator[](integer x) -> real
        {
            return x*2.5;
        }

        // 定义结构体是否为只读类型
        method operator readOnly() -> integer
        {
            return 0;
        }
    }

    module H
    {
        method kill() { BJDebugMsg("Kill it"); }
    }

    struct K
    {
        module H; // 实现模块H
        optional module XX; // 可选地实现模块XX
        delegate G myg; // 一个委托
    }
}`);
// const content = readFileSync("C:/Users/Administrator/Desktop/JiuTuApi.j").toString();
console.log(JSON.stringify(parse(`library a {

	struct a {
		method a (integer a ) {}
	}
}`), null, "  "));
console.log(JSON.stringify(p.zincTokenErrors, null, "  "))

console.timeEnd("parse");
*/