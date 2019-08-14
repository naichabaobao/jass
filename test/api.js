var commonJ = `
type agent			 extends handle 
type event extends agent 
type player extends agent 
type widget extends agent 
type unit extends widget 
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
type mousebuttontype extends handle
type image extends handle
type ubersplat extends handle
type hashtable extends agent

constant native ConvertRace takes integer i returns race
constant native ConvertAllianceType takes integer i returns alliancetype
constant native ConvertRacePref takes integer i returns racepreference
constant native ConvertIGameState takes integer i returns igamestate
constant native ConvertFGameState takes integer i returns fgamestate
constant native ConvertPlayerState takes integer i returns playerstate
constant native ConvertPlayerScore takes integer i returns playerscore
constant native ConvertPlayerGameResult takes integer i returns playergameresult
constant native ConvertUnitState takes integer i returns unitstate
constant native ConvertAIDifficulty takes integer i returns aidifficulty
constant native ConvertGameEvent takes integer i returns gameevent
constant native ConvertPlayerEvent takes integer i returns playerevent
constant native ConvertPlayerUnitEvent takes integer i returns playerunitevent
constant native ConvertWidgetEvent takes integer i returns widgetevent
constant native ConvertDialogEvent takes integer i returns dialogevent
constant native ConvertUnitEvent takes integer i returns unitevent
constant native ConvertLimitOp takes integer i returns limitop
constant native ConvertUnitType takes integer i returns unittype
constant native ConvertGameSpeed takes integer i returns gamespeed
constant native ConvertPlacement takes integer i returns placement
constant native ConvertStartLocPrio takes integer i returns startlocprio
constant native ConvertGameDifficulty takes integer i returns gamedifficulty
constant native ConvertGameType takes integer i returns gametype
constant native ConvertMapFlag takes integer i returns mapflag
constant native ConvertMapVisibility takes integer i returns mapvisibility
constant native ConvertMapSetting takes integer i returns mapsetting
constant native ConvertMapDensity takes integer i returns mapdensity
constant native ConvertMapControl takes integer i returns mapcontrol
constant native ConvertPlayerColor takes integer i returns playercolor
constant native ConvertPlayerSlotState takes integer i returns playerslotstate
constant native ConvertVolumeGroup takes integer i returns volumegroup
constant native ConvertCameraField takes integer i returns camerafield
constant native ConvertBlendMode takes integer i returns blendmode
constant native ConvertRarityControl takes integer i returns raritycontrol
constant native ConvertTexMapFlags takes integer i returns texmapflags
constant native ConvertFogState takes integer i returns fogstate
constant native ConvertEffectType takes integer i returns effecttype
constant native ConvertVersion takes integer i returns version
constant native ConvertItemType takes integer i returns itemtype
constant native ConvertAttackType takes integer i returns attacktype
constant native ConvertDamageType takes integer i returns damagetype
constant native ConvertWeaponType takes integer i returns weapontype
constant native ConvertSoundType takes integer i returns soundtype
constant native ConvertPathingType takes integer i returns pathingtype
constant native ConvertMouseButtonType takes integer i returns mousebuttontype

constant native OrderId takes string orderIdString returns integer
constant native OrderId2String takes integer orderId returns string
constant native UnitId takes string unitIdString returns integer
constant native UnitId2String takes integer unitId returns string


constant native AbilityId takes string abilityIdString returns integer
constant native AbilityId2String takes integer abilityId returns string


constant native GetObjectName takes integer objectId returns string

constant native GetBJMaxPlayers takes nothing returns integer
constant native GetBJPlayerNeutralVictim takes nothing returns integer
constant native GetBJPlayerNeutralExtra takes nothing returns integer
constant native GetBJMaxPlayerSlots takes nothing returns integer
constant native GetPlayerNeutralPassive takes nothing returns integer
constant native GetPlayerNeutralAggressive takes nothing returns integer

globals





 
 constant boolean FALSE = false
 constant boolean TRUE = true
 constant integer JASS_MAX_ARRAY_SIZE = 32768

 constant integer PLAYER_NEUTRAL_PASSIVE = GetPlayerNeutralPassive()
 constant integer PLAYER_NEUTRAL_AGGRESSIVE = GetPlayerNeutralAggressive()

 constant playercolor PLAYER_COLOR_RED = ConvertPlayerColor(0)
 constant playercolor PLAYER_COLOR_BLUE = ConvertPlayerColor(1)
 constant playercolor PLAYER_COLOR_CYAN = ConvertPlayerColor(2)
 constant playercolor PLAYER_COLOR_PURPLE = ConvertPlayerColor(3)
 constant playercolor PLAYER_COLOR_YELLOW = ConvertPlayerColor(4)
 constant playercolor PLAYER_COLOR_ORANGE = ConvertPlayerColor(5)
 constant playercolor PLAYER_COLOR_GREEN = ConvertPlayerColor(6)
 constant playercolor PLAYER_COLOR_PINK = ConvertPlayerColor(7)
 constant playercolor PLAYER_COLOR_LIGHT_GRAY = ConvertPlayerColor(8)
 constant playercolor PLAYER_COLOR_LIGHT_BLUE = ConvertPlayerColor(9)
 constant playercolor PLAYER_COLOR_AQUA = ConvertPlayerColor(10)
 constant playercolor PLAYER_COLOR_BROWN = ConvertPlayerColor(11)
 constant playercolor PLAYER_COLOR_MAROON = ConvertPlayerColor(12)
 constant playercolor PLAYER_COLOR_NAVY = ConvertPlayerColor(13)
 constant playercolor PLAYER_COLOR_TURQUOISE = ConvertPlayerColor(14)
 constant playercolor PLAYER_COLOR_VIOLET = ConvertPlayerColor(15)
 constant playercolor PLAYER_COLOR_WHEAT = ConvertPlayerColor(16)
 constant playercolor PLAYER_COLOR_PEACH = ConvertPlayerColor(17)
 constant playercolor PLAYER_COLOR_MINT = ConvertPlayerColor(18)
 constant playercolor PLAYER_COLOR_LAVENDER = ConvertPlayerColor(19)
 constant playercolor PLAYER_COLOR_COAL = ConvertPlayerColor(20)
 constant playercolor PLAYER_COLOR_SNOW = ConvertPlayerColor(21)
 constant playercolor PLAYER_COLOR_EMERALD = ConvertPlayerColor(22)
 constant playercolor PLAYER_COLOR_PEANUT = ConvertPlayerColor(23)

 constant race RACE_HUMAN = ConvertRace(1)
 constant race RACE_ORC = ConvertRace(2)
 constant race RACE_UNDEAD = ConvertRace(3)
 constant race RACE_NIGHTELF = ConvertRace(4)
 constant race RACE_DEMON = ConvertRace(5)
 constant race RACE_OTHER = ConvertRace(7)

 constant playergameresult PLAYER_GAME_RESULT_VICTORY = ConvertPlayerGameResult(0)
 constant playergameresult PLAYER_GAME_RESULT_DEFEAT = ConvertPlayerGameResult(1)
 constant playergameresult PLAYER_GAME_RESULT_TIE = ConvertPlayerGameResult(2)
 constant playergameresult PLAYER_GAME_RESULT_NEUTRAL = ConvertPlayerGameResult(3)

 constant alliancetype ALLIANCE_PASSIVE = ConvertAllianceType(0)
 constant alliancetype ALLIANCE_HELP_REQUEST = ConvertAllianceType(1)
 constant alliancetype ALLIANCE_HELP_RESPONSE = ConvertAllianceType(2)
 constant alliancetype ALLIANCE_SHARED_XP = ConvertAllianceType(3)
 constant alliancetype ALLIANCE_SHARED_SPELLS = ConvertAllianceType(4)
 constant alliancetype ALLIANCE_SHARED_VISION = ConvertAllianceType(5)
 constant alliancetype ALLIANCE_SHARED_CONTROL = ConvertAllianceType(6)
 constant alliancetype ALLIANCE_SHARED_ADVANCED_CONTROL= ConvertAllianceType(7)
 constant alliancetype ALLIANCE_RESCUABLE = ConvertAllianceType(8)
 constant alliancetype ALLIANCE_SHARED_VISION_FORCED = ConvertAllianceType(9)

 constant version VERSION_REIGN_OF_CHAOS = ConvertVersion(0)
 constant version VERSION_FROZEN_THRONE = ConvertVersion(1)

 constant attacktype ATTACK_TYPE_NORMAL = ConvertAttackType(0)
 constant attacktype ATTACK_TYPE_MELEE = ConvertAttackType(1)
 constant attacktype ATTACK_TYPE_PIERCE = ConvertAttackType(2)
 constant attacktype ATTACK_TYPE_SIEGE = ConvertAttackType(3)
 constant attacktype ATTACK_TYPE_MAGIC = ConvertAttackType(4)
 constant attacktype ATTACK_TYPE_CHAOS = ConvertAttackType(5)
 constant attacktype ATTACK_TYPE_HERO = ConvertAttackType(6)

 constant damagetype DAMAGE_TYPE_UNKNOWN = ConvertDamageType(0)
 constant damagetype DAMAGE_TYPE_NORMAL = ConvertDamageType(4)
 constant damagetype DAMAGE_TYPE_ENHANCED = ConvertDamageType(5)
 constant damagetype DAMAGE_TYPE_FIRE = ConvertDamageType(8)
 constant damagetype DAMAGE_TYPE_COLD = ConvertDamageType(9)
 constant damagetype DAMAGE_TYPE_LIGHTNING = ConvertDamageType(10)
 constant damagetype DAMAGE_TYPE_POISON = ConvertDamageType(11)
 constant damagetype DAMAGE_TYPE_DISEASE = ConvertDamageType(12)
 constant damagetype DAMAGE_TYPE_DIVINE = ConvertDamageType(13)
 constant damagetype DAMAGE_TYPE_MAGIC = ConvertDamageType(14)
 constant damagetype DAMAGE_TYPE_SONIC = ConvertDamageType(15)
 constant damagetype DAMAGE_TYPE_ACID = ConvertDamageType(16)
 constant damagetype DAMAGE_TYPE_FORCE = ConvertDamageType(17)
 constant damagetype DAMAGE_TYPE_DEATH = ConvertDamageType(18)
 constant damagetype DAMAGE_TYPE_MIND = ConvertDamageType(19)
 constant damagetype DAMAGE_TYPE_PLANT = ConvertDamageType(20)
 constant damagetype DAMAGE_TYPE_DEFENSIVE = ConvertDamageType(21)
 constant damagetype DAMAGE_TYPE_DEMOLITION = ConvertDamageType(22)
 constant damagetype DAMAGE_TYPE_SLOW_POISON = ConvertDamageType(23)
 constant damagetype DAMAGE_TYPE_SPIRIT_LINK = ConvertDamageType(24)
 constant damagetype DAMAGE_TYPE_SHADOW_STRIKE = ConvertDamageType(25)
 constant damagetype DAMAGE_TYPE_UNIVERSAL = ConvertDamageType(26)

 constant weapontype WEAPON_TYPE_WHOKNOWS = ConvertWeaponType(0)
 constant weapontype WEAPON_TYPE_METAL_LIGHT_CHOP = ConvertWeaponType(1)
 constant weapontype WEAPON_TYPE_METAL_MEDIUM_CHOP = ConvertWeaponType(2)
 constant weapontype WEAPON_TYPE_METAL_HEAVY_CHOP = ConvertWeaponType(3)
 constant weapontype WEAPON_TYPE_METAL_LIGHT_SLICE = ConvertWeaponType(4)
 constant weapontype WEAPON_TYPE_METAL_MEDIUM_SLICE = ConvertWeaponType(5)
 constant weapontype WEAPON_TYPE_METAL_HEAVY_SLICE = ConvertWeaponType(6)
 constant weapontype WEAPON_TYPE_METAL_MEDIUM_BASH = ConvertWeaponType(7)
 constant weapontype WEAPON_TYPE_METAL_HEAVY_BASH = ConvertWeaponType(8)
 constant weapontype WEAPON_TYPE_METAL_MEDIUM_STAB = ConvertWeaponType(9)
 constant weapontype WEAPON_TYPE_METAL_HEAVY_STAB = ConvertWeaponType(10)
 constant weapontype WEAPON_TYPE_WOOD_LIGHT_SLICE = ConvertWeaponType(11)
 constant weapontype WEAPON_TYPE_WOOD_MEDIUM_SLICE = ConvertWeaponType(12)
 constant weapontype WEAPON_TYPE_WOOD_HEAVY_SLICE = ConvertWeaponType(13)
 constant weapontype WEAPON_TYPE_WOOD_LIGHT_BASH = ConvertWeaponType(14)
 constant weapontype WEAPON_TYPE_WOOD_MEDIUM_BASH = ConvertWeaponType(15)
 constant weapontype WEAPON_TYPE_WOOD_HEAVY_BASH = ConvertWeaponType(16)
 constant weapontype WEAPON_TYPE_WOOD_LIGHT_STAB = ConvertWeaponType(17)
 constant weapontype WEAPON_TYPE_WOOD_MEDIUM_STAB = ConvertWeaponType(18)
 constant weapontype WEAPON_TYPE_CLAW_LIGHT_SLICE = ConvertWeaponType(19)
 constant weapontype WEAPON_TYPE_CLAW_MEDIUM_SLICE = ConvertWeaponType(20)
 constant weapontype WEAPON_TYPE_CLAW_HEAVY_SLICE = ConvertWeaponType(21)
 constant weapontype WEAPON_TYPE_AXE_MEDIUM_CHOP = ConvertWeaponType(22)
 constant weapontype WEAPON_TYPE_ROCK_HEAVY_BASH = ConvertWeaponType(23)

 constant pathingtype PATHING_TYPE_ANY = ConvertPathingType(0)
 constant pathingtype PATHING_TYPE_WALKABILITY = ConvertPathingType(1)
 constant pathingtype PATHING_TYPE_FLYABILITY = ConvertPathingType(2)
 constant pathingtype PATHING_TYPE_BUILDABILITY = ConvertPathingType(3)
 constant pathingtype PATHING_TYPE_PEONHARVESTPATHING = ConvertPathingType(4)
 constant pathingtype PATHING_TYPE_BLIGHTPATHING = ConvertPathingType(5)
 constant pathingtype PATHING_TYPE_FLOATABILITY = ConvertPathingType(6)
 constant pathingtype PATHING_TYPE_AMPHIBIOUSPATHING = ConvertPathingType(7)

 constant mousebuttontype MOUSE_BUTTON_TYPE_LEFT = ConvertMouseButtonType(1)
 constant mousebuttontype MOUSE_BUTTON_TYPE_MIDDLE = ConvertMouseButtonType(2)
 constant mousebuttontype MOUSE_BUTTON_TYPE_RIGHT = ConvertMouseButtonType(3)





 constant racepreference RACE_PREF_HUMAN = ConvertRacePref(1)
 constant racepreference RACE_PREF_ORC = ConvertRacePref(2)
 constant racepreference RACE_PREF_NIGHTELF = ConvertRacePref(4)
 constant racepreference RACE_PREF_UNDEAD = ConvertRacePref(8)
 constant racepreference RACE_PREF_DEMON = ConvertRacePref(16)
 constant racepreference RACE_PREF_RANDOM = ConvertRacePref(32)
 constant racepreference RACE_PREF_USER_SELECTABLE = ConvertRacePref(64)

 constant mapcontrol MAP_CONTROL_USER = ConvertMapControl(0)
 constant mapcontrol MAP_CONTROL_COMPUTER = ConvertMapControl(1)
 constant mapcontrol MAP_CONTROL_RESCUABLE = ConvertMapControl(2)
 constant mapcontrol MAP_CONTROL_NEUTRAL = ConvertMapControl(3)
 constant mapcontrol MAP_CONTROL_CREEP = ConvertMapControl(4)
 constant mapcontrol MAP_CONTROL_NONE = ConvertMapControl(5)

 constant gametype GAME_TYPE_MELEE = ConvertGameType(1)
 constant gametype GAME_TYPE_FFA = ConvertGameType(2)
 constant gametype GAME_TYPE_USE_MAP_SETTINGS = ConvertGameType(4)
 constant gametype GAME_TYPE_BLIZ = ConvertGameType(8)
 constant gametype GAME_TYPE_ONE_ON_ONE = ConvertGameType(16)
 constant gametype GAME_TYPE_TWO_TEAM_PLAY = ConvertGameType(32)
 constant gametype GAME_TYPE_THREE_TEAM_PLAY = ConvertGameType(64)
 constant gametype GAME_TYPE_FOUR_TEAM_PLAY = ConvertGameType(128)

 constant mapflag MAP_FOG_HIDE_TERRAIN = ConvertMapFlag(1)
 constant mapflag MAP_FOG_MAP_EXPLORED = ConvertMapFlag(2)
 constant mapflag MAP_FOG_ALWAYS_VISIBLE = ConvertMapFlag(4)

 constant mapflag MAP_USE_HANDICAPS = ConvertMapFlag(8)
 constant mapflag MAP_OBSERVERS = ConvertMapFlag(16)
 constant mapflag MAP_OBSERVERS_ON_DEATH = ConvertMapFlag(32)

 constant mapflag MAP_FIXED_COLORS = ConvertMapFlag(128)
 constant mapflag MAP_LOCK_RESOURCE_TRADING = ConvertMapFlag(256)
 constant mapflag MAP_RESOURCE_TRADING_ALLIES_ONLY = ConvertMapFlag(512)

 constant mapflag MAP_LOCK_ALLIANCE_CHANGES = ConvertMapFlag(1024)
 constant mapflag MAP_ALLIANCE_CHANGES_HIDDEN = ConvertMapFlag(2048)

 constant mapflag MAP_CHEATS = ConvertMapFlag(4096)
 constant mapflag MAP_CHEATS_HIDDEN = ConvertMapFlag(8192)

 constant mapflag MAP_LOCK_SPEED = ConvertMapFlag(8192*2)
 constant mapflag MAP_LOCK_RANDOM_SEED = ConvertMapFlag(8192*4)
 constant mapflag MAP_SHARED_ADVANCED_CONTROL = ConvertMapFlag(8192*8)
 constant mapflag MAP_RANDOM_HERO = ConvertMapFlag(8192*16)
 constant mapflag MAP_RANDOM_RACES = ConvertMapFlag(8192*32)
 constant mapflag MAP_RELOADED = ConvertMapFlag(8192*64)

 constant placement MAP_PLACEMENT_RANDOM = ConvertPlacement(0) 
 constant placement MAP_PLACEMENT_FIXED = ConvertPlacement(1) 
 constant placement MAP_PLACEMENT_USE_MAP_SETTINGS = ConvertPlacement(2) 
 constant placement MAP_PLACEMENT_TEAMS_TOGETHER = ConvertPlacement(3) 

 constant startlocprio MAP_LOC_PRIO_LOW = ConvertStartLocPrio(0)
 constant startlocprio MAP_LOC_PRIO_HIGH = ConvertStartLocPrio(1)
 constant startlocprio MAP_LOC_PRIO_NOT = ConvertStartLocPrio(2)

 constant mapdensity MAP_DENSITY_NONE = ConvertMapDensity(0)
 constant mapdensity MAP_DENSITY_LIGHT = ConvertMapDensity(1)
 constant mapdensity MAP_DENSITY_MEDIUM = ConvertMapDensity(2)
 constant mapdensity MAP_DENSITY_HEAVY = ConvertMapDensity(3)

 constant gamedifficulty MAP_DIFFICULTY_EASY = ConvertGameDifficulty(0)
 constant gamedifficulty MAP_DIFFICULTY_NORMAL = ConvertGameDifficulty(1)
 constant gamedifficulty MAP_DIFFICULTY_HARD = ConvertGameDifficulty(2)
 constant gamedifficulty MAP_DIFFICULTY_INSANE = ConvertGameDifficulty(3)

 constant gamespeed MAP_SPEED_SLOWEST = ConvertGameSpeed(0)
 constant gamespeed MAP_SPEED_SLOW = ConvertGameSpeed(1)
 constant gamespeed MAP_SPEED_NORMAL = ConvertGameSpeed(2)
 constant gamespeed MAP_SPEED_FAST = ConvertGameSpeed(3)
 constant gamespeed MAP_SPEED_FASTEST = ConvertGameSpeed(4)

 constant playerslotstate PLAYER_SLOT_STATE_EMPTY = ConvertPlayerSlotState(0)
 constant playerslotstate PLAYER_SLOT_STATE_PLAYING = ConvertPlayerSlotState(1)
 constant playerslotstate PLAYER_SLOT_STATE_LEFT = ConvertPlayerSlotState(2)




 constant volumegroup SOUND_VOLUMEGROUP_UNITMOVEMENT = ConvertVolumeGroup(0)
 constant volumegroup SOUND_VOLUMEGROUP_UNITSOUNDS = ConvertVolumeGroup(1)
 constant volumegroup SOUND_VOLUMEGROUP_COMBAT = ConvertVolumeGroup(2)
 constant volumegroup SOUND_VOLUMEGROUP_SPELLS = ConvertVolumeGroup(3)
 constant volumegroup SOUND_VOLUMEGROUP_UI = ConvertVolumeGroup(4)
 constant volumegroup SOUND_VOLUMEGROUP_MUSIC = ConvertVolumeGroup(5)
 constant volumegroup SOUND_VOLUMEGROUP_AMBIENTSOUNDS = ConvertVolumeGroup(6)
 constant volumegroup SOUND_VOLUMEGROUP_FIRE = ConvertVolumeGroup(7)







 constant igamestate GAME_STATE_DIVINE_INTERVENTION = ConvertIGameState(0)
 constant igamestate GAME_STATE_DISCONNECTED = ConvertIGameState(1)
 constant fgamestate GAME_STATE_TIME_OF_DAY = ConvertFGameState(2)

 constant playerstate PLAYER_STATE_GAME_RESULT = ConvertPlayerState(0)

 
 
 constant playerstate PLAYER_STATE_RESOURCE_GOLD = ConvertPlayerState(1)
 constant playerstate PLAYER_STATE_RESOURCE_LUMBER = ConvertPlayerState(2)
 constant playerstate PLAYER_STATE_RESOURCE_HERO_TOKENS = ConvertPlayerState(3)
 constant playerstate PLAYER_STATE_RESOURCE_FOOD_CAP = ConvertPlayerState(4)
 constant playerstate PLAYER_STATE_RESOURCE_FOOD_USED = ConvertPlayerState(5)
 constant playerstate PLAYER_STATE_FOOD_CAP_CEILING = ConvertPlayerState(6)

 constant playerstate PLAYER_STATE_GIVES_BOUNTY = ConvertPlayerState(7)
 constant playerstate PLAYER_STATE_ALLIED_VICTORY = ConvertPlayerState(8)
 constant playerstate PLAYER_STATE_PLACED = ConvertPlayerState(9)
 constant playerstate PLAYER_STATE_OBSERVER_ON_DEATH = ConvertPlayerState(10)
 constant playerstate PLAYER_STATE_OBSERVER = ConvertPlayerState(11)
 constant playerstate PLAYER_STATE_UNFOLLOWABLE = ConvertPlayerState(12)

 
 
 constant playerstate PLAYER_STATE_GOLD_UPKEEP_RATE = ConvertPlayerState(13)
 constant playerstate PLAYER_STATE_LUMBER_UPKEEP_RATE = ConvertPlayerState(14)

 
 
 constant playerstate PLAYER_STATE_GOLD_GATHERED = ConvertPlayerState(15)
 constant playerstate PLAYER_STATE_LUMBER_GATHERED = ConvertPlayerState(16)

 constant playerstate PLAYER_STATE_NO_CREEP_SLEEP = ConvertPlayerState(25)

 constant unitstate UNIT_STATE_LIFE = ConvertUnitState(0)
 constant unitstate UNIT_STATE_MAX_LIFE = ConvertUnitState(1)
 constant unitstate UNIT_STATE_MANA = ConvertUnitState(2)
 constant unitstate UNIT_STATE_MAX_MANA = ConvertUnitState(3)

 constant aidifficulty AI_DIFFICULTY_NEWBIE = ConvertAIDifficulty(0)
 constant aidifficulty AI_DIFFICULTY_NORMAL = ConvertAIDifficulty(1)
 constant aidifficulty AI_DIFFICULTY_INSANE = ConvertAIDifficulty(2)

 
 constant playerscore PLAYER_SCORE_UNITS_TRAINED = ConvertPlayerScore(0)
 constant playerscore PLAYER_SCORE_UNITS_KILLED = ConvertPlayerScore(1)
 constant playerscore PLAYER_SCORE_STRUCT_BUILT = ConvertPlayerScore(2)
 constant playerscore PLAYER_SCORE_STRUCT_RAZED = ConvertPlayerScore(3)
 constant playerscore PLAYER_SCORE_TECH_PERCENT = ConvertPlayerScore(4)
 constant playerscore PLAYER_SCORE_FOOD_MAXPROD = ConvertPlayerScore(5)
 constant playerscore PLAYER_SCORE_FOOD_MAXUSED = ConvertPlayerScore(6)
 constant playerscore PLAYER_SCORE_HEROES_KILLED = ConvertPlayerScore(7)
 constant playerscore PLAYER_SCORE_ITEMS_GAINED = ConvertPlayerScore(8)
 constant playerscore PLAYER_SCORE_MERCS_HIRED = ConvertPlayerScore(9)
 constant playerscore PLAYER_SCORE_GOLD_MINED_TOTAL = ConvertPlayerScore(10)
 constant playerscore PLAYER_SCORE_GOLD_MINED_UPKEEP = ConvertPlayerScore(11)
 constant playerscore PLAYER_SCORE_GOLD_LOST_UPKEEP = ConvertPlayerScore(12)
 constant playerscore PLAYER_SCORE_GOLD_LOST_TAX = ConvertPlayerScore(13)
 constant playerscore PLAYER_SCORE_GOLD_GIVEN = ConvertPlayerScore(14)
 constant playerscore PLAYER_SCORE_GOLD_RECEIVED = ConvertPlayerScore(15)
 constant playerscore PLAYER_SCORE_LUMBER_TOTAL = ConvertPlayerScore(16)
 constant playerscore PLAYER_SCORE_LUMBER_LOST_UPKEEP = ConvertPlayerScore(17)
 constant playerscore PLAYER_SCORE_LUMBER_LOST_TAX = ConvertPlayerScore(18)
 constant playerscore PLAYER_SCORE_LUMBER_GIVEN = ConvertPlayerScore(19)
 constant playerscore PLAYER_SCORE_LUMBER_RECEIVED = ConvertPlayerScore(20)
 constant playerscore PLAYER_SCORE_UNIT_TOTAL = ConvertPlayerScore(21)
 constant playerscore PLAYER_SCORE_HERO_TOTAL = ConvertPlayerScore(22)
 constant playerscore PLAYER_SCORE_RESOURCE_TOTAL = ConvertPlayerScore(23)
 constant playerscore PLAYER_SCORE_TOTAL = ConvertPlayerScore(24)

 constant gameevent EVENT_GAME_VICTORY = ConvertGameEvent(0)
 constant gameevent EVENT_GAME_END_LEVEL = ConvertGameEvent(1)

 constant gameevent EVENT_GAME_VARIABLE_LIMIT = ConvertGameEvent(2)
 constant gameevent EVENT_GAME_STATE_LIMIT = ConvertGameEvent(3) 

 constant gameevent EVENT_GAME_TIMER_EXPIRED = ConvertGameEvent(4)

 constant gameevent EVENT_GAME_ENTER_REGION = ConvertGameEvent(5)
 constant gameevent EVENT_GAME_LEAVE_REGION = ConvertGameEvent(6)

 constant gameevent EVENT_GAME_TRACKABLE_HIT = ConvertGameEvent(7)
 constant gameevent EVENT_GAME_TRACKABLE_TRACK = ConvertGameEvent(8)

 constant gameevent EVENT_GAME_SHOW_SKILL = ConvertGameEvent(9) 
 constant gameevent EVENT_GAME_BUILD_SUBMENU = ConvertGameEvent(10)

 constant playerevent EVENT_PLAYER_STATE_LIMIT = ConvertPlayerEvent(11)
 constant playerevent EVENT_PLAYER_ALLIANCE_CHANGED = ConvertPlayerEvent(12)

 constant playerevent EVENT_PLAYER_DEFEAT = ConvertPlayerEvent(13)
 constant playerevent EVENT_PLAYER_VICTORY = ConvertPlayerEvent(14)
 constant playerevent EVENT_PLAYER_LEAVE = ConvertPlayerEvent(15)
 constant playerevent EVENT_PLAYER_CHAT = ConvertPlayerEvent(16)
 constant playerevent EVENT_PLAYER_END_CINEMATIC = ConvertPlayerEvent(17)

 
 
 

 constant playerunitevent EVENT_PLAYER_UNIT_ATTACKED = ConvertPlayerUnitEvent(18)
 constant playerunitevent EVENT_PLAYER_UNIT_RESCUED = ConvertPlayerUnitEvent(19)

 constant playerunitevent EVENT_PLAYER_UNIT_DEATH = ConvertPlayerUnitEvent(20)
 constant playerunitevent EVENT_PLAYER_UNIT_DECAY = ConvertPlayerUnitEvent(21)

 constant playerunitevent EVENT_PLAYER_UNIT_DETECTED = ConvertPlayerUnitEvent(22)
 constant playerunitevent EVENT_PLAYER_UNIT_HIDDEN = ConvertPlayerUnitEvent(23)

 constant playerunitevent EVENT_PLAYER_UNIT_SELECTED = ConvertPlayerUnitEvent(24)
 constant playerunitevent EVENT_PLAYER_UNIT_DESELECTED = ConvertPlayerUnitEvent(25)

 constant playerunitevent EVENT_PLAYER_UNIT_CONSTRUCT_START = ConvertPlayerUnitEvent(26)
 constant playerunitevent EVENT_PLAYER_UNIT_CONSTRUCT_CANCEL = ConvertPlayerUnitEvent(27)
 constant playerunitevent EVENT_PLAYER_UNIT_CONSTRUCT_FINISH = ConvertPlayerUnitEvent(28)

 constant playerunitevent EVENT_PLAYER_UNIT_UPGRADE_START = ConvertPlayerUnitEvent(29)
 constant playerunitevent EVENT_PLAYER_UNIT_UPGRADE_CANCEL = ConvertPlayerUnitEvent(30)
 constant playerunitevent EVENT_PLAYER_UNIT_UPGRADE_FINISH = ConvertPlayerUnitEvent(31)

 constant playerunitevent EVENT_PLAYER_UNIT_TRAIN_START = ConvertPlayerUnitEvent(32)
 constant playerunitevent EVENT_PLAYER_UNIT_TRAIN_CANCEL = ConvertPlayerUnitEvent(33)
 constant playerunitevent EVENT_PLAYER_UNIT_TRAIN_FINISH = ConvertPlayerUnitEvent(34)

 constant playerunitevent EVENT_PLAYER_UNIT_RESEARCH_START = ConvertPlayerUnitEvent(35)
 constant playerunitevent EVENT_PLAYER_UNIT_RESEARCH_CANCEL = ConvertPlayerUnitEvent(36)
 constant playerunitevent EVENT_PLAYER_UNIT_RESEARCH_FINISH = ConvertPlayerUnitEvent(37)
 constant playerunitevent EVENT_PLAYER_UNIT_ISSUED_ORDER = ConvertPlayerUnitEvent(38)
 constant playerunitevent EVENT_PLAYER_UNIT_ISSUED_POINT_ORDER = ConvertPlayerUnitEvent(39)
 constant playerunitevent EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER = ConvertPlayerUnitEvent(40)
 constant playerunitevent EVENT_PLAYER_UNIT_ISSUED_UNIT_ORDER = ConvertPlayerUnitEvent(40) 

 constant playerunitevent EVENT_PLAYER_HERO_LEVEL = ConvertPlayerUnitEvent(41)
 constant playerunitevent EVENT_PLAYER_HERO_SKILL = ConvertPlayerUnitEvent(42)

 constant playerunitevent EVENT_PLAYER_HERO_REVIVABLE = ConvertPlayerUnitEvent(43)

 constant playerunitevent EVENT_PLAYER_HERO_REVIVE_START = ConvertPlayerUnitEvent(44)
 constant playerunitevent EVENT_PLAYER_HERO_REVIVE_CANCEL = ConvertPlayerUnitEvent(45)
 constant playerunitevent EVENT_PLAYER_HERO_REVIVE_FINISH = ConvertPlayerUnitEvent(46)
 constant playerunitevent EVENT_PLAYER_UNIT_SUMMON = ConvertPlayerUnitEvent(47)
 constant playerunitevent EVENT_PLAYER_UNIT_DROP_ITEM = ConvertPlayerUnitEvent(48)
 constant playerunitevent EVENT_PLAYER_UNIT_PICKUP_ITEM = ConvertPlayerUnitEvent(49)
 constant playerunitevent EVENT_PLAYER_UNIT_USE_ITEM = ConvertPlayerUnitEvent(50)

 constant playerunitevent EVENT_PLAYER_UNIT_LOADED = ConvertPlayerUnitEvent(51)
 
 
 

 constant unitevent EVENT_UNIT_DAMAGED = ConvertUnitEvent(52)
 constant unitevent EVENT_UNIT_DEATH = ConvertUnitEvent(53)
 constant unitevent EVENT_UNIT_DECAY = ConvertUnitEvent(54)
 constant unitevent EVENT_UNIT_DETECTED = ConvertUnitEvent(55)
 constant unitevent EVENT_UNIT_HIDDEN = ConvertUnitEvent(56)
 constant unitevent EVENT_UNIT_SELECTED = ConvertUnitEvent(57)
 constant unitevent EVENT_UNIT_DESELECTED = ConvertUnitEvent(58)
 constant unitevent EVENT_UNIT_STATE_LIMIT = ConvertUnitEvent(59) 

 
 
 constant unitevent EVENT_UNIT_ACQUIRED_TARGET = ConvertUnitEvent(60)
 constant unitevent EVENT_UNIT_TARGET_IN_RANGE = ConvertUnitEvent(61)
 constant unitevent EVENT_UNIT_ATTACKED = ConvertUnitEvent(62)
 constant unitevent EVENT_UNIT_RESCUED = ConvertUnitEvent(63)
 constant unitevent EVENT_UNIT_CONSTRUCT_CANCEL = ConvertUnitEvent(64)
 constant unitevent EVENT_UNIT_CONSTRUCT_FINISH = ConvertUnitEvent(65)
 constant unitevent EVENT_UNIT_UPGRADE_START = ConvertUnitEvent(66)
 constant unitevent EVENT_UNIT_UPGRADE_CANCEL = ConvertUnitEvent(67)
 constant unitevent EVENT_UNIT_UPGRADE_FINISH = ConvertUnitEvent(68)
 
 
 
 constant unitevent EVENT_UNIT_TRAIN_START = ConvertUnitEvent(69)
 constant unitevent EVENT_UNIT_TRAIN_CANCEL = ConvertUnitEvent(70)
 constant unitevent EVENT_UNIT_TRAIN_FINISH = ConvertUnitEvent(71)
 constant unitevent EVENT_UNIT_RESEARCH_START = ConvertUnitEvent(72)
 constant unitevent EVENT_UNIT_RESEARCH_CANCEL = ConvertUnitEvent(73)
 constant unitevent EVENT_UNIT_RESEARCH_FINISH = ConvertUnitEvent(74)
 constant unitevent EVENT_UNIT_ISSUED_ORDER = ConvertUnitEvent(75)
 constant unitevent EVENT_UNIT_ISSUED_POINT_ORDER = ConvertUnitEvent(76)
 constant unitevent EVENT_UNIT_ISSUED_TARGET_ORDER = ConvertUnitEvent(77)
 constant unitevent EVENT_UNIT_HERO_LEVEL = ConvertUnitEvent(78)
 constant unitevent EVENT_UNIT_HERO_SKILL = ConvertUnitEvent(79)
 constant unitevent EVENT_UNIT_HERO_REVIVABLE = ConvertUnitEvent(80)
 constant unitevent EVENT_UNIT_HERO_REVIVE_START = ConvertUnitEvent(81)
 constant unitevent EVENT_UNIT_HERO_REVIVE_CANCEL = ConvertUnitEvent(82)
 constant unitevent EVENT_UNIT_HERO_REVIVE_FINISH = ConvertUnitEvent(83)
 constant unitevent EVENT_UNIT_SUMMON = ConvertUnitEvent(84)
 constant unitevent EVENT_UNIT_DROP_ITEM = ConvertUnitEvent(85)
 constant unitevent EVENT_UNIT_PICKUP_ITEM = ConvertUnitEvent(86)
 constant unitevent EVENT_UNIT_USE_ITEM = ConvertUnitEvent(87)

 constant unitevent EVENT_UNIT_LOADED = ConvertUnitEvent(88)

 constant widgetevent EVENT_WIDGET_DEATH = ConvertWidgetEvent(89)

 constant dialogevent EVENT_DIALOG_BUTTON_CLICK = ConvertDialogEvent(90)
 constant dialogevent EVENT_DIALOG_CLICK = ConvertDialogEvent(91)

 
 
 
 

 
 
 

 constant gameevent EVENT_GAME_LOADED = ConvertGameEvent(256)
 constant gameevent EVENT_GAME_TOURNAMENT_FINISH_SOON = ConvertGameEvent(257)
 constant gameevent EVENT_GAME_TOURNAMENT_FINISH_NOW = ConvertGameEvent(258)
 constant gameevent EVENT_GAME_SAVE = ConvertGameEvent(259)

 
 
 

 constant playerevent EVENT_PLAYER_ARROW_LEFT_DOWN = ConvertPlayerEvent(261)
 constant playerevent EVENT_PLAYER_ARROW_LEFT_UP = ConvertPlayerEvent(262)
 constant playerevent EVENT_PLAYER_ARROW_RIGHT_DOWN = ConvertPlayerEvent(263)
 constant playerevent EVENT_PLAYER_ARROW_RIGHT_UP = ConvertPlayerEvent(264)
 constant playerevent EVENT_PLAYER_ARROW_DOWN_DOWN = ConvertPlayerEvent(265)
 constant playerevent EVENT_PLAYER_ARROW_DOWN_UP = ConvertPlayerEvent(266)
 constant playerevent EVENT_PLAYER_ARROW_UP_DOWN = ConvertPlayerEvent(267)
 constant playerevent EVENT_PLAYER_ARROW_UP_UP = ConvertPlayerEvent(268)
 constant playerevent EVENT_PLAYER_MOUSE_DOWN = ConvertPlayerEvent(269)
 constant playerevent EVENT_PLAYER_MOUSE_UP = ConvertPlayerEvent(270)
 constant playerevent EVENT_PLAYER_MOUSE_MOVE = ConvertPlayerEvent(271)

 
 
 

 constant playerunitevent EVENT_PLAYER_UNIT_SELL = ConvertPlayerUnitEvent(272)
 constant playerunitevent EVENT_PLAYER_UNIT_CHANGE_OWNER = ConvertPlayerUnitEvent(273)
 constant playerunitevent EVENT_PLAYER_UNIT_SELL_ITEM = ConvertPlayerUnitEvent(274)
 constant playerunitevent EVENT_PLAYER_UNIT_SPELL_CHANNEL = ConvertPlayerUnitEvent(275)
 constant playerunitevent EVENT_PLAYER_UNIT_SPELL_CAST = ConvertPlayerUnitEvent(276)
 constant playerunitevent EVENT_PLAYER_UNIT_SPELL_EFFECT = ConvertPlayerUnitEvent(277)
 constant playerunitevent EVENT_PLAYER_UNIT_SPELL_FINISH = ConvertPlayerUnitEvent(278)
 constant playerunitevent EVENT_PLAYER_UNIT_SPELL_ENDCAST = ConvertPlayerUnitEvent(279)
 constant playerunitevent EVENT_PLAYER_UNIT_PAWN_ITEM = ConvertPlayerUnitEvent(280)

 
 
 

 constant unitevent EVENT_UNIT_SELL = ConvertUnitEvent(289)
 constant unitevent EVENT_UNIT_CHANGE_OWNER = ConvertUnitEvent(290)
 constant unitevent EVENT_UNIT_SELL_ITEM = ConvertUnitEvent(291)
 constant unitevent EVENT_UNIT_SPELL_CHANNEL = ConvertUnitEvent(292)
 constant unitevent EVENT_UNIT_SPELL_CAST = ConvertUnitEvent(293)
 constant unitevent EVENT_UNIT_SPELL_EFFECT = ConvertUnitEvent(294)
 constant unitevent EVENT_UNIT_SPELL_FINISH = ConvertUnitEvent(295)
 constant unitevent EVENT_UNIT_SPELL_ENDCAST = ConvertUnitEvent(296)
 constant unitevent EVENT_UNIT_PAWN_ITEM = ConvertUnitEvent(297)

 
 
 
 
 
 constant limitop LESS_THAN = ConvertLimitOp(0)
 constant limitop LESS_THAN_OR_EQUAL = ConvertLimitOp(1)
 constant limitop EQUAL = ConvertLimitOp(2)
 constant limitop GREATER_THAN_OR_EQUAL = ConvertLimitOp(3)
 constant limitop GREATER_THAN = ConvertLimitOp(4)
 constant limitop NOT_EQUAL = ConvertLimitOp(5)





 constant unittype UNIT_TYPE_HERO = ConvertUnitType(0)
 constant unittype UNIT_TYPE_DEAD = ConvertUnitType(1)
 constant unittype UNIT_TYPE_STRUCTURE = ConvertUnitType(2)

 constant unittype UNIT_TYPE_FLYING = ConvertUnitType(3)
 constant unittype UNIT_TYPE_GROUND = ConvertUnitType(4)

 constant unittype UNIT_TYPE_ATTACKS_FLYING = ConvertUnitType(5)
 constant unittype UNIT_TYPE_ATTACKS_GROUND = ConvertUnitType(6)

 constant unittype UNIT_TYPE_MELEE_ATTACKER = ConvertUnitType(7)
 constant unittype UNIT_TYPE_RANGED_ATTACKER = ConvertUnitType(8)

 constant unittype UNIT_TYPE_GIANT = ConvertUnitType(9)
 constant unittype UNIT_TYPE_SUMMONED = ConvertUnitType(10)
 constant unittype UNIT_TYPE_STUNNED = ConvertUnitType(11)
 constant unittype UNIT_TYPE_PLAGUED = ConvertUnitType(12)
 constant unittype UNIT_TYPE_SNARED = ConvertUnitType(13)

 constant unittype UNIT_TYPE_UNDEAD = ConvertUnitType(14)
 constant unittype UNIT_TYPE_MECHANICAL = ConvertUnitType(15)
 constant unittype UNIT_TYPE_PEON = ConvertUnitType(16)
 constant unittype UNIT_TYPE_SAPPER = ConvertUnitType(17)
 constant unittype UNIT_TYPE_TOWNHALL = ConvertUnitType(18) 
 constant unittype UNIT_TYPE_ANCIENT = ConvertUnitType(19)
 constant unittype UNIT_TYPE_TAUREN = ConvertUnitType(20)
 constant unittype UNIT_TYPE_POISONED = ConvertUnitType(21)
 constant unittype UNIT_TYPE_POLYMORPHED = ConvertUnitType(22)
 constant unittype UNIT_TYPE_SLEEPING = ConvertUnitType(23)
 constant unittype UNIT_TYPE_RESISTANT = ConvertUnitType(24)
 constant unittype UNIT_TYPE_ETHEREAL = ConvertUnitType(25)
 constant unittype UNIT_TYPE_MAGIC_IMMUNE = ConvertUnitType(26)





 constant itemtype ITEM_TYPE_PERMANENT = ConvertItemType(0)
 constant itemtype ITEM_TYPE_CHARGED = ConvertItemType(1)
 constant itemtype ITEM_TYPE_POWERUP = ConvertItemType(2)
 constant itemtype ITEM_TYPE_ARTIFACT = ConvertItemType(3)
 constant itemtype ITEM_TYPE_PURCHASABLE = ConvertItemType(4)
 constant itemtype ITEM_TYPE_CAMPAIGN = ConvertItemType(5)
 constant itemtype ITEM_TYPE_MISCELLANEOUS = ConvertItemType(6)
 constant itemtype ITEM_TYPE_UNKNOWN = ConvertItemType(7)
 constant itemtype ITEM_TYPE_ANY = ConvertItemType(8)

 
 constant itemtype ITEM_TYPE_TOME = ConvertItemType(2)





 constant camerafield CAMERA_FIELD_TARGET_DISTANCE = ConvertCameraField(0)
 constant camerafield CAMERA_FIELD_FARZ = ConvertCameraField(1)
 constant camerafield CAMERA_FIELD_ANGLE_OF_ATTACK = ConvertCameraField(2)
 constant camerafield CAMERA_FIELD_FIELD_OF_VIEW = ConvertCameraField(3)
 constant camerafield CAMERA_FIELD_ROLL = ConvertCameraField(4)
 constant camerafield CAMERA_FIELD_ROTATION = ConvertCameraField(5)
 constant camerafield CAMERA_FIELD_ZOFFSET = ConvertCameraField(6)

 constant blendmode BLEND_MODE_NONE = ConvertBlendMode(0)
 constant blendmode BLEND_MODE_DONT_CARE = ConvertBlendMode(0)
 constant blendmode BLEND_MODE_KEYALPHA = ConvertBlendMode(1)
 constant blendmode BLEND_MODE_BLEND = ConvertBlendMode(2)
 constant blendmode BLEND_MODE_ADDITIVE = ConvertBlendMode(3)
 constant blendmode BLEND_MODE_MODULATE = ConvertBlendMode(4)
 constant blendmode BLEND_MODE_MODULATE_2X = ConvertBlendMode(5)
 constant raritycontrol RARITY_FREQUENT = ConvertRarityControl(0)
 constant raritycontrol RARITY_RARE = ConvertRarityControl(1)

 constant texmapflags TEXMAP_FLAG_NONE = ConvertTexMapFlags(0)
 constant texmapflags TEXMAP_FLAG_WRAP_U = ConvertTexMapFlags(1)
 constant texmapflags TEXMAP_FLAG_WRAP_V = ConvertTexMapFlags(2)
 constant texmapflags TEXMAP_FLAG_WRAP_UV = ConvertTexMapFlags(3)

 constant fogstate FOG_OF_WAR_MASKED = ConvertFogState(1)
 constant fogstate FOG_OF_WAR_FOGGED = ConvertFogState(2)
 constant fogstate FOG_OF_WAR_VISIBLE = ConvertFogState(4)





 constant integer CAMERA_MARGIN_LEFT = 0
 constant integer CAMERA_MARGIN_RIGHT = 1
 constant integer CAMERA_MARGIN_TOP = 2
 constant integer CAMERA_MARGIN_BOTTOM = 3





 constant effecttype EFFECT_TYPE_EFFECT = ConvertEffectType(0)
 constant effecttype EFFECT_TYPE_TARGET = ConvertEffectType(1)
 constant effecttype EFFECT_TYPE_CASTER = ConvertEffectType(2)
 constant effecttype EFFECT_TYPE_SPECIAL = ConvertEffectType(3)
 constant effecttype EFFECT_TYPE_AREA_EFFECT = ConvertEffectType(4)
 constant effecttype EFFECT_TYPE_MISSILE = ConvertEffectType(5)
 constant effecttype EFFECT_TYPE_LIGHTNING = ConvertEffectType(6)

 constant soundtype SOUND_TYPE_EFFECT = ConvertSoundType(0)
 constant soundtype SOUND_TYPE_EFFECT_LOOPED = ConvertSoundType(1)

endglobals



native Deg2Rad takes real degrees returns real
native Rad2Deg takes real radians returns real

native Sin takes real radians returns real
native Cos takes real radians returns real
native Tan takes real radians returns real


native Asin takes real y returns real
native Acos takes real x returns real

native Atan takes real x returns real


native Atan2 takes real y, real x returns real


native SquareRoot takes real x returns real





native Pow takes real x, real power returns real



native I2R takes integer i returns real
native R2I takes real r returns integer
native I2S takes integer i returns string
native R2S takes real r returns string
native R2SW takes real r, integer width, integer precision returns string
native S2I takes string s returns integer
native S2R takes string s returns real
native GetHandleId takes handle h returns integer
native SubString takes string source, integer start, integer end returns string
native StringLength takes string s returns integer
native StringCase takes string source, boolean upper returns string
native StringHash takes string s returns integer

native GetLocalizedString takes string source returns string
native GetLocalizedHotkey takes string source returns integer










native SetMapName takes string name returns nothing
native SetMapDescription takes string description returns nothing

native SetTeams takes integer teamcount returns nothing
native SetPlayers takes integer playercount returns nothing

native DefineStartLocation takes integer whichStartLoc, real x, real y returns nothing
native DefineStartLocationLoc takes integer whichStartLoc, location whichLocation returns nothing
native SetStartLocPrioCount takes integer whichStartLoc, integer prioSlotCount returns nothing
native SetStartLocPrio takes integer whichStartLoc, integer prioSlotIndex, integer otherStartLocIndex, startlocprio priority returns nothing
native GetStartLocPrioSlot takes integer whichStartLoc, integer prioSlotIndex returns integer
native GetStartLocPrio takes integer whichStartLoc, integer prioSlotIndex returns startlocprio

native SetGameTypeSupported takes gametype whichGameType, boolean value returns nothing
native SetMapFlag takes mapflag whichMapFlag, boolean value returns nothing
native SetGamePlacement takes placement whichPlacementType returns nothing
native SetGameSpeed takes gamespeed whichspeed returns nothing
native SetGameDifficulty takes gamedifficulty whichdifficulty returns nothing
native SetResourceDensity takes mapdensity whichdensity returns nothing
native SetCreatureDensity takes mapdensity whichdensity returns nothing

native GetTeams takes nothing returns integer
native GetPlayers takes nothing returns integer

native IsGameTypeSupported takes gametype whichGameType returns boolean
native GetGameTypeSelected takes nothing returns gametype
native IsMapFlagSet takes mapflag whichMapFlag returns boolean

constant native GetGamePlacement takes nothing returns placement
constant native GetGameSpeed takes nothing returns gamespeed
constant native GetGameDifficulty takes nothing returns gamedifficulty
constant native GetResourceDensity takes nothing returns mapdensity
constant native GetCreatureDensity takes nothing returns mapdensity
constant native GetStartLocationX takes integer whichStartLocation returns real
constant native GetStartLocationY takes integer whichStartLocation returns real
constant native GetStartLocationLoc takes integer whichStartLocation returns location
native SetPlayerTeam takes player whichPlayer, integer whichTeam returns nothing
native SetPlayerStartLocation takes player whichPlayer, integer startLocIndex returns nothing




native ForcePlayerStartLocation takes player whichPlayer, integer startLocIndex returns nothing 
native SetPlayerColor takes player whichPlayer, playercolor color returns nothing
native SetPlayerAlliance takes player sourcePlayer, player otherPlayer, alliancetype whichAllianceSetting, boolean value returns nothing
native SetPlayerTaxRate takes player sourcePlayer, player otherPlayer, playerstate whichResource, integer rate returns nothing
native SetPlayerRacePreference takes player whichPlayer, racepreference whichRacePreference returns nothing
native SetPlayerRaceSelectable takes player whichPlayer, boolean value returns nothing
native SetPlayerController takes player whichPlayer, mapcontrol controlType returns nothing
native SetPlayerName takes player whichPlayer, string name returns nothing

native SetPlayerOnScoreScreen takes player whichPlayer, boolean flag returns nothing

native GetPlayerTeam takes player whichPlayer returns integer
native GetPlayerStartLocation takes player whichPlayer returns integer
native GetPlayerColor takes player whichPlayer returns playercolor
native GetPlayerSelectable takes player whichPlayer returns boolean
native GetPlayerController takes player whichPlayer returns mapcontrol
native GetPlayerSlotState takes player whichPlayer returns playerslotstate
native GetPlayerTaxRate takes player sourcePlayer, player otherPlayer, playerstate whichResource returns integer
native IsPlayerRacePrefSet takes player whichPlayer, racepreference pref returns boolean
native GetPlayerName takes player whichPlayer returns string




native CreateTimer takes nothing returns timer
native DestroyTimer takes timer whichTimer returns nothing
native TimerStart takes timer whichTimer, real timeout, boolean periodic, code handlerFunc returns nothing
native TimerGetElapsed takes timer whichTimer returns real
native TimerGetRemaining takes timer whichTimer returns real
native TimerGetTimeout takes timer whichTimer returns real
native PauseTimer takes timer whichTimer returns nothing
native ResumeTimer takes timer whichTimer returns nothing
native GetExpiredTimer takes nothing returns timer




native CreateGroup takes nothing returns group
native DestroyGroup takes group whichGroup returns nothing
native GroupAddUnit takes group whichGroup, unit whichUnit returns nothing
native GroupRemoveUnit takes group whichGroup, unit whichUnit returns nothing
native GroupClear takes group whichGroup returns nothing
native GroupEnumUnitsOfType takes group whichGroup, string unitname, boolexpr filter returns nothing
native GroupEnumUnitsOfPlayer takes group whichGroup, player whichPlayer, boolexpr filter returns nothing
native GroupEnumUnitsOfTypeCounted takes group whichGroup, string unitname, boolexpr filter, integer countLimit returns nothing
native GroupEnumUnitsInRect takes group whichGroup, rect r, boolexpr filter returns nothing
native GroupEnumUnitsInRectCounted takes group whichGroup, rect r, boolexpr filter, integer countLimit returns nothing
native GroupEnumUnitsInRange takes group whichGroup, real x, real y, real radius, boolexpr filter returns nothing
native GroupEnumUnitsInRangeOfLoc takes group whichGroup, location whichLocation, real radius, boolexpr filter returns nothing
native GroupEnumUnitsInRangeCounted takes group whichGroup, real x, real y, real radius, boolexpr filter, integer countLimit returns nothing
native GroupEnumUnitsInRangeOfLocCounted takes group whichGroup, location whichLocation, real radius, boolexpr filter, integer countLimit returns nothing
native GroupEnumUnitsSelected takes group whichGroup, player whichPlayer, boolexpr filter returns nothing

native GroupImmediateOrder takes group whichGroup, string order returns boolean
native GroupImmediateOrderById takes group whichGroup, integer order returns boolean
native GroupPointOrder takes group whichGroup, string order, real x, real y returns boolean
native GroupPointOrderLoc takes group whichGroup, string order, location whichLocation returns boolean
native GroupPointOrderById takes group whichGroup, integer order, real x, real y returns boolean
native GroupPointOrderByIdLoc takes group whichGroup, integer order, location whichLocation returns boolean
native GroupTargetOrder takes group whichGroup, string order, widget targetWidget returns boolean
native GroupTargetOrderById takes group whichGroup, integer order, widget targetWidget returns boolean





native ForGroup takes group whichGroup, code callback returns nothing
native FirstOfGroup takes group whichGroup returns unit




native CreateForce takes nothing returns force
native DestroyForce takes force whichForce returns nothing
native ForceAddPlayer takes force whichForce, player whichPlayer returns nothing
native ForceRemovePlayer takes force whichForce, player whichPlayer returns nothing
native ForceClear takes force whichForce returns nothing
native ForceEnumPlayers takes force whichForce, boolexpr filter returns nothing
native ForceEnumPlayersCounted takes force whichForce, boolexpr filter, integer countLimit returns nothing
native ForceEnumAllies takes force whichForce, player whichPlayer, boolexpr filter returns nothing
native ForceEnumEnemies takes force whichForce, player whichPlayer, boolexpr filter returns nothing
native ForForce takes force whichForce, code callback returns nothing




native Rect takes real minx, real miny, real maxx, real maxy returns rect
native RectFromLoc takes location min, location max returns rect
native RemoveRect takes rect whichRect returns nothing
native SetRect takes rect whichRect, real minx, real miny, real maxx, real maxy returns nothing
native SetRectFromLoc takes rect whichRect, location min, location max returns nothing
native MoveRectTo takes rect whichRect, real newCenterX, real newCenterY returns nothing
native MoveRectToLoc takes rect whichRect, location newCenterLoc returns nothing

native GetRectCenterX takes rect whichRect returns real
native GetRectCenterY takes rect whichRect returns real
native GetRectMinX takes rect whichRect returns real
native GetRectMinY takes rect whichRect returns real
native GetRectMaxX takes rect whichRect returns real
native GetRectMaxY takes rect whichRect returns real

native CreateRegion takes nothing returns region
native RemoveRegion takes region whichRegion returns nothing

native RegionAddRect takes region whichRegion, rect r returns nothing
native RegionClearRect takes region whichRegion, rect r returns nothing

native RegionAddCell takes region whichRegion, real x, real y returns nothing
native RegionAddCellAtLoc takes region whichRegion, location whichLocation returns nothing
native RegionClearCell takes region whichRegion, real x, real y returns nothing
native RegionClearCellAtLoc takes region whichRegion, location whichLocation returns nothing

native Location takes real x, real y returns location
native RemoveLocation takes location whichLocation returns nothing
native MoveLocation takes location whichLocation, real newX, real newY returns nothing
native GetLocationX takes location whichLocation returns real
native GetLocationY takes location whichLocation returns real



native GetLocationZ takes location whichLocation returns real

native IsUnitInRegion takes region whichRegion, unit whichUnit returns boolean
native IsPointInRegion takes region whichRegion, real x, real y returns boolean
native IsLocationInRegion takes region whichRegion, location whichLocation returns boolean


native GetWorldBounds takes nothing returns rect




native CreateTrigger takes nothing returns trigger
native DestroyTrigger takes trigger whichTrigger returns nothing
native ResetTrigger takes trigger whichTrigger returns nothing
native EnableTrigger takes trigger whichTrigger returns nothing
native DisableTrigger takes trigger whichTrigger returns nothing
native IsTriggerEnabled takes trigger whichTrigger returns boolean

native TriggerWaitOnSleeps takes trigger whichTrigger, boolean flag returns nothing
native IsTriggerWaitOnSleeps takes trigger whichTrigger returns boolean

constant native GetFilterUnit takes nothing returns unit
constant native GetEnumUnit takes nothing returns unit

constant native GetFilterDestructable takes nothing returns destructable
constant native GetEnumDestructable takes nothing returns destructable

constant native GetFilterItem takes nothing returns item
constant native GetEnumItem takes nothing returns item

constant native GetFilterPlayer takes nothing returns player
constant native GetEnumPlayer takes nothing returns player

constant native GetTriggeringTrigger takes nothing returns trigger
constant native GetTriggerEventId takes nothing returns eventid
constant native GetTriggerEvalCount takes trigger whichTrigger returns integer
constant native GetTriggerExecCount takes trigger whichTrigger returns integer

native ExecuteFunc takes string funcName returns nothing




native And takes boolexpr operandA, boolexpr operandB returns boolexpr
native Or takes boolexpr operandA, boolexpr operandB returns boolexpr
native Not takes boolexpr operand returns boolexpr
native Condition takes code func returns conditionfunc
native DestroyCondition takes conditionfunc c returns nothing
native Filter takes code func returns filterfunc
native DestroyFilter takes filterfunc f returns nothing
native DestroyBoolExpr takes boolexpr e returns nothing





native TriggerRegisterVariableEvent takes trigger whichTrigger, string varName, limitop opcode, real limitval returns event

 
 


native TriggerRegisterTimerEvent takes trigger whichTrigger, real timeout, boolean periodic returns event


native TriggerRegisterTimerExpireEvent takes trigger whichTrigger, timer t returns event

native TriggerRegisterGameStateEvent takes trigger whichTrigger, gamestate whichState, limitop opcode, real limitval returns event

native TriggerRegisterDialogEvent takes trigger whichTrigger, dialog whichDialog returns event
native TriggerRegisterDialogButtonEvent takes trigger whichTrigger, button whichButton returns event


constant native GetEventGameState takes nothing returns gamestate

native TriggerRegisterGameEvent takes trigger whichTrigger, gameevent whichGameEvent returns event

constant native GetWinningPlayer takes nothing returns player
native TriggerRegisterEnterRegion takes trigger whichTrigger, region whichRegion, boolexpr filter returns event


constant native GetTriggeringRegion takes nothing returns region
constant native GetEnteringUnit takes nothing returns unit



native TriggerRegisterLeaveRegion takes trigger whichTrigger, region whichRegion, boolexpr filter returns event
constant native GetLeavingUnit takes nothing returns unit

native TriggerRegisterTrackableHitEvent takes trigger whichTrigger, trackable t returns event
native TriggerRegisterTrackableTrackEvent takes trigger whichTrigger, trackable t returns event



constant native GetTriggeringTrackable takes nothing returns trackable


constant native GetClickedButton takes nothing returns button
constant native GetClickedDialog takes nothing returns dialog


constant native GetTournamentFinishSoonTimeRemaining takes nothing returns real
constant native GetTournamentFinishNowRule takes nothing returns integer
constant native GetTournamentFinishNowPlayer takes nothing returns player
constant native GetTournamentScore takes player whichPlayer returns integer


constant native GetSaveBasicFilename takes nothing returns string





native TriggerRegisterPlayerEvent takes trigger whichTrigger, player whichPlayer, playerevent whichPlayerEvent returns event



constant native GetTriggerPlayer takes nothing returns player

native TriggerRegisterPlayerUnitEvent takes trigger whichTrigger, player whichPlayer, playerunitevent whichPlayerUnitEvent, boolexpr filter returns event



constant native GetLevelingUnit takes nothing returns unit



constant native GetLearningUnit takes nothing returns unit
constant native GetLearnedSkill takes nothing returns integer
constant native GetLearnedSkillLevel takes nothing returns integer


constant native GetRevivableUnit takes nothing returns unit







constant native GetRevivingUnit takes nothing returns unit


constant native GetAttacker takes nothing returns unit


constant native GetRescuer takes nothing returns unit


constant native GetDyingUnit takes nothing returns unit
constant native GetKillingUnit takes nothing returns unit


constant native GetDecayingUnit takes nothing returns unit





constant native GetConstructingStructure takes nothing returns unit



constant native GetCancelledStructure takes nothing returns unit
constant native GetConstructedStructure takes nothing returns unit




constant native GetResearchingUnit takes nothing returns unit
constant native GetResearched takes nothing returns integer



constant native GetTrainedUnitType takes nothing returns integer


constant native GetTrainedUnit takes nothing returns unit


constant native GetDetectedUnit takes nothing returns unit


constant native GetSummoningUnit takes nothing returns unit
constant native GetSummonedUnit takes nothing returns unit


constant native GetTransportUnit takes nothing returns unit
constant native GetLoadedUnit takes nothing returns unit


constant native GetSellingUnit takes nothing returns unit
constant native GetSoldUnit takes nothing returns unit
constant native GetBuyingUnit takes nothing returns unit


constant native GetSoldItem takes nothing returns item


constant native GetChangingUnit takes nothing returns unit
constant native GetChangingUnitPrevOwner takes nothing returns player




constant native GetManipulatingUnit takes nothing returns unit
constant native GetManipulatedItem takes nothing returns item


constant native GetOrderedUnit takes nothing returns unit
constant native GetIssuedOrderId takes nothing returns integer


constant native GetOrderPointX takes nothing returns real
constant native GetOrderPointY takes nothing returns real
constant native GetOrderPointLoc takes nothing returns location


constant native GetOrderTarget takes nothing returns widget
constant native GetOrderTargetDestructable takes nothing returns destructable
constant native GetOrderTargetItem takes nothing returns item
constant native GetOrderTargetUnit takes nothing returns unit











constant native GetSpellAbilityUnit takes nothing returns unit
constant native GetSpellAbilityId takes nothing returns integer
constant native GetSpellAbility takes nothing returns ability
constant native GetSpellTargetLoc takes nothing returns location
constant native GetSpellTargetX				takes nothing returns real
constant native GetSpellTargetY				takes nothing returns real
constant native GetSpellTargetDestructable takes nothing returns destructable
constant native GetSpellTargetItem takes nothing returns item
constant native GetSpellTargetUnit takes nothing returns unit

native TriggerRegisterPlayerAllianceChange takes trigger whichTrigger, player whichPlayer, alliancetype whichAlliance returns event
native TriggerRegisterPlayerStateEvent takes trigger whichTrigger, player whichPlayer, playerstate whichState, limitop opcode, real limitval returns event


constant native GetEventPlayerState takes nothing returns playerstate

native TriggerRegisterPlayerChatEvent takes trigger whichTrigger, player whichPlayer, string chatMessageToDetect, boolean exactMatchOnly returns event





constant native GetEventPlayerChatString takes nothing returns string


constant native GetEventPlayerChatStringMatched takes nothing returns string

native TriggerRegisterDeathEvent takes trigger whichTrigger, widget whichWidget returns event








constant native GetTriggerUnit takes nothing returns unit

native TriggerRegisterUnitStateEvent takes trigger whichTrigger, unit whichUnit, unitstate whichState, limitop opcode, real limitval returns event


constant native GetEventUnitState takes nothing returns unitstate

native TriggerRegisterUnitEvent takes trigger whichTrigger, unit whichUnit, unitevent whichEvent returns event


constant native GetEventDamage takes nothing returns real
constant native GetEventDamageSource takes nothing returns unit






constant native GetEventDetectingPlayer takes nothing returns player

native TriggerRegisterFilterUnitEvent takes trigger whichTrigger, unit whichUnit, unitevent whichEvent, boolexpr filter returns event



constant native GetEventTargetUnit takes nothing returns unit

































native TriggerRegisterUnitInRange takes trigger whichTrigger, unit whichUnit, real range, boolexpr filter returns event

native TriggerAddCondition takes trigger whichTrigger, boolexpr condition returns triggercondition
native TriggerRemoveCondition takes trigger whichTrigger, triggercondition whichCondition returns nothing
native TriggerClearConditions takes trigger whichTrigger returns nothing

native TriggerAddAction takes trigger whichTrigger, code actionFunc returns triggeraction
native TriggerRemoveAction takes trigger whichTrigger, triggeraction whichAction returns nothing
native TriggerClearActions takes trigger whichTrigger returns nothing
native TriggerSleepAction takes real timeout returns nothing
native TriggerWaitForSound takes sound s, real offset returns nothing
native TriggerEvaluate takes trigger whichTrigger returns boolean
native TriggerExecute takes trigger whichTrigger returns nothing
native TriggerExecuteWait takes trigger whichTrigger returns nothing
native TriggerSyncStart takes nothing returns nothing
native TriggerSyncReady takes nothing returns nothing



native GetWidgetLife takes widget whichWidget returns real
native SetWidgetLife takes widget whichWidget, real newLife returns nothing
native GetWidgetX takes widget whichWidget returns real
native GetWidgetY takes widget whichWidget returns real
constant native GetTriggerWidget takes nothing returns widget




native CreateDestructable takes integer objectid, real x, real y, real face, real scale, integer variation returns destructable
native CreateDestructableZ takes integer objectid, real x, real y, real z, real face, real scale, integer variation returns destructable
native CreateDeadDestructable takes integer objectid, real x, real y, real face, real scale, integer variation returns destructable
native CreateDeadDestructableZ takes integer objectid, real x, real y, real z, real face, real scale, integer variation returns destructable
native RemoveDestructable takes destructable d returns nothing
native KillDestructable takes destructable d returns nothing
native SetDestructableInvulnerable takes destructable d, boolean flag returns nothing
native IsDestructableInvulnerable takes destructable d returns boolean
native EnumDestructablesInRect takes rect r, boolexpr filter, code actionFunc returns nothing
native GetDestructableTypeId takes destructable d returns integer
native GetDestructableX takes destructable d returns real
native GetDestructableY takes destructable d returns real
native SetDestructableLife takes destructable d, real life returns nothing
native GetDestructableLife takes destructable d returns real
native SetDestructableMaxLife takes destructable d, real max returns nothing
native GetDestructableMaxLife takes destructable d returns real
native DestructableRestoreLife takes destructable d, real life, boolean birth returns nothing
native QueueDestructableAnimation takes destructable d, string whichAnimation returns nothing
native SetDestructableAnimation takes destructable d, string whichAnimation returns nothing
native SetDestructableAnimationSpeed takes destructable d, real speedFactor returns nothing
native ShowDestructable takes destructable d, boolean flag returns nothing
native GetDestructableOccluderHeight takes destructable d returns real
native SetDestructableOccluderHeight takes destructable d, real height returns nothing
native GetDestructableName takes destructable d returns string
constant native GetTriggerDestructable takes nothing returns destructable



native CreateItem takes integer itemid, real x, real y returns item
native RemoveItem takes item whichItem returns nothing
native GetItemPlayer takes item whichItem returns player
native GetItemTypeId takes item i returns integer
native GetItemX takes item i returns real
native GetItemY takes item i returns real
native SetItemPosition takes item i, real x, real y returns nothing
native SetItemDropOnDeath takes item whichItem, boolean flag returns nothing
native SetItemDroppable takes item i, boolean flag returns nothing
native SetItemPawnable takes item i, boolean flag returns nothing
native SetItemPlayer takes item whichItem, player whichPlayer, boolean changeColor returns nothing
native SetItemInvulnerable takes item whichItem, boolean flag returns nothing
native IsItemInvulnerable takes item whichItem returns boolean
native SetItemVisible takes item whichItem, boolean show returns nothing
native IsItemVisible takes item whichItem returns boolean
native IsItemOwned takes item whichItem returns boolean
native IsItemPowerup takes item whichItem returns boolean
native IsItemSellable takes item whichItem returns boolean
native IsItemPawnable takes item whichItem returns boolean
native IsItemIdPowerup takes integer itemId returns boolean
native IsItemIdSellable takes integer itemId returns boolean
native IsItemIdPawnable takes integer itemId returns boolean
native EnumItemsInRect takes rect r, boolexpr filter, code actionFunc returns nothing
native GetItemLevel takes item whichItem returns integer
native GetItemType takes item whichItem returns itemtype
native SetItemDropID takes item whichItem, integer unitId returns nothing
constant native GetItemName takes item whichItem returns string
native GetItemCharges takes item whichItem returns integer
native SetItemCharges takes item whichItem, integer charges returns nothing
native GetItemUserData takes item whichItem returns integer
native SetItemUserData takes item whichItem, integer data returns nothing




native CreateUnit takes player id, integer unitid, real x, real y, real face returns unit
native CreateUnitByName takes player whichPlayer, string unitname, real x, real y, real face returns unit
native CreateUnitAtLoc takes player id, integer unitid, location whichLocation, real face returns unit
native CreateUnitAtLocByName takes player id, string unitname, location whichLocation, real face returns unit
native CreateCorpse takes player whichPlayer, integer unitid, real x, real y, real face returns unit

native KillUnit takes unit whichUnit returns nothing
native RemoveUnit takes unit whichUnit returns nothing
native ShowUnit takes unit whichUnit, boolean show returns nothing

native SetUnitState takes unit whichUnit, unitstate whichUnitState, real newVal returns nothing
native SetUnitX takes unit whichUnit, real newX returns nothing
native SetUnitY takes unit whichUnit, real newY returns nothing
native SetUnitPosition takes unit whichUnit, real newX, real newY returns nothing
native SetUnitPositionLoc takes unit whichUnit, location whichLocation returns nothing
native SetUnitFacing takes unit whichUnit, real facingAngle returns nothing
native SetUnitFacingTimed takes unit whichUnit, real facingAngle, real duration returns nothing
native SetUnitMoveSpeed takes unit whichUnit, real newSpeed returns nothing
native SetUnitFlyHeight takes unit whichUnit, real newHeight, real rate returns nothing
native SetUnitTurnSpeed takes unit whichUnit, real newTurnSpeed returns nothing
native SetUnitPropWindow takes unit whichUnit, real newPropWindowAngle returns nothing
native SetUnitAcquireRange takes unit whichUnit, real newAcquireRange returns nothing
native SetUnitCreepGuard takes unit whichUnit, boolean creepGuard returns nothing

native GetUnitAcquireRange takes unit whichUnit returns real
native GetUnitTurnSpeed takes unit whichUnit returns real
native GetUnitPropWindow takes unit whichUnit returns real
native GetUnitFlyHeight takes unit whichUnit returns real

native GetUnitDefaultAcquireRange takes unit whichUnit returns real
native GetUnitDefaultTurnSpeed takes unit whichUnit returns real
native GetUnitDefaultPropWindow takes unit whichUnit returns real
native GetUnitDefaultFlyHeight takes unit whichUnit returns real

native SetUnitOwner takes unit whichUnit, player whichPlayer, boolean changeColor returns nothing
native SetUnitColor takes unit whichUnit, playercolor whichColor returns nothing

native SetUnitScale takes unit whichUnit, real scaleX, real scaleY, real scaleZ returns nothing
native SetUnitTimeScale takes unit whichUnit, real timeScale returns nothing
native SetUnitBlendTime takes unit whichUnit, real blendTime returns nothing
native SetUnitVertexColor takes unit whichUnit, integer red, integer green, integer blue, integer alpha returns nothing

native QueueUnitAnimation takes unit whichUnit, string whichAnimation returns nothing
native SetUnitAnimation takes unit whichUnit, string whichAnimation returns nothing
native SetUnitAnimationByIndex takes unit whichUnit, integer whichAnimation returns nothing
native SetUnitAnimationWithRarity takes unit whichUnit, string whichAnimation, raritycontrol rarity returns nothing
native AddUnitAnimationProperties takes unit whichUnit, string animProperties, boolean add returns nothing

native SetUnitLookAt takes unit whichUnit, string whichBone, unit lookAtTarget, real offsetX, real offsetY, real offsetZ returns nothing
native ResetUnitLookAt takes unit whichUnit returns nothing

native SetUnitRescuable takes unit whichUnit, player byWhichPlayer, boolean flag returns nothing
native SetUnitRescueRange takes unit whichUnit, real range returns nothing

native SetHeroStr takes unit whichHero, integer newStr, boolean permanent returns nothing
native SetHeroAgi takes unit whichHero, integer newAgi, boolean permanent returns nothing
native SetHeroInt takes unit whichHero, integer newInt, boolean permanent returns nothing

native GetHeroStr takes unit whichHero, boolean includeBonuses returns integer
native GetHeroAgi takes unit whichHero, boolean includeBonuses returns integer
native GetHeroInt takes unit whichHero, boolean includeBonuses returns integer

native UnitStripHeroLevel takes unit whichHero, integer howManyLevels returns boolean

native GetHeroXP takes unit whichHero returns integer
native SetHeroXP takes unit whichHero, integer newXpVal, boolean showEyeCandy returns nothing

native GetHeroSkillPoints takes unit whichHero returns integer
native UnitModifySkillPoints takes unit whichHero, integer skillPointDelta returns boolean

native AddHeroXP takes unit whichHero, integer xpToAdd, boolean showEyeCandy returns nothing
native SetHeroLevel takes unit whichHero, integer level, boolean showEyeCandy returns nothing
constant native GetHeroLevel takes unit whichHero returns integer
constant native GetUnitLevel takes unit whichUnit returns integer
native GetHeroProperName takes unit whichHero returns string
native SuspendHeroXP takes unit whichHero, boolean flag returns nothing
native IsSuspendedXP takes unit whichHero returns boolean
native SelectHeroSkill takes unit whichHero, integer abilcode returns nothing
native GetUnitAbilityLevel takes unit whichUnit, integer abilcode returns integer
native DecUnitAbilityLevel takes unit whichUnit, integer abilcode returns integer
native IncUnitAbilityLevel takes unit whichUnit, integer abilcode returns integer
native SetUnitAbilityLevel takes unit whichUnit, integer abilcode, integer level returns integer
native ReviveHero takes unit whichHero, real x, real y, boolean doEyecandy returns boolean
native ReviveHeroLoc takes unit whichHero, location loc, boolean doEyecandy returns boolean
native SetUnitExploded takes unit whichUnit, boolean exploded returns nothing
native SetUnitInvulnerable takes unit whichUnit, boolean flag returns nothing
native PauseUnit takes unit whichUnit, boolean flag returns nothing
native IsUnitPaused takes unit whichHero returns boolean
native SetUnitPathing takes unit whichUnit, boolean flag returns nothing

native ClearSelection takes nothing returns nothing
native SelectUnit takes unit whichUnit, boolean flag returns nothing

native GetUnitPointValue takes unit whichUnit returns integer
native GetUnitPointValueByType takes integer unitType returns integer


native UnitAddItem takes unit whichUnit, item whichItem returns boolean
native UnitAddItemById takes unit whichUnit, integer itemId returns item
native UnitAddItemToSlotById takes unit whichUnit, integer itemId, integer itemSlot returns boolean
native UnitRemoveItem takes unit whichUnit, item whichItem returns nothing
native UnitRemoveItemFromSlot takes unit whichUnit, integer itemSlot returns item
native UnitHasItem takes unit whichUnit, item whichItem returns boolean
native UnitItemInSlot takes unit whichUnit, integer itemSlot returns item
native UnitInventorySize takes unit whichUnit returns integer

native UnitDropItemPoint takes unit whichUnit, item whichItem, real x, real y returns boolean
native UnitDropItemSlot takes unit whichUnit, item whichItem, integer slot returns boolean
native UnitDropItemTarget takes unit whichUnit, item whichItem, widget target returns boolean

native UnitUseItem takes unit whichUnit, item whichItem returns boolean
native UnitUseItemPoint takes unit whichUnit, item whichItem, real x, real y returns boolean
native UnitUseItemTarget takes unit whichUnit, item whichItem, widget target returns boolean

constant native GetUnitX takes unit whichUnit returns real
constant native GetUnitY takes unit whichUnit returns real
constant native GetUnitLoc takes unit whichUnit returns location
constant native GetUnitFacing takes unit whichUnit returns real
constant native GetUnitMoveSpeed takes unit whichUnit returns real
constant native GetUnitDefaultMoveSpeed takes unit whichUnit returns real
constant native GetUnitState takes unit whichUnit, unitstate whichUnitState returns real
constant native GetOwningPlayer takes unit whichUnit returns player
constant native GetUnitTypeId takes unit whichUnit returns integer
constant native GetUnitRace takes unit whichUnit returns race
constant native GetUnitName takes unit whichUnit returns string
constant native GetUnitFoodUsed takes unit whichUnit returns integer
constant native GetUnitFoodMade takes unit whichUnit returns integer
constant native GetFoodMade takes integer unitId returns integer
constant native GetFoodUsed takes integer unitId returns integer
native SetUnitUseFood takes unit whichUnit, boolean useFood returns nothing

constant native GetUnitRallyPoint takes unit whichUnit returns location
constant native GetUnitRallyUnit takes unit whichUnit returns unit
constant native GetUnitRallyDestructable takes unit whichUnit returns destructable

constant native IsUnitInGroup takes unit whichUnit, group whichGroup returns boolean
constant native IsUnitInForce takes unit whichUnit, force whichForce returns boolean
constant native IsUnitOwnedByPlayer takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitAlly takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitEnemy takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitVisible takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitDetected takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitInvisible takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitFogged takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitMasked takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitSelected takes unit whichUnit, player whichPlayer returns boolean
constant native IsUnitRace takes unit whichUnit, race whichRace returns boolean
constant native IsUnitType takes unit whichUnit, unittype whichUnitType returns boolean
constant native IsUnit takes unit whichUnit, unit whichSpecifiedUnit returns boolean
constant native IsUnitInRange takes unit whichUnit, unit otherUnit, real distance returns boolean
constant native IsUnitInRangeXY takes unit whichUnit, real x, real y, real distance returns boolean
constant native IsUnitInRangeLoc takes unit whichUnit, location whichLocation, real distance returns boolean
constant native IsUnitHidden takes unit whichUnit returns boolean
constant native IsUnitIllusion takes unit whichUnit returns boolean

constant native IsUnitInTransport takes unit whichUnit, unit whichTransport returns boolean
constant native IsUnitLoaded takes unit whichUnit returns boolean

constant native IsHeroUnitId takes integer unitId returns boolean
constant native IsUnitIdType takes integer unitId, unittype whichUnitType returns boolean

native UnitShareVision takes unit whichUnit, player whichPlayer, boolean share returns nothing
native UnitSuspendDecay takes unit whichUnit, boolean suspend returns nothing
native UnitAddType takes unit whichUnit, unittype whichUnitType returns boolean
native UnitRemoveType takes unit whichUnit, unittype whichUnitType returns boolean

native UnitAddAbility takes unit whichUnit, integer abilityId returns boolean
native UnitRemoveAbility takes unit whichUnit, integer abilityId returns boolean
native UnitMakeAbilityPermanent takes unit whichUnit, boolean permanent, integer abilityId returns boolean
native UnitRemoveBuffs takes unit whichUnit, boolean removePositive, boolean removeNegative returns nothing
native UnitRemoveBuffsEx takes unit whichUnit, boolean removePositive, boolean removeNegative, boolean magic, boolean physical, boolean timedLife, boolean aura, boolean autoDispel returns nothing
native UnitHasBuffsEx takes unit whichUnit, boolean removePositive, boolean removeNegative, boolean magic, boolean physical, boolean timedLife, boolean aura, boolean autoDispel returns boolean
native UnitCountBuffsEx takes unit whichUnit, boolean removePositive, boolean removeNegative, boolean magic, boolean physical, boolean timedLife, boolean aura, boolean autoDispel returns integer
native UnitAddSleep takes unit whichUnit, boolean add returns nothing
native UnitCanSleep takes unit whichUnit returns boolean
native UnitAddSleepPerm takes unit whichUnit, boolean add returns nothing
native UnitCanSleepPerm takes unit whichUnit returns boolean
native UnitIsSleeping takes unit whichUnit returns boolean
native UnitWakeUp takes unit whichUnit returns nothing
native UnitApplyTimedLife takes unit whichUnit, integer buffId, real duration returns nothing
native UnitIgnoreAlarm takes unit whichUnit, boolean flag returns boolean
native UnitIgnoreAlarmToggled takes unit whichUnit returns boolean
native UnitResetCooldown takes unit whichUnit returns nothing
native UnitSetConstructionProgress takes unit whichUnit, integer constructionPercentage returns nothing
native UnitSetUpgradeProgress takes unit whichUnit, integer upgradePercentage returns nothing
native UnitPauseTimedLife takes unit whichUnit, boolean flag returns nothing
native UnitSetUsesAltIcon takes unit whichUnit, boolean flag returns nothing

native UnitDamagePoint takes unit whichUnit, real delay, real radius, real x, real y, real amount, boolean attack, boolean ranged, attacktype attackType, damagetype damageType, weapontype weaponType returns boolean
native UnitDamageTarget takes unit whichUnit, widget target, real amount, boolean attack, boolean ranged, attacktype attackType, damagetype damageType, weapontype weaponType returns boolean

native IssueImmediateOrder takes unit whichUnit, string order returns boolean
native IssueImmediateOrderById takes unit whichUnit, integer order returns boolean
native IssuePointOrder takes unit whichUnit, string order, real x, real y returns boolean
native IssuePointOrderLoc takes unit whichUnit, string order, location whichLocation returns boolean
native IssuePointOrderById takes unit whichUnit, integer order, real x, real y returns boolean
native IssuePointOrderByIdLoc takes unit whichUnit, integer order, location whichLocation returns boolean
native IssueTargetOrder takes unit whichUnit, string order, widget targetWidget returns boolean
native IssueTargetOrderById takes unit whichUnit, integer order, widget targetWidget returns boolean
native IssueInstantPointOrder takes unit whichUnit, string order, real x, real y, widget instantTargetWidget returns boolean
native IssueInstantPointOrderById takes unit whichUnit, integer order, real x, real y, widget instantTargetWidget returns boolean
native IssueInstantTargetOrder takes unit whichUnit, string order, widget targetWidget, widget instantTargetWidget returns boolean
native IssueInstantTargetOrderById takes unit whichUnit, integer order, widget targetWidget, widget instantTargetWidget returns boolean
native IssueBuildOrder takes unit whichPeon, string unitToBuild, real x, real y returns boolean
native IssueBuildOrderById takes unit whichPeon, integer unitId, real x, real y returns boolean

native IssueNeutralImmediateOrder takes player forWhichPlayer, unit neutralStructure, string unitToBuild returns boolean
native IssueNeutralImmediateOrderById takes player forWhichPlayer,unit neutralStructure, integer unitId returns boolean
native IssueNeutralPointOrder takes player forWhichPlayer,unit neutralStructure, string unitToBuild, real x, real y returns boolean
native IssueNeutralPointOrderById takes player forWhichPlayer,unit neutralStructure, integer unitId, real x, real y returns boolean
native IssueNeutralTargetOrder takes player forWhichPlayer,unit neutralStructure, string unitToBuild, widget target returns boolean
native IssueNeutralTargetOrderById takes player forWhichPlayer,unit neutralStructure, integer unitId, widget target returns boolean

native GetUnitCurrentOrder takes unit whichUnit returns integer

native SetResourceAmount takes unit whichUnit, integer amount returns nothing
native AddResourceAmount takes unit whichUnit, integer amount returns nothing
native GetResourceAmount takes unit whichUnit returns integer

native WaygateGetDestinationX takes unit waygate returns real
native WaygateGetDestinationY takes unit waygate returns real
native WaygateSetDestination takes unit waygate, real x, real y returns nothing
native WaygateActivate takes unit waygate, boolean activate returns nothing
native WaygateIsActive takes unit waygate returns boolean

native AddItemToAllStock takes integer itemId, integer currentStock, integer stockMax returns nothing
native AddItemToStock takes unit whichUnit, integer itemId, integer currentStock, integer stockMax returns nothing
native AddUnitToAllStock takes integer unitId, integer currentStock, integer stockMax returns nothing
native AddUnitToStock takes unit whichUnit, integer unitId, integer currentStock, integer stockMax returns nothing

native RemoveItemFromAllStock takes integer itemId returns nothing
native RemoveItemFromStock takes unit whichUnit, integer itemId returns nothing
native RemoveUnitFromAllStock takes integer unitId returns nothing
native RemoveUnitFromStock takes unit whichUnit, integer unitId returns nothing

native SetAllItemTypeSlots takes integer slots returns nothing
native SetAllUnitTypeSlots takes integer slots returns nothing
native SetItemTypeSlots takes unit whichUnit, integer slots returns nothing
native SetUnitTypeSlots takes unit whichUnit, integer slots returns nothing

native GetUnitUserData takes unit whichUnit returns integer
native SetUnitUserData takes unit whichUnit, integer data returns nothing



constant native Player takes integer number returns player
constant native GetLocalPlayer takes nothing returns player
constant native IsPlayerAlly takes player whichPlayer, player otherPlayer returns boolean
constant native IsPlayerEnemy takes player whichPlayer, player otherPlayer returns boolean
constant native IsPlayerInForce takes player whichPlayer, force whichForce returns boolean
constant native IsPlayerObserver takes player whichPlayer returns boolean
constant native IsVisibleToPlayer takes real x, real y, player whichPlayer returns boolean
constant native IsLocationVisibleToPlayer takes location whichLocation, player whichPlayer returns boolean
constant native IsFoggedToPlayer takes real x, real y, player whichPlayer returns boolean
constant native IsLocationFoggedToPlayer takes location whichLocation, player whichPlayer returns boolean
constant native IsMaskedToPlayer takes real x, real y, player whichPlayer returns boolean
constant native IsLocationMaskedToPlayer takes location whichLocation, player whichPlayer returns boolean

constant native GetPlayerRace takes player whichPlayer returns race
constant native GetPlayerId takes player whichPlayer returns integer
constant native GetPlayerUnitCount takes player whichPlayer, boolean includeIncomplete returns integer
constant native GetPlayerTypedUnitCount takes player whichPlayer, string unitName, boolean includeIncomplete, boolean includeUpgrades returns integer
constant native GetPlayerStructureCount takes player whichPlayer, boolean includeIncomplete returns integer
constant native GetPlayerState takes player whichPlayer, playerstate whichPlayerState returns integer
constant native GetPlayerScore takes player whichPlayer, playerscore whichPlayerScore returns integer
constant native GetPlayerAlliance takes player sourcePlayer, player otherPlayer, alliancetype whichAllianceSetting returns boolean

constant native GetPlayerHandicap takes player whichPlayer returns real
constant native GetPlayerHandicapXP takes player whichPlayer returns real
constant native SetPlayerHandicap takes player whichPlayer, real handicap returns nothing
constant native SetPlayerHandicapXP takes player whichPlayer, real handicap returns nothing

constant native SetPlayerTechMaxAllowed takes player whichPlayer, integer techid, integer maximum returns nothing
constant native GetPlayerTechMaxAllowed takes player whichPlayer, integer techid returns integer
constant native AddPlayerTechResearched takes player whichPlayer, integer techid, integer levels returns nothing
constant native SetPlayerTechResearched takes player whichPlayer, integer techid, integer setToLevel returns nothing
constant native GetPlayerTechResearched takes player whichPlayer, integer techid, boolean specificonly returns boolean
constant native GetPlayerTechCount takes player whichPlayer, integer techid, boolean specificonly returns integer

native SetPlayerUnitsOwner takes player whichPlayer, integer newOwner returns nothing
native CripplePlayer takes player whichPlayer, force toWhichPlayers, boolean flag returns nothing

native SetPlayerAbilityAvailable takes player whichPlayer, integer abilid, boolean avail returns nothing

native SetPlayerState takes player whichPlayer, playerstate whichPlayerState, integer value returns nothing
native RemovePlayer takes player whichPlayer, playergameresult gameResult returns nothing




native CachePlayerHeroData takes player whichPlayer returns nothing



native SetFogStateRect takes player forWhichPlayer, fogstate whichState, rect where, boolean useSharedVision returns nothing
native SetFogStateRadius takes player forWhichPlayer, fogstate whichState, real centerx, real centerY, real radius, boolean useSharedVision returns nothing
native SetFogStateRadiusLoc takes player forWhichPlayer, fogstate whichState, location center, real radius, boolean useSharedVision returns nothing
native FogMaskEnable takes boolean enable returns nothing
native IsFogMaskEnabled takes nothing returns boolean
native FogEnable takes boolean enable returns nothing
native IsFogEnabled takes nothing returns boolean

native CreateFogModifierRect takes player forWhichPlayer, fogstate whichState, rect where, boolean useSharedVision, boolean afterUnits returns fogmodifier
native CreateFogModifierRadius takes player forWhichPlayer, fogstate whichState, real centerx, real centerY, real radius, boolean useSharedVision, boolean afterUnits returns fogmodifier
native CreateFogModifierRadiusLoc takes player forWhichPlayer, fogstate whichState, location center, real radius, boolean useSharedVision, boolean afterUnits returns fogmodifier
native DestroyFogModifier takes fogmodifier whichFogModifier returns nothing
native FogModifierStart takes fogmodifier whichFogModifier returns nothing
native FogModifierStop takes fogmodifier whichFogModifier returns nothing



native VersionGet takes nothing returns version
native VersionCompatible takes version whichVersion returns boolean
native VersionSupported takes version whichVersion returns boolean

native EndGame takes boolean doScoreScreen returns nothing


native ChangeLevel takes string newLevel, boolean doScoreScreen returns nothing
native RestartGame takes boolean doScoreScreen returns nothing
native ReloadGame takes nothing returns nothing


native SetCampaignMenuRace takes race r returns nothing
native SetCampaignMenuRaceEx takes integer campaignIndex returns nothing
native ForceCampaignSelectScreen takes nothing returns nothing

native LoadGame takes string saveFileName, boolean doScoreScreen returns nothing
native SaveGame takes string saveFileName returns nothing
native RenameSaveDirectory takes string sourceDirName, string destDirName returns boolean
native RemoveSaveDirectory takes string sourceDirName returns boolean
native CopySaveGame takes string sourceSaveName, string destSaveName returns boolean
native SaveGameExists takes string saveName returns boolean
native SyncSelections takes nothing returns nothing
native SetFloatGameState takes fgamestate whichFloatGameState, real value returns nothing
constant native GetFloatGameState takes fgamestate whichFloatGameState returns real
native SetIntegerGameState takes igamestate whichIntegerGameState, integer value returns nothing
constant native GetIntegerGameState takes igamestate whichIntegerGameState returns integer


native SetTutorialCleared takes boolean cleared returns nothing
native SetMissionAvailable takes integer campaignNumber, integer missionNumber, boolean available returns nothing
native SetCampaignAvailable takes integer campaignNumber, boolean available returns nothing
native SetOpCinematicAvailable takes integer campaignNumber, boolean available returns nothing
native SetEdCinematicAvailable takes integer campaignNumber, boolean available returns nothing
native GetDefaultDifficulty takes nothing returns gamedifficulty
native SetDefaultDifficulty takes gamedifficulty g returns nothing
native SetCustomCampaignButtonVisible takes integer whichButton, boolean visible returns nothing
native GetCustomCampaignButtonVisible takes integer whichButton returns boolean
native DoNotSaveReplay takes nothing returns nothing



native DialogCreate takes nothing returns dialog
native DialogDestroy takes dialog whichDialog returns nothing
native DialogClear takes dialog whichDialog returns nothing
native DialogSetMessage takes dialog whichDialog, string messageText returns nothing
native DialogAddButton takes dialog whichDialog, string buttonText, integer hotkey returns button
native DialogAddQuitButton takes dialog whichDialog, boolean doScoreScreen, string buttonText, integer hotkey returns button
native DialogDisplay takes player whichPlayer, dialog whichDialog, boolean flag returns nothing




native ReloadGameCachesFromDisk takes nothing returns boolean

native InitGameCache takes string campaignFile returns gamecache
native SaveGameCache takes gamecache whichCache returns boolean

native StoreInteger					takes gamecache cache, string missionKey, string key, integer value returns nothing
native StoreReal						takes gamecache cache, string missionKey, string key, real value returns nothing
native StoreBoolean					takes gamecache cache, string missionKey, string key, boolean value returns nothing
native StoreUnit						takes gamecache cache, string missionKey, string key, unit whichUnit returns boolean
native StoreString						takes gamecache cache, string missionKey, string key, string value returns boolean

native SyncStoredInteger takes gamecache cache, string missionKey, string key returns nothing
native SyncStoredReal takes gamecache cache, string missionKey, string key returns nothing
native SyncStoredBoolean takes gamecache cache, string missionKey, string key returns nothing
native SyncStoredUnit takes gamecache cache, string missionKey, string key returns nothing
native SyncStoredString takes gamecache cache, string missionKey, string key returns nothing

native HaveStoredInteger					takes gamecache cache, string missionKey, string key returns boolean
native HaveStoredReal						takes gamecache cache, string missionKey, string key returns boolean
native HaveStoredBoolean					takes gamecache cache, string missionKey, string key returns boolean
native HaveStoredUnit						takes gamecache cache, string missionKey, string key returns boolean
native HaveStoredString					takes gamecache cache, string missionKey, string key returns boolean

native FlushGameCache						takes gamecache cache returns nothing
native FlushStoredMission					takes gamecache cache, string missionKey returns nothing
native FlushStoredInteger					takes gamecache cache, string missionKey, string key returns nothing
native FlushStoredReal						takes gamecache cache, string missionKey, string key returns nothing
native FlushStoredBoolean					takes gamecache cache, string missionKey, string key returns nothing
native FlushStoredUnit						takes gamecache cache, string missionKey, string key returns nothing
native FlushStoredString					takes gamecache cache, string missionKey, string key returns nothing


native GetStoredInteger				takes gamecache cache, string missionKey, string key returns integer
native GetStoredReal					takes gamecache cache, string missionKey, string key returns real
native GetStoredBoolean				takes gamecache cache, string missionKey, string key returns boolean
native GetStoredString					takes gamecache cache, string missionKey, string key returns string
native RestoreUnit						takes gamecache cache, string missionKey, string key, player forWhichPlayer, real x, real y, real facing returns unit
native InitHashtable takes nothing returns hashtable

native SaveInteger						takes hashtable table, integer parentKey, integer childKey, integer value returns nothing
native SaveReal						takes hashtable table, integer parentKey, integer childKey, real value returns nothing
native SaveBoolean						takes hashtable table, integer parentKey, integer childKey, boolean value returns nothing
native SaveStr							takes hashtable table, integer parentKey, integer childKey, string value returns boolean
native SavePlayerHandle				takes hashtable table, integer parentKey, integer childKey, player whichPlayer returns boolean
native SaveWidgetHandle				takes hashtable table, integer parentKey, integer childKey, widget whichWidget returns boolean
native SaveDestructableHandle			takes hashtable table, integer parentKey, integer childKey, destructable whichDestructable returns boolean
native SaveItemHandle					takes hashtable table, integer parentKey, integer childKey, item whichItem returns boolean
native SaveUnitHandle					takes hashtable table, integer parentKey, integer childKey, unit whichUnit returns boolean
native SaveAbilityHandle				takes hashtable table, integer parentKey, integer childKey, ability whichAbility returns boolean
native SaveTimerHandle					takes hashtable table, integer parentKey, integer childKey, timer whichTimer returns boolean
native SaveTriggerHandle				takes hashtable table, integer parentKey, integer childKey, trigger whichTrigger returns boolean
native SaveTriggerConditionHandle		takes hashtable table, integer parentKey, integer childKey, triggercondition whichTriggercondition returns boolean
native SaveTriggerActionHandle			takes hashtable table, integer parentKey, integer childKey, triggeraction whichTriggeraction returns boolean
native SaveTriggerEventHandle			takes hashtable table, integer parentKey, integer childKey, event whichEvent returns boolean
native SaveForceHandle					takes hashtable table, integer parentKey, integer childKey, force whichForce returns boolean
native SaveGroupHandle					takes hashtable table, integer parentKey, integer childKey, group whichGroup returns boolean
native SaveLocationHandle				takes hashtable table, integer parentKey, integer childKey, location whichLocation returns boolean
native SaveRectHandle					takes hashtable table, integer parentKey, integer childKey, rect whichRect returns boolean
native SaveBooleanExprHandle			takes hashtable table, integer parentKey, integer childKey, boolexpr whichBoolexpr returns boolean
native SaveSoundHandle					takes hashtable table, integer parentKey, integer childKey, sound whichSound returns boolean
native SaveEffectHandle				takes hashtable table, integer parentKey, integer childKey, effect whichEffect returns boolean
native SaveUnitPoolHandle				takes hashtable table, integer parentKey, integer childKey, unitpool whichUnitpool returns boolean
native SaveItemPoolHandle				takes hashtable table, integer parentKey, integer childKey, itempool whichItempool returns boolean
native SaveQuestHandle					takes hashtable table, integer parentKey, integer childKey, quest whichQuest returns boolean
native SaveQuestItemHandle				takes hashtable table, integer parentKey, integer childKey, questitem whichQuestitem returns boolean
native SaveDefeatConditionHandle		takes hashtable table, integer parentKey, integer childKey, defeatcondition whichDefeatcondition returns boolean
native SaveTimerDialogHandle			takes hashtable table, integer parentKey, integer childKey, timerdialog whichTimerdialog returns boolean
native SaveLeaderboardHandle			takes hashtable table, integer parentKey, integer childKey, leaderboard whichLeaderboard returns boolean
native SaveMultiboardHandle			takes hashtable table, integer parentKey, integer childKey, multiboard whichMultiboard returns boolean
native SaveMultiboardItemHandle		takes hashtable table, integer parentKey, integer childKey, multiboarditem whichMultiboarditem returns boolean
native SaveTrackableHandle				takes hashtable table, integer parentKey, integer childKey, trackable whichTrackable returns boolean
native SaveDialogHandle				takes hashtable table, integer parentKey, integer childKey, dialog whichDialog returns boolean
native SaveButtonHandle				takes hashtable table, integer parentKey, integer childKey, button whichButton returns boolean
native SaveTextTagHandle				takes hashtable table, integer parentKey, integer childKey, texttag whichTexttag returns boolean
native SaveLightningHandle				takes hashtable table, integer parentKey, integer childKey, lightning whichLightning returns boolean
native SaveImageHandle					takes hashtable table, integer parentKey, integer childKey, image whichImage returns boolean
native SaveUbersplatHandle				takes hashtable table, integer parentKey, integer childKey, ubersplat whichUbersplat returns boolean
native SaveRegionHandle				takes hashtable table, integer parentKey, integer childKey, region whichRegion returns boolean
native SaveFogStateHandle				takes hashtable table, integer parentKey, integer childKey, fogstate whichFogState returns boolean
native SaveFogModifierHandle			takes hashtable table, integer parentKey, integer childKey, fogmodifier whichFogModifier returns boolean
native SaveAgentHandle					takes hashtable table, integer parentKey, integer childKey, agent whichAgent returns boolean
native SaveHashtableHandle				takes hashtable table, integer parentKey, integer childKey, hashtable whichHashtable returns boolean
native LoadInteger					takes hashtable table, integer parentKey, integer childKey returns integer
native LoadReal					takes hashtable table, integer parentKey, integer childKey returns real
native LoadBoolean				 takes hashtable table, integer parentKey, integer childKey returns boolean
native LoadStr 					takes hashtable table, integer parentKey, integer childKey returns string
native LoadPlayerHandle			takes hashtable table, integer parentKey, integer childKey returns player
native LoadWidgetHandle			takes hashtable table, integer parentKey, integer childKey returns widget
native LoadDestructableHandle		takes hashtable table, integer parentKey, integer childKey returns destructable
native LoadItemHandle				takes hashtable table, integer parentKey, integer childKey returns item
native LoadUnitHandle				takes hashtable table, integer parentKey, integer childKey returns unit
native LoadAbilityHandle			takes hashtable table, integer parentKey, integer childKey returns ability
native LoadTimerHandle				takes hashtable table, integer parentKey, integer childKey returns timer
native LoadTriggerHandle			takes hashtable table, integer parentKey, integer childKey returns trigger
native LoadTriggerConditionHandle	takes hashtable table, integer parentKey, integer childKey returns triggercondition
native LoadTriggerActionHandle		takes hashtable table, integer parentKey, integer childKey returns triggeraction
native LoadTriggerEventHandle		takes hashtable table, integer parentKey, integer childKey returns event
native LoadForceHandle				takes hashtable table, integer parentKey, integer childKey returns force
native LoadGroupHandle				takes hashtable table, integer parentKey, integer childKey returns group
native LoadLocationHandle			takes hashtable table, integer parentKey, integer childKey returns location
native LoadRectHandle				takes hashtable table, integer parentKey, integer childKey returns rect
native LoadBooleanExprHandle		takes hashtable table, integer parentKey, integer childKey returns boolexpr
native LoadSoundHandle				takes hashtable table, integer parentKey, integer childKey returns sound
native LoadEffectHandle			takes hashtable table, integer parentKey, integer childKey returns effect
native LoadUnitPoolHandle			takes hashtable table, integer parentKey, integer childKey returns unitpool
native LoadItemPoolHandle			takes hashtable table, integer parentKey, integer childKey returns itempool
native LoadQuestHandle				takes hashtable table, integer parentKey, integer childKey returns quest
native LoadQuestItemHandle			takes hashtable table, integer parentKey, integer childKey returns questitem
native LoadDefeatConditionHandle	takes hashtable table, integer parentKey, integer childKey returns defeatcondition
native LoadTimerDialogHandle		takes hashtable table, integer parentKey, integer childKey returns timerdialog
native LoadLeaderboardHandle		takes hashtable table, integer parentKey, integer childKey returns leaderboard
native LoadMultiboardHandle		takes hashtable table, integer parentKey, integer childKey returns multiboard
native LoadMultiboardItemHandle	takes hashtable table, integer parentKey, integer childKey returns multiboarditem
native LoadTrackableHandle			takes hashtable table, integer parentKey, integer childKey returns trackable
native LoadDialogHandle			takes hashtable table, integer parentKey, integer childKey returns dialog
native LoadButtonHandle			takes hashtable table, integer parentKey, integer childKey returns button
native LoadTextTagHandle			takes hashtable table, integer parentKey, integer childKey returns texttag
native LoadLightningHandle			takes hashtable table, integer parentKey, integer childKey returns lightning
native LoadImageHandle				takes hashtable table, integer parentKey, integer childKey returns image
native LoadUbersplatHandle			takes hashtable table, integer parentKey, integer childKey returns ubersplat
native LoadRegionHandle			takes hashtable table, integer parentKey, integer childKey returns region
native LoadFogStateHandle			takes hashtable table, integer parentKey, integer childKey returns fogstate
native LoadFogModifierHandle		takes hashtable table, integer parentKey, integer childKey returns fogmodifier
native LoadHashtableHandle			takes hashtable table, integer parentKey, integer childKey returns hashtable

native HaveSavedInteger					takes hashtable table, integer parentKey, integer childKey returns boolean
native HaveSavedReal						takes hashtable table, integer parentKey, integer childKey returns boolean
native HaveSavedBoolean					takes hashtable table, integer parentKey, integer childKey returns boolean
native HaveSavedString					 takes hashtable table, integer parentKey, integer childKey returns boolean
native HaveSavedHandle 				takes hashtable table, integer parentKey, integer childKey returns boolean

native RemoveSavedInteger					takes hashtable table, integer parentKey, integer childKey returns nothing
native RemoveSavedReal						takes hashtable table, integer parentKey, integer childKey returns nothing
native RemoveSavedBoolean					takes hashtable table, integer parentKey, integer childKey returns nothing
native RemoveSavedString					takes hashtable table, integer parentKey, integer childKey returns nothing
native RemoveSavedHandle					takes hashtable table, integer parentKey, integer childKey returns nothing

native FlushParentHashtable						takes hashtable table returns nothing
native FlushChildHashtable					takes hashtable table, integer parentKey returns nothing


native GetRandomInt takes integer lowBound, integer highBound returns integer
native GetRandomReal takes real lowBound, real highBound returns real

native CreateUnitPool takes nothing returns unitpool
native DestroyUnitPool takes unitpool whichPool returns nothing
native UnitPoolAddUnitType takes unitpool whichPool, integer unitId, real weight returns nothing
native UnitPoolRemoveUnitType takes unitpool whichPool, integer unitId returns nothing
native PlaceRandomUnit takes unitpool whichPool, player forWhichPlayer, real x, real y, real facing returns unit

native CreateItemPool takes nothing returns itempool
native DestroyItemPool takes itempool whichItemPool returns nothing
native ItemPoolAddItemType takes itempool whichItemPool, integer itemId, real weight returns nothing
native ItemPoolRemoveItemType takes itempool whichItemPool, integer itemId returns nothing
native PlaceRandomItem takes itempool whichItemPool, real x, real y returns item


native ChooseRandomCreep takes integer level returns integer
native ChooseRandomNPBuilding takes nothing returns integer
native ChooseRandomItem takes integer level returns integer
native ChooseRandomItemEx takes itemtype whichType, integer level returns integer
native SetRandomSeed takes integer seed returns nothing



native SetTerrainFog takes real a, real b, real c, real d, real e returns nothing
native ResetTerrainFog takes nothing returns nothing

native SetUnitFog takes real a, real b, real c, real d, real e returns nothing
native SetTerrainFogEx takes integer style, real zstart, real zend, real density, real red, real green, real blue returns nothing
native DisplayTextToPlayer takes player toPlayer, real x, real y, string message returns nothing
native DisplayTimedTextToPlayer takes player toPlayer, real x, real y, real duration, string message returns nothing
native DisplayTimedTextFromPlayer takes player toPlayer, real x, real y, real duration, string message returns nothing
native ClearTextMessages takes nothing returns nothing
native SetDayNightModels takes string terrainDNCFile, string unitDNCFile returns nothing
native SetSkyModel takes string skyModelFile returns nothing
native EnableUserControl takes boolean b returns nothing
native EnableUserUI takes boolean b returns nothing
native SuspendTimeOfDay takes boolean b returns nothing
native SetTimeOfDayScale takes real r returns nothing
native GetTimeOfDayScale takes nothing returns real
native ShowInterface takes boolean flag, real fadeDuration returns nothing
native PauseGame takes boolean flag returns nothing
native UnitAddIndicator takes unit whichUnit, integer red, integer green, integer blue, integer alpha returns nothing
native AddIndicator takes widget whichWidget, integer red, integer green, integer blue, integer alpha returns nothing
native PingMinimap takes real x, real y, real duration returns nothing
native PingMinimapEx takes real x, real y, real duration, integer red, integer green, integer blue, boolean extraEffects returns nothing
native EnableOcclusion takes boolean flag returns nothing
native SetIntroShotText takes string introText returns nothing
native SetIntroShotModel takes string introModelPath returns nothing
native EnableWorldFogBoundary takes boolean b returns nothing
native PlayModelCinematic takes string modelName returns nothing
native PlayCinematic takes string movieName returns nothing
native ForceUIKey takes string key returns nothing
native ForceUICancel takes nothing returns nothing
native DisplayLoadDialog takes nothing returns nothing
native SetAltMinimapIcon takes string iconPath returns nothing
native DisableRestartMission takes boolean flag returns nothing

native CreateTextTag takes nothing returns texttag
native DestroyTextTag takes texttag t returns nothing
native SetTextTagText takes texttag t, string s, real height returns nothing
native SetTextTagPos takes texttag t, real x, real y, real heightOffset returns nothing
native SetTextTagPosUnit takes texttag t, unit whichUnit, real heightOffset returns nothing
native SetTextTagColor takes texttag t, integer red, integer green, integer blue, integer alpha returns nothing
native SetTextTagVelocity takes texttag t, real xvel, real yvel returns nothing
native SetTextTagVisibility takes texttag t, boolean flag returns nothing
native SetTextTagSuspended takes texttag t, boolean flag returns nothing
native SetTextTagPermanent takes texttag t, boolean flag returns nothing
native SetTextTagAge takes texttag t, real age returns nothing
native SetTextTagLifespan takes texttag t, real lifespan returns nothing
native SetTextTagFadepoint takes texttag t, real fadepoint returns nothing

native SetReservedLocalHeroButtons takes integer reserved returns nothing
native GetAllyColorFilterState takes nothing returns integer
native SetAllyColorFilterState takes integer state returns nothing
native GetCreepCampFilterState takes nothing returns boolean
native SetCreepCampFilterState takes boolean state returns nothing
native EnableMinimapFilterButtons takes boolean enableAlly, boolean enableCreep returns nothing
native EnableDragSelect takes boolean state, boolean ui returns nothing
native EnablePreSelect takes boolean state, boolean ui returns nothing
native EnableSelect takes boolean state, boolean ui returns nothing



native CreateTrackable takes string trackableModelPath, real x, real y, real facing returns trackable



native CreateQuest takes nothing returns quest
native DestroyQuest takes quest whichQuest returns nothing
native QuestSetTitle takes quest whichQuest, string title returns nothing
native QuestSetDescription takes quest whichQuest, string description returns nothing
native QuestSetIconPath takes quest whichQuest, string iconPath returns nothing

native QuestSetRequired takes quest whichQuest, boolean required returns nothing
native QuestSetCompleted takes quest whichQuest, boolean completed returns nothing
native QuestSetDiscovered takes quest whichQuest, boolean discovered returns nothing
native QuestSetFailed takes quest whichQuest, boolean failed returns nothing
native QuestSetEnabled takes quest whichQuest, boolean enabled returns nothing
native IsQuestRequired takes quest whichQuest returns boolean
native IsQuestCompleted takes quest whichQuest returns boolean
native IsQuestDiscovered takes quest whichQuest returns boolean
native IsQuestFailed takes quest whichQuest returns boolean
native IsQuestEnabled takes quest whichQuest returns boolean

native QuestCreateItem takes quest whichQuest returns questitem
native QuestItemSetDescription takes questitem whichQuestItem, string description returns nothing
native QuestItemSetCompleted takes questitem whichQuestItem, boolean completed returns nothing

native IsQuestItemCompleted takes questitem whichQuestItem returns boolean

native CreateDefeatCondition takes nothing returns defeatcondition
native DestroyDefeatCondition takes defeatcondition whichCondition returns nothing
native DefeatConditionSetDescription takes defeatcondition whichCondition, string description returns nothing

native FlashQuestDialogButton takes nothing returns nothing
native ForceQuestDialogUpdate takes nothing returns nothing



native CreateTimerDialog takes timer t returns timerdialog
native DestroyTimerDialog takes timerdialog whichDialog returns nothing
native TimerDialogSetTitle takes timerdialog whichDialog, string title returns nothing
native TimerDialogSetTitleColor takes timerdialog whichDialog, integer red, integer green, integer blue, integer alpha returns nothing
native TimerDialogSetTimeColor takes timerdialog whichDialog, integer red, integer green, integer blue, integer alpha returns nothing
native TimerDialogSetSpeed takes timerdialog whichDialog, real speedMultFactor returns nothing
native TimerDialogDisplay takes timerdialog whichDialog, boolean display returns nothing
native IsTimerDialogDisplayed takes timerdialog whichDialog returns boolean
native TimerDialogSetRealTimeRemaining takes timerdialog whichDialog, real timeRemaining returns nothing





native CreateLeaderboard takes nothing returns leaderboard
native DestroyLeaderboard takes leaderboard lb returns nothing

native LeaderboardDisplay takes leaderboard lb, boolean show returns nothing
native IsLeaderboardDisplayed takes leaderboard lb returns boolean

native LeaderboardGetItemCount takes leaderboard lb returns integer

native LeaderboardSetSizeByItemCount takes leaderboard lb, integer count returns nothing
native LeaderboardAddItem takes leaderboard lb, string label, integer value, player p returns nothing
native LeaderboardRemoveItem takes leaderboard lb, integer index returns nothing
native LeaderboardRemovePlayerItem takes leaderboard lb, player p returns nothing
native LeaderboardClear takes leaderboard lb returns nothing

native LeaderboardSortItemsByValue takes leaderboard lb, boolean ascending returns nothing
native LeaderboardSortItemsByPlayer takes leaderboard lb, boolean ascending returns nothing
native LeaderboardSortItemsByLabel takes leaderboard lb, boolean ascending returns nothing

native LeaderboardHasPlayerItem takes leaderboard lb, player p returns boolean
native LeaderboardGetPlayerIndex takes leaderboard lb, player p returns integer
native LeaderboardSetLabel takes leaderboard lb, string label returns nothing
native LeaderboardGetLabelText takes leaderboard lb returns string

native PlayerSetLeaderboard takes player toPlayer, leaderboard lb returns nothing
native PlayerGetLeaderboard takes player toPlayer returns leaderboard

native LeaderboardSetLabelColor takes leaderboard lb, integer red, integer green, integer blue, integer alpha returns nothing
native LeaderboardSetValueColor takes leaderboard lb, integer red, integer green, integer blue, integer alpha returns nothing
native LeaderboardSetStyle takes leaderboard lb, boolean showLabel, boolean showNames, boolean showValues, boolean showIcons returns nothing

native LeaderboardSetItemValue takes leaderboard lb, integer whichItem, integer val returns nothing
native LeaderboardSetItemLabel takes leaderboard lb, integer whichItem, string val returns nothing
native LeaderboardSetItemStyle takes leaderboard lb, integer whichItem, boolean showLabel, boolean showValue, boolean showIcon returns nothing
native LeaderboardSetItemLabelColor takes leaderboard lb, integer whichItem, integer red, integer green, integer blue, integer alpha returns nothing
native LeaderboardSetItemValueColor takes leaderboard lb, integer whichItem, integer red, integer green, integer blue, integer alpha returns nothing






native CreateMultiboard takes nothing returns multiboard
native DestroyMultiboard takes multiboard lb returns nothing

native MultiboardDisplay takes multiboard lb, boolean show returns nothing
native IsMultiboardDisplayed takes multiboard lb returns boolean

native MultiboardMinimize takes multiboard lb, boolean minimize returns nothing
native IsMultiboardMinimized takes multiboard lb returns boolean
native MultiboardClear takes multiboard lb returns nothing

native MultiboardSetTitleText takes multiboard lb, string label returns nothing
native MultiboardGetTitleText takes multiboard lb returns string
native MultiboardSetTitleTextColor takes multiboard lb, integer red, integer green, integer blue, integer alpha returns nothing

native MultiboardGetRowCount takes multiboard lb returns integer
native MultiboardGetColumnCount takes multiboard lb returns integer

native MultiboardSetColumnCount takes multiboard lb, integer count returns nothing
native MultiboardSetRowCount takes multiboard lb, integer count returns nothing


native MultiboardSetItemsStyle takes multiboard lb, boolean showValues, boolean showIcons returns nothing
native MultiboardSetItemsValue takes multiboard lb, string value returns nothing
native MultiboardSetItemsValueColor takes multiboard lb, integer red, integer green, integer blue, integer alpha returns nothing
native MultiboardSetItemsWidth takes multiboard lb, real width returns nothing
native MultiboardSetItemsIcon takes multiboard lb, string iconPath returns nothing

native MultiboardGetItem takes multiboard lb, integer row, integer column returns multiboarditem
native MultiboardReleaseItem takes multiboarditem mbi returns nothing

native MultiboardSetItemStyle takes multiboarditem mbi, boolean showValue, boolean showIcon returns nothing
native MultiboardSetItemValue takes multiboarditem mbi, string val returns nothing
native MultiboardSetItemValueColor takes multiboarditem mbi, integer red, integer green, integer blue, integer alpha returns nothing
native MultiboardSetItemWidth takes multiboarditem mbi, real width returns nothing
native MultiboardSetItemIcon takes multiboarditem mbi, string iconFileName returns nothing




native MultiboardSuppressDisplay takes boolean flag returns nothing



native SetCameraPosition takes real x, real y returns nothing
native SetCameraQuickPosition takes real x, real y returns nothing
native SetCameraBounds takes real x1, real y1, real x2, real y2, real x3, real y3, real x4, real y4 returns nothing
native StopCamera takes nothing returns nothing
native ResetToGameCamera takes real duration returns nothing
native PanCameraTo takes real x, real y returns nothing
native PanCameraToTimed takes real x, real y, real duration returns nothing
native PanCameraToWithZ takes real x, real y, real zOffsetDest returns nothing
native PanCameraToTimedWithZ takes real x, real y, real zOffsetDest, real duration returns nothing
native SetCinematicCamera takes string cameraModelFile returns nothing
native SetCameraRotateMode takes real x, real y, real radiansToSweep, real duration returns nothing
native SetCameraField takes camerafield whichField, real value, real duration returns nothing
native AdjustCameraField takes camerafield whichField, real offset, real duration returns nothing
native SetCameraTargetController takes unit whichUnit, real xoffset, real yoffset, boolean inheritOrientation returns nothing
native SetCameraOrientController takes unit whichUnit, real xoffset, real yoffset returns nothing

native CreateCameraSetup takes nothing returns camerasetup
native CameraSetupSetField takes camerasetup whichSetup, camerafield whichField, real value, real duration returns nothing
native CameraSetupGetField takes camerasetup whichSetup, camerafield whichField returns real
native CameraSetupSetDestPosition takes camerasetup whichSetup, real x, real y, real duration returns nothing
native CameraSetupGetDestPositionLoc takes camerasetup whichSetup returns location
native CameraSetupGetDestPositionX takes camerasetup whichSetup returns real
native CameraSetupGetDestPositionY takes camerasetup whichSetup returns real
native CameraSetupApply takes camerasetup whichSetup, boolean doPan, boolean panTimed returns nothing
native CameraSetupApplyWithZ takes camerasetup whichSetup, real zDestOffset returns nothing
native CameraSetupApplyForceDuration takes camerasetup whichSetup, boolean doPan, real forceDuration returns nothing
native CameraSetupApplyForceDurationWithZ takes camerasetup whichSetup, real zDestOffset, real forceDuration returns nothing

native CameraSetTargetNoise takes real mag, real velocity returns nothing
native CameraSetSourceNoise takes real mag, real velocity returns nothing

native CameraSetTargetNoiseEx takes real mag, real velocity, boolean vertOnly returns nothing
native CameraSetSourceNoiseEx takes real mag, real velocity, boolean vertOnly returns nothing

native CameraSetSmoothingFactor takes real factor returns nothing

native SetCineFilterTexture takes string filename returns nothing
native SetCineFilterBlendMode takes blendmode whichMode returns nothing
native SetCineFilterTexMapFlags takes texmapflags whichFlags returns nothing
native SetCineFilterStartUV takes real minu, real minv, real maxu, real maxv returns nothing
native SetCineFilterEndUV takes real minu, real minv, real maxu, real maxv returns nothing
native SetCineFilterStartColor takes integer red, integer green, integer blue, integer alpha returns nothing
native SetCineFilterEndColor takes integer red, integer green, integer blue, integer alpha returns nothing
native SetCineFilterDuration takes real duration returns nothing
native DisplayCineFilter takes boolean flag returns nothing
native IsCineFilterDisplayed takes nothing returns boolean

native SetCinematicScene takes integer portraitUnitId, playercolor color, string speakerTitle, string text, real sceneDuration, real voiceoverDuration returns nothing
native EndCinematicScene takes nothing returns nothing
native ForceCinematicSubtitles takes boolean flag returns nothing

native GetCameraMargin takes integer whichMargin returns real


constant native GetCameraBoundMinX takes nothing returns real
constant native GetCameraBoundMinY takes nothing returns real
constant native GetCameraBoundMaxX takes nothing returns real
constant native GetCameraBoundMaxY takes nothing returns real
constant native GetCameraField takes camerafield whichField returns real
constant native GetCameraTargetPositionX takes nothing returns real
constant native GetCameraTargetPositionY takes nothing returns real
constant native GetCameraTargetPositionZ takes nothing returns real
constant native GetCameraTargetPositionLoc takes nothing returns location
constant native GetCameraEyePositionX takes nothing returns real
constant native GetCameraEyePositionY takes nothing returns real
constant native GetCameraEyePositionZ takes nothing returns real
constant native GetCameraEyePositionLoc takes nothing returns location




native NewSoundEnvironment takes string environmentName returns nothing

native CreateSound takes string fileName, boolean looping, boolean is3D, boolean stopwhenoutofrange, integer fadeInRate, integer fadeOutRate, string eaxSetting returns sound
native CreateSoundFilenameWithLabel takes string fileName, boolean looping, boolean is3D, boolean stopwhenoutofrange, integer fadeInRate, integer fadeOutRate, string SLKEntryName returns sound
native CreateSoundFromLabel takes string soundLabel, boolean looping, boolean is3D, boolean stopwhenoutofrange, integer fadeInRate, integer fadeOutRate returns sound
native CreateMIDISound takes string soundLabel, integer fadeInRate, integer fadeOutRate returns sound

native SetSoundParamsFromLabel takes sound soundHandle, string soundLabel returns nothing
native SetSoundDistanceCutoff takes sound soundHandle, real cutoff returns nothing
native SetSoundChannel takes sound soundHandle, integer channel returns nothing
native SetSoundVolume takes sound soundHandle, integer volume returns nothing
native SetSoundPitch takes sound soundHandle, real pitch returns nothing


native SetSoundPlayPosition takes sound soundHandle, integer millisecs returns nothing


native SetSoundDistances takes sound soundHandle, real minDist, real maxDist returns nothing
native SetSoundConeAngles takes sound soundHandle, real inside, real outside, integer outsideVolume returns nothing
native SetSoundConeOrientation takes sound soundHandle, real x, real y, real z returns nothing
native SetSoundPosition takes sound soundHandle, real x, real y, real z returns nothing
native SetSoundVelocity takes sound soundHandle, real x, real y, real z returns nothing
native AttachSoundToUnit takes sound soundHandle, unit whichUnit returns nothing

native StartSound takes sound soundHandle returns nothing
native StopSound takes sound soundHandle, boolean killWhenDone, boolean fadeOut returns nothing
native KillSoundWhenDone takes sound soundHandle returns nothing


native SetMapMusic takes string musicName, boolean random, integer index returns nothing
native ClearMapMusic takes nothing returns nothing

native PlayMusic takes string musicName returns nothing
native PlayMusicEx takes string musicName, integer frommsecs, integer fadeinmsecs returns nothing
native StopMusic takes boolean fadeOut returns nothing
native ResumeMusic takes nothing returns nothing

native PlayThematicMusic takes string musicFileName returns nothing
native PlayThematicMusicEx takes string musicFileName, integer frommsecs returns nothing
native EndThematicMusic takes nothing returns nothing

native SetMusicVolume takes integer volume returns nothing
native SetMusicPlayPosition takes integer millisecs returns nothing
native SetThematicMusicPlayPosition takes integer millisecs returns nothing


native SetSoundDuration takes sound soundHandle, integer duration returns nothing
native GetSoundDuration takes sound soundHandle returns integer
native GetSoundFileDuration takes string musicFileName returns integer

native VolumeGroupSetVolume takes volumegroup vgroup, real scale returns nothing
native VolumeGroupReset takes nothing returns nothing

native GetSoundIsPlaying takes sound soundHandle returns boolean
native GetSoundIsLoading takes sound soundHandle returns boolean

native RegisterStackedSound takes sound soundHandle, boolean byPosition, real rectwidth, real rectheight returns nothing
native UnregisterStackedSound takes sound soundHandle, boolean byPosition, real rectwidth, real rectheight returns nothing




native AddWeatherEffect takes rect where, integer effectID returns weathereffect
native RemoveWeatherEffect takes weathereffect whichEffect returns nothing
native EnableWeatherEffect takes weathereffect whichEffect, boolean enable returns nothing

native TerrainDeformCrater takes real x, real y, real radius, real depth, integer duration, boolean permanent returns terraindeformation
native TerrainDeformRipple takes real x, real y, real radius, real depth, integer duration, integer count, real spaceWaves, real timeWaves, real radiusStartPct, boolean limitNeg returns terraindeformation
native TerrainDeformWave takes real x, real y, real dirX, real dirY, real distance, real speed, real radius, real depth, integer trailTime, integer count returns terraindeformation
native TerrainDeformRandom takes real x, real y, real radius, real minDelta, real maxDelta, integer duration, integer updateInterval returns terraindeformation
native TerrainDeformStop takes terraindeformation deformation, integer duration returns nothing
native TerrainDeformStopAll takes nothing returns nothing

native AddSpecialEffect takes string modelName, real x, real y returns effect
native AddSpecialEffectLoc takes string modelName, location where returns effect
native AddSpecialEffectTarget takes string modelName, widget targetWidget, string attachPointName returns effect
native DestroyEffect takes effect whichEffect returns nothing

native AddSpellEffect takes string abilityString, effecttype t, real x, real y returns effect
native AddSpellEffectLoc takes string abilityString, effecttype t,location where returns effect
native AddSpellEffectById takes integer abilityId, effecttype t,real x, real y returns effect
native AddSpellEffectByIdLoc takes integer abilityId, effecttype t,location where returns effect
native AddSpellEffectTarget takes string modelName, effecttype t, widget targetWidget, string attachPoint returns effect
native AddSpellEffectTargetById takes integer abilityId, effecttype t, widget targetWidget, string attachPoint returns effect

native AddLightning takes string codeName, boolean checkVisibility, real x1, real y1, real x2, real y2 returns lightning
native AddLightningEx takes string codeName, boolean checkVisibility, real x1, real y1, real z1, real x2, real y2, real z2 returns lightning
native DestroyLightning takes lightning whichBolt returns boolean
native MoveLightning takes lightning whichBolt, boolean checkVisibility, real x1, real y1, real x2, real y2 returns boolean
native MoveLightningEx takes lightning whichBolt, boolean checkVisibility, real x1, real y1, real z1, real x2, real y2, real z2 returns boolean
native GetLightningColorA takes lightning whichBolt returns real
native GetLightningColorR takes lightning whichBolt returns real
native GetLightningColorG takes lightning whichBolt returns real
native GetLightningColorB takes lightning whichBolt returns real
native SetLightningColor takes lightning whichBolt, real r, real g, real b, real a returns boolean

native GetAbilityEffect takes string abilityString, effecttype t, integer index returns string
native GetAbilityEffectById takes integer abilityId, effecttype t, integer index returns string
native GetAbilitySound takes string abilityString, soundtype t returns string
native GetAbilitySoundById takes integer abilityId, soundtype t returns string




native GetTerrainCliffLevel takes real x, real y returns integer
native SetWaterBaseColor takes integer red, integer green, integer blue, integer alpha returns nothing
native SetWaterDeforms takes boolean val returns nothing
native GetTerrainType takes real x, real y returns integer
native GetTerrainVariance takes real x, real y returns integer
native SetTerrainType takes real x, real y, integer terrainType, integer variation, integer area, integer shape returns nothing
native IsTerrainPathable takes real x, real y, pathingtype t returns boolean
native SetTerrainPathable takes real x, real y, pathingtype t, boolean flag returns nothing




native CreateImage takes string file, real sizeX, real sizeY, real sizeZ, real posX, real posY, real posZ, real originX, real originY, real originZ, integer imageType returns image
native DestroyImage takes image whichImage returns nothing
native ShowImage takes image whichImage, boolean flag returns nothing
native SetImageConstantHeight takes image whichImage, boolean flag, real height returns nothing
native SetImagePosition takes image whichImage, real x, real y, real z returns nothing
native SetImageColor takes image whichImage, integer red, integer green, integer blue, integer alpha returns nothing
native SetImageRender takes image whichImage, boolean flag returns nothing
native SetImageRenderAlways takes image whichImage, boolean flag returns nothing
native SetImageAboveWater takes image whichImage, boolean flag, boolean useWaterAlpha returns nothing
native SetImageType takes image whichImage, integer imageType returns nothing




native CreateUbersplat takes real x, real y, string name, integer red, integer green, integer blue, integer alpha, boolean forcePaused, boolean noBirthTime returns ubersplat
native DestroyUbersplat takes ubersplat whichSplat returns nothing
native ResetUbersplat takes ubersplat whichSplat returns nothing
native FinishUbersplat takes ubersplat whichSplat returns nothing
native ShowUbersplat takes ubersplat whichSplat, boolean flag returns nothing
native SetUbersplatRender takes ubersplat whichSplat, boolean flag returns nothing
native SetUbersplatRenderAlways takes ubersplat whichSplat, boolean flag returns nothing




native SetBlight takes player whichPlayer, real x, real y, real radius, boolean addBlight returns nothing
native SetBlightRect takes player whichPlayer, rect r, boolean addBlight returns nothing
native SetBlightPoint takes player whichPlayer, real x, real y, boolean addBlight returns nothing
native SetBlightLoc takes player whichPlayer, location whichLocation, real radius, boolean addBlight returns nothing
native CreateBlightedGoldmine takes player id, real x, real y, real face returns unit
native IsPointBlighted takes real x, real y returns boolean




native SetDoodadAnimation takes real x, real y, real radius, integer doodadID, boolean nearestOnly, string animName, boolean animRandom returns nothing
native SetDoodadAnimationRect takes rect r, integer doodadID, string animName, boolean animRandom returns nothing




native StartMeleeAI takes player num, string script returns nothing
native StartCampaignAI takes player num, string script returns nothing
native CommandAI takes player num, integer command, integer data returns nothing
native PauseCompAI takes player p, boolean pause returns nothing
native GetAIDifficulty takes player num returns aidifficulty

native RemoveGuardPosition takes unit hUnit returns nothing
native RecycleGuardPosition takes unit hUnit returns nothing
native RemoveAllGuardPositions takes player num returns nothing


native Cheat takes string cheatStr returns nothing
native IsNoVictoryCheat takes nothing returns boolean
native IsNoDefeatCheat takes nothing returns boolean

native Preload takes string filename returns nothing
native PreloadEnd takes real timeout returns nothing

native PreloadStart takes nothing returns nothing
native PreloadRefresh takes nothing returns nothing
native PreloadEndEx takes nothing returns nothing

native PreloadGenClear takes nothing returns nothing
native PreloadGenStart takes nothing returns nothing
native PreloadGenEnd takes string filename returns nothing
native Preloader takes string filename returns nothing


native AutomationTestStart takes string testName returns nothing
native AutomationTestEnd takes string testName returns nothing


native BlzGetTriggerPlayerMouseX takes nothing returns real
native BlzGetTriggerPlayerMouseY takes nothing returns real
native BlzGetTriggerPlayerMousePosition takes nothing returns location
native BlzGetTriggerPlayerMouseButton takes nothing returns mousebuttontype
native BlzSetAbilityTooltip takes integer abilCode, string tooltip, integer level returns nothing
native BlzSetAbilityActivatedTooltip takes integer abilCode, string tooltip, integer level returns nothing
native BlzSetAbilityExtendedTooltip takes integer abilCode, string ExtendedTooltip, integer level returns nothing
native BlzSetAbilityActivatedExtendedTooltip takes integer abilCode, string ExtendedTooltip, integer level returns nothing
native BlzSetAbilityResearchTooltip takes integer abilCode, string researchTooltip, integer level returns nothing
native BlzSetAbilityResearchExtendedTooltip takes integer abilCode, string researchExtendedTooltip, integer level returns nothing
native BlzGetAbilityTooltip takes integer abilCode, integer level returns string
native BlzGetAbilityActivatedTooltip takes integer abilCode, integer level returns string
native BlzGetAbilityExtendedTooltip takes integer abilCode, integer level returns string
native BlzGetAbilityActivatedExtendedTooltip takes integer abilCode, integer level returns string
native BlzGetAbilityResearchTooltip takes integer abilCode, integer level returns string
native BlzGetAbilityResearchExtendedTooltip takes integer abilCode, integer level returns string
native BlzSetAbilityIcon takes integer abilCode, string iconPath returns nothing
native BlzGetAbilityIcon takes integer abilCode returns string
native BlzSetAbilityActivatedIcon takes integer abilCode, string iconPath returns nothing
native BlzGetAbilityActivatedIcon takes integer abilCode returns string
native BlzGetAbilityPosX takes integer abilCode returns integer
native BlzGetAbilityPosY takes integer abilCode returns integer
native BlzSetAbilityPosX takes integer abilCode, integer x returns nothing
native BlzSetAbilityPosY takes integer abilCode, integer y returns nothing
native BlzGetAbilityActivatedPosX takes integer abilCode returns integer
native BlzGetAbilityActivatedPosY takes integer abilCode returns integer
native BlzSetAbilityActivatedPosX takes integer abilCode, integer x returns nothing
native BlzSetAbilityActivatedPosY takes integer abilCode, integer y returns nothing
native BlzGetUnitMaxHP takes unit whichUnit returns integer
native BlzSetUnitMaxHP takes unit whichUnit, integer hp returns nothing
native BlzGetUnitMaxMana takes unit whichUnit returns integer
native BlzSetUnitMaxMana takes unit whichUnit, integer mana returns nothing
native BlzDeleteHeroAbility takes unit whichUnit, integer abilCode returns nothing
native BlzSetItemName takes item whichItem, string name returns nothing
native BlzSetItemDescription takes item whichItem, string name returns nothing
native BlzGetItemDescription takes item whichItem returns string
native BlzSetItemTooltip takes item whichItem, string name returns nothing
native BlzGetItemTooltip takes item whichItem returns string
native BlzSetItemExtendedTooltip takes item whichItem, string name returns nothing
native BlzGetItemExtendedTooltip takes item whichItem returns string
native BlzSetItemIconPath takes item whichItem, string name returns nothing
native BlzGetItemIconPath takes item whichItem returns string
native BlzSetUnitName takes unit whichUnit, string name returns nothing
native BlzSetHeroProperName takes unit whichUnit, string name returns nothing
native BlzGetUnitBaseDamage takes unit whichUnit, integer weaponIndex returns integer
native BlzSetUnitBaseDamage takes unit whichUnit, integer baseDamage, integer weaponIndex returns nothing
native BlzGetUnitDiceNumber takes unit whichUnit, integer weaponIndex returns integer
native BlzSetUnitDiceNumber takes unit whichUnit, integer diceNumber, integer weaponIndex returns nothing
native BlzGetUnitDiceSides takes unit whichUnit, integer weaponIndex returns integer
native BlzSetUnitDiceSides takes unit whichUnit, integer diceSides, integer weaponIndex returns nothing
native BlzGetUnitAttackCooldown takes unit whichUnit, integer weaponIndex returns real
native BlzSetUnitAttackCooldown takes unit whichUnit, real cooldown, integer weaponIndex returns nothing
native BlzSetSpecialEffectColorByPlayer takes effect whichEffect, player whichPlayer returns nothing
native BlzSetSpecialEffectColor takes effect whichEffect, integer r, integer g, integer b returns nothing
native BlzSetSpecialEffectAlpha takes effect whichEffect, integer alpha returns nothing
native BlzSetSpecialEffectScale takes effect whichEffect, real scale returns nothing
native BlzSetSpecialEffectPosition takes effect whichEffect, real x, real y, real z returns nothing
native BlzSetSpecialEffectHeight takes effect whichEffect, real height returns nothing
native BlzSetSpecialEffectTimeScale takes effect whichEffect, real timeScale returns nothing
native BlzSetSpecialEffectTime takes effect whichEffect, real time returns nothing
native BlzSetSpecialEffectOrientation takes effect whichEffect, real yaw, real pitch, real roll returns nothing
native BlzSetSpecialEffectYaw takes effect whichEffect, real yaw returns nothing
native BlzSetSpecialEffectPitch takes effect whichEffect, real pitch returns nothing
native BlzSetSpecialEffectRoll takes effect whichEffect, real roll returns nothing
native BlzSetSpecialEffectX takes effect whichEffect, real x returns nothing
native BlzSetSpecialEffectY takes effect whichEffect, real y returns nothing
native BlzSetSpecialEffectZ takes effect whichEffect, real z returns nothing
native BlzSetSpecialEffectPositionLoc takes effect whichEffect, location loc returns nothing
native BlzGetLocalSpecialEffectX takes effect whichEffect returns real
native BlzGetLocalSpecialEffectY takes effect whichEffect returns real
native BlzGetLocalSpecialEffectZ takes effect whichEffect returns real
native BlzGetUnitArmor takes unit whichUnit returns real
native BlzSetUnitArmor takes unit whichUnit, real armorAmount returns nothing
native BlzUnitHideAbility takes unit whichUnit, integer abilId, boolean flag returns nothing
native BlzUnitDisableAbility takes unit whichUnit, integer abilId, boolean flag, boolean hideUI returns nothing
native BlzUnitCancelTimedLife takes unit whichUnit returns nothing
native BlzIsUnitSelectable takes unit whichUnit returns boolean
native BlzIsUnitInvulnerable takes unit whichUnit returns boolean
native BlzUnitInterruptAttack takes unit whichUnit returns nothing
native BlzGetUnitCollisionSize takes unit whichUnit returns real
native BlzGetAbilityManaCost takes integer abilId, integer level returns integer
native BlzGetAbilityCooldown takes integer abilId, integer level returns real
native BlzSetUnitAbilityCooldown takes unit whichUnit, integer abilId, integer level, real cooldown returns nothing
native BlzGetUnitAbilityCooldown takes unit whichUnit, integer abilId, integer level returns real
native BlzGetUnitAbilityCooldownRemaining takes unit whichUnit, integer abilId returns real
native BlzEndUnitAbilityCooldown takes unit whichUnit, integer abilCode returns nothing
native BlzGetUnitAbilityManaCost takes unit whichUnit, integer abilId, integer level returns integer
native BlzSetUnitAbilityManaCost takes unit whichUnit, integer abilId, integer level, integer manaCost returns nothing
native BlzGetLocalUnitZ takes unit whichUnit returns real 
native BlzDecPlayerTechResearched takes player whichPlayer, integer techid, integer levels returns nothing
native BlzSetEventDamage takes real damage returns nothing
`
var blizzardJ = `



globals
 
 
 

 
 constant real bj_PI = 3.14159
 constant real bj_E = 2.71828
 constant real bj_CELLWIDTH = 128.0
 constant real bj_CLIFFHEIGHT = 128.0
 constant real bj_UNIT_FACING = 270.0
 constant real bj_RADTODEG = 180.0/bj_PI
 constant real bj_DEGTORAD = bj_PI/180.0
 constant real bj_TEXT_DELAY_QUEST = 20.00
 constant real bj_TEXT_DELAY_QUESTUPDATE = 20.00
 constant real bj_TEXT_DELAY_QUESTDONE = 20.00
 constant real bj_TEXT_DELAY_QUESTFAILED = 20.00
 constant real bj_TEXT_DELAY_QUESTREQUIREMENT = 20.00
 constant real bj_TEXT_DELAY_MISSIONFAILED = 20.00
 constant real bj_TEXT_DELAY_ALWAYSHINT = 12.00
 constant real bj_TEXT_DELAY_HINT = 12.00
 constant real bj_TEXT_DELAY_SECRET = 10.00
 constant real bj_TEXT_DELAY_UNITACQUIRED = 15.00
 constant real bj_TEXT_DELAY_UNITAVAILABLE = 10.00
 constant real bj_TEXT_DELAY_ITEMACQUIRED = 10.00
 constant real bj_TEXT_DELAY_WARNING = 12.00
 constant real bj_QUEUE_DELAY_QUEST = 5.00
 constant real bj_QUEUE_DELAY_HINT = 5.00
 constant real bj_QUEUE_DELAY_SECRET = 3.00
 constant real bj_HANDICAP_EASY = 60.00
 constant real bj_GAME_STARTED_THRESHOLD = 0.01
 constant real bj_WAIT_FOR_COND_MIN_INTERVAL = 0.10
 constant real bj_POLLED_WAIT_INTERVAL = 0.10
 constant real bj_POLLED_WAIT_SKIP_THRESHOLD = 2.00

 
 constant integer bj_MAX_INVENTORY = 6
 constant integer bj_MAX_PLAYERS = GetBJMaxPlayers()
 constant integer bj_PLAYER_NEUTRAL_VICTIM = GetBJPlayerNeutralVictim()
 constant integer bj_PLAYER_NEUTRAL_EXTRA = GetBJPlayerNeutralExtra()
 constant integer bj_MAX_PLAYER_SLOTS = GetBJMaxPlayerSlots()
 constant integer bj_MAX_SKELETONS = 25
 constant integer bj_MAX_STOCK_ITEM_SLOTS = 11
 constant integer bj_MAX_STOCK_UNIT_SLOTS = 11
 constant integer bj_MAX_ITEM_LEVEL = 10

 
 
 constant real bj_TOD_DAWN = 6.00
 constant real bj_TOD_DUSK = 18.00

 
 
 
 
 
 
 
 
 
 constant real bj_MELEE_STARTING_TOD = 8.00
 constant integer bj_MELEE_STARTING_GOLD_V0 = 750
 constant integer bj_MELEE_STARTING_GOLD_V1 = 500
 constant integer bj_MELEE_STARTING_LUMBER_V0 = 200
 constant integer bj_MELEE_STARTING_LUMBER_V1 = 150
 constant integer bj_MELEE_STARTING_HERO_TOKENS = 1
 constant integer bj_MELEE_HERO_LIMIT = 3
 constant integer bj_MELEE_HERO_TYPE_LIMIT = 1
 constant real bj_MELEE_MINE_SEARCH_RADIUS = 2000
 constant real bj_MELEE_CLEAR_UNITS_RADIUS = 1500
 constant real bj_MELEE_CRIPPLE_TIMEOUT = 120.00
 constant real bj_MELEE_CRIPPLE_MSG_DURATION = 20.00
 constant integer bj_MELEE_MAX_TWINKED_HEROES_V0 = 3
 constant integer bj_MELEE_MAX_TWINKED_HEROES_V1 = 1

 
 constant real bj_CREEP_ITEM_DELAY = 0.50

 
 constant real bj_STOCK_RESTOCK_INITIAL_DELAY = 120
 constant real bj_STOCK_RESTOCK_INTERVAL = 30
 constant integer bj_STOCK_MAX_ITERATIONS = 20

 
 constant integer bj_MAX_DEST_IN_REGION_EVENTS = 64

 
 constant integer bj_CAMERA_MIN_FARZ = 100
 constant integer bj_CAMERA_DEFAULT_DISTANCE = 1650
 constant integer bj_CAMERA_DEFAULT_FARZ = 5000
 constant integer bj_CAMERA_DEFAULT_AOA = 304
 constant integer bj_CAMERA_DEFAULT_FOV = 70
 constant integer bj_CAMERA_DEFAULT_ROLL = 0
 constant integer bj_CAMERA_DEFAULT_ROTATION = 90

 
 constant real bj_RESCUE_PING_TIME = 2.00

 
 constant real bj_NOTHING_SOUND_DURATION = 5.00
 constant real bj_TRANSMISSION_PING_TIME = 1.00
 constant integer bj_TRANSMISSION_IND_RED = 255
 constant integer bj_TRANSMISSION_IND_BLUE = 255
 constant integer bj_TRANSMISSION_IND_GREEN = 255
 constant integer bj_TRANSMISSION_IND_ALPHA = 255
 constant real bj_TRANSMISSION_PORT_HANGTIME = 1.50

 
 constant real bj_CINEMODE_INTERFACEFADE = 0.50
 constant gamespeed bj_CINEMODE_GAMESPEED = MAP_SPEED_NORMAL

 
 constant real bj_CINEMODE_VOLUME_UNITMOVEMENT = 0.40
 constant real bj_CINEMODE_VOLUME_UNITSOUNDS = 0.00
 constant real bj_CINEMODE_VOLUME_COMBAT = 0.40
 constant real bj_CINEMODE_VOLUME_SPELLS = 0.40
 constant real bj_CINEMODE_VOLUME_UI = 0.00
 constant real bj_CINEMODE_VOLUME_MUSIC = 0.55
 constant real bj_CINEMODE_VOLUME_AMBIENTSOUNDS = 1.00
 constant real bj_CINEMODE_VOLUME_FIRE = 0.60

 
 constant real bj_SPEECH_VOLUME_UNITMOVEMENT = 0.25
 constant real bj_SPEECH_VOLUME_UNITSOUNDS = 0.00
 constant real bj_SPEECH_VOLUME_COMBAT = 0.25
 constant real bj_SPEECH_VOLUME_SPELLS = 0.25
 constant real bj_SPEECH_VOLUME_UI = 0.00
 constant real bj_SPEECH_VOLUME_MUSIC = 0.55
 constant real bj_SPEECH_VOLUME_AMBIENTSOUNDS = 1.00
 constant real bj_SPEECH_VOLUME_FIRE = 0.60

 
 constant real bj_SMARTPAN_TRESHOLD_PAN = 500
 constant real bj_SMARTPAN_TRESHOLD_SNAP = 3500

 
 constant integer bj_MAX_QUEUED_TRIGGERS = 100
 constant real bj_QUEUED_TRIGGER_TIMEOUT = 180.00

 
 constant integer bj_CAMPAIGN_INDEX_T = 0
 constant integer bj_CAMPAIGN_INDEX_H = 1
 constant integer bj_CAMPAIGN_INDEX_U = 2
 constant integer bj_CAMPAIGN_INDEX_O = 3
 constant integer bj_CAMPAIGN_INDEX_N = 4
 constant integer bj_CAMPAIGN_INDEX_XN = 5
 constant integer bj_CAMPAIGN_INDEX_XH = 6
 constant integer bj_CAMPAIGN_INDEX_XU = 7
 constant integer bj_CAMPAIGN_INDEX_XO = 8

 
 constant integer bj_CAMPAIGN_OFFSET_T = 0
 constant integer bj_CAMPAIGN_OFFSET_H = 1
 constant integer bj_CAMPAIGN_OFFSET_U = 2
 constant integer bj_CAMPAIGN_OFFSET_O = 3
 constant integer bj_CAMPAIGN_OFFSET_N = 4
 constant integer bj_CAMPAIGN_OFFSET_XN = 0
 constant integer bj_CAMPAIGN_OFFSET_XH = 1
 constant integer bj_CAMPAIGN_OFFSET_XU = 2
 constant integer bj_CAMPAIGN_OFFSET_XO = 3

 
 
 constant integer bj_MISSION_INDEX_T00 = bj_CAMPAIGN_OFFSET_T * 1000 + 0
 constant integer bj_MISSION_INDEX_T01 = bj_CAMPAIGN_OFFSET_T * 1000 + 1
 
 constant integer bj_MISSION_INDEX_H00 = bj_CAMPAIGN_OFFSET_H * 1000 + 0
 constant integer bj_MISSION_INDEX_H01 = bj_CAMPAIGN_OFFSET_H * 1000 + 1
 constant integer bj_MISSION_INDEX_H02 = bj_CAMPAIGN_OFFSET_H * 1000 + 2
 constant integer bj_MISSION_INDEX_H03 = bj_CAMPAIGN_OFFSET_H * 1000 + 3
 constant integer bj_MISSION_INDEX_H04 = bj_CAMPAIGN_OFFSET_H * 1000 + 4
 constant integer bj_MISSION_INDEX_H05 = bj_CAMPAIGN_OFFSET_H * 1000 + 5
 constant integer bj_MISSION_INDEX_H06 = bj_CAMPAIGN_OFFSET_H * 1000 + 6
 constant integer bj_MISSION_INDEX_H07 = bj_CAMPAIGN_OFFSET_H * 1000 + 7
 constant integer bj_MISSION_INDEX_H08 = bj_CAMPAIGN_OFFSET_H * 1000 + 8
 constant integer bj_MISSION_INDEX_H09 = bj_CAMPAIGN_OFFSET_H * 1000 + 9
 constant integer bj_MISSION_INDEX_H10 = bj_CAMPAIGN_OFFSET_H * 1000 + 10
 constant integer bj_MISSION_INDEX_H11 = bj_CAMPAIGN_OFFSET_H * 1000 + 11
 
 constant integer bj_MISSION_INDEX_U00 = bj_CAMPAIGN_OFFSET_U * 1000 + 0
 constant integer bj_MISSION_INDEX_U01 = bj_CAMPAIGN_OFFSET_U * 1000 + 1
 constant integer bj_MISSION_INDEX_U02 = bj_CAMPAIGN_OFFSET_U * 1000 + 2
 constant integer bj_MISSION_INDEX_U03 = bj_CAMPAIGN_OFFSET_U * 1000 + 3
 constant integer bj_MISSION_INDEX_U05 = bj_CAMPAIGN_OFFSET_U * 1000 + 4
 constant integer bj_MISSION_INDEX_U07 = bj_CAMPAIGN_OFFSET_U * 1000 + 5
 constant integer bj_MISSION_INDEX_U08 = bj_CAMPAIGN_OFFSET_U * 1000 + 6
 constant integer bj_MISSION_INDEX_U09 = bj_CAMPAIGN_OFFSET_U * 1000 + 7
 constant integer bj_MISSION_INDEX_U10 = bj_CAMPAIGN_OFFSET_U * 1000 + 8
 constant integer bj_MISSION_INDEX_U11 = bj_CAMPAIGN_OFFSET_U * 1000 + 9
 
 constant integer bj_MISSION_INDEX_O00 = bj_CAMPAIGN_OFFSET_O * 1000 + 0
 constant integer bj_MISSION_INDEX_O01 = bj_CAMPAIGN_OFFSET_O * 1000 + 1
 constant integer bj_MISSION_INDEX_O02 = bj_CAMPAIGN_OFFSET_O * 1000 + 2
 constant integer bj_MISSION_INDEX_O03 = bj_CAMPAIGN_OFFSET_O * 1000 + 3
 constant integer bj_MISSION_INDEX_O04 = bj_CAMPAIGN_OFFSET_O * 1000 + 4
 constant integer bj_MISSION_INDEX_O05 = bj_CAMPAIGN_OFFSET_O * 1000 + 5
 constant integer bj_MISSION_INDEX_O06 = bj_CAMPAIGN_OFFSET_O * 1000 + 6
 constant integer bj_MISSION_INDEX_O07 = bj_CAMPAIGN_OFFSET_O * 1000 + 7
 constant integer bj_MISSION_INDEX_O08 = bj_CAMPAIGN_OFFSET_O * 1000 + 8
 constant integer bj_MISSION_INDEX_O09 = bj_CAMPAIGN_OFFSET_O * 1000 + 9
 constant integer bj_MISSION_INDEX_O10 = bj_CAMPAIGN_OFFSET_O * 1000 + 10
 
 constant integer bj_MISSION_INDEX_N00 = bj_CAMPAIGN_OFFSET_N * 1000 + 0
 constant integer bj_MISSION_INDEX_N01 = bj_CAMPAIGN_OFFSET_N * 1000 + 1
 constant integer bj_MISSION_INDEX_N02 = bj_CAMPAIGN_OFFSET_N * 1000 + 2
 constant integer bj_MISSION_INDEX_N03 = bj_CAMPAIGN_OFFSET_N * 1000 + 3
 constant integer bj_MISSION_INDEX_N04 = bj_CAMPAIGN_OFFSET_N * 1000 + 4
 constant integer bj_MISSION_INDEX_N05 = bj_CAMPAIGN_OFFSET_N * 1000 + 5
 constant integer bj_MISSION_INDEX_N06 = bj_CAMPAIGN_OFFSET_N * 1000 + 6
 constant integer bj_MISSION_INDEX_N07 = bj_CAMPAIGN_OFFSET_N * 1000 + 7
 constant integer bj_MISSION_INDEX_N08 = bj_CAMPAIGN_OFFSET_N * 1000 + 8
 constant integer bj_MISSION_INDEX_N09 = bj_CAMPAIGN_OFFSET_N * 1000 + 9
 
 constant integer bj_MISSION_INDEX_XN00 = bj_CAMPAIGN_OFFSET_XN * 1000 + 0
 constant integer bj_MISSION_INDEX_XN01 = bj_CAMPAIGN_OFFSET_XN * 1000 + 1
 constant integer bj_MISSION_INDEX_XN02 = bj_CAMPAIGN_OFFSET_XN * 1000 + 2
 constant integer bj_MISSION_INDEX_XN03 = bj_CAMPAIGN_OFFSET_XN * 1000 + 3
 constant integer bj_MISSION_INDEX_XN04 = bj_CAMPAIGN_OFFSET_XN * 1000 + 4
 constant integer bj_MISSION_INDEX_XN05 = bj_CAMPAIGN_OFFSET_XN * 1000 + 5
 constant integer bj_MISSION_INDEX_XN06 = bj_CAMPAIGN_OFFSET_XN * 1000 + 6
 constant integer bj_MISSION_INDEX_XN07 = bj_CAMPAIGN_OFFSET_XN * 1000 + 7
 constant integer bj_MISSION_INDEX_XN08 = bj_CAMPAIGN_OFFSET_XN * 1000 + 8
 constant integer bj_MISSION_INDEX_XN09 = bj_CAMPAIGN_OFFSET_XN * 1000 + 9
 constant integer bj_MISSION_INDEX_XN10 = bj_CAMPAIGN_OFFSET_XN * 1000 + 10
 
 constant integer bj_MISSION_INDEX_XH00 = bj_CAMPAIGN_OFFSET_XH * 1000 + 0
 constant integer bj_MISSION_INDEX_XH01 = bj_CAMPAIGN_OFFSET_XH * 1000 + 1
 constant integer bj_MISSION_INDEX_XH02 = bj_CAMPAIGN_OFFSET_XH * 1000 + 2
 constant integer bj_MISSION_INDEX_XH03 = bj_CAMPAIGN_OFFSET_XH * 1000 + 3
 constant integer bj_MISSION_INDEX_XH04 = bj_CAMPAIGN_OFFSET_XH * 1000 + 4
 constant integer bj_MISSION_INDEX_XH05 = bj_CAMPAIGN_OFFSET_XH * 1000 + 5
 constant integer bj_MISSION_INDEX_XH06 = bj_CAMPAIGN_OFFSET_XH * 1000 + 6
 constant integer bj_MISSION_INDEX_XH07 = bj_CAMPAIGN_OFFSET_XH * 1000 + 7
 constant integer bj_MISSION_INDEX_XH08 = bj_CAMPAIGN_OFFSET_XH * 1000 + 8
 constant integer bj_MISSION_INDEX_XH09 = bj_CAMPAIGN_OFFSET_XH * 1000 + 9
 
 constant integer bj_MISSION_INDEX_XU00 = bj_CAMPAIGN_OFFSET_XU * 1000 + 0
 constant integer bj_MISSION_INDEX_XU01 = bj_CAMPAIGN_OFFSET_XU * 1000 + 1
 constant integer bj_MISSION_INDEX_XU02 = bj_CAMPAIGN_OFFSET_XU * 1000 + 2
 constant integer bj_MISSION_INDEX_XU03 = bj_CAMPAIGN_OFFSET_XU * 1000 + 3
 constant integer bj_MISSION_INDEX_XU04 = bj_CAMPAIGN_OFFSET_XU * 1000 + 4
 constant integer bj_MISSION_INDEX_XU05 = bj_CAMPAIGN_OFFSET_XU * 1000 + 5
 constant integer bj_MISSION_INDEX_XU06 = bj_CAMPAIGN_OFFSET_XU * 1000 + 6
 constant integer bj_MISSION_INDEX_XU07 = bj_CAMPAIGN_OFFSET_XU * 1000 + 7
 constant integer bj_MISSION_INDEX_XU08 = bj_CAMPAIGN_OFFSET_XU * 1000 + 8
 constant integer bj_MISSION_INDEX_XU09 = bj_CAMPAIGN_OFFSET_XU * 1000 + 9
 constant integer bj_MISSION_INDEX_XU10 = bj_CAMPAIGN_OFFSET_XU * 1000 + 10
 constant integer bj_MISSION_INDEX_XU11 = bj_CAMPAIGN_OFFSET_XU * 1000 + 11
 constant integer bj_MISSION_INDEX_XU12 = bj_CAMPAIGN_OFFSET_XU * 1000 + 12
 constant integer bj_MISSION_INDEX_XU13 = bj_CAMPAIGN_OFFSET_XU * 1000 + 13

 
 constant integer bj_MISSION_INDEX_XO00 = bj_CAMPAIGN_OFFSET_XO * 1000 + 0

 
 constant integer bj_CINEMATICINDEX_TOP = 0
 constant integer bj_CINEMATICINDEX_HOP = 1
 constant integer bj_CINEMATICINDEX_HED = 2
 constant integer bj_CINEMATICINDEX_OOP = 3
 constant integer bj_CINEMATICINDEX_OED = 4
 constant integer bj_CINEMATICINDEX_UOP = 5
 constant integer bj_CINEMATICINDEX_UED = 6
 constant integer bj_CINEMATICINDEX_NOP = 7
 constant integer bj_CINEMATICINDEX_NED = 8
 constant integer bj_CINEMATICINDEX_XOP = 9
 constant integer bj_CINEMATICINDEX_XED = 10

 
 constant integer bj_ALLIANCE_UNALLIED = 0
 constant integer bj_ALLIANCE_UNALLIED_VISION = 1
 constant integer bj_ALLIANCE_ALLIED = 2
 constant integer bj_ALLIANCE_ALLIED_VISION = 3
 constant integer bj_ALLIANCE_ALLIED_UNITS = 4
 constant integer bj_ALLIANCE_ALLIED_ADVUNITS = 5
 constant integer bj_ALLIANCE_NEUTRAL = 6
 constant integer bj_ALLIANCE_NEUTRAL_VISION = 7

 
 constant integer bj_KEYEVENTTYPE_DEPRESS = 0
 constant integer bj_KEYEVENTTYPE_RELEASE = 1

 
 constant integer bj_KEYEVENTKEY_LEFT = 0
 constant integer bj_KEYEVENTKEY_RIGHT = 1
 constant integer bj_KEYEVENTKEY_DOWN = 2
 constant integer bj_KEYEVENTKEY_UP = 3

 
 constant integer bj_MOUSEEVENTTYPE_DOWN = 0
 constant integer bj_MOUSEEVENTTYPE_UP = 1
 constant integer bj_MOUSEEVENTTYPE_MOVE = 2

 
 constant integer bj_TIMETYPE_ADD = 0
 constant integer bj_TIMETYPE_SET = 1
 constant integer bj_TIMETYPE_SUB = 2

 
 constant integer bj_CAMERABOUNDS_ADJUST_ADD = 0
 constant integer bj_CAMERABOUNDS_ADJUST_SUB = 1

 
 constant integer bj_QUESTTYPE_REQ_DISCOVERED = 0
 constant integer bj_QUESTTYPE_REQ_UNDISCOVERED = 1
 constant integer bj_QUESTTYPE_OPT_DISCOVERED = 2
 constant integer bj_QUESTTYPE_OPT_UNDISCOVERED = 3

 
 constant integer bj_QUESTMESSAGE_DISCOVERED = 0
 constant integer bj_QUESTMESSAGE_UPDATED = 1
 constant integer bj_QUESTMESSAGE_COMPLETED = 2
 constant integer bj_QUESTMESSAGE_FAILED = 3
 constant integer bj_QUESTMESSAGE_REQUIREMENT = 4
 constant integer bj_QUESTMESSAGE_MISSIONFAILED = 5
 constant integer bj_QUESTMESSAGE_ALWAYSHINT = 6
 constant integer bj_QUESTMESSAGE_HINT = 7
 constant integer bj_QUESTMESSAGE_SECRET = 8
 constant integer bj_QUESTMESSAGE_UNITACQUIRED = 9
 constant integer bj_QUESTMESSAGE_UNITAVAILABLE = 10
 constant integer bj_QUESTMESSAGE_ITEMACQUIRED = 11
 constant integer bj_QUESTMESSAGE_WARNING = 12

 
 constant integer bj_SORTTYPE_SORTBYVALUE = 0
 constant integer bj_SORTTYPE_SORTBYPLAYER = 1
 constant integer bj_SORTTYPE_SORTBYLABEL = 2

 
 constant integer bj_CINEFADETYPE_FADEIN = 0
 constant integer bj_CINEFADETYPE_FADEOUT = 1
 constant integer bj_CINEFADETYPE_FADEOUTIN = 2

 
 constant integer bj_REMOVEBUFFS_POSITIVE = 0
 constant integer bj_REMOVEBUFFS_NEGATIVE = 1
 constant integer bj_REMOVEBUFFS_ALL = 2
 constant integer bj_REMOVEBUFFS_NONTLIFE = 3

 
 constant integer bj_BUFF_POLARITY_POSITIVE = 0
 constant integer bj_BUFF_POLARITY_NEGATIVE = 1
 constant integer bj_BUFF_POLARITY_EITHER = 2

 
 constant integer bj_BUFF_RESIST_MAGIC = 0
 constant integer bj_BUFF_RESIST_PHYSICAL = 1
 constant integer bj_BUFF_RESIST_EITHER = 2
 constant integer bj_BUFF_RESIST_BOTH = 3

 
 constant integer bj_HEROSTAT_STR = 0
 constant integer bj_HEROSTAT_AGI = 1
 constant integer bj_HEROSTAT_INT = 2

 
 constant integer bj_MODIFYMETHOD_ADD = 0
 constant integer bj_MODIFYMETHOD_SUB = 1
 constant integer bj_MODIFYMETHOD_SET = 2

 
 constant integer bj_UNIT_STATE_METHOD_ABSOLUTE = 0
 constant integer bj_UNIT_STATE_METHOD_RELATIVE = 1
 constant integer bj_UNIT_STATE_METHOD_DEFAULTS = 2
 constant integer bj_UNIT_STATE_METHOD_MAXIMUM = 3

 
 constant integer bj_GATEOPERATION_CLOSE = 0
 constant integer bj_GATEOPERATION_OPEN = 1
 constant integer bj_GATEOPERATION_DESTROY = 2

	
	constant integer bj_GAMECACHE_BOOLEAN = 0
	constant integer bj_GAMECACHE_INTEGER = 1
	constant integer bj_GAMECACHE_REAL = 2
	constant integer bj_GAMECACHE_UNIT = 3
	constant integer bj_GAMECACHE_STRING = 4
	
	constant integer bj_HASHTABLE_BOOLEAN = 0
	constant integer bj_HASHTABLE_INTEGER = 1
	constant integer bj_HASHTABLE_REAL = 2
	constant integer bj_HASHTABLE_STRING = 3
	constant integer bj_HASHTABLE_HANDLE = 4

 
 constant integer bj_ITEM_STATUS_HIDDEN = 0
 constant integer bj_ITEM_STATUS_OWNED = 1
 constant integer bj_ITEM_STATUS_INVULNERABLE = 2
 constant integer bj_ITEM_STATUS_POWERUP = 3
 constant integer bj_ITEM_STATUS_SELLABLE = 4
 constant integer bj_ITEM_STATUS_PAWNABLE = 5

 
 constant integer bj_ITEMCODE_STATUS_POWERUP = 0
 constant integer bj_ITEMCODE_STATUS_SELLABLE = 1
 constant integer bj_ITEMCODE_STATUS_PAWNABLE = 2

 
 constant integer bj_MINIMAPPINGSTYLE_SIMPLE = 0
 constant integer bj_MINIMAPPINGSTYLE_FLASHY = 1
 constant integer bj_MINIMAPPINGSTYLE_ATTACK = 2

 
 constant real bj_CORPSE_MAX_DEATH_TIME = 8.00

 
 constant integer bj_CORPSETYPE_FLESH = 0
 constant integer bj_CORPSETYPE_BONE = 1

 
 constant integer bj_ELEVATOR_BLOCKER_CODE = 'DTep'
 constant integer bj_ELEVATOR_CODE01 = 'DTrf'
 constant integer bj_ELEVATOR_CODE02 = 'DTrx'

 
 constant integer bj_ELEVATOR_WALL_TYPE_ALL = 0
 constant integer bj_ELEVATOR_WALL_TYPE_EAST = 1
 constant integer bj_ELEVATOR_WALL_TYPE_NORTH = 2
 constant integer bj_ELEVATOR_WALL_TYPE_SOUTH = 3
 constant integer bj_ELEVATOR_WALL_TYPE_WEST = 4

 
 
 

 
 force bj_FORCE_ALL_PLAYERS = null
 force array bj_FORCE_PLAYER

 integer bj_MELEE_MAX_TWINKED_HEROES = 0

 
 rect bj_mapInitialPlayableArea = null
 rect bj_mapInitialCameraBounds = null

 
 integer bj_forLoopAIndex = 0
 integer bj_forLoopBIndex = 0
 integer bj_forLoopAIndexEnd = 0
 integer bj_forLoopBIndexEnd = 0

 boolean bj_slotControlReady = false
 boolean array bj_slotControlUsed
 mapcontrol array bj_slotControl

 
 timer bj_gameStartedTimer = null
 boolean bj_gameStarted = false
 timer bj_volumeGroupsTimer = CreateTimer()

 
 boolean bj_isSinglePlayer = false

 
 trigger bj_dncSoundsDay = null
 trigger bj_dncSoundsNight = null
 sound bj_dayAmbientSound = null
 sound bj_nightAmbientSound = null
 trigger bj_dncSoundsDawn = null
 trigger bj_dncSoundsDusk = null
 sound bj_dawnSound = null
 sound bj_duskSound = null
 boolean bj_useDawnDuskSounds = true
 boolean bj_dncIsDaytime = false

 
 
 sound bj_rescueSound = null
 sound bj_questDiscoveredSound = null
 sound bj_questUpdatedSound = null
 sound bj_questCompletedSound = null
 sound bj_questFailedSound = null
 sound bj_questHintSound = null
 sound bj_questSecretSound = null
 sound bj_questItemAcquiredSound = null
 sound bj_questWarningSound = null
 sound bj_victoryDialogSound = null
 sound bj_defeatDialogSound = null

 
 trigger bj_stockItemPurchased = null
 timer bj_stockUpdateTimer = null
 boolean array bj_stockAllowedPermanent
 boolean array bj_stockAllowedCharged
 boolean array bj_stockAllowedArtifact
 integer bj_stockPickedItemLevel = 0
 itemtype bj_stockPickedItemType

 
 trigger bj_meleeVisibilityTrained = null
 boolean bj_meleeVisibilityIsDay = true
 boolean bj_meleeGrantHeroItems = false
 location bj_meleeNearestMineToLoc = null
 unit bj_meleeNearestMine = null
 real bj_meleeNearestMineDist = 0.00
 boolean bj_meleeGameOver = false
 boolean array bj_meleeDefeated
 boolean array bj_meleeVictoried
 unit array bj_ghoul
 timer array bj_crippledTimer
 timerdialog array bj_crippledTimerWindows
 boolean array bj_playerIsCrippled
 boolean array bj_playerIsExposed
 boolean bj_finishSoonAllExposed = false
 timerdialog bj_finishSoonTimerDialog = null
 integer array bj_meleeTwinkedHeroes

 
 trigger bj_rescueUnitBehavior = null
 boolean bj_rescueChangeColorUnit = true
 boolean bj_rescueChangeColorBldg = true

 
 timer bj_cineSceneEndingTimer = null
 sound bj_cineSceneLastSound = null
 trigger bj_cineSceneBeingSkipped = null

 
 gamespeed bj_cineModePriorSpeed = MAP_SPEED_NORMAL
 boolean bj_cineModePriorFogSetting = false
 boolean bj_cineModePriorMaskSetting = false
 boolean bj_cineModeAlreadyIn = false
 boolean bj_cineModePriorDawnDusk = false
 integer bj_cineModeSavedSeed = 0

 
 timer bj_cineFadeFinishTimer = null
 timer bj_cineFadeContinueTimer = null
 real bj_cineFadeContinueRed = 0
 real bj_cineFadeContinueGreen = 0
 real bj_cineFadeContinueBlue = 0
 real bj_cineFadeContinueTrans = 0
 real bj_cineFadeContinueDuration = 0
 string bj_cineFadeContinueTex = ""

 
 integer bj_queuedExecTotal = 0
 trigger array bj_queuedExecTriggers
 boolean array bj_queuedExecUseConds
 timer bj_queuedExecTimeoutTimer = CreateTimer()
 trigger bj_queuedExecTimeout = null

 
 integer bj_destInRegionDiesCount = 0
 trigger bj_destInRegionDiesTrig = null
 integer bj_groupCountUnits = 0
 integer bj_forceCountPlayers = 0
 integer bj_groupEnumTypeId = 0
 player bj_groupEnumOwningPlayer = null
 group bj_groupAddGroupDest = null
 group bj_groupRemoveGroupDest = null
 integer bj_groupRandomConsidered = 0
 unit bj_groupRandomCurrentPick = null
 group bj_groupLastCreatedDest = null
 group bj_randomSubGroupGroup = null
 integer bj_randomSubGroupWant = 0
 integer bj_randomSubGroupTotal = 0
 real bj_randomSubGroupChance = 0
 integer bj_destRandomConsidered = 0
 destructable bj_destRandomCurrentPick = null
 destructable bj_elevatorWallBlocker = null
 destructable bj_elevatorNeighbor = null
 integer bj_itemRandomConsidered = 0
 item bj_itemRandomCurrentPick = null
 integer bj_forceRandomConsidered = 0
 player bj_forceRandomCurrentPick = null
 unit bj_makeUnitRescuableUnit = null
 boolean bj_makeUnitRescuableFlag = true
 boolean bj_pauseAllUnitsFlag = true
 location bj_enumDestructableCenter = null
 real bj_enumDestructableRadius = 0
 playercolor bj_setPlayerTargetColor = null
 boolean bj_isUnitGroupDeadResult = true
 boolean bj_isUnitGroupEmptyResult = true
 boolean bj_isUnitGroupInRectResult = true
 rect bj_isUnitGroupInRectRect = null
 boolean bj_changeLevelShowScores = false
 string bj_changeLevelMapName = null
 group bj_suspendDecayFleshGroup = CreateGroup()
 group bj_suspendDecayBoneGroup = CreateGroup()
 timer bj_delayedSuspendDecayTimer = CreateTimer()
 trigger bj_delayedSuspendDecayTrig = null
 integer bj_livingPlayerUnitsTypeId = 0
 widget bj_lastDyingWidget = null

 
 integer bj_randDistCount = 0
 integer array bj_randDistID
 integer array bj_randDistChance

 
 unit bj_lastCreatedUnit = null
 item bj_lastCreatedItem = null
 item bj_lastRemovedItem = null
 unit bj_lastHauntedGoldMine = null
 destructable bj_lastCreatedDestructable = null
 group bj_lastCreatedGroup = CreateGroup()
 fogmodifier bj_lastCreatedFogModifier = null
 effect bj_lastCreatedEffect = null
 weathereffect bj_lastCreatedWeatherEffect = null
 terraindeformation bj_lastCreatedTerrainDeformation = null
 quest bj_lastCreatedQuest = null
 questitem bj_lastCreatedQuestItem = null
 defeatcondition bj_lastCreatedDefeatCondition = null
 timer bj_lastStartedTimer = CreateTimer()
 timerdialog bj_lastCreatedTimerDialog = null
 leaderboard bj_lastCreatedLeaderboard = null
 multiboard bj_lastCreatedMultiboard = null
 sound bj_lastPlayedSound = null
 string bj_lastPlayedMusic = ""
 real bj_lastTransmissionDuration = 0
 gamecache bj_lastCreatedGameCache = null
 hashtable bj_lastCreatedHashtable = null
 unit bj_lastLoadedUnit = null
 button bj_lastCreatedButton = null
 unit bj_lastReplacedUnit = null
 texttag bj_lastCreatedTextTag = null
 lightning bj_lastCreatedLightning = null
 image bj_lastCreatedImage = null
 ubersplat bj_lastCreatedUbersplat = null

 
 boolexpr filterIssueHauntOrderAtLocBJ = null
 boolexpr filterEnumDestructablesInCircleBJ = null
 boolexpr filterGetUnitsInRectOfPlayer = null
 boolexpr filterGetUnitsOfTypeIdAll = null
 boolexpr filterGetUnitsOfPlayerAndTypeId = null
 boolexpr filterMeleeTrainedUnitIsHeroBJ = null
 boolexpr filterLivingPlayerUnitsOfTypeId = null

 
 boolean bj_wantDestroyGroup = false
endglobals







function BJDebugMsg takes string msg returns nothing
 local integer i = 0
 loop
 call DisplayTimedTextToPlayer(Player(i),0,0,60,msg)
 set i = i + 1
 exitwhen i == bj_MAX_PLAYERS
 endloop
endfunction







function RMinBJ takes real a, real b returns real
 if (a < b) then
 return a
 else
 return b
 endif
endfunction


function RMaxBJ takes real a, real b returns real
 if (a < b) then
 return b
 else
 return a
 endif
endfunction


function RAbsBJ takes real a returns real
 if (a >= 0) then
 return a
 else
 return -a
 endif
endfunction


function RSignBJ takes real a returns real
 if (a >= 0.0) then
 return 1.0
 else
 return -1.0
 endif
endfunction


function IMinBJ takes integer a, integer b returns integer
 if (a < b) then
 return a
 else
 return b
 endif
endfunction


function IMaxBJ takes integer a, integer b returns integer
 if (a < b) then
 return b
 else
 return a
 endif
endfunction


function IAbsBJ takes integer a returns integer
 if (a >= 0) then
 return a
 else
 return -a
 endif
endfunction


function ISignBJ takes integer a returns integer
 if (a >= 0) then
 return 1
 else
 return -1
 endif
endfunction


function SinBJ takes real degrees returns real
 return Sin(degrees * bj_DEGTORAD)
endfunction


function CosBJ takes real degrees returns real
 return Cos(degrees * bj_DEGTORAD)
endfunction


function TanBJ takes real degrees returns real
 return Tan(degrees * bj_DEGTORAD)
endfunction


function AsinBJ takes real degrees returns real
 return Asin(degrees) * bj_RADTODEG
endfunction


function AcosBJ takes real degrees returns real
 return Acos(degrees) * bj_RADTODEG
endfunction


function AtanBJ takes real degrees returns real
 return Atan(degrees) * bj_RADTODEG
endfunction


function Atan2BJ takes real y, real x returns real
 return Atan2(y, x) * bj_RADTODEG
endfunction


function AngleBetweenPoints takes location locA, location locB returns real
 return bj_RADTODEG * Atan2(GetLocationY(locB) - GetLocationY(locA), GetLocationX(locB) - GetLocationX(locA))
endfunction


function DistanceBetweenPoints takes location locA, location locB returns real
 local real dx = GetLocationX(locB) - GetLocationX(locA)
 local real dy = GetLocationY(locB) - GetLocationY(locA)
 return SquareRoot(dx * dx + dy * dy)
endfunction


function PolarProjectionBJ takes location source, real dist, real angle returns location
 local real x = GetLocationX(source) + dist * Cos(angle * bj_DEGTORAD)
 local real y = GetLocationY(source) + dist * Sin(angle * bj_DEGTORAD)
 return Location(x, y)
endfunction


function GetRandomDirectionDeg takes nothing returns real
 return GetRandomReal(0, 360)
endfunction


function GetRandomPercentageBJ takes nothing returns real
 return GetRandomReal(0, 100)
endfunction


function GetRandomLocInRect takes rect whichRect returns location
 return Location(GetRandomReal(GetRectMinX(whichRect), GetRectMaxX(whichRect)), GetRandomReal(GetRectMinY(whichRect), GetRectMaxY(whichRect)))
endfunction





function ModuloInteger takes integer dividend, integer divisor returns integer
 local integer modulus = dividend - (dividend / divisor) * divisor

 
 
 
 if (modulus < 0) then
 set modulus = modulus + divisor
 endif

 return modulus
endfunction





function ModuloReal takes real dividend, real divisor returns real
 local real modulus = dividend - I2R(R2I(dividend / divisor)) * divisor

 
 
 
 if (modulus < 0) then
 set modulus = modulus + divisor
 endif

 return modulus
endfunction


function OffsetLocation takes location loc, real dx, real dy returns location
 return Location(GetLocationX(loc) + dx, GetLocationY(loc) + dy)
endfunction


function OffsetRectBJ takes rect r, real dx, real dy returns rect
 return Rect( GetRectMinX(r) + dx, GetRectMinY(r) + dy, GetRectMaxX(r) + dx, GetRectMaxY(r) + dy )
endfunction


function RectFromCenterSizeBJ takes location center, real width, real height returns rect
 local real x = GetLocationX( center )
 local real y = GetLocationY( center )
 return Rect( x - width*0.5, y - height*0.5, x + width*0.5, y + height*0.5 )
endfunction


function RectContainsCoords takes rect r, real x, real y returns boolean
 return (GetRectMinX(r) <= x) and (x <= GetRectMaxX(r)) and (GetRectMinY(r) <= y) and (y <= GetRectMaxY(r))
endfunction


function RectContainsLoc takes rect r, location loc returns boolean
 return RectContainsCoords(r, GetLocationX(loc), GetLocationY(loc))
endfunction


function RectContainsUnit takes rect r, unit whichUnit returns boolean
 return RectContainsCoords(r, GetUnitX(whichUnit), GetUnitY(whichUnit))
endfunction


function RectContainsItem takes item whichItem, rect r returns boolean
 if (whichItem == null) then
 return false
 endif

 if (IsItemOwned(whichItem)) then
 return false
 endif

 return RectContainsCoords(r, GetItemX(whichItem), GetItemY(whichItem))
endfunction









function ConditionalTriggerExecute takes trigger trig returns nothing
 if TriggerEvaluate(trig) then
 call TriggerExecute(trig)
 endif
endfunction




function TriggerExecuteBJ takes trigger trig, boolean checkConditions returns boolean
 if checkConditions then
 if not (TriggerEvaluate(trig)) then
 return false
 endif
 endif
 call TriggerExecute(trig)
 return true
endfunction






function PostTriggerExecuteBJ takes trigger trig, boolean checkConditions returns boolean
 if checkConditions then
 if not (TriggerEvaluate(trig)) then
 return false
 endif
 endif
 call TriggerRegisterTimerEvent(trig, 0, false)
 return true
endfunction




function QueuedTriggerCheck takes nothing returns nothing
 local string s = "TrigQueue Check "
 local integer i

 set i = 0
 loop
 exitwhen i >= bj_queuedExecTotal
 set s = s + "q[" + I2S(i) + "]="
 if (bj_queuedExecTriggers[i] == null) then
 set s = s + "null "
 else
 set s = s + "x "
 endif
 set i = i + 1
 endloop
 set s = s + "(" + I2S(bj_queuedExecTotal) + " total)"
 call DisplayTimedTextToPlayer(GetLocalPlayer(),0,0,600,s)
endfunction





function QueuedTriggerGetIndex takes trigger trig returns integer
 
 local integer index = 0
 loop
 exitwhen index >= bj_queuedExecTotal
 if (bj_queuedExecTriggers[index] == trig) then
 return index
 endif
 set index = index + 1
 endloop
 return -1
endfunction






function QueuedTriggerRemoveByIndex takes integer trigIndex returns boolean
 local integer index

 
 if (trigIndex >= bj_queuedExecTotal) then
 return false
 endif

 
 set bj_queuedExecTotal = bj_queuedExecTotal - 1
 set index = trigIndex
 loop
 exitwhen index >= bj_queuedExecTotal
 set bj_queuedExecTriggers[index] = bj_queuedExecTriggers[index + 1]
 set bj_queuedExecUseConds[index] = bj_queuedExecUseConds[index + 1]
 set index = index + 1
 endloop
 return true
endfunction






function QueuedTriggerAttemptExec takes nothing returns boolean
 loop
 exitwhen bj_queuedExecTotal == 0

 if TriggerExecuteBJ(bj_queuedExecTriggers[0], bj_queuedExecUseConds[0]) then
 
 call TimerStart(bj_queuedExecTimeoutTimer, bj_QUEUED_TRIGGER_TIMEOUT, false, null)
 return true
 endif

 call QueuedTriggerRemoveByIndex(0)
 endloop
 return false
endfunction





function QueuedTriggerAddBJ takes trigger trig, boolean checkConditions returns boolean
 
 if (bj_queuedExecTotal >= bj_MAX_QUEUED_TRIGGERS) then
 return false
 endif

 
 set bj_queuedExecTriggers[bj_queuedExecTotal] = trig
 set bj_queuedExecUseConds[bj_queuedExecTotal] = checkConditions
 set bj_queuedExecTotal = bj_queuedExecTotal + 1

 
 if (bj_queuedExecTotal == 1) then
 call QueuedTriggerAttemptExec()
 endif
 return true
endfunction





function QueuedTriggerRemoveBJ takes trigger trig returns nothing
 local integer index
 local integer trigIndex
 local boolean trigExecuted

 
 set trigIndex = QueuedTriggerGetIndex(trig)
 if (trigIndex == -1) then
 return
 endif

 
 call QueuedTriggerRemoveByIndex(trigIndex)

 
 if (trigIndex == 0) then
 call PauseTimer(bj_queuedExecTimeoutTimer)
 call QueuedTriggerAttemptExec()
 endif
endfunction





function QueuedTriggerDoneBJ takes nothing returns nothing
 local integer index

 
 if (bj_queuedExecTotal <= 0) then
 return
 endif

 
 call QueuedTriggerRemoveByIndex(0)

 
 call PauseTimer(bj_queuedExecTimeoutTimer)
 call QueuedTriggerAttemptExec()
endfunction




function QueuedTriggerClearBJ takes nothing returns nothing
 call PauseTimer(bj_queuedExecTimeoutTimer)
 set bj_queuedExecTotal = 0
endfunction




function QueuedTriggerClearInactiveBJ takes nothing returns nothing
 set bj_queuedExecTotal = IMinBJ(bj_queuedExecTotal, 1)
endfunction


function QueuedTriggerCountBJ takes nothing returns integer
 return bj_queuedExecTotal
endfunction


function IsTriggerQueueEmptyBJ takes nothing returns boolean
 return bj_queuedExecTotal <= 0
endfunction


function IsTriggerQueuedBJ takes trigger trig returns boolean
 return QueuedTriggerGetIndex(trig) != -1
endfunction


function GetForLoopIndexA takes nothing returns integer
 return bj_forLoopAIndex
endfunction


function SetForLoopIndexA takes integer newIndex returns nothing
 set bj_forLoopAIndex = newIndex
endfunction


function GetForLoopIndexB takes nothing returns integer
 return bj_forLoopBIndex
endfunction


function SetForLoopIndexB takes integer newIndex returns nothing
 set bj_forLoopBIndex = newIndex
endfunction




function PolledWait takes real duration returns nothing
 local timer t
 local real timeRemaining

 if (duration > 0) then
 set t = CreateTimer()
 call TimerStart(t, duration, false, null)
 loop
 set timeRemaining = TimerGetRemaining(t)
 exitwhen timeRemaining <= 0

 
 
 
 if (timeRemaining > bj_POLLED_WAIT_SKIP_THRESHOLD) then
 call TriggerSleepAction(0.1 * timeRemaining)
 else
 call TriggerSleepAction(bj_POLLED_WAIT_INTERVAL)
 endif
 endloop
 call DestroyTimer(t)
 endif
endfunction


function IntegerTertiaryOp takes boolean flag, integer valueA, integer valueB returns integer
 if flag then
 return valueA
 else
 return valueB
 endif
endfunction









function DoNothing takes nothing returns nothing
endfunction






function CommentString takes string commentString returns nothing
endfunction




function StringIdentity takes string theString returns string
 return GetLocalizedString(theString)
endfunction


function GetBooleanAnd takes boolean valueA, boolean valueB returns boolean
 return valueA and valueB
endfunction


function GetBooleanOr takes boolean valueA, boolean valueB returns boolean
 return valueA or valueB
endfunction





function PercentToInt takes real percentage, integer max returns integer
 local integer result = R2I(percentage * I2R(max) * 0.01)

 if (result < 0) then
 set result = 0
 elseif (result > max) then
 set result = max
 endif

 return result
endfunction


function PercentTo255 takes real percentage returns integer
 return PercentToInt(percentage, 255)
endfunction


function GetTimeOfDay takes nothing returns real
 return GetFloatGameState(GAME_STATE_TIME_OF_DAY)
endfunction


function SetTimeOfDay takes real whatTime returns nothing
 call SetFloatGameState(GAME_STATE_TIME_OF_DAY, whatTime)
endfunction


function SetTimeOfDayScalePercentBJ takes real scalePercent returns nothing
 call SetTimeOfDayScale(scalePercent * 0.01)
endfunction


function GetTimeOfDayScalePercentBJ takes nothing returns real
 return GetTimeOfDayScale() * 100
endfunction


function PlaySound takes string soundName returns nothing
 local sound soundHandle = CreateSound(soundName, false, false, true, 12700, 12700, "")
 call StartSound(soundHandle)
 call KillSoundWhenDone(soundHandle)
endfunction


function CompareLocationsBJ takes location A, location B returns boolean
 return GetLocationX(A) == GetLocationX(B) and GetLocationY(A) == GetLocationY(B)
endfunction


function CompareRectsBJ takes rect A, rect B returns boolean
 return GetRectMinX(A) == GetRectMinX(B) and GetRectMinY(A) == GetRectMinY(B) and GetRectMaxX(A) == GetRectMaxX(B) and GetRectMaxY(A) == GetRectMaxY(B)
endfunction




function GetRectFromCircleBJ takes location center, real radius returns rect
 local real centerX = GetLocationX(center)
 local real centerY = GetLocationY(center)
 return Rect(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
endfunction







function GetCurrentCameraSetup takes nothing returns camerasetup
 local camerasetup theCam = CreateCameraSetup()
 local real duration = 0
 call CameraSetupSetField(theCam, CAMERA_FIELD_TARGET_DISTANCE, GetCameraField(CAMERA_FIELD_TARGET_DISTANCE), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_FARZ, GetCameraField(CAMERA_FIELD_FARZ), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_ZOFFSET, GetCameraField(CAMERA_FIELD_ZOFFSET), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_ANGLE_OF_ATTACK, bj_RADTODEG * GetCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_FIELD_OF_VIEW, bj_RADTODEG * GetCameraField(CAMERA_FIELD_FIELD_OF_VIEW), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_ROLL, bj_RADTODEG * GetCameraField(CAMERA_FIELD_ROLL), duration)
 call CameraSetupSetField(theCam, CAMERA_FIELD_ROTATION, bj_RADTODEG * GetCameraField(CAMERA_FIELD_ROTATION), duration)
 call CameraSetupSetDestPosition(theCam, GetCameraTargetPositionX(), GetCameraTargetPositionY(), duration)
 return theCam
endfunction


function CameraSetupApplyForPlayer takes boolean doPan, camerasetup whichSetup, player whichPlayer, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call CameraSetupApplyForceDuration(whichSetup, doPan, duration)
 endif
endfunction


function CameraSetupGetFieldSwap takes camerafield whichField, camerasetup whichSetup returns real
 return CameraSetupGetField(whichSetup, whichField)
endfunction


function SetCameraFieldForPlayer takes player whichPlayer, camerafield whichField, real value, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraField(whichField, value, duration)
 endif
endfunction


function SetCameraTargetControllerNoZForPlayer takes player whichPlayer, unit whichUnit, real xoffset, real yoffset, boolean inheritOrientation returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraTargetController(whichUnit, xoffset, yoffset, inheritOrientation)
 endif
endfunction


function SetCameraPositionForPlayer takes player whichPlayer, real x, real y returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraPosition(x, y)
 endif
endfunction


function SetCameraPositionLocForPlayer takes player whichPlayer, location loc returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraPosition(GetLocationX(loc), GetLocationY(loc))
 endif
endfunction


function RotateCameraAroundLocBJ takes real degrees, location loc, player whichPlayer, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraRotateMode(GetLocationX(loc), GetLocationY(loc), bj_DEGTORAD * degrees, duration)
 endif
endfunction


function PanCameraToForPlayer takes player whichPlayer, real x, real y returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PanCameraTo(x, y)
 endif
endfunction


function PanCameraToLocForPlayer takes player whichPlayer, location loc returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PanCameraTo(GetLocationX(loc), GetLocationY(loc))
 endif
endfunction


function PanCameraToTimedForPlayer takes player whichPlayer, real x, real y, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PanCameraToTimed(x, y, duration)
 endif
endfunction


function PanCameraToTimedLocForPlayer takes player whichPlayer, location loc, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
 endif
endfunction


function PanCameraToTimedLocWithZForPlayer takes player whichPlayer, location loc, real zOffset, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PanCameraToTimedWithZ(GetLocationX(loc), GetLocationY(loc), zOffset, duration)
 endif
endfunction


function SmartCameraPanBJ takes player whichPlayer, location loc, real duration returns nothing
 local real dist
 if (GetLocalPlayer() == whichPlayer) then
 

 set dist = DistanceBetweenPoints(loc, GetCameraTargetPositionLoc())
 if (dist >= bj_SMARTPAN_TRESHOLD_SNAP) then
 
 call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), 0)
 elseif (dist >= bj_SMARTPAN_TRESHOLD_PAN) then
 
 call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
 else
 
 endif
 endif
endfunction


function SetCinematicCameraForPlayer takes player whichPlayer, string cameraModelFile returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCinematicCamera(cameraModelFile)
 endif
endfunction


function ResetToGameCameraForPlayer takes player whichPlayer, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ResetToGameCamera(duration)
 endif
endfunction


function CameraSetSourceNoiseForPlayer takes player whichPlayer, real magnitude, real velocity returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call CameraSetSourceNoise(magnitude, velocity)
 endif
endfunction


function CameraSetTargetNoiseForPlayer takes player whichPlayer, real magnitude, real velocity returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call CameraSetTargetNoise(magnitude, velocity)
 endif
endfunction


function CameraSetEQNoiseForPlayer takes player whichPlayer, real magnitude returns nothing
 local real richter = magnitude
 if (richter > 5.0) then
 set richter = 5.0
 endif
 if (richter < 2.0) then
 set richter = 2.0
 endif
 if (GetLocalPlayer() == whichPlayer) then
 
 call CameraSetTargetNoiseEx(magnitude*2.0, magnitude*Pow(10,richter),true)
 call CameraSetSourceNoiseEx(magnitude*2.0, magnitude*Pow(10,richter),true)
 endif
endfunction


function CameraClearNoiseForPlayer takes player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call CameraSetSourceNoise(0, 0)
 call CameraSetTargetNoise(0, 0)
 endif
endfunction




function GetCurrentCameraBoundsMapRectBJ takes nothing returns rect
 return Rect(GetCameraBoundMinX(), GetCameraBoundMinY(), GetCameraBoundMaxX(), GetCameraBoundMaxY())
endfunction




function GetCameraBoundsMapRect takes nothing returns rect
 return bj_mapInitialCameraBounds
endfunction




function GetPlayableMapRect takes nothing returns rect
 return bj_mapInitialPlayableArea
endfunction




function GetEntireMapRect takes nothing returns rect
 return GetWorldBounds()
endfunction


function SetCameraBoundsToRect takes rect r returns nothing
 local real minX = GetRectMinX(r)
 local real minY = GetRectMinY(r)
 local real maxX = GetRectMaxX(r)
 local real maxY = GetRectMaxY(r)
 call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction


function SetCameraBoundsToRectForPlayerBJ takes player whichPlayer, rect r returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraBoundsToRect(r)
 endif
endfunction


function AdjustCameraBoundsBJ takes integer adjustMethod, real dxWest, real dxEast, real dyNorth, real dySouth returns nothing
 local real minX = 0
 local real minY = 0
 local real maxX = 0
 local real maxY = 0
 local real scale = 0

 if (adjustMethod == bj_CAMERABOUNDS_ADJUST_ADD) then
 set scale = 1
 elseif (adjustMethod == bj_CAMERABOUNDS_ADJUST_SUB) then
 set scale = -1
 else
 
 return
 endif

 
 set minX = GetCameraBoundMinX() - scale * dxWest
 set maxX = GetCameraBoundMaxX() + scale * dxEast
 set minY = GetCameraBoundMinY() - scale * dySouth
 set maxY = GetCameraBoundMaxY() + scale * dyNorth

 
 if (maxX < minX) then
 set minX = (minX + maxX) * 0.5
 set maxX = minX
 endif
 if (maxY < minY) then
 set minY = (minY + maxY) * 0.5
 set maxY = minY
 endif

 
 call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction


function AdjustCameraBoundsForPlayerBJ takes integer adjustMethod, player whichPlayer, real dxWest, real dxEast, real dyNorth, real dySouth returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call AdjustCameraBoundsBJ(adjustMethod, dxWest, dxEast, dyNorth, dySouth)
 endif
endfunction


function SetCameraQuickPositionForPlayer takes player whichPlayer, real x, real y returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraQuickPosition(x, y)
 endif
endfunction


function SetCameraQuickPositionLocForPlayer takes player whichPlayer, location loc returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
 endif
endfunction


function SetCameraQuickPositionLoc takes location loc returns nothing
 call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
endfunction


function StopCameraForPlayerBJ takes player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call StopCamera()
 endif
endfunction


function SetCameraOrientControllerForPlayerBJ takes player whichPlayer, unit whichUnit, real xoffset, real yoffset returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SetCameraOrientController(whichUnit, xoffset, yoffset)
 endif
endfunction


function CameraSetSmoothingFactorBJ takes real factor returns nothing
 call CameraSetSmoothingFactor(factor)
endfunction


function CameraResetSmoothingFactorBJ takes nothing returns nothing
 call CameraSetSmoothingFactor(0)
endfunction







function DisplayTextToForce takes force toForce, string message returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
 
 call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, message)
 endif
endfunction


function DisplayTimedTextToForce takes force toForce, real duration, string message returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
 
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, duration, message)
 endif
endfunction


function ClearTextMessagesBJ takes force toForce returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
 
 call ClearTextMessages()
 endif
endfunction





function SubStringBJ takes string source, integer start, integer end returns string
 return SubString(source, start-1, end)
endfunction 
function GetHandleIdBJ takes handle h returns integer
 return GetHandleId(h)
endfunction

function StringHashBJ takes string s returns integer
 return StringHash(s)
endfunction







function TriggerRegisterTimerEventPeriodic takes trigger trig, real timeout returns event
 return TriggerRegisterTimerEvent(trig, timeout, true)
endfunction


function TriggerRegisterTimerEventSingle takes trigger trig, real timeout returns event
 return TriggerRegisterTimerEvent(trig, timeout, false)
endfunction


function TriggerRegisterTimerExpireEventBJ takes trigger trig, timer t returns event
 return TriggerRegisterTimerExpireEvent(trig, t)
endfunction


function TriggerRegisterPlayerUnitEventSimple takes trigger trig, player whichPlayer, playerunitevent whichEvent returns event
 return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, whichEvent, null)
endfunction


function TriggerRegisterAnyUnitEventBJ takes trigger trig, playerunitevent whichEvent returns nothing
 local integer index

 set index = 0
 loop
 call TriggerRegisterPlayerUnitEvent(trig, Player(index), whichEvent, null)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYER_SLOTS
 endloop
endfunction


function TriggerRegisterPlayerSelectionEventBJ takes trigger trig, player whichPlayer, boolean selected returns event
 if selected then
 return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_SELECTED, null)
 else
 return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_DESELECTED, null)
 endif
endfunction


function TriggerRegisterPlayerKeyEventBJ takes trigger trig, player whichPlayer, integer keType, integer keKey returns event
 if (keType == bj_KEYEVENTTYPE_DEPRESS) then
 
 if (keKey == bj_KEYEVENTKEY_LEFT) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_DOWN)
 elseif (keKey == bj_KEYEVENTKEY_RIGHT) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_DOWN)
 elseif (keKey == bj_KEYEVENTKEY_DOWN) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_DOWN)
 elseif (keKey == bj_KEYEVENTKEY_UP) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_DOWN)
 else
 
 return null
 endif
 elseif (keType == bj_KEYEVENTTYPE_RELEASE) then
 
 if (keKey == bj_KEYEVENTKEY_LEFT) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_UP)
 elseif (keKey == bj_KEYEVENTKEY_RIGHT) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_UP)
 elseif (keKey == bj_KEYEVENTKEY_DOWN) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_UP)
 elseif (keKey == bj_KEYEVENTKEY_UP) then
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_UP)
 else
 
 return null
 endif
 else
 
 return null
 endif
endfunction


function TriggerRegisterPlayerMouseEventBJ takes trigger trig, player whichPlayer, integer meType returns event
 if (meType == bj_MOUSEEVENTTYPE_DOWN) then
 
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_DOWN)
 elseif (meType == bj_MOUSEEVENTTYPE_UP) then
 
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_UP)
 elseif (meType == bj_MOUSEEVENTTYPE_MOVE) then
 
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_MOVE)
 else
 
 return null
 endif
endfunction


function TriggerRegisterPlayerEventVictory takes trigger trig, player whichPlayer returns event
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_VICTORY)
endfunction


function TriggerRegisterPlayerEventDefeat takes trigger trig, player whichPlayer returns event
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_DEFEAT)
endfunction


function TriggerRegisterPlayerEventLeave takes trigger trig, player whichPlayer returns event
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_LEAVE)
endfunction


function TriggerRegisterPlayerEventAllianceChanged takes trigger trig, player whichPlayer returns event
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ALLIANCE_CHANGED)
endfunction


function TriggerRegisterPlayerEventEndCinematic takes trigger trig, player whichPlayer returns event
 return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_END_CINEMATIC)
endfunction


function TriggerRegisterGameStateEventTimeOfDay takes trigger trig, limitop opcode, real limitval returns event
 return TriggerRegisterGameStateEvent(trig, GAME_STATE_TIME_OF_DAY, opcode, limitval)
endfunction


function TriggerRegisterEnterRegionSimple takes trigger trig, region whichRegion returns event
 return TriggerRegisterEnterRegion(trig, whichRegion, null)
endfunction


function TriggerRegisterLeaveRegionSimple takes trigger trig, region whichRegion returns event
 return TriggerRegisterLeaveRegion(trig, whichRegion, null)
endfunction


function TriggerRegisterEnterRectSimple takes trigger trig, rect r returns event
 local region rectRegion = CreateRegion()
 call RegionAddRect(rectRegion, r)
 return TriggerRegisterEnterRegion(trig, rectRegion, null)
endfunction


function TriggerRegisterLeaveRectSimple takes trigger trig, rect r returns event
 local region rectRegion = CreateRegion()
 call RegionAddRect(rectRegion, r)
 return TriggerRegisterLeaveRegion(trig, rectRegion, null)
endfunction


function TriggerRegisterDistanceBetweenUnits takes trigger trig, unit whichUnit, boolexpr condition, real range returns event
 return TriggerRegisterUnitInRange(trig, whichUnit, range, condition)
endfunction


function TriggerRegisterUnitInRangeSimple takes trigger trig, real range, unit whichUnit returns event
 return TriggerRegisterUnitInRange(trig, whichUnit, range, null)
endfunction


function TriggerRegisterUnitLifeEvent takes trigger trig, unit whichUnit, limitop opcode, real limitval returns event
 return TriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_LIFE, opcode, limitval)
endfunction


function TriggerRegisterUnitManaEvent takes trigger trig, unit whichUnit, limitop opcode, real limitval returns event
 return TriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_MANA, opcode, limitval)
endfunction


function TriggerRegisterDialogEventBJ takes trigger trig, dialog whichDialog returns event
 return TriggerRegisterDialogEvent(trig, whichDialog)
endfunction


function TriggerRegisterShowSkillEventBJ takes trigger trig returns event
 return TriggerRegisterGameEvent(trig, EVENT_GAME_SHOW_SKILL)
endfunction


function TriggerRegisterBuildSubmenuEventBJ takes trigger trig returns event
 return TriggerRegisterGameEvent(trig, EVENT_GAME_BUILD_SUBMENU)
endfunction


function TriggerRegisterGameLoadedEventBJ takes trigger trig returns event
 return TriggerRegisterGameEvent(trig, EVENT_GAME_LOADED)
endfunction


function TriggerRegisterGameSavedEventBJ takes trigger trig returns event
 return TriggerRegisterGameEvent(trig, EVENT_GAME_SAVE)
endfunction


function RegisterDestDeathInRegionEnum takes nothing returns nothing
 set bj_destInRegionDiesCount = bj_destInRegionDiesCount + 1
 if (bj_destInRegionDiesCount <= bj_MAX_DEST_IN_REGION_EVENTS) then
 call TriggerRegisterDeathEvent(bj_destInRegionDiesTrig, GetEnumDestructable())
 endif
endfunction


function TriggerRegisterDestDeathInRegionEvent takes trigger trig, rect r returns nothing
 set bj_destInRegionDiesTrig = trig
 set bj_destInRegionDiesCount = 0
 call EnumDestructablesInRect(r, null, function RegisterDestDeathInRegionEnum)
endfunction







function AddWeatherEffectSaveLast takes rect where, integer effectID returns weathereffect
 set bj_lastCreatedWeatherEffect = AddWeatherEffect(where, effectID)
 return bj_lastCreatedWeatherEffect
endfunction


function GetLastCreatedWeatherEffect takes nothing returns weathereffect
 return bj_lastCreatedWeatherEffect
endfunction


function RemoveWeatherEffectBJ takes weathereffect whichWeatherEffect returns nothing
 call RemoveWeatherEffect(whichWeatherEffect)
endfunction


function TerrainDeformationCraterBJ takes real duration, boolean permanent, location where, real radius, real depth returns terraindeformation
 set bj_lastCreatedTerrainDeformation = TerrainDeformCrater(GetLocationX(where), GetLocationY(where), radius, depth, R2I(duration * 1000), permanent)
 return bj_lastCreatedTerrainDeformation
endfunction


function TerrainDeformationRippleBJ takes real duration, boolean limitNeg, location where, real startRadius, real endRadius, real depth, real wavePeriod, real waveWidth returns terraindeformation
 local real spaceWave
 local real timeWave
 local real radiusRatio

 if (endRadius <= 0 or waveWidth <= 0 or wavePeriod <= 0) then
 return null
 endif

 set timeWave = 2.0 * duration / wavePeriod
 set spaceWave = 2.0 * endRadius / waveWidth
 set radiusRatio = startRadius / endRadius

 set bj_lastCreatedTerrainDeformation = TerrainDeformRipple(GetLocationX(where), GetLocationY(where), endRadius, depth, R2I(duration * 1000), 1, spaceWave, timeWave, radiusRatio, limitNeg)
 return bj_lastCreatedTerrainDeformation
endfunction


function TerrainDeformationWaveBJ takes real duration, location source, location target, real radius, real depth, real trailDelay returns terraindeformation
 local real distance
 local real dirX
 local real dirY
 local real speed

 set distance = DistanceBetweenPoints(source, target)
 if (distance == 0 or duration <= 0) then
 return null
 endif

 set dirX = (GetLocationX(target) - GetLocationX(source)) / distance
 set dirY = (GetLocationY(target) - GetLocationY(source)) / distance
 set speed = distance / duration

 set bj_lastCreatedTerrainDeformation = TerrainDeformWave(GetLocationX(source), GetLocationY(source), dirX, dirY, distance, speed, radius, depth, R2I(trailDelay * 1000), 1)
 return bj_lastCreatedTerrainDeformation
endfunction


function TerrainDeformationRandomBJ takes real duration, location where, real radius, real minDelta, real maxDelta, real updateInterval returns terraindeformation
 set bj_lastCreatedTerrainDeformation = TerrainDeformRandom(GetLocationX(where), GetLocationY(where), radius, minDelta, maxDelta, R2I(duration * 1000), R2I(updateInterval * 1000))
 return bj_lastCreatedTerrainDeformation
endfunction


function TerrainDeformationStopBJ takes terraindeformation deformation, real duration returns nothing
 call TerrainDeformStop(deformation, R2I(duration * 1000))
endfunction


function GetLastCreatedTerrainDeformation takes nothing returns terraindeformation
 return bj_lastCreatedTerrainDeformation
endfunction


function AddLightningLoc takes string codeName, location where1, location where2 returns lightning
 set bj_lastCreatedLightning = AddLightningEx(codeName, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
 return bj_lastCreatedLightning
endfunction


function DestroyLightningBJ takes lightning whichBolt returns boolean
 return DestroyLightning(whichBolt)
endfunction


function MoveLightningLoc takes lightning whichBolt, location where1, location where2 returns boolean
 return MoveLightningEx(whichBolt, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
endfunction


function GetLightningColorABJ takes lightning whichBolt returns real
 return GetLightningColorA(whichBolt)
endfunction


function GetLightningColorRBJ takes lightning whichBolt returns real
 return GetLightningColorR(whichBolt)
endfunction


function GetLightningColorGBJ takes lightning whichBolt returns real
 return GetLightningColorG(whichBolt)
endfunction


function GetLightningColorBBJ takes lightning whichBolt returns real
 return GetLightningColorB(whichBolt)
endfunction


function SetLightningColorBJ takes lightning whichBolt, real r, real g, real b, real a returns boolean
 return SetLightningColor(whichBolt, r, g, b, a)
endfunction


function GetLastCreatedLightningBJ takes nothing returns lightning
 return bj_lastCreatedLightning
endfunction


function GetAbilityEffectBJ takes integer abilcode, effecttype t, integer index returns string
 return GetAbilityEffectById(abilcode, t, index)
endfunction


function GetAbilitySoundBJ takes integer abilcode, soundtype t returns string
 return GetAbilitySoundById(abilcode, t)
endfunction

function GetTerrainCliffLevelBJ takes location where returns integer
 return GetTerrainCliffLevel(GetLocationX(where), GetLocationY(where))
endfunction


function GetTerrainTypeBJ takes location where returns integer
 return GetTerrainType(GetLocationX(where), GetLocationY(where))
endfunction


function GetTerrainVarianceBJ takes location where returns integer
 return GetTerrainVariance(GetLocationX(where), GetLocationY(where))
endfunction


function SetTerrainTypeBJ takes location where, integer terrainType, integer variation, integer area, integer shape returns nothing
 call SetTerrainType(GetLocationX(where), GetLocationY(where), terrainType, variation, area, shape)
endfunction


function IsTerrainPathableBJ takes location where, pathingtype t returns boolean
 return IsTerrainPathable(GetLocationX(where), GetLocationY(where), t)
endfunction


function SetTerrainPathableBJ takes location where, pathingtype t, boolean flag returns nothing
 call SetTerrainPathable(GetLocationX(where), GetLocationY(where), t, flag)
endfunction


function SetWaterBaseColorBJ takes real red, real green, real blue, real transparency returns nothing
 call SetWaterBaseColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function CreateFogModifierRectSimple takes player whichPlayer, fogstate whichFogState, rect r, boolean afterUnits returns fogmodifier
 set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, afterUnits)
 return bj_lastCreatedFogModifier
endfunction


function CreateFogModifierRadiusLocSimple takes player whichPlayer, fogstate whichFogState, location center, real radius, boolean afterUnits returns fogmodifier
 set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, afterUnits)
 return bj_lastCreatedFogModifier
endfunction






function CreateFogModifierRectBJ takes boolean enabled, player whichPlayer, fogstate whichFogState, rect r returns fogmodifier
 set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, false)
 if enabled then
 call FogModifierStart(bj_lastCreatedFogModifier)
 endif
 return bj_lastCreatedFogModifier
endfunction






function CreateFogModifierRadiusLocBJ takes boolean enabled, player whichPlayer, fogstate whichFogState, location center, real radius returns fogmodifier
 set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, false)
 if enabled then
 call FogModifierStart(bj_lastCreatedFogModifier)
 endif
 return bj_lastCreatedFogModifier
endfunction


function GetLastCreatedFogModifier takes nothing returns fogmodifier
 return bj_lastCreatedFogModifier
endfunction


function FogEnableOn takes nothing returns nothing
 call FogEnable(true)
endfunction


function FogEnableOff takes nothing returns nothing
 call FogEnable(false)
endfunction


function FogMaskEnableOn takes nothing returns nothing
 call FogMaskEnable(true)
endfunction


function FogMaskEnableOff takes nothing returns nothing
 call FogMaskEnable(false)
endfunction


function UseTimeOfDayBJ takes boolean flag returns nothing
 call SuspendTimeOfDay(not flag)
endfunction


function SetTerrainFogExBJ takes integer style, real zstart, real zend, real density, real red, real green, real blue returns nothing
 call SetTerrainFogEx(style, zstart, zend, density, red * 0.01, green * 0.01, blue * 0.01)
endfunction


function ResetTerrainFogBJ takes nothing returns nothing
 call ResetTerrainFog()
endfunction


function SetDoodadAnimationBJ takes string animName, integer doodadID, real radius, location center returns nothing
 call SetDoodadAnimation(GetLocationX(center), GetLocationY(center), radius, doodadID, false, animName, false)
endfunction


function SetDoodadAnimationRectBJ takes string animName, integer doodadID, rect r returns nothing
 call SetDoodadAnimationRect(r, doodadID, animName, false)
endfunction


function AddUnitAnimationPropertiesBJ takes boolean add, string animProperties, unit whichUnit returns nothing
 call AddUnitAnimationProperties(whichUnit, animProperties, add)
endfunction

function CreateImageBJ takes string file, real size, location where, real zOffset, integer imageType returns image
 set bj_lastCreatedImage = CreateImage(file, size, size, size, GetLocationX(where), GetLocationY(where), zOffset, 0, 0, 0, imageType)
 return bj_lastCreatedImage
endfunction


function ShowImageBJ takes boolean flag, image whichImage returns nothing
 call ShowImage(whichImage, flag)
endfunction


function SetImagePositionBJ takes image whichImage, location where, real zOffset returns nothing
 call SetImagePosition(whichImage, GetLocationX(where), GetLocationY(where), zOffset)
endfunction


function SetImageColorBJ takes image whichImage, real red, real green, real blue, real alpha returns nothing
 call SetImageColor(whichImage, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-alpha))
endfunction


function GetLastCreatedImage takes nothing returns image
 return bj_lastCreatedImage
endfunction


function CreateUbersplatBJ takes location where, string name, real red, real green, real blue, real alpha, boolean forcePaused, boolean noBirthTime returns ubersplat
 set bj_lastCreatedUbersplat = CreateUbersplat(GetLocationX(where), GetLocationY(where), name, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-alpha), forcePaused, noBirthTime)
 return bj_lastCreatedUbersplat
endfunction


function ShowUbersplatBJ takes boolean flag, ubersplat whichSplat returns nothing
 call ShowUbersplat(whichSplat, flag)
endfunction


function GetLastCreatedUbersplat takes nothing returns ubersplat
 return bj_lastCreatedUbersplat
endfunction







function PlaySoundBJ takes sound soundHandle returns nothing
 set bj_lastPlayedSound = soundHandle
 if (soundHandle != null) then
 call StartSound(soundHandle)
 endif
endfunction


function StopSoundBJ takes sound soundHandle, boolean fadeOut returns nothing
 call StopSound(soundHandle, false, fadeOut)
endfunction


function SetSoundVolumeBJ takes sound soundHandle, real volumePercent returns nothing
 call SetSoundVolume(soundHandle, PercentToInt(volumePercent, 127))
endfunction


function SetSoundOffsetBJ takes real newOffset, sound soundHandle returns nothing
 call SetSoundPlayPosition(soundHandle, R2I(newOffset * 1000))
endfunction


function SetSoundDistanceCutoffBJ takes sound soundHandle, real cutoff returns nothing
 call SetSoundDistanceCutoff(soundHandle, cutoff)
endfunction


function SetSoundPitchBJ takes sound soundHandle, real pitch returns nothing
 call SetSoundPitch(soundHandle, pitch)
endfunction


function SetSoundPositionLocBJ takes sound soundHandle, location loc, real z returns nothing
 call SetSoundPosition(soundHandle, GetLocationX(loc), GetLocationY(loc), z)
endfunction


function AttachSoundToUnitBJ takes sound soundHandle, unit whichUnit returns nothing
 call AttachSoundToUnit(soundHandle, whichUnit)
endfunction


function SetSoundConeAnglesBJ takes sound soundHandle, real inside, real outside, real outsideVolumePercent returns nothing
 call SetSoundConeAngles(soundHandle, inside, outside, PercentToInt(outsideVolumePercent, 127))
endfunction


function KillSoundWhenDoneBJ takes sound soundHandle returns nothing
 call KillSoundWhenDone(soundHandle)
endfunction


function PlaySoundAtPointBJ takes sound soundHandle, real volumePercent, location loc, real z returns nothing
 call SetSoundPositionLocBJ(soundHandle, loc, z)
 call SetSoundVolumeBJ(soundHandle, volumePercent)
 call PlaySoundBJ(soundHandle)
endfunction


function PlaySoundOnUnitBJ takes sound soundHandle, real volumePercent, unit whichUnit returns nothing
 call AttachSoundToUnitBJ(soundHandle, whichUnit)
 call SetSoundVolumeBJ(soundHandle, volumePercent)
 call PlaySoundBJ(soundHandle)
endfunction


function PlaySoundFromOffsetBJ takes sound soundHandle, real volumePercent, real startingOffset returns nothing
 call SetSoundVolumeBJ(soundHandle, volumePercent)
 call PlaySoundBJ(soundHandle)
 call SetSoundOffsetBJ(startingOffset, soundHandle)
endfunction


function PlayMusicBJ takes string musicFileName returns nothing
 set bj_lastPlayedMusic = musicFileName
 call PlayMusic(musicFileName)
endfunction


function PlayMusicExBJ takes string musicFileName, real startingOffset, real fadeInTime returns nothing
 set bj_lastPlayedMusic = musicFileName
 call PlayMusicEx(musicFileName, R2I(startingOffset * 1000), R2I(fadeInTime * 1000))
endfunction


function SetMusicOffsetBJ takes real newOffset returns nothing
 call SetMusicPlayPosition(R2I(newOffset * 1000))
endfunction


function PlayThematicMusicBJ takes string musicName returns nothing
 call PlayThematicMusic(musicName)
endfunction


function PlayThematicMusicExBJ takes string musicName, real startingOffset returns nothing
 call PlayThematicMusicEx(musicName, R2I(startingOffset * 1000))
endfunction


function SetThematicMusicOffsetBJ takes real newOffset returns nothing
 call SetThematicMusicPlayPosition(R2I(newOffset * 1000))
endfunction


function EndThematicMusicBJ takes nothing returns nothing
 call EndThematicMusic()
endfunction


function StopMusicBJ takes boolean fadeOut returns nothing
 call StopMusic(fadeOut)
endfunction


function ResumeMusicBJ takes nothing returns nothing
 call ResumeMusic()
endfunction


function SetMusicVolumeBJ takes real volumePercent returns nothing
 call SetMusicVolume(PercentToInt(volumePercent, 127))
endfunction


function GetSoundDurationBJ takes sound soundHandle returns real
 if (soundHandle == null) then
 return bj_NOTHING_SOUND_DURATION
 else
 return I2R(GetSoundDuration(soundHandle)) * 0.001
 endif
endfunction


function GetSoundFileDurationBJ takes string musicFileName returns real
 return I2R(GetSoundFileDuration(musicFileName)) * 0.001
endfunction


function GetLastPlayedSound takes nothing returns sound
 return bj_lastPlayedSound
endfunction


function GetLastPlayedMusic takes nothing returns string
 return bj_lastPlayedMusic
endfunction


function VolumeGroupSetVolumeBJ takes volumegroup vgroup, real percent returns nothing
 call VolumeGroupSetVolume(vgroup, percent * 0.01)
endfunction


function SetCineModeVolumeGroupsImmediateBJ takes nothing returns nothing
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITMOVEMENT, bj_CINEMODE_VOLUME_UNITMOVEMENT)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITSOUNDS, bj_CINEMODE_VOLUME_UNITSOUNDS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_COMBAT, bj_CINEMODE_VOLUME_COMBAT)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_SPELLS, bj_CINEMODE_VOLUME_SPELLS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UI, bj_CINEMODE_VOLUME_UI)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_MUSIC, bj_CINEMODE_VOLUME_MUSIC)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_AMBIENTSOUNDS, bj_CINEMODE_VOLUME_AMBIENTSOUNDS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_FIRE, bj_CINEMODE_VOLUME_FIRE)
endfunction


function SetCineModeVolumeGroupsBJ takes nothing returns nothing
 
 if bj_gameStarted then
 call SetCineModeVolumeGroupsImmediateBJ()
 else
 call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetCineModeVolumeGroupsImmediateBJ)
 endif
endfunction


function SetSpeechVolumeGroupsImmediateBJ takes nothing returns nothing
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITMOVEMENT, bj_SPEECH_VOLUME_UNITMOVEMENT)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITSOUNDS, bj_SPEECH_VOLUME_UNITSOUNDS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_COMBAT, bj_SPEECH_VOLUME_COMBAT)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_SPELLS, bj_SPEECH_VOLUME_SPELLS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UI, bj_SPEECH_VOLUME_UI)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_MUSIC, bj_SPEECH_VOLUME_MUSIC)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_AMBIENTSOUNDS, bj_SPEECH_VOLUME_AMBIENTSOUNDS)
 call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_FIRE, bj_SPEECH_VOLUME_FIRE)
endfunction


function SetSpeechVolumeGroupsBJ takes nothing returns nothing
 
 if bj_gameStarted then
 call SetSpeechVolumeGroupsImmediateBJ()
 else
 call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetSpeechVolumeGroupsImmediateBJ)
 endif
endfunction


function VolumeGroupResetImmediateBJ takes nothing returns nothing
 call VolumeGroupReset()
endfunction


function VolumeGroupResetBJ takes nothing returns nothing
 
 if bj_gameStarted then
 call VolumeGroupResetImmediateBJ()
 else
 call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function VolumeGroupResetImmediateBJ)
 endif
endfunction


function GetSoundIsPlayingBJ takes sound soundHandle returns boolean
 return GetSoundIsLoading(soundHandle) or GetSoundIsPlaying(soundHandle)
endfunction


function WaitForSoundBJ takes sound soundHandle, real offset returns nothing
 call TriggerWaitForSound( soundHandle, offset )
endfunction


function SetMapMusicIndexedBJ takes string musicName, integer index returns nothing
 call SetMapMusic(musicName, false, index)
endfunction


function SetMapMusicRandomBJ takes string musicName returns nothing
 call SetMapMusic(musicName, true, 0)
endfunction


function ClearMapMusicBJ takes nothing returns nothing
 call ClearMapMusic()
endfunction


function SetStackedSoundBJ takes boolean add, sound soundHandle, rect r returns nothing
 local real width = GetRectMaxX(r) - GetRectMinX(r)
 local real height = GetRectMaxY(r) - GetRectMinY(r)

 call SetSoundPosition(soundHandle, GetRectCenterX(r), GetRectCenterY(r), 0)
 if add then
 call RegisterStackedSound(soundHandle, true, width, height)
 else
 call UnregisterStackedSound(soundHandle, true, width, height)
 endif
endfunction


function StartSoundForPlayerBJ takes player whichPlayer, sound soundHandle returns nothing
 if (whichPlayer == GetLocalPlayer()) then
 call StartSound(soundHandle)
 endif
endfunction


function VolumeGroupSetVolumeForPlayerBJ takes player whichPlayer, volumegroup vgroup, real scale returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 call VolumeGroupSetVolume(vgroup, scale)
 endif
endfunction


function EnableDawnDusk takes boolean flag returns nothing
 set bj_useDawnDuskSounds = flag
endfunction


function IsDawnDuskEnabled takes nothing returns boolean
 return bj_useDawnDuskSounds
endfunction







function SetAmbientDaySound takes string inLabel returns nothing
 local real ToD

 
 if (bj_dayAmbientSound != null) then
 call StopSound(bj_dayAmbientSound, true, true)
 endif

 
 set bj_dayAmbientSound = CreateMIDISound(inLabel, 20, 20)

 
 set ToD = GetTimeOfDay()
 if (ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) then
 call StartSound(bj_dayAmbientSound)
 endif
endfunction


function SetAmbientNightSound takes string inLabel returns nothing
 local real ToD

 
 if (bj_nightAmbientSound != null) then
 call StopSound(bj_nightAmbientSound, true, true)
 endif

 
 set bj_nightAmbientSound = CreateMIDISound(inLabel, 20, 20)

 
 set ToD = GetTimeOfDay()
 if (ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) then
 call StartSound(bj_nightAmbientSound)
 endif
endfunction







function AddSpecialEffectLocBJ takes location where, string modelName returns effect
 set bj_lastCreatedEffect = AddSpecialEffectLoc(modelName, where)
 return bj_lastCreatedEffect
endfunction


function AddSpecialEffectTargetUnitBJ takes string attachPointName, widget targetWidget, string modelName returns effect
 set bj_lastCreatedEffect = AddSpecialEffectTarget(modelName, targetWidget, attachPointName)
 return bj_lastCreatedEffect
endfunction






















function DestroyEffectBJ takes effect whichEffect returns nothing
 call DestroyEffect(whichEffect)
endfunction


function GetLastCreatedEffectBJ takes nothing returns effect
 return bj_lastCreatedEffect
endfunction







function GetItemLoc takes item whichItem returns location
 return Location(GetItemX(whichItem), GetItemY(whichItem))
endfunction


function GetItemLifeBJ takes widget whichWidget returns real
 return GetWidgetLife(whichWidget)
endfunction


function SetItemLifeBJ takes widget whichWidget, real life returns nothing
 call SetWidgetLife(whichWidget, life)
endfunction


function AddHeroXPSwapped takes integer xpToAdd, unit whichHero, boolean showEyeCandy returns nothing
 call AddHeroXP(whichHero, xpToAdd, showEyeCandy)
endfunction


function SetHeroLevelBJ takes unit whichHero, integer newLevel, boolean showEyeCandy returns nothing
 local integer oldLevel = GetHeroLevel(whichHero)

 if (newLevel > oldLevel) then
 call SetHeroLevel(whichHero, newLevel, showEyeCandy)
 elseif (newLevel < oldLevel) then
 call UnitStripHeroLevel(whichHero, oldLevel - newLevel)
 else
 
 endif
endfunction


function DecUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
 return DecUnitAbilityLevel(whichUnit, abilcode)
endfunction


function IncUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
 return IncUnitAbilityLevel(whichUnit, abilcode)
endfunction


function SetUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit, integer level returns integer
 return SetUnitAbilityLevel(whichUnit, abilcode, level)
endfunction


function GetUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
 return GetUnitAbilityLevel(whichUnit, abilcode)
endfunction


function UnitHasBuffBJ takes unit whichUnit, integer buffcode returns boolean
 return (GetUnitAbilityLevel(whichUnit, buffcode) > 0)
endfunction


function UnitRemoveBuffBJ takes integer buffcode, unit whichUnit returns boolean
 return UnitRemoveAbility(whichUnit, buffcode)
endfunction


function UnitAddItemSwapped takes item whichItem, unit whichHero returns boolean
 return UnitAddItem(whichHero, whichItem)
endfunction


function UnitAddItemByIdSwapped takes integer itemId, unit whichHero returns item
 
 
 
 set bj_lastCreatedItem = CreateItem(itemId, GetUnitX(whichHero), GetUnitY(whichHero))
 call UnitAddItem(whichHero, bj_lastCreatedItem)
 return bj_lastCreatedItem
endfunction


function UnitRemoveItemSwapped takes item whichItem, unit whichHero returns nothing
 set bj_lastRemovedItem = whichItem
 call UnitRemoveItem(whichHero, whichItem)
endfunction




function UnitRemoveItemFromSlotSwapped takes integer itemSlot, unit whichHero returns item
 set bj_lastRemovedItem = UnitRemoveItemFromSlot(whichHero, itemSlot-1)
 return bj_lastRemovedItem
endfunction


function CreateItemLoc takes integer itemId, location loc returns item
 set bj_lastCreatedItem = CreateItem(itemId, GetLocationX(loc), GetLocationY(loc))
 return bj_lastCreatedItem
endfunction


function GetLastCreatedItem takes nothing returns item
 return bj_lastCreatedItem
endfunction


function GetLastRemovedItem takes nothing returns item
 return bj_lastRemovedItem
endfunction


function SetItemPositionLoc takes item whichItem, location loc returns nothing
 call SetItemPosition(whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction


function GetLearnedSkillBJ takes nothing returns integer
 return GetLearnedSkill()
endfunction


function SuspendHeroXPBJ takes boolean flag, unit whichHero returns nothing
 call SuspendHeroXP(whichHero, not flag)
endfunction


function SetPlayerHandicapXPBJ takes player whichPlayer, real handicapPercent returns nothing
 call SetPlayerHandicapXP(whichPlayer, handicapPercent * 0.01)
endfunction


function GetPlayerHandicapXPBJ takes player whichPlayer returns real
 return GetPlayerHandicapXP(whichPlayer) * 100
endfunction


function SetPlayerHandicapBJ takes player whichPlayer, real handicapPercent returns nothing
 call SetPlayerHandicap(whichPlayer, handicapPercent * 0.01)
endfunction


function GetPlayerHandicapBJ takes player whichPlayer returns real
 return GetPlayerHandicap(whichPlayer) * 100
endfunction


function GetHeroStatBJ takes integer whichStat, unit whichHero, boolean includeBonuses returns integer
 if (whichStat == bj_HEROSTAT_STR) then
 return GetHeroStr(whichHero, includeBonuses)
 elseif (whichStat == bj_HEROSTAT_AGI) then
 return GetHeroAgi(whichHero, includeBonuses)
 elseif (whichStat == bj_HEROSTAT_INT) then
 return GetHeroInt(whichHero, includeBonuses)
 else
 
 return 0
 endif
endfunction


function SetHeroStat takes unit whichHero, integer whichStat, integer value returns nothing
 
 if (value <= 0) then
 return
 endif

 if (whichStat == bj_HEROSTAT_STR) then
 call SetHeroStr(whichHero, value, true)
 elseif (whichStat == bj_HEROSTAT_AGI) then
 call SetHeroAgi(whichHero, value, true)
 elseif (whichStat == bj_HEROSTAT_INT) then
 call SetHeroInt(whichHero, value, true)
 else
 
 endif
endfunction


function ModifyHeroStat takes integer whichStat, unit whichHero, integer modifyMethod, integer value returns nothing
 if (modifyMethod == bj_MODIFYMETHOD_ADD) then
 call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) + value)
 elseif (modifyMethod == bj_MODIFYMETHOD_SUB) then
 call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) - value)
 elseif (modifyMethod == bj_MODIFYMETHOD_SET) then
 call SetHeroStat(whichHero, whichStat, value)
 else
 
 endif
endfunction


function ModifyHeroSkillPoints takes unit whichHero, integer modifyMethod, integer value returns boolean
 if (modifyMethod == bj_MODIFYMETHOD_ADD) then
 return UnitModifySkillPoints(whichHero, value)
 elseif (modifyMethod == bj_MODIFYMETHOD_SUB) then
 return UnitModifySkillPoints(whichHero, -value)
 elseif (modifyMethod == bj_MODIFYMETHOD_SET) then
 return UnitModifySkillPoints(whichHero, value - GetHeroSkillPoints(whichHero))
 else
 
 return false
 endif
endfunction


function UnitDropItemPointBJ takes unit whichUnit, item whichItem, real x, real y returns boolean
 return UnitDropItemPoint(whichUnit, whichItem, x, y)
endfunction


function UnitDropItemPointLoc takes unit whichUnit, item whichItem, location loc returns boolean
 return UnitDropItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction


function UnitDropItemSlotBJ takes unit whichUnit, item whichItem, integer slot returns boolean
 return UnitDropItemSlot(whichUnit, whichItem, slot-1)
endfunction


function UnitDropItemTargetBJ takes unit whichUnit, item whichItem, widget target returns boolean
 return UnitDropItemTarget(whichUnit, whichItem, target)
endfunction





function UnitUseItemDestructable takes unit whichUnit, item whichItem, widget target returns boolean
 return UnitUseItemTarget(whichUnit, whichItem, target)
endfunction


function UnitUseItemPointLoc takes unit whichUnit, item whichItem, location loc returns boolean
 return UnitUseItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction




function UnitItemInSlotBJ takes unit whichUnit, integer itemSlot returns item
 return UnitItemInSlot(whichUnit, itemSlot-1)
endfunction




function GetInventoryIndexOfItemTypeBJ takes unit whichUnit, integer itemId returns integer
 local integer index
 local item indexItem

 set index = 0
 loop
 set indexItem = UnitItemInSlot(whichUnit, index)
 if (indexItem != null) and (GetItemTypeId(indexItem) == itemId) then
 return index + 1
 endif

 set index = index + 1
 exitwhen index >= bj_MAX_INVENTORY
 endloop
 return 0
endfunction


function GetItemOfTypeFromUnitBJ takes unit whichUnit, integer itemId returns item
 local integer index = GetInventoryIndexOfItemTypeBJ(whichUnit, itemId)

 if (index == 0) then
 return null
 else
 return UnitItemInSlot(whichUnit, index - 1)
 endif
endfunction


function UnitHasItemOfTypeBJ takes unit whichUnit, integer itemId returns boolean
 return GetInventoryIndexOfItemTypeBJ(whichUnit, itemId) > 0
endfunction


function UnitInventoryCount takes unit whichUnit returns integer
 local integer index = 0
 local integer count = 0

 loop
 if (UnitItemInSlot(whichUnit, index) != null) then
 set count = count + 1
 endif

 set index = index + 1
 exitwhen index >= bj_MAX_INVENTORY
 endloop

 return count
endfunction


function UnitInventorySizeBJ takes unit whichUnit returns integer
 return UnitInventorySize(whichUnit)
endfunction


function SetItemInvulnerableBJ takes item whichItem, boolean flag returns nothing
 call SetItemInvulnerable(whichItem, flag)
endfunction


function SetItemDropOnDeathBJ takes item whichItem, boolean flag returns nothing
 call SetItemDropOnDeath(whichItem, flag)
endfunction


function SetItemDroppableBJ takes item whichItem, boolean flag returns nothing
 call SetItemDroppable(whichItem, flag)
endfunction


function SetItemPlayerBJ takes item whichItem, player whichPlayer, boolean changeColor returns nothing
 call SetItemPlayer(whichItem, whichPlayer, changeColor)
endfunction


function SetItemVisibleBJ takes boolean show, item whichItem returns nothing
 call SetItemVisible(whichItem, show)
endfunction


function IsItemHiddenBJ takes item whichItem returns boolean
 return not IsItemVisible(whichItem)
endfunction


function ChooseRandomItemBJ takes integer level returns integer
 return ChooseRandomItem(level)
endfunction


function ChooseRandomItemExBJ takes integer level, itemtype whichType returns integer
 return ChooseRandomItemEx(whichType, level)
endfunction


function ChooseRandomNPBuildingBJ takes nothing returns integer
 return ChooseRandomNPBuilding()
endfunction


function ChooseRandomCreepBJ takes integer level returns integer
 return ChooseRandomCreep(level)
endfunction


function EnumItemsInRectBJ takes rect r, code actionFunc returns nothing
 call EnumItemsInRect(r, null, actionFunc)
endfunction




function RandomItemInRectBJEnum takes nothing returns nothing
 set bj_itemRandomConsidered = bj_itemRandomConsidered + 1
 if (GetRandomInt(1, bj_itemRandomConsidered) == 1) then
 set bj_itemRandomCurrentPick = GetEnumItem()
 endif
endfunction




function RandomItemInRectBJ takes rect r, boolexpr filter returns item
 set bj_itemRandomConsidered = 0
 set bj_itemRandomCurrentPick = null
 call EnumItemsInRect(r, filter, function RandomItemInRectBJEnum)
 call DestroyBoolExpr(filter)
 return bj_itemRandomCurrentPick
endfunction




function RandomItemInRectSimpleBJ takes rect r returns item
 return RandomItemInRectBJ(r, null)
endfunction


function CheckItemStatus takes item whichItem, integer status returns boolean
 if (status == bj_ITEM_STATUS_HIDDEN) then
 return not IsItemVisible(whichItem)
 elseif (status == bj_ITEM_STATUS_OWNED) then
 return IsItemOwned(whichItem)
 elseif (status == bj_ITEM_STATUS_INVULNERABLE) then
 return IsItemInvulnerable(whichItem)
 elseif (status == bj_ITEM_STATUS_POWERUP) then
 return IsItemPowerup(whichItem)
 elseif (status == bj_ITEM_STATUS_SELLABLE) then
 return IsItemSellable(whichItem)
 elseif (status == bj_ITEM_STATUS_PAWNABLE) then
 return IsItemPawnable(whichItem)
 else
 
 return false
 endif
endfunction


function CheckItemcodeStatus takes integer itemId, integer status returns boolean
 if (status == bj_ITEMCODE_STATUS_POWERUP) then
 return IsItemIdPowerup(itemId)
 elseif (status == bj_ITEMCODE_STATUS_SELLABLE) then
 return IsItemIdSellable(itemId)
 elseif (status == bj_ITEMCODE_STATUS_PAWNABLE) then
 return IsItemIdPawnable(itemId)
 else
 
 return false
 endif
endfunction







function UnitId2OrderIdBJ takes integer unitId returns integer
 return unitId
endfunction


function String2UnitIdBJ takes string unitIdString returns integer
 return UnitId(unitIdString)
endfunction


function UnitId2StringBJ takes integer unitId returns string
 local string unitString = UnitId2String(unitId)

 if (unitString != null) then
 return unitString
 endif

 
 return ""
endfunction


function String2OrderIdBJ takes string orderIdString returns integer
 local integer orderId
 
 set orderId = OrderId(orderIdString)
 if (orderId != 0) then
 return orderId
 endif

 
 set orderId = UnitId(orderIdString)
 if (orderId != 0) then
 return orderId
 endif

 
 return 0
endfunction


function OrderId2StringBJ takes integer orderId returns string
 local string orderString

 
 set orderString = OrderId2String(orderId)
 if (orderString != null) then
 return orderString
 endif

 
 set orderString = UnitId2String(orderId)
 if (orderString != null) then
 return orderString
 endif

 
 return ""
endfunction


function GetIssuedOrderIdBJ takes nothing returns integer
 return GetIssuedOrderId()
endfunction


function GetKillingUnitBJ takes nothing returns unit
 return GetKillingUnit()
endfunction


function CreateUnitAtLocSaveLast takes player id, integer unitid, location loc, real face returns unit
 if (unitid == 'ugol') then
 set bj_lastCreatedUnit = CreateBlightedGoldmine(id, GetLocationX(loc), GetLocationY(loc), face)
 else
 set bj_lastCreatedUnit = CreateUnitAtLoc(id, unitid, loc, face)
 endif

 return bj_lastCreatedUnit
endfunction


function GetLastCreatedUnit takes nothing returns unit
 return bj_lastCreatedUnit
endfunction


function CreateNUnitsAtLoc takes integer count, integer unitId, player whichPlayer, location loc, real face returns group
 call GroupClear(bj_lastCreatedGroup)
 loop
 set count = count - 1
 exitwhen count < 0
 call CreateUnitAtLocSaveLast(whichPlayer, unitId, loc, face)
 call GroupAddUnit(bj_lastCreatedGroup, bj_lastCreatedUnit)
 endloop
 return bj_lastCreatedGroup
endfunction


function CreateNUnitsAtLocFacingLocBJ takes integer count, integer unitId, player whichPlayer, location loc, location lookAt returns group
 return CreateNUnitsAtLoc(count, unitId, whichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction


function GetLastCreatedGroupEnum takes nothing returns nothing
 call GroupAddUnit(bj_groupLastCreatedDest, GetEnumUnit())
endfunction


function GetLastCreatedGroup takes nothing returns group
 set bj_groupLastCreatedDest = CreateGroup()
 call ForGroup(bj_lastCreatedGroup, function GetLastCreatedGroupEnum)
 return bj_groupLastCreatedDest
endfunction


function CreateCorpseLocBJ takes integer unitid, player whichPlayer, location loc returns unit
 set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), GetRandomReal(0, 360))
 return bj_lastCreatedUnit
endfunction


function UnitSuspendDecayBJ takes boolean suspend, unit whichUnit returns nothing
 call UnitSuspendDecay(whichUnit, suspend)
endfunction


function DelayedSuspendDecayStopAnimEnum takes nothing returns nothing
 local unit enumUnit = GetEnumUnit()

 if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
 call SetUnitTimeScale(enumUnit, 0.0001)
 endif
endfunction


function DelayedSuspendDecayBoneEnum takes nothing returns nothing
 local unit enumUnit = GetEnumUnit()

 if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
 call UnitSuspendDecay(enumUnit, true)
 call SetUnitTimeScale(enumUnit, 0.0001)
 endif
endfunction






function DelayedSuspendDecayFleshEnum takes nothing returns nothing
 local unit enumUnit = GetEnumUnit()

 if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
 call UnitSuspendDecay(enumUnit, true)
 call SetUnitTimeScale(enumUnit, 10.0)
 call SetUnitAnimation(enumUnit, "decay flesh")
 endif
endfunction





function DelayedSuspendDecay takes nothing returns nothing
 local group boneGroup
 local group fleshGroup

 
 
 
 set boneGroup = bj_suspendDecayBoneGroup
 set fleshGroup = bj_suspendDecayFleshGroup
 set bj_suspendDecayBoneGroup = CreateGroup()
 set bj_suspendDecayFleshGroup = CreateGroup()

 call ForGroup(fleshGroup, function DelayedSuspendDecayStopAnimEnum)
 call ForGroup(boneGroup, function DelayedSuspendDecayStopAnimEnum)

 call TriggerSleepAction(bj_CORPSE_MAX_DEATH_TIME)
 call ForGroup(fleshGroup, function DelayedSuspendDecayFleshEnum)
 call ForGroup(boneGroup, function DelayedSuspendDecayBoneEnum)

 call TriggerSleepAction(0.05)
 call ForGroup(fleshGroup, function DelayedSuspendDecayStopAnimEnum)

 call DestroyGroup(boneGroup)
 call DestroyGroup(fleshGroup)
endfunction


function DelayedSuspendDecayCreate takes nothing returns nothing
 set bj_delayedSuspendDecayTrig = CreateTrigger()
 call TriggerRegisterTimerExpireEvent(bj_delayedSuspendDecayTrig, bj_delayedSuspendDecayTimer)
 call TriggerAddAction(bj_delayedSuspendDecayTrig, function DelayedSuspendDecay)
endfunction


function CreatePermanentCorpseLocBJ takes integer style, integer unitid, player whichPlayer, location loc, real facing returns unit
 set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), facing)
 call SetUnitBlendTime(bj_lastCreatedUnit, 0)

 if (style == bj_CORPSETYPE_FLESH) then
 call SetUnitAnimation(bj_lastCreatedUnit, "decay flesh")
 call GroupAddUnit(bj_suspendDecayFleshGroup, bj_lastCreatedUnit)
 elseif (style == bj_CORPSETYPE_BONE) then
 call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
 call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
 else
 
 call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
 call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
 endif

 call TimerStart(bj_delayedSuspendDecayTimer, 0.05, false, null)
 return bj_lastCreatedUnit
endfunction


function GetUnitStateSwap takes unitstate whichState, unit whichUnit returns real
 return GetUnitState(whichUnit, whichState)
endfunction


function GetUnitStatePercent takes unit whichUnit, unitstate whichState, unitstate whichMaxState returns real
 local real value = GetUnitState(whichUnit, whichState)
 local real maxValue = GetUnitState(whichUnit, whichMaxState)

 
 if (whichUnit == null) or (maxValue == 0) then
 return 0.0
 endif

 return value / maxValue * 100.0
endfunction


function GetUnitLifePercent takes unit whichUnit returns real
 return GetUnitStatePercent(whichUnit, UNIT_STATE_LIFE, UNIT_STATE_MAX_LIFE)
endfunction


function GetUnitManaPercent takes unit whichUnit returns real
 return GetUnitStatePercent(whichUnit, UNIT_STATE_MANA, UNIT_STATE_MAX_MANA)
endfunction


function SelectUnitSingle takes unit whichUnit returns nothing
 call ClearSelection()
 call SelectUnit(whichUnit, true)
endfunction


function SelectGroupBJEnum takes nothing returns nothing
 call SelectUnit( GetEnumUnit(), true )
endfunction


function SelectGroupBJ takes group g returns nothing
 call ClearSelection()
 call ForGroup( g, function SelectGroupBJEnum )
endfunction


function SelectUnitAdd takes unit whichUnit returns nothing
 call SelectUnit(whichUnit, true)
endfunction


function SelectUnitRemove takes unit whichUnit returns nothing
 call SelectUnit(whichUnit, false)
endfunction


function ClearSelectionForPlayer takes player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ClearSelection()
 endif
endfunction


function SelectUnitForPlayerSingle takes unit whichUnit, player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ClearSelection()
 call SelectUnit(whichUnit, true)
 endif
endfunction


function SelectGroupForPlayerBJ takes group g, player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ClearSelection()
 call ForGroup( g, function SelectGroupBJEnum )
 endif
endfunction


function SelectUnitAddForPlayer takes unit whichUnit, player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SelectUnit(whichUnit, true)
 endif
endfunction


function SelectUnitRemoveForPlayer takes unit whichUnit, player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call SelectUnit(whichUnit, false)
 endif
endfunction


function SetUnitLifeBJ takes unit whichUnit, real newValue returns nothing
 call SetUnitState(whichUnit, UNIT_STATE_LIFE, RMaxBJ(0,newValue))
endfunction


function SetUnitManaBJ takes unit whichUnit, real newValue returns nothing
 call SetUnitState(whichUnit, UNIT_STATE_MANA, RMaxBJ(0,newValue))
endfunction


function SetUnitLifePercentBJ takes unit whichUnit, real percent returns nothing
 call SetUnitState(whichUnit, UNIT_STATE_LIFE, GetUnitState(whichUnit, UNIT_STATE_MAX_LIFE) * RMaxBJ(0,percent) * 0.01)
endfunction


function SetUnitManaPercentBJ takes unit whichUnit, real percent returns nothing
 call SetUnitState(whichUnit, UNIT_STATE_MANA, GetUnitState(whichUnit, UNIT_STATE_MAX_MANA) * RMaxBJ(0,percent) * 0.01)
endfunction


function IsUnitDeadBJ takes unit whichUnit returns boolean
 return GetUnitState(whichUnit, UNIT_STATE_LIFE) <= 0
endfunction


function IsUnitAliveBJ takes unit whichUnit returns boolean
 return not IsUnitDeadBJ(whichUnit)
endfunction


function IsUnitGroupDeadBJEnum takes nothing returns nothing
 if not IsUnitDeadBJ(GetEnumUnit()) then
 set bj_isUnitGroupDeadResult = false
 endif
endfunction




function IsUnitGroupDeadBJ takes group g returns boolean
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_isUnitGroupDeadResult = true
 call ForGroup(g, function IsUnitGroupDeadBJEnum)

 
 if (wantDestroy) then
 call DestroyGroup(g)
 endif
 return bj_isUnitGroupDeadResult
endfunction


function IsUnitGroupEmptyBJEnum takes nothing returns nothing
 set bj_isUnitGroupEmptyResult = false
endfunction




function IsUnitGroupEmptyBJ takes group g returns boolean
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_isUnitGroupEmptyResult = true
 call ForGroup(g, function IsUnitGroupEmptyBJEnum)

 
 if (wantDestroy) then
 call DestroyGroup(g)
 endif
 return bj_isUnitGroupEmptyResult
endfunction


function IsUnitGroupInRectBJEnum takes nothing returns nothing
 if not RectContainsUnit(bj_isUnitGroupInRectRect, GetEnumUnit()) then
 set bj_isUnitGroupInRectResult = false
 endif
endfunction




function IsUnitGroupInRectBJ takes group g, rect r returns boolean
 set bj_isUnitGroupInRectResult = true
 set bj_isUnitGroupInRectRect = r
 call ForGroup(g, function IsUnitGroupInRectBJEnum)
 return bj_isUnitGroupInRectResult
endfunction


function IsUnitHiddenBJ takes unit whichUnit returns boolean
 return IsUnitHidden(whichUnit)
endfunction


function ShowUnitHide takes unit whichUnit returns nothing
 call ShowUnit(whichUnit, false)
endfunction


function ShowUnitShow takes unit whichUnit returns nothing
 
 if (IsUnitType(whichUnit, UNIT_TYPE_HERO) and IsUnitDeadBJ(whichUnit)) then
 return
 endif

 call ShowUnit(whichUnit, true)
endfunction


function IssueHauntOrderAtLocBJFilter takes nothing returns boolean
 return GetUnitTypeId(GetFilterUnit()) == 'ngol'
endfunction


function IssueHauntOrderAtLocBJ takes unit whichPeon, location loc returns boolean
 local group g = null
 local unit goldMine = null

 
 set g = CreateGroup()
 call GroupEnumUnitsInRangeOfLoc(g, loc, 2*bj_CELLWIDTH, filterIssueHauntOrderAtLocBJ)
 set goldMine = FirstOfGroup(g)
 call DestroyGroup(g)

 
 if (goldMine == null) then
 return false
 endif

 
 return IssueTargetOrderById(whichPeon, 'ugol', goldMine)
endfunction


function IssueBuildOrderByIdLocBJ takes unit whichPeon, integer unitId, location loc returns boolean
 if (unitId == 'ugol') then
 return IssueHauntOrderAtLocBJ(whichPeon, loc)
 else
 return IssueBuildOrderById(whichPeon, unitId, GetLocationX(loc), GetLocationY(loc))
 endif
endfunction


function IssueTrainOrderByIdBJ takes unit whichUnit, integer unitId returns boolean
 return IssueImmediateOrderById(whichUnit, unitId)
endfunction


function GroupTrainOrderByIdBJ takes group g, integer unitId returns boolean
 return GroupImmediateOrderById(g, unitId)
endfunction


function IssueUpgradeOrderByIdBJ takes unit whichUnit, integer techId returns boolean
 return IssueImmediateOrderById(whichUnit, techId)
endfunction


function GetAttackedUnitBJ takes nothing returns unit
 return GetTriggerUnit()
endfunction


function SetUnitFlyHeightBJ takes unit whichUnit, real newHeight, real rate returns nothing
 call SetUnitFlyHeight(whichUnit, newHeight, rate)
endfunction


function SetUnitTurnSpeedBJ takes unit whichUnit, real turnSpeed returns nothing
 call SetUnitTurnSpeed(whichUnit, turnSpeed)
endfunction


function SetUnitPropWindowBJ takes unit whichUnit, real propWindow returns nothing
 local real angle = propWindow
 if (angle <= 0) then
 set angle = 1
 elseif (angle >= 360) then
 set angle = 359
 endif
 set angle = angle * bj_DEGTORAD

 call SetUnitPropWindow(whichUnit, angle)
endfunction


function GetUnitPropWindowBJ takes unit whichUnit returns real
 return GetUnitPropWindow(whichUnit) * bj_RADTODEG
endfunction


function GetUnitDefaultPropWindowBJ takes unit whichUnit returns real
 return GetUnitDefaultPropWindow(whichUnit)
endfunction


function SetUnitBlendTimeBJ takes unit whichUnit, real blendTime returns nothing
 call SetUnitBlendTime(whichUnit, blendTime)
endfunction


function SetUnitAcquireRangeBJ takes unit whichUnit, real acquireRange returns nothing
 call SetUnitAcquireRange(whichUnit, acquireRange)
endfunction


function UnitSetCanSleepBJ takes unit whichUnit, boolean canSleep returns nothing
 call UnitAddSleep(whichUnit, canSleep)
endfunction


function UnitCanSleepBJ takes unit whichUnit returns boolean
 return UnitCanSleep(whichUnit)
endfunction


function UnitWakeUpBJ takes unit whichUnit returns nothing
 call UnitWakeUp(whichUnit)
endfunction


function UnitIsSleepingBJ takes unit whichUnit returns boolean
 return UnitIsSleeping(whichUnit)
endfunction


function WakePlayerUnitsEnum takes nothing returns nothing
 call UnitWakeUp(GetEnumUnit())
endfunction


function WakePlayerUnits takes player whichPlayer returns nothing
 local group g = CreateGroup()
 call GroupEnumUnitsOfPlayer(g, whichPlayer, null)
 call ForGroup(g, function WakePlayerUnitsEnum)
 call DestroyGroup(g)
endfunction


function EnableCreepSleepBJ takes boolean enable returns nothing
 call SetPlayerState(Player(PLAYER_NEUTRAL_AGGRESSIVE), PLAYER_STATE_NO_CREEP_SLEEP, IntegerTertiaryOp(enable, 0, 1))

 
 if (not enable) then
 call WakePlayerUnits(Player(PLAYER_NEUTRAL_AGGRESSIVE))
 endif
endfunction


function UnitGenerateAlarms takes unit whichUnit, boolean generate returns boolean
 return UnitIgnoreAlarm(whichUnit, not generate)
endfunction


function DoesUnitGenerateAlarms takes unit whichUnit returns boolean
 return not UnitIgnoreAlarmToggled(whichUnit)
endfunction


function PauseAllUnitsBJEnum takes nothing returns nothing
 call PauseUnit( GetEnumUnit(), bj_pauseAllUnitsFlag )
endfunction



function PauseAllUnitsBJ takes boolean pause returns nothing
 local integer index
 local player indexPlayer
 local group g

 set bj_pauseAllUnitsFlag = pause
 set g = CreateGroup()
 set index = 0
 loop
 set indexPlayer = Player( index )

 
 if (GetPlayerController( indexPlayer ) == MAP_CONTROL_COMPUTER) then
 call PauseCompAI( indexPlayer, pause )
 endif

 
 call GroupEnumUnitsOfPlayer( g, indexPlayer, null )
 call ForGroup( g, function PauseAllUnitsBJEnum )
 call GroupClear( g )

 set index = index + 1
 exitwhen index == bj_MAX_PLAYER_SLOTS
 endloop
 call DestroyGroup(g)
endfunction


function PauseUnitBJ takes boolean pause, unit whichUnit returns nothing
 call PauseUnit(whichUnit, pause)
endfunction


function IsUnitPausedBJ takes unit whichUnit returns boolean
 return IsUnitPaused(whichUnit)
endfunction


function UnitPauseTimedLifeBJ takes boolean flag, unit whichUnit returns nothing
 call UnitPauseTimedLife(whichUnit, flag)
endfunction


function UnitApplyTimedLifeBJ takes real duration, integer buffId, unit whichUnit returns nothing
 call UnitApplyTimedLife(whichUnit, buffId, duration)
endfunction


function UnitShareVisionBJ takes boolean share, unit whichUnit, player whichPlayer returns nothing
 call UnitShareVision(whichUnit, whichPlayer, share)
endfunction


function UnitRemoveBuffsBJ takes integer buffType, unit whichUnit returns nothing
 if (buffType == bj_REMOVEBUFFS_POSITIVE) then
 call UnitRemoveBuffs(whichUnit, true, false)
 elseif (buffType == bj_REMOVEBUFFS_NEGATIVE) then
 call UnitRemoveBuffs(whichUnit, false, true)
 elseif (buffType == bj_REMOVEBUFFS_ALL) then
 call UnitRemoveBuffs(whichUnit, true, true)
 elseif (buffType == bj_REMOVEBUFFS_NONTLIFE) then
 call UnitRemoveBuffsEx(whichUnit, true, true, false, false, false, true, false)
 else
 
 endif
endfunction


function UnitRemoveBuffsExBJ takes integer polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returns nothing
 local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_POSITIVE)
 local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_NEGATIVE)
 local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_MAGIC)
 local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_PHYSICAL)

 call UnitRemoveBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction


function UnitCountBuffsExBJ takes integer polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returns integer
 local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_POSITIVE)
 local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_NEGATIVE)
 local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_MAGIC)
 local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_PHYSICAL)

 return UnitCountBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction


function UnitRemoveAbilityBJ takes integer abilityId, unit whichUnit returns boolean
 return UnitRemoveAbility(whichUnit, abilityId)
endfunction


function UnitAddAbilityBJ takes integer abilityId, unit whichUnit returns boolean
 return UnitAddAbility(whichUnit, abilityId)
endfunction


function UnitRemoveTypeBJ takes unittype whichType, unit whichUnit returns boolean
 return UnitRemoveType(whichUnit, whichType)
endfunction


function UnitAddTypeBJ takes unittype whichType, unit whichUnit returns boolean
 return UnitAddType(whichUnit, whichType)
endfunction


function UnitMakeAbilityPermanentBJ takes boolean permanent, integer abilityId, unit whichUnit returns boolean
 return UnitMakeAbilityPermanent(whichUnit, permanent, abilityId)
endfunction


function SetUnitExplodedBJ takes unit whichUnit, boolean exploded returns nothing
 call SetUnitExploded(whichUnit, exploded)
endfunction


function ExplodeUnitBJ takes unit whichUnit returns nothing
 call SetUnitExploded(whichUnit, true)
 call KillUnit(whichUnit)
endfunction


function GetTransportUnitBJ takes nothing returns unit
 return GetTransportUnit()
endfunction


function GetLoadedUnitBJ takes nothing returns unit
 return GetLoadedUnit()
endfunction


function IsUnitInTransportBJ takes unit whichUnit, unit whichTransport returns boolean
 return IsUnitInTransport(whichUnit, whichTransport)
endfunction


function IsUnitLoadedBJ takes unit whichUnit returns boolean
 return IsUnitLoaded(whichUnit)
endfunction


function IsUnitIllusionBJ takes unit whichUnit returns boolean
 return IsUnitIllusion(whichUnit)
endfunction





function ReplaceUnitBJ takes unit whichUnit, integer newUnitId, integer unitStateMethod returns unit
 local unit oldUnit = whichUnit
 local unit newUnit
 local boolean wasHidden
 local integer index
 local item indexItem
 local real oldRatio

 
 if (oldUnit == null) then
 set bj_lastReplacedUnit = oldUnit
 return oldUnit
 endif

 
 set wasHidden = IsUnitHidden(oldUnit)
 call ShowUnit(oldUnit, false)

 
 if (newUnitId == 'ugol') then
 set newUnit = CreateBlightedGoldmine(GetOwningPlayer(oldUnit), GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
 else
 set newUnit = CreateUnit(GetOwningPlayer(oldUnit), newUnitId, GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
 endif

 
 if (unitStateMethod == bj_UNIT_STATE_METHOD_RELATIVE) then
 
 
 if (GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE) > 0) then
 set oldRatio = GetUnitState(oldUnit, UNIT_STATE_LIFE) / GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE)
 call SetUnitState(newUnit, UNIT_STATE_LIFE, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_LIFE))
 endif

 if (GetUnitState(oldUnit, UNIT_STATE_MAX_MANA) > 0) and (GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
 set oldRatio = GetUnitState(oldUnit, UNIT_STATE_MANA) / GetUnitState(oldUnit, UNIT_STATE_MAX_MANA)
 call SetUnitState(newUnit, UNIT_STATE_MANA, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_MANA))
 endif
 elseif (unitStateMethod == bj_UNIT_STATE_METHOD_ABSOLUTE) then
 
 
 call SetUnitState(newUnit, UNIT_STATE_LIFE, GetUnitState(oldUnit, UNIT_STATE_LIFE))
 if (GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
 call SetUnitState(newUnit, UNIT_STATE_MANA, GetUnitState(oldUnit, UNIT_STATE_MANA))
 endif
 elseif (unitStateMethod == bj_UNIT_STATE_METHOD_DEFAULTS) then
 
 elseif (unitStateMethod == bj_UNIT_STATE_METHOD_MAXIMUM) then
 
 call SetUnitState(newUnit, UNIT_STATE_LIFE, GetUnitState(newUnit, UNIT_STATE_MAX_LIFE))
 call SetUnitState(newUnit, UNIT_STATE_MANA, GetUnitState(newUnit, UNIT_STATE_MAX_MANA))
 else
 
 endif

 
 
 call SetResourceAmount(newUnit, GetResourceAmount(oldUnit))

 
 if (IsUnitType(oldUnit, UNIT_TYPE_HERO) and IsUnitType(newUnit, UNIT_TYPE_HERO)) then
 call SetHeroXP(newUnit, GetHeroXP(oldUnit), false)

 set index = 0
 loop
 set indexItem = UnitItemInSlot(oldUnit, index)
 if (indexItem != null) then
 call UnitRemoveItem(oldUnit, indexItem)
 call UnitAddItem(newUnit, indexItem)
 endif

 set index = index + 1
 exitwhen index >= bj_MAX_INVENTORY
 endloop
 endif

 
 
 if wasHidden then
 call KillUnit(oldUnit)
 call RemoveUnit(oldUnit)
 else
 call RemoveUnit(oldUnit)
 endif

 set bj_lastReplacedUnit = newUnit
 return newUnit
endfunction


function GetLastReplacedUnitBJ takes nothing returns unit
 return bj_lastReplacedUnit
endfunction


function SetUnitPositionLocFacingBJ takes unit whichUnit, location loc, real facing returns nothing
 call SetUnitPositionLoc(whichUnit, loc)
 call SetUnitFacing(whichUnit, facing)
endfunction


function SetUnitPositionLocFacingLocBJ takes unit whichUnit, location loc, location lookAt returns nothing
 call SetUnitPositionLoc(whichUnit, loc)
 call SetUnitFacing(whichUnit, AngleBetweenPoints(loc, lookAt))
endfunction


function AddItemToStockBJ takes integer itemId, unit whichUnit, integer currentStock, integer stockMax returns nothing
 call AddItemToStock(whichUnit, itemId, currentStock, stockMax)
endfunction


function AddUnitToStockBJ takes integer unitId, unit whichUnit, integer currentStock, integer stockMax returns nothing
 call AddUnitToStock(whichUnit, unitId, currentStock, stockMax)
endfunction


function RemoveItemFromStockBJ takes integer itemId, unit whichUnit returns nothing
 call RemoveItemFromStock(whichUnit, itemId)
endfunction


function RemoveUnitFromStockBJ takes integer unitId, unit whichUnit returns nothing
 call RemoveUnitFromStock(whichUnit, unitId)
endfunction


function SetUnitUseFoodBJ takes boolean enable, unit whichUnit returns nothing
 call SetUnitUseFood(whichUnit, enable)
endfunction


function UnitDamagePointLoc takes unit whichUnit, real delay, real radius, location loc, real amount, attacktype whichAttack, damagetype whichDamage returns boolean
 return UnitDamagePoint(whichUnit, delay, radius, GetLocationX(loc), GetLocationY(loc), amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction


function UnitDamageTargetBJ takes unit whichUnit, unit target, real amount, attacktype whichAttack, damagetype whichDamage returns boolean
 return UnitDamageTarget(whichUnit, target, amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction







function CreateDestructableLoc takes integer objectid, location loc, real facing, real scale, integer variation returns destructable
 set bj_lastCreatedDestructable = CreateDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
 return bj_lastCreatedDestructable
endfunction


function CreateDeadDestructableLocBJ takes integer objectid, location loc, real facing, real scale, integer variation returns destructable
 set bj_lastCreatedDestructable = CreateDeadDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
 return bj_lastCreatedDestructable
endfunction


function GetLastCreatedDestructable takes nothing returns destructable
 return bj_lastCreatedDestructable
endfunction


function ShowDestructableBJ takes boolean flag, destructable d returns nothing
 call ShowDestructable(d, flag)
endfunction


function SetDestructableInvulnerableBJ takes destructable d, boolean flag returns nothing
 call SetDestructableInvulnerable(d, flag)
endfunction


function IsDestructableInvulnerableBJ takes destructable d returns boolean
 return IsDestructableInvulnerable(d)
endfunction


function GetDestructableLoc takes destructable whichDestructable returns location
 return Location(GetDestructableX(whichDestructable), GetDestructableY(whichDestructable))
endfunction


function EnumDestructablesInRectAll takes rect r, code actionFunc returns nothing
 call EnumDestructablesInRect(r, null, actionFunc)
endfunction


function EnumDestructablesInCircleBJFilter takes nothing returns boolean
 local location destLoc = GetDestructableLoc(GetFilterDestructable())
 local boolean result

 set result = DistanceBetweenPoints(destLoc, bj_enumDestructableCenter) <= bj_enumDestructableRadius
 call RemoveLocation(destLoc)
 return result
endfunction


function IsDestructableDeadBJ takes destructable d returns boolean
 return GetDestructableLife(d) <= 0
endfunction


function IsDestructableAliveBJ takes destructable d returns boolean
 return not IsDestructableDeadBJ(d)
endfunction




function RandomDestructableInRectBJEnum takes nothing returns nothing
 set bj_destRandomConsidered = bj_destRandomConsidered + 1
 if (GetRandomInt(1,bj_destRandomConsidered) == 1) then
 set bj_destRandomCurrentPick = GetEnumDestructable()
 endif
endfunction




function RandomDestructableInRectBJ takes rect r, boolexpr filter returns destructable
 set bj_destRandomConsidered = 0
 set bj_destRandomCurrentPick = null
 call EnumDestructablesInRect(r, filter, function RandomDestructableInRectBJEnum)
 call DestroyBoolExpr(filter)
 return bj_destRandomCurrentPick
endfunction




function RandomDestructableInRectSimpleBJ takes rect r returns destructable
 return RandomDestructableInRectBJ(r, null)
endfunction





function EnumDestructablesInCircleBJ takes real radius, location loc, code actionFunc returns nothing
 local rect r

 if (radius >= 0) then
 set bj_enumDestructableCenter = loc
 set bj_enumDestructableRadius = radius
 set r = GetRectFromCircleBJ(loc, radius)
 call EnumDestructablesInRect(r, filterEnumDestructablesInCircleBJ, actionFunc)
 call RemoveRect(r)
 endif
endfunction


function SetDestructableLifePercentBJ takes destructable d, real percent returns nothing
 call SetDestructableLife(d, GetDestructableMaxLife(d) * percent * 0.01)
endfunction


function SetDestructableMaxLifeBJ takes destructable d, real max returns nothing
 call SetDestructableMaxLife(d, max)
endfunction


function ModifyGateBJ takes integer gateOperation, destructable d returns nothing
 if (gateOperation == bj_GATEOPERATION_CLOSE) then
 if (GetDestructableLife(d) <= 0) then
 call DestructableRestoreLife(d, GetDestructableMaxLife(d), true)
 endif
 call SetDestructableAnimation(d, "stand")
 elseif (gateOperation == bj_GATEOPERATION_OPEN) then
 if (GetDestructableLife(d) > 0) then
 call KillDestructable(d)
 endif
 call SetDestructableAnimation(d, "death alternate")
 elseif (gateOperation == bj_GATEOPERATION_DESTROY) then
 if (GetDestructableLife(d) > 0) then
 call KillDestructable(d)
 endif
 call SetDestructableAnimation(d, "death")
 else
 
 endif
endfunction




function GetElevatorHeight takes destructable d returns integer
 local integer height

 set height = 1 + R2I(GetDestructableOccluderHeight(d) / bj_CLIFFHEIGHT)
 if (height < 1) or (height > 3) then
 set height = 1
 endif
 return height
endfunction







function ChangeElevatorHeight takes destructable d, integer newHeight returns nothing
 local integer oldHeight

 
 set newHeight = IMaxBJ(1, newHeight)
 set newHeight = IMinBJ(3, newHeight)

 
 set oldHeight = GetElevatorHeight(d)

 
 call SetDestructableOccluderHeight(d, bj_CLIFFHEIGHT*(newHeight-1))

 if (newHeight == 1) then
 if (oldHeight == 2) then
 call SetDestructableAnimation(d, "birth")
 call QueueDestructableAnimation(d, "stand")
 elseif (oldHeight == 3) then
 call SetDestructableAnimation(d, "birth third")
 call QueueDestructableAnimation(d, "stand")
 else
 
 call SetDestructableAnimation(d, "stand")
 endif
 elseif (newHeight == 2) then
 if (oldHeight == 1) then
 call SetDestructableAnimation(d, "death")
 call QueueDestructableAnimation(d, "stand second")
 elseif (oldHeight == 3) then
 call SetDestructableAnimation(d, "birth second")
 call QueueDestructableAnimation(d, "stand second")
 else
 
 call SetDestructableAnimation(d, "stand second")
 endif
 elseif (newHeight == 3) then
 if (oldHeight == 1) then
 call SetDestructableAnimation(d, "death third")
 call QueueDestructableAnimation(d, "stand third")
 elseif (oldHeight == 2) then
 call SetDestructableAnimation(d, "death second")
 call QueueDestructableAnimation(d, "stand third")
 else
 
 call SetDestructableAnimation(d, "stand third")
 endif
 else
 
 endif
endfunction





function NudgeUnitsInRectEnum takes nothing returns nothing
 local unit nudgee = GetEnumUnit()

 call SetUnitPosition(nudgee, GetUnitX(nudgee), GetUnitY(nudgee))
endfunction


function NudgeItemsInRectEnum takes nothing returns nothing
 local item nudgee = GetEnumItem()

 call SetItemPosition(nudgee, GetItemX(nudgee), GetItemY(nudgee))
endfunction






function NudgeObjectsInRect takes rect nudgeArea returns nothing
 local group g

 set g = CreateGroup()
 call GroupEnumUnitsInRect(g, nudgeArea, null)
 call ForGroup(g, function NudgeUnitsInRectEnum)
 call DestroyGroup(g)

 call EnumItemsInRect(nudgeArea, null, function NudgeItemsInRectEnum)
endfunction


function NearbyElevatorExistsEnum takes nothing returns nothing
 local destructable d = GetEnumDestructable()
 local integer dType = GetDestructableTypeId(d)

 if (dType == bj_ELEVATOR_CODE01) or (dType == bj_ELEVATOR_CODE02) then
 set bj_elevatorNeighbor = d
 endif
endfunction


function NearbyElevatorExists takes real x, real y returns boolean
 local real findThreshold = 32
 local rect r

 
 set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
 set bj_elevatorNeighbor = null
 call EnumDestructablesInRect(r, null, function NearbyElevatorExistsEnum)
 call RemoveRect(r)

 return bj_elevatorNeighbor != null
endfunction


function FindElevatorWallBlockerEnum takes nothing returns nothing
 set bj_elevatorWallBlocker = GetEnumDestructable()
endfunction






function ChangeElevatorWallBlocker takes real x, real y, real facing, boolean open returns nothing
 local destructable blocker = null
 local real findThreshold = 32
 local real nudgeLength = 4.25 * bj_CELLWIDTH
 local real nudgeWidth = 1.25 * bj_CELLWIDTH
 local rect r

 
 set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
 set bj_elevatorWallBlocker = null
 call EnumDestructablesInRect(r, null, function FindElevatorWallBlockerEnum)
 call RemoveRect(r)
 set blocker = bj_elevatorWallBlocker

 
 if (blocker == null) then
 set blocker = CreateDeadDestructable(bj_ELEVATOR_BLOCKER_CODE, x, y, facing, 1, 0)
 elseif (GetDestructableTypeId(blocker) != bj_ELEVATOR_BLOCKER_CODE) then
 
 
 
 return
 endif

 if (open) then
 
 if (GetDestructableLife(blocker) > 0) then
 call KillDestructable(blocker)
 endif
 else
 
 if (GetDestructableLife(blocker) <= 0) then
 call DestructableRestoreLife(blocker, GetDestructableMaxLife(blocker), false)
 endif

 
 if (facing == 0) then
 set r = Rect(x - nudgeWidth/2, y - nudgeLength/2, x + nudgeWidth/2, y + nudgeLength/2)
 call NudgeObjectsInRect(r)
 call RemoveRect(r)
 elseif (facing == 90) then
 set r = Rect(x - nudgeLength/2, y - nudgeWidth/2, x + nudgeLength/2, y + nudgeWidth/2)
 call NudgeObjectsInRect(r)
 call RemoveRect(r)
 else
 
 endif
 endif
endfunction


function ChangeElevatorWalls takes boolean open, integer walls, destructable d returns nothing
 local real x = GetDestructableX(d)
 local real y = GetDestructableY(d)
 local real distToBlocker = 192
 local real distToNeighbor = 256

 if (walls == bj_ELEVATOR_WALL_TYPE_ALL) or (walls == bj_ELEVATOR_WALL_TYPE_EAST) then
 if (not NearbyElevatorExists(x + distToNeighbor, y)) then
 call ChangeElevatorWallBlocker(x + distToBlocker, y, 0, open)
 endif
 endif

 if (walls == bj_ELEVATOR_WALL_TYPE_ALL) or (walls == bj_ELEVATOR_WALL_TYPE_NORTH) then
 if (not NearbyElevatorExists(x, y + distToNeighbor)) then
 call ChangeElevatorWallBlocker(x, y + distToBlocker, 90, open)
 endif
 endif

 if (walls == bj_ELEVATOR_WALL_TYPE_ALL) or (walls == bj_ELEVATOR_WALL_TYPE_SOUTH) then
 if (not NearbyElevatorExists(x, y - distToNeighbor)) then
 call ChangeElevatorWallBlocker(x, y - distToBlocker, 90, open)
 endif
 endif

 if (walls == bj_ELEVATOR_WALL_TYPE_ALL) or (walls == bj_ELEVATOR_WALL_TYPE_WEST) then
 if (not NearbyElevatorExists(x - distToNeighbor, y)) then
 call ChangeElevatorWallBlocker(x - distToBlocker, y, 0, open)
 endif
 endif
endfunction







function WaygateActivateBJ takes boolean activate, unit waygate returns nothing
 call WaygateActivate(waygate, activate)
endfunction


function WaygateIsActiveBJ takes unit waygate returns boolean
 return WaygateIsActive(waygate)
endfunction


function WaygateSetDestinationLocBJ takes unit waygate, location loc returns nothing
 call WaygateSetDestination(waygate, GetLocationX(loc), GetLocationY(loc))
endfunction


function WaygateGetDestinationLocBJ takes unit waygate returns location
 return Location(WaygateGetDestinationX(waygate), WaygateGetDestinationY(waygate))
endfunction


function UnitSetUsesAltIconBJ takes boolean flag, unit whichUnit returns nothing
 call UnitSetUsesAltIcon(whichUnit, flag)
endfunction







function ForceUIKeyBJ takes player whichPlayer, string key returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ForceUIKey(key)
 endif
endfunction


function ForceUICancelBJ takes player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call ForceUICancel()
 endif
endfunction







function ForGroupBJ takes group whichGroup, code callback returns nothing
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 call ForGroup(whichGroup, callback)

 
 if (wantDestroy) then
 call DestroyGroup(whichGroup)
 endif
endfunction


function GroupAddUnitSimple takes unit whichUnit, group whichGroup returns nothing
 call GroupAddUnit(whichGroup, whichUnit)
endfunction


function GroupRemoveUnitSimple takes unit whichUnit, group whichGroup returns nothing
 call GroupRemoveUnit(whichGroup, whichUnit)
endfunction


function GroupAddGroupEnum takes nothing returns nothing
 call GroupAddUnit(bj_groupAddGroupDest, GetEnumUnit())
endfunction


function GroupAddGroup takes group sourceGroup, group destGroup returns nothing
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_groupAddGroupDest = destGroup
 call ForGroup(sourceGroup, function GroupAddGroupEnum)

 
 if (wantDestroy) then
 call DestroyGroup(sourceGroup)
 endif
endfunction


function GroupRemoveGroupEnum takes nothing returns nothing
 call GroupRemoveUnit(bj_groupRemoveGroupDest, GetEnumUnit())
endfunction


function GroupRemoveGroup takes group sourceGroup, group destGroup returns nothing
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_groupRemoveGroupDest = destGroup
 call ForGroup(sourceGroup, function GroupRemoveGroupEnum)

 
 if (wantDestroy) then
 call DestroyGroup(sourceGroup)
 endif
endfunction


function ForceAddPlayerSimple takes player whichPlayer, force whichForce returns nothing
 call ForceAddPlayer(whichForce, whichPlayer)
endfunction


function ForceRemovePlayerSimple takes player whichPlayer, force whichForce returns nothing
 call ForceRemovePlayer(whichForce, whichPlayer)
endfunction








function GroupPickRandomUnitEnum takes nothing returns nothing
 set bj_groupRandomConsidered = bj_groupRandomConsidered + 1
 if (GetRandomInt(1,bj_groupRandomConsidered) == 1) then
 set bj_groupRandomCurrentPick = GetEnumUnit()
 endif
endfunction




function GroupPickRandomUnit takes group whichGroup returns unit
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_groupRandomConsidered = 0
 set bj_groupRandomCurrentPick = null
 call ForGroup(whichGroup, function GroupPickRandomUnitEnum)

 
 if (wantDestroy) then
 call DestroyGroup(whichGroup)
 endif
 return bj_groupRandomCurrentPick
endfunction




function ForcePickRandomPlayerEnum takes nothing returns nothing
 set bj_forceRandomConsidered = bj_forceRandomConsidered + 1
 if (GetRandomInt(1,bj_forceRandomConsidered) == 1) then
 set bj_forceRandomCurrentPick = GetEnumPlayer()
 endif
endfunction




function ForcePickRandomPlayer takes force whichForce returns player
 set bj_forceRandomConsidered = 0
 set bj_forceRandomCurrentPick = null
 call ForForce(whichForce, function ForcePickRandomPlayerEnum)
 return bj_forceRandomCurrentPick
endfunction


function EnumUnitsSelected takes player whichPlayer, boolexpr enumFilter, code enumAction returns nothing
 local group g = CreateGroup()
 call SyncSelections()
 call GroupEnumUnitsSelected(g, whichPlayer, enumFilter)
 call DestroyBoolExpr(enumFilter)
 call ForGroup(g, enumAction)
 call DestroyGroup(g)
endfunction


function GetUnitsInRectMatching takes rect r, boolexpr filter returns group
 local group g = CreateGroup()
 call GroupEnumUnitsInRect(g, r, filter)
 call DestroyBoolExpr(filter)
 return g
endfunction


function GetUnitsInRectAll takes rect r returns group
 return GetUnitsInRectMatching(r, null)
endfunction


function GetUnitsInRectOfPlayerFilter takes nothing returns boolean
 return GetOwningPlayer(GetFilterUnit()) == bj_groupEnumOwningPlayer
endfunction


function GetUnitsInRectOfPlayer takes rect r, player whichPlayer returns group
 local group g = CreateGroup()
 set bj_groupEnumOwningPlayer = whichPlayer
 call GroupEnumUnitsInRect(g, r, filterGetUnitsInRectOfPlayer)
 return g
endfunction


function GetUnitsInRangeOfLocMatching takes real radius, location whichLocation, boolexpr filter returns group
 local group g = CreateGroup()
 call GroupEnumUnitsInRangeOfLoc(g, whichLocation, radius, filter)
 call DestroyBoolExpr(filter)
 return g
endfunction


function GetUnitsInRangeOfLocAll takes real radius, location whichLocation returns group
 return GetUnitsInRangeOfLocMatching(radius, whichLocation, null)
endfunction


function GetUnitsOfTypeIdAllFilter takes nothing returns boolean
 return GetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction


function GetUnitsOfTypeIdAll takes integer unitid returns group
 local group result = CreateGroup()
 local group g = CreateGroup()
 local integer index

 set index = 0
 loop
 set bj_groupEnumTypeId = unitid
 call GroupClear(g)
 call GroupEnumUnitsOfPlayer(g, Player(index), filterGetUnitsOfTypeIdAll)
 call GroupAddGroup(g, result)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYER_SLOTS
 endloop
 call DestroyGroup(g)

 return result
endfunction


function GetUnitsOfPlayerMatching takes player whichPlayer, boolexpr filter returns group
 local group g = CreateGroup()
 call GroupEnumUnitsOfPlayer(g, whichPlayer, filter)
 call DestroyBoolExpr(filter)
 return g
endfunction


function GetUnitsOfPlayerAll takes player whichPlayer returns group
 return GetUnitsOfPlayerMatching(whichPlayer, null)
endfunction


function GetUnitsOfPlayerAndTypeIdFilter takes nothing returns boolean
 return GetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction


function GetUnitsOfPlayerAndTypeId takes player whichPlayer, integer unitid returns group
 local group g = CreateGroup()
 set bj_groupEnumTypeId = unitid
 call GroupEnumUnitsOfPlayer(g, whichPlayer, filterGetUnitsOfPlayerAndTypeId)
 return g
endfunction


function GetUnitsSelectedAll takes player whichPlayer returns group
 local group g = CreateGroup()
 call SyncSelections()
 call GroupEnumUnitsSelected(g, whichPlayer, null)
 return g
endfunction


function GetForceOfPlayer takes player whichPlayer returns force
 local force f = CreateForce()
 call ForceAddPlayer(f, whichPlayer)
 return f
endfunction


function GetPlayersAll takes nothing returns force
 return bj_FORCE_ALL_PLAYERS
endfunction


function GetPlayersByMapControl takes mapcontrol whichControl returns force
 local force f = CreateForce()
 local integer playerIndex
 local player indexPlayer

 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if GetPlayerController(indexPlayer) == whichControl then
 call ForceAddPlayer(f, indexPlayer)
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYER_SLOTS
 endloop

 return f
endfunction


function GetPlayersAllies takes player whichPlayer returns force
 local force f = CreateForce()
 call ForceEnumAllies(f, whichPlayer, null)
 return f
endfunction


function GetPlayersEnemies takes player whichPlayer returns force
 local force f = CreateForce()
 call ForceEnumEnemies(f, whichPlayer, null)
 return f
endfunction


function GetPlayersMatching takes boolexpr filter returns force
 local force f = CreateForce()
 call ForceEnumPlayers(f, filter)
 call DestroyBoolExpr(filter)
 return f
endfunction


function CountUnitsInGroupEnum takes nothing returns nothing
 set bj_groupCountUnits = bj_groupCountUnits + 1
endfunction


function CountUnitsInGroup takes group g returns integer
 
 
 local boolean wantDestroy = bj_wantDestroyGroup
 set bj_wantDestroyGroup = false

 set bj_groupCountUnits = 0
 call ForGroup(g, function CountUnitsInGroupEnum)

 
 if (wantDestroy) then
 call DestroyGroup(g)
 endif
 return bj_groupCountUnits
endfunction


function CountPlayersInForceEnum takes nothing returns nothing
 set bj_forceCountPlayers = bj_forceCountPlayers + 1
endfunction


function CountPlayersInForceBJ takes force f returns integer
 set bj_forceCountPlayers = 0
 call ForForce(f, function CountPlayersInForceEnum)
 return bj_forceCountPlayers
endfunction


function GetRandomSubGroupEnum takes nothing returns nothing
 if (bj_randomSubGroupWant > 0) then
 if (bj_randomSubGroupWant >= bj_randomSubGroupTotal) or (GetRandomReal(0,1) < bj_randomSubGroupChance) then
 
 call GroupAddUnit(bj_randomSubGroupGroup, GetEnumUnit())
 set bj_randomSubGroupWant = bj_randomSubGroupWant - 1
 endif
 endif
 set bj_randomSubGroupTotal = bj_randomSubGroupTotal - 1
endfunction


function GetRandomSubGroup takes integer count, group sourceGroup returns group
 local group g = CreateGroup()

 set bj_randomSubGroupGroup = g
 set bj_randomSubGroupWant = count
 set bj_randomSubGroupTotal = CountUnitsInGroup(sourceGroup)

 if (bj_randomSubGroupWant <= 0 or bj_randomSubGroupTotal <= 0) then
 return g
 endif

 set bj_randomSubGroupChance = I2R(bj_randomSubGroupWant) / I2R(bj_randomSubGroupTotal)
 call ForGroup(sourceGroup, function GetRandomSubGroupEnum)
 return g
endfunction


function LivingPlayerUnitsOfTypeIdFilter takes nothing returns boolean
 local unit filterUnit = GetFilterUnit()
 return IsUnitAliveBJ(filterUnit) and GetUnitTypeId(filterUnit) == bj_livingPlayerUnitsTypeId
endfunction


function CountLivingPlayerUnitsOfTypeId takes integer unitId, player whichPlayer returns integer
 local group g
 local integer matchedCount

 set g = CreateGroup()
 set bj_livingPlayerUnitsTypeId = unitId
 call GroupEnumUnitsOfPlayer(g, whichPlayer, filterLivingPlayerUnitsOfTypeId)
 set matchedCount = CountUnitsInGroup(g)
 call DestroyGroup(g)

 return matchedCount
endfunction







function ResetUnitAnimation takes unit whichUnit returns nothing
 call SetUnitAnimation(whichUnit, "stand")
endfunction


function SetUnitTimeScalePercent takes unit whichUnit, real percentScale returns nothing
 call SetUnitTimeScale(whichUnit, percentScale * 0.01)
endfunction


function SetUnitScalePercent takes unit whichUnit, real percentScaleX, real percentScaleY, real percentScaleZ returns nothing
 call SetUnitScale(whichUnit, percentScaleX * 0.01, percentScaleY * 0.01, percentScaleZ * 0.01)
endfunction






function SetUnitVertexColorBJ takes unit whichUnit, real red, real green, real blue, real transparency returns nothing
 call SetUnitVertexColor(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function UnitAddIndicatorBJ takes unit whichUnit, real red, real green, real blue, real transparency returns nothing
 call AddIndicator(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function DestructableAddIndicatorBJ takes destructable whichDestructable, real red, real green, real blue, real transparency returns nothing
 call AddIndicator(whichDestructable, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function ItemAddIndicatorBJ takes item whichItem, real red, real green, real blue, real transparency returns nothing
 call AddIndicator(whichItem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction




function SetUnitFacingToFaceLocTimed takes unit whichUnit, location target, real duration returns nothing
 local location unitLoc = GetUnitLoc(whichUnit)

 call SetUnitFacingTimed(whichUnit, AngleBetweenPoints(unitLoc, target), duration)
 call RemoveLocation(unitLoc)
endfunction




function SetUnitFacingToFaceUnitTimed takes unit whichUnit, unit target, real duration returns nothing
 local location unitLoc = GetUnitLoc(target)

 call SetUnitFacingToFaceLocTimed(whichUnit, unitLoc, duration)
 call RemoveLocation(unitLoc)
endfunction


function QueueUnitAnimationBJ takes unit whichUnit, string whichAnimation returns nothing
 call QueueUnitAnimation(whichUnit, whichAnimation)
endfunction


function SetDestructableAnimationBJ takes destructable d, string whichAnimation returns nothing
 call SetDestructableAnimation(d, whichAnimation)
endfunction


function QueueDestructableAnimationBJ takes destructable d, string whichAnimation returns nothing
 call QueueDestructableAnimation(d, whichAnimation)
endfunction


function SetDestAnimationSpeedPercent takes destructable d, real percentScale returns nothing
 call SetDestructableAnimationSpeed(d, percentScale * 0.01)
endfunction







function DialogDisplayBJ takes boolean flag, dialog whichDialog, player whichPlayer returns nothing
 call DialogDisplay(whichPlayer, whichDialog, flag)
endfunction


function DialogSetMessageBJ takes dialog whichDialog, string message returns nothing
 call DialogSetMessage(whichDialog, message)
endfunction


function DialogAddButtonBJ takes dialog whichDialog, string buttonText returns button
 set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText,0)
 return bj_lastCreatedButton
endfunction


function DialogAddButtonWithHotkeyBJ takes dialog whichDialog, string buttonText, integer hotkey returns button
 set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText,hotkey)
 return bj_lastCreatedButton
endfunction


function DialogClearBJ takes dialog whichDialog returns nothing
 call DialogClear(whichDialog)
endfunction


function GetLastCreatedButtonBJ takes nothing returns button
 return bj_lastCreatedButton
endfunction


function GetClickedButtonBJ takes nothing returns button
 return GetClickedButton()
endfunction


function GetClickedDialogBJ takes nothing returns dialog
 return GetClickedDialog()
endfunction







function SetPlayerAllianceBJ takes player sourcePlayer, alliancetype whichAllianceSetting, boolean value, player otherPlayer returns nothing
 
 if (sourcePlayer == otherPlayer) then
 return
 endif

 call SetPlayerAlliance(sourcePlayer, otherPlayer, whichAllianceSetting, value)
endfunction




function SetPlayerAllianceStateAllyBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, flag)
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_REQUEST, flag)
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_RESPONSE, flag)
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_XP, flag)
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_SPELLS, flag)
endfunction




function SetPlayerAllianceStateVisionBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_VISION, flag)
endfunction




function SetPlayerAllianceStateControlBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_CONTROL, flag)
endfunction





function SetPlayerAllianceStateFullControlBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
 call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, flag)
endfunction


function SetPlayerAllianceStateBJ takes player sourcePlayer, player otherPlayer, integer allianceState returns nothing
 
 if (sourcePlayer == otherPlayer) then
 return
 endif

 if allianceState == bj_ALLIANCE_UNALLIED then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 elseif allianceState == bj_ALLIANCE_UNALLIED_VISION then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 elseif allianceState == bj_ALLIANCE_ALLIED then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 elseif allianceState == bj_ALLIANCE_ALLIED_VISION then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 elseif allianceState == bj_ALLIANCE_ALLIED_UNITS then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 elseif allianceState == bj_ALLIANCE_ALLIED_ADVUNITS then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, true )
 elseif allianceState == bj_ALLIANCE_NEUTRAL then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAlliance( sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, true )
 elseif allianceState == bj_ALLIANCE_NEUTRAL_VISION then
 call SetPlayerAllianceStateAllyBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateVisionBJ( sourcePlayer, otherPlayer, true )
 call SetPlayerAllianceStateControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAllianceStateFullControlBJ( sourcePlayer, otherPlayer, false )
 call SetPlayerAlliance( sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, true )
 else
 
 endif
endfunction




function SetForceAllianceStateBJ takes force sourceForce, force targetForce, integer allianceState returns nothing
 local integer sourceIndex
 local integer targetIndex

 set sourceIndex = 0
 loop

 if (sourceForce==bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(sourceIndex), sourceForce)) then
 set targetIndex = 0
 loop
 if (targetForce==bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(targetIndex), targetForce)) then
 call SetPlayerAllianceStateBJ(Player(sourceIndex), Player(targetIndex), allianceState)
 endif

 set targetIndex = targetIndex + 1
 exitwhen targetIndex == bj_MAX_PLAYER_SLOTS
 endloop
 endif

 set sourceIndex = sourceIndex + 1
 exitwhen sourceIndex == bj_MAX_PLAYER_SLOTS
 endloop
endfunction




function PlayersAreCoAllied takes player playerA, player playerB returns boolean
 
 if (playerA == playerB) then
 return true
 endif

 
 if GetPlayerAlliance(playerA, playerB, ALLIANCE_PASSIVE) then
 if GetPlayerAlliance(playerB, playerA, ALLIANCE_PASSIVE) then
 return true
 endif
 endif
 return false
endfunction





function ShareEverythingWithTeamAI takes player whichPlayer returns nothing
 local integer playerIndex
 local player indexPlayer

 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if (PlayersAreCoAllied(whichPlayer, indexPlayer) and whichPlayer != indexPlayer) then
 if (GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_VISION, true)
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_CONTROL, true)
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
 endif
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
endfunction




function ShareEverythingWithTeam takes player whichPlayer returns nothing
 local integer playerIndex
 local player indexPlayer

 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if (PlayersAreCoAllied(whichPlayer, indexPlayer) and whichPlayer != indexPlayer) then
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_VISION, true)
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_CONTROL, true)
 call SetPlayerAlliance(indexPlayer, whichPlayer, ALLIANCE_SHARED_CONTROL, true)
 call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
endfunction





function ConfigureNeutralVictim takes nothing returns nothing
 local integer index
 local player indexPlayer
 local player neutralVictim = Player(bj_PLAYER_NEUTRAL_VICTIM)

 set index = 0
 loop
 set indexPlayer = Player(index)

 call SetPlayerAlliance(neutralVictim, indexPlayer, ALLIANCE_PASSIVE, true)
 call SetPlayerAlliance(indexPlayer, neutralVictim, ALLIANCE_PASSIVE, false)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 
 set indexPlayer = Player(PLAYER_NEUTRAL_AGGRESSIVE)
 call SetPlayerAlliance(neutralVictim, indexPlayer, ALLIANCE_PASSIVE, true)
 call SetPlayerAlliance(indexPlayer, neutralVictim, ALLIANCE_PASSIVE, true)

 
 call SetPlayerState(neutralVictim, PLAYER_STATE_GIVES_BOUNTY, 0)
endfunction


function MakeUnitsPassiveForPlayerEnum takes nothing returns nothing
 call SetUnitOwner(GetEnumUnit(), Player(bj_PLAYER_NEUTRAL_VICTIM), false)
endfunction




function MakeUnitsPassiveForPlayer takes player whichPlayer returns nothing
 local group playerUnits = CreateGroup()
 call CachePlayerHeroData(whichPlayer)
 call GroupEnumUnitsOfPlayer(playerUnits, whichPlayer, null)
 call ForGroup(playerUnits, function MakeUnitsPassiveForPlayerEnum)
 call DestroyGroup(playerUnits)
endfunction




function MakeUnitsPassiveForTeam takes player whichPlayer returns nothing
 local integer playerIndex
 local player indexPlayer

 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if PlayersAreCoAllied(whichPlayer, indexPlayer) then
 call MakeUnitsPassiveForPlayer(indexPlayer)
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
endfunction




function AllowVictoryDefeat takes playergameresult gameResult returns boolean
 if (gameResult == PLAYER_GAME_RESULT_VICTORY) then
 return not IsNoVictoryCheat()
 endif
 if (gameResult == PLAYER_GAME_RESULT_DEFEAT) then
 return not IsNoDefeatCheat()
 endif
 if (gameResult == PLAYER_GAME_RESULT_NEUTRAL) then
 return (not IsNoVictoryCheat()) and (not IsNoDefeatCheat())
 endif
 return true
endfunction


function EndGameBJ takes nothing returns nothing
 call EndGame( true )
endfunction


function MeleeVictoryDialogBJ takes player whichPlayer, boolean leftGame returns nothing
 local trigger t = CreateTrigger()
 local dialog d = DialogCreate()
 local string formatString

 
 if (leftGame) then
 set formatString = GetLocalizedString( "PLAYER_LEFT_GAME" )
 else
 set formatString = GetLocalizedString( "PLAYER_VICTORIOUS" )
 endif

 call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, formatString)

 call DialogSetMessage( d, GetLocalizedString( "GAMEOVER_VICTORY_MSG" ) )
 call DialogAddButton( d, GetLocalizedString( "GAMEOVER_CONTINUE_GAME" ), GetLocalizedHotkey("GAMEOVER_CONTINUE_GAME") )

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddQuitButton( d, true, GetLocalizedString( "GAMEOVER_QUIT_GAME" ), GetLocalizedHotkey("GAMEOVER_QUIT_GAME") ) )

 call DialogDisplay( whichPlayer, d, true )
 call StartSoundForPlayerBJ( whichPlayer, bj_victoryDialogSound )
endfunction


function MeleeDefeatDialogBJ takes player whichPlayer, boolean leftGame returns nothing
 local trigger t = CreateTrigger()
 local dialog d = DialogCreate()
 local string formatString

 
 if (leftGame) then
 set formatString = GetLocalizedString( "PLAYER_LEFT_GAME" )
 else
 set formatString = GetLocalizedString( "PLAYER_DEFEATED" )
 endif

 call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, formatString)

 call DialogSetMessage( d, GetLocalizedString( "GAMEOVER_DEFEAT_MSG" ) )

 
 if (not bj_meleeGameOver and IsMapFlagSet(MAP_OBSERVERS_ON_DEATH)) then
 call DialogAddButton( d, GetLocalizedString( "GAMEOVER_CONTINUE_OBSERVING" ), GetLocalizedHotkey("GAMEOVER_CONTINUE_OBSERVING") )
 endif

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddQuitButton( d, true, GetLocalizedString( "GAMEOVER_QUIT_GAME" ), GetLocalizedHotkey("GAMEOVER_QUIT_GAME") ) )

 call DialogDisplay( whichPlayer, d, true )
 call StartSoundForPlayerBJ( whichPlayer, bj_defeatDialogSound )
endfunction


function GameOverDialogBJ takes player whichPlayer, boolean leftGame returns nothing
 local trigger t = CreateTrigger()
 local dialog d = DialogCreate()
 local string s

 
 call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString( "PLAYER_LEFT_GAME" ))

 if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
 set s = GetLocalizedString( "GAMEOVER_DISCONNECTED" )
 else
 set s = GetLocalizedString( "GAMEOVER_GAME_OVER" )
 endif

 call DialogSetMessage( d, s )

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddQuitButton( d, true, GetLocalizedString( "GAMEOVER_OK" ), GetLocalizedHotkey("GAMEOVER_OK") ) )

 call DialogDisplay( whichPlayer, d, true )
 call StartSoundForPlayerBJ( whichPlayer, bj_defeatDialogSound )
endfunction


function RemovePlayerPreserveUnitsBJ takes player whichPlayer, playergameresult gameResult, boolean leftGame returns nothing
 if AllowVictoryDefeat(gameResult) then

 call RemovePlayer(whichPlayer, gameResult)

 if( gameResult == PLAYER_GAME_RESULT_VICTORY ) then
 call MeleeVictoryDialogBJ( whichPlayer, leftGame )
 return
 elseif( gameResult == PLAYER_GAME_RESULT_DEFEAT ) then
 call MeleeDefeatDialogBJ( whichPlayer, leftGame )
 else
 call GameOverDialogBJ( whichPlayer, leftGame )
 endif

 endif
endfunction


function CustomVictoryOkBJ takes nothing returns nothing
 if bj_isSinglePlayer then
 call PauseGame( false )
 
 call SetGameDifficulty(GetDefaultDifficulty())
 endif

 if (bj_changeLevelMapName == null) then
 call EndGame( bj_changeLevelShowScores )
 else
 call ChangeLevel( bj_changeLevelMapName, bj_changeLevelShowScores )
 endif
endfunction


function CustomVictoryQuitBJ takes nothing returns nothing
 if bj_isSinglePlayer then
 call PauseGame( false )
 
 call SetGameDifficulty(GetDefaultDifficulty())
 endif

 call EndGame( bj_changeLevelShowScores )
endfunction


function CustomVictoryDialogBJ takes player whichPlayer returns nothing
 local trigger t = CreateTrigger()
 local dialog d = DialogCreate()

 call DialogSetMessage( d, GetLocalizedString( "GAMEOVER_VICTORY_MSG" ) )

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_CONTINUE" ), GetLocalizedHotkey("GAMEOVER_CONTINUE") ) )
 call TriggerAddAction( t, function CustomVictoryOkBJ )

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_QUIT_MISSION" ), GetLocalizedHotkey("GAMEOVER_QUIT_MISSION") ) )
 call TriggerAddAction( t, function CustomVictoryQuitBJ )

 if (GetLocalPlayer() == whichPlayer) then
 call EnableUserControl( true )
 if bj_isSinglePlayer then
 call PauseGame( true )
 endif
 call EnableUserUI(false)
 endif

 call DialogDisplay( whichPlayer, d, true )
 call VolumeGroupSetVolumeForPlayerBJ( whichPlayer, SOUND_VOLUMEGROUP_UI, 1.0 )
 call StartSoundForPlayerBJ( whichPlayer, bj_victoryDialogSound )
endfunction


function CustomVictorySkipBJ takes player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 if bj_isSinglePlayer then
 
 call SetGameDifficulty(GetDefaultDifficulty())
 endif

 if (bj_changeLevelMapName == null) then
 call EndGame( bj_changeLevelShowScores )
 else
 call ChangeLevel( bj_changeLevelMapName, bj_changeLevelShowScores )
 endif
 endif
endfunction


function CustomVictoryBJ takes player whichPlayer, boolean showDialog, boolean showScores returns nothing
 if AllowVictoryDefeat( PLAYER_GAME_RESULT_VICTORY ) then
 call RemovePlayer( whichPlayer, PLAYER_GAME_RESULT_VICTORY )

 if not bj_isSinglePlayer then
 call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString( "PLAYER_VICTORIOUS" ) )
 endif

 
 if (GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
 set bj_changeLevelShowScores = showScores
 if showDialog then
 call CustomVictoryDialogBJ( whichPlayer )
 else
 call CustomVictorySkipBJ( whichPlayer )
 endif
 endif
 endif
endfunction


function CustomDefeatRestartBJ takes nothing returns nothing
 call PauseGame( false )
 call RestartGame( true )
endfunction


function CustomDefeatReduceDifficultyBJ takes nothing returns nothing
 local gamedifficulty diff = GetGameDifficulty()

 call PauseGame( false )

 
 if (diff == MAP_DIFFICULTY_EASY) then
 
 elseif (diff == MAP_DIFFICULTY_NORMAL) then
 call SetGameDifficulty(MAP_DIFFICULTY_EASY)
 elseif (diff == MAP_DIFFICULTY_HARD) then
 call SetGameDifficulty(MAP_DIFFICULTY_NORMAL)
 else
 
 endif

 call RestartGame( true )
endfunction


function CustomDefeatLoadBJ takes nothing returns nothing
 call PauseGame( false )
 call DisplayLoadDialog()
endfunction


function CustomDefeatQuitBJ takes nothing returns nothing
 if bj_isSinglePlayer then
 call PauseGame( false )
 endif

 
 call SetGameDifficulty(GetDefaultDifficulty())
 call EndGame( true )
endfunction


function CustomDefeatDialogBJ takes player whichPlayer, string message returns nothing
 local trigger t = CreateTrigger()
 local dialog d = DialogCreate()

 call DialogSetMessage( d, message )

 if bj_isSinglePlayer then
 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_RESTART" ), GetLocalizedHotkey("GAMEOVER_RESTART") ) )
 call TriggerAddAction( t, function CustomDefeatRestartBJ )

 if (GetGameDifficulty() != MAP_DIFFICULTY_EASY) then
 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_REDUCE_DIFFICULTY" ), GetLocalizedHotkey("GAMEOVER_REDUCE_DIFFICULTY") ) )
 call TriggerAddAction( t, function CustomDefeatReduceDifficultyBJ )
 endif

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_LOAD" ), GetLocalizedHotkey("GAMEOVER_LOAD") ) )
 call TriggerAddAction( t, function CustomDefeatLoadBJ )
 endif

 set t = CreateTrigger()
 call TriggerRegisterDialogButtonEvent( t, DialogAddButton( d, GetLocalizedString( "GAMEOVER_QUIT_MISSION" ), GetLocalizedHotkey("GAMEOVER_QUIT_MISSION") ) )
 call TriggerAddAction( t, function CustomDefeatQuitBJ )

 if (GetLocalPlayer() == whichPlayer) then
 call EnableUserControl( true )
 if bj_isSinglePlayer then
 call PauseGame( true )
 endif
 call EnableUserUI(false)
 endif

 call DialogDisplay( whichPlayer, d, true )
 call VolumeGroupSetVolumeForPlayerBJ( whichPlayer, SOUND_VOLUMEGROUP_UI, 1.0 )
 call StartSoundForPlayerBJ( whichPlayer, bj_defeatDialogSound )
endfunction


function CustomDefeatBJ takes player whichPlayer, string message returns nothing
 if AllowVictoryDefeat( PLAYER_GAME_RESULT_DEFEAT ) then
 call RemovePlayer( whichPlayer, PLAYER_GAME_RESULT_DEFEAT )

 if not bj_isSinglePlayer then
 call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString( "PLAYER_DEFEATED" ) )
 endif

 
 if (GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
 call CustomDefeatDialogBJ( whichPlayer, message )
 endif
 endif
endfunction


function SetNextLevelBJ takes string nextLevel returns nothing
 if (nextLevel == "") then
 set bj_changeLevelMapName = null
 else
 set bj_changeLevelMapName = nextLevel
 endif
endfunction


function SetPlayerOnScoreScreenBJ takes boolean flag, player whichPlayer returns nothing
 call SetPlayerOnScoreScreen(whichPlayer, flag)
endfunction







function CreateQuestBJ takes integer questType, string title, string description, string iconPath returns quest
 local boolean required = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or (questType == bj_QUESTTYPE_REQ_UNDISCOVERED)
 local boolean discovered = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or (questType == bj_QUESTTYPE_OPT_DISCOVERED)

 set bj_lastCreatedQuest = CreateQuest()
 call QuestSetTitle(bj_lastCreatedQuest, title)
 call QuestSetDescription(bj_lastCreatedQuest, description)
 call QuestSetIconPath(bj_lastCreatedQuest, iconPath)
 call QuestSetRequired(bj_lastCreatedQuest, required)
 call QuestSetDiscovered(bj_lastCreatedQuest, discovered)
 call QuestSetCompleted(bj_lastCreatedQuest, false)
 return bj_lastCreatedQuest
endfunction


function DestroyQuestBJ takes quest whichQuest returns nothing
 call DestroyQuest(whichQuest)
endfunction


function QuestSetEnabledBJ takes boolean enabled, quest whichQuest returns nothing
 call QuestSetEnabled(whichQuest, enabled)
endfunction


function QuestSetTitleBJ takes quest whichQuest, string title returns nothing
 call QuestSetTitle(whichQuest, title)
endfunction


function QuestSetDescriptionBJ takes quest whichQuest, string description returns nothing
 call QuestSetDescription(whichQuest, description)
endfunction


function QuestSetCompletedBJ takes quest whichQuest, boolean completed returns nothing
 call QuestSetCompleted(whichQuest, completed)
endfunction


function QuestSetFailedBJ takes quest whichQuest, boolean failed returns nothing
 call QuestSetFailed(whichQuest, failed)
endfunction


function QuestSetDiscoveredBJ takes quest whichQuest, boolean discovered returns nothing
 call QuestSetDiscovered(whichQuest, discovered)
endfunction


function GetLastCreatedQuestBJ takes nothing returns quest
 return bj_lastCreatedQuest
endfunction


function CreateQuestItemBJ takes quest whichQuest, string description returns questitem
 set bj_lastCreatedQuestItem = QuestCreateItem(whichQuest)
 call QuestItemSetDescription(bj_lastCreatedQuestItem, description)
 call QuestItemSetCompleted(bj_lastCreatedQuestItem, false)
 return bj_lastCreatedQuestItem
endfunction


function QuestItemSetDescriptionBJ takes questitem whichQuestItem, string description returns nothing
 call QuestItemSetDescription(whichQuestItem, description)
endfunction


function QuestItemSetCompletedBJ takes questitem whichQuestItem, boolean completed returns nothing
 call QuestItemSetCompleted(whichQuestItem, completed)
endfunction


function GetLastCreatedQuestItemBJ takes nothing returns questitem
 return bj_lastCreatedQuestItem
endfunction


function CreateDefeatConditionBJ takes string description returns defeatcondition
 set bj_lastCreatedDefeatCondition = CreateDefeatCondition()
 call DefeatConditionSetDescription(bj_lastCreatedDefeatCondition, description)
 return bj_lastCreatedDefeatCondition
endfunction


function DestroyDefeatConditionBJ takes defeatcondition whichCondition returns nothing
 call DestroyDefeatCondition(whichCondition)
endfunction


function DefeatConditionSetDescriptionBJ takes defeatcondition whichCondition, string description returns nothing
 call DefeatConditionSetDescription(whichCondition, description)
endfunction


function GetLastCreatedDefeatConditionBJ takes nothing returns defeatcondition
 return bj_lastCreatedDefeatCondition
endfunction


function FlashQuestDialogButtonBJ takes nothing returns nothing
 call FlashQuestDialogButton()
endfunction


function QuestMessageBJ takes force f, integer messageType, string message returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), f)) then
 

 if (messageType == bj_QUESTMESSAGE_DISCOVERED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUEST, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUEST, message)
 call StartSound(bj_questDiscoveredSound)
 call FlashQuestDialogButton()

 elseif (messageType == bj_QUESTMESSAGE_UPDATED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTUPDATE, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTUPDATE, message)
 call StartSound(bj_questUpdatedSound)
 call FlashQuestDialogButton()

 elseif (messageType == bj_QUESTMESSAGE_COMPLETED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTDONE, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTDONE, message)
 call StartSound(bj_questCompletedSound)
 call FlashQuestDialogButton()

 elseif (messageType == bj_QUESTMESSAGE_FAILED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTFAILED, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTFAILED, message)
 call StartSound(bj_questFailedSound)
 call FlashQuestDialogButton()

 elseif (messageType == bj_QUESTMESSAGE_REQUIREMENT) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTREQUIREMENT, message)

 elseif (messageType == bj_QUESTMESSAGE_MISSIONFAILED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_MISSIONFAILED, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_MISSIONFAILED, message)
 call StartSound(bj_questFailedSound)

 elseif (messageType == bj_QUESTMESSAGE_HINT) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_HINT, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_HINT, message)
 call StartSound(bj_questHintSound)

 elseif (messageType == bj_QUESTMESSAGE_ALWAYSHINT) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ALWAYSHINT, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ALWAYSHINT, message)
 call StartSound(bj_questHintSound)

 elseif (messageType == bj_QUESTMESSAGE_SECRET) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_SECRET, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_SECRET, message)
 call StartSound(bj_questSecretSound)

 elseif (messageType == bj_QUESTMESSAGE_UNITACQUIRED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITACQUIRED, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITACQUIRED, message)
 call StartSound(bj_questHintSound)

 elseif (messageType == bj_QUESTMESSAGE_UNITAVAILABLE) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITAVAILABLE, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITAVAILABLE, message)
 call StartSound(bj_questHintSound)

 elseif (messageType == bj_QUESTMESSAGE_ITEMACQUIRED) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ITEMACQUIRED, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ITEMACQUIRED, message)
 call StartSound(bj_questItemAcquiredSound)

 elseif (messageType == bj_QUESTMESSAGE_WARNING) then
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_WARNING, " ")
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_WARNING, message)
 call StartSound(bj_questWarningSound)

 else
 
 endif
 endif
endfunction







function StartTimerBJ takes timer t, boolean periodic, real timeout returns timer
 set bj_lastStartedTimer = t
 call TimerStart(t, timeout, periodic, null)
 return bj_lastStartedTimer
endfunction


function CreateTimerBJ takes boolean periodic, real timeout returns timer
 set bj_lastStartedTimer = CreateTimer()
 call TimerStart(bj_lastStartedTimer, timeout, periodic, null)
 return bj_lastStartedTimer
endfunction


function DestroyTimerBJ takes timer whichTimer returns nothing
 call DestroyTimer(whichTimer)
endfunction


function PauseTimerBJ takes boolean pause, timer whichTimer returns nothing
 if pause then
 call PauseTimer(whichTimer)
 else
 call ResumeTimer(whichTimer)
 endif
endfunction


function GetLastCreatedTimerBJ takes nothing returns timer
 return bj_lastStartedTimer
endfunction


function CreateTimerDialogBJ takes timer t, string title returns timerdialog
 set bj_lastCreatedTimerDialog = CreateTimerDialog(t)
 call TimerDialogSetTitle(bj_lastCreatedTimerDialog, title)
 call TimerDialogDisplay(bj_lastCreatedTimerDialog, true)
 return bj_lastCreatedTimerDialog
endfunction


function DestroyTimerDialogBJ takes timerdialog td returns nothing
 call DestroyTimerDialog(td)
endfunction


function TimerDialogSetTitleBJ takes timerdialog td, string title returns nothing
 call TimerDialogSetTitle(td, title)
endfunction


function TimerDialogSetTitleColorBJ takes timerdialog td, real red, real green, real blue, real transparency returns nothing
 call TimerDialogSetTitleColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function TimerDialogSetTimeColorBJ takes timerdialog td, real red, real green, real blue, real transparency returns nothing
 call TimerDialogSetTimeColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function TimerDialogSetSpeedBJ takes timerdialog td, real speedMultFactor returns nothing
 call TimerDialogSetSpeed(td, speedMultFactor)
endfunction


function TimerDialogDisplayForPlayerBJ takes boolean show, timerdialog td, player whichPlayer returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call TimerDialogDisplay(td, show)
 endif
endfunction


function TimerDialogDisplayBJ takes boolean show, timerdialog td returns nothing
 call TimerDialogDisplay(td, show)
endfunction


function GetLastCreatedTimerDialogBJ takes nothing returns timerdialog
 return bj_lastCreatedTimerDialog
endfunction







function LeaderboardResizeBJ takes leaderboard lb returns nothing
 local integer size = LeaderboardGetItemCount(lb)

 if (LeaderboardGetLabelText(lb) == "") then
 set size = size - 1
 endif
 call LeaderboardSetSizeByItemCount(lb, size)
endfunction


function LeaderboardSetPlayerItemValueBJ takes player whichPlayer, leaderboard lb, integer val returns nothing
 call LeaderboardSetItemValue(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction


function LeaderboardSetPlayerItemLabelBJ takes player whichPlayer, leaderboard lb, string val returns nothing
 call LeaderboardSetItemLabel(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction


function LeaderboardSetPlayerItemStyleBJ takes player whichPlayer, leaderboard lb, boolean showLabel, boolean showValue, boolean showIcon returns nothing
 call LeaderboardSetItemStyle(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), showLabel, showValue, showIcon)
endfunction


function LeaderboardSetPlayerItemLabelColorBJ takes player whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returns nothing
 call LeaderboardSetItemLabelColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function LeaderboardSetPlayerItemValueColorBJ takes player whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returns nothing
 call LeaderboardSetItemValueColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function LeaderboardSetLabelColorBJ takes leaderboard lb, real red, real green, real blue, real transparency returns nothing
 call LeaderboardSetLabelColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function LeaderboardSetValueColorBJ takes leaderboard lb, real red, real green, real blue, real transparency returns nothing
 call LeaderboardSetValueColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function LeaderboardSetLabelBJ takes leaderboard lb, string label returns nothing
 call LeaderboardSetLabel(lb, label)
 call LeaderboardResizeBJ(lb)
endfunction


function LeaderboardSetStyleBJ takes leaderboard lb, boolean showLabel, boolean showNames, boolean showValues, boolean showIcons returns nothing
 call LeaderboardSetStyle(lb, showLabel, showNames, showValues, showIcons)
endfunction


function LeaderboardGetItemCountBJ takes leaderboard lb returns integer
 return LeaderboardGetItemCount(lb)
endfunction


function LeaderboardHasPlayerItemBJ takes leaderboard lb, player whichPlayer returns boolean
 return LeaderboardHasPlayerItem(lb, whichPlayer)
endfunction


function ForceSetLeaderboardBJ takes leaderboard lb, force toForce returns nothing
 local integer index
 local player indexPlayer

 set index = 0
 loop
 set indexPlayer = Player(index)
 if IsPlayerInForce(indexPlayer, toForce) then
 call PlayerSetLeaderboard(indexPlayer, lb)
 endif
 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction


function CreateLeaderboardBJ takes force toForce, string label returns leaderboard
 set bj_lastCreatedLeaderboard = CreateLeaderboard()
 call LeaderboardSetLabel(bj_lastCreatedLeaderboard, label)
 call ForceSetLeaderboardBJ(bj_lastCreatedLeaderboard, toForce)
 call LeaderboardDisplay(bj_lastCreatedLeaderboard, true)
 return bj_lastCreatedLeaderboard
endfunction


function DestroyLeaderboardBJ takes leaderboard lb returns nothing
 call DestroyLeaderboard(lb)
endfunction


function LeaderboardDisplayBJ takes boolean show, leaderboard lb returns nothing
 call LeaderboardDisplay(lb, show)
endfunction


function LeaderboardAddItemBJ takes player whichPlayer, leaderboard lb, string label, integer value returns nothing
 if (LeaderboardHasPlayerItem(lb, whichPlayer)) then
 call LeaderboardRemovePlayerItem(lb, whichPlayer)
 endif
 call LeaderboardAddItem(lb, label, value, whichPlayer)
 call LeaderboardResizeBJ(lb)
 
endfunction


function LeaderboardRemovePlayerItemBJ takes player whichPlayer, leaderboard lb returns nothing
 call LeaderboardRemovePlayerItem(lb, whichPlayer)
 call LeaderboardResizeBJ(lb)
endfunction


function LeaderboardSortItemsBJ takes leaderboard lb, integer sortType, boolean ascending returns nothing
 if (sortType == bj_SORTTYPE_SORTBYVALUE) then
 call LeaderboardSortItemsByValue(lb, ascending)
 elseif (sortType == bj_SORTTYPE_SORTBYPLAYER) then
 call LeaderboardSortItemsByPlayer(lb, ascending)
 elseif (sortType == bj_SORTTYPE_SORTBYLABEL) then
 call LeaderboardSortItemsByLabel(lb, ascending)
 else
 
 endif
endfunction


function LeaderboardSortItemsByPlayerBJ takes leaderboard lb, boolean ascending returns nothing
 call LeaderboardSortItemsByPlayer(lb, ascending)
endfunction


function LeaderboardSortItemsByLabelBJ takes leaderboard lb, boolean ascending returns nothing
 call LeaderboardSortItemsByLabel(lb, ascending)
endfunction


function LeaderboardGetPlayerIndexBJ takes player whichPlayer, leaderboard lb returns integer
 return LeaderboardGetPlayerIndex(lb, whichPlayer) + 1
endfunction





function LeaderboardGetIndexedPlayerBJ takes integer position, leaderboard lb returns player
 local integer index
 local player indexPlayer

 set index = 0
 loop
 set indexPlayer = Player(index)
 if (LeaderboardGetPlayerIndex(lb, indexPlayer) == position - 1) then
 return indexPlayer
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 return Player(PLAYER_NEUTRAL_PASSIVE)
endfunction


function PlayerGetLeaderboardBJ takes player whichPlayer returns leaderboard
 return PlayerGetLeaderboard(whichPlayer)
endfunction


function GetLastCreatedLeaderboard takes nothing returns leaderboard
 return bj_lastCreatedLeaderboard
endfunction








function CreateMultiboardBJ takes integer cols, integer rows, string title returns multiboard
 set bj_lastCreatedMultiboard = CreateMultiboard()
 call MultiboardSetRowCount(bj_lastCreatedMultiboard, rows)
 call MultiboardSetColumnCount(bj_lastCreatedMultiboard, cols)
 call MultiboardSetTitleText(bj_lastCreatedMultiboard, title)
 call MultiboardDisplay(bj_lastCreatedMultiboard, true)
 return bj_lastCreatedMultiboard
endfunction


function DestroyMultiboardBJ takes multiboard mb returns nothing
 call DestroyMultiboard(mb)
endfunction


function GetLastCreatedMultiboard takes nothing returns multiboard
 return bj_lastCreatedMultiboard
endfunction


function MultiboardDisplayBJ takes boolean show, multiboard mb returns nothing
 call MultiboardDisplay(mb, show)
endfunction


function MultiboardMinimizeBJ takes boolean minimize, multiboard mb returns nothing
 call MultiboardMinimize(mb, minimize)
endfunction


function MultiboardSetTitleTextColorBJ takes multiboard mb, real red, real green, real blue, real transparency returns nothing
 call MultiboardSetTitleTextColor(mb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function MultiboardAllowDisplayBJ takes boolean flag returns nothing
 call MultiboardSuppressDisplay(not flag)
endfunction


function MultiboardSetItemStyleBJ takes multiboard mb, integer col, integer row, boolean showValue, boolean showIcon returns nothing
 local integer curRow = 0
 local integer curCol = 0
 local integer numRows = MultiboardGetRowCount(mb)
 local integer numCols = MultiboardGetColumnCount(mb)
 local multiboarditem mbitem = null

 
 loop
 set curRow = curRow + 1
 exitwhen curRow > numRows

 
 if (row == 0 or row == curRow) then
 
 set curCol = 0
 loop
 set curCol = curCol + 1
 exitwhen curCol > numCols

 
 if (col == 0 or col == curCol) then
 set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
 call MultiboardSetItemStyle(mbitem, showValue, showIcon)
 call MultiboardReleaseItem(mbitem)
 endif
 endloop
 endif
 endloop
endfunction


function MultiboardSetItemValueBJ takes multiboard mb, integer col, integer row, string val returns nothing
 local integer curRow = 0
 local integer curCol = 0
 local integer numRows = MultiboardGetRowCount(mb)
 local integer numCols = MultiboardGetColumnCount(mb)
 local multiboarditem mbitem = null

 
 loop
 set curRow = curRow + 1
 exitwhen curRow > numRows

 
 if (row == 0 or row == curRow) then
 
 set curCol = 0
 loop
 set curCol = curCol + 1
 exitwhen curCol > numCols

 
 if (col == 0 or col == curCol) then
 set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
 call MultiboardSetItemValue(mbitem, val)
 call MultiboardReleaseItem(mbitem)
 endif
 endloop
 endif
 endloop
endfunction


function MultiboardSetItemColorBJ takes multiboard mb, integer col, integer row, real red, real green, real blue, real transparency returns nothing
 local integer curRow = 0
 local integer curCol = 0
 local integer numRows = MultiboardGetRowCount(mb)
 local integer numCols = MultiboardGetColumnCount(mb)
 local multiboarditem mbitem = null

 
 loop
 set curRow = curRow + 1
 exitwhen curRow > numRows

 
 if (row == 0 or row == curRow) then
 
 set curCol = 0
 loop
 set curCol = curCol + 1
 exitwhen curCol > numCols

 
 if (col == 0 or col == curCol) then
 set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
 call MultiboardSetItemValueColor(mbitem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
 call MultiboardReleaseItem(mbitem)
 endif
 endloop
 endif
 endloop
endfunction


function MultiboardSetItemWidthBJ takes multiboard mb, integer col, integer row, real width returns nothing
 local integer curRow = 0
 local integer curCol = 0
 local integer numRows = MultiboardGetRowCount(mb)
 local integer numCols = MultiboardGetColumnCount(mb)
 local multiboarditem mbitem = null

 
 loop
 set curRow = curRow + 1
 exitwhen curRow > numRows

 
 if (row == 0 or row == curRow) then
 
 set curCol = 0
 loop
 set curCol = curCol + 1
 exitwhen curCol > numCols

 
 if (col == 0 or col == curCol) then
 set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
 call MultiboardSetItemWidth(mbitem, width/100.0)
 call MultiboardReleaseItem(mbitem)
 endif
 endloop
 endif
 endloop
endfunction


function MultiboardSetItemIconBJ takes multiboard mb, integer col, integer row, string iconFileName returns nothing
 local integer curRow = 0
 local integer curCol = 0
 local integer numRows = MultiboardGetRowCount(mb)
 local integer numCols = MultiboardGetColumnCount(mb)
 local multiboarditem mbitem = null

 
 loop
 set curRow = curRow + 1
 exitwhen curRow > numRows

 
 if (row == 0 or row == curRow) then
 
 set curCol = 0
 loop
 set curCol = curCol + 1
 exitwhen curCol > numCols

 
 if (col == 0 or col == curCol) then
 set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
 call MultiboardSetItemIcon(mbitem, iconFileName)
 call MultiboardReleaseItem(mbitem)
 endif
 endloop
 endif
 endloop
endfunction










function TextTagSize2Height takes real size returns real
 return size * 0.023 / 10
endfunction





function TextTagSpeed2Velocity takes real speed returns real
 return speed * 0.071 / 128
endfunction


function SetTextTagColorBJ takes texttag tt, real red, real green, real blue, real transparency returns nothing
 call SetTextTagColor(tt, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction


function SetTextTagVelocityBJ takes texttag tt, real speed, real angle returns nothing
 local real vel = TextTagSpeed2Velocity(speed)
 local real xvel = vel * Cos(angle * bj_DEGTORAD)
 local real yvel = vel * Sin(angle * bj_DEGTORAD)

 call SetTextTagVelocity(tt, xvel, yvel)
endfunction


function SetTextTagTextBJ takes texttag tt, string s, real size returns nothing
 local real textHeight = TextTagSize2Height(size)

 call SetTextTagText(tt, s, textHeight)
endfunction


function SetTextTagPosBJ takes texttag tt, location loc, real zOffset returns nothing
 call SetTextTagPos(tt, GetLocationX(loc), GetLocationY(loc), zOffset)
endfunction


function SetTextTagPosUnitBJ takes texttag tt, unit whichUnit, real zOffset returns nothing
 call SetTextTagPosUnit(tt, whichUnit, zOffset)
endfunction


function SetTextTagSuspendedBJ takes texttag tt, boolean flag returns nothing
 call SetTextTagSuspended(tt, flag)
endfunction


function SetTextTagPermanentBJ takes texttag tt, boolean flag returns nothing
 call SetTextTagPermanent(tt, flag)
endfunction


function SetTextTagAgeBJ takes texttag tt, real age returns nothing
 call SetTextTagAge(tt, age)
endfunction


function SetTextTagLifespanBJ takes texttag tt, real lifespan returns nothing
 call SetTextTagLifespan(tt, lifespan)
endfunction


function SetTextTagFadepointBJ takes texttag tt, real fadepoint returns nothing
 call SetTextTagFadepoint(tt, fadepoint)
endfunction


function CreateTextTagLocBJ takes string s, location loc, real zOffset, real size, real red, real green, real blue, real transparency returns texttag
 set bj_lastCreatedTextTag = CreateTextTag()
 call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
 call SetTextTagPosBJ(bj_lastCreatedTextTag, loc, zOffset)
 call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

 return bj_lastCreatedTextTag
endfunction


function CreateTextTagUnitBJ takes string s, unit whichUnit, real zOffset, real size, real red, real green, real blue, real transparency returns texttag
 set bj_lastCreatedTextTag = CreateTextTag()
 call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
 call SetTextTagPosUnitBJ(bj_lastCreatedTextTag, whichUnit, zOffset)
 call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

 return bj_lastCreatedTextTag
endfunction


function DestroyTextTagBJ takes texttag tt returns nothing
 call DestroyTextTag(tt)
endfunction


function ShowTextTagForceBJ takes boolean show, texttag tt, force whichForce returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call SetTextTagVisibility(tt, show)
 endif
endfunction


function GetLastCreatedTextTag takes nothing returns texttag
 return bj_lastCreatedTextTag
endfunction







function PauseGameOn takes nothing returns nothing
 call PauseGame(true)
endfunction


function PauseGameOff takes nothing returns nothing
 call PauseGame(false)
endfunction


function SetUserControlForceOn takes force whichForce returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call EnableUserControl(true)
 endif
endfunction


function SetUserControlForceOff takes force whichForce returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call EnableUserControl(false)
 endif
endfunction


function ShowInterfaceForceOn takes force whichForce, real fadeDuration returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call ShowInterface(true, fadeDuration)
 endif
endfunction


function ShowInterfaceForceOff takes force whichForce, real fadeDuration returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call ShowInterface(false, fadeDuration)
 endif
endfunction


function PingMinimapForForce takes force whichForce, real x, real y, real duration returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 
 call PingMinimap(x, y, duration)
 
 endif
endfunction


function PingMinimapLocForForce takes force whichForce, location loc, real duration returns nothing
 call PingMinimapForForce(whichForce, GetLocationX(loc), GetLocationY(loc), duration)
endfunction


function PingMinimapForPlayer takes player whichPlayer, real x, real y, real duration returns nothing
 if (GetLocalPlayer() == whichPlayer) then
 
 call PingMinimap(x, y, duration)
 
 endif
endfunction


function PingMinimapLocForPlayer takes player whichPlayer, location loc, real duration returns nothing
 call PingMinimapForPlayer(whichPlayer, GetLocationX(loc), GetLocationY(loc), duration)
endfunction


function PingMinimapForForceEx takes force whichForce, real x, real y, real duration, integer style, real red, real green, real blue returns nothing
 local integer red255 = PercentTo255(red)
 local integer green255 = PercentTo255(green)
 local integer blue255 = PercentTo255(blue)

 if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
 

 
 if (red255 == 255) and (green255 == 0) and (blue255 == 0) then
 set red255 = 254
 endif

 if (style == bj_MINIMAPPINGSTYLE_SIMPLE) then
 call PingMinimapEx(x, y, duration, red255, green255, blue255, false)
 elseif (style == bj_MINIMAPPINGSTYLE_FLASHY) then
 call PingMinimapEx(x, y, duration, red255, green255, blue255, true)
 elseif (style == bj_MINIMAPPINGSTYLE_ATTACK) then
 call PingMinimapEx(x, y, duration, 255, 0, 0, false)
 else
 
 endif
 
 endif
endfunction


function PingMinimapLocForForceEx takes force whichForce, location loc, real duration, integer style, real red, real green, real blue returns nothing
 call PingMinimapForForceEx(whichForce, GetLocationX(loc), GetLocationY(loc), duration, style, red, green, blue)
endfunction


function EnableWorldFogBoundaryBJ takes boolean enable, force f returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), f)) then
 
 call EnableWorldFogBoundary(enable)
 endif
endfunction


function EnableOcclusionBJ takes boolean enable, force f returns nothing
 if (IsPlayerInForce(GetLocalPlayer(), f)) then
 
 call EnableOcclusion(enable)
 endif
endfunction









function CancelCineSceneBJ takes nothing returns nothing
 call StopSoundBJ(bj_cineSceneLastSound, true)
 call EndCinematicScene()
endfunction







function TryInitCinematicBehaviorBJ takes nothing returns nothing
 local integer index

 if (bj_cineSceneBeingSkipped == null) then
 set bj_cineSceneBeingSkipped = CreateTrigger()
 set index = 0
 loop
 call TriggerRegisterPlayerEvent(bj_cineSceneBeingSkipped, Player(index), EVENT_PLAYER_END_CINEMATIC)
 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
 call TriggerAddAction(bj_cineSceneBeingSkipped, function CancelCineSceneBJ)
 endif
endfunction


function SetCinematicSceneBJ takes sound soundHandle, integer portraitUnitId, playercolor color, string speakerTitle, string text, real sceneDuration, real voiceoverDuration returns nothing
 set bj_cineSceneLastSound = soundHandle
 call PlaySoundBJ(soundHandle)
 call SetCinematicScene(portraitUnitId, color, speakerTitle, text, sceneDuration, voiceoverDuration)
endfunction


function GetTransmissionDuration takes sound soundHandle, integer timeType, real timeVal returns real
 local real duration

 if (timeType == bj_TIMETYPE_ADD) then
 set duration = GetSoundDurationBJ(soundHandle) + timeVal
 elseif (timeType == bj_TIMETYPE_SET) then
 set duration = timeVal
 elseif (timeType == bj_TIMETYPE_SUB) then
 set duration = GetSoundDurationBJ(soundHandle) - timeVal
 else
 
 set duration = GetSoundDurationBJ(soundHandle)
 endif

 
 if (duration < 0) then
 set duration = 0
 endif
 return duration
endfunction


function WaitTransmissionDuration takes sound soundHandle, integer timeType, real timeVal returns nothing
 if (timeType == bj_TIMETYPE_SET) then
 
 call TriggerSleepAction(timeVal)

 elseif (soundHandle == null) then
 
 call TriggerSleepAction(bj_NOTHING_SOUND_DURATION)

 elseif (timeType == bj_TIMETYPE_SUB) then
 
 
 call WaitForSoundBJ(soundHandle, timeVal)

 elseif (timeType == bj_TIMETYPE_ADD) then
 
 
 call WaitForSoundBJ(soundHandle, 0)
 call TriggerSleepAction(timeVal)

 else
 
 endif
endfunction


function DoTransmissionBasicsXYBJ takes integer unitId, playercolor color, real x, real y, sound soundHandle, string unitName, string message, real duration returns nothing
 call SetCinematicSceneBJ(soundHandle, unitId, color, unitName, message, duration + bj_TRANSMISSION_PORT_HANGTIME, duration)

 if (unitId != 0) then
 call PingMinimap(x, y, bj_TRANSMISSION_PING_TIME)
 
 endif
endfunction











function TransmissionFromUnitWithNameBJ takes force toForce, unit whichUnit, string unitName, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returns nothing
 call TryInitCinematicBehaviorBJ()

 
 set timeVal = RMaxBJ(timeVal, 0)

 set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
 set bj_lastPlayedSound = soundHandle

 if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
 

 if (whichUnit == null) then
 
 call DoTransmissionBasicsXYBJ(0, PLAYER_COLOR_RED, 0, 0, soundHandle, unitName, message, bj_lastTransmissionDuration)
 else
 call DoTransmissionBasicsXYBJ(GetUnitTypeId(whichUnit), GetPlayerColor(GetOwningPlayer(whichUnit)), GetUnitX(whichUnit), GetUnitY(whichUnit), soundHandle, unitName, message, bj_lastTransmissionDuration)
 if (not IsUnitHidden(whichUnit)) then
 call UnitAddIndicator(whichUnit, bj_TRANSMISSION_IND_RED, bj_TRANSMISSION_IND_BLUE, bj_TRANSMISSION_IND_GREEN, bj_TRANSMISSION_IND_ALPHA)
 endif
 endif
 endif

 if wait and (bj_lastTransmissionDuration > 0) then
 
 call WaitTransmissionDuration(soundHandle, timeType, timeVal)
 endif

endfunction





function TransmissionFromUnitTypeWithNameBJ takes force toForce, player fromPlayer, integer unitId, string unitName, location loc, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returns nothing
 call TryInitCinematicBehaviorBJ()

 
 set timeVal = RMaxBJ(timeVal, 0)

 set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
 set bj_lastPlayedSound = soundHandle

 if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
 

 call DoTransmissionBasicsXYBJ(unitId, GetPlayerColor(fromPlayer), GetLocationX(loc), GetLocationY(loc), soundHandle, unitName, message, bj_lastTransmissionDuration)
 endif

 if wait and (bj_lastTransmissionDuration > 0) then
 
 call WaitTransmissionDuration(soundHandle, timeType, timeVal)
 endif

endfunction


function GetLastTransmissionDurationBJ takes nothing returns real
 return bj_lastTransmissionDuration
endfunction


function ForceCinematicSubtitlesBJ takes boolean flag returns nothing
 call ForceCinematicSubtitles(flag)
endfunction

























function CinematicModeExBJ takes boolean cineMode, force forForce, real interfaceFadeTime returns nothing
 
 if (not bj_gameStarted) then
 set interfaceFadeTime = 0
 endif

 if (cineMode) then
 
 if (not bj_cineModeAlreadyIn) then
 set bj_cineModeAlreadyIn = true
 set bj_cineModePriorSpeed = GetGameSpeed()
 set bj_cineModePriorFogSetting = IsFogEnabled()
 set bj_cineModePriorMaskSetting = IsFogMaskEnabled()
 set bj_cineModePriorDawnDusk = IsDawnDuskEnabled()
 set bj_cineModeSavedSeed = GetRandomInt(0, 1000000)
 endif

 
 if (IsPlayerInForce(GetLocalPlayer(), forForce)) then
 
 call ClearTextMessages()
 call ShowInterface(false, interfaceFadeTime)
 call EnableUserControl(false)
 call EnableOcclusion(false)
 call SetCineModeVolumeGroupsBJ()
 endif

 
 call SetGameSpeed(bj_CINEMODE_GAMESPEED)
 call SetMapFlag(MAP_LOCK_SPEED, true)
 call FogMaskEnable(false)
 call FogEnable(false)
 call EnableWorldFogBoundary(false)
 call EnableDawnDusk(false)

 
 call SetRandomSeed(0)
 else
 set bj_cineModeAlreadyIn = false

 
 if (IsPlayerInForce(GetLocalPlayer(), forForce)) then
 
 call ShowInterface(true, interfaceFadeTime)
 call EnableUserControl(true)
 call EnableOcclusion(true)
 call VolumeGroupReset()
 call EndThematicMusic()
 call CameraResetSmoothingFactorBJ()
 endif

 
 call SetMapFlag(MAP_LOCK_SPEED, false)
 call SetGameSpeed(bj_cineModePriorSpeed)
 call FogMaskEnable(bj_cineModePriorMaskSetting)
 call FogEnable(bj_cineModePriorFogSetting)
 call EnableWorldFogBoundary(true)
 call EnableDawnDusk(bj_cineModePriorDawnDusk)
 call SetRandomSeed(bj_cineModeSavedSeed)
 endif
endfunction


function CinematicModeBJ takes boolean cineMode, force forForce returns nothing
 call CinematicModeExBJ(cineMode, forForce, bj_CINEMODE_INTERFACEFADE)
endfunction







function DisplayCineFilterBJ takes boolean flag returns nothing
 call DisplayCineFilter(flag)
endfunction


function CinematicFadeCommonBJ takes real red, real green, real blue, real duration, string tex, real startTrans, real endTrans returns nothing
 if (duration == 0) then
 
 
 set startTrans = endTrans
 endif
 call EnableUserUI(false)
 call SetCineFilterTexture(tex)
 call SetCineFilterBlendMode(BLEND_MODE_BLEND)
 call SetCineFilterTexMapFlags(TEXMAP_FLAG_NONE)
 call SetCineFilterStartUV(0, 0, 1, 1)
 call SetCineFilterEndUV(0, 0, 1, 1)
 call SetCineFilterStartColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100-startTrans))
 call SetCineFilterEndColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100-endTrans))
 call SetCineFilterDuration(duration)
 call DisplayCineFilter(true)
endfunction


function FinishCinematicFadeBJ takes nothing returns nothing
 call DestroyTimer(bj_cineFadeFinishTimer)
 set bj_cineFadeFinishTimer = null
 call DisplayCineFilter(false)
 call EnableUserUI(true)
endfunction


function FinishCinematicFadeAfterBJ takes real duration returns nothing
 
 set bj_cineFadeFinishTimer = CreateTimer()
 call TimerStart(bj_cineFadeFinishTimer, duration, false, function FinishCinematicFadeBJ)
endfunction


function ContinueCinematicFadeBJ takes nothing returns nothing
 call DestroyTimer(bj_cineFadeContinueTimer)
 set bj_cineFadeContinueTimer = null
 call CinematicFadeCommonBJ(bj_cineFadeContinueRed, bj_cineFadeContinueGreen, bj_cineFadeContinueBlue, bj_cineFadeContinueDuration, bj_cineFadeContinueTex, bj_cineFadeContinueTrans, 100)
endfunction


function ContinueCinematicFadeAfterBJ takes real duration, real red, real green, real blue, real trans, string tex returns nothing
 set bj_cineFadeContinueRed = red
 set bj_cineFadeContinueGreen = green
 set bj_cineFadeContinueBlue = blue
 set bj_cineFadeContinueTrans = trans
 set bj_cineFadeContinueDuration = duration
 set bj_cineFadeContinueTex = tex

 
 set bj_cineFadeContinueTimer = CreateTimer()
 call TimerStart(bj_cineFadeContinueTimer, duration, false, function ContinueCinematicFadeBJ)
endfunction


function AbortCinematicFadeBJ takes nothing returns nothing
 if (bj_cineFadeContinueTimer != null) then
 call DestroyTimer(bj_cineFadeContinueTimer)
 endif

 if (bj_cineFadeFinishTimer != null) then
 call DestroyTimer(bj_cineFadeFinishTimer)
 endif
endfunction


function CinematicFadeBJ takes integer fadetype, real duration, string tex, real red, real green, real blue, real trans returns nothing
 if (fadetype == bj_CINEFADETYPE_FADEOUT) then
 
 call AbortCinematicFadeBJ()
 call CinematicFadeCommonBJ(red, green, blue, duration, tex, 100, trans)
 elseif (fadetype == bj_CINEFADETYPE_FADEIN) then
 
 call AbortCinematicFadeBJ()
 call CinematicFadeCommonBJ(red, green, blue, duration, tex, trans, 100)
 call FinishCinematicFadeAfterBJ(duration)
 elseif (fadetype == bj_CINEFADETYPE_FADEOUTIN) then
 
 if (duration > 0) then
 call AbortCinematicFadeBJ()
 call CinematicFadeCommonBJ(red, green, blue, duration * 0.5, tex, 100, trans)
 call ContinueCinematicFadeAfterBJ(duration * 0.5, red, green, blue, trans, tex)
 call FinishCinematicFadeAfterBJ(duration)
 endif
 else
 
 endif
endfunction


function CinematicFilterGenericBJ takes real duration, blendmode bmode, string tex, real red0, real green0, real blue0, real trans0, real red1, real green1, real blue1, real trans1 returns nothing
 call AbortCinematicFadeBJ()
 call SetCineFilterTexture(tex)
 call SetCineFilterBlendMode(bmode)
 call SetCineFilterTexMapFlags(TEXMAP_FLAG_NONE)
 call SetCineFilterStartUV(0, 0, 1, 1)
 call SetCineFilterEndUV(0, 0, 1, 1)
 call SetCineFilterStartColor(PercentTo255(red0), PercentTo255(green0), PercentTo255(blue0), PercentTo255(100-trans0))
 call SetCineFilterEndColor(PercentTo255(red1), PercentTo255(green1), PercentTo255(blue1), PercentTo255(100-trans1))
 call SetCineFilterDuration(duration)
 call DisplayCineFilter(true)
endfunction











function RescueUnitBJ takes unit whichUnit, player rescuer, boolean changeColor returns nothing
 if IsUnitDeadBJ(whichUnit) or (GetOwningPlayer(whichUnit) == rescuer) then
 return
 endif

 call StartSound(bj_rescueSound)
 call SetUnitOwner(whichUnit, rescuer, changeColor)
 call UnitAddIndicator(whichUnit, 0, 255, 0, 255)
 call PingMinimapForPlayer(rescuer, GetUnitX(whichUnit), GetUnitY(whichUnit), bj_RESCUE_PING_TIME)
endfunction


function TriggerActionUnitRescuedBJ takes nothing returns nothing
 local unit theUnit = GetTriggerUnit()

 if IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
 call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorBldg)
 else
 call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorUnit)
 endif
endfunction






function TryInitRescuableTriggersBJ takes nothing returns nothing
 local integer index

 if (bj_rescueUnitBehavior == null) then
 set bj_rescueUnitBehavior = CreateTrigger()
 set index = 0
 loop
 call TriggerRegisterPlayerUnitEvent(bj_rescueUnitBehavior, Player(index), EVENT_PLAYER_UNIT_RESCUED, null)
 set index = index + 1
 exitwhen index == bj_MAX_PLAYER_SLOTS
 endloop
 call TriggerAddAction(bj_rescueUnitBehavior, function TriggerActionUnitRescuedBJ)
 endif
endfunction





function SetRescueUnitColorChangeBJ takes boolean changeColor returns nothing
 set bj_rescueChangeColorUnit = changeColor
endfunction





function SetRescueBuildingColorChangeBJ takes boolean changeColor returns nothing
 set bj_rescueChangeColorBldg = changeColor
endfunction


function MakeUnitRescuableToForceBJEnum takes nothing returns nothing
 call TryInitRescuableTriggersBJ()
 call SetUnitRescuable(bj_makeUnitRescuableUnit, GetEnumPlayer(), bj_makeUnitRescuableFlag)
endfunction


function MakeUnitRescuableToForceBJ takes unit whichUnit, boolean isRescuable, force whichForce returns nothing
 
 set bj_makeUnitRescuableUnit = whichUnit
 set bj_makeUnitRescuableFlag = isRescuable
 call ForForce(whichForce, function MakeUnitRescuableToForceBJEnum)
endfunction


function InitRescuableBehaviorBJ takes nothing returns nothing
 local integer index

 set index = 0
 loop
 
 
 if (GetPlayerController(Player(index)) == MAP_CONTROL_RESCUABLE) then
 call TryInitRescuableTriggersBJ()
 return
 endif
 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction







function SetPlayerTechResearchedSwap takes integer techid, integer levels, player whichPlayer returns nothing
 call SetPlayerTechResearched(whichPlayer, techid, levels)
endfunction


function SetPlayerTechMaxAllowedSwap takes integer techid, integer maximum, player whichPlayer returns nothing
 call SetPlayerTechMaxAllowed(whichPlayer, techid, maximum)
endfunction


function SetPlayerMaxHeroesAllowed takes integer maximum, player whichPlayer returns nothing
 call SetPlayerTechMaxAllowed(whichPlayer, 'HERO', maximum)
endfunction


function GetPlayerTechCountSimple takes integer techid, player whichPlayer returns integer
 return GetPlayerTechCount(whichPlayer, techid, true)
endfunction


function GetPlayerTechMaxAllowedSwap takes integer techid, player whichPlayer returns integer
 return GetPlayerTechMaxAllowed(whichPlayer, techid)
endfunction


function SetPlayerAbilityAvailableBJ takes boolean avail, integer abilid, player whichPlayer returns nothing
 call SetPlayerAbilityAvailable(whichPlayer, abilid, avail)
endfunction






function SetCampaignMenuRaceBJ takes integer campaignNumber returns nothing
 if (campaignNumber == bj_CAMPAIGN_INDEX_T) then
 call SetCampaignMenuRace(RACE_OTHER)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_H) then
 call SetCampaignMenuRace(RACE_HUMAN)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_U) then
 call SetCampaignMenuRace(RACE_UNDEAD)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_O) then
 call SetCampaignMenuRace(RACE_ORC)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_N) then
 call SetCampaignMenuRace(RACE_NIGHTELF)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XN) then
 call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XN)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XH) then
 call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XH)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XU) then
 call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XU)
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XO) then
 call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XO)
 else
 
 endif
endfunction








function SetMissionAvailableBJ takes boolean available, integer missionIndex returns nothing
 local integer campaignNumber = missionIndex / 1000
 local integer missionNumber = missionIndex - campaignNumber * 1000

 call SetMissionAvailable(campaignNumber, missionNumber, available)
endfunction


function SetCampaignAvailableBJ takes boolean available, integer campaignNumber returns nothing
 local integer campaignOffset

 if (campaignNumber == bj_CAMPAIGN_INDEX_H) then
 call SetTutorialCleared(true)
 endif

 if (campaignNumber == bj_CAMPAIGN_INDEX_XN) then
 set campaignOffset = bj_CAMPAIGN_OFFSET_XN
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XH) then
 set campaignOffset = bj_CAMPAIGN_OFFSET_XH
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XU) then
 set campaignOffset = bj_CAMPAIGN_OFFSET_XU
 elseif (campaignNumber == bj_CAMPAIGN_INDEX_XO) then
 set campaignOffset = bj_CAMPAIGN_OFFSET_XO
 else
 set campaignOffset = campaignNumber
 endif

 call SetCampaignAvailable(campaignOffset, available)
 call SetCampaignMenuRaceBJ(campaignNumber)
 call ForceCampaignSelectScreen()
endfunction


function SetCinematicAvailableBJ takes boolean available, integer cinematicIndex returns nothing
 if ( cinematicIndex == bj_CINEMATICINDEX_TOP ) then
 call SetOpCinematicAvailable( bj_CAMPAIGN_INDEX_T, available )
 call PlayCinematic( "TutorialOp" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_HOP) then
 call SetOpCinematicAvailable( bj_CAMPAIGN_INDEX_H, available )
 call PlayCinematic( "HumanOp" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_HED) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_H, available )
 call PlayCinematic( "HumanEd" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_OOP) then
 call SetOpCinematicAvailable( bj_CAMPAIGN_INDEX_O, available )
 call PlayCinematic( "OrcOp" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_OED) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_O, available )
 call PlayCinematic( "OrcEd" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_UOP) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_U, available )
 call PlayCinematic( "UndeadOp" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_UED) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_U, available )
 call PlayCinematic( "UndeadEd" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_NOP) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_N, available )
 call PlayCinematic( "NightElfOp" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_NED) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_INDEX_N, available )
 call PlayCinematic( "NightElfEd" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_XOP) then
 call SetOpCinematicAvailable( bj_CAMPAIGN_OFFSET_XN, available )
 call PlayCinematic( "IntroX" )
 elseif (cinematicIndex == bj_CINEMATICINDEX_XED) then
 call SetEdCinematicAvailable( bj_CAMPAIGN_OFFSET_XU, available )
 call PlayCinematic( "OutroX" )
 else
 
 endif
endfunction


function InitGameCacheBJ takes string campaignFile returns gamecache
 set bj_lastCreatedGameCache = InitGameCache(campaignFile)
 return bj_lastCreatedGameCache
endfunction


function SaveGameCacheBJ takes gamecache cache returns boolean
 return SaveGameCache(cache)
endfunction


function GetLastCreatedGameCacheBJ takes nothing returns gamecache
 return bj_lastCreatedGameCache
endfunction


function InitHashtableBJ takes nothing returns hashtable
 set bj_lastCreatedHashtable = InitHashtable()
 return bj_lastCreatedHashtable
endfunction


function GetLastCreatedHashtableBJ takes nothing returns hashtable
 return bj_lastCreatedHashtable
endfunction


function StoreRealBJ takes real value, string key, string missionKey, gamecache cache returns nothing
 call StoreReal(cache, missionKey, key, value)
endfunction


function StoreIntegerBJ takes integer value, string key, string missionKey, gamecache cache returns nothing
 call StoreInteger(cache, missionKey, key, value)
endfunction


function StoreBooleanBJ takes boolean value, string key, string missionKey, gamecache cache returns nothing
 call StoreBoolean(cache, missionKey, key, value)
endfunction


function StoreStringBJ takes string value, string key, string missionKey, gamecache cache returns boolean
 return StoreString(cache, missionKey, key, value)
endfunction


function StoreUnitBJ takes unit whichUnit, string key, string missionKey, gamecache cache returns boolean
 return StoreUnit(cache, missionKey, key, whichUnit)
endfunction


function SaveRealBJ takes real value, integer key, integer missionKey, hashtable table returns nothing
 call SaveReal(table, missionKey, key, value)
endfunction


function SaveIntegerBJ takes integer value, integer key, integer missionKey, hashtable table returns nothing
 call SaveInteger(table, missionKey, key, value)
endfunction


function SaveBooleanBJ takes boolean value, integer key, integer missionKey, hashtable table returns nothing
 call SaveBoolean(table, missionKey, key, value)
endfunction


function SaveStringBJ takes string value, integer key, integer missionKey, hashtable table returns boolean
 return SaveStr(table, missionKey, key, value)
endfunction


function SavePlayerHandleBJ takes player whichPlayer, integer key, integer missionKey, hashtable table returns boolean
 return SavePlayerHandle(table, missionKey, key, whichPlayer)
endfunction


function SaveWidgetHandleBJ takes widget whichWidget, integer key, integer missionKey, hashtable table returns boolean
 return SaveWidgetHandle(table, missionKey, key, whichWidget)
endfunction


function SaveDestructableHandleBJ takes destructable whichDestructable, integer key, integer missionKey, hashtable table returns boolean
 return SaveDestructableHandle(table, missionKey, key, whichDestructable)
endfunction


function SaveItemHandleBJ takes item whichItem, integer key, integer missionKey, hashtable table returns boolean
 return SaveItemHandle(table, missionKey, key, whichItem)
endfunction


function SaveUnitHandleBJ takes unit whichUnit, integer key, integer missionKey, hashtable table returns boolean
 return SaveUnitHandle(table, missionKey, key, whichUnit)
endfunction


function SaveAbilityHandleBJ takes ability whichAbility, integer key, integer missionKey, hashtable table returns boolean
 return SaveAbilityHandle(table, missionKey, key, whichAbility)
endfunction


function SaveTimerHandleBJ takes timer whichTimer, integer key, integer missionKey, hashtable table returns boolean
 return SaveTimerHandle(table, missionKey, key, whichTimer)
endfunction


function SaveTriggerHandleBJ takes trigger whichTrigger, integer key, integer missionKey, hashtable table returns boolean
 return SaveTriggerHandle(table, missionKey, key, whichTrigger)
endfunction


function SaveTriggerConditionHandleBJ takes triggercondition whichTriggercondition, integer key, integer missionKey, hashtable table returns boolean
 return SaveTriggerConditionHandle(table, missionKey, key, whichTriggercondition)
endfunction


function SaveTriggerActionHandleBJ takes triggeraction whichTriggeraction, integer key, integer missionKey, hashtable table returns boolean
 return SaveTriggerActionHandle(table, missionKey, key, whichTriggeraction)
endfunction


function SaveTriggerEventHandleBJ takes event whichEvent, integer key, integer missionKey, hashtable table returns boolean
 return SaveTriggerEventHandle(table, missionKey, key, whichEvent)
endfunction


function SaveForceHandleBJ takes force whichForce, integer key, integer missionKey, hashtable table returns boolean
 return SaveForceHandle(table, missionKey, key, whichForce)
endfunction


function SaveGroupHandleBJ takes group whichGroup, integer key, integer missionKey, hashtable table returns boolean
 return SaveGroupHandle(table, missionKey, key, whichGroup)
endfunction


function SaveLocationHandleBJ takes location whichLocation, integer key, integer missionKey, hashtable table returns boolean
 return SaveLocationHandle(table, missionKey, key, whichLocation)
endfunction


function SaveRectHandleBJ takes rect whichRect, integer key, integer missionKey, hashtable table returns boolean
 return SaveRectHandle(table, missionKey, key, whichRect)
endfunction


function SaveBooleanExprHandleBJ takes boolexpr whichBoolexpr, integer key, integer missionKey, hashtable table returns boolean
 return SaveBooleanExprHandle(table, missionKey, key, whichBoolexpr)
endfunction


function SaveSoundHandleBJ takes sound whichSound, integer key, integer missionKey, hashtable table returns boolean
 return SaveSoundHandle(table, missionKey, key, whichSound)
endfunction


function SaveEffectHandleBJ takes effect whichEffect, integer key, integer missionKey, hashtable table returns boolean
 return SaveEffectHandle(table, missionKey, key, whichEffect)
endfunction


function SaveUnitPoolHandleBJ takes unitpool whichUnitpool, integer key, integer missionKey, hashtable table returns boolean
 return SaveUnitPoolHandle(table, missionKey, key, whichUnitpool)
endfunction


function SaveItemPoolHandleBJ takes itempool whichItempool, integer key, integer missionKey, hashtable table returns boolean
 return SaveItemPoolHandle(table, missionKey, key, whichItempool)
endfunction


function SaveQuestHandleBJ takes quest whichQuest, integer key, integer missionKey, hashtable table returns boolean
 return SaveQuestHandle(table, missionKey, key, whichQuest)
endfunction


function SaveQuestItemHandleBJ takes questitem whichQuestitem, integer key, integer missionKey, hashtable table returns boolean
 return SaveQuestItemHandle(table, missionKey, key, whichQuestitem)
endfunction


function SaveDefeatConditionHandleBJ takes defeatcondition whichDefeatcondition, integer key, integer missionKey, hashtable table returns boolean
 return SaveDefeatConditionHandle(table, missionKey, key, whichDefeatcondition)
endfunction


function SaveTimerDialogHandleBJ takes timerdialog whichTimerdialog, integer key, integer missionKey, hashtable table returns boolean
 return SaveTimerDialogHandle(table, missionKey, key, whichTimerdialog)
endfunction


function SaveLeaderboardHandleBJ takes leaderboard whichLeaderboard, integer key, integer missionKey, hashtable table returns boolean
 return SaveLeaderboardHandle(table, missionKey, key, whichLeaderboard)
endfunction


function SaveMultiboardHandleBJ takes multiboard whichMultiboard, integer key, integer missionKey, hashtable table returns boolean
 return SaveMultiboardHandle(table, missionKey, key, whichMultiboard)
endfunction


function SaveMultiboardItemHandleBJ takes multiboarditem whichMultiboarditem, integer key, integer missionKey, hashtable table returns boolean
 return SaveMultiboardItemHandle(table, missionKey, key, whichMultiboarditem)
endfunction


function SaveTrackableHandleBJ takes trackable whichTrackable, integer key, integer missionKey, hashtable table returns boolean
 return SaveTrackableHandle(table, missionKey, key, whichTrackable)
endfunction


function SaveDialogHandleBJ takes dialog whichDialog, integer key, integer missionKey, hashtable table returns boolean
 return SaveDialogHandle(table, missionKey, key, whichDialog)
endfunction


function SaveButtonHandleBJ takes button whichButton, integer key, integer missionKey, hashtable table returns boolean
 return SaveButtonHandle(table, missionKey, key, whichButton)
endfunction


function SaveTextTagHandleBJ takes texttag whichTexttag, integer key, integer missionKey, hashtable table returns boolean
 return SaveTextTagHandle(table, missionKey, key, whichTexttag)
endfunction


function SaveLightningHandleBJ takes lightning whichLightning, integer key, integer missionKey, hashtable table returns boolean
 return SaveLightningHandle(table, missionKey, key, whichLightning)
endfunction


function SaveImageHandleBJ takes image whichImage, integer key, integer missionKey, hashtable table returns boolean
 return SaveImageHandle(table, missionKey, key, whichImage)
endfunction


function SaveUbersplatHandleBJ takes ubersplat whichUbersplat, integer key, integer missionKey, hashtable table returns boolean
 return SaveUbersplatHandle(table, missionKey, key, whichUbersplat)
endfunction


function SaveRegionHandleBJ takes region whichRegion, integer key, integer missionKey, hashtable table returns boolean
 return SaveRegionHandle(table, missionKey, key, whichRegion)
endfunction


function SaveFogStateHandleBJ takes fogstate whichFogState, integer key, integer missionKey, hashtable table returns boolean
 return SaveFogStateHandle(table, missionKey, key, whichFogState)
endfunction


function SaveFogModifierHandleBJ takes fogmodifier whichFogModifier, integer key, integer missionKey, hashtable table returns boolean
 return SaveFogModifierHandle(table, missionKey, key, whichFogModifier)
endfunction


function SaveAgentHandleBJ takes agent whichAgent, integer key, integer missionKey, hashtable table returns boolean
 return SaveAgentHandle(table, missionKey, key, whichAgent)
endfunction


function SaveHashtableHandleBJ takes hashtable whichHashtable, integer key, integer missionKey, hashtable table returns boolean
 return SaveHashtableHandle(table, missionKey, key, whichHashtable)
endfunction


function GetStoredRealBJ takes string key, string missionKey, gamecache cache returns real
 
 return GetStoredReal(cache, missionKey, key)
endfunction


function GetStoredIntegerBJ takes string key, string missionKey, gamecache cache returns integer
 
 return GetStoredInteger(cache, missionKey, key)
endfunction


function GetStoredBooleanBJ takes string key, string missionKey, gamecache cache returns boolean
 
 return GetStoredBoolean(cache, missionKey, key)
endfunction


function GetStoredStringBJ takes string key, string missionKey, gamecache cache returns string
 local string s

 
 set s = GetStoredString(cache, missionKey, key)
 if (s == null) then
 return ""
 else
 return s
 endif
endfunction


function LoadRealBJ takes integer key, integer missionKey, hashtable table returns real
 
 return LoadReal(table, missionKey, key)
endfunction


function LoadIntegerBJ takes integer key, integer missionKey, hashtable table returns integer
 
 return LoadInteger(table, missionKey, key)
endfunction


function LoadBooleanBJ takes integer key, integer missionKey, hashtable table returns boolean
 
 return LoadBoolean(table, missionKey, key)
endfunction


function LoadStringBJ takes integer key, integer missionKey, hashtable table returns string
 local string s

 
 set s = LoadStr(table, missionKey, key)
 if (s == null) then
 return ""
 else
 return s
 endif
endfunction


function LoadPlayerHandleBJ takes integer key, integer missionKey, hashtable table returns player
 return LoadPlayerHandle(table, missionKey, key)
endfunction


function LoadWidgetHandleBJ takes integer key, integer missionKey, hashtable table returns widget
 return LoadWidgetHandle(table, missionKey, key)
endfunction


function LoadDestructableHandleBJ takes integer key, integer missionKey, hashtable table returns destructable
 return LoadDestructableHandle(table, missionKey, key)
endfunction


function LoadItemHandleBJ takes integer key, integer missionKey, hashtable table returns item
 return LoadItemHandle(table, missionKey, key)
endfunction


function LoadUnitHandleBJ takes integer key, integer missionKey, hashtable table returns unit
 return LoadUnitHandle(table, missionKey, key)
endfunction


function LoadAbilityHandleBJ takes integer key, integer missionKey, hashtable table returns ability
 return LoadAbilityHandle(table, missionKey, key)
endfunction


function LoadTimerHandleBJ takes integer key, integer missionKey, hashtable table returns timer
 return LoadTimerHandle(table, missionKey, key)
endfunction


function LoadTriggerHandleBJ takes integer key, integer missionKey, hashtable table returns trigger
 return LoadTriggerHandle(table, missionKey, key)
endfunction


function LoadTriggerConditionHandleBJ takes integer key, integer missionKey, hashtable table returns triggercondition
 return LoadTriggerConditionHandle(table, missionKey, key)
endfunction


function LoadTriggerActionHandleBJ takes integer key, integer missionKey, hashtable table returns triggeraction
 return LoadTriggerActionHandle(table, missionKey, key)
endfunction


function LoadTriggerEventHandleBJ takes integer key, integer missionKey, hashtable table returns event
 return LoadTriggerEventHandle(table, missionKey, key)
endfunction


function LoadForceHandleBJ takes integer key, integer missionKey, hashtable table returns force
 return LoadForceHandle(table, missionKey, key)
endfunction


function LoadGroupHandleBJ takes integer key, integer missionKey, hashtable table returns group
 return LoadGroupHandle(table, missionKey, key)
endfunction


function LoadLocationHandleBJ takes integer key, integer missionKey, hashtable table returns location
 return LoadLocationHandle(table, missionKey, key)
endfunction


function LoadRectHandleBJ takes integer key, integer missionKey, hashtable table returns rect
 return LoadRectHandle(table, missionKey, key)
endfunction


function LoadBooleanExprHandleBJ takes integer key, integer missionKey, hashtable table returns boolexpr
 return LoadBooleanExprHandle(table, missionKey, key)
endfunction


function LoadSoundHandleBJ takes integer key, integer missionKey, hashtable table returns sound
 return LoadSoundHandle(table, missionKey, key)
endfunction


function LoadEffectHandleBJ takes integer key, integer missionKey, hashtable table returns effect
 return LoadEffectHandle(table, missionKey, key)
endfunction


function LoadUnitPoolHandleBJ takes integer key, integer missionKey, hashtable table returns unitpool
 return LoadUnitPoolHandle(table, missionKey, key)
endfunction


function LoadItemPoolHandleBJ takes integer key, integer missionKey, hashtable table returns itempool
 return LoadItemPoolHandle(table, missionKey, key)
endfunction


function LoadQuestHandleBJ takes integer key, integer missionKey, hashtable table returns quest
 return LoadQuestHandle(table, missionKey, key)
endfunction


function LoadQuestItemHandleBJ takes integer key, integer missionKey, hashtable table returns questitem
 return LoadQuestItemHandle(table, missionKey, key)
endfunction


function LoadDefeatConditionHandleBJ takes integer key, integer missionKey, hashtable table returns defeatcondition
 return LoadDefeatConditionHandle(table, missionKey, key)
endfunction


function LoadTimerDialogHandleBJ takes integer key, integer missionKey, hashtable table returns timerdialog
 return LoadTimerDialogHandle(table, missionKey, key)
endfunction


function LoadLeaderboardHandleBJ takes integer key, integer missionKey, hashtable table returns leaderboard
 return LoadLeaderboardHandle(table, missionKey, key)
endfunction


function LoadMultiboardHandleBJ takes integer key, integer missionKey, hashtable table returns multiboard
 return LoadMultiboardHandle(table, missionKey, key)
endfunction


function LoadMultiboardItemHandleBJ takes integer key, integer missionKey, hashtable table returns multiboarditem
 return LoadMultiboardItemHandle(table, missionKey, key)
endfunction


function LoadTrackableHandleBJ takes integer key, integer missionKey, hashtable table returns trackable
 return LoadTrackableHandle(table, missionKey, key)
endfunction


function LoadDialogHandleBJ takes integer key, integer missionKey, hashtable table returns dialog
 return LoadDialogHandle(table, missionKey, key)
endfunction


function LoadButtonHandleBJ takes integer key, integer missionKey, hashtable table returns button
 return LoadButtonHandle(table, missionKey, key)
endfunction


function LoadTextTagHandleBJ takes integer key, integer missionKey, hashtable table returns texttag
 return LoadTextTagHandle(table, missionKey, key)
endfunction


function LoadLightningHandleBJ takes integer key, integer missionKey, hashtable table returns lightning
 return LoadLightningHandle(table, missionKey, key)
endfunction


function LoadImageHandleBJ takes integer key, integer missionKey, hashtable table returns image
 return LoadImageHandle(table, missionKey, key)
endfunction


function LoadUbersplatHandleBJ takes integer key, integer missionKey, hashtable table returns ubersplat
 return LoadUbersplatHandle(table, missionKey, key)
endfunction


function LoadRegionHandleBJ takes integer key, integer missionKey, hashtable table returns region
 return LoadRegionHandle(table, missionKey, key)
endfunction


function LoadFogStateHandleBJ takes integer key, integer missionKey, hashtable table returns fogstate
 return LoadFogStateHandle(table, missionKey, key)
endfunction


function LoadFogModifierHandleBJ takes integer key, integer missionKey, hashtable table returns fogmodifier
 return LoadFogModifierHandle(table, missionKey, key)
endfunction


function LoadHashtableHandleBJ takes integer key, integer missionKey, hashtable table returns hashtable
 return LoadHashtableHandle(table, missionKey, key)
endfunction


function RestoreUnitLocFacingAngleBJ takes string key, string missionKey, gamecache cache, player forWhichPlayer, location loc, real facing returns unit
 
 set bj_lastLoadedUnit = RestoreUnit(cache, missionKey, key, forWhichPlayer, GetLocationX(loc), GetLocationY(loc), facing)
 return bj_lastLoadedUnit
endfunction


function RestoreUnitLocFacingPointBJ takes string key, string missionKey, gamecache cache, player forWhichPlayer, location loc, location lookAt returns unit
 
 return RestoreUnitLocFacingAngleBJ(key, missionKey, cache, forWhichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction


function GetLastRestoredUnitBJ takes nothing returns unit
 return bj_lastLoadedUnit
endfunction


function FlushGameCacheBJ takes gamecache cache returns nothing
 call FlushGameCache(cache)
endfunction


function FlushStoredMissionBJ takes string missionKey, gamecache cache returns nothing
 call FlushStoredMission(cache, missionKey)
endfunction


function FlushParentHashtableBJ takes hashtable table returns nothing
 call FlushParentHashtable(table)
endfunction


function FlushChildHashtableBJ takes integer missionKey, hashtable table returns nothing
 call FlushChildHashtable(table, missionKey)
endfunction


function HaveStoredValue takes string key, integer valueType, string missionKey, gamecache cache returns boolean
 if (valueType == bj_GAMECACHE_BOOLEAN) then
 return HaveStoredBoolean(cache, missionKey, key)
 elseif (valueType == bj_GAMECACHE_INTEGER) then
 return HaveStoredInteger(cache, missionKey, key)
 elseif (valueType == bj_GAMECACHE_REAL) then
 return HaveStoredReal(cache, missionKey, key)
 elseif (valueType == bj_GAMECACHE_UNIT) then
 return HaveStoredUnit(cache, missionKey, key)
 elseif (valueType == bj_GAMECACHE_STRING) then
 return HaveStoredString(cache, missionKey, key)
 else
 
 return false
 endif
endfunction


function HaveSavedValue takes integer key, integer valueType, integer missionKey, hashtable table returns boolean
 if (valueType == bj_HASHTABLE_BOOLEAN) then
 return HaveSavedBoolean(table, missionKey, key)
 elseif (valueType == bj_HASHTABLE_INTEGER) then
 return HaveSavedInteger(table, missionKey, key)
 elseif (valueType == bj_HASHTABLE_REAL) then
 return HaveSavedReal(table, missionKey, key)
 elseif (valueType == bj_HASHTABLE_STRING) then
 return HaveSavedString(table, missionKey, key)
 elseif (valueType == bj_HASHTABLE_HANDLE) then
 return HaveSavedHandle(table, missionKey, key)
 else
 
 return false
 endif
endfunction


function ShowCustomCampaignButton takes boolean show, integer whichButton returns nothing
 call SetCustomCampaignButtonVisible(whichButton - 1, show)
endfunction


function IsCustomCampaignButtonVisibile takes integer whichButton returns boolean
 return GetCustomCampaignButtonVisible(whichButton - 1)
endfunction


function LoadGameBJ takes string loadFileName, boolean doScoreScreen returns nothing
 call LoadGame(loadFileName, doScoreScreen)
endfunction


function SaveAndChangeLevelBJ takes string saveFileName, string newLevel, boolean doScoreScreen returns nothing
 call SaveGame(saveFileName)
 call ChangeLevel(newLevel, doScoreScreen)
endfunction


function SaveAndLoadGameBJ takes string saveFileName, string loadFileName, boolean doScoreScreen returns nothing
 call SaveGame(saveFileName)
 call LoadGame(loadFileName, doScoreScreen)
endfunction


function RenameSaveDirectoryBJ takes string sourceDirName, string destDirName returns boolean
 return RenameSaveDirectory(sourceDirName, destDirName)
endfunction


function RemoveSaveDirectoryBJ takes string sourceDirName returns boolean
 return RemoveSaveDirectory(sourceDirName)
endfunction


function CopySaveGameBJ takes string sourceSaveName, string destSaveName returns boolean
 return CopySaveGame(sourceSaveName, destSaveName)
endfunction







function GetPlayerStartLocationX takes player whichPlayer returns real
 return GetStartLocationX(GetPlayerStartLocation(whichPlayer))
endfunction


function GetPlayerStartLocationY takes player whichPlayer returns real
 return GetStartLocationY(GetPlayerStartLocation(whichPlayer))
endfunction


function GetPlayerStartLocationLoc takes player whichPlayer returns location
 return GetStartLocationLoc(GetPlayerStartLocation(whichPlayer))
endfunction


function GetRectCenter takes rect whichRect returns location
 return Location(GetRectCenterX(whichRect), GetRectCenterY(whichRect))
endfunction


function IsPlayerSlotState takes player whichPlayer, playerslotstate whichState returns boolean
 return GetPlayerSlotState(whichPlayer) == whichState
endfunction


function GetFadeFromSeconds takes real seconds returns integer
 if (seconds != 0) then
 return 128 / R2I(seconds)
 endif
 return 10000
endfunction


function GetFadeFromSecondsAsReal takes real seconds returns real
 if (seconds != 0) then
 return 128.00 / seconds
 endif
 return 10000.00
endfunction


function AdjustPlayerStateSimpleBJ takes player whichPlayer, playerstate whichPlayerState, integer delta returns nothing
 call SetPlayerState(whichPlayer, whichPlayerState, GetPlayerState(whichPlayer, whichPlayerState) + delta)
endfunction


function AdjustPlayerStateBJ takes integer delta, player whichPlayer, playerstate whichPlayerState returns nothing
 
 
 if (delta > 0) then
 if (whichPlayerState == PLAYER_STATE_RESOURCE_GOLD) then
 call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_GOLD_GATHERED, delta)
 elseif (whichPlayerState == PLAYER_STATE_RESOURCE_LUMBER) then
 call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_LUMBER_GATHERED, delta)
 endif
 endif

 call AdjustPlayerStateSimpleBJ(whichPlayer, whichPlayerState, delta)
endfunction


function SetPlayerStateBJ takes player whichPlayer, playerstate whichPlayerState, integer value returns nothing
 local integer oldValue = GetPlayerState(whichPlayer, whichPlayerState)
 call AdjustPlayerStateBJ(value - oldValue, whichPlayer, whichPlayerState)
endfunction


function SetPlayerFlagBJ takes playerstate whichPlayerFlag, boolean flag, player whichPlayer returns nothing
 call SetPlayerState(whichPlayer, whichPlayerFlag, IntegerTertiaryOp(flag, 1, 0))
endfunction


function SetPlayerTaxRateBJ takes integer rate, playerstate whichResource, player sourcePlayer, player otherPlayer returns nothing
 call SetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource, rate)
endfunction


function GetPlayerTaxRateBJ takes playerstate whichResource, player sourcePlayer, player otherPlayer returns integer
 return GetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource)
endfunction


function IsPlayerFlagSetBJ takes playerstate whichPlayerFlag, player whichPlayer returns boolean
 return GetPlayerState(whichPlayer, whichPlayerFlag) == 1
endfunction


function AddResourceAmountBJ takes integer delta, unit whichUnit returns nothing
 call AddResourceAmount(whichUnit, delta)
endfunction


function GetConvertedPlayerId takes player whichPlayer returns integer
 return GetPlayerId(whichPlayer) + 1
endfunction


function ConvertedPlayer takes integer convertedPlayerId returns player
 return Player(convertedPlayerId - 1)
endfunction


function GetRectWidthBJ takes rect r returns real
 return GetRectMaxX(r) - GetRectMinX(r)
endfunction


function GetRectHeightBJ takes rect r returns real
 return GetRectMaxY(r) - GetRectMinY(r)
endfunction




function BlightGoldMineForPlayerBJ takes unit goldMine, player whichPlayer returns unit
 local real mineX
 local real mineY
 local integer mineGold
 local unit newMine

 
 if GetUnitTypeId(goldMine) != 'ngol' then
 return null
 endif

 
 set mineX = GetUnitX(goldMine)
 set mineY = GetUnitY(goldMine)
 set mineGold = GetResourceAmount(goldMine)
 call RemoveUnit(goldMine)

 
 set newMine = CreateBlightedGoldmine(whichPlayer, mineX, mineY, bj_UNIT_FACING)
 call SetResourceAmount(newMine, mineGold)
 return newMine
endfunction


function BlightGoldMineForPlayer takes unit goldMine, player whichPlayer returns unit
 set bj_lastHauntedGoldMine = BlightGoldMineForPlayerBJ(goldMine, whichPlayer)
 return bj_lastHauntedGoldMine
endfunction


function GetLastHauntedGoldMine takes nothing returns unit
 return bj_lastHauntedGoldMine
endfunction


function IsPointBlightedBJ takes location where returns boolean
 return IsPointBlighted(GetLocationX(where), GetLocationY(where))
endfunction


function SetPlayerColorBJEnum takes nothing returns nothing
 call SetUnitColor(GetEnumUnit(), bj_setPlayerTargetColor)
endfunction


function SetPlayerColorBJ takes player whichPlayer, playercolor color, boolean changeExisting returns nothing
 local group g

 call SetPlayerColor(whichPlayer, color)
 if changeExisting then
 set bj_setPlayerTargetColor = color
 set g = CreateGroup()
 call GroupEnumUnitsOfPlayer(g, whichPlayer, null)
 call ForGroup(g, function SetPlayerColorBJEnum)
 call DestroyGroup(g)
 endif
endfunction


function SetPlayerUnitAvailableBJ takes integer unitId, boolean allowed, player whichPlayer returns nothing
 if allowed then
 call SetPlayerTechMaxAllowed(whichPlayer, unitId, -1)
 else
 call SetPlayerTechMaxAllowed(whichPlayer, unitId, 0)
 endif
endfunction


function LockGameSpeedBJ takes nothing returns nothing
 call SetMapFlag(MAP_LOCK_SPEED, true)
endfunction


function UnlockGameSpeedBJ takes nothing returns nothing
 call SetMapFlag(MAP_LOCK_SPEED, false)
endfunction


function IssueTargetOrderBJ takes unit whichUnit, string order, widget targetWidget returns boolean
 return IssueTargetOrder( whichUnit, order, targetWidget )
endfunction


function IssuePointOrderLocBJ takes unit whichUnit, string order, location whichLocation returns boolean
 return IssuePointOrderLoc( whichUnit, order, whichLocation )
endfunction





function IssueTargetDestructableOrder takes unit whichUnit, string order, widget targetWidget returns boolean
 return IssueTargetOrder( whichUnit, order, targetWidget )
endfunction

function IssueTargetItemOrder takes unit whichUnit, string order, widget targetWidget returns boolean
 return IssueTargetOrder( whichUnit, order, targetWidget )
endfunction


function IssueImmediateOrderBJ takes unit whichUnit, string order returns boolean
 return IssueImmediateOrder( whichUnit, order )
endfunction


function GroupTargetOrderBJ takes group whichGroup, string order, widget targetWidget returns boolean
 return GroupTargetOrder( whichGroup, order, targetWidget )
endfunction


function GroupPointOrderLocBJ takes group whichGroup, string order, location whichLocation returns boolean
 return GroupPointOrderLoc( whichGroup, order, whichLocation )
endfunction


function GroupImmediateOrderBJ takes group whichGroup, string order returns boolean
 return GroupImmediateOrder( whichGroup, order )
endfunction





function GroupTargetDestructableOrder takes group whichGroup, string order, widget targetWidget returns boolean
 return GroupTargetOrder( whichGroup, order, targetWidget )
endfunction

function GroupTargetItemOrder takes group whichGroup, string order, widget targetWidget returns boolean
 return GroupTargetOrder( whichGroup, order, targetWidget )
endfunction


function GetDyingDestructable takes nothing returns destructable
 return GetTriggerDestructable()
endfunction




function SetUnitRallyPoint takes unit whichUnit, location targPos returns nothing
 call IssuePointOrderLocBJ(whichUnit, "setrally", targPos)
endfunction


function SetUnitRallyUnit takes unit whichUnit, unit targUnit returns nothing
 call IssueTargetOrder(whichUnit, "setrally", targUnit)
endfunction


function SetUnitRallyDestructable takes unit whichUnit, destructable targDest returns nothing
 call IssueTargetOrder(whichUnit, "setrally", targDest)
endfunction






function SaveDyingWidget takes nothing returns nothing
 set bj_lastDyingWidget = GetTriggerWidget()
endfunction


function SetBlightRectBJ takes boolean addBlight, player whichPlayer, rect r returns nothing
 call SetBlightRect(whichPlayer, r, addBlight)
endfunction


function SetBlightRadiusLocBJ takes boolean addBlight, player whichPlayer, location loc, real radius returns nothing
 call SetBlightLoc(whichPlayer, loc, radius, addBlight)
endfunction


function GetAbilityName takes integer abilcode returns string
 return GetObjectName(abilcode)
endfunction







function MeleeStartingVisibility takes nothing returns nothing
 
 call SetFloatGameState(GAME_STATE_TIME_OF_DAY, bj_MELEE_STARTING_TOD)

 
 
endfunction







function MeleeStartingResources takes nothing returns nothing
 local integer index
 local player indexPlayer
 local version v
 local integer startingGold
 local integer startingLumber

 set v = VersionGet()
 if (v == VERSION_REIGN_OF_CHAOS) then
 set startingGold = bj_MELEE_STARTING_GOLD_V0
 set startingLumber = bj_MELEE_STARTING_LUMBER_V0
 else
 set startingGold = bj_MELEE_STARTING_GOLD_V1
 set startingLumber = bj_MELEE_STARTING_LUMBER_V1
 endif

 
 set index = 0
 loop
 set indexPlayer = Player(index)
 if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
 call SetPlayerState(indexPlayer, PLAYER_STATE_RESOURCE_GOLD, startingGold)
 call SetPlayerState(indexPlayer, PLAYER_STATE_RESOURCE_LUMBER, startingLumber)
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction







function ReducePlayerTechMaxAllowed takes player whichPlayer, integer techId, integer limit returns nothing
 local integer oldMax = GetPlayerTechMaxAllowed(whichPlayer, techId)

 
 if (oldMax < 0 or oldMax > limit) then
 call SetPlayerTechMaxAllowed(whichPlayer, techId, limit)
 endif
endfunction


function MeleeStartingHeroLimit takes nothing returns nothing
 local integer index

 set index = 0
 loop
 
 call SetPlayerMaxHeroesAllowed(bj_MELEE_HERO_LIMIT, Player(index))

 
 call ReducePlayerTechMaxAllowed(Player(index), 'Hamg', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Hmkg', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Hpal', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Hblm', bj_MELEE_HERO_TYPE_LIMIT)

 call ReducePlayerTechMaxAllowed(Player(index), 'Obla', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ofar', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Otch', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Oshd', bj_MELEE_HERO_TYPE_LIMIT)

 call ReducePlayerTechMaxAllowed(Player(index), 'Edem', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ekee', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Emoo', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ewar', bj_MELEE_HERO_TYPE_LIMIT)

 call ReducePlayerTechMaxAllowed(Player(index), 'Udea', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Udre', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ulic', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ucrl', bj_MELEE_HERO_TYPE_LIMIT)

 call ReducePlayerTechMaxAllowed(Player(index), 'Npbm', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nbrn', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nngs', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nplh', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nbst', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nalc', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Ntin', bj_MELEE_HERO_TYPE_LIMIT)
 call ReducePlayerTechMaxAllowed(Player(index), 'Nfir', bj_MELEE_HERO_TYPE_LIMIT)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction







function MeleeTrainedUnitIsHeroBJFilter takes nothing returns boolean
 return IsUnitType(GetFilterUnit(), UNIT_TYPE_HERO)
endfunction






function MeleeGrantItemsToHero takes unit whichUnit returns nothing
 local integer owner = GetPlayerId(GetOwningPlayer(whichUnit))

 
 if (bj_meleeTwinkedHeroes[owner] < bj_MELEE_MAX_TWINKED_HEROES) then
 call UnitAddItemById(whichUnit, 'stwp')
 set bj_meleeTwinkedHeroes[owner] = bj_meleeTwinkedHeroes[owner] + 1
 endif
endfunction


function MeleeGrantItemsToTrainedHero takes nothing returns nothing
 call MeleeGrantItemsToHero(GetTrainedUnit())
endfunction


function MeleeGrantItemsToHiredHero takes nothing returns nothing
 call MeleeGrantItemsToHero(GetSoldUnit())
endfunction


function MeleeGrantHeroItems takes nothing returns nothing
 local integer index
 local trigger trig

 
 set index = 0
 loop
 set bj_meleeTwinkedHeroes[index] = 0

 set index = index + 1
 exitwhen index == bj_MAX_PLAYER_SLOTS
 endloop

 
 
 set index = 0
 loop
 set trig = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(trig, Player(index), EVENT_PLAYER_UNIT_TRAIN_FINISH, filterMeleeTrainedUnitIsHeroBJ)
 call TriggerAddAction(trig, function MeleeGrantItemsToTrainedHero)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 
 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(trig, Player(PLAYER_NEUTRAL_PASSIVE), EVENT_PLAYER_UNIT_SELL, filterMeleeTrainedUnitIsHeroBJ)
 call TriggerAddAction(trig, function MeleeGrantItemsToHiredHero)

 
 
 set bj_meleeGrantHeroItems = true
endfunction







function MeleeClearExcessUnit takes nothing returns nothing
 local unit theUnit = GetEnumUnit()
 local integer owner = GetPlayerId(GetOwningPlayer(theUnit))

 if (owner == PLAYER_NEUTRAL_AGGRESSIVE) then
 
 call RemoveUnit(GetEnumUnit())
 elseif (owner == PLAYER_NEUTRAL_PASSIVE) then
 
 if not IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
 call RemoveUnit(GetEnumUnit())
 endif
 endif
endfunction


function MeleeClearNearbyUnits takes real x, real y, real range returns nothing
 local group nearbyUnits
 set nearbyUnits = CreateGroup()
 call GroupEnumUnitsInRange(nearbyUnits, x, y, range, null)
 call ForGroup(nearbyUnits, function MeleeClearExcessUnit)
 call DestroyGroup(nearbyUnits)
endfunction


function MeleeClearExcessUnits takes nothing returns nothing
 local integer index
 local real locX
 local real locY
 local player indexPlayer

 set index = 0
 loop
 set indexPlayer = Player(index)

 
 if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
 set locX = GetStartLocationX(GetPlayerStartLocation(indexPlayer))
 set locY = GetStartLocationY(GetPlayerStartLocation(indexPlayer))

 call MeleeClearNearbyUnits(locX, locY, bj_MELEE_CLEAR_UNITS_RADIUS)
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction







function MeleeEnumFindNearestMine takes nothing returns nothing
 local unit enumUnit = GetEnumUnit()
 local real dist
 local location unitLoc

 if (GetUnitTypeId(enumUnit) == 'ngol') then
 set unitLoc = GetUnitLoc(enumUnit)
 set dist = DistanceBetweenPoints(unitLoc, bj_meleeNearestMineToLoc)
 call RemoveLocation(unitLoc)

 
 if (bj_meleeNearestMineDist < 0) or (dist < bj_meleeNearestMineDist) then
 set bj_meleeNearestMine = enumUnit
 set bj_meleeNearestMineDist = dist
 endif
 endif
endfunction


function MeleeFindNearestMine takes location src, real range returns unit
 local group nearbyMines

 set bj_meleeNearestMine = null
 set bj_meleeNearestMineDist = -1
 set bj_meleeNearestMineToLoc = src

 set nearbyMines = CreateGroup()
 call GroupEnumUnitsInRangeOfLoc(nearbyMines, src, range, null)
 call ForGroup(nearbyMines, function MeleeEnumFindNearestMine)
 call DestroyGroup(nearbyMines)

 return bj_meleeNearestMine
endfunction


function MeleeRandomHeroLoc takes player p, integer id1, integer id2, integer id3, integer id4, location loc returns unit
 local unit hero = null
 local integer roll
 local integer pick
 local version v

 
 set v = VersionGet()
 if (v == VERSION_REIGN_OF_CHAOS) then
 set roll = GetRandomInt(1,3)
 else
 set roll = GetRandomInt(1,4)
 endif

 
 if roll == 1 then
 set pick = id1
 elseif roll == 2 then
 set pick = id2
 elseif roll == 3 then
 set pick = id3
 elseif roll == 4 then
 set pick = id4
 else
 
 set pick = id1
 endif

 
 set hero = CreateUnitAtLoc(p, pick, loc, bj_UNIT_FACING)
 if bj_meleeGrantHeroItems then
 call MeleeGrantItemsToHero(hero)
 endif
 return hero
endfunction




function MeleeGetProjectedLoc takes location src, location targ, real distance, real deltaAngle returns location
 local real srcX = GetLocationX(src)
 local real srcY = GetLocationY(src)
 local real direction = Atan2(GetLocationY(targ) - srcY, GetLocationX(targ) - srcX) + deltaAngle
 return Location(srcX + distance * Cos(direction), srcY + distance * Sin(direction))
endfunction


function MeleeGetNearestValueWithin takes real val, real minVal, real maxVal returns real
 if (val < minVal) then
 return minVal
 elseif (val > maxVal) then
 return maxVal
 else
 return val
 endif
endfunction


function MeleeGetLocWithinRect takes location src, rect r returns location
 local real withinX = MeleeGetNearestValueWithin(GetLocationX(src), GetRectMinX(r), GetRectMaxX(r))
 local real withinY = MeleeGetNearestValueWithin(GetLocationY(src), GetRectMinY(r), GetRectMaxY(r))
 return Location(withinX, withinY)
endfunction






function MeleeStartingUnitsHuman takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
 local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
 local real unitSpacing = 64.00
 local unit nearestMine
 local location nearMineLoc
 local location heroLoc
 local real peonX
 local real peonY
 local unit townHall = null

 if (doPreload) then
 call Preloader( "scripts\\HumanMelee.pld" )
 endif

 set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
 if (nearestMine != null) then
 
 set townHall = CreateUnitAtLoc(whichPlayer, 'htow', startLoc, bj_UNIT_FACING)
 
 set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
 set peonX = GetLocationX(nearMineLoc)
 set peonY = GetLocationY(nearMineLoc)
 call CreateUnit(whichPlayer, 'hpea', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX + 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX - 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
 else
 
 set townHall = CreateUnitAtLoc(whichPlayer, 'htow', startLoc, bj_UNIT_FACING)
 
 set peonX = GetLocationX(startLoc)
 set peonY = GetLocationY(startLoc) - 224.00
 call CreateUnit(whichPlayer, 'hpea', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'hpea', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
 endif

 if (townHall != null) then
 call UnitAddAbilityBJ('Amic', townHall)
 call UnitMakeAbilityPermanentBJ(true, 'Amic', townHall)
 endif

 if (doHeroes) then
 
 
 if useRandomHero then
 call MeleeRandomHeroLoc(whichPlayer, 'Hamg', 'Hmkg', 'Hpal', 'Hblm', heroLoc)
 else
 call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
 endif
 endif

 if (doCamera) then
 
 call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
 call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
 endif
endfunction






function MeleeStartingUnitsOrc takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
 local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
 local real unitSpacing = 64.00
 local unit nearestMine
 local location nearMineLoc
 local location heroLoc
 local real peonX
 local real peonY

 if (doPreload) then
 call Preloader( "scripts\\OrcMelee.pld" )
 endif

 set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
 if (nearestMine != null) then
 
 call CreateUnitAtLoc(whichPlayer, 'ogre', startLoc, bj_UNIT_FACING)
 
 set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
 set peonX = GetLocationX(nearMineLoc)
 set peonY = GetLocationY(nearMineLoc)
 call CreateUnit(whichPlayer, 'opeo', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX + 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX - 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
 else
 
 call CreateUnitAtLoc(whichPlayer, 'ogre', startLoc, bj_UNIT_FACING)
 
 set peonX = GetLocationX(startLoc)
 set peonY = GetLocationY(startLoc) - 224.00
 call CreateUnit(whichPlayer, 'opeo', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'opeo', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
 endif

 if (doHeroes) then
 
 
 if useRandomHero then
 call MeleeRandomHeroLoc(whichPlayer, 'Obla', 'Ofar', 'Otch', 'Oshd', heroLoc)
 else
 call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
 endif
 endif

 if (doCamera) then
 
 call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
 call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
 endif
endfunction









function MeleeStartingUnitsUndead takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
 local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
 local real unitSpacing = 64.00
 local unit nearestMine
 local location nearMineLoc
 local location nearTownLoc
 local location heroLoc
 local real peonX
 local real peonY
 local real ghoulX
 local real ghoulY

 if (doPreload) then
 call Preloader( "scripts\\UndeadMelee.pld" )
 endif

 set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
 if (nearestMine != null) then
 
 call CreateUnitAtLoc(whichPlayer, 'unpl', startLoc, bj_UNIT_FACING)
 
 set nearestMine = BlightGoldMineForPlayerBJ(nearestMine, whichPlayer)

 
 set nearTownLoc = MeleeGetProjectedLoc(startLoc, GetUnitLoc(nearestMine), 288, 0)
 set ghoulX = GetLocationX(nearTownLoc)
 set ghoulY = GetLocationY(nearTownLoc)
 set bj_ghoul[GetPlayerId(whichPlayer)] = CreateUnit(whichPlayer, 'ugho', ghoulX + 0.00 * unitSpacing, ghoulY + 0.00 * unitSpacing, bj_UNIT_FACING)

 
 set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
 set peonX = GetLocationX(nearMineLoc)
 set peonY = GetLocationY(nearMineLoc)
 call CreateUnit(whichPlayer, 'uaco', peonX + 0.00 * unitSpacing, peonY + 0.50 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'uaco', peonX + 0.65 * unitSpacing, peonY - 0.50 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'uaco', peonX - 0.65 * unitSpacing, peonY - 0.50 * unitSpacing, bj_UNIT_FACING)

 
 call SetBlightLoc(whichPlayer,nearMineLoc, 768, true)

 
 set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
 else
 
 call CreateUnitAtLoc(whichPlayer, 'unpl', startLoc, bj_UNIT_FACING)
 
 set peonX = GetLocationX(startLoc)
 set peonY = GetLocationY(startLoc) - 224.00
 call CreateUnit(whichPlayer, 'uaco', peonX - 1.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'uaco', peonX - 0.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'uaco', peonX + 0.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ugho', peonX + 1.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

 
 call SetBlightLoc(whichPlayer,startLoc, 768, true)

 
 set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
 endif

 if (doHeroes) then
 
 
 if useRandomHero then
 call MeleeRandomHeroLoc(whichPlayer, 'Udea', 'Udre', 'Ulic', 'Ucrl', heroLoc)
 else
 call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
 endif
 endif

 if (doCamera) then
 
 call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
 call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
 endif
endfunction






function MeleeStartingUnitsNightElf takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
 local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
 local real unitSpacing = 64.00
 local real minTreeDist = 3.50 * bj_CELLWIDTH
 local real minWispDist = 1.75 * bj_CELLWIDTH
 local unit nearestMine
 local location nearMineLoc
 local location wispLoc
 local location heroLoc
 local real peonX
 local real peonY
 local unit tree

 if (doPreload) then
 call Preloader( "scripts\\NightElfMelee.pld" )
 endif

 set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
 if (nearestMine != null) then
 
 
 
 set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 650, 0)
 set nearMineLoc = MeleeGetLocWithinRect(nearMineLoc, GetRectFromCircleBJ(GetUnitLoc(nearestMine), minTreeDist))
 set tree = CreateUnitAtLoc(whichPlayer, 'etol', nearMineLoc, bj_UNIT_FACING)
 call IssueTargetOrder(tree, "entangleinstant", nearestMine)

 
 set wispLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
 set wispLoc = MeleeGetLocWithinRect(wispLoc, GetRectFromCircleBJ(GetUnitLoc(nearestMine), minWispDist))
 set peonX = GetLocationX(wispLoc)
 set peonY = GetLocationY(wispLoc)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 0.58 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX - 0.58 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
 else
 
 call CreateUnitAtLoc(whichPlayer, 'etol', startLoc, bj_UNIT_FACING)

 
 set peonX = GetLocationX(startLoc)
 set peonY = GetLocationY(startLoc) - 224.00
 call CreateUnit(whichPlayer, 'ewsp', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
 call CreateUnit(whichPlayer, 'ewsp', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

 
 set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
 endif

 if (doHeroes) then
 
 
 if useRandomHero then
 call MeleeRandomHeroLoc(whichPlayer, 'Edem', 'Ekee', 'Emoo', 'Ewar', heroLoc)
 else
 call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
 endif
 endif

 if (doCamera) then
 
 call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
 call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
 endif
endfunction





function MeleeStartingUnitsUnknownRace takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
 local integer index

 if (doPreload) then
 endif

 set index = 0
 loop
 call CreateUnit(whichPlayer, 'nshe', GetLocationX(startLoc) + GetRandomReal(-256, 256), GetLocationY(startLoc) + GetRandomReal(-256, 256), GetRandomReal(0, 360))
 set index = index + 1
 exitwhen index == 12
 endloop

 if (doHeroes) then
 
 call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
 endif

 if (doCamera) then
 
 call SetCameraPositionLocForPlayer(whichPlayer, startLoc)
 call SetCameraQuickPositionLocForPlayer(whichPlayer, startLoc)
 endif
endfunction


function MeleeStartingUnits takes nothing returns nothing
 local integer index
 local player indexPlayer
 local location indexStartLoc
 local race indexRace

 call Preloader( "scripts\\SharedMelee.pld" )

 set index = 0
 loop
 set indexPlayer = Player(index)
 if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
 set indexStartLoc = GetStartLocationLoc(GetPlayerStartLocation(indexPlayer))
 set indexRace = GetPlayerRace(indexPlayer)

 
 if (indexRace == RACE_HUMAN) then
 call MeleeStartingUnitsHuman(indexPlayer, indexStartLoc, true, true, true)
 elseif (indexRace == RACE_ORC) then
 call MeleeStartingUnitsOrc(indexPlayer, indexStartLoc, true, true, true)
 elseif (indexRace == RACE_UNDEAD) then
 call MeleeStartingUnitsUndead(indexPlayer, indexStartLoc, true, true, true)
 elseif (indexRace == RACE_NIGHTELF) then
 call MeleeStartingUnitsNightElf(indexPlayer, indexStartLoc, true, true, true)
 else
 call MeleeStartingUnitsUnknownRace(indexPlayer, indexStartLoc, true, true, true)
 endif
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction


function MeleeStartingUnitsForPlayer takes race whichRace, player whichPlayer, location loc, boolean doHeroes returns nothing
 
 if (whichRace == RACE_HUMAN) then
 call MeleeStartingUnitsHuman(whichPlayer, loc, doHeroes, false, false)
 elseif (whichRace == RACE_ORC) then
 call MeleeStartingUnitsOrc(whichPlayer, loc, doHeroes, false, false)
 elseif (whichRace == RACE_UNDEAD) then
 call MeleeStartingUnitsUndead(whichPlayer, loc, doHeroes, false, false)
 elseif (whichRace == RACE_NIGHTELF) then
 call MeleeStartingUnitsNightElf(whichPlayer, loc, doHeroes, false, false)
 else
 
 endif
endfunction







function PickMeleeAI takes player num, string s1, string s2, string s3 returns nothing
 local integer pick

 
 
 
 if GetAIDifficulty(num) == AI_DIFFICULTY_NEWBIE then
 call StartMeleeAI(num,s1)
 return
 endif

 if s2 == null then
 set pick = 1
 elseif s3 == null then
 set pick = GetRandomInt(1,2)
 else
 set pick = GetRandomInt(1,3)
 endif

 if pick == 1 then
 call StartMeleeAI(num,s1)
 elseif pick == 2 then
 call StartMeleeAI(num,s2)
 else
 call StartMeleeAI(num,s3)
 endif
endfunction


function MeleeStartingAI takes nothing returns nothing
 local integer index
 local player indexPlayer
 local race indexRace

 set index = 0
 loop
 set indexPlayer = Player(index)
 if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
 set indexRace = GetPlayerRace(indexPlayer)
 if (GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
 
 if (indexRace == RACE_HUMAN) then
 call PickMeleeAI(indexPlayer, "human.ai", null, null)
 elseif (indexRace == RACE_ORC) then
 call PickMeleeAI(indexPlayer, "orc.ai", null, null)
 elseif (indexRace == RACE_UNDEAD) then
 call PickMeleeAI(indexPlayer, "undead.ai", null, null)
 call RecycleGuardPosition(bj_ghoul[index])
 elseif (indexRace == RACE_NIGHTELF) then
 call PickMeleeAI(indexPlayer, "elf.ai", null, null)
 else
 
 endif
 call ShareEverythingWithTeamAI(indexPlayer)
 endif
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction

function LockGuardPosition takes unit targ returns nothing
 call SetUnitCreepGuard(targ,true)
endfunction







function MeleePlayerIsOpponent takes integer playerIndex, integer opponentIndex returns boolean
 local player thePlayer = Player(playerIndex)
 local player theOpponent = Player(opponentIndex)

 
 if (playerIndex == opponentIndex) then
 return false
 endif

 
 if (GetPlayerSlotState(theOpponent) != PLAYER_SLOT_STATE_PLAYING) then
 return false
 endif

 
 if (bj_meleeDefeated[opponentIndex]) then
 return false
 endif

 
 if GetPlayerAlliance(thePlayer, theOpponent, ALLIANCE_PASSIVE) then
 if GetPlayerAlliance(theOpponent, thePlayer, ALLIANCE_PASSIVE) then
 if (GetPlayerState(thePlayer, PLAYER_STATE_ALLIED_VICTORY) == 1) then
 if (GetPlayerState(theOpponent, PLAYER_STATE_ALLIED_VICTORY) == 1) then
 return false
 endif
 endif
 endif
 endif

 return true
endfunction




function MeleeGetAllyStructureCount takes player whichPlayer returns integer
 local integer playerIndex
 local integer buildingCount
 local player indexPlayer

 
 set buildingCount = 0
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)

 
 
 if (PlayersAreCoAllied(whichPlayer, indexPlayer)) then
 set buildingCount = buildingCount + GetPlayerStructureCount(indexPlayer, true)
 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 return buildingCount
endfunction




function MeleeGetAllyCount takes player whichPlayer returns integer
 local integer playerIndex
 local integer playerCount
 local player indexPlayer

 
 set playerCount = 0
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if PlayersAreCoAllied(whichPlayer, indexPlayer) and not bj_meleeDefeated[playerIndex] and (whichPlayer != indexPlayer) then
 set playerCount = playerCount + 1
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 return playerCount
endfunction







function MeleeGetAllyKeyStructureCount takes player whichPlayer returns integer
 local integer playerIndex
 local player indexPlayer
 local integer keyStructs

 
 set keyStructs = 0
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if (PlayersAreCoAllied(whichPlayer, indexPlayer)) then
 set keyStructs = keyStructs + GetPlayerTypedUnitCount(indexPlayer, "townhall", true, true)
 set keyStructs = keyStructs + GetPlayerTypedUnitCount(indexPlayer, "greathall", true, true)
 set keyStructs = keyStructs + GetPlayerTypedUnitCount(indexPlayer, "treeoflife", true, true)
 set keyStructs = keyStructs + GetPlayerTypedUnitCount(indexPlayer, "necropolis", true, true)
 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 return keyStructs
endfunction




function MeleeDoDrawEnum takes nothing returns nothing
 local player thePlayer = GetEnumPlayer()

 call CachePlayerHeroData(thePlayer)
 call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_TIE, false)
endfunction




function MeleeDoVictoryEnum takes nothing returns nothing
 local player thePlayer = GetEnumPlayer()
 local integer playerIndex = GetPlayerId(thePlayer)

 if (not bj_meleeVictoried[playerIndex]) then
 set bj_meleeVictoried[playerIndex] = true
 call CachePlayerHeroData(thePlayer)
 call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_VICTORY, false)
 endif
endfunction




function MeleeDoDefeat takes player whichPlayer returns nothing
 set bj_meleeDefeated[GetPlayerId(whichPlayer)] = true
 call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, false)
endfunction




function MeleeDoDefeatEnum takes nothing returns nothing
 local player thePlayer = GetEnumPlayer()

 
 call CachePlayerHeroData(thePlayer)
 call MakeUnitsPassiveForTeam(thePlayer)
 call MeleeDoDefeat(thePlayer)
endfunction




function MeleeDoLeave takes player whichPlayer returns nothing
 if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
 call GameOverDialogBJ( whichPlayer, true )
 else
 set bj_meleeDefeated[GetPlayerId(whichPlayer)] = true
 call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, true)
 endif
endfunction




function MeleeRemoveObservers takes nothing returns nothing
 local integer playerIndex
 local player indexPlayer

 
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)

 if (IsPlayerObserver(indexPlayer)) then
 call RemovePlayerPreserveUnitsBJ(indexPlayer, PLAYER_GAME_RESULT_NEUTRAL, false)
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
endfunction







function MeleeCheckForVictors takes nothing returns force
 local integer playerIndex
 local integer opponentIndex
 local force opponentlessPlayers = CreateForce()
 local boolean gameOver = false

 
 set playerIndex = 0
 loop
 if (not bj_meleeDefeated[playerIndex]) then
 
 set opponentIndex = 0
 loop
 
 if MeleePlayerIsOpponent(playerIndex, opponentIndex) then
 return CreateForce()
 endif

 set opponentIndex = opponentIndex + 1
 exitwhen opponentIndex == bj_MAX_PLAYERS
 endloop

 
 
 call ForceAddPlayer(opponentlessPlayers, Player(playerIndex))
 set gameOver = true
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 
 set bj_meleeGameOver = gameOver

 return opponentlessPlayers
endfunction




function MeleeCheckForLosersAndVictors takes nothing returns nothing
 local integer playerIndex
 local player indexPlayer
 local force defeatedPlayers = CreateForce()
 local force victoriousPlayers
 local boolean gameOver = false

 
 if (bj_meleeGameOver) then
 return
 endif

 
 
 
 if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
 set bj_meleeGameOver = true
 return
 endif

 
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)

 if (not bj_meleeDefeated[playerIndex] and not bj_meleeVictoried[playerIndex]) then
 
 if (MeleeGetAllyStructureCount(indexPlayer) <= 0) then

 
 
 call ForceAddPlayer(defeatedPlayers, Player(playerIndex))

 
 
 set bj_meleeDefeated[playerIndex] = true
 endif
 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 
 set victoriousPlayers = MeleeCheckForVictors()

 
 call ForForce(defeatedPlayers, function MeleeDoDefeatEnum)

 
 call ForForce(victoriousPlayers, function MeleeDoVictoryEnum)

 
 if (bj_meleeGameOver) then
 call MeleeRemoveObservers()
 endif
endfunction




function MeleeGetCrippledWarningMessage takes player whichPlayer returns string
 local race r = GetPlayerRace(whichPlayer)

 if (r == RACE_HUMAN) then
 return GetLocalizedString("CRIPPLE_WARNING_HUMAN")
 elseif (r == RACE_ORC) then
 return GetLocalizedString("CRIPPLE_WARNING_ORC")
 elseif (r == RACE_NIGHTELF) then
 return GetLocalizedString("CRIPPLE_WARNING_NIGHTELF")
 elseif (r == RACE_UNDEAD) then
 return GetLocalizedString("CRIPPLE_WARNING_UNDEAD")
 else
 
 return ""
 endif
endfunction




function MeleeGetCrippledTimerMessage takes player whichPlayer returns string
 local race r = GetPlayerRace(whichPlayer)

 if (r == RACE_HUMAN) then
 return GetLocalizedString("CRIPPLE_TIMER_HUMAN")
 elseif (r == RACE_ORC) then
 return GetLocalizedString("CRIPPLE_TIMER_ORC")
 elseif (r == RACE_NIGHTELF) then
 return GetLocalizedString("CRIPPLE_TIMER_NIGHTELF")
 elseif (r == RACE_UNDEAD) then
 return GetLocalizedString("CRIPPLE_TIMER_UNDEAD")
 else
 
 return ""
 endif
endfunction




function MeleeGetCrippledRevealedMessage takes player whichPlayer returns string
 return GetLocalizedString("CRIPPLE_REVEALING_PREFIX") + GetPlayerName(whichPlayer) + GetLocalizedString("CRIPPLE_REVEALING_POSTFIX")
endfunction


function MeleeExposePlayer takes player whichPlayer, boolean expose returns nothing
 local integer playerIndex
 local player indexPlayer
 local force toExposeTo = CreateForce()

 call CripplePlayer( whichPlayer, toExposeTo, false )

 set bj_playerIsExposed[GetPlayerId(whichPlayer)] = expose
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if (not PlayersAreCoAllied(whichPlayer, indexPlayer)) then
 call ForceAddPlayer( toExposeTo, indexPlayer )
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 call CripplePlayer( whichPlayer, toExposeTo, expose )
 call DestroyForce(toExposeTo)
endfunction


function MeleeExposeAllPlayers takes nothing returns nothing
 local integer playerIndex
 local player indexPlayer
 local integer playerIndex2
 local player indexPlayer2
 local force toExposeTo = CreateForce()

 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)

 call ForceClear( toExposeTo )
 call CripplePlayer( indexPlayer, toExposeTo, false )

 set playerIndex2 = 0
 loop
 set indexPlayer2 = Player(playerIndex2)

 if playerIndex != playerIndex2 then
 if (not PlayersAreCoAllied(indexPlayer, indexPlayer2)) then
 call ForceAddPlayer( toExposeTo, indexPlayer2 )
 endif
 endif

 set playerIndex2 = playerIndex2 + 1
 exitwhen playerIndex2 == bj_MAX_PLAYERS
 endloop

 call CripplePlayer( indexPlayer, toExposeTo, true )

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 call DestroyForce( toExposeTo )
endfunction


function MeleeCrippledPlayerTimeout takes nothing returns nothing
 local timer expiredTimer = GetExpiredTimer()
 local integer playerIndex
 local player exposedPlayer

 
 set playerIndex = 0
 loop
 if (bj_crippledTimer[playerIndex] == expiredTimer) then
 exitwhen true
 endif

 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
 if (playerIndex == bj_MAX_PLAYERS) then
 return
 endif
 set exposedPlayer = Player(playerIndex)

 if (GetLocalPlayer() == exposedPlayer) then
 

 
 call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)
 endif

 
 call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledRevealedMessage(exposedPlayer))

 
 call MeleeExposePlayer(exposedPlayer, true)
endfunction


function MeleePlayerIsCrippled takes player whichPlayer returns boolean
 local integer allyStructures = MeleeGetAllyStructureCount(whichPlayer)
 local integer allyKeyStructures = MeleeGetAllyKeyStructureCount(whichPlayer)

 
 return (allyStructures > 0) and (allyKeyStructures <= 0)
endfunction




function MeleeCheckForCrippledPlayers takes nothing returns nothing
 local integer playerIndex
 local player indexPlayer
 local force crippledPlayers = CreateForce()
 local boolean isNowCrippled
 local race indexRace

 
 if bj_finishSoonAllExposed then
 return
 endif

 
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 set isNowCrippled = MeleePlayerIsCrippled(indexPlayer)

 if (not bj_playerIsCrippled[playerIndex] and isNowCrippled) then

 
 set bj_playerIsCrippled[playerIndex] = true
 call TimerStart(bj_crippledTimer[playerIndex], bj_MELEE_CRIPPLE_TIMEOUT, false, function MeleeCrippledPlayerTimeout)

 if (GetLocalPlayer() == indexPlayer) then
 

 
 call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], true)

 
 call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledWarningMessage(indexPlayer))
 endif

 elseif (bj_playerIsCrippled[playerIndex] and not isNowCrippled) then

 
 set bj_playerIsCrippled[playerIndex] = false
 call PauseTimer(bj_crippledTimer[playerIndex])

 if (GetLocalPlayer() == indexPlayer) then
 

 
 call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)

 
 if (MeleeGetAllyStructureCount(indexPlayer) > 0) then
 if (bj_playerIsExposed[playerIndex]) then
 call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, GetLocalizedString("CRIPPLE_UNREVEALED"))
 else
 call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, GetLocalizedString("CRIPPLE_UNCRIPPLED"))
 endif
 endif
 endif

 
 call MeleeExposePlayer(indexPlayer, false)

 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop
endfunction




function MeleeCheckLostUnit takes unit lostUnit returns nothing
 local player lostUnitOwner = GetOwningPlayer(lostUnit)

 
 if (GetPlayerStructureCount(lostUnitOwner, true) <= 0) then
 call MeleeCheckForLosersAndVictors()
 endif

 
 
 call MeleeCheckForCrippledPlayers()
endfunction





function MeleeCheckAddedUnit takes unit addedUnit returns nothing
 local player addedUnitOwner = GetOwningPlayer(addedUnit)

 
 if (bj_playerIsCrippled[GetPlayerId(addedUnitOwner)]) then
 call MeleeCheckForCrippledPlayers()
 endif
endfunction


function MeleeTriggerActionConstructCancel takes nothing returns nothing
 call MeleeCheckLostUnit(GetCancelledStructure())
endfunction


function MeleeTriggerActionUnitDeath takes nothing returns nothing
 if (IsUnitType(GetDyingUnit(), UNIT_TYPE_STRUCTURE)) then
 call MeleeCheckLostUnit(GetDyingUnit())
 endif
endfunction


function MeleeTriggerActionUnitConstructionStart takes nothing returns nothing
 call MeleeCheckAddedUnit(GetConstructingStructure())
endfunction


function MeleeTriggerActionPlayerDefeated takes nothing returns nothing
 local player thePlayer = GetTriggerPlayer()
 call CachePlayerHeroData(thePlayer)

 if (MeleeGetAllyCount(thePlayer) > 0) then
 
 
 call ShareEverythingWithTeam(thePlayer)
 if (not bj_meleeDefeated[GetPlayerId(thePlayer)]) then
 call MeleeDoDefeat(thePlayer)
 endif
 else
 
 
 call MakeUnitsPassiveForTeam(thePlayer)
 if (not bj_meleeDefeated[GetPlayerId(thePlayer)]) then
 call MeleeDoDefeat(thePlayer)
 endif
 endif
 call MeleeCheckForLosersAndVictors()
endfunction


function MeleeTriggerActionPlayerLeft takes nothing returns nothing
 local player thePlayer = GetTriggerPlayer()

 
 if (IsPlayerObserver(thePlayer)) then
 call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_NEUTRAL, false)
 return
 endif

 call CachePlayerHeroData(thePlayer)

 
 

 if (MeleeGetAllyCount(thePlayer) > 0) then
 
 
 call ShareEverythingWithTeam(thePlayer)
 call MeleeDoLeave(thePlayer)
 else
 
 
 call MakeUnitsPassiveForTeam(thePlayer)
 call MeleeDoLeave(thePlayer)
 endif
 call MeleeCheckForLosersAndVictors()
endfunction


function MeleeTriggerActionAllianceChange takes nothing returns nothing
 call MeleeCheckForLosersAndVictors()
 call MeleeCheckForCrippledPlayers()
endfunction


function MeleeTriggerTournamentFinishSoon takes nothing returns nothing
 
 local integer playerIndex
 local player indexPlayer
 local real timeRemaining = GetTournamentFinishSoonTimeRemaining()

 if not bj_finishSoonAllExposed then
 set bj_finishSoonAllExposed = true

 
 set playerIndex = 0
 loop
 set indexPlayer = Player(playerIndex)
 if bj_playerIsCrippled[playerIndex] then
 
 set bj_playerIsCrippled[playerIndex] = false
 call PauseTimer(bj_crippledTimer[playerIndex])

 if (GetLocalPlayer() == indexPlayer) then
 

 
 call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)
 endif

 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == bj_MAX_PLAYERS
 endloop

 
 call MeleeExposeAllPlayers()
 endif

 
 call TimerDialogDisplay(bj_finishSoonTimerDialog, true)
 call TimerDialogSetRealTimeRemaining(bj_finishSoonTimerDialog, timeRemaining)
endfunction

function MeleeWasUserPlayer takes player whichPlayer returns boolean
 local playerslotstate slotState

 if (GetPlayerController(whichPlayer) != MAP_CONTROL_USER) then
 return false
 endif

 set slotState = GetPlayerSlotState(whichPlayer)

 return (slotState == PLAYER_SLOT_STATE_PLAYING or slotState == PLAYER_SLOT_STATE_LEFT)
endfunction


function MeleeTournamentFinishNowRuleA takes integer multiplier returns nothing
 local integer array playerScore
 local integer array teamScore
 local force array teamForce
 local integer teamCount
 local integer index
 local player indexPlayer
 local integer index2
 local player indexPlayer2
 local integer bestTeam
 local integer bestScore
 local boolean draw

 
 set index = 0
 loop
 set indexPlayer = Player(index)
 if MeleeWasUserPlayer(indexPlayer) then
 set playerScore[index] = GetTournamentScore(indexPlayer)
 if playerScore[index] <= 0 then
 set playerScore[index] = 1
 endif
 else
 set playerScore[index] = 0
 endif
 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 
 set teamCount = 0
 set index = 0
 loop
 if playerScore[index] != 0 then
 set indexPlayer = Player(index)

 set teamScore[teamCount] = 0
 set teamForce[teamCount] = CreateForce()

 set index2 = index
 loop
 if playerScore[index2] != 0 then
 set indexPlayer2 = Player(index2)

 if PlayersAreCoAllied(indexPlayer, indexPlayer2) then
 set teamScore[teamCount] = teamScore[teamCount] + playerScore[index2]
 call ForceAddPlayer(teamForce[teamCount], indexPlayer2)
 set playerScore[index2] = 0
 endif
 endif

 set index2 = index2 + 1
 exitwhen index2 == bj_MAX_PLAYERS
 endloop

 set teamCount = teamCount + 1
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 
 set bj_meleeGameOver = true

 
 if teamCount != 0 then

 
 set bestTeam = -1
 set bestScore = -1
 set index = 0
 loop
 if teamScore[index] > bestScore then
 set bestTeam = index
 set bestScore = teamScore[index]
 endif

 set index = index + 1
 exitwhen index == teamCount
 endloop

 
 
 
 set draw = false
 set index = 0
 loop
 if index != bestTeam then
 if bestScore < (multiplier * teamScore[index]) then
 set draw = true
 endif
 endif

 set index = index + 1
 exitwhen index == teamCount
 endloop

 if draw then
 
 set index = 0
 loop
 call ForForce(teamForce[index], function MeleeDoDrawEnum)

 set index = index + 1
 exitwhen index == teamCount
 endloop
 else
 
 set index = 0
 loop
 if index != bestTeam then
 call ForForce(teamForce[index], function MeleeDoDefeatEnum)
 endif

 set index = index + 1
 exitwhen index == teamCount
 endloop

 
 call ForForce(teamForce[bestTeam], function MeleeDoVictoryEnum)
 endif
 endif

endfunction


function MeleeTriggerTournamentFinishNow takes nothing returns nothing
 local integer rule = GetTournamentFinishNowRule()

 
 if bj_meleeGameOver then
 return
 endif

 if (rule == 1) then
 
 call MeleeTournamentFinishNowRuleA(1)
 else
 
 call MeleeTournamentFinishNowRuleA(3)
 endif

 
 call MeleeRemoveObservers()

endfunction


function MeleeInitVictoryDefeat takes nothing returns nothing
 local trigger trig
 local integer index
 local player indexPlayer

 
 
 set bj_finishSoonTimerDialog = CreateTimerDialog(null)

 
 set trig = CreateTrigger()
 call TriggerRegisterGameEvent(trig, EVENT_GAME_TOURNAMENT_FINISH_SOON)
 call TriggerAddAction(trig, function MeleeTriggerTournamentFinishSoon)

 
 set trig = CreateTrigger()
 call TriggerRegisterGameEvent(trig, EVENT_GAME_TOURNAMENT_FINISH_NOW)
 call TriggerAddAction(trig, function MeleeTriggerTournamentFinishNow)

 
 set index = 0
 loop
 set indexPlayer = Player(index)

 
 if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
 set bj_meleeDefeated[index] = false
 set bj_meleeVictoried[index] = false

 
 set bj_playerIsCrippled[index] = false
 set bj_playerIsExposed[index] = false
 set bj_crippledTimer[index] = CreateTimer()
 set bj_crippledTimerWindows[index] = CreateTimerDialog(bj_crippledTimer[index])
 call TimerDialogSetTitle(bj_crippledTimerWindows[index], MeleeGetCrippledTimerMessage(indexPlayer))

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_CONSTRUCT_CANCEL, null)
 call TriggerAddAction(trig, function MeleeTriggerActionConstructCancel)

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_DEATH, null)
 call TriggerAddAction(trig, function MeleeTriggerActionUnitDeath)

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_CONSTRUCT_START, null)
 call TriggerAddAction(trig, function MeleeTriggerActionUnitConstructionStart)

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_DEFEAT)
 call TriggerAddAction(trig, function MeleeTriggerActionPlayerDefeated)

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_LEAVE)
 call TriggerAddAction(trig, function MeleeTriggerActionPlayerLeft)

 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerAllianceChange(trig, indexPlayer, ALLIANCE_PASSIVE)
 call TriggerRegisterPlayerStateEvent(trig, indexPlayer, PLAYER_STATE_ALLIED_VICTORY, EQUAL, 1)
 call TriggerAddAction(trig, function MeleeTriggerActionAllianceChange)
 else
 set bj_meleeDefeated[index] = true
 set bj_meleeVictoried[index] = false

 
 if (IsPlayerObserver(indexPlayer)) then
 
 set trig = CreateTrigger()
 call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_LEAVE)
 call TriggerAddAction(trig, function MeleeTriggerActionPlayerLeft)
 endif
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop

 
 
 call TimerStart(CreateTimer(), 2.0, false, function MeleeTriggerActionAllianceChange)
endfunction







function CheckInitPlayerSlotAvailability takes nothing returns nothing
 local integer index

 if (not bj_slotControlReady) then
 set index = 0
 loop
 set bj_slotControlUsed[index] = false
 set bj_slotControl[index] = MAP_CONTROL_USER
 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
 set bj_slotControlReady = true
 endif
endfunction


function SetPlayerSlotAvailable takes player whichPlayer, mapcontrol control returns nothing
 local integer playerIndex = GetPlayerId(whichPlayer)

 call CheckInitPlayerSlotAvailability()
 set bj_slotControlUsed[playerIndex] = true
 set bj_slotControl[playerIndex] = control
endfunction







function TeamInitPlayerSlots takes integer teamCount returns nothing
 local integer index
 local player indexPlayer
 local integer team

 call SetTeams(teamCount)

 call CheckInitPlayerSlotAvailability()
 set index = 0
 set team = 0
 loop
 if (bj_slotControlUsed[index]) then
 set indexPlayer = Player(index)
 call SetPlayerTeam( indexPlayer, team )
 set team = team + 1
 if (team >= teamCount) then
 set team = 0
 endif
 endif

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction


function MeleeInitPlayerSlots takes nothing returns nothing
 call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction


function FFAInitPlayerSlots takes nothing returns nothing
 call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction


function OneOnOneInitPlayerSlots takes nothing returns nothing
 
 call SetTeams(2)
 call SetPlayers(2)
 call TeamInitPlayerSlots(2)
endfunction


function InitGenericPlayerSlots takes nothing returns nothing
 local gametype gType = GetGameTypeSelected()

 if (gType == GAME_TYPE_MELEE) then
 call MeleeInitPlayerSlots()
 elseif (gType == GAME_TYPE_FFA) then
 call FFAInitPlayerSlots()
 elseif (gType == GAME_TYPE_USE_MAP_SETTINGS) then
 
 elseif (gType == GAME_TYPE_ONE_ON_ONE) then
 call OneOnOneInitPlayerSlots()
 elseif (gType == GAME_TYPE_TWO_TEAM_PLAY) then
 call TeamInitPlayerSlots(2)
 elseif (gType == GAME_TYPE_THREE_TEAM_PLAY) then
 call TeamInitPlayerSlots(3)
 elseif (gType == GAME_TYPE_FOUR_TEAM_PLAY) then
 call TeamInitPlayerSlots(4)
 else
 
 endif
endfunction







function SetDNCSoundsDawn takes nothing returns nothing
 if bj_useDawnDuskSounds then
 call StartSound(bj_dawnSound)
 endif
endfunction


function SetDNCSoundsDusk takes nothing returns nothing
 if bj_useDawnDuskSounds then
 call StartSound(bj_duskSound)
 endif
endfunction


function SetDNCSoundsDay takes nothing returns nothing
 local real ToD = GetTimeOfDay()

 if (ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) and not bj_dncIsDaytime then
 set bj_dncIsDaytime = true

 
 call StopSound(bj_nightAmbientSound, false, true)
 call StartSound(bj_dayAmbientSound)
 endif
endfunction


function SetDNCSoundsNight takes nothing returns nothing
 local real ToD = GetTimeOfDay()

 if (ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) and bj_dncIsDaytime then
 set bj_dncIsDaytime = false

 
 call StopSound(bj_dayAmbientSound, false, true)
 call StartSound(bj_nightAmbientSound)
 endif
endfunction


function InitDNCSounds takes nothing returns nothing
 
 set bj_dawnSound = CreateSoundFromLabel("RoosterSound", false, false, false, 10000, 10000)
 set bj_duskSound = CreateSoundFromLabel("WolfSound", false, false, false, 10000, 10000)

 
 set bj_dncSoundsDawn = CreateTrigger()
 call TriggerRegisterGameStateEvent(bj_dncSoundsDawn, GAME_STATE_TIME_OF_DAY, EQUAL, bj_TOD_DAWN)
 call TriggerAddAction(bj_dncSoundsDawn, function SetDNCSoundsDawn)

 set bj_dncSoundsDusk = CreateTrigger()
 call TriggerRegisterGameStateEvent(bj_dncSoundsDusk, GAME_STATE_TIME_OF_DAY, EQUAL, bj_TOD_DUSK)
 call TriggerAddAction(bj_dncSoundsDusk, function SetDNCSoundsDusk)

 
 set bj_dncSoundsDay = CreateTrigger()
 call TriggerRegisterGameStateEvent(bj_dncSoundsDay, GAME_STATE_TIME_OF_DAY, GREATER_THAN_OR_EQUAL, bj_TOD_DAWN)
 call TriggerRegisterGameStateEvent(bj_dncSoundsDay, GAME_STATE_TIME_OF_DAY, LESS_THAN, bj_TOD_DUSK)
 call TriggerAddAction(bj_dncSoundsDay, function SetDNCSoundsDay)

 set bj_dncSoundsNight = CreateTrigger()
 call TriggerRegisterGameStateEvent(bj_dncSoundsNight, GAME_STATE_TIME_OF_DAY, LESS_THAN, bj_TOD_DAWN)
 call TriggerRegisterGameStateEvent(bj_dncSoundsNight, GAME_STATE_TIME_OF_DAY, GREATER_THAN_OR_EQUAL, bj_TOD_DUSK)
 call TriggerAddAction(bj_dncSoundsNight, function SetDNCSoundsNight)
endfunction


function InitBlizzardGlobals takes nothing returns nothing
 local integer index
 local integer userControlledPlayers
 local version v

 
 set filterIssueHauntOrderAtLocBJ = Filter(function IssueHauntOrderAtLocBJFilter)
 set filterEnumDestructablesInCircleBJ = Filter(function EnumDestructablesInCircleBJFilter)
 set filterGetUnitsInRectOfPlayer = Filter(function GetUnitsInRectOfPlayerFilter)
 set filterGetUnitsOfTypeIdAll = Filter(function GetUnitsOfTypeIdAllFilter)
 set filterGetUnitsOfPlayerAndTypeId = Filter(function GetUnitsOfPlayerAndTypeIdFilter)
 set filterMeleeTrainedUnitIsHeroBJ = Filter(function MeleeTrainedUnitIsHeroBJFilter)
 set filterLivingPlayerUnitsOfTypeId = Filter(function LivingPlayerUnitsOfTypeIdFilter)

 
 set index = 0
 loop
 exitwhen index == bj_MAX_PLAYER_SLOTS
 set bj_FORCE_PLAYER[index] = CreateForce()
 call ForceAddPlayer(bj_FORCE_PLAYER[index], Player(index))
 set index = index + 1
 endloop

 set bj_FORCE_ALL_PLAYERS = CreateForce()
 call ForceEnumPlayers(bj_FORCE_ALL_PLAYERS, null)

 
 set bj_cineModePriorSpeed = GetGameSpeed()
 set bj_cineModePriorFogSetting = IsFogEnabled()
 set bj_cineModePriorMaskSetting = IsFogMaskEnabled()

 
 set index = 0
 loop
 exitwhen index >= bj_MAX_QUEUED_TRIGGERS
 set bj_queuedExecTriggers[index] = null
 set bj_queuedExecUseConds[index] = false
 set index = index + 1
 endloop

 
 set bj_isSinglePlayer = false
 set userControlledPlayers = 0
 set index = 0
 loop
 exitwhen index >= bj_MAX_PLAYERS
 if (GetPlayerController(Player(index)) == MAP_CONTROL_USER and GetPlayerSlotState(Player(index)) == PLAYER_SLOT_STATE_PLAYING) then
 set userControlledPlayers = userControlledPlayers + 1
 endif
 set index = index + 1
 endloop
 set bj_isSinglePlayer = (userControlledPlayers == 1)

 
 
 set bj_rescueSound = CreateSoundFromLabel("Rescue", false, false, false, 10000, 10000)
 set bj_questDiscoveredSound = CreateSoundFromLabel("QuestNew", false, false, false, 10000, 10000)
 set bj_questUpdatedSound = CreateSoundFromLabel("QuestUpdate", false, false, false, 10000, 10000)
 set bj_questCompletedSound = CreateSoundFromLabel("QuestCompleted", false, false, false, 10000, 10000)
 set bj_questFailedSound = CreateSoundFromLabel("QuestFailed", false, false, false, 10000, 10000)
 set bj_questHintSound = CreateSoundFromLabel("Hint", false, false, false, 10000, 10000)
 set bj_questSecretSound = CreateSoundFromLabel("SecretFound", false, false, false, 10000, 10000)
 set bj_questItemAcquiredSound = CreateSoundFromLabel("ItemReward", false, false, false, 10000, 10000)
 set bj_questWarningSound = CreateSoundFromLabel("Warning", false, false, false, 10000, 10000)
 set bj_victoryDialogSound = CreateSoundFromLabel("QuestCompleted", false, false, false, 10000, 10000)
 set bj_defeatDialogSound = CreateSoundFromLabel("QuestFailed", false, false, false, 10000, 10000)

 
 call DelayedSuspendDecayCreate()

 
 set v = VersionGet()
 if (v == VERSION_REIGN_OF_CHAOS) then
 set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V0
 else
 set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V1
 endif
endfunction


function InitQueuedTriggers takes nothing returns nothing
 set bj_queuedExecTimeout = CreateTrigger()
 call TriggerRegisterTimerExpireEvent(bj_queuedExecTimeout, bj_queuedExecTimeoutTimer)
 call TriggerAddAction(bj_queuedExecTimeout, function QueuedTriggerDoneBJ)
endfunction


function InitMapRects takes nothing returns nothing
 set bj_mapInitialPlayableArea = Rect(GetCameraBoundMinX()-GetCameraMargin(CAMERA_MARGIN_LEFT), GetCameraBoundMinY()-GetCameraMargin(CAMERA_MARGIN_BOTTOM), GetCameraBoundMaxX()+GetCameraMargin(CAMERA_MARGIN_RIGHT), GetCameraBoundMaxY()+GetCameraMargin(CAMERA_MARGIN_TOP))
 set bj_mapInitialCameraBounds = GetCurrentCameraBoundsMapRectBJ()
endfunction


function InitSummonableCaps takes nothing returns nothing
 local integer index

 set index = 0
 loop
 
 
 
 if (not GetPlayerTechResearched(Player(index), 'Rhrt', true)) then
 call SetPlayerTechMaxAllowed(Player(index), 'hrtt', 0)
 endif

 
 if (not GetPlayerTechResearched(Player(index), 'Robk', true)) then
 call SetPlayerTechMaxAllowed(Player(index), 'otbk', 0)
 endif

 
 call SetPlayerTechMaxAllowed(Player(index), 'uske', bj_MAX_SKELETONS)

 set index = index + 1
 exitwhen index == bj_MAX_PLAYERS
 endloop
endfunction




function UpdateStockAvailability takes item whichItem returns nothing
 local itemtype iType = GetItemType(whichItem)
 local integer iLevel = GetItemLevel(whichItem)

 
 if (iType == ITEM_TYPE_PERMANENT) then
 set bj_stockAllowedPermanent[iLevel] = true
 elseif (iType == ITEM_TYPE_CHARGED) then
 set bj_stockAllowedCharged[iLevel] = true
 elseif (iType == ITEM_TYPE_ARTIFACT) then
 set bj_stockAllowedArtifact[iLevel] = true
 else
 
 endif
endfunction




function UpdateEachStockBuildingEnum takes nothing returns nothing
 local integer iteration = 0
 local integer pickedItemId

 loop
 set pickedItemId = ChooseRandomItemEx(bj_stockPickedItemType, bj_stockPickedItemLevel)
 exitwhen IsItemIdSellable(pickedItemId)

 
 
 set iteration = iteration + 1
 if (iteration > bj_STOCK_MAX_ITERATIONS) then
 return
 endif
 endloop
 call AddItemToStock(GetEnumUnit(), pickedItemId, 1, 1)
endfunction


function UpdateEachStockBuilding takes itemtype iType, integer iLevel returns nothing
 local group g

 set bj_stockPickedItemType = iType
 set bj_stockPickedItemLevel = iLevel

 set g = CreateGroup()
 call GroupEnumUnitsOfType(g, "marketplace", null)
 call ForGroup(g, function UpdateEachStockBuildingEnum)
 call DestroyGroup(g)
endfunction




function PerformStockUpdates takes nothing returns nothing
 local integer pickedItemId
 local itemtype pickedItemType
 local integer pickedItemLevel = 0
 local integer allowedCombinations = 0
 local integer iLevel

 
 set iLevel = 1
 loop
 if (bj_stockAllowedPermanent[iLevel]) then
 set allowedCombinations = allowedCombinations + 1
 if (GetRandomInt(1, allowedCombinations) == 1) then
 set pickedItemType = ITEM_TYPE_PERMANENT
 set pickedItemLevel = iLevel
 endif
 endif
 if (bj_stockAllowedCharged[iLevel]) then
 set allowedCombinations = allowedCombinations + 1
 if (GetRandomInt(1, allowedCombinations) == 1) then
 set pickedItemType = ITEM_TYPE_CHARGED
 set pickedItemLevel = iLevel
 endif
 endif
 if (bj_stockAllowedArtifact[iLevel]) then
 set allowedCombinations = allowedCombinations + 1
 if (GetRandomInt(1, allowedCombinations) == 1) then
 set pickedItemType = ITEM_TYPE_ARTIFACT
 set pickedItemLevel = iLevel
 endif
 endif

 set iLevel = iLevel + 1
 exitwhen iLevel > bj_MAX_ITEM_LEVEL
 endloop

 
 if (allowedCombinations == 0) then
 return
 endif

 call UpdateEachStockBuilding(pickedItemType, pickedItemLevel)
endfunction




function StartStockUpdates takes nothing returns nothing
 call PerformStockUpdates()
 call TimerStart(bj_stockUpdateTimer, bj_STOCK_RESTOCK_INTERVAL, true, function PerformStockUpdates)
endfunction


function RemovePurchasedItem takes nothing returns nothing
 call RemoveItemFromStock(GetSellingUnit(), GetItemTypeId(GetSoldItem()))
endfunction


function InitNeutralBuildings takes nothing returns nothing
 local integer iLevel

 
 set iLevel = 0
 loop
 set bj_stockAllowedPermanent[iLevel] = false
 set bj_stockAllowedCharged[iLevel] = false
 set bj_stockAllowedArtifact[iLevel] = false
 set iLevel = iLevel + 1
 exitwhen iLevel > bj_MAX_ITEM_LEVEL
 endloop

 
 call SetAllItemTypeSlots(bj_MAX_STOCK_ITEM_SLOTS)
 call SetAllUnitTypeSlots(bj_MAX_STOCK_UNIT_SLOTS)

 
 set bj_stockUpdateTimer = CreateTimer()
 call TimerStart(bj_stockUpdateTimer, bj_STOCK_RESTOCK_INITIAL_DELAY, false, function StartStockUpdates)

 
 set bj_stockItemPurchased = CreateTrigger()
 call TriggerRegisterPlayerUnitEvent(bj_stockItemPurchased, Player(PLAYER_NEUTRAL_PASSIVE), EVENT_PLAYER_UNIT_SELL_ITEM, null)
 call TriggerAddAction(bj_stockItemPurchased, function RemovePurchasedItem)
endfunction


function MarkGameStarted takes nothing returns nothing
 set bj_gameStarted = true
 call DestroyTimer(bj_gameStartedTimer)
endfunction


function DetectGameStarted takes nothing returns nothing
 set bj_gameStartedTimer = CreateTimer()
 call TimerStart(bj_gameStartedTimer, bj_GAME_STARTED_THRESHOLD, false, function MarkGameStarted)
endfunction


function InitBlizzard takes nothing returns nothing
 
 
 
 call ConfigureNeutralVictim()

 call InitBlizzardGlobals()
 call InitQueuedTriggers()
 call InitRescuableBehaviorBJ()
 call InitDNCSounds()
 call InitMapRects()
 call InitSummonableCaps()
 call InitNeutralBuildings()
 call DetectGameStarted()
endfunction




















function RandomDistReset takes nothing returns nothing
 set bj_randDistCount = 0
endfunction


function RandomDistAddItem takes integer inID, integer inChance returns nothing
 set bj_randDistID[bj_randDistCount] = inID
 set bj_randDistChance[bj_randDistCount] = inChance
 set bj_randDistCount = bj_randDistCount + 1
endfunction


function RandomDistChoose takes nothing returns integer
 local integer sum = 0
 local integer chance = 0
 local integer index
 local integer foundID = -1
 local boolean done

 
 if (bj_randDistCount == 0) then
 return -1
 endif

 
 set index = 0
 loop
 set sum = sum + bj_randDistChance[index]

 set index = index + 1
 exitwhen index == bj_randDistCount
 endloop

 
 set chance = GetRandomInt(1, sum)

 
 set index = 0
 set sum = 0
 set done = false
 loop
 set sum = sum + bj_randDistChance[index]

 if (chance <= sum) then
 set foundID = bj_randDistID[index]
 set done = true
 endif

 set index = index + 1
 if (index == bj_randDistCount) then
 set done = true
 endif

 exitwhen done == true
 endloop

 return foundID
endfunction












function UnitDropItem takes unit inUnit, integer inItemID returns item
 local real x
 local real y
 local real radius = 32
 local real unitX
 local real unitY
 local item droppedItem

 if (inItemID == -1) then
 return null
 endif

 set unitX = GetUnitX(inUnit)
 set unitY = GetUnitY(inUnit)

 set x = GetRandomReal(unitX - radius, unitX + radius)
 set y = GetRandomReal(unitY - radius, unitY + radius)

 set droppedItem = CreateItem(inItemID, x, y)

 call SetItemDropID(droppedItem, GetUnitTypeId(inUnit))
 call UpdateStockAvailability(droppedItem)

 return droppedItem
endfunction


function WidgetDropItem takes widget inWidget, integer inItemID returns item
 local real x
 local real y
 local real radius = 32
 local real widgetX
 local real widgetY

 if (inItemID == -1) then
 return null
 endif

 set widgetX = GetWidgetX(inWidget)
 set widgetY = GetWidgetY(inWidget)

 set x = GetRandomReal(widgetX - radius, widgetX + radius)
 set y = GetRandomReal(widgetY - radius, widgetY + radius)

 return CreateItem(inItemID, x, y)
endfunction
`
var commonAi = `


native DebugS takes string str returns nothing
native DebugFI takes string str, integer val returns nothing
native DebugUnitID takes string str, integer val returns nothing
native DisplayText takes integer p, string str returns nothing
native DisplayTextI takes integer p, string str, integer val returns nothing
native DisplayTextII takes integer p, string str, integer v1, integer v2 returns nothing
native DisplayTextIII takes integer p, string str, integer v1, integer v2, integer v3 returns nothing
native DoAiScriptDebug takes nothing returns boolean

native GetAiPlayer takes nothing returns integer
native GetHeroId takes nothing returns integer
native GetHeroLevelAI takes nothing returns integer

native GetUnitCount takes integer unitid returns integer
native GetPlayerUnitTypeCount takes player p, integer unitid returns integer
native GetUnitCountDone takes integer unitid returns integer
native GetTownUnitCount takes integer id, integer tn, boolean dn returns integer
native GetUnitGoldCost takes integer unitid returns integer
native GetUnitWoodCost takes integer unitid returns integer
native GetUnitBuildTime takes integer unitid returns integer

native GetMinesOwned takes nothing returns integer
native GetGoldOwned takes nothing returns integer
native TownWithMine takes nothing returns integer
native TownHasMine takes integer townid returns boolean
native TownHasHall takes integer townid returns boolean

native GetUpgradeLevel takes integer id returns integer
native GetUpgradeGoldCost takes integer id returns integer
native GetUpgradeWoodCost takes integer id returns integer
native GetNextExpansion takes nothing returns integer
native GetMegaTarget takes nothing returns unit
native GetBuilding takes player p returns unit
native GetEnemyPower takes nothing returns integer
native SetAllianceTarget takes unit id returns nothing
native GetAllianceTarget takes nothing returns unit

native SetProduce takes integer qty, integer id, integer town returns boolean
native Unsummon takes unit unitid returns nothing
native SetExpansion takes unit peon, integer id returns boolean
native SetUpgrade takes integer id returns boolean
native SetHeroLevels takes code func returns nothing
native SetNewHeroes takes boolean state returns nothing
native PurchaseZeppelin takes nothing returns nothing

native MergeUnits takes integer qty, integer a, integer b, integer make returns boolean
native ConvertUnits takes integer qty, integer id returns boolean

native SetCampaignAI takes nothing returns nothing
native SetMeleeAI takes nothing returns nothing
native SetTargetHeroes takes boolean state returns nothing
native SetPeonsRepair takes boolean state returns nothing
native SetRandomPaths takes boolean state returns nothing
native SetDefendPlayer takes boolean state returns nothing
native SetHeroesFlee takes boolean state returns nothing
native SetHeroesBuyItems takes boolean state returns nothing
native SetWatchMegaTargets takes boolean state returns nothing
native SetIgnoreInjured takes boolean state returns nothing
native SetHeroesTakeItems takes boolean state returns nothing
native SetUnitsFlee takes boolean state returns nothing
native SetGroupsFlee takes boolean state returns nothing
native SetSlowChopping takes boolean state returns nothing
native SetCaptainChanges takes boolean allow returns nothing
native SetSmartArtillery takes boolean state returns nothing
native SetReplacementCount takes integer qty returns nothing
native GroupTimedLife takes boolean allow returns nothing
native RemoveInjuries takes nothing returns nothing
native RemoveSiege takes nothing returns nothing

native InitAssault takes nothing returns nothing
native AddAssault takes integer qty, integer id returns boolean
native AddDefenders takes integer qty, integer id returns boolean

native GetCreepCamp takes integer min, integer max, boolean flyers_ok returns unit

native StartGetEnemyBase takes nothing returns nothing
native WaitGetEnemyBase takes nothing returns boolean
native GetEnemyBase takes nothing returns unit
native GetExpansionFoe takes nothing returns unit
native GetEnemyExpansion takes nothing returns unit
native GetExpansionX takes nothing returns integer
native GetExpansionY takes nothing returns integer
native SetStagePoint takes real x, real y returns nothing
native AttackMoveKill takes unit target returns nothing
native AttackMoveXY takes integer x, integer y returns nothing
native LoadZepWave takes integer x, integer y returns nothing
native SuicidePlayer takes player id, boolean check_full returns boolean
native SuicidePlayerUnits takes player id, boolean check_full returns boolean
native CaptainInCombat takes boolean attack_captain returns boolean
native IsTowered takes unit target returns boolean

native ClearHarvestAI takes nothing returns nothing
native HarvestGold takes integer town, integer peons returns nothing
native HarvestWood takes integer town, integer peons returns nothing
native GetExpansionPeon takes nothing returns unit

native StopGathering takes nothing returns nothing
native AddGuardPost takes integer id, real x, real y returns nothing
native FillGuardPosts takes nothing returns nothing
native ReturnGuardPosts takes nothing returns nothing
native CreateCaptains takes nothing returns nothing
native SetCaptainHome takes integer which, real x, real y returns nothing
native ResetCaptainLocs takes nothing returns nothing
native ShiftTownSpot takes real x, real y returns nothing
native TeleportCaptain takes real x, real y returns nothing
native ClearCaptainTargets takes nothing returns nothing
native CaptainAttack takes real x, real y returns nothing
native CaptainVsUnits takes player id returns nothing
native CaptainVsPlayer takes player id returns nothing
native CaptainGoHome takes nothing returns nothing
native CaptainIsHome takes nothing returns boolean
native CaptainIsFull takes nothing returns boolean
native CaptainIsEmpty takes nothing returns boolean
native CaptainGroupSize takes nothing returns integer
native CaptainReadiness takes nothing returns integer
native CaptainRetreating takes nothing returns boolean
native CaptainReadinessHP takes nothing returns integer
native CaptainReadinessMa takes nothing returns integer
native CaptainAtGoal takes nothing returns boolean
native CreepsOnMap takes nothing returns boolean
native SuicideUnit takes integer count, integer unitid returns nothing
native SuicideUnitEx takes integer ct, integer uid, integer pid returns nothing
native StartThread takes code func returns nothing
native Sleep takes real seconds returns nothing
native UnitAlive takes unit id returns boolean
native UnitInvis takes unit id returns boolean
native IgnoredUnits takes integer unitid returns integer
native TownThreatened takes nothing returns boolean
native DisablePathing takes nothing returns nothing
native SetAmphibious takes nothing returns nothing

native CommandsWaiting takes nothing returns integer
native GetLastCommand takes nothing returns integer
native GetLastData takes nothing returns integer
native PopLastCommand takes nothing returns nothing
native MeleeDifficulty takes nothing returns integer




globals

 
 
 

 
 constant integer ARCHMAGE = 'Hamg'
 constant integer PALADIN = 'Hpal'
 constant integer MTN_KING = 'Hmkg'
 constant integer BLOOD_MAGE = 'Hblm'

 
 constant integer AVATAR = 'AHav'
 constant integer BASH = 'AHbh'
 constant integer THUNDER_BOLT = 'AHtb'
 constant integer THUNDER_CLAP = 'AHtc'

 constant integer DEVOTION_AURA = 'AHad'
 constant integer DIVINE_SHIELD = 'AHds'
 constant integer HOLY_BOLT = 'AHhb'
 constant integer RESURRECTION = 'AHre'

 constant integer BLIZZARD = 'AHbz'
 constant integer BRILLIANCE_AURA = 'AHab'
 constant integer MASS_TELEPORT = 'AHmt'
 constant integer WATER_ELEMENTAL = 'AHwe'

 constant integer BANISH = 'AHbn'
 constant integer FLAME_STRIKE = 'AHfs'
 constant integer SUMMON_PHOENIX = 'AHpx'
 constant integer SIPHON_MANA = 'AHdr'

 
 constant integer JAINA = 'Hjai'
 constant integer MURADIN = 'Hmbr'
 constant integer GARITHOS = 'Hlgr'
 constant integer KAEL = 'Hkal'

 
 constant integer COPTER = 'hgyr'
 constant integer GYRO = COPTER
 constant integer ELEMENTAL = 'hwat'
 constant integer FOOTMAN = 'hfoo'
 constant integer FOOTMEN = FOOTMAN
 constant integer GRYPHON = 'hgry'
 constant integer KNIGHT = 'hkni'
 constant integer MORTAR = 'hmtm'
 constant integer PEASANT = 'hpea'
 constant integer PRIEST = 'hmpr'
 constant integer RIFLEMAN = 'hrif'
 constant integer RIFLEMEN = RIFLEMAN
 constant integer SORCERESS = 'hsor'
 constant integer TANK = 'hmtt'
 constant integer STEAM_TANK = TANK
 constant integer ROCKET_TANK = 'hrtt'
 constant integer MILITIA = 'hmil'
 constant integer SPELL_BREAKER = 'hspt'
 constant integer HUMAN_DRAGON_HAWK = 'hdhw'

 
 constant integer BLOOD_PRIEST = 'hbep'
 constant integer BLOOD_SORCERESS = 'hbes'
 constant integer BLOOD_PEASANT = 'nhew'

 
 constant integer AVIARY = 'hgra'
 constant integer BARRACKS = 'hbar'
 constant integer BLACKSMITH = 'hbla'
 constant integer CANNON_TOWER = 'hctw'
 constant integer CASTLE = 'hcas'
 constant integer CHURCH = 'htws'
 constant integer MAGE_TOWER = CHURCH
 constant integer GUARD_TOWER = 'hgtw'
 constant integer HOUSE = 'hhou'
 constant integer HUMAN_ALTAR = 'halt'
 constant integer KEEP = 'hkee'
 constant integer LUMBER_MILL = 'hlum'
 constant integer SANCTUM = 'hars'
 constant integer ARCANE_SANCTUM = SANCTUM
 constant integer TOWN_HALL = 'htow'
 constant integer WATCH_TOWER = 'hwtw'
 constant integer WORKSHOP = 'harm'
 constant integer ARCANE_VAULT = 'hvlt'
 constant integer ARCANE_TOWER = 'hatw'

 
 constant integer UPG_MELEE = 'Rhme'
 constant integer UPG_RANGED = 'Rhra'
 constant integer UPG_ARTILLERY = 'Rhaa'
 constant integer UPG_ARMOR = 'Rhar'
 constant integer UPG_GOLD = 'Rhmi'
 constant integer UPG_MASONRY = 'Rhac'
 constant integer UPG_SIGHT = 'Rhss'
 constant integer UPG_DEFEND = 'Rhde'
 constant integer UPG_BREEDING = 'Rhan'
 constant integer UPG_PRAYING = 'Rhpt'
 constant integer UPG_SORCERY = 'Rhst'
 constant integer UPG_LEATHER = 'Rhla'
 constant integer UPG_GUN_RANGE = 'Rhri'
 constant integer UPG_WOOD = 'Rhlh'
 constant integer UPG_SENTINEL = 'Rhse'
 constant integer UPG_SCATTER = 'Rhsr'
 constant integer UPG_BOMBS = 'Rhgb'
 constant integer UPG_HAMMERS = 'Rhhb'
 constant integer UPG_CONT_MAGIC = 'Rhss'
 constant integer UPG_FRAGS = 'Rhfs'
 constant integer UPG_TANK = 'Rhrt'
 constant integer UPG_FLAK = 'Rhfc'
 constant integer UPG_CLOUD = 'Rhcd'

 
 
 

 
 constant integer BLADE_MASTER = 'Obla'
 constant integer FAR_SEER = 'Ofar'
 constant integer TAUREN_CHIEF = 'Otch'
 constant integer SHADOW_HUNTER = 'Oshd'

 
 constant integer GROM = 'Ogrh'
 constant integer THRALL = 'Othr'

 
 constant integer CRITICAL_STRIKE = 'AOcr'
 constant integer MIRROR_IMAGE = 'AOmi'
 constant integer BLADE_STORM = 'AOww'
 constant integer WIND_WALK = 'AOwk'

 constant integer CHAIN_LIGHTNING = 'AOcl'
 constant integer EARTHQUAKE = 'AOeq'
 constant integer FAR_SIGHT = 'AOfs'
 constant integer SPIRIT_WOLF = 'AOsf'

 constant integer ENDURANE_AURA = 'AOae'
 constant integer REINCARNATION = 'AOre'
 constant integer SHOCKWAVE = 'AOsh'
 constant integer WAR_STOMP = 'AOws'

 constant integer HEALING_WAVE = 'AOhw'
 constant integer HEX = 'AOhx'
 constant integer SERPENT_WARD = 'AOsw'
 constant integer VOODOO = 'AOvd'

 
 constant integer GUARDIAN = 'oang'
 constant integer CATAPULT = 'ocat'
 constant integer WITCH_DOCTOR = 'odoc'
 constant integer GRUNT = 'ogru'
 constant integer HEAD_HUNTER = 'ohun'
 constant integer BERSERKER = 'otbk'
 constant integer KODO_BEAST = 'okod'
 constant integer PEON = 'opeo'
 constant integer RAIDER = 'orai'
 constant integer SHAMAN = 'oshm'
 constant integer TAUREN = 'otau'
 constant integer WYVERN = 'owyv'
 constant integer BATRIDER = 'otbr'
 constant integer SPIRIT_WALKER = 'ospw'
 constant integer SPIRIT_WALKER_M = 'ospm'

 
 constant integer ORC_ALTAR = 'oalt'
 constant integer ORC_BARRACKS = 'obar'
 constant integer BESTIARY = 'obea'
 constant integer FORGE = 'ofor'
 constant integer FORTRESS = 'ofrt'
 constant integer GREAT_HALL = 'ogre'
 constant integer LODGE = 'osld'
 constant integer STRONGHOLD = 'ostr'
 constant integer BURROW = 'otrb'
 constant integer TOTEM = 'otto'
 constant integer ORC_WATCH_TOWER = 'owtw'
 constant integer VOODOO_LOUNGE = 'ovln'

 
 constant integer UPG_ORC_MELEE = 'Rome'
 constant integer UPG_ORC_RANGED = 'Rora'
 constant integer UPG_ORC_ARTILLERY = 'Roaa'
 constant integer UPG_ORC_ARMOR = 'Roar'
 constant integer UPG_ORC_WAR_DRUMS = 'Rwdm'
 constant integer UPG_ORC_PILLAGE = 'Ropg'
 constant integer UPG_ORC_BERSERK = 'Robs'
 constant integer UPG_ORC_PULVERIZE = 'Rows'
 constant integer UPG_ORC_ENSNARE = 'Roen'
 constant integer UPG_ORC_VENOM = 'Rovs'
 constant integer UPG_ORC_DOCS = 'Rowd'
 constant integer UPG_ORC_SHAMAN = 'Rost'
 constant integer UPG_ORC_SPIKES = 'Rosp'
 constant integer UPG_ORC_BURROWS = 'Rorb'
 constant integer UPG_ORC_REGEN = 'Rotr'
 constant integer UPG_ORC_FIRE = 'Rolf'
 constant integer UPG_ORC_SWALKER = 'Rowt'
 constant integer UPG_ORC_BERSERKER = 'Robk'
 constant integer UPG_ORC_NAPTHA = 'Robf'
 constant integer UPG_ORC_CHAOS = 'Roch'

 
 constant integer OGRE_MAGI = 'nomg'
 constant integer ORC_DRAGON = 'nrwm'
 constant integer SAPPER = 'ngsp'
 constant integer ZEPPLIN = 'nzep'
 constant integer ZEPPELIN = ZEPPLIN
 constant integer W2_WARLOCK = 'nw2w'
 constant integer PIG_FARM = 'npgf'

 
 constant integer CHAOS_GRUNT = 'nchg'
 constant integer CHAOS_WARLOCK = 'nchw'
 constant integer CHAOS_RAIDER = 'nchr'
 constant integer CHAOS_PEON = 'ncpn'
 constant integer CHAOS_KODO = 'nckb'
 constant integer CHAOS_GROM = 'Opgh'
 constant integer CHAOS_BLADEMASTER = 'Nbbc'
 constant integer CHAOS_BURROW = 'ocbw'

 
 
 

 
 constant integer DEATH_KNIGHT = 'Udea'
 constant integer DREAD_LORD = 'Udre'
 constant integer LICH = 'Ulic'
 constant integer CRYPT_LORD = 'Ucrl'

 
 constant integer MALGANIS = 'Umal'
 constant integer TICHONDRIUS = 'Utic'
 constant integer PIT_LORD = 'Npld'
 constant integer DETHEROC = 'Udth'

 
 constant integer SLEEP = 'AUsl'
 constant integer VAMP_AURA = 'AUav'
 constant integer CARRION_SWARM = 'AUcs'
 constant integer INFERNO = 'AUin'

 constant integer DARK_RITUAL = 'AUdr'
 constant integer DEATH_DECAY = 'AUdd'
 constant integer FROST_ARMOR = 'AUfu'
 constant integer FROST_NOVA = 'AUfn'

 constant integer ANIM_DEAD = 'AUan'
 constant integer DEATH_COIL = 'AUdc'
 constant integer DEATH_PACT = 'AUdp'
 constant integer UNHOLY_AURA = 'AUau'

 constant integer CARRION_SCARAB = 'AUcb'
 constant integer IMPALE = 'AUim'
 constant integer LOCUST_SWARM = 'AUls'
 constant integer THORNY_SHIELD = 'AUts'

 
 constant integer ABOMINATION = 'uabo'
 constant integer ACOLYTE = 'uaco'
 constant integer BANSHEE = 'uban'
 constant integer PIT_FIEND = 'ucry'
 constant integer CRYPT_FIEND = PIT_FIEND
 constant integer FROST_WYRM = 'ufro'
 constant integer GARGOYLE = 'ugar'
 constant integer GARGOYLE_MORPH = 'ugrm'
 constant integer GHOUL = 'ugho'
 constant integer MEAT_WAGON = 'umtw'
 constant integer NECRO = 'unec'
 constant integer SKEL_WARRIOR = 'uske'
 constant integer SHADE = 'ushd'
 constant integer UNDEAD_BARGE = 'uarb'
 constant integer OBSIDIAN_STATUE = 'uobs'
 constant integer OBS_STATUE = OBSIDIAN_STATUE
 constant integer BLK_SPHINX = 'ubsp'

 
 constant integer UNDEAD_MINE = 'ugol'
 constant integer UNDEAD_ALTAR = 'uaod'
 constant integer BONEYARD = 'ubon'
 constant integer GARG_SPIRE = 'ugsp'
 constant integer NECROPOLIS_1 = 'unpl' 
 constant integer NECROPOLIS_2 = 'unp1' 
 constant integer NECROPOLIS_3 = 'unp2' 
 constant integer SAC_PIT = 'usap'
 constant integer CRYPT = 'usep'
 constant integer SLAUGHTERHOUSE = 'uslh'
 constant integer DAMNED_TEMPLE = 'utod'
 constant integer ZIGGURAT_1 = 'uzig' 
 constant integer ZIGGURAT_2 = 'uzg1' 
 constant integer ZIGGURAT_FROST = 'uzg2' 
 constant integer GRAVEYARD = 'ugrv'
 constant integer TOMB_OF_RELICS = 'utom'

 
 constant integer UPG_UNHOLY_STR = 'Rume'
 constant integer UPG_CR_ATTACK = 'Rura'
 constant integer UPG_UNHOLY_ARMOR = 'Ruar'
 constant integer UPG_CANNIBALIZE = 'Ruac'
 constant integer UPG_GHOUL_FRENZY = 'Rugf'
 constant integer UPG_FIEND_WEB = 'Ruwb'
 constant integer UPG_ABOM = 'Ruab'
 constant integer UPG_STONE_FORM = 'Rusf'
 constant integer UPG_NECROS = 'Rune'
 constant integer UPG_BANSHEE = 'Ruba'
 constant integer UPG_MEAT_WAGON = 'Rump'
 constant integer UPG_WYRM_BREATH = 'Rufb'
 constant integer UPG_SKEL_LIFE = 'Rusl'
 constant integer UPG_SKEL_MASTERY = 'Rusm'
 constant integer UPG_EXHUME = 'Ruex'
 constant integer UPG_SACRIFICE = 'Rurs'
 constant integer UPG_ABOM_EXPL = 'Ruax'
 constant integer UPG_CR_ARMOR = 'Rucr'
 constant integer UPG_PLAGUE = 'Rupc'
 constant integer UPG_BLK_SPHINX = 'Rusp'
 constant integer UPG_BURROWING = 'Rubu'

 
 
 

 
 constant integer DEMON_HUNTER = 'Edem'
 constant integer DEMON_HUNTER_M = 'Edmm'
 constant integer KEEPER = 'Ekee'
 constant integer MOON_CHICK = 'Emoo'
 constant integer MOON_BABE = MOON_CHICK
 constant integer MOON_HONEY = MOON_CHICK
 constant integer WARDEN = 'Ewar'

 
 constant integer SYLVANUS = 'Hvwd'
 constant integer CENARIUS = 'Ecen'
 constant integer ILLIDAN = 'Eevi'
 constant integer ILLIDAN_DEMON = 'Eevm'
 constant integer MAIEV = 'Ewrd'

 
 constant integer FORCE_NATURE = 'AEfn'
 constant integer ENT_ROOTS = 'AEer'
 constant integer THORNS_AURA = 'AEah'
 constant integer TRANQUILITY = 'AEtq'

 constant integer EVASION = 'AEev'
 constant integer IMMOLATION = 'AEim'
 constant integer MANA_BURN = 'AEmb'
 constant integer METAMORPHOSIS = 'AEme'

 constant integer SEARING_ARROWS = 'AHfa'
 constant integer SCOUT = 'AEst'
 constant integer STARFALL = 'AEsf'
 constant integer TRUESHOT = 'AEar'

 constant integer BLINK = 'AEbl'
 constant integer FAN_KNIVES = 'AEfk'
 constant integer SHADOW_TOUCH = 'AEsh'
 constant integer VENGEANCE = 'AEsv'

 
 constant integer WISP = 'ewsp'
 constant integer ARCHER = 'earc'
 constant integer DRUID_TALON = 'edot'
 constant integer DRUID_TALON_M = 'edtm'
 constant integer BALLISTA = 'ebal'
 constant integer DRUID_CLAW = 'edoc'
 constant integer DRUID_CLAW_M = 'edcm'
 constant integer DRYAD = 'edry'
 constant integer HIPPO = 'ehip'
 constant integer HIPPO_RIDER = 'ehpr'
 constant integer HUNTRESS = 'esen'
 constant integer CHIMAERA = 'echm'
 constant integer ENT = 'efon'
 constant integer MOUNTAIN_GIANT = 'emtg'
 constant integer FAERIE_DRAGON = 'efdr'

 
 constant integer HIGH_ARCHER = 'nhea'
 constant integer HIGH_FOOTMAN = 'hcth'
 constant integer HIGH_FOOTMEN = HIGH_FOOTMAN
 constant integer HIGH_SWORDMAN = 'hhes'
 constant integer DRAGON_HAWK = 'nws1'
 constant integer CORRUPT_TREANT = 'nenc'
 constant integer POISON_TREANT = 'nenp'
 constant integer PLAGUE_TREANT = 'nepl'
 constant integer SHANDRIS = 'eshd'

 
 constant integer ANCIENT_LORE = 'eaoe'
 constant integer ANCIENT_WAR = 'eaom'
 constant integer ANCIENT_WIND = 'eaow'
 constant integer TREE_AGES = 'etoa'
 constant integer TREE_ETERNITY = 'etoe'
 constant integer TREE_LIFE = 'etol'
 constant integer ANCIENT_PROTECT = 'etrp'
 constant integer ELF_ALTAR = 'eate'
 constant integer BEAR_DEN = 'edol'
 constant integer CHIMAERA_ROOST = 'edos'
 constant integer HUNTERS_HALL = 'edob'
 constant integer MOON_WELL = 'emow'
 constant integer ELF_MINE = 'egol'
 constant integer DEN_OF_WONDERS = 'eden'

 
 constant integer ELF_FARM = 'nefm'
 constant integer ELF_GUARD_TOWER = 'negt'
 constant integer HIGH_SKY = 'negm'
 constant integer HIGH_EARTH = 'negf'
 constant integer HIGH_TOWER = 'negt'
 constant integer ELF_HIGH_BARRACKS = 'nheb'
 constant integer CORRUPT_LIFE = 'nctl'
 constant integer CORRUPT_WELL = 'ncmw'
 constant integer CORRUPT_PROTECTOR = 'ncap'
 constant integer CORRUPT_WAR = 'ncaw'

 
 constant integer UPG_STR_MOON = 'Resm'
 constant integer UPG_STR_WILD = 'Resw'
 constant integer UPG_MOON_ARMOR = 'Rema'
 constant integer UPG_HIDES = 'Rerh'
 constant integer UPG_ULTRAVISION = 'Reuv'
 constant integer UPG_BLESSING = 'Renb'
 constant integer UPG_SCOUT = 'Resc'
 constant integer UPG_GLAIVE = 'Remg'
 constant integer UPG_BOWS = 'Reib'
 constant integer UPG_MARKSMAN = 'Remk'
 constant integer UPG_DRUID_TALON = 'Redt'
 constant integer UPG_DRUID_CLAW = 'Redc'
 constant integer UPG_ABOLISH = 'Resi'
 constant integer UPG_CHIM_ACID = 'Recb'
 constant integer UPG_HIPPO_TAME = 'Reht'
 constant integer UPG_BOLT = 'Repd'
 constant integer UPG_MARK_CLAW = 'Reeb'
 constant integer UPG_MARK_TALON = 'Reec'
 constant integer UPG_HARD_SKIN = 'Rehs'
 constant integer UPG_RESIST_SKIN = 'Rers'
 constant integer UPG_WELL_SPRING = 'Rews'

 
 
 
 constant integer DEMON_GATE = 'ndmg'
 constant integer FELLHOUND = 'nfel'
 constant integer INFERNAL = 'ninf'
 constant integer DOOMGUARD = 'nbal'
 constant integer SATYR = 'nsty'
 constant integer TRICKSTER = 'nsat'
 constant integer SHADOWDANCER = 'nsts'
 constant integer SOULSTEALER = 'nstl'
 constant integer HELLCALLER = 'nsth'
 constant integer SKEL_ARCHER = 'nska'
 constant integer SKEL_MARKSMAN = 'nskm'
 constant integer SKEL_BURNING = 'nskf'
 constant integer SKEL_GIANT = 'nskg'
 constant integer FURBOLG = 'nfrl'
 constant integer FURBOLG_TRACKER = 'nfrb'
 constant integer FURBOLG_SHAMAN = 'nfrs'
 constant integer FURBOLG_CHAMP = 'nfrg'
 constant integer FURBOLG_ELDER = 'nfre'

 
 
 

 
 constant integer NAGA_SORCERESS = 'Nngs' 
 constant integer NAGA_VASHJ = 'Hvsh' 

 
 constant integer NAGA_DRAGON = 'nsnp' 
 constant integer NAGA_WITCH = 'nnsw'
 constant integer NAGA_SERPENT = 'nwgs' 
 constant integer NAGA_HYDRA = 'nhyc' 

 constant integer NAGA_SLAVE = 'nmpe' 
 constant integer NAGA_SNAP_DRAGON = NAGA_DRAGON 
 constant integer NAGA_COUATL = NAGA_SERPENT 
 constant integer NAGA_SIREN = NAGA_WITCH 
 constant integer NAGA_MYRMIDON = 'nmyr' 
 constant integer NAGA_REAVER = 'nnmg' 
 constant integer NAGA_TURTLE = NAGA_HYDRA 
 constant integer NAGA_ROYAL = 'nnrg' 

 
 constant integer NAGA_TEMPLE = 'nntt' 
 constant integer NAGA_CORAL = 'nnfm' 
 constant integer NAGA_SHRINE = 'nnsa' 
 constant integer NAGA_SPAWNING = 'nnsg' 
 constant integer NAGA_GUARDIAN = 'nntg' 
 constant integer NAGA_ALTAR = 'nnad' 

 
 constant integer UPG_NAGA_ARMOR = 'Rnam'
 constant integer UPG_NAGA_ATTACK = 'Rnat'
 constant integer UPG_NAGA_ABOLISH = 'Rnsi'
 constant integer UPG_SIREN = 'Rnsw'
 constant integer UPG_NAGA_ENSNARE = 'Rnen'
 
 constant integer M1 = 60
 constant integer M2 = 2*60
 constant integer M3 = 3*60
 constant integer M4 = 4*60
 constant integer M5 = 5*60
 constant integer M6 = 6*60
 constant integer M7 = 7*60
 constant integer M8 = 8*60
 constant integer M9 = 9*60
 constant integer M10 = 10*60
 constant integer M11 = 11*60
 constant integer M12 = 12*60
 constant integer M13 = 13*60
 constant integer M14 = 14*60
 constant integer M15 = 15*60

 constant integer EASY = 1
 constant integer NORMAL = 2
 constant integer HARD = 3
 constant integer INSANE = 4 

 constant integer MELEE_NEWBIE = 1
 constant integer MELEE_NORMAL = 2
 constant integer MELEE_INSANE = 3

 constant integer ATTACK_CAPTAIN = 1
 constant integer DEFENSE_CAPTAIN = 2
 constant integer BOTH_CAPTAINS = 3

 constant integer BUILD_UNIT = 1
 constant integer BUILD_UPGRADE = 2
 constant integer BUILD_EXPAND = 3

 constant integer UPKEEP_TIER1 = 50
 constant integer UPKEEP_TIER2 = 80

 

 player ai_player

 integer sleep_seconds
 integer total_gold = 0
 integer total_wood = 0
 integer gold_buffer = 0 
 integer difficulty = NORMAL
 integer exp_seen = 0
 integer racial_farm = 'hhou'
 integer hero_id = 'Hamg'
 integer hero_id2 = 'Hmkg'
 integer hero_id3 = 'Hpal'
 integer array skill
 integer array skills1
 integer array skills2
 integer array skills3
 integer max_hero_level = 0

 integer array harass_qty
 integer array harass_max
 integer array harass_units
 integer harass_length = 0

 integer array defense_qty
 integer array defense_units
 integer defense_length = 0

 integer array build_qty
 integer array build_type
 integer array build_item
 integer array build_town
 integer build_length = 0

 integer campaign_gold_peons = 5
 integer campaign_wood_peons = 3
 integer campaign_basics_speed = 5

 integer min_creeps = -1
 integer max_creeps = -1

 boolean harvest_town1 = true
 boolean harvest_town2 = true
 boolean harvest_town3 = true
 boolean do_campaign_farms = true
 boolean two_heroes = false
 boolean allow_air_creeps = false
 boolean take_exp = false
 boolean allow_signal_abort = false
 boolean ready_for_zeppelin = true
 boolean get_zeppelin = false

 boolean build_campaign_attackers = true

 boolean do_debug_cheats = false
 boolean trace_on = true
 boolean zep_next_wave = false
 boolean form_group_timeouts = true
endglobals


function PlayerEx takes integer slot returns player
 return Player(slot-1)
endfunction


function Trace takes string message returns nothing
 if trace_on then
 call DisplayText(GetAiPlayer(),message)
 endif
endfunction


function TraceI takes string message, integer val returns nothing
 if trace_on then
 call DisplayTextI(GetAiPlayer(),message,val)
 endif
endfunction


function TraceII takes string message, integer v1, integer v2 returns nothing
 if trace_on then
 call DisplayTextII(GetAiPlayer(),message,v1,v2)
 endif
endfunction


function TraceIII takes string message, integer v1, integer v2, integer v3 returns nothing
 if trace_on then
 call DisplayTextIII(GetAiPlayer(),message,v1,v2,v3)
 endif
endfunction


function InitAI takes nothing returns nothing
 set ai_player = Player(GetAiPlayer())
 set sleep_seconds = 0
 call StopGathering()
endfunction


function StandardAI takes code heroes, code peons, code attacks returns nothing

 local boolean isNewbie = (MeleeDifficulty() == MELEE_NEWBIE)

 call InitAI()

 call SetMeleeAI()

 call SetDefendPlayer(true)
 call SetGroupsFlee(not isNewbie)
 call SetHeroesBuyItems(not isNewbie)
 call SetHeroesFlee(true)
 call SetHeroesTakeItems(true)
 call SetIgnoreInjured(true)
 call SetPeonsRepair(true)
 call SetSmartArtillery(not isNewbie)
 call SetTargetHeroes(not isNewbie)
 call SetUnitsFlee(not isNewbie)
 call SetWatchMegaTargets(true)

 call CreateCaptains()

 call SetHeroLevels(heroes)

 call Sleep(0.1)
 call StartThread(peons)
 call StartThread(attacks)
endfunction




function Min takes integer A, integer B returns integer
 if A < B then
 return A
 else
 return B
 endif
endfunction

function Max takes integer A, integer B returns integer
 if A > B then
 return A
 else
 return B
 endif
endfunction

function SetZepNextWave takes nothing returns nothing
 set zep_next_wave = true
endfunction

function SuicideSleep takes integer seconds returns nothing
 set sleep_seconds = sleep_seconds - seconds
 loop
 exitwhen seconds <= 0
 exitwhen allow_signal_abort and CommandsWaiting() != 0

 if seconds >= 5 then
 call Sleep(5)
 set seconds = seconds - 5
 else
 call Sleep(seconds)
 set seconds = 0
 endif
 endloop
endfunction


function WaitForSignal takes nothing returns integer
 local integer cmd
 local boolean display = false 
 loop
 exitwhen CommandsWaiting() != 0

 
 call Trace("waiting for a signal to begin AI script...\n")
 set display = true
 call Sleep(2)
 exitwhen CommandsWaiting() != 0
 call Sleep(2)
 exitwhen CommandsWaiting() != 0
 call Sleep(2)
 exitwhen CommandsWaiting() != 0
 call Sleep(2)
 exitwhen CommandsWaiting() != 0
 call Sleep(2)
 

 endloop

 
 if display then
 call Trace("signal received, beginning AI script\n")
 endif
 

 set cmd = GetLastCommand()
 call PopLastCommand()
 return cmd
endfunction


function SetWoodPeons takes integer count returns nothing
 set campaign_wood_peons = count
endfunction


function SetGoldPeons takes integer count returns nothing
 set campaign_gold_peons = count
endfunction


function SetHarvestLumber takes boolean harvest returns nothing
 if harvest then
 set campaign_wood_peons = 3
 else
 set campaign_wood_peons = 0
 endif
endfunction


function SetFormGroupTimeouts takes boolean state returns nothing
 set form_group_timeouts = state
endfunction


function DoCampaignFarms takes boolean state returns nothing
 set do_campaign_farms = state
endfunction


function GetMinorCreep takes nothing returns unit
 return GetCreepCamp(0,9,false)
endfunction


function GetMajorCreep takes nothing returns unit
 return GetCreepCamp(10,100,allow_air_creeps)
endfunction


function GetGold takes nothing returns integer
 return GetPlayerState(ai_player,PLAYER_STATE_RESOURCE_GOLD)
endfunction


function GetWood takes nothing returns integer
 return GetPlayerState(ai_player,PLAYER_STATE_RESOURCE_LUMBER)
endfunction


function InitBuildArray takes nothing returns nothing
 set build_length = 0
endfunction


function InitAssaultGroup takes nothing returns nothing
 set harass_length = 0
endfunction


function InitDefenseGroup takes nothing returns nothing
 set defense_length = 0
endfunction


function InitMeleeGroup takes nothing returns nothing
 call InitAssaultGroup()
 call RemoveInjuries()
 call RemoveSiege()
endfunction


function PrepFullSuicide takes nothing returns nothing
 call InitAssaultGroup()
 call InitDefenseGroup()
 set campaign_gold_peons = 0
 set campaign_wood_peons = 0
endfunction


function SetReplacements takes integer easy, integer med, integer hard returns nothing
 if difficulty == EASY then
 call SetReplacementCount(easy)
 elseif difficulty == NORMAL then
 call SetReplacementCount(med)
 else
 call SetReplacementCount(hard)
 endif
endfunction


function StartTownBuilder takes code func returns nothing
 call StartThread(func)
endfunction


function SetBuildAll takes integer t, integer qty, integer unitid, integer town returns nothing
 if qty > 0 then
 set build_qty[build_length] = qty
 set build_type[build_length] = t
 set build_item[build_length] = unitid
 set build_town[build_length] = town
 set build_length = build_length + 1
 endif
endfunction


function SetBuildUnit takes integer qty, integer unitid returns nothing
 call SetBuildAll(BUILD_UNIT,qty,unitid,-1)
endfunction


function SetBuildNext takes integer qty, integer unitid returns nothing
 local integer has = GetUnitCount(unitid)
 if has >= qty then
 return
 endif
 call SetBuildAll(BUILD_UNIT,GetUnitCountDone(unitid)+1,unitid,-1)
endfunction


function SetBuildUnitEx takes integer easy, integer med, integer hard, integer unitid returns nothing
 if difficulty == EASY then
 call SetBuildAll(BUILD_UNIT,easy,unitid,-1)
 elseif difficulty == NORMAL then
 call SetBuildAll(BUILD_UNIT,med,unitid,-1)
 else
 call SetBuildAll(BUILD_UNIT,hard,unitid,-1)
 endif
endfunction


function SecondaryTown takes integer town, integer qty, integer unitid returns nothing
 call SetBuildAll(BUILD_UNIT,qty,unitid,town)
endfunction


function SecTown takes integer town, integer qty, integer unitid returns nothing
 call SetBuildAll(BUILD_UNIT,qty,unitid,town)
endfunction


function SetBuildUpgr takes integer qty, integer unitid returns nothing
 if MeleeDifficulty() != MELEE_NEWBIE or qty == 1 then
 call SetBuildAll(BUILD_UPGRADE,qty,unitid,-1)
 endif
endfunction


function SetBuildUpgrEx takes integer easy, integer med, integer hard, integer unitid returns nothing
 if difficulty == EASY then
 call SetBuildAll(BUILD_UPGRADE,easy,unitid,-1)
 elseif difficulty == NORMAL then
 call SetBuildAll(BUILD_UPGRADE,med,unitid,-1)
 else
 call SetBuildAll(BUILD_UPGRADE,hard,unitid,-1)
 endif
endfunction


function SetBuildExpa takes integer qty, integer unitid returns nothing
 call SetBuildAll(BUILD_EXPAND,qty,unitid,-1)
endfunction


function StartUpgrade takes integer level, integer upgid returns boolean
 local integer gold_cost
 local integer wood_cost

 if GetUpgradeLevel(upgid) >= level then
 return true
 endif

 set gold_cost = GetUpgradeGoldCost(upgid)
 if total_gold < gold_cost then
 return false
 endif

 set wood_cost = GetUpgradeWoodCost(upgid)
 if total_wood < wood_cost then
 return false
 endif

 return SetUpgrade(upgid)
endfunction


function BuildFactory takes integer unitid returns nothing
 if GetGold() > 1000 and GetWood() > 500 then
 call SetBuildUnit( 2, unitid )
 else
 call SetBuildUnit( 1, unitid )
 endif
endfunction


function HallsCompleted takes integer unitid returns boolean
 return GetUnitCount(unitid) == GetUnitCountDone(unitid) 
endfunction


function GuardSecondary takes integer townid, integer qty, integer unitid returns nothing
 if TownHasHall(townid) and TownHasMine(townid) then
 call SecondaryTown( townid, qty, unitid )
 endif
endfunction


function GetUnitCountEx takes integer unitid, boolean only_done, integer townid returns integer
 if townid == -1 then
 if only_done then
 return GetUnitCountDone(unitid)
 else
 return GetUnitCount(unitid)
 endif
 else
 return GetTownUnitCount(unitid,townid,only_done)
 endif
endfunction


function TownCountEx takes integer unitid, boolean only_done, integer townid returns integer

 local integer have_qty = GetUnitCountEx(unitid,only_done,townid)

 if unitid == TOWN_HALL then
 set have_qty = have_qty + GetUnitCountEx(KEEP,false,townid) + GetUnitCountEx(CASTLE,false,townid)
 elseif unitid == KEEP then
 set have_qty = have_qty + GetUnitCountEx(CASTLE,false,townid)

 elseif unitid == WATCH_TOWER then
 set have_qty = have_qty + GetUnitCountEx(GUARD_TOWER,false,townid) + GetUnitCountEx(CANNON_TOWER,false,townid) + GetUnitCountEx(ARCANE_TOWER,false,townid)

 elseif unitid == PEASANT then
 set have_qty = have_qty + GetUnitCountEx(MILITIA,false,townid)

 elseif unitid == GREAT_HALL then
 set have_qty = have_qty + GetUnitCountEx(STRONGHOLD,false,townid) + GetUnitCountEx(FORTRESS,false,townid)
 elseif unitid == STRONGHOLD then
 set have_qty = have_qty + GetUnitCountEx(FORTRESS,false,townid)

 elseif unitid == HEAD_HUNTER then
 set have_qty = have_qty + GetUnitCountEx(BERSERKER,false,townid)

 elseif unitid == SPIRIT_WALKER then
 set have_qty = have_qty + GetUnitCountEx(SPIRIT_WALKER_M,false,townid)
 elseif unitid == SPIRIT_WALKER_M then
 set have_qty = have_qty + GetUnitCountEx(SPIRIT_WALKER,only_done,townid)

 elseif unitid == NECROPOLIS_1 then
 set have_qty = have_qty + GetUnitCountEx(NECROPOLIS_2,false,townid) + GetUnitCountEx(NECROPOLIS_3,false,townid)
 elseif unitid == NECROPOLIS_2 then
 set have_qty = have_qty + GetUnitCountEx(NECROPOLIS_3,false,townid)

 elseif unitid == ZIGGURAT_1 then
 set have_qty = have_qty + GetUnitCountEx(ZIGGURAT_2,false,townid) + GetUnitCountEx(ZIGGURAT_FROST,false,townid)

 elseif unitid == GARGOYLE then
 set have_qty = have_qty + GetUnitCountEx(GARGOYLE_MORPH,false,townid)

 elseif unitid == TREE_LIFE then
 set have_qty = have_qty + GetUnitCountEx(TREE_AGES,false,townid) + GetUnitCountEx(TREE_ETERNITY,false,townid)
 elseif unitid == TREE_AGES then
 set have_qty = have_qty + GetUnitCountEx(TREE_ETERNITY,false,townid)

 elseif unitid == DRUID_TALON then
 set have_qty = have_qty + GetUnitCountEx(DRUID_TALON_M,false,townid)
 elseif unitid == DRUID_TALON_M then
 set have_qty = have_qty + GetUnitCountEx(DRUID_TALON,only_done,townid)

 elseif unitid == DRUID_CLAW then
 set have_qty = have_qty + GetUnitCountEx(DRUID_CLAW_M,false,townid)
 elseif unitid == DRUID_CLAW_M then
 set have_qty = have_qty + GetUnitCountEx(DRUID_CLAW,only_done,townid)

 elseif unitid == ILLIDAN then
 set have_qty = have_qty + GetUnitCountEx(ILLIDAN_DEMON,false,townid)

 endif
 return have_qty
endfunction


function TownCountDone takes integer base returns integer
 return TownCountEx(base,true,-1)
endfunction


function TownCount takes integer base returns integer
 return TownCountEx(base,false,-1)
endfunction


function BasicExpansion takes boolean build_it, integer unitid returns nothing
 if build_it and HallsCompleted(unitid) then
 call SetBuildExpa( TownCount(unitid)+1, unitid )
 endif
endfunction


function UpgradeAll takes integer baseid, integer newid returns nothing
 call SetBuildUnit( TownCountDone(baseid), newid )
endfunction


function TownCountTown takes integer base, integer townid returns integer
 return TownCountEx(base,false,townid)
endfunction




function FoodPool takes integer food, boolean weak, integer id1, integer use1, boolean strong, integer id2, integer use2 returns nothing
 if strong then
 call SetBuildUnit( (food - use1 * TownCount(id1)) / use2, id2 )
 elseif weak then
 call SetBuildUnit( (food - use2 * TownCount(id2)) / use1, id1 )
 endif
endfunction




function MeleeTownHall takes integer townid, integer unitid returns nothing
 if TownHasMine(townid) and not TownHasHall(townid) then
 call SecondaryTown ( townid, 1, unitid )
 endif
endfunction


function WaitForUnits takes integer unitid, integer qty returns nothing
 loop
 exitwhen TownCountDone(unitid) == qty
 call Sleep(2)
 endloop
endfunction


function StartUnit takes integer ask_qty, integer unitid, integer town returns boolean
 local integer have_qty
 local integer need_qty
 local integer afford_gold
 local integer afford_wood
 local integer afford_qty
 local integer gold_cost
 local integer wood_cost

 
 
 
 if town == -1 then
 set have_qty = TownCount(unitid)
 else
 set have_qty = TownCountTown(unitid,town)
 endif

 if have_qty >= ask_qty then
 return true
 endif
 set need_qty = ask_qty - have_qty

 
 
 
 set gold_cost = GetUnitGoldCost(unitid)
 set wood_cost = GetUnitWoodCost(unitid)

 if gold_cost == 0 then
 set afford_gold = need_qty
 else
 set afford_gold = total_gold / gold_cost
 endif
 if afford_gold < need_qty then
 set afford_qty = afford_gold
 else
 set afford_qty = need_qty
 endif

 if wood_cost == 0 then
 set afford_wood = need_qty
 else
 set afford_wood = total_wood / wood_cost
 endif
 if afford_wood < afford_qty then
 set afford_qty = afford_wood
 endif

 
 if afford_qty < 1 then
 return false
 endif

 
 
 
 
 set total_gold = total_gold - gold_cost * need_qty
 set total_wood = total_wood - wood_cost * need_qty

 if total_gold < 0 then
 set total_gold = 0
 endif
 if total_wood < 0 then
 set total_wood = 0
 endif

 
 
 
 
 
 return SetProduce(afford_qty,unitid,town)
endfunction


function WaitForTown takes integer towns, integer townid returns nothing
 local integer i = 0
 loop
 call Sleep(10)
 exitwhen TownCount(townid) >= towns
 set i = i + 1
 exitwhen i == 12
 endloop
endfunction


function StartExpansion takes integer qty, integer hall returns boolean
 local integer count
 local integer town
 local unit peon
 local integer gold_cost

 set count = TownCount(hall)
 if count >= qty then
 return true
 endif

 set town = GetNextExpansion()
 if town == -1 then
 return true
 endif

 set take_exp = true

 set gold_cost = GetUnitGoldCost(hall)
 if gold_cost > total_gold then
 return false
 endif
 set total_gold = total_gold - gold_cost

 if GetExpansionFoe() != null then
 return true
 endif

 set peon = GetExpansionPeon()
 if peon != null then
 return SetExpansion(peon,hall)
 endif

 return true
endfunction


function OneBuildLoop takes nothing returns nothing
 local integer index = 0
 local integer qty
 local integer id
 local integer tp

 set total_gold = GetGold() - gold_buffer
 set total_wood = GetWood()

 loop
 exitwhen index == build_length

 set qty = build_qty [index]
 set id = build_item[index]
 set tp = build_type[index]

 
 if tp == BUILD_UNIT then
 if not StartUnit(qty,id,build_town[index]) then
 return
 endif

 
 elseif tp == BUILD_UPGRADE then
 call StartUpgrade(qty,id)

 
 else 
 if not StartExpansion(qty,id) then
 return
 endif
 endif

 set index = index + 1
 endloop
endfunction


function StaggerSleep takes real base, real spread returns nothing
 call Sleep(base + spread * I2R(GetAiPlayer()) / I2R(GetPlayers()))
endfunction


function BuildLoop takes nothing returns nothing
 call OneBuildLoop()
 call StaggerSleep(1,2)
 loop
 call OneBuildLoop()
 call Sleep(2)
 endloop
endfunction


function StartBuildLoop takes nothing returns nothing
 call StartThread(function BuildLoop)
endfunction


function SetInitialWave takes integer seconds returns nothing
 set sleep_seconds = seconds
endfunction


function AddSleepSeconds takes integer seconds returns nothing
 set sleep_seconds = sleep_seconds + seconds
endfunction


function SleepForever takes nothing returns nothing
 call Trace("going to sleep forever\n") 
 loop
 call Sleep(100)
 endloop
endfunction


function PlayGame takes nothing returns nothing
 call StartBuildLoop()
 call SleepForever()
endfunction


function ConvertNeeds takes integer unitid returns nothing
 if GetUnitCount(unitid) < 1 then
 call StartUnit(1,unitid,-1)
 endif
endfunction


function Conversions takes integer desire, integer unitid returns nothing

 if GetUnitCount(unitid) >= desire then
 return
 endif

 if unitid == HIPPO_RIDER then
 call ConvertNeeds(ARCHER)
 call ConvertNeeds(HIPPO)
 call MergeUnits(desire,ARCHER,HIPPO,HIPPO_RIDER)

 elseif unitid == BLK_SPHINX then
 call ConvertNeeds(OBS_STATUE)
 call ConvertUnits(desire,OBS_STATUE)
 endif
endfunction


function SetAssaultGroup takes integer qty, integer max, integer unitid returns nothing
 call Conversions(max,unitid)

 if qty <= 0 and TownCountDone(unitid) == 0 then
 return
 endif
 set harass_qty[harass_length] = qty
 set harass_max[harass_length] = max
 set harass_units[harass_length] = unitid
 set harass_length = harass_length + 1
endfunction


function Interleave3 takes integer e1, integer m1, integer h1, integer u1, integer e2, integer m2, integer h2, integer u2, integer e3, integer m3, integer h3, integer u3 returns nothing
 local integer i1 = 1
 local integer i2 = 1
 local integer i3 = 1
 local integer q1
 local integer q2
 local integer q3

 if difficulty == EASY then
 set q1 = e1
 set q2 = e2
 set q3 = e3
 elseif difficulty == NORMAL then
 set q1 = m1
 set q2 = m2
 set q3 = m3
 else 
 set q1 = h1
 set q2 = h2
 set q3 = h3
 endif

 loop
 exitwhen q1<=0 and q2<=0 and q3<=0

 if q1 > 0 then
 call SetAssaultGroup(i1,i1,u1)
 set q1 = q1 - 1
 set i1 = i1 + 1
 endif

 if q2 > 0 then
 call SetAssaultGroup(i2,i2,u2)
 set q2 = q2 - 1
 set i2 = i2 + 1
 endif

 if q3 > 0 then
 call SetAssaultGroup(i3,i3,u3)
 set q3 = q3 - 1
 set i3 = i3 + 1
 endif
 endloop
endfunction


function SetMeleeGroup takes integer unitid returns nothing
 if unitid == hero_id then
 call SetAssaultGroup(1,9,unitid)
 else
 call SetAssaultGroup((TownCountDone(unitid)*3)/4,20,unitid)
 endif
endfunction


function CampaignDefender takes integer level, integer qty, integer unitid returns nothing
 if qty > 0 and difficulty >= level then
 set defense_qty[defense_length] = qty
 set defense_units[defense_length] = unitid
 set defense_length = defense_length + 1
 call Conversions(qty,unitid)
 call SetBuildUnit(qty,unitid)
 endif
endfunction


function CampaignDefenderEx takes integer easy, integer med, integer hard, integer unitid returns nothing
 if difficulty == EASY then
 call CampaignDefender(EASY,easy,unitid)
 elseif difficulty == NORMAL then
 call CampaignDefender(NORMAL,med,unitid)
 else
 call CampaignDefender(HARD,hard,unitid)
 endif
endfunction


function CampaignAttacker takes integer level, integer qty, integer unitid returns nothing
 if qty > 0 and difficulty >= level then 
 call SetAssaultGroup(qty,qty,unitid)
 endif
endfunction


function CampaignAttackerEx takes integer easy, integer med, integer hard, integer unitid returns nothing
 if difficulty == EASY then
 call CampaignAttacker(EASY,easy,unitid)
 elseif difficulty == NORMAL then
 call CampaignAttacker(NORMAL,med,unitid)
 else
 call CampaignAttacker(HARD,hard,unitid)
 endif
endfunction


function FormGroup takes integer seconds, boolean testReady returns nothing
 local integer index
 local integer count
 local integer unitid
 local integer desire
 local integer readyPercent

 
 if testReady == true then
 set readyPercent = 50
 call Trace("forming group, requiring healthy guys\n") 
 else
 set readyPercent = 0
 call Trace("forming group, unit health not important\n") 
 endif

 call Trace("trying to gather forces\n") 

 loop
 call SuicideSleep(seconds)
 call InitAssault()

 set index = 0
 loop
 exitwhen index == harass_length

 set unitid = harass_units[index]
 set desire = harass_max[index]
 set count = TownCountDone(unitid)

 call Conversions(desire,unitid)

 if count >= desire then
 call AddAssault(desire,unitid)
 else
 set desire = harass_qty[index]

 if count < desire then
 call AddAssault(desire,unitid)
 else
 call AddAssault(count,unitid)
 endif
 endif

 set index = index + 1
 endloop

 
 if form_group_timeouts and (sleep_seconds < -60) then
 call Trace("exit form group -- timeout\n")
 elseif CaptainInCombat(true) then
 call Trace("exit form group -- can't form while already in combat\n")
 elseif CaptainIsFull() and CaptainReadiness() >= readyPercent then
 call Trace("exit form group -- ready\n")
 endif
 

 
 exitwhen form_group_timeouts and (sleep_seconds < -60)
 exitwhen CaptainInCombat(true)
 exitwhen CaptainIsFull() and CaptainReadiness() >= readyPercent
 endloop
endfunction


function WavePrepare takes integer unitid returns integer
 return GetUnitBuildTime(unitid)
endfunction


function PrepTime takes nothing returns integer
 local integer unitid
 local integer missing
 local integer prep
 local integer count
 local integer largest = 30
 local integer index = 0

 loop
 exitwhen index == harass_length

 set unitid = harass_units[index]
 set missing = harass_qty[index] + IgnoredUnits(unitid) - TownCount(unitid)
 set prep = WavePrepare(unitid) * missing

 if prep > largest then
 set largest = prep
 endif

 set index = index + 1
 endloop
 call TraceI("next wave will require around %d seconds to build and gather\n",largest) 

 return largest
endfunction


function PrepSuicideOnPlayer takes integer seconds returns boolean
 local integer wave_prep = PrepTime()
 local integer save_length

 set save_length = harass_length
 set harass_length = 0

 call AddSleepSeconds(seconds)
 if sleep_seconds-wave_prep > 0 then
 call TraceI("going to sleep for %d seconds before gathering next attack wave\n",sleep_seconds-wave_prep) 
 call SuicideSleep(sleep_seconds-wave_prep)
 endif

 call Trace("preparing suicide attack wave\n") 

 set harass_length = save_length
 if harass_length < 1 then
 call Trace("ERROR - no units specificed, exiting early\n") 
 return false
 endif

 return true
endfunction


function SleepUntilAtGoal takes nothing returns nothing
 loop
 exitwhen CaptainRetreating()
 exitwhen CaptainAtGoal() 
 exitwhen CaptainIsHome() 
 exitwhen CaptainIsEmpty() 
 call SuicideSleep(3)
 endloop
endfunction


function SleepInCombat takes nothing returns nothing
 local integer count = 0
 debug call Trace("SleepInCombat\n")
 loop
 loop
 exitwhen not CaptainInCombat(true) 
 exitwhen CaptainIsEmpty() 
 call SuicideSleep(1)
 endloop

 set count = count + 1
 exitwhen count >= 8
 endloop
 debug call Trace("exit SleepInCombat\n")
endfunction


function AttackMoveXYA takes integer x, integer y returns nothing

 if zep_next_wave then
 call LoadZepWave(x,y)
 set zep_next_wave = false
 endif

 call AttackMoveXY(x,y)
 call SleepUntilAtGoal()
 call SleepInCombat()
endfunction


function SuicideOnPlayerWave takes nothing returns nothing
 call Trace("waiting for attack wave to enter combat\n") 
 loop
 
 if allow_signal_abort and CommandsWaiting() != 0 then
 call Trace("ABORT -- attack wave override\n")
 endif

 if CaptainInCombat(true) then
 call Trace("done - captain has entered combat\n")
 endif

 if CaptainIsEmpty() then
 call Trace("done - all units are dead\n")
 endif

 if sleep_seconds < -300 then
 call Trace("done - timeout, took too long to reach engage the enemy\n")
 endif
 

 exitwhen allow_signal_abort and CommandsWaiting() != 0

 exitwhen CaptainInCombat(true)
 exitwhen CaptainIsEmpty()
 call SuicideSleep(10)
 exitwhen sleep_seconds < -300
 endloop

 call Trace("waiting for attack wave to die\n") 
 loop
 
 if allow_signal_abort and CommandsWaiting() != 0 then
 call Trace("ABORT - attack wave override\n")
 endif

 if CaptainIsEmpty() then
 call Trace("done - all units are dead\n")
 endif

 if sleep_seconds < -300 then
 call Trace("done - timeout, took too long to reach engage the enemy\n")
 endif
 

 exitwhen allow_signal_abort and CommandsWaiting() != 0

 exitwhen CaptainIsEmpty()
 call SuicideSleep(10)
 exitwhen sleep_seconds < -300
 endloop
endfunction


function CommonSuicideOnPlayer takes boolean standard, boolean bldgs, integer seconds, player p, integer x, integer y returns nothing
 local integer save_peons

 if not PrepSuicideOnPlayer(seconds) then
 return
 endif

 set save_peons = campaign_wood_peons
 set campaign_wood_peons = 0

 loop
 
 if allow_signal_abort and CommandsWaiting() != 0 then
 call Trace("ABORT -- attack wave override\n")
 endif
 

 exitwhen allow_signal_abort and CommandsWaiting() != 0

 loop
 exitwhen allow_signal_abort and CommandsWaiting() != 0

 call FormGroup(5,true)
 exitwhen sleep_seconds <= 0
 call TraceI("waiting %d seconds before suicide\n",sleep_seconds) 
 endloop

 if standard then
 if bldgs then
 exitwhen SuicidePlayer(p,sleep_seconds >= -60)
 else
 exitwhen SuicidePlayerUnits(p,sleep_seconds >= -60)
 endif
 else
 call AttackMoveXYA(x,y)
 endif

 call TraceI("waiting %d seconds before timeout\n",60+sleep_seconds) 
 call SuicideSleep(5)
 endloop

 set campaign_wood_peons = save_peons
 set harass_length = 0

 call SuicideOnPlayerWave()
endfunction


function SuicideOnPlayer takes integer seconds, player p returns nothing
 call CommonSuicideOnPlayer(true,true,seconds,p,0,0)
endfunction


function SuicideOnUnits takes integer seconds, player p returns nothing
 call CommonSuicideOnPlayer(true,false,seconds,p,0,0)
endfunction


function SuicideOnPoint takes integer seconds, player p, integer x, integer y returns nothing
 call CommonSuicideOnPlayer(false,false,seconds,p,x,y)
endfunction


function SuicideUntilSignal takes integer seconds, player p returns nothing
 local integer save
 local integer wave_prep = PrepTime()

 loop
 call AddSleepSeconds(seconds)
 if sleep_seconds-wave_prep > 0 then
 call SuicideSleep(sleep_seconds-wave_prep)
 endif

 set save = campaign_wood_peons
 set campaign_wood_peons = 0
 loop
 loop
 call FormGroup(5, true)
 exitwhen sleep_seconds <= 0
 exitwhen CommandsWaiting() != 0
 endloop
 exitwhen SuicidePlayer(p,sleep_seconds >= -60)
 exitwhen CommandsWaiting() != 0
 call SuicideSleep(3)
 endloop
 set campaign_wood_peons = save

 loop
 exitwhen CaptainIsEmpty()
 exitwhen CommandsWaiting() != 0
 call SuicideSleep(5)
 endloop
 exitwhen CommandsWaiting() != 0
 endloop
endfunction


function SuicideOnce takes integer easy, integer med, integer hard, integer unitid returns nothing
 if difficulty == EASY then
 call SuicideUnit(easy,unitid)
 elseif difficulty == NORMAL then
 call SuicideUnit(med,unitid)
 else
 call SuicideUnit(hard,unitid)
 endif
endfunction


function SuicideUnitA takes integer unitid returns nothing
 if unitid != 0 then
 call SuicideUnit(1,unitid)
 endif
 call Sleep(0.1)
endfunction


function SuicideUnitB takes integer unitid, integer playerid returns nothing
 if unitid != 0 then
 call SuicideUnitEx(1,unitid,playerid)
 endif
 call Sleep(0.1)
endfunction


function SuicideUnits takes integer u1, integer u2, integer u3, integer u4, integer u5, integer u6, integer u7, integer u8, integer u9, integer uA returns nothing
 call Trace("MASS SUICIDE - this script is now technically done\n") 

 call PrepFullSuicide()
 loop
 call SuicideUnitA(u1)
 call SuicideUnitA(u2)
 call SuicideUnitA(u3)
 call SuicideUnitA(u4)
 call SuicideUnitA(u5)
 call SuicideUnitA(u6)
 call SuicideUnitA(u7)
 call SuicideUnitA(u8)
 call SuicideUnitA(u9)
 call SuicideUnitA(uA)
 endloop
endfunction


function SuicideUnitsEx takes integer playerid, integer u1, integer u2, integer u3, integer u4, integer u5, integer u6, integer u7, integer u8, integer u9, integer uA returns nothing
 call Trace("MASS SUICIDE - this script is now technically done\n") 

 call PrepFullSuicide()
 loop
 call SuicideUnitB(u1,playerid)
 call SuicideUnitB(u2,playerid)
 call SuicideUnitB(u3,playerid)
 call SuicideUnitB(u4,playerid)
 call SuicideUnitB(u5,playerid)
 call SuicideUnitB(u6,playerid)
 call SuicideUnitB(u7,playerid)
 call SuicideUnitB(u8,playerid)
 call SuicideUnitB(u9,playerid)
 call SuicideUnitB(uA,playerid)
 endloop
endfunction


function SuicideOnPlayerEx takes integer easy, integer med, integer hard, player p returns nothing
 if difficulty == EASY then
 call SuicideOnPlayer(easy,p)
 elseif difficulty == NORMAL then
 call SuicideOnPlayer(med,p)
 else
 call SuicideOnPlayer(hard,p)
 endif
endfunction


function SuicideOnUnitsEx takes integer easy, integer med, integer hard, player p returns nothing
 if difficulty == EASY then
 call SuicideOnUnits(easy,p)
 elseif difficulty == NORMAL then
 call SuicideOnUnits(med,p)
 else
 call SuicideOnUnits(hard,p)
 endif
endfunction


function SuicideOnPointEx takes integer easy, integer med, integer hard, player p, integer x, integer y returns nothing
 if difficulty == EASY then
 call SuicideOnPoint(easy,p,x,y)
 elseif difficulty == NORMAL then
 call SuicideOnPoint(med,p,x,y)
 else
 call SuicideOnPoint(hard,p,x,y)
 endif
endfunction


function ForeverSuicideOnPlayer takes integer seconds, player p returns nothing
 local integer length = harass_length
 loop
 exitwhen allow_signal_abort and CommandsWaiting() != 0
 call SuicideOnPlayer(seconds,p)
 set harass_length = length
 endloop
endfunction


function CommonSleepUntilTargetDead takes unit target, boolean reform returns nothing
 loop
 exitwhen CaptainRetreating()
 exitwhen CaptainReadinessHP() <= 40

 exitwhen not UnitAlive(target)
 exitwhen UnitInvis(target) and not IsUnitDetected(target,ai_player)

 if not TownThreatened() then
 call AttackMoveKill(target)
 endif

 call SuicideSleep(3)

 if reform and sleep_seconds < -40 then
 if CaptainInCombat(true) then
 set sleep_seconds = sleep_seconds + 5
 else
 set sleep_seconds = 0
 call FormGroup(1,false)
 endif
 endif
 endloop
endfunction


function SleepUntilTargetDead takes unit target returns nothing
 call CommonSleepUntilTargetDead(target,false)
endfunction


function ReformUntilTargetDead takes unit target returns nothing
 debug call Trace("ReformUntilTargetDead\n")
 call CommonSleepUntilTargetDead(target,true)
endfunction


function AttackMoveKillA takes unit target returns nothing
 if target == null then
 call SuicideSleep(3)
 return
 endif

 debug call Trace("AttackMoveKillA\n")
 call AttackMoveKill(target)
 call ReformUntilTargetDead(target)
 call SleepInCombat()
endfunction


function MinorCreepAttack takes nothing returns nothing
 local unit target = GetMinorCreep()
 call SetAllianceTarget(target)
 call FormGroup(3, true)
 call AttackMoveKillA(target)
endfunction


function MajorCreepAttack takes nothing returns nothing
 local unit target = GetMajorCreep()
 call SetAllianceTarget(target)
 call FormGroup(3,true)
 call AttackMoveKillA(target)
endfunction


function CreepAttackEx takes nothing returns nothing
 local unit target = GetCreepCamp(min_creeps,max_creeps,allow_air_creeps)
 call SetAllianceTarget(target)
 call FormGroup(3,true)
 call AttackMoveKillA(target)
endfunction


function AnyPlayerAttack takes nothing returns nothing
 local unit hall

 set hall = GetEnemyExpansion()
 if hall == null then
 call StartGetEnemyBase()
 loop
 exitwhen not WaitGetEnemyBase()
 call SuicideSleep(1)
 endloop
 set hall = GetEnemyBase()
 endif

 call SetAllianceTarget(hall)
 call FormGroup(3,true)
 call AttackMoveKillA(hall)
endfunction


function ExpansionAttack takes nothing returns nothing
 local unit creep = GetExpansionFoe()
 local integer x

 call FormGroup(3, true)
 if creep == null then
 set x = GetExpansionX()
 if x != -1 then
 call AttackMoveXYA(x,GetExpansionY())
 endif
 else
 call AttackMoveKillA(creep)
 endif
endfunction




function AddSiege takes nothing returns nothing
 call SetAssaultGroup( 0, 9, SHADE )
 call SetAssaultGroup( 0, 9, MEAT_WAGON )
 call SetAssaultGroup( 0, 9, MORTAR )
 call SetAssaultGroup( 0, 9, TANK )
 call SetAssaultGroup( 0, 9, BALLISTA )
 call SetAssaultGroup( 0, 9, CATAPULT )
endfunction




function GetAllyCount takes player whichPlayer returns integer
 local integer playerIndex = 0
 local integer count = 0
 local player indexPlayer

 loop
 set indexPlayer = Player(playerIndex)

 if whichPlayer != indexPlayer then
 if GetPlayerAlliance(whichPlayer,indexPlayer,ALLIANCE_PASSIVE) then
 if GetPlayerAlliance(indexPlayer,whichPlayer,ALLIANCE_PASSIVE) then
 if GetPlayerStructureCount(indexPlayer,true) > 0 then
 set count = count + 1
 endif
 endif
 endif
 endif
 set playerIndex = playerIndex + 1
 exitwhen playerIndex == 12
 endloop

 return count
endfunction




function SingleMeleeAttack takes boolean needs_exp, boolean has_siege, boolean major_ok, boolean air_units returns nothing
 local boolean can_siege
 local real daytime 
 local unit hall
 local unit mega
 local unit creep
 local unit common
 local integer minimum
 local boolean allies

 call Trace("===SingleMeleeAttack===\n") 

 if TownThreatened() then
 call Trace("sleep 2, town threatened\n") 
 call Sleep(2)
 return
 endif

 
 
 if get_zeppelin and GetGold() > 300 and GetWood() > 100 then
 call Trace("purchase zep\n") 
 call PurchaseZeppelin()
 set get_zeppelin = false
 set ready_for_zeppelin = false
 return
 endif
 set ready_for_zeppelin = true

 
 
 set allies = GetAllyCount(ai_player) > 0
 if allies and MeleeDifficulty() != MELEE_NEWBIE then
 set common = GetAllianceTarget()
 if common != null then
 call Trace("join ally force\n") 
 if GetMegaTarget() != null then
 call AddSiege()
 endif
 call FormGroup(3,true)
 call AttackMoveKillA(common)
 call SetAllianceTarget(null)
 return
 endif
 endif

 
 
 if needs_exp then
 call Trace("needs exp\n") 
 set creep = GetExpansionFoe()
 if creep != null then
 call Trace("attack exp\n") 
 call SetAllianceTarget(creep)
 call FormGroup(3,true)
 call AttackMoveKillA(creep)
 call Sleep(20)
 set take_exp = false
 return
 endif
 endif

 
 
 if MeleeDifficulty() != MELEE_NEWBIE then
 set mega = GetMegaTarget()
 if mega != null then
 call Trace("MEGA TARGET!!!\n") 
 call AddSiege()
 call FormGroup(3,true)
 call AttackMoveKillA(mega)
 return
 endif
 endif

 
 
 set hall = GetEnemyExpansion()
 set daytime = GetFloatGameState(GAME_STATE_TIME_OF_DAY)
 set can_siege = has_siege and (air_units or (daytime>=4 and daytime<=12))

 if hall!=null and (can_siege or not IsTowered(hall)) then

 call Trace("test player town attack\n") 

 if MeleeDifficulty() == MELEE_NEWBIE then
 set minimum = 3
 elseif allies and MeleeDifficulty() == MELEE_NORMAL then
 set minimum = 1
 else
 set minimum = 0 
 endif

 if exp_seen >= minimum then
 call Trace("do player town attack\n") 
 set exp_seen = 0
 call AddSiege()
 call SetAllianceTarget(hall)
 call FormGroup(3,true)
 call AttackMoveKillA(hall)
 return
 endif

 set exp_seen = exp_seen + 1
 endif

 
 
 if can_siege then
 call Trace("attack player's town\n") 
 call AddSiege()
 call AnyPlayerAttack()
 return
 endif

 
 
 if min_creeps != -1 then
 call TraceI("custom creep attack %d\n",max_creeps) 
 call CreepAttackEx()
 return
 endif

 
 
 if major_ok then
 call Trace("major creep attack\n") 
 call MajorCreepAttack()
 return
 endif

 call Trace("minor creep attack\n") 
 call MinorCreepAttack()
endfunction


function GetZeppelin takes nothing returns nothing
 if ready_for_zeppelin then
 set get_zeppelin = true
 endif
endfunction


function FoodUsed takes nothing returns integer
 return GetPlayerState(ai_player,PLAYER_STATE_RESOURCE_FOOD_USED)
endfunction


function FoodCap takes nothing returns integer
 return GetPlayerState(ai_player,PLAYER_STATE_RESOURCE_FOOD_CAP)
endfunction


function FoodSpace takes nothing returns integer
 return FoodCap() - FoodUsed()
endfunction


function FoodAvail takes integer base returns integer
 return GetFoodMade(racial_farm) * TownCount(racial_farm) + GetFoodMade(base) * TownCount(base)
endfunction


function BuildAttackers takes nothing returns nothing
 local integer index = 0
 local integer unitid
 local integer desire
 local integer count

 loop
 exitwhen index == harass_length

 set unitid = harass_units[index]
 set desire = harass_qty[index] + IgnoredUnits(unitid)
 set count = TownCount(unitid)

 if count != desire then
 if not StartUnit(desire,unitid,-1) then
 return
 endif
 endif

 set index = index + 1
 endloop
endfunction


function BuildDefenders takes nothing returns nothing
 local integer index = 0
 local integer unitid
 local integer qty
 loop
 exitwhen index == defense_length

 set unitid = defense_units[index]
 set qty = defense_qty[index]

 call Conversions(qty,unitid)
 call AddDefenders(qty,unitid)

 set index = index + 1
 endloop
endfunction


function CampaignBasicsA takes nothing returns nothing
 local integer food_each = GetFoodMade(racial_farm)
 local integer on_wood

 call ClearHarvestAI()

 if CaptainInCombat(false) then
 set on_wood = 0
 else
 set on_wood = campaign_wood_peons
 endif

 call HarvestGold(0,campaign_gold_peons)
 call HarvestWood(0,on_wood)

 if harvest_town1 then
 call HarvestGold(1,campaign_gold_peons)
 call HarvestWood(1,on_wood)
 endif

 if harvest_town2 then
 call HarvestGold(2,campaign_gold_peons)
 call HarvestWood(2,on_wood)
 endif

 if harvest_town3 then
 call HarvestGold(3,campaign_gold_peons)
 call HarvestWood(3,on_wood)
 endif

 if do_campaign_farms and FoodUsed()+food_each-1 > food_each*(TownCount(racial_farm)+1) then
 call StartUnit(TownCount(racial_farm)+1,racial_farm,-1)
 endif

 if build_campaign_attackers then
 call BuildAttackers()
 endif

 if not CaptainInCombat(false) then
 call BuildDefenders()
 endif

 call FillGuardPosts()
 call ReturnGuardPosts()
endfunction


function CampaignBasics takes nothing returns nothing
 call Sleep(1)
 call CampaignBasicsA()
 call StaggerSleep(1,5)
 loop
 call CampaignBasicsA()
 call Sleep(campaign_basics_speed)
 endloop
endfunction


function CampaignAI takes integer farms, code heroes returns nothing
 if GetGameDifficulty() == MAP_DIFFICULTY_EASY then
 set difficulty = EASY

 call SetTargetHeroes(false)
 call SetUnitsFlee(false)

 elseif GetGameDifficulty() == MAP_DIFFICULTY_NORMAL then
 set difficulty = NORMAL

 call SetTargetHeroes(false)
 call SetUnitsFlee(false)

 elseif GetGameDifficulty() == MAP_DIFFICULTY_HARD then
 set difficulty = HARD

 call SetPeonsRepair(true)
 else
 set difficulty = INSANE
 endif

 call InitAI()
 call InitBuildArray()
 call InitAssaultGroup()
 call CreateCaptains()

 call SetNewHeroes(false)
 if heroes != null then
 call SetHeroLevels(heroes)
 endif

 call SetHeroesFlee(false)
 call SetGroupsFlee(false)
 call SetSlowChopping(true)
 call GroupTimedLife(false)
 call SetCampaignAI()
 call Sleep(0.1)

 set racial_farm = farms
 call StartThread(function CampaignBasics)
 call StartBuildLoop()
endfunction


function UnsummonAll takes nothing returns nothing
 local unit bldg
 loop
 set bldg = GetBuilding(ai_player)
 exitwhen bldg==null
 call Unsummon(bldg)
 call Sleep(2)
 endloop
endfunction




function SkillArrays takes nothing returns integer
 local integer level = GetHeroLevelAI()

 if level > max_hero_level then
 set max_hero_level = level
 endif

 if GetHeroId() == hero_id then
 return skills1[level]
 elseif GetHeroId() == hero_id2 then
 return skills2[level]
 else
 return skills3[level]
 endif
endfunction




function SetSkillArray takes integer index, integer id returns nothing
 local integer i = 1

 if index == 1 then
 if hero_id != id then
 return
 endif
 loop
 set skills1[i] = skill[i]
 exitwhen i == 10
 set i = i + 1
 endloop
 elseif index == 2 then
 if hero_id2 != id then
 return
 endif
 loop
 set skills2[i] = skill[i]
 exitwhen i == 10
 set i = i + 1
 endloop
 else
 if hero_id3 != id then
 return
 endif
 loop
 set skills3[i] = skill[i]
 exitwhen i == 10
 set i = i + 1
 endloop
 endif
endfunction




function AwaitMeleeHeroes takes nothing returns nothing
 if GetUnitCountDone(hero_id2) > 0 then
 set two_heroes = true
 endif
 loop
 exitwhen GetUnitCountDone(hero_id)>0 and (take_exp or (not two_heroes or GetUnitCountDone(hero_id2)>0))
 call Sleep(1)
 endloop
endfunction




function PickMeleeHero takes race raceid returns integer
 local integer first
 local integer second
 local integer third
 local integer last
 local integer array heroes

 
 if raceid == RACE_HUMAN then
 
 set heroes[1] = ARCHMAGE
 set heroes[2] = MTN_KING
 set heroes[3] = PALADIN
 set heroes[4] = BLOOD_MAGE

 
 elseif raceid == RACE_ORC then
 
 set heroes[1] = BLADE_MASTER
 set heroes[2] = FAR_SEER
 set heroes[3] = TAUREN_CHIEF
 set heroes[4] = SHADOW_HUNTER

 
 elseif raceid == RACE_NIGHTELF then
 
 set heroes[1] = DEMON_HUNTER
 set heroes[2] = KEEPER
 set heroes[3] = MOON_BABE
 set heroes[4] = WARDEN

 
 elseif raceid == RACE_UNDEAD then
 
 set heroes[1] = DEATH_KNIGHT
 set heroes[2] = DREAD_LORD
 set heroes[3] = LICH
 set heroes[4] = CRYPT_LORD
 else
 set hero_id = 0
 endif

 if VersionCompatible(VERSION_FROZEN_THRONE) then
 set last = 4
 else
 set last = 3
 endif

 set first = GetRandomInt(1,last)
 set second = GetRandomInt(1,last-1)
 set third = GetRandomInt(1,last-2)

 set hero_id = heroes[first]
 set heroes[first] = heroes[last]
 set hero_id2 = heroes[second]
 set heroes[second] = heroes[last-1]
 set hero_id3 = heroes[third]

 return hero_id
endfunction
`
var dzApi = `#ifndef DZAPIINCLUDE
#define DZAPIINCLUDE

library DzAPI

	native DzAPI_Map_SaveServerValue takes player whichPlayer, string key, string value returns boolean
 native DzAPI_Map_GetServerValue takes player whichPlayer, string key returns string
 native DzAPI_Map_Ladder_SetStat takes player whichPlayer, string key, string value returns nothing
 native DzAPI_Map_IsRPGLadder takes nothing returns boolean
 native DzAPI_Map_GetGameStartTime takes nothing returns integer
 native DzAPI_Map_Stat_SetStat takes player whichPlayer, string key, string value returns nothing
 native DzAPI_Map_GetMatchType 		takes nothing returns integer
 native DzAPI_Map_Ladder_SetPlayerStat takes player whichPlayer, string key, string value returns nothing
	native DzAPI_Map_GetServerValueErrorCode takes player whichPlayer returns integer
 native DzAPI_Map_GetLadderLevel takes player whichPlayer returns integer
	native DzAPI_Map_IsRedVIP takes player whichPlayer returns boolean
	native DzAPI_Map_IsBlueVIP takes player whichPlayer returns boolean
	native DzAPI_Map_GetLadderRank takes player whichPlayer returns integer
	native DzAPI_Map_GetMapLevelRank takes player whichPlayer returns integer
	native DzAPI_Map_GetGuildName takes player whichPlayer returns string
	native DzAPI_Map_GetGuildRole takes player whichPlayer returns integer
	native DzAPI_Map_IsRPGLobby takes nothing returns boolean
	native DzAPI_Map_GetMapLevel takes player whichPlayer returns integer
	native DzAPI_Map_MissionComplete takes player whichPlayer, string key, string value returns nothing
	native DzAPI_Map_GetActivityData takes nothing returns string
	native DzAPI_Map_GetMapConfig takes string key returns string
	native DzAPI_Map_HasMallItem takes player whichPlayer, string key returns boolean
	native DzAPI_Map_SavePublicArchive takes player whichPlayer, string key, string value returns boolean
	native DzAPI_Map_GetPublicArchive takes player whichPlayer, string key returns string
	native DzAPI_Map_UseConsumablesItem takes player whichPlayer, string key returns nothing
	native DzAPI_Map_OrpgTrigger takes player whichPlayer, string key returns nothing
	native DzAPI_Map_GetServerArchiveDrop takes player whichPlayer, string key returns string
	native DzAPI_Map_GetServerArchiveEquip takes player whichPlayer, string key returns integer
	native DzGetMouseTerrainX takes nothing returns real
	native DzGetMouseTerrainY takes nothing returns real
	native DzGetMouseTerrainZ takes nothing returns real
	native DzIsMouseOverUI takes nothing returns boolean
	native DzGetMouseX takes nothing returns integer
	native DzGetMouseY takes nothing returns integer
	native DzGetMouseXRelative takes nothing returns integer
	native DzGetMouseYRelative takes nothing returns integer
	native DzSetMousePos takes integer x, integer y returns nothing
	native DzTriggerRegisterMouseEvent takes trigger trig, integer btn, integer status, boolean sync, string func returns nothing
	native DzTriggerRegisterMouseEventByCode takes trigger trig, integer btn, integer status, boolean sync, code funcHandle returns nothing
	native DzTriggerRegisterKeyEvent takes trigger trig, integer key, integer status, boolean sync, string func returns nothing
	native DzTriggerRegisterKeyEventByCode takes trigger trig, integer key, integer status, boolean sync, code funcHandle returns nothing
	native DzTriggerRegisterMouseWheelEvent takes trigger trig, boolean sync, string func returns nothing
	native DzTriggerRegisterMouseWheelEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
	native DzTriggerRegisterMouseMoveEvent takes trigger trig, boolean sync, string func returns nothing
	native DzTriggerRegisterMouseMoveEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
	native DzGetTriggerKey takes nothing returns integer
	native DzGetWheelDelta takes nothing returns integer
	native DzIsKeyDown takes integer iKey returns boolean
	native DzGetTriggerKeyPlayer takes nothing returns player
	native DzGetWindowWidth takes nothing returns integer
	native DzGetWindowHeight takes nothing returns integer
	native DzGetWindowX takes nothing returns integer
	native DzGetWindowY takes nothing returns integer
	native DzTriggerRegisterWindowResizeEvent takes trigger trig, boolean sync, string func returns nothing
	native DzTriggerRegisterWindowResizeEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
	native DzIsWindowActive takes nothing returns boolean
	native DzDestructablePosition takes destructable d, real x, real y returns nothing
	native DzSetUnitPosition takes unit whichUnit, real x, real y returns nothing
	native DzExecuteFunc takes string funcName returns nothing
	native DzGetUnitUnderMouse takes nothing returns unit
	native DzSetUnitTexture takes unit whichUnit, string path, integer texId returns nothing
	native DzSetMemory takes integer address, real value returns nothing
	native DzSetUnitID takes unit whichUnit, integer id returns nothing
	native DzSetUnitModel takes unit whichUnit, string path returns nothing
	native DzSetWar3MapMap takes string map returns nothing
	native DzTriggerRegisterSyncData takes trigger trig, string prefix, boolean server returns nothing
	native DzSyncData takes string prefix, string data returns nothing
	native DzGetTriggerSyncData takes nothing returns string
	native DzGetTriggerSyncPlayer takes nothing returns player
	native DzFrameHideInterface takes nothing returns nothing
	native DzFrameEditBlackBorders takes real upperHeight, real bottomHeight returns nothing
	native DzFrameGetPortrait takes nothing returns integer
	native DzFrameGetMinimap takes nothing returns integer
	native DzFrameGetCommandBarButton takes integer row, integer column returns integer
	native DzFrameGetHeroBarButton takes integer buttonId returns integer
	native DzFrameGetHeroHPBar takes integer buttonId returns integer
	native DzFrameGetHeroManaBar takes integer buttonId returns integer
	native DzFrameGetItemBarButton takes integer buttonId returns integer
	native DzFrameGetMinimapButton takes integer buttonId returns integer
	native DzFrameGetUpperButtonBarButton takes integer buttonId returns integer
	native DzFrameGetTooltip takes nothing returns integer
	native DzFrameGetChatMessage takes nothing returns integer
	native DzFrameGetUnitMessage takes nothing returns integer
	native DzFrameGetTopMessage takes nothing returns integer
	native DzGetColor takes integer r, integer g, integer b, integer a returns integer
	native DzFrameSetUpdateCallback takes string func returns nothing
	native DzFrameSetUpdateCallbackByCode takes code funcHandle returns nothing
	native DzFrameShow takes integer frame, boolean enable returns nothing
	native DzCreateFrame takes string frame, integer parent, integer id returns integer
	native DzCreateSimpleFrame takes string frame, integer parent, integer id returns integer
	native DzDestroyFrame takes integer frame returns nothing
	native DzLoadToc takes string fileName returns nothing
	native DzFrameSetPoint takes integer frame, integer point, integer relativeFrame, integer relativePoint, real x, real y returns nothing
	native DzFrameSetAbsolutePoint takes integer frame, integer point, real x, real y returns nothing
	native DzFrameClearAllPoints takes integer frame returns nothing
	native DzFrameSetEnable takes integer name, boolean enable returns nothing
	native DzFrameSetScript takes integer frame, integer eventId, string func, boolean sync returns nothing
	native DzFrameSetScriptByCode takes integer frame, integer eventId, code funcHandle, boolean sync returns nothing
	native DzGetTriggerUIEventPlayer takes nothing returns player
	native DzGetTriggerUIEventFrame takes nothing returns integer
	native DzFrameFindByName takes string name, integer id returns integer
	native DzSimpleFrameFindByName takes string name, integer id returns integer
	native DzSimpleFontStringFindByName takes string name, integer id returns integer
	native DzSimpleTextureFindByName takes string name, integer id returns integer
	native DzGetGameUI takes nothing returns integer
	native DzClickFrame takes integer frame returns nothing
	native DzSetCustomFovFix takes real value returns nothing
	native DzEnableWideScreen takes boolean enable returns nothing
	native DzFrameSetText takes integer frame, string text returns nothing
	native DzFrameGetText takes integer frame returns string
	native DzFrameSetTextSizeLimit takes integer frame, integer size returns nothing
	native DzFrameGetTextSizeLimit takes integer frame returns integer
	native DzFrameSetTextColor takes integer frame, integer color returns nothing
	native DzGetMouseFocus takes nothing returns integer
	native DzFrameSetAllPoints takes integer frame, integer relativeFrame returns boolean
	native DzFrameSetFocus takes integer frame, boolean enable returns boolean
	native DzFrameSetModel takes integer frame, string modelFile, integer modelType, integer flag returns nothing
	native DzFrameGetEnable takes integer frame returns boolean
	native DzFrameSetAlpha takes integer frame, integer alpha returns nothing
	native DzFrameGetAlpha takes integer frame returns integer
	native DzFrameSetAnimate takes integer frame, integer animId, boolean autocast returns nothing
	native DzFrameSetAnimateOffset takes integer frame, real offset returns nothing
	native DzFrameSetTexture takes integer frame, string texture, integer flag returns nothing
	native DzFrameSetScale takes integer frame, real scale returns nothing
	native DzFrameSetTooltip takes integer frame, integer tooltip returns nothing
	native DzFrameCageMouse takes integer frame, boolean enable returns nothing
	native DzFrameGetValue takes integer frame returns real
	native DzFrameSetMinMaxValue takes integer frame, real minValue, real maxValue returns nothing
	native DzFrameSetStepValue takes integer frame, real step returns nothing
	native DzFrameSetValue takes integer frame, real value returns nothing
	native DzFrameSetSize takes integer frame, real w, real h returns nothing
	native DzCreateFrameByTagName takes string frameType, string name, integer parent, string template, integer id returns integer
	native DzFrameSetVertexColor takes integer frame, integer color returns nothing
	native DzOriginalUIAutoResetPoint takes boolean enable returns nothing
	native DzFrameSetPriority takes integer frame, integer priority returns nothing
	native DzFrameSetParent takes integer frame, integer parent returns nothing
	native DzFrameSetFont takes integer frame, string fileName, real height, integer flag returns nothing
	native DzFrameGetHeight takes integer frame returns real
	native DzFrameSetTextAlignment takes integer frame, integer align returns nothing
	native DzFrameGetParent takes integer frame returns integer
	native DzSetMemory takes integer frame,real r returns nothing

	function GetPlayerServerValueSuccess takes player whichPlayer returns boolean
		if(DzAPI_Map_GetServerValueErrorCode(whichPlayer)==0)then
			return true
		else
			return false
		endif
	endfunction
 	function DzAPI_Map_StoreInteger takes player whichPlayer, string key, integer value returns nothing
 set key="I"+key
 call DzAPI_Map_SaveServerValue(whichPlayer,key,I2S(value))
 set key=null
 set whichPlayer=null
 endfunction

 function DzAPI_Map_GetStoredInteger takes player whichPlayer, string key returns integer
 local integer value
 set key="I"+key
 set value=S2I(DzAPI_Map_GetServerValue(whichPlayer,key))
 set key=null
 set whichPlayer=null
 return value
 endfunction

 function DzAPI_Map_StoreReal takes player whichPlayer, string key, real value returns nothing
 set key="R"+key
 call DzAPI_Map_SaveServerValue(whichPlayer,key,R2S(value))
 set key=null
 set whichPlayer=null
 endfunction
 function DzAPI_Map_GetStoredReal takes player whichPlayer, string key returns real
 local real value
 set key="R"+key
 set value=S2R(DzAPI_Map_GetServerValue(whichPlayer,key))
 set key=null
 set whichPlayer=null
 return value
 endfunction
 function DzAPI_Map_StoreBoolean takes player whichPlayer, string key, boolean value returns nothing
 set key="B"+key
 if(value)then
 call DzAPI_Map_SaveServerValue(whichPlayer,key,"1")
 else
 call DzAPI_Map_SaveServerValue(whichPlayer,key,"0")
 endif
 set key=null
 set whichPlayer=null
 endfunction
 function DzAPI_Map_GetStoredBoolean takes player whichPlayer, string key returns boolean
 local boolean value
 set key="B"+key
 set key=DzAPI_Map_GetServerValue(whichPlayer,key)
 if(key=="1")then
 set value=true
 else
 set value=false
 endif
 set key=null
 set whichPlayer=null
 return value
 endfunction
 function DzAPI_Map_StoreString takes player whichPlayer, string key, string value returns nothing
 set key="S"+key
 call DzAPI_Map_SaveServerValue(whichPlayer,key,value)
 set key=null
 set whichPlayer=null
 endfunction
 function DzAPI_Map_GetStoredString takes player whichPlayer, string key returns string
 return DzAPI_Map_GetServerValue(whichPlayer,"S"+key)
 endfunction

	function DzAPI_Map_GetStoredUnitType takes player whichPlayer, string key returns integer
 local integer value
 set key="I"+key
 set value=S2I(DzAPI_Map_GetServerValue(whichPlayer,key))
 set key=null
 set whichPlayer=null
 return value
 endfunction

	function DzAPI_Map_GetStoredAbilityId takes player whichPlayer, string key returns integer
 local integer value
 set key="I"+key
 set value=S2I(DzAPI_Map_GetServerValue(whichPlayer,key))
 set key=null
 set whichPlayer=null
 return value
 endfunction
 function DzAPI_Map_FlushStoredMission takes player whichPlayer, string key returns nothing
 call DzAPI_Map_SaveServerValue(whichPlayer,key,null)
 set key=null
 set whichPlayer=null
 endfunction

 function DzAPI_Map_Ladder_SubmitIntegerData takes player whichPlayer, string key, integer value returns nothing
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,I2S(value))
 endfunction
 function DzAPI_Map_Stat_SubmitUnitIdData takes player whichPlayer, string key,integer value returns nothing
 if(value==0)then
 
 else
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,I2S(value))
 endif
 endfunction
 function DzAPI_Map_Stat_SubmitUnitData takes player whichPlayer, string key,unit value returns nothing
 call DzAPI_Map_Stat_SubmitUnitIdData(whichPlayer,key,GetUnitTypeId(value))
 endfunction
 function DzAPI_Map_Ladder_SubmitAblityIdData takes player whichPlayer, string key, integer value returns nothing
 if(value==0)then
 
 else
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,I2S(value))
 endif
 endfunction
 function DzAPI_Map_Ladder_SubmitItemIdData takes player whichPlayer, string key, integer value returns nothing
 local string S
 if(value==0)then
 set S="0"
 else
 set S=I2S(value)
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,S)
 endif
 
 set S=null
 set whichPlayer=null
 endfunction
 function DzAPI_Map_Ladder_SubmitItemData takes player whichPlayer, string key, item value returns nothing
 call DzAPI_Map_Ladder_SubmitItemIdData(whichPlayer,key,GetItemTypeId(value))
 endfunction
 function DzAPI_Map_Ladder_SubmitBooleanData takes player whichPlayer, string key,boolean value returns nothing
 if(value)then
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"1")
 else
 call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"0")
 endif
 endfunction
 function DzAPI_Map_Ladder_SubmitTitle takes player whichPlayer, string value returns nothing
 call DzAPI_Map_Ladder_SetStat(whichPlayer,value,"1")
 endfunction
	function DzAPI_Map_Ladder_SubmitPlayerRank takes player whichPlayer, integer value returns nothing
 call DzAPI_Map_Ladder_SetPlayerStat(whichPlayer,"RankIndex",I2S(value))
 endfunction

	function DzAPI_Map_Ladder_SubmitPlayerExtraExp takes player whichPlayer, integer value returns nothing
 call DzAPI_Map_Ladder_SetStat(whichPlayer,"ExtraExp",I2S(value))
	endfunction

endlibrary

#endif
`
const fs = require("fs")
const path = require("path")


const functionRegExp = /(\/\/[\t ]*@doumentation[\t ]*\([\t ]*".*"[\t ]*\)[\t ]*[\s\n]+)*^[\t ]*((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(nothing|([a-zA-Z]+\s+[a-zA-Z]\w*\s*,\s*)*[a-zA-Z]+\s+[a-zA-Z]\w*)\s+returns\s+(nothing|[a-zA-Z]+)/g
const functionReg = /^[\t ]*((constant\s+)?native|function)\s+[a-zA-Z]\w*\s+takes\s+(nothing|([a-zA-Z]+\s+[a-zA-Z]\w*\s*,\s*)*[a-zA-Z]+\s+[a-zA-Z]\w*)\s+returns\s+(nothing|[a-zA-Z]+)/


function getFunctions() {

  var func = {}
  var commonJs = commonJ.concat(blizzardJ).concat(commonAi).concat(dzApi).split(/\n/).filter(x => x.trim() != "")

  var functions = commonJs.filter(x => {
    return functionReg.test(x)
  })

  functions.forEach(x => {
    var name = x.match(/(?<=((constant\s+)?native|function)\s+)[a-zA-Z]\w*(?=\s+takes)/).shift()
    var args = x.match(/(?<=takes\s+).*(?=\s+returns)/).map(k => {
      if (k == 'nothing') {
        return null
      }
      return k.split(",").map(s => {
        return {
          type: s.trim().split(/\s+/)[0],
          name: s.trim().split(/\s+/)[1],
          documentation: ""
        }
      })
    }).shift()
    func[name] = {
      original: x.replace(/\s+/g, " "),
      name: name,
      isConstant: x.includes("constant"),
      isNative: x.includes("native"),
      args: args,
      returnType: x.match(/(?<=returns\s+)[a-zA-Z]*\b/).map(x => x.includes("nothing") ? null : x).shift(),
      insertText: name + "(" + (args ? args.map(s => s.name).join(", ") : "") + ")",
      documentation: ""
    }
  })
  fs.appendFile(path.join(__dirname, "./api2.js"), "module.exports = " + JSON.stringify(func), "utf8", () => { })

}

function getValues() {
  var commonJs = commonJ.concat(blizzardJ).concat(commonAi).concat(dzApi)

  let isG = false
  let dataArr = commonJs.split(/\n/).filter(x => {
    if (/\bglobals\b/.test(x)) {
      isG = true
    } else if (/\bendglobals\b/.test(x)) {
      isG = false
    }
    return isG && x.trim() != "" && (!x.includes("takes") || !x.includes("returns"))
      && new RegExp(/constant[\t ]+[a-zA-Z]+[\t ]+\w*|[a-zA-Z]+[\t ]+array[\t ]+[a-zA-Z]\w+|[a-zA-Z]+[\t ]+[a-zA-Z]\w*/, "g").test(x)
  })

  dataArr.forEach(x => {
    let isConstant = x.includes("constant")
    let isArray = x.includes("array")
    console.log({
      original: x.replace(/\s+/g, " "),
      isConstant: isConstant,
      isArray: isArray,
      type: (isConstant ? x.match(/(?<=constant\s+)\w+(?=\s+)/).shift() : isArray ? x.match(/(?<=\s*)\w+\s+array/).shift() : x.match(/(?<=\s*)\w+(?=\s+)/).shift()).replace(/\s+/g, " "),
      documentation: ""
    })
  })
  // var valuesReg = /constant\s+[a-zA-Z]+\s+\w*|[a-zA-Z]+\s+array[\t ]+[a-zA-Z]\w+|[a-zA-Z]+[\t ]+[a-zA-Z]\w*/g
  // commonJs.forEach(x => console.log(x)) 


}


function func5() {
  var commonJs = commonJ.concat(blizzardJ).concat(commonAi).concat(dzApi)
  const functs = require("./functions")
  for (const key in functs) {
    if (!functs[key].isNative) {
      functs.original = commonJs.match("function\\s+" + functs[key].name + "[\\s\\S]+?endfunction").shift().replace(/\s+/, " ")
    }
  }
  fs.writeFile(path.join(__dirname, "./functions1.js"), "module.exports = " + JSON.stringify(functs), "utf8", () => { })
}
func5();