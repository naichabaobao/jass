/*
 * 讀取當前文檔目錄下所有.j,.ai文件
 */

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
// const { parseFunctions } = require("../jass");
const triggreCharacters = require("../triggre-characters");
const { StatementType, ParamenterType } = require("../support-type");
const itemTool = require("../item-tool")

const Desc = require("../jass/desc");
const DescGlobals = require("../jass/desc-globals");



/**
 * @param {string} funcString 
 */
const parseFunction = (funcString) => {
  let func = {
    name: null,
    parameters: [],
    returnType: null,
  };
  funcString.replace(new RegExp(`(function|(constant\\s+)?native)\\s+(?<name>[a-zA-Z]\\w*)`), (result, ...args) => {
    func.name = args.pop().name;
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

let functions = [];
let jassDir = path.resolve(__dirname, "../../resources/jass/");
fs.readdir(jassDir, "utf8", (err, fileNames) => {
  if (err) return;
  fileNames.filter(fileName => fileName.endsWith(".j") || fileName.endsWith(".ai")).forEach(fileName => {
    fs.readFile(path.join(jassDir, fileName), (err, data) => {
      if (err) return;
      const content = data.toString();
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const func = parseFunction(line);
        if (func) {
          let item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(p => p.type).join(",")})->${func.returnType ? func.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
          item.detail = `${func.name} (${fileName})`;
          item.documentation = new vscode.MarkdownString(Desc[fileName] && Desc[fileName][func.name] ? Desc[fileName][func.name] : "").appendCodeblock(`function ${func.name} takes ${func.parameters.length == 0 ? "nothing" : func.parameters.map(value => value.type + " " + value.name).join(", ")} returns ${func.returnType ? func.returnType : "nothing"}`);
          item.insertText = `${func.name}(${func.parameters.map(p => p.name).join(", ")})`;
          item.filterText = func.name;
          functions.push(item);
        }
      }
    });
  });
});

let globals = [];
const defaultFiles = ["common.j", "blizzard.j", "common.ai"]
defaultFiles.forEach(fileName => {
  fs.readFile(path.resolve(__dirname, `../../resources/jass/${fileName}`), (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const content = data.toString("utf-8");
      const lines = content.split("\n");
      let inGlobal = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const tlLine = line.trimLeft();
        if (line.startsWith("globals")) inGlobal = true;
        else if (line.startsWith("endglobals")) inGlobal = false;
        else if (inGlobal) {
          tlLine.replace(new RegExp(`(?:(?<isConstant>constant)\\s+)?(?<type>${StatementType.join("|")})\\s+(?:(?<isArray>array)\\s+)?(?<name>[a-zA-Z]\\w*)`), (...args) => {
            const groups = [...args];
            const group = groups.pop();
            const type = group.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
            let item = new vscode.CompletionItem(`${group.name}->${group.type}${group.isArray ? "[]" : ""}`, type);
            item.detail = `${group.name} (${fileName})`;
            item.documentation = new vscode.MarkdownString(DescGlobals && DescGlobals[fileName] && DescGlobals[fileName][group.name] ? DescGlobals[fileName][group.name] : "").appendCodeblock(groups.shift().replace(/\s+/g, " "));
            item.insertText = group.name;
            item.filterText = group.name;
            globals.push(item);
          });
        }
      }
    }
  });
});

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    if (itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position) ||
      itemTool.cheakInCode(document, position)) return [];
    return [...functions, ...globals];
  },
  resolveCompletionItem(item, token) {
    return item;
  }
}, ...triggreCharacters.l, ...triggreCharacters.u);



