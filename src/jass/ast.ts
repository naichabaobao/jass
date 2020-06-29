// import { JassType } from "./type";
import {TokenParser, Token} from "./token";
import {isType} from "./types";

class Position {

  public line:number;
  public column:number;

  constructor(line:number,column:number) {
    this.line = line;
    this.column = column;
  }

  public static default() {
    return new Position(0, 0);
  }

}

type node_type = "File" | "Comment" | "Function" | "Takes" | "Take" | "Returns" | "Nothing" |"Globals" | "Native" | "Variable" | "Assignment" | "Expression" | "Factor" | "Value";

interface Origin {
  origin():string;
}

class Node implements Origin{
  public readonly nodeType:string; //node_type;

  public start:Position = Position.default();
  public end:Position = Position.default();

  constructor(type:string) {
    this.nodeType = type;
  }
  origin(): string {
    throw new Error("Method not implemented.");
  }
}

class Nothing extends Node{
  constructor() {
    super("Nothing")
  }

  public origin() {
    return "nothing";
  }

}

class Take extends Node {

  public type:string = "unkown";
  public name:string = "";

  constructor() {
    super("Take");
  }

  public origin() {
    return `${this.type} ${this.name}`;
  }

}

class Takes extends Node {

  public takes:Array<Take> = new Array<Take>();

  constructor () {
    super("Takes");
  }

  public origin() {
    return this.takes.map(take => take.origin()).join(",");
  }
}

class Returns extends Node {

  public returns:string|Nothing = new Nothing();

  constructor() {
    super("Returns");
  }

  public origin() {
    return `returns ${this.returns instanceof Nothing ? this.returns.origin() : this.returns}`;
  }

}

class FunctionDeclaration extends Node{
  public name:string = "";
  public takes:Takes|Nothing = new Nothing();
  public returns:Returns = new Returns();

  public block:Array<Variable> = [];

  constructor() {
    super("Function");
  }

  public origin() {
    return `function ${this.name} takes ${this.takes.origin()} ${this.returns.origin()}\nendfunction`;
  }

}

class NativeDeclaration extends Node {
  public flags:Array<string> = [];
  public name:string = "";
  public takes:Takes|Nothing = new Nothing();
  public returns:Returns = new Returns();

  constructor() {
    super("Native");
  }

  public origin() {
    let origin = `native ${this.name} takes ${this.takes.origin()} ${this.returns.origin()}`;
    if(this.flags.length > 0) {
      origin = this.flags.join(" ") + " " + origin;
    }
    return origin;
  }
}

class Comment extends Node {

  public content:string = "";

  constructor() {
    super("Comment");
  }

  public origin() {
    return this.content;
  }

}

class Variable extends Node {
  public flags:Array<string> = [];
  public type:string = "unkown";
  public name:string = "";
  public assignment:Assignment|null = null;

  constructor() {
    super("Variable");
  }

  public origin() {
    let origin = `${this.type} ${this.isArray() ? "array " : ""}${this.name}`;
    if(this.isConstant()) {
      origin = "constant " + origin;
    }else if(this.isLocal()) {
      origin = "local " + origin;
    }
    return origin;
  }

  public isArray() {
    return this.flags.includes("array");
  }

  public isConstant() {
    return this.flags.includes("constant");
  }

  public isLocal() {
    return this.flags.includes("local");
  }

}

class Assignment extends Node {
  constructor() {
    super("Assignment");
  }
}

class Globals extends Node{

  public variables:Array<Variable> = [];

  constructor() {
    super("Globals");
  }

}

/**
 * 表达式
 */
class Expression extends Node {}

class UnaryExpression extends Expression {

  public op:string = null as any;
  public right:Factor|Value|Expression = null as any;

  constructor() {
    super("UnaryExpression");
  }
}
class BinaryExpression extends Expression {

  public op:string = null as any;
  public left:Factor|Value|Expression = null as any;
  public right:Factor|Value|Expression = null as any;

  constructor() {
    super("BinaryExpression");
  }
}

class PreferredExpression extends Expression {

  public value:Expression|Value = null as any;

