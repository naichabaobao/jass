import * as vscode from "vscode";
import { parse } from "../jass/parse";
import { Keywords } from "./keyword";


vscode.languages.registerRenameProvider("jass", new class RenameProvider implements vscode.RenameProvider {

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

		if (key.length > this._maxLength) {
			return null;
		}

		if (this.isNumber(key)) {
			return null;
		}

		if (Keywords.includes(key)) {
			return null;
		}

		const program = parse(document.getText(), {
			needParseLocal: true
		});

		let func = program.functions.find((func) => func.name == key);

		if (func) {
			const work = new vscode.WorkspaceEdit();
			if (func.nameToken) {
				work.replace(document.uri, new vscode.Range(func.nameToken.line, func.nameToken.position, func.nameToken.line, func.nameToken.end), newName);
			}
			program.functions.forEach((func) => {
				func.tokens.forEach((token) => {
					if (token.isId() && token.value == key) {
						const range = new vscode.Range(token.line, token.position, token.line, token.end);
						work.replace(document.uri, range, newName);
					}
				});
			});
			return work;
		}


		const global = program.globals.find((global) => global.name == key);

		if (global) {
			const work = new vscode.WorkspaceEdit();
			if (global.nameToken) {
				work.replace(document.uri, new vscode.Range(global.nameToken.line, global.nameToken.position, global.nameToken.line, global.nameToken.end), newName);
			}
			program.functions.forEach((func) => {
				func.tokens.forEach((token) => {
					if (token.isId() && token.value == key) {
						const range = new vscode.Range(token.line, token.position, token.line, token.end);
						work.replace(document.uri, range, newName);
					}
				});
			});
			return work;
		}

		func = program.functions.find((func) => {
			const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
			return range.contains(position);
		});


		if (func) {

			if (func.takes.find(take => take.name == key) || func.locals.find(local => local.name == key)) {
				const work = new vscode.WorkspaceEdit();
				func.takes.forEach((take) => {
					if (take.name == key && take.nameToken) {
						const range = new vscode.Range(take.nameToken.line, take.nameToken.position, take.nameToken.line, take.nameToken.end);
						work.replace(document.uri, range, newName);
					}
				});
				func.tokens.forEach((token) => {
					if (token.isId() && token.value == key) {
						const range = new vscode.Range(token.line, token.position, token.line, token.end);
						work.replace(document.uri, range, newName);
					}
				});
				return work;
			}

		}

		return null;

	}

}());