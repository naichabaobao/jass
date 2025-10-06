import * as vscode from "vscode";
import * as vjass_ast from "../jass/parser-vjass";
import { AllKeywords } from "../jass/keyword";
import { Types } from "./types";
import { TextMacro } from "../vjass/text-macro";
import { Define } from "../vjass/preprocess";
import { Interface, Module } from "../jass/parser-vjass";


/**
 * 带数据的补全项，继承自 vscode.CompletionItem
 */
export class DataCompletionItem<T extends vjass_ast.NodeAst | vjass_ast.zinc.Member | vjass_ast.Take> extends vscode.CompletionItem {
  public readonly data: T;
  constructor(data: T, label: string | vscode.CompletionItemLabel, kind?: vscode.CompletionItemKind | undefined) {
    super(label, kind);
    this.data = data;
  }
}

/**
 * 补全项生成器 - 采用懒加载和缓存机制
 */
export class CompletionItemGenerator {
  private static instance: CompletionItemGenerator;
  
  // 懒加载缓存
  private _nativeItems?: DataCompletionItem<vjass_ast.Native>[];
  private _functionItems?: DataCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func>[];
  private _globalVariableItems?: DataCompletionItem<vjass_ast.GlobalVariable>[];
  private _structItems?: DataCompletionItem<vjass_ast.Struct | vjass_ast.zinc.Struct>[];
  private _interfaceItems?: DataCompletionItem<vjass_ast.Interface | vjass_ast.zinc.Interface>[];
  private _methodItems?: DataCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method>[];
  private _memberItems?: DataCompletionItem<vjass_ast.Member | vjass_ast.zinc.Member>[];
  private _localItems?: DataCompletionItem<vjass_ast.Local | vjass_ast.zinc.Member>[];
  private _takeItems?: DataCompletionItem<vjass_ast.Take>[];
  private _keywordItems?: vscode.CompletionItem[];
  private _typeItems?: vscode.CompletionItem[];

  private constructor() {}

  public static getInstance(): CompletionItemGenerator {
    if (!CompletionItemGenerator.instance) {
      CompletionItemGenerator.instance = new CompletionItemGenerator();
    }
    return CompletionItemGenerator.instance;
  }

