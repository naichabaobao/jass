
import { is0_16, is0_7, is1_9, isLetter, isNewLine, isNotNewLine, isNumber, isSpace } from "../tool";
import { Document, Position, Range } from "./ast";

type TokenType = "id" | "op" | "int" | "real" | "string" | "mark" | "error" | "block_comment" | "comment" | "macro";

class Token {
	public type: TokenType;
	public value: string;
	public line: number;
	public position: number;

	constructor(type: TokenType, value: string, line: number, position: number) {
		this.type = type;
		this.value = value;
		this.line = line;
		this.position = position;
		this.end = this.position + this.value.length;
	}

	public isId() {
		return this.type === "id";
	}
	public isOp() {
		return this.type === "op";
	}
	public isInt() {
		return this.type === "int";
	}
	public isReal() {
		return this.type === "real";
	}
	public isString() {
		return this.type === "string";
	}
	public isMark() {
		return this.type === "mark";
	}
	public isError() {
		return this.type === "error";
	}

	public isMacro() {
		return this.type === "macro";
	}
	public isComment() {
		return this.type === "comment";
	}
	public isBlockComment() {
		return this.type === "block_comment";
	}
	public isNewLine() {
		return this.isOp() && this.value == "\n";
	}

	public end: number;

}




/**
 * @deprecated 此方法实现时带有主观判断token的好坏，以致无法在后续开发获取更细化的信息，后续将从新实现 Tokenizer 类替换掉
 * @param content 
 * @returns 
 */
