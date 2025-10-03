// /**
//  * 当前文件为completion-item-provider.ts的从新实现版本，
//  * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
//  */


import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";
import { Caller, GlobalContext, Id, IdIndex } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import { ASTVisitor, Document } from "../jass/tokenizer-common";
import { AllKeywords } from "../jass/keyword";
import { isJFile, isZincFile, isAiFile, isLuaFile } from "../tool";
import { Token, tokenize } from "../jass/tokens";
import { Position } from "../jass/loc";
import { keyGetter } from "./tool";
import { nativeToItem, functionToItem, globalVariableToItem, keyworldToItem, typeToItem } from "./complation-item-generator";
import { Types } from "./types";


function getTargetObject(keys: {
	key: string,
	type: "func_call"| "id"
}[], current:Document, position: Position) {
  const objects:vjass_ast.NodeAst[] = [];
  keys.forEach((key, index) => {
    if (index == 0) {
      if (key.type == "func_call") {
        objects.push(...GlobalContext.get_natives_by_name(key.key));
        objects.push(...GlobalContext.get_functions_by_name(key.key));
      } else if (key.type == "id") {
        if (key.key == "this" || key.key == "thistype") {
          current.acceptStruct((struct) => {
            if (struct.contains(position)) {
              objects.push(struct);
            }
          });
        } else {
          objects.push(...GlobalContext.get_structs_by_name(key.key));
          objects.push(...GlobalContext.get_global_variables_by_name(key.key));
        }
      }
    } else {
      // 从objects中赛选
      objects.filter(object => {
        if (key.type == "func_call") {
          return object instanceof vjass_ast.Func || object instanceof vjass_ast.Native;
        } else if (key.type == "id") {
          return object instanceof vjass_ast.GlobalVariable || object instanceof vjass_ast.Struct;
        }
      });
    }
  });
  return objects;
}

