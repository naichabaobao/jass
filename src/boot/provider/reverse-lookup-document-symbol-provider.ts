// /**
//  * @description 通过注释查找方法，变量，struct，library，method，目前仅支持function
//  */

// import * as vscode from "vscode";
// import { DataGetter } from "./data";
// import { Options } from "./options";



// /**
//  * Ctrl + T
//  * \@ 跳转
//  * 暂时无用
//  */
// /*
// vscode.languages.registerDocumentSymbolProvider("jass", new class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

//     provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
//         const symbols: vscode.SymbolInformation[] = [];

//         new DataGetter().forEach((program, filePath) => {
//             program.allFunctions(true).forEach(func => {
//                 const desc = func.getContents().join("");
//                 const symbol = new vscode.SymbolInformation(func.name, vscode.SymbolKind.Function, desc, new vscode.Location(vscode.Uri.file(program.source), new vscode.Range(new vscode.Position(func.loc.start.line, func.loc.start.position), new vscode.Position(func.loc.end.line, func.loc.end.position))));


//                 console.log("symbpl", program.source);
//                 if (desc.trimStart() != "") {
                    
//                     const symbolByText = new vscode.SymbolInformation(desc, vscode.SymbolKind.Function, func.name, new vscode.Location(vscode.Uri.file(program.source), new vscode.Range(new vscode.Position(func.loc.start.line, func.loc.start.position), new vscode.Position(func.loc.end.line, func.loc.end.position))));

//                     symbols.push(symbolByText);
//                 }

//                 symbols.push(symbol);
//             });
//         }, !Options.isOnlyJass && Options.supportZinc);

//         // for (let index = 0; index < document.lineCount; index++) {
//         //     const lineText = document.lineAt(index);
//         //     const tokens = tokenize(lineText.text);
//         //     tokens.forEach((token) => {
//         //         if (token.isId()) {
//         //             const symbol = new vscode.SymbolInformation(token.value, vscode.SymbolKind.Module, token.value, 
//         //             new vscode.Location(document.uri, new vscode.Range(new vscode.Position(token.line, token.position), new vscode.Position(token.line, token.end))));
//         //             symbol.tags = [vscode.SymbolTag.Deprecated];
//         //             symbols.push(symbol);
//         //         }
//         //     });
//         // }
//         return symbols;
//     }
// }());
// */
// class GoWorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {
//     provideWorkspaceSymbols(query: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
//         const symbols: vscode.SymbolInformation[] = [];

//         new DataGetter().forEach((program, filePath) => {
//             program.allFunctions(true).forEach(func => {
//                 const desc = func.getContents().join("");
//                 const symbol = new vscode.SymbolInformation(func.name, vscode.SymbolKind.Function, desc, new vscode.Location(vscode.Uri.file(program.source), new vscode.Range(new vscode.Position(func.loc.start.line, func.loc.start.position), new vscode.Position(func.loc.end.line, func.loc.end.position))));

//                 // 提供注释时可以通过注释找到方法
//                 if (desc.trimStart() != "") {
                    
//                     const symbolByText = new vscode.SymbolInformation(desc, vscode.SymbolKind.Function, func.name, new vscode.Location(vscode.Uri.file(program.source), new vscode.Range(new vscode.Position(func.loc.start.line, func.loc.start.position), new vscode.Position(func.loc.end.line, func.loc.end.position))));

//                     symbols.push(symbolByText);
//                 }

//                 symbols.push(symbol);
//             });
//         }, !Options.isOnlyJass && Options.supportZinc);

//         return symbols;
//     }
    
// }

// vscode.languages.registerWorkspaceSymbolProvider(new GoWorkspaceSymbolProvider());