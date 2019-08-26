
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

module.exports = {
  cheakInComment, cheakInString, cheakInCode
}