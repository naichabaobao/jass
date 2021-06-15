import * as vscode from 'vscode';
import { parse } from '../jass/parse';
import { Options } from './options';

const diagnosticCollection = vscode.languages.createDiagnosticCollection("jass");

vscode.workspace.onDidSaveTextDocument((document) => {
	if (Options.isOnlyJass && Options.isJassDiagnostic) {
		const program = parse(document.getText(), {
			needParseLocal: true,
			needParseInitExpr: true
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