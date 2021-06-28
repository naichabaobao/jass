/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */


import * as vscode from "vscode";

import { Types } from "./types";
import { getTypeDesc } from "./type-desc";
import { AllKeywords, Keywords } from "./keyword";
import { blizzardJProgram, commonAiProgram, commonJProgram, dzApiJProgram, JassMap, VjassMap, ZincMap } from './data';
import { Library, Program } from "./jass-parse"; // 准备移除
import { Options } from "./options";
import { Local } from "../vjass/ast";
import { Take } from "../jass/ast";
import * as jassParse from "../jass/parse";
import * as jassAst from "../jass/ast";
import * as zincParse from "../zinc/parse";
import * as zincAst from "../zinc/ast";
import * as vjassParse from "../vjass/parse";
import * as vjassAst from "../vjass/ast";
import { getPathFileName, isAiFile, isZincFile } from "../tool";




const typeItems: vscode.CompletionItem[] = [];
Types.forEach(type => {
  const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
  item.detail = type;
  item.documentation = getTypeDesc(type);
  typeItems.push(item);
});

const keywordItems: vscode.CompletionItem[] = [];
(Options.isOnlyJass ? Keywords : AllKeywords).forEach(keyword => {
  const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  keywordItems.push(item);
});

enum PositionType {
  Unkown,
  Returns,
  Local,
  Array,
  Constant,
  FuncNaming,
  TakesFirstType,
  TakesOtherType,
  TakesNaming,
  Call,
  Set,
  Point
}

/**
 * 判断当前指标位置类型
 */
