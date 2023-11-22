//===========================================================================
// Cheats.j
// 魔兽3官方文件
//===========================================================================


globals
    // Debug-cheat globals

    // DeBug作弊设置镜头属性时镜头移动的持续时间，默认为0
    constant real     bj_DEBUG_CAMFIELD_SPEED     = 0
    // 作弊码，gimme，给所有玩家增加5000黄金/木材
    constant string   bj_DEBUG_CHAT_GIMME         = "gimme"
    // 作弊码，demo，展示玩家属性多面板
    constant string   bj_DEBUG_CHAT_DEMO          = "demo"
    // 作弊码，teleport，立即移动触发玩家选取单位到当前镜头位置
    constant string   bj_DEBUG_CHAT_TELEPORT      = "teleport"
    // 作弊码，ttt，立即移动触发玩家选取单位到当前镜头位置
    constant string   bj_DEBUG_CHAT_TELEPORT2     = "ttt"
    // 作弊码，unitinfo，通报触发玩家选取单位的参数
    constant string   bj_DEBUG_CHAT_UNITINFO      = "unitinfo"
    // 作弊码，ui，通报触发玩家选取单位的参数
    constant string   bj_DEBUG_CHAT_UNITINFO2     = "ui"
    // 作弊码，caminfo，通报触发玩家的镜头参数
    constant string   bj_DEBUG_CHAT_CAMINFO       = "caminfo"
    // 作弊码，ci，通报触发玩家的镜头参数
    constant string   bj_DEBUG_CHAT_CAMINFO2      = "ci"
    // 作弊码，camdist，设置镜头的镜头距离(距离到目标)
    constant string   bj_DEBUG_CHAT_CAMDIST       = "camdist"
    // 作弊码，camfarz，设置镜头的远景截断距离(远景裁剪)
    constant string   bj_DEBUG_CHAT_CAMFARZ       = "camfarz"
    // 作弊码，camaoa，设置镜头的 X 轴旋转角度（水平/攻击角度）
    constant string   bj_DEBUG_CHAT_CAMAOA        = "camaoa"
    // 作弊码，camfov，设置镜头的镜头区域(观察区域)
    constant string   bj_DEBUG_CHAT_CAMFOV        = "camfov"
    // 作弊码，camroll，设置镜头的 Y 轴旋转角度(滚动)
    constant string   bj_DEBUG_CHAT_CAMROLL       = "camroll"
    // 作弊码，camrot，设置镜头的 Z 轴旋转角度（旋转）
    constant string   bj_DEBUG_CHAT_CAMROT        = "camrot"
    // 作弊码，camreset，重置镜头并恢复控制权
    constant string   bj_DEBUG_CHAT_CAMRESET      = "camreset"
    // 作弊码，clone，复制玩家选取单位
    constant string   bj_DEBUG_CHAT_CLONE         = "clone"
    // 作弊码，dispel，驱散玩家选取单位拥有的所有魔法效果
    constant string   bj_DEBUG_CHAT_DISPEL        = "dispel"
    // 作弊码，gotox，移动镜头到聊天信息输入的 X 坐标，Y 坐标不变
    constant string   bj_DEBUG_CHAT_GOTOX         = "gotox"
    // 作弊码，gotoy，移动镜头到聊天信息输入的 Y 坐标，X 坐标不变
    constant string   bj_DEBUG_CHAT_GOTOY         = "gotoy"
    // 作弊码，，移动镜头到聊天信息输入的坐标
    constant string   bj_DEBUG_CHAT_GOTOXY        = "gotoxy"
    // 作弊码，gotounit，设置镜头到触发玩家选取单位的位置
    constant string   bj_DEBUG_CHAT_GOTOUNIT      = "gotounit"
    // 作弊码，blackmask，全图启用黑色阴影
    constant string   bj_DEBUG_CHAT_BLACKMASK     = "blackmask"
    // 作弊码，bm，全图启用黑色阴影
    constant string   bj_DEBUG_CHAT_BLACKMASK2    = "bm"
    // 作弊码，difficulty，通报游戏难度
    constant string   bj_DEBUG_CHAT_DIFFICULTY    = "difficulty"
    // 作弊码，fingerofdeath，死亡之指状态及通报
    constant string   bj_DEBUG_CHAT_FINGEROFDEATH = "fingerofdeath"
    // 作弊触发器 给所有玩家增加5000黄金/木材
    trigger           bj_debugGimmeTrig
    // 作弊触发器 展示演示玩家属性多面板
    trigger           bj_debugDemoTrig
    // 作弊触发器 立即移动触发玩家选取单位到当前镜头位置
    trigger           bj_debugTeleportTrig
    // 作弊触发器 通报触发玩家选取单位的参数
    trigger           bj_debugUnitInfoTrig
    // 作弊触发器 通报触发玩家的镜头参数
    trigger           bj_debugCamInfoTrig
    // 作弊触发器 设置镜头的镜头距离(距离到目标)
    trigger           bj_debugCamDistTrig
    // 作弊触发器 设置镜头的远景截断距离(远景裁剪)
    trigger           bj_debugCamFarzTrig
    // 作弊触发器 设置镜头的 X 轴旋转角度（水平/攻击角度）
    trigger           bj_debugCamAoaTrig
    // 作弊触发器 设置镜头的镜头区域(观察区域)
    trigger           bj_debugCamFovTrig
    // 作弊触发器 设置镜头的 Y 轴旋转角度(滚动)
    trigger           bj_debugCamRollTrig
    // 作弊触发器 设置镜头的 Z 轴旋转角度（旋转）
    trigger           bj_debugCamRotTrig
    // 作弊触发器 重置镜头并恢复控制权
    trigger           bj_debugCamResetTrig
    // 作弊触发器 复制玩家选取单位
    trigger           bj_debugCloneTrig
    // 作弊触发器 驱散玩家选取单位拥有的所有魔法效果
    trigger           bj_debugDispelTrig
    // 作弊触发器 移动镜头到聊天信息输入的 X 坐标，Y 坐标不变
    trigger           bj_debugGotoXTrig
    // 作弊触发器 移动镜头到聊天信息输入的 Y 坐标，X 坐标不变
    trigger           bj_debugGotoYTrig
    // 作弊触发器 移动镜头到聊天信息输入坐标
    trigger           bj_debugGotoXYTrig
    // 作弊触发器 设置镜头到触发玩家选取单位的位置
    trigger           bj_debugGotoUnitTrig
    // 作弊触发器 全图启用黑色阴影
    trigger           bj_debug_BlackMaskTrig
    // 作弊触发器 通报游戏难度
    trigger           bj_debugDifficultyTrig
    // 作弊触发器 死亡之指状态及通报
    trigger  array    bj_debugFingerOfDeathTrig
    // 作弊触发器 死亡之指触发器动作--立即杀死单位
    trigger  array    bj_debugToolOfDeathTrig
    // 死亡之指触发器启用标识 
    boolean  array    bj_debugFingerOfDeathEnabled
    // 玩家选取单位的 X 坐标
    real              bj_debugGotoUnitX = 0
    // 玩家选取单位的 Y 坐标
    real              bj_debugGotoUnitY = 0
    // 玩家选取单位的数量
    integer           bj_debugGotoUnits = 0
