
export class Type {
  public name: string = "nothing";
  public extends?: Type = undefined;
  public description: string = "";

  public origin(): string { return `type ${this.name} extends ${this.extends?.name ?? "unkown"}` }

  constructor(name?: string, extend?: Type, description?: string) {
    if (name) {
      this.name = name;
    }
    if (extend) {
      this.extends = extend;
    }
    if (description) {
      this.description = description;
    }
  }

  public static readonly nothing = new Type("nothing", void 0, "");

  public static readonly boolean = new Type("boolean", void 0, "布尔");
  public static readonly integer = new Type("integer", void 0, "整数");
  public static readonly real = new Type("real", void 0, "实数");
  public static readonly string = new Type("string", void 0, "字符串");
  public static readonly code = new Type("code", void 0, "代码");
  public static readonly handle = new Type("handle", void 0, "处理");

  public static readonly agent = new Type("agent", Type.handle, "中介(代理)");
  public static readonly event = new Type("event", Type.agent, "事件");
  public static readonly player = new Type("player", Type.agent, "玩家");
  public static readonly widget = new Type("widget", Type.agent, "组件");
  public static readonly unit = new Type("unit", Type.widget, "单位");
  public static readonly destructable = new Type("destructable", Type.widget, "可破坏物");
  public static readonly item = new Type("item", Type.widget, "物品");
  public static readonly ability = new Type("ability", Type.agent, "技能");
  public static readonly buff = new Type("buff", Type.ability, "魔法效果");
  public static readonly force = new Type("force", Type.agent, "势力");
  public static readonly group = new Type("group", Type.agent, "单位组");
  public static readonly trigger = new Type("trigger", Type.agent, "触发器");
  public static readonly triggercondition = new Type("triggercondition", Type.agent, "触发器条件");
  public static readonly triggeraction = new Type("triggeraction", Type.handle, "未提供翻译");
  public static readonly timer = new Type("timer", Type.agent, "未提供翻译");
  public static readonly location = new Type("location", Type.agent, "未提供翻译");
  public static readonly region = new Type("region", Type.agent, "未提供翻译");
  public static readonly rect = new Type("rect", Type.agent, "未提供翻译");
  public static readonly boolexpr = new Type("boolexpr", Type.agent, "未提供翻译");
  public static readonly sound = new Type("sound", Type.agent, "未提供翻译");
  public static readonly conditionfunc = new Type("conditionfunc", Type.boolexpr, "未提供翻译");
  public static readonly filterfunc = new Type("filterfunc", Type.boolexpr, "未提供翻译");
  public static readonly unitpool = new Type("unitpool", Type.handle, "未提供翻译");
  public static readonly itempool = new Type("itempool", Type.handle, "未提供翻译");
  public static readonly race = new Type("race", Type.handle, "未提供翻译");
  public static readonly alliancetype = new Type("alliancetype", Type.handle, "未提供翻译");
  public static readonly racepreference = new Type("racepreference", Type.handle, "未提供翻译");
  public static readonly gamestate = new Type("gamestate", Type.handle, "未提供翻译");
  public static readonly igamestate = new Type("igamestate", Type.gamestate, "未提供翻译");
  public static readonly fgamestate = new Type("fgamestate", Type.gamestate, "未提供翻译");
  public static readonly playerstate = new Type("playerstate", Type.handle, "未提供翻译");
  public static readonly playerscore = new Type("playerscore", Type.handle, "未提供翻译");
  public static readonly playergameresult = new Type("playergameresult", Type.handle, "未提供翻译");
  public static readonly unitstate = new Type("unitstate", Type.handle, "未提供翻译");
  public static readonly aidifficulty = new Type("aidifficulty", Type.handle, "未提供翻译");
  public static readonly eventid = new Type("eventid", Type.handle, "未提供翻译");
  public static readonly gameevent = new Type("gameevent", Type.event, "未提供翻译");
  public static readonly playerevent = new Type("playerevent", Type.event, "未提供翻译");
  public static readonly playerunitevent = new Type("playerunitevent", Type.event, "未提供翻译");
  public static readonly unitevent = new Type("unitevent", Type.event, "未提供翻译");
  public static readonly limitop = new Type("limitop", Type.event, "未提供翻译");
  public static readonly widgetevent = new Type("widgetevent", Type.event, "未提供翻译");
  public static readonly dialogevent = new Type("dialogevent", Type.event, "未提供翻译");
  public static readonly unittype = new Type("unittype", Type.handle, "未提供翻译");
  public static readonly gamespeed = new Type("gamespeed", Type.handle, "未提供翻译");
  public static readonly gamedifficulty = new Type("gamedifficulty", Type.handle, "未提供翻译");
  public static readonly gametype = new Type("gametype", Type.handle, "未提供翻译");
  public static readonly mapflag = new Type("mapflag", Type.handle, "未提供翻译");
  public static readonly mapvisibility = new Type("mapvisibility", Type.handle, "未提供翻译");
  public static readonly mapsetting = new Type("mapsetting", Type.handle, "未提供翻译");
  public static readonly mapdensity = new Type("mapdensity", Type.handle, "未提供翻译");
  public static readonly mapcontrol = new Type("mapcontrol", Type.handle, "未提供翻译");
  public static readonly playerslotstate = new Type("playerslotstate", Type.handle, "未提供翻译");
  public static readonly volumegroup = new Type("volumegroup", Type.handle, "未提供翻译");
  public static readonly camerafield = new Type("camerafield", Type.handle, "未提供翻译");
  public static readonly camerasetup = new Type("camerasetup", Type.handle, "未提供翻译");
  public static readonly playercolor = new Type("playercolor", Type.handle, "未提供翻译");
  public static readonly placement = new Type("placement", Type.handle, "未提供翻译");
  public static readonly startlocprio = new Type("startlocprio", Type.handle, "未提供翻译");
  public static readonly raritycontrol = new Type("raritycontrol", Type.handle, "未提供翻译");
  public static readonly blendmode = new Type("blendmode", Type.handle, "未提供翻译");
  public static readonly texmapflags = new Type("texmapflags", Type.handle, "未提供翻译");
  public static readonly effect = new Type("effect", Type.agent, "未提供翻译");
  public static readonly effecttype = new Type("effecttype", Type.handle, "未提供翻译");
  public static readonly weathereffect = new Type("weathereffect", Type.handle, "未提供翻译");
  public static readonly terraindeformation = new Type("terraindeformation", Type.handle, "未提供翻译");
  public static readonly fogstate = new Type("fogstate", Type.handle, "未提供翻译");
  public static readonly fogmodifier = new Type("fogmodifier", Type.agent, "未提供翻译");
  public static readonly dialog = new Type("dialog", Type.agent, "未提供翻译");
  public static readonly button = new Type("button", Type.agent, "未提供翻译");
  public static readonly quest = new Type("quest", Type.agent, "未提供翻译");
  public static readonly questitem = new Type("questitem", Type.agent, "未提供翻译");
  public static readonly defeatcondition = new Type("defeatcondition", Type.agent, "未提供翻译");
  public static readonly timerdialog = new Type("timerdialog", Type.agent, "未提供翻译");
  public static readonly leaderboard = new Type("leaderboard", Type.agent, "未提供翻译");
  public static readonly multiboard = new Type("multiboard", Type.agent, "未提供翻译");
  public static readonly multiboarditem = new Type("multiboarditem", Type.agent, "未提供翻译");
  public static readonly trackable = new Type("trackable", Type.agent, "未提供翻译");
  public static readonly gamecache = new Type("gamecache", Type.agent, "未提供翻译");
  public static readonly version = new Type("version", Type.handle, "未提供翻译");
  public static readonly itemtype = new Type("itemtype", Type.handle, "未提供翻译");
  public static readonly texttag = new Type("texttag", Type.handle, "未提供翻译");
  public static readonly attacktype = new Type("attacktype", Type.handle, "未提供翻译");
  public static readonly damagetype = new Type("damagetype", Type.handle, "未提供翻译");
  public static readonly weapontype = new Type("weapontype", Type.handle, "未提供翻译");
  public static readonly soundtype = new Type("soundtype", Type.handle, "未提供翻译");
  public static readonly lightning = new Type("lightning", Type.handle, "未提供翻译");
  public static readonly pathingtype = new Type("pathingtype", Type.handle, "未提供翻译");
  public static readonly mousebuttontype = new Type("mousebuttontype", Type.handle, "未提供翻译");
  public static readonly animtype = new Type("animtype", Type.handle, "未提供翻译");
  public static readonly subanimtype = new Type("subanimtype", Type.handle, "未提供翻译");
  public static readonly image = new Type("image", Type.handle, "未提供翻译");
  public static readonly ubersplat = new Type("ubersplat", Type.handle, "未提供翻译");
  public static readonly hashtable = new Type("hashtable", Type.agent, "未提供翻译");
  public static readonly framehandle = new Type("framehandle", Type.handle, "未提供翻译");
  public static readonly originframetype = new Type("originframetype", Type.handle, "未提供翻译");
  public static readonly framepointtype = new Type("framepointtype", Type.handle, "未提供翻译");
  public static readonly textaligntype = new Type("textaligntype", Type.handle, "未提供翻译");
  public static readonly frameeventtype = new Type("frameeventtype", Type.handle, "未提供翻译");
  public static readonly oskeytype = new Type("oskeytype", Type.handle, "未提供翻译");
  public static readonly abilityintegerfield = new Type("abilityintegerfield", Type.handle, "未提供翻译");
  public static readonly abilityrealfield = new Type("abilityrealfield", Type.handle, "未提供翻译");
  public static readonly abilitybooleanfield = new Type("abilitybooleanfield", Type.handle, "未提供翻译");
  public static readonly abilitystringfield = new Type("abilitystringfield", Type.handle, "未提供翻译");
  public static readonly abilityintegerlevelfield = new Type("abilityintegerlevelfield", Type.handle, "未提供翻译");
  public static readonly abilityreallevelfield = new Type("abilityreallevelfield", Type.handle, "未提供翻译");
  public static readonly abilitybooleanlevelfield = new Type("abilitybooleanlevelfield", Type.handle, "未提供翻译");
  public static readonly abilitystringlevelfield = new Type("abilitystringlevelfield", Type.handle, "未提供翻译");
  public static readonly abilityintegerlevelarrayfield = new Type("abilityintegerlevelarrayfield", Type.handle, "未提供翻译");
  public static readonly abilityreallevelarrayfield = new Type("abilityreallevelarrayfield", Type.handle, "未提供翻译");
  public static readonly abilitybooleanlevelarrayfield = new Type("abilitybooleanlevelarrayfield", Type.handle, "未提供翻译");
  public static readonly abilitystringlevelarrayfield = new Type("abilitystringlevelarrayfield", Type.handle, "未提供翻译");
  public static readonly unitintegerfield = new Type("unitintegerfield", Type.handle, "未提供翻译");
  public static readonly unitrealfield = new Type("unitrealfield", Type.handle, "未提供翻译");
  public static readonly unitbooleanfield = new Type("unitbooleanfield", Type.handle, "未提供翻译");
  public static readonly unitstringfield = new Type("unitstringfield", Type.handle, "未提供翻译");
  public static readonly unitweaponintegerfield = new Type("unitweaponintegerfield", Type.handle, "未提供翻译");
  public static readonly unitweaponrealfield = new Type("unitweaponrealfield", Type.handle, "未提供翻译");
  public static readonly unitweaponbooleanfield = new Type("unitweaponbooleanfield", Type.handle, "未提供翻译");
  public static readonly unitweaponstringfield = new Type("unitweaponstringfield", Type.handle, "未提供翻译");
  public static readonly itemintegerfield = new Type("itemintegerfield", Type.handle, "未提供翻译");
  public static readonly itemrealfield = new Type("itemrealfield", Type.handle, "未提供翻译");
  public static readonly itembooleanfield = new Type("itembooleanfield", Type.handle, "未提供翻译");
  public static readonly itemstringfield = new Type("itemstringfield", Type.handle, "未提供翻译");
  public static readonly movetype = new Type("movetype", Type.handle, "未提供翻译");
  public static readonly targetflag = new Type("targetflag", Type.handle, "未提供翻译");
  public static readonly armortype = new Type("armortype", Type.handle, "未提供翻译");
  public static readonly heroattribute = new Type("heroattribute", Type.handle, "未提供翻译");
  public static readonly defensetype = new Type("defensetype", Type.handle, "未提供翻译");
  public static readonly regentype = new Type("regentype", Type.handle, "未提供翻译");
  public static readonly unitcategory = new Type("unitcategory", Type.handle, "未提供翻译");
  public static readonly pathingflag = new Type("pathingflag", Type.handle, "未提供翻译");

