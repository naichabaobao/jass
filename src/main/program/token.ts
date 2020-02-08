
enum TokenType {
  Keyword,
  Type,
  Identifier,
  Integer,
  Real,
  String,
  Code,
  Operation
}

class Token {
  public type:TokenType;
  public value:string;
  // public index:number;

  constructor(type:TokenType, value:string) {
    this.type = type;
    this.value = value;
  }

}

class lexicalError extends Error {}

function lexicalAnalyzer (sourceCode:string) {
  let index = 0;

  function getChar() {
    return sourceCode[index++];
  }

  while (index < sourceCode.length) {
    switch(sourceCode[index]){
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


function lexicalNumber (sourceCode:string, index: number) {
  
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


  let state:NumberType = NumberType.Unkwon;
  let value = "";

  for(;;) {
    char = getChar();
    switch(+state) {
      
      case NumberType.Unkwon:{
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
          case '.':{
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
        switch(char) {
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
          default:{
            return new Token(TokenType.Integer, value);
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
          case '.' :{
            value += char;
            state = NumberType.Real;
            break;
          }
          default: {
            return new Token(TokenType.Integer, value);
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
            return new Token(TokenType.Real, value);
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
            return new Token(TokenType.Integer, value);
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
            return new Token(TokenType.Integer, value);
          }
        }
        break;
      }

    }

  }

}

try{
  console.log(lexicalNumber(`.5`, 0));
  console.log(lexicalNumber(`6.5`, 0));
  console.log(lexicalNumber(`564`, 0));
  console.log(lexicalNumber(`0x23f`, 0));
  console.log(lexicalNumber(`0768`, 0));
  console.log(lexicalNumber(`$6ac`, 0));
}catch(err){
  console.error(err)
}

function lexicalLetter (sourceCode:string, index: number) {

}
