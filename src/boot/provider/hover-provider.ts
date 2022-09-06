


import * as vscode from 'vscode';


import { Types } from "./types";
import { AllKeywords } from './keyword';
import { Options } from './options';
import data, { DataGetter, parseContent } from "./data";
import { compare, isZincFile } from '../tool';
import { convertPosition, fieldFunctions } from './tool';
import { Declaration, Func, Global, Library, Local, Member, Method, Take, Native, Struct } from '../jass/ast';
import { getTypeDesc } from './type-desc';
import { tokenize } from '../jass/tokens';

type De = Native|Func|Method|Library|Struct|Member|Global|Local;

function toHoverlo(de: De, isCurrent: boolean, filePath: string) {
  const ms = new vscode.MarkdownString();
  if (de.hasDeprecated()) {
    ms.appendMarkdown(`#### ~~${de.name}~~`);
  } else {
    ms.appendMarkdown(`#### ${de.name}`);
  }
  if (isCurrent) {
    ms.appendText("\n(当前文件)");
  } else {
    ms.appendText(`\n(${filePath})`);
  }
  de.getContents().forEach((content) => {
    ms.appendText("\n");
    ms.appendMarkdown(content);
  });
  de.getParams().forEach((param) => {
    if ("takes" in de && de.takes.findIndex((take) => take.name == param.id) != -1) {
      ms.appendText("\n");
      ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
    }
  });
  if (de.hasDeprecated()) {
    ms.appendText("\n");
    ms.appendMarkdown(`***@deprecated*** `);
  }
  ms.appendText("\n");
  ms.appendCodeblock(de.origin);

  return ms;
}

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
      markdownString.appendText("\n");
      markdownString.appendText(getTypeDesc(type));
      return new vscode.Hover(markdownString);
    }

    const fsPath = document.uri.fsPath;
    // parseContent(fsPath, document.getText());

    const hovers: vscode.MarkdownString[] = [];

    new DataGetter().forEach((program, filePath) => {
      const isCurrent = compare(fsPath, filePath);
      
      if (!Options.isOnlyJass) {
        program.getNameLibrary(key).forEach(library => {
          const ms = toHoverlo(library, isCurrent, fsPath);
          hovers.push(ms);
        });
        program.getNameStruct(key).forEach(struct => {
          const ms = toHoverlo(struct, isCurrent, fsPath);
          hovers.push(ms);
        });
        program.getNameMethod(key).forEach(method => {
          const ms = toHoverlo(method, isCurrent, fsPath);
          hovers.push(ms);
        });
        program.getNameMember(key).forEach(member => {
          const ms = toHoverlo(member, isCurrent, fsPath);
          hovers.push(ms);
        });
        
      }
      program.getNameGlobal(key).forEach(global => {
        const ms = toHoverlo(global, isCurrent, fsPath);
        hovers.push(ms);
      });
      program.getNameFunction(key).forEach(func => {
        const ms = toHoverlo(func, isCurrent, fsPath);
        hovers.push(ms);
      });
    
      if (isCurrent) {
        const findedFunc = program.getPositionFunction(convertPosition(position));
        if (findedFunc) {
          findedFunc.takes.filter(take => take.name == key).forEach((take, index) => {
            const ms = new vscode.MarkdownString();
            ms.appendMarkdown(`#### ${take.name}`);
            if (isCurrent) {
              ms.appendText("\n当前文件");
            } else {
              ms.appendText(`\n${filePath}`);
            }
            ms.appendText("\n");
            findedFunc.getParams().forEach((param) => {
              if (param.id == take.name) {
                ms.appendText(param.descript);
              }
            });
            ms.appendText("\n");
            ms.appendCodeblock(take.origin);
            hovers.push(ms);
          });
    
          findedFunc.locals.filter(local => local.name == key).forEach(func => {
            const ms = toHoverlo(func, isCurrent, fsPath);
            hovers.push(ms);
          });
        }
        
        const findedMethod = program.getPositionMethod(convertPosition(position));
        if (findedMethod) {
          findedMethod.takes.filter(take => take.name == key).forEach((take, index) => {
            const ms = new vscode.MarkdownString();
            ms.appendMarkdown(`#### ${take.name}`);
            if (isCurrent) {
              ms.appendText("\n当前文件");
            } else {
              ms.appendText(`\n${filePath}`);
            }
            ms.appendText("\n");
            findedMethod.getParams().forEach((param) => {
              if (param.id == take.name) {
                ms.appendText(param.descript);
              }
            });
            ms.appendText("\n");
            ms.appendCodeblock(take.origin);
            hovers.push(ms);
          });
    
          findedMethod.locals.filter(local => local.name == key).forEach(func => {
            const ms = toHoverlo(func, isCurrent, fsPath);
            hovers.push(ms);
          });
        }
      }
    }, !Options.isOnlyJass && Options.supportZinc);

    if (Options.isSupportCjass) {
      const lineText = document.lineAt(position.line);
      const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);

      data.cjassDefineMacros().forEach((defineMacro) => {
        if (defineMacro.keys.length == 1) {
          if (key == defineMacro.keys[0].name) {
            const ms = new vscode.MarkdownString();
            ms.appendMarkdown(`#### ${defineMacro.keys[0].name}`);
            ms.appendText("\n");
            ms.appendCodeblock(defineMacro.origin);
            hovers.push(ms);
          }
        } else if (defineMacro.keys.length > 1) {
          const findedKey = defineMacro.keys.find((id) => id.name == key);
          if (findedKey) {
            const ms = new vscode.MarkdownString();
            ms.appendMarkdown(`#### ${defineMacro.keys[defineMacro.keys.length - 1].name}`);
            ms.appendText("\n");
            ms.appendCodeblock(defineMacro.origin);
            hovers.push(ms);
          }
        }
      });
      data.cjassFunctions().forEach((func) => {
        if (key == func.name) {
          const ms = new vscode.MarkdownString();
          ms.appendMarkdown(`#### ${func.name}`);
          ms.appendText("\n");
          func.getContents().forEach((content) => {
            ms.appendText(content);
          });
          func.getParams().forEach((param) => {
            if (func.takes.findIndex((take) => take.name == param.id) != -1) {
              ms.appendText("\n");
              ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
            }
          });
          if (func.hasDeprecated()) {
            ms.appendMarkdown(`***@deprecated*** `);
          }
          ms.appendText("\n");
          ms.appendCodeblock(func.origin);
          hovers.push(ms);
        }
      });
      // cjass 全局宏
      if (key == "DATE") {
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown("#### DATE");
        ms.appendText("\n");
        ms.appendMarkdown(`**${new Date().toLocaleDateString("ch",)}**`);
        ms.appendText("\n");
        ms.appendCodeblock("#define DATE");
        hovers.push(ms);
      } else if (key == "TIME") {
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown("#### TIME");
        ms.appendText("\n");
        ms.appendMarkdown(`**${new Date().toTimeString()}**`);
        ms.appendText("\n");
        ms.appendCodeblock("#define TIME");
        hovers.push(ms);
      } else if (key == "FUNCNAME") {
        const func = data.fieldFunction(document, position);
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown("#### FUNCNAME");
        ms.appendText("\n");
        if (func) {
          ms.appendMarkdown(`**${func.name}**`);
          ms.appendText("\n");
          ms.appendCodeblock("#define FUNCNAME");
        } else {
          ms.appendText("function not found");
        }
        hovers.push(ms);
      }
    }

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());


