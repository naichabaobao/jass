import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { HoverProvider } from 'vscode';
const md5: Function = require('../tool/md5');



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

  /**
     * 去除单行注释和字符串,不包括单行
     * @param content 
     */
  static removeStringAndBlockComment(content: string): string {
    let inString = false;
    let inLineComment = false;
    let inBlockComment = false;
    let t = "";
    for (let i = 0; i < content.length; i++) {
      const c: string = content.charAt(i);
      const next = () => content.charAt(i + 1);
      const pre = () => content.charAt(i - 1);
      const pre2 = () => content.charAt(i - 2);
      if (c == "/" && next() == "/" && !inString && !inBlockComment) {
        inLineComment = true;
      } else if (c == "/" && next() == "*" && !inString && !inLineComment) {
        inBlockComment = true;
      } else if (c == '"' && !inLineComment && !inBlockComment && !inString) {
        inString = true;
      } else if (c == '"' && inString && pre() != "\\") {
        inString = false;
      } else if (c == "\n") {
        if (inString) inString = false;
        if (inLineComment) inLineComment = false;
      } else if (pre() == "/" && pre2() == "*" && inBlockComment) {
        inBlockComment = false;
      }
      if (inString) t += " ";
      else if (inBlockComment) {
        if (c == "\n") t += c;
        else t += " ";
      }
      else t += c;
    }
    return t;
  }

  /**
   * 去除文本宏，同时去除多行注释和字符串
   * @param content 
   */
  static removeTextMacro(content: string): string {
    const lines = JassUtils.content2Lines(JassUtils.removeStringAndBlockComment(content));
    let inTextMacro = false;
    let str = "";
    const pushNewLine = () => str += "\n";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/\/\/!\s+textmacro/.test(line)) {
        inTextMacro = true;
        pushNewLine();
      } else if (/\/\/!\s+endtextmacro/.test(line)) {
        inTextMacro = false;
        pushNewLine();
      } else if (inTextMacro) {
        pushNewLine();
      } else {
        str += line;
      }
    }
    return str;
  }

  /**
   * @deprecated 後續位置會更改
   */
  static readonly keywords = ["and", "or", "not", "globals", "endglobals", "function", "endfunction", "constant", "native", "local", "type", "set", "call", "takes", "returns", "extends", "array", "true", "false", "null", "nothing", "if", "else", "elseif", "endif", "then", "loop", "endloop", "exitwhen", "return", "integer", "real", "boolean", "string", "handle", "code"];

  static isKeyword(keyword: string): boolean {
    return Jass.keywords.includes(keyword);
  }

}

class Comment {

  public content: string | null = null;

  /**
   * @deprecated
   */
  public range: vscode.Range | null = null;

  /**
   * @deprecated
   */
  public contentRange: vscode.Range | null = null;

  public origin(): string {
    return `${this.content ? "// " + this.content : ""}`;
  };

  public static parse(content: string): Comment | null {
    let comment = null;
    const commentRegExp = new RegExp(/^\s*\/\/(?!!)\s*(?<content>.*)/);
    if (commentRegExp.test(content)) {
      comment = new Comment;
      const result = commentRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.content) {
          comment.content = result.groups.content;
        }
      }
    }
    return comment;
  }

}

class Type {
  public name: string | null = null;
  public extends: string | null = null; //  可以为数组对象，目前不进行进一步解析，以string形式保存
  public isArrayObject: boolean = false;
  public size: number = 0; // isArrayObject为true时才有效
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public constructor(name: string, extend?: string, description?: string) {
    this.name = name;
    if (extend) this.extends = extend;
    if (description) this.description = description;
  }

  public origin(): string {
    return `type ${this.name}${this.extends ? " extends " + this.extends : ""}`;
    // ${this.isArrayObject ? " array" : ""}${this.size > 0 ? "[" + this.size + "]" : ""}
  }

  private static arrayObjects: Type[] = new Array<Type>();

  public static getArrayObjects(): Type[] {
    return this.arrayObjects;
  }

  public static getBaseTypes() {
    return CommonJ.build().getTypes();
  }

  public static getTypes(): Type[] {
    return [...Type.getBaseTypes(), ...Type.getArrayObjects()];
  }

  public static getTakesTypes(): Type[] {
    return [...this.getBaseTypes(), ...this.getArrayObjects(), ...Type.TakeBaseTypes];
  }

  public static getStatementTypes(): Type[] {
    return [...this.getBaseTypes(), ...this.getArrayObjects(), ...Type.StatementBaseTypes];
  }

  /**
   * 解析type或数组对象
   * @param content 
   * @param isCommonJ true 只解析jass类型，false 只解析数组对象
   */
  static resolveTypes(content: string, isCommonJ: boolean = false): void {
    this.arrayObjects = new Array<Type>(); // 清空
    const jassContent = JassUtils.removeTextMacro(content);
    const lines = JassUtils.content2Lines(jassContent);
    // for内部每解析一个类型都会更新Types
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*type\s+[a-zA-Z][a-zA-Z\d]*/.test(line)) {
        const arrayObject = this.parseArrayObject(line);
        if (arrayObject) {
          const comment = Comment.parse(lines[i - 1]);
          if (comment) arrayObject.description = comment.content;
          this.arrayObjects.push(arrayObject);
        }
      }
    }
  }

  static parseArrayObject(content: string): Type | null {
    let type = null;
    const typeRegExp = new RegExp(`type\\s+(?<name>[a-zA-Z][a-zA-Z\d]*)(\\s+extends\\s+(?<extends>(${statementRegExpString})\\s+(?<arrayObject>array)\\s*\\[(?<size>[1-9]\\d*)\\]))?`);
    if (typeRegExp.test(content)) {
      const result = typeRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.name) {
          type = new Type(result.groups.name);
          if (result.groups.extends) {
            type.extends = result.groups.extends;
          }
          if (result.groups.arrayObject) {
            type.isArrayObject = true;
          }
          if (result.groups.size) {
            type.size = Number.parseInt(result.groups.size);
          }
        }
      }
    }
    return type;
  }

  public static readonly Boolean = new Type("boolean", void 0, "布尔");
  public static readonly Integer = new Type("integer", void 0, "整数");
  public static readonly Real = new Type("real", void 0, "实数");
  public static readonly String = new Type("string", void 0, "字符串");
  public static readonly Code = new Type("code", void 0, "代码");
  public static readonly Handle = new Type("handle", void 0, "句柄");

  public static readonly StatementBaseTypes = [Type.Boolean, Type.Integer, Type.Real, Type.String, Type.Handle];
  public static readonly TakeBaseTypes = [...Type.StatementBaseTypes, Type.Code];

  public toCompletionItem(): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      item = new vscode.CompletionItem(this.name, vscode.CompletionItemKind.Class);
      item.detail = this.name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin());
      item.documentation = ms;
    };
    return item;
  }

}

const takesRegExpString = () => [...Type.getTakesTypes(), ...Interface.getInterfaces(), ...Struct.getStructs()].map(type => {
  if (type.name) {
    return type.name;
  }
}).filter(name => name).join("|");
const statementRegExpString = () => [...Type.getStatementTypes(), ...Interface.getInterfaces(), ...Struct.getStructs()].map(type => {
  if (type.name) {
    return type.name;
  }
}).filter(name => name).join("|");

class CommonJ {
  private commonJFilePath: string = path.resolve(__dirname, "../../src/resources/static/jass/common.j");
  private commonJContent: string | null = null;

  private static commonJ: CommonJ | null = null;

  private constructor() {
    this.init();
  }

  private types = new Array<Type>();

  public getTypes(): Array<Type> {
    return this.types;
  }

  /**
   * 初始化時，讀取common.j内容
   */
  private init() {
    if (fs.existsSync(this.commonJFilePath)) {
      this.commonJContent = fs.readFileSync(this.commonJFilePath).toString("utf8")
    }
    if (this.commonJContent) {
      this.resolveTypes();
    }
  }

  private parseBaseType(content: string): Type | null {
    let type = null;
    const typeRegExp = new RegExp(`^\\s*type\\s+(?<name>[a-zA-Z][a-zA-Z\d]*)(\\s+extends\\s+(?<extends>${[...this.types, Type.Handle].map(type => type.name).join("|")}))?`);
    if (typeRegExp.test(content)) {
      const result = typeRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.name) {
          type = new Type(result.groups.name);
          if (result.groups.extends) {
            type.extends = result.groups.extends;
          }
        }
      }
    }
    return type;
  }
 
  private resolveTypes(): void {
    if (this.types.length > 0) {
      this.types = new Array<Type>();
    }

    if (this.commonJContent) {
      const jassContent = JassUtils.removeTextMacro(this.commonJContent);
      const lines = JassUtils.content2Lines(jassContent);
      // for内部每解析一个类型都会更新Types
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const type = this.parseBaseType(line);
        if (type) {
          const comment = Comment.parse(lines[i - 1]);
          if (comment) type.description = comment.content;
          this.types.push(type);
        }
      }
      
    }
  }

  public setCommonJFilePath(filePath: string): void {
    this.commonJFilePath = filePath;
    this.init();
  }

  public getCommonJFilePath = () => this.commonJFilePath;

  public getCommonJContent(): string | null {
    return this.commonJContent;
  }

  public static build() {
    if (!this.commonJ) this.commonJ = new CommonJ;
    return this.commonJ;
  }
}

const commonJ = CommonJ.build(); // 單例

