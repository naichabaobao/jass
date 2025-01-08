/**
 * 当前文件为completion-item-provider.ts的从新实现版本，
 * 之所以新建文件而不是在原有的文件修改，为的就是有望移除旧版本实现，从而移除一般部分代码。
 */


import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";
import { Subject } from "../../extern/rxjs";


class PackageCompletionItem<T extends vjass_ast.NodeAst> extends vscode.CompletionItem {
  public readonly data:T;
  constructor(data:T, label: string | vscode.CompletionItemLabel, kind?: vscode.CompletionItemKind | undefined) {
    super(label, kind);
    this.data = data;
  }
}

class CompletionItemDocument {
  public readonly document:vscode.TextDocument;
  public readonly program:vjass.Document;

  public readonly native_items:PackageCompletionItem<vjass_ast.Native>[];
  public readonly function_items:PackageCompletionItem<vjass_ast.Func>[];
  public readonly struct_items:PackageCompletionItem<vjass_ast.Struct>[];
  public readonly interface_items:PackageCompletionItem<vjass_ast.Interface>[];
  public readonly method_items:PackageCompletionItem<vjass_ast.Method>[];
  public readonly local_items:PackageCompletionItem<vjass_ast.Local>[];
  public readonly global_variable_items:PackageCompletionItem<vjass_ast.GlobalVariable>[];
  public readonly membere_items:PackageCompletionItem<vjass_ast.Member>[];

  constructor(document:vscode.TextDocument, program:vjass.Document) {
    this.document = document;
    this.program = program;

    this.native_items = this.program.natives.map(node => this.native_to_item(node));
    this.function_items = this.program.functions.map(node => this.function_to_item(node));
    this.struct_items = this.program.structs.map(node => this.struct_to_item(node));
    this.interface_items = this.program.interfaces.map(node => this.interface_to_item(node));
    this.method_items = this.program.methods.map(node => this.mathod_to_item(node));
    this.local_items = this.program.locals.map(node => this.native_to_item(node));
    this.global_variable_items = this.program.global_variables.map(node => this.native_to_item(node));
    this.membere_items = this.program.members.map(node => this.native_to_item(node));
  }

