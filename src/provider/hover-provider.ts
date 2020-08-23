import * as vscode from 'vscode';
import { allGlobals, allFunctionImpls } from '../main/tool';
import { Type } from '../main/type';
import { JassType } from '../jass/type';
import { getTypeDesc } from '../jass/type-desc';
import { isVjassSupport } from '../main/configuration';
import { Function, parseFunctions, parseTakes } from '../main/function';
import { language } from '../main/constant';
// import { resolveFunction, parseLibrarys, resolveGlobal } from '../main/library';
import { parseGlobals } from '../main/global';
import { parseLocal } from '../main/local';
import { Keyword } from '../main/keyword';

import * as jassx from "../main/jass/parsing"



class TypeHoverProvider implements vscode.HoverProvider {

  private typeHover = (key: string) => {
    const hovers = new Array<vscode.MarkdownString>();
    const origin = (type: JassType) => {
      let originString = `type ${type.name}`;
      const appendExtends = (extendType: JassType) => {
        if (extendType.extend) {
          originString += ` extends ${extendType.extend.name}`;
          appendExtends(extendType.extend);
        }
      }
      appendExtends(type);
      return originString;
    }
    JassType.types().forEach(type => {
      if (type.name == key) {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendText(getTypeDesc(type.name));
        markdownString.appendCodeblock(origin(type));
        hovers.push(markdownString);
      }
    });
    return hovers;
  }

  private typeToHover(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    Type.AllTypes.forEach(type => {
      if (type.name == key) {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(type.origin());
        markdownString.appendText(type.description);
        hovers.push(markdownString);
      }
    });

    return hovers;
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const key = document.getText(document.getWordRangeAtPosition(position));

    return new vscode.Hover(this.typeHover(key));
  }

}

class GlobalHoverProvider implements vscode.HoverProvider {

  private globalToHover(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allGlobals().forEach(global => {
      if (isVjassSupport() ? global.name == key : global.name == key) {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(global.origin());
        markdownString.appendText(global.descript);
        hovers.push(markdownString);
      }
    });
    return hovers;
  }

  /**
   * @param document 
   * @param position 
   * @param token 
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));

    const content = document.getText();
    const globals = parseGlobals(content);
    var hovers = globals
      .filter(global => global.name == key)
      .map(global => {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(global.origin());
        markdownString.appendText(global.descript);
        return markdownString;
      });

    return new vscode.Hover([...this.globalToHover(key), ...hovers]);
  }

}

import * as jass from "../jass/ast";
import * as def from "./default";
import { programs } from './data-provider';

function programToFunctionMss(program: jass.Program, key: string) {
  return [...program.natives(), ...program.functions()].filter(x => x.name === key).map(x => {
    const markdownString = new vscode.MarkdownString();
    markdownString.appendCodeblock(x.origin());
    markdownString.appendText(program.findComment(x.start.line - 1) ?? "");
    return markdownString;
  });
}


class FunctionHoverProvider implements vscode.HoverProvider {

  /**
   * 
   * @deprecated
   * @param key 
   */
  private functionToHover(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allFunctionImpls().forEach(func => {
      if (isVjassSupport() && func instanceof Function ? func.name == key : func.name == key) {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(func.origin());
        markdownString.appendText(func.descript);
        hovers.push(markdownString);
      }
    });
    return hovers;
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const key = document.getText(document.getWordRangeAtPosition(position));
    var hovers: vscode.MarkdownString[] = [];
    const content = document.getText();

    const currentProgram = jassx.parse(content);
    const progs = programs();
    [currentProgram, ...progs].forEach(program => {
      program.globals().forEach(func => {
        if (func.id && func.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(func.origin());
          markdownString.appendText("");
          hovers.push(markdownString);
        }
      });
      program.globals().forEach(global => {
        if (global.id && global.id === key) {
          const markdownString = new vscode.MarkdownString();
          markdownString.appendCodeblock(global.origin());
          markdownString.appendText("");
          hovers.push(markdownString);
        }
      });
    });

    /*
    const functions = parseFunctions(content);
    
    = functions
      .filter(func => func.name == key)
      .map(func => {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(func.origin());
        markdownString.appendText(func.descript);
        return markdownString;
      });*/
    // jass
    // const current = new jass.Program();
    // current.parse(content);
    /*
    [def.commonProgram, def.commonAiProgram, def.blizzardProgram, def.dzProgram, ...def.includeJPrograms, ...def.includeAiPrograms, current].forEach(pro => {
      hovers.push(...programToFunctionMss(pro, key));
    });*/

    // zinc
    /*
    const tokens = scanner.tokens(content);
    const zincFile = ast.toAst(tokens);
    zincFile.blocks.forEach(block => {
      block.librarys.forEach(library => {
        library.functions.forEach(x => {
          if (x.name == key) {
            const markdownString = new vscode.MarkdownString();
            markdownString.appendCodeblock(x.origin());
            hovers.push(markdownString);
          }
        });
      });
    });*/

    return new vscode.Hover([...hovers]);
  }

}

