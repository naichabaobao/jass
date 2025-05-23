import * as vscode from "vscode";

import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";
import { Subject } from "../../extern/rxjs";
import * as path from "path";

class TypeHierarchyItem<T extends vjass_ast.NodeAst> extends vscode.TypeHierarchyItem {

  public readonly data:T;
  constructor(data:T, kind: vscode.SymbolKind, name: string, detail: string, uri: vscode.Uri, range: vscode.Range, selectionRange: vscode.Range) {
    super(kind, name, detail, uri, range, selectionRange);
    this.data = data;
  }
}

class TypeHierarchyDocument {
    // public readonly document:vscode.TextDocument;
    public readonly program:vjass.Document;
  
    public readonly native_items:TypeHierarchyItem<vjass_ast.Native>[];
    public readonly function_items:TypeHierarchyItem<vjass_ast.Func|vjass_ast.zinc.Func>[];
    public readonly struct_items:TypeHierarchyItem<vjass_ast.Struct|vjass_ast.zinc.Struct>[];
    public readonly interface_items:TypeHierarchyItem<vjass_ast.Interface|vjass_ast.zinc.Interface>[];
    public readonly method_items:TypeHierarchyItem<vjass_ast.Method|vjass_ast.zinc.Method>[];
    public readonly local_items:TypeHierarchyItem<vjass_ast.Local|vjass_ast.zinc.Member>[];
    public readonly global_variable_items:TypeHierarchyItem<vjass_ast.GlobalVariable|vjass_ast.zinc.Member>[];
    public readonly membere_items:TypeHierarchyItem<vjass_ast.Member|vjass_ast.zinc.Member>[];
    public readonly library_items:TypeHierarchyItem<vjass_ast.Library|vjass_ast.zinc.Library>[];
    public readonly scope_items:TypeHierarchyItem<vjass_ast.Scope>[];
    public readonly types_items:TypeHierarchyItem<vjass_ast.Type>[];
    // public readonly take_items:TakeCompletionItem[];
  
