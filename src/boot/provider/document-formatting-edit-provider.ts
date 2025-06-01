import * as vscode from "vscode";
import { GlobalContext } from "../jass/parser-vjass";
import * as common from "../jass/tokenizer-common"



/**
 * 
 * @param arrays 
 * @param compare if return true will add item to new array
 * @returns unique new array
 */
function unique<T>(arrays: T[], compare: (arrays:T[], item:T) => boolean) {
  const new_arrays:T[] = [];

  for (let index = 0; index < arrays.length; index++) {
    const element = arrays[index];
    
    if (compare(new_arrays, element)) {
      new_arrays.push(element);
    }
  }

  return new_arrays;
}

function format_by_tokens(tokens:common.Token[]) {
  const textEdits = new Array<vscode.TextEdit>();
  
  // Skip empty lines
  if (tokens.length === 0) {
    return textEdits;
  }

  for (let index = 0; index < tokens.length; index++) {
    const previous_token = tokens[index - 1];
    const current_token = tokens[index];
    const next_token = tokens[index + 1];
    if (!previous_token || !next_token) {
      continue;
    }
    const genBeforSpace = () => {
      if (!previous_token) {
        return;
      }
      if (current_token.getText() != previous_token.getText()) {
        if (current_token.character - (previous_token.character + previous_token.length) == 0) {
          textEdits.push(vscode.TextEdit.insert(new vscode.Position(current_token.line, current_token.character), " "));
        }
        else if (current_token.character - (previous_token.character + previous_token.length) > 1) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(
            new vscode.Position(current_token.line, previous_token.character + previous_token.length),
            new vscode.Position(current_token.line, current_token.character)
          ), " "));
        }
      }
    };
    const genAfterSpace = () => {
      if (!next_token) {
        return;
      }
      if (current_token.getText() != next_token.getText()) {
        if (next_token.character - (current_token.character + current_token.length) == 0) {
          textEdits.push(vscode.TextEdit.insert(new vscode.Position(current_token.line, current_token.character + current_token.length), " "));  
        } 
        else if (next_token.character - (current_token.character + current_token.length) > 1) {
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(
            new vscode.Position(current_token.line, current_token.character + current_token.length),
            new vscode.Position(current_token.line, next_token.character)
          ), " "));
        }
      }
    };
    const deleteBeforSpace = () => {
      if (!previous_token) {
        return;
      }
      if (current_token.getText() != previous_token.getText()) {
        if (current_token.character - (previous_token.character + previous_token.length) > 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(
            new vscode.Position(current_token.line, previous_token.character + previous_token.length),
            new vscode.Position(current_token.line, current_token.character)
          )));
        }
      }
    };
    const deleteAfterSpace = () => {
      if (!next_token) {
        return;
      }
      if (current_token.getText() != next_token.getText()) {
        if (next_token.character - (current_token.character + current_token.length) > 0) {
          textEdits.push(vscode.TextEdit.delete(new vscode.Range(
            new vscode.Position(current_token.line, current_token.character + current_token.length),
            new vscode.Position(current_token.line, next_token.character)
          )));
        }
      }
    };
    const current_text = current_token.getText();
    
    // Skip comments
    if (current_token.type === common.TokenType.Conment) {
      continue;
    }

    if (current_token.is_identifier) {
      if (previous_token.is_identifier) { 
        genBeforSpace();
      }
      if (next_token.is_identifier) { 
        genAfterSpace();
      }
    } else if ([","].includes(current_text)) {
      deleteBeforSpace();
      genAfterSpace();
    } else if (["+", "-", "*", "/", ">", "<", ">=", "<=", "!=", "==", "%", "="].includes(current_text)) {
      genBeforSpace();
      genAfterSpace();
    } else if (["(", "[", "."].includes(current_text)) {
      deleteBeforSpace();
      deleteAfterSpace();
    } else if ([")", "]"].includes(current_text)) {
      if (previous_token && previous_token.type != common.TokenType.Operator) {
        deleteBeforSpace();
      }
    }
  }
  return textEdits;
}

/**
 * 默认会认为已闭合
 * zinc {} 必须换行才能识别
 */
class DocumentFormattingSortEditProvider implements vscode.DocumentFormattingEditProvider {

  provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
    const formats = new Array<vscode.TextEdit>();
    
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
    
