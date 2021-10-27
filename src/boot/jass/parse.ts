
import { Position, Range } from "../common";
import { isNewLine } from "../tool";
import { Func, Global, JassError, Program, Native, Take, Local, LineComment, BlockComment, Declaration, TextMacro, RunTextMacro, LineText, DefineMacro } from "./ast";
import { Scanner } from "./scanner";
import { Token, tokenize, tokens } from "./tokens";



class JassOption {
	/**
	 * 是否解析初始表达式
	 * 解析local或global时,解析到=号时,如果为true则解析后面token,否则等待换行符
	 * @deprecated 后面可能需要用到时才解析
	 */
	public needParseInitExpr?: boolean = false;
	/**
	 * 是否解析local
	 */
	public needParseLocal?: boolean = false;
	/**
	 * 严格模式
	 * 正常情况只检测function和globals内部是否错误
	 * needParseNative为true时,也会检查native
	 * 如果在严格模式下,会对全文所有非jass合法的语法都报错
	 */
	public strict?: boolean = false;

	/**
	 * 是否解析native
	 */
	public needParseNative?: boolean = false;

	public static default() {
		const option = new JassOption();
		return option;
	}
}



/**
 * 仅解析jass原生语法
 * @param content 
 */
function parse(content: string, options: JassOption = JassOption.default()): Program {
	const program = new Program();

	const comments:Token[] = [];
	const matchText = (line:number) => {
		const texts: string[] = [];
		for (let index = line; index > 0; index--) {
			let comment:Token|undefined = undefined;
			if ((comment = comments.find((token) => token.line == index - 1))) {
				const text = comment.value.replace("//", "");
				texts.push(text);
			} else {
				break;
			}
		}
		return texts.reverse().join("\n");
		// return comments.find((token) => token.line == line - 1)?.value.replace("//", "") ?? "";
	};
	let inZinc = false;
	let inLibrary = false;
	let inStruct = false;
	let inScopeState = 0;
	let inModule = false;
	let inTextMacro = false;
	let inInterface = false;
	const ts = tokens(content)
	// 去除块注释
	.filter((token) => !token.isBlockComment())
	// 去除zinc块
	.filter(token => {
		if (token.isComment() && /\/\/![ \t]+zinc\b/.test(token.value)) {
			inZinc = true;
			return false;
		} else if (token.isComment() && /\/\/![ \t]+endzinc\b/.test(token.value)) {
			inZinc = false;
			return false;
		} else {
			return !inZinc;
		}
	})
	// 去除vjass文本宏块
	.filter(token => {
		if (token.isComment() && /\/\/![ \t]+textmacro\b/.test(token.value)) {
			inTextMacro = true;
			return false;
		} else if (token.isComment() && /\/\/![ \t]+endtextmacro\b/.test(token.value)) {
			inTextMacro = false;
			return false;
		} else {
			return !inTextMacro;
		}
	})
	.filter((token) => {
		// 去除vjass代码
		if (token.value == "library") {
			inLibrary = true;
		} else if (token.value == "endlibrary") {
			inLibrary = false;
		} else if (token.value == "struct") {
			inStruct = true;
		} else if (token.value == "endstruct") {
			inStruct = false;
		} else if (token.value == "scope") {
			inScopeState++;
		} else if (token.value == "endscope") {
			if (inScopeState > 0) {
				inScopeState--;
			}
		} else if (token.value == "module") {
			inModule = true;
		} else if (token.value == "endmodule") {
			inModule = false;
		} else if (token.value == "interface") {
			inInterface = true;
		} else if (token.value == "endinterface") {
			inInterface = false;
		}
		return !(inLibrary || inStruct || inModule || inInterface || inScopeState > 0);
	})
	.filter((token) => {
		// 去除单行注释
		if (token.isComment()) {
			comments.push(token);
			return false;
		}
		return true;
	});

		


	if (options.strict) {
		program.errors.push(...ts.filter(token => token.isError()).map((token) => {
			const err = new JassError(`Unexpected token '${token.value}'`);
			err.loc.start = new Position(token.line, token.position);
			err.loc.end = new Position(token.line, token.end);
			return err;
		}));
	}


	let expr: Func | Native | null = null;

	let inFunc = false;
	let inFuncStart = false;
	let funcState = 0;

	let inNative = false;
	let nativeState = 0;

	let inGlobals = false;

	let global: Global | null = null;
	let globalState = 0;
	let isConstant = false;

	let take: Take | null = null;
	let isSingleTake = false;

	let local: Local | null = null;
	let inLocal = false;
	let localState = 0;
	// let isArray = false;

	const resetTakes = () => {
		take = null;
		isSingleTake = false;
	};
	const resetNative = () => {
		resetTakes();
		expr = null;
		nativeState = 0;
		inNative = false;
	};
	const resetFunc = () => {
		resetTakes();
		expr = null;
		funcState = 0;
		inFunc = false;
		inFuncStart = false;
	};
	const resetLocal = () => {
		inLocal = false;
		localState = 0;
		local = null;
	};
	const resetGlobal = () => {
		// inGlobal = false;
		globalState = 0;
		isConstant = false;
		global = null;
	}
	let isStart = true;
	for (let index = 0; index < ts.length; index++) {
		const token = ts[index];
		const nextToken = ts[index + 1];

		const pushError = (message: string) => {
			const err = new JassError(message);
			err.loc.start = new Position(token.line, token.position);
			err.loc.end = new Position(token.line, token.end);
			program.errors.push(err);
		};
		if (options.needParseNative && token.isId() && token.value == "native") {
			resetNative();
			resetGlobal();
			inNative = true;
			expr = new Native("");
			expr.text = matchText(token.line);
			(<Native>expr).loc.start = new Position(token.line, token.position);
			program.natives.push((<Native>expr));
			nativeState = 1;
		} else if (isStart && token.isId() && token.value == "function") {
			resetFunc();
			resetGlobal();
			inFunc = true;
			expr = new Func("");
			expr.text = matchText(token.line);
			(<Func>expr).loc.start = new Position(token.line, token.position);
			(<Func>expr).loc.end = new Position(token.line + 1, 0);
			program.functions.push((<Func>expr));
			funcState = 1;
		} else if (token.isId() && token.value == "endfunction") {
			if (inFunc) {
				(<Func>expr).loc.end = new Position(token.line, token.end);
				resetFunc();
			} else {
				pushError("Redundant endfunction");
			}
		
		} else if (inNative) {
			if (token.isNewLine()) {
				(<Native>expr).loc.end = new Position(token.line, token.end);
				resetNative();
			} else if (token.isId() && token.value == "returns") {
				nativeState = 7;
			} else if (token.isId() && token.value == "takes") {
				resetTakes();
				nativeState = 3;
			} else if (nativeState == 1) {
				if (token.isId() && (<Native>expr).name == "") {
					(<Native>expr).name = token.value;
					nativeState = 2;
				} else {
					pushError("Function name error");
				}
			} else if (nativeState == 2) {
				// 已命名
				pushError("The expected token is takes");
			} else if (nativeState == 3) {
				if (token.isId() && token.value == "nothing") {
					if (isSingleTake) {
						pushError("Nothing is not a type that should be used in the argument declaration");
						nativeState = 5;
					} else {
						nativeState = 6;
					}
				} else if (token.isId()) {
					take = new Take(token.value, "");
					nativeState = 4;
				} else if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					pushError("Nonholonomic parameter");
				} else {
					pushError("Incorrect parameter type");
				}
			} else if (nativeState == 4) {
				if (token.isId()) {
					(<Take>take).name = token.value;
					(<Func>expr).takes.push(<Take>take);
				} else if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					nativeState = 3;
					pushError("Nonholonomic parameter");
				} else {
					pushError("Incorrect parameter name");
				}
				nativeState = 5;
			} else if (nativeState == 5) {
				if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					nativeState = 3;
				} else {
					pushError("The expected token is returns");
				}
			} else if (nativeState == 6) {
				pushError("The current function has no arguments");
			} else if (nativeState == 7) {
				if (token.isId()) {
					if (token.value != "nothing") {
						(<Native>expr).returns = token.value;
					}
					nativeState = 8;
				} else {
					pushError("Return type error");
				}
			} else if (nativeState == 8) {
				// 结束,等待换行符
				pushError("unnecessary");
			}
		} else if (inFunc) {
			if (inFuncStart == false && token.isNewLine()) {
				if (funcState != 8) {
					pushError("Incomplete function error");
				}
				inFuncStart = true;
				(<Func>expr).loc.end = new Position(token.line, token.end);
			} else if (inFuncStart) {
				if (token.isNewLine()) {
					resetLocal();
				} else if (options.needParseLocal && token.isId() && token.value == "local") {
					resetLocal();
					inLocal = true;
					localState = 1;
					local = new Local("", "");
					local.text = matchText(token.line);
					if (!nextToken || nextToken.isNewLine()) {
						pushError("Incomplete local error");
					}
				} else if (inLocal) {
					if (localState == 1) {
						if (token.isId()) {
							(<Local>local).type = token.value;
							(<Local>local).loc.start = new Position(token.line, token.position);
							localState = 2;
						} else {
							pushError("Incorrect local type");
						}
						if (!nextToken || nextToken.isNewLine()) {
							pushError("Incomplete local error");
						}
					} else if (localState == 2) {
						if (token.isId() && token.value == "array") {
							if ((<Local>local).isArray) {
								pushError("Repetitively declared array");
							} else {
								(<Local>local).isArray = true;
							}
						} else if (token.isId()) {
							(<Local>local).name = token.value;
							(<Func>expr).locals.push(<Local>local);
							(<Local>local).loc.end = new Position(token.line, token.end);
							if ((<Local>local).isArray) {
								localState = 6;
							} else {
								if (options.needParseInitExpr) {
									localState = 3;
								} else {
									localState = 5
								}
							}
						} else {
							if ((<Local>local).isArray) {
								pushError("Incorrect local name");
							} else {
								pushError("Incorrect local name or Incorrect declared array");
							}
						}
						if (!nextToken || nextToken.isNewLine()) {
							pushError("Incomplete local error");
						}
					} else if (localState == 3) {
						if (token.isOp() && token.value == "=") {
							localState = 4;

							if (!nextToken || nextToken.isNewLine()) {
								pushError("You need at least one value");
							}
						} else {
							pushError("Incorrect initialization symbol");
						}
					} else if (localState == 4) {
						// local init
						(<Local>local).initTokens.push(token);
					} else if (localState == 5) {
						// 停止解析,等待换行符
					} else if (localState == 6) {
						// 数组local定义结束
						if (token.isOp() && token.value == "=") {
							pushError("The Jass language does not support array initialization");
						} else {
							pushError("Error token, if you want to initialize an array I think you should give it up");
						}
					}
				}
				(<Func>expr).tokens.push(token);
			} else if (token.isId() && token.value == "returns") {
				funcState = 7;
			} else if (token.isId() && token.value == "takes") {
				resetTakes();
				funcState = 3;
			} else if (funcState == 1) {
				if (token.isId() && (<Func>expr).name == "") {
					(<Func>expr).name = token.value;
					(<Func>expr).nameToken = token;
					funcState = 2;
				} else {
					pushError("Function name error");
				}
			} else if (funcState == 2) {
				// 已命名
				pushError("The expected token is takes");
			} else if (funcState == 3) {
				if (token.isId() && token.value == "nothing") {
					if (isSingleTake) {
						pushError("Nothing is not a type that should be used in the argument declaration");
						funcState = 5;
					} else {
						funcState = 6;
					}
				} else if (token.isId()) {
					take = new Take(token.value, "");
					funcState = 4;
				} else if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					pushError("Nonholonomic parameter");
				} else {
					pushError("Incorrect parameter type");
				}
			} else if (funcState == 4) {
				if (token.isId()) {
					(<Take>take).name = token.value;
					(<Take>take).nameToken = token;
					(<Func>expr).takes.push(<Take>take);
				} else if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					funcState = 3;
					pushError("Nonholonomic parameter");
				} else {
					pushError("Incorrect parameter name");
				}
				funcState = 5;
			} else if (funcState == 5) {
				if (token.isOp() && token.value == ",") {
					isSingleTake = true;
					funcState = 3;
				} else {
					pushError("The expected token is returns");
				}
			} else if (funcState == 6) {
				pushError("The current function has no arguments");
			} else if (funcState == 7) {
				if (token.isId()) {
					if (token.value != "nothing") {
						(<Func>expr).returns = token.value;
					}
					funcState = 8;
				} else {
					pushError("Return type error");
				}
			} else if (funcState == 8) {
				// 结束,等待换行符
				pushError("unnecessary");
			}
			if (token.isError()) {
				pushError(`Unexpected token '${token.value}'`);
			}

		} else if (token.isId() && token.value == "globals") {
			if (inGlobals) {
				pushError("The endglobals token is missing");
			} else {
				inGlobals = true;
			}
			resetGlobal();
		} else if (token.isId() && token.value == "endglobals") {
			if (inGlobals) {
				inGlobals = false;
				resetGlobal();
			} else {
				pushError("Redundant endglobals");
			}
		} else if (inGlobals) {
			if (token.isId() && token.value == "endglobals") {
				inGlobals = false;
			} else if (token.isNewLine()) {
				resetGlobal();
			}  else if (globalState == 0) {
				if (token.isId() && token.value == "constant") {
					if (isConstant) {
						pushError("Repetitively declared constant");
					}
					isConstant = true;
					if (!nextToken || nextToken.isNewLine()) {
						pushError("Incomplete globals constant error");
					}
				} else if (token.isId()) {
					global = new Global(token.value, "");
					global.text = matchText(token.line);
					(<Global>global).loc.start = new Position(token.line, token.position);
					global.isConstant = isConstant;
					globalState = 1;
					if (!nextToken || nextToken.isNewLine()) {
						if (isConstant) {
							pushError("Incomplete globals constant error");
						} else {
							pushError("Incomplete globals variable error");
						}
					}
				} else {
					pushError("Error global member token");
				}
			} else if (globalState == 1) {
				if (token.isId() && token.value == "array") {
					if ((<Global>global).isConstant) {
						pushError("Constant arrays are not supported");
					}
					if ((<Global>global).isArray) {
						pushError("Repetitively declared array");
					}
					(<Global>global).isArray = true;
				} else if (token.isId()) {
					(<Global>global).name = token.value;
					(<Global>global).nameToken = token;
					program.globals.push((<Global>global));
					(<Global>global).loc.end = new Position(token.line, token.end);
					globalState = 2;
				} else {
					pushError("Incorrect global member name");
				}
			} else if (globalState == 2) {
				if (token.isOp() && token.value == "=") {
					if ((<Global>global).isArray) {
						pushError("The Jass language does not support array initialization");
					}
				} else {
					if ((<Global>global).isConstant) {
						pushError("Constants must be initialized");
					}
				}
				globalState = 3;
			} else if (globalState == 3) {

			}
			if (token.isError()) {
				pushError(`Unexpected token '${token.value}'`);
			}
			if (isConstant && token.isId() && token.value == "constant") {
				isConstant = false;
			}
		} else if (token.isNewLine()) {
			isStart = true;
		}
		if (isStart && !token.isNewLine()) {
			isStart = false;
		}
	}

	// console.log(program)
	return program;
}

