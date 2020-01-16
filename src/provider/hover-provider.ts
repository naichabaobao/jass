import * as vscode from 'vscode';
import { Keyword } from '../main/keyword';
import { allGlobals, allFunctions } from '../main/tool';
import { Type } from '../main/type';
import { isVjassSupport } from '../main/configuration';
import { Function } from '../main/function';
import { language } from '../main/constant';

class TypeHoverProvider implements vscode.HoverProvider {

  private typeToHover(key:string):Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    Type.AllTypes.forEach(type => {
      if(type.name == key){
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

  private globalToHover(key:string):Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allGlobals().forEach(global => {
      if(isVjassSupport()  ?  global.libraryGlobalName == key :global.name == key){
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

    return new vscode.Hover(this.globalToHover(key));
  }

}

class FunctionHoverProvider implements vscode.HoverProvider {

  private functionToHover(key:string):Array<vscode.MarkdownString> {
    const hovers = new Array<vscode.MarkdownString>();
    allFunctions().forEach(func => {
      if(isVjassSupport() && func instanceof Function ? func.libraryFunctionName == key : func.name == key){
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

    return new vscode.Hover(this.functionToHover(key));
  }
  
}

vscode.languages.registerHoverProvider(language,new TypeHoverProvider);
vscode.languages.registerHoverProvider(language,new GlobalHoverProvider);
vscode.languages.registerHoverProvider(language,new FunctionHoverProvider);

export {};
