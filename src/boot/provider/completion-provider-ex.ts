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
import { TextMacro } from "../vjass/text-macro";
import { Subject } from "../../extern/rxjs";
import { Position } from "../jass/loc";


class PackageCompletionItem<T extends vjass_ast.NodeAst | vjass_ast.zinc.Member> extends vscode.CompletionItem {
  public readonly data: T;
  constructor(data: T, label: string | vscode.CompletionItemLabel, kind?: vscode.CompletionItemKind | undefined) {
    super(label, kind);
    this.data = data;
  }
}
class TakeCompletionItem extends vscode.CompletionItem {
  public readonly data: vjass_ast.Take;
  constructor(data: vjass_ast.Take, label: string | vscode.CompletionItemLabel, kind?: vscode.CompletionItemKind | undefined) {
    super(label, kind);
    this.data = data;
  }
}

class CompletionItemDocument {
  public readonly program: vjass.Document;

  // 懒加载缓存
  private _nativeItems?: PackageCompletionItem<vjass_ast.Native>[];
  private _functionItems?: PackageCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func>[];
  private _structItems?: PackageCompletionItem<vjass_ast.Struct | vjass_ast.zinc.Struct>[];
  private _interfaceItems?: PackageCompletionItem<vjass_ast.Interface | vjass_ast.zinc.Interface>[];
  private _methodItems?: PackageCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method>[];
  private _localItems?: PackageCompletionItem<vjass_ast.Local | vjass_ast.zinc.Member>[];
  private _memberItems?: PackageCompletionItem<vjass_ast.Member | vjass_ast.zinc.Member>[];
  private _libraryItems?: PackageCompletionItem<vjass_ast.Library>[];
  private _scopeItems?: PackageCompletionItem<vjass_ast.Scope>[];
  private _typeItems?: PackageCompletionItem<vjass_ast.Type>[];
  private _defineItems?: vscode.CompletionItem[];

  constructor(program: vjass.Document) {
    this.program = program;
  }

  // 懒加载 getters
  get nativeItems(): PackageCompletionItem<vjass_ast.Native>[] {
    if (!this._nativeItems) {
      this._nativeItems = this.program.get_all_natives().map((node: vjass_ast.Native) => CompletionItemDocument.nativeToItem(node));
    }
    return this._nativeItems;
  }

  get functionItems(): PackageCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func>[] {
    if (!this._functionItems) {
      this._functionItems = this.program.get_all_functions().map((node: vjass_ast.Func | vjass_ast.zinc.Func) => CompletionItemDocument.functionToItem(node));
    }
    return this._functionItems;
  }

  get structItems(): PackageCompletionItem<vjass_ast.Struct | vjass_ast.zinc.Struct>[] {
    if (!this._structItems) {
      this._structItems = this.program.get_all_structs().map((node: vjass_ast.Struct | vjass_ast.zinc.Struct) => this.structToItem(node));
    }
    return this._structItems;
  }

  get interfaceItems(): PackageCompletionItem<vjass_ast.Interface | vjass_ast.zinc.Interface>[] {
    if (!this._interfaceItems) {
      this._interfaceItems = this.program.get_all_interfaces().map((node: vjass_ast.Interface | vjass_ast.zinc.Interface) => this.interfaceToItem(node));
    }
    return this._interfaceItems;
  }

  get methodItems(): PackageCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method>[] {
    if (!this._methodItems) {
      this._methodItems = this.program.get_all_methods().map((node: vjass_ast.Method | vjass_ast.zinc.Method) => CompletionItemDocument.methodToItem(node));
    }
    return this._methodItems;
  }

  get localItems(): PackageCompletionItem<vjass_ast.Local | vjass_ast.zinc.Member>[] {
    if (!this._localItems) {
      this._localItems = this.program.get_all_locals().map((node: vjass_ast.Local | vjass_ast.zinc.Member) => CompletionItemDocument.localToItem(node));
    }
    return this._localItems;
  }

  get memberItems(): PackageCompletionItem<vjass_ast.Member | vjass_ast.zinc.Member>[] {
    if (!this._memberItems) {
      this._memberItems = this.program.get_all_members().map((node: vjass_ast.Member | vjass_ast.zinc.Member) => CompletionItemDocument.memberToItem(node));
    }
    return this._memberItems;
  }

