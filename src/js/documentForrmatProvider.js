/**
 * 写时脑子就抽，现在看不懂 不敢改
 * 要添加功能直接在后面添加
 * 有时间需从新写
 */
const vscode = require("vscode")

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

/**
  * 
  * @param {vscode.TextDocument} document 
  * @param {vscode.FormattingOptions} options 
  * @param {vscode.CancellationToken} token 
  * @returns {vscode.ProviderResult<vscode.TextEdit[]>}
  */
const provideDocumentFormattingEdits = (document, options, token) => {
  let documentContent = document.getText()
  let edits = []
  let edit = vscode.TextEdit
  let line = 0
  let colume = 0
  // 
  let ident = 0
  let tabSize = options.tabSize | 2
  //
  let words = participle(documentContent)


  // 2019年8月28日修改，添加缩进功能
  let lineCount = document.lineCount
  for (let i = 0; i < lineCount; i++) {
    let textLine = document.lineAt(i)
    let fci = textLine.firstNonWhitespaceCharacterIndex
    if (textLine.isEmptyOrWhitespace) {
      edits.push(vscode.TextEdit.delete(textLine.range))
    }
    else if ("globals" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "globals".length))) {
      edits.push(vscode.TextEdit.delete(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci)))
      ident = 1
    } else if ("endglobals" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endglobals".length))) {
      edits.push(vscode.TextEdit.delete(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci)))
      ident = 0
    }
    else if ("function" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "function".length))) {
      edits.push(vscode.TextEdit.delete(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci)))
      ident = 1
    } else if ("endfunction" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endfunction".length))) {
      edits.push(vscode.TextEdit.delete(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci)))
      ident = 0
    } else if ("if" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "if".length))) {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident, "\t")))
      ident += 1
    }
    else if ("elseif" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "elseif".length)) ||
      "else" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "else".length))) {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident - 1, "\t")))
    } else if ("endif" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endif".length))) {
      ident -= 1
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident, "\t")))
    } else if ("loop" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "loop".length))) {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident, "\t")))
      ident += 1
    } else if ("endloop" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endloop".length))) {
      ident -= 1
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident, "\t")))
    } else {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident, "\t")))

    }
  }
  console.log(edits.slice(1000))
  return edits
}
module.exports = { provideDocumentFormattingEdits }