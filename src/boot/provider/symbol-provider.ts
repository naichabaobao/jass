import * as vscode from "vscode";
import { tokenize } from "../jass/tokens";

/**
 * Ctrl + T
 * \@ 跳转
 * 暂时无用
 */
vscode.languages.registerDocumentSymbolProvider("jass", new class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        const symbols: vscode.SymbolInformation[] = [];

        // for (let index = 0; index < document.lineCount; index++) {
        //     const lineText = document.lineAt(index);
        //     const tokens = tokenize(lineText.text);
        //     tokens.forEach((token) => {
        //         if (token.isId()) {
        //             const symbol = new vscode.SymbolInformation(token.value, vscode.SymbolKind.Module, token.value, 
        //             new vscode.Location(document.uri, new vscode.Range(new vscode.Position(token.line, token.position), new vscode.Position(token.line, token.end))));
        //             symbol.tags = [vscode.SymbolTag.Deprecated];
        //             symbols.push(symbol);
        //         }
        //     });
        // }
        return symbols;
    }
}());



