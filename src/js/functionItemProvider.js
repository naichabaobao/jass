/**
 * 方法提供
 */
const vscode = require("vscode")
const j = require("./j")
const jg = require("./jg")
const type = require("./type")
const keyword = require("./keyword")
const itemTool = require("./itemTool")

/**
 * @description 是否可以提示
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @returns {boolean}
 */
const cantHint = (document, position) => {
  // conment string code type後
  let show = itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position) || itemTool.cheakInCode(document, position) || (function () {
    // 是否在類型後面
    let types = Object.keys(type)
    types.map(t => {
      return new RegExp(`(?<=${t}\s+)`)
    })
    return false
  })()
  return
}


/**
 * 
 * tips 0.0.3 当前能避免在字符串 注释 代号中弹出提示
 * @param {vscode.TextDocument} document 
 * @param {vscode.Position} position 
 * @param {vscode.CancellationToken} token 
 * @param {vscode.CompletionContext} context 
 * @returns {vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList>}
 */
const provideCompletionItems = (document, position, token, context) => {
  /**
   * 字符串 注释 代号 set后 type后 function定义后 takes后 returns后 constant后 array后 native
   */



  let items = []
  if (itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position) ||
    itemTool.cheakInCode(document, position)) {
    return items
  }


  // 添加关键字
  for (const key in keyword) {
    let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword)
    item.detail = key
    item.documentation = new vscode.MarkdownString(keyword[key])
    items.push(item)
  }
  // 添加内置类
  for (const key in type) {
    let item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Class)
    item.detail = key
    item.documentation = new vscode.MarkdownString(type[key])
    items.push(item)
  }
  if (document.fileName.endsWith(".j")) {
    // 添加方法 全局
    items = Object.keys(j).filter(x => j[x].fileName.endsWith(".j")).map(x => {
      let api = j[x]
      let item = new vscode.CompletionItem(api.name, vscode.CompletionItemKind.Function)
      item.detail = api.name + "(" + api.fileName + ")"
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(api.documentation)
        .appendCodeblock(api.original)
      item.insertText = api.insertText
      return item
    }).concat(Object.keys(jg).filter(x => jg[x].fileName.endsWith(".j")).map(x => {
      let api = jg[x]
      let item = new vscode.CompletionItem(api.name,
        api.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable)
      item.detail = api.name + "(" + api.fileName + ")"
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(api.documentation)
        .appendCodeblock(api.original)
      item.insertText = api.name
      return item
    }))
  } else if (document.fileName.endsWith(".ai")) {
    items = Object.keys(j).filter(x => j[x].fileName == "common.j" || j[x].fileName == "common.ai").map(x => {
      let api = j[x]
      let item = new vscode.CompletionItem(api.name, vscode.CompletionItemKind.Function)
      item.detail = api.name + "(" + api.fileName + ")"
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(api.documentation)
        .appendCodeblock(api.original)
      item.insertText = api.insertText
      return item
    }).concat(Object.keys(jg).filter(x => jg[x].fileName == "common.j" || jg[x].fileName == "common.ai").map(x => {
      let api = jg[x]
      let item = new vscode.CompletionItem(api.name,
        api.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable)
      item.detail = api.name + "(" + api.fileName + ")"
      item.documentation = new vscode.MarkdownString()
        .appendCodeblock(api.documentation)
        .appendCodeblock(api.original)
      item.insertText = api.name
      return item
    }))
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

module.exports = {
  provideCompletionItems, resolveCompletionItem
}
