import * as vscode from 'vscode';
// const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const language = "jass";

class Comment {
  public original: string = "";
  public content: string = "";
  public range: vscode.Range | null = null;
  public contentRange: vscode.Range | null = null;
}

class Global {

}

class Func {

}

class Import {

}

class TextMacro {
  public origin:string | null = null;
  public name:string | null = null;
  public takes:string[] = [];
  public content:string | null = null;
  public range:vscode.Range |null = null;
  public nameRange:vscode.Range |null = null;
}

class Library {

}

class Scope {

}

class Struct {

}

class Interface {

}

class ArrayType {

}

class Error {
  public name: string = "error";
  public message: string = "error";
  public range: vscode.Range | null = null;
  public uri: vscode.Uri | null = null;
}

/**
 * 全局塊
 * 方法
 * 如果開啓了vjass.enable
 * 文本宏塊
 * lib
 * scope
 * 結構塊
 * 接口塊
 * 運算符重載
 * 函數對象
 * 數組對象
 * 如果開啓了zinc
 * 未實現
 */
class Jass {
  public comments: Comment[] = new Array<Comment>();
  public filePath: string = "";
  public globals: Global[] = new Array<Global>();
  public imports: Import[] = new Array<Import>();
  public funcs: Func[] = new Array<Func>();
  public textMacros: TextMacro[] = new Array<TextMacro>();
  public librarys: Library[] = new Array<Library>();
  public scopes: Scope[] = new Array<Scope>();
  public structs: Struct[] = new Array<Struct>();
  public interfaces: Interface[] = new Array<Interface>();
  public arrayTypes: ArrayType[] = new Array<ArrayType>();
  public errors: Error[] = new Array<Error>();

  /**
   * 
   * @param uri j or ai 文件路徑
   */
  static parse(uri: string) {

  }

