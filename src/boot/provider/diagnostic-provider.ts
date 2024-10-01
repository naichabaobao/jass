/*
Pjass version git-f128812 by Rudi Cilibrasi, modified by AIAndy, PitzerMike, Deaod and lep
To use this program, list the files you would like to parse in order.
If you would like to parse from standard input (the keyboard), then
use - as an argument.  If you supply no arguments to pjass, it will
parse the console standard input by default.
To test this program, go into your Scripts directory, and type:
pjass common.j common.ai Blizzard.j ObjectEditor.j
pjass accepts some options:
pjass -h               Display this help
pjass -v               Display version information and exit
pjass +rb              Enable returnbug
pjass -rb              Disable returnbug
pjass +shadow          Enable error on variable shadowing
pjass -shadow          Disable error on variable shadowing
pjass +filter          Enable error on inappropriate code usage for Filter
pjass -filter          Disable error on inappropriate code usage for Filter
pjass +nosyntaxerror   Disable all syntax errors
pjass -nosyntaxerror   Enable syntax error reporting
pjass +nosemanticerror Disable all semantic errors
pjass -nosemanticerror Enable semantic error reporting
pjass -                Read from standard input (may appear in a list)
*/

import * as path from 'path';
import * as vscode from 'vscode';
import { Options } from './options';
import { Token, TokenType } from '../jass/tokenizer-common';
import { tokenize_for_jass } from '../jass/tokenizer-jass';
import { isAiFile, isJFile } from '../tool';

const diagnostic_collection_for_jass = vscode.languages.createDiagnosticCollection("jass");
const error = (diagnostics:vscode.Diagnostic[], token:Token, message: string) => {
	const diagnostic = new vscode.Diagnostic(new vscode.Range(token.line, token.character, token.line, token.end), message, vscode.DiagnosticSeverity.Error);
	diagnostics.push(diagnostic);
};
const warning = (diagnostics:vscode.Diagnostic[], token:Token, message: string) => {
	const diagnostic = new vscode.Diagnostic(new vscode.Range(token.line, token.character, token.line, token.end), message, vscode.DiagnosticSeverity.Warning);
	diagnostics.push(diagnostic);
};
const hint = (diagnostics:vscode.Diagnostic[], token:Token, message: string) => {
	const diagnostic = new vscode.Diagnostic(new vscode.Range(token.line, token.character, token.line, token.end), message, vscode.DiagnosticSeverity.Hint);
	diagnostics.push(diagnostic);
};


const find_file_error_for_jass = (document: vscode.TextDocument) => {
	console.time("find_file_error_for_jass");
	if (!Options.isJassDiagnostic) {
		diagnostic_collection_for_jass.clear();
		return;
	}
	if (!Options.isOnlyJass) {
		diagnostic_collection_for_jass.clear();
		return;
	}
	const path_format = path.parse(document.uri.fsPath);
	if (!(path_format.ext == ".j" || path_format.ext == ".jass" || path_format.dir == ".ai")) {
		return;
	}

	const diagnostics:vscode.Diagnostic[] = [];

	const tokens = tokenize_for_jass(document.getText());
	tokens.forEach(token => {
		let temp:string;
		const text = () => {
			if (!temp) {
				temp = token.getText();
			}
			return temp;
		};
		if (token.type == TokenType.Unkown) {
			error(diagnostics, token, `lexical error,unkown token '${text().substring(0, 100)}'!`);
		} else if (!token.is_complete) {
			if (token.type == TokenType.String) {
				error(diagnostics, token, `string need package in "...",error string '${text().substring(0, 100)}'!`);
			} else if (token.type == TokenType.Mark) {
				error(diagnostics, token, `integer identifier mark format is 'A' or 'AAAA',error integer identifier mark '${text().substring(0, 100)}'!`);
			} else if (token.type == TokenType.Integer) {
				error(diagnostics, token, `error integer expression '${text().substring(0, 100)}'!`);
			} else {
				error(diagnostics, token, `error expression '${text().substring(0, 100)}'!`);
			}
		} else if (token.type == TokenType.Identifier) {
			if (text().startsWith("_")) {
				warning(diagnostics, token, `identifier start with '_' is illegal in jass language, check your code '${text().substring(0, 100)}'!`);
			} else if (/^\d/.test(text())) {
				error(diagnostics, token, `illegal identifier '${text().substring(0, 100)}'!`);
			}
		} else if (token.type == TokenType.Real) {
			if (text().startsWith(".") || text().endsWith(".")) {
				hint(diagnostics, token, `you should complete the floating point number!`);
			} else if (/(?:^0{2,}\.\d+)|(?:^\d+\.0{2,})/.test(text())) {
				hint(diagnostics, token, `suggest omitting repetitive parts`);
			}
		} else if (token.type == TokenType.Integer) {
			if (/^0{2,}/.test(text())) {
				hint(diagnostics, token, `not conducive to performance`);
			} else if (text().startsWith("0x") && text().length > 10) {
				error(diagnostics, token, `out of range '${text()}'!`);
			} else if (text().startsWith("$") && text().length > 9) {
				error(diagnostics, token, `out of range '${text()}'!`);
			}
		}
	});

	diagnostic_collection_for_jass.set(document.uri, diagnostics);
	console.timeEnd("find_file_error_for_jass");
}


vscode.workspace.onDidChangeTextDocument((event:vscode.TextDocumentChangeEvent) => {
	// const document = event.document;
	find_file_error_for_jass(event.document);
});

vscode.workspace.onDidSaveTextDocument((document) => {
	find_file_error_for_jass(document);
});

vscode.workspace.onDidDeleteFiles((event) => {
	event.files.forEach((filePath) => {
		if (isJFile(filePath.fsPath) || isAiFile(filePath.fsPath)) {
			diagnostic_collection_for_jass.delete(filePath);
		}
	});
});

vscode.workspace.onDidRenameFiles((event) => {
	event.files.forEach((filePath) => {
		if (isJFile(filePath.oldUri.fsPath) || isAiFile(filePath.oldUri.fsPath)) {
			const diagnostics = diagnostic_collection_for_jass.get(filePath.oldUri);
			diagnostic_collection_for_jass.delete(filePath.oldUri);
			diagnostic_collection_for_jass.set(filePath.newUri, diagnostics);
		}
	});
});


vscode.workspace.onDidChangeConfiguration((event) => {
	if (!Options.isOnlyJass || !Options.isJassDiagnostic) {
		diagnostic_collection_for_jass.clear();
	}
});