  // 懒加载 getters
  get nativeItems(): DataCompletionItem<vjass_ast.Native>[] {
    if (!this._nativeItems) {
      this._nativeItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._nativeItems;
  }

  get functionItems(): DataCompletionItem<vjass_ast.Func | vjass_ast.zinc.Func>[] {
    if (!this._functionItems) {
      this._functionItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._functionItems;
  }

  get globalVariableItems(): DataCompletionItem<vjass_ast.GlobalVariable>[] {
    if (!this._globalVariableItems) {
      this._globalVariableItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._globalVariableItems;
  }

  get structItems(): DataCompletionItem<vjass_ast.Struct | vjass_ast.zinc.Struct>[] {
    if (!this._structItems) {
      this._structItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._structItems;
  }

  get interfaceItems(): DataCompletionItem<vjass_ast.Interface | vjass_ast.zinc.Interface>[] {
    if (!this._interfaceItems) {
      this._interfaceItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._interfaceItems;
  }

  get methodItems(): DataCompletionItem<vjass_ast.Method | vjass_ast.zinc.Method>[] {
    if (!this._methodItems) {
      this._methodItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._methodItems;
  }

  get memberItems(): DataCompletionItem<vjass_ast.Member | vjass_ast.zinc.Member>[] {
    if (!this._memberItems) {
      this._memberItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._memberItems;
  }

  get localItems(): DataCompletionItem<vjass_ast.Local | vjass_ast.zinc.Member>[] {
    if (!this._localItems) {
      this._localItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._localItems;
  }

  get takeItems(): DataCompletionItem<vjass_ast.Take>[] {
    if (!this._takeItems) {
      this._takeItems = [];
      // 这里需要从 GlobalContext 获取，暂时留空
    }
    return this._takeItems;
  }

  get keywordItems(): vscode.CompletionItem[] {
    if (!this._keywordItems) {
      this._keywordItems = AllKeywords.map(keyword => this.createKeywordItem(keyword));
    }
    return this._keywordItems;
  }

  get typeItems(): vscode.CompletionItem[] {
    if (!this._typeItems) {
      this._typeItems = Types.map(type => this.createTypeItem(type));
    }
    return this._typeItems;
  }

  // 清除缓存，当文档更新时调用
  public clearCache(): void {
    this._nativeItems = undefined;
    this._functionItems = undefined;
    this._globalVariableItems = undefined;
    this._structItems = undefined;
    this._interfaceItems = undefined;
    this._methodItems = undefined;
    this._memberItems = undefined;
    this._localItems = undefined;
    this._takeItems = undefined;
    this._keywordItems = undefined;
    this._typeItems = undefined;
  }

  // 创建基础补全项
  private createBaseItem<T extends vjass_ast.NodeAst>(
    node: T,
    kind: vscode.CompletionItemKind,
    label?: string
  ): DataCompletionItem<T> {
    const name = (node as any).name?.getText() ?? "(unknown)";
    const item = new DataCompletionItem(node, label ?? name, kind);
    item.detail = `${name} >_${node.document.filePath}`;

    const ms = new vscode.MarkdownString();
    ms.baseUri = vscode.Uri.file(node.document.filePath);
    ms.appendCodeblock((node as any).to_string());

    // 添加 JassDocs 支持
    this.addJassDocsToMarkdown(ms, node);
    
    item.documentation = ms;

    if ((node as any).is_deprecated) {
      item.tags = [vscode.CompletionItemTag.Deprecated];
    }

    return item;
  }

  // 添加 JassDocs 支持到 Markdown
  // 支持的 JassDocs 标签：
  // - @param <name> <description> - 参数描述
  // - @returns <description> - 返回值描述  
  // - @deprecated - 废弃标记
  private addJassDocsToMarkdown(ms: vscode.MarkdownString, node: vjass_ast.NodeAst): void {
    // 添加基本描述
    if ((node as any).description) {
      (node as any).description.forEach((desc: string) => {
        ms.appendMarkdown(desc);
        ms.appendText("\n");
      });
    }

    // 添加参数描述（如果有 get_param_descriptions 方法）
    if ((node as any).get_param_descriptions) {
      const paramDescs = (node as any).get_param_descriptions();
      if (paramDescs && paramDescs.length > 0) {
        ms.appendMarkdown("\n**Parameters:**\n");
        paramDescs.forEach((param: any) => {
          if (param.name && param.content) {
            ms.appendMarkdown(`- \`${param.name}\`: ${param.content}\n`);
          }
        });
      }
    }

    // 添加返回值描述（如果有 @returns 注释）
    const returnsComment = this.findReturnsComment(node);
    if (returnsComment) {
      ms.appendMarkdown(`\n**Returns:** ${returnsComment}\n`);
    }

    // 添加废弃标记
    if ((node as any).is_deprecated) {
      ms.appendMarkdown("\n⚠️ **Deprecated**\n");
    }
  }

  // 查找 @returns 注释
  private findReturnsComment(node: vjass_ast.NodeAst): string | null {
    if ((node as any).comments) {
      for (const comment of (node as any).comments) {
        if (comment.comment) {
          const text = comment.comment.getText();
          const returnsMatch = /^\/\/\s*@returns?\s+(.+)/.exec(text);
          if (returnsMatch) {
            return returnsMatch[1].trim();
          }
        }
      }
    }
    return null;
  }

  // 创建关键字补全项
  private createKeywordItem(keyword: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
    item.detail = `keyword: ${keyword}`;
    item.documentation = new vscode.MarkdownString(`JASS keyword: \`${keyword}\``);
    item.insertText = keyword;
    item.sortText = `9_${keyword}`;
    return item;
  }

  // 创建类型补全项
  private createTypeItem(type: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
    item.detail = `type: ${type}`;
    item.documentation = new vscode.MarkdownString(`JASS type: \`${type}\``);
    item.insertText = type;
    item.sortText = `3_${type}`;
    return item;
  }
}


/**
 * 静态转换方法 - 保持向后兼容
 */

/**
 * 将原生函数转换为 VS Code 补全项
 * @param native 原生函数节点
 * @returns VS Code 补全项
 */
export function nativeToItem(native: vjass_ast.Native): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](native, vscode.CompletionItemKind.Function);
  
  // 设置排序优先级（原生函数优先级较高）
  const functionName = native.name?.getText() ?? "(unnamed)";
  item.sortText = `0_${functionName}`;
  
  // 设置插入文本（智能括号）
  if (native.takes && native.takes.length > 0) {
    item.insertText = new vscode.SnippetString(`${functionName}($1)`);
  } else {
    item.insertText = `${functionName}()`;
  }
  
  return item;
}

/**
 * 将函数转换为 VS Code 补全项
 * @param func 函数节点
 * @returns VS Code 补全项
 */
export function functionToItem(func: vjass_ast.Func | vjass_ast.zinc.Func): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](func, vscode.CompletionItemKind.Function);
  
  // 设置排序优先级（用户函数优先级中等）
  const functionName = func.name?.getText() ?? "(unnamed)";
  item.sortText = `1_${functionName}`;
  
  // 设置插入文本（智能括号）
  if (func.takes && func.takes.length > 0) {
    item.insertText = new vscode.SnippetString(`${functionName}($1)`);
  } else {
    item.insertText = `${functionName}()`;
  }
  
  return item;
}

/**
 * 将全局变量转换为 VS Code 补全项
 * @param globalVariable 全局变量节点
 * @returns VS Code 补全项
 */
export function globalVariableToItem(globalVariable: vjass_ast.GlobalVariable | vjass_ast.zinc.Member): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](globalVariable, vscode.CompletionItemKind.Variable);
  
  // 设置排序优先级（全局变量优先级较低）
  const variableName = globalVariable.name?.getText() ?? "(unnamed)";
  item.sortText = `2_${variableName}`;
  
  // 设置插入文本（直接插入变量名）
  item.insertText = variableName;
  
  return item;
}

/**
 * 将关键字转换为 VS Code 补全项
 * @param keyword 关键字字符串
 * @returns VS Code 补全项
 */
export function keyworldToItem(keyword: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  
  // 设置详细描述
  item.detail = `keyword: ${keyword}`;
  
  // 设置文档说明（简洁格式）
  item.documentation = new vscode.MarkdownString(`JASS keyword: \`${keyword}\``);
  
  // 设置排序优先级（关键字优先级最低）
  item.sortText = `9_${keyword}`;
  
  // 设置插入文本（直接插入关键字）
  item.insertText = keyword;
  
  return item;
}

/**
 * 将类型转换为 VS Code 补全项
 * @param type 类型节点
 * @returns VS Code 补全项
 */
export function typeToItem(type: vjass_ast.Type): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](type, vscode.CompletionItemKind.Class);
  
