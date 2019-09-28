const vscode = require("vscode");
const triggreCharacters = require("./triggre-characters");
const { Type } = require("./support-type");

const Types = Type.map(type => {
  return new vscode.CompletionItem(type, vscode.CompletionItemKind.Class);
});

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token) {
    return Types;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l);