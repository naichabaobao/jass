import * as vscode from "vscode";
import { parse } from "../jass/parse";


vscode.languages.registerRenameProvider("jass", new class RenameProvider implements vscode.RenameProvider {

	provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
		const program = parse(document.getText(), {
			needParseLocal: true
		});

		const func = program.functions.find((func) => {
			const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
			return range.contains(position);
		});

		
		if (func) {
			const key = document.getText(document.getWordRangeAtPosition(position));

			if (func.takes.find(take => take.name == key) || func.locals.find(local => local.name == key)) {
				const work = new vscode.WorkspaceEdit();
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