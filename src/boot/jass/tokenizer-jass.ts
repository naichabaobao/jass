import { Context, Document, Token, TokenHandleResult, TokenType, symbol_state } from "./tokenizer-common";

class StateType {
  public static Nil:number = symbol_state("");
  public static Div:number = symbol_state("/");
  public static Comment:number = symbol_state("//");
  public static String:number = symbol_state("\"");
  public static StringConvert:number = symbol_state("\"\\");
  public static Gt:number = symbol_state(">");
  public static It:number = symbol_state("<");
  public static Eq:number = symbol_state("=");
  public static Not:number = symbol_state("!");
  public static Mark:number = symbol_state("'");
  public static Number0:number = symbol_state("0");
  public static Number:number = symbol_state("1");
  public static Id:number = symbol_state("ID");
  public static Unkown:number = symbol_state("?");
  public static Real:number = symbol_state(".");
  public static $:number = symbol_state("$");
}
function token_handle(context:Context, line:number, character:number, position:number, char: string, next_char: string, state: number, length: number):TokenHandleResult|undefined {
  const has_next = () => {
    return !!next_char;
  };
  const is_match = (...cs:string[]) => {
    for (let index = 0; index < cs.length; index++) {
      const c = cs[index];
      if (c == next_char) {
        return true;
      }
    }
    return false;
  };
  const new_token = (type: string, is_complete: boolean = true) => {
    return new Token(context, line, character - length, position - length, length + 1, type, is_complete);
  };
  switch (state) {
    case StateType.Nil:
      if (char == "/") { // 非空白
        if (is_match("/")) {
          return {
            state: StateType.Div,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Operator),
            length: 0
          }
        }
      } else if (char == "\"") {
        if (!has_next() || is_match("\n")) {
          return {
            token: new_token(TokenType.String, false),
            length: 0
          }
        } else {
          return {
            state: StateType.String,
            length: 1
          }
        }
      } else if (char == "'") {
        if (!has_next() || is_match("\n")) {
          return {
            token: new_token(TokenType.Mark, false),
            length: 0
          }
        } else {
          return {
            state: StateType.Mark,
            length: 1
          }
        }
      } else if (/\d/.test(char)) {
        if (char == "0" && is_match("x")) {
          return {
            state: StateType.Number0,
            length: 1
          }
        } else if (/\d/.test(next_char)) {
          return {
            state: StateType.Number,
            length: 1
          }
        } else if (/[a-zA-Z_]/.test(next_char)) {
          return {
            state: StateType.Id,
            length: 1
          }
        } else if (is_match(".")) {
          return {
            state: StateType.Real,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Integer),
            length: 0
          }
        }
      } else if (/[a-zA-Z_]/.test(char)) {
        if (/[a-zA-Z0-9_]/.test(next_char)) {
          return {
            state: StateType.Id,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Identifier),
            length: 0
          }
        }
      } else if (char == ">") {
        if (is_match("=")) {
          return {
            state: StateType.Gt,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Operator),
            length: 0
          }
        }
      } else if (char == "<") {
        if (is_match("=")) {
          return {
            state: StateType.It,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Operator),
            length: 0
          }
        }
      } else if (char == "=") {
        if (is_match("=")) {
          return {
            state: StateType.Eq,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Operator),
            length: 0
          }
        }
      } else if (char == "!") {
        if (is_match("=")) {
          return {
            state: StateType.Not,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Unkown),
            length: 0
          }
        }
      } else if (char == "(" || char == ")" || char == "[" || char == "]" || char == "," || char == "+" || char == "-" || char == "*") {
        return {
          token: new_token(TokenType.Operator),
          length: 0
        }
      } else if (char == "$") {
        if (/[a-fA-F0-9]/.test(next_char)) {
          return {
            state: StateType.$,
            length: 1
          }
        } else if (/\S/.test(next_char)) {
          return {
            state: StateType.Unkown,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Unkown),
            length: 0
          }
        }
      } else if (char == ".") {
        if (/\d/.test(next_char)) {
          return {
            state: StateType.Real,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Unkown),
            length: 0
          }
        }
      } else if (/\S/.test(char)) {
        if (/\S/.test(next_char)) {
          return {
            state: StateType.Unkown,
            length: 1
          }
        } else {
          return {
            token: new_token(TokenType.Unkown),
            length: 0
          }
        }
      }
      break;
    case StateType.Div:
      if (is_match("\n")) {
        return {
          token: new_token(TokenType.Conment),
          state: StateType.Nil,
          length: 0
        }
      } else if (!has_next()) {
        return {
          token: new_token(TokenType.Conment),
          state: StateType.Nil,
          length: 0
        }
      }
      return {
        state: StateType.Comment,
        length: 2
      }
      break;
    case StateType.Comment:
      if (is_match("\n")) {
        return {
          token: new_token(TokenType.Conment),
          state: StateType.Nil,
          length: 0
        }
      } else if (has_next()) {
        return {
          length: length + 1
        }
      } else {
        return {
          token: new_token(TokenType.Conment),
          state: StateType.Nil,
          length: 0
        }
      }
      break;
    case StateType.String:
      if (char == "\"") {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.String),
          length: 0
        }
      } else if (char == "\\") {
        return {
          state: StateType.StringConvert,
          length: length + 1
        }
      } else if (!has_next() || is_match("\n")) {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.String, false),
          length: 0
        }
      } else {
        return {
          length: length + 1
        }
      }
      break;
    case StateType.StringConvert:
      if (!has_next() || is_match("\n")) {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.String, false),
          length: 0
        }
      } else {
        return {
          state: StateType.String,
          length: length + 1
        }
      }
      break;
    case StateType.Gt:
      return {
        state: StateType.Nil,
        token: new_token(TokenType.Operator),
        length: 0
      }
      break;
    case StateType.It:
      return {
        state: StateType.Nil,
        token: new_token(TokenType.Operator),
        length: 0
      }
      break;
    case StateType.Eq:
      return {
        state: StateType.Nil,
        token: new_token(TokenType.Operator),
        length: 0
      }
      break;
    case StateType.Not:
      return {
        state: StateType.Nil,
        token: new_token(TokenType.Operator),
        length: 0
      }
      break;
    case StateType.Mark:
      if (char == "\'") {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Mark, length > 1),
          length: 0
        }
      } else if (!has_next() || is_match("\n")) {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Mark, false),
          length: 0
        }
      } else {
        return {
          length: length + 1
        }
      }
      break;
    case StateType.Number0: // 0x
      if (/[\da-fA-F]/.test(next_char)) {
        return {
          state: StateType.Number,
          length: length + 1
        }
      } else if (/[g-zG-Z_]/.test(next_char)) {
        return {
          state: StateType.Id,
          length: length + 1
        }
      } else if (is_match(".")) {
        return {
          state: StateType.Real,
          length: length + 1
        }
      } else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Integer, false),
          length: 0
        }
      }
      break;
    case StateType.Number: //
      if (/\d/.test(next_char)) {
        return {
          length: length + 1
        }
      } else if (/[a-zA-Z_]/.test(next_char)) {
        return {
          state: StateType.Id,
          length: length + 1
        }
      } else if (is_match(".")) {
        return {
          state: StateType.Real,
          length: length + 1
        }
      } else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Integer),
          length: 0
        }
      }
      break;
    case StateType.Id:
      if (/[a-zA-Z0-9_]/.test(next_char)) {
        return {
          length: length + 1
        }
      } 
      // else if (/\S/.test(next_char)) {
      //   return {
      //     state: StateTypeDefine.Unkown,
      //     length: length + 1
      //   }
      // } 
      else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Identifier),
          length: 0
        }
      }
      break;
    case StateType.Unkown:
      if (/\S/.test(next_char)) {
        return {
          length: length + 1
        }
      }  else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Unkown),
          length: 0
        }
      }
      break;
    case StateType.Real: // .
      if (/\d/.test(next_char)) {
        return {
          length: length + 1
        }
      } else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Real),
          length: 0
        }
      }
      break;
    case StateType.$:
      if (/[\da-fA-F]/.test(next_char)) {
        return {
          length: length + 1
        }
      } else if (!/\s/.test(next_char)) {
        return {
          state: StateType.Unkown,
          length: length + 1
        }
      } else {
        return {
          state: StateType.Nil,
          token: new_token(TokenType.Integer),
          length: 0
        }
      }
      break;
  
    default:
      return undefined
  }
}
export function tokenize_for_jass(content: string) {
  const document = new Document(content);
  const context = new Context(document);
  let line:number = 0;;
  let character:number = 0;
  let state: number = symbol_state("");
  let length: number = 0;
  const tokens:Token[] = [];
  for (let index = 0; index < content.length; index++) {
    const char = content.charAt(index);
    const next_char = content.charAt(index + 1);
    const new_state = token_handle(context, line, character, index, char, next_char, state, length);


    // substate = new_state.substate;
    if (char == "\n") {
      line++;
      character = 0;
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
    }
  }
  return tokens;
}
