import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";

import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";
import { AllKeywords } from "../jass/keyword";
import { Position } from "../jass/loc";
import { tokenize } from "../jass/tokens";
import { isAiFile, isJFile, isLuaFile, isZincFile } from "../tool";

/**
 * Definition 上下文接口
 */
interface DefinitionContext {
  document: vscode.TextDocument;
  position: vscode.Position;
  key: string;
  locationCache: Map<string, vscode.Location[]>;
}

/**
 * Definition 访问者接口
 */
interface DefinitionVisitor {
  visitNative(node: vjass_ast.Native, context: DefinitionContext): vscode.Location[];
  visitFunction(node: vjass_ast.Func | vjass_ast.zinc.Func, context: DefinitionContext): vscode.Location[];
  visitMethod(node: vjass_ast.Method | vjass_ast.zinc.Method, context: DefinitionContext): vscode.Location[];
  visitStruct(node: vjass_ast.Struct | vjass_ast.zinc.Struct, context: DefinitionContext): vscode.Location[];
  visitInterface(node: vjass_ast.Interface | vjass_ast.zinc.Interface, context: DefinitionContext): vscode.Location[];
  visitModule(node: vjass_ast.Module, context: DefinitionContext): vscode.Location[];
  visitVjassModuleImplementation(node: vjass_ast.VjassModuleImplementation, context: DefinitionContext): vscode.Location[];
  visitLocal(node: vjass_ast.Local | vjass_ast.zinc.Member, context: DefinitionContext): vscode.Location[];
  visitMember(node: vjass_ast.Member | vjass_ast.zinc.Member, context: DefinitionContext): vscode.Location[];
  visitLibrary(node: vjass_ast.Library | any, context: DefinitionContext): vscode.Location[];
  visitScope(node: vjass_ast.Scope, context: DefinitionContext): vscode.Location[];
  visitType(node: vjass_ast.Type, context: DefinitionContext): vscode.Location[];
  visitTake(node: vjass_ast.Take, context: DefinitionContext): vscode.Location[];
  visitMacro(node: any, context: DefinitionContext): vscode.Location[];
}

/**
 * 增强的 Location 类，包含 AST 节点数据
 */
class PackageLocation<T extends vjass_ast.NodeAst> extends vscode.Location {
  public readonly key: string;
  public readonly data: T;

  constructor(data: T, uri: vscode.Uri, rangeOrPosition: vscode.Range | vscode.Position) {
    super(uri, rangeOrPosition);
    this.data = data;
    this.key = this.extractKey(data);
  }

  /**
   * 从 AST 节点提取键名
   */
  private extractKey(data: T): string {
    if (this.hasNameProperty(data)) {
      return data.name ? data.name.getText() : "";
    }
    return "";
  }

  /**
   * 检查节点是否有 name 属性
   */
  private hasNameProperty(data: any): data is { name?: any } {
    return data instanceof vjass_ast.Native
      || data instanceof vjass_ast.Func
      || data instanceof vjass_ast.Struct
      || data instanceof vjass_ast.Interface
      || data instanceof vjass_ast.Method
      || data instanceof vjass_ast.Local
      || data instanceof vjass_ast.GlobalVariable
      || data instanceof vjass_ast.Member
      || data instanceof vjass_ast.Library
      || data instanceof vjass_ast.Scope
      || data instanceof vjass_ast.Library
      || data instanceof vjass_ast.zinc.Struct
      || data instanceof vjass_ast.zinc.Func
      || data instanceof vjass_ast.zinc.Interface
      || data instanceof vjass_ast.zinc.Method
      || data instanceof vjass_ast.zinc.Member
      || data instanceof vjass_ast.Type;
  }
}
/**
 * 默认 Definition 访问者实现
 */
