import * as vscode from 'vscode';

import { blizzardJProgram, commonAiProgram, commonJProgram, dzApiJProgram, JassMap, VjassMap, ZincMap } from './data';
import * as jassAst from "../jass/ast";
import * as vjassAst from "../vjass/ast";
import * as zincAst from "../zinc/ast";
import { Types } from "./types";
import { AllKeywords } from './keyword';




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

  private all (document: vscode.TextDocument, position: vscode.Position) {
    const contents:Array<jassAst.Native|jassAst.Func| vjassAst.Func| zincAst.Func| zincAst.Method| vjassAst.Method | jassAst.Global | vjassAst.Global | vjassAst.Struct | vjassAst.Method | vjassAst.Member | zincAst.Global | zincAst.Struct | zincAst.Member | jassAst.Local | jassAst.Take | zincAst.Local> = [];
    
    contents.push(...commonJProgram.natives, ...commonJProgram.functions, ...commonJProgram.globals);
    contents.push(...commonAiProgram.natives, ...commonAiProgram.functions, ...commonAiProgram.globals);
    contents.push(...blizzardJProgram.natives, ...blizzardJProgram.functions, ...blizzardJProgram.globals);
    contents.push(...dzApiJProgram.natives, ...dzApiJProgram.functions, ...dzApiJProgram.globals);
    JassMap.forEach((program, path) => {
      contents.push(...program.natives, ...program.functions, ...program.globals);
      if (path == document.uri.fsPath) {
        program.functions.forEach((func) => {
          if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
            contents.push(...func.locals);
            contents.push(...func.takes);
          }
        });
      }

    });
    VjassMap.forEach((program, path) => {
      program.librarys.forEach((library) => {
        
        contents.push(...library.functions);
        contents.push(...library.globals);
        library.structs.forEach((struct) => {
          contents.push(struct);
          contents.push(...struct.methods);
        });

        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              contents.push(...func.locals);
              contents.push(...func.takes);
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              contents.push(...struct.members);
              contents.push(...struct.methods);
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  contents.push(...method.locals);
                  contents.push(...method.takes);
                }
              });
            }
          });
        }
      });
    });
    ZincMap.forEach((program, path) => {
      program.librarys.forEach((library) => {
        
        contents.push(...library.functions);
        contents.push(...library.globals);
        library.structs.forEach((struct) => {
          contents.push(struct);
          contents.push(...struct.methods);
        });

        if (path == document.uri.fsPath) {
          library.functions.forEach((func) => {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              contents.push(...func.locals);
              contents.push(...func.takes);
            }
          });
          library.structs.forEach((struct) => {
            if (new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position).contains(position)) {
              contents.push(...struct.members);
              contents.push(...struct.methods);
              struct.methods.forEach((method) => {
                if (new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position).contains(position)) {
                  contents.push(...method.locals);
                  contents.push(...method.takes);
                }
              });
            }
          });
        }
      });
    });
    
    return contents;
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

    // const content = document.getText();

    /*
    all.forEach(expr => {
      if (key == expr.name) {
        hovers.push(new vscode.MarkdownString(expr.name).appendText("\n" + expr.text).appendCodeblock(expr.origin));
      }
    });
    */
    // const currentProgram = new Program(document.uri.fsPath, document.getText());
    // const exprs = [...currentProgram.types, ...currentProgram.allFunctions, ...currentProgram.allGlobals, ...currentProgram.allStructs];

    this.all(document, position).forEach(expr => {
      if (key == expr.name) {
        const ms = new vscode.MarkdownString(expr.name);
        if (expr instanceof jassAst.Take) {
          ms.appendText("");
        } else {
          ms.appendText("\n" + (<string>expr.text))
        }
        ms.appendCodeblock(expr.origin)
        hovers.push(ms);
      }
    });

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());

