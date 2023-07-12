


import * as vscode from 'vscode';


import { Types } from "./types";
import { AllKeywords } from '../jass/keyword';
import { Options } from './options';
import data, { ConsumerMarkCode, DataGetter } from "./data";
import { compare } from '../tool';
import { convertPosition } from './tool';
import { Func, Global, Library, Local, Member, Method, Take, Native, Struct, TextMacroDefine, Declaration, Type } from '../jass/ast';
import { getTypeDesc } from './type-desc';
import { tokenize } from '../jass/tokens';
import { Document, lexically } from '../check/mark';
import { MarkCodes } from '../war/mark';

type Decl = Native|Func|Method|Library|Struct|Member|Global|Local|TextMacroDefine|Type;

function toHoverlo(de: Decl, isCurrent: boolean, filePath: string) {
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

    // const type = Types.find(type => type === key);
    // if (type) {
    //   const markdownString = new vscode.MarkdownString().appendCodeblock(type);
    //   markdownString.appendText("\n");
    //   markdownString.appendText(getTypeDesc(type));
    //   return new vscode.Hover(markdownString);
    // }
    console.info(key);

    const fsPath = document.uri.fsPath;
    // parseContent(fsPath, document.getText());

    const hovers: vscode.MarkdownString[] = [];

    new DataGetter().forEach((program, filePath) => {
      const isCurrent = compare(fsPath, filePath);
      
      if (!Options.isOnlyJass) {
        program.getNameLibrary(key).forEach(library => {
          const ms = toHoverlo(library, isCurrent, filePath);
          hovers.push(ms);
        });
        program.getNameStruct(key).forEach(struct => {
          const ms = toHoverlo(struct, isCurrent, filePath);
          hovers.push(ms);
        });
        program.getNameMethod(key).forEach(method => {
          const ms = toHoverlo(method, isCurrent, filePath);
          hovers.push(ms);
        });
        program.getNameMember(key).forEach(member => {
          const ms = toHoverlo(member, isCurrent, filePath);
          hovers.push(ms);
        });
        
      }
      program.getNameType(key).forEach(type => {
        const ms = toHoverlo(type, isCurrent, filePath);
        hovers.push(ms);
      });
      program.getNameGlobal(key).forEach(global => {
        const ms = toHoverlo(global, isCurrent, filePath);
        hovers.push(ms);
      });
      program.getNameFunction(key).forEach(func => {
        const ms = toHoverlo(func, isCurrent, filePath);
        hovers.push(ms);
      });
      program.getNameNative(key).forEach(func => {
        const ms = toHoverlo(func, isCurrent, filePath);
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

        const findedDefineIndex = program.defines.findIndex(define => define.id.name == key);
        if (findedDefineIndex != -1) {
          const findedDefine = program.defines[findedDefineIndex];
          const ms = toHoverlo(findedDefine, isCurrent, fsPath);
          hovers.push(ms);
        }

        const text = program.findRunTextMacroText(key);
        if(text) {
          const ms = new vscode.MarkdownString();
          
          ms.appendCodeblock(text);
          hovers.push(ms);
        }
      }
    }, !Options.isOnlyJass && Options.supportZinc, !Options.isOnlyJass && Options.isSupportCjass);

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
      // data.cjassFunctions().forEach((func) => {
      //   if (key == func.name) {
      //     const ms = new vscode.MarkdownString();
      //     ms.appendMarkdown(`#### ${func.name}`);
      //     ms.appendText("\n");
      //     func.getContents().forEach((content) => {
      //       ms.appendText(content);
      //     });
      //     func.getParams().forEach((param) => {
      //       if (func.takes.findIndex((take) => take.name == param.id) != -1) {
      //         ms.appendText("\n");
      //         ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
      //       }
      //     });
      //     if (func.hasDeprecated()) {
      //       ms.appendMarkdown(`***@deprecated*** `);
      //     }
      //     ms.appendText("\n");
      //     ms.appendCodeblock(func.origin);
      //     hovers.push(ms);
      //   }
      // });
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

class MarkHoverProvider implements vscode.HoverProvider {

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

    // const type = Types.find(type => type === key);
    // if (type) {
    //   const markdownString = new vscode.MarkdownString().appendCodeblock(type);
    //   markdownString.appendText("\n");
    //   markdownString.appendText(getTypeDesc(type));
    //   return new vscode.Hover(markdownString);
    // }
    console.info(key);

    const fsPath = document.uri.fsPath;
    // parseContent(fsPath, document.getText());

    const hovers: vscode.MarkdownString[] = [];

    if (Options.isSupportMark) {

      const mark = lexically(new Document(document.uri.fsPath, document.lineAt(position.line).text)).find(mark => {
        return mark.isMark() && mark.loc.start.position <= position.character && mark.loc.end.position >= position.character;
      });
      

      
      if (mark) {
        const markValue = mark.value();
        
        const targetMark = MarkCodes.find(markCode => `'${markCode.code}'` == markValue)

        if (targetMark) {
          const ms = new vscode.MarkdownString();
          ms.appendMarkdown(`***${targetMark.name}***`);
          ms.appendText("\n");
          ms.appendMarkdown(targetMark.tip);
          ms.appendText("\n");
          ms.appendCodeblock(`'${targetMark.code}'`);

          ms.appendMarkdown("***@type***(" + (targetMark.type ? targetMark.type : "未知") + ")")
          ms.appendMarkdown("  \n")
          ms.appendMarkdown("***@race***(" + (targetMark.race ? targetMark.race : "未知") + ")")
          ms.appendMarkdown("  \n")
          ms.appendMarkdown("***@kind***(" + (targetMark.kind ? targetMark.kind : "未知") + ")");
          hovers.push(ms);
        }

        const comsumerTargetMark = ConsumerMarkCode.instance(document.uri).getPresets().find(preset => `'${preset.code}'` == markValue);
       

        if (comsumerTargetMark) {
          const ms = new vscode.MarkdownString();
          ms.appendMarkdown(`***${comsumerTargetMark.name}***`);
          ms.appendText("\n");
          ms.appendMarkdown(comsumerTargetMark.descript);
          ms.appendText("\n");
          ms.appendCodeblock(`'${comsumerTargetMark.code}'`);

          ms.appendMarkdown("***@type***(" + (comsumerTargetMark.type ? comsumerTargetMark.type : "未知") + ")")
          ms.appendMarkdown("  \n")
          ms.appendMarkdown("***@race***(" + (comsumerTargetMark.race ? comsumerTargetMark.race : "未知") + ")")
          ms.appendMarkdown("  \n")
          ms.appendMarkdown("***@kind***(" + (comsumerTargetMark.kind ? comsumerTargetMark.kind : "未知") + ")");
          hovers.push(ms);
        }
      }


    }

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());

vscode.languages.registerHoverProvider("jass", new MarkHoverProvider());
