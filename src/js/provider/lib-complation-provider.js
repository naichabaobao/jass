/*
 * 讀取當前文檔目錄下所有.j,.ai文件
 */

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
//  vscode.languages.registerCompletionItemProvider("jass", {
//    provideCompletionItems(document, position, token, context){

//    },
//    resolveCompletionItem(item,token){

//    }
//  });

const Includes = "includes";

let functions = []; // {name: string,paramater: {type:string,name:string}[]}

const getLib = () => {
  console.log(vscode.workspace.getConfiguration())
  let includes = vscode.workspace.getConfiguration().get(Includes, []);
  if (includes) {
    console.log(includes)
    includes.forEach(x => { // x=用戶傳遞的絕對路徑
      if (path.isAbsolute(x) && fs.existsSync(x)) {
        let isDir = fs.lstatSync(x).isDirectory();
        if (isDir) {

        } else {

        }
      }
    })
  }
}

vscode.workspace.onDidChangeConfiguration(event => {
  console.log(vscode.workspace.getConfiguration())
});

getLib();




