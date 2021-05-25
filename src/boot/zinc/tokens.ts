
type TokenType = "id" | "op" | "int" | "real" | "string" | "mark" | "error";

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

	public get end(): number {
		return this.position + this.value.length;
	}

}


const letterRegExp = new RegExp(/[a-zA-Z]/);
const numberRegExp = new RegExp(/\d/);
const spaceRegExp = new RegExp(/[ \t]/);
const newLineRegExp = new RegExp(/[\r\n]/);
const idRegExp = new RegExp(/[a-zA-Z][a-zA-Z0-9_]*/);

function isLetter(char: string) {
	return letterRegExp.test(char);
}

function isNumber(char: string) {
	return numberRegExp.test(char);
}

function is1_9(char: string) {
	return new RegExp(/[1-9]/).test(char);
}

function is0_7(char: string) {
	return new RegExp(/[0-7]/).test(char);
}

function is0_16(char: string) {
	return isNumber(char) || /[a-fA-F]/.test(char);
}


function isSpace(char: string) {
	return spaceRegExp.test(char);
}

function isNewLine(char: string) {
	return newLineRegExp.test(char);
}

function isNotNewLine(char: string) {
	return /[^\r\n]/.test(char)// || isSpace(char); // char != "\n" // !(char == "\n" || char == "\r")
}

function replaceComment(text: string, startIndex: number, endIndex: number, char: string = " ") {
	if (endIndex <= startIndex) {
		throw "endIndex <= startIndex";
	}

	text.replace(/.+/, (reg, match) => {
		return "";
	})

	function replaceContent(content: string) {
		if (content.length == 0) {
			return content;
		}
		return content.split("\n").map(x => "".padStart(x.length, char)).join("\n");
	}
	let preText = text.substring(0, startIndex) + replaceContent(text.substring(startIndex, endIndex + 1));
	if (endIndex + 1 < text.length) {
		preText += text.substring(endIndex + 1, text.length);
	}
	return preText;
}

function removeComment(content: string) {
	let status = 0;
	let blockStart = 0;

	let line = 0;

	let isStag = true;
	let useless = false;

	// const comments:Array<LineComment> = [];
	const map = new Map<number, string>();

	const lineCommentOver = (start: number, end: number) => {
		const text = content.substring(start, end + 1);
		if (!useless) {
			if (/\s*\/\/!/.test(text)) {
				//   this._usefulLineComments.push(new LineComment(line, text));
			} else if (/\s*\/\//.test(text)) {
				map.set(line, text.replace("//", ""));
			}
		}
		content.replace(text, "".padStart(text.length, " "));
		// else content = this._replace(content, start, end);
	}
	const len = content.length;
	for (let index = 0; index < len; index++) {
		const char = content.charAt(index)
		if (status == 0) {
			if (char == "/") {
				status = 1;
				blockStart = index;
				if (isStag) {
					useless = false;
				} else {
					useless = true;
				}
			} else if (char == "\"") {
				status = 5;
			}
		} else if (status == 1) {
			if (char == "*") {
				status = 2;
			} else if (char == "/") {
				status = 3;
			} else {
				status = 0;
			}
		} else if (status == 2) {
			if (char == "*") {
				status = 4;
			}
		} else if (status == 3) {
			if (isNewLine(char)) { // 行注释结束
				status = 0;
				lineCommentOver(blockStart, index);
				content = replaceComment(content, blockStart, index);
			}
		} else if (status == 4) {
			if (char == "/") { // 块注释结束
				status = 0;
				content = replaceComment(content, blockStart, index);
			} else {
				status = 2;
			}
		} else if (status == 5) {
			if (char == "\"") { // 字符串结束
				status = 0;
			} else if (char == "\\") { //字符串进入转义状态
				status = 6;
			} else if (isNewLine(char)) { // 字符串结束
				status = 0;
			}
		} else if (status == 6) {
			if (isNewLine(char)) { // 字符串结束
				status = 0;
			} else { // 从新回到字符串状态
				status = 5;
			}
		}
		if (isNewLine(char)) {
			isStag = true;
			line++;
		} else if (char != " " && char != "\t") {
			isStag = false;
		}
	}
	if (status == 2 || status == 4) { // 未闭合块注释
		content = replaceComment(content, blockStart, content.length - 1);
	} if (status == 3) { // 行注释结束
		lineCommentOver(blockStart, content.length - 1);
		content = replaceComment(content, blockStart, content.length - 1);
	}
	return { content, comments: map };
}

/**
 * 
 * @param content
 * @returns 
 */
function tokens(content: string): Token[] {
	const tokens: Token[] = [];
	const bads: Token[] = [];

	const nonCommentContent = removeComment(content);
	const tempContent = nonCommentContent.content;

	let lineNumber = 0;
	let position = 0;
	let state = 0;
	const next = (index: number) => {
		return tempContent[index + 1];
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
	for (let index = 0; index < tempContent.length; index++) {
		const char = tempContent[index];
		const nextChar = next(index);

		if (state == 0) {
			if (isLetter(char)) {
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
				if (nextChar && nextChar == "\"") {
					state = 4;
				} else if (nextChar && nextChar == "\\") {
					state = 5
				} else if (nextChar && isNotNewLine(nextChar)) {
					state = 6;
				} else {
					bad();
				}
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
			} else if (char == "/") {
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
			} else if (isSpace(char) || isNewLine(char)) {
			} else {
				push(char);
				bad();
			}
		} else if (state == 1) {
			push(char);
			if (nextChar && isLetter(nextChar) || nextChar == "_" || isNumber(nextChar)) {
				continue;
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
			pushToken("string");
		} else if (state == 5) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 7;
			} else if (nextChar && isNotNewLine(nextChar)) {
				state = 6;
			} else {
				bad();
			}
		} else if (state == 6) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 4;
			} else if (nextChar && nextChar == "\\") {
				state = 5
			} else if (nextChar && isNotNewLine(nextChar)) {
			} else {
				bad();
			}
		} else if (state == 7) {
			push(char);
			if (nextChar && nextChar == "\"") {
				state = 4;
			} else if (nextChar && isNotNewLine(nextChar)) {
				state = 6;
			} else {
				bad();
			}
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
		}

		if (isNewLine(char)) {
			lineNumber++;
			position = 0;
		} else {
			position++;
		}
	}
	// console.log(tokens);
	return tokens;
}

export {
	Token,
	TokenType,
	tokens
};