function tokens(content: string) {
	const tokens: Token[] = [];

	let lineNumber = 0;
	let position = 0;
	let state = 0;
	const next = (index: number) => {
		return content[index + 1];
	}
	const values: string[] = [];
	const push = (char: string) => {
		values.push(char);
	}
	const pushToken = (type: TokenType) => {
		const value = values.join("");
		tokens.push(new Token(type, value, lineNumber, position - value.length + 1)); // 因为position还未向前，所以要+1
		values.length = 0;
		if (state != 0) {
			state = 0;
		}
	}
	const bad = () => {
		pushToken("error");
	}

	// +-*/\"|&>=!<;,()[]{}
	for (let index = 0; index < content.length; index++) {
		const char = content[index];
		const nextChar = next(index);

		if (state == 0) {
			if (char == "/") {
				push(char);
				if (nextChar && nextChar == "/") {
					state = 20;
				} else if (nextChar && nextChar == "*") {
					state = 21;
				} else {
					pushToken("op");
				}
			} else if (isLetter(char)) {
				push(char);
				if (nextChar && isLetter(nextChar) || nextChar == "_" || isNumber(nextChar)) {
					state = 1;
				} else {
					pushToken("id");
				}
			} else if (char == "0") {
				push(char);
				if (nextChar && is0_7(nextChar)) {
					state = 2;
				} else if (nextChar && nextChar == "x") {
					state = 3;
				} else if (nextChar && nextChar == ".") {
					state = 9;
				} else {
					pushToken("int");
				}
			} else if (char == "\"") {
				push(char);
				state = 5;
				/*
				if (nextChar && nextChar == "\"") {
					state = 4;
				} else if (nextChar && nextChar == "\\") {
					state = 5
				} else if (nextChar && isNotNewLine(nextChar)) {
					state = 6;
				} else {
					bad();
				}*/
			} else if (is1_9(char)) {
				push(char);
				if (nextChar && isNumber(nextChar)) {
					state = 8;
				} else if (nextChar && nextChar == ".") {
					state = 9;
				} else {
					pushToken("int");
				}
			} else if (char == ".") {
				push(char);
				if (nextChar && isNumber(nextChar)) {
					state = 10;
				} else if (nextChar && isLetter(nextChar)) {
					pushToken("op"); // .
					state = 0;
				} else {
					pushToken("op");
				}
			} else if (char == "+") {
				push(char);
				pushToken("op");
			} else if (char == "-") {
				push(char);
				if (nextChar && nextChar == ">") {
					state = 11;
				} else {
					pushToken("op");
				}
			} else if (char == "*") {
				push(char);
				pushToken("op");
			} else if (char == "=") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 12;
				} else {
					pushToken("op");
				}
			} else if (char == ">") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 13;
				} else {
					pushToken("op");
				}
			} else if (char == "<") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 14;
				} else {
					pushToken("op");
				}
			} else if (char == "|") {
				push(char);
				if (nextChar && nextChar == "|") {
					state = 15;
				} else {
					bad();
				}
			} else if (char == "&") {
				push(char);
				if (nextChar && nextChar == "&") {
					state = 16;
				} else {
					bad();
				}
			} else if (char == "!") {
				push(char);
				if (nextChar && nextChar == "=") {
					state = 17;
				} else {
					pushToken("op");
				}
			} else if (char == "(") {
				push(char);
				pushToken("op");
			} else if (char == ")") {
				push(char);
				pushToken("op");
			} else if (char == "[") {
				push(char);
				pushToken("op");
			} else if (char == "]") {
				push(char);
				pushToken("op");
			} else if (char == "{") {
				push(char);
				pushToken("op");
			} else if (char == "}") {
				push(char);
				pushToken("op");
			} else if (char == ",") {
				push(char);
				pushToken("op");
			} else if (char == ";") {
				push(char);
				pushToken("op");
			} else if (char == "'") {
				push(char);
				if (nextChar && (isNumber(nextChar) || isLetter(nextChar))) {
					state = 18;
				} else {
					bad();
				}
			} else if (char == "%") {
				push(char);
				pushToken("op");
			} else if (char == "$") {
				push(char);
				if (nextChar && is0_16(nextChar)) {
					state = 4;
				} else {
					bad();
				}
			} else if (char == "#") {
				push(char);
				if (nextChar && isLetter(nextChar)) {
					state = 24;
				} else {
					bad();
				}
			} else if (char == "\n") {
				push(char);
				pushToken("op");
			} else if (isSpace(char) || isNewLine(char)) {
			} else {
				push(char);
				bad();
			}
		} else if (state == 1) {
			push(char);
			if (nextChar && isLetter(nextChar) || nextChar == "_" || isNumber(nextChar)) {

			} else {
				pushToken("id");
			}
		} else if (state == 2) {
			push(char);
			if (nextChar && is0_7(nextChar)) {
			} else {
				pushToken("int");
			}
		} else if (state == 3) {
			push(char);
			if (nextChar && is0_16(nextChar)) {
				state = 4;
			} else {
				bad();
			}
		} else if (state == 4) {
			push(char);
			if (nextChar && is0_16(nextChar)) {

			} else {
				pushToken("int");
				state = 0;
			}
		} else if (state == 5) {
			push(char);
			if (isNewLine(char)) {
				bad();
			} else if (char == "\"") {
				pushToken("string");
			} else if (char == "\\") {
				state = 6;
			}
		} else if (state == 6) {
			push(char);
			if (isNewLine(char)) {
				bad();
			} else {
				state = 5
			}
		} else if (state == 7) {
			/*
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 4;
			} else if (nextChar && isNotNewLine(nextChar)) {
				state = 6;
			} else {
				bad();
			}*/
		} else if (state == 8) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
			} else if (nextChar && nextChar == ".") {
				state = 9;
			} else {
				pushToken("int");
			}
		} else if (state == 9) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
				state = 10;
			} else {
				pushToken("real");
			}
		} else if (state == 10) {
			push(char);
			if (nextChar && isNumber(nextChar)) {
			} else {
				pushToken("real");
			}
		} else if (state == 11) {
			push(char);
			pushToken("op");
		} else if (state == 12) {
			push(char);
			pushToken("op");
		} else if (state == 13) {
			push(char);
			pushToken("op");
		} else if (state == 14) {
			push(char);
			pushToken("op");
		} else if (state == 15) {
			push(char);
			pushToken("op");
		} else if (state == 16) {
			push(char);
			pushToken("op");
		} else if (state == 17) {
			push(char);
			pushToken("op");
		} else if (state == 18) {
			push(char);
			if (nextChar && nextChar == "'") {
				state = 19;
			} else if (nextChar && (isNumber(nextChar) || isLetter(nextChar))) {
			} else {
				bad();
			}
		} else if (state == 19) {
			push(char);
			pushToken("mark");
		} else if (state == 20) {
			push(char);
			if (!nextChar || isNewLine(nextChar)) {
				pushToken("comment");
			}
		} else if (state == 21) {
			push(char);
			if (!nextChar) {
				bad();
			} else if (nextChar == "*") {
				state = 22;
			}
		} else if (state == 22) {
			push(char);
			if (!nextChar) {
				bad();
			} else if (nextChar == "*") {
			} else if (nextChar == "/") {
				state = 23;
			} else {
				state = 21;
			}
		} else if (state == 23) {
			push(char);
			pushToken("block_comment");
		} else if (state == 24) {
			push(char);
			if (!isLetter(nextChar)) {
				pushToken("macro");
			}
		}

		if (char == "\n") {
			lineNumber++;
			position = 0;
		} else {
			position++;
		}
	}
	// console.log(tokens);
	return tokens;
}

