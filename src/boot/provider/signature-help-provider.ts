import * as vscode from 'vscode';


import { JassMap, ZincMap, VjassMap, commonJProgram, commonAiProgram, blizzardJProgram, dzApiJProgram } from './data';
import * as jassAst from "../jass/ast";
import * as vjassAst from "../vjass/ast";
import * as zincAst from "../zinc/ast";
import { tokens } from '../jass/tokens';

class Key {
  /**
   * 使用时需反转
   * 匹配到的function名称，如果时多个时可能包含struct变量名称
   * 多个时如：  
   * local StructType s = StructType.create()
   * call s.doSomeThing()
   * keys中会包含 ["doSomeThing", "s"]
   */
  public keys: string[] = [];
  /**
   * 第几个参数
   */
  public takeIndex: number = 0;

  public isSingle() {
    return this.keys.length == 1;
  }

  public isEmpty() {
    return this.keys.length == 0;
  }
  
}

function functionKey(document: vscode.TextDocument, position: vscode.Position) {
  const key = new Key();

  const lineText = document.lineAt(position.line);

  const ts = tokens(lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character));

  let field = 0;
  let activeParameter = 0;
  let inName = false;
  let nameState = 0;
  for (let index = ts.length - 1; index >= 0; index--) {
    const token = ts[index];
    if (!token) break;
    if (inName) {
      if (nameState == 0) {
        if (token.isId()) {
          key.keys.push(token.value);
          nameState = 1;
        } else {
          break;
        }
      } else if (nameState == 1) {
        if (token.isOp() && token.value == ".") {
          nameState = 0;
        } else {
          break;
        }
      }
    } else if (token.isOp() && token.value == ",") {
      if (field == 0) {
        activeParameter++;
      }
    } else if (token.isOp() && token.value == ")") {
      field++;
    } else if (token.isOp() && token.value == "(") {
      if (field > 0) {
        field--;
      } else {
        inName = true;
        key.takeIndex = activeParameter;
      }
    }
  }

  return key;
}

class ZincSignatureHelp implements vscode.SignatureHelpProvider {

  private allFunctions(document: vscode.TextDocument, position: vscode.Position): (jassAst.Native | jassAst.Func | vjassAst.Func | zincAst.Func | zincAst.Method | vjassAst.Method)[] {
    const functions: Array<jassAst.Native | jassAst.Func | vjassAst.Func | zincAst.Func | zincAst.Method | vjassAst.Method> = [];

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


class LuaSignatureHelp implements vscode.SignatureHelpProvider {

  private allFunctions(): (jassAst.Native | jassAst.Func)[] {
    const functions: Array<jassAst.Native | jassAst.Func> = [];

    functions.push(...commonJProgram.natives, ...commonJProgram.functions);
    functions.push(...commonAiProgram.natives, ...commonAiProgram.functions);
    functions.push(...blizzardJProgram.natives, ...blizzardJProgram.functions);
    functions.push(...dzApiJProgram.natives, ...dzApiJProgram.functions);

    return functions;
  }

  provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.SignatureHelpContext): vscode.ProviderResult<vscode.SignatureHelp> {

    const key = functionKey(document, position);

    if (key.isEmpty()) {
      return;
    }

    const SignatureHelp = new vscode.SignatureHelp();
    const functions = this.allFunctions();
    if (key.isSingle()) {
      const funcName = key.keys[0];

      const func = functions.find((func) => func.name == funcName);

      if (!func) {
        return;
      }
      
      const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(x => x.origin).join(", ") : ""}) -> ${func.returns ?? "nothing"}`);
      SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.text);
      func.takes.forEach(take => {
        if (take.name) {
          SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
        }
      });
      SignatureHelp.activeParameter = key.takeIndex;
      SignatureHelp.signatures.push(SignatureInformation);

    }

    return SignatureHelp;
  }
}

vscode.languages.registerSignatureHelpProvider("lua", new LuaSignatureHelp, "(", ",");
