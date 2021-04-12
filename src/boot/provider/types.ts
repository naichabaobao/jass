/**
 * 静态jass type
 * 动态解析完全没卵用
 * 简单实现完虐所有
 */

const defaultVersion = "1.32";

const statemType = ["boolean", "integer", "real", "string", "handle"];

const baseType = [...statemType, "code"];
// 基础 6
// 最初版本84
// 新加50
const type_1_20 = ["agent", "event", "player", "widget", "unit", "destructable", "item", "ability", "buff", "force", "group", "trigger", "triggercondition", "triggeraction", "timer", "location", "region", "rect", "boolexpr", "sound", "conditionfunc", "filterfunc", "unitpool", "itempool", "race", "alliancetype", "racepreference", "gamestate", "igamestate", "fgamestate", "playerstate", "playerscore", "playergameresult", "unitstate", "aidifficulty", "eventid", "gameevent", "playerevent", "playerunitevent", "unitevent", "limitop", "widgetevent", "dialogevent", "unittype", "gamespeed", "gamedifficulty", "gametype", "mapflag", "mapvisibility", "mapsetting", "mapdensity", "mapcontrol", "playerslotstate", "volumegroup", "camerafield", "camerasetup", "playercolor", "placement", "startlocprio", "raritycontrol", "blendmode", "texmapflags", "effect", "effecttype", "weathereffect", "terraindeformation", "fogstate", "fogmodifier", "dialog", "button", "quest", "questitem", "defeatcondition", "timerdialog", "leaderboard", "multiboard", "multiboarditem", "trackable", "gamecache", "version", "itemtype", "texttag", "attacktype", "damagetype", "weapontype", "soundtype", "lightning", "pathingtype", "image", "ubersplat"]

const type_1_24 = ["hashtable"];

const type_1_29 = ["mousebuttontype"];

const type_1_30 = ["animtype", "subanimtype"];

// war3PTR1.31.0.11889
const type_1_31 = ["framehandle", "originframetype", "framepointtype", "textaligntype", "frameeventtype", "oskeytype", "abilityintegerfield", "abilityrealfield", "abilitybooleanfield", "abilitystringfield", "abilityintegerlevelfield", "abilityreallevelfield", "abilitybooleanlevelfield", "abilitystringlevelfield", "abilityintegerlevelarrayfield", "abilityreallevelarrayfield", "abilitybooleanlevelarrayfield", "abilitystringlevelarrayfield", "unitintegerfield", "unitrealfield", "unitbooleanfield", "unitstringfield", "unitweaponintegerfield", "unitweaponrealfield", "unitweaponbooleanfield", "unitweaponstringfield", "itemintegerfield", "itemrealfield", "itembooleanfield", "itemstringfield", "movetype", "targetflag", "armortype", "heroattribute", "defensetype", "regentype", "unitcategory", "pathingflag"];

const type_1_32 = ["minimapicon", "commandbuttoneffect"];

