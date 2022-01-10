/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */


import * as vscode from "vscode";

import { getChildrenTypes, getParentTypes, StatementTypes, TypeExtends, Types } from "./types";
import { getTypeDesc } from "./type-desc";
import { AllKeywords, Keywords } from "./keyword";
import { Options } from "./options";
// import * as jassParse from "../jass/parse";
// import * as jassAst from "../jass/ast";
// import * as zincParse from "../zinc/parse";
// import * as zincAst from "../zinc/ast";
// import * as vjassParse from "../vjass/parse";
// import * as vjassAst from "../vjass/ast";
import { compare, getPathFileName, isAiFile, isZincFile } from "../tool";
import { convertPosition, functionKey } from "./tool";
import data, { parseContent, parseZincContent } from "./data";
import { Position } from "../common";
import { Global, Local, Library, Program, Take, Func, Native, Struct, Method, Member } from "../jass/ast";
import { Parser } from "../jass/parser";
import { tokenize } from "../jass/tokens";


const typeItems: vscode.CompletionItem[] = [];
StatementTypes.forEach(type => {
  const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
  item.detail = type;
  item.documentation = getTypeDesc(type);
  typeItems.push(item);
});

const CodeItem = item("code", vscode.CompletionItemKind.Class, "句柄", `传递function`);

const keywordItems: vscode.CompletionItem[] = [];
(Options.isOnlyJass ? Keywords : AllKeywords).forEach(keyword => {
  const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  keywordItems.push(item);
});


type CompletionItemOption = {
  kind?: vscode.CompletionItemKind,
  detial?: string,
  documentation?: string[]|string,
  code?: string,
  source?: string,
  orderString?: string
};

function completionItem(label: string, option: CompletionItemOption = {
  kind: undefined,
  detial: undefined,
  documentation: undefined,
  code: undefined,
  source: undefined,
  orderString: undefined
}) {
  const item = new vscode.CompletionItem(label, option.kind);
  item.detail = option.detial ?? label;
  const ms = new vscode.MarkdownString();
  if (option.source) {
    ms.appendMarkdown(`(***${option.source}***)`);
  }
  if (option.documentation) {
    if (option.source) {
      ms.appendText("\n");
    }
    if (Array.isArray(option.documentation)) {
      option.documentation.forEach((documentation) => {
        ms.appendMarkdown(documentation);
      });
    } else {
      ms.appendMarkdown(option.documentation);
    }
  }
  if (option.code) {
    ms.appendCodeblock(`${option.code}`);
  }
  item.documentation = ms;
  item.sortText = option.orderString;
  return item;
}

enum PositionType {
  Unkown,
  Returns,
  LocalType,
  Array,
  ConstantType,
  FuncNaming,
  TakesFirstType,
  TakesOtherType,
  TakesNaming,
  Call,
  Set,
  Point,
  LocalNaming,
  TakesKeyword,
  ReturnKeyword,
  Assign,
  Args,
  Requires
}

/**
 * 判断当前指标位置类型
 */
