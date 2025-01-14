// import * as vscode from "vscode";
// import { FunctionDeclaration, Identifier, LocalStatement, LuaAstType } from "../lua/parser";
// import { LuaDataGetter } from "./data";
// import { Options } from "./options";

// function item(label: string, kind: vscode.CompletionItemKind, documentation?: string, code?: string) {
//   const item = new vscode.CompletionItem(label, kind);
//   item.detail = label;
//   item.documentation = new vscode.MarkdownString().appendMarkdown(documentation ?? "").appendCodeblock(code ?? "");
//   return item;
// }


// vscode.languages.registerCompletionItemProvider("jass", new class CompletionItemProvider implements vscode.CompletionItemProvider {



//   provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
//     if (!Options.isSupportLua) {
//       return;
//     }

//     const items:vscode.CompletionItem[] = [];
    
//     new LuaDataGetter().forEach((root, filePath) => {
//       const functionStatements:FunctionDeclaration[] = [];
//       const localStatements:LocalStatement[] = [];
//       root.body.forEach((statement) => {
//         if (statement.type == LuaAstType.FunctionDeclaration) {
//           functionStatements.push(<FunctionDeclaration>statement);
//         } else if (statement.type == LuaAstType.LocalStatement) {
//           localStatements.push(<LocalStatement>statement);
//         }
//       });
//       functionStatements.forEach(func => {
//         if (func.identifier) {
//           if (func.identifier.type == LuaAstType.Identifier) {
//             const id = <Identifier>func.identifier;
//             items.push(item(id.name, vscode.CompletionItemKind.Function, `***@source*** (${filePath})`));
            
//           }
//         }
//       });
//       localStatements.forEach(local => {
//         local.variables.forEach((variable, index) => {
//           if (local.init[index] && local.init[index].type == LuaAstType.FunctionDeclaration) {
//             items.push(item(variable.name, vscode.CompletionItemKind.Function, `***@source*** (${filePath})`));
//           } else {
//             items.push(item(variable.name, vscode.CompletionItemKind.Variable, `***@source*** (${filePath})`));
//           }
//         });
//       });
//     });

//     return items;
//   }
// }(), ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""));





