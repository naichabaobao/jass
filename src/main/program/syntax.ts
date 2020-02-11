import { lexicalAnalyzer, Token, TokenType } from "./token";

/**
 * 语法分析
 */
function syntaxAnalyzer(tokens: Array<Token>) {
  tokens.push(new Token(TokenType.Eof, ""));
  const program = new Program();

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    switch (token.type) {
      // 关键字 
      case TokenType.Native:
      case TokenType.Function:
      case TokenType.Takes:
      case TokenType.Returns:
      case TokenType.Return:
      case TokenType.EndFunction:
      case TokenType.Globals:
      case TokenType.EndGlobals:
      case TokenType.If:
      case TokenType.Then:
      case TokenType.Else:
      case TokenType.Elseif:
      case TokenType.EndIf:
      case TokenType.Loop:
      case TokenType.Exitwhen:
      case TokenType.EndLoop:
      case TokenType.Local:
      case TokenType.Constant:
      case TokenType.Array:
      case TokenType.Set:
      case TokenType.Call:
      case TokenType.Type:
      case TokenType.Extends:
      case TokenType.True:
      case TokenType.False:
      case TokenType.Null:
      case TokenType.Nothing:
      case TokenType.Integer:
      case TokenType.Real:
      case TokenType.Boolean:
      case TokenType.String:
      case TokenType.Handle:
      case TokenType.Code:
      case TokenType.And:
      case TokenType.Or:
      case TokenType.Not:
      case TokenType.Debug:

      // 标识符
      case TokenType.Identifier:

      // 整数
      case TokenType.Number:
      case TokenType.NumberInteger:
      case TokenType.NumberReal:

      case TokenType.StringValue:

      // 操作符
      // + - * / = != == > < >= <= ( ) [ ] :
      case TokenType.Plus:
      case TokenType.Minus:
      case TokenType.Product:
      case TokenType.Divisor:
      case TokenType.Assignment:
      case TokenType.Equal:
      case TokenType.Unequal:
      case TokenType.greaterthan:
      case TokenType.LessThan:
      case TokenType.greaterthanEqual:
      case TokenType.LessThanEqual:
      case TokenType.LeftParenthesis:
      case TokenType.RightParenthesis:
      case TokenType.LeftBracket:
      case TokenType.RightBracket:
      case TokenType.Comma:
      case TokenType.Comment:
      // 单行注释

      case TokenType.Error:
    }

  }

}

function syntaxType(tokens:Array<Token>, index:number) {

  function next() {
    return tokens[index ++];
  }
  
  for(;;) {
    const token = next();
    if(token.type == TokenType.Eof){
      break;
    }
    console.log(token.value);
  }

}

const tokens = lexicalAnalyzer(`
native a takes

`)
tokens.push(new Token(TokenType.Eof, ""));
syntaxType(tokens, 0);
