class DefaultDefinitionVisitor implements DefinitionVisitor {
  visitNative(node: vjass_ast.Native, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createNativeLocation(node)];
    }
    return [];
  }

  visitFunction(node: vjass_ast.Func | vjass_ast.zinc.Func, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createFunctionLocation(node)];
    }
    return [];
  }

  visitMethod(node: vjass_ast.Method | vjass_ast.zinc.Method, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMethodLocation(node)];
    }
    return [];
  }

  visitStruct(node: vjass_ast.Struct | vjass_ast.zinc.Struct, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createStructLocation(node)];
    }
    return [];
  }

  visitInterface(node: vjass_ast.Interface | vjass_ast.zinc.Interface, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createInterfaceLocation(node)];
    }
    return [];
  }

  visitModule(node: vjass_ast.Module, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createModuleLocation(node)];
    }
    return [];
  }

  visitVjassModuleImplementation(node: vjass_ast.VjassModuleImplementation, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createVjassModuleImplementationLocation(node)];
    }
    return [];
  }

  visitLocal(node: vjass_ast.Local | vjass_ast.zinc.Member, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createLocalLocation(node)];
    }
    return [];
  }

  visitMember(node: vjass_ast.Member | vjass_ast.zinc.Member, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMemberLocation(node)];
    }
    return [];
  }

  visitLibrary(node: vjass_ast.Library | any, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createLibraryLocation(node)];
    }
    return [];
  }

  visitScope(node: vjass_ast.Scope, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createScopeLocation(node)];
    }
    return [];
  }

  visitType(node: vjass_ast.Type, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createTypeLocation(node)];
    }
    return [];
  }

  visitTake(node: vjass_ast.Take, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createTakeLocation(node)];
    }
    return [];
  }

  visitMacro(node: any, context: DefinitionContext): vscode.Location[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMacroLocation(node)];
    }
    return [];
  }

  /**
   * 检查节点是否匹配键名
   */
  private matchesKey(node: any, key: string): boolean {
    if (node.name && node.name.getText() === key) {
      return true;
    }
    if (node.key && node.key === key) {
      return true;
    }
    return false;
  }

  /**
   * 创建 Native Location
   */
  private createNativeLocation(node: vjass_ast.Native): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Function Location
   */
  private createFunctionLocation(node: vjass_ast.Func | vjass_ast.zinc.Func): vscode.Location {
    return this.createNativeLocation(node as any) as PackageLocation<vjass_ast.Func | vjass_ast.zinc.Func>;
  }

  /**
   * 创建 Method Location
   */
  private createMethodLocation(node: vjass_ast.Method | vjass_ast.zinc.Method): vscode.Location {
    return this.createNativeLocation(node as any) as PackageLocation<vjass_ast.Method | vjass_ast.zinc.Method>;
  }

  /**
   * 创建 Struct Location
   */
  private createStructLocation(node: vjass_ast.Struct | vjass_ast.zinc.Struct): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Interface Location
   */
  private createInterfaceLocation(node: vjass_ast.Interface | vjass_ast.zinc.Interface): vscode.Location {
    return this.createStructLocation(node as any) as PackageLocation<vjass_ast.Interface | vjass_ast.zinc.Interface>;
  }

  /**
   * 创建 Module Location
   */
  private createModuleLocation(node: vjass_ast.Module): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 VjassModuleImplementation Location
   */
  private createVjassModuleImplementationLocation(node: vjass_ast.VjassModuleImplementation): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Local Location
   */
  private createLocalLocation(node: vjass_ast.Local | vjass_ast.zinc.Member): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Member Location
   */
  private createMemberLocation(node: vjass_ast.Member | vjass_ast.zinc.Member): vscode.Location {
    return this.createLocalLocation(node);
  }

  /**
   * 创建 Library Location
   */
  private createLibraryLocation(node: vjass_ast.Library | any): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Scope Location
   */
  private createScopeLocation(node: vjass_ast.Scope): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Type Location
   */
  private createTypeLocation(node: vjass_ast.Type): vscode.Location {
    return new PackageLocation(node, vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.start.line, node.start.position),
        new vscode.Position(node.end.line, node.end.position)
      )
    );
  }

  /**
   * 创建 Take Location
   */
  private createTakeLocation(node: vjass_ast.Take): vscode.Location {
    return new TakeLocation(node, vscode.Uri.file(node.belong.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.type?.line ?? 0, node.type?.character ?? 0),
        new vscode.Position(node.name?.line ?? 0, node.name?.character ?? 0)
      )
    );
  }

  /**
   * 创建 Macro Location
   */
  private createMacroLocation(node: any): vscode.Location {
    return new vscode.Location(vscode.Uri.file(node.document.filePath), 
      new vscode.Range(
        new vscode.Position(node.line_number, 0),
        new vscode.Position(node.line_number, node.length)
      )
    );
  }
}