  // 设置排序优先级（类型优先级中等）
  const typeName = type.name?.getText() ?? "(unnamed)";
  item.sortText = `3_${typeName}`;
  
  // 设置插入文本（直接插入类型名）
  item.insertText = typeName;
  
  return item;
}

/**
 * 将接口转换为 VS Code 补全项
 * @param interface_ 接口节点
 * @returns VS Code 补全项
 */
export function interfaceToItem(interface_: vjass_ast.Interface | vjass_ast.zinc.Interface): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](interface_, vscode.CompletionItemKind.Interface);
  
  const name = interface_.name?.getText() || 'UnknownInterface';
  
  // 设置详细信息
  let detail = `interface ${name}`;
  if (interface_.extends && interface_.extends.length > 0) {
    const extendsList = interface_.extends.map(ex => ex.getText()).join(', ');
    detail += ` extends ${extendsList}`;
  }
  
  // 添加可见性信息
  if (interface_.is_private) {
    detail += ' (private)';
  } else if (interface_.is_public) {
    detail += ' (public)';
  }
  
  item.detail = detail;
  item.insertText = name;
  item.sortText = `5_${name}`;
  
  // 增强文档
  const ms = new vscode.MarkdownString();
  ms.appendMarkdown(`## 🔌 Interface: \`${name}\`\n\n`);
  
  if (interface_.extends && interface_.extends.length > 0) {
    ms.appendMarkdown(`**Extends:** ${interface_.extends.map(ex => `\`${ex.getText()}\``).join(', ')}\n\n`);
  }
  
  ms.appendMarkdown(`**Visibility:** ${interface_.is_private ? 'Private' : 'Public'}\n\n`);
  ms.appendMarkdown(`Interface definition in JASS/vJASS.\n\n`);
  
  // 添加继承信息
  if (interface_.extends && interface_.extends.length > 0) {
    ms.appendMarkdown(`This interface extends the following interfaces:\n`);
    interface_.extends.forEach(ex => {
      ms.appendMarkdown(`- \`${ex.getText()}\`\n`);
    });
  }
  
  item.documentation = ms;
  
  return item;
}