class PositionTool {
  private static ReturnsRegExp = new RegExp(/\breturns\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static LocalRegExp = new RegExp(/\blocal\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static ConstantRegExp = new RegExp(/\bconstant\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static FuncNamingRegExp = new RegExp(/\bfunction\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakeTypeFirstRegExp = new RegExp(/\btakes\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static TakeTypeOtherRegExp = new RegExp(/,\s*[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static CallRegExp = new RegExp(/\bcall\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static SetRegExp = new RegExp(/\bset\s+[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);
  private static PointRegExp = new RegExp(/\b[a-zA-Z0-9]+[a-zA-Z0-9_]*\s*\.\s*[a-zA-Z0-9]?[a-zA-Z0-9_]*$/);

  public static is(document: vscode.TextDocument, position: vscode.Position): PositionType {
    const lineText = document.lineAt(position.line);
    const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);

    if (this.ReturnsRegExp.test(inputText)) {
      return PositionType.Returns;
    } else if (this.LocalRegExp.test(inputText)) {
      return PositionType.Local;
    } else if (this.ConstantRegExp.test(inputText)) {
      return PositionType.Constant;
    } else if (this.FuncNamingRegExp.test(inputText)) {
      return PositionType.FuncNaming;
    } else if (/\btakes\b/.test(inputText) && this.TakeTypeFirstRegExp.test(inputText)) {
      return PositionType.TakesFirstType;
    } else if (/\btakes\b/.test(inputText) && this.TakeTypeOtherRegExp.test(inputText)) {
      return PositionType.TakesOtherType;
    } else if (this.CallRegExp.test(inputText)) {
      return PositionType.Call;
    } else if (this.SetRegExp.test(inputText)) {
      return PositionType.Set;
    } else if (this.PointRegExp.test(inputText)) {
      return PositionType.Point;
    }

    return PositionType.Unkown;
  }
}

// const commonJItems = programToItem(commonJProgram);

/* vjass 过时
const arrayTypeItems = types.map(type => {
  const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
  item.detail = type.name;
  item.documentation = new vscode.MarkdownString().appendText(type.text).appendCodeblock(type.origin);
  return item;
});
const globalItems = globals.map(global => {
  const item = new vscode.CompletionItem(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
  item.detail = global.name;
  item.documentation = new vscode.MarkdownString().appendText(global.text).appendCodeblock(global.origin);
  return item;
});
const functionItems = functions.map(func => {
  const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
  item.detail = func.name;
  item.documentation = new vscode.MarkdownString().appendText(func.text).appendCodeblock(func.origin);
  return item;
});
const nativeItems = natives.map(native => {
  const item = new vscode.CompletionItem(native.name, vscode.CompletionItemKind.Function);
  item.detail = native.name;
  item.documentation = new vscode.MarkdownString().appendText(native.text).appendCodeblock(native.origin);
  return item;
});
const structItems = structs.map(struct => {
  const item = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
  item.detail = struct.name;
  item.documentation = new vscode.MarkdownString().appendText(struct.text).appendCodeblock(struct.origin);
  return item;
});
const structMethodItems = structs.map(struct => {
  return struct.methods.map(method => {
    const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
    item.detail = `${struct.name}.${method.name}`;
    item.documentation = new vscode.MarkdownString().appendText(method.text).appendCodeblock(method.origin);
    return item;
  });
}).flat();
const libraryItems = librarys.map(library => {
  const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
  item.detail = library.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(library.origin);
  return item;
});
 */


/**
 * 将zinc program 解析成 vscode.Completion[]
 * @param document 
 * @param position 
 * @param key 
 * @param program 
 * @returns 
 */
function zincProgramToItem(document: vscode.TextDocument, position: vscode.Position, key: string, program: zincAst.Program): vscode.CompletionItem[] {
  const items = new Array<vscode.CompletionItem>();
  program.librarys.forEach((library) => {
    const currentFunctionItems = library.functions.map(func => {
      const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${func.text}`).appendCodeblock(func.origin);
      if (document.uri.fsPath == key) {
        if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
          func.locals.forEach(local => {
            const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendText(`\n${local.text}`).appendCodeblock(local.origin);
            item.sortText = "_";
            items.push(item);
          });
          func.takes.forEach(take => {
            const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
            item.sortText = "_";
            items.push(item);
          });
        }
      }
      return item;
    });
    const currentGlobalItems = library.globals.map(global => {
      const item = new vscode.CompletionItem(`${global.name}`, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = global.name;
      item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${global.text}`).appendCodeblock(global.origin);
      return item;
    });
    library.structs.forEach((struct) => {
      const structItem = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
      structItem.detail = struct.name;
      structItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${struct.text}`).appendCodeblock(struct.origin);
      if (new vscode.Range(new vscode.Position(struct.loc.start.line, struct.loc.start.position), new vscode.Position(struct.loc.end.line, struct.loc.end.position)).contains(position)) {

        struct.members.forEach(member => {
          const memberItem = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
          memberItem.detail = member.name;
          memberItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${member.text}`).appendCodeblock(member.origin);
          items.push(memberItem);
        });

        struct.methods.forEach(method => {
          const methodItem = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
          methodItem.detail = method.name;
          methodItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${method.text}`).appendCodeblock(method.origin);
          items.push(methodItem);

          if (new vscode.Range(new vscode.Position(method.loc.start.line, method.loc.start.position), new vscode.Position(method.loc.end.line, method.loc.end.position)).contains(position)) {
            method.takes.forEach(take => {
              const takeItem = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Variable);
              takeItem.detail = take.name;
              takeItem.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
              items.push(takeItem);
            });
          }

        });
        items.push(structItem);
      }
    });
    items.push(...currentGlobalItems);
    items.push(...currentFunctionItems);
  });

  return items;

}

function vjassProgramToItem(document: vscode.TextDocument, position: vscode.Position, key: string, program: vjassAst.Program): vscode.CompletionItem[] {
  const items = new Array<vscode.CompletionItem>();
  program.librarys.forEach((library) => {
    const currentFunctionItems = library.functions.map(func => {
      const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${func.text}`).appendCodeblock(func.origin);
      if (document.uri.fsPath == key) {
        if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
          func.locals.forEach(local => {
            const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendText(`\n${local.text}`).appendCodeblock(local.origin);
            item.sortText = "_";
            items.push(item);
          });
          func.takes.forEach(take => {
            const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
            item.sortText = "_";
            items.push(item);
          });
        }
      }
      return item;
    });
    const currentGlobalItems = library.globals.map(global => {
      const item = new vscode.CompletionItem(`${global.name}`, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = global.name;
      item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${global.text}`).appendCodeblock(global.origin);
      return item;
    });
    library.structs.forEach((struct) => {
      const structItem = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
      structItem.detail = struct.name;
      structItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${struct.text}`).appendCodeblock(struct.origin);
      if (new vscode.Range(new vscode.Position(struct.loc.start.line, struct.loc.start.position), new vscode.Position(struct.loc.end.line, struct.loc.end.position)).contains(position)) {

        struct.members.forEach(member => {
          const memberItem = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
          memberItem.detail = member.name;
          memberItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${member.text}`).appendCodeblock(member.origin);
          items.push(memberItem);
        });

        struct.methods.forEach(method => {
          const methodItem = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
          methodItem.detail = method.name;
          methodItem.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${method.text}`).appendCodeblock(method.origin);
          items.push(methodItem);

          if (new vscode.Range(new vscode.Position(method.loc.start.line, method.loc.start.position), new vscode.Position(method.loc.end.line, method.loc.end.position)).contains(position)) {
            method.takes.forEach(take => {
              const takeItem = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Variable);
              takeItem.detail = take.name;
              takeItem.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
              items.push(takeItem);
            });
          }

        });
        items.push(structItem);
      }
    });
    items.push(...currentGlobalItems);
    items.push(...currentFunctionItems);
  });

  return items;

}

function jassProgramToItem(document: vscode.TextDocument | undefined, position: vscode.Position | undefined, key: string, program: jassAst.Program): vscode.CompletionItem[] {
  const items = new Array<vscode.CompletionItem>();
  const currentNativeItems = program.natives.map(func => {
    const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
    item.detail = func.name;
    item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${func.text}`).appendCodeblock(func.origin);
    return item;
  });
  const currentFunctionItems = program.functions.map(func => {
    const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
    item.detail = func.name;
    item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${func.text}`).appendCodeblock(func.origin);
    if (document && position && document.uri.fsPath == key) {
      if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
        func.locals.forEach(local => {
          const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Property);
          item.documentation = new vscode.MarkdownString().appendText(`\n${local.text}`).appendCodeblock(local.origin);
          item.sortText = "_";
          items.push(item);
        });
        func.takes.forEach(take => {
          const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Property);
          item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
          item.sortText = "_";
          items.push(item);
        });
      }
    }
    return item;
  });
  const currentGlobalItems = program.globals.map(global => {
    const item = new vscode.CompletionItem(`${global.name}`, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
    item.detail = global.name;
    item.documentation = new vscode.MarkdownString().appendText(`(${getPathFileName(key)})\n${global.text}`).appendCodeblock(global.origin);
    return item;
  });
  items.push(...currentGlobalItems);
  items.push(...currentFunctionItems);
  items.push(...currentNativeItems);

  return items;
}

