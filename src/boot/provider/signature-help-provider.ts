import * as vscode from 'vscode';


import data, { DataGetter, parseContent } from './data';
import { convertPosition, fieldFunctions, functionKey } from './tool';
import { tokenize } from '../jass/tokens';
import { compare, isZincFile } from '../tool';
import { Options } from './options';
import { DefineMacro, Func, Local, Native, Struct, Take } from '../jass/ast';


class SignatureHelp implements vscode.SignatureHelpProvider {

  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {
    const text = document.lineAt(position.line).text;
    if (/^\s*\/\//.test(text)) return;

    const fsPath = document.uri.fsPath;
    
    const tokens = tokenize(text.substring(0, position.character)).reverse();
    let key = "";
    const ids: string[] = [];
    let argc = 0;
    let field = 0;
    let state = 0;

    // 反向遍历
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];

      if (state == 0) {
        if (token.isOp() && token.value == ",") {
          if (field == 0) {
            argc++;
          }
        } else if (token.isOp() && token.value == "(") {
          if (field == 0) {
            state = 1;
          } else if (field > 0) {
            field--;
          }
        } else if (token.isOp() && token.value == ")") {
          field++;
        }
      } else if (state == 1) {
        if (token.isId()) {
          key = token.value;
        } else break;
      }
    }
    console.log(key);
    const SignatureHelp = new vscode.SignatureHelp();
    new DataGetter().forEach((program, filePath) => {
      const isCurrent = compare(fsPath, filePath);
      
      if (!Options.isOnlyJass) {
        program.getNameMethod(key).filter(method => method.name == key).forEach(method => {
          const SignatureInformation = new vscode.SignatureInformation(method.origin);
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
        const SignatureInformation = new vscode.SignatureInformation(func.origin);
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

vscode.languages.registerSignatureHelpProvider("jass", new SignatureHelp, "(", ",");

