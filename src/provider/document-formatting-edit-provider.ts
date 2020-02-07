import * as vscode from "vscode";
import { Keyword } from "../main/keyword";
import { language } from "../main/constant";

/// 格式化
class KeywordDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {

  /**
   * 缩进格式化
   */
  private indentedFormatting(document: vscode.TextDocument, options: vscode.FormattingOptions) {
    const textEdits = new Array<vscode.TextEdit>();

    const globalStartRegExp = new RegExp(`^\\s*${Keyword.Globals}\\b`);
    const globalEndRegExp = new RegExp(`^\\s*${Keyword.Endglobals}\\b`);

    const functionStartRegExp = new RegExp(`^\\s*((${Keyword.keywordPrivate}|${Keyword.keywordPublic}|${Keyword.keywordStatic})\\s+)?${Keyword.Function}\\b`);
    const functionEndRegExp = new RegExp(`^\\s*${Keyword.Endfunction}\\b`);

    const libraryStartRegExp = new RegExp(`^\\s*${Keyword.keywordLibrary}\\b`);
    const libraryEndRegExp = new RegExp(`^\\s*${Keyword.keywordEndLibrary}\\b`);

    const ifStartRegExp = new RegExp(`^\\s*${Keyword.If}\\b`);
    const ifEndRegExp = new RegExp(`^\\s*${Keyword.Endif}\\b`);

    const loopStartRegExp = new RegExp(`^\\s*${Keyword.Loop}\\b`);
    const loopEndRegExp = new RegExp(`^\\s*${Keyword.Endloop}\\b`);

    let field = 0;

    let libraryField = 0;
    let globalsField = 0;
    let functionField = 0;
    let ifField = 0;
    let loopField = 0;

    // 记录上一出现的是不是if
    let isIf = false;



    for (let index = 0; index < document.lineCount; index++) {
      const line = document.lineAt(index);
      const lineText = line.text;

      const creatTextEdit = (tNum: number) => {
        return tNum == 0 ?
          line.firstNonWhitespaceCharacterIndex == 0 ?
            undefined
            : vscode.TextEdit.delete(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex))
          :
          line.firstNonWhitespaceCharacterIndex == tNum ?
            undefined :
            vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
              "".padStart(tNum, "\t"));
      };

      const addTextEdit = (edit?:vscode.TextEdit) => {
        if(edit){
          textEdits.push(edit);
        }
      } 

      if (libraryStartRegExp.test(lineText)) {
        if (libraryField == 0) {
          libraryField++;
        }
        addTextEdit(creatTextEdit(0));
      } else if (libraryEndRegExp.test(lineText)) {
        if (libraryField == 1) {
          libraryField--;
        }
        addTextEdit(creatTextEdit(0));
        ifField = 0;
        loopField = 0;
        globalsField = 0;
        functionField = 0;
      } else if (globalStartRegExp.test(lineText)) {
        if (globalsField == 0) {
          globalsField++;
        }
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
      } else if (globalEndRegExp.test(lineText)) {
        if (globalsField == 1) {
          globalsField--;
        }
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
      }
      else if (functionStartRegExp.test(lineText)) {
        if (functionField == 0) {
          functionField++;
        }
        addTextEdit(creatTextEdit(libraryField));
      } else if (functionEndRegExp.test(lineText)) {
        if (functionField == 1) {
          functionField--;
        }
        ifField = 0;
        loopField = 0;
        globalsField = 0;
        addTextEdit(creatTextEdit(libraryField));
      }
      else if (ifStartRegExp.test(lineText)) {
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
        ifField++;
      } else if (ifEndRegExp.test(lineText)) {
        if (ifField > 0) {
          ifField--;
        }
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
      }
      else if (loopStartRegExp.test(lineText)) {
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
        loopField++;
      } else if (loopEndRegExp.test(lineText)) {
        if (loopField > 0) {
          loopField--;
        }
        addTextEdit(creatTextEdit(libraryField + functionField + ifField + loopField));
      }else {

        const elseRegExp = new RegExp(`^\\s*${Keyword.Else}\\b`);
        const elseIfRegExp = new RegExp(`^\\s*${Keyword.Elseif}\\b`);
        const exitwhenRegExp = new RegExp(`^\\s*${Keyword.Exitwhen}\\b`);

        if(elseRegExp.test(lineText) && ifField > 0){
          addTextEdit(creatTextEdit(libraryField + globalsField + functionField + ifField + loopField - 1));
        }
        else if(elseIfRegExp.test(lineText) && ifField > 0){
          addTextEdit(creatTextEdit(libraryField + globalsField + functionField + ifField + loopField - 1));
        }
        else if(exitwhenRegExp.test(lineText) && loopField > 0){
          addTextEdit(creatTextEdit(libraryField + globalsField + functionField + ifField + loopField - 1));
        }
        else{
          addTextEdit(creatTextEdit(libraryField + globalsField + functionField + ifField + loopField));
        }
 
      }



    }


    return textEdits;
  }

  provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

    return this.indentedFormatting(document, options);
    const textEdits = new Array<vscode.TextEdit>();

    // const text = document.getText();
    // for (let i = 0; i < text.length; i++) {
    //   const char = text.charAt(i);

    // }

    let field = 0;
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const trimLeftText = line.text.trimStart();
      if (trimLeftText.startsWith(Keyword.Function) ||
        ((trimLeftText.startsWith(Keyword.keywordPrivate) || trimLeftText.startsWith(Keyword.keywordPublic)) && trimLeftText.includes(Keyword.Function)) ||
        trimLeftText.startsWith(Keyword.Globals) ||
        trimLeftText.startsWith(Keyword.keywordLibrary) ||
        trimLeftText.startsWith(Keyword.keywordScope) ||
        trimLeftText.startsWith(Keyword.keywordInterface) ||
        trimLeftText.startsWith(Keyword.keywordStruct ||
          trimLeftText.startsWith(Keyword.If)) ||
        trimLeftText.startsWith(Keyword.Loop)) {
        if (line.firstNonWhitespaceCharacterIndex != field)
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
            "".padStart(field, "\t")));
        field++;
      } else if (trimLeftText.startsWith(Keyword.Endfunction) ||
        trimLeftText.startsWith(Keyword.Endglobals) ||
        trimLeftText.startsWith(Keyword.keywordEndLibrary) ||
        trimLeftText.startsWith(Keyword.keywordEndScope) ||
        trimLeftText.startsWith(Keyword.keywordEndInterface) ||
        trimLeftText.startsWith(Keyword.keywordEndStruct) ||
        trimLeftText.startsWith(Keyword.Endif) ||
        trimLeftText.startsWith(Keyword.Endloop)) {
        if (field >= 0) field--;
        if (line.firstNonWhitespaceCharacterIndex != field)
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
            "".padStart(field, "\t")));
      } else {
        if (line.firstNonWhitespaceCharacterIndex != field)
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
            "".padStart(field, "\t")));
      }
    }

    return textEdits;
  }

}

vscode.languages.registerDocumentFormattingEditProvider(language, new KeywordDocumentFormattingEditProvider);
