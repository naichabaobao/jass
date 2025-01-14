import * as vscode from "vscode";
import { Program } from "../jass/ast";
import { Func, GlobalContext, Native, Method, Node, Member, Globals, Struct, Interface, Library, Scope, If, Loop, Local, Type, Set, NodeAst, GlobalVariable } from "../jass/parser-vjass";

class Wrap {
    ast:NodeAst;
    symbol: vscode.DocumentSymbol;

    constructor(ast:NodeAst, symbol: vscode.DocumentSymbol) {
        this.ast = ast;
        this.symbol = symbol;
    }

    public equals(ast: NodeAst):boolean {
        return this.ast === ast; // && this.symbol.range.isEqual(wrap.symbol.range);
    }
}
class Stack {
    private wraps:Wrap[] = [];

    public index_of(ast: NodeAst) {
        const index = this.wraps.findIndex(x => {
            return x.equals(ast);
        });
        return index;
    }

    public has(ast: NodeAst) {
        return this.index_of(ast) != -1;
    }

    public add(wrap: Wrap) {
        if (!this.has(wrap.ast)) {
            this.wraps.push(wrap);
        }
    }

    public delete(ast: NodeAst) {
        const index = this.index_of(ast);
        if (index != -1) {
            this.wraps.splice(index, 1);
        }
    }

    public get(ast: NodeAst):Wrap|undefined {
        const index = this.index_of(ast);
        return this.wraps[index];
    }
}
class DocumentSymbolExprProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
        const symbols: vscode.DocumentSymbol[] = [];
        let doc = GlobalContext.get(document.fileName);
        if (!!!doc) {
            return;
        }
        console.log(doc.locals.length);
        const stack: Stack = new Stack();
        const push = (node: NodeAst, symbol: vscode.DocumentSymbol) => {
            if (node.parent) {
                const wrap = stack.get(node.parent);
                if (wrap) {
                    wrap.symbol.children.push(symbol);
                } else {
                    symbols.push(symbol);
                }
            } else {
                symbols.push(symbol);
            }
            if (node.children.length > 0) {
                stack.add(new Wrap(node, symbol));
            }
        }
        doc.every((node) => {
            const range = new vscode.Range(node.start.line, node.start.position, node.end.line, node.end.position);
            let selectRange: vscode.Range  = range;
            if (node instanceof Local) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "local", vscode.SymbolKind.Variable, range, selectRange);

                push(node, symbol);
            } else if (node instanceof GlobalVariable) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "global variable", node.is_array ? vscode.SymbolKind.Array : node.qualifier ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable, range, selectRange);

                push(node, symbol);
            } else if (node instanceof If) {
                const symbol = new vscode.DocumentSymbol("if", "if", vscode.SymbolKind.Field, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Loop) {
                const symbol = new vscode.DocumentSymbol("loop", "loop", vscode.SymbolKind.Field, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Method) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "method", vscode.SymbolKind.Function, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Func) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "function", vscode.SymbolKind.Function, range, selectRange);
                

                push(node, symbol);
            } else if (node instanceof Native) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "native", vscode.SymbolKind.Function, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Library) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "library", vscode.SymbolKind.Namespace, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Struct) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "struct", vscode.SymbolKind.Class, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Interface) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "interface", vscode.SymbolKind.Interface, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Globals) {
                const symbol = new vscode.DocumentSymbol("globals", "globals", vscode.SymbolKind.Field, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Type) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "type", vscode.SymbolKind.Class, range, selectRange);

                push(node, symbol);
            } else if (node instanceof Scope) {
                const symbol = new vscode.DocumentSymbol(node.name?.getText() ?? "(unkown)", "scope", vscode.SymbolKind.Namespace, range, selectRange);

                push(node, symbol);
            }
          });
        // doc.functions.forEach(func => {
        //     const range = new vscode.Range(func.start.line, func.start.position, func.end.line, func.end.position);
        //     let selectRange: vscode.Range  = range;
        //     const symbol = new vscode.DocumentSymbol(func.name?.getText() ?? "(unkown)", "function", vscode.SymbolKind.Function, range, selectRange);
        //     symbols.push(symbol);
        // });

        doc.text_macros.forEach((text_macro) => {
            const range = new vscode.Range(text_macro.start.line, 0, text_macro.end.line, 0);
            let selectRange: vscode.Range  = range;
            const symbol = new vscode.DocumentSymbol(doc!.lineAt(text_macro.start_line).text, "textmacro", vscode.SymbolKind.Field, range, selectRange);
            symbols.push(symbol);
        });

        return symbols;
    }

}

vscode.languages.registerDocumentSymbolProvider("jass", new DocumentSymbolExprProvider());
