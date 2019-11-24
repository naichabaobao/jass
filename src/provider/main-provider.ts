import * as vscode from 'vscode';
// const vscode = require("vscode");
// const fs = require("fs");
// const path = require("path");

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

enum MemberModifier {
  Private = "private",
  Public = "public",
  Static = "static"
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
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
}

class Local {
  public type: string | null = null;
  public name: string | null = null;
  public isArray: boolean = false;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
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

class Member {
  public modifier: MemberModifier = MemberModifier.Private;
  public type: string | null = null;
  public name: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public origin: string | null = null;
}

class Method {
  public name: string | null = null;
  public takes: Param[] = new Array<Param>();
  public returnType: string | null = null;
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public origin: string | null = null;
}

class Struct {
  public name: string | null = null;
  public extends: string | null = null;
  public members: Member[] = new Array<Member>();
  public methods: Method[] = new Array<Method>();
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public origin: string | null = null;
}

class Interface {
  public name: string | null = null;
  public members: Member[] = new Array<Member>();
  public methods: Method[] = new Array<Method>();
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public origin: string | null = null;
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

      const findScopes = (scopes: Scope[], deep: number): Scope[] => {
        if (deep > 1) {
          let s = scopes;
          for (let d = 1; d < deep; d++) {
            s = s[s.length - 1].scopes;
          }
          return s;
        } else {
          return scopes;
        }
      }

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
        } else if (/^\s*library/.test(lineText) && inScopeField == 0) { // 保证lib不被包含再scope中
          inLibrary = true;
          const library = new Library();

          jass.librarys.push(library);
        } else if (/^\s*endlibrary/.test(lineText)) {
          inLibrary = false;
        } else if (inLibrary) {
          libraryBlocks.push(lineText);
        } else if (/^\s*scope/.test(lineText)) {
          inScopeField++;
          /**
           * 解析scope头部
           */
          const parseScopeHead = (): Scope => {
            // 分析首行
            const scope = new Scope();
            const nameRegExp = /scope\s+(?<name>[a-zA-Z]\w*)/;
            if (nameRegExp.test(lineText)) {
              const result = nameRegExp.exec(lineText);
              if (result) {
                const groups = result.groups;
                if (groups) {
                  scope.name = groups.name;
                  scope.start = new vscode.Position(i, lineText.indexOf("scope"));
                  const nameIndex = lineText.indexOf(scope.name);
                  scope.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + scope.name.length);
                }
              }
            }
            if (!scope.name) return scope; // scope未命名时返回空scope
            const initRegExp = /initializer\s+(?<initializer>[a-zA-Z]\w*)/;
            if (initRegExp.test(lineText)) {
              const result = initRegExp.exec(lineText);
              if (result && result.groups) {
                if (result.groups.initializer) {
                  scope.initializer = result.groups.initializer;
                }
              }
            }
            return scope;
          }
          const scopes = inLibrary ? findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField) : findScopes(jass.scopes, inScopeField);
          scopes.push(parseScopeHead());
        } else if (/^\s*endscope/.test(lineText)) {
          const scopes = inLibrary ? findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField) : findScopes(jass.scopes, inScopeField);
          const scope = scopes[scopes.length - 1];
          const EndscopeKeyword = "endscope";
          scope.end = new vscode.Position(i, lineText.indexOf(EndscopeKeyword) + EndscopeKeyword.length);
          scope.origin = `scope ${scope.name ? scope.name : ""}${scope.initializer ? " initializer " + scope.initializer : ""}\n
            globals\n
            ${scope.globals.map(global => global.origin).join("\n")}
            endglobals\n
            ${scope.functions.map(func => func.origin).join("\n")}
            ${scope.scopes.map(scp => scp.origin).join("\n")}
          endscope`;
          if (inScopeField > 0) {
            inScopeField--;
          }
        } else if (/^\s*interface/.test(lineText)) {
          const inter = new Interface();
          const nameRegExp = new RegExp(/interface\s+(?<name>[a-zA-Z][a-zA-Z\d]*)\b/);
          if (nameRegExp.test(lineText)) {
            const result = nameRegExp.exec(lineText);
            if (result && result.groups && result.groups.name) {
              inter.name = result.groups.name;
              inter.nameRange = new vscode.Range(i, lineText.indexOf(inter.name), i, lineText.indexOf(inter.name) + inter.name.length);
            }
          }
          inter.start = new vscode.Position(i, lineText.indexOf("interface"));
          inInterface = true;
        } else if (/^\s*endinterface/.test(lineText)) {
          const inter = jass.interfaces[jass.interfaces.length - 1];
          if (inter) {
            if (lineText.includes("endinterface")) {
              inter.end = new vscode.Position(i, lineText.indexOf("endinterface"));
            }
            inter.origin = `interface\n
  
            endinterface`;
          }
          inInterface = false;
        } else if (/^\s*struct/.test(lineText)) {
          const struct = new Struct();
          const nameRegExp = new RegExp(/struct\s+(?<name>[a-zA-Z][a-zA-Z\d]*)\b/);
          if (nameRegExp.test(lineText)) {
            const result = nameRegExp.exec(lineText);
            if (result && result.groups && result.groups.name) {
              struct.name = result.groups.name;
              struct.start = new vscode.Position(i, lineText.indexOf(struct.name));
              struct.nameRange = new vscode.Range(i, lineText.indexOf(struct.name), i, lineText.indexOf(struct.name) + struct.name.length);
            }
          }
          const extendsRegExp = new RegExp(/extends\s+(?<extends>[a-zA-Z][a-zA-Z\d]*)/);
          if (extendsRegExp.test(lineText)) {
            const result = extendsRegExp.exec(lineText);
            if (result && result.groups && result.groups.extends) {
              struct.extends = result.groups.extends;
            }
          }
          struct.start = new vscode.Position(i, lineText.indexOf("struct"));
          jass.structs.push(struct);
          inStruct = true;
        } else if (/^\s*endstruct/.test(lineText)) {
          if (inStruct) {
            console.log(jass.structs)
            const struct = jass.structs[jass.structs.length - 1];
            struct.end = new vscode.Position(i, lineText.indexOf("endstruct"));
            struct.origin = `struct\n
              
            endstruct`;
          }
          inStruct = false;
        } else if (/^\s*function(?!\s+interface)/.test(lineText) || /^\s*private\s+function/.test(lineText) || /^\s*public\s+function/.test(lineText)) {
          const func = new Func();
          if (lineText.includes("private")) {
            func.modifier = Modifier.Private;
          } else if (lineText.includes("public")) {
            func.modifier = Modifier.Public;
          } else {
            func.modifier = Modifier.Common;
          }
          const nameRegExp = new RegExp(/function\s+(?<name>[a-zA-Z]\w*)/);
          if (nameRegExp.test(lineText)) {
            const result = nameRegExp.exec(lineText);
            if (result && result.groups && result.groups.name) {
              func.name = result.groups.name;
              func.nameRange = new vscode.Range(i, lineText.indexOf(func.name), i, lineText.indexOf(func.name) + func.name.length);
            }
          }
          if (!/takes\s+nothing/.test(lineText)) {
            const takesRegExp = new RegExp(/takes\s+(?<takeString>[a-zA-Z]+\s+[a-zA-Z]\w*(\s*,\s*[a-zA-Z]+\s+[a-zA-Z]\w*)*)/);
            const takesString = lineText.includes("returns") ? lineText.substring(0, lineText.indexOf("returns")) : lineText;
            if (takesRegExp.test(takesString)) {
              const result = takesRegExp.exec(takesString);
              if (result && result.groups && result.groups.takeString) {
                const takeString = result.groups.takeString;
                const takesStrings = takeString.split(/\s*,\s*/);
                const takes = takesStrings.map(t => {
                  const takeTypeName = t.trim().split(/\s+/);
                  const param = new Param();
                  param.type = takeTypeName[0];
                  param.name = takeTypeName[1];
                  return param;
                });
                func.takes = takes;
              }
            }
          }
          const returnsRegexp = new RegExp(/returns\s+(?<returnsType>[a-zA-Z]+)/);
          if (returnsRegexp.test(lineText)) {
            const result = returnsRegexp.exec(lineText);
            if (result && result.groups && result.groups.returnType) {
              func.returnType = result.groups.returnType;
            }
          }
          func.start = new vscode.Position(i, lineText.includes("private") ? lineText.indexOf("private") : lineText.includes("public") ? lineText.indexOf("public") : lineText.includes("function") ? lineText.indexOf("function") : 0);
          if (func.modifier == Modifier.Private || func.modifier == Modifier.Public) { // 有修饰符时
            if (inLibrary) {
              if (inScopeField > 0) {
                const scopes = findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField);
                scopes[scopes.length - 1].functions.push(func);
              } else {
                jass.librarys[jass.librarys.length - 1].functions.push(func);
              }
            } else if (inScopeField > 0) {
              const scopes = findScopes(jass.scopes, inScopeField);
              scopes[scopes.length - 1].functions.push(func);
            }
          } else {
            if (inLibrary) {
              const lib = jass.librarys[jass.librarys.length - 1];
              if (lib.initializer == func.name) {
                lib.functions.push(func);
              } else {
                jass.funcs.push(func);
              }
            } else {
              jass.funcs.push(func);
            }
          }
          inFunction = true;
        } else if (/^\s*endfunction/.test(lineText)) {
          if (inFunction) {
            const end = new vscode.Position(i, lineText.indexOf("endfunction") + "endfunction".length);
            if (inLibrary) {
              if (inScopeField > 0) {
                const lib = jass.librarys[jass.librarys.length - 1];
                const scopes = findScopes(lib.scopes, inScopeField);
                scopes[scopes.length - 1].end = end;
              } else {
                jass.librarys[jass.librarys.length - 1].end = end;
              }
            } else if (inScopeField > 0) {
              const scopes = findScopes(jass.scopes, inScopeField);
              scopes[scopes.length - 1].end = end;
            } else {
              jass.funcs[jass.funcs.length - 1].end = end;
            }
            inFunction = false;
          }
        } else if (/^\s*local/.test(lineText)) {
          if (inFunction) {
            const local = new Local();
            const functionRegExp = new RegExp(/local\s+(?<type>[a-zA-Z]+)(\s+(?<hasArray>array))?\s+(?<name>[a-zA-Z]\w*)/);
            if (functionRegExp.test(lineText)) {
              const result = functionRegExp.exec(lineText);
              if (result && result.groups) {
                if (result.groups.type) {
                  local.type = result.groups.type;
                }
                if (result.groups.name) {
                  local.name = result.groups.name;
                  local.nameRange = new vscode.Range(i, lineText.indexOf(local.name), i, lineText.indexOf(local.name) + local.name.length);
                }
                if (result.groups.hasArray) {
                  local.isArray = true; 
                }
              } 
            }
            local.range = new vscode.Range(i, lineText.indexOf("local"), i, lineText.length);
          }
        } else if (/^\s*globals/.test(lineText)) {
          inGlobals = true;
        } else if (/^\s*endglobals/.test(lineText)) {
          inGlobals = false;
        } else if ((/^\s*private/.test(lineText) || /^\s*public/.test(lineText) || /^\s*constant/.test(lineText)) && inGlobals) {
          console.log("global")
          const global = new Global();
          if (lineText.includes("constant")) {
            global.isConstant = true;
            const typeRegExp = new RegExp(/constant\s+(?<type>[a-zA-Z]+)/);
            if (typeRegExp.test(lineText)) {
              const result = typeRegExp.exec(lineText);
              if (result && result.groups && result.groups.type) {
                global.type = result.groups.type;
              }
            }
          }
          if (lineText.includes("public")) {
            global.modifier = Modifier.Public;
            if (!global.isConstant) {
              const typeRegExp = new RegExp(/public\s+(?<type>[a-zA-Z]+)/);
              if (typeRegExp.test(lineText)) {
                const result = typeRegExp.exec(lineText);
                if (result && result.groups && result.groups.type) {
                  global.type = result.groups.type;
                }
              }
            }
          }
          if (lineText.includes("private")) {
            global.modifier = Modifier.Private;
            if (!global.isConstant) {
              const typeRegExp = new RegExp(/private\s+(?<type>[a-zA-Z]+)/);
              if (typeRegExp.test(lineText)) {
                const result = typeRegExp.exec(lineText);
                if (result && result.groups && result.groups.type) {
                  global.type = result.groups.type;
                }
              }
            }
          }
          if (lineText.includes("array")) {
            global.isArray = true;
          }
          if(global.modifier == Modifier.Common && !global.isConstant){
            // 若果无修饰符,默认会把第一个单词当成type
            const typeRegExp = new RegExp(/(?<type>[a-zA-Z]+)/);
            if (typeRegExp.test(lineText)) {
              const result = typeRegExp.exec(lineText);
              if (result && result.groups && result.groups.type) {
                global.type = result.groups.type;
              }
            }
          }
          if(global.type){
            const nameRegExp = global.isArray ? new RegExp(`${global.type}\\s+array\\s+(?<name>[a-zA-Z]\\w*)`) : new RegExp(`${global.type}\\s+(?<name>[a-zA-Z]\\w*)`);
            if (nameRegExp.test(lineText)) {
              const result = nameRegExp.exec(lineText);
              if (result && result.groups && result.groups.name) {
                global.type = result.groups.name;
              }
            }
          }
          if(global.modifier == Modifier.Common){
            jass.globals.push(global);
          }else {
            if(inLibrary){
              if(inScopeField > 0){
                const scopes = findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField);
                const scope = scopes[scopes.length - 1];
                if(scope){
                  scope.globals.push(global);
                }
              }else{
                jass.librarys[jass.librarys.length - 1].globals.push(global);
              }
            }else if(inScopeField > 0){
              const scopes = findScopes(jass.scopes, inScopeField);
              const scope = scopes[scopes.length - 1];
              if(scope){
                scope.globals.push(global);
              }
            }
          }
        } else if (/^\s*type/.test(lineText) && lineText.includes("extends") && lineText.includes("array")) {
        } else if (/^\s*function\s+interface/.test(lineText)) {
        } else if (/^\s*\/\/!\s+import/.test(lineText)) {
        } else if (/^\s*\/\//.test(lineText)) {
        }
        if (/^\s*native/.test(lineText) || /^\s*constant\s+native/.test(lineText)) {
        }
        if (/^\s*type/.test(lineText)) {
        }
      }
      return jass;
    }
    const letter = (char: string): boolean => ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].includes(char);
    const w = (char: string): boolean => letter(char) || "_" == char;
    const W = (char: string): boolean => !w(char);
    return linesParse();
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