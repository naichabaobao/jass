// import * as vscode from "vscode";

// // import { TokenParser, Token, LexicalType } from "../jass/token";

// import { tokenize, Token } from "../main/jass/tokens";


// /*
// 思路
// 理應支持jass語法，但又不影響其他語言
// globals 跟 endglobals 不受其他形式嵌套影響
// function endfunction 影響 if loop
// library 放棄支持
// 當前版本暫保留，僅修復else縮進問題
// */


// function indentSupport(): boolean {
//   return vscode.workspace.getConfiguration()?.jass.format.indent.support as boolean ?? false;
// }

// vscode.languages.registerDocumentFormattingEditProvider("jass", new class DocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {

//   /**
//    * 缩进格式化
//    */
//   private indentedFormatting(document: vscode.TextDocument, options: vscode.FormattingOptions) {
//     const textEdits = new Array<vscode.TextEdit>();

//     const globalStartRegExp = new RegExp(`^\\s*globals\\b`);
//     const globalEndRegExp = new RegExp(`^\\s*endglobals\\b`);

//     const functionStartRegExp = new RegExp(`^\\s*((private|public|static)\\s+)?function\\b`);
//     const functionEndRegExp = new RegExp(`^\\s*endfunction\\b`);

//     const libraryStartRegExp = new RegExp(`^\\s*library\\b`);
//     const libraryEndRegExp = new RegExp(`^\\s*endlibrary\\b`);

//     const ifStartRegExp = new RegExp(`^\\s*if\\b`);
//     const ifEndRegExp = new RegExp(`^\\s*endif\\b`);

//     const loopStartRegExp = new RegExp(`^\\s*loop\\b`);
//     const loopEndRegExp = new RegExp(`^\\s*endloop\\b`);

//     const zincStartRegExp = new  RegExp(`^\\s*\/\/\s+zinc\\b`);
//     const zincEndRegExp = new  RegExp(`^\\s*\/\/\s+endzinc\\b`);

//     let field = 0;

//     let libraryField = 0;
//     let globalsField = 0;
//     let functionField = 0;
//     let ifField = 0;
//     let loopField = 0;

//     // 记录上一出现的是不是if
//     let isIf = false;

//     let inZinc = false;

//     for (let index = 0; index < document.lineCount; index++) {
//       const line = document.lineAt(index);
//       const lineText = line.text;

//       const creatTextEdit = (tNum: number) => {
//         return tNum == 0 ?
//           line.firstNonWhitespaceCharacterIndex == 0 ?
//             undefined
//             : vscode.TextEdit.delete(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex))
//           :
//           line.firstNonWhitespaceCharacterIndex == tNum ?
//             undefined :
//             vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
//               "".padStart(tNum, "\t"));
//       };

//       const addTextEdit = (edit?: vscode.TextEdit) => {
//         if (edit) {
//           textEdits.push(edit);
//         }
//       }
//       /*
//       if (zincStartRegExp.test(lineText)) {
//         inZinc = true;
//       } else if (zincEndRegExp.test(lineText)) {
//         inZinc = false;
//       }
//       if(inZinc) {
//         continue;
//       }*/

//       if (libraryStartRegExp.test(lineText)) {
//         if (libraryField == 0) {
//           libraryField++;
//         }
//         addTextEdit(creatTextEdit(0));
//         globalsField = 0;
//       } else if (libraryEndRegExp.test(lineText)) {
//         if (libraryField == 1) {
//           libraryField--;
//         }
//         addTextEdit(creatTextEdit(0));
//         ifField = 0;
//         loopField = 0;
//         globalsField = 0;
//         functionField = 0;
//       } else if (globalStartRegExp.test(lineText)) {
//         if (globalsField == 0) {
//           globalsField++;
//         }
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//       } else if (globalEndRegExp.test(lineText)) {
//         if (globalsField == 1) {
//           globalsField--;
//         }
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//       }
//       else if (functionStartRegExp.test(lineText)) {
//         if (functionField == 0) {
//           functionField++;
//         }
//         addTextEdit(creatTextEdit(libraryField));
//         globalsField = 0;
//       } else if (functionEndRegExp.test(lineText)) {
//         if (functionField == 1) {
//           functionField--;
//         }
//         ifField = 0;
//         loopField = 0;
//         globalsField = 0;
//         addTextEdit(creatTextEdit(libraryField));
//       }
//       else if (ifStartRegExp.test(lineText)) {
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//         ifField++;
//       } else if (ifEndRegExp.test(lineText)) {
//         if (ifField > 0) {
//           ifField--;
//         }
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//       }
//       else if (loopStartRegExp.test(lineText)) {
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//         loopField++;
//       } else if (loopEndRegExp.test(lineText)) {
//         if (loopField > 0) {
//           loopField--;
//         }
//         addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//       } else {