enum Modifier {
  Private = "private",
  Public = "public",
  Common = "common"
}

/**
 * 解析出修饰符
 * @param content 
 */
const resolveModifier = (content: string): Modifier => {
  if (content) {
    if (/^\s*private\b/.test(content)) {
      return Modifier.Private;
    } else if (/^\s*public\b/.test(content)) {
      return Modifier.Public;
    }
    return Modifier.Common;
  }
  return Modifier.Common;
}

/**
 * @deprecated
 */
enum MemberModifier {
  Private = "private",
  Public = "public"
}

class Global {
  public modifier: Modifier = Modifier.Common;
  public isConstant: boolean = false;
  public isArray: boolean = false;
  public type: string | null = null;
  public name: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  private toOrigin(includeGlobal: boolean = false, prefix?: string | null) {
    let name = this.name ? this.name : "";
    if (prefix) {
      name = prefix + "_" + name;
    }
    const globalsString = `${this.modifier == Modifier.Common ? "" : this.modifier + " "}${this.isConstant ? "constant " : ""}${this.type ? this.type + " " : ""}${this.isArray ? "array " : ""}${name}`;
    if (includeGlobal) {
      return `globals\n\t${globalsString}\nendglobals`
    }
    return globalsString;
  }

  public origin(includeGlobal: boolean = false, prefix?: string | null): string {
    return this.toOrigin(includeGlobal, prefix);
  }

  static parse(content: string): Global | null {
    let global = null;
    const globalRegExp = new RegExp(`((?<modifier>private|public)\\s+)?((?<isConstant>constant)\\s+)?(?<type>${statementRegExpString()})\\s+((?<isArray>array)\\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);
    if (globalRegExp.test(content)) {
      const result = globalRegExp.exec(content);
      if (result && result.groups) {
        global = new Global();
        if (result.groups.modifier) {
          if (result.groups.modifier == Modifier.Private) {
            global.modifier = Modifier.Private;
          } else if (result.groups.modifier == Modifier.Public) {
            global.modifier = Modifier.Public;
          }
        }
        if (result.groups.isConstant) {
          global.isConstant = true;
        }
        if (result.groups.type) {
          global.type = result.groups.type;
        }
        if (result.groups.isArray) {
          global.isArray = true;
        }
        if (result.groups.name) {
          global.name = result.groups.name;
        }
      }
    }
    return global;
  }

  public toCompletionItem(prefix?: string | null): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      let name = this.name;
      if (prefix) {
        name = prefix + "_" + this.name;
      }
      item = new vscode.CompletionItem(name, this.isConstant ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Variable);
      item.detail = name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin(true, prefix));
      item.documentation = ms;
    };
    return item;
  }

}

class Param {
  public type: string | null = null;
  public name: string | null = null;

  public origin(): string {
    return `${this.type ? this.type + " " : ""}${this.name ? this.name : ""}`;
  }

  static parseTakes(content: string): Param[] {
    let takes = new Array<Param>();
    if (!content) return takes;
    if (!/takes\s+nothing/.test(content)) {
      const takesRegExp = new RegExp(`takes\\s+(?<takeString>(${takesRegExpString()})\\s+[a-zA-Z][a-zA-Z0-9_]*(\\s*,\\s*(${takesRegExpString()})\\s+[a-zA-Z][a-zA-Z0-9_]*)*)`);
      if (takesRegExp.test(content)) {
        const result = takesRegExp.exec(content);
        if (result && result.groups && result.groups.takeString) {
          const takeString = result.groups.takeString;
          const takesStrings = takeString.split(/\s*,\s*/);
          takes = takesStrings.map(t => {
            const takeTypeName = t.trim().split(/\s+/);
            const param = new Param();
            param.type = takeTypeName[0];
            param.name = takeTypeName[1];
            return param;
          }).filter(take => take && take.name && !JassUtils.isKeyword(take.name)); // 过滤名称为jass关键字的参数
        }
      }
    }
    return takes;
  }
}

/**
 * 用于解析出returns后面的类型
 * @param content 方法行
 */
const resolveReturnsType = (content: string): string | null => {
  let returns = null;
  if (!content || /returns\s+nothing/.test(content)) return returns;
  const returnsRegexp = new RegExp(`returns\\s+(?<returns>${statementRegExpString()})`);
  if (returnsRegexp.test(content)) {
    const result = returnsRegexp.exec(content);
    if (result && result.groups && result.groups.returns) {
      returns = result.groups.returns;
    }
  }
  return returns;
}

class Func {

  public modifier: Modifier = Modifier.Common;
  public name: string | null = null;
  public takes: Param[] = new Array<Param>();
  public returnType: string | null = null;
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public locals: Local[] = new Array<Local>();

  public origin(prefix?: string | null): string {
    let pStr = "";
    if (prefix) {
      pStr = prefix + "_";
    }
    return `${this.modifier != Modifier.Common ? this.modifier + " " : ""}function ${this.name ? pStr + this.name + " " : ""}takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returnType ? this.returnType : "nothing"}`;
  }

  public toCompletionItem(prefix?: string | null): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      let name = this.name;
      if (prefix) {
        name = prefix + "_" + this.name;
      }
      item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
      item.detail = name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin(prefix));
      item.documentation = ms;
    };
    return item;
  }

  static parse(content: string): Func | null {
    let func = null;
    const modifier = resolveModifier(content);
    if ((modifier == Modifier.Common && /^\s*function\b/.test(content)) || ((modifier == Modifier.Private || modifier == Modifier.Public) && /^\s*(private|public)\s+function\b/.test(content))) {
      // 解析方法名称
      const nameRegExp = new RegExp(/function\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
      if (nameRegExp.test(content)) {
        const result = nameRegExp.exec(content);
        if (result && result.groups && result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
          func = new Func();
          func.name = result.groups.name;
          func.modifier = modifier;
          func.takes = Param.parseTakes(content);
          func.returnType = resolveReturnsType(content);
        }
      }
    }
    return func;
  }



}

class Native {
  public isConstant: boolean = false;
  public name: string | null = null;
  public takes: Param[] = new Array<Param>();
  public returnType: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public locals: Local[] = new Array<Local>();

  public origin(): string {
    return `${this.isConstant ? "constant " : ""}native ${this.name ? this.name + " " : ""}takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returnType ? this.returnType : "nothing"}`;
  }

  static parse(content: string): Native | null {
    let native = null;
    if (/\bnative\b/.test(content)) {
      // 解析方法名称
      const nativeRegExp = new RegExp(/((?<isConstant>constant)\s+)?native\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
      if (nativeRegExp.test(content)) {
        const result = nativeRegExp.exec(content);
        if (result && result.groups) {
          if (result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
            native = new Native;
            native.name = result.groups.name;
            if (result.groups.isConstant) {
              native.isConstant = true;
            }
            native.takes = Param.parseTakes(content);
            native.returnType = resolveReturnsType(content);
          }
        }
      }
    }
    return native;
  }

  /**
   * 備注：後續修改為無返回值
   * @param content 
   */
  static parseNatives(content: string): Native[] {
    const jassContent = JassUtils.removeTextMacro(content);
    const lines = JassUtils.content2Lines(jassContent);
    const natives = new Array<Native>();
    lines.forEach((line, index) => {
      const native = this.parse(line);
      if (native) {
        if (native.name) {
          const nameIndex = line.indexOf(native.name);
          native.nameRange = new vscode.Range(index, nameIndex, index, nameIndex + native.name.length);
        }
        const comment = Comment.parse(lines[index - 1]);
        if (comment) {
          native.description = comment.content;
        }
        native.range = new vscode.Range(index, line.length - line.trimStart().length, index, line.length);
        natives.push(native);
      };
    })
    return natives;
  }

  public toCompletionItem(): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      item = new vscode.CompletionItem(this.name, vscode.CompletionItemKind.Function);
      item.detail = this.name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin());
      item.documentation = ms;
    };
    return item;
  }

}

class Local {
  public type: string | null = null;
  public name: string | null = null;
  public isArray: boolean = false;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public origin(): string {
    return `local ${this.type ? this.type + " " : ""}${this.isArray ? "array " : ""}${this.name ? this.name + " " : ""}`;
  }

  public toCompletionItem(): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      item = new vscode.CompletionItem(this.name, vscode.CompletionItemKind.Function);
      item.detail = this.name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin());
      item.documentation = ms;
    };
    return item;
  }

  static parse(content: string): Local | null {
    let local = null;
    const functionRegExp = new RegExp(`^\\s*local\\s+(?<type>${statementRegExpString()})(\\s+(?<hasArray>array))?\\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);
    if (functionRegExp.test(content)) {
      const result = functionRegExp.exec(content);
      if (result && result.groups) {
        local = new Local();
        if (result.groups.type) {
          local.type = result.groups.type;
        }
        if (result.groups.name) {
          local.name = result.groups.name;
        }
        if (result.groups.hasArray) {
          local.isArray = true;
        }
      }
    }
    return local;
  }
}

class Import {

}

class TextMacro {

  public name: string | null = null;
  public takes: string[] = [];
  public content: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  /**
   * 待實現
   */
  public origin(): string {
    return ``;
  }

  /**
   * 待實現
   * @param content 
   */
  public static parse(content: string): TextMacro {
    const textMacro = new TextMacro;
    const textMacroRegExp = new RegExp(/\/\/\s+textmacro\s+/);
    return new TextMacro;
  }

}