type TokenizerHandleFunction = (token:Tokenize) => void;

/**
 * 一个新的Token,使用更统一的Range,type的类型更松散
 */
class Tokenize extends Range{
	type: string;
	value: string;

	constructor(type: string, value: string, start?: Position, end?: Position) {
		super(start, end);
		this.type = type;
		this.value = value;
	}

}

interface TokenizeDefine {
	/**
	 * first成功跳转状态
	 */
	state: number;
	/**
	 * first失败跳转状态
	 */
	backState?: number;
	first(state: number, char: string):boolean;
	follow(char: string):boolean;
}

interface TokenizeTypeDefine {
	tokenType: string;
	state: number;
}

class TokenizerBuild {
	private content: string;
	private eventMap: Map<string, TokenizerHandleFunction|Array<TokenizerHandleFunction>> = new Map();
	private defines: TokenizeDefine[] = [];
	private elseDefines: TokenizeTypeDefine[] = [];
	private readonly defaultState:number;
	private handle?: TokenizerHandleFunction;

	private constructor(content: string, defaultState: number, defines?:TokenizeDefine[], elseDefines?:TokenizeTypeDefine[]) {
		this.content = content;
		this.defaultState = defaultState;
		if (defines) {
			this.defines = defines;
		}
		if (elseDefines) {
			this.elseDefines = elseDefines;
		}
	}

	public static create(content: string, defaultState: number, defines?: TokenizeDefine[], elseDefines?:TokenizeTypeDefine[]) {
		return new TokenizerBuild(content, defaultState, defines, elseDefines);
	}
	public setTokenDefines(defines: TokenizeDefine[]) {
		this.defines = defines;
		return this;
	}

	public setTokenTypes(elseDefines: TokenizeTypeDefine[]) {
		this.elseDefines = elseDefines;
		return this;
	}

	private tokenize(handle?: TokenizerHandleFunction) {
		let state: number = this.defaultState;

		let cellects:string[] = [];
		let lineNumber:number = 0, charPosition:number = 0;
		for (let index = 0; index < this.content.length; index++) {
			const char = this.content.charAt(index);
			const next_char = this.content.charAt(index + 1);
			
			if (isNewLine(char)) {
				lineNumber++;
				charPosition = 0;
			} else {
				charPosition++;
			}
			const def = this.defines.find((d) => {
				return d.first(state, char);
			});

			if (def) {
				state = def.state;
				cellects.push(char);

				if (!def.follow(next_char) || next_char === "") {
					const el = this.elseDefines.find(el => el.state === state);
					if (cellects.length > 0) {
						const value: string = cellects.join(""), start: Position = new Position(lineNumber, charPosition - cellects.length), end: Position = new Position(lineNumber, charPosition);
						if (el) {
							const token = new Tokenize(el.tokenType, value, start, end);
							if (handle) handle(token);
						} else {

						}
						cellects = [];
					}
					state = this.defaultState;
				}
			}



		}
	}

	public build(): void {
		this.tokenize(this.handle);
	}

	public get() {
		const tokens: Tokenize[] = [];
		this.tokenize((token) => {
			tokens.push(token);
			if (this.handle) this.handle(token); 
		});
		return tokens;
	}