  private native_to_item(func: vjass_ast.Native) {
    const item = new PackageCompletionItem(func, func.name?.getText() ?? "(unkown)", vscode.CompletionItemKind.Function);
    item.detail = `${func.name?.getText() ?? "(unkown)"} >_${func.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(func.document.filePath);
    ms.appendCodeblock(func.to_string());
    
    func.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    func.takes?.forEach(take => {
      const desc = take.desciprtion;
      if (desc) {
        ms.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
      }
    });
    item.documentation = ms;
  
    if (func.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    if (func.is_constant) {
      item.sortText = "@constant";
    }
    if (func.is_static) {
      item.sortText = "@static";
      item.label = `static ${func.name?.getText() ?? "(unkown)"}`;
      item.insertText = func.name?.getText() ?? "(unkown)";
    }
  
    return item;
  }

  private function_to_item(func: vjass_ast.Func) {
    return this.native_to_item(func) as PackageCompletionItem<vjass_ast.Func>;
  }
  
  private mathod_to_item(func: vjass_ast.Method) {
    return this.native_to_item(func) as PackageCompletionItem<vjass_ast.Method>;
  }
  private interface_to_item(inter: vjass_ast.Interface) {
    return this.struct_to_item(inter, vscode.CompletionItemKind.Interface) as PackageCompletionItem<vjass_ast.Interface>;
  }
  private struct_to_item(struct: vjass_ast.Struct, kind: vscode.CompletionItemKind  = vscode.CompletionItemKind.Struct) {
    const item = new PackageCompletionItem(struct, struct.name?.getText() ?? "(unkown)", kind);
    item.detail = `${struct.name?.getText() ?? "(unkown)"} >_${struct.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(struct.document.filePath);
    ms.appendCodeblock(struct.to_string());
    
    struct.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (struct.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
  }
}

class FuncString {
  readonly key:string;
  constructor(key:string) {
    this.key = key;
  }
}
function get_names(doc:vjass.Document, document: vscode.TextDocument, position :vscode.Position):(string|FuncString)[] {
  const keys:(string|FuncString)[] = [];
  const tokens = doc.lineTokens(position.line);

  let index = 0;
  for (; index < tokens.length; ) {
    const token = tokens[index];
    if (token.end.position >= position.character) {
      break;
    } else {
      index++;
    }
  }
  const slice_tokens = tokens.slice(0, index);
  let state = 0;
  let layer = 0;
  
  for (let index = slice_tokens.length - 1; index >= 0; index--) {
    const token = slice_tokens[index];
    if (token.is_block_comment) {
      continue;
    }
    const text = token.getText();
    if (state == 0) {
      if (token.is_identifier) {
        if (keys.length == 0) {
          state = 1;
          continue;
        } else {
          keys.push(text);
          state = 1;
        }
      } else if (text == ".") {
        state = 2;
      } else if (text == ")") {
        layer++;
        state = 3;
      } else {
        break;
      }
    } else if (state == 1) {
      if (text == ".") {
        state = 2;
      } else {
        break;
      }
    } else if (state == 2) {
      if (token.is_identifier) {
        keys.push(text);
        state = 1;
      } else if (text == ")") {
        layer++;
        state = 3;
      } else {
        break;
      }
    } else if (state == 3) {
      if (text == "(") {
        layer--;
        if (layer <= 0) {
          state = 4;
        }
      } else if (text == ")") {
        layer++;
      } else {
        continue;
      }
    } else if (state == 4) {
      if (token.is_identifier) {
        keys.push(new FuncString(token.getText()));
        state = 1;
      } else {
        break;
      }
    }
  }
  return keys.reverse();
}

const function_or_native_or_mathod_to_item = (func:vjass_ast.Func|vjass_ast.Native|vjass_ast.Method) => {
  const item = new vscode.CompletionItem(func.name?.getText() ?? "(unkown)", vscode.CompletionItemKind.Function);
  item.detail = `${func.name?.getText() ?? "(unkown)"} >_${func.document.filePath}`;
  
  const ms = new vscode.MarkdownString();
  ms.baseUri = vscode.Uri.file(func.document.filePath);
  ms.appendCodeblock(func.to_string());

  if (func.name?.getText() == "function_name22" ||func.name?.getText() ==  "function_name4856") {
    console.log(func, func.get_param_descriptions(), func.comments);

  }
  
  func.description.forEach(desc => {
    ms.appendMarkdown(desc);
    ms.appendText("\n");
  });
  func.takes?.forEach(take => {
    const desc = take.desciprtion;
    if (desc) {
      ms.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
    }
  });
  item.documentation = ms;

  if (func.is_deprecated) {
    item.tags = [vscode.CompletionItemTag.Deprecated];
  }

  if (func.is_constant) {
    item.sortText = "@constant";
  }
  if (func.is_static) {
    item.sortText = "@static";
    item.label = `static ${func.name?.getText() ?? "(unkown)"}`;
    item.insertText = func.name?.getText() ?? "(unkown)";
  }

  return item;
};
const struct_to_item = (struct:vjass_ast.Struct) => {
  const item = new vscode.CompletionItem(struct.name?.getText() ?? "(unkown)", vscode.CompletionItemKind.Struct);
  item.detail = `${struct.name?.getText() ?? "(unkown)"} >_${struct.document.filePath}`;
  
  const ms = new vscode.MarkdownString();
  ms.baseUri = vscode.Uri.file(struct.document.filePath);
  ms.appendCodeblock(struct.to_string());

  
  struct.description.forEach(desc => {
    ms.appendMarkdown(desc);
    ms.appendText("\n");
  });
  item.documentation = ms;

  if (struct.is_deprecated) {
    item.tags = [vscode.CompletionItemTag.Deprecated];
  }

  return item;
};

function generate_item_by_document(document?:vjass.Document) {
  const items:PackageCompletionItem[] = [];

  if (!document) {
    return items;
  }


  
  document.functions.filter(func => func.is_public).forEach(func => {
    items.push(function_or_native_or_mathod_to_item(func));
  });
  document.natives.filter(func => func.is_public).forEach(func => {
    items.push(function_or_native_or_mathod_to_item(func));
  });
  document.structs.filter(struct => struct.is_public).forEach(struct => {
    items.push(struct_to_item(struct));
  });
  // document.methods.forEach(func => {
  //   items.push(function_or_native_or_mathod_to_item(func));
  // });

  return items;
}

const equals = (oldkey:string, key: string) => {
  const this_info = path.parse(oldkey);
  const other_info = path.parse(key);
  return this_info.dir == other_info.dir && this_info.base == other_info.base;
}

class Wrap {
  public key: string;
  public items:vscode.CompletionItem[] = [];

  constructor(key: string, items:vscode.CompletionItem[]) {
    this.key = key;
    this.items = items;
  }

  public equals(key: string) {
    const this_info = path.parse(this.key);
    const other_info = path.parse(key);
    return this_info.dir == other_info.dir && this_info.base == other_info.base;
  }
}
class Manage {
  wraps:Wrap[] = [];
  private readonly subject = new Subject();

  constructor () {
    this.subject.subscribe((document:vscode.TextDocument) => {
      this.set(document);
    });
  }

  index_of(key: string):number {
    const index = this.wraps.findIndex((wrap) => wrap.equals(key));
    return index;
  }

  has(key: string):boolean {
    const index = this.index_of(key);
    return index != -1;
  }

  set(document:vscode.TextDocument) {
    const index = this.index_of(document.uri.fsPath);
    if (index == -1) {
      this.wraps.push(new Wrap(document.uri.fsPath, generate_item_by_document(GlobalContext.get(document.uri.fsPath))));
    } else {
      this.wraps[index].items = generate_item_by_document(GlobalContext.get(document.uri.fsPath));
    }
  }
  add(key: string) {
    const index = this.index_of(key);
    if (index == -1) {
      this.wraps.push(new Wrap(key, generate_item_by_document(GlobalContext.get(key))));
    } else {
      this.wraps[index].items = generate_item_by_document(GlobalContext.get(key))
    }
  }

  delete(key: string) {
    const index = this.index_of(key);
    if (index != -1) {
      this.wraps.splice(index, 1);
    }
  }

  private try_get(document:vscode.TextDocument) {
    const index = this.index_of(document.uri.fsPath);
    if (index != -1) {
      return this.wraps[index];
    }
  }

  get(document:vscode.TextDocument) {
    const index = this.index_of(document.uri.fsPath);
    if (index != -1) {
      return this.wraps[index];
    } else {
      // 再尝试一次
      this.set(document);
      return this.try_get(document);
    }
  }

  /**
   * 文档发生改变时手动调用
   * 根据改变后的内容重新生成items
   */
  changed(document:vscode.TextDocument) {
    this.subject.next(document);
  }

  rename(origin_key: string, target_kay: string) {
    const index = this.index_of(origin_key);
    if (index != -1) {
      return this.wraps[index].key = target_kay;
    }
  }

  get_all_items() {
    const items:vscode.CompletionItem[] = [];
    this.wraps.forEach(wrap => {
      // items.concat(...wrap.items);
      items.push(...wrap.items);
    });
    return items;
  }
}

const CompletionManage = new Manage();

export const init_document_item = (key: string) => {
  CompletionManage.add(key);
};

export const change_document_item = (document: vscode.TextDocument) => {
  CompletionManage.changed(document);
};

export const delete_document_item = (file_name:string) => {
  CompletionManage.delete(file_name);
};
export const rename_document_item = (origin_key: string, target_kay: string) => {
  CompletionManage.rename(origin_key, target_kay);
};

vscode.languages.registerCompletionItemProvider("jass", new class CompletionItemProvider1 implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const items = CompletionManage.get_all_items();
    // console.time("CompletionItemProvider1");
    // const items = CompletionManage.get_all_items();
    // console.timeEnd("CompletionItemProvider1")
    const program = GlobalContext.get(document.uri.fsPath);
    if (program) {
      const keys = get_names(program, document, position);
      program.methods.forEach(method => {
        if (method.is_static && keys.length == 1 && method.parent && (method.parent instanceof vjass_ast.Struct || method.parent instanceof vjass_ast.Interface)) {
          const key = keys[0];
          const parent:vjass_ast.Struct|vjass_ast.Interface = method.parent;
          if (typeof key == "string") {
            if (key == "this") {
              if (equals(document.uri.fsPath, method.document.filePath)) {
                // 判断是否包含在struct内
                if (new vscode.Range(new vscode.Position(parent.start_token?.line ?? 0, parent.start_token?.position ?? 0), new vscode.Position(parent.end_token?.line ?? document.lineCount, parent.end_token?.position ?? document.lineAt(document.lineCount - 1).range.end.character)).contains(position)) {
                  
                  items.push(function_or_native_or_mathod_to_item(method));
                }
              }
            }
          }
        }
      });
      // 私有
      if (equals(document.uri.fsPath, program.filePath)) {
        program.functions.filter(func => func.is_private).forEach(func => {
          items.push(function_or_native_or_mathod_to_item(func));
        });
        program.natives.filter(func => func.is_private).forEach(func => {
          items.push(function_or_native_or_mathod_to_item(func));
        });
        program.structs.filter(struct => struct.is_private).forEach(struct => {
          items.push(struct_to_item(struct));
        });
      }
    }
    
    get_names(GlobalContext.get(document.uri.fsPath)!, document, position);

    return items;
  }

  // resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
  //     if (item.filterText != "private") {
  //       return;
  //     }

  //     return item;
  // }

}());


