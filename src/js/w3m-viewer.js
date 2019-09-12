const vscode = require("vscode");
const path = require("path");
const fs = require("fs");



const fileType = "war3map";
/**
 * @param {vscode.ExtensionContext} context 
 * @param {vscode.TextDocument} document 
 */
const w3mView = (context, document) => {
  const panel = vscode.window.createWebviewPanel(fileType, document ? document.fileName : "", vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, '/src'))]
    }
  );
  /*
  vscode.workspace[document.uri.toString()] = panel
  
  vscode.workspace.onDidCloseTextDocument(document => {
    if (document.fileName && document.fileName.endsWith(".w3m")) {
      vscode.workspace[document.uri.toString()].dispose()
    }
  })*/
  // 设置HTML内容
  console.log(path.join(context.extensionPath, 'src/resources/build', 'index.html'))
  let template = vscode.Uri.file(path.join(context.extensionPath, 'src/resources/w3m-viewer', 'index.html'));
  let html = template.with({ scheme: "vscode-resource" })
  panel.webview.html = fs.readFileSync(html.fsPath).toString()

  // 關閉文檔
  panel.webview.postMessage({ "extension-path": context.extensionPath });
}

const destroy = () => {

}

module.exports = w3mView;