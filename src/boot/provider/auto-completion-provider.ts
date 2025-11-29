import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { GlobalContext, Interface, JassDetail, Module, zinc } from "../jass/parser-vjass";
import { functionToItem, keyworldToItem, nativeToItem, structToItem, typeToItem, globalVariableToItem, interfaceToItem, moduleToItem, textMacroToItem, defineToItem, localToItem, takeToItem, delegateToItem } from "./complation-item-generator";
import { AllKeywords } from "../jass/keyword";
import { Position } from "../jass/loc";
import { tokenize } from "../jass/tokens";
import { isAiFile, isJFile, isLuaFile, isZincFile } from "../tool";

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
            const item = nativeToItem(native);
            if (item) {
                items.push(item);
            }
        });
        GlobalContext.get_functions().forEach(func => {
            const item = functionToItem(func);
            if (item) {
                items.push(item);
            }
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
                  item.sortText = "~Z"
  
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

/**
 * 文件路径提示
 */
export class IncludeCompletionItemProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
      const items:vscode.CompletionItem[] = [];
  
      const lineText = document.lineAt(position);
      const lineContent = lineText.text;
  
      const tokens = tokenize(lineContent);
  
      const currentFileDir = () => {
        return path.parse(document.uri.fsPath).dir;
      };
  
      if (tokens[0]) {
        if (tokens[0].isMacro() && tokens[0].value == "#include") {
          const token = tokens[1];
          if (token) {
            if (token.isString()) {
    
              const strContent = token.value.substring(1, token.value.length - 1);
    
              const prefixContent = strContent.substring(0, position.character - token.position - 1);
    
              const realPath = path.isAbsolute(prefixContent) ? path.resolve(prefixContent) : path.resolve(currentFileDir(), prefixContent);
              const stat = fs.statSync(realPath);
              if (stat.isDirectory()) {
                const paths = fs.readdirSync(realPath);
                paths.forEach((p) => {
                  const filePath = path.resolve(realPath, p);
                  if (fs.statSync(filePath).isDirectory()) {
                    items.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.Folder));
                  } else if (isJFile(filePath) || isZincFile(filePath) || isAiFile(filePath) || isLuaFile(filePath)) {
                    items.push(new vscode.CompletionItem(p, vscode.CompletionItemKind.File));
                  }
                });
              }          
            }
          }
        }
      }
  
      return items;
    }
  }
// vscode.languages.registerCompletionItemProvider("jass", new (), "\"", "/", "\\");