class Library {
  public name: string | null = null;
  public scopes: Scope[] = new Array<Scope>();
  public initializer: string | null = null;
  public needs: string[] = new Array<string>();
  public globals: Global[] = new Array<Global>();
  public functions: Func[] = [];
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public origin(): string {
    return `library ${this.name ? this.name + " " : ""}${this.initializer ? "initializer " + this.initializer + " " : ""}${this.needs.length > 0 ? "requires " + this.needs.join(", ") : ""}\n${this.globals.length > 0 ? "\tglobals\n" + this.globals.map(g => g.origin().padStart(2, "\t").padEnd(1, "\n")) + "\tendglobals\n" : ""}${this.functions.length > 0 ? this.functions.map(func => func.origin().padStart(1, "\t").padEnd(1, "\n")) : ""}${this.scopes.length > 0 ? this.scopes.map(scope => scope.origin().padEnd(1, "\n")) : ""}endlibrary`;
  }

  public toCompletionItem(): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      item = new vscode.CompletionItem(this.name, vscode.CompletionItemKind.Field);
      item.detail = this.name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin());
      item.documentation = ms;
    };
    return item;
  }

  public static parse(content: string): Library {
    const library = new Library;
    const libraryRegExp = new RegExp(/library\s+(?<name>[a-zA-Z][a-zA-Z\d]*)(\s+initializer\s+(?<initializer>[a-zA-Z][a-zA-Z0-9_]*))?(\s+(requires|uses|needs)\s+(?<needs>[a-zA-Z][a-zA-Z\d]*(\s*,\s*[a-zA-Z][a-zA-Z\d]*)*))?/); // library 名稱不能包含下劃綫
    if (libraryRegExp.test(content)) {
      const result = libraryRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
          library.name = result.groups.name;
        }
        if (result.groups.initializer && !JassUtils.isKeyword(result.groups.initializer)) {
          library.initializer = result.groups.initializer;
        }
        if (result.groups.needs) {
          const uses = result.groups.needs.split(/\s*,\s*/);
          library.needs = uses.filter(lib => !JassUtils.isKeyword(lib));
        }
      }
    }
    return library;
  }
}

class Scope {
  public name: string | null = null;
  public scopes: Scope[] = new Array<Scope>();
  public initializer: string | null = null;
  public globals: Global[] = new Array<Global>();
  public functions: Func[] = [];
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public origin(prefix?: string | null): string {
    return `scope ${this.name ? prefix ? prefix + "_" + this.name : this.name + " " : ""}${this.initializer ? "initializer " + this.initializer : ""}\n${this.globals.length > 0 ? "\tglobals\n" + this.globals.map(g => g.origin().padStart(2, "\t").padEnd(1, "\n")) + "\tendglobals\n" : ""}${this.functions.length > 0 ? this.functions.map(func => func.origin().padStart(1, "\t").padEnd(1, "\n")) : ""}${this.scopes.length > 0 ? this.scopes.map(scope => scope.origin().padEnd(1, "\n")) : ""}endscope`;
  }

  public toCompletionItem(prefix?: string | null): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      let name = this.name;
      if (prefix) {
        name = prefix + "_" + this.name;
      }
      item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Field);
      item.detail = name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin(prefix));
      item.documentation = ms;
    };
    return item;
  }

  public static parse(content: string): Scope {
    const scope = new Scope();
    const nameRegExp = /scope\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)(\s+initializer\s+(?<initializer>[a-zA-Z][a-zA-Z0-9_]*))?/;
    if (nameRegExp.test(content)) {
      const result = nameRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.name) {
          scope.name = result.groups.name;
        }
        if (result.groups.initializer) {
          scope.initializer = result.groups.initializer;
        }
      }
    }
    return scope;
  }
}

class Member {
  public modifier: Modifier = Modifier.Common;
  public isStatic: boolean = false;
  public type: string | null = null;
  public isArray: boolean = false;
  public name: string | null = null;
  public range: vscode.Range | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public origin(): string {
    return `${this.modifier != Modifier.Common ? this.modifier + " " : ""}${this.isStatic ? "static " : ""}${this.type ? this.type + " " : ""}${this.isArray ? "array " : ""}${this.name ? this.name + " " : ""}`;
  }

  public toCompletionItem(): vscode.CompletionItem | null {
    let item = null;
    if (this.name) {
      item = new vscode.CompletionItem(this.name, vscode.CompletionItemKind.Function);
      item.detail = this.name;
      const ms = new vscode.MarkdownString();
      if (this.description) ms.appendText(this.description);
      ms.appendCodeblock(this.origin());
      item.documentation = ms;
    };
    return item;
  }

  static parse(content: string): Member | null {
    let member = null;
    const interfaceMemberRegExp = new RegExp(`^\\s*((?<modifier>private|public)\\s+)?((?<isStatic>static)\\s+)?(?<type>${statementRegExpString()})\\s+((?<isArray>array)\\s+)?(?<name>[a-zA-Z][a-zA-Z0-9_]*)`);
    if (interfaceMemberRegExp.test(content)) {
      const result = interfaceMemberRegExp.exec(content);
      if (result && result.groups) {
        member = new Member();
        if (result.groups.modifier) {
          if (result.groups.modifier == Modifier.Private) {
            member.modifier = Modifier.Private;
          } else if (result.groups.modifier == Modifier.Public) {
            member.modifier = Modifier.Public;
          }
        }
        if (result.groups.isStatic) {
          member.isStatic = true;
        }
        if (result.groups.type) {
          member.type = result.groups.type;
        }
        if (result.groups.isArray) {
          member.isArray = true;
        }
        if (result.groups.name) {
          member.name = result.groups.name;
        }
      }
    }
    return member;
  }
}

class Method {
  public modifier: Modifier = Modifier.Common;
  public isStatic: boolean = false;
  public name: string | null = null;
  public takes: Param[] = new Array<Param>();
  public returns: string | null = null;
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public locals: Array<Local> = new Array<Local>();
  public description: string | null = null;

  public origin(): string {
    return `${this.modifier == Modifier.Private ? "private" : "public"} method ${this.name ? this.name + " " : ""}takes ${this.takes.length > 0 ? this.takes.map(take => take.origin()).join(", ") : "nothing"} returns ${this.returns ? this.returns : "nothing"}`;
  }

  static parse(content: string): Method | null {
    let method = null;
    const interfaceMethodRegExp = new RegExp(/^\s*((?<modifier>private|public)\s+)?((?<isStatic>static)\s+)?method\s+(?<name>[a-zA-Z][a-zA-Z0-9_]*)/);
    if (content && interfaceMethodRegExp.test(content)) {
      method = new Method();
      const result = interfaceMethodRegExp.exec(content);
      if (result && result.groups) {
        if (result.groups.modifier) {
          if (result.groups.modifier == Modifier.Private) {
            method.modifier = Modifier.Private;
          } else if (result.groups.modifier == Modifier.Public) {
            method.modifier = Modifier.Public;
          }
        }
        if (result.groups.isStatic) {
          method.isStatic = true;
        }
        if (result.groups.isStatic) {
          method.isStatic = true;
        }
        if (result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
          method.name = result.groups.name;
        }
      }
      method.takes = Param.parseTakes(content);
      method.returns = resolveReturnsType(content);
    }
    return method;
  }
}

class Struct {
  public name: string | null = null;
  public extends: string | null = null;
  public members: Member[] = new Array<Member>();
  public methods: Method[] = new Array<Method>();
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;

  public description: string | null = null;

  public origin(): string {
    return `struct${this.name ? " " + this.name : ""}${this.extends ? " extends" + this.extends : ""}\n\t${this.members.length}个成员变量\n\t${this.methods.length}个方法\nendstruct`;
  }

  private static structs: Array<Struct> = new Array<Struct>();

  public static getStructs(): Array<Struct> {
    return this.structs;
  }

  static parse(content: string): Struct | null {
    let struct = null;
    const nameRegExp = new RegExp(/^\s*struct\s+(?<name>[a-zA-Z][a-zA-Z\d]*)\b/);
    if (nameRegExp.test(content)) {
      const result = nameRegExp.exec(content);
      if (result && result.groups && result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
        struct = new Struct();
        struct.name = result.groups.name;
      }
    }
    const extendsRegExp = new RegExp(/extends\s+(?<extends>[a-zA-Z][a-zA-Z\d]*)/);
    if (extendsRegExp.test(content) && struct) {  // 若果struct未命名，就算声明了init方法,照样无视
      const result = extendsRegExp.exec(content);
      if (result && result.groups && result.groups.extends) {
        struct.extends = result.groups.extends;
      }
    }
    return struct;
  }

