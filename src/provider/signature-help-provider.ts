import * as vscode from 'vscode';
import { language } from '../main/constant';
import { FunctionImpl, Function, parseFunctions } from '../main/function';
import { allFunctionImpls } from '../main/tool';
import { isVjassSupport } from '../main/configuration';
// import { resolveFunction, parseLibrarys } from '../main/library';


vscode.languages.registerSignatureHelpProvider(language, {
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

            const func = [...allFunctionImpls(),...functions].find(func => {
              let isMatch = false;
              if(isVjassSupport()){
                if(func instanceof Function){
                  func as Function;
                  isMatch = func.name == funcName;
                }else{
                  isMatch = func.name == funcName;
                }
              }else{
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
}, "(", ",");
