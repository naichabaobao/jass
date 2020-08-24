import * as vscode from 'vscode';

import * as jass from "../main/jass/parsing"
import { programs } from './data-provider';


class NewHoverProvider implements vscode.HoverProvider {

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));
    var hovers: vscode.MarkdownString[] = [];
    const content = document.getText();

    const currentProgram = jass.parse(content);
    const progs = programs();
    [currentProgram, ...progs].forEach(program => {
      program.functions().forEach(func => {
        if (func.id && func.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(func.origin());
          markdownString.appendText(program.description(func));
          hovers.push(markdownString);
        }
      });
      program.globals().forEach(global => {
        if (global.id && global.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(global.origin());
          markdownString.appendText(program.description(global));
          hovers.push(markdownString);
        }
      });
    });
    currentProgram.functions().filter(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position)).filter(x => x instanceof jass.FunctionDeclarator).forEach((x) => {
      if (x instanceof jass.FunctionDeclarator) {
        x.body.forEach(local => {
          if (local.id && local.id === key) {
            const markdownString = new vscode.MarkdownString();
            markdownString.appendCodeblock(local.origin());
            markdownString.appendText(currentProgram.description(local));
            hovers.push(markdownString);
          }
        });
        x.takes.forEach(take => {
          if (take.id && take.id === key) {
            const markdownString = new vscode.MarkdownString();
            markdownString.appendCodeblock(take.origin());
            hovers.push(markdownString);
          }
        });
      }
    });
    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new NewHoverProvider());

