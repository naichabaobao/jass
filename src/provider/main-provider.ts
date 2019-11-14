import * as vscode from 'vscode';
// const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const language = "jass";

class JassUtils {
  static content2Lines = (content: string) => {
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
}

class Comment {
  public original: string = "";
  public content: string = "";
  public range: vscode.Range | null = null;
  public contentRange: vscode.Range | null = null;
}

enum Modifier {
  Private = "private",
  Public = "public",
  Common = "common"
}

class Global {
  public modifier: Modifier = Modifier.Common;
  public isConstant: boolean = false;
  public isArray: boolean = false;
  public type: string | null = null;
  public name: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public origin: string | null = null;

  static parse(content: string, startLine = 0) {
    const globals = new Array<Global>();
    const lines = JassUtils.content2Lines(content);
    let inGlobal = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*globals/.test(line)) {
        inGlobal = true;
      }
      if (/^\s*endglobals/.test(line)) {
        inGlobal = false;
      }
      if (inGlobal) {
        const globalRegExp = /^\s*((?<modifier>private|public)\s+)?(?<isConstant>constant\s+)?(?<type>[a-zA-Z]+)\s+(?<isArray>array\s+)?(?<name>[a-zA-Z]\w*)/;
        if (globalRegExp.test(line)) {
          const result = globalRegExp.exec(line);
          if (result) {
            const groups = result.groups;
            if (groups) {
              const global = new Global();
              if (groups.modifier == "public") {
                global.modifier = Modifier.Public;
              } else if (groups.modifier == "private") {
                global.modifier = Modifier.Private;
              }
              if (groups.isConstant) {
                global.isConstant = true;
              }
              global.type = groups.type
              if (groups.isArray) {
                global.isArray = true;
              }
              global.name = groups.name;
              global.range = new vscode.Range(startLine + i, line.indexOf(global.modifier), startLine + i, line.length);
              global.nameRange = new vscode.Range(startLine + i, line.indexOf(global.name), startLine + i, line.indexOf(global.name) + global.name.length);
              global.origin = `${global.modifier ? global.modifier + " " : ""}${global.isConstant ? "constant " : ""}${global.type} ${global.isArray ? "array " : ""}${global.name}`;
              globals.push(global);
            }
          }
        }
      }
    }
    return globals;
  }
}

class Param {
  public type: string | null = null;
  public name: string | null = null;
}

class Func {
  public origin: string | null = null;
  public modifier: Modifier = Modifier.Common;
  public name: string | null = null;
  public takes: Param[] = new Array<Param>();
  public returnType: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;

