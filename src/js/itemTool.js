
const vscode = require("vscode")

/**
 * 判断是否在注释中
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cheakInComment = (document, position) => {
  let textLine = document.lineAt(position)
  let text = textLine.text
  let stringing = false
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i)
    if (stringing == false && char == "/" && text.charAt(i - 1) == "/") {
      return position.character > i
    } else if (stringing == false && char == "\"") {
      stringing = true
    } else if (stringing == true && char == "\"" && text.charAt(i - 1) != "\\") {
      stringing = false
    }
  }
  return false
}

/**
 * 检查position是否在字符串中
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cheakInString = (document, position) => {
  let textLine = document.lineAt(position)
  let text = textLine.text
  let stringing = false
  let p = 0
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i)
    if (stringing == false && char == "/" && text.charAt(i - 1) == "/") {
      return position.character > i ? false : true
    } else if (stringing == false && char == "\"") {
      stringing = true
      p = i
    } else if (stringing == true && char == "\"" && text.charAt(i - 1) != "\\") {
      stringing = false
      if (position.character > p && position.character <= i) {
        return true
      }
    }
  }
  return false
}

/**
 * 检查position是否在代号中
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cheakInCode = (document, position) => {
  let textLine = document.lineAt(position)
  let text = textLine.text
  let coding = false
  let p = 0
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i)
    if (coding == false && char == "'") {
      coding = true
      p = i
    } else if (coding && char == "'") {
      coding = false
      if (position.character > p && position.character <= i) {
        return true
      }
    }
  }
  return false
}

/**
 * 
 * @description 从文档中找到所有字符串的范围数组
 * @param {vscode.TextDocument} document
 * @returns {Array<vscode.Range>}
 */
const findStringRanges = (document) => {
  let ranges = []
  if (!document) {
    return ranges
  }
  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i)
    let text = textLine.text
    let stringing = false
    let start
    for (let s = 0; s < text.length; s++) {
      let char = text.charAt(s)
      if (stringing == false && char == "/" && text.charAt(s - 1) == "/") {
        break;
      } else if (stringing == false && char == "\"") {
        start = new vscode.Position(textLine.lineNumber, s)
        stringing = true
      } else if (stringing == true && char == "\"" && text.charAt(s - 1) != "\\") {
        ranges.push(new vscode.Range(start, new vscode.Position(textLine.lineNumber, s + char.length)))
        stringing = false
      }
    }
  }

  return ranges
}

/**
 * 
 * @description 从文档中找到所有当行注释的范围数组
 * @param {vscode.TextDocument} document
 * @returns {Array<vscode.Range>}
 */
const findCommentRanges = (document) => {
  let ranges = []
  if (!document) {
    return ranges
  }
  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i)
    let text = textLine.text
    let stringing = false
    for (let s = 0; s < text.length; s++) {
      if (textLine.isEmptyOrWhitespace) {
        break;
      }
      let char = text.charAt(s)
      if (stringing == false && char == "/" && text.charAt(s + 1) == "/") {
        ranges.push(new vscode.Range(new vscode.Position(textLine.lineNumber, s), textLine.rangeIncludingLineBreak.end))
        break;
      } else if (stringing == false && char == "\"") {
        stringing = true
      } else if (stringing == true && char == "\"" && text.charAt(s - 1) != "\\") {
        stringing = false
      }
    }
  }
  return ranges
}

/**
 * 
 * @description 从文档中找到所有当行代号的范围数组
 * @param {vscode.TextDocument} document
 * @returns {Array<vscode.Range>}
 */
const findCodeRanges = (document) => {
  let ranges = []
  if (!document) {
    return ranges
  }
  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i)
    let text = textLine.text
    let stringing = false
    for (let s = 0; s < text.length; s++) {
      if (textLine.isEmptyOrWhitespace) {
        break;
      }
      let char = text.charAt(s)
      if (stringing == false && char == "/" && text.charAt(s + 1) == "/") {
        ranges.push(new vscode.Range(new vscode.Position(textLine.lineNumber, s), textLine.rangeIncludingLineBreak.end))
        break;
      } else if (stringing == false && char == "\"") {
        stringing = true
      } else if (stringing == true && char == "\"" && text.charAt(s - 1) != "\\") {
        stringing = false
      }
    }
  }
  return ranges
}

module.exports = {
  cheakInComment, cheakInString, cheakInCode, findStringRanges, findCommentRanges
}