  get libraryItems(): PackageCompletionItem<vjass_ast.Library>[] {
    if (!this._libraryItems) {
      this._libraryItems = this.program.get_all_libraries().map((node: vjass_ast.Library) => this.libraryToItem(node));
    }
    return this._libraryItems;
  }

  get scopeItems(): PackageCompletionItem<vjass_ast.Scope>[] {
    if (!this._scopeItems) {
      this._scopeItems = this.program.get_all_scopes().map((node: vjass_ast.Scope) => this.scopeToItem(node));
    }
    return this._scopeItems;
  }

  get typeItems(): PackageCompletionItem<vjass_ast.Type>[] {
    if (!this._typeItems) {
      this._typeItems = this.program.get_all_types().map((node: vjass_ast.Type) => this.typeToItem(node));
    }
    return this._typeItems;
  }

  get defineItems(): vscode.CompletionItem[] {
    if (!this._defineItems) {
      this._defineItems = this.program.textMacros.map((macro: TextMacro) => CompletionItemDocument.defineToItem(macro));
    }
    return this._defineItems;
  }

  // 清除缓存，当文档更新时调用
  clearCache(): void {
    this._nativeItems = undefined;
    this._functionItems = undefined;
    this._structItems = undefined;
    this._interfaceItems = undefined;
    this._methodItems = undefined;
    this._localItems = undefined;
    this._memberItems = undefined;
    this._libraryItems = undefined;
    this._scopeItems = undefined;
    this._typeItems = undefined;
    this._defineItems = undefined;
  }

  // 公共方法：创建基础 completion item
  private static createBaseItem<T extends vjass_ast.NodeAst>(
    node: T,
    kind: vscode.CompletionItemKind,
    label?: string
  ): PackageCompletionItem<T> {
    const name = (node as any).name?.getText() ?? "(unknown)";
    const item = new PackageCompletionItem(node, label ?? name, kind);
    item.detail = `${name} >_${node.document.filePath}`;

    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendCodeblock((node as any).to_string());

    if ((node as any).description) {
      (node as any).description.forEach((desc: string) => {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    });
    }
    
    item.documentation = ms;

    if ((node as any).is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }

    return item;
  }

  public static nativeToItem(func: vjass_ast.Native): PackageCompletionItem<vjass_ast.Native> {
    const item = this.createBaseItem(func, vscode.CompletionItemKind.Function);
    
    // 添加参数描述
    if ((func as any).takes) {
      (func as any).takes.forEach((take: any) => {
        const desc = take.desciprtion;
        if (desc) {
          const doc = item.documentation as vscode.MarkdownString;
          doc.appendMarkdown(`***@param*** **${desc.name}** *${desc.content}*`);
          doc.appendText("\n");
        }
      });
    }

    if ((func as any).is_constant) {
      item.sortText = "@constant";
    }
    if ((func as any).is_static) {
      item.sortText = "@static";
      item.label = `static ${(func as any).name?.getText() ?? "(unknown)"}`;
      item.insertText = (func as any).name?.getText() ?? "(unknown)";
    }

    return item;
  }

  public static functionToItem(func: vjass_ast.Func | vjass_ast.zinc.Func): PackageCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func> {
    return this.nativeToItem(func as vjass_ast.Native) as PackageCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func>;
  }

  public static methodToItem(func: vjass_ast.Method | vjass_ast.zinc.Method): PackageCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method> {
    return this.nativeToItem(func as vjass_ast.Native) as PackageCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method>;
  }
  private interfaceToItem(inter: vjass_ast.Interface | vjass_ast.zinc.Interface): PackageCompletionItem<vjass_ast.Interface | vjass_ast.zinc.Interface> {
    return CompletionItemDocument.createBaseItem(inter, vscode.CompletionItemKind.Interface);
  }

  private libraryToItem(library: vjass_ast.Library): PackageCompletionItem<vjass_ast.Library> {
    return CompletionItemDocument.createBaseItem(library, vscode.CompletionItemKind.Module);
  }

