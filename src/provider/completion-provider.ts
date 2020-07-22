/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */
import * as path from "path";

import * as vscode from "vscode";

import { types } from "../jass/types";
import { keywords } from "../jass/keyword";
import { Program, Nothing, Takes, Variable } from "../jass/ast";

import { commonProgram, commonAiProgram, blizzardProgram, dzProgram, includeJPrograms, includeAiPrograms } from "./default";

class ProgramToItemsTool {

  public readonly program: Program;

  constructor(program: Program) {
    this.program = program
  }

  public toFunctionItems() {
    return this.program.functions().map(val => {
      const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
      item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if (explain1) {
        ms.appendText(explain1);
      }
      if (explain2) {
        ms.appendCodeblock(explain2);
      }
      ms.appendCodeblock(val.origin());
      item.documentation = ms;
      return item;
    });
  }

  public toNativeItems() {
    return this.program.natives().map(val => {
      const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
      item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if (explain1) {
        ms.appendText(explain1);
      }
      if (explain2) {
        ms.appendCodeblock(explain2);
      }
      ms.appendCodeblock(val.origin());
      item.documentation = ms;
      return item;
    });
  }

  public toVariableItems() {
    return this.program.globalVariables().map(val => {
      const item = new vscode.CompletionItem(val.name, val.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if (explain1) {
        ms.appendText(explain1);
      }
      if (explain2) {
        ms.appendCodeblock(explain2);
      }
      ms.appendCodeblock(val.origin());
      item.documentation = ms;
      return item;
    });
  }

  public toFunctionItemsByType(type: string) {
    return this.program.functions()
      .filter(val => val.returns.returns instanceof Nothing ? type == "nothing" : type == val.returns.returns)
      .map(val => {
        const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
        item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
        const ms = new vscode.MarkdownString();
        const explain1 = this.program.findComment(val.start.line - 1);
        const explain2 = this.program.findComment(val.start.line);
        if (explain1) {
          ms.appendText(explain1);
        }
        if (explain2) {
          ms.appendCodeblock(explain2);
        }
        ms.appendCodeblock(val.origin());
        item.documentation = ms;
        return item;
      });
  }

  public toNativeItemsByType(type: string) {
    return this.program.natives()
      .filter(val => val.returns.returns instanceof Nothing ? type == "nothing" : type == val.returns.returns)
      .map(val => {
        const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
        item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
        const ms = new vscode.MarkdownString();
        const explain1 = this.program.findComment(val.start.line - 1);
        const explain2 = this.program.findComment(val.start.line);
        if (explain1) {
          ms.appendText(explain1);
        }
        if (explain2) {
          ms.appendCodeblock(explain2);
        }
        ms.appendCodeblock(val.origin());
        item.documentation = ms;
        return item;
      });
  }

  public toVariableItemsByType(type: string) {
    return this.program.globalVariables()
      .filter(val => val.type == type)
      .map(val => {
        const item = new vscode.CompletionItem(val.name, val.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
        const ms = new vscode.MarkdownString();
        const explain1 = this.program.findComment(val.start.line - 1);
        const explain2 = this.program.findComment(val.start.line);
        if (explain1) {
          ms.appendText(explain1);
        }
        if (explain2) {
          ms.appendCodeblock(explain2);
        }
        ms.appendCodeblock(val.origin());
        item.documentation = ms;
        return item;
      });
  }

}

let typeItems: vscode.CompletionItem[] = null as any;
function initTypeItems(version?: "1.32" | "1.31" | "1.30" | "1.29" | "1.24" | "1.20" | null | undefined) {
  typeItems = types(version).map(val => {
    const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.Class);
    return item;
  });
}
initTypeItems();

let keywordItems: vscode.CompletionItem[] = null as any;
function initKeywordItems() {
  keywordItems = keywords().map(val => {
    const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.Keyword);
    return item;
  });
}
initKeywordItems();

