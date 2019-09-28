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

const { parseFunctions, parseGlobals, parseImport } = require("./jass");
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
        // {
        //     original: string;
        //     name: string;
        //     parameters: {
        //         name: string;
        //         type: string;
        //     }[];
        //     returnType: string;
        // }
        s.functions.forEach(x => {
          let item = new vscode.CompletionItem(x.name, vscode.CompletionItemKind.Function);
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
            let item = new vscode.CompletionItem(g.name, type);
            item.detail = `${g.name} (${s.fileName})`;
            item.documentation = new vscode.MarkdownString(DescGlobals && DescGlobals[s.fileName] && DescGlobals[s.fileName][g.name] ? DescGlobals[s.fileName][g.name] : "").appendCodeblock(g.original);
            items.push(item);
          });
        });
      });
    } catch (err) { console.log(err) }
    // 當前文件 和 import
    try {
      let funcs = parseFunctions(document.getText());
      funcs.forEach(func => {
        let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function)
        item.detail = `${func.name} (${document.fileName})`
        item.insertText = `${func.name}(${func.parameters.length > 0 ? func.parameters.map(s => s.name).join(", ") : ""})`
        items.push(item);
      })

      let globals = parseGlobals(document.getText())
      globals.forEach(global => {
        global.forEach(v => {
          const type = v.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
          let item = new vscode.CompletionItem(v.name, type);
          item.detail = `${v.name} (${document.fileName})`
          items.push(item);
        })
      })

      parseImport(document).forEach(v => {
        let funcs = parseFunctions(v.content);
        funcs.forEach(func => {
          let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function)
          item.detail = `${func.name} (${v.path})`;
          item.insertText = `${func.name}(${func.parameters.length > 0 ? func.parameters.map(s => s.name).join(", ") : ""})`;
          items.push(item);
        })
      })
    } catch (err) { console.log(err) }

    // for (const key in j2) {
    //   if (j2.hasOwnProperty(key)) {
    //     const func = j2[key];
    //     let item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function)
    //     item.detail = `${func.name} (${func.fileName})`
    //     item.documentation = new vscode.MarkdownString().appendText(func.documentation).appendCodeblock(func.original)
    //     item.insertText = func.insertText
    //     items.push(item)
    //   }
    // }

    return items
  },
  resolveCompletionItem(item, token) {
    return item
  }
}, ...triggreCharacters.w);


