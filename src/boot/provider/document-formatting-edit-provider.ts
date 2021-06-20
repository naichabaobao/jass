import * as vscode from "vscode";



/**
 * 默认会认为已闭合
 * zinc {} 必须换行才能识别
 */
class DocumentFormattingSortEditProvider implements vscode.DocumentFormattingEditProvider {

  provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
    const textEdits = new Array<vscode.TextEdit>();
    
    let indent = 0;
    const indentChar = options.insertSpaces ? "".padStart(options.tabSize, " ") : "\t";
    // console.log(lineText.firstNonWhitespaceCharacterIndex)
    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      const text = lineText.text;

      if (/^\s*(library|scope|struct|interface|globals|(?:(?:private|public)\s+)?(?:static\s+)?function(?<!\s+interface\b)|(?:(?:private|public)\s+)?(?:static\s+)?method|(?:static\s+)?if|loop|while|for|module|\/\/!\s+(?:zinc|textmacro|nov[Jj]ass|inject))\b/.test(text)) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
            textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), "".padStart(indent, indentChar)));
        }
        indent++;
        // if (/}\s*$/.test(text)) {
        //   indent--;
        // }
      } else if (indent > 0 && /^\s*(?:(endlibrary|endscope|endstruct|endinterface|endglobals|endfunction|endmethod|endif|endloop|endmodule|\/\/!\s+(?:endzinc|textmacro|endnov[Jj]ass|endinject))\b|})/.test(text)) {
        indent--;
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), "".padStart(indent, indentChar)));
        }
      } else if (/^\s*(else|elseif)\b/.test(text)) {
        if (indent > 0) {
          if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent - 1 == 0) {
            textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent - 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), "".padStart(indent - 1, indentChar)));
          }
        }
      } else if (!lineText.isEmptyOrWhitespace) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), "".padStart(indent, indentChar)));
        }
      }
    }
    return textEdits;
  }

}

vscode.languages.registerDocumentFormattingEditProvider("jass", new DocumentFormattingSortEditProvider());