  private scopeToItem(scope: vjass_ast.Scope): PackageCompletionItem<vjass_ast.Scope> {
    return CompletionItemDocument.createBaseItem(scope, vscode.CompletionItemKind.Field);
  }

  private structToItem(struct: vjass_ast.Struct | vjass_ast.zinc.Struct, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Struct): PackageCompletionItem<vjass_ast.Struct | vjass_ast.zinc.Struct> {
    return CompletionItemDocument.createBaseItem(struct, kind);
  }

  private typeToItem(type: vjass_ast.Type, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Class): PackageCompletionItem<vjass_ast.Type> {
    return CompletionItemDocument.createBaseItem(type, kind);
  }
  public static localToItem(local: vjass_ast.Local | vjass_ast.zinc.Member, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Variable): PackageCompletionItem<vjass_ast.Local | vjass_ast.zinc.Member> {
    return CompletionItemDocument.createBaseItem(local, kind);
  }
  // Commented out globals-related code
  /*
  private global_variable_to_item(global: vjass_ast.GlobalVariable, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Variable) {
    const item = new PackageCompletionItem(global, global.name?.getText() ?? "(unkown)", global.is_constant ? vscode.CompletionItemKind.Constant : kind);
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
  */
  public static memberToItem(member: vjass_ast.Member | vjass_ast.zinc.Member, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.EnumMember): PackageCompletionItem<vjass_ast.Member | vjass_ast.zinc.Member> {
    const item = CompletionItemDocument.createBaseItem(member, kind);
    
    if ((member as any).is_constant) {
      item.sortText = "@constant";
    }

    return item;
  }

  public static takeToItem(take: vjass_ast.Take, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.Property): TakeCompletionItem {
    const item = new TakeCompletionItem(take, (take as any).name?.getText() ?? "(unknown)", kind);
    item.detail = `${(take as any).name?.getText() ?? "(unknown)"} >_${(take as any).belong.document.filePath}`;

    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file((take as any).belong.document.filePath);
    ms.appendCodeblock("//@param\n");
    ms.appendCodeblock((take as any).to_string());

    const paramDesc = (take as any).belong.get_param_descriptions().find((x: any) => (take as any).name && x.name === (take as any).name.getText());
    if (paramDesc) {
      ms.appendMarkdown(paramDesc.content);
      ms.appendText("\n");
    }

    item.documentation = ms;
    return item;
  }

  public static defineToItem(macro: TextMacro, kind: vscode.CompletionItemKind = vscode.CompletionItemKind.User): vscode.CompletionItem {
    const item = new vscode.CompletionItem((macro as any).key ?? "", kind);
    item.detail = `${(macro as any).key ?? ""} >_${(macro as any).document.filePath}`;

    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file((macro as any).document.filePath);
    ms.appendCodeblock((macro as any).to_string());

    item.documentation = ms;
    return item;
  }
}




class DocumentWrapper {
  public key: string;
  public document: CompletionItemDocument;
  public lastModified: number;

  constructor(key: string, document: CompletionItemDocument) {
    this.key = key;
    this.document = document;
    this.lastModified = Date.now();
  }

  public equals(key: string): boolean {
    const thisInfo = path.parse(this.key);
    const otherInfo = path.parse(key);
    return thisInfo.dir === otherInfo.dir && thisInfo.base === otherInfo.base;
  }

  public updateDocument(newDocument: CompletionItemDocument): void {
    this.document = newDocument;
    this.lastModified = Date.now();
  }
}

class CompletionManager {
  private readonly documentCache = new Map<string, DocumentWrapper>();
  private readonly subject = new Subject<vscode.TextDocument>();
  private readonly maxCacheSize = 100; // 最大缓存文档数量

  constructor() {
    this.subject.subscribe((document: vscode.TextDocument) => {
      this.updateDocument(document);
    });
  }

  private getCacheKey(filePath: string): string {
    const parsed = path.parse(filePath);
    return `${parsed.dir}/${parsed.base}`;
  }

  private findWrapper(key: string): DocumentWrapper | undefined {
    const cacheKey = this.getCacheKey(key);
    return this.documentCache.get(cacheKey);
  }

