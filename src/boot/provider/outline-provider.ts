import * as vscode from "vscode";
import { DataGetter, parseContent } from "./data";
import { Program } from "../jass/ast";
import { Options } from "./options";

function genSymbols(program:Program) {
    
    
    const symbols:vscode.DocumentSymbol[] = [];
    program.globals.forEach((global) => {
        const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
        let selectRange:vscode.Range;
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
            let selectRange:vscode.Range = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            const funcSymbol = new vscode.DocumentSymbol(func.name, func.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
            symbols.push(funcSymbol);
    
            func.globals.forEach((global) => {
                const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                let selectRange:vscode.Range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
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
                let selectRange:vscode.Range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                funcSymbol.children.push(new vscode.DocumentSymbol(local.name, local.getContents().join(" "), vscode.SymbolKind.Constant, range, selectRange));
            });
        });
    } catch (error) {
        console.log(error);
        
    }

    program.natives.forEach((native) => {
        const range = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
        let selectRange:vscode.Range;
        if (native.nameToken) {
            selectRange = new vscode.Range(native.nameToken.line, native.nameToken.position, native.nameToken.line, native.nameToken.end.position);
        } else {
            selectRange = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
        }
        symbols.push(new vscode.DocumentSymbol(native.name, native.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange));
    });
    program.structs.forEach((struct) => {
        const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
        let selectRange:vscode.Range;
        selectRange = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
        const structSymbol = new vscode.DocumentSymbol(struct.name, struct.getContents().join(" "), vscode.SymbolKind.Class, range, selectRange)
        symbols.push(structSymbol);

        struct.methods.forEach((method) => {
            const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            let selectRange:vscode.Range;
            if (method.nameToken) {
                selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
            }
            const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
            structSymbol.children.push(methodSymbol);

            method.locals.forEach((local) => {
                const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                let selectRange:vscode.Range;
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
            let selectRange:vscode.Range;
            if (member.nameToken) {
                selectRange = new vscode.Range(member.nameToken.line, member.nameToken.position, member.nameToken.line, member.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
            }
            structSymbol.children.push(new vscode.DocumentSymbol(member.name, member.getContents().join(" "), vscode.SymbolKind.EnumMember, range, selectRange));
        });
    });
    program.librarys.forEach((library) => {
        const range = new vscode.Range(library.loc.start.line, library.loc.start.position, library.loc.end.line, library.loc.end.position);
        let selectRange:vscode.Range;
        selectRange = new vscode.Range(library.loc.start.line, library.loc.start.position, library.loc.end.line, library.loc.end.position);
        const librarySymbol = new vscode.DocumentSymbol(library.name, library.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
        symbols.push(librarySymbol);

        library.globals.forEach((global) => {
            const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
            let selectRange:vscode.Range;
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
            let selectRange:vscode.Range;
            if (func.nameToken) {
                selectRange = new vscode.Range(func.nameToken.line, func.nameToken.position, func.nameToken.line, func.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(func.loc.start.line, func.loc.start.position, func.loc.end.line, func.loc.end.position);
            }
            const funcSymbol = new vscode.DocumentSymbol(func.name, func.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange);
            librarySymbol.children.push(funcSymbol);

            func.globals.forEach((global) => {
                const range = new vscode.Range(global.loc.start.line, global.loc.start.position, global.loc.end.line, global.loc.end.position);
                let selectRange:vscode.Range;
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
                let selectRange:vscode.Range;
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
            let selectRange:vscode.Range;
            if (native.nameToken) {
                selectRange = new vscode.Range(native.nameToken.line, native.nameToken.position, native.nameToken.line, native.nameToken.end.position);
            } else {
                selectRange = new vscode.Range(native.loc.start.line, native.loc.start.position, native.loc.end.line, native.loc.end.position);
            }
            librarySymbol.children.push(new vscode.DocumentSymbol(native.name, native.getContents().join(" "), vscode.SymbolKind.Function, range, selectRange));
        });
        library.structs.forEach((struct) => {
            const range = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            let selectRange:vscode.Range;
            selectRange = new vscode.Range(struct.loc.start.line, struct.loc.start.position, struct.loc.end.line, struct.loc.end.position);
            const structSymbol = new vscode.DocumentSymbol(struct.name, struct.getContents().join(" "), vscode.SymbolKind.Class, range, selectRange)
            librarySymbol.children.push(structSymbol);

            struct.methods.forEach((method) => {
                const range = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                let selectRange:vscode.Range;
                if (method.nameToken) {
                    selectRange = new vscode.Range(method.nameToken.line, method.nameToken.position, method.nameToken.line, method.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(method.loc.start.line, method.loc.start.position, method.loc.end.line, method.loc.end.position);
                }
                const methodSymbol = new vscode.DocumentSymbol(method.name, method.getContents().join(" "), vscode.SymbolKind.Method, range, selectRange);
                structSymbol.children.push(methodSymbol);

                method.locals.forEach((local) => {
                    const range = new vscode.Range(local.loc.start.line, local.loc.start.position, local.loc.end.line, local.loc.end.position);
                    let selectRange:vscode.Range;
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
                let selectRange:vscode.Range;
                if (member.nameToken) {
                    selectRange = new vscode.Range(member.nameToken.line, member.nameToken.position, member.nameToken.line, member.nameToken.end.position);
                } else {
                    selectRange = new vscode.Range(member.loc.start.line, member.loc.start.position, member.loc.end.line, member.loc.end.position);
                }
                structSymbol.children.push(new vscode.DocumentSymbol(member.name, member.getContents().join(" "), vscode.SymbolKind.EnumMember, range, selectRange));
            });
        });
    });
    program.types.forEach((type) => {
        const range = new vscode.Range(type.loc.start.line, type.loc.start.position, type.loc.end.line, type.loc.end.position);
        let selectRange:vscode.Range = new vscode.Range(type.loc.start.line, type.loc.start.position, type.loc.end.line, type.loc.end.position);
        symbols.push(new vscode.DocumentSymbol(type.name, type.getContents().join(" "), vscode.SymbolKind.Object, range, selectRange));
    });
    
    program.defines.forEach(define => {
        const range = new vscode.Range(define.loc.start.line, define.loc.start.position, define.loc.end.line, define.loc.end.position);
        let selectRange:vscode.Range = new vscode.Range(define.loc.start.line, define.loc.start.position, define.loc.end.line, define.loc.end.position);
        symbols.push(new vscode.DocumentSymbol(define.name, define.value, vscode.SymbolKind.Key, range, selectRange));
    });
    program.textMacros.forEach(textMacro => {
        const range = new vscode.Range(textMacro.start.line, textMacro.start.position, textMacro.end.line, textMacro.end.position);
        let selectRange:vscode.Range = new vscode.Range(textMacro.start.line, textMacro.start.position, textMacro.end.line, textMacro.end.position);
        symbols.push(new vscode.DocumentSymbol(textMacro.getName(), "", vscode.SymbolKind.Field, range, selectRange));
    });
    return symbols;
}

/**
 * 获取当前文档的Program对象，此方法通过计时器实现的
 * @param document 
 * @returns 
 */
async function getCurrentDocumentProgram(document: vscode.TextDocument):Promise<Program> {
    let program = new DataGetter().get(document.uri.fsPath);
    await setInterval(async () => {
        // @ts-ignore
        if (program) {
            return;
        } else {
            program  = new DataGetter().get(document.uri.fsPath);
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
            return symbols;
        }

        return undefined;
    }
    
}

vscode.languages.registerDocumentSymbolProvider("jass", new DocumentSymbolProvider());