export class StructCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const vjassDocument = GlobalContext.get(document.uri.fsPath);
    
    if (vjassDocument) {
      const items: vscode.CompletionItem[] = [];
      const program = vjassDocument.program;
      const pos = new Position(position.line, position.character);
      // 使用新的 lambda 方法简化代码
      vjassDocument.acceptStruct((structNode) => {
        if (structNode.contains(pos)) {
          
          // 使用 acceptMethodFromNode 从 structNode 开始访问其子节点中的方法
          vjassDocument.acceptMethodFromNode(structNode, (methodNode) => {
            if (methodNode.contains(pos)) {
              // 使用 acceptLocalFromNode 从 methodNode 开始访问其子节点中的局部变量
              vjassDocument.acceptLocalFromNode(methodNode, (localNode) => {
                if (localNode.start.line == pos.line) { // 同一行
                  const keys = keyGetter(document.getText(new vscode.Range(position.line, 0, position.line, position.character)));
                  // local 声明会出现的关键字
                  ["array", "function", "false", "true", "null", "not", "or", "and", "local"].forEach(keyworld => {
                    items.push(keyworldToItem(keyworld));
                  });
                  if (localNode.type) {
                    // 添加匹配类型的原生函数
                    GlobalContext.get_natives_by_type(localNode.type.getText()).forEach(native => {
                      items.push(nativeToItem(native));
                    });
                    GlobalContext.get_funcs_by_type(localNode.type.getText()).forEach(func => {
                      items.push(functionToItem(func));
                    });
                    GlobalContext.get_global_variables_by_type(localNode.type.getText()).forEach(globalVariable => {
                      items.push(globalVariableToItem(globalVariable));
                    });
                  } else {
                    // 添加无返回值的原生函数
                    GlobalContext.get_natives_by_type("nothing").forEach(native => {
                      items.push(nativeToItem(native));
                    });
                    GlobalContext.get_funcs_by_type("nothing").forEach(func => {
                      items.push(functionToItem(func));
                    });
                    GlobalContext.get_global_variables_by_type("nothing").forEach(globalVariable => {
                      items.push(globalVariableToItem(globalVariable));
                    });
                    Types.forEach(type => {
                      items.push(keyworldToItem(type));
                    });

                  }
                }
              });
              vjassDocument.acceptSetFromNode(methodNode, (setNode) => {
                if (setNode.start && setNode.start.line == pos.line) {
                  // 在 Set 语句中，可以添加相关的关键字和操作符
                  ["set", "function", "false", "true", "null", "not", "or", "and", "this"].forEach(keyword => {
                    items.push(keyworldToItem(keyword));
                  });
                  const keys = keyGetter(document.getText(new vscode.Range(position.line, 0, position.line, position.character)));
                  // 添加相关的全局变量和函数
                  // set name = init
                  // 判断是不是  set到= 之间, 如果没有=，则视为name，如有有=，则判断是不是在set跟=之间，否者视为init
                  const text = document.lineAt(position.line).text;
                  const setIndex = text.indexOf("set");
                  const equalIndex = text.indexOf("=");
                  if (equalIndex != -1) {
                    if (setIndex != -1) {
                      if ((position.character > setIndex && position.character <= equalIndex)) {
                        if (keys.length <= 1) {
                          // 非constant 的 global_avarible
                          GlobalContext.get_global_variables().forEach(globalVariable => {
                            if (!globalVariable.is_constant) {
                              items.push(globalVariableToItem(globalVariable));
                            }
                          });
                        }
                      } else if (position.character > equalIndex) {
                        if (setNode.name) {
                          const setNames = setNode.name.names;
                          if (setNames.length == 1) {
                            const t = setNode.name.names[0];
                            let setName: string = "";
                            if (t instanceof Id && t.expr) {
                              setName =t.expr.getText();
                              // 确认类型
                              vjassDocument.acceptLocalFromNode(methodNode, (localNode) => {
                                if (localNode.name && localNode.type && localNode.name.getText() == setName) {
                                  let setType = localNode.type.getText();
                                  GlobalContext.get_global_variables_by_type(setType).forEach(globalVariable => {
                                    items.push(globalVariableToItem(globalVariable));
                                  });
                                }
                              });
                              methodNode.takes?.forEach(take => {
                                if (take.name && take.type) {
                                  let takeType = take.type.getText();
                                  GlobalContext.get_global_variables_by_type(takeType).forEach(globalVariable => {
                                    items.push(globalVariableToItem(globalVariable));
                                  });
                                }
                              });
                            } else if (t instanceof Caller && t.name && t.name.expr) {
                              setName = t.name.expr.getText();
                            } else if (t instanceof IdIndex && t.name && t.name.expr) {
                              setName = t.name.expr.getText();
                            }

                          }
                        }
                      }
                    }
                  } else { // name
                    if (keys.length <= 1) {
                      // 非constant 的 global_avarible
                      GlobalContext.get_global_variables().forEach(globalVariable => {
                        if (!globalVariable.is_constant) {
                          items.push(globalVariableToItem(globalVariable));
                        }
                      });
                    }
                  }
                }
              });
            }
          });
        }
      });
      return items;
    }
  }
}

// import { AllKeywords, Keywords } from "../jass/keyword";
// import { Options } from "./options";
// import { compare, isJFile,isZincFile,isLuaFile, isAiFile } from "../tool";
// import { convertPosition} from "./tool";
// import data, { DataGetter } from "./data";
// import { Global, Local, Library, Take, Func, Native, Struct, Method, Member, Declaration, Program, Type, GlobalObject, Interface } from "../jass/ast";
// import { Token, tokenize } from "../jass/tokens";
// import { getKeywordDescription } from "./keyword-desc";
// import { Document, lexically } from "../check/mark";
// import { ConfigPovider, PluginDefaultConfig } from "./config/config";
// import { GlobalContext } from "../jass/parser-vjass";



// /* 
// const typeItems: vscode.CompletionItem[] = [];
// StatementTypes.forEach(type => {
//   const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
//   item.detail = type;
//   item.documentation = getTypeDesc(type);
//   typeItems.push(item);
// });
// */


// const keywordItems: vscode.CompletionItem[] = [];
// (Options.isOnlyJass ? Keywords : AllKeywords).forEach(keyword => {
//   const item = completionItem(keyword, {
//     documentation: getKeywordDescription(keyword),
//     kind: vscode.CompletionItemKind.Keyword,
//     orderString: "!"
//   });
//   keywordItems.push(item);
// });