  static parse(content: string, startLine: number = 0) {
    const funcs = new Array<Func>();
    const lines = JassUtils.content2Lines(content);
    let inFunction = false;
    let functionBlocks = [];
    let functionStartLine = startLine;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*((private|public)\s+)?function/.test(line)) {
        // 解析方法
        inFunction = true;
        functionBlocks = [];
        functionStartLine = startLine + i;
      }
      if (inFunction) {
        functionBlocks.push(line);
      }
      if (/^\s*endfunction/.test(line)) {
        const functionHead = functionBlocks[0];
        const func = new Func();
        if (functionHead.includes("public")) {
          func.modifier = Modifier.Public;
        } else if (functionHead.includes("private")) {
          func.modifier = Modifier.Private;
        }
        const functionNameRegExp = /function\s+(?<name>[a-zA-Z]\w*)/;
        const nameResult = functionNameRegExp.exec(functionHead);
        if (nameResult && nameResult.groups && nameResult.groups.name) {
          func.name = nameResult.groups.name;
        }
        if (!func.name) continue;
        if (functionHead.includes("takes")) {
          if (/takes\s+nothing/.test(functionHead)) {
            func.takes = [];
          } else {
            // 截获参数字符串
            const takesContent = functionHead.substring(functionHead.indexOf("takes") + "takes".length, functionHead.includes("returns") ? functionHead.indexOf("returns") : undefined).trim();
            if (takesContent && takesContent.length > 0) {
              const takeContents: string[] = takesContent.split(/\s*,\s*/);
              const takes = takeContents.map(tc => {
                const tns = tc.split(/\s+/);
                const param = new Param();
                param.type = tns[0];
                param.name = tns[1];
                return param;
              }).filter(param => param.type && param.name); // filter保证类型和名称必须同时存在
              func.takes = takes;
            }
          }
        }
        if (functionHead.includes("returns")) {
          if (/returns\s+nothing/.test(functionHead)) {
            func.returnType = null;
          } else {
            const returnTypeRegExp = /returns\s+(?<returnType>[a-zA-Z]+)/;
            if (returnTypeRegExp.test(functionHead)) {
              const returnTypeResult = returnTypeRegExp.exec(functionHead);
              if (returnTypeResult && returnTypeResult.groups && returnTypeResult.groups.returnType) {
                func.returnType = returnTypeResult.groups.returnType;
              }
            }
          }
        }
        func.origin = `${func.modifier} function ${func.name} takes ${func.takes.length > 0 ? func.takes.map(take => take.type + " " + take.name).join(", ") : "nothing"} returns ${func.returnType ? func.returnType : "nothing"}\nendfunction`;
        func.range = new vscode.Range(functionStartLine, functionHead.indexOf(func.modifier), functionStartLine + functionBlocks.length - 1, functionBlocks[functionBlocks.length - 1].length);
        func.nameRange = new vscode.Range(functionStartLine, functionHead.indexOf(func.name), functionStartLine, functionHead.indexOf(func.name) + func.name.length);
        funcs.push(func);
        inFunction = false;
      }
    }
    return funcs;
  }
}

class Import {

}

class TextMacro {
  public origin: string | null = null;
  public name: string | null = null;
  public takes: string[] = [];
  public content: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
}

class Library {
  public origin: string | null = null;
  public name: string | null = null;
  public scopes: Scope[] = new Array<Scope>();
  public initializer: string | null = null;
  public needs: string[] = new Array<string>();
  public globals: Global[] = new Array<Global>();
  public functions: Func[] = [];
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
}

class Scope {
  public origin: string | null = null;
  public name: string | null = null;
  public scopes: Scope[] = new Array<Scope>();
  public initializer: string | null = null;
  public globals: Global[] = new Array<Global>();
  public functions: Func[] = [];
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;

