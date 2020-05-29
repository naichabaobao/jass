
class Token {

  /**
   * 
   */
  private _type: string;
  private _value: string;
  private _line: number;
  private _position: number;

  constructor(type: "keyword" | "operation" | "identifier" | "value" | "other" | "comment", value: string, location?: { line?: number, position?: number }) {
    this._type = type;
    this._value = value;
    this._line = location?.line ?? -1;
    this._position = location?.position ?? -1;
  }

  public get type(): string {
    return this._type;
  }

  public get value(): string {
    return this._value;
  }


  public get line(): number {
    return this._line;
  }


  public get position(): number {
    return this._position;
  }

  public get end_position(): number {
    return this._position + this.value.length;
  }


}

enum LexicalType {
  default = "default",
  id = "id",
  op = "op",
  zero = "zero",
  point = "point",
  dollar = "dollar",
  /**
   * 十六进制
   */
  hex = "hex",
  /**
   * 八进制
   */
  octal = "octal",
  /**
   * 小数
   */
  decimals = "decimals",
  string = "string",
  close_string = "close_string",
  code = "code",
  close_code = "close_code",
  comment = "comment",
  number = "number",
  div = "div",
  /**
   * 感叹号
   */
  exclamation = "exclamation",
  gt = "gt",
  it = "it",
  eq = "eq",
  other = "other"
}

class TokenParser {

  private _content: string;
  public readonly supportJass = true;
  private support_vjass = false;
  private support_zinc = false;
  private support_lua = false;

  private need_type = false;
  private need_native = false;
  private need_globals = true;
  private need_function = true;

  constructor(content: string) {
    this._content = content;
  }

  public get content(): string {
    return this._content;
  }