/*
type agent extends handle // 所有拥有引用的对象
type event extends agent // 注册的事件的引用
type player extends agent // 一个玩家的引用
type widget extends agent // 有生命的可以互动的游戏对象
type unit extends widget // 一个单位的引用
type destructable extends widget
type item extends widget
type ability extends agent
type buff extends ability
type force extends agent
type group extends agent
type trigger extends agent
type triggercondition extends agent
type triggeraction extends handle
type timer extends agent
type location extends agent
type region extends agent
type rect extends agent
type boolexpr extends agent
type sound extends agent
type conditionfunc extends boolexpr
type filterfunc extends boolexpr
type unitpool extends handle
type itempool extends handle
type race extends handle
type alliancetype extends handle
type racepreference extends handle
type gamestate extends handle
type igamestate extends gamestate
type fgamestate extends gamestate
type playerstate extends handle
type playerscore extends handle
type playergameresult extends handle
type unitstate extends handle
type aidifficulty extends handle
type eventid extends handle
type gameevent extends eventid
type playerevent extends eventid
type playerunitevent extends eventid
type unitevent extends eventid
type limitop extends eventid
type widgetevent extends eventid
type dialogevent extends eventid
type unittype extends handle
type gamespeed extends handle
type gamedifficulty extends handle
type gametype extends handle
type mapflag extends handle
type mapvisibility extends handle
type mapsetting extends handle
type mapdensity extends handle
type mapcontrol extends handle
type playerslotstate extends handle
type volumegroup extends handle
type camerafield extends handle
type camerasetup extends handle
type playercolor extends handle
type placement extends handle
type startlocprio extends handle
type raritycontrol extends handle
type blendmode extends handle
type texmapflags extends handle
type effect extends agent
type effecttype extends handle
type weathereffect extends handle
type terraindeformation extends handle
type fogstate extends handle
type fogmodifier extends agent
type dialog extends agent
type button extends agent
type quest extends agent
type questitem extends agent
type defeatcondition extends agent
type timerdialog extends agent
type leaderboard extends agent
type multiboard extends agent
type multiboarditem extends agent
type trackable extends agent
type gamecache extends agent
type version extends handle
type itemtype extends handle
type texttag extends handle
type attacktype extends handle
type damagetype extends handle
type weapontype extends handle
type soundtype extends handle
type lightning extends handle
type pathingtype extends handle
type mousebuttontype extends handle//war3 1.29
type animtype extends handle//war3 1.30 PTR
type subanimtype extends handle//war3 1.30 PTR
type image extends handle
type ubersplat extends handle
type hashtable extends agent
type framehandle extends handle//war3PTR1.31.0.11889
type originframetype extends handle//war3PTR1.31.0.11889
type framepointtype extends handle//war3PTR1.31.0.11889
type textaligntype extends handle//war3PTR1.31.0.11889
type frameeventtype extends handle//war3PTR1.31.0.11889
type oskeytype extends handle//war3PTR1.31.0.11889
type abilityintegerfield extends handle//war3PTR1.31.0.11889
type abilityrealfield extends handle//war3PTR1.31.0.11889
type abilitybooleanfield extends handle//war3PTR1.31.0.11889
type abilitystringfield extends handle//war3PTR1.31.0.11889
type abilityintegerlevelfield extends handle//war3PTR1.31.0.11889
type abilityreallevelfield extends handle//war3PTR1.31.0.11889
type abilitybooleanlevelfield extends handle//war3PTR1.31.0.11889
type abilitystringlevelfield extends handle//war3PTR1.31.0.11889
type abilityintegerlevelarrayfield extends handle//war3PTR1.31.0.11889
type abilityreallevelarrayfield extends handle//war3PTR1.31.0.11889
type abilitybooleanlevelarrayfield extends handle//war3PTR1.31.0.11889
type abilitystringlevelarrayfield extends handle//war3PTR1.31.0.11889
type unitintegerfield extends handle//war3PTR1.31.0.11889
type unitrealfield extends handle//war3PTR1.31.0.11889
type unitbooleanfield extends handle//war3PTR1.31.0.11889
type unitstringfield extends handle//war3PTR1.31.0.11889
type unitweaponintegerfield extends handle//war3PTR1.31.0.11889
type unitweaponrealfield extends handle//war3PTR1.31.0.11889
type unitweaponbooleanfield extends handle//war3PTR1.31.0.11889
type unitweaponstringfield extends handle//war3PTR1.31.0.11889
type itemintegerfield extends handle//war3PTR1.31.0.11889
type itemrealfield extends handle//war3PTR1.31.0.11889
type itembooleanfield extends handle//war3PTR1.31.0.11889
type itemstringfield extends handle//war3PTR1.31.0.11889
type movetype extends handle//war3PTR1.31.0.11889
type targetflag extends handle//war3PTR1.31.0.11889
type armortype extends handle//war3PTR1.31.0.11889
type heroattribute extends handle//war3PTR1.31.0.11889
type defensetype extends handle//war3PTR1.31.0.11889
type regentype extends handle//war3PTR1.31.0.11889
type unitcategory extends handle//war3PTR1.31.0.11889
type pathingflag extends handle//war3PTR1.31.0.11889
*/

function types(version:"1.32" | "1.31" | "1.30" | "1.29" | "1.24" | "1.20" | undefined | null = defaultVersion) {
  const types = [...baseType];
  if(!version) {
    version = "1.32";
  }
  if(version == "1.32") {
    types.push(...type_1_32, ...type_1_31, ...type_1_30, ...type_1_29, ...type_1_24, ...type_1_20);
  }
  else if(version == "1.31") {
    types.push( ...type_1_31, ...type_1_30, ...type_1_29, ...type_1_24, ...type_1_20);
  }
  else if(version == "1.30") {
    types.push( ...type_1_30, ...type_1_29, ...type_1_24, ...type_1_20);
  }
  else if(version == "1.29") {
    types.push(  ...type_1_29, ...type_1_24, ...type_1_20);
  }
  else if(version == "1.24") {
    types.push( ...type_1_24, ...type_1_20);
  }
  else if(version == "1.20") {
    types.push( ...type_1_20);
  }
  return types;
}

function isBaseType(type:string) {
  return baseType.includes(type);
}

function isType(type:string, version:"1.32" | "1.31" | "1.30" | "1.29" | "1.24" | "1.20" | undefined | null = defaultVersion) {
  return types(version).includes(type);
}

const Types = types();

export{
  Types,
  isType
}



