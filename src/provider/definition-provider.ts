import * as vscode from 'vscode';

import * as jass from "../main/jass/parsing";
import { programs } from './data-provider';

vscode.languages.registerDefinitionProvider("jass", new class NewDefinitionProvider implements vscode.DefinitionProvider {

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const locations = new Array<vscode.Location>();
    let key = document.getText(document.getWordRangeAtPosition(position));
    const content = document.getText();
    // console.log(key)
    const currentProgram = jass.parse(content);
    currentProgram.fileName = document.fileName;
    // console.log(currentProgram.functions().length)
    currentProgram.functions().filter(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position)).filter(x => x instanceof jass.FunctionDeclarator).forEach((x) => {
      if (x instanceof jass.FunctionDeclarator) {
        x.body.forEach(local => {
          if (local.id && local.id === key) {
            // console.log(local);
            const location = new vscode.Location(document.uri, new vscode.Range(<number>local.loc?.startLine, <number>local.loc?.startPosition, <number>local.loc?.endLine, <number>local.loc?.endPosition));
            locations.push(location);
          }
        });
        x.takes.forEach(take => {
          if (take.id && take.id === key) {
            const location = new vscode.Location(document.uri, new vscode.Range(<number>take.loc?.startLine, <number>take.loc?.startPosition, <number>take.loc?.endLine, <number>take.loc?.endPosition));
            locations.push(location);
          }
        });
      }
    });

    const progs = programs();
    [currentProgram, ...progs].forEach(program => {
      program.functions().forEach(func => {
        if (func.id && func.id === key) {
          const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`), new vscode.Range(<number>func.loc?.startLine, <number>func.loc?.startPosition, <number>func.loc?.endLine, <number>func.loc?.endPosition));
            locations.push(location);
        }
      });
      program.globals().forEach(global => {
        if (global.id && global.id === key) {
          const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`), new vscode.Range(<number>global.loc?.startLine, <number>global.loc?.startPosition, <number>global.loc?.endLine, <number>global.loc?.endPosition));
            locations.push(location);
        }
      });
    });

    return locations;
  }

} ());