    constructor(program:vjass.Document) {
      // this.document = document;
      this.program = program;
  
      this.native_items = this.program.natives.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Function, node.name?.getText()));
      this.function_items = this.program.functions.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Function, node.name?.getText()));
      this.struct_items = this.program.structs.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Class, node.name?.getText()));
      this.interface_items = this.program.interfaces.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Interface, node.name?.getText()));
      this.method_items = this.program.methods.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Function, node.name?.getText()));
      this.local_items = this.program.locals.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Variable, node.name?.getText()));
      this.global_variable_items = this.program.global_variables.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Variable, node.name?.getText()));
      this.membere_items = this.program.members.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Variable, node.name?.getText()));
      this.library_items = this.program.librarys.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Module, node.name?.getText()));
      this.scope_items = this.program.scopes.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Module, node.name?.getText()));
      this.types_items = this.program.types.map(node => TypeHierarchyDocument.to_type_hierarchy(node, vscode.SymbolKind.Class, node.name?.getText()));
    }

    private static to_type_hierarchy<T extends vjass_ast.NodeAst>(data: T, kind: vscode.SymbolKind, name?: string) {
        const range = new vscode.Range(new vscode.Position(data.start.line, data.start.position), new vscode.Position(data.end.line, data.end.position));
      const item = new TypeHierarchyItem(data, kind, name ?? "", data.description.join("\n"), vscode.Uri.file(data.document.filePath), range, range);
  
      return item;
    }
  
    find_parent(object:vjass_ast.NodeAst):TypeHierarchyItem<vjass_ast.NodeAst>[] {
        const s:TypeHierarchyItem<vjass_ast.NodeAst>[] = [];
        [...this.struct_items, ...this.interface_items, ...this.method_items, ...this.library_items, ...this.scope_items].forEach(item => {
            if (item.data == object) {
                s.push(item);
            }
        });
        return s;
    }
    
  }
  class Wrap {
    public key: string;
    public document:TypeHierarchyDocument;
  
    constructor(key: string, document:TypeHierarchyDocument) {
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
    private readonly subject = new Subject<string>();
  
    constructor () {
      this.subject.subscribe((file_path: string) => {
        this.set(file_path);
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
  
    set(file_path: string) {
      const index = this.index_of(file_path);
      const program = GlobalContext.get(file_path);
      if (program) {
        if (index == -1) {
          // this.wraps.push(new Wrap(document.uri.fsPath, generate_item_by_document(GlobalContext.get(document.uri.fsPath))));
    
          this.wraps.push(new Wrap(file_path, new TypeHierarchyDocument(program)));
        } else {
          this.wraps[index].document = new TypeHierarchyDocument(program);
        }
      }
    }
    add(key: string) {
      const index = this.index_of(key);
      const program = GlobalContext.get(key);
      // const document = vscode.workspace.textDocuments.find(document => equals_file_path(document.uri.fsPath, key));
      if (program) {
        if (index == -1) {
          this.wraps.push(new Wrap(key, new TypeHierarchyDocument(program)));
        } else {
          this.wraps[index].document = new TypeHierarchyDocument(program);
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
  
    private try_get(file_path: string) {
      const index = this.index_of(file_path);
      if (index != -1) {
        return this.wraps[index];
      }
    }
  
    get(file_path: string) {
      const index = this.index_of(file_path);
      if (index != -1) {
        return this.wraps[index];
      } else {
        // 再尝试一次
        this.set(file_path);
        return this.try_get(file_path);
      }
    }
  
    /**
     * 文档发生改变时手动调用
     * 根据改变后的内容重新生成items
     */
    changed(file_path: string) {
      this.subject.next(file_path);
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
  
  export const TypeHierarchyManage = new Manage();
  
  export const init_type_hierarchy = (key: string) => {
    TypeHierarchyManage.add(key);
  };
  
  export const change_type_hierarchy = (file_name:string) => {
    TypeHierarchyManage.changed(file_name);
  };
  
  export const delete_type_hierarchy = (file_name:string) => {
    TypeHierarchyManage.delete(file_name);
  };
  export const rename_type_hierarchy = (origin_key: string, target_kay: string) => {
    TypeHierarchyManage.rename(origin_key, target_kay);
  };

vscode.languages.registerTypeHierarchyProvider("jass", new class TypeHierarchyProvider implements vscode.TypeHierarchyProvider {
    /**
     * 通过返回给定文档所表示的项目来引导类型层次结构和位置。此项将用作类型图的条目。供应商应当给定位置没有项目时，返回“undefined”或“null”。
     * @param document 
     * @param position 
     * @param token 
     */
    prepareTypeHierarchy(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TypeHierarchyItem | vscode.TypeHierarchyItem[]> {
        const items:vscode.TypeHierarchyItem[] = [];

        GlobalContext.get_structs().forEach(struct => {
            const range = new vscode.Range(new vscode.Position(struct.start.line, struct.start.position), new vscode.Position(struct.end.line, struct.end.position));
            const item = new TypeHierarchyItem(struct, vscode.SymbolKind.Class, struct.name?.getText() ?? "", struct.description.join("\n"), vscode.Uri.file(struct.document.filePath), range, range);
            items.push(item);
        });
        GlobalContext.get_interfaces().forEach(inter => {
            const range = new vscode.Range(new vscode.Position(inter.start.line, inter.start.position), new vscode.Position(inter.end.line, inter.end.position));
            const item = new TypeHierarchyItem(inter, vscode.SymbolKind.Class, inter.name?.getText() ?? "", inter.description.join("\n"), vscode.Uri.file(inter.document.filePath), range, range);
            items.push(item);
        });

        // TypeHierarchyManage.wraps.forEach(wrap => {
        //     // items.push(...wrap.document.native_items);
        //     // items.push(...wrap.document.function_items);
        //     // items.push(...wrap.document.global_variable_items);
        //     // items.push(...wrap.document.library_items);
        //     // items.push(...wrap.document.scope_items);
        //     items.push(...wrap.document.method_items);
        //     items.push(...wrap.document.membere_items);
      

        //   });



          return items;
    }
    /**
     * 为项目提供所有超类型，例如派生/继承类型的所有类型。在图表中，这描述了有向以及类型图中带注释的边，例如给定的项是起始节点，结果是节点可以达到的
     * @param item 
     * @param token 
     */
    provideTypeHierarchySupertypes(item: vscode.TypeHierarchyItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TypeHierarchyItem[]> {
        const items:vscode.TypeHierarchyItem[] = [];
        const data = (item as TypeHierarchyItem<vjass_ast.Struct | vjass_ast.zinc.Struct|vjass_ast.Interface | vjass_ast.zinc.Interface>).data;
        if (data.extends) {
            data.extends.forEach(extend_type => {
                const extend_type_name = extend_type.getText();
                if (extend_type_name != item.name) {
                    GlobalContext.get_strcut_by_name(extend_type_name).forEach(struct => {
                        const range = new vscode.Range(new vscode.Position(struct.start.line, struct.start.position), new vscode.Position(struct.end.line, struct.end.position));
                        const item = new TypeHierarchyItem(struct, vscode.SymbolKind.Class, struct.name?.getText() ?? "", struct.description.join("\n"), vscode.Uri.file(struct.document.filePath), range, range);
                        items.push(item);
                    });
                    GlobalContext.get_interface_by_name(extend_type_name).forEach(inter => {
                        const range = new vscode.Range(new vscode.Position(inter.start.line, inter.start.position), new vscode.Position(inter.end.line, inter.end.position));
                        const item = new TypeHierarchyItem(inter, vscode.SymbolKind.Class, inter.name?.getText() ?? "", inter.description.join("\n"), vscode.Uri.file(inter.document.filePath), range, range);
                        items.push(item);
                    });
                }
            });
        }

        return items;
    }
    /**
     * 提供项目的所有子类型，例如从给定项目派生/继承的所有类型。在……里面图术语描述了类型图中的有向边和带注释的边，例如给定的项是起点节点，结果是可以到达的节点
     * @param item 
     * @param token 
     */
    provideTypeHierarchySubtypes(item: vscode.TypeHierarchyItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TypeHierarchyItem[]> {
        const items:vscode.TypeHierarchyItem[] = [];
        
        GlobalContext.get_strcut_by_extends_name(item.name).forEach(struct => {
            const range = new vscode.Range(new vscode.Position(struct.start.line, struct.start.position), new vscode.Position(struct.end.line, struct.end.position));
            const item = new TypeHierarchyItem(struct, vscode.SymbolKind.Class, struct.name?.getText() ?? "", struct.description.join("\n"), vscode.Uri.file(struct.document.filePath), range, range);
            items.push(item);
        });
        GlobalContext.get_interface_by_name(item.name).forEach(inter => {
            const range = new vscode.Range(new vscode.Position(inter.start.line, inter.start.position), new vscode.Position(inter.end.line, inter.end.position));
            const item = new TypeHierarchyItem(inter, vscode.SymbolKind.Class, inter.name?.getText() ?? "", inter.description.join("\n"), vscode.Uri.file(inter.document.filePath), range, range);
            items.push(item);
        });

        return items;
    }
    
} ());