class TakeLocation extends vscode.Location {
  public readonly data:vjass_ast.Take;
  constructor(data:vjass_ast.Take, uri: vscode.Uri, rangeOrPosition: vscode.Range | vscode.Position) {
    super(uri, rangeOrPosition);
    this.data = data;
  }
}

class LocationDocument {
  // public readonly document:vscode.TextDocument;
  public readonly program:vjass.Document;

  public readonly native_items:PackageLocation<vjass_ast.Native>[];
  public readonly function_items:PackageLocation<vjass_ast.Func|vjass_ast.zinc.Func>[];
  public readonly struct_items:PackageLocation<vjass_ast.Struct|vjass_ast.zinc.Struct>[];
  public readonly interface_items:PackageLocation<vjass_ast.Interface|vjass_ast.zinc.Interface>[];
  public readonly method_items:PackageLocation<vjass_ast.Method|vjass_ast.zinc.Method>[];
  public readonly local_items:PackageLocation<vjass_ast.Local|vjass_ast.zinc.Member>[];
  // Commented out globals-related code
  // public readonly global_variable_items:PackageLocation<vjass_ast.GlobalVariable|vjass_ast.zinc.Member>[];
  public readonly membere_items:PackageLocation<vjass_ast.Member|vjass_ast.zinc.Member>[];
  public readonly library_items:PackageLocation<vjass_ast.Library|vjass_ast.Library>[];
  public readonly scope_items:PackageLocation<vjass_ast.Scope>[];
  public readonly types_items:PackageLocation<vjass_ast.Type>[];
  public readonly define_items:vscode.Location[];
  // public readonly take_items:TakeCompletionItem[];

  constructor(program:vjass.Document) {
    // this.document = document;
    this.program = program;

    this.native_items = this.program.get_all_natives().map((node: any) => LocationDocument.native_to_hover(node));
    this.function_items = this.program.get_all_functions().map((node: any) => LocationDocument.function_to_hover(node));
    this.struct_items = this.program.get_all_structs().map((node: any) => this.struct_to_hover(node));
    this.interface_items = this.program.get_all_interfaces().map((node: any) => this.interface_to_hover(node));
    this.method_items = this.program.get_all_methods().map((node: any) => LocationDocument.method_to_hover(node));
    this.local_items = this.program.get_all_locals().map((node: any) => LocationDocument.local_to_hover(node));
    // Commented out globals-related code
    // this.global_variable_items = this.program.global_variables.map(node => this.global_variable_to_hover(node));
    this.membere_items = this.program.get_all_members().map((node: any) => LocationDocument.member_to_hover(node));
    this.library_items = this.program.get_all_libraries().map((node: any) => this.library_to_hover(node));
    this.scope_items = this.program.get_all_scopes().map((node: any) => this.scope_to_hover(node));
    this.types_items = this.program.get_all_types().map((node: any) => this.type_to_hover(node));
    this.define_items = (this.program as any).macros?.map((macro: any) => LocationDocument.define_to_hover(macro)) || [];
    // this.take_items = [
    //   ...(this.program.functions.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    //   ...(this.program.methods.filter(x => !!x).map(x => x.takes as vjass_ast.Take[])),
    // ].flat().map(node => this.take_to_hover(node));
  }


