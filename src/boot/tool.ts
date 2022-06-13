import * as fs from "fs";
import * as path from "path";

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
	if (!char) return false;
	return newLineRegExp.test(char);
}

function isNotNewLine(char: string) {
	return /[^\r\n]/.test(char)// || isSpace(char); // char != "\n" // !(char == "\n" || char == "\r")
}

const spaceCode = " ".charCodeAt(0);

/**
 * 移除所有注释
 * @param content 
 */
function removeComment(content: string): string {
	let status = 0;
	let blockStart = 0;

	let line = 0;

	content = content.replace(/\r\n/g, "\n");
	const len = content.length;
	const chars: string[] = [];

	for (let index = 0; index < len; index++) {
		const char = content.charAt(index);
		const nextChar = content.charAt(index + 1);
		if (status == 0) {
			if (char == "/") {
				blockStart = index;
				if (nextChar == "/") {
					status = 1;
				} else if (nextChar == "*") {
					status = 2;
				} else {
					chars.push(char);
				}
			} else if (char == "\"") {
				status = 4;
				chars.push(char);
			} else {
				chars.push(char);
			}
		} else if (status == 1) {
			if (!nextChar || isNewLine(nextChar)) {
				// 注释
				status = 0;
			}
		} else if (status == 2) {
			if (nextChar == "*") {
				status = 3;
			}
			if (isNewLine(char)) {
				chars.push("\n");
			}
		} else if (status == 3) {
			if (nextChar == "/") { // 块注释结束
				status = 6;
			} else {
				status = 2;
			}
		} else if (status == 6) {
			status = 0;
		} else if (status == 4) {
			if (nextChar == "\"") { // 字符串结束
				status = 0;
			} else if (nextChar == "\\") { //字符串进入转义状态
				status = 5;
			} else if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			}
			chars.push(char);
		} else if (status == 5) {
			if (isNewLine(nextChar)) { // 字符串结束
				status = 0;
			} else { // 从新回到字符串状态
				status = 4;
			}
			chars.push(char);
		}
		if (isNewLine(char)) {
			line++;
		}
	}
	return chars.join("");
}

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
			if (nextChar == "/") { // 块注释结束
				status = 6;
			} else if (nextChar == "*") {

			} else {
				status = 2;
			}
		} else if (status == 6) {
			status = 0;
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
function retainVjassBlock(content: string, callBack: ((line: number, comment: string) => void) | null = null) {
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
			if (nextChar == "/") { // 块注释结束
				status = 6;
			} else if (nextChar == "*") {

			} else {
				status = 2;
			}
		} else if (status == 6) {
			status = 0;
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

// 统计换行符数
function countNewLine(content: string) {
	let count = 0;
	for (let index = 0; index < content.length; index++) {
		const char = content[index];
		if (isNewLine(char)) {
			count++;
		}
	}
	return count;
}

/**
 * @deprecated
 */
class BlockMark {
	public line: number;
	public content: string;
	public endLine: number;

	constructor(line: number, content: string) {
		this.line = line;
		this.content = content;
		this.endLine = line + countNewLine(content);
	}
}
/**
 * @deprecated
 * @param content 
 */
function retainJassBlock(content: string) {
	content = removeComment(content);

	const marks = new Array<BlockMark>();
	content.replace(/(?:^globals\b[\s\S]+?^endglobals\b|^function\b[\s\S]+?^endfunction\b|(?:constant\s+)?native[\s\S]+?$)/gm, (text, index: number, origin: string) => {
		let lineNumber = countNewLine(origin.substring(0, index))
		marks.push(new BlockMark(lineNumber, text));

		text.replace(/^globals\b[\s\S]+?^endglobals\b/gm, (text, index: number, origin: string) => {

			let lineNumber = countNewLine(origin.substring(0, index))
			marks.push(new BlockMark(lineNumber, text));

			return "";
		});

		return "";
	});
	console.log(marks)


}

/**
 * 去重
 * @param arr 
 * @returns 
 */
function unique(arr: Array<string>) {
	return Array.from(new Set(arr));
}

// 文件内文件数量
const maxFileNumber = 24;

class ResolvePathOption {
	/**
	 * 最大遍历数
	 * 避免遇到文件数量太多而不停递归
	 */
	recursionNumber?: number = maxFileNumber;
	/**
	 * 检查后缀是否为.j或.ai
	 */
	checkExt?: boolean = true;

	public static default() {
		const option = new ResolvePathOption();
	}
}

/**
 * 解析目录下所有文件
 * @param paths 
 * @returns 
 */
function resolvePaths(paths: Array<string>, options: ResolvePathOption = new ResolvePathOption()) {
	if (paths.length == 0) {
		return [];
	}
	return paths.flatMap(val => {
		const arr = new Array<string>();
		// 处理控制符问题
		// if (val.charCodeAt(0) == 8234) {
		//   val = val.substring(1);
		// }
		if (!fs.existsSync(val)) {
			return arr;
		}
		const stat = fs.statSync(val);
		if (stat.isFile()) {
			if (options.checkExt) {
				if (isJFile(val) || isAiFile(val)) {
					arr.push(val);
				}
			} else {
				arr.push(val);
			}
		} else if (stat.isDirectory()) {
			const subPaths = fs.readdirSync(val).map(fileName => path.resolve(val, fileName));
			const recursionNumber = (options.recursionNumber ?? maxFileNumber);
			arr.push(...resolvePaths(subPaths.length > recursionNumber ? subPaths.slice(0, recursionNumber) : subPaths));
		}
		return arr;
	});
}
function isExt(filePath: string, ext: string) {
	return path.parse(filePath).ext == ext;
}
// 文件后缀是否为.j
function isJFile(filePath: string) {
	return isExt(filePath, ".j") || isExt(filePath, ".jass");
}
// 文件后缀是否为.ai
function isAiFile(filePath: string) {
	return isExt(filePath, ".ai");
}
// 文件后缀是否为.ai
function isZincFile(filePath: string) {
	return isExt(filePath, ".zn");
}
// 文件后缀是否为.ai
function isLuaFile(filePath: string) {
	return isExt(filePath, ".lua");
}
/**
 * 解析出路径文件名称
 * @param filePath 
 */
function getPathFileName(filePath: string): string {
	return path.parse(filePath).base;
}

function compare(key: string, key2: string): boolean {
	const keyParsedPath = path.parse(key);
	const key2ParsedPath = path.parse(key2);
	// console.log(path.relative(keyParsedPath.dir ,key2ParsedPath.dir), keyParsedPath.dir ,key2ParsedPath.dir, keyParsedPath.base, key2ParsedPath.base);
	
	return path.relative(keyParsedPath.dir ,key2ParsedPath.dir) == "" && keyParsedPath.base == key2ParsedPath.base;
}

// 是文件和是否存在
function isUsableFile(filePath: string) {
	return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
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
	retainVjassBlock,
	removeComment,
	resolvePaths,
	isJFile,
	isAiFile,
	isZincFile,
	isLuaFile,
	getPathFileName,
	compare,
	isUsableFile
};


// console.log(removeComment("'" + `
// // a
// /*
// */
// `) + "'");


