
import { is0_16, is0_7, is1_9, isLetter, isNewLine, isNotNewLine, isNumber, isSpace } from "../tool";

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
 * @deprecated 使用tokenize，而非tokens
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

// console.log(tokens(`->`));

// 包装方法
function tokenize(content: string) {
	return tokens(content);
}

export { Token, TokenType, tokens, tokenize };
