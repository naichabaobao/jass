import * as path from "path";
import * as vscode from "vscode";

import { parse, ProgramBlock } from "../jass/parsing";
import { Options } from "./options";


type TagType = "function" | "endfunction" | "globals" | "endglobals" | "native" | "constant" | "type" | "local" | "set" | "call" | "if" | "endif" | "else" | "elseif" | "loop" | "exitwhen" | "endloop" | "return"
  | "library" | "endlibrary" | "private" | "public" | "static" | "blank" | "unkown";

interface Desc {
  text: string;
}



class Line {
  private _loc: vscode.Range;
  private _text: string;

  constructor(lineNumber: number, text: string) {
    this._text = text;
    this._loc = new vscode.Range(lineNumber, 0, lineNumber, text.length);
  }

  public get lineNumber(): number {
    return this._loc.start.line;
  }

  public get text(): string {
    return this._text;
  }

  public get length(): number {
    return this._text.length;
  }

  public get isBlank() {
    return this._text.trimStart() == "";
  }

  public get loc() {
    return this._loc;
  }

}

class LineComment {
  public readonly line: number;
  public readonly content: string;

  constructor(line: number, content: string) {
    this.line = line;
    this.content = content;
  }

}

class _ZincBlock {
  public loc: vscode.Range;
  public lines: Array<Line>;
  public startLineComment: LineComment;
  public endLineComment: LineComment | null;

  constructor(loc: vscode.Range, lines: Array<Line>, startLineComment: LineComment, endLineComment: LineComment | null = null) {
    this.loc = loc;
    this.lines = lines;
    this.startLineComment = startLineComment;
    this.endLineComment = endLineComment;
  }

}

class Program {
  private static _programs: Array<Program> = [];


  private _key: string;
  private _zincBlocks: Array<_ZincBlock> = [];

  // 目前暂且把 //! 开头的注释保存在类中，之后实现中应该用完就扔掉，免得占用内存
  private _usefulLineComments: Array<LineComment> = [];

  constructor(key: string, content: string) {
    this._key = key; // this._convertKey(key);
    console.info(`开始处理${this._key}文件!`);
    const result = this._removeBlockComment(content);

    const lineTexts = this._toLines(result.content);

    this._findZincBlock(lineTexts);

    this._handle(lineTexts, result.comments);

    // 清空内存
    result.comments.clear();

    this._handelZinc();

    this._handleZinc2();

  }

  private _convertKey(key: string) {
    if (key.trimStart() == "") {
      throw " illegality key!";
    }
    return path.resolve(key);
  }

  /**
   * @deprecated 
   */
  public readonly programBlocks: ProgramBlock[] = [];
  public get zincFunctions() {
    return this.programBlocks.map(x => x.functionDeclarators()).flat().map(x => {
      return new Func(x.id ?? "", x.takes.map(take => new Take(take.type ?? "nothing", take.id)), x.returns);
    });
  }

  /**
   * @deprecated
   * @returns 
   */
  private _handelZinc() {
    if (!Options.supportZinc) {
      return;
    }
    this._zincBlocks.forEach(block => {
      try {
        const content = block.lines.map(x => x.text).join("\n");
        const programBlock = parse(content);
        programBlock.fileName = this._key;
        this.programBlocks.push(programBlock);
      } catch (err) {
        throw err;
      }
    });
  }

  public readonly zincStructs: Struct[] = [];