  private evictOldestEntries(): void {
    if (this.documentCache.size <= this.maxCacheSize) {
      return;
    }

    const entries = Array.from(this.documentCache.entries());
    entries.sort((a, b) => a[1].lastModified - b[1].lastModified);
    
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([key]) => {
      this.documentCache.delete(key);
    });
  }

  public has(key: string): boolean {
    return this.findWrapper(key) !== undefined;
  }

  public add(key: string): void {
    const program = GlobalContext.get(key);
    if (!program) {
      return;
    }

    const cacheKey = this.getCacheKey(key);
    const existingWrapper = this.documentCache.get(cacheKey);
    
    if (existingWrapper) {
      existingWrapper.updateDocument(new CompletionItemDocument(program));
      } else {
      this.evictOldestEntries();
      this.documentCache.set(cacheKey, new DocumentWrapper(key, new CompletionItemDocument(program)));
    }
  }

  public updateDocument(document: vscode.TextDocument): void {
    this.add(document.uri.fsPath);
  }

  public delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.documentCache.delete(cacheKey);
  }

  public get(document: vscode.TextDocument): DocumentWrapper | undefined {
    const wrapper = this.findWrapper(document.uri.fsPath);
    if (wrapper) {
      return wrapper;
    }

    // 如果缓存中没有，尝试添加
    this.add(document.uri.fsPath);
    return this.findWrapper(document.uri.fsPath);
  }

  public rename(originKey: string, targetKey: string): void {
    const originCacheKey = this.getCacheKey(originKey);
    const wrapper = this.documentCache.get(originCacheKey);
    
    if (wrapper) {
      this.documentCache.delete(originCacheKey);
      const targetCacheKey = this.getCacheKey(targetKey);
      wrapper.key = targetKey;
      this.documentCache.set(targetCacheKey, wrapper);
    }
  }

  public changed(document: vscode.TextDocument): void {
    this.subject.next(document);
  }

  public getAllWrappers(): DocumentWrapper[] {
    return Array.from(this.documentCache.values());
  }

  public clearCache(): void {
    this.documentCache.clear();
  }
}

const completionManager = new CompletionManager();

export const initDocumentItem = (key: string): void => {
  completionManager.add(key);
};

export const changeDocumentItem = (document: vscode.TextDocument): void => {
  completionManager.changed(document);
};

export const deleteDocumentItem = (fileName: string): void => {
  completionManager.delete(fileName);
};

export const renameDocumentItem = (originKey: string, targetKey: string): void => {
  completionManager.rename(originKey, targetKey);
};

class CompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument, 
    position: vscode.Position, 
    token: vscode.CancellationToken, 
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const items: vscode.CompletionItem[] = [];
    const targetPosition = new Position(position.line, position.character);
    const currentDocumentPath = document.uri.fsPath;

    // 获取所有非特殊文档的包装器
    const wrappers = completionManager.getAllWrappers()
      .filter(wrapper => !wrapper.document.program.is_special);

    for (const wrapper of wrappers) {
      const isCurrentDocument = wrapper.equals(currentDocumentPath);
      
      // 添加通用项目（所有文档都包含）
      items.push(...wrapper.document.defineItems);
      items.push(...wrapper.document.typeItems);

      if (isCurrentDocument) {
        // 当前文档：添加所有项目
        this.addCurrentDocumentItems(items, wrapper, targetPosition);
      } else {
        // 其他文档：只添加公共项目
        this.addPublicItems(items, wrapper);
      }
    }

    return items;
  }

  private addCurrentDocumentItems(
    items: vscode.CompletionItem[], 
    wrapper: DocumentWrapper, 
    targetPosition: Position
  ): void {
    const doc = wrapper.document;
    
    // 添加所有类型的项目
    items.push(...doc.nativeItems);
    items.push(...doc.functionItems);
    items.push(...doc.structItems);
    items.push(...doc.interfaceItems);
    items.push(...doc.libraryItems);
    items.push(...doc.scopeItems);
    items.push(...doc.methodItems);
    items.push(...doc.memberItems);

    // 添加函数和方法内的局部变量和参数
    this.addLocalItems(items, doc, targetPosition);
  }

  private addPublicItems(items: vscode.CompletionItem[], wrapper: DocumentWrapper): void {
    const doc = wrapper.document;
    
    // 只添加公共项目
    items.push(...doc.nativeItems.filter(x => x.data.is_public));
    items.push(...doc.functionItems.filter(x => x.data.is_public));
    items.push(...doc.structItems.filter(x => x.data.is_public));
    items.push(...doc.interfaceItems.filter(x => x.data.is_public));
    items.push(...doc.libraryItems); // 库总是公共的
    items.push(...doc.scopeItems); // 作用域总是公共的
    items.push(...doc.methodItems.filter(x => x.data.is_public));
    items.push(...doc.memberItems.filter(x => x.data.is_public));
  }

  private addLocalItems(
    items: vscode.CompletionItem[], 
    doc: CompletionItemDocument, 
    targetPosition: Position
  ): void {
    // 查找包含目标位置的函数和方法
    const containingFunctions = [
      ...doc.methodItems,
      ...doc.functionItems
    ].filter(item => item.data.contains(targetPosition));

    for (const func of containingFunctions) {
      // 添加参数
      if (func.data.takes) {
        for (const take of func.data.takes) {
          items.push(CompletionItemDocument.takeToItem(take));
        }
      }

      // 添加局部变量
      this.addLocalVariables(items, func, targetPosition);
    }
  }

  private addLocalVariables(
    items: vscode.CompletionItem[], 
    func: PackageCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func | vjass_ast.Method | vjass_ast.zinc.Method>,
    targetPosition: Position
  ): void {
    if (func.data instanceof vjass_ast.Func || func.data instanceof vjass_ast.Method) {
      // JASS 函数/方法
      const locals = func.data.children.filter(child => child instanceof vjass_ast.Local) as vjass_ast.Local[];
      for (const local of locals) {
        if (targetPosition.line > local.start.line) {
          items.push(CompletionItemDocument.localToItem(local, vscode.CompletionItemKind.Variable));
        }
      }
      } else {
      // Zinc 函数/方法
      const locals = func.data.children.filter(child => child instanceof vjass_ast.zinc.Member) as vjass_ast.zinc.Member[];
      for (const local of locals) {
        if (targetPosition.line > local.start.line) {
          items.push(CompletionItemDocument.memberToItem(local, vscode.CompletionItemKind.Variable));
        }
      }
    }
  }
}

// vscode.languages.registerCompletionItemProvider("jass", new CompletionItemProvider());

/**
 * 特殊关键字提示提供器
 */
class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument, 
    position: vscode.Position, 
    token: vscode.CancellationToken, 
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items: vscode.CompletionItem[] = [];

    for (const key of GlobalContext.keys) {
      const program = GlobalContext.get(key);
      if (!program || !program.is_special) {
        continue;
      }

      const valueNode = program.program;
      if (!valueNode) {
        continue;
      }

      for (const child of valueNode.children) {
        if (child instanceof vjass_ast.JassDetail) {
          const item = this.createJassDetailItem(child);
          items.push(item);
        }
      }
    }

    return items;
  }

  private createJassDetailItem(jassDetail: vjass_ast.JassDetail): vscode.CompletionItem {
    const item = new vscode.CompletionItem(jassDetail.label, vscode.CompletionItemKind.Value);
    item.detail = `${jassDetail.label} >_${jassDetail.document.filePath}`;

    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(jassDetail.document.filePath);
    ms.appendCodeblock(jassDetail.label);
    
    for (const desc of jassDetail.description) {
      ms.appendMarkdown(desc);
      ms.appendText("\n");
    }
    
    item.documentation = ms;

    if (jassDetail.is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }

    return item;
  }
}

// 注册关键字完成提供器，触发字符包括所有字母、数字、下划线和特殊字符
const triggerCharacters = [
  "$", "\"", "'", 
  ..."0123456789".split(""),
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split("")
];

// vscode.languages.registerCompletionItemProvider("jass", new KeywordCompletionItemProvider(), ...triggerCharacters);
