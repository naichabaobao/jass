import * as vscode from 'vscode';

import * as jass from "../main/jass/parsing"
import { programs } from './data-provider';
import { types } from "../main/jass/types";
import { keywords } from '../main/jass/keyword';


class HoverProvider implements vscode.HoverProvider {
  
  private _uri:vscode.Uri|null = null;
  private _version: number = -1;
  private _currentProgram: jass.Program | null = null;
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

    const ks = keywords();
    if (ks.includes(key)) {
      return null;
    }

    const ts = types();
    const type = ts.find(type => type === key);
    if (type) {
      const markdownString = new vscode.MarkdownString();
      markdownString.appendCodeblock(type);
      return new vscode.Hover(markdownString);
    }

    const hovers: vscode.MarkdownString[] = [];

    const content = document.getText();
    const currentProgram: jass.Program = jass.parseEx(content);

    const currentFunc = currentProgram.functionDeclarators().find(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position));
    if (currentFunc) {
      const locals = currentFunc.locals();
      for (let index = 0; index < locals.length; index++) {
        const local = locals[index];
        if (local.id && local.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(local.origin());
          markdownString.appendText(currentProgram.description(local));
          hovers.push(markdownString);
          break;
        }
      }

      const takes = currentFunc.takes;
      for (let index = 0; index < takes.length; index++) {
        const take = takes[index];
        if (take.id && take.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(take.origin());
          hovers.push(markdownString);
          break;
        }
      }
    }

    // 如果匹配到一个就跳出去
    let metch = false;
    const progs = programs();
    const allPrograms = [currentProgram, ...progs];
    for (let index = 0; index < allPrograms.length; index++) {
      const program = allPrograms[index];

      const functions = program.functions();
      for (let i = 0; i < functions.length; i++) {
        const func = functions[i];
        if (func.id && func.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(func.origin());
          markdownString.appendText(program.description(func));
          hovers.push(markdownString);
          metch = true;
          break;
        }
      }
      if (metch) {
        break;
      }
      const globals = program.globals();
      for (let i = 0; i < globals.length; i++) {
        const global = globals[i];
        if (global.id && global.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(global.origin());
          markdownString.appendText(program.description(global));
          hovers.push(markdownString);
          metch = true;
          break;
        }
      }
      if (metch) {
        break;
      }

    }

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());

