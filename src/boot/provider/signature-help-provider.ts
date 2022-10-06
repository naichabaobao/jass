import * as vscode from 'vscode';


import data, { DataGetter, parseContent } from './data';
import { convertPosition, fieldFunctions, functionKey } from './tool';
import { tokenize } from '../jass/tokens';
import { compare, getPositionKey } from '../tool';
import { Options } from './options';
import { DefineMacro, Func, Local, Native, Struct, Take } from '../jass/ast';

function functionUnifiedFormat(native:Func):string {
  const takesString = native.takes.length == 0 ? "" : native.takes.map(take => take.origin).join(", ");
  const returnString = native.returns;
  return `function ${native.name}(${takesString}) -> ${returnString};`
}
function nativeUnifiedFormat(native:Native):string {
  const takesString = native.takes.length == 0 ? "" : native.takes.map(take => take.origin).join(", ");
  const returnString = native.returns;
  return `native ${native.name}(${takesString}) -> ${returnString};`
}
function methodUnifiedFormat(native:Native):string {
  const takesString = native.takes.length == 0 ? "" : native.takes.map(take => take.origin).join(", ");
  const returnString = native.returns;
  return `method ${native.name}(${takesString}) -> ${returnString};`
}

class SignatureHelp implements vscode.SignatureHelpProvider {

  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {
    const text = document.lineAt(position.line).text;
    if (/^\s*\/\//.test(text)) return;

    const fsPath = document.uri.fsPath;
    
    const info = getPositionKey(document, position);
    if (info.key === null) {
      return;
    }
    const key = info.key;
    const argc = info.argc;
    console.log(key, argc);

    const SignatureHelp = new vscode.SignatureHelp();
    new DataGetter().forEach((program, filePath) => {
      const isCurrent = compare(fsPath, filePath);
      
      if (!Options.isOnlyJass) {
        program.getNameMethod(key).filter(method => method.name == key).forEach(method => {
          const SignatureInformation = new vscode.SignatureInformation(methodUnifiedFormat(method));
          SignatureInformation.parameters = method.takes.map(take => new vscode.ParameterInformation(take.name, method.getParams().find(param => param.id == take.name)?.descript))
          const ms = new vscode.MarkdownString();
          // method.takes.forEach(take => {
          //   const param = method.getParams().find(param => param.id == take.name);
          //   if (param) {
          //     ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*\n`);
          //   }
          // });
          ms.appendText(method.getContents().join("\n"));

          method.getParams().forEach((param) => {
            if (method.takes.findIndex((take) => take.name == param.id) != -1) {
              ms.appendText("\n");
              ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
            }
          });
          if (method.hasDeprecated()) {
            ms.appendText("\n");
            ms.appendMarkdown(`***@deprecated*** `);
          }

          SignatureInformation.documentation = ms;
          SignatureHelp.signatures.push(SignatureInformation);
          SignatureHelp.activeParameter = argc;
        });
        
      }

      program.getNameFunction(key).filter(func => func.name == key).forEach(func => {
        const SignatureInformation = new vscode.SignatureInformation(functionUnifiedFormat(func));
        SignatureInformation.parameters = func.takes.map(take => new vscode.ParameterInformation(take.name, func.getParams().find(param => param.id == take.name)?.descript))
        const ms = new vscode.MarkdownString();
        // func.takes.forEach(take => {
        //   const param = func.getParams().find(param => param.id == take.name);
        //   if (param) {
        //     ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*\n`);
        //   }
        // });
        ms.appendMarkdown(func.getContents().join("\n"));

        func.getParams().forEach((param) => {
          if (func.takes.findIndex((take) => take.name == param.id) != -1) {
            ms.appendText("\n");
            ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
          }
        });
        if (func.hasDeprecated()) {
          ms.appendText("\n");
          ms.appendMarkdown(`***@deprecated*** `);
        }

        SignatureInformation.documentation = ms;
        SignatureHelp.signatures.push(SignatureInformation);
        SignatureHelp.activeParameter = argc;
      });
      program.getNameNative(key).filter(func => func.name == key).forEach(native => {
        const SignatureInformation = new vscode.SignatureInformation(nativeUnifiedFormat(native));
        SignatureInformation.parameters = native.takes.map(take => new vscode.ParameterInformation(take.name, native.getParams().find(param => param.id == take.name)?.descript))
        const ms = new vscode.MarkdownString();
        
        ms.appendMarkdown(native.getContents().join("\n"));

        native.getParams().forEach((param) => {
          if (native.takes.findIndex((take) => take.name == param.id) != -1) {
            ms.appendText("\n");
            ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
          }
        });
        if (native.hasDeprecated()) {
          ms.appendText("\n");
          ms.appendMarkdown(`***@deprecated*** `);
        }

        SignatureInformation.documentation = ms;
        SignatureHelp.signatures.push(SignatureInformation);
        SignatureHelp.activeParameter = argc;
      });
    }, !Options.isOnlyJass && Options.supportZinc, !Options.isOnlyJass && Options.isSupportCjass);



    if (Options.isSupportCjass) {
      SignatureHelp.activeParameter = argc;
      for (let index = 0; index < data.cjassDefineMacros().length; index++) {
        const defineMacro = data.cjassDefineMacros()[index];
        if (key == defineMacro.keys[defineMacro.keys.length - 1].name) {
          
          const SignatureInformation = new vscode.SignatureInformation(defineMacro.origin);

          defineMacro.takes.forEach(take => {
            if (take) {
              SignatureInformation.parameters.push(new vscode.SignatureInformation(take));
            }
          });
          SignatureHelp.signatures.push(SignatureInformation);
        }
      }
    }

    return SignatureHelp;

  }
}

vscode.languages.registerSignatureHelpProvider("jass", new SignatureHelp, "(", ",", ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""));

