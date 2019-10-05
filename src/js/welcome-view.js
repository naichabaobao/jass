const vscode = require("vscode");
const ejs = require('ejs');
const path = require("path");

const panel = vscode.window.createWebviewPanel(
  '反饋群',
  '反饋群',
  vscode.ViewColumn.One,
  {
    enableScripts: true
  }
);

ejs.renderFile(path.resolve(__dirname, '../resources/template/index.ejs'), {}, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    // 设置HTML内容
    panel.webview.html = data;
    console.log(data);
  }
});