const vscode = require("vscode");

const code = require("./code")
const itemTool = require("./item-tool")

const { functions, globals } = require("./jass/default");
const Desc = require("./jass/desc");
const DescGlobal = require("./jass/desc-globals");

let mss = {};
try {
  functions.forEach(jFile => {
    jFile.functions.forEach(func => {
      let ms = new vscode.MarkdownString(`${func.name} (${jFile.fileName})\n`)
        .appendText(Desc[jFile.fileName] && Desc[jFile.fileName][func.name] ? Desc[jFile.fileName][func.name] : "")
        .appendCodeblock(func.original);
      mss[func.name] = ms;

    });
  });
  globals.forEach(gFile => {
    gFile.globals.forEach(gs => {
      gs.forEach(v => {
        let ms = new vscode.MarkdownString(`${v.name} (${gFile.fileName})\n`)
          .appendText(DescGlobal[gFile.fileName] && DescGlobal[gFile.fileName][v.name] ? DescGlobal[gFile.fileName][v.name] : "")
          .appendCodeblock(v.original);
        mss[v.name] = ms;
      });
    });
  });
} catch (err) {
  console.log(err)
}


vscode.languages.registerHoverProvider("jass", {
  provideHover(document, position, token) {
    let keyword = document.getText(document.getWordRangeAtPosition(position))

    let hs = [];
    if (Object.keys(mss).includes(keyword)) {
      hs.push(mss[keyword]);
    }

    if (code.code[keyword]) {
      let cObj = code.code[keyword]
      let tooltips = new vscode.MarkdownString().appendText(`${
        cObj.name
        }\n\n${
        code.kindToString(cObj.kind)
        } -> ${
        code.raceToString(cObj.race)
        } -> ${
        code.typeToString(cObj.type)
        }\n\n${
        cObj.tip
        }`);
      hs.push(tooltips);
    } else {
      let tooltips = new vscode.MarkdownString();
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
      });
      hs.push(tooltips);
    }
    return new vscode.Hover(hs);
  }
});
