/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */
import * as path from "path";

import * as vscode from "vscode";

import { types } from "../main/jass/types";
import { keywords } from "../main/jass/keyword";

import * as jass from "../main/jass/parsing";
import { programs } from "./data-provider";



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

interface CompletionItemOption {
  needFunction?:boolean;
  needGlobal?:boolean;
  needConstant?:boolean;
  needVariable?:boolean;
  needType?:boolean;
  needKeyword?:boolean;
}

interface CurrentCompletionItemOption extends CompletionItemOption{
  needLocal?:boolean;
  needTake?:boolean;
}

class CompletionItemProvider implements vscode.CompletionItemProvider {

  private items(document: vscode.TextDocument, option?:CompletionItemOption) {
    const op = Object.assign(new class CompletionItemOptionImpl implements CompletionItemOption {
      needFunction:boolean = false;
      needGlobal:boolean = false;
      needConstant:boolean = true;
      needVariable:boolean = true;
      needType:boolean = false;
      needKeyword:boolean = false;
    } (), option);
  }

  private functionCompletionItems:vscode.CompletionItem[];
  private globalCompletionItems:vscode.CompletionItem[];

  constructor() {
    this.functionCompletionItems = [];
    this.globalCompletionItems = [];
    programs().forEach(x => {
      x.functions().filter(func => func.id).forEach(func => {
        const item = new vscode.CompletionItem(<string>func.id, vscode.CompletionItemKind.Function);
        item.detail = `${<string>func.id} (${path.parse(x.fileName ? x.fileName : "unkown").base})`;
        item.documentation = new vscode.MarkdownString().appendText(x.description(func)).appendCodeblock(func.origin());
        this.functionCompletionItems.push(item);
      });
      x.globals().filter(func => func.id).forEach(global => {
        const item = new vscode.CompletionItem(<string>global.id, global.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        item.detail = `${<string>global.id} (${path.parse(x.fileName ? x.fileName : "unkown").base})`;
        item.documentation = new vscode.MarkdownString().appendText(x.description(global)).appendCodeblock(global.origin());
        this.globalCompletionItems.push(item);
      });
    });
  }

  private getItems(document: vscode.TextDocument, position: vscode.Position, option?:CurrentCompletionItemOption) {
    const op = Object.assign(new class CompletionItemOptionImpl implements CurrentCompletionItemOption {
      needFunction:boolean = false;
      needGlobal:boolean = false;
      needConstant:boolean = true;
      needVariable:boolean = true;
      needLocal:boolean = true;
      needTake:boolean = true;
      needType:boolean = false;
      needKeyword:boolean = false;
    } (), option);
    const items = new Array<vscode.CompletionItem>();
    if (op.needKeyword) {
      items.push(...keywordItems);
    }
    if (op.needType) {
      items.push(...typeItems);
    }

    if (!(op.needFunction || op.needGlobal)) {
      return items;
    }

    const currentProgam = jass.parse(document.getText());
    if (op.needFunction || op.needLocal || op.needTake) {
      const functions:jass.FunctionDeclarator[] = currentProgam.functionDeclarators();
      if (op.needFunction) {
        functions.forEach(func => {
          if (func.id) {
            const item = new vscode.CompletionItem(func.id, vscode.CompletionItemKind.Function);
            item.detail = `${func.id} (当前文档)`;
            item.documentation = new vscode.MarkdownString().appendText(currentProgam.description(func)).appendCodeblock(func.origin());
            items.push(item);
          }
        });
        items.push(...this.functionCompletionItems);
      }
      if (op.needLocal) {
        const func = functions.find(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position));
        if (func) {
          func.locals().forEach(x => {
            if (x.type && x.id) {
              const item = new vscode.CompletionItem(x.id, vscode.CompletionItemKind.Variable);
              item.detail = `${func.id} (当前文档)`;
              item.documentation = new vscode.MarkdownString().appendText(currentProgam.description(x)).appendCodeblock(x.origin());
              items.push(item);
            }
          });
        }
      }
      if (op.needTake) {
        const func = functions.find(x => x.loc && Number.isInteger(x.loc.startLine) && Number.isInteger(x.loc.startPosition) && Number.isInteger(x.loc.endLine) && Number.isInteger(x.loc.endPosition) && new vscode.Range(<number>x.loc.startLine, <number>x.loc.startPosition, <number>x.loc.endLine, <number>x.loc.endPosition).contains(position));
        if (func) {
          func.takes.forEach(x => {
            const item = new vscode.CompletionItem(x.id, vscode.CompletionItemKind.TypeParameter);
            item.detail = `${x.id} (当前文档)`;
            item.documentation = new vscode.MarkdownString().appendCodeblock(x.origin());
            items.push(item);
          });
        }
      }
    }
    if (op.needGlobal) {
      const globals = <jass.Globals[]>currentProgam.body.filter(x => x instanceof jass.Globals);
      const globalVariables = globals.map(x => x.globals).flat().filter(x => {
        if (op.needConstant && op.needVariable) {
          return true;
        } else if (op.needConstant) {
          return x.isConstant();
        } else if (op.needVariable) {
          return !x.isConstant();
        } else {
          return false;
        }
      });
      globalVariables.forEach(x => {
        if (x.type && x.id) {
          const item = new vscode.CompletionItem(x.id, x.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
          item.detail = `${x.id} (当前文档)`;
          item.documentation = new vscode.MarkdownString().appendText(currentProgam.description(x)).appendCodeblock(x.origin());
          items.push(item);
        }
      });
      this.globalCompletionItems.filter(x => {
        if (op.needConstant && op.needVariable) {
          return true;
        } else if (op.needConstant) {
          return x.kind === vscode.CompletionItemKind.Constant;
        } else if (op.needVariable) {
          return x.kind === vscode.CompletionItemKind.Variable;
        } else {
          return false;
        }
      }).forEach(x => {
        items.push(x);
      });

    }
    return items;
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

    const isReturns = document.getWordRangeAtPosition(position, /((?<=\breturns\s+)[a-zA-Z][a-zA-Z0-9]*)|((?<=->\s*)[a-zA-Z][a-zA-Z0-9]*)/);
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
 
    try {
      if (isReturns || isLocal || isConstant || isTakes) {
        return typeItems;
      }
      else if (isFunction || isType) {
        return null;
      }
      else if (isSet) {
        // this.initCurrent(document);
        return this.getItems(document, position, {
          needTake: true,
          needLocal: true,
          needGlobal: true,
          needConstant: false,
          needVariable: true
        });
        // const takes = this.currentTake(position);
        // if (takes) {
        //   items.push(...takes);
        // }
        // const locals = this.currentLocal(position);
        // if (locals) {
        //   items.push(...locals);
        // }
      }
      else if (isCall) {
        return this.getItems(document, position, {
          needFunction: true
        });
      }
      else {
        // this.initCurrent(document);
        return this.getItems(document, position, {
          needFunction: true,
          needGlobal: true,
          needTake: true,
          needLocal: true,
          needKeyword: true,
          needType: true
        });
        // items.push(...this.allVariablas(document.fileName));
        /*
        const takes = this.currentTake(position);
        if (takes) {
          items.push(...takes);
        }
        const locals = this.currentLocal(position);
        if (locals) {
          items.push(...locals);
        }*/
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}

vscode.languages.registerCompletionItemProvider("jass", new CompletionItemProvider);


