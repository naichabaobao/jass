const vscode = require('vscode');
const fs = require("fs");
const path = require('path')
const jassParser = require('./jass-grammar')
const description = require('./description')

/**
 * 语言名称
 */
const language = "jass"

/**
 * 错误集合
 */
var diagnosticCollection = null

var common_j = ""
var blizzard_j = ""
var common_ai = ""
var DzAPI = ""

// const Class = { agent, event, player, widget, unit, destructable, item, ability, buff, force, group, trigger, triggercondition, triggeraction, timer, location, region, rect, boolexpr, sound, conditionfunc, filterfunc, unitpool, itempool, race, alliancetype, racepreference, gamestate, igamestate, fgamestate, playerstate, playerscore, playergameresult, unitstate, aidifficulty, eventid, gameevent, playerevent, playerunitevent, unitevent, limitop, widgetevent, dialogevent, unittype, gamespeed, gamedifficulty, gametype, mapflag, mapvisibility, mapsetting, mapdensity, mapcontrol, playerslotstate, volumegroup, camerafield, camerasetup, playercolor, placement, startlocprio, raritycontrol, blendmode, texmapflags, effect, effecttype, weathereffect, terraindeformation, fogstate, fogmodifier, dialog, button, quest, questitem, defeatcondition, timerdialog, leaderboard, multiboard, multiboarditem, trackable, gamecache, version, itemtype, texttag, attacktype, damagetype, weapontype, soundtype, lightning, pathingtype, image, ubersplat, hashtable }

var Function = {
  // 原樣
  original: String,
  // 類型
  kind: vscode.CompletionItemKind.Function,
  // 名稱
  name: String,
  // 參數
  args: Array,
  // 返回值
  returnType: String,
  // 插入文本
  insertText: String,
  // 提示標題 
  detail: String,
  // 提示内容
  documentation: String
}

var Value = {
  // 原樣
  original: String,
  // 類型
  kind: vscode.CompletionItemKind.Variable,
  // class
  type: String,
  // 名稱
  name: String,
}

var functions = []
var values = []

/**
 * 读取jass文件返回文件内容
 * @param {String} jFile 
 */
const readFileSync = function (jFile) {
  return fs.readFileSync(path.join(__dirname, jFile), "utf-8");
}

/**
 * 读取文件夹，返回文件夹内所有子文件的路径
 * @param {String} dir 
 */
const readdirSync = function (dir) {
  return fs.readdirSync(path.join(__dirname, dir))
}