class PositionTool {
  private static ReturnsRegExp = new RegExp(/\breturns\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static LocalRegExp = new RegExp(/\blocal\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static LocalNamingRegExp = new RegExp(/\blocal\s+[a-zA-Z0-9]+[a-zA-Z0-9_]*\s+(?:array\s+)?[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static ConstantRegExp = new RegExp(/\bconstant\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static FuncNamingRegExp = new RegExp(/\bfunction\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakeTypeFirstRegExp = new RegExp(/\btakes\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakeTypeOtherRegExp = new RegExp(/,\s*[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakeNamingRegExp = new RegExp(/(?:,\s*|\btakes\s+)[a-zA-Z0-9]+[a-zA-Z0-9_]*\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static CallRegExp = new RegExp(/\bcall\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static SetRegExp = new RegExp(/\bset\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static PointRegExp = new RegExp(/\b[a-zA-Z0-9]+[a-zA-Z0-9_]*\s*\.\s*[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakesKeywordRegExp = new RegExp(/\bfunction\s+[a-zA-Z0-9]+[a-zA-Z0-9_]*\s+[takes]*$/);
  private static ReturnsKeywordRegExp = new RegExp(/\btakes\s+nothing\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static RequiresKeywordRegExp = new RegExp(/\b(?:requires|needs|uses)\s+(?:optional\s+)?[a-zA-Z0-9]?[a-zA-Z0-9_]*(?:\s*,\s*(?:optional\s+)?[a-zA-Z0-9]?[a-zA-Z0-9_]*)*$/);


  public static is(document: vscode.TextDocument, position: vscode.Position): PositionType {
    const lineText = document.lineAt(position.line);
    const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);
    if (this.ReturnsRegExp.test(inputText)) {
      return PositionType.Returns;
    } else if (this.LocalRegExp.test(inputText)) {
      return PositionType.LocalType;
    } else if (this.ConstantRegExp.test(inputText)) {
      return PositionType.ConstantType;
    } else if (this.ReturnsKeywordRegExp.test(inputText)) { // 
      return PositionType.ReturnKeyword;
    } else if (/\btakes\b/.test(inputText) && this.TakeTypeFirstRegExp.test(inputText)) {
      return PositionType.TakesFirstType;
    } else if (/\btakes\b/.test(inputText) && this.TakeTypeOtherRegExp.test(inputText)) {
      return PositionType.TakesOtherType;
    } else if (/\btakes\b/.test(inputText) && this.TakeNamingRegExp.test(inputText)) {
      return PositionType.TakesNaming;
    } else if (this.CallRegExp.test(inputText)) {
      return PositionType.Call;
    } else if (this.SetRegExp.test(inputText)) {
      return PositionType.Set;
    } else if (this.PointRegExp.test(inputText)) {
      return PositionType.Point;
    } else if (this.LocalNamingRegExp.test(inputText)) {
      return PositionType.LocalNaming;
    } else if (this.TakesKeywordRegExp.test(inputText)) {
      return PositionType.TakesKeyword;
    } else if (/\bfunction\b/.test(inputText) && /\btakes\b/.test(inputText) && inputText.indexOf("function") < inputText.indexOf("takes")) {
      return PositionType.ReturnKeyword;
    } else if (this.CallRegExp.test(inputText)) {
      return PositionType.Call;
    } else if ((() => {
      const key = functionKey(document, position);
      return key.isSingle();
    })()) {
      return PositionType.Args;
    } else if (this.FuncNamingRegExp.test(inputText)) {
      return PositionType.FuncNaming;
    } else if (/^local\b/.test(inputText) && /(?<!=)=(?!=)/.test(inputText) && inputText.indexOf("=") < position.character) {
      return PositionType.Assign;
    } else if (this.RequiresKeywordRegExp.test(inputText)) {
      return PositionType.Requires;
    }

    return PositionType.Unkown;
  }
}

function item(label: string, kind: vscode.CompletionItemKind, documentation?: string, code?: string) {
  const item = new vscode.CompletionItem(label, kind);
  item.documentation = new vscode.MarkdownString().appendMarkdown(documentation ?? "").appendCodeblock(code ?? "");
  return item;
}

const NothingItem = item("nothing", vscode.CompletionItemKind.Keyword);
const TakesKeywordItem = item("takes", vscode.CompletionItemKind.Keyword);
const ArrayKeywordItem = item("array", vscode.CompletionItemKind.Keyword);
const ReturnsKeywordItem = item("returns", vscode.CompletionItemKind.Keyword);
const NullKeywordItem = item("null", vscode.CompletionItemKind.Keyword);

function libraryToCompletionItem(library: Library, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(library.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Field,
    source: option?.source ?? library.source,
    code: option?.code ?? library.origin,
    documentation: option?.documentation ?? library.getContents(),
    orderString: option?.orderString,
    detial: option?.detial ?? library.name
  });
}

function funcToCompletionItem(func: Func|Native, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(func.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Function,
    source: option?.source ?? func.source,
    code: option?.code ?? func.origin,
    documentation: option?.documentation ?? (() => {
      const contents = func.getContents();
      func.getParams().forEach((param) => {
        if (func.takes.findIndex((take) => take.name == param.id) != -1) {
          contents.push(`\n***@param*** **${param.id}** *${param.descript}*`);
        }
      });

      return contents;
    })(),
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function methodToCompletionItem(func: Method, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(func.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Method,
    source: option?.source ?? func.source,
    code: option?.code ?? func.origin,
    documentation: option?.documentation ?? (() => {
      const contents = func.getContents();
      func.getParams().forEach((param) => {
        if (func.takes.findIndex((take) => take.name == param.id) != -1) {
          contents.push(`\n***@param*** **${param.id}** *${param.descript}*`);
        }
      });

      return contents;
    })(),
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function memberToCompletionItem(member: Member, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(member.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.EnumMember,
    source: option?.source ?? member.source,
    code: option?.code ?? member.origin,
    documentation: option?.documentation ?? member.getContents(),
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function globalToCompletionItem(global: Global, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(global.name, {
    kind: option?.kind ?? global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable,
    source: option?.source ?? global.source,
    code: option?.code ?? global.origin,
    documentation: option?.documentation ?? global.getContents(),
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function localToCompletionItem(local: Local, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(local.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Variable,
    source: option?.source ?? local.source,
    code: option?.code ?? local.origin,
    documentation: option?.documentation ?? local.getContents(),
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function takeToCompletionItem(take: Take, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(take.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Property,
    source: option?.source,
    code: option?.code ?? take.origin,
    documentation: option?.documentation,
    orderString: option?.orderString,
    detial: option?.detial
  });
}

function structToCompletionItem(struct: Struct, option?: CompletionItemOption) :vscode.CompletionItem {
  return completionItem(struct.name, {
    kind: option?.kind ?? vscode.CompletionItemKind.Class,
    source: option?.source ?? struct.source,
    code: option?.code ?? struct.origin,
    documentation: option?.documentation ?? struct.getContents(),
    orderString: option?.orderString,
    detial: option?.detial ?? struct.name
  });
}

vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();

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

    /**
     * 获取位置上的librarys
     */
    const postionLibrarys = (current: (library: Library) => void, requireCallback: (library: Library) => void) => {
      const requires: string[] = [];
      return data.librarys().filter((library) => {
        if (compare(library.source, fsPath) && library.loc.contains(convertPosition(position))) {
          requires.push(...library.requires);
          current(library);
          return false;
        }
        return true;
      }).forEach((library) => {
        if (requires.includes(library.name)) {
          requireCallback(library);
          return true;
        }
      });
    };

    const findFunctionByName = (name: string): (Func|Native)[] => {
      const funcs = [...data.functions(), ...data.natives()];

      if (!Options.isOnlyJass) {
        postionLibrarys((library) => {
          library.functions.forEach((func) => {
            funcs.push(func);
          });
        }, (library) => {
          library.functions.filter((func) => func.tag != "private").forEach((func) => {
            funcs.push(func);
          });
        });
      }
      return funcs.filter((func) => func.name == name);
    };

    function structTypeItems() {
      return [...data.structs(), ...data.libraryStructs(), ...data.zincLibraryStructs()].map((struct) => {
        return structToCompletionItem(struct);
      });
    }

    // 获取当前位置提示类型
    const type = PositionTool.is(document, position);
    switch (type) {
      case PositionType.FuncNaming:
      case PositionType.TakesNaming:
      case PositionType.TakesNaming:
        return null;
      case PositionType.LocalNaming:
        items.push(ArrayKeywordItem);
      case PositionType.Set:
        // return [...typeLocalAndTakeItem(document, position, null), ...setGlobalItems()];
        fieldGlobals().filter((global) => !global.isConstant).forEach((global) => {
          items.push(globalToCompletionItem(global));
        });
        fieldLocals().forEach((local) => {
          items.push(localToCompletionItem(local));
        });
        fieldTakes().forEach((funcTake, index) => {
          items.push(takeToCompletionItem(funcTake.take, {
            source: funcTake.func.source,
            documentation: funcTake.func.getParams().map((param) => {
              if (param.id == funcTake.take.name) {
                return `*${param.descript}*`;
              }
              return `*${param.descript}*`;
            }),
            // 尽可能让参数在最前
            orderString: `${index}`
          }))
        });
        // setItems();
        break;
      case PositionType.Returns:
        items.push(...typeItems, NothingItem, ...structTypeItems());
        return items;
      case PositionType.LocalType:
        items.push(...typeItems, ...structTypeItems());
        break;
      case PositionType.ConstantType:
        items.push(...typeItems);
        return items;
      case PositionType.TakesFirstType:
        items.push(...typeItems, NothingItem, CodeItem, ...structTypeItems());
        return items;
      case PositionType.TakesOtherType:
        items.push(...typeItems, CodeItem, ...structTypeItems());
        return items;
      case PositionType.TakesKeyword:
        items.push(TakesKeywordItem);
        return items;
      case PositionType.ReturnKeyword:
        items.push(ReturnsKeywordItem);
        return items;
      case PositionType.ReturnKeyword:
        items.push(ReturnsKeywordItem);
        return items;
      case PositionType.Requires:
        fieldLibrarys().forEach((library) => {
          items.push(libraryToCompletionItem(library));
        });
        break;
      case PositionType.Assign:
        const lineText = document.lineAt(position.line);
        const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);
        const result = /local\s+(?<type>[a-zA-Z]+[a-zA-Z0-9_]*)\b/.exec(inputText);
        if (result && result.groups) {
          const type = result.groups["type"];
          // return [...typeFunctionAndGlobalItems(type), ...typeLocalAndTakeItem(document, position, type)];
          [...data.natives(), ...fieldFunctions()].filter((func) => {
            return type == func.returns || getParentTypes(type).includes(func.returns);
          }).forEach((func) => {
            items.push(funcToCompletionItem(func));
          });
          fieldGlobals().filter((global) => {
            return type == global.type || getParentTypes(type).includes(global.type);
          }).forEach((global) => {
            items.push(globalToCompletionItem(global));
          });
          fieldLocals().filter((local) => {
            return type == local.type || getParentTypes(type).includes(local.type);
          }).forEach((local) => {
            items.push(localToCompletionItem(local));
          });
          fieldTakes().filter((funcTake) => {
            return type == funcTake.take.type || getParentTypes(type).includes(funcTake.take.type);
          }).forEach((funcTake, index) => {
            items.push(takeToCompletionItem(funcTake.take, {
              source: funcTake.func.source,
              documentation: funcTake.func.getParams().map((param) => {
                if (param.id == funcTake.take.name) {
                  return `*${param.descript}*`;
                }
                return `*${param.descript}*`;
              }),
              // 尽可能让参数在最前
              orderString: `${index}`
            }))
          });
        }
        break;
      case PositionType.Call:
        [...data.natives(), ...fieldFunctions()].forEach((func) => {
          items.push(funcToCompletionItem(func));
        });
        break;
      case PositionType.Args:
        // 方法参数列表
        const key = functionKey(document, position);
        // type为PositionType.Args时,可以断言key[0]不为null
        const funcs = findFunctionByName(key.keys[0]);
        funcs.forEach((func) => {
          if (func.takes[key.takeIndex]) {
            const type = func.takes[key.takeIndex].type;
            [...data.natives(), ...fieldFunctions()].filter((func) => {
              return type == func.returns || getParentTypes(type).includes(func.returns);
            }).forEach((func) => {
              items.push(funcToCompletionItem(func));
            });
            fieldGlobals().filter((global) => {
              return type == global.type || getParentTypes(type).includes(global.type);
            }).forEach((global) => {
              items.push(globalToCompletionItem(global));
            });
            fieldLocals().filter((local) => {
              return type == local.type || getParentTypes(type).includes(local.type);
            }).forEach((local) => {
              items.push(localToCompletionItem(local));
            });
            fieldTakes().filter((funcTake) => {
              return type == funcTake.take.type || getParentTypes(type).includes(funcTake.take.type);
            }).forEach((funcTake, index) => {
              items.push(takeToCompletionItem(funcTake.take, {
                source: funcTake.func.source,
                documentation: funcTake.func.getParams().map((param) => {
                  if (param.id == funcTake.take.name) {
                    return `*${param.descript}*`;
                  }
                  return `*${param.descript}*`;
                }),
                // 尽可能让参数在最前
                orderString: `${index}`
              }))
            });
          }
        });
        break;
      default:
        items.push(...typeItems, ...structTypeItems());
        items.push(...keywordItems);
        [...data.natives(), ...fieldFunctions()].forEach((func) => {
          items.push(funcToCompletionItem(func));
        });
    }

    // const isAiExt = isAiFile(document.uri.fsPath);

    if (!isZincExt) {

    }

    return items;
  }
});

type GcFunc = (name: string) => string;

class Gc {
  public type: string;
  public gc: GcFunc;

  constructor(type: string, gc: GcFunc) {
    this.type = type;
    this.gc = gc;
  }
}

const RecoverableTypes: Gc[] = [
  new Gc("boolexpr", (name) => {
    return `call DestroyBoolExpr(${name})\nset ${name} = null`;
  }),
  new Gc("commandbuttoneffect", (name) => {
    return `call DestroyCommandButtonEffect(${name})\nset ${name} = null`;
  }),
  new Gc("condition", (name) => {
    return `call DestroyCondition(${name})\nset ${name} = null`;
  }),
  new Gc("effect", (name) => {
    return `call DestroyEffect(${name})\nset ${name} = null`;
  }),
  new Gc("force", (name) => {
    return `call DestroyForce(${name})\nset ${name} = null`;
  }),
  new Gc("group", (name) => {
    return `call DestroyGroup(${name})\nset ${name} = null`;
  }),
  new Gc("image", (name) => {
    return `call DestroyImage(${name})\nset ${name} = null`;
  }),
  new Gc("itempool", (name) => {
    return `call DestroyItemPool(${name})\nset ${name} = null`;
  }),
  new Gc("leaderboard", (name) => {
    return `call DestroyLeaderboard(${name})\nset ${name} = null`;
  }),
  new Gc("lightning", (name) => {
    return `call DestroyLightning(${name})\nset ${name} = null`;
  }),
  new Gc("quest", (name) => {
    return `call DestroyQuest(${name})\nset ${name} = null`;
  }),
  new Gc("timer", (name) => {
    return `call DestroyTimer(${name})\nset ${name} = null`;
  }),
  new Gc("trigger", (name) => {
    return `call DestroyTrigger(${name})\nset ${name} = null`;
  }),
  new Gc("ubersplat", (name) => {
    return `call DestroyUbersplat(${name})\nset ${name} = null`;
  }),
  new Gc("unitpool", (name) => {
    return `call DestroyUnitPool(${name})\nset ${name} = null`;
  }),
  new Gc("framehandle", (name) => {
    return `call BlzDestroyFrame(${name})\nset ${name} = null`;
  }),
  new Gc("dialog", (name) => {
    return `call DialogDestroy(${name})\nset ${name} = null`;
  }),
  new Gc("location", (name) => {
    return `call RemoveLocation(${name})\nset ${name} = null`;
  }),
  new Gc("integer", (name) => {
    return `set ${name} = 0`;
  }),
  new Gc("real", (name) => {
    return `set ${name} = 0.0`;
  }),
  new Gc("string", (name) => {
    return `set ${name} = null`;
  }),
  new Gc("multiboard", (name) => {
    return `call DestroyMultiboard(${name})\nset ${name} = null`;
  }),
];
const defaultGc = new Gc("", (name) => {
  return `set ${name} = null`;
});

vscode.languages.registerCompletionItemProvider("jass", new class GcCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items: vscode.CompletionItem[] = [];

    data.programs().forEach((program) => {
      if (document.uri.fsPath == program.source) {
        program.functions.forEach(func => {
          if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
            const item = new vscode.CompletionItem("gc", vscode.CompletionItemKind.Unit);
            const localGcString = func.locals.map(local => {
              const gc = RecoverableTypes.find((gc) => gc.type == local.type);
              return gc ? gc.gc(local.name) : defaultGc.gc(local.name);
            }).join("\n");
            const takesGcString = func.takes.map(take => {
              const gc = RecoverableTypes.find((gc) => gc.type == take.type);
              return gc ? gc.gc(take.name) : defaultGc.gc(take.name);
            }).join("\n");
            item.documentation = new vscode.MarkdownString().appendText("自动排泄\n").appendCodeblock(`function auto_gc take nothing returns nothing\n\tlocal unit u = null\n\t// gc automatic excretion is output at the end of the function\n\tgc\nendfunction`);
            item.insertText = `${localGcString}\n${takesGcString}`;
            items.push(item);
          }
        });
      }
    });
    return items;
  }
}());


vscode.languages.registerCompletionItemProvider("jass", new class TypeCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const text = document.lineAt(position.line).text;
    if (/^\s*\/\//.test(text)) return;
    const items: vscode.CompletionItem[] = [];

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
        if (token.isOp() && token.value == ".") {
          state = 1;
        } else if (token.isId()) {
          ids.push(token.value);
          state = 2;
        } else break;
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

    
    if (ids.length != 1 && ids.length != 2) {
      return null;
    }

    ids.reverse();

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

    if (ids[0] == "this") {

    } else {
      const usebleStructs = fieldStructs();
      const struct = usebleStructs.find((struct, index, structs) => {
        return struct.name == ids[0];
      });
      if (struct) { // 静态方法
        struct.methods.filter((method) => {
          return method.modifier.includes("static");
        }).forEach((method) => {
          items.push(methodToCompletionItem(method));
        });
        struct.members.filter((member) => {
          return member.modifier.includes("static");
        }).forEach((member) => {
          items.push(memberToCompletionItem(member));
        });
      }
      const usebleLocals = fieldLocals();
      usebleLocals.filter((local) => {
        return local.name == ids[0];
      }).forEach((local) => {
        const struct = usebleStructs.find((struct, index, structs) => {
          return struct.name == local.type;
        });
        
        if (struct) {
          console.log(struct);
          
          struct.methods.filter((method) => {
            return !method.modifier.includes("static");
          }).forEach((method) => {
            items.push(methodToCompletionItem(method));
          });
          struct.members.filter((member) => {
            return !member.modifier.includes("static");
          }).forEach((member) => {
            items.push(memberToCompletionItem(member));
          });
        }

      });

    }

    return items;
  }
}(), ".", ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
