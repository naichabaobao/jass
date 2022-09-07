import * as vscode from "vscode";
import { Tokenize, tokenize, Tokenizer } from "../jass/tokens";
import { Options } from "./options";

// Symbols that require spaces
const NeedAddSpaceOps = ["=", ">", "<", ">=", "<=", "+", "-", "*", "/", "%", "+=", "-=", "/=", "*=", "++", "--", "&&", "||", "{", "}", "!=", "==", "->"];

function reduceTokens(content: string, handle: (token: Tokenize, previousToken:Tokenize|null, isStart: boolean) => void) {
  let preToken: Tokenize | null = null;
  Tokenizer.build(content, (token) => {
      handle(token, preToken, preToken === null || preToken.end.line !== token.start.line);
      preToken = token;
  });
}

interface FormatOption {
  // 条件成立时返回textEdits
  is: (token: Tokenize, previousToken: Tokenize|null, isStart: boolean) => boolean;
  textEdits: (token: Tokenize, previousToken: Tokenize|null, isStart: boolean) => vscode.TextEdit[];
}

function isValue(token: Tokenize) {
  return ["id", "string", "int", "hex", "dollar_hex", "octal", "real", "lua", "mark"].includes(token.type);
}

const formatOptions: FormatOption[] = [
  {
    is: (token, previousToken, isStart) => {
      let compare: boolean = false;
      if (!previousToken) {
        return compare;
      }
      if (token.start.line != previousToken.end.line) {
        return compare;
      }

      if (token.type == "op" && isValue(previousToken) && NeedAddSpaceOps.includes(token.value)) {
        if (token.start.position - previousToken.end.position != 1) {
          compare = true;
        }
      } else if (token.type == "id" && previousToken.type == "id") {
        if (token.start.position - previousToken.end.position != 1) {
          compare = true;
        }
      } else if (token.type == "op" && previousToken.type == "op" && token.value != "]" && token.value != ")" && token.value != "(") {
        console.log("token po op");
        
        if (token.value == "-") {
          if (previousToken.value == "-") {
            if (token.start.position - previousToken.end.position > 1) {
              compare = true;
            }
          } else if (NeedAddSpaceOps.includes(previousToken.value)) {
            if (token.start.position - previousToken.end.position != 1) {
              compare = true;
            }
          }
        } else if (token.value == "+") {
          if (previousToken.value == "+") {
            if (token.start.position - previousToken.end.position > 1) {
              compare = true;
            }
          } else if (NeedAddSpaceOps.includes(previousToken.value)) {
            if (token.start.position - previousToken.end.position != 1) {
              compare = true;
            }
          }
        } else if (token.start.position - previousToken.end.position != 1) {
          compare = true;
        }
      } else if (isValue(token) && previousToken.type == "op") {
        if (previousToken.value == "-") {
          if (token.start.position - previousToken.end.position > 1) {
            compare = true;
          }
        } else if (NeedAddSpaceOps.includes(previousToken.value) || previousToken.value == "," || previousToken.value == ")" || previousToken.value == "]") {
          if (token.start.position - previousToken.end.position != 1) {
            compare = true;
          }
        }
      }

      return compare;
    },
    textEdits: (token, previousToken, isStart) => {
      return [vscode.TextEdit.replace(new vscode.Range(
        new vscode.Position(previousToken!.end.line, previousToken!.end.position),
        new vscode.Position(token.start.line, token.start.position)
      ), " ")];
    }
  },
  {
    is: (token, previousToken, isStart) => {
      let compare: boolean = false;

      if (token.type == "id" || token.type == "string" || token.type == "int" || token.type == "hex" || token.type == "dollar_hex" || token.type == "octal" || token.type == "real" || token.type == "lua" || token.type == "mark") {
        if (previousToken) {
          if (previousToken.type == "op") {
            if (previousToken.value == "(" || previousToken.value == "[" || previousToken.value == ".") {
              if (token.start.line == previousToken.end.line && token.start.position - previousToken.end.position != 0) {
                compare = true;
              }
            }
          }
        }
      }

      return compare;
    },
    textEdits: (token, previousToken, isStart) => {
      return [vscode.TextEdit.delete(new vscode.Range(
        new vscode.Position(previousToken!.end.line, previousToken!.end.position),
        new vscode.Position(token.start.line, token.start.position)
      ))];
    }
  },
  {
    is: (token, previousToken, isStart) => {
      let compare: boolean = false;

      if (token.type == "op") {
        if (token.value == ")" && previousToken?.value == "(") {
          if (token.start.line == previousToken.end.line && token.start.position - previousToken.end.position != 0) {
            compare = true;
          }
        }
        else if (token.value == "]" && previousToken?.value == "[") {
          if (token.start.line == previousToken.end.line && token.start.position - previousToken.end.position != 0) {
            compare = true;
          }
        }
        else if (token.value == "(" || token.value == ")" || token.value == "[" || token.value == "]" || token.value == ".") {
          if (previousToken) {
            if (previousToken.type == "id" || previousToken.type == "string" || previousToken.type == "int" || previousToken.type == "hex" || previousToken.type == "dollar_hex" || previousToken.type == "octal" || previousToken.type == "real" || previousToken.type == "lua" || previousToken.type == "mark") {
              if (token.start.line == previousToken.end.line && token.start.position - previousToken.end.position != 0) {
                compare = true;
              }
            }
          }
        }
      }

      return compare;
    },
    textEdits: (token, previousToken, isStart) => {
      return [vscode.TextEdit.delete(new vscode.Range(
        new vscode.Position(previousToken!.end.line, previousToken!.end.position),
        new vscode.Position(token.start.line, token.start.position)
      ))];
    }
  },
];

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
    
    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      const text = (lineText.text || '').split(/\/\/[^!]/)[0]; // 去除注释，避免注释导致换行, 但是保留 //! 注释

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
        if (/^.*function\s+interface.*$/.test(text)){
          // vjass 语法: function interface xxxx takes xxx returns xxx
          // 定义回调接口时，下一行不需要换行
          indent--;
        }
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
    if (!Options.isFormatv2) {
      console.time("format1");
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
      console.timeEnd("format1");
    } else {
      console.time("format2");
      try {
        reduceTokens(document.getText(), (token, previousToken, isStart) => {
          const option = formatOptions.find((option) => option.is(token, previousToken, isStart));
          
          if (option) {
            textEdits.push(...option.textEdits(token, previousToken, isStart));
          }
        });
        
      } catch (error) {
        console.error(error);
        
      }
      console.timeEnd("format2");
    }

    return textEdits;
  }

}

vscode.languages.registerDocumentFormattingEditProvider("jass", new DocumentFormattingSortEditProvider());
