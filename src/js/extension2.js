const vscode = require('vscode');

var funcObj = require("./functions")
/**
 * 语言名称
 */
const language = "jass"

/**
 * 错误集合
 */
var diagnosticCollection = null

const triggreCharacters = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "_",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const completionProvider = {
  provideCompletionItems(document, position, token, context) {
    let items = []
    for (const key in funcObj) {
      let item = new vscode.CompletionItem(funcObj[key].name, vscode.CompletionItemKind.Function)
      item.detail = funcObj[key].name
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(funcObj[key].documentation)
        .appendCodeblock(funcObj[key].original)
      item.insertText = funcObj[key].insertText
      items.push(item)
    }
    return items
  },
  resolveCompletionItem(item, token) {
    return item
  }
}

const hoverProvider = {
  provideHover(document, position, token) {
    var keyword = document.getText(document.getWordRangeAtPosition(position))
    var tooltips = new vscode.MarkdownString()
    if (Object.keys(funcObj).includes(keyword)) {
      tooltips.appendCodeblock(funcObj[keyword].documentation)
      tooltips.appendCodeblock(funcObj[keyword].original)
    }
    return new vscode.Hover(tooltips)
  }
}

const colorProvider = {
  provideDocumentColors(document, token) {

  }/*ProviderResult<ColorInformation[]>*/,
  provideColorPresentations(color, context, token) {

  }/*ProviderResult<ColorPresentation[]>*/
}

const typeFormattingProvider = {
  provideOnTypeFormattingEdits(document, position, ch, options, token) {
    return [new vscode.TextEdit(new vscode.Range(new position(0, 0), new position(0, 20)), "一段中文咯")]
  }
}

const creatTextEdit = function (sCol, Spos, eCol, ePos, con) {
  return new vscode.TextEdit(new vscode.Range(new vscode.Position(sCol, Spos), new vscode.Position(eCol, ePos)), con)
}

/**
 * 获取字符最后的空白
 * @param {string} string 
 */
const getEndSpaces = (string) => {
  let str = ""
  for (let i = string.length; i > 0; i--) {
    let code = string.charAt(i - 1)
    if (/\s/.test(code)) {
      str += code
    } else {
      break;
    }
  }
  return str
}

