import * as vscode from 'vscode';
import { isdiagnosticsupport } from '../main/configuration';
import { parse } from 'path';
import { j, ai } from '../main/constant';
import { Keyword } from '../main/keyword';
// import { readdir, exists, stat, readFile } from 'fs';
// import { resolve, parse } from 'path';
// import { j, ai } from '../main/constant';

/**
 * 是否缺少call关键字
 * @param text 
 */
function isCallError(text: string) {
  let isError = false;
  const callErrorRegExp = new RegExp(`^\\s*(?<name>[a-zA-Z][a-zA-Z0-9_]*)\\s*\\(`);
  if (callErrorRegExp.test(text)) {
    const result = callErrorRegExp.exec(text);
    if(result && result.groups && result.groups.name && Keyword.isNotKeyword(result.groups.name)){
      isError = true;
    }
  }
  return isError;
}

/**
 * 是否缺少then关键字
 * @param text 
 */
function _isifUnthenError(text: string) {
  let isError = false;
  const ifStartRegExp = new RegExp(/^\s*if\b/);
  if (ifStartRegExp.test(text)) {
    const thenEndRegExp = new RegExp(/then\s*$/);
    if(!thenEndRegExp.test(text)){ // 未找到then结尾
      isError = true;
    }
  }
  return isError;
}

const diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection();

function parseError(document: vscode.TextDocument) {
  const fsPathInfo = parse(document.uri.fsPath)
  if (fsPathInfo.ext == j || fsPathInfo.ext == ai) {
    // _diagnostic.clear();
    diagnosticCollection.delete(document.uri);
    const diags = new Array<vscode.Diagnostic>();
    for (let index = 0; index < document.lineCount; index++) {
      const line = document.lineAt(index);
      if(line.isEmptyOrWhitespace) continue;
      const lineText = line.text;
      if (isCallError(lineText)) {
        const d = new vscode.Diagnostic(new vscode.Range(line.lineNumber, line.firstNonWhitespaceCharacterIndex, line.lineNumber, line.text.indexOf("(")),
          "缺少call关键字",
          vscode.DiagnosticSeverity.Error);
        diags.push(d);
      }
      if(_isifUnthenError(lineText)) {
        const d = new vscode.Diagnostic(new vscode.Range(line.lineNumber, line.firstNonWhitespaceCharacterIndex, line.lineNumber, line.firstNonWhitespaceCharacterIndex + 2),
        "缺少then关键字",
        vscode.DiagnosticSeverity.Error);
      diags.push(d);
      }
    }
    diagnosticCollection.set(document.uri, diags);
  }
};

vscode.workspace.onDidSaveTextDocument(document => {
  if (isdiagnosticsupport()) {
    parseError(document);
  }
});

vscode.workspace.onDidChangeConfiguration(event => {
  if (!isdiagnosticsupport()) {
    diagnosticCollection.clear();
  }
});

vscode.workspace.onDidOpenTextDocument((document) => {
  if (!isdiagnosticsupport()) {
    parseError(document);
  }
});

vscode.workspace.onDidCloseTextDocument((document) => {
  diagnosticCollection.delete(document.uri);
});

// class Diagnostic {
//   private _uri:vscode.Uri;
//   private _diagnostic:vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection(this._uri.fsPath);

//   constructor(uri:vscode.Uri){
//     this._uri = uri;
//   }

//   public get uri() : vscode.Uri {
//     return this._uri;
//   } 

//   public get diagnostic() : vscode.DiagnosticCollection {
//     return this._diagnostic;
//   } 

// }

// const diagnostics = new Array<Diagnostic>();

// vscode.workspace.workspaceFolders?.forEach(folder => {
//   const parseFolder = (dir:string) => {
//     readdir(dir, (error , files) => {
//       // 保证文件存在 并且是文件 后缀必须是j或ai
//       files.forEach(file => {
//         const fileName = resolve(dir, file);
//         exists(fileName, exists => {
//           if (exists) {
//             // console.log(fileName + " 存在");
//             stat(fileName, (err, stats) => {
//               if (err) {
//                 console.error(err.message);
//               } else if (stats.isFile()) {
//                 // console.log(fileName + " 是文件");
//                 const parseFile = parse(fileName);
//                 if (parseFile.ext == j || parseFile.ext == ai) {
//                   // console.log(fileName + " 后缀正确");
//                   const uri = vscode.Uri.file(fileName);
//                   const diag = new Diagnostic(uri);
//                   diagnostics.push(diag);
//                   console.log(diagnostics);
//                 }
//               }else if(stats.isDirectory()){
//                 readdir(fileName,(err,files) => {
//                   if(err){
//                     console.error(err);
//                     throw err.message;
//                   }else{
//                     files.forEach(file => {
//                       parseFolder(resolve(fileName, file));
//                     });
//                   }
//                 });
//               }
//             });
//           }
//         });
//       });


//     });
//   };
//   parseFolder(folder.uri.fsPath);
// });

// export {
//   diagnostics
// };

