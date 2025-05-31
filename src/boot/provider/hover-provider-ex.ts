import * as path from "path";
import * as fs from "fs";



import * as vscode from "vscode";

import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";
import { Subject } from "../../extern/rxjs";
import { AllKeywords } from "../jass/keyword";
import { Position } from "../jass/loc";

class PackageHover<T extends vjass_ast.NodeAst> extends vscode.Hover {
  public readonly key: string;
  public readonly data:T;
  constructor(data:T, contents: vscode.MarkdownString | vscode.MarkedString | (vscode.MarkdownString | vscode.MarkedString)[], range?: vscode.Range ) {
    super(contents, range);
    this.data = data;

    if (data instanceof vjass_ast.Native
      || data instanceof vjass_ast.Func
      || data instanceof vjass_ast.Struct
      || data instanceof vjass_ast.Interface
      || data instanceof vjass_ast.Method
      || data instanceof vjass_ast.Local
      || data instanceof vjass_ast.GlobalVariable
      || data instanceof vjass_ast.Member
      || data instanceof vjass_ast.Library
      || data instanceof vjass_ast.Scope
      || data instanceof vjass_ast.zinc.Library
      || data instanceof vjass_ast.zinc.Struct
      || data instanceof vjass_ast.zinc.Func
      || data instanceof vjass_ast.zinc.Interface
      || data instanceof vjass_ast.zinc.Method
      || data instanceof vjass_ast.zinc.Member
      || data instanceof vjass_ast.Type
      ) {
        if (data.name) {
          this.key = data.name.getText();
        } else {
          this.key = "";
        }
    } else {
      this.key = "";
    }
  }
}
class TakeHover extends vscode.Hover {
  public readonly data:vjass_ast.Take;
  constructor(data:vjass_ast.Take, contents: vscode.MarkdownString | vscode.MarkedString | (vscode.MarkdownString | vscode.MarkedString)[], range?: vscode.Range | undefined) {
    super(contents, range);
    this.data = data;
  }
}

class HoverDocument {
  // public readonly document:vscode.TextDocument;
  public readonly program:vjass.Document;

  public readonly native_items:PackageHover<vjass_ast.Native>[];
  public readonly function_items:PackageHover<vjass_ast.Func|vjass_ast.zinc.Func>[];
  public readonly struct_items:PackageHover<vjass_ast.Struct|vjass_ast.zinc.Struct>[];
  public readonly interface_items:PackageHover<vjass_ast.Interface|vjass_ast.zinc.Interface>[];
  public readonly method_items:PackageHover<vjass_ast.Method|vjass_ast.zinc.Method>[];
  public readonly local_items:PackageHover<vjass_ast.Local|vjass_ast.zinc.Member>[];
  // Commented out globals-related code
  // public readonly global_variable_items:PackageHover<vjass_ast.GlobalVariable|vjass_ast.zinc.Member>[];
  public readonly membere_items:PackageHover<vjass_ast.Member|vjass_ast.zinc.Member>[];
  public readonly library_items:PackageHover<vjass_ast.Library|vjass_ast.zinc.Library>[];
  public readonly scope_items:PackageHover<vjass_ast.Scope>[];
  // public readonly take_items:TakeCompletionItem[];

  constructor(program:vjass.Document) {
    // this.document = document;
    this.program = program;

    this.native_items = this.program.natives.map(node => HoverDocument.native_to_hover(node));
    this.function_items = this.program.functions.map(node => HoverDocument.function_to_hover(node));
    this.struct_items = this.program.structs.map(node => this.struct_to_hover(node));
    this.interface_items = this.program.interfaces.map(node => this.interface_to_hover(node));
    this.method_items = this.program.methods.map(node => HoverDocument.method_to_hover(node));
    this.local_items = this.program.locals.map(node => HoverDocument.local_to_hover(node));
    // Commented out globals-related code
    // this.global_variable_items = this.program.global_variables.map(node => this.global_variable_to_hover(node));
    this.membere_items = this.program.members.map(node => HoverDocument.member_to_hover(node));
    this.library_items = this.program.librarys.map(node => this.library_to_hover(node));
    this.scope_items = this.program.scopes.map(node => this.scope_to_hover(node));
    // this.take_items = [
    //   ...(this.program.functions.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    //   ...(this.program.methods.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    // ].flat().map(node => this.take_to_hover(node));
  }


