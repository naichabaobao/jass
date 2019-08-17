const vscode = require('vscode');

var funcObj = require("./functions")
/**
 * 语言名称
 */
const language = "jass"

/**
 * 错误集合
 */
var diagnosticCollection = null

const triggreCharacters = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "_",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const completionProvider = {
  provideCompletionItems(document, position, token, context) {
    let items = []
    for (const key in funcObj) {
      let item = new vscode.CompletionItem(funcObj[key].name, vscode.CompletionItemKind.Function)
      item.detail = funcObj[key].name
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(funcObj[key].documentation)
        .appendCodeblock(funcObj[key].original)
      item.insertText = funcObj[key].insertText
      items.push(item)
    }
    return items
  },
  resolveCompletionItem(item, token) {
    return item
  }
}

const hoverProvider = {
  provideHover(document, position, token) {
    var keyword = document.getText(document.getWordRangeAtPosition(position))
    var tooltips = new vscode.MarkdownString()
    if (Object.keys(funcObj).includes(keyword)) {
      tooltips.appendCodeblock(funcObj[keyword].documentation)
      tooltips.appendCodeblock(funcObj[keyword].original)
    }
    return new vscode.Hover(tooltips)
  }
}

const colorProvider = {
  provideDocumentColors(document, token) {

  }/*ProviderResult<ColorInformation[]>*/,
  provideColorPresentations(color, context, token) {

  }/*ProviderResult<ColorPresentation[]>*/
}

const typeFormattingProvider = {
  provideOnTypeFormattingEdits(document, position, ch, options, token) {
    return [new vscode.TextEdit(new vscode.Range(new position(0, 0), new position(0, 20)), "一段中文咯")]
  }
}

const creatTextEdit = function (sCol, Spos, eCol, ePos, con) {
  return new vscode.TextEdit(new vscode.Range(new vscode.Position(sCol, Spos), new vscode.Position(eCol, ePos)), con)
}

/**
 * 分成空白，换行，关键字，类，数字，代码，符号，字符串，单行注释，标识符
 * @param {String} string 
 */
const participle = function (string) {
  let words = []
  if (!string) {
    return words
  }
  // 数字 字母 空白串 换行符 其它 => 数字 字母 空白串 换行符 字符串 注释串 char 其它

  let untreatedWords = string.match(/\d+|[a-zA-Z]+|[\t ]+|\n|./g).map(x => x)
  let commiting = false
  let stringing = false
  let collectString = ""
  for (let i = 0; i < untreatedWords.length; i++) {
    let untreatedWord = untreatedWords[i];
    if (commiting == false && stringing == false && /\//.test(untreatedWord) && /\//.test(untreatedWords[i + 1])) {
      commiting = true
    }
    if (/\n/.test(untreatedWord)) {
      commiting = false
      stringing = false
    }
    if (commiting == false && stringing == false && /"/.test(untreatedWord)) {
      stringing = true
    } else if (commiting == false && stringing && /"/.test(untreatedWord) && !/\\/.test(untreatedWords[i - 1])) {
      stringing = false
    }
    if (commiting || stringing) {
      collectString += untreatedWord
    } else if (collectString.length > 0) {
      if (/\n/.test(untreatedWord)) {
        words.push(collectString)
        words.push(untreatedWord)
      } else {
        collectString += untreatedWord
        words.push(collectString)
      }
      collectString = ""
    } else {
      words.push(untreatedWord)
    }
  }
  return words
}

const isSpace = function (string) {
  return /^[\t ]+$/.test(string)
}

const isNewLine = function (string) {
  return string == "\n"
}

const creatSpace = function (count = 1) {
  let space = ""
  for (let i = 0; i < count; i++) {
    space += " "
  }
  return space
}

