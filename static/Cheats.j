//===========================================================================
// Cheats.j
//===========================================================================


globals
    // Debug-cheat globals
    constant real     bj_DEBUG_CAMFIELD_SPEED     = 0
    constant string   bj_DEBUG_CHAT_GIMME         = "gimme"
    constant string   bj_DEBUG_CHAT_DEMO          = "demo"
    constant string   bj_DEBUG_CHAT_TELEPORT      = "teleport"
    constant string   bj_DEBUG_CHAT_TELEPORT2     = "ttt"
    constant string   bj_DEBUG_CHAT_UNITINFO      = "unitinfo"
    constant string   bj_DEBUG_CHAT_UNITINFO2     = "ui"
    constant string   bj_DEBUG_CHAT_CAMINFO       = "caminfo"
    constant string   bj_DEBUG_CHAT_CAMINFO2      = "ci"
    constant string   bj_DEBUG_CHAT_CAMDIST       = "camdist"
    constant string   bj_DEBUG_CHAT_CAMFARZ       = "camfarz"
    constant string   bj_DEBUG_CHAT_CAMAOA        = "camaoa"
    constant string   bj_DEBUG_CHAT_CAMFOV        = "camfov"
    constant string   bj_DEBUG_CHAT_CAMROLL       = "camroll"
    constant string   bj_DEBUG_CHAT_CAMROT        = "camrot"
    constant string   bj_DEBUG_CHAT_CAMRESET      = "camreset"
    constant string   bj_DEBUG_CHAT_CLONE         = "clone"
    constant string   bj_DEBUG_CHAT_DISPEL        = "dispel"
    constant string   bj_DEBUG_CHAT_GOTOX         = "gotox"
    constant string   bj_DEBUG_CHAT_GOTOY         = "gotoy"
    constant string   bj_DEBUG_CHAT_GOTOXY        = "gotoxy"
    constant string   bj_DEBUG_CHAT_GOTOUNIT      = "gotounit"
    constant string   bj_DEBUG_CHAT_BLACKMASK     = "blackmask"
    constant string   bj_DEBUG_CHAT_BLACKMASK2    = "bm"
    constant string   bj_DEBUG_CHAT_DIFFICULTY    = "difficulty"
    constant string   bj_DEBUG_CHAT_FINGEROFDEATH = "fingerofdeath"

    trigger           bj_debugGimmeTrig
    trigger           bj_debugDemoTrig
    trigger           bj_debugTeleportTrig
    trigger           bj_debugUnitInfoTrig
    trigger           bj_debugCamInfoTrig
    trigger           bj_debugCamDistTrig
    trigger           bj_debugCamFarzTrig
    trigger           bj_debugCamAoaTrig
    trigger           bj_debugCamFovTrig
    trigger           bj_debugCamRollTrig
    trigger           bj_debugCamRotTrig
    trigger           bj_debugCamResetTrig
    trigger           bj_debugCloneTrig
    trigger           bj_debugDispelTrig
    trigger           bj_debugGotoXTrig
    trigger           bj_debugGotoYTrig
    trigger           bj_debugGotoXYTrig
    trigger           bj_debugGotoUnitTrig
    trigger           bj_debug_BlackMaskTrig
    trigger           bj_debugDifficultyTrig
    trigger  array    bj_debugFingerOfDeathTrig
    trigger  array    bj_debugToolOfDeathTrig
    boolean  array    bj_debugFingerOfDeathEnabled
    real              bj_debugGotoUnitX = 0
    real              bj_debugGotoUnitY = 0
    integer           bj_debugGotoUnits = 0
endglobals



//***************************************************************************
//*
//*  Debug cheats
//*
//***************************************************************************

//===========================================================================
function DebugGimmeEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()
    call DisplayTextToPlayer(thePlayer, 0, 0, "Player "+I2S(GetPlayerId(GetTriggerPlayer())+1)+" cheated: Give 5000 gold and 5000 lumber to all players")
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD) + 5000)
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER, GetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER) + 5000)
endfunction

//===========================================================================
function DebugGimme takes nothing returns nothing
    call ForForce(bj_FORCE_ALL_PLAYERS, function DebugGimmeEnum)
endfunction