class CommentTree {
	public readonly lineComments: LineComment[] = [];
	public readonly blockComments: BlockComment[] = [];
}

function parseComment(content: string) : CommentTree {
	const commentMap = new CommentTree();

	return commentMap;
}

function similar(left: string, right: string): number {
	if (left.length != right.length && (left.length == 0 || right.length == 0)) {
		return 0.0;
	}
	if (left.length == right.length) {
		if (left == right) {
			return 1.0;
		}
	}
	let similarity = 0.0;
	const leftMap = new Map<string, number>();
	for (let index = 0; index < left.length; index++) {
		const char = left[index];
		if (leftMap.has(char)) {
			const count = leftMap.get(char)!;
			leftMap.set(char, count + 1);
		} else {
			leftMap.set(char, 1);
		}
	}
	const rightMap = new Map<string, number>();
	for (let index = 0; index < right.length; index++) {
		const char = left[index];
		if (rightMap.has(char)) {
			const count = rightMap.get(char)!;
			rightMap.set(char, count + 1);
		} else {
			rightMap.set(char, 1);
		}
	}
	const keySet = new Set([...leftMap.keys(), ...rightMap.keys()]);
	let count = 0;
	keySet.forEach((key) => {
		if (leftMap.has(key) && rightMap.has(key)) {
			count += Math.min(leftMap.get(key)!, rightMap.get(key)!);
		}
	});
	similarity = count / Math.ceil((left.length + right.length) / 2);
	return similarity;
}



