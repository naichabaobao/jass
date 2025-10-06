import * as vscode from 'vscode';


import { getPositionKey } from '../tool';
import { Options } from './options';
import { GlobalContext, ASTNodeTypeChecker } from '../jass/parser-vjass';

import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";

function functionUnifiedFormat(native:vjass_ast.Func|vjass_ast.Native|vjass_ast.Method|vjass_ast.zinc.Func|vjass_ast.zinc.Method):string {
  let keyword:string;
  // 使用新的类型检查工具，避免instanceof继承问题
  if (ASTNodeTypeChecker.isAnyMethod(native)) {
    keyword = "method";
  } else if (ASTNodeTypeChecker.isFunc(native) || ASTNodeTypeChecker.isZincFunc(native)) {
    keyword = "function";
  } else if (ASTNodeTypeChecker.isNative(native)) {
    keyword = "native";
  } else {
    // 默认处理
    keyword = "function";
  }
  const takesString = !native.takes || native.takes.length == 0 ? "" : native.takes.map(take => {
    return `${take.type ? take.type.getText() : "(unkown)"} ${take.name ? take.name.getText() : "(unnamed)"}`;
  }).join(", ");
  const returnString = native.returns ? native.returns.getText() : "nothing";
  return `${keyword} ${native.name?.getText() ?? "(unnamed)"}(${takesString}) -> ${returnString};`
}

export class SignatureHelpProvider implements vscode.SignatureHelpProvider {

  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {
    const text = document.lineAt(position.line).text;
    if (/^\s*\/\//.test(text)) return;

    const fsPath = document.uri.fsPath;
    
    const info = getPositionKey(document, position);
    if (info.key === null || info.key == "") {
      return;
    }
    const key = info.key;
    const argc = info.argc;
    console.log(key, argc);

    const funcs = GlobalContext.get_native_and_func_and_method_by_name(key);

    if (funcs.length == 0) {
      return;
    }
    const SignatureHelp = new vscode.SignatureHelp();

    funcs.forEach(func => {
      const SignatureInformation = new vscode.SignatureInformation(functionUnifiedFormat(func));
      if (func.takes) {
        SignatureInformation.parameters = func.takes.map(take => {
          const param_info = new vscode.ParameterInformation(take.name ? take.name.getText() : "", take.desciprtion?.content ?? "");
          return param_info;
        });
      }
      const ms = new vscode.MarkdownString();
      func.description.forEach(desc => ms.appendMarkdown(`### ${desc}`));
      // method.takes.forEach(take => {
      //   const param = method.getParams().find(param => param.id == take.name);
      //   if (param) {
      //     ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*\n`);
      //   }
      // });
      // 检查是否有get_param_descriptions方法
      if ((func as any).get_param_descriptions && typeof (func as any).get_param_descriptions === 'function') {
        (func as any).get_param_descriptions().forEach((desc: any) => {
          ms.appendText("\n");
          ms.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
        });
      }
      if (func.is_deprecated) {
        ms.appendText("\n");
        ms.appendMarkdown(`***@deprecated*** `);
      }

      ms.appendText("\n");
      ms.appendMarkdown(`_> *${func.document.filePath}*`);

      SignatureInformation.documentation = ms;
      SignatureHelp.signatures.push(SignatureInformation);
      SignatureHelp.activeParameter = argc;
    });





    // if (Options.isSupportCjass) {
    //   SignatureHelp.activeParameter = argc;
    //   for (let index = 0; index < data.cjassDefineMacros().length; index++) {
    //     const defineMacro = data.cjassDefineMacros()[index];
    //     if (key == defineMacro.keys[defineMacro.keys.length - 1].name) {
          
    //       const SignatureInformation = new vscode.SignatureInformation(defineMacro.origin);

    //       defineMacro.takes.forEach(take => {
    //         if (take) {
    //           SignatureInformation.parameters.push(new vscode.SignatureInformation(take));
    //         }
    //       });
    //       SignatureHelp.signatures.push(SignatureInformation);
    //     }
    //   }
    // }

    return SignatureHelp;

  }
}



