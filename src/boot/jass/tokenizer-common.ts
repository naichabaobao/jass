import * as path from "path";
import * as fs from "fs";
import { Global, Node, NodeAst, parse, parse_node, slice_layer } from "./parser-vjass";
import { tokenize_for_vjass, tokenize_for_vjass_by_content } from "./tokenizer-vjass";



export class TextLine {
  public readonly lineNumber: number;
  public readonly text: string;

  public constructor(lineNumber: number, text: string) {
    this.lineNumber = lineNumber;
    this.text = text;
  }
}

export class Position {
  public line: number;
  public position: number;

  constructor(line: number = 0, position: number = 0) {
    this.line = line;
    this.position = position;
  }

}

export class Range {
  private _start: Position;
  private _end: Position;


  public get start(): Position {
    return this._start;
  }


  public get end(): Position {
    return this._end;
  }


  public set start(start: Position) {
    this._start = start;
    if (this.end.line < start.line) {
      this._end = this._start;
    } else if (this.end.line == start.line && this.end.position < start.position) {
      this._end.position = this._start.position;
    }
  }

  public set end(end: Position) {
    this._end = end;
  }


  public constructor(start: Position = new Position(), end: Position = new Position()) {
    this._start = start;
    this._end = end;
  }

  public static default(): Range {
    return new Range(new Position(0, 0), new Position(0, 0))
  }

  /**
   * @deprecated 使用from,更加贴近vscode方式
   * @param range 
   * @returns 
   */
  public setRange<T extends Range>(range: T) {
    this.start = range.start;
    this.end = range.end;
    return this;
  }

  public contains(positionOrRange: Position | Range): boolean {
    if (positionOrRange instanceof Position) {
      return (this.start.line < positionOrRange.line || (this.start.line == positionOrRange.line && this.start.position < positionOrRange.position))
        &&
        (this.end.line > positionOrRange.line || (this.end.line == positionOrRange.line && this.end.position > positionOrRange.position));
    } else {
      return (this.start.line < positionOrRange.start.line || (this.start.line == positionOrRange.start.line && this.start.position < positionOrRange.start.position))
        &&
        (this.end.line > positionOrRange.end.line || (this.end.line == positionOrRange.end.line && this.end.position > positionOrRange.end.position));
    }
  }

  public from<T extends Range>(range: T) {
    this.start = range.start;
    this.end = range.end;
    return this;
  }


}

export class Macro {
  public readonly type: string;
  public key?: string;
  public value?: string;

  constructor(type: string) {
    this.type = type;
  }
}

export class Import extends Range {
  public filePath: string | null = null;
  public type: "jass" | "vjass" | "zinc" | null = null;
  public readonly parent_document: Document;
  constructor(parent_document: Document, start?: Position, end?: Position) {
    super(start, end);

    this.parent_document = parent_document;
  }

  /**
   * 是否合法
   */
  public get is_legal(): boolean {
    const abs_path = this.abs_path;
    if (abs_path) {
      return fs.existsSync(abs_path);
    }
    return false;
  }

  public get abs_path(): string | null {
    if (!this.filePath) {
      return null;
    }
    return path.isAbsolute(this.filePath) ? this.filePath : path.resolve(path.parse(this.parent_document.filePath).dir, this.filePath);
  }

  public get document(): Document | undefined {
    if (this.is_legal) {
      if (!Global.has(this.abs_path!)) {
        parse(this.abs_path!);
      }
      return Global.get(this.abs_path!);
    }
    return;
  }

}

export class TextMacro extends Range {
  public name: string | null = null;
  public takes_string: string | null = null;

  public start_line: number = 0;
  public end_line: number = 0;

  public get line_number(): number {
    return this.end_line - this.start_line;
  }

  public is_complete: boolean = false;

  public readonly document: Document;

  public constructor(document: Document, start?: Position, end?: Position) {
    super(start, end);
    this.document = document;
  }

