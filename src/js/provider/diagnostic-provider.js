const vscode = require("vscode");

let { exec } = require('child_process');
const path = require("path");

let createDiagnosticCollection = vscode.languages.createDiagnosticCollection("jass");


const command = `${path.resolve(__dirname, "../../resources/pjass.exe")} ${path.resolve(__dirname, "../../resources/jass/common.j")} ${path.resolve(__dirname, "../../resources/jass/blizzard.j")} ${path.resolve(__dirname, "../../resources/jass/common.ai")} `;

// c:\Users\Administrator\Desktop\test.j:14: Not enough arguments passed to function
const errorRegExp = /(?<uri>.+?):(?<line>\d+):(?<message>.+)/;

vscode.workspace.onDidChangeConfiguration(e => {
  console.log(e)
  if (vscode.workspace.getConfiguration("jass").pjass.enable == false) {
    createDiagnosticCollection.clear();
  }
});

vscode.workspace.onDidSaveTextDocument(document => {

  let ext = path.parse(document.fileName).ext;
  if (!vscode.workspace.getConfiguration("jass").pjass.enable) return;
  if (ext != ".j" && ext != ".ai") return;
  try {
    exec(command + document.uri.fsPath, (error, stdout, stderr) => {
      if (error && stdout && stdout.trimLeft() != "") {
        createDiagnosticCollection.clear(); // 有錯誤時先清理之前的錯誤
        let errors = [];
        const lines = stdout.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          line.replace(errorRegExp, (...args) => {
            let groups = [...args];

            if (groups) {
              let group = groups.pop()
              if (group && group.uri && group.line && group.message) {
                // 行1開始 理應 -1
                const message = group.message;
                // local錯誤行數不正確 所以要再-1
                const lineNumber = Math.max(Number.parseInt(group.line) - (message.includes("Local declaration after first statement") ? 2 : 1), 0);
                let range = new vscode.Range(lineNumber, document.lineAt(lineNumber).firstNonWhitespaceCharacterIndex, lineNumber, document.lineAt(lineNumber).text.length);
                if (!message.includes("Undeclared function")) {  // 因爲文檔來源不清晰，檢測未定義方法會造成誤報
                  errors.push(new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error));
                }
              }
            }
          });
        }
        // 注意 errors必須是數組
        createDiagnosticCollection.set(document.uri, errors);
      }
    });
  } catch (err) {
    // 避免異常導致插件退出
    console.log(err)
  }
});