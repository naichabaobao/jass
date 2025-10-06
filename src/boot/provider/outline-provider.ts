/**
 * JASS文档大纲提供器
 * 
 * 功能:
 * - 使用Visitor模式遍历AST
 * - 生成文档结构大纲
 * - 支持层级符号显示
 */

import * as vscode from "vscode";
import { GlobalContext, NodeAst } from "../jass/parser-vjass";
import * as vjass_ast from "../jass/parser-vjass";
import { ASTVisitor } from "../jass/tokenizer-common";
import { TextMacro } from "../vjass/text-macro";
import { RunTextMacro } from "../vjass/run-text-macro";
import { Define, Include } from "../vjass/preprocess";
import { Import } from "../vjass/vjass-import";

// ==================== 符号映射表 ====================

const SYMBOL_KIND_MAP: { [key: string]: vscode.SymbolKind } = {
  'Func': vscode.SymbolKind.Function,
  'Native': vscode.SymbolKind.Function,
  'Method': vscode.SymbolKind.Method,
  'Struct': vscode.SymbolKind.Class,
  'Interface': vscode.SymbolKind.Interface,
  'Library': vscode.SymbolKind.Namespace,
  'Scope': vscode.SymbolKind.Namespace,
  'Globals': vscode.SymbolKind.Module,
  'Type': vscode.SymbolKind.TypeParameter,
  'Local': vscode.SymbolKind.Variable,
  'Member': vscode.SymbolKind.Field,
  'GlobalVariable': vscode.SymbolKind.Variable,
  'If': vscode.SymbolKind.Null,
  'Loop': vscode.SymbolKind.Null,
  // 新增支持的类型
  'Module': vscode.SymbolKind.Module,
  'Delegate': vscode.SymbolKind.Property,
  'Implement': vscode.SymbolKind.Event,
  'VjassModuleImplementation': vscode.SymbolKind.Event,
  // Zinc-specific 符号类型
  'zinc.Func': vscode.SymbolKind.Function,
  'zinc.Method': vscode.SymbolKind.Method,
  'zinc.Struct': vscode.SymbolKind.Class,
  'zinc.Interface': vscode.SymbolKind.Interface,
  'zinc.Member': vscode.SymbolKind.Field,
  'zinc.If': vscode.SymbolKind.Null,
  'zinc.While': vscode.SymbolKind.Null,
  'zinc.For': vscode.SymbolKind.Null,
  'zinc.Else': vscode.SymbolKind.Null,
  'zinc.ElseIf': vscode.SymbolKind.Null,
  'zinc.StaticIf': vscode.SymbolKind.Null,
  'zinc.Private': vscode.SymbolKind.Namespace,
  'zinc.Public': vscode.SymbolKind.Namespace,
  'zinc.Debug': vscode.SymbolKind.Namespace,
  'zinc.Break': vscode.SymbolKind.Null,
  'zinc.Call': vscode.SymbolKind.Function,
  'zinc.Set': vscode.SymbolKind.Variable
};

// ==================== 符号收集器（Visitor实现） ====================

class OutlineVisitor implements ASTVisitor {
  private symbols: vscode.DocumentSymbol[] = [];
  private symbolMap = new Map<NodeAst, vscode.DocumentSymbol>();
  
  /**
   * 创建符号
   */
  private createSymbol(
    node: NodeAst,
    name: string,
    detail: string,
    kind: vscode.SymbolKind
  ): vscode.DocumentSymbol {
    const range = new vscode.Range(
      node.start.line,
      node.start.position,
      node.end.line,
      node.end.position
    );
    
    const symbol = new vscode.DocumentSymbol(name, detail, kind, range, range);
    
    // 建立符号层级关系
    if (node.parent) {
      const parentSymbol = this.symbolMap.get(node.parent);
      if (parentSymbol) {
        parentSymbol.children.push(symbol);
      } else {
        this.symbols.push(symbol);
      }
    } else {
      this.symbols.push(symbol);
    }
    
    // 如果节点有子节点，保存到map中供子节点使用
    if (node.children.length > 0) {
      this.symbolMap.set(node, symbol);
    }
    
    return symbol;
  }
  
  /**
   * 获取节点名称
   */
  private getNodeName(node: any): string {
    return node.name?.getText() ?? "(unknown)";
  }
  
  // ==================== Visitor方法实现 ====================
  
  visitFunc(node: vjass_ast.Func | vjass_ast.zinc.Func): void {
    const name = this.getNodeName(node);
    const params = node.takes && node.takes.length > 0
      ? `(${node.takes.map(t => t.type?.getText()).join(', ')})`
      : '()';
    const returns = node.returns ? ` : ${node.returns.getText()}` : '';
    this.createSymbol(node, name, `function${params}${returns}`, vscode.SymbolKind.Function);
  }
  
