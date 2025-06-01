import * as vscode from 'vscode';
import { GlobalContext, Id, Caller, Call, IdIndex } from '../jass/parser-vjass';

export class CodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
    }

    private getAllReferences(name: string): vscode.Location[] {
        const locations: vscode.Location[] = [];
        const allDocuments = GlobalContext.keys.map(key => GlobalContext.get(key)).filter(doc => doc !== undefined);

        allDocuments.forEach(doc => {
            if (!doc) return;

            // 搜索函数调用
            doc.calls.forEach(call => {
                if (call.ref && call.ref.names.some(ref => {
                    if (ref instanceof Id) {
                        return ref.expr?.getText() === name;
                    } else if (ref instanceof Caller) {
                        return ref?.name?.expr?.getText() === name;
                    } else if (ref instanceof Call) {
                        return ref?.name?.expr?.getText() === name;
                    } else if (ref instanceof IdIndex) {
                        return ref?.name?.expr?.getText() === name;
                    } else {
                        return false;
                    }
                })) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(doc.filePath),
                        new vscode.Range(
                            new vscode.Position(call.start.line, call.start.position),
                            new vscode.Position(call.end.line, call.end.position)
                        )
                    ));
                }
            });
        });

        return locations;
    }

    private createCodeLens(range: vscode.Range, name: string, document: vscode.TextDocument, position: vscode.Position): vscode.CodeLens {
        const references = this.getAllReferences(name);
        const referenceCount = references.length;

        return new vscode.CodeLens(range, {
            title: `${referenceCount} references`,
            command: 'vscode.executeReferenceProvider',
            arguments: [document.uri, position]
        });
    }

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const program = GlobalContext.get(document.uri.fsPath);
        
        if (!program) {
            return codeLenses;
        }

        // Add code lenses for functions
        program.functions.forEach(func => {
            if (func.name) {
                const range = new vscode.Range(
                    new vscode.Position(func.start.line, 0),
                    new vscode.Position(func.end.line, 0)
                );

                codeLenses.push(this.createCodeLens(range, func.name.getText(), document, new vscode.Position(func.start.line, 0)));
            }
        });

        // Add code lenses for natives
        program.natives.forEach(native => {
            if (native.name) {
                const range = new vscode.Range(
                    new vscode.Position(native.start.line, 0),
                    new vscode.Position(native.end.line, 0)
                );

                codeLenses.push(this.createCodeLens(range, native.name.getText(), document, new vscode.Position(native.start.line, 0)));
            }
        });

        // Add code lenses for methods
        program.methods.forEach(method => {
            if (method.name) {
                const range = new vscode.Range(
                    new vscode.Position(method.start.line, 0),
                    new vscode.Position(method.end.line, 0)
                );

                codeLenses.push(this.createCodeLens(range, method.name.getText(), document, new vscode.Position(method.start.line, 0)));
            }
        });

        // Add code lenses for structs
        program.structs.forEach(struct => {
            if (struct.name) {
                const range = new vscode.Range(
                    new vscode.Position(struct.start.line, 0),
                    new vscode.Position(struct.end.line, 0)
                );

                // Get struct references
                const references = GlobalContext.get_strcut_by_name(struct.name.getText());
                const referenceCount = references.length;

                // Create code lens for struct
                const codeLens = new vscode.CodeLens(range, {
                    title: `${referenceCount} references`,
                    command: 'vscode.executeReferenceProvider',
                    arguments: [document.uri, new vscode.Position(struct.start.line, 0)]
                });

                codeLenses.push(codeLens);
            }
        });

        // Add code lenses for interfaces
        program.interfaces.forEach(interface_ => {
            if (interface_.name) {
                const range = new vscode.Range(
                    new vscode.Position(interface_.start.line, 0),
                    new vscode.Position(interface_.end.line, 0)
                );

                // Get interface references
                const references = GlobalContext.get_interface_by_name(interface_.name.getText());
                const referenceCount = references.length;

                // Create code lens for interface
                const codeLens = new vscode.CodeLens(range, {
                    title: `${referenceCount} references`,
                    command: 'vscode.executeReferenceProvider',
                    arguments: [document.uri, new vscode.Position(interface_.start.line, 0)]
                });

                codeLenses.push(codeLens);
            }
        });

        return codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens): vscode.CodeLens {
        return codeLens;
    }
}