  /**
   * 分析接口
   * @param content 
   */
  public static resolveStructs(content: string): void {
    if (this.structs.length > 0) this.structs = new Array<Struct>();
    const lines: Array<string> = JassUtils.content2Lines(JassUtils.removeTextMacro(content));
    let lastStruct: Struct | null = null; // 不爲null時表示進入struct塊
    let lastMethod: Method | null = null; // 不爲null時表示進入method塊
    lines.forEach((line, index) => {
      const getStartIndex = () => line.length - line.trimStart().length;
      const struct = Struct.parse(line);
      if (struct) {
        lastStruct = struct;
        if (struct.name) {
          const nameIndex = line.indexOf(struct.name);
          struct.nameRange = new vscode.Range(index, nameIndex, index, nameIndex + struct.name.length);
        }
        struct.start = new vscode.Position(index, line.length - line.trimStart().length);
        const comment = Comment.parse(lines[index - 1]);
        if (comment) struct.description = comment.content;
        this.structs.push(struct);
      } else if (/^\s*endstruct/.test(line) && lastStruct) {
        lastStruct.end = new vscode.Position(index, getStartIndex() + "endstruct".length);
        lastStruct = null;
        if (lastMethod) lastMethod = null; // 退出interface塊時，若已進入method塊中，一并退出
      } else if (lastStruct) {
        const method = Method.parse(line);
        if (method) {
          lastMethod = method;
          if (method.name) {
            const nameIndex = line.indexOf(method.name);
            method.nameRange = new vscode.Range(index, nameIndex, index, nameIndex + method.name.length);
          }
          method.start = new vscode.Position(index, line.length - line.trimStart().length);
          const comment = Comment.parse(lines[index - 1]);
          if (comment) method.description = comment.content;
          lastStruct.methods.push(method);
        } else if (/^\s*endmethod/.test(line) && lastMethod) {
          lastMethod.end = new vscode.Position(index, getStartIndex() + "endmethod".length);
          lastMethod = null;
        } else if (lastMethod) {
          const local = Local.parse(line);
          if (local) {
            if (local.name) {
              const nameIndex = line.indexOf(local.name);
              local.nameRange = new vscode.Range(index, nameIndex, index, nameIndex + local.name.length);
            }
            local.range = new vscode.Range(index, line.length - line.trimStart().length, index, line.length);
            const comment = Comment.parse(lines[index - 1]);
            if (comment) local.description = comment.content;
            lastMethod.locals.push(local);
          }
        } else {
          const member = Member.parse(line);
          if (member) {
            const comment = Comment.parse(lines[index - 1]);
            if (comment) member.description = comment.content;
            lastStruct.members.push(member);
          }
        }
      }
    });
  }

}

class Interface {
  public name: string | null = null;
  public members: Member[] = new Array<Member>();
  public methods: Method[] = new Array<Method>();
  public start: vscode.Position | null = null;
  public end: vscode.Position | null = null;
  public nameRange: vscode.Range | null = null;
  public description: string | null = null;

  public origin(): string {
    return `interface${this.name ? " " + this.name : ""}\n\t${this.members.length}个成员变量\n\t${this.methods.length}个方法\nendinterface`;
  }

  public static parse(content: string): Interface | null {
    let inter = null;
    const nameRegExp = new RegExp(/^\s*interface\s+(?<name>[a-zA-Z][a-zA-Z\d]*)/);
    if (nameRegExp.test(content)) {
      const result = nameRegExp.exec(content);
      if (result && result.groups && result.groups.name && !JassUtils.isKeyword(result.groups.name)) {
        inter = new Interface();
        inter.name = result.groups.name;
      }
    }
    return inter;
  }

  private static interfaces: Array<Interface> = new Array<Interface>();

  public static getInterfaces(): Array<Interface> {
    return this.interfaces;
  }

  /**
   * 分析接口
   * @param content 
   */
  public static resolveInterfaces(content: string): void {
    if (this.interfaces.length > 0) this.interfaces = new Array<Interface>();
    const lines: Array<string> = JassUtils.content2Lines(JassUtils.removeTextMacro(content));
    let lastInter: Interface | null = null; // 不爲null時表示進入interface塊
    lines.forEach((line, index) => {
      const getStartIndex = () => line.length - line.trimStart().length;
      const inter = Interface.parse(line);
      if (inter) {
        lastInter = inter;
        if (inter.name) {
          const nameIndex = line.indexOf(inter.name);
          inter.nameRange = new vscode.Range(index, nameIndex, index, nameIndex + inter.name.length);
        }
        inter.start = new vscode.Position(index, line.length - line.trimStart().length);
        const comment = Comment.parse(lines[index - 1]);
        if (comment) inter.description = comment.content;
        this.interfaces.push(inter);
      } else if (/^\s*endinterface/.test(line) && lastInter) {
        lastInter.end = new vscode.Position(index, getStartIndex() + "endinterface".length);
        lastInter = null;
      } else if (lastInter) {
        const method = Method.parse(line);
        if (method) {
          const comment = Comment.parse(lines[index - 1]);
          if (comment) method.description = comment.content;
          lastInter.methods.push(method);
        }
        const member = Member.parse(line);
        if (member) {
          const comment = Comment.parse(lines[index - 1]);
          if (comment) member.description = comment.content;
          lastInter.members.push(member);
        }
      }
    });
  }

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
 */
class Jass {
  public comments: Comment[] = new Array<Comment>();
  public filePath: string = "";
  public globals: Global[] = new Array<Global>();
  public imports: Import[] = new Array<Import>();
  public funcs: Func[] = new Array<Func>();
  public natives: Native[] = new Array<Native>();
  public textMacros: TextMacro[] = new Array<TextMacro>();
  public librarys: Library[] = new Array<Library>();
  public scopes: Scope[] = new Array<Scope>();
  public structs: Struct[] = new Array<Struct>();
  public interfaces: Interface[] = new Array<Interface>();

  public types: Type[] = new Array<Type>();

  /**
   * @deprecated
   */
  public arrayTypes: ArrayType[] = new Array<ArrayType>();
  /**
   * @deprecated
   */
  public errors: Error[] = new Array<Error>();

  public static readonly keywordFunction = "function";
  public static readonly keywordEndFunction = "endfunction";
  public static readonly keywordConstant = "constant";
  public static readonly keywordNative = "native";
  public static readonly keywordLocal = "local";
  public static readonly keywordType = "type";
  public static readonly keywordSet = "set";
  public static readonly keywordCall = "call";
  public static readonly keywordTakes = "takes";
  public static readonly keywordReturns = "returns";
  public static readonly keywordExtends = "extends";
  public static readonly keywordArray = "array";
  public static readonly keywordTrue = "true";
  public static readonly keywordFalse = "false";
  public static readonly keywordNull = "null";
  public static readonly keywordNothing = "nothing";
  public static readonly keywordIf = "if";
  public static readonly keywordElse = "else";
  public static readonly keywordElseIf = "elseif";
  public static readonly keywordEndIf = "endif";
  public static readonly keywordThen = "then";
  public static readonly keywordLoop = "loop";
  public static readonly keywordEndLoop = "endloop";
  public static readonly keywordExitWhen = "exitwhen";
  public static readonly keywordReturn = "return";
  public static readonly keywordInteger = "integer";
  public static readonly keywordReal = "real";
  public static readonly keywordBoolean = "boolean";
  public static readonly keywordString = "string";
  public static readonly keywordHandle = "handle";
  public static readonly keywordCode = "code";
  public static readonly keywordAnd = "and";
  public static readonly keywordOr = "or";
  public static readonly keywordNot = "not";
  public static readonly keywordGlobals = "globals";
  public static readonly keywordEndGlobals = "endglobals";

  public static readonly keywords = [Jass.keywordFunction, Jass.keywordEndFunction, Jass.keywordConstant, Jass.keywordNative, Jass.keywordLocal, Jass.keywordType, Jass.keywordSet, Jass.keywordCall, Jass.keywordTakes, Jass.keywordReturns, Jass.keywordExtends, Jass.keywordArray, Jass.keywordTrue, Jass.keywordFalse, Jass.keywordNull, Jass.keywordNothing, Jass.keywordIf, Jass.keywordElse, Jass.keywordElseIf, Jass.keywordEndIf, Jass.keywordThen, Jass.keywordLoop, Jass.keywordEndLoop, Jass.keywordExitWhen, Jass.keywordReturn, Jass.keywordInteger, Jass.keywordReal, Jass.keywordBoolean, Jass.keywordString, Jass.keywordHandle, Jass.keywordCode, Jass.keywordAnd, Jass.keywordOr, Jass.keywordNot, Jass.keywordGlobals, Jass.keywordEndGlobals];

  // library|initializer|needs|requires|optional|endlibrary|scope|endscope|private|public|static|execute|evaluate|create|destroy|interface|endinterface|extends|struct|endstruct|method|endmethod|this|defaults|delegate|operator|module|endmodule|implement|hook|stub|debug|import

  public static readonly keywordLibrary = "library";
  public static readonly keyworInitializer = "initializer";
  public static readonly keywordNeeds = "needs";
  public static readonly keywordRequires = "requires";
  public static readonly keywordEndLibrary = "endlibrary";
  public static readonly keywordScope = "scope";
  public static readonly keywordEndScope = "endscope";
  public static readonly keywordPrivate = "private";
  public static readonly keywordPublic = "public";
  public static readonly keywordStatic = "static";
  public static readonly keywordInterface = "interface";
  public static readonly keywordEndInterface = "endinterface";
  public static readonly keywordImplement = "implement";
  public static readonly keywordStruct = "struct";
  public static readonly keywordEndStruct = "endstruct";
  public static readonly keywordMethod = "method";
  public static readonly keywordEndMethod = "endmethod";
  public static readonly keywordThis = "this";
  public static readonly keywordDelegate = "delegate";
  public static readonly keywordOperator = "operator";
  public static readonly keywordDebug = "debug";