  static parse(content: string, startLine = 0) {

    let inTextMacro = false;
    let inLibrary = false;
    let scopeField = 0;
    let inGlobals = false;
    let inFunction = false;

    let scopeContent: string = ""; // 当进入scope时赋值
    let scopeStartLine = 0;


    let innerScopeContent: string = "";
    let globalContent: string = "";
    let functionContent: string = "";

    const scopes = new Array<Scope>();


    const lines = JassUtils.content2Lines(content);
    let inScope = false;

    let scopeBlocks: string[] = [];
    let scopeInnerBlocks: string[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\s*\/\/!\s+textmacro/.test(line)) {
        inTextMacro = true;
      }
      if (/^\s*\/\/!\s+endtextmacro/.test(line)) {
        inTextMacro = false;
      }

      if (inTextMacro == false && /^\s*library/.test(line)) {
        inLibrary = true;
      }
      if (inTextMacro == false && /^\s*endlibrary/.test(line)) {
        inLibrary = false;
      }

      if (inTextMacro == false && inLibrary == false && /^\s*scope/.test(line)) {
        scopeField++;
        if (scopeField == 1) {
          scopeContent = line;
          scopeStartLine = i;
          // 解析scope
          const scope = new Scope();

          scopes.push(scope);
        }
      }
      if (inTextMacro == false && inLibrary == false && /^\s*endscope/.test(line)) {
        scopeField--;
        if (scopeField == 0) {
          // 设置范围
        }
      }
    }
    return scopes;
  }
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
    const lineTexts = JassUtils.content2Lines(content);
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
      const jass = new Jass();

      const last = function <T>(s: T[]): T | null {
        return s.length > 0 ? s[s.length - 1] : null;
      }

      let inTextMacro = false;  // 记录是否进入文本宏
      let textMacroBlocks = []; // 文本宏内容
      let textMacroStartLine = 0; // 文本宏开始行
      let inInterface = false;
      let interfaceBlocks = [];
      let interfaceStartLine = 0;
      let inScope = false;  // 是否进入域
      let scopeBlocks = []; // 域内容
      let scopeStartLine = 0; // 域开始行
      let inScopeField = 0; // 域深度
      let inLibrary = false;  // 是否进入库
      let libraryBlocks = []; // 库内容
      let libraryStartLine = 0; // 库开始行
      let inStruct = false;
      let structBlocks: string[] = [];
      let structStartLine = 0;
      let inFunction = false;
      let functionBlocks: string[] = [];
      let functionStartLine: number = 0;
      let inGlobals = false;
      let globalBlocks: string[] = [];
      let globalStartLine = 0;
      for (let i = 0; i < lineTexts.length; i++) {
        const lineText = lineTexts[i];
        if (/^\s*\/\/!\s+textmacro/.test(lineText)) {
          inTextMacro = true;
          const textMacro = new TextMacro();
          textMacro.name = "";
          textMacro.takes = [];
          textMacro.content = "";
          textMacro.range = null;
          textMacro.nameRange = null;
          textMacro.origin = "";
          jass.textMacros.push(textMacro);
        } else if (/^\s*\/\/!\s+endtextmacro/.test(lineText)) {
          inTextMacro = false;
        } else if (inTextMacro) {
          jass.textMacros[jass.textMacros.length - 1].content += lineText;
        } else if (/^\s*library/.test(lineText)) {
          inLibrary = true;
          const library = new Library();

          jass.librarys.push(library);
        } else if (/^\s*endlibrary/.test(lineText)) {
          inLibrary = false;
        } else if (inLibrary) {
          libraryBlocks.push(lineText);
        } else if (/^\s*scope/.test(lineText)) {
          inScopeField++;
          const lastScopes = (ss:Scope[]):Scope[] => {
            const s = last(ss);
            if(s){
              return lastScopes(s.scopes);
            }else {
              return ss;
            }
          }
          if (inLibrary) {
            const lib = last(jass.librarys);
            if(lib){
              const scopes = lastScopes(lib.scopes);

              scopes.push();
            }
          } else {
            const lib = last(jass.scopes);
            if(lib){
              const scopes = lastScopes(lib.scopes);

              scopes.push();
            }
          }
        } else if (/^\s*endscope/.test(lineText)) {
          inScopeField--;
          if (inScopeField == 0) {
            inScope = false;
          }
        }
        if (inScope) {
          scopeBlocks.push(lineText);

        }

        if (/^\s*interface/.test(lineText)) {
          inInterface = true;
          interfaceStartLine = i;
          interfaceBlocks = [];
        }
        if (inInterface) {
          interfaceBlocks.push(lineText);
          if (/^\s*endinterface/.test(lineText)) {
            blocks.push({ type: "interface", content: interfaceBlocks, startLine: interfaceStartLine, endLine: i });
            interfaceBlocks = [];
            inInterface = false;
          }
        }
        if (/^\s*struct/.test(lineText)) {
          inStruct = true;
          structStartLine = i;
          structBlocks = [];
        }
        if (inStruct) {
          structBlocks.push(lineText);
          if (/^\s*endstruct/.test(lineText)) {
            blocks.push({ type: "struct", content: structBlocks, startLine: structStartLine, endLine: i });
            structBlocks = [];
            inStruct = false;
          }
        }
        if (!inScope && !inLibrary && /^\s*function(?!\s+interface)/.test(lineText)) {
          inFunction = true;
          functionStartLine = i;
          functionBlocks = [];
        }
        if (inFunction) {
          functionBlocks.push(lineText);
          if (/^\s*endfunction/.test(lineText)) {
            blocks.push({ type: "function", content: functionBlocks, startLine: functionStartLine, endLine: i });
            functionBlocks = [];
            inFunction = false;
          }
        }
        if (/^\s*globals/.test(lineText)) {
          inGlobals = true;
          globalStartLine = i;
          globalBlocks = [];
        }
        if (inGlobals) {
          globalBlocks.push(lineText);
          if (/^\s*endglobals/.test(lineText)) {
            blocks.push({ type: "globals", content: globalBlocks, startLine: globalStartLine, endLine: i });
            globalBlocks = [];
            inGlobals = false;
          }
        }
        if (/^\s*type/.test(lineText) && lineText.includes("extends") && lineText.includes("array")) {
          blocks.push({ type: "array_object", content: [lineText], startLine: i, endLine: i });
        }
        if (/^\s*function\s+interface/.test(lineText)) {
          blocks.push({ type: "function_object", content: [lineText], startLine: i, endLine: i });
        }
        if (/^\s*\/\/!\s+import/.test(lineText)) {
          blocks.push({ type: "import", content: [lineText], startLine: i, endLine: i });
        }
        if (/^\s*\/\//.test(lineText)) {
          blocks.push({ type: "comment", content: [lineText], startLine: i, endLine: i });
        }
        if (/^\s*native/.test(lineText) || /^\s*constant\s+native/.test(lineText)) {
          blocks.push({ type: "native", content: [lineText], startLine: i, endLine: i });
        }
        if (/^\s*type/.test(lineText)) {
          blocks.push({ type: "type", content: [lineText], startLine: i, endLine: i });
        }

      }

      const starstWith = (text: string, match: string): boolean => text.trimLeft().startsWith(match);
      const blocks = [];

      for (let i = 0; i < lineTexts.length; i++) {
        const lineText = lineTexts[i];
        if (/^\s*\/\/!\s+textmacro/.test(lineText)) {
          inTextMacro = true;
          textMacroStartLine = i;
          textMacroBlocks = [];
        }
        if (inTextMacro) {
          textMacroBlocks.push(lineText);
          if (/^\s*\/\/!\s+endtextmacro/.test(lineText)) {
            blocks.push({ type: "textmacro", content: textMacroBlocks, startLine: textMacroStartLine, endLine: i });
            textMacroBlocks = [];
            inTextMacro = false;
          }
        } else {
          if (!inLibrary && /^\s*scope/.test(lineText)) {
            inScope = true;
            inScopeField++;
            if (!inScope) {
              scopeStartLine = i;
              scopeBlocks = [];
            }
          }
          if (inScope) {
            scopeBlocks.push(lineText);
            if (/^\s*endscope/.test(lineText)) {
              inScopeField--;
              if (inScopeField == 0) {
                blocks.push({ type: "scope", content: scopeBlocks, startLine: scopeStartLine, endLine: i });
                scopeBlocks = [];
                inScope = false;
              }
            }
          }
          if (/^\s*library/.test(lineText)) {
            inLibrary = true;
            libraryStartLine = i;
            libraryBlocks = [];
          }
          if (inLibrary) {
            libraryBlocks.push(lineText);
            if (/^\s*endlibrary/.test(lineText)) {
              blocks.push({ type: "library", content: libraryBlocks, startLine: libraryStartLine, endLine: i });
              libraryBlocks = [];
              inLibrary = false;
            }
          }
          if (/^\s*interface/.test(lineText)) {
            inInterface = true;
            interfaceStartLine = i;
            interfaceBlocks = [];
          }
          if (inInterface) {
            interfaceBlocks.push(lineText);
            if (/^\s*endinterface/.test(lineText)) {
              blocks.push({ type: "interface", content: interfaceBlocks, startLine: interfaceStartLine, endLine: i });
              interfaceBlocks = [];
              inInterface = false;
            }
          }
          if (/^\s*struct/.test(lineText)) {
            inStruct = true;
            structStartLine = i;
            structBlocks = [];
          }
          if (inStruct) {
            structBlocks.push(lineText);
            if (/^\s*endstruct/.test(lineText)) {
              blocks.push({ type: "struct", content: structBlocks, startLine: structStartLine, endLine: i });
              structBlocks = [];
              inStruct = false;
            }
          }
          if (!inScope && !inLibrary && /^\s*function(?!\s+interface)/.test(lineText)) {
            inFunction = true;
            functionStartLine = i;
            functionBlocks = [];
          }
          if (inFunction) {
            functionBlocks.push(lineText);
            if (/^\s*endfunction/.test(lineText)) {
              blocks.push({ type: "function", content: functionBlocks, startLine: functionStartLine, endLine: i });
              functionBlocks = [];
              inFunction = false;
            }
          }
          if (/^\s*globals/.test(lineText)) {
            inGlobals = true;
            globalStartLine = i;
            globalBlocks = [];
          }
          if (inGlobals) {
            globalBlocks.push(lineText);
            if (/^\s*endglobals/.test(lineText)) {
              blocks.push({ type: "globals", content: globalBlocks, startLine: globalStartLine, endLine: i });
              globalBlocks = [];
              inGlobals = false;
            }
          }
          if (/^\s*type/.test(lineText) && lineText.includes("extends") && lineText.includes("array")) {
            blocks.push({ type: "array_object", content: [lineText], startLine: i, endLine: i });
          }
          if (/^\s*function\s+interface/.test(lineText)) {
            blocks.push({ type: "function_object", content: [lineText], startLine: i, endLine: i });
          }
          if (/^\s*\/\/!\s+import/.test(lineText)) {
            blocks.push({ type: "import", content: [lineText], startLine: i, endLine: i });
          }
          if (/^\s*\/\//.test(lineText)) {
            blocks.push({ type: "comment", content: [lineText], startLine: i, endLine: i });
          }
          if (/^\s*native/.test(lineText) || /^\s*constant\s+native/.test(lineText)) {
            blocks.push({ type: "native", content: [lineText], startLine: i, endLine: i });
          }
          if (/^\s*type/.test(lineText)) {
            blocks.push({ type: "type", content: [lineText], startLine: i, endLine: i });
          }
        }
      }
      return blocks;
    }
    const blockTexts = linesParse();
    const blockParse = () => {
      const jass = new Jass;
      for (let i = 0; i < blockTexts.length; i++) {
        const contentBlock = blockTexts[i];

        if (contentBlock.type == "textmacro") { // //! textmacro textmacro_name [takes takes_name1,takes_name2]
          const textMacro = new TextMacro();
          textMacro.origin = contentBlock.content.join("");
          textMacro.range = new vscode.Range(contentBlock.startLine, 0, contentBlock.endLine, contentBlock.content[contentBlock.content.length - 1].length);
          const nameRegExp = /textmacro\s+(?<name>[a-zA-Z]\w*)/;
          if (nameRegExp.test(contentBlock.content[0])) {
            const result = nameRegExp.exec(contentBlock.content[0]);
            if (result) {
              const groups = result.groups;
              if (groups) {
                textMacro.name = groups.name;
                const nameIndex = contentBlock.content[0].indexOf(textMacro.name);
                textMacro.nameRange = new vscode.Range(contentBlock.startLine, nameIndex, contentBlock.startLine, nameIndex + textMacro.name.length);
              }
            }
          }
          if (!textMacro.name) continue; // 保证宏已被命名
          const takesRegExp = /takes\s+(?<takesContent>[a-zA-Z]\w*(?:\s*,\s*[a-zA-Z]\w*)*)/;
          if (takesRegExp.test(contentBlock.content[0])) {
            const result = nameRegExp.exec(contentBlock.content[0]);
            if (result) {
              const groups = result.groups;
              if (groups) {
                textMacro.takes = groups.takesContent.split(/\s*,\s*/);
              }
            }
          }
          jass.textMacros.push(textMacro);
        } else if (contentBlock.type == "scope") {

          const parseScope = (cc: { type: string, content: string[], startLine: number, endLine: number }) => {
            // 获取scope内部scope
            const scope = new Scope();
            scope.globals.push(...Global.parse(contentBlock.content.join(""), contentBlock.startLine));
            scope.functions.push(...Func.parse(blockTexts[i].content.join("")))
            let inScope = false;
            let inScopeField = 0;
            let scopeStartLine = 0;
            let scopeBlocks: string[] = [];
            let inGlobal = false;
            let inFunction = false;
            let functionStartLine = 0;
            let functionBlocks: string[] = [];
            // 分析首行
            const nameRegExp = /scope\s+(?<name>[a-zA-Z]\w*)/;
            if (nameRegExp.test(cc.content[0])) {
              const result = nameRegExp.exec(cc.content[0]);
              if (result) {
                const groups = result.groups;
                if (groups) {
                  scope.name = groups.name;
                  const nameIndex = cc.content[0].indexOf(scope.name);
                  scope.nameRange = new vscode.Range(cc.startLine, nameIndex, cc.startLine, nameIndex + scope.name.length);
                }
              }
            }
            if (!scope.name) return null; // scope未命名时放弃解析
            const initRegExp = /initializer\s+(?<initializer>[a-zA-Z]\w*)/;
            if (initRegExp.test(cc.content[0])) {
              const result = initRegExp.exec(cc.content[0]);
              if (result && result.groups) {
                if (result.groups.initializer) {
                  scope.initializer = result.groups.initializer;
                }
              }
            }
            // 分析scope内容
            for (let c = 1; c < content.length - 1; c++) {
              const element = cc.content[c];
              if (/^\s*scope/.test(element)) {
                inScope = true;
                inScopeField++;
                scopeStartLine = cc.startLine + c;
                scopeBlocks = [];
              }
              if (inScope) {
                scopeBlocks.push(element);
                if (/^\s*endscope/.test(element)) {
                  inScopeField--;
                  if (inScopeField == 0) {
                    const sco = parseScope({ type: "scope", content: scopeBlocks, startLine: scopeStartLine, endLine: cc.startLine + c });
                    if (sco) {
                      scope.scopes.push(sco);
                    }
                    scopeBlocks = [];
                    inScope = false;
                  }
                }
              } else {
                if (/^\s*globals/.test(element)) {
                  inGlobal = true;
                } else if (/^\s*endglobals/.test(element)) {
                  inGlobal = false;
                } else if (inGlobal) {

                } else {
                  console.log()
                }
              }
            }
            scope.origin = `scope ${scope.name}${scope.initializer ? " initializer " + scope.initializer : ""}\n${scope.globals.length > 0 ? "globals\n" + scope.globals.map(g => g.origin).join("\n") + "\nendglobals\n" : ""}${scope.functions.map(f => f.origin).join("\n")}\nendscope`;
            return scope;
          }
          // let scope = parseScope(contentBlock);
          // if (scope) {
          //   jass.scopes.push(scope);
          // }
          console.log(contentBlock.content.join(""))
          jass.scopes.push(...Scope.parse(contentBlock.content.join(""), contentBlock.startLine));
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
    try {
      const jass = Jass.parseContent2(document.getText());
      console.log(jass);
    } catch (err) { console.log(err) }
    return [];
  }
}

vscode.languages.registerCompletionItemProvider(language, new DefaultCompletionItemProvider, "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z");