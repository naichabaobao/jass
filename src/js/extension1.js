const vscode = require('vscode');
const path = require('path')
const jassParser = require('./jass-grammar')
const keywordHovers = require('./hover')

const language = "jass"
var funcs = []
var hovers = [
  {
    // 關鍵字
    keyword: '',
    // 關鍵字類型
    type: '',
    // 關鍵字原樣
    original: '',
    // 關鍵字解釋文檔
    documentation: ""
  }
]

function activate(context) {

  // 讀取當前文件
  console.log('Congratulations, your extension "jass" is now active!');
  vscode.window.showInformationMessage('Hello World!');

  jassParser.parseJassFile(path.join(__dirname, '../static/war3/blizzard.j'), (functions) => {

    funcs = functions

    vscode.languages.registerCompletionItemProvider(language, {
      provideCompletionItems(document, position, token, context) {

        // 添加提示字符
        return functions.map(x => {
          var comp = new vscode.CompletionItem(x.name, x.type);
          comp.detail = x.detail
          comp.documentation = x.documentation
          comp.insertText = x.insertText
          return comp
        })

      },
      resolveCompletionItem(item, token) {
        return item
      }
    },
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
      "_",
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9");

  })

  vscode.languages.registerHoverProvider(language, {
    provideHover(document, position, token) {
      console.log(document.getText(document.getWordRangeAtPosition(position)))
      var keyword = document.getText(document.getWordRangeAtPosition(position))
      return new vscode.Hover([
        new vscode.MarkdownString("code"),
        new vscode.MarkdownString("code"),
        new vscode.MarkdownString("code類型,用於方法調用,作爲參數傳遞時需使用function修飾,如：<pre>`call ForGroupBJ(YDWEGetUnitsInRectMatchingNull(GetPlayableMapRect(),Condition(_function_ Trig_debugFunc002001002)), function Trig_debugFunc002002)`</pre>"),

      ])
    }
  });


  context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
    vscode.window.showInformationMessage('Hello jass!');
  }));



}
exports.activate = activate;

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