  visitNative(node: vjass_ast.Native): void {
    const name = this.getNodeName(node);
    const params = node.takes && node.takes.length > 0
      ? `(${node.takes.map(t => t.type?.getText()).join(', ')})`
      : '()';
    const returns = node.returns ? ` : ${node.returns.getText()}` : '';
    this.createSymbol(node, name, `native${params}${returns}`, vscode.SymbolKind.Function);
  }
  
  visitMethod(node: vjass_ast.Method | vjass_ast.zinc.Method): void {
    const name = this.getNodeName(node);
    const modifier = node.is_static ? 'static ' : '';
    const params = node.takes && node.takes.length > 0
      ? `(${node.takes.map(t => t.type?.getText()).join(', ')})`
      : '()';
    const returns = node.returns ? ` : ${node.returns.getText()}` : '';
    this.createSymbol(node, name, `${modifier}method${params}${returns}`, vscode.SymbolKind.Method);
  }
  
  visitStruct(node: vjass_ast.Struct | vjass_ast.zinc.Struct): void {
    const name = this.getNodeName(node);
    const extendsInfo = node.extends && node.extends.length > 0
      ? ` extends ${node.extends.map(e => e.getText()).join(', ')}`
      : '';
    this.createSymbol(node, name, `struct${extendsInfo}`, vscode.SymbolKind.Class);
  }
  
  visitInterface(node: vjass_ast.Interface | vjass_ast.zinc.Interface): void {
    const name = this.getNodeName(node);
    const extendsInfo = node.extends && node.extends.length > 0
      ? ` extends ${node.extends.map(e => e.getText()).join(', ')}`
      : '';
    this.createSymbol(node, name, `interface${extendsInfo}`, vscode.SymbolKind.Interface);
  }
  
  visitLibrary(node: vjass_ast.Library): void {
    const name = this.getNodeName(node);
    this.createSymbol(node, name, 'library', vscode.SymbolKind.Namespace);
  }
  
  visitScope(node: vjass_ast.Scope): void {
    const name = this.getNodeName(node);
    this.createSymbol(node, name, 'scope', vscode.SymbolKind.Namespace);
  }
  
  visitGlobals(node: vjass_ast.Globals): void {
    this.createSymbol(node, 'globals', 'global variables', vscode.SymbolKind.Module);
  }
  
  visitType(node: vjass_ast.Type): void {
    const name = this.getNodeName(node);
    const base = ('base' in node && node.base) ? ` = ${(node.base as any).getText()}` : '';
    this.createSymbol(node, name, `type${base}`, vscode.SymbolKind.TypeParameter);
  }
  
  visitLocal(node: vjass_ast.Local | vjass_ast.zinc.Member): void {
    const name = this.getNodeName(node);
    const type = node.type ? ` : ${node.type.getText()}` : '';
    this.createSymbol(node, name, `local${type}`, vscode.SymbolKind.Variable);
  }
  
  visitMember(node: vjass_ast.Member | vjass_ast.zinc.Member): void {
    const name = this.getNodeName(node);
    const modifier = node.is_static ? 'static ' : '';
    const type = node.type ? ` : ${node.type.getText()}` : '';
    this.createSymbol(node, name, `${modifier}field${type}`, vscode.SymbolKind.Field);
  }
  
  visitGlobalVariable(node: vjass_ast.GlobalVariable | vjass_ast.zinc.Member): void {
    const name = this.getNodeName(node);
    const constant = node.is_constant ? 'constant ' : '';
    const type = node.type ? ` : ${node.type.getText()}` : '';
    const kind = node.is_constant ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable;
    this.createSymbol(node, name, `${constant}${type}`, kind);
  }
  
  visitIf(node: vjass_ast.If | vjass_ast.zinc.If): void {
    this.createSymbol(node, 'if', 'if statement', vscode.SymbolKind.Null);
  }
  
  visitLoop(node: vjass_ast.Loop): void {
    this.createSymbol(node, 'loop', 'loop statement', vscode.SymbolKind.Null);
  }
  
  // ==================== 新增的Visitor方法 ====================
  
  visitModule(node: vjass_ast.Module): void {
    const name = this.getNodeName(node);
    const methodCount = node.methods ? node.methods.length : 0;
    const implCount = node.implementations ? node.implementations.length : 0;
    const detail = `module (${methodCount} methods, ${implCount} implementations)`;
    this.createSymbol(node, name, detail, vscode.SymbolKind.Module);
  }
  
