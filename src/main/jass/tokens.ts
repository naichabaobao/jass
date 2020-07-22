import { Range } from "./range";

class Token {
  public type: string;
  public value: string;
  public range: Range | null = null;
  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
  public isId() {
    return this.type === "id";
  }
  public isOp() {
    return this.type === "op";
  }
  public isInt() {
    return this.type === "int";
  }
  public isReal() {
    return this.type === "real";
  }
  public isString() {
    return this.type === "string";
  }
  public isComment() {
    return this.type === "comment";
  }
  public isBlockComment() {
    return this.type === "block_comment";
  }
  public isMacro() {
    return this.type === "macro";
  }
  public isOther() {
    return this.type === "other";
  }

  public setStart(line: number, position: number) {
    if (!this.range) {
      this.range = new Range;
    }
    this.range.setStart(line, position);
    return this;
  }

  public setEnd(line: number, position: number) {
    if (!this.range) {
      this.range = new Range;
    }
    this.range.setEnd(line, position);
    return this;
  }
}

const numberRegExp = /[0-9]/;
const latterRegExp = /[a-zA-Z]/;
const idRegExp = /[a-zA-Z\d_]/;

function isNumber(char:string) {
  return numberRegExp.test(char);
}

function isLatter(char:string) {
  return latterRegExp.test(char);
}

function isId(char:string) {
  return idRegExp.test(char);
}

