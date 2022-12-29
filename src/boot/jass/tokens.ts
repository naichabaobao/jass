
import { resolve } from "path";
import { cwd } from "process";
import { getFileContent, is0_16, is0_7, is1_9, isLetter, isNewLine, isNotNewLine, isNumber, isSpace } from "../tool";
import { Position, Range } from "./ast";

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
	first:(state: number, char: string) => boolean;
	follow:(char: string) => boolean;
	tokenType: string;
}

class TokenizeDefineStruct implements TokenizeDefine{
	public constructor(state: number, tokenType: string, first:(state: number, char: string) => boolean, follow:(char: string) => boolean) {
		this.state = state;
		this.tokenType = tokenType;
		this.first = first;
		this.follow = follow;
	}
	public readonly state: number;
	public readonly first: (state: number, char: string) => any;
	public readonly follow: (char: string) => any;
	public readonly tokenType: string;
}

interface TokenizeTypeDefine {
	tokenType: string;
	state: number;
}

class TokenizerBuild {
	private content: string;
	private eventMap: Map<string, TokenizerHandleFunction|Array<TokenizerHandleFunction>> = new Map();
	private defines: TokenizeDefine[] = [];
	private readonly defaultState:number;
	private handle?: TokenizerHandleFunction;

	private constructor(content: string, defaultState: number, defines?:TokenizeDefine[]) {
		this.content = content;
		this.defaultState = defaultState;
		if (defines) {
			this.defines = defines;
		}
	}

