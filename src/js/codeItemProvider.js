/**
 * 代号提供
 */
const vscode = require("vscode")
const itemTool = require("./itemTool")

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
  if (inCode == false) {
    return []
  }
  let items = []
  let item = new vscode.CompletionItem("aaaa", vscode.CompletionItemKind.Unit)
  item.insertText = "'aaaa'"
  item.detail = "圣骑"
  item.documentation = "一个小矮人"
  items.push(item)
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