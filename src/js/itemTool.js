
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
    if (char == "/" && text.charAt(i - 1) == "/") {
      // 对后续判断是否被字符串包含
      let hasColon = false
      if (stringing) {
        for (let k = i; k < text.length; k++) {
          if (text[k] == "\"" && text[k - 1] != "\\") {
            hasColon = true
          }
        }
      }
      if (hasColon) {
        continue;
      } else {
        return position.character > i
      }
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

  let codeRanges = findCodeRangesByLine(textLine)
  return codeRanges.findIndex(x => {
    return x.contains(position) && !x.start.isEqual(position)
  }) > -1
}

/**
 * 
 * @description 从文档中找到相应行号的单行注释范围数组
 * @param {vscode.TextLine} textLine
 * @returns {Array<vscode.Range>}
 */
const findStringRangesByLine = (textLine) => {

  let ranges = []
  if (!textLine || textLine.isEmptyOrWhitespace) {
    return ranges
  }

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
  return ranges
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
    ranges.push(...findStringRangesByLine(document.lineAt(i)))
  }
  console.log(ranges.length)
  return ranges
}

/**
 * 
 * @description 从文档中找到相应行号的单行注释范围数组
 * @param {vscode.TextLine} textLine
 * @returns {Array<vscode.Range>}
 */
const findCommentRangesByLine = (textLine) => {
  let ranges = []
  if (!textLine || textLine.isEmptyOrWhitespace) {
    return ranges
  }
  let text = textLine.text
  let stringing = false
  for (let s = 0; s < text.length; s++) {
    let char = text.charAt(s)
    if (char == "/" && text.charAt(s + 1) == "/") {
      // 对后续判断是否被字符串包含
      let hasColon = false
      if (stringing) {
        for (let k = s; k < text.length; k++) {
          if (text[k] == "\"" && text[k - 1] != "\\") {
            hasColon = true
          }
        }
      }
      if (hasColon) {
        continue;
      } else {
        ranges.push(new vscode.Range(new vscode.Position(textLine.lineNumber, s), textLine.rangeIncludingLineBreak.end))
        break;
      }
    } else if (stringing == false && char == "\"") {
      stringing = true
    } else if (stringing == true && char == "\"" && text.charAt(s - 1) != "\\") {
      stringing = false
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
    ranges.push(...findCommentRangesByLine(document.lineAt(i)))
  }
  return ranges
}


/**
 * 
 * @description 从文档行中找到所有当行代号的范围数组
 * @param {vscode.TextLine} textLine
 * @returns {Array<vscode.Range>}
 */
const findCodeRangesByLine = (textLine) => {
  let ranges = []
  if (!textLine || textLine.isEmptyOrWhitespace) {
    return ranges
  }
  let text = textLine.text
  let coding = false
  let start
  for (let s = 0; s < text.length; s++) {
    let char = text.charAt(s)
    if (char == "'") {
      let comments = findCommentRangesByLine(textLine)
      let strings = findStringRangesByLine(textLine)
      let pos = new vscode.Position(textLine.lineNumber, s)
      if (coding) {
        // bingo
        // 若不在字符串中亦不在注释中就push
        let range = new vscode.Range(start, new vscode.Position(textLine.lineNumber, s + 1))
        ranges.push(range)
        coding = false
      } else {
        // 若不在字符串中亦不在注释中就
        if (strings.findIndex(x => {
          return x.contains(pos)
        }) == -1 && comments.findIndex(x => {
          return x.contains(pos)
        }) == -1) {
          coding = true
          start = pos
        }
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
    ranges.push(...findCodeRangesByLine(document.lineAt(i)))
  }
  return ranges
}

/**
 * @description 从文档中找到所有globals块
 * @param {vscode.TextDocument} document
 * @returns {Array<vscode.Range>}
 */
const findGlobals = (document) => {
  let ranges = []
  if (!document) {
    return ranges
  }
  let start
  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i)
    let charIndex = textLine.firstNonWhitespaceCharacterIndex
    let charPosition = new vscode.Position(textLine.lineNumber, charIndex)
    if (document.getText(new vscode.Range(charPosition, new vscode.Position(textLine.lineNumber, charIndex + "globals".length))) == "globals") {
      start = charPosition
    } else if (document.getText(new vscode.Range(charPosition, new vscode.Position(textLine.lineNumber, charIndex + "endglobals".length))) == "endglobals") {
      ranges.push(new vscode.Range(start, new vscode.Position(textLine.lineNumber, charIndex + "endglobals".length)))
    }
  }
  return ranges
}

/**
 * @description 从行中获取所有空白段范围数组
 * @param {vscode.TextLine} textLine
 * @returns {Array<vscode.Range>}
 */
const findDividedSymbolsByLine = (textLine) => {
  let ranges = []
  if (!textLine) {
    return ranges
  }
  let text = textLine.text
  let spacing = false
  let start
  for (let i = 0; i < text.length; i++) {
    let char = text.charAt(i)
    if (new RegExp(/[\t ]/).test(char)) {

      if (!spacing) {
        start = new vscode.Position(textLine.lineNumber, i)
        spacing = true
      }
      if (!new RegExp(/[\t ]/).test(text.charAt(i + 1))) {

        ranges.push(new vscode.Range(start, new vscode.Position(textLine.lineNumber, i + 1)))
        spacing = false
      }
    }
  }
  return ranges
}

module.exports = {
  cheakInComment,
  cheakInString,
  cheakInCode,
  findStringRanges,
  findCommentRanges,
  findCommentRangesByLine,
  findCodeRangesByLine,
  findCodeRanges,
  findGlobals,
  findDividedSymbolsByLine
}