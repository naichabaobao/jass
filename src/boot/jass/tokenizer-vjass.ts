
import { Document, Position, Token, TokenHandleResult, TokenType, tokenize } from "./tokenizer-common";


function symbol_state(char: string): number {
    let id = 0x00000000;
    for (let index = 0; index < char.length; index++) {
      const new_id = char.charCodeAt(index);
      // id &= new_id;
      id += new_id;
    }
    return id;
  }

// export class TokenType extends TokenType {
//     static BlockComment = "BlockComment";
// };

// class VjassToken extends Token {
//     // public type: TokenType;

//     public constructor(context: Context, line: number, character: number, position: number, length: number, type: string, is_complete: boolean = true) {
//         super(context, line, character, position, length, type, is_complete);


//     }


    
// }

class StateType {
    public static Nil: number = symbol_state("");
    public static Div: number = symbol_state("/");
    public static Comment: number = symbol_state("//");
    public static String: number = symbol_state("\"");
    public static StringConvert: number = symbol_state("\"\\");
    public static Gt: number = symbol_state(">");
    public static It: number = symbol_state("<");
    public static Eq: number = symbol_state("=");
    public static Not: number = symbol_state("!");
    public static Mark: number = symbol_state("'");
    public static Number0: number = symbol_state("0");
    public static Number: number = symbol_state("1");
    public static Id: number = symbol_state("ID");
    public static Unkown: number = symbol_state("?");
    public static Real: number = symbol_state(".");
    public static $: number = symbol_state("$");
    public static BlockComment: number = symbol_state("/*");
    public static BlockCommentPre: number = symbol_state("/**");
    public static BlockCommentEnd: number = symbol_state("/**/");
    // public static Bracket: number = symbol_state("[]");
    // public static BracketEq: number = symbol_state("[]=");
    public static ZincReturns: number = symbol_state("->");
    public static SubAsignment: number = symbol_state("-=");
    public static AddAsignment: number = symbol_state("+=");
    public static MulAsignment: number = symbol_state("*=");
    public static DivAsignment: number = symbol_state("/=");
}
export function token_handle(document:Document, line: number, character: number, position: number, char: string, next_char: string, state: number, length: number): TokenHandleResult | undefined {
    const has_next = () => {
        return !!next_char;
    };
    const is_match = (...cs: string[]) => {
        for (let index = 0; index < cs.length; index++) {
            const c = cs[index];
            if (c == next_char) {
                return true;
            }
        }
        return false;
    };
    const new_token = (type: string, is_complete: boolean = true) => {
        if (type == TokenType.BlockComment) {
            const token = new Token(document, line, character - length, position - length, length + 1, type, is_complete);
            token.start = new Position();
            token.end = new Position();
            return token;
        }
        return new Token(document, line, character - length, position - length, length + 1, type, is_complete);
    };
    switch (state) {
        case StateType.Nil:
            if (char == "/") { // 非空白
                if (is_match("/", "*")) {
                    return {
                        state: StateType.Div,
                        length: 1
                    }
                } else if (next_char == "=") {
                    return {
                        state: StateType.DivAsignment,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "\"") {
                if (!has_next() || is_match("\n")) {
                    return {
                        token: new_token(TokenType.String, false),
                        length: 0
                    }
                } else {
                    return {
                        state: StateType.String,
                        length: 1
                    }
                }
            } else if (char == "'") {
                if (!has_next() || is_match("\n")) {
                    return {
                        token: new_token(TokenType.Mark, false),
                        length: 0
                    }
                } else {
                    return {
                        state: StateType.Mark,
                        length: 1
                    }
                }
            } else if (/\d/.test(char)) {
                if (char == "0" && is_match("x")) {
                    return {
                        state: StateType.Number0,
                        length: 1
                    }
                } else if (/\d/.test(next_char)) {
                    return {
                        state: StateType.Number,
                        length: 1
                    }
                } else if (/[a-zA-Z_$]/.test(next_char)) {
                    return {
                        state: StateType.Id,
                        length: 1
                    }
                } else if (is_match(".")) {
                    return {
                        state: StateType.Real,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Integer),
                        length: 0
                    }
                }
            } else if (char == "$") {
                if (/[a-fA-F0-9]/.test(next_char)) {
                    return {
                        state: StateType.$,
                        length: 1
                    }
                } else if (/[g-zF-Z_$]/.test(next_char)) {
                    return {
                        state: StateType.Id,
                        length: 1
                    }
                } else if (/\S/.test(next_char)) {
                    return {
                        state: StateType.Unkown,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Unkown),
                        length: 0
                    }
                }
            } else if (/[a-zA-Z_$]/.test(char)) {
                if (/[a-zA-Z0-9_$]/.test(next_char)) {
                    return {
                        state: StateType.Id,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Identifier),
                        length: 0
                    }
                }
            } else if (char == ">") {
                if (is_match("=")) {
                    return {
                        state: StateType.Gt,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "<") {
                if (is_match("=")) {
                    return {
                        state: StateType.It,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "=") {
                if (is_match("=")) {
                    return {
                        state: StateType.Eq,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "!") {
                if (is_match("=")) {
                    return {
                        state: StateType.Not,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Unkown),
                        length: 0
                    }
                }
            } else if (char == "[") {
                // if (is_match("]")) {
                //     return {
                //         state: StateType.Bracket,
                //         length: 1
                //     }
                // } else {
                //     return {
                //         token: new_token(TokenType.Operator),
                //         length: 0
                //     }
                // }
                return {
                    token: new_token(TokenType.Operator),
                    length: 0
                };
            } else if (char == "+") {
                if (next_char == "=") {
                    return {
                        state: StateType.AddAsignment,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "-") {
                if (next_char == ">") {
                    return {
                        state: StateType.ZincReturns,
                        length: 1
                    }
                } else if (next_char == "=") {
                    return {
                        state: StateType.SubAsignment,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "*") {
                if (next_char == "=") {
                    return {
                        state: StateType.MulAsignment,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (char == "(" || char == ")" || char == "]" || char == "," || char == "+" || char == "*" || char == "%" || char == "{" || char == "}" || char == ";") {
                return {
                    token: new_token(TokenType.Operator),
                    length: 0
                }
            } else if (char == ".") {
                if (/\d/.test(next_char)) {
                    return {
                        state: StateType.Real,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Operator),
                        length: 0
                    }
                }
            } else if (/\S/.test(char)) {
                if (/\S/.test(next_char)) {
                    return {
                        state: StateType.Unkown,
                        length: 1
                    }
                } else {
                    return {
                        token: new_token(TokenType.Unkown),
                        length: 0
                    }
                }
            }
            break;
        case StateType.Div:
            if (char == "/") {
                if (is_match("\n")) {
                    return {
                        token: new_token(TokenType.Conment),
                        state: StateType.Nil,
                        length: 0
                    }
                } else if (!has_next()) {
                    return {
                        token: new_token(TokenType.Conment),
                        state: StateType.Nil,
                        length: 0
                    }
                } else {
                    return {
                        state: StateType.Comment,
                        length: 2
                    }
                }
            } else { // /*
                if (!has_next()) {
                    return {
                        token: new_token(TokenType.BlockComment, false),
                        state: StateType.Nil,
                        length: 0
                    }
                } else {
                    return {
                        state: StateType.BlockComment,
                        length: length + 1
                    }
                }
            }
            break;
        case StateType.Comment:
            if (is_match("\n")) {
                return {
                    token: new_token(TokenType.Conment),
                    state: StateType.Nil,
                    length: 0
                }
            } else if (has_next()) {
                return {
                    length: length + 1
                }
            } else {
                return {
                    token: new_token(TokenType.Conment),
                    state: StateType.Nil,
                    length: 0
                }
            }
            break;
        case StateType.String:
            if (char == "\"") {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.String),
                    length: 0
                }
            } else if (char == "\\") {
                return {
                    state: StateType.StringConvert,
                    length: length + 1
                }
            } else if (!has_next() || is_match("\n")) {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.String, false),
                    length: 0
                }
            } else {
                return {
                    length: length + 1
                }
            }
            break;
        case StateType.StringConvert:
            if (!has_next() || is_match("\n")) {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.String, false),
                    length: 0
                }
            } else {
                return {
                    state: StateType.String,
                    length: length + 1
                }
            }
            break;
        case StateType.Gt:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.It:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.Eq:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.ZincReturns:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.SubAsignment:
        case StateType.AddAsignment:
        case StateType.MulAsignment:
        case StateType.DivAsignment:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.Not:
            return {
                state: StateType.Nil,
                token: new_token(TokenType.Operator),
                length: 0
            }
            break;
        case StateType.Mark:
            if (char == "\'") {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Mark, length > 1),
                    length: 0
                }
            } else if (!has_next() || is_match("\n")) {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Mark, false),
                    length: 0
                }
            } else {
                return {
                    length: length + 1
                }
            }
            break;
        case StateType.Number0: // 0x
            if (/[\da-fA-F]/.test(next_char)) {
                return {
                    state: StateType.Number,
                    length: length + 1
                }
            } else if (/[g-zG-Z_$]/.test(next_char)) {
                return {
                    state: StateType.Id,
                    length: length + 1
                }
            } else if (is_match(".")) {
                return {
                    state: StateType.Real,
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Integer, false),
                    length: 0
                }
            }
            break;
        case StateType.Number: //
            if (/\d/.test(next_char)) {
                return {
                    length: length + 1
                }
            } else if (/[a-zA-Z_$]/.test(next_char)) {
                return {
                    state: StateType.Id,
                    length: length + 1
                }
            } else if (is_match(".")) {
                return {
                    state: StateType.Real,
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Integer),
                    length: 0
                }
            }
            break;
        case StateType.Id:
            if (/[a-zA-Z0-9_$]/.test(next_char)) {
                return {
                    length: length + 1
                }
            }
            // else if (/\S/.test(next_char)) {
            //   return {
            //     state: StateTypeDefine.Unkown,
            //     length: length + 1
            //   }
            // } 
            else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Identifier),
                    length: 0
                }
            }
            break;
        case StateType.Unkown:
            if (/\S/.test(next_char)) {
                return {
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Unkown),
                    length: 0
                }
            }
            break;
        case StateType.Real: // .
            if (/\d/.test(next_char)) {
                return {
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Real),
                    length: 0
                }
            }
            break;
        case StateType.$:
            if (/[\da-fA-F]/.test(next_char)) {
                return {
                    state: StateType.Number,
                    length: length + 1
                }
            } else if (/[\dg-zG-Z_$]/.test(next_char)) {
                return {
                    state: StateType.Id,
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.Nil,
                    token: new_token(TokenType.Integer),
                    length: 0
                }
            }
            break;
        case StateType.BlockComment:
            if (!has_next()) {
                return {
                    token: new_token(TokenType.BlockComment, false),
                    state: StateType.Nil,
                    length: 0
                }
            } else if (char == "*") {
                return {
                    state: StateType.BlockCommentPre,
                    length: length + 1
                }
            } else {
                return {
                    length: length + 1
                }
            }
            break;
        case StateType.BlockCommentPre:
            if (!has_next()) {
                return {
                    token: new_token(TokenType.BlockComment, false),
                    state: StateType.Nil,
                    length: 0
                }
            } else if (char == "*") {
                return {
                    length: length + 1
                }
            } else if (char == "/") {
                return {
                    state: StateType.BlockCommentEnd,
                    length: length + 1
                }
            } else {
                return {
                    state: StateType.BlockComment,
                    length: length + 1
                }
            }
            break;
        case StateType.BlockCommentEnd:
            return {
                token: new_token(TokenType.BlockComment),
                state: StateType.Nil,
                length: 0
            }
            break;
        // case StateType.Bracket:
        //     if (is_match("=")) {
        //         return {
        //             state: StateType.BracketEq,
        //             length: length + 1
        //         }
        //     } else {
        //         return {
        //             token: new_token(TokenType.Operator),
        //             state: StateType.Nil,
        //             length: 0
        //         }
        //     }
        // case StateType.BracketEq:
        //     return {
        //         token: new_token(TokenType.Operator),
        //         state: StateType.Nil,
        //         length: 0
        //     }

        //     break;

        default:
            return undefined
    }
}
// export function tokenize_for_vjass(content: string) {
//     const document = new Document(content);
//     const context = new Context(document);
//     let line:number = 0;;
//     let character:number = 0;
//     let state: number = symbol_state("");
//     let length: number = 0;
//     const tokens:Token[] = [];
//     // @ts-expect-error
//     document.line_points.push({
//       line: 0,
//       position: 0,
//       index: tokens.length
//     });
//     for (let index = 0; index < content.length; index++) {
//       const char = content.charAt(index);
//       const next_char = content.charAt(index + 1);
//       const new_state = token_handle(context, line, character, index, char, next_char, state, length);
  
  
//       // substate = new_state.substate;
//       if (char == "\n") {
//         line++;
//         character = 0;
  
//         // @ts-expect-error
//         document.line_points.push({
//           line,
//           position: index + 1,
//           index: tokens.length
//         });
//       } else {
//         character++;
//       }
  
//       if (new_state?.state !== undefined) {
//         state = new_state.state;
//       }
//       if (new_state?.length !== undefined) {
//         length = new_state.length;
//       }
//       if (new_state?.token) {
//         tokens.push(new_state.token);
//       }
//     }
//     // @ts-expect-error
//     document.tokens = tokens;
//     // @ts-expect-error
//     document.lineCount = line + 1;
//     return document;
//   }

export function tokenize_for_vjass(document:Document) {
    return tokenize(document, token_handle);
  }
export function tokenize_for_vjass_by_content(content: string) {
    return tokenize(new Document("", content), token_handle).tokens;
  }


