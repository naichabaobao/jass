/*
 * 方法提供
  2019年10月7日 修改global塊識別
 */

const vscode = require("vscode")
const fs = require("fs");
const path = require("path");
const itemTool = require("./item-tool")

// const { parseGlobals } = require("./jass");
// const { functions, globals } = require("./jass/default");


const triggreCharacters = require("./triggre-characters");
const { StatementType, ParamenterType } = require("./support-type")

// let defaultItems = [];
// 初始

/** 
 * @deprecated
functions.forEach(s => {
  s.functions.forEach(x => {
    let item = new vscode.CompletionItem(`${x.name}(${x.parameters.map(p => p.type).join(",")})->${x.returnType ? x.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
    item.detail = `${x.name} (${s.fileName})`;
    item.documentation = new vscode.MarkdownString(Desc && Desc[s.fileName] && Desc[s.fileName][x.name] ? Desc[s.fileName][x.name] : "").appendCodeblock(x.original);
    item.insertText = `${x.name}(${x.parameters.map(p => p.name).join(", ")})`;
    item.filterText = x.name;
    defaultItems.push(item);
  });
});
*/
// 初始當前目錄下其他文件
let currentFile = null;
let syncItems = [];
/**
 * 
 * @param {string} funcString 
 */
const parseFunction = (funcString) => {
  let func = {
    name: null,
    parameters: [],
    returnType: null,
  };
  funcString.replace(new RegExp(`function\\s+([a-zA-Z]\\w*)`), (result, ...args) => {
    func.name = args.shift();
    return "";
  }).replace(new RegExp(`returns\\s+(${StatementType.join("|")})`), (...args) => {
    func.returnType = args[1];
    return "";
  }).replace(new RegExp(`takes\\s+((?:${ParamenterType.join("|")})\\s+[a-zA-Z]\\w*(?:\\s*\\,\\s*(?:${ParamenterType.join("|")})\\s+[a-zA-Z]\\w*)*)`), (...args) => {
    let params = args[1].split(new RegExp(/\s*,\s*/, "g"));
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      param.replace(new RegExp(`(?<type>${ParamenterType.join("|")})\\s+(?<name>[a-zA-Z]\\w*)`), (...as) => {
        const group = [...as].pop()
        func.parameters.push({
          type: group.type,
          name: group.name
        })
      });
    }
    return "";
  });
  return func.name ? func : null;
}

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    let items = []
    if (document.lineAt(position.line).text.trimLeft().startsWith("function")) return items;
    if (itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position) ||
      itemTool.cheakInCode(document, position)) {
      return items
    }

    // 同級目錄下所有function
    if (document.uri.fsPath != currentFile) {
      syncItems = [];
      let stet = path.parse(document.uri.fsPath);
      fs.readdir(stet.dir, "utf8", (err, fileNames) => {
        if (err) return;
        fileNames.filter(fileName => (path.parse(fileName).ext == ".j" || path.parse(fileName).ext == ".ai") && path.parse(fileName).name != stet.name).forEach(fileName => {
          fs.readFile(path.join(stet.dir, fileName), (error, data) => {
            if (error) return;
            const content = data.toString();
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const func = parseFunction(line);
              if (func) {
                let item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(p => p.type).join(",")})->${func.returnType ? func.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
                item.detail = `${func.name} (${fileName})`;
                item.documentation = new vscode.MarkdownString().appendCodeblock(`function ${func.name} takes ${func.parameters.length == 0 ? "nothing" : func.parameters.map(value => value.type + " " + value.name).join(", ")} returns ${func.returnType ? func.returnType : "nothing"}`);
                item.insertText = `${func.name}(${func.parameters.map(p => p.name).join(", ")})`;
                item.filterText = func.name;
                syncItems.push(item);
              }
            }
          });
        });
      });
      currentFile = document.uri.fsPath;
    }
    items.push(...syncItems);

    // 當前文件function
    for (let i = position.line; i >= 0; i--) {
      let func = parseFunction(document.lineAt(i).text);
      if (func) {
        let item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(p => p.type).join(",")})->${func.returnType ? func.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
        item.detail = `${func.name} ("当前文件")`;
        item.documentation = new vscode.MarkdownString().appendCodeblock(`function ${func.name} takes ${func.parameters.length == 0 ? "nothing" : func.parameters.map(value => value.type + " " + value.name).join(", ")} returns ${func.returnType ? func.returnType : "nothing"}`);
        item.insertText = `${func.name}(${func.parameters.map(p => p.name).join(", ")})`;
        item.filterText = func.name;
        items.push(item);
      }
    }

    // 當前文件globals
    let inGlobal = false;
    for (let i = 0; i < position.line; i++) {
      const TextLine = document.lineAt(i);
      if (!TextLine.isEmptyOrWhitespace) {
        const trimLeftText = TextLine.text.trimLeft();
        if (trimLeftText.startsWith("globals")) {
          inGlobal = true;
        } else if (trimLeftText.startsWith("endglobals")) {
          inGlobal = false;
        } else if (inGlobal) {
          trimLeftText.replace(new RegExp(`(?:(?<isConstant>constant)\\s+)?(?<type>${StatementType.join("|")})(?:\\s+(?<isArray>array))?\\s+(?<name>[a-zA-Z]\\w*)`), (...args) => {
            const groups = [...args];
            const value = groups.pop();
            const type = value.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
            let item = new vscode.CompletionItem(`${value.name}->${value.type}${value.isArray ? "[]" : ""}`, type);
            item.detail = `${value.name} (${document.fileName})`
            item.insertText = value.name;
            item.filterText = value.name;
            items.push(item);
          });
        }
      }
    }

    // 当前文件局部变量
    for (let i = position.line - 1; i >= 0; i--) { // 从当前行开始向前遍历 直到遇到第一个function或文件头
      const TextLine = document.lineAt(i);
      if (TextLine.isEmptyOrWhitespace) {
        continue;
      } else {
        let trimLeftText = TextLine.text.trimLeft();
        if (trimLeftText.startsWith("function")) {
          // 获取参数
          try {
            TextLine.text.replace(new RegExp(`(${ParamenterType.join("|")})\\s+([a-zA-Z]\\w*)`, "g"), (...args) => {
              let param = [...args];
              let item = new vscode.CompletionItem(`${param[2]}->${param[1]}`, vscode.CompletionItemKind.TypeParameter);
              item.detail = `${param[2]} (${document.fileName})`;
              item.documentation = new vscode.MarkdownString().appendCodeblock(param[0]);
              item.insertText = param[2];
              item.filterText = param[2];
              items.push(item);
            });
          } catch (err) {
            console.log(err)
          }
          break;
        } else if (trimLeftText.startsWith("endfunction")) {
          break;
        } else if (trimLeftText.startsWith("local")) {
          TextLine.text.replace(new RegExp(`local\\s+(?<type>${StatementType.join("|")})\\s+((?<arr>array)\\s+)?(?<name>[a-zA-Z]\\w*)`), (...args) => {
            let groups = [...args];
            let local = groups.pop();
            let item = new vscode.CompletionItem(`${local.name}->${local.type}${local.arr ? "[]" : ""}`, vscode.CompletionItemKind.Variable);
            item.detail = `${local.name} (${document.fileName})`;
            item.documentation = new vscode.MarkdownString().appendCodeblock(groups.shift());
            item.insertText = local.name;
            item.filterText = local.name;
            items.push(item);
          })
        }
      }
    }
    return items
  },
  resolveCompletionItem(item, token) {
    return item
  }
}, ...triggreCharacters.w);


