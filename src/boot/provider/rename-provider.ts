import * as vscode from "vscode";
import * as path from "path";
import { Keywords } from "../jass/keyword";
import { GlobalContext } from "../jass/parser-vjass";

import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";

const equals = (oldkey: string, key: string) => {
	const this_info = path.parse(oldkey);
	const other_info = path.parse(key);
	return this_info.dir == other_info.dir && this_info.base == other_info.base;
}


function function_change(edit: vscode.WorkspaceEdit, func: vjass_ast.Func, old_str: string, new_str: string): vscode.WorkspaceEdit {
	// const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
	func.takes?.forEach(take => {
		if (take.name && take.name.getText() == old_str) {
			const range = new vscode.Range(new vscode.Position(take.name.start.line, take.name.start.position), new vscode.Position(take.name.end.line, take.name.end.position));
			edit.replace(vscode.Uri.file(func.document.filePath), range, new_str);
		}
	});

	return edit;
}

class RenameProvider implements vscode.RenameProvider {

	private _maxLength = 526;

	private isNumber = function (val: string) {
		var regPos = /^\d+(\.\d+)?$/; //非负浮点数
		var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
		if (regPos.test(val) || regNeg.test(val)) {
			return true;
		} else {
			return false;
		}
	}

	provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {

		const key = document.getText(document.getWordRangeAtPosition(position));
		console.log(key);
		
		if (key.length > this._maxLength) {
			return null;
		}

		if (this.isNumber(key)) {
			return null;
		}

		if (Keywords.includes(key)) {
			return null;
		}

		const fsPath = document.uri.fsPath;

		const program = GlobalContext.get(fsPath);
		const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
		if (program) {
			
			const target_position = new vjass.Position(position.line, position.character);
			const push_take = (function_items: (vjass_ast.Func | vjass_ast.Method|vjass_ast.zinc.Func|vjass_ast.zinc.Method)[]) => {
				function_items.filter(x => {
					return x.contains(target_position);
				}).forEach(data => {
					if (data.takes) {
						data.takes.forEach(take => {
							if (take.name && take.name.getText() == key) {
								if (data instanceof vjass_ast.Func) {
									console.log("我确实运行了？");
									function_change(edit, data, key, newName)
								}
							}
						});
					}
				});
				
			}
			push_take(program.functions);
			
		}
		return edit;
	}
}
vscode.languages.registerRenameProvider("jass", new RenameProvider());


// import * as vscode from "vscode";
// import { DataGetter } from "./data";
// import { Keywords } from "../jass/keyword";


// vscode.languages.registerRenameProvider("jass", new class RenameProvider implements vscode.RenameProvider {

// 	private _maxLength = 526;

// 	private isNumber = function (val: string) {
// 		var regPos = /^\d+(\.\d+)?$/; //非负浮点数
// 		var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
// 		if (regPos.test(val) || regNeg.test(val)) {
// 			return true;
// 		} else {
// 			return false;
// 		}
// 	}

// 	provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {

// 		const key = document.getText(document.getWordRangeAtPosition(position));

// 		if (key.length > this._maxLength) {
// 			return null;
// 		}

// 		if (this.isNumber(key)) {
// 			return null;
// 		}

// 		if (Keywords.includes(key)) {
// 			return null;
// 		}

// 		const fsPath = document.uri.fsPath;

// 		const program = new DataGetter().get(fsPath);

// 		if (!program) {
// 			return;
// 		}

// 		let func = program.functions.find((func) => func.name == key);

// 		if (func) {
// 			const work = new vscode.WorkspaceEdit();
// 			if (func.nameToken) {
// 				work.replace(document.uri, new vscode.Range(func.nameToken.line, func.nameToken.position, func.nameToken.line, func.nameToken.end.position), newName);
// 			}
// 			program.functions.forEach((func) => {
// 				func.tokens.forEach((token) => {
// 					if (token.isId() && token.value == key) {
// 						const range = new vscode.Range(token.line, token.position, token.line, token.end.position);
// 						work.replace(document.uri, range, newName);
// 					}
// 				});
// 			});
// 			return work;
// 		}


// 		const global = program.globals.find((global) => global.name == key);

// 		if (global) {
// 			const work = new vscode.WorkspaceEdit();
// 			if (global.nameToken) {
// 				work.replace(document.uri, new vscode.Range(global.nameToken.line, global.nameToken.position, global.nameToken.line, global.nameToken.end.position), newName);
// 			}
// 			program.functions.forEach((func) => {
// 				func.tokens.forEach((token) => {
// 					if (token.isId() && token.value == key) {
// 						const range = new vscode.Range(token.line, token.position, token.line, token.end.position);
// 						work.replace(document.uri, range, newName);
// 					}
// 				});
// 			});
// 			return work;
// 		}

// 		func = program.functions.find((func) => {
// 			const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
// 			return range.contains(position);
// 		});


// 		if (func) {

// 			if (func.takes.find(take => take.name == key) || func.locals.find(local => local.name == key)) {
// 				const work = new vscode.WorkspaceEdit();
// 				func.takes.forEach((take) => {
// 					if (take.name == key && take.nameToken) {
// 						const range = new vscode.Range(take.nameToken.line, take.nameToken.position, take.nameToken.line, take.nameToken.end.position);
// 						work.replace(document.uri, range, newName);
// 					}
// 				});
// 				func.tokens.forEach((token) => {
// 					if (token.isId() && token.value == key) {
// 						const range = new vscode.Range(token.line, token.position, token.line, token.end.position);
// 						work.replace(document.uri, range, newName);
// 					}
// 				});
// 				return work;
// 			}

// 		}

// 		return null;

// 	}

// }());