  public static readonly vjassKeywords = [Jass.keywordLibrary, Jass.keyworInitializer, Jass.keywordNeeds, Jass.keywordRequires, Jass.keywordEndLibrary, Jass.keywordScope, Jass.keywordEndScope, Jass.keywordPrivate, Jass.keywordPublic, Jass.keywordStatic, Jass.keywordInterface, Jass.keywordEndInterface, Jass.keywordImplement, Jass.keywordStruct, Jass.keywordEndStruct, Jass.keywordMethod, Jass.keywordEndMethod, Jass.keywordThis, Jass.keywordDelegate, Jass.keywordOperator, Jass.keywordDebug];

  public static readonly allKeywords = [...Jass.keywords, ...Jass.vjassKeywords];

  public static readonly macroImport = "import";
  public static readonly macroTextMacro = "textmacro"
  public static readonly macroEndTextMacro = "endtextmacro"
  public static readonly macroRunTextMacro = "runtextmacro"

  public static readonly macros = [Jass.macroImport, Jass.macroTextMacro, Jass.macroEndTextMacro, Jass.macroRunTextMacro];

  public static readonly staticFunctionCreate = "create";
  public static readonly staticFunctionAllocate = "allocate";
  public static readonly staticFunctionDestroy = "destroy";

  public static readonly staticFunctions = [Jass.staticFunctionCreate, Jass.staticFunctionAllocate, Jass.staticFunctionDestroy];


  /**
   * 
   * @param uri j or ai 文件路徑
   */
  static parse(uri: string) {

  }

