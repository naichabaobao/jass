const vscode = require("vscode")
const j = require("./j")
const jg = require("./jg")
const code = require("./code")
const itemTool = require("./itemTool")


const hoverProvider = {
  /**
 * @param {vscode.TextDocument} document
 * @param {vscode.Position} position
 * @param {vscode.CancellationToken} token
 * @returns {vscode.ProviderResult<vscode.Hover>}
 */
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
    } else {
      let codeRanges = itemTool.findCodeRangesByLine(document.lineAt(position.line))
      codeRanges.filter(x => {
        return x.contains(position)
      }).forEach(x => {
        let code = document.getText(x).replace(/'/g, "")
        if (code.startsWith("h") || code.startsWith("o")
          || code.startsWith("e") || code.startsWith("u")
          || code.startsWith("n") || code.startsWith("z")
          || code.startsWith("H") || code.startsWith("O")
          || code.startsWith("E") || code.startsWith("U")
          || code.startsWith("N")) { // hoeunzHOEUN:单位
          tooltips.appendText(`单位->${
            (function () {
              let race = ""
              if (code.startsWith("h")) {
                race = "人族->非英雄"
              } else if (code.startsWith("o")) {
                race = "兽族->非英雄"
              } else if (code.startsWith("e")) {
                race = "暗夜精灵族->非英雄"
              } else if (code.startsWith("u")) {
                race = "不死族->非英雄"
              } else if (code.startsWith("n")) {
                race = "中立->非英雄"
              } else if (code.startsWith("z")) {
                race = "未知->非英雄"
              } else if (code.startsWith("H")) {
                race = "人族->英雄"
              } else if (code.startsWith("O")) {
                race = "兽族->英雄"
              } else if (code.startsWith("E")) {
                race = "暗夜精灵族->英雄"
              } else if (code.startsWith("U")) {
                race = "不死族->英雄"
              } else if (code.startsWith("N")) {
                race = "中立->英雄"
              }
              return race
            })()
            }`)
        } else if (code.startsWith("I")) { // I:物品
          tooltips.appendText("物品")
        } else if (code.startsWith("B")) { // B:可破坏物
          // 暫時顯示魔法效果
          // tooltips.appendText("可破坏物")
          tooltips.appendText("魔法效果")
        } else if (code.startsWith("D")) { // D:地形
          tooltips.appendText("地形/装饰物")
        } else if (code.startsWith("A")) { // A:技能
          tooltips.appendText("技能")
        } else if (code.startsWith("B") || code.startsWith("X")) { // B:效果X:区域效果
          tooltips.appendText("魔法效果")
        } else if (code.startsWith("R")) { // R:科技
          tooltips.appendText("科技")
        }
      })
    }


    return new vscode.Hover(tooltips)
  }
}

module.exports = hoverProvider