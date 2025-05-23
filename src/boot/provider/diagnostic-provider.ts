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
import { isAiFile, isJFile } from '../tool';
import { GlobalContext, Node } from '../jass/parser-vjass';
import { Subject } from '../../extern/rxjs';

const diagnostic_collection_for_jass = vscode.languages.createDiagnosticCollection("jass");
const error = (diagnostics:vscode.Diagnostic[], token:Token|Node, message: string) => {
	if (token instanceof Token) {
		const startChar = Math.max(0, token.character);
		const endChar = Math.max(0, token.character + token.length);
		const diagnostic = new vscode.Diagnostic(
			new vscode.Range(token.line, startChar, token.line, endChar),
			message,
			vscode.DiagnosticSeverity.Error
		);
		diagnostics.push(diagnostic);
	} else {
		if (token.start_line) {
			const firstToken = token.start_line.tokens()[0];
			const startChar = Math.max(0, firstToken.character);
			const endChar = Math.max(0, firstToken.character + firstToken.length);
			const diagnostic = new vscode.Diagnostic(
				new vscode.Range(token.start_line.line, startChar, token.start_line.line, endChar),
				message,
				vscode.DiagnosticSeverity.Error
			);
			diagnostics.push(diagnostic);
		}
	}
};



const find_file_error_for_vjass = (document_or_filepath:vscode.TextDocument|string) => {

	const path_format = path.parse(typeof document_or_filepath == "string" ? document_or_filepath : document_or_filepath.uri.path);
	if (!(path_format.ext == ".j" || path_format.ext == ".jass" || path_format.ext == ".ai")) {
		return;
	}

	

	const diagnostics:vscode.Diagnostic[] = [];

	const doc = GlobalContext.get(typeof document_or_filepath == "string" ? document_or_filepath : document_or_filepath.fileName);
	
	doc?.token_errors.forEach(err => {
		error(diagnostics, err.token, err.message);
	});
	
	// doc?.node_errors.forEach(err => {
	// 	error(diagnostics, err.node, err.message);
	// });


	diagnostic_collection_for_jass.set(typeof document_or_filepath == "string" ? vscode.Uri.file(document_or_filepath) : document_or_filepath.uri, diagnostics);
	

}

const subject = new Subject<string | vscode.TextDocument>();
subject.subscribe((document_or_filepath:vscode.TextDocument|string) => {
	find_file_error_for_vjass(document_or_filepath);
});

export function find_error(document_or_filepath:vscode.TextDocument|string) {
	subject.next(document_or_filepath);
}

export function releace_diagnosticor() {
	diagnostic_collection_for_jass.dispose();
	subject.complete();
}

// vscode.workspace.onDidSaveTextDocument((document) => {
// 	find_file_error_for_vjass(document);
// });

vscode.workspace.onDidOpenTextDocument((document) => {
	find_error(document);
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
	if (!Options.isJassDiagnostic) {
		diagnostic_collection_for_jass.clear();
	}
});



