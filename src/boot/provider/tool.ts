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



export {
	Key,
	functionKey,
	convertPosition
};