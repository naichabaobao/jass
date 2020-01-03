
class Type2 {
  public name:string = "nothing";
  public extends:Type2 = Type2.Nothing;
  public description: string = "";

  constructor(name?:string,extend?:Type2,description?:string){
    if(name){
      this.name = name;
    }
    if(extend){
      this.extends = extend;
    }
    if(description){
      this.description = description;
    }
  }

  public static readonly Nothing = new Type2("nothing", void 0, "");

  public static readonly Boolean = new Type2("boolean", void 0, "布尔");
  public static readonly Integer = new Type2("integer", void 0, "整数");
  public static readonly Real = new Type2("real", void 0, "实数");
  public static readonly String = new Type2("string", void 0, "字符串");
  public static readonly Code = new Type2("code", void 0, "代码");
  public static readonly Handle = new Type2("handle", void 0, "处理");

  public static readonly Agent = new Type2("handle", Type2.Handle, "中介(代理)");
public static readonly Event = new Type2("handle", Type2.Agent, "事件");
public static readonly Player = new Type2("handle", Type2.Agent, "玩家");
public static readonly Widget = new Type2("handle", Type2.Agent, "组件");
public static readonly Unit = new Type2("handle", Type2.Widget, "单位");
public static readonly Destructable = new Type2("handle", Type2.Widget, "可破坏物");
public static readonly Item = new Type2("handle", Type2.Widget, "物品");
public static readonly Ability = new Type2("handle", Type2.Agent, "技能");
public static readonly Buff = new Type2("handle", Type2.Ability, "魔法效果");
public static readonly Force = new Type2("handle", Type2.Agent, "势力");
public static readonly Group = new Type2("handle", Type2.Agent, "单位组");
public static readonly Trigger = new Type2("handle", Type2.Agent, "触发器");
public static readonly Triggercondition = new Type2("handle", Type2.Agent, "触发器条件");
public static readonly Triggeraction = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Timer = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Location = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Region = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Rect = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Boolexpr = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Sound = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Conditionfunc = new Type2("handle", Type2.Boolexpr, "未提供翻译");
public static readonly Filterfunc = new Type2("handle", Type2.Boolexpr, "未提供翻译");
public static readonly Unitpool = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itempool = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Race = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Alliancetype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Racepreference = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Gamestate = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Igamestate = new Type2("handle", Type2.Gamestate, "未提供翻译");
public static readonly Fgamestate = new Type2("handle", Type2.Gamestate, "未提供翻译");
public static readonly Playerstate = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Playerscore = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Playergameresult = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitstate = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Aidifficulty = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Eventid = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Gameevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Playerevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Playerunitevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Unitevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Limitop = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Widgetevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Dialogevent = new Type2("handle", Type2.Event, "未提供翻译");
public static readonly Unittype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Gamespeed = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Gamedifficulty = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Gametype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mapflag = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mapvisibility = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mapsetting = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mapdensity = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mapcontrol = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Playerslotstate = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Volumegroup = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Camerafield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Camerasetup = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Playercolor = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Placement = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Startlocprio = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Raritycontrol = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Blendmode = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Texmapflags = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Effect = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Effecttype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Weathereffect = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Terraindeformation = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Fogstate = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Fogmodifier = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Dialog = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Button = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Quest = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Questitem = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Defeatcondition = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Timerdialog = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Leaderboard = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Multiboard = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Multiboarditem = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Trackable = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Gamecache = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Version = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itemtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Texttag = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Attacktype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Damagetype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Weapontype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Soundtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Lightning = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Pathingtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Mousebuttontype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Animtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Subanimtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Image = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Ubersplat = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Hashtable = new Type2("handle", Type2.Agent, "未提供翻译");
public static readonly Framehandle = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Originframetype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Framepointtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Textaligntype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Frameeventtype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Oskeytype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityintegerfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityrealfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitybooleanfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitystringfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityintegerlevelfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityreallevelfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitybooleanlevelfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitystringlevelfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityintegerlevelarrayfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilityreallevelarrayfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitybooleanlevelarrayfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Abilitystringlevelarrayfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitintegerfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitrealfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitbooleanfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitstringfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitweaponintegerfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitweaponrealfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitweaponbooleanfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitweaponstringfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itemintegerfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itemrealfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itembooleanfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Itemstringfield = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Movetype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Targetflag = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Armortype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Heroattribute = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Defensetype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Regentype = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Unitcategory = new Type2("handle", Type2.Handle, "未提供翻译");
public static readonly Pathingflag = new Type2("handle", Type2.Handle, "未提供翻译");