	public static create(content: string, defaultState: number, defines?: TokenizeDefine[]) {
		return new TokenizerBuild(content, defaultState, defines);
	}
	public setTokenDefines(defines: TokenizeDefine[]) {
		this.defines = defines;
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
					if (cellects.length > 0) {
						const value: string = cellects.join(""), start: Position = new Position(lineNumber, charPosition - cellects.length), end: Position = new Position(lineNumber, charPosition);
						const token = new Tokenize(def.tokenType, value, start, end);
						if (handle) handle(token);

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
	not_eq = 37,
	unkown = 38,
	lua_start = 39,
	lua_wait = 42,
	lua_end = 40,
	what = 41
};

class Tokenizer {

	private constructor() { }

	public static get(content: string, handle?: TokenizerHandleFunction) {
		const tokenizer = TokenizerBuild.create(content, defaultState, this.jassDefaultTokenizeDefines());

		if (handle) {
			tokenizer.onTokenize(handle);
		}

		return tokenizer.get();
	}

	private static readonly JassCommentTokenizeDefine:TokenizeDefine[] = [
		new TokenizeDefineStruct(DefaultState.comment_start, "comment", (state, char) =>  state === DefaultState.div && char === "/", (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.comment_start, "comment", (state, char) =>  state === DefaultState.comment_start, (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.block_comment_start, "block_comment_defect", (state, char) =>  state === DefaultState.div && char === "*", (char) =>  char !== ""),		
		new TokenizeDefineStruct(DefaultState.block_comment_wait_end, "block_comment_defect", (state, char) =>  state === DefaultState.block_comment_start && char === "*", (char) =>  char !== ""),		
		new TokenizeDefineStruct(DefaultState.block_comment_start, "block_comment_defect", (state, char) =>  state === DefaultState.block_comment_start, (char) =>  char !== ""),		
		new TokenizeDefineStruct(DefaultState.block_comment_wait_end, "block_comment_defect", (state, char) =>  state === DefaultState.block_comment_wait_end && char === "*", (char) =>  char !== ""),		
		new TokenizeDefineStruct(DefaultState.block_comment_end, "block_comment", (state, char) =>  state === DefaultState.block_comment_wait_end && char === "/", (char) =>  false),	
	];

	private static readonly JassMarkTokenizeDefine:TokenizeDefine[] = [
		new TokenizeDefineStruct(DefaultState.mark_start, "defect_mark", (state, char) =>  state === DefaultState.default && char === "'", (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.mark_end, "mark", (state, char) =>  state === DefaultState.mark_start && char === "'", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.mark_start, "defect_mark", (state, char) =>  state === DefaultState.mark_start, (char) =>  char !== "" && isNotNewLine(char)),		
		
	];
	private static readonly JassDollarTokenizeDefine:TokenizeDefine[] = [
		new TokenizeDefineStruct(DefaultState.dollar, "id", (state, char) =>  state === DefaultState.default && char === "$", (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.dollar_hex, "dollar_hex", (state, char) =>  state === DefaultState.dollar && is0_16(char), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.id, "id", (state, char) =>  state === DefaultState.dollar && (isLetter(char) && !is0_16(char) || char === "_" || char === "$"), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		// new TokenizeDefineStruct(DefaultState.dollar_macro_bad, "id", (state, char) =>  state === DefaultState.dollar && char === "$", (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.id, "id", (state, char) =>  state === DefaultState.dollar_hex && (isLetter(char) && !is0_16(char) || char === "_" || char === "$"), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.dollar_hex, "dollar_hex", (state, char) =>  state === DefaultState.dollar_hex && is0_16(char), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		// new TokenizeDefineStruct(DefaultState.dollar_macro_end, (state, char) =>  (state === DefaultState.dollar_hex || state === DefaultState.dollar_macro_start) && char === "$", (char) =>  false),		
		// new TokenizeDefineStruct(DefaultState.dollar_macro_start, (state, char) =>  state === DefaultState.dollar_macro_start && (isLetter(char) || isNumber(char) || char === "_"), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		
	];

	private static readonly JassTokenizeDefine:TokenizeDefine[] = [
		new TokenizeDefineStruct(DefaultState.div, "op", (state, char) =>  state === DefaultState.default && char === "/", (char) =>  char === "/" || char === "*"),		
		new TokenizeDefineStruct(DefaultState.string_start, "defect_string", (state, char) =>  state === DefaultState.default && char === "\"", (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.string_escape, "defect_string", (state, char) =>  state === DefaultState.string_start && char === "\\", (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.string_start, "defect_string", (state, char) =>  state === DefaultState.string_escape, (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.string_end, "string", (state, char) =>  state === DefaultState.string_start && char === "\"", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.string_start, "defect_string", (state, char) =>  state === DefaultState.string_start, (char) =>  char !== "" && isNotNewLine(char)),		
		new TokenizeDefineStruct(DefaultState.id, "id", (state, char) =>  state === DefaultState.default && (isLetter(char) || char === "_"), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.id, "id", (state, char) =>  state === DefaultState.id && (isLetter(char) || isNumber(char) || char === "_" || char === "$"), (char) =>  isLetter(char) || isNumber(char) || char === "_" || char === "$"),		
		new TokenizeDefineStruct(DefaultState.number_0, "int", (state, char) =>  state === DefaultState.default && char === "0", (char) =>  char === "x" || char === "X" || is0_7(char) || char === "."),		
		new TokenizeDefineStruct(DefaultState.number, "int", (state, char) =>  state === DefaultState.default && is1_9(char), (char) =>  isNumber(char) || char === "."),		
		new TokenizeDefineStruct(DefaultState.number_16_start, "hex", (state, char) =>  state === DefaultState.number_0 && (char === "x" || char === "X"), (char) =>  is0_16(char)),		
		new TokenizeDefineStruct(DefaultState.number_8, "octal", (state, char) =>  state === DefaultState.number_0 && is0_7(char), (char) =>  is0_7(char)),		
		new TokenizeDefineStruct(DefaultState.double, "real", (state, char) =>  (state === DefaultState.number_0 || state === DefaultState.number) && char === ".", (char) =>  isNumber(char)),		
		new TokenizeDefineStruct(DefaultState.number_16, "hex", (state, char) =>  state === DefaultState.number_16_start && is0_16(char), (char) =>  is0_16(char)),		
		new TokenizeDefineStruct(DefaultState.number_16, "hex", (state, char) =>  state === DefaultState.number_16 && is0_16(char), (char) =>  is0_16(char)),		
		new TokenizeDefineStruct(DefaultState.number_8, "octal", (state, char) =>  state === DefaultState.number_8 && is0_7(char), (char) =>  is0_7(char)),		
		new TokenizeDefineStruct(DefaultState.double, "real", (state, char) =>  state === DefaultState.double && isNumber(char), (char) =>  isNumber(char)),		
		new TokenizeDefineStruct(DefaultState.number, "int", (state, char) =>  state === DefaultState.number && isNumber(char), (char) =>  isNumber(char) || char === "."),		
		new TokenizeDefineStruct(DefaultState.point, "op", (state, char) =>  state === DefaultState.default && char === ".", (char) =>  isNumber(char)),		
		new TokenizeDefineStruct(DefaultState.double, "real", (state, char) =>  state === DefaultState.point && isNumber(char), (char) =>  isNumber(char)),		
		new TokenizeDefineStruct(DefaultState.macro_start, "macro", (state, char) =>  state === DefaultState.default && char === "#", (char) =>  isLetter(char)),		
		new TokenizeDefineStruct(DefaultState.macro, "macro", (state, char) =>  state === DefaultState.macro_start && isLetter(char), (char) =>  isLetter(char) || isNumber(char) || char === "_"),		
		new TokenizeDefineStruct(DefaultState.macro, "macro", (state, char) =>  state === DefaultState.macro && (isLetter(char) || isNumber(char) || char === "_"), (char) =>  isLetter(char) || isNumber(char) || char === "_"),		
		new TokenizeDefineStruct(DefaultState.plus, "op", (state, char) =>  state === DefaultState.default && char === "+", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.sub, "op", (state, char) =>  state === DefaultState.default && char === "-", (char) =>  char === ">"),		
		new TokenizeDefineStruct(DefaultState.default, "op", (state, char) =>  state === DefaultState.sub && char === ">", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.mul, "op", (state, char) =>  state === DefaultState.default && char === "*", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.assignment, "op", (state, char) =>  state === DefaultState.default && char === "=", (char) =>  char === "="),		
		new TokenizeDefineStruct(DefaultState.eq, "op", (state, char) =>  state === DefaultState.assignment && char === "=", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.gt, "op", (state, char) =>  state === DefaultState.default && char === ">", (char) =>  char === "="),		
		new TokenizeDefineStruct(DefaultState.gt_eq, "op", (state, char) =>  state === DefaultState.gt && char === "=", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.lt, "op", (state, char) =>  state === DefaultState.default && char === "<", (char) =>  char === "=" || char === "?"),		
		new TokenizeDefineStruct(DefaultState.lt_eq, "op", (state, char) =>  state === DefaultState.lt && char === "=", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.field, "op", (state, char) =>  state === DefaultState.default && (char === "(" || char === ")" || char === "[" || char === "]" || char === "{" || char === "}" || char === ","), (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.not, "op", (state, char) =>  state === DefaultState.default && char === "!", (char) =>  char === "="),		
		new TokenizeDefineStruct(DefaultState.not_eq, "op", (state, char) =>  state === DefaultState.not && char === "=", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.lua_start, "lua_start", (state, char) =>  state === DefaultState.lt && char === "?", (char) =>  true),		
		// new TokenizeDefineStruct(DefaultState.default, "lua_start", (state, char) =>  state === DefaultState.lua_start && char === "=", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.lua_wait, "lua_start", (state, char) =>  state === DefaultState.lua_start && char === "?", (char) =>  true),		
		new TokenizeDefineStruct(DefaultState.lua_wait, "lua_start", (state, char) =>  state === DefaultState.lua_wait && char === "?", (char) =>  true),		
		new TokenizeDefineStruct(DefaultState.lua_end, "lua", (state, char) =>  state === DefaultState.lua_wait && char === ">", (char) =>  false),		
		new TokenizeDefineStruct(DefaultState.lua_start, "lua_start", (state, char) =>  state === DefaultState.lua_wait, (char) =>  true),		
		new TokenizeDefineStruct(DefaultState.lua_start, "lua_start", (state, char) =>  state === DefaultState.lua_start, (char) =>  true),		
		new TokenizeDefineStruct(DefaultState.unkown, "unkown", (state, char) =>  state ==DefaultState.default && /\S/.test(char), (char) =>  /\S/.test(char)),
		new TokenizeDefineStruct(DefaultState.unkown, "unkown", (state, char) =>  state ==DefaultState.unkown && /\S/.test(char), (char) =>  /\S/.test(char)),
	];

	private static jassDefaultTokenizeDefines() {
		return [...this.JassCommentTokenizeDefine, ...this.JassMarkTokenizeDefine, ...this.JassDollarTokenizeDefine, ...this.JassTokenizeDefine];
	}

	/**
	 * jass词法分析
	 * @param content 
	 * @param handle 
	 */
	public static tokenize(content: string, handle?: TokenizerHandleFunction) {
		this.build(content, handle);
	}

	public static build(content: string, handle?: TokenizerHandleFunction) {
		const tokenizer = TokenizerBuild.create(content, defaultState, this.jassDefaultTokenizeDefines());

		if (handle) {
			tokenizer.onTokenize(handle)
		}

		tokenizer.build();
	}
}

export {
	Tokenize,
	TokenizerBuild,
	TokenizeDefine,
	TokenizeTypeDefine,
	DefaultState,
	TokenizerHandleFunction,
	Tokenizer
};

if (false) {
	const content = `
	_$$_
	<?=

	?



	??????

	123
?
	`;
	console.time("Tokenizer");
	// console.log(Tokenizer.get(content).length);
	// Tokenizer.get(content, (t) => {
	// 	console.log(t);
	// });
	Tokenizer.get(content, (t) => console.log(t));
	console.timeEnd("Tokenizer");

	console.time("tokenize");
	// console.log(tokenize(content));
	// console.log(tokenize(content).length);
	console.timeEnd("tokenize");
}