/**
 * 将全局变量转换为 VS Code 补全项
 * @param global 全局变量节点
 * @returns VS Code 补全项
 */
export function globalToItem(global: vjass_ast.GlobalVariable): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](global, vscode.CompletionItemKind.Variable);
  
  const name = global.name?.getText() || 'UnknownGlobal';
  const type = global.type?.getText() || 'unknown';
  
  // 设置详细信息
  let detail = `global ${type} ${name}`;
  if (global.is_array) {
    detail = `global ${type} array ${name}`;
  }
  
  // 添加常量标记
  if (global.is_constant) {
    detail += ' (constant)';
  }
  
  item.detail = detail;
  item.insertText = name;
  item.sortText = `6_${name}`;
  
  // 增强文档
  const ms = new vscode.MarkdownString();
  ms.appendMarkdown(`## 🌍 Global Variable: \`${name}\`\n\n`);
  ms.appendMarkdown(`**Type:** \`${type}\`\n\n`);
  
  if (global.is_array) {
    ms.appendMarkdown(`**Array:** Yes\n\n`);
  }
  
  if (global.is_constant) {
    ms.appendMarkdown(`**Constant:** Yes\n\n`);
  }
  
  // 添加初始化值信息
  if (global.expr) {
    let exprText = '';
    if ('getText' in global.expr && typeof global.expr.getText === 'function') {
      exprText = global.expr.getText();
    } else if ('to_string' in global.expr && typeof global.expr.to_string === 'function') {
      exprText = global.expr.to_string();
    } else if ('value' in global.expr && global.expr.value && 'getText' in global.expr.value) {
      exprText = global.expr.value.getText();
    } else {
      exprText = 'expression';
    }
    ms.appendMarkdown(`**Initial Value:** \`${exprText}\`\n\n`);
  }
  
  ms.appendMarkdown(`Global variable accessible throughout the entire program.\n\n`);
  
  // 添加使用提示
  if (global.is_constant) {
    ms.appendMarkdown(`⚠️ This is a constant and cannot be modified.\n`);
  } else if (global.is_array) {
    ms.appendMarkdown(`📝 This is an array variable. Use array indexing to access elements.\n`);
  }
  
  item.documentation = ms;
  
  return item;
}

/**
 * 将模块转换为 VS Code 补全项
 * @param module 模块节点
 * @returns VS Code 补全项
 */
export function moduleToItem(module: vjass_ast.Module): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](module, vscode.CompletionItemKind.Module);
  
  const name = module.name?.getText() || 'UnknownModule';
  
  // 设置详细信息
  let detail = `module ${name}`;
  if (module.methods && module.methods.length > 0) {
    detail += ` (${module.methods.length} methods)`;
  }
  
  item.detail = detail;
  item.insertText = name;
  item.sortText = `7_${name}`;
  
  // 增强文档
  const ms = new vscode.MarkdownString();
  ms.appendMarkdown(`## 📦 Module: \`${name}\`\n\n`);
  
  // 添加方法信息
  if (module.methods && module.methods.length > 0) {
    ms.appendMarkdown(`**Methods:** ${module.methods.length}\n\n`);
    ms.appendMarkdown(`Available methods in this module:\n`);
    module.methods.forEach(method => {
      const methodName = method.name?.getText() || 'UnknownMethod';
      const methodType = method.is_static ? 'static' : 'instance';
      ms.appendMarkdown(`- \`${methodName}\` (${methodType})\n`);
    });
    ms.appendMarkdown(`\n`);
  }
  
  // 添加实现信息
  if (module.implementations && module.implementations.length > 0) {
    ms.appendMarkdown(`**Implementations:** ${module.implementations.length}\n\n`);
    ms.appendMarkdown(`This module is implemented by:\n`);
    module.implementations.forEach(impl => {
      const implName = impl.moduleName?.getText() || 'UnknownImplementation';
      const isOptional = impl.optional ? ' (optional)' : '';
      ms.appendMarkdown(`- \`${implName}\`${isOptional}\n`);
    });
    ms.appendMarkdown(`\n`);
  }
  
  ms.appendMarkdown(`Module definition in vJASS. Modules provide a way to share code between structs.\n\n`);
  
  // 添加使用提示
  ms.appendMarkdown(`💡 **Usage:** Implement this module in your structs to gain access to its methods.\n`);
  
  item.documentation = ms;
  
  return item;
}