  constructor() {
    super("PreferredExpression");
  }
}

class BooleanExpress extends Expression {
  public readonly nodeType = "BooleanExpress";

  public op:string = null as any;
  public left:Factor|Value|Expression = null as any;
  public right:Factor|Value|Expression = null as any;
}

/**
 * 因子
 */
class Factor extends Node {

  constructor() {
    super("Factor");
  }

}

/**
 * 值
 */
class Value extends Node {

  constructor() {
    super("Value");
  }

}
/**
 * 0
 */
class Integer extends Value {
  public readonly nodeType = "Integer";

  public value:string = null as any;

  public valueOf() {
    return Number.parseInt(this.value);
  }

}
/**
 * 000000007
 */
class IntegerOctonary extends Value {
  public readonly nodeType = "IntegerOctonary";

  public value:string = null as any;

  public valueOf() {
    return Number.parseInt(this.value);
  }

}
/**
 * 0x00000000
 */
class IntegerHexadecimal extends Value {
  public readonly nodeType = "IntegerHexadecimal";

  public value:string = null as any;

  public valueOf() {
    return Number.parseInt(this.value);
  }
}
/**
 * $00000000
 */
class IntegerHexadecimalEx extends Value {
  public readonly nodeType = "IntegerHexadecimalEx";

  public value:string = null as any;

  public valueOf() {
    return Number.parseInt(this.value.replace(/^\$/, "0x"));
  }
}
/**
 * '0aZ9'
 */
class IntegerCode extends Value {
  public readonly nodeType = "IntegerCode";

  public value:string = null as any;

  public valueOf() {
    const str = `0x${/'(?<code>[0-9a-zA-Z]{4,4})'/.exec(this.value)?.groups?.code.split("").map(val => val.charCodeAt(0).toString(16)).join("")}`;
    return Number.parseInt(str);
  }
}

class Real extends Value {
  public readonly nodeType = "Real";

  public value:string = null as any;

  public valueOf() {
    let value = this.value;
    if(value.startsWith(".")) {
      value = `0${this.value}`;
    }else if(value.endsWith(".")) {
      value += "0";
    }
    return parseInt(value);
  }
}

class Boolean extends Value {
  public readonly nodeType = "Boolean";

  public value:string = null as any;

  public valueOf() {
    return this.value == "true";
  }
}

class String extends Value {
  public readonly nodeType = "String";

  public value:string = null as any;

  public valueOf() {
    return this.value;
  }
}




// class 

class Program extends Node {

  public fileName:string = "";
  public block:Array<FunctionDeclaration|Globals|NativeDeclaration> = [];
  public comments:Array<Comment> = [];

  private tokenParse:TokenParser|null = null;

  constructor() {
    super("File");
  }

