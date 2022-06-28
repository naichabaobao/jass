import * as vscode from "vscode";
import { tokenize } from "../jass/tokens";

// Symbols that require spaces
const NeedAddSpaceOps = ["=", ">", "<", ">=", "<=", "+", "-", "*", "/", "%", "+=", "-=", "/=", "*=", "++", "--", "&&", "||", "{", "}", "!=", "=="];

/**
 * 默认会认为已闭合
 * zinc {} 必须换行才能识别
 */
class DocumentFormattingSortEditProvider implements vscode.DocumentFormattingEditProvider {

  provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
    const textEdits = new Array<vscode.TextEdit>();
    
    let indent = 0;
    let indentChar:string;
    function genString(count:number, char = " ") {
      return new Array(count).fill(char).join("");
    }
    if (options.insertSpaces) {
      indentChar = genString(options.tabSize);
    } else {
      indentChar = "\t";
    }
    
    // console.log(lineText.firstNonWhitespaceCharacterIndex)
    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      const text = lineText.text;

      if (/^\s*(library|scope|struct|interface|globals|(?:(?:private|public)\s+)?(?:static\s+)?function(?<!\s+interface\b)|(?:(?:private|public)\s+)?(?:static\s+)?method|(?:static\s+)?if|loop|while|for|module|\/\/!\s+(?:zinc|textmacro|nov[Jj]ass|inject))\b/.test(text) || /^.*\{[\s\t]*$/.test(text)) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
            textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
        indent++;
        // if (/}\s*$/.test(text)) {
        //   indent--;
        // }
      } else if (indent > 0 && /^\s*(?:(endlibrary|endscope|endstruct|endinterface|endglobals|endfunction|endmethod|endif|endloop|endmodule|\/\/!\s+(?:endzinc|endtextmacro|endnov[Jj]ass|endinject))\b|})/.test(text)) {
        indent--;
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
      } else if (/^\s*(else|elseif)\b/.test(text)) {
        if (indent > 0) {
          if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent - 1 == 0) {
            textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent - 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent - 1, indentChar)));
          }
        }
      } else if (!lineText.isEmptyOrWhitespace) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
      }
    }
    // 文本格式化
    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      if (lineText.isEmptyOrWhitespace) {
        continue;
      }
      const text = lineText.text;
      const ts = tokenize(text);
      ts.reduce((previousValue, currentValue, currentIndex, array) => {
        // If the current location is the symbol specified by needaddspaceops
        // Judge whether a space should be added to the relationship between the current symbol and the previous symbol
        if (currentValue.isOp() && NeedAddSpaceOps.includes(currentValue.value) && (previousValue.isId() || previousValue.isInt() || previousValue.isReal() || previousValue.isString() || previousValue.isMark() || previousValue.value == ")" || previousValue.value == "]")) {
          if (currentValue.position - previousValue.end != 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(
              new vscode.Position(lineText.lineNumber, previousValue.end),
              new vscode.Position(lineText.lineNumber, currentValue.position)
            ), " "));
          }
        } else if (
        // If the current position is non symbolic and preceded by a symbol
        (currentValue.isId() || currentValue.isInt() || currentValue.isReal() || currentValue.isString() || currentValue.isMark() || currentValue.value == "(" || currentValue.value == "[") &&
         previousValue.isOp() && NeedAddSpaceOps.includes(previousValue.value)) {
          if (currentValue.position - previousValue.end != 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(
              new vscode.Position(lineText.lineNumber, previousValue.end),
              new vscode.Position(lineText.lineNumber, currentValue.position)
            ), " "));
          }
        // Between two identifiers
        } else if (currentValue.isId() && previousValue.isId()) {
          if (currentValue.position - previousValue.end != 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(
              new vscode.Position(lineText.lineNumber, previousValue.end),
              new vscode.Position(lineText.lineNumber, currentValue.position)
            ), " "));
          }
        } else if (previousValue.isOp() && previousValue.value == ",") { // Add only one space to the right of the symbol
          if (currentValue.position - previousValue.end != 1) {
            textEdits.push(vscode.TextEdit.replace(new vscode.Range(
              new vscode.Position(lineText.lineNumber, previousValue.end),
              new vscode.Position(lineText.lineNumber, currentValue.position)
            ), " "));
          }
        }
        return currentValue;
      })
    }

    return textEdits;
  }

}

vscode.languages.registerDocumentFormattingEditProvider("jass", new DocumentFormattingSortEditProvider());