/**
 * 将文本宏转换为 VS Code 补全项
 * @param textMacro 文本宏节点
 * @returns VS Code 补全项
 */
export function textMacroToItem(textMacro: TextMacro): vscode.CompletionItem {
  const item = new vscode.CompletionItem(textMacro.name, vscode.CompletionItemKind.Snippet);
  
  // 设置详细信息
  let detail = `textmacro ${textMacro.name}`;
  if (textMacro.takes && textMacro.takes.length > 0) {
    detail += ` takes ${textMacro.takes.join(', ')}`;
  }
  
  item.detail = detail;
  item.insertText = textMacro.name;
  item.sortText = `8_${textMacro.name}`;
  
  // 增强文档
  const ms = new vscode.MarkdownString();
  ms.appendMarkdown(`## 📝 Text Macro: \`${textMacro.name}\`\n\n`);
  
  // 添加参数信息
  if (textMacro.takes && textMacro.takes.length > 0) {
    ms.appendMarkdown(`**Parameters:** ${textMacro.takes.length}\n\n`);
    ms.appendMarkdown(`Available parameters:\n`);
    textMacro.takes.forEach((param, index) => {
      ms.appendMarkdown(`- \`${param}\` (parameter ${index + 1})\n`);
    });
    ms.appendMarkdown(`\n`);
  } else {
    ms.appendMarkdown(`**Parameters:** None\n\n`);
  }
  
  // 添加文件信息
  if (textMacro.filePath) {
    ms.appendMarkdown(`**File:** \`${textMacro.filePath}\`\n\n`);
  }
  
  // 添加行号信息
  if (textMacro.header) {
    ms.appendMarkdown(`**Defined at:** Line ${textMacro.header.lineNumber + 1}\n\n`);
  }
  
  // 添加宏体预览
  if (textMacro.body && textMacro.body.length > 0) {
    ms.appendMarkdown(`**Macro Body Preview:**\n\n`);
    const previewLines = textMacro.body.slice(0, 5); // 只显示前5行
    ms.appendCodeblock(previewLines.join('\n'), 'jass');
    
    if (textMacro.body.length > 5) {
      ms.appendMarkdown(`\n... and ${textMacro.body.length - 5} more lines\n\n`);
    }
  } else {
    ms.appendMarkdown(`**Macro Body:** Empty\n\n`);
  }
  
  ms.appendMarkdown(`Text macro definition in vJASS. Use \`runtextmacro\` to execute this macro.\n\n`);
  
  // 添加使用提示
  if (textMacro.takes && textMacro.takes.length > 0) {
    const params = textMacro.takes.map(param => `\`${param}\``).join(', ');
    ms.appendMarkdown(`💡 **Usage:** \`runtextmacro ${textMacro.name}(${params})\`\n`);
  } else {
    ms.appendMarkdown(`💡 **Usage:** \`runtextmacro ${textMacro.name}\`\n`);
  }
  
  item.documentation = ms;
  
  return item;
}

/**
 * 将预处理器定义转换为 VS Code 补全项
 * @param define 预处理器定义节点
 * @returns VS Code 补全项
 */