  /// 配置是否改变
  private _changed: boolean = true;
  private _tokens: Array<Token> = new Array<Token>();
  public tokens(): Array<Token> {
    if (this._content.length > 0) {
      if (this.support_vjass && this.support_zinc && this.support_lua) {

      } else if (this.support_vjass && this.support_zinc) {

      } else if (this.support_vjass && this.support_lua) {

      } else if (this.support_zinc && this.support_lua) {

      } else if (this.support_vjass) {

      } else if (this.support_zinc) {

      } else if (this.support_lua) {

      } else if (this.supportJass) {
        if (this._changed) {
          const tokens: Array<Token> = new Array<Token>();
          let index = 0;
          const content = this._content;
          const getChar = function () {
            return content[index++];
          };
          let value = "";

          let type = LexicalType.default;
          let line = 0;
          let position = 0;
          let char: string;
          while (char = getChar()) {
            value += char;
            /// 开始只能是字母，//,\n,\s
            const clear = function () {
              value = "";
            };
            /// 添加token
            const pushToken = function (tokenType: "keyword" | "operation" | "identifier" | "value" | "other" | "comment") {
              tokens.push(new Token(tokenType, value, {
                line,
                position
              }));
              clear();
              type = LexicalType.default;
            }
            const pushKeywordToken = function () {
              pushToken("keyword");
            }
            const pushOperationToken = function () {
              pushToken("operation");
            }
            const pushIdentifierToken = function () {
              pushToken("identifier");
            }
            const pushValueToken = function () {
              pushToken("value");
            }
            const pushCommentToken = function () {
              pushToken("comment");
            }
            const pushOtherToken = function () {
              pushToken("other");
            }
            
            switch (type) {
              case LexicalType.default:
                if(LexicalTool.isColonSign(char)) {
                  // " 左冒号
                  type = LexicalType.string;
                } else if (LexicalTool.isDivisionSign(char)) {
                  // /
                  type = LexicalType.div;
                } else if(LexicalTool.isSingleQuotesSign(char)) {
                  // ' 左单引号号
                  type = LexicalType.code;
                } else if (LexicalTool.isLetter(char)) {
                  type = LexicalType.id;
                } else if(LexicalTool.isNumber0(char)) {
                  // 0 小数或者十六进制或者八进制
                  type = LexicalType.zero;
                } else if(LexicalTool.isDollarSign(char)) {
                  // $ 十六进制
                  type = LexicalType.dollar;
                } else if (LexicalTool.isPointSign(char)) {
                  // .
                  type = LexicalType.point;
                } else if (LexicalTool.isNumber(char)) {
                  // 1-9
                  type = LexicalType.number;
                } else if (LexicalTool.isDivisionSign(char)) {
                  // /
                  type = LexicalType.div;
                } else if (LexicalTool.isExclamationSign(char)) {
                  // !
                  type = LexicalType.exclamation;
                } else if (LexicalTool.isGtSign(char)) {
                  // >
                  type = LexicalType.gt;
                } else if (LexicalTool.isLtSign(char)) {
                  // <
                  type = LexicalType.it;
                } else if (LexicalTool.isEqualSign(char)) {
                  // =
                  type = LexicalType.eq;
                } else if (LexicalTool.isEqualSign(char)) {
                  // =
                  type = LexicalType.eq;
                } else if (LexicalTool.isLeftBracketSign(char)
                 || LexicalTool.isRightBracketSign(char)
                 || LexicalTool.isLeftSquareBracketSign(char)
                 || LexicalTool.isRightSquareBracketSign(char)
                 || LexicalTool.isCommaSign(char)
                 || LexicalTool.isPlusSign(char)
                 || LexicalTool.isSubtractionSign(char)
                 || LexicalTool.isProductSign(char)
                 || LexicalTool.isNewLine(char)) {
                   // () {} [] ,
                  type = LexicalType.op;
                } else if (LexicalTool.isSpace(char)) {
                  clear();
                } else {
                  type = LexicalType.other;
                }
 
                break;
              case LexicalType.zero:
                if(LexicalTool.isPointSign(char)) { // 小数
                  type = LexicalType.decimals;
                }else if(LexicalTool.isLetterX(char)) { // 十六进制
                  type = LexicalType.hex;
                }else if(LexicalTool.isNumber0_7(char)) { // 八进制
                  type = LexicalType.octal;
                }
                break;
              case LexicalType.dollar:
                if(LexicalTool.isHexNumber(char)) {
                  type = LexicalType.hex;
                }
                break;
              case LexicalType.string:
                // 为"并且前面不是\（转移）
                if(LexicalTool.isColonSign(char) && !value.endsWith("\\")) {
                  type = LexicalType.close_string;
                }
                break;
              case LexicalType.code:
                if(LexicalTool.isSingleQuotesSign(char)) {
                  type = LexicalType.close_code;
                }else if(!(LexicalTool.isLetter(char) || LexicalTool.isNumber(char))) {
                  type = LexicalType.close_code;
                }
                break;
              case LexicalType.point:
                if(LexicalTool.isNumber(char)) {
                  type = LexicalType.decimals;
                }
                break;
              case LexicalType.number:
                if(LexicalTool.isPointSign(char)) {
                  type = LexicalType.decimals;
                }
                break;
              case LexicalType.div:
                if(LexicalTool.isDivisionSign(char)) {
                  type = LexicalType.comment;
                }
                break;
              case LexicalType.exclamation:
                if(LexicalTool.isEqualSign(char)) {
                  type = LexicalType.op;
                }
                break;
              case LexicalType.gt:
                if(LexicalTool.isEqualSign(char)) {
                  type = LexicalType.op;
                }
                break;
              case LexicalType.it:
                if(LexicalTool.isEqualSign(char)) {
                  type = LexicalType.op;
                }
                break;
              case LexicalType.eq:
                if(LexicalTool.isEqualSign(char)) {
                  type = LexicalType.op;
                }
                break;
            }
            /// 判断下个字符是否终结
            const over = () => {
              const nextChar = content.charAt(index);
              switch (type) {
                case LexicalType.default:
                  break;
                case LexicalType.id:
                  if (!(LexicalTool.isLetter(nextChar) || LexicalTool.isNumber(nextChar) || LexicalTool.isUnderlineSign(nextChar))) {
                    if (LexicalTool.isKeyword(value)) { // keyword
                      pushKeywordToken();
                    } else {
                      pushIdentifierToken();
                    }
                  }
                  break;
                case LexicalType.op:
                  pushOperationToken();
                  break;
                case LexicalType.zero:
                  if(!LexicalTool.isNumber0_7(nextChar) 
                  && !LexicalTool.isPointSign(nextChar)
                  && !LexicalTool.isLetterX(nextChar)) {
                    pushValueToken();
                  }
                  break;
                case LexicalType.point:
                  if(!LexicalTool.isNumber(nextChar)) {
                    pushOtherToken();
                  }
                  break;
                case LexicalType.dollar:
                  if(!LexicalTool.isHexNumber(nextChar)) {
                    pushOtherToken();
                  }
                  break;
                case LexicalType.hex:
                  if(!LexicalTool.isHexNumber(nextChar)) {
                    pushValueToken();
                  }
                  break;
                case LexicalType.octal:
                  if(!LexicalTool.isNumber0_7(nextChar)) {
                    pushValueToken();
                  }
                  break;
                case LexicalType.decimals:
                  if(!LexicalTool.isNumber(nextChar)) {
                    pushValueToken();
                  }
                  break;
                case LexicalType.string:
                  if(LexicalTool.isNewLine(nextChar)) {
                    pushOtherToken();
                  }
                  break;
                case LexicalType.close_string:
                  pushValueToken();
                  break;
                case LexicalType.code:
                  if(!(LexicalTool.isNumber(nextChar) || LexicalTool.isLetter(nextChar)) && !LexicalTool.isSingleQuotesSign(nextChar)) {
                    pushOtherToken();
                  }
                  break;
                case LexicalType.close_code:
                  pushValueToken();
                  break;
                case LexicalType.comment:
                  if(!nextChar || LexicalTool.isNewLine(nextChar)) {
                    pushCommentToken();
                  }
                  break;
                case LexicalType.number: // 1-9
                  if(!(LexicalTool.isPointSign(nextChar) || LexicalTool.isNumber(nextChar))) {
                    pushValueToken();
                  }
                  break;
                case LexicalType.div:
                  if(!LexicalTool.isDivisionSign(nextChar)) {
                    pushOperationToken();
                  }
                  break;
                case LexicalType.exclamation: // !
                  if(!LexicalTool.isEqualSign(nextChar)) {
                    pushOtherToken();
                  }
                  break;
                case LexicalType.gt:
                case LexicalType.it:
                case LexicalType.eq:
                  if(!LexicalTool.isEqualSign(nextChar)) {
                    pushOperationToken();
                  }
                  break;
                case LexicalType.other:
                  if(!(LexicalTool.isNewLine(nextChar) || LexicalTool.isSpace(nextChar))) {
                    pushOtherToken();
                  }
                  break;
              }
            }
            over();
            if (LexicalTool.isNewLine(char)) {
              line++;
              position = 0;
            } else {
              position++;
            }
          }
          this._tokens = tokens;
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

  public get supportVjass(): boolean {
    return this.support_vjass;
  }

  public set supportVjass(isSupportVjass: boolean) {
    if (this.support_vjass !== isSupportVjass) {
      this._change();
      this.support_vjass = isSupportVjass;
    }
  }

  public get supportZinc(): boolean {
    return this.support_zinc;
  }

  public set supportZinc(isSupportZinc: boolean) {
    if (this.support_zinc !== isSupportZinc) {
      this._change();
      this.support_zinc = isSupportZinc;
    }
  }

  public get supportLua(): boolean {
    return this.support_lua;
  }

  public set supportLua(isSupportLua: boolean) {
    if (this.support_lua !== isSupportLua) {
      this._change();
      this.support_lua = isSupportLua;
    }
  }

}

class LexicalTool {

  private static isChar(char: string): boolean {
    return char.length === 1;
  };

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isLetter(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 || code >= 97 && code <= 122;
    })();
  }

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isLowerLetter(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code >= 97 && code <= 122;
    })();
  }

