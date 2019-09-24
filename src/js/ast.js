/**
 * 語法樹
 */
const vscode = require("vscode");
const characters = require("./triggre-characters");

const NodeType = {
  Comment,
  Macro, // 宏
  Type,
  Globals,
  Function, // 包含native方法
}

var jass = {
  document: "",
  setDocument(value) {
    this.document = value;
  },

  /**
   * jass文檔節點抽象表示
   */
  nodes: []

}


console.log(jass)
console.log(Object.defineProperty)

/*
Object.defineProperty(jass, "document", {
  set(value) {
    // 比對
    console.log(jass)
    console.log(value)
    jass.document = value;
  }
})
*/
jass.document = "666"

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {

  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, characters.l, characters.u)

