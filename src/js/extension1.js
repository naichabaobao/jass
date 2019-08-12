const vscode = require('vscode');
const path = require('path')
const jassParser = require('./jass-grammar')
const description = require('./description')

const language = "jass"
/**
 * 保存分析過嘅方法
 */
var funcs = new Array()
var vals = new Array()

var updateFuncs = (functions) => {
  var funcNames = funcs.map(x => x.name)
  functions.filter(x => !funcNames.includes(x.name)).forEach(x => {
    funcs.push(x)
  })
}

var updateVals = (values) => {
  var valsNames = vals.map(x => x.name)
  values.filter(x => !valsNames.includes(x.name)).forEach(x => {
    vals.push(x)
  })
}

/**
 * 注冊提示選項
 * @param {array} functions 
 */
var registerCompletionItemProvider = (functions, values) => {
  if (!functions || !Array.isArray(functions) || !values || !Array.isArray(values))
    return;
  vscode.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(document, position, token, context) {

      // 添加提示字符
      return functions.map(x => {
        var comp = new vscode.CompletionItem(x.name, x.type);
        comp.detail = x.detail
        comp.documentation = x.documentation
        comp.insertText = x.insertText
        return comp
      }).concat(values.map(x => {
        var comp = new vscode.CompletionItem(x.name, x.kind);
        comp.detail = x.detail
        comp.documentation = x.documentation
        comp.insertText = x.insertText
        return comp
      }))

    },
    resolveCompletionItem(item, token) {
      return item
    }
  },
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "_",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9");
}

function activate(context) {

  // 讀取當前文件
  vscode.window.showInformationMessage('Hello World!');

  jassParser.parseJassFile(path.join(__dirname, '../static/war3/blizzard.j'), (functions, values) => {
    updateFuncs(functions)
    updateVals(values)
    registerCompletionItemProvider(functions, values)
  })

  jassParser.parseJassFile(path.join(__dirname, '../static/war3/common.j'), (functions, values) => {
    updateFuncs(functions)
    updateVals(values)
    registerCompletionItemProvider(functions, values)
  })

  vscode.languages.registerHoverProvider(language, {
    provideHover(document, position, token) {
      console.log(document.getText(document.getWordRangeAtPosition(position)))
      var keyword = document.getText(document.getWordRangeAtPosition(position))

      var tooltips = new vscode.MarkdownString()

      funcs.forEach(x => {
        if (x.name == keyword) {
          tooltips.appendCodeblock(x.original, language)
        }
      })
      if (Object.keys(description.description).includes(keyword)) {
        tooltips.appendMarkdown(description.description[keyword])
      }
      return new vscode.Hover(tooltips)
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
