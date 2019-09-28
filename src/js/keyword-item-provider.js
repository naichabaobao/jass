const vscode = require("vscode");
const triggreCharacters = require("./triggre-characters");
const Keywords = require("./keywords");

const KeywordItems = Keywords.map(keyword => {
  return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
});

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token) {
    return KeywordItems;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l);