/**
 * 方法提供
 */
const vscode = require("vscode")
const j = require("./j")
const jg = require("./jg")
const type = require("./type")
const keyword = require("./keyword")

/**
 * 
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @param {vscode.CancellationToken} token 
 * @param {vscode.CompletionContext} context 
 * @returns {vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>}
 */
const provideCompletionItems = (document, position, token, context) => {
  // 调用场景 call 右值 参数
  let text = document.lineAt(position.line).text
  let wordRange = document.getWordRangeAtPosition(position, new RegExp(/call\s+\w+/))
  console.log(wordRange)
  console.log(document.getText(wordRange))

  let items = []

  new vscode.CompletionItem("a", vscode.CompletionItemKind.Constant)
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

module.exports = {
  provideCompletionItems, resolveCompletionItem
}