const documentFormattingEditProvider = {
  provideDocumentFormattingEdits(document, options, token) {
    let documentContent = document.getText()
    let edits = []

    const editor = vscode.TextEdit;

    let chars = documentContent.split("")
    let line = 1
    let colume = 0
    let commiting = false
    let stringing = false
    let space = ""
    for (let i = 0; i < chars.length; i++) {
      let x = chars[i]
      let pstr = documentContent.substring(0, i)
      let nstr = documentContent.substring(i + 1, documentContent.length)
      if (stringing == false && x == "/" && pstr.endsWith("/")) {
        commiting = true
      }
      if (x == "\n") {
        commiting = false
        stringing = false
        line++
        colume = 0
      }
      if (commiting) {
        colume++
        continue;
      }
      if (stringing == false && x == "\"") {
        stringing = true
      } else if (stringing && x == "\"" && !pstr.endsWith("\\")) {
        stringing = false
      }
      if (stringing) {
        colume++
        continue;
      }

      if (/,/.test(x)) {
        if (space.length > 0) {
          let endstr = getEndSpaces(pstr)
          console.log("s=======================================")
          console.error(space.length)
          console.log(line)
          console.log(colume - space.length)
          console.log(colume)
          console.log("e=======================================")
          let range = new vscode.Range(new vscode.Position(line, 1), new vscode.Position(line, 2))
          edits.push(new vscode.TextEdit(range, ""))
        }
      }



      if (/ /.test(x)) {
        space += x
      } else {
        space = ""
      }
      colume++
    }
    return edits
    /*---------------------------------
    let lines = new RegExp(/.+/g).exec(documentContent)
    for (let index = 0; index < lines.length; index++) {
      let element = lines[index]
      let colume = index + 1
      let commiting = false
      let stringing = false
      let chars = element.split("")
      for (let i = 0; i < chars.length; i++) {
        let x = chars[i]
        let str = element.substring(0, i)
        let next = element.substring(i + 1, element.length)
        console.log(str)
        console.log(x)
        console.log(next)
        if (stringing == false && x == "/" && str.endsWith("/")) {
          commiting = true
        }
        if (commiting) {
          str += x
          continue;
        }
        if (stringing == false && x == "\"") {
          stringing = true
        } else if (stringing && x == "\"" && !str.endsWith("\\")) {
          stringing = false
        }
        if (stringing) {
          str += x
          continue;
        }

      }
    }
    ---------------------------------*/



    // docmentLines.forEach(lineContent => {
    //   isComment = false
    //   isString = false
    //   isCode = false // 魔兽代为代号 'a00p'
    //   isSpace = false

    //   if (lineContent.trim() == "") {
    //     // edits.push(vscode.TextEdit.delete(new vscode.Range(new vscode.Position(colume, position), new vscode.Position(colume, lineContent.length))))
    //   } else {
    //     if (new RegExp(/".*"/, "g").test(lineContent) || new RegExp(/\/\/.*/, "g").test(lineContent)) {

    //     } else {
    //       let res = lineContent
    //         .replace(/\s*function\s+/, "function ")
    //         .replace(/\(\s+\(/, "((")
    //         .replace(/\s*\+\s*/, " + ")
    //         .replace(/\s*-\s*/, " - ")
    //         .replace(/\s*\*\s*/, " * ")
    //         .replace(/\s*\/\s*/, " / ")
    //         .replace(/\s*(?!<==|<|!|>)=(?!==|<|!|>)\s*/, " = ")
    //         .replace(/\s*==\s*/, " == ")
    //         .replace(/\s*!=\s*/, " != ")
    //         .replace(/\s*!\s*(?!==)/, " !")
    //         .replace(/\s*<=\s*/, " <= ")
    //         .replace(/\s*>=\s*/, " >= ")
    //       let range = new vscode.Range(new vscode.Position(colume, position), new vscode.Position(colume, lineContent.length))
    //       let edit = vscode.TextEdit.replace(range, res)
    //       console.log(/\n/.test(res))
    //       edits.push(edit)
    //     }
    //   }
    //   colume++;
    // })
    // return edits

    /*
        let contents = documentContent.match(/\w+|\\"|[\+\-\*%=!\(\)\[\]",<>]{1}|-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)|-?[1-9]\d*|'[a-zA-Z]{4}'|\/\/|\n|\s+|.+/g).map(x => x)
        new Array().
          for(let i = 0; i < contents.length; i++) {
          let element = contents[i]
          if (isComment && !element.test(/\n/)) {
            continue;
          } else if (isString && !element.test(/"/)) {
            continue;
          } else {
            if (i == 0) {
    
            } else if (i > 0) {
              if (element.test(/takes/) && contents[i - 1].test(/[\t ]{2,}/)) {
                edits.push(creatTextEdit(colume, position - contents[i - 1].length, colume, position, " "))
              } else if (element.test(/returns/) && contents[i - 1].test(/[\t ]{2,}/)) {
                if (contents[i - 1].test(/[\t ]+/)) {
                  edits.push(creatTextEdit(colume, position - contents[i - 1].length, colume, position, " "))
                }
              } else if (element.test(/endfunction/)) {
                if (contents[i - 1].test(/[\t ]+/)) {
                  edits.push(creatTextEdit(colume, position - contents[i - 1].length, colume, position, ""))
                } else if (contents[i - 1].test(/[^\n]/)) {
                  edits.push(creatTextEdit(colume, position, colume, position, ""))
                }
              }
            }
          }
        }
        return [new vscode.TextEdit(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1)), "")]
        */
  }
}

function activate(context) {
  vscode.window.showInformationMessage('好烦啊!');

  vscode.languages.registerCompletionItemProvider(language, completionProvider, ...triggreCharacters)

  vscode.languages.registerHoverProvider(language, hoverProvider);

  // vscode.languages.registerColorProvider(language,colorProvider)

  vscode.languages.registerOnTypeFormattingEditProvider(language, typeFormattingProvider, "", ...[","])

  vscode.languages.registerDocumentFormattingEditProvider(language, documentFormattingEditProvider)

  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    console.log(textDocment.getText())
    var documentContent = textDocment.getText()
    documentContent.match(/a/g)
    var diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 6)), "哈哈哈", vscode.DiagnosticSeverity.Error)
    diagnosticCollection.set(textDocment.uri, [diagnostic])
  })

  context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
    vscode.window.showInformationMessage('Hello jass!');
  }));



}
exports.activate = activate;

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