const triggreCharacters = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "_",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const functionOnly = /^[\t ]*((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(nothing|([a-zA-Z]+\s+[a-zA-Z]\w*\s*,\s*)*[a-zA-Z]+\s+[a-zA-Z]\w*)\s+returns\s+(nothing|[a-zA-Z]+)/g
/**
 * 获取native方法 用户定义方法 同时获取@documentation("")注解
 */
const functionRegExp = /(\/\/[\t ]*@doumentation[\t ]*\([\t ]*".*"[\t ]*\)[\t ]*[\s\n]+)*^[\t ]*((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(nothing|([a-zA-Z]+\s+[a-zA-Z]\w*\s*,\s*)*[a-zA-Z]+\s+[a-zA-Z]\w*)\s+returns\s+(nothing|[a-zA-Z]+)/g
/**
 * 获取globals内部所有成员
 */
const globalsRegExp = /(?<=globals[\s\S]+)(\/\/@doumentation[\t ]*\([\t ]*".*"[\t ]*\)[\t ]*[\t\n ]+)*^[\t ]*(constant[\t ]+[a-zA-Z]+[\t ]+\w*|[a-zA-Z]+[\t ]+array[\t ]+[a-zA-Z]\w+|[a-zA-Z]+[\t ]+[a-zA-Z]\w*)(?=[\s\S]+endglobals)/g
/**
 * 解析jass内容，返回CompletionItem数组
 * @param {string} content jass文本
 */
const parseJass = function (content) {
  /**
   * 1，找到所有全局值
   * 2，找到所有方法
   */
  if (!content || typeof content != 'string') {
    return null
  }

  console.log(functionRegExp.exec(content))
  return content.match(functionRegExp).map(functionString => {
    var functionName = new String().match(/(?<=(native|function)[\t ]+)[a-zA-Z]\w*(?=[\t ]+takes)/).shift()
    var functionDocumentations = functionString.match(/(?<=@doumentation[\t ]*\([\t ]*").*(?="[\t ]*\))/).map(x => x)
    var functionOriginal = functionString.match(/((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(nothing|([a-zA-Z]+\s+[a-zA-Z]\w*\s*,\s*)*[a-zA-Z]+\s+[a-zA-Z]\w*)\s+returns\s+(nothing|[a-zA-Z]+)/).shift()
    var functionInsertString = functionString.match(/(?<=takes[\t ]+)[\w,\t ]+(?=[\t ]+returns)/).shift().match(/(nothing|[a-zA-z]+[\t ]+[a-zA-Z]\w*)/g).map(x => {
      if (x == 'nothing') {
        return null
      } else {
        var arg = x.split(/[\t ]+/)
        return {
          type: arg[0],
          name: arg[1]
        }
      }
    })
    console.log(functionName)
    console.log(functionDocumentations)
    console.log(functionOriginal)
    console.log(functionInsertString)
    var comp = new vscode.CompletionItem(functionName, vscode.CompletionItemKind.Function);
    comp.detail = functionName
    var documentationMarkdownString = new vscode.MarkdownString()
    documentationMarkdownString.appendCodeblock(functionOriginal)
    functionDocumentations.forEach(x => documentationMarkdownString.appendCodeblock(x))
    comp.documentation = documentationMarkdownString
    comp.insertText = `${functionName}(${functionInsertString ? functionInsertString.map(x => x.name).join(",") : ""})`
    return comp
  })
}

var completionItemProvider = {
  provideCompletionItems(document, position, token, context) {
    /**
     * 1，读取文件(common.j,blizzard.j,common.ai,DzAPI.j) 默认读取/src/static/war3/下所有.j,.ai文件
     * 2，解析需要字段
     * 3，获取document文本
     * 4，解析document文本获取需要字段
     */
    console.log("start load j file")
    let filePaths = readdirSync("../../src/static/war3")
    var jassContentString = filePaths.map(filename => {
      var jassContent = readFileSync("../../src/static/war3/" + filename)
      console.log(jassContent)
      return jassContent
    }).join("\n")
    return parseJass(jassContentString)
  },
  resolveCompletionItem(item, token) {
    return item
  }
}

const checkJass = function (content) {

}

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
 * @deprecated
 * @param {array} functions 
 */
var registerCompletionItemProvider1 = (functions, values) => {
  if (!functions || !Array.isArray(functions) || !values || !Array.isArray(values))
    return;
  vscode.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(document, position, token, context) {

      // 添加提示字符
      return functions.map(x => {
        var comp = new vscode.CompletionItem(x.name, x.type);
        comp.detail = x.detail
        comp.documentation = new vscode.MarkdownString().appendCodeblock(x.documentation)
        comp.insertText = x.insertText
        comp.keepWhitespace = true
        return comp
      }).concat(values.map(x => {
        var comp = new vscode.CompletionItem(x.name, x.kind);
        comp.detail = x.detail
        comp.documentation = new vscode.MarkdownString().appendCodeblock(x.documentation)
        comp.insertText = x.insertText
        comp.keepWhitespace = true
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

const init = function (context) {
  let filePaths = readdirSync("../../src/static/war3")
  filePaths.forEach(filename => {
    var jassContent = readFileSync("../../src/static/war3/" + filename)
    console.log(jassContent.length)
    console.log(functionRegExp.test(jassContent))
  })
  var jassContent = readFileSync("../../src/static/war3/" + "DzAPI.j")
  console.log(functionRegExp.flags)
  console.log(new RegExp("^\s*(function|native).*", "gm").compile().exec(jassContent))
}


const initFile = function (context) {
  common_j = readFileSync("../../src/static/war3/" + "common.j")
  blizzard_j = readFileSync("../../src/static/war3/" + "blizzard.j")
  common_ai = readFileSync("../../src/static/war3/" + "common.ai")
  DzAPI = readFileSync("../../src/static/war3/" + "DzAPI.j")
}

var funcObj = require("./functions")

function activate(context) {
  vscode.window.showInformationMessage('Hello World!');

  vscode.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(document, position, token, context) {
      return funcObj.map(x => {
        let item = new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Function)
        item.detail = x.name
        item.documentation = new vscode.MarkdownString()
          .appendCodeblock("file:" + document.fileName + "\n")
          .appendCodeblock(x.original)
          .appendCodeblock("\n")
          .appendCodeblock(x.documentation)
        item.insertText = x.insertText
        return
      })
    },
    resolveCompletionItem(item, token) {
      return item
    }
  }, ...triggreCharacters)

  vscode.languages.registerHoverProvider(language, {
    provideHover(document, position, token) {
      console.log(document.getText(document.getWordRangeAtPosition(position)))
      var keyword = document.getText(document.getWordRangeAtPosition(position))

      var tooltips = new vscode.MarkdownString()

      funcs.forEach(x => {
        if (x.name == keyword) {
          tooltips.appendCodeblock(x.documentation, language)
        }
      })
      vals.forEach(x => {
        if (x.name == keyword) {
          tooltips.appendCodeblock(x.documentation, language)
        }
      })
      return new vscode.Hover(tooltips)
    }
  });

  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    console.log(textDocment.getText())
    var diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 6)), "哈哈哈", vscode.DiagnosticSeverity.Error)
    diagnosticCollection.set(textDocment.uri, [diagnostic])
  })

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