  public static  native_to_hover(object: vjass_ast.Native) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }

  public static  function_to_hover(func: vjass_ast.Func|vjass_ast.zinc.Func) {
    // @ts-ignore
    return this.native_to_hover(func) as PackageLocation<vjass_ast.Func|vjass_ast.zinc.Func>;
  }
  
  public static method_to_hover(func: vjass_ast.Method|vjass_ast.zinc.Method) {
    // @ts-ignore
    return this.native_to_hover(func) as PackageLocation<vjass_ast.Method|vjass_ast.zinc.Method>;
  }
  private type_to_hover(type: vjass_ast.Type) {
    const item = new PackageLocation(type, vscode.Uri.file(type.document.filePath), new vscode.Range(new vscode.Position(type.start.line, type.start.position), new vscode.Position(type.end.line, type.end.position)));

    return item;
  }
  private interface_to_hover(inter: vjass_ast.Interface|vjass_ast.zinc.Interface) {
    return this.struct_to_hover(inter as any) as PackageLocation<vjass_ast.Interface>;
  }
  private library_to_hover(object: vjass_ast.Library|any) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  private scope_to_hover(object: vjass_ast.Scope) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  private struct_to_hover(object: vjass_ast.Struct|vjass_ast.zinc.Struct) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  public static local_to_hover(object: vjass_ast.Local|vjass_ast.zinc.Member) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  // Commented out globals-related code
  /*
  private global_variable_to_hover(object: vjass_ast.GlobalVariable|vjass_ast.zinc.Member) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  */
  public static member_to_hover(object: vjass_ast.Member|vjass_ast.zinc.Member) {
    const item = new PackageLocation(object, vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.start.line, object.start.position), new vscode.Position(object.end.line, object.end.position)));

    return item;
  }
  public static take_to_hover(object: vjass_ast.Take) {
    const item = new TakeLocation(object, vscode.Uri.file(object.belong.document.filePath), new vscode.Range(new vscode.Position(object.type?.line ?? 0, object.type?.character ?? 0), new vscode.Position(object.name?.line ?? 0, object.name?.character ?? 0)));

    return item;



  }
  public static define_to_hover(object: any) {
    const item = new vscode.Location(vscode.Uri.file(object.document.filePath), new vscode.Range(new vscode.Position(object.line_number, 0), new vscode.Position(object.line_number, object.length)));

    return item;
  }
}
class Wrap {
  public key: string;
  public document:LocationDocument;