  public takes(): string[] {
    return this.takes_string?.split(",").map(take => take.trim()) ?? [];
  }

  public loop(callback: (document: Document, text_macro: TextMacro, lineNumber: number) => void) {
    for (let index = this.start_line + 1; index < this.end_line; index++) {
      callback(this.document, this, index);
    }
  }

  public lineAt(line: number, params: string[] = []): TextLine {
    let text = this.document.lineAt(line).text;
    this.takes().forEach((take, index) => {

      const param = params[index];
      if (param) {
        text = text.replace(new RegExp(`\\$${take}\\$`, "g"), param);
      }
    });
    return new TextLine(line, text);
  }
  public lineTokens(line: number, params: string[] = []): Token[] {
    const text_line = this.lineAt(line, params);
    return tokenize_for_vjass_by_content(text_line.text).map(toekn => {
      // @ts-expect-error
      toekn.line = line;
      toekn.start.line = line;
      toekn.end.line = line;
      return toekn;
    });
  }
}

export class RunTextMacro extends Range {
  public name: string | null = null;
  public param_string: string | null = null;
  public param_body_string: string | null = null;
  public readonly document: Document;

  public constructor(document: Document, start?: Position, end?: Position) {
    super(start, end);
    this.document = document;
  }

  /**
   * 是否合法
   */
  public get is_legal(): boolean {
    if (this.name == null || this.name.trim() == "" || this.param_body_string == null) {
      return false;
    }
    return true;
  }

  public params(): string[] {
    return this.param_string?.split(",").map(param => param.trim()) ?? [];
  }
  public param_values(): string[] {
    return this.params().map(param => {
      if (param.startsWith("\"")) {
        if (param.endsWith("\"")) {
          return param.substring(1, param.length - 1);
        } else {
          return param.substring(1);
        }
      } else {
        if (param.endsWith("\"")) {
          return param.substring(0, param.length - 1);
        } else {
          return param;
        }
      }
    }) ?? [];
  }

  public loop(callback: (document: Document, run_text_macro: RunTextMacro, text_macro: TextMacro, lineNumber: number) => void) {
    // 找到对应textmacro
    const text_macro = Global.getAllTextMacros().find(macro => {
      return macro.name != null && macro.name == this.name
    });


    if (text_macro) {
      text_macro.loop((document, text_macro, lineNumber) => {
        callback(document, this, text_macro, lineNumber);
      });
    }
  }
}


const DefineRegExp = /(?<type>#[a-zA-Z_$][a-zA-Z_0-9]*)(?:\s+(?<key>\b[a-zA-Z_$][a-zA-Z_0-9]*\b)(?:\s+(?<value>.+))?)?/;

const ImportStartWithRegExp = /\/\/!\s+import\b/;
const ImportRegExp = /\/\/!\s+import\b(?:\s+(?<type>jass|vjass|zinc))?/;
const ImportPathRegExp = /"(?<file_path>.+?)"/;

const TextMacroStartWithRegExp = /\/\/!\s+textmacro\b/;
const EndTextMacroStartWithRegExp = /\/\/!\s+endtextmacro\b/;
// const TextMacroRegExp = /\/\/!\s+textmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?:takes\s*(?<params>([a-zA-Z_0-9]+)(?:\s*,\s*[a-zA-Z_0-9]+)*))?/;
const TextMacroRegExp = /\/\/!\s+textmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?:takes\s+(?<takes>.+))?/;

const RunTextMacroStartWithRegExp = /\/\/!\s+runtextmacro\b/;
const RunTextMacroRegExp = /\/\/!\s+runtextmacro(?:\s+(?<name>[a-zA-Z0-9_]+))?\s*(?<param_body>\(\s*(?<params>.+)\s*\))?/;


