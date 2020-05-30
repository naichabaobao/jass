/*
語法解析
*/

import {Token,TokenParser, LexicalTool} from './token';

class Statement {
  public readonly range:Range = Range.default();
}

class Position {
  public readonly line:number;
  public readonly position:number;

  constructor(line:number,position:number){
    this.line = line;
    this.position = position;
  }
}

class Range {
  public readonly start_line:number;
  public readonly start_position:number;
  public readonly end_line:number;
  public readonly end_position:number;

  constructor(start_line:number,start_position:number,end_line:number,end_position:number) {
    this.start_line = start_line;
    this.start_position = start_position;
    this.end_line = end_line;
    this.end_position = end_position;
  }

  public static from(startPostion:Position,endPosition:Position){
    return new Range(startPostion.line, startPostion.position, endPosition.line, endPosition.position);
  }

  
  public get start() : Position {
    return new Position(this.start_line, this.start_position);
  }
  
  public get end() : Position {
    return new Position(this.end_line, this.end_position);
  }

  public withRange(range:Range) {
    Object.assign(this,range);
    return this;
  }

  public withPosition(startPosition:Position,endPosition:Position) {
    Object.assign(this,Range.from(startPosition,endPosition));
    return this;
  }

  public with(start_line:number,start_position:number,end_line:number,end_position:number) {
    Object.assign(this,new Range(start_line,start_position,end_line,end_position));
    return this;
  }

  public static default() {
    return new Range(0,0,0,0);
  }

}


class Comment implements Statement{

  public readonly range: Range = Range.default();
  public readonly origin:string;

  constructor(comment:string) {
    this.origin = comment;
  }

  public get content() : string {
    return /\/\/\s*(?<content>.+)\s*/.exec(this.origin)?.groups?.content ?? "";
  }
  
}

class Type implements Statement{
  public readonly range: Range = Range.default();
  private static _types:Map<string,Type> = new Map<string,Type>([
    ["boolean", new Type("boolean")],
    ["integer", new Type("integer")],
    ["real", new Type("real")],
    ["string", new Type("string")],
    // 對象樹中允許local code name的寫法，後面通過預編譯禁止；
    ["code", new Type("code")],
    ["handle", new Type("handle")]
  ]);

  private readonly name:string;
  protected readonly extend:Type = Type.get("handle") as Type;

  private constructor (name:string, extend?:Type) {
    this.name = name;
    if(extend) this.extend = extend;
  }

  public parent() {
    return this.extend;
  }

  public childrens() {
    return Type.types().filter(value => value.extend.name == this.name);
  }
  
  public static builder(name:string, extend?:Type) {
    return this._types.get(name) ?? (() => {
      const type = new Type(name, extend);
      this._types.set(name, type);
      return type;
    })();
  }

  public static get(name:string) {
    return this._types.get(name);
  }

  public static types() {
    const types = new Array<Type>();
    for (const value of this._types.values()) {
      types.push(value);
    }
    return types;
  }
  
}

interface StatementInterface {
  type:Type;
  name:string;
  flag:"constant"|"local"|null;
}

class Global implements StatementInterface,Statement{
  public readonly range: Range = Range.default();
  public readonly type: Type;
  public readonly name: string;
  public readonly flag:"constant"|null;

  constructor (type:Type,name:string,flag:"constant"|null = null) {
    this.type = type;
    this.name = name;
    this.flag = flag;
  }

}


class Globals extends Array<Global|Comment> implements Statement{
  public readonly range: Range = Range.default();
}

class Nothing implements Statement{
  public readonly range: Range = Range.default();
}

class Take implements Statement{
  public readonly range: Range = Range.default();
  public readonly type:Type;
  public readonly name:string;
  constructor(type:Type, name: string) {
    this.type = type;
    this.name = name;
  }
}

class Takes extends Array<Take> implements Statement {
  public readonly range: Range = Range.default();
}

class _FunctionConstrut implements Statement{
  public readonly range: Range = Range.default();
  public readonly name:string;
  public readonly takes:Takes|Nothing;
  public readonly returns:Type|Nothing;