    // 判断所有字符串是否都是char
    const allIs = (str:string, char:string):boolean => {
      for (let index = 0; index < str.length; index++) {
        const c = str.charAt(index);
        if (c !== char) {
          return false;
        }
      }
      return true;
    }

    // 在interface中没有结束标记
    let inInterface:boolean = false;
    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      const text = (lineText.text || '').split(/\/\/[^!]/)[0]; // 去除注释，避免注释导致换行, 但是保留 //! 注释

      // 判断缩进数跟字符数相同时判断字符是否正确
      const notsise = () => {
        if (lineText.firstNonWhitespaceCharacterIndex == indent) {
          if (options.insertSpaces) {
            return allIs(lineText.text.substring(0, lineText.firstNonWhitespaceCharacterIndex), " ");
          } else {
            return allIs(lineText.text.substring(0, lineText.firstNonWhitespaceCharacterIndex), "\t");
          }
        }
        return false;
      }

      if (/^\s*interface\b/.test(text)) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
            formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent || notsise()) {
            formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
        indent++;
        inInterface = true;
      }else if (indent > 0 && /^\s*endinterface\b/.test(text)) {
        indent--;
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent || notsise()) {
          formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
        inInterface = false;
      }
      else if (/^\s*(?:(?:private|public)\s+)?(library|scope|struct|interface|globals|(?:(?:private|public)\s+)?(?:static\s+)?function(?<!\s+interface\b)|(?:(?:private|public)\s+)?(?:static\s+)?method|(?:static\s+)?if|loop|while|for|module|\/\/!\s+(?:zinc|textmacro|nov[Jj]ass|inject))\b/.test(text) || /^.*\{[\s\t]*$/.test(text)) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
            formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent || notsise()) {
            formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
        if (!inInterface) {
          indent++;
        }
        if (/^.*function\s+interface.*$/.test(text)){
          if (indent > 0) {
            indent--;
          }
        }
      } else if (indent > 0 && /^\s*(?:(endlibrary|endscope|endstruct|endinterface|endglobals|endfunction|endmethod|endif|endloop|endmodule|\/\/!\s+(?:endzinc|endtextmacro|endnov[Jj]ass|endinject))\b|})/.test(text)) {
        if (!inInterface) {
          indent--;
        }
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent || notsise()) {
          formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
      } else if (/^\s*(else|elseif)\b/.test(text)) {
        if (indent > 0) {
          if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent - 1 == 0) {
            formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
          } else if (lineText.firstNonWhitespaceCharacterIndex != indent - 1 || notsise()) {
            formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent - 1, indentChar)));
          }
        }
      } else if (!lineText.isEmptyOrWhitespace) {
        if (lineText.firstNonWhitespaceCharacterIndex > 0 && indent == 0) {
          formats.push(vscode.TextEdit.delete(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex)));
        } else if (lineText.firstNonWhitespaceCharacterIndex != indent || notsise()) {
          formats.push(vscode.TextEdit.replace(new vscode.Range(lineText.lineNumber, 0, lineText.lineNumber, lineText.firstNonWhitespaceCharacterIndex), genString(indent, indentChar)));
        }
      }
    }

    const doc = GlobalContext.get(document.uri.fsPath);
    
    if (doc) {
      for (let line = 0; line < doc.lineCount; line++) {
        const tokens = doc.lineTokens(line);
        const line_formats = format_by_tokens(tokens);
        formats.push(...line_formats);
      }
    }
    
    return unique(formats, (tes, item) => {
      return tes.findIndex(x => x.range.isEqual(item.range) && x.newText == item.newText) == -1;
    });
  }

}

vscode.languages.registerDocumentFormattingEditProvider("jass", new DocumentFormattingSortEditProvider());

vscode.languages.registerOnTypeFormattingEditProvider("jass", new  class TypeFormatProvider implements vscode.OnTypeFormattingEditProvider {
  provideOnTypeFormattingEdits(document: vscode.TextDocument, position: vscode.Position, ch: string, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
    const formats = new Array<vscode.TextEdit>();
    
    const doc = GlobalContext.get(document.uri.fsPath);
    
    if (doc) {
      const tokens = doc.lineTokens(position.line);
      const line_formats = format_by_tokens(tokens);
      formats.push(...line_formats);
    }

    return formats;
  }
} (), ')', ',', '+', '-', '*', '/', '>', '<', '=', '(', '[', ']',);


