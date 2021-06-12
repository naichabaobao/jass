import * as vscode from 'vscode';

import { Program, Scope } from './jass-parse';
import { types,natives,functions,globals,structs } from './data';
import { Types } from "./types";
import { AllKeywords } from './keyword';

/**
 * 扁平化scopes
 * @param scopes 
 * @returns 
 */
const get = (scopes:Scope[]) :Scope[] => {
  return scopes.map(scope => {
    if (scope.scopes.length == 0) {
      return [scope];
    } else {
      return [scope, ...get(scope.scopes)];
    }
  }).flat();
}


const all = [...types, ...natives, ...functions, ...globals, ...structs];

class HoverProvider implements vscode.HoverProvider {
  
  // 规定标识符长度
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

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));

    if (key.length > this._maxLength) {
      return null;
    }

    if (this.isNumber(key)) {
      return null;
    }

    if (AllKeywords.includes(key)) {
      return null;
    }

    const type = Types.find(type => type === key);
    if (type) {
      const markdownString = new vscode.MarkdownString().appendCodeblock(type);
      return new vscode.Hover(markdownString);
    }

    const hovers: vscode.MarkdownString[] = [];

    const content = document.getText();

    all.forEach(expr => {
      if (key == expr.name) {
        hovers.push(new vscode.MarkdownString(expr.name).appendText("\n" + expr.text).appendCodeblock(expr.origin));
      }
    });

    const currentProgram = new Program(document.uri.fsPath, document.getText());
    const exprs = [...currentProgram.types, ...currentProgram.allFunctions, ...currentProgram.allGlobals, ...currentProgram.allStructs];

    exprs.forEach(expr => {
      if (key == expr.name) {
        hovers.push(new vscode.MarkdownString(expr.name).appendText("\n" + expr.text).appendCodeblock(expr.origin));
      }
    });

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());

