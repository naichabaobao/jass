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
import { Program } from "./jass-parse";
import { Options } from "./options";
import { parse, parseZincBlock } from "../zinc/parse";




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
  item.documentation = new vscode.MarkdownString().appendText(type.text).appendCodeblock(type.origin);
  return item;
});
const globalItems = globals.map(global => {
  const item = new vscode.CompletionItem(global.name, global.constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
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

vscode.languages.registerCompletionItemProvider("jass", new class JassComplation implements vscode.CompletionItemProvider {

  private zincItems = (document: vscode.TextDocument, position: vscode.Position) => {
    const items = new Array<vscode.CompletionItem> ();
    const ast = parseZincBlock(document.getText());

    ast.librarys.forEach(library => {
      const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
      item.detail = library.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(library.origin);
      items.push(item);

      library.globals.forEach(global => {
        const globalItem = new vscode.CompletionItem(global.name, global.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
        globalItem.detail = global.name;
        globalItem.documentation = new vscode.MarkdownString().appendCodeblock(global.origin);
        items.push(globalItem);
      });

      library.functions.forEach(func => {
        const funcItem = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
        funcItem.detail = func.name;
        funcItem.documentation = new vscode.MarkdownString().appendCodeblock(func.origin);
        items.push(funcItem);
      });

      library.structs.forEach(struct => {
        const structItem = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
        structItem.detail = struct.name;
        structItem.documentation = new vscode.MarkdownString().appendCodeblock(struct.origin);
        console.log(struct)
        if (new vscode.Range(new vscode.Position(struct.loc.start.line, struct.loc.start.position),new vscode.Position(struct.loc.end.line, struct.loc.end.position)).contains(position)) {

          struct.members.forEach(member => {
            const memberItem = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
            memberItem.detail = member.name;
            memberItem.documentation = new vscode.MarkdownString().appendCodeblock(member.origin);
            items.push(memberItem);
          });

          struct.methods.forEach(method => {
            const methodItem = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
            methodItem.detail = method.name;
            methodItem.documentation = new vscode.MarkdownString().appendCodeblock(method.origin);
            items.push(methodItem);

            if (new vscode.Range(new vscode.Position(method.loc.start.line, method.loc.start.position),new vscode.Position(method.loc.end.line, method.loc.end.position)).contains(position)) {
              method.takes.forEach(take => {
                const takeItem = new vscode.CompletionItem(take.name, vscode.CompletionItemKind.Variable);
                takeItem.detail = take.name;
                takeItem.documentation = new vscode.MarkdownString().appendCodeblock(take.origin);
                items.push(takeItem);
              });
            }

          });
        }

      });



    });
    
    return items;
  };

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
      item.documentation = new vscode.MarkdownString().appendText(type.text).appendCodeblock(type.origin);
      return item;
    });
    const currentGlobalItems = currentProgram.allGlobals.map(global => {
      const item = new vscode.CompletionItem(global.name, global.constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = global.name;
      item.documentation = new vscode.MarkdownString().appendText(global.text).appendCodeblock(global.origin);
      return item;
    });
    const currentFunctionItems = currentProgram.allFunctions.map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendText(func.text).appendCodeblock(func.origin);
      return item;
    });
    const currentStructItems = currentProgram.allStructs.map(struct => {
      const item = new vscode.CompletionItem(struct.name, vscode.CompletionItemKind.Struct);
      item.detail = struct.name;
      item.documentation = new vscode.MarkdownString().appendText(struct.text).appendCodeblock(struct.origin);
      return item;
    });
    const currentStructMethodItems = currentProgram.allStructs.map(struct => {
      return struct.methods.map(method => {
        const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
        item.detail = `${struct.name}.${method.name}`;
        item.documentation = new vscode.MarkdownString().appendText(method.text).appendCodeblock(method.origin);
        return item;
      });
    }).flat();
    const currentLibraryItems = currentProgram.librarys.map(library => {
      const item = new vscode.CompletionItem(library.name, vscode.CompletionItemKind.Module);
      item.detail = library.name;
      item.documentation = new vscode.MarkdownString().appendCodeblock(library.origin);
      return item;
    });
    const currentZincFunctionItems =
    true ? 
     this.zincItems(document, position) 
    : currentProgram.zincFunctions.map(func => {
      const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
      item.detail = func.name;
      item.documentation = new vscode.MarkdownString().appendText(func.text).appendCodeblock(`function ${func.name}(${func.takes.length == 0 ? "nothing" : func.takes.map(take => take.origin).join(" ,")}) -> ${func.returns ?? "nothing"} {}`);
      return item;
    });
    
    items.push(...currentArrayTypeItems);
    items.push(...currentGlobalItems);
    items.push(...currentFunctionItems);
    items.push(...currentStructItems);
    items.push(...currentStructMethodItems);
    items.push(...currentLibraryItems);
    
    // 就算关闭了还是解析，只是不提示而已，懒
    if (Options.supportZinc) {
      items.push(...currentZincFunctionItems);
    }

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