endglobals



//***************************************************************************
//*
//*  Debug cheats
//*
//***************************************************************************

//===========================================================================

// 给所有玩家增加5000黄金/木材触发器动作
function DebugGimmeEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()
    call DisplayTextToPlayer(thePlayer, 0, 0, "Player "+I2S(GetPlayerId(GetTriggerPlayer())+1)+" cheated: Give 5000 gold and 5000 lumber to all players")
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD) + 5000)
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER, GetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER) + 5000)
endfunction

//===========================================================================

// 给所有玩家增加5000黄金/木材
function DebugGimme takes nothing returns nothing
    call ForForce(bj_FORCE_ALL_PLAYERS, function DebugGimmeEnum)
endfunction

//===========================================================================

// 展示演示玩家属性多面板设置所有玩家黄金/木材为0触发器动作
function DebugDemoEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD, 0)
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER, 0)
endfunction

//===========================================================================

// 展示演示玩家属性多面板
// 会设置所有玩家黄金/木材为0
function DebugDemo takes nothing returns nothing
    local player thePlayer = GetTriggerPlayer()
    local integer gold = GetRandomInt(750, 1500)
    local integer lumber = GetRandomInt(200, 450)

    call ForForce(bj_FORCE_ALL_PLAYERS, function DebugDemoEnum)
    call MultiboardSuppressDisplay(true)
    if (GetLocalPlayer() == GetTriggerPlayer()) then
        call Cheat("warnings")
        call Cheat("fastbuild")
        call Cheat("techtree")
        call Cheat("research")
        call Cheat("food")
        call Cheat("mana")
        call Cheat("dawn")
        call Cheat("gold " + I2S(gold))
        call Cheat("lumber " + I2S(lumber))
    endif