// type CompletionItemOption = {
//   kind?: vscode.CompletionItemKind,
//   detial?: string,
//   documentation?: string[]|string,
//   code?: string,
//   source?: string,
//   orderString?: string,
//   deprecated?: boolean,
//   filterText?: string,
//   insertText?: string,
//   additionalTextEdits?: vscode.TextEdit[],
// };

// function completionItem(label: string, option: CompletionItemOption = {
//   kind: undefined,
//   detial: undefined,
//   documentation: undefined,
//   code: undefined,
//   source: undefined,
//   orderString: undefined,
//   filterText: undefined,
//   insertText: undefined,
// }) {
//   const item = new vscode.CompletionItem(label, option.kind);
//   item.detail = option.detial ?? label;
//   const ms = new vscode.MarkdownString();
//   if (option.source) {
//     ms.appendMarkdown(`(***${option.source}***)`);
//   }
//   if (option.documentation) {
//     if (option.source) {
//       ms.appendText("\n");
//     }
//     if (Array.isArray(option.documentation)) {
//       option.documentation.forEach((documentation, index) => {
//         if (index != 0) {
//           ms.appendText("\n");
//         }
//         ms.appendMarkdown(documentation);
//       });
//     } else {
//       ms.appendMarkdown(option.documentation);
//     }
//   }
//   if (option.code) {
//     ms.appendCodeblock(`${option.code}`);
//   }
//   if (option.deprecated) {
//     item.tags = [vscode.CompletionItemTag.Deprecated];
//   }
//   item.documentation = ms;
//   item.sortText = option.orderString;
//   if (option.filterText) {
//     item.filterText = option.filterText;
//   }
//   if (option.insertText) {
//     item.insertText = option.insertText;
//   }
//   if (option.additionalTextEdits) {
//     item.additionalTextEdits = option.additionalTextEdits;
//   }

//   return item;
// }

// function item(label: string, kind: vscode.CompletionItemKind, documentation?: string, code?: string) {
//   const item = new vscode.CompletionItem(label, kind);
//   item.documentation = new vscode.MarkdownString().appendMarkdown(documentation ?? "").appendCodeblock(code ?? "");
//   return item;
// }

// const NothingItem = item("nothing", vscode.CompletionItemKind.Keyword);
// const TakesKeywordItem = item("takes", vscode.CompletionItemKind.Keyword);
// const ArrayKeywordItem = item("array", vscode.CompletionItemKind.Keyword);
// const ReturnsKeywordItem = item("returns", vscode.CompletionItemKind.Keyword);
// const NullKeywordItem = item("null", vscode.CompletionItemKind.Keyword);

// function libraryToCompletionItem(library: Library, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(library.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Field,
//     source: option?.source ?? library.source,
//     code: option?.code ?? library.origin,
//     documentation: option?.documentation ?? library.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial ?? library.name,
//     deprecated: library.hasDeprecated()
//   });
// }

// function funcToCompletionItem(func: Func|Native, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(Options.enableInfoStyle ? formatLabel(func) : func.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Function,
//     source: option?.source ?? func.source,
//     code: option?.code ?? func.origin,
//     documentation: option?.documentation ?? (() => {
//       const contents = func.getContents();
//       func.getParams().forEach((param) => {
//         if (func.takes.findIndex((take) => take.name == param.id) != -1) {
//           contents.push(`***@param*** **${param.id}** *${param.descript}*`);
//         }
//       });

//       return contents;
//     })(),
//     orderString: option?.orderString,
//     detial: option?.detial,
//     deprecated: func.hasDeprecated(),
//     filterText: func.name,
//     insertText: Options.enableInfoStyle ? formatInsertText(func) : func.name,
//   });
// }

// function formatLabel(func:Func|Native|Method):string {
//   return `${func.name}(${func.takes.map(take => take.type).join(", ")})`
// }
// function formatInsertText(func:Func|Native|Method):string {
//   return `${func.name}(${func.takes.map(take => take.name).join(", ")})`
// }

// function methodToCompletionItem(func: Method, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(Options.enableInfoStyle ? formatLabel(func) : func.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Method,
//     source: option?.source ?? func.source,
//     code: option?.code ?? func.origin,
//     documentation: option?.documentation ?? (() => {
//       const contents = func.getContents();
//       func.getParams().forEach((param) => {
//         if (func.takes.findIndex((take) => take.name == param.id) != -1) {
//           contents.push(`***@param*** **${param.id}** *${param.descript}*`);
//         }
//       });