  static parseContent(content: string): Jass {
    // text macro -> scope -> library -> interface -> struct -> function -> global -> array object -> interface function -> import -> comment
    const jass = new Jass();

    Type.resolveTypes(content); // 分析當前文件類型
    Interface.resolveInterfaces(content);
    Struct.resolveStructs(content);

    const lineTexts = JassUtils.content2Lines(content);

    jass.natives = Native.parseNatives(content);
    jass.interfaces = Interface.getInterfaces();
    jass.structs = Struct.getStructs();

    // 備注：後續轉爲為last方式 目前使用boolean 2019年12月4日

    let inTextMacro = false;  // 记录是否进入文本宏
    let inScopeField = 0; // 域深度
    let inLibrary = false;  // 是否进入库
    let inFunction = false;
    let inGlobals = false;

    let lastFunction = null;  // 最后进入的方法，用于保存生命周期，方便后续local设置

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
      /**
       * 获取第一个字符开始的下标
       */
      const getStartIndex = (): number => lineText.length - lineText.trimLeft().length;
      const findDescription = (): string | null => {
        const preLine = lineTexts[i - 1];
        const comment = Comment.parse(preLine);
        return comment ? comment.content : null;
      };
      if (/^\s*\/\/!\s+textmacro/.test(lineText)) {
        // 内部未實現 占位
        inTextMacro = true;
        const textMacro = new TextMacro();
        textMacro.name = "";
        textMacro.takes = [];
        textMacro.content = "";
        textMacro.range = null;
        textMacro.nameRange = null;
        jass.textMacros.push(textMacro);
      } else if (/^\s*\/\/!\s+endtextmacro/.test(lineText)) {
        inTextMacro = false;
      } else if (inTextMacro) {
        jass.textMacros[jass.textMacros.length - 1].content += lineText;
      } else if (/^\s*\/\/!\s+import/.test(lineText)) {
      } else if (/^\s*\/\//.test(lineText)) {
      } else if (/^\s*globals/.test(lineText)) {
        inGlobals = true;
      } else if (/^\s*endglobals/.test(lineText)) {
        inGlobals = false;
      } else if (inGlobals) { // 在global块时会无视其他语法行
        const global = Global.parse(lineText);
        if (global) {
          if (global.name) {
            let nameIndex = lineText.indexOf(global.name);
            if (nameIndex >= 0) global.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + global.name.length);
          }
          global.range = new vscode.Range(i, getStartIndex(), i, lineText.length);
          global.description = findDescription();
          if (global.modifier == Modifier.Common) {
            jass.globals.push(global);
          } else {
            if (inLibrary) {
              if (inScopeField > 0) {
                const scopes = findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField);
                const scope = scopes[scopes.length - 1];
                if (scope) {
                  scope.globals.push(global);
                }
              } else {
                jass.librarys[jass.librarys.length - 1].globals.push(global);
              }
            } else if (inScopeField > 0) {
              const scopes = findScopes(jass.scopes, inScopeField);
              const scope = scopes[scopes.length - 1];
              if (scope) {
                scope.globals.push(global);
              }
            }
          }
        }
      } else if (/^\s*function\s+interface/.test(lineText)) { // 未實現
      } else if (/^\s*library/.test(lineText) && inScopeField == 0) { // 保证lib不被包含再scope中
        const library = Library.parse(lineText);
        if (library.name) {
          const nameIndex = lineText.indexOf(library.name);
          if (nameIndex > 0) library.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + library.name.length);
        }
        library.description = findDescription();
        library.start = new vscode.Position(i, getStartIndex());
        jass.librarys.push(library);
        inLibrary = true;
      } else if (/^\s*endlibrary/.test(lineText)) {
        if (inLibrary) {
          const library = jass.librarys[jass.librarys.length - 1];
          if (library) {
            library.end = new vscode.Position(i, getStartIndex() + "endlibrary".length);
          }
        }
        inLibrary = false;
      } else if (/^\s*scope/.test(lineText)) {
        inScopeField++;

        const scope = Scope.parse(lineText);
        if (scope.name) {
          const nameIndex = lineText.indexOf(scope.name);
          if (nameIndex > 0) scope.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + scope.name.length);
        }
        scope.description = findDescription();
        scope.start = new vscode.Position(i, getStartIndex());
        const scopes = inLibrary ? findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField) : findScopes(jass.scopes, inScopeField);
        scopes.push(scope);
      } else if (/^\s*endscope/.test(lineText)) {
        const scopes = inLibrary ? findScopes(jass.librarys[jass.librarys.length - 1].scopes, inScopeField) : findScopes(jass.scopes, inScopeField);
        const scope = scopes[scopes.length - 1];
        const EndscopeKeyword = "endscope";
        scope.end = new vscode.Position(i, lineText.indexOf(EndscopeKeyword) + EndscopeKeyword.length);
        if (inScopeField > 0) {
          inScopeField--;
        }
      } else if (/^\s*function(?!\s+interface)/.test(lineText) || /^\s*private\s+function/.test(lineText) || /^\s*public\s+function/.test(lineText)) {
        const func = Func.parse(lineText);
        if (func) {
          if (func.name) {
            const nameIndex = lineText.indexOf(func.name);
            func.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + func.name.length);
          }
          func.description = findDescription();
          func.start = new vscode.Position(i, getStartIndex());
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
          lastFunction = func;
        }
        inFunction = true;
      } else if (/^\s*endfunction/.test(lineText)) {
        if (inFunction) {
          const end = new vscode.Position(i, lineText.indexOf("endfunction") + "endfunction".length);
          if (inLibrary) {
            if (inScopeField > 0) {
              const lib = jass.librarys[jass.librarys.length - 1];
              const scopes = findScopes(lib.scopes, inScopeField);
              const scope = scopes[scopes.length - 1];
              const functions = scope.functions;
              const func = functions[functions.length - 1];
              if (func) {
                func.end = end;
              }
            } else {
              const library = jass.librarys[jass.librarys.length - 1];
              const functions = library.functions;
              const func = functions[functions.length - 1];
              if (func) {
                func.end = end;
              }
            }
          } else if (inScopeField > 0) {
            const scopes = findScopes(jass.scopes, inScopeField);
            const functions = scopes[scopes.length - 1].functions;
            const func = functions[functions.length - 1];
            if (func) {
              func.end = end;
            }

          } else {
            const func = jass.funcs[jass.funcs.length - 1]
            if (func) {
              func.end = end;
            }
          }
          inFunction = false;
        }
      } else if (inFunction) {
        const local = Local.parse(lineText);
        if (local) {
          if (local.name) {
            const nameIndex = lineText.indexOf(local.name);
            local.nameRange = new vscode.Range(i, nameIndex, i, nameIndex + local.name.length);
          }
          local.range = new vscode.Range(i, getStartIndex(), i, lineText.length);
          if (lastFunction) { //  进入方法行时定义
            lastFunction.locals.push(local);
          }
        }
      }
    }
    return jass;
  }

  private structOrInterfaceToItems = (si: Struct | Interface): Array<vscode.CompletionItem> => {
    const items = new Array<vscode.CompletionItem>();
    si.members.forEach(member => {
      if (member.name) {
        const item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
        item.detail = member.name;
        const ms = new vscode.MarkdownString();
        if (member.description) ms.appendText(member.description);
        ms.appendCodeblock(member.origin());
        item.documentation = ms;
        items.push(item);
      }
    });
    si.methods.forEach(method => {
      if (method.name) {
        const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
        item.detail = method.name;
        const ms = new vscode.MarkdownString();
        if (method.description) ms.appendText(method.description);
        ms.appendCodeblock(method.origin());
        item.documentation = ms;
        items.push(item);
      }
    });
    if (si instanceof Struct && si.extends) {
      const extend2 = [...this.interfaces, ...this.structs].find(is => is.name && is.name == si.extends);
      if (extend2) items.push(...this.structOrInterfacePublicToItems(extend2));
    }
    return items;
  }

  private structOrInterfacePublicToItems = (si: Struct | Interface): Array<vscode.CompletionItem> => {
    const items = new Array<vscode.CompletionItem>();
    si.members.forEach(member => {
      if (member.name && member.modifier != Modifier.Private && !member.isStatic) {
        const item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
        item.detail = member.name;
        const ms = new vscode.MarkdownString();
        if (member.description) ms.appendText(member.description);
        ms.appendCodeblock(member.origin());
        item.documentation = ms;
        items.push(item);
      }
    });
    si.methods.forEach(method => {
      if (method.name && method.modifier != Modifier.Private && !method.isStatic) {
        const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
        item.detail = method.name;
        const ms = new vscode.MarkdownString();
        if (method.description) ms.appendText(method.description);
        ms.appendCodeblock(method.origin());
        item.documentation = ms;
        items.push(item);
      }
    });
    if (si instanceof Struct && si.extends) {
      const extend2 = [...this.interfaces, ...this.structs].find(is => is.name && is.name == si.extends);
      if (extend2) items.push(...this.structOrInterfacePublicToItems(extend2));
    }
    return items;
  }

  private getScopesFunctions = (scopes: Array<Scope>): Array<Func> => {
    const functions = Array<Func>();
    const parseScopes = (scopes2: Array<Scope>) => {
      scopes2.forEach(value => {
        functions.push(...value.functions);
        if (value.scopes.length > 0) {
          parseScopes(value.scopes);
        }
      });
    }
    parseScopes(scopes);
    return functions;
  }

  /**
   * 
   * @param position 
   */
  public toCompletionItems(position?: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();
    // 基本方法
    this.funcs.map(func => func.toCompletionItem()).forEach(item => {
      if (item) items.push(item);
    });
    // 本地方法
    this.natives.map(value => value.toCompletionItem()).forEach(item => {
      if (item) items.push(item);
    });
    // 基本全局
    this.globals.map(value => value.toCompletionItem()).forEach(item => {
      if (item) items.push(item);
    });
    const scopes2Item = (scopes: Array<Scope>, prefix?: string | null): Array<vscode.CompletionItem> => {
      const completionItems = new Array<vscode.CompletionItem>();
      scopes.map(scope => {
        if (scope && scope.name) {
          const prefix2 = prefix ? prefix + "_" + scope.name : scope.name;
          return [scope.toCompletionItem(prefix), ...scope.functions.map(func => {
            if (position && scope.start && scope.end && new vscode.Range(scope.start, scope.end).contains(position)) {
              return func.toCompletionItem();
            }
            if (func.modifier == Modifier.Public) {
              return func.toCompletionItem(prefix2);
            } else return null;
          }), ...scope.globals.map(global => {
            if (position && scope.start && scope.end && new vscode.Range(scope.start, scope.end).contains(position)) {
              return global.toCompletionItem();
            }
            if (global.modifier == Modifier.Public) {
              return global.toCompletionItem(prefix2);
            } else return null;
          }), ...scopes2Item(scope.scopes, prefix2)];
        } else return [];
      }).flat().forEach(item => {
        if (item) completionItems.push(item);
      });
      return completionItems;
    }
    // library
    this.librarys.map(value => {
      if (value) {
        return [value.toCompletionItem(), ...value.functions.map(func => {
          if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
            return func.toCompletionItem();
          }
          if (func.modifier == Modifier.Public && value.initializer != func.name) {
            return func.toCompletionItem(value.name);
          } else return null;
        }), ...value.globals.map(global => {
          if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
            return global.toCompletionItem();
          }
          if (global.modifier == Modifier.Public) {
            return global.toCompletionItem(value.name);
          } else return null;
        }), ...scopes2Item(value.scopes, value.name)];
      } else return [];
    }).flat().forEach(item => {
      if (item) items.push(item);
    });
    // scope
    items.push(...scopes2Item(this.scopes));

    // interface
    this.interfaces.forEach(value => {
      if (value.name) {
        const item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.Interface);
        item.detail = value.name;
        const ms = new vscode.MarkdownString();
        if (value.description) ms.appendText(value.description);
        ms.appendCodeblock(value.origin());
        items.push(item);
      }
      if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
        items.push(...this.structOrInterfaceToItems(value));
      }
    });
    // struct
    this.structs.forEach(value => {
      if (value.name) {
        const item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.Struct);
        item.detail = value.name;
        const ms = new vscode.MarkdownString();
        if (value.description) ms.appendText(value.description);
        ms.appendCodeblock(value.origin());
        item.documentation = ms;
        items.push(item);
      }
      if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
        items.push(...this.structOrInterfaceToItems(value));
        // if(value.extends){
        //   resolveStructExtends(value);
        // }
      }
    });

    // 方法内部 参数 局部
    // 局部
    if (position) {
      const code = [...this.funcs, ...this.librarys.map(value => [...value.functions, ...this.getScopesFunctions(value.scopes)]).flat(1), ... this.getScopesFunctions(this.scopes), ...this.structs.map(struct => struct.methods).flat()].find(value => value.start && value.end && new vscode.Range(value.start, value.end).contains(position));
      if (code) {
        code.takes.forEach(value => {
          if (value.name) {
            const item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.TypeParameter);
            item.detail = value.name;
            const ms = new vscode.MarkdownString();
            ms.appendCodeblock(value.origin());
            item.documentation = ms;
            items.push(item);
          }
        });
        code.locals.forEach(value => {
          if (value.name) {
            const item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.Variable);
            item.detail = value.name;
            const ms = new vscode.MarkdownString();
            if (value.description) ms.appendText(value.description);
            ms.appendCodeblock(value.origin());
            item.documentation = ms;
            items.push(item);
          }
        });
      }
    }

    return items;
  }

  public toTypeCompletionItems(key: string, position?: vscode.Position): Array<vscode.CompletionItem> {
    const items = new Array<vscode.CompletionItem>();

    // this
    if (position && key == Jass.keywordThis) {
      const obj = [...this.interfaces, ...this.structs].find(value => {
        return value.start && value.end && new vscode.Range(value.start, value.end).contains(position);
      });
      if (obj) {
        items.push(...this.structOrInterfaceToItems(obj));
      }
    }

    // native function
    [...this.natives, ...this.funcs].forEach(value => {
      if (position && value.name && value.returnType && value.returnType == key) {
        const item = new vscode.CompletionItem(value.name, vscode.CompletionItemKind.Function);
        item.detail = value.name;
        const ms = new vscode.MarkdownString();
        if (value.description) ms.appendText(value.description);
        ms.appendCodeblock(value.origin());
        item.additionalTextEdits = [vscode.TextEdit.delete(new vscode.Range(new vscode.Position(position.line, position.character - key.length - 1), position))];
        items.push(item);
      }
    });

    // static
    [...this.interfaces, ...this.structs].forEach(value => {
      if (value.name && value.name == key) {
        if (value instanceof Struct) {
          Jass.staticFunctions.forEach(s => {
            items.push(new vscode.CompletionItem(s, vscode.CompletionItemKind.Function));
          });
        }
        if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
          // 私有 共有 静态
          value.members.forEach(member => {
            if (member.name && member.isStatic) {
              const item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
              item.detail = member.name;
              const ms = new vscode.MarkdownString();
              if (member.description) ms.appendText(member.description);
              ms.appendCodeblock(member.origin());
              items.push(item);
            }
          });
          value.methods.forEach(method => {
            if (method.name && method.isStatic) {
              const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Function);
              item.detail = method.name;
              const ms = new vscode.MarkdownString();
              if (method.description) ms.appendText(method.description);
              ms.appendCodeblock(method.origin());
              items.push(item);
            }
          });
        } else {
          // 共有静态
          value.members.forEach(member => {
            if (member.name && member.isStatic && member.modifier != Modifier.Private) {
              const item = new vscode.CompletionItem(member.name, vscode.CompletionItemKind.Property);
              item.detail = member.name;
              const ms = new vscode.MarkdownString();
              if (member.description) ms.appendText(member.description);
              ms.appendCodeblock(member.origin());
              items.push(item);
            }
          });
          value.methods.forEach(method => {
            if (method.name && method.isStatic && method.modifier != Modifier.Private) {
              const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Function);
              item.detail = method.name;
              const ms = new vscode.MarkdownString();
              if (method.description) ms.appendText(method.description);
              ms.appendCodeblock(method.origin());
              items.push(item);
            }
          });
        }
      }
    });

    // 全局 结构 接口
    this.globals.forEach(value => {
      if (value.name && value.name == key && !value.isArray) {
        const obj = [...this.interfaces, ...this.structs].find(obj => obj.name && obj.name == value.type);
        if (obj) {
          items.push(...this.structOrInterfacePublicToItems(obj));
        }
      }
    });



    // 局部 接口 结构
    if (position) {
      const code = [...this.funcs, ...this.librarys.map(value => [...value.functions, ...this.getScopesFunctions(value.scopes)]).flat(1), ... this.getScopesFunctions(this.scopes), ...this.structs.map(struct => struct.methods).flat()].find(value => value.start && value.end && new vscode.Range(value.start, value.end).contains(position));
      if (code) {
        code.takes.forEach(value => {
          if (value.name && value.name == key && value.type) {
            const obj = [...this.interfaces, ...this.structs].find(obj => obj.name && obj.name == value.type);
            if (obj) {
              items.push(...this.structOrInterfacePublicToItems(obj));
            }
          }
        });
        code.locals.forEach(value => {
          if (value.name && value.name == key && value.type) {
            const obj = [...this.interfaces, ...this.structs].find(obj => obj.name && obj.name == value.type);
            if (obj) {
              items.push(...this.structOrInterfacePublicToItems(obj));
            }
          }
        });
      }
    }

    return items;
  }

  public getScopes(myss?: Scope[], parent?: Scope | Library): Scope[] {
    const findScopes = (scopes: Scope[], parentScope?: Scope | Library): Scope[] => {
      const ss = new Array<Scope>();
      scopes.forEach(v => {
        const s = Object.assign(new Scope, v);
        if (parentScope) {
          s.name = `${parentScope.name}_${v.name}`;
        }
        ss.push(...findScopes(v.scopes, s))
        ss.push(s);
      })
      return ss;
    };
    return findScopes(myss ?? this.scopes, parent);
  }

  public getGlobals(): Global[] {
    const globals: Global[] = new Array<Global>();
    globals.push(...this.globals);

    const scopes2Globals = (scopes: Scope[]) => {
      scopes.forEach(value => {
        value.globals.forEach(global => {
          globals.push(Object.assign(new Global, global));
          const g = Object.assign(new Global, global);
          g.name = `${value.name}_${global.name}`;
          globals.push(g);
        });
      });
    };

    this.librarys.forEach(value => {
      value.globals.forEach(global => {
        globals.push(Object.assign(new Global, global));
        const g = Object.assign(new Global, global);
        g.name = `${value.name}_${global.name}`;
        globals.push(g);
      });
      scopes2Globals(this.getScopes(value.scopes, value));
    });

    scopes2Globals(this.getScopes());
    return globals;
  }

  public getFunctions(): Func[] {
    const functions = new Array<Func>();
    functions.push(...this.funcs);

    const scopes2functions = (scopes: Scope[]) => {
      scopes.forEach(value => {
        value.functions.forEach(func => {
          functions.push(Object.assign(new Func, func));
          const f = Object.assign(new Func, func);
          f.name = `${value.name}_${func.name}`;
          functions.push(f);
        });
      });
    };

    this.librarys.forEach(value => {
      value.functions.forEach(func => {
        functions.push(Object.assign(new Func, func));
        const f = Object.assign(new Func, func);
        f.name = `${value.name}_${func.name}`;
        functions.push(f);
      });
      scopes2functions(this.getScopes(value.scopes, value));
    });

    scopes2functions(this.getScopes());
    return functions;
  }

}

