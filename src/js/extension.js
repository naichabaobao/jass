const vscode = require('vscode');

// const type = require("./type")
const colorProvider = require("./color-provider")
const codeItemProvider = require("./code-item-provider")
const triggreCharacters = require("./triggre-characters")
const documentForrmatProvider = require("./document-forrmat-provider")
require("./keyword-item-provider");
require("./type-item-provider");
require("./default-item-provider");
require("./provider/lib-complation-provider")
require("./hover-provider");


require("./definition-provider");
require("./provider/diagnostic-provider");

/**
 * 语言名称
 */
const language = "jass"

/**
 * 
 * @param {vscode.ExtensionContext} context 
 */
function activate(context) {

  vscode.languages.registerCompletionItemProvider(language, codeItemProvider, ...triggreCharacters.c);
  vscode.languages.registerColorProvider(language, colorProvider);
  vscode.languages.registerDocumentFormattingEditProvider(language, documentForrmatProvider);

}

exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