//       return contents;
//     })(),
//     orderString: option?.orderString,
//     detial: option?.detial,
//     deprecated: func.hasDeprecated(),
//     filterText: func.name,
//     insertText: Options.enableInfoStyle ? formatInsertText(func) : func.name,
//   });
// }

// function memberToCompletionItem(member: Member, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(member.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.EnumMember,
//     source: option?.source ?? member.source,
//     code: option?.code ?? member.origin,
//     documentation: option?.documentation ?? member.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial,
//     deprecated: member.hasDeprecated()
//   });
// }

// function globalToCompletionItem(global: Global, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(global.name, {
//     kind: option?.kind ?? global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable,
//     source: option?.source ?? global.source,
//     code: option?.code ?? global.origin,
//     documentation: option?.documentation ?? global.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial,
//     deprecated: global.hasDeprecated()
//   });
// }

// function localToCompletionItem(local: Local, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(local.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Variable,
//     source: option?.source ?? local.source,
//     code: option?.code ?? local.origin,
//     documentation: option?.documentation ?? local.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial,
//     deprecated: local.hasDeprecated()
//   });
// }

// function takeToCompletionItem(take: Take, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(take.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Property,
//     source: option?.source,
//     code: option?.code ?? take.origin,
//     documentation: option?.documentation,
//     orderString: option?.orderString,
//     detial: option?.detial
//   });
// }

// function structToCompletionItem(struct: Struct, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(struct.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Class,
//     source: option?.source ?? struct.source,
//     code: option?.code ?? struct.origin,
//     documentation: option?.documentation ?? struct.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial ?? struct.name,
//     deprecated: struct.hasDeprecated()
//   });
// }
// function interfaceToCompletionItem(struct: Interface, option?: CompletionItemOption) :vscode.CompletionItem {
//   return completionItem(struct.name, {
//     kind: option?.kind ?? vscode.CompletionItemKind.Interface,
//     source: option?.source ?? struct.source,
//     code: option?.code ?? struct.origin,
//     documentation: option?.documentation ?? struct.getContents(),
//     orderString: option?.orderString,
//     detial: option?.detial ?? struct.name,
//     deprecated: struct.hasDeprecated()
//   });
// }

// function toItems<T extends Declaration>(handle: (decl: T, option?: CompletionItemOption) => vscode.CompletionItem, option?: CompletionItemOption, ...datas: T[]):vscode.CompletionItem[] {
//   return datas.map(x => handle(x, option));
// }

// function getItems(program: Program, filePath: string, isCurrent: boolean = false, position: vscode.Position| null = null):Array<vscode.CompletionItem> {
//   const items = new Array<vscode.CompletionItem>();

//   if (!Options.isOnlyJass) {
//     items.push(...toItems<Library>(libraryToCompletionItem, undefined, ...program.allLibrarys(isCurrent)));
//     items.push(...toItems<Struct>(structToCompletionItem, undefined, ...program.allStructs(isCurrent)));
//     items.push(...toItems<Interface>(interfaceToCompletionItem, undefined, ...program.allInterfaces(isCurrent)));
//     items.push(...toItems<Method>(methodToCompletionItem, undefined, ...program.allMethods(isCurrent)));
//     items.push(...toItems<Member>(memberToCompletionItem, undefined, ...program.allMembers(isCurrent)));
    
//   }
//   items.push(...toItems<Global>(globalToCompletionItem, undefined, ...program.allGlobals(isCurrent)));
//   items.push(...toItems(funcToCompletionItem, undefined, ...program.allFunctions(isCurrent)));
//   items.push(...toItems(funcToCompletionItem, undefined, ...program.allNatives(isCurrent)));
//   // types
//   items.push(...program.types.map(type => {
//     return completionItem(type.name, {
//       detial: type.name,
//       documentation: type.getContents(),
//       source: program.source,
//       kind: vscode.CompletionItemKind.Class,
//       deprecated: type.hasDeprecated(),
//       orderString: "-",
//       code: type.origin
//     })
//   }));


