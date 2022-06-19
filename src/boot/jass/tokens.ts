
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

function _isLetter(char: string): boolean {
	if (!char) {
		return false;
	}
	return /[a-zA-Z]/.test(char);
}

function _isNumerical(char: string): boolean {
	if (!char) {
		return false;
	}
	return /\d/.test(char);
}

function _isNumerical_0_7(char: string): boolean {
	return ["0", "1", "2", "3", "4", "5", "6", "7"].includes(char);
}

function _isNumerical_16(char: string): boolean {
	if (!char) {
		return false;
	}
	return _isNumerical(char) || /[a-fA-F]/.test(char);
}

function _isIdentifier(char: string): boolean {
	if (!char) {
		return false;
	}
	return _isLetter(char) || _isNumerical(char) || char === "_";
}

function _isSpace(char: string): boolean {
	if (!char) {
		return false;
	}
	return /\s/.test(char);
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

interface TokenPair {
	char: string;
	state: number;
}

interface PairName {
	type: string;
}
interface WrapPair  extends PairName{
	start: string[];
	end: string[];
}


interface Chars extends PairName{
	chars: string[]
}


interface TokenDefine {
	defines: TokenPair[];
	tokenType: string;
	handle: (pair: TokenPair, defines: TokenPair[]) => number;
}

type TokenDefineNeed = WrapPair|Chars;

function tokenizeProgram(document: Document) {

}

class TokenizerEvent {
    public readonly document: Document;

    constructor(document: Document) {
        this.document = document;
    }

}
type TokenizerHandleFunction = (token:NewToken) => void;

/**
 * 一个新的Token,使用更统一的Range,type的类型更松散
 */
class NewToken extends Range{
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

interface TokenizeElseDefine {
	tokenType: string;
	state: number;
}

class Tokenizer<D extends TokenizeDefine, E extends TokenizeElseDefine> {
	private document: Document;
	private eventMap: Map<string, TokenizerHandleFunction|Array<TokenizerHandleFunction>> = new Map();
	private readonly defines: D[];
	private readonly elseDefines: E[];
	private readonly defaultState:number;
	private handle?: TokenizerHandleFunction;

	private constructor(document: Document, defaultState: number, defines:D[], elseDefines:E[]) {
		this.document = document;
		this.defaultState = defaultState;
		this.defines = defines;
		this.elseDefines = elseDefines;
	}

	public static create<D extends TokenizeDefine, E extends TokenizeElseDefine>(document: Document, defaultState: number, defines: D[], elseDefines:E[]) {
		return new Tokenizer(document, defaultState, defines, elseDefines);
	}

	private tokenize(handle?: TokenizerHandleFunction) {
		let state: number = this.defaultState;

		let cellects:string[] = [];
		for (let lineNumber = 0; lineNumber < this.document.lineCount; lineNumber++) {
			const lineText = this.document.lineAt(lineNumber);
			
			for (let charPosition = 0; charPosition < lineText.length(); charPosition++) {
				const char = lineText.getText().charAt(charPosition);
				const next_char = lineText.getText().charAt(charPosition + 1);
				
				const def = this.defines.find((d) => {
					return d.first(state, char);
				});
				if (def) {
					state = def.state;
					cellects.push(char);

					if (!def.follow(next_char)) {
						const el = this.elseDefines.find(el => el.state === state);
						if (cellects.length > 0) {
							const value: string = cellects.join(""), start: Position = new Position(lineNumber, charPosition - cellects.length), end: Position = new Position(lineNumber, charPosition);
							if (el) {
								const token = new NewToken(el.tokenType, value, start, end);
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
	}

	public build(): void {
		this.tokenize(this.handle);
	}

	public get() {
		const tokens: NewToken[] = [];
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



// console.log(tokens(`->`));

// 包装方法
function tokenize(content: string) {
	return tokens(content);
}

export { Token, TokenType, tokens, tokenize };

if (true) {
	const defaultState: number = 0;
	enum Sta {
		default = defaultState,
		div = 1,
		comment_start = 2,
		block_comment_start = 3,
		block_comment_wait_end = 4,
		block_comment_end = 5,
		string_start = 6,
		string_escape = 7,
		string_end = 8,
	};
	const ds: TokenizeDefine[] = [{
		state: Sta.div,
		first(state, char) {
			return state === Sta.default && char === "/";
		},
		follow(char) {
			return char === "/" || char === "*";
		},
	}, {
		state: Sta.comment_start,
		first(state, char) {
			return state === Sta.div && char === "/";
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}, {
		state: Sta.comment_start,
		first(state, char) {
			return state === Sta.comment_start;
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}, {
		state: Sta.block_comment_start,
		first(state, char) {
			return state === Sta.div && char === "*";
		},
		follow(char) {
			return char !== "";
		},
	}, {
		state: Sta.block_comment_wait_end,
		first(state, char) {
			return state === Sta.block_comment_start && char === "*";
		},
		follow(char) {
			return char !== "";
		},
	}, {
		state: Sta.block_comment_start,
		first(state, char) {
			return state === Sta.block_comment_start;
		},
		follow(char) {
			return char !== "";
		},
	}, {
		state: Sta.block_comment_wait_end,
		first(state, char) {
			return state === Sta.block_comment_wait_end && char === "*";
		},
		follow(char) {
			return char !== "";
		},
	}, {
		state: Sta.block_comment_end,
		first(state, char) {
			return state === Sta.block_comment_wait_end && char === "/";
		},
		follow(char) {
			return false;
		},
	}, {
		state: Sta.string_start,
		first(state, char) {
			return state === Sta.default && char === "\"";
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}, {
		state: Sta.string_escape,
		first(state, char) {
			return state === Sta.string_start && char === "\\";
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}, {
		state: Sta.string_start,
		first(state, char) {
			return state === Sta.string_escape;
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}, {
		state: Sta.string_end,
		first(state, char) {
			return state === Sta.string_start && char === "\"";
		},
		follow(char) {
			return false;
		},
	}, {
		state: Sta.string_start,
		first(state, char) {
			return state === Sta.string_start;
		},
		follow(char) {
			return char !== "" && isNotNewLine(char);
		},
	}];
	const des: TokenizeElseDefine[] = [{
		state: Sta.div,
		tokenType: "op"
	}, {
		state: Sta.block_comment_start,
		tokenType: "block_comment_defect"
	}, {
		state: Sta.block_comment_wait_end,
		tokenType: "block_comment_defect"
	}, {
		state: Sta.block_comment_end,
		tokenType: "block_comment"
	}, {
		state: Sta.comment_start,
		tokenType: "comment"
	}, {
		state: Sta.string_start,
		tokenType: "defect_string"
	}, {
		state: Sta.string_escape,
		tokenType: "bad_escape_string"
	}, {
		state: Sta.string_end,
		tokenType: "string"
	}];
	const content = `
	/*a*//*b*/
	"aaa""bbb"`;
	const d1 = new Document("E:/projects/jass/src/boot/jass/tokens.ts", content);
	const d2 = new Document("C:/Users/Administrator/Desktop/test.j");
	
	const tokenizer = Tokenizer.create<TokenizeDefine, TokenizeElseDefine>(d1, defaultState, ds, des);

	tokenizer.onTokenize((token) => {
		console.log(token);
	});

	tokenizer.build();
}
