
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
  Error
}

class Token {
  public type: TokenType;
  public value: string;
  // public index:number;

  constructor(type: TokenType, value: string) {
    this.type = type;
    this.value = value;
  }

}

class lexicalError extends Error { }

class ErrorToken extends Token { 
  constructor (value :string) {
    super(TokenType.Error, value);
  }
}

function lexicalAnalyzer(sourceCode: string) {
  let index = 0;

  let char = "";

  function getChar() {
    return sourceCode[index++];
  }

  const tokens = new Array<Token>();

  while (index < sourceCode.length) {
    char = sourceCode[index];
    switch (sourceCode[index]) {
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
        const token = lexicalLetter(sourceCode, index);
        index += token.value.length;
        tokens.push(token);
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
      case '9':

      case '\'':
      case '$':
      case '.': {
        const token = lexicalNumber(sourceCode, index);
        index += token.value.length;
        tokens.push(token);
        break;
      }
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
      case ',': {
        const token = lexicalOperator(sourceCode, index);
        index += token.value.length;
        tokens.push(token);
        break;
      }
      case '"': {
        const token = lexicalString(sourceCode, index);
        index += token.value.length;
        tokens.push(token);
        break;
      }
      case ' ':
      case '\t':
      case '\n': {
        index++;
        break;
      }
      case '': {
        return tokens;
      }
      default: {
        tokens.push(new ErrorToken(char));
        index ++;
      }
    }
  }

  return tokens;

}


/**
 * 
 * @param sourceCode 
 * @param index 
 */
