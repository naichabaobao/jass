
/*
词法分析
*/
// ==============================

enum Type {
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
  // (+ -) (* /) (= != == > < >= <=) ( ) {} [ ] ,
  Plus, Minus, Product, Divisor, Assignment, Equal, Unequal, greaterthan, LessThan, greaterthanEqual, LessThanEqual, LeftParenthesis, RightParenthesis, LeftBracket, RightBracket, RightSquareBrackets, LeftSquareBrackets, Comma,
  // 单行注释
  Comment,
  Error,

  // 结束
  NewLine,
  Eof
}

class Token {
  public type: Type;
  public value: string;
  public line: number;
  public position: number;
  public index: number;

  constructor(type: Type, value: string, line: number, position: number, index: number) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.position = position;
    this.index = index;
  }
}

/**
 * 对文档内容分词
 * @param content jass内容
 */
function tokens(content: string): Array<Token> {
  const tokens = new Array<Token>();
  const addToken = function (token: Token) {
    tokens.push(token);
    if (value.length > 0) {
      value = "";
    }
  }

  let line = 0;
  let position = 0;
  enum PositionType {
    Default = 0x00,
    Letter = 0x10,
    Number = 0x20,
    Equal = 0x30,
    Unequal = 0x31,
    Divisor,
    greaterthan,
    LessThan,
    Error = 0x500,
  }
  let type = PositionType.Default;
  let value = "";

  for (let index = 0; index < content.length; index++) {
    const getChar = function () {
      return content.charAt(index);
    }
    const getNextChar = function () {
      return content.charAt(index + 1);
    }
    const vpp = function () {
      value += getChar();
    }
    const char = getChar();
    switch (type) {
      // 开始字符 (/ a-z A-Z)
      case PositionType.Default:
        if (isSpace(char)) {
          continue;
        }
        else if (isLetter(char)) {
          type = PositionType.Letter;
          vpp();
        } else if (isNumber(char) || isPoint(char) || isDollar(char)) {
          type = PositionType.Number;
          vpp();
        } else if (isPlus(char)) { // +
          addToken(new Token(Type.Plus, char, line, position, index));
        } else if (isMinus(char)) { // -
          addToken(new Token(Type.Minus, char, line, position, index));
        } else if (isCheng(char)) { // *
          addToken(new Token(Type.Product, char, line, position, index));
        } else if (isDiv(char)) { // /
          if (isDiv(getNextChar())) {
            type = PositionType.Divisor;
            vpp();
          } else {
            addToken(new Token(Type.Divisor, char, line, position, index));
          }
        } else if (isLeftYuan(char)) { // (
          addToken(new Token(Type.LeftParenthesis, char, line, position, index));
        } else if (isRightYuan(char)) { // )
          addToken(new Token(Type.RightParenthesis, char, line, position, index));
        } else if (isLeftHua(char)) { // {
          addToken(new Token(Type.LeftBracket, char, line, position, index));
        } else if (isRightHua(char)) {// }
          addToken(new Token(Type.RightBracket, char, line, position, index));
        } else if (isLeftFang(char)) { // [
          addToken(new Token(Type.LeftSquareBrackets, char, line, position, index));
        } else if (isRightFang(char)) { // ]
          addToken(new Token(Type.RightSquareBrackets, char, line, position, index));
        } else if (isEq(char)) { // =
          if (isEq(getNextChar())) {
            type = PositionType.Equal;
            vpp();
          } else {
            addToken(new Token(Type.Equal, char, line, position, index));
          }
        } else if (isFei(char)) { // !
          if (isEq(getNextChar())) {
            type = PositionType.Unequal;
            vpp();
          } else {
            addToken(new Token(Type.Error, char, line, position, index));
          }
        } else if (isGt(char)) { // >
          if (isEq(getNextChar())) {
            type = PositionType.greaterthan;
            vpp();
          } else {
            addToken(new Token(Type.greaterthan, char, line, position, index));
          }
        } else if (isLt(char)) { // <
          if (isEq(getNextChar())) {
            type = PositionType.LessThan;
            vpp();
          } else {
            addToken(new Token(Type.LessThan, char, line, position, index));
          }
        } else if (isLeftYuan(char)) { // (
          addToken(new Token(Type.LeftParenthesis, char, line, position, index));
        } else if (isRightYuan(char)) { // (
          addToken(new Token(Type.RightParenthesis, char, line, position, index));
        } else if (isLeftHua(char)) { // {
          addToken(new Token(Type.LeftBracket, char, line, position, index));
        } else if (isRightHua(char)) { // }
          addToken(new Token(Type.RightBracket, char, line, position, index));
        } else if (isLeftFang(char)) { // [
          addToken(new Token(Type.LeftSquareBrackets, char, line, position, index));
        } else if (isRightFang(char)) { // ]
          addToken(new Token(Type.RightSquareBrackets, char, line, position, index));
        } else if (isComma(char)) { // ,
          addToken(new Token(Type.Comma, char, line, position, index));
        } else {
          addToken(new Token(Type.Error, char, line, position, index));
        }
        break;
      case PositionType.Letter:
        if (isId(char)) {
          vpp();
          if (!isId(getNextChar())) {
            switch (value) {
              case keyword.Native:
                addToken(new Token(Type.Native, value, line, position, index));
              case keyword.Function:
                addToken(new Token(Type.Function, value, line, position, index));
              case keyword.Takes:
                addToken(new Token(Type.Takes, value, line, position, index));
              case keyword.Returns:
                addToken(new Token(Type.Returns, value, line, position, index));
              case keyword.Return:
                addToken(new Token(Type.Return, value, line, position, index));
              case keyword.EndFunction:
                addToken(new Token(Type.EndFunction, value, line, position, index));

              case keyword.Globals:
                addToken(new Token(Type.Globals, value, line, position, index));
              case keyword.EndGlobals:
                addToken(new Token(Type.EndGlobals, value, line, position, index));

              case keyword.If:
                addToken(new Token(Type.If, value, line, position, index));
              case keyword.Then:
                addToken(new Token(Type.Then, value, line, position, index));
              case keyword.Else:
                addToken(new Token(Type.Else, value, line, position, index));
              case keyword.Elseif:
                addToken(new Token(Type.Elseif, value, line, position, index));
              case keyword.EndIf:
                addToken(new Token(Type.EndIf, value, line, position, index));

              case keyword.Loop:
                addToken(new Token(Type.Loop, value, line, position, index));
              case keyword.Exitwhen:
                addToken(new Token(Type.Exitwhen, value, line, position, index));
              case keyword.EndLoop:
                addToken(new Token(Type.EndLoop, value, line, position, index));


              case keyword.Local:
                addToken(new Token(Type.Local, value, line, position, index));
              case keyword.Constant:
                addToken(new Token(Type.Constant, value, line, position, index));

              case keyword.Array:
                addToken(new Token(Type.Array, value, line, position, index));

              case keyword.Set:
                addToken(new Token(Type.Set, value, line, position, index));

              case keyword.Call:
                addToken(new Token(Type.Call, value, line, position, index));

              case keyword.Type:
                addToken(new Token(Type.Type, value, line, position, index));
              case keyword.Extends:
                addToken(new Token(Type.Extends, value, line, position, index));

              case keyword.True:
                addToken(new Token(Type.True, value, line, position, index));
              case keyword.False:
                addToken(new Token(Type.False, value, line, position, index));

              case keyword.Null:
                addToken(new Token(Type.Null, value, line, position, index));

              case keyword.Nothing:
                addToken(new Token(Type.Nothing, value, line, position, index));

              case keyword.Integer:
                addToken(new Token(Type.Integer, value, line, position, index));
              case keyword.Real:
                addToken(new Token(Type.Real, value, line, position, index));
              case keyword.Boolean:
                addToken(new Token(Type.Boolean, value, line, position, index));
              case keyword.String:
                addToken(new Token(Type.String, value, line, position, index));
              case keyword.Handle:
                addToken(new Token(Type.Handle, value, line, position, index));
              case keyword.Code:
                addToken(new Token(Type.Code, value, line, position, index));

              case keyword.And:
                addToken(new Token(Type.And, value, line, position, index));
              case keyword.Or:
                addToken(new Token(Type.Or, value, line, position, index));
              case keyword.Not:
                addToken(new Token(Type.Not, value, line, position, index));

              case keyword.Debug:
                addToken(new Token(Type.Debug, value, line, position, index));

              default:
                addToken(new Token(Type.Identifier, value, line, position, index));
            }
          }
        }
        break;
      case PositionType.Number:
        if (value.length == 1) {
          if (value == '0') {
            if(char == 'x' || isPoint(char) || isNumber(char)) {
              vpp();
            }
          }else if(value == '$') {
            if(is16(char)) {
              vpp();
            }
          }else /* 1-9 . */ {
            
          }
        }
        break;
    }
    if (isNewLine(getChar())) {
      line++;
      position = 0;
    } else {
      position++;
    }
  }

  return tokens;
}