//   if (isCurrent && position) {
//     const findedFunc = program.getPositionFunction(convertPosition(position));
//     if (findedFunc) {
//       findedFunc.takes.forEach((take, index) => {
//         items.push(takeToCompletionItem(take, {
//           documentation: findedFunc.getParams().map((param) => {
//             if (param.id == take.name) {
//               return `*${param.descript}*`;
//             }
//             return `*${param.descript}*`;
//           }),
//           // 尽可能让参数在最前
//           orderString: `_${index}`
//         }))
//       });

//       items.push(...toItems<Local>(localToCompletionItem, undefined, ...findedFunc.locals));
//     }
    
//     const findedMethod = program.getPositionMethod(convertPosition(position));
//     if (findedMethod) {
//       findedMethod.takes.forEach((take, index) => {
//         items.push(takeToCompletionItem(take, {
//           source: filePath,
//           documentation: findedMethod.getParams().map((param) => {
//             if (param.id == take.name) {
//               return `*${param.descript}*`;
//             }
//             return `*${param.descript}*`;
//           }),
//           // 尽可能让参数在最前
//           orderString: `_${index}`
//         }))
//       });

//       items.push(...toItems<Local>(localToCompletionItem, undefined, ...findedMethod.locals));
//     }


//     // if (!Options.isOnlyJass) {
//     //   const findedStruct = program.getPositionStruct(convertPosition(position));
//     //   if (findedStruct) {
//     //     items.push(...toItems<Method>(methodToCompletionItem, undefined, ...findedStruct.methods));
//     //     items.push(...toItems<Member>(memberToCompletionItem, undefined, ...findedStruct.members));
//     //   }
//     // }
//   }

//   return items;
// }

// vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     const items = new Array<vscode.CompletionItem>();

//     const fsPath = document.uri.fsPath;

//     items.push(...keywordItems);

//     // define 提示
//     GlobalObject.DEFINES.forEach(define => {
      
//       items.push(completionItem(define.id.name, {
//         code: define.origin,
//         source: define.getContext().filePath,
//         kind: vscode.CompletionItemKind.Module
//       }));
//     });


//     new DataGetter().forEach((program, filePath) => {
//       items.push(...getItems(program, filePath, compare(fsPath, filePath), position))
//     }, !Options.isOnlyJass && Options.supportZinc);

//     if (!Options.isOnlyJass) {
//       items.push(completionItem("SCOPE_PREFIX", {
//         kind: vscode.CompletionItemKind.Issue
//       }));
//       items.push(completionItem("SCOPE_PRIVATE", {
//         kind: vscode.CompletionItemKind.Issue
//       }));
//     }

//     return items;
//   }
// });

// type GcFunc = (name: string) => string;

// class Gc {
//   public type: string;
//   public gc: GcFunc;

//   constructor(type: string, gc: GcFunc) {
//     this.type = type;
//     this.gc = gc;
//   }
// }

// const RecoverableTypes: Gc[] = [
//   new Gc("boolexpr", (name) => {
//     return `call DestroyBoolExpr(${name})\nset ${name} = null`;
//   }),
//   new Gc("commandbuttoneffect", (name) => {
//     return `call DestroyCommandButtonEffect(${name})\nset ${name} = null`;
//   }),
//   new Gc("condition", (name) => {
//     return `call DestroyCondition(${name})\nset ${name} = null`;
//   }),
//   new Gc("effect", (name) => {
//     return `call DestroyEffect(${name})\nset ${name} = null`;
//   }),
//   new Gc("force", (name) => {
//     return `call DestroyForce(${name})\nset ${name} = null`;
//   }),
//   new Gc("group", (name) => {
//     return `call DestroyGroup(${name})\nset ${name} = null`;
//   }),
//   new Gc("image", (name) => {
//     return `call DestroyImage(${name})\nset ${name} = null`;
//   }),
//   new Gc("itempool", (name) => {
//     return `call DestroyItemPool(${name})\nset ${name} = null`;
//   }),
//   new Gc("leaderboard", (name) => {
//     return `call DestroyLeaderboard(${name})\nset ${name} = null`;
//   }),
//   new Gc("lightning", (name) => {
//     return `call DestroyLightning(${name})\nset ${name} = null`;
//   }),
//   new Gc("quest", (name) => {
//     return `call DestroyQuest(${name})\nset ${name} = null`;
//   }),
//   new Gc("timer", (name) => {
//     return `call DestroyTimer(${name})\nset ${name} = null`;
//   }),
//   new Gc("trigger", (name) => {
//     return `call DestroyTrigger(${name})\nset ${name} = null`;
//   }),
//   new Gc("ubersplat", (name) => {
//     return `call DestroyUbersplat(${name})\nset ${name} = null`;
//   }),
//   new Gc("unitpool", (name) => {
//     return `call DestroyUnitPool(${name})\nset ${name} = null`;
//   }),
//   new Gc("framehandle", (name) => {
//     return `call BlzDestroyFrame(${name})\nset ${name} = null`;
//   }),
//   new Gc("dialog", (name) => {
//     return `call DialogDestroy(${name})\nset ${name} = null`;
//   }),
//   new Gc("location", (name) => {
//     return `call RemoveLocation(${name})\nset ${name} = null`;
//   }),
//   new Gc("integer", (name) => {
//     return `set ${name} = 0`;
//   }),
//   new Gc("real", (name) => {
//     return `set ${name} = 0.0`;
//   }),
//   new Gc("string", (name) => {
//     return `set ${name} = null`;
//   }),
//   new Gc("multiboard", (name) => {
//     return `call DestroyMultiboard(${name})\nset ${name} = null`;
//   }),
// ];
// const defaultGc = new Gc("", (name) => {
//   return `set ${name} = null`;
// });

