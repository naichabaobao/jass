/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */
import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

import {types} from "../jass/types";
import {keywords} from "../jass/keyword";
import {Program, FunctionDeclaration, Takes, Take, Returns,NativeDeclaration, Variable} from "../jass/ast";

import {commonProgram, commonAiProgram, blizzardProgram, dzProgram, includeJPrograms, includeAiPrograms} from "./default";

class ProgramToItemsTool {

  public readonly program:Program;

  constructor(program:Program) {
    this.program = program;
  }

  public toFunctionItems() {
    return this.program.functions().map(val => {
      const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Function);
      item.detail = `${val.name} (${this.program.fileName})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if(explain1) {
        ms.appendText(explain1);
      }
      if(explain2) {
        ms.appendCodeblock(explain2);
      }
      ms.appendCodeblock(val.origin());
      item.documentation = ms;
      return item;
    });
  }

  public toNativeItems() {
    return this.program.natives().map(val => {
      const item = new vscode.CompletionItem(val.name, vscode.CompletionItemKind.Reference);
      item.detail = `${val.name} (${this.program.fileName})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if(explain1) {
        ms.appendText(explain1);
      }
      if(explain2) {
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
      item.detail = `${val.name} (${this.program.fileName})`;
      const ms = new vscode.MarkdownString();
      const explain1 = this.program.findComment(val.start.line - 1);
      const explain2 = this.program.findComment(val.start.line);
      if(explain1) {
        ms.appendText(explain1);
      }
      if(explain2) {
        ms.appendCodeblock(explain2);
      }
      ms.appendCodeblock(val.origin());
      item.documentation = ms;
      return item;
    });
  }

}

let typeItems:vscode.CompletionItem[] = null as any;
function initTypeItems(version?:"1.32" | "1.31" | "1.30" | "1.29" | "1.24" | "1.20" | null | undefined) {
  typeItems = types(version).map(val => {
    const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.Class);
    return item;
  });
}
initTypeItems();

let keywordItems:vscode.CompletionItem[] = null as any;
function initKeywordItems() {
  keywordItems = keywords().map(val => {
    const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.Keyword);
    return item;
  });
}
initKeywordItems();

let commonJFunctionItems:vscode.CompletionItem[] = null as any;
let blizzardJFunctionItems:vscode.CompletionItem[] = null as any;
let commonAiFunctionItems:vscode.CompletionItem[] = null as any;
let dzJFunctionItems:vscode.CompletionItem[] = null as any;
let includesJFunctionItems:vscode.CompletionItem[] = null as any;
let includesAiFunctionItems:vscode.CompletionItem[] = null as any;

let commonJNativeItems:vscode.CompletionItem[] = null as any;
let blizzardJNativeItems:vscode.CompletionItem[] = null as any;
let commonAiNativeItems:vscode.CompletionItem[] = null as any;
let dzJNativeItems:vscode.CompletionItem[] = null as any;
let includeJNativeItems:vscode.CompletionItem[] = null as any;
let includeAiNativeItems:vscode.CompletionItem[] = null as any;

let commonJVariableItems:vscode.CompletionItem[] = null as any;
let blizzardJVariableItems:vscode.CompletionItem[] = null as any;
let commonAiVariableItems:vscode.CompletionItem[] = null as any;
let dzJVariableItems:vscode.CompletionItem[] = null as any;
let includesJVariableItems:vscode.CompletionItem[] = null as any;
let includesAiVariableItems:vscode.CompletionItem[] = null as any;

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

function isJFile(filePath:string) {
  return path.parse(filePath).ext == ".j";
}

function isAiFile(filePath:string) {
  return path.parse(filePath).ext == ".ai";
}

vscode.workspace.onDidChangeConfiguration(e => {
  if(e.affectsConfiguration("jass.version")) {
    initTypeItems(vscode.workspace.getConfiguration("jass").get("version"));
  }
  if(e.affectsConfiguration("jass.common_j")) {
    initCommonJItems();
  }
  if(e.affectsConfiguration("jass.blizzard")) {
    initBlizzardJItems();
  }
  if(e.affectsConfiguration("jass.common_ai")) {
    initCommonAiItems();
  }
  if(e.affectsConfiguration("jass.dz")) {
    initDzJItems();
  }
  if(e.affectsConfiguration("jass.includes")) {
    initIncludesJItems();
    initIncludesAiItems();
  }
});

class CompletionItemProvider implements vscode.CompletionItemProvider{

  private isJFile(filePath:string) {
    return path.parse(filePath).ext == ".j";
  }

  private isAiFile(filePath:string) {
    return path.parse(filePath).ext == ".ai";
  }

  private currentType(document: vscode.TextDocument, position: vscode.Position) {
    
    const line = document.lineAt(position.line);
    if(line.isEmptyOrWhitespace) {
      return "start";
    }else{
      
    }
  }

  private allFunctions(fileName:string) {
    return this.isJFile(fileName) 
    ? [...commonJFunctionItems, ...commonJNativeItems, ...blizzardJFunctionItems, ...blizzardJNativeItems, ...dzJFunctionItems, ...dzJNativeItems, ...includesJFunctionItems, ...includeJNativeItems] 
    : [...commonJFunctionItems, ...commonJNativeItems, ...commonAiFunctionItems, ...commonAiNativeItems, ...dzJFunctionItems, ...dzJNativeItems,  ...includesJFunctionItems, ...includeJNativeItems, ...includesAiFunctionItems, ...includeAiNativeItems];
  }

  private allVariablas(fileName:string) {
    return this.isJFile(fileName) 
    ? [...commonJVariableItems, ...blizzardJVariableItems, ...dzJVariableItems, ...includesJVariableItems] 
    : [...commonJVariableItems, ...commonAiVariableItems, ...dzJVariableItems, ...includesJVariableItems, ...includesAiVariableItems];
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

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
    console.log(document.fileName)
    const items = new Array<vscode.CompletionItem>();
    if(isReturns || isLocal || isConstant || isTakes) {
      return typeItems;
    }
    else if(isFunction || isType) {
      return null;
    }
    else if(isSet) {
      return this.allVariablas(document.fileName);
    }
    else if(isCall){
      this.allFunctions(document.fileName);
    }
    else{
      items.push(...keywordItems, ...typeItems, ...this.allFunctions(document.fileName), ...this.allVariablas(document.fileName));
    }

    return items;
  }
  
}

vscode.languages.registerCompletionItemProvider("jass", new CompletionItemProvider);