
// Blizzard.j ( define Jass2 functions that need to be in every map script )

 
globals
    //-----------------------------------------------------------------------
    // Constants
    
    // Misc constants

    // 圆周率 π，默认3.14159
    constant real bj_PI = 3.14159
    // 底数，默认2.71828
    constant real bj_E = 2.71828
    // 单元尺寸（游戏内量测地表面积的单位），默认128.0
    constant real bj_CELLWIDTH = 128.0
    // 悬崖高度（升降台升/降一层的高度），默认128.0
    constant real bj_CLIFFHEIGHT = 128.0
    // 单位默认朝向，默认270.0
    constant real bj_UNIT_FACING = 270.0
    // 弧角转换系数（弧度转换成角度）
    constant real bj_RADTODEG = 180.0 / bj_PI
    // 角弧转换系数（角度转换成弧度）
    constant real bj_DEGTORAD = bj_PI / 180.0
    // 文本显示持续时间 任务，默认20.00
    constant real bj_TEXT_DELAY_QUEST = 20.00
    // 文本显示持续时间 任务更新，默认20.00
    constant real bj_TEXT_DELAY_QUESTUPDATE = 20.00
    // 文本显示持续时间 任务完成，默认20.00
    constant real bj_TEXT_DELAY_QUESTDONE = 20.00
    // 文本显示持续时间 任务失败，默认20.00
    constant real bj_TEXT_DELAY_QUESTFAILED = 20.00
    // 文本显示持续时间 任务要求，默认20.00
    constant real bj_TEXT_DELAY_QUESTREQUIREMENT = 20.00
    // 文本显示持续时间 失败消息，默认20.00
    constant real bj_TEXT_DELAY_MISSIONFAILED = 20.00
    // 文本显示持续时间 常驻提示，默认12.00
    constant real bj_TEXT_DELAY_ALWAYSHINT = 12.00
    // 文本显示持续时间 提示，默认12.00
    constant real bj_TEXT_DELAY_HINT = 12.00
    // 文本显示持续时间 秘密，默认10.00
    constant real bj_TEXT_DELAY_SECRET = 10.00
    // 文本显示持续时间 有新单位可购买，默认15.00
    constant real bj_TEXT_DELAY_UNITACQUIRED = 15.00
    // 文本显示持续时间 有新单位可用，默认10.00
    constant real bj_TEXT_DELAY_UNITAVAILABLE = 10.00
    // 文本显示持续时间 有新物品可购买，默认10.00
    constant real bj_TEXT_DELAY_ITEMACQUIRED = 10.00
    // 文本显示持续时间 警告，默认12.00
    constant real bj_TEXT_DELAY_WARNING = 12.00
    // 任务显示持续时间 探索，默认5.00
    constant real bj_QUEUE_DELAY_QUEST = 5.00
    // 任务显示持续时间 提示，默认5.00
    constant real bj_QUEUE_DELAY_HINT = 5.00
    // 任务显示持续时间 秘密，默认3.00
    constant real bj_QUEUE_DELAY_SECRET = 3.00
    // 生命障碍 简单，默认60.00
    constant real bj_HANDICAP_EASY = 60.00
    // 生命障碍 普通，默认90.00
    constant real bj_HANDICAP_NORMAL = 90.00
    // 伤害障碍 简单，默认50.00
    constant real bj_HANDICAPDAMAGE_EASY = 50.00
    // 伤害障碍 普通，默认90.00
    constant real bj_HANDICAPDAMAGE_NORMAL = 90.00
    // 伤害障碍 困难，默认50.00
    constant real bj_HANDICAPREVIVE_NOTHARD = 50.00
    // 游戏开局阈值，默认0.01
    constant real bj_GAME_STARTED_THRESHOLD = 0.01
    // 迷雾等待最小间隔，默认0.10
    constant real bj_WAIT_FOR_COND_MIN_INTERVAL = 0.10
    // 轮询间隔（游戏时间），默认0.10
    constant real bj_POLLED_WAIT_INTERVAL = 0.10
    // 轮询跳过阈值（游戏时间），默认2.00
    constant real bj_POLLED_WAIT_SKIP_THRESHOLD = 2.00

    // Game constants

    // 物品栏格子上限，默认6
    constant integer bj_MAX_INVENTORY = 6
    // 玩家上限（包含12/24位玩家和中立敌对玩家，共13/25位）
    constant integer bj_MAX_PLAYERS = GetBJMaxPlayers()
    // 中立受害玩家（玩家14/26）
    constant integer bj_PLAYER_NEUTRAL_VICTIM = GetBJPlayerNeutralVictim()
    // 中立特殊玩家（玩家15/27）
    constant integer bj_PLAYER_NEUTRAL_EXTRA = GetBJPlayerNeutralExtra()
    // 玩家槽上限（包含所有中立玩家，共16/28位）
    constant integer bj_MAX_PLAYER_SLOTS = GetBJMaxPlayerSlots()
    // （召唤）骷髅战士（'uske'）数量上限，默认25
    constant integer bj_MAX_SKELETONS = 25
    // （商店）物品库存上限，默认11
    constant integer bj_MAX_STOCK_ITEM_SLOTS = 11
    // （商店）单位库存上限，默认11
    constant integer bj_MAX_STOCK_UNIT_SLOTS = 11
    // 物品等级上限，默认10级
    constant integer bj_MAX_ITEM_LEVEL = 10

    // Auto Save constants

    // （自动）存档保留数量上限，默认5
    // 怀疑超过会自动替换，但按理说这种设置不应在此
    constant integer bj_MAX_CHECKPOINTS = 5

    // Ideally these would be looked up from Units/MiscData.txt,
    // but there is currently no script functionality exposed to do that

    // 黎明时间（鸡啼），默认6点整（6.00），24时制
    constant real bj_TOD_DAWN = 6.00
    // 入夜时间（狼嚎），默认18点整（18.00），24时制
    constant real bj_TOD_DUSK = 18.00

    // Melee game settings:
    //   - Starting Time of Day (TOD)
    //   - Starting Gold
    //   - Starting Lumber
    //   - Starting Hero Tokens (free heroes)
    //   - Max heroes allowed per player
    //   - Max heroes allowed per hero type
    //   - Distance from start loc to search for nearby mines

    // 初始时间，默认8点整（8.00），24时制
    constant real bj_MELEE_STARTING_TOD = 8.00
    // 混乱之治版本初始黄金数量，默认750
    constant integer bj_MELEE_STARTING_GOLD_V0 = 750
    // 冰封王座版本初始黄金数量，默认500
    constant integer bj_MELEE_STARTING_GOLD_V1 = 500
    // 混乱之治版本初始木材数量，默认200
    constant integer bj_MELEE_STARTING_LUMBER_V0 = 200
    // 冰封王座版本初始木材数量，默认150
    constant integer bj_MELEE_STARTING_LUMBER_V1 = 150
    // 使用随机英雄时创建的英雄数量，默认1
    constant integer bj_MELEE_STARTING_HERO_TOKENS = 1
    // 英雄数量上限，默认3
    // 官方只处理了对战24个英雄
    constant integer bj_MELEE_HERO_LIMIT = 3
    // 每种英雄数量上限，默认1
    // 官方只处理了对战24个英雄
    constant integer bj_MELEE_HERO_TYPE_LIMIT = 1
    // 金矿搜索距离，默认2000
    // 主要用于开局创建亡灵/精灵矿盖
    constant real bj_MELEE_MINE_SEARCH_RADIUS = 2000
    // 清除出生点中立敌对单位的范围，默认1500
    // 开局清除出生点的野怪时，要删除出生点多少范围内的野怪
    constant real bj_MELEE_CLEAR_UNITS_RADIUS = 1500
    // 暴露倒计时，默认120.00
    // 失去全部基地时，在暴露位置前，留给玩家造基地的时间
    constant real bj_MELEE_CRIPPLE_TIMEOUT = 120.00
    // 暴露持续时间，默认20.00
    // 失去全部基地，且暴露倒计时结束后玩家仍未造基地，系统暴露玩家位置的持续时间
    constant real bj_MELEE_CRIPPLE_MSG_DURATION = 20.00
    // 混乱之治版本英雄初始物品创建次数，默认3，即前3发英雄都给
    constant integer bj_MELEE_MAX_TWINKED_HEROES_V0 = 3
    // 冰封王座版本英雄初始物品创建次数，默认1，即只给首发英雄
    constant integer bj_MELEE_MAX_TWINKED_HEROES_V1 = 1

    // 物品掉落延时（从单位死亡到掉落物品出现的时间间隔），默认0.50
    // Delay between a creep's death and the time it may drop an item.
    constant real bj_CREEP_ITEM_DELAY = 0.50

    // 初始物品库存补充延时（开局后，过多久才可购买/雇佣），默认120
    // Timing settings for Marketplace inventories.
    constant real bj_STOCK_RESTOCK_INITIAL_DELAY = 120
    // 库存补充间隔，默认30
    constant real bj_STOCK_RESTOCK_INTERVAL = 30
    // 库存补充次数上限，默认20
    constant integer bj_STOCK_MAX_ITERATIONS = 20

    // 事件注册数量上限，默认64
    // 单个“dest dies in region”事件注册的最大事件数。
    // Max events registered by a single "dest dies in region" event.
    constant integer bj_MAX_DEST_IN_REGION_EVENTS = 64

    // Camera settings

    // 镜头最小截断距离（远景裁剪），默认100
    constant integer bj_CAMERA_MIN_FARZ = 100
    // 镜头默认距离（距离到目标），默认1650
    constant integer bj_CAMERA_DEFAULT_DISTANCE = 1650
    // 镜头默认截断距离（远景裁剪），默认5000
    constant integer bj_CAMERA_DEFAULT_FARZ = 5000
    // 镜头默认水平/攻击角度（X 轴旋转角度），默认304
    constant integer bj_CAMERA_DEFAULT_AOA = 304
    // 默认镜头（观察区域），默认70
    constant integer bj_CAMERA_DEFAULT_FOV = 70
    // 镜头默认滚动（Y 轴旋转角度），默认0
    constant integer bj_CAMERA_DEFAULT_ROLL = 0
    // 镜头默认高度位移值（Z 轴旋转角度），默认90
    constant integer bj_CAMERA_DEFAULT_ROTATION = 90

    // 营救（所属玩家变更）延时，默认2.00
    // 疑似中立可营救单位在被可营救后变更队伍的延迟
    constant real bj_RESCUE_PING_TIME = 2.00

    // Transmission behavior settings

    // 常规音效持续时间，默认5.00
    constant real bj_NOTHING_SOUND_DURATION = 5.00
    // 单位消息延迟，默认1.00
    constant real bj_TRANSMISSION_PING_TIME = 1.00
    // 单位消息闪动指示器颜色（红），默认255
    constant integer bj_TRANSMISSION_IND_RED = 255
    // 单位消息闪动指示器颜色（蓝），默认255
    constant integer bj_TRANSMISSION_IND_BLUE = 255
    // 单位消息闪动指示器颜色（绿），默认255
    constant integer bj_TRANSMISSION_IND_GREEN = 255
    // 单位消息闪动指示器颜色（alpha），默认255
    constant integer bj_TRANSMISSION_IND_ALPHA = 255
    // 单位消息画像悬空时间，默认1.50
    constant real bj_TRANSMISSION_PORT_HANGTIME = 1.50

    // 电影模式转换时间，默认0.50，Cinematic mode settings
    constant real bj_CINEMODE_INTERFACEFADE = 0.50
    // 游戏默认速度，默认正常
    constant gamespeed bj_CINEMODE_GAMESPEED = MAP_SPEED_NORMAL

    // Cinematic mode volume levels

    // 电影模式默认音量 单位移动音效，默认0.40
    constant real bj_CINEMODE_VOLUME_UNITMOVEMENT = 0.40
    // 电影模式默认音量 单位响应音效，默认0.00
    constant real bj_CINEMODE_VOLUME_UNITSOUNDS = 0.00
    // 电影模式默认音量 战斗音效，默认0.40
    constant real bj_CINEMODE_VOLUME_COMBAT = 0.40
    // 电影模式默认音量 动画和法术音效，默认0.40
    constant real bj_CINEMODE_VOLUME_SPELLS = 0.40
    // 电影模式默认音量 用户界面（UI）音效，默认0.00
    constant real bj_CINEMODE_VOLUME_UI = 0.00
    // 电影模式默认音量 音乐，默认0.55
    constant real bj_CINEMODE_VOLUME_MUSIC = 0.55
    // 电影模式默认音量 场景配音，默认1.00
    constant real bj_CINEMODE_VOLUME_AMBIENTSOUNDS = 1.00
    // 电影模式默认音量 火焰音效，默认0.60
    constant real bj_CINEMODE_VOLUME_FIRE = 0.60

    // Speech mode volume levels

    // 所有声道默认音量 单位移动音效，默认0.25
    constant real bj_SPEECH_VOLUME_UNITMOVEMENT = 0.25
    // 所有声道默认音量 单位响应音效，默认0.00
    constant real bj_SPEECH_VOLUME_UNITSOUNDS = 0.00
    // 所有声道默认音量 战斗音效，默认0.25
    constant real bj_SPEECH_VOLUME_COMBAT = 0.25
    // 所有声道默认音量 动画和法术音效，默认0.25
    constant real bj_SPEECH_VOLUME_SPELLS = 0.25
    // 所有声道默认音量 用户界面（UI）音效，默认0.00
    constant real bj_SPEECH_VOLUME_UI = 0.00
    // 所有声道默认音量 音乐，默认0.55
    constant real bj_SPEECH_VOLUME_MUSIC = 0.55
    // 所有声道默认音量 场景配音，默认1.00
    constant real bj_SPEECH_VOLUME_AMBIENTSOUNDS = 1.00
    // 所有声道默认音量 火焰音效，默认0.60
    constant real bj_SPEECH_VOLUME_FIRE = 0.60

    // Smart pan settings

    // 必要时平移镜头的距离限制，默认500
    // 超过该值但不超过 bj_SMARTPAN_TRESHOLD_SNAP 时，使用限定的时间平移，低于该值时不平移
    constant real bj_SMARTPAN_TRESHOLD_PAN = 500
    // 必要时平移镜头的距离限制，默认3500
    // 平移距离超过该值时，立即完成平移（限定的时间被替换为0秒）
    constant real bj_SMARTPAN_TRESHOLD_SNAP = 3500

    // QueuedTriggerExecute settings

    // 最大触发器队列，默认100
    constant integer bj_MAX_QUEUED_TRIGGERS = 100
    // 触发器队列超时时间，默认180.00
    constant real bj_QUEUED_TRIGGER_TIMEOUT = 180.00

    // Campaign indexing constants

    // 战役过场电影索引 混乱之治教程战役（0）
    constant integer bj_CAMPAIGN_INDEX_T = 0
    // 战役过场电影索引 混乱之治人族战役（1）
    constant integer bj_CAMPAIGN_INDEX_H = 1
    // 战役过场电影索引 混乱之治兽族战役（2）
    constant integer bj_CAMPAIGN_INDEX_U = 2
    // 战役过场电影索引 混乱之治不死族战役（3）
    constant integer bj_CAMPAIGN_INDEX_O = 3
    // 战役过场电影索引 混乱之治暗夜精灵族战役（4）
    constant integer bj_CAMPAIGN_INDEX_N = 4
    // 战役过场电影索引 冰封王座暗夜精灵族战役（5）
    constant integer bj_CAMPAIGN_INDEX_XN = 5
    // 战役过场电影索引 冰封王座人族战役（6）
    constant integer bj_CAMPAIGN_INDEX_XH = 6
    // 战役过场电影索引 冰封王座不死族战役（7）
    constant integer bj_CAMPAIGN_INDEX_XU = 7
    // 战役过场电影索引 冰封王座兽族战役（8）
    constant integer bj_CAMPAIGN_INDEX_XO = 8

    // Campaign offset constants (for mission indexing)

    // 战役关卡索引 混乱之治教程战役（0）
    constant integer bj_CAMPAIGN_OFFSET_T = 0
    // 战役关卡索引 混乱之治人族战役（1）
    constant integer bj_CAMPAIGN_OFFSET_H = 1
    // 战役关卡索引 混乱之治不死族战役（2）
    constant integer bj_CAMPAIGN_OFFSET_U = 2
    // 战役关卡索引 混乱之治兽族战役（3）
    constant integer bj_CAMPAIGN_OFFSET_O = 3
    // 战役关卡索引 冰封王座暗夜精灵族战役（4）
    constant integer bj_CAMPAIGN_OFFSET_N = 4
    // 战役关卡索引 冰封王座暗夜精灵族战役（5）
    constant integer bj_CAMPAIGN_OFFSET_XN = 5
    // 战役关卡索引 冰封王座人族战役（6）
    constant integer bj_CAMPAIGN_OFFSET_XH = 6
    // 战役关卡索引 冰封王座不死族战役（7）
    constant integer bj_CAMPAIGN_OFFSET_XU = 7
    // 战役关卡索引 冰封王座兽族战役（8）
    constant integer bj_CAMPAIGN_OFFSET_XO = 8

    // Mission indexing constants
    // Tutorial

    // 战役关卡 混乱之治教程战役00（bj_CAMPAIGN_OFFSET_T * 1000 + 0）
    constant integer bj_MISSION_INDEX_T00 = bj_CAMPAIGN_OFFSET_T * 1000 + 0
    // 战役关卡 混乱之治教程战役01（bj_CAMPAIGN_OFFSET_T * 1000 + 1）
    constant integer bj_MISSION_INDEX_T01 = bj_CAMPAIGN_OFFSET_T * 1000 + 1
    // 战役关卡 混乱之治教程战役02（bj_CAMPAIGN_OFFSET_T * 1000 + 2）
    constant integer bj_MISSION_INDEX_T02 = bj_CAMPAIGN_OFFSET_T * 1000 + 2
    // 战役关卡 混乱之治教程战役03（bj_CAMPAIGN_OFFSET_T * 1000 + 3）
    constant integer bj_MISSION_INDEX_T03 = bj_CAMPAIGN_OFFSET_T * 1000 + 3
    // 战役关卡 混乱之治教程战役04（bj_CAMPAIGN_OFFSET_T * 1000 + 4）
    constant integer bj_MISSION_INDEX_T04 = bj_CAMPAIGN_OFFSET_T * 1000 + 4
    // Human

    // 战役关卡 混乱之治人族战役01（bj_CAMPAIGN_OFFSET_H * 1000 + 0）
    constant integer bj_MISSION_INDEX_H00 = bj_CAMPAIGN_OFFSET_H * 1000 + 0
    // 战役关卡 混乱之治人族战役02（bj_CAMPAIGN_OFFSET_H * 1000 + 1）
    constant integer bj_MISSION_INDEX_H01 = bj_CAMPAIGN_OFFSET_H * 1000 + 1
    // 战役关卡 混乱之治人族战役02 插曲（bj_CAMPAIGN_OFFSET_H * 1000 + 2）
    constant integer bj_MISSION_INDEX_H02 = bj_CAMPAIGN_OFFSET_H * 1000 + 2
    // 战役关卡 混乱之治人族战役03（bj_CAMPAIGN_OFFSET_H * 1000 + 3）
    constant integer bj_MISSION_INDEX_H03 = bj_CAMPAIGN_OFFSET_H * 1000 + 3
    // 战役关卡 混乱之治人族战役04（bj_CAMPAIGN_OFFSET_H * 1000 + 4）
    constant integer bj_MISSION_INDEX_H04 = bj_CAMPAIGN_OFFSET_H * 1000 + 4
    // 战役关卡 混乱之治人族战役05（bj_CAMPAIGN_OFFSET_H * 1000 + 5）
    constant integer bj_MISSION_INDEX_H05 = bj_CAMPAIGN_OFFSET_H * 1000 + 5
    // 战役关卡 混乱之治人族战役05 插曲（bj_CAMPAIGN_OFFSET_H * 1000 + 6）
    constant integer bj_MISSION_INDEX_H06 = bj_CAMPAIGN_OFFSET_H * 1000 + 6
    // 战役关卡 混乱之治人族战役06（bj_CAMPAIGN_OFFSET_H * 1000 + 7）
    constant integer bj_MISSION_INDEX_H07 = bj_CAMPAIGN_OFFSET_H * 1000 + 7
    // 战役关卡 混乱之治人族战役06 插曲（bj_CAMPAIGN_OFFSET_H * 1000 + 8）
    constant integer bj_MISSION_INDEX_H08 = bj_CAMPAIGN_OFFSET_H * 1000 + 8
    // 战役关卡 混乱之治人族战役07（bj_CAMPAIGN_OFFSET_H * 1000 + 9）
    constant integer bj_MISSION_INDEX_H09 = bj_CAMPAIGN_OFFSET_H * 1000 + 9
    // 战役关卡 混乱之治人族战役08（bj_CAMPAIGN_OFFSET_H * 1000 + 10）
    constant integer bj_MISSION_INDEX_H10 = bj_CAMPAIGN_OFFSET_H * 1000 + 10
    // 战役关卡 混乱之治人族战役09（bj_CAMPAIGN_OFFSET_H * 1000 + 11）
    constant integer bj_MISSION_INDEX_H11 = bj_CAMPAIGN_OFFSET_H * 1000 + 11
    // Undead

    // 战役关卡 混乱之治不死族战役01（bj_CAMPAIGN_OFFSET_U * 1000 + 0）
    constant integer bj_MISSION_INDEX_U00 = bj_CAMPAIGN_OFFSET_U * 1000 + 0
    // 战役关卡 混乱之治不死族战役02（bj_CAMPAIGN_OFFSET_U * 1000 + 1）
    constant integer bj_MISSION_INDEX_U01 = bj_CAMPAIGN_OFFSET_U * 1000 + 1
    // 战役关卡 混乱之治不死族战役02 插曲（bj_CAMPAIGN_OFFSET_U * 1000 + 2）
    constant integer bj_MISSION_INDEX_U02 = bj_CAMPAIGN_OFFSET_U * 1000 + 2
    // 战役关卡 混乱之治不死族战役03（bj_CAMPAIGN_OFFSET_U * 1000 + 3）
    constant integer bj_MISSION_INDEX_U03 = bj_CAMPAIGN_OFFSET_U * 1000 + 3
    // 战役关卡 混乱之治不死族战役04（bj_CAMPAIGN_OFFSET_U * 1000 + 4）
    constant integer bj_MISSION_INDEX_U05 = bj_CAMPAIGN_OFFSET_U * 1000 + 4
    // 战役关卡 混乱之治不死族战役05（bj_CAMPAIGN_OFFSET_U * 1000 + 5）
    constant integer bj_MISSION_INDEX_U07 = bj_CAMPAIGN_OFFSET_U * 1000 + 5
    // 战役关卡 混乱之治不死族战役05 插曲（bj_CAMPAIGN_OFFSET_U * 1000 + 6）
    constant integer bj_MISSION_INDEX_U08 = bj_CAMPAIGN_OFFSET_U * 1000 + 6
    // 战役关卡 混乱之治不死族战役06（bj_CAMPAIGN_OFFSET_U * 1000 + 7）
    constant integer bj_MISSION_INDEX_U09 = bj_CAMPAIGN_OFFSET_U * 1000 + 7
    // 战役关卡 混乱之治不死族战役07（bj_CAMPAIGN_OFFSET_U * 1000 + 8）
    constant integer bj_MISSION_INDEX_U10 = bj_CAMPAIGN_OFFSET_U * 1000 + 8
    // 战役关卡 混乱之治不死族战役08（bj_CAMPAIGN_OFFSET_U * 1000 + 9）
    constant integer bj_MISSION_INDEX_U11 = bj_CAMPAIGN_OFFSET_U * 1000 + 9
    // Orc

    // 战役关卡 混乱之治兽族战役01（bj_CAMPAIGN_OFFSET_O * 1000 + 0）
    constant integer bj_MISSION_INDEX_O00 = bj_CAMPAIGN_OFFSET_O * 1000 + 0
    // 战役关卡 混乱之治兽族战役02（bj_CAMPAIGN_OFFSET_O * 1000 + 1）
    constant integer bj_MISSION_INDEX_O01 = bj_CAMPAIGN_OFFSET_O * 1000 + 1
    // 战役关卡 混乱之治兽族战役03（bj_CAMPAIGN_OFFSET_O * 1000 + 2）
    constant integer bj_MISSION_INDEX_O02 = bj_CAMPAIGN_OFFSET_O * 1000 + 2
    // 战役关卡 混乱之治兽族战役04（bj_CAMPAIGN_OFFSET_O * 1000 + 3）
    constant integer bj_MISSION_INDEX_O03 = bj_CAMPAIGN_OFFSET_O * 1000 + 3
    // 战役关卡 混乱之治兽族战役04 插曲（bj_CAMPAIGN_OFFSET_O * 1000 + 4）
    constant integer bj_MISSION_INDEX_O04 = bj_CAMPAIGN_OFFSET_O * 1000 + 4
    // 战役关卡 混乱之治兽族战役05（bj_CAMPAIGN_OFFSET_O * 1000 + 5）
    constant integer bj_MISSION_INDEX_O05 = bj_CAMPAIGN_OFFSET_O * 1000 + 5
    // 战役关卡 混乱之治兽族战役06（bj_CAMPAIGN_OFFSET_O * 1000 + 6）
    constant integer bj_MISSION_INDEX_O06 = bj_CAMPAIGN_OFFSET_O * 1000 + 6
    // 战役关卡 混乱之治兽族战役07（bj_CAMPAIGN_OFFSET_O * 1000 + 7）
    constant integer bj_MISSION_INDEX_O07 = bj_CAMPAIGN_OFFSET_O * 1000 + 7
    // 战役关卡 混乱之治兽族战役07 插曲（bj_CAMPAIGN_OFFSET_O * 1000 + 8）
    constant integer bj_MISSION_INDEX_O08 = bj_CAMPAIGN_OFFSET_O * 1000 + 8
    // 战役关卡 混乱之治兽族战役08（bj_CAMPAIGN_OFFSET_O * 1000 + 9）
    constant integer bj_MISSION_INDEX_O09 = bj_CAMPAIGN_OFFSET_O * 1000 + 9
    // 战役关卡 混乱之治兽族战役09（bj_CAMPAIGN_OFFSET_O * 1000 + 10）
    constant integer bj_MISSION_INDEX_O10 = bj_CAMPAIGN_OFFSET_O * 1000 + 10
    // Night Elf

    // 战役关卡 混乱之治暗夜精灵族战役01（bj_CAMPAIGN_OFFSET_N * 1000 + 0）
    constant integer bj_MISSION_INDEX_N00 = bj_CAMPAIGN_OFFSET_N * 1000 + 0
    // 战役关卡 混乱之治暗夜精灵族战役02（bj_CAMPAIGN_OFFSET_N * 1000 + 1）
    constant integer bj_MISSION_INDEX_N01 = bj_CAMPAIGN_OFFSET_N * 1000 + 1
    // 战役关卡 混乱之治暗夜精灵族战役03（bj_CAMPAIGN_OFFSET_N * 1000 + 2）
    constant integer bj_MISSION_INDEX_N02 = bj_CAMPAIGN_OFFSET_N * 1000 + 2
    // 战役关卡 混乱之治暗夜精灵族战役04（bj_CAMPAIGN_OFFSET_N * 1000 + 3）
    constant integer bj_MISSION_INDEX_N03 = bj_CAMPAIGN_OFFSET_N * 1000 + 3
    // 战役关卡 混乱之治暗夜精灵族战役05（bj_CAMPAIGN_OFFSET_N * 1000 + 4）
    constant integer bj_MISSION_INDEX_N04 = bj_CAMPAIGN_OFFSET_N * 1000 + 4
    // 战役关卡 混乱之治暗夜精灵族战役06（bj_CAMPAIGN_OFFSET_N * 1000 + 5）
    constant integer bj_MISSION_INDEX_N05 = bj_CAMPAIGN_OFFSET_N * 1000 + 5
    // 战役关卡 混乱之治暗夜精灵族战役06 插曲（bj_CAMPAIGN_OFFSET_N * 1000 + 6）
    constant integer bj_MISSION_INDEX_N06 = bj_CAMPAIGN_OFFSET_N * 1000 + 6
    // 战役关卡 混乱之治暗夜精灵族战役07（bj_CAMPAIGN_OFFSET_N * 1000 + 7）
    constant integer bj_MISSION_INDEX_N07 = bj_CAMPAIGN_OFFSET_N * 1000 + 7
    // 战役关卡 混乱之治暗夜精灵族战役07 结局（bj_CAMPAIGN_OFFSET_N * 1000 + 8）
    constant integer bj_MISSION_INDEX_N08 = bj_CAMPAIGN_OFFSET_N * 1000 + 8
    // 战役关卡 混乱之治暗夜精灵族战役08（bj_CAMPAIGN_OFFSET_N * 1000 + 9）
    constant integer bj_MISSION_INDEX_N09 = bj_CAMPAIGN_OFFSET_N * 1000 + 9
    // Expansion Night Elf

    // 战役关卡 冰封王座暗夜精灵族战役01（bj_CAMPAIGN_OFFSET_XN * 1000 + 0）
    constant integer bj_MISSION_INDEX_XN00 = bj_CAMPAIGN_OFFSET_XN * 1000 + 0
    // 战役关卡 冰封王座暗夜精灵族战役02（bj_CAMPAIGN_OFFSET_XN * 1000 + 1）
    constant integer bj_MISSION_INDEX_XN01 = bj_CAMPAIGN_OFFSET_XN * 1000 + 1
    // 战役关卡 冰封王座暗夜精灵族战役03（bj_CAMPAIGN_OFFSET_XN * 1000 + 2）
    constant integer bj_MISSION_INDEX_XN02 = bj_CAMPAIGN_OFFSET_XN * 1000 + 2
    // 战役关卡 冰封王座暗夜精灵族战役04（bj_CAMPAIGN_OFFSET_XN * 1000 + 3）
    constant integer bj_MISSION_INDEX_XN03 = bj_CAMPAIGN_OFFSET_XN * 1000 + 3
    // 战役关卡 冰封王座暗夜精灵族战役04 插曲（bj_CAMPAIGN_OFFSET_XN * 1000 + 4）
    constant integer bj_MISSION_INDEX_XN04 = bj_CAMPAIGN_OFFSET_XN * 1000 + 4
    // 战役关卡 冰封王座暗夜精灵族战役05（bj_CAMPAIGN_OFFSET_XN * 1000 + 5）
    constant integer bj_MISSION_INDEX_XN05 = bj_CAMPAIGN_OFFSET_XN * 1000 + 5
    // 战役关卡 冰封王座暗夜精灵族战役06（bj_CAMPAIGN_OFFSET_XN * 1000 + 6）
    constant integer bj_MISSION_INDEX_XN06 = bj_CAMPAIGN_OFFSET_XN * 1000 + 6
    // 战役关卡 冰封王座暗夜精灵族战役06 插曲（bj_CAMPAIGN_OFFSET_XN * 1000 + 7）
    constant integer bj_MISSION_INDEX_XN07 = bj_CAMPAIGN_OFFSET_XN * 1000 + 7
    // 战役关卡 冰封王座暗夜精灵族战役07（bj_CAMPAIGN_OFFSET_XN * 1000 + 8）
    constant integer bj_MISSION_INDEX_XN08 = bj_CAMPAIGN_OFFSET_XN * 1000 + 8
    // 战役关卡 冰封王座暗夜精灵族战役08（bj_CAMPAIGN_OFFSET_XN * 1000 + 9）
    constant integer bj_MISSION_INDEX_XN09 = bj_CAMPAIGN_OFFSET_XN * 1000 + 9
    // 战役关卡 冰封王座暗夜精灵族战役08结局（bj_CAMPAIGN_OFFSET_XN * 1000 + 10）
    constant integer bj_MISSION_INDEX_XN10 = bj_CAMPAIGN_OFFSET_XN * 1000 + 10
    // Expansion Human

    // 战役关卡 冰封王座人族战役01（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 0）
    constant integer bj_MISSION_INDEX_XH00 = bj_CAMPAIGN_OFFSET_XH * 1000 + 0
    // 战役关卡 冰封王座人族战役02（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 1）
    constant integer bj_MISSION_INDEX_XH01 = bj_CAMPAIGN_OFFSET_XH * 1000 + 1
    // 战役关卡 冰封王座人族战役03（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 2）
    constant integer bj_MISSION_INDEX_XH02 = bj_CAMPAIGN_OFFSET_XH * 1000 + 2
    // 战役关卡 冰封王座人族战役03 秘密关卡（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 3）
    constant integer bj_MISSION_INDEX_XH03 = bj_CAMPAIGN_OFFSET_XH * 1000 + 3
    // 战役关卡 冰封王座人族战役03 插曲（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 4）
    constant integer bj_MISSION_INDEX_XH04 = bj_CAMPAIGN_OFFSET_XH * 1000 + 4
    // 战役关卡 冰封王座人族战役04（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 5）
    constant integer bj_MISSION_INDEX_XH05 = bj_CAMPAIGN_OFFSET_XH * 1000 + 5
    // 战役关卡 冰封王座人族战役04 插曲（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 6）
    constant integer bj_MISSION_INDEX_XH06 = bj_CAMPAIGN_OFFSET_XH * 1000 + 6
    // 战役关卡 冰封王座人族战役05（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 7）
    constant integer bj_MISSION_INDEX_XH07 = bj_CAMPAIGN_OFFSET_XH * 1000 + 7
    // 战役关卡 冰封王座人族战役06（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 8）
    constant integer bj_MISSION_INDEX_XH08 = bj_CAMPAIGN_OFFSET_XH * 1000 + 8
    // 战役关卡 冰封王座人族战役06 结局（bj_j_CAMPAIGN_OFFSET_XH * 1000 + 9）
    constant integer bj_MISSION_INDEX_XH09 = bj_CAMPAIGN_OFFSET_XH * 1000 + 9
    // Expansion Undead

    // 战役关卡 冰封王座不死族战役01（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 0）
    constant integer bj_MISSION_INDEX_XU00 = bj_CAMPAIGN_OFFSET_XU * 1000 + 0
    // 战役关卡 冰封王座不死族战役01 插曲（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 1）
    constant integer bj_MISSION_INDEX_XU01 = bj_CAMPAIGN_OFFSET_XU * 1000 + 1
    // 战役关卡 冰封王座不死族战役02（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 2）
    constant integer bj_MISSION_INDEX_XU02 = bj_CAMPAIGN_OFFSET_XU * 1000 + 2
    // 战役关卡 冰封王座不死族战役02 插曲（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 3）
    constant integer bj_MISSION_INDEX_XU03 = bj_CAMPAIGN_OFFSET_XU * 1000 + 3
    // 战役关卡 冰封王座不死族战役03（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 4）
    constant integer bj_MISSION_INDEX_XU04 = bj_CAMPAIGN_OFFSET_XU * 1000 + 4
    // 战役关卡 冰封王座不死族战役04（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 5）
    constant integer bj_MISSION_INDEX_XU05 = bj_CAMPAIGN_OFFSET_XU * 1000 + 5
    // 战役关卡 冰封王座不死族战役05（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 6）
    constant integer bj_MISSION_INDEX_XU06 = bj_CAMPAIGN_OFFSET_XU * 1000 + 6
    // 战役关卡 冰封王座不死族战役06（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 7）
    constant integer bj_MISSION_INDEX_XU07 = bj_CAMPAIGN_OFFSET_XU * 1000 + 7
    // 战役关卡 冰封王座不死族战役07a（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 8）
    constant integer bj_MISSION_INDEX_XU08 = bj_CAMPAIGN_OFFSET_XU * 1000 + 8
    // 战役关卡 冰封王座不死族战役07b（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 9）
    constant integer bj_MISSION_INDEX_XU09 = bj_CAMPAIGN_OFFSET_XU * 1000 + 9
    // 战役关卡 冰封王座不死族战役07c（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 10）
    constant integer bj_MISSION_INDEX_XU10 = bj_CAMPAIGN_OFFSET_XU * 1000 + 10
    // 战役关卡 冰封王座不死族战役07 插曲（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 11）
    constant integer bj_MISSION_INDEX_XU11 = bj_CAMPAIGN_OFFSET_XU * 1000 + 11
    // 战役关卡 冰封王座不死族战役08（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 12）
    constant integer bj_MISSION_INDEX_XU12 = bj_CAMPAIGN_OFFSET_XU * 1000 + 12
    // 战役关卡 冰封王座不死族战役08 结局（bj_j_CAMPAIGN_OFFSET_XU * 1000 + 13）
    constant integer bj_MISSION_INDEX_XU13 = bj_CAMPAIGN_OFFSET_XU * 1000 + 13
    // Expansion Orc

    // 战役关卡 冰封王座兽族（额外战役）01（bj_CAMPAIGN_OFFSET_XO * 1000 + 0）
    constant integer bj_MISSION_INDEX_XO00 = bj_CAMPAIGN_OFFSET_XO * 1000 + 0
    // 战役关卡 冰封王座兽族（额外战役）02（bj_CAMPAIGN_OFFSET_XO * 1000 + 1）
    constant integer bj_MISSION_INDEX_XO01 = bj_CAMPAIGN_OFFSET_XO * 1000 + 1
    // 战役关卡 冰封王座兽族（额外战役）03（bj_CAMPAIGN_OFFSET_XO * 1000 + 2）
    constant integer bj_MISSION_INDEX_XO02 = bj_CAMPAIGN_OFFSET_XO * 1000 + 2
    // 战役关卡 冰封王座兽族（额外战役）04（bj_CAMPAIGN_OFFSET_XO * 1000 + 3）
    constant integer bj_MISSION_INDEX_XO03 = bj_CAMPAIGN_OFFSET_XO * 1000 + 3

    // Cinematic indexing constants

    // 战役过场电影名称 教程（0）
    constant integer bj_CINEMATICINDEX_TOP = 0
    // 战役过场电影名称 人族开场（1）
    constant integer bj_CINEMATICINDEX_HOP = 1
    // 战役过场电影名称 人族结尾（2）
    constant integer bj_CINEMATICINDEX_HED = 2
    // 战役过场电影名称 兽族开场（3）
    constant integer bj_CINEMATICINDEX_OOP = 3
    // 战役过场电影名称 兽族结尾（4）
    constant integer bj_CINEMATICINDEX_OED = 4
    // 战役过场电影名称 不死族开场（5）
    constant integer bj_CINEMATICINDEX_UOP = 5
    // 战役过场电影名称 不死族结尾（6）
    constant integer bj_CINEMATICINDEX_UED = 6
    // 战役过场电影名称 暗夜精灵族开场（7）
    constant integer bj_CINEMATICINDEX_NOP = 7
    // 战役过场电影名称 暗夜精灵族结尾（8）
    constant integer bj_CINEMATICINDEX_NED = 8
    // 战役过场电影名称 冰封王座开场（9）
    constant integer bj_CINEMATICINDEX_XOP = 9
    // 战役过场电影名称 冰封王座结尾（10）
    constant integer bj_CINEMATICINDEX_XED = 10

    // Alliance settings

    // 联盟设置 相互敌对
    constant integer bj_ALLIANCE_UNALLIED = 0
    // 联盟设置 相互敌对但共享视野
    constant integer bj_ALLIANCE_UNALLIED_VISION = 1
    // 联盟设置 相互结盟
    constant integer bj_ALLIANCE_ALLIED = 2
    // 联盟设置 相互结盟且共享视野
    constant integer bj_ALLIANCE_ALLIED_VISION = 3
    // 联盟设置 相互结盟并共享视野和部分单位
    constant integer bj_ALLIANCE_ALLIED_UNITS = 4
    // 联盟设置 相互结盟并共享视野和所有单位
    constant integer bj_ALLIANCE_ALLIED_ADVUNITS = 5
    // 联盟设置 相互中立
    constant integer bj_ALLIANCE_NEUTRAL = 6
    // 联盟设置 相互中立但共享视野
    constant integer bj_ALLIANCE_NEUTRAL_VISION = 7

    // Keyboard Event Types

    // 键盘事件  按下按键
    constant integer bj_KEYEVENTTYPE_DEPRESS = 0
    // 键盘事件  松开按键
    constant integer bj_KEYEVENTTYPE_RELEASE = 1

    // Keyboard Event Keys

    // 键盘按键事件 方向键（左）
    constant integer bj_KEYEVENTKEY_LEFT = 0
    // 键盘按键事件 方向键（右）
    constant integer bj_KEYEVENTKEY_RIGHT = 1
    // 键盘按键事件 方向键（下）
    constant integer bj_KEYEVENTKEY_DOWN = 2
    // 键盘按键事件 方向键（上）
    constant integer bj_KEYEVENTKEY_UP = 3

    // Mouse Event Types

    // 鼠标事件  按下
    constant integer bj_MOUSEEVENTTYPE_DOWN = 0
    // 鼠标事件  松开
    constant integer bj_MOUSEEVENTTYPE_UP = 1
    // 鼠标事件  移动
    constant integer bj_MOUSEEVENTTYPE_MOVE = 2

    // Transmission timing methods

    // 消息持续时间类型 时间类型 - 增加
    constant integer bj_TIMETYPE_ADD = 0
    // 消息持续时间类型 时间类型 - 设为（指定值）
    constant integer bj_TIMETYPE_SET = 1
    // 消息持续时间类型 时间类型 - 减少
    constant integer bj_TIMETYPE_SUB = 2

    // Camera bounds adjustment methods

    // 镜头界限调整 扩张
    constant integer bj_CAMERABOUNDS_ADJUST_ADD = 0
    // 镜头界限调整 收缩
    constant integer bj_CAMERABOUNDS_ADJUST_SUB = 1

    // Quest creation states

    // 任务类型（创建任务时设置） 主要/主线任务
    constant integer bj_QUESTTYPE_REQ_DISCOVERED = 0
    // 任务类型（创建任务时设置） 主要/主线任务（未发现）
    constant integer bj_QUESTTYPE_REQ_UNDISCOVERED = 1
    // 任务类型（创建任务时设置） 可选/支线任务
    constant integer bj_QUESTTYPE_OPT_DISCOVERED = 2
    // 任务类型（创建任务时设置） 可选/支线任务（未发现）
    constant integer bj_QUESTTYPE_OPT_UNDISCOVERED = 3

    // Quest message types

    // 任务信息类型 发现任务
    constant integer bj_QUESTMESSAGE_DISCOVERED = 0
    // 任务信息类型 任务更新
    constant integer bj_QUESTMESSAGE_UPDATED = 1
    // 任务信息类型 任务完成
    constant integer bj_QUESTMESSAGE_COMPLETED = 2
    // 任务信息类型 任务失败
    constant integer bj_QUESTMESSAGE_FAILED = 3
    // 任务信息类型 任务要求
    constant integer bj_QUESTMESSAGE_REQUIREMENT = 4
    // 任务信息类型 任务失败
    constant integer bj_QUESTMESSAGE_MISSIONFAILED = 5
    // 任务信息类型 常驻提示
    constant integer bj_QUESTMESSAGE_ALWAYSHINT = 6
    // 任务信息类型 提示
    constant integer bj_QUESTMESSAGE_HINT = 7
    // 任务信息类型 秘密
    constant integer bj_QUESTMESSAGE_SECRET = 8
    // 任务信息类型 获得新单位
    constant integer bj_QUESTMESSAGE_UNITACQUIRED = 9
    // 任务信息类型 新单位可用（新获得单位的介绍）
    constant integer bj_QUESTMESSAGE_UNITAVAILABLE = 10
    // 任务信息类型 获得新物品
    constant integer bj_QUESTMESSAGE_ITEMACQUIRED = 11
    // 任务信息类型 警告
    constant integer bj_QUESTMESSAGE_WARNING = 12

    // Leaderboard sorting methods

    // 排行榜排序类型 按分值排序
    constant integer bj_SORTTYPE_SORTBYVALUE = 0
    // 排行榜排序类型 按玩家排序
    constant integer bj_SORTTYPE_SORTBYPLAYER = 1
    // 排行榜排序类型 按文本排序
    constant integer bj_SORTTYPE_SORTBYLABEL = 2

    // Cinematic fade filter methods

    // 电影淡化 淡入
    constant integer bj_CINEFADETYPE_FADEIN = 0
    // 电影淡化 淡出
    constant integer bj_CINEFADETYPE_FADEOUT = 1
    // 电影淡化 淡出并淡入（一并使用）
    constant integer bj_CINEFADETYPE_FADEOUTIN = 2

    // Buff removal methods

    // BUFF属性 按类别删除BUFF 肯定（正面BUFF）
    constant integer bj_REMOVEBUFFS_POSITIVE = 0
    // BUFF属性 按类别删除BUFF 否定（负面BUFF）
    constant integer bj_REMOVEBUFFS_NEGATIVE = 1
    // BUFF属性 按类别删除BUFF 全部（正面BUFF 和 负面BUFF）
    constant integer bj_REMOVEBUFFS_ALL = 2
    // BUFF属性 按类别删除BUFF 除生命计时器外的全部BUFF
    constant integer bj_REMOVEBUFFS_NONTLIFE = 3

    // Buff properties - polarity

    // BUFF属性 极性 肯定（正面BUFF）
    constant integer bj_BUFF_POLARITY_POSITIVE = 0
    // BUFF属性 极性 否定（负面BUFF）
    constant integer bj_BUFF_POLARITY_NEGATIVE = 1
    // BUFF属性 极性 肯定 或 否定（正面BUFF 或 负面BUFF）
    constant integer bj_BUFF_POLARITY_EITHER = 2

    // Buff properties - resist type

    // BUFF属性 魔法BUFF
    constant integer bj_BUFF_RESIST_MAGIC = 0
    // BUFF属性 物理BUFF
    constant integer bj_BUFF_RESIST_PHYSICAL = 1
    // BUFF属性 物理BUFF 或 魔法BUFF
    constant integer bj_BUFF_RESIST_EITHER = 2
    // BUFF属性 物理BUFF 和 魔法BUFF
    constant integer bj_BUFF_RESIST_BOTH = 3

    // Hero stats

    // 英雄数值统计 力量值
    constant integer bj_HEROSTAT_STR = 0
    // 英雄数值统计 敏捷值
    constant integer bj_HEROSTAT_AGI = 1
    // 英雄数值统计 智力值
    constant integer bj_HEROSTAT_INT = 2

    // Hero skill point modification methods

    // 英雄技能点 增加
    constant integer bj_MODIFYMETHOD_ADD = 0
    // 英雄技能点 减少
    constant integer bj_MODIFYMETHOD_SUB = 1
    // 英雄技能点 设为（指定值）
    constant integer bj_MODIFYMETHOD_SET = 2

    // Unit state adjustment methods (for replaced units)

    // 替换单位时，新单位生命值和魔法值为 旧单位 的值
    constant integer bj_UNIT_STATE_METHOD_ABSOLUTE = 0
    // 替换单位时，新单位生命值和魔法值为 旧单位相关物 的值
    constant integer bj_UNIT_STATE_METHOD_RELATIVE = 1
    // 替换单位时，新单位生命值和魔法值为 新单位的默认值
    constant integer bj_UNIT_STATE_METHOD_DEFAULTS = 2
    // 替换单位时，新单位生命值和魔法值为 使用新单位的最大值
    constant integer bj_UNIT_STATE_METHOD_MAXIMUM = 3

    // Gate operations

    // 操作可破坏物 关闭门
    constant integer bj_GATEOPERATION_CLOSE = 0
    // 操作可破坏物 开启门
    constant integer bj_GATEOPERATION_OPEN = 1
    // 操作可破坏物 摧毁门
    constant integer bj_GATEOPERATION_DESTROY = 2

	// Game cache value types

	// 游戏缓存类型 布尔值
	constant integer bj_GAMECACHE_BOOLEAN = 0
	// 游戏缓存类型 整数
	constant integer bj_GAMECACHE_INTEGER = 1
	// 游戏缓存类型 实数
	constant integer bj_GAMECACHE_REAL = 2
	// 游戏缓存类型 单位
	constant integer bj_GAMECACHE_UNIT = 3
	// 游戏缓存类型 字符串
	constant integer bj_GAMECACHE_STRING = 4
	
	// Hashtable value types

	// 哈希表类型 布尔值
	constant integer bj_HASHTABLE_BOOLEAN = 0
	// 哈希表类型 整数
	constant integer bj_HASHTABLE_INTEGER = 1
	// 哈希表类型 实数
	constant integer bj_HASHTABLE_REAL = 2
	// 哈希表类型 字符串
	constant integer bj_HASHTABLE_STRING = 3
	// 哈希表类型 句柄
	constant integer bj_HASHTABLE_HANDLE = 4

    // Item status types

    // 物品状态 隐藏的
    constant integer bj_ITEM_STATUS_HIDDEN = 0
    // 物品状态 拥有的
    constant integer bj_ITEM_STATUS_OWNED = 1
    // 物品状态 无敌的
    constant integer bj_ITEM_STATUS_INVULNERABLE = 2
    // 物品状态 力量提升的
    constant integer bj_ITEM_STATUS_POWERUP = 3
    // 物品状态 可出售的
    constant integer bj_ITEM_STATUS_SELLABLE = 4
    // 物品状态 可以被抵押掉的
    constant integer bj_ITEM_STATUS_PAWNABLE = 5

    // Itemcode status types

    // 物品类型状态 力量提升的
    constant integer bj_ITEMCODE_STATUS_POWERUP = 0
    // 物品类型状态 可出售的
    constant integer bj_ITEMCODE_STATUS_SELLABLE = 1
    // 物品类型状态 可以被抵押掉的
    constant integer bj_ITEMCODE_STATUS_PAWNABLE = 2

    // Minimap ping styles

    // 小地图提示样式 简易
    constant integer bj_MINIMAPPINGSTYLE_SIMPLE = 0
    // 小地图提示样式 闪烁
    constant integer bj_MINIMAPPINGSTYLE_FLASHY = 1
    // 小地图提示样式 警告
    constant integer bj_MINIMAPPINGSTYLE_ATTACK = 2
	
    // Campaign Minimap icon styles

    // 小地图（任务）图标样式 主任务图标（普通）
    constant integer bj_CAMPPINGSTYLE_PRIMARY = 0
    // 小地图（任务）图标样式 主任务图标（绿色）
    constant integer bj_CAMPPINGSTYLE_PRIMARY_GREEN = 1
    // 小地图（任务）图标样式 主任务图标（红色）
    constant integer bj_CAMPPINGSTYLE_PRIMARY_RED = 2
    // 小地图（任务）图标样式 任务奖励图标
    constant integer bj_CAMPPINGSTYLE_BONUS = 3
    // 小地图（任务）图标样式 任务交付图标
    constant integer bj_CAMPPINGSTYLE_TURNIN = 4
    // 小地图（任务）图标样式 任务BOSS图标
	constant integer bj_CAMPPINGSTYLE_BOSS = 5
    // 小地图（任务）图标样式 友方占领图标
	constant integer bj_CAMPPINGSTYLE_CONTROL_ALLY	= 6
    // 小地图（任务）图标样式 中立图标（无人占领）
	constant integer bj_CAMPPINGSTYLE_CONTROL_NEUTRAL	= 7
    // 小地图（任务）图标样式 敌方占领图标
	constant integer bj_CAMPPINGSTYLE_CONTROL_ENEMY	= 8

    // Corpse creation settings

    // 尸体腐烂时间上限，默认8.00
    constant real bj_CORPSE_MAX_DEATH_TIME = 8.00

    // Corpse creation styles

    // 尸体类型 骨头
    constant integer bj_CORPSETYPE_FLESH = 0
    // 尸体类型 血肉
    constant integer bj_CORPSETYPE_BONE = 1

    // Elevator pathing-blocker destructable code

    // 升降台墙 物编代码 'DTep'
    // 可在物编的 可破坏物 分类下找到
    constant integer bj_ELEVATOR_BLOCKER_CODE = 'DTep'
    // 升降台1 物编代码 'DTrf'
    // 可在物编的 可破坏物 分类下找到
    constant integer bj_ELEVATOR_CODE01 = 'DTrf'
    // 升降台2 物编代码 'DTrx'
    // 可在物编的 可破坏物 分类下找到
    constant integer bj_ELEVATOR_CODE02 = 'DTrx'

    // Elevator wall codes

    // 升降台墙壁 所有墙
    constant integer bj_ELEVATOR_WALL_TYPE_ALL = 0
    // 升降台墙壁 东墙
    constant integer bj_ELEVATOR_WALL_TYPE_EAST = 1
    // 升降台墙壁 北墙
    constant integer bj_ELEVATOR_WALL_TYPE_NORTH = 2
    // 升降台墙壁 南墙
    constant integer bj_ELEVATOR_WALL_TYPE_SOUTH = 3
    // 升降台墙壁 西墙
    constant integer bj_ELEVATOR_WALL_TYPE_WEST = 4

    //-----------------------------------------------------------------------
    // Variables
    
    // Force predefs

    // 玩家组（所有玩家）
    force bj_FORCE_ALL_PLAYERS = null
    // 玩家组（数组）
    force array bj_FORCE_PLAYER
    // 给予首发英雄初始物品的数量
    // 游戏初始化时会根据游戏版本自动设置
    integer bj_MELEE_MAX_TWINKED_HEROES = 0

    // Map area rects

    // 区域 玩家可用地图区域
    rect bj_mapInitialPlayableArea = null
    // 区域 镜头范围区域
    rect bj_mapInitialCameraBounds = null

    // Utility function vars

    // 循环A索引
    integer bj_forLoopAIndex = 0
    // 循环A索引
    integer bj_forLoopBIndex = 0
    // 循环A索引结束值
    integer bj_forLoopAIndexEnd = 0
    // 循环A索引结束值
    integer bj_forLoopBIndexEnd = 0
    // 玩家检查是否完成，自动检查，检查完成后自动变为真，用于开局系统自动检查所有玩家槽是电脑（不论是否具备AI）还是真人
    boolean bj_slotControlReady = false
    // 玩家槽可用标识，每位玩家配一个，系统在开局时自动设置
    boolean array bj_slotControlUsed
    // 玩家槽玩家类型标识（电脑/真人），每位玩家配一个
    mapcontrol array bj_slotControl

    // Game started detection vars

    // 开局计时器
    timer bj_gameStartedTimer = null
    // 游戏开始标识，默认为未开始（false）
    boolean bj_gameStarted = false
    // 开局音量控制计时器
    timer bj_volumeGroupsTimer = CreateTimer()

    // Singleplayer check

    // 单机标识（只有一位人类玩家），默认为否（false）
    boolean bj_isSinglePlayer = false

    // Day/Night Cycle vars

    // 昼夜参数 白天音效触发器
    trigger bj_dncSoundsDay = null
    // 昼夜参数 夜晚音效触发器
    trigger bj_dncSoundsNight = null
    // 昼夜参数 白天环境音效
    sound bj_dayAmbientSound = null
    // 昼夜参数 夜晚环境音效
    sound bj_nightAmbientSound = null
    // 昼夜参数 黎明音效触发器
    trigger bj_dncSoundsDawn = null
    // 昼夜参数 黄昏音效触发器
    trigger bj_dncSoundsDusk = null
    // 昼夜参数 黎明音效
    sound bj_dawnSound = null
    // 昼夜参数 黄昏音效
    sound bj_duskSound = null
    // 昼夜参数 黎明/黄昏音效启用标识，默认启用（true）
    boolean bj_useDawnDuskSounds = true
    // 昼夜参数 昼夜交替启用标识，默认启用（false）
    boolean bj_dncIsDaytime = false

    // Triggered sounds

    // 音效 小地图提示音效
    //sound              bj_pingMinimapSound         = null
    // 音效 可营救音效
    sound bj_rescueSound = null
    // 音效 发现任务音效
    sound bj_questDiscoveredSound = null
    // 音效 任务更新音效
    sound bj_questUpdatedSound = null
    // 音效 任务完成音效
    sound bj_questCompletedSound = null
    // 音效 任务失败音效
    sound bj_questFailedSound = null
    // 音效 任务提示音效
    sound bj_questHintSound = null
    // 音效 发现任务秘密音效
    sound bj_questSecretSound = null
    // 音效 获得新任务物品音效
    sound bj_questItemAcquiredSound = null
    // 音效 任务警告音效
    sound bj_questWarningSound = null
    // 音效 胜利对话框音效
    sound bj_victoryDialogSound = null
    // 音效 失败对话框音效
    sound bj_defeatDialogSound = null

    // Marketplace vars

    // 市场相关变量 任意单位/物品被出售后扣除库存触发器
    trigger bj_stockItemPurchased = null
    // 市场相关变量 物品更新计时器
    timer bj_stockUpdateTimer = null
    // 市场相关变量 物品分类布尔值数组 永久
    boolean array bj_stockAllowedPermanent
    // 市场相关变量 物品分类布尔值数组 可充
    boolean array bj_stockAllowedCharged
    // 市场相关变量 物品分类布尔值数组 人造
    boolean array bj_stockAllowedArtifact
    // 市场相关变量 物品等级 用于获取各物品分类布尔值数组检查到的值
    // bj_stockAllowedPermanent[Level]
    // bj_stockAllowedCharged[Level]
    // bj_stockAllowedArtifact[Level]
    integer bj_stockPickedItemLevel = 0
    // 市场相关变量 物品分类
    itemtype bj_stockPickedItemType

    // Melee vars

    // 可见性触发器
    trigger bj_meleeVisibilityTrained = null
    // 可见性标识，默认可见（true）
    boolean bj_meleeVisibilityIsDay = true
    // 已给予首发英雄初始物品标识，默认未给予（false）
    boolean bj_meleeGrantHeroItems = false
    // 距离玩家出生点最近的金矿所在的点
    location bj_meleeNearestMineToLoc = null
    // 距离玩家出生点最近的金矿
    unit bj_meleeNearestMine = null
    // 距离玩家出生点最近的金矿的距离，默认值0.00
    real bj_meleeNearestMineDist = 0.00
    // 游戏结束标识，默认未结束（false）
    boolean bj_meleeGameOver = false
    // 游戏失败标识，每位玩家配一个（数组）
    boolean array bj_meleeDefeated
    // 游戏胜利标识，每位玩家配一个（数组）
    boolean array bj_meleeVictoried
    // 创建初始单位触发器动作为亡灵种族创建的食尸鬼，每位玩家配一个（数组）
    unit array bj_ghoul
    // 玩家即将暴露计时器，每位玩家配一个（数组）
    // 失去所有基地时，系统会提示要在限定内造一个基地，否则会暴露，这是提示的计时器
    timer array bj_crippledTimer
    // 玩家即将暴露计时器计时窗口，每位玩家配一个（数组）
    // 失去所有基地时，系统会提示要在限定内造一个基地，否则会暴露，这是提示的计时窗口
    timerdialog array bj_crippledTimerWindows
    // 玩家即将暴露标识，每位玩家配一个（数组）
    // 失去所有基地时，系统会提示要在限定内造一个基地，失去所有基地会变为真
    boolean array bj_playerIsCrippled
    // 玩家暴露标识，每位玩家配一个（数组）
    // 失去所有基地时，系统会提示要在限定内造一个基地，如果计时完成没有造，变为真
    boolean array bj_playerIsExposed
    // 玩家暴露计时器显示标识，默认未显示（false）
    // 失去所有基地时，系统会提示要在限定内造一个基地，如果没造，这是暴露时间的计时器
    boolean bj_finishSoonAllExposed = false
    // 玩家即将暴露计时器计时窗口
    // 失去所有基地时，系统会提示要在限定内造一个基地，如果没造，这是暴露时间的计时窗口
    timerdialog bj_finishSoonTimerDialog = null
    // 首发英雄初始物品创建数量，每位玩家配一个（数组）
    // 用于记录已经给首发创建了多少个初始物品
    integer array bj_meleeTwinkedHeroes

    // Rescue behavior vars

    // 营救触发器
    trigger bj_rescueUnitBehavior = null
    // 被营救后改变单位的颜色标识，默认允许改变（true）
    boolean bj_rescueChangeColorUnit = true
    // 被营救后改变建筑的颜色标识，默认允许改变（true）
    boolean bj_rescueChangeColorBldg = true

    // Transmission vars

    // 电影场景结束计时器
    timer bj_cineSceneEndingTimer = null
    // 最后播放的电影场景音效
    sound bj_cineSceneLastSound = null
    // 跳过电影场景触发器
    trigger bj_cineSceneBeingSkipped = null

    // Cinematic mode vars

    // 电影模式设置 默认速度，默认普通
    gamespeed bj_cineModePriorSpeed = MAP_SPEED_NORMAL
    // 电影模式设置 迷雾状态，默认禁用（false）
    boolean bj_cineModePriorFogSetting = false
    // 电影模式设置 黑色阴影状态，默认禁用（false）
    boolean bj_cineModePriorMaskSetting = false
    // 电影模式设置 电影准备状态，默认未准备完成（false）
    boolean bj_cineModeAlreadyIn = false
    // 电影模式设置 黎明/昏黄状态，默认禁用（false）
    boolean bj_cineModePriorDawnDusk = false
    // 电影模式设置 保存速度，默认值0，游戏初始化后取随机数0~1000000
    integer bj_cineModeSavedSeed = 0

    // Cinematic fade vars

    // 电影淡入淡出滤镜 淡化计时器
    timer bj_cineFadeFinishTimer = null
    // 电影淡入淡出滤镜 继续淡化计时器
    timer bj_cineFadeContinueTimer = null
    // 电影淡入淡出滤镜 继续淡化（红）
    real bj_cineFadeContinueRed = 0
    // 电影淡入淡出滤镜 继续淡化（绿）
    real bj_cineFadeContinueGreen = 0
    // 电影淡入淡出滤镜 继续淡化（蓝）
    real bj_cineFadeContinueBlue = 0
    // 电影淡入淡出滤镜 透明度
    real bj_cineFadeContinueTrans = 0
    // 电影淡入淡出滤镜 转化时间
    real bj_cineFadeContinueDuration = 0
    // 电影淡入淡出滤镜 使用图片（图片路径）
    string bj_cineFadeContinueTex = ""

    // QueuedTriggerExecute vars

    // 触发器队列执行次数统计
    integer bj_queuedExecTotal = 0
    // 触发器队列执行触发器数组
    trigger array bj_queuedExecTriggers
    // 触发器队列执行布尔值数组，用于登记当前触发器是否使用了条件
    boolean array bj_queuedExecUseConds
    // 触发器队列执行计时器
    timer bj_queuedExecTimeoutTimer = CreateTimer()
    // 触发器队列执行超时触发器
    trigger bj_queuedExecTimeout = null

    // Helper vars (for Filter and Enum funcs)

    // 可破坏物死亡/毁坏事件触发器 统计死亡/毁坏的可破坏物数量
    integer bj_destInRegionDiesCount = 0
    // 可破坏物死亡/毁坏事件触发器 选取区域内的死亡/毁坏的可破坏物
    trigger bj_destInRegionDiesTrig = null
    // 单位组内单位数量
    integer bj_groupCountUnits = 0
    // 玩家组内的玩家数量
    integer bj_forceCountPlayers = 0
    // 获取单位组中指定类型的单位，指定的单位类型
    integer bj_groupEnumTypeId = 0
    // 获取玩家在指定矩形区域中的单位，指定的玩家
    player bj_groupEnumOwningPlayer = null
    // 指代往 A单位组 添加 B单位组 单位完成后，需要销毁的单位组
    group bj_groupAddGroupDest = null
    // 指代 A单位组 移除 B单位组 单位完成后，需要销毁的单位组
    group bj_groupRemoveGroupDest = null
    // 获取单位组中随机单位，统计单位组内的单位数量
    integer bj_groupRandomConsidered = 0
    // 获取单位组随机单位返回的单位
    unit bj_groupRandomCurrentPick = null
    // 最后创建且需要销毁的单位组
    group bj_groupLastCreatedDest = null
    // 随机选取单位组中的单位，返回的新单位组
    group bj_randomSubGroupGroup = null
    // 随机选取单位组中的单位，指定的单位数量
    integer bj_randomSubGroupWant = 0
    // 随机选取单位组中的单位，原单位组的单位数量
    integer bj_randomSubGroupTotal = 0
    // 随机选取单位组中的单位，指定的单位数量 与 原单位组的单位数量 的比例
    // bj_randomSubGroupChance = I2R(bj_randomSubGroupWant) / I2R(bj_randomSubGroupTotal)
    real bj_randomSubGroupChance = 0
    // 随机选取矩形区域的可破坏物，区域内的可破坏物数量
    integer bj_destRandomConsidered = 0
    // 随机选取矩形区域的可破坏物，选取的可破坏物
    destructable bj_destRandomCurrentPick = null
    // 可破坏物 升降台墙
    destructable bj_elevatorWallBlocker = null
    // 可破坏物 相邻的升降台
    destructable bj_elevatorNeighbor = null
    // 随机选取的区域中的物品，区域内的物品数量
    integer bj_itemRandomConsidered = 0
    // 随机选取的区域中的物品，选取的物品
    item bj_itemRandomCurrentPick = null
    // 随机获取玩家组中的玩家，玩家组的玩家数量
    integer bj_forceRandomConsidered = 0
    // 随机获取玩家组中的玩家，选取的玩家
    player bj_forceRandomCurrentPick = null
    // 可营救单位
    unit bj_makeUnitRescuableUnit = null
    // 可营救单位已创建标识，默认为真（true）
    boolean bj_makeUnitRescuableFlag = true
    // 暂停/恢复 所有单位标识，默认为真（true）
    boolean bj_pauseAllUnitsFlag = true
    // 可破坏物中心点
    location bj_enumDestructableCenter = null
    // 可破坏物半径（范围）
    real bj_enumDestructableRadius = 0
    // 设置玩家颜色
    playercolor bj_setPlayerTargetColor = null
    // 单位组选择的单位已死亡标识，默认为已死亡（true）
    boolean bj_isUnitGroupDeadResult = true
    // 单位组为空标识，默认为真（true）
    boolean bj_isUnitGroupEmptyResult = true
    // 单位组选取的单位在区域内标识，默认为真（true）
    boolean bj_isUnitGroupInRectResult = true
    // 单位组区域，用于判断单位组选取的单位是否在指定区域内
    rect bj_isUnitGroupInRectRect = null
    // 游戏结束时展示得分屏标识，默认为不允许（false）
    boolean bj_changeLevelShowScores = false
    // 下一张地图的名字（用于战役）
    string bj_changeLevelMapName = null
    // 暂停衰变延迟血肉单位组
    // 用于对战初始化的血肉和尸体腐烂
    group bj_suspendDecayFleshGroup = CreateGroup()
    // 暂停衰变延迟尸体单位组
    // 用于对战初始化的血肉和尸体腐烂
    group bj_suspendDecayBoneGroup = CreateGroup()
    // 暂停衰变延迟计时器
    // 用于对战初始化的血肉和尸体腐烂
    timer bj_delayedSuspendDecayTimer = CreateTimer()
    // 暂停衰变延迟触发器
    // 用于对战初始化的血肉和尸体腐烂
    trigger bj_delayedSuspendDecayTrig = null
    // 匹配玩家拥有且存活的单位类型总数量
    integer bj_livingPlayerUnitsTypeId = 0
    // 最后死亡的单位/物品/可破坏物
    widget bj_lastDyingWidget = null

    // Random distribution vars

    // 随机分布数
    integer bj_randDistCount = 0
    // 随机分布ID（数组）
    integer array bj_randDistID
    // 随机分布几率（数组）
    integer array bj_randDistChance

    // Last X'd vars

    // 最后创建的单位
    unit bj_lastCreatedUnit = null
    // 最后创建的物品
    item bj_lastCreatedItem = null
    // 最后删除的物品
    item bj_lastRemovedItem = null
    // 最后创建的闹鬼金矿
    unit bj_lastHauntedGoldMine = null
    // 最后创建的可破坏物
    destructable bj_lastCreatedDestructable = null
    // 最后创建的单位组
    group bj_lastCreatedGroup = CreateGroup()
    // 最后创建的可见度修正器
    fogmodifier bj_lastCreatedFogModifier = null
    // 最后创建的特效
    effect bj_lastCreatedEffect = null
    // 最后创建的天气特效
    weathereffect bj_lastCreatedWeatherEffect = null
    // 最后创建的地形变化
    terraindeformation bj_lastCreatedTerrainDeformation = null
    // 最后创建的任务
    quest bj_lastCreatedQuest = null
    // 最后创建的任务要求
    questitem bj_lastCreatedQuestItem = null
    // 最后创建的任务失败条件
    defeatcondition bj_lastCreatedDefeatCondition = null
    // 最后启用的计时器
    timer bj_lastStartedTimer = CreateTimer()
    // 最后创建的计时器窗口
    timerdialog bj_lastCreatedTimerDialog = null
    // 最后创建的排行榜
    leaderboard bj_lastCreatedLeaderboard = null
    // 最后创建的多面板
    multiboard bj_lastCreatedMultiboard = null
    // 最后播放的音效
    sound bj_lastPlayedSound = null
    // 最后播放的音乐
    string bj_lastPlayedMusic = ""
    // 最后播放消息的持续时间
    real bj_lastTransmissionDuration = 0
    // 最后创建的游戏缓存
    gamecache bj_lastCreatedGameCache = null
    // 最后创建的哈希表
    hashtable bj_lastCreatedHashtable = null
    // 最后被装载的单位（被飞艇、船、被缠绕的金矿等装载的单位）
    unit bj_lastLoadedUnit = null
    // 最后创建的按钮
    button bj_lastCreatedButton = null
    // 最后替换的单位
    unit bj_lastReplacedUnit = null
    // 最后创建的文本
    texttag bj_lastCreatedTextTag = null
    // 最后创建的闪电效果
    lightning bj_lastCreatedLightning = null
    // 最后创建的图像
    image bj_lastCreatedImage = null
    // 最后创建的地面纹理变化
    ubersplat bj_lastCreatedUbersplat = null
    // 最后创建的小地图（任务）图标
    minimapicon bj_lastCreatedMinimapIcon = null
    // 最后创建的按钮特效
	commandbuttoneffect bj_lastCreatedCommandButtonEffect = null

    // Filter function vars

    // 初始条件表达式 单位类型为金矿（中立金矿）的单位，默认值为空
    boolexpr filterIssueHauntOrderAtLocBJ = null
    // 初始条件表达式 匹配的可破坏物是否离指定点小于某距离，默认值为空
    boolexpr filterEnumDestructablesInCircleBJ = null
    // 初始条件表达式 匹配指定玩家在指定区域的单位，默认值为空
    boolexpr filterGetUnitsInRectOfPlayer = null
    // 初始条件表达式 匹配的单位类型，默认值为空
    boolexpr filterGetUnitsOfTypeIdAll = null
    // 初始条件表达式 匹配玩家拥有的单位类型，默认值为空
    // 用于对战初始化
    boolexpr filterGetUnitsOfPlayerAndTypeId = null
    // 初始条件表达式 匹配的英雄单位（首发英雄），默认值为空
    // 用于对战初始化
    boolexpr filterMeleeTrainedUnitIsHeroBJ = null
    // 初始条件表达式 匹配玩家拥有且存活的单位类型，默认值为空
    // 用于对战初始化
    boolexpr filterLivingPlayerUnitsOfTypeId = null

    // Memory cleanup vars

    // 需要清理单位组标识，默认不需要（false）
    boolean bj_wantDestroyGroup = false

    // Instanced Operation Results

    // 最后的值域操作结果标识/实例函数调用结果标识，默认成功（true）
    boolean bj_lastInstObjFuncSuccessful = true
endglobals



//***************************************************************************
//*
//*  Debugging Functions
//*
//***************************************************************************


// 显示调试文本[C]
// @param msg 文本内容
function BJDebugMsg takes string msg returns nothing
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


// 取最小值(比对实数)
function RMinBJ takes real a, real b returns real
    if(a < b) then
        return a
    else
        return b
    endif
endfunction


// 取最大值(比对实数)
function RMaxBJ takes real a, real b returns real
    if(a < b) then
        return b
    else
        return a
    endif
endfunction


// 取绝对值(实数)
function RAbsBJ takes real a returns real
    if(a >= 0) then
        return a
    else
        return - a
    endif
endfunction


// 取正负标记(实数)
// 输入值大于等于0返回 1.0，小于0返回 -1.0
function RSignBJ takes real a returns real
    if(a >= 0.0) then
        return 1.0
    else
        return - 1.0
    endif
endfunction


// 取最小值(比对整数)
function IMinBJ takes integer a, integer b returns integer
    if(a < b) then
        return a
    else
        return b
    endif
endfunction


// 取最大值(比对整数)
function IMaxBJ takes integer a, integer b returns integer
    if(a < b) then
        return b
    else
        return a
    endif
endfunction


// 取绝对值(整数)
function IAbsBJ takes integer a returns integer
    if(a >= 0) then
        return a
    else
        return - a
    endif
endfunction


// 取正负标记(整数)
// 输入数值大于等于0返回 1，小于0返回 -1
function ISignBJ takes integer a returns integer
    if(a >= 0) then
        return 1
    else
        return - 1
    endif
endfunction


// 取正弦
function SinBJ takes real degrees returns real
    return Sin(degrees * bj_DEGTORAD)
endfunction


// 取余弦
function CosBJ takes real degrees returns real
    return Cos(degrees * bj_DEGTORAD)
endfunction


// 取正切
function TanBJ takes real degrees returns real
    return Tan(degrees * bj_DEGTORAD)
endfunction


// 取反正弦
function AsinBJ takes real degrees returns real
    return Asin(degrees) * bj_RADTODEG
endfunction


// 取反余弦
function AcosBJ takes real degrees returns real
    return Acos(degrees) * bj_RADTODEG
endfunction


// 取2象限反正切 (From Angle)
function AtanBJ takes real degrees returns real
    return Atan(degrees) * bj_RADTODEG
endfunction


// 取4象限反正切
function Atan2BJ takes real y, real x returns real
    return Atan2(y, x) * bj_RADTODEG
endfunction


// 获取两点之间的角度
// 两个点仍会保留，如不再使用用完请注意排泄
function AngleBetweenPoints takes location locA, location locB returns real
    return bj_RADTODEG * Atan2(GetLocationY(locB) - GetLocationY(locA), GetLocationX(locB) - GetLocationX(locA))
endfunction


// 获取两点之间的距离
// 两个点仍会保留，如不再使用用完请注意排泄
function DistanceBetweenPoints takes location locA, location locB returns real
    local real dx = GetLocationX(locB) - GetLocationX(locA)
    local real dy = GetLocationY(locB) - GetLocationY(locA)
    return SquareRoot(dx * dx + dy * dy)
endfunction


// 点向指定方向位移指定距离
// 会创建点，用完请注意排泄
function PolarProjectionBJ takes location source, real dist, real angle returns location
    local real x = GetLocationX(source) + dist * Cos(angle * bj_DEGTORAD)
    local real y = GetLocationY(source) + dist * Sin(angle * bj_DEGTORAD)
    return Location(x, y)
endfunction


// 获取随机角度（0~360，实数）
function GetRandomDirectionDeg takes nothing returns real
    return GetRandomReal(0, 360)
endfunction


// 获取随机实数（0~100）
function GetRandomPercentageBJ takes nothing returns real
    return GetRandomReal(0, 100)
endfunction


// 获取区域内的随机点
// 会创建点，用完请注意排泄
function GetRandomLocInRect takes rect whichRect returns location
    return Location(GetRandomReal(GetRectMinX(whichRect), GetRectMaxX(whichRect)), GetRandomReal(GetRectMinY(whichRect), GetRectMaxY(whichRect)))
endfunction



// 取余数（整数）
// Calculate the modulus/remainder of (dividend) divided by (divisor).
// Examples:  18 mod 5 = 3.  15 mod 5 = 0.  -8 mod 5 = 2.
function ModuloInteger takes integer dividend, integer divisor returns integer
    local integer modulus = dividend - (dividend / divisor) * divisor

    // If the dividend was negative, the above modulus calculation will
    // be negative, but within (-divisor..0).  We can add (divisor) to
    // shift this result into the desired range of (0..divisor).
    if(modulus < 0) then
        set modulus = modulus + divisor
    endif

    return modulus
endfunction


// 取余数（实数）
// Calculate the modulus/remainder of (dividend) divided by (divisor).
// Examples:  13.000 mod 2.500 = 0.500.  -6.000 mod 2.500 = 1.500.
function ModuloReal takes real dividend, real divisor returns real
    local real modulus = dividend - I2R(R2I(dividend / divisor)) * divisor

    // If the dividend was negative, the above modulus calculation will
    // be negative, but within (-divisor..0).  We can add (divisor) to
    // shift this result into the desired range of (0..divisor).
    if(modulus < 0) then
        set modulus = modulus + divisor
    endif

    return modulus
endfunction


// 点位移
// 会创建点，用完请注意排泄
function OffsetLocation takes location loc, real dx, real dy returns location
    return Location(GetLocationX(loc) + dx, GetLocationY(loc) + dy)
endfunction


// 区域位移
// 会创建区域，用完请注意排泄
function OffsetRectBJ takes rect r, real dx, real dy returns rect
    return Rect(GetRectMinX(r) + dx, GetRectMinY(r) + dy, GetRectMaxX(r) + dx, GetRectMaxY(r) + dy)
endfunction


// 转换点成区域
// 会创建区域，用完请注意排泄
// @param center 区域中心点位置
// @param width 宽
// @param height 高
function RectFromCenterSizeBJ takes location center, real width, real height returns rect
    local real x = GetLocationX(center)
    local real y = GetLocationY(center)
    return Rect(x - width * 0.5, y - height * 0.5, x + width * 0.5, y + height * 0.5)
endfunction


// 查询坐标是否在矩形内
function RectContainsCoords takes rect r, real x, real y returns boolean
    return(GetRectMinX(r) <= x) and(x <= GetRectMaxX(r)) and(GetRectMinY(r) <= y) and(y <= GetRectMaxY(r))
endfunction


// 查询点是否在矩形内
function RectContainsLoc takes rect r, location loc returns boolean
    return RectContainsCoords(r, GetLocationX(loc), GetLocationY(loc))
endfunction


// 查询单位是否在区域内
function RectContainsUnit takes rect r, unit whichUnit returns boolean
    return RectContainsCoords(r, GetUnitX(whichUnit), GetUnitY(whichUnit))
endfunction


// 查询物品是否在区域内
function RectContainsItem takes item whichItem, rect r returns boolean
    if(whichItem == null) then
        return false
    endif

    if(IsItemOwned(whichItem)) then
        return false
    endif

    return RectContainsCoords(r, GetItemX(whichItem), GetItemY(whichItem))
endfunction



//***************************************************************************
//*
//*  Utility Constructs
//*
//***************************************************************************



// 运行触发器 (无视条件)
// Runs the trigger's actions if the trigger's conditions evaluate to true.
function ConditionalTriggerExecute takes trigger trig returns nothing
    if TriggerEvaluate(trig) then
        call TriggerExecute(trig)
    endif
endfunction


// 运行触发器(检查条件)
// Runs the trigger's actions if the trigger's conditions evaluate to true.
function TriggerExecuteBJ takes trigger trig, boolean checkConditions returns boolean
    if checkConditions then
        if not(TriggerEvaluate(trig)) then
            return false
        endif
    endif
    call TriggerExecute(trig)
    return true
endfunction


// 执行触发器
// Arranges for a trigger to fire almost immediately, except that the calling
// trigger is not interrupted as is the case with a TriggerExecute call.
// Since the trigger executes normally, its conditions are still evaluated.
function PostTriggerExecuteBJ takes trigger trig, boolean checkConditions returns boolean
    if checkConditions then
        if not(TriggerEvaluate(trig)) then
            return false
        endif
    endif
    call TriggerRegisterTimerEvent(trig, 0, false)
    return true
endfunction


// 检查触发器队列
// Debug - Display the contents of the trigger queue (as either null or "x" for each entry).
function QueuedTriggerCheck takes nothing returns nothing
    local string s = "TrigQueue Check "
    local integer i

    set i = 0
    loop
        exitwhen i >= bj_queuedExecTotal
        set s = s + "q[" + I2S(i) + "]="
        if(bj_queuedExecTriggers [ i ] == null) then
            set s = s + "null "
        else
            set s = s + "x "
        endif
        set i = i + 1
    endloop
    set s = s + "(" + I2S(bj_queuedExecTotal) + " total)"
    call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 600, s)
endfunction


// 获取触发器队列中指定下标的触发器
// Searches the queue for a given trigger, returning the index of the
// trigger within the queue if it is found, or -1 if it is not found.
function QueuedTriggerGetIndex takes trigger trig returns integer
    // Determine which, if any, of the queued triggers is being removed.
    local integer index = 0
    loop
        exitwhen index >= bj_queuedExecTotal
        if(bj_queuedExecTriggers [ index ] == trig) then
            return index
        endif
        set index = index + 1
    endloop
    return - 1
endfunction


// 从触发器队列中移除指定下标的触发器
// Removes a trigger from the trigger queue, shifting other triggers down
// to fill the unused space.  If the currently running trigger is removed
// in this manner, this function does NOT attempt to run the next trigger.
function QueuedTriggerRemoveByIndex takes integer trigIndex returns boolean
    local integer index

    // If the to-be-removed index is out of range, fail.
    if(trigIndex >= bj_queuedExecTotal) then
        return false
    endif

    // Shift all queue entries down to fill in the gap.
    set bj_queuedExecTotal = bj_queuedExecTotal - 1
    set index = trigIndex
    loop
        exitwhen index >= bj_queuedExecTotal
        set bj_queuedExecTriggers [ index ] = bj_queuedExecTriggers [ index + 1 ]
        set bj_queuedExecUseConds [ index ] = bj_queuedExecUseConds [ index + 1 ]
        set index = index + 1
    endloop
    return true
endfunction


// 尝试执行触发器队列中的触发器
// Attempt to execute the first trigger in the queue.  If it fails, remove
// it and execute the next one.  Continue this cycle until a trigger runs,
// or until the queue is empty.
function QueuedTriggerAttemptExec takes nothing returns boolean
    loop
        exitwhen bj_queuedExecTotal == 0

        if TriggerExecuteBJ(bj_queuedExecTriggers [ 0 ], bj_queuedExecUseConds [ 0 ]) then
            // Timeout the queue if it sits at the front of the queue for too long.
            call TimerStart(bj_queuedExecTimeoutTimer, bj_QUEUED_TRIGGER_TIMEOUT, false, null)
            return true
        endif

        call QueuedTriggerRemoveByIndex(0)
    endloop
    return false
endfunction


// 增加触发器到触发器队列
// Queues a trigger to be executed, assuring that such triggers are not executed at the same time.
function QueuedTriggerAddBJ takes trigger trig, boolean checkConditions returns boolean
    // Make sure our queue isn't full.  If it is, return failure.
    if(bj_queuedExecTotal >= bj_MAX_QUEUED_TRIGGERS) then
        return false
    endif

    // Add the trigger to an array of to-be-executed triggers.
    set bj_queuedExecTriggers [ bj_queuedExecTotal ] = trig
    set bj_queuedExecUseConds [ bj_queuedExecTotal ] = checkConditions
    set bj_queuedExecTotal = bj_queuedExecTotal + 1

    // If this is the only trigger in the queue, run it.
    if(bj_queuedExecTotal == 1) then
        call QueuedTriggerAttemptExec()
    endif
    return true
endfunction


// 从触发器队列中清除触发器
// Denotes the end of a queued trigger. Be sure to call this only once per
// queued trigger, or risk stepping on the toes of other queued triggers.
function QueuedTriggerRemoveBJ takes trigger trig returns nothing
    local integer index
    local integer trigIndex
    local boolean trigExecuted

    // Find the trigger's index.
    set trigIndex = QueuedTriggerGetIndex(trig)
    if(trigIndex == - 1) then
        return
    endif

    // Shuffle the other trigger entries down to fill in the gap.
    call QueuedTriggerRemoveByIndex(trigIndex)

    // If we just axed the currently running trigger, run the next one.
    if(trigIndex == 0) then
        call PauseTimer(bj_queuedExecTimeoutTimer)
        call QueuedTriggerAttemptExec()
    endif
endfunction


// 完成触发器队列
// Denotes the end of a queued trigger. Be sure to call this only once per
// queued trigger, lest you step on the toes of other queued triggers.
function QueuedTriggerDoneBJ takes nothing returns nothing
    local integer index

    // Make sure there's something on the queue to remove.
    if(bj_queuedExecTotal <= 0) then
        return
    endif

    // Remove the currently running trigger from the array.
    call QueuedTriggerRemoveByIndex(0)

    // If other triggers are waiting to run, run one of them.
    call PauseTimer(bj_queuedExecTimeoutTimer)
    call QueuedTriggerAttemptExec()
endfunction


// 清除所有触发器队列
// Empty the trigger queue.
function QueuedTriggerClearBJ takes nothing returns nothing
    call PauseTimer(bj_queuedExecTimeoutTimer)
    set bj_queuedExecTotal = 0
endfunction


// 清除触发器队列中未执行任务
// Remove all but the currently executing trigger from the trigger queue.
function QueuedTriggerClearInactiveBJ takes nothing returns nothing
    set bj_queuedExecTotal = IMinBJ(bj_queuedExecTotal, 1)
endfunction


// 查询触发器队列的触发器数量
function QueuedTriggerCountBJ takes nothing returns integer
    return bj_queuedExecTotal
endfunction


// 查询触发器队列是否为空
function IsTriggerQueueEmptyBJ takes nothing returns boolean
    return bj_queuedExecTotal <= 0
endfunction


// 查询触发器是否在队列中
function IsTriggerQueuedBJ takes trigger trig returns boolean
    return QueuedTriggerGetIndex(trig) != - 1
endfunction


// 获取循环 A 索引
function GetForLoopIndexA takes nothing returns integer
    return bj_forLoopAIndex
endfunction


// 设置循环 A 索引
function SetForLoopIndexA takes integer newIndex returns nothing
    set bj_forLoopAIndex = newIndex
endfunction


// 获取循环 B 索引
function GetForLoopIndexB takes nothing returns integer
    return bj_forLoopBIndex
endfunction


// 设置循环 B 索引
function SetForLoopIndexB takes integer newIndex returns nothing
    set bj_forLoopBIndex = newIndex
endfunction


// 等待 (游戏时间)
// We can't do game-time waits, so this simulates one by starting a timer
// and polling until the timer expires.
function PolledWait takes real duration returns nothing
    local timer t
    local real timeRemaining

    if(duration > 0) then
        set t = CreateTimer()
        call TimerStart(t, duration, false, null)
        loop
            set timeRemaining = TimerGetRemaining(t)
            exitwhen timeRemaining <= 0

            // If we have a bit of time left, skip past 10% of the remaining
            // duration instead of checking every interval, to minimize the
            // polling on long waits.
            if(timeRemaining > bj_POLLED_WAIT_SKIP_THRESHOLD) then
                call TriggerSleepAction(0.1 * timeRemaining)
            else
                call TriggerSleepAction(bj_POLLED_WAIT_INTERVAL)
            endif
        endloop
        call DestroyTimer(t)
    endif
endfunction

// 根据布尔值获取整数
// flag为真时返回valueA，反之返回valueB
function IntegerTertiaryOp takes boolean flag, integer valueA, integer valueB returns integer
    if flag then
        return valueA
    else
        return valueB
    endif
endfunction


//***************************************************************************
//*
//*  General Utility Functions
//*  These functions exist purely to make the trigger dialogs cleaner and
//*  more comprehensible.
//*
//***************************************************************************


// 不做任何动作/无动作
function DoNothing takes nothing returns nothing
endfunction


// 此函数不起任何作用
// WorldEdit会忽略此函数,因为此函数中不生成触发
// This function does nothing.  WorldEdit should should eventually ignore
// CommentString triggers during script generation, but until such a time,
// this function will serve as a stub.
function CommentString takes string commentString returns nothing
endfunction


// 获取外部字符串的译文，返回值随本地语言变化
// This function returns the input string, converting it from the localized text, if necessary
function StringIdentity takes string theString returns string
    return GetLocalizedString(theString)
endfunction

// 与运算
// valueA && valueB 判断是否同时满足两个条件
// @param valueA 条件A
// @param valueB 条件B
function GetBooleanAnd takes boolean valueA, boolean valueB returns boolean
    return valueA and valueB
endfunction

// 或运算
// valueA || valueB 判断是否满足任一条件
// @param valueA 条件A
// @param valueB 条件B
function GetBooleanOr takes boolean valueA, boolean valueB returns boolean
    return valueA or valueB
endfunction


// Converts a percentage (real, 0..100) into a scaled integer (0..max),
// clipping the result to 0..max in case the input is invalid.

// 取值的百分比（整数）
// R2I(max * percentage)，结果为负数时返回0，结果超过max时返回max
// @param percentage 0~100区间
// @param max 0~有限
function PercentToInt takes real percentage, integer max returns integer
    local real realpercent = percentage * I2R(max) * 0.01
    local integer result = MathRound(realpercent)

    if(result < 0) then
        set result = 0
    elseif(result > max) then
        set result = max
    endif

    return result
endfunction


// 转换百分比成小数，(0~1)转(0~255)
function PercentTo255 takes real percentage returns integer
    return PercentToInt(percentage, 255)
endfunction


// 获取游戏当前的时间（夜晚白昼，24小时制，精确到分）
function GetTimeOfDay takes nothing returns real
    return GetFloatGameState(GAME_STATE_TIME_OF_DAY)
endfunction


// 设置游戏的时间（夜晚白昼，24小时制，精确到分）
function SetTimeOfDay takes real whatTime returns nothing
    call SetFloatGameState(GAME_STATE_TIME_OF_DAY, whatTime)
endfunction


// 设置时间流逝速度（夜晚白昼）
function SetTimeOfDayScalePercentBJ takes real scalePercent returns nothing
    call SetTimeOfDayScale(scalePercent * 0.01)
endfunction


// 获取游戏时间流逝速度（夜晚白昼）
function GetTimeOfDayScalePercentBJ takes nothing returns real
    return GetTimeOfDayScale() * 100
endfunction


// 播放音效
function PlaySound takes string soundName returns nothing
    local sound soundHandle = CreateSound(soundName, false, false, true, 12700, 12700, "")
    call StartSound(soundHandle)
    call KillSoundWhenDone(soundHandle)
endfunction


// 比对两个点的X和Y坐标的值是否相同
function CompareLocationsBJ takes location A, location B returns boolean
    return GetLocationX(A) == GetLocationX(B) and GetLocationY(A) == GetLocationY(B)
endfunction


// 比对两个矩形四个坐标点的值是否相同
function CompareRectsBJ takes rect A, rect B returns boolean
    return GetRectMinX(A) == GetRectMinX(B) and GetRectMinY(A) == GetRectMinY(B) and GetRectMaxX(A) == GetRectMaxX(B) and GetRectMaxY(A) == GetRectMaxY(B)
endfunction


// Returns a square rect that exactly encompasses the specified circle.

// 将圆形范围转换为矩形区域
// 以圆心和为中心，直径为边长创建区域
// 原有点仍然保留，如不再使用请排泄
// 会创建区域，用完请注意排泄
function GetRectFromCircleBJ takes location center, real radius returns rect
    local real centerX = GetLocationX(center)
    local real centerY = GetLocationY(center)
    return Rect(centerX - radius, centerY - radius, centerX + radius, centerY + radius)
endfunction



//***************************************************************************
//*
//*  Camera Utility Functions
//*
//***************************************************************************


// 获取当前镜头属性
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
    call CameraSetupSetField(theCam, CAMERA_FIELD_LOCAL_PITCH, bj_RADTODEG * GetCameraField(CAMERA_FIELD_LOCAL_PITCH), duration)
    call CameraSetupSetField(theCam, CAMERA_FIELD_LOCAL_YAW, bj_RADTODEG * GetCameraField(CAMERA_FIELD_LOCAL_YAW), duration)
    call CameraSetupSetField(theCam, CAMERA_FIELD_LOCAL_ROLL, bj_RADTODEG * GetCameraField(CAMERA_FIELD_LOCAL_ROLL), duration)
    call CameraSetupSetDestPosition(theCam, GetCameraTargetPositionX(), GetCameraTargetPositionY(), duration)
    return theCam
endfunction


// 应用镜头 (限时)
function CameraSetupApplyForPlayer takes boolean doPan, camerasetup whichSetup, player whichPlayer, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetupApplyForceDuration(whichSetup, doPan, duration)
    endif
endfunction

// 设置镜头平滑持续时间
function CameraSetupApplyForPlayerSmooth takes boolean doPan, camerasetup whichSetup, player whichPlayer, real forcedDuration, real easeInDuration, real easeOutDuration, real smoothFactor returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call BlzCameraSetupApplyForceDurationSmooth(whichSetup, doPan, forcedDuration, easeInDuration, easeOutDuration, smoothFactor)
    endif
endfunction


// 获取指定镜头的指定属性
function CameraSetupGetFieldSwap takes camerafield whichField, camerasetup whichSetup returns real
    return CameraSetupGetField(whichSetup, whichField)
endfunction


// 设定镜头属性 (限时)
function SetCameraFieldForPlayer takes player whichPlayer, camerafield whichField, real value, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraField(whichField, value, duration)
    endif
endfunction


// 锁定镜头目标到单位
function SetCameraTargetControllerNoZForPlayer takes player whichPlayer, unit whichUnit, real xoffset, real yoffset, boolean inheritOrientation returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraTargetController(whichUnit, xoffset, yoffset, inheritOrientation)
    endif
endfunction


// 设置玩家的镜头位置（指定坐标）
function SetCameraPositionForPlayer takes player whichPlayer, real x, real y returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraPosition(x, y)
    endif
endfunction


// 设置玩家的镜头位置（指定点）
function SetCameraPositionLocForPlayer takes player whichPlayer, location loc returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraPosition(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction


// 旋转镜头 (限时)
function RotateCameraAroundLocBJ takes real degrees, location loc, player whichPlayer, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraRotateMode(GetLocationX(loc), GetLocationY(loc), bj_DEGTORAD * degrees, duration)
    endif
endfunction


// 平移镜头（指定坐标）
function PanCameraToForPlayer takes player whichPlayer, real x, real y returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraTo(x, y)
    endif
endfunction


// 平移镜头（指定点）
function PanCameraToLocForPlayer takes player whichPlayer, location loc returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraTo(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction


// 平移镜头（定时）
function PanCameraToTimedForPlayer takes player whichPlayer, real x, real y, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimed(x, y, duration)
    endif
endfunction


// 平移镜头 (限时)
function PanCameraToTimedLocForPlayer takes player whichPlayer, location loc, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
    endif
endfunction


// 在指定高度平移镜头 (限时)
function PanCameraToTimedLocWithZForPlayer takes player whichPlayer, location loc, real zOffset, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PanCameraToTimedWithZ(GetLocationX(loc), GetLocationY(loc), zOffset, duration)
    endif
endfunction


// 必要时平移镜头 (限时)
function SmartCameraPanBJ takes player whichPlayer, location loc, real duration returns nothing
    local real dist
	local location cameraLoc = GetCameraTargetPositionLoc()
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        set dist = DistanceBetweenPoints(loc, cameraLoc)
        if(dist >= bj_SMARTPAN_TRESHOLD_SNAP) then
            // If the user is too far away, snap the camera.
            call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), 0)
        elseif(dist >= bj_SMARTPAN_TRESHOLD_PAN) then
            // If the user is moderately close, pan the camera.
            call PanCameraToTimed(GetLocationX(loc), GetLocationY(loc), duration)
        else
            // User is close enough, so don't touch the camera.
        endif
    endif
	call RemoveLocation(cameraLoc)
endfunction


// 播放电影镜头
function SetCinematicCameraForPlayer takes player whichPlayer, string cameraModelFile returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCinematicCamera(cameraModelFile)
    endif
endfunction


// 重置镜头到游戏默认状态（限时）（指定玩家）
function ResetToGameCameraForPlayer takes player whichPlayer, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ResetToGameCamera(duration)
    endif
endfunction


// 摇晃镜头源
// @param magnitude 摇晃幅度
// @param velocity 摇晃速率
function CameraSetSourceNoiseForPlayer takes player whichPlayer, real magnitude, real velocity returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetSourceNoise(magnitude, velocity)
    endif
endfunction


// 摇晃镜头目标
// @param magnitude 摇晃幅度
// @param velocity 摇晃速率
function CameraSetTargetNoiseForPlayer takes player whichPlayer, real magnitude, real velocity returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetTargetNoise(magnitude, velocity)
    endif
endfunction


// 震动镜头
// @param magnitude 摇晃幅度
function CameraSetEQNoiseForPlayer takes player whichPlayer, real magnitude returns nothing
    local real richter = magnitude
    if(richter > 5.0) then
        set richter = 5.0
    endif
    if(richter < 2.0) then
        set richter = 2.0
    endif
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetTargetNoiseEx(magnitude * 2.0, magnitude * Pow(10, richter), true)
        call CameraSetSourceNoiseEx(magnitude * 2.0, magnitude * Pow(10, richter), true)
    endif
endfunction


// 停止 摇摆/摇晃 镜头
function CameraClearNoiseForPlayer takes player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call CameraSetSourceNoise(0, 0)
        call CameraSetTargetNoise(0, 0)
    endif
endfunction


// Query the current camera bounds.

// 获取当前镜头范围
// 会创建区域，用完请注意排泄
function GetCurrentCameraBoundsMapRectBJ takes nothing returns rect
    return Rect(GetCameraBoundMinX(), GetCameraBoundMinY(), GetCameraBoundMaxX(), GetCameraBoundMaxY())
endfunction

// Query the initial camera bounds, as defined at map init.

// 获取初始游戏时的镜头范围
// 会创建区域，用完请注意排泄
function GetCameraBoundsMapRect takes nothing returns rect
    return bj_mapInitialCameraBounds
endfunction


// Query the playable map area, as defined at map init.

// 获取可用地图区域
// 会创建区域，用完请注意排泄
function GetPlayableMapRect takes nothing returns rect
    return bj_mapInitialPlayableArea
endfunction


// Query the entire map area, as defined at map init.

// 获取完整地图区域
// 会创建区域，用完请注意排泄
function GetEntireMapRect takes nothing returns rect
    return GetWorldBounds()
endfunction


// 设置镜头边界
function SetCameraBoundsToRect takes rect r returns nothing
    local real minX = GetRectMinX(r)
    local real minY = GetRectMinY(r)
    local real maxX = GetRectMaxX(r)
    local real maxY = GetRectMaxY(r)
    call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction


// 设置镜头范围
function SetCameraBoundsToRectForPlayerBJ takes player whichPlayer, rect r returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraBoundsToRect(r)
    endif
endfunction


// 调整镜头边界
function AdjustCameraBoundsBJ takes integer adjustMethod, real dxWest, real dxEast, real dyNorth, real dySouth returns nothing
    local real minX = 0
    local real minY = 0
    local real maxX = 0
    local real maxY = 0
    local real scale = 0

    if(adjustMethod == bj_CAMERABOUNDS_ADJUST_ADD) then
        set scale = 1
    elseif(adjustMethod == bj_CAMERABOUNDS_ADJUST_SUB) then
        set scale = - 1
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
    if(maxX < minX) then
        set minX = (minX + maxX) * 0.5
        set maxX = minX
    endif
    if(maxY < minY) then
        set minY = (minY + maxY) * 0.5
        set maxY = minY
    endif

    // Apply the new camera values.
    call SetCameraBounds(minX, minY, minX, maxY, maxX, maxY, maxX, minY)
endfunction


// 扩展/收缩 可用镜头区域（指定玩家）
// @param adjustMethod 扩展/收缩
function AdjustCameraBoundsForPlayerBJ takes integer adjustMethod, player whichPlayer, real dxWest, real dxEast, real dyNorth, real dySouth returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call AdjustCameraBoundsBJ(adjustMethod, dxWest, dxEast, dyNorth, dySouth)
    endif
endfunction


// 设置镜头空格键转向坐标（指定玩家） (快速)
function SetCameraQuickPositionForPlayer takes player whichPlayer, real x, real y returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraQuickPosition(x, y)
    endif
endfunction


// 设置镜头空格键转向点（指定玩家） (快速)
function SetCameraQuickPositionLocForPlayer takes player whichPlayer, location loc returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
    endif
endfunction

// 设置镜头空格键转向点（指定玩家）
function SetCameraQuickPositionLoc takes location loc returns nothing
    call SetCameraQuickPosition(GetLocationX(loc), GetLocationY(loc))
endfunction


// 停止播放镜头
function StopCameraForPlayerBJ takes player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call StopCamera()
    endif
endfunction


// 锁定镜头方向到单位
function SetCameraOrientControllerForPlayerBJ takes player whichPlayer, unit whichUnit, real xoffset, real yoffset returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetCameraOrientController(whichUnit, xoffset, yoffset)
    endif
endfunction


// 设置镜头平滑参数
function CameraSetSmoothingFactorBJ takes real factor returns nothing
    call CameraSetSmoothingFactor(factor)
endfunction


// 重置镜头平滑参数
function CameraResetSmoothingFactorBJ takes nothing returns nothing
    call CameraSetSmoothingFactor(0)
endfunction



//***************************************************************************
//*
//*  Text Utility Functions
//*
//***************************************************************************


// 为玩家组显示文本(自动计时)
function DisplayTextToForce takes force toForce, string message returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call DisplayTextToPlayer(GetLocalPlayer(), 0, 0, message)
    endif
endfunction


// 为玩家组显示文本(指定时间)
function DisplayTimedTextToForce takes force toForce, real duration, string message returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, duration, message)
    endif
endfunction


// 清空文本信息
function ClearTextMessagesBJ takes force toForce returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearTextMessages()
    endif
endfunction


// The parameters for the API Substring function are unintuitive, so this
// merely performs a translation for the starting index.

// 截取字符串
function SubStringBJ takes string source, integer start, integer end returns string
    return SubString(source, start - 1, end)
endfunction  
  
// 获取句柄整数地址
function GetHandleIdBJ takes handle h returns integer
    return GetHandleId(h)
endfunction

// 字符串转换成哈希
function StringHashBJ takes string s returns integer
    return StringHash(s)
endfunction



//***************************************************************************
//*
//*  Event Registration Utility Functions
//*
//***************************************************************************


// 时间周期（每N秒）事件
function TriggerRegisterTimerEventPeriodic takes trigger trig, real timeout returns event
    return TriggerRegisterTimerEvent(trig, timeout, true)
endfunction


// 游戏逝去的时间(游戏开始N秒)事件
function TriggerRegisterTimerEventSingle takes trigger trig, real timeout returns event
    return TriggerRegisterTimerEvent(trig, timeout, false)
endfunction


// 计时器到期事件
function TriggerRegisterTimerExpireEventBJ takes trigger trig, timer t returns event
    return TriggerRegisterTimerExpireEvent(trig, t)
endfunction


// 玩家指定单位事件
function TriggerRegisterPlayerUnitEventSimple takes trigger trig, player whichPlayer, playerunitevent whichEvent returns event
    return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, whichEvent, null)
endfunction


// 任意单位事件
function TriggerRegisterAnyUnitEventBJ takes trigger trig, playerunitevent whichEvent returns nothing
    local integer index

    set index = 0
    loop
        call TriggerRegisterPlayerUnitEvent(trig, Player(index), whichEvent, null)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYER_SLOTS
    endloop
endfunction


// 玩家选择单位事件
function TriggerRegisterPlayerSelectionEventBJ takes trigger trig, player whichPlayer, boolean selected returns event
    if selected then
        return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_SELECTED, null)
    else
        return TriggerRegisterPlayerUnitEvent(trig, whichPlayer, EVENT_PLAYER_UNIT_DESELECTED, null)
    endif
endfunction


// 玩家按下方向键事件
function TriggerRegisterPlayerKeyEventBJ takes trigger trig, player whichPlayer, integer keType, integer keKey returns event
    if(keType == bj_KEYEVENTTYPE_DEPRESS) then
        // Depress event - find out what key
        if(keKey == bj_KEYEVENTKEY_LEFT) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_DOWN)
        elseif(keKey == bj_KEYEVENTKEY_RIGHT) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_DOWN)
        elseif(keKey == bj_KEYEVENTKEY_DOWN) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_DOWN)
        elseif(keKey == bj_KEYEVENTKEY_UP) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_DOWN)
        else
            // Unrecognized key - ignore the request and return failure.
            return null
        endif
    elseif(keType == bj_KEYEVENTTYPE_RELEASE) then
        // Release event - find out what key
        if(keKey == bj_KEYEVENTKEY_LEFT) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_LEFT_UP)
        elseif(keKey == bj_KEYEVENTKEY_RIGHT) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_RIGHT_UP)
        elseif(keKey == bj_KEYEVENTKEY_DOWN) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_DOWN_UP)
        elseif(keKey == bj_KEYEVENTKEY_UP) then
            return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ARROW_UP_UP)
        else
            // Unrecognized key - ignore the request and return failure.
            return null
        endif
    else
        // Unrecognized type - ignore the request and return failure.
        return null
    endif
endfunction

// 玩家按下鼠标事件
function TriggerRegisterPlayerMouseEventBJ takes trigger trig, player whichPlayer, integer meType returns event
    if(meType == bj_MOUSEEVENTTYPE_DOWN) then
        // Mouse down event
        return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_DOWN)
    elseif(meType == bj_MOUSEEVENTTYPE_UP) then
        // Mouse up event
        return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_UP)
    elseif(meType == bj_MOUSEEVENTTYPE_MOVE) then
        // Mouse move event
        return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_MOUSE_MOVE)
    else
        // Unrecognized type - ignore the request and return failure.
        return null
    endif
endfunction


// 玩家胜利事件
function TriggerRegisterPlayerEventVictory takes trigger trig, player whichPlayer returns event
    return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_VICTORY)
endfunction


// 玩家失败事件事件
function TriggerRegisterPlayerEventDefeat takes trigger trig, player whichPlayer returns event
    return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_DEFEAT)
endfunction


// 玩家离开游戏事件
function TriggerRegisterPlayerEventLeave takes trigger trig, player whichPlayer returns event
    return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_LEAVE)
endfunction


// 联盟状态变更(任何状态)事件
function TriggerRegisterPlayerEventAllianceChanged takes trigger trig, player whichPlayer returns event
    return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_ALLIANCE_CHANGED)
endfunction


// 按下ESC键事件
function TriggerRegisterPlayerEventEndCinematic takes trigger trig, player whichPlayer returns event
    return TriggerRegisterPlayerEvent(trig, whichPlayer, EVENT_PLAYER_END_CINEMATIC)
endfunction


// 游戏时间改变事件
function TriggerRegisterGameStateEventTimeOfDay takes trigger trig, limitop opcode, real limitval returns event
    return TriggerRegisterGameStateEvent(trig, GAME_STATE_TIME_OF_DAY, opcode, limitval)
endfunction


// 任意单位进入不规则区域事件
function TriggerRegisterEnterRegionSimple takes trigger trig, region whichRegion returns event
    return TriggerRegisterEnterRegion(trig, whichRegion, null)
endfunction


// 任意单位离开不规则区域事件
function TriggerRegisterLeaveRegionSimple takes trigger trig, region whichRegion returns event
    return TriggerRegisterLeaveRegion(trig, whichRegion, null)
endfunction


// 单位进入矩形区域事件
function TriggerRegisterEnterRectSimple takes trigger trig, rect r returns event
    local region rectRegion = CreateRegion()
    call RegionAddRect(rectRegion, r)
    return TriggerRegisterEnterRegion(trig, rectRegion, null)
endfunction


// 单位离开矩形区域事件
function TriggerRegisterLeaveRectSimple takes trigger trig, rect r returns event
    local region rectRegion = CreateRegion()
    call RegionAddRect(rectRegion, r)
    return TriggerRegisterLeaveRegion(trig, rectRegion, null)
endfunction


// 两单位（之间的）距离变化事件
function TriggerRegisterDistanceBetweenUnits takes trigger trig, unit whichUnit, boolexpr condition, real range returns event
    return TriggerRegisterUnitInRange(trig, whichUnit, range, condition)
endfunction


// 单位接近指定单位事件
function TriggerRegisterUnitInRangeSimple takes trigger trig, real range, unit whichUnit returns event
    return TriggerRegisterUnitInRange(trig, whichUnit, range, null)
endfunction


// 单位生命值变化事件
function TriggerRegisterUnitLifeEvent takes trigger trig, unit whichUnit, limitop opcode, real limitval returns event
    return TriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_LIFE, opcode, limitval)
endfunction


// 单位魔法值变化事件
function TriggerRegisterUnitManaEvent takes trigger trig, unit whichUnit, limitop opcode, real limitval returns event
    return TriggerRegisterUnitStateEvent(trig, whichUnit, UNIT_STATE_MANA, opcode, limitval)
endfunction


// 点击对话框按钮事件
function TriggerRegisterDialogEventBJ takes trigger trig, dialog whichDialog returns event
    return TriggerRegisterDialogEvent(trig, whichDialog)
endfunction


// 英雄学习技能按钮被点击事件
function TriggerRegisterShowSkillEventBJ takes trigger trig returns event
    return TriggerRegisterGameEvent(trig, EVENT_GAME_SHOW_SKILL)
endfunction


// 建造按钮被点击事件
function TriggerRegisterBuildSubmenuEventBJ takes trigger trig returns event
    return TriggerRegisterGameEvent(trig, EVENT_GAME_BUILD_SUBMENU)
endfunction

// 建造单位事件
function TriggerRegisterBuildCommandEventBJ takes trigger trig, integer unitId returns event
	call TriggerRegisterCommandEvent(trig, 'ANbu', UnitId2String(unitId))
	call TriggerRegisterCommandEvent(trig, 'AHbu', UnitId2String(unitId))
	call TriggerRegisterCommandEvent(trig, 'AEbu', UnitId2String(unitId))
	call TriggerRegisterCommandEvent(trig, 'AObu', UnitId2String(unitId))
	call TriggerRegisterCommandEvent(trig, 'AUbu', UnitId2String(unitId))
    return TriggerRegisterCommandEvent(trig, 'AGbu', UnitId2String(unitId))
endfunction

// 训练单位事件
function TriggerRegisterTrainCommandEventBJ takes trigger trig, integer unitId returns event
    return TriggerRegisterCommandEvent(trig, 'Aque', UnitId2String(unitId))
endfunction

// 研究科技事件
function TriggerRegisterUpgradeCommandEventBJ takes trigger trig, integer techId returns event
    return TriggerRegisterUpgradeCommandEvent(trig, techId)
endfunction

// 发布命令事件
function TriggerRegisterCommonCommandEventBJ takes trigger trig, string order returns event
    return TriggerRegisterCommandEvent(trig, 0, order)
endfunction


// 读取进度事件
function TriggerRegisterGameLoadedEventBJ takes trigger trig returns event
    return TriggerRegisterGameEvent(trig, EVENT_GAME_LOADED)
endfunction


// 存档事件
function TriggerRegisterGameSavedEventBJ takes trigger trig returns event
    return TriggerRegisterGameEvent(trig, EVENT_GAME_SAVE)
endfunction


// 矩形区域内可破坏物死亡事件动作
function RegisterDestDeathInRegionEnum takes nothing returns nothing
    set bj_destInRegionDiesCount = bj_destInRegionDiesCount + 1
    if(bj_destInRegionDiesCount <= bj_MAX_DEST_IN_REGION_EVENTS) then
        call TriggerRegisterDeathEvent(bj_destInRegionDiesTrig, GetEnumDestructable())
    endif
endfunction


// 矩形区域内可破坏物死亡事件
function TriggerRegisterDestDeathInRegionEvent takes trigger trig, rect r returns nothing
    set bj_destInRegionDiesTrig = trig
    set bj_destInRegionDiesCount = 0
    call EnumDestructablesInRect(r, null, function RegisterDestDeathInRegionEnum)
endfunction



//***************************************************************************
//*
//*  Environment Utility Functions
//*
//***************************************************************************


// 创建天气效果
function AddWeatherEffectSaveLast takes rect where, integer effectID returns weathereffect
    set bj_lastCreatedWeatherEffect = AddWeatherEffect(where, effectID)
    return bj_lastCreatedWeatherEffect
endfunction


// 获取最后创建的天气效果
function GetLastCreatedWeatherEffect takes nothing returns weathereffect
    return bj_lastCreatedWeatherEffect
endfunction


// 删除天气效果
function RemoveWeatherEffectBJ takes weathereffect whichWeatherEffect returns nothing
    call RemoveWeatherEffect(whichWeatherEffect)
endfunction


// 创建地形变化: 弹坑
// @param duration 持续时间
// @param permanent 临时(false)/永久(true)
// @param radius 半径
// @param depth 深度
function TerrainDeformationCraterBJ takes real duration, boolean permanent, location where, real radius, real depth returns terraindeformation
    set bj_lastCreatedTerrainDeformation = TerrainDeformCrater(GetLocationX(where), GetLocationY(where), radius, depth, R2I(duration * 1000), permanent)
    return bj_lastCreatedTerrainDeformation
endfunction


// 创建地域变形: 波纹
// @param duration 持续时间
// @param limitNeg 普通(false)/下陷(true)
// @param startRadius 开始半径
// @param endRadius 结束半径
// @param depth 深度
// @param wavePeriod 涟漪间隔
// @param waveWidth 分开距离
function TerrainDeformationRippleBJ takes real duration, boolean limitNeg, location where, real startRadius, real endRadius, real depth, real wavePeriod, real waveWidth returns terraindeformation
    local real spaceWave
    local real timeWave
    local real radiusRatio

    if(endRadius <= 0 or waveWidth <= 0 or wavePeriod <= 0) then
        return null
    endif

    set timeWave = 2.0 * duration / wavePeriod
    set spaceWave = 2.0 * endRadius / waveWidth
    set radiusRatio = startRadius / endRadius

    set bj_lastCreatedTerrainDeformation = TerrainDeformRipple(GetLocationX(where), GetLocationY(where), endRadius, depth, R2I(duration * 1000), 1, spaceWave, timeWave, radiusRatio, limitNeg)
    return bj_lastCreatedTerrainDeformation
endfunction


// 创建地形变化: 冲击波
// @param source 开始点
// @param target 结束点
// @param duration 持续时间
// @param radius 结束半径
// @param depth 深度
// @param trailDelay 拖尾延时
function TerrainDeformationWaveBJ takes real duration, location source, location target, real radius, real depth, real trailDelay returns terraindeformation
    local real distance
    local real dirX
    local real dirY
    local real speed

    set distance = DistanceBetweenPoints(source, target)
    if(distance == 0 or duration <= 0) then
        return null
    endif

    set dirX = (GetLocationX(target) - GetLocationX(source)) / distance
    set dirY = (GetLocationY(target) - GetLocationY(source)) / distance
    set speed = distance / duration

    set bj_lastCreatedTerrainDeformation = TerrainDeformWave(GetLocationX(source), GetLocationY(source), dirX, dirY, distance, speed, radius, depth, R2I(trailDelay * 1000), 1)
    return bj_lastCreatedTerrainDeformation
endfunction


// 创建地形变化: 随机
// @param duration 持续时间
// @param radius 半径
// @param minDelta 最小深度
// @param maxDelta 最大深度
// @param updateInterval 更新间隔
function TerrainDeformationRandomBJ takes real duration, location where, real radius, real minDelta, real maxDelta, real updateInterval returns terraindeformation
    set bj_lastCreatedTerrainDeformation = TerrainDeformRandom(GetLocationX(where), GetLocationY(where), radius, minDelta, maxDelta, R2I(duration * 1000), R2I(updateInterval * 1000))
    return bj_lastCreatedTerrainDeformation
endfunction


// 停止地形变化
function TerrainDeformationStopBJ takes terraindeformation deformation, real duration returns nothing
    call TerrainDeformStop(deformation, R2I(duration * 1000))
endfunction


// 获取最后创建的可破坏物
function GetLastCreatedTerrainDeformation takes nothing returns terraindeformation
    return bj_lastCreatedTerrainDeformation
endfunction


// 创建闪电效果（指定点）
function AddLightningLoc takes string codeName, location where1, location where2 returns lightning
    set bj_lastCreatedLightning = AddLightningEx(codeName, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
    return bj_lastCreatedLightning
endfunction


// 销毁闪电效果
function DestroyLightningBJ takes lightning whichBolt returns boolean
    return DestroyLightning(whichBolt)
endfunction


// 移动闪电效果到指定点
function MoveLightningLoc takes lightning whichBolt, location where1, location where2 returns boolean
    return MoveLightningEx(whichBolt, true, GetLocationX(where1), GetLocationY(where1), GetLocationZ(where1), GetLocationX(where2), GetLocationY(where2), GetLocationZ(where2))
endfunction


// 获取闪电的Alpha色值
function GetLightningColorABJ takes lightning whichBolt returns real
    return GetLightningColorA(whichBolt)
endfunction


// 获取闪电的红色值
function GetLightningColorRBJ takes lightning whichBolt returns real
    return GetLightningColorR(whichBolt)
endfunction


// 获取闪电的绿色值
function GetLightningColorGBJ takes lightning whichBolt returns real
    return GetLightningColorG(whichBolt)
endfunction


// 获取闪电的蓝色值
function GetLightningColorBBJ takes lightning whichBolt returns real
    return GetLightningColorB(whichBolt)
endfunction


// 设置闪电效果颜色
function SetLightningColorBJ takes lightning whichBolt, real r, real g, real b, real a returns boolean
    return SetLightningColor(whichBolt, r, g, b, a)
endfunction


// 获取最后创建的闪电效果
function GetLastCreatedLightningBJ takes nothing returns lightning
    return bj_lastCreatedLightning
endfunction


// 获取技能音效路径（指定技能、音效类型和索引）
function GetAbilityEffectBJ takes integer abilcode, effecttype t, integer index returns string
    return GetAbilityEffectById(abilcode, t, index)
endfunction


// 获取技能音效路径（指定技能和音效类型）
function GetAbilitySoundBJ takes integer abilcode, soundtype t returns string
    return GetAbilitySoundById(abilcode, t)
endfunction



// 获取悬崖高度（指定点）
function GetTerrainCliffLevelBJ takes location where returns integer
    return GetTerrainCliffLevel(GetLocationX(where), GetLocationY(where))
endfunction


// 获取地形类型/地表纹理（指定点）
function GetTerrainTypeBJ takes location where returns integer
    return GetTerrainType(GetLocationX(where), GetLocationY(where))
endfunction


// 查询地表类型/地表纹理（指定点）
function GetTerrainVarianceBJ takes location where returns integer
    return GetTerrainVariance(GetLocationX(where), GetLocationY(where))
endfunction


// 设置地形类型/地表纹理（指定点）
function SetTerrainTypeBJ takes location where, integer terrainType, integer variation, integer area, integer shape returns nothing
    call SetTerrainType(GetLocationX(where), GetLocationY(where), terrainType, variation, area, shape)
endfunction


// 查询路径类型是否指定类型（指定点）
function IsTerrainPathableBJ takes location where, pathingtype t returns boolean
    return IsTerrainPathable(GetLocationX(where), GetLocationY(where), t)
endfunction


// 启用/禁用 路径类型（指定点）
function SetTerrainPathableBJ takes location where, pathingtype t, boolean flag returns nothing
    call SetTerrainPathable(GetLocationX(where), GetLocationY(where), t, flag)
endfunction


// 设置 水面 颜色
function SetWaterBaseColorBJ takes real red, real green, real blue, real transparency returns nothing
    call SetWaterBaseColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 创建可见度修正器(矩形区域)
function CreateFogModifierRectSimple takes player whichPlayer, fogstate whichFogState, rect r, boolean afterUnits returns fogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, afterUnits)
    return bj_lastCreatedFogModifier
endfunction


// 创建可见度修正器(圆形范围)
function CreateFogModifierRadiusLocSimple takes player whichPlayer, fogstate whichFogState, location center, real radius, boolean afterUnits returns fogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, afterUnits)
    return bj_lastCreatedFogModifier
endfunction


// 启用可见度修正器(矩形区域)
// Version of CreateFogModifierRect that assumes use of sharedVision and
// gives the option of immediately enabling the modifier, so that triggers
// can default to modifiers that are immediately enabled.
function CreateFogModifierRectBJ takes boolean enabled, player whichPlayer, fogstate whichFogState, rect r returns fogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRect(whichPlayer, whichFogState, r, true, false)
    if enabled then
        call FogModifierStart(bj_lastCreatedFogModifier)
    endif
    return bj_lastCreatedFogModifier
endfunction


// 启用可见度修正器(圆形范围)
// Version of CreateFogModifierRadius that assumes use of sharedVision and
// gives the option of immediately enabling the modifier, so that triggers
// can default to modifiers that are immediately enabled.
function CreateFogModifierRadiusLocBJ takes boolean enabled, player whichPlayer, fogstate whichFogState, location center, real radius returns fogmodifier
    set bj_lastCreatedFogModifier = CreateFogModifierRadiusLoc(whichPlayer, whichFogState, center, radius, true, false)
    if enabled then
        call FogModifierStart(bj_lastCreatedFogModifier)
    endif
    return bj_lastCreatedFogModifier
endfunction


// 获取最后创建的可见度修正器
function GetLastCreatedFogModifier takes nothing returns fogmodifier
    return bj_lastCreatedFogModifier
endfunction


// 启用 迷雾
function FogEnableOn takes nothing returns nothing
    call FogEnable(true)
endfunction


// 禁用 迷雾
function FogEnableOff takes nothing returns nothing
    call FogEnable(false)
endfunction


// 启用 黑色阴影
function FogMaskEnableOn takes nothing returns nothing
    call FogMaskEnable(true)
endfunction


// 禁用 黑色阴影
function FogMaskEnableOff takes nothing returns nothing
    call FogMaskEnable(false)
endfunction


// 打开/关闭 昼夜循环
function UseTimeOfDayBJ takes boolean flag returns nothing
    call SuspendTimeOfDay(not flag)
endfunction


// 设置地形迷雾 
//@param style 风格，输入0,1,2[对应直线，指数1，指数2]
//@param zstart Z 轴开始值
//@param zend Z 轴结束值
//@param density 密度
function SetTerrainFogExBJ takes integer style, real zstart, real zend, real density, real red, real green, real blue returns nothing
    call SetTerrainFogEx(style, zstart, zend, density, red * 0.01, green * 0.01, blue * 0.01)
endfunction


// 重置 地形迷雾
function ResetTerrainFogBJ takes nothing returns nothing
    call ResetTerrainFog()
endfunction


// 播放圆形范围内地表装饰物动画
function SetDoodadAnimationBJ takes string animName, integer doodadID, real radius, location center returns nothing
    call SetDoodadAnimation(GetLocationX(center), GetLocationY(center), radius, doodadID, false, animName, false)
endfunction


// 播放矩形区域内地表装饰物动画
function SetDoodadAnimationRectBJ takes string animName, integer doodadID, rect r returns nothing
    call SetDoodadAnimationRect(r, doodadID, animName, false)
endfunction


// 添加/删除 单位动画 附加名
function AddUnitAnimationPropertiesBJ takes boolean add, string animProperties, unit whichUnit returns nothing
    call AddUnitAnimationProperties(whichUnit, animProperties, add)
endfunction



// 创建图像
function CreateImageBJ takes string file, real size, location where, real zOffset, integer imageType returns image
    set bj_lastCreatedImage = CreateImage(file, size, size, size, GetLocationX(where), GetLocationY(where), zOffset, 0, 0, 0, imageType)
    return bj_lastCreatedImage
endfunction


// 显示/隐藏 图像
function ShowImageBJ takes boolean flag, image whichImage returns nothing
    call ShowImage(whichImage, flag)
endfunction


// 设置图像位置（指定点）
function SetImagePositionBJ takes image whichImage, location where, real zOffset returns nothing
    call SetImagePosition(whichImage, GetLocationX(where), GetLocationY(where), zOffset)
endfunction


// 设置图像颜色
function SetImageColorBJ takes image whichImage, real red, real green, real blue, real alpha returns nothing
    call SetImageColor(whichImage, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - alpha))
endfunction


// 获取最后创建的图像
function GetLastCreatedImage takes nothing returns image
    return bj_lastCreatedImage
endfunction


// 创建地面纹理
// @param alpha 透明度
// @param forcePaused 是否禁用暂停状态
// @param noBirthTime 是否启用出生动画
function CreateUbersplatBJ takes location where, string name, real red, real green, real blue, real alpha, boolean forcePaused, boolean noBirthTime returns ubersplat
    set bj_lastCreatedUbersplat = CreateUbersplat(GetLocationX(where), GetLocationY(where), name, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - alpha), forcePaused, noBirthTime)
    return bj_lastCreatedUbersplat
endfunction


// 显示/隐藏 地面纹理
function ShowUbersplatBJ takes boolean flag, ubersplat whichSplat returns nothing
    call ShowUbersplat(whichSplat, flag)
endfunction


// 获取最后创建的地面纹理
function GetLastCreatedUbersplat takes nothing returns ubersplat
    return bj_lastCreatedUbersplat
endfunction

// 获取最后创建的小地图（任务）图标
function GetLastCreatedMinimapIcon takes nothing returns minimapicon
    return bj_lastCreatedMinimapIcon
endfunction

// 创建小地图（任务）图标（指定单位和迷雾内状态）
function CreateMinimapIconOnUnitBJ takes unit whichUnit, integer red, integer green, integer blue, string pingPath, fogstate fogVisibility returns minimapicon
    set bj_lastCreatedMinimapIcon = CreateMinimapIconOnUnit(whichUnit, red, green, blue, pingPath, fogVisibility)
    return bj_lastCreatedMinimapIcon
endfunction

// 创建小地图（任务）图标（指定点和迷雾内状态）
function CreateMinimapIconAtLocBJ takes location where, integer red, integer green, integer blue, string pingPath, fogstate fogVisibility returns minimapicon
    set bj_lastCreatedMinimapIcon = CreateMinimapIconAtLoc(where, red, green, blue, pingPath, fogVisibility)
    return bj_lastCreatedMinimapIcon
endfunction

// 创建小地图（任务）图标（指定坐标和迷雾内状态）
function CreateMinimapIconBJ takes real x, real y, integer red, integer green, integer blue, string pingPath, fogstate fogVisibility returns minimapicon
    set bj_lastCreatedMinimapIcon = CreateMinimapIcon(x, y, red, green, blue, pingPath, fogVisibility)
    return bj_lastCreatedMinimapIcon
endfunction

// 创建小地图（任务）图标（指定单位和样式）
function CampaignMinimapIconUnitBJ takes unit whichUnit, integer style returns nothing
	local integer	red
	local integer green
	local integer blue
	local string path
	if(style == bj_CAMPPINGSTYLE_PRIMARY) then
		// green
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_PRIMARY_GREEN) then
		// green
		set red = 0
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_PRIMARY_RED) then
		// green
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_BONUS) then
		// yellow
		set red = 255
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectiveBonus")
	elseif(style == bj_CAMPPINGSTYLE_TURNIN) then
		// yellow
		set red = 255
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestTurnIn")
	elseif(style == bj_CAMPPINGSTYLE_BOSS) then
		// red
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestBoss")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_ALLY) then
		// green
		set red = 0
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_NEUTRAL) then
		// white
		set red = 255
		set green = 255
		set blue	= 255
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_ENEMY) then
		// red
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	endif
	call CreateMinimapIconOnUnitBJ(whichUnit, red, green, blue, path, FOG_OF_WAR_MASKED)
    call SetMinimapIconOrphanDestroy(bj_lastCreatedMinimapIcon, true)
endfunction


// 创建小地图（任务）图标（指定点和样式）
function CampaignMinimapIconLocBJ takes location where, integer style returns nothing
	local integer	red
	local integer green
	local integer blue
	local string path
	if(style == bj_CAMPPINGSTYLE_PRIMARY) then
		// green (different from the unit version)
		set red = 0
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_PRIMARY_GREEN) then
		// green (different from the unit version)
		set red = 0
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_PRIMARY_RED) then
		// green (different from the unit version)
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectivePrimary")
	elseif(style == bj_CAMPPINGSTYLE_BONUS) then
		// yellow
		set red = 255
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestObjectiveBonus")
	elseif(style == bj_CAMPPINGSTYLE_TURNIN) then
		// yellow
		set red = 255
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestTurnIn")
	elseif(style == bj_CAMPPINGSTYLE_BOSS) then
		// red
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestBoss")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_ALLY) then
		// green
		set red = 0
		set green = 255
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_NEUTRAL) then
		// white
		set red = 255
		set green = 255
		set blue	= 255
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	elseif(style == bj_CAMPPINGSTYLE_CONTROL_ENEMY) then
		// red
		set red = 255
		set green = 0
		set blue	= 0
		set path	= SkinManagerGetLocalPath("MinimapQuestControlPoint")
	endif
	call CreateMinimapIconAtLocBJ(where, red, green, blue, path, FOG_OF_WAR_MASKED)
endfunction


//***************************************************************************
//*
//*  Sound Utility Functions
//*
//***************************************************************************


// 播放音效
function PlaySoundBJ takes sound soundHandle returns nothing
    set bj_lastPlayedSound = soundHandle
    if(soundHandle != null) then
        call StartSound(soundHandle)
    endif
endfunction


// 停止播放音效
function StopSoundBJ takes sound soundHandle, boolean fadeOut returns nothing
    call StopSound(soundHandle, false, fadeOut)
endfunction


// 设置音效音量
function SetSoundVolumeBJ takes sound soundHandle, real volumePercent returns nothing
    call SetSoundVolume(soundHandle, PercentToInt(volumePercent, 127))
endfunction


// 播放音效（指定跳到的时间帧）
function SetSoundOffsetBJ takes real newOffset, sound soundHandle returns nothing
    call SetSoundPlayPosition(soundHandle, R2I(newOffset * 1000))
endfunction


// 设置音效切断距离
function SetSoundDistanceCutoffBJ takes sound soundHandle, real cutoff returns nothing
    call SetSoundDistanceCutoff(soundHandle, cutoff)
endfunction


// 设置音效播放速率
function SetSoundPitchBJ takes sound soundHandle, real pitch returns nothing
    call SetSoundPitch(soundHandle, pitch)
endfunction


// 设置3D音效位置
function SetSoundPositionLocBJ takes sound soundHandle, location loc, real z returns nothing
    call SetSoundPosition(soundHandle, GetLocationX(loc), GetLocationY(loc), z)
endfunction


// 捆绑3D音效到单位
function AttachSoundToUnitBJ takes sound soundHandle, unit whichUnit returns nothing
    call AttachSoundToUnit(soundHandle, whichUnit)
endfunction

// 设置3D音效音锥角度
function SetSoundConeAnglesBJ takes sound soundHandle, real inside, real outside, real outsideVolumePercent returns nothing
    call SetSoundConeAngles(soundHandle, inside, outside, PercentToInt(outsideVolumePercent, 127))
endfunction


// 播放完成时关闭音效（不再循环）
function KillSoundWhenDoneBJ takes sound soundHandle returns nothing
    call KillSoundWhenDone(soundHandle)
endfunction


// 设置音源位置并播放音效（指定点）
function PlaySoundAtPointBJ takes sound soundHandle, real volumePercent, location loc, real z returns nothing
    call SetSoundPositionLocBJ(soundHandle, loc, z)
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
endfunction


// 设置音源位置并播放音效（指定单位）
function PlaySoundOnUnitBJ takes sound soundHandle, real volumePercent, unit whichUnit returns nothing
    call AttachSoundToUnitBJ(soundHandle, whichUnit)
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
endfunction


// 播放音效（有等待时间）
function PlaySoundFromOffsetBJ takes sound soundHandle, real volumePercent, real startingOffset returns nothing
    call SetSoundVolumeBJ(soundHandle, volumePercent)
    call PlaySoundBJ(soundHandle)
    call SetSoundOffsetBJ(startingOffset, soundHandle)
endfunction


// 播放音乐
function PlayMusicBJ takes string musicFileName returns nothing
    set bj_lastPlayedMusic = musicFileName
    call PlayMusic(musicFileName)
endfunction


// 播放音乐(指定跳到的时间帧)
function PlayMusicExBJ takes string musicFileName, real startingOffset, real fadeInTime returns nothing
    set bj_lastPlayedMusic = musicFileName
    call PlayMusicEx(musicFileName, R2I(startingOffset * 1000), R2I(fadeInTime * 1000))
endfunction


// 指定音乐跳到的时间帧
function SetMusicOffsetBJ takes real newOffset returns nothing
    call SetMusicPlayPosition(R2I(newOffset * 1000))
endfunction


// 播放主题音乐
function PlayThematicMusicBJ takes string musicName returns nothing
    call PlayThematicMusic(musicName)
endfunction


// 播放主题音乐(指定开始的时间帧)
function PlayThematicMusicExBJ takes string musicName, real startingOffset returns nothing
    call PlayThematicMusicEx(musicName, R2I(startingOffset * 1000))
endfunction


// 停止主题音乐（指定结束的时间帧）
function SetThematicMusicOffsetBJ takes real newOffset returns nothing
    call SetThematicMusicPlayPosition(R2I(newOffset * 1000))
endfunction


// 停止主题音乐
function EndThematicMusicBJ takes nothing returns nothing
    call EndThematicMusic()
endfunction


// 停止音乐
function StopMusicBJ takes boolean fadeOut returns nothing
    call StopMusic(fadeOut)
endfunction


// 继续音乐
function ResumeMusicBJ takes nothing returns nothing
    call ResumeMusic()
endfunction


// 设置音乐音量
function SetMusicVolumeBJ takes real volumePercent returns nothing
    call SetMusicVolume(PercentToInt(volumePercent, 127))
endfunction

// 设置主题音乐音量
function SetThematicMusicVolumeBJ takes real volumePercent returns nothing
    call SetThematicMusicVolume(PercentToInt(volumePercent, 127))
endfunction


// 获取音效持续时间
function GetSoundDurationBJ takes sound soundHandle returns real
    if(soundHandle == null) then
        return bj_NOTHING_SOUND_DURATION
    else
        return I2R(GetSoundDuration(soundHandle)) * 0.001
    endif
endfunction


// 获取音乐持续时间
function GetSoundFileDurationBJ takes string musicFileName returns real
    return I2R(GetSoundFileDuration(musicFileName)) * 0.001
endfunction


// 获取最后播放的音效
function GetLastPlayedSound takes nothing returns sound
    return bj_lastPlayedSound
endfunction


// 获取最后播放的音乐
function GetLastPlayedMusic takes nothing returns string
    return bj_lastPlayedMusic
endfunction


// 设置音量（指定声道）
function VolumeGroupSetVolumeBJ takes volumegroup vgroup, real percent returns nothing
    call VolumeGroupSetVolume(vgroup, percent * 0.01)
endfunction


// 设置电影所有声道音量(立即)
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


// 设置所有声道音量为电影模式
function SetCineModeVolumeGroupsBJ takes nothing returns nothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call SetCineModeVolumeGroupsImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetCineModeVolumeGroupsImmediateBJ)
    endif
endfunction


// 设置所有声道发言音量环境为默认值(立即)
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


// 设置所有声道发言模式
function SetSpeechVolumeGroupsBJ takes nothing returns nothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call SetSpeechVolumeGroupsImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function SetSpeechVolumeGroupsImmediateBJ)
    endif
endfunction


// 重置所有声道音量(立即)
function VolumeGroupResetImmediateBJ takes nothing returns nothing
    call VolumeGroupReset()
endfunction


// 重置所有声道音量为预设值
function VolumeGroupResetBJ takes nothing returns nothing
    // Delay the request if it occurs at map init.
    if bj_gameStarted then
        call VolumeGroupResetImmediateBJ()
    else
        call TimerStart(bj_volumeGroupsTimer, bj_GAME_STARTED_THRESHOLD, false, function VolumeGroupResetImmediateBJ)
    endif
endfunction


// 判断音效是否已在加载/播放
function GetSoundIsPlayingBJ takes sound soundHandle returns boolean
    return GetSoundIsLoading(soundHandle) or GetSoundIsPlaying(soundHandle)
endfunction


// 等到指定音效结束前N秒（指定时间）
function WaitForSoundBJ takes sound soundHandle, real offset returns nothing
    call TriggerWaitForSound(soundHandle, offset)
endfunction


// 设置地图音乐(使用指定音乐)
function SetMapMusicIndexedBJ takes string musicName, integer index returns nothing
    call SetMapMusic(musicName, false, index)
endfunction


// 设置地图背景音乐 (使用随机音乐)
function SetMapMusicRandomBJ takes string musicName returns nothing
    call SetMapMusic(musicName, true, 0)
endfunction


// 清除地图背景音乐
function ClearMapMusicBJ takes nothing returns nothing
    call ClearMapMusic()
endfunction


// 添加/删除 穿越区域的3D音效
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


// 为指定玩家播放音效
function StartSoundForPlayerBJ takes player whichPlayer, sound soundHandle returns nothing
    if(whichPlayer == GetLocalPlayer()) then
        call StartSound(soundHandle)
    endif
endfunction


// 设置玩家声道音量
function VolumeGroupSetVolumeForPlayerBJ takes player whichPlayer, volumegroup vgroup, real scale returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        call VolumeGroupSetVolume(vgroup, scale)
    endif
endfunction


// 启用/禁用 黎明/黄昏 音效
function EnableDawnDusk takes boolean flag returns nothing
    set bj_useDawnDuskSounds = flag
endfunction


// 查询是否启用了 黎明/黄昏 音效
function IsDawnDuskEnabled takes nothing returns boolean
    return bj_useDawnDuskSounds
endfunction



//***************************************************************************
//*
//*  Day/Night ambient sounds
//*
//***************************************************************************


// 设置白天环境音效
function SetAmbientDaySound takes string inLabel returns nothing
    local real ToD

    // Stop old sound, if necessary
    if(bj_dayAmbientSound != null) then
        call StopSound(bj_dayAmbientSound, true, true)
    endif

    // Create new sound
    set bj_dayAmbientSound = CreateMIDISound(inLabel, 20, 20)

    // Start the sound if necessary, based on current time
    set ToD = GetTimeOfDay()
    if(ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) then
        call StartSound(bj_dayAmbientSound)
    endif
endfunction


// 设置夜晚环境音效
function SetAmbientNightSound takes string inLabel returns nothing
    local real ToD

    // Stop old sound, if necessary
    if(bj_nightAmbientSound != null) then
        call StopSound(bj_nightAmbientSound, true, true)
    endif

    // Create new sound
    set bj_nightAmbientSound = CreateMIDISound(inLabel, 20, 20)

    // Start the sound if necessary, based on current time
    set ToD = GetTimeOfDay()
    if(ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) then
        call StartSound(bj_nightAmbientSound)
    endif
endfunction



//***************************************************************************
//*
//*  Special Effect Utility Functions
//*
//***************************************************************************


// 新建特效（指定点）
function AddSpecialEffectLocBJ takes location where, string modelName returns effect
    set bj_lastCreatedEffect = AddSpecialEffectLoc(modelName, where)
    return bj_lastCreatedEffect
endfunction


// 新建特效（指定单位/物品/可破坏物）
function AddSpecialEffectTargetUnitBJ takes string attachPointName, widget targetWidget, string modelName returns effect
    set bj_lastCreatedEffect = AddSpecialEffectTarget(modelName, targetWidget, attachPointName)
    return bj_lastCreatedEffect
endfunction


// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
// Commented out - Destructibles have no attachment points.
// 新建特效（指定可破坏物）
//function AddSpecialEffectTargetDestructableBJ takes string attachPointName, widget targetWidget, string modelName returns effect
//    return AddSpecialEffectTargetUnitBJ(attachPointName, targetWidget, modelName)
//endfunction


// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
// Commented out - Items have no attachment points.
// 新建特效（指定物品）
//function AddSpecialEffectTargetItemBJ takes string attachPointName, widget targetWidget, string modelName returns effect
//    return AddSpecialEffectTargetUnitBJ(attachPointName, targetWidget, modelName)
//endfunction


// 销毁特效
function DestroyEffectBJ takes effect whichEffect returns nothing
    call DestroyEffect(whichEffect)
endfunction


// 获取最后创建的特效
function GetLastCreatedEffectBJ takes nothing returns effect
    return bj_lastCreatedEffect
endfunction



//***************************************************************************
//*
//*  Command Button Effect Utility Functions
//*
//***************************************************************************

// 创建技能按钮特效
function CreateCommandButtonEffectBJ takes integer abilityId, string order returns commandbuttoneffect
    set bj_lastCreatedCommandButtonEffect = CreateCommandButtonEffect(abilityId, order)
    return bj_lastCreatedCommandButtonEffect
endfunction

// 创建训练单位按钮特效（'Aque'）
function CreateTrainCommandButtonEffectBJ takes integer unitId returns commandbuttoneffect
    set bj_lastCreatedCommandButtonEffect = CreateCommandButtonEffect('Aque', UnitId2String(unitId))
    return bj_lastCreatedCommandButtonEffect
endfunction

// 创建研究科技按钮特效
function CreateUpgradeCommandButtonEffectBJ takes integer techId returns commandbuttoneffect
    set bj_lastCreatedCommandButtonEffect = CreateUpgradeCommandButtonEffect(techId)
    return bj_lastCreatedCommandButtonEffect
endfunction

// 创建命令按钮特效
function CreateCommonCommandButtonEffectBJ takes string order returns commandbuttoneffect
    set bj_lastCreatedCommandButtonEffect = CreateCommandButtonEffect(0, order)
    return bj_lastCreatedCommandButtonEffect
endfunction

// 创建学习技能按钮特效
function CreateLearnCommandButtonEffectBJ takes integer abilityId returns commandbuttoneffect
    set bj_lastCreatedCommandButtonEffect = CreateLearnCommandButtonEffect(abilityId)
    return bj_lastCreatedCommandButtonEffect
endfunction

// 创建建造单位按钮特效
function CreateBuildCommandButtonEffectBJ takes integer unitId returns commandbuttoneffect
	local race r = GetPlayerRace(GetLocalPlayer())
	local integer abilityId
	if(r == RACE_HUMAN) then
        set abilityId = 'AHbu'
    elseif(r == RACE_ORC) then
        set abilityId = 'AObu'
    elseif(r == RACE_UNDEAD) then
        set abilityId = 'AUbu'
    elseif(r == RACE_NIGHTELF) then
        set abilityId = 'AEbu'
    else
        set abilityId = 'ANbu'
    endif
    set bj_lastCreatedCommandButtonEffect = CreateCommandButtonEffect(abilityId, UnitId2String(unitId))
    return bj_lastCreatedCommandButtonEffect
endfunction

// 获取最后创建的按钮特效
function GetLastCreatedCommandButtonEffectBJ takes nothing returns commandbuttoneffect
    return bj_lastCreatedCommandButtonEffect
endfunction


//***************************************************************************
//*
//*  Hero and Item Utility Functions
//*
//***************************************************************************


// 获取物品位置
// 会创建点，用完请注意排泄
function GetItemLoc takes item whichItem returns location
    return Location(GetItemX(whichItem), GetItemY(whichItem))
endfunction


// 获取物品生命值
function GetItemLifeBJ takes widget whichWidget returns real
    return GetWidgetLife(whichWidget)
endfunction


// 设置物品生命值
function SetItemLifeBJ takes widget whichWidget, real life returns nothing
    call SetWidgetLife(whichWidget, life)
endfunction


// 增加英雄经验值
function AddHeroXPSwapped takes integer xpToAdd, unit whichHero, boolean showEyeCandy returns nothing
    call AddHeroXP(whichHero, xpToAdd, showEyeCandy)
endfunction


// 设置英雄等级
function SetHeroLevelBJ takes unit whichHero, integer newLevel, boolean showEyeCandy returns nothing
    local integer oldLevel = GetHeroLevel(whichHero)

    if(newLevel > oldLevel) then
        call SetHeroLevel(whichHero, newLevel, showEyeCandy)
    elseif(newLevel < oldLevel) then
        call UnitStripHeroLevel(whichHero, oldLevel - newLevel)
    else
        // No change in level - ignore the request.
    endif
endfunction


// 降低单位技能等级
function DecUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
    return DecUnitAbilityLevel(whichUnit, abilcode)
endfunction


// 提升单位技能等级
function IncUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
    return IncUnitAbilityLevel(whichUnit, abilcode)
endfunction


// 设置单位技能等级
function SetUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit, integer level returns integer
    return SetUnitAbilityLevel(whichUnit, abilcode, level)
endfunction


// 获取单位技能等级
function GetUnitAbilityLevelSwapped takes integer abilcode, unit whichUnit returns integer
    return GetUnitAbilityLevel(whichUnit, abilcode)
endfunction


// 判断单位是否拥有 魔法特效（Buff）
function UnitHasBuffBJ takes unit whichUnit, integer buffcode returns boolean
    return(GetUnitAbilityLevel(whichUnit, buffcode) > 0)
endfunction


// 删除 魔法特效（Buff） (指定Buff)
function UnitRemoveBuffBJ takes integer buffcode, unit whichUnit returns boolean
    return UnitRemoveAbility(whichUnit, buffcode)
endfunction


// 创建物品（指定单位）触发器动作
function UnitAddItemSwapped takes item whichItem, unit whichHero returns boolean
    return UnitAddItem(whichHero, whichItem)
endfunction


// 创建物品（指定单位）触发器
// 若单位没有物品栏或物品栏已满，将会创建在单位位置
function UnitAddItemByIdSwapped takes integer itemId, unit whichHero returns item
    // Create the item at the hero's feet first, and then give it to him.
    // This is to ensure that the item will be left at the hero's feet if
    // his inventory is full. 
    set bj_lastCreatedItem = CreateItem(itemId, GetUnitX(whichHero), GetUnitY(whichHero))
    call UnitAddItem(whichHero, bj_lastCreatedItem)
    return bj_lastCreatedItem
endfunction


// 丢弃物品（指定单位）
// 包括不可丢弃的物品
// 单位死亡或删除后，也能正常丢弃
// 会设置bj_lastRemovedItem
function UnitRemoveItemSwapped takes item whichItem, unit whichHero returns nothing
    set bj_lastRemovedItem = whichItem
    call UnitRemoveItem(whichHero, whichItem)
endfunction



// 丢弃物品（指定单位指定物品栏格子）
// 包括不可丢弃的物品
// 单位死亡或删除后，也能正常丢弃
// 会设置bj_lastRemovedItem
// Translates 0-based slot indices to 1-based slot indices.
function UnitRemoveItemFromSlotSwapped takes integer itemSlot, unit whichHero returns item
    set bj_lastRemovedItem = UnitRemoveItemFromSlot(whichHero, itemSlot - 1)
    return bj_lastRemovedItem
endfunction


// 创建物品（指定点）
function CreateItemLoc takes integer itemId, location loc returns item
    set bj_lastCreatedItem = CreateItem(itemId, GetLocationX(loc), GetLocationY(loc))
    return bj_lastCreatedItem
endfunction


// 获取最后创建的物品
function GetLastCreatedItem takes nothing returns item
    return bj_lastCreatedItem
endfunction


// 获取最后丢弃的物品
function GetLastRemovedItem takes nothing returns item
    return bj_lastRemovedItem
endfunction


// 移动物品到点 (立即)
function SetItemPositionLoc takes item whichItem, location loc returns nothing
    call SetItemPosition(whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction


// 获取学习的技能
function GetLearnedSkillBJ takes nothing returns integer
    return GetLearnedSkill()
endfunction


// 允许/禁止 英雄获得经验值
function SuspendHeroXPBJ takes boolean flag, unit whichHero returns nothing
    call SuspendHeroXP(whichHero, not flag)
endfunction

// 设置玩家伤害障碍
function SetPlayerHandicapDamageBJ takes player whichPlayer, real handicapPercent returns nothing
    call SetPlayerHandicapDamage(whichPlayer, handicapPercent * 0.01)
endfunction

// 获取玩家伤害障碍
function GetPlayerHandicapDamageBJ takes player whichPlayer returns real
    return GetPlayerHandicapDamage(whichPlayer) * 100
endfunction

// 设置玩家复活时间
// 玩家障碍，额外的复活时间
function SetPlayerHandicapReviveTimeBJ takes player whichPlayer, real handicapPercent returns nothing
    call SetPlayerHandicapReviveTime(whichPlayer, handicapPercent * 0.01)
endfunction

// 获取玩家复活时间
// 玩家障碍，额外的复活时间
function GetPlayerHandicapReviveTimeBJ takes player whichPlayer returns real
    return GetPlayerHandicapReviveTime(whichPlayer) * 100
endfunction


// 设置玩家英雄经验获得率
function SetPlayerHandicapXPBJ takes player whichPlayer, real handicapPercent returns nothing
    call SetPlayerHandicapXP(whichPlayer, handicapPercent * 0.01)
endfunction


// 获取玩家经验获得率
function GetPlayerHandicapXPBJ takes player whichPlayer returns real
    return GetPlayerHandicapXP(whichPlayer) * 100
endfunction


// 设置玩家生命百分比
function SetPlayerHandicapBJ takes player whichPlayer, real handicapPercent returns nothing
    call SetPlayerHandicap(whichPlayer, handicapPercent * 0.01)
endfunction


// 获取玩家经验值上限
function GetPlayerHandicapBJ takes player whichPlayer returns real
    return GetPlayerHandicap(whichPlayer) * 100
endfunction


// 获取英雄属性值，获取失败会返回0
function GetHeroStatBJ takes integer whichStat, unit whichHero, boolean includeBonuses returns integer
    if(whichStat == bj_HEROSTAT_STR) then
        return GetHeroStr(whichHero, includeBonuses)
    elseif(whichStat == bj_HEROSTAT_AGI) then
        return GetHeroAgi(whichHero, includeBonuses)
    elseif(whichStat == bj_HEROSTAT_INT) then
        return GetHeroInt(whichHero, includeBonuses)
    else
        // Unrecognized hero stat - return 0
        return 0
    endif
endfunction


// 设置英雄属性值
function SetHeroStat takes unit whichHero, integer whichStat, integer value returns nothing
    // Ignore requests for negative hero stats.
    if(value <= 0) then
        return
    endif

    if(whichStat == bj_HEROSTAT_STR) then
        call SetHeroStr(whichHero, value, true)
    elseif(whichStat == bj_HEROSTAT_AGI) then
        call SetHeroAgi(whichHero, value, true)
    elseif(whichStat == bj_HEROSTAT_INT) then
        call SetHeroInt(whichHero, value, true)
    else
        // Unrecognized hero stat - ignore the request.
    endif
endfunction


// 修改英雄属性
function ModifyHeroStat takes integer whichStat, unit whichHero, integer modifyMethod, integer value returns nothing
    if(modifyMethod == bj_MODIFYMETHOD_ADD) then
        call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) + value)
    elseif(modifyMethod == bj_MODIFYMETHOD_SUB) then
        call SetHeroStat(whichHero, whichStat, GetHeroStatBJ(whichStat, whichHero, false) - value)
    elseif(modifyMethod == bj_MODIFYMETHOD_SET) then
        call SetHeroStat(whichHero, whichStat, value)
    else
        // Unrecognized modification method - ignore the request.
    endif
endfunction


// 修改英雄技能点数，修改失败会返回假
function ModifyHeroSkillPoints takes unit whichHero, integer modifyMethod, integer value returns boolean
    if(modifyMethod == bj_MODIFYMETHOD_ADD) then
        return UnitModifySkillPoints(whichHero, value)
    elseif(modifyMethod == bj_MODIFYMETHOD_SUB) then
        return UnitModifySkillPoints(whichHero, - value)
    elseif(modifyMethod == bj_MODIFYMETHOD_SET) then
        return UnitModifySkillPoints(whichHero, value - GetHeroSkillPoints(whichHero))
    else
        // Unrecognized modification method - ignore the request and return failure.
        return false
    endif
endfunction


// 发布丢弃物品命令（指定坐标）
// 不会设置bj_lastRemovedItem
function UnitDropItemPointBJ takes unit whichUnit, item whichItem, real x, real y returns boolean
    return UnitDropItemPoint(whichUnit, whichItem, x, y)
endfunction


// 发布丢弃物品命令（指定点）
// 不会设置bj_lastRemovedItem
function UnitDropItemPointLoc takes unit whichUnit, item whichItem, location loc returns boolean
    return UnitDropItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction


// 发布移动物品命令（指定物品栏格数）
function UnitDropItemSlotBJ takes unit whichUnit, item whichItem, integer slot returns boolean
    return UnitDropItemSlot(whichUnit, whichItem, slot - 1)
endfunction


// 发布丢弃物品命令（指定目标单位/物品/可破坏物）
// 不会设置bj_lastRemovedItem
function UnitDropItemTargetBJ takes unit whichUnit, item whichItem, widget target returns boolean
    return UnitDropItemTarget(whichUnit, whichItem, target)
endfunction


// 发布使用物品命令（指定可破坏物）
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
function UnitUseItemDestructable takes unit whichUnit, item whichItem, widget target returns boolean
    return UnitUseItemTarget(whichUnit, whichItem, target)
endfunction


// 发布使用物品命令（指定点）
function UnitUseItemPointLoc takes unit whichUnit, item whichItem, location loc returns boolean
    return UnitUseItemPoint(whichUnit, whichItem, GetLocationX(loc), GetLocationY(loc))
endfunction


// 获取英雄携带的物品（指定物品格）
// Translates 0-based slot indices to 1-based slot indices.
function UnitItemInSlotBJ takes unit whichUnit, integer itemSlot returns item
    return UnitItemInSlot(whichUnit, itemSlot - 1)
endfunction


// 获取物品在物品栏的格数（指定物品类型）
// Translates 0-based slot indices to 1-based slot indices.
function GetInventoryIndexOfItemTypeBJ takes unit whichUnit, integer itemId returns integer
    local integer index
    local item indexItem

    set index = 0
    loop
        set indexItem = UnitItemInSlot(whichUnit, index)
        if(indexItem != null) and(GetItemTypeId(indexItem) == itemId) then
            return index + 1
        endif

        set index = index + 1
        exitwhen index >= bj_MAX_INVENTORY
    endloop
    return 0
endfunction


// 获取英雄携带的物品（指定物品类型）
function GetItemOfTypeFromUnitBJ takes unit whichUnit, integer itemId returns item
    local integer index = GetInventoryIndexOfItemTypeBJ(whichUnit, itemId)

    if(index == 0) then
        return null
    else
        return UnitItemInSlot(whichUnit, index - 1)
    endif
endfunction


// 查询英雄是否已有物品（指定物品类型）
function UnitHasItemOfTypeBJ takes unit whichUnit, integer itemId returns boolean
    return GetInventoryIndexOfItemTypeBJ(whichUnit, itemId) > 0
endfunction


// 获取指定单位拥有物品的数量
// 只判断所有物品格是否被占，不统计物品堆叠，即只返回0~6
function UnitInventoryCount takes unit whichUnit returns integer
    local integer index = 0
    local integer count = 0

    loop
        if(UnitItemInSlot(whichUnit, index) != null) then
            set count = count + 1
        endif

        set index = index + 1
        exitwhen index >= bj_MAX_INVENTORY
    endloop

    return count
endfunction


// 获取指定单位的物品栏格数
function UnitInventorySizeBJ takes unit whichUnit returns integer
    return UnitInventorySize(whichUnit)
endfunction


// 设置物品 无敌/可攻击
function SetItemInvulnerableBJ takes item whichItem, boolean flag returns nothing
    call SetItemInvulnerable(whichItem, flag)
endfunction


// 设置英雄死亡后物品是否掉落
function SetItemDropOnDeathBJ takes item whichItem, boolean flag returns nothing
    call SetItemDropOnDeath(whichItem, flag)
endfunction


// 设置物品可否丢弃
function SetItemDroppableBJ takes item whichItem, boolean flag returns nothing
    call SetItemDroppable(whichItem, flag)
endfunction


// 设置物品所属
function SetItemPlayerBJ takes item whichItem, player whichPlayer, boolean changeColor returns nothing
    call SetItemPlayer(whichItem, whichPlayer, changeColor)
endfunction


// 显示/隐藏 物品
function SetItemVisibleBJ takes boolean show, item whichItem returns nothing
    call SetItemVisible(whichItem, show)
endfunction


// 查询物品是否隐藏
function IsItemHiddenBJ takes item whichItem returns boolean
    return not IsItemVisible(whichItem)
endfunction


// 获取随机物品，默认用于市场/集市随机出售物品
function ChooseRandomItemBJ takes integer level returns integer
    return ChooseRandomItem(level)
endfunction


// 获取随机物品（指定分类），默认用于市场/集市随机出售物品
function ChooseRandomItemExBJ takes integer level, itemtype whichType returns integer
    return ChooseRandomItemEx(whichType, level)
endfunction


// 获取随机中立建筑物类型，默认用于开始游戏时创建随机中立建筑
function ChooseRandomNPBuildingBJ takes nothing returns integer
    return ChooseRandomNPBuilding()
endfunction


// 获取随机中立敌对单位类型(指定单位等级)
function ChooseRandomCreepBJ takes integer level returns integer
    return ChooseRandomCreep(level)
endfunction


// 选取指定区域内所有物品做动作(单个动作)
function EnumItemsInRectBJ takes rect r, code actionFunc returns nothing
    call EnumItemsInRect(r, null, actionFunc)
endfunction


// 随机选取指定区域的物品触发器动作
// See GroupPickRandomUnitEnum for the details of this algorithm.
function RandomItemInRectBJEnum takes nothing returns nothing
    set bj_itemRandomConsidered = bj_itemRandomConsidered + 1
    if(GetRandomInt(1, bj_itemRandomConsidered) == 1) then
        set bj_itemRandomCurrentPick = GetEnumItem()
    endif
endfunction


// 随机选取指定区域的匹配物品（可指定条件表达式）
// Picks a random item from within a rect, matching a condition
function RandomItemInRectBJ takes rect r, boolexpr filter returns item
    set bj_itemRandomConsidered = 0
    set bj_itemRandomCurrentPick = null
    call EnumItemsInRect(r, filter, function RandomItemInRectBJEnum)
    call DestroyBoolExpr(filter)
    return bj_itemRandomCurrentPick
endfunction


// 随机选取指定区域的物品
// Picks a random item from within a rect
function RandomItemInRectSimpleBJ takes rect r returns item
    return RandomItemInRectBJ(r, null)
endfunction


// 物品状态检查（指定物品）
function CheckItemStatus takes item whichItem, integer status returns boolean
    if(status == bj_ITEM_STATUS_HIDDEN) then
        return not IsItemVisible(whichItem)
    elseif(status == bj_ITEM_STATUS_OWNED) then
        return IsItemOwned(whichItem)
    elseif(status == bj_ITEM_STATUS_INVULNERABLE) then
        return IsItemInvulnerable(whichItem)
    elseif(status == bj_ITEM_STATUS_POWERUP) then
        return IsItemPowerup(whichItem)
    elseif(status == bj_ITEM_STATUS_SELLABLE) then
        return IsItemSellable(whichItem)
    elseif(status == bj_ITEM_STATUS_PAWNABLE) then
        return IsItemPawnable(whichItem)
    else
        // Unrecognized status - return false
        return false
    endif
endfunction


// 物品类型状态检查（指定类型）
function CheckItemcodeStatus takes integer itemId, integer status returns boolean
    if(status == bj_ITEMCODE_STATUS_POWERUP) then
        return IsItemIdPowerup(itemId)
    elseif(status == bj_ITEMCODE_STATUS_SELLABLE) then
        return IsItemIdSellable(itemId)
    elseif(status == bj_ITEMCODE_STATUS_PAWNABLE) then
        return IsItemIdPawnable(itemId)
    else
        // Unrecognized status - return false
        return false
    endif
endfunction



//***************************************************************************
//*
//*  Unit Utility Functions
//*
//***************************************************************************


// 转换单位类型成命令ID
function UnitId2OrderIdBJ takes integer unitId returns integer
    return unitId
endfunction


// 转换字符串成单位类型
function String2UnitIdBJ takes string unitIdString returns integer
    return UnitId(unitIdString)
endfunction


// 转换单位类型成字符串
function UnitId2StringBJ takes integer unitId returns string
    local string unitString = UnitId2String(unitId)

    if(unitString != null) then
        return unitString
    endif

    // The unitId was not recognized - return an empty string.
    return ""
endfunction


// 转换为命令字符串成命令ID
function String2OrderIdBJ takes string orderIdString returns integer
    local integer orderId
    
    // Check to see if it's a generic order.
    set orderId = OrderId(orderIdString)
    if(orderId != 0) then
        return orderId
    endif

    // Check to see if it's a (train) unit order.
    set orderId = UnitId(orderIdString)
    if(orderId != 0) then
        return orderId
    endif

    // Unrecognized - return 0
    return 0
endfunction


// 转换命令ID成命令字符串
function OrderId2StringBJ takes integer orderId returns string
    local string orderString

    // Check to see if it's a generic order.
    set orderString = OrderId2String(orderId)
    if(orderString != null) then
        return orderString
    endif

    // Check to see if it's a (train) unit order.
    set orderString = UnitId2String(orderId)
    if(orderString != null) then
        return orderString
    endif

    // Unrecognized - return an empty string.
    return ""
endfunction


// 获取发布的命令ID
function GetIssuedOrderIdBJ takes nothing returns integer
    return GetIssuedOrderId()
endfunction


// 获取凶手单位
function GetKillingUnitBJ takes nothing returns unit
    return GetKillingUnit()
endfunction


// 创建单位(指定点及朝向)
function CreateUnitAtLocSaveLast takes player id, integer unitid, location loc, real face returns unit
    if(unitid == 'ugol') then
        set bj_lastCreatedUnit = CreateBlightedGoldmine(id, GetLocationX(loc), GetLocationY(loc), face)
    else
        set bj_lastCreatedUnit = CreateUnitAtLoc(id, unitid, loc, face)
    endif

    return bj_lastCreatedUnit
endfunction


// 获取最后创建的单位
function GetLastCreatedUnit takes nothing returns unit
    return bj_lastCreatedUnit
endfunction


// 创建指定数量的单位（指定朝向）触发器动作
// 会创建单位组，用完请注意排泄
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


// 创建指定数量的单位（指定朝向）
// 会创建单位组，用完请注意排泄
function CreateNUnitsAtLocFacingLocBJ takes integer count, integer unitId, player whichPlayer, location loc, location lookAt returns group
    return CreateNUnitsAtLoc(count, unitId, whichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction


// 添加选取的单位到最后创建的单位组
function GetLastCreatedGroupEnum takes nothing returns nothing
    call GroupAddUnit(bj_groupLastCreatedDest, GetEnumUnit())
endfunction

// 创建单位组并添加选取单位
// 会创建单位组，用完请注意排泄
function GetLastCreatedGroup takes nothing returns group
    set bj_groupLastCreatedDest = CreateGroup()
    call ForGroup(bj_lastCreatedGroup, function GetLastCreatedGroupEnum)
    return bj_groupLastCreatedDest
endfunction


// 创建尸体
function CreateCorpseLocBJ takes integer unitid, player whichPlayer, location loc returns unit
    set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), GetRandomReal(0, 360))
    return bj_lastCreatedUnit
endfunction


// 设置尸体腐烂方式
function UnitSuspendDecayBJ takes boolean suspend, unit whichUnit returns nothing
    call UnitSuspendDecay(whichUnit, suspend)
endfunction


// 设置尸体延迟腐烂
function DelayedSuspendDecayStopAnimEnum takes nothing returns nothing
    local unit enumUnit = GetEnumUnit()

    if(GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call SetUnitTimeScale(enumUnit, 0.0001)
    endif
endfunction


// 设置延迟并停止尸体腐烂
function DelayedSuspendDecayBoneEnum takes nothing returns nothing
    local unit enumUnit = GetEnumUnit()

    if(GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call UnitSuspendDecay(enumUnit, true)
        call SetUnitTimeScale(enumUnit, 0.0001)
    endif
endfunction


// 设置尸体腐烂状态及动画触发器动作
// Game code explicitly sets the animation back to "decay bone" after the
// initial corpse fades away, so we reset it now.  It's best not to show
// off corpses thus created until after this grace period has passed.
function DelayedSuspendDecayFleshEnum takes nothing returns nothing
    local unit enumUnit = GetEnumUnit()

    if(GetUnitState(enumUnit, UNIT_STATE_LIFE) <= 0) then
        call UnitSuspendDecay(enumUnit, true)
        call SetUnitTimeScale(enumUnit, 10.0)
        call SetUnitAnimation(enumUnit, "decay flesh")
    endif
endfunction


// 设置尸体腐烂状态及动画触发器条件
// Waits a short period of time to ensure that the corpse is decaying, and
// then suspend the animation and corpse decay.
function DelayedSuspendDecay takes nothing returns nothing
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

// 创建尸体腐烂状态及动画触发器
function DelayedSuspendDecayCreate takes nothing returns nothing
    set bj_delayedSuspendDecayTrig = CreateTrigger()
    call TriggerRegisterTimerExpireEvent(bj_delayedSuspendDecayTrig, bj_delayedSuspendDecayTimer)
    call TriggerAddAction(bj_delayedSuspendDecayTrig, function DelayedSuspendDecay)
endfunction


// 创建尸体（永久的）
function CreatePermanentCorpseLocBJ takes integer style, integer unitid, player whichPlayer, location loc, real facing returns unit
    set bj_lastCreatedUnit = CreateCorpse(whichPlayer, unitid, GetLocationX(loc), GetLocationY(loc), facing)
    call SetUnitBlendTime(bj_lastCreatedUnit, 0)

    if(style == bj_CORPSETYPE_FLESH) then
        call SetUnitAnimation(bj_lastCreatedUnit, "decay flesh")
        call GroupAddUnit(bj_suspendDecayFleshGroup, bj_lastCreatedUnit)
    elseif(style == bj_CORPSETYPE_BONE) then
        call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
        call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
    else
        // Unknown decay style - treat as skeletal.
        call SetUnitAnimation(bj_lastCreatedUnit, "decay bone")
        call GroupAddUnit(bj_suspendDecayBoneGroup, bj_lastCreatedUnit)
    endif

    call TimerStart(bj_delayedSuspendDecayTimer, 0.05, false, null)
    return bj_lastCreatedUnit
endfunction


// 获取指定单位指定属性
function GetUnitStateSwap takes unitstate whichState, unit whichUnit returns real
    return GetUnitState(whichUnit, whichState)
endfunction

// 获取指定单位指定属性（以百分比形式返回）
function GetUnitStatePercent takes unit whichUnit, unitstate whichState, unitstate whichMaxState returns real
    local real value = GetUnitState(whichUnit, whichState)
    local real maxValue = GetUnitState(whichUnit, whichMaxState)

    // Return 0 for null units.
    if(whichUnit == null) or(maxValue == 0) then
        return 0.0
    endif

    return value / maxValue * 100.0
endfunction


// 获取指定单位的生命值百分比
function GetUnitLifePercent takes unit whichUnit returns real
    return GetUnitStatePercent(whichUnit, UNIT_STATE_LIFE, UNIT_STATE_MAX_LIFE)
endfunction


// 获取指定单位的魔法值百分比
function GetUnitManaPercent takes unit whichUnit returns real
    return GetUnitStatePercent(whichUnit, UNIT_STATE_MANA, UNIT_STATE_MAX_MANA)
endfunction


// 选择指定单位
function SelectUnitSingle takes unit whichUnit returns nothing
    call ClearSelection()
    call SelectUnit(whichUnit, true)
endfunction


// 选择单位组中的匹配单位
function SelectGroupBJEnum takes nothing returns nothing
    call SelectUnit(GetEnumUnit(), true)
endfunction

// 选择单位组
function SelectGroupBJ takes group g returns nothing
    call ClearSelection()
    call ForGroup(g, function SelectGroupBJEnum)
endfunction


// 添加选择单位(所有玩家)
function SelectUnitAdd takes unit whichUnit returns nothing
    call SelectUnit(whichUnit, true)
endfunction


// 取消选择单位(所有玩家)
function SelectUnitRemove takes unit whichUnit returns nothing
    call SelectUnit(whichUnit, false)
endfunction


// 取消选择单位（指定玩家）
function ClearSelectionForPlayer takes player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
    endif
endfunction


// 取消选择单位（指定单位和玩家）
function SelectUnitForPlayerSingle takes unit whichUnit, player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
        call SelectUnit(whichUnit, true)
    endif
endfunction


// 取消选择单位（指定单位组和玩家）
function SelectGroupForPlayerBJ takes group g, player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ClearSelection()
        call ForGroup(g, function SelectGroupBJEnum)
    endif
endfunction


// 选择单位（指定单位和玩家）
function SelectUnitAddForPlayer takes unit whichUnit, player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SelectUnit(whichUnit, true)
    endif
endfunction


// 取消选择单位（指定单位和玩家）
function SelectUnitRemoveForPlayer takes unit whichUnit, player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SelectUnit(whichUnit, false)
    endif
endfunction


// 设置单位生命值 (数值)
function SetUnitLifeBJ takes unit whichUnit, real newValue returns nothing
    call SetUnitState(whichUnit, UNIT_STATE_LIFE, RMaxBJ(0, newValue))
endfunction


// 设置单位魔法值 (数值)
function SetUnitManaBJ takes unit whichUnit, real newValue returns nothing
    call SetUnitState(whichUnit, UNIT_STATE_MANA, RMaxBJ(0, newValue))
endfunction


// 设置单位生命值 (百分比)
function SetUnitLifePercentBJ takes unit whichUnit, real percent returns nothing
    call SetUnitState(whichUnit, UNIT_STATE_LIFE, GetUnitState(whichUnit, UNIT_STATE_MAX_LIFE) * RMaxBJ(0, percent) * 0.01)
endfunction


// 设置单位魔法值 (百分比)
function SetUnitManaPercentBJ takes unit whichUnit, real percent returns nothing
    call SetUnitState(whichUnit, UNIT_STATE_MANA, GetUnitState(whichUnit, UNIT_STATE_MAX_MANA) * RMaxBJ(0, percent) * 0.01)
endfunction


// 查询单位是否已死亡
function IsUnitDeadBJ takes unit whichUnit returns boolean
    return GetUnitState(whichUnit, UNIT_STATE_LIFE) <= 0
endfunction


// 查询单位是否存活
function IsUnitAliveBJ takes unit whichUnit returns boolean
    return not IsUnitDeadBJ(whichUnit)
endfunction


// 查询单位组的单位是否已死亡触发器动作
function IsUnitGroupDeadBJEnum takes nothing returns nothing
    if not IsUnitDeadBJ(GetEnumUnit()) then
        set bj_isUnitGroupDeadResult = false
    endif
endfunction


// 查询单位组的单位是否已死亡
// 单位组内没有存活单位时返回真
// Returns true if every unit of the group is dead.
function IsUnitGroupDeadBJ takes group g returns boolean
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_isUnitGroupDeadResult = true
    call ForGroup(g, function IsUnitGroupDeadBJEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(g)
    endif
    return bj_isUnitGroupDeadResult
endfunction


// 查询单位组是否为空触发器动作
function IsUnitGroupEmptyBJEnum takes nothing returns nothing
    set bj_isUnitGroupEmptyResult = false
endfunction


// 查询单位组是否为空
// 单位组为空时返回true
// Returns true if the group contains no units.
function IsUnitGroupEmptyBJ takes group g returns boolean
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_isUnitGroupEmptyResult = true
    call ForGroup(g, function IsUnitGroupEmptyBJEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(g)
    endif
    return bj_isUnitGroupEmptyResult
endfunction


// 查询选取单位是否在区域内
function IsUnitGroupInRectBJEnum takes nothing returns nothing
    if not RectContainsUnit(bj_isUnitGroupInRectRect, GetEnumUnit()) then
        set bj_isUnitGroupInRectResult = false
    endif
endfunction



// 查询单位组中的单位是否都在指定区域内
// 任意单位不在区域内时返回否
// Returns true if every unit of the group is within the given rect.
function IsUnitGroupInRectBJ takes group g, rect r returns boolean
    set bj_isUnitGroupInRectResult = true
    set bj_isUnitGroupInRectRect = r
    call ForGroup(g, function IsUnitGroupInRectBJEnum)
    return bj_isUnitGroupInRectResult
endfunction


// 隐藏单位触发器动作
function IsUnitHiddenBJ takes unit whichUnit returns boolean
    return IsUnitHidden(whichUnit)
endfunction


// 隐藏单位
function ShowUnitHide takes unit whichUnit returns nothing
    call ShowUnit(whichUnit, false)
endfunction


// 显示单位
function ShowUnitShow takes unit whichUnit returns nothing
    // Prevent dead heroes from being unhidden.
    if(IsUnitType(whichUnit, UNIT_TYPE_HERO) and IsUnitDeadBJ(whichUnit)) then
        return
    endif

    call ShowUnit(whichUnit, true)
endfunction

// 发布建造闹鬼金矿命令（指定农民及金矿）触发器条件
function IssueHauntOrderAtLocBJFilter takes nothing returns boolean
    return GetUnitTypeId(GetFilterUnit()) == 'ngol'
endfunction

// 发布建造闹鬼金矿命令（指定农民及金矿）
function IssueHauntOrderAtLocBJ takes unit whichPeon, location loc returns boolean
    local group g = null
    local unit goldMine = null

    // Search for a gold mine within a 1-cell radius of the specified location.
    set g = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(g, loc, 2 * bj_CELLWIDTH, filterIssueHauntOrderAtLocBJ)
    set goldMine = FirstOfGroup(g)
    call DestroyGroup(g)

    // If no mine was found, abort the request.
    if(goldMine == null) then
        return false
    endif

    // Issue the Haunt Gold Mine order.
    return IssueTargetOrderById(whichPeon, 'ugol', goldMine)
endfunction


// 按ID发布建造建筑命令（指定点）
function IssueBuildOrderByIdLocBJ takes unit whichPeon, integer unitId, location loc returns boolean
    if(unitId == 'ugol') then
        return IssueHauntOrderAtLocBJ(whichPeon, loc)
    else
        return IssueBuildOrderById(whichPeon, unitId, GetLocationX(loc), GetLocationY(loc))
    endif
endfunction


// 按ID发布训练兵种/升级建筑命令
function IssueTrainOrderByIdBJ takes unit whichUnit, integer unitId returns boolean
    return IssueImmediateOrderById(whichUnit, unitId)
endfunction


// 按ID发布（单位组）训练兵种/升级建筑命令
function GroupTrainOrderByIdBJ takes group g, integer unitId returns boolean
    return GroupImmediateOrderById(g, unitId)
endfunction


// 按ID发布研究科技命令
function IssueUpgradeOrderByIdBJ takes unit whichUnit, integer techId returns boolean
    return IssueImmediateOrderById(whichUnit, techId)
endfunction


// 获取被攻击的单位
function GetAttackedUnitBJ takes nothing returns unit
    return GetTriggerUnit()
endfunction


// 设置单位飞行高度
function SetUnitFlyHeightBJ takes unit whichUnit, real newHeight, real rate returns nothing
    call SetUnitFlyHeight(whichUnit, newHeight, rate)
endfunction


// 设置单位转向速度
function SetUnitTurnSpeedBJ takes unit whichUnit, real turnSpeed returns nothing
    call SetUnitTurnSpeed(whichUnit, turnSpeed)
endfunction


// 设置单位转向角度
function SetUnitPropWindowBJ takes unit whichUnit, real propWindow returns nothing
    local real angle = propWindow
    if(angle <= 0) then
        set angle = 1
    elseif(angle >= 360) then
        set angle = 359
    endif
    set angle = angle * bj_DEGTORAD

    call SetUnitPropWindow(whichUnit, angle)
endfunction


// 获取单位默认转向角度 (当前值)
function GetUnitPropWindowBJ takes unit whichUnit returns real
    return GetUnitPropWindow(whichUnit) * bj_RADTODEG
endfunction


// 获取单位头像视窗默认转向角度 (默认值)
function GetUnitDefaultPropWindowBJ takes unit whichUnit returns real
    return GetUnitDefaultPropWindow(whichUnit)
endfunction


// 设置单位混合时间
function SetUnitBlendTimeBJ takes unit whichUnit, real blendTime returns nothing
    call SetUnitBlendTime(whichUnit, blendTime)
endfunction


// 设置单位主采集范围
function SetUnitAcquireRangeBJ takes unit whichUnit, real acquireRange returns nothing
    call SetUnitAcquireRange(whichUnit, acquireRange)
endfunction


// 设置单位(晚上)睡觉
function UnitSetCanSleepBJ takes unit whichUnit, boolean canSleep returns nothing
    call UnitAddSleep(whichUnit, canSleep)
endfunction


// 查询单位晚上是否睡觉
function UnitCanSleepBJ takes unit whichUnit returns boolean
    return UnitCanSleep(whichUnit)
endfunction


// 唤醒单位
function UnitWakeUpBJ takes unit whichUnit returns nothing
    call UnitWakeUp(whichUnit)
endfunction


// 查询单位是否正在睡觉
function UnitIsSleepingBJ takes unit whichUnit returns boolean
    return UnitIsSleeping(whichUnit)
endfunction

// 唤醒单位（指定玩家）触发器动作
function WakePlayerUnitsEnum takes nothing returns nothing
    call UnitWakeUp(GetEnumUnit())
endfunction

// 唤醒单位（指定玩家）
function WakePlayerUnits takes player whichPlayer returns nothing
    local group g = CreateGroup()
    call GroupEnumUnitsOfPlayer(g, whichPlayer, null)
    call ForGroup(g, function WakePlayerUnitsEnum)
    call DestroyGroup(g)
endfunction


// 允许/禁止 所有野生单位夜间睡眠
function EnableCreepSleepBJ takes boolean enable returns nothing
    call SetPlayerState(Player(PLAYER_NEUTRAL_AGGRESSIVE), PLAYER_STATE_NO_CREEP_SLEEP, IntegerTertiaryOp(enable, 0, 1))

    // If we're disabling, attempt to wake any already-sleeping creeps.
    if(not enable) then
        call WakePlayerUnits(Player(PLAYER_NEUTRAL_AGGRESSIVE))
    endif
endfunction


// 允许/禁止 单位发出报警
function UnitGenerateAlarms takes unit whichUnit, boolean generate returns boolean
    return UnitIgnoreAlarm(whichUnit, not generate)
endfunction


// 查询单位是否忽略报警
function DoesUnitGenerateAlarms takes unit whichUnit returns boolean
    return not UnitIgnoreAlarmToggled(whichUnit)
endfunction


// 暂停所有单位 Pause all units 
function PauseAllUnitsBJEnum takes nothing returns nothing
    call PauseUnit(GetEnumUnit(), bj_pauseAllUnitsFlag)
endfunction


// 暂停/恢复 所有单位 Pause all units 
function PauseAllUnitsBJ takes boolean pause returns nothing
    local integer index
    local player indexPlayer
    local group g

    set bj_pauseAllUnitsFlag = pause
    set g = CreateGroup()
    set index = 0
    loop
        set indexPlayer = Player(index)

        // If this is a computer slot, pause/resume the AI.
        if(GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
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


// 暂停/恢复 指定单位
function PauseUnitBJ takes boolean pause, unit whichUnit returns nothing
    call PauseUnit(whichUnit, pause)
endfunction


// 暂停指定单位触发器动作
function IsUnitPausedBJ takes unit whichUnit returns boolean
    return IsUnitPaused(whichUnit)
endfunction


// 暂停/恢复 指定单位限时生命
function UnitPauseTimedLifeBJ takes boolean flag, unit whichUnit returns nothing
    call UnitPauseTimedLife(whichUnit, flag)
endfunction


// 设置指定单位限时生命
// @param buffId 魔法效果(buff)类型，只支持 'BTLF','BUan','Bapl','BEfn','Bhwd','BHwe','Brai'
function UnitApplyTimedLifeBJ takes real duration, integer buffId, unit whichUnit returns nothing
    call UnitApplyTimedLife(whichUnit, buffId, duration)
endfunction


// 共享指定单位视野
function UnitShareVisionBJ takes boolean share, unit whichUnit, player whichPlayer returns nothing
    call UnitShareVision(whichUnit, whichPlayer, share)
endfunction


// 删除 指定单位魔法效果（BUFF）
function UnitRemoveBuffsBJ takes integer buffType, unit whichUnit returns nothing
    if(buffType == bj_REMOVEBUFFS_POSITIVE) then
        call UnitRemoveBuffs(whichUnit, true, false)
    elseif(buffType == bj_REMOVEBUFFS_NEGATIVE) then
        call UnitRemoveBuffs(whichUnit, false, true)
    elseif(buffType == bj_REMOVEBUFFS_ALL) then
        call UnitRemoveBuffs(whichUnit, true, true)
    elseif(buffType == bj_REMOVEBUFFS_NONTLIFE) then
        call UnitRemoveBuffsEx(whichUnit, true, true, false, false, false, true, false)
    else
        // Unrecognized dispel type - ignore the request.
    endif
endfunction


// 删除指定单位拥有的 魔法效果（BUFF） (按类型)
function UnitRemoveBuffsExBJ takes integer polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returns nothing
    local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or(polarity == bj_BUFF_POLARITY_POSITIVE)
    local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or(polarity == bj_BUFF_POLARITY_NEGATIVE)
    local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or(resist == bj_BUFF_RESIST_MAGIC)
    local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or(resist == bj_BUFF_RESIST_PHYSICAL)

    call UnitRemoveBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction


// 获取指定单位拥有的 魔法效果（BUFF） 的数量
function UnitCountBuffsExBJ takes integer polarity, integer resist, unit whichUnit, boolean bTLife, boolean bAura returns integer
    local boolean bPos = (polarity == bj_BUFF_POLARITY_EITHER) or(polarity == bj_BUFF_POLARITY_POSITIVE)
    local boolean bNeg = (polarity == bj_BUFF_POLARITY_EITHER) or(polarity == bj_BUFF_POLARITY_NEGATIVE)
    local boolean bMagic = (resist == bj_BUFF_RESIST_BOTH) or(resist == bj_BUFF_RESIST_MAGIC)
    local boolean bPhys = (resist == bj_BUFF_RESIST_BOTH) or(resist == bj_BUFF_RESIST_PHYSICAL)

    return UnitCountBuffsEx(whichUnit, bPos, bNeg, bMagic, bPhys, bTLife, bAura, false)
endfunction


// 删除单位技能
function UnitRemoveAbilityBJ takes integer abilityId, unit whichUnit returns boolean
    return UnitRemoveAbility(whichUnit, abilityId)
endfunction


// 增加单位技能
function UnitAddAbilityBJ takes integer abilityId, unit whichUnit returns boolean
    return UnitAddAbility(whichUnit, abilityId)
endfunction


// 删除单位类型
function UnitRemoveTypeBJ takes unittype whichType, unit whichUnit returns boolean
    return UnitRemoveType(whichUnit, whichType)
endfunction


// 添加单位类型
function UnitAddTypeBJ takes unittype whichType, unit whichUnit returns boolean
    return UnitAddType(whichUnit, whichType)
endfunction

// 设置单位技能的永久性
function UnitMakeAbilityPermanentBJ takes boolean permanent, integer abilityId, unit whichUnit returns boolean
    return UnitMakeAbilityPermanent(whichUnit, permanent, abilityId)
endfunction


// 设置单位死亡方式
function SetUnitExplodedBJ takes unit whichUnit, boolean exploded returns nothing
    call SetUnitExploded(whichUnit, exploded)
endfunction


// 设置单位爆炸而死
function ExplodeUnitBJ takes unit whichUnit returns nothing
    call SetUnitExploded(whichUnit, true)
    call KillUnit(whichUnit)
endfunction


// 获取运输/载具单位
// 飞艇/船/被缠绕的金矿等
function GetTransportUnitBJ takes nothing returns unit
    return GetTransportUnit()
endfunction


// 获取被装载的单位
function GetLoadedUnitBJ takes nothing returns unit
    return GetLoadedUnit()
endfunction


// 查询单位当前是否被指定运输/载具单位装载
function IsUnitInTransportBJ takes unit whichUnit, unit whichTransport returns boolean
    return IsUnitInTransport(whichUnit, whichTransport)
endfunction


// 查询单位当前是否被装载
function IsUnitLoadedBJ takes unit whichUnit returns boolean
    return IsUnitLoaded(whichUnit)
endfunction


// 查询单位是否镜像
function IsUnitIllusionBJ takes unit whichUnit returns boolean
    return IsUnitIllusion(whichUnit)
endfunction


// 替换单位
// This attempts to replace a unit with a new unit type by creating a new
// unit of the desired type using the old unit's location, facing, etc.
function ReplaceUnitBJ takes unit whichUnit, integer newUnitId, integer unitStateMethod returns unit
    local unit oldUnit = whichUnit
    local unit newUnit
    local boolean wasHidden
    local integer index
    local item indexItem
    local real oldRatio

    // If we have bogus data, don't attempt the replace.
    if(oldUnit == null) then
        set bj_lastReplacedUnit = oldUnit
        return oldUnit
    endif

    // Hide the original unit.
    set wasHidden = IsUnitHidden(oldUnit)
    call ShowUnit(oldUnit, false)

    // Create the replacement unit.
    if(newUnitId == 'ugol') then
        set newUnit = CreateBlightedGoldmine(GetOwningPlayer(oldUnit), GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
    else
        set newUnit = CreateUnit(GetOwningPlayer(oldUnit), newUnitId, GetUnitX(oldUnit), GetUnitY(oldUnit), GetUnitFacing(oldUnit))
    endif

    // Set the unit's life and mana according to the requested method.
    if(unitStateMethod == bj_UNIT_STATE_METHOD_RELATIVE) then
        // Set the replacement's current/max life ratio to that of the old unit.
        // If both units have mana, do the same for mana.
        if(GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE) > 0) then
            set oldRatio = GetUnitState(oldUnit, UNIT_STATE_LIFE) / GetUnitState(oldUnit, UNIT_STATE_MAX_LIFE)
            call SetUnitState(newUnit, UNIT_STATE_LIFE, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_LIFE))
        endif

        if(GetUnitState(oldUnit, UNIT_STATE_MAX_MANA) > 0) and(GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
            set oldRatio = GetUnitState(oldUnit, UNIT_STATE_MANA) / GetUnitState(oldUnit, UNIT_STATE_MAX_MANA)
            call SetUnitState(newUnit, UNIT_STATE_MANA, oldRatio * GetUnitState(newUnit, UNIT_STATE_MAX_MANA))
        endif
    elseif(unitStateMethod == bj_UNIT_STATE_METHOD_ABSOLUTE) then
        // Set the replacement's current life to that of the old unit.
        // If the new unit has mana, do the same for mana.
        call SetUnitState(newUnit, UNIT_STATE_LIFE, GetUnitState(oldUnit, UNIT_STATE_LIFE))
        if(GetUnitState(newUnit, UNIT_STATE_MAX_MANA) > 0) then
            call SetUnitState(newUnit, UNIT_STATE_MANA, GetUnitState(oldUnit, UNIT_STATE_MANA))
        endif
    elseif(unitStateMethod == bj_UNIT_STATE_METHOD_DEFAULTS) then
        // The newly created unit should already have default life and mana.
    elseif(unitStateMethod == bj_UNIT_STATE_METHOD_MAXIMUM) then
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
    if(IsUnitType(oldUnit, UNIT_TYPE_HERO) and IsUnitType(newUnit, UNIT_TYPE_HERO)) then
        call SetHeroXP(newUnit, GetHeroXP(oldUnit), false)

        set index = 0
        loop
            set indexItem = UnitItemInSlot(oldUnit, index)
            if(indexItem != null) then
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
    return newUnit
endfunction


// 获取最后替换的单位
function GetLastReplacedUnitBJ takes nothing returns unit
    return bj_lastReplacedUnit
endfunction


// 移动单位并改变面对角度 (立即)
function SetUnitPositionLocFacingBJ takes unit whichUnit, location loc, real facing returns nothing
    call SetUnitPositionLoc(whichUnit, loc)
    call SetUnitFacing(whichUnit, facing)
endfunction


// 移动单位并改变面对点 (立即)
function SetUnitPositionLocFacingLocBJ takes unit whichUnit, location loc, location lookAt returns nothing
    call SetUnitPositionLoc(whichUnit, loc)
    call SetUnitFacing(whichUnit, AngleBetweenPoints(loc, lookAt))
endfunction


// 增加 商店出售的 物品类型 (指定商店)
function AddItemToStockBJ takes integer itemId, unit whichUnit, integer currentStock, integer stockMax returns nothing
    call AddItemToStock(whichUnit, itemId, currentStock, stockMax)
endfunction


// 增加 商店出售的 单位类型 (指定商店)
function AddUnitToStockBJ takes integer unitId, unit whichUnit, integer currentStock, integer stockMax returns nothing
    call AddUnitToStock(whichUnit, unitId, currentStock, stockMax)
endfunction


// 删除 商店出售的 物品类型 (指定商店)
function RemoveItemFromStockBJ takes integer itemId, unit whichUnit returns nothing
    call RemoveItemFromStock(whichUnit, itemId)
endfunction


// 删除 商店出售的 单位类型 (指定商店)
function RemoveUnitFromStockBJ takes integer unitId, unit whichUnit returns nothing
    call RemoveUnitFromStock(whichUnit, unitId)
endfunction


// 允许/禁止 单位占用人口
function SetUnitUseFoodBJ takes boolean enable, unit whichUnit returns nothing
    call SetUnitUseFood(whichUnit, enable)
endfunction


// 伤害圆形范围（指定单位）
function UnitDamagePointLoc takes unit whichUnit, real delay, real radius, location loc, real amount, attacktype whichAttack, damagetype whichDamage returns boolean
    return UnitDamagePoint(whichUnit, delay, radius, GetLocationX(loc), GetLocationY(loc), amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction


// 伤害单位/物品/可破坏物（指定单位）
function UnitDamageTargetBJ takes unit whichUnit, unit target, real amount, attacktype whichAttack, damagetype whichDamage returns boolean
    return UnitDamageTarget(whichUnit, target, amount, true, false, whichAttack, whichDamage, WEAPON_TYPE_WHOKNOWS)
endfunction



//***************************************************************************
//*
//*  Destructable Utility Functions
//*
//***************************************************************************


// 创建可破坏物
function CreateDestructableLoc takes integer objectid, location loc, real facing, real scale, integer variation returns destructable
    set bj_lastCreatedDestructable = CreateDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
    return bj_lastCreatedDestructable
endfunction


// 创建可破坏物(毁坏的)
function CreateDeadDestructableLocBJ takes integer objectid, location loc, real facing, real scale, integer variation returns destructable
    set bj_lastCreatedDestructable = CreateDeadDestructable(objectid, GetLocationX(loc), GetLocationY(loc), facing, scale, variation)
    return bj_lastCreatedDestructable
endfunction


// 获取最后创建的可破坏物
function GetLastCreatedDestructable takes nothing returns destructable
    return bj_lastCreatedDestructable
endfunction


// 显示/隐藏 可破坏物
function ShowDestructableBJ takes boolean flag, destructable d returns nothing
    call ShowDestructable(d, flag)
endfunction


// 设置 可破坏物无敌/可攻击
function SetDestructableInvulnerableBJ takes destructable d, boolean flag returns nothing
    call SetDestructableInvulnerable(d, flag)
endfunction


// 查询可破坏物是否无敌
function IsDestructableInvulnerableBJ takes destructable d returns boolean
    return IsDestructableInvulnerable(d)
endfunction


// 获取可破坏物的位置
// 会创建点，用完请注意排泄
function GetDestructableLoc takes destructable whichDestructable returns location
    return Location(GetDestructableX(whichDestructable), GetDestructableY(whichDestructable))
endfunction


// 选取指定矩形区域所有可破坏物做动作(单个动作)
function EnumDestructablesInRectAll takes rect r, code actionFunc returns nothing
    call EnumDestructablesInRect(r, null, actionFunc)
endfunction


// 选取指定圆形范围所有可破坏物做动作(单个动作)
function EnumDestructablesInCircleBJFilter takes nothing returns boolean
    local location destLoc = GetDestructableLoc(GetFilterDestructable())
    local boolean result

    set result = DistanceBetweenPoints(destLoc, bj_enumDestructableCenter) <= bj_enumDestructableRadius
    call RemoveLocation(destLoc)
    return result
endfunction


// 查询可破坏物是否死亡
function IsDestructableDeadBJ takes destructable d returns boolean
    return GetDestructableLife(d) <= 0
endfunction


// 查询可破坏物是否存活
function IsDestructableAliveBJ takes destructable d returns boolean
    return not IsDestructableDeadBJ(d)
endfunction


// 随机选取矩形区域的可破坏物触发器
// See GroupPickRandomUnitEnum for the details of this algorithm.
function RandomDestructableInRectBJEnum takes nothing returns nothing
    set bj_destRandomConsidered = bj_destRandomConsidered + 1
    if(GetRandomInt(1, bj_destRandomConsidered) == 1) then
        set bj_destRandomCurrentPick = GetEnumDestructable()
    endif
endfunction


// 随机选取矩形区域满足条件表达式的可破坏物
// Picks a random destructable from within a rect, matching a condition
function RandomDestructableInRectBJ takes rect r, boolexpr filter returns destructable
    set bj_destRandomConsidered = 0
    set bj_destRandomCurrentPick = null
    call EnumDestructablesInRect(r, filter, function RandomDestructableInRectBJEnum)
    call DestroyBoolExpr(filter)
    return bj_destRandomCurrentPick
endfunction


// 随机选取矩形区域的可破坏物
// Picks a random destructable from within a rect
function RandomDestructableInRectSimpleBJ takes rect r returns destructable
    return RandomDestructableInRectBJ(r, null)
endfunction


// 随机选取圆形范围满足条件表达式的可破坏物
// Enumerates within a rect, with a filter to narrow the enumeration down
// objects within a circular area.
function EnumDestructablesInCircleBJ takes real radius, location loc, code actionFunc returns nothing
    local rect r

    if(radius >= 0) then
        set bj_enumDestructableCenter = loc
        set bj_enumDestructableRadius = radius
        set r = GetRectFromCircleBJ(loc, radius)
        call EnumDestructablesInRect(r, filterEnumDestructablesInCircleBJ, actionFunc)
        call RemoveRect(r)
    endif
endfunction


// 设置 可破坏物 生命值 (百分比)
function SetDestructableLifePercentBJ takes destructable d, real percent returns nothing
    call SetDestructableLife(d, GetDestructableMaxLife(d) * percent * 0.01)
endfunction


// 设置 可破坏物 最大生命值
function SetDestructableMaxLifeBJ takes destructable d, real max returns nothing
    call SetDestructableMaxLife(d, max)
endfunction


// 打开/关闭/破坏 门
function ModifyGateBJ takes integer gateOperation, destructable d returns nothing
    if(gateOperation == bj_GATEOPERATION_CLOSE) then
        if(GetDestructableLife(d) <= 0) then
            call DestructableRestoreLife(d, GetDestructableMaxLife(d), true)
        endif
        call SetDestructableAnimation(d, "stand")
    elseif(gateOperation == bj_GATEOPERATION_OPEN) then
        if(GetDestructableLife(d) > 0) then
            call KillDestructable(d)
        endif
        call SetDestructableAnimation(d, "death alternate")
    elseif(gateOperation == bj_GATEOPERATION_DESTROY) then
        if(GetDestructableLife(d) > 0) then
            call KillDestructable(d)
        endif
        call SetDestructableAnimation(d, "death")
    else
        // Unrecognized gate state - ignore the request.
    endif
endfunction


// 获取升降台高度
// Determine the elevator's height from its occlusion height.
function GetElevatorHeight takes destructable d returns integer
    local integer height

    set height = 1 + R2I(GetDestructableOccluderHeight(d) / bj_CLIFFHEIGHT)
    if(height < 1) or(height > 3) then
        set height = 1
    endif
    return height
endfunction


// 设置升降台高度
// To properly animate an elevator, we must know not only what height we
// want to change to, but also what height we are currently at.  This code
// determines the elevator's current height from its occlusion height.
// Arbitrarily changing an elevator's occlusion height is thus inadvisable.
function ChangeElevatorHeight takes destructable d, integer newHeight returns nothing
    local integer oldHeight

    // Cap the new height within the supported range.
    set newHeight = IMaxBJ(1, newHeight)
    set newHeight = IMinBJ(3, newHeight)

    // Find out what height the elevator is already at.
    set oldHeight = GetElevatorHeight(d)

    // Set the elevator's occlusion height.
    call SetDestructableOccluderHeight(d, bj_CLIFFHEIGHT * (newHeight - 1))

    if(newHeight == 1) then
        if(oldHeight == 2) then
            call SetDestructableAnimation(d, "birth")
            call QueueDestructableAnimation(d, "stand")
        elseif(oldHeight == 3) then
            call SetDestructableAnimation(d, "birth third")
            call QueueDestructableAnimation(d, "stand")
        else
            // Unrecognized old height - snap to new height.
            call SetDestructableAnimation(d, "stand")
        endif
    elseif(newHeight == 2) then
        if(oldHeight == 1) then
            call SetDestructableAnimation(d, "death")
            call QueueDestructableAnimation(d, "stand second")
        elseif(oldHeight == 3) then
            call SetDestructableAnimation(d, "birth second")
            call QueueDestructableAnimation(d, "stand second")
        else
            // Unrecognized old height - snap to new height.
            call SetDestructableAnimation(d, "stand second")
        endif
    elseif(newHeight == 3) then
        if(oldHeight == 1) then
            call SetDestructableAnimation(d, "death third")
            call QueueDestructableAnimation(d, "stand third")
        elseif(oldHeight == 2) then
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


// 移动选取单位
// Grab the unit and throw his own coords in his face, forcing him to push
// and shove until he finds a spot where noone will bother him.
function NudgeUnitsInRectEnum takes nothing returns nothing
    local unit nudgee = GetEnumUnit()

    call SetUnitPosition(nudgee, GetUnitX(nudgee), GetUnitY(nudgee))
endfunction

// 移动选取物品
function NudgeItemsInRectEnum takes nothing returns nothing
    local item nudgee = GetEnumItem()

    call SetItemPosition(nudgee, GetItemX(nudgee), GetItemY(nudgee))
endfunction


// 移动单位和物品到指定矩形区域
// Nudge the items and units within a given rect ever so gently, so as to
// encourage them to find locations where they can peacefully coexist with
// pathing restrictions and live happy, fruitful lives.
function NudgeObjectsInRect takes rect nudgeArea returns nothing
    local group g

    set g = CreateGroup()
    call GroupEnumUnitsInRect(g, nudgeArea, null)
    call ForGroup(g, function NudgeUnitsInRectEnum)
    call DestroyGroup(g)

    call EnumItemsInRect(nudgeArea, null, function NudgeItemsInRectEnum)
endfunction

// 获取附近的升降台
function NearbyElevatorExistsEnum takes nothing returns nothing
    local destructable d = GetEnumDestructable()
    local integer dType = GetDestructableTypeId(d)

    if(dType == bj_ELEVATOR_CODE01) or(dType == bj_ELEVATOR_CODE02) then
        set bj_elevatorNeighbor = d
    endif
endfunction

// 判断附近是否存在升降台
function NearbyElevatorExists takes real x, real y returns boolean
    local real findThreshold = 32
    local rect r

    // If another elevator is overlapping this one, ignore the wall.
    set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
    set bj_elevatorNeighbor = null
    call EnumDestructablesInRect(r, null, function NearbyElevatorExistsEnum)
    call RemoveRect(r)

    return bj_elevatorNeighbor != null
endfunction

// 获取升降台墙
function FindElevatorWallBlockerEnum takes nothing returns nothing
    set bj_elevatorWallBlocker = GetEnumDestructable()
endfunction


// 设置升降台墙
// This toggles pathing on or off for one wall of an elevator by killing
// or reviving a pathing blocker at the appropriate location (and creating
// the pathing blocker in the first place, if it does not yet exist).
function ChangeElevatorWallBlocker takes real x, real y, real facing, boolean open returns nothing
    local destructable blocker = null
    local real findThreshold = 32
    local real nudgeLength = 4.25 * bj_CELLWIDTH
    local real nudgeWidth = 1.25 * bj_CELLWIDTH
    local rect r

    // Search for the pathing blocker within the general area.
    set r = Rect(x - findThreshold, y - findThreshold, x + findThreshold, y + findThreshold)
    set bj_elevatorWallBlocker = null
    call EnumDestructablesInRect(r, null, function FindElevatorWallBlockerEnum)
    call RemoveRect(r)
    set blocker = bj_elevatorWallBlocker

    // Ensure that the blocker exists.
    if(blocker == null) then
        set blocker = CreateDeadDestructable(bj_ELEVATOR_BLOCKER_CODE, x, y, facing, 1, 0)
    elseif(GetDestructableTypeId(blocker) != bj_ELEVATOR_BLOCKER_CODE) then
        // If a different destructible exists in the blocker's spot, ignore
        // the request.  (Two destructibles cannot occupy the same location
        // on the map, so we cannot create an elevator blocker here.)
        return
    endif

    if(open) then
        // Ensure that the blocker is dead.
        if(GetDestructableLife(blocker) > 0) then
            call KillDestructable(blocker)
        endif
    else
        // Ensure that the blocker is alive.
        if(GetDestructableLife(blocker) <= 0) then
            call DestructableRestoreLife(blocker, GetDestructableMaxLife(blocker), false)
        endif

        // Nudge any objects standing in the blocker's way.
        if(facing == 0) then
            set r = Rect(x - nudgeWidth / 2, y - nudgeLength / 2, x + nudgeWidth / 2, y + nudgeLength / 2)
            call NudgeObjectsInRect(r)
            call RemoveRect(r)
        elseif(facing == 90) then
            set r = Rect(x - nudgeLength / 2, y - nudgeWidth / 2, x + nudgeLength / 2, y + nudgeWidth / 2)
            call NudgeObjectsInRect(r)
            call RemoveRect(r)
        else
            // Unrecognized blocker angle - don't nudge anything.
        endif
    endif
endfunction


// 打开/关闭 升降台
function ChangeElevatorWalls takes boolean open, integer walls, destructable d returns nothing
    local real x = GetDestructableX(d)
    local real y = GetDestructableY(d)
    local real distToBlocker = 192
    local real distToNeighbor = 256

    if(walls == bj_ELEVATOR_WALL_TYPE_ALL) or(walls == bj_ELEVATOR_WALL_TYPE_EAST) then
        if(not NearbyElevatorExists(x + distToNeighbor, y)) then
            call ChangeElevatorWallBlocker(x + distToBlocker, y, 0, open)
        endif
    endif

    if(walls == bj_ELEVATOR_WALL_TYPE_ALL) or(walls == bj_ELEVATOR_WALL_TYPE_NORTH) then
        if(not NearbyElevatorExists(x, y + distToNeighbor)) then
            call ChangeElevatorWallBlocker(x, y + distToBlocker, 90, open)
        endif
    endif

    if(walls == bj_ELEVATOR_WALL_TYPE_ALL) or(walls == bj_ELEVATOR_WALL_TYPE_SOUTH) then
        if(not NearbyElevatorExists(x, y - distToNeighbor)) then
            call ChangeElevatorWallBlocker(x, y - distToBlocker, 90, open)
        endif
    endif

    if(walls == bj_ELEVATOR_WALL_TYPE_ALL) or(walls == bj_ELEVATOR_WALL_TYPE_WEST) then
        if(not NearbyElevatorExists(x - distToNeighbor, y)) then
            call ChangeElevatorWallBlocker(x - distToBlocker, y, 0, open)
        endif
    endif
endfunction



//***************************************************************************
//*
//*  Neutral Building Utility Functions
//*
//***************************************************************************


// 激活/关闭 传送门
function WaygateActivateBJ takes boolean activate, unit waygate returns nothing
    call WaygateActivate(waygate, activate)
endfunction


// 获取传送门激活状态
function WaygateIsActiveBJ takes unit waygate returns boolean
    return WaygateIsActive(waygate)
endfunction


// 设置传送门目的地
function WaygateSetDestinationLocBJ takes unit waygate, location loc returns nothing
    call WaygateSetDestination(waygate, GetLocationX(loc), GetLocationY(loc))
endfunction


// 获取传送门的目的地
// 会创建点，用完请注意排泄
function WaygateGetDestinationLocBJ takes unit waygate returns location
    return Location(WaygateGetDestinationX(waygate), WaygateGetDestinationY(waygate))
endfunction


// 启用/禁用 小地图特殊图标（指定单位）
function UnitSetUsesAltIconBJ takes boolean flag, unit whichUnit returns nothing
    call UnitSetUsesAltIcon(whichUnit, flag)
endfunction



//***************************************************************************
//*
//*  UI Utility Functions
//*
//***************************************************************************


// 按下 UI 键
function ForceUIKeyBJ takes player whichPlayer, string key returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ForceUIKey(key)
    endif
endfunction


// 取消 UI 键
function ForceUICancelBJ takes player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ForceUICancel()
    endif
endfunction



//***************************************************************************
//*
//*  Group and Force Utility Functions
//*
//***************************************************************************

// 选取单位组做指定动作
// 最多12个单位响应
function ForGroupBJ takes group whichGroup, code callback returns nothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    call ForGroup(whichGroup, callback)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(whichGroup)
    endif
endfunction


// 将指定单位添加到单位组
function GroupAddUnitSimple takes unit whichUnit, group whichGroup returns nothing
    call GroupAddUnit(whichGroup, whichUnit)
endfunction


// 将指定单位移出单位组
function GroupRemoveUnitSimple takes unit whichUnit, group whichGroup returns nothing
    call GroupRemoveUnit(whichGroup, whichUnit)
endfunction


// 增加选取单位到单位组触发器动作
function GroupAddGroupEnum takes nothing returns nothing
    call GroupAddUnit(bj_groupAddGroupDest, GetEnumUnit())
endfunction

// 将 sourceGroup单位组 的单位添加到 destGroup单位组
function GroupAddGroup takes group sourceGroup, group destGroup returns nothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupAddGroupDest = destGroup
    call ForGroup(sourceGroup, function GroupAddGroupEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(sourceGroup)
    endif
endfunction


// 将指定单位移出单位组触发器动作
function GroupRemoveGroupEnum takes nothing returns nothing
    call GroupRemoveUnit(bj_groupRemoveGroupDest, GetEnumUnit())
endfunction

// 将 sourceGroup单位组 的单位移出 destGroup单位组
function GroupRemoveGroup takes group sourceGroup, group destGroup returns nothing
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupRemoveGroupDest = destGroup
    call ForGroup(sourceGroup, function GroupRemoveGroupEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(sourceGroup)
    endif
endfunction


// 添加玩家到玩家组
function ForceAddPlayerSimple takes player whichPlayer, force whichForce returns nothing
    call ForceAddPlayer(whichForce, whichPlayer)
endfunction


// 将玩家移出玩家组
function ForceRemovePlayerSimple takes player whichPlayer, force whichForce returns nothing
    call ForceRemovePlayer(whichForce, whichPlayer)
endfunction


// 随机选取单位组中的单位触发器动作
// Consider each unit, one at a time, keeping a "current pick".   Once all units
// are considered, this "current pick" will be the resulting random unit.
// The chance of picking a given unit over the "current pick" is 1/N, where N is
// the number of units considered thusfar (including the current consideration).
function GroupPickRandomUnitEnum takes nothing returns nothing
    set bj_groupRandomConsidered = bj_groupRandomConsidered + 1
    if(GetRandomInt(1, bj_groupRandomConsidered) == 1) then
        set bj_groupRandomCurrentPick = GetEnumUnit()
    endif
endfunction


// Picks a random unit from a group.

// 随机选取单位组中的单位
function GroupPickRandomUnit takes group whichGroup returns unit
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupRandomConsidered = 0
    set bj_groupRandomCurrentPick = null
    call ForGroup(whichGroup, function GroupPickRandomUnitEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(whichGroup)
    endif
    return bj_groupRandomCurrentPick
endfunction


// 随机选择玩家组中的玩家触发器动作
// See GroupPickRandomUnitEnum for the details of this algorithm.
function ForcePickRandomPlayerEnum takes nothing returns nothing
    set bj_forceRandomConsidered = bj_forceRandomConsidered + 1
    if(GetRandomInt(1, bj_forceRandomConsidered) == 1) then
        set bj_forceRandomCurrentPick = GetEnumPlayer()
    endif
endfunction


// Picks a random player from a force.

// 随机选择玩家组中的玩家（指定玩家组）
function ForcePickRandomPlayer takes force whichForce returns player
    set bj_forceRandomConsidered = 0
    set bj_forceRandomCurrentPick = null
    call ForForce(whichForce, function ForcePickRandomPlayerEnum)
    return bj_forceRandomCurrentPick
endfunction

// 选取矩形区域内所有单位触发器动作
function EnumUnitsSelected takes player whichPlayer, boolexpr enumFilter, code enumAction returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, whichPlayer, enumFilter)
    call DestroyBoolExpr(enumFilter)
    call ForGroup(g, enumAction)
    call DestroyGroup(g)
endfunction


// 选取矩形区域内所有单位（可指定条件表达式）
// 会创建单位组，用完请注意排泄
function GetUnitsInRectMatching takes rect r, boolexpr filter returns group
    local group g = CreateGroup()
    call GroupEnumUnitsInRect(g, r, filter)
    call DestroyBoolExpr(filter)
    return g
endfunction


// 选取矩形区域内所有单位
// 会创建单位组，用完请注意排泄
function GetUnitsInRectAll takes rect r returns group
    return GetUnitsInRectMatching(r, null)
endfunction


// 选取玩家在指定矩形区域内单位触发器动作
function GetUnitsInRectOfPlayerFilter takes nothing returns boolean
    return GetOwningPlayer(GetFilterUnit()) == bj_groupEnumOwningPlayer
endfunction

// 选取玩家在指定矩形区域内单位
// 会创建单位组，用完请注意排泄
function GetUnitsInRectOfPlayer takes rect r, player whichPlayer returns group
    local group g = CreateGroup()
    set bj_groupEnumOwningPlayer = whichPlayer
    call GroupEnumUnitsInRect(g, r, filterGetUnitsInRectOfPlayer)
    return g
endfunction


// 选取玩家在指定圆形范围内单位
// 会创建单位组，用完请注意排泄
function GetUnitsInRangeOfLocMatching takes real radius, location whichLocation, boolexpr filter returns group
    local group g = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(g, whichLocation, radius, filter)
    call DestroyBoolExpr(filter)
    return g
endfunction


// 选取圆形范围内所有单位（指定圆心及半径）
// 会创建单位组，用完请注意排泄
function GetUnitsInRangeOfLocAll takes real radius, location whichLocation returns group
    return GetUnitsInRangeOfLocMatching(radius, whichLocation, null)
endfunction


// 获取指定单位类型触发器动作
function GetUnitsOfTypeIdAllFilter takes nothing returns boolean
    return GetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction


// 获取指定单位类型，并以单位组形式返回
// 会创建单位组，用完请注意排泄
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


// 选取玩家拥有的单位（可指定条件表达式），并以单位组形式返回
// 会创建单位组，用完请注意排泄
function GetUnitsOfPlayerMatching takes player whichPlayer, boolexpr filter returns group
    local group g = CreateGroup()
    call GroupEnumUnitsOfPlayer(g, whichPlayer, filter)
    call DestroyBoolExpr(filter)
    return g
endfunction


// 选取玩家拥有的单位
// 会创建单位组，用完请注意排泄
function GetUnitsOfPlayerAll takes player whichPlayer returns group
    return GetUnitsOfPlayerMatching(whichPlayer, null)
endfunction


// 选取玩家的指定单位类型，以单位组形式返回触发器动作
function GetUnitsOfPlayerAndTypeIdFilter takes nothing returns boolean
    return GetUnitTypeId(GetFilterUnit()) == bj_groupEnumTypeId
endfunction

// 选取玩家的指定单位类型，以单位组形式返回
// 会创建单位组，用完请注意排泄
function GetUnitsOfPlayerAndTypeId takes player whichPlayer, integer unitid returns group
    local group g = CreateGroup()
    set bj_groupEnumTypeId = unitid
    call GroupEnumUnitsOfPlayer(g, whichPlayer, filterGetUnitsOfPlayerAndTypeId)
    return g
endfunction


// 获取玩家选择的单位
// 会创建单位组，用完请注意排泄
function GetUnitsSelectedAll takes player whichPlayer returns group
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, whichPlayer, null)
    return g
endfunction


// 获取以指定玩家新建的玩家组
// 将指定玩家加入新创建的专属玩家组，以玩家组形式返回
function GetForceOfPlayer takes player whichPlayer returns force
    local force f = CreateForce()
    call ForceAddPlayer(f, whichPlayer)
    return f
endfunction


// 获取所有玩家
// 以玩家组形式返回
function GetPlayersAll takes nothing returns force
    return bj_FORCE_ALL_PLAYERS
endfunction


// 获取所有指定控制类型的玩家
// 以玩家组形式返回
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


// 获取指定玩家的盟友
// 以玩家组形式返回
function GetPlayersAllies takes player whichPlayer returns force
    local force f = CreateForce()
    call ForceEnumAllies(f, whichPlayer, null)
    return f
endfunction


// 获取指定玩家的敌人
// 以玩家组形式返回
function GetPlayersEnemies takes player whichPlayer returns force
    local force f = CreateForce()
    call ForceEnumEnemies(f, whichPlayer, null)
    return f
endfunction


// 获取选取玩家匹配的玩家组（可指定条件表达式）
function GetPlayersMatching takes boolexpr filter returns force
    local force f = CreateForce()
    call ForceEnumPlayers(f, filter)
    call DestroyBoolExpr(filter)
    return f
endfunction


// 单位组的单位数量加一
function CountUnitsInGroupEnum takes nothing returns nothing
    set bj_groupCountUnits = bj_groupCountUnits + 1
endfunction

// 统计单位组的单位数量
function CountUnitsInGroup takes group g returns integer
    // If the user wants the group destroyed, remember that fact and clear
    // the flag, in case it is used again in the callback.
    local boolean wantDestroy = bj_wantDestroyGroup
    set bj_wantDestroyGroup = false

    set bj_groupCountUnits = 0
    call ForGroup(g, function CountUnitsInGroupEnum)

    // If the user wants the group destroyed, do so now.
    if(wantDestroy) then
        call DestroyGroup(g)
    endif
    return bj_groupCountUnits
endfunction

// 玩家组中的玩家数量加一
function CountPlayersInForceEnum takes nothing returns nothing
    set bj_forceCountPlayers = bj_forceCountPlayers + 1
endfunction


// 获取玩家组中的玩家数量
function CountPlayersInForceBJ takes force f returns integer
    set bj_forceCountPlayers = 0
    call ForForce(f, function CountPlayersInForceEnum)
    return bj_forceCountPlayers
endfunction


// 在单位组中随机选取 N 个单位
function GetRandomSubGroupEnum takes nothing returns nothing
    if(bj_randomSubGroupWant > 0) then
        if(bj_randomSubGroupWant >= bj_randomSubGroupTotal) or(GetRandomReal(0, 1) < bj_randomSubGroupChance) then
            // We either need every remaining unit, or the unit passed its chance check.
            call GroupAddUnit(bj_randomSubGroupGroup, GetEnumUnit())
            set bj_randomSubGroupWant = bj_randomSubGroupWant - 1
        endif
    endif
    set bj_randomSubGroupTotal = bj_randomSubGroupTotal - 1
endfunction

// 获取单位组的随机单位（指定数量），并添加在新单位组中，返回新单位组
// @param 指定获取的单位数量
// 会创建单位组，用完请注意排泄
// GetRandomSubGroup(2, [unit(8),unit(4),unit(2)]) -> [unit(4),unit(2)]
function GetRandomSubGroup takes integer count, group sourceGroup returns group
    local group g = CreateGroup()

    set bj_randomSubGroupGroup = g
    set bj_randomSubGroupWant = count
    set bj_randomSubGroupTotal = CountUnitsInGroup(sourceGroup)

    if(bj_randomSubGroupWant <= 0 or bj_randomSubGroupTotal <= 0) then
        return g
    endif

    set bj_randomSubGroupChance = I2R(bj_randomSubGroupWant) / I2R(bj_randomSubGroupTotal)
    call ForGroup(sourceGroup, function GetRandomSubGroupEnum)
    return g
endfunction

// 判断匹配的单位类型是否存活
function LivingPlayerUnitsOfTypeIdFilter takes nothing returns boolean
    local unit filterUnit = GetFilterUnit()
    return IsUnitAliveBJ(filterUnit) and GetUnitTypeId(filterUnit) == bj_livingPlayerUnitsTypeId
endfunction


// 查询玩家存活的指定单位类型的数量
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



//***************************************************************************
//*
//*  Animation Utility Functions
//*
//***************************************************************************


// 重置指定单位动画为站立 － "stand"
function ResetUnitAnimation takes unit whichUnit returns nothing
    call SetUnitAnimation(whichUnit, "stand")
endfunction


// 设置指定单位动画速度
function SetUnitTimeScalePercent takes unit whichUnit, real percentScale returns nothing
    call SetUnitTimeScale(whichUnit, percentScale * 0.01)
endfunction


// 设置指定单位尺寸
function SetUnitScalePercent takes unit whichUnit, real percentScaleX, real percentScaleY, real percentScaleZ returns nothing
    call SetUnitScale(whichUnit, percentScaleX * 0.01, percentScaleY * 0.01, percentScaleZ * 0.01)
endfunction

// 设置指定单位颜色
// This version differs from the common.j interface in that the alpha value
// is reversed so as to be displayed as transparency, and all four parameters
// are treated as percentages rather than bytes.
function SetUnitVertexColorBJ takes unit whichUnit, real red, real green, real blue, real transparency returns nothing
    call SetUnitVertexColor(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 添加指示器（指定单位）
function UnitAddIndicatorBJ takes unit whichUnit, real red, real green, real blue, real transparency returns nothing
    call AddIndicator(whichUnit, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 添加指示器（指定可破坏物）
function DestructableAddIndicatorBJ takes destructable whichDestructable, real red, real green, real blue, real transparency returns nothing
    call AddIndicator(whichDestructable, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 添加指示器（指定物品）
function ItemAddIndicatorBJ takes item whichItem, real red, real green, real blue, real transparency returns nothing
    call AddIndicator(whichItem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置指定单位面对点
// Sets a unit's facing to point directly at a location.
function SetUnitFacingToFaceLocTimed takes unit whichUnit, location target, real duration returns nothing
    local location unitLoc = GetUnitLoc(whichUnit)

    call SetUnitFacingTimed(whichUnit, AngleBetweenPoints(unitLoc, target), duration)
    call RemoveLocation(unitLoc)
endfunction


// 设置指定单位面对另一指定单位
// Sets a unit's facing to point directly at another unit.
function SetUnitFacingToFaceUnitTimed takes unit whichUnit, unit target, real duration returns nothing
    local location unitLoc = GetUnitLoc(target)

    call SetUnitFacingToFaceLocTimed(whichUnit, unitLoc, duration)
    call RemoveLocation(unitLoc)
endfunction


// 队列指定单位动画
function QueueUnitAnimationBJ takes unit whichUnit, string whichAnimation returns nothing
    call QueueUnitAnimation(whichUnit, whichAnimation)
endfunction


// 设置可破坏物动画
function SetDestructableAnimationBJ takes destructable d, string whichAnimation returns nothing
    call SetDestructableAnimation(d, whichAnimation)
endfunction


// 队列可破坏物动画
function QueueDestructableAnimationBJ takes destructable d, string whichAnimation returns nothing
    call QueueDestructableAnimation(d, whichAnimation)
endfunction


// 设置可破坏物动画速度
function SetDestAnimationSpeedPercent takes destructable d, real percentScale returns nothing
    call SetDestructableAnimationSpeed(d, percentScale * 0.01)
endfunction



//***************************************************************************
//*
//*  Dialog Utility Functions
//*
//***************************************************************************


// 显示/隐藏 对话框（指定玩家）
function DialogDisplayBJ takes boolean flag, dialog whichDialog, player whichPlayer returns nothing
    call DialogDisplay(whichPlayer, whichDialog, flag)
endfunction


// 设置对话框标题
function DialogSetMessageBJ takes dialog whichDialog, string message returns nothing
    call DialogSetMessage(whichDialog, message)
endfunction


// 添加对话框按钮
// 即使按钮内容是用全局变量写入，按钮内容也不会随变量变化，添加时已经写死，除非清空重新添加按钮
function DialogAddButtonBJ takes dialog whichDialog, string buttonText returns button
    set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText, 0)
    return bj_lastCreatedButton
endfunction

// 添加对话框按钮(指定快捷键) [R]
// 即使按钮内容是用全局变量写入，按钮内容也不会随变量变化，添加时已经写死，除非清空重新添加按钮
function DialogAddButtonWithHotkeyBJ takes dialog whichDialog, string buttonText, integer hotkey returns button
    set bj_lastCreatedButton = DialogAddButton(whichDialog, buttonText, hotkey)
    return bj_lastCreatedButton
endfunction


// 清空对话框（标题和按钮）
function DialogClearBJ takes dialog whichDialog returns nothing
    call DialogClear(whichDialog)
endfunction


// 获取最后创建的对话按钮
function GetLastCreatedButtonBJ takes nothing returns button
    return bj_lastCreatedButton
endfunction


// 获取被点击对话框按钮
function GetClickedButtonBJ takes nothing returns button
    return GetClickedButton()
endfunction


// 获取被点击的对话框
function GetClickedDialogBJ takes nothing returns dialog
    return GetClickedDialog()
endfunction



//***************************************************************************
//*
//*  Alliance Utility Functions
//*
//***************************************************************************


// 设置联盟详细状态
function SetPlayerAllianceBJ takes player sourcePlayer, alliancetype whichAllianceSetting, boolean value, player otherPlayer returns nothing
    // Prevent players from attempting to ally with themselves.
    if(sourcePlayer == otherPlayer) then
        return
    endif

    call SetPlayerAlliance(sourcePlayer, otherPlayer, whichAllianceSetting, value)
endfunction


// 设置两位指定的玩家是否联盟
// 同时设置被动联盟（互不侵略）、帮助请求、响应帮助请求、共享经验值、盟友魔法锁定
// Set all flags used by the in-game "Ally" checkbox.
function SetPlayerAllianceStateAllyBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_PASSIVE, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_REQUEST, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_HELP_RESPONSE, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_XP, flag)
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_SPELLS, flag)
endfunction


// 设置两位指定的玩家是否共享视野
// Set all flags used by the in-game "Shared Vision" checkbox.
function SetPlayerAllianceStateVisionBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_VISION, flag)
endfunction


// 设置两位指定的玩家是否共享单位控制（非完全共享单位控制）
// Set all flags used by the in-game "Shared Units" checkbox.
function SetPlayerAllianceStateControlBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_CONTROL, flag)
endfunction


// 设置两位指定的玩家是否完全共享单位控制
// Set all flags used by the in-game "Shared Units" checkbox with the Full
// Shared Unit Control feature enabled.
function SetPlayerAllianceStateFullControlBJ takes player sourcePlayer, player otherPlayer, boolean flag returns nothing
    call SetPlayerAlliance(sourcePlayer, otherPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, flag)
endfunction


// 设置两位指定玩家的联盟状态
function SetPlayerAllianceStateBJ takes player sourcePlayer, player otherPlayer, integer allianceState returns nothing
    // Prevent players from attempting to ally with themselves.
    if(sourcePlayer == otherPlayer) then
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


// 设置玩家组联盟状态
// Set the alliance states for an entire force towards another force.
function SetForceAllianceStateBJ takes force sourceForce, force targetForce, integer allianceState returns nothing
    local integer sourceIndex
    local integer targetIndex

    set sourceIndex = 0
    loop

        if(sourceForce == bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(sourceIndex), sourceForce)) then
            set targetIndex = 0
            loop
                if(targetForce == bj_FORCE_ALL_PLAYERS or IsPlayerInForce(Player(targetIndex), targetForce)) then
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


// 查询玩家组是否相互联盟（被动联盟，互不侵犯）
// Test to see if two players are co-allied (allied with each other).
function PlayersAreCoAllied takes player playerA, player playerB returns boolean
    // Players are considered to be allied with themselves.
    if(playerA == playerB) then
        return true
    endif

    // Co-allies are both allied with each other.
    if GetPlayerAlliance(playerA, playerB, ALLIANCE_PASSIVE) then
        if GetPlayerAlliance(playerB, playerA, ALLIANCE_PASSIVE) then
            return true
        endif
    endif
    return false
endfunction

// 设置AI玩家向AI盟友共享视野与单位控制权
// Force (whichPlayer) AI player to share vision and advanced unit control 
// with all AI players of its allies.
function ShareEverythingWithTeamAI takes player whichPlayer returns nothing
    local integer playerIndex
    local player indexPlayer

    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if(PlayersAreCoAllied(whichPlayer, indexPlayer) and whichPlayer != indexPlayer) then
            if(GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
                call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_VISION, true)
                call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_CONTROL, true)
                call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
            endif
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop
endfunction


// 设置指定玩家向盟友共享视野与单位控制权
// 会同时共享视野、共享单位控制、完全共享单位控制
// Force (whichPlayer) to share vision and advanced unit control with all of his/her allies.
function ShareEverythingWithTeam takes player whichPlayer returns nothing
    local integer playerIndex
    local player indexPlayer

    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if(PlayersAreCoAllied(whichPlayer, indexPlayer) and whichPlayer != indexPlayer) then
            call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_VISION, true)
            call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_CONTROL, true)
            call SetPlayerAlliance(indexPlayer, whichPlayer, ALLIANCE_SHARED_CONTROL, true)
            call SetPlayerAlliance(whichPlayer, indexPlayer, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop
endfunction


// 设置中立被动玩家联盟状态
// 设置所有玩家和中立被动玩家相互结盟（被动结盟，互不侵犯）
// Creates a 'Neutral Victim' player slot.  This slot is passive towards all
// other players, but all other players are aggressive towards him/her.
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

    // Neutral Victim and Neutral Aggressive should not fight each other.
    set indexPlayer = Player(PLAYER_NEUTRAL_AGGRESSIVE)
    call SetPlayerAlliance(neutralVictim, indexPlayer, ALLIANCE_PASSIVE, true)
    call SetPlayerAlliance(indexPlayer, neutralVictim, ALLIANCE_PASSIVE, true)

    // Neutral Victim does not give bounties.
    call SetPlayerState(neutralVictim, PLAYER_STATE_GIVES_BOUNTY, 0)
endfunction


// 设置指定玩家所有单位移交给中立被动玩家控制触发器动作
function MakeUnitsPassiveForPlayerEnum takes nothing returns nothing
    call SetUnitOwner(GetEnumUnit(), Player(bj_PLAYER_NEUTRAL_VICTIM), false)
endfunction


// 设置指定玩家所有单位移交给中立被动玩家控制
// Change ownership for every unit of (whichPlayer)'s team to neutral passive.
function MakeUnitsPassiveForPlayer takes player whichPlayer returns nothing
    local group playerUnits = CreateGroup()
    call CachePlayerHeroData(whichPlayer)
    call GroupEnumUnitsOfPlayer(playerUnits, whichPlayer, null)
    call ForGroup(playerUnits, function MakeUnitsPassiveForPlayerEnum)
    call DestroyGroup(playerUnits)
endfunction


// 设置盟友玩家的单位全部移交给中立被动玩家控制
// Change ownership for every unit of (whichPlayer)'s team to neutral passive.
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

// 允许胜利和失败（使用普通对战胜败判定）
// Determine whether or not victory/defeat is disabled via cheat codes.
function AllowVictoryDefeat takes playergameresult gameResult returns boolean
    if(gameResult == PLAYER_GAME_RESULT_VICTORY) then
        return not IsNoVictoryCheat()
    endif
    if(gameResult == PLAYER_GAME_RESULT_DEFEAT) then
        return not IsNoDefeatCheat()
    endif
    if(gameResult == PLAYER_GAME_RESULT_NEUTRAL) then
        return(not IsNoVictoryCheat()) and(not IsNoDefeatCheat())
    endif
    return true
endfunction

// 退出游戏
function EndGameBJ takes nothing returns nothing
    call EndGame(true)
endfunction

// 显示对战胜利对话框
function MeleeVictoryDialogBJ takes player whichPlayer, boolean leftGame returns nothing
    local trigger t = CreateTrigger()
    local dialog d = DialogCreate()
    local string formatString

    // Display "player was victorious" or "player has left the game" message
    if(leftGame) then
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

// 显示对战失败对话框
function MeleeDefeatDialogBJ takes player whichPlayer, boolean leftGame returns nothing
    local trigger t = CreateTrigger()
    local dialog d = DialogCreate()
    local string formatString

    // Display "player was defeated" or "player has left the game" message
    if(leftGame) then
        set formatString = GetLocalizedString("PLAYER_LEFT_GAME")
    else
        set formatString = GetLocalizedString("PLAYER_DEFEATED")
    endif

    call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, formatString)

    call DialogSetMessage(d, GetLocalizedString("GAMEOVER_DEFEAT_MSG"))

    // Only show the continue button if the game is not over and observers on death are allowed
    if(not bj_meleeGameOver and IsMapFlagSet(MAP_OBSERVERS_ON_DEATH)) then
        call DialogAddButton(d, GetLocalizedString("GAMEOVER_CONTINUE_OBSERVING"), GetLocalizedHotkey("GAMEOVER_CONTINUE_OBSERVING"))
    endif

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddQuitButton(d, true, GetLocalizedString("GAMEOVER_QUIT_GAME"), GetLocalizedHotkey("GAMEOVER_QUIT_GAME")))

    call DialogDisplay(whichPlayer, d, true)
    call StartSoundForPlayerBJ(whichPlayer, bj_defeatDialogSound)
endfunction

// 显示游戏结束对话框
function GameOverDialogBJ takes player whichPlayer, boolean leftGame returns nothing
    local trigger t = CreateTrigger()
    local dialog d = DialogCreate()
    local string s

    // Display "player left the game" message
    call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_LEFT_GAME"))

    if(GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
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

// 剔除玩家并保留单位
function RemovePlayerPreserveUnitsBJ takes player whichPlayer, playergameresult gameResult, boolean leftGame returns nothing
    if AllowVictoryDefeat(gameResult) then

        call RemovePlayer(whichPlayer, gameResult)

        if(gameResult == PLAYER_GAME_RESULT_VICTORY) then
            call MeleeVictoryDialogBJ(whichPlayer, leftGame)
            return
        elseif(gameResult == PLAYER_GAME_RESULT_DEFEAT) then
            call MeleeDefeatDialogBJ(whichPlayer, leftGame)
        else
            call GameOverDialogBJ(whichPlayer, leftGame)
        endif

    endif
endfunction

// 游戏胜利对话框事件-继续
function CustomVictoryOkBJ takes nothing returns nothing
    if bj_isSinglePlayer then

        // Bump the difficulty back up to the default.
        call SetGameDifficulty(GetDefaultDifficulty())
    endif

    if(bj_changeLevelMapName == null) then
        call EndGame(bj_changeLevelShowScores)
    else
        call ChangeLevel(bj_changeLevelMapName, bj_changeLevelShowScores)
    endif
endfunction

// 游戏胜利对话框事件-退出
function CustomVictoryQuitBJ takes nothing returns nothing
    if bj_isSinglePlayer then
        call PauseGame(false)
        // Bump the difficulty back up to the default.
        call SetGameDifficulty(GetDefaultDifficulty())
    endif

    call EndGame(bj_changeLevelShowScores)
endfunction

// 游戏胜利，显示对话框-继续&退出
function CustomVictoryDialogBJ takes player whichPlayer returns nothing
    local trigger t = CreateTrigger()
    local dialog d = DialogCreate()

    call DialogSetMessage(d, GetLocalizedString("GAMEOVER_VICTORY_MSG"))

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_CONTINUE"), GetLocalizedHotkey("GAMEOVER_CONTINUE")))
    call TriggerAddAction(t, function CustomVictoryOkBJ)

    set t = CreateTrigger()
    call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_QUIT_MISSION"), GetLocalizedHotkey("GAMEOVER_QUIT_MISSION")))
    call TriggerAddAction(t, function CustomVictoryQuitBJ)

    if(GetLocalPlayer() == whichPlayer) then
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

// 游戏胜利，跳过选择，直接进入下一关或退出
function CustomVictorySkipBJ takes player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        if bj_isSinglePlayer then
            // Bump the difficulty back up to the default.
            call SetGameDifficulty(GetDefaultDifficulty())
        endif

        if(bj_changeLevelMapName == null) then
            call EndGame(bj_changeLevelShowScores)
        else
            call ChangeLevel(bj_changeLevelMapName, bj_changeLevelShowScores)
        endif
    endif
endfunction


// 游戏胜利
function CustomVictoryBJ takes player whichPlayer, boolean showDialog, boolean showScores returns nothing
    if AllowVictoryDefeat(PLAYER_GAME_RESULT_VICTORY) then
        call RemovePlayer(whichPlayer, PLAYER_GAME_RESULT_VICTORY)

        if not bj_isSinglePlayer then
            call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_VICTORIOUS"))
        endif

        // UI only needs to be displayed to users.
        if(GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
            set bj_changeLevelShowScores = showScores
            if showDialog then
                call CustomVictoryDialogBJ(whichPlayer)
            else
                call CustomVictorySkipBJ(whichPlayer)
            endif
        endif
    endif
endfunction

// 游戏失败对话框按钮事件，重新开始
function CustomDefeatRestartBJ takes nothing returns nothing
    call PauseGame(false)
    call RestartGame(true)
endfunction

// 游戏失败对话框按钮事件，选择难度并重新开始
function CustomDefeatReduceDifficultyBJ takes nothing returns nothing
    local gamedifficulty diff = GetGameDifficulty()

    call PauseGame(false)

    // Knock the difficulty down, if possible.
    if(diff == MAP_DIFFICULTY_EASY) then
        // Sorry, but it doesn't get any easier than this.
    elseif(diff == MAP_DIFFICULTY_NORMAL) then
        call SetGameDifficulty(MAP_DIFFICULTY_EASY)
    elseif(diff == MAP_DIFFICULTY_HARD) then
        call SetGameDifficulty(MAP_DIFFICULTY_NORMAL)
    else
        // Unrecognized difficulty
    endif

    call RestartGame(true)
endfunction

// 游戏失败对话框按钮事件-选择存档
function CustomDefeatLoadBJ takes nothing returns nothing
    call PauseGame(false)
    call DisplayLoadDialog()
endfunction

// 游戏失败对话框按钮事件-退出游戏
function CustomDefeatQuitBJ takes nothing returns nothing
    if bj_isSinglePlayer then
        call PauseGame(false)
    endif

    // Bump the difficulty back up to the default.
    call SetGameDifficulty(GetDefaultDifficulty())
    call EndGame(true)
endfunction

// 游戏失败对话框-重新开始&选择难度&退出
function CustomDefeatDialogBJ takes player whichPlayer, string message returns nothing
    local trigger t = CreateTrigger()
    local dialog d = DialogCreate()

    call DialogSetMessage(d, message)

    if bj_isSinglePlayer then
        set t = CreateTrigger()
        call TriggerRegisterDialogButtonEvent(t, DialogAddButton(d, GetLocalizedString("GAMEOVER_RESTART"), GetLocalizedHotkey("GAMEOVER_RESTART")))
        call TriggerAddAction(t, function CustomDefeatRestartBJ)

        if(GetGameDifficulty() != MAP_DIFFICULTY_EASY) then
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

    if(GetLocalPlayer() == whichPlayer) then
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


// 游戏失败
function CustomDefeatBJ takes player whichPlayer, string message returns nothing
    if AllowVictoryDefeat(PLAYER_GAME_RESULT_DEFEAT) then
        call RemovePlayer(whichPlayer, PLAYER_GAME_RESULT_DEFEAT)

        if not bj_isSinglePlayer then
            call DisplayTimedTextFromPlayer(whichPlayer, 0, 0, 60, GetLocalizedString("PLAYER_DEFEATED"))
        endif

        // UI only needs to be displayed to users.
        if(GetPlayerController(whichPlayer) == MAP_CONTROL_USER) then
            call CustomDefeatDialogBJ(whichPlayer, message)
        endif
    endif
endfunction


// 设置下一张/关地图，用于战役
function SetNextLevelBJ takes string nextLevel returns nothing
    if(nextLevel == "") then
        set bj_changeLevelMapName = null
    else
        set bj_changeLevelMapName = nextLevel
    endif
endfunction


// 显示/隐藏 得分屏
// 游戏结束后的得分统计面板，官方战役默认不显示
function SetPlayerOnScoreScreenBJ takes boolean flag, player whichPlayer returns nothing
    call SetPlayerOnScoreScreen(whichPlayer, flag)
endfunction



//***************************************************************************
//*
//*  Quest Utility Functions
//*
//***************************************************************************


// 创建任务
function CreateQuestBJ takes integer questType, string title, string description, string iconPath returns quest
    local boolean required = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or(questType == bj_QUESTTYPE_REQ_UNDISCOVERED)
    local boolean discovered = (questType == bj_QUESTTYPE_REQ_DISCOVERED) or(questType == bj_QUESTTYPE_OPT_DISCOVERED)

    set bj_lastCreatedQuest = CreateQuest()
    call QuestSetTitle(bj_lastCreatedQuest, title)
    call QuestSetDescription(bj_lastCreatedQuest, description)
    call QuestSetIconPath(bj_lastCreatedQuest, iconPath)
    call QuestSetRequired(bj_lastCreatedQuest, required)
    call QuestSetDiscovered(bj_lastCreatedQuest, discovered)
    call QuestSetCompleted(bj_lastCreatedQuest, false)
    return bj_lastCreatedQuest
endfunction


// 销毁任务
function DestroyQuestBJ takes quest whichQuest returns nothing
    call DestroyQuest(whichQuest)
endfunction


// 启用/禁用 任务
function QuestSetEnabledBJ takes boolean enabled, quest whichQuest returns nothing
    call QuestSetEnabled(whichQuest, enabled)
endfunction


// 设置任务标题
function QuestSetTitleBJ takes quest whichQuest, string title returns nothing
    call QuestSetTitle(whichQuest, title)
endfunction


// 设置任务说明
function QuestSetDescriptionBJ takes quest whichQuest, string description returns nothing
    call QuestSetDescription(whichQuest, description)
endfunction


// 设置任务为完成
function QuestSetCompletedBJ takes quest whichQuest, boolean completed returns nothing
    call QuestSetCompleted(whichQuest, completed)
endfunction


// 设置任务为失败
function QuestSetFailedBJ takes quest whichQuest, boolean failed returns nothing
    call QuestSetFailed(whichQuest, failed)
endfunction


// 设置任务被发现
function QuestSetDiscoveredBJ takes quest whichQuest, boolean discovered returns nothing
    call QuestSetDiscovered(whichQuest, discovered)
endfunction


// 获取最后创建的任务
function GetLastCreatedQuestBJ takes nothing returns quest
    return bj_lastCreatedQuest
endfunction


// 创建任务完成条件
function CreateQuestItemBJ takes quest whichQuest, string description returns questitem
    set bj_lastCreatedQuestItem = QuestCreateItem(whichQuest)
    call QuestItemSetDescription(bj_lastCreatedQuestItem, description)
    call QuestItemSetCompleted(bj_lastCreatedQuestItem, false)
    return bj_lastCreatedQuestItem
endfunction


// 设置任务完成条件说明
function QuestItemSetDescriptionBJ takes questitem whichQuestItem, string description returns nothing
    call QuestItemSetDescription(whichQuestItem, description)
endfunction


// 设置任务完成条件为已完成
function QuestItemSetCompletedBJ takes questitem whichQuestItem, boolean completed returns nothing
    call QuestItemSetCompleted(whichQuestItem, completed)
endfunction


// 获取最后创建的任务完成条件
function GetLastCreatedQuestItemBJ takes nothing returns questitem
    return bj_lastCreatedQuestItem
endfunction


// 创建任务失败条件
function CreateDefeatConditionBJ takes string description returns defeatcondition
    set bj_lastCreatedDefeatCondition = CreateDefeatCondition()
    call DefeatConditionSetDescription(bj_lastCreatedDefeatCondition, description)
    return bj_lastCreatedDefeatCondition
endfunction


// 销毁任务失败条件
function DestroyDefeatConditionBJ takes defeatcondition whichCondition returns nothing
    call DestroyDefeatCondition(whichCondition)
endfunction


// 设置任务失败条件说明
function DefeatConditionSetDescriptionBJ takes defeatcondition whichCondition, string description returns nothing
    call DefeatConditionSetDescription(whichCondition, description)
endfunction


// 获取最后创建的任务失败条件
function GetLastCreatedDefeatConditionBJ takes nothing returns defeatcondition
    return bj_lastCreatedDefeatCondition
endfunction


// 闪烁任务按钮
function FlashQuestDialogButtonBJ takes nothing returns nothing
    call FlashQuestDialogButton()
endfunction


// 显示任务消息
function QuestMessageBJ takes force f, integer messageType, string message returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        if(messageType == bj_QUESTMESSAGE_DISCOVERED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUEST, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUEST, message)
            call StartSound(bj_questDiscoveredSound)
            call FlashQuestDialogButton()

        elseif(messageType == bj_QUESTMESSAGE_UPDATED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTUPDATE, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTUPDATE, message)
            call StartSound(bj_questUpdatedSound)
            call FlashQuestDialogButton()

        elseif(messageType == bj_QUESTMESSAGE_COMPLETED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTDONE, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTDONE, message)
            call StartSound(bj_questCompletedSound)
            call FlashQuestDialogButton()

        elseif(messageType == bj_QUESTMESSAGE_FAILED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTFAILED, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTFAILED, message)
            call StartSound(bj_questFailedSound)
            call FlashQuestDialogButton()

        elseif(messageType == bj_QUESTMESSAGE_REQUIREMENT) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_QUESTREQUIREMENT, message)

        elseif(messageType == bj_QUESTMESSAGE_MISSIONFAILED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_MISSIONFAILED, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_MISSIONFAILED, message)
            call StartSound(bj_questFailedSound)

        elseif(messageType == bj_QUESTMESSAGE_HINT) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_HINT, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_HINT, message)
            call StartSound(bj_questHintSound)

        elseif(messageType == bj_QUESTMESSAGE_ALWAYSHINT) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ALWAYSHINT, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ALWAYSHINT, message)
            call StartSound(bj_questHintSound)

        elseif(messageType == bj_QUESTMESSAGE_SECRET) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_SECRET, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_SECRET, message)
            call StartSound(bj_questSecretSound)

        elseif(messageType == bj_QUESTMESSAGE_UNITACQUIRED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITACQUIRED, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITACQUIRED, message)
            call StartSound(bj_questHintSound)

        elseif(messageType == bj_QUESTMESSAGE_UNITAVAILABLE) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITAVAILABLE, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_UNITAVAILABLE, message)
            call StartSound(bj_questHintSound)

        elseif(messageType == bj_QUESTMESSAGE_ITEMACQUIRED) then
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ITEMACQUIRED, " ")
            call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_TEXT_DELAY_ITEMACQUIRED, message)
            call StartSound(bj_questItemAcquiredSound)

        elseif(messageType == bj_QUESTMESSAGE_WARNING) then
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


// 计时器开始计时
function StartTimerBJ takes timer t, boolean periodic, real timeout returns timer
    set bj_lastStartedTimer = t
    call TimerStart(t, timeout, periodic, null)
    return bj_lastStartedTimer
endfunction

// 创建计时器
function CreateTimerBJ takes boolean periodic, real timeout returns timer
    set bj_lastStartedTimer = CreateTimer()
    call TimerStart(bj_lastStartedTimer, timeout, periodic, null)
    return bj_lastStartedTimer
endfunction

// 销毁计时器
function DestroyTimerBJ takes timer whichTimer returns nothing
    call DestroyTimer(whichTimer)
endfunction


// 暂停计时器
function PauseTimerBJ takes boolean pause, timer whichTimer returns nothing
    if pause then
        call PauseTimer(whichTimer)
    else
        call ResumeTimer(whichTimer)
    endif
endfunction


// 获取最后创建的计时器
function GetLastCreatedTimerBJ takes nothing returns timer
    return bj_lastStartedTimer
endfunction


// 创建计时器窗口（指定窗口标题）
function CreateTimerDialogBJ takes timer t, string title returns timerdialog
    set bj_lastCreatedTimerDialog = CreateTimerDialog(t)
    call TimerDialogSetTitle(bj_lastCreatedTimerDialog, title)
    call TimerDialogDisplay(bj_lastCreatedTimerDialog, true)
    return bj_lastCreatedTimerDialog
endfunction


// 销毁计时器窗口
function DestroyTimerDialogBJ takes timerdialog td returns nothing
    call DestroyTimerDialog(td)
endfunction


// 设置计时器窗口标题
function TimerDialogSetTitleBJ takes timerdialog td, string title returns nothing
    call TimerDialogSetTitle(td, title)
endfunction


// 设置计时器标题颜色
function TimerDialogSetTitleColorBJ takes timerdialog td, real red, real green, real blue, real transparency returns nothing
    call TimerDialogSetTitleColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置计时器窗口时间颜色
function TimerDialogSetTimeColorBJ takes timerdialog td, real red, real green, real blue, real transparency returns nothing
    call TimerDialogSetTimeColor(td, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置计时器窗口速度
function TimerDialogSetSpeedBJ takes timerdialog td, real speedMultFactor returns nothing
    call TimerDialogSetSpeed(td, speedMultFactor)
endfunction


// 显示/隐藏 计时器窗口为玩家
function TimerDialogDisplayForPlayerBJ takes boolean show, timerdialog td, player whichPlayer returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call TimerDialogDisplay(td, show)
    endif
endfunction


// 显示/隐藏 计时器窗口
function TimerDialogDisplayBJ takes boolean show, timerdialog td returns nothing
    call TimerDialogDisplay(td, show)
endfunction


// 获取最后创建的计时器窗口
function GetLastCreatedTimerDialogBJ takes nothing returns timerdialog
    return bj_lastCreatedTimerDialog
endfunction



//***************************************************************************
//*
//*  Leaderboard Utility Functions
//*
//***************************************************************************

// 设置排行榜行数
function LeaderboardResizeBJ takes leaderboard lb returns nothing
    local integer size = LeaderboardGetItemCount(lb)

    if(LeaderboardGetLabelText(lb) == "") then
        set size = size - 1
    endif
    call LeaderboardSetSizeByItemCount(lb, size)
endfunction


// 设置排行榜玩家分值
function LeaderboardSetPlayerItemValueBJ takes player whichPlayer, leaderboard lb, integer val returns nothing
    call LeaderboardSetItemValue(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction


// 设置排行榜玩家名字
function LeaderboardSetPlayerItemLabelBJ takes player whichPlayer, leaderboard lb, string val returns nothing
    call LeaderboardSetItemLabel(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), val)
endfunction


// 设置排行榜玩家的显示样式
function LeaderboardSetPlayerItemStyleBJ takes player whichPlayer, leaderboard lb, boolean showLabel, boolean showValue, boolean showIcon returns nothing
    call LeaderboardSetItemStyle(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), showLabel, showValue, showIcon)
endfunction


// 设置排行榜玩家名字颜色
function LeaderboardSetPlayerItemLabelColorBJ takes player whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returns nothing
    call LeaderboardSetItemLabelColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置排行榜玩家分值颜色
function LeaderboardSetPlayerItemValueColorBJ takes player whichPlayer, leaderboard lb, real red, real green, real blue, real transparency returns nothing
    call LeaderboardSetItemValueColor(lb, LeaderboardGetPlayerIndex(lb, whichPlayer), PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置排行榜文字颜色
function LeaderboardSetLabelColorBJ takes leaderboard lb, real red, real green, real blue, real transparency returns nothing
    call LeaderboardSetLabelColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置排行榜分值颜色
function LeaderboardSetValueColorBJ takes leaderboard lb, real red, real green, real blue, real transparency returns nothing
    call LeaderboardSetValueColor(lb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置排行榜标题及行数
function LeaderboardSetLabelBJ takes leaderboard lb, string label returns nothing
    call LeaderboardSetLabel(lb, label)
    call LeaderboardResizeBJ(lb)
endfunction


// 设置排行榜显示样式
// @param showLabel是否显示文字
// @param showNames是否显示标题
// @param showValues是否显示分数
// @param showIcons是否显示图标
function LeaderboardSetStyleBJ takes leaderboard lb, boolean showLabel, boolean showNames, boolean showValues, boolean showIcons returns nothing
    call LeaderboardSetStyle(lb, showLabel, showNames, showValues, showIcons)
endfunction

// 获取排行榜行数
function LeaderboardGetItemCountBJ takes leaderboard lb returns integer
    return LeaderboardGetItemCount(lb)
endfunction


// 查询玩家是否登上排行榜
function LeaderboardHasPlayerItemBJ takes leaderboard lb, player whichPlayer returns boolean
    return LeaderboardHasPlayerItem(lb, whichPlayer)
endfunction

// 设置玩家组登上排行榜 
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


// 创建排行榜
function CreateLeaderboardBJ takes force toForce, string label returns leaderboard
    set bj_lastCreatedLeaderboard = CreateLeaderboard()
    call LeaderboardSetLabel(bj_lastCreatedLeaderboard, label)
    call ForceSetLeaderboardBJ(bj_lastCreatedLeaderboard, toForce)
    call LeaderboardDisplay(bj_lastCreatedLeaderboard, true)
    return bj_lastCreatedLeaderboard
endfunction


// 销毁排行榜
function DestroyLeaderboardBJ takes leaderboard lb returns nothing
    call DestroyLeaderboard(lb)
endfunction


// 显示/隐藏 排行榜
function LeaderboardDisplayBJ takes boolean show, leaderboard lb returns nothing
    call LeaderboardDisplay(lb, show)
endfunction


// 增加排行榜的玩家
// @param lb指定玩家在榜上的排名（行数）
// @param label指定玩家在榜上的名字
// @param value指定玩家在榜上的分数
function LeaderboardAddItemBJ takes player whichPlayer, leaderboard lb, string label, integer value returns nothing
    if(LeaderboardHasPlayerItem(lb, whichPlayer)) then
        call LeaderboardRemovePlayerItem(lb, whichPlayer)
    endif
    call LeaderboardAddItem(lb, label, value, whichPlayer)
    call LeaderboardResizeBJ(lb)
    //call LeaderboardSetSizeByItemCount(lb, LeaderboardGetItemCount(lb))
endfunction


// 删除排行榜的玩家
function LeaderboardRemovePlayerItemBJ takes player whichPlayer, leaderboard lb returns nothing
    call LeaderboardRemovePlayerItem(lb, whichPlayer)
    call LeaderboardResizeBJ(lb)
endfunction


// 设置排行榜排序类型
function LeaderboardSortItemsBJ takes leaderboard lb, integer sortType, boolean ascending returns nothing
    if(sortType == bj_SORTTYPE_SORTBYVALUE) then
        call LeaderboardSortItemsByValue(lb, ascending)
    elseif(sortType == bj_SORTTYPE_SORTBYPLAYER) then
        call LeaderboardSortItemsByPlayer(lb, ascending)
    elseif(sortType == bj_SORTTYPE_SORTBYLABEL) then
        call LeaderboardSortItemsByLabel(lb, ascending)
    else
        // Unrecognized sort type - ignore the request.
    endif
endfunction

// 设置排行榜按玩家排序
function LeaderboardSortItemsByPlayerBJ takes leaderboard lb, boolean ascending returns nothing
    call LeaderboardSortItemsByPlayer(lb, ascending)
endfunction

// 设置排行榜按文本排序
function LeaderboardSortItemsByLabelBJ takes leaderboard lb, boolean ascending returns nothing
    call LeaderboardSortItemsByLabel(lb, ascending)
endfunction


// 获取排行榜玩家排名的后一位排名值
function LeaderboardGetPlayerIndexBJ takes player whichPlayer, leaderboard lb returns integer
    return LeaderboardGetPlayerIndex(lb, whichPlayer) + 1
endfunction


// 获取排行榜中第N位的玩家
// Returns the player who is occupying a specified position in a leaderboard.
// The position parameter is expected in the range of 1..16.
function LeaderboardGetIndexedPlayerBJ takes integer position, leaderboard lb returns player
    local integer index
    local player indexPlayer

    set index = 0
    loop
        set indexPlayer = Player(index)
        if(LeaderboardGetPlayerIndex(lb, indexPlayer) == position - 1) then
            return indexPlayer
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    return Player(PLAYER_NEUTRAL_PASSIVE)
endfunction


// 获取玩家使用的排行榜
function PlayerGetLeaderboardBJ takes player whichPlayer returns leaderboard
    return PlayerGetLeaderboard(whichPlayer)
endfunction


// 获取最后创建的排行榜
function GetLastCreatedLeaderboard takes nothing returns leaderboard
    return bj_lastCreatedLeaderboard
endfunction

//***************************************************************************
//*
//*  Multiboard Utility Functions
//*
//***************************************************************************


// 创建多面板
function CreateMultiboardBJ takes integer cols, integer rows, string title returns multiboard
    set bj_lastCreatedMultiboard = CreateMultiboard()
    call MultiboardSetRowCount(bj_lastCreatedMultiboard, rows)
    call MultiboardSetColumnCount(bj_lastCreatedMultiboard, cols)
    call MultiboardSetTitleText(bj_lastCreatedMultiboard, title)
    call MultiboardDisplay(bj_lastCreatedMultiboard, true)
    return bj_lastCreatedMultiboard
endfunction


// 销毁多面板
function DestroyMultiboardBJ takes multiboard mb returns nothing
    call DestroyMultiboard(mb)
endfunction


// 获取最后创建的多面板
function GetLastCreatedMultiboard takes nothing returns multiboard
    return bj_lastCreatedMultiboard
endfunction


// 显示/隐藏 多面板
function MultiboardDisplayBJ takes boolean show, multiboard mb returns nothing
    call MultiboardDisplay(mb, show)
endfunction


// 最大化/最小化多面板
function MultiboardMinimizeBJ takes boolean minimize, multiboard mb returns nothing
    call MultiboardMinimize(mb, minimize)
endfunction


// 设置多面板标题颜色
function MultiboardSetTitleTextColorBJ takes multiboard mb, real red, real green, real blue, real transparency returns nothing
    call MultiboardSetTitleTextColor(mb, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 显示/隐藏 所有多面板
function MultiboardAllowDisplayBJ takes boolean flag returns nothing
    call MultiboardSuppressDisplay(not flag)
endfunction


// 设置多面板项目显示风格
function MultiboardSetItemStyleBJ takes multiboard mb, integer col, integer row, boolean showValue, boolean showIcon returns nothing
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
        if(row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if(col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemStyle(mbitem, showValue, showIcon)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction


// 设置多面板项目文本
function MultiboardSetItemValueBJ takes multiboard mb, integer col, integer row, string val returns nothing
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
        if(row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if(col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemValue(mbitem, val)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction


// 设置多面板项目颜色
function MultiboardSetItemColorBJ takes multiboard mb, integer col, integer row, real red, real green, real blue, real transparency returns nothing
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
        if(row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if(col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemValueColor(mbitem, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction


// 设置多面板项目宽度
function MultiboardSetItemWidthBJ takes multiboard mb, integer col, integer row, real width returns nothing
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
        if(row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if(col == 0 or col == curCol) then
                    set mbitem = MultiboardGetItem(mb, curRow - 1, curCol - 1)
                    call MultiboardSetItemWidth(mbitem, width / 100.0)
                    call MultiboardReleaseItem(mbitem)
                endif
            endloop
        endif
    endloop
endfunction


// 设置多面板项目图标
function MultiboardSetItemIconBJ takes multiboard mb, integer col, integer row, string iconFileName returns nothing
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
        if(row == 0 or row == curRow) then
            // Loop over columns, using 1-based index
            set curCol = 0
            loop
                set curCol = curCol + 1
                exitwhen curCol > numCols

                // Apply setting to the requested column, or all columns (if col is 0)
                if(col == 0 or col == curCol) then
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


// 设置文本高度（size * 0.023 / 10）
// Scale the font size linearly such that size 10 equates to height 0.023.
// Screen-relative font heights are harder to grasp and than font sizes.
function TextTagSize2Height takes real size returns real
    return size * 0.023 / 10
endfunction


// 设置文本速度（speed * 0.071 / 128）
// Scale the speed linearly such that speed 128 equates to 0.071.
// Screen-relative speeds are hard to grasp.
function TextTagSpeed2Velocity takes real speed returns real
    return speed * 0.071 / 128
endfunction


// 设置漂浮文字颜色
// @param red 红色（输入的是百分比）
// @param green 绿色（输入的是百分比）
// @param blue 蓝色（输入的是百分比）
// @param transparency 透明度（建议为0，越大越透明）
function SetTextTagColorBJ takes texttag tt, real red, real green, real blue, real transparency returns nothing
    call SetTextTagColor(tt, PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - transparency))
endfunction


// 设置漂浮文字速度
function SetTextTagVelocityBJ takes texttag tt, real speed, real angle returns nothing
    local real vel = TextTagSpeed2Velocity(speed)
    local real xvel = vel * Cos(angle * bj_DEGTORAD)
    local real yvel = vel * Sin(angle * bj_DEGTORAD)

    call SetTextTagVelocity(tt, xvel, yvel)
endfunction


// 设置漂浮文字文本
function SetTextTagTextBJ takes texttag tt, string s, real size returns nothing
    local real textHeight = TextTagSize2Height(size)

    call SetTextTagText(tt, s, textHeight)
endfunction


// 设置漂浮文字位置（指定点）
// @param zOffset 字体大小
function SetTextTagPosBJ takes texttag tt, location loc, real zOffset returns nothing
    call SetTextTagPos(tt, GetLocationX(loc), GetLocationY(loc), zOffset)
endfunction


// 设置漂浮文字位置（指定单位）
// @param zOffset 字体大小
function SetTextTagPosUnitBJ takes texttag tt, unit whichUnit, real zOffset returns nothing
    call SetTextTagPosUnit(tt, whichUnit, zOffset)
endfunction


// 允许/禁止 漂浮文字暂停
function SetTextTagSuspendedBJ takes texttag tt, boolean flag returns nothing
    call SetTextTagSuspended(tt, flag)
endfunction


// 允许/禁止 漂浮文字永久（显示）
function SetTextTagPermanentBJ takes texttag tt, boolean flag returns nothing
    call SetTextTagPermanent(tt, flag)
endfunction


// 设置漂浮文字已存在时间
function SetTextTagAgeBJ takes texttag tt, real age returns nothing
    call SetTextTagAge(tt, age)
endfunction


// 设置漂浮文字清除时间（在指定生命周期后自动清除）
// 可替代排泄
function SetTextTagLifespanBJ takes texttag tt, real lifespan returns nothing
    call SetTextTagLifespan(tt, lifespan)
endfunction


// 设置漂浮文字消逝（淡化）时间
function SetTextTagFadepointBJ takes texttag tt, real fadepoint returns nothing
    call SetTextTagFadepoint(tt, fadepoint)
endfunction


// 创建漂浮文字（指定点）
// @param zOffset Z 轴高度
// @param size 字体大小
// @param red 红色（输入的是百分比）
// @param green 绿色（输入的是百分比）
// @param blue 蓝色（输入的是百分比）
// @param transparency 透明度（建议为0，越大越透明）
function CreateTextTagLocBJ takes string s, location loc, real zOffset, real size, real red, real green, real blue, real transparency returns texttag
    set bj_lastCreatedTextTag = CreateTextTag()
    call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
    call SetTextTagPosBJ(bj_lastCreatedTextTag, loc, zOffset)
    call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

    return bj_lastCreatedTextTag
endfunction


// 创建漂浮文字（指定单位）
// @param zOffset Z 轴高度
// @param size 字体大小
// @param red 红色（输入的是百分比）
// @param green 绿色（输入的是百分比）
// @param blue 蓝色（输入的是百分比）
// @param transparency 透明度（建议为0，越大越透明）
function CreateTextTagUnitBJ takes string s, unit whichUnit, real zOffset, real size, real red, real green, real blue, real transparency returns texttag
    set bj_lastCreatedTextTag = CreateTextTag()
    call SetTextTagTextBJ(bj_lastCreatedTextTag, s, size)
    call SetTextTagPosUnitBJ(bj_lastCreatedTextTag, whichUnit, zOffset)
    call SetTextTagColorBJ(bj_lastCreatedTextTag, red, green, blue, transparency)

    return bj_lastCreatedTextTag
endfunction


// 销毁漂浮文字
function DestroyTextTagBJ takes texttag tt returns nothing
    call DestroyTextTag(tt)
endfunction


// 显示/隐藏 漂浮文字
function ShowTextTagForceBJ takes boolean show, texttag tt, force whichForce returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call SetTextTagVisibility(tt, show)
    endif
endfunction


// 获取最后创建的漂浮文字
function GetLastCreatedTextTag takes nothing returns texttag
    return bj_lastCreatedTextTag
endfunction



//***************************************************************************
//*
//*  Cinematic Utility Functions
//*
//***************************************************************************


// 暂停游戏
function PauseGameOn takes nothing returns nothing
    call PauseGame(true)
endfunction


// 恢复游戏
function PauseGameOff takes nothing returns nothing
    call PauseGame(false)
endfunction


// 授予用户控制权
function SetUserControlForceOn takes force whichForce returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableUserControl(true)
    endif
endfunction


// 禁止用户控制权（使用后被禁玩家的鼠标消失，除 ALT + F4 和 切换桌面 外，其余游戏快捷键不响应）
// 对AI无效
function SetUserControlForceOff takes force whichForce returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableUserControl(false)
    endif
endfunction


// 开启信箱模式（显示（所有玩家）的游戏UI，淡入宽屏UI），指定淡入持续时间
function ShowInterfaceForceOn takes force whichForce, real fadeDuration returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ShowInterface(true, fadeDuration)
    endif
endfunction


// 关闭信箱模式（隐藏（所有玩家）的宽屏UI，淡入游戏UI），指定淡入持续时间
function ShowInterfaceForceOff takes force whichForce, real fadeDuration returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call ShowInterface(false, fadeDuration)
    endif
endfunction

// 发送小地图提示（指定坐标，指定玩家组）触发器动作
function PingMinimapForForce takes force whichForce, real x, real y, real duration returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PingMinimap(x, y, duration)
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction


// 发送小地图提示（指定点，指定玩家组）
function PingMinimapLocForForce takes force whichForce, location loc, real duration returns nothing
    call PingMinimapForForce(whichForce, GetLocationX(loc), GetLocationY(loc), duration)
endfunction

// 发送小地图提示（指定坐标，指定玩家）
function PingMinimapForPlayer takes player whichPlayer, real x, real y, real duration returns nothing
    if(GetLocalPlayer() == whichPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call PingMinimap(x, y, duration)
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction

// 发送小地图提示（指定点，指定玩家）
function PingMinimapLocForPlayer takes player whichPlayer, location loc, real duration returns nothing
    call PingMinimapForPlayer(whichPlayer, GetLocationX(loc), GetLocationY(loc), duration)
endfunction

// 发送小地图提示颜色（指定坐标，指定颜色，指定玩家组）
function PingMinimapForForceEx takes force whichForce, real x, real y, real duration, integer style, real red, real green, real blue returns nothing
    local integer red255 = PercentTo255(red)
    local integer green255 = PercentTo255(green)
    local integer blue255 = PercentTo255(blue)

    if(IsPlayerInForce(GetLocalPlayer(), whichForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        // Prevent 100% red simple and flashy pings, as they become "attack" pings.
        if(red255 == 255) and(green255 == 0) and(blue255 == 0) then
            set red255 = 254
        endif

        if(style == bj_MINIMAPPINGSTYLE_SIMPLE) then
            call PingMinimapEx(x, y, duration, red255, green255, blue255, false)
        elseif(style == bj_MINIMAPPINGSTYLE_FLASHY) then
            call PingMinimapEx(x, y, duration, red255, green255, blue255, true)
        elseif(style == bj_MINIMAPPINGSTYLE_ATTACK) then
            call PingMinimapEx(x, y, duration, 255, 0, 0, false)
        else
            // Unrecognized ping style - ignore the request.
        endif
        
        //call StartSound(bj_pingMinimapSound)
    endif
endfunction


// 发送小地图提示（指定点，指定颜色，指定玩家组）
// @param style 小地图提示样式，[bj_MINIMAPPINGSTYLE_SIMPLE,bj_MINIMAPPINGSTYLE_FLASHY,bj_MINIMAPPINGSTYLE_ATTACK]
function PingMinimapLocForForceEx takes force whichForce, location loc, real duration, integer style, real red, real green, real blue returns nothing
    call PingMinimapForForceEx(whichForce, GetLocationX(loc), GetLocationY(loc), duration, style, red, green, blue)
endfunction


// 允许/禁止 边界染色（指定玩家组）
function EnableWorldFogBoundaryBJ takes boolean enable, force f returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableWorldFogBoundary(enable)
    endif
endfunction


// 允许/禁止 闭塞（指定玩家组）
function EnableOcclusionBJ takes boolean enable, force f returns nothing
    if(IsPlayerInForce(GetLocalPlayer(), f)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.
        call EnableOcclusion(enable)
    endif
endfunction



//***************************************************************************
//*
//*  Cinematic Transmission Utility Functions
//*
//***************************************************************************


// 结束电影场景并停止播放音效
// If cancelled, stop the sound and end the cinematic scene.
function CancelCineSceneBJ takes nothing returns nothing
    call StopSoundBJ(bj_cineSceneLastSound, true)
    call EndCinematicScene()
endfunction


// 尝试初始化电影场景（停止播放）
// Init a trigger to listen for END_CINEMATIC events and respond to them if
// a cinematic scene is in progress.  For performance reasons, this should
// only be called once a cinematic scene has been started, so that maps
// lacking such scenes do not bother to register for these events.
function TryInitCinematicBehaviorBJ takes nothing returns nothing
    local integer index

    if(bj_cineSceneBeingSkipped == null) then
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

// 设置电影场景并播放音效
function SetCinematicSceneBJ takes sound soundHandle, integer portraitUnitId, playercolor color, string speakerTitle, string text, real sceneDuration, real voiceoverDuration returns nothing
    set bj_cineSceneLastSound = soundHandle
    call SetCinematicScene(portraitUnitId, color, speakerTitle, text, sceneDuration, voiceoverDuration)
    call PlaySoundBJ(soundHandle)
endfunction

// 获取音效持续时间
function GetTransmissionDuration takes sound soundHandle, integer timeType, real timeVal returns real
    local real duration

    if(timeType == bj_TIMETYPE_ADD) then
        set duration = GetSoundDurationBJ(soundHandle) + timeVal
    elseif(timeType == bj_TIMETYPE_SET) then
        set duration = timeVal
    elseif(timeType == bj_TIMETYPE_SUB) then
        set duration = GetSoundDurationBJ(soundHandle) - timeVal
    else
        // Unrecognized timeType - ignore timeVal.
        set duration = GetSoundDurationBJ(soundHandle)
    endif

    // Make sure we have a non-negative duration.
    if(duration < 0) then
        set duration = 0
    endif
    return duration
endfunction

// 等待信息播放完成（指定消息持续时间类型）
function WaitTransmissionDuration takes sound soundHandle, integer timeType, real timeVal returns nothing
    if(timeType == bj_TIMETYPE_SET) then
        // If we have a static duration wait, just perform the wait.
        call TriggerSleepAction(timeVal)

    elseif(soundHandle == null) then
        // If the sound does not exist, perform a default length wait.
        call TriggerSleepAction(bj_NOTHING_SOUND_DURATION)

    elseif(timeType == bj_TIMETYPE_SUB) then
        // If the transmission is cutting off the sound, wait for the sound
        // to be mostly finished.
        call WaitForSoundBJ(soundHandle, timeVal)

    elseif(timeType == bj_TIMETYPE_ADD) then
        // If the transmission is extending beyond the sound's length, wait
        // for it to finish, and then wait the additional time.
        call WaitForSoundBJ(soundHandle, 0)
        call TriggerSleepAction(timeVal)

    else
        // Unrecognized timeType - ignore.
    endif
endfunction

// 设置电影场景并在指定坐标发送小地图提示
function DoTransmissionBasicsXYBJ takes integer unitId, playercolor color, real x, real y, sound soundHandle, string unitName, string message, real duration returns nothing
    call SetCinematicSceneBJ(soundHandle, unitId, color, unitName, message, duration + bj_TRANSMISSION_PORT_HANGTIME, duration)

    if(unitId != 0) then
        call PingMinimap(x, y, bj_TRANSMISSION_PING_TIME)
        //call SetCameraQuickPosition(x, y)
    endif
endfunction


// 播放单位消息（指定单位使用的名称）
// Display a text message to a Player Group with an accompanying sound,
// portrait, speech indicator, and all that good stuff.
//   - Query duration of sound
//   - Play sound
//   - Display text message for duration
//   - Display animating portrait for duration
//   - Display a speech indicator for the unit
//   - Ping the minimap
function TransmissionFromUnitWithNameBJ takes force toForce, unit whichUnit, string unitName, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returns nothing
    call TryInitCinematicBehaviorBJ()

    call AttachSoundToUnit(soundHandle, whichUnit)

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        if(whichUnit == null) then
            // If the unit reference is invalid, send the transmission from the center of the map with no portrait.
            call DoTransmissionBasicsXYBJ(0, PLAYER_COLOR_RED, 0, 0, soundHandle, unitName, message, bj_lastTransmissionDuration)
        else
            call DoTransmissionBasicsXYBJ(GetUnitTypeId(whichUnit), GetPlayerColor(GetOwningPlayer(whichUnit)), GetUnitX(whichUnit), GetUnitY(whichUnit), soundHandle, unitName, message, bj_lastTransmissionDuration)
            if(not IsUnitHidden(whichUnit)) then
                call UnitAddIndicator(whichUnit, bj_TRANSMISSION_IND_RED, bj_TRANSMISSION_IND_BLUE, bj_TRANSMISSION_IND_GREEN, bj_TRANSMISSION_IND_ALPHA)
            endif
        endif
    endif

    if wait and(bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

endfunction

// 设置电影场景（指定玩家组内的指定玩家）
function PlayDialogueFromSpeakerEx takes force toForce, unit speaker, integer speakerType, sound soundHandle, integer timeType, real timeVal, boolean wait returns boolean
    //Make sure that the runtime unit type and the parameter are the same,
    //otherwise the offline animations will not match and will fail
    if GetUnitTypeId(speaker) != speakerType then
        debug call BJDebugMsg(("Attempted to play FacialAnimation with the wrong speaker UnitType - Param: " + I2S(speakerType) + " Runtime: " + I2S(GetUnitTypeId(speaker))))
        //return false
    endif

    call TryInitCinematicBehaviorBJ()

    call AttachSoundToUnit(soundHandle, speaker)

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        call SetCinematicSceneBJ(soundHandle, speakerType, GetPlayerColor(GetOwningPlayer(speaker)), GetLocalizedString(GetDialogueSpeakerNameKey(soundHandle)), GetLocalizedString(GetDialogueTextKey(soundHandle)), bj_lastTransmissionDuration + bj_TRANSMISSION_PORT_HANGTIME, bj_lastTransmissionDuration)
    endif

    if wait and(bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

    return true
endfunction

// 设置电影场景并在指定点发送小地图提示（指定玩家组内的指定玩家）
function PlayDialogueFromSpeakerTypeEx takes force toForce, player fromPlayer, integer speakerType, location loc, sound soundHandle, integer timeType, real timeVal, boolean wait returns boolean
    call TryInitCinematicBehaviorBJ()

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        call SetCinematicSceneBJ(soundHandle, speakerType, GetPlayerColor(fromPlayer), GetLocalizedString(GetDialogueSpeakerNameKey(soundHandle)), GetLocalizedString(GetDialogueTextKey(soundHandle)), bj_lastTransmissionDuration + bj_TRANSMISSION_PORT_HANGTIME, bj_lastTransmissionDuration)
        if(speakerType != 0) then
            call PingMinimap(GetLocationX(loc), GetLocationY(loc), bj_TRANSMISSION_PING_TIME)
        endif
    endif

    if wait and(bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

    return true
endfunction


// 播送单位消息（指定单位类型）
// This operates like TransmissionFromUnitWithNameBJ, but for a unit type
// rather than a unit instance.  As such, no speech indicator is employed.
function TransmissionFromUnitTypeWithNameBJ takes force toForce, player fromPlayer, integer unitId, string unitName, location loc, sound soundHandle, string message, integer timeType, real timeVal, boolean wait returns nothing
    call TryInitCinematicBehaviorBJ()

    // Ensure that the time value is non-negative.
    set timeVal = RMaxBJ(timeVal, 0)

    set bj_lastTransmissionDuration = GetTransmissionDuration(soundHandle, timeType, timeVal)
    set bj_lastPlayedSound = soundHandle

    if(IsPlayerInForce(GetLocalPlayer(), toForce)) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        call DoTransmissionBasicsXYBJ(unitId, GetPlayerColor(fromPlayer), GetLocationX(loc), GetLocationY(loc), soundHandle, unitName, message, bj_lastTransmissionDuration)
    endif

    if wait and(bj_lastTransmissionDuration > 0) then
        // call TriggerSleepAction(bj_lastTransmissionDuration)
        call WaitTransmissionDuration(soundHandle, timeType, timeVal)
    endif

endfunction


// 获取最后播放的单位消息持续时间
function GetLastTransmissionDurationBJ takes nothing returns real
    return bj_lastTransmissionDuration
endfunction


// 开启/关闭 电影字幕显示
function ForceCinematicSubtitlesBJ takes boolean flag returns nothing
    call ForceCinematicSubtitles(flag)
endfunction


//***************************************************************************
//*
//*  Cinematic Mode Utility Functions
//*
//***************************************************************************


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

// 切换影片模式(指定玩家组)
// @param interfaceFadeTime 淡出时间
// 注意：某些影响会作用于所有玩家
function CinematicModeExBJ takes boolean cineMode, force forForce, real interfaceFadeTime returns nothing
    // If the game hasn't started yet, perform interface fades immediately
    if(not bj_gameStarted) then
        set interfaceFadeTime = 0
    endif

    if(cineMode) then
        // Save the UI state so that we can restore it later.
        if(not bj_cineModeAlreadyIn) then
            call SetCinematicAudio(true)
            set bj_cineModeAlreadyIn = true
            set bj_cineModePriorSpeed = GetGameSpeed()
            set bj_cineModePriorFogSetting = IsFogEnabled()
            set bj_cineModePriorMaskSetting = IsFogMaskEnabled()
            set bj_cineModePriorDawnDusk = IsDawnDuskEnabled()
            set bj_cineModeSavedSeed = GetRandomInt(0, 1000000)
        endif

        // Perform local changes
        if(IsPlayerInForce(GetLocalPlayer(), forForce)) then
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
        call SetCinematicAudio(false)

        // Perform local changes
        if(IsPlayerInForce(GetLocalPlayer(), forForce)) then
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


// 切换影片模式
function CinematicModeBJ takes boolean cineMode, force forForce returns nothing
    call CinematicModeExBJ(cineMode, forForce, bj_CINEMODE_INTERFACEFADE)
endfunction



//***************************************************************************
//*
//*  Cinematic Filter Utility Functions
//*
//***************************************************************************


// 显示/隐藏 滤镜
function DisplayCineFilterBJ takes boolean flag returns nothing
    call DisplayCineFilter(flag)
endfunction

// 电影 淡出滤镜
function CinematicFadeCommonBJ takes real red, real green, real blue, real duration, string tex, real startTrans, real endTrans returns nothing
    if(duration == 0) then
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
    call SetCineFilterStartColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - startTrans))
    call SetCineFilterEndColor(PercentTo255(red), PercentTo255(green), PercentTo255(blue), PercentTo255(100.0 - endTrans))
    call SetCineFilterDuration(duration)
    call DisplayCineFilter(true)
endfunction

// 电影 结束淡出滤镜触发器动作
function FinishCinematicFadeBJ takes nothing returns nothing
    call DestroyTimer(bj_cineFadeFinishTimer)
    set bj_cineFadeFinishTimer = null
    call DisplayCineFilter(false)
    call EnableUserUI(true)
endfunction

// 电影 结束淡出滤镜
function FinishCinematicFadeAfterBJ takes real duration returns nothing
    // Create a timer to end the cinematic fade.
    set bj_cineFadeFinishTimer = CreateTimer()
    call TimerStart(bj_cineFadeFinishTimer, duration, false, function FinishCinematicFadeBJ)
endfunction

// 电影 持续淡出滤镜触发器动作
function ContinueCinematicFadeBJ takes nothing returns nothing
    call DestroyTimer(bj_cineFadeContinueTimer)
    set bj_cineFadeContinueTimer = null
    call CinematicFadeCommonBJ(bj_cineFadeContinueRed, bj_cineFadeContinueGreen, bj_cineFadeContinueBlue, bj_cineFadeContinueDuration, bj_cineFadeContinueTex, bj_cineFadeContinueTrans, 100)
endfunction

// 电影 持续淡出滤镜
function ContinueCinematicFadeAfterBJ takes real duration, real red, real green, real blue, real trans, string tex returns nothing
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

// 电影 中断淡出滤镜
function AbortCinematicFadeBJ takes nothing returns nothing
    if(bj_cineFadeContinueTimer != null) then
        call DestroyTimer(bj_cineFadeContinueTimer)
    endif

    if(bj_cineFadeFinishTimer != null) then
        call DestroyTimer(bj_cineFadeFinishTimer)
    endif
endfunction


// 电影 淡入淡出滤镜
function CinematicFadeBJ takes integer fadetype, real duration, string tex, real red, real green, real blue, real trans returns nothing
    if(fadetype == bj_CINEFADETYPE_FADEOUT) then
        // Fade out to the requested color.
        call AbortCinematicFadeBJ()
        call CinematicFadeCommonBJ(red, green, blue, duration, tex, 100, trans)
    elseif(fadetype == bj_CINEFADETYPE_FADEIN) then
        // Fade in from the requested color.
        call AbortCinematicFadeBJ()
        call CinematicFadeCommonBJ(red, green, blue, duration, tex, trans, 100)
        call FinishCinematicFadeAfterBJ(duration)
    elseif(fadetype == bj_CINEFADETYPE_FADEOUTIN) then
        // Fade out to the requested color, and then fade back in from it.
        if(duration > 0) then
            call AbortCinematicFadeBJ()
            call CinematicFadeCommonBJ(red, green, blue, duration * 0.5, tex, 100, trans)
            call ContinueCinematicFadeAfterBJ(duration * 0.5, red, green, blue, trans, tex)
            call FinishCinematicFadeAfterBJ(duration)
        endif
    else
        // Unrecognized fadetype - ignore the request.
    endif
endfunction


// 电影 设置滤镜（高级）
// @param duration 持续时间
// @param bmode 混合模式
// @param tex 电影滤镜纹理(可在 记录物编的文件 找到)
// @param red0~trans0 开始颜色(红绿蓝三色及透明度)
// @param red1~trans1 结束颜色(红绿蓝三色及透明度)
function CinematicFilterGenericBJ takes real duration, blendmode bmode, string tex, real red0, real green0, real blue0, real trans0, real red1, real green1, real blue1, real trans1 returns nothing
    call AbortCinematicFadeBJ()
    call SetCineFilterTexture(tex)
    call SetCineFilterBlendMode(bmode)
    call SetCineFilterTexMapFlags(TEXMAP_FLAG_NONE)
    call SetCineFilterStartUV(0, 0, 1, 1)
    call SetCineFilterEndUV(0, 0, 1, 1)
    call SetCineFilterStartColor(PercentTo255(red0), PercentTo255(green0), PercentTo255(blue0), PercentTo255(100.0 - trans0))
    call SetCineFilterEndColor(PercentTo255(red1), PercentTo255(green1), PercentTo255(blue1), PercentTo255(100.0 - trans1))
    call SetCineFilterDuration(duration)
    call DisplayCineFilter(true)
endfunction



//***************************************************************************
//*
//*  Rescuable Unit Utility Functions
//*
//***************************************************************************


// 设置可营救单位
// Rescues a unit for a player.  This performs the default rescue behavior,
// including a rescue sound, flashing selection circle, ownership change,
// and optionally a unit color change.
function RescueUnitBJ takes unit whichUnit, player rescuer, boolean changeColor returns nothing
    if IsUnitDeadBJ(whichUnit) or(GetOwningPlayer(whichUnit) == rescuer) then
        return
    endif

    call StartSound(bj_rescueSound)
    call SetUnitOwner(whichUnit, rescuer, changeColor)
    call UnitAddIndicator(whichUnit, 0, 255, 0, 255)
    call PingMinimapForPlayer(rescuer, GetUnitX(whichUnit), GetUnitY(whichUnit), bj_RESCUE_PING_TIME)
endfunction

// 初始化可营救玩家单位触发器动作
function TriggerActionUnitRescuedBJ takes nothing returns nothing
    local unit theUnit = GetTriggerUnit()

    if IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
        call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorBldg)
    else
        call RescueUnitBJ(theUnit, GetOwningPlayer(GetRescuer()), bj_rescueChangeColorUnit)
    endif
endfunction


// 初始化可营救玩家单位
// Attempt to init triggers for default rescue behavior.  For performance
// reasons, this should only be attempted if a player is set to Rescuable,
// or if a specific unit is thus flagged.
function TryInitRescuableTriggersBJ takes nothing returns nothing
    local integer index

    if(bj_rescueUnitBehavior == null) then
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


// 设置可营救单位的颜色
// Determines whether or not rescued units automatically change color upon
// being rescued.
function SetRescueUnitColorChangeBJ takes boolean changeColor returns nothing
    set bj_rescueChangeColorUnit = changeColor
endfunction


// 设置可营救建筑的颜色
// Determines whether or not rescued buildings automatically change color
// upon being rescued.
function SetRescueBuildingColorChangeBJ takes boolean changeColor returns nothing
    set bj_rescueChangeColorBldg = changeColor
endfunction


// 创建可营救单位触发器动作
function MakeUnitRescuableToForceBJEnum takes nothing returns nothing
    call TryInitRescuableTriggersBJ()
    call SetUnitRescuable(bj_makeUnitRescuableUnit, GetEnumPlayer(), bj_makeUnitRescuableFlag)
endfunction

// 创建可营救单位触发器（指定玩家组）
function MakeUnitRescuableToForceBJ takes unit whichUnit, boolean isRescuable, force whichForce returns nothing
    // Flag the unit as rescuable/unrescuable for the appropriate players.
    set bj_makeUnitRescuableUnit = whichUnit
    set bj_makeUnitRescuableFlag = isRescuable
    call ForForce(whichForce, function MakeUnitRescuableToForceBJEnum)
endfunction

// 初始化可营救玩家
function InitRescuableBehaviorBJ takes nothing returns nothing
    local integer index

    set index = 0
    loop
        // If at least one player slot is "Rescuable"-controlled, init the
        // rescue behavior triggers.
        if(GetPlayerController(Player(index)) == MAP_CONTROL_RESCUABLE) then
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


// 设置指定玩家指定科技当前等级
// 科技不能倒退，降级可添加自定义代码 BlzDecPlayerTechResearched
function SetPlayerTechResearchedSwap takes integer techid, integer levels, player whichPlayer returns nothing
    call SetPlayerTechResearched(whichPlayer, techid, levels)
endfunction


// 设置指定玩家指定科技最高等级
function SetPlayerTechMaxAllowedSwap takes integer techid, integer maximum, player whichPlayer returns nothing
    call SetPlayerTechMaxAllowed(whichPlayer, techid, maximum)
endfunction


// 设置指定玩家的英雄训练数量上限
function SetPlayerMaxHeroesAllowed takes integer maximum, player whichPlayer returns nothing
    call SetPlayerTechMaxAllowed(whichPlayer, 'HERO', maximum)
endfunction


// 获取指定玩家指定科技当前等级
function GetPlayerTechCountSimple takes integer techid, player whichPlayer returns integer
    return GetPlayerTechCount(whichPlayer, techid, true)
endfunction


// 获取指定玩家指定科技的最大等级
function GetPlayerTechMaxAllowedSwap takes integer techid, player whichPlayer returns integer
    return GetPlayerTechMaxAllowed(whichPlayer, techid)
endfunction


// 启用/禁用 技能（指定玩家）
function SetPlayerAbilityAvailableBJ takes boolean avail, integer abilid, player whichPlayer returns nothing
    call SetPlayerAbilityAvailable(whichPlayer, abilid, avail)
endfunction



//***************************************************************************
//*
//*  Campaign Utility Functions
//*
//***************************************************************************

// 设置读图背景（根据战役关卡设置）
function SetCampaignMenuRaceBJ takes integer campaignNumber returns nothing
    if(campaignNumber == bj_CAMPAIGN_INDEX_T) then
        call SetCampaignMenuRace(RACE_OTHER)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_H) then
        call SetCampaignMenuRace(RACE_HUMAN)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_U) then
        call SetCampaignMenuRace(RACE_UNDEAD)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_O) then
        call SetCampaignMenuRace(RACE_ORC)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_N) then
        call SetCampaignMenuRace(RACE_NIGHTELF)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XN) then
        call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XN)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XH) then
        call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XH)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XU) then
        call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XU)
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XO) then
        call SetCampaignMenuRaceEx(bj_CAMPAIGN_OFFSET_XO)
    else
        // Unrecognized campaign - ignore the request
    endif
endfunction


// 允许/禁止 任务
// Converts a single campaign mission designation into campaign and mission
// numbers.  The 1000's digit is considered the campaign index, and the 1's
// digit is considered the mission index within that campaign.  This is done
// so that the trigger for this can use a single drop-down to list all of
// the campaign missions.
function SetMissionAvailableBJ takes boolean available, integer missionIndex returns nothing
    local integer campaignNumber = missionIndex / 1000
    local integer missionNumber = missionIndex - campaignNumber * 1000

    call SetMissionAvailable(campaignNumber, missionNumber, available)
endfunction


// 允许/禁止 战役教程关卡
function SetCampaignAvailableBJ takes boolean available, integer campaignNumber returns nothing
    local integer campaignOffset

    if(campaignNumber == bj_CAMPAIGN_INDEX_H) then
        call SetTutorialCleared(true)
    endif

    if(campaignNumber == bj_CAMPAIGN_INDEX_XN) then
        set campaignOffset = bj_CAMPAIGN_OFFSET_XN
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XH) then
        set campaignOffset = bj_CAMPAIGN_OFFSET_XH
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XU) then
        set campaignOffset = bj_CAMPAIGN_OFFSET_XU
    elseif(campaignNumber == bj_CAMPAIGN_INDEX_XO) then
        set campaignOffset = bj_CAMPAIGN_OFFSET_XO
    else
        set campaignOffset = campaignNumber
    endif

    call SetCampaignAvailable(campaignOffset, available)
    call SetCampaignMenuRaceBJ(campaignNumber)
    call ForceCampaignSelectScreen()
endfunction


// 允许/禁止 过场电影
function SetCinematicAvailableBJ takes boolean available, integer cinematicIndex returns nothing
    if(cinematicIndex == bj_CINEMATICINDEX_TOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_T, available)
        call PlayCinematic("TutorialOp")
    elseif(cinematicIndex == bj_CINEMATICINDEX_HOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_H, available)
        call PlayCinematic("HumanOp")
    elseif(cinematicIndex == bj_CINEMATICINDEX_HED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_H, available)
        call PlayCinematic("HumanEd")
    elseif(cinematicIndex == bj_CINEMATICINDEX_OOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_INDEX_O, available)
        call PlayCinematic("OrcOp")
    elseif(cinematicIndex == bj_CINEMATICINDEX_OED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_O, available)
        call PlayCinematic("OrcEd")
    elseif(cinematicIndex == bj_CINEMATICINDEX_UOP) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_U, available)
        call PlayCinematic("UndeadOp")
    elseif(cinematicIndex == bj_CINEMATICINDEX_UED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_U, available)
        call PlayCinematic("UndeadEd")
    elseif(cinematicIndex == bj_CINEMATICINDEX_NOP) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_N, available)
        call PlayCinematic("NightElfOp")
    elseif(cinematicIndex == bj_CINEMATICINDEX_NED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_INDEX_N, available)
        call PlayCinematic("NightElfEd")
    elseif(cinematicIndex == bj_CINEMATICINDEX_XOP) then
        call SetOpCinematicAvailable(bj_CAMPAIGN_OFFSET_XN, available)
        // call PlayCinematic( "IntroX" )
    elseif(cinematicIndex == bj_CINEMATICINDEX_XED) then
        call SetEdCinematicAvailable(bj_CAMPAIGN_OFFSET_XU, available)
        call PlayCinematic("OutroX")
    else
        // Unrecognized cinematic - ignore the request.
    endif
endfunction


// 创建游戏缓存
function InitGameCacheBJ takes string campaignFile returns gamecache
    set bj_lastCreatedGameCache = InitGameCache(campaignFile)
    return bj_lastCreatedGameCache
endfunction


// 存储游戏缓存到本地硬盘
function SaveGameCacheBJ takes gamecache cache returns boolean
    return SaveGameCache(cache)
endfunction


// 获取最后创建的游戏缓存
function GetLastCreatedGameCacheBJ takes nothing returns gamecache
    return bj_lastCreatedGameCache
endfunction


// <1.24> 创建哈希表
function InitHashtableBJ takes nothing returns hashtable
    set bj_lastCreatedHashtable = InitHashtable()
    return bj_lastCreatedHashtable
endfunction


// 获取最后创建的哈希表
function GetLastCreatedHashtableBJ takes nothing returns hashtable
    return bj_lastCreatedHashtable
endfunction


// 存储 实数 到游戏缓存
function StoreRealBJ takes real value, string key, string missionKey, gamecache cache returns nothing
    call StoreReal(cache, missionKey, key, value)
endfunction


// 存储 整数 到游戏缓存
function StoreIntegerBJ takes integer value, string key, string missionKey, gamecache cache returns nothing
    call StoreInteger(cache, missionKey, key, value)
endfunction


// 存储 布尔值 到游戏缓存
function StoreBooleanBJ takes boolean value, string key, string missionKey, gamecache cache returns nothing
    call StoreBoolean(cache, missionKey, key, value)
endfunction


// 存储 字符串 到游戏缓存
function StoreStringBJ takes string value, string key, string missionKey, gamecache cache returns boolean
    return StoreString(cache, missionKey, key, value)
endfunction


// 存储 单位 到游戏缓存
function StoreUnitBJ takes unit whichUnit, string key, string missionKey, gamecache cache returns boolean
    return StoreUnit(cache, missionKey, key, whichUnit)
endfunction


// <1.24> 保存 实数 到哈希表
function SaveRealBJ takes real value, integer key, integer missionKey, hashtable table returns nothing
    call SaveReal(table, missionKey, key, value)
endfunction


// <1.24> 保存 整数 到哈希表
function SaveIntegerBJ takes integer value, integer key, integer missionKey, hashtable table returns nothing
    call SaveInteger(table, missionKey, key, value)
endfunction


// <1.24> 保存 布尔值 到哈希表
function SaveBooleanBJ takes boolean value, integer key, integer missionKey, hashtable table returns nothing
    call SaveBoolean(table, missionKey, key, value)
endfunction


// <1.24> 保存 字符串 到哈希表
function SaveStringBJ takes string value, integer key, integer missionKey, hashtable table returns boolean
    return SaveStr(table, missionKey, key, value)
endfunction


// <1.24> 保存 玩家 到哈希表
function SavePlayerHandleBJ takes player whichPlayer, integer key, integer missionKey, hashtable table returns boolean
    return SavePlayerHandle(table, missionKey, key, whichPlayer)
endfunction

// <1.24> 保存 微件/对象（单位/物品/可破坏物） 到哈希表
function SaveWidgetHandleBJ takes widget whichWidget, integer key, integer missionKey, hashtable table returns boolean
    return SaveWidgetHandle(table, missionKey, key, whichWidget)
endfunction


// <1.24> 保存 可破坏物 到哈希表
function SaveDestructableHandleBJ takes destructable whichDestructable, integer key, integer missionKey, hashtable table returns boolean
    return SaveDestructableHandle(table, missionKey, key, whichDestructable)
endfunction


// <1.24> 保存 物品 到哈希表
function SaveItemHandleBJ takes item whichItem, integer key, integer missionKey, hashtable table returns boolean
    return SaveItemHandle(table, missionKey, key, whichItem)
endfunction


// <1.24> 保存 单位 到哈希表
function SaveUnitHandleBJ takes unit whichUnit, integer key, integer missionKey, hashtable table returns boolean
    return SaveUnitHandle(table, missionKey, key, whichUnit)
endfunction

// <1.24> 保存 技能 到哈希表
function SaveAbilityHandleBJ takes ability whichAbility, integer key, integer missionKey, hashtable table returns boolean
    return SaveAbilityHandle(table, missionKey, key, whichAbility)
endfunction


// <1.24> 保存 计时器 到哈希表
function SaveTimerHandleBJ takes timer whichTimer, integer key, integer missionKey, hashtable table returns boolean
    return SaveTimerHandle(table, missionKey, key, whichTimer)
endfunction


// <1.24> 保存 触发器 到哈希表
function SaveTriggerHandleBJ takes trigger whichTrigger, integer key, integer missionKey, hashtable table returns boolean
    return SaveTriggerHandle(table, missionKey, key, whichTrigger)
endfunction


// <1.24> 保存 触发条件 到哈希表
function SaveTriggerConditionHandleBJ takes triggercondition whichTriggercondition, integer key, integer missionKey, hashtable table returns boolean
    return SaveTriggerConditionHandle(table, missionKey, key, whichTriggercondition)
endfunction


// <1.24> 保存 触发器动作 到哈希表
function SaveTriggerActionHandleBJ takes triggeraction whichTriggeraction, integer key, integer missionKey, hashtable table returns boolean
    return SaveTriggerActionHandle(table, missionKey, key, whichTriggeraction)
endfunction


// <1.24> 保存 触发事件 到哈希表
function SaveTriggerEventHandleBJ takes event whichEvent, integer key, integer missionKey, hashtable table returns boolean
    return SaveTriggerEventHandle(table, missionKey, key, whichEvent)
endfunction


// <1.24> 保存 玩家组 到哈希表
function SaveForceHandleBJ takes force whichForce, integer key, integer missionKey, hashtable table returns boolean
    return SaveForceHandle(table, missionKey, key, whichForce)
endfunction


// <1.24> 保存 单位组 到哈希表
function SaveGroupHandleBJ takes group whichGroup, integer key, integer missionKey, hashtable table returns boolean
    return SaveGroupHandle(table, missionKey, key, whichGroup)
endfunction


// <1.24> 保存 点 到哈希表
function SaveLocationHandleBJ takes location whichLocation, integer key, integer missionKey, hashtable table returns boolean
    return SaveLocationHandle(table, missionKey, key, whichLocation)
endfunction


// <1.24> 保存 区域(矩形) 到哈希表
function SaveRectHandleBJ takes rect whichRect, integer key, integer missionKey, hashtable table returns boolean
    return SaveRectHandle(table, missionKey, key, whichRect)
endfunction


// <1.24> 保存 条件表达式 到哈希表
function SaveBooleanExprHandleBJ takes boolexpr whichBoolexpr, integer key, integer missionKey, hashtable table returns boolean
    return SaveBooleanExprHandle(table, missionKey, key, whichBoolexpr)
endfunction


// <1.24> 保存 音效 到哈希表
function SaveSoundHandleBJ takes sound whichSound, integer key, integer missionKey, hashtable table returns boolean
    return SaveSoundHandle(table, missionKey, key, whichSound)
endfunction


// <1.24> 保存 特效 到哈希表
function SaveEffectHandleBJ takes effect whichEffect, integer key, integer missionKey, hashtable table returns boolean
    return SaveEffectHandle(table, missionKey, key, whichEffect)
endfunction


// <1.24> 保存 单位池 到哈希表
function SaveUnitPoolHandleBJ takes unitpool whichUnitpool, integer key, integer missionKey, hashtable table returns boolean
    return SaveUnitPoolHandle(table, missionKey, key, whichUnitpool)
endfunction


// <1.24> 保存 物品池 到哈希表
function SaveItemPoolHandleBJ takes itempool whichItempool, integer key, integer missionKey, hashtable table returns boolean
    return SaveItemPoolHandle(table, missionKey, key, whichItempool)
endfunction


// <1.24> 保存 任务 到哈希表
function SaveQuestHandleBJ takes quest whichQuest, integer key, integer missionKey, hashtable table returns boolean
    return SaveQuestHandle(table, missionKey, key, whichQuest)
endfunction


// <1.24> 保存 任务要求 到哈希表
function SaveQuestItemHandleBJ takes questitem whichQuestitem, integer key, integer missionKey, hashtable table returns boolean
    return SaveQuestItemHandle(table, missionKey, key, whichQuestitem)
endfunction


// <1.24> 保存 任务失败条件 到哈希表
function SaveDefeatConditionHandleBJ takes defeatcondition whichDefeatcondition, integer key, integer missionKey, hashtable table returns boolean
    return SaveDefeatConditionHandle(table, missionKey, key, whichDefeatcondition)
endfunction


// <1.24> 保存 计时器窗口 到哈希表
function SaveTimerDialogHandleBJ takes timerdialog whichTimerdialog, integer key, integer missionKey, hashtable table returns boolean
    return SaveTimerDialogHandle(table, missionKey, key, whichTimerdialog)
endfunction


// <1.24> 保存 排行榜 到哈希表
function SaveLeaderboardHandleBJ takes leaderboard whichLeaderboard, integer key, integer missionKey, hashtable table returns boolean
    return SaveLeaderboardHandle(table, missionKey, key, whichLeaderboard)
endfunction


// <1.24> 保存 多面板 到哈希表
function SaveMultiboardHandleBJ takes multiboard whichMultiboard, integer key, integer missionKey, hashtable table returns boolean
    return SaveMultiboardHandle(table, missionKey, key, whichMultiboard)
endfunction


// <1.24> 保存 多面板项目 到哈希表
function SaveMultiboardItemHandleBJ takes multiboarditem whichMultiboarditem, integer key, integer missionKey, hashtable table returns boolean
    return SaveMultiboardItemHandle(table, missionKey, key, whichMultiboarditem)
endfunction


// <1.24> 保存 可追踪物 到哈希表
function SaveTrackableHandleBJ takes trackable whichTrackable, integer key, integer missionKey, hashtable table returns boolean
    return SaveTrackableHandle(table, missionKey, key, whichTrackable)
endfunction


// <1.24> 保存 对话框 到哈希表
function SaveDialogHandleBJ takes dialog whichDialog, integer key, integer missionKey, hashtable table returns boolean
    return SaveDialogHandle(table, missionKey, key, whichDialog)
endfunction


// <1.24> 保存 对话框按钮 到哈希表
function SaveButtonHandleBJ takes button whichButton, integer key, integer missionKey, hashtable table returns boolean
    return SaveButtonHandle(table, missionKey, key, whichButton)
endfunction


// <1.24> 保存 漂浮文字 到哈希表
function SaveTextTagHandleBJ takes texttag whichTexttag, integer key, integer missionKey, hashtable table returns boolean
    return SaveTextTagHandle(table, missionKey, key, whichTexttag)
endfunction


// <1.24> 保存 闪电效果 到哈希表
function SaveLightningHandleBJ takes lightning whichLightning, integer key, integer missionKey, hashtable table returns boolean
    return SaveLightningHandle(table, missionKey, key, whichLightning)
endfunction


// <1.24> 保存 图像 到哈希表
function SaveImageHandleBJ takes image whichImage, integer key, integer missionKey, hashtable table returns boolean
    return SaveImageHandle(table, missionKey, key, whichImage)
endfunction


// <1.24> 保存 地面纹理变化 到哈希表
function SaveUbersplatHandleBJ takes ubersplat whichUbersplat, integer key, integer missionKey, hashtable table returns boolean
    return SaveUbersplatHandle(table, missionKey, key, whichUbersplat)
endfunction


// <1.24> 保存 区域(不规则) 到哈希表
function SaveRegionHandleBJ takes region whichRegion, integer key, integer missionKey, hashtable table returns boolean
    return SaveRegionHandle(table, missionKey, key, whichRegion)
endfunction


// <1.24> 保存 迷雾状态 到哈希表
function SaveFogStateHandleBJ takes fogstate whichFogState, integer key, integer missionKey, hashtable table returns boolean
    return SaveFogStateHandle(table, missionKey, key, whichFogState)
endfunction


// <1.24> 保存 可见度修正器 到哈希表
function SaveFogModifierHandleBJ takes fogmodifier whichFogModifier, integer key, integer missionKey, hashtable table returns boolean
    return SaveFogModifierHandle(table, missionKey, key, whichFogModifier)
endfunction

// <1.24> 保存 句柄 到哈希表
function SaveAgentHandleBJ takes agent whichAgent, integer key, integer missionKey, hashtable table returns boolean
    return SaveAgentHandle(table, missionKey, key, whichAgent)
endfunction

// <1.24> 保存 哈希表 到哈希表
function SaveHashtableHandleBJ takes hashtable whichHashtable, integer key, integer missionKey, hashtable table returns boolean
    return SaveHashtableHandle(table, missionKey, key, whichHashtable)
endfunction


// 从游戏缓读取实数
function GetStoredRealBJ takes string key, string missionKey, gamecache cache returns real
    //call SyncStoredReal(cache, missionKey, key)
    return GetStoredReal(cache, missionKey, key)
endfunction


// 从游戏缓读取整数
function GetStoredIntegerBJ takes string key, string missionKey, gamecache cache returns integer
    //call SyncStoredInteger(cache, missionKey, key)
    return GetStoredInteger(cache, missionKey, key)
endfunction


// 从游戏缓读取布尔值
function GetStoredBooleanBJ takes string key, string missionKey, gamecache cache returns boolean
    //call SyncStoredBoolean(cache, missionKey, key)
    return GetStoredBoolean(cache, missionKey, key)
endfunction


// 从游戏缓读取字符串
function GetStoredStringBJ takes string key, string missionKey, gamecache cache returns string
    local string s

    //call SyncStoredString(cache, missionKey, key)
    set s = GetStoredString(cache, missionKey, key)
    if(s == null) then
        return ""
    else
        return s
    endif
endfunction


// <1.24> 从哈希表提取实数
function LoadRealBJ takes integer key, integer missionKey, hashtable table returns real
    //call SyncStoredReal(table, missionKey, key)
    return LoadReal(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取整数
function LoadIntegerBJ takes integer key, integer missionKey, hashtable table returns integer
    //call SyncStoredInteger(table, missionKey, key)
    return LoadInteger(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取布尔值
function LoadBooleanBJ takes integer key, integer missionKey, hashtable table returns boolean
    //call SyncStoredBoolean(table, missionKey, key)
    return LoadBoolean(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取字符串
function LoadStringBJ takes integer key, integer missionKey, hashtable table returns string
    local string s

    //call SyncStoredString(table, missionKey, key)
    set s = LoadStr(table, missionKey, key)
    if(s == null) then
        return ""
    else
        return s
    endif
endfunction


// <1.24> 从哈希表提取玩家
function LoadPlayerHandleBJ takes integer key, integer missionKey, hashtable table returns player
    return LoadPlayerHandle(table, missionKey, key)
endfunction

// <1.24> 从哈希表提取微件/实体（单位/物品/可破坏物）
function LoadWidgetHandleBJ takes integer key, integer missionKey, hashtable table returns widget
    return LoadWidgetHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取可破坏物
function LoadDestructableHandleBJ takes integer key, integer missionKey, hashtable table returns destructable
    return LoadDestructableHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取物品
function LoadItemHandleBJ takes integer key, integer missionKey, hashtable table returns item
    return LoadItemHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取单位
function LoadUnitHandleBJ takes integer key, integer missionKey, hashtable table returns unit
    return LoadUnitHandle(table, missionKey, key)
endfunction

// <1.24> 从哈希表提取技能
function LoadAbilityHandleBJ takes integer key, integer missionKey, hashtable table returns ability
    return LoadAbilityHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取计时器
function LoadTimerHandleBJ takes integer key, integer missionKey, hashtable table returns timer
    return LoadTimerHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取触发器
function LoadTriggerHandleBJ takes integer key, integer missionKey, hashtable table returns trigger
    return LoadTriggerHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取触发条件
function LoadTriggerConditionHandleBJ takes integer key, integer missionKey, hashtable table returns triggercondition
    return LoadTriggerConditionHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取触发器动作
function LoadTriggerActionHandleBJ takes integer key, integer missionKey, hashtable table returns triggeraction
    return LoadTriggerActionHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取触发事件
function LoadTriggerEventHandleBJ takes integer key, integer missionKey, hashtable table returns event
    return LoadTriggerEventHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取玩家组
function LoadForceHandleBJ takes integer key, integer missionKey, hashtable table returns force
    return LoadForceHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取单位组
// 若仍需使用该单位组，请勿排泄
function LoadGroupHandleBJ takes integer key, integer missionKey, hashtable table returns group
    return LoadGroupHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取点
// 若仍需使用该点，请勿排泄
function LoadLocationHandleBJ takes integer key, integer missionKey, hashtable table returns location
    return LoadLocationHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取区域(矩形)
// 若仍需使用该区域，请勿排泄
function LoadRectHandleBJ takes integer key, integer missionKey, hashtable table returns rect
    return LoadRectHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取条件表达式
function LoadBooleanExprHandleBJ takes integer key, integer missionKey, hashtable table returns boolexpr
    return LoadBooleanExprHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取音效
function LoadSoundHandleBJ takes integer key, integer missionKey, hashtable table returns sound
    return LoadSoundHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取特效
function LoadEffectHandleBJ takes integer key, integer missionKey, hashtable table returns effect
    return LoadEffectHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取单位池
function LoadUnitPoolHandleBJ takes integer key, integer missionKey, hashtable table returns unitpool
    return LoadUnitPoolHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取物品池
function LoadItemPoolHandleBJ takes integer key, integer missionKey, hashtable table returns itempool
    return LoadItemPoolHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取任务
function LoadQuestHandleBJ takes integer key, integer missionKey, hashtable table returns quest
    return LoadQuestHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取任务要求
function LoadQuestItemHandleBJ takes integer key, integer missionKey, hashtable table returns questitem
    return LoadQuestItemHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取（任务）失败条件
function LoadDefeatConditionHandleBJ takes integer key, integer missionKey, hashtable table returns defeatcondition
    return LoadDefeatConditionHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取计时器窗口
function LoadTimerDialogHandleBJ takes integer key, integer missionKey, hashtable table returns timerdialog
    return LoadTimerDialogHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取排行榜
function LoadLeaderboardHandleBJ takes integer key, integer missionKey, hashtable table returns leaderboard
    return LoadLeaderboardHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取多面板
function LoadMultiboardHandleBJ takes integer key, integer missionKey, hashtable table returns multiboard
    return LoadMultiboardHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取多面板项目
function LoadMultiboardItemHandleBJ takes integer key, integer missionKey, hashtable table returns multiboarditem
    return LoadMultiboardItemHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取可追踪物
function LoadTrackableHandleBJ takes integer key, integer missionKey, hashtable table returns trackable
    return LoadTrackableHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取对话框
function LoadDialogHandleBJ takes integer key, integer missionKey, hashtable table returns dialog
    return LoadDialogHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取对话框按钮
function LoadButtonHandleBJ takes integer key, integer missionKey, hashtable table returns button
    return LoadButtonHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取漂浮文字
function LoadTextTagHandleBJ takes integer key, integer missionKey, hashtable table returns texttag
    return LoadTextTagHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取闪电效果
function LoadLightningHandleBJ takes integer key, integer missionKey, hashtable table returns lightning
    return LoadLightningHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取图象
function LoadImageHandleBJ takes integer key, integer missionKey, hashtable table returns image
    return LoadImageHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取地面纹理变化
function LoadUbersplatHandleBJ takes integer key, integer missionKey, hashtable table returns ubersplat
    return LoadUbersplatHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取区域(不规则)
// 如仍需使用该区域，请勿排泄
function LoadRegionHandleBJ takes integer key, integer missionKey, hashtable table returns region
    return LoadRegionHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取迷雾状态
function LoadFogStateHandleBJ takes integer key, integer missionKey, hashtable table returns fogstate
    return LoadFogStateHandle(table, missionKey, key)
endfunction


// <1.24> 从哈希表提取可见度修正器
function LoadFogModifierHandleBJ takes integer key, integer missionKey, hashtable table returns fogmodifier
    return LoadFogModifierHandle(table, missionKey, key)
endfunction

// <1.24> 从哈希表提取哈希表
function LoadHashtableHandleBJ takes integer key, integer missionKey, hashtable table returns hashtable
    return LoadHashtableHandle(table, missionKey, key)
endfunction


// 重新存储单位到游戏缓存 (指定朝向角度)
function RestoreUnitLocFacingAngleBJ takes string key, string missionKey, gamecache cache, player forWhichPlayer, location loc, real facing returns unit
    //call SyncStoredUnit(cache, missionKey, key)
    set bj_lastLoadedUnit = RestoreUnit(cache, missionKey, key, forWhichPlayer, GetLocationX(loc), GetLocationY(loc), facing)
    return bj_lastLoadedUnit
endfunction


// 重新存储单位到游戏缓存 (指定朝向)
function RestoreUnitLocFacingPointBJ takes string key, string missionKey, gamecache cache, player forWhichPlayer, location loc, location lookAt returns unit
    //call SyncStoredUnit(cache, missionKey, key)
    return RestoreUnitLocFacingAngleBJ(key, missionKey, cache, forWhichPlayer, loc, AngleBetweenPoints(loc, lookAt))
endfunction


// 获取从游戏缓存最后读取的单位
function GetLastRestoredUnitBJ takes nothing returns unit
    return bj_lastLoadedUnit
endfunction


// 清空游戏缓存
// 清空指定游戏缓存下所有类别
function FlushGameCacheBJ takes gamecache cache returns nothing
    call FlushGameCache(cache)
endfunction


// 清空游戏缓存（指定类别）
// 仅清空指定缓存的指定类别
function FlushStoredMissionBJ takes string missionKey, gamecache cache returns nothing
    call FlushStoredMission(cache, missionKey)
endfunction


// <1.24> 清空哈希表
// 清空整张表
function FlushParentHashtableBJ takes hashtable table returns nothing
    call FlushParentHashtable(table)
endfunction


// <1.24> 清空哈希表（指定主索引）
// 仅清空指定索引
function FlushChildHashtableBJ takes integer missionKey, hashtable table returns nothing
    call FlushChildHashtable(table, missionKey)
endfunction


// 判断游戏缓存是否存有数据
function HaveStoredValue takes string key, integer valueType, string missionKey, gamecache cache returns boolean
    if(valueType == bj_GAMECACHE_BOOLEAN) then
        return HaveStoredBoolean(cache, missionKey, key)
    elseif(valueType == bj_GAMECACHE_INTEGER) then
        return HaveStoredInteger(cache, missionKey, key)
    elseif(valueType == bj_GAMECACHE_REAL) then
        return HaveStoredReal(cache, missionKey, key)
    elseif(valueType == bj_GAMECACHE_UNIT) then
        return HaveStoredUnit(cache, missionKey, key)
    elseif(valueType == bj_GAMECACHE_STRING) then
        return HaveStoredString(cache, missionKey, key)
    else
        // Unrecognized value type - ignore the request.
        return false
    endif
endfunction


// <1.24> 判断哈希表是否存有数据
function HaveSavedValue takes integer key, integer valueType, integer missionKey, hashtable table returns boolean
    if(valueType == bj_HASHTABLE_BOOLEAN) then
        return HaveSavedBoolean(table, missionKey, key)
    elseif(valueType == bj_HASHTABLE_INTEGER) then
        return HaveSavedInteger(table, missionKey, key)
    elseif(valueType == bj_HASHTABLE_REAL) then
        return HaveSavedReal(table, missionKey, key)
    elseif(valueType == bj_HASHTABLE_STRING) then
        return HaveSavedString(table, missionKey, key)
    elseif(valueType == bj_HASHTABLE_HANDLE) then
        return HaveSavedHandle(table, missionKey, key)
    else
        // Unrecognized value type - ignore the request.
        return false
    endif
endfunction


// 显示/隐藏 自定义战役按钮
function ShowCustomCampaignButton takes boolean show, integer whichButton returns nothing
    call SetCustomCampaignButtonVisible(whichButton - 1, show)
endfunction


// 查询自定义战役按钮是否可见
function IsCustomCampaignButtonVisibile takes integer whichButton returns boolean
    return GetCustomCampaignButtonVisible(whichButton - 1)
endfunction


// 创建战役检查点（自动）存档
// @param doCheckpointHint 是否显示自动存档提示
// Placeholder function for auto save feature
function SaveGameCheckPointBJ takes string mapSaveName, boolean doCheckpointHint returns nothing
	call SaveGameCheckpoint(mapSaveName, doCheckpointHint)
endfunction


// 读取存档
function LoadGameBJ takes string loadFileName, boolean doScoreScreen returns nothing
    call LoadGame(loadFileName, doScoreScreen)
endfunction


// 存档并设置下一张地图
function SaveAndChangeLevelBJ takes string saveFileName, string newLevel, boolean doScoreScreen returns nothing
    call SaveGame(saveFileName)
    call ChangeLevel(newLevel, doScoreScreen)
endfunction


// 存档并读档
function SaveAndLoadGameBJ takes string saveFileName, string loadFileName, boolean doScoreScreen returns nothing
    call SaveGame(saveFileName)
    call LoadGame(loadFileName, doScoreScreen)
endfunction


// 重命名存档文件夹
function RenameSaveDirectoryBJ takes string sourceDirName, string destDirName returns boolean
    return RenameSaveDirectory(sourceDirName, destDirName)
endfunction


// 删除存档文件夹
function RemoveSaveDirectoryBJ takes string sourceDirName returns boolean
    return RemoveSaveDirectory(sourceDirName)
endfunction


// 复制存档
function CopySaveGameBJ takes string sourceSaveName, string destSaveName returns boolean
    return CopySaveGame(sourceSaveName, destSaveName)
endfunction



//***************************************************************************
//*
//*  Miscellaneous Utility Functions
//*
//***************************************************************************

// 获取指定玩家出生点的 X 坐标
function GetPlayerStartLocationX takes player whichPlayer returns real
    return GetStartLocationX(GetPlayerStartLocation(whichPlayer))
endfunction

// 获取指定玩家出生点的 Y 坐标
function GetPlayerStartLocationY takes player whichPlayer returns real
    return GetStartLocationY(GetPlayerStartLocation(whichPlayer))
endfunction


// 获取玩家出生点
// 会创建点，用完请注意排泄
function GetPlayerStartLocationLoc takes player whichPlayer returns location
    return GetStartLocationLoc(GetPlayerStartLocation(whichPlayer))
endfunction


// 获取区域中心（指定区域）
// 会创建点，用完请注意排泄
function GetRectCenter takes rect whichRect returns location
    return Location(GetRectCenterX(whichRect), GetRectCenterY(whichRect))
endfunction

// 查询玩家槽状态是否指定状态
function IsPlayerSlotState takes player whichPlayer, playerslotstate whichState returns boolean
    return GetPlayerSlotState(whichPlayer) == whichState
endfunction

// 获取淡出时间（整数）
// @param seconds 不为0时返回 128 / R2I(seconds) ，为0时返回10000
function GetFadeFromSeconds takes real seconds returns integer
    if(seconds != 0) then
        return 128 / R2I(seconds)
    endif
    return 10000
endfunction

// 获取淡出时间（实数）
// @param seconds 不为0时返回 128.00 / R2I(seconds) ，为0时返回10000.00
function GetFadeFromSecondsAsReal takes real seconds returns real
    if(seconds != 0) then
        return 128.00 / seconds
    endif
    return 10000.00
endfunction

// 设置玩家状态（增加玩家属性值）
function AdjustPlayerStateSimpleBJ takes player whichPlayer, playerstate whichPlayerState, integer delta returns nothing
    call SetPlayerState(whichPlayer, whichPlayerState, GetPlayerState(whichPlayer, whichPlayerState) + delta)
endfunction


// 增加玩家属性值
function AdjustPlayerStateBJ takes integer delta, player whichPlayer, playerstate whichPlayerState returns nothing
    // If the change was positive, apply the difference to the player's
    // gathered resources property as well.
    if(delta > 0) then
        if(whichPlayerState == PLAYER_STATE_RESOURCE_GOLD) then
            call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_GOLD_GATHERED, delta)
        elseif(whichPlayerState == PLAYER_STATE_RESOURCE_LUMBER) then
            call AdjustPlayerStateSimpleBJ(whichPlayer, PLAYER_STATE_LUMBER_GATHERED, delta)
        endif
    endif

    call AdjustPlayerStateSimpleBJ(whichPlayer, whichPlayerState, delta)
endfunction

// 设置玩家状态（value 减去当前状态）
function SetPlayerStateBJ takes player whichPlayer, playerstate whichPlayerState, integer value returns nothing
    local integer oldValue = GetPlayerState(whichPlayer, whichPlayerState)
    call AdjustPlayerStateBJ(value - oldValue, whichPlayer, whichPlayerState)
endfunction


// 打开/关闭 玩家状态
function SetPlayerFlagBJ takes playerstate whichPlayerFlag, boolean flag, player whichPlayer returns nothing
    call SetPlayerState(whichPlayer, whichPlayerFlag, IntegerTertiaryOp(flag, 1, 0))
endfunction


// 设置玩家税率
// @param whichResource 黄金或木材[PLAYER_STATE_RESOURCE_GOLD，PLAYER_STATE_RESOURCE_LUMBER]
// @param sourcePlayer 纳税玩家
// @param otherPlayer 收税玩家
function SetPlayerTaxRateBJ takes integer rate, playerstate whichResource, player sourcePlayer, player otherPlayer returns nothing
    call SetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource, rate)
endfunction


// 获取玩家税率
// @param whichResource 黄金或木材[PLAYER_STATE_RESOURCE_GOLD，PLAYER_STATE_RESOURCE_LUMBER]
// @param sourcePlayer 纳税玩家
// @param otherPlayer 收税玩家
function GetPlayerTaxRateBJ takes playerstate whichResource, player sourcePlayer, player otherPlayer returns integer
    return GetPlayerTaxRate(sourcePlayer, otherPlayer, whichResource)
endfunction


// 查询玩家状态是否为1（指定状态）
function IsPlayerFlagSetBJ takes playerstate whichPlayerFlag, player whichPlayer returns boolean
    return GetPlayerState(whichPlayer, whichPlayerFlag) == 1
endfunction


// 增加金矿黄金数量
function AddResourceAmountBJ takes integer delta, unit whichUnit returns nothing
    call AddResourceAmount(whichUnit, delta)
endfunction


// 获取玩家索引
function GetConvertedPlayerId takes player whichPlayer returns integer
    return GetPlayerId(whichPlayer) + 1
endfunction


// 转换玩家索引成玩家
function ConvertedPlayer takes integer convertedPlayerId returns player
    return Player(convertedPlayerId - 1)
endfunction


// 获取区域宽度（指定区域）
function GetRectWidthBJ takes rect r returns real
    return GetRectMaxX(r) - GetRectMinX(r)
endfunction


// 获取区域高度（指定区域）
function GetRectHeightBJ takes rect r returns real
    return GetRectMaxY(r) - GetRectMinY(r)
endfunction


// 替换指定金矿为指定玩家的不死族金矿
// Replaces a gold mine with a blighted gold mine for the given player.
function BlightGoldMineForPlayerBJ takes unit goldMine, player whichPlayer returns unit
    local real mineX
    local real mineY
    local integer mineGold
    local unit newMine

    // Make sure we're replacing a Gold Mine and not some other type of unit.
    if GetUnitTypeId(goldMine) != 'ngol' then
        return null
    endif

    // Save the Gold Mine's properties and remove it.
    set mineX = GetUnitX(goldMine)
    set mineY = GetUnitY(goldMine)
    set mineGold = GetResourceAmount(goldMine)
    call RemoveUnit(goldMine)

    // Create a Haunted Gold Mine to replace the Gold Mine.
    set newMine = CreateBlightedGoldmine(whichPlayer, mineX, mineY, bj_UNIT_FACING)
    call SetResourceAmount(newMine, mineGold)
    return newMine
endfunction

// 替换指定金矿为指定玩家的不死族金矿，并使用最后替换的金矿变量获取该单位
function BlightGoldMineForPlayer takes unit goldMine, player whichPlayer returns unit
    set bj_lastHauntedGoldMine = BlightGoldMineForPlayerBJ(goldMine, whichPlayer)
    return bj_lastHauntedGoldMine
endfunction


// 获取最后建造的不死族金矿
function GetLastHauntedGoldMine takes nothing returns unit
    return bj_lastHauntedGoldMine
endfunction


// 查询指定点是否被荒芜地表（不死族）覆盖
function IsPointBlightedBJ takes location where returns boolean
    return IsPointBlighted(GetLocationX(where), GetLocationY(where))
endfunction


// 设置玩家颜色动作
function SetPlayerColorBJEnum takes nothing returns nothing
    call SetUnitColor(GetEnumUnit(), bj_setPlayerTargetColor)
endfunction

// 设置玩家颜色
// @param changeExisting 为真时设置
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


// 设置训练/建造单位可用性
function SetPlayerUnitAvailableBJ takes integer unitId, boolean allowed, player whichPlayer returns nothing
    if allowed then
        call SetPlayerTechMaxAllowed(whichPlayer, unitId, - 1)
    else
        call SetPlayerTechMaxAllowed(whichPlayer, unitId, 0)
    endif
endfunction


// 锁定游戏速度
function LockGameSpeedBJ takes nothing returns nothing
    call SetMapFlag(MAP_LOCK_SPEED, true)
endfunction


// 解除游戏速度锁定
function UnlockGameSpeedBJ takes nothing returns nothing
    call SetMapFlag(MAP_LOCK_SPEED, false)
endfunction

// 发布命令（指定单位）
function IssueTargetOrderBJ takes unit whichUnit, string order, widget targetWidget returns boolean
    return IssueTargetOrder(whichUnit, order, targetWidget)
endfunction

// 发布命令（指定点）
function IssuePointOrderLocBJ takes unit whichUnit, string order, location whichLocation returns boolean
    return IssuePointOrderLoc(whichUnit, order, whichLocation)
endfunction


// 发布命令（指定可破坏物）
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
function IssueTargetDestructableOrder takes unit whichUnit, string order, widget targetWidget returns boolean
    return IssueTargetOrder(whichUnit, order, targetWidget)
endfunction

// 发布命令（指定物品）
function IssueTargetItemOrder takes unit whichUnit, string order, widget targetWidget returns boolean
    return IssueTargetOrder(whichUnit, order, targetWidget)
endfunction

// 发布命令（无目标）
function IssueImmediateOrderBJ takes unit whichUnit, string order returns boolean
    return IssueImmediateOrder(whichUnit, order)
endfunction

// 发布（单位组）命令（指定单位）
function GroupTargetOrderBJ takes group whichGroup, string order, widget targetWidget returns boolean
    return GroupTargetOrder(whichGroup, order, targetWidget)
endfunction

// 发布（单位组）命令（指定点）
function GroupPointOrderLocBJ takes group whichGroup, string order, location whichLocation returns boolean
    return GroupPointOrderLoc(whichGroup, order, whichLocation)
endfunction

// 发布（单位组）命令（无目标）
function GroupImmediateOrderBJ takes group whichGroup, string order returns boolean
    return GroupImmediateOrder(whichGroup, order)
endfunction


// 发布（单位组）命令（指定可破坏物）
// Two distinct trigger actions can't share the same function name, so this
// dummy function simply mimics the behavior of an existing call.
function GroupTargetDestructableOrder takes group whichGroup, string order, widget targetWidget returns boolean
    return GroupTargetOrder(whichGroup, order, targetWidget)
endfunction

// 发布（单位组）命令（指定物品）
function GroupTargetItemOrder takes group whichGroup, string order, widget targetWidget returns boolean
    return GroupTargetOrder(whichGroup, order, targetWidget)
endfunction


// 获取死亡的可破坏物
function GetDyingDestructable takes nothing returns destructable
    return GetTriggerDestructable()
endfunction


// Rally point setting

// 设置 集结点（指定点）
function SetUnitRallyPoint takes unit whichUnit, location targPos returns nothing
    call IssuePointOrderLocBJ(whichUnit, "setrally", targPos)
endfunction


// 设置 集结点（指定单位）
function SetUnitRallyUnit takes unit whichUnit, unit targUnit returns nothing
    call IssueTargetOrder(whichUnit, "setrally", targUnit)
endfunction


// 设置 集结点（指定可破坏物）
function SetUnitRallyDestructable takes unit whichUnit, destructable targDest returns nothing
    call IssueTargetOrder(whichUnit, "setrally", targDest)
endfunction


// 储存死亡单位/物品/可破坏物
// 将 bj_lastDyingWidget 设置为触发单位/物品/可破坏物
// Utility function for use by editor-generated item drop table triggers.
// This function is added as an action to all destructable drop triggers,
// so that a widget drop may be differentiated from a unit drop.
function SaveDyingWidget takes nothing returns nothing
    set bj_lastDyingWidget = GetTriggereWidgt()
endfunction


// 创建/删除 荒芜地表（不死族）（指定矩形区域）
function SetBlightRectBJ takes boolean addBlight, player whichPlayer, rect r returns nothing
    call SetBlightRect(whichPlayer, r, addBlight)
endfunction


// 创建/删除 荒芜地表（不死族）（指定圆形范围）
function SetBlightRadiusLocBJ takes boolean addBlight, player whichPlayer, location loc, real radius returns nothing
    call SetBlightLoc(whichPlayer, loc, radius, addBlight)
endfunction


// 获取技能名称
function GetAbilityName takes integer abilcode returns string
    return GetObjectName(abilcode)
endfunction


//***************************************************************************
//*
//*  Melee Template Visibility Settings
//*
//***************************************************************************


// 设置初始时间
function MeleeStartingVisibility takes nothing returns nothing
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


// 设置初始资源
function MeleeStartingResources takes nothing returns nothing
    local integer index
    local player indexPlayer
    local version v
    local integer startingGold
    local integer startingLumber

    set v = VersionGet()
    if(v == VERSION_REIGN_OF_CHAOS) then
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
        if(GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
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

// 设置玩家科技上限
function ReducePlayerTechMaxAllowed takes player whichPlayer, integer techId, integer limit returns nothing
    local integer oldMax = GetPlayerTechMaxAllowed(whichPlayer, techId)

    // A value of -1 is used to indicate no limit, so check for that as well.
    if(oldMax < 0 or oldMax > limit) then
        call SetPlayerTechMaxAllowed(whichPlayer, techId, limit)
    endif
endfunction


// 设置（所有玩家的）英雄数量限制（每种最多同时训练1个）（默认只针对24种对战英雄）
function MeleeStartingHeroLimit takes nothing returns nothing
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

// 获取匹配单位的单位类型是否为英雄
function MeleeTrainedUnitIsHeroBJFilter takes nothing returns boolean
    return IsUnitType(GetFilterUnit(), UNIT_TYPE_HERO)
endfunction


// 创建（英雄）初始物品（指定单位）
// 物品为回城卷轴
// 该程序会自动判断已创建初始物品的次数，确保不会超限
// The first N heroes trained or hired for each player start off with a
// standard set of items.  This is currently:
//   - 1x Scroll of Town Portal
function MeleeGrantItemsToHero takes unit whichUnit returns nothing
    local integer owner = GetPlayerId(GetOwningPlayer(whichUnit))

    // If we haven't twinked N heroes for this player yet, twink away.
    if(bj_meleeTwinkedHeroes [ owner ] < bj_MELEE_MAX_TWINKED_HEROES) then
        call UnitAddItemById(whichUnit, 'stwp')
        set bj_meleeTwinkedHeroes [ owner ] = bj_meleeTwinkedHeroes [ owner ] + 1
    endif
endfunction

// 创建初始物品（祭坛训练的英雄）
// 物品为回城卷轴
function MeleeGrantItemsToTrainedHero takes nothing returns nothing
    call MeleeGrantItemsToHero(GetTrainedUnit())
endfunction

// 创建初始物品（酒馆购买的英雄）
// 物品为回城卷轴
function MeleeGrantItemsToHiredHero takes nothing returns nothing
    call MeleeGrantItemsToHero(GetSoldUnit())
endfunction


// 创建初始物品（首发英雄）
// 物品为回城卷轴
function MeleeGrantHeroItems takes nothing returns nothing
    local integer index
    local trigger trig

    // Initialize the twinked hero counts.
    set index = 0
    loop
        set bj_meleeTwinkedHeroes [ index ] = 0

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

// 删除当前出生点中立生物
// 中立敌对玩家 或 中立被动玩家的非建筑类型的单位，含守卫
function MeleeClearExcessUnit takes nothing returns nothing
    local unit theUnit = GetEnumUnit()
    local integer owner = GetPlayerId(GetOwningPlayer(theUnit))

    if(owner == PLAYER_NEUTRAL_AGGRESSIVE) then
        // Remove any Neutral Hostile units from the area.
        call RemoveUnit(GetEnumUnit())
    elseif(owner == PLAYER_NEUTRAL_PASSIVE) then
        // Remove non-structure Neutral Passive units from the area.
        if not IsUnitType(theUnit, UNIT_TYPE_STRUCTURE) then
            call RemoveUnit(GetEnumUnit())
        endif
    endif
endfunction

// 选取当前出生点的多余单位
function MeleeClearNearbyUnits takes real x, real y, real range returns nothing
    local group nearbyUnits
    
    set nearbyUnits = CreateGroup()
    call GroupEnumUnitsInRange(nearbyUnits, x, y, range, null)
    call ForGroup(nearbyUnits, function MeleeClearExcessUnit)
    call DestroyGroup(nearbyUnits)
endfunction


// 删除所有玩家出生点多余单位
function MeleeClearExcessUnits takes nothing returns nothing
    local integer index
    local real locX
    local real locY
    local player indexPlayer

    set index = 0
    loop
        set indexPlayer = Player(index)

        // If the player slot is being used, clear any nearby creeps.
        if(GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
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

// 搜索玩家出生点附近的金矿触发器动作
function MeleeEnumFindNearestMine takes nothing returns nothing
    local unit enumUnit = GetEnumUnit()
    local real dist
    local location unitLoc

    if(GetUnitTypeId(enumUnit) == 'ngol') then
        set unitLoc = GetUnitLoc(enumUnit)
        set dist = DistanceBetweenPoints(unitLoc, bj_meleeNearestMineToLoc)
        call RemoveLocation(unitLoc)

        // If this is our first mine, or the closest thusfar, use it instead.
        if(bj_meleeNearestMineDist < 0) or(dist < bj_meleeNearestMineDist) then
            set bj_meleeNearestMine = enumUnit
            set bj_meleeNearestMineDist = dist
        endif
    endif
endfunction

// 搜索玩家出生点附近的金矿触发器
// 主要用于对战初始化时创建被缠绕的金矿或闹鬼金矿
function MeleeFindNearestMine takes location src, real range returns unit
    local group nearbyMines

    set bj_meleeNearestMine = null
    set bj_meleeNearestMineDist = - 1
    set bj_meleeNearestMineToLoc = src

    set nearbyMines = CreateGroup()
    call GroupEnumUnitsInRangeOfLoc(nearbyMines, src, range, null)
    call ForGroup(nearbyMines, function MeleeEnumFindNearestMine)
    call DestroyGroup(nearbyMines)

    return bj_meleeNearestMine
endfunction

// 创建随机英雄
// 进入游戏前在高级勾选 使用随机英雄 后，对战地图自动在游戏初始化时触发
function MeleeRandomHeroLoc takes player p, integer id1, integer id2, integer id3, integer id4, location loc returns unit
    local unit hero = null
    local integer roll
    local integer pick
    local version v

    // The selection of heroes is dependant on the game version.
    set v = VersionGet()
    if(v == VERSION_REIGN_OF_CHAOS) then
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
    return hero
endfunction


// 获取极坐标位移点，点src 沿 点src 到 点targ 的方向位移distance ，附带偏移量 deltaAngle
// 会创建点，用完请注意排泄
// Returns a location which is (distance) away from (src) in the direction of (targ).
function MeleeGetProjectedLoc takes location src, location targ, real distance, real deltaAngle returns location
    local real srcX = GetLocationX(src)
    local real srcY = GetLocationY(src)
    local real direction = Atan2(GetLocationY(targ) - srcY, GetLocationX(targ) - srcX) + deltaAngle
    return Location(srcX + distance * Cos(direction), srcY + distance * Sin(direction))
endfunction

// 取区间值
// val在minVal~maxVal之外时，若小于minVal，则返回minVal，若大于maxVal，则返回maxVal，在区间内时返回val
function MeleeGetNearestValueWithin takes real val, real minVal, real maxVal returns real
    if(val < minVal) then
        return minVal
    elseif(val > maxVal) then
        return maxVal
    else
        return val
    endif
endfunction

// 获取区域内的点（不影响输入点）
// 当输入点在区域内时，会返回一个相同坐标的新点，当输入点在区域外时，会返回距离输入点最近的区域边界上的新点
// 会创建点，用完请注意排泄
function MeleeGetLocWithinRect takes location src, rect r returns location
    local real withinX = MeleeGetNearestValueWithin(GetLocationX(src), GetRectMinX(r), GetRectMaxX(r))
    local real withinY = MeleeGetNearestValueWithin(GetLocationY(src), GetRectMinY(r), GetRectMaxY(r))
    return Location(withinX, withinY)
endfunction


// Starting Units for Human Players
//   - 1 Town Hall, placed at start location
//   - 5 Peasants, placed between start location and nearest gold mine

// 创建初始单位 - 人族
// 创建点 - 玩家出生点
// 默认包含5个农民，一个一本基地，若启用随机英雄会随机创建1个英雄
function MeleeStartingUnitsHuman takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
    local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real unitSpacing = 64.00
    local unit nearestMine
    local location nearMineLoc
    local location heroLoc
    local real peonX
    local real peonY
    local unit townHall = null

    if(doPreload) then
        call Preloader("scripts\\HumanMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if(nearestMine != null) then
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

    if(townHall != null) then
        call UnitAddAbilityBJ('Amic', townHall)
        call UnitMakeAbilityPermanentBJ(true, 'Amic', townHall)
    endif

    if(doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Hamg', 'Hmkg', 'Hpal', 'Hblm', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if(doCamera) then
        // Center the camera on the initial Peasants.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction


// Starting Units for Orc Players
//   - 1 Great Hall, placed at start location
//   - 5 Peons, placed between start location and nearest gold mine

// 创建初始单位 - 兽族
// 创建点 - 玩家出生点
// 默认包含5个农民，一个一本基地，若启用随机英雄会随机创建1个英雄
function MeleeStartingUnitsOrc takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
    local boolean useRandomHero = IsMapFlagSet(MAP_RANDOM_HERO)
    local real unitSpacing = 64.00
    local unit nearestMine
    local location nearMineLoc
    local location heroLoc
    local real peonX
    local real peonY

    if(doPreload) then
        call Preloader("scripts\\OrcMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if(nearestMine != null) then
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

    if(doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Obla', 'Ofar', 'Otch', 'Oshd', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if(doCamera) then
        // Center the camera on the initial Peons.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction


// Starting Units for Undead Players
//   - 1 Necropolis, placed at start location
//   - 1 Haunted Gold Mine, placed on nearest gold mine
//   - 3 Acolytes, placed between start location and nearest gold mine
//   - 1 Ghoul, placed between start location and nearest gold mine
//   - Blight, centered on nearest gold mine, spread across a "large area"

// 创建初始单位 - 亡灵
// 创建点 - 玩家出生点
// 默认包含3个农民，1个食尸鬼，一个一本基地，一座闹鬼金矿（如果附近有金矿），若启用随机英雄会随机创建1个英雄
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

    if(doPreload) then
        call Preloader("scripts\\UndeadMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if(nearestMine != null) then
        // Spawn Necropolis at the start location.
        call CreateUnitAtLoc(whichPlayer, 'unpl', startLoc, bj_UNIT_FACING)
        
        // Replace the nearest gold mine with a blighted version.
        set nearestMine = BlightGoldMineForPlayerBJ(nearestMine, whichPlayer)

        // Spawn Ghoul near the Necropolis.
        set nearTownLoc = MeleeGetProjectedLoc(startLoc, GetUnitLoc(nearestMine), 288, 0)
        set ghoulX = GetLocationX(nearTownLoc)
        set ghoulY = GetLocationY(nearTownLoc)
        set bj_ghoul [ GetPlayerId(whichPlayer) ] = CreateUnit(whichPlayer, 'ugho', ghoulX + 0.00 * unitSpacing, ghoulY + 0.00 * unitSpacing, bj_UNIT_FACING)

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

    if(doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Udea', 'Udre', 'Ulic', 'Ucrl', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if(doCamera) then
        // Center the camera on the initial Acolytes.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction


// Starting Units for Night Elf Players
//   - 1 Tree of Life, placed by nearest gold mine, already entangled
//   - 5 Wisps, placed between Tree of Life and nearest gold mine

// 创建初始单位 - 暗夜
// 创建点 - 玩家出生点
// 默认包含5个农民，一个一本基地，一座被缠绕的金矿（如果附近有金矿），若启用随机英雄会随机创建1个英雄
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

    if(doPreload) then
        call Preloader("scripts\\NightElfMelee.pld")
    endif

    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)
    if(nearestMine != null) then
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

    if(doHeroes) then
        // If the "Random Hero" option is set, start the player with a random hero.
        // Otherwise, give them a "free hero" token.
        if useRandomHero then
            call MeleeRandomHeroLoc(whichPlayer, 'Edem', 'Ekee', 'Emoo', 'Ewar', heroLoc)
        else
            call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
        endif
    endif

    if(doCamera) then
        // Center the camera on the initial Wisps.
        call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)
        call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)
    endif
endfunction


// Starting Units for Players Whose Race is Unknown
//   - 12 Sheep, placed randomly around the start location

// 创建初始单位 - 未知种族
// 创建点 - 玩家出生点
// 默认包含12只绵羊，是的，12只绵羊（'nshe'）
// 在1.29或以上版本，建议手动改为24只，此为官方BUG
function MeleeStartingUnitsUnknownRace takes player whichPlayer, location startLoc, boolean doHeroes, boolean doCamera, boolean doPreload returns nothing
    local integer index

    if(doPreload) then
    endif

    set index = 0
    loop
        call CreateUnit(whichPlayer, 'nshe', GetLocationX(startLoc) + GetRandomReal(- 256, 256), GetLocationY(startLoc) + GetRandomReal(- 256, 256), GetRandomReal(0, 360))
        set index = index + 1
        exitwhen index == 12
    endloop

    if(doHeroes) then
        // Give them a "free hero" token, out of pity.
        call SetPlayerState(whichPlayer, PLAYER_STATE_RESOURCE_HERO_TOKENS, bj_MELEE_STARTING_HERO_TOKENS)
    endif

    if(doCamera) then
        // Center the camera on the initial sheep.
        call SetCameraPositionLocForPlayer(whichPlayer, startLoc)
        call SetCameraQuickPositionLocForPlayer(whichPlayer, startLoc)
    endif
endfunction

// 创建对战初始单位（默认四大种族）
function MeleeStartingUnits takes nothing returns nothing
    local integer index
    local player indexPlayer
    local location indexStartLoc
    local race indexRace

    call Preloader("scripts\\SharedMelee.pld")

    set index = 0
    loop
        set indexPlayer = Player(index)
        if(GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set indexStartLoc = GetStartLocationLoc(GetPlayerStartLocation(indexPlayer))
            set indexRace = GetPlayerRace(indexPlayer)

            // Create initial race-specific starting units
            if(indexRace == RACE_HUMAN) then
                call MeleeStartingUnitsHuman(indexPlayer, indexStartLoc, true, true, true)
            elseif(indexRace == RACE_ORC) then
                call MeleeStartingUnitsOrc(indexPlayer, indexStartLoc, true, true, true)
            elseif(indexRace == RACE_UNDEAD) then
                call MeleeStartingUnitsUndead(indexPlayer, indexStartLoc, true, true, true)
            elseif(indexRace == RACE_NIGHTELF) then
                call MeleeStartingUnitsNightElf(indexPlayer, indexStartLoc, true, true, true)
            else
                call MeleeStartingUnitsUnknownRace(indexPlayer, indexStartLoc, true, true, true)
            endif
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
    
endfunction


// 创建初始单位（指定玩家及种族）
// 默认只支持创建4大对战种族的初始单位，其他种族无效
function MeleeStartingUnitsForPlayer takes race whichRace, player whichPlayer, location loc, boolean doHeroes returns nothing
    // Create initial race-specific starting units
    if(whichRace == RACE_HUMAN) then
        call MeleeStartingUnitsHuman(whichPlayer, loc, doHeroes, false, false)
    elseif(whichRace == RACE_ORC) then
        call MeleeStartingUnitsOrc(whichPlayer, loc, doHeroes, false, false)
    elseif(whichRace == RACE_UNDEAD) then
        call MeleeStartingUnitsUndead(whichPlayer, loc, doHeroes, false, false)
    elseif(whichRace == RACE_NIGHTELF) then
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

// 选择并运行对战AI，用于一个种族有多个AI脚本时随机分配不同的脚本
// @param s1~s3 不同的AI脚本文件，系统默认只有s1，当s2或s3不为null时，非新手电脑有几率（随机）使用
function PickMeleeAI takes player num, string s1, string s2, string s3 returns nothing
    local integer pick

    // easy difficulty never uses any custom AI scripts
    // that are designed to be a bit more challenging
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


// 运行对战 AI
function MeleeStartingAI takes nothing returns nothing
    local integer index
    local player indexPlayer
    local race indexRace

    set index = 0
    loop
        set indexPlayer = Player(index)
        if(GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set indexRace = GetPlayerRace(indexPlayer)
            if(GetPlayerController(indexPlayer) == MAP_CONTROL_COMPUTER) then
                // Run a race-specific melee AI script.
                if(indexRace == RACE_HUMAN) then
                    call PickMeleeAI(indexPlayer, "human.ai", null, null)
                elseif(indexRace == RACE_ORC) then
                    call PickMeleeAI(indexPlayer, "orc.ai", null, null)
                elseif(indexRace == RACE_UNDEAD) then
                    call PickMeleeAI(indexPlayer, "undead.ai", null, null)
                    call RecycleGuardPosition(bj_ghoul [ index ])
                elseif(indexRace == RACE_NIGHTELF) then
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

// 锁定单位防守职责
function LockGuardPosition takes unit targ returns nothing
    call SetUnitCreepGuard(targ, true)
endfunction


//***************************************************************************
//*
//*  Melee Template Victory / Defeat Conditions
//*
//***************************************************************************

// 判断指定玩家是否仍有敌人，即判断是否未胜利
function MeleePlayerIsOpponent takes integer playerIndex, integer opponentIndex returns boolean
    local player thePlayer = Player(playerIndex)
    local player theOpponent = Player(opponentIndex)

    // The player himself is not an opponent.
    if(playerIndex == opponentIndex) then
        return false
    endif

    // Unused player slots are not opponents.
    if(GetPlayerSlotState(theOpponent) != PLAYER_SLOT_STATE_PLAYING) then
        return false
    endif

    // Players who are already defeated are not opponents.
    if(bj_meleeDefeated [ opponentIndex ]) then
        return false
    endif

    // Allied players with allied victory set are not opponents.
    if GetPlayerAlliance(thePlayer, theOpponent, ALLIANCE_PASSIVE) then
        if GetPlayerAlliance(theOpponent, thePlayer, ALLIANCE_PASSIVE) then
            if(GetPlayerState(thePlayer, PLAYER_STATE_ALLIED_VICTORY) == 1) then
                if(GetPlayerState(theOpponent, PLAYER_STATE_ALLIED_VICTORY) == 1) then
                    return false
                endif
            endif
        endif
    endif

    return true
endfunction


// Count buildings currently owned by all allies, including the player themself.

// 统计所有盟友（包括玩家自己）拥有的建筑数量
function MeleeGetAllyStructureCount takes player whichPlayer returns integer
    local integer playerIndex
    local integer buildingCount
    local player indexPlayer

    // Count the number of buildings controlled by all not-yet-defeated co-allies.
    set buildingCount = 0
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        // uncomment to cause defeat even if you have control of ally structures, but yours have been nixed
        //if (PlayersAreCoAllied(whichPlayer, indexPlayer) and not bj_meleeDefeated[playerIndex]) then
        if(PlayersAreCoAllied(whichPlayer, indexPlayer)) then
            set buildingCount = buildingCount + GetPlayerStructureCount(indexPlayer, true)
        endif
            
        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    return buildingCount
endfunction


// Count allies, excluding dead players and the player themself.

// 获取盟友数量（指定玩家）（不含失败玩家和玩家自己）
function MeleeGetAllyCount takes player whichPlayer returns integer
    local integer playerIndex
    local integer playerCount
    local player indexPlayer

    // Count the number of not-yet-defeated co-allies.
    set playerCount = 0
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if PlayersAreCoAllied(whichPlayer, indexPlayer) and not bj_meleeDefeated [ playerIndex ] and(whichPlayer != indexPlayer) then
            set playerCount = playerCount + 1
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    return playerCount
endfunction


// 统计所有尚未被击败的盟友（包括玩家自己）建筑数量
// Counts key structures owned by a player and his or her allies, including
// structures currently upgrading or under construction.
// Key structures: Town Hall, Great Hall, Tree of Life, Necropolis
function MeleeGetAllyKeyStructureCount takes player whichPlayer returns integer
    local integer playerIndex
    local player indexPlayer
    local integer keyStructs

    // Count the number of buildings controlled by all not-yet-defeated co-allies.
    set keyStructs = 0
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if(PlayersAreCoAllied(whichPlayer, indexPlayer)) then
            set keyStructs = keyStructs + BlzGetPlayerTownHallCount(indexPlayer)
        endif
            
        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    return keyStructs
endfunction


// Enum: Draw out a specific player.

// 选择胜利玩家做动作，该玩家的获胜方式为系统随机抽签
// 缓存玩家数据，显示胜利对话框
function MeleeDoDrawEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()

    call CachePlayerHeroData(thePlayer)
    call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_TIE, false)
endfunction


// Enum: Victory out a specific player.

// 选择胜利玩家做动作，该玩家的获胜方式为凭实力赢得比赛
// 缓存玩家数据，显示胜利对话框
// 系统还存在一种随机抽取玩家获胜的骚操作
function MeleeDoVictoryEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()
    local integer playerIndex = GetPlayerId(thePlayer)

    if(not bj_meleeVictoried [ playerIndex ]) then
        set bj_meleeVictoried [ playerIndex ] = true
        call CachePlayerHeroData(thePlayer)
        call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_VICTORY, false)
    endif
endfunction


// Defeat out a specific player.

// 失败玩家触发器动作
// 创建失败对话框
function MeleeDoDefeat takes player whichPlayer returns nothing
    set bj_meleeDefeated [ GetPlayerId(whichPlayer) ] = true
    call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, false)
endfunction


// Enum: Defeat out a specific player.

// 选择失败玩家做动作
// 缓存玩家数据，移交玩家所有单位给中立被动玩家，显示失败对话框
function MeleeDoDefeatEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()

    // needs to happen before ownership change
    call CachePlayerHeroData(thePlayer)
    call MakeUnitsPassiveForTeam(thePlayer)
    call MeleeDoDefeat(thePlayer)
endfunction


// A specific player left the game.

// 玩家离开游戏触发器动作
function MeleeDoLeave takes player whichPlayer returns nothing
    if(GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
        call GameOverDialogBJ(whichPlayer, true)
    else
        set bj_meleeDefeated [ GetPlayerId(whichPlayer) ] = true
        call RemovePlayerPreserveUnitsBJ(whichPlayer, PLAYER_GAME_RESULT_DEFEAT, true)
    endif
endfunction


// Remove all observers

// 游戏结束时移除所有裁判及观察者
function MeleeRemoveObservers takes nothing returns nothing
    local integer playerIndex
    local player indexPlayer

    // Give all observers the game over dialog
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        if(IsPlayerObserver(indexPlayer)) then
            call RemovePlayerPreserveUnitsBJ(indexPlayer, PLAYER_GAME_RESULT_NEUTRAL, false)
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop
endfunction


// 胜利检查
// Test all players to determine if a team has won.  For a team to win, all
// remaining (read: undefeated) players need to be co-allied with all other
// remaining players.  If even one player is not allied towards another,
// everyone must be denied victory.
function MeleeCheckForVictors takes nothing returns force
    local integer playerIndex
    local integer opponentIndex
    local force opponentlessPlayers = CreateForce()
    local boolean gameOver = false

    // Check to see if any players have opponents remaining.
    set playerIndex = 0
    loop
        if(not bj_meleeDefeated [ playerIndex ]) then
            // Determine whether or not this player has any remaining opponents.
            set opponentIndex = 0
            loop
                // If anyone has an opponent, noone can be victorious yet.
                if MeleePlayerIsOpponent(playerIndex, opponentIndex) then
                    return CreateForce()
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

    return opponentlessPlayers
endfunction


// （在任意玩家失败时）检查所有玩家的游戏结果（胜利/失败）
// Test each player to determine if anyone has been defeated.
function MeleeCheckForLosersAndVictors takes nothing returns nothing
    local integer playerIndex
    local player indexPlayer
    local force defeatedPlayers = CreateForce()
    local force victoriousPlayers
    local boolean gameOver = false

    // If the game is already over, do nothing
    if(bj_meleeGameOver) then
        return
    endif

    // If the game was disconnected then it is over, in this case we
    // don't want to report results for anyone as they will most likely
    // conflict with the actual game results
    if(GetIntegerGameState(GAME_STATE_DISCONNECTED) != 0) then
        set bj_meleeGameOver = true
        return
    endif

    // Check each player to see if he or she has been defeated yet.
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        if(not bj_meleeDefeated [ playerIndex ] and not bj_meleeVictoried [ playerIndex ]) then
            //call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, 60, "Player"+I2S(playerIndex)+" has "+I2S(MeleeGetAllyStructureCount(indexPlayer))+" ally buildings.")
            if(MeleeGetAllyStructureCount(indexPlayer) <= 0) then

                // Keep track of each defeated player so that we can give
                // them a defeat later.
                call ForceAddPlayer(defeatedPlayers, Player(playerIndex))

                // Set their defeated flag now so MeleeCheckForVictors
                // can detect victors.
                set bj_meleeDefeated [ playerIndex ] = true
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
    if(bj_meleeGameOver) then
        call MeleeRemoveObservers()
    endif
endfunction


// 暴露建造默认提示文本
// 失去全部基地时，系统会提示要在限定时间建造一个一本基地，否则将会暴露，这里控制要建造的单位类型提示文本
// Returns a race-specific "build X or be revealed" message.
function MeleeGetCrippledWarningMessage takes player whichPlayer returns string
    local race r = GetPlayerRace(whichPlayer)

    if(r == RACE_HUMAN) then
        return GetLocalizedString("CRIPPLE_WARNING_HUMAN")
    elseif(r == RACE_ORC) then
        return GetLocalizedString("CRIPPLE_WARNING_ORC")
    elseif(r == RACE_NIGHTELF) then
        return GetLocalizedString("CRIPPLE_WARNING_NIGHTELF")
    elseif(r == RACE_UNDEAD) then
        return GetLocalizedString("CRIPPLE_WARNING_UNDEAD")
    else
        // Unrecognized Race
        return ""
    endif
endfunction


// 暴露建造计时器默认提示文本
// 失去全部基地时，系统会提示要在限定时间建造一个一本基地，否则将会暴露，这里控制计时器的提示文本
// Returns a race-specific "build X" label for cripple timers.
function MeleeGetCrippledTimerMessage takes player whichPlayer returns string
    local race r = GetPlayerRace(whichPlayer)

    if(r == RACE_HUMAN) then
        return GetLocalizedString("CRIPPLE_TIMER_HUMAN")
    elseif(r == RACE_ORC) then
        return GetLocalizedString("CRIPPLE_TIMER_ORC")
    elseif(r == RACE_NIGHTELF) then
        return GetLocalizedString("CRIPPLE_TIMER_NIGHTELF")
    elseif(r == RACE_UNDEAD) then
        return GetLocalizedString("CRIPPLE_TIMER_UNDEAD")
    else
        // Unrecognized Race
        return ""
    endif
endfunction


// 显示默认暴露信息
// 告知所有玩家，哪个玩家因为失去了基地而被暴露位置
// Returns a race-specific "build X" label for cripple timers.
function MeleeGetCrippledRevealedMessage takes player whichPlayer returns string
    return GetLocalizedString("CRIPPLE_REVEALING_PREFIX") + GetPlayerName(whichPlayer) + GetLocalizedString("CRIPPLE_REVEALING_POSTFIX")
endfunction

// 设置指定玩家是否暴露位置（出生点）
function MeleeExposePlayer takes player whichPlayer, boolean expose returns nothing
    local integer playerIndex
    local player indexPlayer
    local force toExposeTo = CreateForce()

    call CripplePlayer(whichPlayer, toExposeTo, false)

    set bj_playerIsExposed [ GetPlayerId(whichPlayer) ] = expose
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        if(not PlayersAreCoAllied(whichPlayer, indexPlayer)) then
            call ForceAddPlayer(toExposeTo, indexPlayer)
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop

    call CripplePlayer(whichPlayer, toExposeTo, expose)
    call DestroyForce(toExposeTo)
endfunction

// 对所有玩家暴露 在规定时间未补造基地玩家 的位置（出生点）
// 默认在对战模式胜负判定规则下运行
function MeleeExposeAllPlayers takes nothing returns nothing
    local integer playerIndex
    local player indexPlayer
    local integer playerIndex2
    local player indexPlayer2
    local force toExposeTo = CreateForce()

    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)

        call ForceClear(toExposeTo)
        call CripplePlayer(indexPlayer, toExposeTo, false)

        set playerIndex2 = 0
        loop
            set indexPlayer2 = Player(playerIndex2)

            if playerIndex != playerIndex2 then
                if(not PlayersAreCoAllied(indexPlayer, indexPlayer2)) then
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

// 暴露计时器倒计时结束
function MeleeCrippledPlayerTimeout takes nothing returns nothing
    local timer expiredTimer = GetExpiredTimer()
    local integer playerIndex
    local player exposedPlayer

    // Determine which player's timer expired.
    set playerIndex = 0
    loop
        if(bj_crippledTimer [ playerIndex ] == expiredTimer) then
            exitwhen true
        endif

        set playerIndex = playerIndex + 1
        exitwhen playerIndex == bj_MAX_PLAYERS
    endloop
    if(playerIndex == bj_MAX_PLAYERS) then
        return
    endif
    set exposedPlayer = Player(playerIndex)

    if(GetLocalPlayer() == exposedPlayer) then
        // Use only local code (no net traffic) within this block to avoid desyncs.

        // Hide the timer window for this player.
        call TimerDialogDisplay(bj_crippledTimerWindows [ playerIndex ], false)
    endif

    // Display a text message to all players, explaining the exposure.
    call DisplayTimedTextToPlayer(GetLocalPlayer(), 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledRevealedMessage(exposedPlayer))

    // Expose the player.
    call MeleeExposePlayer(exposedPlayer, true)
endfunction

// 玩家是否没有基地
// 用于对战胜负判断和暴露提示
function MeleePlayerIsCrippled takes player whichPlayer returns boolean
    local integer playerStructures = GetPlayerStructureCount(whichPlayer, true)
    local integer playerKeyStructures = BlzGetPlayerTownHallCount(whichPlayer)

    // Dead players are not considered to be crippled.
    return(playerStructures > 0) and(playerKeyStructures <= 0)
endfunction


// 检查玩家残余单位
// Test each player to determine if anyone has become crippled.
function MeleeCheckForCrippledPlayers takes nothing returns nothing
    local integer playerIndex
    local player indexPlayer
    local force crippledPlayers = CreateForce()
    local boolean isNowCrippled
    local race indexRace

    // The "finish soon" exposure of all players overrides any "crippled" exposure
    if bj_finishSoonAllExposed then
        return
    endif

    // Check each player to see if he or she has been crippled or uncrippled.
    set playerIndex = 0
    loop
        set indexPlayer = Player(playerIndex)
        set isNowCrippled = MeleePlayerIsCrippled(indexPlayer)

        if(not bj_playerIsCrippled [ playerIndex ] and isNowCrippled) then

            // Player became crippled; start their cripple timer.
            set bj_playerIsCrippled [ playerIndex ] = true
            call TimerStart(bj_crippledTimer [ playerIndex ], bj_MELEE_CRIPPLE_TIMEOUT, false, function MeleeCrippledPlayerTimeout)

            if(GetLocalPlayer() == indexPlayer) then
                // Use only local code (no net traffic) within this block to avoid desyncs.

                // Show the timer window.
                call TimerDialogDisplay(bj_crippledTimerWindows [ playerIndex ], true)

                // Display a warning message.
                call DisplayTimedTextToPlayer(indexPlayer, 0, 0, bj_MELEE_CRIPPLE_MSG_DURATION, MeleeGetCrippledWarningMessage(indexPlayer))
            endif

        elseif(bj_playerIsCrippled [ playerIndex ] and not isNowCrippled) then

            // Player became uncrippled; stop their cripple timer.
            set bj_playerIsCrippled [ playerIndex ] = false
            call PauseTimer(bj_crippledTimer [ playerIndex ])

            if(GetLocalPlayer() == indexPlayer) then
                // Use only local code (no net traffic) within this block to avoid desyncs.

                // Hide the timer window for this player.
                call TimerDialogDisplay(bj_crippledTimerWindows [ playerIndex ], false)

                // Display a confirmation message if the player's team is still alive.
                if(MeleeGetAllyStructureCount(indexPlayer) > 0) then
                    if(bj_playerIsExposed [ playerIndex ]) then
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


// 检查残余单位
// 残余单位：判断玩家当前是否有任意单位存活
// Determine if the lost unit should result in any defeats or victories.
function MeleeCheckLostUnit takes unit lostUnit returns nothing
    local player lostUnitOwner = GetOwningPlayer(lostUnit)

    // We only need to check for mortality if this was the last building.
    if(GetPlayerStructureCount(lostUnitOwner, true) <= 0) then
        call MeleeCheckForLosersAndVictors()
    endif

    // Check if the lost unit has crippled or uncrippled the player.
    // (A team with 0 units is dead, and thus considered uncrippled.)
    call MeleeCheckForCrippledPlayers()
endfunction


// 检查是否需要添加残余单位
// 残余单位：判断玩家当前是否有任意单位存活
// Determine if the gained unit should result in any defeats, victories,
// or cripple-status changes.
function MeleeCheckAddedUnit takes unit addedUnit returns nothing
    local player addedUnitOwner = GetOwningPlayer(addedUnit)

    // If the player was crippled, this unit may have uncrippled him/her.
    if(bj_playerIsCrippled [ GetPlayerId(addedUnitOwner) ]) then
        call MeleeCheckForCrippledPlayers()
    endif
endfunction

// 检查是否需要添加残余单位（取消建筑建造触发）
// 残余单位：判断玩家当前是否有任意单位存活
function MeleeTriggerActionConstructCancel takes nothing returns nothing
    call MeleeCheckLostUnit(GetCancelledStructure())
endfunction

// 检查是否需要添加残余单位（单位死亡触发）
// 残余单位：判断玩家当前是否有任意单位存活
function MeleeTriggerActionUnitDeath takes nothing returns nothing
    if(IsUnitType(GetDyingUnit(), UNIT_TYPE_STRUCTURE)) then
        call MeleeCheckLostUnit(GetDyingUnit())
    endif
endfunction

// 检查是否需要添加残余单位（建造建筑触发）
// 残余单位：判断玩家当前是否有任意单位存活
function MeleeTriggerActionUnitConstructionStart takes nothing returns nothing
    call MeleeCheckAddedUnit(GetConstructingStructure())
endfunction

// 游戏结束时玩家失败触发器
function MeleeTriggerActionPlayerDefeated takes nothing returns nothing
    local player thePlayer = GetTriggerPlayer()
    call CachePlayerHeroData(thePlayer)

    if(MeleeGetAllyCount(thePlayer) > 0) then
        // If at least one ally is still alive and kicking, share units with
        // them and proceed with death.
        call ShareEverythingWithTeam(thePlayer)
        if(not bj_meleeDefeated [ GetPlayerId(thePlayer) ]) then
            call MeleeDoDefeat(thePlayer)
        endif
    else
        // If no living allies remain, swap all units and buildings over to
        // neutral_passive and proceed with death.
        call MakeUnitsPassiveForTeam(thePlayer)
        if(not bj_meleeDefeated [ GetPlayerId(thePlayer) ]) then
            call MeleeDoDefeat(thePlayer)
        endif
    endif
    call MeleeCheckForLosersAndVictors()
endfunction

// 游戏结束时操作存活玩家的触发器
function MeleeTriggerActionPlayerLeft takes nothing returns nothing
    local player thePlayer = GetTriggerPlayer()

    // Just show game over for observers when they leave
    if(IsPlayerObserver(thePlayer)) then
        call RemovePlayerPreserveUnitsBJ(thePlayer, PLAYER_GAME_RESULT_NEUTRAL, false)
        return
    endif

    call CachePlayerHeroData(thePlayer)

    // This is the same as defeat except the player generates the message 
    // "player left the game" as opposed to "player was defeated".

    if(MeleeGetAllyCount(thePlayer) > 0) then
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

// 判定盟友胜负
function MeleeTriggerActionAllianceChange takes nothing returns nothing
    call MeleeCheckForLosersAndVictors()
    call MeleeCheckForCrippledPlayers()
endfunction

// 比赛即将结束（暴露提示）
function MeleeTriggerTournamentFinishSoon takes nothing returns nothing
    // Note: We may get this trigger multiple times
    local integer playerIndex
    local player indexPlayer
    local real timeRemaining = GetTournamentFinishSoonTimeRemaining()

    if not bj_finishSoonAllExposed then
        set bj_finishSoonAllExposed = true

        // Reset all crippled players and their timers, and hide the local crippled timer dialog
        set playerIndex = 0
        loop
            set indexPlayer = Player(playerIndex)
            if bj_playerIsCrippled [ playerIndex ] then
                // Uncripple the player
                set bj_playerIsCrippled [ playerIndex ] = false
                call PauseTimer(bj_crippledTimer [ playerIndex ])

                if(GetLocalPlayer() == indexPlayer) then
                    // Use only local code (no net traffic) within this block to avoid desyncs.

                    // Hide the timer window.
                    call TimerDialogDisplay(bj_crippledTimerWindows [ playerIndex ], false)
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


// 查询玩家是否真人
function MeleeWasUserPlayer takes player whichPlayer returns boolean
    local playerslotstate slotState

    if(GetPlayerController(whichPlayer) != MAP_CONTROL_USER) then
        return false
    endif

    set slotState = GetPlayerSlotState(whichPlayer)

    return(slotState == PLAYER_SLOT_STATE_PLAYING or slotState == PLAYER_SLOT_STATE_LEFT)
endfunction

// 根据比赛结束规则判断所有队伍胜负
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

    // Compute individual player scores
    set index = 0
    loop
        set indexPlayer = Player(index)
        if MeleeWasUserPlayer(indexPlayer) then
            set playerScore [ index ] = GetTournamentScore(indexPlayer)
            if playerScore [ index ] <= 0 then
                set playerScore [ index ] = 1
            endif
        else
            set playerScore [ index ] = 0
        endif
        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    // Compute team scores and team forces
    set teamCount = 0
    set index = 0
    loop
        if playerScore [ index ] != 0 then
            set indexPlayer = Player(index)

            set teamScore [ teamCount ] = 0
            set teamForce [ teamCount ] = CreateForce()

            set index2 = index
            loop
                if playerScore [ index2 ] != 0 then
                    set indexPlayer2 = Player(index2)

                    if PlayersAreCoAllied(indexPlayer, indexPlayer2) then
                        set teamScore [ teamCount ] = teamScore [ teamCount ] + playerScore [ index2 ]
                        call ForceAddPlayer(teamForce [ teamCount ], indexPlayer2)
                        set playerScore [ index2 ] = 0
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
        set bestTeam = - 1
        set bestScore = - 1
        set index = 0
        loop
            if teamScore [ index ] > bestScore then
                set bestTeam = index
                set bestScore = teamScore [ index ]
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
                if bestScore < (multiplier * teamScore [ index ]) then
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
                call ForForce(teamForce [ index ], function MeleeDoDrawEnum)

                set index = index + 1
                exitwhen index == teamCount
            endloop
        else
            // Give defeat to all players on teams other than the best team
            set index = 0
            loop
                if index != bestTeam then
                    call ForForce(teamForce [ index ], function MeleeDoDefeatEnum)
                endif

                set index = index + 1
                exitwhen index == teamCount
            endloop

            // Give victory to all players on the best team
            call ForForce(teamForce [ bestTeam ], function MeleeDoVictoryEnum)
        endif
    endif

endfunction

// 比赛结束
function MeleeTriggerTournamentFinishNow takes nothing returns nothing
    local integer rule = GetTournamentFinishNowRule()

    // If the game is already over, do nothing
    if bj_meleeGameOver then
        return
    endif

    if(rule == 1) then
        // Finals games
        call MeleeTournamentFinishNowRuleA(1)
    else
        // Preliminary games
        call MeleeTournamentFinishNowRuleA(3)
    endif

    // Since the game is over we should remove all observers
    call MeleeRemoveObservers()

endfunction


// 胜利/失败条件
function MeleeInitVictoryDefeat takes nothing returns nothing
    local trigger trig
    local integer index
    local player indexPlayer

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
        if(GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set bj_meleeDefeated [ index ] = false
            set bj_meleeVictoried [ index ] = false

            // Create a timer and timer window in case the player is crippled.
            set bj_playerIsCrippled [ index ] = false
            set bj_playerIsExposed [ index ] = false
            set bj_crippledTimer [ index ] = CreateTimer()
            set bj_crippledTimerWindows [ index ] = CreateTimerDialog(bj_crippledTimer [ index ])
            call TimerDialogSetTitle(bj_crippledTimerWindows [ index ], MeleeGetCrippledTimerMessage(indexPlayer))

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
            set bj_meleeDefeated [ index ] = true
            set bj_meleeVictoried [ index ] = false

            // Handle leave events for observers
            if(IsPlayerObserver(indexPlayer)) then
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

// 检查玩家槽可用性
function CheckInitPlayerSlotAvailability takes nothing returns nothing
    local integer index

    if(not bj_slotControlReady) then
        set index = 0
        loop
            set bj_slotControlUsed [ index ] = false
            set bj_slotControl [ index ] = MAP_CONTROL_USER
            set index = index + 1
            exitwhen index == bj_MAX_PLAYERS
        endloop
        set bj_slotControlReady = true
    endif
endfunction

// 设置玩家槽可用性
// 仅是开局后补设标识，并不是真正设置插槽，插槽地图编辑时已设置，非固定电脑的插槽又在房间中经过了二次启闭和填充玩家
function SetPlayerSlotAvailable takes player whichPlayer, mapcontrol control returns nothing
    local integer playerIndex = GetPlayerId(whichPlayer)

    call CheckInitPlayerSlotAvailability()
    set bj_slotControlUsed [ playerIndex ] = true
    set bj_slotControl [ playerIndex ] = control
endfunction



//***************************************************************************
//*
//*  Generic Template Player-slot Initialization
//*
//***************************************************************************

// 设置玩家队伍（指定队伍数量）
// 仅是开局后补设标识，并不是真正设置队伍，插槽地图编辑时已设置，允许自由设置的地图又在房间中经过了二次设置
function TeamInitPlayerSlots takes integer teamCount returns nothing
    local integer index
    local player indexPlayer
    local integer team

    call SetTeams(teamCount)

    call CheckInitPlayerSlotAvailability()
    set index = 0
    set team = 0
    loop
        if(bj_slotControlUsed [ index ]) then
            set indexPlayer = Player(index)
            call SetPlayerTeam(indexPlayer, team)
            set team = team + 1
            if(team >= teamCount) then
                set team = 0
            endif
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction

// 设置玩家队伍（混战）
// 仅是开局后补设标识，并不是真正设置队伍，插槽地图编辑时已设置，允许自由设置的地图又在房间中经过了二次设置
function MeleeInitPlayerSlots takes nothing returns nothing
    call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction

// 设置玩家队伍（FFA）
// 仅是开局后补设标识，并不是真正设置队伍，插槽地图编辑时已设置，允许自由设置的地图又在房间中经过了二次设置
function FFAInitPlayerSlots takes nothing returns nothing
    call TeamInitPlayerSlots(bj_MAX_PLAYERS)
endfunction

// 设置玩家队伍（1V1）
// 仅是开局后补设标识，并不是真正设置队伍，插槽地图编辑时已设置，允许自由设置的地图又在房间中经过了二次设置
function OneOnOneInitPlayerSlots takes nothing returns nothing
    // Limit the game to 2 players.
    call SetTeams(2)
    call SetPlayers(2)
    call TeamInitPlayerSlots(2)
endfunction

// 初始化玩家队伍（按游戏（队伍）类型）
// 支持识别1V1、2支队伍、3支队伍、4支队伍、FFA、混战
// 仅是开局后补设标识，并不是真正初始化队伍，插槽地图编辑时已设置，允许自由设置的地图又在房间中经过了二次设置
function InitGenericPlayerSlots takes nothing returns nothing
    local gametype gType = GetGameTypeSelected()

    if(gType == GAME_TYPE_MELEE) then
        call MeleeInitPlayerSlots()
    elseif(gType == GAME_TYPE_FFA) then
        call FFAInitPlayerSlots()
    elseif(gType == GAME_TYPE_USE_MAP_SETTINGS) then
        // Do nothing; the map-specific script handles this.
    elseif(gType == GAME_TYPE_ONE_ON_ONE) then
        call OneOnOneInitPlayerSlots()
    elseif(gType == GAME_TYPE_TWO_TEAM_PLAY) then
        call TeamInitPlayerSlots(2)
    elseif(gType == GAME_TYPE_THREE_TEAM_PLAY) then
        call TeamInitPlayerSlots(3)
    elseif(gType == GAME_TYPE_FOUR_TEAM_PLAY) then
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

// 设置黎明音效
function SetDNCSoundsDawn takes nothing returns nothing
    if bj_useDawnDuskSounds then
        call StartSound(bj_dawnSound)
    endif
endfunction

// 设置黄昏音效
function SetDNCSoundsDusk takes nothing returns nothing
    if bj_useDawnDuskSounds then
        call StartSound(bj_duskSound)
    endif
endfunction

// 设置白天音效
function SetDNCSoundsDay takes nothing returns nothing
    local real ToD = GetTimeOfDay()

    if(ToD >= bj_TOD_DAWN and ToD < bj_TOD_DUSK) and not bj_dncIsDaytime then
        set bj_dncIsDaytime = true

        // change ambient sounds
        call StopSound(bj_nightAmbientSound, false, true)
        call StartSound(bj_dayAmbientSound)
    endif
endfunction

// 设置夜晚音效
function SetDNCSoundsNight takes nothing returns nothing
    local real ToD = GetTimeOfDay()

    if(ToD < bj_TOD_DAWN or ToD >= bj_TOD_DUSK) and bj_dncIsDaytime then
        set bj_dncIsDaytime = false

        // change ambient sounds
        call StopSound(bj_dayAmbientSound, false, true)
        call StartSound(bj_nightAmbientSound)
    endif
endfunction

// 初始化音效设置
function InitDNCSounds takes nothing returns nothing
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

// 初始化blizzard.j全局变量
function InitBlizzardGlobals takes nothing returns nothing
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
        set bj_FORCE_PLAYER [ index ] = CreateForce()
        call ForceAddPlayer(bj_FORCE_PLAYER [ index ], Player(index))
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
        set bj_queuedExecTriggers [ index ] = null
        set bj_queuedExecUseConds [ index ] = false
        set index = index + 1
    endloop

    // Init singleplayer check
    set bj_isSinglePlayer = false
    set userControlledPlayers = 0
    set index = 0
    loop
        exitwhen index >= bj_MAX_PLAYERS
        if(GetPlayerController(Player(index)) == MAP_CONTROL_USER and GetPlayerSlotState(Player(index)) == PLAYER_SLOT_STATE_PLAYING) then
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
    if(v == VERSION_REIGN_OF_CHAOS) then
        set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V0
    else
        set bj_MELEE_MAX_TWINKED_HEROES = bj_MELEE_MAX_TWINKED_HEROES_V1
    endif
endfunction

// 初始化触发器队列
function InitQueuedTriggers takes nothing returns nothing
    set bj_queuedExecTimeout = CreateTrigger()
    call TriggerRegisterTimerExpireEvent(bj_queuedExecTimeout, bj_queuedExecTimeoutTimer)
    call TriggerAddAction(bj_queuedExecTimeout, function QueuedTriggerDoneBJ)
endfunction

// 初始地图范围
function InitMapRects takes nothing returns nothing
    set bj_mapInitialPlayableArea = Rect(GetCameraBoundMinX() - GetCameraMargin(CAMERA_MARGIN_LEFT), GetCameraBoundMinY() - GetCameraMargin(CAMERA_MARGIN_BOTTOM), GetCameraBoundMaxX() + GetCameraMargin(CAMERA_MARGIN_RIGHT), GetCameraBoundMaxY() + GetCameraMargin(CAMERA_MARGIN_TOP))
    set bj_mapInitialCameraBounds = GetCurrentCameraBoundsMapRectBJ()
endfunction

// 初始化升级类科技单位的数量上限（升级后会改变训练/召唤的单位类型的科技）
// 默认针对：坦克的火箭弹幕、狂战士升级、骷髅战士
function InitSummonableCaps takes nothing returns nothing
    local integer index

    set index = 0
    loop
        // upgraded units
        // Note: Only do this if the corresponding upgrade is not yet researched
        // Barrage - Siege Engines
        if(not GetPlayerTechResearched(Player(index), 'Rhrt', true)) then
            call SetPlayerTechMaxAllowed(Player(index), 'hrtt', 0)
        endif

        // Berserker Upgrade - Troll Berserkers
        if(not GetPlayerTechResearched(Player(index), 'Robk', true)) then
            call SetPlayerTechMaxAllowed(Player(index), 'otbk', 0)
        endif

        // max skeletons per player
        call SetPlayerTechMaxAllowed(Player(index), 'uske', bj_MAX_SKELETONS)

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop
endfunction


// 更新市场物品可用性限制
// Update the per-class stock limits.
function UpdateStockAvailability takes item whichItem returns nothing
    local itemtype iType = GetItemType(whichItem)
    local integer iLevel = GetItemLevel(whichItem)

    // Update allowed type/level combinations.
    if(iType == ITEM_TYPE_PERMANENT) then
        set bj_stockAllowedPermanent [ iLevel ] = true
    elseif(iType == ITEM_TYPE_CHARGED) then
        set bj_stockAllowedCharged [ iLevel ] = true
    elseif(iType == ITEM_TYPE_ARTIFACT) then
        set bj_stockAllowedArtifact [ iLevel ] = true
    else
        // Not interested in this item type - ignore the item.
    endif
endfunction


// 更新商店物品库存触发器条件
// Find a sellable item of the given type and level, and then add it.
function UpdateEachStockBuildingEnum takes nothing returns nothing
    local integer iteration = 0
    local integer pickedItemId

    loop
        set pickedItemId = ChooseRandomItemEx(bj_stockPickedItemType, bj_stockPickedItemLevel)
        exitwhen IsItemIdSellable(pickedItemId)

        // If we get hung up on an entire class/level combo of unsellable
        // items, or a very unlucky series of random numbers, give up.
        set iteration = iteration + 1
        if(iteration > bj_STOCK_MAX_ITERATIONS) then
            return
        endif
    endloop
    call AddItemToStock(GetEnumUnit(), pickedItemId, 1, 1)
endfunction

// 更新商店物品库存触发器动作
function UpdateEachStockBuilding takes itemtype iType, integer iLevel returns nothing
    local group g

    set bj_stockPickedItemType = iType
    set bj_stockPickedItemLevel = iLevel

    set g = CreateGroup()
    call GroupEnumUnitsOfType(g, "marketplace", null)
    call ForGroup(g, function UpdateEachStockBuildingEnum)
    call DestroyGroup(g)
endfunction


// 更新商店物品库存触发器
// Update stock inventory.
function PerformStockUpdates takes nothing returns nothing
    local integer pickedItemId
    local itemtype pickedItemType
    local integer pickedItemLevel = 0
    local integer allowedCombinations = 0
    local integer iLevel

    // Give each type/level combination a chance of being picked.
    set iLevel = 1
    loop
        if(bj_stockAllowedPermanent [ iLevel ]) then
            set allowedCombinations = allowedCombinations + 1
            if(GetRandomInt(1, allowedCombinations) == 1) then
                set pickedItemType = ITEM_TYPE_PERMANENT
                set pickedItemLevel = iLevel
            endif
        endif
        if(bj_stockAllowedCharged [ iLevel ]) then
            set allowedCombinations = allowedCombinations + 1
            if(GetRandomInt(1, allowedCombinations) == 1) then
                set pickedItemType = ITEM_TYPE_CHARGED
                set pickedItemLevel = iLevel
            endif
        endif
        if(bj_stockAllowedArtifact [ iLevel ]) then
            set allowedCombinations = allowedCombinations + 1
            if(GetRandomInt(1, allowedCombinations) == 1) then
                set pickedItemType = ITEM_TYPE_ARTIFACT
                set pickedItemLevel = iLevel
            endif
        endif

        set iLevel = iLevel + 1
        exitwhen iLevel > bj_MAX_ITEM_LEVEL
    endloop

    // Make sure we found a valid item type to add.
    if(allowedCombinations == 0) then
        return
    endif

    call UpdateEachStockBuilding(pickedItemType, pickedItemLevel)
endfunction


// 开始更新市场库存
// Perform the first update, and then arrange future updates.
function StartStockUpdates takes nothing returns nothing
    call PerformStockUpdates()
    call TimerStart(bj_stockUpdateTimer, bj_STOCK_RESTOCK_INTERVAL, true, function PerformStockUpdates)
endfunction

// 扣除被购买物品的库存（出售单位事件发生后）
function RemovePurchasedItem takes nothing returns nothing
    call RemoveItemFromStock(GetSellingUnit(), GetItemTypeId(GetSoldItem()))
endfunction

// 初始化中立建筑
function InitNeutralBuildings takes nothing returns nothing
    local integer iLevel

    // Chart of allowed stock items.
    set iLevel = 0
    loop
        set bj_stockAllowedPermanent [ iLevel ] = false
        set bj_stockAllowedCharged [ iLevel ] = false
        set bj_stockAllowedArtifact [ iLevel ] = false
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

// 删除设置开局阈值计时器（bj_gameStartedTimer）
function MarkGameStarted takes nothing returns nothing
    set bj_gameStarted = true
    call DestroyTimer(bj_gameStartedTimer)
endfunction

// 设置开局阈值
function DetectGameStarted takes nothing returns nothing
    set bj_gameStartedTimer = CreateTimer()
    call TimerStart(bj_gameStartedTimer, bj_GAME_STARTED_THRESHOLD, false, function MarkGameStarted)
endfunction

// 系统初始化
function InitBlizzard takes nothing returns nothing
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

// 重置随机分布数为0
function RandomDistReset takes nothing returns nothing
    set bj_randDistCount = 0
endfunction

// 添加随机分布数
function RandomDistAddItem takes integer inID, integer inChance returns nothing
    set bj_randDistID [ bj_randDistCount ] = inID
    set bj_randDistChance [ bj_randDistCount ] = inChance
    set bj_randDistCount = bj_randDistCount + 1
endfunction

// 获取随机分布数
function RandomDistChoose takes nothing returns integer
    local integer sum = 0
    local integer chance = 0
    local integer index
    local integer foundID = - 1
    local boolean done

    // No items?
    if(bj_randDistCount == 0) then
        return - 1
    endif

    // Find sum of all chances
    set index = 0
    loop
        set sum = sum + bj_randDistChance [ index ]

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
        set sum = sum + bj_randDistChance [ index ]

        if(chance <= sum) then
            set foundID = bj_randDistID [ index ]
            set done = true
        endif

        set index = index + 1
        if(index == bj_randDistCount) then
            set done = true
        endif

        exitwhen done == true
    endloop

    return foundID
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

// 创建指定物品（指定单位）
// 默认用于单位死亡后掉落物品
function UnitDropItem takes unit inUnit, integer inItemID returns item
    local real x
    local real y
    local real radius = 32
    local real unitX
    local real unitY
    local item droppedItem

    if(inItemID == - 1) then
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

// 创建指定物品（指定目标单位/物品/可破坏物）
// 默认用于目标死亡后掉落物品
function WidgetDropItem takes widget inWidget, integer inItemID returns item
    local real x
    local real y
    local real radius = 32
    local real widgetX
    local real widgetY

    if(inItemID == - 1) then
        return null
    endif

    set widgetX = GetWidgetX(inWidget)
    set widgetY = GetWidgetY(inWidget)

    set x = GetRandomReal(widgetX - radius, widgetX + radius)
    set y = GetRandomReal(widgetY - radius, widgetY + radius)

    return CreateItem(inItemID, x, y)
endfunction


//***************************************************************************
//*
//*  Instanced Object Operation Functions
//*
//*  Get/Set specific fields for single unit/item/ability instance
//*
//***************************************************************************

// 获取最后一次值域操作结果/实例函数调用结果
function BlzIsLastInstanceObjectFunctionSuccessful takes nothing returns boolean
    return bj_lastInstObjFuncSuccessful
endfunction

// Ability

// 设置技能布尔值域
function BlzSetAbilityBooleanFieldBJ takes ability whichAbility, abilitybooleanfield whichField, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityBooleanField(whichAbility, whichField, value)
endfunction

// 设置技能整数域
function BlzSetAbilityIntegerFieldBJ takes ability whichAbility, abilityintegerfield whichField, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityIntegerField(whichAbility, whichField, value)
endfunction

// 设置技能实数域
function BlzSetAbilityRealFieldBJ takes ability whichAbility, abilityrealfield whichField, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityRealField(whichAbility, whichField, value)
endfunction

// 设置技能字符串域
function BlzSetAbilityStringFieldBJ takes ability whichAbility, abilitystringfield whichField, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityStringField(whichAbility, whichField, value)
endfunction

// 设置技能随等级改变的布尔值域
function BlzSetAbilityBooleanLevelFieldBJ takes ability whichAbility, abilitybooleanlevelfield whichField, integer level, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityBooleanLevelField(whichAbility, whichField, level, value)
endfunction

// 设置技能随等级改变的整数域
function BlzSetAbilityIntegerLevelFieldBJ takes ability whichAbility, abilityintegerlevelfield whichField, integer level, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityIntegerLevelField(whichAbility, whichField, level, value)
endfunction

// 设置技能随等级改变的实数域
function BlzSetAbilityRealLevelFieldBJ takes ability whichAbility, abilityreallevelfield whichField, integer level, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityRealLevelField(whichAbility, whichField, level, value)
endfunction

// 设置技能随等级改变的字符串域
function BlzSetAbilityStringLevelFieldBJ takes ability whichAbility, abilitystringlevelfield whichField, integer level, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityStringLevelField(whichAbility, whichField, level, value)
endfunction

// 设置技能随等级改变的布尔值数组域
function BlzSetAbilityBooleanLevelArrayFieldBJ takes ability whichAbility, abilitybooleanlevelarrayfield whichField, integer level, integer index, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityBooleanLevelArrayField(whichAbility, whichField, level, index, value)
endfunction

// 设置技能随等级改变的整数数组域
function BlzSetAbilityIntegerLevelArrayFieldBJ takes ability whichAbility, abilityintegerlevelarrayfield whichField, integer level, integer index, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityIntegerLevelArrayField(whichAbility, whichField, level, index, value)
endfunction

// 设置技能随等级改变的实数数组域
function BlzSetAbilityRealLevelArrayFieldBJ takes ability whichAbility, abilityreallevelarrayfield whichField, integer level, integer index, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityRealLevelArrayField(whichAbility, whichField, level, index, value)
endfunction

// 设置技能随等级改变的字符串数组域
function BlzSetAbilityStringLevelArrayFieldBJ takes ability whichAbility, abilitystringlevelarrayfield whichField, integer level, integer index, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetAbilityStringLevelArrayField(whichAbility, whichField, level, index, value)
endfunction

// 添加技能随等级改变的布尔值数组域
function BlzAddAbilityBooleanLevelArrayFieldBJ takes ability whichAbility, abilitybooleanlevelarrayfield whichField, integer level, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzAddAbilityBooleanLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 添加技能随等级改变的整数数组域
function BlzAddAbilityIntegerLevelArrayFieldBJ takes ability whichAbility, abilityintegerlevelarrayfield whichField, integer level, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzAddAbilityIntegerLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 添加技能随等级改变的实数数组域
function BlzAddAbilityRealLevelArrayFieldBJ takes ability whichAbility, abilityreallevelarrayfield whichField, integer level, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzAddAbilityRealLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 添加技能随等级改变的字符串数组域
function BlzAddAbilityStringLevelArrayFieldBJ takes ability whichAbility, abilitystringlevelarrayfield whichField, integer level, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzAddAbilityStringLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 移除技能随等级改变的布尔值数组域
function BlzRemoveAbilityBooleanLevelArrayFieldBJ takes ability whichAbility, abilitybooleanlevelarrayfield whichField, integer level, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzRemoveAbilityBooleanLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 移除技能随等级改变的整数数组域
function BlzRemoveAbilityIntegerLevelArrayFieldBJ takes ability whichAbility, abilityintegerlevelarrayfield whichField, integer level, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzRemoveAbilityIntegerLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 移除技能随等级改变的实数数组域
function BlzRemoveAbilityRealLevelArrayFieldBJ takes ability whichAbility, abilityreallevelarrayfield whichField, integer level, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzRemoveAbilityRealLevelArrayField(whichAbility, whichField, level, value)
endfunction

// 移除技能随等级改变的字符串数组域
function BlzRemoveAbilityStringLevelArrayFieldBJ takes ability whichAbility, abilitystringlevelarrayfield whichField, integer level, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzRemoveAbilityStringLevelArrayField(whichAbility, whichField, level, value)
endfunction

// Item

// 添加物品技能
function BlzItemAddAbilityBJ takes item whichItem, integer abilCode returns nothing
    set bj_lastInstObjFuncSuccessful = BlzItemAddAbility(whichItem, abilCode)
endfunction

// 移除物品技能
function BlzItemRemoveAbilityBJ takes item whichItem, integer abilCode returns nothing
    set bj_lastInstObjFuncSuccessful = BlzItemRemoveAbility(whichItem, abilCode)
endfunction

// 添加物品技能
function BlzSetItemBooleanFieldBJ takes item whichItem, itembooleanfield whichField, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetItemBooleanField(whichItem, whichField, value)
endfunction

// 设置物品整数域
function BlzSetItemIntegerFieldBJ takes item whichItem, itemintegerfield whichField, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetItemIntegerField(whichItem, whichField, value)
endfunction

// 设置物品实数域
function BlzSetItemRealFieldBJ takes item whichItem, itemrealfield whichField, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetItemRealField(whichItem, whichField, value)
endfunction

// 设置物品字符串域
function BlzSetItemStringFieldBJ takes item whichItem, itemstringfield whichField, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetItemStringField(whichItem, whichField, value)
endfunction


// Unit

// 设置单位布尔值域
function BlzSetUnitBooleanFieldBJ takes unit whichUnit, unitbooleanfield whichField, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitBooleanField(whichUnit, whichField, value)
endfunction

// 设置单位整数域
function BlzSetUnitIntegerFieldBJ takes unit whichUnit, unitintegerfield whichField, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitIntegerField(whichUnit, whichField, value)
endfunction

// 设置单位实域
function BlzSetUnitRealFieldBJ takes unit whichUnit, unitrealfield whichField, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitRealField(whichUnit, whichField, value)
endfunction

// 设置单位字符串域
function BlzSetUnitStringFieldBJ takes unit whichUnit, unitstringfield whichField, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitStringField(whichUnit, whichField, value)
endfunction

// Unit Weapon

// 设置单位武器布尔值域
function BlzSetUnitWeaponBooleanFieldBJ takes unit whichUnit, unitweaponbooleanfield whichField, integer index, boolean value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitWeaponBooleanField(whichUnit, whichField, index, value)
endfunction

// 设置单位武器整数域
function BlzSetUnitWeaponIntegerFieldBJ takes unit whichUnit, unitweaponintegerfield whichField, integer index, integer value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitWeaponIntegerField(whichUnit, whichField, index, value)
endfunction

// 设置单位武器实数域
function BlzSetUnitWeaponRealFieldBJ takes unit whichUnit, unitweaponrealfield whichField, integer index, real value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitWeaponRealField(whichUnit, whichField, index, value)
endfunction

// 设置单位武器字符串域
function BlzSetUnitWeaponStringFieldBJ takes unit whichUnit, unitweaponstringfield whichField, integer index, string value returns nothing
    set bj_lastInstObjFuncSuccessful = BlzSetUnitWeaponStringField(whichUnit, whichField, index, value)
endfunction