class JassBean {
  public filePath: string = "";
  public flag = "";
  public jass: Jass = new Jass;

  public constructor(filePath: string, flag: string, jass: Jass) {
    this.filePath = filePath;
    this.flag = flag;
    this.jass = jass;
  }
}

/**
 * 当前目录
 * 用户指定目录
 */
class FileManager {
  private static map: any = {};

  private static check(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  private static read(filePath: string): string {
    return fs.readFileSync(filePath).toString("utf8")
  }

  private static isFile(filePath: string): boolean {
    return fs.lstatSync(filePath).isFile();
  }

  /**
   * 若传入文件存在则更新，否者添加再更新
   * @param filePath j|ai文件绝对路径
   */
  public static put(filePath: string): void {
    if (this.check(filePath) && this.isFile(filePath)) {
      const parseStat = path.parse(filePath);
      if (parseStat.ext == ".ai" || parseStat.ext == ".j") {
        const content = this.read(filePath);
        const tartgetKey = Object.keys(this.map).find(value => path.parse(value).base == parseStat.base);
        if (tartgetKey) {
          const jassBean: JassBean = this.map[tartgetKey];
          const hash: string = md5(content);
          if (jassBean && jassBean.flag != hash) {
            // 更新
            console.log("更新")
            const jass = Jass.parseContent(content);
            jass.filePath = filePath;
            this.map[tartgetKey] = new JassBean(filePath, hash, jass);
          }
        } else {
          const hash: string = md5(content);
          console.log("新增")
          const jass = Jass.parseContent(content);
          jass.filePath = filePath;
          this.map[filePath] = new JassBean(filePath, hash, jass);
        }
      }
    }
  }

  public static putContent(filePath: string, content: string) {
    const parseStat = path.parse(filePath);
    if (parseStat.ext == ".ai" || parseStat.ext == ".j") {
      const tartgetKey = Object.keys(this.map).find(value => path.parse(value).base == parseStat.base);
      if (tartgetKey) {
        const jassBean: JassBean = this.map[tartgetKey];
        const hash: string = md5(content);
        if (jassBean && jassBean.flag != hash) {
          // 更新
          console.log("更新")
          const jass = Jass.parseContent(content);
          jass.filePath = filePath;
          this.map[tartgetKey] = new JassBean(filePath, hash, jass);
        }
      }
      // 暂时不做添加
      // else {
      //   const hash: string = md5(content);
      //   console.log("新增")
      //   const jass = Jass.parseContent(content);
      //   jass.filePath = filePath;
      //   this.map[filePath] = new JassBean(filePath, hash, jass);
      // }
    }
  }

  /**
   * 删除文件
   * @param filePath j|ai文件绝对路径
   */
  public static remove(filePath: string): void {
    delete this.map[filePath];
  }

  public static getJasss(): Array<Jass> {
    const jasss = new Array<Jass>();
    Object.values(this.map).forEach(value => {
      if (value instanceof JassBean) {
        jasss.push(value.jass);
      }
    });
    return jasss;
  }

  /**
   * 分析用户配置的路径
   */
  public static resolveConsumerFiles() {

    const includes1: any = vscode.workspace.getConfiguration().get("jass.includes");
    if (includes1 && includes1 instanceof Array) {
      includes1.forEach(filePath => {
        if (typeof (filePath) == 'string') {
          this.put(filePath.replace(/^\W/, ""));
        }
      });
    }
  }

  private constructor() { }

  public static findSameDirFiles(filePath: string): Array<string> {
    if (this.check(filePath) && this.isFile(filePath)) {
      const dir = path.parse(filePath).dir;
      const fileNames = fs.readdirSync(dir);
      return fileNames.map(fm => path.resolve(dir, fm));
    }
    return [];
  }

  public static resolveDirFiles(filePath: string) {
    this.findSameDirFiles(filePath).forEach(value => {
      if (path.parse(value).base != path.parse(filePath).base) {
        this.put(value.replace(/^\W/, ""));
      }
    });
  }

}
FileManager.put( path.resolve(__dirname, "../../src/resources/static/jass/common.j"));
FileManager.put( path.resolve(__dirname, "../../src/resources/static/jass/blizzard.j"));
FileManager.put( path.resolve(__dirname, "../../src/resources/static/jass/common.ai"));
FileManager.put( path.resolve(__dirname, "../../src/resources/static/jass/DzAPI.j"));
FileManager.resolveConsumerFiles();

vscode.workspace.onDidChangeConfiguration(event => {
  FileManager.resolveConsumerFiles();
});

class DefaultCompletionItemProvider implements vscode.CompletionItemProvider {
  public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();

    const jass = Jass.parseContent(document.getText());
    console.log(jass.getScopes());

    Type.getTypes().map(type => type.toCompletionItem()).forEach(item => {
      if (item) items.push(item);
    });
    Jass.allKeywords.forEach(keyword => {
      items.push(new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword));
    });
    Jass.macros.forEach(macro => {
      items.push(new vscode.CompletionItem(macro, vscode.CompletionItemKind.Property));
    });

    // items.push(...Jass.parseContent(document.getText()).toCompletionItems(position));

    // FileManager.resolveDirFiles(document.uri.fsPath);
    FileManager.putContent(document.uri.fsPath, document.getText());
    FileManager.getJasss().forEach(j => {
      items.push(...j.toCompletionItems());
    });


    return items;
  }
}



vscode.languages.registerCompletionItemProvider(language, new DefaultCompletionItemProvider);

class TypeCompletionItemProvider implements vscode.CompletionItemProvider {

  private findMatchType(document: vscode.TextDocument, position: vscode.Position): string | null {
    const content = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const result = content.match(/(?<key>[a-zA-Z][a-zA-Z0-9_]*)\.$/);// \s*
    let key = null;
    if (result && result.groups && result.groups.key) {
      key = result.groups.key;
    }
    return key;
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items = new Array<vscode.CompletionItem>();
    const key = this.findMatchType(document, position);
    if (key) {
      // const jass = Jass.parseContent(document.getText());
      // items.push(...jass.toTypeCompletionItems(key, position));

      // FileManager.resolveDirFiles(document.uri.fsPath);
      // FileManager.putContent(document.uri.fsPath,document.getText());
      FileManager.getJasss().forEach(j => {
        items.push(...j.toTypeCompletionItems(key));
      });

    }

    //items.push(...Jass.parseContent(document.getText()).toTypeCompletionItems(position));
    return items;
  }

}

vscode.languages.registerCompletionItemProvider(language, new TypeCompletionItemProvider(), ".");

class DefaultHover implements HoverProvider {

  /**
   * 未实现
   * @param document 
   * @param position 
   * @param token 
   */
  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const content = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const keyRegExp = /(?<key>[a-zA-Z][a-zA-Z0-9_]*)$/

    const key = document.getText(document.getWordRangeAtPosition(position));
    // 比对顺序
    // 关键字 -> 局部 -> 全局
    const markdownStrings = new Array<vscode.MarkdownString>();
    if (Jass.allKeywords.includes(key)) {
      const keyword = Jass.allKeywords.find(value => value == key);
      if (keyword) {
        const ms = new vscode.MarkdownString();
        ms.appendCodeblock(keyword);
        markdownStrings.push(ms);
      }
    }

    // FileManager.resolveDirFiles(document.uri.fsPath);

