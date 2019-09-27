const BaseType = [
  "integer", "real", "string", "boolean", "handle",];

// 1.31 type
const NewType = ["mousebuttontype", "animtype", "subanimtype", "framehandle", "originframetype", "framepointtype", "textaligntype", "frameeventtype", "oskeytype", "abilityintegerfield", "abilityrealfield", "abilitybooleanfield", "abilitystringfield", "abilityintegerlevelfield", "abilityreallevelfield", "abilitybooleanlevelfield", "abilitystringlevelfield", "abilityintegerlevelarrayfield", "abilityreallevelarrayfield", "abilitybooleanlevelarrayfield", "abilitystringlevelarrayfield", "unitintegerfield", "unitrealfield", "unitbooleanfield", "unitstringfield", "unitweaponintegerfield", "unitweaponrealfield", "unitweaponbooleanfield", "unitweaponstringfield", "itemintegerfield", "itemrealfield", "itembooleanfield", "itemstringfield", "movetype", "targetflag", "armortype", "heroattribute", "defensetype", "regentype", "unitcategory", "pathingflag"];

const Type = [
  "agent", "event", "player", "widget", "unit", "destructable", "item", "ability", "buff", "force", "group", "trigger", "triggercondition", "triggeraction", "timer", "location", "region", "rect", "boolexpr", "sound", "conditionfunc", "filterfunc", "unitpool", "itempool", "race", "alliancetype", "racepreference", "gamestate", "igamestate", "fgamestate", "playerstate", "playerscore", "playergameresult", "unitstate", "aidifficulty", "eventid", "gameevent", "playerevent", "playerunitevent", "unitevent", "limitop", "widgetevent", "dialogevent", "unittype", "gamespeed", "gamedifficulty", "gametype", "mapflag", "mapvisibility", "mapsetting", "mapdensity", "mapcontrol", "playerslotstate", "volumegroup", "camerafield", "camerasetup", "playercolor", "placement", "startlocprio", "raritycontrol", "blendmode", "texmapflags", "effect", "effecttype", "weathereffect", "terraindeformation", "fogstate", "fogmodifier", "dialog", "button", "quest", "questitem", "defeatcondition", "timerdialog", "leaderboard", "multiboard", "multiboarditem", "trackable", "gamecache", "version", "itemtype", "texttag", "attacktype", "damagetype", "weapontype", "soundtype", "lightning", "pathingtype", "image", "ubersplat", "hashtable", ...NewType];



const ParamenterType = [...BaseType, "code", ...Type];
const StatementType = [...BaseType, ...Type];

module.exports = {
  BaseType, ParamenterType, Type, StatementType, NewType
}