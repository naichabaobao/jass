const vscode = require("vscode");

vscode.languages.registerFoldingRangeProvider("jass", {
  provideFoldingRanges(document, context, token) {
    let foldingRanges = [];
    // new vscode.FoldingRange()
    return foldingRanges;
  }
});