  public static readonly Types = [Type2.Agent,Type2.Event,Type2.Player,Type2.Widget,Type2.Unit,Type2.Destructable,Type2.Item,Type2.Ability,Type2.Buff,Type2.Force,Type2.Group,Type2.Trigger,Type2.Triggercondition,Type2.Triggeraction,Type2.Timer,Type2.Location,Type2.Region,Type2.Rect,Type2.Boolexpr,Type2.Sound,Type2.Conditionfunc,Type2.Filterfunc,Type2.Unitpool,Type2.Itempool,Type2.Race,Type2.Alliancetype,Type2.Racepreference,Type2.Gamestate,Type2.Igamestate,Type2.Fgamestate,Type2.Playerstate,Type2.Playerscore,Type2.Playergameresult,Type2.Unitstate,Type2.Aidifficulty,Type2.Eventid,Type2.Gameevent,Type2.Playerevent,Type2.Playerunitevent,Type2.Unitevent,Type2.Limitop,Type2.Widgetevent,Type2.Dialogevent,Type2.Unittype,Type2.Gamespeed,Type2.Gamedifficulty,Type2.Gametype,Type2.Mapflag,Type2.Mapvisibility,Type2.Mapsetting,Type2.Mapdensity,Type2.Mapcontrol,Type2.Playerslotstate,Type2.Volumegroup,Type2.Camerafield,Type2.Camerasetup,Type2.Playercolor,Type2.Placement,Type2.Startlocprio,Type2.Raritycontrol,Type2.Blendmode,Type2.Texmapflags,Type2.Effect,Type2.Effecttype,Type2.Weathereffect,Type2.Terraindeformation,Type2.Fogstate,Type2.Fogmodifier,Type2.Dialog,Type2.Button,Type2.Quest,Type2.Questitem,Type2.Defeatcondition,Type2.Timerdialog,Type2.Leaderboard,Type2.Multiboard,Type2.Multiboarditem,Type2.Trackable,Type2.Gamecache,Type2.Version,Type2.Itemtype,Type2.Texttag,Type2.Attacktype,Type2.Damagetype,Type2.Weapontype,Type2.Soundtype,Type2.Lightning,Type2.Pathingtype,Type2.Mousebuttontype,Type2.Animtype,Type2.Subanimtype,Type2.Image,Type2.Ubersplat,Type2.Hashtable,Type2.Framehandle,Type2.Originframetype,Type2.Framepointtype,Type2.Textaligntype,Type2.Frameeventtype,Type2.Oskeytype,Type2.Abilityintegerfield,Type2.Abilityrealfield,Type2.Abilitybooleanfield,Type2.Abilitystringfield,Type2.Abilityintegerlevelfield,Type2.Abilityreallevelfield,Type2.Abilitybooleanlevelfield,Type2.Abilitystringlevelfield,Type2.Abilityintegerlevelarrayfield,Type2.Abilityreallevelarrayfield,Type2.Abilitybooleanlevelarrayfield,Type2.Abilitystringlevelarrayfield,Type2.Unitintegerfield,Type2.Unitrealfield,Type2.Unitbooleanfield,Type2.Unitstringfield,Type2.Unitweaponintegerfield,Type2.Unitweaponrealfield,Type2.Unitweaponbooleanfield,Type2.Unitweaponstringfield,Type2.Itemintegerfield,Type2.Itemrealfield,Type2.Itembooleanfield,Type2.Itemstringfield,Type2.Movetype,Type2.Targetflag,Type2.Armortype,Type2.Heroattribute,Type2.Defensetype,Type2.Regentype,Type2.Unitcategory,Type2.Pathingflag];

public static readonly AllTypes = [Type2.Boolean,Type2.Integer,Type2.Real,Type2.String,Type2.Code,Type2.Handle,...Type2.Types];
public static readonly StatementTypes = [Type2.Boolean,Type2.Integer,Type2.Real,Type2.String,Type2.Handle,...Type2.Types];
public static readonly TakesTypes = [Type2.Boolean,Type2.Integer,Type2.Real,Type2.String,Type2.Code,Type2.Handle,...Type2.Types];

}
