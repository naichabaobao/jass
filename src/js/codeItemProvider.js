/**
 * 代号提供
 */
const vscode = require("vscode")
const itemTool = require("./itemTool")
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
  let inCode = itemTool.cheakInCode(document, position)
  let items = []
  if (inCode == false) {
    return items
  }
  let codeObj = code.code
  for (let key in codeObj) {
    let cObj = codeObj[key]
    let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Unit)
    item.detail = cObj.name + "(" + cObj.code + ")"
    item.documentation = new vscode.MarkdownString(cObj.tip).appendMarkdown(cObj.type)
    items.push(item)
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