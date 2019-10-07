
const vscode = require("vscode");
const { StatementType } = require("../support-type");
// const { parseImport } = require("../jass")
// const { findFunctions } = require("../item-tool")

/**
 * 定义跳转
 * 只會返回一個，會誤返，但不影響
 */
vscode.languages.registerDefinitionProvider("jass", {
  provideDefinition(document, position, cancel) {
    let key = document.getText(document.getWordRangeAtPosition(position));

    // 0=local 1=function 2=function,globals
    let inLocal = true;
    for (let i = position.line; i >= 0; i--) {

      const TextLine = document.lineAt(i);
      if (!TextLine.isEmptyOrWhitespace) {
        const text = TextLine.text;
        const subtext = text.substring(TextLine.firstNonWhitespaceCharacterIndex);
        if (inLocal && subtext.startsWith("local")) {
          let keyIndex = text.indexOf(key);
          if (keyIndex > TextLine.firstNonWhitespaceCharacterIndex) return new vscode.Location(document.uri, new vscode.Range(i, keyIndex, i, keyIndex + key.length));
        } else if (subtext.startsWith("function") || subtext.startsWith("constant") || StatementType.findIndex(type => subtext.startsWith(type)) >= 0) {
          let keyIndex = text.indexOf(key);
          if (keyIndex > TextLine.firstNonWhitespaceCharacterIndex) return new vscode.Location(document.uri, new vscode.Range(i, keyIndex, i, keyIndex + key.length));
          if (inLocal) inLocal = false;
        }
      }
    }
    return [];
  }
})