//         const elseRegExp = new RegExp(`^\\s*else\\b`);
//         const elseIfRegExp = new RegExp(`^\\s*elseif\\b`);
//         const exitwhenRegExp = new RegExp(`^\\s*exitwhen\\b`);

//         if (elseRegExp.test(lineText) && ifField > 0) {
//           addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField - 1));
//         }
//         else if (elseIfRegExp.test(lineText) && ifField > 0) {
//           addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField - 1));
//         }
//         else if (exitwhenRegExp.test(lineText) && loopField > 0) {
//           addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField - 1));
//         }
//         else {
//           if (globalsField > 0) {
//             addTextEdit(creatTextEdit(globalsField));
//           } else {
//             addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
//           }
//         }

//       }



//     }


//     return textEdits;
//   }

//   provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
//     console.log(options)
//     options.tabSize = 1;
//     options.insertSpaces = true;
//     const textEdits = indentSupport() ? this.indentedFormatting(document, options) : new Array<vscode.TextEdit>();

//     const tokens = tokenize(document.getText());
//     for (let index = 0; index < tokens.length; index++) {
//       const token = tokens[index];
//       const next_token = tokens[index + 1];

//       if (!next_token) {
//         break;
//       }
//       function isValue(t: Token) {
//         return t.isInt() || t.isReal() || t.isString();
//       }
//       try {
//         if (((token.isId() && next_token.isId()) || (isValue(token) && next_token.isId())) &&
//           token.loc && next_token.loc &&
//           Number.isInteger(token.loc.startLine) && Number.isInteger(token.loc.startPosition) && Number.isInteger(token.loc.endLine) && Number.isInteger(token.loc.endPosition) &&
//           Number.isInteger(next_token.loc.startLine) && Number.isInteger(next_token.loc.startPosition) && Number.isInteger(next_token.loc.endLine) && Number.isInteger(next_token.loc.endPosition) &&
//           token.loc.endLine == next_token.loc.startLine && <number>next_token.loc.startPosition - <number>token.loc.endPosition > 1) {
//           const textEdit = vscode.TextEdit.replace(new vscode.Range(<number>token.loc.endLine, <number>token.loc.endPosition, <number>next_token.loc.startLine, <number>next_token.loc.startPosition), " ");
//           textEdits.push(textEdit);
//         }
       
//         const c0 = token.isOp() && (next_token.isId() || isValue(next_token));
//         const c1 = token.value === "(" || token.value === "[" || token.value === "!";
//         const c2 = c0 && c1;

//         const c3 = (token.isId() || isValue(token)) && next_token.isOp();
//         const c4 = next_token.value === "(" || next_token.value === "[" || next_token.value === ")";
//         const c5 = c3 && c4;

//         const c6 = tokens[index - 1] && tokens[index - 1].isOp() && token.isOp() && (next_token.isInt() || next_token.isReal());
//         const c7 = token.value === "-";
//         const c8 = c6 && c7;

//         const c9 = token.loc && next_token.loc && Number.isInteger(token.loc.startLine) && Number.isInteger(token.loc.startPosition) && Number.isInteger(token.loc.endLine) && Number.isInteger(token.loc.endPosition) && Number.isInteger(next_token.loc.startLine) && Number.isInteger(next_token.loc.startPosition) && Number.isInteger(next_token.loc.endLine) && Number.isInteger(next_token.loc.endPosition);

//         const c10 = <number>token.loc?.endLine == <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition > 0;

//         const c11 = (c2 || c5 || c8) && c9 && c10;

//         if (c11) {
//           const textEdit = vscode.TextEdit.delete(new vscode.Range(<number>token.loc?.endLine, <number>token.loc?.endPosition, <number>next_token.loc?.startLine, <number>next_token.loc?.startPosition));
//           textEdits.push(textEdit);
//         }

//         const b1 = token.isOp() && (next_token.isId() || isValue(next_token));
//         const b2 = token.value === "+" || token.value === "*" || token.value === "/" || token.value === ">" || token.value === "<" || token.value === ">=" || token.value === "<=" || token.value === "==" || token.value === "->" || token.value === "=" || token.value === "!=" || token.value === "||" || token.value === "&&" || token.value === "," || token.value === ")";
//         const b3 = b1 && b2;

//         const b4 = (token.isId() || isValue(token)) && next_token.isOp();
//         const b5 = next_token.value === "+" || next_token.value === "-" || next_token.value === "*" || next_token.value === "/" || next_token.value === ">" || next_token.value === "<" || next_token.value === ">=" || next_token.value === "<=" || next_token.value === "==" || next_token.value === "->" || next_token.value === "=" || next_token.value === "!=" || next_token.value === "||" || next_token.value === "&&";
//         const b6 = b4 && b5;