function tokens(content: string) {
  content = content.replace(/\r\n/g, "\n");
  const tokens: Token[] = [];
  let line: number = 0;
  let position: number = 0;
  let last: number = 0;
  for (let index = 0; index < content.length; void 0) {
    function getChar(): string {
      /*
      if (index != last) {
        last = index;
        if (content.charAt(index) === "\n") {
          line++;
          position = 0;
        } else {
          position++;
        }
      }*/
      return content.charAt(index);
    }
    function getNextChar(): string | undefined {
      return content.charAt(index + 1);
    }

    if (getChar() === "/") {
      const chars: string[] = [];
      chars.push(getChar());
      position++;
      index++;
      if (getChar() === "/") {
        chars.push(getChar());
        position++;
        index++;
        for (; index < content.length; index++) {
          if (getChar() === "\n") {
            tokens.push(new Token("comment", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
            line++;
            position = 0;
            break;
          } else if (index === content.length - 1) {
            position++;
            tokens.push(new Token("comment", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          } else {
            position++;
            chars.push(getChar());
            continue;
          }
        }
        continue;
      } else if (getChar() === "*") {
        let start: number = line;
        let startPos: number = position - 1;
        chars.push(getChar());
        position++;
        index++;
        for (; index < content.length; index++) {
          chars.push(getChar());
          if (getChar() === "*") {
            position++;
            index++;
            chars.push(getChar());
            if (getChar() === "/") {
              position++;
              index++;
              tokens.push(new Token("block_comment", chars.join("")).setStart(start, startPos).setEnd(line, position));
              break;
            } else if (index === content.length - 1) {
              tokens.push(new Token("block_comment", chars.join("")).setStart(start, startPos).setEnd(line, position));
            }
            continue;
          }
          if (getChar() === "\n") {
            line++;
            position = 0;
          } else {
            position++;
          }
        }
        continue;
      }
      tokens.push(new Token("op", chars[0]).setStart(line, position - chars.length).setEnd(line, position));
    } else if (getChar() === "#") {
      const chars:string[] = [];
      chars.push(getChar());
      position++;
      index++;
      for (; index < content.length; index++) {
        if (getChar() === "\n") {
          tokens.push(new Token("macro", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          line++;
          position = 0;
          break;
        } else if (index === content.length - 1) {
          position++;
          tokens.push(new Token("macro", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
        } else {
          position++;
          chars.push(getChar());
          continue;
        }
      }
    } else if (getChar() === "\"") {
      const chars:string[] = [];
      chars.push(getChar());
      let z = false;
      for (; index < content.length; ) {
        index++;
        position++;
        if (!getChar()) {
          tokens.push(new Token("other", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          break;
        }
        chars.push(getChar());
        if (getChar() === "\n") {
          tokens.push(new Token("other", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          index++;
          line++;
          position = 0;
          break;
        } else if (z == false && getChar() === "\"") {
          index++;
          position++;
          tokens.push(new Token("string", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          break;
        }
        if (!z && getChar() === "\\") {
          z = true;
        } else {
          z = false;
        }
        // position++;
      }
    } else if (isLatter(getChar())) {
      const chars:string[] = [];
      chars.push(getChar());
      for (; index < content.length;) {
        index++;
        position++;
        if (isId(getChar())) {
          chars.push(getChar());
        } else {
          tokens.push(new Token("id", chars.join("")).setStart(line, position - chars.length).setEnd(line, position));
          break;
        }
      }
    } else {
      if (getChar() === "\n") {
        line++;
        position = 0;
      } else {
        position++;
      }
      index++;
    }
  }
  console.log(tokens);
  return tokens;
  let startLine: number = 0;
  let startPosition: number = 0;
  let endLine: number = 0;
  let endPosition: number = 0;
  const errors: ZincError[] = [];
  const tokenValue: string[] = [];
  const getValue = () => {
    const value = tokenValue.join("");
    tokenValue.length = 0;
    return value;
  };
  const pushToken = (type: string) => {
    const value = getValue();
    const token = new Token(type, value);
    token.startLine = startLine;
    token.startPosition = startPosition - value.length;
    token.endLine = startLine;
    token.endPosition = startPosition;
    tokens.push(token);
  };
  const calcLocation = (char: string) => {
    if (char == "\n") {
      startLine++;
      startPosition = 0;
    } else {
      startPosition++;
    }
  };
  const latter = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
      latter(pos);
    } else {
      pushToken("id");
      start(pos);
    }
  };
  const number0 = (pos: number) => { };
  const number = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(next_char)) {
      number(pos);
    } else if (next_char == ".") {
      number_real(pos);
    } else if (isLatter(next_char) || next_char == "_") {
      other_id(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const number8 = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
      number8(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const numberx = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
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
  const number16 = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isNumber(next_char) || ["a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"].includes(next_char)) {
      number16(pos);
    } else {
      pushToken("int");
      start(pos);
    }
  };
  const number_real = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isNumber(next_char)) {
      number_real(pos);
    } else {
      pushToken("real");
      start(pos);
    }
  };
  const other_number = (pos: number) => {
    // Integer number too large
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isNumber(next_char)) {
      other_number(pos);
    } else if (isLatter(next_char) || next_char == "_") {
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
  const other_id = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (isNumber(next_char) || isLatter(next_char) || next_char == "_") {
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
  const singal_comment = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (!next_char) {
      pushToken("comment");
    } else if (next_char == "\n") {
      pushToken("comment");
      start(pos);
    } else {
      singal_comment(pos);
    }
  };
  const block_comment = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (!next_char) {
      const error = new ZincError();
      error.message = "Block comment is not closed!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
    } else if (next_char == "*") {
      block_comment_will(pos);
    } else {
      block_comment(pos);
    }
  };
  const block_comment_will = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);
    if (!next_char) {
      const error = new ZincError();
      error.message = "Block comment is not closed!";
      error.startLine = startLine;
      error.startPosition = startPosition;
      error.endLine = startLine;
      error.endPosition = startPosition + tokenValue.length;
      errors.push(error);
      pushToken("other");
    } else if (next_char == "/") {
      block_comment_closed(pos);
    } else {
      block_comment(pos);
    }
  };
  const string_closed = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("string");

    if (next_char) {
      start(pos);
    }
  };
  const string_in = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if (next_char == "\"") {
      string_closed(pos);
    } else if (!next_char || next_char == "\n") {
      string_unclosed(pos);
    } else {
      string_in(pos);
    }
  };
  const string_unclosed = (pos: number) => {
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

    if (next_char) {
      start(pos);
    }
  };
  const block_comment_closed = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("block_comment");
    if (next_char) {
      start(pos);
    }
  };
  const eq = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const uneq = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const or = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const and = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const gteq = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const lteq = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const in_code = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if (isNumber(next_char) || isLatter(next_char)) {
      in_code(pos);
    } else if (next_char === "'") {
      code_end(pos);
    } else {
      pushToken("other");
      start(pos);
    }
  };
  const code_end = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("int");
    start(pos);
  };
  const returns = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    pushToken("op");
    start(pos);
  };
  const wave = (pos: number) => {
    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if (!next_char || next_char === "\n") {
      pushToken("macro");
      start(pos);
    } else {
      wave(pos);
    }
  };

  const start = (pos: number) => {

    const char = content[pos++];
    calcLocation(char);
    const next_char = content[pos];
    tokenValue.push(char);

    if (isLatter(char)) {
      if (isLatter(next_char) || next_char == "_" || isNumber(next_char)) {
        latter(pos);
      } else {
        pushToken("id");
        start(pos);
      }
    } else if (char == "0") {
      if (["0", "1", "2", "3", "4", "5", "6", "7"].includes(next_char)) {
        number8(pos);
      } else if (next_char == "x") {
        numberx(pos);
      } else if (next_char == ".") {
        number_real(pos);
      } else if (["8", "9"].includes(next_char)) {
        other_number(pos);
      } else if (isLatter(next_char) || next_char == "_") {
        other_id(pos);
      } else {
        pushToken("int");
        start(pos);
      }
    } else if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)) {
      number(pos);
    } else if (char == "/") {
      if (next_char == "/") {
        singal_comment(pos);
      } else if (next_char == "*") {
        block_comment(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if (char == "\"") {
      if (next_char == "\"") {
        string_closed(pos);
      } else if (!next_char || next_char == "\n") {
        string_unclosed(pos);
      } else if (next_char) {
        string_in(pos);
      }
    } else if (char == "'") {
      if (isLatter(next_char) || isNumber(next_char)) {
        in_code(pos);
      } else if (next_char === "'") {
        code_end(pos);
      } else {
        pushToken("other");
        start(pos);
      }
    } else if (char == "=") {
      if (next_char === "=") {
        eq(pos);
      } else {
        const error = new ZincError();
        error.message = `'${char}' expected!`;
        error.startLine = startLine;
        error.startPosition = startPosition;
        error.endLine = startLine;
        error.endPosition = startPosition + char.length;
        pushToken("other");
        start(pos);
      }
    } else if (char == "+") {
      pushToken("op");
      start(pos);
    } else if (char == "-") {
      if (next_char === ">") {
        returns(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if (char == "*") {
      pushToken("op");
      start(pos);
    } else if (char == "(") {
      pushToken("op");
      start(pos);
    } else if (char == ")") {
      pushToken("op");
      start(pos);
    } else if (char == "[") {
      pushToken("op");
      start(pos);
    } else if (char == "]") {
      pushToken("op");
      start(pos);
    } else if (char == "{") {
      pushToken("op");
      start(pos);
    } else if (char == "}") {
      pushToken("op");
      start(pos);
    } else if (char == ",") {
      pushToken("op");
      start(pos);
    } else if (char == ">") {
      if (next_char === "=") {
        gteq(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if (char == "<") {
      if (next_char === "=") {
        lteq(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if (char == "!") {
      if (next_char === "=") {
        uneq(pos);
      } else {
        pushToken("op");
        start(pos);
      }
    } else if (char == "|") {
      if (next_char === "|") {
        or(pos);
      } else {
        const error = new ZincError();
        error.message = `'${char}' expected!`;
        error.startLine = startLine;
        error.startPosition = startPosition;
        error.endLine = startLine;
        error.endPosition = startPosition + char.length;
        pushToken("other");
        start(pos);
      }
    } else if (char == "&") {
      if (next_char === "&") {
        and(pos);
      } else {
        const error = new ZincError();
        error.message = `'${char}' expected!`;
        error.startLine = startLine;
        error.startPosition = startPosition;
        error.endLine = startLine;
        error.endPosition = startPosition + char.length;
        pushToken("other");
        start(pos);
      }
    } else if (char == "$") {
      if (/[\da-fA-f]/.test(next_char)) {
        number16(pos);
      } else {
        pushToken("other");
        start(pos);
      }
    } else if (char == ".") {
      if (isNumber(next_char)) {
        number_real(pos);
      } else {
        pushToken("other");
        start(pos);
      }
    } else if (char === ";") {
      pushToken("op");
      start(pos);
    } else if (char === "#") {
      if (!next_char || next_char == "\n") {
        pushToken("macro");
        start(pos);
      } else {
        wave(pos);
      }
    } else if (/\s/.test(char)) {
      tokenValue.length = 0;
      start(pos);
    } else if (!char) {
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
  // console.log(tokens)
  // console.log(errors)
  return tokens;
}

tokens(`aa2_$`);