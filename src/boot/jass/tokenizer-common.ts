import { Node } from "./parser-vjass";
import { Macro } from "./preproces";
import { Import, RunTextMacro, TextMacro } from "./textmacro";

export function symbol_state(char: string): number {
    let id = 0x00000000;
    for (let index = 0; index < char.length; index++) {
        const new_id = char.charCodeAt(index);
        // id &= new_id;
        id += new_id;
    }
    return id;
}

export class TextLine {
  public readonly lineNumber:number;
  public readonly text:string;

  public constructor(lineNumber:number, text:string) {
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

	
	public get start() : Position {
		return this._start;
	}

	
	public get end() : Position {
		return this._end;
	}
	
	
	public set start(start : Position) {
		this._start = start;
		if (this.end.line < start.line) {
			this._end = this._start;
		} else if (this.end.line == start.line && this.end.position < start.position) {
			this._end.position = this._start.position;
		}
	}

	public set end(end : Position) {
		this._end = end;
	}
	

	public constructor(start: Position = new Position(), end: Position = new Position()) {
		this._start = start;
		this._end = end;
	}

	public static default () :Range {
		return new Range(new Position(0,0), new Position(0,0))
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
			return (this.start.line < positionOrRange.start.line || (this.start.line == positionOrRange.start.line && this.start.position < positionOrRange.start.position) )
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

export class Document {
    public readonly content: string;
    public readonly tokens:Token[] = [];
    public readonly lineCount:number = 0;
    public readonly imports: Import[] = [];
    public readonly macros: Macro[] = [];
    public readonly text_macros: TextMacro[] = [];
    public readonly run_text_macros: RunTextMacro[] = [];

    public readonly filePath: string;
  
    public constructor(filePath: string, content: string) {
      this.filePath = filePath;
      this.content = content;
    }

    public lineAt(line:number):TextLine {
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
    public lineTokens(line:number) {
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

    public root_node:Node|null = null;

    /**
     * 记录每个分行的点，使用这种方法只需消耗一点内存有几百倍的性能提升
     * @private 不要修改，有词法解析时写入
     */
    private line_points:{
      line:number,
      position: number
    }[] = [];

    /**
     * line成员跟数组下标保持一致，在空行的情况可以删除减少内存暂用，删除了也就意味着要遍历
     * @private 不要修改，有词法解析时写入
     */
    public line_token_indexs: {
      // 跟数组下标保持一致
      line:number,
      index: number,
      count: number,
    }[]= [];

    /**
     * 指示import文本替换怎遍历
     */
    public line_import_indexs: {
      line:number,
      is_import: boolean,
      index: number
    } [] = [];
    /**
     * textmacro 指示
     */
    public line_run_text_macro_indexs: {
      line:number,
      is_run_text_macro: boolean,
      index: number
    } [] = [];
    /**
     * textmacro 指示
     */
    public line_text_macro_indexs: {
      line:number,
      /**
       * -1 error
       * 0 normal
       * 1 textmacro header
       * 2 textmacro end
       * 3 textmacro body
       */
      text_macro_tag: -1|0|1|2|3,
      /**
       * 指向 只有text_macro_tag==1有效
       */
      index: number
    } [] = [];
    /**
     * textmacro 指示
     */
    public macro_indexs: {
      line:number,
      is_macro:boolean,
      index: number
    } [] = [];

    public is_macro_line(line:number):boolean {
      return this.macro_indexs[line]?.is_macro ?? false;
    }
    /**
     * 判断行是不是import行
     * @param line 
     */
    public is_import_line(line:number):boolean {
      return this.line_import_indexs[line]?.is_import ?? false;
    }

    public is_run_text_macro_line(line:number):boolean {
      return this.line_run_text_macro_indexs[line]?.is_run_text_macro ?? false;
    }

    public is_text_macro_line(line:number):boolean {
      return this.line_text_macro_indexs[line]?.text_macro_tag != 0 ?? false;
    }

    public loop(callback:(document:Document, lineNumber: number) => void, run_callback:(document: Document, run_text_macro:RunTextMacro, text_macro: TextMacro, lineNumber: number) => void, start_line:number = 0, length:number = this.lineCount) {
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


    token_errors: {token:Token, message: string, charge?: number}[] = [];
    public add_token_error(token:Token, message: string) {
        this.token_errors.push({token, message});
    }
    node_errors: {node:Node, message: string, charge?: number}[] = [];
    public add_node_error(node:Node, message: string) {
        this.node_errors.push({node, message});
    }

    public foreach(callback: (node:Node) => void) {
      const fallback = (node:Node) => {
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
    public readonly line:number;
    public readonly character:number;
    public readonly position:number;
    public readonly length: number;
    public readonly type: string;
    public readonly is_complete: boolean;
    //@ts-ignore
    // public readonly type_name: string;
    
  
    public constructor(document:Document, line:number, character:number, position:number, length: number, type:string, is_complete:boolean = true) {
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
  
    public isValue():boolean {
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
    
    
    public clone():Token {
      return Object.assign({}, this) as Token;
    }

    
    public get is_block_comment() : boolean {
      return this.type == TokenType.BlockComment;
    }
    public get is_comment() : boolean {
      return this.type == TokenType.Conment;
    }
    public get is_identifier() : boolean {
      return this.type == TokenType.Identifier;
    }
    
  }

export  interface TokenHandleResult {
    state?: number;
    length?: number;
    token?: Token|null;
  }


  export function tokenize(document:Document, call: (document:Document, line:number, character:number, position:number, char: string, next_char: string, state: number, length: number) => TokenHandleResult|undefined) {
    let line:number = 0;;
    let character:number = 0;
    let state: number = symbol_state("");
    let length: number = 0;
    const tokens:Token[] = [];
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













  