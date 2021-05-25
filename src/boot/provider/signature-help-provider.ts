import * as vscode from 'vscode';

import { functions, natives } from './data';
import { Program } from "./jass-parse";

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

    const words: string[] = [];




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

              // const ps = programs();
              // ps.push(jass.parse(content));
              const current = new Program(document.uri.fsPath, document.getText());
              const allFunctions = [...natives, ...functions, ...current.allFunctions, ...current.natives, ...current.zincFunctions];

              for (let index = 0; index < allFunctions.length; index++) {
                const func = allFunctions[index];
                if (func.name == funcName) {
                  const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(x => x.origin).join(", ") : ""}) -> ${func.returns ?? "nothing"}`);
                  SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.text).appendCodeblock(func.origin);

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
