/*
語法解析
*/

import {Token,TokenParser, LexicalTool} from './token';
import { j } from '../constant';

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
  private static readonly baseTypes = ["boolean", "integer", "real", "string", "code", "handle"];
  private static readonly booleanType = new Type(Type.baseTypes[0]);
  private static readonly integerType = new Type(Type.baseTypes[1]);
  private static readonly realType = new Type(Type.baseTypes[2]);
  private static readonly stringType = new Type(Type.baseTypes[3]);
  private static readonly codeType = new Type(Type.baseTypes[4]);
  private static readonly handleType = new Type(Type.baseTypes[5]);
  private static _types:Map<string,Type> = new Map<string,Type>([
    ["boolean", Type.booleanType],
    ["integer", Type.integerType],
    ["real", Type.realType],
    ["string", Type.stringType],
    // 對象樹中允許local code name的寫法，後面通過預編譯禁止；
    ["code", Type.codeType],
    ["handle", Type.handleType]
  ]);

  private readonly name:string;
  protected readonly extend:Type = Type.handleType;

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
  
  public static isBaseType = (name:string) => {
    return Type.baseTypes.includes(name);
  };

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

class Jass extends Array<Type|Globals|Comment|Native|Function>{
  private _fileName:string = "";
  public readonly error_tokens:Array<Token> = [];

  constructor(fileName?:string) {
    super();
    if(fileName) this._fileName = fileName;
  }

  public clear = () => {
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
    // console.log(this.tokens)
    if(this._change) {
      this.tree.clear();
      let index = 0;
      const getToken = ():Token|undefined => {
        return this.tokens[index++];
      };
      const withs = function(token:Token, any:Statement) {
        any.range.with(token.line, token.position, token.line, token.end_position);
      }
      const nothing = () => {
        const token = getToken();
        const type = () => {
          console.log("進入type");
          if(token) {
            let tokenName = getToken();
            console.log(tokenName);
            if(tokenName && tokenName.type == "identifier") {
              const name = tokenName.value;
              const tokenExtends = getToken();
              console.log(tokenExtends);
              if(tokenExtends && tokenExtends.type == "keyword" && tokenExtends.value == "extends") {
                const tokenExtendsTypeToken = getToken();
                console.log(tokenExtendsTypeToken);
                if(tokenExtendsTypeToken && (tokenExtendsTypeToken.type == "identifier" || (tokenExtendsTypeToken.type == "keyword" && Type.isBaseType(tokenExtendsTypeToken.value)))) {
                  const extend = tokenExtendsTypeToken.value;
                  const type = Type.builder(name,Type.get(extend));
                  console.log(type);
                  type.range.with(token.line,token.position,tokenExtendsTypeToken.line, tokenExtendsTypeToken.end_position);
                  this.tree.push(type);
                }
              }
            }
            nothing();
          }
        }
        const native = (flag?:"constant") => {
          if(token) {
            let nameToken = getToken();
            if(nameToken && nameToken.type == "identifier") {
              const name = nameToken.value;
              const takesToken = getToken();
              if(takesToken && takesToken.type == "keyword" && takesToken.value == "takes") {
                let nothingTakes = new Nothing;
                let takes:Takes = new Takes;
                let isNothing = true;
                const take = () => {
                  const typeToken = getToken();
                  if(typeToken && (typeToken.type == "identifier" || (typeToken.type == "keyword" && Type.isBaseType(typeToken.value)))) {
                    if(isNothing) {
                      isNothing = false;
                    }
                    const type = typeToken.value;
                    const takeNameToken = getToken();
                    if(takeNameToken && takeNameToken.type == "identifier") {
                      const name = takeNameToken.value;
                      const takeType = Type.get(type);
                      console.log(takeType)
                      if(takeType) {
                        const t = new Take(takeType, name);
                        t.range.with(typeToken.line, typeToken.position,takeNameToken.line, takeNameToken.end_position);
                        takes.push(t);
                        const splitToken = getToken();
                        if(splitToken && splitToken.type == "operation" && splitToken.value == ",") {
                          take();
                        }
                      }
                    }
                  }else if(isNothing && typeToken && typeToken.type == "keyword" && typeToken.value == "nothing") {
                    nothingTakes = new Nothing();
                    takes.range.with(typeToken.line,typeToken.position,typeToken.line, typeToken.end_position);                 
                  }
                };
                take();

                let returnsType:Type|Nothing = new Nothing;
                let returnsTypeToken:Token|undefined;
                const returns = () => {
                  const returnsToken = getToken();
                  if(returnsToken && returnsToken.type == "keyword" && returnsToken.value == "returns") {
                    returnsTypeToken = getToken();
                    if(returnsTypeToken && (returnsTypeToken.type == "identifier" || (returnsTypeToken.type == "keyword" && Type.isBaseType(returnsTypeToken.value)))) {
                      const type = returnsTypeToken.value;
                      const returnType = Type.get(type);
                      if(returnType) {
                        returnsType = returnType;
                      }
                    }else if(returnsTypeToken && returnsTypeToken.type == "keyword" && returnsTypeToken.value == "nothing") {
                      returnsType = new Nothing();
                    }
                  }
                };
                returns();
                const func = new Native(name, isNothing ? nothingTakes :takes, returnsType, flag);
                if(returnsTypeToken) {
                  func.range.with(token.line, token.position, returnsTypeToken.line, returnsTypeToken.end_position);
                }else{
                  func.range.with(token.line, token.position, token.line, token.position);
                }
                this.tree.push(func);
              }
            }
            nothing();
          }
        };
        const constantNative = () => {
          const constantToken = getToken();
          if(constantToken && constantToken.type == "keyword" && constantToken.value == "native") {
            native("constant");
          }else{
            nothing();
          }
        };
        const globals = () => {
          enum GlobalState {

          }
          if(token) {
            const globals = new Globals();
            const globalParse = () => {
              const nextToken = getToken();
              if(nextToken) {
                const parseGlobal = (flag?:"constant") => {

                };
                if(nextToken.type == "keyword") {
                  if(nextToken.value == "endglobals") {
                    this.tree.push(globals);
                  }else if(nextToken.value == "constant") {
                    // 常量
                    const typeToken = getToken();
                    if(typeToken && typeToken.type == "identifier") {
                      parseGlobal();
                    }
                  }
                }
                else if(nextToken.type == "comment") {
                  const comment =new Comment(nextToken.value);
                  comment.range.with(nextToken.line, nextToken.position, nextToken.line, nextToken.end_position);
                  globals.push(comment);
                }else if(nextToken.type == "identifier") {
                  parseGlobal();
                }
              }
              globalParse();
            };
            globalParse();
            nothing();
          }
        };
        if(token) {
          if(token.type == "comment") {
            const comment =new Comment(token.value);
            withs(token, comment);
            this.tree.push(comment);
          }else if(token.type == "keyword") {
            if(token.value == "type") {
              type();
            }else if(token.value == "native") {
              native();
            }else if(token.value == "constant") {
              constantNative();
            }else if(token.value == "globals") {
              globals();
            }
            else if(token.value == "function") {
  
            }else{
              nothing();
            }
          }else{
            nothing();
          }
        }
        
      };
      nothing();
      this._change = false;
    }
    return this.tree;
  }

