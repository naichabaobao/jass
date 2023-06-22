
import { Position, Range } from "../jass/ast";
import {Program, Take, Library, Struct, Member, Global, Func, Local, Method, ModifierType, JassError, LineComment} from "../jass/ast";
import {Token, tokenize} from "../jass/tokens";

import {ZincKeywords} from "../jass/keyword";
import {retainZincBlock} from "../tool";




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



/**
 * 解析zinc代码
 * @param content 
 * @param isZincFile 是否后缀为.zn，当前版本临时定义，后续参数增加后去除
 * @returns 
 */
function parseByTokens(tokens:Token[], isZincFile:boolean = false) {

	
	
	const comments:Token[] = [];
	const matchText = (line:number) => {
		const texts: string[] = [];
		for (let index = line; index > 0; index--) {
			let comment:Token|undefined = undefined;
			if ((comment = comments.find((token) => token.line == index - 1))) {
				// const text = comment.value.replace("//", "");
				// texts.push(text);
				const lineComment: LineComment = new LineComment(comment.value);
				lineComment.loc.setRange(new Range(new Position(comment.line, comment.position), new Position(comment.line, comment.end)));
			} else {
				break;
			}
		}
		return texts.reverse().join("\n");
		// return comments.find((token) => token.line == line - 1)?.value.replace("//", "") ?? "";
	};
	const findLineComments = (line:number):LineComment[] => {
		const lineComments:LineComment[] = [];
		for (let index = line; index > 0; index--) {
			let comment:Token|undefined = undefined;
			if ((comment = comments.find((token) => token.line == index - 1))) {
				// const text = comment.value.replace("//", "");
				// texts.push(text);
				const lineComment: LineComment = new LineComment(comment.value);
				lineComment.loc.setRange(new Range(new Position(comment.line, comment.position), new Position(comment.line, comment.end)));
				lineComments.push(lineComment);
			} else {
				break;
			}
		}
		return lineComments;
	};
	let inZinc = false;
	// 无视掉所有非zinc块内的token
	tokens = tokens.filter((token, index, ts) => {
		if (token.isComment() && /\/\/![ \t]+zinc\b/.test(token.value)) {
			inZinc = true;
			return false;
		} else if (token.isComment() && /\/\/![ \t]+endzinc\b/.test(token.value)) {
			inZinc = false;
			return false;
		} else if (token.isComment()) {
			comments.push(token);
			return false;
		}
		return (isZincFile || inZinc) && !token.isBlockComment() && !token.isNewLine();
	});

	const program = new Program();


	let inLibrary = false;
	let inLibraryStart = false;
	let libraryState = 0;
	let library:Library|null = null;
	const resetLibrary = () => {
		inLibrary = false;
		inLibraryStart = false;
		libraryState = 0;
		library = null;
	};

	let inGlobal = false;

	let inFunction = false;
	let inFunctionStart = false;
	let functionState = 0;
	let func:Func|null = null;
	const resetFunc = () => {
		inFunction = false;
		inFunctionStart = false;
		functionState = 0;
		func = null;
	};
	
	let inMethod = false;
	let inMethodStart = false;
	let methodState = 0;
	let method:Method|null = null;
	const resetMethod = () => {
		inMethod = false;
		inMethodStart = false;
		methodState = 0;
		method = null;
	};

	let take:Take|null = null;


	//#region 识别修饰符
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
	//#endregion
	let inStruct = false;
	let inStructStart = false;
	let structState = 0;
	let struct: Struct|null = null;
	const resetStruct = () => {
		inStruct = false;
		inStructStart = false;
		structState = 0;
		struct = null;
	};

	let memberState = 0;
	let member:Member|null = null;
	let members:Member[] = []; 
	const lastMember = () => {
		return members[members.length - 1];
	};
	const resetMember = () => {
		members.length = 0;
		memberState = 0;
		members.length = 0;
		member = null;
	};

	let localState = 0;
	let locals:Local[] = [];
	const lastLocal = () => {
		return locals[locals.length - 1];
	};
	const resetLocal = () => {
		localState = 0;
		locals.length = 0;
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


	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		
		const pushErrorOld = (message:string) => {
			// program.zincTokenErrors.push(new ZincTokenError(token, message));
		};

		// 期望字符
		const pushExpectedError = (tokenValue:string) => {
			pushErrorOld(`Expected '${tokenValue}', got token with value '${token.value}'!`);
		};
		// 非法token
		const pushErrorToken = () => {
			pushErrorOld(`Uncaught SyntaxError: Unexpected token '${token.value}'!`);
		}
		/**
		 * @deprecated
		 * @param type 
		 */
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
				isArr = false;
				isConstant = false;
				isStatic = false;
				members = [];
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
		const parseLocal = (type:"func"|"method" = "func") => {
			if (token.isOp() && token.value == ";") {
				(type == "func" ? (<Func>func) : (<Method>method)).locals.push(...locals.map( (local, index, ms) => {
					if (index != 0) {
						local.type = ms[0].type;
						local.loc.start = ms[0].loc.start;
					}
					local.loc.end = new Position(token.line, token.end);
					return local;
				}));
			} else if (token.isOp() && token.value == "=") {
				localState = 6;
			} else if (localState == 0) {
				if (token.isId()) {
					resetLocal();
					const local = new Local(token.value, "");
					local.option.style = "zinc";
					local.type = token.value;
					local.loc.start = new Position(token.line, token.position);
					locals.push(local);
					localState = 1;
				} else {
				}
			} else if (localState == 1) {
				if (token.isOp() && token.value == ",") {

				} else if (token.isId()) {
					if (lastLocal().name == "") {
						lastLocal().name = token.value;
						lastLocal().nameToken = token;
						lastLocal().text = matchText(token.line);
						lastLocal().lineComments.push(...findLineComments(token.line));
					} else {
						const local = new Local("", token.value);
						local.option.style = "zinc";
						local.nameToken = token;
						local.text = matchText(token.line);
						lastLocal().lineComments.push(...findLineComments(token.line));
						locals.push(local);
					}
					localState = 2;
				} else {
				}
			} else if (localState == 2) {
				if (token.isOp() && token.value == "[") {
					lastLocal().isArray = true;
					localState = 3;
				} else if (token.isOp() && token.value == ",") {
					localState = 1;
				} else {
				}
			} else if (localState == 3) {
				if (token.isInt()) {
					lastLocal().size = parseInt(token.value);
					localState = 4;
				} else if (token.isOp() && token.value == ",") {
					localState = 1;
				} else if (token.isOp() && token.value == "]") {
					localState = 5;
				} else {
				}
			} else if (localState == 4) {
				if (token.isOp() && token.value == "]") {
					localState = 5;
				} else if (token.isOp() && token.value == ",") {
					localState = 1;
				} else {
				}
			} else if (localState == 5) {
				if (token.isOp() && token.value == ",") {
					localState = 1;
				}
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
						resetFunc();
					} else {
						(<Method>method).loc.end = new Position(token.line, token.end);
						resetMethod();
					}
					return;
				}
			}
			if (bodyField == 0) {
				parseLocal(type);
			}
			if (type == "func") {
				(<Func>func).tokens.push(token);
			} else {
				(<Method>method).tokens.push(token);
			}
		};
		const parseFunction = (type:"func"|"method" = "func") => {
			if (type == "func") {
				if (inFunctionStart) {
					parseBody();
				} else if (token.isOp() && token.value == "{") {
					inFunctionStart = true;
				} else if (token.isOp() && token.value == "(") {
					functionState = 1;
				} else if ((functionState >= 1 || functionState <= 3) && token.isOp() && token.value == ")") {
					functionState = 4;
				} else if (token.isOp() && token.value == "->") {
					functionState = 5;
				} else if (functionState == 0) {
					if (token.isId()) {
						if ((<Func>func).name == "") {
							(<Func>func).name = token.value;
							(<Func>func).nameToken = token;
						} else {

						}
					} else {
					}

				} else if (functionState == 1) {
					if (token.isOp() && token.value == ",") {
						
					} else if (token.isId()) {
						take = new Take(token.value, "");
						take.loc.start = new Position(token.line, token.position);
						functionState = 2;
					} else {

					}
				} else if (functionState == 2) { // 参数类型
					if (token.isOp() && token.value == ",") {
						functionState = 1;
					} else if (token.isId()) {
						(<Take>take).name = token.value;
						(<Take>take).nameToken = token;
						(<Take>take).loc.end = new Position(token.line, token.end);
						(<Func>func).takes.push((<Take>take));
						functionState = 3;
					} else {

					}
				} else if (functionState == 3) { // ,
					if (token.isOp() && token.value == ",") {
						functionState = 1;
					} else {

					}
				} else if (functionState == 4) {

				} else if (functionState == 5) {
					if (token.isId()) {
						if ((<Func>func).returns) {

						} else {
							if (token.value == "nothing") {

							} else {
								(<Func>func).returns = token.value;
							}
						}
					} else {
	
					}
				}
			} else {
				if (inMethodStart) {
					parseBody("method");
				} else if (token.isOp() && token.value == "{") {
					inMethodStart = true;
				} else if (token.isOp() && token.value == "(") {
					methodState = 2;
				} else if (token.isId() && token.value == "operator") { // 判断是不是运算符重载
					(<Method>method).isOperator = true;
					methodState = 1;
				} else if (token.isOp() && token.value == "->") {
					methodState = 6;
				} else if (methodState >= 2 && methodState <= 4 && token.value == ")") {
					methodState = 5;
				} else if (methodState == 0) {
					if (token.isId()) {
						if ((<Method>method).name == "") {
							(<Method>method).name = token.value;
							(<Method>method).nameToken = token;
						} else {

						}
					} else {

					}
				} else if (methodState == 1) {
					if (token.isId() || token.isOp()) {
						(<Method>method).name += token.value;
						(<Method>method).nameToken = token;
					} else {

					}
					
				} else if (methodState == 2) {
					if (token.isOp() && token.value == ",") {
						
					} else if (token.isId()) {
						take = new Take(token.value, "");
						take.loc.start = new Position(token.line, token.position);
						methodState = 3;
					} else {

					}
				} else if (methodState == 3) { // 参数类型
					if (token.isOp() && token.value == ",") {
						methodState = 2;
					} else if (token.isId()) {
						(<Take>take).name = token.value;
						(<Take>take).nameToken = token;
						(<Take>take).loc.end = new Position(token.line, token.end);
						(<Method>method).takes.push((<Take>take));
						methodState = 4;
					} else {

					}
				} else if (methodState == 4) { // 参数命名
					if (token.isOp() && token.value == ",") {
						methodState = 2;
					} else {

					}
				} else if (methodState == 5) {
					// 参数解析结束
				} else if (methodState == 6) {
					if (token.isId()) {
						(<Method>method).returns = token.value;
					} else {
	
					}
				}
			}
			
		};
		const parseMember = () => {
			if (token.isOp() && token.value == ";") {
				// (<Struct>struct).members.push(...members.map( (member, index, ms) => {
				// 	if (index != 0) {
				// 		member.type = ms[0].type;
				// 		member.isStatic = ms[0].isStatic;
				// 		member.isConstant = ms[0].isConstant;
				// 		member.tag = ms[0].tag;
				// 		member.loc.start = ms[0].loc.start;
				// 	}
				// 	member.loc.end = new Position(token.line, token.end);
					
				// 	return member;
				// }));
				// members = [];
				if (member) {
					member.loc.end = new Position(token.line, token.end);
					(<Struct>struct).members.push(member);
				}
				resetMember();
			} else if (token.isOp() && token.value == "=") {
				memberState = 6;
			} else if (memberState == 0) {
				if (token.isId()) {
					resetMember();
					member = new Member(token.value, "");
					member.option.style = "zinc";
					member.type = token.value;
					member.isStatic = isStatic;
					member.isConstant = isConstant;
					if (modifierType) {
						member.tag = modifierType;
					} else if (structModifierTypes.length > 0) {
						member.tag = lastStructModifierType().type;
					}
					member.loc.start = new Position(token.line, token.position);
					members.push(member);
					memberState = 1;
				} else {
				}
			} else if (memberState == 1) {
				if (token.isOp() && token.value == ",") {

				} else if (token.isId()) {
					// if (lastMember().name == "") {
					// 	lastMember().name = token.value;
					// 	lastMember().nameToken = token;
					// 	lastMember().text = matchText(token.line);
					// 	lastMember().lineComments.push(...findLineComments(token.line));
					// 	lastMember().option.style = "zinc";
					// } else {
					// 	const member = new Member("", token.value);
					// 	member.option.style = "zinc";
					// 	member.nameToken = token;
					// 	member.text = matchText(token.line);
					// 	member.lineComments.push(...findLineComments(token.line));
					// 	members.push(member);
					// }
					member!.name = token.value;
					member!.nameToken = token;
					member!.text = matchText(token.line);
					member!.lineComments.push(...findLineComments(token.line));
					member!.option.style = "zinc";
					memberState = 2;
				} else {
				}
			} else if (memberState == 2) {
				if (token.isOp() && token.value == "[") {
					member!.isArray = true;
					memberState = 3;
				} else if (token.isOp() && token.value == ",") {
					memberState = 1;
				} else {
				}
			} else if (memberState == 3) {
				if (token.isInt()) {
					lastMember().size = parseInt(token.value);
					memberState = 4;
				} else if (token.isOp() && token.value == ",") {
					memberState = 1;
				} else if (token.isOp() && token.value == "]") {
					memberState = 5;
				} else {
				}
			} else if (memberState == 4) {
				if (token.isOp() && token.value == "]") {
					memberState = 5;
				} else if (token.isOp() && token.value == ",") {
					memberState = 1;
				} else {
				}
			} else if (memberState == 5) {
				if (token.isOp() && token.value == ",") {
					memberState = 1;
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
					global.option.style = "zinc";
					global.isConstant = isConstant;
					if (modifierType) {
						global.tag = modifierType;
					} else if (modifierTypes.length > 0) {
						global.tag = lastModifierType().type;
					}
					global.loc.start = new Position(token.line, token.position);
					global.lineComments.push(...findLineComments(token.line));
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
					pushErrorOld("Missing closing symbol ';'!");
					globalState = 6;
				}
			} else if (globalState == 6) {
				if (token.isOp() && token.value == ";") {
					reset("global");
				}
			} else if (globalState == 7) {
				if (token.isId()) {
					const g:Global = new Global((<Global>global).type, "");
					g.option.style = "zinc";
					g.tag = (<Global>global).tag;
					g.isConstant = (<Global>global).isConstant;
					g.loc.start = new Position(token.line, token.position);
					g.name = token.value;
					g.loc.end = new Position(token.line, token.end);
					globals.push(g);
					g.lineComments.push(...findLineComments(token.line));
					globalState = 2;
				} else {
					pushErrorToken();
					globalState = 6;
				}
			}
		};
		const parseStructBody = () => {
			if (token.isId() && token.value == "method") {
				resetMethod();
				method = new Method("");
				method.option.style = "zinc";
				method.text = matchText(token.line);
				method.lineComments.push(...findLineComments(token.line));
				if (modifierType) {
					method.tag = modifierType;
				} else if (structModifierTypes.length > 0) {
					method.tag = lastStructModifierType().type;
				}
				method.modifier = "default";
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
				resetStruct();
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
			} else if (token.isId() && token.value == "extends") {
				structState = 1;
			} else if (structState == 0) {
				if (token.isId()) {
					if ((<Struct>struct).name == "") {
						(<Struct>struct).name = token.value;
					} else {
					}
				} else {

				}
			} else if (structState == 1) { // 继承名称
				if (token.isId()) {
					if ((<Struct>struct).extends) {

					} else {
						(<Struct>struct).extends.push(token.value);
					}
				} else {
					
				}
				structState = 3;
			}
		};

		const pushError = (message:string) => {
			const err = new JassError(message);
			err.loc.start = new Position(token.line, token.position);
			err.loc.end = new Position(token.line, token.end);
			program.errors.push(err);
		};

		if (token.isId() && token.value == "library") {
			resetLibrary();
			inLibrary = true;
			libraryState = 0;
			library = new Library("");
			library.lineComments.push(...findLineComments(token.line));
			library.option.style = "zinc";
			library.loc.start = new Position(token.line, token.position);
			program.librarys.push(library);
		} else if (inLibrary) {
			if (inLibraryStart) {
				if (token.isId() && token.value == "struct") {
					resetStruct();
					struct = new Struct("");
					struct.option.style = "zinc";
					struct.text = matchText(token.line);
					struct.lineComments.push(...findLineComments(token.line));
					if (modifierType) {
						struct.tag = modifierType;
					} else if (modifierTypes.length > 0) {
						struct.tag = lastModifierType().type;
					}
					struct.loc.start = new Position(token.line, token.position);
					(<Library>library).structs.push(struct);
					inStruct = true;
				} else if (inStruct) {
					parseStruct();
				} else if (inFunction) {
					parseFunction();
				} else if (token.isId() && token.value == "function") { // 这个if理应在 else if (inFunction) 前，但因为可能在function body块中方法参数存在function function_name会导致错误
					resetFunc();
					func = new Func("");
					func.option.style = "zinc";
					func.text = matchText(token.line);
					func.lineComments.push(...findLineComments(token.line));
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
					(<Library>library).loc.end = new Position(token.line, token.end);
					resetLibrary();
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
			} else if (token.isId() && token.value == "requires") {
				libraryState = 1;
			} else if (libraryState == 0) {
				if (token.isId()) {
					if ((<Library>library).name == "") {
						(<Library>library).name = token.value;
					} else {

					}
				} else {
					
				} 
			} else if (libraryState == 1) {
				if (token.isId()) {
					(<Library>library).requires.push(token.value);
					libraryState = 2;
				} else if (token.isOp() && token.value == ",") {

				} else {
					pushErrorToken();
					libraryState = 2;
				}
			} else if (libraryState == 2) {
				if (token.isOp() && token.value == ",") {
					libraryState = 1;
				} else {

				}
			}
		} else {
			// pushExpectedError("library");
		}

	}
	return program;

}

function parse(content:string, isZincFile:boolean = false) {
	let ts = tokenize(content);
	return parseByTokens(ts, isZincFile);
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
	parseZincFile,
	parseByTokens as parseZinc
};


if (false) {
	const testString = JSON.stringify(parse(`
	//! zinc
	  library library_name requires require_librarys ,,-,cccccc ccc, ccc {
		public {
			struct a {
				public {
					// 奶茶
					private static integer a[2],
					// 宝宝
					b = 12 , 17;
	
					integer c;
	
					method operator [] () {}
				}
			}
			function assasa(integer ass) {
				int aaa[3], hahah;
			}
		} 
	  }
	//! endzinc
	`).librarys, null, 2);
	console.log(testString);
}

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