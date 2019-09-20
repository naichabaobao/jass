/**
 * 代号提供
 */
const vscode = require("vscode")
const itemTool = require("./item-tool")
const code = require("./code")

/**
 * 
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @param {vscode.CancellationToken} token 
 * @param {vscode.CompletionContext} context 
 * @returns {vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>}
 */
const provideCompletionItems = (document, position, token, context) => {
  let incode = itemTool.cheakInCode(document, position)
  let items = []
  if (incode) {
    if (itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position)) {
      return items
    }
    let codeObj = code.code
    for (let key in codeObj) {
      let cObj = codeObj[key]
      let item = new vscode.CompletionItem(key, (() => {
        switch (cObj.kind) {
          case code.Kind.Unit:
            return vscode.CompletionItemKind.Unit
          case code.Kind.Ability:
            return vscode.CompletionItemKind.Event
          case code.Kind.Item:
            return vscode.CompletionItemKind.Property
        }
      })())
      item.detail = cObj.name + "(" + key + ")"
      item.documentation = `${code.kindToString(cObj.kind)} -> ${code.raceToString(cObj.race)} -> ${code.typeToString(cObj.type)}\n${cObj.tip}`
      items.push(item)
    }
  } else {
    return items
  }
  return items
}

/**
 * 
 * @param {vscode.CompletionItem} item 
 * @param {vscode.CancellationToken} token 
 * @returns {vscode.ProviderResult<vscode.CompletionItem>}
 */
const resolveCompletionItem = (item, token) => {
  return item
}

const codeItemProvider = {
  provideCompletionItems, resolveCompletionItem
}

module.exports = codeItemProvider