export function defineToItem(define: Define): vscode.CompletionItem {
  const item = new vscode.CompletionItem(define.name, vscode.CompletionItemKind.Constant);
  
  // 设置详细信息
  let detail = `#define ${define.name}`;
  if (define.value && define.value.trim()) {
    detail += ` ${define.value}`;
  }
  
  item.detail = detail;
  item.insertText = define.name;
  item.sortText = `9_${define.name}`;
  
  // 增强文档
  const ms = new vscode.MarkdownString();
  ms.appendMarkdown(`## 🔧 Preprocessor Define: \`${define.name}\`\n\n`);
  
  // 添加值信息
  if (define.value && define.value.trim()) {
    ms.appendMarkdown(`**Value:** \`${define.value}\`\n\n`);
  } else {
    ms.appendMarkdown(`**Value:** (empty)\n\n`);
  }
  
  // 添加定义位置信息
  ms.appendMarkdown(`**Defined at:** Line ${define.lineNumber + 1}\n\n`);
  
  // 添加原始代码
  if (define.code) {
    ms.appendMarkdown(`**Definition:**\n\n`);
    ms.appendCodeblock(define.code, 'jass');
    ms.appendMarkdown(`\n`);
  }
  
  ms.appendMarkdown(`Preprocessor definition in vJASS. This define will be replaced with its value during preprocessing.\n\n`);
  
  // 添加使用提示
  if (define.value && define.value.trim()) {
    ms.appendMarkdown(`💡 **Usage:** Use \`${define.name}\` in your code, it will be replaced with \`${define.value}\`\n`);
  } else {
    ms.appendMarkdown(`💡 **Usage:** Use \`${define.name}\` as a conditional compilation flag\n`);
  }
  
  // 添加类型提示
  if (define.value && define.value.trim()) {
    // 尝试推断值的类型
    const value = define.value.trim();
    if (/^\d+$/.test(value)) {
      ms.appendMarkdown(`\n📊 **Type:** Integer constant\n`);
    } else if (/^\d*\.\d+$/.test(value)) {
      ms.appendMarkdown(`\n📊 **Type:** Real constant\n`);
    } else if (/^"[^"]*"$/.test(value)) {
      ms.appendMarkdown(`\n📊 **Type:** String constant\n`);
    } else if (/^(true|false)$/i.test(value)) {
      ms.appendMarkdown(`\n📊 **Type:** Boolean constant\n`);
    } else {
      ms.appendMarkdown(`\n📊 **Type:** Expression/Identifier\n`);
    }
  } else {
    ms.appendMarkdown(`\n📊 **Type:** Conditional compilation flag\n`);
  }
  
  item.documentation = ms;
  
  return item;
}


/**
 * AST 节点自动转 CompletionItem（智能类型判断）
 * @param node AST 节点
 * @returns CompletionItem 或 null
 */
export function nodeAstToItem(node: vjass_ast.NodeAst): vscode.CompletionItem | null {
  if (!node) return null;

  // 判断节点类型并调用相应的转换函数
  if (node instanceof vjass_ast.Native) {
    return nativeToItem(node);
  }
  
  if (node instanceof vjass_ast.Func) {
    return functionToItem(node);
  }
  
  if (node instanceof vjass_ast.GlobalVariable) {
    return globalVariableToItem(node);
  }
  
  if (node instanceof vjass_ast.Struct || node instanceof vjass_ast.zinc.Struct) {
    return structToItem(node);
  }
  
  if (node instanceof vjass_ast.Module) {
    return moduleToItem(node);
  }
  
  if (node instanceof vjass_ast.Method || node instanceof vjass_ast.zinc.Method) {
    return methodToItem(node);
  }
  
  if (node instanceof vjass_ast.Local || node instanceof vjass_ast.zinc.Member) {
    return localToItem(node);
  }
  
  if (node instanceof vjass_ast.Take) {
    return takeToItem(node);
  }
  
  // 如果是字符串，可能是关键字或类型
  if (typeof node === 'string') {
    // 检查是否是关键字
    if (AllKeywords.includes(node)) {
      return keyworldToItem(node);
    }
    // 检查是否是类型
    if (Types.includes(node)) {
      return typeToItem(node as any);
    }
    // 默认作为关键字处理
    return keyworldToItem(node);
  }
  
  // 如果有 name 属性，尝试获取名称
  if ((node as any).name) {
    const name = (node as any).name.getText ? (node as any).name.getText() : (node as any).name;
    if (name) {
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
      item.detail = `未知类型: ${node.constructor.name}`;
      item.documentation = new vscode.MarkdownString();
      item.documentation.appendMarkdown(`## ❓ 未知节点类型\n\n`);
      item.documentation.appendMarkdown(`**节点类型**: \`${node.constructor.name}\`\n\n`);
      item.documentation.appendMarkdown(`**名称**: \`${name}\`\n\n`);
      item.documentation.appendMarkdown(`这是一个未识别的 AST 节点类型。\n\n`);
      item.insertText = name;
      item.sortText = `9_${name}`;
      return item;
    }
  }
  
  return null;
}

