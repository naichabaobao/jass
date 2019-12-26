import { interfaces } from "mocha";

class Global{
  public static supportVjass = true;
}

class Jass {

  public static readonly Types = ["agent","event","player","widget","unit","destructable","item","ability","buff","force","group","trigger","triggercondition","triggeraction","timer","location","region","rect","boolexpr","sound","conditionfunc","filterfunc","unitpool","itempool","race","alliancetype","racepreference","gamestate","igamestate","fgamestate","playerstate","playerscore","playergameresult","unitstate","aidifficulty","eventid","gameevent","playerevent","playerunitevent","unitevent","limitop","widgetevent","dialogevent","unittype","gamespeed","gamedifficulty","gametype","mapflag","mapvisibility","mapsetting","mapdensity","mapcontrol","playerslotstate","volumegroup","camerafield","camerasetup","playercolor","placement","startlocprio","raritycontrol","blendmode","texmapflags","effect","effecttype","weathereffect","terraindeformation","fogstate","fogmodifier","dialog","button","quest","questitem","defeatcondition","timerdialog","leaderboard","multiboard","multiboarditem","trackable","gamecache","version","itemtype","texttag","attacktype","damagetype","weapontype","soundtype","lightning","pathingtype","mousebuttontype","animtype","subanimtype","image","ubersplat","hashtable","framehandle","originframetype","framepointtype","textaligntype","frameeventtype","oskeytype","abilityintegerfield","abilityrealfield","abilitybooleanfield","abilitystringfield","abilityintegerlevelfield","abilityreallevelfield","abilitybooleanlevelfield","abilitystringlevelfield","abilityintegerlevelarrayfield","abilityreallevelarrayfield","abilitybooleanlevelarrayfield","abilitystringlevelarrayfield","unitintegerfield","unitrealfield","unitbooleanfield","unitstringfield","unitweaponintegerfield","unitweaponrealfield","unitweaponbooleanfield","unitweaponstringfield","itemintegerfield","itemrealfield","itembooleanfield","itemstringfield","movetype","targetflag","armortype","heroattribute","defensetype","regentype","unitcategory","pathingflag"];

  public static readonly Keywords = ["function","endfunction","constant","native","local","type","set","call","takes","returns","extends","array","true","false","null","nothing","if","else","elseif","endif","then","loop","endloop","exitwhen","return","integer","real","boolean","string","handle","code","and","or","not","globals","endglobals"];

  public static readonly VjassKeywords = ["library","initializer","needs","requires","endlibrary","scope","endscope","private","public","static","interface","endinterface","implement","struct","endstruct","method","endmethod","this","delegate","operator","debug"];

}

enum JassStatus {
  Start,
  Nill,
  CommentStart,
  LineComment,
  BlockComment,
  WillBreakBlockComment,
  L,
  C,

}


class JassAutoMaMachine {

  private slots:Array<string> = new Array<string>();

  private status:Array<JassStatus> = new Array<JassStatus>();

  private content:string;
  private startLine:number = 0;
  private startIndex:number = 0;
  private index = -1;
  private line = 0;

  constructor(content:string){
    this.content = content;
  }

  private doing(){
    for (let i = 0; i < this.content.length; i++) {
      this.put(this.content.charAt(i));
    }
  }

  public start(){
    this.doing();
  }

  private currentStatus:JassStatus = JassStatus.Nill;

  private data:any;

