import * as vscode from 'vscode';
import { allGlobals, allFunctionImpls } from '../main/tool';
import { Type } from '../main/type';
import { isVjassSupport } from '../main/configuration';
import { Function, parseFunctions, parseTakes } from '../main/function';
import { language } from '../main/constant';
import { resolveFunction, parseLibrarys, resolveGlobal } from '../main/library';
import { parseGlobals } from '../main/global';
import { parseLocal } from '../main/local';
import { Keyword } from '../main/keyword';

class TypeHoverProvider implements vscode.HoverProvider {

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

    return new vscode.Hover(this.typeToHover(key));
  }

}

class GlobalHoverProvider implements vscode.HoverProvider {

  private globalToHover(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allGlobals().forEach(global => {
      if (isVjassSupport() ? global.libraryGlobalName == key : global.name == key) {
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
    var hovers = (isVjassSupport() ? resolveGlobal(parseLibrarys(content), globals) : globals)
      .filter(global => global.libraryGlobalName == key)
      .map(global => {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(global.origin());
        markdownString.appendText(global.descript);
        return markdownString;
      });

    return new vscode.Hover([...this.globalToHover(key), ...hovers]);
  }

}

class FunctionHoverProvider implements vscode.HoverProvider {

  private functionToHover(key: string): Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allFunctionImpls().forEach(func => {
      if (isVjassSupport() && func instanceof Function ? func.libraryFunctionName == key : func.name == key) {
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

    const content = document.getText();
    const functions = parseFunctions(content);
    var hovers = (isVjassSupport() ? resolveFunction(parseLibrarys(content), functions) : functions)
      .filter(func => func.libraryFunctionName == key)
      .map(func => {
        const markdownString = new vscode.MarkdownString();
        markdownString.appendCodeblock(func.origin());
        markdownString.appendText(func.descript);
        return markdownString;
      });

    return new vscode.Hover([...this.functionToHover(key), ...hovers]);
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
            console.log(local)
            if (local.name == key) {
              console.log(local.name)
              console.log(key)
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



vscode.languages.registerHoverProvider(language, new TypeHoverProvider);
vscode.languages.registerHoverProvider(language, new GlobalHoverProvider);
vscode.languages.registerHoverProvider(language, new FunctionHoverProvider);
vscode.languages.registerHoverProvider(language, new CurrentHoverProvider);

export { };
