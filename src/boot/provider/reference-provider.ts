import * as vscode from 'vscode';
import { GlobalContext } from '../jass/parser-vjass';

export class ReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Location[]> {
        const program = GlobalContext.get(document.uri.fsPath);
        if (!program) {
            return [];
        }

        // 获取当前位置的单词
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return [];
        }
        const word = document.getText(wordRange);

        // 搜索所有文档中的引用
        const locations: vscode.Location[] = [];
        const allDocuments = GlobalContext.keys.map(key => GlobalContext.get(key)).filter(doc => doc !== undefined);

        allDocuments.forEach(doc => {
            if (!doc) return;

            // 搜索函数调用
            const calls = (doc as any).calls || [];
            calls.forEach((call: any) => {
                if (call.ref && call.ref.toString() === word) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(doc.filePath),
                        new vscode.Range(
                            new vscode.Position(call.start.line, call.start.position),
                            new vscode.Position(call.end.line, call.end.position)
                        )
                    ));
                }
            });

            // 搜索结构体引用
            const structRefs = GlobalContext.get_strcut_by_name(word);
            structRefs.forEach(struct => {
                if (struct.start && struct.end) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(doc.filePath),
                        new vscode.Range(
                            new vscode.Position(struct.start.line, struct.start.position),
                            new vscode.Position(struct.end.line, struct.end.position)
                        )
                    ));
                }
            });

            // 搜索接口引用
            const interfaceRefs = GlobalContext.get_interface_by_name(word);
            interfaceRefs.forEach(interface_ => {
                if (interface_.start && interface_.end) {
                    locations.push(new vscode.Location(
                        vscode.Uri.file(doc.filePath),
                        new vscode.Range(
                            new vscode.Position(interface_.start.line, interface_.start.position),
                            new vscode.Position(interface_.end.line, interface_.end.position)
                        )
                    ));
                }
            });
        });

        return locations;
    }
} 