  constructor(name:string, takes:Takes|Nothing, returns:Type|Nothing) {
    this.name = name;
    this.takes = takes;
    this.returns = returns;
  }

}

class Native extends _FunctionConstrut{
  public readonly flag:"constant"|null = null;

  constructor(name:string, takes:Takes|Nothing, returns:Type|Nothing, flag?:"constant"|null) {
    super(name, takes, returns);
    if(flag) this.flag = flag;
  }

}

/*
1
+1
+1 - 1
*/
class Expression {
  public readonly range:Range = Range.default();
}

class Value {

}

//op value | op id | op
class Block implements Expression{
  public readonly range:Range = Range.default();
}

class ConditionValue implements Expression{
  public readonly range:Range = Range.default();
}


/**
 * 0-9
 */
class IntegerValue implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  public integerValue() {
    return parseInt(this.value);
  }
}

/**
 * '0000'
 */
class IntegerCodeValue implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  public codeValue() {
    return this.value.replace(/'/g, '');
  }

  public integerValue() {
    const valueString16 = '0x' + this.codeValue().replace(/[\da-zA-Z]/g, function(subString) {
      return subString.charCodeAt(0).toString(16);
    });
    return parseInt(valueString16);
  }
}

/**
 * $16161616
 */
class Integer$16Value implements Expression {
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  public integerValue() {
    return parseInt(this.value.replace("\$", '0x'));
  }
}


/**
 * 0x16161616
 */
class Integer0X16Value implements Expression {
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  public integerValue() {
    return parseInt(this.value);
  }
}

/**
 * 088
 */
class IntegerOctalValue implements Expression {
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  public integerValue() {
    return parseInt(this.value);
  }
}

class StringValue implements Expression{
  public readonly range:Range = Range.default();
}

class RealValue implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:string;

  constructor (value:string) {
    this.value = value;
  }

  
  /**
   * 把.0或者0.缺省的浮點數修復成0.0
   */
  private repair() {
    if(this.value.startsWith(".")) {
      return `0${this.value}`;
    }else if(this.value.endsWith(".")) {
      return `${this.value}0`;
    }else {
      return this.value;
    }
  }

  public realValue() {
    return parseFloat(this.repair());
  }
}

/**
 * 整形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1)
 */
class IntegerOperationPriorityExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:IntegerOperationPriorityExpression|
  IntegerValue|
  IntegerCodeValue|IntegerOctalValue|
  Integer$16Value|Integer0X16Value|IntegerAddOperationExpression;
  constructor (value:IntegerOperationPriorityExpression|
    IntegerValue|
    IntegerCodeValue|
    Integer$16Value|
    Integer0X16Value|IntegerAddOperationExpression) {
      this.value = value;
    }
}

/**
 * 整形加法表達式
 */
class IntegerAddOperationExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly left:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression;
  public readonly right:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerAddOperationExpression;

  constructor(left:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression,right:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression) {
    this.left = left;
    this.right = right;
  }

}

/**
 * 浮點形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1) (1 + .1)
 */
class RealOperationPriorityExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:IntegerOperationPriorityExpression|
  IntegerValue|
  IntegerCodeValue|IntegerOctalValue|
  Integer$16Value|Integer0X16Value|IntegerAddOperationExpression|RealAddOperationExpression
  |RealValue;
  constructor (value:IntegerOperationPriorityExpression|
    IntegerValue|
    IntegerCodeValue|
    Integer$16Value|
    Integer0X16Value|IntegerAddOperationExpression) {
      this.value = value;
    }
}

/**
 * 浮點形加法表達式
 */
class RealAddOperationExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly left:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression|RealValue|RealOperationPriorityExpression;
  public readonly right:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression|RealValue|RealOperationPriorityExpression;

  constructor(left:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression|RealValue|RealOperationPriorityExpression,right:IntegerValue|IntegerCodeValue|Integer0X16Value|Integer$16Value|IntegerOperationPriorityExpression|IntegerOctalValue|IntegerAddOperationExpression|RealValue|RealOperationPriorityExpression) {
    this.left = left;
    this.right = right;
  }

}