class CurrentHoverProvider implements vscode.HoverProvider {

  /**
   * 解析当前文档
   */
  private getCurrentLocations(document: vscode.TextDocument, position: vscode.Position, key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    // 以function开头
    const functionLineRegExp = new RegExp(`^\\s*${Keyword.Function}\\b`);

    // 找local和方法参数
    for (let i = position.line; i >= 0; i--) {

      const TextLine = document.lineAt(i);
      const text = TextLine.text;
      if (!TextLine.isEmptyOrWhitespace) {

        try {
          const local = parseLocal(text);
          if (local) {
            if (local.name == key) {
              const markdownString = new vscode.MarkdownString();
              markdownString.appendCodeblock(local.origin());
              hovers.push(markdownString);

            }
          }
        } catch (err) {
          console.error(err);
        }
        if (functionLineRegExp.test(text)) {
          const takes = parseTakes(text);
          takes.forEach(take => {
            if (take.name == key) {
              const markdownString = new vscode.MarkdownString();
              markdownString.appendCodeblock(take.origin());
              hovers.push(markdownString);
            }
          });
          break;
        }

      }


    }

    return hovers;
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const key = document.getText(document.getWordRangeAtPosition(position));

    return new vscode.Hover(this.getCurrentLocations(document, position, key));
  }

}

class CodeHoverProvider implements vscode.HoverProvider {

  /**
   * 解析当前文档
   */
  private code(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();

    const valueString16 = '0x' + key.replace(/'/, '').replace(/[\da-zA-Z]/g, function (subString) {
      return subString.charCodeAt(0).toString(16);
    });
    const value = parseInt(valueString16);

    const markdownString = new vscode.MarkdownString().appendCodeblock(`${value}`);
    hovers.push(markdownString);

    return hovers;
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const key = document.getText(document.getWordRangeAtPosition(position, /'[a-zA-Z0-9]{4,4}'/));
    return key.length == 6 ? new vscode.Hover(this.code(key)) : null;
  }

}

class NewHoverProvider implements vscode.HoverProvider {

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));
    var hovers: vscode.MarkdownString[] = [];
    const content = document.getText();

    const currentProgram = jassx.parse(content);
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
    currentProgram.functions().filter(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position)).filter(x => x instanceof jassx.FunctionDeclarator).forEach((x) => {
      if (x instanceof jassx.FunctionDeclarator) {
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

// vscode.languages.registerHoverProvider(language, new TypeHoverProvider);
// vscode.languages.registerHoverProvider(language, new GlobalHoverProvider);
// vscode.languages.registerHoverProvider(language, new FunctionHoverProvider);
// vscode.languages.registerHoverProvider(language, new CurrentHoverProvider);
// vscode.languages.registerHoverProvider(language, new CodeHoverProvider);
vscode.languages.registerHoverProvider("jass", new NewHoverProvider());