endfunction

//===========================================================================

// 立即移动触发玩家选取单位到当前镜头位置触发器动作
function DebugTeleportEnum takes nothing returns nothing
    local unit u = GetEnumUnit()
    call SetUnitPosition(u, GetCameraTargetPositionX(), GetCameraTargetPositionY())
endfunction

//===========================================================================

// 立即移动触发玩家选取单位到当前镜头位置
function DebugTeleport takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugTeleportEnum)
endfunction

//===========================================================================

// 字符串比较，当 expr 为真时返回 a，否则返回b
function TertiaryStringOp takes boolean expr, string a, string b returns string
    if (expr) then
        return a
    else
        return b
    endif
endfunction

//===========================================================================
// 

// 转换类型为4字码
// Convert a integer id value into a 4-letter id code.
function DebugIdInteger2IdString takes integer value returns string
    local string charMap = ".................................!.#$%&'()*+,-./0123456789:;<=>.@ABCDEFGHIJKLMNOPQRSTUVWXYZ[.]^_`abcdefghijklmnopqrstuvwxyz{|}~................................................................................................................................."
    local string result = ""
    local integer remainingValue = value
    local integer charValue
    local integer byteno

    set byteno = 0
    loop
        set charValue = ModuloInteger(remainingValue, 256)
        set remainingValue = remainingValue / 256
        set result = SubString(charMap, charValue, charValue + 1) + result

        set byteno = byteno + 1
        exitwhen byteno == 4
    endloop
    return result
endfunction

//===========================================================================

// 通报触发玩家选取单位的参数触发器动作
// 单位的所属，类型，名字，X Y 坐标，朝向，类型详情（是否英雄、死亡、建筑、地面单位、飞行单位、可攻击地面、可攻击飞行、近战攻击、远程攻击、召唤物）
function DebugUnitInfoEnum takes nothing returns nothing
    local player thePlayer = GetTriggerPlayer()
    local unit   theUnit   = GetEnumUnit()
    local string message

    set message = "Player " + I2S(GetPlayerId(GetOwningPlayer(theUnit))+1)
    set message = message + " '" + DebugIdInteger2IdString(GetUnitTypeId(theUnit)) + "'"
    set message = message + " " + GetUnitName(theUnit)
    set message = message + " (" + R2SW(GetUnitX(theUnit), 0, 0) + ", " + R2SW(GetUnitY(theUnit), 0, 0)
    set message = message + ": " + R2SW(GetUnitFacing(theUnit), 0, 0) + ") "
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_HERO),            " Hero",      "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_DEAD),            " Dead",      "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_STRUCTURE),       " Structure", "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_GROUND),          " Grnd",      "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_FLYING),          " Air",       "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_ATTACKS_GROUND),  " VsGrnd",    "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_ATTACKS_FLYING),  " VsAir",     "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_MELEE_ATTACKER),  " Melee",     "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_RANGED_ATTACKER), " Ranged",    "")
    set message = message + TertiaryStringOp(IsUnitType(theUnit, UNIT_TYPE_SUMMONED),        " Summoned",  "")

    call DisplayTextToPlayer(thePlayer, 0, 0, message)
endfunction

//===========================================================================

// 通报触发玩家选取单位的参数
function DebugUnitInfo takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugUnitInfoEnum)
endfunction

