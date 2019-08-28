const vscode = require("vscode")
const j = require("./j")
const jg = require("./jg")
const code = require("./code")

/**
 * @param {vscode.TextDocument} document
 * @param {vscode.Position} position
 * @param {vscode.CancellationToken} token
 * @returns {vscode.ProviderResult<vscode.Hover>}
 */
const hoverProvider = {
  provideHover(document, position, token) {
    var keyword = document.getText(document.getWordRangeAtPosition(position))
    var tooltips = new vscode.MarkdownString()
    if (j[keyword]) {
      tooltips.appendCodeblock(j[keyword].documentation)
        .appendCodeblock(j[keyword].original)
        .appendText(j[keyword].fileName)
    }
    if (jg[keyword]) {
      tooltips.appendCodeblock(jg[keyword].documentation)
        .appendCodeblock(jg[keyword].original)
        .appendText(jg[keyword].fileName)
    }
    if (code.code[keyword]) {
      let cObj = code.code[keyword]
      tooltips.appendText(`${
        cObj.name
        }\n\n${
        code.kindToString(cObj.kind)
        } -> ${
        code.raceToString(cObj.race)
        } -> ${
        code.typeToString(cObj.type)
        }\n\n${
        cObj.tip
        }`)
    }
    return new vscode.Hover(tooltips)
  }
}

module.exports = hoverProvider