// vscode.languages.registerCompletionItemProvider("jass", new class GcCompletionItemProvider implements vscode.CompletionItemProvider {
//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     const items: vscode.CompletionItem[] = [];

//     data.programs().forEach((program) => {
//       if (document.uri.fsPath == program.source) {
//         program.functions.forEach(func => {
//           if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
//             const item = new vscode.CompletionItem("gc", vscode.CompletionItemKind.Unit);
//             const localGcString = func.locals.map(local => {
//               const gc = RecoverableTypes.find((gc) => gc.type == local.type);
//               return gc ? gc.gc(local.name) : defaultGc.gc(local.name);
//             }).join("\n");
//             const takesGcString = func.takes.map(take => {
//               const gc = RecoverableTypes.find((gc) => gc.type == take.type);
//               return gc ? gc.gc(take.name) : defaultGc.gc(take.name);
//             }).join("\n");
//             item.documentation = new vscode.MarkdownString().appendText("自动排泄\n").appendCodeblock(`function auto_gc take nothing returns nothing\n\tlocal unit u = null\n\t// gc automatic excretion is output at the end of the function\n\tgc\nendfunction`);
//             item.insertText = `${localGcString}\n${takesGcString}`;
//             items.push(item);
//           }
//         });
//       }
//     });
//     return items;
//   }
// }());

// const CjassDateCompletionItem = completionItem("DATE", {
//   kind: vscode.CompletionItemKind.Unit,
//   documentation: "returns current date in yyyy.mm.dd format.",
// });
// CjassDateCompletionItem.tags = [vscode.CompletionItemTag.Deprecated];

// /**
//  * cjass
//  */
// vscode.languages.registerCompletionItemProvider("jass", new class CompletionItemProvider implements vscode.CompletionItemProvider {

//   /**
//    * cjass默认的宏
//    */
//   private cjassGlobalDefineMacroItems: vscode.CompletionItem[] = [];

//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     const text = document.lineAt(position.line).text;
//     if (/^\s*\/\//.test(text)) return;
//     const items: vscode.CompletionItem[] = [];

//     const lineText = document.lineAt(position.line);
//     const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);
//     if (Options.isSupportCjass) {
//       data.cjassDefineMacros().forEach((defineMacro) => {
//         const item = completionItem(defineMacro.keys.map(id => id.name).join(" "), {
//           kind: vscode.CompletionItemKind.Unit,
//           code: defineMacro.origin
//         });
//         items.push(item);
//       });
//       data.cjassFunctions().forEach((func) => {
//         const item = funcToCompletionItem(func);
//         items.push(item);
//       });