export class Document {
  public readonly content: string;
  public readonly tokens: Token[] = [];
  public readonly lineCount: number = 0;
  public readonly imports: Import[] = [];
  public readonly macros: Macro[] = [];
  public readonly text_macros: TextMacro[] = [];
  public readonly run_text_macros: RunTextMacro[] = [];

  public readonly filePath: string;

  public constructor(filePath: string, content: string) {
    this.filePath = filePath;
    this.content = content;

    tokenize_for_vjass(this);



    this.preprocessing();

    this.parse_import();
    this.parse_textmacro();
    this.parse_runtextmacro();
    this.find_token_error();


    slice_layer(this);
    parse_node(this);

    this.find_node_error();

    if (this.root_node) {
      this.program = this.expand_node(this.root_node);
    }
    Global.set(filePath, this);
  }

  public program: NodeAst | null = null;

  public lineAt(line: number): TextLine {
    // console.time("line1")
    // const tokens = this.tokens.filter(token => token.start.line == line);
    // const textLine = new TextLine(line, tokens.length > 0 ? this.content.substring(tokens[0].position, tokens[tokens.length - 1].position + tokens[tokens.length - 1].length) : "");
    // console.timeEnd("line1")
    // console.time("line2")
    // const textLine2 = new TextLine(line, this.content.split("\n")[line]);
    // console.timeEnd("line2")
    // console.log(textLine2)
    // const index = this.line_points.findIndex(x => x.line == line);
    return new TextLine(line, this.line_points[line] ? this.content.substring(this.line_points[line].position, this.line_points[line + 1]?.position) : "");
  }

  /**
   * filter 或者 下标偏移遍历 都是可用的方式，filter最慢，下标偏移其次
   * slice 实现方式依赖 this.line_token_indexs 缓存偏移量,牺牲一定内存几万行的文件可以在10ms内完成
   * 
   * @param line 
   * @returns 
   */
  public lineTokens(line: number) {
    // const finded_index = this.line_points.findIndex(x => x.line == line);
    // if (finded_index == -1) {
    //   return [];
    // }
    // // const last_index = this.line_points.map(p => ({line: p.line, index: p.index})).lastIndexOf({line, index: finded_index});
    // const tokens:Token[] = [];
    // if (finded_index == -1) {
    //   return tokens;
    // }
    // for (let index = finded_index; index < this.tokens.length; index++) {
    //   const token = this.tokens[index];
    //   if (token.line == line) {
    //     tokens.push(token);
    //   } else if (token.line > line) {
    //     break;
    //   }
    // }
    // return tokens;
    // return this.tokens.slice(finded_index, last_index);
    // 太慢
    // return this.tokens.filter(x => x.line == line);
    const token_index_cache = this.line_token_indexs[line];
    if (!token_index_cache) {
      return [];
    }
    return this.tokens.slice(token_index_cache.index, token_index_cache.index + token_index_cache.count);
  }

  public root_node: Node | null = null;

  /**
   * 记录每个分行的点，使用这种方法只需消耗一点内存有几百倍的性能提升
   * @private 不要修改，有词法解析时写入
   */
  private line_points: {
    line: number,
    position: number
  }[] = [];

  /**
   * line成员跟数组下标保持一致，在空行的情况可以删除减少内存暂用，删除了也就意味着要遍历
   * @private 不要修改，有词法解析时写入
   */
  public line_token_indexs: {
    // 跟数组下标保持一致
    line: number,
    index: number,
    count: number,
  }[] = [];

  /**
   * 指示import文本替换怎遍历
   */
  public line_import_indexs: {
    line: number,
    is_import: boolean,
    index: number
  }[] = [];
  /**
   * textmacro 指示
   */
  public line_run_text_macro_indexs: {
    line: number,
    is_run_text_macro: boolean,
    index: number
  }[] = [];
  /**
   * textmacro 指示
   */
  public line_text_macro_indexs: {
    line: number,
    /**
     * -1 error
     * 0 normal
     * 1 textmacro header
     * 2 textmacro end
     * 3 textmacro body
     */
    text_macro_tag: -1 | 0 | 1 | 2 | 3,
    /**
     * 指向 只有text_macro_tag==1有效
     */
    index: number
  }[] = [];
  /**
   * 文本宏下标指引，用于#define
   */
  private macro_indexs: {
    line: number,
    is_macro: boolean,
    index: number
  }[] = [];