//===========================================================================

// 通报触发玩家的镜头参数
// 镜头 X Y Z 坐标，镜头距离(距离到目标)值，远景截断距离(远景裁剪)值，镜头区域(观察区域)值，X 轴旋转角度（水平/攻击角度）值，Y 轴旋转角度(滚动)值，Z 轴旋转角度（旋转）值
function DebugCamInfo takes nothing returns nothing
    local player thePlayer = GetTriggerPlayer()
    local string message

    set message = "Targ(" + R2SW(GetCameraTargetPositionX(), 0, 0)
    set message = message + "," + R2SW(GetCameraTargetPositionY(), 0, 0)
    set message = message + "," + R2SW(GetCameraTargetPositionZ(), 0, 0)
    set message = message + ")"
    set message = message + ", Dist=" + R2SW(GetCameraField(CAMERA_FIELD_TARGET_DISTANCE), 0, 0)
    set message = message + ", FarZ=" + R2SW(GetCameraField(CAMERA_FIELD_FARZ), 0, 0)
    set message = message + ", AoA=" + R2SW(GetCameraField(CAMERA_FIELD_ANGLE_OF_ATTACK) * bj_RADTODEG, 0, 2)
    set message = message + ", FoV=" + R2SW(GetCameraField(CAMERA_FIELD_FIELD_OF_VIEW) * bj_RADTODEG, 0, 2)
    set message = message + ", Roll=" + R2SW(GetCameraField(CAMERA_FIELD_ROLL) * bj_RADTODEG, 0, 2)
    set message = message + ", Rot=" + R2SW(GetCameraField(CAMERA_FIELD_ROTATION) * bj_RADTODEG, 0, 2)

    call DisplayTextToPlayer(thePlayer, 0, 0, message)
endfunction

//===========================================================================

// 设置镜头参数触发器动作
function DebugCamField takes camerafield whichField, integer cheatLength, real defaultValue returns nothing
    local string param        = SubString(GetEventPlayerChatString(), cheatLength, 50)
    local real   value        = S2R(param)

    // Remove any excess preceding whitespace
    loop
        exitwhen not (SubString(param, 0, 1) == " ")
        set param = SubString(param, 1, 50)
    endloop

    if param == "" then
        set value = defaultValue
    endif
    if (whichField == CAMERA_FIELD_FARZ) and (value <= bj_CAMERA_MIN_FARZ) then
        return
    endif
    call SetCameraFieldForPlayer(GetTriggerPlayer(), whichField, value, bj_DEBUG_CAMFIELD_SPEED)
endfunction

//===========================================================================

// 设置镜头的镜头距离(距离到目标)
function DebugCamDist takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_TARGET_DISTANCE, 7, 1600)
endfunction

//===========================================================================

// 设置镜头的远景截断距离(远景裁剪)
function DebugCamFarZ takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_FARZ, 7, 4000)
endfunction

//===========================================================================

// 设置镜头的镜头区域(观察区域)
function DebugCamFOV takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_FIELD_OF_VIEW, 6, 65)
endfunction

//===========================================================================

// 设置镜头的 X 轴旋转角度（水平/攻击角度）
function DebugCamAOA takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ANGLE_OF_ATTACK, 6, 310)
endfunction

//===========================================================================

// 设置镜头的 Y 轴旋转角度(滚动)
function DebugCamRoll takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ROLL, 7, 0)
endfunction

//===========================================================================

// 设置镜头的 Z 轴旋转角度（旋转）
function DebugCamRot takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ROTATION, 6, 90)
endfunction

//===========================================================================

// 重置镜头并恢复控制权
function DebugCamReset takes nothing returns nothing
    call ResetToGameCamera(0)
    call EnableUserControl(true)
endfunction

//===========================================================================

// 复制玩家选取单位触发器动作
function DebugCloneUnitEnum takes nothing returns nothing
    local unit u = GetEnumUnit()
    call CreateUnit(GetOwningPlayer(u), GetUnitTypeId(u), GetUnitX(u), GetUnitY(u), GetUnitFacing(u))
endfunction

//===========================================================================

