import { readFileSync } from "fs";

/*
词法分析
*/
// ==============================

enum JTokenKind {
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

class JToken {
  public type: JTokenKind;
  public value: string;
  public line: number;
  public position: number;
  public index: number;

  constructor(type: JTokenKind, value: string, line: number, position: number, index: number) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.position = position;
    this.index = index;
  }
}

/**
 * 对文档内容分词
 * @param content jass内容,eof类型必须是\n，否者会导致行数错误
 */
function tokens(content: string): Array<JToken> {
  const tokens = new Array<JToken>();
  

  let line = 0;
  let position = 0;
  enum JState {
    Default = 0x00,
    Letter = 0x10,
    Number = 0x20,
    Equal = 0x30,
    Unequal = 0x31,
    Divisor,
    greaterthan,
    LessThan,
    String = 0x50,
    R,
    Error = 0x500,
  }
  let state = JState.Default;
  let buffer = "";
  const addToken = function (token: JToken) {
    tokens.push(token);
    if (buffer.length > 0) {
      buffer = "";
    }
    if(state != JState.Default) {
      state = JState.Default;
    }
  }
  for (let index = 0; index < content.length; index++) {
    const getChar = function () {
      return content.charAt(index);
    }
    const getNextChar = function () {
      return content.charAt(index + 1);
    }
    const vpp = function () {
      buffer += getChar();
    }
    const isEnd = function () :boolean {
      return index == content.length - 1;
    }
    const char = getChar();
    switch (state) {
      // 开始字符 (/ a-z A-Z)
      case JState.Default:
        if (isSpace(char)) {
          break;
        }else if(isNewLine(char)){
          addToken(new JToken(JTokenKind.NewLine, char, line, position, index));
        }
        else if (isLetter(char)) {
          state = JState.Letter;
          vpp();
          if(!isId(getNextChar())) {
            addToken(new JToken(JTokenKind.Identifier, buffer, line, position, index));
          }
        } else if (isNumber(char) || isPoint(char) || isDollar(char) || isYinhao(char)) {
          state = JState.Number;
          vpp();
          if(char == '0' && !(getNextChar() == 'x' || isPoint(getNextChar()) || is0_7(getNextChar()))) { // 非 x . 0-7
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }else if(is1_9(char) && !(isPoint(getNextChar()) || isNumber(getNextChar()))) { // 非 . 0-9
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }else if(isPoint(char) && !isNumber(getNextChar())) { // 非 0-9
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }else if(isDollar(char) && !is16(getNextChar())) { // 非 0-f
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }else if(isYinhao(char)  && !(isnumberorletter(getNextChar()) || isYinhao(getNextChar()))) {
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }
        } else if (isPlus(char)) { // +
          addToken(new JToken(JTokenKind.Plus, char, line, position, index));
        } else if (isMinus(char)) { // -
          addToken(new JToken(JTokenKind.Minus, char, line, position, index));
        } else if (isCheng(char)) { // *
          addToken(new JToken(JTokenKind.Product, char, line, position, index));
        } else if (isDiv(char)) { // /
          state = JState.Divisor;
          vpp();
          if (!isDiv(getNextChar())) {
            addToken(new JToken(JTokenKind.Divisor, buffer, line, position, index));
          }
        } else if (isLeftYuan(char)) { // (
          addToken(new JToken(JTokenKind.LeftParenthesis, char, line, position, index));
        } else if (isRightYuan(char)) { // )
          addToken(new JToken(JTokenKind.RightParenthesis, char, line, position, index));
        } else if (isLeftHua(char)) { // {
          addToken(new JToken(JTokenKind.LeftBracket, char, line, position, index));
        } else if (isRightHua(char)) {// }
          addToken(new JToken(JTokenKind.RightBracket, char, line, position, index));
        } else if (isLeftFang(char)) { // [
          addToken(new JToken(JTokenKind.LeftSquareBrackets, char, line, position, index));
        } else if (isRightFang(char)) { // ]
          addToken(new JToken(JTokenKind.RightSquareBrackets, char, line, position, index));
        } else if (isEq(char)) { // =
          state = JState.Equal;
          vpp();
          if (!isEq(getNextChar())) {
            addToken(new JToken(JTokenKind.Equal, buffer, line, position, index));
          }
        } else if (isFei(char)) { // !
          state = JState.Unequal;
          vpp();
          if (!isEq(getNextChar())) {
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }
        } else if (isGt(char)) { // >
          state = JState.greaterthan;
          vpp();
          if (!isEq(getNextChar())) {
            addToken(new JToken(JTokenKind.greaterthan, buffer, line, position, index));
          }
        } else if (isLt(char)) { // <
          state = JState.LessThan;
            vpp();
          if (!isEq(getNextChar())) {
            addToken(new JToken(JTokenKind.LessThan, buffer, line, position, index));
          }
        } else if (isLeftYuan(char)) { // (
          addToken(new JToken(JTokenKind.LeftParenthesis, char, line, position, index));
        } else if (isRightYuan(char)) { // (
          addToken(new JToken(JTokenKind.RightParenthesis, char, line, position, index));
        } else if (isLeftHua(char)) { // {
          addToken(new JToken(JTokenKind.LeftBracket, char, line, position, index));
        } else if (isRightHua(char)) { // }
          addToken(new JToken(JTokenKind.RightBracket, char, line, position, index));
        } else if (isLeftFang(char)) { // [
          addToken(new JToken(JTokenKind.LeftSquareBrackets, char, line, position, index));
        } else if (isRightFang(char)) { // ]
          addToken(new JToken(JTokenKind.RightSquareBrackets, char, line, position, index));
        } else if (isComma(char)) { // ,
          addToken(new JToken(JTokenKind.Comma, char, line, position, index));
        } else if(isMaohao(char)) { // "
          state = JState.String;
          vpp();
          if(isNewLine(getNextChar())) {
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }
        }else {
          addToken(new JToken(JTokenKind.Error, char, line, position, index));
        }
        break;
      case JState.Letter:
        vpp();
        if (!isId(getNextChar())) {
          switch (buffer) {
            case keyword.Native:
              addToken(new JToken(JTokenKind.Native, buffer, line, position, index));
break;
            case keyword.Function:
              addToken(new JToken(JTokenKind.Function, buffer, line, position, index));
break;
            case keyword.Takes:
              addToken(new JToken(JTokenKind.Takes, buffer, line, position, index));
break;
            case keyword.Returns:
              addToken(new JToken(JTokenKind.Returns, buffer, line, position, index));
break;
            case keyword.Return:
              addToken(new JToken(JTokenKind.Return, buffer, line, position, index));
break;
            case keyword.EndFunction:
              addToken(new JToken(JTokenKind.EndFunction, buffer, line, position, index));
              break;
            case keyword.Globals:
              addToken(new JToken(JTokenKind.Globals, buffer, line, position, index));
break;
            case keyword.EndGlobals:
              addToken(new JToken(JTokenKind.EndGlobals, buffer, line, position, index));
              break;
            case keyword.If:
              addToken(new JToken(JTokenKind.If, buffer, line, position, index));
break;
            case keyword.Then:
              addToken(new JToken(JTokenKind.Then, buffer, line, position, index));
break;
            case keyword.Else:
              addToken(new JToken(JTokenKind.Else, buffer, line, position, index));
break;
            case keyword.Elseif:
              addToken(new JToken(JTokenKind.Elseif, buffer, line, position, index));
break;
            case keyword.EndIf:
              addToken(new JToken(JTokenKind.EndIf, buffer, line, position, index));
              break;
            case keyword.Loop:
              addToken(new JToken(JTokenKind.Loop, buffer, line, position, index));
break;
            case keyword.Exitwhen:
              addToken(new JToken(JTokenKind.Exitwhen, buffer, line, position, index));
break;
            case keyword.EndLoop:
              addToken(new JToken(JTokenKind.EndLoop, buffer, line, position, index));
              break;

            case keyword.Local:
              addToken(new JToken(JTokenKind.Local, buffer, line, position, index));
break;
            case keyword.Constant:
              addToken(new JToken(JTokenKind.Constant, buffer, line, position, index));
              break;
            case keyword.Array:
              addToken(new JToken(JTokenKind.Array, buffer, line, position, index));
              break;
            case keyword.Set:
              addToken(new JToken(JTokenKind.Set, buffer, line, position, index));
              break;
            case keyword.Call:
              addToken(new JToken(JTokenKind.Call, buffer, line, position, index));
              break;
            case keyword.Type:
              addToken(new JToken(JTokenKind.Type, buffer, line, position, index));
break;
            case keyword.Extends:
              addToken(new JToken(JTokenKind.Extends, buffer, line, position, index));
              break;
            case keyword.True:
              addToken(new JToken(JTokenKind.True, buffer, line, position, index));
break;
            case keyword.False:
              addToken(new JToken(JTokenKind.False, buffer, line, position, index));
              break;
            case keyword.Null:
              addToken(new JToken(JTokenKind.Null, buffer, line, position, index));
              break;
            case keyword.Nothing:
              addToken(new JToken(JTokenKind.Nothing, buffer, line, position, index));
              break;
            case keyword.Integer:
              addToken(new JToken(JTokenKind.Integer, buffer, line, position, index));
break;
            case keyword.Real:
              addToken(new JToken(JTokenKind.Real, buffer, line, position, index));
break;
            case keyword.Boolean:
              addToken(new JToken(JTokenKind.Boolean, buffer, line, position, index));
break;
            case keyword.String:
              addToken(new JToken(JTokenKind.String, buffer, line, position, index));
break;
            case keyword.Handle:
              addToken(new JToken(JTokenKind.Handle, buffer, line, position, index));
break;
            case keyword.Code:
              addToken(new JToken(JTokenKind.Code, buffer, line, position, index));
              break;
            case keyword.And:
              addToken(new JToken(JTokenKind.And, buffer, line, position, index));
break;
            case keyword.Or:
              addToken(new JToken(JTokenKind.Or, buffer, line, position, index));
break;
            case keyword.Not:
              addToken(new JToken(JTokenKind.Not, buffer, line, position, index));
              break;
            case keyword.Debug:
              addToken(new JToken(JTokenKind.Debug, buffer, line, position, index));
              break;
            default:
              addToken(new JToken(JTokenKind.Identifier, buffer, line, position, index));
              break;
          }
        }
        break;
      case JState.Number:
        vpp();
        if(buffer.startsWith('0x')) {
          if(!is16(getNextChar())) {
            if(buffer == '0x') {
              addToken(new JToken(JTokenKind.Error, buffer, line, position, index)); // 0x
            }else{
              addToken(new JToken(JTokenKind.Number, buffer, line, position, index)); // 0x0-F
            }
          }
        }else if(buffer.startsWith('$')) {
          if(!is16(getNextChar())) {
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }
        }else if(buffer.startsWith('0.')) {
          if(!isNumber(getNextChar())) {
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }
        }else if(buffer.startsWith('0')) {
          if(!is0_7(getNextChar())) {
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }
        }else if(buffer.startsWith('.')) {
          if(!isNumber(getNextChar())) {
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }
        }else if(buffer.startsWith("'")) {
          if(isYinhao(char)) {
            addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
          }else if(isnumberorletter(char)){
            // nothing
          } else{
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }
        }else /* 1 - 9 */ {
          if(buffer.includes('.')) {
            if(!isNumber(getNextChar())) {
              addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
            }
          }else{
            if(!(isNumber(getNextChar()) || isPoint(getNextChar()))) {
              addToken(new JToken(JTokenKind.Number, buffer, line, position, index));
            }
          }
        }
        break;
      case JState.Equal:
        // 只有==这种情况
        vpp();
        addToken(new JToken(JTokenKind.Equal, buffer, line, position, index));
        break;
      case JState.Unequal:
        // 只有!=这种情况
        vpp();
        addToken(new JToken(JTokenKind.Unequal, buffer, line, position, index));
        break;
      case JState.greaterthan:
        // 只有>=这种情况
        vpp();
        addToken(new JToken(JTokenKind.greaterthan, buffer, line, position, index));
        break;
      case JState.LessThan:
        // 只有<=这种情况
        vpp();
        addToken(new JToken(JTokenKind.LessThan, buffer, line, position, index));
        break;
      case JState.Divisor:
        vpp();
        if(isNewLine(getNextChar()) || isEnd()) { 
          addToken(new JToken(JTokenKind.Comment, buffer, line, position, index));
        }
        break;
      case JState.String:
        vpp();
        if(isMaohao(char)) {
          if(!iszhuanyijiesu(buffer.substring(0, buffer.length - 1))) {
            // 非转义情况下遇到 " 
            addToken(new JToken(JTokenKind.StringValue, buffer, line, position, index));
          }else if(isNewLine(getNextChar()) || isEnd()) {
            addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
          }
        }else if(isNewLine(getNextChar()) || isEnd()) {
          addToken(new JToken(JTokenKind.Error, buffer, line, position, index));
        }
        break;
      default:
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
    case '\n':
    case '\r':
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

function is0_7(char:string) : boolean{
  switch (char) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
      return true;
  }
  return false;
}

function is1_9(char:string) : boolean{
  switch (char) {
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
  }
  return false;
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
  if (char == '_') {
    return true;
  }
  return false;
}

function isId(char: string) : boolean{
  return isLetter(char) || isNumber(char) || isxiahuaxian(char);
}

function isnumberorletter(char: string) : boolean{
  return isLetter(char) || isNumber(char);
}

function iszhuangyi(char: string) : boolean{
  return char == '\\';
}


function iszhuanyijiesu(value: string): boolean {
  let is = false;
  for (let index = value.length - 1; index >= 0; index--) {
    const char = value.charAt(index);
    if(iszhuangyi(char)) {
      if(is) {
        is = false;
      }else{
        is = true;
      }
    }else {
      break;
    }
  }
  return is;
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

//=============================测试分割线================================
const start = new Date().getTime();
const content = readFileSync("D:/project/jass2/src/resources/static/jass/blizzard.j", {
  encoding: "UTF-8"
}).toString().replace(/\r\n/g, "\n");
console.log("读取文件时间 = " + (new Date().getTime() - start));
const start2 = new Date().getTime();
const ts = tokens(content);
console.log("解析时间 = " + (new Date().getTime() - start2));
// console.log(ts.map(t => t.type + " " +t.value));
console.log("ts.length = " + ts.length);
console.log(ts.filter(t => t.type == JTokenKind.Error))
console.log("ts.error.length = " + ts.filter(t => t.type == JTokenKind.Error).length);

// console.log(iszhuanyijiesu(`\\\\\\`))
// console.log(`aaa`.substring(0, 2))
console.log(tokens(`

`))

//=============================测试分割线结束================================

/*
ast解析
*/
/**
 * 
 */
class Jnode {

}

class Statement extends Jnode {

}

class Expression extends Jnode {

}

class Block extends Jnode {}

class TypeDeclaration extends Statement{
  public name:string|null = null;
  public extends:string|null = null;
}

class FunctionDeclaration extends Statement{
  public name:string|null = null;
  public takes:Takes|null = null;
  public returns:ReturnsStatement|null = null;
}

interface TakesStatement extends Statement{}

class Takes implements TakesStatement {
  public takes:Array<Take>|Nothing|null = null;
}

class Take extends Statement {
  type:string|null = null;
  name:string|null = null;
}

class Nothing extends Jnode { }

class ReturnsStatement extends Statement {
  type:string|Nothing|null = null;
}

class FunctionBlock extends Block {
  public statements:Array<LocalStatement|LocalArrayStatement|SetStatement|SetArrayStatement|CallStatement>|null = null;
}

class LocalStatement extends Statement {
  type:string|null = null;
  name:string|null = null;
  value: Expression|null = null;
}

class LocalArrayStatement extends Statement {
  type:string|null = null;
  name:string|null = null;
}

class SetStatement extends Statement {
  name:string|null = null;
  value: Expression|null = null;
}

class SetArrayStatement extends Statement {
  name:string|null = null;
  index: Expression|null = null;
  value: Expression|null = null;
}

class CallExpression extends Expression{
  name:string|null = null;
  arguments:Array<Expression> = new Array<Expression>();
}

class CallStatement extends Statement {
  expression:CallExpression|null = null;
}

class IfStatement extends Statement {
  condition:Expression|null = null;
}

/**
 * 表达式
 * 
 */
class Jexpression extends Jnode{

}