  public is_macro_line(line: number): boolean {
    return this.macro_indexs[line]?.is_macro ?? false;
  }
  /**
   * 判断行是不是import行
   * @param line 
   */
  public is_import_line(line: number): boolean {
    return this.line_import_indexs[line]?.is_import ?? false;
  }

  public is_run_text_macro_line(line: number): boolean {
    return this.line_run_text_macro_indexs[line]?.is_run_text_macro ?? false;
  }

  public is_text_macro_line(line: number): boolean {
    return this.line_text_macro_indexs[line]?.text_macro_tag != 0 ?? false;
  }

  public loop(callback: (document: Document, lineNumber: number) => void, run_callback: (document: Document, run_text_macro: RunTextMacro, text_macro: TextMacro, lineNumber: number) => void, start_line: number = 0, length: number = this.lineCount) {
    for (let index = start_line; index < length; index++) {
      if (this.is_macro_line(index)) {
        continue;
      } else if (this.is_run_text_macro_line(index)) {
        const run_text_macro_index = this.line_run_text_macro_indexs[index].index;
        const run_text_macro = this.run_text_macros[run_text_macro_index];
        if (run_text_macro) {
          run_text_macro.loop(run_callback);
        }
      } else if (this.is_text_macro_line(index)) {
        continue;
      } else {
        callback(this, index);
      }
    }
  }


  token_errors: { token: Token, message: string, charge?: number }[] = [];
  public add_token_error(token: Token, message: string) {
    this.token_errors.push({ token, message });
  }
  node_errors: { node: Node, message: string, charge?: number }[] = [];
  public add_node_error(node: Node, message: string) {
    this.node_errors.push({ node, message });
  }

  public foreach(callback: (node: Node) => void) {
    const fallback = (node: Node) => {
      if (node.type == "zinc") {
        return;
      }
      callback(node);
      if (node.children.length > 0) {
        node.children.forEach(child_node => {
          fallback(child_node);
        });
      }
    }
    if (this.root_node) {
      fallback(this.root_node);
    }
  }

  private preprocessing() {
    // const macros:Macro[] = [];
    let last_macro: Macro | null = null;
    for (let index = 0; index < this.lineCount; index++) {
      const textLine = this.lineAt(index);
      const text = textLine.text.replace("\n", "");
      if (last_macro) {
        if (text.endsWith("\\")) {
          last_macro.value += text.slice(0, text.length - 1);
          this.macro_indexs.push({
            line: index,
            is_macro: true,
            index: this.macros.length - 1
          });
        } else {
          last_macro.value += text;
          last_macro = null;

          this.macro_indexs.push({
            line: index,
            is_macro: false,
            index: -1
          });
        }
      } else {
        if (text.trimStart().startsWith("#")) {
          const result = DefineRegExp.exec(text);
          if (result?.groups) {
            const macro = new Macro(result.groups["type"]);// , new Position(textLine.lineNumber, text.indexOf("#")), new Position(textLine.lineNumber, text.length)
            this.macros.push(macro);
            if (result.groups["key"]) {
              macro.key = result.groups["key"];
            }
            const value = result.groups["value"];
            if (value) {
              if (value.endsWith("\\")) {
                macro.value = value.slice(0, value.length - 1);
                last_macro = macro;
              } else {
                macro.value = value;
              }
            }
          }
          this.macro_indexs.push({
            line: index,
            is_macro: true,
            index: this.macros.length - 1
          });
        } else {
          this.macro_indexs.push({
            line: index,
            is_macro: false,
            index: -1
          });
        }
      }
    }
  }


