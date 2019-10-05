const vscode = require("vscode");
const typeDesc = require("../jass/type-desc");

const typeKeys = Object.keys(typeDesc);

/**
 * 类型提示
 */
vscode.languages.registerHoverProvider("jass", {
  provideHover(document, position, token) {
    let range = document.getWordRangeAtPosition(position);
    let key = document.getText(range);
    if (typeKeys.includes(key)) {
      let type = typeDesc[key];
      return new vscode.Hover(new vscode.MarkdownString().appendMarkdown(`![${type.desc}](${type.icon})`).appendCodeblock(key).appendText(type.desc), range);
    }
    return [];
  }
})