  /**
  A~Z ：65~90
  a~z ：97~122
  */
  public static isUpperLetter(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90;
    })();
  }

  /**
  X ：88
  x ：120
  */
  public static isLetterX(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code === 88 || code === 120;
    })();
  }

  /**
  0～9 : 48～57
  */
  public static isNumber(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code >= 48 && code <= 57;
    })();
  }

  /**
  0～9 : 48～57
  a～f : 97～102
  A～F : 65～70
  */
  public static isHexNumber(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return (code >= 48 && code <= 57) || (code >= 97 && code <= 102) || (code >= 65 && code <= 70);
    })();
  }

  /**
  0～7 : 48～55
  */
  public static isNumber0_7(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code >= 48 && code <= 55;
    })();
  }

  /**
  0 : 48
  */
  public static isNumber0(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 48;
  }

  /**
  / : 47
  */
  public static isLeftForwardSlash(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 47;
  }

  /**
  \ : 92
  */
  public static isRightForwardSlash(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 92;
  }

  /**
  = : 61
  */
  public static isEqualSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 61;
  }

  /**
  + : 43
  */
  public static isPlusSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 43;
  }

  /**
  \- : 45
  */
  public static isSubtractionSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 45;
  }


  /**
  \* : 42
  */
  public static isProductSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 42;
  }

  /**
  / : 47
  */
  public static isDivisionSign(char: string) {
    return this.isChar(char) && this.isLeftForwardSlash(char);
  }

  /**
  " : 34
  */
  public static isColonSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 34;
  }

  /**
  ' : 39
  */
  public static isSingleQuotesSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 39;
  }

  /**
  ( : 40
  */
  public static isLeftBracketSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 40;
  }

  /**
  ) : 41
  */
  public static isRightBracketSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 41;
  }

  /**
  { : 123
  */
  public static isLeftBraceSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 123;
  }

  /**
  } : 125
  */
  public static isRightBraceSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 125;
  }

  /**
  [ : 91
  */
  public static isLeftSquareBracketSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 91;
  }

  /**
  ] : 93
  */
  public static isRightSquareBracketSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 93;
  }

  /**
  , : 44
  */
  public static isCommaSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 44;
  }

  /**
  _ : 95
  */
  public static isUnderlineSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 95;
  }

  /**
  $ : 36
  */
  public static isDollarSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 36;
  }

  /**
  . : 46
  */
  public static isPointSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 46;
  }

  /**
  ! : 33
  */
  public static isExclamationSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 33;
  }

  /**
  > : 62
  */
  public static isGtSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 62;
  }

  /**
  < : 60
  */
  public static isLtSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 60;
  }

  /**
  ; : 59
  */
  public static isSemicolonSign(char: string) {
    return this.isChar(char) && char.charCodeAt(0) === 59;
  }

  /**
  \n : 10
  \r : 13
  */
  public static isNewLine(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code === 10 || code === 13;
    })()
      ||
      char.length == 2 && char.charCodeAt(0) === 13 && char.charCodeAt(1) === 10;
  }

  /**
    : 32
  \t : 9
  */
  public static isSpace(char: string) {
    return this.isChar(char) && (function (): boolean {
      const code = char.charCodeAt(0);
      return code === 32 || code === 9;
    })();
  }

  public static readonly keywords = [
    "native",
    "function",
    "takes",
    "returns",
    "return",
    "endfunction",
    "globals",
    "endglobals",
    "if",
    "then",
    "else",
    "elseif",
    "endif",
    "loop",
    "exitwhen",
    "endloop",
    "local",
    "constant",
    "array",
    "set",
    "call",
    "type",
    "extends",
    "true",
    "false",
    "null",
    "nothing",
    "integer",
    "real",
    "boolean",
    "string",
    "handle",
    "code",
    "and",
    "or",
    "not",
    "debug"
  ];

  public static isKeyword(id:string) {
    return this.keywords.includes(id);
  }

  public static isNotKeyword(id:string) {
    return !this.keywords.includes(id);
  }

}

// const parserData = new TokenParser(`real      bj_RADTODEG                      = 180.0/bj_PI
// constant real      bj_DEGTORAD                      = bj_PI/180.0`);

// console.log(parserData.tokens());


export {
  Token,
  TokenParser,
  LexicalType,
  LexicalTool
}