let commonJFunctionItems: vscode.CompletionItem[] = null as any;
let blizzardJFunctionItems: vscode.CompletionItem[] = null as any;
let commonAiFunctionItems: vscode.CompletionItem[] = null as any;
let dzJFunctionItems: vscode.CompletionItem[] = null as any;
let includesJFunctionItems: vscode.CompletionItem[] = null as any;
let includesAiFunctionItems: vscode.CompletionItem[] = null as any;

let commonJNativeItems: vscode.CompletionItem[] = null as any;
let blizzardJNativeItems: vscode.CompletionItem[] = null as any;
let commonAiNativeItems: vscode.CompletionItem[] = null as any;
let dzJNativeItems: vscode.CompletionItem[] = null as any;
let includeJNativeItems: vscode.CompletionItem[] = null as any;
let includeAiNativeItems: vscode.CompletionItem[] = null as any;

let commonJVariableItems: vscode.CompletionItem[] = null as any;
let blizzardJVariableItems: vscode.CompletionItem[] = null as any;
let commonAiVariableItems: vscode.CompletionItem[] = null as any;
let dzJVariableItems: vscode.CompletionItem[] = null as any;
let includesJVariableItems: vscode.CompletionItem[] = null as any;
let includesAiVariableItems: vscode.CompletionItem[] = null as any;

const commonProgramTool = new ProgramToItemsTool(commonProgram);
const blizzardProgramTool = new ProgramToItemsTool(blizzardProgram);
const commonAiProgramTool = new ProgramToItemsTool(commonAiProgram);
const dzProgramTool = new ProgramToItemsTool(dzProgram);
const includesJProgramTools = includeJPrograms.map(val => new ProgramToItemsTool(val));
const includesAiProgramTool = includeAiPrograms.map(val => new ProgramToItemsTool(val));

function initCommonJItems() {
  commonJFunctionItems = commonProgramTool.toFunctionItems();
  commonJNativeItems = commonProgramTool.toNativeItems();
  commonJVariableItems = commonProgramTool.toVariableItems();
}
function initBlizzardJItems() {
  blizzardJFunctionItems = blizzardProgramTool.toFunctionItems();
  blizzardJNativeItems = blizzardProgramTool.toNativeItems();
  blizzardJVariableItems = blizzardProgramTool.toVariableItems();
}
function initCommonAiItems() {
  commonAiFunctionItems = commonAiProgramTool.toFunctionItems();
  commonAiNativeItems = commonAiProgramTool.toNativeItems();
  commonAiVariableItems = commonAiProgramTool.toVariableItems();
}
function initDzJItems() {
  dzJFunctionItems = dzProgramTool.toFunctionItems();
  dzJNativeItems = dzProgramTool.toNativeItems();
  dzJVariableItems = dzProgramTool.toVariableItems();
}
function initIncludesJItems() {
  includesJFunctionItems = includesJProgramTools.map((val, index) => {
    return val.toFunctionItems();
  }).flat();
  includeJNativeItems = includesJProgramTools.map((val, index) => {
    return val.toNativeItems();
  }).flat();
  includesJVariableItems = includesJProgramTools.map((val, index) => {
    return val.toVariableItems();
  }).flat();
}
function initIncludesAiItems() {
  includesAiFunctionItems = includesAiProgramTool.map((val, index) => {
    return val.toFunctionItems();
  }).flat();
  includeAiNativeItems = includesAiProgramTool.map((val, index) => {
    return val.toNativeItems();
  }).flat();
  includesAiVariableItems = includesAiProgramTool.map((val, index) => {
    return val.toVariableItems();
  }).flat();
}
initCommonJItems();
initBlizzardJItems();
initCommonAiItems();
initDzJItems();
initIncludesJItems();
initIncludesAiItems();

function isJFile(filePath: string) {
  return path.parse(filePath).ext == ".j";
}