const types = [
  "integer",
  "real",
  "string",
  "boolean",
  "code",
  "handle",
  "agent",
  "event",
  "player",
  "widget",
  "unit",
  "destructable",
  "item",
  "ability",
  "buff",
  "force",
  "group",
  "trigger",
  "triggercondition",
  "triggeraction",
  "timer",
  "location",
  "region",
  "rect",
  "boolexpr",
  "sound",
  "conditionfunc",
  "filterfunc",
  "unitpool",
  "itempool",
  "race",
  "alliancetype",
  "racepreference",
  "gamestate",
  "igamestate",
  "fgamestate",
  "playerstate",
  "playerscore",
  "playergameresult",
  "unitstate",
  "aidifficulty",
  "eventid",
  "gameevent",
  "playerevent",
  "playerunitevent",
  "unitevent",
  "limitop",
  "widgetevent",
  "dialogevent",
  "unittype",
  "gamespeed",
  "gamedifficulty",
  "gametype",
  "mapflag",
  "mapvisibility",
  "mapsetting",
  "mapdensity",
  "mapcontrol",
  "playerslotstate",
  "volumegroup",
  "camerafield",
  "camerasetup",
  "playercolor",
  "placement",
  "startlocprio",
  "raritycontrol",
  "blendmode",
  "texmapflags",
  "effect",
  "effecttype",
  "weathereffect",
  "terraindeformation",
  "fogstate",
  "fogmodifier",
  "dialog",
  "button",
  "quest",
  "questitem",
  "defeatcondition",
  "timerdialog",
  "leaderboard",
  "multiboard",
  "multiboarditem",
  "trackable",
  "gamecache",
  "version",
  "itemtype",
  "texttag",
  "attacktype",
  "damagetype",
  "weapontype",
  "soundtype",
  "lightning",
  "pathingtype",
  "image",
  "ubersplat",
  "hashtable"]

