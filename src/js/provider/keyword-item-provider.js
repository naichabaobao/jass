/*
2019年10月7日 添加關鍵字來源那個語言
*/


const vscode = require("vscode");
const triggreCharacters = require("../triggre-characters");
const Keywords = require("../keywords");
const VjassKeywords = require("../vjass-keywords");

const KeywordItems = Keywords.map(keyword => {
  let item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  item.detail = keyword;
  item.documentation = new vscode.MarkdownString().appendMarkdown("`jass`");
  return item;
});
const VjassKeywordItems = VjassKeywords.map(keyword => {
  let item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
  item.detail = keyword;
  item.documentation = new vscode.MarkdownString().appendMarkdown("`vjass`");
  return item;
});

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token) {
    return [...KeywordItems, ...VjassKeywordItems];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l);