export function isSpace(char: string): boolean {
  switch (char) {
    case ' ':
    case '\t':
      return true;
    default:
      return false;
  }
}

export function isNewLine(char: string): boolean {
  switch (char) {
    case '\r\n':
    case '\n':
      return true;
    default:
      return false;
  }
}

export function isNumber(char: string): boolean {
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
      return true;
    default:
      return false;
  }
}

function is16(char:string) : boolean{
  let is = false;
  switch (char) {
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
    case 'F':
      is = true;
      break;
  }
  return isNumber(char) || is;
}

export function isLowLetter(char: string): boolean {
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
      return true;
    default:
      return false;
  }
}

export function isUpLetter(char: string): boolean {
  switch (char) {
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
      return true;
    default:
      return false;
  }
}

export function isLetter(char: string): boolean {
  if (isLowLetter(char) || isUpLetter(char)) {
    return true;
  }
  return false;
}

export function isPoint(char: string): boolean {
  if (char == '.') {
    return true;
  }
  return false;
}

export function isDollar(char: string): boolean {
  if (char == '$') {
    return true;
  }
  return false;
}
// (+ -) (* /) (= != == > < >= <=) ( ) [ ] , _
function isPlus(char: string): boolean {
  if (char == '+') {
    return true;
  }
  return false;
}
function isMinus(char: string): boolean {
  if (char == '-') {
    return true;
  }
  return false;
}
function isCheng(char: string): boolean {
  if (char == '*') {
    return true;
  }
  return false;
}
function isDiv(char: string): boolean {
  if (char == '/') {
    return true;
  }
  return false;
}
function isEq(char: string): boolean {
  if (char == '=') {
    return true;
  }
  return false;
}
function isFei(char: string): boolean {
  if (char == '!') {
    return true;
  }
  return false;
}
function isGt(char: string): boolean {
  if (char == '>') {
    return true;
  }
  return false;
}
function isLt(char: string): boolean {
  if (char == '<') {
    return true;
  }
  return false;
}

function isLeftYuan(char: string): boolean {
  if (char == '(') {
    return true;
  }
  return false;
}
function isRightYuan(char: string): boolean {
  if (char == ')') {
    return true;
  }
  return false;
}
function isLeftFang(char: string): boolean {
  if (char == '[') {
    return true;
  }
  return false;
}
function isRightFang(char: string): boolean {
  if (char == ']') {
    return true;
  }
  return false;
}

function isLeftHua(char: string): boolean {
  if (char == '{') {
    return true;
  }
  return false;
}
function isRightHua(char: string): boolean {
  if (char == '}') {
    return true;
  }
  return false;
}
function isComma(char: string): boolean {
  if (char == ',') {
    return true;
  }
  return false;
}
function isMaohao(char: string): boolean {
  if (char == '"') {
    return true;
  }
  return false;
}
function isYinhao(char: string): boolean {
  if (char == "'") {
    return true;
  }
  return false;
}

function isxiahuaxian(char: string): boolean {
  if (char == '+') {
    return true;
  }
  return false;
}

function isId(char: string) {
  return isLetter(char) || isNumber(char) || isxiahuaxian(char);
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