function lexicalNumber(sourceCode: string, index: number) {

  let char = "";

  function getChar() {
    return sourceCode.charAt(index++);
  }
  // Number -> 非Number     Number -> DecimalPoint -> Real 
  // Zero -> Hexadecimal   Zero -> OctonaryNumberSystem    Zero -> DecimalPoint
  // DollarSign
  // DecimalPoint -> Real
  enum NumberType {
    Unkwon,
    // 0
    Zero,
    // 0x
    ZeroX,
    // $
    DollarSign,
    // .
    DecimalPoint,
    // 1-9
    Number,
    // 实数
    Real,
    // 八进制
    OctonaryNumberSystem,
    // 十六进制
    Hexadecimal,
    // code 左边
    CodeLeft,
    Code,
    CodeRight
  }


  let state: NumberType = NumberType.Unkwon;
  let value = "";

  for (; ;) {
    char = getChar();
    switch (+state) {

      case NumberType.Unkwon: {
        switch (char) {
          case '0': {
            value += char;
            state = NumberType.Zero;
            break;
          }
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9': {
            value += char;
            state = NumberType.Number;
            break;
          }
          case '.': {
            value += char;
            state = NumberType.DecimalPoint;
            break;
          }
          case '$': {
            value += char;
            state = NumberType.DollarSign;
            break;
          }
          case '\'': {
            value += char;
            state = NumberType.CodeLeft;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.Zero: {
        switch (char) {
          case 'x': {
            value += char;
            state = NumberType.ZeroX;
            break;
          }
          case '.': {
            value += char;
            state = NumberType.Real;
            break;
          }
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7': {
            value += char;
            state = NumberType.OctonaryNumberSystem;
            break;
          }
          default: {
            return new Token(TokenType.NumberInteger, value);
          }
        }
        break;
      }
      case NumberType.ZeroX: {
        switch (char) {
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
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F': {
            value += char;
            state = NumberType.Hexadecimal;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.Number: {
        switch (char) {
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
            value += char;
            break;
          }
          case '.': {
            value += char;
            state = NumberType.Real;
            break;
          }
          default: {
            return new Token(TokenType.NumberInteger, value);
          }
        }
        break;
      }
      case NumberType.DollarSign: {
        switch (char) {
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
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F': {
            value += char;
            state = NumberType.Hexadecimal;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.DecimalPoint: {
        switch (char) {
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
            value += char;
            state = NumberType.Real;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.Real: {
        switch (char) {
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
            value += char;
            break;
          }
          default: {
            return new Token(TokenType.NumberReal, value);
          }
        }
        break;
      }
      case NumberType.OctonaryNumberSystem: {
        switch (char) {
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7': {
            value += char;
            break;
          }
          default: {
            return new Token(TokenType.NumberInteger, value);
          }
        }
        break;
      }
      case NumberType.Hexadecimal: {
        switch (char) {
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
          case 'a':
          case 'b':
          case 'c':
          case 'd':
          case 'e':
          case 'f':
          case 'A':
          case 'B':
          case 'C':
          case 'D':
          case 'E':
          case 'F': {
            value += char;
            break;
          }
          default: {
            return new Token(TokenType.NumberInteger, value);
          }
        }
        break;
      }
      case NumberType.CodeLeft: {
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
            value += char;
            state = NumberType.Code;
            break;
          }
          case '\'': {
            value += char;
            state = NumberType.CodeRight;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.Code: {
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
            value += char;
            break;
          }
          case '\'': {
            value += char;
            state = NumberType.CodeRight;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case NumberType.CodeRight: {
        switch (char) {
          default: {
            return new Token(TokenType.NumberInteger, value);
          }
        }
      }
    }

  }

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

function lexicalLetter(sourceCode: string, index: number) {
  let char = "";

  function getChar() {
    return sourceCode.charAt(index++);
  }


  enum LetterType {
    Unkwon,
    // a-zA-Z
    Letter,
    // 0x
    Identifier
  }


  let state: LetterType = LetterType.Unkwon;
  let value = "";

  for (; ;) {
    char = getChar()
    switch (state) {
      case LetterType.Unkwon: {
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
            value += char;
            state = LetterType.Letter;
            break;
          }
          default:
            value += char;
            return new ErrorToken(value);
        }
        break;
      }
      case LetterType.Letter: {
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
            value += char;
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
            value += char;
            state = LetterType.Identifier;
            break;
          }
          case '_': {
            value += char;
            state = LetterType.Identifier;
            break;
          }
          default: {
            // 判断是否未关键字
            switch (value) {
              case keyword.Native:
                return new Token(TokenType.Native, value);
              case keyword.Function:
                return new Token(TokenType.Function, value);
              case keyword.Takes:
                return new Token(TokenType.Takes, value);
              case keyword.Returns:
                return new Token(TokenType.Returns, value);
              case keyword.Return:
                return new Token(TokenType.Return, value);
              case keyword.EndFunction:
                return new Token(TokenType.EndFunction, value);

              case keyword.Globals:
                return new Token(TokenType.Globals, value);
              case keyword.EndGlobals:
                return new Token(TokenType.EndGlobals, value);

              case keyword.If:
                return new Token(TokenType.If, value);
              case keyword.Then:
                return new Token(TokenType.Then, value);
              case keyword.Else:
                return new Token(TokenType.Else, value);
              case keyword.Elseif:
                return new Token(TokenType.Elseif, value);
              case keyword.EndIf:
                return new Token(TokenType.EndIf, value);

              case keyword.Loop:
                return new Token(TokenType.Loop, value);
              case keyword.Exitwhen:
                return new Token(TokenType.Exitwhen, value);
              case keyword.EndLoop:
                return new Token(TokenType.EndLoop, value);


              case keyword.Local:
                return new Token(TokenType.Local, value);
              case keyword.Constant:
                return new Token(TokenType.Constant, value);

              case keyword.Array:
                return new Token(TokenType.Array, value);

              case keyword.Set:
                return new Token(TokenType.Set, value);

              case keyword.Call:
                return new Token(TokenType.Call, value);

              case keyword.Type:
                return new Token(TokenType.Type, value);
              case keyword.Extends:
                return new Token(TokenType.Extends, value);

              case keyword.True:
                return new Token(TokenType.True, value);
              case keyword.False:
                return new Token(TokenType.False, value);

              case keyword.Null:
                return new Token(TokenType.Null, value);

              case keyword.Nothing:
                return new Token(TokenType.Nothing, value);

              case keyword.Integer:
                return new Token(TokenType.Integer, value);
              case keyword.Real:
                return new Token(TokenType.Real, value);
              case keyword.Boolean:
                return new Token(TokenType.Boolean, value);
              case keyword.String:
                return new Token(TokenType.String, value);
              case keyword.Handle:
                return new Token(TokenType.Handle, value);
              case keyword.Code:
                return new Token(TokenType.Code, value);

              case keyword.And:
                return new Token(TokenType.And, value);
              case keyword.Or:
                return new Token(TokenType.Or, value);
              case keyword.Not:
                return new Token(TokenType.Not, value);

              case keyword.Debug:
                return new Token(TokenType.Debug, value);

              default:
                return new Token(TokenType.Identifier, value);
            }
          }
        }
        break;
      }
      case LetterType.Identifier: {
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

          case '_': {
            value += char;
            break;
          }
          default: {
            return new Token(TokenType.Identifier, value);
          }
        }
        break;
      }
    }
  }


}




function lexicalString(sourceCode: string, index: number) {
  let char = "";

  function getChar() {
    return sourceCode.charAt(index++);
  }


  enum StringType {
    Unkwon,
    StringStart,
    String,
    Transferred,
    StringEnd,
  }


  let state: StringType = StringType.Unkwon;
  let value = "";

  for (; ;) {
    char = getChar();
    switch (+state) {
      case StringType.Unkwon: {
        switch (char) {
          case '"': {
            value += char;
            state = StringType.StringStart;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case StringType.StringStart: {
        switch (char) {
          case '"': {
            value += char;
            state = StringType.StringEnd;
            break;
          }
          case '\\': {
            value += char;
            state = StringType.Transferred;
            break;
          }
          case "": {
            return new ErrorToken(value);
          }
          default: {
            value += char;
            state = StringType.String;
          }
        }
        break;
      }
      case StringType.Transferred: {
        switch (char) {
          case '"': {
            value += char;
            state = StringType.String;
            break;
          }
          case '\\': {
            value += char;
            state = StringType.String;
            break;
          }
          case "": {
            return new ErrorToken(value);
          }
          default: {
            value += char;
            state = StringType.String;
          }
        }
        break;
      }
      case StringType.String: {
        switch (char) {
          case '"': {
            value += char;
            state = StringType.StringEnd;
            break;
          }
          case '\\': {
            value += char;
            state = StringType.Transferred;
            break;
          }
          case "": {
            return new ErrorToken(value);
          }
          default: {
            value += char;
          }
        }
        break;
      }
      case StringType.StringEnd: {
        return new Token(TokenType.StringValue, value);
      }

    }
  }

}



function lexicalOperator(sourceCode: string, index: number) {
  let char = "";

  function getChar() {
    return sourceCode.charAt(index++);
  }

  // + - * / = != == > < >= <= ( ) [ ] ,
  enum OperatorType {
    Unkwon,
    Plus,
    Minus,
    Product,
    Divisor,
    LineComment,
    LineCommentEnd,
    Assignment,
    Equal,
    Not,
    Unequal,
    greaterthan,
    LessThan,
    greaterthanEqual,
    LessThanEqual,
    LeftParenthesis,
    RightParenthesis,
    LeftBracket,
    RightBracket,
    Comma
  }


  let state: OperatorType = OperatorType.Unkwon;
  let value = "";

  for (; ;) {
    char = getChar();
    switch (+state) {
      case OperatorType.Unkwon: {
        switch (char) {
          case '+': {
            value += char;
            state = OperatorType.Plus;
            break;
          }
          case '-': {
            value += char;
            state = OperatorType.Minus;
            break;
          }
          case '*': {
            value += char;
            state = OperatorType.Product;
            break;
          }
          case '/': {
            value += char;
            state = OperatorType.Divisor;
            break;
          }
          case '=': {
            value += char;
            state = OperatorType.Assignment;
            break;
          }
          case '!': {
            value += char;
            state = OperatorType.Not;
            break;
          }
          case '>': {
            value += char;
            state = OperatorType.greaterthan;
            break;
          }
          case '<': {
            value += char;
            state = OperatorType.LessThan;
            break;
          }
          case '(': {
            value += char;
            state = OperatorType.LeftParenthesis;
            break;
          }
          case ')': {
            value += char;
            state = OperatorType.RightParenthesis;
            break;
          }
          case '[': {
            value += char;
            state = OperatorType.LeftBracket;
            break;
          }
          case ']': {
            value += char;
            state = OperatorType.RightBracket;
            break;
          }
          case ',': {
            value += char;
            state = OperatorType.Comma;
            break;
          }
          default: {
            value += char;
            return new ErrorToken(value);
          }
        }
        break;
      }
      case OperatorType.Plus: {
        return new Token(TokenType.Plus, value);
      }
      case OperatorType.Minus: {
        return new Token(TokenType.Minus, value);
      }
      case OperatorType.Product: {
        return new Token(TokenType.Product, value);
      }
      case OperatorType.Divisor: {
        switch (char) {
          case '/':
            value += char;
            state = OperatorType.LineComment;
            break;
          default:
            return new Token(TokenType.StringValue, value);
        }
        break;
      }
      case OperatorType.LineComment: {
        switch (char) {
          case '\n':
            value += char;
            state = OperatorType.LineCommentEnd;
            break;
          case '':
            return new Token(TokenType.Comment, value);
          default:
            value += char;
        }
        break;
      }
      case OperatorType.LineCommentEnd: {
        return new Token(TokenType.Comment, value);
      }
      case OperatorType.Assignment: {
        switch (char) {
          case '=':
            value += char;
            state = OperatorType.Equal;
            break;
          default:
            return new Token(TokenType.Assignment, value);
        }
        break;
      }
      case OperatorType.Equal: {
        return new Token(TokenType.Assignment, value);
      }
      case OperatorType.Not: {
        switch (char) {
          case '=':
            value += char;
            state = OperatorType.Unequal;
            break;
          default:
            value += char;
            return new ErrorToken(value);
        }
        break;
      }
      case OperatorType.Unequal: {
        return new Token(TokenType.Assignment, value);
      }
      case OperatorType.greaterthan: {
        switch (char) {
          case '=':
            value += char;
            state = OperatorType.greaterthanEqual;
            break;
          default:
            return new Token(TokenType.greaterthan, value);
        }
        break;
      }
      case OperatorType.greaterthanEqual: {
        return new Token(TokenType.greaterthanEqual, value);
      }
      case OperatorType.LessThan: {
        switch (char) {
          case '=':
            value += char;
            state = OperatorType.LessThanEqual;
            break;
          default:
            return new Token(TokenType.LessThanEqual, value);
        }
        break;
      }
      case OperatorType.LessThanEqual: {
        return new Token(TokenType.LessThanEqual, value);
      }
      case OperatorType.LeftParenthesis: {
        return new Token(TokenType.LeftParenthesis, value);
      }
      case OperatorType.RightParenthesis: {
        return new Token(TokenType.RightParenthesis, value);
      }
      case OperatorType.LeftBracket: {
        return new Token(TokenType.LeftBracket, value);
      }
      case OperatorType.RightBracket: {
        return new Token(TokenType.RightBracket, value);
      }
      case OperatorType.Comma: {
        return new Token(TokenType.Comma, value);
      }

    }
  }

}

function test1(){
  console.log(lexicalAnalyzer(`
!+
// 设置项目图标
function MultiboardSetItemIconBJ takes multiboard mb, integer col, integer row, string iconFileName returns nothing
    local integer curRow = 0
    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols
$我
                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                endif
            endloop
        endif
    endloop
endfunction

`))
}