  public static readonly Bases = [Type.boolean, Type.integer, Type.real, Type.string, Type.code, Type.handle];

  public static readonly Types = [Type.agent, Type.event, Type.player, Type.widget, Type.unit, Type.destructable, Type.item, Type.ability, Type.buff, Type.force, Type.group, Type.trigger, Type.triggercondition, Type.triggeraction, Type.timer, Type.location, Type.region, Type.rect, Type.boolexpr, Type.sound, Type.conditionfunc, Type.filterfunc, Type.unitpool, Type.itempool, Type.race, Type.alliancetype, Type.racepreference, Type.gamestate, Type.igamestate, Type.fgamestate, Type.playerstate, Type.playerscore, Type.playergameresult, Type.unitstate, Type.aidifficulty, Type.eventid, Type.gameevent, Type.playerevent, Type.playerunitevent, Type.unitevent, Type.limitop, Type.widgetevent, Type.dialogevent, Type.unittype, Type.gamespeed, Type.gamedifficulty, Type.gametype, Type.mapflag, Type.mapvisibility, Type.mapsetting, Type.mapdensity, Type.mapcontrol, Type.playerslotstate, Type.volumegroup, Type.camerafield, Type.camerasetup, Type.playercolor, Type.placement, Type.startlocprio, Type.raritycontrol, Type.blendmode, Type.texmapflags, Type.effect, Type.effecttype, Type.weathereffect, Type.terraindeformation, Type.fogstate, Type.fogmodifier, Type.dialog, Type.button, Type.quest, Type.questitem, Type.defeatcondition, Type.timerdialog, Type.leaderboard, Type.multiboard, Type.multiboarditem, Type.trackable, Type.gamecache, Type.version, Type.itemtype, Type.texttag, Type.attacktype, Type.damagetype, Type.weapontype, Type.soundtype, Type.lightning, Type.pathingtype, Type.mousebuttontype, Type.animtype, Type.subanimtype, Type.image, Type.ubersplat, Type.hashtable, Type.framehandle, Type.originframetype, Type.framepointtype, Type.textaligntype, Type.frameeventtype, Type.oskeytype, Type.abilityintegerfield, Type.abilityrealfield, Type.abilitybooleanfield, Type.abilitystringfield, Type.abilityintegerlevelfield, Type.abilityreallevelfield, Type.abilitybooleanlevelfield, Type.abilitystringlevelfield, Type.abilityintegerlevelarrayfield, Type.abilityreallevelarrayfield, Type.abilitybooleanlevelarrayfield, Type.abilitystringlevelarrayfield, Type.unitintegerfield, Type.unitrealfield, Type.unitbooleanfield, Type.unitstringfield, Type.unitweaponintegerfield, Type.unitweaponrealfield, Type.unitweaponbooleanfield, Type.unitweaponstringfield, Type.itemintegerfield, Type.itemrealfield, Type.itembooleanfield, Type.itemstringfield, Type.movetype, Type.targetflag, Type.armortype, Type.heroattribute, Type.defensetype, Type.regentype, Type.unitcategory, Type.pathingflag];

  public static readonly AllTypes = [...Type.Bases, ...Type.Types];
  public static readonly StatementTypes = [Type.boolean, Type.integer, Type.real, Type.string, Type.handle, ...Type.Types];
  public static readonly TakesTypes = Type.AllTypes;

  public static getType(typeName: string): Type {
    return Type.StatementTypes.find(type => type.name == typeName) ?? Type.nothing;
  }

}

