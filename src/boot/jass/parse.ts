import { Position } from "../common";
import { Func, Global, JassError, Program, Native, Take, Local } from "./ast";
import { Token, tokens } from "./tokens";



class JassOption {
	/**
	 * 是否解析初始表达式
	 * 解析local或global时,解析到=号时,如果为true则解析后面token,否则等待换行符
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
		return comments.find((token) => token.line == line - 1)?.value.replace("//", "") ?? "";
	};
	const ts = tokens(content).filter(token => {
		if (token.isBlockComment()) {
			return false;
		} else if (token.isComment()) {
			comments.push(token);
			return false;
		} else {
			return true;
		}
	}); // 去除所有块级注释

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
		} else if (token.isId() && token.value == "function") {
			resetFunc();
			resetGlobal();
			inFunc = true;
			expr = new Func("");
			expr.text = matchText(token.line);
			(<Func>expr).loc.start = new Position(token.line, token.position);
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
		}
	}

	// console.log(program)
	return program;
}

export {
	parse
};