// 复制玩家选取单位
// 在所有选取单位的当前位置，为触发玩家创建一个类型、朝向，玩家所属相同的新单位
function DebugCloneUnit takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugCloneUnitEnum)
endfunction

//===========================================================================

// 驱散玩家选取单位拥有的所有魔法效果触发器动作
function DebugDispelUnitEnum takes nothing returns nothing
    call UnitRemoveBuffs(GetEnumUnit(), true, true)
endfunction

//===========================================================================

// 驱散玩家选取单位拥有的所有魔法效果
function DebugDispelUnit takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugDispelUnitEnum)
endfunction

//===========================================================================

// 移动镜头到聊天信息输入的 X 坐标，Y 坐标不变
function DebugGotoX takes nothing returns nothing
    local string chatString = GetEventPlayerChatString()

    if (bj_DEBUG_CHAT_GOTOX + " " == SubString(chatString, 0, 6)) then
        call SetCameraPositionForPlayer(GetTriggerPlayer(), S2R(SubString(chatString, 6, 50)), GetCameraTargetPositionY())
    endif
endfunction

//===========================================================================

// 移动镜头到聊天信息输入的 Y 坐标，X 坐标不变
function DebugGotoY takes nothing returns nothing
    local string chatString = GetEventPlayerChatString()

    if (bj_DEBUG_CHAT_GOTOY + " " == SubString(chatString, 0, 6)) then
        call SetCameraPositionForPlayer(GetTriggerPlayer(), GetCameraTargetPositionX(), S2R(SubString(chatString, 6, 50)))
    endif
endfunction

//===========================================================================

// 移动镜头到聊天信息输入的坐标
function DebugGotoXY takes nothing returns nothing
    local string chatString = GetEventPlayerChatString()
    local integer index
    local boolean inParam1

    if (bj_DEBUG_CHAT_GOTOXY + " " == SubString(chatString, 0, 7)) then
        set inParam1 = false
        set index = 7
        loop
            if (SubString(chatString, index, index + 1) != " ") then
                set inParam1 = true
            endif

            exitwhen (inParam1 and SubString(chatString, index, index + 1) == " ")
            exitwhen index > 50
            set index = index + 1
        endloop

        if (index > 50) then
            call DisplayTextToPlayer(GetTriggerPlayer(), 0, 0, "Usage:  GotoXY x y")
        else
            if (GetLocalPlayer() == GetTriggerPlayer()) then
                call SetCameraPositionForPlayer(GetTriggerPlayer(), S2R(SubString(chatString, 7, index)), S2R(SubString(chatString, index, 50)))
            endif
        endif
    endif
endfunction

//===========================================================================

// 计算触发玩家的选取单位设置坐标
function DebugGotoUnitEnum takes nothing returns nothing
    local unit u = GetEnumUnit()

    set bj_debugGotoUnitX = bj_debugGotoUnitX + GetUnitX(u)
    set bj_debugGotoUnitY = bj_debugGotoUnitY + GetUnitY(u)
    set bj_debugGotoUnits = bj_debugGotoUnits + 1
endfunction

//===========================================================================

// 设置镜头到触发玩家选取单位的位置
// 位置的 X Y 坐标分别取该玩家所有选取单位 X Y 坐标的平均值
function DebugGotoUnit takes nothing returns nothing
    local group g = CreateGroup()

    set bj_debugGotoUnitX = 0
    set bj_debugGotoUnitY = 0
    set bj_debugGotoUnits = 0

    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugGotoUnitEnum)

    if (bj_debugGotoUnits != 0) then
        set bj_debugGotoUnitX = bj_debugGotoUnitX / bj_debugGotoUnits
        set bj_debugGotoUnitY = bj_debugGotoUnitY / bj_debugGotoUnits
        call SetCameraPositionForPlayer(GetTriggerPlayer(), bj_debugGotoUnitX, bj_debugGotoUnitY)
    endif
endfunction

//===========================================================================

// 全图启用黑色阴影
function DebugBlackMask takes nothing returns nothing
    call SetFogStateRect(GetTriggerPlayer(), FOG_OF_WAR_MASKED, GetWorldBounds(), true)
