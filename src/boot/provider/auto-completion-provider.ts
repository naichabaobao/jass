import * as vscode from "vscode";
import { GlobalContext, Interface, JassDetail, Module, zinc } from "../jass/parser-vjass";
import { functionToItem, keyworldToItem, nativeToItem, structToItem, typeToItem, globalVariableToItem, interfaceToItem, moduleToItem, textMacroToItem, defineToItem, localToItem, takeToItem, delegateToItem } from "./complation-item-generator";
import { AllKeywords } from "../jass/keyword";
import { Position } from "../jass/loc";

export class AutoCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const items: vscode.CompletionItem[] = [];
        AllKeywords.forEach(keyword => {
            items.push(keyworldToItem(keyword));
        });
        GlobalContext.get_types().forEach(type => {
            items.push(typeToItem(type));
        });
        GlobalContext.get_global_variables().forEach(global => {
            items.push(globalVariableToItem(global));
        });
        GlobalContext.get_natives().forEach(native => {
            items.push(nativeToItem(native));
        });
        GlobalContext.get_functions().forEach(func => {
            items.push(functionToItem(func));
        });
        GlobalContext.get_structs().forEach(struct => {
            items.push(structToItem(struct));
        });
        GlobalContext.get_interfaces().forEach(interface_ => {
            items.push(interfaceToItem(interface_));
        });
        GlobalContext.get_modules().forEach(module => {
            items.push(moduleToItem(module));
        });
        GlobalContext.get_text_macros().forEach(textMacro => {
            items.push(textMacroToItem(textMacro));
        });
        GlobalContext.get_defines().forEach(define => {
            items.push(defineToItem(define));
        });
        GlobalContext.get_delegates().forEach(delegate => {
            items.push(delegateToItem(delegate));
        });
        const doc = GlobalContext.get(document.uri.fsPath);
        if (doc) {
            const pos = new Position(position.line, position.character);
            doc.acceptFunc(func => {
                if (func.contains(pos)) {
                    func.takes?.forEach(take => {
                        if (take.name) {
                            items.push(takeToItem(take));
                        }
                    });
                }
                doc.acceptLocalFromNode(func, local => {
                    if (local.name) {
                        items.push(localToItem(local));
                    }
                });
            });
        }
        return items;
    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        throw new Error("Method not implemented.");
    }
    
}


export class SpecialCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        if (!vscode.workspace.getConfiguration("jass").get<boolean>("literal")) {
            return;
        }
      const items: vscode.CompletionItem[] = [];
  
      GlobalContext.keys.forEach(key => {
        const program = GlobalContext.get(key);
        if (program) {
          if (program.is_special) {
            const value_node = program.program;
            if (value_node) {
              value_node.children.forEach(x => {
  
                if (x instanceof JassDetail) {
                  const item = new vscode.CompletionItem(x.label, vscode.CompletionItemKind.Value);
                  const ms = new vscode.MarkdownString();
                  ms.baseUri = vscode.Uri.file(x.document.filePath);
                  ms.appendCodeblock(x.label);
                  x.description.forEach(desc => {
                    ms.appendMarkdown(desc);
                    ms.appendText("\n");
                  });
                  item.documentation = ms;
                  item.detail = `${x.label} >_${x.document.filePath}`;
  
                  if (x.is_deprecated) {
                    item.tags = [vscode.CompletionItemTag.Deprecated];
                  }
                  item.range = document.validateRange(new vscode.Range(position.line, position.character - 1, position.line, position.character + 1));
  
                  items.push(item);
                }
              });
            }
          }
        }
      });
      return items;
    }
  }
// /**
//  * special 提示
//  */
// vscode.languages.registerCompletionItemProvider("jass", new (), "$", "\"", "'", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""));