  constructor(key: string, document:LocationDocument) {
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

  constructor () {
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
  
        this.wraps.push(new Wrap(document.uri.fsPath, new LocationDocument(program)));
      } else {
        this.wraps[index].document = new LocationDocument(program);
      }
    }
  }
  add(key: string) {
    const index = this.index_of(key);
    const program = GlobalContext.get(key);
    // const document = vscode.workspace.textDocuments.find(document => equals_file_path(document.uri.fsPath, key));
    if (program) {
      if (index == -1) {
        this.wraps.push(new Wrap(key, new LocationDocument(program)));
      } else {
        this.wraps[index].document = new LocationDocument(program);
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
    this.set(document);
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

const LocationManage = new Manage();

export const init_document_difinition = (key: string) => {
  LocationManage.add(key);
};

export const change_document_difinition = (document: vscode.TextDocument) => {
  LocationManage.changed(document);
};

export const delete_document_difinition = (file_name:string) => {
  LocationManage.delete(file_name);
};
export const rename_document_difinition = (origin_key: string, target_kay: string) => {
  LocationManage.rename(origin_key, target_kay);
};

/**
 * 增强的 Definition 提供者，使用 visitor 模式
 */
export class NewDefinitionProvider implements vscode.DefinitionProvider {
  private readonly visitor: DefinitionVisitor;
  private readonly maxLength = 255;

  constructor() {
    this.visitor = new DefaultDefinitionVisitor();
  }

  /**
   * 检查是否为数字
   */
  private isNumber(val: string): boolean {
    const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
    const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
    return regPos.test(val) || regNeg.test(val);
  }

  /**
   * 提供定义位置
   */
  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const key = document.getText(document.getWordRangeAtPosition(position));

    // 验证输入
    if (key.length > this.maxLength || this.isNumber(key) || AllKeywords.includes(key)) {
      return null;
    }

    // 创建上下文
    const context: DefinitionContext = {
      document,
      position,
      key,
      locationCache: new Map<string, vscode.Location[]>()
    };

    const locations: vscode.Location[] = [];

    // 遍历所有文档
    GlobalContext.keys.forEach(filePath => {
      const program = GlobalContext.get(filePath);
      if (!program) return;

      // 使用 visitor 模式处理各种节点类型
      this.processDocument(program, context, locations);

      // 如果是当前文档，处理局部变量和参数
      if (filePath === document.uri.fsPath) {
        this.processLocalContext(program, context, locations);
      }
    });

    return locations.length > 0 ? locations : null;
  }

  /**
   * 处理文档中的所有节点
   */
  private processDocument(program: vjass.Document, context: DefinitionContext, locations: vscode.Location[]): void {
    // 处理 natives
    const natives = program.get_all_natives();
    natives.forEach((native: any) => {
      locations.push(...this.visitor.visitNative(native, context));
    });

    // 处理 functions
    const functions = program.get_all_functions();
    functions.forEach((func: any) => {
      locations.push(...this.visitor.visitFunction(func, context));
    });

    // 处理 methods
    const methods = program.get_all_methods();
    methods.forEach((method: any) => {
      locations.push(...this.visitor.visitMethod(method, context));
    });

    // 处理 structs
    const structs = program.get_all_structs();
    structs.forEach((struct: any) => {
      locations.push(...this.visitor.visitStruct(struct, context));
    });

    // 处理 interfaces
    const interfaces = program.get_all_interfaces();
    interfaces.forEach((interface_: any) => {
      locations.push(...this.visitor.visitInterface(interface_, context));
    });

    // 处理 modules
    const modules = program.get_all_modules();
    modules.forEach((module: any) => {
      locations.push(...this.visitor.visitModule(module, context));
    });

    // 处理 members
    const members = program.get_all_members();
    members.forEach((member: any) => {
      locations.push(...this.visitor.visitMember(member, context));
    });

    // 处理 libraries
    const libraries = program.get_all_libraries();
    libraries.forEach((library: any) => {
      locations.push(...this.visitor.visitLibrary(library, context));
    });

    // 处理 scopes
    const scopes = program.get_all_scopes();
    scopes.forEach((scope: any) => {
      locations.push(...this.visitor.visitScope(scope, context));
    });

    // 处理 types
    const types = program.get_all_types();
    types.forEach((type: any) => {
      locations.push(...this.visitor.visitType(type, context));
    });

    // 处理 macros
    const macros = (program as any).macros || [];
    macros.forEach((macro: any) => {
      locations.push(...this.visitor.visitMacro(macro, context));
    });
  }

  /**
   * 处理局部上下文（当前文档中的局部变量和参数）
   */
  private processLocalContext(program: vjass.Document, context: DefinitionContext, locations: vscode.Location[]): void {
    const targetPosition = new Position(context.position.line, context.position.character);

    // 查找包含当前位置的函数和方法
    const functions = program.get_all_functions();
    const methods = program.get_all_methods();
    
    const containingFunctions = [...functions, ...methods].filter((func: any) => {
      return func.contains && func.contains(targetPosition);
    });

    containingFunctions.forEach((func: any) => {
      // 处理参数
      if (func.takes) {
        func.takes.forEach((take: any) => {
          locations.push(...this.visitor.visitTake(take, context));
        });
      }

      // 处理局部变量
      if (func.children) {
        const locals = func.children.filter((child: any) => 
          child instanceof vjass_ast.Local || child instanceof vjass_ast.zinc.Member
        );
        locals.forEach((local: any) => {
          locations.push(...this.visitor.visitLocal(local, context));
        });
      }
    });
  }
}

vscode.languages.registerDefinitionProvider("jass", new NewDefinitionProvider());

/**
 * 增强的 Type Definition 提供者，使用 visitor 模式
 */
export class TypeDefinitionProvider implements vscode.TypeDefinitionProvider {
  private readonly visitor: DefinitionVisitor;
  private readonly maxLength = 255;

  constructor() {
    this.visitor = new DefaultDefinitionVisitor();
  }

  /**
   * 检查是否为数字
   */
  private isNumber(val: string): boolean {
    const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
    const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
    return regPos.test(val) || regNeg.test(val);
  }

  /**
   * 提供类型定义位置
   */
  provideTypeDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    const key = document.getText(document.getWordRangeAtPosition(position));

    // 验证输入
    if (key.length > this.maxLength || this.isNumber(key) || AllKeywords.includes(key)) {
      return null;
    }

    // 创建上下文
    const context: DefinitionContext = {
      document,
      position,
      key,
      locationCache: new Map<string, vscode.Location[]>()
    };

    const locations: vscode.Location[] = [];

    // 遍历所有文档，只处理类型相关的节点
    GlobalContext.keys.forEach(filePath => {
      const program = GlobalContext.get(filePath);
      if (!program) return;

      // 处理 structs
      const structs = program.get_all_structs();
      structs.forEach((struct: any) => {
        locations.push(...this.visitor.visitStruct(struct, context));
      });

      // 处理 interfaces
      const interfaces = program.get_all_interfaces();
      interfaces.forEach((interface_: any) => {
        locations.push(...this.visitor.visitInterface(interface_, context));
      });

      // 处理 types
      const types = program.get_all_types();
      types.forEach((type: any) => {
        locations.push(...this.visitor.visitType(type, context));
      });
    });

    return locations.length > 0 ? locations : null;
  }
}

export class SpecialDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
    if (!vscode.workspace.getConfiguration("jass").get<boolean>("literal")) {
      return null;
    }
      const key = document.getText(document.getWordRangeAtPosition(position));
      const locations = new Array<vscode.Location>();
      GlobalContext.keys.forEach(k => {
          const program = GlobalContext.get(k);
          if (program) {
            if (program.is_special) {
              const value_node = program.program;
              if (value_node) {
                value_node.children.forEach(x => {
                  
                  if (x instanceof vjass_ast.JassDetail) {
                    if (x.content == key) {
                      const location = new vscode.Location(vscode.Uri.file(program.filePath), new vscode.Range(x.start.line, x.start.position, x.end.line, x.end.position));
                      locations.push(location);
                    }
                  }
                });
              }
            }
          }
        });
        return locations;
  }

}