/**
 * 整形優先表達式
 * (1) ('0000') (0x0000) ($0000) (0000)
 * (1 + 1) (1 + .1)
 */
class StringOperationPriorityExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly value:StringValue|StringOperationPriorityExpression|StringAddOperationExpression;
  constructor (value:StringValue|StringOperationPriorityExpression|StringAddOperationExpression) {
      this.value = value;
    }
}

/**
 * 整形加法表達式
 */
class StringAddOperationExpression implements Expression{
  public readonly range:Range = Range.default();
  public readonly left:StringValue|StringOperationPriorityExpression|StringAddOperationExpression;
  public readonly right:StringValue|StringOperationPriorityExpression|StringAddOperationExpression;

  constructor(left:StringValue|StringOperationPriorityExpression|StringAddOperationExpression,right:StringValue|StringOperationPriorityExpression|StringAddOperationExpression) {
    this.left = left;
    this.right = right;
  }

}


class CallExpression implements Expression{
  public readonly range:Range = Range.default();

}

class Local implements StatementInterface,Statement{
  public readonly flag:"local" = "local";
  public readonly range: Range = Range.default();
  public readonly type:Type;
  public readonly name:string;

  constructor(type:Type,name:string) {
    this.type = type;
    this.name = name;
  }

}

class SetStatement extends Statement{

}

class Function extends Array<Local> implements _FunctionConstrut {
  public readonly range: Range = Range.default();
  public name: string;
  public takes: Takes|Nothing;
  public returns: Type|Nothing;

  constructor(name:string, takes:Takes|Nothing, returns:Type|Nothing) {
    super();
    this.name = name;
    this.takes = takes;
    this.returns = returns;
  }




}

class Jass extends Array<Type|Global|Comment|Native|Function>{
  private _fileName:string = "";
  public readonly error_tokens:Array<Token> = [];

  constructor(fileName?:string) {
    super();
    if(fileName) this._fileName = fileName;
  }

  public clear() {
    this.length = 0;
  }

  public get fileName() : string {
    return this._fileName;
  }

  
  public set fileName(fileName: string) {
    this._fileName = fileName;
  }
  
}

enum SyntexEnum {
  default = "default",
  other = "other",
  type = "type",
  typeNaming = "typeNaming",

}

enum SyntexType {
  nothing = "nothing",
  comment = "comment",
  type = "type",
  native = "native",
  globals = "globals",
  func = "function"
}

class SyntexParser {

  private _need_type = false;
  private _need_native = false;
  private _need_globals = true;
  private _need_function = true;
  private _content:string;
  private _tokenData:TokenParser;

  constructor(content:string) {
    this._content = content;
    const tokenData = new TokenParser(this._content);
    tokenData
    this._tokenData = tokenData;
  }

