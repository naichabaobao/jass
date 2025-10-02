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
  'Loop': vscode.SymbolKind.Null
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

        return symbols;
    }
}

// ==================== 注册提供器 ====================

// Note: Provider registration moved to extension.ts
// vscode.languages.registerDocumentSymbolProvider(
//   { scheme: 'file', language: 'jass' },
//   new DocumentSymbolProvider()
// );
