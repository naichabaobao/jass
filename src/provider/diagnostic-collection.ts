import { parse } from 'path';

import * as vscode from 'vscode';

import * as jass from '../main/jass/parsing';
import { programs } from './data-provider';

function isSupport() {
  return vscode.workspace.getConfiguration("jass").get("diagnostic.support");
}

vscode.workspace.onDidChangeConfiguration(e => {
  if (!isSupport()) {
    Collection.clear();
  }
});

const errorString:any = {
  ParameterInconsistency: "Parameter Inconsistency"
};

const Collection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection();

vscode.workspace.onDidSaveTextDocument(document => {
  if (!isSupport()) {
    return;
  }
  Collection.delete(document.uri);
  const diagnostics = new Array<vscode.Diagnostic>();

  const content = document.getText();

  const currentProgram = jass.parse(content);
  const pros = programs();

  // 检查当前文件caller参数个数是否正确
  const currentFunctions = currentProgram.functionDeclarators();
  const allFunctions = pros.map(x => x.functions()).flat();
  const alls = [...currentFunctions, ...allFunctions];

  const calls = currentFunctions.map(x => x.calls()).flat();
  for (let index = 0; index < calls.length; index++) {
    const call = calls[index];
    const func = alls.find(func => func.id === call.id);
    if (func) {
      if (func.getTakeCount() !== call.getTakeCount()) { // 参数不一致
        const loc = new vscode.Range(<number>call.loc.startLine, <number>call.loc.startPosition, <number>call.loc.endLine, <number>call.loc.endPosition);
        diagnostics.push(new vscode.Diagnostic(loc, errorString.ParameterInconsistency));
        Collection.set(document.uri, diagnostics);
      }
    }
  }
});

