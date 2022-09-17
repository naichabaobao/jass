/*
Pjass version git-f128812 by Rudi Cilibrasi, modified by AIAndy, PitzerMike, Deaod and lep
To use this program, list the files you would like to parse in order.
If you would like to parse from standard input (the keyboard), then
use - as an argument.  If you supply no arguments to pjass, it will
parse the console standard input by default.
To test this program, go into your Scripts directory, and type:
pjass common.j common.ai Blizzard.j
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

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Method, Native, Func } from '../jass/ast';
import { isAiFile, isJFile } from '../tool';
import { DataGetter } from './data';
import { Options } from './options';

const diagnosticCollection = vscode.languages.createDiagnosticCollection("jass");

const toVsPosition = (any: De) => {
	const range = new vscode.Range(any.loc.start.line, any.loc.start.position, any.loc.end.line, any.loc.end.position);
	return range ?? new vscode.Position(any.loc.start.line, any.loc.start.position);
  };
  
type De = Native|Func|Method;

/**
 * 检查function内部,其他无视
 */
vscode.workspace.onDidSaveTextDocument((document) => {
	const fsPath = document.uri.fsPath;
	if (isJFile(fsPath) || isAiFile(fsPath)) {
		if (Options.isJassDiagnostic) {
	
			diagnosticCollection.delete(document.uri);
			const program = new DataGetter().get(fsPath);
			if (program) {
				const diagnostics:vscode.Diagnostic[] = [];
				program.errors.map(err => {
					const range = new vscode.Range(err.loc.start.line, err.loc.start.position, err.loc.end.line, err.loc.end.position);
					const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
					return diagnostic;
				});
				program.functions.filter(func => !func.hasIgnore()).forEach(func => {
					fs.writeFileSync(Options.pjassTempPath, document.getText(toVsPosition(func)), {
						encoding: "utf8"
					});
	
					let cmd = execSync(`"${Options.pjassPath}" +nosemanticerror "${Options.commonJPath}" "${Options.commonAiPath}" "${Options.blizzardJPath}" "${Options.pjassTempPath}"&`).toString("utf8");
					const comLines = cmd.split("\n");
					for (let index = 0; index < comLines.length; index++) {
						const comLine = comLines[index];
						if (comLine.startsWith("Parse successful:")) {
							continue;
						} else if (comLine.startsWith("Parse failed:")) {
							continue;
						} else if (comLine.includes("failed with")) {
							continue;
						} else {
							const result = /:(?<line>\d+):\s*(?<message>(\w+\s*)*)/.exec(comLine);
							if (result && result.groups) {
								let line = parseInt(result.groups["line"]) - 1 + func.loc.start.line;
								let message = result.groups["message"];
								
								const range = new vscode.Range(line, document.lineAt(line).firstNonWhitespaceCharacterIndex, line, document.lineAt(line).text.length);
								diagnostics.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
								diagnosticCollection.set(document.uri, diagnostics);
	
							}
						}
					}
	
				});
	
			}
	
		}
	}
});

vscode.workspace.onDidDeleteFiles((event) => {
	event.files.forEach((filePath) => {
		if (isJFile(filePath.fsPath) || isAiFile(filePath.fsPath)) {
			diagnosticCollection.delete(filePath);
		}
	});
});

vscode.workspace.onDidRenameFiles((event) => {
	event.files.forEach((filePath) => {
		if (isJFile(filePath.oldUri.fsPath) || isAiFile(filePath.oldUri.fsPath)) {
			const diagnostics = diagnosticCollection.get(filePath.oldUri);
			diagnosticCollection.delete(filePath.oldUri);
			diagnosticCollection.set(filePath.newUri, diagnostics);
		}
	});
});

// 参数个数检测, 不要了

// vscode.workspace.onDidSaveTextDocument((document) => {
// 	if (Options.isOnlyJass && Options.isJassDiagnostic) {
// 		const program = parse(document.getText(), {
// 			needParseLocal: true,
// 			needParseInitExpr: true,
// 			needParseNative: true
// 		});
// 		diagnosticCollection.clear();
// 		const diagnostics = program.errors.map(err => {
// 			const range = new vscode.Range(err.loc.start.line, err.loc.start.position, err.loc.end.line, err.loc.end.position);
// 			const diagnostic = new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error);
// 			return diagnostic;
// 		});
// 		diagnosticCollection.set(document.uri, diagnostics);
// 	}
// });

vscode.workspace.onDidChangeConfiguration((event) => {
	if (!Options.isOnlyJass || !Options.isJassDiagnostic) {
		diagnosticCollection.clear();
	}
});



