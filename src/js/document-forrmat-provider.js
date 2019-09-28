/**
 * 写时脑子就抽，现在看不懂 不敢改
 * 要添加功能直接在后面添加
 * 有时间需从新写
 */
const vscode = require("vscode")
const itemTool = require("./item-tool")

// ()  (!  ("  ('  (-  ((  (. (w !( !w )) )] ), [( [w ]) ], ') ', ") ", .) ., .w != !w >= <= == -w w( w) w[ w] w, w.

// \(\s+\)|\(\s+!|\(\s+"|\(\s+'|\(\s+\-|\(\s+\(|\(\s+\.|\(\s+\w|!\s+\(|!\s+\w|\)\s+\)|\)\s+,|\)\s+\]|\[\s+\(|(\[\s+\w)|\]\s+\)|\]\s+,|'\s+\)|'\s+,|"\s+\)|"\s+,|\.\s+\)|\.\s+\w|\.\s+,|!\s+=|!\s+\w|>\s+=|<\s+=|=\s+=|(?<=(\+|\-|\*|\/|%|>|<|=|,|\(|\[)\s*)\-\s+\w|\w\s+\(|\w\s+\)|\w\s+\[|\w(?<!if)\s+\]|\w\s+,|\w\s+\.

const deleteSpaceeRegExp = [new RegExp(/\(\s+\)/), new RegExp(/\(\s+!/), new RegExp(/\(\s+"/), new RegExp(/\(\s+'/), new RegExp(/\(\s+\-/), new RegExp(/\(\s+\(/), new RegExp(/\(\s+\./), new RegExp(/\(\s+\w/), new RegExp(/!\s+\(/), new RegExp(/!\s+\w/), new RegExp(/\)\s+\)/), new RegExp(/\)\s+,/), new RegExp(/\)\s+\]/), new RegExp(/\[\s+\(/), new RegExp(/(\[\s+\w)/), new RegExp(/\]\s+\)/), new RegExp(/\]\s+,/), new RegExp(/'\s+\)/), new RegExp(/'\s+,/), new RegExp(/"\s+\)/), new RegExp(/"\s+,/), new RegExp(/\.\s+\)/), new RegExp(/\.\s+\w/), new RegExp(/\.\s+,/), new RegExp(/!\s+=/), new RegExp(/!\s+\w/), new RegExp(/>\s+=/), new RegExp(/<\s+=/), new RegExp(/=\s+=/), new RegExp(/(?<=(\+|\-|\*|\/|%|>|<|=|,|\(|\[)\s*)\-\s+\w/), new RegExp(/\w\s+\(/), new RegExp(/\w\s+\)/), new RegExp(/\w\s+\[/), new RegExp(/\w(?<!if)\s+\]/), new RegExp(/\w\s+,/), new RegExp(/\w\s+\./)]

// +. +- +" +' +( +w -. -- -' -( -w *. *- *' *( *w /- /. /' /( /* %- %. %' %( %w =. =- =' =" =( =! =w >- >. >( >' >w <- <. <( <' <w '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= )w ]+ ]- ]* ]/ ]% ]> ]< ]! ]= ]w .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,! ,w w+ w- w* w/ w% w! w= w> w<

// \+\.|\+\-|\+"|\+'|\+\(|\+\w|\-\.|\-\-|\-'|\-\(|(?<=(\w|\.|\)|\]|')\s*)\-\w|\*\.|\*\-|\*'|\*\(|\*\w|\/\.|\/\-|\/'|\/\(|\/\w|%\.|%\-|%'|%\(|%\w|=\.|=\-|='|="|=\(|=!|=\w|>\-|>\.|>\(|>'|>\w|<\-|<\.|<\(|<'|<\w|'\+|'\-|'\*|'\/|'%|'=|'>|'<|'!|"\+|"=|"!|\)\+|\)\-|\)\*|\)\/|\)%|\)>|\)<|\)!|\)=|\)\w|]\+|]\-|]\*|]\/|]%|]>|]<|]!|]=|]\w|\.\+|\.\-|\.\*|\.\/|\.%|\.>|\.<|\.!|\.=|,\-|,\.|,'|,"|,\(|,!|,\w|\w\+|\w\-|\w\*|\w\/|\w%|\w!|\w=|\w>|\w<

const insertSpaceRegExp = [new RegExp(/\+\./), new RegExp(/\+\-/), new RegExp(/\+"/), new RegExp(/\+'/), new RegExp(/\+\(/), new RegExp(/\+\w/), new RegExp(/\-\./), new RegExp(/\-\-/), new RegExp(/\-'/), new RegExp(/\-\(/), new RegExp(/(?<=(\w|\.|\)|\]|')\s*)\-\w/), new RegExp(/\*\./), new RegExp(/\*\-/), new RegExp(/\*'/), new RegExp(/\*\(/), new RegExp(/\*\w/), new RegExp(/\/\./), new RegExp(/\/\-/), new RegExp(/\/'/), new RegExp(/\/\(/), new RegExp(/\/\w/), new RegExp(/%\./), new RegExp(/%\-/), new RegExp(/%'/), new RegExp(/%\(/), new RegExp(/%\w/), new RegExp(/=\./), new RegExp(/=\-/), new RegExp(/='/), new RegExp(/="/), new RegExp(/=\(/), new RegExp(/=!/), new RegExp(/=\w/), new RegExp(/>\-/), new RegExp(/>\./), new RegExp(/>\(/), new RegExp(/>'/), new RegExp(/>\w/), new RegExp(/<\-/), new RegExp(/<\./), new RegExp(/<\(/), new RegExp(/<'/), new RegExp(/<\w/), new RegExp(/'\+/), new RegExp(/'\-/), new RegExp(/'\*/), new RegExp(/'\//), new RegExp(/'%/), new RegExp(/'=/), new RegExp(/'>/), new RegExp(/'</), new RegExp(/'!/), new RegExp(/"\+/), new RegExp(/"=/), new RegExp(/"!/), new RegExp(/\)\+/), new RegExp(/\)\-/), new RegExp(/\)\*/), new RegExp(/\)\//), new RegExp(/\)%/), new RegExp(/\)>/), new RegExp(/\)</), new RegExp(/\)!/), new RegExp(/\)=/), new RegExp(/\)\w/), new RegExp(/]\+/), new RegExp(/]\-/), new RegExp(/]\*/), new RegExp(/]\//), new RegExp(/]%/), new RegExp(/]>/), new RegExp(/]</), new RegExp(/]!/), new RegExp(/]=/), new RegExp(/]\w/), new RegExp(/\.\+/), new RegExp(/\.\-/), new RegExp(/\.\*/), new RegExp(/\.\//), new RegExp(/\.%/), new RegExp(/\.>/), new RegExp(/\.</), new RegExp(/\.!/), new RegExp(/\.=/), new RegExp(/,\-/), new RegExp(/,\./), new RegExp(/,'/), new RegExp(/,"/), new RegExp(/,\(/), new RegExp(/,!/), new RegExp(/,\w/), new RegExp(/\w\+/), new RegExp(/\w\-/), new RegExp(/\w\*/), new RegExp(/\w\//), new RegExp(/\w%/), new RegExp(/\w!/), new RegExp(/\w=/), new RegExp(/\w>/), new RegExp(/\w</)]

// +. +- +" +' +( +w -. -- -' -( -w *. *- *' *( *w /- /. /' /( /w %- %. %' %( %w =. =- =' =" =( =! =w >- >. >( >' >w <- <. <( <' '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= )w ]+ ]- ]* ]/ ]% ]> ]< ]! ]= ]w .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,! ,w w+ w- w* w/ w% w! w= w> w< ww

// \+\s{2,}\.|\+\s{2,}\-|\+\s{2,}"|\+\s{2,}'|\+\s{2,}\(|\+\s{2,}\w|\-\s{2,}\.|\-\s{2,}\-|\-\s{2,}'|\-\s{2,}\(|\*\s{2,}\.|\*\s{2,}\-|(?<=(\w|\.|\)|\]|')\s*)\-\s{2,}\w|\*\s{2,}'|\*\s{2,}\(|\*\s{2,}\w|\/\s{2,}\.|\/\s{2,}\-|\/\s{2,}'|\/\s{2,}\(|\/\s{2,}\w|%\s{2,}\.|%\s{2,}\-|%\s{2,}'|%\s{2,}\(|%\s{2,}\w|=\s{2,}\.|=\s{2,}\-|=\s{2,}'|=\s{2,}"|=\s{2,}\(|=\s{2,}!|=\s{2,}\w|>\s{2,}\-|>\s{2,}\.|>\s{2,}\(|>\s{2,}'|>\s{2,}\w|<\s{2,}\-|<\s{2,}\.|<\s{2,}\(|<\s{2,}'|<\s{2,}\w|'\s{2,}\+|'\s{2,}\-|'\s{2,}\*|'\s{2,}\/|'\s{2,}%|'\s{2,}=|'\s{2,}>|'\s{2,}<|'\s{2,}!|"\s{2,}\+|"\s{2,}=|"\s{2,}!|\)\s{2,}\+|\)\s{2,}\-|\)\s{2,}\*|\)\s{2,}\/|\)\s{2,}%|\)\s{2,}>|\)\s{2,}<|\)\s{2,}!|\)\s{2,}=|\)\s{2,}\w|]\s{2,}\+|]\s{2,}\-|]\s{2,}\*|]\s{2,}\/|]\s{2,}%|]\s{2,}>|]\s{2,}<|]\s{2,}!|]\s{2,}=|]\s{2,}\w|\.\s{2,}\+|\.\s{2,}\-|\.\s{2,}\*|\.\s{2,}\/|\.\s{2,}%|\.\s{2,}>|\.\s{2,}<|\.\s{2,}!|\.\s{2,}=|,\s{2,}\-|,\s{2,}\.|,\s{2,}'|,\s{2,}"|,\s{2,}\(|,\s{2,}!|,\s{2,}\w|\w\s{2,}\+|\w\s{2,}\-|\w\s{2,}\*|\w\s{2,}\/|\w\s{2,}%|\w\s{2,}!|\w\s{2,}=|\w\s{2,}>|\w\s{2,}<|\w\s{2,}\w

const toSignSpaceRegExp = [new RegExp(/\+\s{2,}\./), new RegExp(/\+\s{2,}\-/), new RegExp(/\+\s{2,}"/), new RegExp(/\+\s{2,}'/), new RegExp(/\+\s{2,}\(/), new RegExp(/\+\s{2,}\w/), new RegExp(/\-\s{2,}\./), new RegExp(/\-\s{2,}\-/), new RegExp(/\-\s{2,}'/), new RegExp(/\-\s{2,}\(/), new RegExp(/\*\s{2,}\./), new RegExp(/\*\s{2,}\-/), new RegExp(/(?<=(\w|\.|\)|\]|')\s*)\-\s{2,}\w/), new RegExp(/\*\s{2,}'/), new RegExp(/\*\s{2,}\(/), new RegExp(/\*\s{2,}\w/), new RegExp(/\/\s{2,}\./), new RegExp(/\/\s{2,}\-/), new RegExp(/\/\s{2,}'/), new RegExp(/\/\s{2,}\(/), new RegExp(/\/\s{2,}\w/), new RegExp(/%\s{2,}\./), new RegExp(/%\s{2,}\-/), new RegExp(/%\s{2,}'/), new RegExp(/%\s{2,}\(/), new RegExp(/%\s{2,}\w/), new RegExp(/=\s{2,}\./), new RegExp(/=\s{2,}\-/), new RegExp(/=\s{2,}'/), new RegExp(/=\s{2,}"/), new RegExp(/=\s{2,}\(/), new RegExp(/=\s{2,}!/), new RegExp(/=\s{2,}\w/), new RegExp(/>\s{2,}\-/), new RegExp(/>\s{2,}\./), new RegExp(/>\s{2,}\(/), new RegExp(/>\s{2,}'/), new RegExp(/>\s{2,}\w/), new RegExp(/<\s{2,}\-/), new RegExp(/<\s{2,}\./), new RegExp(/<\s{2,}\(/), new RegExp(/<\s{2,}'/), new RegExp(/<\s{2,}\w/), new RegExp(/'\s{2,}\+/), new RegExp(/'\s{2,}\-/), new RegExp(/'\s{2,}\*/), new RegExp(/'\s{2,}\//), new RegExp(/'\s{2,}%/), new RegExp(/'\s{2,}=/), new RegExp(/'\s{2,}>/), new RegExp(/'\s{2,}</), new RegExp(/'\s{2,}!/), new RegExp(/"\s{2,}\+/), new RegExp(/"\s{2,}=/), new RegExp(/"\s{2,}!/), new RegExp(/\)\s{2,}\+/), new RegExp(/\)\s{2,}\-/), new RegExp(/\)\s{2,}\*/), new RegExp(/\)\s{2,}\//), new RegExp(/\)\s{2,}%/), new RegExp(/\)\s{2,}>/), new RegExp(/\)\s{2,}</), new RegExp(/\)\s{2,}!/), new RegExp(/\)\s{2,}=/), new RegExp(/\)\s{2,}\w/), new RegExp(/]\s{2,}\+/), new RegExp(/]\s{2,}\-/), new RegExp(/]\s{2,}\*/), new RegExp(/]\s{2,}\//), new RegExp(/]\s{2,}%/), new RegExp(/]\s{2,}>/), new RegExp(/]\s{2,}</), new RegExp(/]\s{2,}!/), new RegExp(/]\s{2,}=/), new RegExp(/]\s{2,}\w/), new RegExp(/\.\s{2,}\+/), new RegExp(/\.\s{2,}\-/), new RegExp(/\.\s{2,}\*/), new RegExp(/\.\s{2,}\//), new RegExp(/\.\s{2,}%/), new RegExp(/\.\s{2,}>/), new RegExp(/\.\s{2,}</), new RegExp(/\.\s{2,}!/), new RegExp(/\.\s{2,}=/), new RegExp(/,\s{2,}\-/), new RegExp(/,\s{2,}\./), new RegExp(/,\s{2,}'/), new RegExp(/,\s{2,}"/), new RegExp(/,\s{2,}\(/), new RegExp(/,\s{2,}!/), new RegExp(/,\s{2,}\w/), new RegExp(/\w\s{2,}\+/), new RegExp(/\w\s{2,}\-/), new RegExp(/\w\s{2,}\*/), new RegExp(/\w\s{2,}\//), new RegExp(/\w\s{2,}%/), new RegExp(/\w\s{2,}!/), new RegExp(/\w\s{2,}=/), new RegExp(/\w\s{2,}>/), new RegExp(/\w\s{2,}</), new RegExp(/\w\s{2,}\w/)]

/**
  * 
  * @param {vscode.TextDocument} document 
  * @param {vscode.FormattingOptions} options 
  * @param {vscode.CancellationToken} token 
  * @returns {vscode.ProviderResult<vscode.TextEdit[]>}
  */
const provideDocumentFormattingEdits = (document, options, token) => {
  let edits = []
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
        // ()  (!  ("  ('  (-  ((  (. (w !( !w )) )] ), [( [w ]) ], ') ', ") ", .) ., .w != !w >= <= == -w w( w) w[ w] w, w.

        // itemTool.findRanges(textLine, new RegExp(/\(\s+\)|\(\s+!|\(\s+"|\(\s+'|\(\s+\-|\(\s+\(|\(\s+\.|\(\s+\w|!\s+\(|!\s+\w|\)\s+\)|\)\s+,|\)\s+\]|\[\s+\(|(\[\s+\w)|\]\s+\)|\]\s+,|'\s+\)|'\s+,|"\s+\)|"\s+,|\.\s+\)|\.\s+\w|\.\s+,|!\s+=|!\s+\w|>\s+=|<\s+=|=\s+=|(?<=(\+|\-|\*|\/|%|>|<|=|,|\(|\[)\s*)\-\s+\w|\w\s+\(|\w\s+\)|\w\s+\[|\w(?<!if)\s+\]|\w\s+,|\w\s+\./)).forEach(s => {
        //   edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, "")))
        // })

        deleteSpaceeRegExp.forEach(reg => {
          itemTool.findRanges(textLine, reg).forEach(s => {
            edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, "")))
          })
        })

        // +. +- +" +' +( +w -. -- -' -( -w *. *- *' *( *w /- /. /' /( /* %- %. %' %( %w =. =- =' =" =( =! =w >- >. >( >' >w <- <. <( <' <w '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= )w ]+ ]- ]* ]/ ]% ]> ]< ]! ]= ]w .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,! ,w w+ w- w* w/ w% w! w= w> w<

        // itemTool.findRanges(textLine, new RegExp(/\+\.|\+\-|\+"|\+'|\+\(|\+\w|\-\.|\-\-|\-'|\-\(|(?<=(\w|\.|\)|\]|')\s*)\-\w|\*\.|\*\-|\*'|\*\(|\*\w|\/\.|\/\-|\/'|\/\(|\/\w|%\.|%\-|%'|%\(|%\w|=\.|=\-|='|="|=\(|=!|=\w|>\-|>\.|>\(|>'|>\w|<\-|<\.|<\(|<'|<\w|'\+|'\-|'\*|'\/|'%|'=|'>|'<|'!|"\+|"=|"!|\)\+|\)\-|\)\*|\)\/|\)%|\)>|\)<|\)!|\)=|\)\w|]\+|]\-|]\*|]\/|]%|]>|]<|]!|]=|]\w|\.\+|\.\-|\.\*|\.\/|\.%|\.>|\.<|\.!|\.=|,\-|,\.|,'|,"|,\(|,!|,\w|\w\+|\w\-|\w\*|\w\/|\w%|\w!|\w=|\w>|\w</)).forEach(s => {
        //   edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.start.character + 1), " "))
        // })

        insertSpaceRegExp.forEach(reg => {
          itemTool.findRanges(textLine, reg).forEach(s => {
            edits.push(vscode.TextEdit.insert(new vscode.Position(textLine.lineNumber, s.start.character + 1), " "))
          })
        })

        // +. +- +" +' +( +w -. -- -' -( -w *. *- *' *( *w /- /. /' /( /w %- %. %' %( %w =. =- =' =" =( =! =w >- >. >( >' >w <- <. <( <' '+ '- '* '/ '% '= '> '< '! "+ "= "! )+ )- )* )/ )% )> )< )! )= )w ]+ ]- ]* ]/ ]% ]> ]< ]! ]= ]w .+ .- .* ./ .% .> .< .= .! ,- ,. ,' ," ,( ,! ,w w+ w- w* w/ w% w! w= w> w< ww
        toSignSpaceRegExp.forEach(reg => {
          itemTool.findRanges(textLine, reg).forEach(s => {
            edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
          })
        })
        // itemTool.findRanges(textLine, new RegExp(/\+\s{2,}\.|\+\s{2,}\-|\+\s{2,}"|\+\s{2,}'|\+\s{2,}\(|\+\s{2,}\w|\-\s{2,}\.|\-\s{2,}\-|\-\s{2,}'|\-\s{2,}\(|\*\s{2,}\.|\*\s{2,}\-|(?<=(\w|\.|\)|\]|')\s*)\-\s{2,}\w|\*\s{2,}'|\*\s{2,}\(|\*\s{2,}\w|\/\s{2,}\.|\/\s{2,}\-|\/\s{2,}'|\/\s{2,}\(|\/\s{2,}\w|%\s{2,}\.|%\s{2,}\-|%\s{2,}'|%\s{2,}\(|%\s{2,}\w|=\s{2,}\.|=\s{2,}\-|=\s{2,}'|=\s{2,}"|=\s{2,}\(|=\s{2,}!|=\s{2,}\w|>\s{2,}\-|>\s{2,}\.|>\s{2,}\(|>\s{2,}'|>\s{2,}\w|<\s{2,}\-|<\s{2,}\.|<\s{2,}\(|<\s{2,}'|<\s{2,}\w|'\s{2,}\+|'\s{2,}\-|'\s{2,}\*|'\s{2,}\/|'\s{2,}%|'\s{2,}=|'\s{2,}>|'\s{2,}<|'\s{2,}!|"\s{2,}\+|"\s{2,}=|"\s{2,}!|\)\s{2,}\+|\)\s{2,}\-|\)\s{2,}\*|\)\s{2,}\/|\)\s{2,}%|\)\s{2,}>|\)\s{2,}<|\)\s{2,}!|\)\s{2,}=|\)\s{2,}\w|]\s{2,}\+|]\s{2,}\-|]\s{2,}\*|]\s{2,}\/|]\s{2,}%|]\s{2,}>|]\s{2,}<|]\s{2,}!|]\s{2,}=|]\s{2,}\w|\.\s{2,}\+|\.\s{2,}\-|\.\s{2,}\*|\.\s{2,}\/|\.\s{2,}%|\.\s{2,}>|\.\s{2,}<|\.\s{2,}!|\.\s{2,}=|,\s{2,}\-|,\s{2,}\.|,\s{2,}'|,\s{2,}"|,\s{2,}\(|,\s{2,}!|,\s{2,}\w|\w\s{2,}\+|\w\s{2,}\-|\w\s{2,}\*|\w\s{2,}\/|\w\s{2,}%|\w\s{2,}!|\w\s{2,}=|\w\s{2,}>|\w\s{2,}<|\w\s{2,}\w/)).forEach(s => {
        //   edits.push(vscode.TextEdit.replace(s, document.getText(s).replace(/\s+/, " ")))
        // })
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
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart((ident - 1) * tabSize, "\t")))
    } else if ("endif" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endif".length))) {
      ident -= 1
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident * tabSize, "\t")))
    } else if ("loop" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "loop".length))) {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident * tabSize, "\t")))
      ident += 1
    } else if ("endloop" == document.getText(new vscode.Range(textLine.lineNumber, fci, textLine.lineNumber, fci + "endloop".length))) {
      ident -= 1
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident * tabSize, "\t")))
    } else {
      edits.push(vscode.TextEdit.replace(new vscode.Range(textLine.lineNumber, 0, textLine.lineNumber, fci), "".padStart(ident * tabSize, "\t")))
    }

    // 2019年8月29日，添加内容格式化

  }
  return edits
}
module.exports = { provideDocumentFormattingEdits }