/**
 * 移除注释
 * @param content 
 * @param deleteLineComment 是否删除行注释
 */
 function removeComment(content: string, deleteLineComment:boolean = false):string {
	let state = 0;

	content = content.replace(/\r\n/g, "\n");
	const len = content.length;
	const chars: string[] = [];

	for (let index = 0; index < len; index++) {
		const char = content.charAt(index);
		const nextChar = content.charAt(index + 1);
		if (state == 0) {
			if (char == "/") {
				if (nextChar == "/") {
					state = 1;
					if (deleteLineComment == false) {
						chars.push(char);
					}
				} else if (nextChar == "*") {
					state = 2;
				} else {
					chars.push(char);
				}
			} else if (char == "\"") {
				state = 4;
				chars.push(char);
			} else {
				chars.push(char);
			}
		} else if (state == 1) {
			if (deleteLineComment == false) {
				chars.push(char);
			}
			if (!nextChar || isNewLine(nextChar)) {
				// 注释
				state = 0;
			}
		} else if (state == 2) {
			if (nextChar == "*") {
				state = 3;
			} 
			if (isNewLine(char)) {
				chars.push("\n");
			}
		} else if (state == 3) {
			if (nextChar == "/") { // 块注释结束
				state = 6;
			} else {
				state = 2;
			}
		} else if (state == 6) {
			state = 0;
		} else if (state == 4) {
			if (nextChar == "\"") { // 字符串结束
				state = 0;
			} else if (nextChar == "\\") { //字符串进入转义状态
				state = 5;
			} else if (isNewLine(nextChar)) { // 字符串结束
				state = 0;
			}
			chars.push(char);
		} else if (state == 5) {
			if (isNewLine(nextChar)) { // 字符串结束
				state = 0;
			} else { // 从新回到字符串状态
				state = 4;
			}
			chars.push(char);
		}
	}
	return chars.join("");
}

