/**
 * 颜色提供
 */

const vscode = require("vscode")

const convertInt2Hex = (int) => {
  return Math.ceil(int * 255).toString(16).padStart(2, "0")
}
const color2JColorCode = (color) => {
  if (color instanceof vscode.Color) {
    let r = color.red
    let g = color.green
    let b = color.blue
    let a = color.alpha
    let colorCodeString = convertInt2Hex(a) + convertInt2Hex(r) + convertInt2Hex(g) + convertInt2Hex(b)
    return colorCodeString
  }
  return "00000000"
}
const provideDocumentColors = (document, token) => {
  let lineCount = document.lineCount
  let colors = []
  let colorReg = new RegExp(/\|[cC][\da-fA-F]{8}.+?\|[rR]/, "g")
  for (let i = 0; i < lineCount; i++) {
    let lineText = document.lineAt(i).text
    let colotSet = lineText.match(colorReg)
    let posstion = 0
    if (colotSet) {
      colotSet.forEach(x => {
        posstion = lineText.indexOf(x, posstion)
        let range = new vscode.Range(i, posstion, i, posstion + x.length)
        let a = Number.parseInt("0x" + lineText.substr(posstion + 2, 2)) / 255
        let r = Number.parseInt("0x" + lineText.substr(posstion + 4, 2)) / 255
        let g = Number.parseInt("0x" + lineText.substr(posstion + 6, 2)) / 255
        let b = Number.parseInt("0x" + lineText.substr(posstion + 8, 2)) / 255
        colors.push(new vscode.ColorInformation(range, new vscode.Color(r, g, b, a)))
        posstion += x.length
      })
    }
  }
  return colors
}

const provideColorPresentations = (color, context, token) => {
  let r = color.red
  let g = color.green
  let b = color.blue
  let a = color.alpha
  let document = context.document
  let range = context.range
  let documentText = document.getText(range)
  return [new vscode.ColorPresentation(`${
    documentText.substr(0, 2)
    }${
    color2JColorCode(new vscode.Color(r, g, b, a))
    }${
    documentText.substring(10)
    }`)]
}

module.exports = {
  provideDocumentColors,
  provideColorPresentations
}