endfunction

//===========================================================================

// 通报游戏难度
function DebugDifficulty takes nothing returns nothing
    local player         thePlayer = GetTriggerPlayer()
    local gamedifficulty theDiff   = GetGameDifficulty()

    if (theDiff == MAP_DIFFICULTY_EASY) then
        call DisplayTextToPlayer(thePlayer, 0, 0, "Easy Difficulty")
    elseif (theDiff == MAP_DIFFICULTY_NORMAL) then
        call DisplayTextToPlayer(thePlayer, 0, 0, "Normal Difficulty")
    elseif (theDiff == MAP_DIFFICULTY_HARD) then
        call DisplayTextToPlayer(thePlayer, 0, 0, "Hard Difficulty")
    else
        call DisplayTextToPlayer(thePlayer, 0, 0, "ERROR!  Unrecognized Difficulty")
    endif
endfunction

//===========================================================================

// 死亡之指触发器动作--立即杀死单位
function DebugToolOfDeath takes nothing returns nothing
    call KillUnit(GetTriggerUnit())
endfunction

//===========================================================================

// 启用/禁用 死亡之指状态及通报
function DebugToggleFingerOfDeath takes nothing returns nothing
    local integer index = GetPlayerId(GetTriggerPlayer())
    if (bj_debugFingerOfDeathEnabled[index]) then
        call DisplayTextToPlayer(Player(index), 0, 0, "Finger Of Death Disabled")
        call DisableTrigger(bj_debugToolOfDeathTrig[index])
    else
        call DisplayTextToPlayer(Player(index), 0, 0, "Finger Of Death Enabled")
        call EnableTrigger(bj_debugToolOfDeathTrig[index])
    endif
    set bj_debugFingerOfDeathEnabled[index] = not bj_debugFingerOfDeathEnabled[index]
endfunction

//===========================================================================

