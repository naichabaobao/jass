const vscode = require('vscode');

const type = require("./type")
const colorProvider = require("./colorProvider")
const codeItemProvider = require("./codeItemProvider")
const triggreCharacters = require("./triggreCharacters")
const functionItemProvider = require("./functionItemProvider")
const hoverProvider = require("./hoverProvider")
const documentForrmatProvider = require("./documentForrmatProvider")
const w3mViewer = require("./w3m-viewer")

const fs = require("fs")
const path = require("path")

/**
 * 语言名称
 */
const language = "jass"
/**
 * 错误集合
 */
var diagnosticCollection = null

const didSaveTextDocumentHandle = function (document) { }

/**
 * 
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {
  vscode.languages.registerCompletionItemProvider(language, functionItemProvider, ...triggreCharacters.w);
  vscode.languages.registerCompletionItemProvider(language, codeItemProvider, ...triggreCharacters.c);
  vscode.languages.registerHoverProvider(language, hoverProvider);
  vscode.languages.registerColorProvider(language, colorProvider);
  vscode.languages.registerDocumentFormattingEditProvider(language, documentForrmatProvider);

  // 错误提示
  if (diagnosticCollection == null)
    diagnosticCollection = vscode.languages.createDiagnosticCollection(language);

  vscode.workspace.onDidChangeTextDocument

}

exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
