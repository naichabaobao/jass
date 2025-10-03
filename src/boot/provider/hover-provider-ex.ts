import * as path from "path";
import * as vscode from "vscode";

import { GlobalContext } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import * as vjass from "../jass/tokenizer-common";
import { AllKeywords } from "../jass/keyword";
import { Position } from "../jass/loc";

/**
 * Hover 上下文接口
 */
interface HoverContext {
  document: vscode.TextDocument;
  position: vscode.Position;
  key: string;
  hoverCache: Map<string, vscode.Hover[]>;
}

/**
 * Hover 访问者接口
 */
interface HoverVisitor {
  visitNative(node: vjass_ast.Native, context: HoverContext): vscode.Hover[];
  visitFunction(node: vjass_ast.Func | vjass_ast.zinc.Func, context: HoverContext): vscode.Hover[];
  visitMethod(node: vjass_ast.Method | vjass_ast.zinc.Method, context: HoverContext): vscode.Hover[];
  visitStruct(node: vjass_ast.Struct | vjass_ast.zinc.Struct, context: HoverContext): vscode.Hover[];
  visitInterface(node: vjass_ast.Interface | vjass_ast.zinc.Interface, context: HoverContext): vscode.Hover[];
  visitLocal(node: vjass_ast.Local | vjass_ast.zinc.Member, context: HoverContext): vscode.Hover[];
  visitMember(node: vjass_ast.Member | vjass_ast.zinc.Member, context: HoverContext): vscode.Hover[];
  visitLibrary(node: vjass_ast.Library | any, context: HoverContext): vscode.Hover[];
  visitScope(node: vjass_ast.Scope, context: HoverContext): vscode.Hover[];
  visitTake(node: vjass_ast.Take, context: HoverContext): vscode.Hover[];
  visitMacro(node: any, context: HoverContext): vscode.Hover[];
}

/**
 * 增强的 Hover 类，包含 AST 节点数据
 */
class PackageHover<T extends vjass_ast.NodeAst> extends vscode.Hover {
  public readonly key: string;
  public readonly data: T;

  constructor(
    data: T, 
    contents: vscode.MarkdownString | vscode.MarkedString | (vscode.MarkdownString | vscode.MarkedString)[], 
    range?: vscode.Range
  ) {
    super(contents, range);
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
      || (data as any).constructor?.name === 'Library'
      || data instanceof vjass_ast.zinc.Struct
      || data instanceof vjass_ast.zinc.Func
      || data instanceof vjass_ast.zinc.Interface
      || data instanceof vjass_ast.zinc.Method
      || data instanceof vjass_ast.zinc.Member
      || data instanceof vjass_ast.Type;
  }
}
/**
 * 默认 Hover 访问者实现
 */
