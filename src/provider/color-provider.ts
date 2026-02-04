import * as vscode from 'vscode';
import { jassIntegerToNumber } from '../tool';
// @deprecated 此导入来自废弃的 jass 目录，将在未来版本中移除。请优先使用 vjass 目录下的实现。
import { tokenize } from '../jass/tokens';

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

const DzColorReg = new RegExp(/(?:(?:DzGetColor)|(?:BlzConvertColor))\(\s*(?:[\dxXA-Fa-f\$'\.]+)\s*,\s*(?:[\dxXA-Fa-f\$'\.]+)\s*,\s*(?:[\dxXA-Fa-f\$'\.]+)\s*,\s*(?:[\dxXA-Fa-f\$'\.]+)\s*\)/, "g")

export class JassDocumentColorProvider implements vscode.DocumentColorProvider {

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
    try {
      for (let i = 0; i < lineCount; i++) {
        let lineText = document.lineAt(i).text
        
        if (DzColorReg.test(lineText)) {
          
          const result = /(?:(?:DzGetColor)|(?:BlzConvertColor))\(\s*(?<a>[\dA-Fa-fxX\$'\.]+)\s*,\s*(?<r>[\dA-Fa-fxX\$'\.]+)\s*,\s*(?<g>[\dA-Fa-fxX\$'\.]+)\s*,\s*(?<b>[\dA-Fa-fxX\$'\.]+)\s*\)/g.exec(lineText);
          
          if (result && result.groups) {
              const aStr = result.groups["a"];
              const rStr = result.groups["r"];
              const gStr = result.groups["g"];
              const bStr = result.groups["b"];
    
              
              
              const aToken = tokenize(aStr);
              const rToken = tokenize(rStr);
              const gToken = tokenize(gStr);
              const bToken = tokenize(bStr);
              
              
              if (!(aToken.length == 1 && rToken.length == 1 && gToken.length == 1 && bToken.length == 1)) { // 确保只有一个token
                continue;
              }
              const types = ["int", "hex", "mark", "dollar_hex", "octal"];
              if (types.includes(aToken[0].type) && types.includes(rToken[0].type) && types.includes(gToken[0].type) && types.includes(bToken[0].type)) {
    
    
                const aValue = jassIntegerToNumber(aToken[0].type, aToken[0].value);
                const rValue = jassIntegerToNumber(rToken[0].type, rToken[0].value);
                const gValue = jassIntegerToNumber(gToken[0].type, gToken[0].value);
                const bValue = jassIntegerToNumber(bToken[0].type, bToken[0].value);
                if (aValue == null || rValue == null || gValue == null || bValue == null) {
                  continue;
                }
                const range = new vscode.Range(i, result.index, i, result.index + result[0].length);
                const colorInfo = new vscode.ColorInformation(range, new vscode.Color(rValue / 255, gValue / 255, bValue / 255, aValue / 255));
                
                
    
                colors.push(colorInfo);
              }
    
          }
    
        }
  
      }
    } catch (error) {
      console.error(error);
    }

    return colors;
  }
  /// 文档改变到颜色
  provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range; }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
    let r = color.red
    let g = color.green
    let b = color.blue
    let a = color.alpha
    let document = context.document
    let range = context.range
    let documentText = document.getText(range);

    
    if (documentText.startsWith("DzGetColor")) {
      return [new vscode.ColorPresentation(`DzGetColor(${"0x" + convertInt2Hex(color.alpha)}, ${"0x" + convertInt2Hex(color.red)}, ${"0x" + convertInt2Hex(color.green)}, ${"0x" + convertInt2Hex(color.blue)})`)];
    } else if (documentText.startsWith("BlzConvertColor")) {
      return [new vscode.ColorPresentation(`BlzConvertColor(${"0x" + convertInt2Hex(color.alpha)}, ${"0x" + convertInt2Hex(color.red)}, ${"0x" + convertInt2Hex(color.green)}, ${"0x" + convertInt2Hex(color.blue)})`)];
    } else {
      return [new vscode.ColorPresentation(`${
        documentText.substr(0, 2)
        }${
        color2JColorCode(new vscode.Color(r, g, b, a))
        }${
        documentText.substring(10)
        }`)];
    }
  }


}

// vscode.languages.registerColorProvider("jass", new JassDocumentColorProvider);
