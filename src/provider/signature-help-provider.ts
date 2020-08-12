import * as vscode from 'vscode';
// import { language } from '../main/constant';
import { FunctionImpl, Function, parseFunctions } from '../main/function';
import { allFunctionImpls } from '../main/tool';
import { isVjassSupport } from '../main/configuration';
// import { resolveFunction, parseLibrarys } from '../main/library';

// 先前的方法参数提示，暂时移到下面和zinc放在一起
/*
vscode.languages.registerSignatureHelpProvider("jass", {
  
  provideSignatureHelp(document, position, token, context) {

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

            // 获取当前文档的方法
            const content = document.getText();
            const funcs = parseFunctions(content);
            var functions = funcs;

            const func = [...allFunctionImpls(), ...functions].find(func => {
              let isMatch = false;
              if (isVjassSupport()) {
                if (func instanceof Function) {
                  func as Function;
                  isMatch = func.name == funcName;
                } else {
                  isMatch = func.name == funcName;
                }
              } else {
                isMatch = func.name == funcName;
              }
              return isMatch;
            });
            if (func) {
              if (func.name) {
                const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(take => take.type.name + " " + take.name).join(", ") : "nothing"})->${func.returns.name ?? "nothing"}`);
                if (func.descript) {
                  SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.descript);
                }

                func.takes.forEach(take => {
                  if (take.name) {
                    SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
                  }
                });
                SignatureHelp.activeParameter = activeParameter;
                SignatureHelp.signatures.push(SignatureInformation);
              }
            }
          };

        }
      }
    }
    return SignatureHelp;
  }
}, "(", ",");*/

class ZincSignatureHelp implements vscode.SignatureHelpProvider {
  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {
    if (/^\s*\/\//.test(document.lineAt(position.line).text)) return;
    let field1 = 0;
    let count = 0;
    let line = 0;
    let character = 0;
    let inString1 = false;
    const offset = document.offsetAt(position);
    const content = document.getText().substring(0, offset);

    const words:string[] = [];
    



    function provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext) {
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
  
              // 获取当前文档的方法
              const content = document.getText();
              const funcs = parseFunctions(content);
              var functions = funcs;
  
              const func = [...allFunctionImpls(), ...functions].find(func => {
                let isMatch = false;
                if (isVjassSupport()) {
                  if (func instanceof Function) {
                    func as Function;
                    isMatch = func.name == funcName;
                  } else {
                    isMatch = func.name == funcName;
                  }
                } else {
                  isMatch = func.name == funcName;
                }
                return isMatch;
              });
              if (func) {
                if (func.name) {
                  const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(take => take.type.name + " " + take.name).join(", ") : "nothing"})->${func.returns.name ?? "nothing"}`);
                  if (func.descript) {
                    SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.descript);
                  }
  
                  func.takes.forEach(take => {
                    if (take.name) {
                      SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
                    }
                  });
                  SignatureHelp.activeParameter = activeParameter;
                  SignatureHelp.signatures.push(SignatureInformation);
                }
              }
            };
  
          }
        }
      }
      return SignatureHelp;
    }
    return provideSignatureHelp(document, position, token, context);
    
  }
}

vscode.languages.registerSignatureHelpProvider("jass", new ZincSignatureHelp, "(", ",");


// for (let index = offset; index >= 0; index--) {
//   const char = content.charAt(index);
//   if (field1 < 0) {
//     if (/[\n\s]/.test(char)) {
//       continue;
//     } else if (/[a-zA-Z0-9_]/.test(char)) {
//       // const newPos = position.translate(line, character);
//       // const id = document.getText(document.getWordRangeAtPosition(newPos));
//       // console.log(id);
//       const key = /[a-zA-Z_0-9]+$/.exec(content.substring(0, index + 1));
//       if (!key) break;
//       const id = key[0];

//       let SignatureHelp:vscode.SignatureHelp|null = null; // new vscode.SignatureHelp();
//       /*
//       const current = new jass.Program();
//       current.parse(content);
//       [def.commonProgram, def.commonAiProgram, def.blizzardProgram, def.dzProgram, ...def.includeJPrograms, ...def.includeAiPrograms, current].forEach(pro => {
//         // hovers.push(...programToFunctionMss(pro, key));
//       });*/

//       // zinc
//       const tokens = scanner.tokens(document.getText());
//       const zincFile = ast.toAst(tokens);
//       zincFile.blocks.forEach(block => {
//         block.librarys.forEach(library => {
//           library.functions.forEach(x => {
//             if (x.name == id) {
//               const SignatureInformation = new vscode.SignatureInformation(`${x.name}(${x.takes.length > 0 ? x.takes.map(take => take.origin()).join(", ") : ""}) -> ${x.returns ?? "nothing"} {}`);
//               SignatureInformation.documentation = new vscode.MarkdownString().appendCodeblock(x.origin());
//               x.takes.forEach(take => {
//                 if (take.name) {
//                   SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
//                 }
//               });
//               SignatureHelp = new vscode.SignatureHelp();
//               SignatureHelp.activeParameter = count;
//               SignatureHelp.signatures.push(SignatureInformation);
              
//             }
//           });
//         });
//       });
//       if (SignatureHelp) {
//         return SignatureHelp;
//       }
//       break;
//     } else {
//       break;
//     }
//   } else {
//     if (!inString1 && char == '"') {
//       inString1 = true;
//     } else if (inString1 && char == '"' && content.charAt(index - 1) != '\\') {
//       inString1 = false;
//     } else if (!inString1 && field1 === 0 && char === ",") {
//       count++;
//     } else if (!inString1 && char === ")") {
//       field1++;
//     } else if (!inString1 && char === "(") {
//       field1--;
//     }
//   }
// }