function preparese(content: string) {

}



const functionStartRegExp = /\s*function\b/;
function isFunctionStart(text: string) {
	return functionStartRegExp.test(text);
}

const libraryStartRegExp = /\s*library\b/;
function isLibraryStart(text: string) {
	return libraryStartRegExp.test(text);
}

const libraryEndRegExp = /\s*endlibrary\b/;
function isLibraryEnd(text: string) {
	return libraryEndRegExp.test(text);
}


const structStartRegExp = /\s*struct\b/;
function isStructStart(text: string) {
	return structStartRegExp.test(text);
}

const structEndRegExp = /\s*endstruct\b/;
function isStructEnd(text: string) {
	return structEndRegExp.test(text);
}

class TextMacroLineText extends Range {

    private readonly text:string| RunTextMacro;

    constructor(text: string| RunTextMacro) {
		super();
        this.text = text;
    }

	public getText(): string {
		// return this.text instanceof RunTextMacro ? this.text.body.map(lineText => lineText.text).join("\n") : this.text;
		return ""
	}

}

class Parser {

	private readonly scanner: Scanner;

	constructor(content: string) {
		this.scanner = new Scanner(content);

		this.parseMacro();
		this.parseTextMacro();

	}

	private field = 0;
	private nodes: Array<Declaration> = [];

