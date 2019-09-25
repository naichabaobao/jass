
const vscode = require("vscode");
const { StatementType } = require("./support-type");
const { parseImport } = require("./jass")
const { findFunctions } = require("./item-tool")

vscode.languages.registerDefinitionProvider("jass", {
  provideDefinition(document, position, cancel) {
    let key = document.getText(document.getWordRangeAtPosition(position))
    console.log(key)
    // local -> functions -> globals -> import
    let defiines = [];
    let start = 0; // 方法開始行
    for (let i = 0; i < document.lineCount; i++) {
      let text = document.lineAt(i).text
      if ((/^\s*function/.test(text) || /^\s*constant/.test(text) || /^\s*native/.test(text) || new RegExp(`^\\s*${StatementType.join("|")}`).test(text)) && text.includes(key)) {
        defiines.push(new vscode.Location(document.uri, new vscode.Position(i, text.indexOf(key))));
      }
    }

    findFunctions(document).forEach(r => {
      if (r.contains(position)) {
        for (let o = r.start.line; o < r.end.line; o++) {
          let lineText = document.lineAt(o).text;
          if (/^\s*local/.test(lineText) && lineText.includes(key)) {
            defiines.push(new vscode.Location(document.uri, new vscode.Position(o, lineText.indexOf(key))));
          }
        }
      }
    });

    let imports = parseImport(document);
    imports.forEach(s => {
      let lines = s.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(line)
        if ((/^\s*function/.test(line) || /^\s*constant/.test(line) || /^\s*native/.test(line) || new RegExp(`^\\s*${StatementType.join("|")}`).test(line)) && line.includes(key)) {
          defiines.push(new vscode.Location(vscode.Uri.file(s.path), new vscode.Position(i, line.indexOf(key))));
        }
      }
    });
    return defiines;
  }
})

