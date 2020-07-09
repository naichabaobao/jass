import { ZincError } from "./errors";

class Token {
  public type:"id"|"op"|"int"|"str"|"real"|"comment"|"block"|string;
  public value:string;

  public startLine = 0;
  public startPosition = 0;
  public endLine = 0;
  public endPosition = 0;

  constructor(type:string,value:string){
    this.type = type;
    this.value = value;
  }
}

const startRegExp = /^[ \t]*\/\/![ \t]+zinc([ \t].*\n|[ \t]*\n)$/;
const endRegExp = /^[ \t]*\/\/![ \t]+endzinc([ \t].*\n?|[ \t]*\n?)$/;

class Scanner {

  private tokens:Array<Token[]> = [];
  private errors:ZincError[] = [];

  constructor(content:string) {
    const LineResult = content.split(/\r\n|\n/).map(val => val += "\n");
    if(!LineResult) {
      return;
    }
    let inZinc = false;
    const ZincRange = new Array<number[]>();
    let startEnd:number[] = [];
    for (let index = 0; index < LineResult.length; index++) {
      const line = LineResult[index];
      if(line.trimLeft() == "") {
        continue;
      }
      if (inZinc == false && startRegExp.test(line)) {
        startEnd.push(index);
        inZinc = true;
      }else if(inZinc == true && startRegExp.test(line)) {
        const error = new ZincError();
        error.message = "The end sign could not be found!";
        error.startLine = startEnd[0];
        error.endLine = startEnd[0];
        error.endPosition = LineResult[startEnd[0]].length;
        this.errors.push(error);
        startEnd[0] = index;
      }else if(inZinc == true && endRegExp.test(line)) {
        startEnd.push(index);
        ZincRange.push(startEnd);
        startEnd = [];
        inZinc = false;
      }else if(inZinc == false && endRegExp.test(line)) {
        const error = new ZincError();
        error.message = "The start mark could not be found!";
        error.startLine = index;
        error.endLine = index;
        error.endPosition = line.length;
        this.errors.push(error);
      }
      
    }
    console.log(this.errors)
    console.log(ZincRange);

    for (let index = 0; index < ZincRange.length; index++) {
      const range = ZincRange[index];
      const startLine = range[0] + 1;
      const endLine = range[1];
      console.log(LineResult.slice(startLine, endLine));

      let tokenValue:string[] = [];
      const getValue = () => {
        const value = tokenValue.join("");
        tokenValue.length = 0;
        return value;
      };
      const pushToken = (type:string) => {
        this.tokens[index].push(new Token(type, getValue()));
      };
      for (let lineCount = startLine; lineCount < endLine; lineCount++) {
        const line = LineResult[lineCount];

        const latter = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
            latter(pos);
          } else {
            pushToken("id");
            start(pos);
          }
        };
        const number0 = (pos:number) => {};
        const number8 = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
            number8(pos);
          } else {
            pushToken("int");
            start(pos);
          }
        };
        const numberx = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
            number16(pos);
          } else {
            const error = new ZincError();
            error.message = "Hexadecimal digit expected!";
            error.startLine = lineCount;
            error.startPosition = pos;
            error.endLine = lineCount;
            error.endPosition = pos + tokenValue.length;
            this.errors.push(error);
            pushToken("other");
            start(pos);
          }
        };
        const number16 = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
            number16(pos);
          } else {
            pushToken("int");
            start(pos);
          }
        };
        const number_real = (pos:number) => {
          
        };
        const other_number = (pos:number) => {
          // Integer number too large
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(isNumber(next_char)) {
            other_number(pos);
          } else if(isLatter(next_char) || next_char == "_") {
            other_id(pos);
          } else {
            const error = new ZincError();
            error.message = "Integer number too large!";
            error.startLine = lineCount;
            error.startPosition = pos;
            error.endLine = lineCount;
            error.endPosition = pos + tokenValue.length;
            this.errors.push(error);
            pushToken("other");
            start(pos);
          }
        };
        const other_id = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(isNumber(next_char) || isLatter(next_char) || next_char == "_") {
            other_id(pos);
          } else {
            const error = new ZincError();
            error.message = "An identifier or keyword cannot immediately follow a numeric literal!";
            error.startLine = lineCount;
            error.startPosition = pos;
            error.endLine = lineCount;
            error.endPosition = pos + tokenValue.length;
            this.errors.push(error);
            pushToken("other");
            start(pos);
          }
        };
        const singal_comment = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          tokenValue.push(char);
          if(!next_char) {
            pushToken("comment");
            return;
          } else if(next_char == "\n") {
            pushToken("comment");
          } else {
            singal_comment(pos);
          }
        };
        const start = (pos:number) => {
          const char = line[pos++];
          const next_char = line[pos];
          if(!char) return;
          tokenValue.push(char);

          if(isLatter(char)) {
            if(isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
              latter(pos);
            } else {
              pushToken("id");
              start(pos);
            }
          } else if(char == "0") {
            if(["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
              number8(pos);
            } else if(next_char == "x") {
              numberx(pos);
            } else if(next_char == ".") {
              numberx(pos);
            } else if(["8", "9"].includes(next_char)) {
              other_number(pos);
            } else if(isLatter(next_char) || next_char == "_") {
              other_id(pos);
            } else {
              pushToken("int");
              start(pos);
            }
          } else if(char == "/") {
            if(next_char == "/") {
              singal_comment(pos);
            } else if(next_char == "*") {

            } else {
              pushToken("op");
              start(pos);
            }
          } else if(char == "\"") {

          } else if(char == "'") {

          } else if(char == "=") {

          } else if(char == "+") {

          } else if(char == "-") {

          } else if(char == "*") {

          } else if(char == "(") {

          } else if(char == ")") {

          } else if(char == "[") {

          } else if(char == "]") {

          } else if(char == "{") {

          } else if(char == "}") {

          } else if(char == ",") {

          } else if(char == ">") {

          } else if(char == "<") {

          } else if(char == "!") {

          } else if(char == "|") {

          } else if(char == "&") {

          } else if(char == "$") {

          } else if(char == ".") {

          } else if(char == ";") {

          } else if(/\s/.test(char)) {
            tokenValue.length = 0;
          } else {
            const error = new ZincError();
            error.message = `'${char}' expected!`;
            error.startLine = lineCount;
            error.startPosition = pos;
            error.endLine = lineCount;
            error.endPosition = pos + char.length;
            this.errors.push(error);
            pushToken("other");
          }
        };
        start(0);
      }

    }

    return;

    for (let index = 0; index < content.length; index++) {
      const char = content[index];
      
    }
    console.log(startRegExp.test(content))
    console.log(endRegExp.test(content))
    console.time();
    this.start(content, 0);
    console.timeEnd();
    console.time();
    console.log(/\/\/!\s+zinc(\s.*\n|\s*\n)/.exec(content))
    console.timeEnd();
  }

  private line:number = 0;
  private position:number = 0;
  private calc(char:string) {
    if(char == "\n") {
      this.line++;
      this.position = 0;
    }else{
      this.position++;
    }
  }
  private isStart = true;
  private start(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.leftForward(content, index);
    }else if(/\s/.test(char)) {
      this.start(content, index);
    }else{
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  } 
  private leftForward(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.doubleLeftForward(content, index);
    }else if(char == "*"){
      this.awaitBlockCommentOver1(content, index);
    } else {
      this.start(content, index);
    }
    this.calc(char);
  }
  private doubleLeftForward(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "!") {
      this.macroStart(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitNewLine(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.start(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitBlockCommentOver1(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "*") {
      this.awaitBlockCommentOver2(content, index);
    }else {
      this.awaitBlockCommentOver1(content, index);
    }
    this.calc(char);
  }
  private awaitBlockCommentOver2(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.start(content, index);
    }else {
      this.awaitBlockCommentOver1(content, index);
    }
    this.calc(char);
  }
  private macroStart(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == " " || char == "\t") {
      this.expectZ(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectZ(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "z") {
      this.expectI(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectI(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "i") {
      this.expectN(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectN(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "n") {
      this.expectC(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectC(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "c") {
      this.awaitNewLineOrSpace(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitNewLineOrSpace(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.zincBlock(content, index);
    }else if(char == " " || char == "\t" || char == "\r"){
      this.awaitNewLineForZinc(content, index);
    }else{
      this.awaitNewLine(content, index)
    }
    this.calc(char);
  }
  private awaitNewLineForZinc(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.zincBlock(content, index);
    }else{
      this.awaitNewLineForZinc(content, index)
    }
    this.calc(char);
  }
  private zincBlock(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    if(isLatter(char)) {
      
    }
    this.calc(char);
  }

  private temp(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    
    this.calc(char);
  }


  public getTokens() {

  }

}

function isLatter(char:string) {
  return char && /[a-zA-Z]/.test(char);
}

function isNumber(char:string) {
  return char && /\d/.test(char);
}

class Scanner2 {

  private content:string;
  private index:number = 0;

  private line:number = 0;
  private position:number = 0;

  private getChar() {
    const char = this.content[this.index++];
    if(char == "\n") {
      this.line++;
      this.position = 0;
    }else{
      this.position++;
    }
    return char;
  }

  constructor(content:string) {
    this.content = content;
  }

  private start() {
    const char = this.getChar();
  }

}

function to_tokens(content:string) {
  content = content.replace(/\r\n/g, "\n");
  let startLine:number = 0;
  let startPosition:number = 0;
  let endLine:number = 0;
  let endPosition:number = 0;
  const errors:ZincError[] = [];
  const tokens:Token[] = [];
  const tokenValue:string[] = [];
  const getValue = () => {
    const value = tokenValue.join("");
    tokenValue.length = 0;
    return value;
  };
  const pushToken = (type:string) => {
    const value = getValue();
    const token = new Token(type, value);
    token.startLine = startLine;
    token.startPosition = startPosition - value.length;
    token.endLine = startLine;
    token.endPosition = startPosition;
    tokens.push(token);
  };
  const calcLocation = (char:string) => {
    if(char == "\n") {
      startLine++;
      startPosition = 0;
    } else {
      startPosition++;
    }
  };
  const latter = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
      latter(pos);
    } else {
      pushToken("id");
      start(pos);
    }
  };
  const number0 = (pos:number) => {};
  const number = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(next_char)) {
      number(pos);
    } else if(next_char == ".") {
      number_real(pos);
    } else if(isLatter(next_char) || next_char == "_") {
      other_id(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const number8 = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
      number8(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const numberx = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
      number16(pos);
    } else {
      const error = new ZincError();
      error.message = "Hexadecimal digit expected!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
      start(pos);
    }
  };
  const number16 = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
      number16(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const number_real = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isNumber(next_char)) {
      number_real(pos);
    } else {
      pushToken("real");
      start(pos);
    }
  };
  const other_number = (pos:number) => {
    // Integer number too large
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isNumber(next_char)) {
      other_number(pos);
    } else if(isLatter(next_char) || next_char == "_") {
      other_id(pos);
    } else {
      const error = new ZincError();
      error.message = "Integer number too large!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
      start(pos);
    }
  };
  const other_id = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(isNumber(next_char) || isLatter(next_char) || next_char == "_") {
      other_id(pos);
    } else {
      const error = new ZincError();
      error.message = "An identifier or keyword cannot immediately follow a numeric literal!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
      start(pos);
    }
  };
  const singal_comment = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(!next_char) {
      pushToken("comment");
    } else if(next_char == "\n") {
      pushToken("comment");
      start(pos);
    } else {
      singal_comment(pos);
    }
  };
  const block_comment = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(!next_char) {
      const error = new ZincError();
      error.message = "Block comment is not closed!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
    } else if(next_char == "*") {
      block_comment_will(pos);
    } else {
      block_comment(pos);
    }
  };
  const block_comment_will = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if(!next_char) {
      const error = new ZincError();
      error.message = "Block comment is not closed!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
    } else if(next_char == "/") {
      block_comment_closed(pos);
    } else {
      block_comment(pos);
    }
  };
  const string_closed = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    
    pushToken("string");

    if(next_char) {
      start(pos);
    }
  };
  const string_in = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if(next_char == "\"") {
      string_closed(pos);
    } else if(!next_char || next_char == "\n") {
      string_unclosed(pos);
    } else {
      string_in(pos);
    }
  };
  const string_unclosed = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    
    const error = new ZincError();
    error.message = "Unterminated string literal!";
    error.startLine = startLine;
    error.startPosition = startPosition - tokenValue.length;
    error.endLine = startLine;
    error.endPosition = startPosition;
    errors.push(error);
    pushToken("other");

    if(next_char) {
      start(pos);
    }
  };
  const block_comment_closed = (pos:number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    
    pushToken("block_comment");
    if(next_char) {
      start(pos);
    }
  };
  const start = (pos:number) => {
    
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if(isLatter(char)) {
      if(isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
        latter(pos);
      } else {
        pushToken("id");
        start(pos);
      }
    } else if(char == "0") {
      if(["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
        number8(pos);
      } else if(next_char == "x") {
        numberx(pos);
      } else if(next_char == ".") {
        number_real(pos);
      } else if(["8", "9"].includes(next_char)) {
        other_number(pos);
      } else if(isLatter(next_char) || next_char == "_") {
        other_id(pos);
      } else {
        pushToken("int");
        start(pos);
      }
    } else if(["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)) {
      number(pos);
    } else if(char == "/") {
      if(next_char == "/") {
        singal_comment(pos);
      } else if(next_char == "*") {
        block_comment(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if(char == "\"") {
      if(next_char == "\"") {
        string_closed(pos);
      } else if(!next_char || next_char == "\n") {
        string_unclosed(pos);
      } else if(next_char) {
        string_in(pos);
      }
    } else if(char == "'") {

    } else if(char == "=") {

    } else if(char == "+") {

    } else if(char == "-") {

    } else if(char == "*") {

    } else if(char == "(") {

    } else if(char == ")") {

    } else if(char == "[") {

    } else if(char == "]") {

    } else if(char == "{") {

    } else if(char == "}") {

    } else if(char == ",") {

    } else if(char == ">") {

    } else if(char == "<") {

    } else if(char == "!") {

    } else if(char == "|") {

    } else if(char == "&") {

    } else if(char == "$") {

    } else if(char == ".") {

    } else if(char == ";") {

    } else if(/\s/.test(char)) {
      tokenValue.length = 0;
      start(pos);
    } else if(!char) { 
    } else {
      const error = new ZincError();
      error.message = `'${char}' expected!`;
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + char.length;
      errors.push(error);
      pushToken("other");
      start(pos);
    }
  };
  start(0);
  console.log(tokens)
  console.log(errors)
}

to_tokens(`"   

`);