  public put(char:string):void{
    

    if(this.currentStatus == JassStatus.Nill){
      if(Tool.isLeftSlash(char)){
        this.currentStatus = JassStatus.CommentStart;
      }else if(char == ""){
        
      }
    }else if(this.currentStatus == JassStatus.CommentStart){
      if(Tool.isAsterisk(char)){
        this.currentStatus = JassStatus.BlockComment;
        this.data = new BlockComment();
        this.startLine = this.line;
        this.startIndex = this.index - 1;
      }else if(Tool.isLeftSlash(char)){
        this.currentStatus = JassStatus.LineComment;
        this.data = new LineComment();
        this.startLine = this.line;
        this.startIndex = this.index - 1;
      }else{
        this.currentStatus = JassStatus.Nill;
      }
    }else if(this.currentStatus == JassStatus.LineComment){
      if(Tool.isNewLine(char)){
        this.currentStatus = JassStatus.Nill;
        const lineComment = this.data as LineComment;
        lineComment.startLine = this.startLine;
        lineComment.startIndex = this.startIndex;
        lineComment.endLine = this.line;
        lineComment.endIndex = this.index;
        lineComment.commentContent = this.get();
        this.clear();
        if( this.onLineComment){
          this.onLineComment(lineComment);
        }
      }else{
        this.slots.push(char);
      }
    }else if(this.currentStatus == JassStatus.BlockComment){
      if(Tool.isAsterisk(char)){
        this.currentStatus = JassStatus.WillBreakBlockComment;
      }else{
        this.slots.push(char);
      }
    }else if(this.currentStatus == JassStatus.WillBreakBlockComment){
      if(Tool.isLeftSlash(char)){
        this.currentStatus = JassStatus.Nill;
        const blockComment = this.data as BlockComment;
        blockComment.startLine = this.startLine;
        blockComment.startIndex = this.startIndex;
        blockComment.endLine = this.line;
        blockComment.endIndex = this.index;
        blockComment.commentContent = this.get();
        this.clear();
        if( this.onBlockComment){
          this.onBlockComment(blockComment);
        }
      }else{
        this.slots.push(Tool.Asterisk);
        this.slots.push(char);
        this.currentStatus = JassStatus.BlockComment;
      }
    }

    if(Tool.isNewLine(char)){
      this.index = 0;
      this.line ++;
    }else if(char.length > 0) {
      this.index++;
    }
  }

private clear(){
  this.slots = [];
}

private get(){
  return this.slots.join("");
}

  public onLineComment:LineCommentFunction | undefined;

  public onBlockComment:BlockCommentFunction | undefined;

}

type LineCommentFunction = (comment?: LineComment) => void;
type BlockCommentFunction = (comment?: BlockComment) => void;


class Tool {

  public static readonly LowercaseLetters:Array<string> = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",];

  public static readonly Capital:Array<string> = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",];

  public static readonly Numbers:Array<string> = ["0","1","2","3","4","5","6","7","8","9"];

  public static readonly Underline = "_";
  public static readonly Comma = ",";
  public static readonly LeftParenthesis = "(";
  public static readonly RightParenthesis = ")";
  public static readonly LeftSlash = "/";
  public static readonly Asterisk = "*";
  public static readonly GreaterThan = ">";
  public static readonly LessThan = "<";
  public static readonly NewLine = "\n";

  public static isNewLine(char:string):boolean {
    return char == this.NewLine;
  }

  // 是否/
  public static isLeftSlash(char:string):boolean {
    return char == this.LeftSlash;
  }
  public static isLatter(char:string):boolean {
    return [...this.LowercaseLetters,...this.Capital].includes(char);
  }
  // 是否*
  public static isAsterisk(char:string):boolean {
    return char == this.Asterisk;
  }
}


interface Line{
  line:number;
}

interface Start{
  startLine:number;
  startIndex:number;
}

interface End{
  endLine:number;
  endIndex:number;
}

class LineComment implements Start , End{
  public endLine: number = 0;
  public endIndex: number = 0;
  public startLine: number = 0;
  public startIndex: number = 0;
  public commentContent:string = "";
  constructor(commentContent?:string){
    if(commentContent){
      this.commentContent = commentContent;
    }
  }
}

class BlockComment implements Start , End{
  public endLine: number = 0;
  public endIndex: number = 0;
  public startLine: number = 0;
  public startIndex: number = 0;
  public commentContent:string = "";
  constructor(commentContent?:string){
    if(commentContent){
      this.commentContent = commentContent;
    }
  }
}

const m = new JassAutoMaMachine(`

// /*123*/
/* // aa */

/*a/*aa*/

`);

m.onLineComment = (comment) => {
  console.log(comment);
} 

m.onBlockComment = (comment) => {
  console.log(comment);
} 

m.start();