//===========================================================================
function DebugDemoEnum takes nothing returns nothing
    local player thePlayer = GetEnumPlayer()
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_GOLD, 0)
    call SetPlayerState(thePlayer, PLAYER_STATE_RESOURCE_LUMBER, 0)
endfunction

//===========================================================================
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
function DebugTeleportEnum takes nothing returns nothing
    local unit u = GetEnumUnit()
    call SetUnitPosition(u, GetCameraTargetPositionX(), GetCameraTargetPositionY())
endfunction

//===========================================================================
function DebugTeleport takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugTeleportEnum)
endfunction

//===========================================================================
function TertiaryStringOp takes boolean expr, string a, string b returns string
    if (expr) then
        return a
    else
        return b
    endif
endfunction

//===========================================================================
// Convert a integer id value into a 4-letter id code.
//
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
function DebugUnitInfo takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugUnitInfoEnum)
endfunction

//===========================================================================
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
function DebugCamDist takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_TARGET_DISTANCE, 7, 1600)
endfunction

//===========================================================================
function DebugCamFarZ takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_FARZ, 7, 4000)
endfunction

//===========================================================================
function DebugCamFOV takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_FIELD_OF_VIEW, 6, 65)
endfunction

//===========================================================================
function DebugCamAOA takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ANGLE_OF_ATTACK, 6, 310)
endfunction

//===========================================================================
function DebugCamRoll takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ROLL, 7, 0)
endfunction

//===========================================================================
function DebugCamRot takes nothing returns nothing
    call DebugCamField(CAMERA_FIELD_ROTATION, 6, 90)
endfunction

//===========================================================================
function DebugCamReset takes nothing returns nothing
    call ResetToGameCamera(0)
    call EnableUserControl(true)
endfunction

//===========================================================================
function DebugCloneUnitEnum takes nothing returns nothing
    local unit u = GetEnumUnit()
    call CreateUnit(GetOwningPlayer(u), GetUnitTypeId(u), GetUnitX(u), GetUnitY(u), GetUnitFacing(u))
endfunction

//===========================================================================
function DebugCloneUnit takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugCloneUnitEnum)
endfunction

//===========================================================================
function DebugDispelUnitEnum takes nothing returns nothing
    call UnitRemoveBuffs(GetEnumUnit(), true, true)
endfunction

//===========================================================================
function DebugDispelUnit takes nothing returns nothing
    local group g = CreateGroup()
    call SyncSelections()
    call GroupEnumUnitsSelected(g, GetTriggerPlayer(), null)
    call ForGroup(g, function DebugDispelUnitEnum)
endfunction

//===========================================================================
function DebugGotoX takes nothing returns nothing
    local string chatString = GetEventPlayerChatString()

    if (bj_DEBUG_CHAT_GOTOX + " " == SubString(chatString, 0, 6)) then
        call SetCameraPositionForPlayer(GetTriggerPlayer(), S2R(SubString(chatString, 6, 50)), GetCameraTargetPositionY())
    endif
endfunction

//===========================================================================
function DebugGotoY takes nothing returns nothing
    local string chatString = GetEventPlayerChatString()

    if (bj_DEBUG_CHAT_GOTOY + " " == SubString(chatString, 0, 6)) then
        call SetCameraPositionForPlayer(GetTriggerPlayer(), GetCameraTargetPositionX(), S2R(SubString(chatString, 6, 50)))
    endif
endfunction

//===========================================================================
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
function DebugGotoUnitEnum takes nothing returns nothing
    local unit u = GetEnumUnit()

    set bj_debugGotoUnitX = bj_debugGotoUnitX + GetUnitX(u)
    set bj_debugGotoUnitY = bj_debugGotoUnitY + GetUnitY(u)
    set bj_debugGotoUnits = bj_debugGotoUnits + 1
endfunction

//===========================================================================
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
function DebugBlackMask takes nothing returns nothing
    call SetFogStateRect(GetTriggerPlayer(), FOG_OF_WAR_MASKED, GetWorldBounds(), true)
endfunction

//===========================================================================
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
function DebugToolOfDeath takes nothing returns nothing
    call KillUnit(GetTriggerUnit())
endfunction

//===========================================================================
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
