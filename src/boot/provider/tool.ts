import * as vscode from 'vscode';
import { Position } from '../jass/loc';
import { tokens } from '../jass/tokens';
import { Options } from './options';

import { compare } from '../tool';

class Key {
	/**
	 * 使用时需反转
	 * 匹配到的function名称，如果时多个时可能包含struct变量名称
	 * 多个时如：  
	 * local StructType s = StructType.create()
	 * call s.doSomeThing()
	 * keys中会包含 ["doSomeThing", "s"]
	 */
	public keys: string[] = [];
	/**
	 * 第几个参数
	 */
	public takeIndex: number = 0;

	public isSingle() {
		return this.keys.length == 1;
	}

	public isEmpty() {
		return this.keys.length == 0;
	}

}

// 获取当前位置方法名称
function functionKey(document: vscode.TextDocument, position: vscode.Position) {
	const key = new Key();

	const lineText = document.lineAt(position.line);

	const ts = tokens(lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character));

	let field = 0;
	let activeParameter = 0;
	let inName = false;
	let nameState = 0;
	for (let index = ts.length - 1; index >= 0; index--) {
		const token = ts[index];
		if (!token) break;
		if (inName) {
			if (nameState == 0) {
				if (token.isId()) {
					key.keys.push(token.value);
					nameState = 1;
				} else {
					break;
				}
			} else if (nameState == 1) {
				if (token.isOp() && token.value == ".") {
					nameState = 0;
				} else {
					break;
				}
			}
		} else if (token.isOp() && token.value == ",") {
			if (field == 0) {
				activeParameter++;
			}
		} else if (token.isOp() && token.value == ")") {
			field++;
		} else if (token.isOp() && token.value == "(") {
			if (field > 0) {
				field--;
			} else {
				inName = true;
				key.takeIndex = activeParameter;
			}
		}
	}

	return key;
}

/**
 * 转换vscode Position 为 自定义 Position
 * @param position 
 * @returns 
 */
const convertPosition = (position: vscode.Position): Position => {
	return new Position(position.line, position.character);
};

/**
 * 增强的 keyGetter 方法
 * 支持括号优先表达式，如 (e).aaa 或 ((e)).bbb
 * 
 * @param text 要解析的文本
 * @returns 解析出的标识符数组
 */
export function keyGetter(text: string): {
	key: string,
	type: "func_call"| "id"
}[] {
	const result: { key: string, type: "func_call" | "id" }[] = [];
	const reverseChars = text.split("").reverse();
	const collectChars: string[] = [];
	let callLevel = 0;
	let isSpace = false;
	let isDot = false;

	let bracketJustClosed = false;
	let bracketClosePosition = 0;

	let isInFunctionCall = false;
	
	for (let index = 0; index < reverseChars.length; index++) {
		const char = reverseChars[index];
		if (callLevel > 0) {
			if (char == "(") {
				callLevel--;
				if (callLevel == 0) {
					bracketJustClosed = true;
					bracketClosePosition = index;

					isInFunctionCall = true;
				}
			} else if (char == ")") {
				callLevel++;
			}
		} else {
			if (char == ")") {
				callLevel++;

				isInFunctionCall = false;
			} else if (/[a-zA-Z0-9_]/.test(char)) {
				collectChars.push(char);

				if (bracketJustClosed) {
					bracketJustClosed = false;
				}
			} else if (char == ".") {
				if (collectChars.length > 0) {
					result.push({ key: collectChars.reverse().join(""), type: isInFunctionCall ? "func_call" : "id" });
					collectChars.length = 0;
				}
			} else if (char == " " || char == "\t") {
				isSpace = true;
				continue;
			} else {
				break;
			}
		}
	}
	if (bracketJustClosed) {
		
		let innerBracketLevel = 0;
		let innerBracketChars: string[] = [];
		// 反向遍历获取 () 内的key
		for (let index = bracketClosePosition; index >= 0; index--) {
			const char = reverseChars[index];
			if (char == "(") {
				innerBracketLevel++;
			} else if (char == ")") {
				innerBracketLevel--;
			} else if (innerBracketLevel == 0) {
				const innerContent = innerBracketChars.reverse().join("");
				result.push(...keyGetter(innerContent));
				innerBracketChars.length = 0;
				break;
			} else {
				innerBracketChars.push(char);
			}
		}
	}
	if (collectChars.length > 0) {
		result.push({ key: collectChars.reverse().join(""), type: isInFunctionCall ? "func_call" : "id" });
	}

	return result.reverse();
}





export {
	Key,
	functionKey,
	convertPosition
};