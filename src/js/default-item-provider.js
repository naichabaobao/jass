/**
 * 方法提供
 */
const vscode = require("vscode")
// const j = require("./j")
// const jg = require("./jg")
// const type = require("./type")
// const keyword = require("./keyword")
const itemTool = require("./item-tool")

// const j2 = require("./j2");

const { parseGlobals } = require("./jass");
const { functions, globals } = require("./jass/default");
const Desc = require("./jass/desc");
const DescGlobals = require("./jass/desc-globals");
const triggreCharacters = require("./triggre-characters");

vscode.languages.registerCompletionItemProvider("jass", {
  provideCompletionItems(document, position, token, context) {
    /**
     * 字符串 注释 代号 set后 type后 function定义后 takes后 returns后 constant后 array后 native
     */

    let items = []
    if (itemTool.cheakInComment(document, position) || itemTool.cheakInString(document, position) ||
      itemTool.cheakInCode(document, position)) {
      return items
    }

    // 初始
    try {
      functions.forEach(s => {
        s.functions.forEach(x => {
          let item = new vscode.CompletionItem(`${x.name}(${x.parameters.map(p => p.type).join(",")})->${x.returnType ? x.returnType : "nothing"}`, vscode.CompletionItemKind.Function);
          item.detail = `${x.name} (${s.fileName})`;
          item.documentation = new vscode.MarkdownString(Desc && Desc[s.fileName] && Desc[s.fileName][x.name] ? Desc[s.fileName][x.name] : "").appendCodeblock(x.original);
          item.insertText = `${x.name}(${x.parameters.map(p => p.name).join(", ")})`;
          items.push(item);
        });
      });
      globals.forEach(s => {
        s.globals.forEach(gs => {
          gs.forEach(g => {
            const type = g.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
            let item = new vscode.CompletionItem(`${g.name}->${g.type}${g.isArray ? "[]" : ""}`, type);
            item.detail = `${g.name} (${s.fileName})`;
            item.documentation = new vscode.MarkdownString(DescGlobals && DescGlobals[s.fileName] && DescGlobals[s.fileName][g.name] ? DescGlobals[s.fileName][g.name] : "").appendCodeblock(g.original);
            item.insertText = g.name;
            items.push(item);
          });
        });
      });
    } catch (err) { console.log(err) }
    // 當前文件 和 import
    /*
    try {
      let funcs = parseFunctions(document.getText());
      funcs.forEach(func => {
        let item = new vscode.CompletionItem(`${func.name}(${func.parameters.map(p => p.type).join(",")})${func.returnType ? "->" + func.returnType : "nothing"}`, vscode.CompletionItemKind.Function)
        item.detail = `${func.name} (${document.fileName})`
        item.insertText = `${func.name}(${func.parameters.length > 0 ? func.parameters.map(s => s.name).join(", ") : ""})`
        items.push(item);
      });

      let globals = parseGlobals(document.getText())
      globals.forEach(global => {
        global.forEach(v => {
          const type = v.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
          let item = new vscode.CompletionItem(`${v.name}->${v.type}${v.isArray ? "[]" : ""}`, type);
          item.detail = `${v.name} (${document.fileName})`
          item.insertText = v.name;
          items.push(item);
        });
      });

      parseImport(document).forEach(v => {
        let funcs = parseFunctions(v.content);
        funcs.forEach(func => {
          let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function)
          item.detail = `${func.name} (${v.path})`;
          item.insertText = `${func.name}(${func.parameters.length > 0 ? func.parameters.map(s => s.name).join(", ") : ""})`;
          items.push(item);
        })
      });
    } catch (err) { console.log(err) }
*/

    // 当前文件全局变量
    let glos = parseGlobals(document.getText())
    glos.forEach(global => {
      global.forEach(v => {
        const type = v.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
        let item = new vscode.CompletionItem(`${v.name}->${v.type}${v.isArray ? "[]" : ""}`, type);
        item.detail = `${v.name} (${document.fileName})`
        item.insertText = v.name;
        items.push(item);
      });
    });

    // 删除
    /*
    parseImport(document).forEach(v => {
      let funcs = parseFunctions(v.content);
      funcs.forEach(func => {
        let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function)
        item.detail = `${func.name} (${v.path})`;
        item.insertText = `${func.name}(${func.parameters.length > 0 ? func.parameters.map(s => s.name).join(", ") : ""})`;
        items.push(item);
      })
    });
    */
    return items
  },
  resolveCompletionItem(item, token) {
    return item
  }
}, ...triggreCharacters.w);