//       if (this.cjassGlobalDefineMacroItems.length == 0) {
//         this.cjassGlobalDefineMacroItems.push(...[CjassDateCompletionItem,completionItem("TIME", {
//           kind: vscode.CompletionItemKind.Unit,
//           documentation: "returns current time in hh:mm:ss format.",
//         }),completionItem("COUNTER", {
//           kind: vscode.CompletionItemKind.Unit,
//           documentation: "returns integer starting from 0, every use increases this number by 1. Here’s an example of usage",
//           code: ["void unique_name () {}   // void func_0 () {}",
//           "void unique_name () {}   // void func_1 () {}",
//           "void unique_name () {}   // void func_2 () {}"].join("\n"),
//         }),completionItem("DEBUG", {
//           kind: vscode.CompletionItemKind.Unit,
//           documentation: "returns 1 if \"Debug mode\" checkbox is checked, else returns 0. Is used in conditional compilation (see 4.1) to add sets of actions, which exist only in debug mode.",
//         }),completionItem("FUNCNAME", {
//           kind: vscode.CompletionItemKind.Unit,
//           documentation: "returns the name of the function, where it’s used.",
//         }),completionItem("WAR3VER", {
//           kind: vscode.CompletionItemKind.Unit,
//           documentation: "returns WAR3VER_23 or WAR3VER_24 depending on the position of the version switch in cJass menu. Can be used in conditional compilation blocks (see 4.1) to maintain two map versions: 1.23- and 1.24+ compatible.",
//         })]);
//       }
//       items.push(...this.cjassGlobalDefineMacroItems);
//     }
    

//     return items;
//   }
// }());

/**
 * 文件路径提示
 */
//  vscode.languages.registerCompletionItemProvider("jass", new class CompletionItemProvider implements vscode.CompletionItemProvider {

//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     const items:vscode.CompletionItem[] = [];

//     const lineText = document.lineAt(position);
//     const lineContent = lineText.text;

//     const tokens = tokenize(lineContent);

//     const currentFileDir = () => {
//       return path.parse(document.uri.fsPath).dir;
//     };

    

//     const handlePath = (token:Token) => {
//       if (token) {
//         if (token.isString()) {

//           const strContent = token.value.substring(1, token.value.length - 1);

//           const prefixContent = strContent.substring(0, position.character - token.position - 1);

//           const realPath = path.isAbsolute(prefixContent) ? path.resolve(prefixContent) : path.resolve(currentFileDir(), prefixContent);
//           const stat = fs.statSync(realPath);
//           if (stat.isDirectory()) {
//             const paths = fs.readdirSync(realPath);
//             paths.forEach((p) => {
//               const filePath = path.resolve(realPath, p);
//               if (fs.statSync(filePath).isDirectory()) {
//                 items.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.Folder));
//               } else if (isJFile(filePath) || isZincFile(filePath) || isAiFile(filePath) || isLuaFile(filePath)) {
//                 items.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.File));
//               }
//             });
//           }          
//         }
//       }
//     }

//     if (tokens[0]) {
//       if (tokens[0].isMacro() && tokens[0].value == "#include") {
//         handlePath(tokens[1]);
//       }
//     }

//     return items;
//   }
// }(), "\"", "/", "\\");

/**
 * keyword 提示
 */
//  vscode.languages.registerCompletionItemProvider("jass", new class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {

//   private static keyword_completions:vscode.CompletionItem[] = (() => {
//     return AllKeywords.map(keyword => {
//       const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
//       return item;
//     });
//   })();

//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     return KeywordCompletionItemProvider.keyword_completions;
//   }
// }());







/**
 * 提示魔兽默认的mark code，实现方式暂时性借用check文件中的代码，稳定后把check中的代码整合到jass文件中，随后移除check
 */
// vscode.languages.registerCompletionItemProvider("jass", new class MarkCompletionItemProvider implements vscode.CompletionItemProvider {
//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    
//     const items:vscode.CompletionItem[] = [];
    
//     if (Options.isSupportMark) {

//       const mark = lexically(new Document(document.uri.fsPath, document.lineAt(position.line).text)).find(mark => {
//         return mark.isMark() && mark.loc.start.position <= position.character && mark.loc.end.position >= position.character;
//       });
      

      
//       if (mark) {
//         const markValue = mark.value();
        
//         [...ConfigPovider.instance().getPresets(), ...PluginDefaultConfig.presets ?? []].forEach(preset => {
//          const originCodeValue = `'${preset.code}'`;
//            const item = new vscode.CompletionItem(originCodeValue, vscode.CompletionItemKind.Property);
 
