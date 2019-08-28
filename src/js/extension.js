const vscode = require('vscode');
const type = require("./type")
const colorProvider = require("./colorProvider")
const codeItemProvider = require("./codeItemProvider")
const triggreCharacters = require("./triggreCharacters")
const functionItemProvider = require("./functionItemProvider")
const hoverProvider = require("./hoverProvider")
const documentForrmatProvider = require("./documentForrmatProvider")
/**
 * 语言名称
 */
const language = "jass"
/**
 * 错误集合
 */
var diagnosticCollection = null

/**
 * 分成空白，换行，关键字，类，数字，代码，符号，字符串，单行注释，标识符
 * @param {String} string
 */
const participle = function (string) {
  let words = []
  if (!string) {
    return words
  }
  // 数字 字母 空白串 换行符 其它 => 数字 字母 空白串 换行符 字符串 注释串 其它
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

const documentFormattingEditProvider = {
  provideDocumentFormattingEdits(document, options, token) {
    let documentContent = document.getText()
    let edits = []
    let edit = vscode.TextEdit
    let line = 0
    let colume = 0
    let ident = 0
    let tabSize = options.tabSize | 2
    let words = participle(documentContent)
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
      if (
        word == "(" ||
        word == "[") {
        if (isSpace(n1)) {
          let range = new vscode.Range(line, colume + length, line, colume + length + n1.length)
          edits.push(edit.delete(range))
        }
      }
      // 左边不能是空格
      if (
        word == ")" ||
        word == "]") {
        if (isSpace(p1)) {
          let range = new vscode.Range(line, colume - p1.length, line, colume)
          edits.push(edit.delete(range))
        }
      }
      // 右边必须是换行
      /*
       if (word == "globals" ||
       word == "endglobals" ||
       word == "endfunction" ||
       word == "then" ||
       word == "loop") {
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
const didSaveTextDocumentHandle = function (document) {
}
function activate(context) {
  vscode.languages.registerCompletionItemProvider(language, functionItemProvider, ...triggreCharacters.w);
  vscode.languages.registerCompletionItemProvider(language, codeItemProvider, ...triggreCharacters.c);
  vscode.languages.registerHoverProvider(language, hoverProvider);
  vscode.languages.registerColorProvider(language, colorProvider);
  vscode.languages.registerDocumentFormattingEditProvider(language, documentForrmatProvider);


  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    // 暂时不提供
    // var documentContent = textDocment.getText()
    // documentContent.match(/a/g)
    // var diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 6)), "哈哈哈", vscode.DiagnosticSeverity.Error)
    // diagnosticCollection.set(textDocment.uri, [diagnostic])
  })
}
exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
