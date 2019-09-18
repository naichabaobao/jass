const vscode = require("vscode");

// "(\\"|.)*?"|//.+
/**
 * 
 */
var map = new Map();

vscode.workspace.onDidChangeTextDocument(event => {
  let document = event.document;

  for (let i = 0; i < document.lineCount; i++) {
    let textLine = document.lineAt(i);

  }



})