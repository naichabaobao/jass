import { isNewLine } from "../tool";
import { Context, Position } from "./ast";
import { LineText, ReplaceableLineText, RunTextMacro, TextMacro } from "./parser";


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

function linesByIndexOf(context:Context, content: string): LineText[] {
    const LineTexts: LineText[] = [];

    for (let index = 0; index < content.length;) {
        const newLineIndex = content.indexOf("\n", index);
        const fieldText = content.substring(index, newLineIndex == -1 ? content.length : newLineIndex + 1);

        LineTexts.push(new LineText(context, fieldText));

        if (newLineIndex == -1) {
            break;
        } else {
            index = newLineIndex + 1;
        }
    }

    return LineTexts;
}

// function linesBySplit(content: string): LineText[] {
//     const ls = content.split("\n");

//     const last = ls.pop();

//     const lineTexts = ls.map(x => new LineText(x + "\n"));

//     if (last) {
//         lineTexts.push(new LineText(last));
//     }

//     return lineTexts;
// }

/**
 * 
 * @param content 
 * @returns 
 */
function lines(context:Context, content: string): LineText[] {
    // const funcs = [linesByIndexOf, linesBySplit];
    // return funcs[Math.floor(Math.random() * funcs.length)](content).map((lineText, index) => {
    //     lineText.start = new Position(index, 0);
    //     lineText.end = new Position(index, lineText.text.length);
    //     return lineText;
    // });
    return linesByIndexOf(context, content).map((lineText, index) => {
        lineText.loc.start = new Position(index, 0);
        lineText.loc.end = new Position(index, lineText.getText().length);
        return lineText;
    });
}

export {removeComment, lines};

/**
 * 
 * @param content //! zinc 字符串
 */
export function isZincStart(content: string) {
	return /^\s*\/\/!\s+zinc\b/.test(content);
}
/**
 * 
 * @param content //! zinc 字符串
 */
export function isZincEnd(content: string) {
	return /^\s*\/\/!\s+endzinc\b/.test(content);
}

// 