  visitDelegate(node: vjass_ast.Delegate): void {
    const name = this.getNodeName(node);
    const visibility = node.is_private ? 'private ' : 'public ';
    const optional = node.is_optional ? 'optional ' : '';
    const delegateType = node.delegateType ? ` : ${node.delegateType.getText()}` : '';
    const detail = `${visibility}${optional}delegate${delegateType}`;
    this.createSymbol(node, name, detail, vscode.SymbolKind.Property);
  }
  
  visitImplement(node: vjass_ast.Implement): void {
    const moduleName = node.moduleName ? node.moduleName.getText() : '(unknown)';
    const optional = node.optional ? 'optional ' : '';
    this.createSymbol(node, moduleName, `${optional}implement ${moduleName}`, vscode.SymbolKind.Event);
  }
  
  visitVjassModuleImplementation(node: vjass_ast.VjassModuleImplementation): void {
    const moduleName = node.moduleName ? node.moduleName.getText() : '(unknown)';
    const optional = node.optional ? 'optional ' : '';
    this.createSymbol(node, moduleName, `${optional}implement ${moduleName}`, vscode.SymbolKind.Event);
  }

  // ==================== Zinc-specific Visitor方法 ====================

  visitZincFunc(node: vjass_ast.zinc.Func): void {
    const name = this.getNodeName(node);
    const params = node.takes && node.takes.length > 0
      ? `(${node.takes.map(t => t.type?.getText()).join(', ')})`
      : '()';
    const returns = node.returns ? ` -> ${node.returns.getText()}` : '';
    const visible = node.visible ? `${node.visible.getText()} ` : '';
    const modifier = node.modifier ? `${node.modifier.getText()} ` : '';
    this.createSymbol(node, name, `${visible}${modifier}function${params}${returns}`, vscode.SymbolKind.Function);
  }

  visitZincMethod(node: vjass_ast.zinc.Method): void {
    const name = this.getNodeName(node);
    const params = node.takes && node.takes.length > 0
      ? `(${node.takes.map(t => t.type?.getText()).join(', ')})`
      : '()';
    const returns = node.returns ? ` -> ${node.returns.getText()}` : '';
    const visible = node.visible ? `${node.visible.getText()} ` : '';
    const modifier = node.modifier ? `${node.modifier.getText()} ` : '';
    this.createSymbol(node, name, `${visible}${modifier}method${params}${returns}`, vscode.SymbolKind.Method);
  }

  visitZincStruct(node: vjass_ast.zinc.Struct): void {
    const name = this.getNodeName(node);
    const extendsInfo = node.extends && node.extends.length > 0
      ? ` extends ${node.extends.map(e => e.getText()).join(', ')}`
      : '';
    const visible = node.visible ? `${node.visible.getText()} ` : '';
    this.createSymbol(node, name, `${visible}struct${extendsInfo}`, vscode.SymbolKind.Class);
  }

  visitZincInterface(node: vjass_ast.zinc.Interface): void {
    const name = this.getNodeName(node);
    const extendsInfo = node.extends && node.extends.length > 0
      ? ` extends ${node.extends.map(e => e.getText()).join(', ')}`
      : '';
    const visible = node.visible ? `${node.visible.getText()} ` : '';
    this.createSymbol(node, name, `${visible}interface${extendsInfo}`, vscode.SymbolKind.Interface);
  }

  visitZincMember(node: vjass_ast.zinc.Member): void {
    const name = this.getNodeName(node);
    const visible = node.visible ? `${node.visible.getText()} ` : '';
    const modifier = node.modifier ? `${node.modifier.getText()} ` : '';
    const type = node.type ? ` : ${node.type.getText()}` : '';
    const kind = node.modifier?.getText() === 'constant' ? vscode.SymbolKind.Constant : vscode.SymbolKind.Field;
    this.createSymbol(node, name, `${visible}${modifier}field${type}`, kind);
  }

  visitZincIf(node: vjass_ast.zinc.If): void {
    this.createSymbol(node, 'if', 'if statement', vscode.SymbolKind.Null);
  }

  visitZincWhile(node: vjass_ast.zinc.While): void {
    this.createSymbol(node, 'while', 'while loop', vscode.SymbolKind.Null);
  }

  visitZincFor(node: vjass_ast.zinc.For): void {
    this.createSymbol(node, 'for', 'for loop', vscode.SymbolKind.Null);
  }

  visitZincElse(node: vjass_ast.zinc.Else): void {
    this.createSymbol(node, 'else', 'else block', vscode.SymbolKind.Null);
  }

  visitZincElseIf(node: vjass_ast.zinc.ElseIf): void {
    this.createSymbol(node, 'else if', 'else if statement', vscode.SymbolKind.Null);
  }

  visitZincStaticIf(node: vjass_ast.zinc.StaticIf): void {
    this.createSymbol(node, 'static if', 'static if statement', vscode.SymbolKind.Null);
  }