function isAiFile(filePath: string) {
  return path.parse(filePath).ext == ".ai";
}

vscode.workspace.onDidChangeConfiguration(e => {
  if (e.affectsConfiguration("jass.version")) {
    initTypeItems(vscode.workspace.getConfiguration("jass").get("version"));
  }
  if (e.affectsConfiguration("jass.common_j")) {
    initCommonJItems();
  }
  if (e.affectsConfiguration("jass.blizzard")) {
    initBlizzardJItems();
  }
  if (e.affectsConfiguration("jass.common_ai")) {
    initCommonAiItems();
  }
  if (e.affectsConfiguration("jass.dz")) {
    initDzJItems();
  }
  if (e.affectsConfiguration("jass.includes")) {
    initIncludesJItems();
    initIncludesAiItems();
  }
});

const map = new Map<vscode.Uri, Array<vscode.CompletionItem>>();



class CompletionItemProvider implements vscode.CompletionItemProvider {


  private isJFile(filePath: string) {
    return path.parse(filePath).ext == ".j";
  }

  private isAiFile(filePath: string) {
    return path.parse(filePath).ext == ".ai";
  }

  private allFunctions(fileName: string) {
    return this.isJFile(fileName)
      ? [...commonJFunctionItems, ...commonJNativeItems, ...blizzardJFunctionItems, ...blizzardJNativeItems, ...dzJFunctionItems, ...dzJNativeItems, ...includesJFunctionItems, ...includeJNativeItems,
      ...this.currentFunction()]
      : [...commonJFunctionItems, ...commonJNativeItems, ...commonAiFunctionItems, ...commonAiNativeItems, ...dzJFunctionItems, ...dzJNativeItems, ...includesJFunctionItems, ...includeJNativeItems, ...includesAiFunctionItems, ...includeAiNativeItems,
      ...this.currentFunction()];
  }

  private allVariablas(fileName: string) {
    return this.isJFile(fileName)
      ? [...commonJVariableItems, ...blizzardJVariableItems, ...dzJVariableItems, ...includesJVariableItems,
      ...this.currentVariable()]
      : [...commonJVariableItems, ...commonAiVariableItems, ...dzJVariableItems, ...includesJVariableItems, ...includesAiVariableItems,
      ...this.currentVariable()];
  }

  private allFunctionByType(type: string) {

  }

  private program: Program = null as any;
  private tool: ProgramToItemsTool = null as any;

  /**
   * @deprecated
   */
  private functionMap = new Map<string, vscode.CompletionItem>();
  /**
   * @deprecated
   */
  private nativeMap = new Map<string, vscode.CompletionItem>();
  /**
   * @deprecated
   */
  private variableMap = new Map<string, vscode.CompletionItem>();

