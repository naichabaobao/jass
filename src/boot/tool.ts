
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

/*
！
retainZincBlock
retainVjassBlock
这两方法有优化空间
*/

// 保留zinc块，其他全部删除
function retainZincBlock(content: string) {
	let status = 0;
	let blockStart = 0;

	let line = 0;

	let isStag = true;
	let useless = false;

	let inZinc = false;

	content = content.replace(/\r\n/g, "\n");
	const len = content.length;
	const chars: string[] = [];
	for (let index = 0; index < len; index++) {
		const char = content.charAt(index);
		const nextChar = content.charAt(index + 1);
		if (status == 0) {
			if (char == "/") {
				blockStart = index;
				if (isStag) {
					useless = false;
				} else {
					useless = true;
				}
				if (nextChar == "/") {
					status = 1;
				} else if (nextChar == "*") {
					status = 2;
				} else {

				}
			} else if (char == "\"") {
				status = 4;
			} else if (inZinc) {
				chars.push(char);
			}
		} else if (status == 1) {
			if (!nextChar || isNewLine(nextChar)) {
				if (/\s*\/\/![ \t]+zinc/.test(content.substring(blockStart, index + 1))) {
					inZinc = true;
				} else if (/\s*\/\/![ \t]+endzinc/.test(content.substring(blockStart, index + 1))) {
					inZinc = false;
				}
				status = 0;
			}
		} else if (status == 2) {
			if (nextChar == "*") {
				status = 3;
			}
		} else if (status == 3) {
			if (nextChar == "/") { // 行注释结束
				status = 0;
			} else {
				status = 2;
			}
		} else if (status == 4) {
			if (nextChar == "\"") { // 字符串结束
				status = 0;
			} else if (nextChar == "\\") { //字符串进入转义状态
				status = 5;
			} else if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			}
		} else if (status == 5) {
			if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			} else { // 从新回到字符串状态
				status = 4;
			}
		}
		if (isNewLine(char)) {
			isStag = true;
			line++;
			if (!inZinc) {
				chars.push("\n");
			}
		} else if (isStag && char != " " && char != "\t") {
			isStag = false;
		}
	}

	return chars.join("");
}

// 保留vjass代码
function retainVjassBlock(content: string, callBack: ((line:number, comment:string) => void) | null = null) {
	let status = 0;
	let blockStart = 0;

	let line = 0;

	// 是否行开始为空白
	let isStag = true;
	// 是否无用
	let useless = false;

	let inZinc = false;

	content = content.replace(/\r\n/g, "\n");
	const len = content.length;
	const chars: string[] = [];
	for (let index = 0; index < len; index++) {
		const char = content.charAt(index);
		const nextChar = content.charAt(index + 1);
		if (status == 0) {
			if (char == "/") {
				blockStart = index;
				if (isStag) {
					useless = false;
				} else {
					useless = true;
				}
				if (nextChar == "/") {
					status = 1;
				} else if (nextChar == "*") {
					status = 2;
				} else {

				}
			} else if (char == "\"") {
				status = 4;
			} else if (!inZinc) {
				chars.push(char);
			}
		} else if (status == 1) {
			if (!nextChar || isNewLine(nextChar)) {
				const commentString = content.substring(blockStart, index + 1);
				if (/\s*\/\/![ \t]+zinc/.test(content.substring(blockStart, index + 1))) {
					inZinc = true;
				} else if (/\s*\/\/![ \t]+endzinc/.test(content.substring(blockStart, index + 1))) {
					inZinc = false;
				} else if (!useless) {
					if (callBack) {
						callBack(line, commentString.replace("//", ""));
					}
				}
				status = 0;
			}
		} else if (status == 2) {
			if (nextChar == "*") {
				status = 3;
			}
		} else if (status == 3) {
			if (nextChar == "/") { // 行注释结束
				status = 0;
			} else {
				status = 2;
			}
		} else if (status == 4) {
			if (nextChar == "\"") { // 字符串结束
				status = 0;
			} else if (nextChar == "\\") { //字符串进入转义状态
				status = 5;
			} else if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			}
		} else if (status == 5) {
			if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			} else { // 从新回到字符串状态
				status = 4;
			}
		}
		if (isNewLine(char)) {
			isStag = true;
			line++;
			
			if (inZinc) {
				chars.push("\n");
			}
		} else if (isStag && char != " " && char != "\t") {
			isStag = false;
		}
	}

	return chars.join("");
}

// 去重
function unique(arr: Array<string>) {
	return Array.from(new Set(arr));
}

export {
	is0_16,
	is0_7,
	is1_9,
	isLetter,
	isNewLine,
	isNotNewLine,
	isNumber,
	isSpace,
	retainZincBlock,
	unique,
	retainVjassBlock
};