  /**
   * _handelZinc为过去实现
   * _handleZinc2为最新实现，逐步使用当前方法替换掉_handelZinc
   */
  private _handleZinc2() {
    // 目前尝试实现struct和method
    this._zincBlocks.forEach(block => {
      const content = block.lines.map(x => x.text).join("\n");
      // 强制正确嵌套，否则无法匹配
      const structRegExp = new RegExp(/struct\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)\s*\{(?<body>(?:[^{}]*\{?[^{}]*\}[^{}]*)*)\}?/);
      const handleStruct = (text: string) => {
        const result = structRegExp.exec(text);
        if (result) {
          return result;
        } else return null;
      }
      const structMethodRegExp = new RegExp(/method\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(\s*\(\s*(?<takes>([a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)(\s*,\s*[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)*)?\s*\))?(\s*->\s*(?<returns>[a-zA-Z][a-zA-Z0-9_]*))?/);
      const handleStructMethod = (text: string) => {
        const result = structMethodRegExp.exec(text);
        if (result) {
          return result;
        } else return null;
      }
      for (let result: RegExpExecArray | null = null, index = 0; index < content.length;) {
        // console.log(result ? content.substring(index) : content)
        result = handleStruct(result ? content.substring(index) : content)
        if (result && result.groups) {
          const struct = new Struct(result.groups["name"]);
          this.zincStructs.push(struct);
          const body = result.groups["body"];
          for (let rs: RegExpExecArray | null = null, i = 0; i < content.length;) {
            rs = handleStructMethod(rs ? body.substring(i) : body)
            if (rs && rs.groups) {
              const takeString = rs.groups["takes"];
              const takes = takeString ? this.takeStringToTakes(takeString) : [];
              const returns = rs.groups["returns"];
              const method = new Method(rs.groups["name"], takes, returns ?? null);
              struct.methods.push(method);
            } else break;
            i += rs[0].length;
          }
        } else break;
        index += result[0].length;
      }

    });
  }

  private _isNewLine(char: string) {
    if (char.length == 1) return char == "\n"; // new RegExp(/\r\n|\n/).test(char);
    else return false;
  }

  /**
   * 替换注释保留换行符
   * @param text 
   * @param startIndex 
   * @param endIndex 
   * @param char 
   * @returns 
   */
  private _replace(text: string, startIndex: number, endIndex: number, char: string = " ") {
    if (endIndex <= startIndex) {
      throw "endIndex <= startIndex";
    }

    text.replace(/.+/, (reg, match) => {
      console.log(reg)
      console.log(match)
      return "";
    })

    function replaceContent(content: string) {
      if (content.length == 0) {
        return content;
      }
      return content.split("\n").map(x => "".padStart(x.length, char)).join("\n");
    }
    let preText = text.substring(0, startIndex) + replaceContent(text.substring(startIndex, endIndex + 1));
    if (endIndex + 1 < text.length) {
      preText += text.substring(endIndex + 1, text.length);
    }
    return preText;
  }

  /**
   * 移除块注释和单行注释（不支持嵌套的块注释识别）
   * 有用的单行注释会保存在_usefulLineComments
   * @param content 
   * @returns 
   */
  private _removeBlockComment(content: string) {
    let status = 0;
    let blockStart = 0;

    let line = 0;

    let isStag = true;
    let useless = false;

    // const comments:Array<LineComment> = [];
    const map = new Map<number, string>();

    const lineCommentOver = (start: number, end: number) => {
      const text = content.substring(start, end + 1);
      if (!useless) {
        if (/\s*\/\/!/.test(text)) {
          this._usefulLineComments.push(new LineComment(line, text));
        } else if (/\s*\/\//.test(text)) {
          map.set(line, text.replace("//", ""));
        }
      }
      content.replace(text, "".padStart(text.length, " "));
      // else content = this._replace(content, start, end);
    }
    const len = content.length;
    for (let index = 0; index < len; index++) {
      const char = content.charAt(index)
      if (status == 0) {
        if (char == "/") {
          status = 1;
          blockStart = index;
          if (isStag) {
            useless = false;
          } else {
            useless = true;
          }
        } else if (char == "\"") {
          status = 5;
        }
      } else if (status == 1) {
        if (char == "*") {
          status = 2;
        } else if (char == "/") {
          status = 3;
        } else {
          status = 0;
        }
      } else if (status == 2) {
        if (char == "*") {
          status = 4;
        }
      } else if (status == 3) {
        if (this._isNewLine(char)) { // 行注释结束
          status = 0;
          lineCommentOver(blockStart, index);
        }
      } else if (status == 4) {
        if (char == "/") { // 块注释结束
          status = 0;
          content = this._replace(content, blockStart, index);
        } else {
          status = 2;
        }
      } else if (status == 5) {
        if (char == "\"") { // 字符串结束
          status = 0;
        } else if (char == "\\") { //字符串进入转义状态
          status = 6;
        } else if (this._isNewLine(char)) { // 字符串结束
          status = 0;
        }
      } else if (status == 6) {
        if (this._isNewLine(char)) { // 字符串结束
          status = 0;
        } else { // 从新回到字符串状态
          status = 5;
        }
      }
      if (this._isNewLine(char)) {
        isStag = true;
        line++;
      } else if (char != " " && char != "\t") {
        isStag = false;
      }
    }
    if (status == 2 || status == 4) { // 未闭合块注释
      content = this._replace(content, blockStart, content.length - 1);
    } if (status == 3) { // 行注释结束
      lineCommentOver(blockStart, content.length - 1);
    }
    return { content, comments: map };
  }

  private _toLines(content: string) {
    const lines = content.split("\n");
    const lineTexts = lines.map((line, index) => {
      return new Line(index, line);
    });
    return lineTexts;
  }

  /**
   * 获取zinc块，并移除注释
   * 若果zinc块没有闭合情况下，直接删除注释
   * @param lineTexts 
   * @returns 
   */
  private _findZincBlock(lineTexts: Array<Line>) {
    let inBlock = false;
    let startLineComment: LineComment | null = null;
    for (let index = 0; index < this._usefulLineComments.length;) {
      const usefulLineComment = this._usefulLineComments[index];
      if (/^\s*\/\/![ \t]+zinc\b/.test(usefulLineComment.content)) {
        if (!startLineComment) {
          startLineComment = usefulLineComment;
        }
        this._usefulLineComments.splice(index, 1);
        inBlock = true;
      } else if (/^\s*\/\/![ \t]+endzinc\b/.test(usefulLineComment.content)) {
        if (inBlock) {
          const lines: Line[] = [];
          for (let i = 0; i < lineTexts.length;) {
            const lineText = lineTexts[i];
            if (lineText.lineNumber > (<LineComment>startLineComment).line && lineText.lineNumber < usefulLineComment.line) {
              lines.push(lineText);
              lineTexts.splice(i, 1);
            } else {
              i++
            }
          }
          const zincBlock = new _ZincBlock(new vscode.Range((<LineComment>startLineComment).line, 0, usefulLineComment.line, 0), lines, (<LineComment>startLineComment), usefulLineComment);
          this._zincBlocks.push(zincBlock);
        }
        this._usefulLineComments.splice(index, 1);
        inBlock = false;
      } else {
        index++;
      }
    }
  }


  public get usefulLineComments(): Array<LineComment> {
    return this._usefulLineComments;
  }

  public readonly types: ArrayType[] = [];
  public readonly natives: Native[] = [];
  public readonly functions: Func[] = [];
  public readonly globals: Global[] = [];
  public readonly librarys: Library[] = [];
  public readonly scopes: Scope[] = [];
  public readonly structs: Struct[] = [];

  private get lastLibrary() {
    return this.librarys[this.librarys.length - 1];
  }

  private _handle(lines: Array<Line>, comments: Map<number, string>) {
    let inGlobals = false;
    let inFunc = false;
    let inMethod = false;
    let inLibrary = false;
    let scopeField = 0;
    let inStruct = false;

    const getScopes = (scopes: Scope[], f: number) => {
      let field = 0;
      function get(ss: Scope[]): Scope[] {
        if (field == f) {
          return ss;
        } else {
          field++;
          return get(ss[ss.length - 1].scopes);
        }
      }
      return get(scopes);
    }
    const getScope = (scopes: Scope[], f: number) => {
      let field = 1;
      const get = (ss: Scope): Scope => {
        if (field >= f) {
          return ss;
        } else {
          field++;
          return get(ss.scopes[ss.scopes.length - 1]);
        }
      }
      return get(scopes[scopes.length - 1]);
    }
    const funcHandle = (func: Func) => {
      if (inLibrary) {
        if (scopeField > 0) {
          // const scopes = getScopes(this.lastLibrary.scopes, scopeField);
          getScope(this.lastLibrary.scopes, scopeField).functions.push(func);
        } else {
          this.lastLibrary.functions.push(func);
        }
      } else if (scopeField > 0) {
        // const scopes = getScopes(this.scopes, scopeField);
        getScope(this.scopes, scopeField).functions.push(func);
      } else {
        this.functions.push(func);
      }
    }
    const structHandle = (struct: Struct) => {
      if (inLibrary) {
        if (scopeField > 0) {
          // const scopes = getScopes(this.lastLibrary.scopes, scopeField);
          getScope(this.lastLibrary.scopes, scopeField).structs.push(struct);
        } else {
          this.lastLibrary.structs.push(struct);
        }
      } else if (scopeField > 0) {
        // const scopes = getScopes(this.scopes, scopeField);
        getScope(this.scopes, scopeField).structs.push(struct);
      } else {
        this.structs.push(struct);
      }
    }
    const structMethodHandle = (method: Method) => {
      if (inLibrary) {
        if (scopeField > 0) {
          // const scopes = getScopes(this.lastLibrary.scopes, scopeField);
          const structs = getScope(this.lastLibrary.scopes, scopeField).structs;
          const struct = structs[structs.length - 1];
          struct.methods.push(method);
        } else {
          const structs = this.lastLibrary.structs;
          const struct = structs[structs.length - 1];
          struct.methods.push(method);
        }
      } else if (scopeField > 0) {
        // const scopes = getScopes(this.scopes, scopeField);
        const structs = getScope(this.scopes, scopeField).structs;
        const struct = structs[structs.length - 1];
        struct.methods.push(method);
      } else {
        const structs = this.structs;
        const struct = structs[structs.length - 1];
        struct.methods.push(method);
      }
    }
    const descHandle = (line: Line, desc: Desc) => {
      if (comments.has(line.loc.start.line - 1)) {
        desc.text = <string>comments.get(line.loc.start.line - 1);
      }
      // const commentTarget = comments.find(comment => comment.line == line.loc.start.line - 1);
      // if (commentTarget) {
      //   desc.text = commentTarget.content;
      // }
    }
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (/^\s*type\b/.test(line.text)) {
        const type = this._handleType(line.text);
        if (type) {
          this.types.push(type);
          descHandle(line, type);
        }
      } else if (/^\s*native\b/.test(line.text)) {
        const native = <Native>this._handleNative(line.text, FunctionOption.native(false));
        if (native) {
          this.natives.push(native);
          descHandle(line, native);
        }
      } else if (/^\s*constant\s+native\b/.test(line.text)) {
        const native = <Native>this._handleNative(line.text, FunctionOption.native(true));
        if (native) {
          this.natives.push(native);
          descHandle(line, native);
        }
      } else if (/^\s*function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func());
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*private\s+function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func("private"));
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*public\s+function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func("public"));
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*static\s+function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func("default", true));
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*public\s+static\s+function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func("public", true));
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*private\s+static\s+function\b/.test(line.text)) {
        inGlobals = false;
        inFunc = true;
        const func = <Func>this._handleNative(line.text, FunctionOption.func("private", true));
        if (func) {
          funcHandle(func);
          descHandle(line, func);
        }
      } else if (/^\s*endfunction\b/.test(line.text)) {
        inFunc = false;
      } else if (/^\s*globals\b/.test(line.text)) {
        inGlobals = true;
      } else if (/^\s*endglobals\b/.test(line.text)) {
        inGlobals = false;
      } else if (/^\s*library\b/.test(line.text)) {
        const library = this._handleLibrary(line.text) ?? new Library("");
        this.librarys.push(library);
        descHandle(line, library);
        inLibrary = true;
        inGlobals = false;
        inFunc = false;
        scopeField = 0;
        inStruct = false;
      } else if (/^\s*endlibrary\b/.test(line.text)) {
        inLibrary = false;
        inGlobals = false;
        inFunc = false;
        scopeField = 0;
        inStruct = false;
      } else if (/^\s*scope\b/.test(line.text)) {
        const scope = this._handleScope(line.text) ?? new Scope("");
        if (inLibrary) {
          getScopes(this.lastLibrary.scopes, scopeField).push(scope);
        } else {
          getScopes(this.scopes, scopeField).push(scope);
        }
        scopeField++;
        inGlobals = false;
        inFunc = false;
        inStruct = false;
      } else if (/^\s*endscope\b/.test(line.text)) {
        if (scopeField > 0) {
          scopeField--;
        }
        inGlobals = false;
        inFunc = false;
        inStruct = false;
      } else if (/^\s*struct\b/.test(line.text)) {
        const struct = this._handleStruct(line.text) ?? new Struct("");
        structHandle(struct);
        descHandle(line, struct);
        inStruct = true;
        inGlobals = false;
        inFunc = false;
      } else if (/^\s*endstruct\b/.test(line.text)) {
        inStruct = false;
      } else if (inStruct && /^\s*private\s+static\s+method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("private", true)) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*public\s+static\s+method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("public", true)) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*private\s+method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("private")) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*public\s+method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("public")) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*static\s+method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("default", true)) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*method\b/.test(line.text)) {
        const method = <Method>this._handleNative(line.text, FunctionOption.method("default")) ?? new Method("");
        structMethodHandle(method);
        descHandle(line, method);
        inMethod = true;
        inGlobals = false;
        inFunc = false;
      } else if (inStruct && /^\s*private\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {

      } else if (inStruct && /^\s*public\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {

      } else if (inStruct && /^\s*[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {

      } else if (inGlobals && /^\s*private\s+constant\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption("private", true));
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      } else if (inGlobals && /^\s*public\s+constant\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption("public", true));
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      } else if (inGlobals && /^\s*private\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption("private"));
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      } else if (inGlobals && /^\s*public\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption("public"));
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      } else if (inGlobals && /^\s*constant\s+[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption("default", true));
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      } else if (inGlobals && /^\s*[a-zA-Z][a-zA-Z0-9_]*\b/.test(line.text)) {
        const global = this._handleGlobal(line, new GlobalOption);
        if (global) {
          this.globals.push(global);
          descHandle(line, global);
        }
      }
    }
  }



  private _handleType(text: string) {
    const result = /type\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)\s+extends\s+(?<extend>[a-zA-Z][a-zA-Z0-9_]*)\s+array\s*\[\s*(?<size>\d+)\s*\]/.exec(text);
    if (result && result.groups) {
      const name = result.groups["name"];
      const extend = result.groups["extend"];
      const size = result.groups["size"];
      const type = new ArrayType(name, extend, parseInt(size));
      return type;
    } else return null;
  }


  // private _natives

  private _handleNative(text: string, option: FunctionOption = FunctionOption.func()) {

    const functionNameString = text.substring(0, text.includes("takes") ? text.indexOf("takes") : text.length);
    const nameResult = (function () {
      switch (option.type) {
        case "function":
          return new RegExp(/function\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        case "native":
          return new RegExp(/native\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        case "method":
          return new RegExp(/method\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        default:
          return new RegExp(/function\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
      }
    })().exec(functionNameString);
    if (!nameResult || !nameResult.groups) {
      return null;
    }
    const funcName = nameResult.groups["name"];
    const takesResult = /takes\s+(?<takes>nothing|([a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)(\s*,\s*[a-zA-Z][a-zA-Z0-9_]*\s+[a-zA-Z][a-zA-Z0-9_]*)*)/.exec(text.substring(text.includes("takes") ? text.indexOf("takes") : 0, text.includes("returns") ? text.indexOf("returns") : text.length));
    let takes: Take[] = [];
    if (takesResult && takesResult.groups) {
      const takesString = takesResult.groups["takes"];
      if (takesString != "nothing") {
        takes = this.takeStringToTakes(takesString);
      }
    }
    const returnsResult = /returns\s+(?<returns>[a-zA-Z][a-zA-Z0-9_]*)/.exec(text.substring(text.includes("returns") ? text.indexOf("returns") : 0));
    let returns: string | null = null;
    if (returnsResult && returnsResult.groups) {
      const returnsString = returnsResult.groups["returns"];
      if (returnsString != "nothing") {
        returns = returnsString;
      }
    }
    switch (option.type) {
      case "function":
        return new Func(funcName, takes, returns, option.modifier, option.static);
      case "native":
        return new Native(funcName, takes, returns, option.constant);
      case "method":
        return new Method(funcName, takes, returns, option.modifier);
      default:
        return new Func(funcName, takes, returns, option.modifier, option.static);
    }
  }

  private takeStringToTakes(takeString: string) {
    return <Take[]>takeString.split(",").map(ts => ts.trim()).map(ts => {
      const result = /(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/.exec(ts);
      if (result && result.groups) {
        const type = result.groups["type"];
        const name = result.groups["name"];
        return new Take(type, name);
      }
    }).filter(take => take);
  }

  private _handleGlobal(line: Line, option: GlobalOption = new GlobalOption) {
    const regExp = (function () {
      if (option.constant) {
        if (option.modifier == "private") {
          return new RegExp(/private\s+constant\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        } else if (option.modifier == "public") {
          return new RegExp(/public\s+constant\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        } else {
          return new RegExp(/constant\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        }
      } else {
        if (option.modifier == "private") {
          return new RegExp(/private\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        } else if (option.modifier == "public") {
          return new RegExp(/public\s+(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        } else {
          return new RegExp(/(?<type>[a-zA-Z][a-zA-Z0-9_]*)\s+(?:(?<array>array)\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
        }
      }
    })();
    const result = regExp.exec(line.text);
    if (result && result.groups) {
      const type = result.groups["type"];
      const name = result.groups["name"];
      const isArray = result.groups["array"] ? true : false;
      const global = new Global(type, name, option.constant, isArray, option.modifier);
      return global;
    } else {
      return null;
    }
  }

  private _handleLibrary(text: string) {
    const nameResult = /library\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/.exec(text);
    if (nameResult && nameResult.groups) {
      const name = nameResult.groups["name"];
      return new Library(name);
    } else return null;
  }
  private _handleScope(text: string) {
    const nameResult = /scope\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/.exec(text);
    if (nameResult && nameResult.groups) {
      const name = nameResult.groups["name"];
      return new Scope(name);
    } else return null;
  }

  private _handleStruct(text: string) {
    const result = /struct\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(?:\s+extends\s+(?<extend>[a-zA-Z][a-zA-Z0-9_]*))?/.exec(text);
    if (result && result.groups) {
      const name = result.groups["name"];
      const extend = result.groups["extend"];
      const struct = new Struct(name, extend ?? null);
      return struct;
    } else return null;
  }

  /**
   * 扁平化scopes
   * @param scopes 
   * @returns 
   */
  private flatScope = (scopes: Scope[]): Scope[] => {
    return scopes.map(scope => {
      if (scope.scopes.length == 0) {
        return [scope];
      } else {
        return [scope, ...this.flatScope(scope.scopes)];
      }
    }).flat();
  }

  public get allScope() {
    return [...this.flatScope(this.scopes), ...this.librarys.map(library => this.flatScope(library.scopes)).flat()];
  }

  public get allFunctions() {
    const functions = [...this.functions, ...this.librarys.map(library => {
      const scopes = this.flatScope(library.scopes);
      return [...library.functions, ...scopes.map(scope => scope.functions).flat()];
    }).flat(), ...this.flatScope(this.scopes).map(scope => scope.functions).flat()];
    return functions;
  }

  public get allGlobals() {
    const globals = [...this.globals, ...this.librarys.map(library => {
      const scopes = this.flatScope(library.scopes);
      return [...library.globals, ...scopes.map(scope => scope.globals).flat()];
    }).flat(), ...this.flatScope(this.scopes).map(scope => scope.globals).flat()];
    return globals;
  }

  public get allStructs() {
    const structs = [...this.structs, ...this.librarys.map(library => {
      const scopes = this.flatScope(library.scopes);
      return [...library.structs, ...scopes.map(scope => scope.structs).flat()];
    }).flat(), ...this.flatScope(this.scopes).map(scope => scope.structs).flat(),
    ...this.zincStructs];
    return structs;
  }

  private handleDesc(comments: Array<LineComment>) {

  }

}

class FunctionOption {
  public readonly type: "function" | "native" | "method";
  public readonly constant: boolean;
  public readonly static: boolean;
  public readonly modifier: "private" | "public" | "default";

  private constructor(type: "function" | "native" | "method" = "function", modifier: "private" | "public" | "default" = "default", constant: boolean = false, isStatic: boolean = false) {
    this.type = type;
    this.constant = constant;
    this.static = isStatic;
    this.modifier = modifier;
  }

  public static native(isConstant = false) {
    return new FunctionOption("native", "default", isConstant);
  }

  public static func(modifier: "private" | "public" | "default" = "default", isStatic = false) {
    return new FunctionOption("function", modifier, false, isStatic);
  }

  public static method(modifier: "private" | "public" | "default" = "default", isStatic = false) {
    return new FunctionOption("method", modifier, false, isStatic);
  }
}

class GlobalOption {
  public readonly modifier: "private" | "public" | "default";
  public readonly constant: boolean;

  constructor(modifier: "private" | "public" | "default" = "default", isConstant = false) {
    this.modifier = modifier;
    this.constant = isConstant;

  }
}

class BaseType {
  public readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Type extends BaseType {
  public readonly extend: Type | BaseType;
  constructor(name: string, extend: Type | BaseType) {
    super(name);
    this.extend = extend;
  }
}


class ArrayType extends BaseType implements Desc {
  public readonly extend: string;
  public readonly size: number;
  constructor(name: string, extend: string, size: number) {
    super(name);
    this.extend = extend;
    this.size = size;
  }
  public text: string = "";


  public get origin(): string {
    return `type ${this.name} extends ${this.extend} array [${this.size}]`;
  }

}

class Take {
  public readonly type: string;
  public readonly name: string;

  constructor(type: string, name: string) {
    this.type = type;
    this.name = name;
  }


  public get origin(): string {
    return `${this.type} ${this.name}`;
  }


}

class Func implements Desc {
  public readonly name: string;
  public readonly takes: Take[];
  public readonly returns: string | null;
  public readonly modifier: "private" | "public" | "default";
  public readonly static: boolean;

  constructor(name: string, takes: Take[] = [], returns: string | null = null, modifier: "private" | "public" | "default" = "default", isStatic = false) {
    this.name = name;
    this.takes = takes;
    this.returns = returns;
    this.modifier = modifier;
    this.static = isStatic;
  }
  public text: string = "";

  public get origin(): string {
    if (this.modifier == "default") {
      if (this.static) {
        return `static function ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
      } else {
        return `function ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
      }
    } else {
      if (this.static) {
        return `${this.modifier} static function ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
      } else {
        return `${this.modifier} function ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
      }
    }
  }
}

class Native implements Desc {
  public readonly name: string;
  public readonly takes: Take[];
  public readonly returns: string | null;
  public readonly constant: boolean;

  constructor(name: string, takes: Take[] = [], returns: string | null = null, constant: boolean = false) {
    this.name = name;
    this.takes = takes;
    this.returns = returns;
    this.constant = constant;
  }
  public text: string = "";


  public get origin(): string {
    if (this.constant) {
      return `constant native ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
    } else {
      return `native ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
    }
  }

}

class Method implements Desc {
  public readonly name: string;
  public readonly takes: Take[];
  public readonly returns: string | null;
  public readonly modifier: "private" | "public" | "default";
  public text: string = "";

  constructor(name: string, takes: Take[] = [], returns: string | null = null, modifier: "private" | "public" | "default" = "default") {
    this.name = name;
    this.takes = takes;
    this.returns = returns;
    this.modifier = modifier;
  }

  public get origin() {
    if (this.modifier == "default") {
      return `method ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
    } else {
      return `${this.modifier} method ${this.name} takes ${this.takes.length == 0 ? "nothing" : this.takes.map(take => take.origin).join(" ,")} returns ${this.returns ? this.returns : "nothing"}`;
    }
  }

}

class Global implements Desc {
  public readonly type: string;
  public readonly name: string;
  public readonly constant: boolean;
  public readonly array: boolean;
  public readonly modifier: "private" | "public" | "default";
  public text: string = "";

  constructor(type: string, name: string, constant = false, array = false, modifier: "private" | "public" | "default" = "default") {
    this.type = type;
    this.name = name;
    this.constant = constant;
    this.array = array;
    this.modifier = modifier;
  }

  public get origin() {
    if (this.modifier == "default") {
      if (this.constant) {
        if (this.array) {
          return `constant ${this.type} array ${this.name} = [...]`;
        } else {
          return `constant ${this.type} ${this.name} = ...`;
        }
      } else {
        if (this.array) {
          return `${this.type} array ${this.name}`;
        } else {
          return `${this.type} ${this.name}`;
        }
      }
    } else {
      if (this.constant) {
        if (this.array) {
          return `${this.modifier} constant ${this.type} array ${this.name} = [...]`;
        } else {
          return `${this.modifier} constant ${this.type} ${this.name} = ...`;
        }
      } else {
        if (this.array) {
          return `${this.modifier} ${this.type} array ${this.name}`;
        } else {
          return `${this.modifier} ${this.type} ${this.name}`;
        }
      }
    }

  }

}

class Library implements Desc {
  public readonly name: string;
  public readonly functions: Func[] = [];
  public readonly globals: Global[] = [];
  public readonly scopes: Scope[] = [];
  public readonly structs: Struct[] = [];
  public text: string = "";

  constructor(name: string) {
    this.name = name;
  }

  public get origin() {
    return `library ${this.name}\nendlibrary`;
  }

}

class Scope implements Desc {
  public readonly name: string;
  public readonly functions: Func[] = [];
  public readonly globals: Global[] = [];
  public readonly scopes: Scope[] = [];
  public readonly structs: Struct[] = [];
  public text: string = "";

  constructor(name: string) {
    this.name = name;
  }

  public get origin() {
    return `scope ${this.name}\nendscope`;
  }

}


class Struct implements Desc {
  public readonly name: string;
  public readonly extend: string | null;
  public readonly methods: Method[] = [];
  public text: string = "";

  constructor(name: string, extend: string | null = null) {
    this.name = name;
    this.extend = extend;
  }

  public get origin() {
    if (this.extend) {
      return `struct ${this.name} extends ${this.extend}`;
    } else {
      return `struct ${this.name}`;
    }
  }
}


export {
  Program,
  Scope,
  Library,
  Func,
  Global,
  Native,
  Struct,
  LineComment
};