  public static  native_to_hover(object: vjass_ast.Native) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    object.takes?.forEach(take => {
      const desc = take.desciprtion;
      if (desc) {
        ms.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
        ms.appendText("\n");
      }
    });
    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }

  public static  function_to_hover(func: vjass_ast.Func|vjass_ast.zinc.Func) {
    // @ts-ignore
    return this.native_to_hover(func) as PackageHover<vjass_ast.Func|vjass_ast.zinc.Func>;
  }
  
  public static method_to_hover(func: vjass_ast.Method|vjass_ast.zinc.Method) {
    // @ts-ignore
    return this.native_to_hover(func) as PackageHover<vjass_ast.Method|vjass_ast.zinc.Method>;
  }
  private interface_to_hover(inter: vjass_ast.Interface|vjass_ast.zinc.Interface) {
    return this.struct_to_hover(inter) as PackageHover<vjass_ast.Interface|vjass_ast.zinc.Interface>;
  }
  private library_to_hover(object: vjass_ast.Library|vjass_ast.zinc.Library) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  private scope_to_hover(object: vjass_ast.Scope) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  private struct_to_hover(object: vjass_ast.Struct|vjass_ast.zinc.Struct) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  public static local_to_hover(object: vjass_ast.Local|vjass_ast.zinc.Member) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  // Commented out globals-related code
  /*
  private global_variable_to_hover(object: vjass_ast.GlobalVariable|vjass_ast.zinc.Member) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  */
  public static member_to_hover(object: vjass_ast.Member|vjass_ast.zinc.Member) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    if (object.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    object.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new PackageHover(object, ms, new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  public static take_to_hover(object: vjass_ast.Take) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.belong.document.filePath);
    ms.appendMarkdown("## " + (object.name ? object.name.getText() : "(unkown)"));
    ms.appendText("\n");

    ms.appendText(`>_${object.belong.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    


    const param_desc = object.belong.get_param_descriptions().find(x => object.name && x.name == object.name.getText());
    if (param_desc) {
      ms.appendMarkdown(param_desc.content);
      ms.appendText("\n");
    }

    object.belong.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    const item = new TakeHover(object, ms, new vscode.Range(new vscode.Position(object.belong.start.line, object.belong.start.position), new vscode.Position(object.belong.end.line, object.belong.end.position)));

    return item;



  }
  public static define_to_hover(object: vjass.Macro) {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(object.document.filePath);
    ms.appendMarkdown("## " + (object.key || ""));
    ms.appendText("\n");

    ms.appendText(`>_${object.document.filePath}`);
    ms.appendText("\n");

    
    ms.appendCodeblock(object.to_string());
    
    const item = new vscode.Hover(ms, new vscode.Range(new vscode.Position(object.line_number, 0), new vscode.Position(object.line_number, object.length)));

    return item;



  }
}
class Wrap {
  public key: string;
  public document:HoverDocument;

  constructor(key: string, document:HoverDocument) {
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
  private readonly subject = new Subject<vscode.TextDocument>();

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
  
        this.wraps.push(new Wrap(document.uri.fsPath, new HoverDocument(program)));
      } else {
        this.wraps[index].document = new HoverDocument(program);
      }
    }
  }
  add(key: string) {
    const index = this.index_of(key);
    const program = GlobalContext.get(key);
    // const document = vscode.workspace.textDocuments.find(document => equals_file_path(document.uri.fsPath, key));
    if (program) {
      if (index == -1) {
        this.wraps.push(new Wrap(key, new HoverDocument(program)));
      } else {
        this.wraps[index].document = new HoverDocument(program);
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

export const init_document_hover = (key: string) => {
  CompletionManage.add(key);
};

export const change_document_hover = (document: vscode.TextDocument) => {
  CompletionManage.changed(document);
};

export const delete_document_hover = (file_name:string) => {
  CompletionManage.delete(file_name);
};
export const rename_document_hover = (origin_key: string, target_kay: string) => {
  CompletionManage.rename(origin_key, target_kay);
};

class HoverProvider implements vscode.HoverProvider {

  // 规定标识符长度
  private _maxLength = 526;

  private isNumber = function (val: string) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {

    const key = document.getText(document.getWordRangeAtPosition(position));

    if (key.length > this._maxLength) {
      return null;
    }

    if (this.isNumber(key)) {
      return null;
    }

    if (AllKeywords.includes(key)) {
      return null;
    }

    const hovers2:vscode.Hover[] = [];
    
    CompletionManage.wraps.forEach(wrap => {
      // hovers2.push(...wrap.document.program.macros.filter(macro => macro.key && macro.key == key).map(macro => {
      //   return HoverDocument.define_to_hover(macro);
      // }));


      hovers2.push(...wrap.document.native_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.function_items.filter(x => x.key == key));
      // Commented out globals-related code
      // hovers2.push(...wrap.document.global_variable_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.struct_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.interface_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.library_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.scope_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.method_items.filter(x => x.key == key));
      hovers2.push(...wrap.document.membere_items.filter(x => x.key == key));
      
      const is_current = wrap.equals(document.uri.fsPath);
      if (is_current) {
        const target_position = new Position(position.line, position.character);

        const find_contains_func_and_method = (): PackageHover<vjass_ast.Func | vjass_ast.zinc.Func | vjass_ast.Method | vjass_ast.zinc.Method>[] => {
          return [...wrap.document.method_items, ...wrap.document.function_items].filter(object => object.data.contains(target_position));
        };
        const funcs = find_contains_func_and_method();
        const find_func_and_method_locals = (func: PackageHover<vjass_ast.Func | vjass_ast.zinc.Func | vjass_ast.Method | vjass_ast.zinc.Method>) => {
          if (func.data instanceof vjass_ast.Func || func.data instanceof vjass_ast.Method) {
            const locals = func.data.children.filter(child => child instanceof vjass_ast.Local) as vjass_ast.Local[];
            locals.filter(take => take.name && take.name.getText() == key).forEach(local => {
              hovers2.push(HoverDocument.local_to_hover(local));
            });
          } else {
            const locals = func.data.children.filter(child => child instanceof vjass_ast.zinc.Member) as vjass_ast.zinc.Member[];
            locals.filter(take => take.name && take.name.getText() == key).forEach(local => {
              hovers2.push(HoverDocument.member_to_hover(local));
            });
          }
        } 
        funcs.forEach(func => {
          if (func.data.takes) {
            func.data.takes.filter(take => take.name && take.name.getText() == key).forEach(take => {
              hovers2.push(HoverDocument.take_to_hover(take));
            });
          }
          find_func_and_method_locals(func);
        });

        // const push_take = (function_items:PackageHover<vjass_ast.Func|vjass_ast.Method|vjass_ast.zinc.Func|vjass_ast.zinc.Method>[]) => {
        //   function_items.filter(x => {
        //     return x.data.contains(target_position);
        //   }).forEach(data => {
        //     if (data.data.takes) {
        //       data.data.takes.forEach(take => {
        //         if (take.name && take.name.getText() == key) {
        //           hovers2.push(HoverDocument.take_to_hover(take));
        //         }
        //       });
        //     }
        //   });
        // };
        // const push_local = (local_items:PackageHover<vjass_ast.Local>[]) => {
        //   local_items.filter(x => {
        //     return x.data.parent && (x.data.parent instanceof vjass_ast.Func || x.data.parent instanceof vjass_ast.Method || x.data.parent instanceof vjass_ast.zinc.Func || x.data.parent instanceof vjass_ast.zinc.Method) && x.data.parent.contains(target_position);
        //   }).forEach(data => {
        //     if (data.key == key) {
        //       hovers2.push(data);
        //     }
        //   });
        // };
  
        // push_take(wrap.document.function_items);
        // push_take(wrap.document.method_items);
        // push_local(wrap.document.local_items);
      }
    });

    return new vscode.Hover(hovers2.map(hover => hover.contents).flat());
  }

}

vscode.languages.registerHoverProvider("jass", new HoverProvider());