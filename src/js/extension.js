const vscode = require('vscode');

const type = require("./type")
const colorProvider = require("./color-provider")
const codeItemProvider = require("./code-item-provider")
const triggreCharacters = require("./triggre-characters")
const functionItemProvider = require("./function-item-provider")
const hoverProvider = require("./hover-provider")
const documentForrmatProvider = require("./document-forrmat-provider")

// require("./base");

require("./definition-provider");
require("./import-path-completion-provider");

/**
 * 语言名称
 */
const language = "jass"

/**
 * 错误集合
 */
var diagnosticCollection = null

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
}

exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