//            const ms = new vscode.MarkdownString()
//            .appendCodeblock(originCodeValue)
//            .appendMarkdown(preset?.descript ?? "")
//            .appendMarkdown("  \n")
//            .appendMarkdown("***@type***(" + (preset.type ? preset.type : "未知") + ")")
//            .appendMarkdown("  \n")
//            .appendMarkdown("***@race***(" + (preset.race ? preset.race : "未知") + ")")
//            .appendMarkdown("  \n")
//            .appendMarkdown("***@kind***(" + (preset.kind ? preset.kind : "未知") + ")");
//            item.detail = preset.name;
//            item.documentation = ms;
 
//            item.filterText = originCodeValue;
//            // console.log(item.filterText);
           
//            item.range = new vscode.Range(position.line, mark.loc.start.position,position.line, mark.loc.end.position);
 
//            items.push(item);
           
//        });

       
//       }


//     }
//     return items;
//   }

// }(), "'");


// /**
//  * config.strings
//  */
// vscode.languages.registerCompletionItemProvider("jass", new class StringCompletionItemProvider implements vscode.CompletionItemProvider {
//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    
//     const items:vscode.CompletionItem[] = [];
    
//     if (Options.isSupportString) {

//       const strToken = lexically(new Document(document.uri.fsPath, document.lineAt(position.line).text)).find(mark => {
//         return mark.isString() && mark.loc.start.position <= position.character && mark.loc.end.position >= position.character;
//       });
      

//       console.log(strToken);
      
//       if (strToken) {
//         const strValue = strToken.value();
        
        

//         [...ConfigPovider.instance().getstrings(), ...(PluginDefaultConfig.strings ?? [])].forEach(str => {
//           let item: vscode.CompletionItem;
//           if (typeof(str) == "string") {
//             item = new vscode.CompletionItem(`"${str}"`, vscode.CompletionItemKind.Value);
//             item.detail = `"${str}"`;
//             const ms = new vscode.MarkdownString()
//             .appendCodeblock(`"${str}"`);
//             item.documentation = ms;
//           } else {
//             item = new vscode.CompletionItem(`"${str.content}"`, vscode.CompletionItemKind.Value);
//             item.detail = `"${str.content}"`;
//             const ms = new vscode.MarkdownString()
//             .appendCodeblock(`"${str.content}"`)
//             .appendMarkdown(str.descript ?? "");
//             item.documentation = ms;
//           }

//           // item.filterText = str.content;
//           // console.log(item.filterText);
          
//           item.range = new vscode.Range(position.line, strToken.loc.start.position,position.line, strToken.loc.end.position);

//           items.push(item);
           
//        });

       
//       }


//     }
//     return items;
//   }

// }(), "\"");

// /*
// ,
//  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
//  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
//  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
// */


// /**
//  * 提示数字
//  */
// vscode.languages.registerCompletionItemProvider("jass", new class NumberCompletionItemProvider implements vscode.CompletionItemProvider {
//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    
//     const items:vscode.CompletionItem[] = [];
    
//     if (Options.isSupportNumber) {

//       [...ConfigPovider.instance().getNumbers(), ...PluginDefaultConfig.numbers ?? []].forEach(num => {
//         const originCodeValue = `${num.value}`;
//         const item = new vscode.CompletionItem(originCodeValue, vscode.CompletionItemKind.Property);

//         const ms = new vscode.MarkdownString()
//         .appendCodeblock(`integer ${originCodeValue}`)
//         .appendMarkdown(num?.descript ?? "")
//         .appendMarkdown("\n\n~整形常量~");
//         item.detail = `integer ${originCodeValue}`;
//         item.documentation = ms;

//         item.filterText = originCodeValue;

//         items.push(item);
         
//      });

//     // const funcs =  GlobalContext.get(document.uri.fsPath)?.get_function("function_name");
//     // console.log(funcs);
    

//     }
//     return items;
//   }

// }(), "0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
// /**
//  * 提示数字
//  */
// vscode.languages.registerCompletionItemProvider("jass", new class NumberCompletionItemProvider1 implements vscode.CompletionItemProvider {
//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    
//     const items:vscode.CompletionItem[] = [];


//     // const funcs =  GlobalContext.get(document.uri.fsPath)?.get_function("function_name");
//     // console.log(funcs);
    

//     return items;
//   }

// }());


