import * as vscode from 'vscode';


import { Types } from "./types";
import { AllKeywords } from './keyword';
import { Options } from './options';
import data, { parseContent, parseZincContent } from "./data";
import { compare, isZincFile } from '../tool';
import { convertPosition } from './tool';
import { Func, Library, Local, Take } from '../jass/ast';



class HoverProvider implements vscode.HoverProvider {
  
  // 规定标识符长度
  private _maxLength = 526;

  private isNumber = function (val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));

    if (key.length > this._maxLength) {
      return null;
    }

    if (this.isNumber(key)) {
      return null;
    }

    if (AllKeywords.includes(key)) {
      return null;
    }

    const type = Types.find(type => type === key);
    if (type) {
      const markdownString = new vscode.MarkdownString().appendCodeblock(type);
      return new vscode.Hover(markdownString);
    }

    const fsPath = document.uri.fsPath;
    const isZincExt = isZincFile(fsPath);
    if (!isZincExt) {
      parseContent(fsPath, document.getText());
      
      if (!Options.isOnlyJass) {
        if (Options.supportZinc) {
          parseZincContent(fsPath, document.getText());
        }
      }
    }

    const hovers: vscode.MarkdownString[] = [];

    const fieldLibrarys = () => {
      const librarys:Library[] = [];

      if (!Options.isOnlyJass) {
        librarys.push(...data.librarys());

        if (Options.supportZinc) {
          librarys.push(...data.zincLibrarys());
        }
      }
      
      return librarys;
    };
    const fieldFunctions = () => {
      const funcs = data.functions();

      if (!Options.isOnlyJass) {
        const requires: string[] = [];
        data.librarys().filter((library) => {
          if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
            requires.push(...library.requires);
            funcs.push(...library.functions);
            return false;
          }
          return true;
        }).forEach((library) => {
          if (requires.includes(library.name)) {
            funcs.push(...library.functions.filter((func) => func.tag != "private"));
          }
        });

        if (Options.supportZinc) {
          data.zincLibrarys().filter((library) => {
            if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
              requires.push(...library.requires);
              funcs.push(...library.functions);
              return false
            }
            return true;
          }).forEach((library) => {
            if (requires.includes(library.name)) {
              funcs.push(...library.functions.filter((func) => func.tag != "private"));
            }
          });
        }
      }
      
      return funcs;
    };
    const fieldGlobals = () => {
      const globals = data.globals();

      data.functions().forEach((func) => {
        if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
          globals.push(...func.getGlobals());
        }
      });

      if (!Options.isOnlyJass) {
        const requires: string[] = [];
        data.librarys().filter((library) => {
          if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
            requires.push(...library.requires);
            globals.push(...library.globals);
            return false;
          }
          return true;
        }).forEach((library) => {
          if (requires.includes(library.name)) {
            globals.push(...library.globals.filter((func) => func.tag != "private"));
          }
        });
        // 方法内部的globals
        data.libraryFunctions().forEach((func) => {
          if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
            globals.push(...func.getGlobals());
          }
        });

        if (Options.supportZinc) {
          data.zincLibrarys().filter((library) => {
            if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
              requires.push(...library.requires);
              globals.push(...library.globals);
              return false;
            }
            return true;
          }).forEach((library) => {
            if (requires.includes(library.name)) {
              globals.push(...library.globals.filter((func) => func.tag != "private"));
            }
          });
          // 旧版本的zinc解析，这里不会执行，因为没有解析这部分的代码
          data.zincLibraryFunctions().forEach((func) => {
            if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
              globals.push(...func.getGlobals());
            }
          });
        }
      }
      
      return globals;
    };

    const fieldTakes = () => {
      const takes:{
        take: Take,
        func:Func
      }[] = [];
      data.functions().forEach((func) => {
        if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
          
          takes.push(...func.takes.map((take) => {
            return {take, func};
          }));
        }
      });

      if (!Options.isOnlyJass) {
        data.libraryFunctions().forEach((func) => {
          if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
            takes.push(...func.takes.map((take) => {
              return {take, func};
            }));
          }
        });

        if (Options.supportZinc) {
          data.zincLibraryFunctions().forEach((func) => {
            if (compare(func.source, fsPath) && func.loc.contains(convertPosition(position))) {
              takes.push(...func.takes.map((take) => {
                return {take, func};
              }));
            }
          });
        }
      }

      return takes;
    };

    const fieldLocals = () => {
      const locals:Local[] = [];
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

    [...fieldFunctions(),...data.natives()].forEach((func) => {
      if (key == func.name) {
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${func.name}`);
        ms.appendText("\n");
        func.getContents().forEach((content) => {
          ms.appendText(content);
        });
        func.getParams().forEach((param) => {
          if (func.takes.findIndex((take) => take.name == param.id) != -1) {
            ms.appendText("\n");
            ms.appendMarkdown(`***@param*** **${param.id}** *${param.descript}*`);
          }
        });
        ms.appendText("\n");
        ms.appendCodeblock(func.origin);
        hovers.push(ms);
      }
    });
    fieldGlobals().forEach((global) => {
      if (key == global.name) {     
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${global.name}`);
        ms.appendText("\n");
        global.getContents().forEach((content) => {
          ms.appendText(content);
        });
        ms.appendText("\n");
        ms.appendCodeblock(global.origin);
        hovers.push(ms);
      }
    });
    fieldLocals().forEach((local) => {
      if (key == local.name) {     
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${local.name}`);
        ms.appendText("\n");
        local.getContents().forEach((content) => {
          ms.appendText(content);
        });
        ms.appendText("\n");
        ms.appendCodeblock(local.origin);
        hovers.push(ms);
      }
    });
    fieldTakes().forEach((funcTake) => {
      if (key == funcTake.take.name) {     
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${funcTake.take.name}`);
        ms.appendText("\n");
        funcTake.func.getParams().forEach((param) => {
          if (param.id == funcTake.take.name) {
            ms.appendText(param.descript);
          }
        });
        ms.appendText("\n");
        ms.appendCodeblock(funcTake.take.origin);
        hovers.push(ms);
      }
    });
    fieldStructs().forEach((struct) => {
      if (key == struct.name) {     
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${struct.name}`);
        ms.appendText("\n");
        struct.getContents().forEach((content) => {
          ms.appendText(content);
        });
        ms.appendText("\n");
        ms.appendCodeblock(struct.origin);
        hovers.push(ms);
      }
    });
    fieldLibrarys().forEach((library) => {
      if (key == library.name) {     
        const ms = new vscode.MarkdownString();
        ms.appendMarkdown(`#### ${library.name}`);
        ms.appendText("\n");
        library.getContents().forEach((content) => {
          ms.appendText(content);
        });
        ms.appendText("\n");
        ms.appendCodeblock(library.origin);
        hovers.push(ms);
      }
    });

    return new vscode.Hover([...hovers]);
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());

