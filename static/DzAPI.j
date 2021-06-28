#ifndef DZAPIINCLUDE
#define DZAPIINCLUDE


// 保存值
native DzAPI_Map_SaveServerValue        takes player whichPlayer, string key, string value returns boolean
// 获取值
native DzAPI_Map_GetServerValue         takes player whichPlayer, string key returns string
native DzAPI_Map_Ladder_SetStat         takes player whichPlayer, string key, string value returns nothing
// rpg阶梯
native DzAPI_Map_IsRPGLadder            takes nothing returns boolean
// 游戏开始时间
native DzAPI_Map_GetGameStartTime       takes nothing returns integer
native DzAPI_Map_Stat_SetStat           takes player whichPlayer, string key, string value returns nothing
// 匹配类型
native DzAPI_Map_GetMatchType      		takes nothing returns integer
// 玩家状态
native DzAPI_Map_Ladder_SetPlayerStat   takes player whichPlayer, string key, string value returns nothing
native DzAPI_Map_GetServerValueErrorCode takes player whichPlayer returns integer
// 得到阶梯水平
native DzAPI_Map_GetLadderLevel         takes player whichPlayer returns integer
// 红名vip
native DzAPI_Map_IsRedVIP               takes player whichPlayer returns boolean
// 蓝名vip
native DzAPI_Map_IsBlueVIP              takes player whichPlayer returns boolean
// 得到梯阶
native DzAPI_Map_GetLadderRank          takes player whichPlayer returns integer
// 地图排名
native DzAPI_Map_GetMapLevelRank        takes player whichPlayer returns integer
native DzAPI_Map_GetGuildName           takes player whichPlayer returns string
native DzAPI_Map_GetGuildRole           takes player whichPlayer returns integer
// rpg大厅
native DzAPI_Map_IsRPGLobby             takes nothing returns boolean
// 获取地图等级
native DzAPI_Map_GetMapLevel            takes player whichPlayer returns integer
// 任务完成
native DzAPI_Map_MissionComplete        takes player whichPlayer, string key, string value returns nothing
// 活动数据
native DzAPI_Map_GetActivityData        takes nothing returns string
native DzAPI_Map_GetMapConfig           takes string key returns string
native DzAPI_Map_HasMallItem            takes player whichPlayer, string key returns boolean
native DzAPI_Map_SavePublicArchive      takes player whichPlayer, string key, string value returns boolean
native DzAPI_Map_GetPublicArchive       takes player whichPlayer, string key returns string
native DzAPI_Map_UseConsumablesItem     takes player whichPlayer, string key returns nothing
// Orpg触发
native DzAPI_Map_OrpgTrigger            takes player whichPlayer, string key returns nothing
native DzAPI_Map_GetServerArchiveDrop   takes player whichPlayer, string key returns string
// 服务器存档设备
native DzAPI_Map_GetServerArchiveEquip  takes player whichPlayer, string key returns integer
native DzGetMouseTerrainX takes nothing returns real
// 获取鼠标在游戏内的坐标Y
native DzGetMouseTerrainY takes nothing returns real
// 获取鼠标在游戏内的坐标Z
native DzGetMouseTerrainZ takes nothing returns real
// 鼠标是否在游戏内
native DzIsMouseOverUI takes nothing returns boolean
// 获取鼠标屏幕坐标X
native DzGetMouseX takes nothing returns integer
// 获取鼠标屏幕坐标Y
native DzGetMouseY takes nothing returns integer
// 获取鼠标游戏窗口坐标X
native DzGetMouseXRelative takes nothing returns integer
// 获取鼠标游戏窗口坐标Y
native DzGetMouseYRelative takes nothing returns integer
// 设置鼠标位置
native DzSetMousePos takes integer x, integer y returns nothing
// 注册鼠标点击触发（sync为true时，调用TriggerExecute。为false时，直接运行action函数，可以异步不掉线，action里不要有同步操作）
native DzTriggerRegisterMouseEvent takes trigger trig, integer btn, integer status, boolean sync, string func returns nothing
// 注册鼠标点击触发（sync为true时，调用TriggerExecute。为false时，直接运行action函数，可以异步不掉线，action里不要有同步操作）
native DzTriggerRegisterMouseEventByCode takes trigger trig, integer btn, integer status, boolean sync, code funcHandle returns nothing
// 注册键盘点击触发
native DzTriggerRegisterKeyEvent takes trigger trig, integer key, integer status, boolean sync, string func returns nothing
// 注册键盘点击触发
native DzTriggerRegisterKeyEventByCode takes trigger trig, integer key, integer status, boolean sync, code funcHandle returns nothing
// 注册鼠标滚轮触发
native DzTriggerRegisterMouseWheelEvent takes trigger trig, boolean sync, string func returns nothing
// 注册鼠标滚轮触发
native DzTriggerRegisterMouseWheelEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
// 注册鼠标移动触发
native DzTriggerRegisterMouseMoveEvent takes trigger trig, boolean sync, string func returns nothing
// 注册鼠标移动触发
native DzTriggerRegisterMouseMoveEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
// 获取触发器的按键码
native DzGetTriggerKey takes nothing returns integer
// 获取滚轮delta
native DzGetWheelDelta takes nothing returns integer
// 判断按键是否按下
native DzIsKeyDown takes integer iKey returns boolean
// 获取触发key的玩家
native DzGetTriggerKeyPlayer takes nothing returns player
// 获取war3窗口宽度
native DzGetWindowWidth takes nothing returns integer
// 获取war3窗口高度
native DzGetWindowHeight takes nothing returns integer
// 获取war3窗口X坐标
native DzGetWindowX takes nothing returns integer
// 获取war3窗口Y坐标
native DzGetWindowY takes nothing returns integer
// 注册war3窗口大小变化事件
native DzTriggerRegisterWindowResizeEvent takes trigger trig, boolean sync, string func returns nothing
// 注册war3窗口大小变化事件
native DzTriggerRegisterWindowResizeEventByCode takes trigger trig, boolean sync, code funcHandle returns nothing
// 判断窗口是否激活
native DzIsWindowActive takes nothing returns boolean
// 设置可摧毁物位置
native DzDestructablePosition takes destructable d, real x, real y returns nothing
// 设置单位位置-本地调用
native DzSetUnitPosition takes unit whichUnit, real x, real y returns nothing
// 异步执行函数
native DzExecuteFunc takes string funcName returns nothing
// 取鼠标指向的单位
native DzGetUnitUnderMouse takes nothing returns unit
// 设置单位的贴图
native DzSetUnitTexture takes unit whichUnit, string path, integer texId returns nothing
//  设置内存数值
native DzSetMemory takes integer address, real value returns nothing
//  替换单位类型 [BZAPI]
native DzSetUnitID takes unit whichUnit, integer id returns nothing
//  替换单位模型 [BZAPI]
native DzSetUnitModel takes unit whichUnit, string path returns nothing
//  原生 - 设置小地图背景贴图
native DzSetWar3MapMap takes string map returns nothing
// 注册数据同步触发器
native DzTriggerRegisterSyncData takes trigger trig, string prefix, boolean server returns nothing
// 同步游戏数据
native DzSyncData takes string prefix, string data returns nothing
// 获取同步的数据
native DzGetTriggerSyncData takes nothing returns string
// 获取同步数据的玩家
native DzGetTriggerSyncPlayer takes nothing returns player
// 隐藏界面元素
native DzFrameHideInterface takes nothing returns nothing
// 修改游戏世界窗口位置
native DzFrameEditBlackBorders takes real upperHeight, real bottomHeight returns nothing
// 头像
native DzFrameGetPortrait takes nothing returns integer
// 小地图
native DzFrameGetMinimap takes nothing returns integer
// 技能按钮
native DzFrameGetCommandBarButton takes integer row, integer column returns integer
// 英雄按钮
native DzFrameGetHeroBarButton takes integer buttonId returns integer
// 英雄血条
native DzFrameGetHeroHPBar takes integer buttonId returns integer
// 英雄蓝条
native DzFrameGetHeroManaBar takes integer buttonId returns integer
// 道具按钮
native DzFrameGetItemBarButton takes integer buttonId returns integer
// 小地图按钮
native DzFrameGetMinimapButton takes integer buttonId returns integer
// 左上菜单按钮
native DzFrameGetUpperButtonBarButton takes integer buttonId returns integer
// 鼠标提示
native DzFrameGetTooltip takes nothing returns integer
// 聊天信息
native DzFrameGetChatMessage takes nothing returns integer
// 单位信息
native DzFrameGetUnitMessage takes nothing returns integer
// 获取最上的信息
native DzFrameGetTopMessage takes nothing returns integer
// 取rgba色值
native DzGetColor takes integer r, integer g, integer b, integer a returns integer
// 设置界面更新回调（非同步）
native DzFrameSetUpdateCallback takes string func returns nothing
// 界面更新回调
native DzFrameSetUpdateCallbackByCode takes code funcHandle returns nothing
// 显示/隐藏窗体
native DzFrameShow takes integer frame, boolean enable returns nothing
// 创建窗体
native DzCreateFrame takes string frame, integer parent, integer id returns integer
// 创建简单的窗体
native DzCreateSimpleFrame takes string frame, integer parent, integer id returns integer
// 销毁窗体
native DzDestroyFrame takes integer frame returns nothing
// 加载内容目录 (Toc table of contents)
native DzLoadToc takes string fileName returns nothing
// 设置窗体相对位置 [0:左上|1:上|2:右上|3:左|4:中|5:右|6:左下|7:下|8:右下]
native DzFrameSetPoint takes integer frame, integer point, integer relativeFrame, integer relativePoint, real x, real y returns nothing
// 设置窗体绝对位置
native DzFrameSetAbsolutePoint takes integer frame, integer point, real x, real y returns nothing
// 清空窗体锚点
native DzFrameClearAllPoints takes integer frame returns nothing
// 设置窗体禁用/启用
native DzFrameSetEnable takes integer name, boolean enable returns nothing
// 注册用户界面事件回调
native DzFrameSetScript takes integer frame, integer eventId, string func, boolean sync returns nothing
//  注册UI事件回调(func handle)
native DzFrameSetScriptByCode takes integer frame, integer eventId, code funcHandle, boolean sync returns nothing
// 获取触发用户界面事件的玩家
native DzGetTriggerUIEventPlayer takes nothing returns player
// 获取触发用户界面事件的窗体
native DzGetTriggerUIEventFrame takes nothing returns integer
// 通过名称查找窗体
native DzFrameFindByName takes string name, integer id returns integer
// 通过名称查找普通窗体
native DzSimpleFrameFindByName takes string name, integer id returns integer
// 查找字符串
native DzSimpleFontStringFindByName takes string name, integer id returns integer
// 查找BACKDROP frame
native DzSimpleTextureFindByName takes string name, integer id returns integer
// 获取游戏用户界面
native DzGetGameUI takes nothing returns integer
// 点击窗体
native DzClickFrame takes integer frame returns nothing
// 自定义屏幕比例
native DzSetCustomFovFix takes real value returns nothing
// 使用宽屏模式
native DzEnableWideScreen takes boolean enable returns nothing
// 设置文字（支持EditBox, TextFrame, TextArea, SimpleFontString、GlueEditBoxWar3、SlashChatBox、TimerTextFrame、TextButtonFrame、GlueTextButton）
native DzFrameSetText takes integer frame, string text returns nothing
// 获取文字（支持EditBox, TextFrame, TextArea, SimpleFontString）
native DzFrameGetText takes integer frame returns string
// 设置字数限制（支持EditBox）
native DzFrameSetTextSizeLimit takes integer frame, integer size returns nothing
// 获取字数限制（支持EditBox）
native DzFrameGetTextSizeLimit takes integer frame returns integer
// 设置文字颜色（支持TextFrame, EditBox）
native DzFrameSetTextColor takes integer frame, integer color returns nothing
// 获取鼠标所在位置的用户界面控件指针
native DzGetMouseFocus takes nothing returns integer
// 设置所有锚点到目标窗体上
native DzFrameSetAllPoints takes integer frame, integer relativeFrame returns boolean
// 设置焦点
native DzFrameSetFocus takes integer frame, boolean enable returns boolean
// 设置模型（支持Sprite、Model、StatusBar）
native DzFrameSetModel takes integer frame, string modelFile, integer modelType, integer flag returns nothing
// 获取控件是否启用
native DzFrameGetEnable takes integer frame returns boolean
// 设置透明度（0-255）
native DzFrameSetAlpha takes integer frame, integer alpha returns nothing
// 获取透明度（0-255）
native DzFrameGetAlpha takes integer frame returns integer
// 设置动画
native DzFrameSetAnimate takes integer frame, integer animId, boolean autocast returns nothing
// 设置动画进度（autocast为false是可用）
native DzFrameSetAnimateOffset takes integer frame, real offset returns nothing
// 设置texture（支持Backdrop、SimpleStatusBar）
native DzFrameSetTexture takes integer frame, string texture, integer flag returns nothing
// 设置缩放
native DzFrameSetScale takes integer frame, real scale returns nothing
// 设置提示
native DzFrameSetTooltip takes integer frame, integer tooltip returns nothing
// 鼠标限制在用户界面内
native DzFrameCageMouse takes integer frame, boolean enable returns nothing
// 获取当前值（支持Slider、SimpleStatusBar、StatusBar）
native DzFrameGetValue takes integer frame returns real
// 设置最大最小值（支持Slider、SimpleStatusBar、StatusBar）
native DzFrameSetMinMaxValue takes integer frame, real minValue, real maxValue returns nothing
// 设置Step值（支持Slider）
native DzFrameSetStepValue takes integer frame, real step returns nothing
// 设置当前值（支持Slider、SimpleStatusBar、StatusBar）
native DzFrameSetValue takes integer frame, real value returns nothing
// 设置窗体大小
native DzFrameSetSize takes integer frame, real w, real h returns nothing
// 根据tag创建窗体
native DzCreateFrameByTagName takes string frameType, string name, integer parent, string template, integer id returns integer
// 设置颜色（支持SimpleStatusBar）
native DzFrameSetVertexColor takes integer frame, integer color returns nothing
// 不明觉厉
native DzOriginalUIAutoResetPoint takes boolean enable returns nothing
//  设置优先级 [NEW]
native DzFrameSetPriority takes integer frame, integer priority returns nothing
//  设置父窗口 [NEW]
native DzFrameSetParent takes integer frame, integer parent returns nothing
//  设置字体 [NEW]
native DzFrameSetFont takes integer frame, string fileName, real height, integer flag returns nothing
//  获取 Frame 的 高度 [NEW]
native DzFrameGetHeight takes integer frame returns real
//  设置对齐方式 [NEW]
native DzFrameSetTextAlignment takes integer frame, integer align returns nothing
//  获取 Frame 的 Parent [NEW]
native DzFrameGetParent takes integer frame returns integer
// 设置内存大小（废物函数）
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
		//call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"0")
	else
		call DzAPI_Map_Ladder_SetStat(whichPlayer,key,I2S(value))
	endif
