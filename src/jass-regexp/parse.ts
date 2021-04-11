import * as path from "path";
import * as fs from "fs";

import * as vscode from "vscode";

type BaseType = "boolean" | "integer" | "real" | "string" | "handle";
type BaseTypeCode = "code";
type BuiltType_1_20 = "agent"| "event"| "player"| "widget"| "unit"| "destructable"| "item"| "ability"| "buff"| "force"| "group"| "trigger"| "triggercondition"| "triggeraction"| "timer"| "location"| "region"| "rect"| "boolexpr"| "sound"| "conditionfunc"| "filterfunc"| "unitpool"| "itempool"| "race"| "alliancetype"| "racepreference"| "gamestate"| "igamestate"| "fgamestate"| "playerstate"| "playerscore"| "playergameresult"| "unitstate"| "aidifficulty"| "eventid"| "gameevent"| "playerevent"| "playerunitevent"| "unitevent"| "limitop"| "widgetevent"| "dialogevent"| "unittype"| "gamespeed"| "gamedifficulty"| "gametype"| "mapflag"| "mapvisibility"| "mapsetting"| "mapdensity"| "mapcontrol"| "playerslotstate"| "volumegroup"| "camerafield"| "camerasetup"| "playercolor"| "placement"| "startlocprio"| "raritycontrol"| "blendmode"| "texmapflags"| "effect"| "effecttype"| "weathereffect"| "terraindeformation"| "fogstate"| "fogmodifier"| "dialog"| "button"| "quest"| "questitem"| "defeatcondition"| "timerdialog"| "leaderboard"| "multiboard"| "multiboarditem"| "trackable"| "gamecache"| "version"| "itemtype"| "texttag"| "attacktype"| "damagetype"| "weapontype"| "soundtype"| "lightning"| "pathingtype"| "image"| "ubersplat";

type BuiltType_1_24 = "hashtable";
type BuiltType_1_29 = "mousebuttontype";
type BuiltType_1_30 = "animtype"| "subanimtype";
type BuiltType_1_31 = "framehandle"| "originframetype"| "framepointtype"| "textaligntype"| "frameeventtype"| "oskeytype"| "abilityintegerfield"| "abilityrealfield"| "abilitybooleanfield"| "abilitystringfield"| "abilityintegerlevelfield"| "abilityreallevelfield"| "abilitybooleanlevelfield"| "abilitystringlevelfield"| "abilityintegerlevelarrayfield"| "abilityreallevelarrayfield"| "abilitybooleanlevelarrayfield"| "abilitystringlevelarrayfield"| "unitintegerfield"| "unitrealfield"| "unitbooleanfield"| "unitstringfield"| "unitweaponintegerfield"| "unitweaponrealfield"| "unitweaponbooleanfield"| "unitweaponstringfield"| "itemintegerfield"| "itemrealfield"| "itembooleanfield"| "itemstringfield"| "movetype"| "targetflag"| "armortype"| "heroattribute"| "defensetype"| "regentype"| "unitcategory"| "pathingflag";
type BuiltType_1_32 = "minimapicon"| "commandbuttoneffect";

type BType = BaseType | BuiltType_1_20 | BuiltType_1_24 | BuiltType_1_29 | BuiltType_1_30 | BuiltType_1_31 | BuiltType_1_32;
type TType = BType | BaseTypeCode;

interface Expression {}

class Global{
  private type:BType;
  private id:string;
  private isConstant: boolean = false;
  private isArray:boolean = false;
  private value: Expression | null = null;

  constructor(type:BType, id: string) {
    this.type = type;
    this.id = id;
  }

  public setConstant(isConstant:boolean = true) {
    this.isConstant = isConstant;
    if (isConstant) {
      this.isArray = false;
    }
  }

  public getConstant() {
    return this.isConstant;
  }

  public setArray(isArray:boolean = true) {
    this.isArray = isArray;
    if(isArray) {
      this.isConstant = false;
    }
  }

  public getArray() {
    return this.isArray;
  }

