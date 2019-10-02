const vscode = require("vscode");
let createDiagnosticCollection = vscode.languages.createDiagnosticCollection("jass");
/**
 * @deprecated 改未错误检测，构思中
 */
vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    let items = [];
    console.log("code")
    try {
      createDiagnosticCollection.set(document.uri, [new vscode.Diagnostic(new vscode.Range(0, 0, 0, 20), "好晕啊", vscode.DiagnosticSeverity.Error)]);
    } catch (err) {
      console.log(err);
    }

    console.log("code")
    return items;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ";");



