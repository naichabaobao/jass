import * as vscode from "vscode";
import { DataGetter, parseContent } from "./data";
import { GlobalObject, Program } from "../jass/ast";
import { Options } from "./options";
import { Func, Global, Native, Method, Node, Member, Globals, Struct, Interface, Library, Scope, If, Loop, Local, Type, Set } from "../jass/parser-vjass";
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

class DocumentSymbolExprProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken) {
        const symbols: vscode.DocumentSymbol[] = [];
        let doc = Global.get(document.fileName);
        if (!doc) {
            return;
        }


        const handle = (parent: vscode.DocumentSymbol | null, node: Node) => {
            // let name: string = "";
            let detail: string = "";
            let symbol: vscode.DocumentSymbol | null = null;
            // if (node.data) {
            //     if ("name" in node.data) {
            //         name = node.data.name;
            //     }
            // }
            if (node.type) {
                detail = node.type;
                if (node.start_line) {
                    const tokens = node.start_line.tokens();
                    if (tokens.length > 0) {
                        let range: vscode.Range | null = null;
                        if (node.end_line) {
                            const end_tokens = node.end_line.tokens();
                            range = new vscode.Range(tokens[0].line, tokens[0].character, node.end_line.line, 0);
                        } else if (node.body.length > 0) {
                            const last_body_line = node.body[node.body.length - 1];
                            const end_tokens = last_body_line.line.tokens();
                            range = new vscode.Range(tokens[0].line, tokens[0].character, last_body_line.line.line, 0);
                        }
                        if (range) {
                            let name_token: Token | null = null;
                            let kind: vscode.SymbolKind = vscode.SymbolKind.Key;
                            if (node.data instanceof Func || node.data instanceof Native || node.data instanceof Method) {
                                name_token = node.data.name;
                                if (node.parent && node.parent.data instanceof Library && node.parent.data.initializer && node.parent.data.initializer.getText() == node.data.name?.getText()) {
                                    kind = vscode.SymbolKind.Event;
                                } else {
                                    kind = vscode.SymbolKind.Function;
                                }
                            } else if (node.data instanceof Globals) {
                                name_token = tokens[0];
                                kind = vscode.SymbolKind.Package;
                            } else if (node.data instanceof Interface) {
                                name_token = node.data.name;
                                kind = vscode.SymbolKind.Interface;
                            } else if (node.data instanceof Struct) {
                                name_token = node.data.name;
                                kind = vscode.SymbolKind.Class;
                            } else if (node.data instanceof Library) {
                                name_token = node.data.name;
                                kind = vscode.SymbolKind.Namespace;
                            } else if (node.data instanceof Scope) {
                                name_token = node.data.name;
                                kind = vscode.SymbolKind.Namespace;
                            } else if (node.data instanceof If) {
                                name_token = tokens[0];
                                kind = vscode.SymbolKind.Boolean;
                            } else if (node.data instanceof Loop) {
                                name_token = tokens[0];
                                kind = vscode.SymbolKind.Array;
                            } else if (node.data instanceof Member) {
                                name_token = node.data.name;
                                if (node.data.qualifier?.getText() == "constant") {
                                    kind = vscode.SymbolKind.Constant;
                                } else if (node.data.is_array) {
                                    kind = vscode.SymbolKind.Array;
                                } else if (node.data.modifier?.getText() == "static") {
                                    kind = vscode.SymbolKind.Property;
                                } else {
                                    kind = vscode.SymbolKind.EnumMember;
                                }
                            } else {
                                name_token = tokens[0];
                                kind = vscode.SymbolKind.Key;
                            }
                            if (node.data.to_string) {
                                let selectRange: vscode.Range = new vscode.Range(node.start_line.line, 0, node.end_line?.line ?? node.start_line.line, 0);
                                symbol = new vscode.DocumentSymbol(node.data.to_string(), detail, kind, range, selectRange);
                                if (parent) {
                                    parent.children.push(symbol)
                                } else {
                                    symbols.push(symbol);
                                    // return symbol;
                                }
                            }
                            else if (name_token) {
                                let selectRange: vscode.Range = new vscode.Range(name_token.line, name_token.start.position, name_token.line, name_token.end.position);
                                symbol = new vscode.DocumentSymbol(name_token.getText(), detail, kind, range, selectRange);
                                if (parent) {
                                    parent.children.push(symbol)
                                } else {
                                    symbols.push(symbol);
                                    // return symbol;
                                }
                            }

                        }
                    }
                }
            }

            // 行成员
            node.body.forEach((body_line, index) => {
                const body_line_data = node.body_datas[index];

                let name_token: Token | null = null;
                let kind: vscode.SymbolKind = vscode.SymbolKind.Key;
                let range: vscode.Range | null = null;
                let selectRange: vscode.Range | null = null;
                const tokens = body_line.line.tokens();

                if (body_line_data instanceof Member) {
                    name_token = body_line_data.name;
                    if (body_line_data.qualifier && body_line_data.qualifier.getText() == "constant") {
                        kind = vscode.SymbolKind.Constant;
                    } else if (body_line_data.is_array) {
                        kind = vscode.SymbolKind.Array;
                    } else if (body_line_data.modifier && body_line_data.modifier.getText() == "static") {
                        kind = vscode.SymbolKind.Property;
                    } else {
                        kind = vscode.SymbolKind.EnumMember;
                    }

                    if (body_line_data.name) {
                        // let name = "";
                        const start_line = body_line.line.line;
                        const start_position = 0;
                        const end_line = body_line.line.line;
                        const end_position = tokens[tokens.length - 1].end.position;
                        const range = new vscode.Range(new vscode.Position(start_line, start_position), new vscode.Position(end_line, end_position));
                        let selectRange = new vscode.Range(new vscode.Position(start_line, start_position), new vscode.Position(end_line, end_position));
                        const symbol = new vscode.DocumentSymbol(body_line_data.to_string(), body_line.type, kind, range, selectRange);
                        if (parent) {
                            parent.children.push(symbol)
                        } else {
                            symbols.push(symbol);
                            // return symbol;
                        }
                    }
                } else if (body_line_data instanceof Local) {
                    name_token = body_line_data.name;
                    if (body_line_data.is_array) {
                        kind = vscode.SymbolKind.Array;
                    } else {
                        kind = vscode.SymbolKind.Variable;
                    }
                } else if (body_line_data instanceof Native) {
                    name_token = body_line_data.name;
                    kind = vscode.SymbolKind.Function;
                } else if (body_line_data instanceof Method) {
                    name_token = body_line_data.name;
                    kind = vscode.SymbolKind.Method;
                } else if (body_line_data instanceof Type) {
                    name_token = body_line_data.name;
                    kind = vscode.SymbolKind.Class;
                } else if (body_line_data instanceof Set) {
                    if (body_line_data.name) {
                        // let name = "";
                        const range = new vscode.Range(tokens[0].line, tokens[0].character, tokens[tokens.length - 1].line, tokens[tokens.length - 1].end.position);
                        let selectRange = range;
                        if (body_line_data.name.names.length > 0) {
                            const start = body_line_data.name;
                            const end = body_line_data.name;
                            const start_line = start.get_start_line_number();
                            const start_position = start.get_start_line_position();
                            const end_line = end.get_end_line_number();
                            const end_position = end.get_end_line_position();
                            selectRange.with(new vscode.Position(start_line, start_position), new vscode.Position(end_line, end_position));
                        }
                        const symbol = new vscode.DocumentSymbol(body_line_data.to_string(), "set", vscode.SymbolKind.Variable, range, selectRange);
                        if (parent) {
                            parent.children.push(symbol)
                        } else {
                            symbols.push(symbol);
                            // return symbol;
                        }
                    }
                } else {
                }
                if (tokens.length > 0) {
                    range = new vscode.Range(tokens[0].line, tokens[0].character, tokens[tokens.length - 1].line, tokens[tokens.length - 1].end.position);
                }
                if (name_token) {
                    selectRange = new vscode.Range(name_token.line, name_token.start.position, name_token.line, name_token.end.position);
                }

                if (name_token && range && selectRange) {

                    const symbol = new vscode.DocumentSymbol(name_token.getText(), body_line.type, kind, range, selectRange);
                    if (parent) {
                        parent.children.push(symbol)
                    } else {
                        symbols.push(symbol);
                        // return symbol;
                    }
                }
            });

            node.children.forEach(child_node => {
                handle(symbol, child_node);
            });
        };
        try {

            handle(null, doc.root_node!);
        } catch (error) {
            console.error(error);

        }

        return symbols;
    }

}

vscode.languages.registerDocumentSymbolProvider("jass", new DocumentSymbolExprProvider());