  private initCurrent(document: vscode.TextDocument) {

    /**
     * @deprecated map方式静态items,但这种实现方式会导致文件在切换时需要大量删除item,不但性能没提升,反倒降低数倍.
     */
    const handle = () => {
      const content = document.getText();
      const start1 = new Date().getTime();
      this.program = new Program().parse(content).setFileName(document.fileName);
      console.log(`Program用时 ${new Date().getTime() - start1} 毫秒`);
      const funcs = this.program.functions();
      const vars = this.program.globalVariables();
      const start2 = new Date().getTime();
      funcs.forEach(val => {
        if (!this.functionMap.has(val.name)) {
          const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
          item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
          const ms = new vscode.MarkdownString();
          const explain1 = this.program.findComment(val.start.line - 1);
          const explain2 = this.program.findComment(val.start.line);
          if (explain1) {
            ms.appendText(explain1);
          }
          if (explain2) {
            ms.appendCodeblock(explain2);
          }
          ms.appendCodeblock(val.origin());
          item.documentation = ms;
          this.functionMap.set(val.name, item);
        }
      });
      const funcNames = funcs.map(val => val.name);
      for (const key of this.functionMap.keys()) {
        // console.log("变量是否删除" + key)
        if (!funcNames.includes(key)) {
          this.functionMap.delete(key);
        }
      }
      console.log(`方法转换为item用时 ${new Date().getTime() - start2} 毫秒`);
      const start3 = new Date().getTime();
      vars.forEach(val => {
        if (!this.functionMap.has(val.name)) {
          const item = new vscode.CompletionItem(val.name, val.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
          item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
          const ms = new vscode.MarkdownString();
          const explain1 = this.program.findComment(val.start.line - 1);
          const explain2 = this.program.findComment(val.start.line);
          if (explain1) {
            ms.appendText(explain1);
          }
          if (explain2) {
            ms.appendCodeblock(explain2);
          }
          ms.appendCodeblock(val.origin());
          item.documentation = ms;
          this.variableMap.set(val.name, item);
        }
      });
      const varNames = vars.map(val => val.name);
      for (const key of this.variableMap.keys()) {
        if (!varNames.includes(key)) {
          this.variableMap.delete(key);
        }
      }
      console.log(`var转换为item用时 ${new Date().getTime() - start3} 毫秒`);
    };
    // handle();

    this.program = new Program().parse(document.getText()).setFileName(document.fileName);
    this.tool = new ProgramToItemsTool(this.program);
  }

  private mapToItems(map: Map<string, vscode.CompletionItem>) {
    const items = new Array<vscode.CompletionItem>();
    map.forEach(val => {
      items.push(val);
    });
    return items;
  }

  private currentFunction() {
    // return this.mapToItems(this.functionMap);
    return this.tool.toFunctionItems();
  }

  private currentVariable() {
    // return this.mapToItems(this.variableMap);
    return this.tool.toVariableItems();
  }

  private currentTake(position: vscode.Position) {
    const func = this.program.functions().find((val, index, functions) => {
      if (val.takes instanceof Nothing) {
        return null;
      }
      const range = new vscode.Range(val.start.line, val.start.column, val.end.line, val.end.column);
      return range.contains(position);
    });
    if (func && func.takes instanceof Takes && func.takes.takes.length > 0) {
      const items = new Array<vscode.CompletionItem>();
      func.takes.takes.forEach(val => {
        const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.TypeParameter);
        item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
        const ms = new vscode.MarkdownString();
        ms.appendCodeblock(val.origin());
        item.documentation = ms;
        items.push(item);
      });
      return items;
    }
    return null;
  }