endfunction
function DzAPI_Map_Stat_SubmitUnitData takes player whichPlayer, string key,unit value returns nothing
	call DzAPI_Map_Stat_SubmitUnitIdData(whichPlayer,key,GetUnitTypeId(value))
endfunction
function DzAPI_Map_Ladder_SubmitAblityIdData takes player whichPlayer, string key, integer value returns nothing
	if(value==0)then
		//call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"0")
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
	//call DzAPI_Map_Ladder_SetStat(whichPlayer,key,S)
	set S=null
	set whichPlayer=null
endfunction
function DzAPI_Map_Ladder_SubmitItemData takes player whichPlayer, string key, item value returns nothing
	call DzAPI_Map_Ladder_SubmitItemIdData(whichPlayer,key,GetItemTypeId(value))
endfunction
function DzAPI_Map_Ladder_SubmitBooleanData takes player whichPlayer, string key,boolean value  returns nothing
	if(value)then
		call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"1")
	else
		call DzAPI_Map_Ladder_SetStat(whichPlayer,key,"0")
	endif
endfunction
function DzAPI_Map_Ladder_SubmitTitle takes player whichPlayer, string value  returns nothing
	call DzAPI_Map_Ladder_SetStat(whichPlayer,value,"1")
endfunction
function DzAPI_Map_Ladder_SubmitPlayerRank takes player whichPlayer, integer value returns nothing
	call DzAPI_Map_Ladder_SetPlayerStat(whichPlayer,"RankIndex",I2S(value))
endfunction

function DzAPI_Map_Ladder_SubmitPlayerExtraExp takes player whichPlayer, integer value returns nothing
	call DzAPI_Map_Ladder_SetStat(whichPlayer,"ExtraExp",I2S(value))
endfunction



#endif

