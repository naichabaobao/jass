import * as vscode from "vscode";
import { Keyword } from "../main/keyword";
import { language } from "../main/constant";

/// 格式化
class KeywordDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {

  provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
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

export {};