	public onTokenize(handle: TokenizerHandleFunction) {
		this.handle = handle;
		return this;
	}
}

// 包装方法
function tokenize(content: string) {
	return tokens(content);
}

export { Token, TokenType, tokens, tokenize };


const defaultState: number = 0;
enum DefaultState {
	default = defaultState,
	div = 1,
	comment_start = 2,
	block_comment_start = 3,
	block_comment_wait_end = 4,
	block_comment_end = 5,
	string_start = 6,
	string_escape = 7,
	string_end = 8,
	mark_start = 9,
	mark_end = 10,
	id = 11,
	number_0 = 12,
	number_8 = 13,
	number_16_start = 14,
	number_16 = 15,
	double = 16,
	number = 17,
	point = 18,
	macro_start = 19,
	macro = 20,
	dollar = 21,
	dollar_hex = 23,
	dollar_macro_start = 22,
	dollar_macro_bad = 24,
	dollar_macro_end = 25,
	plus = 26,
	sub = 27,
	mul = 28,
	assignment = 29,
	eq = 30,
	gt = 31,
	gt_eq = 32,
	lt = 33,
	lt_eq = 34,
	field = 35,
	not = 36,
	not_eq = 37
};
const DefaultTokenDefines: TokenizeDefine[] = [{
	state: DefaultState.div,
	first(state, char) {
		return state === DefaultState.default && char === "/";
	},
	follow(char) {
		return char === "/" || char === "*";
	},
}, {
	state: DefaultState.comment_start,
	first(state, char) {
		return state === DefaultState.div && char === "/";
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.comment_start,
	first(state, char) {
		return state === DefaultState.comment_start;
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.block_comment_start,
	first(state, char) {
		return state === DefaultState.div && char === "*";
	},
	follow(char) {
		return char !== "";
	},
}, {
	state: DefaultState.block_comment_wait_end,
	first(state, char) {
		return state === DefaultState.block_comment_start && char === "*";
	},
	follow(char) {
		return char !== "";
	},
}, {
	state: DefaultState.block_comment_start,
	first(state, char) {
		return state === DefaultState.block_comment_start;
	},
	follow(char) {
		return char !== "";
	},
}, {
	state: DefaultState.block_comment_wait_end,
	first(state, char) {
		return state === DefaultState.block_comment_wait_end && char === "*";
	},
	follow(char) {
		return char !== "";
	},
}, {
	state: DefaultState.block_comment_end,
	first(state, char) {
		return state === DefaultState.block_comment_wait_end && char === "/";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.string_start,
	first(state, char) {
		return state === DefaultState.default && char === "\"";
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.string_escape,
	first(state, char) {
		return state === DefaultState.string_start && char === "\\";
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.string_start,
	first(state, char) {
		return state === DefaultState.string_escape;
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.string_end,
	first(state, char) {
		return state === DefaultState.string_start && char === "\"";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.string_start,
	first(state, char) {
		return state === DefaultState.string_start;
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.id,
	first(state, char) {
		return state === DefaultState.default && (isLetter(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_";
	},
}, {
	state: DefaultState.mark_start,
	first(state, char) {
		return state === DefaultState.default && char === "'";
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.mark_end,
	first(state, char) {
		return state === DefaultState.mark_start && char === "'";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.mark_start,
	first(state, char) {
		return state === DefaultState.mark_start;
	},
	follow(char) {
		return char !== "" && isNotNewLine(char);
	},
}, {
	state: DefaultState.id,
	first(state, char) {
		return state === DefaultState.id && (isLetter(char) || isNumber(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_";
	},
}, {
	state: DefaultState.number_0,
	first(state, char) {
		return state === DefaultState.default && char === "0";
	},
	follow(char) {
		return char === "x" || char === "X" || is0_7(char) || char === ".";
	},
}, {
	state: DefaultState.number,
	first(state, char) {
		return state === DefaultState.default && is1_9(char);
	},
	follow(char) {
		return isNumber(char) || char === ".";
	},
}, {
	state: DefaultState.number_16_start,
	first(state, char) {
		return state === DefaultState.number_0 && (char === "x" || char === "X");
	},
	follow(char) {
		return is0_16(char);
	},
}, {
	state: DefaultState.number_8,
	first(state, char) {
		return state === DefaultState.number_0 && is0_7(char);
	},
	follow(char) {
		return is0_7(char);
	},
}, {
	state: DefaultState.double,
	first(state, char) {
		return (state === DefaultState.number_0 || state === DefaultState.number) && char === ".";
	},
	follow(char) {
		return isNumber(char);
	},
}, {
	state: DefaultState.number_16,
	first(state, char) {
		return state === DefaultState.number_16_start && is0_16(char);
	},
	follow(char) {
		return is0_16(char);
	},
}, {
	state: DefaultState.number_16,
	first(state, char) {
		return state === DefaultState.number_16 && is0_16(char);
	},
	follow(char) {
		return is0_16(char);
	},
}, {
	state: DefaultState.number_8,
	first(state, char) {
		return state === DefaultState.number_8 && is0_7(char);
	},
	follow(char) {
		return is0_7(char);
	},
}, {
	state: DefaultState.double,
	first(state, char) {
		return state === DefaultState.double && isNumber(char);
	},
	follow(char) {
		return isNumber(char);
	},
}, {
	state: DefaultState.number,
	first(state, char) {
		return state === DefaultState.number && isNumber(char);
	},
	follow(char) {
		return isNumber(char) || char === ".";
	},
}, {
	state: DefaultState.point,
	first(state, char) {
		return state === DefaultState.default && char === ".";
	},
	follow(char) {
		return isNumber(char);
	},
}, {
	state: DefaultState.double,
	first(state, char) {
		return state === DefaultState.point && isNumber(char);
	},
	follow(char) {
		return isNumber(char);
	},
}, {
	state: DefaultState.macro_start,
	first(state, char) {
		return state === DefaultState.default && char === "#";
	},
	follow(char) {
		return isLetter(char);
	},
}, {
	state: DefaultState.macro,
	first(state, char) {
		return state === DefaultState.macro_start && isLetter(char);
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_";
	},
}, {
	state: DefaultState.macro,
	first(state, char) {
		return state === DefaultState.macro && (isLetter(char) || isNumber(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_";
	},
}, {
	state: DefaultState.dollar,
	first(state, char) {
		return state === DefaultState.default && char === "$";
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.dollar_hex,
	first(state, char) {
		return state === DefaultState.dollar && is0_16(char);
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.dollar_macro_start,
	first(state, char) {
		return state === DefaultState.dollar && (isLetter(char) && !is0_16(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.dollar_macro_bad,
	first(state, char) {
		return state === DefaultState.dollar && char === "$";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.dollar_macro_start,
	first(state, char) {
		return state === DefaultState.dollar_hex && (isLetter(char) && !is0_16(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.dollar_hex,
	first(state, char) {
		return state === DefaultState.dollar_hex && is0_16(char);
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.dollar_macro_end,
	first(state, char) {
		return (state === DefaultState.dollar_hex || state === DefaultState.dollar_macro_start) && char === "$";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.dollar_macro_start,
	first(state, char) {
		return state === DefaultState.dollar_macro_start && (isLetter(char) || isNumber(char) || char === "_");
	},
	follow(char) {
		return isLetter(char) || isNumber(char) || char === "_" || char === "$";
	},
}, {
	state: DefaultState.plus,
	first(state, char) {
		return state === DefaultState.default && char === "+";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.sub,
	first(state, char) {
		return state === DefaultState.default && char === "-";
	},
	follow(char) {
		return char === ">";
	},
}, {
	state: DefaultState.mul,
	first(state, char) {
		return state === DefaultState.default && char === "*";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.assignment,
	first(state, char) {
		return state === DefaultState.default && char === "=";
	},
	follow(char) {
		return char === "=";
	},
}, {
	state: DefaultState.eq,
	first(state, char) {
		return state === DefaultState.assignment && char === "=";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.gt,
	first(state, char) {
		return state === DefaultState.default && char === ">";
	},
	follow(char) {
		return char === "=";
	},
}, {
	state: DefaultState.gt_eq,
	first(state, char) {
		return state === DefaultState.gt && char === "=";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.lt,
	first(state, char) {
		return state === DefaultState.default && char === "<";
	},
	follow(char) {
		return char === "=";
	},
}, {
	state: DefaultState.lt_eq,
	first(state, char) {
		return state === DefaultState.lt && char === "=";
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.field,
	first(state, char) {
		return state === DefaultState.default && (char === "(" || char === ")" || char === "[" || char === "]" || char === "{" || char === "}" || char === ",");
	},
	follow(char) {
		return false;
	},
}, {
	state: DefaultState.not,
	first(state, char) {
		return state === DefaultState.default && char === "!";
	},
	follow(char) {
		return char === "=";
	},
}, {
	state: DefaultState.not_eq,
	first(state, char) {
		return state === DefaultState.not && char === "=";
	},
	follow(char) {
		return false;
	},
}];
const DefaultTokenTypeDefines: TokenizeTypeDefine[] = [{
	state: DefaultState.div,
	tokenType: "op"
}, {
	state: DefaultState.block_comment_start,
	tokenType: "block_comment_defect"
}, {
	state: DefaultState.block_comment_wait_end,
	tokenType: "block_comment_defect"
}, {
	state: DefaultState.block_comment_end,
	tokenType: "block_comment"
}, {
	state: DefaultState.comment_start,
	tokenType: "comment"
}, {
	state: DefaultState.string_start,
	tokenType: "defect_string"
}, {
	state: DefaultState.string_escape,
	tokenType: "bad_escape_string"
}, {
	state: DefaultState.string_end,
	tokenType: "string"
}, {
	state: DefaultState.mark_start,
	tokenType: "defect_mark"
}, {
	state: DefaultState.mark_end,
	tokenType: "mark"
}, {
	state: DefaultState.id,
	tokenType: "id"
}, {
	state: DefaultState.number_0,
	tokenType: "integer"
}, {
	state: DefaultState.number,
	tokenType: "integer"
}, {
	state: DefaultState.number_8,
	tokenType: "octal"
}, {
	state: DefaultState.number_16_start,
	tokenType: "bad_hex"
}, {
	state: DefaultState.number_16,
	tokenType: "hex"
}, {
	state: DefaultState.double,
	tokenType: "float"
}, {
	state: DefaultState.point,
	tokenType: "op"
}, {
	state: DefaultState.macro_start,
	tokenType: "bad_macro"
}, {
	state: DefaultState.macro,
	tokenType: "macro"
}, {
	state: DefaultState.dollar,
	tokenType: "bad_dollar"
}, {
	state: DefaultState.dollar_macro_bad,
	tokenType: "bad_macro_variable"
}, {
	state: DefaultState.dollar_hex,
	tokenType: "dollar_hex"
}, {
	state: DefaultState.dollar_macro_start,
	tokenType: "bad_macro_variable"
}, {
	state: DefaultState.dollar_macro_end,
	tokenType: "macro_variable"
}, {
	state: DefaultState.plus,
	tokenType: "op"
}, {
	state: DefaultState.sub,
	tokenType: "op"
}, {
	state: DefaultState.mul,
	tokenType: "op"
}, {
	state: DefaultState.assignment,
	tokenType: "op"
}, {
	state: DefaultState.eq,
	tokenType: "op"
}, {
	state: DefaultState.field,
	tokenType: "op"
}, {
	state: DefaultState.not,
	tokenType: "op"
}, {
	state: DefaultState.not_eq,
	tokenType: "op"
}];

class Tokenizer {

	private constructor() { }

	public static get(content: string, handle?: TokenizerHandleFunction) {
		const tokenizer = TokenizerBuild.create(content, defaultState, DefaultTokenDefines, DefaultTokenTypeDefines);

		if (handle) {
			tokenizer.onTokenize(handle);
		}

		return tokenizer.get();
	}
}

export {
	Tokenize,
	TokenizerBuild,
	TokenizeDefine,
	TokenizeTypeDefine,
	DefaultState,
	DefaultTokenDefines,
	DefaultTokenTypeDefines,
	TokenizerHandleFunction,
	Tokenizer
};

if (false) {
	Tokenizer.get(`a123456`, (t) => {
		console.log(t);
	});
}


