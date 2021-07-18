/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */


import * as vscode from "vscode";

import { StatementTypes, TypeExtends, Types } from "./types";
import { getTypeDesc } from "./type-desc";
import { AllKeywords, Keywords } from "./keyword";
import { blizzardJProgram, commonAiProgram, commonJProgram, dzApiJProgram, findFunctionByName, findFunctionExcludeReturns, findGlobalExcludeReturns, findLocals, findTakes, getGlobalVariables, JassMap, VjassMap, ZincMap } from './data';
import { Options } from "./options";
import * as jassParse from "../jass/parse";
import * as jassAst from "../jass/ast";
import * as zincParse from "../zinc/parse";
import * as zincAst from "../zinc/ast";
import * as vjassParse from "../vjass/parse";
import * as vjassAst from "../vjass/ast";
import { getPathFileName, isAiFile, isZincFile } from "../tool";
import { functionKey } from "./tool";




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
  Args
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
    } else if ((()=>{
      const key = functionKey(document, position);
      return key.isSingle();
    })()) {
      return PositionType.Args;    
    } else if (this.FuncNamingRegExp.test(inputText)) {
        return PositionType.FuncNaming;
    } else if (/^local\b/.test(inputText) && /(?<!=)=(?!=)/.test(inputText) && inputText.indexOf("=") < position.character) {
      return PositionType.Assign;
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

function item(label:string, kind: vscode.CompletionItemKind, documentation?: string, code?: string) {
  const item = new vscode.CompletionItem(label, kind);
  item.documentation = new vscode.MarkdownString().appendMarkdown(documentation ?? "").appendCodeblock(code ?? "");
  return item;
}

const NothingItem = item("nothing", vscode.CompletionItemKind.Keyword);
const TakesKeywordItem = item("takes", vscode.CompletionItemKind.Keyword);
const ArrayKeywordItem = item("array", vscode.CompletionItemKind.Keyword);
const ReturnsKeywordItem = item("returns", vscode.CompletionItemKind.Keyword);
const NullKeywordItem = item("null", vscode.CompletionItemKind.Keyword);

function programFunctionItemByType(program:jassAst.Program, key:string, type:string|null) {
  const items = new Array<vscode.CompletionItem>();
  const natives = program.natives.filter((native) => native.returns == type).map((native) => {
    return item(native.name, vscode.CompletionItemKind.Function, `(${getPathFileName(key)})\n${native.text}`, native.origin);
  });
  const funcs = program.functions.filter((func) => func.returns == type).map((func) => {
    return item(func.name, vscode.CompletionItemKind.Function, `(${getPathFileName(key)})\n${func.text}`, func.origin);
  });
  items.push(...natives, ...funcs);
  return items;
}

function programGlobalItemByType(program:jassAst.Program, key:string, type:string|null) {
  const globals = program.globals.filter((func) => func.type == type).map((global) => {
    return item(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable, `(${getPathFileName(key)})\n${global.text}`, global.origin);
  });
  return globals;
}

/**
 * 找到jassMap中返回类型和type一样的方法和全局变量
 * @param program 
 * @param key 
 * @param type 
 * @returns 
 */
function programItemByType(program:jassAst.Program, key:string, type:string|null) {
  const items = new Array<vscode.CompletionItem>();
  items.push(...programFunctionItemByType(program, key, type), ...programGlobalItemByType(program, key, type));
  return items;
}

function vprogramFunctionItemByType(program:vjassAst.Program, key:string, type:string|null) {
  const funcs = program.librarys.map((library) => library.functions).flat().filter((func) => func.returns == type).map((func) => {
    return item(func.name, vscode.CompletionItemKind.Function, `(${getPathFileName(key)})\n${func.text}`, func.origin);
  });
  return funcs;
}

function vprogramGlobalItemByType(program:vjassAst.Program, key:string, type:string|null) {
  const globals = program.librarys.map((library) => library.globals).flat().filter((func) => func.type == type).map((global) => {
    return item(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable, `(${getPathFileName(key)})\n${global.text}`, global.origin);
  });
  return globals;
}

function vprogramItemByType(program:vjassAst.Program, key:string, type:string|null) {
  const items = new Array<vscode.CompletionItem>();
  items.push(...vprogramFunctionItemByType(program, key, type), ...vprogramGlobalItemByType(program, key, type));
  return items;
}

function getHandleTypes() {
  return Object.keys(TypeExtends).filter(key => {
    const exs = TypeExtends[key];
    return exs.includes("handle");
  })
}

function typeFunctionAndGlobalItemNonContainExtends (type:string|null) {

  if (type === "handle") {
    return [NullKeywordItem];
  }

  const items = new Array<vscode.CompletionItem>();

  const commonJItems = programItemByType(commonJProgram, Options.commonJPath, type);
  const commonAiItems = programItemByType(commonAiProgram, Options.commonAiPath, type);
  const blizzardJItems = programItemByType(blizzardJProgram, Options.blizzardJPath, type);
  const dzApiJItems = programItemByType(dzApiJProgram, Options.dzApiJPath, type);
  items.push(...commonJItems, ...commonAiItems, ...blizzardJItems, ...dzApiJItems);

  JassMap.forEach((program, key) => {
    items.push(...programItemByType(program, key, type));
  });

  VjassMap.forEach((program, key) => {
    items.push(...vprogramItemByType(program, key, type));
  });

  return items;
}

function typeFunctionAndGlobalItems(type:string|null) {
  const items = new Array<vscode.CompletionItem>();

  if (type === "code") {
    type = null;
  }

  items.push(...typeFunctionAndGlobalItemNonContainExtends(type));

  if (type === "integer") {
    items.push(...typeFunctionAndGlobalItemNonContainExtends("real"));
  } else if (type === "real") {
    items.push(...typeFunctionAndGlobalItemNonContainExtends("integer"));
  } else if (type && type === "handle") {
    getHandleTypes().forEach((type) => {
      items.push(...typeFunctionAndGlobalItemNonContainExtends(type));
    });
  } else if (type === "boolean") {
    findFunctionExcludeReturns(null, "code").forEach((func) => {
      items.push(item(func.name, vscode.CompletionItemKind.Function, `${func.text}`, func.origin));
    });
    findGlobalExcludeReturns("code").forEach((global) => {
      items.push(item(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable, `${global.text}`, global.origin));
    });
  } else if (type) {
    TypeExtends[type]?.forEach((extendsName) => {
      items.push(...typeFunctionAndGlobalItemNonContainExtends(extendsName));
    });
  }

  return items;
}

function setGlobalItems () {

  const items = new Array<vscode.CompletionItem>();

  getGlobalVariables().forEach((global) => {
    items.push(item(global.name, vscode.CompletionItemKind.Variable, global.text, global.origin));
  });

  return items;
}

function typeGlobalItems(type:string|null) {
  const items = new Array<vscode.CompletionItem>();

  if (type === "code") {
    return [];
  }

  items.push(...typeFunctionAndGlobalItemNonContainExtends(type));

  if (type === "integer") {
    items.push(...typeFunctionAndGlobalItemNonContainExtends("real"));
  } else if (type === "real") {
    items.push(...typeFunctionAndGlobalItemNonContainExtends("integer"));
  } else if (type && type === "handle") {
    getHandleTypes().forEach((type) => {
      items.push(...typeFunctionAndGlobalItemNonContainExtends(type));
    });
  } else if (type) {
    TypeExtends[type]?.forEach((extendsName) => {
      items.push(...typeFunctionAndGlobalItemNonContainExtends(extendsName));
    });
  }

  return items;
}

/**
 * 获取当前文件的function locals takes item。
 * @param document 
 * @param position 
 * @param type 为null时无视类型
 * @returns 
 */
function typeLocalAndTakeItem(document:vscode.TextDocument, position: vscode.Position, type:string|null) {
  const locals = findLocals(document.uri.fsPath, position.line);
  const takes = findTakes(document.uri.fsPath, position.line);

  const items = new Array<vscode.CompletionItem>();

  if (locals) {
    locals.filter(local => type === null || local.type == type).forEach(local => {
      items.push(item(local.name, vscode.CompletionItemKind.Variable, local.text, local.origin));
    });
  }

  if (takes) {
    takes.filter(take => type === null ||  take.type == type).forEach(take => {
      items.push(item(take.name, vscode.CompletionItemKind.Variable, "", take.origin));
    });
  }

  return items;
}

vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();

    const fsPath = document.uri.fsPath;

    const isZincExt = isZincFile(fsPath);
    if (!isZincExt) {
      // 排除内部库文件
      if (![Options.commonJPath, Options.commonAiPath, Options.blizzardJPath, Options.dzApiJPath].includes(fsPath)) {
        const program = jassParse.parse(document.getText(), {
          needParseLocal: true
        });
        JassMap.set(fsPath, program);
      }
    }

    // 获取当前位置提示类型
    const type = PositionTool.is(document, position);
    switch(type) {
      case PositionType.FuncNaming:
      case PositionType.TakesNaming:
        case PositionType.TakesNaming:
          return null;
      case PositionType.LocalNaming:
        items.push(ArrayKeywordItem);
      case PositionType.Set:
        return [...typeLocalAndTakeItem(document, position, null), ...setGlobalItems()];
      case PositionType.Returns:
        items.push(...typeItems, NothingItem);
        return items;
      case PositionType.LocalType:
      case PositionType.ConstantType:
        items.push(...typeItems);
        return items;
      case PositionType.TakesFirstType:
        items.push(...typeItems, NothingItem, CodeItem);
        return items;
      case PositionType.TakesOtherType:
        items.push(...typeItems, CodeItem);
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
      case PositionType.Assign:
        const lineText = document.lineAt(position.line);
        const inputText = lineText.text.substring(lineText.firstNonWhitespaceCharacterIndex, position.character);
        const result = /local\s+(?<type>[a-zA-Z]+[a-zA-Z0-9_]*)\b/.exec(inputText);
        if (result && result.groups) {
          const type = result.groups["type"];
          return [...typeFunctionAndGlobalItems(type), ...typeLocalAndTakeItem(document, position, type)];
        }
        break;
      case PositionType.Call:
        // 只要nothing类型
        return typeFunctionAndGlobalItems(null);
      case PositionType.Args:
        // 方法参数列表
        const key = functionKey(document, position);
        // type为PositionType.Args时,可以断言key[0]不为null
        const func = findFunctionByName(key.keys[0]);
        if (func && func.takes[key.takeIndex]) {
          const type = func.takes[key.takeIndex].type;
          return [...typeFunctionAndGlobalItems(type), ...typeLocalAndTakeItem(document, position, type)];
        }
        break;
    }



    items.push(...typeItems);
    items.push(...keywordItems);


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