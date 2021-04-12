/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */
import * as path from "path";

import * as vscode from "vscode";

import { Types } from "./types";
import {getTypeDesc} from "./type-desc";
import { AllKeywords } from "./keyword";
import { types,natives,functions,globals,structs, librarys } from './data';
// import {commonJProgram, commonAiProgram, blizzardJProgram, dzApiJProgram, includePrograms} from "./data";
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

// const commonJItems = programToItem(commonJProgram);

const arrayTypeItems = types.map(type => {
  const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
  item.detail = type.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(type.origin);
  return item;
});
const globalItems = globals.map(global => {
  const item = new vscode.CompletionItem(global.name, global.constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
  item.detail = global.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(global.origin);
  return item;
});
const functionItems = functions.map(func => {
  const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
  item.detail = func.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(func.origin);
  return item;
});
const nativeItems = natives.map(native => {
  const item = new vscode.CompletionItem(native.name, vscode.CompletionItemKind.Function);
  item.detail = native.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(native.origin);
  return item;
});
const structItems = structs.map(struct => {
  const item = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
  item.detail = struct.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(struct.origin);
  return item;
});
const structMethodItems = structs.map(struct => {
  return struct.methods.map(method => {
    const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
    item.detail = `${struct.name}.${method.name}`;
    item.documentation = new vscode.MarkdownString().appendCodeblock(method.origin);
    return item;
  });
}).flat();
const libraryItems = librarys.map(library => {
  const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
  item.detail = library.name;
  item.documentation = new vscode.MarkdownString().appendCodeblock(library.origin);
  return item;
});

vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...typeItems);
    items.push(...keywordItems);
    items.push(...arrayTypeItems);
    items.push(...nativeItems);
    items.push(...functionItems);
    items.push(...globalItems);
    items.push(...structItems);
    items.push(...structMethodItems);
    items.push(...libraryItems);

    const currentProgram = new Program(document.uri.fsPath, document.getText());
    // const exprs = [...currentProgram.types, ...currentProgram.allFunctions, ...currentProgram.allGlobals, ...currentProgram.allStructs];
    const currentArrayTypeItems = currentProgram.types.map(type => {
      const item = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.Class);
      item.detail = type.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(type.origin);
      return item;
    });
    const currentGlobalItems = currentProgram.allGlobals.map(global => {
      const item = new vscode.CompletionItem(global.name, vscode.CompletionItemKind.Class);
      item.detail = global.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(global.origin);
      return item;
    });
    const currentFunctionItems = currentProgram.allFunctions.map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(func.origin);
      return item;
    });
    const currentStructItems = currentProgram.allStructs.map(struct => {
      const item = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
      item.detail = struct.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(struct.origin);
      return item;
    });
    const currentStructMethodItems = currentProgram.allStructs.map(struct => {
      return struct.methods.map(method => {
        const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
        item.detail = `${struct.name}.${method.name}`;
        item.documentation = new vscode.MarkdownString().appendCodeblock(method.origin);
        return item;
      });
    }).flat();
    const currentLibraryItems = currentProgram.librarys.map(library => {
      const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
      item.detail = library.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(library.origin);
      return item;
    });
    const currentZincFunctionItems = currentProgram.zincFunctions.map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(`function ${func.name}(${func.takes.length == 0 ? "nothing" : func.takes.map(take => take.origin).join(" ,")}) -> ${func.returns ?? "nothing"} {}`);
      return item;
    });
    
    items.push(...currentArrayTypeItems);
    items.push(...currentGlobalItems);
    items.push(...currentFunctionItems);
    items.push(...currentStructItems);
    items.push(...currentStructMethodItems);
    items.push(...currentLibraryItems);
    
    items.push(...currentZincFunctionItems);

    return items;
  }

});

vscode.languages.registerCompletionItemProvider("lua", new class LuaCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    items.push(...nativeItems);
    items.push(...functionItems);
    return items;
  }
} ());

