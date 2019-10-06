/**
 * 方法提供
 */
const vscode = require("vscode")
const itemTool = require("./item-tool")

const { parseGlobals } = require("./jass");
const { functions, globals } = require("./jass/default");
const Desc = require("./jass/desc");
const DescGlobals = require("./jass/desc-globals");
const triggreCharacters = require("./triggre-characters");
const { StatementType, ParamenterType } = require("./support-type")

let defaultItems = [];
// 初始
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
globals.forEach(s => {
  s.globals.forEach(gs => {
    gs.forEach(g => {
      const type = g.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
      let item = new vscode.CompletionItem(`${g.name}->${g.type}${g.isArray ? "[]" : ""}`, type);
      item.detail = `${g.name} (${s.fileName})`;
      item.documentation = new vscode.MarkdownString(DescGlobals && DescGlobals[s.fileName] && DescGlobals[s.fileName][g.name] ? DescGlobals[s.fileName][g.name] : "").appendCodeblock(g.original);
      item.insertText = g.name;
      item.filterText = g.name;
      defaultItems.push(item);
    });
  });
});

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

    items.push(...defaultItems);

    // 当前文件全局变量
    let glos = parseGlobals(document.getText())
    glos.forEach(global => {
      global.forEach(v => {
        const type = v.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable;
        let item = new vscode.CompletionItem(`${v.name}->${v.type}${v.isArray ? "[]" : ""}`, type);
        item.detail = `${v.name} (${document.fileName})`
        item.insertText = v.name;
        item.filterText = v.name;
        items.push(item);
      });
    });

    // 当前文件局部变量
    if (!document.lineAt(position.line).text.trimLeft().startsWith("function")) { // 保证当前行不为function
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
    }

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