  protected tree:Jass = new Jass();
  public ast() {
    if(this._change) {

      const keyword = "keyword";
      const operation = "operation";
      const identifier = "identifier";
      const value = "value";
      const other = "other";
      const comment = "comment";

      let index = 0;
      let type = SyntexEnum.default;
      const getToken = () => {
        return this.tokens[index++];
      };
      const toOther = function () {
        type = SyntexEnum.other;
        eat(getToken());
      };
      // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
      const eat_type = (token:Token, nextToken:Token = this.tokens[index + 1]) => {
        // type = SyntexEnum.type;
        if(token.type == identifier) {
          const name = token.value;
          const extendToken = getToken();
          if(extendToken.type == keyword && extendToken.value == "extends") {
            const extendTypeToken = getToken();
            if(extendTypeToken.type == identifier) {
              const extendType = extendTypeToken.value;
              Type.builder(name, Type.get(extendType));
              type = SyntexEnum.default;
              eat(getToken());
            }else {
              toOther();
            }
          }else {
            toOther();
          }
        }else {
          toOther();
        }
      };
      const eat = (token:Token, nextToken:Token = this.tokens[index + 1]) => {
        switch(type) {
          case SyntexEnum.default:
            if(token.type == keyword) {
              if(token.value == "type") {
                type = SyntexEnum.type;
                eat_type(getToken());
              }else if(token.value == "globals") {
                type = SyntexEnum.type;
                eat_type(getToken());
              }
            }
            break;
        }
        if(token.type == other) {

        }
      };
      eat(getToken());
    }
  }
  // Identifier expected. 'if' is a reserved word that cannot be used here
  public ast1 () {
    if(this._change) {
      this.tree.clear();
        
      let block = SyntexType.nothing;
      for (let index = 0; index < this.tokens.length; index++) {
        const token = this.tokens[index];
        const nextToken:Token|undefined = this.tokens[index + 1];
        // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
        const withs = function(any:Statement) {
          any.range.with(token.line, token.position, token.line, token.end_position);
        }
        let value:Comment|Type|Native|null = null;
        switch(block) {
          case SyntexType.comment.toString():
            if(token.type == "operation" && token.value == "\n") {
              block = SyntexType.nothing;
            }
            break;
          case SyntexType.type.toString():
            break;
          case SyntexType.native.toString():
            break;
          case SyntexType.globals.toString():
            break;
          case SyntexType.func.toString():
            break;
          default:
            if(token.type == "comment") {
              block = SyntexType.comment;
              const comment = new Comment(token.value);
              withs(comment);
              this.tree.push(comment);
            }else if(token.type == "operation") {
              if(token.value == "\n") {
                block = SyntexType.nothing;
              }else {
                this.tree.error_tokens.push(token);
              }
            }else if(token.type == "keyword") {
              if(token.value == "type") {
                block = SyntexType.type;
              }else if(token.value == "native") {
                block = SyntexType.native;
              }else if(token.value == "globals") {
                block = SyntexType.globals;
              }else if(token.value == "function") {
                block = SyntexType.func;
              }else{
                this.tree.error_tokens.push(token);
              }
            }
        }
      }
      this._change = false;
    }
    return this.tree;
  }

  private _change = true;
  private _set_change() {
    this._change = true;
  }
  
  public get needType() : boolean {
    return this._need_type;
  }

  
  public get needGlobals() : boolean {
    return this._need_globals;
  }

  
  public get needNative() : boolean {
    return this._need_native;
  }
  
  
  public get needFunction() : boolean {
    return this._need_function;
  }
  
  
  public set needType(needType : boolean) {
    if(this._need_type != needType) {
      this._set_change();
      this._need_type = needType;
    }
  }
  
  
  public set needGlobals(needGlobals : boolean) {
    if(this._need_globals != needGlobals) {
      this._set_change();
      this._need_globals = needGlobals;
    }
  }

  
  public set needNative(needNative : boolean) {
    if(this._need_native != needNative) {
      this._set_change();
      this._need_native = needNative;
    }
  }
  
  
  public set needFunction(needFunction : boolean) {
    if(this._need_function != needFunction) {
      this._set_change();
      this._need_function = needFunction;
    }
  }

  
  public get tokens() :Array<Token> {
    return this._tokenData.tokens();
  }
  
  

}

class _{
  left:string|null = null;
  right:string|null = null;
  op:"+"|"-"|"*"|"/"|null = null;
}



/**
 * 項
 */
class T extends _{
}

/**
 * 因子
 */
class F  extends _{
  value:E = new E;
}

/**
 * 表達式
 */
class E  extends _{
}

class S extends E{
}

const tokens = ['1', "+", "2", "*", "3", "+", "(", "1", "+", "1", ")"];

enum State{
  s = "s",
  t = "s",
  f = "s",
  e = "s",
}

function isNum(num:string) {
  return ['1', "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(num);
}

function isPD(op:string) {
  return ['+', "-"].includes(op);
}

function isCC(op:string) {
  return ['*', "/"].includes(op);
}

function isL(op:string) {
  return ['('].includes(op);
}

function isR(op:string) {
  return [')'].includes(op);
}
let states:any[] = [];
function push(data:any) {
  states.push(data);
}
let state = State.s;

let value = new S;
function eat(token:string) {
  if(state == State.s) {
    if(isNum(token)) {
      value.left = token;


      state = State.t;
      states.push({
        state: State.t,
        value: token
      });
    }else if(isL(token)) {
      states.push({
        state: State.s,
        value: token
      });
    }
  }
  
}
