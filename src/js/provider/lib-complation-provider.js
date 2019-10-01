/*
 * 讀取當前文檔目錄下所有.j,.ai文件
 */

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { parseFunctions } = require("../jass");
const triggreCharacters = require("../triggre-characters");

let currentFile = null;
let functions = [];

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    if (document.uri.fsPath != currentFile) {
      let stet = path.parse(document.uri.fsPath);
      let files = fs.readdirSync(stet.dir).filter(f => path.parse(f).ext == ".j" || path.parse(f).ext == ".ai");

      let tempFuncs = [];
      files.forEach(f => {
        let content = fs.readFileSync(path.join(stet.dir, f)).toString("utf8");
        let funcs = parseFunctions(content);
        tempFuncs.push(...funcs.map(x => {
          let item = new vscode.CompletionItem(`${x.name}(${x.parameters.map(s => s.type).join(",")})->${x.returnType ? + x.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
          item.detail = `${x.name} (${f})`;
          item.documentation = new vscode.MarkdownString("").appendCodeblock(x.original);
          item.insertText = `${x.name}(${x.parameters.map(s => s.name).join(", ")})`;
          return item;
        }));
      });
      functions = tempFuncs;
      currentFile = document.uri.fsPath;
    }
    return functions;
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l, ...triggreCharacters.u);