  private currentLocal(position: vscode.Position) {
    const func = this.program.functions().find((val, index, functions) => {
      if (val.block.length == 0) {
        return null;
      }
      const range = new vscode.Range(val.start.line, val.start.column, val.end.line, val.end.column);
      return range.contains(position);
    });
    if (func) {
      const items = new Array<vscode.CompletionItem>();
      func.block.forEach(val => {
        if (val instanceof Variable) {
          const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Variable);
          item.detail = `${val.name} (${path.parse(this.program.fileName).base})`;
          const ms = new vscode.MarkdownString();
          const explain1 = this.program.findComment(val.start.line - 1);
          const explain2 = this.program.findComment(val.start.line);
          if (explain1) {
            ms.appendText(explain1);
          }
          if (explain2) {
            ms.appendText(explain2);
          }
          ms.appendCodeblock(val.origin());
          item.documentation = ms;
          items.push(item);
        }
      });
      return items;
    }
    return null;
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const start = new Date().getTime();
    const isReturns = document.getWordRangeAtPosition(position, /(?<=\breturns\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isLocal = document.getWordRangeAtPosition(position, /(?<=\blocal\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isConstant = document.getWordRangeAtPosition(position, /(?<=\bconstant\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isTakes = document.getWordRangeAtPosition(position, /(?<=\btakes\s+)[a-zA-Z][a-zA-Z0-9]*/);
    // const is_ = document.getWordRangeAtPosition(position, /(?<=,\s*)[a-zA-Z][a-zA-Z0-9]*/);
    const isSpaceStart = document.getWordRangeAtPosition(position, /^\s*[a-zA-Z][a-zA-Z0-9]*/);
    // const isNaming = document.getWordRangeAtPosition(position, /(?<=\function\s+)[a-z-AZ][a-zA-Z0-9]*/);
    const isReturn = document.getWordRangeAtPosition(position, /(?<=\breturn\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isSet = document.getWordRangeAtPosition(position, /(?<=\bset\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isFunction = document.getWordRangeAtPosition(position, /(?<=\bfunction\s+)[a-zA-Z][a-zA-Z0-9]*/);
    const isType = document.getWordRangeAtPosition(position, new RegExp(`(?<=\\b(${types().join("|")})\\s+)[a-zA-Z][a-zA-Z0-9]*`));
    const isEqual = document.getWordRangeAtPosition(position, /(?<==\s*)[a-zA-Z][a-zA-Z0-9]*/);
    const isCall = document.getWordRangeAtPosition(position, /(?<=\bcall\s+)[a-zA-Z][a-zA-Z0-9]*/);
 
    const items = new Array<vscode.CompletionItem>();
    try {
      if (isReturns || isLocal || isConstant || isTakes) {
        return typeItems;
      }
      else if (isFunction || isType) {
        return null;
      }
      else if (isSet) {
        this.initCurrent(document);
        items.push(...this.allVariablas(document.fileName));
        const takes = this.currentTake(position);
        if (takes) {
          items.push(...takes);
        }
        const locals = this.currentLocal(position);
        if (locals) {
          items.push(...locals);
        }
      }
      else if (isCall) {
        this.initCurrent(document);
        items.push(...this.allFunctions(document.fileName));
      }
      else {
        this.initCurrent(document);
        items.push(...keywordItems, ...typeItems, ...this.allFunctions(document.fileName), ...this.allVariablas(document.fileName));
        items.push(...this.allVariablas(document.fileName));
        const takes = this.currentTake(position);
        if (takes) {
          items.push(...takes);
        }
        const locals = this.currentLocal(position);
        if (locals) {
          items.push(...locals);
        }
      }
    } catch (error) {
      console.log(error);
      return null;
    }
    console.log(`实际用时 ${new Date().getTime() - start} 毫秒.............`)
    return items;
  }

}

vscode.languages.registerCompletionItemProvider("jass", new CompletionItemProvider);

import * as scanner from "../zinc/scanner";
import * as zinc from "../zinc/ast";

function linToItem(library:zinc.LibraryDeclaration) {
  const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Field);
  return item;
}


/**
 * @description zinc提示提供，未稳定，存在有大量bug
 */
class ZincCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    let items:vscode.CompletionItem[]|null = null;
    console.log("zinc")
    console.time("zinc completion");
    try{
      const tokens = scanner.tokens(document.getText());
      const zincFile = zinc.toAst(tokens);
      zincFile.blocks.forEach(block => {
        block.librarys.forEach(library => {
          if (!items) {
            items = [];
          }
          items.push(linToItem(library));
          library.functions.forEach(func => {
            const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
            item.detail = `${func.name} (${document.fileName}) (zinc)`;
            item.documentation = new vscode.MarkdownString().appendCodeblock(func.origin());
            if (!items) {
              items = [];
            }
            items.push(item);
          });
        }); 
      });

      console.log(JSON.stringify(zincFile))
    } catch (error) {
      console.error(error);
    }
    console.timeEnd("zinc completion");
    return items;
  }
  
}
vscode.languages.registerCompletionItemProvider("jass", new ZincCompletionItemProvider);

/*
vscode.workspace.onDidChangeTextDocument(e => {
  e.contentChanges.forEach(val => {
    console.log(val.rangeOffset)
    console.log(val.rangeLength)
    console.log(val.text)

  })
});
*/