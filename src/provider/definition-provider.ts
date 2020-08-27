import * as vscode from 'vscode';

import * as jass from "../main/jass/parsing";
import { programs } from './data-provider';
import { keywords } from '../main/jass/keyword';
import { types } from '../main/jass/types';

vscode.languages.registerDefinitionProvider("jass", new class NewDefinitionProvider implements vscode.DefinitionProvider {

  private _uri:vscode.Uri|null = null;
  private _version: number = -1;
  private _currentProgram: jass.Program | null = null;
  private _maxLength = 255;

  private isNumber = function (val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  }

  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    let key = document.getText(document.getWordRangeAtPosition(position));
    
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
      return null;
    }

    if (!this._uri || this._uri.toString() !== document.uri.toString() && document.version !== this._version) {
      const content = document.getText();
      this._currentProgram = jass.parse(content);

      this._version = document.version;
    }
    const currentProgram: jass.Program = <jass.Program>this._currentProgram;
    currentProgram.fileName = document.fileName;

    const locations = new Array<vscode.Location>();
    
    // console.log(currentProgram.functions().length)
    const currentFunc = currentProgram.functionDeclarators().find(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position));
    if (currentFunc) {
      const locals = currentFunc.locals();
      for (let index = 0; index < locals.length; index++) {
        const local = locals[index];
        if (local.id && local.id === key) {
          const location = new vscode.Location(document.uri, new vscode.Range(<number>local.loc?.startLine, <number>local.loc?.startPosition, <number>local.loc?.endLine, <number>local.loc?.endPosition));
          locations.push(location);
          break;
        }
      }

      const takes = currentFunc.takes;
      for (let index = 0; index < takes.length; index++) {
        const take = takes[index];
        if (take.id && take.id === key) {
          const location = new vscode.Location(document.uri, new vscode.Range(<number>take.loc?.startLine, <number>take.loc?.startPosition, <number>take.loc?.endLine, <number>take.loc?.endPosition));
          locations.push(location);
          break;
        }
      }
    }
    // currentProgram.functions().filter(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position)).filter(x => x instanceof jass.FunctionDeclarator).forEach((x) => {
    //   if (x instanceof jass.FunctionDeclarator) {
    //     x.body.forEach(local => {
    //       if (local.id && local.id === key) {
    //         // console.log(local);
    //         const location = new vscode.Location(document.uri, new vscode.Range(<number>local.loc?.startLine, <number>local.loc?.startPosition, <number>local.loc?.endLine, <number>local.loc?.endPosition));
    //         locations.push(location);
    //       }
    //     });
    //     x.takes.forEach(take => {
    //       if (take.id && take.id === key) {
    //         const location = new vscode.Location(document.uri, new vscode.Range(<number>take.loc?.startLine, <number>take.loc?.startPosition, <number>take.loc?.endLine, <number>take.loc?.endPosition));
    //         locations.push(location);
    //       }
    //     });
    //   }
    // });
    console.log(key)
    let metch = false;
    const progs = programs();
    try{
    const allPrograms = [currentProgram, ...progs];
    for (let index = 0; index < allPrograms.length; index++) {
      const program = allPrograms[index];

      const functions = program.functions();
      for (let i = 0; i < functions.length; i++) {
        const func = functions[i];
        if (func.id && func.id === key) {
          const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`, false), new vscode.Range(<number>func.loc?.startLine, <number>func.loc?.startPosition, <number>func.loc?.endLine, <number>func.loc?.endPosition));
          locations.push(location);
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
          const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`, false), new vscode.Range(<number>global.loc?.startLine, <number>global.loc?.startPosition, <number>global.loc?.endLine, <number>global.loc?.endPosition));
          locations.push(location);
          metch = true;
          break;
        }
      }
      if (metch) {
        break;
      }

    }
  }catch(err) {console.error(err)}

    // [currentProgram, ...progs].forEach(program => {
    //   program.functions().forEach(func => {
    //     if (func.id && func.id === key) {
    //       const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`, true), new vscode.Range(<number>func.loc?.startLine, <number>func.loc?.startPosition, <number>func.loc?.endLine, <number>func.loc?.endPosition));
    //         locations.push(location);
    //     }
    //   });
    //   program.globals().forEach(global => {
    //     if (global.id && global.id === key) {
    //       const location = new vscode.Location(vscode.Uri.parse(`file:${program.fileName}`, true), new vscode.Range(<number>global.loc?.startLine, <number>global.loc?.startPosition, <number>global.loc?.endLine, <number>global.loc?.endPosition));
    //         locations.push(location);
    //     }
    //   });
    // });

    return locations;
  }

} ());