// 初始化作弊触发器
function InitDebugTriggers takes nothing returns boolean
    local player  indexPlayer
    local integer index

    set index = 0
    loop
        set indexPlayer = Player(index)
        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then
            set bj_debugGimmeTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugGimmeTrig, indexPlayer, bj_DEBUG_CHAT_GIMME, true)
            call TriggerAddAction(bj_debugGimmeTrig, function DebugGimme)

            set bj_debugDemoTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugDemoTrig, indexPlayer, bj_DEBUG_CHAT_DEMO, true)
            call TriggerAddAction(bj_debugDemoTrig, function DebugDemo)

            set bj_debugTeleportTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugTeleportTrig, indexPlayer, bj_DEBUG_CHAT_TELEPORT, true)
            call TriggerRegisterPlayerChatEvent(bj_debugTeleportTrig, indexPlayer, bj_DEBUG_CHAT_TELEPORT2, true)
            call TriggerAddAction(bj_debugTeleportTrig, function DebugTeleport)

            set bj_debugUnitInfoTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugUnitInfoTrig, indexPlayer, bj_DEBUG_CHAT_UNITINFO, true)
            call TriggerRegisterPlayerChatEvent(bj_debugUnitInfoTrig, indexPlayer, bj_DEBUG_CHAT_UNITINFO2, true)
            call TriggerAddAction(bj_debugUnitInfoTrig, function DebugUnitInfo)

            set bj_debugCamInfoTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamInfoTrig, indexPlayer, bj_DEBUG_CHAT_CAMINFO, true)
            call TriggerRegisterPlayerChatEvent(bj_debugCamInfoTrig, indexPlayer, bj_DEBUG_CHAT_CAMINFO2, true)
            call TriggerAddAction(bj_debugCamInfoTrig, function DebugCamInfo)

            set bj_debugCamDistTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamDistTrig, indexPlayer, bj_DEBUG_CHAT_CAMDIST, false)
            call TriggerAddAction(bj_debugCamDistTrig, function DebugCamDist)

            set bj_debugCamFarzTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamFarzTrig, indexPlayer, bj_DEBUG_CHAT_CAMFARZ, false)
            call TriggerAddAction(bj_debugCamFarzTrig, function DebugCamFarZ)

            set bj_debugCamFovTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamFovTrig, indexPlayer, bj_DEBUG_CHAT_CAMFOV, false)
            call TriggerAddAction(bj_debugCamFovTrig, function DebugCamFOV)

            set bj_debugCamAoaTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamAoaTrig, indexPlayer, bj_DEBUG_CHAT_CAMAOA, false)
            call TriggerAddAction(bj_debugCamAoaTrig, function DebugCamAOA)

            set bj_debugCamRollTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamRollTrig, indexPlayer, bj_DEBUG_CHAT_CAMROLL, false)
            call TriggerAddAction(bj_debugCamRollTrig, function DebugCamRoll)

            set bj_debugCamRotTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamRotTrig, indexPlayer, bj_DEBUG_CHAT_CAMROT, false)
            call TriggerAddAction(bj_debugCamRotTrig, function DebugCamRot)

            set bj_debugCamResetTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCamResetTrig, indexPlayer, bj_DEBUG_CHAT_CAMRESET, true)
            call TriggerAddAction(bj_debugCamResetTrig, function DebugCamReset)

            set bj_debugCloneTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugCloneTrig, indexPlayer, bj_DEBUG_CHAT_CLONE, true)
            call TriggerAddAction(bj_debugCloneTrig, function DebugCloneUnit)

            set bj_debugDispelTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugDispelTrig, indexPlayer, bj_DEBUG_CHAT_DISPEL, true)
            call TriggerAddAction(bj_debugDispelTrig, function DebugDispelUnit)

            set bj_debugGotoXTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugGotoXTrig, indexPlayer, bj_DEBUG_CHAT_GOTOX, false)
            call TriggerAddAction(bj_debugGotoXTrig, function DebugGotoX)

            set bj_debugGotoYTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugGotoYTrig, indexPlayer, bj_DEBUG_CHAT_GOTOY, false)
            call TriggerAddAction(bj_debugGotoYTrig, function DebugGotoY)

            set bj_debugGotoXYTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugGotoXYTrig, indexPlayer, bj_DEBUG_CHAT_GOTOXY, false)
            call TriggerAddAction(bj_debugGotoXYTrig, function DebugGotoXY)

            set bj_debugGotoUnitTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugGotoUnitTrig, indexPlayer, bj_DEBUG_CHAT_GOTOUNIT, true)
            call TriggerAddAction(bj_debugGotoUnitTrig, function DebugGotoUnit)

            set bj_debug_BlackMaskTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debug_BlackMaskTrig, indexPlayer, bj_DEBUG_CHAT_BLACKMASK, true)
            call TriggerRegisterPlayerChatEvent(bj_debug_BlackMaskTrig, indexPlayer, bj_DEBUG_CHAT_BLACKMASK2, true)
            call TriggerAddAction(bj_debug_BlackMaskTrig, function DebugBlackMask)

            set bj_debugDifficultyTrig = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugDifficultyTrig, indexPlayer, bj_DEBUG_CHAT_DIFFICULTY, true)
            call TriggerAddAction(bj_debugDifficultyTrig, function DebugDifficulty)

            set bj_debugFingerOfDeathEnabled[index] = false

            set bj_debugToolOfDeathTrig[index] = CreateTrigger()
            call TriggerRegisterPlayerUnitEvent(bj_debugToolOfDeathTrig[index], indexPlayer, EVENT_PLAYER_UNIT_SELECTED, null)
            call TriggerAddAction(bj_debugToolOfDeathTrig[index], function DebugToolOfDeath)
            call DisableTrigger(bj_debugToolOfDeathTrig[index])

            set bj_debugFingerOfDeathTrig[index] = CreateTrigger()
            call TriggerRegisterPlayerChatEvent(bj_debugFingerOfDeathTrig[index], indexPlayer, bj_DEBUG_CHAT_FINGEROFDEATH, true)
            call TriggerAddAction(bj_debugFingerOfDeathTrig[index], function DebugToggleFingerOfDeath)
        endif

        set index = index + 1
        exitwhen index == bj_MAX_PLAYERS
    endloop

    return true
endfunction
