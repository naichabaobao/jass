//===========================================================================
// Blizzard.j ( define Jass2 functions that need to be in every map script )
//===========================================================================


globals
    //-----------------------------------------------------------------------
    // Constants
    //
// ===

// ===
    // Misc constants
    constant real      bj_PI = 3.14159 + 0
    constant real      bj_E = 2.71828 - 0
    constant real      bj_CELLWIDTH = 128.0 * 1
    constant real      bj_CLIFFHEIGHT = 128.0
    constant real      bj_UNIT_FACING = 270.0
    constant real      bj_RADTODEG = 180.0 / bj_PI
    constant real      bj_DEGTORAD = bj_PI / 180.0
    constant real      bj_TEXT_DELAY_QUEST = 20.00
    constant real      bj_TEXT_DELAY_QUESTUPDATE = 20.00
    constant real      bj_TEXT_DELAY_QUESTDONE = 20.00
    constant real      bj_TEXT_DELAY_QUESTFAILED = 20.00
    constant real      bj_TEXT_DELAY_QUESTREQUIREMENT = 20.00
    constant real      bj_TEXT_DELAY_MISSIONFAILED = 20.00
    constant real      bj_TEXT_DELAY_ALWAYSHINT = 12.00
    constant real      bj_TEXT_DELAY_HINT = 12.00
    constant real      bj_TEXT_DELAY_SECRET = 10.00
    constant real      bj_TEXT_DELAY_UNITACQUIRED = 15.00
    constant real      bj_TEXT_DELAY_UNITAVAILABLE = 10.00
    constant real      bj_TEXT_DELAY_ITEMACQUIRED = 10.00
    constant real      bj_TEXT_DELAY_WARNING = 12.00
    constant real      bj_QUEUE_DELAY_QUEST = 5.00
    constant real      bj_QUEUE_DELAY_HINT = 5.00
    constant real      bj_QUEUE_DELAY_SECRET = 3.00
    constant real      bj_HANDICAP_EASY = 60.00
    constant real      bj_GAME_STARTED_THRESHOLD = 0.01
    constant real      bj_WAIT_FOR_COND_MIN_INTERVAL = 0.10
    constant real      bj_POLLED_WAIT_INTERVAL = 0.10
    constant real      bj_POLLED_WAIT_SKIP_THRESHOLD = 2.00

    // Game constants
    constant integer   bj_MAX_INVENTORY = 6
    constant integer   bj_MAX_PLAYERS = 12
    constant integer   bj_PLAYER_NEUTRAL_VICTIM = 13
    constant integer   bj_PLAYER_NEUTRAL_EXTRA = 14
    constant integer   bj_MAX_PLAYER_SLOTS = 16
    constant integer   bj_MAX_SKELETONS = 25
    constant integer   bj_MAX_STOCK_ITEM_SLOTS = 11
    constant integer   bj_MAX_STOCK_UNIT_SLOTS = 11
    constant integer   bj_MAX_ITEM_LEVEL = 10

    // Ideally these would be looked up from Units/MiscData.txt,
    // but there is currently no script functionality exposed to do that
    constant real      bj_TOD_DAWN = 6.00
    constant real      bj_TOD_DUSK = 18.00

    // Melee game settings:
    //   - Starting Time of Day (TOD)
    //   - Starting Gold
    //   - Starting Lumber
    //   - Starting Hero Tokens (free heroes)
    //   - Max heroes allowed per player
    //   - Max heroes allowed per hero type
    //   - Distance from start loc to search for nearby mines
    //
    constant real      bj_MELEE_STARTING_TOD = 8.00
    constant integer   bj_MELEE_STARTING_GOLD_V0 = 750
    constant integer   bj_MELEE_STARTING_GOLD_V1 = 500
    constant integer   bj_MELEE_STARTING_LUMBER_V0 = 200
    constant integer   bj_MELEE_STARTING_LUMBER_V1 = 150
    constant integer   bj_MELEE_STARTING_HERO_TOKENS = 1
    constant integer   bj_MELEE_HERO_LIMIT = 3
    constant integer   bj_MELEE_HERO_TYPE_LIMIT = 1
    constant real      bj_MELEE_MINE_SEARCH_RADIUS = 2000
    constant real      bj_MELEE_CLEAR_UNITS_RADIUS = 1500
    constant real      bj_MELEE_CRIPPLE_TIMEOUT = 120.00
    constant real      bj_MELEE_CRIPPLE_MSG_DURATION = 20.00
    constant integer   bj_MELEE_MAX_TWINKED_HEROES_V0 = 3
    constant integer   bj_MELEE_MAX_TWINKED_HEROES_V1 = 1

    // Delay between a creep's death and the time it may drop an item.
    constant real      bj_CREEP_ITEM_DELAY = 0.50

    // Timing settings for Marketplace inventories.
    constant real      bj_STOCK_RESTOCK_INITIAL_DELAY = 120
    constant real      bj_STOCK_RESTOCK_INTERVAL = 30
    constant integer   bj_STOCK_MAX_ITERATIONS = 20

    // Max events registered by a single "dest dies in region" event.
    constant integer   bj_MAX_DEST_IN_REGION_EVENTS = 64

    // Camera settings
    constant integer   bj_CAMERA_MIN_FARZ = 100
    constant integer   bj_CAMERA_DEFAULT_DISTANCE = 1650
    constant integer   bj_CAMERA_DEFAULT_FARZ = 5000
    constant integer   bj_CAMERA_DEFAULT_AOA = 304
    constant integer   bj_CAMERA_DEFAULT_FOV = 70
    constant integer   bj_CAMERA_DEFAULT_ROLL = 0
    constant integer   bj_CAMERA_DEFAULT_ROTATION = 90

    // Rescue
    constant real      bj_RESCUE_PING_TIME = 2.00

    // Transmission behavior settings
    constant real      bj_NOTHING_SOUND_DURATION = 5.00
    constant real      bj_TRANSMISSION_PING_TIME = 1.00
    constant integer   bj_TRANSMISSION_IND_RED = 255
    constant integer   bj_TRANSMISSION_IND_BLUE = 255
    constant integer   bj_TRANSMISSION_IND_GREEN = 255
    constant integer   bj_TRANSMISSION_IND_ALPHA = 255
    constant real      bj_TRANSMISSION_PORT_HANGTIME = 1.50

    // Cinematic mode settings
    constant real      bj_CINEMODE_INTERFACEFADE = 0.50
    constant gamespeed bj_CINEMODE_GAMESPEED = MAP_SPEED_NORMAL

    // Cinematic mode volume levels
    constant real      bj_CINEMODE_VOLUME_UNITMOVEMENT = 0.40
    constant real      bj_CINEMODE_VOLUME_UNITSOUNDS = 0.00
    constant real      bj_CINEMODE_VOLUME_COMBAT = 0.40
    constant real      bj_CINEMODE_VOLUME_SPELLS = 0.40
    constant real      bj_CINEMODE_VOLUME_UI = 0.00
    constant real      bj_CINEMODE_VOLUME_MUSIC = 0.55
    constant real      bj_CINEMODE_VOLUME_AMBIENTSOUNDS = 1.00
    constant real      bj_CINEMODE_VOLUME_FIRE = 0.60

    // Speech mode volume levels
    constant real      bj_SPEECH_VOLUME_UNITMOVEMENT = 0.25
    constant real      bj_SPEECH_VOLUME_UNITSOUNDS = 0.00
    constant real      bj_SPEECH_VOLUME_COMBAT = 0.25
    constant real      bj_SPEECH_VOLUME_SPELLS = 0.25
    constant real      bj_SPEECH_VOLUME_UI = 0.00
    constant real      bj_SPEECH_VOLUME_MUSIC = 0.55
    constant real      bj_SPEECH_VOLUME_AMBIENTSOUNDS = 1.00
    constant real      bj_SPEECH_VOLUME_FIRE = 0.60

    // Smart pan settings
    constant real      bj_SMARTPAN_TRESHOLD_PAN = 500
    constant real      bj_SMARTPAN_TRESHOLD_SNAP = 3500

    // QueuedTriggerExecute settings
    constant integer   bj_MAX_QUEUED_TRIGGERS = 100
    constant real      bj_QUEUED_TRIGGER_TIMEOUT = 180.00

    // Campaign indexing constants
    constant integer   bj_CAMPAIGN_INDEX_T = 0
    constant integer   bj_CAMPAIGN_INDEX_H = 1
    constant integer   bj_CAMPAIGN_INDEX_U = 2
    constant integer   bj_CAMPAIGN_INDEX_O = 3
    constant integer   bj_CAMPAIGN_INDEX_N = 4
    constant integer   bj_CAMPAIGN_INDEX_XN = 5
    constant integer   bj_CAMPAIGN_INDEX_XH = 6
    constant integer   bj_CAMPAIGN_INDEX_XU = 7
    constant integer   bj_CAMPAIGN_INDEX_XO = 8

    // Campaign offset constants (for mission indexing)
    constant integer   bj_CAMPAIGN_OFFSET_T = 0
    constant integer   bj_CAMPAIGN_OFFSET_H = 1
    constant integer   bj_CAMPAIGN_OFFSET_U = 2
    constant integer   bj_CAMPAIGN_OFFSET_O = 3
    constant integer   bj_CAMPAIGN_OFFSET_N = 4
    constant integer   bj_CAMPAIGN_OFFSET_XN = 0
    constant integer   bj_CAMPAIGN_OFFSET_XH = 1
    constant integer   bj_CAMPAIGN_OFFSET_XU = 2
    constant integer   bj_CAMPAIGN_OFFSET_XO = 3

    // Mission indexing constants
    // Tutorial
    constant integer   bj_MISSION_INDEX_T00 = bj_CAMPAIGN_OFFSET_T * 1000 + 0
    constant integer   bj_MISSION_INDEX_T01 = bj_CAMPAIGN_OFFSET_T * 1000 + 1
    // Human
    constant integer   bj_MISSION_INDEX_H00 = bj_CAMPAIGN_OFFSET_H * 1000 + 0
    constant integer   bj_MISSION_INDEX_H01 = bj_CAMPAIGN_OFFSET_H * 1000 + 1
    constant integer   bj_MISSION_INDEX_H02 = bj_CAMPAIGN_OFFSET_H * 1000 + 2
    constant integer   bj_MISSION_INDEX_H03 = bj_CAMPAIGN_OFFSET_H * 1000 + 3
    constant integer   bj_MISSION_INDEX_H04 = bj_CAMPAIGN_OFFSET_H * 1000 + 4
    constant integer   bj_MISSION_INDEX_H05 = bj_CAMPAIGN_OFFSET_H * 1000 + 5
    constant integer   bj_MISSION_INDEX_H06 = bj_CAMPAIGN_OFFSET_H * 1000 + 6
    constant integer   bj_MISSION_INDEX_H07 = bj_CAMPAIGN_OFFSET_H * 1000 + 7
    constant integer   bj_MISSION_INDEX_H08 = bj_CAMPAIGN_OFFSET_H * 1000 + 8
    constant integer   bj_MISSION_INDEX_H09 = bj_CAMPAIGN_OFFSET_H * 1000 + 9
    constant integer   bj_MISSION_INDEX_H10 = bj_CAMPAIGN_OFFSET_H * 1000 + 10
    constant integer   bj_MISSION_INDEX_H11 = bj_CAMPAIGN_OFFSET_H * 1000 + 11
    // Undead
    constant integer   bj_MISSION_INDEX_U00 = bj_CAMPAIGN_OFFSET_U * 1000 + 0
    constant integer   bj_MISSION_INDEX_U01 = bj_CAMPAIGN_OFFSET_U * 1000 + 1
    constant integer   bj_MISSION_INDEX_U02 = bj_CAMPAIGN_OFFSET_U * 1000 + 2
    constant integer   bj_MISSION_INDEX_U03 = bj_CAMPAIGN_OFFSET_U * 1000 + 3
    constant integer   bj_MISSION_INDEX_U05 = bj_CAMPAIGN_OFFSET_U * 1000 + 4
    constant integer   bj_MISSION_INDEX_U07 = bj_CAMPAIGN_OFFSET_U * 1000 + 5
    constant integer   bj_MISSION_INDEX_U08 = bj_CAMPAIGN_OFFSET_U * 1000 + 6
    constant integer   bj_MISSION_INDEX_U09 = bj_CAMPAIGN_OFFSET_U * 1000 + 7
    constant integer   bj_MISSION_INDEX_U10 = bj_CAMPAIGN_OFFSET_U * 1000 + 8
    constant integer   bj_MISSION_INDEX_U11 = bj_CAMPAIGN_OFFSET_U * 1000 + 9
    // Orc
    constant integer   bj_MISSION_INDEX_O00 = bj_CAMPAIGN_OFFSET_O * 1000 + 0
    constant integer   bj_MISSION_INDEX_O01 = bj_CAMPAIGN_OFFSET_O * 1000 + 1
    constant integer   bj_MISSION_INDEX_O02 = bj_CAMPAIGN_OFFSET_O * 1000 + 2
    constant integer   bj_MISSION_INDEX_O03 = bj_CAMPAIGN_OFFSET_O * 1000 + 3
    constant integer   bj_MISSION_INDEX_O04 = bj_CAMPAIGN_OFFSET_O * 1000 + 4
    constant integer   bj_MISSION_INDEX_O05 = bj_CAMPAIGN_OFFSET_O * 1000 + 5
    constant integer   bj_MISSION_INDEX_O06 = bj_CAMPAIGN_OFFSET_O * 1000 + 6
    constant integer   bj_MISSION_INDEX_O07 = bj_CAMPAIGN_OFFSET_O * 1000 + 7
    constant integer   bj_MISSION_INDEX_O08 = bj_CAMPAIGN_OFFSET_O * 1000 + 8
    constant integer   bj_MISSION_INDEX_O09 = bj_CAMPAIGN_OFFSET_O * 1000 + 9
    constant integer   bj_MISSION_INDEX_O10 = bj_CAMPAIGN_OFFSET_O * 1000 + 10
    // Night Elf
    constant integer   bj_MISSION_INDEX_N00 = bj_CAMPAIGN_OFFSET_N * 1000 + 0
    constant integer   bj_MISSION_INDEX_N01 = bj_CAMPAIGN_OFFSET_N * 1000 + 1
    constant integer   bj_MISSION_INDEX_N02 = bj_CAMPAIGN_OFFSET_N * 1000 + 2
    constant integer   bj_MISSION_INDEX_N03 = bj_CAMPAIGN_OFFSET_N * 1000 + 3
    constant integer   bj_MISSION_INDEX_N04 = bj_CAMPAIGN_OFFSET_N * 1000 + 4
    constant integer   bj_MISSION_INDEX_N05 = bj_CAMPAIGN_OFFSET_N * 1000 + 5
    constant integer   bj_MISSION_INDEX_N06 = bj_CAMPAIGN_OFFSET_N * 1000 + 6
    constant integer   bj_MISSION_INDEX_N07 = bj_CAMPAIGN_OFFSET_N * 1000 + 7
    constant integer   bj_MISSION_INDEX_N08 = bj_CAMPAIGN_OFFSET_N * 1000 + 8
    constant integer   bj_MISSION_INDEX_N09 = bj_CAMPAIGN_OFFSET_N * 1000 + 9
    // Expansion Night Elf
    constant integer   bj_MISSION_INDEX_XN00 = bj_CAMPAIGN_OFFSET_XN * 1000 + 0
    constant integer   bj_MISSION_INDEX_XN01 = bj_CAMPAIGN_OFFSET_XN * 1000 + 1
    constant integer   bj_MISSION_INDEX_XN02 = bj_CAMPAIGN_OFFSET_XN * 1000 + 2
    constant integer   bj_MISSION_INDEX_XN03 = bj_CAMPAIGN_OFFSET_XN * 1000 + 3
    constant integer   bj_MISSION_INDEX_XN04 = bj_CAMPAIGN_OFFSET_XN * 1000 + 4
    constant integer   bj_MISSION_INDEX_XN05 = bj_CAMPAIGN_OFFSET_XN * 1000 + 5
    constant integer   bj_MISSION_INDEX_XN06 = bj_CAMPAIGN_OFFSET_XN * 1000 + 6
    constant integer   bj_MISSION_INDEX_XN07 = bj_CAMPAIGN_OFFSET_XN * 1000 + 7
    constant integer   bj_MISSION_INDEX_XN08 = bj_CAMPAIGN_OFFSET_XN * 1000 + 8
    constant integer   bj_MISSION_INDEX_XN09 = bj_CAMPAIGN_OFFSET_XN * 1000 + 9
    constant integer   bj_MISSION_INDEX_XN10 = bj_CAMPAIGN_OFFSET_XN * 1000 + 10
    // Expansion Human
    constant integer   bj_MISSION_INDEX_XH00 = bj_CAMPAIGN_OFFSET_XH * 1000 + 0
    constant integer   bj_MISSION_INDEX_XH01 = bj_CAMPAIGN_OFFSET_XH * 1000 + 1
    constant integer   bj_MISSION_INDEX_XH02 = bj_CAMPAIGN_OFFSET_XH * 1000 + 2
    constant integer   bj_MISSION_INDEX_XH03 = bj_CAMPAIGN_OFFSET_XH * 1000 + 3
    constant integer   bj_MISSION_INDEX_XH04 = bj_CAMPAIGN_OFFSET_XH * 1000 + 4
    constant integer   bj_MISSION_INDEX_XH05 = bj_CAMPAIGN_OFFSET_XH * 1000 + 5
    constant integer   bj_MISSION_INDEX_XH06 = bj_CAMPAIGN_OFFSET_XH * 1000 + 6
    constant integer   bj_MISSION_INDEX_XH07 = bj_CAMPAIGN_OFFSET_XH * 1000 + 7
    constant integer   bj_MISSION_INDEX_XH08 = bj_CAMPAIGN_OFFSET_XH * 1000 + 8
    constant integer   bj_MISSION_INDEX_XH09 = bj_CAMPAIGN_OFFSET_XH * 1000 + 9
    // Expansion Undead
    constant integer   bj_MISSION_INDEX_XU00 = bj_CAMPAIGN_OFFSET_XU * 1000 + 0
    constant integer   bj_MISSION_INDEX_XU01 = bj_CAMPAIGN_OFFSET_XU * 1000 + 1
    constant integer   bj_MISSION_INDEX_XU02 = bj_CAMPAIGN_OFFSET_XU * 1000 + 2
    constant integer   bj_MISSION_INDEX_XU03 = bj_CAMPAIGN_OFFSET_XU * 1000 + 3
    constant integer   bj_MISSION_INDEX_XU04 = bj_CAMPAIGN_OFFSET_XU * 1000 + 4
    constant integer   bj_MISSION_INDEX_XU05 = bj_CAMPAIGN_OFFSET_XU * 1000 + 5
    constant integer   bj_MISSION_INDEX_XU06 = bj_CAMPAIGN_OFFSET_XU * 1000 + 6
    constant integer   bj_MISSION_INDEX_XU07 = bj_CAMPAIGN_OFFSET_XU * 1000 + 7
    constant integer   bj_MISSION_INDEX_XU08 = bj_CAMPAIGN_OFFSET_XU * 1000 + 8
    constant integer   bj_MISSION_INDEX_XU09 = bj_CAMPAIGN_OFFSET_XU * 1000 + 9
    constant integer   bj_MISSION_INDEX_XU10 = bj_CAMPAIGN_OFFSET_XU * 1000 + 10
    constant integer   bj_MISSION_INDEX_XU11 = bj_CAMPAIGN_OFFSET_XU * 1000 + 11
    constant integer   bj_MISSION_INDEX_XU12 = bj_CAMPAIGN_OFFSET_XU * 1000 + 12
    constant integer   bj_MISSION_INDEX_XU13 = bj_CAMPAIGN_OFFSET_XU * 1000 + 13

    // Expansion Orc
    constant integer   bj_MISSION_INDEX_XO00 = bj_CAMPAIGN_OFFSET_XO * 1000 + 0

    // Cinematic indexing constants
    constant integer   bj_CINEMATICINDEX_TOP = 0
    constant integer   bj_CINEMATICINDEX_HOP = 1
    constant integer   bj_CINEMATICINDEX_HED = 2
    constant integer   bj_CINEMATICINDEX_OOP = 3
    constant integer   bj_CINEMATICINDEX_OED = 4
    constant integer   bj_CINEMATICINDEX_UOP = 5
    constant integer   bj_CINEMATICINDEX_UED = 6
    constant integer   bj_CINEMATICINDEX_NOP = 7
    constant integer   bj_CINEMATICINDEX_NED = 8
    constant integer   bj_CINEMATICINDEX_XOP = 9
    constant integer   bj_CINEMATICINDEX_XED = 10

    // Alliance settings
    constant integer   bj_ALLIANCE_UNALLIED = 0
    constant integer   bj_ALLIANCE_UNALLIED_VISION = 1
    constant integer   bj_ALLIANCE_ALLIED = 2
    constant integer   bj_ALLIANCE_ALLIED_VISION = 3
    constant integer   bj_ALLIANCE_ALLIED_UNITS = 4
    constant integer   bj_ALLIANCE_ALLIED_ADVUNITS = 5
    constant integer   bj_ALLIANCE_NEUTRAL = 6
    constant integer   bj_ALLIANCE_NEUTRAL_VISION = 7

    // Keyboard Event Types
    constant integer   bj_KEYEVENTTYPE_DEPRESS = 0
    constant integer   bj_KEYEVENTTYPE_RELEASE = 1

    // Keyboard Event Keys
    constant integer   bj_KEYEVENTKEY_LEFT = 0
    constant integer   bj_KEYEVENTKEY_RIGHT = 1
    constant integer   bj_KEYEVENTKEY_DOWN = 2
    constant integer   bj_KEYEVENTKEY_UP = 3

    // Transmission timing methods
    constant integer   bj_TIMETYPE_ADD = 0
    constant integer   bj_TIMETYPE_SET = 1
    constant integer   bj_TIMETYPE_SUB = 2

    // Camera bounds adjustment methods
    constant integer   bj_CAMERABOUNDS_ADJUST_ADD = 0
    constant integer   bj_CAMERABOUNDS_ADJUST_SUB = 1

    // Quest creation states
    constant integer   bj_QUESTTYPE_REQ_DISCOVERED = 0
    constant integer   bj_QUESTTYPE_REQ_UNDISCOVERED = 1
    constant integer   bj_QUESTTYPE_OPT_DISCOVERED = 2
    constant integer   bj_QUESTTYPE_OPT_UNDISCOVERED = 3

    // Quest message types
    constant integer   bj_QUESTMESSAGE_DISCOVERED = 0
    constant integer   bj_QUESTMESSAGE_UPDATED = 1
    constant integer   bj_QUESTMESSAGE_COMPLETED = 2
    constant integer   bj_QUESTMESSAGE_FAILED = 3
    constant integer   bj_QUESTMESSAGE_REQUIREMENT = 4
    constant integer   bj_QUESTMESSAGE_MISSIONFAILED = 5
    constant integer   bj_QUESTMESSAGE_ALWAYSHINT = 6
    constant integer   bj_QUESTMESSAGE_HINT = 7
    constant integer   bj_QUESTMESSAGE_SECRET = 8
    constant integer   bj_QUESTMESSAGE_UNITACQUIRED = 9
    constant integer   bj_QUESTMESSAGE_UNITAVAILABLE = 10
    constant integer   bj_QUESTMESSAGE_ITEMACQUIRED = 11
    constant integer   bj_QUESTMESSAGE_WARNING = 12

    // Leaderboard sorting methods
    constant integer   bj_SORTTYPE_SORTBYVALUE = 0
    constant integer   bj_SORTTYPE_SORTBYPLAYER = 1
    constant integer   bj_SORTTYPE_SORTBYLABEL = 2

    // Cinematic fade filter methods
    constant integer   bj_CINEFADETYPE_FADEIN = 0
    constant integer   bj_CINEFADETYPE_FADEOUT = 1
    constant integer   bj_CINEFADETYPE_FADEOUTIN = 2

    // Buff removal methods
    constant integer   bj_REMOVEBUFFS_POSITIVE = 0
    constant integer   bj_REMOVEBUFFS_NEGATIVE = 1
    constant integer   bj_REMOVEBUFFS_ALL = 2
    constant integer   bj_REMOVEBUFFS_NONTLIFE = 3

    // Buff properties - polarity
    constant integer   bj_BUFF_POLARITY_POSITIVE = 0
    constant integer   bj_BUFF_POLARITY_NEGATIVE = 1
    constant integer   bj_BUFF_POLARITY_EITHER = 2

    // Buff properties - resist type
    constant integer   bj_BUFF_RESIST_MAGIC = 0
    constant integer   bj_BUFF_RESIST_PHYSICAL = 1
    constant integer   bj_BUFF_RESIST_EITHER = 2
    constant integer   bj_BUFF_RESIST_BOTH = 3

    // Hero stats
    constant integer   bj_HEROSTAT_STR = 0
    constant integer   bj_HEROSTAT_AGI = 1
    constant integer   bj_HEROSTAT_INT = 2

    // Hero skill point modification methods
    constant integer   bj_MODIFYMETHOD_ADD = 0
    constant integer   bj_MODIFYMETHOD_SUB = 1
    constant integer   bj_MODIFYMETHOD_SET = 2

    // Unit state adjustment methods (for replaced units)
    constant integer   bj_UNIT_STATE_METHOD_ABSOLUTE = 0
    constant integer   bj_UNIT_STATE_METHOD_RELATIVE = 1
    constant integer   bj_UNIT_STATE_METHOD_DEFAULTS = 2
    constant integer   bj_UNIT_STATE_METHOD_MAXIMUM = 3

    // Gate operations
    constant integer   bj_GATEOPERATION_CLOSE = 0
    constant integer   bj_GATEOPERATION_OPEN = 1
    constant integer   bj_GATEOPERATION_DESTROY = 2

	// Game cache value types
	constant integer   bj_GAMECACHE_BOOLEAN = 0
	constant integer   bj_GAMECACHE_INTEGER = 1
	constant integer   bj_GAMECACHE_REAL = 2
	constant integer   bj_GAMECACHE_UNIT = 3
	constant integer   bj_GAMECACHE_STRING = 4
	
	// Hashtable value types
	constant integer   bj_HASHTABLE_BOOLEAN = 0
	constant integer   bj_HASHTABLE_INTEGER = 1
	constant integer   bj_HASHTABLE_REAL = 2
	constant integer   bj_HASHTABLE_STRING = 3
	constant integer   bj_HASHTABLE_HANDLE = 4

    // Item status types
    constant integer   bj_ITEM_STATUS_HIDDEN = 0
    constant integer   bj_ITEM_STATUS_OWNED = 1
    constant integer   bj_ITEM_STATUS_INVULNERABLE = 2
    constant integer   bj_ITEM_STATUS_POWERUP = 3
    constant integer   bj_ITEM_STATUS_SELLABLE = 4
    constant integer   bj_ITEM_STATUS_PAWNABLE = 5

    // Itemcode status types
    constant integer   bj_ITEMCODE_STATUS_POWERUP = 0
    constant integer   bj_ITEMCODE_STATUS_SELLABLE = 1
    constant integer   bj_ITEMCODE_STATUS_PAWNABLE = 2

    // Minimap ping styles
    constant integer   bj_MINIMAPPINGSTYLE_SIMPLE = 0
    constant integer   bj_MINIMAPPINGSTYLE_FLASHY = 1
    constant integer   bj_MINIMAPPINGSTYLE_ATTACK = 2

    // Corpse creation settings
    constant real      bj_CORPSE_MAX_DEATH_TIME = 8.00 .7 .8 8. a8 8 -12

    // Corpse creation styles
    constant integer   bj_CORPSETYPE_FLESH = 0
    constant integer   bj_CORPSETYPE_BONE = 1

    // Elevator pathing-blocker destructable code
    constant integer   bj_ELEVATOR_BLOCKER_CODE = 'DTep'
    constant integer   bj_ELEVATOR_CODE01 = 'DTrf'
    constant integer   bj_ELEVATOR_CODE02 = 'DTrx'

    // Elevator wall codes
    constant integer   bj_ELEVATOR_WALL_TYPE_ALL = 0
    constant integer   bj_ELEVATOR_WALL_TYPE_EAST = 1
    constant integer   bj_ELEVATOR_WALL_TYPE_NORTH = 2
    constant integer   bj_ELEVATOR_WALL_TYPE_SOUTH = 3
    constant integer   bj_ELEVATOR_WALL_TYPE_WEST = 4

    //-----------------------------------------------------------------------
    // Variables
    //

    // Force predefs
    force              bj_FORCE_ALL_PLAYERS = null
    force array        bj_FORCE_PLAYER

    integer            bj_MELEE_MAX_TWINKED_HEROES = 0

    // Map area rects
    rect               bj_mapInitialPlayableArea = null
    rect               bj_mapInitialCameraBounds = null

    // Utility function vars
    integer            bj_forLoopAIndex = 0
    integer            bj_forLoopBIndex = 0
    integer            bj_forLoopAIndexEnd = 0
    integer            bj_forLoopBIndexEnd = 0

    boolean            bj_slotControlReady = false
    boolean array      bj_slotControlUsed
    mapcontrol array   bj_slotControl

    // Game started detection vars
    timer              bj_gameStartedTimer = null
    boolean            bj_gameStarted = false
    timer              bj_volumeGroupsTimer = CreateTimer()

    // Singleplayer check
    boolean            bj_isSinglePlayer = false

    // Day/Night Cycle vars
    trigger            bj_dncSoundsDay = null
    trigger            bj_dncSoundsNight = null
    sound              bj_dayAmbientSound = null
    sound              bj_nightAmbientSound = null
    trigger            bj_dncSoundsDawn = null
    trigger            bj_dncSoundsDusk = null
    sound              bj_dawnSound = null
    sound              bj_duskSound = null
    boolean            bj_useDawnDuskSounds = true
    boolean            bj_dncIsDaytime = false

    // Triggered sounds
    //sound              bj_pingMinimapSound         = null
    sound              bj_rescueSound = null
    sound              bj_questDiscoveredSound = null
    sound              bj_questUpdatedSound = null
    sound              bj_questCompletedSound = null
    sound              bj_questFailedSound = null
    sound              bj_questHintSound = null
    sound              bj_questSecretSound = null
    sound              bj_questItemAcquiredSound = null
    sound              bj_questWarningSound = null
    sound              bj_victoryDialogSound = null
    sound              bj_defeatDialogSound = null

    // Marketplace vars
    trigger            bj_stockItemPurchased = null
    timer              bj_stockUpdateTimer = null
    boolean array      bj_stockAllowedPermanent
    boolean array      bj_stockAllowedCharged
    boolean array      bj_stockAllowedArtifact
    integer            bj_stockPickedItemLevel = 0
    itemtype           bj_stockPickedItemType

    // Melee vars
    trigger            bj_meleeVisibilityTrained = null
    boolean            bj_meleeVisibilityIsDay = true
    boolean            bj_meleeGrantHeroItems = false
    location           bj_meleeNearestMineToLoc = null
    unit               bj_meleeNearestMine = null
    real               bj_meleeNearestMineDist = 0.00
    boolean            bj_meleeGameOver = false
    boolean array      bj_meleeDefeated
    boolean array      bj_meleeVictoried
    unit array         bj_ghoul
    timer array        bj_crippledTimer
    timerdialog array  bj_crippledTimerWindows
    boolean array      bj_playerIsCrippled
    boolean array      bj_playerIsExposed
    boolean            bj_finishSoonAllExposed = false
    timerdialog        bj_finishSoonTimerDialog = null
    integer array      bj_meleeTwinkedHeroes

    // Rescue behavior vars
    trigger            bj_rescueUnitBehavior = null
    boolean            bj_rescueChangeColorUnit = true
    boolean            bj_rescueChangeColorBldg = true

    // Transmission vars
    timer              bj_cineSceneEndingTimer = null
    sound              bj_cineSceneLastSound = null
    trigger            bj_cineSceneBeingSkipped = null

    // Cinematic mode vars
    gamespeed          bj_cineModePriorSpeed = MAP_SPEED_NORMAL
    boolean            bj_cineModePriorFogSetting = false
    boolean            bj_cineModePriorMaskSetting = false
    boolean            bj_cineModeAlreadyIn = false
    boolean            bj_cineModePriorDawnDusk = false
    integer            bj_cineModeSavedSeed = 0

    // Cinematic fade vars
    timer              bj_cineFadeFinishTimer = null
    timer              bj_cineFadeContinueTimer = null
    real               bj_cineFadeContinueRed = 0
    real               bj_cineFadeContinueGreen = 0
    real               bj_cineFadeContinueBlue = 0
    real               bj_cineFadeContinueTrans = 0
    real               bj_cineFadeContinueDuration = 0
    string             bj_cineFadeContinueTex = ""

    // QueuedTriggerExecute vars
    integer            bj_queuedExecTotal = 0
    trigger array      bj_queuedExecTriggers
    boolean array      bj_queuedExecUseConds
    timer              bj_queuedExecTimeoutTimer = CreateTimer()
    trigger            bj_queuedExecTimeout = null

    // Helper vars (for Filter and Enum funcs)
    integer            bj_destInRegionDiesCount = 0
    trigger            bj_destInRegionDiesTrig = null
    integer            bj_groupCountUnits = 0
    integer            bj_forceCountPlayers = 0
    integer            bj_groupEnumTypeId = 0
    player             bj_groupEnumOwningPlayer = null
    group              bj_groupAddGroupDest = null
    group              bj_groupRemoveGroupDest = null
    integer            bj_groupRandomConsidered = 0
    unit               bj_groupRandomCurrentPick = null
    group              bj_groupLastCreatedDest = null
    group              bj_randomSubGroupGroup = null
    integer            bj_randomSubGroupWant = 0
    integer            bj_randomSubGroupTotal = 0
    real               bj_randomSubGroupChance = 0
    integer            bj_destRandomConsidered = 0
    destructable       bj_destRandomCurrentPick = null
    destructable       bj_elevatorWallBlocker = null
    destructable       bj_elevatorNeighbor = null
    integer            bj_itemRandomConsidered = 0
    item               bj_itemRandomCurrentPick = null
    integer            bj_forceRandomConsidered = 0
    player             bj_forceRandomCurrentPick = null
    unit               bj_makeUnitRescuableUnit = null
    boolean            bj_makeUnitRescuableFlag = true
    boolean            bj_pauseAllUnitsFlag = true
    location           bj_enumDestructableCenter = null
    real               bj_enumDestructableRadius = 0
    playercolor        bj_setPlayerTargetColor = null
    boolean            bj_isUnitGroupDeadResult = true
    boolean            bj_isUnitGroupEmptyResult = true
    boolean            bj_isUnitGroupInRectResult = true
    rect               bj_isUnitGroupInRectRect = null
    boolean            bj_changeLevelShowScores = false
    string             bj_changeLevelMapName = null
    group              bj_suspendDecayFleshGroup = CreateGroup()
    group              bj_suspendDecayBoneGroup = CreateGroup()
    timer              bj_delayedSuspendDecayTimer = CreateTimer()
    trigger            bj_delayedSuspendDecayTrig = null
    integer            bj_livingPlayerUnitsTypeId = 0
    widget             bj_lastDyingWidget = null

    // Random distribution vars
    integer            bj_randDistCount = 0
    integer array      bj_randDistID
    integer array      bj_randDistChance

    // Last X'd vars
    unit               bj_lastCreatedUnit = null
    item               bj_lastCreatedItem = null
    item               bj_lastRemovedItem = null
    unit               bj_lastHauntedGoldMine = null
    destructable       bj_lastCreatedDestructable = null
    group              bj_lastCreatedGroup = CreateGroup()
    fogmodifier        bj_lastCreatedFogModifier = null
    effect             bj_lastCreatedEffect = null
    weathereffect      bj_lastCreatedWeatherEffect = null
    terraindeformation bj_lastCreatedTerrainDeformation = null
    quest              bj_lastCreatedQuest = null
    questitem          bj_lastCreatedQuestItem = null
    defeatcondition    bj_lastCreatedDefeatCondition = null
    timer              bj_lastStartedTimer = CreateTimer()
    timerdialog        bj_lastCreatedTimerDialog = null
    leaderboard        bj_lastCreatedLeaderboard = null
    multiboard         bj_lastCreatedMultiboard = null
    sound              bj_lastPlayedSound = null
    string             bj_lastPlayedMusic = ""
    real               bj_lastTransmissionDuration = 0
    gamecache          bj_lastCreatedGameCache = null
    hashtable          bj_lastCreatedHashtable = null
    unit               bj_lastLoadedUnit = null
    button             bj_lastCreatedButton = null
    unit               bj_lastReplacedUnit = null
    texttag            bj_lastCreatedTextTag = null
    lightning          bj_lastCreatedLightning = null
    image              bj_lastCreatedImage = null
    ubersplat          bj_lastCreatedUbersplat = null

    // Filter function vars
    boolexpr           filterIssueHauntOrderAtLocBJ = null
    boolexpr           filterEnumDestructablesInCircleBJ = null
    boolexpr           filterGetUnitsInRectOfPlayer = null
    boolexpr           filterGetUnitsOfTypeIdAll = null
    boolexpr           filterGetUnitsOfPlayerAndTypeId = null
    boolexpr           filterMeleeTrainedUnitIsHeroBJ = null
    boolexpr           filterLivingPlayerUnitsOfTypeId = null

    // Memory cleanup vars
    boolean            bj_wantDestroyGroup = false
endglobals



//***************************************************************************
//*
//*  Debugging Functions
//*
//***************************************************************************

//===========================================================================
function BJDebugMsg takesstring msg returnsnothing
    local integer i = 0
    loop
        call DisplayTimedTextToPlayer(Player(i), 0, 0, 60, msg)
        set i = i + 1
        exitwhen i == bj_MAX_PLAYERS
    endloop
endfunction



//***************************************************************************
//*
//*  Math Utility Functions
//*
//***************************************************************************

//===========================================================================
function RMinBJ takesreal a, real b returnsreal
    if (a < b) then
        returna
    else
        returnb
    endif
endfunction
//===========================================================================
function RMaxBJ takesreal a, real b returnsreal
    if (a < b) then
        returnb
    else
        returna
    endif
endfunction
//===========================================================================
function RAbsBJ takesreal a returnsreal
    if (a >= 0) then
        returna
    else
        return -a
    endif
endfunction

//===========================================================================
function RSignBJ takesreal a returnsreal
    if (a >= 0.0) then
        return 1.0
    else
        return -1.0
    endif
endfunction

//===========================================================================
function IMinBJ takesinteger a, integer b returnsinteger
    if (a < b) then
        returna
    else
        returnb
    endif
endfunction

//===========================================================================
function IMaxBJ takesinteger a, integer b returnsinteger
    if (a < b) then
        returnb
    else
        returna
    endif
endfunction

//===========================================================================
function IAbsBJ takesinteger a returnsinteger
    if (a >= 0) then
        returna
    else
        return -a
    endif
endfunction

//===========================================================================
function ISignBJ takesinteger a returnsinteger
    if (a >= 0) then
        return 1
    else
        return -1
    endif
endfunction

//===========================================================================
function SinBJ takesreal degrees returnsreal
    returnSin(degrees * bj_DEGTORAD)
endfunction

//===========================================================================
function CosBJ takesreal degrees returnsreal
    returnCos(degrees * bj_DEGTORAD)
endfunction

//===========================================================================
function TanBJ takesreal degrees returnsreal
    returnTan(degrees * bj_DEGTORAD)
endfunction

//===========================================================================
function AsinBJ takesreal degrees returnsreal
    returnAsin(degrees) * bj_RADTODEG
endfunction

//===========================================================================
function AcosBJ takesreal degrees returnsreal
    returnAcos(degrees) * bj_RADTODEG
endfunction

//===========================================================================
function AtanBJ takesreal degrees returnsreal
    returnAtan(degrees) * bj_RADTODEG
endfunction

//===========================================================================
function Atan2BJ takesreal y, real x returnsreal
    returnAtan2(y, x) * bj_RADTODEG
endfunction

//===========================================================================
function AngleBetweenPoints takeslocation locA, location locB returnsreal
    returnbj_RADTODEG * Atan2(GetLocationY(locB) - GetLocationY(locA), GetLocationX(locB) - GetLocationX(locA))
endfunction

//===========================================================================
function DistanceBetweenPoints takeslocation locA, location locB returnsreal
    local real dx = GetLocationX(locB) - GetLocationX(locA)
    local real dy = GetLocationY(locB) - GetLocationY(locA)
    returnSquareRoot(dx * dx + dy * dy)
endfunction

//===========================================================================
function PolarProjectionBJ takeslocation source, real dist, real angle returnslocation
    local real x = GetLocationX(source) + dist * Cos(angle * bj_DEGTORAD)
    local real y = GetLocationY(source) + dist * Sin(angle * bj_DEGTORAD)
    returnLocation(x, y)
endfunction

//===========================================================================
function GetRandomDirectionDeg takesnothing returnsreal
    returnGetRandomReal(0, 360)
endfunction

//===========================================================================
function GetRandomPercentageBJ takesnothing returnsreal
    returnGetRandomReal(0, 100)
endfunction

//===========================================================================
function GetRandomLocInRect takesrect whichRect returnslocation
    returnLocation(GetRandomReal(GetRectMinX(whichRect), GetRectMaxX(whichRect)), GetRandomReal(GetRectMinY(whichRect), GetRectMaxY(whichRect)))
endfunction

//===========================================================================
// Calculate the modulus/remainder of (dividend) divided by (divisor).
// Examples:  18 mod 5 = 3.  15 mod 5 = 0.  -8 mod 5 = 2.
//
function ModuloInteger takesinteger dividend, integer divisor returnsinteger
    local integer modulus = dividend - (dividend / divisor) * divisor

    // If the dividend was negative, the above modulus calculation will
    // be negative, but within (-divisor..0).  We can add (divisor) to
    // shift this result into the desired range of (0..divisor).
    if (modulus < 0) then
        set modulus = modulus + divisor
    endif

    returnmodulus
endfunction

//===========================================================================
// Calculate the modulus/remainder of (dividend) divided by (divisor).
// Examples:  13.000 mod 2.500 = 0.500.  -6.000 mod 2.500 = 1.500.
//
function ModuloReal takesreal dividend, real divisor returnsreal
    local real modulus = dividend - I2R(R2I(dividend / divisor)) * divisor

    // If the dividend was negative, the above modulus calculation will
    // be negative, but within (-divisor..0).  We can add (divisor) to
    // shift this result into the desired range of (0..divisor).
    if (modulus < 0) then
        set modulus = modulus + divisor
    endif

    returnmodulus
endfunction

//===========================================================================
function OffsetLocation takeslocation loc, real dx, real dy returnslocation
    returnLocation(GetLocationX(loc) + dx, GetLocationY(loc) + dy)
endfunction

//===========================================================================
function OffsetRectBJ takesrect r, real dx, real dy returnsrect
    returnRect(GetRectMinX(r) + dx, GetRectMinY(r) + dy, GetRectMaxX(r) + dx, GetRectMaxY(r) + dy)
endfunction

//===========================================================================
function RectFromCenterSizeBJ takeslocation center, real width, real height returnsrect
    local real x = GetLocationX(center)
    local real y = GetLocationY(center)
    returnRect(x - width * 0.5, y - height * 0.5, x + width * 0.5, y + height * 0.5)
endfunction

//===========================================================================
function RectContainsCoords takesrect r, real x, real y returnsboolean
    return (GetRectMinX(r) <= x) and (x <= GetRectMaxX(r)) and (GetRectMinY(r) <= y) and (y <= GetRectMaxY(r))
endfunction

//===========================================================================
function RectContainsLoc takesrect r, location loc returnsboolean
    returnRectContainsCoords(r, GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
function RectContainsUnit takesrect r, unit whichUnit returnsboolean
    returnRectContainsCoords(r, GetUnitX(whichUnit), GetUnitY(whichUnit))
endfunction

//===========================================================================
function RectContainsItem takesitem whichItem, rect r returnsboolean
    if (whichItem == null) then
        returnfalse
    endif

    if (IsItemOwned(whichItem)) then
        returnfalse
    endif

    returnRectContainsCoords(r, GetItemX(whichItem), GetItemY(whichItem))
endfunction



//***************************************************************************
//*
//*  Utility Constructs
//*
//***************************************************************************

//===========================================================================
// Runs the trigger's actions if the trigger's conditions evaluate to true.
//
function ConditionalTriggerExecute takestrigger trig returnsnothing
    if TriggerEvaluate(trig) then
        call TriggerExecute(trig)
    endif
endfunction

//===========================================================================
// Runs the trigger's actions if the trigger's conditions evaluate to true.
//
function TriggerExecuteBJ takestrigger trig, boolean checkConditions returnsboolean
    if checkConditions then
        if not (TriggerEvaluate(trig)) then
            returnfalse
        endif
    endif
    call TriggerExecute(trig)
    returntrue
endfunction

//===========================================================================
// Arranges for a trigger to fire almost immediately, except that the calling
// trigger is not interrupted as is the case with a TriggerExecute call.
// Since the trigger executes normally, its conditions are still evaluated.
//
function PostTriggerExecuteBJ takestrigger trig, boolean checkConditions returnsboolean
    if checkConditions then
        if not (TriggerEvaluate(trig)) then
            returnfalse
        endif
    endif
    call TriggerRegisterTimerEvent(trig, 0, false)
    returntrue
endfunction

//===========================================================================
// Debug - Display the contents of the trigger queue (as either null or "x"
// for each entry).
function QueuedTriggerCheck takesnothing returnsnothing
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
    call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 600, s)
endfunction

//===========================================================================
// Searches the queue for a given trigger, returning the index of the
// trigger within the queue if it is found, or -1 if it is not found.
//
function QueuedTriggerGetIndex takestrigger trig returnsinteger
    // Determine which, if any, of the queued triggers is being removed.
    local integer index = 0
    loop
        exitwhen index >= bj_queuedExecTotal
        if (bj_queuedExecTriggers[index] == trig) then
            returnindex
        endif
        set index = index + 1
    endloop
    return -1
endfunction

//===========================================================================
// Removes a trigger from the trigger queue, shifting other triggers down
// to fill the unused space.  If the currently running trigger is removed
// in this manner, this function does NOT attempt to run the next trigger.
//
function QueuedTriggerRemoveByIndex takesinteger trigIndex returnsboolean
    local integer index

    // If the to-be-removed index is out of range, fail.
    if (trigIndex >= bj_queuedExecTotal) then
        returnfalse
    endif

    // Shift all queue entries down to fill in the gap.
    set bj_queuedExecTotal = bj_queuedExecTotal - 1
    set index = trigIndex
    loop
        exitwhen index >= bj_queuedExecTotal
        set bj_queuedExecTriggers[index] = bj_queuedExecTriggers[index + 1]
        set bj_queuedExecUseConds[index] = bj_queuedExecUseConds[index + 1]
        set index = index + 1
    endloop
    returntrue
endfunction

//===========================================================================
// Attempt to execute the first trigger in the queue.  If it fails, remove
// it and execute the next one.  Continue this cycle until a trigger runs,
// or until the queue is empty.
//
function QueuedTriggerAttemptExec takesnothing returnsboolean
    loop
        exitwhen bj_queuedExecTotal == 0

        if TriggerExecuteBJ(bj_queuedExecTriggers[0], bj_queuedExecUseConds[0]) then
            // Timeout the queue if it sits at the front of the queue for too long.
            call TimerStart(bj_queuedExecTimeoutTimer, bj_QUEUED_TRIGGER_TIMEOUT, false, null)
            returntrue
        endif

        call QueuedTriggerRemoveByIndex(0)
    endloop
    returnfalse
endfunction

//===========================================================================
// Queues a trigger to be executed, assuring that such triggers are not
// executed at the same time.
//
function QueuedTriggerAddBJ takestrigger trig, boolean checkConditions returnsboolean
    // Make sure our queue isn't full.  If it is, return failure.
    if (bj_queuedExecTotal >= bj_MAX_QUEUED_TRIGGERS) then
        returnfalse
    endif

    // Add the trigger to an array of to-be-executed triggers.
    set bj_queuedExecTriggers[bj_queuedExecTotal] = trig
    set bj_queuedExecUseConds[bj_queuedExecTotal] = checkConditions
    set bj_queuedExecTotal = bj_queuedExecTotal + 1

    // If this is the only trigger in the queue, run it.
    if (bj_queuedExecTotal == 1) then
        call QueuedTriggerAttemptExec()
    endif
    returntrue
endfunction

//===========================================================================
// Denotes the end of a queued trigger. Be sure to call this only once per
// queued trigger, or risk stepping on the toes of other queued triggers.
//
function QueuedTriggerRemoveBJ takestrigger trig returnsnothing
    local integer index
    local integer trigIndex
    local boolean trigExecuted

    // Find the trigger's index.
    set trigIndex = QueuedTriggerGetIndex(trig)
    if (trigIndex == -1) then
        return
    endif

    // Shuffle the other trigger entries down to fill in the gap.
    call QueuedTriggerRemoveByIndex(trigIndex)

    // If we just axed the currently running trigger, run the next one.
    if (trigIndex == 0) then
        call PauseTimer(bj_queuedExecTimeoutTimer)
        call QueuedTriggerAttemptExec()
    endif
endfunction

//===========================================================================
// Denotes the end of a queued trigger. Be sure to call this only once per
// queued trigger, lest you step on the toes of other queued triggers.
//
function QueuedTriggerDoneBJ takesnothing returnsnothing
    local integer index

    // Make sure there's something on the queue to remove.
    if (bj_queuedExecTotal <= 0) then
        return
    endif

    // Remove the currently running trigger from the array.
    call QueuedTriggerRemoveByIndex(0)

    // If other triggers are waiting to run, run one of them.
    call PauseTimer(bj_queuedExecTimeoutTimer)
    call QueuedTriggerAttemptExec()
endfunction

//===========================================================================
// Empty the trigger queue.
//
function QueuedTriggerClearBJ takesnothing returnsnothing
    call PauseTimer(bj_queuedExecTimeoutTimer)
    set bj_queuedExecTotal = 0
endfunction

//===========================================================================
// Remove all but the currently executing trigger from the trigger queue.
//
function QueuedTriggerClearInactiveBJ takesnothing returnsnothing
    set bj_queuedExecTotal = IMinBJ(bj_queuedExecTotal, 1)
endfunction

//===========================================================================
function QueuedTriggerCountBJ takesnothing returnsinteger
    returnbj_queuedExecTotal
endfunction

//===========================================================================
function IsTriggerQueueEmptyBJ takesnothing returnsboolean
    returnbj_queuedExecTotal <= 0
endfunction

//===========================================================================
function IsTriggerQueuedBJ takestrigger trig returnsboolean
    returnQueuedTriggerGetIndex(trig) != -1
endfunction

//===========================================================================
function GetForLoopIndexA takesnothing returnsinteger
    returnbj_forLoopAIndex
endfunction

//===========================================================================
function SetForLoopIndexA takesinteger newIndex returnsnothing
    set bj_forLoopAIndex = newIndex
endfunction

//===========================================================================
function GetForLoopIndexB takesnothing returnsinteger
    returnbj_forLoopBIndex
endfunction

//===========================================================================
function SetForLoopIndexB takesinteger newIndex returnsnothing
    set bj_forLoopBIndex = newIndex
endfunction

//===========================================================================
// We can't do game-time waits, so this simulates one by starting a timer
// and polling until the timer expires.
function PolledWait takesreal duration returnsnothing
    local timer t
    local real  timeRemaining

    if (duration > 0) then
        set t = CreateTimer()
        call TimerStart(t, duration, false, null)
        loop
            set timeRemaining = TimerGetRemaining(t)
            exitwhen timeRemaining <= 0

            // If we have a bit of time left, skip past 10% of the remaining
            // duration instead of checking every interval, to minimize the
            // polling on long waits.
            if (timeRemaining > bj_POLLED_WAIT_SKIP_THRESHOLD) then
                call TriggerSleepAction(0.1 * timeRemaining)
            else
                call TriggerSleepAction(bj_POLLED_WAIT_INTERVAL)
            endif
        endloop
        call DestroyTimer(t)
    endif
endfunction

//===========================================================================
function IntegerTertiaryOp takesboolean flag, integer valueA, integer valueB returnsinteger
    if flag then
        returnvalueA
    else
        returnvalueB
    endif
endfunction


//***************************************************************************
//*
//*  General Utility Functions
//*  These functions exist purely to make the trigger dialogs cleaner and
//*  more comprehensible.
//*
//***************************************************************************

//===========================================================================
function DoNothing takesnothing returnsnothing
endfunction

//===========================================================================
// This function does nothing.  WorldEdit should should eventually ignore
// CommentString triggers during script generation, but until such a time,
// this function will serve as a stub.
//
function CommentString takesstring commentString returnsnothing
endfunction

//===========================================================================
// This function returns the input string, converting it from the localized text, if necessary
//
function StringIdentity takesstring theString returnsstring
    returnGetLocalizedString(theString)
endfunction

//===========================================================================
function GetBooleanAnd takesboolean valueA, boolean valueB returnsboolean
    returnvalueA and valueB
endfunction

//===========================================================================
function GetBooleanOr takesboolean valueA, boolean valueB returnsboolean
    returnvalueA or valueB
endfunction

//===========================================================================
// Converts a percentage (real, 0..100) into a scaled integer (0..max),
// clipping the result to 0..max in case the input is invalid.
//
function PercentToInt takesreal percentage, integer max returnsinteger
    local integer result = R2I(percentage * I2R(max) * 0.01)

    if (result < 0) then
        set result = 0
    elseif (result > max) then
        set result = max
    endif

    returnresult
endfunction

//===========================================================================
function PercentTo255 takesreal percentage returnsinteger
    returnPercentToInt(percentage, 255)
endfunction

//===========================================================================
function GetTimeOfDay takesnothing returnsreal
    returnGetFloatGameState(GAME_STATE_TIME_OF_DAY)
endfunction

//===========================================================================
function SetTimeOfDay takesreal whatTime returnsnothing
    call SetFloatGameState(GAME_STATE_TIME_OF_DAY, whatTime)
endfunction

//===========================================================================
function SetTimeOfDayScalePercentBJ takesreal scalePercent returnsnothing
    call SetTimeOfDayScale(scalePercent * 0.01)
endfunction

//===========================================================================
function GetTimeOfDayScalePercentBJ takesnothing returnsreal
    returnGetTimeOfDayScale() * 100
endfunction

//===========================================================================
function PlaySound takesstring soundName returnsnothing
    local sound soundHandle = CreateSound(soundName, false, false, true, 12700, 12700, "")
    call StartSound(soundHandle)
    call KillSoundWhenDone(soundHandle)
endfunction

//===========================================================================
function CompareLocationsBJ takeslocation A, location B returnsboolean
    returnGetLocationX(A) == GetLocationX(B) and GetLocationY(A) == GetLocationY(B)
endfunction

//===========================================================================
function CompareRectsBJ takesrect A, rect B returnsboolean
    returnGetRectMinX(A) == GetRectMinX(B) and GetRectMinY(A) == GetRectMinY(B) and GetRectMaxX(A) == GetRectMaxX(B) and GetRectMaxY(A) == GetRectMaxY(B)
endfunction

//===========================================================================
// Returns a square rect that exactly encompasses the specified circle.
//
function GetRectFromCircleBJ takeslocation center, real radius returnsrect
    local real centerX = GetLocationX(center)
    local real centerY = GetLocationY(center)
    returnRect(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
endfunction



//***************************************************************************
//*
//*  Camera Utility Functions
//*
//***************************************************************************

//===========================================================================
function GetCurrentCameraSetup takesnothing returnscamerasetup
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
    returntheCam
endfunction

//===========================================================================
function CameraSetupApplyForPlayer takesboolean doPan, camerasetup whichSetup, player whichPlayer, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetupApplyForceDuration(whichSetup, doPan, duration)
    endif
endfunction

//===========================================================================
function CameraSetupGetFieldSwap takescamerafield whichField, camerasetup whichSetup returnsreal
    returnCameraSetupGetField(whichSetup, whichField)
endfunction

//===========================================================================
function SetCameraFieldForPlayer takesplayer whichPlayer, camerafield whichField, real value, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraField(whichField, value, duration)
    endif
endfunction

//===========================================================================
function SetCameraTargetControllerNoZForPlayer takesplayer whichPlayer, unit whichUnit, real xoffset, real yoffset, boolean inheritOrientation returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraTargetController(whichUnit, xoffset, yoffset, inheritOrientation)
    endif
endfunction

//===========================================================================
function SetCameraPositionForPlayer takesplayer whichPlayer, real x, real y returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraPosition(x, y)
    endif
endfunction

//===========================================================================
function SetCameraPositionLocForPlayer takesplayer whichPlayer, location loc returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraPosition(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction

//===========================================================================
function RotateCameraAroundLocBJ takesreal degrees, location loc, player whichPlayer, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraRotateMode(GetLocationX(loc), GetLocationY(loc), bj_DEGTORAD * degrees, duration)
    endif
endfunction

//===========================================================================
function PanCameraToForPlayer takesplayer whichPlayer, real x, real y returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraTo(x, y)
    endif
endfunction

//===========================================================================
function PanCameraToLocForPlayer takesplayer whichPlayer, location loc returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraTo(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction

//===========================================================================
function PanCameraToTimedForPlayer takesplayer whichPlayer, real x, real y, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimed(x, y, duration)
    endif
endfunction

//===========================================================================
function PanCameraToTimedLocForPlayer takesplayer whichPlayer, location loc, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
    endif
endfunction

//===========================================================================
function PanCameraToTimedLocWithZForPlayer takesplayer whichPlayer, location loc, real zOffset, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimedWithZ(GetLocationX(loc), GetLocationY(loc), zOffset, duration)
    endif
endfunction

//===========================================================================
function SmartCameraPanBJ takesplayer whichPlayer, location loc, real duration returnsnothing
    local real dist
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        set dist = DistanceBetweenPoints(loc, GetCameraTargetPositionLoc())
        if (dist >= bj_SMARTPAN_TRESHOLD_SNAP) then
            // If the user is too far away, snap the camera.
            call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), 0)
        elseif (dist >= bj_SMARTPAN_TRESHOLD_PAN) then
            // If the user is moderately close, pan the camera.
            call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
        else
            // User is close enough, so don't touch the camera.
        endif
    endif
endfunction

//===========================================================================
function SetCinematicCameraForPlayer takesplayer whichPlayer, string cameraModelFile returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCinematicCamera(cameraModelFile)
    endif
endfunction

//===========================================================================
function ResetToGameCameraForPlayer takesplayer whichPlayer, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ResetToGameCamera(duration)
    endif
endfunction

//===========================================================================
function CameraSetSourceNoiseForPlayer takesplayer whichPlayer, real magnitude, real velocity returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetSourceNoise(magnitude, velocity)
    endif
endfunction

//===========================================================================
function CameraSetTargetNoiseForPlayer takesplayer whichPlayer, real magnitude, real velocity returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetTargetNoise(magnitude, velocity)
    endif
endfunction

//===========================================================================
function CameraSetEQNoiseForPlayer takesplayer whichPlayer, real magnitude returnsnothing
    local real richter = magnitude
    if (richter > 5.0) then
        set richter = 5.0
    endif
    if (richter < 2.0) then
        set richter = 2.0
    endif
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetTargetNoiseEx(magnitude * 2.0, magnitude * Pow(10, richter), true)
        call CameraSetSourceNoiseEx(magnitude * 2.0, magnitude * Pow(10, richter), true)
    endif
endfunction

//===========================================================================
function CameraClearNoiseForPlayer takesplayer whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetSourceNoise(0, 0)
        call CameraSetTargetNoise(0, 0)
    endif
endfunction

//===========================================================================
// Query the current camera bounds.
//
function GetCurrentCameraBoundsMapRectBJ takesnothing returnsrect
    returnRect(GetCameraBoundMinX(), GetCameraBoundMinY(), GetCameraBoundMaxX(), GetCameraBoundMaxY())
endfunction

//===========================================================================
// Query the initial camera bounds, as defined at map init.
//
function GetCameraBoundsMapRect takesnothing returnsrect
    returnbj_mapInitialCameraBounds
endfunction

//===========================================================================
// Query the playable map area, as defined at map init.
//
function GetPlayableMapRect takesnothing returnsrect
    returnbj_mapInitialPlayableArea
endfunction

//===========================================================================
// Query the entire map area, as defined at map init.
//
function GetEntireMapRect takesnothing returnsrect
    returnGetWorldBounds()
endfunction

//===========================================================================
function SetCameraBoundsToRect takesrect r returnsnothing
    local real minX = GetRectMinX(r)
    local real minY = GetRectMinY(r)
    local real maxX = GetRectMaxX(r)
    local real maxY = GetRectMaxY(r)
    call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction

//===========================================================================
function SetCameraBoundsToRectForPlayerBJ takesplayer whichPlayer, rect r returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraBoundsToRect(r)
    endif
endfunction

//===========================================================================
function AdjustCameraBoundsBJ takesinteger adjustMethod, real dxWest, real dxEast, real dyNorth, real dySouth returnsnothing
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
        // Unrecognized adjustment method - ignore the request.
        return
    endif

    // Adjust the actual camera values
    set minX = GetCameraBoundMinX() - scale * dxWest
    set maxX = GetCameraBoundMaxX() + scale * dxEast
    set minY = GetCameraBoundMinY() - scale * dySouth
    set maxY = GetCameraBoundMaxY() + scale * dyNorth

    // Make sure the camera bounds are still valid.
    if (maxX < minX) then
        set minX = (minX + maxX) * 0.5
        set maxX = minX
    endif
    if (maxY < minY) then
        set minY = (minY + maxY) * 0.5
        set maxY = minY
    endif

    // Apply the new camera values.
    call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction

//===========================================================================
function AdjustCameraBoundsForPlayerBJ takesinteger adjustMethod, player whichPlayer, real dxWest, real dxEast, real dyNorth, real dySouth returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call AdjustCameraBoundsBJ(adjustMethod, dxWest, dxEast, dyNorth, dySouth)
    endif
endfunction

//===========================================================================
function SetCameraQuickPositionForPlayer takesplayer whichPlayer, real x, real y returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraQuickPosition(x, y)
    endif
endfunction

//===========================================================================
function SetCameraQuickPositionLocForPlayer takesplayer whichPlayer, location loc returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction

//===========================================================================
function SetCameraQuickPositionLoc takeslocation loc returnsnothing
    call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
function StopCameraForPlayerBJ takesplayer whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call StopCamera()
    endif
endfunction

//===========================================================================
function SetCameraOrientControllerForPlayerBJ takesplayer whichPlayer, unit whichUnit, real xoffset, real yoffset returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraOrientController(whichUnit, xoffset, yoffset)
    endif
endfunction

//===========================================================================
function CameraSetSmoothingFactorBJ takesreal factor returnsnothing
    call CameraSetSmoothingFactor(factor)
endfunction

//===========================================================================
function CameraResetSmoothingFactorBJ takesnothing returnsnothing
    call CameraSetSmoothingFactor(0)
endfunction



//***************************************************************************
//*
//*  Text Utility Functions
//*
//***************************************************************************

//===========================================================================
function DisplayTextToForce takesforce toForce, string message returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, message)
    endif
endfunction

//===========================================================================
function DisplayTimedTextToForce takesforce toForce, real duration, string message returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, duration, message)
    endif
endfunction

//===========================================================================
function ClearTextMessagesBJ takesforce toForce returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearTextMessages()
    endif
endfunction

//===========================================================================
// The parameters for the API Substring function are unintuitive, so this
// merely performs a translation for the starting index.
//
function SubStringBJ takesstring source, integer start, integer end returnsstring
    returnSubString(source, start-1, end)
endfunction
  
function GetHandleIdBJ takeshandle h returnsinteger
    returnGetHandleId(h)
endfunction

function StringHashBJ takesstring s returnsinteger
    returnStringHash(s)
endfunction



//***************************************************************************
//*
//*  Event Registration Utility Functions
//*
//***************************************************************************

//===========================================================================
function TriggerRegisterTimerEventPeriodic takestrigger trig, real timeout returnsevent
    returnTriggerRegisterTimerEvent(trig, timeout, true)
endfunction

//===========================================================================
function TriggerRegisterTimerEventSingle takestrigger trig, real timeout returnsevent
    returnTriggerRegisterTimerEvent(trig, timeout, false)
endfunction

//===========================================================================
function TriggerRegisterTimerExpireEventBJ takestrigger trig, timer t returnsevent
    returnTriggerRegisterTimerExpireEvent(trig, t)
endfunction

//===========================================================================
function TriggerRegisterPlayerUnitEventSimple takestrigger trig, player whichPlayer, playerunitevent whichEvent returnsevent
    returnTriggerRegisterPlayerUnitEvent(trig, whichPlayer, whichEvent, null)
endfunction

//===========================================================================
function TriggerRegisterAnyUnitEventBJ takestrigger trig, playerunitevent whichEvent returnsnothing
    local integer index

    set index = 0
    loop
        call TriggerRegisterPlayerUnitEvent(trig, Player(index), whichEvent, null)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYER_SLOTS
    endloop
endfunction

//===========================================================================
function TriggerRegisterPlayerSelectionEventBJ takestrigger trig, player whichPlayer, boolean selected returnsevent
    if selected then
        returnTriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_SELECTED, null)
    else
        returnTriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_DESELECTED, null)
    endif
endfunction

//===========================================================================
function TriggerRegisterPlayerKeyEventBJ takestrigger trig, player whichPlayer, integer keType, integer keKey returnsevent
    if (keType == bj_KEYEVENTTYPE_DEPRESS) then
        // Depress event - find out what key
        if (keKey == bj_KEYEVENTKEY_LEFT) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_DOWN)
        elseif (keKey == bj_KEYEVENTKEY_RIGHT) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_DOWN)
        elseif (keKey == bj_KEYEVENTKEY_DOWN) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_DOWN)
        elseif (keKey == bj_KEYEVENTKEY_UP) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_DOWN)
        else
            // Unrecognized key - ignore the request and return failure.
            returnnull
        endif
    elseif (keType == bj_KEYEVENTTYPE_RELEASE) then
        // Release event - find out what key
        if (keKey == bj_KEYEVENTKEY_LEFT) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_UP)
        elseif (keKey == bj_KEYEVENTKEY_RIGHT) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_UP)
        elseif (keKey == bj_KEYEVENTKEY_DOWN) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_UP)
        elseif (keKey == bj_KEYEVENTKEY_UP) then
            returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_UP)
        else
            // Unrecognized key - ignore the request and return failure.
            returnnull
        endif
    else
        // Unrecognized type - ignore the request and return failure.
        returnnull
    endif
endfunction

//===========================================================================
function TriggerRegisterPlayerEventVictory takestrigger trig, player whichPlayer returnsevent
    returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_VICTORY)
endfunction

//===========================================================================
function TriggerRegisterPlayerEventDefeat takestrigger trig, player whichPlayer returnsevent
    returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_DEFEAT)
endfunction

//===========================================================================
function TriggerRegisterPlayerEventLeave takestrigger trig, player whichPlayer returnsevent
    returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_LEAVE)
endfunction

//===========================================================================
function TriggerRegisterPlayerEventAllianceChanged takestrigger trig, player whichPlayer returnsevent
    returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ALLIANCE_CHANGED)
endfunction

//===========================================================================
function TriggerRegisterPlayerEventEndCinematic takestrigger trig, player whichPlayer returnsevent
    returnTriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_END_CINEMATIC)
endfunction

//===========================================================================
function TriggerRegisterGameStateEventTimeOfDay takestrigger trig, limitop opcode, real limitval returnsevent
    returnTriggerRegisterGameStateEvent(trig, GAME_STATE_TIME_OF_DAY, opcode, limitval)
endfunction

//===========================================================================
function TriggerRegisterEnterRegionSimple takestrigger trig, region whichRegion returnsevent
    returnTriggerRegisterEnterRegion(trig, whichRegion, null)
endfunction

//===========================================================================
function TriggerRegisterLeaveRegionSimple takestrigger trig, region whichRegion returnsevent
    returnTriggerRegisterLeaveRegion(trig, whichRegion, null)
endfunction

//===========================================================================
function TriggerRegisterEnterRectSimple takestrigger trig, rect r returnsevent
    local region rectRegion = CreateRegion()
    call RegionAddRect(rectRegion, r)
    returnTriggerRegisterEnterRegion(trig, rectRegion, null)
endfunction

//===========================================================================
function TriggerRegisterLeaveRectSimple takestrigger trig, rect r returnsevent
    local region rectRegion = CreateRegion()
    call RegionAddRect(rectRegion, r)
    returnTriggerRegisterLeaveRegion(trig, rectRegion, null)
endfunction

//===========================================================================
function TriggerRegisterDistanceBetweenUnits takestrigger trig, unit whichUnit, boolexpr condition, real range returnsevent
    returnTriggerRegisterUnitInRange(trig, whichUnit, range, condition)
endfunction

//===========================================================================
function TriggerRegisterUnitInRangeSimple takestrigger trig, real range, unit whichUnit returnsevent
    returnTriggerRegisterUnitInRange(trig, whichUnit, range, null)
endfunction

//===========================================================================
function TriggerRegisterUnitLifeEvent takestrigger trig, unit whichUnit, limitop opcode, real limitval returnsevent
    returnTriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_LIFE, opcode, limitval)
endfunction

//===========================================================================
function TriggerRegisterUnitManaEvent takestrigger trig, unit whichUnit, limitop opcode, real limitval returnsevent
    returnTriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_MANA, opcode, limitval)
endfunction

//===========================================================================
function TriggerRegisterDialogEventBJ takestrigger trig, dialog whichDialog returnsevent
    returnTriggerRegisterDialogEvent(trig, whichDialog)
endfunction

//===========================================================================
function TriggerRegisterShowSkillEventBJ takestrigger trig returnsevent
    returnTriggerRegisterGameEvent(trig, EVENT_GAME_SHOW_SKILL)
endfunction

//===========================================================================
function TriggerRegisterBuildSubmenuEventBJ takestrigger trig returnsevent
    returnTriggerRegisterGameEvent(trig, EVENT_GAME_BUILD_SUBMENU)
endfunction

//===========================================================================
function TriggerRegisterGameLoadedEventBJ takestrigger trig returnsevent
    returnTriggerRegisterGameEvent(trig, EVENT_GAME_LOADED)
endfunction

//===========================================================================
function TriggerRegisterGameSavedEventBJ takestrigger trig returnsevent
    returnTriggerRegisterGameEvent(trig, EVENT_GAME_SAVE)
endfunction

//===========================================================================
function RegisterDestDeathInRegionEnum takesnothing returnsnothing
    set bj_destInRegionDiesCount = bj_destInRegionDiesCount + 1
    if (bj_destInRegionDiesCount <= bj_MAX_DEST_IN_REGION_EVENTS) then
        call TriggerRegisterDeathEvent(bj_destInRegionDiesTrig, GetEnumDestructable())
    endif
endfunction

//===========================================================================
function TriggerRegisterDestDeathInRegionEvent takestrigger trig, rect r returnsnothing
    set bj_destInRegionDiesTrig = trig
    set bj_destInRegionDiesCount = 0
    call EnumDestructablesInRect(r, null, function RegisterDestDeathInRegionEnum)
endfunction



//***************************************************************************
//*
//*  Environment Utility Functions
//*
//***************************************************************************

//===========================================================================
function AddWeatherEffectSaveLast takesrect where, integer effectID returnsweathereffect
    set bj_lastCreatedWeatherEffect = AddWeatherEffect(where, effectID)
    returnbj_lastCreatedWeatherEffect
endfunction

//===========================================================================
function GetLastCreatedWeatherEffect takesnothing returnsweathereffect
    returnbj_lastCreatedWeatherEffect
endfunction

//===========================================================================
function RemoveWeatherEffectBJ takesweathereffect whichWeatherEffect returnsnothing
    call RemoveWeatherEffect(whichWeatherEffect)
endfunction

//===========================================================================
function TerrainDeformationCraterBJ takesreal duration, boolean permanent, location where, real radius, real depth returnsterraindeformation
    set bj_lastCreatedTerrainDeformation = TerrainDeformCrater(GetLocationX(where), GetLocationY(where), radius, depth, R2I(duration * 1000), permanent)
    returnbj_lastCreatedTerrainDeformation
endfunction

//===========================================================================
function TerrainDeformationRippleBJ takesreal duration, boolean limitNeg, location where, real startRadius, real endRadius, real depth, real wavePeriod, real waveWidth returnsterraindeformation
    local real spaceWave
    local real timeWave
    local real radiusRatio

    if (endRadius <= 0 or waveWidth <= 0 or wavePeriod <= 0) then
        returnnull
    endif

    set timeWave = 2.0 * duration / wavePeriod
    set spaceWave = 2.0 * endRadius / waveWidth
    set radiusRatio = startRadius / endRadius

    set bj_lastCreatedTerrainDeformation = TerrainDeformRipple(GetLocationX(where), GetLocationY(where), endRadius, depth, R2I(duration * 1000), 1, spaceWave, timeWave, radiusRatio, limitNeg)
    returnbj_lastCreatedTerrainDeformation
endfunction

//===========================================================================
function TerrainDeformationWaveBJ takesreal duration, location source, location target, real radius, real depth, real trailDelay returnsterraindeformation
    local real distance
    local real dirX
    local real dirY
    local real speed

    set distance = DistanceBetweenPoints(source, target)
    if (distance == 0 or duration <= 0) then
        returnnull
    endif

    set dirX = (GetLocationX(target) - GetLocationX(source)) / distance
    set dirY = (GetLocationY(target) - GetLocationY(source)) / distance
    set speed = distance / duration

    set bj_lastCreatedTerrainDeformation = TerrainDeformWave(GetLocationX(source), GetLocationY(source), dirX, dirY, distance, speed, radius, depth, R2I(trailDelay * 1000), 1)
    returnbj_lastCreatedTerrainDeformation
endfunction

//===========================================================================
function TerrainDeformationRandomBJ takesreal duration, location where, real radius, real minDelta, real maxDelta, real updateInterval returnsterraindeformation
    set bj_lastCreatedTerrainDeformation = TerrainDeformRandom(GetLocationX(where), GetLocationY(where), radius, minDelta, maxDelta, R2I(duration * 1000), R2I(updateInterval * 1000))
    returnbj_lastCreatedTerrainDeformation
endfunction

//===========================================================================
function TerrainDeformationStopBJ takesterraindeformation deformation, real duration returnsnothing
    call TerrainDeformStop(deformation, R2I(duration * 1000))
endfunction

//===========================================================================
function GetLastCreatedTerrainDeformation takesnothing returnsterraindeformation
    returnbj_lastCreatedTerrainDeformation
endfunction

//===========================================================================
function AddLightningLoc takesstring codeName, location where1, location where2 returnslightning
    set bj_lastCreatedLightning = AddLightningEx(codeName, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
    returnbj_lastCreatedLightning
endfunction

//===========================================================================
function DestroyLightningBJ takeslightning whichBolt returnsboolean
    returnDestroyLightning(whichBolt)
endfunction

//===========================================================================
function MoveLightningLoc takeslightning whichBolt, location where1, location where2 returnsboolean
    returnMoveLightningEx(whichBolt, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
endfunction

//===========================================================================
function GetLightningColorABJ takeslightning whichBolt returnsreal
    returnGetLightningColorA(whichBolt)
endfunction

//===========================================================================
function GetLightningColorRBJ takeslightning whichBolt returnsreal
    returnGetLightningColorR(whichBolt)
endfunction

//===========================================================================
function GetLightningColorGBJ takeslightning whichBolt returnsreal
    returnGetLightningColorG(whichBolt)
endfunction

//===========================================================================
function GetLightningColorBBJ takeslightning whichBolt returnsreal
    returnGetLightningColorB(whichBolt)
endfunction

//===========================================================================
function SetLightningColorBJ takeslightning whichBolt, real r, real g, real b, real a returnsboolean
    returnSetLightningColor(whichBolt, r, g, b, a)
endfunction

//===========================================================================
function GetLastCreatedLightningBJ takesnothing returnslightning
    returnbj_lastCreatedLightning
endfunction

//===========================================================================
function GetAbilityEffectBJ takesinteger abilcode, effecttype t, integer index returnsstring
    returnGetAbilityEffectById(abilcode, t, index)
endfunction

//===========================================================================
function GetAbilitySoundBJ takesinteger abilcode, soundtype t returnsstring
    returnGetAbilitySoundById(abilcode, t)
endfunction


//===========================================================================
function GetTerrainCliffLevelBJ takeslocation where returnsinteger
    returnGetTerrainCliffLevel(GetLocationX(where), GetLocationY(where))
endfunction

//===========================================================================
function GetTerrainTypeBJ takeslocation where returnsinteger
    returnGetTerrainType(GetLocationX(where), GetLocationY(where))
endfunction

//===========================================================================
function GetTerrainVarianceBJ takeslocation where returnsinteger
    returnGetTerrainVariance(GetLocationX(where), GetLocationY(where))
endfunction

//===========================================================================
function SetTerrainTypeBJ takeslocation where, integer terrainType, integer variation, integer area, integer shape returnsnothing
    call SetTerrainType(GetLocationX(where), GetLocationY(where), terrainType, variation, area, shape)
endfunction

//===========================================================================
function IsTerrainPathableBJ takeslocation where, pathingtype t returnsboolean
    returnIsTerrainPathable(GetLocationX(where), GetLocationY(where), t)
endfunction

//===========================================================================
function SetTerrainPathableBJ takeslocation where, pathingtype t, boolean flag returnsnothing
    call SetTerrainPathable(GetLocationX(where), GetLocationY(where), t, flag)
endfunction

//===========================================================================
function SetWaterBaseColorBJ takesreal red, real green, real blue, real transparency returnsnothing
    call SetWaterBaseColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function CreateFogModifierRectSimple takesplayer whichPlayer, fogstate whichFogState, rect r, boolean afterUnits returnsfogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, afterUnits)
    returnbj_lastCreatedFogModifier
endfunction

//===========================================================================
function CreateFogModifierRadiusLocSimple takesplayer whichPlayer, fogstate whichFogState, location center, real radius, boolean afterUnits returnsfogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, afterUnits)
    returnbj_lastCreatedFogModifier
endfunction

//===========================================================================
// Version of CreateFogModifierRect that assumes use of sharedVision and
// gives the option of immediately enabling the modifier, so that triggers
// can default to modifiers that are immediately enabled.
//
function CreateFogModifierRectBJ takesboolean enabled, player whichPlayer, fogstate whichFogState, rect r returnsfogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, false)
    if enabled then
        call FogModifierStart(bj_lastCreatedFogModifier)
    endif
    returnbj_lastCreatedFogModifier
endfunction

//===========================================================================
// Version of CreateFogModifierRadius that assumes use of sharedVision and
// gives the option of immediately enabling the modifier, so that triggers
// can default to modifiers that are immediately enabled.
//
function CreateFogModifierRadiusLocBJ takesboolean enabled, player whichPlayer, fogstate whichFogState, location center, real radius returnsfogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, false)
    if enabled then
        call FogModifierStart(bj_lastCreatedFogModifier)
    endif
    returnbj_lastCreatedFogModifier
endfunction

//===========================================================================
function GetLastCreatedFogModifier takesnothing returnsfogmodifier
    returnbj_lastCreatedFogModifier
endfunction

//===========================================================================
function FogEnableOn takesnothing returnsnothing
    call FogEnable(true)
endfunction

//===========================================================================
function FogEnableOff takesnothing returnsnothing
    call FogEnable(false)
endfunction

//===========================================================================
function FogMaskEnableOn takesnothing returnsnothing
    call FogMaskEnable(true)
endfunction

//===========================================================================
function FogMaskEnableOff takesnothing returnsnothing
    call FogMaskEnable(false)
endfunction

//===========================================================================
function UseTimeOfDayBJ takesboolean flag returnsnothing
    call SuspendTimeOfDay(not flag)
endfunction

//===========================================================================
function SetTerrainFogExBJ takesinteger style, real zstart, real zend, real density, real red, real green, real blue returnsnothing
    call SetTerrainFogEx(style, zstart, zend, density, red * 0.01, green * 0.01, blue * 0.01)
endfunction

//===========================================================================
function ResetTerrainFogBJ takesnothing returnsnothing
    call ResetTerrainFog()
endfunction

//===========================================================================
function SetDoodadAnimationBJ takesstring animName, integer doodadID, real radius, location center returnsnothing
    call SetDoodadAnimation(GetLocationX(center), GetLocationY(center), radius, doodadID, false, animName, false)
endfunction

//===========================================================================
function SetDoodadAnimationRectBJ takesstring animName, integer doodadID, rect r returnsnothing
    call SetDoodadAnimationRect(r, doodadID, animName, false)
endfunction

//===========================================================================
function AddUnitAnimationPropertiesBJ takesboolean add, string animProperties, unit whichUnit returnsnothing
    call AddUnitAnimationProperties(whichUnit, animProperties, add)
endfunction


//============================================================================
function CreateImageBJ takesstring file, real size, location where, real zOffset, integer imageType returnsimage
    set bj_lastCreatedImage = CreateImage(file, size, size, size, GetLocationX(where), GetLocationY(where), zOffset, 0, 0, 0, imageType)
    returnbj_lastCreatedImage
endfunction

//============================================================================
function ShowImageBJ takesboolean flag, image whichImage returnsnothing
    call ShowImage(whichImage, flag)
endfunction

//============================================================================
function SetImagePositionBJ takesimage whichImage, location where, real zOffset returnsnothing
    call SetImagePosition(whichImage, GetLocationX(where), GetLocationY(where), zOffset)
endfunction

//============================================================================
function SetImageColorBJ takesimage whichImage, real red, real green, real blue, real alpha returnsnothing
    call SetImageColor(whichImage, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-alpha))
endfunction

//============================================================================
function GetLastCreatedImage takesnothing returnsimage
    returnbj_lastCreatedImage
endfunction

//============================================================================
function CreateUbersplatBJ takeslocation where, string name, real red, real green, real blue, real alpha, boolean forcePaused, boolean noBirthTime returnsubersplat
    set bj_lastCreatedUbersplat = CreateUbersplat(GetLocationX(where), GetLocationY(where), name, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-alpha), forcePaused, noBirthTime)
    returnbj_lastCreatedUbersplat
endfunction

//============================================================================
function ShowUbersplatBJ takesboolean flag, ubersplat whichSplat returnsnothing
    call ShowUbersplat(whichSplat, flag)
endfunction

//============================================================================
function GetLastCreatedUbersplat takesnothing returnsubersplat
    returnbj_lastCreatedUbersplat
endfunction


//***************************************************************************
//*
//*  Sound Utility Functions
//*
//***************************************************************************

//===========================================================================
function PlaySoundBJ takessound soundHandle returnsnothing
    set bj_lastPlayedSound = soundHandle
    if (soundHandle != null) then
        call StartSound(soundHandle)
    endif
endfunction

//===========================================================================
function StopSoundBJ takessound soundHandle, boolean fadeOut returnsnothing
    call StopSound(soundHandle, false, fadeOut)
endfunction

//===========================================================================
function SetSoundVolumeBJ takessound soundHandle, real volumePercent returnsnothing
    call SetSoundVolume(soundHandle, PercentToInt(volumePercent, 127))
endfunction

//===========================================================================
function SetSoundOffsetBJ takesreal newOffset, sound soundHandle returnsnothing
    call SetSoundPlayPosition(soundHandle, R2I(newOffset * 1000))
endfunction

//===========================================================================
function SetSoundDistanceCutoffBJ takessound soundHandle, real cutoff returnsnothing
    call SetSoundDistanceCutoff(soundHandle, cutoff)
endfunction

//===========================================================================
function SetSoundPitchBJ takessound soundHandle, real pitch returnsnothing
    call SetSoundPitch(soundHandle, pitch)
endfunction

//===========================================================================
function SetSoundPositionLocBJ takessound soundHandle, location loc, real z returnsnothing
    call SetSoundPosition(soundHandle, GetLocationX(loc), GetLocationY(loc), z)
endfunction

//===========================================================================
function AttachSoundToUnitBJ takessound soundHandle, unit whichUnit returnsnothing
    call AttachSoundToUnit(soundHandle, whichUnit)
endfunction

//===========================================================================
function SetSoundConeAnglesBJ takessound soundHandle, real inside, real outside, real outsideVolumePercent returnsnothing
    call SetSoundConeAngles(soundHandle, inside, outside, PercentToInt(outsideVolumePercent, 127))
endfunction

//===========================================================================
function KillSoundWhenDoneBJ takessound soundHandle returnsnothing
    call KillSoundWhenDone(soundHandle)
endfunction

//===========================================================================
function PlaySoundAtPointBJ takessound soundHandle, real volumePercent, location loc, real z returnsnothing
    call SetSoundPositionLocBJ(soundHandle, loc, z)
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
endfunction

//===========================================================================
function PlaySoundOnUnitBJ takessound soundHandle, real volumePercent, unit whichUnit returnsnothing
    call AttachSoundToUnitBJ(soundHandle, whichUnit)
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
endfunction

//===========================================================================
function PlaySoundFromOffsetBJ takessound soundHandle, real volumePercent, real startingOffset returnsnothing
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
    call SetSoundOffsetBJ(startingOffset, soundHandle)
endfunction

//===========================================================================
function PlayMusicBJ takesstring musicFileName returnsnothing
    set bj_lastPlayedMusic = musicFileName
    call PlayMusic(musicFileName)
endfunction

//===========================================================================
function PlayMusicExBJ takesstring musicFileName, real startingOffset, real fadeInTime returnsnothing
    set bj_lastPlayedMusic = musicFileName
    call PlayMusicEx(musicFileName, R2I(startingOffset * 1000), R2I(fadeInTime * 1000))
endfunction

//===========================================================================
function SetMusicOffsetBJ takesreal newOffset returnsnothing
    call SetMusicPlayPosition(R2I(newOffset * 1000))
endfunction

//===========================================================================
function PlayThematicMusicBJ takesstring musicName returnsnothing
    call PlayThematicMusic(musicName)
endfunction

//===========================================================================
function PlayThematicMusicExBJ takesstring musicName, real startingOffset returnsnothing
    call PlayThematicMusicEx(musicName, R2I(startingOffset * 1000))
endfunction

//===========================================================================
function SetThematicMusicOffsetBJ takesreal newOffset returnsnothing
    call SetThematicMusicPlayPosition(R2I(newOffset * 1000))
endfunction

//===========================================================================
function EndThematicMusicBJ takesnothing returnsnothing
    call EndThematicMusic()
endfunction

//===========================================================================
function StopMusicBJ takesboolean fadeOut returnsnothing
    call StopMusic(fadeOut)
endfunction

//===========================================================================
function ResumeMusicBJ takesnothing returnsnothing
    call ResumeMusic()
endfunction

//===========================================================================
function SetMusicVolumeBJ takesreal volumePercent returnsnothing
    call SetMusicVolume(PercentToInt(volumePercent, 127))
endfunction

//===========================================================================
function GetSoundDurationBJ takessound soundHandle returnsreal
    if (soundHandle == null) then
        returnbj_NOTHING_SOUND_DURATION
    else
        returnI2R(GetSoundDuration(soundHandle)) * 0.001
    endif
endfunction

//===========================================================================
function GetSoundFileDurationBJ takesstring musicFileName returnsreal
    returnI2R(GetSoundFileDuration(musicFileName)) * 0.001
endfunction

//===========================================================================
function GetLastPlayedSound takesnothing returnssound
    returnbj_lastPlayedSound
endfunction

//===========================================================================
function GetLastPlayedMusic takesnothing returnsstring
    returnbj_lastPlayedMusic
endfunction

//===========================================================================
function VolumeGroupSetVolumeBJ takesvolumegroup vgroup, real percent returnsnothing
    call VolumeGroupSetVolume(vgroup, percent * 0.01)
endfunction

//===========================================================================
function SetCineModeVolumeGroupsImmediateBJ takesnothing returnsnothing
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITMOVEMENT, bj_CINEMODE_VOLUME_UNITMOVEMENT)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITSOUNDS, bj_CINEMODE_VOLUME_UNITSOUNDS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_COMBAT, bj_CINEMODE_VOLUME_COMBAT)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_SPELLS, bj_CINEMODE_VOLUME_SPELLS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UI, bj_CINEMODE_VOLUME_UI)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_MUSIC, bj_CINEMODE_VOLUME_MUSIC)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_AMBIENTSOUNDS, bj_CINEMODE_VOLUME_AMBIENTSOUNDS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_FIRE, bj_CINEMODE_VOLUME_FIRE)
endfunction

//===========================================================================
function SetCineModeVolumeGroupsBJ takesnothing returnsnothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call SetCineModeVolumeGroupsImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetCineModeVolumeGroupsImmediateBJ)
    endif
endfunction

//===========================================================================
function SetSpeechVolumeGroupsImmediateBJ takesnothing returnsnothing
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITMOVEMENT, bj_SPEECH_VOLUME_UNITMOVEMENT)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UNITSOUNDS, bj_SPEECH_VOLUME_UNITSOUNDS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_COMBAT, bj_SPEECH_VOLUME_COMBAT)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_SPELLS, bj_SPEECH_VOLUME_SPELLS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_UI, bj_SPEECH_VOLUME_UI)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_MUSIC, bj_SPEECH_VOLUME_MUSIC)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_AMBIENTSOUNDS, bj_SPEECH_VOLUME_AMBIENTSOUNDS)
    call VolumeGroupSetVolume(SOUND_VOLUMEGROUP_FIRE, bj_SPEECH_VOLUME_FIRE)
endfunction

//===========================================================================
function SetSpeechVolumeGroupsBJ takesnothing returnsnothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call SetSpeechVolumeGroupsImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetSpeechVolumeGroupsImmediateBJ)
    endif
endfunction

//===========================================================================
function VolumeGroupResetImmediateBJ takesnothing returnsnothing
    call VolumeGroupReset()
endfunction

//===========================================================================
function VolumeGroupResetBJ takesnothing returnsnothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call VolumeGroupResetImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function VolumeGroupResetImmediateBJ)
    endif
endfunction

//===========================================================================
function GetSoundIsPlayingBJ takessound soundHandle returnsboolean
    returnGetSoundIsLoading(soundHandle) or GetSoundIsPlaying(soundHandle)
endfunction

//===========================================================================
function WaitForSoundBJ takessound soundHandle, real offset returnsnothing
    call TriggerWaitForSound(soundHandle, offset)
endfunction

//===========================================================================
function SetMapMusicIndexedBJ takesstring musicName, integer index returnsnothing
    call SetMapMusic(musicName, false, index)
endfunction

//===========================================================================
function SetMapMusicRandomBJ takesstring musicName returnsnothing
    call SetMapMusic(musicName, true, 0)
endfunction

//===========================================================================
function ClearMapMusicBJ takesnothing returnsnothing
    call ClearMapMusic()
endfunction

//===========================================================================
function SetStackedSoundBJ takesboolean add, sound soundHandle, rect r returnsnothing
    local real width = GetRectMaxX(r) - GetRectMinX(r)
    local real height = GetRectMaxY(r) - GetRectMinY(r)

    call SetSoundPosition(soundHandle, GetRectCenterX(r), GetRectCenterY(r), 0)
    if add then
        call RegisterStackedSound(soundHandle, true, width, height)
    else
        call UnregisterStackedSound(soundHandle, true, width, height)
    endif
endfunction

//===========================================================================
function StartSoundForPlayerBJ takesplayer whichPlayer, sound soundHandle returnsnothing
    if (whichPlayer == GetLocalPlayer()) then
        call StartSound(soundHandle)
    endif
endfunction

//===========================================================================
function VolumeGroupSetVolumeForPlayerBJ takesplayer whichPlayer, volumegroup vgroup, real scale returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        call VolumeGroupSetVolume(vgroup, scale)
    endif
endfunction

//===========================================================================
function EnableDawnDusk takesboolean flag returnsnothing
    set bj_useDawnDuskSounds = flag
endfunction

//===========================================================================
function IsDawnDuskEnabled takesnothing returnsboolean
    returnbj_useDawnDuskSounds
endfunction



//***************************************************************************
//*
//*  Day/Night ambient sounds
//*
//***************************************************************************

//===========================================================================
function SetAmbientDaySound takesstring inLabel returnsnothing
    local real ToD

    // Stop old sound, if necessary
    if (bj_dayAmbientSound != null) then
        call StopSound(bj_dayAmbientSound, true, true)
    endif

    // Create new sound
    set bj_dayAmbientSound = CreateMIDISound(inLabel, 20, 20)

    // Start the sound if necessary, based on current time
    set ToD = GetTimeOfDay()
    if (ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) then
        call StartSound(bj_dayAmbientSound)
    endif
endfunction

//===========================================================================
function SetAmbientNightSound takesstring inLabel returnsnothing
    local real ToD

    // Stop old sound, if necessary
    if (bj_nightAmbientSound != null) then
        call StopSound(bj_nightAmbientSound, true, true)
    endif

    // Create new sound
    set bj_nightAmbientSound = CreateMIDISound(inLabel, 20, 20)

    // Start the sound if necessary, based on current time
    set ToD = GetTimeOfDay()
    if (ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) then
        call StartSound(bj_nightAmbientSound)
    endif
endfunction



//***************************************************************************
//*
//*  Special Effect Utility Functions
//*
//***************************************************************************

//===========================================================================
function AddSpecialEffectLocBJ takeslocation where, string modelName returnseffect
    set bj_lastCreatedEffect = AddSpecialEffectLoc(modelName, where)
    returnbj_lastCreatedEffect
endfunction

//===========================================================================
function AddSpecialEffectTargetUnitBJ takesstring attachPointName, widget targetWidget, string modelName returnseffect
    set bj_lastCreatedEffect = AddSpecialEffectTarget(modelName, targetWidget, attachPointName)
    returnbj_lastCreatedEffect
endfunction

//===========================================================================
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
//
// Commented out - Destructibles have no attachment points.
//
//function AddSpecialEffectTargetDestructableBJ takes string attachPointName, widget targetWidget, string modelName returns effect
//    return AddSpecialEffectTargetUnitBJ(attachPointName, targetWidget, modelName)
//endfunction

//===========================================================================
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
//
// Commented out - Items have no attachment points.
//
//function AddSpecialEffectTargetItemBJ takes string attachPointName, widget targetWidget, string modelName returns effect
//    return AddSpecialEffectTargetUnitBJ(attachPointName, targetWidget, modelName)
//endfunction

//===========================================================================
function DestroyEffectBJ takeseffect whichEffect returnsnothing
    call DestroyEffect(whichEffect)
endfunction

//===========================================================================
function GetLastCreatedEffectBJ takesnothing returnseffect
    returnbj_lastCreatedEffect
endfunction



//***************************************************************************
//*
//*  Hero and Item Utility Functions
//*
//***************************************************************************

//===========================================================================
function GetItemLoc takesitem whichItem returnslocation
    returnLocation(GetItemX(whichItem), GetItemY(whichItem))
endfunction

//===========================================================================
function GetItemLifeBJ takeswidget whichWidget returnsreal
    returnGetWidgetLife(whichWidget)
endfunction

//===========================================================================
function SetItemLifeBJ takeswidget whichWidget, real life returnsnothing
    call SetWidgetLife(whichWidget, life)
endfunction

//===========================================================================
function AddHeroXPSwapped takesinteger xpToAdd, unit whichHero, boolean showEyeCandy returnsnothing
    call AddHeroXP(whichHero, xpToAdd, showEyeCandy)
endfunction

//===========================================================================
function SetHeroLevelBJ takesunit whichHero, integer newLevel, boolean showEyeCandy returnsnothing
    local integer oldLevel = GetHeroLevel(whichHero)

    if (newLevel > oldLevel) then
        call SetHeroLevel(whichHero, newLevel, showEyeCandy)
    elseif (newLevel < oldLevel) then
        call UnitStripHeroLevel(whichHero, oldLevel - newLevel)
    else
        // No change in level - ignore the request.
    endif
endfunction

//===========================================================================
function DecUnitAbilityLevelSwapped takesinteger abilcode, unit whichUnit returnsinteger
    returnDecUnitAbilityLevel(whichUnit, abilcode)
endfunction

//===========================================================================
function IncUnitAbilityLevelSwapped takesinteger abilcode, unit whichUnit returnsinteger
    returnIncUnitAbilityLevel(whichUnit, abilcode)
endfunction

//===========================================================================
function SetUnitAbilityLevelSwapped takesinteger abilcode, unit whichUnit, integer level returnsinteger
    returnSetUnitAbilityLevel(whichUnit, abilcode, level)
endfunction

//===========================================================================
function GetUnitAbilityLevelSwapped takesinteger abilcode, unit whichUnit returnsinteger
    returnGetUnitAbilityLevel(whichUnit, abilcode)
endfunction

//===========================================================================
function UnitHasBuffBJ takesunit whichUnit, integer buffcode returnsboolean
    return (GetUnitAbilityLevel(whichUnit, buffcode) > 0)
endfunction

//===========================================================================
function UnitRemoveBuffBJ takesinteger buffcode, unit whichUnit returnsboolean
    returnUnitRemoveAbility(whichUnit, buffcode)
endfunction

//===========================================================================
function UnitAddItemSwapped takesitem whichItem, unit whichHero returnsboolean
    returnUnitAddItem(whichHero, whichItem)
endfunction

//===========================================================================
function UnitAddItemByIdSwapped takesinteger itemId, unit whichHero returnsitem
    // Create the item at the hero's feet first, and then give it to him.
    // This is to ensure that the item will be left at the hero's feet if
    // his inventory is full. 
    set bj_lastCreatedItem = CreateItem(itemId, GetUnitX(whichHero), GetUnitY(whichHero))
    call UnitAddItem(whichHero, bj_lastCreatedItem)
    returnbj_lastCreatedItem
endfunction

//===========================================================================
function UnitRemoveItemSwapped takesitem whichItem, unit whichHero returnsnothing
    set bj_lastRemovedItem = whichItem
    call UnitRemoveItem(whichHero, whichItem)
endfunction

//===========================================================================
// Translates 0-based slot indices to 1-based slot indices.
//
function UnitRemoveItemFromSlotSwapped takesinteger itemSlot, unit whichHero returnsitem
    set bj_lastRemovedItem = UnitRemoveItemFromSlot(whichHero, itemSlot-1)
    returnbj_lastRemovedItem
endfunction

//===========================================================================
function CreateItemLoc takesinteger itemId, location loc returnsitem
    set bj_lastCreatedItem = CreateItem(itemId, GetLocationX(loc), GetLocationY(loc))
    returnbj_lastCreatedItem
endfunction

//===========================================================================
function GetLastCreatedItem takesnothing returnsitem
    returnbj_lastCreatedItem
endfunction

//===========================================================================
function GetLastRemovedItem takesnothing returnsitem
    returnbj_lastRemovedItem
endfunction

//===========================================================================
function SetItemPositionLoc takesitem whichItem, location loc returnsnothing
    call SetItemPosition(whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
function GetLearnedSkillBJ takesnothing returnsinteger
    returnGetLearnedSkill()
endfunction

//===========================================================================
function SuspendHeroXPBJ takesboolean flag, unit whichHero returnsnothing
    call SuspendHeroXP(whichHero, not flag)
endfunction

//===========================================================================
function SetPlayerHandicapXPBJ takesplayer whichPlayer, real handicapPercent returnsnothing
    call SetPlayerHandicapXP(whichPlayer, handicapPercent * 0.01)
endfunction

//===========================================================================
function GetPlayerHandicapXPBJ takesplayer whichPlayer returnsreal
    returnGetPlayerHandicapXP(whichPlayer) * 100
endfunction

//===========================================================================
function SetPlayerHandicapBJ takesplayer whichPlayer, real handicapPercent returnsnothing
    call SetPlayerHandicap(whichPlayer, handicapPercent * 0.01)
endfunction

//===========================================================================
function GetPlayerHandicapBJ takesplayer whichPlayer returnsreal
    returnGetPlayerHandicap(whichPlayer) * 100
endfunction

//===========================================================================
function GetHeroStatBJ takesinteger whichStat, unit whichHero, boolean includeBonuses returnsinteger
    if (whichStat == bj_HEROSTAT_STR) then
        returnGetHeroStr(whichHero, includeBonuses)
    elseif (whichStat == bj_HEROSTAT_AGI) then
        returnGetHeroAgi(whichHero, includeBonuses)
    elseif (whichStat == bj_HEROSTAT_INT) then
        returnGetHeroInt(whichHero, includeBonuses)
    else
        // Unrecognized hero stat - return 0
        return 0
    endif
endfunction

//===========================================================================
function SetHeroStat takesunit whichHero, integer whichStat, integer value returnsnothing
    // Ignore requests for negative hero stats.
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
        // Unrecognized hero stat - ignore the request.
    endif
endfunction

//===========================================================================
function ModifyHeroStat takesinteger whichStat, unit whichHero, integer modifyMethod, integer value returnsnothing
    if (modifyMethod == bj_MODIFYMETHOD_ADD) then
        call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) + value)
    elseif (modifyMethod == bj_MODIFYMETHOD_SUB) then
        call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) - value)
    elseif (modifyMethod == bj_MODIFYMETHOD_SET) then
        call SetHeroStat(whichHero, whichStat, value)
    else
        // Unrecognized modification method - ignore the request.
    endif
endfunction

//===========================================================================
function ModifyHeroSkillPoints takesunit whichHero, integer modifyMethod, integer value returnsboolean
    if (modifyMethod == bj_MODIFYMETHOD_ADD) then
        returnUnitModifySkillPoints(whichHero, value)
    elseif (modifyMethod == bj_MODIFYMETHOD_SUB) then
        returnUnitModifySkillPoints(whichHero, -value)
    elseif (modifyMethod == bj_MODIFYMETHOD_SET) then
        returnUnitModifySkillPoints(whichHero, value - GetHeroSkillPoints(whichHero))
    else
        // Unrecognized modification method - ignore the request and return failure.
        returnfalse
    endif
endfunction

//===========================================================================
function UnitDropItemPointBJ takesunit whichUnit, item whichItem, real x, real y returnsboolean
    returnUnitDropItemPoint(whichUnit, whichItem, x, y)
endfunction

//===========================================================================
function UnitDropItemPointLoc takesunit whichUnit, item whichItem, location loc returnsboolean
    returnUnitDropItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
function UnitDropItemSlotBJ takesunit whichUnit, item whichItem, integer slot returnsboolean
    returnUnitDropItemSlot(whichUnit, whichItem, slot-1)
endfunction

//===========================================================================
function UnitDropItemTargetBJ takesunit whichUnit, item whichItem, widget target returnsboolean
    returnUnitDropItemTarget(whichUnit, whichItem, target)
endfunction

//===========================================================================
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
//
function UnitUseItemDestructable takesunit whichUnit, item whichItem, widget target returnsboolean
    returnUnitUseItemTarget(whichUnit, whichItem, target)
endfunction

//===========================================================================
function UnitUseItemPointLoc takesunit whichUnit, item whichItem, location loc returnsboolean
    returnUnitUseItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
// Translates 0-based slot indices to 1-based slot indices.
//
function UnitItemInSlotBJ takesunit whichUnit, integer itemSlot returnsitem
    returnUnitItemInSlot(whichUnit, itemSlot-1)
endfunction

//===========================================================================
// Translates 0-based slot indices to 1-based slot indices.
//
function GetInventoryIndexOfItemTypeBJ takesunit whichUnit, integer itemId returnsinteger
    local integer index
    local item    indexItem

    set index = 0
    loop
        set indexItem = UnitItemInSlot(whichUnit, index)
        if (indexItem != null) and (GetItemTypeId(indexItem) == itemId) then
            returnindex + 1
        endif

        set index = index + 1
        exitwhen index >= bj_MAX_INVENTORY
    endloop
    return 0
endfunction

//===========================================================================
function GetItemOfTypeFromUnitBJ takesunit whichUnit, integer itemId returnsitem
    local integer index = GetInventoryIndexOfItemTypeBJ(whichUnit, itemId)

    if (index == 0) then
        returnnull
    else
        returnUnitItemInSlot(whichUnit, index - 1)
    endif
endfunction

//===========================================================================
function UnitHasItemOfTypeBJ takesunit whichUnit, integer itemId returnsboolean
    returnGetInventoryIndexOfItemTypeBJ(whichUnit, itemId) > 0
endfunction

//===========================================================================
function UnitInventoryCount takesunit whichUnit returnsinteger
    local integer index = 0
    local integer count = 0

    loop
        if (UnitItemInSlot(whichUnit, index) != null) then
            set count = count + 1
        endif

        set index = index + 1
        exitwhen index >= bj_MAX_INVENTORY
    endloop

    returncount
endfunction

//===========================================================================
function UnitInventorySizeBJ takesunit whichUnit returnsinteger
    returnUnitInventorySize(whichUnit)
endfunction

//===========================================================================
function SetItemInvulnerableBJ takesitem whichItem, boolean flag returnsnothing
    call SetItemInvulnerable(whichItem, flag)
endfunction

//===========================================================================
function SetItemDropOnDeathBJ takesitem whichItem, boolean flag returnsnothing
    call SetItemDropOnDeath(whichItem, flag)
endfunction

//===========================================================================
function SetItemDroppableBJ takesitem whichItem, boolean flag returnsnothing
    call SetItemDroppable(whichItem, flag)
endfunction

//===========================================================================
function SetItemPlayerBJ takesitem whichItem, player whichPlayer, boolean changeColor returnsnothing
    call SetItemPlayer(whichItem, whichPlayer, changeColor)
endfunction

//===========================================================================
function SetItemVisibleBJ takesboolean show, item whichItem returnsnothing
    call SetItemVisible(whichItem, show)
endfunction

//===========================================================================
function IsItemHiddenBJ takesitem whichItem returnsboolean
    returnnot IsItemVisible(whichItem)
endfunction

//===========================================================================
function ChooseRandomItemBJ takesinteger level returnsinteger
    returnChooseRandomItem(level)
endfunction

//===========================================================================
function ChooseRandomItemExBJ takesinteger level, itemtype whichType returnsinteger
    returnChooseRandomItemEx(whichType, level)
endfunction

//===========================================================================
function ChooseRandomNPBuildingBJ takesnothing returnsinteger
    returnChooseRandomNPBuilding()
endfunction

//===========================================================================
function ChooseRandomCreepBJ takesinteger level returnsinteger
    returnChooseRandomCreep(level)
endfunction

//===========================================================================
function EnumItemsInRectBJ takesrect r, code actionFunc returnsnothing
    call EnumItemsInRect(r, null, actionFunc)
endfunction

//===========================================================================
// See GroupPickRandomUnitEnum for the details of this algorithm.
//
function RandomItemInRectBJEnum takesnothing returnsnothing
    set bj_itemRandomConsidered = bj_itemRandomConsidered + 1
    if (GetRandomInt(1, bj_itemRandomConsidered) == 1) then
        set bj_itemRandomCurrentPick = GetEnumItem()
    endif
endfunction

//===========================================================================
// Picks a random item from within a rect, matching a condition
//
function RandomItemInRectBJ takesrect r, boolexpr filter returnsitem
    set bj_itemRandomConsidered = 0
    set bj_itemRandomCurrentPick = null
    call EnumItemsInRect(r, filter, function RandomItemInRectBJEnum)
    call DestroyBoolExpr(filter)
    returnbj_itemRandomCurrentPick
endfunction

//===========================================================================
// Picks a random item from within a rect
//
function RandomItemInRectSimpleBJ takesrect r returnsitem
    returnRandomItemInRectBJ(r, null)
endfunction

//===========================================================================
function CheckItemStatus takesitem whichItem, integer status returnsboolean
    if (status == bj_ITEM_STATUS_HIDDEN) then
        returnnot IsItemVisible(whichItem)
    elseif (status == bj_ITEM_STATUS_OWNED) then
        returnIsItemOwned(whichItem)
    elseif (status == bj_ITEM_STATUS_INVULNERABLE) then
        returnIsItemInvulnerable(whichItem)
    elseif (status == bj_ITEM_STATUS_POWERUP) then
        returnIsItemPowerup(whichItem)
    elseif (status == bj_ITEM_STATUS_SELLABLE) then
        returnIsItemSellable(whichItem)
    elseif (status == bj_ITEM_STATUS_PAWNABLE) then
        returnIsItemPawnable(whichItem)
    else
        // Unrecognized status - return false
        returnfalse
    endif
endfunction

//===========================================================================
function CheckItemcodeStatus takesinteger itemId, integer status returnsboolean
    if (status == bj_ITEMCODE_STATUS_POWERUP) then
        returnIsItemIdPowerup(itemId)
    elseif (status == bj_ITEMCODE_STATUS_SELLABLE) then
        returnIsItemIdSellable(itemId)
    elseif (status == bj_ITEMCODE_STATUS_PAWNABLE) then
        returnIsItemIdPawnable(itemId)
    else
        // Unrecognized status - return false
        returnfalse
    endif
endfunction



//***************************************************************************
//*
//*  Unit Utility Functions
//*
//***************************************************************************

//===========================================================================
function UnitId2OrderIdBJ takesinteger unitId returnsinteger
    returnunitId
endfunction

//===========================================================================
function String2UnitIdBJ takesstring unitIdString returnsinteger
    returnUnitId(unitIdString)
endfunction

//===========================================================================
function UnitId2StringBJ takesinteger unitId returnsstring
    local string unitString = UnitId2String(unitId)

    if (unitString != null) then
        returnunitString
    endif

    // The unitId was not recognized - return an empty string.
    return ""
endfunction

//===========================================================================
function String2OrderIdBJ takesstring orderIdString returnsinteger
    local integer orderId
    
    // Check to see if it's a generic order.
    set orderId = OrderId(orderIdString)
    if (orderId != 0) then
        returnorderId
    endif

    // Check to see if it's a (train) unit order.
    set orderId = UnitId(orderIdString)
    if (orderId != 0) then
        returnorderId
    endif

    // Unrecognized - return 0
    return 0
endfunction

//===========================================================================
function OrderId2StringBJ takesinteger orderId returnsstring
    local string orderString

    // Check to see if it's a generic order.
    set orderString = OrderId2String(orderId)
    if (orderString != null) then
        returnorderString
    endif

    // Check to see if it's a (train) unit order.
    set orderString = UnitId2String(orderId)
    if (orderString != null) then
        returnorderString
    endif

    // Unrecognized - return an empty string.
    return ""
endfunction

//===========================================================================
function GetIssuedOrderIdBJ takesnothing returnsinteger
    returnGetIssuedOrderId()
endfunction

//===========================================================================
function GetKillingUnitBJ takesnothing returnsunit
    returnGetKillingUnit()
endfunction

//===========================================================================
function CreateUnitAtLocSaveLast takesplayer id, integer unitid, location loc, real face returnsunit
    if (unitid == 'ugol') then
        set bj_lastCreatedUnit = CreateBlightedGoldmine(id, GetLocationX(loc), GetLocationY(loc), face)
    else
        set bj_lastCreatedUnit = CreateUnitAtLoc(id, unitid, loc, face)
    endif

    returnbj_lastCreatedUnit
endfunction

//===========================================================================
function GetLastCreatedUnit takesnothing returnsunit
    returnbj_lastCreatedUnit
endfunction

//===========================================================================
function CreateNUnitsAtLoc takesinteger count, integer unitId, player whichPlayer, location loc, real face returnsgroup
    call GroupClear(bj_lastCreatedGroup)
    loop
        set count = count - 1
        exitwhen count < 0
        call CreateUnitAtLocSaveLast(whichPlayer, unitId, loc, face)
        call GroupAddUnit(bj_lastCreatedGroup, bj_lastCreatedUnit)
    endloop
    returnbj_lastCreatedGroup
endfunction

//===========================================================================
function CreateNUnitsAtLocFacingLocBJ takesinteger count, integer unitId, player whichPlayer, location loc, location lookAt returnsgroup
    returnCreateNUnitsAtLoc(count, unitId, whichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction

//===========================================================================
function GetLastCreatedGroupEnum takesnothing returnsnothing
    call GroupAddUnit(bj_groupLastCreatedDest, GetEnumUnit())
endfunction

//===========================================================================
function GetLastCreatedGroup takesnothing returnsgroup
    set bj_groupLastCreatedDest = CreateGroup()
    call ForGroup(bj_lastCreatedGroup, function GetLastCreatedGroupEnum)
    returnbj_groupLastCreatedDest
endfunction

//===========================================================================
function CreateCorpseLocBJ takesinteger unitid, player whichPlayer, location loc returnsunit
    set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), GetRandomReal(0, 360))
    returnbj_lastCreatedUnit
endfunction

//===========================================================================
function UnitSuspendDecayBJ takesboolean suspend, unit whichUnit returnsnothing
    call UnitSuspendDecay(whichUnit, suspend)
endfunction

//===========================================================================
function DelayedSuspendDecayStopAnimEnum takesnothing returnsnothing
    local unit enumUnit = GetEnumUnit()

    if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call SetUnitTimeScale(enumUnit, 0.0001)
    endif
endfunction

//===========================================================================
function DelayedSuspendDecayBoneEnum takesnothing returnsnothing
    local unit enumUnit = GetEnumUnit()

    if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call UnitSuspendDecay(enumUnit, true)
        call SetUnitTimeScale(enumUnit, 0.0001)
    endif
endfunction

//===========================================================================
// Game code explicitly sets the animation back to "decay bone" after the
// initial corpse fades away, so we reset it now.  It's best not to show
// off corpses thus created until after this grace period has passed.
//
function DelayedSuspendDecayFleshEnum takesnothing returnsnothing
    local unit enumUnit = GetEnumUnit()

    if (GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call UnitSuspendDecay(enumUnit, true)
        call SetUnitTimeScale(enumUnit, 10.0)
        call SetUnitAnimation(enumUnit, "decay flesh")
    endif
endfunction

//===========================================================================
// Waits a short period of time to ensure that the corpse is decaying, and
// then suspend the animation and corpse decay.
//
function DelayedSuspendDecay takesnothing returnsnothing
    local group boneGroup
    local group fleshGroup

    // Switch the global unit groups over to local variables and recreate
    // the global versions, so that this function can handle overlapping
    // calls.
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

//===========================================================================
function DelayedSuspendDecayCreate takesnothing returnsnothing
    set bj_delayedSuspendDecayTrig = CreateTrigger()
    call TriggerRegisterTimerExpireEvent(bj_delayedSuspendDecayTrig, bj_delayedSuspendDecayTimer)
    call TriggerAddAction(bj_delayedSuspendDecayTrig, function DelayedSuspendDecay)
endfunction

//===========================================================================
function CreatePermanentCorpseLocBJ takesinteger style, integer unitid, player whichPlayer, location loc, real facing returnsunit
    set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), facing)
    call SetUnitBlendTime(bj_lastCreatedUnit, 0)

    if (style == bj_CORPSETYPE_FLESH) then
        call SetUnitAnimation(bj_lastCreatedUnit, "decay flesh")
        call GroupAddUnit(bj_suspendDecayFleshGroup, bj_lastCreatedUnit)
    elseif (style == bj_CORPSETYPE_BONE) then
        call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
        call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
    else
        // Unknown decay style - treat as skeletal.
        call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
        call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
    endif

    call TimerStart(bj_delayedSuspendDecayTimer, 0.05, false, null)
    returnbj_lastCreatedUnit
endfunction

//===========================================================================
function GetUnitStateSwap takesunitstate whichState, unit whichUnit returnsreal
    returnGetUnitState(whichUnit, whichState)
endfunction

//===========================================================================
function GetUnitStatePercent takesunit whichUnit, unitstate whichState, unitstate whichMaxState returnsreal
    local real value = GetUnitState(whichUnit, whichState)
    local real maxValue = GetUnitState(whichUnit, whichMaxState)

    // Return 0 for null units.
    if (whichUnit == null) or (maxValue == 0) then
        return 0.0
    endif

    returnvalue / maxValue * 100.0
endfunction

//===========================================================================
function GetUnitLifePercent takesunit whichUnit returnsreal
    returnGetUnitStatePercent(whichUnit, UNIT_STATE_LIFE, UNIT_STATE_MAX_LIFE)
endfunction

//===========================================================================
function GetUnitManaPercent takesunit whichUnit returnsreal
    returnGetUnitStatePercent(whichUnit, UNIT_STATE_MANA, UNIT_STATE_MAX_MANA)
endfunction

//===========================================================================
function SelectUnitSingle takesunit whichUnit returnsnothing
    call ClearSelection()
    call SelectUnit(whichUnit, true)
endfunction

//===========================================================================
function SelectGroupBJEnum takesnothing returnsnothing
    call SelectUnit(GetEnumUnit(), true)
endfunction

//===========================================================================
function SelectGroupBJ takesgroup g returnsnothing
    call ClearSelection()
    call ForGroup(g, function SelectGroupBJEnum)
endfunction

//===========================================================================
function SelectUnitAdd takesunit whichUnit returnsnothing
    call SelectUnit(whichUnit, true)
endfunction

//===========================================================================
function SelectUnitRemove takesunit whichUnit returnsnothing
    call SelectUnit(whichUnit, false)
endfunction

//===========================================================================
function ClearSelectionForPlayer takesplayer whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
    endif
endfunction

//===========================================================================
function SelectUnitForPlayerSingle takesunit whichUnit, player whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
        call SelectUnit(whichUnit, true)
    endif
endfunction

//===========================================================================
function SelectGroupForPlayerBJ takesgroup g, player whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
        call ForGroup(g, function SelectGroupBJEnum)
    endif
endfunction

//===========================================================================
function SelectUnitAddForPlayer takesunit whichUnit, player whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SelectUnit(whichUnit, true)
    endif
endfunction

//===========================================================================
function SelectUnitRemoveForPlayer takesunit whichUnit, player whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SelectUnit(whichUnit, false)
    endif
endfunction

//===========================================================================
function SetUnitLifeBJ takesunit whichUnit, real newValue returnsnothing
    call SetUnitState(whichUnit, UNIT_STATE_LIFE, RMaxBJ(0, newValue))
endfunction

//===========================================================================
function SetUnitManaBJ takesunit whichUnit, real newValue returnsnothing
    call SetUnitState(whichUnit, UNIT_STATE_MANA, RMaxBJ(0, newValue))
endfunction

//===========================================================================
function SetUnitLifePercentBJ takesunit whichUnit, real percent returnsnothing
    call SetUnitState(whichUnit, UNIT_STATE_LIFE, GetUnitState(whichUnit, UNIT_STATE_MAX_LIFE) * RMaxBJ(0, percent) * 0.01)
endfunction

//===========================================================================
function SetUnitManaPercentBJ takesunit whichUnit, real percent returnsnothing
    call SetUnitState(whichUnit, UNIT_STATE_MANA, GetUnitState(whichUnit, UNIT_STATE_MAX_MANA) * RMaxBJ(0, percent) * 0.01)
endfunction

//===========================================================================
function IsUnitDeadBJ takesunit whichUnit returnsboolean
    returnGetUnitState(whichUnit, UNIT_STATE_LIFE) <= 0
endfunction

//===========================================================================
function IsUnitAliveBJ takesunit whichUnit returnsboolean
    returnnot IsUnitDeadBJ(whichUnit)
endfunction

//===========================================================================
function IsUnitGroupDeadBJEnum takesnothing returnsnothing
    if not IsUnitDeadBJ(GetEnumUnit()) then
        set bj_isUnitGroupDeadResult = false
    endif
endfunction

//===========================================================================
// Returns true if every unit of the group is dead.
//
function IsUnitGroupDeadBJ takesgroup g returnsboolean
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_isUnitGroupDeadResult = true
    call ForGroup(g, function IsUnitGroupDeadBJEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(g)
    endif
    returnbj_isUnitGroupDeadResult
endfunction

//===========================================================================
function IsUnitGroupEmptyBJEnum takesnothing returnsnothing
    set bj_isUnitGroupEmptyResult = false
endfunction

//===========================================================================
// Returns true if the group contains no units.
//
function IsUnitGroupEmptyBJ takesgroup g returnsboolean
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_isUnitGroupEmptyResult = true
    call ForGroup(g, function IsUnitGroupEmptyBJEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(g)
    endif
    returnbj_isUnitGroupEmptyResult
endfunction

//===========================================================================
function IsUnitGroupInRectBJEnum takesnothing returnsnothing
    if not RectContainsUnit(bj_isUnitGroupInRectRect, GetEnumUnit()) then
        set bj_isUnitGroupInRectResult = false
    endif
endfunction

//===========================================================================
// Returns true if every unit of the group is within the given rect.
//
function IsUnitGroupInRectBJ takesgroup g, rect r returnsboolean
    set bj_isUnitGroupInRectResult = true
    set bj_isUnitGroupInRectRect = r
    call ForGroup(g, function IsUnitGroupInRectBJEnum)
    returnbj_isUnitGroupInRectResult
endfunction

//===========================================================================
function IsUnitHiddenBJ takesunit whichUnit returnsboolean
    returnIsUnitHidden(whichUnit)
endfunction

//===========================================================================
function ShowUnitHide takesunit whichUnit returnsnothing
    call ShowUnit(whichUnit, false)
endfunction

//===========================================================================
function ShowUnitShow takesunit whichUnit returnsnothing
    // Prevent dead heroes from being unhidden.
    if (IsUnitType(whichUnit, UNIT_TYPE_HERO) and IsUnitDeadBJ(whichUnit)) then
        return
    endif

    call ShowUnit(whichUnit, true)
endfunction

//===========================================================================
function IssueHauntOrderAtLocBJFilter takesnothing returnsboolean
    returnGetUnitTypeId(GetFilterUnit()) == 'ngol'
endfunction

//===========================================================================
function IssueHauntOrderAtLocBJ takesunit whichPeon, location loc returnsboolean
    local group g = null
    local unit goldMine = null

    // Search for a gold mine within a 1-cell radius of the specified location.
    set g = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(g, loc, 2 * bj_CELLWIDTH, filterIssueHauntOrderAtLocBJ)
    set goldMine = FirstOfGroup(g)
    call DestroyGroup(g)

    // If no mine was found, abort the request.
    if (goldMine == null) then
        returnfalse
    endif

    // Issue the Haunt Gold Mine order.
    returnIssueTargetOrderById(whichPeon, 'ugol', goldMine)
endfunction

//===========================================================================
function IssueBuildOrderByIdLocBJ takesunit whichPeon, integer unitId, location loc returnsboolean
    if (unitId == 'ugol') then
        returnIssueHauntOrderAtLocBJ(whichPeon, loc)
    else
        returnIssueBuildOrderById(whichPeon, unitId, GetLocationX(loc), GetLocationY(loc))
    endif
endfunction

//===========================================================================
function IssueTrainOrderByIdBJ takesunit whichUnit, integer unitId returnsboolean
    returnIssueImmediateOrderById(whichUnit, unitId)
endfunction

//===========================================================================
function GroupTrainOrderByIdBJ takesgroup g, integer unitId returnsboolean
    returnGroupImmediateOrderById(g, unitId)
endfunction

//===========================================================================
function IssueUpgradeOrderByIdBJ takesunit whichUnit, integer techId returnsboolean
    returnIssueImmediateOrderById(whichUnit, techId)
endfunction

//===========================================================================
function GetAttackedUnitBJ takesnothing returnsunit
    returnGetTriggerUnit()
endfunction

//===========================================================================
function SetUnitFlyHeightBJ takesunit whichUnit, real newHeight, real rate returnsnothing
    call SetUnitFlyHeight(whichUnit, newHeight, rate)
endfunction

//===========================================================================
function SetUnitTurnSpeedBJ takesunit whichUnit, real turnSpeed returnsnothing
    call SetUnitTurnSpeed(whichUnit, turnSpeed)
endfunction

//===========================================================================
function SetUnitPropWindowBJ takesunit whichUnit, real propWindow returnsnothing
    local real angle = propWindow
    if (angle <= 0) then
        set angle = 1
    elseif (angle >= 360) then
        set angle = 359
    endif
    set angle = angle * bj_DEGTORAD

    call SetUnitPropWindow(whichUnit, angle)
endfunction

//===========================================================================
function GetUnitPropWindowBJ takesunit whichUnit returnsreal
    returnGetUnitPropWindow(whichUnit) * bj_RADTODEG
endfunction

//===========================================================================
function GetUnitDefaultPropWindowBJ takesunit whichUnit returnsreal
    returnGetUnitDefaultPropWindow(whichUnit)
endfunction

//===========================================================================
function SetUnitBlendTimeBJ takesunit whichUnit, real blendTime returnsnothing
    call SetUnitBlendTime(whichUnit, blendTime)
endfunction

//===========================================================================
function SetUnitAcquireRangeBJ takesunit whichUnit, real acquireRange returnsnothing
    call SetUnitAcquireRange(whichUnit, acquireRange)
endfunction

//===========================================================================
function UnitSetCanSleepBJ takesunit whichUnit, boolean canSleep returnsnothing
    call UnitAddSleep(whichUnit, canSleep)
endfunction

//===========================================================================
function UnitCanSleepBJ takesunit whichUnit returnsboolean
    returnUnitCanSleep(whichUnit)
endfunction

//===========================================================================
function UnitWakeUpBJ takesunit whichUnit returnsnothing
    call UnitWakeUp(whichUnit)
endfunction

//===========================================================================
function UnitIsSleepingBJ takesunit whichUnit returnsboolean
    returnUnitIsSleeping(whichUnit)
endfunction

//===========================================================================
function WakePlayerUnitsEnum takesnothing returnsnothing
    call UnitWakeUp(GetEnumUnit())
endfunction

//===========================================================================
function WakePlayerUnits takesplayer whichPlayer returnsnothing
    local group g = CreateGroup()
    call GroupEnumUnitsOfPlayer(g, whichPlayer, null)
    call ForGroup(g, function WakePlayerUnitsEnum)
    call DestroyGroup(g)
endfunction

//===========================================================================
function EnableCreepSleepBJ takesboolean enable returnsnothing
    call SetPlayerState(Player(PLAYER_NEUTRAL_AGGRESSIVE), PLAYER_STATE_NO_CREEP_SLEEP, IntegerTertiaryOp(enable, 0, 1))

    // If we're disabling, attempt to wake any already-sleeping creeps.
    if (not enable) then
        call WakePlayerUnits(Player(PLAYER_NEUTRAL_AGGRESSIVE))
    endif
endfunction

//===========================================================================
function UnitGenerateAlarms takesunit whichUnit, boolean generate returnsboolean
    returnUnitIgnoreAlarm(whichUnit, not generate)
endfunction

//===========================================================================
function DoesUnitGenerateAlarms takesunit whichUnit returnsboolean
    returnnot UnitIgnoreAlarmToggled(whichUnit)
endfunction

//===========================================================================
function PauseAllUnitsBJEnum takesnothing returnsnothing
    call PauseUnit(GetEnumUnit(), bj_pauseAllUnitsFlag)
endfunction

//===========================================================================
// Pause all units 
function PauseAllUnitsBJ takesboolean pause returnsnothing
    local integer index
    local player  indexPlayer
    local group   g

    set bj_pauseAllUnitsFlag = pause
    set g = CreateGroup()
    set index = 0
    loop
        set indexPlayer = Player(index)

        // If this is a computer slot, pause/resume the AI.
        if (GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
            call PauseCompAI(indexPlayer, pause)
        endif

        // Enumerate and unpause every unit owned by the player.
        call GroupEnumUnitsOfPlayer(g, indexPlayer, null)
        call ForGroup(g, function PauseAllUnitsBJEnum)
        call GroupClear(g)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYER_SLOTS
    endloop
    call DestroyGroup(g)
endfunction

//===========================================================================
function PauseUnitBJ takesboolean pause, unit whichUnit returnsnothing
    call PauseUnit(whichUnit, pause)
endfunction

//===========================================================================
function IsUnitPausedBJ takesunit whichUnit returnsboolean
    returnIsUnitPaused(whichUnit)
endfunction

//===========================================================================
function UnitPauseTimedLifeBJ takesboolean flag, unit whichUnit returnsnothing
    call UnitPauseTimedLife(whichUnit, flag)
endfunction

//===========================================================================
function UnitApplyTimedLifeBJ takesreal duration, integer buffId, unit whichUnit returnsnothing
    call UnitApplyTimedLife(whichUnit, buffId, duration)
endfunction

//===========================================================================
function UnitShareVisionBJ takesboolean share, unit whichUnit, player whichPlayer returnsnothing
    call UnitShareVision(whichUnit, whichPlayer, share)
endfunction

//===========================================================================
function UnitRemoveBuffsBJ takesinteger buffType, unit whichUnit returnsnothing
    if (buffType == bj_REMOVEBUFFS_POSITIVE) then
        call UnitRemoveBuffs(whichUnit, true, false)
    elseif (buffType == bj_REMOVEBUFFS_NEGATIVE) then
        call UnitRemoveBuffs(whichUnit, false, true)
    elseif (buffType == bj_REMOVEBUFFS_ALL) then
        call UnitRemoveBuffs(whichUnit, true, true)
    elseif (buffType == bj_REMOVEBUFFS_NONTLIFE) then
        call UnitRemoveBuffsEx(whichUnit, true, true, false, false, false, true, false)
    else
        // Unrecognized dispel type - ignore the request.
    endif
endfunction

//===========================================================================
function UnitRemoveBuffsExBJ takesinteger polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returnsnothing
    local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_POSITIVE)
    local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_NEGATIVE)
    local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_MAGIC)
    local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_PHYSICAL)

    call UnitRemoveBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction

//===========================================================================
function UnitCountBuffsExBJ takesinteger polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returnsinteger
    local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_POSITIVE)
    local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or (polarity == bj_BUFF_POLARITY_NEGATIVE)
    local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_MAGIC)
    local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or (resist == bj_BUFF_RESIST_PHYSICAL)

    returnUnitCountBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction

//===========================================================================
function UnitRemoveAbilityBJ takesinteger abilityId, unit whichUnit returnsboolean
    returnUnitRemoveAbility(whichUnit, abilityId)
endfunction

//===========================================================================
function UnitAddAbilityBJ takesinteger abilityId, unit whichUnit returnsboolean
    returnUnitAddAbility(whichUnit, abilityId)
endfunction

//===========================================================================
function UnitRemoveTypeBJ takesunittype whichType, unit whichUnit returnsboolean
    returnUnitRemoveType(whichUnit, whichType)
endfunction

//===========================================================================
function UnitAddTypeBJ takesunittype whichType, unit whichUnit returnsboolean
    returnUnitAddType(whichUnit, whichType)
endfunction

//===========================================================================
function UnitMakeAbilityPermanentBJ takesboolean permanent, integer abilityId, unit whichUnit returnsboolean
    returnUnitMakeAbilityPermanent(whichUnit, permanent, abilityId)
endfunction

//===========================================================================
function SetUnitExplodedBJ takesunit whichUnit, boolean exploded returnsnothing
    call SetUnitExploded(whichUnit, exploded)
endfunction

//===========================================================================
function ExplodeUnitBJ takesunit whichUnit returnsnothing
    call SetUnitExploded(whichUnit, true)
    call KillUnit(whichUnit)
endfunction

//===========================================================================
function GetTransportUnitBJ takesnothing returnsunit
    returnGetTransportUnit()
endfunction

//===========================================================================
function GetLoadedUnitBJ takesnothing returnsunit
    returnGetLoadedUnit()
endfunction

//===========================================================================
function IsUnitInTransportBJ takesunit whichUnit, unit whichTransport returnsboolean
    returnIsUnitInTransport(whichUnit, whichTransport)
endfunction

//===========================================================================
function IsUnitLoadedBJ takesunit whichUnit returnsboolean
    returnIsUnitLoaded(whichUnit)
endfunction

//===========================================================================
function IsUnitIllusionBJ takesunit whichUnit returnsboolean
    returnIsUnitIllusion(whichUnit)
endfunction

//===========================================================================
// This attempts to replace a unit with a new unit type by creating a new
// unit of the desired type using the old unit's location, facing, etc.
//
function ReplaceUnitBJ takesunit whichUnit, integer newUnitId, integer unitStateMethod returnsunit
    local unit    oldUnit = whichUnit
    local unit    newUnit
    local boolean wasHidden
    local integer index
    local item    indexItem
    local real    oldRatio

    // If we have bogus data, don't attempt the replace.
    if (oldUnit == null) then
        set bj_lastReplacedUnit = oldUnit
        returnoldUnit
    endif

    // Hide the original unit.
    set wasHidden = IsUnitHidden(oldUnit)
    call ShowUnit(oldUnit, false)

    // Create the replacement unit.
    if (newUnitId == 'ugol') then
        set newUnit = CreateBlightedGoldmine(GetOwningPlayer(oldUnit), GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
    else
        set newUnit = CreateUnit(GetOwningPlayer(oldUnit), newUnitId, GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
    endif

    // Set the unit's life and mana according to the requested method.
    if (unitStateMethod == bj_UNIT_STATE_METHOD_RELATIVE) then
        // Set the replacement's current/max life ratio to that of the old unit.
        // If both units have mana, do the same for mana.
        if (GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE) > 0) then
            set oldRatio = GetUnitState(oldUnit, UNIT_STATE_LIFE) / GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE)
            call SetUnitState(newUnit, UNIT_STATE_LIFE, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_LIFE))
        endif

        if (GetUnitState(oldUnit, UNIT_STATE_MAX_MANA) > 0) and (GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
            set oldRatio = GetUnitState(oldUnit, UNIT_STATE_MANA) / GetUnitState(oldUnit, UNIT_STATE_MAX_MANA)
            call SetUnitState(newUnit, UNIT_STATE_MANA, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_MANA))
        endif
    elseif (unitStateMethod == bj_UNIT_STATE_METHOD_ABSOLUTE) then
        // Set the replacement's current life to that of the old unit.
        // If the new unit has mana, do the same for mana.
        call SetUnitState(newUnit, UNIT_STATE_LIFE, GetUnitState(oldUnit, UNIT_STATE_LIFE))
        if (GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
            call SetUnitState(newUnit, UNIT_STATE_MANA, GetUnitState(oldUnit, UNIT_STATE_MANA))
        endif
    elseif (unitStateMethod == bj_UNIT_STATE_METHOD_DEFAULTS) then
        // The newly created unit should already have default life and mana.
    elseif (unitStateMethod == bj_UNIT_STATE_METHOD_MAXIMUM) then
        // Use max life and mana.
        call SetUnitState(newUnit, UNIT_STATE_LIFE, GetUnitState(newUnit, UNIT_STATE_MAX_LIFE))
        call SetUnitState(newUnit, UNIT_STATE_MANA, GetUnitState(newUnit, UNIT_STATE_MAX_MANA))
    else
        // Unrecognized unit state method - ignore the request.
    endif

    // Mirror properties of the old unit onto the new unit.
    //call PauseUnit(newUnit, IsUnitPaused(oldUnit))
    call SetResourceAmount(newUnit, GetResourceAmount(oldUnit))

    // If both the old and new units are heroes, handle their hero info.
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

    // Remove or kill the original unit.  It is sometimes unsafe to remove
    // hidden units, so kill the original unit if it was previously hidden.
    if wasHidden then
        call KillUnit(oldUnit)
        call RemoveUnit(oldUnit)
    else
        call RemoveUnit(oldUnit)
    endif

    set bj_lastReplacedUnit = newUnit
    returnnewUnit
endfunction

//===========================================================================
function GetLastReplacedUnitBJ takesnothing returnsunit
    returnbj_lastReplacedUnit
endfunction

//===========================================================================
function SetUnitPositionLocFacingBJ takesunit whichUnit, location loc, real facing returnsnothing
    call SetUnitPositionLoc(whichUnit, loc)
    call SetUnitFacing(whichUnit, facing)
endfunction

//===========================================================================
function SetUnitPositionLocFacingLocBJ takesunit whichUnit, location loc, location lookAt returnsnothing
    call SetUnitPositionLoc(whichUnit, loc)
    call SetUnitFacing(whichUnit, AngleBetweenPoints(loc, lookAt))
endfunction

//===========================================================================
function AddItemToStockBJ takesinteger itemId, unit whichUnit, integer currentStock, integer stockMax returnsnothing
    call AddItemToStock(whichUnit, itemId, currentStock, stockMax)
endfunction

//===========================================================================
function AddUnitToStockBJ takesinteger unitId, unit whichUnit, integer currentStock, integer stockMax returnsnothing
    call AddUnitToStock(whichUnit, unitId, currentStock, stockMax)
endfunction

//===========================================================================
function RemoveItemFromStockBJ takesinteger itemId, unit whichUnit returnsnothing
    call RemoveItemFromStock(whichUnit, itemId)
endfunction

//===========================================================================
function RemoveUnitFromStockBJ takesinteger unitId, unit whichUnit returnsnothing
    call RemoveUnitFromStock(whichUnit, unitId)
endfunction

//===========================================================================
function SetUnitUseFoodBJ takesboolean enable, unit whichUnit returnsnothing
    call SetUnitUseFood(whichUnit, enable)
endfunction

//===========================================================================
function UnitDamagePointLoc takesunit whichUnit, real delay, real radius, location loc, real amount, attacktype whichAttack, damagetype whichDamage returnsboolean
    returnUnitDamagePoint(whichUnit, delay, radius, GetLocationX(loc), GetLocationY(loc), amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction

//===========================================================================
function UnitDamageTargetBJ takesunit whichUnit, unit target, real amount, attacktype whichAttack, damagetype whichDamage returnsboolean
    returnUnitDamageTarget(whichUnit, target, amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction



//***************************************************************************
//*
//*  Destructable Utility Functions
//*
//***************************************************************************

//===========================================================================
function CreateDestructableLoc takesinteger objectid, location loc, real facing, real scale, integer variation returnsdestructable
    set bj_lastCreatedDestructable = CreateDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
    returnbj_lastCreatedDestructable
endfunction

//===========================================================================
function CreateDeadDestructableLocBJ takesinteger objectid, location loc, real facing, real scale, integer variation returnsdestructable
    set bj_lastCreatedDestructable = CreateDeadDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
    returnbj_lastCreatedDestructable
endfunction

//===========================================================================
function GetLastCreatedDestructable takesnothing returnsdestructable
    returnbj_lastCreatedDestructable
endfunction

//===========================================================================
function ShowDestructableBJ takesboolean flag, destructable d returnsnothing
    call ShowDestructable(d, flag)
endfunction

//===========================================================================
function SetDestructableInvulnerableBJ takesdestructable d, boolean flag returnsnothing
    call SetDestructableInvulnerable(d, flag)
endfunction

//===========================================================================
function IsDestructableInvulnerableBJ takesdestructable d returnsboolean
    returnIsDestructableInvulnerable(d)
endfunction

//===========================================================================
function GetDestructableLoc takesdestructable whichDestructable returnslocation
    returnLocation(GetDestructableX(whichDestructable), GetDestructableY(whichDestructable))
endfunction

//===========================================================================
function EnumDestructablesInRectAll takesrect r, code actionFunc returnsnothing
    call EnumDestructablesInRect(r, null, actionFunc)
endfunction

//===========================================================================
function EnumDestructablesInCircleBJFilter takesnothing returnsboolean
    local location destLoc = GetDestructableLoc(GetFilterDestructable())
    local boolean result

    set result = DistanceBetweenPoints(destLoc, bj_enumDestructableCenter) <= bj_enumDestructableRadius
    call RemoveLocation(destLoc)
    returnresult
endfunction

//===========================================================================
function IsDestructableDeadBJ takesdestructable d returnsboolean
    returnGetDestructableLife(d) <= 0
endfunction

//===========================================================================
function IsDestructableAliveBJ takesdestructable d returnsboolean
    returnnot IsDestructableDeadBJ(d)
endfunction

//===========================================================================
// See GroupPickRandomUnitEnum for the details of this algorithm.
//
function RandomDestructableInRectBJEnum takesnothing returnsnothing
    set bj_destRandomConsidered = bj_destRandomConsidered + 1
    if (GetRandomInt(1, bj_destRandomConsidered) == 1) then
        set bj_destRandomCurrentPick = GetEnumDestructable()
    endif
endfunction

//===========================================================================
// Picks a random destructable from within a rect, matching a condition
//
function RandomDestructableInRectBJ takesrect r, boolexpr filter returnsdestructable
    set bj_destRandomConsidered = 0
    set bj_destRandomCurrentPick = null
    call EnumDestructablesInRect(r, filter, function RandomDestructableInRectBJEnum)
    call DestroyBoolExpr(filter)
    returnbj_destRandomCurrentPick
endfunction

//===========================================================================
// Picks a random destructable from within a rect
//
function RandomDestructableInRectSimpleBJ takesrect r returnsdestructable
    returnRandomDestructableInRectBJ(r, null)
endfunction

//===========================================================================
// Enumerates within a rect, with a filter to narrow the enumeration down
// objects within a circular area.
//
function EnumDestructablesInCircleBJ takesreal radius, location loc, code actionFunc returnsnothing
    local rect r

    if (radius >= 0) then
        set bj_enumDestructableCenter = loc
        set bj_enumDestructableRadius = radius
        set r = GetRectFromCircleBJ(loc, radius)
        call EnumDestructablesInRect(r, filterEnumDestructablesInCircleBJ, actionFunc)
        call RemoveRect(r)
    endif
endfunction

//===========================================================================
function SetDestructableLifePercentBJ takesdestructable d, real percent returnsnothing
    call SetDestructableLife(d, GetDestructableMaxLife(d) * percent * 0.01)
endfunction

//===========================================================================
function SetDestructableMaxLifeBJ takesdestructable d, real max returnsnothing
    call SetDestructableMaxLife(d, max)
endfunction

//===========================================================================
function ModifyGateBJ takesinteger gateOperation, destructable d returnsnothing
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
        // Unrecognized gate state - ignore the request.
    endif
endfunction

//===========================================================================
// Determine the elevator's height from its occlusion height.
//
function GetElevatorHeight takesdestructable d returnsinteger
    local integer height

    set height = 1 + R2I(GetDestructableOccluderHeight(d) / bj_CLIFFHEIGHT)
    if (height < 1) or (height > 3) then
        set height = 1
    endif
    returnheight
endfunction

//===========================================================================
// To properly animate an elevator, we must know not only what height we
// want to change to, but also what height we are currently at.  This code
// determines the elevator's current height from its occlusion height.
// Arbitrarily changing an elevator's occlusion height is thus inadvisable.
//
function ChangeElevatorHeight takesdestructable d, integer newHeight returnsnothing
    local integer oldHeight

    // Cap the new height within the supported range.
    set newHeight = IMaxBJ(1, newHeight)
    set newHeight = IMinBJ(3, newHeight)

    // Find out what height the elevator is already at.
    set oldHeight = GetElevatorHeight(d)

    // Set the elevator's occlusion height.
    call SetDestructableOccluderHeight(d, bj_CLIFFHEIGHT * (newHeight-1))

    if (newHeight == 1) then
        if (oldHeight == 2) then
            call SetDestructableAnimation(d, "birth")
            call QueueDestructableAnimation(d, "stand")
        elseif (oldHeight == 3) then
            call SetDestructableAnimation(d, "birth third")
            call QueueDestructableAnimation(d, "stand")
        else
            // Unrecognized old height - snap to new height.
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
            // Unrecognized old height - snap to new height.
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
            // Unrecognized old height - snap to new height.
            call SetDestructableAnimation(d, "stand third")
        endif
    else
        // Unrecognized new height - ignore the request.
    endif
endfunction

//===========================================================================
// Grab the unit and throw his own coords in his face, forcing him to push
// and shove until he finds a spot where noone will bother him.
//
function NudgeUnitsInRectEnum takesnothing returnsnothing
    local unit nudgee = GetEnumUnit()

    call SetUnitPosition(nudgee, GetUnitX(nudgee), GetUnitY(nudgee))
endfunction

//===========================================================================
function NudgeItemsInRectEnum takesnothing returnsnothing
    local item nudgee = GetEnumItem()

    call SetItemPosition(nudgee, GetItemX(nudgee), GetItemY(nudgee))
endfunction

//===========================================================================
// Nudge the items and units within a given rect ever so gently, so as to
// encourage them to find locations where they can peacefully coexist with
// pathing restrictions and live happy, fruitful lives.
//
function NudgeObjectsInRect takesrect nudgeArea returnsnothing
    local group        g

    set g = CreateGroup()
    call GroupEnumUnitsInRect(g, nudgeArea, null)
    call ForGroup(g, function NudgeUnitsInRectEnum)
    call DestroyGroup(g)

    call EnumItemsInRect(nudgeArea, null, function NudgeItemsInRectEnum)
endfunction

//===========================================================================
function NearbyElevatorExistsEnum takesnothing returnsnothing
    local destructable d = GetEnumDestructable()
    local integer      dType = GetDestructableTypeId(d)

    if (dType == bj_ELEVATOR_CODE01) or (dType == bj_ELEVATOR_CODE02) then
        set bj_elevatorNeighbor = d
    endif
endfunction

//===========================================================================
function NearbyElevatorExists takesreal x, real y returnsboolean
    local real findThreshold = 32
    local rect r

    // If another elevator is overlapping this one, ignore the wall.
    set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
    set bj_elevatorNeighbor = null
    call EnumDestructablesInRect(r, null, function NearbyElevatorExistsEnum)
    call RemoveRect(r)

    returnbj_elevatorNeighbor != null
endfunction

//===========================================================================
function FindElevatorWallBlockerEnum takesnothing returnsnothing
    set bj_elevatorWallBlocker = GetEnumDestructable()
endfunction

//===========================================================================
// This toggles pathing on or off for one wall of an elevator by killing
// or reviving a pathing blocker at the appropriate location (and creating
// the pathing blocker in the first place, if it does not yet exist).
//
function ChangeElevatorWallBlocker takesreal x, real y, real facing, boolean open returnsnothing
    local destructable blocker = null
    local real         findThreshold = 32
    local real         nudgeLength = 4.25 * bj_CELLWIDTH
    local real         nudgeWidth = 1.25 * bj_CELLWIDTH
    local rect         r

    // Search for the pathing blocker within the general area.
    set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
    set bj_elevatorWallBlocker = null
    call EnumDestructablesInRect(r, null, function FindElevatorWallBlockerEnum)
    call RemoveRect(r)
    set blocker = bj_elevatorWallBlocker

    // Ensure that the blocker exists.
    if (blocker == null) then
        set blocker = CreateDeadDestructable(bj_ELEVATOR_BLOCKER_CODE, x, y, facing, 1, 0)
    elseif (GetDestructableTypeId(blocker) != bj_ELEVATOR_BLOCKER_CODE) then
        // If a different destructible exists in the blocker's spot, ignore
        // the request.  (Two destructibles cannot occupy the same location
        // on the map, so we cannot create an elevator blocker here.)
        return
    endif

    if (open) then
        // Ensure that the blocker is dead.
        if (GetDestructableLife(blocker) > 0) then
            call KillDestructable(blocker)
        endif
    else
        // Ensure that the blocker is alive.
        if (GetDestructableLife(blocker) <= 0) then
            call DestructableRestoreLife(blocker, GetDestructableMaxLife(blocker), false)
        endif

        // Nudge any objects standing in the blocker's way.
        if (facing == 0) then
            set r = Rect(x - nudgeWidth / 2, y - nudgeLength / 2, x + nudgeWidth / 2, y + nudgeLength / 2)
            call NudgeObjectsInRect(r)
            call RemoveRect(r)
        elseif (facing == 90) then
            set r = Rect(x - nudgeLength / 2, y - nudgeWidth / 2, x + nudgeLength / 2, y + nudgeWidth / 2)
            call NudgeObjectsInRect(r)
            call RemoveRect(r)
        else
            // Unrecognized blocker angle - don't nudge anything.
        endif
    endif
endfunction

//===========================================================================
function ChangeElevatorWalls takesboolean open, integer walls, destructable d returnsnothing
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



//***************************************************************************
//*
//*  Neutral Building Utility Functions
//*
//***************************************************************************

//===========================================================================
function WaygateActivateBJ takesboolean activate, unit waygate returnsnothing
    call WaygateActivate(waygate, activate)
endfunction

//===========================================================================
function WaygateIsActiveBJ takesunit waygate returnsboolean
    returnWaygateIsActive(waygate)
endfunction

//===========================================================================
function WaygateSetDestinationLocBJ takesunit waygate, location loc returnsnothing
    call WaygateSetDestination(waygate, GetLocationX(loc), GetLocationY(loc))
endfunction

//===========================================================================
function WaygateGetDestinationLocBJ takesunit waygate returnslocation
    returnLocation(WaygateGetDestinationX(waygate), WaygateGetDestinationY(waygate))
endfunction

//===========================================================================
function UnitSetUsesAltIconBJ takesboolean flag, unit whichUnit returnsnothing
    call UnitSetUsesAltIcon(whichUnit, flag)
endfunction



//***************************************************************************
//*
//*  UI Utility Functions
//*
//***************************************************************************

//===========================================================================
function ForceUIKeyBJ takesplayer whichPlayer, string key returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ForceUIKey(key)
    endif
endfunction

//===========================================================================
function ForceUICancelBJ takesplayer whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ForceUICancel()
    endif
endfunction



//***************************************************************************
//*
//*  Group and Force Utility Functions
//*
//***************************************************************************

//===========================================================================
function ForGroupBJ takesgroup whichGroup, code callback returnsnothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    call ForGroup(whichGroup, callback)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(whichGroup)
    endif
endfunction

//===========================================================================
function GroupAddUnitSimple takesunit whichUnit, group whichGroup returnsnothing
    call GroupAddUnit(whichGroup, whichUnit)
endfunction

//===========================================================================
function GroupRemoveUnitSimple takesunit whichUnit, group whichGroup returnsnothing
    call GroupRemoveUnit(whichGroup, whichUnit)
endfunction

//===========================================================================
function GroupAddGroupEnum takesnothing returnsnothing
    call GroupAddUnit(bj_groupAddGroupDest, GetEnumUnit())
endfunction

//===========================================================================
function GroupAddGroup takesgroup sourceGroup, group destGroup returnsnothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupAddGroupDest = destGroup
    call ForGroup(sourceGroup, function GroupAddGroupEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(sourceGroup)
    endif
endfunction

//===========================================================================
function GroupRemoveGroupEnum takesnothing returnsnothing
    call GroupRemoveUnit(bj_groupRemoveGroupDest, GetEnumUnit())
endfunction

//===========================================================================
function GroupRemoveGroup takesgroup sourceGroup, group destGroup returnsnothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupRemoveGroupDest = destGroup
    call ForGroup(sourceGroup, function GroupRemoveGroupEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(sourceGroup)
    endif
endfunction

//===========================================================================
function ForceAddPlayerSimple takesplayer whichPlayer, force whichForce returnsnothing
    call ForceAddPlayer(whichForce, whichPlayer)
endfunction

//===========================================================================
function ForceRemovePlayerSimple takesplayer whichPlayer, force whichForce returnsnothing
    call ForceRemovePlayer(whichForce, whichPlayer)
endfunction

//===========================================================================
// Consider each unit, one at a time, keeping a "current pick".   Once all units
// are considered, this "current pick" will be the resulting random unit.
//
// The chance of picking a given unit over the "current pick" is 1/N, where N is
// the number of units considered thusfar (including the current consideration).
//
function GroupPickRandomUnitEnum takesnothing returnsnothing
    set bj_groupRandomConsidered = bj_groupRandomConsidered + 1
    if (GetRandomInt(1, bj_groupRandomConsidered) == 1) then
        set bj_groupRandomCurrentPick = GetEnumUnit()
    endif
endfunction

//===========================================================================
// Picks a random unit from a group.
//
function GroupPickRandomUnit takesgroup whichGroup returnsunit
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupRandomConsidered = 0
    set bj_groupRandomCurrentPick = null
    call ForGroup(whichGroup, function GroupPickRandomUnitEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(whichGroup)
    endif
    returnbj_groupRandomCurrentPick
endfunction

//===========================================================================
// See GroupPickRandomUnitEnum for the details of this algorithm.
//
function ForcePickRandomPlayerEnum takesnothing returnsnothing
    set bj_forceRandomConsidered = bj_forceRandomConsidered + 1
    if (GetRandomInt(1, bj_forceRandomConsidered) == 1) then
        set bj_forceRandomCurrentPick = GetEnumPlayer()
    endif
endfunction

//===========================================================================
// Picks a random player from a force.
//
function ForcePickRandomPlayer takesforce whichForce returnsplayer
    set bj_forceRandomConsidered = 0
    set bj_forceRandomCurrentPick = null
    call ForForce(whichForce, function ForcePickRandomPlayerEnum)
    returnbj_forceRandomCurrentPick
endfunction

//===========================================================================
function EnumUnitsSelected takesplayer whichPlayer, boolexpr enumFilter, code enumAction returnsnothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, whichPlayer, enumFilter)
    call DestroyBoolExpr(enumFilter)
    call ForGroup(g, enumAction)
    call DestroyGroup(g)
endfunction

//===========================================================================
function GetUnitsInRectMatching takesrect r, boolexpr filter returnsgroup
    local group g = CreateGroup()
    call GroupEnumUnitsInRect(g, r, filter)
    call DestroyBoolExpr(filter)
    returng
endfunction

//===========================================================================
function GetUnitsInRectAll takesrect r returnsgroup
    returnGetUnitsInRectMatching(r, null)
endfunction

//===========================================================================
function GetUnitsInRectOfPlayerFilter takesnothing returnsboolean
    returnGetOwningPlayer(GetFilterUnit()) == bj_groupEnumOwningPlayer
endfunction

//===========================================================================
function GetUnitsInRectOfPlayer takesrect r, player whichPlayer returnsgroup
    local group g = CreateGroup()
    set bj_groupEnumOwningPlayer = whichPlayer
    call GroupEnumUnitsInRect(g, r, filterGetUnitsInRectOfPlayer)
    returng
endfunction

//===========================================================================
function GetUnitsInRangeOfLocMatching takesreal radius, location whichLocation, boolexpr filter returnsgroup
    local group g = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(g, whichLocation, radius, filter)
    call DestroyBoolExpr(filter)
    returng
endfunction

//===========================================================================
function GetUnitsInRangeOfLocAll takesreal radius, location whichLocation returnsgroup
    returnGetUnitsInRangeOfLocMatching(radius, whichLocation, null)
endfunction

//===========================================================================
function GetUnitsOfTypeIdAllFilter takesnothing returnsboolean
    returnGetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction

//===========================================================================
function GetUnitsOfTypeIdAll takesinteger unitid returnsgroup
    local group   result = CreateGroup()
    local group   g = CreateGroup()
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

    returnresult
endfunction

//===========================================================================
function GetUnitsOfPlayerMatching takesplayer whichPlayer, boolexpr filter returnsgroup
    local group g = CreateGroup()
    call GroupEnumUnitsOfPlayer(g, whichPlayer, filter)
    call DestroyBoolExpr(filter)
    returng
endfunction

//===========================================================================
function GetUnitsOfPlayerAll takesplayer whichPlayer returnsgroup
    returnGetUnitsOfPlayerMatching(whichPlayer, null)
endfunction

//===========================================================================
function GetUnitsOfPlayerAndTypeIdFilter takesnothing returnsboolean
    returnGetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction

//===========================================================================
function GetUnitsOfPlayerAndTypeId takesplayer whichPlayer, integer unitid returnsgroup
    local group g = CreateGroup()
    set bj_groupEnumTypeId = unitid
    call GroupEnumUnitsOfPlayer(g, whichPlayer, filterGetUnitsOfPlayerAndTypeId)
    returng
endfunction

//===========================================================================
function GetUnitsSelectedAll takesplayer whichPlayer returnsgroup
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, whichPlayer, null)
    returng
endfunction

//===========================================================================
function GetForceOfPlayer takesplayer whichPlayer returnsforce
    local force f = CreateForce()
    call ForceAddPlayer(f, whichPlayer)
    returnf
endfunction

//===========================================================================
function GetPlayersAll takesnothing returnsforce
    returnbj_FORCE_ALL_PLAYERS
endfunction

//===========================================================================
function GetPlayersByMapControl takesmapcontrol whichControl returnsforce
    local force f = CreateForce()
    local integer playerIndex
    local player  indexPlayer

    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if GetPlayerController(indexPlayer) == whichControl then
            call ForceAddPlayer(f, indexPlayer)
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYER_SLOTS
    endloop

    returnf
endfunction

//===========================================================================
function GetPlayersAllies takesplayer whichPlayer returnsforce
    local force f = CreateForce()
    call ForceEnumAllies(f, whichPlayer, null)
    returnf
endfunction

//===========================================================================
function GetPlayersEnemies takesplayer whichPlayer returnsforce
    local force f = CreateForce()
    call ForceEnumEnemies(f, whichPlayer, null)
    returnf
endfunction

//===========================================================================
function GetPlayersMatching takesboolexpr filter returnsforce
    local force f = CreateForce()
    call ForceEnumPlayers(f, filter)
    call DestroyBoolExpr(filter)
    returnf
endfunction

//===========================================================================
function CountUnitsInGroupEnum takesnothing returnsnothing
    set bj_groupCountUnits = bj_groupCountUnits + 1
endfunction

//===========================================================================
function CountUnitsInGroup takesgroup g returnsinteger
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupCountUnits = 0
    call ForGroup(g, function CountUnitsInGroupEnum)

    // If the user wants the group destroyed, do so now.
    if (wantDestroy) then
        call DestroyGroup(g)
    endif
    returnbj_groupCountUnits
endfunction

//===========================================================================
function CountPlayersInForceEnum takesnothing returnsnothing
    set bj_forceCountPlayers = bj_forceCountPlayers + 1
endfunction

//===========================================================================
function CountPlayersInForceBJ takesforce f returnsinteger
    set bj_forceCountPlayers = 0
    call ForForce(f, function CountPlayersInForceEnum)
    returnbj_forceCountPlayers
endfunction

//===========================================================================
function GetRandomSubGroupEnum takesnothing returnsnothing
    if (bj_randomSubGroupWant > 0) then
        if (bj_randomSubGroupWant >= bj_randomSubGroupTotal) or (GetRandomReal(0, 1) < bj_randomSubGroupChance) then
            // We either need every remaining unit, or the unit passed its chance check.
            call GroupAddUnit(bj_randomSubGroupGroup, GetEnumUnit())
            set bj_randomSubGroupWant = bj_randomSubGroupWant - 1
        endif
    endif
    set bj_randomSubGroupTotal = bj_randomSubGroupTotal - 1
endfunction

//===========================================================================
function GetRandomSubGroup takesinteger count, group sourceGroup returnsgroup
    local group g = CreateGroup()

    set bj_randomSubGroupGroup = g
    set bj_randomSubGroupWant = count
    set bj_randomSubGroupTotal = CountUnitsInGroup(sourceGroup)

    if (bj_randomSubGroupWant <= 0 or bj_randomSubGroupTotal <= 0) then
        returng
    endif

    set bj_randomSubGroupChance = I2R(bj_randomSubGroupWant) / I2R(bj_randomSubGroupTotal)
    call ForGroup(sourceGroup, function GetRandomSubGroupEnum)
    returng
endfunction

//===========================================================================
function LivingPlayerUnitsOfTypeIdFilter takesnothing returnsboolean
    local unit filterUnit = GetFilterUnit()
    returnIsUnitAliveBJ(filterUnit) and GetUnitTypeId(filterUnit) == bj_livingPlayerUnitsTypeId
endfunction

//===========================================================================
function CountLivingPlayerUnitsOfTypeId takesinteger unitId, player whichPlayer returnsinteger
    local group g
    local integer matchedCount

    set g = CreateGroup()
    set bj_livingPlayerUnitsTypeId = unitId
    call GroupEnumUnitsOfPlayer(g, whichPlayer, filterLivingPlayerUnitsOfTypeId)
    set matchedCount = CountUnitsInGroup(g)
    call DestroyGroup(g)

    returnmatchedCount
endfunction



//***************************************************************************
//*
//*  Animation Utility Functions
//*
//***************************************************************************

//===========================================================================
function ResetUnitAnimation takesunit whichUnit returnsnothing
    call SetUnitAnimation(whichUnit, "stand")
endfunction

//===========================================================================
function SetUnitTimeScalePercent takesunit whichUnit, real percentScale returnsnothing
    call SetUnitTimeScale(whichUnit, percentScale * 0.01)
endfunction

//===========================================================================
function SetUnitScalePercent takesunit whichUnit, real percentScaleX, real percentScaleY, real percentScaleZ returnsnothing
    call SetUnitScale(whichUnit, percentScaleX * 0.01, percentScaleY * 0.01, percentScaleZ * 0.01)
endfunction

//===========================================================================
// This version differs from the common.j interface in that the alpha value
// is reversed so as to be displayed as transparency, and all four parameters
// are treated as percentages rather than bytes.
//
function SetUnitVertexColorBJ takesunit whichUnit, real red, real green, real blue, real transparency returnsnothing
    call SetUnitVertexColor(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function UnitAddIndicatorBJ takesunit whichUnit, real red, real green, real blue, real transparency returnsnothing
    call AddIndicator(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function DestructableAddIndicatorBJ takesdestructable whichDestructable, real red, real green, real blue, real transparency returnsnothing
    call AddIndicator(whichDestructable, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function ItemAddIndicatorBJ takesitem whichItem, real red, real green, real blue, real transparency returnsnothing
    call AddIndicator(whichItem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
// Sets a unit's facing to point directly at a location.
//
function SetUnitFacingToFaceLocTimed takesunit whichUnit, location target, real duration returnsnothing
    local location unitLoc = GetUnitLoc(whichUnit)

    call SetUnitFacingTimed(whichUnit, AngleBetweenPoints(unitLoc, target), duration)
    call RemoveLocation(unitLoc)
endfunction

//===========================================================================
// Sets a unit's facing to point directly at another unit.
//
function SetUnitFacingToFaceUnitTimed takesunit whichUnit, unit target, real duration returnsnothing
    local location unitLoc = GetUnitLoc(target)

    call SetUnitFacingToFaceLocTimed(whichUnit, unitLoc, duration)
    call RemoveLocation(unitLoc)
endfunction

//===========================================================================
function QueueUnitAnimationBJ takesunit whichUnit, string whichAnimation returnsnothing
    call QueueUnitAnimation(whichUnit, whichAnimation)
endfunction

//===========================================================================
function SetDestructableAnimationBJ takesdestructable d, string whichAnimation returnsnothing
    call SetDestructableAnimation(d, whichAnimation)
endfunction

//===========================================================================
function QueueDestructableAnimationBJ takesdestructable d, string whichAnimation returnsnothing
    call QueueDestructableAnimation(d, whichAnimation)
endfunction

//===========================================================================
function SetDestAnimationSpeedPercent takesdestructable d, real percentScale returnsnothing
    call SetDestructableAnimationSpeed(d, percentScale * 0.01)
endfunction



//***************************************************************************
//*
//*  Dialog Utility Functions
//*
//***************************************************************************

//===========================================================================
function DialogDisplayBJ takesboolean flag, dialog whichDialog, player whichPlayer returnsnothing
    call DialogDisplay(whichPlayer, whichDialog, flag)
endfunction

//===========================================================================
function DialogSetMessageBJ takesdialog whichDialog, string message returnsnothing
    call DialogSetMessage(whichDialog, message)
endfunction

//===========================================================================
function DialogAddButtonBJ takesdialog whichDialog, string buttonText returnsbutton
    set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText, 0)
    returnbj_lastCreatedButton
endfunction

//===========================================================================
function DialogAddButtonWithHotkeyBJ takesdialog whichDialog, string buttonText, integer hotkey returnsbutton
    set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText, hotkey)
    returnbj_lastCreatedButton
endfunction

//===========================================================================
function DialogClearBJ takesdialog whichDialog returnsnothing
    call DialogClear(whichDialog)
endfunction

//===========================================================================
function GetLastCreatedButtonBJ takesnothing returnsbutton
    returnbj_lastCreatedButton
endfunction

//===========================================================================
function GetClickedButtonBJ takesnothing returnsbutton
    returnGetClickedButton()
endfunction

//===========================================================================
function GetClickedDialogBJ takesnothing returnsdialog
    returnGetClickedDialog()
endfunction



//***************************************************************************
//*
//*  Alliance Utility Functions
//*
//***************************************************************************

//===========================================================================
function SetPlayerAllianceBJ takesplayer sourcePlayer, alliancetype whichAllianceSetting, boolean value, player otherPlayer returnsnothing
    // Prevent players from attempting to ally with themselves.
    if (sourcePlayer == otherPlayer) then
        return
    endif

    call SetPlayerAlliance(sourcePlayer, otherPlayer, whichAllianceSetting, value)
endfunction

//===========================================================================
// Set all flags used by the in-game "Ally" checkbox.
//
function SetPlayerAllianceStateAllyBJ takesplayer sourcePlayer, player otherPlayer, boolean flag returnsnothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_REQUEST, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_RESPONSE, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_XP, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_SPELLS, flag)
endfunction

//===========================================================================
// Set all flags used by the in-game "Shared Vision" checkbox.
//
function SetPlayerAllianceStateVisionBJ takesplayer sourcePlayer, player otherPlayer, boolean flag returnsnothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_VISION, flag)
endfunction

//===========================================================================
// Set all flags used by the in-game "Shared Units" checkbox.
//
function SetPlayerAllianceStateControlBJ takesplayer sourcePlayer, player otherPlayer, boolean flag returnsnothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_CONTROL, flag)
endfunction

//===========================================================================
// Set all flags used by the in-game "Shared Units" checkbox with the Full
// Shared Unit Control feature enabled.
//
function SetPlayerAllianceStateFullControlBJ takesplayer sourcePlayer, player otherPlayer, boolean flag returnsnothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, flag)
endfunction

//===========================================================================
function SetPlayerAllianceStateBJ takesplayer sourcePlayer, player otherPlayer, integer allianceState returnsnothing
    // Prevent players from attempting to ally with themselves.
    if (sourcePlayer == otherPlayer) then
        return
    endif

    if allianceState == bj_ALLIANCE_UNALLIED then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
    elseif allianceState == bj_ALLIANCE_UNALLIED_VISION then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
    elseif allianceState == bj_ALLIANCE_ALLIED then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
    elseif allianceState == bj_ALLIANCE_ALLIED_VISION then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
    elseif allianceState == bj_ALLIANCE_ALLIED_UNITS then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
    elseif allianceState == bj_ALLIANCE_ALLIED_ADVUNITS then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, true)
    elseif allianceState == bj_ALLIANCE_NEUTRAL then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, true)
    elseif allianceState == bj_ALLIANCE_NEUTRAL_VISION then
        call SetPlayerAllianceStateAllyBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateVisionBJ(sourcePlayer, otherPlayer, true)
        call SetPlayerAllianceStateControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAllianceStateFullControlBJ(sourcePlayer, otherPlayer, false)
        call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, true)
    else
        // Unrecognized alliance state - ignore the request.
    endif
endfunction

//===========================================================================
// Set the alliance states for an entire force towards another force.
//
function SetForceAllianceStateBJ takesforce sourceForce, force targetForce, integer allianceState returnsnothing
    local integer sourceIndex
    local integer targetIndex

    set sourceIndex = 0
    loop

        if (sourceForce == bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(sourceIndex), sourceForce)) then
            set targetIndex = 0
            loop
                if (targetForce == bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(targetIndex), targetForce)) then
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

//===========================================================================
// Test to see if two players are co-allied (allied with each other).
//
function PlayersAreCoAllied takesplayer playerA, player playerB returnsboolean
    // Players are considered to be allied with themselves.
    if (playerA == playerB) then
        returntrue
    endif

    // Co-allies are both allied with each other.
    if GetPlayerAlliance(playerA, playerB, ALLIANCE_PASSIVE) then
        if GetPlayerAlliance(playerB, playerA, ALLIANCE_PASSIVE) then
            returntrue
        endif
    endif
    returnfalse
endfunction

//===========================================================================
// Force (whichPlayer) AI player to share vision and advanced unit control 
// with all AI players of its allies.
//
function ShareEverythingWithTeamAI takesplayer whichPlayer returnsnothing
    local integer playerIndex
    local player  indexPlayer

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

//===========================================================================
// Force (whichPlayer) to share vision and advanced unit control with all of his/her allies.
//
function ShareEverythingWithTeam takesplayer whichPlayer returnsnothing
    local integer playerIndex
    local player  indexPlayer

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

//===========================================================================
// Creates a 'Neutral Victim' player slot.  This slot is passive towards all
// other players, but all other players are aggressive towards him/her.
// 
function ConfigureNeutralVictim takesnothing returnsnothing
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

    // Neutral Victim and Neutral Aggressive should not fight each other.
    set indexPlayer = Player(PLAYER_NEUTRAL_AGGRESSIVE)
    call SetPlayerAlliance(neutralVictim, indexPlayer, ALLIANCE_PASSIVE, true)
    call SetPlayerAlliance(indexPlayer, neutralVictim, ALLIANCE_PASSIVE, true)

    // Neutral Victim does not give bounties.
    call SetPlayerState(neutralVictim, PLAYER_STATE_GIVES_BOUNTY, 0)
endfunction

//===========================================================================
function MakeUnitsPassiveForPlayerEnum takesnothing returnsnothing
    call SetUnitOwner(GetEnumUnit(), Player(bj_PLAYER_NEUTRAL_VICTIM), false)
endfunction

//===========================================================================
// Change ownership for every unit of (whichPlayer)'s team to neutral passive.
//
function MakeUnitsPassiveForPlayer takesplayer whichPlayer returnsnothing
    local group   playerUnits = CreateGroup()
    call CachePlayerHeroData(whichPlayer)
    call GroupEnumUnitsOfPlayer(playerUnits, whichPlayer, null)
    call ForGroup(playerUnits, function MakeUnitsPassiveForPlayerEnum)
    call DestroyGroup(playerUnits)
endfunction

//===========================================================================
// Change ownership for every unit of (whichPlayer)'s team to neutral passive.
//
function MakeUnitsPassiveForTeam takesplayer whichPlayer returnsnothing
    local integer playerIndex
    local player  indexPlayer

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

//===========================================================================
// Determine whether or not victory/defeat is disabled via cheat codes.
//
function AllowVictoryDefeat takesplayergameresult gameResult returnsboolean
    if (gameResult == PLAYER_GAME_RESULT_VICTORY) then
        returnnot IsNoVictoryCheat()
    endif
    if (gameResult == PLAYER_GAME_RESULT_DEFEAT) then
        returnnot IsNoDefeatCheat()
    endif
    if (gameResult == PLAYER_GAME_RESULT_NEUTRAL) then
        return (not IsNoVictoryCheat()) and (not IsNoDefeatCheat())
    endif
    returntrue
endfunction

//===========================================================================
function EndGameBJ takesnothing returnsnothing
    call EndGame(true)
endfunction

//===========================================================================
function MeleeVictoryDialogBJ takesplayer whichPlayer, boolean leftGame returnsnothing
    local trigger t = CreateTrigger()
    local dialog  d = DialogCreate()
    local string formatString

    // Display "player was victorious" or "player has left the game" message
    if (leftGame) then
        set formatString = GetLocalizedString("PLAYER_LEFT_GAME")
    else
        set formatString = GetLocalizedString("PLAYER_VICTORIOUS")
    endif

    call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, formatString)

    call DialogSetMessage(d, GetLocalizedString("GAMEOVER_VICTORY_MSG"))
    call DialogAddButton(d, GetLocalizedString("GAMEOVER_CONTINUE_GAME"), GetLocalizedHotkey("GAMEOVER_CONTINUE_GAME"))

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddQuitButton(d, true, GetLocalizedString("GAMEOVER_QUIT_GAME"), GetLocalizedHotkey("GAMEOVER_QUIT_GAME")))

    call DialogDisplay(whichPlayer, d, true)
    call StartSoundForPlayerBJ(whichPlayer, bj_victoryDialogSound)
endfunction

//===========================================================================
function MeleeDefeatDialogBJ takesplayer whichPlayer, boolean leftGame returnsnothing
    local trigger t = CreateTrigger()
    local dialog  d = DialogCreate()
    local string formatString

    // Display "player was defeated" or "player has left the game" message
    if (leftGame) then
        set formatString = GetLocalizedString("PLAYER_LEFT_GAME")
    else
        set formatString = GetLocalizedString("PLAYER_DEFEATED")
    endif

    call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, formatString)

    call DialogSetMessage(d, GetLocalizedString("GAMEOVER_DEFEAT_MSG"))

    // Only show the continue button if the game is not over and observers on death are allowed
    if (not bj_meleeGameOver and IsMapFlagSet(MAP_OBSERVERS_ON_DEATH)) then
        call DialogAddButton(d, GetLocalizedString("GAMEOVER_CONTINUE_OBSERVING"), GetLocalizedHotkey("GAMEOVER_CONTINUE_OBSERVING"))
    endif

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddQuitButton(d, true, GetLocalizedString("GAMEOVER_QUIT_GAME"), GetLocalizedHotkey("GAMEOVER_QUIT_GAME")))

    call DialogDisplay(whichPlayer, d, true)
    call StartSoundForPlayerBJ(whichPlayer, bj_defeatDialogSound)
endfunction

//===========================================================================
function GameOverDialogBJ takesplayer whichPlayer, boolean leftGame returnsnothing
    local trigger t = CreateTrigger()
    local dialog  d = DialogCreate()
    local string  s

    // Display "player left the game" message
    call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_LEFT_GAME"))

    if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
        set s = GetLocalizedString("GAMEOVER_DISCONNECTED")
    else
        set s = GetLocalizedString("GAMEOVER_GAME_OVER")
    endif

    call DialogSetMessage(d, s)

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddQuitButton(d, true, GetLocalizedString("GAMEOVER_OK"), GetLocalizedHotkey("GAMEOVER_OK")))

    call DialogDisplay(whichPlayer, d, true)
    call StartSoundForPlayerBJ(whichPlayer, bj_defeatDialogSound)
endfunction

//===========================================================================
function RemovePlayerPreserveUnitsBJ takesplayer whichPlayer, playergameresult gameResult, boolean leftGame returnsnothing
    if AllowVictoryDefeat(gameResult) then

        call RemovePlayer(whichPlayer, gameResult)

        if (gameResult == PLAYER_GAME_RESULT_VICTORY) then
            call MeleeVictoryDialogBJ(whichPlayer, leftGame)
            return
        elseif (gameResult == PLAYER_GAME_RESULT_DEFEAT) then
            call MeleeDefeatDialogBJ(whichPlayer, leftGame)
        else
            call GameOverDialogBJ(whichPlayer, leftGame)
        endif

    endif
endfunction

//===========================================================================
function CustomVictoryOkBJ takesnothing returnsnothing
    if bj_isSinglePlayer then
        call PauseGame(false)
        // Bump the difficulty back up to the default.
        call SetGameDifficulty(GetDefaultDifficulty())
    endif

    if (bj_changeLevelMapName == null) then
        call EndGame(bj_changeLevelShowScores)
    else
        call ChangeLevel(bj_changeLevelMapName, bj_changeLevelShowScores)
    endif
endfunction

//===========================================================================
function CustomVictoryQuitBJ takesnothing returnsnothing
    if bj_isSinglePlayer then
        call PauseGame(false)
        // Bump the difficulty back up to the default.
        call SetGameDifficulty(GetDefaultDifficulty())
    endif

    call EndGame(bj_changeLevelShowScores)
endfunction

//===========================================================================
function CustomVictoryDialogBJ takesplayer whichPlayer returnsnothing
    local trigger t = CreateTrigger()
    local dialog  d = DialogCreate()

    call DialogSetMessage(d, GetLocalizedString("GAMEOVER_VICTORY_MSG"))

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_CONTINUE"), GetLocalizedHotkey("GAMEOVER_CONTINUE")))
    call TriggerAddAction(t, function CustomVictoryOkBJ)

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_QUIT_MISSION"), GetLocalizedHotkey("GAMEOVER_QUIT_MISSION")))
    call TriggerAddAction(t, function CustomVictoryQuitBJ)

    if (GetLocalPlayer() == whichPlayer) then
        call EnableUserControl(true)
        if bj_isSinglePlayer then
            call PauseGame(true)
        endif
        call EnableUserUI(false)
    endif

    call DialogDisplay(whichPlayer, d, true)
    call VolumeGroupSetVolumeForPlayerBJ(whichPlayer, SOUND_VOLUMEGROUP_UI, 1.0)
    call StartSoundForPlayerBJ(whichPlayer, bj_victoryDialogSound)
endfunction

//===========================================================================
function CustomVictorySkipBJ takesplayer whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        if bj_isSinglePlayer then
            // Bump the difficulty back up to the default.
            call SetGameDifficulty(GetDefaultDifficulty())
        endif

        if (bj_changeLevelMapName == null) then
            call EndGame(bj_changeLevelShowScores)
        else
            call ChangeLevel(bj_changeLevelMapName, bj_changeLevelShowScores)
        endif
    endif
endfunction

//===========================================================================
function CustomVictoryBJ takesplayer whichPlayer, boolean showDialog, boolean showScores returnsnothing
    if AllowVictoryDefeat(PLAYER_GAME_RESULT_VICTORY) then
        call RemovePlayer(whichPlayer, PLAYER_GAME_RESULT_VICTORY)

        if not bj_isSinglePlayer then
            call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_VICTORIOUS"))
        endif

        // UI only needs to be displayed to users.
        if (GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
            set bj_changeLevelShowScores = showScores
            if showDialog then
                call CustomVictoryDialogBJ(whichPlayer)
            else
                call CustomVictorySkipBJ(whichPlayer)
            endif
        endif
    endif
endfunction

//===========================================================================
function CustomDefeatRestartBJ takesnothing returnsnothing
    call PauseGame(false)
    call RestartGame(true)
endfunction

//===========================================================================
function CustomDefeatReduceDifficultyBJ takesnothing returnsnothing
    local gamedifficulty diff = GetGameDifficulty()

    call PauseGame(false)

    // Knock the difficulty down, if possible.
    if (diff == MAP_DIFFICULTY_EASY) then
        // Sorry, but it doesn't get any easier than this.
    elseif (diff == MAP_DIFFICULTY_NORMAL) then
        call SetGameDifficulty(MAP_DIFFICULTY_EASY)
    elseif (diff == MAP_DIFFICULTY_HARD) then
        call SetGameDifficulty(MAP_DIFFICULTY_NORMAL)
    else
        // Unrecognized difficulty
    endif

    call RestartGame(true)
endfunction

//===========================================================================
function CustomDefeatLoadBJ takesnothing returnsnothing
    call PauseGame(false)
    call DisplayLoadDialog()
endfunction

//===========================================================================
function CustomDefeatQuitBJ takesnothing returnsnothing
    if bj_isSinglePlayer then
        call PauseGame(false)
    endif

    // Bump the difficulty back up to the default.
    call SetGameDifficulty(GetDefaultDifficulty())
    call EndGame(true)
endfunction

//===========================================================================
function CustomDefeatDialogBJ takesplayer whichPlayer, string message returnsnothing
    local trigger t = CreateTrigger()
    local dialog  d = DialogCreate()

    call DialogSetMessage(d, message)

    if bj_isSinglePlayer then
        set t = CreateTrigger()
        call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_RESTART"), GetLocalizedHotkey("GAMEOVER_RESTART")))
        call TriggerAddAction(t, function CustomDefeatRestartBJ)

        if (GetGameDifficulty() != MAP_DIFFICULTY_EASY) then
            set t = CreateTrigger()
            call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_REDUCE_DIFFICULTY"), GetLocalizedHotkey("GAMEOVER_REDUCE_DIFFICULTY")))
            call TriggerAddAction(t, function CustomDefeatReduceDifficultyBJ)
        endif

        set t = CreateTrigger()
        call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_LOAD"), GetLocalizedHotkey("GAMEOVER_LOAD")))
        call TriggerAddAction(t, function CustomDefeatLoadBJ)
    endif

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_QUIT_MISSION"), GetLocalizedHotkey("GAMEOVER_QUIT_MISSION")))
    call TriggerAddAction(t, function CustomDefeatQuitBJ)

    if (GetLocalPlayer() == whichPlayer) then
        call EnableUserControl(true)
        if bj_isSinglePlayer then
            call PauseGame(true)
        endif
        call EnableUserUI(false)
    endif

    call DialogDisplay(whichPlayer, d, true)
    call VolumeGroupSetVolumeForPlayerBJ(whichPlayer, SOUND_VOLUMEGROUP_UI, 1.0)
    call StartSoundForPlayerBJ(whichPlayer, bj_defeatDialogSound)
endfunction

//===========================================================================
function CustomDefeatBJ takesplayer whichPlayer, string message returnsnothing
    if AllowVictoryDefeat(PLAYER_GAME_RESULT_DEFEAT) then
        call RemovePlayer(whichPlayer, PLAYER_GAME_RESULT_DEFEAT)

        if not bj_isSinglePlayer then
            call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_DEFEATED"))
        endif

        // UI only needs to be displayed to users.
        if (GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
            call CustomDefeatDialogBJ(whichPlayer, message)
        endif
    endif
endfunction

//===========================================================================
function SetNextLevelBJ takesstring nextLevel returnsnothing
    if (nextLevel == "") then
        set bj_changeLevelMapName = null
    else
        set bj_changeLevelMapName = nextLevel
    endif
endfunction

//===========================================================================
function SetPlayerOnScoreScreenBJ takesboolean flag, player whichPlayer returnsnothing
    call SetPlayerOnScoreScreen(whichPlayer, flag)
endfunction



//***************************************************************************
//*
//*  Quest Utility Functions
//*
//***************************************************************************

//===========================================================================
function CreateQuestBJ takesinteger questType, string title, string description, string iconPath returnsquest
    local boolean required = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or (questType == bj_QUESTTYPE_REQ_UNDISCOVERED)
    local boolean discovered = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or (questType == bj_QUESTTYPE_OPT_DISCOVERED)

    set bj_lastCreatedQuest = CreateQuest()
    call QuestSetTitle(bj_lastCreatedQuest, title)
    call QuestSetDescription(bj_lastCreatedQuest, description)
    call QuestSetIconPath(bj_lastCreatedQuest, iconPath)
    call QuestSetRequired(bj_lastCreatedQuest, required)
    call QuestSetDiscovered(bj_lastCreatedQuest, discovered)
    call QuestSetCompleted(bj_lastCreatedQuest, false)
    returnbj_lastCreatedQuest
endfunction

//===========================================================================
function DestroyQuestBJ takesquest whichQuest returnsnothing
    call DestroyQuest(whichQuest)
endfunction

//===========================================================================
function QuestSetEnabledBJ takesboolean enabled, quest whichQuest returnsnothing
    call QuestSetEnabled(whichQuest, enabled)
endfunction

//===========================================================================
function QuestSetTitleBJ takesquest whichQuest, string title returnsnothing
    call QuestSetTitle(whichQuest, title)
endfunction

//===========================================================================
function QuestSetDescriptionBJ takesquest whichQuest, string description returnsnothing
    call QuestSetDescription(whichQuest, description)
endfunction

//===========================================================================
function QuestSetCompletedBJ takesquest whichQuest, boolean completed returnsnothing
    call QuestSetCompleted(whichQuest, completed)
endfunction

//===========================================================================
function QuestSetFailedBJ takesquest whichQuest, boolean failed returnsnothing
    call QuestSetFailed(whichQuest, failed)
endfunction

//===========================================================================
function QuestSetDiscoveredBJ takesquest whichQuest, boolean discovered returnsnothing
    call QuestSetDiscovered(whichQuest, discovered)
endfunction

//===========================================================================
function GetLastCreatedQuestBJ takesnothing returnsquest
    returnbj_lastCreatedQuest
endfunction

//===========================================================================
function CreateQuestItemBJ takesquest whichQuest, string description returnsquestitem
    set bj_lastCreatedQuestItem = QuestCreateItem(whichQuest)
    call QuestItemSetDescription(bj_lastCreatedQuestItem, description)
    call QuestItemSetCompleted(bj_lastCreatedQuestItem, false)
    returnbj_lastCreatedQuestItem
endfunction

//===========================================================================
function QuestItemSetDescriptionBJ takesquestitem whichQuestItem, string description returnsnothing
    call QuestItemSetDescription(whichQuestItem, description)
endfunction

//===========================================================================
function QuestItemSetCompletedBJ takesquestitem whichQuestItem, boolean completed returnsnothing
    call QuestItemSetCompleted(whichQuestItem, completed)
endfunction

//===========================================================================
function GetLastCreatedQuestItemBJ takesnothing returnsquestitem
    returnbj_lastCreatedQuestItem
endfunction

//===========================================================================
function CreateDefeatConditionBJ takesstring description returnsdefeatcondition
    set bj_lastCreatedDefeatCondition = CreateDefeatCondition()
    call DefeatConditionSetDescription(bj_lastCreatedDefeatCondition, description)
    returnbj_lastCreatedDefeatCondition
endfunction

//===========================================================================
function DestroyDefeatConditionBJ takesdefeatcondition whichCondition returnsnothing
    call DestroyDefeatCondition(whichCondition)
endfunction

//===========================================================================
function DefeatConditionSetDescriptionBJ takesdefeatcondition whichCondition, string description returnsnothing
    call DefeatConditionSetDescription(whichCondition, description)
endfunction

//===========================================================================
function GetLastCreatedDefeatConditionBJ takesnothing returnsdefeatcondition
    returnbj_lastCreatedDefeatCondition
endfunction

//===========================================================================
function FlashQuestDialogButtonBJ takesnothing returnsnothing
    call FlashQuestDialogButton()
endfunction

//===========================================================================
function QuestMessageBJ takesforce f, integer messageType, string message returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

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
            // Unrecognized message type - ignore the request.
        endif
    endif
endfunction



//***************************************************************************
//*
//*  Timer Utility Functions
//*
//***************************************************************************

//===========================================================================
function StartTimerBJ takestimer t, boolean periodic, real timeout returnstimer
    set bj_lastStartedTimer = t
    call TimerStart(t, timeout, periodic, null)
    returnbj_lastStartedTimer
endfunction

//===========================================================================
function CreateTimerBJ takesboolean periodic, real timeout returnstimer
    set bj_lastStartedTimer = CreateTimer()
    call TimerStart(bj_lastStartedTimer, timeout, periodic, null)
    returnbj_lastStartedTimer
endfunction

//===========================================================================
function DestroyTimerBJ takestimer whichTimer returnsnothing
    call DestroyTimer(whichTimer)
endfunction

//===========================================================================
function PauseTimerBJ takesboolean pause, timer whichTimer returnsnothing
    if pause then
        call PauseTimer(whichTimer)
    else
        call ResumeTimer(whichTimer)
    endif
endfunction

//===========================================================================
function GetLastCreatedTimerBJ takesnothing returnstimer
    returnbj_lastStartedTimer
endfunction

//===========================================================================
function CreateTimerDialogBJ takestimer t, string title returnstimerdialog
    set bj_lastCreatedTimerDialog = CreateTimerDialog(t)
    call TimerDialogSetTitle(bj_lastCreatedTimerDialog, title)
    call TimerDialogDisplay(bj_lastCreatedTimerDialog, true)
    returnbj_lastCreatedTimerDialog
endfunction

//===========================================================================
function DestroyTimerDialogBJ takestimerdialog td returnsnothing
    call DestroyTimerDialog(td)
endfunction

//===========================================================================
function TimerDialogSetTitleBJ takestimerdialog td, string title returnsnothing
    call TimerDialogSetTitle(td, title)
endfunction

//===========================================================================
function TimerDialogSetTitleColorBJ takestimerdialog td, real red, real green, real blue, real transparency returnsnothing
    call TimerDialogSetTitleColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function TimerDialogSetTimeColorBJ takestimerdialog td, real red, real green, real blue, real transparency returnsnothing
    call TimerDialogSetTimeColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function TimerDialogSetSpeedBJ takestimerdialog td, real speedMultFactor returnsnothing
    call TimerDialogSetSpeed(td, speedMultFactor)
endfunction

//===========================================================================
function TimerDialogDisplayForPlayerBJ takesboolean show, timerdialog td, player whichPlayer returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call TimerDialogDisplay(td, show)
    endif
endfunction

//===========================================================================
function TimerDialogDisplayBJ takesboolean show, timerdialog td returnsnothing
    call TimerDialogDisplay(td, show)
endfunction

//===========================================================================
function GetLastCreatedTimerDialogBJ takesnothing returnstimerdialog
    returnbj_lastCreatedTimerDialog
endfunction



//***************************************************************************
//*
//*  Leaderboard Utility Functions
//*
//***************************************************************************

//===========================================================================
function LeaderboardResizeBJ takesleaderboard lb returnsnothing
    local integer size = LeaderboardGetItemCount(lb)

    if (LeaderboardGetLabelText(lb) == "") then
        set size = size - 1
    endif
    call LeaderboardSetSizeByItemCount(lb, size)
endfunction

//===========================================================================
function LeaderboardSetPlayerItemValueBJ takesplayer whichPlayer, leaderboard lb, integer val returnsnothing
    call LeaderboardSetItemValue(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction

//===========================================================================
function LeaderboardSetPlayerItemLabelBJ takesplayer whichPlayer, leaderboard lb, string val returnsnothing
    call LeaderboardSetItemLabel(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction

//===========================================================================
function LeaderboardSetPlayerItemStyleBJ takesplayer whichPlayer, leaderboard lb, boolean showLabel, boolean showValue, boolean showIcon returnsnothing
    call LeaderboardSetItemStyle(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), showLabel, showValue, showIcon)
endfunction

//===========================================================================
function LeaderboardSetPlayerItemLabelColorBJ takesplayer whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returnsnothing
    call LeaderboardSetItemLabelColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function LeaderboardSetPlayerItemValueColorBJ takesplayer whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returnsnothing
    call LeaderboardSetItemValueColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function LeaderboardSetLabelColorBJ takesleaderboard lb, real red, real green, real blue, real transparency returnsnothing
    call LeaderboardSetLabelColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function LeaderboardSetValueColorBJ takesleaderboard lb, real red, real green, real blue, real transparency returnsnothing
    call LeaderboardSetValueColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function LeaderboardSetLabelBJ takesleaderboard lb, string label returnsnothing
    call LeaderboardSetLabel(lb, label)
    call LeaderboardResizeBJ(lb)
endfunction

//===========================================================================
function LeaderboardSetStyleBJ takesleaderboard lb, boolean showLabel, boolean showNames, boolean showValues, boolean showIcons returnsnothing
    call LeaderboardSetStyle(lb, showLabel, showNames, showValues, showIcons)
endfunction

//===========================================================================
function LeaderboardGetItemCountBJ takesleaderboard lb returnsinteger
    returnLeaderboardGetItemCount(lb)
endfunction

//===========================================================================
function LeaderboardHasPlayerItemBJ takesleaderboard lb, player whichPlayer returnsboolean
    returnLeaderboardHasPlayerItem(lb, whichPlayer)
endfunction

//===========================================================================
function ForceSetLeaderboardBJ takesleaderboard lb, force toForce returnsnothing
    local integer index
    local player  indexPlayer

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

//===========================================================================
function CreateLeaderboardBJ takesforce toForce, string label returnsleaderboard
    set bj_lastCreatedLeaderboard = CreateLeaderboard()
    call LeaderboardSetLabel(bj_lastCreatedLeaderboard, label)
    call ForceSetLeaderboardBJ(bj_lastCreatedLeaderboard, toForce)
    call LeaderboardDisplay(bj_lastCreatedLeaderboard, true)
    returnbj_lastCreatedLeaderboard
endfunction

//===========================================================================
function DestroyLeaderboardBJ takesleaderboard lb returnsnothing
    call DestroyLeaderboard(lb)
endfunction

//===========================================================================
function LeaderboardDisplayBJ takesboolean show, leaderboard lb returnsnothing
    call LeaderboardDisplay(lb, show)
endfunction

//===========================================================================
function LeaderboardAddItemBJ takesplayer whichPlayer, leaderboard lb, string label, integer value returnsnothing
    if (LeaderboardHasPlayerItem(lb, whichPlayer)) then
        call LeaderboardRemovePlayerItem(lb, whichPlayer)
    endif
    call LeaderboardAddItem(lb, label, value, whichPlayer)
    call LeaderboardResizeBJ(lb)
    //call LeaderboardSetSizeByItemCount(lb, LeaderboardGetItemCount(lb))
endfunction

//===========================================================================
function LeaderboardRemovePlayerItemBJ takesplayer whichPlayer, leaderboard lb returnsnothing
    call LeaderboardRemovePlayerItem(lb, whichPlayer)
    call LeaderboardResizeBJ(lb)
endfunction

//===========================================================================
function LeaderboardSortItemsBJ takesleaderboard lb, integer sortType, boolean ascending returnsnothing
    if (sortType == bj_SORTTYPE_SORTBYVALUE) then
        call LeaderboardSortItemsByValue(lb, ascending)
    elseif (sortType == bj_SORTTYPE_SORTBYPLAYER) then
        call LeaderboardSortItemsByPlayer(lb, ascending)
    elseif (sortType == bj_SORTTYPE_SORTBYLABEL) then
        call LeaderboardSortItemsByLabel(lb, ascending)
    else
        // Unrecognized sort type - ignore the request.
    endif
endfunction

//===========================================================================
function LeaderboardSortItemsByPlayerBJ takesleaderboard lb, boolean ascending returnsnothing
    call LeaderboardSortItemsByPlayer(lb, ascending)
endfunction

//===========================================================================
function LeaderboardSortItemsByLabelBJ takesleaderboard lb, boolean ascending returnsnothing
    call LeaderboardSortItemsByLabel(lb, ascending)
endfunction

//===========================================================================
function LeaderboardGetPlayerIndexBJ takesplayer whichPlayer, leaderboard lb returnsinteger
    returnLeaderboardGetPlayerIndex(lb, whichPlayer) + 1
endfunction

//===========================================================================
// Returns the player who is occupying a specified position in a leaderboard.
// The position parameter is expected in the range of 1..16.
//
function LeaderboardGetIndexedPlayerBJ takesinteger position, leaderboard lb returnsplayer
    local integer index
    local player  indexPlayer

    set index = 0
    loop
        set indexPlayer = Player(index)
        if (LeaderboardGetPlayerIndex(lb, indexPlayer) == position - 1) then
            returnindexPlayer
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    returnPlayer(PLAYER_NEUTRAL_PASSIVE)
endfunction

//===========================================================================
function PlayerGetLeaderboardBJ takesplayer whichPlayer returnsleaderboard
    returnPlayerGetLeaderboard(whichPlayer)
endfunction

//===========================================================================
function GetLastCreatedLeaderboard takesnothing returnsleaderboard
    returnbj_lastCreatedLeaderboard
endfunction

//***************************************************************************
//*
//*  Multiboard Utility Functions
//*
//***************************************************************************

//===========================================================================
function CreateMultiboardBJ takesinteger cols, integer rows, string title returnsmultiboard
    set bj_lastCreatedMultiboard = CreateMultiboard()
    call MultiboardSetRowCount(bj_lastCreatedMultiboard, rows)
    call MultiboardSetColumnCount(bj_lastCreatedMultiboard, cols)
    call MultiboardSetTitleText(bj_lastCreatedMultiboard, title)
    call MultiboardDisplay(bj_lastCreatedMultiboard, true)
    returnbj_lastCreatedMultiboard
endfunction

//===========================================================================
function DestroyMultiboardBJ takesmultiboard mb returnsnothing
    call DestroyMultiboard(mb)
endfunction

//===========================================================================
function GetLastCreatedMultiboard takesnothing returnsmultiboard
    returnbj_lastCreatedMultiboard
endfunction

//===========================================================================
function MultiboardDisplayBJ takesboolean show, multiboard mb returnsnothing
    call MultiboardDisplay(mb, show)
endfunction

//===========================================================================
function MultiboardMinimizeBJ takesboolean minimize, multiboard mb returnsnothing
    call MultiboardMinimize(mb, minimize)
endfunction

//===========================================================================
function MultiboardSetTitleTextColorBJ takesmultiboard mb, real red, real green, real blue, real transparency returnsnothing
    call MultiboardSetTitleTextColor(mb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function MultiboardAllowDisplayBJ takesboolean flag returnsnothing
    call MultiboardSuppressDisplay(not flag)
endfunction

//===========================================================================
function MultiboardSetItemStyleBJ takesmultiboard mb, integer col, integer row, boolean showValue, boolean showIcon returnsnothing
    local integer curRow = 0
    local integer curCol = 0
    local integer numRows = MultiboardGetRowCount(mb)
    local integer numCols = MultiboardGetColumnCount(mb)
    local multiboarditem mbitem = null

    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemStyle(mbitem, showValue, showIcon)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction

//===========================================================================
function MultiboardSetItemValueBJ takesmultiboard mb, integer col, integer row, string val returnsnothing
    local integer curRow = 0
    local integer curCol = 0
    local integer numRows = MultiboardGetRowCount(mb)
    local integer numCols = MultiboardGetColumnCount(mb)
    local multiboarditem mbitem = null

    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemValue(mbitem, val)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction

//===========================================================================
function MultiboardSetItemColorBJ takesmultiboard mb, integer col, integer row, real red, real green, real blue, real transparency returnsnothing
    local integer curRow = 0
    local integer curCol = 0
    local integer numRows = MultiboardGetRowCount(mb)
    local integer numCols = MultiboardGetColumnCount(mb)
    local multiboarditem mbitem = null

    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemValueColor(mbitem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction

//===========================================================================
function MultiboardSetItemWidthBJ takesmultiboard mb, integer col, integer row, real width returnsnothing
    local integer curRow = 0
    local integer curCol = 0
    local integer numRows = MultiboardGetRowCount(mb)
    local integer numCols = MultiboardGetColumnCount(mb)
    local multiboarditem mbitem = null

    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemWidth(mbitem, width / 100.0)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction

//===========================================================================
function MultiboardSetItemIconBJ takesmultiboard mb, integer col, integer row, string iconFileName returnsnothing
    local integer curRow = 0
    local integer curCol = 0
    local integer numRows = MultiboardGetRowCount(mb)
    local integer numCols = MultiboardGetColumnCount(mb)
    local multiboarditem mbitem = null

    // Loop over rows, using 1-based index
    loop
        set curRow = curRow + 1
        exitwhen curRow > numRows

        // Apply setting to the requested row, or all rows (if row is 0)
        if (row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if (col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemIcon(mbitem, iconFileName)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction



//***************************************************************************
//*
//*  Text Tag Utility Functions
//*
//***************************************************************************

//===========================================================================
// Scale the font size linearly such that size 10 equates to height 0.023.
// Screen-relative font heights are harder to grasp and than font sizes.
//
function TextTagSize2Height takesreal size returnsreal
    returnsize * 0.023 / 10
endfunction

//===========================================================================
// Scale the speed linearly such that speed 128 equates to 0.071.
// Screen-relative speeds are hard to grasp.
//
function TextTagSpeed2Velocity takesreal speed returnsreal
    returnspeed * 0.071 / 128
endfunction

//===========================================================================
function SetTextTagColorBJ takestexttag tt, real red, real green, real blue, real transparency returnsnothing
    call SetTextTagColor(tt, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0-transparency))
endfunction

//===========================================================================
function SetTextTagVelocityBJ takestexttag tt, real speed, real angle returnsnothing
    local real vel = TextTagSpeed2Velocity(speed)
    local real xvel = vel * Cos(angle * bj_DEGTORAD)
    local real yvel = vel * Sin(angle * bj_DEGTORAD)

    call SetTextTagVelocity(tt, xvel, yvel)
endfunction

//===========================================================================
function SetTextTagTextBJ takestexttag tt, string s, real size returnsnothing
    local real textHeight = TextTagSize2Height(size)

    call SetTextTagText(tt, s, textHeight)
endfunction

//===========================================================================
function SetTextTagPosBJ takestexttag tt, location loc, real zOffset returnsnothing
    call SetTextTagPos(tt, GetLocationX(loc), GetLocationY(loc), zOffset)
endfunction

//===========================================================================
function SetTextTagPosUnitBJ takestexttag tt, unit whichUnit, real zOffset returnsnothing
    call SetTextTagPosUnit(tt, whichUnit, zOffset)
endfunction

//===========================================================================
function SetTextTagSuspendedBJ takestexttag tt, boolean flag returnsnothing
    call SetTextTagSuspended(tt, flag)
endfunction

//===========================================================================
function SetTextTagPermanentBJ takestexttag tt, boolean flag returnsnothing
    call SetTextTagPermanent(tt, flag)
endfunction

//===========================================================================
function SetTextTagAgeBJ takestexttag tt, real age returnsnothing
    call SetTextTagAge(tt, age)
endfunction

//===========================================================================
function SetTextTagLifespanBJ takestexttag tt, real lifespan returnsnothing
    call SetTextTagLifespan(tt, lifespan)
endfunction

//===========================================================================
function SetTextTagFadepointBJ takestexttag tt, real fadepoint returnsnothing
    call SetTextTagFadepoint(tt, fadepoint)
endfunction

//===========================================================================
function CreateTextTagLocBJ takesstring s, location loc, real zOffset, real size, real red, real green, real blue, real transparency returnstexttag
    set bj_lastCreatedTextTag = CreateTextTag()
    call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
    call SetTextTagPosBJ(bj_lastCreatedTextTag, loc, zOffset)
    call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

    returnbj_lastCreatedTextTag
endfunction

//===========================================================================
function CreateTextTagUnitBJ takesstring s, unit whichUnit, real zOffset, real size, real red, real green, real blue, real transparency returnstexttag
    set bj_lastCreatedTextTag = CreateTextTag()
    call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
    call SetTextTagPosUnitBJ(bj_lastCreatedTextTag, whichUnit, zOffset)
    call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

    returnbj_lastCreatedTextTag
endfunction

//===========================================================================
function DestroyTextTagBJ takestexttag tt returnsnothing
    call DestroyTextTag(tt)
endfunction

//===========================================================================
function ShowTextTagForceBJ takesboolean show, texttag tt, force whichForce returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetTextTagVisibility(tt, show)
    endif
endfunction

//===========================================================================
function GetLastCreatedTextTag takesnothing returnstexttag
    returnbj_lastCreatedTextTag
endfunction



//***************************************************************************
//*
//*  Cinematic Utility Functions
//*
//***************************************************************************

//===========================================================================
function PauseGameOn takesnothing returnsnothing
    call PauseGame(true)
endfunction

//===========================================================================
function PauseGameOff takesnothing returnsnothing
    call PauseGame(false)
endfunction

//===========================================================================
function SetUserControlForceOn takesforce whichForce returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableUserControl(true)
    endif
endfunction

//===========================================================================
function SetUserControlForceOff takesforce whichForce returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableUserControl(false)
    endif
endfunction

//===========================================================================
function ShowInterfaceForceOn takesforce whichForce, real fadeDuration returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ShowInterface(true, fadeDuration)
    endif
endfunction

//===========================================================================
function ShowInterfaceForceOff takesforce whichForce, real fadeDuration returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ShowInterface(false, fadeDuration)
    endif
endfunction

//===========================================================================
function PingMinimapForForce takesforce whichForce, real x, real y, real duration returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PingMinimap(x, y, duration)
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction

//===========================================================================
function PingMinimapLocForForce takesforce whichForce, location loc, real duration returnsnothing
    call PingMinimapForForce(whichForce, GetLocationX(loc), GetLocationY(loc), duration)
endfunction

//===========================================================================
function PingMinimapForPlayer takesplayer whichPlayer, real x, real y, real duration returnsnothing
    if (GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PingMinimap(x, y, duration)
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction

//===========================================================================
function PingMinimapLocForPlayer takesplayer whichPlayer, location loc, real duration returnsnothing
    call PingMinimapForPlayer(whichPlayer, GetLocationX(loc), GetLocationY(loc), duration)
endfunction

//===========================================================================
function PingMinimapForForceEx takesforce whichForce, real x, real y, real duration, integer style, real red, real green, real blue returnsnothing
    local integer red255 = PercentTo255(red)
    local integer green255 = PercentTo255(green)
    local integer blue255 = PercentTo255(blue)

    if (IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        // Prevent 100% red simple and flashy pings, as they become "attack" pings.
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
            // Unrecognized ping style - ignore the request.
        endif
        
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction

//===========================================================================
function PingMinimapLocForForceEx takesforce whichForce, location loc, real duration, integer style, real red, real green, real blue returnsnothing
    call PingMinimapForForceEx(whichForce, GetLocationX(loc), GetLocationY(loc), duration, style, red, green, blue)
endfunction

//===========================================================================
function EnableWorldFogBoundaryBJ takesboolean enable, force f returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableWorldFogBoundary(enable)
    endif
endfunction

//===========================================================================
function EnableOcclusionBJ takesboolean enable, force f returnsnothing
    if (IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableOcclusion(enable)
    endif
endfunction



//***************************************************************************
//*
//*  Cinematic Transmission Utility Functions
//*
//***************************************************************************

//===========================================================================
// If cancelled, stop the sound and end the cinematic scene.
//
function CancelCineSceneBJ takesnothing returnsnothing
    call StopSoundBJ(bj_cineSceneLastSound, true)
    call EndCinematicScene()
endfunction

//===========================================================================
// Init a trigger to listen for END_CINEMATIC events and respond to them if
// a cinematic scene is in progress.  For performance reasons, this should
// only be called once a cinematic scene has been started, so that maps
// lacking such scenes do not bother to register for these events.
//
function TryInitCinematicBehaviorBJ takesnothing returnsnothing
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

//===========================================================================
function SetCinematicSceneBJ takessound soundHandle, integer portraitUnitId, playercolor color, string speakerTitle, string text, real sceneDuration, real voiceoverDuration returnsnothing
    set bj_cineSceneLastSound = soundHandle
    call PlaySoundBJ(soundHandle)
    call SetCinematicScene(portraitUnitId, color, speakerTitle, text, sceneDuration, voiceoverDuration)
endfunction

//===========================================================================
function GetTransmissionDuration takessound soundHandle, integer timeType, real timeVal returnsreal
    local real duration

    if (timeType == bj_TIMETYPE_ADD) then
        set duration = GetSoundDurationBJ(soundHandle) + timeVal
    elseif (timeType == bj_TIMETYPE_SET) then
        set duration = timeVal
    elseif (timeType == bj_TIMETYPE_SUB) then
        set duration = GetSoundDurationBJ(soundHandle) - timeVal
    else
        // Unrecognized timeType - ignore timeVal.
        set duration = GetSoundDurationBJ(soundHandle)
    endif

    // Make sure we have a non-negative duration.
    if (duration < 0) then
        set duration = 0
    endif
    returnduration
endfunction

//===========================================================================
function WaitTransmissionDuration takessound soundHandle, integer timeType, real timeVal returnsnothing
    if (timeType == bj_TIMETYPE_SET) then
        // If we have a static duration wait, just perform the wait.
        call TriggerSleepAction(timeVal)

    elseif (soundHandle == null) then
        // If the sound does not exist, perform a default length wait.
        call TriggerSleepAction(bj_NOTHING_SOUND_DURATION)

    elseif (timeType == bj_TIMETYPE_SUB) then
        // If the transmission is cutting off the sound, wait for the sound
        // to be mostly finished.
        call WaitForSoundBJ(soundHandle, timeVal)

    elseif (timeType == bj_TIMETYPE_ADD) then
        // If the transmission is extending beyond the sound's length, wait
        // for it to finish, and then wait the additional time.
        call WaitForSoundBJ(soundHandle, 0)
        call TriggerSleepAction(timeVal)

    else
        // Unrecognized timeType - ignore.
    endif
endfunction

//===========================================================================
function DoTransmissionBasicsXYBJ takesinteger unitId, playercolor color, real x, real y, sound soundHandle, string unitName, string message, real duration returnsnothing
    call SetCinematicSceneBJ(soundHandle, unitId, color, unitName, message, duration + bj_TRANSMISSION_PORT_HANGTIME, duration)

    if (unitId != 0) then
        call PingMinimap(x, y, bj_TRANSMISSION_PING_TIME)
        //call SetCameraQuickPosition(x, y)
    endif
endfunction

//===========================================================================
// Display a text message to a Player Group with an accompanying sound,
// portrait, speech indicator, and all that good stuff.
//   - Query duration of sound
//   - Play sound
//   - Display text message for duration
//   - Display animating portrait for duration
//   - Display a speech indicator for the unit
//   - Ping the minimap
//
function TransmissionFromUnitWithNameBJ takesforce toForce, unit whichUnit, string unitName, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returnsnothing
    call TryInitCinematicBehaviorBJ()

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        if (whichUnit == null) then
            // If the unit reference is invalid, send the transmission from the center of the map with no portrait.
            call DoTransmissionBasicsXYBJ(0, PLAYER_COLOR_RED, 0, 0, soundHandle, unitName, message, bj_lastTransmissionDuration)
        else
            call DoTransmissionBasicsXYBJ(GetUnitTypeId(whichUnit), GetPlayerColor(GetOwningPlayer(whichUnit)), GetUnitX(whichUnit), GetUnitY(whichUnit), soundHandle, unitName, message, bj_lastTransmissionDuration)
            if (not IsUnitHidden(whichUnit)) then
                call UnitAddIndicator(whichUnit, bj_TRANSMISSION_IND_RED, bj_TRANSMISSION_IND_BLUE, bj_TRANSMISSION_IND_GREEN, bj_TRANSMISSION_IND_ALPHA)
            endif
        endif
    endif

    if wait and (bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

endfunction

//===========================================================================
// This operates like TransmissionFromUnitWithNameBJ, but for a unit type
// rather than a unit instance.  As such, no speech indicator is employed.
//
function TransmissionFromUnitTypeWithNameBJ takesforce toForce, player fromPlayer, integer unitId, string unitName, location loc, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returnsnothing
    call TryInitCinematicBehaviorBJ()

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if (IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        call DoTransmissionBasicsXYBJ(unitId, GetPlayerColor(fromPlayer), GetLocationX(loc), GetLocationY(loc), soundHandle, unitName, message, bj_lastTransmissionDuration)
    endif

    if wait and (bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

endfunction

//===========================================================================
function GetLastTransmissionDurationBJ takesnothing returnsreal
    returnbj_lastTransmissionDuration
endfunction

//===========================================================================
function ForceCinematicSubtitlesBJ takesboolean flag returnsnothing
    call ForceCinematicSubtitles(flag)
endfunction


//***************************************************************************
//*
//*  Cinematic Mode Utility Functions
//*
//***************************************************************************

//===========================================================================
// Makes many common UI settings changes at once, for use when beginning and
// ending cinematic sequences.  Note that some affects apply to all players,
// such as game speed.  This is unavoidable.
//   - Clear the screen of text messages
//   - Hide interface UI (letterbox mode)
//   - Hide game messages (ally under attack, etc.)
//   - Disable user control
//   - Disable occlusion
//   - Set game speed (for all players)
//   - Lock game speed (for all players)
//   - Disable black mask (for all players)
//   - Disable fog of war (for all players)
//   - Disable world boundary fog (for all players)
//   - Dim non-speech sound channels
//   - End any outstanding music themes
//   - Fix the random seed to a set value
//   - Reset the camera smoothing factor
//
function CinematicModeExBJ takesboolean cineMode, force forForce, real interfaceFadeTime returnsnothing
    // If the game hasn't started yet, perform interface fades immediately
    if (not bj_gameStarted) then
        set interfaceFadeTime = 0
    endif

    if (cineMode) then
        // Save the UI state so that we can restore it later.
        if (not bj_cineModeAlreadyIn) then
            set bj_cineModeAlreadyIn = true
            set bj_cineModePriorSpeed = GetGameSpeed()
            set bj_cineModePriorFogSetting = IsFogEnabled()
            set bj_cineModePriorMaskSetting = IsFogMaskEnabled()
            set bj_cineModePriorDawnDusk = IsDawnDuskEnabled()
            set bj_cineModeSavedSeed = GetRandomInt(0, 1000000)
        endif

        // Perform local changes
        if (IsPlayerInForce(GetLocalPlayer(), forForce)) then
            // Use only local code (no net traffic) within this block to avoid desyncs.
            call ClearTextMessages()
            call ShowInterface(false, interfaceFadeTime)
            call EnableUserControl(false)
            call EnableOcclusion(false)
            call SetCineModeVolumeGroupsBJ()
        endif

        // Perform global changes
        call SetGameSpeed(bj_CINEMODE_GAMESPEED)
        call SetMapFlag(MAP_LOCK_SPEED, true)
        call FogMaskEnable(false)
        call FogEnable(false)
        call EnableWorldFogBoundary(false)
        call EnableDawnDusk(false)

        // Use a fixed random seed, so that cinematics play consistently.
        call SetRandomSeed(0)
    else
        set bj_cineModeAlreadyIn = false

        // Perform local changes
        if (IsPlayerInForce(GetLocalPlayer(), forForce)) then
            // Use only local code (no net traffic) within this block to avoid desyncs.
            call ShowInterface(true, interfaceFadeTime)
            call EnableUserControl(true)
            call EnableOcclusion(true)
            call VolumeGroupReset()
            call EndThematicMusic()
            call CameraResetSmoothingFactorBJ()
        endif

        // Perform global changes
        call SetMapFlag(MAP_LOCK_SPEED, false)
        call SetGameSpeed(bj_cineModePriorSpeed)
        call FogMaskEnable(bj_cineModePriorMaskSetting)
        call FogEnable(bj_cineModePriorFogSetting)
        call EnableWorldFogBoundary(true)
        call EnableDawnDusk(bj_cineModePriorDawnDusk)
        call SetRandomSeed(bj_cineModeSavedSeed)
    endif
endfunction

//===========================================================================
function CinematicModeBJ takesboolean cineMode, force forForce returnsnothing
    call CinematicModeExBJ(cineMode, forForce, bj_CINEMODE_INTERFACEFADE)
endfunction



//***************************************************************************
//*
//*  Cinematic Filter Utility Functions
//*
//***************************************************************************

//===========================================================================
function DisplayCineFilterBJ takesboolean flag returnsnothing
    call DisplayCineFilter(flag)
endfunction

//===========================================================================
function CinematicFadeCommonBJ takesreal red, real green, real blue, real duration, string tex, real startTrans, real endTrans returnsnothing
    if (duration == 0) then
        // If the fade is instant, use the same starting and ending values,
        // so that we effectively do a set rather than a fade.
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

//===========================================================================
function FinishCinematicFadeBJ takesnothing returnsnothing
    call DestroyTimer(bj_cineFadeFinishTimer)
    set bj_cineFadeFinishTimer = null
    call DisplayCineFilter(false)
    call EnableUserUI(true)
endfunction

//===========================================================================
function FinishCinematicFadeAfterBJ takesreal duration returnsnothing
    // Create a timer to end the cinematic fade.
    set bj_cineFadeFinishTimer = CreateTimer()
    call TimerStart(bj_cineFadeFinishTimer, duration, false, function FinishCinematicFadeBJ)
endfunction

//===========================================================================
function ContinueCinematicFadeBJ takesnothing returnsnothing
    call DestroyTimer(bj_cineFadeContinueTimer)
    set bj_cineFadeContinueTimer = null
    call CinematicFadeCommonBJ(bj_cineFadeContinueRed, bj_cineFadeContinueGreen, bj_cineFadeContinueBlue, bj_cineFadeContinueDuration, bj_cineFadeContinueTex, bj_cineFadeContinueTrans, 100)
endfunction

//===========================================================================
function ContinueCinematicFadeAfterBJ takesreal duration, real red, real green, real blue, real trans, string tex returnsnothing
    set bj_cineFadeContinueRed = red
    set bj_cineFadeContinueGreen = green
    set bj_cineFadeContinueBlue = blue
    set bj_cineFadeContinueTrans = trans
    set bj_cineFadeContinueDuration = duration
    set bj_cineFadeContinueTex = tex

    // Create a timer to continue the cinematic fade.
    set bj_cineFadeContinueTimer = CreateTimer()
    call TimerStart(bj_cineFadeContinueTimer, duration, false, function ContinueCinematicFadeBJ)
endfunction

//===========================================================================
function AbortCinematicFadeBJ takesnothing returnsnothing
    if (bj_cineFadeContinueTimer != null) then
        call DestroyTimer(bj_cineFadeContinueTimer)
    endif

    if (bj_cineFadeFinishTimer != null) then
        call DestroyTimer(bj_cineFadeFinishTimer)
    endif
endfunction

//===========================================================================
function CinematicFadeBJ takesinteger fadetype, real duration, string tex, real red, real green, real blue, real trans returnsnothing
    if (fadetype == bj_CINEFADETYPE_FADEOUT) then
        // Fade out to the requested color.
        call AbortCinematicFadeBJ()
        call CinematicFadeCommonBJ(red, green, blue, duration, tex, 100, trans)
    elseif (fadetype == bj_CINEFADETYPE_FADEIN) then
        // Fade in from the requested color.
        call AbortCinematicFadeBJ()
        call CinematicFadeCommonBJ(red, green, blue, duration, tex, trans, 100)
        call FinishCinematicFadeAfterBJ(duration)
    elseif (fadetype == bj_CINEFADETYPE_FADEOUTIN) then
        // Fade out to the requested color, and then fade back in from it.
        if (duration > 0) then
            call AbortCinematicFadeBJ()
            call CinematicFadeCommonBJ(red, green, blue, duration * 0.5, tex, 100, trans)
            call ContinueCinematicFadeAfterBJ(duration * 0.5, red, green, blue, trans, tex)
            call FinishCinematicFadeAfterBJ(duration)
        endif
    else
        // Unrecognized fadetype - ignore the request.
    endif
endfunction

//===========================================================================
function CinematicFilterGenericBJ takesreal duration, blendmode bmode, string tex, real red0, real green0, real blue0, real trans0, real red1, real green1, real blue1, real trans1 returnsnothing
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



//***************************************************************************
//*
//*  Rescuable Unit Utility Functions
//*
//***************************************************************************

//===========================================================================
// Rescues a unit for a player.  This performs the default rescue behavior,
// including a rescue sound, flashing selection circle, ownership change,
// and optionally a unit color change.
//
function RescueUnitBJ takesunit whichUnit, player rescuer, boolean changeColor returnsnothing
    if IsUnitDeadBJ(whichUnit) or (GetOwningPlayer(whichUnit) == rescuer) then
        return
    endif

    call StartSound(bj_rescueSound)
    call SetUnitOwner(whichUnit, rescuer, changeColor)
    call UnitAddIndicator(whichUnit, 0, 255, 0, 255)
    call PingMinimapForPlayer(rescuer, GetUnitX(whichUnit), GetUnitY(whichUnit), bj_RESCUE_PING_TIME)
endfunction

//===========================================================================
function TriggerActionUnitRescuedBJ takesnothing returnsnothing
    local unit theUnit = GetTriggerUnit()

    if IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
        call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorBldg)
    else
        call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorUnit)
    endif
endfunction

//===========================================================================
// Attempt to init triggers for default rescue behavior.  For performance
// reasons, this should only be attempted if a player is set to Rescuable,
// or if a specific unit is thus flagged.
//
function TryInitRescuableTriggersBJ takesnothing returnsnothing
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

//===========================================================================
// Determines whether or not rescued units automatically change color upon
// being rescued.
//
function SetRescueUnitColorChangeBJ takesboolean changeColor returnsnothing
    set bj_rescueChangeColorUnit = changeColor
endfunction

//===========================================================================
// Determines whether or not rescued buildings automatically change color
// upon being rescued.
//
function SetRescueBuildingColorChangeBJ takesboolean changeColor returnsnothing
    set bj_rescueChangeColorBldg = changeColor
endfunction

//===========================================================================
function MakeUnitRescuableToForceBJEnum takesnothing returnsnothing
    call TryInitRescuableTriggersBJ()
    call SetUnitRescuable(bj_makeUnitRescuableUnit, GetEnumPlayer(), bj_makeUnitRescuableFlag)
endfunction

//===========================================================================
function MakeUnitRescuableToForceBJ takesunit whichUnit, boolean isRescuable, force whichForce returnsnothing
    // Flag the unit as rescuable/unrescuable for the appropriate players.
    set bj_makeUnitRescuableUnit = whichUnit
    set bj_makeUnitRescuableFlag = isRescuable
    call ForForce(whichForce, function MakeUnitRescuableToForceBJEnum)
endfunction

//===========================================================================
function InitRescuableBehaviorBJ takesnothing returnsnothing
    local integer index

    set index = 0
    loop
        // If at least one player slot is "Rescuable"-controlled, init the
        // rescue behavior triggers.
        if (GetPlayerController(Player(index)) == MAP_CONTROL_RESCUABLE) then
            call TryInitRescuableTriggersBJ()
            return
        endif
        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction



//***************************************************************************
//*
//*  Research and Upgrade Utility Functions
//*
//***************************************************************************

//===========================================================================
function SetPlayerTechResearchedSwap takesinteger techid, integer levels, player whichPlayer returnsnothing
    call SetPlayerTechResearched(whichPlayer, techid, levels)
endfunction

//===========================================================================
function SetPlayerTechMaxAllowedSwap takesinteger techid, integer maximum, player whichPlayer returnsnothing
    call SetPlayerTechMaxAllowed(whichPlayer, techid, maximum)
endfunction

//===========================================================================
function SetPlayerMaxHeroesAllowed takesinteger maximum, player whichPlayer returnsnothing
    call SetPlayerTechMaxAllowed(whichPlayer, 'HERO', maximum)
endfunction

//===========================================================================
function GetPlayerTechCountSimple takesinteger techid, player whichPlayer returnsinteger
    returnGetPlayerTechCount(whichPlayer, techid, true)
endfunction

//===========================================================================
function GetPlayerTechMaxAllowedSwap takesinteger techid, player whichPlayer returnsinteger
    returnGetPlayerTechMaxAllowed(whichPlayer, techid)
endfunction

//===========================================================================
function SetPlayerAbilityAvailableBJ takesboolean avail, integer abilid, player whichPlayer returnsnothing
    call SetPlayerAbilityAvailable(whichPlayer, abilid, avail)
endfunction



//***************************************************************************
//*
//*  Campaign Utility Functions
//*
//***************************************************************************

function SetCampaignMenuRaceBJ takesinteger campaignNumber returnsnothing
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
        // Unrecognized campaign - ignore the request
    endif
endfunction

//===========================================================================
// Converts a single campaign mission designation into campaign and mission
// numbers.  The 1000's digit is considered the campaign index, and the 1's
// digit is considered the mission index within that campaign.  This is done
// so that the trigger for this can use a single drop-down to list all of
// the campaign missions.
//
function SetMissionAvailableBJ takesboolean available, integer missionIndex returnsnothing
    local integer campaignNumber = missionIndex / 1000
    local integer missionNumber = missionIndex - campaignNumber * 1000

    call SetMissionAvailable(campaignNumber, missionNumber, available)
endfunction

//===========================================================================
function SetCampaignAvailableBJ takesboolean available, integer campaignNumber returnsnothing
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

//===========================================================================
function SetCinematicAvailableBJ takesboolean available, integer cinematicIndex returnsnothing
    if (cinematicIndex == bj_CINEMATICINDEX_TOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_T, available)
        call PlayCinematic("TutorialOp")
    elseif (cinematicIndex == bj_CINEMATICINDEX_HOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_H, available)
        call PlayCinematic("HumanOp")
    elseif (cinematicIndex == bj_CINEMATICINDEX_HED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_H, available)
        call PlayCinematic("HumanEd")
    elseif (cinematicIndex == bj_CINEMATICINDEX_OOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_O, available)
        call PlayCinematic("OrcOp")
    elseif (cinematicIndex == bj_CINEMATICINDEX_OED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_O, available)
        call PlayCinematic("OrcEd")
    elseif (cinematicIndex == bj_CINEMATICINDEX_UOP) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_U, available)
        call PlayCinematic("UndeadOp")
    elseif (cinematicIndex == bj_CINEMATICINDEX_UED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_U, available)
        call PlayCinematic("UndeadEd")
    elseif (cinematicIndex == bj_CINEMATICINDEX_NOP) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_N, available)
        call PlayCinematic("NightElfOp")
    elseif (cinematicIndex == bj_CINEMATICINDEX_NED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_N, available)
        call PlayCinematic("NightElfEd")
    elseif (cinematicIndex == bj_CINEMATICINDEX_XOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_OFFSET_XN, available)
        call PlayCinematic("IntroX")
    elseif (cinematicIndex == bj_CINEMATICINDEX_XED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_OFFSET_XU, available)
        call PlayCinematic("OutroX")
    else
        // Unrecognized cinematic - ignore the request.
    endif
endfunction

//===========================================================================
function InitGameCacheBJ takesstring campaignFile returnsgamecache
    set bj_lastCreatedGameCache = InitGameCache(campaignFile)
    returnbj_lastCreatedGameCache
endfunction

//===========================================================================
function SaveGameCacheBJ takesgamecache cache returnsboolean
    returnSaveGameCache(cache)
endfunction

//===========================================================================
function GetLastCreatedGameCacheBJ takesnothing returnsgamecache
    returnbj_lastCreatedGameCache
endfunction

//===========================================================================
function InitHashtableBJ takesnothing returnshashtable
    set bj_lastCreatedHashtable = InitHashtable()
    returnbj_lastCreatedHashtable
endfunction

//===========================================================================
function GetLastCreatedHashtableBJ takesnothing returnshashtable
    returnbj_lastCreatedHashtable
endfunction

//===========================================================================
function StoreRealBJ takesreal value, string key, string missionKey, gamecache cache returnsnothing
    call StoreReal(cache, missionKey, key, value)
endfunction

//===========================================================================
function StoreIntegerBJ takesinteger value, string key, string missionKey, gamecache cache returnsnothing
    call StoreInteger(cache, missionKey, key, value)
endfunction

//===========================================================================
function StoreBooleanBJ takesboolean value, string key, string missionKey, gamecache cache returnsnothing
    call StoreBoolean(cache, missionKey, key, value)
endfunction

//===========================================================================
function StoreStringBJ takesstring value, string key, string missionKey, gamecache cache returnsboolean
    returnStoreString(cache, missionKey, key, value)
endfunction

//===========================================================================
function StoreUnitBJ takesunit whichUnit, string key, string missionKey, gamecache cache returnsboolean
    returnStoreUnit(cache, missionKey, key, whichUnit)
endfunction

//===========================================================================
function SaveRealBJ takesreal value, integer key, integer missionKey, hashtable table returnsnothing
    call SaveReal(table, missionKey, key, value)
endfunction

//===========================================================================
function SaveIntegerBJ takesinteger value, integer key, integer missionKey, hashtable table returnsnothing
    call SaveInteger(table, missionKey, key, value)
endfunction

//===========================================================================
function SaveBooleanBJ takesboolean value, integer key, integer missionKey, hashtable table returnsnothing
    call SaveBoolean(table, missionKey, key, value)
endfunction

//===========================================================================
function SaveStringBJ takesstring value, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveStr(table, missionKey, key, value)
endfunction

//===========================================================================
function SavePlayerHandleBJ takesplayer whichPlayer, integer key, integer missionKey, hashtable table returnsboolean
    returnSavePlayerHandle(table, missionKey, key, whichPlayer)
endfunction

//===========================================================================
function SaveWidgetHandleBJ takeswidget whichWidget, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveWidgetHandle(table, missionKey, key, whichWidget)
endfunction

//===========================================================================
function SaveDestructableHandleBJ takesdestructable whichDestructable, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveDestructableHandle(table, missionKey, key, whichDestructable)
endfunction

//===========================================================================
function SaveItemHandleBJ takesitem whichItem, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveItemHandle(table, missionKey, key, whichItem)
endfunction

//===========================================================================
function SaveUnitHandleBJ takesunit whichUnit, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveUnitHandle(table, missionKey, key, whichUnit)
endfunction

//===========================================================================
function SaveAbilityHandleBJ takesability whichAbility, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveAbilityHandle(table, missionKey, key, whichAbility)
endfunction

//===========================================================================
function SaveTimerHandleBJ takestimer whichTimer, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTimerHandle(table, missionKey, key, whichTimer)
endfunction

//===========================================================================
function SaveTriggerHandleBJ takestrigger whichTrigger, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTriggerHandle(table, missionKey, key, whichTrigger)
endfunction

//===========================================================================
function SaveTriggerConditionHandleBJ takestriggercondition whichTriggercondition, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTriggerConditionHandle(table, missionKey, key, whichTriggercondition)
endfunction

//===========================================================================
function SaveTriggerActionHandleBJ takestriggeraction whichTriggeraction, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTriggerActionHandle(table, missionKey, key, whichTriggeraction)
endfunction

//===========================================================================
function SaveTriggerEventHandleBJ takesevent whichEvent, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTriggerEventHandle(table, missionKey, key, whichEvent)
endfunction

//===========================================================================
function SaveForceHandleBJ takesforce whichForce, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveForceHandle(table, missionKey, key, whichForce)
endfunction

//===========================================================================
function SaveGroupHandleBJ takesgroup whichGroup, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveGroupHandle(table, missionKey, key, whichGroup)
endfunction

//===========================================================================
function SaveLocationHandleBJ takeslocation whichLocation, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveLocationHandle(table, missionKey, key, whichLocation)
endfunction

//===========================================================================
function SaveRectHandleBJ takesrect whichRect, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveRectHandle(table, missionKey, key, whichRect)
endfunction

//===========================================================================
function SaveBooleanExprHandleBJ takesboolexpr whichBoolexpr, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveBooleanExprHandle(table, missionKey, key, whichBoolexpr)
endfunction

//===========================================================================
function SaveSoundHandleBJ takessound whichSound, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveSoundHandle(table, missionKey, key, whichSound)
endfunction

//===========================================================================
function SaveEffectHandleBJ takeseffect whichEffect, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveEffectHandle(table, missionKey, key, whichEffect)
endfunction

//===========================================================================
function SaveUnitPoolHandleBJ takesunitpool whichUnitpool, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveUnitPoolHandle(table, missionKey, key, whichUnitpool)
endfunction

//===========================================================================
function SaveItemPoolHandleBJ takesitempool whichItempool, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveItemPoolHandle(table, missionKey, key, whichItempool)
endfunction

//===========================================================================
function SaveQuestHandleBJ takesquest whichQuest, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveQuestHandle(table, missionKey, key, whichQuest)
endfunction

//===========================================================================
function SaveQuestItemHandleBJ takesquestitem whichQuestitem, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveQuestItemHandle(table, missionKey, key, whichQuestitem)
endfunction

//===========================================================================
function SaveDefeatConditionHandleBJ takesdefeatcondition whichDefeatcondition, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveDefeatConditionHandle(table, missionKey, key, whichDefeatcondition)
endfunction

//===========================================================================
function SaveTimerDialogHandleBJ takestimerdialog whichTimerdialog, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTimerDialogHandle(table, missionKey, key, whichTimerdialog)
endfunction

//===========================================================================
function SaveLeaderboardHandleBJ takesleaderboard whichLeaderboard, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveLeaderboardHandle(table, missionKey, key, whichLeaderboard)
endfunction

//===========================================================================
function SaveMultiboardHandleBJ takesmultiboard whichMultiboard, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveMultiboardHandle(table, missionKey, key, whichMultiboard)
endfunction

//===========================================================================
function SaveMultiboardItemHandleBJ takesmultiboarditem whichMultiboarditem, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveMultiboardItemHandle(table, missionKey, key, whichMultiboarditem)
endfunction

//===========================================================================
function SaveTrackableHandleBJ takestrackable whichTrackable, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTrackableHandle(table, missionKey, key, whichTrackable)
endfunction

//===========================================================================
function SaveDialogHandleBJ takesdialog whichDialog, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveDialogHandle(table, missionKey, key, whichDialog)
endfunction

//===========================================================================
function SaveButtonHandleBJ takesbutton whichButton, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveButtonHandle(table, missionKey, key, whichButton)
endfunction

//===========================================================================
function SaveTextTagHandleBJ takestexttag whichTexttag, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveTextTagHandle(table, missionKey, key, whichTexttag)
endfunction

//===========================================================================
function SaveLightningHandleBJ takeslightning whichLightning, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveLightningHandle(table, missionKey, key, whichLightning)
endfunction

//===========================================================================
function SaveImageHandleBJ takesimage whichImage, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveImageHandle(table, missionKey, key, whichImage)
endfunction

//===========================================================================
function SaveUbersplatHandleBJ takesubersplat whichUbersplat, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveUbersplatHandle(table, missionKey, key, whichUbersplat)
endfunction

//===========================================================================
function SaveRegionHandleBJ takesregion whichRegion, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveRegionHandle(table, missionKey, key, whichRegion)
endfunction

//===========================================================================
function SaveFogStateHandleBJ takesfogstate whichFogState, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveFogStateHandle(table, missionKey, key, whichFogState)
endfunction

//===========================================================================
function SaveFogModifierHandleBJ takesfogmodifier whichFogModifier, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveFogModifierHandle(table, missionKey, key, whichFogModifier)
endfunction

//===========================================================================
function SaveAgentHandleBJ takesagent whichAgent, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveAgentHandle(table, missionKey, key, whichAgent)
endfunction

//===========================================================================
function SaveHashtableHandleBJ takeshashtable whichHashtable, integer key, integer missionKey, hashtable table returnsboolean
    returnSaveHashtableHandle(table, missionKey, key, whichHashtable)
endfunction

//===========================================================================
function GetStoredRealBJ takesstring key, string missionKey, gamecache cache returnsreal
    //call SyncStoredReal(cache, missionKey, key)
    returnGetStoredReal(cache, missionKey, key)
endfunction

//===========================================================================
function GetStoredIntegerBJ takesstring key, string missionKey, gamecache cache returnsinteger
    //call SyncStoredInteger(cache, missionKey, key)
    returnGetStoredInteger(cache, missionKey, key)
endfunction

//===========================================================================
function GetStoredBooleanBJ takesstring key, string missionKey, gamecache cache returnsboolean
    //call SyncStoredBoolean(cache, missionKey, key)
    returnGetStoredBoolean(cache, missionKey, key)
endfunction

//===========================================================================
function GetStoredStringBJ takesstring key, string missionKey, gamecache cache returnsstring
    local string s

    //call SyncStoredString(cache, missionKey, key)
    set s = GetStoredString(cache, missionKey, key)
    if (s == null) then
        return ""
    else
 returns 
    endif
endfunction

//===========================================================================
function LoadRealBJ takesinteger key, integer missionKey, hashtable table returnsreal
    //call SyncStoredReal(table, missionKey, key)
    returnLoadReal(table, missionKey, key)
endfunction

//===========================================================================
function LoadIntegerBJ takesinteger key, integer missionKey, hashtable table returnsinteger
    //call SyncStoredInteger(table, missionKey, key)
    returnLoadInteger(table, missionKey, key)
endfunction

//===========================================================================
function LoadBooleanBJ takesinteger key, integer missionKey, hashtable table returnsboolean
    //call SyncStoredBoolean(table, missionKey, key)
    returnLoadBoolean(table, missionKey, key)
endfunction

//===========================================================================
function LoadStringBJ takesinteger key, integer missionKey, hashtable table returnsstring
    local string s

    //call SyncStoredString(table, missionKey, key)
    set s = LoadStr(table, missionKey, key)
    if (s == null) then
        return ""
    else
 returns 
    endif
endfunction

//===========================================================================
function LoadPlayerHandleBJ takesinteger key, integer missionKey, hashtable table returnsplayer
    returnLoadPlayerHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadWidgetHandleBJ takesinteger key, integer missionKey, hashtable table returnswidget
    returnLoadWidgetHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadDestructableHandleBJ takesinteger key, integer missionKey, hashtable table returnsdestructable
    returnLoadDestructableHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadItemHandleBJ takesinteger key, integer missionKey, hashtable table returnsitem
    returnLoadItemHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadUnitHandleBJ takesinteger key, integer missionKey, hashtable table returnsunit
    returnLoadUnitHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadAbilityHandleBJ takesinteger key, integer missionKey, hashtable table returnsability
    returnLoadAbilityHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTimerHandleBJ takesinteger key, integer missionKey, hashtable table returnstimer
    returnLoadTimerHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTriggerHandleBJ takesinteger key, integer missionKey, hashtable table returnstrigger
    returnLoadTriggerHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTriggerConditionHandleBJ takesinteger key, integer missionKey, hashtable table returnstriggercondition
    returnLoadTriggerConditionHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTriggerActionHandleBJ takesinteger key, integer missionKey, hashtable table returnstriggeraction
    returnLoadTriggerActionHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTriggerEventHandleBJ takesinteger key, integer missionKey, hashtable table returnsevent
    returnLoadTriggerEventHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadForceHandleBJ takesinteger key, integer missionKey, hashtable table returnsforce
    returnLoadForceHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadGroupHandleBJ takesinteger key, integer missionKey, hashtable table returnsgroup
    returnLoadGroupHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadLocationHandleBJ takesinteger key, integer missionKey, hashtable table returnslocation
    returnLoadLocationHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadRectHandleBJ takesinteger key, integer missionKey, hashtable table returnsrect
    returnLoadRectHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadBooleanExprHandleBJ takesinteger key, integer missionKey, hashtable table returnsboolexpr
    returnLoadBooleanExprHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadSoundHandleBJ takesinteger key, integer missionKey, hashtable table returnssound
    returnLoadSoundHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadEffectHandleBJ takesinteger key, integer missionKey, hashtable table returnseffect
    returnLoadEffectHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadUnitPoolHandleBJ takesinteger key, integer missionKey, hashtable table returnsunitpool
    returnLoadUnitPoolHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadItemPoolHandleBJ takesinteger key, integer missionKey, hashtable table returnsitempool
    returnLoadItemPoolHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadQuestHandleBJ takesinteger key, integer missionKey, hashtable table returnsquest
    returnLoadQuestHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadQuestItemHandleBJ takesinteger key, integer missionKey, hashtable table returnsquestitem
    returnLoadQuestItemHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadDefeatConditionHandleBJ takesinteger key, integer missionKey, hashtable table returnsdefeatcondition
    returnLoadDefeatConditionHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTimerDialogHandleBJ takesinteger key, integer missionKey, hashtable table returnstimerdialog
    returnLoadTimerDialogHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadLeaderboardHandleBJ takesinteger key, integer missionKey, hashtable table returnsleaderboard
    returnLoadLeaderboardHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadMultiboardHandleBJ takesinteger key, integer missionKey, hashtable table returnsmultiboard
    returnLoadMultiboardHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadMultiboardItemHandleBJ takesinteger key, integer missionKey, hashtable table returnsmultiboarditem
    returnLoadMultiboardItemHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTrackableHandleBJ takesinteger key, integer missionKey, hashtable table returnstrackable
    returnLoadTrackableHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadDialogHandleBJ takesinteger key, integer missionKey, hashtable table returnsdialog
    returnLoadDialogHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadButtonHandleBJ takesinteger key, integer missionKey, hashtable table returnsbutton
    returnLoadButtonHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadTextTagHandleBJ takesinteger key, integer missionKey, hashtable table returnstexttag
    returnLoadTextTagHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadLightningHandleBJ takesinteger key, integer missionKey, hashtable table returnslightning
    returnLoadLightningHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadImageHandleBJ takesinteger key, integer missionKey, hashtable table returnsimage
    returnLoadImageHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadUbersplatHandleBJ takesinteger key, integer missionKey, hashtable table returnsubersplat
    returnLoadUbersplatHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadRegionHandleBJ takesinteger key, integer missionKey, hashtable table returnsregion
    returnLoadRegionHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadFogStateHandleBJ takesinteger key, integer missionKey, hashtable table returnsfogstate
    returnLoadFogStateHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadFogModifierHandleBJ takesinteger key, integer missionKey, hashtable table returnsfogmodifier
    returnLoadFogModifierHandle(table, missionKey, key)
endfunction

//===========================================================================
function LoadHashtableHandleBJ takesinteger key, integer missionKey, hashtable table returnshashtable
    returnLoadHashtableHandle(table, missionKey, key)
endfunction

//===========================================================================
function RestoreUnitLocFacingAngleBJ takesstring key, string missionKey, gamecache cache, player forWhichPlayer, location loc, real facing returnsunit
    //call SyncStoredUnit(cache, missionKey, key)
    set bj_lastLoadedUnit = RestoreUnit(cache, missionKey, key, forWhichPlayer, GetLocationX(loc), GetLocationY(loc), facing)
    returnbj_lastLoadedUnit
endfunction

//===========================================================================
function RestoreUnitLocFacingPointBJ takesstring key, string missionKey, gamecache cache, player forWhichPlayer, location loc, location lookAt returnsunit
    //call SyncStoredUnit(cache, missionKey, key)
    returnRestoreUnitLocFacingAngleBJ(key, missionKey, cache, forWhichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction

//===========================================================================
function GetLastRestoredUnitBJ takesnothing returnsunit
    returnbj_lastLoadedUnit
endfunction

//===========================================================================
function FlushGameCacheBJ takesgamecache cache returnsnothing
    call FlushGameCache(cache)
endfunction

//===========================================================================
function FlushStoredMissionBJ takesstring missionKey, gamecache cache returnsnothing
    call FlushStoredMission(cache, missionKey)
endfunction

//===========================================================================
function FlushParentHashtableBJ takeshashtable table returnsnothing
    call FlushParentHashtable(table)
endfunction

//===========================================================================
function FlushChildHashtableBJ takesinteger missionKey, hashtable table returnsnothing
    call FlushChildHashtable(table, missionKey)
endfunction

//===========================================================================
function HaveStoredValue takesstring key, integer valueType, string missionKey, gamecache cache returnsboolean
    if (valueType == bj_GAMECACHE_BOOLEAN) then
        returnHaveStoredBoolean(cache, missionKey, key)
    elseif (valueType == bj_GAMECACHE_INTEGER) then
        returnHaveStoredInteger(cache, missionKey, key)
    elseif (valueType == bj_GAMECACHE_REAL) then
        returnHaveStoredReal(cache, missionKey, key)
    elseif (valueType == bj_GAMECACHE_UNIT) then
        returnHaveStoredUnit(cache, missionKey, key)
    elseif (valueType == bj_GAMECACHE_STRING) then
        returnHaveStoredString(cache, missionKey, key)
    else
        // Unrecognized value type - ignore the request.
        returnfalse
    endif
endfunction

//===========================================================================
function HaveSavedValue takesinteger key, integer valueType, integer missionKey, hashtable table returnsboolean
    if (valueType == bj_HASHTABLE_BOOLEAN) then
        returnHaveSavedBoolean(table, missionKey, key)
    elseif (valueType == bj_HASHTABLE_INTEGER) then
        returnHaveSavedInteger(table, missionKey, key)
    elseif (valueType == bj_HASHTABLE_REAL) then
        returnHaveSavedReal(table, missionKey, key)
    elseif (valueType == bj_HASHTABLE_STRING) then
        returnHaveSavedString(table, missionKey, key)
    elseif (valueType == bj_HASHTABLE_HANDLE) then
        returnHaveSavedHandle(table, missionKey, key)
    else
        // Unrecognized value type - ignore the request.
        returnfalse
    endif
endfunction

//===========================================================================
function ShowCustomCampaignButton takesboolean show, integer whichButton returnsnothing
    call SetCustomCampaignButtonVisible(whichButton - 1, show)
endfunction

//===========================================================================
function IsCustomCampaignButtonVisibile takesinteger whichButton returnsboolean
    returnGetCustomCampaignButtonVisible(whichButton - 1)
endfunction

//===========================================================================
function LoadGameBJ takesstring loadFileName, boolean doScoreScreen returnsnothing
    call LoadGame(loadFileName, doScoreScreen)
endfunction

//===========================================================================
function SaveAndChangeLevelBJ takesstring saveFileName, string newLevel, boolean doScoreScreen returnsnothing
    call SaveGame(saveFileName)
    call ChangeLevel(newLevel, doScoreScreen)
endfunction

//===========================================================================
function SaveAndLoadGameBJ takesstring saveFileName, string loadFileName, boolean doScoreScreen returnsnothing
    call SaveGame(saveFileName)
    call LoadGame(loadFileName, doScoreScreen)
endfunction

//===========================================================================
function RenameSaveDirectoryBJ takesstring sourceDirName, string destDirName returnsboolean
    returnRenameSaveDirectory(sourceDirName, destDirName)
endfunction

//===========================================================================
function RemoveSaveDirectoryBJ takesstring sourceDirName returnsboolean
    returnRemoveSaveDirectory(sourceDirName)
endfunction

//===========================================================================
function CopySaveGameBJ takesstring sourceSaveName, string destSaveName returnsboolean
    returnCopySaveGame(sourceSaveName, destSaveName)
endfunction



//***************************************************************************
//*
//*  Miscellaneous Utility Functions
//*
//***************************************************************************

//===========================================================================
function GetPlayerStartLocationX takesplayer whichPlayer returnsreal
    returnGetStartLocationX(GetPlayerStartLocation(whichPlayer))
endfunction

//===========================================================================
function GetPlayerStartLocationY takesplayer whichPlayer returnsreal
    returnGetStartLocationY(GetPlayerStartLocation(whichPlayer))
endfunction

//===========================================================================
function GetPlayerStartLocationLoc takesplayer whichPlayer returnslocation
    returnGetStartLocationLoc(GetPlayerStartLocation(whichPlayer))
endfunction

//===========================================================================
function GetRectCenter takesrect whichRect returnslocation
    returnLocation(GetRectCenterX(whichRect), GetRectCenterY(whichRect))
endfunction

//===========================================================================
function IsPlayerSlotState takesplayer whichPlayer, playerslotstate whichState returnsboolean
    returnGetPlayerSlotState(whichPlayer) == whichState
endfunction

//===========================================================================
function GetFadeFromSeconds takesreal seconds returnsinteger
    if (seconds != 0) then
        return 128 / R2I(seconds)
    endif
    return 10000
endfunction

//===========================================================================
function GetFadeFromSecondsAsReal takesreal seconds returnsreal
    if (seconds != 0) then
        return 128.00 / seconds
    endif
    return 10000.00
endfunction

//===========================================================================
function AdjustPlayerStateSimpleBJ takesplayer whichPlayer, playerstate whichPlayerState, integer delta returnsnothing
    call SetPlayerState(whichPlayer, whichPlayerState, GetPlayerState(whichPlayer, whichPlayerState) + delta)
endfunction

//===========================================================================
function AdjustPlayerStateBJ takesinteger delta, player whichPlayer, playerstate whichPlayerState returnsnothing
    // If the change was positive, apply the difference to the player's
    // gathered resources property as well.
    if (delta > 0) then
        if (whichPlayerState == PLAYER_STATE_RESOURCE_GOLD) then
            call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_GOLD_GATHERED, delta)
        elseif (whichPlayerState == PLAYER_STATE_RESOURCE_LUMBER) then
            call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_LUMBER_GATHERED, delta)
        endif
    endif

    call AdjustPlayerStateSimpleBJ(whichPlayer, whichPlayerState, delta)
endfunction

//===========================================================================
function SetPlayerStateBJ takesplayer whichPlayer, playerstate whichPlayerState, integer value returnsnothing
    local integer oldValue = GetPlayerState(whichPlayer, whichPlayerState)
    call AdjustPlayerStateBJ(value - oldValue, whichPlayer, whichPlayerState)
endfunction

//===========================================================================
function SetPlayerFlagBJ takesplayerstate whichPlayerFlag, boolean flag, player whichPlayer returnsnothing
    call SetPlayerState(whichPlayer, whichPlayerFlag, IntegerTertiaryOp(flag, 1, 0))
endfunction

//===========================================================================
function SetPlayerTaxRateBJ takesinteger rate, playerstate whichResource, player sourcePlayer, player otherPlayer returnsnothing
    call SetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource, rate)
endfunction

//===========================================================================
function GetPlayerTaxRateBJ takesplayerstate whichResource, player sourcePlayer, player otherPlayer returnsinteger
    returnGetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource)
endfunction

//===========================================================================
function IsPlayerFlagSetBJ takesplayerstate whichPlayerFlag, player whichPlayer returnsboolean
    returnGetPlayerState(whichPlayer, whichPlayerFlag) == 1
endfunction

//===========================================================================
function AddResourceAmountBJ takesinteger delta, unit whichUnit returnsnothing
    call AddResourceAmount(whichUnit, delta)
endfunction

//===========================================================================
function GetConvertedPlayerId takesplayer whichPlayer returnsinteger
    returnGetPlayerId(whichPlayer) + 1
endfunction

//===========================================================================
function ConvertedPlayer takesinteger convertedPlayerId returnsplayer
    returnPlayer(convertedPlayerId - 1)
endfunction

//===========================================================================
function GetRectWidthBJ takesrect r returnsreal
    returnGetRectMaxX(r) - GetRectMinX(r)
endfunction

//===========================================================================
function GetRectHeightBJ takesrect r returnsreal
    returnGetRectMaxY(r) - GetRectMinY(r)
endfunction

//===========================================================================
// Replaces a gold mine with a blighted gold mine for the given player.
//
function BlightGoldMineForPlayerBJ takesunit goldMine, player whichPlayer returnsunit
    local real    mineX
    local real    mineY
    local integer mineGold
    local unit    newMine

    // Make sure we're replacing a Gold Mine and not some other type of unit.
    if GetUnitTypeId(goldMine) != 'ngol' then
        returnnull
    endif

    // Save the Gold Mine's properties and remove it.
    set mineX = GetUnitX(goldMine)
    set mineY = GetUnitY(goldMine)
    set mineGold = GetResourceAmount(goldMine)
    call RemoveUnit(goldMine)

    // Create a Haunted Gold Mine to replace the Gold Mine.
    set newMine = CreateBlightedGoldmine(whichPlayer, mineX, mineY, bj_UNIT_FACING)
    call SetResourceAmount(newMine, mineGold)
    returnnewMine
endfunction

//===========================================================================
function BlightGoldMineForPlayer takesunit goldMine, player whichPlayer returnsunit
    set bj_lastHauntedGoldMine = BlightGoldMineForPlayerBJ(goldMine, whichPlayer)
    returnbj_lastHauntedGoldMine
endfunction

//===========================================================================
function GetLastHauntedGoldMine takesnothing returnsunit
    returnbj_lastHauntedGoldMine
endfunction

//===========================================================================
function IsPointBlightedBJ takeslocation where returnsboolean
    returnIsPointBlighted(GetLocationX(where), GetLocationY(where))
endfunction

//===========================================================================
function SetPlayerColorBJEnum takesnothing returnsnothing
    call SetUnitColor(GetEnumUnit(), bj_setPlayerTargetColor)
endfunction

//===========================================================================
function SetPlayerColorBJ takesplayer whichPlayer, playercolor color, boolean changeExisting returnsnothing
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

//===========================================================================
function SetPlayerUnitAvailableBJ takesinteger unitId, boolean allowed, player whichPlayer returnsnothing
    if allowed then
        call SetPlayerTechMaxAllowed(whichPlayer, unitId, -1)
    else
        call SetPlayerTechMaxAllowed(whichPlayer, unitId, 0)
    endif
endfunction

//===========================================================================
function LockGameSpeedBJ takesnothing returnsnothing
    call SetMapFlag(MAP_LOCK_SPEED, true)
endfunction

//===========================================================================
function UnlockGameSpeedBJ takesnothing returnsnothing
    call SetMapFlag(MAP_LOCK_SPEED, false)
endfunction

//===========================================================================
function IssueTargetOrderBJ takesunit whichUnit, string order, widget targetWidget returnsboolean
    returnIssueTargetOrder(whichUnit, order, targetWidget)
endfunction

//===========================================================================
function IssuePointOrderLocBJ takesunit whichUnit, string order, location whichLocation returnsboolean
    returnIssuePointOrderLoc(whichUnit, order, whichLocation)
endfunction

//===========================================================================
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
//
function IssueTargetDestructableOrder takesunit whichUnit, string order, widget targetWidget returnsboolean
    returnIssueTargetOrder(whichUnit, order, targetWidget)
endfunction

function IssueTargetItemOrder takesunit whichUnit, string order, widget targetWidget returnsboolean
    returnIssueTargetOrder(whichUnit, order, targetWidget)
endfunction

//===========================================================================
function IssueImmediateOrderBJ takesunit whichUnit, string order returnsboolean
    returnIssueImmediateOrder(whichUnit, order)
endfunction

//===========================================================================
function GroupTargetOrderBJ takesgroup whichGroup, string order, widget targetWidget returnsboolean
    returnGroupTargetOrder(whichGroup, order, targetWidget)
endfunction

//===========================================================================
function GroupPointOrderLocBJ takesgroup whichGroup, string order, location whichLocation returnsboolean
    returnGroupPointOrderLoc(whichGroup, order, whichLocation)
endfunction

//===========================================================================
function GroupImmediateOrderBJ takesgroup whichGroup, string order returnsboolean
    returnGroupImmediateOrder(whichGroup, order)
endfunction

//===========================================================================
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
//
function GroupTargetDestructableOrder takesgroup whichGroup, string order, widget targetWidget returnsboolean
    returnGroupTargetOrder(whichGroup, order, targetWidget)
endfunction

function GroupTargetItemOrder takesgroup whichGroup, string order, widget targetWidget returnsboolean
    returnGroupTargetOrder(whichGroup, order, targetWidget)
endfunction

//===========================================================================
function GetDyingDestructable takesnothing returnsdestructable
    returnGetTriggerDestructable()
endfunction

//===========================================================================
// Rally point setting
//
function SetUnitRallyPoint takesunit whichUnit, location targPos returnsnothing
    call IssuePointOrderLocBJ(whichUnit, "setrally", targPos)
endfunction

//===========================================================================
function SetUnitRallyUnit takesunit whichUnit, unit targUnit returnsnothing
    call IssueTargetOrder(whichUnit, "setrally", targUnit)
endfunction

//===========================================================================
function SetUnitRallyDestructable takesunit whichUnit, destructable targDest returnsnothing
    call IssueTargetOrder(whichUnit, "setrally", targDest)
endfunction

//===========================================================================
// Utility function for use by editor-generated item drop table triggers.
// This function is added as an action to all destructable drop triggers,
// so that a widget drop may be differentiated from a unit drop.
//
function SaveDyingWidget takesnothing returnsnothing
    set bj_lastDyingWidget = GetTriggerWidget()
endfunction

//===========================================================================
function SetBlightRectBJ takesboolean addBlight, player whichPlayer, rect r returnsnothing
    call SetBlightRect(whichPlayer, r, addBlight)
endfunction

//===========================================================================
function SetBlightRadiusLocBJ takesboolean addBlight, player whichPlayer, location loc, real radius returnsnothing
    call SetBlightLoc(whichPlayer, loc, radius, addBlight)
endfunction

//===========================================================================
function GetAbilityName takesinteger abilcode returnsstring
    returnGetObjectName(abilcode)
endfunction


//***************************************************************************
//*
//*  Melee Template Visibility Settings
//*
//***************************************************************************

//===========================================================================
function MeleeStartingVisibility takesnothing returnsnothing
    // Start by setting the ToD.
    call SetFloatGameState(GAME_STATE_TIME_OF_DAY, bj_MELEE_STARTING_TOD)

    // call FogMaskEnable(true)
    // call FogEnable(true)
endfunction



//***************************************************************************
//*
//*  Melee Template Starting Resources
//*
//***************************************************************************

//===========================================================================
function MeleeStartingResources takesnothing returnsnothing
    local integer index
    local player  indexPlayer
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

    // Set each player's starting resources.
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



//***************************************************************************
//*
//*  Melee Template Hero Limit
//*
//***************************************************************************

//===========================================================================
function ReducePlayerTechMaxAllowed takesplayer whichPlayer, integer techId, integer limit returnsnothing
    local integer oldMax = GetPlayerTechMaxAllowed(whichPlayer, techId)

    // A value of -1 is used to indicate no limit, so check for that as well.
    if (oldMax < 0 or oldMax > limit) then
        call SetPlayerTechMaxAllowed(whichPlayer, techId, limit)
    endif
endfunction

//===========================================================================
function MeleeStartingHeroLimit takesnothing returnsnothing
    local integer index

    set index = 0
    loop
        // max heroes per player
        call SetPlayerMaxHeroesAllowed(bj_MELEE_HERO_LIMIT, Player(index))

        // each player is restricted to a limit per hero type as well
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



//***************************************************************************
//*
//*  Melee Template Granted Hero Items
//*
//***************************************************************************

//===========================================================================
function MeleeTrainedUnitIsHeroBJFilter takesnothing returnsboolean
    returnIsUnitType(GetFilterUnit(), UNIT_TYPE_HERO)
endfunction

//===========================================================================
// The first N heroes trained or hired for each player start off with a
// standard set of items.  This is currently:
//   - 1x Scroll of Town Portal
//
function MeleeGrantItemsToHero takesunit whichUnit returnsnothing
    local integer owner = GetPlayerId(GetOwningPlayer(whichUnit))

    // If we haven't twinked N heroes for this player yet, twink away.
    if (bj_meleeTwinkedHeroes[owner] < bj_MELEE_MAX_TWINKED_HEROES) then
        call UnitAddItemById(whichUnit, 'stwp')
        set bj_meleeTwinkedHeroes[owner] = bj_meleeTwinkedHeroes[owner] + 1
    endif
endfunction

//===========================================================================
function MeleeGrantItemsToTrainedHero takesnothing returnsnothing
    call MeleeGrantItemsToHero(GetTrainedUnit())
endfunction

//===========================================================================
function MeleeGrantItemsToHiredHero takesnothing returnsnothing
    call MeleeGrantItemsToHero(GetSoldUnit())
endfunction

//===========================================================================
function MeleeGrantHeroItems takesnothing returnsnothing
    local integer index
    local trigger trig

    // Initialize the twinked hero counts.
    set index = 0
    loop
        set bj_meleeTwinkedHeroes[index] = 0

        set index = index + 1
        exitwhen index == bj_MAX_PLAYER_SLOTS
    endloop

    // Register for an event whenever a hero is trained, so that we can give
    // him/her their starting items.
    set index = 0
    loop
        set trig = CreateTrigger()
        call TriggerRegisterPlayerUnitEvent(trig, Player(index), EVENT_PLAYER_UNIT_TRAIN_FINISH, filterMeleeTrainedUnitIsHeroBJ)
        call TriggerAddAction(trig, function MeleeGrantItemsToTrainedHero)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    // Register for an event whenever a neutral hero is hired, so that we
    // can give him/her their starting items.
    set trig = CreateTrigger()
    call TriggerRegisterPlayerUnitEvent(trig, Player(PLAYER_NEUTRAL_PASSIVE), EVENT_PLAYER_UNIT_SELL, filterMeleeTrainedUnitIsHeroBJ)
    call TriggerAddAction(trig, function MeleeGrantItemsToHiredHero)

    // Flag that we are giving starting items to heroes, so that the melee
    // starting units code can create them as necessary.
    set bj_meleeGrantHeroItems = true
endfunction



//***************************************************************************
//*
//*  Melee Template Clear Start Locations
//*
//***************************************************************************

//===========================================================================
function MeleeClearExcessUnit takesnothing returnsnothing
    local unit    theUnit = GetEnumUnit()
    local integer owner = GetPlayerId(GetOwningPlayer(theUnit))

    if (owner == PLAYER_NEUTRAL_AGGRESSIVE) then
        // Remove any Neutral Hostile units from the area.
        call RemoveUnit(GetEnumUnit())
    elseif (owner == PLAYER_NEUTRAL_PASSIVE) then
        // Remove non-structure Neutral Passive units from the area.
        if not IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
            call RemoveUnit(GetEnumUnit())
        endif
    endif
endfunction

//===========================================================================
function MeleeClearNearbyUnits takesreal x, real y, real range returnsnothing
    local group nearbyUnits
    
    set nearbyUnits = CreateGroup()
    call GroupEnumUnitsInRange(nearbyUnits, x, y, range, null)
    call ForGroup(nearbyUnits, function MeleeClearExcessUnit)
    call DestroyGroup(nearbyUnits)
endfunction

//===========================================================================
function MeleeClearExcessUnits takesnothing returnsnothing
    local integer index
    local real    locX
    local real    locY
    local player  indexPlayer

    set index = 0
    loop
        set indexPlayer = Player(index)

        // If the player slot is being used, clear any nearby creeps.
        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set locX = GetStartLocationX(GetPlayerStartLocation(indexPlayer))
            set locY = GetStartLocationY(GetPlayerStartLocation(indexPlayer))

            call MeleeClearNearbyUnits(locX, locY, bj_MELEE_CLEAR_UNITS_RADIUS)
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction



//***************************************************************************
//*
//*  Melee Template Starting Units
//*
//***************************************************************************

//===========================================================================
function MeleeEnumFindNearestMine takesnothing returnsnothing
    local unit enumUnit = GetEnumUnit()
    local real dist
    local location unitLoc

    if (GetUnitTypeId(enumUnit) == 'ngol') then
        set unitLoc = GetUnitLoc(enumUnit)
        set dist = DistanceBetweenPoints(unitLoc, bj_meleeNearestMineToLoc)
        call RemoveLocation(unitLoc)

        // If this is our first mine, or the closest thusfar, use it instead.
        if (bj_meleeNearestMineDist < 0) or (dist < bj_meleeNearestMineDist) then
            set bj_meleeNearestMine = enumUnit
            set bj_meleeNearestMineDist = dist
        endif
    endif
endfunction

//===========================================================================
function MeleeFindNearestMine takeslocation src, real range returnsunit
    local group nearbyMines

    set bj_meleeNearestMine = null
    set bj_meleeNearestMineDist = -1
    set bj_meleeNearestMineToLoc = src

    set nearbyMines = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(nearbyMines, src, range, null)
    call ForGroup(nearbyMines, function MeleeEnumFindNearestMine)
    call DestroyGroup(nearbyMines)

    returnbj_meleeNearestMine
endfunction

//===========================================================================
function MeleeRandomHeroLoc takesplayer p, integer id1, integer id2, integer id3, integer id4, location loc returnsunit
    local unit    hero = null
    local integer roll
    local integer pick
    local version v

    // The selection of heroes is dependant on the game version.
    set v = VersionGet()
    if (v == VERSION_REIGN_OF_CHAOS) then
        set roll = GetRandomInt(1, 3)
    else
        set roll = GetRandomInt(1, 4)
    endif

    // Translate the roll into a unitid.
    if roll == 1 then
        set pick = id1
    elseif roll == 2 then
        set pick = id2
    elseif roll == 3 then
        set pick = id3
    elseif roll == 4 then
        set pick = id4
    else
        // Unrecognized id index - pick the first hero in the list.
        set pick = id1
    endif

    // Create the hero.
    set hero = CreateUnitAtLoc(p, pick, loc, bj_UNIT_FACING)
    if bj_meleeGrantHeroItems then
        call MeleeGrantItemsToHero(hero)
    endif
    returnhero
endfunction

//===========================================================================
// Returns a location which is (distance) away from (src) in the direction of (targ).
//
function MeleeGetProjectedLoc takeslocation src, location targ, real distance, real deltaAngle returnslocation
    local real srcX = GetLocationX(src)
    local real srcY = GetLocationY(src)
    local real direction = Atan2(GetLocationY(targ) - srcY, GetLocationX(targ) - srcX) + deltaAngle
    returnLocation(srcX + distance * Cos(direction), srcY + distance * Sin(direction))
endfunction

//===========================================================================
function MeleeGetNearestValueWithin takesreal val, real minVal, real maxVal returnsreal
    if (val < minVal) then
        returnminVal
    elseif (val > maxVal) then
        returnmaxVal
    else
        returnval
    endif
endfunction

//===========================================================================
function MeleeGetLocWithinRect takeslocation src, rect r returnslocation
    local real withinX = MeleeGetNearestValueWithin(GetLocationX(src), GetRectMinX(r), GetRectMaxX(r))
    local real withinY = MeleeGetNearestValueWithin(GetLocationY(src), GetRectMinY(r), GetRectMaxY(r))
    returnLocation(withinX, withinY)
endfunction

//===========================================================================
// Starting Units for Human Players
//   - 1 Town Hall, placed at start location
//   - 5 Peasants, placed between start location and nearest gold mine
//
function MeleeStartingUnitsHuman takesplayer whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returnsnothing
    local boolean  useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real     unitSpacing = 64.00
    local unit     nearestMine
    local location nearMineLoc
    local location heroLoc
    local real     peonX
    local real     peonY
    local unit     townHall = null

    if (doPreload) then
        call Preloader("scripts\\HumanMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if (nearestMine != null) then
        // Spawn Town Hall at the start location.
        set townHall = CreateUnitAtLoc(whichPlayer, 'htow', startLoc, bj_UNIT_FACING)
        
        // Spawn Peasants near the mine.
        set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
        set peonX = GetLocationX(nearMineLoc)
        set peonY = GetLocationY(nearMineLoc)
        call CreateUnit(whichPlayer, 'hpea', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX + 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX - 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be off to the side of the start location.
        set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
    else
        // Spawn Town Hall at the start location.
        set townHall = CreateUnitAtLoc(whichPlayer, 'htow', startLoc, bj_UNIT_FACING)
        
        // Spawn Peasants directly south of the town hall.
        set peonX = GetLocationX(startLoc)
        set peonY = GetLocationY(startLoc) - 224.00
        call CreateUnit(whichPlayer, 'hpea', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'hpea', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be just south of the start location.
        set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
    endif

    if (townHall != null) then
        call UnitAddAbilityBJ('Amic', townHall)
        call UnitMakeAbilityPermanentBJ(true, 'Amic', townHall)
    endif

    if (doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Hamg', 'Hmkg', 'Hpal', 'Hblm', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if (doCamera) then
        // Center the camera on the initial Peasants.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction

//===========================================================================
// Starting Units for Orc Players
//   - 1 Great Hall, placed at start location
//   - 5 Peons, placed between start location and nearest gold mine
//
function MeleeStartingUnitsOrc takesplayer whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returnsnothing
    local boolean  useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real     unitSpacing = 64.00
    local unit     nearestMine
    local location nearMineLoc
    local location heroLoc
    local real     peonX
    local real     peonY

    if (doPreload) then
        call Preloader("scripts\\OrcMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if (nearestMine != null) then
        // Spawn Great Hall at the start location.
        call CreateUnitAtLoc(whichPlayer, 'ogre', startLoc, bj_UNIT_FACING)
        
        // Spawn Peons near the mine.
        set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
        set peonX = GetLocationX(nearMineLoc)
        set peonY = GetLocationY(nearMineLoc)
        call CreateUnit(whichPlayer, 'opeo', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX + 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX - 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be off to the side of the start location.
        set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
    else
        // Spawn Great Hall at the start location.
        call CreateUnitAtLoc(whichPlayer, 'ogre', startLoc, bj_UNIT_FACING)
        
        // Spawn Peons directly south of the town hall.
        set peonX = GetLocationX(startLoc)
        set peonY = GetLocationY(startLoc) - 224.00
        call CreateUnit(whichPlayer, 'opeo', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'opeo', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be just south of the start location.
        set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
    endif

    if (doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Obla', 'Ofar', 'Otch', 'Oshd', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if (doCamera) then
        // Center the camera on the initial Peons.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction

//===========================================================================
// Starting Units for Undead Players
//   - 1 Necropolis, placed at start location
//   - 1 Haunted Gold Mine, placed on nearest gold mine
//   - 3 Acolytes, placed between start location and nearest gold mine
//   - 1 Ghoul, placed between start location and nearest gold mine
//   - Blight, centered on nearest gold mine, spread across a "large area"
//
function MeleeStartingUnitsUndead takesplayer whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returnsnothing
    local boolean  useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real     unitSpacing = 64.00
    local unit     nearestMine
    local location nearMineLoc
    local location nearTownLoc
    local location heroLoc
    local real     peonX
    local real     peonY
    local real     ghoulX
    local real     ghoulY

    if (doPreload) then
        call Preloader("scripts\\UndeadMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if (nearestMine != null) then
        // Spawn Necropolis at the start location.
        call CreateUnitAtLoc(whichPlayer, 'unpl', startLoc, bj_UNIT_FACING)
        
        // Replace the nearest gold mine with a blighted version.
        set nearestMine = BlightGoldMineForPlayerBJ(nearestMine, whichPlayer)

        // Spawn Ghoul near the Necropolis.
        set nearTownLoc = MeleeGetProjectedLoc(startLoc, GetUnitLoc(nearestMine), 288, 0)
        set ghoulX = GetLocationX(nearTownLoc)
        set ghoulY = GetLocationY(nearTownLoc)
        set bj_ghoul[GetPlayerId(whichPlayer)] = CreateUnit(whichPlayer, 'ugho', ghoulX + 0.00 * unitSpacing, ghoulY + 0.00 * unitSpacing, bj_UNIT_FACING)

        // Spawn Acolytes near the mine.
        set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
        set peonX = GetLocationX(nearMineLoc)
        set peonY = GetLocationY(nearMineLoc)
        call CreateUnit(whichPlayer, 'uaco', peonX + 0.00 * unitSpacing, peonY + 0.50 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'uaco', peonX + 0.65 * unitSpacing, peonY - 0.50 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'uaco', peonX - 0.65 * unitSpacing, peonY - 0.50 * unitSpacing, bj_UNIT_FACING)

        // Create a patch of blight around the gold mine.
        call SetBlightLoc(whichPlayer, nearMineLoc, 768, true)

        // Set random hero spawn point to be off to the side of the start location.
        set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
    else
        // Spawn Necropolis at the start location.
        call CreateUnitAtLoc(whichPlayer, 'unpl', startLoc, bj_UNIT_FACING)
        
        // Spawn Acolytes and Ghoul directly south of the Necropolis.
        set peonX = GetLocationX(startLoc)
        set peonY = GetLocationY(startLoc) - 224.00
        call CreateUnit(whichPlayer, 'uaco', peonX - 1.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'uaco', peonX - 0.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'uaco', peonX + 0.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ugho', peonX + 1.50 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

        // Create a patch of blight around the start location.
        call SetBlightLoc(whichPlayer, startLoc, 768, true)

        // Set random hero spawn point to be just south of the start location.
        set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
    endif

    if (doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Udea', 'Udre', 'Ulic', 'Ucrl', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if (doCamera) then
        // Center the camera on the initial Acolytes.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction

//===========================================================================
// Starting Units for Night Elf Players
//   - 1 Tree of Life, placed by nearest gold mine, already entangled
//   - 5 Wisps, placed between Tree of Life and nearest gold mine
//
function MeleeStartingUnitsNightElf takesplayer whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returnsnothing
    local boolean  useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real     unitSpacing = 64.00
    local real     minTreeDist = 3.50 * bj_CELLWIDTH
    local real     minWispDist = 1.75 * bj_CELLWIDTH
    local unit     nearestMine
    local location nearMineLoc
    local location wispLoc
    local location heroLoc
    local real     peonX
    local real     peonY
    local unit     tree

    if (doPreload) then
        call Preloader("scripts\\NightElfMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if (nearestMine != null) then
        // Spawn Tree of Life near the mine and have it entangle the mine.
        // Project the Tree's coordinates from the gold mine, and then snap
        // the X and Y values to within minTreeDist of the Gold Mine.
        set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 650, 0)
        set nearMineLoc = MeleeGetLocWithinRect(nearMineLoc, GetRectFromCircleBJ(GetUnitLoc(nearestMine), minTreeDist))
        set tree = CreateUnitAtLoc(whichPlayer, 'etol', nearMineLoc, bj_UNIT_FACING)
        call IssueTargetOrder(tree, "entangleinstant", nearestMine)

        // Spawn Wisps at the start location.
        set wispLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)
        set wispLoc = MeleeGetLocWithinRect(wispLoc, GetRectFromCircleBJ(GetUnitLoc(nearestMine), minWispDist))
        set peonX = GetLocationX(wispLoc)
        set peonY = GetLocationY(wispLoc)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 0.58 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX - 0.58 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be off to the side of the start location.
        set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)
    else
        // Spawn Tree of Life at the start location.
        call CreateUnitAtLoc(whichPlayer, 'etol', startLoc, bj_UNIT_FACING)

        // Spawn Wisps directly south of the town hall.
        set peonX = GetLocationX(startLoc)
        set peonY = GetLocationY(startLoc) - 224.00
        call CreateUnit(whichPlayer, 'ewsp', peonX - 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX - 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 0.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 1.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)
        call CreateUnit(whichPlayer, 'ewsp', peonX + 2.00 * unitSpacing, peonY + 0.00 * unitSpacing, bj_UNIT_FACING)

        // Set random hero spawn point to be just south of the start location.
        set heroLoc = Location(peonX, peonY - 2.00 * unitSpacing)
    endif

    if (doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Edem', 'Ekee', 'Emoo', 'Ewar', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if (doCamera) then
        // Center the camera on the initial Wisps.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction

//===========================================================================
// Starting Units for Players Whose Race is Unknown
//   - 12 Sheep, placed randomly around the start location
//
function MeleeStartingUnitsUnknownRace takesplayer whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returnsnothing
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
        // Give them a "free hero" token, out of pity.
        call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
    endif

    if (doCamera) then
        // Center the camera on the initial sheep.
        call SetCameraPositionLocForPlayer(whichPlayer, startLoc)
        call SetCameraQuickPositionLocForPlayer(whichPlayer, startLoc)
    endif
endfunction

//===========================================================================
function MeleeStartingUnits takesnothing returnsnothing
    local integer  index
    local player   indexPlayer
    local location indexStartLoc
    local race     indexRace

    call Preloader("scripts\\SharedMelee.pld")

    set index = 0
    loop
        set indexPlayer = Player(index)
        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set indexStartLoc = GetStartLocationLoc(GetPlayerStartLocation(indexPlayer))
            set indexRace = GetPlayerRace(indexPlayer)

            // Create initial race-specific starting units
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

//===========================================================================
function MeleeStartingUnitsForPlayer takesrace whichRace, player whichPlayer, location loc, boolean doHeroes returnsnothing
    // Create initial race-specific starting units
    if (whichRace == RACE_HUMAN) then
        call MeleeStartingUnitsHuman(whichPlayer, loc, doHeroes, false, false)
    elseif (whichRace == RACE_ORC) then
        call MeleeStartingUnitsOrc(whichPlayer, loc, doHeroes, false, false)
    elseif (whichRace == RACE_UNDEAD) then
        call MeleeStartingUnitsUndead(whichPlayer, loc, doHeroes, false, false)
    elseif (whichRace == RACE_NIGHTELF) then
        call MeleeStartingUnitsNightElf(whichPlayer, loc, doHeroes, false, false)
    else
        // Unrecognized race - ignore the request.
    endif
endfunction



//***************************************************************************
//*
//*  Melee Template Starting AI Scripts
//*
//***************************************************************************

//===========================================================================
function PickMeleeAI takesplayer num, string s1, string s2, string s3 returnsnothing
    local integer pick

    // easy difficulty never uses any custom AI scripts
    // that are designed to be a bit more challenging
    //
    if GetAIDifficulty(num) == AI_DIFFICULTY_NEWBIE then
        call StartMeleeAI(num, s1)
        return
    endif

    if s2 == null then
        set pick = 1
    elseif s3 == null then
        set pick = GetRandomInt(1, 2)
    else
        set pick = GetRandomInt(1, 3)
    endif

    if pick == 1 then
        call StartMeleeAI(num, s1)
    elseif pick == 2 then
        call StartMeleeAI(num, s2)
    else
        call StartMeleeAI(num, s3)
    endif
endfunction

//===========================================================================
function MeleeStartingAI takesnothing returnsnothing
    local integer index
    local player  indexPlayer
    local race    indexRace

    set index = 0
    loop
        set indexPlayer = Player(index)
        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set indexRace = GetPlayerRace(indexPlayer)
            if (GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
                // Run a race-specific melee AI script.
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
                    // Unrecognized race.
                endif
                call ShareEverythingWithTeamAI(indexPlayer)
            endif
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction

function LockGuardPosition takesunit targ returnsnothing
    call SetUnitCreepGuard(targ, true)
endfunction


//***************************************************************************
//*
//*  Melee Template Victory / Defeat Conditions
//*
//***************************************************************************

//===========================================================================
function MeleePlayerIsOpponent takesinteger playerIndex, integer opponentIndex returnsboolean
    local player thePlayer = Player(playerIndex)
    local player theOpponent = Player(opponentIndex)

    // The player himself is not an opponent.
    if (playerIndex == opponentIndex) then
        returnfalse
    endif

    // Unused player slots are not opponents.
    if (GetPlayerSlotState(theOpponent) != PLAYER_SLOT_STATE_PLAYING) then
        returnfalse
    endif

    // Players who are already defeated are not opponents.
    if (bj_meleeDefeated[opponentIndex]) then
        returnfalse
    endif

    // Allied players with allied victory set are not opponents.
    if GetPlayerAlliance(thePlayer, theOpponent, ALLIANCE_PASSIVE) then
        if GetPlayerAlliance(theOpponent, thePlayer, ALLIANCE_PASSIVE) then
            if (GetPlayerState(thePlayer, PLAYER_STATE_ALLIED_VICTORY) == 1) then
                if (GetPlayerState(theOpponent, PLAYER_STATE_ALLIED_VICTORY) == 1) then
                    returnfalse
                endif
            endif
        endif
    endif

    returntrue
endfunction

//===========================================================================
// Count buildings currently owned by all allies, including the player themself.
//
function MeleeGetAllyStructureCount takesplayer whichPlayer returnsinteger
    local integer    playerIndex
    local integer    buildingCount
    local player     indexPlayer

    // Count the number of buildings controlled by all not-yet-defeated co-allies.
    set buildingCount = 0
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        // uncomment to cause defeat even if you have control of ally structures, but yours have been nixed
        //if (PlayersAreCoAllied(whichPlayer, indexPlayer) and not bj_meleeDefeated[playerIndex]) then
        if (PlayersAreCoAllied(whichPlayer, indexPlayer)) then
            set buildingCount = buildingCount + GetPlayerStructureCount(indexPlayer, true)
        endif
            
        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    returnbuildingCount
endfunction

//===========================================================================
// Count allies, excluding dead players and the player themself.
//
function MeleeGetAllyCount takesplayer whichPlayer returnsinteger
    local integer playerIndex
    local integer playerCount
    local player  indexPlayer

    // Count the number of not-yet-defeated co-allies.
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

    returnplayerCount
endfunction

//===========================================================================
// Counts key structures owned by a player and his or her allies, including
// structures currently upgrading or under construction.
//
// Key structures: Town Hall, Great Hall, Tree of Life, Necropolis
//
function MeleeGetAllyKeyStructureCount takesplayer whichPlayer returnsinteger
    local integer    playerIndex
    local player     indexPlayer
    local integer    keyStructs

    // Count the number of buildings controlled by all not-yet-defeated co-allies.
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

    returnkeyStructs
endfunction

//===========================================================================
// Enum: Draw out a specific player.
//
function MeleeDoDrawEnum takesnothing returnsnothing
    local player thePlayer = GetEnumPlayer()

    call CachePlayerHeroData(thePlayer)
    call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_TIE, false)
endfunction

//===========================================================================
// Enum: Victory out a specific player.
//
function MeleeDoVictoryEnum takesnothing returnsnothing
    local player thePlayer = GetEnumPlayer()
    local integer playerIndex = GetPlayerId(thePlayer)

    if (not bj_meleeVictoried[playerIndex]) then
        set bj_meleeVictoried[playerIndex] = true
        call CachePlayerHeroData(thePlayer)
        call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_VICTORY, false)
    endif
endfunction

//===========================================================================
// Defeat out a specific player.
//
function MeleeDoDefeat takesplayer whichPlayer returnsnothing
    set bj_meleeDefeated[GetPlayerId(whichPlayer)] = true
    call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, false)
endfunction

//===========================================================================
// Enum: Defeat out a specific player.
//
function MeleeDoDefeatEnum takesnothing returnsnothing
    local player thePlayer = GetEnumPlayer()

    // needs to happen before ownership change
    call CachePlayerHeroData(thePlayer)
    call MakeUnitsPassiveForTeam(thePlayer)
    call MeleeDoDefeat(thePlayer)
endfunction

//===========================================================================
// A specific player left the game.
//
function MeleeDoLeave takesplayer whichPlayer returnsnothing
    if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
        call GameOverDialogBJ(whichPlayer, true)
    else
        set bj_meleeDefeated[GetPlayerId(whichPlayer)] = true
        call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, true)
    endif
endfunction

//===========================================================================
// Remove all observers
// 
function MeleeRemoveObservers takesnothing returnsnothing
    local integer    playerIndex
    local player     indexPlayer

    // Give all observers the game over dialog
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

//===========================================================================
// Test all players to determine if a team has won.  For a team to win, all
// remaining (read: undefeated) players need to be co-allied with all other
// remaining players.  If even one player is not allied towards another,
// everyone must be denied victory.
//
function MeleeCheckForVictors takesnothing returnsforce
    local integer    playerIndex
    local integer    opponentIndex
    local force      opponentlessPlayers = CreateForce()
    local boolean    gameOver = false

    // Check to see if any players have opponents remaining.
    set playerIndex = 0
    loop
        if (not bj_meleeDefeated[playerIndex]) then
            // Determine whether or not this player has any remaining opponents.
            set opponentIndex = 0
            loop
                // If anyone has an opponent, noone can be victorious yet.
                if MeleePlayerIsOpponent(playerIndex, opponentIndex) then
                    returnCreateForce()
                endif

                set opponentIndex = opponentIndex + 1
                exitwhen opponentIndex == bj_MAX_PLAYERS
            endloop

            // Keep track of each opponentless player so that we can give
            // them a victory later.
            call ForceAddPlayer(opponentlessPlayers, Player(playerIndex))
            set gameOver = true
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    // Set the game over global flag
    set bj_meleeGameOver = gameOver

    returnopponentlessPlayers
endfunction

//===========================================================================
// Test each player to determine if anyone has been defeated.
//
function MeleeCheckForLosersAndVictors takesnothing returnsnothing
    local integer    playerIndex
    local player     indexPlayer
    local force      defeatedPlayers = CreateForce()
    local force      victoriousPlayers
    local boolean    gameOver = false

    // If the game is already over, do nothing
    if (bj_meleeGameOver) then
        return
    endif

    // If the game was disconnected then it is over, in this case we
    // don't want to report results for anyone as they will most likely
    // conflict with the actual game results
    if (GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
        set bj_meleeGameOver = true
        return
    endif

    // Check each player to see if he or she has been defeated yet.
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        if (not bj_meleeDefeated[playerIndex] and not bj_meleeVictoried[playerIndex]) then
            //call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, "Player"+I2S(playerIndex)+" has "+I2S(MeleeGetAllyStructureCount(indexPlayer))+" ally buildings.")
            if (MeleeGetAllyStructureCount(indexPlayer) <= 0) then

                // Keep track of each defeated player so that we can give
                // them a defeat later.
                call ForceAddPlayer(defeatedPlayers, Player(playerIndex))

                // Set their defeated flag now so MeleeCheckForVictors
                // can detect victors.
                set bj_meleeDefeated[playerIndex] = true
            endif
        endif
            
        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    // Now that the defeated flags are set, check if there are any victors
    set victoriousPlayers = MeleeCheckForVictors()

    // Defeat all defeated players
    call ForForce(defeatedPlayers, function MeleeDoDefeatEnum)

    // Give victory to all victorious players
    call ForForce(victoriousPlayers, function MeleeDoVictoryEnum)

    // If the game is over we should remove all observers
    if (bj_meleeGameOver) then
        call MeleeRemoveObservers()
    endif
endfunction

//===========================================================================
// Returns a race-specific "build X or be revealed" message.
//
function MeleeGetCrippledWarningMessage takesplayer whichPlayer returnsstring
    local race r = GetPlayerRace(whichPlayer)

    if (r == RACE_HUMAN) then
        returnGetLocalizedString("CRIPPLE_WARNING_HUMAN")
    elseif (r == RACE_ORC) then
        returnGetLocalizedString("CRIPPLE_WARNING_ORC")
    elseif (r == RACE_NIGHTELF) then
        returnGetLocalizedString("CRIPPLE_WARNING_NIGHTELF")
    elseif (r == RACE_UNDEAD) then
        returnGetLocalizedString("CRIPPLE_WARNING_UNDEAD")
    else
        // Unrecognized Race
        return ""
    endif
endfunction

//===========================================================================
// Returns a race-specific "build X" label for cripple timers.
//
function MeleeGetCrippledTimerMessage takesplayer whichPlayer returnsstring
    local race r = GetPlayerRace(whichPlayer)

    if (r == RACE_HUMAN) then
        returnGetLocalizedString("CRIPPLE_TIMER_HUMAN")
    elseif (r == RACE_ORC) then
        returnGetLocalizedString("CRIPPLE_TIMER_ORC")
    elseif (r == RACE_NIGHTELF) then
        returnGetLocalizedString("CRIPPLE_TIMER_NIGHTELF")
    elseif (r == RACE_UNDEAD) then
        returnGetLocalizedString("CRIPPLE_TIMER_UNDEAD")
    else
        // Unrecognized Race
        return ""
    endif
endfunction

//===========================================================================
// Returns a race-specific "build X" label for cripple timers.
//
function MeleeGetCrippledRevealedMessage takesplayer whichPlayer returnsstring
    returnGetLocalizedString("CRIPPLE_REVEALING_PREFIX") + GetPlayerName(whichPlayer) + GetLocalizedString("CRIPPLE_REVEALING_POSTFIX")
endfunction

//===========================================================================
function MeleeExposePlayer takesplayer whichPlayer, boolean expose returnsnothing
    local integer playerIndex
    local player  indexPlayer
    local force   toExposeTo = CreateForce()

    call CripplePlayer(whichPlayer, toExposeTo, false)

    set bj_playerIsExposed[GetPlayerId(whichPlayer)] = expose
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if (not PlayersAreCoAllied(whichPlayer, indexPlayer)) then
            call ForceAddPlayer(toExposeTo, indexPlayer)
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    call CripplePlayer(whichPlayer, toExposeTo, expose)
    call DestroyForce(toExposeTo)
endfunction

//===========================================================================
function MeleeExposeAllPlayers takesnothing returnsnothing
    local integer playerIndex
    local player  indexPlayer
    local integer playerIndex2
    local player  indexPlayer2
    local force   toExposeTo = CreateForce()

    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        call ForceClear(toExposeTo)
        call CripplePlayer(indexPlayer, toExposeTo, false)

        set playerIndex2 = 0
        loop
            set indexPlayer2 = Player(playerIndex2)

            if playerIndex != playerIndex2 then
                if (not PlayersAreCoAllied(indexPlayer, indexPlayer2)) then
                    call ForceAddPlayer(toExposeTo, indexPlayer2)
                endif
            endif

            set playerIndex2 = playerIndex2 + 1
            exitwhen playerIndex2 == bj_MAX_PLAYERS
        endloop

        call CripplePlayer(indexPlayer, toExposeTo, true)

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    call DestroyForce(toExposeTo)
endfunction

//===========================================================================
function MeleeCrippledPlayerTimeout takesnothing returnsnothing
    local timer expiredTimer = GetExpiredTimer()
    local integer playerIndex
    local player  exposedPlayer

    // Determine which player's timer expired.
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
        // Use only local code (no net traffic) within this block to avoid desyncs.

        // Hide the timer window for this player.
        call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)
    endif

    // Display a text message to all players, explaining the exposure.
    call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledRevealedMessage(exposedPlayer))

    // Expose the player.
    call MeleeExposePlayer(exposedPlayer, true)
endfunction

//===========================================================================
function MeleePlayerIsCrippled takesplayer whichPlayer returnsboolean
    local integer allyStructures = MeleeGetAllyStructureCount(whichPlayer)
    local integer allyKeyStructures = MeleeGetAllyKeyStructureCount(whichPlayer)

    // Dead teams are not considered to be crippled.
    return (allyStructures > 0) and (allyKeyStructures <= 0)
endfunction

//===========================================================================
// Test each player to determine if anyone has become crippled.
//
function MeleeCheckForCrippledPlayers takesnothing returnsnothing
    local integer    playerIndex
    local player     indexPlayer
    local force      crippledPlayers = CreateForce()
    local boolean    isNowCrippled
    local race       indexRace

    // The "finish soon" exposure of all players overrides any "crippled" exposure
    if bj_finishSoonAllExposed then
        return
    endif

    // Check each player to see if he or she has been crippled or uncrippled.
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        set isNowCrippled = MeleePlayerIsCrippled(indexPlayer)

        if (not bj_playerIsCrippled[playerIndex] and isNowCrippled) then

            // Player became crippled; start their cripple timer.
            set bj_playerIsCrippled[playerIndex] = true
            call TimerStart(bj_crippledTimer[playerIndex], bj_MELEE_CRIPPLE_TIMEOUT, false, function MeleeCrippledPlayerTimeout)

            if (GetLocalPlayer() == indexPlayer) then
                // Use only local code (no net traffic) within this block to avoid desyncs.

                // Show the timer window.
                call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], true)

                // Display a warning message.
                call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledWarningMessage(indexPlayer))
            endif

        elseif (bj_playerIsCrippled[playerIndex] and not isNowCrippled) then

            // Player became uncrippled; stop their cripple timer.
            set bj_playerIsCrippled[playerIndex] = false
            call PauseTimer(bj_crippledTimer[playerIndex])

            if (GetLocalPlayer() == indexPlayer) then
                // Use only local code (no net traffic) within this block to avoid desyncs.

                // Hide the timer window for this player.
                call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)

                // Display a confirmation message if the player's team is still alive.
                if (MeleeGetAllyStructureCount(indexPlayer) > 0) then
                    if (bj_playerIsExposed[playerIndex]) then
                        call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, GetLocalizedString("CRIPPLE_UNREVEALED"))
                    else
                        call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, GetLocalizedString("CRIPPLE_UNCRIPPLED"))
                    endif
                endif
            endif

            // If the player granted shared vision, deny that vision now.
            call MeleeExposePlayer(indexPlayer, false)

        endif
            
        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop
endfunction

//===========================================================================
// Determine if the lost unit should result in any defeats or victories.
//
function MeleeCheckLostUnit takesunit lostUnit returnsnothing
    local player lostUnitOwner = GetOwningPlayer(lostUnit)

    // We only need to check for mortality if this was the last building.
    if (GetPlayerStructureCount(lostUnitOwner, true) <= 0) then
        call MeleeCheckForLosersAndVictors()
    endif

    // Check if the lost unit has crippled or uncrippled the player.
    // (A team with 0 units is dead, and thus considered uncrippled.)
    call MeleeCheckForCrippledPlayers()
endfunction

//===========================================================================
// Determine if the gained unit should result in any defeats, victories,
// or cripple-status changes.
//
function MeleeCheckAddedUnit takesunit addedUnit returnsnothing
    local player addedUnitOwner = GetOwningPlayer(addedUnit)

    // If the player was crippled, this unit may have uncrippled him/her.
    if (bj_playerIsCrippled[GetPlayerId(addedUnitOwner)]) then
        call MeleeCheckForCrippledPlayers()
    endif
endfunction

//===========================================================================
function MeleeTriggerActionConstructCancel takesnothing returnsnothing
    call MeleeCheckLostUnit(GetCancelledStructure())
endfunction

//===========================================================================
function MeleeTriggerActionUnitDeath takesnothing returnsnothing
    if (IsUnitType(GetDyingUnit(), UNIT_TYPE_STRUCTURE)) then
        call MeleeCheckLostUnit(GetDyingUnit())
    endif
endfunction

//===========================================================================
function MeleeTriggerActionUnitConstructionStart takesnothing returnsnothing
    call MeleeCheckAddedUnit(GetConstructingStructure())
endfunction

//===========================================================================
function MeleeTriggerActionPlayerDefeated takesnothing returnsnothing
    local player thePlayer = GetTriggerPlayer()
    call CachePlayerHeroData(thePlayer)

    if (MeleeGetAllyCount(thePlayer) > 0) then
        // If at least one ally is still alive and kicking, share units with
        // them and proceed with death.
        call ShareEverythingWithTeam(thePlayer)
        if (not bj_meleeDefeated[GetPlayerId(thePlayer)]) then
            call MeleeDoDefeat(thePlayer)
        endif
    else
        // If no living allies remain, swap all units and buildings over to
        // neutral_passive and proceed with death.
        call MakeUnitsPassiveForTeam(thePlayer)
        if (not bj_meleeDefeated[GetPlayerId(thePlayer)]) then
            call MeleeDoDefeat(thePlayer)
        endif
    endif
    call MeleeCheckForLosersAndVictors()
endfunction

//===========================================================================
function MeleeTriggerActionPlayerLeft takesnothing returnsnothing
    local player thePlayer = GetTriggerPlayer()

    // Just show game over for observers when they leave
    if (IsPlayerObserver(thePlayer)) then
        call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_NEUTRAL, false)
        return
    endif

    call CachePlayerHeroData(thePlayer)

    // This is the same as defeat except the player generates the message 
    // "player left the game" as opposed to "player was defeated".

    if (MeleeGetAllyCount(thePlayer) > 0) then
        // If at least one ally is still alive and kicking, share units with
        // them and proceed with death.
        call ShareEverythingWithTeam(thePlayer)
        call MeleeDoLeave(thePlayer)
    else
        // If no living allies remain, swap all units and buildings over to
        // neutral_passive and proceed with death.
        call MakeUnitsPassiveForTeam(thePlayer)
        call MeleeDoLeave(thePlayer)
    endif
    call MeleeCheckForLosersAndVictors()
endfunction

//===========================================================================
function MeleeTriggerActionAllianceChange takesnothing returnsnothing
    call MeleeCheckForLosersAndVictors()
    call MeleeCheckForCrippledPlayers()
endfunction

//===========================================================================
function MeleeTriggerTournamentFinishSoon takesnothing returnsnothing
    // Note: We may get this trigger multiple times
    local integer    playerIndex
    local player     indexPlayer
    local real       timeRemaining = GetTournamentFinishSoonTimeRemaining()

    if not bj_finishSoonAllExposed then
        set bj_finishSoonAllExposed = true

        // Reset all crippled players and their timers, and hide the local crippled timer dialog
        set playerIndex = 0
        loop
            set indexPlayer = Player(playerIndex)
            if bj_playerIsCrippled[playerIndex] then
                // Uncripple the player
                set bj_playerIsCrippled[playerIndex] = false
                call PauseTimer(bj_crippledTimer[playerIndex])

                if (GetLocalPlayer() == indexPlayer) then
                    // Use only local code (no net traffic) within this block to avoid desyncs.

                    // Hide the timer window.
                    call TimerDialogDisplay(bj_crippledTimerWindows[playerIndex], false)
                endif

            endif
            set playerIndex = playerIndex + 1
            exitwhen playerIndex == bj_MAX_PLAYERS
        endloop

        // Expose all players
        call MeleeExposeAllPlayers()
    endif

    // Show the "finish soon" timer dialog and set the real time remaining
    call TimerDialogDisplay(bj_finishSoonTimerDialog, true)
    call TimerDialogSetRealTimeRemaining(bj_finishSoonTimerDialog, timeRemaining)
endfunction


//===========================================================================
function MeleeWasUserPlayer takesplayer whichPlayer returnsboolean
    local playerslotstate slotState

    if (GetPlayerController(whichPlayer) != MAP_CONTROL_USER) then
        returnfalse
    endif

    set slotState = GetPlayerSlotState(whichPlayer)

    return (slotState == PLAYER_SLOT_STATE_PLAYING or slotState == PLAYER_SLOT_STATE_LEFT)
endfunction

//===========================================================================
function MeleeTournamentFinishNowRuleA takesinteger multiplier returnsnothing
    local integer array playerScore
    local integer array teamScore
    local force array   teamForce
    local integer       teamCount
    local integer       index
    local player        indexPlayer
    local integer       index2
    local player        indexPlayer2
    local integer       bestTeam
    local integer       bestScore
    local boolean       draw

    // Compute individual player scores
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

    // Compute team scores and team forces
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

    // The game is now over
    set bj_meleeGameOver = true

    // There should always be at least one team, but continue to work if not
    if teamCount != 0 then

        // Find best team score
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

        // Check whether the best team's score is 'multiplier' times better than
        // every other team. In the case of multiplier == 1 and exactly equal team
        // scores, the first team (which was randomly chosen by the server) will win.
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
            // Give draw to all players on all teams
            set index = 0
            loop
                call ForForce(teamForce[index], function MeleeDoDrawEnum)

                set index = index + 1
                exitwhen index == teamCount
            endloop
        else
            // Give defeat to all players on teams other than the best team
            set index = 0
            loop
                if index != bestTeam then
                    call ForForce(teamForce[index], function MeleeDoDefeatEnum)
                endif

                set index = index + 1
                exitwhen index == teamCount
            endloop

            // Give victory to all players on the best team
            call ForForce(teamForce[bestTeam], function MeleeDoVictoryEnum)
        endif
    endif

endfunction

//===========================================================================
function MeleeTriggerTournamentFinishNow takesnothing returnsnothing
    local integer rule = GetTournamentFinishNowRule()

    // If the game is already over, do nothing
    if bj_meleeGameOver then
        return
    endif

    if (rule == 1) then
        // Finals games
        call MeleeTournamentFinishNowRuleA(1)
    else
        // Preliminary games
        call MeleeTournamentFinishNowRuleA(3)
    endif

    // Since the game is over we should remove all observers
    call MeleeRemoveObservers()

endfunction

//===========================================================================
function MeleeInitVictoryDefeat takesnothing returnsnothing
    local trigger    trig
    local integer    index
    local player     indexPlayer

    // Create a timer window for the "finish soon" timeout period, it has no timer
    // because it is driven by real time (outside of the game state to avoid desyncs)
    set bj_finishSoonTimerDialog = CreateTimerDialog(null)

    // Set a trigger to fire when we receive a "finish soon" game event
    set trig = CreateTrigger()
    call TriggerRegisterGameEvent(trig, EVENT_GAME_TOURNAMENT_FINISH_SOON)
    call TriggerAddAction(trig, function MeleeTriggerTournamentFinishSoon)

    // Set a trigger to fire when we receive a "finish now" game event
    set trig = CreateTrigger()
    call TriggerRegisterGameEvent(trig, EVENT_GAME_TOURNAMENT_FINISH_NOW)
    call TriggerAddAction(trig, function MeleeTriggerTournamentFinishNow)

    // Set up each player's mortality code.
    set index = 0
    loop
        set indexPlayer = Player(index)

        // Make sure this player slot is playing.
        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set bj_meleeDefeated[index] = false
            set bj_meleeVictoried[index] = false

            // Create a timer and timer window in case the player is crippled.
            set bj_playerIsCrippled[index] = false
            set bj_playerIsExposed[index] = false
            set bj_crippledTimer[index] = CreateTimer()
            set bj_crippledTimerWindows[index] = CreateTimerDialog(bj_crippledTimer[index])
            call TimerDialogSetTitle(bj_crippledTimerWindows[index], MeleeGetCrippledTimerMessage(indexPlayer))

            // Set a trigger to fire whenever a building is cancelled for this player.
            set trig = CreateTrigger()
            call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_CONSTRUCT_CANCEL, null)
            call TriggerAddAction(trig, function MeleeTriggerActionConstructCancel)

            // Set a trigger to fire whenever a unit dies for this player.
            set trig = CreateTrigger()
            call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_DEATH, null)
            call TriggerAddAction(trig, function MeleeTriggerActionUnitDeath)

            // Set a trigger to fire whenever a unit begins construction for this player
            set trig = CreateTrigger()
            call TriggerRegisterPlayerUnitEvent(trig, indexPlayer, EVENT_PLAYER_UNIT_CONSTRUCT_START, null)
            call TriggerAddAction(trig, function MeleeTriggerActionUnitConstructionStart)

            // Set a trigger to fire whenever this player defeats-out
            set trig = CreateTrigger()
            call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_DEFEAT)
            call TriggerAddAction(trig, function MeleeTriggerActionPlayerDefeated)

            // Set a trigger to fire whenever this player leaves
            set trig = CreateTrigger()
            call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_LEAVE)
            call TriggerAddAction(trig, function MeleeTriggerActionPlayerLeft)

            // Set a trigger to fire whenever this player changes his/her alliances.
            set trig = CreateTrigger()
            call TriggerRegisterPlayerAllianceChange(trig, indexPlayer, ALLIANCE_PASSIVE)
            call TriggerRegisterPlayerStateEvent(trig, indexPlayer, PLAYER_STATE_ALLIED_VICTORY, EQUAL, 1)
            call TriggerAddAction(trig, function MeleeTriggerActionAllianceChange)
        else
            set bj_meleeDefeated[index] = true
            set bj_meleeVictoried[index] = false

            // Handle leave events for observers
            if (IsPlayerObserver(indexPlayer)) then
                // Set a trigger to fire whenever this player leaves
                set trig = CreateTrigger()
                call TriggerRegisterPlayerEvent(trig, indexPlayer, EVENT_PLAYER_LEAVE)
                call TriggerAddAction(trig, function MeleeTriggerActionPlayerLeft)
            endif
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    // Test for victory / defeat at startup, in case the user has already won / lost.
    // Allow for a short time to pass first, so that the map can finish loading.
    call TimerStart(CreateTimer(), 2.0, false, function MeleeTriggerActionAllianceChange)
endfunction



//***************************************************************************
//*
//*  Player Slot Availability
//*
//***************************************************************************

//===========================================================================
function CheckInitPlayerSlotAvailability takesnothing returnsnothing
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

//===========================================================================
function SetPlayerSlotAvailable takesplayer whichPlayer, mapcontrol control returnsnothing
    local integer playerIndex = GetPlayerId(whichPlayer)

    call CheckInitPlayerSlotAvailability()
    set bj_slotControlUsed[playerIndex] = true
    set bj_slotControl[playerIndex] = control
endfunction



//***************************************************************************
//*
//*  Generic Template Player-slot Initialization
//*
//***************************************************************************

//===========================================================================
function TeamInitPlayerSlots takesinteger teamCount returnsnothing
    local integer index
    local player  indexPlayer
    local integer team

    call SetTeams(teamCount)

    call CheckInitPlayerSlotAvailability()
    set index = 0
    set team = 0
    loop
        if (bj_slotControlUsed[index]) then
            set indexPlayer = Player(index)
            call SetPlayerTeam(indexPlayer, team)
            set team = team + 1
            if (team >= teamCount) then
                set team = 0
            endif
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction

//===========================================================================
function MeleeInitPlayerSlots takesnothing returnsnothing
    call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction

//===========================================================================
function FFAInitPlayerSlots takesnothing returnsnothing
    call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction

//===========================================================================
function OneOnOneInitPlayerSlots takesnothing returnsnothing
    // Limit the game to 2 players.
    call SetTeams(2)
    call SetPlayers(2)
    call TeamInitPlayerSlots(2)
endfunction

//===========================================================================
function InitGenericPlayerSlots takesnothing returnsnothing
    local gametype gType = GetGameTypeSelected()

    if (gType == GAME_TYPE_MELEE) then
        call MeleeInitPlayerSlots()
    elseif (gType == GAME_TYPE_FFA) then
        call FFAInitPlayerSlots()
    elseif (gType == GAME_TYPE_USE_MAP_SETTINGS) then
        // Do nothing; the map-specific script handles this.
    elseif (gType == GAME_TYPE_ONE_ON_ONE) then
        call OneOnOneInitPlayerSlots()
    elseif (gType == GAME_TYPE_TWO_TEAM_PLAY) then
        call TeamInitPlayerSlots(2)
    elseif (gType == GAME_TYPE_THREE_TEAM_PLAY) then
        call TeamInitPlayerSlots(3)
    elseif (gType == GAME_TYPE_FOUR_TEAM_PLAY) then
        call TeamInitPlayerSlots(4)
    else
        // Unrecognized Game Type
    endif
endfunction



//***************************************************************************
//*
//*  Blizzard.j Initialization
//*
//***************************************************************************

//===========================================================================
function SetDNCSoundsDawn takesnothing returnsnothing
    if bj_useDawnDuskSounds then
        call StartSound(bj_dawnSound)
    endif
endfunction

//===========================================================================
function SetDNCSoundsDusk takesnothing returnsnothing
    if bj_useDawnDuskSounds then
        call StartSound(bj_duskSound)
    endif
endfunction

//===========================================================================
function SetDNCSoundsDay takesnothing returnsnothing
    local real ToD = GetTimeOfDay()

    if (ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) and not bj_dncIsDaytime then
        set bj_dncIsDaytime = true

        // change ambient sounds
        call StopSound(bj_nightAmbientSound, false, true)
        call StartSound(bj_dayAmbientSound)
    endif
endfunction

//===========================================================================
function SetDNCSoundsNight takesnothing returnsnothing
    local real ToD = GetTimeOfDay()

    if (ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) and bj_dncIsDaytime then
        set bj_dncIsDaytime = false

        // change ambient sounds
        call StopSound(bj_dayAmbientSound, false, true)
        call StartSound(bj_nightAmbientSound)
    endif
endfunction

//===========================================================================
function InitDNCSounds takesnothing returnsnothing
    // Create sounds to be played at dawn and dusk.
    set bj_dawnSound = CreateSoundFromLabel("RoosterSound", false, false, false, 10000, 10000)
    set bj_duskSound = CreateSoundFromLabel("WolfSound", false, false, false, 10000, 10000)

    // Set up triggers to respond to dawn and dusk.
    set bj_dncSoundsDawn = CreateTrigger()
    call TriggerRegisterGameStateEvent(bj_dncSoundsDawn, GAME_STATE_TIME_OF_DAY, EQUAL, bj_TOD_DAWN)
    call TriggerAddAction(bj_dncSoundsDawn, function SetDNCSoundsDawn)

    set bj_dncSoundsDusk = CreateTrigger()
    call TriggerRegisterGameStateEvent(bj_dncSoundsDusk, GAME_STATE_TIME_OF_DAY, EQUAL, bj_TOD_DUSK)
    call TriggerAddAction(bj_dncSoundsDusk, function SetDNCSoundsDusk)

    // Set up triggers to respond to changes from day to night or vice-versa.
    set bj_dncSoundsDay = CreateTrigger()
    call TriggerRegisterGameStateEvent(bj_dncSoundsDay, GAME_STATE_TIME_OF_DAY, GREATER_THAN_OR_EQUAL, bj_TOD_DAWN)
    call TriggerRegisterGameStateEvent(bj_dncSoundsDay, GAME_STATE_TIME_OF_DAY, LESS_THAN, bj_TOD_DUSK)
    call TriggerAddAction(bj_dncSoundsDay, function SetDNCSoundsDay)

    set bj_dncSoundsNight = CreateTrigger()
    call TriggerRegisterGameStateEvent(bj_dncSoundsNight, GAME_STATE_TIME_OF_DAY, LESS_THAN, bj_TOD_DAWN)
    call TriggerRegisterGameStateEvent(bj_dncSoundsNight, GAME_STATE_TIME_OF_DAY, GREATER_THAN_OR_EQUAL, bj_TOD_DUSK)
    call TriggerAddAction(bj_dncSoundsNight, function SetDNCSoundsNight)
endfunction

//===========================================================================
function InitBlizzardGlobals takesnothing returnsnothing
    local integer index
    local integer userControlledPlayers
    local version v

    // Init filter function vars
    set filterIssueHauntOrderAtLocBJ = Filter(function IssueHauntOrderAtLocBJFilter)
    set filterEnumDestructablesInCircleBJ = Filter(function EnumDestructablesInCircleBJFilter)
    set filterGetUnitsInRectOfPlayer = Filter(function GetUnitsInRectOfPlayerFilter)
    set filterGetUnitsOfTypeIdAll = Filter(function GetUnitsOfTypeIdAllFilter)
    set filterGetUnitsOfPlayerAndTypeId = Filter(function GetUnitsOfPlayerAndTypeIdFilter)
    set filterMeleeTrainedUnitIsHeroBJ = Filter(function MeleeTrainedUnitIsHeroBJFilter)
    set filterLivingPlayerUnitsOfTypeId = Filter(function LivingPlayerUnitsOfTypeIdFilter)

    // Init force presets
    set index = 0
    loop
        exitwhen index == bj_MAX_PLAYER_SLOTS
        set bj_FORCE_PLAYER[index] = CreateForce()
        call ForceAddPlayer(bj_FORCE_PLAYER[index], Player(index))
        set index = index + 1
    endloop

    set bj_FORCE_ALL_PLAYERS = CreateForce()
    call ForceEnumPlayers(bj_FORCE_ALL_PLAYERS, null)

    // Init Cinematic Mode history
    set bj_cineModePriorSpeed = GetGameSpeed()
    set bj_cineModePriorFogSetting = IsFogEnabled()
    set bj_cineModePriorMaskSetting = IsFogMaskEnabled()

    // Init Trigger Queue
    set index = 0
    loop
        exitwhen index >= bj_MAX_QUEUED_TRIGGERS
        set bj_queuedExecTriggers[index] = null
        set bj_queuedExecUseConds[index] = false
        set index = index + 1
    endloop

    // Init singleplayer check
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

    // Init sounds
    //set bj_pingMinimapSound = CreateSoundFromLabel("AutoCastButtonClick", false, false, false, 10000, 10000)
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

    // Init corpse creation triggers.
    call DelayedSuspendDecayCreate()

    // Init version-specific data
    set v = VersionGet()
    if (v == VERSION_REIGN_OF_CHAOS) then
        set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V0
    else
        set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V1
    endif
endfunction

//===========================================================================
function InitQueuedTriggers takesnothing returnsnothing
    set bj_queuedExecTimeout = CreateTrigger()
    call TriggerRegisterTimerExpireEvent(bj_queuedExecTimeout, bj_queuedExecTimeoutTimer)
    call TriggerAddAction(bj_queuedExecTimeout, function QueuedTriggerDoneBJ)
endfunction

//===========================================================================
function InitMapRects takesnothing returnsnothing
    set bj_mapInitialPlayableArea = Rect(GetCameraBoundMinX()-GetCameraMargin(CAMERA_MARGIN_LEFT), GetCameraBoundMinY()-GetCameraMargin(CAMERA_MARGIN_BOTTOM), GetCameraBoundMaxX() + GetCameraMargin(CAMERA_MARGIN_RIGHT), GetCameraBoundMaxY() + GetCameraMargin(CAMERA_MARGIN_TOP))
    set bj_mapInitialCameraBounds = GetCurrentCameraBoundsMapRectBJ()
endfunction

//===========================================================================
function InitSummonableCaps takesnothing returnsnothing
    local integer index

    set index = 0
    loop
        // upgraded units
        // Note: Only do this if the corresponding upgrade is not yet researched
        // Barrage - Siege Engines
        if (not GetPlayerTechResearched(Player(index), 'Rhrt', true)) then
            call SetPlayerTechMaxAllowed(Player(index), 'hrtt', 0)
        endif

        // Berserker Upgrade - Troll Berserkers
        if (not GetPlayerTechResearched(Player(index), 'Robk', true)) then
            call SetPlayerTechMaxAllowed(Player(index), 'otbk', 0)
        endif

        // max skeletons per player
        call SetPlayerTechMaxAllowed(Player(index), 'uske', bj_MAX_SKELETONS)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction

//===========================================================================
// Update the per-class stock limits.
//
function UpdateStockAvailability takesitem whichItem returnsnothing
    local itemtype iType = GetItemType(whichItem)
    local integer  iLevel = GetItemLevel(whichItem)

    // Update allowed type/level combinations.
    if (iType == ITEM_TYPE_PERMANENT) then
        set bj_stockAllowedPermanent[iLevel] = true
    elseif (iType == ITEM_TYPE_CHARGED) then
        set bj_stockAllowedCharged[iLevel] = true
    elseif (iType == ITEM_TYPE_ARTIFACT) then
        set bj_stockAllowedArtifact[iLevel] = true
    else
        // Not interested in this item type - ignore the item.
    endif
endfunction

//===========================================================================
// Find a sellable item of the given type and level, and then add it.
//
function UpdateEachStockBuildingEnum takesnothing returnsnothing
    local integer iteration = 0
    local integer pickedItemId

    loop
        set pickedItemId = ChooseRandomItemEx(bj_stockPickedItemType, bj_stockPickedItemLevel)
        exitwhen IsItemIdSellable(pickedItemId)

        // If we get hung up on an entire class/level combo of unsellable
        // items, or a very unlucky series of random numbers, give up.
        set iteration = iteration + 1
        if (iteration > bj_STOCK_MAX_ITERATIONS) then
            return
        endif
    endloop
    call AddItemToStock(GetEnumUnit(), pickedItemId, 1, 1)
endfunction

//===========================================================================
function UpdateEachStockBuilding takesitemtype iType, integer iLevel returnsnothing
    local group g

    set bj_stockPickedItemType = iType
    set bj_stockPickedItemLevel = iLevel

    set g = CreateGroup()
    call GroupEnumUnitsOfType(g, "marketplace", null)
    call ForGroup(g, function UpdateEachStockBuildingEnum)
    call DestroyGroup(g)
endfunction

//===========================================================================
// Update stock inventory.
//
function PerformStockUpdates takesnothing returnsnothing
    local integer  pickedItemId
    local itemtype pickedItemType
    local integer  pickedItemLevel = 0
    local integer  allowedCombinations = 0
    local integer  iLevel

    // Give each type/level combination a chance of being picked.
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

    // Make sure we found a valid item type to add.
    if (allowedCombinations == 0) then
        return
    endif

    call UpdateEachStockBuilding(pickedItemType, pickedItemLevel)
endfunction

//===========================================================================
// Perform the first update, and then arrange future updates.
//
function StartStockUpdates takesnothing returnsnothing
    call PerformStockUpdates()
    call TimerStart(bj_stockUpdateTimer, bj_STOCK_RESTOCK_INTERVAL, true, function PerformStockUpdates)
endfunction

//===========================================================================
function RemovePurchasedItem takesnothing returnsnothing
    call RemoveItemFromStock(GetSellingUnit(), GetItemTypeId(GetSoldItem()))
endfunction

//===========================================================================
function InitNeutralBuildings takesnothing returnsnothing
    local integer iLevel

    // Chart of allowed stock items.
    set iLevel = 0
    loop
        set bj_stockAllowedPermanent[iLevel] = false
        set bj_stockAllowedCharged[iLevel] = false
        set bj_stockAllowedArtifact[iLevel] = false
        set iLevel = iLevel + 1
        exitwhen iLevel > bj_MAX_ITEM_LEVEL
    endloop

    // Limit stock inventory slots.
    call SetAllItemTypeSlots(bj_MAX_STOCK_ITEM_SLOTS)
    call SetAllUnitTypeSlots(bj_MAX_STOCK_UNIT_SLOTS)

    // Arrange the first update.
    set bj_stockUpdateTimer = CreateTimer()
    call TimerStart(bj_stockUpdateTimer, bj_STOCK_RESTOCK_INITIAL_DELAY, false, function StartStockUpdates)

    // Set up a trigger to fire whenever an item is sold.
    set bj_stockItemPurchased = CreateTrigger()
    call TriggerRegisterPlayerUnitEvent(bj_stockItemPurchased, Player(PLAYER_NEUTRAL_PASSIVE), EVENT_PLAYER_UNIT_SELL_ITEM, null)
    call TriggerAddAction(bj_stockItemPurchased, function RemovePurchasedItem)
endfunction

//===========================================================================
function MarkGameStarted takesnothing returnsnothing
    set bj_gameStarted = true
    call DestroyTimer(bj_gameStartedTimer)
endfunction

//===========================================================================
function DetectGameStarted takesnothing returnsnothing
    set bj_gameStartedTimer = CreateTimer()
    call TimerStart(bj_gameStartedTimer, bj_GAME_STARTED_THRESHOLD, false, function MarkGameStarted)
endfunction

//===========================================================================
function InitBlizzard takesnothing returnsnothing
    // Set up the Neutral Victim player slot, to torture the abandoned units
    // of defeated players.  Since some triggers expect this player slot to
    // exist, this is performed for all maps.
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



//***************************************************************************
//*
//*  Random distribution
//*
//*  Used to select a random object from a given distribution of chances
//*
//*  - RandomDistReset clears the distribution list
//*
//*  - RandomDistAddItem adds a new object to the distribution list
//*    with a given identifier and an integer chance to be chosen
//*
//*  - RandomDistChoose will use the current distribution list to choose
//*    one of the objects randomly based on the chance distribution
//*  
//*  Note that the chances are effectively normalized by their sum,
//*  so only the relative values of each chance are important
//*
//***************************************************************************

//===========================================================================
function RandomDistReset takesnothing returnsnothing
    set bj_randDistCount = 0
endfunction

//===========================================================================
function RandomDistAddItem takesinteger inID, integer inChance returnsnothing
    set bj_randDistID[bj_randDistCount] = inID
    set bj_randDistChance[bj_randDistCount] = inChance
    set bj_randDistCount = bj_randDistCount + 1
endfunction

//===========================================================================
function RandomDistChoose takesnothing returnsinteger
    local integer sum = 0
    local integer chance = 0
    local integer index
    local integer foundID = -1
    local boolean done

    // No items?
    if (bj_randDistCount == 0) then
        return -1
    endif

    // Find sum of all chances
    set index = 0
    loop
        set sum = sum + bj_randDistChance[index]

        set index = index + 1
        exitwhen index == bj_randDistCount
    endloop

    // Choose random number within the total range
    set chance = GetRandomInt(1, sum)

    // Find ID which corresponds to this chance
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

    returnfoundID
endfunction



//***************************************************************************
//*
//*  Drop item
//*
//*  Makes the given unit drop the given item
//*
//*  Note: This could potentially cause problems if the unit is standing
//*        right on the edge of an unpathable area and happens to drop the
//*        item into the unpathable area where nobody can get it...
//*
//***************************************************************************

function UnitDropItem takesunit inUnit, integer inItemID returnsitem
    local real x
    local real y
    local real radius = 32
    local real unitX
    local real unitY
    local item droppedItem

    if (inItemID == -1) then
        returnnull
    endif

    set unitX = GetUnitX(inUnit)
    set unitY = GetUnitY(inUnit)

    set x = GetRandomReal(unitX - radius, unitX + radius)
    set y = GetRandomReal(unitY - radius, unitY + radius)

    set droppedItem = CreateItem(inItemID, x, y)

    call SetItemDropID(droppedItem, GetUnitTypeId(inUnit))
    call UpdateStockAvailability(droppedItem)

    returndroppedItem
endfunction

//===========================================================================
function WidgetDropItem takeswidget inWidget, integer inItemID returnsitem
    local real x
    local real y
    local real radius = 32
    local real widgetX
    local real widgetY

    if (inItemID == -1) then
        returnnull
    endif

    set widgetX = GetWidgetX(inWidget)
    set widgetY = GetWidgetY(inWidget)

    set x = GetRandomReal(widgetX - radius, widgetX + radius)
    set y = GetRandomReal(widgetY - radius, widgetY + radius)

    returnCreateItem(inItemID, x, y)
endfunction