  public ast2 = () => {
    enum BlockType {
      default = "default",
      comment = "comment",
      type = "type",
      native = "native",
      globals = "globals",
      function = "function"
    }
    let blockType = BlockType.default;
    enum TypeType {
      default = "default",
      type = "type",
      namming = "namming",
      extends = "extends",
      extends_type = "extends_type"
    }
    let typeType = TypeType.default;
    enum NativeType {
      default = "default",
      constant = "constant",
      native = "native",
      namming = "namming",
      takes = "takes",
      take_type = "take_type",
      take_namming = "take_namming",
      take_separator = "take_separator",
      returns = "returns",
      returns_type = "returns_type"
    }
    let nativeType = NativeType.default;
    enum GlobalsType {
      default = "default",
      globals = "globals",
      endglobals = "endglobals"
    }
    let globalsType = GlobalsType.default;
    enum GlobalType {
      default = "default",
      constant = "constant",
      type = "type",
      namming = "namming",
      array = "array",
      op_assignment = "op_assignment",
      value = "value"
    }
    enum FunctionType {
      default = "default",
      function = "function",
      namming = "namming",
      takes = "takes",
      take_type = "take_type",
      take_namming = "take_namming",
      take_separator = "take_separator",
      returns = "returns",
      returns_type = "returns_type",
      endfunction = "endfunction"
    }
    let functionType = FunctionType.default;
    enum ValueType {
      default = "default",
      // 因子
      value = "value",
      op = "op",
      factor = "factor"
    }
    let valueType = ValueType.default;
    const tokens = this.tokens;
    for (let index = 0; index < tokens.length;) {
      const token = tokens[index++];
      const nextToken:Token|undefined = tokens[index];
      if(token.type == "comment") {

      }else if(token.type == "comment") {

      }

    }
  };

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

const sp = new SyntexParser(`
type aaa extends handle

native woccao takes string a66, aaa wozuonima returns nothing
constant native woccao1 takes string nothing returns laji

`);
const jass = sp.ast1();
console.log("=========================================================")
console.log(jass.filter(j => j instanceof Native).map(j => {
  if(j instanceof Native) {
    return j.takes;
  }
  return [];
}));