export class IncludeDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    const locations = new Array<vscode.Location>();

    const tokens = tokenize(document.lineAt(position).text);
    if (tokens.length >= 2 && tokens[0].value == "#include" && tokens[1].isString()) {
      const key = tokens[1].value;

      console.log("file key: " + key);

      const prefixContent = key.substring(1, key.length - 1);

      const currentFileDir = () => {
        return path.parse(document.uri.fsPath).dir;
      };

      const realPath = path.isAbsolute(prefixContent) ? path.resolve(prefixContent) : path.resolve(currentFileDir(), prefixContent);
      const stat = fs.statSync(realPath);
      if (stat.isFile()) {
        const location = new vscode.Location(vscode.Uri.file(realPath), new vscode.Range(0, 0, 0, 0));
        locations.push(location);
      } else if (stat.isDirectory()) {
        const paths = fs.readdirSync(realPath);
        paths.forEach((p) => {
          const filePath = path.resolve(realPath, p);
          if (fs.statSync(filePath).isDirectory()) {
          } else if (isJFile(filePath) || isZincFile(filePath) || isAiFile(filePath) || isLuaFile(filePath)) {
            const location = new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(0, 0, 0, 0));
            locations.push(location);
          }
        });
      }
    } else {
      return null;
    }

    return locations;
  }

}





