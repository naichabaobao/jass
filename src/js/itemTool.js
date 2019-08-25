
const vscode = require("vscode")

/**
 * 检查position是否在单行注释中
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cheakInComment = (document, position) => {
  let line = document.lineAt(position.line)
  let text = line.text
  let commentStartIndex = text.indexOf("//")
  if (commentStartIndex != -1) {
    return false
  } else {
    return position.character > commentStartIndex
  }
}

/**
 * 检查position是否在字符串中
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cheakInString = (document, position) => {
  let line = document.lineAt(position.line)
  // 去除转义字符串
  let text = line.text.replace(/\\\\"/g, "??")

  let stringing = false
  for (let stringStartIndex = 0; (stringStartIndex = text.indexOf("\"", stringStartIndex)) != -1; stringStartIndex++) {
    stringing = !stringing
    if (stringing) {
      if (position.character < stringStartIndex) {
        return false
      }
    } else {
      if (position.character < stringStartIndex) {
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
  let text = document.lineAt(position).text
  for (let i = 0; i < 5; i++) {
    let char = text.charAt(position.character - i)
    if (char == "'") {
      return true
    }
  }
  return false
}

module.exports = {
  cheakInComment, cheakInString, cheakInCode
}