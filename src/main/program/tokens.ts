enum TokenType {
  // 关键字 
  Native, Function, Takes, Returns, Return, EndFunction, Globals, EndGlobals, If, Then, Else, Elseif, EndIf, Loop, Exitwhen, EndLoop, Local, Constant, Array, Set, Call, Type, Extends, True, False, Null, Nothing, Integer, Real, Boolean, String, Handle, Code, And, Or, Not, Debug,
  // 标识符
  Identifier,
  // 整数
  Number,
  NumberInteger, NumberReal,
  // 实数
  StringValue,
  // 操作符
  // + - * / = != == > < >= <= ( ) [ ] ,
  Plus, Minus, Product, Divisor, Assignment, Equal, Unequal, greaterthan, LessThan, greaterthanEqual, LessThanEqual, LeftParenthesis, RightParenthesis, LeftBracket, RightBracket, Comma,
  // 单行注释
  Comment,
  Error,

  // 结束
  NewLine,
  Eof
}

class Token {
  public type: TokenType;
  public value: string;
  public line: number;
  public offset: number;
  public index: number;

  constructor(type: TokenType, value: string, line: number, offset: number, index: number) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.offset = offset;
    this.index = index;
  }
}

function parseTokens(code: string) {
  const tokens = new Array<Token>();
  function push(tokenType: TokenType, value: string, line: number, offset: number, index: number) {
    tokens.push(new Token(tokenType, value, line, offset, index));
  }



  let line = 0;
  let offset = 0;
  let value = "";
  function clear() {
    value = "";
  }
  function pushToken(token: Token) {
    tokens.push(token);
    clear();
  }
  for (let index = 0; index < code.length; index++) {

    const p = function (tokenType: TokenType, content: string) {
      state = 0;
      push(tokenType, content, line, offset, index);
      clear();
    }

    const extractToken = function (value: string) {
      switch (value) {
        case keyword.Native:
          return new Token(TokenType.Native, value, line, offset, index);
        case keyword.Function:
          return new Token(TokenType.Function, value, line, offset, index);
        case keyword.Takes:
          return new Token(TokenType.Takes, value, line, offset, index);
        case keyword.Returns:
          return new Token(TokenType.Returns, value, line, offset, index);
        case keyword.Return:
          return new Token(TokenType.Return, value, line, offset, index);
        case keyword.EndFunction:
          return new Token(TokenType.EndFunction, value, line, offset, index);

        case keyword.Globals:
          return new Token(TokenType.Globals, value, line, offset, index);
        case keyword.EndGlobals:
          return new Token(TokenType.EndGlobals, value, line, offset, index);

        case keyword.If:
          return new Token(TokenType.If, value, line, offset, index);
        case keyword.Then:
          return new Token(TokenType.Then, value, line, offset, index);
        case keyword.Else:
          return new Token(TokenType.Else, value, line, offset, index);
        case keyword.Elseif:
          return new Token(TokenType.Elseif, value, line, offset, index);
        case keyword.EndIf:
          return new Token(TokenType.EndIf, value, line, offset, index);

        case keyword.Loop:
          return new Token(TokenType.Loop, value, line, offset, index);
        case keyword.Exitwhen:
          return new Token(TokenType.Exitwhen, value, line, offset, index);
        case keyword.EndLoop:
          return new Token(TokenType.EndLoop, value, line, offset, index);


        case keyword.Local:
          return new Token(TokenType.Local, value, line, offset, index);
        case keyword.Constant:
          return new Token(TokenType.Constant, value, line, offset, index);

        case keyword.Array:
          return new Token(TokenType.Array, value, line, offset, index);

        case keyword.Set:
          return new Token(TokenType.Set, value, line, offset, index);

        case keyword.Call:
          return new Token(TokenType.Call, value, line, offset, index);

        case keyword.Type:
          return new Token(TokenType.Type, value, line, offset, index);
        case keyword.Extends:
          return new Token(TokenType.Extends, value, line, offset, index);

        case keyword.True:
          return new Token(TokenType.True, value, line, offset, index);
        case keyword.False:
          return new Token(TokenType.False, value, line, offset, index);

        case keyword.Null:
          return new Token(TokenType.Null, value, line, offset, index);

        case keyword.Nothing:
          return new Token(TokenType.Nothing, value, line, offset, index);

        case keyword.Integer:
          return new Token(TokenType.Integer, value, line, offset, index);
        case keyword.Real:
          return new Token(TokenType.Real, value, line, offset, index);
        case keyword.Boolean:
          return new Token(TokenType.Boolean, value, line, offset, index);
        case keyword.String:
          return new Token(TokenType.String, value, line, offset, index);
        case keyword.Handle:
          return new Token(TokenType.Handle, value, line, offset, index);
        case keyword.Code:
          return new Token(TokenType.Code, value, line, offset, index);

        case keyword.And:
          return new Token(TokenType.And, value, line, offset, index);
        case keyword.Or:
          return new Token(TokenType.Or, value, line, offset, index);
        case keyword.Not:
          return new Token(TokenType.Not, value, line, offset, index);

        case keyword.Debug:
          return new Token(TokenType.Debug, value, line, offset, index);

        default:
          return new Token(TokenType.Identifier, value, line, offset, index);
      }
    }

    const char = code.charAt(index);
    /*
    0 初始
    1 字母
    2 非零头数字
    3 小数
    4 零头
    5 八进制
    6 十六进制
    7 字符串开始
    8 字符串转义
    9 注释1
    10 注释
    11 '
    12 end'
    13 .
    500
    */
    let state = 0;

    switch (char) {
      case 'a':
      case 'b':
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
      case 'h':
      case 'i':
      case 'j':
      case 'k':
      case 'l':
      case 'm':
      case 'n':
      case 'o':
      case 'p':
      case 'q':
      case 'r':
      case 's':
      case 't':
      case 'u':
      case 'v':
      case 'w':
      case 'x':
      case 'y':
      case 'z':

      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'H':
      case 'I':
      case 'J':
      case 'K':
      case 'L':
      case 'M':
      case 'N':
      case 'O':
      case 'P':
      case 'Q':
      case 'R':
      case 'S':
      case 'T':
      case 'U':
      case 'V':
      case 'W':
      case 'X':
      case 'Y':
      case 'Z': {
        switch (state) {
          case 0:
            state = 1;
            value += char;
            break;
          case 1:
            value += char;
            break;
          case 4:
            switch (char) {
              case 'x':
                state = 6;
                value += char;
                break;
              default:
                state = 500;
                value += char;
                break;
            }
            break;
          case 6:
            value += char;
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 11:
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      }

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        switch (state) {
          case 0:
            switch (char) {
              case '0':
                state = 4;
                value += char;
                break;
              default:
                state = 2;
                value += char;
                break;
            }
            break;
          case 1:
          case 2:
          case 3:
            value += char;
          case 4:
            switch (char) {
              case '0':
              case '1':
              case '2':
              case '3':
              case '4':
              case '5':
              case '6':
              case '7':
                state = 5;
                value += char;
                break;
              default:
                state = 500;
                value += char;
                break;
            }
            break;
          case 5:
            switch (char) {
              case '0':
              case '1':
              case '2':
              case '3':
              case '4':
              case '5':
              case '6':
              case '7':
                state = 5;
                value += char;
                break;
              default:
                state = 500;
                value += char;
                break;
            }
            break;
          case 6:
            value += char;
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 10:
            state = 3;
            value += char;
          case 11:
            value += char;
            break;
          case 13:
            state = 3;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      }

      case '\'':
        switch (state) {
          case 0:
            state = 11;
            value += char;
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 11:
            value += char;
            p(TokenType.NumberInteger, value);
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '\\':
        switch (state) {
          case 7:
            state = 8;
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '$':
        switch (state) {
          case 0:
            state = 6;
            value += char;
          case 6:
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '.': {
        switch (state) {
          case 0:
            state = 13;
            value += char;
            break;
          case 2:
            state = 3;
            value += char;
          case 4:
            state = 3;
            value += char;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      }
      // + - * / = != == > < >= <= ( ) [ ] ,
      case '+':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '-':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '*':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '/':
        switch (state) {
          case 0:
            state = 9;
            value += char;
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 9:
            state = 10;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '=':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '!':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '>':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '<':
        switch (state) {
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '(':
      case ')':
      case '[':
      case ']':
      case ',':
        switch (state) {
          case 0:
            value += char;
            p(TokenType.Comma, value);
            break;
          case 1:
            state = 0;
            pushToken(extractToken(value));
            break;
          case 2:
          case 4:
          case 5:
          case 6:
          case 12:
            p(TokenType.NumberInteger, value);
            p(TokenType.Comma, char);
            break;
          case 3:
            p(TokenType.NumberReal, value);
            p(TokenType.Comma, char);

          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 10:
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '"':
        switch (state) {
          case 0:
            state = 7;
            value += char;
            break;
          case 7:
            value += char;
            p(TokenType.StringValue, value);
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
      case '_': {
        switch (state) {
          case 1:
            value += char;
            break;
          case 7:
            value += char;
            p(TokenType.StringValue, value);
            break;
          case 8:
            state = 7;
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
      }
      case ' ':
      case '\t': {
        switch (state) {
          case 0:
            break;
          case 1:
            state = 0;
            pushToken(extractToken(value));
            break;
          case 2:
          case 4:
          case 5:
          case 6:
            p(TokenType.NumberInteger, value);
            break;
          case 3:
            p(TokenType.NumberReal, value);
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 9:
            p(TokenType.Divisor, value);
            break;
          case 10:
            value += char;
            break;
          case 500:
            p(TokenType.Error, value);
            break;
          default:
            p(TokenType.Error, value);
            break;
        }
        break;
      }
      case '\n':
        switch (state) {
          case 0:
            break;
          case 1:
            state = 0;
            pushToken(extractToken(value));
            break;
          case 2:
          case 4:
          case 5:
          case 6:
            p(TokenType.NumberInteger, value);
            break;
          case 3:
            p(TokenType.NumberReal, value);
            break;
          case 7:
            value += char;
            break;
          case 8:
            state = 7;
            value += char;
            break;
          case 9:
            p(TokenType.Divisor, value);
            break;
          case 10:
            p(TokenType.Comment, value);
            break;
          case 500:
            p(TokenType.Error, value);
            break;
          default:
            p(TokenType.Error, value);
            break;
        }
        line++;
        break;
      default:
        switch (state) {
          case 7:
          case 10:
            value += char;
            break;
          default:
            state = 500;
            value += char;
            break;
        }
        break;
    }

    offset++;
  }
  return tokens;
}



namespace keyword {

  export const Native = "native";
  export const Function = "function";
  export const Takes = "takes";
  export const Returns = "returns";
  export const Return = "return";
  export const EndFunction = "endfunction";

  export const Globals = "globals";
  export const EndGlobals = "endglobals";

  export const If = "if";
  export const Then = "then";
  export const Else = "else";
  export const Elseif = "elseif";
  export const EndIf = "endif";

  export const Loop = "loop";
  export const Exitwhen = "exitwhen";
  export const EndLoop = "endloop";


  export const Local = "local";
  export const Constant = "constant";

  export const Array = "array";

  export const Set = "set";

  export const Call = "call";

  export const Type = "type";
  export const Extends = "extends";

  export const True = "true";
  export const False = "false";

  export const Null = "null";

  export const Nothing = "nothing";

  export const Integer = "integer";
  export const Real = "real";
  export const Boolean = "boolean";
  export const String = "string";
  export const Handle = "handle";
  export const Code = "code";

  export const And = "and";
  export const Or = "or";
  export const Not = "not";

  export const Debug = "debug";

}


parseTokens(`

native name takes string a, integer bbb returns nothing
  local unit a = tri()
  set a = unit('0aas')

  integer kkk = $20
  integer bbb = 0x32
  3.2  .2  3.
endfunction

`).forEach(item => {
  console.log(item.value);
});


function parseToken(code: string) {
  enum Type {
    Default,
    Letter,
    Zero,
    Unzero,
    Danyin,
    Ba,
    Shiliu,
    Meiyuan,
    Dian,
    Maohap,
    Zhuanyi,
    Cuowu,
  }
  let state = Type.Default;

  for (let index = 0; index < code.length; index++) {
    const char = code.charAt(index);
    switch (state) {
      case Type.Default:
        switch (char) {
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'g':
          case 'h':
          case 'i':
          case 'j':
          case 'k':
          case 'l':
          case 'm':
          case 'n':
          case 'o':
          case 'p':
          case 'q':
          case 'r':
          case 's':
          case 't':
          case 'u':
          case 'v':
          case 'w':
          case 'x':
          case 'y':
          case 'z':

          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F':
          case 'G':
          case 'H':
          case 'I':
          case 'J':
          case 'K':
          case 'L':
          case 'M':
          case 'N':
          case 'O':
          case 'P':
          case 'Q':
          case 'R':
          case 'S':
          case 'T':
          case 'U':
          case 'V':
          case 'W':
          case 'X':
          case 'Y':
          case 'Z':
            state = Type.Letter; 
            break;
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':

          case '\'':
          case '$':
          case '.': 
          // + - * / = != == > < >= <= ( ) [ ] ,
          case '+':
          case '-':
          case '*':
          case '/':
          case '=':
          case '!':
          case '>':
          case '<':
          case '(':
          case ')':
          case '[':
          case ']':
          case ',': 
          case '"': 
          case ' ':
          case '\t': {

            break;
          }
          case '\n': 
          default: 
        }
    }

  }

}