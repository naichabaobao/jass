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
class TakeCompletionItem extends vscode.CompletionItem {
  public readonly data:vjass_ast.Take;
  constructor(data:vjass_ast.Take, label: string | vscode.CompletionItemLabel, kind?: vscode.CompletionItemKind | undefined) {
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
  public readonly library_items:PackageCompletionItem<vjass_ast.Library>[];
  public readonly scope_items:PackageCompletionItem<vjass_ast.Scope>[];
  // public readonly take_items:TakeCompletionItem[];

  constructor(document:vscode.TextDocument, program:vjass.Document) {
    this.document = document;
    this.program = program;

    this.native_items = this.program.natives.map(node => CompletionItemDocument.native_to_item(node));
    this.function_items = this.program.functions.map(node => CompletionItemDocument.function_to_item(node));
    this.struct_items = this.program.structs.map(node => this.struct_to_item(node));
    this.interface_items = this.program.interfaces.map(node => this.interface_to_item(node));
    this.method_items = this.program.methods.map(node => CompletionItemDocument.method_to_item(node));
    this.local_items = this.program.locals.map(node => this.local_to_item(node));
    this.global_variable_items = this.program.global_variables.map(node => this.global_variable_to_item(node));
    this.membere_items = this.program.members.map(node => CompletionItemDocument.member_to_item(node));
    this.library_items = this.program.librarys.map(node => this.library_to_item(node));
    this.scope_items = this.program.scopes.map(node => this.scope_to_item(node));
    // this.take_items = [
    //   ...(this.program.functions.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    //   ...(this.program.methods.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    // ].flat().map(node => this.take_to_item(node));
  }

  public static  native_to_item(func: vjass_ast.Native) {
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

  public static  function_to_item(func: vjass_ast.Func) {
    return this.native_to_item(func) as PackageCompletionItem<vjass_ast.Func>;
  }
  
  public static method_to_item(func: vjass_ast.Method) {
    return this.native_to_item(func) as PackageCompletionItem<vjass_ast.Method>;
  }
  private interface_to_item(inter: vjass_ast.Interface) {
    return this.struct_to_item(inter, vscode.CompletionItemKind.Interface) as PackageCompletionItem<vjass_ast.Interface>;
  }
  private library_to_item(library: vjass_ast.Library) {
    const item = new PackageCompletionItem(library, library.name?.getText() ?? "(unkown)", vscode.CompletionItemKind.Module);
    item.detail = `${library.name?.getText() ?? "(unkown)"} >_${library.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(library.document.filePath);
    ms.appendCodeblock(library.to_string());
    
    library.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (library.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
  }
  private scope_to_item(scope: vjass_ast.Scope) {
    const item = new PackageCompletionItem(scope, scope.name?.getText() ?? "(unkown)", vscode.CompletionItemKind.Field);
    item.detail = `${scope.name?.getText() ?? "(unkown)"} >_${scope.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(scope.document.filePath);
    ms.appendCodeblock(scope.to_string());
    
    scope.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (scope.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
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
  private local_to_item(local: vjass_ast.Local, kind: vscode.CompletionItemKind  = vscode.CompletionItemKind.Variable) {
    const item = new PackageCompletionItem(local, local.name?.getText() ?? "(unkown)", kind);
    item.detail = `${local.name?.getText() ?? "(unkown)"} >_${local.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(local.document.filePath);
    ms.appendCodeblock(local.to_string());
    
    local.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (local.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
  }
  private global_variable_to_item(global: vjass_ast.GlobalVariable, kind: vscode.CompletionItemKind  = vscode.CompletionItemKind.Variable) {
    const item = new PackageCompletionItem(global, global.name?.getText() ?? "(unkown)", global.is_constant ? vscode.CompletionItemKind.Constant :kind);
    item.detail = `${global.name?.getText() ?? "(unkown)"} >_${global.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(global.document.filePath);
    ms.appendCodeblock(global.to_string());
    
    global.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (global.is_constant) {
      item.sortText = "@constant";
    }
    if (global.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
  }
  public static member_to_item(global: vjass_ast.Member, kind: vscode.CompletionItemKind  = vscode.CompletionItemKind.EnumMember) {
    const item = new PackageCompletionItem(global, global.name?.getText() ?? "(unkown)", kind);
    item.detail = `${global.name?.getText() ?? "(unkown)"} >_${global.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(global.document.filePath);
    ms.appendCodeblock(global.to_string());
    
    global.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    item.documentation = ms;
  
    if (global.is_constant) {
      item.sortText = "@constant";
    }
    if (global.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }
  
    return item;
  }
  public static take_to_item(take: vjass_ast.Take, kind: vscode.CompletionItemKind  = vscode.CompletionItemKind.Property) {
    const item = new TakeCompletionItem(take, take.name?.getText() ?? "(unkown)", kind);
    item.detail = `${take.name?.getText() ?? "(unkown)"} >_${take.belong.document.filePath}`;
    
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(take.belong.document.filePath);
    ms.appendCodeblock("//@param\n");
    ms.appendCodeblock(take.to_string());
    
    const param_desc = take.belong.get_param_descriptions().find(x => take.name && x.name == take.name.getText());
    if (param_desc) {
      ms.appendMarkdown(param_desc.content);
      ms.appendText("\n");
    }
    
    item.documentation = ms;

  
    return item;
  }
}

class FuncString {
  public readonly key:string;
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

// function generate_item_by_document(document?:vjass.Document) {
//   const items:PackageCompletionItem[] = [];

//   if (!document) {
//     return items;
//   }


  
//   document.functions.filter(func => func.is_public).forEach(func => {
//     items.push(function_or_native_or_mathod_to_item(func));
//   });
//   document.natives.filter(func => func.is_public).forEach(func => {
//     items.push(function_or_native_or_mathod_to_item(func));
//   });
//   document.structs.filter(struct => struct.is_public).forEach(struct => {
//     items.push(struct_to_item(struct));
//   });
//   // document.methods.forEach(func => {
//   //   items.push(function_or_native_or_mathod_to_item(func));
//   // });

//   return items;
// }

const equals = (oldkey:string, key: string) => {
  const this_info = path.parse(oldkey);
  const other_info = path.parse(key);
  return this_info.dir == other_info.dir && this_info.base == other_info.base;
}

const equals_file_path = (key: string, file_name:string):boolean => {
  const this_info = path.parse(file_name);
  const other_info = path.parse(key);
  return this_info.dir == other_info.dir && this_info.base == other_info.base;
}

class Wrap {
  public key: string;
  public document:CompletionItemDocument;

  constructor(key: string, document:CompletionItemDocument) {
    this.key = key;
    this.document = document;
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
    const program = GlobalContext.get(document.uri.fsPath);
    if (program) {
      if (index == -1) {
        // this.wraps.push(new Wrap(document.uri.fsPath, generate_item_by_document(GlobalContext.get(document.uri.fsPath))));
  
        this.wraps.push(new Wrap(document.uri.fsPath, new CompletionItemDocument(document, program)));
      } else {
        this.wraps[index].document = new CompletionItemDocument(document, program);
      }
    }
  }
  add(key: string) {
    const index = this.index_of(key);
    const program = GlobalContext.get(key);
    const document = vscode.workspace.textDocuments.find(document => equals_file_path(document.uri.fsPath, key));
    if (program && document) {
      if (index == -1) {
        this.wraps.push(new Wrap(key, new CompletionItemDocument(document, program)));
      } else {
        this.wraps[index].document = new CompletionItemDocument(document, program);
      }
      // if (index == -1) {
      //   this.wraps.push(new Wrap(key, generate_item_by_document(GlobalContext.get(key))));
      // } else {
      //   this.wraps[index].items = generate_item_by_document(GlobalContext.get(key))
      // }
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

  // get_all_items() {
  //   const items:(PackageCompletionItem|TakeCompletionItem)[] = [];
  //   this.wraps.forEach(wrap => {
  //     // items.concat(...wrap.items);
  //     // items.push(...wrap.items);
  //     wrap.document.function_items
  //   });
  //   return items;
  // }
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
    const items:vscode.CompletionItem[] = [];

    CompletionManage.wraps.forEach(wrap => {
      // items.concat(...wrap.items);
      // items.push(...wrap.items);
      const is_current = wrap.equals(document.uri.fsPath);
      if (is_current) {
        items.push(...wrap.document.native_items);
        items.push(...wrap.document.function_items);
        items.push(...wrap.document.global_variable_items);
        items.push(...wrap.document.struct_items);
        items.push(...wrap.document.interface_items);
        items.push(...wrap.document.library_items);
        items.push(...wrap.document.scope_items);
        const target_position = new vjass.Position(position.line, position.character);
        const takes:vjass_ast.Take[] = [];
        const push_take = (function_items:PackageCompletionItem<vjass_ast.Func>[]) => {
          function_items.filter(x => {
            return x.data.contains(target_position);
          }).forEach(data => {
            if (data.data.takes) {
              data.data.takes.forEach(take => {
                items.push(CompletionItemDocument.take_to_item(take));
                takes.push(take);
              });
            }
          });
        };
        const locals:vjass_ast.Local[] = [];
        const push_local = (local_items:PackageCompletionItem<vjass_ast.Local>[]) => {
          local_items.filter(x => {
            return x.data.parent && (x.data.parent instanceof vjass_ast.Func || x.data.parent instanceof vjass_ast.Method) && x.data.parent.contains(target_position);
          }).forEach(data => {
            if (position.line > data.data.start.line) {
              items.push(data);
              locals.push(data.data);
            }
          });
        };

        push_take(wrap.document.function_items);
        push_local(wrap.document.local_items);

        const names = get_names(wrap.document.program, document, position);
        const structs:vjass_ast.Struct[] = [];
        const push_struct = (struct:vjass_ast.Struct) => {
          const index = structs.findIndex(x => {
            return x === struct;
          });
          if (index === -1) {
            structs.push(struct);
          }
        }
        if (names.length > 0) {
          const first_name = names.shift();
          if (first_name) {
            if (typeof first_name == "string") {
              takes.forEach((take) => {
                if (take.name && take.type && take.name.getText() == first_name) {
                  GlobalContext.get_strcut_by_name(take.type.getText()).forEach(struct => push_struct(struct));
                }
              });
              locals.forEach((local) => {
                if (local.name && local.type && local.name.getText() == first_name) {
                  GlobalContext.get_strcut_by_name(local.type.getText()).forEach(struct => push_struct(struct));
                }
              });
              GlobalContext.get_strcut_by_name(first_name).forEach(struct => push_struct(struct));
            }
          }
        }

        structs.forEach(struct => {
          struct.children.forEach(child => {
            if (child instanceof vjass_ast.Method) {
              items.push(CompletionItemDocument.method_to_item(child));
            }
          });
        });
        

      } else {
        items.push(...wrap.document.native_items.filter(x => x.data.is_public));
        items.push(...wrap.document.function_items.filter(x => x.data.is_public));
        items.push(...wrap.document.global_variable_items.filter(x => x.data.is_public));
      }
    });
    return items;
  }

  // resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
  //     if (item.filterText != "private") {
  //       return;
  //     }

  //     return item;
  // }

}(), ".");


