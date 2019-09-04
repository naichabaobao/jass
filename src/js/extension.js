const vscode = require('vscode');

const type = require("./type")
const colorProvider = require("./colorProvider")
const codeItemProvider = require("./codeItemProvider")
const triggreCharacters = require("./triggreCharacters")
const functionItemProvider = require("./functionItemProvider")
const hoverProvider = require("./hoverProvider")
const documentForrmatProvider = require("./documentForrmatProvider")

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
  vscode.workspace.onDidSaveTextDocument(textDocment => {
    // 暂时不提供
    // var documentContent = textDocment.getText()
    // documentContent.match(/a/g)
    // var diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 6)), "哈哈哈", vscode.DiagnosticSeverity.Error)
    // diagnosticCollection.set(textDocment.uri, [diagnostic])
  })

  const panel = vscode.window.createWebviewPanel(
    'catCoding',
    'Cat Coding',
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );
  vscode.ViewColumn
  // 设置HTML内容
  let template = vscode.Uri.file(path.join(context.extensionPath, 'src/resources/template', 'index.html'));
  let html = template.with({ scheme: 'file' });

  panel.webview.html = fs.readFileSync(html.fsPath).toString()
}

exports.activate = activate;
function deactivate() { }
module.exports = {
  activate,
  deactivate
}
