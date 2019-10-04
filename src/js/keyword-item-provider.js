const vscode = require("vscode");
const triggreCharacters = require("./triggre-characters");
const Keywords = require("./keywords");
const VjassKeywords = require("./vjass-keywords");

const KeywordItems = Keywords.map(keyword => {
  return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
});
const VjassKeywordItems = VjassKeywords.map(keyword => {
  return new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
});

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token) {
    return [...KeywordItems, ...VjassKeywordItems];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l);