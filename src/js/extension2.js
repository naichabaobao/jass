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

const documentFormattingEditProvider = {
  provideDocumentFormattingEdits(document, options, token) {
    let documentContent = document.getText()
    let edits = []
    let edit = vscode.TextEdit

    let chars = documentContent.split("")
    let line = 0
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
          let range = new vscode.Range(line, colume - 1 - space.length, line, colume - 1)
          edits.push(edit.delete(range))
        }
        let postSpace = ""
        for (let index = 0; index < nstr.length; index++) {
          if (/\t /.test(nstr.charAt(index))) {
            postSpace += nstr.charAt(index)
          } else {
            break;
          }
        }
        console.log(postSpace)
        console.log(postSpace.length)
        let range = new vscode.Range(line, colume, line, colume + postSpace.length)
        edits.push(edit.replace(range, " "))
      }



      if (/\t /.test(x)) {
        space += x
      } else {
        space = ""
      }
      colume++
    }
    console.log(edits)
    return edits
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
