import * as vscode from 'vscode';
import { GlobalContext } from '../../jass/parser-vjass';
import * as vjass_ast from '../../jass/parser-vjass';
import { Position } from '../../jass/loc';
import * as path from 'path';

export class GlobalsProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('jass-globals');
        this.registerProviders();
    }

    private registerProviders() {
        // Completion Provider
        vscode.languages.registerCompletionItemProvider('jass', {
            provideCompletionItems: (document, position, token, context) => {
                const items: vscode.CompletionItem[] = [];
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    ((program as any).global_variables || []).forEach((global: any) => {
                        const item = new vscode.CompletionItem(
                            global.name?.getText() ?? '(unknown)',
                            global.is_constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable
                        );
                        
                        const ms = new vscode.MarkdownString();
                        ms.appendCodeblock(global.to_string());
                        global.description.forEach((desc: any) => {
                            ms.appendMarkdown(desc);
                            ms.appendText('\n');
                        });
                        item.documentation = ms;
                        
                        if (global.is_deprecated) {
                            item.tags = [vscode.CompletionItemTag.Deprecated];
                        }
                        
                        items.push(item);
                    });

                    // Zinc结构体成员
                    program.get_all_structs().forEach((struct: any) => {
                        if ('members' in struct) {
                            (struct as any).members.forEach((member: any) => {
                                const item = new vscode.CompletionItem(
                                    member.name?.getText() ?? '(unknown)',
                                    member.is_constant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable
                                );
                                
                                const ms = new vscode.MarkdownString();
                                ms.appendCodeblock(member.to_string());
                                member.description.forEach((desc: string) => {
                                    ms.appendMarkdown(desc);
                                    ms.appendText('\n');
                                });
                                item.documentation = ms;
                                
                                if (member.is_deprecated) {
                                    item.tags = [vscode.CompletionItemTag.Deprecated];
                                }
                                
                                items.push(item);
                            });
                        }
                    });
                }
                
                return items;
            }
        });

        // Hover Provider
        vscode.languages.registerHoverProvider('jass', {
            provideHover: (document, position, token) => {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) return null;
                
                const word = document.getText(wordRange);
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    const global = ((program as any).global_variables || []).find((g: any) => g.name?.getText() === word);
                    if (global) {
                        const ms = new vscode.MarkdownString();
                        ms.appendMarkdown(`**${global.name?.getText()}**\n\n`);
                        ms.appendCodeblock(global.to_string());
                        global.description.forEach((desc: any) => {
                            ms.appendMarkdown(desc);
                            ms.appendText('\n');
                        });
                        return new vscode.Hover(ms, wordRange);
                    }

                    // Zinc结构体成员
                    for (const struct of program.get_all_structs()) {
                        if ('members' in struct) {
                            const member = (struct as any).members.find((m: any) => m.name?.getText() === word);
                            if (member) {
                                const ms = new vscode.MarkdownString();
                                ms.appendMarkdown(`**${member.name?.getText()}**\n\n`);
                                ms.appendCodeblock(member.to_string());
                                member.description.forEach((desc: string) => {
                                    ms.appendMarkdown(desc);
                                    ms.appendText('\n');
                                });
                                return new vscode.Hover(ms, wordRange);
                            }
                        }
                    }
                }
                return null;
            }
        });

        // Definition Provider
        vscode.languages.registerDefinitionProvider('jass', {
            provideDefinition: (document, position, token) => {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) return null;
                
                const word = document.getText(wordRange);
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    const global = ((program as any).global_variables || []).find((g: any) => g.name?.getText() === word);
                    if (global && global.name) {
                        const startPos = new vscode.Position(
                            global.name.line,
                            global.name.index
                        );
                        const endPos = new vscode.Position(
                            global.name.line,
                            global.name.index + global.name.getText().length
                        );
                        return new vscode.Location(
                            vscode.Uri.file(global.document.filePath),
                            new vscode.Range(startPos, endPos)
                        );
                    }

                    // Zinc结构体成员
                    for (const struct of program.get_all_structs()) {
                        if ('members' in struct) {
                            const member = (struct as any).members.find((m: any) => m.name?.getText() === word);
                            if (member && member.name) {
                                const startPos = new vscode.Position(
                                    member.name.line,
                                    member.name.position
                                );
                                const endPos = new vscode.Position(
                                    member.name.line,
                                    member.name.position + member.name.getText().length
                                );
                                return new vscode.Location(
                                    vscode.Uri.file(member.document.filePath),
                                    new vscode.Range(startPos, endPos)
                                );
                            }
                        }
                    }
                }
                return null;
            }
        });

        // Reference Provider
        vscode.languages.registerReferenceProvider('jass', {
            provideReferences: (document, position, context, token) => {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) return null;
                
                const word = document.getText(wordRange);
                const locations: vscode.Location[] = [];
                
                GlobalContext.keys.forEach(key => {
                    const program = GlobalContext.get(key);
                    if (program) {
                        // Jass全局变量
                        ((program as any).global_variables || []).forEach((global: any) => {
                            if (global.name?.getText() === word) {
                                // 添加定义位置
                                if (global.name) {
                                    locations.push(new vscode.Location(
                                        vscode.Uri.file(global.document.filePath),
                                        new vscode.Range(
                                            new vscode.Position(global.name.line, global.name.index),
                                            new vscode.Position(global.name.line, global.name.index + global.name.getText().length)
                                        )
                                    ));
                                }

                                // 查找所有引用
                                const text = (program.program as any).to_string();
                                const lines = text.split('\n');
                                let inGlobalsBlock = false;
                                
                                for (let i = 0; i < lines.length; i++) {
                                    const line = lines[i];
                                    
                                    if (line.trim().toLowerCase() === 'globals') {
                                        inGlobalsBlock = true;
                                        continue;
                                    }
                                    
                                    if (line.trim().toLowerCase() === 'endglobals') {
                                        inGlobalsBlock = false;
                                        continue;
                                    }
                                    
                                    // 使用正则表达式匹配变量名，确保只匹配完整的变量名
                                    const regex = new RegExp(`\\b${word}\\b`, 'g');
                                    let match;
                                    while ((match = regex.exec(line)) !== null) {
                                        // 跳过定义位置
                                        if (inGlobalsBlock && global.name && 
                                            i === global.name.line && 
                                            match.index === global.name.index) {
                                            continue;
                                        }
                                        
                                        locations.push(new vscode.Location(
                                            vscode.Uri.file(global.document.filePath),
                                            new vscode.Range(
                                                new vscode.Position(i, match.index),
                                                new vscode.Position(i, match.index + word.length)
                                            )
                                        ));
                                    }
                                }
                            }
                        });

                        // Zinc结构体成员
                        program.get_all_structs().forEach((struct: any) => {
                            if ('members' in struct) {
                                (struct as any).members.forEach((member: any) => {
                                    if (member.name?.getText() === word) {
                                        // 添加定义位置
                                        if (member.name) {
                                            locations.push(new vscode.Location(
                                                vscode.Uri.file(member.document.filePath),
                                                new vscode.Range(
                                                    new vscode.Position(member.name.line, member.name.position),
                                                    new vscode.Position(member.name.line, member.name.position + member.name.getText().length)
                                                )
                                            ));
                                        }

                                        // 查找所有引用
                                        const text = (struct as any).to_string();
                                        const lines = text.split('\n');
                                        let inStructBlock = false;
                                        for (let i = 0; i < lines.length; i++) {
                                            const line = lines[i];
                                            if (line.trim().toLowerCase() === 'struct') {
                                                inStructBlock = true;
                                                continue;
                                            }
                                            if (line.trim().toLowerCase() === 'endstruct') {
                                                inStructBlock = false;
                                                continue;
                                            }
                                            // 使用正则表达式匹配变量名，确保只匹配完整的变量名
                                            const regex = new RegExp(`\\b${word}\\b`, 'g');
                                            let match;
                                            while ((match = regex.exec(line)) !== null) {
                                                // 跳过定义位置
                                                if (inStructBlock && member.name && 
                                                    i === member.name.line && 
                                                    match.index === member.name.position) {
                                                    continue;
                                                }
                                                locations.push(new vscode.Location(
                                                    vscode.Uri.file(member.document.filePath),
                                                    new vscode.Range(
                                                        new vscode.Position(i, match.index),
                                                        new vscode.Position(i, match.index + word.length)
                                                    )
                                                ));
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
                
                return locations;
            }
        });

        // Document Symbol Provider
        vscode.languages.registerDocumentSymbolProvider('jass', {
            provideDocumentSymbols: (document, token) => {
                const symbols: vscode.SymbolInformation[] = [];
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    ((program as any).global_variables || []).forEach((global: any) => {
                        if (global.name) {
                            const symbol = new vscode.SymbolInformation(
                                global.name.getText(),
                                global.is_constant ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable,
                                '',
                                new vscode.Location(
                                    vscode.Uri.file(global.document.filePath),
                                    new vscode.Range(
                                        new vscode.Position(global.name.line, global.name.index),
                                        new vscode.Position(global.name.line, global.name.index + global.name.getText().length)
                                    )
                                )
                            );
                            
                            // 添加废弃标记
                            if (global.is_deprecated) {
                                symbol.tags = [vscode.SymbolTag.Deprecated];
                            }
                            
                            symbols.push(symbol);
                        }
                    });

                    // Zinc结构体成员
                    program.get_all_structs().forEach((struct: any) => {
                        if ('members' in struct) {
                            (struct as any).members.forEach((member: any) => {
                                if (member.name) {
                                    const symbol = new vscode.SymbolInformation(
                                        member.name.getText(),
                                        member.is_constant ? vscode.SymbolKind.Constant : vscode.SymbolKind.Variable,
                                        '',
                                        new vscode.Location(
                                            vscode.Uri.file(member.document.filePath),
                                            new vscode.Range(
                                                new vscode.Position(member.name.line, member.name.position),
                                                new vscode.Position(member.name.line, member.name.position + member.name.getText().length)
                                            )
                                        )
                                    );
                                    
                                    // 添加废弃标记
                                    if (member.is_deprecated) {
                                        symbol.tags = [vscode.SymbolTag.Deprecated];
                                    }
                                    
                                    symbols.push(symbol);
                                }
                            });
                        }
                    });
                }
                
                return symbols;
            }
        });

        // Code Action Provider
        vscode.languages.registerCodeActionsProvider('jass', {
            provideCodeActions: (document, range, context, token) => {
                const actions: vscode.CodeAction[] = [];
                
                context.diagnostics.forEach(diagnostic => {
                    if (diagnostic.code === 'undefined-global') {
                        const action = new vscode.CodeAction('Create global variable', vscode.CodeActionKind.QuickFix);
                        action.diagnostics = [diagnostic];
                        action.isPreferred = true;
                        action.edit = new vscode.WorkspaceEdit();
                        action.edit.insert(
                            document.uri,
                            new vscode.Position(0, 0),
                            `globals\n    ${diagnostic.message}\nendglobals\n\n`
                        );
                        actions.push(action);
                    }
                });
                
                return actions;
            }
        });

        // Rename Provider
        vscode.languages.registerRenameProvider('jass', {
            provideRenameEdits: (document, position, newName, token) => {
                const wordRange = document.getWordRangeAtPosition(position);
                if (!wordRange) return null;
                
                const word = document.getText(wordRange);
                const edit = new vscode.WorkspaceEdit();
                
                GlobalContext.keys.forEach(key => {
                    const program = GlobalContext.get(key);
                    if (program && program.program) {
                        // 处理Jass全局变量
                        ((program as any).global_variables || []).forEach((global: any) => {
                            if (global.name?.getText() === word) {
                                // 处理定义位置
                                if (global.name) {
                                    edit.replace(
                                        vscode.Uri.file(global.document.filePath),
                                        new vscode.Range(
                                            new vscode.Position(global.name.line, global.name.index),
                                            new vscode.Position(global.name.line, global.name.index + global.name.getText().length)
                                        ),
                                        newName
                                    );
                                }

                                // 遍历AST查找所有引用
                                const findReferences = (node: vjass_ast.NodeAst) => {
                                    if (!node) return;

                                    // 检查Set语句
                                    if (node instanceof vjass_ast.Set) {
                                        if (node.name?.names) {
                                            node.name.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Call语句
                                    else if (node instanceof vjass_ast.Call) {
                                        if (node.ref?.names) {
                                            node.ref.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Return语句
                                    else if (node instanceof vjass_ast.Return) {
                                        if (node.expr instanceof vjass_ast.VariableName) {
                                            node.expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查If语句
                                    else if (node instanceof vjass_ast.If) {
                                        if ((node as any).expr instanceof vjass_ast.VariableName) {
                                            (node as any).expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查ExitWhen语句
                                    else if (node instanceof vjass_ast.ExitWhen) {
                                        if ((node as any).expr instanceof vjass_ast.VariableName) {
                                            (node as any).expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Local语句
                                    else if (node instanceof vjass_ast.Local) {
                                        if ((node as any).expr instanceof vjass_ast.VariableName) {
                                            (node as any).expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查循环语句（For和While）
                                    else if (node instanceof vjass_ast.Loop) {
                                        if ((node as any).expr instanceof vjass_ast.VariableName) {
                                            (node as any).expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Struct语句
                                    else if (node instanceof vjass_ast.Struct) {
                                        if ((node as any).index_expr instanceof vjass_ast.VariableName) {
                                            (node as any).index_expr.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Library语句
                                    else if (node instanceof vjass_ast.Library) {
                                        if ((node as any).initializer instanceof vjass_ast.VariableName) {
                                            (node as any).initializer.names.forEach((name: any) => {
                                                if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                    const range = new vscode.Range(
                                                        new vscode.Position(name.expr.line, name.expr.character),
                                                        new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                    );
                                                    const oldText = document.getText(range);
                                                    if (oldText === word) {
                                                        edit.replace(
                                                            vscode.Uri.file(global.document.filePath),
                                                            range,
                                                            newName
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    // 检查Scope语句
                                    else if (node instanceof vjass_ast.Scope) {
                                        if ((node as any).name?.getText() === word) {
                                            const range = new vscode.Range(
                                                new vscode.Position((node as any).name.line, (node as any).name.position),
                                                new vscode.Position((node as any).name.line, (node as any).name.position + (node as any).name.getText().length)
                                            );
                                            const oldText = document.getText(range);
                                            if (oldText === word) {
                                                edit.replace(
                                                    vscode.Uri.file(global.document.filePath),
                                                    range,
                                                    newName
                                                );
                                            }
                                        }
                                    }

                                    // 递归检查子节点
                                    if (node.children) {
                                        node.children.forEach(child => findReferences(child));
                                    }
                                };

                                // 从根节点开始遍历AST
                                if (program.program) {
                                    findReferences(program.program);
                                }
                            }
                        });

                        // 处理Zinc结构体成员
                        program.get_all_structs().forEach((struct: any) => {
                            if ('members' in struct) {
                                (struct as any).members.forEach((member: any) => {
                                    if (member.name?.getText() === word) {
                                        // 处理定义位置
                                        if (member.name) {
                                            edit.replace(
                                                vscode.Uri.file(member.document.filePath),
                                                new vscode.Range(
                                                    new vscode.Position(member.name.line, member.name.position),
                                                    new vscode.Position(member.name.line, member.name.position + member.name.getText().length)
                                                ),
                                                newName
                                            );
                                        }

                                        // 遍历AST查找所有引用
                                        const findReferences = (node: vjass_ast.NodeAst) => {
                                            if (!node) return;

                                            // 检查Set语句
                                            if (node instanceof vjass_ast.Set) {
                                                if (node.name?.names) {
                                                    node.name.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查Call语句
                                            else if (node instanceof vjass_ast.Call) {
                                                if (node.ref?.names) {
                                                    node.ref.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查Return语句
                                            else if (node instanceof vjass_ast.Return) {
                                                if (node.expr instanceof vjass_ast.VariableName) {
                                                    node.expr.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查If语句
                                            else if (node instanceof vjass_ast.If) {
                                                if ((node as any).expr instanceof vjass_ast.VariableName) {
                                                    (node as any).expr.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查ExitWhen语句
                                            else if (node instanceof vjass_ast.ExitWhen) {
                                                if ((node as any).expr instanceof vjass_ast.VariableName) {
                                                    (node as any).expr.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查Local语句
                                            else if (node instanceof vjass_ast.Local) {
                                                if ((node as any).expr instanceof vjass_ast.VariableName) {
                                                    (node as any).expr.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            // 检查循环语句（For和While）
                                            else if (node instanceof vjass_ast.Loop) {
                                                if ((node as any).expr instanceof vjass_ast.VariableName) {
                                                    (node as any).expr.names.forEach((name: any) => {
                                                        if (name instanceof vjass_ast.Id && name.expr?.getText() === word) {
                                                            const range = new vscode.Range(
                                                                new vscode.Position(name.expr.line, name.expr.character),
                                                                new vscode.Position(name.expr.line, name.expr.character + word.length)
                                                            );
                                                            const oldText = document.getText(range);
                                                            if (oldText === word) {
                                                                edit.replace(
                                                                    vscode.Uri.file(member.document.filePath),
                                                                    range,
                                                                    newName
                                                                );
                                                            }
                                                        }
                                                    });
                                                }
                                            }

                                            // 递归检查子节点
                                            if (node.children) {
                                                node.children.forEach(child => findReferences(child));
                                            }
                                        };

                                        // 从根节点开始遍历AST
                                        if (program.program) {
                                            findReferences(program.program);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
                
                return edit;
            }
        });

        // Folding Range Provider
        vscode.languages.registerFoldingRangeProvider('jass', {
            provideFoldingRanges: (document, context, token) => {
                const ranges: vscode.FoldingRange[] = [];
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    ((program as any).global_variables || []).forEach((global: any) => {
                        ranges.push(new vscode.FoldingRange(
                            global.start.line,
                            global.end.line,
                            vscode.FoldingRangeKind.Region
                        ));
                    });

                    // Zinc结构体成员
                    program.get_all_structs().forEach((struct: any) => {
                        if ('members' in struct) {
                            (struct as any).members.forEach((member: any) => {
                                ranges.push(new vscode.FoldingRange(
                                    member.start.line,
                                    member.end.line,
                                    vscode.FoldingRangeKind.Region
                                ));
                            });
                        }
                    });
                }
                
                return ranges;
            }
        });

        // CodeLens Provider
        vscode.languages.registerCodeLensProvider('jass', {
            provideCodeLenses: (document, token) => {
                const codeLenses: vscode.CodeLens[] = [];
                const program = GlobalContext.get(document.uri.fsPath);
                
                if (program) {
                    // Jass全局变量
                    ((program as any).global_variables || []).forEach((global: any) => {
                        if (global.name) {
                            // 计算引用次数
                            let referenceCount = 0;
                            const text = (program.program as any).to_string();
                            const lines = text.split('\n');
                            let inGlobalsBlock = false;
                            
                            for (let i = 0; i < lines.length; i++) {
                                const line = lines[i];
                                
                                if (line.trim().toLowerCase() === 'globals') {
                                    inGlobalsBlock = true;
                                    continue;
                                }
                                
                                if (line.trim().toLowerCase() === 'endglobals') {
                                    inGlobalsBlock = false;
                                    continue;
                                }
                                
                                // 使用正则表达式匹配变量名，确保只匹配完整的变量名
                                const regex = new RegExp(`\\b${global.name.getText()}\\b`, 'g');
                                let match;
                                while ((match = regex.exec(line)) !== null) {
                                    // 跳过定义位置
                                    if (inGlobalsBlock && global.name && 
                                        i === global.name.line && 
                                        match.index === global.name.index) {
                                        continue;
                                    }
                                    referenceCount++;
                                }
                            }

                            const range = new vscode.Range(
                                new vscode.Position(global.name.line, global.name.index),
                                new vscode.Position(global.name.line, global.name.index + global.name.getText().length)
                            );

                            // 添加引用计数
                            codeLenses.push(new vscode.CodeLens(range, {
                                title: `$(references) ${referenceCount} references`,
                                command: 'editor.action.showReferences',
                                arguments: [
                                    document.uri,
                                    new vscode.Position(global.name.line, global.name.index)
                                ]
                            }));

                            // 添加文件路径
                            const relativePath = path.relative(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', global.document.filePath);
                            codeLenses.push(new vscode.CodeLens(range, {
                                title: `$(file) ${relativePath}`,
                                command: ''
                            }));

                            // 添加类型信息
                            if (global.type) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: `$(symbol-variable) Type: ${global.type.getText()}`,
                                    command: ''
                                }));
                            }

                            // 添加可见性信息
                            if (global.is_private) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: '$(lock) Private',
                                    command: ''
                                }));
                            } else if (global.is_public) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: '$(globe) Public',
                                    command: ''
                                }));
                            }

                            // 添加常量标记
                            if (global.is_constant) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: '$(symbol-constant) Constant',
                                    command: ''
                                }));
                            }

                            // 添加数组标记
                            if (global.is_array) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: '$(symbol-array) Array',
                                    command: ''
                                }));
                            }

                            // 添加废弃标记
                            if (global.is_deprecated) {
                                codeLenses.push(new vscode.CodeLens(range, {
                                    title: '$(warning) Deprecated',
                                    command: ''
                                }));
                            }
                        }
                    });

                    // Zinc结构体成员
                    program.get_all_structs().forEach((struct: any) => {
                        if ('members' in struct) {
                            (struct as any).members.forEach((member: any) => {
                                if (member.name) {
                                    // 计算引用次数
                                    let referenceCount = 0;
                                    const text = (struct as any).to_string();
                                    const lines = text.split('\n');
                                    let inStructBlock = false;
                                    
                                    for (let i = 0; i < lines.length; i++) {
                                        const line = lines[i];
                                        
                                        if (line.trim().toLowerCase() === 'struct') {
                                            inStructBlock = true;
                                            continue;
                                        }
                                        
                                        if (line.trim().toLowerCase() === 'endstruct') {
                                            inStructBlock = false;
                                            continue;
                                        }
                                        
                                        // 使用正则表达式匹配变量名，确保只匹配完整的变量名
                                        const regex = new RegExp(`\\b${member.name.getText()}\\b`, 'g');
                                        let match;
                                        while ((match = regex.exec(line)) !== null) {
                                            // 跳过定义位置
                                            if (inStructBlock && member.name && 
                                                i === member.name.line && 
                                                match.index === member.name.position) {
                                                continue;
                                            }
                                            referenceCount++;
                                        }
                                    }

                                    const range = new vscode.Range(
                                        new vscode.Position(member.name.line, member.name.position),
                                        new vscode.Position(member.name.line, member.name.position + member.name.getText().length)
                                    );

                                    // 添加引用计数
                                    codeLenses.push(new vscode.CodeLens(range, {
                                        title: `$(references) ${referenceCount} references`,
                                        command: 'editor.action.showReferences',
                                        arguments: [
                                            document.uri,
                                            new vscode.Position(member.name.line, member.name.position)
                                        ]
                                    }));

                                    // 添加文件路径
                                    const relativePath = path.relative(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', member.document.filePath);
                                    codeLenses.push(new vscode.CodeLens(range, {
                                        title: `$(file) ${relativePath}`,
                                        command: ''
                                    }));

                                    // 添加类型信息
                                    if (member.type) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: `$(symbol-variable) Type: ${member.type.getText()}`,
                                            command: ''
                                        }));
                                    }

                                    // 添加可见性信息
                                    if (member.is_private) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: '$(lock) Private',
                                            command: ''
                                        }));
                                    } else if (member.is_public) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: '$(globe) Public',
                                            command: ''
                                        }));
                                    }

                                    // 添加常量标记
                                    if (member.is_constant) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: '$(symbol-constant) Constant',
                                            command: ''
                                        }));
                                    }

                                    // 添加数组标记
                                    if (member.is_array) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: '$(symbol-array) Array',
                                            command: ''
                                        }));
                                    }

                                    // 添加废弃标记
                                    if (member.is_deprecated) {
                                        codeLenses.push(new vscode.CodeLens(range, {
                                            title: '$(warning) Deprecated',
                                            command: ''
                                        }));
                                    }
                                }
                            });
                        }
                    });
                }
                
                return codeLenses;
            }
        });
    }

    public updateDiagnostics(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const program = GlobalContext.get(document.uri.fsPath);
        
        if (program) {
            // Jass全局变量诊断
                        ((program as any).global_variables || []).forEach((global: any) => {
                if (!global.name) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(
                            new vscode.Position(global.start.line, global.start.position),
                            new vscode.Position(global.end.line, global.end.position)
                        ),
                        'Global variable must have a name',
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            });

            // Zinc结构体成员诊断
                        program.get_all_structs().forEach((struct: any) => {
                if ('members' in struct) {
                    (struct as any).members.forEach((member: any) => {
                        if (!member.name) {
                            diagnostics.push(new vscode.Diagnostic(
                                new vscode.Range(
                                    new vscode.Position(member.start.line, member.start.position),
                                    new vscode.Position(member.end.line, member.end.position)
                                ),
                                'Struct member must have a name',
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    });
                }
            });
        }
        
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public dispose() {
        this.diagnosticCollection.dispose();
    }
}