/**
 * 结构体转 CompletionItem
 * @param struct 结构体节点
 * @returns CompletionItem
 */
export function structToItem(struct: vjass_ast.Struct | vjass_ast.zinc.Struct): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](struct, vscode.CompletionItemKind.Struct);
  
  const name = struct.name?.getText() || 'UnknownStruct';
  item.insertText = name;
  item.sortText = `4_${name}`;
  return item;
}

/**
 * 方法转 CompletionItem
 * @param method 方法节点
 * @returns CompletionItem
 */
export function methodToItem(method: vjass_ast.Method | vjass_ast.zinc.Method): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](method, vscode.CompletionItemKind.Method);
  
  const name = method.name?.getText() || 'UnknownMethod';
  item.insertText = name;
  item.sortText = `5_${name}`;
  return item;
}

/**
 * 局部变量转 CompletionItem
 * @param local 局部变量节点
 * @returns CompletionItem
 */
export function localToItem(local: vjass_ast.Local | vjass_ast.zinc.Member): vscode.CompletionItem {
  const generator = CompletionItemGenerator.getInstance();
  const item = generator['createBaseItem'](local, vscode.CompletionItemKind.Variable);
  
  const name = local.name?.getText() || 'UnknownLocal';
  item.insertText = name;
  item.sortText = `6_${name}`;
  return item;
}

/**
 * 参数转 CompletionItem
 * @param take 参数节点
 * @returns CompletionItem
 */
export function takeToItem(take: vjass_ast.Take): vscode.CompletionItem {
  const name = take.name?.getText() || 'UnknownParam';
  const type = take.type?.getText() || 'unknown';
  const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
  
  // 获取父节点信息
  const parentNode = take.belong;
  const parentName = parentNode?.name?.getText() || 'UnknownFunction';
  const parentType = parentNode instanceof vjass_ast.Func ? 'function' : 
                    parentNode instanceof vjass_ast.Method ? 'method' : 
                    parentNode instanceof vjass_ast.Native ? 'native' : 'function';
  
  // 设置更美观的详情
  item.detail = `${name}: ${type}`;
  
  // 创建更美观的文档
  const ms = new vscode.MarkdownString();
  
  // 标题部分 - 更简洁美观
  ms.appendMarkdown(`### \`${name}\`\n\n`);
  
  // 类型信息 - 使用代码块样式
  ms.appendMarkdown(`**Type:** \`${type}\`  \n`);
  ms.appendMarkdown(`**From:** \`${parentType} ${parentName}\`\n\n`);
  
  // 尝试从父节点获取 @param 注释
  const paramDescription = getParamDescriptionFromParent(parentNode, name);
  if (paramDescription) {
    ms.appendMarkdown(`**Description:** ${paramDescription}\n\n`);
  }
  
  // 添加类型特定的使用提示 - 更简洁
  const baseType = type.toLowerCase().replace('array', '').trim();
  const usageHint = getTypeUsageHint(baseType, name);
  if (usageHint) {
    ms.appendMarkdown(`**Usage:** ${usageHint}\n\n`);
  }
  
  // 数组特殊说明
  if (type.includes('array')) {
    ms.appendMarkdown(`> 📝 Array parameter - use indexing: \`${name}[index]\`\n\n`);
  }
  
  // 添加函数上下文信息
  if (parentNode) {
    ms.appendMarkdown(`---\n\n`);
    ms.appendMarkdown(`**Function Context:**\n`);
    ms.appendCodeblock(`${parentType} ${parentName}(${getFunctionSignature(parentNode)})`, 'jass');
  }
  
  item.documentation = ms;
  item.insertText = name;
  item.sortText = `7_${name}`;
  return item;
}

