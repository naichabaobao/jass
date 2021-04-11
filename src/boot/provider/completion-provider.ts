/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */
import * as path from "path";

import * as vscode from "vscode";

import { Types } from "./types";
import {getTypeDesc} from "./type-desc";
import { AllKeywords } from "./keyword";
import {commonJProgram, commonAiProgram, blizzardJProgram, dzApiJProgram, includePrograms} from "./data";
import { Program } from "./jass";
import { Options } from "./options";




const typeItems: vscode.CompletionItem[] = [];
Types.forEach(type => {
  const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
  item.detail = type;
  item.documentation = getTypeDesc(type);
  typeItems.push(item);
});

const keywordItems: vscode.CompletionItem[] = [];
AllKeywords.forEach(keyword => {
  const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  keywordItems.push(item);
});

function programToItem(program:Program) {
  const nativeItems = program.natives.filter(native => native.name != "").map(native => {
    const item = new vscode.CompletionItem(native.name, vscode.CompletionItemKind.Function);
    return item;
  });
  const functionItems = program.functions.filter(func => func.name != "").map(func => {
    const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
    return item;
  });
  const globalItems = program.globals.filter(global => global.name != "").map(global => {
    const item = new vscode.CompletionItem(global.name, global.constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
    return item;
  });
  const librarys = program.librarys.filter(library => library.name != "");
  const libraryItems = librarys.map(library => {
    const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
    return item;
  });
  const libraryFunctionItems = librarys.map(library => {
    const functionItems = library.functions.filter(func => func.name != "").map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = `${library.name}_${func.name}`;
      return item;
    });
    return functionItems;
  }).flat();
  const libraryGlobalItems = librarys.map(library => {
    const globalItems = library.globals.filter(global => global.name != "").map(global => {
      const item = new vscode.CompletionItem(global.name, global.constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = `${library.name}_${global.name}`;
      return item;
    });
    return globalItems;
  }).flat();
  return [...nativeItems, ...functionItems, ...globalItems, ...libraryItems, ...libraryFunctionItems, ...libraryGlobalItems];
}

const commonJItems = programToItem(commonJProgram);


vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...typeItems);
    items.push(...keywordItems);
    items.push(...commonJItems);
    items.push(...programToItem(new Program(document.uri.fsPath, document.getText())));
    return items;
  }

});
/*
vscode.languages.registerCompletionItemProvider("lua", new class LuaCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    programs().forEach(x => {
      x.functions().filter(func => func.id).forEach(func => {
        const item = new vscode.CompletionItem(<string>func.id, vscode.CompletionItemKind.Function);
        item.detail = `${<string>func.id} (${path.parse(x.fileName ? x.fileName : "unkown").base})`;
        item.documentation = new vscode.MarkdownString().appendText(x.description(func)).appendCodeblock(func.origin());
        items.push(item);
      });
      x.globals().filter(func => func.id).forEach(global => {
        const item = new vscode.CompletionItem(<string>global.id, global.isConstant() ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        item.detail = `${<string>global.id} (${path.parse(x.fileName ? x.fileName : "unkown").base})`;
        item.documentation = new vscode.MarkdownString().appendText(x.description(global)).appendCodeblock(global.origin());
        items.push(item);
      });
    });
    return items;
  }
} ());
*/
// 