    const jassToMSs = (j: Jass, key: string, position?: vscode.Position): Array<vscode.MarkdownString> => {
      const mss = new Array<vscode.MarkdownString>();

      j.getFunctions().forEach(value => {
        if (position && value.start && value.end && new vscode.Range(value.start, value.end).contains(position)) {
          const local = value.locals.find(l => l && l.name == key);
          if (local) {
            const ms = new vscode.MarkdownString();
            if (local.description) ms.appendText(local.description);
            ms.appendCodeblock(local.origin());
            mss.push(ms);
          }
          const take = value.takes.find(t => t && t.name == key);

          if (take) {
            const ms = new vscode.MarkdownString();
            ms.appendCodeblock(take.origin());
            mss.push(ms);
          }
        }
      });

      const func = j.getFunctions().find(value => value && value.name == key);
      if (func) {
        const ms = new vscode.MarkdownString();
        if (func.description) ms.appendText(func.description);
        ms.appendCodeblock(func.origin());
        mss.push(ms);
      }
      console.log(j.getGlobals())
      const global = j.getGlobals().find(value => value && value.name == key);
      if (global) {
        console.log(global)
        const ms = new vscode.MarkdownString();
        if (global.description) ms.appendText(global.description);
        ms.appendCodeblock(global.origin());
        mss.push(ms);
      }

      const lib = j.librarys.find(value => value && value.name == key);
      if (lib) {
        const ms = new vscode.MarkdownString();
        if (lib.description) ms.appendText(lib.description);
        ms.appendCodeblock(lib.origin());
        mss.push(ms);
      }

      const scope = j.getScopes().find(value => value && value.name == key);
      if (scope) {
        const ms = new vscode.MarkdownString();
        if (scope.description) ms.appendText(scope.description);
        ms.appendCodeblock(scope.origin());
        mss.push(ms);
      }
      // 暂时不支持lib scope interface struct

      return mss;
    }
    FileManager.getJasss().forEach(jass => {
      markdownStrings.push(...jassToMSs(jass, key,
        jass.filePath && path.parse(jass.filePath).base == path.parse(document.uri.fsPath).base ? position : undefined));
    });





    return new vscode.Hover(markdownStrings);
  }

}

vscode.languages.registerHoverProvider(language, new DefaultHover);

vscode.languages.registerSignatureHelpProvider(language, {
  provideSignatureHelp(document, position, token, context) {
    const SignatureHelp = new vscode.SignatureHelp();
    const lineText = document.lineAt(position.line);
    let funcNames = [];
    let field = 1;
    let activeParameter = 0;
    let inString = false;
    for (let i = position.character - 1; i >= 0; i--) {
      const char = lineText.text.charAt(i);
      if (field > 0) {
        if (!inString && char == '"') {
          inString = true;
        } else if (inString && char == '"' && lineText.text.charAt(i - 1) != '\\') {
          inString = false;
        } else if (!inString && char == '(') {
          field--;
        } else if (!inString && char == ')') {
          field++;
        } else if (!inString && char == ',') {
          activeParameter++;
        }
      } else if (field == 0) {
        if (funcNames.length == 0 && /\s/.test(char)) {
          continue;
        } else if (/\w/.test(char)) {
          funcNames.push(char);
          // 向前預測
          if (funcNames.length > 0 && (/\W/.test(lineText.text.charAt(i - 1)) || i == 0)) {
            const funcName = funcNames.reverse().join("");
            const functions = new Array<Func>();
            FileManager.getJasss().forEach(x => {
              const func = x.getFunctions().find(s => {
                return s.name && s.name == funcName;
              });
              if (func) {
                if (func.name) {
                  const SignatureInformation = new vscode.SignatureInformation(`${func.name}(${func.takes.length > 0 ? func.takes.map(param => param.type + " " + param.name).join(", ") : "nothing"})->${func.returnType ?? "nothing"}`);
                  if (func.description) {
                    SignatureInformation.documentation = new vscode.MarkdownString().appendText(func.description);
                  }

                  func.takes.forEach(param => {
                    if (param.name) {
                      SignatureInformation.parameters.push(new vscode.SignatureInformation(param.name));
                    }
                  });
                  SignatureHelp.activeParameter = activeParameter;
                  SignatureHelp.signatures.push(SignatureInformation);
                }
              }
            });
          }
        }
      }
    }
    return SignatureHelp;
  }
}, "(", ",");

vscode.languages.registerDefinitionProvider(language, {
  provideDefinition(document, position, cancel) {
    const locations = new Array<vscode.Location>();
    let key = document.getText(document.getWordRangeAtPosition(position));

    // new vscode.Location

    FileManager.getJasss().forEach(x => {
      x.getGlobals().forEach(s => {
        if (s.name == key && s.nameRange) {
          locations.push(new vscode.Location(vscode.Uri.parse(`file:${x.filePath}`), s.nameRange));
        }
      });
      x.getFunctions().forEach(s => {
        if (s.name == key && s.nameRange) {
          console.log(x.filePath)
          locations.push(new vscode.Location(vscode.Uri.parse(`file:${x.filePath}`), s.nameRange));
        }
      });
    });

    return locations;
  }
});

/// 颜色提供
const convertInt2Hex = (int: number) => {
  return Math.ceil(int * 255).toString(16).padStart(2, "0")
}
const color2JColorCode = (color: vscode.Color) => {
  if (color instanceof vscode.Color) {
    let r = color.red
    let g = color.green
    let b = color.blue
    let a = color.alpha
    let colorCodeString = convertInt2Hex(a) + convertInt2Hex(r) + convertInt2Hex(g) + convertInt2Hex(b)
    return colorCodeString
  }
  return "00000000"
}

class JassDocumentColorProvider implements vscode.DocumentColorProvider {

  /// 颜色改变到文档
  provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
    let lineCount = document.lineCount
    let colors = new Array<vscode.ColorInformation>();
    // new RegExp(/\|[cC][\da-fA-F]{8}.+?\|[rR]/, "g")
    let colorReg = new RegExp(/\|[cC][\da-fA-F]{8}/, "g")
    for (let i = 0; i < lineCount; i++) {
      let lineText = document.lineAt(i).text
      let colotSet = lineText.match(colorReg)
      let posstion = 0
      if (colotSet) {
        colotSet.forEach(x => {
          posstion = lineText.indexOf(x, posstion)
          let range = new vscode.Range(i, posstion, i, posstion + x.length)
          let a = Number.parseInt("0x" + lineText.substr(posstion + 2, 2)) / 255
          let r = Number.parseInt("0x" + lineText.substr(posstion + 4, 2)) / 255
          let g = Number.parseInt("0x" + lineText.substr(posstion + 6, 2)) / 255
          let b = Number.parseInt("0x" + lineText.substr(posstion + 8, 2)) / 255
          colors.push(new vscode.ColorInformation(range, new vscode.Color(r, g, b, a)))
          posstion += x.length
        })
      }
    }
    return colors
  }
  /// 文档改变到颜色
  provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument; range: vscode.Range; }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
    let r = color.red
    let g = color.green
    let b = color.blue
    let a = color.alpha
    let document = context.document
    let range = context.range
    let documentText = document.getText(range)
    return [new vscode.ColorPresentation(`${
      documentText.substr(0, 2)
      }${
      color2JColorCode(new vscode.Color(r, g, b, a))
      }${
      documentText.substring(10)
      }`)]

  }


}

vscode.languages.registerColorProvider(language, new JassDocumentColorProvider);

/// 格式化
class JassDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {

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
      if (trimLeftText.startsWith(Jass.keywordFunction) ||
        ((trimLeftText.startsWith(Jass.keywordPrivate) || trimLeftText.startsWith(Jass.keywordPublic)) && trimLeftText.includes(Jass.keywordFunction)) ||
        trimLeftText.startsWith(Jass.keywordGlobals)||
        trimLeftText.startsWith(Jass.keywordLibrary) ||
        trimLeftText.startsWith(Jass.keywordScope) ||
        trimLeftText.startsWith(Jass.keywordInterface) ||
        trimLeftText.startsWith(Jass.keywordStruct ||
          trimLeftText.startsWith(Jass.keywordIf))||
          trimLeftText.startsWith(Jass.keywordLoop)) {
        if (line.firstNonWhitespaceCharacterIndex != field)
          textEdits.push(vscode.TextEdit.replace(new vscode.Range(line.lineNumber, 0, line.lineNumber, line.firstNonWhitespaceCharacterIndex),
            "".padStart(field, "\t")));
        field++;
      } else if (trimLeftText.startsWith(Jass.keywordEndFunction) ||
        trimLeftText.startsWith(Jass.keywordEndGlobals) ||
        trimLeftText.startsWith(Jass.keywordEndLibrary) ||
        trimLeftText.startsWith(Jass.keywordEndScope) ||
        trimLeftText.startsWith(Jass.keywordEndInterface) ||
        trimLeftText.startsWith(Jass.keywordEndStruct) ||
        trimLeftText.startsWith(Jass.keywordEndIf) ||
        trimLeftText.startsWith(Jass.keywordEndLoop)) {
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

vscode.languages.registerDocumentFormattingEditProvider(language, new JassDocumentFormattingEditProvider);

fs.writeFile(path.resolve(__dirname,"type"),
      '"' + Jass.vjassKeywords.join("\",\"") + '"',
      
      (err: NodeJS.ErrnoException | null)=>{});