  private parse_import() {
    for (let index = 0; index < this.lineCount; index++) {
      const tokens = this.lineTokens(index);
      if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && ImportStartWithRegExp.test(tokens[0].getText())) {
        const token = tokens[0];
        const text = token.getText();
        const result = ImportRegExp.exec(text);
        const vjass_import = new Import(this, token.start, token.end);
        this.imports.push(vjass_import);
        if (result) {
          if (result.groups && result.groups["type"]) {
            // @ts-expect-error
            vjass_import.type = result.groups["type"];
          }
          const filePathResult = ImportPathRegExp.exec(text);
          if (filePathResult && filePathResult.groups && filePathResult.groups["file_path"]) {
            vjass_import.filePath = filePathResult.groups["file_path"];
          }
        }
        this.line_import_indexs.push({
          line: index,
          is_import: true,
          index: this.imports.length - 1
        });
      } else {
        this.line_import_indexs.push({
          line: index,
          is_import: false,
          index: -1
        });
      }
    }
  }





  /**
   * 找到范围并解析
   * @param this 
   */
  private parse_textmacro() {
    // const macros:Macro[] = [];
    let text_macro: TextMacro | null = null;
    for (let index = 0; index < this.lineCount; index++) {
      const macro_index = this.macro_indexs[index];
      const tokens = this.lineTokens(index);
      if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && TextMacroStartWithRegExp.test(tokens[0].getText())) {
        const token = tokens[0];
        const text = token.getText();
        const result = TextMacroRegExp.exec(text);

        text_macro = new TextMacro(this, token.start, token.end);
        text_macro.start_line = index;
        text_macro.end_line = index;
        if (result && result.groups) {
          if (result.groups["name"]) {
            text_macro.name = result.groups["name"];
          }
          if (result.groups["takes"]) {
            text_macro.takes_string = result.groups["takes"];
          }
        }
        this.text_macros.push(text_macro);
        this.line_text_macro_indexs.push({
          line: index,
          text_macro_tag: 1,
          index: this.text_macros.length - 1
        });
      } else if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && EndTextMacroStartWithRegExp.test(tokens[0].getText())) {
        if (text_macro) {
          text_macro.is_complete = true;
          this.line_text_macro_indexs.push({
            line: index,
            text_macro_tag: 2,
            index: 0
          });
          text_macro.end_line = index;
        } else {
          // 错误
          this.line_text_macro_indexs.push({
            line: index,
            text_macro_tag: -1,
            index: 0
          });
        }
        text_macro = null;

      } else if (text_macro && macro_index.is_macro == false) {
        this.line_text_macro_indexs.push({
          line: index,
          text_macro_tag: 3,
          index: 0
        });
        text_macro.end_line = index;
      } else {
        this.line_text_macro_indexs.push({
          line: index,
          text_macro_tag: 0,
          index: 0
        });
      }
    }
  }

  private parse_runtextmacro() {
    for (let index = 0; index < this.lineCount; index++) {
      const text_macro_index = this.line_text_macro_indexs[index];
      const import_index = this.line_import_indexs[index];
      if (text_macro_index.text_macro_tag == 0 && import_index.is_import == false) { // 正常行
        const tokens = this.lineTokens(index);
        if (tokens[0] && tokens[0].type == TokenType.Conment && tokens[0].getText().startsWith("//!") && RunTextMacroStartWithRegExp.test(tokens[0].getText())) {
          const token = tokens[0];
          const text = token.getText();
          const result = RunTextMacroRegExp.exec(text);
          const run_text_macro = new RunTextMacro(this, token.start, token.end);
          if (result && result.groups) {
            if (result.groups["name"]) {

              run_text_macro.name = result.groups["name"];
            }
            if (result.groups["param_body"]) {
              run_text_macro.param_body_string = result.groups["param_body"];
            }
            if (result.groups["param_body"]) {
              run_text_macro.param_string = result.groups["params"];
            }
          }
          this.run_text_macros.push(run_text_macro);
          this.line_run_text_macro_indexs.push({
            line: index,
            is_run_text_macro: true,
            index: this.run_text_macros.length - 1
          });
        } else {
          this.line_run_text_macro_indexs.push({
            line: index,
            is_run_text_macro: false,
            index: -1
          });
        }
      } else {
        this.line_run_text_macro_indexs.push({
          line: index,
          is_run_text_macro: false,
          index: -1
        });
      }
    }
  }

  private find_token_error() {
    const handle = (tokens:Token[]) => {
      tokens.forEach(token => {
        let temp:string;
        const text = () => {
          if (!temp) {
            temp = token.getText();
          }
          return temp;
        };
        if (token.type == TokenType.Unkown) {
          this.add_token_error(token, `lexical error,unkown token '${text().substring(0, 100)}'!`);
        } else if (!token.is_complete) {
          if (token.type == TokenType.String) {
            this.add_token_error(token, `string need package in "...",error string '${text().substring(0, 100)}'!`);
          } else if (token.type == TokenType.Mark) {
            this.add_token_error(token, `integer identifier mark format is 'A' or 'AAAA',error integer identifier mark '${text().substring(0, 100)}'!`);
          } else if (token.type == TokenType.Integer) {
            this.add_token_error(token, `error integer expression '${text().substring(0, 100)}'!`);
          } else {
            this.add_token_error(token, `error expression '${text().substring(0, 100)}'!`);
          }
        } else if (token.type == TokenType.Integer) {
          if (text().startsWith("0x") && text().length > 10) {
            this.add_token_error(token, `out of range '${text()}'!`);
          } else if (text().startsWith("$") && text().length > 9) {
            this.add_token_error(token, `out of range '${text()}'!`);
          }
        }
      });
    };
    this.loop((document, line) => {
          handle(document.lineTokens(line));
      }, (document, run_text_macro, macro, line) => {
          handle(macro.lineTokens(line, run_text_macro.param_values()));
      });
  }
  private find_node_error() {
    this.foreach((node) => {
      if (!node.end_line) {
        // 避免根节点未闭合
        if (node.parent != null) {
          this.add_node_error(node, `end tag not found`);
        }
      }
    });
  }

  // 对外接口

  /**
   * 
   * @param node 
   */
  private expand_node<T extends NodeAst>(node: Node) {
    const object: T = node.data ?? new NodeAst();
    if (node.parent) {
      const parent: T = node.parent.data;
      object.parent = parent;
      const index = node.parent.children.indexOf(node);
      if (index != -1) {
        const previous = node.parent.children[index - 1]?.data ?? null;
        object.previous = previous;
        const next = node.parent.children[index + 1]?.data ?? null;
        object.next = next;
      }
    }
    node.children.forEach(child => {
      object.children.push(this.expand_node(child));
    });
    return object;
  }
}