  public getType() {
    return this.type;
  }

  public getId() {
    return this.id;
  }

  public setValue(value: Expression) {
    this.value = value;
  }

  public getValue() {
    return this.value;
  }

}

class Func {
  private id:string;
  private takes:Take[]|null = null;
  private returns:BType|null = null;
  private body:Expression[] = [];

  constructor(id:string, takes:Take[]|null = null, returns:string|null = null) {
    this.id = id;
  }

  public getId() {
    return this.id;
  }

  public setTakes(takes:Take[]|null = null) {
    this.takes = takes;
  }

  public getTakes() {
    return this.takes;
  }

  public setReturns ( returns:BType|null = null) {
    this.returns = returns;
  }

  public getReturns() {
    return this.returns;
  }
}

class Native {
  private isConstant:boolean = false;
  private id:string;
  private takes:Take[]|null = null;
  private returns:BType|null = null;

  constructor(id:string, takes:Take[]|null = null, returns:string|null = null) {
    this.id = id;
  }

  public getId() {
    return this.id;
  }

  public setTakes(takes:Take[]|null = null) {
    this.takes = takes;
  }

  public getTakes() {
    return this.takes;
  }

  public setReturns ( returns:BType|null = null) {
    this.returns = returns;
  }

  public getReturns() {
    return this.returns;
  }

  public setConstant(isConstant : boolean = false) {
    this.isConstant = isConstant;
  }

  public getConstant() {
    return this.isConstant;
  }

}

class Take {
  private type:TType;
  private id:string;

  constructor(type:TType, id:string) {
    this.type = type;
    this.id = id;
  }

  public getType() {
    return this.type;
  }

  public getId() {
    return this.id;
  }

}

function configuration() {
  return vscode.workspace.getConfiguration("jass");
}

function isJFile(filePath: string) {
  return path.parse(filePath).ext == ".j";
}

function isAiFile(filePath: string) {
  return path.parse(filePath).ext == ".ai";
}


function isUsableFile(filePath: string) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function isUsableJFile(filePath: string) {
  return isUsableFile(filePath) && isJFile(filePath);
}

function isUsableAiFile(filePath: string) {
  return isUsableFile(filePath) && isAiFile(filePath);
}


function getCommonJPath() {
  return isUsableJFile(configuration()["common_j"] as string) ? configuration()["common_j"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.j");
}

function getBlizzardJPath() {
  return isUsableJFile(configuration()["blizzard"] as string) ? configuration()["blizzard"] as string : path.resolve(__dirname, "../../src/resources/static/jass/blizzard.j");
}

function getCommonAiPath() {
  return isUsableAiFile(configuration()["common_ai"] as string) ? configuration()["common_ai"] as string : path.resolve(__dirname, "../../src/resources/static/jass/common.ai");
}

function getDzApiJPath() {
  return isUsableJFile(configuration()["dzapi"] as string) ? configuration()["dzapi"] as string : path.resolve(__dirname, "../../src/resources/static/jass/DzAPI.j");
}

class Program {
  public natives:Native[] = [];
  public functions:Func[] = [];
  public globals:Global[] = [];

  constructor() {}

}

function bufferToLines (content:string):string[] {
  content = content.replace(/\r\n/g, "\n");
  const lines:string[] = [];
  for (let i:number = 0,contentIndex:number = -1; i < content.length; ) {
    console.log(i)
    contentIndex = content.substring(i,content.length).indexOf("\n");
    if (contentIndex !== -1) {
      lines.push(content.substring(i, contentIndex));
      i = contentIndex + 1;
    }else {
      lines.push(content.substring(i,content.length));
      break;
    }
  }

  return lines;
}

function parse(filePath:string) {
  const content = fs.readFileSync(filePath).toString("utf8");
  const program = new Program();
  const lines = bufferToLines(content);
  return program;
}

function parseCommonJFile () {
  const commonPath = getCommonJPath();
  console.log(commonPath)
  parse(commonPath)
  const program = new Program();
}

parseCommonJFile();