class DefaultHoverVisitor implements HoverVisitor {
  visitNative(node: vjass_ast.Native, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createNativeHover(node)];
    }
    return [];
  }

  visitFunction(node: vjass_ast.Func | vjass_ast.zinc.Func, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createFunctionHover(node)];
    }
    return [];
  }

  visitMethod(node: vjass_ast.Method | vjass_ast.zinc.Method, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMethodHover(node)];
    }
    return [];
  }

  visitStruct(node: vjass_ast.Struct | vjass_ast.zinc.Struct, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createStructHover(node)];
    }
    return [];
  }

  visitInterface(node: vjass_ast.Interface | vjass_ast.zinc.Interface, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createInterfaceHover(node)];
    }
    return [];
  }

  visitLocal(node: vjass_ast.Local | vjass_ast.zinc.Member, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createLocalHover(node)];
    }
    return [];
  }

  visitMember(node: vjass_ast.Member | vjass_ast.zinc.Member, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMemberHover(node)];
    }
    return [];
  }

  visitLibrary(node: vjass_ast.Library | any, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createLibraryHover(node)];
    }
    return [];
  }

  visitScope(node: vjass_ast.Scope, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createScopeHover(node)];
    }
    return [];
  }

  visitTake(node: vjass_ast.Take, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createTakeHover(node)];
    }
    return [];
  }

  visitMacro(node: any, context: HoverContext): vscode.Hover[] {
    if (this.matchesKey(node, context.key)) {
      return [this.createMacroHover(node)];
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
   * 创建 Native Hover
   */
  private createNativeHover(node: vjass_ast.Native): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());
    
    if (node.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    node.description.forEach((desc: any) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    node.takes?.forEach(take => {
      const desc = take.desciprtion;
      if (desc) {
        ms.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
        ms.appendText("\n");
      }
    });

    return new PackageHover(node, ms, new vscode.Range(
      new vscode.Position(node.start.line, node.start.position),
      new vscode.Position(node.end.line, node.end.position)
    ));
  }

  /**
   * 创建 Function Hover
   */
  private createFunctionHover(node: vjass_ast.Func | vjass_ast.zinc.Func): vscode.Hover {
    return this.createNativeHover(node as any) as PackageHover<vjass_ast.Func | vjass_ast.zinc.Func>;
  }

  /**
   * 创建 Method Hover
   */
  private createMethodHover(node: vjass_ast.Method | vjass_ast.zinc.Method): vscode.Hover {
    return this.createNativeHover(node as any) as PackageHover<vjass_ast.Method | vjass_ast.zinc.Method>;
  }

  /**
   * 创建 Struct Hover
   */
  private createStructHover(node: vjass_ast.Struct | vjass_ast.zinc.Struct): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());
    
    if (node.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    node.description.forEach((desc: any) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    return new PackageHover(node, ms, new vscode.Range(
      new vscode.Position(node.start.line, node.start.position),
      new vscode.Position(node.end.line, node.end.position)
    ));
  }

  /**
   * 创建 Interface Hover
   */
  private createInterfaceHover(node: vjass_ast.Interface | vjass_ast.zinc.Interface): vscode.Hover {
    return this.createStructHover(node as any) as PackageHover<vjass_ast.Interface | vjass_ast.zinc.Interface>;
  }

  /**
   * 创建 Local Hover
   */
  private createLocalHover(node: vjass_ast.Local | vjass_ast.zinc.Member): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());
    
    if (node.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    node.description.forEach((desc: any) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    return new PackageHover(node, ms, new vscode.Range(
      new vscode.Position(node.start.line, node.start.position),
      new vscode.Position(node.end.line, node.end.position)
    ));
  }

  /**
   * 创建 Member Hover
   */
  private createMemberHover(node: vjass_ast.Member | vjass_ast.zinc.Member): vscode.Hover {
    return this.createLocalHover(node);
  }

  /**
   * 创建 Library Hover
   */
  private createLibraryHover(node: vjass_ast.Library | any): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());
    
    if (node.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    node.description.forEach((desc: any) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    return new PackageHover(node, ms, new vscode.Range(
      new vscode.Position(node.start.line, node.start.position),
      new vscode.Position(node.end.line, node.end.position)
    ));
  }

  /**
   * 创建 Scope Hover
   */
  private createScopeHover(node: vjass_ast.Scope): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());
    
    if (node.is_deprecated) {
      ms.appendMarkdown(`***@deprecated***`);
      ms.appendText("\n");
    }

    node.description.forEach((desc: any) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    return new PackageHover(node, ms, new vscode.Range(
      new vscode.Position(node.start.line, node.start.position),
      new vscode.Position(node.end.line, node.end.position)
    ));
  }

  /**
   * 创建 Take Hover
   */
  private createTakeHover(node: vjass_ast.Take): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.belong.document.filePath);
    ms.appendMarkdown("## " + (node.name ? node.name.getText() : "(unknown)"));
    ms.appendText("\n");
    ms.appendText(`>_${node.belong.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());

    const param_desc = node.belong.get_param_descriptions().find(x => node.name && x.name == node.name.getText());
    if (param_desc) {
      ms.appendMarkdown(param_desc.content);
      ms.appendText("\n");
    }

    node.belong.description.forEach(desc => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });

    return new TakeHover(node, ms, new vscode.Range(
      new vscode.Position(node.belong.start.line, node.belong.start.position),
      new vscode.Position(node.belong.end.line, node.belong.end.position)
    ));
  }

  /**
   * 创建 Macro Hover
   */
  private createMacroHover(node: any): vscode.Hover {
    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendMarkdown("## " + (node.key || ""));
    ms.appendText("\n");
    ms.appendText(`>_${node.document.filePath}`);
    ms.appendText("\n");
    ms.appendCodeblock(node.to_string());

    return new vscode.Hover(ms, new vscode.Range(
      new vscode.Position(node.line_number, 0),
      new vscode.Position(node.line_number, node.length)
    ));
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
  public readonly library_items:PackageHover<vjass_ast.Library|vjass_ast.Library>[];
  public readonly scope_items:PackageHover<vjass_ast.Scope>[];
  public readonly define_items:vscode.Hover[];
  // public readonly take_items:TakeCompletionItem[];

  constructor(program:vjass.Document) {
    // this.document = document;
    this.program = program;

    this.native_items = this.program.get_all_natives().map((node: any) => HoverDocument.native_to_hover(node));
    this.function_items = this.program.get_all_functions().map((node: any) => HoverDocument.function_to_hover(node));
    this.struct_items = this.program.get_all_structs().map((node: any) => this.struct_to_hover(node));
    this.interface_items = this.program.get_all_interfaces().map((node: any) => this.interface_to_hover(node));
    this.method_items = this.program.get_all_methods().map((node: any) => HoverDocument.method_to_hover(node));
    this.local_items = this.program.get_all_locals().map((node: any) => HoverDocument.local_to_hover(node));
    // Commented out globals-related code
    // this.global_variable_items = this.program.global_variables.map(node => this.global_variable_to_hover(node));
    this.membere_items = this.program.get_all_members().map((node: any) => HoverDocument.member_to_hover(node));
    this.library_items = this.program.get_all_libraries().map((node: any) => this.library_to_hover(node));
    this.scope_items = this.program.get_all_scopes().map((node: any) => this.scope_to_hover(node));
    this.define_items = (this.program as any).macros?.map((macro: any) => HoverDocument.define_to_hover(macro)) || [];
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
    return this.struct_to_hover(inter as any) as PackageHover<vjass_ast.Interface|vjass_ast.zinc.Interface>;
  }
  private library_to_hover(object: vjass_ast.Library|any) {
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

    object.description.forEach((desc: any) => {
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

    object.description.forEach((desc: any) => {
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
  public static define_to_hover(object: any) {
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

/**
 * 增强的 Hover 提供者，使用 visitor 模式
 */
class HoverProvider implements vscode.HoverProvider {
  private readonly visitor: HoverVisitor;
  private readonly maxLength = 526;

  constructor() {
    this.visitor = new DefaultHoverVisitor();
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
   * 提供 Hover 信息
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const key = document.getText(document.getWordRangeAtPosition(position));

    // 验证输入
    if (key.length > this.maxLength || this.isNumber(key) || AllKeywords.includes(key)) {
      return null;
    }

    // 创建上下文
    const context: HoverContext = {
      document,
      position,
      key,
      hoverCache: new Map<string, vscode.Hover[]>()
    };

    const hovers: vscode.Hover[] = [];

    // 遍历所有文档
    GlobalContext.keys.forEach(filePath => {
      const program = GlobalContext.get(filePath);
      if (!program) return;

      // 使用 visitor 模式处理各种节点类型
      this.processDocument(program, context, hovers);

      // 如果是当前文档，处理局部变量和参数
      if (filePath === document.uri.fsPath) {
        this.processLocalContext(program, context, hovers);
      }
    });

    if (hovers.length === 0) {
      return null;
    }

    return new vscode.Hover(hovers.map(hover => hover.contents).flat());
  }

  /**
   * 处理文档中的所有节点
   */
  private processDocument(program: vjass.Document, context: HoverContext, hovers: vscode.Hover[]): void {
    // 处理 natives
    const natives = program.get_all_natives();
    natives.forEach((native: any) => {
      hovers.push(...this.visitor.visitNative(native, context));
    });

    // 处理 functions
    const functions = program.get_all_functions();
    functions.forEach((func: any) => {
      hovers.push(...this.visitor.visitFunction(func, context));
    });

    // 处理 methods
    const methods = program.get_all_methods();
    methods.forEach((method: any) => {
      hovers.push(...this.visitor.visitMethod(method, context));
    });

    // 处理 structs
    const structs = program.get_all_structs();
    structs.forEach((struct: any) => {
      hovers.push(...this.visitor.visitStruct(struct, context));
    });

    // 处理 interfaces
    const interfaces = program.get_all_interfaces();
    interfaces.forEach((interface_: any) => {
      hovers.push(...this.visitor.visitInterface(interface_, context));
    });

    // 处理 members
    const members = program.get_all_members();
    members.forEach((member: any) => {
      hovers.push(...this.visitor.visitMember(member, context));
    });

    // 处理 libraries
    const libraries = program.get_all_libraries();
    libraries.forEach((library: any) => {
      hovers.push(...this.visitor.visitLibrary(library, context));
    });

    // 处理 scopes
    const scopes = program.get_all_scopes();
    scopes.forEach((scope: any) => {
      hovers.push(...this.visitor.visitScope(scope, context));
    });

    // 处理 macros
    const macros = (program as any).macros || [];
    macros.forEach((macro: any) => {
      hovers.push(...this.visitor.visitMacro(macro, context));
    });
  }

  /**
   * 处理局部上下文（当前文档中的局部变量和参数）
   */
  private processLocalContext(program: vjass.Document, context: HoverContext, hovers: vscode.Hover[]): void {
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
          hovers.push(...this.visitor.visitTake(take, context));
        });
      }

      // 处理局部变量
      if (func.children) {
        const locals = func.children.filter((child: any) => 
          child instanceof vjass_ast.Local || child instanceof vjass_ast.zinc.Member
        );
        locals.forEach((local: any) => {
          hovers.push(...this.visitor.visitLocal(local, context));
        });
      }
    });
  }
}

vscode.languages.registerHoverProvider("jass", new HoverProvider());