export class TokenType {
  static Conment = "Conment";
  static Identifier = "Identifier";
  static Operator = "Operator";
  static Integer = "Integer";
  static Real = "Real";
  static String = "String";
  static Mark = "Mark";
  static Unkown = "Unkown";
  static BlockComment = "BlockComment";
};
export class Token extends Range {
  public readonly document: Document;
  public readonly line: number;
  public readonly character: number;
  public readonly position: number;
  public readonly length: number;
  public readonly type: string;
  public readonly is_complete: boolean;
  //@ts-ignore
  // public readonly type_name: string;


  public constructor(document: Document, line: number, character: number, position: number, length: number, type: string, is_complete: boolean = true) {
    super(new Position(line, character), new Position(line, character + length));
    this.document = document;
    this.line = line;
    this.character = character;
    this.position = position;
    this.length = length;
    this.type = type;
    this.is_complete = is_complete;

    //   if (this.type == TokenType.Conment) {
    //     return "Comment";
    //   } else if (this.type == TokenType.Identifier) {
    //     return "Identifier";
    //   } else if (this.type == TokenType.Operator) {
    //     return "Operator";
    //   } else if (this.type == TokenType.Integer) {
    //     return "Integer";
    //   } else if (this.type == TokenType.Real) {
    //     return "Real";
    //   } else if (this.type == TokenType.String) {
    //     return "String";
    //   } else if (this.type == TokenType.Mark) {
    //     return "Mark";
    //   } else {
    //     return "Unkown";
    //   }
  }

