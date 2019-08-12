const vscode = require("vscode")

const keywordHovers = [
  {
    keyword: "boolean",
    type: vscode.CompletionItemKind.Keyword,
    original: "boolean",
    documentation: "實數類型",
  },
  {
    keyword: "integer",
    type: vscode.CompletionItemKind.Keyword,
    original: "integer",
    documentation: "整數類型",
  },
  {
    keyword: "real",
    type: vscode.CompletionItemKind.Keyword,
    original: "real",
    documentation: "實數類型",
  },
  {
    keyword: "string",
    type: vscode.CompletionItemKind.Keyword,
    original: "string",
    documentation: "字符串類型",
  },
  {
    keyword: "code",
    type: vscode.CompletionItemKind.Keyword,
    original: "code",
    documentation: `code類型,用於方法調用,作爲參數傳遞時需使用function修飾,如：
    \`\`\`jass (type)
    call ForGroupBJ(YDWEGetUnitsInRectMatchingNull(GetPlayableMapRect(),Condition(function Trig_debugFunc002001002)), function Trig_debugFunc002002)
    \`\`\``,
  },
  {
    keyword: "handle",
    type: vscode.CompletionItemKind.Keyword,
    original: "handle",
    documentation: "handle類型,所有派生類的基類"
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
  {
    keyword: "",
    type: vscode.CompletionItemKind.Keyword,
    original: "",
    documentation: ""
  },
]

module.exports = {
  keywordHovers
}