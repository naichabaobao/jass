import * as vscode from 'vscode';
import { parse } from '../jass/parse';
import { Options } from './options';

const diagnosticCollection = vscode.languages.createDiagnosticCollection("jass");

// const range = new vscode.Range(0, 0, 0, "aaaaaaaaaaaaaaaaaaaaaaaaa".length);
// const diagnostic = new vscode.Diagnostic(range, "what", vscode.DiagnosticSeverity.Information);
// diagnosticCollection.set(vscode.Uri.file("C:\\Users\\Administrator\\Desktop\\ff\\1.j"), [diagnostic]);


vscode.workspace.onDidSaveTextDocument((document) => {
	if (Options.isOnlyJass && Options.isJassDiagnostic) {
		const program = parse(document.getText(), {
			needParseLocal: true,
			needParseInitExpr: true,
			needParseNative: true
		});
		diagnosticCollection.clear();
		const diagnostics = program.errors.map(err => {
			const range = new vscode.Range(err.loc.start.line, err.loc.start.position, err.loc.end.line, err.loc.end.position);
			const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
			return diagnostic;
		});
		diagnosticCollection.set(document.uri, diagnostics);
	}
});

vscode.workspace.onDidChangeConfiguration((event) => {
	if (!Options.isOnlyJass || !Options.isJassDiagnostic) {
		diagnosticCollection.clear();
	}
});

vscode.languages.onDidChangeDiagnostics( (event: vscode.DiagnosticChangeEvent) => {
	
});

/**
 * 2022年6月17日
 * 实现结束符号缺失语法检测
 */

 vscode.workspace.onDidSaveTextDocument((document) => {
	if (Options.isJassDiagnostic) {

	}
});