  static parseContent2(content: string): Jass {
    const content2Lines = () => {
      let lines: string[] = [];
      let col: string = "";
      for (let i = 0; i < content.length; i++) {
        const c: string = content.charAt(i);
        col += c;
        if (c == "\n") {
          lines.push(col);
          col = "";
        }
      }
      lines.push(col);
      return lines;
    }
    const lineTexts = content2Lines();
    /**
     * text macro -> scope -> library -> interface -> struct -> function -> global -> array object -> interface function -> import -> comment
     * text macro {all}
     * scope {scope, interface, struct, function, global, array object, interface function}
     * library {interface, struct, function, global, array object, interface function}
     * interface {function, global}
     * struct {function, global}
     * function{array object,interface function }
     * text macro -> //! text macro name takes 
     */
    const linesParse = () => {
      const starstWith = (text: string, match: string): boolean => text.trimLeft().startsWith(match);
      const blocks = [];
      let startLine = 0;
      let blockContent = [];
      let inTextMacro = false;
      let inInterface = false;
      let inScope = false;
      let inScopeField = 0;
      let inLibrary = false;
      let inStruct = false;
      let inFunction = false;
      let inGlobals = false;
      for (let i = 0; i < lineTexts.length; i++) {
        const lineText = lineTexts[i];
        if (inTextMacro) {
            blockContent.push(lineText);
          if (/^\s*\/\/!\s+endtextmacro/.test(lineText)) {
            blocks.push({ type: "textmacro", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inTextMacro = false;
          }
        } else if (inScope) {
          blockContent.push(lineText);
          if (/^\s*scope/.test(lineText)) {
            inScopeField++;
          } else if (/^\s*endscope/.test(lineText)) {
            inScopeField--;
            if (inScopeField == 0) {
              blocks.push({ type: "scope", content: blockContent, startLine, endLine: i });
              blockContent = [];
              inScope = false;
            }
          }
        } else if (inLibrary) {
          blockContent.push(lineText);
          if (/^\s*endlibrary/.test(lineText)) {
            blocks.push({ type: "library", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inLibrary = false;
          }
        } else if (inInterface) {
          blockContent.push(lineText);
          if (/^\s*endinterface/.test(lineText)) {
            blocks.push({ type: "interface", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inInterface = false;
          }
        }else if (inStruct) {
          blockContent.push(lineText);
          if (/^\s*endstruct/.test(lineText)) {
            blocks.push({ type: "struct", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inStruct = false;
          }
        } else if (inFunction) {
          blockContent.push(lineText);
          if (/^\s*endfunction/.test(lineText)) {
            blocks.push({ type: "function", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inFunction = false;
          }
        }else if (inGlobals) {
          blockContent.push(lineText);
          if (/^\s*endglobals/.test(lineText)) {
            blocks.push({ type: "globals", content: blockContent, startLine, endLine: i });
            blockContent = [];
            inGlobals = false;
          }
        } else {
          if (/^\s*\/\/!\s+textmacro/.test(lineText)) {
            inTextMacro = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          } else if (/^\s*scope/.test(lineText)) {
            inScope = true;
            inScopeField++;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          } else if (/^\s*library/.test(lineText)) {
            inLibrary = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          } else if (/^\s*interface/.test(lineText)) {
            inInterface = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          }
          else if (/^\s*struct/.test(lineText)) {
            inStruct = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          }else if (/^\s*function(?!\s+interface)/.test(lineText)) {
            inFunction = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          }else if (/^\s*globals/.test(lineText)) {
            inGlobals = true;
            startLine = i;
            blockContent = [];
            blockContent.push(lineText);
          }else if (/^\s*type/.test(lineText) && lineText.includes("extends") && lineText.includes("array")) {
            blocks.push({ type: "array_object", content: [lineText], startLine: i, endLine: i });
          }else if (/^\s*function\s+interface/.test(lineText)) {
            blocks.push({ type: "function_object", content: [lineText], startLine: i, endLine: i });
          }else if (/^\s*\/\/!\s+import/.test(lineText)) {
            blocks.push({ type: "import", content: [lineText], startLine: i, endLine: i });
          }else if (/^\s*\/\//.test(lineText)) {
            blocks.push({ type: "comment", content: [lineText], startLine: i, endLine: i });
          }else if(/^\s*native/.test(lineText) || /^\s*constant\s+native/.test(lineText)){
            blocks.push({ type: "native", content: [lineText], startLine: i, endLine: i });
          }else if(/^\s*type/.test(lineText)){
            blocks.push({ type: "type", content: [lineText], startLine: i, endLine: i });
          }
        }
      }
      return blocks;
    }
    const blockTexts = linesParse();
    // console.log(blockTexts)
    const blockParse = () => {
      const jass = new Jass;
      for (let i = 0; i < blockTexts.length; i++) {
        const contentBlock = blockTexts[i];
        if(contentBlock.type == "textmacro"){ // //! textmacro textmacro_name [takes takes_name1,takes_name2]
          const textMacro = new TextMacro();
          textMacro.origin = contentBlock.content.join("");
          textMacro.range = new vscode.Range(contentBlock.startLine, 0, contentBlock.endLine, contentBlock.content[contentBlock.content.length - 1].length);
          const nameRegExp = /textmacro\s+(?<name>[a-zA-Z]\w*)/;
          if(nameRegExp.test(contentBlock.content[0])){
            const result = nameRegExp.exec(contentBlock.content[0]);
            if(result){
              const groups = result.groups;
              if(groups){
                textMacro.name = groups.name;
                const nameIndex = contentBlock.content[0].indexOf(textMacro.name);
                textMacro.nameRange = new vscode.Range(contentBlock.startLine, nameIndex,contentBlock.startLine, nameIndex + textMacro.name.length);
              }
            }
          }
          if(!textMacro.name) continue; // 保证宏已被命名
          const takesRegExp = /takes\s+(?<takesContent>[a-zA-Z]\w*(?:\s*,\s*[a-zA-Z]\w*)*)/;
          if(takesRegExp.test(contentBlock.content[0])){
            const result = nameRegExp.exec(contentBlock.content[0]);
            if(result){
              const groups = result.groups;
              if(groups){
                textMacro.takes = groups.takesContent.split(/\s*,\s*/);
              }
            }
          }
          jass.textMacros.push(textMacro);
        }
      }
      return jass;
    }
    const letter = (char: string): boolean => ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].includes(char);
    const w = (char: string): boolean => letter(char) || "_" == char;
    const W = (char: string): boolean => !w(char);
    return blockParse();
  }

  static parseContent1(content: string): Jass {
    const jass = new Jass();
    if (vscode.workspace.getConfiguration().jass.vjass.support.enable || vscode.workspace.getConfiguration().jass.zinc.support.enable) { // 开启vjass支持
      if (vscode.workspace.getConfiguration().jass.vjass.support.enable) {

      }
    } else {

    }
    const isLatter = (char: string): boolean => ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].includes(char);
    const isSpace = (char: string): boolean => [" ", "\t"].includes(char);
    const isNewLine = (char: string): boolean => "\n" == char;

    let field: number = 0;
    let inLineComment: boolean = false; // 单行注释
    let inBlockComment: boolean = false; // 多行注释
    let inString: boolean = false; // 字符串
    let inLibrary: boolean = false; // 
    let inLibraryNaming = false;
    let libraryName: string | null = null;
    let inInitializer: boolean = false;
    let initializerNaming: boolean = false;
    let inScope: boolean = false; // 
    let inFunction: boolean = false; // 
    let inStruct: boolean = false; // 
    let inInterface: boolean = false; // 
    let inMethod: boolean = false; // 
    let inOperator: boolean = false; // 
    let inInterfaceFunction: boolean = false; // 
    let inTextMacros: boolean = false; // 

    let startLine: number = 0;
    let startCharacter: number = 0;

    let line: number = 0;
    let character: number = 0;
    let word: string = "";
    /*
    1=/
    2=//
    3=/*
    4=/** *
    5=/* *\/
    */
    let status: number = 0;
    for (let i = 0; i < content.length; i++) {
      const char = (index: number): string => content.charAt(index);
      const c = content.charAt(i);
      if (inLineComment == false && inBlockComment == false && inString == false && c == "/" && content.charAt(i - 1) == "/") {
        inLineComment = true;
      } else if (inLineComment == false && inBlockComment == false && inString == false && c == "*" && content.charAt(i - 1) == "/") {
        inBlockComment = true;
      } else if (inLineComment == false && inBlockComment == false && inString == false && c == '"') {
        inString = true;
      } else if (inLineComment && c == "\n") {
        inLineComment = false;
      } else if (inBlockComment && c == "*" && content.charAt(i + 1) == "/") {
        inBlockComment = false;
      } else if (inString && ((c == '"' && content.charAt(i - 1) == "\\") || c == "\n")) {
        inString = false;
      } else if (
        inLineComment == false &&
        inBlockComment == false &&
        inString == false &&
        inLibrary == false &&
        inScope == false &&
        inFunction == false &&
        inStruct == false &&
        inInterface == false &&
        inMethod == false &&
        inOperator == false &&
        inInterfaceFunction == false &&
        inTextMacros == false &&
        c == "y" &&
        char(i - 1) == "r" &&
        char(i - 2) == "a" &&
        char(i - 3) == "r" &&
        char(i - 4) == "b" &&
        char(i - 5) == "i" &&
        char(i - 6) == "l" &&
        isLatter(char(i - 7)) == false &&
        isLatter(char(i + 1)) == false) { // library
        inLibrary = true;
        console.log("inLibrary")
      } else if (
        inLibrary &&
        c == "y" &&
        char(i - 1) == "r" &&
        char(i - 2) == "a" &&
        char(i - 3) == "r" &&
        char(i - 4) == "b" &&
        char(i - 5) == "i" &&
        char(i - 6) == "l" &&
        char(i - 6) == "d" &&
        char(i - 6) == "n" &&
        char(i - 6) == "e") {

      }
      character++;
    }
    return jass;
  }
}

class DefaultCompletionItemProvider implements vscode.CompletionItemProvider {
  public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    try{
    const jass = Jass.parseContent2(document.getText());
    console.log(jass)
  }catch(err){console.log(err)}
    return [];
  }
}

vscode.languages.registerCompletionItemProvider(language, new DefaultCompletionItemProvider, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");