  visitZincPrivate(node: vjass_ast.zinc.Private): void {
    this.createSymbol(node, 'private', 'private block', vscode.SymbolKind.Namespace);
  }

  visitZincPublic(node: vjass_ast.zinc.Public): void {
    this.createSymbol(node, 'public', 'public block', vscode.SymbolKind.Namespace);
  }

  visitZincDebug(node: vjass_ast.zinc.Debug): void {
    this.createSymbol(node, 'debug', 'debug block', vscode.SymbolKind.Namespace);
  }

  visitZincBreak(node: vjass_ast.zinc.Break): void {
    this.createSymbol(node, 'break', 'break statement', vscode.SymbolKind.Null);
  }

  visitZincCall(node: vjass_ast.zinc.Call): void {
    const name = node.ref?.to_string() ?? '(unknown)';
    this.createSymbol(node, name, 'function call', vscode.SymbolKind.Function);
  }

  visitZincSet(node: vjass_ast.zinc.Set): void {
    const name = node.name?.to_string() ?? '(unknown)';
    const init = node.init ? ` = ${node.init.to_string()}` : '';
    this.createSymbol(node, name, `assignment${init}`, vscode.SymbolKind.Variable);
  }
  
  /**
   * 获取收集的符号
   */
  public getSymbols(): vscode.DocumentSymbol[] {
    return this.symbols;
  }
}

// ==================== 文档符号提供器 ====================

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const doc = GlobalContext.get(document.fileName);
    if (!doc) {
      return [];
    }
    
    const symbols: vscode.DocumentSymbol[] = [];
    
    // 使用Visitor收集AST符号
    const visitor = new OutlineVisitor();
    doc.accept(visitor);
    symbols.push(...visitor.getSymbols());
    
    // 添加TextMacro符号
    doc.textMacros.forEach((textMacro: TextMacro) => {
      const startLine = textMacro.header?.lineNumber ?? 0;
      const endLine = textMacro.endTag?.lineNumber ?? startLine;
      const range = new vscode.Range(startLine, 0, endLine, 0);
      
      const params = textMacro.takes && textMacro.takes.length > 0
        ? ` takes ${textMacro.takes.join(', ')}`
        : '';
      
      const symbol = new vscode.DocumentSymbol(
        textMacro.name || "(unnamed)",
        `textmacro${params}`,
        vscode.SymbolKind.Function,
        range,
        range
      );
      
      symbols.push(symbol);
    });

    // 添加RunTextMacro符号
    doc.runTextMacros.forEach((runTextMacro: RunTextMacro) => {
      const name = runTextMacro.name || '(unnamed)';
      const params = runTextMacro.params && runTextMacro.params.length > 0
        ? `(${runTextMacro.params.join(', ')})`
        : '()';
      const optional = runTextMacro.optional ? 'optional ' : '';
      const range = new vscode.Range(runTextMacro.lineNumber, 0, runTextMacro.lineNumber, 0);
      
      const symbol = new vscode.DocumentSymbol(
        name,
        `${optional}runtextmacro${params}`,
        vscode.SymbolKind.Function,
        range,
        range
      );
      
      symbols.push(symbol);
    });

    // 添加Define符号
    doc.defines.forEach((define: Define) => {
      const range = new vscode.Range(define.lineNumber, 0, define.lineNumber, 0);
      const value = define.value ? ` = ${define.value}` : '';
      
      const symbol = new vscode.DocumentSymbol(
        define.name,
        `#define${value}`,
        vscode.SymbolKind.Constant,
        range,
        range
      );
      
      symbols.push(symbol);
    });

    // 添加Include符号
    doc.includes.forEach((include: Include) => {
      const range = new vscode.Range(include.lineNumber, 0, include.lineNumber, 0);
      
      const symbol = new vscode.DocumentSymbol(
        `"${include.path}"`,
        '#include',
        vscode.SymbolKind.File,
        range,
        range
      );
      
      symbols.push(symbol);
    });

    // 添加Import符号
    doc.imports.forEach((importStmt: Import) => {
      const range = new vscode.Range(importStmt.lineNumber, 0, importStmt.lineNumber, 0);
      const type = importStmt.type ? ` ${importStmt.type}` : '';
      
      const symbol = new vscode.DocumentSymbol(
        `"${importStmt.path}"`,
        `//! import${type}`,
        vscode.SymbolKind.File,
        range,
        range
      );
      
      symbols.push(symbol);
    });

    return symbols;
  }
}

// ==================== 注册提供器 ====================

// Note: Provider registration moved to extension.ts
// vscode.languages.registerDocumentSymbolProvider(
//   { scheme: 'file', language: 'jass' },
//   new DocumentSymbolProvider()
// );
