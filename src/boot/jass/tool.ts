import { isNewLine } from "../tool";

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

export {removeComment};