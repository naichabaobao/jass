import * as vscode from 'vscode';


import {JassMap, ZincMap, VjassMap, commonJProgram, commonAiProgram, blizzardJProgram, dzApiJProgram } from './data';
import * as jassAst from "../jass/ast";
import * as vjassAst from "../vjass/ast";
import * as zincAst from "../zinc/ast";

class ZincSignatureHelp implements vscode.SignatureHelpProvider {

  private allFunctions (document: vscode.TextDocument, position: vscode.Position): (jassAst.Native | jassAst.Func | vjassAst.Func | zincAst.Func | zincAst.Method | vjassAst.Method)[] {
    const functions:Array<jassAst.Native|jassAst.Func| vjassAst.Func| zincAst.Func| zincAst.Method| vjassAst.Method> = [];
    
    functions.push(...commonJProgram.natives, ...commonJProgram.functions);
    functions.push(...commonAiProgram.natives, ...commonAiProgram.functions);
    functions.push(...blizzardJProgram.natives, ...blizzardJProgram.functions);
    functions.push(...dzApiJProgram.natives, ...dzApiJProgram.functions);
    JassMap.forEach((program) => {
      functions.push(...program.natives, ...program.functions);
    });
    VjassMap.forEach((program) => {
      program.librarys.forEach((library) => {
        
        functions.push(...library.functions);
        library.structs.forEach((struct) => {
          functions.push(...struct.methods);
        });
      });
    });
    ZincMap.forEach((program) => {
      program.librarys.forEach((library) => {
        
        functions.push(...library.functions);
        library.structs.forEach((struct) => {
          functions.push(...struct.methods);
        });
      });
    });
    
    return functions;
  }

  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {
    if (/^\s*\/\//.test(document.lineAt(position.line).text)) return;

    const provideSignatureHelp = (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext) => {
      const SignatureHelp = new vscode.SignatureHelp();
      const lineText = document.lineAt(position.line);
      let funcNames = [];
      let field = 1;
      let activeParameter = 0;
      let inString = false;
      for (let i = position.character - 1; i >= 0; i--) {
        const char = lineText.text.charAt(i);
        if (field > 0) {
          if (!inString && char == '"') {
            inString = true;
          } else if (inString && char == '"' && lineText.text.charAt(i - 1) != '\\') {
            inString = false;
          } else if (!inString && char == '(') {
            field--;
          } else if (!inString && char == ')') {
            field++;
          } else if (!inString && char == ',') {
            activeParameter++;
          }
        } else if (field == 0) {
          if (funcNames.length == 0 && /\s/.test(char)) {
            continue;
          } else if (/\w/.test(char)) {
            funcNames.push(char);
            // 向前預測
            if (funcNames.length > 0 && (/\W/.test(lineText.text.charAt(i - 1)) || i == 0)) {
              const funcName = funcNames.reverse().join("");

              const allFunctions = this.allFunctions(document, position); // [...natives, ...functions, ...current.allFunctions, ...current.natives];
              console.log(funcName)
              for (let index = 0; index < allFunctions.length; index++) {
                const func = allFunctions[index];
                if (func.name == funcName) {
                  
                  const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(x => x.origin).join(", ") : ""}) -> ${func.returns ?? "nothing"}`);
                  // new vscode.SignatureInformation(func.origin);
                  // new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(x => x.origin).join(", ") : ""}) -> ${func.returns ?? "nothing"}`);
                  SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.text);

                  func.takes.forEach(take => {
                    if (take.name) {
                      SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
                    }
                  });
                  SignatureHelp.activeParameter = activeParameter;
                  SignatureHelp.signatures.push(SignatureInformation);
                  break;
                }
              }

              // this.zincSignatureInformations(document, position, funcName, SignatureHelp, activeParameter);

            };

          }
        }
      }
      return SignatureHelp;
    }
    try {
      const sh = provideSignatureHelp(document, position, token, context);
      return sh;
    } catch (err) {
      console.error(err)
    }
    

  }
}

vscode.languages.registerSignatureHelpProvider("jass", new ZincSignatureHelp, "(", ",");