//         const b7 = token.loc && next_token.loc && Number.isInteger(token.loc.startLine) && Number.isInteger(token.loc.startPosition) && Number.isInteger(token.loc.endLine) && Number.isInteger(token.loc.endPosition) &&
//         Number.isInteger(next_token.loc.startLine) && Number.isInteger(next_token.loc.startPosition) && Number.isInteger(next_token.loc.endLine) && Number.isInteger(next_token.loc.endPosition);

//         const b8 = (b3 || b6) && b7;

//         const b9 = <number>token.loc?.endLine === <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition === 0;
//         const b10 = <number>token.loc?.endLine === <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition > 1;

//         const b11 = b8 && (b9 || b10);

//         if (b11) {
//           const textEdit = vscode.TextEdit.replace(new vscode.Range(<number>token.loc?.endLine, <number>token.loc?.endPosition, <number>next_token.loc?.startLine, <number>next_token.loc?.startPosition), " ");
//           textEdits.push(textEdit);
//         }

//         const a1 = token.isOp && next_token.isOp();
//         const a2 = /*避免--运算被打乱*/ /*(token.value === "-" && next_token.value === "-") || */ (token.value === ")" && next_token.value === "->");
//         const a3 = token.loc && next_token.loc && Number.isInteger(token.loc.startLine) && Number.isInteger(token.loc.startPosition) && Number.isInteger(token.loc.endLine) && Number.isInteger(token.loc.endPosition) &&
//         Number.isInteger(next_token.loc.startLine) && Number.isInteger(next_token.loc.startPosition) && Number.isInteger(next_token.loc.endLine) && Number.isInteger(next_token.loc.endPosition);
//         const a4 = <number>token.loc?.endLine === <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition > 1;
//         const a5 = <number>token.loc?.endLine === <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition === 0;
//         const a6 = a1 && a2 && a3 && (a4 || a5);

//         if (a6) {
//           const textEdit = vscode.TextEdit.replace(new vscode.Range(<number>token.loc?.endLine, <number>token.loc?.endPosition, <number>next_token.loc?.startLine, <number>next_token.loc?.startPosition), " ");
//           textEdits.push(textEdit);
//         }

//         const d1 = token.isOp && next_token.isOp();
//         const d2 = (token.value === "(" && next_token.value === ")") || (token.value === "[" && next_token.value === "]") || (token.value === "{" && next_token.value === "}");
//         const d3 = token.loc && next_token.loc && Number.isInteger(token.loc.startLine) && Number.isInteger(token.loc.startPosition) && Number.isInteger(token.loc.endLine) && Number.isInteger(token.loc.endPosition) &&
//         Number.isInteger(next_token.loc.startLine) && Number.isInteger(next_token.loc.startPosition) && Number.isInteger(next_token.loc.endLine) && Number.isInteger(next_token.loc.endPosition);
//         const d4 = <number>token.loc?.endLine === <number>next_token.loc?.startLine && <number>next_token.loc?.startPosition - <number>token.loc?.endPosition > 1;
//         const d5 = d1 && d2 && d3 && d4;

//         if (d5) {
//           const textEdit = vscode.TextEdit.delete(new vscode.Range(<number>token.loc?.endLine, <number>token.loc?.endPosition, <number>next_token.loc?.startLine, <number>next_token.loc?.startPosition));
//           textEdits.push(textEdit);
//         }


//       } catch (e){ 
//         console.error(e)
//       }
//     }
//     /*
//     tokens.reduce((preVal, curVal, index, ts) => {

//       if (preVal.isId() && curVal.isId()) {
//         console.log(preVal.loc)
//         console.log(curVal.loc)
//         if (curVal.loc && preVal.loc && curVal.loc.startLine === preVal.loc.startLine && Number.isInteger(curVal.loc.startPosition) && Number.isInteger(preVal.loc.endPosition) && <number>curVal.loc.startPosition - <number>preVal.loc.endPosition > 1) {
//           const textEdit = vscode.TextEdit.replace(new vscode.Range(<number>preVal.loc.startLine, <number>preVal.loc.endPosition, <number>curVal.loc.startLine, <number>curVal.loc.startPosition), " ");
//           textEdits.push(textEdit);
//         }
//       }

//       return curVal;
//     });
//     */
//     return textEdits;
//   }

// }());

// class DocumentFormattingSortEditProvider implements vscode.DocumentFormattingEditProvider {

//   provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
//     const textEdits = new Array<vscode.TextEdit>();
//     try {

//     } catch (e) {
//       console.error(e);
//     }
//     console.log("length = " + textEdits.length);
//     return textEdits;
//   }

// }

// // vscode.languages.registerDocumentFormattingEditProvider(language, new DocumentFormattingSortEditProvider);