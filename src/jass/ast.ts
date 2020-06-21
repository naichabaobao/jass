import { JassType } from "./type";
import {TokenParser, Token} from "./token";


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

type node_type = "File" | "Comment" | "Function" | "Takes" | "Take" | "Returns" | "Nothing" |"Globals";

interface Origin {
  origin():string;
}

class Node implements Origin{
  public readonly nodeType:node_type;

  public start:Position = Position.default();
  public end:Position = Position.default();

  constructor(type:node_type) {
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

  public type:JassType|null|undefined = null;
  public name:string = "";

  constructor() {
    super("Take");
  }

  public origin() {
    return `${this.type?.name} ${this.name}`;
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

  public returns:JassType|Nothing = new Nothing();

  constructor() {
    super("Returns");
  }

  public origin() {
    return `returns ${this.returns instanceof Nothing ? this.returns.origin() : this.returns.name}`;
  }

}

class FunctionDeclaration extends Node{
  public name:string = "";
  public takes:Takes|Nothing = new Nothing();
  public returns:Returns = new Returns();

  constructor() {
    super("Function");
  }

  public origin() {
    return `function ${this.name} takes ${this.takes.origin()} ${this.returns.origin()}\nendfunction`;
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

/**
 * @deprecated 保留
 */
class Globals{}

class File extends Node {

  public fileName:string = "";
  public block:Array<FunctionDeclaration|Globals> = [];
  public comments:Array<Comment> = [];

  private tokenParse:TokenParser|null = null;

  constructor() {
    super("File");
  }

  public parse(content:string) {
    this.tokenParse = new TokenParser(content);

    const tokens = this.tokens;
    console.log(tokens)
    let type = 0;

    let func:FunctionDeclaration = new FunctionDeclaration();
    let take:Take = new Take();

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

      console.log(type);
      if(type == 0) {
        if(token.type == "comment") {
          const node = new Comment();
          node.content = token.value;
          setNode(node);
          this.comments.push(node);
        }else if(token.type == "keyword" && token.value == "function") {
          func = new FunctionDeclaration();
          setStart(func);
          type = 100;
        }
      }else if(type == 100) { // function name
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
        if(JassType.isType(token.value)) {
          func.takes = new Takes;
          take = new Take;
          take.type = JassType.get(token.value);
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
        
        console.log(token.value)
        console.log(JassType.isType(token.value))
        if(JassType.isType(token.value)) {
          take = new Take;
          take.type = JassType.get(token.value);
          setStart(take);
          type = 103;
        }else{
          type = 0;
        }
      }else if(type == 107) {
        if(JassType.isType(token.value)) {
          const node = new Returns;
          setNode(node);
          const t = JassType.get(token.value)
          if(t) {
            node.returns = t;

            setEnd(func);
            this.block.push(func);

            type = 0;
          }else{
            type = 0;
          }
        }else if(token.type == "keyword" && token.value == "nothing") {
          const node = new Returns;
          const t = new Nothing;
          node.returns = t;
          setNode(node);
          func.returns = node;

          setEnd(func);
          this.block.push(func);

          type = 0;
        }else{
          type = 0;
        }
      }
      
    }
    return this;
  }

  
  public get tokens() : Array<Token> {
    return this.tokenParse ? this.tokenParse.tokens() : [];
  }
  
  public functions():Array<FunctionDeclaration> {
    return this.block.filter(value => value instanceof FunctionDeclaration) as Array<FunctionDeclaration>;
  }

  public findComment(line:number) {
    return this.comments.find(value => value.start.line == line)?.content.replace(/^\/\/\s*/, "") ?? "";
  }

}

export {
  File,
  FunctionDeclaration,
  Comment,
  Takes,Take,
  Returns,
  Nothing,
  node_type
};