/**
 * 从父节点获取参数描述
 */
function getParamDescriptionFromParent(parentNode: any, paramName: string): string | null {
  if (!parentNode) return null;
  
  // 检查父节点是否有注释
  if (parentNode.comments) {
    for (const comment of parentNode.comments) {
      if (comment.comment) {
        const text = comment.comment.getText();
        // 匹配 @param 注释
        const paramMatch = new RegExp(`@param\\s+${paramName}\\s+(.+)`, 'i').exec(text);
        if (paramMatch) {
          return paramMatch[1].trim();
        }
      }
    }
  }
  
  // 检查父节点的文档注释
  if (parentNode.documentation) {
    const paramMatch = new RegExp(`@param\\s+${paramName}\\s+(.+)`, 'i').exec(parentNode.documentation);
    if (paramMatch) {
      return paramMatch[1].trim();
    }
  }
  
  return null;
}

/**
 * 获取类型使用提示
 */
function getTypeUsageHint(baseType: string, paramName: string): string | null {
  switch (baseType) {
    case 'integer':
      return `\`${paramName} = 42\``;
    case 'real':
      return `\`${paramName} = 3.14\``;
    case 'string':
      return `\`${paramName} = "text"\``;
    case 'boolean':
      return `\`${paramName} = true\``;
    case 'handle':
      return `\`${paramName} = null\``;
    default:
      if (baseType.includes('unit')) {
        return `\`${paramName} = null\` (unit reference)`;
      } else if (baseType.includes('player')) {
        return `\`${paramName} = Player(0)\` (player reference)`;
      } else if (baseType.includes('trigger')) {
        return `\`${paramName} = null\` (trigger reference)`;
      } else if (baseType.includes('timer')) {
        return `\`${paramName} = null\` (timer reference)`;
      } else if (baseType.includes('group')) {
        return `\`${paramName} = null\` (group reference)`;
      } else if (baseType.includes('location')) {
        return `\`${paramName} = null\` (location reference)`;
      }
      return null;
  }
}

/**
 * 获取函数签名
 */
function getFunctionSignature(parentNode: any): string {
  if (!parentNode || !parentNode.takes) {
    return 'nothing';
  }
  
  return parentNode.takes.map((take: vjass_ast.Take) => {
    const type = take.type?.getText() || 'unknown';
    const name = take.name?.getText() || 'param';
    return `${type} ${name}`;
  }).join(', ');
}

/**
 * 委托转 CompletionItem
 * @param delegate 委托节点
 * @returns CompletionItem
 */
export function delegateToItem(delegate: vjass_ast.Delegate): vscode.CompletionItem {
  const name = delegate.name?.getText() || 'UnknownDelegate';
  const delegateType = delegate.delegateType?.getText() || 'unknown';
  const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
  
  // 设置详情
  const visibility = delegate.is_private ? 'private' : 'public';
  const optional = delegate.is_optional ? 'optional ' : '';
  item.detail = `${visibility} ${optional}delegate ${delegateType} ${name}`;
  
  // 创建文档
  const ms = new vscode.MarkdownString();
  ms.baseUri = vscode.Uri.file(delegate.document.filePath);
  
  // 添加委托定义
  ms.appendCodeblock(delegate.to_string(), "jass");
  ms.appendText("\n");
  
  // 添加文件路径
  ms.appendMarkdown(`**文件:** \`${delegate.document.filePath}\``);
  ms.appendText("\n\n");
  
  // 添加委托说明
  ms.appendMarkdown(`委托到 \`${delegateType}\` 类型`);
  if (delegate.is_optional) {
    ms.appendText("\n");
    ms.appendMarkdown(`**可选委托** - 可能为 null`);
  }
  
  item.documentation = ms;
  
  // 设置插入文本
  item.insertText = name;
  
  // 设置排序文本，委托排在属性和变量之间
  item.sortText = `5_${name}`;
  
  // 设置标签
  if (delegate.is_private) {
    item.tags = [vscode.CompletionItemTag.Deprecated];
  }
  
  return item;
}
