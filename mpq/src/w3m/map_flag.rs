pub enum MapFlag {
/// 0x0001：1 =在预览屏幕中隐藏小地图
 HideMinimap=0x0001,
/// 0x0002：1 =修改盟友优先级
 ModifyAllyPriorities=0x0002,
/// 0x0004：1 =近战地图
 MeleeMap=0x0004,
/// 0x0008：1 =可玩地图大小很大且从未减少到中等
 LargeMap=0x0008,
/// 0x0010：1 =蒙面区域部分可见
 MaskedAreaPartiallyVisible=0x0010,
/// 0x0020：1 =自定义力的固定播放器设置
 FixedPlayerSetting=0x0020,
/// 0x0040：1 =使用自定义勢力
 UseCustomForces=0x0040,
/// 0x0080：1 =使用自定义科技樹
 UseCustomTechtree=0x0080,
/// 0x0100：1 =使用自定义技能
 UseCustomAbilities=0x0100,
/// 0x0200：1 =使用自定义升级
 UseCustomUpgrades=0x0200,
/// 0x0400：1 =地图属性菜单至少打开一次地图创建
 MapPropertiesMenuOpened=0x0400,
/// 0x0800：1 =在悬崖海岸上显示水波
 ShowWaterWavesOnCliffShores=0x0800,
/// 0x1000：1 =在滚动海岸上显示水波
 ShowWaterWavesOnRollingShores=0x1000,
}