/*
語法解析
*/

import {Token,TokenParser} from './token';

interface Expression {

}

class Comment implements Expression{

  public readonly origin:string;

  constructor(comment:string) {
    this.origin = comment;
  }

  public get content() : string {
    return /\/\/\s*(?<content>.+)\s*/.exec(this.origin)?.groups?.content ?? "";
  }
  
}

class Type implements Expression{
  private static _types:Set<Type> = new Set<Type>();

  private _name:string;
  protected _extend:Type;

  private constructor (name:string, extend:Type = new Handle()) {
    this._name = name;
    this._extend = extend;
  }

  public get name(): string {
    return this._name;
  }
  
  public get extend(): Type {
    return this._extend;
  }

  public static builder(name:string, extend?:Type) {
    const values = this._types.values();
    let it;
    while(it = values.next()) {
      const type:Type = it.value;
      if(type.name === name) {
        return type;
      }
    }
    const type = new Type(name, extend);
    this._types.add(type);
    return type;
  }
  
}

class Boolean extends Type {
  public readonly _extend = this;
  constructor() {
    super("boolean");
  }
}
class Integer extends Type {
  public readonly _extend = this;
  constructor() {
    super("integer");
  }
}
class Real extends Type {
  public readonly _extend = this;
  constructor() {
    super("real");
  }
}
class String extends Type {
  public readonly _extend = this;
  constructor() {
    super("string");
  }
}
class Code extends Type {
  public readonly _extend = this;
  constructor() {
    super("code");
  }
}
class Handle extends Type {
  public readonly _extend = this;
  constructor() {
    super("handle");
  }
}

interface StatementInterface {
  readonly type:Type;
  readonly name:string;
  /// 非jass標準語法，無視這個字段在當前文件的所有實現，此項僅爲保留項，為後續vjass鋪墊
  flag:"constant"|"local"|null;
}

class Global implements StatementInterface,Expression{
  public readonly type: Type;
  public readonly name: string;
  public readonly flag:"constant"|null;

  constructor (type:Type,name:string,flag:"constant"|null = null) {
    this.type = type;
    this.name = name;
    this.flag = flag;
  }

}


class Globals extends Array<Global|Comment> implements Expression{}

class Jass extends Array<Type|Global>{
  private _fileName:string = "";

  constructor(fileName?:string) {
    super();
    if(fileName) this._fileName = fileName;
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

  private tree:Jass = new Jass();
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
      // "keyword" | "operation" | "identifier" | "value" | "other" | "comment"
      const eat_type = (token:Token, nextToken:Token = this.tokens[index + 1]) => {
        // type = SyntexEnum.type;
        if(token.type == identifier) {
          const name = token.value;
          const extendToken = getToken();
          if(extendToken.type == keyword) {
            if(extendToken.value == "extends") {
              const extendTypeToken = getToken();
              if(extendTypeToken.type == identifier) {
                const extendType = extendTypeToken.value;
                /// type類需要修改為單例模式
                new Type(name, new Type(extendType));
              }
            }
          }
        }else {
          type = SyntexEnum.other;
          eat(getToken());
        }
      };
      const eat = (token:Token, nextToken:Token = this.tokens[index + 1]) => {
        switch(type) {
          case SyntexEnum.default:
            if(token.type == keyword) {
              if(token.value == "type") {
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