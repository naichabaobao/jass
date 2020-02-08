
enum TokenType {
  // 关键字 
  Native,  Function,  Takes,  Returns,  Return,  EndFunction, Globals,  EndGlobals, If,  Then,  Else,  Elseif,  EndIf, Loop,  Exitwhen,  EndLoop, Local,  Constant, Array, Set, Call, Type,  Extends, True,  False, Null, Nothing, Integer,  Real,  Boolean,  String,  Handle,  Code, And,  Or,  Not, Debug, 
  // 标识符
  Identifier,
  // 整数
  NumberInteger, NumberCode, NumberReal,
  // 实数
  StringValue,
  // 操作符
  // + - * / = != == > < >= <= ( ) [ ] ,
  Plus, Minus, Product, Divisor, Assignment, Equal, Unequal, greaterthan, LessThan, LeftParenthesis, RightParenthesis, LeftBracket, RightBracket, Comma 
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

function lexicalAnalyzer(sourceCode: string) {
  let index = 0;

  function getChar() {
    return sourceCode[index++];
  }

  while (index < sourceCode.length) {
    switch (sourceCode[index]) {
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
        lexicalNumber(sourceCode, index)
      }
    }
  }



}


/**
 * 未处理'addd'
 * @param sourceCode 
 * @param index 
 */
function lexicalNumber(sourceCode: string, index: number) {

  let char = "";

  function getChar() {
    const c = sourceCode.charAt(index++);
    console.log(c);
    return c;
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
    Hexadecimal
  }


  let state: NumberType = NumberType.Unkwon;
  let value = "";

  for (; ;) {
    char = getChar();
    switch (+state) {

      case NumberType.Unkwon: {
        switch (char) {
          case '0': {
            console.log("-0-");
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
          default: {
            throw new lexicalError();
          }
        }
        break;
      }
      case NumberType.Zero: {
        switch (char) {
          case 'x': {
            console.log("-x-");
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
            console.log("-ZeroX-");
            value += char;
            state = NumberType.Hexadecimal;
            break;
          }
          default: {
            throw new lexicalError();
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
            throw new lexicalError();
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
            throw new lexicalError();
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
            console.log("-Hexadecimal-");
            value += char;
            break;
          }
          default: {
            console.log("-Token-");
            return new Token(TokenType.NumberInteger, value);
          }
        }
        break;
      }

    }

  }

}

try {
  console.log(lexicalNumber(`.5`, 0));
  console.log(lexicalNumber(`6.5`, 0));
  console.log(lexicalNumber(`564`, 0));
  console.log(lexicalNumber(`0x23f`, 0));
  console.log(lexicalNumber(`0768`, 0));
  console.log(lexicalNumber(`$6ac`, 0));
} catch (err) {
  console.error(err)
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
    const c = sourceCode.charAt(index++);
    console.log(c);
    return c;
  }
  // Number -> 非Number     Number -> DecimalPoint -> Real 
  // Zero -> Hexadecimal   Zero -> OctonaryNumberSystem    Zero -> DecimalPoint
  // DollarSign
  // DecimalPoint -> Real
  enum LetterType {
    Unkwon,
    // a-zA-Z
    Letter,
    // 0x
    Identifier,
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
    Hexadecimal
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
            throw new lexicalError();
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
                case  keyword.Native:
                case  keyword.Function:
                case  keyword.Takes:
                case  keyword.Returns:
                case  keyword.Return:
                case  keyword.EndFunction:
              
                case  keyword.Globals:
                case  keyword.EndGlobals:
              
                case  keyword.If:
                case  keyword.Then:
                case  keyword.Else:
                case keyword.Elseif:
                case  keyword.EndIf:
              
                case  keyword.Loop:
                case  keyword.Exitwhen:
                case  keyword.EndLoop:
              
              
                case  keyword.Local:
                case  keyword.Constant:
                
                case  keyword.Array:
              
                case  keyword.Set:
              
                case  keyword.Call:
              
                case  keyword.Type:
                case  keyword.Extends:
              
                case  keyword.True:
                case  keyword.False:
              
                case  keyword.Null:
              
                case  keyword.Nothing:
              
                case  keyword.Integer:
                case  keyword.Real:
                case  keyword.Boolean:
                case  keyword.String:
                case  keyword.Handle:
                case  keyword.Code:
              
                case  keyword.And:
                case  keyword.Or:
                case  keyword.Not:
              
                case  keyword.Debug:
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
