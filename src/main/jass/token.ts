
class Token {

  /**
   * 
   */
  private _type:string;
  private _value:string;
  private _line:number;
  private _position:number;

  constructor(type:"keyword"|"operation"|"identifier"|"value", value:string, location?:any) {
    this._type = type;
    this._value = value;
    this._line = location?.line ?? -1;
    this._position = location?.position ?? -1;
  }

  public get type() : string {
    return this._type;
  }
  
  public get value() : string {
    return this._value;
  }

  
  public get line() : number {
    return this._line;
  }
  
  
  public get position() : number {
    return this._position;
  }
  
  public get end_position() : number {
    return this._position + this.value.length;
  }
  

}

class TokenParser {

  private _content:string;
  public readonly supportJass = true;
  private support_vjass = false;
  private support_zinc = false;
  private support_lua = false;

  private need_type = false;
  private need_native = false;
  private need_globals = true;
  private need_function = true;

  constructor(content:string) {
    this._content = content;
  }

  public get content() : string {
    return this._content;
  }

  /// 配置是否改变
  private _changed:boolean = true;
  private _tokens:Array<Token> = new Array<Token>();
  public tokens():Array<Token> {
    if(this._content.length > 0) {
      if(this.support_vjass && this.support_zinc && this.support_lua) {

      }else if(this.support_vjass && this.support_zinc) {

      }else if(this.support_vjass && this.support_lua) {

      }else if(this.support_zinc && this.support_lua) {

      }else if(this.support_vjass) {

      }else if(this.support_zinc) {

      }else if(this.support_lua) {

      }else if(this.supportJass) {
        if(this._changed) {
          let index = 0;
          const content = this._content;
          if(TokenTool.isLetter(content[index])) {
            
          }else if(TokenTool.isNumber(content[index])) {
            
          }
          this._changed = false;
        }
      }
      return this._tokens;
    }
    return [];
  }

  /// 设置已改变状态
  private _change() {
    this._changed = true;
  }

  public get supportVjass():boolean {
    return this.support_vjass;
  }

  public set supportVjass(isSupportVjass : boolean) {
    if(this.support_vjass !== isSupportVjass) {
      this._change();
      this.support_vjass = isSupportVjass;
    }
  }
  
  public get supportZinc():boolean {
    return this.support_zinc;
  }

  public set supportZinc(isSupportZinc : boolean) {
    if(this.support_zinc !== isSupportZinc) {
      this._change();
      this.support_zinc = isSupportZinc;
    }
  }

  public get supportLua():boolean {
    return this.support_lua;
  }

  public set supportLua(isSupportLua : boolean) {
    if(this.support_lua !== isSupportLua) {
      this._change();
      this.support_lua = isSupportLua;
    }
  }

}

class TokenTool {

  private static isChar(char:string):boolean {
    return char.length === 1;
  };

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isLetter (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 || code >= 97 && code <= 122;
    })();
  }

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isLowerLetter (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code >= 97 && code <= 122;
    })();
  }

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isUpperLetter (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90;
    })();
  }

  /**
  X ：88
  x ：120
  */
  public static isLetterX (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code === 88 || code === 120;
    })();
  }

  /**
  0～9 : 48～57
  */
  public static isNumber (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code >= 48 && code <= 57;
    })();
  }

  /**
  0～7 : 48～55
  */
  public static isNumber0_7 (char:string) {
    return this.isChar(char) && (function ():boolean {
      const code = char.charCodeAt(0);
      return code >= 48 && code <= 55;
    })();
  }
  
  /**
  0 : 48
  */
  public static isNumber0 (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 48;
  }
    
  /**
  / : 47
  */
  public static isLeftForwardSlash (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 47;
  }
      
  /**
  \ : 92
  */
  public static isRightForwardSlash (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 92;
  }
      
  /**
  = : 61
  */
  public static isEqualSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 61;
  }
      
  /**
  + : 43
  */
  public static isPlusSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 43;
  }
      
  /**
  - : 45
  */
  public static isSubtractionSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 45;
  }
      
    
  public static isProductSign (char:string) {
  /**
  * : 42
  */
  return this.isChar(char) && char.charCodeAt(0) === 42;
  }

  /**
  / : 47
  */
  public static isDivisionSign (char:string) {
    return this.isChar(char) && this.isLeftForwardSlash(char);
  }

  /**
  " : 34
  */
  public static isColonSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 34;
  }

  /**
  ' : 39
  */
  public static isSingleQuotesSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 39;
  }

  /**
  ( : 40
  */
  public static isLeftBracketSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 40;
  }

  /**
  ) : 41
  */
  public static isRightBracketSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 41;
  }

  /**
  { : 123
  */
  public static isLeftBraceSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 123;
  }

  /**
  } : 125
  */
  public static isRightBraceSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 125;
  }

  /**
  [ : 91
  */
  public static isLeftSquareBracketSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 91;
  }

  /**
  ] : 93
  */
  public static isRightSquareBracketSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 93;
  }

  /**
  , : 44
  */
  public static isCommaSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 44;
  }

  /**
  _ : 95
  */
  public static isUnderlineSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 95;
  }

  /**
  _ : 36
  */
  public static isDollarSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 36;
  }

  /**
  ! : 33
  */
  public static isExclamationSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 33;
  }

  /**
  > : 62
  */
  public static isGtSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 62;
  }

  /**
  < : 60
  */
  public static isItSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 60;
  }

  /**
  ; : 59
  */
  public static isSemicolonSign (char:string) {
    return this.isChar(char) && char.charCodeAt(0) === 59;
  }



}