  public getText(): string {
    return this.document.content.substring(this.position, this.position + this.length);
  }

  public is_value(): boolean {
    return this.type == TokenType.Integer || this.type == TokenType.Real || this.type == TokenType.String || this.type == TokenType.Mark;
  }


  // public get type_name() : string {
  //     if (this.type == TokenType.Conment) {
  //         return "Comment";
  //       } else if (this.type == TokenType.Identifier) {
  //         return "Identifier";
  //       } else if (this.type == TokenType.Operator) {
  //         return "Operator";
  //       } else if (this.type == TokenType.Integer) {
  //         return "Integer";
  //       } else if (this.type == TokenType.Real) {
  //         return "Real";
  //       } else if (this.type == TokenType.String) {
  //         return "String";
  //       } else if (this.type == TokenType.Mark) {
  //         return "Mark";
  //       } else {
  //         return "Unkown";
  //       }
  // }


  public clone(): Token {
    return Object.assign({}, this) as Token;
  }


  public get is_block_comment(): boolean {
    return this.type == TokenType.BlockComment;
  }
  public get is_comment(): boolean {
    return this.type == TokenType.Conment;
  }
  public get is_identifier(): boolean {
    return this.type == TokenType.Identifier;
  }
  public get is_operator(): boolean {
    return this.type == TokenType.Operator;
  }

}

export interface TokenHandleResult {
  state?: number;
  length?: number;
  token?: Token | null;
}


export function tokenize(document: Document, call: (document: Document, line: number, character: number, position: number, char: string, next_char: string, state: number, length: number) => TokenHandleResult | undefined) {
  let line: number = 0;;
  let character: number = 0;
  let state: number = 0;
  let length: number = 0;
  const tokens: Token[] = [];
  const content = document.content;
  // @ts-expect-error
  document.line_points.push({
    line: 0,
    position: 0
  });
  document.line_token_indexs.push({
    line: 0,
    index: 0,
    count: 0
  });
  const last_line_token_indexs = () => {
    return document.line_token_indexs[document.line_token_indexs.length - 1];
  };
  for (let index = 0; index < content.length; index++) {
    const char = content.charAt(index);
    const next_char = content.charAt(index + 1);
    // const new_state = is_only_jass ? jass_token.token_handle(context, line, character, index, char, next_char, state, length) : vjass_token.token_handle(context, line, character, index, char, next_char, state, length);
    const new_state = call(document, line, character, index, char, next_char, state, length);

    // substate = new_state.substate;
    if (char == "\n") {
      line++;
      character = 0;

      // @ts-expect-error
      document.line_points.push({
        line,
        position: index + 1
      });
      document.line_token_indexs.push({
        line,
        index: tokens.length,
        count: 0
      });
    } else {
      character++;
    }

    if (new_state?.state !== undefined) {
      state = new_state.state;
    }
    if (new_state?.length !== undefined) {
      length = new_state.length;
    }
    if (new_state?.token) {
      tokens.push(new_state.token);
      last_line_token_indexs().count++;
    }
  }
  // @ts-expect-error
  document.tokens = tokens;
  // @ts-expect-error
  document.lineCount = line + 1;
  return document;
}














// function slice_layer(document: any) {
//   throw new Error("Function not implemented.");
// }

// function parse_node(document: any) {
//   throw new Error("Function not implemented.");
// }
