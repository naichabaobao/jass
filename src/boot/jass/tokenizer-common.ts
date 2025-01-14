import * as path from "path";
import * as fs from "fs";
import { Call, Comment, Func, GlobalContext, GlobalVariable, Globals, If, Interface, Library, Local, Loop, Member, Method, Native, NodeAst, Other, Scope, Set, Struct, Take, Type, parse, parse_function, parse_globals, parse_if, parse_interface, parse_library, parse_line_call, parse_line_comment, parse_line_else, parse_line_else_if, parse_line_end_tag, parse_line_exitwhen, parse_line_local, parse_line_member, parse_line_method, parse_line_native, parse_line_return, parse_line_set, parse_line_type, parse_loop, parse_method, parse_scope, parse_struct } from "./parser-vjass";
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
      if (!GlobalContext.has(this.abs_path!)) {
        parse(this.abs_path!);
      }
      return GlobalContext.get(this.abs_path!);
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
    const text_macro = GlobalContext.getAllTextMacros().find(macro => {
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

class Segment {
  parent: Block|null = null;

  // 用于接收解析后的对象
  public data:any;

  type: "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type";

  constructor(type: "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type", tokens:Token[]) {
    this.type = type;
    this.tokens = tokens;
  }

  tokens:Token[] = [];
}
class Block {
  parent: Block|null = null;
  children: (Block|Segment)[] = [];

  // 用于接收解析后的对象
  public data:any;

  type: "zinc" | "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop";
  constructor(type: "zinc" | "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop", start_tokens:Token[]) {
    this.type = type;

    this.start_tokens = start_tokens;
  }

  start_tokens:Token[] = [];
  end_tokens:Token[] = [];

  public last_block():Block {
    if (this.children.length > 0) {
      const blocks:Block[] = this.children.filter((x) => {
        return x instanceof Block;
      })as Block[];
      if (blocks.length > 0) {
        return (blocks[blocks.length - 1]).last_block();
      } else {
        return this;
      }
    } else {
      return this;
    }
  }
}

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

    GlobalContext.set(filePath, this);

    this.parse_runtextmacro();
    this.find_token_error();


    this.object_list = this.slice_layer();
    this.parse_node();
    // this.find_node_error();
    
    
    if (this.object_list) {
      const root_node = new NodeAst(this);
      this.object_list.forEach(x => {
        root_node.children.push(this.expand_node(x));
      });
      this.program = root_node;

      this.classification();
      
    }

    // 不需要的对象，设置为null
    // this.root_node = null;

    this.end_tag_error();
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

  // public root_node: Node | null = null;

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
  private line_import_indexs: {
    line: number,
    is_import: boolean,
    index: number
  }[] = [];
  /**
   * textmacro 指示
   */
  private line_run_text_macro_indexs: {
    line: number,
    is_run_text_macro: boolean,
    index: number
  }[] = [];
  /**
   * textmacro 指示
   */
  private line_text_macro_indexs: {
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
  // node_errors: { node: Node, message: string, charge?: number }[] = [];
  // public add_node_error(node: Node, message: string) {
  //   this.node_errors.push({ node, message });
  // }

  // public foreach(callback: (node: Node) => void) {
  //   const fallback = (node: Node) => {
  //     if (node.type == "zinc") {
  //       return;
  //     }
  //     callback(node);
  //     if (node.children.length > 0) {
  //       node.children.forEach(child_node => {
  //         fallback(child_node);
  //       });
  //     }
  //   }
  //   if (this.root_node) {
  //     fallback(this.root_node);
  //   }
  // }

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
  // private find_node_error() {
  //   this.foreach((node) => {
  //     if (!node.end_line) {
  //       // 避免根节点未闭合
  //       if (node.parent != null) {
  //         this.add_node_error(node, `end tag not found`);
  //       }
  //     }
  //   });
  // }

  // private for_line(line:number, tokens: Token[]) {

  // }

  private is_start_with(tokens: Token[], keyword: string|((token:Token) => boolean), excute_string: string[] = ["debug"]):boolean {
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (token.is_block_comment) {
        continue;
      } else if (excute_string.includes(token.getText())) {
        continue;
      } else if (typeof keyword == "string" ? token.getText() == keyword : keyword(token)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  /**
   * 文档最根部的对象
   * 根据每一行分层
   */
  private object_list:(Block|Segment)[] = [];
  private slice_layer() {
    const blocks:Block[] = [];
    const list:(Block|Segment)[] = [];
    const last_block = () => {
      return blocks[blocks.length - 1];
    }

    let in_interface = false;
    const handle_one_line = (tokens: Token[]) => {
      const handle = () => {
        const push_block_to = (block:Block) => {
          if (blocks.length > 0) {
            block.parent = blocks[blocks.length - 1];
            blocks[blocks.length - 1].children.push(block);
          } else {
            list.push(block);
          }
          blocks.push(block);
        };
        const push_segment_to = (segment:Segment) => {
          if (blocks.length > 0) {
            segment.parent = blocks[blocks.length - 1];
            blocks[blocks.length - 1].children.push(segment);
          } else {
            list.push(segment);
          }
        };
        if (this.is_start_with(tokens, "function", ["debug", "private", "public"])) {
          push_block_to(new Block("func", tokens));
        } else if (this.is_start_with(tokens, "method", ["debug", "private", "public", "static", "stub"])) {
          if (in_interface) {
            push_segment_to(new Segment("method", tokens));
          } else {
            push_block_to(new Block("method", tokens));
          }
        } else if (this.is_start_with(tokens, "struct", ["debug", "private", "public"])) {
          push_block_to(new Block("struct", tokens));
        } else if (this.is_start_with(tokens, "interface", ["debug", "private", "public"])) {
          push_block_to(new Block("interface", tokens));
          in_interface = true;
        } else if (this.is_start_with(tokens, "library", ["debug", "private", "public"])) {
          push_block_to(new Block("library", tokens));
        } else if (this.is_start_with(tokens, "globals")) {
          push_block_to(new Block("globals", tokens));
        } else if (this.is_start_with(tokens, "scope", ["debug", "private", "public"])) {
          push_block_to(new Block("scope", tokens));
        } else if (this.is_start_with(tokens, "if", ["debug", "static"])) {
          push_block_to(new Block("if", tokens));
        } else if (this.is_start_with(tokens, "loop")) {
          push_block_to(new Block("loop", tokens));
        } else if (this.is_start_with(tokens, "zinc")) {
          push_block_to(new Block("zinc", tokens));
        } 
        // "local" | "set" | "call" | "return" | "comment" | "empty" | "other" | "member" | "native" | "method" | "exitwhen" | "elseif" | "else" | "type"
        else if (this.is_start_with(tokens, "local")) {
          push_segment_to(new Segment("local", tokens));
        } else if (this.is_start_with(tokens, "set")) {
          push_segment_to(new Segment("set", tokens));
        } else if (this.is_start_with(tokens, "call")) {
          push_segment_to(new Segment("call", tokens));
        } else if (this.is_start_with(tokens, "return")) {
          push_segment_to(new Segment("return", tokens));
        } else if (this.is_start_with(tokens, "native",  ["debug", "private", "public", "static", "stub", "constant"])) {
          push_segment_to(new Segment("native", tokens));
        } else if (this.is_start_with(tokens, "exitwhen")) {
          push_segment_to(new Segment("exitwhen", tokens));
        } else if (this.is_start_with(tokens, "elseif")) {
          push_segment_to(new Segment("elseif", tokens));
        } else if (this.is_start_with(tokens, "else")) {
          push_segment_to(new Segment("else", tokens));
        } else if (this.is_start_with(tokens, "type")) {
          push_segment_to(new Segment("type", tokens));
        } else if (this.is_start_with(tokens, (t) => t.is_identifier)) {
          push_segment_to(new Segment("member", tokens));
        } else if (this.is_start_with(tokens, (t) => t.is_comment)) {
          push_segment_to(new Segment("comment", tokens));
        } else if (this.is_start_with(tokens, (t) => !!t)) {
          push_segment_to(new Segment("other", tokens));
        }
      };
      /*
      if (blocks.length > 0) {
        const block = last_block();
        const around = (type: "zinc" | "library" | "struct" | "interface" | "method" | "func" | "globals" | "scope" | "if" | "loop", keyword: string) => {
          if (block.type == type) {
            if (this.is_start_with(tokens, keyword)) {
              if (keyword == "endinterface") {
                in_interface = false;
              }
              block.end_tokens = tokens;
              blocks.pop();
            } else {
              handle();
            }
          } else {
            return around;
          }
          around("library", "endlibrary")?.call(this, "func", "endfunction")?.call(this, "globals", "endglobals")?.call(this, "if", "endif")?.call(this, "interface", "endinterface")?.call(this, "loop", "endloop")?.call(this, "method", "endmethod")?.call(this, "scope", "endscope")?.call(this, "struct", "endstruct")?.call(this, "zinc", "endzinc");
        }
      } else {
        handle();
      }
      */
      if (blocks.length > 0) {
        const last_block = blocks[blocks.length - 1];
        if (last_block.type == "func" && this.is_start_with(tokens, "endfunction")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "globals" && this.is_start_with(tokens, "endglobals")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "if" && this.is_start_with(tokens, "endif")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "loop" && this.is_start_with(tokens, "endloop")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "interface" && this.is_start_with(tokens, "endinterface")) {
          in_interface = false;
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "method" && this.is_start_with(tokens, "endmethod")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "library" && this.is_start_with(tokens, "endlibrary")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "globals" && this.is_start_with(tokens, "endglobals")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "scope" && this.is_start_with(tokens, "endscope")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "struct" && this.is_start_with(tokens, "endstruct")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else if (last_block.type == "zinc" && this.is_start_with(tokens, "endzinc")) {
          last_block.end_tokens = tokens;
          blocks.pop();
        } else {
          handle();
        }
      } else {
        handle();
      }

    };
    // 遍历行
    this.loop((document, line) => {
      const tokens = document.lineTokens(line);
      handle_one_line(tokens);
      
    }, (document, run_text_macro, macro, line) => {
      const tokens = macro.lineTokens(line, run_text_macro.param_values());
      handle_one_line(tokens);
    });

    return list;
  }


  /**
   * 根据program_list内部tokens分别解析
   */
  private parse_node() {
    const handle_on_object = (node: Block | Segment) => {
      if (node instanceof Block) {
        if (node.type == "library") {
          const library = parse_library(this, node.start_tokens);
          parse_line_end_tag(this, node.end_tokens, library, "endlibrary");

          node.data = library;
        }
        else if (node.type == "scope") {
            const scope = parse_scope(this, node.start_tokens);
            parse_line_end_tag(this, node.end_tokens, scope, "endscope");
            node.data = scope;
        }
        else if (node.type == "interface") {
            const inter = parse_interface(this, node.start_tokens);
            parse_line_end_tag(this, node.end_tokens, inter, "endinterface");
            node.data = inter;
        }
        else if (node.type == "struct") {
            const struct = parse_struct(this, node.start_tokens);
            parse_line_end_tag(this, node.end_tokens, struct, "endstruct");
            node.data = struct;
        }
        else if (node.type == "method") {
            const method = parse_method(this, node.start_tokens); // ok
            parse_line_end_tag(this, node.end_tokens, method, "endmethod");
            node.data = method;
        }
        else if (node.type == "func") {
            const func = parse_function(this, node.start_tokens); // ok
            parse_line_end_tag(this, node.end_tokens, func, "endfunction");
            node.data = func;
        } else if (node.type == "globals") {
            const globals = parse_globals(this, node.start_tokens); // ok
            parse_line_end_tag(this, node.end_tokens, globals, "endglobals");
            node.data = globals;
        } else if (node.type == "if") {
            const ifs = parse_if(this, node.start_tokens);
            parse_line_end_tag(this, node.end_tokens, ifs, "endif");
            node.data = ifs;
        } else if (node.type == "loop") {
            const loop = parse_loop(this, node.start_tokens);
            parse_line_end_tag(this, node.end_tokens, loop, "endloop");
            node.data = loop;
        }

        node.children.forEach(child => {
          handle_on_object(child);
        });
      } else {
        if (node.type == "empty") {
          ;;
        } else if (node.type == "comment") {
            const comment = parse_line_comment(this, node.tokens);

            node.data = comment;
        } else if (node.type == "local") {
            const local = parse_line_local(this, node.tokens);

            node.data = local;
        } else if (node.type == "set") {
            const set = parse_line_set(this, node.tokens);

            node.data = set;
        } else if (node.type == "call") {
            const call = parse_line_call(this, node.tokens);

            node.data = call;
        } else if (node.type == "return") {
            const ret = parse_line_return(this, node.tokens);
          
          
            node.data = ret;
        } else if (node.type == "native") {
            const native = parse_line_native(this, node.tokens);

            node.data = native;
        } else if (node.type == "method") {
            const method = parse_line_method(this, node.tokens);

            node.data = method;
        } else if (node.type == "member") {
            const member = parse_line_member(this, node.tokens);

            node.data = member;
        } else if (node.type == "exitwhen") {
            const exitwhen = parse_line_exitwhen(this, node.tokens);

            node.data = exitwhen;
        } else if (node.type == "elseif") {
            const elseif = parse_line_else_if(this, node.tokens);

            node.data = elseif;
        } else if (node.type == "else") {
            const el = parse_line_else(this, node.tokens);

            node.data = el;
        } else if (node.type == "type") {
            const el = parse_line_type(this, node.tokens);

            node.data = el;
        } else if (node.type == "other") {
            const other = new Other(this);
            other.start_token = node.tokens[0];
            other.end_token = node.tokens[node.tokens.length - 1];
            node.data = other;
        }
      }
    }
    this.object_list.forEach(node => {
      handle_on_object(node);
    });
}


  // 对外接口

  /**
   * 
   * @param node 
   */
  private expand_node(node:(Block|Segment)): NodeAst {
    const object: NodeAst = node.data ?? new NodeAst(this);
    if (node.parent) {
      const parent:  NodeAst = node.parent.data;
      object.parent = parent;
      const index = node.parent.children.indexOf(node);
      if (index != -1) {
        const previous = node.parent.children[index - 1]?.data ?? null;
        object.previous = previous;
        const next = node.parent.children[index + 1]?.data ?? null;
        object.next = next;
      }
    } else {
      const index = this.object_list.indexOf(node);
      if (index != -1) {
        const previous = this.object_list[index - 1]?.data ?? null;
        object.previous = previous;
        const next = this.object_list[index + 1]?.data ?? null;
        object.next = next;
      }
    }
    if (node instanceof Block) {
      
      node.children.forEach(child => {
        object.children.push(this.expand_node(child));
      });
    }

    return object;
  }

  private for_program_handle(node: NodeAst, callback: (node: NodeAst) => void) {
    callback(node);
    node.children.forEach((child) => {
      this.for_program_handle(child, callback);
    });
  }
  public every(callback: (node:NodeAst) => void):void {
    if (this.program) {
      this.for_program_handle(this.program, callback);
    }
  }

  public natives:Native[] = [];
  public functions:Func[] = [];
  public methods:Method[] = [];
  public librarys:Library[] = [];
  public scopes:Scope[] = [];
  public structs:Struct[] = [];
  public globals:Globals[] = [];
  public types:Type[] = [];
  public interfaces:Interface[] = [];
  public global_variables:GlobalVariable[] = [];
  public ifs:If[] = [];
  public loops:Loop[] = [];
  public locals:Local[] = [];
  public sets:Set[] = [];
  public calls:Call[] = [];
  public comments:Comment[] = [];
  public members:Member[] = [];



  /**
   * 将program跟节点对象下面所有解析的节点分类存储
   */
  private classification() {
    this.every((node) => {
      if (node instanceof Func) {
        this.functions.push(node);
      } else if (node instanceof Comment) {
        this.comments.push(node);
      } else if (node instanceof Call) {
        this.calls.push(node);
      } else if (node instanceof Set) {
        this.sets.push(node);
      } else if (node instanceof Local) {
        this.locals.push(node);
      } else if (node instanceof GlobalVariable) {
        this.global_variables.push(node);
      } else if (node instanceof If) {
        this.ifs.push(node);
      } else if (node instanceof Loop) {
        this.loops.push(node);
      } else if (node instanceof Native) {
        this.natives.push(node);
      } else if (node instanceof Library) {
        this.librarys.push(node);
      } else if (node instanceof Member) {
        this.members.push(node);
      } else if (node instanceof Struct) {
        this.structs.push(node);
      } else if (node instanceof Method) {
        this.methods.push(node);
      } else if (node instanceof Interface) {
        this.interfaces.push(node);
      } else if (node instanceof Globals) {
        this.globals.push(node);
      } else if (node instanceof Type) {
        this.types.push(node);
      } else if (node instanceof Scope) {
        this.scopes.push(node);
      }
    });
  }

  private end_tag_error() {
    /**
     * 判断是否闭合并添加错误信息
     * @param object 
     */
    const non_end_tag_and_push_error = (object: Func|If|Loop|Library|Method|Struct|Interface|Globals|Scope) => {
      if (object.end_tag === null && !(object instanceof Method && object.parent instanceof Interface)) {
        if (object.start_token) {
          this.add_token_error(object.start_token, `statement block missing end tag`);
        } 
      }
    }
    this.every((node) => {
      if (node instanceof Func) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Comment) {
      } else if (node instanceof Call) {
      } else if (node instanceof Set) {
      } else if (node instanceof Local) {
      } else if (node instanceof GlobalVariable) {
      } else if (node instanceof If) {
        this.ifs.push(node);
      } else if (node instanceof Loop) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Native) {
      } else if (node instanceof Library) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Struct) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Method) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Interface) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Globals) {
        non_end_tag_and_push_error(node);
      } else if (node instanceof Type) {
      } else if (node instanceof Scope) {
        non_end_tag_and_push_error(node);
      }
    });
  }


  // public get_object_by_names(names:string[]):NodeAst[] {
  //   const function_takes:Take[] = this.functions.map(func => func.takes).flat().filter(x => !!x) as Take[];
  //   const mathod_takes:Take[] = this.methods.map(func => func.takes).flat().filter(x => !!x) as Take[];
  //   const objects:(NodeAst|Take)[] = [...this.structs, ...this.locals, ...function_takes, ...mathod_takes];
  //   const names2 = [...names];
  //   const shift_and_handing = () => {
  //     if (names2.length > 0) {
  //       const name = names2.shift();
  //       objects.filter(object => {
  //         if (object instanceof Struct && object.name && object.name.getText() == name) {
  //           return true;
  //         } else if (object instanceof Local && object.name && object.name.getText() == name) {
  //           return true;
  //         } else if (object instanceof Take && object.name && object.name.getText() == name) {
  //           return true;
  //         }
  //         return false;
  //       });
  //     }
  //   };
  // }
  public get_struct_by_name(name: string):Struct[] {
    const structs:Struct[] = [];

    this.structs.forEach(struct => {
      if (struct.name && struct.name.getText() === name) {
        structs.push(struct);
      }
    });

    return structs;
  }

  public get_function_set_by_name(name: string):(Func|Native|Method)[] {
    const funcs:(Func|Native|Method)[] = [];

    this.natives.forEach(native => {
      if (native.name && native.name.getText() === name) {
        funcs.push(native);
      }
    });
    this.functions.forEach(func => {
      if (func.name && func.name.getText() === name) {
        funcs.push(func);
      }
    });
    this.methods.forEach(method => {
      if (method.name && method.name.getText() === name) {
        funcs.push(method);
      }
    });

    return funcs;
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

interface ReplaceableEntity {
  name: string;
  value: string;
}

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
