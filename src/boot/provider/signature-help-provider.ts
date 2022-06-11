import * as vscode from 'vscode';


import data, { parseContent } from './data';
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
          ids.push(token.value);
          state = 2;
        } else break;
      } else if (state == 2) {
        if (token.isOp() && token.value == ".") {
          state = 1;
        } else break;
      }
    }


    if (ids.length == 0) {
      return null;
    }

    ids.reverse();

    // const fieldFunctions = () :(Func|Native)[] => {
    //   const funcs:(Func|Native)[] = data.functions();
    //   funcs.push(...data.natives());

      

    //   return funcs;
    // };

    const fieldStructs = () => {
      const structs = data.structs();

      if (!Options.isOnlyJass) {
        const requires: string[] = [];
        data.librarys().filter((library) => {
          if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
            requires.push(...library.requires);
            structs.push(...library.structs);
            return false;
          }
          return true;
        }).forEach((library) => {
          if (requires.includes(library.name)) {
            structs.push(...library.structs.filter((struct) => struct.tag != "private"));
          }
        });

        if (Options.supportZinc) {
          data.zincLibrarys().filter((library) => {
            if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
              requires.push(...library.requires);
              structs.push(...library.structs);
              return false
            }
            return true;
          }).forEach((library) => {
            if (requires.includes(library.name)) {
              structs.push(...library.structs.filter((struct) => struct.tag != "private"));
            }
          });
        }
      }

      return structs;
    };
    const fieldTakes = () => {
      const takes: {
        take: Take,
        func: Func
      }[] = [];
      data.functions().forEach((func) => {
        if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {

          takes.push(...func.takes.map((take) => {
            return { take, func };
          }));
        }
      });

      if (!Options.isOnlyJass) {
        data.libraryFunctions().forEach((func) => {
          if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
            takes.push(...func.takes.map((take) => {
              return { take, func };
            }));
          }
        });

        if (Options.supportZinc) {
          data.zincLibraryFunctions().forEach((func) => {
            if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
              takes.push(...func.takes.map((take) => {
                return { take, func };
              }));
            }
          });
        }
      }

      return takes;
    };
    const fieldLocals = () => {
      const locals: Local[] = [];
      data.functions().forEach((func) => {
        if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
          locals.push(...func.locals);
        }
      });

      if (!Options.isOnlyJass) {
        data.libraryFunctions().forEach((func) => {
          if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
            locals.push(...func.locals);
          }
        });

        if (Options.supportZinc) {
          data.zincLibraryFunctions().forEach((func) => {
            if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
              locals.push(...func.locals);
            }
          });
        }
      }

      return locals;
    };

    if (ids.length == 1) { // 方法
      const func = [...fieldFunctions(fsPath, position), ...data.natives()].find((func) => {
        return ids[0] == func.name;
      });

      if (func) {
        const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(x => x.origin).join(", ") : ""}) -> ${func.returns ?? "nothing"}`);

        SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.getContents().join("\n"));

        func.takes.forEach(take => {
          if (take.name) {
            SignatureInformation.parameters.push(new vscode.SignatureInformation(take.name));
          }
        });
        const SignatureHelp = new vscode.SignatureHelp();
        SignatureHelp.activeParameter = argc;
        SignatureHelp.signatures.push(SignatureInformation);

        return SignatureHelp;
      }
    } else if (ids.length == 2) { // struct
      if (ids[0] == "this") {

      } else {
        const usebleStructs = fieldStructs();
        const struct = usebleStructs.find((struct, index, structs) => {
          return struct.name == ids[0];
        });
        if (struct) { // 静态方法
          const method = struct.methods.find((method) => {
            return method.modifier.includes("static") && method.name == ids[1];
          });

          if (method) {
            const SignatureInformation = new vscode.SignatureInformation(`${method.name}(${method.takes.length > 0 ? method.takes.map(x => x.origin).join(", ") : ""}) -> ${method.returns ?? "nothing"}`);

            SignatureInformation.documentation = new vscode.MarkdownString().appendText(method.getContents().join("\n"));

            method.takes.forEach(method => {
              if (method.name) {
                SignatureInformation.parameters.push(new vscode.SignatureInformation(method.name));
              }
            });
            const SignatureHelp = new vscode.SignatureHelp();
            SignatureHelp.activeParameter = argc;
            SignatureHelp.signatures.push(SignatureInformation);

            return SignatureHelp;
          }
        }
        const usebleLocals = fieldLocals();
        const local = usebleLocals.find((local) => {
          return local.name == ids[0];
        });
        if (local) {
          const struct = usebleStructs.find((struct, index, structs) => {
            return struct.name == local.type;
          });

          if (struct) {
            const method = struct.methods.find((method) => {
              return !method.modifier.includes("static") && method.name == ids[1];
            });

            if (method) {
              const SignatureInformation = new vscode.SignatureInformation(`${method.name}(${method.takes.length > 0 ? method.takes.map(x => x.origin).join(", ") : ""}) -> ${method.returns ?? "nothing"}`);

              SignatureInformation.documentation = new vscode.MarkdownString().appendText(method.getContents().join("\n"));

              method.takes.forEach(method => {
                if (method.name) {
                  SignatureInformation.parameters.push(new vscode.SignatureInformation(method.name));
                }
              });
              const SignatureHelp = new vscode.SignatureHelp();
              SignatureHelp.activeParameter = argc;
              SignatureHelp.signatures.push(SignatureInformation);

              return SignatureHelp;
            }
          }
        }

      }
    }

    if (Options.isSupportCjass) {
      const SignatureHelp = new vscode.SignatureHelp();
      SignatureHelp.activeParameter = argc;
      // data.cjassDefineMacros().forEach(defineMacro => {
      for (let index = 0; index < data.cjassDefineMacros().length; index++) {
        const defineMacro = data.cjassDefineMacros()[index];
        if (ids[ids.length - 1] == defineMacro.keys[defineMacro.keys.length - 1].name) {
          console.log(ids[ids.length - 1] == defineMacro.keys[defineMacro.keys.length - 1].name);
          
          const SignatureInformation = new vscode.SignatureInformation(defineMacro.origin);

          defineMacro.takes.forEach(take => {
            if (take) {
              SignatureInformation.parameters.push(new vscode.SignatureInformation(take));
            }
          });
          SignatureHelp.signatures.push(SignatureInformation);
        }
      }
      return SignatureHelp;
    }

    return null;

  }
}

vscode.languages.registerSignatureHelpProvider("jass", new SignatureHelp, "(", ",");

