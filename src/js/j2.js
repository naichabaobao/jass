/**
 * @author 1171866049
 */
module.exports =
  {
    "BlzGetTriggerPlayerMouseX": {
      "documentation": "触发鼠标位置X",
      "original": "native BlzGetTriggerPlayerMouseX takes nothing returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerMouseX",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "real",
      "insertText": "BlzGetTriggerPlayerMouseX()"
    },
    "BlzGetTriggerPlayerMouseY": {
      "documentation": "触发鼠标位置Y",
      "original": "native BlzGetTriggerPlayerMouseY takes nothing returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerMouseY",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "real",
      "insertText": "BlzGetTriggerPlayerMouseY()"
    },
    "BlzGetTriggerPlayerMousePosition": {
      "documentation": "触发鼠标位置",
      "original": "native BlzGetTriggerPlayerMousePosition takes nothing returns location",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerMousePosition",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "location",
      "insertText": "BlzGetTriggerPlayerMousePosition()"
    },
    "BlzGetTriggerPlayerMouseButton": {
      "documentation": "触发鼠标按键",
      "original": "native BlzGetTriggerPlayerMouseButton takes nothing returns mousebuttontype",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerMouseButton",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "mousebuttontype",
      "insertText": "BlzGetTriggerPlayerMouseButton()"
    },
    "BlzSetAbilityTooltip": {
      "documentation": "设置技能提示信息",
      "original": "native BlzSetAbilityTooltip takes integer abilCode,string tooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "tooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityTooltip(abilCode,tooltip,level)"
    },
    "BlzSetAbilityActivatedTooltip": {
      "documentation": "设置技能提示信息（自动施法启用）",
      "original": "native BlzSetAbilityActivatedTooltip takes integer abilCode,string tooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityActivatedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "tooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityActivatedTooltip(abilCode,tooltip,level)"
    },
    "BlzSetAbilityExtendedTooltip": {
      "documentation": "设置技能扩展提示信息",
      "original": "native BlzSetAbilityExtendedTooltip takes integer abilCode,string extendedTooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "extendedTooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityExtendedTooltip(abilCode,extendedTooltip,level)"
    },
    "BlzSetAbilityActivatedExtendedTooltip": {
      "documentation": "设置技能扩展提示信息（自动施法启用）",
      "original": "native BlzSetAbilityActivatedExtendedTooltip takes integer abilCode,string extendedTooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityActivatedExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "extendedTooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityActivatedExtendedTooltip(abilCode,extendedTooltip,level)"
    },
    "BlzSetAbilityResearchTooltip": {
      "documentation": "设置提示信息（学习）",
      "original": "native BlzSetAbilityResearchTooltip takes integer abilCode,string researchTooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityResearchTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "researchTooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityResearchTooltip(abilCode,researchTooltip,level)"
    },
    "BlzSetAbilityResearchExtendedTooltip": {
      "documentation": "设置扩展提示信息（学习）",
      "original": "native BlzSetAbilityResearchExtendedTooltip takes integer abilCode,string researchExtendedTooltip,integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityResearchExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "researchExtendedTooltip"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityResearchExtendedTooltip(abilCode,researchExtendedTooltip,level)"
    },
    "BlzGetAbilityTooltip": {
      "documentation": "技能提示信息",
      "original": "native BlzGetAbilityTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityTooltip(abilCode,level)"
    },
    "BlzGetAbilityActivatedTooltip": {
      "documentation": "技能提示信息（自动施法启用）",
      "original": "native BlzGetAbilityActivatedTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityActivatedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityActivatedTooltip(abilCode,level)"
    },
    "BlzGetAbilityExtendedTooltip": {
      "documentation": "技能扩展提示信息",
      "original": "native BlzGetAbilityExtendedTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityExtendedTooltip(abilCode,level)"
    },
    "BlzGetAbilityActivatedExtendedTooltip": {
      "documentation": "技能扩展提示信息（自动施法启用）",
      "original": "native BlzGetAbilityActivatedExtendedTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityActivatedExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityActivatedExtendedTooltip(abilCode,level)"
    },
    "BlzGetAbilityResearchTooltip": {
      "documentation": "技能提示信息（学习）",
      "original": "native BlzGetAbilityResearchTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityResearchTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityResearchTooltip(abilCode,level)"
    },
    "BlzGetAbilityResearchExtendedTooltip": {
      "documentation": "技能扩展提示信息（学习）",
      "original": "native BlzGetAbilityResearchExtendedTooltip takes integer abilCode,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityResearchExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityResearchExtendedTooltip(abilCode,level)"
    },
    "BlzSetAbilityIcon": {
      "documentation": "设置技能图标",
      "original": "native BlzSetAbilityIcon takes integer abilCode,string iconPath returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityIcon",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "iconPath"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityIcon(abilCode,iconPath)"
    },
    "BlzGetAbilityIcon": {
      "documentation": "技能图标",
      "original": "native BlzGetAbilityIcon takes integer abilCode returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityIcon",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityIcon(abilCode)"
    },
    "BlzSetAbilityActivatedIcon": {
      "documentation": "设置技能图标（自动施法启用）",
      "original": "native BlzSetAbilityActivatedIcon takes integer abilCode,string iconPath returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityActivatedIcon",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "string",
        "name": "iconPath"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityActivatedIcon(abilCode,iconPath)"
    },
    "BlzGetAbilityActivatedIcon": {
      "documentation": "技能图标（自动施法启用）",
      "original": "native BlzGetAbilityActivatedIcon takes integer abilCode returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityActivatedIcon",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityActivatedIcon(abilCode)"
    },
    "BlzGetAbilityPosX": {
      "documentation": "技能位置 - X",
      "original": "native BlzGetAbilityPosX takes integer abilCode returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityPosX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityPosX(abilCode)"
    },
    "BlzGetAbilityPosY": {
      "documentation": "技能位置 - Y",
      "original": "native BlzGetAbilityPosY takes integer abilCode returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityPosY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityPosY(abilCode)"
    },
    "BlzSetAbilityPosX": {
      "documentation": "设置技能位置X",
      "original": "native BlzSetAbilityPosX takes integer abilCode,integer x returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityPosX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "x"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityPosX(abilCode,x)"
    },
    "BlzSetAbilityPosY": {
      "documentation": "设置技能位置Y",
      "original": "native BlzSetAbilityPosY takes integer abilCode,integer y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityPosY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityPosY(abilCode,y)"
    },
    "BlzGetAbilityActivatedPosX": {
      "documentation": "技能位置 - X (自动施法)",
      "original": "native BlzGetAbilityActivatedPosX takes integer abilCode returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityActivatedPosX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityActivatedPosX(abilCode)"
    },
    "BlzGetAbilityActivatedPosY": {
      "documentation": "技能位置 - Y (自动施法)",
      "original": "native BlzGetAbilityActivatedPosY takes integer abilCode returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityActivatedPosY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityActivatedPosY(abilCode)"
    },
    "BlzSetAbilityActivatedPosX": {
      "documentation": "设置技能位置X（自动施法启用）",
      "original": "native BlzSetAbilityActivatedPosX takes integer abilCode,integer x returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityActivatedPosX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "x"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityActivatedPosX(abilCode,x)"
    },
    "BlzSetAbilityActivatedPosY": {
      "documentation": "设置技能位置Y（自动施法启用）",
      "original": "native BlzSetAbilityActivatedPosY takes integer abilCode,integer y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityActivatedPosY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilCode"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetAbilityActivatedPosY(abilCode,y)"
    },
    "BlzGetUnitMaxHP": {
      "documentation": "获取单位最大生命值",
      "original": "native BlzGetUnitMaxHP takes unit whichUnit returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitMaxHP",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitMaxHP(whichUnit)"
    },
    "BlzSetUnitMaxHP": {
      "documentation": "设置最大生命值",
      "original": "native BlzSetUnitMaxHP takes unit whichUnit,integer hp returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitMaxHP",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "hp"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitMaxHP(whichUnit,hp)"
    },
    "BlzGetUnitMaxMana": {
      "documentation": "获取单位最大魔法值",
      "original": "native BlzGetUnitMaxMana takes unit whichUnit returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitMaxMana",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitMaxMana(whichUnit)"
    },
    "BlzSetUnitMaxMana": {
      "documentation": "设置最大法力值",
      "original": "native BlzSetUnitMaxMana takes unit whichUnit,integer mana returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitMaxMana",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "mana"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitMaxMana(whichUnit,mana)"
    },
    "BlzSetItemName": {
      "documentation": "设置物品名字",
      "original": "native BlzSetItemName takes item whichItem,string name returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetItemName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "string",
        "name": "name"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetItemName(whichItem,name)"
    },
    "BlzSetItemDescription": {
      "documentation": "设置物品介绍",
      "original": "native BlzSetItemDescription takes item whichItem,string description returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetItemDescription",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "string",
        "name": "description"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetItemDescription(whichItem,description)"
    },
    "BlzGetItemDescription": {
      "documentation": "物品介绍",
      "original": "native BlzGetItemDescription takes item whichItem returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetItemDescription",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }],
      "returnType": "string",
      "insertText": "BlzGetItemDescription(whichItem)"
    },
    "BlzSetItemTooltip": {
      "documentation": "设置物品提示",
      "original": "native BlzSetItemTooltip takes item whichItem,string tooltip returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetItemTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "string",
        "name": "tooltip"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetItemTooltip(whichItem,tooltip)"
    },
    "BlzGetItemTooltip": {
      "documentation": "物品提示信息",
      "original": "native BlzGetItemTooltip takes item whichItem returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetItemTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }],
      "returnType": "string",
      "insertText": "BlzGetItemTooltip(whichItem)"
    },
    "BlzSetItemExtendedTooltip": {
      "documentation": "设置物品扩展提示",
      "original": "native BlzSetItemExtendedTooltip takes item whichItem,string extendedTooltip returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetItemExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "string",
        "name": "extendedTooltip"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetItemExtendedTooltip(whichItem,extendedTooltip)"
    },
    "BlzGetItemExtendedTooltip": {
      "documentation": "物品扩展提示信息",
      "original": "native BlzGetItemExtendedTooltip takes item whichItem returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetItemExtendedTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }],
      "returnType": "string",
      "insertText": "BlzGetItemExtendedTooltip(whichItem)"
    },
    "BlzSetItemIconPath": {
      "documentation": "设置物品图标路径",
      "original": "native BlzSetItemIconPath takes item whichItem,string iconPath returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetItemIconPath",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "string",
        "name": "iconPath"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetItemIconPath(whichItem,iconPath)"
    },
    "BlzGetItemIconPath": {
      "documentation": "物品图标",
      "original": "native BlzGetItemIconPath takes item whichItem returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetItemIconPath",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }],
      "returnType": "string",
      "insertText": "BlzGetItemIconPath(whichItem)"
    },
    "BlzSetUnitName": {
      "documentation": "设置单位名字",
      "original": "native BlzSetUnitName takes unit whichUnit,string name returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "string",
        "name": "name"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitName(whichUnit,name)"
    },
    "BlzSetHeroProperName": {
      "documentation": "设置英雄称谓",
      "original": "native BlzSetHeroProperName takes unit whichUnit,string heroProperName returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetHeroProperName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "string",
        "name": "heroProperName"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetHeroProperName(whichUnit,heroProperName)"
    },
    "BlzGetUnitBaseDamage": {
      "documentation": "获取单位基础伤害",
      "original": "native BlzGetUnitBaseDamage takes unit whichUnit,integer weaponIndex returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitBaseDamage",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitBaseDamage(whichUnit,weaponIndex)"
    },
    "BlzSetUnitBaseDamage": {
      "documentation": "设置基础伤害",
      "original": "native BlzSetUnitBaseDamage takes unit whichUnit,integer baseDamage,integer weaponIndex returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitBaseDamage",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "baseDamage"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitBaseDamage(whichUnit,baseDamage,weaponIndex)"
    },
    "BlzGetUnitDiceNumber": {
      "documentation": "获取单位骰子数量",
      "original": "native BlzGetUnitDiceNumber takes unit whichUnit,integer weaponIndex returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitDiceNumber",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitDiceNumber(whichUnit,weaponIndex)"
    },
    "BlzSetUnitDiceNumber": {
      "documentation": "设置单位骰子数",
      "original": "native BlzSetUnitDiceNumber takes unit whichUnit,integer diceNumber,integer weaponIndex returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitDiceNumber",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "diceNumber"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitDiceNumber(whichUnit,diceNumber,weaponIndex)"
    },
    "BlzGetUnitDiceSides": {
      "documentation": "获取单位骰子面数",
      "original": "native BlzGetUnitDiceSides takes unit whichUnit,integer weaponIndex returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitDiceSides",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitDiceSides(whichUnit,weaponIndex)"
    },
    "BlzSetUnitDiceSides": {
      "documentation": "设置骰子面数",
      "original": "native BlzSetUnitDiceSides takes unit whichUnit,integer diceSides,integer weaponIndex returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitDiceSides",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "diceSides"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitDiceSides(whichUnit,diceSides,weaponIndex)"
    },
    "BlzGetUnitAttackCooldown": {
      "documentation": "攻击间隔",
      "original": "native BlzGetUnitAttackCooldown takes unit whichUnit,integer weaponIndex returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAttackCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitAttackCooldown(whichUnit,weaponIndex)"
    },
    "BlzSetUnitAttackCooldown": {
      "documentation": "设置攻击间隔",
      "original": "native BlzSetUnitAttackCooldown takes unit whichUnit,real cooldown,integer weaponIndex returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitAttackCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "real",
        "name": "cooldown"
      }, {
        "type": "integer",
        "name": "weaponIndex"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitAttackCooldown(whichUnit,cooldown,weaponIndex)"
    },
    "BlzSetSpecialEffectColorByPlayer": {
      "documentation": "按玩家设置特效颜色",
      "original": "native BlzSetSpecialEffectColorByPlayer takes effect whichEffect,player whichPlayer returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectColorByPlayer",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectColorByPlayer(whichEffect,whichPlayer)"
    },
    "BlzSetSpecialEffectColor": {
      "documentation": "设置特效颜色",
      "original": "native BlzSetSpecialEffectColor takes effect whichEffect,integer r,integer g,integer b returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectColor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "integer",
        "name": "r"
      }, {
        "type": "integer",
        "name": "g"
      }, {
        "type": "integer",
        "name": "b"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectColor(whichEffect,r,g,b)"
    },
    "BlzSetSpecialEffectAlpha": {
      "documentation": "设置特效透明度",
      "original": "native BlzSetSpecialEffectAlpha takes effect whichEffect,integer alpha returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectAlpha",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "integer",
        "name": "alpha"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectAlpha(whichEffect,alpha)"
    },
    "BlzSetSpecialEffectScale": {
      "documentation": "设置特效缩放",
      "original": "native BlzSetSpecialEffectScale takes effect whichEffect,real scale returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "scale"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectScale(whichEffect,scale)"
    },
    "BlzSetSpecialEffectPosition": {
      "documentation": "设置特效坐标",
      "original": "native BlzSetSpecialEffectPosition takes effect whichEffect,real x,real y,real z returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectPosition",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "x"
      }, {
        "type": "real",
        "name": "y"
      }, {
        "type": "real",
        "name": "z"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectPosition(whichEffect,x,y,z)"
    },
    "BlzSetSpecialEffectHeight": {
      "documentation": "设置特效高度",
      "original": "native BlzSetSpecialEffectHeight takes effect whichEffect,real height returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectHeight",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "height"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectHeight(whichEffect,height)"
    },
    "BlzSetSpecialEffectTimeScale": {
      "documentation": "设置特效时间比例",
      "original": "native BlzSetSpecialEffectTimeScale takes effect whichEffect,real timeScale returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectTimeScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "timeScale"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectTimeScale(whichEffect,timeScale)"
    },
    "BlzSetSpecialEffectTime": {
      "documentation": "设置特效时间",
      "original": "native BlzSetSpecialEffectTime takes effect whichEffect,real time returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectTime",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "time"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectTime(whichEffect,time)"
    },
    "BlzSetSpecialEffectOrientation": {
      "documentation": "设置特效朝向",
      "original": "native BlzSetSpecialEffectOrientation takes effect whichEffect,real yaw,real pitch,real roll returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectOrientation",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "yaw"
      }, {
        "type": "real",
        "name": "pitch"
      }, {
        "type": "real",
        "name": "roll"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectOrientation(whichEffect,yaw,pitch,roll)"
    },
    "BlzSetSpecialEffectYaw": {
      "documentation": "设置特效横摇",
      "original": "native BlzSetSpecialEffectYaw takes effect whichEffect,real yaw returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectYaw",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "yaw"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectYaw(whichEffect,yaw)"
    },
    "BlzSetSpecialEffectPitch": {
      "documentation": "设置特效纵摇",
      "original": "native BlzSetSpecialEffectPitch takes effect whichEffect,real pitch returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectPitch",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "pitch"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectPitch(whichEffect,pitch)"
    },
    "BlzSetSpecialEffectRoll": {
      "documentation": "设置特效滚摇",
      "original": "native BlzSetSpecialEffectRoll takes effect whichEffect,real roll returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectRoll",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "roll"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectRoll(whichEffect,roll)"
    },
    "BlzSetSpecialEffectX": {
      "documentation": "设置特效X坐标",
      "original": "native BlzSetSpecialEffectX takes effect whichEffect,real x returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "x"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectX(whichEffect,x)"
    },
    "BlzSetSpecialEffectY": {
      "documentation": "设置特效Y坐标",
      "original": "native BlzSetSpecialEffectY takes effect whichEffect,real y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectY(whichEffect,y)"
    },
    "BlzSetSpecialEffectZ": {
      "documentation": "设置特效Z坐标",
      "original": "native BlzSetSpecialEffectZ takes effect whichEffect,real z returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectZ",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "z"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectZ(whichEffect,z)"
    },
    "BlzSetSpecialEffectPositionLoc": {
      "documentation": "设置特效点",
      "original": "native BlzSetSpecialEffectPositionLoc takes effect whichEffect,location loc returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectPositionLoc",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "location",
        "name": "loc"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectPositionLoc(whichEffect,loc)"
    },
    "BlzGetLocalSpecialEffectX": {
      "documentation": "特效位置 - X",
      "original": "native BlzGetLocalSpecialEffectX takes effect whichEffect returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalSpecialEffectX",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "real",
      "insertText": "BlzGetLocalSpecialEffectX(whichEffect)"
    },
    "BlzGetLocalSpecialEffectY": {
      "documentation": "特效位置 - Y",
      "original": "native BlzGetLocalSpecialEffectY takes effect whichEffect returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalSpecialEffectY",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "real",
      "insertText": "BlzGetLocalSpecialEffectY(whichEffect)"
    },
    "BlzGetLocalSpecialEffectZ": {
      "documentation": "特效位置 - Z",
      "original": "native BlzGetLocalSpecialEffectZ takes effect whichEffect returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalSpecialEffectZ",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "real",
      "insertText": "BlzGetLocalSpecialEffectZ(whichEffect)"
    },
    "BlzSpecialEffectClearSubAnimations": {
      "documentation": "清除特效子动画",
      "original": "native BlzSpecialEffectClearSubAnimations takes effect whichEffect returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSpecialEffectClearSubAnimations",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "nothing",
      "insertText": "BlzSpecialEffectClearSubAnimations(whichEffect)"
    },
    "BlzSpecialEffectRemoveSubAnimation": {
      "documentation": "移除特效子动画",
      "original": "native BlzSpecialEffectRemoveSubAnimation takes effect whichEffect,subanimtype whichSubAnim returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSpecialEffectRemoveSubAnimation",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "subanimtype",
        "name": "whichSubAnim"
      }],
      "returnType": "nothing",
      "insertText": "BlzSpecialEffectRemoveSubAnimation(whichEffect,whichSubAnim)"
    },
    "BlzSpecialEffectAddSubAnimation": {
      "documentation": "添加特效子动画",
      "original": "native BlzSpecialEffectAddSubAnimation takes effect whichEffect,subanimtype whichSubAnim returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSpecialEffectAddSubAnimation",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "subanimtype",
        "name": "whichSubAnim"
      }],
      "returnType": "nothing",
      "insertText": "BlzSpecialEffectAddSubAnimation(whichEffect,whichSubAnim)"
    },
    "BlzPlaySpecialEffect": {
      "documentation": "播放特效动画",
      "original": "native BlzPlaySpecialEffect takes effect whichEffect,animtype whichAnim returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzPlaySpecialEffect",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "animtype",
        "name": "whichAnim"
      }],
      "returnType": "nothing",
      "insertText": "BlzPlaySpecialEffect(whichEffect,whichAnim)"
    },
    "BlzPlaySpecialEffectWithTimeScale": {
      "documentation": "播放特效动画持续时间",
      "original": "native BlzPlaySpecialEffectWithTimeScale takes effect whichEffect,animtype whichAnim,real timeScale returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzPlaySpecialEffectWithTimeScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "animtype",
        "name": "whichAnim"
      }, {
        "type": "real",
        "name": "timeScale"
      }],
      "returnType": "nothing",
      "insertText": "BlzPlaySpecialEffectWithTimeScale(whichEffect,whichAnim,timeScale)"
    },
    "BlzGetAnimName": {
      "documentation": "获取动画名",
      "original": "native BlzGetAnimName takes animtype whichAnim returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAnimName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "animtype",
        "name": "whichAnim"
      }],
      "returnType": "string",
      "insertText": "BlzGetAnimName(whichAnim)"
    },
    "BlzGetUnitArmor": {
      "documentation": "获取护甲",
      "original": "native BlzGetUnitArmor takes unit whichUnit returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitArmor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitArmor(whichUnit)"
    },
    "BlzSetUnitArmor": {
      "documentation": "设置护甲",
      "original": "native BlzSetUnitArmor takes unit whichUnit,real armorAmount returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitArmor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "real",
        "name": "armorAmount"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitArmor(whichUnit,armorAmount)"
    },
    "BlzUnitHideAbility": {
      "documentation": "隐藏技能",
      "original": "native BlzUnitHideAbility takes unit whichUnit,integer abilId,boolean flag returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzUnitHideAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "boolean",
        "name": "flag"
      }],
      "returnType": "nothing",
      "insertText": "BlzUnitHideAbility(whichUnit,abilId,flag)"
    },
    "BlzUnitDisableAbility": {
      "documentation": "禁用技能",
      "original": "native BlzUnitDisableAbility takes unit whichUnit,integer abilId,boolean flag,boolean hideUI returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzUnitDisableAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "boolean",
        "name": "flag"
      }, {
        "type": "boolean",
        "name": "hideUI"
      }],
      "returnType": "nothing",
      "insertText": "BlzUnitDisableAbility(whichUnit,abilId,flag,hideUI)"
    },
    "BlzUnitCancelTimedLife": {
      "documentation": "取消限时生命",
      "original": "native BlzUnitCancelTimedLife takes unit whichUnit returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzUnitCancelTimedLife",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "nothing",
      "insertText": "BlzUnitCancelTimedLife(whichUnit)"
    },
    "BlzIsUnitSelectable": {
      "documentation": "单位能被选择",
      "original": "native BlzIsUnitSelectable takes unit whichUnit returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsUnitSelectable",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "boolean",
      "insertText": "BlzIsUnitSelectable(whichUnit)"
    },
    "BlzIsUnitInvulnerable": {
      "documentation": "单位是无敌的",
      "original": "native BlzIsUnitInvulnerable takes unit whichUnit returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsUnitInvulnerable",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "boolean",
      "insertText": "BlzIsUnitInvulnerable(whichUnit)"
    },
    "BlzUnitInterruptAttack": {
      "documentation": "打断攻击",
      "original": "native BlzUnitInterruptAttack takes unit whichUnit returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzUnitInterruptAttack",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "nothing",
      "insertText": "BlzUnitInterruptAttack(whichUnit)"
    },
    "BlzGetUnitCollisionSize": {
      "documentation": "碰撞体积",
      "original": "native BlzGetUnitCollisionSize takes unit whichUnit returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitCollisionSize",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitCollisionSize(whichUnit)"
    },
    "BlzGetAbilityManaCost": {
      "documentation": "技能魔法消耗",
      "original": "native BlzGetAbilityManaCost takes integer abilId,integer level returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityManaCost",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityManaCost(abilId,level)"
    },
    "BlzGetAbilityCooldown": {
      "documentation": "技能冷却时间",
      "original": "native BlzGetAbilityCooldown takes integer abilId,integer level returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "real",
      "insertText": "BlzGetAbilityCooldown(abilId,level)"
    },
    "BlzSetUnitAbilityCooldown": {
      "documentation": "设置技能冷却时间",
      "original": "native BlzSetUnitAbilityCooldown takes unit whichUnit,integer abilId,integer level,real cooldown returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitAbilityCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "real",
        "name": "cooldown"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitAbilityCooldown(whichUnit,abilId,level,cooldown)"
    },
    "BlzGetUnitAbilityCooldown": {
      "documentation": "单位的技能冷却时间",
      "original": "native BlzGetUnitAbilityCooldown takes unit whichUnit,integer abilId,integer level returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAbilityCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitAbilityCooldown(whichUnit,abilId,level)"
    },
    "BlzGetUnitAbilityCooldownRemaining": {
      "documentation": "单位技能的剩余冷却时间",
      "original": "native BlzGetUnitAbilityCooldownRemaining takes unit whichUnit,integer abilId returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAbilityCooldownRemaining",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitAbilityCooldownRemaining(whichUnit,abilId)"
    },
    "BlzEndUnitAbilityCooldown": {
      "documentation": "重设技能冷却",
      "original": "native BlzEndUnitAbilityCooldown takes unit whichUnit,integer abilCode returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzEndUnitAbilityCooldown",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "nothing",
      "insertText": "BlzEndUnitAbilityCooldown(whichUnit,abilCode)"
    },
    "BlzGetUnitAbilityManaCost": {
      "documentation": "单位技能魔法消耗",
      "original": "native BlzGetUnitAbilityManaCost takes unit whichUnit,integer abilId,integer level returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAbilityManaCost",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitAbilityManaCost(whichUnit,abilId,level)"
    },
    "BlzSetUnitAbilityManaCost": {
      "documentation": "设置单位技能法力消耗",
      "original": "native BlzSetUnitAbilityManaCost takes unit whichUnit,integer abilId,integer level,integer manaCost returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitAbilityManaCost",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "manaCost"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetUnitAbilityManaCost(whichUnit,abilId,level,manaCost)"
    },
    "BlzGetLocalUnitZ": {
      "documentation": "获取本地单位Z坐标",
      "original": "native BlzGetLocalUnitZ takes unit whichUnit returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalUnitZ",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "real",
      "insertText": "BlzGetLocalUnitZ(whichUnit)"
    },
    "BlzDecPlayerTechResearched": {
      "documentation": "降低玩家科技",
      "original": "native BlzDecPlayerTechResearched takes player whichPlayer,integer techid,integer levels returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzDecPlayerTechResearched",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "integer",
        "name": "techid"
      }, {
        "type": "integer",
        "name": "levels"
      }],
      "returnType": "nothing",
      "insertText": "BlzDecPlayerTechResearched(whichPlayer,techid,levels)"
    },
    "BlzSetEventDamage": {
      "documentation": "设置单位伤害事件的伤害",
      "original": "native BlzSetEventDamage takes real damage returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetEventDamage",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "real",
        "name": "damage"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetEventDamage(damage)"
    },
    "BlzGetEventDamageTarget": {
      "documentation": "获取事件伤害目标",
      "original": "native BlzGetEventDamageTarget takes nothing returns unit",
      "filename": "BZapi.txt",
      "name": "BlzGetEventDamageTarget",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "unit",
      "insertText": "BlzGetEventDamageTarget()"
    },
    "BlzGetEventAttackType": {
      "documentation": "获取事件攻击类型",
      "original": "native BlzGetEventAttackType takes nothing returns attacktype",
      "filename": "BZapi.txt",
      "name": "BlzGetEventAttackType",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "attacktype",
      "insertText": "BlzGetEventAttackType()"
    },
    "BlzGetEventDamageType": {
      "documentation": "获取事件伤害类型",
      "original": "native BlzGetEventDamageType takes nothing returns damagetype",
      "filename": "BZapi.txt",
      "name": "BlzGetEventDamageType",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "damagetype",
      "insertText": "BlzGetEventDamageType()"
    },
    "BlzGetEventWeaponType": {
      "documentation": "获取时间武器类型",
      "original": "native BlzGetEventWeaponType takes nothing returns weapontype",
      "filename": "BZapi.txt",
      "name": "BlzGetEventWeaponType",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "weapontype",
      "insertText": "BlzGetEventWeaponType()"
    },
    "BlzSetEventAttackType": {
      "documentation": "设置事件攻击类型",
      "original": "native BlzSetEventAttackType takes attacktype attackType returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetEventAttackType",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "attacktype",
        "name": "attackType"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetEventAttackType(attackType)"
    },
    "BlzSetEventDamageType": {
      "documentation": "设置事件伤害类型",
      "original": "native BlzSetEventDamageType takes damagetype damageType returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetEventDamageType",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "damagetype",
        "name": "damageType"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetEventDamageType(damageType)"
    },
    "BlzSetEventWeaponType": {
      "documentation": "设置事件武器类型",
      "original": "native BlzSetEventWeaponType takes weapontype weaponType returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetEventWeaponType",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "weapontype",
        "name": "weaponType"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetEventWeaponType(weaponType)"
    },
    "BlzGetUnitZ": {
      "documentation": "获取单位Z坐标",
      "original": "native BlzGetUnitZ takes unit whichUnit returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitZ",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitZ(whichUnit)"
    },
    "BlzEnableSelections": {
      "documentation": "启用选择",
      "original": "native BlzEnableSelections takes boolean enableSelection,boolean enableSelectionCircle returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzEnableSelections",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "boolean",
        "name": "enableSelection"
      }, {
        "type": "boolean",
        "name": "enableSelectionCircle"
      }],
      "returnType": "nothing",
      "insertText": "BlzEnableSelections(enableSelection,enableSelectionCircle)"
    },
    "BlzIsSelectionEnabled": {
      "documentation": "选择被允许",
      "original": "native BlzIsSelectionEnabled takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsSelectionEnabled",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "boolean",
      "insertText": "BlzIsSelectionEnabled()"
    },
    "BlzIsSelectionCircleEnabled": {
      "documentation": "选择框被启用",
      "original": "native BlzIsSelectionCircleEnabled takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsSelectionCircleEnabled",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "boolean",
      "insertText": "BlzIsSelectionCircleEnabled()"
    },
    "BlzCameraSetupApplyForceDurationSmooth": {
      "documentation": "设置镜头平滑持续时间",
      "original": "native BlzCameraSetupApplyForceDurationSmooth takes camerasetup whichSetup,boolean doPan,real forcedDuration,real easeInDuration,real easeOutDuration,real smoothFactor returns",
      "filename": "BZapi.txt",
      "name": "BlzCameraSetupApplyForceDurationSmooth",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "camerasetup",
        "name": "whichSetup"
      }, {
        "type": "boolean",
        "name": "doPan"
      }, {
        "type": "real",
        "name": "forcedDuration"
      }, {
        "type": "real",
        "name": "easeInDuration"
      }, {
        "type": "real",
        "name": "easeOutDuration"
      }],
      "returnType": "returns",
      "insertText": "BlzCameraSetupApplyForceDurationSmooth(whichSetup,doPan,forcedDuration,easeInDuration,easeOutDuration)"
    },
    "BlzEnableTargetIndicator": {
      "documentation": "启用目标提示器",
      "original": "native BlzEnableTargetIndicator takes boolean enable returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzEnableTargetIndicator",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "nothing",
      "insertText": "BlzEnableTargetIndicator(enable)"
    },
    "BlzIsTargetIndicatorEnabled": {
      "documentation": "闪动指示器被启用",
      "original": "native BlzIsTargetIndicatorEnabled takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsTargetIndicatorEnabled",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "boolean",
      "insertText": "BlzIsTargetIndicatorEnabled()"
    },
    "BlzBitOr": {
      "documentation": "按位或",
      "original": "native BlzBitOr takes integer x,integer y returns integer",
      "filename": "BZapi.txt",
      "name": "BlzBitOr",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "x"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "integer",
      "insertText": "BlzBitOr(x,y)"
    },
    "BlzBitAnd": {
      "documentation": "按位与",
      "original": "native BlzBitAnd takes integer x,integer y returns integer",
      "filename": "BZapi.txt",
      "name": "BlzBitAnd",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "x"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "integer",
      "insertText": "BlzBitAnd(x,y)"
    },
    "BlzBitXor": {
      "documentation": "按位异或",
      "original": "native BlzBitXor takes integer x,integer y returns integer",
      "filename": "BZapi.txt",
      "name": "BlzBitXor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "x"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "integer",
      "insertText": "BlzBitXor(x,y)"
    },
    "BlzGetAbilityBooleanField": {
      "documentation": "技能布尔类型域",
      "original": "native BlzGetAbilityBooleanField takes ability whichAbility,abilitybooleanfield whichField returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanfield",
        "name": "whichField"
      }],
      "returnType": "boolean",
      "insertText": "BlzGetAbilityBooleanField(whichAbility,whichField)"
    },
    "BlzGetAbilityIntegerField": {
      "documentation": "技能的整数类型域",
      "original": "native BlzGetAbilityIntegerField takes ability whichAbility,abilityintegerfield whichField returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityIntegerField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerfield",
        "name": "whichField"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityIntegerField(whichAbility,whichField)"
    },
    "BlzGetAbilityRealField": {
      "documentation": "技能的实数类型域",
      "original": "native BlzGetAbilityRealField takes ability whichAbility,abilityrealfield whichField returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityRealField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityrealfield",
        "name": "whichField"
      }],
      "returnType": "real",
      "insertText": "BlzGetAbilityRealField(whichAbility,whichField)"
    },
    "BlzGetAbilityStringField": {
      "documentation": "技能字符串字段",
      "original": "native BlzGetAbilityStringField takes ability whichAbility,abilitystringfield whichField returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityStringField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringfield",
        "name": "whichField"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityStringField(whichAbility,whichField)"
    },
    "BlzGetAbilityBooleanLevelField": {
      "documentation": "技能随等级改变的布尔类型域",
      "original": "native BlzGetAbilityBooleanLevelField takes ability whichAbility,abilitybooleanlevelfield whichField,integer level returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityBooleanLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "boolean",
      "insertText": "BlzGetAbilityBooleanLevelField(whichAbility,whichField,level)"
    },
    "BlzGetAbilityIntegerLevelField": {
      "documentation": "技能随等级改变的整数类型域",
      "original": "native BlzGetAbilityIntegerLevelField takes ability whichAbility,abilityintegerlevelfield whichField,integer level returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityIntegerLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityIntegerLevelField(whichAbility,whichField,level)"
    },
    "BlzGetAbilityRealLevelField": {
      "documentation": "技能随等级改变的实数类型域",
      "original": "native BlzGetAbilityRealLevelField takes ability whichAbility,abilityreallevelfield whichField,integer level returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityRealLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "real",
      "insertText": "BlzGetAbilityRealLevelField(whichAbility,whichField,level)"
    },
    "BlzGetAbilityStringLevelField": {
      "documentation": "技能字符串等级字段",
      "original": "native BlzGetAbilityStringLevelField takes ability whichAbility,abilitystringlevelfield whichField,integer level returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityStringLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityStringLevelField(whichAbility,whichField,level)"
    },
    "BlzGetAbilityBooleanLevelArrayField": {
      "documentation": "技能随等级改变的布尔类型域",
      "original": "native BlzGetAbilityBooleanLevelArrayField takes ability whichAbility,abilitybooleanlevelarrayfield whichField,integer level,integer index returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityBooleanLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "boolean",
      "insertText": "BlzGetAbilityBooleanLevelArrayField(whichAbility,whichField,level,index)"
    },
    "BlzGetAbilityIntegerLevelArrayField": {
      "documentation": "技能随等级改变的整数类型域",
      "original": "native BlzGetAbilityIntegerLevelArrayField takes ability whichAbility,abilityintegerlevelarrayfield whichField,integer level,integer index returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityIntegerLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "integer",
      "insertText": "BlzGetAbilityIntegerLevelArrayField(whichAbility,whichField,level,index)"
    },
    "BlzGetAbilityRealLevelArrayField": {
      "documentation": "技能随等级改变的实数类型域",
      "original": "native BlzGetAbilityRealLevelArrayField takes ability whichAbility,abilityreallevelarrayfield whichField,integer level,integer index returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityRealLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "real",
      "insertText": "BlzGetAbilityRealLevelArrayField(whichAbility,whichField,level,index)"
    },
    "BlzGetAbilityStringLevelArrayField": {
      "documentation": "技能字符串等级数组字段",
      "original": "native BlzGetAbilityStringLevelArrayField takes ability whichAbility,abilitystringlevelarrayfield whichField,integer level,integer index returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetAbilityStringLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "string",
      "insertText": "BlzGetAbilityStringLevelArrayField(whichAbility,whichField,level,index)"
    },
    "BlzSetAbilityBooleanField": {
      "documentation": "改变技能的布尔类型域",
      "original": "native BlzSetAbilityBooleanField takes ability whichAbility,abilitybooleanfield whichField,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanfield",
        "name": "whichField"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityBooleanField(whichAbility,whichField,value)"
    },
    "BlzSetAbilityIntegerField": {
      "documentation": "改变技能的整数类型域",
      "original": "native BlzSetAbilityIntegerField takes ability whichAbility,abilityintegerfield whichField,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityIntegerField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityIntegerField(whichAbility,whichField,value)"
    },
    "BlzSetAbilityRealField": {
      "documentation": "改变技能的实数类型域",
      "original": "native BlzSetAbilityRealField takes ability whichAbility,abilityrealfield whichField,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityRealField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityrealfield",
        "name": "whichField"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityRealField(whichAbility,whichField,value)"
    },
    "BlzSetAbilityStringField": {
      "documentation": "改变技能的字符串类型域",
      "original": "native BlzSetAbilityStringField takes ability whichAbility,abilitystringfield whichField,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityStringField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringfield",
        "name": "whichField"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityStringField(whichAbility,whichField,value)"
    },
    "BlzSetAbilityBooleanLevelField": {
      "documentation": "改变技能的随等级改变的布尔类型域",
      "original": "native BlzSetAbilityBooleanLevelField takes ability whichAbility,abilitybooleanlevelfield whichField,integer level,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityBooleanLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityBooleanLevelField(whichAbility,whichField,level,value)"
    },
    "BlzSetAbilityIntegerLevelField": {
      "documentation": "改变技能随等级改变的整数类型域",
      "original": "native BlzSetAbilityIntegerLevelField takes ability whichAbility,abilityintegerlevelfield whichField,integer level,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityIntegerLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityIntegerLevelField(whichAbility,whichField,level,value)"
    },
    "BlzSetAbilityRealLevelField": {
      "documentation": "改变技能随等级改变的实数类型域",
      "original": "native BlzSetAbilityRealLevelField takes ability whichAbility,abilityreallevelfield whichField,integer level,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityRealLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityRealLevelField(whichAbility,whichField,level,value)"
    },
    "BlzSetAbilityStringLevelField": {
      "documentation": "改变技能随等级改变的字符串类型域",
      "original": "native BlzSetAbilityStringLevelField takes ability whichAbility,abilitystringlevelfield whichField,integer level,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityStringLevelField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityStringLevelField(whichAbility,whichField,level,value)"
    },
    "BlzSetAbilityBooleanLevelArrayField": {
      "documentation": "改变技能随等级改变的布尔数组类型域",
      "original": "native BlzSetAbilityBooleanLevelArrayField takes ability whichAbility,abilitybooleanlevelarrayfield whichField,integer level,integer index,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityBooleanLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityBooleanLevelArrayField(whichAbility,whichField,level,index,value)"
    },
    "BlzSetAbilityIntegerLevelArrayField": {
      "documentation": "改变技能随等级改变的整数数组类型域",
      "original": "native BlzSetAbilityIntegerLevelArrayField takes ability whichAbility,abilityintegerlevelarrayfield whichField,integer level,integer index,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityIntegerLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityIntegerLevelArrayField(whichAbility,whichField,level,index,value)"
    },
    "BlzSetAbilityRealLevelArrayField": {
      "documentation": "改变技能随等级改变的实数数组类型域",
      "original": "native BlzSetAbilityRealLevelArrayField takes ability whichAbility,abilityreallevelarrayfield whichField,integer level,integer index,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityRealLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityRealLevelArrayField(whichAbility,whichField,level,index,value)"
    },
    "BlzSetAbilityStringLevelArrayField": {
      "documentation": "改变技能随等级改变的字符串数组类型域",
      "original": "native BlzSetAbilityStringLevelArrayField takes ability whichAbility,abilitystringlevelarrayfield whichField,integer level,integer index,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetAbilityStringLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "index"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetAbilityStringLevelArrayField(whichAbility,whichField,level,index,value)"
    },
    "BlzAddAbilityBooleanLevelArrayField": {
      "documentation": "技能随等级改变的布尔类型域 - 添加值",
      "original": "native BlzAddAbilityBooleanLevelArrayField takes ability whichAbility,abilitybooleanlevelarrayfield whichField,integer level,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzAddAbilityBooleanLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzAddAbilityBooleanLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzAddAbilityIntegerLevelArrayField": {
      "documentation": "技能随等级改变的整数类型域 - 添加值",
      "original": "native BlzAddAbilityIntegerLevelArrayField takes ability whichAbility,abilityintegerlevelarrayfield whichField,integer level,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzAddAbilityIntegerLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzAddAbilityIntegerLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzAddAbilityRealLevelArrayField": {
      "documentation": "技能随等级改变的实数类型域 - 添加值",
      "original": "native BlzAddAbilityRealLevelArrayField takes ability whichAbility,abilityreallevelarrayfield whichField,integer level,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzAddAbilityRealLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzAddAbilityRealLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzAddAbilityStringLevelArrayField": {
      "documentation": "技能随等级改变的字符串类型域 - 添加值",
      "original": "native BlzAddAbilityStringLevelArrayField takes ability whichAbility,abilitystringlevelarrayfield whichField,integer level,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzAddAbilityStringLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzAddAbilityStringLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzRemoveAbilityBooleanLevelArrayField": {
      "documentation": "技能随等级改变的布尔类型域 - 移除值",
      "original": "native BlzRemoveAbilityBooleanLevelArrayField takes ability whichAbility,abilitybooleanlevelarrayfield whichField,integer level,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzRemoveAbilityBooleanLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitybooleanlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzRemoveAbilityBooleanLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzRemoveAbilityIntegerLevelArrayField": {
      "documentation": "技能随等级改变的整数类型域 - 移除值",
      "original": "native BlzRemoveAbilityIntegerLevelArrayField takes ability whichAbility,abilityintegerlevelarrayfield whichField,integer level,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzRemoveAbilityIntegerLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityintegerlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzRemoveAbilityIntegerLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzRemoveAbilityRealLevelArrayField": {
      "documentation": "技能随等级改变的实数类型域 - 移除值",
      "original": "native BlzRemoveAbilityRealLevelArrayField takes ability whichAbility,abilityreallevelarrayfield whichField,integer level,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzRemoveAbilityRealLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilityreallevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzRemoveAbilityRealLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzRemoveAbilityStringLevelArrayField": {
      "documentation": "技能随等级改变的字符串类型域 - 移除值",
      "original": "native BlzRemoveAbilityStringLevelArrayField takes ability whichAbility,abilitystringlevelarrayfield whichField,integer level,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzRemoveAbilityStringLevelArrayField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "ability",
        "name": "whichAbility"
      }, {
        "type": "abilitystringlevelarrayfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "level"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzRemoveAbilityStringLevelArrayField(whichAbility,whichField,level,value)"
    },
    "BlzGetItemAbilityByIndex": {
      "documentation": "按索引获取物品技能",
      "original": "native BlzGetItemAbilityByIndex takes item whichItem,integer index returns ability",
      "filename": "BZapi.txt",
      "name": "BlzGetItemAbilityByIndex",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "ability",
      "insertText": "BlzGetItemAbilityByIndex(whichItem,index)"
    },
    "BlzGetItemAbility": {
      "documentation": "获取物品技能",
      "original": "native BlzGetItemAbility takes item whichItem,integer abilCode returns ability",
      "filename": "BZapi.txt",
      "name": "BlzGetItemAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "ability",
      "insertText": "BlzGetItemAbility(whichItem,abilCode)"
    },
    "BlzItemAddAbility": {
      "documentation": "物品添加技能",
      "original": "native BlzItemAddAbility takes item whichItem,integer abilCode returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzItemAddAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "boolean",
      "insertText": "BlzItemAddAbility(whichItem,abilCode)"
    },
    "BlzGetItemBooleanField": {
      "documentation": "物品的布尔类型域",
      "original": "native BlzGetItemBooleanField takes item whichItem,itembooleanfield whichField returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetItemBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itembooleanfield",
        "name": "whichField"
      }],
      "returnType": "boolean",
      "insertText": "BlzGetItemBooleanField(whichItem,whichField)"
    },
    "BlzGetItemIntegerField": {
      "documentation": "获取物品的整数类型域",
      "original": "native BlzGetItemIntegerField takes item whichItem,itemintegerfield whichField returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetItemIntegerField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemintegerfield",
        "name": "whichField"
      }],
      "returnType": "integer",
      "insertText": "BlzGetItemIntegerField(whichItem,whichField)"
    },
    "BlzGetItemRealField": {
      "documentation": "物品的实数类型域",
      "original": "native BlzGetItemRealField takes item whichItem,itemrealfield whichField returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetItemRealField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemrealfield",
        "name": "whichField"
      }],
      "returnType": "real",
      "insertText": "BlzGetItemRealField(whichItem,whichField)"
    },
    "BlzGetItemStringField": {
      "documentation": "获取物品字符串字段",
      "original": "native BlzGetItemStringField takes item whichItem,itemstringfield whichField returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetItemStringField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemstringfield",
        "name": "whichField"
      }],
      "returnType": "string",
      "insertText": "BlzGetItemStringField(whichItem,whichField)"
    },
    "BlzSetItemBooleanField": {
      "documentation": "改变物品的布尔类型域",
      "original": "native BlzSetItemBooleanField takes item whichItem,itembooleanfield whichField,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetItemBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itembooleanfield",
        "name": "whichField"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetItemBooleanField(whichItem,whichField,value)"
    },
    "BlzSetItemIntegerField": {
      "documentation": "改变物品的整数类型域",
      "original": "native BlzSetItemIntegerField takes item whichItem,itemintegerfield whichField,integer value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetItemIntegerField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemintegerfield",
        "name": "whichField"
      }, {
        "type": "integer",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetItemIntegerField(whichItem,whichField,value)"
    },
    "BlzSetItemRealField": {
      "documentation": "改变物品的实数类型域",
      "original": "native BlzSetItemRealField takes item whichItem,itemrealfield whichField,real value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetItemRealField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemrealfield",
        "name": "whichField"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetItemRealField(whichItem,whichField,value)"
    },
    "BlzSetItemStringField": {
      "documentation": "改变物品的字符串类型域",
      "original": "native BlzSetItemStringField takes item whichItem,itemstringfield whichField,string value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetItemStringField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "itemstringfield",
        "name": "whichField"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetItemStringField(whichItem,whichField,value)"
    },
    "BlzItemRemoveAbility": {
      "documentation": "物品移除技能",
      "original": "native BlzItemRemoveAbility takes item whichItem,integer abilCode returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzItemRemoveAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "item",
        "name": "whichItem"
      }, {
        "type": "integer",
        "name": "abilCode"
      }],
      "returnType": "boolean",
      "insertText": "BlzItemRemoveAbility(whichItem,abilCode)"
    },
    "BlzGetUnitBooleanField": {
      "documentation": "单位布尔类型域",
      "original": "native BlzGetUnitBooleanField takes unit whichUnit,unitbooleanfield whichField returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "unitbooleanfield",
        "name": "whichField"
      }],
      "returnType": "boolean",
      "insertText": "BlzGetUnitBooleanField(whichUnit,whichField)"
    },
    "BlzGetUnitIntegerField": {
      "documentation": "获取单位整数类型域",
      "original": "native BlzGetUnitIntegerField takes unit whichUnit,unitintegerfield whichField returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitIntegerField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "unitintegerfield",
        "name": "whichField"
      }],
      "returnType": "integer",
      "insertText": "BlzGetUnitIntegerField(whichUnit,whichField)"
    },
    "BlzGetUnitRealField": {
      "documentation": "Get Unit 实数类型域",
      "original": "native BlzGetUnitRealField takes unit whichUnit,unitrealfield whichField returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitRealField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "unitrealfield",
        "name": "whichField"
      }],
      "returnType": "real",
      "insertText": "BlzGetUnitRealField(whichUnit,whichField)"
    },
    "BlzGetUnitStringField": {
      "documentation": "获取单位字符串字段",
      "original": "native BlzGetUnitStringField takes unit whichUnit,unitstringfield whichField returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitStringField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "unitstringfield",
        "name": "whichField"
      }],
      "returnType": "string",
      "insertText": "BlzGetUnitStringField(whichUnit,whichField)"
    },
    "BlzSetUnitBooleanField": {
      "documentation": "改变单位的布尔类型域",
      "original": "native BlzSetUnitBooleanField takes unit whichUnit,unitbooleanfield whichField,boolean value returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSetUnitBooleanField",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "unitbooleanfield",
        "name": "whichField"
      }, {
        "type": "boolean",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "BlzSetUnitBooleanField(whichUnit,whichField,value)"
    },
    "BlzGetOriginFrame": {
      "documentation": "获取原生UI",
      "original": "native BlzGetOriginFrame takes originframetype frameType, integer index returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzGetOriginFrame",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "originframetype",
        "name": "frameType"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "framehandle",
      "insertText": "BlzGetOriginFrame(frameType,index)"
    },
    "BlzEnableUIAutoPosition": {
      "documentation": "UI自动设置位置",
      "original": "native BlzEnableUIAutoPosition takes boolean enable returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzEnableUIAutoPosition",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "nothing",
      "insertText": "BlzEnableUIAutoPosition(enable)"
    },
    "BlzHideOriginFrames": {
      "documentation": "隐藏原生界面",
      "original": "native BlzHideOriginFrames takes boolean enable returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzHideOriginFrames",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "nothing",
      "insertText": "BlzHideOriginFrames(enable)"
    },
    "BlzConvertColor": {
      "documentation": "转换颜色",
      "original": "native BlzConvertColor takes integer a, integer r, integer g, integer b returns integer",
      "filename": "BZapi.txt",
      "name": "BlzConvertColor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "a"
      }, {
        "type": "integer",
        "name": "r"
      }, {
        "type": "integer",
        "name": "g"
      }, {
        "type": "integer",
        "name": "b"
      }],
      "returnType": "integer",
      "insertText": "BlzConvertColor(a,r,g,b)"
    },
    "BlzLoadTOCFile": {
      "documentation": "导入toc文件",
      "original": "native BlzLoadTOCFile takes string TOCFile returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzLoadTOCFile",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "TOCFile"
      }],
      "returnType": "boolean",
      "insertText": "BlzLoadTOCFile(TOCFile)"
    },
    "BlzCreateFrame": {
      "documentation": "创建Frame",
      "original": "native BlzCreateFrame takes string name, framehandle owner, integer priority, integer createContext returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzCreateFrame",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "name"
      }, {
        "type": "framehandle",
        "name": "owner"
      }, {
        "type": "integer",
        "name": "priority"
      }, {
        "type": "integer",
        "name": "createContext"
      }],
      "returnType": "framehandle",
      "insertText": "BlzCreateFrame(name,owner,priority,createContext)"
    },
    "BlzCreateSimpleFrame": {
      "documentation": "创建SimpleFrame",
      "original": "native BlzCreateSimpleFrame takes string name, framehandle owner, integer createContext returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzCreateSimpleFrame",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "name"
      }, {
        "type": "framehandle",
        "name": "owner"
      }, {
        "type": "integer",
        "name": "createContext"
      }],
      "returnType": "framehandle",
      "insertText": "BlzCreateSimpleFrame(name,owner,createContext)"
    },
    "BlzCreateFrameByType": {
      "documentation": "创建指定类型名的Frame",
      "original": "native BlzCreateFrameByType takes string typeName, string name, framehandle owner, string inherits, integer createContext returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzCreateFrameByType",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "typeName"
      }, {
        "type": "string",
        "name": "name"
      }, {
        "type": "framehandle",
        "name": "owner"
      }, {
        "type": "string",
        "name": "inherits"
      }, {
        "type": "integer",
        "name": "createContext"
      }],
      "returnType": "framehandle",
      "insertText": "BlzCreateFrameByType(typeName,name,owner,inherits,createContext)"
    },
    "BlzDestroyFrame": {
      "documentation": "删除Frame",
      "original": "native BlzDestroyFrame takes framehandle frame returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzDestroyFrame",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "nothing",
      "insertText": "BlzDestroyFrame(frame)"
    },
    "BlzFrameSetPoint": {
      "documentation": "设置Frame的相对位置",
      "original": "native BlzFrameSetPoint takes framehandle frame, framepointtype point, framehandle relative, framepointtype relativePoint, real x, real y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetPoint",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "framepointtype",
        "name": "point"
      }, {
        "type": "framehandle",
        "name": "relative"
      }, {
        "type": "framepointtype",
        "name": "relativePoint"
      }, {
        "type": "real",
        "name": "x"
      }, {
        "type": "real",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetPoint(frame,point,relative,relativePoint,x,y)"
    },
    "BlzFrameSetAbsPoint": {
      "documentation": "设置Frame的绝对位置",
      "original": "native BlzFrameSetAbsPoint takes framehandle frame, framepointtype point, real x, real y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetAbsPoint",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "framepointtype",
        "name": "point"
      }, {
        "type": "real",
        "name": "x"
      }, {
        "type": "real",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetAbsPoint(frame,point,x,y)"
    },
    "BlzFrameClearAllPoints": {
      "documentation": "清空Frame锚点",
      "original": "native BlzFrameClearAllPoints takes framehandle frame returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameClearAllPoints",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameClearAllPoints(frame)"
    },
    "BlzFrameSetAllPoints": {
      "documentation": "设置所有锚点到目标frame上",
      "original": "native BlzFrameSetAllPoints takes framehandle frame, framehandle relative returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetAllPoints",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "framehandle",
        "name": "relative"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetAllPoints(frame,relative)"
    },
    "BlzFrameSetVisible": {
      "documentation": "设置Frame可见",
      "original": "native BlzFrameSetVisible takes framehandle frame, boolean visible returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetVisible",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "boolean",
        "name": "visible"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetVisible(frame,visible)"
    },
    "BlzFrameIsVisible": {
      "documentation": "Frame是否可见",
      "original": "native BlzFrameIsVisible takes framehandle frame returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzFrameIsVisible",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "boolean",
      "insertText": "BlzFrameIsVisible(frame)"
    },
    "BlzGetFrameByName": {
      "documentation": "查找frame",
      "original": "native BlzGetFrameByName takes string name, integer createContext returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzGetFrameByName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "name"
      }, {
        "type": "integer",
        "name": "createContext"
      }],
      "returnType": "framehandle",
      "insertText": "BlzGetFrameByName(name,createContext)"
    },
    "BlzFrameGetName": {
      "documentation": "获取Frame的名字",
      "original": "native BlzFrameGetName takes framehandle frame returns string",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetName",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "string",
      "insertText": "BlzFrameGetName(frame)"
    },
    "BlzFrameClick": {
      "documentation": "点击Frame",
      "original": "native BlzFrameClick takes framehandle frame returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameClick",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameClick(frame)"
    },
    "BlzFrameSetText": {
      "documentation": "设置Frame文本",
      "original": "native BlzFrameSetText takes framehandle frame, string text returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetText",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "string",
        "name": "text"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetText(frame,text)"
    },
    "BlzFrameGetText": {
      "documentation": "获取Frame文本",
      "original": "native BlzFrameGetText takes framehandle frame returns string",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetText",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "string",
      "insertText": "BlzFrameGetText(frame)"
    },
    "BlzFrameAddText": {
      "documentation": "Frame添加文本",
      "original": "native BlzFrameAddText takes framehandle frame, string text returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameAddText",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "string",
        "name": "text"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameAddText(frame,text)"
    },
    "BlzFrameSetTextSizeLimit": {
      "documentation": "设置Frame字数限制",
      "original": "native BlzFrameSetTextSizeLimit takes framehandle frame, integer size returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetTextSizeLimit",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "size"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetTextSizeLimit(frame,size)"
    },
    "BlzFrameGetTextSizeLimit": {
      "documentation": "获取Frame字数限制",
      "original": "native BlzFrameGetTextSizeLimit takes framehandle frame returns integer",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetTextSizeLimit",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "integer",
      "insertText": "BlzFrameGetTextSizeLimit(frame)"
    },
    "BlzFrameSetTextColor": {
      "documentation": "设置Frame文本颜色",
      "original": "native BlzFrameSetTextColor takes framehandle frame, integer color returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetTextColor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "color"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetTextColor(frame,color)"
    },
    "BlzFrameSetFocus": {
      "documentation": "设置Frame焦点",
      "original": "native BlzFrameSetFocus takes framehandle frame, boolean flag returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetFocus",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "boolean",
        "name": "flag"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetFocus(frame,flag)"
    },
    "BlzFrameSetModel": {
      "documentation": "设置Frame模型",
      "original": "native BlzFrameSetModel takes framehandle frame, string modelFile, integer cameraIndex returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetModel",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "string",
        "name": "modelFile"
      }, {
        "type": "integer",
        "name": "cameraIndex"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetModel(frame,modelFile,cameraIndex)"
    },
    "BlzFrameSetEnable": {
      "documentation": "启用/禁用Frame",
      "original": "native BlzFrameSetEnable takes framehandle frame, boolean enabled returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetEnable",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "boolean",
        "name": "enabled"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetEnable(frame,enabled)"
    },
    "BlzFrameGetEnable": {
      "documentation": "获取Frame是启/禁用状态",
      "original": "native BlzFrameGetEnable takes framehandle frame returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetEnable",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "boolean",
      "insertText": "BlzFrameGetEnable(frame)"
    },
    "BlzFrameSetAlpha": {
      "documentation": "设置Frame透明度",
      "original": "native BlzFrameSetAlpha takes framehandle frame, integer alpha returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetAlpha",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "alpha"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetAlpha(frame,alpha)"
    },
    "BlzFrameGetAlpha": {
      "documentation": "获取Frame透明度",
      "original": "native BlzFrameGetAlpha takes framehandle frame returns integer",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetAlpha",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "integer",
      "insertText": "BlzFrameGetAlpha(frame)"
    },
    "BlzFrameSetSpriteAnimate": {
      "documentation": "设置Frame动画",
      "original": "native BlzFrameSetSpriteAnimate takes framehandle frame, integer primaryProp, integer flags returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetSpriteAnimate",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "primaryProp"
      }, {
        "type": "integer",
        "name": "flags"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetSpriteAnimate(frame,primaryProp,flags)"
    },
    "BlzFrameSetTexture": {
      "documentation": "设置Frame图片",
      "original": "native BlzFrameSetTexture takes framehandle frame, string texFile, integer flag, boolean blend returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetTexture",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "string",
        "name": "texFile"
      }, {
        "type": "integer",
        "name": "flag"
      }, {
        "type": "boolean",
        "name": "blend"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetTexture(frame,texFile,flag,blend)"
    },
    "BlzFrameSetScale": {
      "documentation": "缩放Frame",
      "original": "native BlzFrameSetScale takes framehandle frame, real scale returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "real",
        "name": "scale"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetScale(frame,scale)"
    },
    "BlzFrameSetTooltip": {
      "documentation": "设置Frame提示",
      "original": "native BlzFrameSetTooltip takes framehandle frame, framehandle tooltip returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetTooltip",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "framehandle",
        "name": "tooltip"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetTooltip(frame,tooltip)"
    },
    "BlzFrameCageMouse": {
      "documentation": "锁定鼠标",
      "original": "native BlzFrameCageMouse takes framehandle frame, boolean enable returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameCageMouse",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameCageMouse(frame,enable)"
    },
    "BlzFrameSetValue": {
      "documentation": "设置当前值",
      "original": "native BlzFrameSetValue takes framehandle frame, real value returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetValue",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "real",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetValue(frame,value)"
    },
    "BlzFrameGetValue": {
      "documentation": "获取当前值",
      "original": "native BlzFrameGetValue takes framehandle frame returns real",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetValue",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "real",
      "insertText": "BlzFrameGetValue(frame)"
    },
    "BlzFrameSetMinMaxValue": {
      "documentation": "设置最大最小值",
      "original": "native BlzFrameSetMinMaxValue takes framehandle frame, real minValue, real maxValue returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetMinMaxValue",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "real",
        "name": "minValue"
      }, {
        "type": "real",
        "name": "maxValue"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetMinMaxValue(frame,minValue,maxValue)"
    },
    "BlzFrameSetStepSize": {
      "documentation": "设置Step值",
      "original": "native BlzFrameSetStepSize takes framehandle frame, real stepSize returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetStepSize",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "real",
        "name": "stepSize"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetStepSize(frame,stepSize)"
    },
    "BlzFrameSetSize": {
      "documentation": "设置Frame大小",
      "original": "native BlzFrameSetSize takes framehandle frame, real width, real height returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetSize",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "real",
        "name": "width"
      }, {
        "type": "real",
        "name": "height"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetSize(frame,width,height)"
    },
    "BlzFrameSetVertexColor": {
      "documentation": "设置Frame颜色",
      "original": "native BlzFrameSetVertexColor takes framehandle frame, integer color returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetVertexColor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "color"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetVertexColor(frame,color)"
    },
    "BlzFrameSetLevel": {
      "documentation": "设置Frame优先级",
      "original": "native BlzFrameSetLevel takes framehandle frame, integer level returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetLevel",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "integer",
        "name": "level"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetLevel(frame,level)"
    },
    "BlzFrameSetParent": {
      "documentation": "设置父Frame",
      "original": "native BlzFrameSetParent takes framehandle frame, framehandle parent returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetParent",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "framehandle",
        "name": "parent"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetParent(frame,parent)"
    },
    "BlzFrameGetParent": {
      "documentation": "获取父Frame",
      "original": "native BlzFrameGetParent takes framehandle frame returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetParent",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "framehandle",
      "insertText": "BlzFrameGetParent(frame)"
    },
    "BlzFrameGetHeight": {
      "documentation": "获取Frame高度",
      "original": "native BlzFrameGetHeight takes framehandle frame returns real",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetHeight",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "real",
      "insertText": "BlzFrameGetHeight(frame)"
    },
    "BlzFrameGetWidth": {
      "documentation": "获取Frame宽度",
      "original": "native BlzFrameGetWidth takes framehandle frame returns real",
      "filename": "BZapi.txt",
      "name": "BlzFrameGetWidth",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }],
      "returnType": "real",
      "insertText": "BlzFrameGetWidth(frame)"
    },
    "BlzFrameSetFont": {
      "documentation": "设置字体",
      "original": "native BlzFrameSetFont takes framehandle frame, string fileName, real height, integer flags returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetFont",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "string",
        "name": "fileName"
      }, {
        "type": "real",
        "name": "height"
      }, {
        "type": "integer",
        "name": "flags"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetFont(frame,fileName,height,flags)"
    },
    "BlzFrameSetTextAlignment": {
      "documentation": "设置字体对齐方式",
      "original": "native BlzFrameSetTextAlignment takes framehandle frame, textaligntype vert, textaligntype horz returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzFrameSetTextAlignment",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "textaligntype",
        "name": "vert"
      }, {
        "type": "textaligntype",
        "name": "horz"
      }],
      "returnType": "nothing",
      "insertText": "BlzFrameSetTextAlignment(frame,vert,horz)"
    },
    "BlzTriggerRegisterFrameEvent": {
      "documentation": "注册Frame事件",
      "original": "native BlzTriggerRegisterFrameEvent takes trigger whichTrigger, framehandle frame, frameeventtype eventId returns event",
      "filename": "BZapi.txt",
      "name": "BlzTriggerRegisterFrameEvent",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "trigger",
        "name": "whichTrigger"
      }, {
        "type": "framehandle",
        "name": "frame"
      }, {
        "type": "frameeventtype",
        "name": "eventId"
      }],
      "returnType": "event",
      "insertText": "BlzTriggerRegisterFrameEvent(whichTrigger,frame,eventId)"
    },
    "BlzGetTriggerFrame": {
      "documentation": "获取触发的Frame",
      "original": "native BlzGetTriggerFrame takes nothing returns framehandle",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerFrame",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "framehandle",
      "insertText": "BlzGetTriggerFrame()"
    },
    "BlzGetTriggerFrameEvent": {
      "documentation": "获取触发的事件类型",
      "original": "native BlzGetTriggerFrameEvent takes nothing returns frameeventtype",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerFrameEvent",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "frameeventtype",
      "insertText": "BlzGetTriggerFrameEvent()"
    },
    "BlzGetTriggerFrameValue": {
      "documentation": "获取触发的Frame值",
      "original": "native BlzGetTriggerFrameValue takes nothing returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerFrameValue",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "real",
      "insertText": "BlzGetTriggerFrameValue()"
    },
    "BlzGetTriggerFrameText": {
      "documentation": "获取触发的Frame文本",
      "original": "native BlzGetTriggerFrameText takes nothing returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerFrameText",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "string",
      "insertText": "BlzGetTriggerFrameText()"
    },
    "BlzTriggerRegisterPlayerSyncEvent": {
      "documentation": "注册玩家同步事件",
      "original": "native BlzTriggerRegisterPlayerSyncEvent takes trigger whichTrigger, player whichPlayer, string prefix, boolean fromServer returns event",
      "filename": "BZapi.txt",
      "name": "BlzTriggerRegisterPlayerSyncEvent",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "trigger",
        "name": "whichTrigger"
      }, {
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "prefix"
      }, {
        "type": "boolean",
        "name": "fromServer"
      }],
      "returnType": "event",
      "insertText": "BlzTriggerRegisterPlayerSyncEvent(whichTrigger,whichPlayer,prefix,fromServer)"
    },
    "BlzSendSyncData": {
      "documentation": "同步数据",
      "original": "native BlzSendSyncData takes string prefix, string data returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzSendSyncData",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "prefix"
      }, {
        "type": "string",
        "name": "data"
      }],
      "returnType": "boolean",
      "insertText": "BlzSendSyncData(prefix,data)"
    },
    "BlzGetTriggerSyncPrefix": {
      "documentation": "获取同步的前缀",
      "original": "native BlzGetTriggerSyncPrefix takes nothing returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerSyncPrefix",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "string",
      "insertText": "BlzGetTriggerSyncPrefix()"
    },
    "BlzGetTriggerSyncData": {
      "documentation": "获取同步的数据",
      "original": "native BlzGetTriggerSyncData takes nothing returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerSyncData",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "string",
      "insertText": "BlzGetTriggerSyncData()"
    },
    "BlzTriggerRegisterPlayerKeyEvent": {
      "documentation": "注册玩家键盘事件",
      "original": "native BlzTriggerRegisterPlayerKeyEvent takes trigger whichTrigger, player whichPlayer, oskeytype key, integer metaKey, boolean keyDown returns event",
      "filename": "BZapi.txt",
      "name": "BlzTriggerRegisterPlayerKeyEvent",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "trigger",
        "name": "whichTrigger"
      }, {
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "oskeytype",
        "name": "key"
      }, {
        "type": "integer",
        "name": "metaKey"
      }, {
        "type": "boolean",
        "name": "keyDown"
      }],
      "returnType": "event",
      "insertText": "BlzTriggerRegisterPlayerKeyEvent(whichTrigger,whichPlayer,key,metaKey,keyDown)"
    },
    "BlzGetTriggerPlayerKey": {
      "documentation": "获取触发的按键",
      "original": "native BlzGetTriggerPlayerKey takes nothing returns oskeytype",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerKey",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "oskeytype",
      "insertText": "BlzGetTriggerPlayerKey()"
    },
    "BlzGetTriggerPlayerMetaKey": {
      "documentation": "获取触发的特殊按键",
      "original": "native BlzGetTriggerPlayerMetaKey takes nothing returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerMetaKey",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "integer",
      "insertText": "BlzGetTriggerPlayerMetaKey()"
    },
    "BlzGetTriggerPlayerIsKeyDown": {
      "documentation": "获取触发的按键被按下",
      "original": "native BlzGetTriggerPlayerIsKeyDown takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzGetTriggerPlayerIsKeyDown",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "boolean",
      "insertText": "BlzGetTriggerPlayerIsKeyDown()"
    },
    "BlzEnableCursor": {
      "documentation": "光标",
      "original": "native BlzEnableCursor takes boolean enable returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzEnableCursor",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "nothing",
      "insertText": "BlzEnableCursor(enable)"
    },
    "BlzSetMousePos": {
      "documentation": "设置鼠标位置",
      "original": "native BlzSetMousePos takes integer x, integer y returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetMousePos",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "integer",
        "name": "x"
      }, {
        "type": "integer",
        "name": "y"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetMousePos(x,y)"
    },
    "BlzGetLocalClientWidth": {
      "documentation": "获取本地客户端宽度",
      "original": "native BlzGetLocalClientWidth takes nothing returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalClientWidth",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "integer",
      "insertText": "BlzGetLocalClientWidth()"
    },
    "BlzGetLocalClientHeight": {
      "documentation": "获取本地客户端高度",
      "original": "native BlzGetLocalClientHeight takes nothing returns integer",
      "filename": "BZapi.txt",
      "name": "BlzGetLocalClientHeight",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "integer",
      "insertText": "BlzGetLocalClientHeight()"
    },
    "BlzIsLocalClientActive": {
      "documentation": "获取本地客户端是否激活",
      "original": "native BlzIsLocalClientActive takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzIsLocalClientActive",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "boolean",
      "insertText": "BlzIsLocalClientActive()"
    },
    "BlzGetMouseFocusUnit": {
      "documentation": "获取鼠标锁定的单位",
      "original": "native BlzGetMouseFocusUnit takes nothing returns unit",
      "filename": "BZapi.txt",
      "name": "BlzGetMouseFocusUnit",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "unit",
      "insertText": "BlzGetMouseFocusUnit()"
    },
    "BlzChangeMinimapTerrainTex": {
      "documentation": "设置小地图图标",
      "original": "native BlzChangeMinimapTerrainTex takes string texFile returns boolean",
      "filename": "BZapi.txt",
      "name": "BlzChangeMinimapTerrainTex",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "string",
        "name": "texFile"
      }],
      "returnType": "boolean",
      "insertText": "BlzChangeMinimapTerrainTex(texFile)"
    },
    "BlzGetLocale": {
      "documentation": "获取语言",
      "original": "native BlzGetLocale takes nothing returns string",
      "filename": "BZapi.txt",
      "name": "BlzGetLocale",
      "isConstant": false,
      "isNative": true,
      "args": [],
      "returnType": "string",
      "insertText": "BlzGetLocale()"
    },
    "BlzGetSpecialEffectScale": {
      "documentation": "获取特效大小",
      "original": "native BlzGetSpecialEffectScale takes effect whichEffect returns real",
      "filename": "BZapi.txt",
      "name": "BlzGetSpecialEffectScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "real",
      "insertText": "BlzGetSpecialEffectScale(whichEffect)"
    },
    "BlzSetSpecialEffectMatrixScale": {
      "documentation": "设置特效位置",
      "original": "native BlzSetSpecialEffectMatrixScale takes effect whichEffect, real x, real y, real z returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzSetSpecialEffectMatrixScale",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }, {
        "type": "real",
        "name": "x"
      }, {
        "type": "real",
        "name": "y"
      }, {
        "type": "real",
        "name": "z"
      }],
      "returnType": "nothing",
      "insertText": "BlzSetSpecialEffectMatrixScale(whichEffect,x,y,z)"
    },
    "BlzResetSpecialEffectMatrix": {
      "documentation": "重置特效动画",
      "original": "native BlzResetSpecialEffectMatrix takes effect whichEffect returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzResetSpecialEffectMatrix",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "effect",
        "name": "whichEffect"
      }],
      "returnType": "nothing",
      "insertText": "BlzResetSpecialEffectMatrix(whichEffect)"
    },
    "BlzGetUnitAbility": {
      "documentation": "获取单位技能",
      "original": "native BlzGetUnitAbility takes unit whichUnit, integer abilId returns ability",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAbility",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "abilId"
      }],
      "returnType": "ability",
      "insertText": "BlzGetUnitAbility(whichUnit,abilId)"
    },
    "BlzGetUnitAbilityByIndex": {
      "documentation": "获取单位第N个技能",
      "original": "native BlzGetUnitAbilityByIndex takes unit whichUnit, integer index returns ability",
      "filename": "BZapi.txt",
      "name": "BlzGetUnitAbilityByIndex",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "integer",
        "name": "index"
      }],
      "returnType": "ability",
      "insertText": "BlzGetUnitAbilityByIndex(whichUnit,index)"
    },
    "BlzDisplayChatMessage": {
      "documentation": "模拟玩家聊天",
      "original": "native BlzDisplayChatMessage takes player whichPlayer, integer recipient, string message returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzDisplayChatMessage",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "integer",
        "name": "recipient"
      }, {
        "type": "string",
        "name": "message"
      }],
      "returnType": "nothing",
      "insertText": "BlzDisplayChatMessage(whichPlayer,recipient,message)"
    },
    "BlzPauseUnitEx": {
      "documentation": "暂停单位",
      "original": "native BlzPauseUnitEx takes unit whichUnit, boolean flag returns nothing",
      "filename": "BZapi.txt",
      "name": "BlzPauseUnitEx",
      "isConstant": false,
      "isNative": true,
      "args": [{
        "type": "unit",
        "name": "whichUnit"
      }, {
        "type": "boolean",
        "name": "flag"
      }],
      "returnType": "nothing",
      "insertText": "BlzPauseUnitEx(whichUnit,flag)"
    },
    "DzAPI_Map_MissionComplete": {
      "documentation": "用作完成某个任务，发奖励",
      "original": "function DzAPI_Map_MissionComplete takes player whichPlayer, string key, string value returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_MissionComplete",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_MissionComplete(whichPlayer,key,value)"
    },
    "DzAPI_Map_GetActivityData": {
      "documentation": "提供给地图的接口，用作取服务器上的活动数据",
      "original": "function DzAPI_Map_GetActivityData takes nothing returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetActivityData",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetActivityData()"
    },
    "DzAPI_Map_GetMapLevel": {
      "documentation": "提供给地图的接口，用与取地图等级",
      "original": "function DzAPI_Map_GetMapLevel takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetMapLevel",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetMapLevel(whichPlayer)"
    },
    "DzAPI_Map_SaveServerValue": {
      "documentation": "保存服务器存档",
      "original": "function DzAPI_Map_SaveServerValue takes player whichPlayer, string key, string value returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_SaveServerValue",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_SaveServerValue(whichPlayer,key,value)"
    },
    "DzAPI_Map_GetServerValue": {
      "documentation": "读取服务器存档",
      "original": "function DzAPI_Map_GetServerValue takes player whichPlayer, string key returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetServerValue",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetServerValue(whichPlayer,key)"
    },
    "DzAPI_Map_GetServerValueErrorCode": {
      "documentation": "读取加载服务器存档时的错误码",
      "original": "function DzAPI_Map_GetServerValueErrorCode takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetServerValueErrorCode",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetServerValueErrorCode(whichPlayer)"
    },
    "DzAPI_Map_Stat_SetStat": {
      "documentation": "统计-提交地图数据",
      "original": "function DzAPI_Map_Stat_SetStat takes player whichPlayer, string key, string value returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_Stat_SetStat",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_Stat_SetStat(whichPlayer,key,value)"
    },
    "DzAPI_Map_Ladder_SetStat": {
      "documentation": "天梯-统计数据",
      "original": "function DzAPI_Map_Ladder_SetStat takes player whichPlayer, string key, string value returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_Ladder_SetStat",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_Ladder_SetStat(whichPlayer,key,value)"
    },
    "DzAPI_Map_Ladder_SetPlayerStat": {
      "documentation": "天梯-统计数据",
      "original": "function DzAPI_Map_Ladder_SetPlayerStat takes player whichPlayer, string key, string value returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_Ladder_SetPlayerStat",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_Ladder_SetPlayerStat(whichPlayer,key,value)"
    },
    "DzAPI_Map_IsRPGLobby": {
      "documentation": "检查是否大厅地图",
      "original": "function DzAPI_Map_IsRPGLobby takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsRPGLobby",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsRPGLobby()"
    },
    "DzAPI_Map_GetGameStartTime": {
      "documentation": "取游戏开始时间",
      "original": "function DzAPI_Map_GetGameStartTime takes nothing returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetGameStartTime",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetGameStartTime()"
    },
    "DzAPI_Map_IsRPGLadder": {
      "documentation": "判断当前是否rpg天梯",
      "original": "function DzAPI_Map_IsRPGLadder takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsRPGLadder",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsRPGLadder()"
    },
    "DzAPI_Map_GetMatchType": {
      "documentation": "获取匹配类型",
      "original": "function DzAPI_Map_GetMatchType takes nothing returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetMatchType",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetMatchType()"
    },
    "DzAPI_Map_GetLadderLevel": {
      "documentation": "提供给地图的接口，用与取天梯等级",
      "original": "function DzAPI_Map_GetLadderLevel takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetLadderLevel",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetLadderLevel(whichPlayer)"
    },
    "DzAPI_Map_IsRedVIP": {
      "documentation": "提供给地图的接口，用与判断是否红V",
      "original": "function DzAPI_Map_IsRedVIP takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsRedVIP",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsRedVIP(whichPlayer)"
    },
    "DzAPI_Map_IsBlueVIP": {
      "documentation": "提供给地图的接口，用与判断是否蓝V",
      "original": "function DzAPI_Map_IsBlueVIP takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsBlueVIP",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsBlueVIP(whichPlayer)"
    },
    "DzAPI_Map_GetLadderRank": {
      "documentation": "提供给地图的接口，用与取天梯排名",
      "original": "function DzAPI_Map_GetLadderRank takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetLadderRank",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetLadderRank(whichPlayer)"
    },
    "DzAPI_Map_GetMapLevelRank": {
      "documentation": "提供给地图的接口，用与取地图等级排名",
      "original": "function DzAPI_Map_GetMapLevelRank takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetMapLevelRank",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetMapLevelRank(whichPlayer)"
    },
    "DzAPI_Map_GetGuildName": {
      "documentation": "获取公会名称",
      "original": "function DzAPI_Map_GetGuildName takes player whichPlayer returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetGuildName",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetGuildName(whichPlayer)"
    },
    "DzAPI_Map_GetGuildRole": {
      "documentation": "获取公会职责 Member=10 Admin=20 Leader=30",
      "original": "function DzAPI_Map_GetGuildRole takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetGuildRole",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetGuildRole(whichPlayer)"
    },
    "DzAPI_Map_GetMapConfig": {
      "documentation": "获取地图配置",
      "original": "function DzAPI_Map_GetMapConfig takes string key returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetMapConfig",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "string",
        "name": "key"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetMapConfig(key)"
    },
    "DzAPI_Map_HasMallItem": {
      "documentation": "判断是否拥有商品",
      "original": "function DzAPI_Map_HasMallItem takes player whichPlayer, string key returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_HasMallItem",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_HasMallItem(whichPlayer,key)"
    },
    "DzAPI_Map_ChangeStoreItemCount": {
      "documentation": "修改游戏内商店物品数量",
      "original": "function DzAPI_Map_ChangeStoreItemCount takes integer team, string itemId, integer count returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_ChangeStoreItemCount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "integer",
        "name": "team"
      }, {
        "type": "string",
        "name": "itemId"
      }, {
        "type": "integer",
        "name": "count"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_ChangeStoreItemCount(team,itemId,count)"
    },
    "DzAPI_Map_ChangeStoreItemCoolDown": {
      "documentation": "修改游戏内商店物品CD",
      "original": "function DzAPI_Map_ChangeStoreItemCoolDown takes integer team, string itemId, integer seconds returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_ChangeStoreItemCoolDown",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "integer",
        "name": "team"
      }, {
        "type": "string",
        "name": "itemId"
      }, {
        "type": "integer",
        "name": "seconds"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_ChangeStoreItemCoolDown(team,itemId,seconds)"
    },
    "DzAPI_Map_ToggleStore": {
      "documentation": "开启/关闭内置商店",
      "original": "function DzAPI_Map_ToggleStore takes player whichPlayer, boolean show returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_ToggleStore",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "boolean",
        "name": "show"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_ToggleStore(whichPlayer,show)"
    },
    "DzAPI_Map_GetServerArchiveEquip": {
      "documentation": "读取服务器装备数据",
      "original": "function DzAPI_Map_GetServerArchiveEquip takes player whichPlayer, string key returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetServerArchiveEquip",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetServerArchiveEquip(whichPlayer,key)"
    },
    "DzAPI_Map_GetServerArchiveDrop": {
      "documentation": "读取服务器掉落数据",
      "original": "function DzAPI_Map_GetServerArchiveDrop takes player whichPlayer, string key returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetServerArchiveDrop",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetServerArchiveDrop(whichPlayer,key)"
    },
    "DzAPI_Map_OrpgTrigger": {
      "documentation": "触发boss击杀",
      "original": "function DzAPI_Map_OrpgTrigger takes player whichPlayer, string key returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_OrpgTrigger",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_OrpgTrigger(whichPlayer,key)"
    },
    "DzAPI_Map_GetUserID": {
      "documentation": "获取玩家ID",
      "original": "function DzAPI_Map_GetUserID takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetUserID",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetUserID(whichPlayer)"
    },
    "DzAPI_Map_GetPlatformVIP": {
      "documentation": "获取平台vip",
      "original": "function DzAPI_Map_GetPlatformVIP takes player whichPlayer returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetPlatformVIP",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetPlatformVIP(whichPlayer)"
    },
    "DzAPI_Map_SavePublicArchive": {
      "documentation": "保存服务器存档组",
      "original": "function DzAPI_Map_SavePublicArchive takes player whichPlayer, string key, string value returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_SavePublicArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_SavePublicArchive(whichPlayer,key,value)"
    },
    "DzAPI_Map_GetPublicArchive": {
      "documentation": "读取服务器存档组",
      "original": "function DzAPI_Map_GetPublicArchive takes player whichPlayer, string key returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetPublicArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_GetPublicArchive(whichPlayer,key)"
    },
    "DzAPI_Map_UseConsumablesItem": {
      "documentation": "使用消耗类商品",
      "original": "function DzAPI_Map_UseConsumablesItem takes player whichPlayer, string key returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_UseConsumablesItem",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_UseConsumablesItem(whichPlayer,key)"
    },
    "DzAPI_Map_Statistics": {
      "documentation": "杭研DA统计",
      "original": "function DzAPI_Map_Statistics takes player whichPlayer, string category, string label returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_Statistics",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "category"
      }, {
        "type": "string",
        "name": "label"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_Statistics(whichPlayer,category,label)"
    },
    "DzAPI_Map_SystemArchive": {
      "documentation": "系统存档",
      "original": "function DzAPI_Map_SystemArchive takes player whichPlayer, string key returns string",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_SystemArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "string",
      "insertText": "DzAPI_Map_SystemArchive(whichPlayer,key)"
    },
    "DzAPI_Map_GlobalArchive": {
      "documentation": "读取公共存档",
      "original": "function DzAPI_Map_GlobalArchive takes string key returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GlobalArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "string",
        "name": "key"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_GlobalArchive(key)"
    },
    "DzAPI_Map_SaveGlobalArchive": {
      "documentation": "保存公共存档",
      "original": "function DzAPI_Map_SaveGlobalArchive takes player whichPlayer, string key, string value returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_SaveGlobalArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_SaveGlobalArchive(whichPlayer,key,value)"
    },
    "DzAPI_Map_ServerArchive": {
      "documentation": "读取服务器存档（区分大小写）",
      "original": "function DzAPI_Map_ServerArchive takes player whichPlayer, string key returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_ServerArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_ServerArchive(whichPlayer,key)"
    },
    "DzAPI_Map_SaveServerArchive": {
      "documentation": "保存服务器存档（区分大小写）",
      "original": "function DzAPI_Map_SaveServerArchive takes player whichPlayer, string key, string value returns nothing",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_SaveServerArchive",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "string",
        "name": "value"
      }],
      "returnType": "nothing",
      "insertText": "DzAPI_Map_SaveServerArchive(whichPlayer,key,value)"
    },
    "DzAPI_Map_IsRPGQuickMatch": {
      "documentation": "RPG快速匹配",
      "original": "function DzAPI_Map_IsRPGQuickMatch takes nothing returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsRPGQuickMatch",
      "isConstant": false,
      "isNative": false,
      "args": [],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsRPGQuickMatch()"
    },
    "DzAPI_Map_GetMallItemCount": {
      "documentation": "获取商城道具数量",
      "original": "function DzAPI_Map_GetMallItemCount takes player whichPlayer, string key returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_GetMallItemCount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_GetMallItemCount(whichPlayer,key)"
    },
    "DzAPI_Map_ConsumeMallItem": {
      "documentation": "使用商城道具",
      "original": "function DzAPI_Map_ConsumeMallItem takes player whichPlayer, string key, integer count returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_ConsumeMallItem",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "string",
        "name": "key"
      }, {
        "type": "integer",
        "name": "count"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_ConsumeMallItem(whichPlayer,key,count)"
    },
    "DzAPI_Map_EnablePlatformSettings": {
      "documentation": "启用平台功能 option = 1 锁定镜头距离，option = 2 显示血、蓝条",
      "original": "function DzAPI_Map_EnablePlatformSettings takes player whichPlayer, integer option, boolean enable returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_EnablePlatformSettings",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "integer",
        "name": "option"
      }, {
        "type": "boolean",
        "name": "enable"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_EnablePlatformSettings(whichPlayer,option,enable)"
    },
    "DzAPI_Map_IsBuyReforged": {
      "documentation": "是否购买了重制版",
      "original": "function DzAPI_Map_IsBuyReforged takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsBuyReforged",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsBuyReforged(whichPlayer)"
    },
    "DzAPI_Map_PlayedGames": {
      "documentation": "游戏局数",
      "original": "function DzAPI_Map_PlayedGames takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_PlayedGames",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_PlayedGames(whichPlayer)"
    },
    "DzAPI_Map_CommentCount": {
      "documentation": "玩家的评论次数",
      "original": "function DzAPI_Map_CommentCount takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_CommentCount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_CommentCount(whichPlayer)"
    },
    "DzAPI_Map_FriendCount": {
      "documentation": "玩家的好友数量",
      "original": "function DzAPI_Map_FriendCount takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_FriendCount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_FriendCount(whichPlayer)"
    },
    "DzAPI_Map_IsConnoisseur": {
      "documentation": "是否鉴赏家",
      "original": "function DzAPI_Map_IsConnoisseur takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsConnoisseur",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsConnoisseur(whichPlayer)"
    },
    "DzAPI_Map_IsBattleNetAccount": {
      "documentation": "是否战网账号",
      "original": "function DzAPI_Map_IsBattleNetAccount takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsBattleNetAccount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsBattleNetAccount(whichPlayer)"
    },
    "DzAPI_Map_IsAuthor": {
      "documentation": "是否本图作者",
      "original": "function DzAPI_Map_IsAuthor takes player whichPlayer returns boolean",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_IsAuthor",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }],
      "returnType": "boolean",
      "insertText": "DzAPI_Map_IsAuthor(whichPlayer)"
    },
    "DzAPI_Map_CommentTotalCount": {
      "documentation": "自定义排行榜",
      "original": "function DzAPI_Map_CommentTotalCount takes player whichPlayer, integer id returns integer",
      "filename": "BZapi.txt",
      "name": "DzAPI_Map_CommentTotalCount",
      "isConstant": false,
      "isNative": false,
      "args": [{
        "type": "player",
        "name": "whichPlayer"
      }, {
        "type": "integer",
        "name": "id"
      }],
      "returnType": "integer",
      "insertText": "DzAPI_Map_CommentTotalCount(whichPlayer,id)"
    }
  }