	private lineTexts: (LineText|RunTextMacro)[] = [];

	private textMacros: TextMacro[] = [];
	private defineMacros: DefineMacro[] = [];

	private parseMacro():void {
		this.scanner.marcos.forEach((macro) => {
			if (/^\s*#define\b/) {
				const ts = tokenize(macro.raw);
				let state = 0;
				let defineMacro:DefineMacro;
				console.log(ts);
				
				ts.forEach((token) => {
					if (state == 0) {
						if (token.isMacro() && token.value == "#define") {
							defineMacro = new DefineMacro("");
							defineMacro.setRange(macro);
							defineMacro.start.position = token.position;
							state = 1;
						} else {
							state = 3;
						}
					} else if (state == 1) {
						if (token.isId()) {
							defineMacro.name = token.value;
							defineMacro.end.position = token.end;
							this.defineMacros.push(defineMacro);
							state = 2;
						} else {
							state = 3;
						}
					} else if (state == 2) {
						if (token.isId()) {
							defineMacro.value = token.value;
							defineMacro.end.position = token.end;
						}
						state = 3;
					} else if (state == 3) {
						
					}
				});
			}
		});
	}

	// 解析文本宏
	private parseTextMacro():void {
		let inTextMaxro = false;
		let textMacro: TextMacro;
		this.scanner.jassLines.forEach(lineText => {
			if (/\s*\/\/!\s+textmacro\b/.test(lineText.text)) {
				inTextMaxro = true;
				const result = lineText.text.match(/\s*\/\/!\s+textmacro\s+(?<name>[a-zA-z][a-zA-Z\d]*)(?:\s+takes\s+(?<takes>[a-zA-z][a-zA-Z\d]*(?:\s*,\s*[a-zA-z][a-zA-Z\d]*)*))?/);
				
				if (result && result.groups) {
					textMacro = new TextMacro(result.groups["name"]);
					if (result.groups["takes"]) {
						textMacro.takes.push(...result.groups["takes"].split(/\s*,\s*/));
					}
				} else {
					textMacro = new TextMacro("");
				}
				textMacro.setRange(lineText);
				this.textMacros.push(textMacro);
			} else if (/\s*\/\/!\s+endtextmacro\b/.test(lineText.text)) {
				if (inTextMaxro) {
					textMacro.end = lineText.end;
					inTextMaxro = false;
				} else {

				}
			} else if (/\s*\/\/!\s+runtextmacro\b/.test(lineText.text)) {
				if (inTextMaxro) {
					// error
				} else {
					const ts = tokenize(lineText.text.replace("//!", "   "));
					let state = 0;
					let runTextMacro:RunTextMacro;
					ts.forEach((token) => {
						if (state == 0) {
							if (token.isId() && token.value === "runtextmacro") {
								runTextMacro = new RunTextMacro("");
								runTextMacro.setRange(lineText);
								runTextMacro.start.position = token.position;
								state = 1;
							} else {
								// error
							}
						} else if (state == 1) {
							if (token.isId()) {
								runTextMacro.name = token.value;
								state = 2;
							} else {
								// name error
							}
						} else if (state == 2) {
							if (token.isOp() && token.value == "(") {
								state = 3;
							} else {
								// 期望 (
							}
						} else if (state == 3) {
							if (token.isString()) {
								runTextMacro.takes.push(token.value);
								state = 4;
							} else if (token.isOp() && token.value == ")") {
								runTextMacro.end.position = token.end;
								this.lineTexts.push(runTextMacro);
								state = 5;
							} else {
								// error param
							}
						} else if (state == 4) {
							if (token.isOp() && token.value == ",") {
								state = 3;
							} else if (token.isOp() && token.value == ")") {
								runTextMacro.end.position = token.end;
								this.lineTexts.push(runTextMacro);
								state = 5;
							} else {
								// error
							}
						} else if (state == 5) {
							// wait over
						}
					});
				}
			} else if (inTextMaxro) {
				textMacro.body.push(lineText);
			} else {
				this.lineTexts.push(lineText);
			}
		});
	}

	private parseJass() {
		let inLibrary = false;
		let scopeFiel = 0;
		let inStruct = false;
		let inFunction = false;
		let inGlobals = false;
		let inMethod = false;
		this.scanner.jassLines.forEach((lineText) => {
			if (isLibraryStart(lineText.text)) {
				inLibrary = true;
			} else if (isLibraryEnd(lineText.text)) {
				inLibrary = false;
			} else if (isStructStart(lineText.text)) {
				inLibrary = true;
			} else if (isStructEnd(lineText.text)) {
				inLibrary = false;
			}
			if (isFunctionStart(lineText.text)) {

			}
		});
		// tokenize()
	}

}

export {
	parse,
	Parser
};


if (true) {

	console.log(similar("aabbaa", "aabbaab"));

	console.log(removeComment(`1
	a// a
	a/*
	a
	*/a`, true));

	console.log(new Parser(`
	#define a b
	#define c
	#define
	//! textmacro bbb takes name, baba
//! endtextmacro
	//! runtextmacro bbb  ( "c", "a" ,)
aaa
	`));
	
	
}