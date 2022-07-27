import * as vscode from 'vscode';
import { Tokenizer } from '../jass/tokens';

/// 颜色提供
const convertInt2Hex = (int: number) => {
  return Math.round(int * 255).toString(16).padStart(2, "0")
}
const color2JColorCode = (color: vscode.Color) => {
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

class JassDocumentColorProvider implements vscode.DocumentColorProvider {

  /// 颜色改变到文档
  provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
    let lineCount = document.lineCount
    let colors = new Array<vscode.ColorInformation>();
    // new RegExp(/\|[cC][\da-fA-F]{8}.+?\|[rR]/, "g")
    let colorReg = new RegExp(/\|[cC][\da-fA-F]{8}/, "g")
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
  /// 文档改变到颜色
  provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range; }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
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


}

console.log("?????");

vscode.languages.registerColorProvider("jass", new JassDocumentColorProvider);

vscode.languages.registerColorProvider("jass", new class DocumentColorProvider implements vscode.DocumentColorProvider {

  provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
    const lineCount = document.lineCount;
    let colors = new Array<vscode.ColorInformation>();
    // new RegExp(/\|[cC][\da-fA-F]{8}.+?\|[rR]/, "g")

    const DzGetColorMatch = new RegExp(/\bDzGetColor/)

    console.log("do ");

    // let colorReg = new RegExp(/DzGetColor\(\s*(?<a>[\dxX$'\.]+)\s*,\s*(?<r>[\dxX$'\.]+)\s*,\s*(?<g>[\dxX$'\.]+)\s*,\s*(?<b>[\dxX$'\.]+))\s*\)/, "g")
    for (let i = 0; i < lineCount; i++) {
      let lineText = document.lineAt(i).text;

      if (DzGetColorMatch.test(lineText)) {
        console.log("zhaodaole ");
      }

      // if (colorReg.test(lineText)) {
        
      //   const matchSet = lineText.match(colorReg);

      //   if (matchSet) {
      //     const parse = (mat: RegExpMatchArray) => {
      //       if (!mat.groups) {
      //         return;
      //       }
      //       console.log(mat.index);
            
      //       const aStr = mat.groups["a"];
      //       const rStr = mat.groups["r"];
      //       const gStr = mat.groups["g"];
      //       const bStr = mat.groups["b"];
  
      //       Tokenizer.get(aStr)
  
      //     };

      //     parse(matchSet);
      //   }
      // }
      // let colotSet = lineText.match(colorReg)
      // let posstion = 0
      // if (colotSet && 'forEach' in colotSet) {
      //   colotSet.forEach(x => {
          
          
          // posstion = lineText.indexOf(x, posstion)
          // let range = new vscode.Range(i, posstion, i, posstion + x.length)
          // let a = Number.parseInt("0x" + lineText.substr(posstion + 2, 2)) / 255
          // let r = Number.parseInt("0x" + lineText.substr(posstion + 4, 2)) / 255
          // let g = Number.parseInt("0x" + lineText.substr(posstion + 6, 2)) / 255
          // let b = Number.parseInt("0x" + lineText.substr(posstion + 8, 2)) / 255
          // colors.push(new vscode.ColorInformation(range, new vscode.Color(r, g, b, a)))
          // posstion += x.length
      //   })
      // }
    }
    return colors;
  }
  provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range; }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
    return [new vscode.ColorPresentation(`DzGetColor(${color.alpha}, ${color.red}, ${color.green}, ${color.blue})`)];
  }

}());