const commonJItems = jassProgramToItem(undefined, undefined, Options.commonJPath, commonJProgram);
const commonAiItems = jassProgramToItem(undefined, undefined, Options.commonAiPath, commonAiProgram);
const blizzardJItems = jassProgramToItem(undefined, undefined, Options.blizzardJPath, blizzardJProgram);
const dzApiJItems = jassProgramToItem(undefined, undefined, Options.dzApiJPath, dzApiJProgram);

vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();

    items.push(...typeItems);
    items.push(...keywordItems);

    const isZincExt = isZincFile(document.uri.fsPath);
    const isAiExt = isAiFile(document.uri.fsPath);

    items.push(...commonJItems);
    if (isAiExt) {
      items.push(...commonAiItems);
    } else {
      items.push(...blizzardJItems);
    }
    items.push(...dzApiJItems);
    // items.push(...nativeItems);
    // items.push(...functionItems);
    // items.push(...globalItems);

    if (!isZincExt) {
      const program = jassParse.parse(document.getText(), {
        needParseLocal: true
      });
      JassMap.set(document.uri.fsPath, program);

      JassMap.forEach((program, key) => {
        const currentFunctionItems = program.functions.map(func => {
          const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
          item.detail = func.name;
          item.documentation = new vscode.MarkdownString().appendText(`${func.text}(${getPathFileName(key)})`).appendCodeblock(func.origin);
          if (document.uri.fsPath == key) {
            if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
              func.locals.forEach(local => {
                const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Property);
                item.documentation = new vscode.MarkdownString().appendText(`\n${local.text}`).appendCodeblock(local.origin);
                item.sortText = "_";
                items.push(item);
              });
              func.takes.forEach(take => {
                const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Property);
                item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
                item.sortText = "_";
                items.push(item);
              });
            }
          }
          return item;
        });
        const currentGlobalItems = program.globals.map(global => {
          const item = new vscode.CompletionItem(`${global.name}`, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
          item.detail = global.name;
          item.documentation = new vscode.MarkdownString().appendText(`${global.text}(${getPathFileName(key)})`).appendCodeblock(global.origin);
          return item;
        });
        items.push(...currentGlobalItems);
        items.push(...currentFunctionItems);
      });
    }

    if (Options.isOnlyJass) {
      /*
      const currentProgram = parse(document.getText(), {
        needParseLocal: true
      });

      const currentFunctionItems = currentProgram.functions.map(func => {
        const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
        item.detail = func.name;
        item.documentation = new vscode.MarkdownString().appendText(func.text).appendCodeblock(func.origin);
        if (new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position).contains(position)) {
          func.locals.forEach(local => {
            const item = new vscode.CompletionItem(local.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendText(`\n${local.text}`).appendCodeblock(local.origin);
            item.sortText = "_";
            items.push(item);
          });
          func.takes.forEach(take => {
            const item = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Property);
            item.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
            item.sortText = "_";
            items.push(item);
          });
        }
        return item;
      });
      const currentGlobalItems = currentProgram.globals.map(global => {
        const item = new vscode.CompletionItem(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        item.detail = global.name;
        item.documentation = new vscode.MarkdownString().appendText(global.text).appendCodeblock(global.origin);
        return item;
      });
      items.push(...currentGlobalItems);
      items.push(...currentFunctionItems);*/
    } else {
      const vjassProgram = vjassParse.parse(document.getText());
      VjassMap.set(document.uri.fsPath, vjassProgram);

      VjassMap.forEach((program, key) => {
        const vjassItems = vjassProgramToItem(document, position, key, program);
        items.push(...vjassItems);
      });
    }

    if (Options.supportZinc) {
      // const currentZincFunctionItems = this.zincItems(document, position);

      // 就算关闭了还是解析，只是不提示而已，懒
      // items.push(...currentZincFunctionItems);

      const zincProgram = zincParse.parse(document.getText(), isZincExt);
      ZincMap.set(document.uri.fsPath, zincProgram);

      ZincMap.forEach((program, key) => {
        const zincItems = zincProgramToItem(document, position, key, program);
        items.push(...zincItems);
      });
    }
    return items;
  }
});

