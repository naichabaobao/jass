/**
 * 写时脑子就抽，现在看不懂 不敢改
 * 要添加功能直接在后面添加
 * 有时间需从新写
 */
const vscode = require("vscode")
const itemTool = require("./itemTool")

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
  let lineCount = document.lineCount
  //格式化
  for (let i = 0; i < lineCount; i++) {
    let textLine = document.lineAt(i)
    if (textLine.isEmptyOrWhitespace) {
      continue;
    } else if (document.getText(new vscode.Range(textLine.lineNumber, textLine.firstNonWhitespaceCharacterIndex, textLine.lineNumber, textLine.firstNonWhitespaceCharacterIndex + "//".length)) == "//") {
      continue;
    } else {
      try {
        // 单词与单词间
        itemTool.findRanges(textLine, new RegExp(/(\w+\s{2,}[a-zA-z]\w*)/)).forEach(s => {
          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/g, " ")))
        })
        // 单词与运算符之间
        itemTool.findRanges(textLine, new RegExp(/(\w+\s{2,}[\+\-\*\/%!=<>])/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/g, " ")))
        })
        // 单词与运算符之间
        itemTool.findRanges(textLine, new RegExp(/(\w+[\+\-\*\/%!=<>])/)).forEach(s => {

          edits.push(vscode.TextEdit.insert(s.end.with(textLine.lineNumber, s.end.character - 1), " "))
        })
        // 单词与运算符之间
        itemTool.findRanges(textLine, new RegExp(/\w+\s+(,|(?<!if\s*)\(|\)|\[|\])/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, "")))
        })

        // 运算符与单词之间
        itemTool.findRanges(textLine, new RegExp(/[\+\*\/%=<>,]\w+/)).forEach(s => {

          edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.start.character + 1), " "))
        })
        // 运算符与单词之间
        itemTool.findRanges(textLine, new RegExp(/[\+\-\*\/%=<>,]\s{2,}\w+/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
        })
        // 运算符与单词之间
        itemTool.findRanges(textLine, new RegExp(/(\(|\[|!)\s+\w+/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, "")))
        })
        // if与(之间
        itemTool.findRanges(textLine, new RegExp(/if\(/)).forEach(s => {

          edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.end.character - 1), " "))
        })
        itemTool.findRanges(textLine, new RegExp(/if\s{2,}\(/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
        })
        // )与then之间
        itemTool.findRanges(textLine, new RegExp(/\)then/)).forEach(s => {

          edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.start.character + 1), " "))
        })
        itemTool.findRanges(textLine, new RegExp(/\)\s{2,}then/)).forEach(s => {

          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
        })
        // 符号与符号之间 ()  (!  ("  ('  (-  ((  (. !( )) )] ), [( ]) ], ') ', ") ", .) ., != >= <= ==  
        itemTool.findRanges(textLine, new RegExp(/\(\s+\)|\(\s+!|\(\s+"|\(\s+'|\(\s+\-|\(\s+\(|\(\s+\.|!\s+\(|\)\s+\)|\)\s+,|\)\s+\]|\[\s+\(|\]\s+\)|\]\s+,|'\s+\)|'\s+,|"\s+\)|"\s+,|\.\s+\)|\.\s+,|!\s+=|>\s+=|<\s+=|=\s+=/)).forEach(s => {
          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, "")))
        })
        // +. +- +" +' +( -. -- -' -( *. *- *' *( /- /. /' /( %- %. %' %( =. =- =' =" =( =! >- >. >( >' <- <. <( <' '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= ]+ ]- ]* ]/ ]% ]> ]< ]! ]= .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,!
        itemTool.findRanges(textLine, new RegExp(/\+\.|\+\-|\+"|\+'|\+\(|\-\.|\-\-|\-'|\-\(|\*\.|\*\-|\*'|\*\(|\/\.|\/\-|\/'|\/\(|%\.|%\-|%'|%\(|=\.|=\-|='|="|=\(|=!|>\-|>\.|>\(|>'|<\-|<\.|<\(|<'|'\+|'\-|'\*|'\/|'%|'=|'>|'<|'!|"\+|"=|"!|\)\+|\)\-|\)\*|\)\/|\)%|\)>|\)<|\)!|\)=|]\+|]\-|]\*|]\/|]%|]>|]<|]!|]=|\.\+|\.\-|\.\*|\.\/|\.%|\.>|\.<|\.!|\.=|,\-|,\.|,'|,"|,\(|,!/)).forEach(s => {
          edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.start.character + 1), " "))
        })
        // +. +- +" +' +( -. -- -' -( *. *- *' *( /- /. /' /( %- %. %' %( =. =- =' =" =( =! >- >. >( >' <- <. <( <' '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= ]+ ]- ]* ]/ ]% ]> ]< ]! ]= .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,!
        itemTool.findRanges(textLine, new RegExp(/\+\s{2,}\.|\+\s{2,}\-|\+\s{2,}"|\+\s{2,}'|\+\s{2,}\(|\-\s{2,}\.|\-\s{2,}\-|\-\s{2,}'|\-\s{2,}\(|\*\s{2,}\.|\*\s{2,}\-|\*\s{2,}'|\*\s{2,}\(|\/\s{2,}\.|\/\s{2,}\-|\/\s{2,}'|\/\s{2,}\(|%\s{2,}\.|%\s{2,}\-|%\s{2,}'|%\s{2,}\(|=\s{2,}\.|=\s{2,}\-|=\s{2,}'|=\s{2,}"|=\s{2,}\(|=\s{2,}!|>\s{2,}\-|>\s{2,}\.|>\s{2,}\(|>\s{2,}'|<\s{2,}\-|<\s{2,}\.|<\s{2,}\(|<\s{2,}'|'\s{2,}\+|'\s{2,}\-|'\s{2,}\*|'\s{2,}\/|'\s{2,}%|'\s{2,}=|'\s{2,}>|'\s{2,}<|'\s{2,}!|"\s{2,}\+|"\s{2,}=|"\s{2,}!|\)\s{2,}\+|\)\s{2,}\-|\)\s{2,}\*|\)\s{2,}\/|\)\s{2,}%|\)\s{2,}>|\)\s{2,}<|\)\s{2,}!|\)\s{2,}=|]\s{2,}\+|]\s{2,}\-|]\s{2,}\*|]\s{2,}\/|]\s{2,}%|]\s{2,}>|]\s{2,}<|]\s{2,}!|]\s{2,}=|\.\s{2,}\+|\.\s{2,}\-|\.\s{2,}\*|\.\s{2,}\/|\.\s{2,}%|\.\s{2,}>|\.\s{2,}<|\.\s{2,}!|\.\s{2,}=|,\s{2,}\-|,\s{2,}\.|,\s{2,}'|,\s{2,}"|,\s{2,}\(|,\s{2,}!/)).forEach(s => {
          edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  // 2019年8月28日修改，添加缩进功能

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

    // 2019年8月29日，添加内容格式化

  }
  return edits
}
module.exports = { provideDocumentFormattingEdits }