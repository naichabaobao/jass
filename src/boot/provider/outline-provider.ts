import * as vscode from "vscode";
import { DataGetter, parseContent } from "./data";
import { GlobalObject, Program } from "../jass/ast";
import { Options } from "./options";
import { Func, GlobalContext, Native, Method, Node, Member, Globals, Struct, Interface, Library, Scope, If, Loop, Local, Type, Set, NodeAst, GlobalVariable } from "../jass/parser-vjass";
import { Token } from "../jass/tokenizer-common";

function genSymbols(program: Program) {


    const symbols: vscode.DocumentSymbol[] = [];
    program.globals.forEach((global) => {
        const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
        let selectRange: vscode.Range;
        if (global.nameToken) {
            selectRange = new vscode.Range(global.nameToken.line, global.nameToken.position, global.nameToken.line, global.nameToken.end.position);
        } else {
            selectRange = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
        }
        symbols.push(new vscode.DocumentSymbol(global.name, global.getContents().join(" "), (() => {
            if (global.isArray) {
                return vscode.SymbolKind.Array;
            }
            if (global.isConstant) {
                return vscode.SymbolKind.Constant;
            } else {
                return vscode.SymbolKind.Variable;
            }
        })(), range, selectRange));
    });

    try {
        program.functions.forEach((func) => {
            const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            let selectRange: vscode.Range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            const funcSymbol = new vscode.DocumentSymbol(func.name, func.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
            symbols.push(funcSymbol);

            func.globals.forEach((global) => {
                const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                let selectRange: vscode.Range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                funcSymbol.children.push(new vscode.DocumentSymbol(global.name, global.getContents().join(" "), (() => {
                    if (global.isArray) {
                        return vscode.SymbolKind.Array;
                    }
                    if (global.isConstant) {
                        return vscode.SymbolKind.Constant;
                    } else {
                        return vscode.SymbolKind.Variable;
                    }
                })(), range, selectRange));
            });
            func.locals.forEach((local) => {
                const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                let selectRange: vscode.Range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                funcSymbol.children.push(new vscode.DocumentSymbol(local.name, local.getContents().join(" "), vscode.SymbolKind.Constant, range, selectRange));
            });
        });
    } catch (error) {
        console.log(error);

    }

    program.natives.forEach((native) => {
        const range = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
        let selectRange: vscode.Range;
        if (native.nameToken) {
            selectRange = new vscode.Range(native.nameToken.line, native.nameToken.position, native.nameToken.line, native.nameToken.end.position);
        } else {
            selectRange = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
        }
        symbols.push(new vscode.DocumentSymbol(native.name, native.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange));
    });
    program.structs.forEach((struct) => {
        const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
        let selectRange: vscode.Range;
        selectRange = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
        const structSymbol = new vscode.DocumentSymbol(struct.name, struct.getContents().join(" "), vscode.SymbolKind.Class, range, selectRange)
        symbols.push(structSymbol);

        struct.methods.forEach((method) => {
            const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            let selectRange: vscode.Range;
            if (method.nameToken) {
                selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            }
            const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
            structSymbol.children.push(methodSymbol);

            method.locals.forEach((local) => {
                const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                let selectRange: vscode.Range;
                if (local.nameToken) {
                    selectRange = new vscode.Range(local.nameToken.line, local.nameToken.position, local.nameToken.line, local.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                }
                methodSymbol.children.push(new vscode.DocumentSymbol(local.name, local.getContents().join(" "), vscode.SymbolKind.Constant, range, selectRange));
            });
        });
        struct.members.forEach((member) => {
            const range = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
            let selectRange: vscode.Range;
            if (member.nameToken) {
                selectRange = new vscode.Range(member.nameToken.line, member.nameToken.position, member.nameToken.line, member.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
            }
            structSymbol.children.push(new vscode.DocumentSymbol(member.name, member.getContents().join(" "), vscode.SymbolKind.EnumMember, range, selectRange));
        });
    });
    program.interfaces.forEach((inter) => {
        const range = new vscode.Range(inter.loc.start.line, inter.loc.start.position, inter.loc.end.line, inter.loc.end.position);
        let selectRange: vscode.Range;
        selectRange = new vscode.Range(inter.loc.start.line, inter.loc.start.position, inter.loc.end.line, inter.loc.end.position);
        const interfaceSymbol = new vscode.DocumentSymbol(inter.name, inter.getContents().join(" "), vscode.SymbolKind.Interface, range, selectRange)
        symbols.push(interfaceSymbol);

        inter.methods.forEach((method) => {
            const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            let selectRange: vscode.Range;
            if (method.nameToken) {
                selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            }
            const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
            interfaceSymbol.children.push(methodSymbol);
        });
    });
    program.librarys.forEach((library) => {
        const range = new vscode.Range(library.loc.start.line, library.loc.start.position, library.loc.end.line, library.loc.end.position);
        let selectRange: vscode.Range;
        selectRange = new vscode.Range(library.loc.start.line, library.loc.start.position, library.loc.end.line, library.loc.end.position);
        const librarySymbol = new vscode.DocumentSymbol(library.name, library.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
        symbols.push(librarySymbol);

        library.globals.forEach((global) => {
            const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
            let selectRange: vscode.Range;
            if (global.nameToken) {
                selectRange = new vscode.Range(global.nameToken.line, global.nameToken.position, global.nameToken.line, global.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
            }
            librarySymbol.children.push(new vscode.DocumentSymbol(global.name, global.getContents().join(" "), (() => {
                if (global.isArray) {
                    return vscode.SymbolKind.Array;
                }
                if (global.isConstant) {
                    return vscode.SymbolKind.Constant;
                } else {
                    return vscode.SymbolKind.Variable;
                }
            })(), range, selectRange));
        });
        library.functions.forEach((func) => {
            const range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            let selectRange: vscode.Range;
            if (func.nameToken) {
                selectRange = new vscode.Range(func.nameToken.line, func.nameToken.position, func.nameToken.line, func.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            }
            const funcSymbol = new vscode.DocumentSymbol(func.name, func.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
            librarySymbol.children.push(funcSymbol);

            func.globals.forEach((global) => {
                const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                let selectRange: vscode.Range;
                if (global.nameToken) {
                    selectRange = new vscode.Range(global.nameToken.line, global.nameToken.position, global.nameToken.line, global.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                }
                funcSymbol.children.push(new vscode.DocumentSymbol(global.name, global.getContents().join(" "), (() => {
                    if (global.isArray) {
                        return vscode.SymbolKind.Array;
                    }
                    if (global.isConstant) {
                        return vscode.SymbolKind.Constant;
                    } else {
                        return vscode.SymbolKind.Variable;
                    }
                })(), range, selectRange));
            });
            func.locals.forEach((local) => {
                const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                let selectRange: vscode.Range;
                if (local.nameToken) {
                    selectRange = new vscode.Range(local.nameToken.line, local.nameToken.position, local.nameToken.line, local.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                }
                funcSymbol.children.push(new vscode.DocumentSymbol(local.name, local.getContents().join(" "), vscode.SymbolKind.Constant, range, selectRange));
            });
        });
        library.natives.forEach((native) => {
            const range = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
            let selectRange: vscode.Range;
            if (native.nameToken) {
                selectRange = new vscode.Range(native.nameToken.line, native.nameToken.position, native.nameToken.line, native.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
            }
            librarySymbol.children.push(new vscode.DocumentSymbol(native.name, native.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange));
        });
        library.structs.forEach((struct) => {
            const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            let selectRange: vscode.Range;
            selectRange = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            const structSymbol = new vscode.DocumentSymbol(struct.name, struct.getContents().join(" "), vscode.SymbolKind.Class, range, selectRange)
            librarySymbol.children.push(structSymbol);

            struct.methods.forEach((method) => {
                const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                let selectRange: vscode.Range;
                if (method.nameToken) {
                    selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                }
                const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
                structSymbol.children.push(methodSymbol);

                method.locals.forEach((local) => {
                    const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                    let selectRange: vscode.Range;
                    if (local.nameToken) {
                        selectRange = new vscode.Range(local.nameToken.line, local.nameToken.position, local.nameToken.line, local.nameToken.end.position);
                    } else {
                        selectRange = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                    }
                    methodSymbol.children.push(new vscode.DocumentSymbol(local.name, local.getContents().join(" "), vscode.SymbolKind.Constant, range, selectRange));
                });
            });
            struct.members.forEach((member) => {
                const range = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
                let selectRange: vscode.Range;
                if (member.nameToken) {
                    selectRange = new vscode.Range(member.nameToken.line, member.nameToken.position, member.nameToken.line, member.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
                }
                structSymbol.children.push(new vscode.DocumentSymbol(member.name, member.getContents().join(" "), vscode.SymbolKind.EnumMember, range, selectRange));
            });
        });
        library.interfaces.forEach((inter) => {
            const range = new vscode.Range(inter.loc.start.line, inter.loc.start.position, inter.loc.end.line, inter.loc.end.position);
            let selectRange: vscode.Range;
            selectRange = new vscode.Range(inter.loc.start.line, inter.loc.start.position, inter.loc.end.line, inter.loc.end.position);
            const interfaceSymbol = new vscode.DocumentSymbol(inter.name, inter.getContents().join(" "), vscode.SymbolKind.Interface, range, selectRange)
            librarySymbol.children.push(interfaceSymbol);

            inter.methods.forEach((method) => {
                const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                let selectRange: vscode.Range;
                if (method.nameToken) {
                    selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                }
                const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
                interfaceSymbol.children.push(methodSymbol);
            });
        });
    });
    program.types.forEach((type) => {
        const range = new vscode.Range(type.loc.start.line, type.loc.start.position, type.loc.end.line, type.loc.end.position);
        let selectRange: vscode.Range = new vscode.Range(type.loc.start.line, type.loc.start.position, type.loc.end.line, type.loc.end.position);
        symbols.push(new vscode.DocumentSymbol(type.name, type.getContents().join(" "), vscode.SymbolKind.Object, range, selectRange));
    });


    program.textMacros.forEach(textMacro => {
        const range = new vscode.Range(textMacro.start.line, textMacro.start.position, textMacro.end.line, textMacro.end.position);
        let selectRange: vscode.Range = new vscode.Range(textMacro.start.line, textMacro.start.position, textMacro.end.line, textMacro.end.position);
        symbols.push(new vscode.DocumentSymbol(textMacro.getName(), "", vscode.SymbolKind.Field, range, selectRange));
    });
    return symbols;
}

/**
 * 获取当前文档的Program对象，此方法通过计时器实现的
 * @param document 
 * @returns 
 */
async function getCurrentDocumentProgram(document: vscode.TextDocument): Promise<Program> {
    let program = new DataGetter().get(document.uri.fsPath);
    await setInterval(async () => {
        // @ts-ignore
        if (program) {
            return;
        } else {
            program = new DataGetter().get(document.uri.fsPath);
            if (program) {
                return;
            }
        }
    }, 100);
    return <Program>program;
}

/**
 * OutLine
 */
class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
        let program = new DataGetter().get(document.uri.fsPath);
        if (!program) {
            parseContent(document.uri.fsPath, document.getText());

            program = new DataGetter().get(document.uri.fsPath);
        }


        if (program) {

            const symbols = genSymbols(program);

            GlobalObject.DEFINES.filter(define => define.getContext().filePath == document.uri.fsPath).forEach(define => {
                const range = new vscode.Range(define.loc.start.line, define.loc.start.position, define.loc.end.line, define.loc.end.position);
                let selectRange: vscode.Range = new vscode.Range(define.loc.start.line, define.loc.start.position, define.loc.end.line, define.loc.end.position);
                symbols.push(new vscode.DocumentSymbol(define.name(), define.value, vscode.SymbolKind.Key, range, selectRange));
            });

            return symbols;
        }

        return undefined;
    }

}
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