const documentFormattingEditProvider = {
  provideDocumentFormattingEdits(document, options, token) {
    let documentContent = document.getText()
    let edits = []
    let edit = vscode.TextEdit
    let line = 0
    let colume = 0

    let words = participle(documentContent)
    let ident = 0
    let tabSize = options.tabSize | 2
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      let p1 = words[i - 1]
      let p2 = words[i - 2]
      let n1 = words[i + 1]
      let n2 = words[i + 2]
      let length = word.length
      // 右边只能有一个空格
      if (word == "function" ||
        word == "takes" ||
        word == "returns" ||
        word == "native" ||
        word == "constant" ||
        word == "return" ||
        word == "if" ||
        word == "elseif" ||
        word == "exitwhen" ||
        word == "local" ||
        word == "call" ||
        word == "set" ||
        word == "type" ||
        word == "extends" ||
        word == "not" ||
        word == "and" ||
        word == "or" ||
        word == "," ||
        (word == "=" && n1 != "=") ||
        (word == ">" && n1 != "=") ||
        (word == "<" && n1 != "=") ||
        word == "+" ||
        (word == "-" && isSpace(n1)) ||
        word == "*" ||
        word == "/" ||
        word == "%" ||
        word == "mod") {
        if (isSpace(n1)) {
          if (n1.length != 1) {
            let range = new vscode.Range(line, colume + length, line, colume + length + n1.length)
            edits.push(edit.replace(range, " "))
          }
        } else {
          edits.push(edit.insert(new vscode.Position(line, colume + length), " "))
        }
      }
      // 左边只能有一个空格
      if (word == "or" ||
        word == "and" ||
        word == "not" ||
        (word == "=" && p1 != "=" && p1 != "!" && p1 != "<" && p1 != ">") ||
        (word == "!" && n1 == "=") ||
        word == ">" ||
        word == "<" ||
        word == "extends" ||
        word == "takes" ||
        word == "returns" ||
        word == "then" ||
        word == "+" ||
        (word == "-" && isSpace(n1)) ||
        word == "*" ||
        word == "/" ||
        word == "%" ||
        word == "mod") {
        if (isSpace(p1)) {
          if (p1.length != 1) {
            let range = new vscode.Range(line, colume - p1.length, line, colume)
            edits.push(edit.replace(range, " "))
          }
        } else {
          edits.push(edit.insert(new vscode.Position(line, colume), " "))
        }
      }
      // 右边不能是空格
      if (word == "then" ||
        word == "else" ||
        word == "return" ||
        word == "endfunction" ||
        word == "endloop" ||
        word == "returns" ||
        word == "globals" ||
        word == "endglobals" ||
        word == "(" ||
        word == "[") {
        if (isSpace(n1)) {
          let range = new vscode.Range(line, colume + length, line, colume + length + n1.length)
          edits.push(edit.delete(range))
        }
      }
      // 左边不能是空格
      if (word == "globals" ||
        word == "endglobals" ||
        word == "function" ||
        word == "endfunction" ||
        word == ")" ||
        word == "]" ||
        word == "type") {
        if (isSpace(p1)) {
          let range = new vscode.Range(line, colume - p1.length, line, colume)
          edits.push(edit.delete(range))
        }
      }
      // 右边必须是换行
      if (word == "globals" ||
        word == "endglobals" ||
        word == "endfunction") {
        if (!isNewLine(n1)) {
          if (isSpace(n1) && !isNewLine(n2)) {
            edits.push(edit.insert(new vscode.Position(line, colume + length), "\n"))
          }
        }
      }
      // 左边必须是换行
      if (word == "globals" ||
        word == "endglobals" ||
        word == "endfunction") {
        if (!isNewLine(p1)) {
          if (isSpace(p1) && !isNewLine(p2)) {
            edits.push(edit.insert(new vscode.Position(line, colume), "\n"))
          }
        }
      }
      // 
      /*
      if (word == "globals" || word == "endglobals" || word == "endfunction" || word == "native") {
        if (!isNewLine(p1)) {
          if (isNewLine(p2)) {
            // \n\s+globals => \n+globals
            if (isSpace(p1)) {
              let range = new vscode.Range(line, colume - p1.length, line, colume)
              edits.push(edit.delete(range))
              console.log(colume)
            }
          }
        }
        if (!isNewLine(n1)) {
          if (isNewLine(n2) && isSpace(n1)) {
            let range = new vscode.Range(line, colume + length, line, colume + length + n1.length)
            edits.push(edit.delete(range))
          }
        }
      }

      if (word == "returns" || word == "then" || word == "loop") {
        ident++;
      }
      if (word == "endif" || word == "endloop" || word == "endfunction") {
        ident--;
      }
      if (word == "exitwhen" || word == "if" || word == "loop" || word == "endif" || word == "endloop") {
        if (isSpace(p1)) {
          if (p1.length != ident * tabSize) {
            let range = new vscode.Range(line, colume - p1.length, line, colume)
            edits.push(edit.replace(range, creatSpace(ident * tabSize)))
          }
          if (!isNewLine(p2)) {
            edits.push(edit.insert(new vscode.Position(line, colume - p1.length), "\n"))
          }
        } else if (isNewLine(p1)) {
          edits.push(edit.insert(new vscode.Position(line, colume), creatSpace(ident * tabSize)))
        }
      }*/
      colume += length
      if (word == "\n") {
        line++;
        colume = 0
      }
    }
    return edits
  }
}

function activate(context) {
  vscode.window.showInformationMessage('好烦啊!');

  vscode.languages.registerCompletionItemProvider(language, completionProvider, ...triggreCharacters)

  vscode.languages.registerHoverProvider(language, hoverProvider);

  // vscode.languages.registerColorProvider(language,colorProvider)

  vscode.languages.registerOnTypeFormattingEditProvider(language, typeFormattingProvider, "", ...[","])

  vscode.languages.registerDocumentFormattingEditProvider(language, documentFormattingEditProvider)



  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    console.log(textDocment.getText())
    var documentContent = textDocment.getText()
    documentContent.match(/a/g)
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