  public parse(content:string) {
    this.tokenParse = new TokenParser(content);

    const tokens = this.tokens;
    let type = 0;

    let func:FunctionDeclaration = null as any;
    let take:Take = null as any;

    let native:NativeDeclaration = null as any;

    let globals:Globals = null as any;
    let globalType:number = 0;
    let global:Variable = null as any;

    let functionBlockType: number = 0;
    let localType:number = 0;
    let local:Variable = null as any;

    let exType = 0;


    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      const setStart = (node:Node) => {
        node.start = new Position(token.line, token.position);
      };
      const setEnd = (node:Node) => {
        node.end = new Position(token.line, token.end_position);
      };
      const setNode = (node:Node) => {
        setStart(node);
        setEnd(node);
      };
      const parseExpression = () => {

      };
      if(token.type == "comment") {
        const node = new Comment();
        node.content = token.value;
        setNode(node);
        this.comments.push(node);
      }
      else if(type == 0) {
        if(token.type == "keyword" && token.value == "function") {
          func = new FunctionDeclaration();
          setStart(func);
          type = 100;
        }else if(token.type == "keyword" && token.value == "constant") {
          native = new NativeDeclaration();
          native.flags.push("constant");
          setStart(native);
          type = 200;
        }else if(token.type == "keyword" && token.value == "native") {
          native = new NativeDeclaration();
          setStart(native);
          type = 201;
        }else if(token.type == "keyword" && token.value == "globals") {
          globals = new Globals();
          setStart(globals);
          type = 300;
        }
      }
      // function
      else if(type == 100) { // function name
        if(token.type == "identifier") {
          func.name = token.value;
          type = 101;
        }else{
          type = 0;
        }
      }else if(type == 101) { // function takes
        if(token.type == "keyword" && token.value == "takes") {
          type = 102;
        }else{
          type = 0;
        }
      }else if(type == 102) { // function takes or nothing
        if(isType(token.value)) {
          func.takes = new Takes;
          take = new Take;
          take.type = token.value;
          setStart(take);
          type = 103;
        }else if(token.type == "keyword" && token.value == "nothing") {
          const node = new Nothing;
          setNode(node);
          func.takes = node;
          type = 105;
        }else{
          type = 0;
        }
      }else if(type == 103) { // take name
        if(token.type == "identifier") {
          take.name = token.value;
          setEnd(take);
          if(func.takes instanceof Takes) {
            func.takes.takes.push(take);
          }
          type = 104;
        }else {
          type = 0;
        }
      }else if(type == 104) {
        if(token.type == "operation" && token.value == ",") {
          type = 106;
        }else if(token.type == "keyword" && token.value == "returns") {
          type = 107;
        }else {
          type = 0;
        }
      }else if(type == 105) { // take nothing
        if(token.type == "keyword" && token.value == "returns") {
          type = 107;
        }else {
          type = 0;
        }
      }else if(type == 106) {
        
        if(isType(token.value)) {
          take = new Take;
          take.type = token.value;
          setStart(take);
          type = 103;
        }else{
          type = 0;
        }
      }else if(type == 107) {
        if(isType(token.value)) {
          const node = new Returns;
          setNode(node);
          node.returns = token.value;

          func.returns = node;
      
          type = 108;
        }else if(token.type == "keyword" && token.value == "nothing") {
          const node = new Returns;
          const t = new Nothing;
          node.returns = t;
          setNode(node);

          func.returns = node;

          type = 108;
        }else{
          type = 0;
        }
      }else if(type == 108) {
        if(token.type == "keyword" && token.value == "endfunction") {
          setEnd(func);
          this.block.push(func);
          type = 0;
        }else{
          // 分别解析local set call if loop，目前仅分析local
          if(functionBlockType == 0) {
            if(token.type == "keyword" && token.value == "local") {
              local = new Variable();
              local.flags.push("local");
              setStart(local);
              functionBlockType = 1;
              localType = 0;
            }
          }else if(functionBlockType == 1) {
            // local
            if(localType == 0) {
              if(isType(token.value)) {
                local.type = token.value;
                localType = 1;
              }else{  
                functionBlockType = 0;
              }
            }else if(localType == 1) {
              if(token.type == "identifier") {
                local.name = token.value;
                setEnd(local);
                func.block.push(local);
                functionBlockType = 0;
              }else if(token.type == "keyword" && token.value == "array") {
                local.flags.push("array");
                localType = 2;
              }else{
                functionBlockType = 0;
              }
            }else if(localType == 2) {
              if(token.type == "identifier") {
                local.name = token.value;
                setEnd(local);
                func.block.push(local);
                functionBlockType = 0;
              }else{
                functionBlockType = 0;
              }
            }
          }
        }
      }
      // native
      else if(type == 200) {
        if(token.type == "keyword" && token.value == "native") {
          type = 201;
        }else{
          type = 0;
        }
      }else if(type == 201) {
        if(token.type == "identifier") {
          native.name = token.value;
          type = 202;
        }else{
          type = 0;
        }
      }else if(type == 202) { // native takes
        if(token.type == "keyword" && token.value == "takes") {
          type = 203;
        }else{
          type = 0;
        }
      }else if(type == 203) { // native takes or nothing
        if(isType(token.value)) {
          native.takes = new Takes;
          take = new Take;
          take.type = token.value;
          setStart(take);
          type = 204;
        }else if(token.type == "keyword" && token.value == "nothing") {
          const node = new Nothing;
          setNode(node);
          native.takes = node;
          type = 206;
        }else{
          type = 0;
        }
      }else if(type == 204) { // take name
        if(token.type == "identifier") {
          take.name = token.value;
          setEnd(take);
          if(native.takes instanceof Takes) {
            native.takes.takes.push(take);
          }
          type = 205;
        }else {
          type = 0;
        }
      }else if(type == 205) {
        if(token.type == "operation" && token.value == ",") {
          type = 207;
        }else if(token.type == "keyword" && token.value == "returns") {
          type = 208;
        }else {
          type = 0;
        }
      }else if(type == 206) { // take nothing
        if(token.type == "keyword" && token.value == "returns") {
          type = 208;
        }else {
          type = 0;
        }
      }else if(type == 207) {
        
        if(isType(token.value)) {
          take = new Take;
          take.type = token.value;
          setStart(take);
          type = 204;
        }else{
          type = 0;
        }
      }else if(type == 208) {
        if(isType(token.value)) {
          const node = new Returns;
          setNode(node);
          const t = token.value
          if(t) {
            node.returns = t;

            setEnd(native);
            this.block.push(native);

            type = 0;
          }else{
            type = 0;
          }
        }else if(token.type == "keyword" && token.value == "nothing") {
          const node = new Returns;
          const t = new Nothing;
          node.returns = t;
          setNode(node);
          native.returns = node;

          setEnd(native);
          this.block.push(native);

          type = 0;
        }else{
          type = 0;
        }
      }
      // globals
      else if(type == 300) {
        if(token.type == "keyword" && token.value == "endglobals") {
          setEnd(globals);
          this.block.push(globals);
          type = 0;
        }else{
          if(globalType == 0) {
            if(token.type == "keyword" && token.value == "constant") {
              global = new Variable();
              global.flags.push("constant");
              setStart(global);
              globalType = 1;
            }else if(isType(token.value)) {
              global = new Variable();
              global.type = token.value;
              setStart(global);
              globalType = 2;
            }
          }else if(globalType == 1) {
            if(isType(token.value)) {
              global.type = token.value;
              globalType = 2;
            }else{
              globalType = 0;
            }
          }else if(globalType == 2) {
            if(token.type == "identifier") {
              global.name = token.value;
              globalType = 3;
            }else{
              globalType = 0;
            }
          }else if(globalType == 3) {
            if(token.type == "keyword" && token.value == "array") {
              if(!global.isConstant()) {
                global.flags.push("array");
                setEnd(global);
                globals.variables.push(global);
              }
              globalType = 0;
            }else if(token.type == "operation" && token.value == "=") {
              // 目前暂不支持赋值
              global.assignment = new Assignment();
              setEnd(global);
              globals.variables.push(global);
              globalType = 0;
            }else{
              if(!global.isConstant()) {
                setEnd(global);
                globals.variables.push(global);
              }
              globalType = 0;
            }
            
          }
        }
      }
      
    }
    // console.log(this);
    return this;
  }

  public setFileName(fileName:string) {
    this.fileName = fileName;
    return this;
  }
  
  public get tokens() : Array<Token> {
    return this.tokenParse ? this.tokenParse.tokens() : [];
  }
  
  public functions():Array<FunctionDeclaration> {
    return this.block.filter(value => value instanceof FunctionDeclaration) as Array<FunctionDeclaration>;
  }

  public natives():Array<NativeDeclaration> {
    return this.block.filter(value => value instanceof NativeDeclaration) as Array<NativeDeclaration>;
  }

  public globals():Array<Globals> {
    return this.block.filter(value => value instanceof Globals) as Array<Globals>;
  }

  public globalVariables():Array<Variable> {
    return this.globals().map(val => val.variables).flat();
  }

  public findComment(line:number) {
    return this.comments.find(value => value.start.line == line)?.content.replace(/^\/\/\s*/, "");
  }

}

export {
  Program,
  FunctionDeclaration,
  Comment,
  Takes,
  Take,
  Returns,
  Nothing,
  node_type,
  NativeDeclaration,
  Variable
};