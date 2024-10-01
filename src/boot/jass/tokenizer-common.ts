export function symbol_state(char: string): number {
    let id = 0x00000000;
    for (let index = 0; index < char.length; index++) {
        const new_id = char.charCodeAt(index);
        // id &= new_id;
        id += new_id;
    }
    return id;
}

export class Document {
    content: string;
  
    constructor(content: string) {
      this.content = content;
    }
  }
  
export  class Context {
    document: Document;
  
    constructor(document: Document) {
      this.document = document;
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
  };
  export class Token {
    public readonly context: Context;
    public readonly line:number;
    public readonly character:number;
    public readonly position:number;
    public readonly length: number;
    public readonly type: string;
    public readonly is_complete: boolean;
    //@ts-ignore
    // public readonly type_name: string;
  
    
    public get end() : number {
      return this.character + this.length;
    }
    
  
    public constructor(context: Context, line:number, character:number, position:number, length: number, type:string, is_complete:boolean = true) {
      this.context = context;
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
      return this.context.document.content.substring(this.position, this.position + this.length);
    }
  
    public isValue():boolean {
      return this.type == TokenType.Integer || this.type == TokenType.Real || this.type == TokenType.String || this.type == TokenType.Mark;
    }
  
    
    public get type_name() : string {
        if (this.type == TokenType.Conment) {
            return "Comment";
          } else if (this.type == TokenType.Identifier) {
            return "Identifier";
          } else if (this.type == TokenType.Operator) {
            return "Operator";
          } else if (this.type == TokenType.Integer) {
            return "Integer";
          } else if (this.type == TokenType.Real) {
            return "Real";
          } else if (this.type == TokenType.String) {
            return "String";
          } else if (this.type == TokenType.Mark) {
            return "Mark";
          } else {
            return "Unkown";
          }
    }
    
  
    
  }

export  interface TokenHandleResult {
    state?: number;
    length?: number;
    token?: Token|null;
  }