vscode.languages.registerCompletionItemProvider("lua", new class LuaCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...commonJItems);
    // items.push(...commonAiItems);
    items.push(...blizzardJItems);
    items.push(...dzApiJItems);
    /*
    JassMap.forEach((program, key) => {
      const currentFunctionItems = program.functions.map(func => {
        const item = new vscode.CompletionItem(`${func.name}`, vscode.CompletionItemKind.Function);
        item.detail = func.name;
        item.documentation = new vscode.MarkdownString().appendText(`${func.text}(${getPathFileName(key)})`).appendCodeblock(func.origin);
        return item;
      });
      const currentGlobalItems = program.globals.map(global => {
        const item = new vscode.CompletionItem(`${global.name}`, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        item.detail = global.name;
        item.documentation = new vscode.MarkdownString().appendText(`${global.text}(${getPathFileName(key)})`).appendCodeblock(global.origin);
        return item;
      }); 
      items.push(...currentGlobalItems);
      items.push(...currentFunctionItems);
    });
    */
    return items;
  }
}());

type GcFunc = (name:string) => string;

class Gc {
  public type:string;
  public gc:GcFunc;

  constructor(type:string, gc:GcFunc) {
    this.type = type;
    this.gc = gc;
  }
}

const RecoverableTypes:Gc[] = [
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

    JassMap.forEach((program, key) => {
      if (document.uri.fsPath == key) {
        program.functions.reverse().forEach(func => {
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

/* 测试代码
vscode.languages.registerCompletionItemProvider("jass", new class TypeCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items: vscode.CompletionItem[] = [];

    const type = PositionTool.is(document, position);
    console.log(type)

    return items;
  }
}());
 */