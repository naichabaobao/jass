const vscode = require("vscode");

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    let items = [];
    if (/^\s*\/\/!\s+import/.test(document.lineAt(position.line).text)) {
      let pathResult = /(?<=^\s*\/\/!\s+import\s+")[^\u4e00-\u9fa5]+?(?=")/.exec(document.lineAt(position.line).text);
      if (!pathResult) {
        return items;
      }
      let path = pathResult.shift();
      console.log(path)
      items.push(new vscode.CompletionItem("aaaaaa", vscode.CompletionItemKind.File))
    }
    return items;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, "/", "\\");