import { ZincError } from "./errors";

class Token {
  public type:"id"|"op"|"int"|"str"|"real"|"comment"|"block"|string;
  public value:string;

  public startLine = 0;
  public startPosition = 0;
  public endLine = 0;
  public endPosition = 0;

  constructor(type:string,value:string){
    this.type = type;
    this.value = value;
  }
}

const startRegExp = /^[ \t]*\/\/![ \t]+zinc([ \t].*\n|[ \t]*\n)$/;
const endRegExp = /^[ \t]*\/\/![ \t]+endzinc([ \t].*\n?|[ \t]*\n?)$/;

class Scanner {

  private tokens:Token[] = [];
  private errors:ZincError[] = [];

  constructor(content:string) {
    const LineResult = new RegExp(/.*\n/, "g").exec(content);
    if(!LineResult) {
      return;
    }

    let inZinc = false;
    const ZincRange = new Array<number[]>();
    const startEnd:number[] = [];
    for (let index = 0; index < LineResult.length; index++) {
      const line = LineResult[index];
      if (inZinc == false && startRegExp.test(line)) {
        startEnd.push(index);
        inZinc = true;
      }else if(inZinc == true && startRegExp.test(line)) {
        const error = new ZincError();
        error.message = "The end sign could not be found!";
        error.startLine = startEnd[0];
        error.endLine = startEnd[0];
        error.endPosition = LineResult[startEnd[0]].length;
        this.errors.push(error);
        startEnd[0] = index;
      }else if(inZinc == true && endRegExp.test(line)) {
        startEnd.push(index);
        ZincRange.push(startEnd);
      }else if(inZinc == false && endRegExp.test(line)) {
        const error = new ZincError();
        error.message = "The start mark could not be found!";
        error.startLine = index;
        error.endLine = index;
        error.endPosition = line.length;
        this.errors.push(error);
      }
      
    }

    return;

    for (let index = 0; index < content.length; index++) {
      const char = content[index];
      
    }
    console.log(startRegExp.test(content))
    console.log(endRegExp.test(content))
    console.time();
    this.start(content, 0);
    console.timeEnd();
    console.time();
    console.log(/\/\/!\s+zinc(\s.*\n|\s*\n)/.exec(content))
    console.timeEnd();
  }

  private line:number = 0;
  private position:number = 0;
  private calc(char:string) {
    if(char == "\n") {
      this.line++;
      this.position = 0;
    }else{
      this.position++;
    }
  }
  private isStart = true;
  private start(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.leftForward(content, index);
    }else if(/\s/.test(char)) {
      this.start(content, index);
    }else{
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  } 
  private leftForward(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.doubleLeftForward(content, index);
    }else if(char == "*"){
      this.awaitBlockCommentOver1(content, index);
    } else {
      this.start(content, index);
    }
    this.calc(char);
  }
  private doubleLeftForward(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "!") {
      this.macroStart(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitNewLine(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.start(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitBlockCommentOver1(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "*") {
      this.awaitBlockCommentOver2(content, index);
    }else {
      this.awaitBlockCommentOver1(content, index);
    }
    this.calc(char);
  }
  private awaitBlockCommentOver2(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "/") {
      this.start(content, index);
    }else {
      this.awaitBlockCommentOver1(content, index);
    }
    this.calc(char);
  }
  private macroStart(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == " " || char == "\t") {
      this.expectZ(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectZ(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "z") {
      this.expectI(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectI(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "i") {
      this.expectN(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectN(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "n") {
      this.expectC(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private expectC(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "c") {
      this.awaitNewLineOrSpace(content, index);
    }else {
      this.awaitNewLine(content, index);
    }
    this.calc(char);
  }
  private awaitNewLineOrSpace(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.zincBlock(content, index);
    }else if(char == " " || char == "\t" || char == "\r"){
      this.awaitNewLineForZinc(content, index);
    }else{
      this.awaitNewLine(content, index)
    }
    this.calc(char);
  }
  private awaitNewLineForZinc(content:string, index:number) { 
    const char = content[index++];
    if(!char) return;
    if(char == "\n") {
      this.zincBlock(content, index);
    }else{
      this.awaitNewLineForZinc(content, index)
    }
    this.calc(char);
  }
  private zincBlock(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    if(isLatter(char)) {
      
    }
    this.calc(char);
  }

  private temp(content:string, index:number) {
    const char = content[index++];
    if(!char) return;
    
    this.calc(char);
  }


  public getTokens() {

  }

}

function isLatter(char:string) {
  return /[a-zA-Z]/.test(char);
}

function isNumber(char:string) {
  return /\d/.test(char);
}

class Scanner2 {

  private content:string;
  private index:number = 0;

  private line:number = 0;
  private position:number = 0;

  private getChar() {
    const char = this.content[this.index++];
    if(char == "\n") {
      this.line++;
      this.position = 0;
    }else{
      this.position++;
    }
    return char;
  }

  constructor(content:string) {
    this.content = content;
  }

  private start() {
    const char = this.getChar();
  }

}

new Scanner(`a
a


//! zinc 






 //! endzinc


 `);